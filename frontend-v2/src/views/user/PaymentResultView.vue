<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
    <div class="w-full max-w-md space-y-6">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="h-12 w-12 animate-spin rounded-full border-4 border-brand-500/20 border-t-brand-500"></div>
      </div>

      <template v-else>
        <!-- 状态图标 -->
        <div class="text-center">
          <!-- 成功 -->
          <div v-if="isSuccess" class="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <svg class="h-12 w-12 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <!-- 处理中 -->
          <div v-else-if="isPending" class="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
            <div class="h-12 w-12 animate-spin rounded-full border-4 border-amber-500/30 border-t-amber-400"></div>
          </div>
          <!-- 失败 -->
          <div v-else class="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-red-500/30 bg-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
            <svg class="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <h2 class="mt-6 text-3xl font-bold text-white">{{ statusTitle }}</h2>
          <p v-if="isPending" class="mt-3 text-sm text-slate-400">支付处理中，请稍候...</p>
        </div>

        <!-- 订单信息 -->
        <div v-if="order" class="rounded-xl border border-slate-700/50 bg-slate-800/40 p-6 backdrop-blur-sm">
          <div class="space-y-4 text-sm">
            <div class="flex justify-between">
              <span class="text-slate-400">订单ID</span>
              <span class="font-medium text-white">#{{ order.id }}</span>
            </div>
            <div v-if="order.out_trade_no" class="flex justify-between">
              <span class="text-slate-400">订单号</span>
              <span class="font-medium text-white">{{ order.out_trade_no }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">充值金额</span>
              <span class="font-medium text-white">¥{{ baseAmount.toFixed(2) }}</span>
            </div>
            <div v-if="order.fee_rate > 0" class="flex justify-between">
              <span class="text-slate-400">手续费 ({{ order.fee_rate }}%)</span>
              <span class="font-medium text-white">¥{{ feeAmount.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between border-t border-slate-700/50 pt-4">
              <span class="text-slate-400">实付金额</span>
              <span class="text-xl font-bold text-brand-400">¥{{ order.pay_amount.toFixed(2) }}</span>
            </div>
            <div v-if="order.amount !== order.pay_amount" class="flex justify-between">
              <span class="text-slate-400">到账金额</span>
              <span class="font-medium text-white">{{ order.order_type === 'balance' ? '$' : '¥' }}{{ order.amount.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">支付方式</span>
              <span class="font-medium text-white">{{ getPaymentMethodName(order.payment_type) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">订单状态</span>
              <span
                class="rounded-full px-3 py-1 text-xs font-medium"
                :class="getStatusClass(order.status)"
              >
                {{ getStatusText(order.status) }}
              </span>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex gap-3">
          <button
            @click="$router.push('/subscriptions')"
            class="flex-1 rounded-lg border border-slate-700/50 bg-slate-900/50 py-3 text-sm font-bold text-slate-300 transition hover:border-slate-600 hover:bg-slate-800/60"
          >
            返回充值
          </button>
          <button
            @click="$router.push('/orders')"
            class="flex-1 rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/30 transition hover:shadow-brand-500/50"
          >
            查看订单
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { paymentAPI } from '@/api/payment'
import type { PaymentOrder } from '@/types/payment'

const route = useRoute()

const order = ref<PaymentOrder | null>(null)
const loading = ref(true)

const SUCCESS_STATUSES = new Set(['COMPLETED', 'PAID', 'RECHARGING'])
const PENDING_STATUSES = new Set(['PENDING', 'CREATED', 'WAITING', 'PROCESSING'])
const STATUS_REFRESH_INTERVAL_MS = 2000
const STATUS_REFRESH_MAX_ATTEMPTS = 15

let statusRefreshTimer: ReturnType<typeof setTimeout> | null = null
const refreshAttempts = ref(0)

const baseAmount = computed(() => {
  if (!order.value || order.value.fee_rate <= 0) return order.value?.pay_amount ?? 0
  return Math.round((order.value.pay_amount / (1 + order.value.fee_rate / 100)) * 100) / 100
})

const feeAmount = computed(() => {
  if (!order.value || order.value.fee_rate <= 0) return 0
  return Math.round((order.value.pay_amount - baseAmount.value) * 100) / 100
})

const isSuccess = computed(() => {
  return isSuccessStatus(order.value?.status)
})

const isPending = computed(() => {
  return isPendingStatus(order.value?.status)
})

const statusTitle = computed(() => {
  if (isSuccess.value) return '支付成功'
  if (isPending.value) return '处理中'
  return '支付失败'
})

function normalizeOrderStatus(status: string | null | undefined): string {
  return String(status || '').trim().toUpperCase()
}

function isSuccessStatus(status: string | null | undefined): boolean {
  return SUCCESS_STATUSES.has(normalizeOrderStatus(status))
}

function isPendingStatus(status: string | null | undefined): boolean {
  return PENDING_STATUSES.has(normalizeOrderStatus(status))
}

function getPaymentMethodName(type: string): string {
  const methods: Record<string, string> = {
    alipay: '支付宝',
    wxpay: '微信支付',
    stripe: 'Stripe',
    balance: '余额支付'
  }
  return methods[type] || type
}

function getStatusClass(status: string): string {
  if (isSuccessStatus(status)) return 'bg-emerald-500/20 text-emerald-400'
  if (isPendingStatus(status)) return 'bg-amber-500/20 text-amber-400'
  return 'bg-red-500/20 text-red-400'
}

function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    COMPLETED: '已完成',
    PAID: '已支付',
    PENDING: '待支付',
    PROCESSING: '处理中',
    FAILED: '失败',
    CANCELLED: '已取消',
    EXPIRED: '已过期'
  }
  return statusMap[normalizeOrderStatus(status)] || status
}

function clearStatusRefreshTimer(): void {
  if (statusRefreshTimer !== null) {
    clearTimeout(statusRefreshTimer)
    statusRefreshTimer = null
  }
}

function scheduleStatusRefresh(): void {
  clearStatusRefreshTimer()
  if (!isPending.value || refreshAttempts.value >= STATUS_REFRESH_MAX_ATTEMPTS) {
    return
  }

  statusRefreshTimer = setTimeout(async () => {
    refreshAttempts.value += 1
    const orderId = Number(route.query.order_id)
    if (orderId) {
      try {
        const res = await paymentAPI.getOrder(orderId)
        order.value = res.data
      } catch (err) {
        console.error('Failed to refresh order status:', err)
      }
    }

    if (isPendingStatus(order.value?.status)) {
      scheduleStatusRefresh()
    }
  }, STATUS_REFRESH_INTERVAL_MS)
}

onMounted(async () => {
  const orderId = Number(route.query.order_id)
  if (orderId) {
    try {
      const res = await paymentAPI.getOrder(orderId)
      order.value = res.data

      if (isPendingStatus(order.value?.status)) {
        scheduleStatusRefresh()
      }
    } catch (err) {
      console.error('Failed to load order:', err)
    }
  }
  loading.value = false
})

onBeforeUnmount(() => {
  clearStatusRefreshTimer()
})
</script>
