<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
    <div class="w-full max-w-md space-y-4 rounded-2xl border border-slate-700/50 bg-slate-800/40 p-6 shadow-2xl backdrop-blur-sm">
      <!-- 金额 + 订单ID -->
      <div v-if="amount" class="text-center">
        <p class="text-4xl font-bold" :style="{ color: methodColor }">¥{{ amount }}</p>
        <p v-if="orderId" class="mt-2 text-sm text-slate-400">
          订单ID: {{ orderId }}
        </p>
      </div>

      <!-- 错误 -->
      <div v-if="error" class="space-y-3">
        <div class="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {{ error }}
        </div>
        <button
          @click="closeWindow"
          class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 py-2.5 text-sm font-bold text-slate-300 transition hover:border-slate-600 hover:bg-slate-800/60"
        >
          关闭
        </button>
      </div>

      <!-- 成功 -->
      <div v-else-if="success" class="space-y-4 py-4 text-center">
        <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
          <svg class="h-10 w-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p class="text-lg font-bold text-white">支付成功</p>
        <button
          @click="closeWindow"
          class="w-full rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-500/30 transition hover:shadow-brand-500/50"
        >
          关闭
        </button>
      </div>

      <!-- 加载 / 跳转中 -->
      <div v-else class="flex items-center justify-center py-8">
        <div
          class="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent"
          :style="{ borderColor: methodColor, borderTopColor: 'transparent' }"
        />
        <span class="ml-3 text-sm text-slate-400">{{ hint }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

interface StripeWithWechatPay {
  confirmWechatPayPayment(clientSecret: string, options: Record<string, unknown>): Promise<{ error?: { message?: string }; paymentIntent?: { status: string } }>
}

const METHOD_COLORS: Record<string, string> = {
  alipay: '#00AEEF',
  wechat_pay: '#07C160',
}
const DEFAULT_METHOD_COLOR = '#635bff'

const route = useRoute()

const orderId = String(route.query.order_id || '')
const method = String(route.query.method || 'alipay')
const amount = String(route.query.amount || '')

const methodColor = computed(() => METHOD_COLORS[method] || DEFAULT_METHOD_COLOR)

const error = ref('')
const success = ref(false)
const hint = ref('正在跳转...')

let pollTimer: ReturnType<typeof setInterval> | null = null

function closeWindow() { window.close() }

onMounted(() => {
  const handler = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return
    if (event.data?.type !== 'STRIPE_POPUP_INIT') return
    window.removeEventListener('message', handler)
    initStripe(event.data.clientSecret, event.data.publishableKey)
  }
  window.addEventListener('message', handler)

  if (window.opener) {
    window.opener.postMessage({ type: 'STRIPE_POPUP_READY' }, window.location.origin)
  }

  setTimeout(() => {
    if (!error.value && !success.value) {
      error.value = '初始化超时，请重试'
    }
  }, 15000)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})

async function initStripe(clientSecret: string, publishableKey: string) {
  if (!clientSecret || !publishableKey) {
    error.value = '缺少必要参数'
    return
  }
  try {
    const { loadStripe } = await import('@stripe/stripe-js')
    const stripe = await loadStripe(publishableKey)
    if (!stripe) { error.value = 'Stripe 加载失败'; return }

    const returnUrl = window.location.origin + '/payment/result?order_id=' + orderId

    if (method === 'alipay') {
      const { error: err } = await stripe.confirmAlipayPayment(clientSecret, { return_url: returnUrl })
      if (err) error.value = err.message || '支付失败'
    } else if (method === 'wechat_pay') {
      hint.value = '加载二维码中...'
      const result = await (stripe as unknown as StripeWithWechatPay).confirmWechatPayPayment(clientSecret, {
        payment_method_options: { wechat_pay: { client: 'web' } },
      })
      if (result.error) {
        error.value = result.error.message || '支付失败'
      } else if (result.paymentIntent?.status === 'succeeded') {
        success.value = true
        setTimeout(closeWindow, 2000)
      } else {
        startPolling()
      }
    }
  } catch (err: any) {
    error.value = err.message || 'Stripe 加载失败'
  }
}

function startPolling() {
  pollTimer = setInterval(async () => {
    try {
      const token = document.cookie.split('; ').find(c => c.startsWith('token='))?.split('=')[1]
        || localStorage.getItem('token') || ''
      const res = await fetch('/api/v1/payment/orders/' + orderId, {
        headers: token ? { Authorization: 'Bearer ' + token } : {},
        credentials: 'include',
      })
      if (!res.ok) return
      const data = await res.json()
      const status = data?.data?.status
      if (status === 'COMPLETED' || status === 'PAID') {
        if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
        success.value = true
        setTimeout(closeWindow, 2000)
      }
    } catch { /* ignore */ }
  }, 3000)
}
</script>
