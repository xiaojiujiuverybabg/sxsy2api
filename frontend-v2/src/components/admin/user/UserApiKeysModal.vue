<template>
  <div
    v-if="show && user"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    @click.self="handleClose"
  >
    <div class="w-full max-w-4xl rounded-xl border border-slate-700/50 bg-slate-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
      <h2 class="mb-6 text-xl font-bold text-white">🔑 API 密钥 - {{ user.email }}</h2>

      <!-- 加载状态 -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-brand-500"></div>
      </div>

      <!-- 密钥列表 -->
      <div v-else-if="keys.length > 0" class="space-y-3">
        <div
          v-for="key in keys"
          :key="key.id"
          class="rounded-lg border border-slate-700/50 bg-slate-800/40 p-4"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h3 class="text-sm font-bold text-white">{{ key.name || `密钥 #${key.id}` }}</h3>
                <span
                  :class="[
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    key.status === 'active'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/20 text-red-400'
                  ]"
                >
                  {{ key.status === 'active' ? '活跃' : '禁用' }}
                </span>
              </div>
              <div class="space-y-1 text-xs text-slate-400">
                <div class="flex items-center gap-2">
                  <span>密钥:</span>
                  <code class="rounded bg-slate-900/50 px-2 py-0.5 text-slate-300 font-mono">
                    {{ key.key.substring(0, 20) }}...
                  </code>
                </div>
                <div v-if="key.last_used_at">
                  最后使用: {{ formatDateTime(key.last_used_at) }}
                </div>
                <div v-if="key.expires_at">
                  过期时间: {{ formatDateTime(key.expires_at) }}
                </div>
                <div>
                  创建时间: {{ formatDateTime(key.created_at) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="flex flex-col items-center justify-center py-12">
        <div class="mb-4 text-6xl">🔑</div>
        <h3 class="mb-2 text-lg font-bold text-white">暂无 API 密钥</h3>
        <p class="text-sm text-slate-400">该用户还没有创建任何 API 密钥</p>
      </div>

      <!-- 关闭按钮 -->
      <div class="mt-6 flex justify-end">
        <button
          @click="handleClose"
          class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800"
        >
          关闭
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { adminAPI } from '@/api/admin'
import type { AdminUser } from '@/types'
import { showError } from '@/utils/toast'

interface ApiKey {
  id: number
  user_id: number
  name: string
  key: string
  status: 'active' | 'disabled'
  last_used_at: string | null
  expires_at: string | null
  created_at: string
}

const props = defineProps<{
  show: boolean
  user: AdminUser | null
}>()

const emit = defineEmits<{
  close: []
}>()

const loading = ref(false)
const keys = ref<ApiKey[]>([])

watch(() => props.show, (newVal) => {
  if (newVal && props.user) {
    loadKeys()
  }
})

const loadKeys = async () => {
  if (!props.user) return

  loading.value = true
  try {
    const response = await adminAPI.users.getApiKeys(props.user.id)
    // apiClient 拦截器已经解包了 { code: 0, data: {...} }
    // 所以 response 就是 { items: [], total: 1 }
    keys.value = response.items || []
  } catch (error: any) {
    showError(error.response?.data?.error || '加载 API 密钥失败')
  } finally {
    loading.value = false
  }
}

const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleClose = () => {
  emit('close')
}
</script>
