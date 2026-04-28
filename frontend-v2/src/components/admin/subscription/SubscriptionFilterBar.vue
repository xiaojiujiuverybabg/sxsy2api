<template>
  <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4 backdrop-blur-sm">
    <div class="flex flex-wrap items-center gap-3">
      <!-- 用户搜索 -->
      <div class="relative flex-1 min-w-[200px]" data-filter-user-search>
        <svg class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="userKeyword"
          type="text"
          placeholder="搜索用户..."
          class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 py-2 pl-10 pr-8 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
          @input="onUserSearch"
          @focus="showUserDropdown = true"
        />
        <button
          v-if="selectedUser"
          @click="clearUser"
          type="button"
          class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- 用户下拉 -->
        <div
          v-if="showUserDropdown && (userResults.length > 0 || userKeyword)"
          class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-700/50 bg-slate-900 shadow-xl"
        >
          <div v-if="userLoading" class="px-4 py-3 text-sm text-slate-400">搜索中...</div>
          <div v-else-if="userResults.length === 0 && userKeyword" class="px-4 py-3 text-sm text-slate-400">未找到用户</div>
          <button
            v-for="user in userResults"
            :key="user.id"
            type="button"
            @click="selectUser(user)"
            class="w-full px-4 py-2 text-left text-sm text-slate-200 transition hover:bg-slate-800"
          >
            <span class="font-medium">{{ user.email }}</span>
            <span class="ml-2 text-slate-500">#{{ user.id }}</span>
          </button>
        </div>
      </div>

      <!-- 状态下拉 -->
      <select
        :value="filters.status"
        @change="$emit('update:filters', { ...filters, status: ($event.target as HTMLSelectElement).value })"
        class="rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-2 text-sm text-white backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
      >
        <option value="">全部状态</option>
        <option value="active">活跃</option>
        <option value="expired">已过期</option>
        <option value="revoked">已撤销</option>
      </select>

      <!-- 分组下拉 -->
      <select
        :value="filters.group_id"
        @change="$emit('update:filters', { ...filters, group_id: ($event.target as HTMLSelectElement).value })"
        class="rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-2 text-sm text-white backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
      >
        <option value="">全部分组</option>
        <option v-for="g in groups" :key="g.id" :value="g.id">{{ g.name }}</option>
      </select>

      <!-- 平台下拉 -->
      <select
        :value="filters.platform"
        @change="$emit('update:filters', { ...filters, platform: ($event.target as HTMLSelectElement).value })"
        class="rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-2 text-sm text-white backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
      >
        <option value="">全部平台</option>
        <option value="anthropic">Anthropic</option>
        <option value="openai">OpenAI</option>
        <option value="gemini">Gemini</option>
        <option value="antigravity">Antigravity</option>
      </select>

      <!-- 排序下拉 -->
      <select
        :value="sortKey"
        @change="$emit('update:sortKey', ($event.target as HTMLSelectElement).value)"
        class="rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-2 text-sm text-white backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
      >
        <option value="created_at">默认排序</option>
        <option value="expires_at">按到期时间</option>
        <option value="status">按状态</option>
      </select>

      <!-- 操作按钮 -->
      <div class="ml-auto flex items-center gap-2">
        <button
          @click="$emit('refresh')"
          :disabled="loading"
          class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-2 text-sm text-slate-300 backdrop-blur-sm transition hover:border-slate-600 hover:text-white disabled:opacity-50"
          title="刷新"
        >
          <svg class="h-4 w-4" :class="{ 'animate-spin': loading }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        <button
          @click="$emit('showGuide')"
          class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-2 text-sm text-slate-300 backdrop-blur-sm transition hover:border-slate-600 hover:text-white"
          title="使用指南"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        <button
          @click="$emit('showAssign')"
          class="rounded-lg bg-gold-500 px-4 py-2 text-sm font-medium text-slate-900 backdrop-blur-sm transition hover:bg-gold-400"
        >
          + 分配订阅
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { adminAPI } from '@/api/admin'
import type { SimpleUser } from '@/types'

export interface SubscriptionFilters {
  status: string
  group_id: string
  platform: string
  user_id: number | null
}

const props = defineProps<{
  filters: SubscriptionFilters
  groups: Array<{ id: number; name: string }>
  sortKey: string
  loading: boolean
}>()

const emit = defineEmits<{
  'update:filters': [filters: SubscriptionFilters]
  'update:sortKey': [key: string]
  refresh: []
  showGuide: []
  showAssign: []
}>()

// 用户搜索
const userKeyword = ref('')
const userResults = ref<SimpleUser[]>([])
const userLoading = ref(false)
const showUserDropdown = ref(false)
const selectedUser = ref<SimpleUser | null>(null)
let searchTimeout: ReturnType<typeof setTimeout> | null = null

const onUserSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(doUserSearch, 300)
}

const doUserSearch = async () => {
  const keyword = userKeyword.value.trim()

  if (selectedUser.value && keyword !== selectedUser.value.email) {
    selectedUser.value = null
    emit('update:filters', { ...props.filters, user_id: null })
  }

  if (!keyword) {
    userResults.value = []
    return
  }

  userLoading.value = true
  try {
    userResults.value = await adminAPI.usage.searchUsers(keyword)
  } catch {
    userResults.value = []
  } finally {
    userLoading.value = false
  }
}

const selectUser = (user: SimpleUser) => {
  selectedUser.value = user
  userKeyword.value = user.email
  showUserDropdown.value = false
  emit('update:filters', { ...props.filters, user_id: user.id })
}

const clearUser = () => {
  selectedUser.value = null
  userKeyword.value = ''
  userResults.value = []
  showUserDropdown.value = false
  emit('update:filters', { ...props.filters, user_id: null })
}
</script>
