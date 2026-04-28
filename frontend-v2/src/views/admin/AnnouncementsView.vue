<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { adminAPI } from '@/api/admin'
import { confirm, showSuccess, showError } from '@/utils/toast'
import type { Announcement, AdminGroup } from '@/types'
import AnnouncementFormModal from '@/components/admin/announcement/AnnouncementFormModal.vue'
import AnnouncementReadStatusModal from '@/components/admin/announcement/AnnouncementReadStatusModal.vue'

// ---- Data state ----
const announcements = ref<Announcement[]>([])
const allGroups = ref<AdminGroup[]>([])
const loading = ref(false)
const saving = ref(false)
let abortController: AbortController | null = null

// ---- Filters ----
const statusFilter = ref('')
const notifyModeFilter = ref('')

// ---- Pagination ----
const pagination = reactive({
  page: 1,
  page_size: 20,
  total: 0,
  pages: 0,
})

// ---- Modal state ----
const showFormModal = ref(false)
const showReadStatusModal = ref(false)
const editingAnnouncement = ref<Announcement | null>(null)
const readStatusAnnouncement = ref<Announcement | null>(null)

// ---- Computed stats ----
const stats = computed(() => {
  const total = announcements.value.length
  const active = announcements.value.filter(a => a.status === 'active').length
  const draft = announcements.value.filter(a => a.status === 'draft').length
  const archived = announcements.value.filter(a => a.status === 'archived').length
  return { total, active, draft, archived }
})

const rangeStart = computed(() => (pagination.page - 1) * pagination.page_size + 1)
const rangeEnd = computed(() => Math.min(pagination.page * pagination.page_size, pagination.total))

// ---- Data loading ----
async function loadAnnouncements() {
  if (abortController) abortController.abort()
  const controller = new AbortController()
  abortController = controller

  loading.value = true
  try {
    const filters: Record<string, unknown> = {}
    if (statusFilter.value) filters.status = statusFilter.value
    if (notifyModeFilter.value) filters.notify_mode = notifyModeFilter.value

    const response = await adminAPI.announcements.list(
      pagination.page,
      pagination.page_size,
      filters,
      { signal: controller.signal }
    )
    if (controller.signal.aborted) return
    announcements.value = response.items
    pagination.total = response.total
    pagination.pages = response.pages
  } catch (err: any) {
    if (err?.name === 'AbortError' || err?.code === 'ERR_CANCELED') return
    showError('加载公告失败')
  } finally {
    if (abortController === controller) {
      loading.value = false
      abortController = null
    }
  }
}

async function loadGroups() {
  try {
    allGroups.value = await adminAPI.groups.getAll()
  } catch { /* ignore */ }
}

// ---- Filter handlers ----
function handleFilterChange() {
  pagination.page = 1
  loadAnnouncements()
}

// ---- Pagination ----
function goPage(p: number) {
  if (p < 1 || p > pagination.pages) return
  pagination.page = p
  loadAnnouncements()
}

function onPageSizeChange(size: number) {
  pagination.page_size = size
  pagination.page = 1
  loadAnnouncements()
}

// ---- CRUD ----
function openCreate() {
  editingAnnouncement.value = null
  showFormModal.value = true
}

function openEdit(a: Announcement) {
  editingAnnouncement.value = a
  showFormModal.value = true
}

async function handleSubmit(data: Record<string, unknown>, isEdit: boolean) {
  saving.value = true
  try {
    if (isEdit && editingAnnouncement.value) {
      await adminAPI.announcements.update(editingAnnouncement.value.id, data)
      showSuccess('公告更新成功')
    } else {
      await adminAPI.announcements.create(data)
      showSuccess('公告创建成功')
    }
    showFormModal.value = false
    loadAnnouncements()
  } catch (err: any) {
    showError(err?.response?.data?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

async function handleDelete(id: number, title: string) {
  const ok = await confirm(`确定要删除公告「${title}」吗？此操作不可恢复。`)
  if (!ok) return
  try {
    await adminAPI.announcements.delete(id)
    showSuccess('公告已删除')
    loadAnnouncements()
  } catch (err: any) {
    showError(err?.response?.data?.message || '删除失败')
  }
}

function openReadStatus(a: Announcement) {
  readStatusAnnouncement.value = a
  showReadStatusModal.value = true
}

// ---- Helpers ----
function statusLabel(s: string) {
  const map: Record<string, string> = { draft: '草稿', active: '展示中', archived: '已归档' }
  return map[s] || s
}

function formatDate(d: string) {
  return new Date(d).toLocaleString('zh-CN')
}

function targetingSummary(a: Announcement) {
  const t = a.targeting
  if (!t || !t.any_of || t.any_of.length === 0) return '全部用户'
  return `${t.any_of.length} 组条件`
}

// ---- Init ----
onMounted(() => {
  loadAnnouncements()
  loadGroups()
})

onUnmounted(() => {
  if (abortController) abortController.abort()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
    <!-- Page header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-black text-white">公告管理</h1>
          <p class="mt-2 text-sm font-medium text-slate-400">发布和管理系统公告，配置展示条件和通知方式</p>
        </div>
        <div class="flex items-center gap-3">
          <button
            :disabled="loading"
            class="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-slate-400 transition hover:border-amber-500 hover:text-amber-300"
            @click="loadAnnouncements"
          >
            {{ loading ? '刷新中...' : '刷新' }}
          </button>
          <button
            class="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-amber-500/20 transition hover:from-amber-600 hover:to-amber-700"
            @click="openCreate"
          >
            + 创建公告
          </button>
        </div>
      </div>
    </div>

    <!-- Stats cards -->
    <div class="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div class="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-amber-500/50 hover:bg-amber-500/[0.07]">
        <div class="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-amber-500/10 blur-2xl transition group-hover:bg-amber-500/20"></div>
        <div class="relative">
          <p class="text-xs font-bold uppercase tracking-widest text-slate-500">总公告</p>
          <p class="mt-2 text-3xl font-black text-white">{{ stats.total }}</p>
        </div>
      </div>
      <div class="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-emerald-500/50 hover:bg-emerald-500/[0.07]">
        <div class="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-emerald-500/10 blur-2xl transition group-hover:bg-emerald-500/20"></div>
        <div class="relative">
          <p class="text-xs font-bold uppercase tracking-widest text-slate-500">展示中</p>
          <p class="mt-2 text-3xl font-black text-emerald-400">{{ stats.active }}</p>
        </div>
      </div>
      <div class="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-slate-500/50 hover:bg-slate-500/[0.07]">
        <div class="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-slate-500/10 blur-2xl transition group-hover:bg-slate-500/20"></div>
        <div class="relative">
          <p class="text-xs font-bold uppercase tracking-widest text-slate-500">草稿</p>
          <p class="mt-2 text-3xl font-black text-slate-400">{{ stats.draft }}</p>
        </div>
      </div>
      <div class="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-amber-500/50 hover:bg-amber-500/[0.07]">
        <div class="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-amber-500/10 blur-2xl transition group-hover:bg-amber-500/20"></div>
        <div class="relative">
          <p class="text-xs font-bold uppercase tracking-widest text-slate-500">已归档</p>
          <p class="mt-2 text-3xl font-black text-amber-400">{{ stats.archived }}</p>
        </div>
      </div>
    </div>

    <!-- Filter bar -->
    <div class="mb-6 rounded-[28px] border border-white/10 bg-white/[0.035] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
      <div class="flex flex-wrap items-center gap-3">
        <div class="relative">
          <select
            v-model="statusFilter"
            class="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white backdrop-blur-sm transition focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            @change="handleFilterChange"
          >
            <option value="">全部状态</option>
            <option value="draft">草稿</option>
            <option value="active">展示中</option>
            <option value="archived">已归档</option>
          </select>
        </div>
        <div class="relative">
          <select
            v-model="notifyModeFilter"
            class="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white backdrop-blur-sm transition focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            @change="handleFilterChange"
          >
            <option value="">全部通知方式</option>
            <option value="silent">静默</option>
            <option value="popup">弹窗</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading && announcements.length === 0" class="flex items-center justify-center py-24">
      <div class="text-center">
        <div class="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-amber-500"></div>
        <p class="text-sm text-slate-400">加载公告数据...</p>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="announcements.length === 0 && !loading" class="flex flex-col items-center justify-center py-24">
      <div class="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02]">
        <svg class="h-10 w-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
      </div>
      <h3 class="mb-1 text-lg font-medium text-slate-300">暂无公告</h3>
      <p class="mb-4 text-sm text-slate-500">点击"创建公告"添加第一条系统公告</p>
      <button
        class="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-amber-500/20 transition hover:from-amber-600 hover:to-amber-700"
        @click="openCreate"
      >
        + 创建公告
      </button>
    </div>

    <!-- Card list -->
    <div v-else class="space-y-4">
      <div
        v-for="a in announcements"
        :key="a.id"
        :class="[
          'group rounded-2xl border bg-white/[0.02] p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5',
          a.status === 'active' ? 'border-emerald-500/20 hover:border-emerald-500/40' :
          a.status === 'draft' ? 'border-white/10 hover:border-white/20' :
          'border-amber-500/20 hover:border-amber-500/40'
        ]"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <!-- Header row -->
            <div class="flex items-center gap-2 mb-2 flex-wrap">
              <h3 class="text-base font-bold text-white truncate">{{ a.title }}</h3>
              <span :class="[
                'shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold',
                a.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                a.status === 'draft' ? 'bg-slate-500/10 text-slate-400 border-slate-500/30' :
                'bg-amber-500/10 text-amber-400 border-amber-500/30'
              ]">{{ statusLabel(a.status) }}</span>
              <span :class="[
                'shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold',
                a.notify_mode === 'popup' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
              ]">{{ a.notify_mode === 'popup' ? '弹窗' : '静默' }}</span>
              <span class="shrink-0 rounded-full bg-white/[0.04] border border-white/5 px-2 py-0.5 text-[10px] text-slate-500">{{ targetingSummary(a) }}</span>
            </div>

            <!-- Content preview -->
            <p class="text-sm text-slate-400 mb-3 line-clamp-2">{{ a.content }}</p>

            <!-- Meta row -->
            <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
              <span>创建于 {{ formatDate(a.created_at) }}</span>
              <span v-if="a.starts_at">开始 {{ formatDate(a.starts_at) }}</span>
              <span v-else class="text-slate-600">立即生效</span>
              <span v-if="a.ends_at">结束 {{ formatDate(a.ends_at) }}</span>
              <span v-else class="text-slate-600">永不过期</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-1.5 shrink-0">
            <button
              class="rounded-lg bg-white/[0.05] px-3 py-1.5 text-[11px] font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
              @click="openReadStatus(a)"
            >阅读状态</button>
            <button
              class="rounded-lg bg-white/[0.05] px-3 py-1.5 text-[11px] font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
              @click="openEdit(a)"
            >编辑</button>
            <button
              class="rounded-lg bg-white/[0.05] px-2.5 py-1.5 text-[11px] font-medium text-red-400/50 transition hover:bg-red-500/10 hover:text-red-400"
              @click="handleDelete(a.id, a.title)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-3.5 w-3.5"><path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.total > 0" class="mt-6 flex flex-col items-center gap-4">
      <div class="flex items-center gap-4">
        <button
          :disabled="pagination.page <= 1"
          class="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-amber-500/30 hover:text-amber-400 disabled:opacity-30"
          @click="goPage(pagination.page - 1)"
        >
          <svg class="h-4 w-4 transition group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <span class="text-sm font-bold text-white">{{ pagination.page }} <span class="text-slate-600">/</span> {{ pagination.pages }}</span>
        <button
          :disabled="pagination.page >= pagination.pages"
          class="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-amber-500/30 hover:text-amber-400 disabled:opacity-30"
          @click="goPage(pagination.page + 1)"
        >
          <svg class="h-4 w-4 transition group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
      <div class="flex items-center gap-4 text-xs text-slate-500">
        <span>{{ rangeStart }}-{{ rangeEnd }} / <span class="text-slate-300">{{ pagination.total }}</span> 条</span>
        <span class="text-slate-600">|</span>
        <select
          :value="pagination.page_size"
          class="rounded-md border-none bg-transparent text-xs text-slate-500 transition hover:text-slate-300 focus:outline-none"
          @change="onPageSizeChange(Number(($event.target as HTMLSelectElement).value))"
        >
          <option :value="10">10条</option>
          <option :value="20">20条</option>
          <option :value="50">50条</option>
        </select>
      </div>
    </div>

    <!-- Modals -->
    <AnnouncementFormModal
      :show="showFormModal"
      :edit-announcement="editingAnnouncement"
      :groups="allGroups"
      :loading="saving"
      @close="showFormModal = false"
      @submit="handleSubmit"
    />

    <AnnouncementReadStatusModal
      :show="showReadStatusModal"
      :announcement="readStatusAnnouncement"
      @close="showReadStatusModal = false"
    />
  </div>
</template>
