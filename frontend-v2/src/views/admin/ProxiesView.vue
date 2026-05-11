<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { adminAPI } from '@/api/admin'
import { confirm, showSuccess, showError } from '@/utils/toast'
import type { Proxy } from '@/types'
import ProxyFilterBar from '@/components/admin/proxy/ProxyFilterBar.vue'
import ProxyCard from '@/components/admin/proxy/ProxyCard.vue'
import ProxyFormModal from '@/components/admin/proxy/ProxyFormModal.vue'
import ProxyTestModal from '@/components/admin/proxy/ProxyTestModal.vue'
import ProxyQualityModal from '@/components/admin/proxy/ProxyQualityModal.vue'
import ProxyAccountsModal from '@/components/admin/proxy/ProxyAccountsModal.vue'

const proxies = ref<Proxy[]>([])
const loading = ref(false)
const saving = ref(false)
let abortController: AbortController | null = null
let searchTimer: ReturnType<typeof setTimeout> | null = null

const searchQuery = ref('')
const protocolFilter = ref('')
const statusFilter = ref('')
const viewMode = ref<'grid' | 'table'>((localStorage.getItem('proxies-view-mode') as 'grid' | 'table') || 'grid')
const selectedIds = ref<Set<number>>(new Set())

const pagination = reactive({ page: 1, page_size: 20, total: 0, pages: 0 })

const showFormModal = ref(false)
const showTestModal = ref(false)
const showQualityModal = ref(false)
const showAccountsModal = ref(false)
const editingProxy = ref<Proxy | null>(null)
const operatingProxy = ref<Proxy | null>(null)
const testResult = ref<Record<string, unknown> | null>(null)
const testLoading = ref(false)
const testError = ref('')
const qualityResult = ref<Record<string, unknown> | null>(null)
const qualityLoading = ref(false)
const qualityError = ref('')

const stats = computed(() => {
  const total = proxies.value.length
  const active = proxies.value.filter(p => p.status === 'active').length
  const inactive = proxies.value.filter(p => p.status === 'inactive').length
  const withLatency = proxies.value.filter(p => p.latency_ms)
  const avgLatency = withLatency.length ? Math.round(withLatency.reduce((s, p) => s + (p.latency_ms || 0), 0) / withLatency.length) : 0
  return { total, active, inactive, avgLatency }
})

const rangeStart = computed(() => (pagination.page - 1) * pagination.page_size + 1)
const rangeEnd = computed(() => Math.min(pagination.page * pagination.page_size, pagination.total))

async function loadProxies() {
  if (abortController) abortController.abort()
  const controller = new AbortController()
  abortController = controller
  loading.value = true
  try {
    const filters: Record<string, unknown> = {}
    if (searchQuery.value) filters.search = searchQuery.value
    if (protocolFilter.value) filters.protocol = protocolFilter.value
    if (statusFilter.value) filters.status = statusFilter.value
    const resp = await adminAPI.proxies.list(pagination.page, pagination.page_size, filters, { signal: controller.signal })
    if (controller.signal.aborted) return
    proxies.value = resp.items
    pagination.total = resp.total
    pagination.pages = resp.pages
  } catch (err: any) {
    if (err?.name === 'AbortError' || err?.code === 'ERR_CANCELED') return
    showError('加载代理失败')
  } finally {
    if (abortController === controller) { loading.value = false; abortController = null }
  }
}

function handleSearch() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { pagination.page = 1; loadProxies() }, 300)
}
function handleFilterChange() { pagination.page = 1; loadProxies() }
function setViewMode(m: 'grid' | 'table') { viewMode.value = m; localStorage.setItem('proxies-view-mode', m) }

function toggleSelect(id: number) {
  const s = new Set(selectedIds.value); s.has(id) ? s.delete(id) : s.add(id); selectedIds.value = s
}
function selectAll() {
  selectedIds.value = selectedIds.value.size === proxies.value.length ? new Set() : new Set(proxies.value.map(p => p.id))
}

function goPage(p: number) { if (p < 1 || p > pagination.pages) return; pagination.page = p; loadProxies() }
function onPageSizeChange(s: number) { pagination.page_size = s; pagination.page = 1; loadProxies() }

function openCreate() { editingProxy.value = null; showFormModal.value = true }
function openEdit(p: Proxy) { editingProxy.value = p; showFormModal.value = true }

async function handleSubmit(data: Record<string, unknown>, isEdit: boolean) {
  saving.value = true
  try {
    if (isEdit && editingProxy.value) { await adminAPI.proxies.update(editingProxy.value.id, data); showSuccess('代理更新成功') }
    else { await adminAPI.proxies.create(data); showSuccess('代理创建成功') }
    showFormModal.value = false; loadProxies()
  } catch (err: any) { showError(err?.response?.data?.message || '保存失败') }
  finally { saving.value = false }
}

async function handleBatchCreate(items: Record<string, unknown>[]) {
  saving.value = true
  try {
    const r = await adminAPI.proxies.batchCreate(items)
    showSuccess(`批量创建：${r.created} 成功` + ((r as any).skipped ? `, ${(r as any).skipped} 跳过` : ''))
    showFormModal.value = false; loadProxies()
  } catch (err: any) { showError(err?.response?.data?.message || '批量创建失败') }
  finally { saving.value = false }
}

async function handleDelete(p: Proxy) {
  if ((p.account_count || 0) > 0) { showError('该代理有关联账号，无法删除'); return }
  const ok = await confirm(`确定要删除代理「${p.name}」吗？`)
  if (!ok) return
  try { await adminAPI.proxies.delete(p.id); showSuccess('代理已删除'); loadProxies() }
  catch (err: any) { showError(err?.response?.data?.message || '删除失败') }
}

async function handleToggleStatus(p: Proxy) {
  const ns = p.status === 'active' ? 'inactive' : 'active'
  try { await adminAPI.proxies.update(p.id, { status: ns }); showSuccess(`已${ns === 'active' ? '启用' : '停用'}`); loadProxies() }
  catch (err: any) { showError(err?.response?.data?.message || '操作失败') }
}

async function handleTest(p: Proxy) {
  operatingProxy.value = p; showTestModal.value = true; testResult.value = null; testError.value = ''; testLoading.value = true
  try { const d = await adminAPI.proxies.test(p.id); testResult.value = (d as any).data || d }
  catch (err: any) { testError.value = err?.message || '测试失败' }
  finally { testLoading.value = false }
}

async function handleQuality(p: Proxy) {
  operatingProxy.value = p; showQualityModal.value = true; qualityResult.value = null; qualityError.value = ''; qualityLoading.value = true
  try { const d = await adminAPI.proxies.checkQuality(p.id); qualityResult.value = (d as any).data || d }
  catch (err: any) { qualityError.value = err?.message || '检查失败' }
  finally { qualityLoading.value = false }
}

async function handleBatchTest() {
  const ids = selectedIds.value.size > 0 ? [...selectedIds.value] : proxies.value.map(p => p.id)
  if (!ids.length) return
  showSuccess(`正在测试 ${ids.length} 个代理...`)
  const results: string[] = []
  for (let i = 0; i < ids.length; i += 5) {
    const batch = ids.slice(i, i + 5)
    const settled = await Promise.allSettled(batch.map(id => adminAPI.proxies.test(id)))
    for (let j = 0; j < batch.length; j++) {
      const p = proxies.value.find(x => x.id === batch[j])
      const name = p?.name || `#${batch[j]}`
      if (settled[j].status === 'fulfilled') {
        const raw = settled[j] as PromiseFulfilledResult<any>
        const d = raw.value?.data || raw.value
        results.push(`${name}: ${d?.latency_ms ? `${d.latency_ms}ms` : 'OK'}`)
        if (p) { p.latency_ms = d?.latency_ms; p.ip_address = d?.ip_address; p.country = d?.country; p.city = d?.city }
      } else { results.push(`${name}: 失败`) }
    }
  }
  showSuccess(`批量测试完成：${results.join(', ')}`)
}

async function handleBatchQuality() {
  const ids = selectedIds.value.size > 0 ? [...selectedIds.value] : proxies.value.map(p => p.id)
  if (!ids.length) return
  const r = { healthy: 0, warn: 0, challenge: 0, failed: 0 }
  for (let i = 0; i < ids.length; i += 3) {
    const settled = await Promise.allSettled(ids.slice(i, i + 3).map(id => adminAPI.proxies.checkQuality(id)))
    for (const s of settled) {
      if (s.status === 'fulfilled') {
        const d = ((s.value as any)?.data || s.value) as any
        const st = (d?.quality_status || d?.status || '').toString()
        if (st === 'healthy') r.healthy++; else if (st === 'warn') r.warn++; else if (st === 'challenge') r.challenge++; else r.failed++
      } else r.failed++
    }
  }
  showSuccess(`质量检查完成：${r.healthy} 健康, ${r.warn} 警告, ${r.challenge} 挑战, ${r.failed} 失败`)
}

async function handleBatchDelete() {
  const ids = [...selectedIds.value]
  if (!ids.length) return
  const ok = await confirm(`确定要删除 ${ids.length} 个代理吗？`)
  if (!ok) return
  try {
    const r = await adminAPI.proxies.batchDelete(ids)
    showSuccess(`删除完成：${r.deleted_ids.length} 个成功` + (r.skipped.length ? `, ${r.skipped.length} 个跳过` : ''))
    selectedIds.value = new Set(); loadProxies()
  } catch (err: any) { showError(err?.response?.data?.message || '批量删除失败') }
}

async function handleImport() {
  const input = document.createElement('input'); input.type = 'file'; input.accept = '.json'
  input.onchange = async () => {
    const file = input.files?.[0]; if (!file) return
    try {
      const text = await file.text(); const payload = JSON.parse(text)
      const r = await adminAPI.proxies.importData({ data: payload })
      const d = (r as any).data || r
      showSuccess(`导入完成：${d.proxy_created || 0} 创建, ${d.proxy_reused || 0} 复用`)
      loadProxies()
    } catch (err: any) { showError(err?.message || '导入失败') }
  }
  input.click()
}

async function handleExport() {
  try {
    const params: Record<string, unknown> = {}
    if (selectedIds.value.size > 0) params.ids = [...selectedIds.value].join(',')
    else { if (searchQuery.value) params.search = searchQuery.value; if (protocolFilter.value) params.protocol = protocolFilter.value; if (statusFilter.value) params.status = statusFilter.value }
    const d = await adminAPI.proxies.exportData(params)
    const payload = (d as any).data || d
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `proxies-${new Date().toISOString().slice(0, 10)}.json`; a.click()
    URL.revokeObjectURL(url); showSuccess('导出完成')
  } catch (err: any) { showError('导出失败') }
}

function handleViewAccounts(p: Proxy) { operatingProxy.value = p; showAccountsModal.value = true }

onMounted(() => loadProxies())
onUnmounted(() => { if (abortController) abortController.abort(); if (searchTimer) clearTimeout(searchTimer) })
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div><h1 class="text-3xl font-black text-white">代理管理</h1><p class="mt-2 text-sm font-medium text-slate-400">管理网络代理，测试连通性和质量</p></div>
        <button :disabled="loading" class="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-slate-400 transition hover:border-violet-500 hover:text-violet-300" @click="loadProxies">{{ loading ? '刷新中...' : '刷新' }}</button>
      </div>
    </div>

    <div class="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div class="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-violet-500/50"><div class="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-violet-500/10 blur-2xl transition group-hover:bg-violet-500/20"></div><div class="relative"><p class="text-xs font-bold uppercase tracking-widest text-slate-500">总代理</p><p class="mt-2 text-3xl font-black text-white">{{ stats.total }}</p></div></div>
      <div class="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-emerald-500/50"><div class="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-emerald-500/10 blur-2xl transition group-hover:bg-emerald-500/20"></div><div class="relative"><p class="text-xs font-bold uppercase tracking-widest text-slate-500">活跃</p><p class="mt-2 text-3xl font-black text-emerald-400">{{ stats.active }}</p></div></div>
      <div class="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-slate-500/50"><div class="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-slate-500/10 blur-2xl"></div><div class="relative"><p class="text-xs font-bold uppercase tracking-widest text-slate-500">未激活</p><p class="mt-2 text-3xl font-black text-slate-400">{{ stats.inactive }}</p></div></div>
      <div class="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-blue-500/50"><div class="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-blue-500/10 blur-2xl transition group-hover:bg-blue-500/20"></div><div class="relative"><p class="text-xs font-bold uppercase tracking-widest text-slate-500">均延迟</p><p class="mt-2 text-3xl font-black text-blue-400">{{ stats.avgLatency }}ms</p></div></div>
    </div>

    <div class="mb-6">
      <ProxyFilterBar
        :search-query="searchQuery" :protocol-filter="protocolFilter" :status-filter="statusFilter"
        :view-mode="viewMode" :selected-count="selectedIds.size" :loading="loading"
        @update:search-query="searchQuery = $event; handleSearch()"
        @update:protocol-filter="protocolFilter = $event; handleFilterChange()"
        @update:status-filter="statusFilter = $event; handleFilterChange()"
        @update:view-mode="setViewMode($event)"
        @search="handleSearch()" @create="openCreate"
        @batch-test="handleBatchTest" @batch-quality="handleBatchQuality"
        @batch-delete="handleBatchDelete" @import="handleImport" @export="handleExport"
      />
    </div>

    <div v-if="loading && proxies.length === 0" class="flex items-center justify-center py-24"><div class="text-center"><div class="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-violet-500"></div><p class="text-sm text-slate-400">加载代理数据...</p></div></div>

    <div v-else-if="proxies.length === 0 && !loading" class="flex flex-col items-center justify-center py-24"><div class="mb-4 text-5xl">🛡️</div><h3 class="mb-1 text-lg font-medium text-slate-300">暂无代理</h3><p class="mb-4 text-sm text-slate-500">点击"创建"添加第一个代理</p><button class="rounded-full bg-gradient-to-r from-violet-500 to-violet-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-600 hover:to-violet-700" @click="openCreate">+ 创建代理</button></div>

    <div v-else-if="viewMode === 'grid'" class="mb-6 flex flex-wrap-reverse justify-end gap-4">
      <ProxyCard v-for="p in proxies" :key="p.id" :proxy="p" class="w-full sm:w-[calc(50%-0.5rem)] xl:w-[calc(33.333%-0.667rem)]"
        @edit="openEdit" @delete="handleDelete" @toggle-status="handleToggleStatus"
        @test="handleTest" @quality="handleQuality" @view-accounts="handleViewAccounts"
      />
    </div>

    <div v-else class="rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden">
      <div class="overflow-x-auto"><table class="w-full">
        <thead class="border-b border-white/[0.06] bg-white/[0.03]"><tr>
          <th class="px-4 py-3 w-10"><input type="checkbox" class="rounded border-white/20 bg-white/10" :checked="selectedIds.size === proxies.length && proxies.length > 0" @change="selectAll" /></th>
          <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">名称</th>
          <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">协议</th>
          <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">地址</th>
          <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">延迟</th>
          <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">账号</th>
          <th class="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-widest text-slate-400">操作</th>
        </tr></thead>
        <tbody class="divide-y divide-white/[0.04]">
          <tr v-for="p in proxies" :key="p.id" class="transition hover:bg-white/[0.04]">
            <td class="px-4 py-3"><input type="checkbox" class="rounded border-white/20 bg-white/10" :checked="selectedIds.has(p.id)" @change="toggleSelect(p.id)" /></td>
            <td class="px-4 py-3"><p class="text-sm font-bold text-white">{{ p.name }}</p></td>
            <td class="px-4 py-3"><span :class="['rounded-full px-2 py-0.5 text-[10px] font-bold uppercase', p.protocol === 'socks5' || p.protocol === 'socks5h' ? 'bg-violet-500/10 text-violet-400' : p.protocol === 'https' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400']">{{ p.protocol }}</span></td>
            <td class="px-4 py-3"><code class="text-xs text-slate-300">{{ p.host }}:{{ p.port }}</code></td>
            <td class="px-4 py-3"><span :class="['text-xs font-bold', (p.latency_ms || 500) < 200 ? 'text-emerald-400' : (p.latency_ms || 0) < 500 ? 'text-amber-400' : 'text-red-400']">{{ p.latency_ms ? `${p.latency_ms}ms` : '-' }}</span></td>
            <td class="px-4 py-3"><span :class="['text-xs font-bold', (p.account_count || 0) > 0 ? 'text-violet-400 cursor-pointer hover:underline' : 'text-slate-500']" @click="(p.account_count || 0) > 0 && handleViewAccounts(p)">{{ p.account_count || 0 }}</span></td>
            <td class="px-4 py-3 text-right"><div class="flex items-center justify-end gap-1">
              <button class="rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-slate-400 hover:bg-white/10 hover:text-white" @click="openEdit(p)">编辑</button>
              <button class="rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-slate-400 hover:bg-white/10 hover:text-white" @click="handleTest(p)">测试</button>
              <button :class="['rounded-lg px-2.5 py-1.5 text-[11px] font-medium', p.status === 'active' ? 'text-red-400/60 hover:bg-red-500/10 hover:text-red-400' : 'text-emerald-400/60 hover:bg-emerald-500/10 hover:text-emerald-400']" @click="handleToggleStatus(p)">{{ p.status === 'active' ? '停用' : '启用' }}</button>
              <button class="rounded-lg px-2 py-1.5 text-[11px] text-red-400/40 hover:bg-red-500/10 hover:text-red-400" @click="handleDelete(p)"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-3.5 w-3.5"><path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" /></svg></button>
            </div></td>
          </tr>
        </tbody>
      </table></div>
    </div>

    <div v-if="pagination.total > 0" class="mt-6 flex flex-col items-center gap-4">
      <div class="flex items-center gap-4">
        <button :disabled="pagination.page <= 1" class="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-violet-500/30 hover:text-violet-400 disabled:opacity-30" @click="goPage(pagination.page - 1)"><svg class="h-4 w-4 transition group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg></button>
        <span class="text-sm font-bold text-white">{{ pagination.page }} <span class="text-slate-600">/</span> {{ pagination.pages }}</span>
        <button :disabled="pagination.page >= pagination.pages" class="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-violet-500/30 hover:text-violet-400 disabled:opacity-30" @click="goPage(pagination.page + 1)"><svg class="h-4 w-4 transition group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg></button>
      </div>
      <div class="flex items-center gap-4 text-xs text-slate-500">
        <span>{{ rangeStart }}-{{ rangeEnd }} / <span class="text-slate-300">{{ pagination.total }}</span> 条</span>
        <span class="text-slate-600">|</span>
        <select :value="pagination.page_size" class="rounded-md border-none bg-transparent text-xs text-slate-500 transition hover:text-slate-300 focus:outline-none" @change="onPageSizeChange(Number(($event.target as HTMLSelectElement).value))"><option :value="10">10条</option><option :value="20">20条</option><option :value="50">50条</option></select>
      </div>
    </div>

    <ProxyFormModal :show="showFormModal" :edit-proxy="editingProxy" :loading="saving" @close="showFormModal = false" @submit="handleSubmit" @batch-create="handleBatchCreate" />
    <ProxyTestModal :show="showTestModal" :proxy-name="operatingProxy?.name || ''" :loading="testLoading" :result="testResult" :error="testError" @close="showTestModal = false" />
    <ProxyQualityModal :show="showQualityModal" :proxy-name="operatingProxy?.name || ''" :loading="qualityLoading" :result="qualityResult" :error="qualityError" @close="showQualityModal = false" />
    <ProxyAccountsModal :show="showAccountsModal" :proxy="operatingProxy" @close="showAccountsModal = false" />
  </div>
</template>
