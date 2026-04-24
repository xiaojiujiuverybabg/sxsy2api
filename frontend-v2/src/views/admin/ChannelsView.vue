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
          <option value="active">活跃</option>
          <option value="disabled">禁用</option>
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
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">名称</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">描述</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">状态</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">分组数</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">定价规则</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">创建时间</th>
              <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">操作</th>
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
                  @click="toggleStatus(channel)"
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
                <span class="inline-flex items-center rounded-full bg-slate-700/50 px-2.5 py-0.5 text-xs font-medium text-slate-300">
                  {{ (channel.group_ids || []).length }} 个
                </span>
              </td>

              <!-- 定价规则 -->
              <td class="px-4 py-3">
                <span class="inline-flex items-center rounded-full bg-slate-700/50 px-2.5 py-0.5 text-xs font-medium text-slate-300">
                  {{ (channel.model_pricing || []).length }} 条
                </span>
              </td>

              <!-- 创建时间 -->
              <td class="px-4 py-3">
                <div class="text-sm text-slate-400">{{ formatDate(channel.created_at) }}</div>
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
                    @click="confirmDelete(channel)"
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

    <!-- 创建/编辑弹窗 -->
    <div
      v-if="showDialog"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      @click.self="closeDialog"
    >
      <div class="w-full max-w-2xl rounded-xl border border-slate-700/50 bg-slate-900 shadow-2xl">
        <!-- 弹窗标题 -->
        <div class="flex items-center justify-between border-b border-slate-700/50 px-6 py-4">
          <h2 class="text-xl font-bold text-white">
            {{ editingChannel ? '✏️ 编辑渠道' : '➕ 创建渠道' }}
          </h2>
          <button
            @click="closeDialog"
            class="text-slate-400 transition hover:text-white"
          >
            ✕
          </button>
        </div>

        <!-- 弹窗内容 -->
        <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
          <!-- 名称 -->
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">
              名称 <span class="text-red-400">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="输入渠道名称"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <!-- 描述 -->
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">描述</label>
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="输入渠道描述（可选）"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            ></textarea>
          </div>

          <!-- 状态（仅编辑时显示） -->
          <div v-if="editingChannel">
            <label class="mb-2 block text-sm font-medium text-slate-300">状态</label>
            <select
              v-model="form.status"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm text-white backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="active">活跃</option>
              <option value="disabled">禁用</option>
            </select>
          </div>

          <!-- 提示信息 -->
          <div class="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
            <p class="text-xs text-blue-300">
              💡 提示：完整的渠道配置（分组、定价规则、模型映射等）需要通过 API 或后台管理系统进行配置。
            </p>
          </div>

          <!-- 按钮 -->
          <div class="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              @click="closeDialog"
              class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:from-brand-600 hover:to-brand-700 disabled:opacity-50"
            >
              {{ submitting ? '提交中...' : (editingChannel ? '更新' : '创建') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div
      v-if="showDeleteDialog"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      @click.self="showDeleteDialog = false"
    >
      <div class="w-full max-w-md rounded-xl border border-slate-700/50 bg-slate-900 shadow-2xl">
        <div class="p-6">
          <div class="mb-4 flex items-center justify-center">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
              <span class="text-2xl">⚠️</span>
            </div>
          </div>
          <h3 class="mb-2 text-center text-lg font-bold text-white">确认删除</h3>
          <p class="mb-6 text-center text-sm text-slate-400">
            确定要删除渠道 <span class="font-medium text-white">{{ deletingChannel?.name }}</span> 吗？此操作无法撤销。
          </p>
          <div class="flex items-center gap-3">
            <button
              @click="showDeleteDialog = false"
              class="flex-1 rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800"
            >
              取消
            </button>
            <button
              @click="handleDelete"
              class="flex-1 rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 text-sm font-medium text-white transition hover:from-red-600 hover:to-red-700"
            >
              确认删除
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { adminAPI } from '@/api/admin'

interface Channel {
  id: number
  name: string
  description?: string
  status: 'active' | 'disabled'
  group_ids?: number[]
  model_pricing?: unknown[]
  created_at: string
}

// 状态
const channels = ref<Channel[]>([])
const loading = ref(false)
const searchQuery = ref('')
const filters = reactive({
  status: '',
})
const pagination = reactive({
  page: 1,
  page_size: 20,
  total: 0,
})

// 弹窗状态
const showDialog = ref(false)
const showDeleteDialog = ref(false)
const editingChannel = ref<Channel | null>(null)
const deletingChannel = ref<Channel | null>(null)
const submitting = ref(false)

// 表单数据
const form = reactive({
  name: '',
  description: '',
  status: 'active' as 'active' | 'disabled',
})

// 计算属性
const totalPages = computed(() => Math.ceil(pagination.total / pagination.page_size))

// 格式化日期
function formatDate(dateString: string): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

// 加载渠道列表
async function loadChannels() {
  loading.value = true
  try {
    const response = await adminAPI.channels.list(pagination.page, pagination.page_size, {
      status: filters.status || undefined,
      search: searchQuery.value || undefined,
    })
    channels.value = response.items as Channel[]
    pagination.total = response.total
  } catch (error) {
    console.error('加载渠道列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索处理
let searchTimeout: ReturnType<typeof setTimeout>
function handleSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.page = 1
    loadChannels()
  }, 300)
}

// 应用筛选
function applyFilters() {
  pagination.page = 1
  loadChannels()
}

// 分页
function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  pagination.page = page
  loadChannels()
}

// 切换状态
async function toggleStatus(channel: Channel) {
  try {
    const newStatus = channel.status === 'active' ? 'disabled' : 'active'
    // 注意：这里需要实际的 API 支持
    console.log('切换状态:', channel.id, newStatus)
    channel.status = newStatus
  } catch (error) {
    console.error('切换状态失败:', error)
  }
}

// 测试渠道
function testChannel(channel: Channel) {
  console.log('测试渠道:', channel)
  alert(`测试渠道: ${channel.name}\n\n此功能需要后端 API 支持`)
}

// 打开创建弹窗
function openCreateDialog() {
  editingChannel.value = null
  form.name = ''
  form.description = ''
  form.status = 'active'
  showDialog.value = true
}

// 打开编辑弹窗
function openEditDialog(channel: Channel) {
  editingChannel.value = channel
  form.name = channel.name
  form.description = channel.description || ''
  form.status = channel.status
  showDialog.value = true
}

// 关闭弹窗
function closeDialog() {
  showDialog.value = false
  editingChannel.value = null
}

// 提交表单
async function handleSubmit() {
  if (!form.name.trim()) {
    alert('请输入渠道名称')
    return
  }

  submitting.value = true
  try {
    // 注意：这里需要实际的 API 支持
    console.log('提交表单:', form)
    alert(`${editingChannel.value ? '更新' : '创建'}渠道成功！\n\n此功能需要后端 API 支持`)
    closeDialog()
    loadChannels()
  } catch (error) {
    console.error('提交失败:', error)
    alert('操作失败，请重试')
  } finally {
    submitting.value = false
  }
}

// 确认删除
function confirmDelete(channel: Channel) {
  deletingChannel.value = channel
  showDeleteDialog.value = true
}

// 执行删除
async function handleDelete() {
  if (!deletingChannel.value) return

  try {
    // 注意：这里需要实际的 API 支持
    console.log('删除渠道:', deletingChannel.value.id)
    alert(`删除渠道成功！\n\n此功能需要后端 API 支持`)
    showDeleteDialog.value = false
    deletingChannel.value = null
    loadChannels()
  } catch (error) {
    console.error('删除失败:', error)
    alert('删除失败，请重试')
  }
}

// 初始化
onMounted(() => {
  loadChannels()
})
</script>
