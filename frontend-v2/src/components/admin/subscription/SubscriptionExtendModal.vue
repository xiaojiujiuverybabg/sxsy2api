<template>
  <teleport to="body">
    <transition name="modal">
      <div v-if="show && subscription" class="fixed inset-0 z-50 flex items-center justify-center p-4" @mousedown.self="handleClose">
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" @click="handleClose"></div>
        <div class="relative w-full max-w-sm rounded-2xl border border-slate-700/50 bg-slate-900 p-6 shadow-2xl">
          <button type="button" class="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition hover:text-white" @click="handleClose">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 class="mb-5 text-lg font-bold text-white">调整订阅</h2>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- 订阅信息 -->
            <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">
              <p class="text-sm text-slate-400">
                调整用户
                <span class="font-medium text-white">{{ subscription.user?.email || `#${subscription.user_id}` }}</span>
                的订阅
              </p>
              <p class="mt-1 text-sm text-slate-400">
                当前到期：
                <span class="font-medium text-white">{{ subscription.expires_at ? formatDate(subscription.expires_at) : '永久' }}</span>
              </p>
              <p v-if="subscription.expires_at" class="mt-1 text-sm text-slate-400">
                剩余天数：
                <span class="font-medium" :class="(daysRemaining ?? 0) <= 7 ? 'text-amber-400' : 'text-white'">{{ daysRemaining ?? 0 }} 天</span>
              </p>
            </div>

            <!-- 天数输入 -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-300">调整天数</label>
              <input
                v-model.number="form.days"
                type="number"
                required
                class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-2 text-center text-sm text-white placeholder-slate-500 transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
                placeholder="正数延长，负数缩短"
              />
              <p class="mt-1 text-xs text-slate-500">正数延长有效期，负数缩短有效期</p>
            </div>

            <!-- 新到期时间预览 -->
            <div v-if="form.days && subscription.expires_at" class="rounded-lg border border-slate-700/50 bg-slate-800/30 p-3">
              <p class="text-xs text-slate-400">
                调整后到期：
                <span class="font-medium text-white">{{ previewNewExpiry }}</span>
              </p>
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button type="button" @click="handleClose" class="rounded-lg border border-slate-700/50 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800">取消</button>
              <button type="submit" :disabled="submitting" class="rounded-lg bg-gold-500 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-gold-400 disabled:opacity-50">
                <svg v-if="submitting" class="-ml-1 mr-2 inline h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ submitting ? '调整中...' : '确认调整' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { adminAPI } from '@/api/admin'
import { showError, showSuccess } from '@/utils/toast'
import type { UserSubscription } from '@/types'

const props = defineProps<{
  show: boolean
  subscription: UserSubscription | null
}>()

const emit = defineEmits<{
  close: []
  done: []
}>()

const form = ref({ days: 30 })
const submitting = ref(false)

const daysRemaining = computed(() => {
  if (!props.subscription?.expires_at) return null
  const now = new Date()
  const expires = new Date(props.subscription.expires_at)
  const diff = expires.getTime() - now.getTime()
  if (diff < 0) return null
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
})

const previewNewExpiry = computed(() => {
  if (!props.subscription?.expires_at || !form.value.days) return ''
  const expires = new Date(props.subscription.expires_at)
  const newExpiry = new Date(expires.getTime() + form.value.days * 24 * 60 * 60 * 1000)
  return formatDate(newExpiry.toISOString())
})

const handleClose = () => {
  if (submitting.value) return
  form.value.days = 30
  emit('close')
}

const handleSubmit = async () => {
  if (submitting.value || !props.subscription) return

  // 前端验证：调整后的过期时间必须在未来
  if (props.subscription.expires_at) {
    const expiresAt = new Date(props.subscription.expires_at)
    const newExpiresAt = new Date(expiresAt.getTime() + form.value.days * 24 * 60 * 60 * 1000)
    if (newExpiresAt <= new Date()) {
      showError('调整后到期时间不能在过去，请增加天数')
      return
    }
  }

  submitting.value = true
  try {
    await adminAPI.subscriptions.extend(props.subscription.id, { days: form.value.days })
    showSuccess('订阅调整成功')
    form.value.days = 30
    emit('done')
    emit('close')
  } catch (error: any) {
    showError(error?.response?.data?.detail || error?.response?.data?.message || '调整订阅失败')
  } finally {
    submitting.value = false
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}
</script>
