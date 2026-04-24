<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
    <!-- 页面标题区 -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-white">我的订单</h1>
          <p class="mt-2 text-sm text-slate-400">查看和管理你的充值与订阅订单</p>
        </div>
        <div class="flex gap-3">
          <button
            @click="loadOrders"
            :disabled="loading"
            class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800 disabled:opacity-50"
          >
            🔄 刷新
          </button>
          <button
            @click="goToRecharge"
            class="rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-2 text-sm font-bold text-white shadow-lg shadow-brand-500/30 transition hover:shadow-brand-500/50"
          >
            💰 去充值
          </button>
        </div>
      </div>
    </div>

    <!-- 筛选区 -->
    <div class="mb-6 rounded-xl border border-slate-700/50 bg-slate-800/40 p-5 backdrop-blur-sm">
      <div class="mb-4 flex items-center gap-2">
        <span class="text-lg">🔍</span>
        <h3 class="text-lg font-bold text-white">筛选条件</h3>
      </div>
      <div class="flex flex-wrap gap-3">
        <select
          v-model="filterType"
          class="rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2.5 text-sm text-white backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          @change="loadOrders"
        >
          <option value="">全部类型</option>
          <option value="balance">充值订单</option>
          <option value="subscription">订阅订单</option>
        </select>
        <select
          v-model="filterStatus"
          class="rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2.5 text-sm text-white backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          @change="loadOrders"
        >
          <option value="">全部状态</option>
          <option value="PENDING">待支付</option>
          <option value="PAID">已支付</option>
          <option value="COMPLETED">已完成</option>
          <option value="CANCELLED">已取消</option>
          <option value="EXPIRED">已过期</option>
          <option value="FAILED">支付失败</option>
        </select>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading && orders.length === 0" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-brand-500/20 border-t-brand-500"></div>
        <p class="text-sm text-slate-400">加载订单数据...</p>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="orders.length === 0" class="rounded-xl border border-slate-700/50 bg-slate-800/40 p-12 text-center backdrop-blur-sm">
      <div class="mb-4 text-6xl">📦</div>
      <h3 class="mb-2 text-xl font-bold text-white">暂无订单</h3>
      <p class="mb-6 text-sm text-slate-400">你还没有任何订单记录</p>
      <button
        @click="goToRecharge"
        class="rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-500/30 transition hover:shadow-brand-500/50"
      >
        立即充值
      </button>
    </div>

    <!-- 订单列表 -->
    <div v-else class="space-y-4">
      <div
        v-for="order in orders"
        :key="order.id"
        class="group rounded-xl border border-slate-700/50 bg-slate-800/40 p-6 backdrop-blur-sm transition hover:border-slate-600"
      >
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <!-- 左侧：订单信息 -->
          <div class="flex-1 space-y-3">
            <div class="flex items-center gap-3">
              <span class="text-2xl">{{ getOrderTypeIcon(order.order_type) }}</span>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-mono text-sm text-slate-400">订单号: #{{ order.id }}</span>
                  <span :class="getStatusClass(order.status)" class="rounded-full px-2.5 py-0.5 text-xs font-bold">
                    {{ getStatusText(order.status) }}
                  </span>
                </div>
                <div class="mt-1 text-lg font-bold text-white">
                  {{ getOrderTypeText(order.order_type) }}
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
              <div>
                <div class="text-slate-500">订单金额</div>
                <div class="mt-1 font-bold text-white">${{ order.amount.toFixed(2) }}</div>
              </div>
              <div>
                <div class="text-slate-500">实付金额</div>
                <div class="mt-1 font-bold text-brand-400">${{ order.pay_amount.toFixed(2) }}</div>
              </div>
              <div>
                <div class="text-slate-500">支付方式</div>
                <div class="mt-1 font-medium text-white">{{ getPaymentTypeText(order.payment_type) }}</div>
              </div>
              <div>
                <div class="text-slate-500">创建时间</div>
                <div class="mt-1 font-medium text-white">{{ formatDateTime(order.created_at) }}</div>
              </div>
            </div>

            <!-- 过期时间（待支付订单） -->
            <div v-if="order.status === 'PENDING' && order.expires_at" class="text-xs text-slate-400">
              ⏰ 过期时间: {{ formatDateTime(order.expires_at) }}
            </div>
          </div>

          <!-- 右侧：操作按钮 -->
          <div class="flex gap-2 lg:flex-col">
            <button
              v-if="order.status === 'PENDING'"
              @click="handleContinuePay(order)"
              class="flex-1 rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-brand-500/30 transition hover:shadow-brand-500/50 lg:flex-none lg:whitespace-nowrap"
            >
              💳 继续支付
            </button>
            <button
              v-if="order.status === 'PENDING'"
              @click="handleCancel(order.id)"
              class="flex-1 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-400 transition hover:bg-red-500/20 lg:flex-none lg:whitespace-nowrap"
            >
              ❌ 取消订单
            </button>
            <button
              @click="showOrderDetail(order)"
              class="flex-1 rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 lg:flex-none lg:whitespace-nowrap"
            >
              📋 查看详情
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="total > pageSize" class="mt-6 flex items-center justify-center gap-2">
      <button
        @click="changePage(page - 1)"
        :disabled="page <= 1"
        class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800 disabled:opacity-50"
      >
        上一页
      </button>
      <div class="flex items-center gap-1">
        <span class="text-sm text-slate-400">第</span>
        <span class="font-bold text-white">{{ page }}</span>
        <span class="text-sm text-slate-400">/ {{ totalPages }} 页</span>
      </div>
      <button
        @click="changePage(page + 1)"
        :disabled="page >= totalPages"
        class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800 disabled:opacity-50"
      >
        下一页
      </button>
    </div>

    <!-- 订单详情弹窗 -->
    <div
      v-if="selectedOrder"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      @click.self="selectedOrder = null"
    >
      <div class="w-full max-w-2xl rounded-2xl border border-slate-700/50 bg-slate-900 p-6 shadow-2xl">
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-2xl font-bold text-white">订单详情</h2>
          <button
            @click="selectedOrder = null"
            class="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4 rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">
            <div>
              <div class="text-sm text-slate-500">订单号</div>
              <div class="mt-1 font-mono text-white">#{{ selectedOrder.id }}</div>
            </div>
            <div>
              <div class="text-sm text-slate-500">订单状态</div>
              <div class="mt-1">
                <span :class="getStatusClass(selectedOrder.status)" class="rounded-full px-2.5 py-0.5 text-xs font-bold">
                  {{ getStatusText(selectedOrder.status) }}
                </span>
              </div>
            </div>
            <div>
              <div class="text-sm text-slate-500">订单类型</div>
              <div class="mt-1 font-medium text-white">{{ getOrderTypeText(selectedOrder.order_type) }}</div>
            </div>
            <div>
              <div class="text-sm text-slate-500">支付方式</div>
              <div class="mt-1 font-medium text-white">{{ getPaymentTypeText(selectedOrder.payment_type) }}</div>
            </div>
            <div>
              <div class="text-sm text-slate-500">订单金额</div>
              <div class="mt-1 text-lg font-bold text-white">${{ selectedOrder.amount.toFixed(2) }}</div>
            </div>
            <div>
              <div class="text-sm text-slate-500">实付金额</div>
              <div class="mt-1 text-lg font-bold text-brand-400">${{ selectedOrder.pay_amount.toFixed(2) }}</div>
            </div>
            <div>
              <div class="text-sm text-slate-500">手续费率</div>
              <div class="mt-1 font-medium text-white">{{ (selectedOrder.fee_rate * 100).toFixed(2) }}%</div>
            </div>
            <div>
              <div class="text-sm text-slate-500">交易流水号</div>
              <div class="mt-1 font-mono text-xs text-slate-400">{{ selectedOrder.out_trade_no }}</div>
            </div>
            <div>
              <div class="text-sm text-slate-500">创建时间</div>
              <div class="mt-1 text-sm text-white">{{ formatDateTime(selectedOrder.created_at) }}</div>
            </div>
            <div>
              <div class="text-sm text-slate-500">过期时间</div>
              <div class="mt-1 text-sm text-white">{{ formatDateTime(selectedOrder.expires_at) }}</div>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button
            @click="selectedOrder = null"
            class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-6 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800"
          >
            关闭
          </button>
          <button
            v-if="selectedOrder.status === 'PENDING'"
            @click="handleContinuePay(selectedOrder)"
            class="rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-2 text-sm font-bold text-white shadow-lg shadow-brand-500/30 transition hover:shadow-brand-500/50"
          >
            继续支付
          </button>
        </div>
      </div>
    </div>

    <!-- 取消订单确认弹窗 -->
    <div
      v-if="cancelOrderId"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      @click.self="cancelOrderId = null"
    >
      <div class="w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-900 p-6 shadow-2xl">
        <h2 class="mb-4 text-xl font-bold text-white">确认取消订单</h2>
        <p class="mb-6 text-sm text-slate-400">确定要取消这个订单吗？取消后将无法恢复。</p>
        <div class="flex justify-end gap-3">
          <button
            @click="cancelOrderId = null"
            class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-6 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800"
          >
            取消
          </button>
          <button
            @click="confirmCancel"
            :disabled="cancelling"
            class="rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-6 py-2 text-sm font-bold text-white shadow-lg shadow-red-500/30 transition hover:shadow-red-500/50 disabled:opacity-50"
          >
            {{ cancelling ? '取消中...' : '确认取消' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { paymentAPI } from '@/api/payment'
import type { PaymentOrder, OrderStatus, OrderType } from '@/types/payment'
import { formatDateTime, extractErrorMessage } from '@/utils/format'
import { showError, showSuccess } from '@/utils/toast'

const router = useRouter()

const loading = ref(false)
const cancelling = ref(false)
const orders = ref<PaymentOrder[]>([])
const selectedOrder = ref<PaymentOrder | null>(null)
const cancelOrderId = ref<number | null>(null)

const filterType = ref('')
const filterStatus = ref('')
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

async function loadOrders() {
  loading.value = true
  try {
    const params: Record<string, any> = {
      page: page.value,
      page_size: pageSize.value,
    }
    if (filterStatus.value) params.status = filterStatus.value
    if (filterType.value) params.order_type = filterType.value

    const res = await paymentAPI.getMyOrders(params)
    orders.value = res.data.items || []
    total.value = res.data.total || 0
  } catch (error) {
    console.error('加载订单失败:', error)
    showError(extractErrorMessage(error, '加载订单失败'))
  } finally {
    loading.value = false
  }
}

function changePage(newPage: number) {
  if (newPage < 1 || newPage > totalPages.value) return
  page.value = newPage
  loadOrders()
}

function getOrderTypeIcon(type: OrderType): string {
  return type === 'balance' ? '💰' : '📦'
}

function getOrderTypeText(type: OrderType): string {
  return type === 'balance' ? '余额充值' : '订阅套餐'
}

function getPaymentTypeText(type: string): string {
  const map: Record<string, string> = {
    alipay: '支付宝',
    wxpay: '微信支付',
    alipay_direct: '支付宝直连',
    wxpay_direct: '微信直连',
    stripe: 'Stripe',
    easypay: 'EasyPay',
  }
  return map[type] || type
}

function getStatusText(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    PENDING: '待支付',
    PAID: '已支付',
    RECHARGING: '充值中',
    COMPLETED: '已完成',
    EXPIRED: '已过期',
    CANCELLED: '已取消',
    FAILED: '支付失败',
    REFUND_REQUESTED: '退款申请中',
    REFUNDING: '退款中',
    PARTIALLY_REFUNDED: '部分退款',
    REFUNDED: '已退款',
    REFUND_FAILED: '退款失败',
  }
  return map[status] || status
}

function getStatusClass(status: OrderStatus): string {
  const baseClass = 'inline-block'
  if (['COMPLETED', 'PAID'].includes(status)) {
    return `${baseClass} bg-emerald-500/20 text-emerald-400`
  }
  if (['PENDING', 'RECHARGING', 'REFUND_REQUESTED', 'REFUNDING'].includes(status)) {
    return `${baseClass} bg-yellow-500/20 text-yellow-400`
  }
  if (['CANCELLED', 'EXPIRED', 'FAILED', 'REFUND_FAILED'].includes(status)) {
    return `${baseClass} bg-red-500/20 text-red-400`
  }
  if (['REFUNDED', 'PARTIALLY_REFUNDED'].includes(status)) {
    return `${baseClass} bg-blue-500/20 text-blue-400`
  }
  return `${baseClass} bg-slate-500/20 text-slate-400`
}

function showOrderDetail(order: PaymentOrder) {
  selectedOrder.value = order
}

function handleContinuePay(order: PaymentOrder) {
  router.push(`/payment/checkout?order_id=${order.id}`)
}

function handleCancel(orderId: number) {
  cancelOrderId.value = orderId
}

async function confirmCancel() {
  if (!cancelOrderId.value) return
  cancelling.value = true
  try {
    await paymentAPI.cancelOrder(cancelOrderId.value)
    showSuccess('订单已取消')
    cancelOrderId.value = null
    await loadOrders()
  } catch (error) {
    console.error('取消订单失败:', error)
    showError(extractErrorMessage(error, '取消订单失败'))
  } finally {
    cancelling.value = false
  }
}

function goToRecharge() {
  router.push('/payment/checkout')
}

onMounted(() => {
  loadOrders()
})
</script>
