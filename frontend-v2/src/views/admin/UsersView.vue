<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
    <!-- 页面标题 -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-white">👥 用户管理</h1>
          <p class="mt-2 text-sm text-slate-400">管理系统用户和权限</p>
        </div>
        <button
          @click="loadUsers"
          :disabled="loading"
          class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800 disabled:opacity-50"
        >
          <span v-if="loading">🔄 加载中...</span>
          <span v-else>🔄 刷新</span>
        </button>
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
                <span class="text-sm font-medium text-emerald-400">${{ user.balance.toFixed(2) }}</span>
              </td>

              <!-- 注册时间 -->
              <td class="px-4 py-3">
                <span class="text-sm text-slate-400">{{ formatDateTime(user.created_at) }}</span>
              </td>

              <!-- 操作 -->
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="openUserDetail(user)"
                    class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800"
                    title="查看详情"
                  >
                    👁️ 详情
                  </button>
                  <button
                    @click="openRechargeDialog(user)"
                    class="rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 backdrop-blur-sm transition hover:border-emerald-400 hover:bg-emerald-500/20"
                    title="充值余额"
                  >
                    💰 充值
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

    <!-- 用户详情对话框 -->
    <div
      v-if="showDetailDialog && selectedUser"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      @click.self="closeDetailDialog"
    >
      <div class="w-full max-w-2xl rounded-xl border border-slate-700/50 bg-slate-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 class="mb-6 text-xl font-bold text-white">👤 用户详情</h2>

        <div class="space-y-4">
          <!-- 基本信息 -->
          <div class="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
            <h3 class="mb-3 text-sm font-semibold text-slate-300">基本信息</h3>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span class="text-slate-400">用户 ID:</span>
                <span class="ml-2 text-white">{{ selectedUser.id }}</span>
              </div>
              <div>
                <span class="text-slate-400">邮箱:</span>
                <span class="ml-2 text-white">{{ selectedUser.email }}</span>
              </div>
              <div>
                <span class="text-slate-400">用户名:</span>
                <span class="ml-2 text-white">{{ selectedUser.username || '-' }}</span>
              </div>
              <div>
                <span class="text-slate-400">角色:</span>
                <span class="ml-2 text-white">{{ selectedUser.role === 'admin' ? '管理员' : '用户' }}</span>
              </div>
              <div>
                <span class="text-slate-400">状态:</span>
                <span class="ml-2 text-white">{{ selectedUser.status === 'active' ? '活跃' : '禁用' }}</span>
              </div>
              <div>
                <span class="text-slate-400">余额:</span>
                <span class="ml-2 text-emerald-400 font-semibold">${{ selectedUser.balance.toFixed(2) }}</span>
              </div>
              <div>
                <span class="text-slate-400">并发数:</span>
                <span class="ml-2 text-white">{{ selectedUser.concurrency }}</span>
              </div>
              <div>
                <span class="text-slate-400">注册时间:</span>
                <span class="ml-2 text-white">{{ formatDateTime(selectedUser.created_at) }}</span>
              </div>
            </div>
          </div>

          <!-- 订阅信息 -->
          <div v-if="selectedUser.subscriptions && selectedUser.subscriptions.length > 0" class="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
            <h3 class="mb-3 text-sm font-semibold text-slate-300">订阅信息</h3>
            <div class="space-y-2">
              <div
                v-for="sub in selectedUser.subscriptions"
                :key="sub.id"
                class="rounded border border-slate-700/30 bg-slate-900/50 p-3 text-sm"
              >
                <div class="flex items-center justify-between">
                  <span class="text-white">分组 #{{ sub.group_id }}</span>
                  <span
                    :class="{
                      'text-green-400': sub.status === 'active',
                      'text-red-400': sub.status === 'expired',
                      'text-slate-400': sub.status === 'revoked'
                    }"
                  >
                    {{ sub.status === 'active' ? '✓ 活跃' : sub.status === 'expired' ? '✗ 已过期' : '✗ 已撤销' }}
                  </span>
                </div>
                <div class="mt-1 text-xs text-slate-400">
                  过期时间: {{ sub.expires_at ? formatDateTime(sub.expires_at) : '永久' }}
                </div>
              </div>
            </div>
          </div>

          <!-- 备注 -->
          <div v-if="selectedUser.notes" class="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
            <h3 class="mb-3 text-sm font-semibold text-slate-300">备注</h3>
            <p class="text-sm text-slate-300">{{ selectedUser.notes }}</p>
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <button
            @click="closeDetailDialog"
            class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800"
          >
            关闭
          </button>
        </div>
      </div>
    </div>

    <!-- 充值对话框 -->
    <div
      v-if="showRechargeDialog && selectedUser"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      @click.self="closeRechargeDialog"
    >
      <div class="w-full max-w-md rounded-xl border border-slate-700/50 bg-slate-900 p-6 shadow-2xl">
        <h2 class="mb-6 text-xl font-bold text-white">💰 充值余额</h2>

        <div class="mb-4">
          <div class="mb-2 text-sm text-slate-400">用户</div>
          <div class="text-white">{{ selectedUser.email }}</div>
          <div class="mt-1 text-sm text-slate-400">当前余额: <span class="text-emerald-400 font-semibold">${{ selectedUser.balance.toFixed(2) }}</span></div>
        </div>

        <div class="mb-4">
          <label class="mb-2 block text-sm font-medium text-slate-300">充值金额 *</label>
          <input
            v-model.number="rechargeAmount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
          />
          <div class="mt-2 text-xs text-slate-400">输入正数充值，负数扣款</div>
        </div>

        <div class="mb-6">
          <label class="mb-2 block text-sm font-medium text-slate-300">备注（可选）</label>
          <textarea
            v-model="rechargeRemark"
            rows="2"
            placeholder="充值原因或备注"
            class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
          ></textarea>
        </div>

        <div class="flex justify-end gap-3">
          <button
            @click="closeRechargeDialog"
            class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800"
          >
            取消
          </button>
          <button
            @click="handleRecharge"
            :disabled="recharging || !rechargeAmount"
            class="rounded-lg border border-gold-500/50 bg-gradient-to-r from-gold-500/20 to-gold-600/20 px-4 py-2 text-sm font-medium text-gold-400 backdrop-blur-sm transition hover:border-gold-400 hover:from-gold-500/30 hover:to-gold-600/30 disabled:opacity-50"
          >
            {{ recharging ? '处理中...' : '确认充值' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { adminAPI } from '@/api/admin'
import type { AdminUser } from '@/types'
import { showSuccess, showError } from '@/utils/toast'

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

// 用户详情对话框
const showDetailDialog = ref(false)
const selectedUser = ref<AdminUser | null>(null)

// 充值对话框
const showRechargeDialog = ref(false)
const rechargeAmount = ref<number>(0)
const rechargeRemark = ref('')
const recharging = ref(false)

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
        status: filters.status || undefined
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

// 打开用户详情
const openUserDetail = (user: AdminUser) => {
  selectedUser.value = user
  showDetailDialog.value = true
}

// 关闭用户详情
const closeDetailDialog = () => {
  showDetailDialog.value = false
  selectedUser.value = null
}

// 打开充值对话框
const openRechargeDialog = (user: AdminUser) => {
  selectedUser.value = user
  rechargeAmount.value = 0
  rechargeRemark.value = ''
  showRechargeDialog.value = true
}

// 关闭充值对话框
const closeRechargeDialog = () => {
  showRechargeDialog.value = false
  selectedUser.value = null
  rechargeAmount.value = 0
  rechargeRemark.value = ''
}

// 处理充值
const handleRecharge = async () => {
  if (!selectedUser.value || !rechargeAmount.value) return

  recharging.value = true
  try {
    await adminAPI.users.recharge(selectedUser.value.id, {
      amount: rechargeAmount.value,
      remark: rechargeRemark.value || undefined
    })

    const action = rechargeAmount.value > 0 ? '充值' : '扣款'
    showSuccess(`${action}成功`)

    closeRechargeDialog()
    await loadUsers()
  } catch (error: any) {
    showError(error.response?.data?.error || '充值失败')
  } finally {
    recharging.value = false
  }
}

onMounted(() => {
  loadUsers()
})
</script>
