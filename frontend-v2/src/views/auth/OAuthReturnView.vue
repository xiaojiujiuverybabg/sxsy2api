<template>
  <section class="grid w-full max-w-7xl gap-6 xl:grid-cols-[0.88fr_1.12fr]">
    <aside class="relative overflow-hidden rounded-[38px] bg-neutral-900 p-7 text-white shadow-panel md:p-9">
      <div class="pointer-events-none absolute -right-20 top-12 h-60 w-60 rounded-full bg-brand-500/25 blur-3xl"></div>
      <div class="pointer-events-none absolute -bottom-20 left-8 h-64 w-64 rounded-full bg-success-400/25 blur-3xl"></div>
      <div class="relative">
        <p class="text-xs font-black uppercase tracking-[0.36em] text-brand-100/80">身份回流</p>
        <h1 class="mt-5 text-5xl font-black leading-[0.96] tracking-tight">{{ providerLabel }} 身份回流</h1>
        <p class="mt-5 text-sm leading-7 text-white/65">
          正在处理第三方身份结果。按提示补全信息后即可进入工作台。
        </p>
        <div class="mt-9 grid gap-3">
          <article
            v-for="item in timeline"
            :key="item.title"
            class="rounded-[26px] border border-white/10 bg-white/10 p-4"
          >
            <div class="flex items-center justify-between gap-3">
              <strong class="text-sm font-black">{{ item.title }}</strong>
              <span class="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white/60">{{ item.tag }}</span>
            </div>
            <p class="mt-2 text-xs leading-5 text-white/60">{{ item.description }}</p>
          </article>
        </div>
      </div>
    </aside>

    <main class="rounded-[38px] border border-line bg-white p-6 shadow-panel md:p-8">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p class="text-xs font-black uppercase tracking-[0.32em] text-brand-700">回调控制台</p>
          <h2 class="mt-3 text-4xl font-black tracking-tight text-text-primary md:text-5xl">{{ stateTitle }}</h2>
          <p class="mt-3 max-w-2xl text-sm leading-7 text-text-secondary">{{ stateDescription }}</p>
        </div>
        <span class="rounded-full px-4 py-2 text-xs font-black" :class="statePillClass">{{ statePill }}</span>
      </div>

      <div v-if="errorMessage" class="mt-7 rounded-[24px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
        {{ errorMessage }}
      </div>

      <div v-if="mode === 'debug'" class="mt-8 grid gap-4">
        <div v-for="item in debugItems" :key="item.label" class="rounded-[24px] border border-line bg-surface-soft p-4">
          <p class="text-xs font-black uppercase tracking-[0.26em] text-text-muted">{{ item.label }}</p>
          <p class="mt-2 break-all font-mono text-sm font-bold text-text-primary">{{ item.value || '空' }}</p>
        </div>
      </div>

      <div v-else-if="mode === 'processing'" class="mt-8 rounded-[30px] border border-line bg-surface-soft p-6">
        <div class="h-2 overflow-hidden rounded-full bg-white">
          <div class="h-full w-2/3 animate-pulse rounded-full bg-brand-500"></div>
        </div>
        <p class="mt-4 text-sm font-bold text-text-secondary">正在确认身份结果，并准备下一步操作。</p>
      </div>

      <div v-else-if="mode === 'invitation'" class="mt-8 grid gap-4">
        <p class="rounded-[24px] border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
          当前注册需要邀请码。
        </p>
        <FlowField v-model="invitationCode" label="邀请码" placeholder="请输入邀请码" />
        <button
          type="button"
          class="rounded-[26px] border border-brand-500 bg-brand-500 px-6 py-5 text-left text-sm font-black text-white transition hover:border-brand-700 hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isSubmitting || !invitationCode.trim()"
          @click="submitInvitation"
        >
          {{ isSubmitting ? '正在完成注册' : '提交邀请码并继续' }}
        </button>
      </div>

      <div v-else-if="mode === 'choice'" class="mt-8 grid gap-4 md:grid-cols-2">
        <button
          type="button"
          class="rounded-[28px] border border-line bg-surface-soft p-5 text-left transition hover:border-brand-300 hover:bg-white"
          :disabled="isSubmitting"
          @click="mode = 'bind'"
        >
          <strong class="block text-lg font-black text-text-primary">绑定已有账号</strong>
          <span class="mt-2 block text-sm leading-6 text-text-secondary">使用已有账号登录，并把 {{ providerLabel }} 身份绑定上去。</span>
        </button>
        <button
          type="button"
          class="rounded-[28px] border border-brand-200 bg-brand-50 p-5 text-left transition hover:border-brand-400 hover:bg-white"
          :disabled="isSubmitting"
          @click="mode = 'create'"
        >
          <strong class="block text-lg font-black text-brand-800">创建新账号</strong>
          <span class="mt-2 block text-sm leading-6 text-brand-700">使用第三方身份补全邮箱和密码，创建新的本地账号。</span>
        </button>
      </div>

      <div v-else-if="mode === 'create'" class="mt-8 grid gap-4">
        <FlowField v-model="createForm.email" label="邮箱" placeholder="邮箱地址" type="email" />
        <FlowField v-model="createForm.password" label="密码" placeholder="创建密码" type="password" />
        <FlowField v-model="createForm.verifyCode" label="验证码" placeholder="如已发送验证码，请输入 6 位验证码" />
        <FlowField v-model="createForm.invitationCode" label="邀请码（可选）" placeholder="邀请码，可选" />
        <div class="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            class="rounded-[24px] border border-line bg-surface-soft px-5 py-4 text-sm font-black text-text-secondary transition hover:border-brand-300 hover:bg-white hover:text-brand-700"
            :disabled="isSubmitting || !createForm.email.trim()"
            @click="sendCreateVerifyCode"
          >
            发送邮箱验证码
          </button>
          <button
            type="button"
            class="rounded-[24px] border border-brand-500 bg-brand-500 px-5 py-4 text-sm font-black text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isSubmitting || !createForm.email.trim() || !createForm.password"
            @click="submitCreateAccount"
          >
            {{ isSubmitting ? '处理中' : '创建并继续' }}
          </button>
        </div>
      </div>

      <div v-else-if="mode === 'bind'" class="mt-8 grid gap-4">
        <FlowField v-model="bindForm.email" label="已有账号邮箱" placeholder="已有账号邮箱" type="email" />
        <FlowField v-model="bindForm.password" label="已有账号密码" placeholder="已有账号密码" type="password" />
        <button
          type="button"
          class="rounded-[26px] border border-brand-500 bg-brand-500 px-6 py-5 text-left text-sm font-black text-white transition hover:border-brand-700 hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isSubmitting || !bindForm.email.trim() || !bindForm.password"
          @click="submitBindLogin"
        >
          {{ isSubmitting ? '正在绑定' : '登录并绑定身份' }}
        </button>
      </div>

      <div v-else-if="mode === 'totp'" class="mt-8 grid gap-4">
        <p class="rounded-[24px] border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
          {{ totpMaskedEmail || '该账号启用了两步验证，请输入 6 位验证码。' }}
        </p>
        <FlowField v-model="totpCode" label="2FA Code" placeholder="请输入 6 位验证码" />
        <button
          type="button"
          class="rounded-[26px] border border-brand-500 bg-brand-500 px-6 py-5 text-left text-sm font-black text-white transition hover:border-brand-700 hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isSubmitting || totpCode.trim().length !== 6"
          @click="submitTotp"
        >
          {{ isSubmitting ? '验证中' : '完成两步验证' }}
        </button>
      </div>

      <div class="mt-8 flex flex-wrap gap-3 text-sm font-black">
        <RouterLink to="/login" class="text-brand-700 transition hover:text-brand-500">返回登录</RouterLink>
        <RouterLink to="/home" class="text-text-muted transition hover:text-text-primary">返回首页</RouterLink>
      </div>
    </main>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { FlowField } from '@/components/atlas'
import {
  bindPendingOAuthLogin,
  completeOAuthRegistration,
  createPendingOAuthAccount,
  exchangePendingOAuthCompletion,
  login2FA,
  sendVerifyCode,
  type OAuthCompletionResponse,
  type OAuthAdoptionDecision,
} from '@/api/auth'
import { useAppStore, useAuthStore } from '@/stores'
import { buildAuthErrorMessage } from '@/utils/auth'

type Provider = 'generic' | 'linuxdo' | 'wechat' | 'oidc'
type Mode = 'processing' | 'debug' | 'invitation' | 'choice' | 'create' | 'bind' | 'totp' | 'complete' | 'error'

const props = defineProps<{
  provider: Provider
}>()

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()

const mode = ref<Mode>('processing')
const isSubmitting = ref(false)
const errorMessage = ref('')
const invitationCode = ref('')
const redirectTo = ref('/dashboard')
const totpTempToken = ref('')
const totpMaskedEmail = ref('')
const totpCode = ref('')
const adoptDisplayName = ref(true)
const adoptAvatar = ref(true)

const createForm = reactive({
  email: '',
  password: '',
  verifyCode: '',
  invitationCode: '',
})

const bindForm = reactive({
  email: '',
  password: '',
})

const providerLabel = computed(() => {
  if (props.provider === 'linuxdo') {
    return 'LinuxDo'
  }
  if (props.provider === 'wechat') {
    return '微信'
  }
  if (props.provider === 'oidc') {
    return 'OIDC'
  }
  return 'OAuth'
})

const timeline = computed(() => [
  { tag: '01', title: '确认身份', description: `确认 ${providerLabel.value} 返回的身份结果。` },
  { tag: '02', title: '补全身份', description: '根据需要进入邀请码、创建账号、绑定账号或 2FA。' },
  { tag: '03', title: '回到工作台', description: '拿到 token 后刷新当前用户，并跳转到安全 redirect。' },
])

const stateTitle = computed(() => {
  if (mode.value === 'debug') return 'OAuth 参数检查'
  if (mode.value === 'invitation') return '需要邀请码'
  if (mode.value === 'choice') return '选择身份继续方式'
  if (mode.value === 'create') return '补全新账号'
  if (mode.value === 'bind') return '绑定已有账号'
  if (mode.value === 'totp') return '两步验证'
  if (mode.value === 'complete') return '身份回流完成'
  if (mode.value === 'error') return '身份回流失败'
  return '正在处理身份回流'
})

const stateDescription = computed(() => {
  if (mode.value === 'debug') return '此通用回调页只展示 code/state/full URL，供手动调试使用。'
  if (mode.value === 'invitation') return '请输入邀请码完成注册。'
  if (mode.value === 'choice') return '该第三方身份需要选择创建新账号或绑定已有账号。'
  if (mode.value === 'create') return '补全邮箱、密码和验证码后创建本地账号。'
  if (mode.value === 'bind') return '输入已有账号密码，把第三方身份绑定到该账号。'
  if (mode.value === 'totp') return '已有账号启用 2FA，需要完成二次验证。'
  if (mode.value === 'complete') return '即将进入目标页面。'
  if (mode.value === 'error') return '身份结果无法继续处理。'
  return '正在确认第三方身份结果。'
})

const statePill = computed(() => (mode.value === 'error' ? '错误' : mode.value === 'processing' ? '处理中' : '需要操作'))
const statePillClass = computed(() => {
  if (mode.value === 'error') return 'bg-red-50 text-red-700'
  if (mode.value === 'processing') return 'bg-amber-50 text-amber-700'
  return 'bg-emerald-50 text-emerald-700'
})

const debugItems = computed(() => [
  { label: 'code', value: String(route.query.code || '') },
  { label: 'state', value: String(route.query.state || '') },
  { label: 'error', value: String(route.query.error || route.query.error_description || '') },
  { label: 'full url', value: typeof window === 'undefined' ? '' : window.location.href },
])

onMounted(async () => {
  redirectTo.value = sanitizeRedirect(String(route.query.redirect || authStore.pendingOAuthSession?.redirect || '/dashboard'))

  if (props.provider === 'generic') {
    mode.value = 'debug'
    const error = String(route.query.error || route.query.error_description || '')
    if (error) {
      errorMessage.value = error
      appStore.showError(error)
    }
    return
  }

  const fragment = parseFragment()
  const fragmentToken = fragment.get('access_token') || ''
  if (fragmentToken) {
    await finalizeAuth({
      access_token: fragmentToken,
      refresh_token: fragment.get('refresh_token') || undefined,
      expires_in: Number(fragment.get('expires_in') || 0) || undefined,
      token_type: fragment.get('token_type') || 'bearer',
    })
    return
  }

  const fragmentError = fragment.get('error') || fragment.get('error_description') || ''
  if (fragmentError) {
    setError(fragmentError)
    return
  }

  try {
    const completion = await exchangePendingOAuthCompletion()
    await handleCompletion(completion)
  } catch (error) {
    setError(buildAuthErrorMessage(error, 'OAuth 回调处理失败。'))
  }
})

function parseFragment(): URLSearchParams {
  const hash = typeof window === 'undefined' ? '' : window.location.hash.replace(/^#/, '')
  return new URLSearchParams(hash)
}

function sanitizeRedirect(path: string): string {
  if (!path || !path.startsWith('/') || path.startsWith('//') || path.includes('://')) {
    return '/dashboard'
  }
  return path
}

function decision(): OAuthAdoptionDecision {
  return {
    adopt_display_name: adoptDisplayName.value,
    adopt_avatar: adoptAvatar.value,
  }
}

function setError(message: string) {
  errorMessage.value = message
  mode.value = 'error'
  appStore.showError(message)
}

function applySuggestedEmail(completion: OAuthCompletionResponse) {
  const email =
    completion.email ||
    completion.resolved_email ||
    completion.pending_email ||
    completion.existing_account_email ||
    completion.suggested_email ||
    ''
  if (email) {
    createForm.email = email
    bindForm.email = email
  }
}

async function handleCompletion(completion: OAuthCompletionResponse) {
  redirectTo.value = sanitizeRedirect(completion.redirect || redirectTo.value)
  applySuggestedEmail(completion)

  if (completion.error === 'invitation_required') {
    mode.value = 'invitation'
    authStore.setPendingOAuthSession({ provider: props.provider, redirect: redirectTo.value })
    return
  }

  if (completion.requires_2fa && completion.temp_token) {
    totpTempToken.value = completion.temp_token
    totpMaskedEmail.value = completion.user_email_masked || ''
    mode.value = 'totp'
    authStore.setPendingOAuthSession({ provider: props.provider, redirect: redirectTo.value })
    return
  }

  const step = String(completion.step || completion.error || completion.intent || '').toLowerCase()
  if (
    ['choice', 'choose_account_action_required', 'choose_account_action', 'choose_account', 'choose'].includes(step)
  ) {
    mode.value = 'choice'
    authStore.setPendingOAuthSession({ provider: props.provider, redirect: redirectTo.value })
    return
  }

  if (['email_required', 'create_account_required', 'create_account'].includes(step)) {
    mode.value = 'create'
    authStore.setPendingOAuthSession({ provider: props.provider, redirect: redirectTo.value })
    return
  }

  if (
    ['bind_login_required', 'bind_login', 'existing_account', 'existing_account_required', 'existing_account_binding_required'].includes(step)
  ) {
    mode.value = 'bind'
    authStore.setPendingOAuthSession({ provider: props.provider, redirect: redirectTo.value })
    return
  }

  if (completion.access_token) {
    await finalizeAuth(completion)
    return
  }

  if (completion.auth_result === 'pending_session') {
    mode.value = 'choice'
    authStore.setPendingOAuthSession({ provider: props.provider, redirect: redirectTo.value })
    return
  }

  setError(completion.message || 'OAuth 回调未返回可继续的状态。')
}

async function finalizeAuth(completion: OAuthCompletionResponse) {
  if (!completion.access_token) {
    setError('OAuth 回调未返回访问令牌。')
    return
  }

  mode.value = 'complete'
  await authStore.setToken(completion.access_token, completion.refresh_token, completion.expires_in)
  authStore.clearPendingOAuthSession()
  appStore.showSuccess(`${providerLabel.value} 身份登录成功。`)
  await router.replace(sanitizeRedirect(completion.redirect || redirectTo.value))
}

async function submitInvitation() {
  if (props.provider === 'generic') return

  isSubmitting.value = true
  try {
    const completion = await completeOAuthRegistration(props.provider, invitationCode.value.trim(), decision())
    await handleCompletion(completion)
  } catch (error) {
    setError(buildAuthErrorMessage(error, '邀请码提交失败。'))
  } finally {
    isSubmitting.value = false
  }
}

async function sendCreateVerifyCode() {
  isSubmitting.value = true
  try {
    await sendVerifyCode({ email: createForm.email.trim() })
    appStore.showInfo('验证码已发送，请检查邮箱。')
  } catch (error) {
    setError(buildAuthErrorMessage(error, '验证码发送失败。'))
  } finally {
    isSubmitting.value = false
  }
}

async function submitCreateAccount() {
  isSubmitting.value = true
  try {
    const completion = await createPendingOAuthAccount({
      email: createForm.email.trim(),
      password: createForm.password,
      verify_code: createForm.verifyCode.trim() || undefined,
      invitation_code: createForm.invitationCode.trim() || undefined,
      ...decision(),
    })
    await handleCompletion(completion)
  } catch (error) {
    setError(buildAuthErrorMessage(error, '第三方账号创建失败。'))
  } finally {
    isSubmitting.value = false
  }
}

async function submitBindLogin() {
  isSubmitting.value = true
  try {
    const completion = await bindPendingOAuthLogin({
      email: bindForm.email.trim(),
      password: bindForm.password,
      ...decision(),
    })
    await handleCompletion(completion)
  } catch (error) {
    setError(buildAuthErrorMessage(error, '第三方身份绑定失败。'))
  } finally {
    isSubmitting.value = false
  }
}

async function submitTotp() {
  isSubmitting.value = true
  try {
    const completion = await login2FA({
      temp_token: totpTempToken.value,
      totp_code: totpCode.value.trim(),
    })
    await finalizeAuth(completion)
  } catch (error) {
    setError(buildAuthErrorMessage(error, '两步验证失败。'))
  } finally {
    isSubmitting.value = false
  }
}
</script>
