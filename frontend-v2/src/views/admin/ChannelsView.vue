<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
    <!-- 页面标题 -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-black text-white">渠道管理</h1>
          <p class="mt-2 text-sm font-medium text-slate-400">管理模型渠道和定价规则</p>
        </div>
        <button
          @click="openCreateDialog"
          class="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-brand-500/20 transition hover:from-brand-600 hover:to-brand-700 hover:shadow-brand-500/30"
        >
          <span class="relative z-10 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>
            创建渠道
          </span>
        </button>
      </div>
    </div>

    <!-- 统计概览 -->
    <div class="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div class="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-brand-500/50 hover:bg-brand-500/[0.07]">
        <div class="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-brand-500/10 blur-2xl transition group-hover:bg-brand-500/20"></div>
        <div class="relative">
          <p class="text-xs font-bold uppercase tracking-widest text-slate-500">总渠道</p>
          <p class="mt-2 text-3xl font-black text-white">{{ stats.total }}</p>
        </div>
      </div>
      <div class="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-emerald-500/50 hover:bg-emerald-500/[0.07]">
        <div class="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-emerald-500/10 blur-2xl transition group-hover:bg-emerald-500/20"></div>
        <div class="relative">
          <p class="text-xs font-bold uppercase tracking-widest text-slate-500">已启用</p>
          <p class="mt-2 text-3xl font-black text-emerald-400">{{ stats.active }}</p>
        </div>
      </div>
      <div class="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-amber-500/50 hover:bg-amber-500/[0.07]">
        <div class="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-amber-500/10 blur-2xl transition group-hover:bg-amber-500/20"></div>
        <div class="relative">
          <p class="text-xs font-bold uppercase tracking-widest text-slate-500">已停用</p>
          <p class="mt-2 text-3xl font-black text-amber-400">{{ stats.disabled }}</p>
        </div>
      </div>
      <div class="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-violet-500/50 hover:bg-violet-500/[0.07]">
        <div class="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-violet-500/10 blur-2xl transition group-hover:bg-violet-500/20"></div>
        <div class="relative">
          <p class="text-xs font-bold uppercase tracking-widest text-slate-500">定价规则</p>
          <p class="mt-2 text-3xl font-black text-violet-400">{{ stats.totalPricing }}</p>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <section class="mb-6 rounded-[28px] border border-white/10 bg-white/[0.035] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
      <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_170px]">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索渠道名称..."
              class="h-12 w-full rounded-2xl border border-white/10 bg-neutral-950/80 px-4 pl-11 text-sm font-bold text-white outline-none transition placeholder:text-slate-500 focus:border-brand-500 focus:bg-neutral-950"
              @input="handleSearch"
            />
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500">
              <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
            </svg>
          </div>
          <select
            v-model="filters.status"
            class="h-12 rounded-2xl border border-white/10 bg-neutral-950/80 px-4 text-sm font-bold text-white outline-none transition focus:border-brand-500"
            @change="applyFilters"
          >
            <option value="">全部状态</option>
            <option value="active">启用</option>
            <option value="disabled">停用</option>
          </select>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            @click="loadChannels"
            :disabled="loading"
            class="flex h-12 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-sm font-black text-slate-300 transition hover:border-brand-500/70 hover:bg-brand-500/10 hover:text-brand-300 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" :class="loading ? 'animate-spin' : ''" class="h-4 w-4"><path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389 5.5 5.5 0 019.2-2.466l.31.31h-2.433a.75.75 0 100 1.5h4.242a.75.75 0 00.53-.219z" clip-rule="evenodd" /></svg>
            刷新
          </button>
        </div>
      </div>
    </section>

    <!-- 渠道卡片网格 -->
    <div v-if="loading && channels.length === 0" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-brand-500"></div>
        <p class="text-sm text-slate-400">加载中...</p>
      </div>
    </div>

    <div v-else-if="channels.length > 0" class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="channel in channels"
        :key="channel.id"
        class="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-brand-500/50 hover:bg-brand-500/[0.07]"
      >
        <!-- 左侧彩色条 -->
        <div class="absolute left-0 top-0 h-full w-1 transition group-hover:bg-brand-500" :class="channel.status === 'active' ? 'bg-emerald-500' : 'bg-slate-600'"></div>

        <div class="relative p-5 pl-6">
          <!-- 头部：名称 + 状态 -->
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <h3 class="truncate text-lg font-black text-white">{{ channel.name }}</h3>
              <p class="mt-1 truncate text-sm text-slate-400">{{ channel.description || '无描述' }}</p>
            </div>
            <button
              @click="toggleChannelStatus(channel)"
              class="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition"
              :class="channel.status === 'active' ? 'bg-emerald-500' : 'bg-slate-600'"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition"
                :class="channel.status === 'active' ? 'translate-x-6' : 'translate-x-1'"
              ></span>
            </button>
          </div>

          <!-- 平台标识 -->
          <div class="mt-4 flex flex-wrap gap-1.5">
            <span
              v-for="platform in getChannelPlatforms(channel)"
              :key="platform"
              class="inline-flex items-center rounded-lg px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider"
              :class="platformBadgeClass(platform)"
            >
              {{ platformLabel(platform) }}
            </span>
          </div>

          <!-- 统计行 -->
          <div class="mt-4 flex items-center gap-4">
            <div class="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4 text-slate-500">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 01-2.07-.655zM16.44 15.98a4.98 4.98 0 002.07-.654.78.78 0 00.357-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 011.907 3.96 2.32 2.32 0 01-.026.654zM18 8a2 2 0 11-4 0 2 2 0 014 0zM5.304 16.19a.844.844 0 01-.277-.71 5 5 0 019.947 0 .843.843 0 01-.277.71A6.975 6.975 0 0110 18a6.974 6.974 0 01-4.696-1.81z" />
              </svg>
              <span class="text-xs font-bold text-slate-300">{{ (channel.group_ids || []).length }} 分组</span>
            </div>
            <div class="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4 text-slate-500">
                <path fill-rule="evenodd" d="M2.5 4A1.5 1.5 0 001 5.5V6h18v-.5A1.5 1.5 0 0017.5 4h-15zM19 8.5H1v6A1.5 1.5 0 002.5 16h15a1.5 1.5 0 001.5-1.5v-6zM3 13.25a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zm4.75-.75a.75.75 0 000 1.5h3.5a.75.75 0 000-1.5h-3.5z" clip-rule="evenodd" />
              </svg>
              <span class="text-xs font-bold text-slate-300">{{ (channel.model_pricing || []).length }} 定价</span>
            </div>
          </div>

          <!-- 底部：时间 + 操作 -->
          <div class="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
            <span class="text-xs text-slate-500">{{ formatDateTime(channel.created_at) }}</span>
            <div class="flex items-center gap-1">
              <button
                @click="testChannel(channel)"
                class="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                title="测试连接"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4"><path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
              </button>
              <button
                @click="openEditDialog(channel)"
                class="rounded-lg p-2 text-slate-400 transition hover:bg-blue-500/10 hover:text-blue-400"
                title="编辑"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4"><path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" /><path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" /></svg>
              </button>
              <button
                @click="handleDelete(channel)"
                class="rounded-lg p-2 text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
                title="删除"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4"><path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" /></svg>
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>

    <!-- 空状态 -->
    <div v-else class="flex flex-col items-center justify-center py-20">
      <div class="mb-4 flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/10 bg-white/[0.04]">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-10 w-10 text-slate-500">
          <path fill-rule="evenodd" d="M1 11.27c0-.246.033-.492.099-.73l1.523-5.521A2.75 2.75 0 015.273 3h9.454a2.75 2.75 0 012.651 2.019l1.523 5.52c.066.239.099.485.099.732V15a2 2 0 01-2 2H3a2 2 0 01-2-2v-3.73zm1.5 0V15a.5.5 0 00.5.5h14a.5.5 0 00.5-.5v-3.73c0-.41-.263-.788-.607-.902l-5.556-1.833a.75.75 0 00-.624.048l-1.92 1.056a.75.75 0 01-.586 0l-1.92-1.056a.75.75 0 00-.624-.048L2.107 10.368A1.25 1.25 0 001.5 11.27z" clip-rule="evenodd" />
        </svg>
      </div>
      <h3 class="mb-2 text-lg font-bold text-white">暂无渠道</h3>
      <p class="mb-6 text-sm text-slate-400">创建第一个渠道来管理模型定价</p>
      <button
        @click="openCreateDialog"
        class="rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 text-sm font-black text-white transition hover:from-brand-600 hover:to-brand-700"
      >
        创建渠道
      </button>
    </div>

    <!-- 分页 -->
    <div v-if="pagination.total > 0" class="mt-8 flex items-center justify-between">
      <div class="text-sm font-medium text-slate-500">
        共 {{ pagination.total }} 条记录，第 {{ pagination.page }} / {{ totalPages }} 页
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="goToPage(pagination.page - 1)"
          :disabled="pagination.page === 1"
          class="flex h-10 items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-bold text-slate-300 transition hover:border-brand-500/70 hover:text-brand-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4"><path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" /></svg>
          上一页
        </button>
        <button
          @click="goToPage(pagination.page + 1)"
          :disabled="pagination.page >= totalPages"
          class="flex h-10 items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-bold text-slate-300 transition hover:border-brand-500/70 hover:text-brand-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          下一页
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4"><path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" /></svg>
        </button>
      </div>
    </div>

    <!-- Channel Form Drawer -->
    <ChannelFormModal
      :show="showDialog"
      :channel="editingChannel"
      :all-groups="allGroups"
      :all-channels="allChannelsForConflict"
      :web-search-global-enabled="webSearchGlobalEnabled"
      @close="closeDialog"
      @success="onFormSuccess"
    />

    <!-- Delete Confirmation -->
    <ConfirmDialog
      :show="showDeleteDialog"
      title="确认删除"
      :message="deleteConfirmMessage"
      @confirm="confirmDelete"
      @cancel="showDeleteDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { adminAPI } from '@/api/admin'
import type { Channel, AdminGroup } from '@/types'
import { formatDateTime, extractErrorMessage } from '@/utils/format'
import { showSuccess, showError, confirm } from '@/utils/toast'
import ChannelFormModal from '@/components/admin/channel/ChannelFormModal.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

type GroupPlatform = 'anthropic' | 'openai' | 'gemini' | 'antigravity'

// ── State ───────────────────────────────────────────────
const channels = ref<Channel[]>([])
const loading = ref(false)
const searchQuery = ref('')
const filters = reactive({ status: '' })
const pagination = reactive({
  page: 1,
  page_size: 12,
  total: 0,
})
const sortState = reactive({
  sort_by: 'created_at',
  sort_order: 'desc' as 'asc' | 'desc',
})

const showDialog = ref(false)
const editingChannel = ref<Channel | null>(null)
const showDeleteDialog = ref(false)
const deletingChannel = ref<Channel | null>(null)

const allGroups = ref<AdminGroup[]>([])
const allChannelsForConflict = ref<Channel[]>([])
const webSearchGlobalEnabled = ref(false)

let abortController: AbortController | null = null
let searchTimeout: ReturnType<typeof setTimeout>

// ── Computed ────────────────────────────────────────────
const totalPages = computed(() => Math.ceil(pagination.total / pagination.page_size))

const stats = computed(() => {
  const total = pagination.total
  const active = channels.value.filter(c => c.status === 'active').length
  const disabled = channels.value.filter(c => c.status === 'disabled').length
  const totalPricing = channels.value.reduce((sum, c) => sum + (c.model_pricing || []).length, 0)
  return { total, active, disabled, totalPricing }
})

const deleteConfirmMessage = computed(() => {
  const name = deletingChannel.value?.name || ''
  return `确定要删除渠道 "${name}" 吗？此操作无法撤销。`
})

// ── Platform helpers ────────────────────────────────────
function getChannelPlatforms(channel: Channel): GroupPlatform[] {
  const platforms = new Set<GroupPlatform>()
  const groupPlatformMap = new Map<number, GroupPlatform>()
  for (const g of allGroups.value) {
    groupPlatformMap.set(g.id, g.platform)
  }
  for (const gid of channel.group_ids || []) {
    const p = groupPlatformMap.get(gid)
    if (p) platforms.add(p)
  }
  for (const p of Object.keys(channel.model_mapping || {})) {
    if (['anthropic', 'openai', 'gemini', 'antigravity'].includes(p)) {
      platforms.add(p as GroupPlatform)
    }
  }
  for (const pricing of channel.model_pricing || []) {
    if (pricing.platform) platforms.add(pricing.platform as GroupPlatform)
  }
  return Array.from(platforms)
}

function platformLabel(p: string) {
  switch (p) {
    case 'anthropic': return 'Anthropic'
    case 'openai': return 'OpenAI'
    case 'gemini': return 'Gemini'
    case 'antigravity': return 'Antigravity'
    default: return p
  }
}

function platformBadgeClass(p: string) {
  switch (p) {
    case 'anthropic': return 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
    case 'openai': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
    case 'gemini': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
    case 'antigravity': return 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
    default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
  }
}

// ── Data loading ────────────────────────────────────────
async function loadChannels() {
  if (abortController) abortController.abort()
  const ctrl = new AbortController()
  abortController = ctrl
  loading.value = true

  try {
    const response = await adminAPI.channels.list(pagination.page, pagination.page_size, {
      status: filters.status || undefined,
      search: searchQuery.value || undefined,
      sort_by: sortState.sort_by,
      sort_order: sortState.sort_order,
    }, { signal: ctrl.signal })

    if (ctrl.signal.aborted || abortController !== ctrl) return
    channels.value = response.items || []
    pagination.total = response.total
  } catch (error: unknown) {
    const e = error as { name?: string; code?: string }
    if (e?.name === 'AbortError' || e?.code === 'ERR_CANCELED') return
    showError(extractErrorMessage(error, '加载渠道列表失败'))
  } finally {
    if (abortController === ctrl) {
      loading.value = false
      abortController = null
    }
  }
}

async function loadGroups() {
  try {
    allGroups.value = await adminAPI.groups.getAll()
  } catch (error) {
    console.error('Error loading groups:', error)
  }
}

async function loadAllChannelsForConflict() {
  try {
    const response = await adminAPI.channels.list(1, 1000)
    allChannelsForConflict.value = response.items || []
  } catch (error) {
    allChannelsForConflict.value = channels.value
  }
}

async function loadWebSearchGlobalState() {
  try {
    const cfg = await adminAPI.settings.getWebSearchEmulationConfig()
    webSearchGlobalEnabled.value = cfg?.enabled === true && (cfg?.providers?.length ?? 0) > 0
  } catch {
    webSearchGlobalEnabled.value = false
  }
}

// ── Search / Filter / Pagination ────────────────────────
function handleSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.page = 1
    loadChannels()
  }, 300)
}

function applyFilters() {
  pagination.page = 1
  loadChannels()
}

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  pagination.page = page
  loadChannels()
}

// ── Dialog ──────────────────────────────────────────────
async function openCreateDialog() {
  editingChannel.value = null
  await Promise.all([loadGroups(), loadAllChannelsForConflict()])
  showDialog.value = true
}

async function openEditDialog(channel: Channel) {
  editingChannel.value = channel
  await Promise.all([loadGroups(), loadAllChannelsForConflict()])
  showDialog.value = true
}

function closeDialog() {
  showDialog.value = false
  editingChannel.value = null
}

function onFormSuccess() {
  loadChannels()
}

// ── Toggle status ───────────────────────────────────────
async function toggleChannelStatus(channel: Channel) {
  const newStatus = channel.status === 'active' ? 'disabled' : 'active'
  try {
    await adminAPI.channels.update(channel.id, { status: newStatus })
    if (filters.status && filters.status !== newStatus) {
      await loadChannels()
    } else {
      channel.status = newStatus
    }
    showSuccess('状态已更新')
  } catch (error) {
    showError(extractErrorMessage(error, '更新状态失败'))
  }
}

// ── Test ────────────────────────────────────────────────
function testChannel(channel: Channel) {
  confirm(`测试渠道: ${channel.name}\n\n此功能暂未实现`)
}

// ── Delete ──────────────────────────────────────────────
function handleDelete(channel: Channel) {
  deletingChannel.value = channel
  showDeleteDialog.value = true
}

async function confirmDelete() {
  if (!deletingChannel.value) return
  try {
    await adminAPI.channels.delete(deletingChannel.value.id)
    showSuccess('渠道已删除')
    showDeleteDialog.value = false
    deletingChannel.value = null
    loadChannels()
  } catch (error) {
    showError(extractErrorMessage(error, '删除渠道失败'))
  }
}

// ── Lifecycle ───────────────────────────────────────────
onMounted(() => {
  loadChannels()
  loadGroups()
  loadWebSearchGlobalState()
})

onUnmounted(() => {
  clearTimeout(searchTimeout)
  abortController?.abort()
})
</script>
