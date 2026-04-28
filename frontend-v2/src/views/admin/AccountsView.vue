<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { adminAPI } from '@/api/admin'
import { confirm, showSuccess, showError } from '@/utils/toast'
import type { Account, AdminGroup, Proxy } from '@/types'
import AccountFilterBar from '@/components/admin/account/AccountFilterBar.vue'
import AccountCard from '@/components/admin/account/AccountCard.vue'
import AccountFormModal from '@/components/admin/account/AccountFormModal.vue'
import AccountStatsModal from '@/components/admin/account/AccountStatsModal.vue'
import AccountTestModal from '@/components/admin/account/AccountTestModal.vue'

// ---- Filter state ----
const searchQuery = ref('')
const platformFilter = ref('')
const typeFilter = ref('')
const statusFilter = ref('')
const groupFilter = ref('')
const viewMode = ref<'grid' | 'table'>((localStorage.getItem('accounts-view-mode') as 'grid' | 'table') || 'grid')

// ---- Data state ----
const accounts = ref<Account[]>([])
const allGroups = ref<AdminGroup[]>([])
const allProxies = ref<Proxy[]>([])
const todayStats = ref<Record<string, { requests: number; tokens: number; cost: number }> | null>(null)
const loading = ref(false)
const submitting = ref(false)
let abortController: AbortController | null = null

// ---- Pagination ----
const pagination = reactive({
  page: 1,
  page_size: 20,
  total: 0,
  pages: 0,
})

// ---- Modal state ----
const showFormModal = ref(false)
const showStatsModal = ref(false)
const showTestModal = ref(false)
const editingAccount = ref<Account | null>(null)
const statsAccount = ref<Account | null>(null)
const testAccount = ref<Account | null>(null)

// ---- Stats/Test modal state ----
const statsLoading = ref(false)
const statsData = ref<Record<string, unknown> | null>(null)
const statsError = ref('')
const testLoading = ref(false)
const testOutput = ref('')
const testError = ref('')

// ---- Computed ----
const stats = computed(() => {
  const total = accounts.value.length
  const active = accounts.value.filter(a => a.status === 'active').length
  const error = accounts.value.filter(a => a.status === 'error').length
  const inactive = accounts.value.filter(a => a.status === 'inactive').length
  const platforms = new Set(accounts.value.map(a => a.platform))
  return { total, active, error, inactive, platformCount: platforms.size }
})

const groupOptions = computed(() =>
  allGroups.value.map(g => ({ id: g.id, name: g.name }))
)

const rangeStart = computed(() => (pagination.page - 1) * pagination.page_size + 1)
const rangeEnd = computed(() => Math.min(pagination.page * pagination.page_size, pagination.total))

// ---- Data loading ----
async function loadAccounts() {
  if (abortController) abortController.abort()
  const controller = new AbortController()
  abortController = controller

  loading.value = true
  try {
    const filters: Record<string, unknown> = {}
    if (searchQuery.value) filters.search = searchQuery.value
    if (platformFilter.value) filters.platform = platformFilter.value
    if (typeFilter.value) filters.type = typeFilter.value
    if (statusFilter.value) filters.status = statusFilter.value
    if (groupFilter.value) filters.group_id = parseInt(groupFilter.value)

    const response = await adminAPI.accounts.list(
      pagination.page,
      pagination.page_size,
      filters,
      { signal: controller.signal }
    )
    if (controller.signal.aborted) return
    accounts.value = response.items
    pagination.total = response.total
    pagination.pages = response.pages

    // Batch load today stats
    loadTodayStats()
  } catch (err: any) {
    if (err?.name === 'AbortError' || err?.code === 'ERR_CANCELED') return
    showError('加载账号数据失败')
  } finally {
    if (abortController === controller) {
      loading.value = false
      abortController = null
    }
  }
}

async function loadTodayStats() {
  if (accounts.value.length === 0) return
  try {
    const ids = accounts.value.map(a => a.id)
    const data = await adminAPI.accounts.getBatchTodayStats(ids)
    todayStats.value = data as Record<string, { requests: number; tokens: number; cost: number }>
  } catch {
    // non-critical, silently fail
  }
}

async function loadGroups() {
  try {
    allGroups.value = await adminAPI.groups.getAll()
  } catch { /* ignore */ }
}

async function loadProxies() {
  try {
    const resp = await adminAPI.proxies.list(1, 200)
    allProxies.value = resp.items
  } catch { /* ignore */ }
}

// ---- Search ----
function handleSearch() {
  pagination.page = 1
  loadAccounts()
}

// ---- Pagination ----
function goPage(page: number) {
  if (page < 1 || page > pagination.pages) return
  pagination.page = page
  loadAccounts()
}

function onPageSizeChange(size: number) {
  pagination.page_size = size
  pagination.page = 1
  loadAccounts()
}

// ---- View mode ----
function setViewMode(mode: 'grid' | 'table') {
  viewMode.value = mode
  localStorage.setItem('accounts-view-mode', mode)
}

// ---- CRUD ----
function openCreate() {
  editingAccount.value = null
  showFormModal.value = true
}

function openEdit(account: Account) {
  editingAccount.value = account
  showFormModal.value = true
}

async function handleSubmit(data: Record<string, unknown>, isEdit: boolean) {
  submitting.value = true
  try {
    if (isEdit && editingAccount.value) {
      await adminAPI.accounts.update(editingAccount.value.id, data)
      showSuccess('账号更新成功')
    } else {
      await adminAPI.accounts.create(data)
      showSuccess('账号创建成功')
    }
    showFormModal.value = false
    loadAccounts()
  } catch (err: any) {
    showError(err?.response?.data?.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

async function handleDelete(account: Account) {
  const ok = await confirm(`确定要删除账号「${account.name}」吗？此操作不可撤销。`)
  if (!ok) return
  try {
    await adminAPI.accounts.delete(account.id)
    showSuccess('账号已删除')
    loadAccounts()
  } catch (err: any) {
    showError(err?.response?.data?.message || '删除失败')
  }
}

async function handleToggleStatus(account: Account) {
  const newStatus = account.status === 'active' ? 'inactive' : 'active'
  const action = newStatus === 'active' ? '启用' : '停用'
  const ok = await confirm(`确定要${action}账号「${account.name}」吗？`)
  if (!ok) return
  try {
    await adminAPI.accounts.toggleStatus(account.id, newStatus)
    showSuccess(`账号已${action}`)
    loadAccounts()
  } catch (err: any) {
    showError(err?.response?.data?.message || `${action}失败`)
  }
}

// ---- Stats modal ----
async function openStats(account: Account) {
  statsAccount.value = account
  showStatsModal.value = true
  statsLoading.value = true
  statsError.value = ''
  statsData.value = null
  try {
    const data = await adminAPI.accounts.getStats(account.id)
    statsData.value = data
  } catch (err: any) {
    statsError.value = err?.response?.data?.message || '加载统计数据失败'
  } finally {
    statsLoading.value = false
  }
}

function closeStats() {
  showStatsModal.value = false
  statsAccount.value = null
  statsData.value = null
}

// ---- Test modal ----
function openTest(acc: Account) {
  testAccount.value = acc
  showTestModal.value = true
  testOutput.value = ''
  testError.value = ''
}

async function handleTest(model?: string) {
  if (!testAccount.value) return
  testLoading.value = true
  testError.value = ''
  testOutput.value = ''
  try {
    const data = await adminAPI.accounts.testAccount(testAccount.value.id, model)
    testOutput.value = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
  } catch (err: any) {
    testError.value = err?.response?.data?.message || '测试失败'
  } finally {
    testLoading.value = false
  }
}

function closeTest() {
  showTestModal.value = false
  testAccount.value = null
  testOutput.value = ''
  testError.value = ''
}

// ---- Init ----
onMounted(() => {
  loadAccounts()
  loadGroups()
  loadProxies()
})

onUnmounted(() => {
  if (abortController) abortController.abort()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
    <!-- Page header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-black text-white">账号管理</h1>
          <p class="mt-2 text-sm font-medium text-slate-400">管理 API 平台账号，配置调度和计费策略</p>
        </div>
        <div class="flex items-center gap-3">
          <button
            class="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-slate-400 transition hover:border-brand-500 hover:text-brand-300"
            :disabled="loading"
            @click="loadAccounts"
          >
            <span v-if="loading">加载中...</span>
            <span v-else>刷新</span>
          </button>
          <button
            class="rounded-full bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-brand-500/20 transition hover:from-brand-600 hover:to-brand-700"
            @click="openCreate"
          >
            + 创建账号
          </button>
        </div>
      </div>
    </div>

    <!-- Stats cards -->
    <div class="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
      <div class="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-brand-500/50 hover:bg-brand-500/[0.07]">
        <div class="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-brand-500/10 blur-2xl transition group-hover:bg-brand-500/20"></div>
        <div class="relative">
          <p class="text-xs font-bold uppercase tracking-widest text-slate-500">总账号</p>
          <p class="mt-2 text-3xl font-black text-white">{{ stats.total }}</p>
        </div>
      </div>
      <div class="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-emerald-500/50 hover:bg-emerald-500/[0.07]">
        <div class="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-emerald-500/10 blur-2xl transition group-hover:bg-emerald-500/20"></div>
        <div class="relative">
          <p class="text-xs font-bold uppercase tracking-widest text-slate-500">活跃</p>
          <p class="mt-2 text-3xl font-black text-emerald-400">{{ stats.active }}</p>
        </div>
      </div>
      <div class="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-red-500/50 hover:bg-red-500/[0.07]">
        <div class="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-red-500/10 blur-2xl transition group-hover:bg-red-500/20"></div>
        <div class="relative">
          <p class="text-xs font-bold uppercase tracking-widest text-slate-500">异常</p>
          <p class="mt-2 text-3xl font-black text-red-400">{{ stats.error }}</p>
        </div>
      </div>
      <div class="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-amber-500/50 hover:bg-amber-500/[0.07]">
        <div class="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-amber-500/10 blur-2xl transition group-hover:bg-amber-500/20"></div>
        <div class="relative">
          <p class="text-xs font-bold uppercase tracking-widest text-slate-500">未激活</p>
          <p class="mt-2 text-3xl font-black text-amber-400">{{ stats.inactive }}</p>
        </div>
      </div>
      <div class="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-violet-500/50 hover:bg-violet-500/[0.07]">
        <div class="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-violet-500/10 blur-2xl transition group-hover:bg-violet-500/20"></div>
        <div class="relative">
          <p class="text-xs font-bold uppercase tracking-widest text-slate-500">平台</p>
          <p class="mt-2 text-3xl font-black text-violet-400">{{ stats.platformCount }}</p>
        </div>
      </div>
    </div>

    <!-- Filter bar -->
    <div class="mb-6">
      <AccountFilterBar
        :search-query="searchQuery"
        :platform-filter="platformFilter"
        :type-filter="typeFilter"
        :status-filter="statusFilter"
        :group-filter="groupFilter"
        :groups="groupOptions"
        :view-mode="viewMode"
        @update:search-query="searchQuery = $event"
        @update:platform-filter="platformFilter = $event; handleSearch()"
        @update:type-filter="typeFilter = $event; handleSearch()"
        @update:status-filter="statusFilter = $event; handleSearch()"
        @update:group-filter="groupFilter = $event; handleSearch()"
        @update:view-mode="setViewMode($event)"
        @search="handleSearch()"
      />
    </div>

    <!-- Loading state -->
    <div v-if="loading && accounts.length === 0" class="flex items-center justify-center py-24">
      <div class="text-center">
        <div class="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-brand-500"></div>
        <p class="text-sm text-slate-400">加载账号数据...</p>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="accounts.length === 0 && !loading" class="flex flex-col items-center justify-center py-24">
      <div class="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-dashed border-slate-700/50 bg-slate-800/30">
        <svg class="h-10 w-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
      <h3 class="mb-1 text-lg font-medium text-slate-300">暂无账号</h3>
      <p class="mb-4 text-sm text-slate-500">点击"创建账号"添加第一个 API 平台账号</p>
      <button
        class="rounded-full bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-brand-500/20 transition hover:from-brand-600 hover:to-brand-700"
        @click="openCreate"
      >
        + 创建账号
      </button>
    </div>

    <!-- Card Grid View -->
    <template v-else-if="viewMode === 'grid'">
      <div class="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AccountCard
          v-for="account in accounts"
          :key="account.id"
          :account="account"
          :groups="allGroups"
          :today-stats="todayStats"
          @edit="openEdit"
          @delete="handleDelete"
          @toggle-status="handleToggleStatus"
          @test="openTest(account)"
          @stats="openStats"
          @refresh="loadAccounts"
        />
      </div>
    </template>

    <!-- Table View -->
    <template v-else>
      <div class="rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="border-b border-white/[0.06] bg-white/[0.03]">
              <tr>
                <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">账号</th>
                <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">平台</th>
                <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">类型</th>
                <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">状态</th>
                <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">并发</th>
                <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">优先级</th>
                <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">倍率</th>
                <th class="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-widest text-slate-400">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/[0.04]">
              <tr
                v-for="account in accounts"
                :key="account.id"
                class="transition hover:bg-white/[0.04]"
              >
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2.5">
                    <div :class="[
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                      { 'bg-amber-500/10': account.platform === 'anthropic', 'bg-emerald-500/10': account.platform === 'openai', 'bg-blue-500/10': account.platform === 'gemini', 'bg-violet-500/10': account.platform === 'antigravity' }
                    ]">
                      <span v-if="account.platform === 'anthropic'">🧠</span>
                      <span v-else-if="account.platform === 'openai'">🤖</span>
                      <span v-else-if="account.platform === 'gemini'">💎</span>
                      <span v-else>🌌</span>
                    </div>
                    <div>
                      <p class="text-sm font-bold text-white">{{ account.name }}</p>
                      <p v-if="account.notes" class="text-[11px] text-slate-500 truncate max-w-[160px]">{{ account.notes }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3 text-xs text-slate-300">{{ account.platform }}</td>
                <td class="px-4 py-3">
                  <span class="inline-block rounded-full bg-white/[0.08] px-2 py-0.5 text-[10px] font-bold uppercase text-slate-400">{{ account.type }}</span>
                </td>
                <td class="px-4 py-3">
                  <span :class="[
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold',
                    account.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                    account.status === 'error' ? 'bg-red-500/10 text-red-400' :
                    'bg-slate-500/10 text-slate-400'
                  ]">
                    <span :class="['h-1.5 w-1.5 rounded-full', account.status === 'active' ? 'bg-emerald-400' : account.status === 'error' ? 'bg-red-400' : 'bg-slate-500']" />
                    {{ account.status === 'active' ? '活跃' : account.status === 'error' ? '异常' : '未激活' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-xs text-slate-300">{{ account.current_concurrency ?? 0 }}/{{ account.concurrency }}</td>
                <td class="px-4 py-3 text-xs text-slate-300">{{ account.priority }}</td>
                <td class="px-4 py-3 text-xs text-slate-300">×{{ account.rate_multiplier ?? 1 }}</td>
                <td class="px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <button
                      class="rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-slate-400 transition hover:bg-white/10 hover:text-white"
                      @click="openEdit(account)"
                    >编辑</button>
                    <button
                      class="rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-slate-400 transition hover:bg-white/10 hover:text-white"
                      @click="openTest(account)"
                    >测试</button>
                    <button
                      :class="[
                        'rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition',
                        account.status === 'active'
                          ? 'text-red-400/60 hover:bg-red-500/10 hover:text-red-400'
                          : 'text-emerald-400/60 hover:bg-emerald-500/10 hover:text-emerald-400'
                      ]"
                      @click="handleToggleStatus(account)"
                    >
                      {{ account.status === 'active' ? '停用' : '启用' }}
                    </button>
                    <button
                      class="rounded-lg px-2 py-1.5 text-[11px] font-medium text-red-400/40 transition hover:bg-red-500/10 hover:text-red-400"
                      @click="handleDelete(account)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-3.5 w-3.5"><path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- Pagination -->
    <div v-if="pagination.total > 0" class="mt-6 flex flex-col items-center gap-4">
      <div class="flex items-center gap-4">
        <button
          :disabled="pagination.page <= 1"
          class="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-brand-500/30 hover:text-brand-400 disabled:opacity-30"
          @click="goPage(pagination.page - 1)"
        >
          <svg class="h-4 w-4 transition group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <span class="text-sm font-bold text-white">{{ pagination.page }} <span class="text-slate-600">/</span> {{ pagination.pages }}</span>
        <button
          :disabled="pagination.page >= pagination.pages"
          class="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-brand-500/30 hover:text-brand-400 disabled:opacity-30"
          @click="goPage(pagination.page + 1)"
        >
          <svg class="h-4 w-4 transition group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
      <div class="flex items-center gap-4 text-xs text-slate-500">
        <span>{{ rangeStart }}-{{ rangeEnd }} / <span class="text-slate-300">{{ pagination.total }}</span> 条</span>
        <span class="text-slate-600">|</span>
        <select
          :value="pagination.page_size"
          class="rounded-md border-none bg-transparent text-xs text-slate-500 transition hover:text-slate-300 focus:outline-none"
          @change="onPageSizeChange(Number(($event.target as HTMLSelectElement).value))"
        >
          <option :value="10">10条</option>
          <option :value="20">20条</option>
          <option :value="50">50条</option>
          <option :value="100">100条</option>
        </select>
      </div>
    </div>

    <!-- Modals -->
    <AccountFormModal
      :show="showFormModal"
      :edit-account="editingAccount"
      :groups="allGroups"
      :proxies="allProxies"
      :loading="submitting"
      @close="showFormModal = false"
      @submit="handleSubmit"
    />

    <AccountStatsModal
      :show="showStatsModal"
      :account="statsAccount"
      :loading="statsLoading"
      :stats="statsData"
      :error="statsError"
      @close="closeStats"
    />

    <AccountTestModal
      :show="showTestModal"
      :account="testAccount"
      :loading="testLoading"
      :output="testOutput"
      :error="testError"
      @close="closeTest"
      @test="handleTest"
    />
  </div>
</template>
