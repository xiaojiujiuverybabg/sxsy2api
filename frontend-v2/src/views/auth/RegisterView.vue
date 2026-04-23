<template>
  <section class="w-full max-w-5xl px-4 relative z-10">
    <div class="relative overflow-hidden rounded-3xl border border-success-500/15 bg-surface-card/60 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
      <!-- Glow Effects -->
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(16,185,129,0.1),transparent_40%),radial-gradient(circle_at_90%_90%,rgba(220,38,38,0.1),transparent_40%)]"></div>

      <div class="relative grid min-h-[680px] lg:grid-cols-[0.9fr_1.1fr]">
        <!-- Left Banner -->
        <aside class="relative overflow-hidden border-r border-white/10 bg-surface-page/50 p-8 text-white md:p-10 flex flex-col justify-between hidden lg:flex">
          <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTAgMGgyMHYyMEgwem0xIDEwSDBWMGgxMHYxem0wIDBWMjBoMTBWMTB6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=')] opacity-30"></div>
          
          <div class="relative z-10">
            <div class="flex items-center gap-3">
              <span class="grid h-12 w-12 place-items-center rounded-xl bg-success-500/20 shadow-[0_0_15px_rgba(16,185,129,0.5)] border border-success-500/30 text-sm font-black text-success-400">S2</span>
              <div>
                <p class="text-base font-black leading-none text-white tracking-widest">sxsy2Api</p>
                <p class="mt-1.5 text-[0.65rem] font-bold uppercase tracking-[0.3em] text-success-400">身份铸造</p>
              </div>
            </div>

            <div class="mt-20">
              <p class="text-xs font-bold uppercase tracking-[0.3em] text-success-400">初始化</p>
              <h1 class="mt-4 text-4xl font-black leading-tight tracking-tight text-white md:text-5xl">构造<br /><span class="text-transparent bg-clip-text bg-gradient-to-r from-success-400 to-gold-400">数字身份</span></h1>
              <p class="mt-6 max-w-sm text-sm leading-relaxed text-text-secondary">
                写入基础配置。完成权限验证后即可接入核心节点。
              </p>
            </div>
          </div>

          <div class="relative z-10 rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-md">
            <p class="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-success-400 mb-3">注册条件</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="gate in gateLabels"
                :key="gate.label"
                class="rounded-lg px-2 py-1 text-[0.65rem] font-mono border"
                :class="gate.enabled ? 'border-success-500/50 bg-success-500/20 text-success-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'border-white/10 bg-white/5 text-text-muted'"
              >
                {{ gate.label }}
              </span>
            </div>
          </div>
        </aside>

        <!-- Right Form -->
        <form class="relative z-10 flex flex-col justify-center p-6 md:p-10 lg:p-12 bg-surface-card/20" @submit.prevent="handleRegister">
          <div class="mx-auto w-full max-w-[500px]">
            <div class="flex items-center justify-between mb-8">
              <div>
                <p class="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-brand-400">节点接入</p>
                <h2 class="mt-2 text-2xl font-black tracking-wide text-white">申请接入权限</h2>
              </div>
              <RouterLink
                to="/login"
                class="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-text-muted transition hover:border-brand-500/50 hover:text-brand-400 hover:bg-brand-500/10"
              >
                返回鉴权
              </RouterLink>
            </div>

            <div v-if="settingsLoaded && !registrationEnabled" class="mb-6 rounded-xl border border-warning-500/30 bg-warning-500/10 p-4 backdrop-blur-md">
              <p class="text-sm font-bold text-warning-400">节点拒绝连接：当前时段未开放公共注册。</p>
              <p class="mt-1 text-xs text-warning-500">请联络终端管理员获取专属授权。</p>
            </div>

            <div v-if="errorMessage" class="mb-6 rounded-xl border border-danger-500/30 bg-danger-500/10 px-4 py-3 text-sm font-bold text-danger-400 backdrop-blur-md">
              {{ errorMessage }}
            </div>

            <div class="grid gap-5">
              <FlowField v-model="form.email" label="邮箱地址" placeholder="输入邮箱地址" type="email" />
              
              <div class="relative">
                <FlowField v-model="form.password" label="安全密码" placeholder="至少 6 位密码" :type="showPassword ? 'text' : 'password'" />
                <button
                  type="button"
                  class="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-text-muted hover:text-white transition"
                  @click="showPassword = !showPassword"
                >
                  <svg v-if="!showPassword" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                </button>
              </div>

              <!-- Extra Fields Panel -->
              <div class="rounded-2xl border border-white/5 bg-black/20 p-4 relative overflow-hidden group transition hover:border-brand-500/20">
                <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <p class="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-text-muted mb-4 relative z-10">可选参数</p>
                
                <div class="grid gap-3 relative z-10">
                  <FlowField
                    v-if="invitationCodeEnabled"
                    v-model="form.invitation_code"
                    label="邀请码"
                    placeholder="输入邀请码"
                    @update:model-value="handleInvitationInput"
                  />
                  <FlowField
                    v-if="promoCodeEnabled"
                    v-model="form.promo_code"
                    label="优惠码"
                    placeholder="输入权益码 (可选)"
                    @update:model-value="handlePromoInput"
                  />
                </div>

                <div class="mt-4 grid gap-2 relative z-10">
                  <div v-if="invitationStatus" class="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-mono border" :class="invitationStatusClass">
                    <span class="w-2 h-2 rounded-full" :class="invitationInvalid ? 'bg-danger-500' : 'bg-success-500'"></span>
                    {{ invitationStatus }}
                  </div>
                  <div v-if="promoStatus" class="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-mono border" :class="promoStatusClass">
                    <span class="w-2 h-2 rounded-full" :class="promoInvalid ? 'bg-danger-500' : 'bg-success-500'"></span>
                    {{ promoStatus }}
                  </div>
                  <p v-if="emailWhitelist.length" class="text-[0.65rem] text-text-muted">
                    <span class="text-brand-400">允许域名：</span> {{ emailWhitelist.join(', ') }}
                  </p>
                </div>
              </div>
            </div>

            <div v-if="turnstileEnabled && turnstileSiteKey" class="mt-6">
              <TurnstileWidget
                ref="turnstileRef"
                :site-key="turnstileSiteKey"
                @verify="turnstileToken = $event"
                @expire="turnstileToken = ''"
                @error="turnstileToken = ''"
              />
            </div>

            <div class="mt-8">
              <button
                type="submit"
                class="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-success-600 px-6 py-4 font-bold text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] transition hover:bg-success-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="submitDisabled"
              >
                <div class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full"></div>
                <span class="relative z-10">{{ submitLabel }}</span>
                <span class="relative z-10 font-mono text-xs opacity-70 group-hover:opacity-100 transition-opacity">>></span>
              </button>
            </div>

            <div class="mt-8 flex gap-2 w-full justify-between">
              <div
                v-for="(step, index) in forgeSteps"
                :key="step.title"
                class="flex-1 rounded-lg border border-white/5 bg-white/5 p-3 relative overflow-hidden group"
              >
                <div class="absolute left-0 top-0 h-full w-1 bg-white/10 group-hover:bg-brand-500 transition-colors"></div>
                <div class="pl-2">
                  <strong class="block text-[0.7rem] font-bold text-white mb-1 tracking-wider">{{ step.title }}</strong>
                  <p class="text-[0.6rem] leading-snug text-text-muted hidden sm:block">{{ step.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { FlowField } from '@/components/atlas'
import TurnstileWidget from '@/components/TurnstileWidget.vue'
import {
  getPublicSettings,
  resolveWeChatOAuthStart,
  validateInvitationCode,
  validatePromoCode,
} from '@/api/auth'
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

const form = reactive({
  email: '',
  password: '',
  promo_code: '',
  invitation_code: '',
})

const settingsLoaded = ref(false)
const registrationEnabled = ref(true)
const emailVerifyEnabled = ref(false)
const promoCodeEnabled = ref(true)
const invitationCodeEnabled = ref(false)
const turnstileEnabled = ref(false)
const turnstileSiteKey = ref('')
const linuxdoEnabled = ref(false)
const wechatEnabled = ref(false)
const oidcEnabled = ref(false)
const emailWhitelist = ref<string[]>([])

const showPassword = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')
const turnstileToken = ref('')
const turnstileRef = ref<InstanceType<typeof TurnstileWidget> | null>(null)

const promoValidating = ref(false)
const promoInvalid = ref(false)
const promoStatus = ref('')
let promoTimer: ReturnType<typeof window.setTimeout> | null = null

const invitationValidating = ref(false)
const invitationInvalid = ref(false)
const invitationStatus = ref('')
let invitationTimer: ReturnType<typeof window.setTimeout> | null = null

const forgeSteps = [
  { title: '环境检查', tag: '01', description: '验证注册条件' },
  { title: '信息录入', tag: '02', description: '填写账号信息' },
  { title: '完成注册', tag: '03', description: '确认并提交' },
]

const gateLabels = computed(() => [
  { label: '注册开关', enabled: registrationEnabled.value },
  { label: '邮箱验证', enabled: emailVerifyEnabled.value },
  { label: '邀请码', enabled: invitationCodeEnabled.value },
  { label: '优惠码', enabled: promoCodeEnabled.value },
  { label: '人机验证', enabled: turnstileEnabled.value },
  { label: '第三方登录', enabled: linuxdoEnabled.value || wechatEnabled.value || oidcEnabled.value },
])

const submitLabel = computed(() => {
  if (isSubmitting.value) {
    return emailVerifyEnabled.value ? '发送中...' : '注册中...'
  }
  return emailVerifyEnabled.value ? '发送验证码' : '立即注册'
})

const submitDisabled = computed(() => {
  if (isSubmitting.value || !registrationEnabled.value) {
    return true
  }
  if (!form.email.trim() || !form.password.trim()) {
    return true
  }
  if (turnstileEnabled.value && !turnstileToken.value) {
    return true
  }
  if (promoValidating.value || invitationValidating.value || promoInvalid.value || invitationInvalid.value) {
    return true
  }
  return false
})

const promoStatusClass = computed(() => {
  if (promoInvalid.value) {
    return 'border-danger-500/30 bg-danger-500/10 text-danger-300'
  }
  return 'border-success-500/30 bg-success-500/10 text-success-300'
})

const invitationStatusClass = computed(() => {
  if (invitationInvalid.value) {
    return 'border-danger-500/30 bg-danger-500/10 text-danger-300'
  }
  return 'border-success-500/30 bg-success-500/10 text-success-300'
})

onMounted(async () => {
  try {
    const settings = await appStore.fetchPublicSettings()
    registrationEnabled.value = settings.registration_enabled ?? true
    emailVerifyEnabled.value = settings.email_verify_enabled ?? false
    promoCodeEnabled.value = settings.promo_code_enabled ?? true
    invitationCodeEnabled.value = settings.invitation_code_enabled ?? false
    turnstileEnabled.value = settings.turnstile_enabled
    turnstileSiteKey.value = settings.turnstile_site_key || ''
    linuxdoEnabled.value = settings.linuxdo_oauth_enabled
    wechatEnabled.value = Boolean(resolveWeChatOAuthStart(settings).mode)
    oidcEnabled.value = settings.oidc_oauth_enabled
    emailWhitelist.value = normalizeEmailSuffixWhitelist(settings.registration_email_suffix_whitelist)
  } catch {
    appStore.showWarning('节点配置同步失败，使用默认参数。')
  } finally {
    settingsLoaded.value = true
  }
})

function validateForm(): boolean {
  errorMessage.value = ''

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errorMessage.value = '邮箱格式不正确。'
    return false
  }

  if (!isEmailSuffixAllowed(form.email, emailWhitelist.value)) {
    errorMessage.value = buildEmailSuffixMessage(emailWhitelist.value)
    return false
  }

  if (form.password.length < 6) {
    errorMessage.value = '密码长度不能少于 6 位。'
    return false
  }

  if (invitationCodeEnabled.value && !form.invitation_code.trim()) {
    errorMessage.value = '请填写邀请码。'
    return false
  }

  if (turnstileEnabled.value && !turnstileToken.value) {
    errorMessage.value = '请完成人机验证。'
    return false
  }

  return true
}

function handlePromoInput() {
  promoStatus.value = ''
  promoInvalid.value = false

  if (promoTimer) {
    window.clearTimeout(promoTimer)
  }

  const code = form.promo_code.trim()
  if (!code) {
    promoValidating.value = false
    return
  }

  promoValidating.value = true
  promoStatus.value = '正在验证优惠码...'
  promoTimer = window.setTimeout(async () => {
    try {
      const result = await validatePromoCode(code)
      promoInvalid.value = !result.valid
      promoStatus.value = result.valid
        ? `有效，赠送额度：${typeof result.bonus_amount === 'number' ? result.bonus_amount.toFixed(2) : '未知'}`
        : result.message || '优惠码无效。'
    } catch (error) {
      promoInvalid.value = true
      promoStatus.value = buildAuthErrorMessage(error, '验证失败。')
    } finally {
      promoValidating.value = false
    }
  }, 450)
}

function handleInvitationInput() {
  invitationStatus.value = ''
  invitationInvalid.value = false

  if (invitationTimer) {
    window.clearTimeout(invitationTimer)
  }

  const code = form.invitation_code.trim()
  if (!code) {
    invitationValidating.value = false
    return
  }

  invitationValidating.value = true
  invitationStatus.value = '正在验证邀请码...'
  invitationTimer = window.setTimeout(async () => {
    try {
      const result = await validateInvitationCode(code)
      invitationInvalid.value = !result.valid
      invitationStatus.value = result.valid ? '邀请码有效。' : '邀请码无效。'
    } catch (error) {
      invitationInvalid.value = true
      invitationStatus.value = buildAuthErrorMessage(error, '验证失败。')
    } finally {
      invitationValidating.value = false
    }
  }, 450)
}

async function handleRegister() {
  if (!validateForm()) {
    appStore.showError(errorMessage.value)
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  const payload = {
    email: form.email.trim(),
    password: form.password,
    turnstile_token: turnstileEnabled.value ? turnstileToken.value : undefined,
    promo_code: form.promo_code.trim() || undefined,
    invitation_code: form.invitation_code.trim() || undefined,
  }

  try {
    if (emailVerifyEnabled.value) {
      sessionStorage.setItem('register_data', JSON.stringify(payload))
      await router.push('/email-verify')
      return
    }

    await authStore.register(payload)
    appStore.showSuccess('注册成功，正在跳转...')
    await router.push('/dashboard')
  } catch (error) {
    errorMessage.value = buildAuthErrorMessage(error, '注册失败，请检查输入信息。')
    appStore.showError(errorMessage.value)
    if (turnstileRef.value) {
      turnstileRef.value.reset()
      turnstileToken.value = ''
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>
