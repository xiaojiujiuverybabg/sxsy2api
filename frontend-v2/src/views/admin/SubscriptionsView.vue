<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
    <div class="p-6">
      <!-- 页面标题 -->
      <div class="mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-white">订阅管理</h1>
            <p class="mt-1 text-sm text-slate-400">管理用户订阅、查看用量、调整有效期</p>
          </div>
        </div>
      </div>

      <!-- 统计栏 -->
      <div class="mb-6">
        <SubscriptionStatsBar :stats="stats" />
      </div>

      <!-- 筛选栏 -->
      <div class="mb-6">
        <SubscriptionFilterBar
          :filters="filters"
          :groups="groupOptions"
          :sort-key="sortState.sort_by"
          :loading="loading"
          @update:filters="onFiltersChange"
          @update:sort-key="onSortChange"
          @refresh="loadSubscriptions"
          @show-guide="showGuideModal = true"
          @show-assign="showAssignModal = true"
        />
      </div>

      <!-- 加载状态 -->
      <div v-if="loading && subscriptions.length === 0" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-gold-500"></div>
          <p class="text-sm text-slate-400">加载订阅数据...</p>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="subscriptions.length === 0" class="flex flex-col items-center justify-center py-20">
        <div class="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-dashed border-slate-700/50 bg-slate-800/30">
          <svg class="h-10 w-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 class="mb-1 text-lg font-medium text-slate-300">暂无订阅记录</h3>
        <p class="mb-4 text-sm text-slate-500">点击「分配订阅」为用户添加第一个订阅</p>
        <button
          @click="showAssignModal = true"
          class="rounded-lg bg-gold-500 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-gold-400"
        >
          + 分配订阅
        </button>
      </div>

      <!-- 卡片网格 -->
      <div v-else class="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SubscriptionCard
          v-for="sub in subscriptions"
          :key="sub.id"
          :subscription="sub"
          @extend="handleExtend"
          @reset-quota="handleResetQuota"
          @revoke="handleRevoke"
        />
      </div>

      <!-- 分页 — 滑动式简洁设计 -->
      <div v-if="pagination.total > 0" class="flex flex-col items-center gap-4 pt-2">
        <!-- 进度式页面指示器 -->
        <div class="flex items-center gap-4">
          <button
            @click="goPage(pagination.page - 1)"
            :disabled="pagination.page <= 1"
            class="group flex h-10 w-10 items-center justify-center rounded-full border border-slate-700/50 bg-slate-800/50 text-slate-400 transition hover:border-gold-500/30 hover:text-gold-400 disabled:opacity-30 disabled:hover:border-slate-700/50 disabled:hover:text-slate-400"
          >
            <svg class="h-4 w-4 transition group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <!-- 进度条式页码指示器 -->
          <div class="flex items-center gap-1.5">
            <button
              v-for="p in pagination.pages"
              :key="p"
              @click="goPage(p)"
              class="h-2 rounded-full transition-all duration-300"
              :class="[
                p === pagination.page
                  ? 'w-6 bg-gold-500'
                  : 'w-2 cursor-pointer bg-slate-600 hover:bg-slate-500'
              ]"
              :title="`第 ${p} 页`"
            ></button>
          </div>

          <button
            @click="goPage(pagination.page + 1)"
            :disabled="pagination.page >= pagination.pages"
            class="group flex h-10 w-10 items-center justify-center rounded-full border border-slate-700/50 bg-slate-800/50 text-slate-400 transition hover:border-gold-500/30 hover:text-gold-400 disabled:opacity-30 disabled:hover:border-slate-700/50 disabled:hover:text-slate-400"
          >
            <svg class="h-4 w-4 transition group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <!-- 底部信息 -->
        <div class="flex items-center gap-4 text-xs text-slate-500">
          <span>{{ rangeStart }}-{{ rangeEnd }} / <span class="text-slate-300">{{ pagination.total }}</span> 条</span>
          <span class="text-slate-600">|</span>
          <select
            :value="pagination.page_size"
            @change="onPageSizeChange(Number(($event.target as HTMLSelectElement).value))"
            class="rounded-md border-none bg-transparent text-xs text-slate-500 transition hover:text-slate-300 focus:outline-none"
          >
            <option :value="10">10条</option>
            <option :value="20">20条</option>
            <option :value="50">50条</option>
            <option :value="100">100条</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 分配订阅弹窗 -->
    <SubscriptionAssignModal
      :show="showAssignModal"
      @close="showAssignModal = false"
      @assigned="onAssigned"
    />

    <!-- 调整订阅弹窗 -->
    <SubscriptionExtendModal
      :show="showExtendModal"
      :subscription="extendingSubscription"
      @close="closeExtendModal"
      @done="loadSubscriptions"
    />

    <!-- 订阅指南弹窗 -->
    <SubscriptionGuideModal
      :show="showGuideModal"
      @close="showGuideModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { adminAPI } from '@/api/admin'
import { confirm, showSuccess, showError } from '@/utils/toast'
import type { UserSubscription, Group } from '@/types'
import SubscriptionStatsBar from '@/components/admin/subscription/SubscriptionStatsBar.vue'
import SubscriptionFilterBar from '@/components/admin/subscription/SubscriptionFilterBar.vue'
import type { SubscriptionFilters } from '@/components/admin/subscription/SubscriptionFilterBar.vue'
import SubscriptionCard from '@/components/admin/subscription/SubscriptionCard.vue'
import SubscriptionAssignModal from '@/components/admin/subscription/SubscriptionAssignModal.vue'
import SubscriptionExtendModal from '@/components/admin/subscription/SubscriptionExtendModal.vue'
import SubscriptionGuideModal from '@/components/admin/subscription/SubscriptionGuideModal.vue'

// 筛选状态
const filters = reactive<SubscriptionFilters>({
  status: '',
  group_id: '',
  platform: '',
  user_id: null
})

const sortState = reactive({
  sort_by: 'created_at',
  sort_order: 'desc' as 'asc' | 'desc'
})

const pagination = reactive({
  page: 1,
  page_size: 20,
  total: 0,
  pages: 0
})

// 数据
const subscriptions = ref<UserSubscription[]>([])
const groups = ref<Group[]>([])
const loading = ref(false)
let abortController: AbortController | null = null

// 弹窗状态
const showAssignModal = ref(false)
const showExtendModal = ref(false)
const showGuideModal = ref(false)
const extendingSubscription = ref<UserSubscription | null>(null)

// 分组选项
const groupOptions = computed(() =>
  groups.value.map(g => ({ id: g.id, name: g.name }))
)

// 统计
const stats = computed(() => {
  const now = new Date()
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  return {
    total: subscriptions.value.length,
    active: subscriptions.value.filter(s => s.status === 'active').length,
    expiringSoon: subscriptions.value.filter(s => {
      if (s.status !== 'active' || !s.expires_at) return false
      const exp = new Date(s.expires_at)
      return exp > now && exp <= sevenDaysLater
    }).length,
    expired: subscriptions.value.filter(s => s.status === 'expired').length
  }
})

// 分页
const rangeStart = computed(() => (pagination.page - 1) * pagination.page_size + 1)
const rangeEnd = computed(() => Math.min(pagination.page * pagination.page_size, pagination.total))

// 加载数据
const loadSubscriptions = async () => {
  if (abortController) abortController.abort()
  const controller = new AbortController()
  abortController = controller

  loading.value = true
  try {
    const response = await adminAPI.subscriptions.list(
      pagination.page,
      pagination.page_size,
      {
        status: filters.status || undefined,
        group_id: filters.group_id ? parseInt(filters.group_id) : undefined,
        platform: filters.platform || undefined,
        user_id: filters.user_id || undefined,
        sort_by: sortState.sort_by,
        sort_order: sortState.sort_order
      },
      { signal: controller.signal }
    )
    if (controller.signal.aborted) return
    subscriptions.value = response.items
    pagination.total = response.total
    pagination.pages = response.pages
  } catch (error: any) {
    if (error?.name === 'AbortError' || error?.code === 'ERR_CANCELED') return
    showError('加载订阅数据失败')
  } finally {
    if (abortController === controller) {
      loading.value = false
      abortController = null
    }
  }
}

const loadGroups = async () => {
  try {
    groups.value = await adminAPI.groups.getAll()
  } catch (error) {
    console.error('加载分组失败:', error)
  }
}

// 筛选变更
const onFiltersChange = (newFilters: SubscriptionFilters) => {
  Object.assign(filters, newFilters)
  pagination.page = 1
  loadSubscriptions()
}

const onSortChange = (key: string) => {
  sortState.sort_by = key
  pagination.page = 1
  loadSubscriptions()
}

// 分页
const goPage = (page: number) => {
  if (page < 1 || page > pagination.pages) return
  pagination.page = page
  loadSubscriptions()
}

const onPageSizeChange = (size: number) => {
  pagination.page_size = size
  pagination.page = 1
  loadSubscriptions()
}

// 分配订阅
const onAssigned = () => {
  showSuccess('订阅分配成功')
  loadSubscriptions()
}

// 调整订阅
const handleExtend = (subscription: UserSubscription) => {
  extendingSubscription.value = subscription
  showExtendModal.value = true
}

const closeExtendModal = () => {
  showExtendModal.value = false
  extendingSubscription.value = null
}

// 撤销订阅
const handleRevoke = async (subscription: UserSubscription) => {
  const confirmed = await confirm({
    type: 'danger',
    title: '撤销订阅',
    message: `确定要撤销用户 ${subscription.user?.email || `#${subscription.user_id}`} 的订阅吗？此操作不可逆。`,
    confirmText: '确认撤销',
    cancelText: '取消'
  })
  if (!confirmed) return

  try {
    await adminAPI.subscriptions.revoke(subscription.id)
    showSuccess('订阅已撤销')
    loadSubscriptions()
  } catch (error: any) {
    showError(error?.response?.data?.detail || error?.response?.data?.message || '撤销订阅失败')
  }
}

// 重置配额
const handleResetQuota = async (subscription: UserSubscription) => {
  const confirmed = await confirm({
    type: 'warning',
    title: '重置配额',
    message: `确定要重置用户 ${subscription.user?.email || `#${subscription.user_id}`} 的用量配额吗？将清零日/周/月所有用量。`,
    confirmText: '确认重置',
    cancelText: '取消'
  })
  if (!confirmed) return

  try {
    await adminAPI.subscriptions.resetQuota(subscription.id, { daily: true, weekly: true, monthly: true })
    showSuccess('配额已重置')
    loadSubscriptions()
  } catch (error: any) {
    showError(error?.response?.data?.detail || error?.response?.data?.message || '重置配额失败')
  }
}

// 点击外部关闭下拉
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('[data-assign-user-search]') && !target.closest('[data-filter-user-search]')) {
    // dropdowns handle themselves via focus/blur
  }
}

onMounted(() => {
  loadSubscriptions()
  loadGroups()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
