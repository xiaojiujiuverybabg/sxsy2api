<template>
  <div
    v-if="show && user"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    @click.self="handleClose"
  >
    <div class="w-full max-w-lg rounded-xl border border-slate-700/50 bg-slate-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
      <h2 class="mb-6 text-xl font-bold text-white">✏️ 编辑用户</h2>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- 邮箱（只读） -->
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-300">邮箱</label>
          <input
            :value="user.email"
            type="email"
            disabled
            class="w-full rounded-lg border border-slate-700/50 bg-slate-800/30 px-4 py-2 text-slate-400 backdrop-blur-sm cursor-not-allowed"
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
          <label class="mb-2 block text-sm font-medium text-slate-300">新密码</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="留空则不修改"
            class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          <p class="mt-1 text-xs text-slate-400">留空则不修改密码</p>
        </div>

        <!-- 角色 -->
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-300">角色</label>
          <select
            v-model="form.role"
            class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-white backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="user">用户</option>
            <option value="admin">管理员</option>
          </select>
        </div>

        <!-- 状态 -->
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-300">状态</label>
          <select
            v-model="form.status"
            class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-white backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="active">活跃</option>
            <option value="disabled">禁用</option>
          </select>
        </div>

        <!-- 并发数 -->
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-300">并发数</label>
          <input
            v-model.number="form.concurrency"
            type="number"
            min="1"
            class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <!-- 备注 -->
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-300">备注</label>
          <textarea
            v-model="form.notes"
            rows="3"
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
            {{ submitting ? '保存中...' : '保存修改' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
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
const form = ref({
  username: '',
  password: '',
  role: 'user' as 'user' | 'admin',
  status: 'active' as 'active' | 'disabled',
  concurrency: 1,
  notes: ''
})

watch(() => props.user, (newUser) => {
  if (newUser) {
    form.value = {
      username: newUser.username || '',
      password: '',
      role: newUser.role,
      status: newUser.status,
      concurrency: newUser.concurrency,
      notes: newUser.notes || ''
    }
  }
}, { immediate: true })

const handleClose = () => {
  emit('close')
}

const handleSubmit = async () => {
  if (!props.user) return

  submitting.value = true
  try {
    const updateData: any = {
      username: form.value.username || undefined,
      role: form.value.role,
      status: form.value.status,
      concurrency: form.value.concurrency,
      notes: form.value.notes || undefined
    }

    if (form.value.password) {
      updateData.password = form.value.password
    }

    await adminAPI.users.update(props.user.id, updateData)
    showSuccess('用户信息已更新')
    emit('success')
    emit('close')
  } catch (error: any) {
    showError(error.response?.data?.error || '更新用户信息失败')
  } finally {
    submitting.value = false
  }
}
</script>
