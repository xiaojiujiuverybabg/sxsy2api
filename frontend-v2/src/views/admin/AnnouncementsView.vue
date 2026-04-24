<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
    <!-- 页面标题 -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-white">📢 公告管理</h1>
          <p class="mt-2 text-sm text-slate-400">发布和管理系统公告</p>
        </div>
        <div class="flex gap-3">
          <button
            @click="loadAnnouncements"
            :disabled="loading"
            class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800 disabled:opacity-50"
          >
            <span v-if="loading">🔄 加载中...</span>
            <span v-else>🔄 刷新</span>
          </button>
          <button
            @click="openCreateDialog"
            class="rounded-lg border border-gold-500/50 bg-gradient-to-r from-gold-500/20 to-gold-600/20 px-4 py-2 text-sm font-medium text-gold-400 backdrop-blur-sm transition hover:border-gold-400 hover:from-gold-500/30 hover:to-gold-600/30"
          >
            ➕ 创建公告
          </button>
        </div>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="mb-6 rounded-xl border border-slate-700/50 bg-slate-800/40 p-4 backdrop-blur-sm">
      <div class="flex flex-wrap items-center gap-3">
        <select
          v-model="filters.status"
          @change="applyFilters"
          class="rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-2 text-sm text-white backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
        >
          <option value="">全部状态</option>
          <option value="draft">草稿</option>
          <option value="active">活跃</option>
          <option value="archived">已归档</option>
        </select>

        <select
          v-model="filters.notify_mode"
          @change="applyFilters"
          class="rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-2 text-sm text-white backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
        >
          <option value="">全部通知模式</option>
          <option value="silent">静默</option>
          <option value="popup">弹窗</option>
        </select>
      </div>
    </div>

    <!-- 公告列表 -->
    <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm overflow-hidden">
      <!-- 加载状态 -->
      <div v-if="loading && announcements.length === 0" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-gold-500"></div>
          <p class="text-sm text-slate-400">加载中...</p>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="announcements.length === 0" class="flex flex-col items-center justify-center py-20">
        <div class="mb-4 text-6xl">📭</div>
        <p class="text-lg font-medium text-slate-300">暂无公告</p>
        <p class="mt-2 text-sm text-slate-500">点击"创建公告"按钮添加第一条公告</p>
      </div>

      <!-- 公告卡片列表 -->
      <div v-else class="divide-y divide-slate-700/30">
        <div
          v-for="announcement in announcements"
          :key="announcement.id"
          class="p-6 transition hover:bg-slate-700/20"
        >
          <div class="flex items-start justify-between gap-4">
            <!-- 左侧内容 -->
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h3 class="text-lg font-semibold text-white">{{ announcement.title }}</h3>
                <span
                  :class="{
                    'bg-green-500/20 text-green-400 border-green-500/50': announcement.status === 'active',
                    'bg-slate-500/20 text-slate-400 border-slate-500/50': announcement.status === 'draft',
                    'bg-orange-500/20 text-orange-400 border-orange-500/50': announcement.status === 'archived'
                  }"
                  class="rounded-full border px-2 py-0.5 text-xs font-medium"
                >
                  {{ statusText(announcement.status) }}
                </span>
                <span
                  :class="{
                    'bg-gold-500/20 text-gold-400 border-gold-500/50': announcement.notify_mode === 'popup',
                    'bg-slate-500/20 text-slate-400 border-slate-500/50': announcement.notify_mode === 'silent'
                  }"
                  class="rounded-full border px-2 py-0.5 text-xs font-medium"
                >
                  {{ announcement.notify_mode === 'popup' ? '🔔 弹窗' : '🔕 静默' }}
                </span>
              </div>

              <p class="text-sm text-slate-400 mb-3 line-clamp-2">{{ announcement.content }}</p>

              <div class="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span>📅 创建: {{ formatDate(announcement.created_at) }}</span>
                <span v-if="announcement.starts_at">⏰ 开始: {{ formatDate(announcement.starts_at) }}</span>
                <span v-if="announcement.ends_at">⏱️ 结束: {{ formatDate(announcement.ends_at) }}</span>
              </div>
            </div>

            <!-- 右侧操作 -->
            <div class="flex gap-2">
              <button
                @click="viewReadStatus(announcement)"
                class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800"
              >
                👁️ 查看阅读
              </button>
              <button
                @click="openEditDialog(announcement)"
                class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800"
              >
                ✏️ 编辑
              </button>
              <button
                @click="deleteAnnouncement(announcement.id)"
                class="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 backdrop-blur-sm transition hover:border-red-400 hover:bg-red-500/20"
              >
                🗑️ 删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建/编辑对话框 -->
    <div
      v-if="showDialog"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      @click.self="closeDialog"
    >
      <div class="w-full max-w-2xl rounded-xl border border-slate-700/50 bg-slate-900 p-6 shadow-2xl">
        <h2 class="mb-6 text-xl font-bold text-white">
          {{ editingAnnouncement ? '✏️ 编辑公告' : '➕ 创建公告' }}
        </h2>

        <div class="space-y-4">
          <!-- 标题 -->
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">标题</label>
            <input
              v-model="form.title"
              type="text"
              placeholder="输入公告标题"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            />
          </div>

          <!-- 内容 -->
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">内容</label>
            <textarea
              v-model="form.content"
              rows="4"
              placeholder="输入公告内容"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            ></textarea>
          </div>

          <!-- 状态和通知模式 -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-300">状态</label>
              <select
                v-model="form.status"
                class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-white backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
              >
                <option value="draft">草稿</option>
                <option value="active">活跃</option>
                <option value="archived">已归档</option>
              </select>
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-slate-300">通知模式</label>
              <select
                v-model="form.notify_mode"
                class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-white backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
              >
                <option value="silent">静默</option>
                <option value="popup">弹窗</option>
              </select>
            </div>
          </div>

          <!-- 时间范围 -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-300">开始时间（可选）</label>
              <input
                v-model="form.starts_at"
                type="datetime-local"
                class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-white backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
              />
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-slate-300">结束时间（可选）</label>
              <input
                v-model="form.ends_at"
                type="datetime-local"
                class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-white backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
              />
            </div>
          </div>
        </div>

        <!-- 对话框按钮 -->
        <div class="mt-6 flex justify-end gap-3">
          <button
            @click="closeDialog"
            class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800"
          >
            取消
          </button>
          <button
            @click="saveAnnouncement"
            :disabled="saving"
            class="rounded-lg border border-gold-500/50 bg-gradient-to-r from-gold-500/20 to-gold-600/20 px-4 py-2 text-sm font-medium text-gold-400 backdrop-blur-sm transition hover:border-gold-400 hover:from-gold-500/30 hover:to-gold-600/30 disabled:opacity-50"
          >
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 阅读状态对话框 -->
    <div
      v-if="showReadStatusDialog"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      @click.self="closeReadStatusDialog"
    >
      <div class="w-full max-w-4xl rounded-xl border border-slate-700/50 bg-slate-900 p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
        <h2 class="mb-6 text-xl font-bold text-white">👁️ 阅读状态</h2>

        <!-- 加载状态 -->
        <div v-if="loadingReadStatus" class="flex items-center justify-center py-12">
          <div class="text-center">
            <div class="mb-4 inline-block h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-gold-500"></div>
            <p class="text-sm text-slate-400">加载中...</p>
          </div>
        </div>

        <!-- 阅读状态列表 -->
        <div v-else-if="readStatuses.length > 0" class="overflow-x-auto">
          <table class="w-full">
            <thead class="border-b border-slate-700/50 bg-slate-800/50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">用户</th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">余额</th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">是否符合</th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">阅读时间</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-700/30">
              <tr
                v-for="status in readStatuses"
                :key="status.user_id"
                class="transition hover:bg-slate-700/20"
              >
                <td class="px-4 py-3">
                  <div class="text-sm text-white">{{ status.email }}</div>
                  <div class="text-xs text-slate-400">{{ status.username }}</div>
                </td>
                <td class="px-4 py-3 text-sm text-slate-300">¥{{ status.balance.toFixed(2) }}</td>
                <td class="px-4 py-3">
                  <span
                    :class="status.eligible ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-slate-500/20 text-slate-400 border-slate-500/50'"
                    class="rounded-full border px-2 py-0.5 text-xs font-medium"
                  >
                    {{ status.eligible ? '✓ 是' : '✗ 否' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-slate-300">
                  {{ status.read_at ? formatDate(status.read_at) : '未读' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 空状态 -->
        <div v-else class="flex flex-col items-center justify-center py-12">
          <div class="mb-4 text-4xl">📭</div>
          <p class="text-sm text-slate-400">暂无阅读数据</p>
        </div>

        <div class="mt-6 flex justify-end">
          <button
            @click="closeReadStatusDialog"
            class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminAPI } from '@/api/admin'
import type { Announcement, AnnouncementUserReadStatus } from '@/types'
import { showSuccess, showError, confirm } from '@/utils/toast'

const loading = ref(false)
const saving = ref(false)
const announcements = ref<Announcement[]>([])
const filters = ref({
  status: '',
  notify_mode: ''
})

const showDialog = ref(false)
const editingAnnouncement = ref<Announcement | null>(null)
const form = ref({
  title: '',
  content: '',
  status: 'draft' as 'draft' | 'active' | 'archived',
  notify_mode: 'silent' as 'silent' | 'popup',
  starts_at: '',
  ends_at: ''
})

const showReadStatusDialog = ref(false)
const loadingReadStatus = ref(false)
const readStatuses = ref<AnnouncementUserReadStatus[]>([])
const currentAnnouncementId = ref<number | null>(null)

onMounted(() => {
  loadAnnouncements()
})

async function loadAnnouncements() {
  loading.value = true
  try {
    const response = await adminAPI.announcements.list()
    announcements.value = response.data
  } catch (error: any) {
    showError({ message: error.response?.data?.error || '加载公告失败' })
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  loadAnnouncements()
}

function openCreateDialog() {
  editingAnnouncement.value = null
  form.value = {
    title: '',
    content: '',
    status: 'draft',
    notify_mode: 'silent',
    starts_at: '',
    ends_at: ''
  }
  showDialog.value = true
}

function openEditDialog(announcement: Announcement) {
  editingAnnouncement.value = announcement
  form.value = {
    title: announcement.title,
    content: announcement.content,
    status: announcement.status,
    notify_mode: announcement.notify_mode,
    starts_at: announcement.starts_at ? announcement.starts_at.slice(0, 16) : '',
    ends_at: announcement.ends_at ? announcement.ends_at.slice(0, 16) : ''
  }
  showDialog.value = true
}

function closeDialog() {
  showDialog.value = false
  editingAnnouncement.value = null
}

async function saveAnnouncement() {
  if (!form.value.title || !form.value.content) {
    showError({ message: '请填写标题和内容' })
    return
  }

  saving.value = true
  try {
    const data = {
      title: form.value.title,
      content: form.value.content,
      status: form.value.status,
      notify_mode: form.value.notify_mode,
      starts_at: form.value.starts_at || undefined,
      ends_at: form.value.ends_at || undefined,
      targeting: { all_users: true }
    }

    if (editingAnnouncement.value) {
      await adminAPI.announcements.update(editingAnnouncement.value.id, data)
      showSuccess({ message: '公告更新成功' })
    } else {
      await adminAPI.announcements.create(data)
      showSuccess({ message: '公告创建成功' })
    }

    closeDialog()
    loadAnnouncements()
  } catch (error: any) {
    showError({ message: error.response?.data?.error || '保存失败' })
  } finally {
    saving.value = false
  }
}

async function deleteAnnouncement(id: number) {
  const confirmed = await confirm({
    title: '确认删除',
    message: '确定要删除这条公告吗？此操作不可恢复。'
  })

  if (!confirmed) return

  try {
    await adminAPI.announcements.delete(id)
    showSuccess({ message: '公告删除成功' })
    loadAnnouncements()
  } catch (error: any) {
    showError({ message: error.response?.data?.error || '删除失败' })
  }
}

async function viewReadStatus(announcement: Announcement) {
  currentAnnouncementId.value = announcement.id
  showReadStatusDialog.value = true
  loadingReadStatus.value = true

  try {
    const response = await adminAPI.announcements.getReadStatus(announcement.id)
    readStatuses.value = response.data
  } catch (error: any) {
    showError({ message: error.response?.data?.error || '加载阅读状态失败' })
  } finally {
    loadingReadStatus.value = false
  }
}

function closeReadStatusDialog() {
  showReadStatusDialog.value = false
  currentAnnouncementId.value = null
  readStatuses.value = []
}

function statusText(status: string): string {
  const map: Record<string, string> = {
    draft: '草稿',
    active: '活跃',
    archived: '已归档'
  }
  return map[status] || status
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('zh-CN')
}
</script>
