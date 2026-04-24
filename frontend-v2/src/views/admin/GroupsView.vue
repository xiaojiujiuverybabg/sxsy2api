<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
    <!-- 页面标题 -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-white">📦 分组管理</h1>
          <p class="mt-2 text-sm text-slate-400">管理模型分组和访问权限</p>
        </div>
        <div class="flex items-center gap-3">
          <button
            @click="loadGroups"
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
            ➕ 创建分组
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
            placeholder="搜索分组名称..."
            class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2 pl-10 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            @input="handleSearch"
          />
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
        </div>

        <!-- 平台筛选 -->
        <select
          v-model="filters.platform"
          @change="applyFilters"
          class="rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-2 text-sm text-white backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="">全部平台</option>
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic</option>
          <option value="gemini">Gemini</option>
          <option value="antigravity">Antigravity</option>
        </select>

        <!-- 状态筛选 -->
        <select
          v-model="filters.status"
          @change="applyFilters"
          class="rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-2 text-sm text-white backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="">全部状态</option>
          <option value="active">活跃</option>
          <option value="inactive">禁用</option>
        </select>

        <!-- 独占筛选 -->
        <select
          v-model="filters.is_exclusive"
          @change="applyFilters"
          class="rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-2 text-sm text-white backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="">全部分组</option>
          <option value="true">独占分组</option>
          <option value="false">公共分组</option>
        </select>
      </div>
    </div>

    <!-- 分组列表 -->
    <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm overflow-hidden">
      <!-- 加载状态 -->
      <div v-if="loading && groups.length === 0" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-brand-500"></div>
          <p class="text-sm text-slate-400">加载中...</p>
        </div>
      </div>

      <!-- 分组表格 -->
      <div v-else-if="groups.length > 0" class="overflow-x-auto">
        <table class="w-full">
          <thead class="border-b border-slate-700/50 bg-slate-900/50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">名称</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">平台</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">状态</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">独占</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">账户数</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">倍率</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">创建时间</th>
              <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-700/30">
            <tr
              v-for="group in groups"
              :key="group.id"
              class="transition hover:bg-slate-700/20"
            >
              <!-- 名称 -->
              <td class="px-4 py-3">
                <div class="text-sm font-medium text-white">{{ group.name }}</div>
                <div v-if="group.description" class="text-xs text-slate-400 mt-0.5">{{ group.description }}</div>
              </td>

              <!-- 平台 -->
              <td class="px-4 py-3">
                <span
                  :class="[
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                    group.platform === 'openai' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    group.platform === 'anthropic' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                    group.platform === 'gemini' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                    'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  ]"
                >
                  {{ platformNames[group.platform] || group.platform }}
                </span>
              </td>

              <!-- 状态 -->
              <td class="px-4 py-3">
                <button
                  @click="toggleStatus(group)"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition"
                  :class="group.status === 'active' ? 'bg-emerald-500' : 'bg-slate-600'"
                >
                  <span
                    class="inline-block h-4 w-4 transform rounded-full bg-white transition"
                    :class="group.status === 'active' ? 'translate-x-6' : 'translate-x-1'"
                  ></span>
                </button>
              </td>

              <!-- 独占 -->
              <td class="px-4 py-3">
                <span
                  :class="[
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                    group.is_exclusive ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'bg-slate-700/50 text-slate-300'
                  ]"
                >
                  {{ group.is_exclusive ? '独占' : '公共' }}
                </span>
              </td>

              <!-- 账户数 -->
              <td class="px-4 py-3">
                <div class="text-sm text-slate-300">
                  <span class="font-medium text-white">{{ group.active_account_count || 0 }}</span>
                  <span class="text-slate-500"> / {{ group.account_count || 0 }}</span>
                </div>
              </td>

              <!-- 倍率 -->
              <td class="px-4 py-3">
                <span class="text-sm font-medium text-slate-300">{{ group.rate_multiplier }}x</span>
              </td>

              <!-- 创建时间 -->
              <td class="px-4 py-3">
                <div class="text-sm text-slate-400">{{ formatDate(group.created_at) }}</div>
              </td>

              <!-- 操作 -->
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="openEditDialog(group)"
                    class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-blue-400 transition hover:border-blue-500/50 hover:bg-blue-500/10"
                  >
                    ✏️ 编辑
                  </button>
                  <button
                    @click="confirmDelete(group)"
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
        <h3 class="text-lg font-bold text-white">暂无分组</h3>
        <p class="mt-2 text-sm text-slate-400">点击右上角按钮创建第一个分组</p>
      </div>

      <!-- 分页 -->
      <div v-if="pagination.total > 0" class="border-t border-slate-700/50 bg-slate-900/30 px-4 py-3">
        <div class="flex items-center justify-between">
          <div class="text-sm text-slate-400">
            共 {{ pagination.total }} 个分组，第 {{ pagination.page }} / {{ pagination.pages }} 页
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="goToPage(pagination.page - 1)"
              :disabled="pagination.page <= 1"
              class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            <button
              @click="goToPage(pagination.page + 1)"
              :disabled="pagination.page >= pagination.pages"
              class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建/编辑弹窗 -->
    <div
      v-if="showDialog"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      @click.self="closeDialog"
    >
      <div class="w-full max-w-lg rounded-2xl border border-slate-700/50 bg-slate-800/95 p-6 backdrop-blur-xl shadow-2xl">
        <h2 class="mb-6 text-xl font-bold text-white">
          {{ editingGroup ? '✏️ 编辑分组' : '➕ 创建分组' }}
        </h2>

        <div class="space-y-4">
          <!-- 名称 -->
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">分组名称</label>
            <input
              v-model="formData.name"
              type="text"
              placeholder="输入分组名称"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <!-- 平台 -->
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">平台</label>
            <select
              v-model="formData.platform"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2 text-sm text-white backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="gemini">Gemini</option>
              <option value="antigravity">Antigravity</option>
            </select>
          </div>

          <!-- 描述 -->
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">描述（可选）</label>
            <textarea
              v-model="formData.description"
              placeholder="输入分组描述"
              rows="3"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            ></textarea>
          </div>

          <!-- 倍率 -->
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">倍率</label>
            <input
              v-model.number="formData.rate_multiplier"
              type="number"
              step="0.1"
              min="0"
              placeholder="1.0"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <!-- 独占 -->
          <div class="flex items-center gap-3">
            <input
              v-model="formData.is_exclusive"
              type="checkbox"
              id="is_exclusive"
              class="h-4 w-4 rounded border-slate-700/50 bg-slate-900/50 text-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
            <label for="is_exclusive" class="text-sm font-medium text-slate-300">独占分组</label>
          </div>
        </div>

        <!-- 按钮 -->
        <div class="mt-6 flex items-center justify-end gap-3">
          <button
            @click="closeDialog"
            class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800"
          >
            取消
          </button>
          <button
            @click="saveGroup"
            :disabled="saving || !formData.name"
            class="rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:from-brand-600 hover:to-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminAPI } from '@/api'
import type { AdminGroup, GroupPlatform } from '@/types'

const loading = ref(false)
const saving = ref(false)
const groups = ref<AdminGroup[]>([])
const searchQuery = ref('')
const filters = ref<{
  platform?: GroupPlatform
  status?: 'active' | 'inactive'
  is_exclusive?: string
}>({})

const pagination = ref({
  page: 1,
  page_size: 20,
  total: 0,
  pages: 0
})

const showDialog = ref(false)
const editingGroup = ref<AdminGroup | null>(null)
const formData = ref({
  name: '',
  platform: 'openai' as GroupPlatform,
  description: '',
  rate_multiplier: 1,
  is_exclusive: false
})

const platformNames: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  gemini: 'Gemini',
  antigravity: 'Antigravity'
}

let searchTimeout: ReturnType<typeof setTimeout> | null = null

const loadGroups = async () => {
  loading.value = true
  try {
    const filterParams: any = {}
    if (filters.value.platform) filterParams.platform = filters.value.platform
    if (filters.value.status) filterParams.status = filters.value.status
    if (filters.value.is_exclusive) filterParams.is_exclusive = filters.value.is_exclusive === 'true'
    if (searchQuery.value) filterParams.search = searchQuery.value

    const response = await adminAPI.groups.list(
      pagination.value.page,
      pagination.value.page_size,
      filterParams
    )

    groups.value = response.items
    pagination.value = {
      page: response.page,
      page_size: response.page_size,
      total: response.total,
      pages: response.pages
    }
  } catch (error) {
    console.error('加载分组失败:', error)
    alert('加载分组失败，请重试')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1
    loadGroups()
  }, 300)
}

const applyFilters = () => {
  pagination.value.page = 1
  loadGroups()
}

const goToPage = (page: number) => {
  if (page < 1 || page > pagination.value.pages) return
  pagination.value.page = page
  loadGroups()
}

const openCreateDialog = () => {
  editingGroup.value = null
  formData.value = {
    name: '',
    platform: 'openai',
    description: '',
    rate_multiplier: 1,
    is_exclusive: false
  }
  showDialog.value = true
}

const openEditDialog = (group: AdminGroup) => {
  editingGroup.value = group
  formData.value = {
    name: group.name,
    platform: group.platform,
    description: group.description || '',
    rate_multiplier: group.rate_multiplier,
    is_exclusive: group.is_exclusive
  }
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
  editingGroup.value = null
}

const saveGroup = async () => {
  if (!formData.value.name) {
    alert('请输入分组名称')
    return
  }

  saving.value = true
  try {
    // 注意：这里需要根据实际 API 实现调整
    // 目前 adminAPI.groups 只有 list, getAll, toggleStatus
    // 实际的创建和更新接口需要补充
    alert('保存功能需要后端 API 支持')
    closeDialog()
    loadGroups()
  } catch (error) {
    console.error('保存分组失败:', error)
    alert('保存分组失败，请重试')
  } finally {
    saving.value = false
  }
}

const toggleStatus = async (group: AdminGroup) => {
  try {
    const newStatus = group.status === 'active' ? 'inactive' : 'active'
    await adminAPI.groups.toggleStatus(group.id, newStatus)
    group.status = newStatus
  } catch (error) {
    console.error('切换状态失败:', error)
    alert('切换状态失败，请重试')
  }
}

const confirmDelete = (group: AdminGroup) => {
  if (confirm(`确定要删除分组"${group.name}"吗？此操作不可恢复。`)) {
    deleteGroup(group)
  }
}

const deleteGroup = async (group: AdminGroup) => {
  try {
    // 注意：需要后端 API 支持
    alert('删除功能需要后端 API 支持')
    loadGroups()
  } catch (error) {
    console.error('删除分组失败:', error)
    alert('删除分组失败，请重试')
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadGroups()
})
</script>
