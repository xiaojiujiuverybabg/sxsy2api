<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import type { Announcement, AnnouncementUserReadStatus } from '@/types'
import { adminAPI } from '@/api/admin'
import { showError } from '@/utils/toast'

const props = defineProps<{
  show: boolean
  announcement: Announcement | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const search = ref('')
const loading = ref(false)
const statuses = ref<AnnouncementUserReadStatus[]>([])
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const pages = ref(0)
let abortController: AbortController | null = null
let searchTimer: ReturnType<typeof setTimeout> | null = null

watch(() => props.show, (val) => {
  if (val && props.announcement) {
    search.value = ''
    page.value = 1
    loadStatuses()
  }
})

function handleSearch() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    page.value = 1
    loadStatuses()
  }, 300)
}

async function loadStatuses() {
  if (!props.announcement) return
  if (abortController) abortController.abort()
  const controller = new AbortController()
  abortController = controller

  loading.value = true
  try {
    const params: Record<string, unknown> = {
      page: page.value,
      page_size: pageSize.value,
    }
    if (search.value) params.search = search.value

    const response = await adminAPI.announcements.getReadStatus(
      props.announcement.id,
      params,
      controller.signal
    )
    if (controller.signal.aborted) return
    statuses.value = response.items
    total.value = response.total
    pages.value = response.pages
  } catch (err: any) {
    if (err?.name === 'AbortError' || err?.code === 'ERR_CANCELED') return
    showError('加载阅读状态失败')
  } finally {
    if (abortController === controller) {
      loading.value = false
      abortController = null
    }
  }
}

function goPage(p: number) {
  if (p < 1 || p > pages.value) return
  page.value = p
  loadStatuses()
}

function handleClose() {
  if (abortController) abortController.abort()
  if (searchTimer) clearTimeout(searchTimer)
  emit('close')
}

function formatDate(d: string) {
  return new Date(d).toLocaleString('zh-CN')
}

onUnmounted(() => {
  if (abortController) abortController.abort()
  if (searchTimer) clearTimeout(searchTimer)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      @click.self="handleClose"
    >
      <div class="w-full max-w-4xl max-h-[85vh] flex flex-col rounded-2xl border border-white/10 bg-[#080b14] shadow-2xl">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <p class="text-xs font-bold uppercase tracking-widest text-amber-400">阅读状态</p>
            <h2 class="mt-1 text-xl font-black text-white truncate max-w-md">{{ announcement?.title }}</h2>
          </div>
          <button
            class="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-slate-400 transition hover:border-amber-500 hover:text-amber-300"
            @click="handleClose"
          >关闭</button>
        </div>

        <!-- Search -->
        <div class="border-b border-white/[0.06] px-6 py-3">
          <div class="relative">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500">
              <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
            </svg>
            <input
              v-model="search"
              type="text"
              placeholder="搜索邮箱或用户名..."
              class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 transition focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              @input="handleSearch"
            />
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto">
          <!-- Loading -->
          <div v-if="loading" class="flex items-center justify-center py-16">
            <div class="text-center">
              <div class="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-amber-500"></div>
              <p class="text-sm text-slate-400">加载中...</p>
            </div>
          </div>

          <!-- Table -->
          <div v-else-if="statuses.length > 0" class="overflow-x-auto">
            <table class="w-full">
              <thead class="border-b border-white/[0.06] bg-white/[0.02]">
                <tr>
                  <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">用户</th>
                  <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">余额</th>
                  <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">符合条件</th>
                  <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">阅读时间</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/[0.04]">
                <tr v-for="s in statuses" :key="s.user_id" class="transition hover:bg-white/[0.04]">
                  <td class="px-4 py-3">
                    <p class="text-sm font-bold text-white">{{ s.email }}</p>
                    <p class="text-[11px] text-slate-500">{{ s.username }}</p>
                  </td>
                  <td class="px-4 py-3 text-sm text-slate-300">${{ (s.balance || 0).toFixed(2) }}</td>
                  <td class="px-4 py-3">
                    <span :class="[
                      'inline-block rounded-full px-2 py-0.5 text-[10px] font-bold',
                      s.eligible ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-500'
                    ]">
                      {{ s.eligible ? '是' : '否' }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-xs text-slate-400">
                    {{ s.read_at ? formatDate(s.read_at) : '未读' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty -->
          <div v-else class="flex flex-col items-center justify-center py-16">
            <p class="text-3xl mb-2">📭</p>
            <p class="text-sm text-slate-500">暂无阅读数据</p>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="total > 0" class="flex items-center justify-between border-t border-white/[0.06] px-6 py-3">
          <span class="text-xs text-slate-500">共 {{ total }} 条</span>
          <div class="flex items-center gap-3">
            <button
              :disabled="page <= 1"
              class="rounded-lg border border-white/10 px-3 py-1 text-xs text-slate-400 transition hover:border-amber-500/30 hover:text-amber-400 disabled:opacity-30"
              @click="goPage(page - 1)"
            >上一页</button>
            <span class="text-xs text-slate-400">{{ page }} / {{ pages }}</span>
            <button
              :disabled="page >= pages"
              class="rounded-lg border border-white/10 px-3 py-1 text-xs text-slate-400 transition hover:border-amber-500/30 hover:text-amber-400 disabled:opacity-30"
              @click="goPage(page + 1)"
            >下一页</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
