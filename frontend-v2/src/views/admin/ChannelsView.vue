<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
    <!-- 页面标题 -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-white">🔌 渠道管理</h1>
          <p class="mt-2 text-sm text-slate-400">管理模型渠道和定价规则</p>
        </div>
        <div class="flex items-center gap-3">
          <button
            @click="loadChannels"
            :disabled="loading"
            class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800 disabled:opacity-50"
          >
            <span v-if="loading">🔄 加载中...</span>
            <span v-else>🔄 刷新</span>
          </button>
          <button
            @click="openCreateDialog"
            class="rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:from-brand-600 hover:to-brand-700"
          >
            ➕ 创建渠道
          </button>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="mb-6 rounded-xl border border-slate-700/50 bg-slate-800/40 p-4 backdrop-blur-sm">
      <div class="flex flex-wrap items-center gap-3">
        <!-- 搜索框 -->
        <div class="relative flex-1 min-w-[200px]">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索渠道名称..."
            class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2 pl-10 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            @input="handleSearch"
          />
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
        </div>

        <!-- 状态筛选 -->
        <select
          v-model="filters.status"
          @change="applyFilters"
          class="rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-2 text-sm text-white backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="">全部状态</option>
          <option value="active">启用</option>
          <option value="disabled">停用</option>
        </select>
      </div>
    </div>

    <!-- 渠道列表 -->
    <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm overflow-hidden">
      <!-- 加载状态 -->
      <div v-if="loading && channels.length === 0" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-brand-500"></div>
          <p class="text-sm text-slate-400">加载中...</p>
        </div>
      </div>

      <!-- 渠道表格 -->
      <div v-else-if="channels.length > 0" class="overflow-x-auto">
        <table class="w-full">
          <thead class="border-b border-slate-700/50 bg-slate-900/50">
            <tr>
              <th
                v-for="col in columns"
                :key="col.key"
                class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400"
                :class="col.sortable ? 'cursor-pointer select-none' : ''"
                @click="col.sortable ? handleSort(col.key) : null"
              >
                <div class="flex items-center gap-1">
                  {{ col.label }}
                  <span v-if="sortState.sort_by === col.key" class="text-brand-400">
                    {{ sortState.sort_order === 'asc' ? '↑' : '↓' }}
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-700/30">
            <tr
              v-for="channel in channels"
              :key="channel.id"
              class="transition hover:bg-slate-700/20"
            >
              <!-- 名称 -->
              <td class="px-4 py-3">
                <div class="text-sm font-medium text-white">{{ channel.name }}</div>
              </td>

              <!-- 描述 -->
              <td class="px-4 py-3">
                <div class="text-sm text-slate-400">{{ channel.description || '-' }}</div>
              </td>

              <!-- 状态 -->
              <td class="px-4 py-3">
                <button
                  @click="toggleChannelStatus(channel)"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition"
                  :class="channel.status === 'active' ? 'bg-emerald-500' : 'bg-slate-600'"
                >
                  <span
                    class="inline-block h-4 w-4 transform rounded-full bg-white transition"
                    :class="channel.status === 'active' ? 'translate-x-6' : 'translate-x-1'"
                  ></span>
                </button>
              </td>

              <!-- 分组数 -->
              <td class="px-4 py-3">
                <span class="inline-flex items-center rounded-full bg-slate-700/50 px-2.5 py-0.5 text-xs font-medium text-slate-300"
                >
                  {{ (channel.group_ids || []).length }} 个
                </span>
              </td>

              <!-- 定价规则 -->
              <td class="px-4 py-3">
                <span class="inline-flex items-center rounded-full bg-slate-700/50 px-2.5 py-0.5 text-xs font-medium text-slate-300"
                >
                  {{ (channel.model_pricing || []).length }} 条
                </span>
              </td>

              <!-- 创建时间 -->
              <td class="px-4 py-3">
                <div class="text-sm text-slate-400">{{ formatDateTime(channel.created_at) }}</div>
              </td>

              <!-- 操作 -->
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="testChannel(channel)"
                    class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800"
                    title="测试连接"
                  >
                    🧪 测试
                  </button>
                  <button
                    @click="openEditDialog(channel)"
                    class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-blue-400 transition hover:border-blue-500/50 hover:bg-blue-500/10"
                  >
                    ✏️ 编辑
                  </button>
                  <button
                    @click="handleDelete(channel)"
                    class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:border-red-500/50 hover:bg-red-500/10"
                  >
                    🗑️ 删除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 空状态 -->
      <div v-else class="flex flex-col items-center justify-center py-20">
        <div class="mb-4 text-6xl">📦</div>
        <h3 class="mb-2 text-lg font-medium text-white">暂无渠道</h3>
        <p class="mb-6 text-sm text-slate-400">创建第一个渠道来管理模型定价</p>
        <button
          @click="openCreateDialog"
          class="rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:from-brand-600 hover:to-brand-700"
        >
          ➕ 创建渠道
        </button>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="pagination.total > 0" class="mt-6 flex items-center justify-between">
      <div class="text-sm text-slate-400">
        共 {{ pagination.total }} 条记录，第 {{ pagination.page }} / {{ totalPages }} 页
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="goToPage(pagination.page - 1)"
          :disabled="pagination.page === 1"
          class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-1.5 text-sm font-medium text-slate-300 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          上一页
        </button>
        <button
          @click="goToPage(pagination.page + 1)"
          :disabled="pagination.page >= totalPages"
          class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-1.5 text-sm font-medium text-slate-300 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          下一页
        </button>
      </div>
    </div>

    <!-- Channel Form Modal -->
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

interface Column {
  key: string
  label: string
  sortable: boolean
}

const columns: Column[] = [
  { key: 'name', label: '名称', sortable: true },
  { key: 'description', label: '描述', sortable: false },
  { key: 'status', label: '状态', sortable: true },
  { key: 'group_count', label: '分组', sortable: false },
  { key: 'pricing_count', label: '定价规则', sortable: false },
  { key: 'created_at', label: '创建时间', sortable: true },
  { key: 'actions', label: '操作', sortable: false },
]

// ── State ───────────────────────────────────────────────
const channels = ref<Channel[]>([])
const loading = ref(false)
const searchQuery = ref('')
const filters = reactive({ status: '' })
const pagination = reactive({
  page: 1,
  page_size: 20,
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

const deleteConfirmMessage = computed(() => {
  const name = deletingChannel.value?.name || ''
  return `确定要删除渠道 "${name}" 吗？此操作无法撤销。`
})

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

function handleSort(key: string) {
  if (sortState.sort_by === key) {
    sortState.sort_order = sortState.sort_order === 'asc' ? 'desc' : 'asc'
  } else {
    sortState.sort_by = key
    sortState.sort_order = 'asc'
  }
  pagination.page = 1
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
