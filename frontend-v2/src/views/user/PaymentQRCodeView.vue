<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
    <div class="w-full max-w-md space-y-6">
      <!-- 标题 -->
      <h2 class="text-center text-2xl font-bold text-white">
        {{ qrUrl ? scanTitle : '在新窗口完成支付' }}
      </h2>

      <!-- 二维码 -->
      <div v-if="qrUrl" class="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-8 backdrop-blur-sm">
        <canvas ref="qrCanvas" class="mx-auto rounded-lg"></canvas>
      </div>

      <!-- 扫码提示 -->
      <p v-if="qrUrl && !expired && scanHint" class="text-center text-sm text-slate-400">
        {{ scanHint }}
      </p>

      <!-- 过期提示 -->
      <div v-if="expired" class="text-center">
        <div class="rounded-xl border border-red-500/30 bg-red-500/10 p-6 backdrop-blur-sm">
          <p class="text-lg font-medium text-red-400">二维码已过期</p>
          <p class="mt-2 text-sm text-slate-400">请返回重新发起支付</p>
        </div>
        <button
          @click="$router.push('/subscriptions')"
          class="mt-4 w-full rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/30 transition hover:shadow-brand-500/50"
        >
          返回充值
        </button>
      </div>

      <!-- 倒计时 -->
      <div v-else class="text-center">
        <p class="text-sm text-slate-400">{{ qrUrl ? '二维码有效期' : '请在新窗口完成支付' }}</p>
        <p class="mt-2 text-3xl font-bold tabular-nums text-white">{{ countdownDisplay }}</p>
        <p class="mt-2 text-sm text-slate-500">等待支付中...</p>
      </div>

      <!-- 打开支付窗口按钮 -->
      <a
        v-if="payUrl && !qrUrl && !expired"
        :href="payUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="block w-full rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 py-3 text-center text-sm font-bold text-white shadow-lg shadow-brand-500/30 transition hover:shadow-brand-500/50"
      >
        打开支付窗口
      </a>

      <!-- 取消订单按钮 -->
      <button
        v-if="!expired && orderId"
        @click="handleCancel"
        :disabled="cancelling"
        class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 py-3 text-sm font-bold text-slate-300 transition hover:border-slate-600 hover:bg-slate-800/60 disabled:opacity-50"
      >
        {{ cancelling ? '取消中...' : '取消订单' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { paymentAPI } from '@/api/payment'
import QRCode from 'qrcode'

const route = useRoute()
const router = useRouter()

const qrCanvas = ref<HTMLCanvasElement | null>(null)
const qrUrl = ref('')
const payUrl = ref('')
const orderId = ref(0)
const remainingSeconds = ref(0)
const expired = ref(false)
const cancelling = ref(false)
const paymentType = ref('')

let pollTimer: ReturnType<typeof setInterval> | null = null
let countdownTimer: ReturnType<typeof setInterval> | null = null

const countdownDisplay = computed(() => {
  const m = Math.floor(remainingSeconds.value / 60)
  const s = remainingSeconds.value % 60
  return m.toString().padStart(2, '0') + ':' + s.toString().padStart(2, '0')
})

const isAlipay = computed(() => paymentType.value.includes('alipay'))
const isWxpay = computed(() => paymentType.value.includes('wxpay'))

const scanTitle = computed(() => {
  if (isAlipay.value) return '支付宝扫码支付'
  if (isWxpay.value) return '微信扫码支付'
  return '扫码支付'
})

const scanHint = computed(() => {
  if (isAlipay.value) return '请使用支付宝扫描二维码完成支付'
  if (isWxpay.value) return '请使用微信扫描二维码完成支付'
  return ''
})

async function renderQR() {
  await nextTick()
  if (!qrCanvas.value || !qrUrl.value) return

  await QRCode.toCanvas(qrCanvas.value, qrUrl.value, {
    width: 256,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#ffffff',
      light: '#1e293b'
    }
  })
}

async function pollStatus() {
  if (!orderId.value) return
  try {
    const res = await paymentAPI.getOrder(orderId.value)
    const order = res.data
    if (!order) return

    if (order.status === 'COMPLETED' || order.status === 'PAID') {
      cleanup()
      router.push({ path: '/payment/result', query: { order_id: String(orderId.value) } })
    } else if (order.status === 'EXPIRED' || order.status === 'CANCELLED' || order.status === 'FAILED') {
      cleanup()
      expired.value = true
    }
  } catch (err) {
    console.error('Failed to poll order status:', err)
  }
}

function startCountdown(seconds: number) {
  remainingSeconds.value = Math.max(0, seconds)
  if (remainingSeconds.value <= 0) {
    expired.value = true
    return
  }
  countdownTimer = setInterval(() => {
    remainingSeconds.value--
    if (remainingSeconds.value <= 0) {
      expired.value = true
      cleanup()
    }
  }, 1000)
}

async function handleCancel() {
  if (!orderId.value || cancelling.value) return
  cancelling.value = true
  try {
    await paymentAPI.cancelOrder(orderId.value)
    cleanup()
    router.push('/subscriptions')
  } catch (err) {
    console.error('Failed to cancel order:', err)
  } finally {
    cancelling.value = false
  }
}

function cleanup() {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
  if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null }
}

watch(qrUrl, () => renderQR())

onMounted(() => {
  orderId.value = Number(route.query.order_id) || 0
  qrUrl.value = String(route.query.qr || '')
  payUrl.value = String(route.query.pay_url || '')
  paymentType.value = String(route.query.payment_type || '')

  const expiresAtStr = String(route.query.expires_at || '')
  let seconds = 30 * 60
  if (expiresAtStr) {
    const expiresAt = new Date(expiresAtStr)
    const now = new Date()
    seconds = Math.floor((expiresAt.getTime() - now.getTime()) / 1000)
  }
  startCountdown(seconds)
  pollTimer = setInterval(pollStatus, 3000)
  renderQR()
})

onUnmounted(() => cleanup())
</script>
