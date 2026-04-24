<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
    <div class="mx-auto max-w-lg space-y-6 px-4 py-8">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="h-12 w-12 animate-spin rounded-full border-4 border-brand-500/20 border-t-brand-500"></div>
      </div>

      <!-- 初始化错误 -->
      <div v-else-if="initError" class="rounded-xl border border-red-500/30 bg-red-500/10 p-8 text-center backdrop-blur-sm">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-red-500/30 bg-red-500/20">
          <svg class="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-white">Stripe 加载失败</h3>
        <p class="mt-2 text-sm text-slate-400">{{ initError }}</p>
        <button
          @click="$router.push('/subscriptions')"
          class="mt-6 rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-500/30 transition hover:shadow-brand-500/50"
        >
          返回充值
        </button>
      </div>

      <template v-else>
        <!-- 金额显示 -->
        <div v-if="order" class="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
          <div class="bg-gradient-to-br from-indigo-600 to-indigo-700 px-6 py-6 text-center">
            <p class="text-sm font-medium text-indigo-200">实付金额</p>
            <p class="mt-1 text-4xl font-bold text-white">¥{{ order.pay_amount.toFixed(2) }}</p>
          </div>
        </div>

        <!-- 微信二维码 -->
        <template v-if="wechatQrUrl">
          <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 p-6 backdrop-blur-sm">
            <div class="flex flex-col items-center space-y-4">
              <p class="text-lg font-semibold text-white">微信扫码支付</p>
              <div class="relative rounded-lg border-2 border-green-500/50 bg-green-500/10 p-4">
                <img :src="wechatQrUrl" alt="WeChat Pay QR" class="h-56 w-56 rounded" />
              </div>
              <p class="text-center text-sm text-slate-400">请使用微信扫描二维码完成支付</p>
            </div>
          </div>
          <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4 text-center backdrop-blur-sm">
            <p class="text-sm text-slate-400">等待支付中...</p>
          </div>
        </template>

        <!-- 支付宝跳转中 -->
        <template v-else-if="redirecting">
          <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 p-6 backdrop-blur-sm">
            <div class="flex flex-col items-center space-y-4 py-4">
              <div class="h-12 w-12 animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-400"></div>
              <p class="text-sm text-slate-400">正在跳转到支付宝...</p>
            </div>
          </div>
        </template>

        <!-- 支付成功 -->
        <template v-else-if="stripeSuccess">
          <div class="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center backdrop-blur-sm">
            <div class="flex flex-col items-center gap-3 py-4">
              <div class="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/20">
                <svg class="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p class="text-lg font-bold text-white">支付成功</p>
              <p class="text-sm text-slate-400">正在处理您的订单...</p>
            </div>
          </div>
        </template>

        <!-- Stripe 支付元素 -->
        <template v-else-if="showPaymentElement">
          <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 p-6 backdrop-blur-sm">
            <div id="stripe-payment-element" class="min-h-[200px]"></div>
            <p v-if="stripeError" class="mt-4 text-sm text-red-400">{{ stripeError }}</p>
            <button
              @click="handleGenericPay"
              :disabled="stripeSubmitting || !stripeReady"
              class="mt-6 w-full rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 py-3 text-base font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="stripeSubmitting" class="flex items-center justify-center gap-2">
                <span class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                处理中...
              </span>
              <span v-else>确认支付</span>
            </button>
          </div>
          <div class="text-center">
            <button
              @click="$router.push('/subscriptions')"
              class="rounded-lg border border-slate-700/50 bg-slate-900/50 px-6 py-2.5 text-sm font-bold text-slate-300 transition hover:border-slate-600 hover:bg-slate-800/60"
            >
              返回充值
            </button>
          </div>
        </template>

        <!-- 错误提示 -->
        <div v-if="stripeError && !showPaymentElement" class="rounded-xl border border-red-500/30 bg-red-500/10 p-4 backdrop-blur-sm">
          <p class="text-sm text-red-400">{{ stripeError }}</p>
          <button
            @click="$router.push('/subscriptions')"
            class="mt-3 w-full rounded-lg border border-slate-700/50 bg-slate-900/50 py-2.5 text-sm font-bold text-slate-300 transition hover:border-slate-600"
          >
            返回充值
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { paymentAPI } from '@/api/payment'
import type { PaymentOrder } from '@/types/payment'
import type { Stripe, StripeElements } from '@stripe/stripe-js'

const route = useRoute()
const router = useRouter()

const isPopup = computed(() => !!route.query.method)

const loading = ref(true)
const initError = ref('')
const stripeError = ref('')
const stripeSubmitting = ref(false)
const stripeSuccess = ref(false)
const stripeReady = ref(false)
const order = ref<PaymentOrder | null>(null)
const wechatQrUrl = ref('')
const redirecting = ref(false)
const showPaymentElement = ref(false)

let stripeInstance: Stripe | null = null
let elementsInstance: StripeElements | null = null
let redirectTimer: ReturnType<typeof setTimeout> | null = null

onMounted(async () => {
  const orderId = Number(route.query.order_id)
  const clientSecret = String(route.query.client_secret || '')
  const method = String(route.query.method || '')

  if (!orderId || !clientSecret) {
    loading.value = false
    initError.value = '缺少必要参数'
    return
  }

  try {
    const res = await paymentAPI.getOrder(orderId)
    order.value = res.data

    const configRes = await paymentAPI.getConfig()
    const publishableKey = configRes.data?.stripe_publishable_key
    if (!publishableKey) {
      initError.value = 'Stripe 未配置'
      return
    }

    const { loadStripe } = await import('@stripe/stripe-js')
    const stripe = await loadStripe(publishableKey)
    if (!stripe) {
      initError.value = 'Stripe 加载失败'
      return
    }

    stripeInstance = stripe
    loading.value = false

    if (method === 'alipay') {
      await confirmAlipay(stripe, clientSecret, orderId)
    } else if (method === 'wechat_pay') {
      await confirmWechatPay(stripe, clientSecret)
    } else {
      showPaymentElement.value = true
      await nextTick()
      mountPaymentElement(stripe, clientSecret)
    }
  } catch (err: any) {
    initError.value = err.message || 'Stripe 加载失败'
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  if (redirectTimer) clearTimeout(redirectTimer)
})

async function confirmAlipay(stripe: Stripe, clientSecret: string, orderId: number) {
  redirecting.value = true
  const returnUrl = window.location.origin + '/payment/result?order_id=' + orderId
  const { error } = await stripe.confirmAlipayPayment(clientSecret, { return_url: returnUrl })
  if (error) {
    redirecting.value = false
    stripeError.value = error.message || '支付失败'
  }
}

async function confirmWechatPay(stripe: Stripe, clientSecret: string) {
  const { paymentIntent, error } = await (stripe as any).confirmWechatPayPayment(clientSecret, {
    payment_method_options: { wechat_pay: { client: 'web' } },
  })

  if (error) {
    stripeError.value = error.message || '支付失败'
    return
  }

  const qrData = paymentIntent?.next_action?.wechat_pay_display_qr_code?.image_data_url
  if (qrData) {
    wechatQrUrl.value = qrData
    startPolling()
  } else if (paymentIntent?.status === 'succeeded') {
    stripeSuccess.value = true
    scheduleClose()
  } else {
    stripeError.value = '支付失败'
  }
}

function mountPaymentElement(stripe: Stripe, clientSecret: string) {
  const elements = stripe.elements({
    clientSecret,
    appearance: { theme: 'night', variables: { borderRadius: '8px' } },
  })
  elementsInstance = elements
  const paymentElement = elements.create('payment', {
    layout: 'tabs',
  } as any)
  paymentElement.mount('#stripe-payment-element')
  paymentElement.on('ready', () => { stripeReady.value = true })
}

async function handleGenericPay() {
  if (!stripeInstance || !elementsInstance || stripeSubmitting.value) return
  stripeSubmitting.value = true
  stripeError.value = ''
  try {
    const { error } = await stripeInstance.confirmPayment({
      elements: elementsInstance,
      confirmParams: {
        return_url: window.location.origin + '/payment/result?order_id=' + route.query.order_id,
      },
      redirect: 'if_required',
    })
    if (error) {
      stripeError.value = error.message || '支付失败'
    } else {
      stripeSuccess.value = true
      scheduleClose()
    }
  } catch (err: any) {
    stripeError.value = err.message || '支付失败'
  } finally {
    stripeSubmitting.value = false
  }
}

let pollTimer: ReturnType<typeof setInterval> | null = null

function startPolling() {
  const orderId = Number(route.query.order_id)
  if (!orderId) return
  pollTimer = setInterval(async () => {
    try {
      const res = await paymentAPI.getOrder(orderId)
      const o = res.data
      if (!o) return
      if (o.status === 'COMPLETED' || o.status === 'PAID') {
        if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
        stripeSuccess.value = true
        wechatQrUrl.value = ''
        scheduleClose()
      }
    } catch (err) {
      console.error('Failed to poll order:', err)
    }
  }, 3000)
}

function scheduleClose() {
  if (window.opener) {
    redirectTimer = setTimeout(() => { window.close() }, 2000)
  } else {
    redirectTimer = setTimeout(() => {
      router.push({ path: '/payment/result', query: { order_id: String(route.query.order_id || '') } })
    }, 2000)
  }
}

onUnmounted(() => {
  if (redirectTimer) clearTimeout(redirectTimer)
  if (pollTimer) clearInterval(pollTimer)
})
</script>
