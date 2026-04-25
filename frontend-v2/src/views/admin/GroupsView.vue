<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
    <!-- 页面标题 -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-white">📦 分组管理</h1>
          <p class="mt-2 text-sm text-slate-400">管理模型分组、账号分配和访问权限</p>
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
            @click="openSortModal"
            class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800"
          >
            🔀 排序
          </button>
          <button
            @click="openCreateModal"
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
          <option value="" class="bg-slate-800 text-white">全部平台</option>
          <option value="openai" class="bg-slate-800 text-white">OpenAI</option>
          <option value="anthropic" class="bg-slate-800 text-white">Anthropic</option>
          <option value="gemini" class="bg-slate-800 text-white">Gemini</option>
          <option value="antigravity" class="bg-slate-800 text-white">Antigravity</option>
        </select>

        <!-- 状态筛选 -->
        <select
          v-model="filters.status"
          @change="applyFilters"
          class="rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-2 text-sm text-white backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="" class="bg-slate-800 text-white">全部状态</option>
          <option value="active" class="bg-slate-800 text-white">活跃</option>
          <option value="inactive" class="bg-slate-800 text-white">禁用</option>
        </select>

        <!-- 独占筛选 -->
        <select
          v-model="filters.is_exclusive"
          @change="applyFilters"
          class="rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-2 text-sm text-white backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="" class="bg-slate-800 text-white">全部分组</option>
          <option value="true" class="bg-slate-800 text-white">独占分组</option>
          <option value="false" class="bg-slate-800 text-white">公共分组</option>
        </select>

        <!-- 订阅类型筛选 -->
        <select
          v-model="filters.subscription_type"
          @change="applyFilters"
          class="rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-2 text-sm text-white backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="" class="bg-slate-800 text-white">全部类型</option>
          <option value="standard" class="bg-slate-800 text-white">标准计费</option>
          <option value="subscription" class="bg-slate-800 text-white">订阅制</option>
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
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">类型</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">状态</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">独占</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">账户数</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">倍率</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">用量</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">订阅限额</th>
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

              <!-- 订阅类型 -->
              <td class="px-4 py-3">
                <span
                  :class="[
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                    group.subscription_type === 'subscription'
                      ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                      : 'bg-slate-700/50 text-slate-300'
                  ]"
                >
                  {{ group.subscription_type === 'subscription' ? '订阅制' : '标准' }}
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

              <!-- 用量 -->
              <td class="px-4 py-3">
                <div v-if="usageLoading" class="text-xs text-slate-500">加载中...</div>
                <div v-else class="space-y-0.5 text-xs">
                  <div class="text-slate-400">
                    <span class="text-slate-500">今日:</span>
                    <span class="ml-1 font-medium text-slate-300">${{ formatCost(usageMap.get(group.id)?.today_cost ?? 0) }}</span>
                  </div>
                  <div class="text-slate-400">
                    <span class="text-slate-500">总计:</span>
                    <span class="ml-1 font-medium text-slate-300">${{ formatCost(usageMap.get(group.id)?.total_cost ?? 0) }}</span>
                  </div>
                </div>
              </td>

              <!-- 订阅限额 -->
              <td class="px-4 py-3">
                <div v-if="group.subscription_type === 'subscription'" class="text-xs text-slate-400">
                  <div v-if="group.daily_limit_usd">日: ${{ group.daily_limit_usd }}</div>
                  <div v-if="group.weekly_limit_usd">周: ${{ group.weekly_limit_usd }}</div>
                  <div v-if="group.monthly_limit_usd">月: ${{ group.monthly_limit_usd }}</div>
                  <div v-if="!group.daily_limit_usd && !group.weekly_limit_usd && !group.monthly_limit_usd" class="text-slate-500">
                    无限制
                  </div>
                </div>
                <span v-else class="text-xs text-slate-500">-</span>
              </td>

              <!-- 创建时间 -->
              <td class="px-4 py-3">
                <div class="text-sm text-slate-400">{{ formatDate(group.created_at) }}</div>
              </td>

              <!-- 操作 -->
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="openRateMultipliersModal(group)"
                    class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-purple-400 transition hover:border-purple-500/50 hover:bg-purple-500/10"
                    title="费率倍率"
                  >
                    💰 倍率
                  </button>
                  <button
                    @click="openEditModal(group)"
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
    <GroupFormModal
      :show="showFormModal"
      :group="editingGroup"
      :available-groups="groups"
      @close="closeFormModal"
      @submit="handleFormSubmit"
    />

    <!-- 费率倍率管理弹窗 -->
    <GroupRateMultipliersModal
      :show="showRateMultipliersModal"
      :group="rateMultipliersGroup"
      @close="closeRateMultipliersModal"
      @save="handleSaveRateMultipliers"
    />

    <!-- 排序弹窗 -->
    <GroupSortModal
      :show="showSortModal"
      :groups="groups"
      @close="closeSortModal"
      @save="handleSaveSort"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { adminAPI } from '@/api'
import type { AdminGroup, GroupPlatform } from '@/types'
import GroupFormModal from '@/components/admin/group/GroupFormModal.vue'
import GroupRateMultipliersModal from '@/components/admin/group/GroupRateMultipliersModal.vue'
import GroupSortModal from '@/components/admin/group/GroupSortModal.vue'
import { showSuccess, showError, confirm } from '@/utils/toast'

const loading = ref(false)
const groups = ref<AdminGroup[]>([])
const searchQuery = ref('')
const filters = reactive<{
  platform?: GroupPlatform | ''
  status?: 'active' | 'inactive' | ''
  is_exclusive?: string
  subscription_type?: string
}>({
  platform: '',
  status: '',
  is_exclusive: '',
  subscription_type: ''
})

const usageLoading = ref(false)
const usageMap = ref<Map<number, { today_cost: number; total_cost: number }>>(new Map())

const pagination = reactive({
  page: 1,
  page_size: 20,
  total: 0,
  pages: 0
})

const showFormModal = ref(false)
const showRateMultipliersModal = ref(false)
const showSortModal = ref(false)
const editingGroup = ref<AdminGroup | null>(null)
const rateMultipliersGroup = ref<AdminGroup | null>(null)

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
    if (filters.platform) filterParams.platform = filters.platform
    if (filters.status) filterParams.status = filters.status
    if (filters.is_exclusive) filterParams.is_exclusive = filters.is_exclusive === 'true'
    if (filters.subscription_type) filterParams.subscription_type = filters.subscription_type
    if (searchQuery.value) filterParams.search = searchQuery.value

    const response = await adminAPI.groups.list(
      pagination.page,
      pagination.page_size,
      filterParams
    )

    groups.value = response.items
    pagination.page = response.page
    pagination.page_size = response.page_size
    pagination.total = response.total
    pagination.pages = response.pages

    // 加载用量数据
    loadGroupsUsage()
  } catch (error: any) {
    console.error('加载分组失败:', error)
    showError(error.response?.data?.message || '加载分组失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.page = 1
    loadGroups()
  }, 300)
}

const applyFilters = () => {
  pagination.page = 1
  loadGroups()
}

const goToPage = (page: number) => {
  if (page < 1 || page > pagination.pages) return
  pagination.page = page
  loadGroups()
}

const openCreateModal = () => {
  editingGroup.value = null
  showFormModal.value = true
}

const openEditModal = (group: AdminGroup) => {
  editingGroup.value = group
  showFormModal.value = true
}

const closeFormModal = () => {
  showFormModal.value = false
  editingGroup.value = null
}

const handleFormSubmit = async (data: any) => {
  try {
    if (editingGroup.value) {
      await adminAPI.groups.update(editingGroup.value.id, data)
      showSuccess('更新成功')
    } else {
      await adminAPI.groups.create(data)
      showSuccess('创建成功')
    }
    closeFormModal()
    loadGroups()
  } catch (error: any) {
    console.error('保存分组失败:', error)
    showError(error.response?.data?.message || '保存分组失败')
  }
}

const toggleStatus = async (group: AdminGroup) => {
  try {
    const newStatus = group.status === 'active' ? 'inactive' : 'active'
    await adminAPI.groups.toggleStatus(group.id, newStatus)
    group.status = newStatus
    showSuccess('状态切换成功')
  } catch (error: any) {
    console.error('切换状态失败:', error)
    showError(error.response?.data?.message || '切换状态失败')
  }
}

const confirmDelete = async (group: AdminGroup) => {
  const confirmed = await confirm({
    type: 'danger',
    title: '确认删除',
    message: `确定要删除分组"${group.name}"吗？此操作不可恢复。`,
    confirmText: '删除',
    cancelText: '取消'
  })

  if (confirmed) {
    deleteGroup(group)
  }
}

const deleteGroup = async (group: AdminGroup) => {
  try {
    await adminAPI.groups.delete(group.id)
    showSuccess('删除成功')
    loadGroups()
  } catch (error: any) {
    console.error('删除分组失败:', error)
    showError(error.response?.data?.message || '删除分组失败')
  }
}

const openRateMultipliersModal = (group: AdminGroup) => {
  rateMultipliersGroup.value = group
  showRateMultipliersModal.value = true
}

const closeRateMultipliersModal = () => {
  showRateMultipliersModal.value = false
  rateMultipliersGroup.value = null
}

const handleSaveRateMultipliers = async (data: any) => {
  try {
    await adminAPI.groups.batchSetGroupRateMultipliers(data.groupId, data.entries)
    showSuccess('费率倍率保存成功')
    closeRateMultipliersModal()
  } catch (error: any) {
    console.error('保存费率倍率失败:', error)
    showError(error.response?.data?.message || '保存费率倍率失败')
  }
}

const openSortModal = () => {
  showSortModal.value = true
}

const closeSortModal = () => {
  showSortModal.value = false
}

const handleSaveSort = async (sortedIds: number[]) => {
  try {
    const updates = sortedIds.map((id, index) => ({ id, sort_order: index + 1 }))
    await adminAPI.groups.updateSortOrder(updates)
    showSuccess('排序保存成功')
    closeSortModal()
    loadGroups()
  } catch (error: any) {
    console.error('保存排序失败:', error)
    showError(error.response?.data?.message || '保存排序失败')
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

const formatCost = (cost: number) => {
  return cost.toFixed(4)
}

const loadGroupsUsage = async () => {
  if (groups.value.length === 0) return

  usageLoading.value = true
  try {
    const usageData = await adminAPI.groups.getUsageSummary()
    const newMap = new Map<number, { today_cost: number; total_cost: number }>()
    usageData.forEach(item => {
      newMap.set(item.group_id, {
        today_cost: item.today_cost,
        total_cost: item.total_cost
      })
    })
    usageMap.value = newMap
  } catch (error: any) {
    console.error('加载用量失败:', error)
    // 静默失败，不影响主要功能
  } finally {
    usageLoading.value = false
  }
}

onMounted(() => {
  loadGroups()
})
</script>
