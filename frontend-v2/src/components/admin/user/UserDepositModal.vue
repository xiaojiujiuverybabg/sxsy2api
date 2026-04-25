<template>
  <div
    v-if="show && user"
    class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    @click.self="handleClose"
  >
    <div class="w-full max-w-md rounded-2xl border border-emerald-700/50 bg-gradient-to-br from-slate-950 to-slate-900 shadow-2xl">
      <!-- Header -->
      <div class="border-b border-emerald-700/50 bg-emerald-900/20 px-6 py-4">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
            <svg class="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <h2 class="text-lg font-bold text-white">充值</h2>
            <p class="text-sm text-slate-400">为用户账户充值余额</p>
          </div>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6 space-y-5">
        <!-- User Info -->
        <div class="flex items-center gap-3 rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600">
            <span class="text-lg font-bold text-white">
              {{ user.email.charAt(0).toUpperCase() }}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-white truncate">{{ user.email }}</p>
            <p class="text-sm text-slate-400">
              当前余额: <span class="font-semibold text-emerald-400">${{ formatBalance(user.balance) }}</span>
            </p>
          </div>
        </div>

        <!-- Amount Input -->
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-300">
            充值金额 <span class="text-red-400">*</span>
          </label>
          <div class="relative">
            <div class="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">$</div>
            <input
              v-model.number="form.amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2.5 pl-8 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
            />
          </div>

          <!-- Quick Amount Buttons -->
          <div class="mt-3 grid grid-cols-4 gap-2">
            <button
              v-for="amount in [10, 50, 100, 500]"
              :key="amount"
              type="button"
              @click="form.amount = amount"
              class="rounded-lg border border-slate-700/50 bg-slate-800/30 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-400"
            >
              ${{ amount }}
            </button>
          </div>
        </div>

        <!-- Notes Input -->
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-300">
            充值备注
          </label>
          <textarea
            v-model="form.notes"
            rows="3"
            placeholder="请输入充值备注（可选）"
            class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2.5 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition resize-none"
          ></textarea>
        </div>

        <!-- New Balance Preview -->
        <div
          v-if="form.amount > 0"
          class="rounded-xl border border-emerald-700/50 bg-emerald-900/20 p-4"
        >
          <div class="flex items-center justify-between">
            <span class="text-sm text-slate-300">充值后余额:</span>
            <div class="flex items-center gap-2">
              <span class="text-lg font-bold text-slate-400">
                ${{ formatBalance(user.balance) }}
              </span>
              <svg class="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              <span class="text-xl font-bold text-emerald-400">
                ${{ formatBalance(calculateNewBalance()) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-2">
          <button
            type="button"
            @click="handleClose"
            class="flex-1 rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
          >
            取消
          </button>
          <button
            type="submit"
            :disabled="submitting || !form.amount || form.amount <= 0"
            class="flex-1 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <span v-if="submitting">处理中...</span>
            <span v-else>确认充值</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { adminAPI } from '@/api/admin'
import type { AdminUser } from '@/types'
import { showSuccess, showError } from '@/utils/toast'

const props = defineProps<{
  show: boolean
  user: AdminUser | null
}>()

const emit = defineEmits<{
  close: []
  success: []
}>()

const submitting = ref(false)
const form = reactive({
  amount: 0,
  notes: ''
})

watch(() => props.show, (v) => {
  if (v) {
    form.amount = 0
    form.notes = ''
  }
})

const formatBalance = (value: number) => {
  if (value === 0) return '0.00'
  const formatted = value.toFixed(8).replace(/\.?0+$/, '')
  const parts = formatted.split('.')
  if (parts.length === 1) return formatted + '.00'
  if (parts[1].length === 1) return formatted + '0'
  return formatted
}

const calculateNewBalance = () => {
  if (!props.user) return 0
  const result = props.user.balance + form.amount
  return Math.abs(result) < 1e-10 ? 0 : result
}

const handleSubmit = async () => {
  if (!props.user) return

  if (!form.amount || form.amount <= 0) {
    showError('请输入充值金额')
    return
  }

  submitting.value = true
  try {
    await adminAPI.users.updateBalance(
      props.user.id,
      form.amount,
      'add',
      form.notes || '管理员充值'
    )
    showSuccess('充值成功')
    emit('success')
    emit('close')
  } catch (error: any) {
    console.error('Failed to deposit:', error)
    showError(error.response?.data?.error || '充值失败')
  } finally {
    submitting.value = false
  }
}

const handleClose = () => {
  if (!submitting.value) {
    emit('close')
  }
}
</script>
