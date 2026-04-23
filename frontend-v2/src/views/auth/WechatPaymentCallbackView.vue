<template>
  <section class="grid w-full max-w-6xl gap-6 xl:grid-cols-[0.92fr_1.08fr]">
    <aside class="relative overflow-hidden rounded-[38px] bg-neutral-900 p-7 text-white shadow-panel md:p-9">
      <div class="pointer-events-none absolute -right-20 top-12 h-60 w-60 rounded-full bg-success-400/25 blur-3xl"></div>
      <div class="pointer-events-none absolute -bottom-20 left-8 h-64 w-64 rounded-full bg-brand-500/25 blur-3xl"></div>

      <div class="relative">
        <p class="text-xs font-black uppercase tracking-[0.36em] text-brand-100/80">支付回流</p>
        <h1 class="mt-5 text-5xl font-black leading-[0.96] tracking-tight">微信支付回流，不混入登录身份流。</h1>
        <p class="mt-5 text-sm leading-7 text-white/65">
          正在恢复微信支付状态。稍后会自动回到支付页面。
        </p>

        <div class="mt-9 grid gap-3">
          <article
            v-for="step in steps"
            :key="step.title"
            class="rounded-[26px] border border-white/10 bg-white/10 p-4"
          >
            <div class="flex items-center justify-between gap-3">
              <strong class="text-sm font-black">{{ step.title }}</strong>
              <span class="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white/60">{{ step.tag }}</span>
            </div>
            <p class="mt-2 text-xs leading-5 text-white/60">{{ step.description }}</p>
          </article>
        </div>
      </div>
    </aside>

    <main class="rounded-[38px] border border-line bg-white p-6 shadow-panel md:p-8">
      <p class="text-xs font-black uppercase tracking-[0.32em] text-brand-700">恢复桥接</p>
      <h2 class="mt-3 text-4xl font-black tracking-tight text-text-primary md:text-5xl">{{ title }}</h2>
      <p class="mt-3 max-w-2xl text-sm leading-7 text-text-secondary">{{ description }}</p>

      <div v-if="errorMessage" class="mt-8 rounded-[30px] border border-red-200 bg-red-50 p-6">
        <p class="text-lg font-black text-red-800">支付回流失败</p>
        <p class="mt-2 text-sm leading-6 text-red-700">{{ errorMessage }}</p>
        <button
          type="button"
          class="mt-5 rounded-full bg-brand-500 px-5 py-3 text-sm font-black text-white transition hover:bg-brand-700"
          @click="goBackToPayment"
        >
          返回支付页
        </button>
      </div>

      <div v-else class="mt-8 rounded-[30px] border border-line bg-surface-soft p-6">
        <div class="h-2 overflow-hidden rounded-full bg-white">
          <div class="h-full w-3/4 animate-pulse rounded-full bg-success-500"></div>
        </div>
        <div class="mt-5 grid gap-3">
          <p class="text-sm font-black text-text-primary">正在整理微信支付恢复参数。</p>
          <p class="text-sm leading-6 text-text-secondary">
            正在整理支付恢复信息，请不要关闭页面。
          </p>
        </div>
      </div>
    </main>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const errorMessage = ref('')
const isRedirecting = ref(true)

const steps = [
  { tag: '01', title: '读取回调片段', description: '同时兼容 URL query 与 hash fragment 中的恢复参数。' },
  { tag: '02', title: '规范支付路径', description: '拒绝外部跳转，只允许回到站内支付流程。' },
  { tag: '03', title: '返回支付页面', description: '恢复完成后继续支付流程。' },
]

const title = computed(() => (isRedirecting.value ? '正在返回支付流程' : '支付回流需要处理'))
const description = computed(() =>
  isRedirecting.value
    ? '正在把微信支付结果带回支付页。'
    : '请根据提示返回支付页重新发起或继续支付。'
)

watch(errorMessage, (message) => {
  if (message) {
    isRedirecting.value = false
    appStore.showError(message)
  }
})

onMounted(async () => {
  const fragment = parseFragmentParams()
  const readParam = (key: string) => fragment.get(key) || readQueryString(key)

  const error = readParam('error') || readParam('err_msg') || readParam('errmsg')
  const errorDescription = readParam('error_description') || readParam('message')
  if (error) {
    errorMessage.value = errorDescription || error
    return
  }

  const resumeToken = readParam('wechat_resume_token')
  const openid = readParam('openid')
  if (!resumeToken && !openid) {
    errorMessage.value = '微信支付回调缺少恢复令牌或 openid。'
    return
  }

  const redirectURL = new URL(normalizeRedirectPath(readParam('redirect')), window.location.origin)
  const query: Record<string, string> = {
    ...Object.fromEntries(redirectURL.searchParams.entries()),
    wechat_resume: '1',
  }

  if (resumeToken) {
    query.wechat_resume_token = resumeToken
  } else {
    query.openid = openid
    appendQueryParam(query, 'state', readParam('state'))
    appendQueryParam(query, 'scope', readParam('scope'))
    appendQueryParam(query, 'payment_type', readParam('payment_type'))
    appendQueryParam(query, 'amount', readParam('amount'))
    appendQueryParam(query, 'order_type', readParam('order_type'))
    appendQueryParam(query, 'plan_id', readParam('plan_id'))
  }

  await router.replace({
    path: redirectURL.pathname,
    query,
  })
})

function readQueryString(key: string): string {
  const value = route.query[key]
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : ''
  }
  return typeof value === 'string' ? value : ''
}

function parseFragmentParams(): URLSearchParams {
  const raw = typeof window !== 'undefined' ? window.location.hash : ''
  return new URLSearchParams(raw.startsWith('#') ? raw.slice(1) : raw)
}

function normalizeRedirectPath(path: string | null | undefined): string {
  const value = (path || '').trim()
  if (!value) return '/purchase'
  if (!value.startsWith('/')) return '/purchase'
  if (value.startsWith('//') || value.includes('://')) return '/purchase'
  if (value === '/payment') return '/purchase'
  if (value.startsWith('/payment?')) return `/purchase${value.slice('/payment'.length)}`
  return value
}

function appendQueryParam(query: Record<string, string>, key: string, value: string) {
  if (value) {
    query[key] = value
  }
}

function goBackToPayment() {
  void router.replace('/purchase')
}
</script>
