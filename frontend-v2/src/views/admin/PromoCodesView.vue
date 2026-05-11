<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { adminAPI } from '@/api/admin'
import { confirm, showSuccess, showError } from '@/utils/toast'
import type { PromoCode } from '@/types'
import PromoFilterBar from '@/components/admin/promo/PromoFilterBar.vue'
import PromoCard from '@/components/admin/promo/PromoCard.vue'
import PromoFormModal from '@/components/admin/promo/PromoFormModal.vue'
import PromoUsageModal from '@/components/admin/promo/PromoUsageModal.vue'

const promos = ref<PromoCode[]>([])
const loading = ref(false)
const saving = ref(false)
let abortController: AbortController | null = null
let searchTimer: ReturnType<typeof setTimeout> | null = null

const searchQuery = ref('')
const statusFilter = ref('')
const viewMode = ref<'grid' | 'table'>((localStorage.getItem('promo-view-mode') as 'grid' | 'table') || 'grid')

const pagination = reactive({ page: 1, page_size: 20, total: 0, pages: 0 })

const showFormModal = ref(false)
const showUsageModal = ref(false)
const editingPromo = ref<PromoCode | null>(null)
const usagePromo = ref<PromoCode | null>(null)

const stats = computed(() => {
  const all = promos.value
  const active = all.filter(p => p.status === 'active' && (!p.expires_at || new Date(p.expires_at) >= new Date())).length
  const disabled = all.filter(p => p.status === 'disabled').length
  const expired = all.filter(p => p.status === 'active' && p.expires_at && new Date(p.expires_at) < new Date()).length
  return { total: pagination.total, active, disabled, expired }
})

const rangeStart = computed(() => (pagination.page - 1) * pagination.page_size + 1)
const rangeEnd = computed(() => Math.min(pagination.page * pagination.page_size, pagination.total))

async function loadPromos() {
  if (abortController) abortController.abort()
  const ctrl = new AbortController(); abortController = ctrl
  loading.value = true
  try {
    const filters: Record<string, unknown> = {}
    if (searchQuery.value) filters.search = searchQuery.value
    if (statusFilter.value) filters.status = statusFilter.value
    const resp = await adminAPI.promo.list(pagination.page, pagination.page_size, filters, { signal: ctrl.signal })
    if (ctrl.signal.aborted) return
    promos.value = resp.items; pagination.total = resp.total; pagination.pages = resp.pages
  } catch (e: any) { if (e?.name !== 'AbortError' && e?.code !== 'ERR_CANCELED') showError('加载优惠码失败') }
  finally { if (abortController === ctrl) { loading.value = false; abortController = null } }
}

function handleSearch() { if (searchTimer) clearTimeout(searchTimer); searchTimer = setTimeout(() => { pagination.page = 1; loadPromos() }, 300) }
function handleFilterChange() { pagination.page = 1; loadPromos() }
function setViewMode(m: 'grid' | 'table') { viewMode.value = m; localStorage.setItem('promo-view-mode', m) }
function goPage(p: number) { if (p < 1 || p > pagination.pages) return; pagination.page = p; loadPromos() }
function onPageSizeChange(s: number) { pagination.page_size = s; pagination.page = 1; loadPromos() }

function openCreate() { editingPromo.value = null; showFormModal.value = true }
function openEdit(p: PromoCode) { editingPromo.value = p; showFormModal.value = true }

async function handleSubmit(data: Record<string, unknown>, isEdit: boolean) {
  saving.value = true
  try {
    if (isEdit && editingPromo.value) { await adminAPI.promo.update(editingPromo.value.id, data); showSuccess('优惠码更新成功') }
    else { await adminAPI.promo.create(data); showSuccess('优惠码创建成功') }
    showFormModal.value = false; loadPromos()
  } catch (e: any) { showError(e?.message || '保存失败') }
  finally { saving.value = false }
}

async function handleDelete(p: PromoCode) {
  const ok = await confirm(`确定要删除优惠码「${p.code}」吗？`)
  if (!ok) return
  try { await adminAPI.promo.delete(p.id); showSuccess('已删除'); loadPromos() }
  catch (e: any) { showError(e?.message || '删除失败') }
}

async function handleToggleStatus(p: PromoCode) {
  const ns = p.status === 'active' ? 'disabled' : 'active'
  try { await adminAPI.promo.update(p.id, { status: ns }); showSuccess(`已${ns === 'active' ? '启用' : '禁用'}`); loadPromos() }
  catch (e: any) { showError(e?.message || '操作失败') }
}

function handleUsage(p: PromoCode) { usagePromo.value = p; showUsageModal.value = true }

function copyLink(p: PromoCode) {
  const url = `${window.location.origin}/register?promo=${p.code}`
  navigator.clipboard.writeText(url).then(() => showSuccess('注册链接已复制')).catch(() => showError('复制失败'))
}

function formatDate(d: string) { return new Date(d).toLocaleString('zh-CN') }

onMounted(() => loadPromos())
onUnmounted(() => { if (abortController) abortController.abort(); if (searchTimer) clearTimeout(searchTimer) })
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div><h1 class="text-3xl font-black text-white">优惠码管理</h1><p class="mt-2 text-sm font-medium text-slate-400">管理系统优惠码和注册奖励</p></div>
        <button :disabled="loading" class="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-slate-400 transition hover:border-rose-500 hover:text-rose-300" @click="loadPromos">{{ loading ? '刷新中...' : '刷新' }}</button>
      </div>
    </div>

    <div class="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div class="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-rose-500/50"><div class="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-rose-500/10 blur-2xl transition group-hover:bg-rose-500/20"></div><div class="relative"><p class="text-xs font-bold uppercase tracking-widest text-slate-500">总数</p><p class="mt-2 text-3xl font-black text-white">{{ stats.total }}</p></div></div>
      <div class="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-emerald-500/50"><div class="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-emerald-500/10 blur-2xl transition group-hover:bg-emerald-500/20"></div><div class="relative"><p class="text-xs font-bold uppercase tracking-widest text-slate-500">活跃</p><p class="mt-2 text-3xl font-black text-emerald-400">{{ stats.active }}</p></div></div>
      <div class="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-slate-500/50"><div class="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-slate-500/10 blur-2xl"></div><div class="relative"><p class="text-xs font-bold uppercase tracking-widest text-slate-500">禁用</p><p class="mt-2 text-3xl font-black text-slate-400">{{ stats.disabled }}</p></div></div>
      <div class="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-red-500/50"><div class="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-red-500/10 blur-2xl transition group-hover:bg-red-500/20"></div><div class="relative"><p class="text-xs font-bold uppercase tracking-widest text-slate-500">已过期</p><p class="mt-2 text-3xl font-black text-red-400">{{ stats.expired }}</p></div></div>
    </div>

    <div class="mb-6">
      <PromoFilterBar :search-query="searchQuery" :status-filter="statusFilter" :view-mode="viewMode" :loading="loading"
        @update:search-query="searchQuery = $event; handleSearch()" @update:status-filter="statusFilter = $event; handleFilterChange()"
        @update:view-mode="setViewMode($event)" @search="handleSearch()" @create="openCreate" />
    </div>

    <div v-if="loading && promos.length === 0" class="flex items-center justify-center py-24"><div class="text-center"><div class="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-rose-500"></div><p class="text-sm text-slate-400">加载优惠码...</p></div></div>

    <div v-else-if="promos.length === 0 && !loading" class="flex flex-col items-center justify-center py-24"><div class="mb-4 text-5xl">🎁</div><h3 class="mb-1 text-lg font-medium text-slate-300">暂无优惠码</h3><p class="mb-4 text-sm text-slate-500">点击"创建"添加第一个优惠码</p><button class="rounded-full bg-gradient-to-r from-rose-500 to-rose-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-rose-500/20 transition hover:from-rose-600 hover:to-rose-700" @click="openCreate">+ 创建优惠码</button></div>

    <div v-else-if="viewMode === 'grid'" class="mb-6 flex flex-wrap-reverse justify-end gap-4">
      <PromoCard v-for="p in promos" :key="p.id" :promo="p" class="w-full sm:w-[calc(50%-0.5rem)] xl:w-[calc(33.333%-0.667rem)]"
        @edit="openEdit" @delete="handleDelete" @toggle-status="handleToggleStatus" @usage="handleUsage" @copy-link="copyLink" />
    </div>

    <div v-else class="rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden">
      <div class="overflow-x-auto"><table class="w-full">
        <thead class="border-b border-white/[0.06] bg-white/[0.03]"><tr>
          <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">优惠码</th>
          <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">奖金</th>
          <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">使用</th>
          <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">状态</th>
          <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">过期</th>
          <th class="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-widest text-slate-400">操作</th>
        </tr></thead>
        <tbody class="divide-y divide-white/[0.04]">
          <tr v-for="p in promos" :key="p.id" class="transition hover:bg-white/[0.04]">
            <td class="px-4 py-3"><code class="text-sm font-bold text-white font-mono">{{ p.code }}</code></td>
            <td class="px-4 py-3 text-sm font-bold text-rose-400">${{ p.bonus_amount.toFixed(2) }}</td>
            <td class="px-4 py-3"><div class="flex items-center gap-2"><div class="h-1.5 w-16 rounded-full bg-white/[0.06] overflow-hidden"><div class="h-full rounded-full bg-rose-500" :style="{ width: `${p.max_uses > 0 ? Math.min((p.used_count / p.max_uses) * 100, 100) : 0}%` }" /></div><span class="text-xs text-slate-300">{{ p.used_count }}<span v-if="p.max_uses > 0" class="text-slate-500">/{{ p.max_uses }}</span></span></div></td>
            <td class="px-4 py-3"><span :class="['rounded-full border px-2 py-0.5 text-[10px] font-bold', p.status === 'active' && (!p.expires_at || new Date(p.expires_at) >= new Date()) ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : p.expires_at && new Date(p.expires_at) < new Date() ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-slate-500/10 text-slate-400 border-slate-500/30']">{{ p.status === 'active' && p.expires_at && new Date(p.expires_at) < new Date() ? '已过期' : p.status === 'active' ? '活跃' : '禁用' }}</span></td>
            <td class="px-4 py-3 text-xs text-slate-400">{{ p.expires_at ? formatDate(p.expires_at) : '永久' }}</td>
            <td class="px-4 py-3 text-right"><div class="flex items-center justify-end gap-1">
              <button class="rounded-lg px-2.5 py-1.5 text-[11px] text-slate-400 hover:bg-white/10 hover:text-white" @click="handleUsage(p)">使用</button>
              <button class="rounded-lg px-2.5 py-1.5 text-[11px] text-slate-400 hover:bg-white/10 hover:text-white" @click="copyLink(p)">链接</button>
              <button class="rounded-lg px-2.5 py-1.5 text-[11px] text-slate-400 hover:bg-white/10 hover:text-white" @click="openEdit(p)">编辑</button>
              <button :class="['rounded-lg px-2.5 py-1.5 text-[11px]', p.status === 'active' ? 'text-red-400/60 hover:bg-red-500/10 hover:text-red-400' : 'text-emerald-400/60 hover:bg-emerald-500/10 hover:text-emerald-400']" @click="handleToggleStatus(p)">{{ p.status === 'active' ? '禁用' : '启用' }}</button>
              <button class="rounded-lg px-2 py-1.5 text-[11px] text-red-400/40 hover:bg-red-500/10 hover:text-red-400" @click="handleDelete(p)"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-3.5 w-3.5"><path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" /></svg></button>
            </div></td>
          </tr>
        </tbody>
      </table></div>
    </div>

    <div v-if="pagination.total > 0" class="mt-6 flex flex-col items-center gap-4">
      <div class="flex items-center gap-4">
        <button :disabled="pagination.page <= 1" class="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-rose-500/30 hover:text-rose-400 disabled:opacity-30" @click="goPage(pagination.page - 1)"><svg class="h-4 w-4 transition group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg></button>
        <span class="text-sm font-bold text-white">{{ pagination.page }} <span class="text-slate-600">/</span> {{ pagination.pages }}</span>
        <button :disabled="pagination.page >= pagination.pages" class="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-rose-500/30 hover:text-rose-400 disabled:opacity-30" @click="goPage(pagination.page + 1)"><svg class="h-4 w-4 transition group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg></button>
      </div>
      <div class="flex items-center gap-4 text-xs text-slate-500">
        <span>{{ rangeStart }}-{{ rangeEnd }} / <span class="text-slate-300">{{ pagination.total }}</span> 条</span>
        <span class="text-slate-600">|</span>
        <select :value="pagination.page_size" class="rounded-md border-none bg-transparent text-xs text-slate-500 transition hover:text-slate-300 focus:outline-none" @change="onPageSizeChange(Number(($event.target as HTMLSelectElement).value))"><option :value="10">10条</option><option :value="20">20条</option><option :value="50">50条</option></select>
      </div>
    </div>

    <PromoFormModal :show="showFormModal" :edit-promo="editingPromo" :loading="saving" @close="showFormModal = false" @submit="handleSubmit" />
    <PromoUsageModal :show="showUsageModal" :promo="usagePromo" @close="showUsageModal = false" />
  </div>
</template>
