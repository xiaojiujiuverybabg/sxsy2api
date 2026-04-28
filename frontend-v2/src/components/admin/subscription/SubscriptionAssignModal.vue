<template>
  <teleport to="body">
    <transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4" @mousedown.self="handleClose">
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" @click="handleClose"></div>
        <div class="relative w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-900 p-6 shadow-2xl">
          <button type="button" class="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition hover:text-white" @click="handleClose">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 class="mb-5 text-lg font-bold text-white">分配订阅</h2>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- 用户选择 -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-300">目标用户</label>
              <div class="relative" data-assign-user-search>
                <input
                  v-model="userKeyword"
                  type="text"
                  class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-2 pr-8 text-sm text-white placeholder-slate-500 transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
                  placeholder="搜索用户邮箱..."
                  @input="onUserSearch"
                  @focus="showDropdown = true"
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

                <div
                  v-if="showDropdown && (userResults.length > 0 || userKeyword)"
                  class="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-slate-700/50 bg-slate-800 shadow-xl"
                >
                  <div v-if="userLoading" class="px-4 py-3 text-sm text-slate-400">搜索中...</div>
                  <div v-else-if="userResults.length === 0 && userKeyword" class="px-4 py-3 text-sm text-slate-400">未找到用户</div>
                  <button
                    v-for="user in userResults"
                    :key="user.id"
                    type="button"
                    @click="pickUser(user)"
                    class="w-full px-4 py-2 text-left text-sm text-slate-200 transition hover:bg-slate-700"
                  >
                    <span class="font-medium">{{ user.email }}</span>
                    <span class="ml-2 text-slate-500">#{{ user.id }}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- 分组选择 -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-300">订阅分组</label>
              <div v-if="groupLoading" class="flex items-center gap-2 py-2 text-sm text-slate-400">
                <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                加载分组...
              </div>
              <select
                v-else
                v-model="form.group_id"
                class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-2 text-sm text-white transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
              >
                <option :value="null" disabled>{{ groupOptions.length > 0 ? '选择分组...' : '暂无可用分组' }}</option>
                <option v-for="g in groupOptions" :key="g.value" :value="g.value">{{ g.label }}</option>
              </select>
              <p v-if="groupLoadError" class="mt-1 text-xs text-red-400">{{ groupLoadError }}</p>
              <p v-else-if="groupOptions.length === 0 && !groupLoading" class="mt-1 text-xs text-amber-400">没有可用的订阅分组，请先在分组管理中创建订阅类型分组</p>
              <p v-else class="mt-1 text-xs text-slate-500">仅显示订阅类型的分组</p>
            </div>

            <!-- 有效期 -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-300">有效期天数</label>
              <input
                v-model.number="form.validity_days"
                type="number"
                min="1"
                class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-2 text-sm text-white placeholder-slate-500 transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
              />
              <p class="mt-1 text-xs text-slate-500">从分配之日起计算</p>
            </div>

            <!-- 操作按钮 -->
            <div class="flex justify-end gap-3 pt-2">
              <button type="button" @click="handleClose" class="rounded-lg border border-slate-700/50 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800">取消</button>
              <button type="submit" :disabled="submitting || groupLoading" class="rounded-lg bg-gold-500 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-gold-400 disabled:opacity-50">
                <svg v-if="submitting" class="-ml-1 mr-2 inline h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ submitting ? '分配中...' : '确认分配' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { adminAPI } from '@/api/admin'
import { showError } from '@/utils/toast'
import type { SimpleUser, Group } from '@/types'

interface GroupOption {
  value: number
  label: string
}

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
  assigned: []
}>()

const userKeyword = ref('')
const userResults = ref<SimpleUser[]>([])
const userLoading = ref(false)
const showDropdown = ref(false)
const selectedUser = ref<SimpleUser | null>(null)
const submitting = ref(false)

const allGroups = ref<Group[]>([])
const groupLoading = ref(false)
const groupLoadError = ref('')

const groupOptions = computed<GroupOption[]>(() =>
  allGroups.value
    .filter(g => g.subscription_type === 'subscription' && g.status === 'active')
    .map(g => ({ value: g.id, label: g.name }))
)

const form = reactive({
  user_id: null as number | null,
  group_id: null as number | null,
  validity_days: 30
})

let searchTimeout: ReturnType<typeof setTimeout> | null = null

// 弹窗打开时自动加载分组
watch(() => props.show, (isOpen) => {
  if (isOpen && allGroups.value.length === 0) {
    loadGroups()
  }
})

const loadGroups = async () => {
  groupLoading.value = true
  groupLoadError.value = ''
  try {
    allGroups.value = await adminAPI.groups.getAll()
  } catch (error: any) {
    groupLoadError.value = error?.message || '加载分组失败，请刷新页面重试'
    console.error('加载分组失败:', error)
  } finally {
    groupLoading.value = false
  }
}

const onUserSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(doUserSearch, 300)
}

const doUserSearch = async () => {
  const keyword = userKeyword.value.trim()

  if (selectedUser.value && keyword !== selectedUser.value.email) {
    selectedUser.value = null
    form.user_id = null
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

const pickUser = (user: SimpleUser) => {
  selectedUser.value = user
  userKeyword.value = user.email
  showDropdown.value = false
  form.user_id = user.id
}

const clearUser = () => {
  selectedUser.value = null
  userKeyword.value = ''
  userResults.value = []
  form.user_id = null
}

const handleClose = () => {
  if (submitting.value) return
  form.user_id = null
  form.group_id = null
  form.validity_days = 30
  selectedUser.value = null
  userKeyword.value = ''
  userResults.value = []
  showDropdown.value = false
  emit('close')
}

const handleSubmit = async () => {
  if (!form.user_id) {
    showError('请先搜索并选择目标用户')
    return
  }
  if (!form.group_id) {
    showError('请选择订阅分组')
    return
  }
  if (!form.validity_days || form.validity_days < 1) {
    showError('有效期天数必须大于0')
    return
  }

  submitting.value = true
  try {
    await adminAPI.subscriptions.assign({
      user_id: form.user_id,
      group_id: form.group_id,
      validity_days: form.validity_days
    })
    submitting.value = false
    emit('assigned')
    handleClose()
  } catch (error: any) {
    showError(error?.response?.data?.detail || error?.response?.data?.message || '分配订阅失败')
    submitting.value = false
  }
}
</script>
