<template>
  <section class="w-full max-w-5xl px-4 relative z-10">
    <div class="relative overflow-hidden rounded-3xl border border-brand-500/15 bg-surface-card/60 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(220,38,38,0.1),transparent_40%),radial-gradient(circle_at_100%_100%,rgba(212,160,23,0.08),transparent_40%)]"></div>

      <div class="relative grid min-h-[640px] lg:grid-cols-[0.9fr_1.1fr]">
        <!-- Left Banner -->
        <aside class="relative overflow-hidden border-r border-white/10 bg-surface-page/50 p-8 text-white md:p-10 flex flex-col justify-between hidden lg:flex">
          <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTAgMGgyMHYyMEgwem0xIDEwSDBWMGgxMHYxem0wIDBWMjBoMTBWMTB6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=')] opacity-30"></div>
          
          <div class="relative z-10">
            <div class="flex items-center gap-3">
              <span class="grid h-12 w-12 place-items-center rounded-xl bg-brand-500/20 shadow-[0_0_15px_rgba(220,38,38,0.5)] border border-brand-500/30 text-sm font-black text-brand-400">S2</span>
              <div>
                <p class="text-base font-black leading-none text-white tracking-widest">sxsy2Api</p>
                <p class="mt-1.5 text-[0.65rem] font-bold uppercase tracking-[0.3em] text-brand-400">身份通道</p>
              </div>
            </div>

            <div class="mt-20">
              <p class="text-xs font-bold uppercase tracking-[0.3em] text-brand-400">安全入口</p>
              <h1 class="mt-4 text-4xl font-black leading-tight tracking-tight text-white md:text-5xl">系统访问<br /><span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-gold-400">身份验证</span></h1>
              <p class="mt-6 max-w-sm text-sm leading-relaxed text-text-secondary">
                建立安全的连接通道。验证您的访问权限以进入核心控制台。
              </p>
            </div>
          </div>

          <div class="relative z-10 rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-md">
            <div class="flex items-center gap-3 mb-2">
              <div class="relative flex h-2 w-2">
                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75"></span>
                <span class="relative inline-flex h-2 w-2 rounded-full bg-brand-500"></span>
              </div>
              <p class="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-brand-400">通道状态</p>
            </div>
            <p class="text-xs font-mono leading-relaxed text-text-secondary">{{ statusHint }}</p>
          </div>
        </aside>

        <!-- Right Form -->
        <form class="relative z-10 flex flex-col justify-center p-6 md:p-10 lg:p-12 bg-surface-card/20" @submit.prevent="handleSubmit">
          <div class="mx-auto w-full max-w-[420px]">
            <div class="flex items-center justify-between mb-8">
              <div>
                <p class="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-brand-400">身份认证</p>
                <h2 class="mt-2 text-2xl font-black tracking-wide text-white">用户登录</h2>
              </div>
              <RouterLink to="/home" class="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-text-muted transition hover:border-brand-500/50 hover:text-brand-400 hover:bg-brand-500/10">
                返回首页
              </RouterLink>
            </div>

            <div v-if="errorMessage" class="mb-6 rounded-xl border border-danger-500/30 bg-danger-500/10 px-4 py-3 text-sm font-bold text-danger-400 backdrop-blur-md">
              {{ errorMessage }}
            </div>

            <div class="grid gap-5">
              <FlowField v-model="form.email" label="账号" placeholder="请输入邮箱地址" />
              <FlowField v-model="form.password" label="密码" placeholder="请输入密码" :type="showPassword ? 'text' : 'password'" />
            </div>

            <div class="mt-5 flex items-center justify-between text-xs">
              <label class="group flex cursor-pointer items-center gap-2 font-medium text-text-secondary transition hover:text-white">
                <div class="relative flex h-4 w-4 items-center justify-center rounded border border-white/20 bg-black/30 transition group-hover:border-brand-500/50">
                  <input v-model="rememberMe" type="checkbox" class="peer absolute h-full w-full cursor-pointer opacity-0" />
                  <div class="scale-0 text-brand-400 transition-transform peer-checked:scale-100">
                    <svg class="h-3 w-3 fill-current" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                  </div>
                </div>
                保持连接
              </label>
              <RouterLink
                v-if="publicSettings?.password_reset_enabled"
                to="/forgot-password"
                class="font-bold text-brand-400 transition hover:text-brand-300 hover:drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]"
              >
                重置密钥
              </RouterLink>
            </div>

            <div v-if="publicSettings?.turnstile_enabled && publicSettings.turnstile_site_key" class="mt-6">
              <TurnstileWidget
                ref="turnstileRef"
                :site-key="publicSettings.turnstile_site_key"
                @verify="turnstileToken = $event"
                @expire="turnstileToken = ''"
                @error="turnstileToken = ''"
              />
            </div>

            <div class="mt-8 grid gap-4 sm:grid-cols-[1fr_auto]">
              <button
                type="submit"
                class="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-brand-500 px-6 py-4 font-bold text-white shadow-[0_0_20px_rgba(220,38,38,0.3)] transition hover:bg-brand-400 hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="submitDisabled"
              >
                <div class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full"></div>
                <span class="relative z-10">{{ isSubmitting ? '验证中...' : '建立连接' }}</span>
                <span class="relative z-10 font-mono text-xs opacity-70 group-hover:opacity-100 transition-opacity">>></span>
              </button>

              <button
                type="button"
                class="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-xs font-bold text-text-secondary backdrop-blur-md transition hover:border-brand-500/50 hover:bg-brand-500/10 hover:text-brand-400"
                @click="showPassword = !showPassword"
                title="切换密码显示"
              >
                <svg v-if="!showPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
              </button>
            </div>

            <div class="mt-8 flex items-center gap-4 before:h-px before:flex-1 before:bg-white/10 after:h-px after:flex-1 after:bg-white/10">
              <span class="text-[0.65rem] font-bold uppercase tracking-widest text-text-muted">其他方式</span>
            </div>

            <div class="mt-6 grid gap-3">
              <button
                v-for="method in authMethods.filter(m => m.label !== '密码身份登录')"
                :key="method.label"
                type="button"
                class="group relative flex items-center gap-4 overflow-hidden rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:border-brand-500/50 hover:bg-brand-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="method.disabled || isSubmitting"
                @click="method.action"
              >
                <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/40 text-brand-400 transition group-hover:bg-brand-500 group-hover:text-white group-hover:shadow-[0_0_10px_rgba(220,38,38,0.8)]">
                  <span class="font-mono text-xs">>_</span>
                </div>
                <div class="flex-1">
                  <strong class="block text-sm font-bold text-white transition group-hover:text-brand-300">{{ method.label }}</strong>
                  <span class="block text-[0.65rem] text-text-muted">{{ method.description }}</span>
                </div>
              </button>
            </div>

            <div class="mt-8 text-center text-xs font-medium text-text-muted">
              未注册节点账号？ <RouterLink to="/register" class="font-bold text-brand-400 hover:text-brand-300 hover:underline underline-offset-4">立即初始化身份</RouterLink>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- 2FA Modal -->
    <div v-if="show2FAModal" class="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <section class="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-surface-card/80 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(220,38,38,0.1),transparent_50%)]"></div>
        <div class="relative z-10">
          <p class="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-brand-400">第二步 / 安全验证</p>
          <h3 class="mt-2 text-xl font-black text-white">双重验证协议</h3>
          <p class="mt-2 text-xs leading-relaxed text-text-secondary">
            {{ totpMaskedEmail || '该链路已加密，请输入动态指令 (6位数) 以完成最终握手。' }}
          </p>

          <div class="mt-6">
            <FlowField v-model="totpCode" label="验证码" placeholder="000000" />
          </div>

          <div class="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              class="rounded-xl border border-brand-500/50 bg-brand-500/20 px-5 py-3 text-sm font-bold text-brand-400 transition hover:bg-brand-500 hover:text-white hover:shadow-[0_0_15px_rgba(220,38,38,0.5)] disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="isVerifying2FA || totpCode.trim().length !== 6"
              @click="handle2FASubmit"
            >
              {{ isVerifying2FA ? '解析中...' : '提交指令' }}
            </button>
            <button
              type="button"
              class="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-text-secondary transition hover:bg-white/10 hover:text-white"
              :disabled="isVerifying2FA"
              @click="close2FAModal"
            >
              终止协议
            </button>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { FlowField } from '@/components/atlas'
import TurnstileWidget from '@/components/TurnstileWidget.vue'
import { useAppStore, useAuthStore } from '@/stores'
import { getPublicSettings, isTotp2FARequired, resolveWeChatOAuthStart } from '@/api/auth'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const authStore = useAuthStore()

const form = reactive({
  email: '',
  password: '',
})

const rememberMe = ref(false)
const isSubmitting = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')
const publicSettings = ref<Awaited<ReturnType<typeof getPublicSettings>> | null>(null)
const turnstileToken = ref('')
const turnstileRef = ref<InstanceType<typeof TurnstileWidget> | null>(null)

const show2FAModal = ref(false)
const totpTempToken = ref('')
const totpMaskedEmail = ref('')
const totpCode = ref('')
const isVerifying2FA = ref(false)

const redirectTo = computed(() => String(route.query.redirect || '/dashboard'))

const submitDisabled = computed(() => {
  if (isSubmitting.value) {
    return true
  }
  if (!form.email.trim() || !form.password.trim()) {
    return true
  }
  if (publicSettings.value?.turnstile_enabled) {
    return !turnstileToken.value
  }
  return false
})

const statusHint = computed(() => {
  if (!publicSettings.value) {
    return '正在初始化安全连接...'
  }

  const enabled = [
    publicSettings.value.linuxdo_oauth_enabled ? 'LinuxDo' : '',
    publicSettings.value.wechat_oauth_enabled ||
    publicSettings.value.wechat_oauth_open_enabled ||
    publicSettings.value.wechat_oauth_mp_enabled
      ? '微信'
      : '',
    publicSettings.value.oidc_oauth_enabled ? publicSettings.value.oidc_oauth_provider_name || 'OIDC' : '',
  ].filter(Boolean)

  if (!enabled.length) {
    return '当前仅开放密码认证通道。'
  }

  return `已启用节点：${enabled.join(' / ')}。`
})

const authMethods = computed(() => {
  const methods = [
    {
      label: '密码身份登录',
      description: '使用账号密码进入用户工作台或管理控制台',
      disabled: false,
      action: () => {
        const element = document.querySelector('input')
        if (element instanceof HTMLInputElement) {
          element.focus()
        }
      },
    },
  ]

  if (publicSettings.value?.linuxdo_oauth_enabled) {
    methods.push({
      label: 'LinuxDo 登录',
      description: '通过 LinuxDo 节点进行验证',
      disabled: false,
      action: () => startOAuth('linuxdo'),
    })
  }

  const wechatAvailable = publicSettings.value
    ? resolveWeChatOAuthStart(publicSettings.value).mode
    : null
  if (
    publicSettings.value &&
    (publicSettings.value.wechat_oauth_enabled ||
      publicSettings.value.wechat_oauth_open_enabled ||
      publicSettings.value.wechat_oauth_mp_enabled)
  ) {
    methods.push({
      label: '微信授权',
      description:
        wechatAvailable === null
          ? '微信环境当前离线'
          : '通过微信通道进行连接',
      disabled: wechatAvailable === null,
      action: () => startWechatOAuth(),
    })
  }

  if (publicSettings.value?.oidc_oauth_enabled) {
    methods.push({
      label: `${publicSettings.value.oidc_oauth_provider_name || '企业'} 单点登录`,
      description: '接入企业级身份验证',
      disabled: false,
      action: () => startOAuth('oidc'),
    })
  }

  return methods
})

onMounted(async () => {
  try {
    publicSettings.value = await appStore.fetchPublicSettings()
  } catch {
    appStore.showWarning('节点配置同步失败，正在使用离线模式。')
  }
})

function startOAuth(provider: 'linuxdo' | 'oidc') {
  const apiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined) || '/api/v1'
  const normalized = apiBase.replace(/\/$/, '')
  window.location.href = `${normalized}/auth/oauth/${provider}/start?redirect=${encodeURIComponent(redirectTo.value)}`
}

function startWechatOAuth() {
  if (!publicSettings.value) {
    return
  }

  const resolved = resolveWeChatOAuthStart(publicSettings.value)
  if (!resolved.mode) {
    appStore.showWarning('当前环境下无法直接发起微信登录。')
    return
  }

  const apiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined) || '/api/v1'
  const normalized = apiBase.replace(/\/$/, '')
  window.location.href =
    `${normalized}/auth/oauth/wechat/start?mode=${resolved.mode}&redirect=${encodeURIComponent(redirectTo.value)}`
}

async function handleSubmit() {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    const response = await authStore.login({
      email: form.email.trim(),
      password: form.password,
      turnstile_token: publicSettings.value?.turnstile_enabled ? turnstileToken.value : undefined,
    })

    if (isTotp2FARequired(response)) {
      show2FAModal.value = true
      totpTempToken.value = response.temp_token || ''
      totpMaskedEmail.value = response.user_email_masked || ''
      appStore.showInfo('加密链路已触发，请提供 2FA 指令。')
      return
    }

    if (!rememberMe.value) {
      sessionStorage.setItem('sxsy2api:session-only', 'true')
    }

    appStore.showSuccess('连接成功，正在重定向到控制中枢...')
    await router.push(redirectTo.value)
  } catch (error: any) {
    errorMessage.value = error?.response?.data?.detail || error?.message || '连接被拒绝，请检查您的凭证。'
    appStore.showError(errorMessage.value)
    if (turnstileRef.value) {
      turnstileRef.value.reset()
      turnstileToken.value = ''
    }
  } finally {
    isSubmitting.value = false
  }
}

async function handle2FASubmit() {
  if (totpCode.value.trim().length !== 6 || !totpTempToken.value) {
    return
  }

  isVerifying2FA.value = true
  try {
    await authStore.login2FA(totpTempToken.value, totpCode.value.trim())
    show2FAModal.value = false
    totpTempToken.value = ''
    totpMaskedEmail.value = ''
    totpCode.value = ''
    appStore.showSuccess('指令已确认，正在建立连接...')
    await router.push(redirectTo.value)
  } catch (error: any) {
    appStore.showError(error?.response?.data?.detail || error?.message || '指令无效，协议被终止。')
  } finally {
    isVerifying2FA.value = false
  }
}

function close2FAModal() {
  show2FAModal.value = false
  totpTempToken.value = ''
  totpMaskedEmail.value = ''
  totpCode.value = ''
}
</script>
