<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
    <!-- 页面标题 -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-white">👥 用户管理</h1>
          <p class="mt-2 text-sm text-slate-400">管理系统用户和权限</p>
        </div>
        <div class="flex items-center gap-3">
          <button
            @click="loadUsers"
            :disabled="loading"
            class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800 disabled:opacity-50"
          >
            <span v-if="loading">🔄 加载中...</span>
            <span v-else>🔄 刷新</span>
          </button>
          <button
            @click="showCreateModal = true"
            class="rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-brand-500/30 transition hover:shadow-brand-500/50"
          >
            ➕ 创建用户
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
            placeholder="搜索邮箱或用户名..."
            class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2 pl-10 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            @input="handleSearch"
          />
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
        </div>

        <!-- 角色筛选 -->
        <select
          v-model="filters.role"
          @change="applyFilters"
          class="rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-2 text-sm text-white backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="">全部角色</option>
          <option value="admin">管理员</option>
          <option value="user">用户</option>
        </select>

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

    <!-- 用户列表 -->
    <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm overflow-hidden">
      <!-- 加载状态 -->
      <div v-if="loading && users.length === 0" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-brand-500"></div>
          <p class="text-sm text-slate-400">加载中...</p>
        </div>
      </div>

      <!-- 用户表格 -->
      <div v-else-if="users.length > 0" class="overflow-x-auto">
        <table class="w-full">
          <thead class="border-b border-slate-700/50 bg-slate-900/50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">用户</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">用户名</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">角色</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">状态</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">余额</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">订阅</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">并发数</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">注册时间</th>
              <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-700/30">
            <tr
              v-for="user in users"
              :key="user.id"
              class="transition hover:bg-slate-700/20"
            >
              <!-- 用户邮箱 -->
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white font-bold">
                    {{ user.email.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <div class="text-sm font-medium text-white">{{ user.email }}</div>
                    <div class="text-xs text-slate-400">ID: {{ user.id }}</div>
                  </div>
                </div>
              </td>

              <!-- 用户名 -->
              <td class="px-4 py-3">
                <span class="text-sm text-slate-300">{{ user.username || '-' }}</span>
              </td>

              <!-- 角色 -->
              <td class="px-4 py-3">
                <span
                  :class="[
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                    user.role === 'admin'
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'bg-slate-700/50 text-slate-300'
                  ]"
                >
                  {{ user.role === 'admin' ? '👑 管理员' : '👤 用户' }}
                </span>
              </td>

              <!-- 状态 -->
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <span
                    :class="[
                      'inline-block h-2 w-2 rounded-full',
                      user.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'
                    ]"
                  ></span>
                  <span class="text-sm text-slate-300">
                    {{ user.status === 'active' ? '活跃' : '禁用' }}
                  </span>
                </div>
              </td>

              <!-- 余额 -->
              <td class="px-4 py-3">
                <button
                  @click="handleBalanceHistory(user)"
                  class="text-sm font-medium text-emerald-400 underline decoration-dashed underline-offset-2 hover:text-emerald-300 transition"
                  title="查看余额历史"
                >
                  ${{ user.balance.toFixed(2) }}
                </button>
              </td>

              <!-- 订阅 -->
              <td class="px-4 py-3">
                <div v-if="user.subscriptions && user.subscriptions.length > 0" class="flex flex-wrap gap-1">
                  <span
                    v-for="sub in user.subscriptions.slice(0, 2)"
                    :key="sub.id"
                    :class="[
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                      sub.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-slate-700/50 text-slate-400'
                    ]"
                    :title="sub.group?.name"
                  >
                    {{ sub.group?.name || `#${sub.group_id}` }}
                  </span>
                  <span
                    v-if="user.subscriptions.length > 2"
                    class="inline-flex items-center rounded-full bg-slate-700/50 px-2 py-0.5 text-xs font-medium text-slate-400"
                  >
                    +{{ user.subscriptions.length - 2 }}
                  </span>
                </div>
                <span v-else class="text-xs text-slate-500">-</span>
              </td>

              <!-- 并发数 -->
              <td class="px-4 py-3">
                <span class="text-sm text-slate-300">{{ user.concurrency }}</span>
              </td>

              <!-- 注册时间 -->
              <td class="px-4 py-3">
                <span class="text-sm text-slate-400">{{ formatDateTime(user.created_at) }}</span>
              </td>

              <!-- 操作 -->
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="handleEdit(user)"
                    class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800"
                    title="编辑用户"
                  >
                    ✏️ 编辑
                  </button>
                  <button
                    @click="handleAllowedGroups(user)"
                    class="rounded-lg border border-purple-500/50 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-400 backdrop-blur-sm transition hover:border-purple-400 hover:bg-purple-500/20"
                    title="管理分组"
                  >
                    📁 分组
                  </button>
                  <button
                    @click="handleViewApiKeys(user)"
                    class="rounded-lg border border-blue-500/50 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-400 backdrop-blur-sm transition hover:border-blue-400 hover:bg-blue-500/20"
                    title="查看 API Keys"
                  >
                    🔑 密钥
                  </button>
                  <!-- 启用/禁用 -->
                  <button
                    v-if="user.role !== 'admin'"
                    @click="handleToggleStatus(user)"
                    :disabled="toggling === user.id"
                    :class="[
                      'rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:opacity-50',
                      user.status === 'active'
                        ? 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                    ]"
                    :title="user.status === 'active' ? '禁用用户' : '启用用户'"
                  >
                    {{ toggling === user.id ? '处理中...' : (user.status === 'active' ? '🚫 禁用' : '✅ 启用') }}
                  </button>
                  <!-- 删除 -->
                  <button
                    v-if="user.role !== 'admin'"
                    @click="handleDelete(user)"
                    class="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-500/30"
                    title="删除用户"
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
        <div class="mb-4 text-6xl">👤</div>
        <h3 class="mb-2 text-xl font-bold text-white">暂无用户</h3>
        <p class="text-sm text-slate-400">没有找到符合条件的用户</p>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="pagination.total > 0" class="mt-6 flex items-center justify-between rounded-xl border border-slate-700/50 bg-slate-800/40 px-4 py-3 backdrop-blur-sm">
      <div class="text-sm text-slate-400">
        共 {{ pagination.total }} 个用户，第 {{ pagination.page }} / {{ pagination.pages }} 页
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="handlePageChange(pagination.page - 1)"
          :disabled="pagination.page <= 1"
          class="rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-1.5 text-sm text-slate-300 transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          上一页
        </button>
        <button
          @click="handlePageChange(pagination.page + 1)"
          :disabled="pagination.page >= pagination.pages"
          class="rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-1.5 text-sm text-slate-300 transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          下一页
        </button>
      </div>
    </div>

    <!-- 模态框组件 -->
    <UserCreateModal
      :show="showCreateModal"
      @close="showCreateModal = false"
      @success="handleModalSuccess"
    />

    <UserEditModal
      :show="showEditModal"
      :user="editingUser"
      @close="closeEditModal"
      @success="handleModalSuccess"
    />

    <UserApiKeysModal
      :show="showApiKeysModal"
      :user="viewingUser"
      @close="closeApiKeysModal"
    />

    <!-- 余额历史弹窗 -->
    <UserBalanceHistoryModal
      :show="showBalanceHistoryModal"
      :user="balanceHistoryUser"
      @close="showBalanceHistoryModal = false"
      @deposit="handleDepositFromHistory"
      @refund="handleRefundFromHistory"
    />

    <!-- 充值弹窗 -->
    <UserDepositModal
      :show="showDepositModal"
      :user="depositUser"
      @close="showDepositModal = false"
      @success="handleDepositSuccess"
    />

    <!-- 退款弹窗 -->
    <UserRefundModal
      :show="showRefundModal"
      :user="refundUser"
      @close="showRefundModal = false"
      @success="handleRefundSuccess"
    />

    <!-- 分组管理弹窗 -->
    <UserAllowedGroupsModal
      :show="showAllowedGroupsModal"
      :user="allowedGroupsUser"
      @close="showAllowedGroupsModal = false"
      @success="loadUsers"
    />

    <!-- 删除确认对话框 -->
    <ConfirmDialog
      :show="showDeleteDialog"
      title="删除用户"
      :message="`确定要删除用户 ${deletingUser?.email} 吗？此操作不可撤销。`"
      confirm-text="删除"
      cancel-text="取消"
      type="danger"
      @confirm="confirmDelete"
      @cancel="showDeleteDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { adminAPI } from '@/api/admin'
import type { AdminUser } from '@/types'
import { showSuccess, showError } from '@/utils/toast'
import UserCreateModal from '@/components/admin/user/UserCreateModal.vue'
import UserEditModal from '@/components/admin/user/UserEditModal.vue'
import UserApiKeysModal from '@/components/admin/user/UserApiKeysModal.vue'
import UserBalanceHistoryModal from '@/components/admin/user/UserBalanceHistoryModal.vue'
import UserDepositModal from '@/components/admin/user/UserDepositModal.vue'
import UserRefundModal from '@/components/admin/user/UserRefundModal.vue'
import UserAllowedGroupsModal from '@/components/admin/user/UserAllowedGroupsModal.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const users = ref<AdminUser[]>([])
const loading = ref(false)
const toggling = ref<number | null>(null)
const searchQuery = ref('')
const filters = reactive({
  role: '' as '' | 'admin' | 'user',
  status: '' as '' | 'active' | 'disabled'
})

const pagination = reactive({
  page: 1,
  page_size: 20,
  total: 0,
  pages: 0
})

// 模态框状态
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showApiKeysModal = ref(false)
const showBalanceHistoryModal = ref(false)
const showDepositModal = ref(false)
const showRefundModal = ref(false)
const showAllowedGroupsModal = ref(false)
const showDeleteDialog = ref(false)

// 选中的用户
const editingUser = ref<AdminUser | null>(null)
const viewingUser = ref<AdminUser | null>(null)
const balanceHistoryUser = ref<AdminUser | null>(null)
const depositUser = ref<AdminUser | null>(null)
const refundUser = ref<AdminUser | null>(null)
const allowedGroupsUser = ref<AdminUser | null>(null)
const deletingUser = ref<AdminUser | null>(null)

// 格式化日期时间
const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 加载用户列表
const loadUsers = async () => {
  loading.value = true
  try {
    const response = await adminAPI.users.list(
      pagination.page,
      pagination.page_size,
      {
        search: searchQuery.value || undefined,
        role: filters.role || undefined,
        status: filters.status || undefined,
        include_subscriptions: true
      }
    )
    users.value = response.items
    pagination.total = response.total
    pagination.pages = response.pages
  } catch (error: any) {
    showError(error.response?.data?.error || '加载用户列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理（防抖）
let searchTimeout: number | null = null
const handleSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = window.setTimeout(() => {
    pagination.page = 1
    loadUsers()
  }, 500)
}

// 应用筛选
const applyFilters = () => {
  pagination.page = 1
  loadUsers()
}

// 分页处理
const handlePageChange = (page: number) => {
  pagination.page = page
  loadUsers()
}

// 编辑用户
const handleEdit = (user: AdminUser) => {
  editingUser.value = user
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingUser.value = null
}

// 查看 API Keys
const handleViewApiKeys = (user: AdminUser) => {
  viewingUser.value = user
  showApiKeysModal.value = true
}

const closeApiKeysModal = () => {
  showApiKeysModal.value = false
  viewingUser.value = null
}

// 余额历史
const handleBalanceHistory = (user: AdminUser) => {
  balanceHistoryUser.value = user
  showBalanceHistoryModal.value = true
}

const closeBalanceHistoryModal = () => {
  showBalanceHistoryModal.value = false
  balanceHistoryUser.value = null
}

// 分组管理
const handleAllowedGroups = (user: AdminUser) => {
  allowedGroupsUser.value = user
  showAllowedGroupsModal.value = true
}

const closeAllowedGroupsModal = () => {
  showAllowedGroupsModal.value = false
  allowedGroupsUser.value = null
}

// 充值成功后的回调
const handleDepositSuccess = async () => {
  await loadUsers()
  // 如果余额历史弹窗是打开的，刷新它并更新用户余额
  if (showBalanceHistoryModal.value && balanceHistoryUser.value) {
    const userId = balanceHistoryUser.value.id
    showBalanceHistoryModal.value = false
    setTimeout(() => {
      // 从刷新后的用户列表中找到最新的用户数据
      const updatedUser = users.value.find(u => u.id === userId)
      if (updatedUser) {
        balanceHistoryUser.value = updatedUser
      }
      showBalanceHistoryModal.value = true
    }, 100)
  }
}

// 退款成功后的回调
const handleRefundSuccess = async () => {
  await loadUsers()
  // 如果余额历史弹窗是打开的，刷新它并更新用户余额
  if (showBalanceHistoryModal.value && balanceHistoryUser.value) {
    const userId = balanceHistoryUser.value.id
    showBalanceHistoryModal.value = false
    setTimeout(() => {
      // 从刷新后的用户列表中找到最新的用户数据
      const updatedUser = users.value.find(u => u.id === userId)
      if (updatedUser) {
        balanceHistoryUser.value = updatedUser
      }
      showBalanceHistoryModal.value = true
    }, 100)
  }
}

// 从余额历史弹窗触发充值
const handleDepositFromHistory = () => {
  if (balanceHistoryUser.value) {
    depositUser.value = balanceHistoryUser.value
    showDepositModal.value = true
  }
}

// 从余额历史弹窗触发退款
const handleRefundFromHistory = () => {
  if (balanceHistoryUser.value) {
    refundUser.value = balanceHistoryUser.value
    showRefundModal.value = true
  }
}

// 切换用户状态
const handleToggleStatus = async (user: AdminUser) => {
  toggling.value = user.id
  try {
    const newStatus = user.status === 'active' ? 'disabled' : 'active'
    await adminAPI.users.toggleStatus(user.id, newStatus)
    showSuccess(`用户已${newStatus === 'active' ? '启用' : '禁用'}`)
    await loadUsers()
  } catch (error: any) {
    showError(error.response?.data?.error || '切换用户状态失败')
  } finally {
    toggling.value = null
  }
}

// 删除用户
const handleDelete = (user: AdminUser) => {
  deletingUser.value = user
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!deletingUser.value) return

  try {
    await adminAPI.users.delete(deletingUser.value.id)
    showSuccess('用户已删除')
    showDeleteDialog.value = false
    deletingUser.value = null
    await loadUsers()
  } catch (error: any) {
    showError(error.response?.data?.error || '删除用户失败')
  }
}

// 模态框成功回调
const handleModalSuccess = () => {
  loadUsers()
}

onMounted(() => {
  loadUsers()
})
</script>
