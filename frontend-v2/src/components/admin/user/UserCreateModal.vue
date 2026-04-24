<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    @click.self="handleClose"
  >
    <div class="w-full max-w-lg rounded-xl border border-slate-700/50 bg-slate-900 p-6 shadow-2xl">
      <h2 class="mb-6 text-xl font-bold text-white">➕ 创建用户</h2>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- 邮箱 -->
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-300">邮箱 *</label>
          <input
            v-model="form.email"
            type="email"
            required
            placeholder="user@example.com"
            class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <!-- 用户名 -->
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-300">用户名</label>
          <input
            v-model="form.username"
            type="text"
            placeholder="可选"
            class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <!-- 密码 -->
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-300">密码 *</label>
          <input
            v-model="form.password"
            type="password"
            required
            placeholder="至少 6 位"
            class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <!-- 角色 -->
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-300">角色 *</label>
          <select
            v-model="form.role"
            required
            class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-white backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="user">用户</option>
            <option value="admin">管理员</option>
          </select>
        </div>

        <!-- 初始余额 -->
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-300">初始余额</label>
          <input
            v-model.number="form.balance"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <!-- 并发数 -->
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-300">并发数</label>
          <input
            v-model.number="form.concurrency"
            type="number"
            min="1"
            placeholder="1"
            class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <!-- 备注 -->
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-300">备注</label>
          <textarea
            v-model="form.notes"
            rows="2"
            placeholder="可选备注信息"
            class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          ></textarea>
        </div>

        <!-- 按钮 -->
        <div class="flex justify-end gap-3 pt-2">
          <button
            type="button"
            @click="handleClose"
            class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800"
          >
            取消
          </button>
          <button
            type="submit"
            :disabled="submitting"
            class="rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-brand-500/30 transition hover:shadow-brand-500/50 disabled:opacity-50"
          >
            {{ submitting ? '创建中...' : '创建用户' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { adminAPI } from '@/api/admin'
import { showSuccess, showError } from '@/utils/toast'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
  success: []
}>()

const submitting = ref(false)
const form = ref({
  email: '',
  username: '',
  password: '',
  role: 'user' as 'user' | 'admin',
  balance: 0,
  concurrency: 1,
  notes: ''
})

watch(() => props.show, (newVal) => {
  if (newVal) {
    resetForm()
  }
})

const resetForm = () => {
  form.value = {
    email: '',
    username: '',
    password: '',
    role: 'user',
    balance: 0,
    concurrency: 1,
    notes: ''
  }
}

const handleClose = () => {
  emit('close')
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    await adminAPI.users.create({
      email: form.value.email,
      username: form.value.username || undefined,
      password: form.value.password,
      role: form.value.role,
      balance: form.value.balance,
      concurrency: form.value.concurrency,
      notes: form.value.notes || undefined
    })
    showSuccess('用户创建成功')
    emit('success')
    emit('close')
  } catch (error: any) {
    showError(error.response?.data?.error || '创建用户失败')
  } finally {
    submitting.value = false
  }
}
</script>
