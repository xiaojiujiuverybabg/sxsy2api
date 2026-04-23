<template>
  <section class="grid w-full max-w-6xl gap-6 xl:grid-cols-[1fr_.9fr]">
    <form class="rounded-[38px] border border-line bg-white p-6 shadow-panel md:p-8" @submit.prevent="handleVerify">
      <p class="text-xs font-black uppercase tracking-[0.32em] text-brand-700">邮箱验证</p>
      <h1 class="mt-3 text-5xl font-black tracking-tight text-text-primary">完成邮箱验证</h1>
      <p class="mt-3 text-sm leading-7 text-text-secondary">
        我们已向你的邮箱发送验证码，输入 6 位数字即可完成身份创建。
      </p>

      <div v-if="!hasRegisterData" class="mt-7 rounded-[28px] border border-amber-200 bg-amber-50 p-5">
        <p class="text-sm font-black text-amber-800">没有找到待验证的注册数据。</p>
        <p class="mt-2 text-sm leading-6 text-amber-700">请返回注册页重新创建身份申请。</p>
      </div>

      <div v-if="errorMessage" class="mt-7 rounded-[24px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
        {{ errorMessage }}
      </div>

      <div class="mt-8 rounded-[30px] border border-line bg-surface-soft p-5">
        <p class="text-xs font-black uppercase tracking-[0.28em] text-text-muted">目标邮箱</p>
        <p class="mt-3 break-all text-2xl font-black text-text-primary">{{ email || '未读取到邮箱' }}</p>
        <p class="mt-2 text-sm leading-6 text-text-secondary">
          {{ codeSent ? '验证码已发送，请输入邮件中的 6 位数字。' : '页面加载后会自动发送验证码，也可以手动重发。' }}
        </p>
      </div>

      <div class="mt-6">
        <FlowField v-model="verifyCode" label="验证码" placeholder="请输入 6 位验证码" />
      </div>

      <div v-if="turnstileEnabled && turnstileSiteKey && showResendTurnstile" class="mt-6">
        <TurnstileWidget
          ref="turnstileRef"
          :site-key="turnstileSiteKey"
          @verify="resendTurnstileToken = $event"
          @expire="resendTurnstileToken = ''"
          @error="resendTurnstileToken = ''"
        />
      </div>

      <div class="mt-7 grid gap-3 sm:grid-cols-[1fr_auto]">
        <button
          type="submit"
          class="rounded-[26px] border border-brand-500 bg-brand-500 px-6 py-5 text-left text-sm font-black text-white transition hover:border-brand-700 hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="!hasRegisterData || isVerifying || verifyCode.trim().length !== 6"
        >
          {{ isVerifying ? '正在创建身份' : '验证并创建身份' }}
        </button>

        <button
          type="button"
          class="rounded-[26px] border border-line bg-surface-soft px-6 py-5 text-sm font-black text-text-secondary transition hover:border-brand-300 hover:bg-white hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="!hasRegisterData || isSendingCode || countdown > 0 || (turnstileEnabled && showResendTurnstile && !resendTurnstileToken)"
          @click="handleResendCode"
        >
          {{ resendLabel }}
        </button>
      </div>

      <div class="mt-6 flex flex-wrap gap-3 text-sm font-black">
        <RouterLink to="/register" class="text-brand-700 transition hover:text-brand-500">返回注册页</RouterLink>
        <RouterLink to="/login" class="text-text-muted transition hover:text-text-primary">已有身份，去登录</RouterLink>
      </div>
    </form>

    <aside class="relative overflow-hidden rounded-[38px] bg-neutral-900 p-7 text-white shadow-panel md:p-9">
      <div class="pointer-events-none absolute -right-16 top-10 h-56 w-56 rounded-full bg-success-400/25 blur-3xl"></div>
      <div class="relative">
        <p class="text-xs font-black uppercase tracking-[0.36em] text-brand-100/80">验证流程</p>
        <h2 class="mt-5 text-4xl font-black leading-tight">验证码流程是独立检查点，不再藏在表单下方。</h2>
        <div class="mt-8 grid gap-3">
          <article
            v-for="item in timeline"
            :key="item.title"
            class="rounded-[26px] border border-white/10 bg-white/10 p-4"
          >
            <strong class="text-sm font-black">{{ item.title }}</strong>
            <p class="mt-2 text-xs leading-5 text-white/60">{{ item.description }}</p>
          </article>
        </div>
      </div>
    </aside>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { FlowField } from '@/components/atlas'
import TurnstileWidget from '@/components/TurnstileWidget.vue'
import { getPublicSettings, sendVerifyCode, type RegisterRequest } from '@/api/auth'
import { useAppStore, useAuthStore } from '@/stores'
import {
  buildAuthErrorMessage,
  buildEmailSuffixMessage,
  isEmailSuffixAllowed,
  normalizeEmailSuffixWhitelist,
} from '@/utils/auth'

const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()

const hasRegisterData = ref(false)
const email = ref('')
const password = ref('')
const promoCode = ref('')
const invitationCode = ref('')
const initialTurnstileToken = ref('')

const verifyCode = ref('')
const codeSent = ref(false)
const countdown = ref(0)
const isSendingCode = ref(false)
const isVerifying = ref(false)
const errorMessage = ref('')

const turnstileEnabled = ref(false)
const turnstileSiteKey = ref('')
const showResendTurnstile = ref(false)
const resendTurnstileToken = ref('')
const turnstileRef = ref<InstanceType<typeof TurnstileWidget> | null>(null)
const emailWhitelist = ref<string[]>([])
let countdownTimer: ReturnType<typeof window.setInterval> | null = null

const timeline = [
  { title: '发送验证码', description: '自动向注册邮箱发送验证码。' },
  { title: '输入检查码', description: '用户输入 6 位验证码，页面只做前端格式校验。' },
  { title: '创建身份', description: '验证通过后进入工作台。' },
]

const resendLabel = computed(() => {
  if (isSendingCode.value) {
    return '发送中'
  }
  if (countdown.value > 0) {
    return `${countdown.value}s 后可重发`
  }
  if (turnstileEnabled.value && !showResendTurnstile.value) {
    return '重发验证码'
  }
  return '确认重发'
})

onMounted(async () => {
  const raw = sessionStorage.getItem('register_data')
  if (raw) {
    try {
      const data = JSON.parse(raw) as RegisterRequest
      email.value = data.email || ''
      password.value = data.password || ''
      promoCode.value = data.promo_code || ''
      invitationCode.value = data.invitation_code || ''
      initialTurnstileToken.value = data.turnstile_token || ''
      hasRegisterData.value = Boolean(email.value && password.value)
    } catch {
      hasRegisterData.value = false
    }
  }

  try {
    const settings = await appStore.fetchPublicSettings()
    turnstileEnabled.value = settings.turnstile_enabled
    turnstileSiteKey.value = settings.turnstile_site_key || ''
    emailWhitelist.value = normalizeEmailSuffixWhitelist(settings.registration_email_suffix_whitelist)
  } catch {
    const settings = await getPublicSettings()
    turnstileEnabled.value = settings.turnstile_enabled
    turnstileSiteKey.value = settings.turnstile_site_key || ''
    emailWhitelist.value = normalizeEmailSuffixWhitelist(settings.registration_email_suffix_whitelist)
  }

  if (hasRegisterData.value) {
    await sendCode()
  }
})

function startCountdown(seconds: number) {
  countdown.value = seconds
  if (countdownTimer) {
    window.clearInterval(countdownTimer)
  }
  countdownTimer = window.setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0 && countdownTimer) {
      window.clearInterval(countdownTimer)
      countdownTimer = null
    }
  }, 1000)
}

async function sendCode() {
  if (!email.value) {
    return
  }

  if (!isEmailSuffixAllowed(email.value, emailWhitelist.value)) {
    errorMessage.value = buildEmailSuffixMessage(emailWhitelist.value)
    appStore.showError(errorMessage.value)
    return
  }

  isSendingCode.value = true
  errorMessage.value = ''

  try {
    const response = await sendVerifyCode({
      email: email.value,
      turnstile_token: resendTurnstileToken.value || initialTurnstileToken.value || undefined,
    })
    codeSent.value = true
    initialTurnstileToken.value = ''
    resendTurnstileToken.value = ''
    showResendTurnstile.value = false
    startCountdown(response.countdown || 60)
    appStore.showInfo('验证码已发送，请检查邮箱。')
  } catch (error) {
    errorMessage.value = buildAuthErrorMessage(error, '验证码发送失败。')
    appStore.showError(errorMessage.value)
  } finally {
    isSendingCode.value = false
  }
}

async function handleResendCode() {
  if (turnstileEnabled.value && !showResendTurnstile.value) {
    showResendTurnstile.value = true
    return
  }

  if (turnstileEnabled.value && !resendTurnstileToken.value) {
    errorMessage.value = '请先完成人机验证后再重发。'
    appStore.showError(errorMessage.value)
    return
  }

  await sendCode()
}

async function handleVerify() {
  if (!/^\d{6}$/.test(verifyCode.value.trim())) {
    errorMessage.value = '请输入 6 位数字验证码。'
    appStore.showError(errorMessage.value)
    return
  }

  isVerifying.value = true
  errorMessage.value = ''

  try {
    await authStore.register({
      email: email.value,
      password: password.value,
      verify_code: verifyCode.value.trim(),
      promo_code: promoCode.value || undefined,
      invitation_code: invitationCode.value || undefined,
    })
    sessionStorage.removeItem('register_data')
    appStore.showSuccess('邮箱验证通过，身份创建成功。')
    await router.push('/dashboard')
  } catch (error) {
    errorMessage.value = buildAuthErrorMessage(error, '邮箱验证或注册失败。')
    appStore.showError(errorMessage.value)
  } finally {
    isVerifying.value = false
  }
}
</script>
