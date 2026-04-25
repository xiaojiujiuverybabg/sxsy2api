<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    @click.self="$emit('close')"
  >
    <div class="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700/50 bg-slate-800/95 backdrop-blur-xl shadow-2xl">
      <!-- 头部 -->
      <div class="sticky top-0 z-10 border-b border-slate-700/50 bg-slate-800/95 backdrop-blur-xl px-6 py-4">
        <h2 class="text-xl font-bold text-white">💰 费率倍率管理</h2>
        <div v-if="group" class="mt-2 flex items-center gap-3 text-sm text-slate-400">
          <span class="font-medium text-white">{{ group.name }}</span>
          <span>|</span>
          <span>{{ platformNames[group.platform] }}</span>
          <span>|</span>
          <span>基础倍率: {{ group.rate_multiplier }}x</span>
        </div>
      </div>

      <!-- 内容 -->
      <div class="p-6 space-y-6">
        <!-- 添加用户 -->
        <div class="rounded-xl border border-slate-700/50 bg-slate-900/30 p-4">
          <h3 class="mb-3 text-sm font-semibold text-slate-300">添加用户费率</h3>
          <div class="flex items-end gap-3">
            <div class="relative flex-1">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索用户（邮箱或用户名）"
                class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                @input="handleSearch"
                @focus="showDropdown = true"
              />
              <!-- 搜索结果下拉 -->
              <div
                v-if="showDropdown && searchResults.length > 0"
                class="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-lg border border-slate-700/50 bg-slate-800 shadow-xl"
              >
                <button
                  v-for="user in searchResults"
                  :key="user.id"
                  type="button"
                  class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-700/50 transition"
                  @click="selectUser(user)"
                >
                  <span class="text-slate-500">#{{ user.id }}</span>
                  <span class="text-white">{{ user.username || user.email }}</span>
                  <span v-if="user.username" class="text-xs text-slate-400">{{ user.email }}</span>
                </button>
              </div>
            </div>
            <div class="w-32">
              <input
                v-model.number="newRate"
                type="number"
                step="0.01"
                min="0"
                placeholder="倍率"
                class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <button
              type="button"
              :disabled="!selectedUser || !newRate"
              @click="handleAdd"
              class="rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:from-brand-600 hover:to-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              添加
            </button>
          </div>

          <!-- 批量操作 -->
          <div v-if="entries.length > 0" class="mt-4 flex items-center gap-3 border-t border-slate-700/30 pt-4">
            <span class="text-xs font-medium text-slate-400">批量调整:</span>
            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-500">×</span>
              <input
                v-model.number="batchFactor"
                type="number"
                step="0.1"
                min="0"
                placeholder="0.5"
                class="w-20 rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-1.5 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              <button
                type="button"
                :disabled="!batchFactor || batchFactor <= 0"
                @click="applyBatchFactor"
                class="rounded-lg border border-brand-500/50 bg-brand-500/10 px-3 py-1.5 text-xs font-medium text-brand-400 transition hover:bg-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                应用
              </button>
            </div>
            <div class="ml-auto">
              <button
                type="button"
                @click="clearAll"
                class="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20"
              >
                清空全部
              </button>
            </div>
          </div>
        </div>

        <!-- 用户列表 -->
        <div>
          <div class="mb-3 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-slate-300">
              已设置用户 ({{ entries.length }})
            </h3>
            <div v-if="entries.length > 0" class="text-xs text-slate-500">
              最终费率 = 基础倍率 × 用户倍率
            </div>
          </div>

          <!-- 加载状态 -->
          <div v-if="loading" class="flex justify-center py-12">
            <div class="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-brand-500"></div>
          </div>

          <!-- 空状态 -->
          <div v-else-if="entries.length === 0" class="rounded-xl border border-slate-700/50 bg-slate-900/20 py-12 text-center">
            <div class="mb-2 text-4xl">👤</div>
            <p class="text-sm text-slate-400">暂无用户费率设置</p>
          </div>

          <!-- 表格 -->
          <div v-else class="overflow-hidden rounded-xl border border-slate-700/50">
            <div class="max-h-[400px] overflow-y-auto">
              <table class="w-full text-sm">
                <thead class="sticky top-0 z-[1] border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">用户</th>
                    <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">ID</th>
                    <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">状态</th>
                    <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">用户倍率</th>
                    <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">最终费率</th>
                    <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">操作</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-700/30">
                  <tr
                    v-for="entry in paginatedEntries"
                    :key="entry.user_id"
                    class="transition hover:bg-slate-700/20"
                  >
                    <td class="px-4 py-3">
                      <div class="text-sm font-medium text-white">{{ entry.user_name || entry.user_email }}</div>
                      <div v-if="entry.user_name" class="text-xs text-slate-400">{{ entry.user_email }}</div>
                    </td>
                    <td class="px-4 py-3 text-slate-400">#{{ entry.user_id }}</td>
                    <td class="px-4 py-3">
                      <span
                        :class="[
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                          entry.user_status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-700/50 text-slate-400'
                        ]"
                      >
                        {{ entry.user_status === 'active' ? '活跃' : '禁用' }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        :value="entry.rate_multiplier"
                        @change="updateRate(entry.user_id, ($event.target as HTMLInputElement).value)"
                        class="w-24 rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-1.5 text-sm text-white backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                    </td>
                    <td class="px-4 py-3">
                      <span class="font-medium text-brand-400">
                        {{ (group!.rate_multiplier * entry.rate_multiplier).toFixed(3) }}x
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right">
                      <button
                        type="button"
                        @click="removeEntry(entry.user_id)"
                        class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:border-red-500/50 hover:bg-red-500/10"
                      >
                        🗑️ 删除
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 分页 -->
            <div v-if="totalPages > 1" class="border-t border-slate-700/50 bg-slate-900/30 px-4 py-3">
              <div class="flex items-center justify-between">
                <div class="text-sm text-slate-400">
                  第 {{ currentPage }} / {{ totalPages }} 页
                </div>
                <div class="flex items-center gap-2">
                  <button
                    @click="currentPage--"
                    :disabled="currentPage <= 1"
                    class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    上一页
                  </button>
                  <button
                    @click="currentPage++"
                    :disabled="currentPage >= totalPages"
                    class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    下一页
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="sticky bottom-0 flex items-center justify-end gap-3 border-t border-slate-700/50 bg-slate-800/95 backdrop-blur-xl px-6 py-4">
        <button
          type="button"
          @click="$emit('close')"
          class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800"
        >
          取消
        </button>
        <button
          type="button"
          :disabled="saving"
          @click="handleSave"
          class="rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:from-brand-600 hover:to-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ saving ? '保存中...' : '保存' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { AdminGroup } from '@/types'
import { showSuccess, showError, confirm } from '@/utils/toast'
import { apiClient } from '@/api/client'

interface UserRateEntry {
  user_id: number
  user_email: string
  user_name?: string
  user_status: 'active' | 'disabled'
  rate_multiplier: number
}

interface SearchUser {
  id: number
  email: string
  username?: string
}

interface Props {
  show: boolean
  group: AdminGroup | null
}

interface Emits {
  (e: 'close'): void
  (e: 'save', data: { groupId: number; entries: UserRateEntry[] }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const platformNames: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  gemini: 'Gemini',
  antigravity: 'Antigravity'
}

const loading = ref(false)
const saving = ref(false)
const entries = ref<UserRateEntry[]>([])
const searchQuery = ref('')
const searchResults = ref<SearchUser[]>([])
const showDropdown = ref(false)
const selectedUser = ref<SearchUser | null>(null)
const newRate = ref<number | null>(null)
const batchFactor = ref<number | null>(null)
const currentPage = ref(1)
const pageSize = 20

const paginatedEntries = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return entries.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(entries.value.length / pageSize))

let searchTimeout: ReturnType<typeof setTimeout> | null = null

const handleSearch = async () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    if (!searchQuery.value.trim()) {
      searchResults.value = []
      showDropdown.value = false
      return
    }

    try {
      // 调用用户搜索 API
      const response = await apiClient.get('/admin/users', {
        params: {
          search: searchQuery.value,
          page: 1,
          page_size: 10
        }
      })
      searchResults.value = response.data.items || []
      showDropdown.value = searchResults.value.length > 0
    } catch (error: any) {
      console.error('搜索用户失败:', error)
      showError(error.response?.data?.message || '搜索用户失败')
      searchResults.value = []
      showDropdown.value = false
    }
  }, 300)
}

const selectUser = (user: SearchUser) => {
  selectedUser.value = user
  searchQuery.value = user.username || user.email
  showDropdown.value = false
}

const handleAdd = () => {
  if (!selectedUser.value || !newRate.value) return

  const exists = entries.value.find(e => e.user_id === selectedUser.value!.id)
  if (exists) {
    showError('该用户已存在')
    return
  }

  entries.value.push({
    user_id: selectedUser.value.id,
    user_email: selectedUser.value.email,
    user_name: selectedUser.value.username,
    user_status: 'active',
    rate_multiplier: newRate.value
  })

  // 重置
  selectedUser.value = null
  searchQuery.value = ''
  newRate.value = null
  showSuccess('添加成功')
}

const updateRate = (userId: number, value: string) => {
  const entry = entries.value.find(e => e.user_id === userId)
  if (entry) {
    entry.rate_multiplier = parseFloat(value) || 0
  }
}

const removeEntry = async (userId: number) => {
  const confirmed = await confirm({
    type: 'danger',
    title: '确认删除',
    message: '确定要删除此用户的费率设置吗？',
    confirmText: '删除',
    cancelText: '取消'
  })

  if (confirmed) {
    entries.value = entries.value.filter(e => e.user_id !== userId)
    showSuccess('删除成功')
  }
}

const applyBatchFactor = async () => {
  if (!batchFactor.value || batchFactor.value <= 0) return

  const confirmed = await confirm({
    type: 'warning',
    title: '批量调整',
    message: `确定要将所有用户倍率乘以 ${batchFactor.value} 吗？`,
    confirmText: '确定',
    cancelText: '取消'
  })

  if (confirmed) {
    entries.value.forEach(entry => {
      entry.rate_multiplier = parseFloat((entry.rate_multiplier * batchFactor.value!).toFixed(3))
    })
    batchFactor.value = null
    showSuccess('批量调整成功')
  }
}

const clearAll = async () => {
  const confirmed = await confirm({
    type: 'danger',
    title: '确认清空',
    message: '确定要清空所有用户费率设置吗？此操作不可恢复。',
    confirmText: '清空',
    cancelText: '取消'
  })

  if (confirmed) {
    entries.value = []
    showSuccess('已清空')
  }
}

const handleSave = async () => {
  if (!props.group) return
  saving.value = true
  try {
    emit('save', {
      groupId: props.group.id,
      entries: entries.value
    })
    showSuccess('保存成功')
  } catch (error: any) {
    console.error('保存失败:', error)
    showError(error.response?.data?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

// 监听 group 变化，加载数据
watch(() => props.group, async (group) => {
  if (group) {
    loading.value = true
    try {
      // 加载该分组的用户费率数据
      const data = await apiClient.get(`/admin/groups/${group.id}/rate-multipliers`)
      entries.value = data.data || []
      currentPage.value = 1
    } catch (error: any) {
      console.error('加载用户费率失败:', error)
      showError(error.response?.data?.message || '加载用户费率失败')
      entries.value = []
    } finally {
      loading.value = false
    }
  } else {
    entries.value = []
  }
}, { immediate: true })

// 点击外部关闭下拉
const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.relative')) {
    showDropdown.value = false
  }
}

watch(() => props.show, (show) => {
  if (show) {
    document.addEventListener('click', handleClickOutside)
  } else {
    document.removeEventListener('click', handleClickOutside)
  }
})
</script>
