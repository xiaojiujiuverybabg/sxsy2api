<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { adminAPI } from '@/api/admin'
import { confirm, showSuccess, showError } from '@/utils/toast'
import type { RedeemCode, AdminGroup } from '@/types'
import RedeemFilterBar from '@/components/admin/redeem/RedeemFilterBar.vue'
import RedeemGenerateModal from '@/components/admin/redeem/RedeemGenerateModal.vue'
import RedeemResultModal from '@/components/admin/redeem/RedeemResultModal.vue'

const codes = ref<RedeemCode[]>([])
const allGroups = ref<AdminGroup[]>([])
const loading = ref(false)
const saving = ref(false)
let abortController: AbortController | null = null
let searchTimer: ReturnType<typeof setTimeout> | null = null

const searchQuery = ref('')
const typeFilter = ref('')
const statusFilter = ref('')
const viewMode = ref<'grid' | 'table'>((localStorage.getItem('redeem-view-mode') as 'grid' | 'table') || 'grid')

const pagination = reactive({ page: 1, page_size: 20, total: 0, pages: 0 })

const showGenerateModal = ref(false)
const showResultModal = ref(false)
const generatedCodes = ref<RedeemCode[]>([])
const statsRaw = ref<Record<string, unknown> | null>(null)

const stats = computed(() => {
  const s = statsRaw.value
  if (s && typeof s.total === 'number' && s.total > 0) {
    return { total: s.total, unused: Number(s.unused || 0), used: Number(s.used || 0), expired: Number(s.expired || 0) }
  }
  // 兜底：当前页的局部统计
  const all = codes.value
  return {
    total: pagination.total,
    unused: all.filter(c => c.status === 'unused' || c.status === 'active').length,
    used: all.filter(c => c.status === 'used').length,
    expired: all.filter(c => c.status === 'expired').length,
  }
})

const rangeStart = computed(() => (pagination.page - 1) * pagination.page_size + 1)
const rangeEnd = computed(() => Math.min(pagination.page * pagination.page_size, pagination.total))

async function loadCodes() {
  if (abortController) abortController.abort()
  const controller = new AbortController()
  abortController = controller
  loading.value = true
  try {
    const filters: Record<string, unknown> = {}
    if (searchQuery.value) filters.search = searchQuery.value
    if (typeFilter.value) filters.type = typeFilter.value
    if (statusFilter.value) filters.status = statusFilter.value
    const resp = await adminAPI.redeem.list(pagination.page, pagination.page_size, filters, { signal: controller.signal })
    if (controller.signal.aborted) return
    codes.value = resp.items; pagination.total = resp.total; pagination.pages = resp.pages
  } catch (err: any) {
    if (err?.name === 'AbortError' || err?.code === 'ERR_CANCELED') return
    showError('加载兑换码失败')
  } finally {
    if (abortController === controller) { loading.value = false; abortController = null }
  }
}

async function loadStats() {
  // 并行 4 次 pageSize=1 请求，靠 total 字段拿各状态全局计数
  try {
    const [all, unused, used, expired] = await Promise.all([
      adminAPI.redeem.list(1, 1),
      adminAPI.redeem.list(1, 1, { status: 'unused' }),
      adminAPI.redeem.list(1, 1, { status: 'used' }),
      adminAPI.redeem.list(1, 1, { status: 'expired' }),
    ])
    statsRaw.value = { total: all.total, unused: unused.total, used: used.total, expired: expired.total }
  } catch { /* 非关键 */ }
}

async function loadGroups() {
  try { allGroups.value = await adminAPI.groups.getAll() }
  catch { /* ignore */ }
}

function handleSearch() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { pagination.page = 1; loadCodes() }, 300)
}
function handleFilterChange() { pagination.page = 1; loadCodes() }
function setViewMode(m: 'grid' | 'table') { viewMode.value = m; localStorage.setItem('redeem-view-mode', m) }
function goPage(p: number) { if (p < 1 || p > pagination.pages) return; pagination.page = p; loadCodes() }
function onPageSizeChange(s: number) { pagination.page_size = s; pagination.page = 1; loadCodes() }

function openGenerate() { showGenerateModal.value = true }

async function handleGenerate(data: Record<string, unknown>) {
  saving.value = true
  try {
    const result = await adminAPI.redeem.generate(data)
    const codes = (result as any).data || result
    generatedCodes.value = Array.isArray(codes) ? codes : []
    showGenerateModal.value = false
    showResultModal.value = true
    showSuccess(`成功生成 ${generatedCodes.value.length} 个兑换码`)
    loadCodes(); loadStats()
  } catch (err: any) { showError(err?.response?.data?.message || '生成失败') }
  finally { saving.value = false }
}

async function handleDelete(id: number, code: string) {
  const ok = await confirm(`确定要删除兑换码「${code}」吗？`)
  if (!ok) return
  try { await adminAPI.redeem.delete(id); showSuccess('已删除'); loadCodes(); loadStats() }
  catch (err: any) { showError(err?.response?.data?.message || '删除失败') }
}

async function handleExpire(id: number) {
  const ok = await confirm('确定要强制过期此兑换码吗？')
  if (!ok) return
  try { await adminAPI.redeem.expire(id); showSuccess('已过期'); loadCodes(); loadStats() }
  catch (err: any) { showError(err?.response?.data?.message || '操作失败') }
}

async function handleBatchDeleteUnused() {
  const ok = await confirm('确定要删除所有未使用的兑换码吗？此操作不可恢复。')
  if (!ok) return
  loading.value = true
  try {
    const resp = await adminAPI.redeem.list(1, 1000, { status: 'unused' })
    const ids = resp.items.map(c => c.id)
    if (!ids.length) { showSuccess('没有未使用的兑换码'); return }
    const r = await adminAPI.redeem.batchDelete(ids)
    showSuccess(`已删除 ${r.deleted} 个未使用的兑换码`)
    loadCodes(); loadStats()
  } catch (err: any) { showError(err?.response?.data?.message || '操作失败') }
  finally { loading.value = false }
}

async function handleExport() {
  try {
    const filters: Record<string, unknown> = {}
    if (typeFilter.value) filters.type = typeFilter.value
    if (statusFilter.value) filters.status = statusFilter.value
    if (searchQuery.value) filters.search = searchQuery.value
    const blob = await adminAPI.redeem.exportCodes(filters)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `redeem-codes-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
    URL.revokeObjectURL(url); showSuccess('导出完成')
  } catch (err: any) { showError('导出失败') }
}

function copyCode(code: string) {
  navigator.clipboard.writeText(code); showSuccess('已复制')
}

function statusLabel(s: string) {
  const m: Record<string, string> = { unused: '未使用', used: '已使用', expired: '已过期', active: '活跃' }
  return m[s] || s
}

function typeLabel(t: string) {
  const m: Record<string, string> = { balance: '余额', concurrency: '并发', subscription: '订阅', invitation: '邀请' }
  return m[t] || t
}

function typeBadgeColor(t: string) {
  if (t === 'balance') return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
  if (t === 'concurrency') return 'bg-amber-500/10 text-amber-400 border-amber-500/30'
  if (t === 'subscription') return 'bg-violet-500/10 text-violet-400 border-violet-500/30'
  return 'bg-slate-500/10 text-slate-400 border-slate-500/30'
}

function statusBadgeStyle(s: string) {
  if (s === 'unused') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
  if (s === 'used') return 'bg-slate-500/10 text-slate-400 border-slate-500/30'
  if (s === 'expired') return 'bg-red-500/10 text-red-400 border-red-500/30'
  return 'bg-slate-500/10 text-slate-400 border-slate-500/30'
}

function formatValue(c: RedeemCode) {
  if (c.type === 'balance') return `$${c.value.toFixed(2)}`
  if (c.type === 'concurrency') return `${c.value} 并发`
  if (c.type === 'subscription') return `${c.validity_days || '?'} 天`
  return '-'
}

function formatDate(d: string) { return new Date(d).toLocaleString('zh-CN') }

onMounted(() => { loadCodes(); loadStats(); loadGroups() })
onUnmounted(() => { if (abortController) abortController.abort(); if (searchTimer) clearTimeout(searchTimer) })
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div><h1 class="text-3xl font-black text-white">兑换码管理</h1><p class="mt-2 text-sm font-medium text-slate-400">生成和管理系统兑换码</p></div>
        <button :disabled="loading" class="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-slate-400 transition hover:border-emerald-500 hover:text-emerald-300" @click="loadCodes(); loadStats()">{{ loading ? '刷新中...' : '刷新' }}</button>
      </div>
    </div>

    <!-- Stats -->
    <div class="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div class="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-emerald-500/50"><div class="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-emerald-500/10 blur-2xl transition group-hover:bg-emerald-500/20"></div><div class="relative"><p class="text-xs font-bold uppercase tracking-widest text-slate-500">总数</p><p class="mt-2 text-3xl font-black text-white">{{ stats.total }}</p></div></div>
      <div class="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-emerald-500/50"><div class="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-emerald-500/10 blur-2xl transition group-hover:bg-emerald-500/20"></div><div class="relative"><p class="text-xs font-bold uppercase tracking-widest text-slate-500">未使用</p><p class="mt-2 text-3xl font-black text-emerald-400">{{ stats.unused }}</p></div></div>
      <div class="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-blue-500/50"><div class="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-blue-500/10 blur-2xl transition group-hover:bg-blue-500/20"></div><div class="relative"><p class="text-xs font-bold uppercase tracking-widest text-slate-500">已使用</p><p class="mt-2 text-3xl font-black text-blue-400">{{ stats.used }}</p></div></div>
      <div class="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-red-500/50"><div class="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-red-500/10 blur-2xl transition group-hover:bg-red-500/20"></div><div class="relative"><p class="text-xs font-bold uppercase tracking-widest text-slate-500">已过期</p><p class="mt-2 text-3xl font-black text-red-400">{{ stats.expired }}</p></div></div>
    </div>

    <div class="mb-6">
      <RedeemFilterBar
        :search-query="searchQuery" :type-filter="typeFilter" :status-filter="statusFilter"
        :view-mode="viewMode" :selected-count="0" :loading="loading"
        @update:search-query="searchQuery = $event; handleSearch()"
        @update:type-filter="typeFilter = $event; handleFilterChange()"
        @update:status-filter="statusFilter = $event; handleFilterChange()"
        @update:view-mode="setViewMode($event)"
        @search="handleSearch()" @generate="openGenerate"
        @batch-delete-unused="handleBatchDeleteUnused" @export="handleExport"
      />
    </div>

    <div v-if="loading && codes.length === 0" class="flex items-center justify-center py-24"><div class="text-center"><div class="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-emerald-500"></div><p class="text-sm text-slate-400">加载兑换码...</p></div></div>

    <div v-else-if="codes.length === 0 && !loading" class="flex flex-col items-center justify-center py-24"><div class="mb-4 text-5xl">🎫</div><h3 class="mb-1 text-lg font-medium text-slate-300">暂无兑换码</h3><p class="mb-4 text-sm text-slate-500">点击"生成"创建第一批兑换码</p><button class="rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-600 hover:to-emerald-700" @click="openGenerate">+ 生成兑换码</button></div>

    <!-- wrap-reverse + justify-end: 从下往上填充，末排占满，空位在最上面一排的左侧 -->
    <div v-else-if="viewMode === 'grid'" class="mb-6 flex flex-wrap-reverse justify-end gap-4">
      <div v-for="c in codes" :key="c.id" class="w-full sm:w-[calc(50%-0.5rem)] xl:w-[calc(33.333%-0.667rem)]" :class="['group relative overflow-hidden rounded-2xl border backdrop-blur-xl transition hover:-translate-y-0.5', c.status === 'unused' ? 'border-emerald-500/20 hover:border-emerald-500/40' : c.status === 'expired' ? 'border-red-500/20 hover:border-red-500/40' : 'border-white/10 hover:border-white/20']">
        <div class="relative bg-white/[0.03] p-4">
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-2 min-w-0">
              <span class="text-lg">🎫</span>
              <code class="text-xs font-mono text-emerald-400 truncate flex-1 cursor-pointer hover:underline" @click="copyCode(c.code)">{{ c.code }}</code>
            </div>
            <span :class="['shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold', typeBadgeColor(c.type)]">{{ typeLabel(c.type) }}</span>
          </div>
          <div class="mb-3 grid grid-cols-3 gap-2">
            <div class="rounded-lg bg-white/[0.04] p-2 text-center"><p class="text-[10px] font-bold uppercase tracking-wider text-slate-500">数值</p><p class="mt-0.5 text-xs font-bold text-white">{{ formatValue(c) }}</p></div>
            <div class="rounded-lg bg-white/[0.04] p-2 text-center"><p class="text-[10px] font-bold uppercase tracking-wider text-slate-500">状态</p><span :class="['inline-block mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold', statusBadgeStyle(c.status)]">{{ statusLabel(c.status) }}</span></div>
            <div class="rounded-lg bg-white/[0.04] p-2 text-center"><p class="text-[10px] font-bold uppercase tracking-wider text-slate-500">使用者</p><p class="mt-0.5 text-xs text-slate-400 truncate">{{ c.user?.email || '-' }}</p></div>
          </div>
          <div class="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500 mb-3">
            <span>创建 {{ formatDate(c.created_at) }}</span>
            <span v-if="c.used_at">使用 {{ formatDate(c.used_at) }}</span>
          </div>
          <div class="flex items-center gap-1.5 border-t border-white/[0.06] pt-3">
            <button class="flex-1 rounded-lg bg-white/[0.05] px-2 py-1.5 text-[11px] text-slate-300 transition hover:bg-white/10 hover:text-white" @click="copyCode(c.code)">复制</button>
            <button v-if="c.status === 'unused'" class="flex-1 rounded-lg bg-red-500/10 px-2 py-1.5 text-[11px] text-red-400 transition hover:bg-red-500/20" @click="handleDelete(c.id, c.code)">删除</button>
            <button v-if="c.status === 'unused'" class="flex-1 rounded-lg bg-amber-500/10 px-2 py-1.5 text-[11px] text-amber-400 transition hover:bg-amber-500/20" @click="handleExpire(c.id)">过期</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Table view -->
    <div v-else class="rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden">
      <div class="overflow-x-auto"><table class="w-full">
        <thead class="border-b border-white/[0.06] bg-white/[0.03]"><tr>
          <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">兑换码</th>
          <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">类型</th>
          <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">数值</th>
          <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">状态</th>
          <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">使用者</th>
          <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">使用时间</th>
          <th class="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-widest text-slate-400">操作</th>
        </tr></thead>
        <tbody class="divide-y divide-white/[0.04]">
          <tr v-for="c in codes" :key="c.id" class="transition hover:bg-white/[0.04]">
            <td class="px-4 py-3"><code class="text-xs font-mono text-emerald-400 cursor-pointer hover:underline" @click="copyCode(c.code)">{{ c.code }}</code></td>
            <td class="px-4 py-3"><span :class="['rounded-full border px-2 py-0.5 text-[10px] font-bold', typeBadgeColor(c.type)]">{{ typeLabel(c.type) }}</span></td>
            <td class="px-4 py-3 text-xs text-slate-300">{{ formatValue(c) }}</td>
            <td class="px-4 py-3"><span :class="['rounded-full border px-2 py-0.5 text-[10px] font-bold', statusBadgeStyle(c.status)]">{{ statusLabel(c.status) }}</span></td>
            <td class="px-4 py-3 text-xs text-slate-300">{{ c.user?.email || '-' }}</td>
            <td class="px-4 py-3 text-xs text-slate-400">{{ c.used_at ? formatDate(c.used_at) : '-' }}</td>
            <td class="px-4 py-3 text-right"><div class="flex items-center justify-end gap-1">
              <button class="rounded-lg px-2.5 py-1.5 text-[11px] text-slate-400 hover:bg-white/10 hover:text-white" @click="copyCode(c.code)">复制</button>
              <button v-if="c.status === 'unused'" class="rounded-lg px-2.5 py-1.5 text-[11px] text-amber-400/60 hover:bg-amber-500/10 hover:text-amber-400" @click="handleExpire(c.id)">过期</button>
              <button v-if="c.status === 'unused'" class="rounded-lg px-2 py-1.5 text-[11px] text-red-400/40 hover:bg-red-500/10 hover:text-red-400" @click="handleDelete(c.id, c.code)"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-3.5 w-3.5"><path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" /></svg></button>
            </div></td>
          </tr>
        </tbody>
      </table></div>
    </div>

    <div v-if="pagination.total > 0" class="mt-6 flex flex-col items-center gap-4">
      <div class="flex items-center gap-4">
        <button :disabled="pagination.page <= 1" class="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-emerald-500/30 hover:text-emerald-400 disabled:opacity-30" @click="goPage(pagination.page - 1)"><svg class="h-4 w-4 transition group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg></button>
        <span class="text-sm font-bold text-white">{{ pagination.page }} <span class="text-slate-600">/</span> {{ pagination.pages }}</span>
        <button :disabled="pagination.page >= pagination.pages" class="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-emerald-500/30 hover:text-emerald-400 disabled:opacity-30" @click="goPage(pagination.page + 1)"><svg class="h-4 w-4 transition group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg></button>
      </div>
      <div class="flex items-center gap-4 text-xs text-slate-500">
        <span>{{ rangeStart }}-{{ rangeEnd }} / <span class="text-slate-300">{{ pagination.total }}</span> 条</span>
        <span class="text-slate-600">|</span>
        <select :value="pagination.page_size" class="rounded-md border-none bg-transparent text-xs text-slate-500 transition hover:text-slate-300 focus:outline-none" @change="onPageSizeChange(Number(($event.target as HTMLSelectElement).value))"><option :value="10">10条</option><option :value="20">20条</option><option :value="50">50条</option></select>
      </div>
    </div>

    <RedeemGenerateModal :show="showGenerateModal" :groups="allGroups" :loading="saving" @close="showGenerateModal = false" @generate="handleGenerate" />
    <RedeemResultModal :show="showResultModal" :codes="generatedCodes" @close="showResultModal = false" />
  </div>
</template>
