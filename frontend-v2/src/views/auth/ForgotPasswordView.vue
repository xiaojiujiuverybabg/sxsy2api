<template>
  <section class="grid w-full max-w-6xl gap-6 xl:grid-cols-[0.92fr_1.08fr]">
    <aside class="relative overflow-hidden rounded-[38px] bg-neutral-900 p-7 text-white shadow-panel md:p-9">
      <div class="pointer-events-none absolute -left-20 top-16 h-56 w-56 rounded-full bg-brand-500/25 blur-3xl"></div>
      <div class="pointer-events-none absolute -right-20 bottom-4 h-64 w-64 rounded-full bg-success-400/25 blur-3xl"></div>
      <div class="relative">
        <p class="text-xs font-black uppercase tracking-[0.36em] text-brand-100/80">恢复中心</p>
        <h1 class="mt-5 text-5xl font-black leading-[0.96] tracking-tight">把找回密码做成独立恢复任务。</h1>
        <p class="mt-5 text-sm leading-7 text-white/65">
          输入账号邮箱，我们会发送一封恢复邮件。
        </p>
        <div class="mt-8 grid gap-3">
          <article
            v-for="item in recoveryCards"
            :key="item.title"
            class="rounded-[26px] border border-white/10 bg-white/10 p-4"
          >
            <strong class="text-sm font-black">{{ item.title }}</strong>
            <p class="mt-2 text-xs leading-5 text-white/60">{{ item.description }}</p>
          </article>
        </div>
      </div>
    </aside>

    <form class="rounded-[38px] border border-line bg-white p-6 shadow-panel md:p-8" @submit.prevent="handleSubmit">
      <p class="text-xs font-black uppercase tracking-[0.32em] text-brand-700">重置链接</p>
      <h2 class="mt-3 text-4xl font-black tracking-tight text-text-primary md:text-5xl">发送密码重置链接</h2>
      <p class="mt-3 text-sm leading-7 text-text-secondary">
        如果邮箱存在，你会收到一封包含恢复链接的邮件。
      </p>

      <div v-if="isSubmitted" class="mt-8 rounded-[30px] border border-emerald-200 bg-emerald-50 p-6">
        <p class="text-lg font-black text-emerald-800">重置邮件已发送</p>
        <p class="mt-2 text-sm leading-6 text-emerald-700">
          如果邮箱存在，系统会发送重置链接。请检查收件箱后继续完成密码更新。
        </p>
        <RouterLink
          to="/login"
          class="mt-5 inline-flex rounded-full bg-success-500 px-5 py-3 text-sm font-black text-white transition hover:bg-success-600"
        >
          返回登录
        </RouterLink>
      </div>

      <template v-else>
        <div v-if="errorMessage" class="mt-7 rounded-[24px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {{ errorMessage }}
        </div>

        <div class="mt-8">
          <FlowField v-model="email" label="账号邮箱" placeholder="请输入注册邮箱" type="email" />
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

        <div class="mt-7 grid gap-3 sm:grid-cols-[1fr_auto]">
          <button
            type="submit"
            class="rounded-[26px] border border-brand-500 bg-brand-500 px-6 py-5 text-left text-sm font-black text-white transition hover:border-brand-700 hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="submitDisabled"
          >
            {{ isSubmitting ? '正在发送恢复邮件' : '发送恢复链接' }}
          </button>
          <RouterLink
            to="/login"
            class="rounded-[26px] border border-line bg-surface-soft px-6 py-5 text-center text-sm font-black text-text-secondary transition hover:border-brand-300 hover:bg-white hover:text-brand-700"
          >
            返回登录
          </RouterLink>
        </div>
      </template>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { FlowField } from '@/components/atlas'
import TurnstileWidget from '@/components/TurnstileWidget.vue'
import { forgotPassword } from '@/api/auth'
import { useAppStore } from '@/stores'
import { buildAuthErrorMessage } from '@/utils/auth'

const appStore = useAppStore()

const email = ref('')
const isSubmitting = ref(false)
const isSubmitted = ref(false)
const errorMessage = ref('')
const turnstileEnabled = ref(false)
const turnstileSiteKey = ref('')
const turnstileToken = ref('')
const turnstileRef = ref<InstanceType<typeof TurnstileWidget> | null>(null)

const recoveryCards = [
  { title: '邮箱确认', description: '只收集账号邮箱，避免在恢复入口暴露额外账号信息。' },
  { title: '安全邮件', description: '恢复链接会发送到你的账号邮箱。' },
  { title: '重置入口', description: '打开邮件链接后即可设置新密码。' },
]

const submitDisabled = computed(() => {
  if (isSubmitting.value || !email.value.trim()) {
    return true
  }
  return turnstileEnabled.value && !turnstileToken.value
})

onMounted(async () => {
  try {
    const settings = await appStore.fetchPublicSettings()
    turnstileEnabled.value = settings.turnstile_enabled
    turnstileSiteKey.value = settings.turnstile_site_key || ''
  } catch {
    appStore.showWarning('公开配置读取失败，当前按无 Turnstile 恢复流程处理。')
  }
})

async function handleSubmit() {
  errorMessage.value = ''

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    errorMessage.value = '请输入有效邮箱地址。'
    appStore.showError(errorMessage.value)
    return
  }

  isSubmitting.value = true

  try {
    await forgotPassword({
      email: email.value.trim(),
      turnstile_token: turnstileEnabled.value ? turnstileToken.value : undefined,
    })
    isSubmitted.value = true
    appStore.showSuccess('重置邮件已发送。')
  } catch (error) {
    errorMessage.value = buildAuthErrorMessage(error, '发送重置链接失败。')
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
