<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
    <!-- 页面标题区 -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-white">密钥管理</h1>
          <p class="mt-2 text-sm text-slate-400">创建和管理你的 API 访问密钥</p>
        </div>
        <div class="flex gap-3">
          <button
            @click="loadKeys"
            :disabled="loading"
            class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800 disabled:opacity-50"
          >
            🔄 刷新
          </button>
          <button
            @click="showCreateSheet = true"
            class="rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-2 text-sm font-bold text-white shadow-lg shadow-brand-500/30 transition hover:shadow-brand-500/50"
          >
            ➕ 创建密钥
          </button>
        </div>
      </div>
    </div>

    <!-- 统计卡片区 -->
    <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <!-- 密钥总数 -->
      <div class="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/40 p-5 backdrop-blur-sm transition hover:border-slate-600">
        <div class="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-brand-500/10 blur-2xl"></div>
        <div class="relative">
          <div class="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">密钥总数</div>
          <div class="text-3xl font-bold text-white">{{ total }}</div>
          <div class="mt-1 text-xs text-slate-400">所有密钥数量</div>
        </div>
      </div>

      <!-- 活跃密钥 -->
      <div class="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/40 p-5 backdrop-blur-sm transition hover:border-emerald-500/50">
        <div class="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-emerald-500/10 blur-2xl"></div>
        <div class="relative">
          <div class="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">活跃密钥</div>
          <div class="text-3xl font-bold text-emerald-400">{{ activeCount }}</div>
          <div class="mt-1 text-xs text-slate-400">{{ activeCount }} 个可用</div>
        </div>
      </div>

      <!-- 今日消费 -->
      <div class="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/40 p-5 backdrop-blur-sm transition hover:border-gold-500/50">
        <div class="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-gold-500/10 blur-2xl"></div>
        <div class="relative">
          <div class="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">今日消费</div>
          <div class="text-3xl font-bold text-gold-400">${{ todayCost.toFixed(4) }}</div>
          <div class="mt-1 text-xs text-slate-400">所有密钥今日消费</div>
        </div>
      </div>

      <!-- 总消费 -->
      <div class="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/40 p-5 backdrop-blur-sm transition hover:border-blue-500/50">
        <div class="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-blue-500/10 blur-2xl"></div>
        <div class="relative">
          <div class="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">总消费</div>
          <div class="text-3xl font-bold text-blue-400">${{ totalCost.toFixed(4) }}</div>
          <div class="mt-1 text-xs text-slate-400">所有密钥累计消费</div>
        </div>
      </div>
    </div>

    <!-- 筛选区 -->
    <div class="mb-6 rounded-xl border border-slate-700/50 bg-slate-800/40 p-5 backdrop-blur-sm">
      <div class="mb-4 flex items-center gap-2">
        <span class="text-lg">🔍</span>
        <h3 class="text-lg font-bold text-white">筛选条件</h3>
      </div>
      <div class="flex flex-wrap gap-3">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索密钥名称..."
          class="flex-1 min-w-[200px] rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          @input="debouncedSearch"
        />
        <select
          v-model="filterStatus"
          class="rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2.5 text-sm text-white backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          @change="loadKeys"
        >
          <option value="">全部状态</option>
          <option value="active">活跃</option>
          <option value="inactive">禁用</option>
          <option value="expired">已过期</option>
          <option value="quota_exhausted">额度耗尽</option>
        </select>
        <select
          v-model="filterGroupId"
          class="rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2.5 text-sm text-white backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          @change="loadKeys"
        >
          <option value="">全部分组</option>
          <option v-for="group in groups" :key="group.id" :value="group.id">
            {{ group.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading && keys.length === 0" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-brand-500"></div>
        <p class="text-sm text-slate-400">加载密钥列表...</p>
      </div>
    </div>

    <!-- 密钥列表 -->
    <div v-else-if="keys.length > 0" class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
      <!-- 表头 -->
      <div class="border-b border-slate-700/50 p-5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-lg">🔑</span>
            <h3 class="text-lg font-bold text-white">密钥列表</h3>
          </div>
          <div class="text-sm text-slate-400">共 {{ total }} 个密钥</div>
        </div>
      </div>

      <!-- 表格内容 -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-700/50 bg-slate-900/30">
              <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">名称</th>
              <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">密钥</th>
              <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">分组</th>
              <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">状态</th>
              <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">用量</th>
              <th class="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">更新时间</th>
              <th class="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-700/30">
            <tr v-for="key in keys" :key="key.id" class="transition hover:bg-slate-700/20">
              <!-- 名称 -->
              <td class="px-5 py-4">
                <div class="font-medium text-white">{{ key.name }}</div>
              </td>

              <!-- 密钥 -->
              <td class="px-5 py-4">
                <div class="flex items-center gap-2">
                  <code class="rounded bg-slate-900/80 px-2 py-1 text-xs font-mono text-slate-300">
                    {{ maskKey(key.key) }}
                  </code>
                  <button
                    @click="copyKey(key.key, key.id)"
                    class="rounded p-1.5 transition hover:bg-slate-700/50"
                    :class="copiedId === key.id ? 'text-emerald-400' : 'text-slate-400'"
                  >
                    <span v-if="copiedId === key.id">✓</span>
                    <span v-else>📋</span>
                  </button>
                </div>
              </td>

              <!-- 分组 -->
              <td class="px-5 py-4">
                <span v-if="key.group" class="inline-flex items-center rounded-full bg-slate-700/50 px-2.5 py-0.5 text-xs font-medium text-slate-300">
                  {{ key.group.name }}
                </span>
                <span v-else class="text-sm text-slate-500">-</span>
              </td>

              <!-- 状态 -->
              <td class="px-5 py-4">
                <div>
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                    :class="{
                      'bg-emerald-500/20 text-emerald-400': key.status === 'active',
                      'bg-slate-700/50 text-slate-400': key.status === 'inactive',
                      'bg-amber-500/20 text-amber-400': key.status === 'expired' || key.status === 'quota_exhausted'
                    }"
                  >
                    {{ getStatusLabel(key.status) }}
                  </span>
                  <div v-if="key.quota > 0" class="mt-1 text-xs text-slate-500">
                    额度: ${{ key.quota_used.toFixed(2) }} / ${{ key.quota.toFixed(2) }}
                  </div>
                </div>
              </td>

              <!-- 用量 -->
              <td class="px-5 py-4">
                <div class="text-sm">
                  <div class="text-white">今日: ${{ (keyUsage[key.id]?.today || 0).toFixed(4) }}</div>
                  <div class="text-slate-500">总计: ${{ (keyUsage[key.id]?.total || 0).toFixed(4) }}</div>
                </div>
              </td>

              <!-- 更新时间 -->
              <td class="px-5 py-4">
                <div class="text-sm text-slate-400">{{ new Date(key.updated_at).toLocaleString('zh-CN') }}</div>
              </td>

              <!-- 操作 -->
              <td class="px-5 py-4">
                <div class="flex justify-end gap-2">
                  <button
                    @click="editKey(key)"
                    class="rounded-lg bg-slate-700/50 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700"
                  >
                    编辑
                  </button>
                  <button
                    @click="toggleKeyStatus(key)"
                    class="rounded-lg bg-slate-700/50 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700"
                  >
                    {{ key.status === 'active' ? '禁用' : '启用' }}
                  </button>
                  <button
                    @click="confirmDelete(key)"
                    class="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/30"
                  >
                    删除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="flex flex-col items-center justify-center rounded-xl border border-slate-700/50 bg-slate-800/40 py-20 backdrop-blur-sm">
      <div class="mb-4 text-6xl">🔑</div>
      <h3 class="mb-2 text-xl font-bold text-white">暂无密钥</h3>
      <p class="mb-6 text-sm text-slate-400">创建你的第一个 API 密钥开始使用</p>
      <button
        @click="showCreateSheet = true"
        class="rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-500/30 transition hover:shadow-brand-500/50"
      >
        创建密钥
      </button>
    </div>

    <!-- 创建密钥弹窗 -->
    <div v-if="showCreateSheet" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" @click.self="showCreateSheet = false">
      <div class="w-full max-w-md rounded-xl border border-slate-700/50 bg-slate-900 p-6 shadow-2xl">
        <div class="mb-6">
          <h2 class="text-xl font-bold text-white">创建 API 密钥</h2>
          <p class="mt-1 text-sm text-slate-400">填写密钥信息并创建</p>
        </div>

        <div class="space-y-4">
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">密钥名称</label>
            <input
              v-model="createForm.name"
              type="text"
              placeholder="输入密钥名称"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">选择分组</label>
            <select
              v-model="createForm.groupId"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2.5 text-sm text-white backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option :value="null">无分组</option>
              <option v-for="group in groups" :key="group.id" :value="group.id">
                {{ group.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">额度限制 (USD)</label>
            <input
              v-model.number="createForm.quota"
              type="number"
              min="0"
              step="0.01"
              placeholder="0 = 无限制"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">过期天数</label>
            <input
              v-model.number="createForm.expiresInDays"
              type="number"
              min="0"
              placeholder="0 = 永不过期"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>

        <div class="mt-6 flex gap-3">
          <button
            @click="handleCreate"
            :disabled="creating || !createForm.name"
            class="flex-1 rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-500/30 transition hover:shadow-brand-500/50 disabled:opacity-50"
          >
            {{ creating ? '创建中...' : '创建密钥' }}
          </button>
          <button
            @click="showCreateSheet = false"
            class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2.5 text-sm font-medium text-slate-300 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800"
          >
            取消
          </button>
        </div>
      </div>
    </div>

    <!-- 编辑密钥弹窗 -->
    <div v-if="showEditSheet" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" @click.self="showEditSheet = false">
      <div class="w-full max-w-md rounded-xl border border-slate-700/50 bg-slate-900 p-6 shadow-2xl">
        <div class="mb-6">
          <h2 class="text-xl font-bold text-white">编辑密钥</h2>
          <p class="mt-1 text-sm text-slate-400">修改密钥信息</p>
        </div>

        <div v-if="editingKey" class="space-y-4">
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">密钥名称</label>
            <input
              v-model="editForm.name"
              type="text"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2.5 text-sm text-white backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">选择分组</label>
            <select
              v-model="editForm.groupId"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2.5 text-sm text-white backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option :value="null">无分组</option>
              <option v-for="group in groups" :key="group.id" :value="group.id">
                {{ group.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="mt-6 flex gap-3">
          <button
            @click="handleUpdate"
            :disabled="updating"
            class="flex-1 rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-500/30 transition hover:shadow-brand-500/50 disabled:opacity-50"
          >
            {{ updating ? '保存中...' : '保存修改' }}
          </button>
          <button
            @click="showEditSheet = false"
            class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2.5 text-sm font-medium text-slate-300 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { keysAPI, groupsAPI, usageAPI } from '@/api'
import type { ApiKey, Group } from '@/types'
import { showError, showSuccess, confirm } from '@/utils/toast'

const loading = ref(false)
const creating = ref(false)
const updating = ref(false)
const keys = ref<ApiKey[]>([])
const groups = ref<Group[]>([])
const total = ref(0)
const copiedId = ref<number | null>(null)
const keyUsage = ref<Record<number, { today: number; total: number }>>({})

const searchQuery = ref('')
const filterStatus = ref('')
const filterGroupId = ref<number | string>('')

const showCreateSheet = ref(false)
const showEditSheet = ref(false)
const editingKey = ref<ApiKey | null>(null)

const createForm = ref({
  name: '',
  groupId: null as number | null,
  quota: 0,
  expiresInDays: 0,
})

const editForm = ref({
  name: '',
  groupId: null as number | null,
})

const activeCount = computed(() => keys.value.filter((k) => k.status === 'active').length)
const todayCost = computed(() =>
  Object.values(keyUsage.value).reduce((sum, usage) => sum + usage.today, 0),
)
const totalCost = computed(() =>
  Object.values(keyUsage.value).reduce((sum, usage) => sum + usage.total, 0),
)

const maskKey = (key: string) => {
  if (!key || key.length < 8) return key
  return `${key.slice(0, 8)}...${key.slice(-4)}`
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    active: '活跃',
    inactive: '禁用',
    expired: '已过期',
    quota_exhausted: '额度耗尽',
  }
  return labels[status] || status
}

const copyKey = async (key: string, id: number) => {
  try {
    await navigator.clipboard.writeText(key)
    copiedId.value = id
    setTimeout(() => {
      copiedId.value = null
    }, 2000)
  } catch (error) {
    console.error('复制失败:', error)
  }
}

let searchTimeout: ReturnType<typeof setTimeout>
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadKeys()
  }, 500)
}

const loadKeys = async () => {
  loading.value = true
  try {
    const filters: Record<string, unknown> = {}
    if (searchQuery.value) filters.search = searchQuery.value
    if (filterStatus.value) filters.status = filterStatus.value
    if (filterGroupId.value) filters.group_id = filterGroupId.value

    const res = await keysAPI.list(1, 100, filters)
    keys.value = res.items
    total.value = res.total

    if (keys.value.length > 0) {
      const keyIds = keys.value.map((k) => k.id)
      const usageRes = await usageAPI.getDashboardApiKeysUsage(keyIds)
      keyUsage.value = Object.fromEntries(
        Object.entries(usageRes.stats).map(([id, data]) => [
          Number(id),
          { today: data.today_actual_cost, total: data.total_actual_cost },
        ]),
      )
    }
  } catch (error) {
    console.error('加载密钥失败:', error)
  } finally {
    loading.value = false
  }
}

const loadGroups = async () => {
  try {
    groups.value = await groupsAPI.getAvailable()
  } catch (error) {
    console.error('加载分组失败:', error)
  }
}

const handleCreate = async () => {
  if (!createForm.value.name) return

  creating.value = true
  try {
    await keysAPI.create(
      createForm.value.name,
      createForm.value.groupId,
      undefined,
      undefined,
      undefined,
      createForm.value.quota > 0 ? createForm.value.quota : undefined,
      createForm.value.expiresInDays > 0 ? createForm.value.expiresInDays : undefined,
    )
    showCreateSheet.value = false
    createForm.value = { name: '', groupId: null, quota: 0, expiresInDays: 0 }
    await loadKeys()
  } catch (error) {
    console.error('创建密钥失败:', error)
    showError('创建失败: ' + (error as Error).message)
  } finally {
    creating.value = false
  }
}

const editKey = (key: ApiKey) => {
  editingKey.value = key
  editForm.value = {
    name: key.name,
    groupId: key.group_id || null,
  }
  showEditSheet.value = true
}

const handleUpdate = async () => {
  if (!editingKey.value) return

  updating.value = true
  try {
    await keysAPI.update(editingKey.value.id, {
      name: editForm.value.name,
      group_id: editForm.value.groupId,
    })
    showEditSheet.value = false
    editingKey.value = null
    await loadKeys()
  } catch (error) {
    console.error('更新密钥失败:', error)
    showError('更新失败: ' + (error as Error).message)
  } finally {
    updating.value = false
  }
}

const toggleKeyStatus = async (key: ApiKey) => {
  try {
    const newStatus = key.status === 'active' ? 'inactive' : 'active'
    await keysAPI.toggleStatus(key.id, newStatus)
    await loadKeys()
  } catch (error) {
    console.error('切换状态失败:', error)
    showError('操作失败: ' + (error as Error).message)
  }
}

const confirmDelete = async (key: ApiKey) => {
  const confirmed = await confirm({
    type: 'danger',
    title: '确认删除',
    message: `确定要删除密钥 "${key.name}" 吗？此操作不可恢复。`,
    confirmText: '删除',
    cancelText: '取消'
  })

  if (!confirmed) return

  try {
    await keysAPI.delete(key.id)
    await loadKeys()
    showSuccess('密钥已删除')
  } catch (error) {
    console.error('删除密钥失败:', error)
    showError('删除失败: ' + (error as Error).message)
  }
}

onMounted(() => {
  loadKeys()
  loadGroups()
})
</script>
