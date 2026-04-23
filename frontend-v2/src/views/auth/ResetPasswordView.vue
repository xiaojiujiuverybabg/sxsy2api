<template>
  <section class="grid w-full max-w-6xl gap-6 xl:grid-cols-[1.05fr_.95fr]">
    <form class="rounded-[38px] border border-line bg-white p-6 shadow-panel md:p-8" @submit.prevent="handleSubmit">
      <p class="text-xs font-black uppercase tracking-[0.32em] text-brand-700">新密码设置</p>
      <h1 class="mt-3 text-5xl font-black tracking-tight text-text-primary">设置新的访问密钥</h1>
      <p class="mt-3 text-sm leading-7 text-text-secondary">
        设置一个新的访问密码，完成后即可回到工作台。
      </p>

      <div v-if="isInvalidLink" class="mt-8 rounded-[30px] border border-amber-200 bg-amber-50 p-6">
        <p class="text-lg font-black text-amber-800">重置链接无效</p>
        <p class="mt-2 text-sm leading-6 text-amber-700">链接缺少邮箱或 token，请重新申请重置链接。</p>
        <RouterLink
          to="/forgot-password"
          class="mt-5 inline-flex rounded-full bg-brand-500 px-5 py-3 text-sm font-black text-white transition hover:bg-brand-700"
        >
          重新申请
        </RouterLink>
      </div>

      <div v-else-if="isSuccess" class="mt-8 rounded-[30px] border border-emerald-200 bg-emerald-50 p-6">
        <p class="text-lg font-black text-emerald-800">密码已更新</p>
        <p class="mt-2 text-sm leading-6 text-emerald-700">现在可以使用新密码登录工作台。</p>
        <RouterLink
          to="/login"
          class="mt-5 inline-flex rounded-full bg-success-500 px-5 py-3 text-sm font-black text-white transition hover:bg-success-600"
        >
          去登录
        </RouterLink>
      </div>

      <template v-else>
        <div v-if="errorMessage" class="mt-7 rounded-[24px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {{ errorMessage }}
        </div>

        <div class="mt-8 rounded-[30px] border border-line bg-surface-soft p-5">
          <p class="text-xs font-black uppercase tracking-[0.28em] text-text-muted">重置目标</p>
          <p class="mt-3 break-all text-2xl font-black text-text-primary">{{ email }}</p>
        </div>

        <div class="mt-6 grid gap-4">
          <FlowField v-model="password" label="新密码" placeholder="请输入新密码" :type="showPassword ? 'text' : 'password'" />
          <FlowField v-model="confirmPassword" label="确认密码" placeholder="再次输入新密码" :type="showConfirmPassword ? 'text' : 'password'" />
        </div>

        <div class="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            class="rounded-[24px] border border-line bg-surface-soft px-5 py-4 text-sm font-black text-text-secondary transition hover:border-brand-300 hover:bg-white hover:text-brand-700"
            @click="showPassword = !showPassword"
          >
            {{ showPassword ? '隐藏新密码' : '显示新密码' }}
          </button>
          <button
            type="button"
            class="rounded-[24px] border border-line bg-surface-soft px-5 py-4 text-sm font-black text-text-secondary transition hover:border-brand-300 hover:bg-white hover:text-brand-700"
            @click="showConfirmPassword = !showConfirmPassword"
          >
            {{ showConfirmPassword ? '隐藏确认密码' : '显示确认密码' }}
          </button>
        </div>

        <div class="mt-7 grid gap-3 sm:grid-cols-[1fr_auto]">
          <button
            type="submit"
            class="rounded-[26px] border border-brand-500 bg-brand-500 px-6 py-5 text-left text-sm font-black text-white transition hover:border-brand-700 hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? '正在更新密码' : '确认更新密码' }}
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

    <aside class="relative overflow-hidden rounded-[38px] bg-neutral-900 p-7 text-white shadow-panel md:p-9">
      <div class="pointer-events-none absolute -right-20 top-16 h-56 w-56 rounded-full bg-brand-500/25 blur-3xl"></div>
      <div class="relative">
        <p class="text-xs font-black uppercase tracking-[0.36em] text-brand-100/80">安全轨道</p>
        <h2 class="mt-5 text-4xl font-black leading-tight">密码更新动作独立成安全轨道。</h2>
        <div class="mt-8 grid gap-3">
          <article
            v-for="item in checks"
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
import { RouterLink, useRoute } from 'vue-router'
import { FlowField } from '@/components/atlas'
import { resetPassword } from '@/api/auth'
import { useAppStore } from '@/stores'
import { buildAuthErrorMessage } from '@/utils/auth'

const route = useRoute()
const appStore = useAppStore()

const email = ref('')
const token = ref('')
const password = ref('')
const confirmPassword = ref('')
const isSubmitting = ref(false)
const isSuccess = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const checks = [
  { title: '链接校验', description: '恢复链接有效时才能继续更新密码。' },
  { title: '密码一致', description: '两次输入保持一致，确保不会误设。' },
  { title: '完成回流', description: '更新成功后回到登录页。' },
]

const isInvalidLink = computed(() => !email.value || !token.value)

onMounted(() => {
  email.value = String(route.query.email || '')
  token.value = String(route.query.token || '')
  if (isInvalidLink.value) {
    appStore.showError('重置链接无效。')
  }
})

function validateForm(): boolean {
  errorMessage.value = ''

  if (password.value.length < 6) {
    errorMessage.value = '新密码长度至少需要 6 位。'
    return false
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = '两次输入的密码不一致。'
    return false
  }

  return true
}

async function handleSubmit() {
  if (!validateForm()) {
    appStore.showError(errorMessage.value)
    return
  }

  isSubmitting.value = true

  try {
    await resetPassword({
      email: email.value,
      token: token.value,
      new_password: password.value,
    })
    isSuccess.value = true
    appStore.showSuccess('密码已更新。')
  } catch (error) {
    errorMessage.value = buildAuthErrorMessage(error, '密码更新失败。')
    appStore.showError(errorMessage.value)
  } finally {
    isSubmitting.value = false
  }
}
</script>
