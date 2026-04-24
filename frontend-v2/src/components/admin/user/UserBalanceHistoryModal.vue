<template>
  <div
    v-if="show && user"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    @click.self="handleClose"
  >
    <div class="w-full max-w-4xl rounded-xl border border-slate-700/50 bg-slate-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-white">💰 余额历史 - {{ user.email }}</h2>
          <p class="mt-1 text-sm text-slate-400">当前余额: <span class="text-emerald-400 font-semibold">${{ user.balance.toFixed(2) }}</span></p>
        </div>
        <div class="flex gap-2">
          <button
            @click="handleDeposit"
            class="rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-400 backdrop-blur-sm transition hover:border-emerald-400 hover:bg-emerald-500/20"
          >
            💰 充值
          </button>
          <button
            @click="handleWithdraw"
            class="rounded-lg border border-orange-500/50 bg-orange-500/10 px-3 py-1.5 text-sm font-medium text-orange-400 backdrop-blur-sm transition hover:border-orange-400 hover:bg-orange-500/20"
          >
            💸 扣款
          </button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-brand-500"></div>
      </div>

      <!-- 历史记录列表 -->
      <div v-else-if="history.length > 0" class="space-y-2">
        <div
          v-for="record in history"
          :key="record.id"
          class="rounded-lg border border-slate-700/50 bg-slate-800/40 p-4"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <span
                  :class="[
                    'text-lg font-bold',
                    record.amount > 0 ? 'text-emerald-400' : 'text-red-400'
                  ]"
                >
                  {{ record.amount > 0 ? '+' : '' }}${{ record.amount.toFixed(2) }}
                </span>
                <span class="rounded-full bg-slate-700/50 px-2 py-0.5 text-xs font-medium text-slate-300">
                  {{ getOperationType(record.operation_type) }}
                </span>
              </div>
              <div class="space-y-1 text-xs text-slate-400">
                <div v-if="record.remark">
                  备注: {{ record.remark }}
                </div>
                <div>
                  余额变化: ${{ record.balance_before.toFixed(2) }} → ${{ record.balance_after.toFixed(2) }}
                </div>
                <div>
                  操作时间: {{ formatDateTime(record.created_at) }}
                </div>
                <div v-if="record.operator_id">
                  操作人: {{ record.operator_email || `ID: ${record.operator_id}` }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="flex flex-col items-center justify-center py-12">
        <div class="mb-4 text-6xl">📊</div>
        <h3 class="mb-2 text-lg font-bold text-white">暂无历史记录</h3>
        <p class="text-sm text-slate-400">该用户还没有余额变动记录</p>
      </div>

      <!-- 分页 -->
      <div v-if="pagination.total > 0" class="mt-6 flex items-center justify-between border-t border-slate-700/50 pt-4">
        <div class="text-sm text-slate-400">
          共 {{ pagination.total }} 条记录
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="handlePageChange(pagination.page - 1)"
            :disabled="pagination.page <= 1"
            class="rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-1.5 text-sm text-slate-300 transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一页
          </button>
          <span class="text-sm text-slate-400">
            {{ pagination.page }} / {{ pagination.pages }}
          </span>
          <button
            @click="handlePageChange(pagination.page + 1)"
            :disabled="pagination.page >= pagination.pages"
            class="rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-1.5 text-sm text-slate-300 transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </div>
      </div>

      <!-- 关闭按钮 -->
      <div class="mt-6 flex justify-end border-t border-slate-700/50 pt-4">
        <button
          @click="handleClose"
          class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800"
        >
          关闭
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, reactive } from 'vue'
import { adminAPI } from '@/api/admin'
import type { AdminUser } from '@/types'
import { showError } from '@/utils/toast'

interface BalanceHistory {
  id: number
  user_id: number
  amount: number
  balance_before: number
  balance_after: number
  operation_type: string
  remark: string | null
  operator_id: number | null
  operator_email: string | null
  created_at: string
}

const props = defineProps<{
  show: boolean
  user: AdminUser | null
}>()

const emit = defineEmits<{
  close: []
  deposit: []
  withdraw: []
}>()

const loading = ref(false)
const history = ref<BalanceHistory[]>([])
const pagination = reactive({
  page: 1,
  page_size: 10,
  total: 0,
  pages: 0
})

watch(() => props.show, (newVal) => {
  if (newVal && props.user) {
    pagination.page = 1
    loadHistory()
  }
})

const loadHistory = async () => {
  if (!props.user) return

  loading.value = true
  try {
    const response = await adminAPI.users.getBalanceHistory(
      props.user.id,
      pagination.page,
      pagination.page_size
    )
    history.value = response.items
    pagination.total = response.total
    pagination.pages = response.pages
  } catch (error: any) {
    showError(error.response?.data?.error || '加载余额历史失败')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  pagination.page = page
  loadHistory()
}

const getOperationType = (type: string): string => {
  const types: Record<string, string> = {
    'admin_add': '管理员充值',
    'admin_subtract': '管理员扣款',
    'payment': '支付充值',
    'usage': '使用扣费',
    'refund': '退款',
    'system': '系统调整'
  }
  return types[type] || type
}

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

const handleDeposit = () => {
  emit('deposit')
}

const handleWithdraw = () => {
  emit('withdraw')
}

const handleClose = () => {
  emit('close')
}
</script>
