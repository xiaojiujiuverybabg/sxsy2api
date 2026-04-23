<template>
  <AtlasPage eyebrow="密钥管理" title="API 密钥工作台" description="创建和管理你的 API 访问密钥">
    <template #actions>
      <div class="flex flex-wrap gap-3">
        <button
          class="rounded-full bg-brand-500 px-5 py-3 text-sm font-black text-white transition hover:bg-brand-700"
          @click="showCreateSheet = true"
        >
          创建密钥
        </button>
        <button
          class="rounded-full border border-line bg-white px-4 py-2 text-sm font-black text-text-secondary transition hover:border-brand-300"
          @click="loadKeys"
          :disabled="loading"
        >
          刷新
        </button>
      </div>
    </template>

    <section v-if="loading && keys.length === 0" class="mt-8 flex items-center justify-center py-12">
      <div class="text-center">
        <div class="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"></div>
        <p class="text-sm text-text-secondary">加载密钥列表...</p>
      </div>
    </section>

    <template v-else>
      <section class="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="密钥总数" :value="String(total)" mark="◇" tone="ember" hint="所有密钥数量" />
        <MetricTile
          label="活跃密钥"
          :value="String(activeCount)"
          mark="✓"
          tone="moss"
          :hint="`${activeCount} 个可用`"
        />
        <MetricTile
          label="今日消费"
          :value="`$${todayCost.toFixed(4)}`"
          mark="$"
          tone="steel"
          hint="所有密钥今日消费"
        />
        <MetricTile
          label="总消费"
          :value="`$${totalCost.toFixed(4)}`"
          mark="Σ"
          tone="ink"
          hint="所有密钥累计消费"
        />
      </section>

      <section class="mt-5 rounded-2xl border border-line bg-surface p-6">
        <div class="mb-4 flex items-center justify-between">
          <div>
            <p class="text-xs font-black uppercase tracking-wider text-text-tertiary">筛选</p>
            <h3 class="mt-1 text-lg font-black text-text-primary">密钥筛选</h3>
          </div>
        </div>
        <div class="flex flex-wrap gap-3">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索密钥名称..."
            class="flex-1 min-w-[200px] rounded-full border border-line bg-white px-4 py-2 text-sm transition focus:border-brand-500 focus:outline-none"
            @input="debouncedSearch"
          />
          <select
            v-model="filterStatus"
            class="rounded-full border border-line bg-white px-4 py-2 text-sm transition focus:border-brand-500 focus:outline-none"
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
            class="rounded-full border border-line bg-white px-4 py-2 text-sm transition focus:border-brand-500 focus:outline-none"
            @change="loadKeys"
          >
            <option value="">全部分组</option>
            <option v-for="group in groups" :key="group.id" :value="group.id">
              {{ group.name }}
            </option>
          </select>
        </div>
      </section>

      <section v-if="keys.length > 0" class="mt-5">
        <SmartTable eyebrow="密钥列表" title="API 密钥" :columns="columns" :rows="tableRows">
          <template #toolbar>
            <div class="text-sm text-text-secondary">共 {{ total }} 个密钥</div>
          </template>
          <template #cell-key="{ row }">
            <div class="flex items-center gap-2">
              <code class="rounded bg-surface-secondary px-2 py-1 text-xs font-mono">{{
                maskKey(String((row as any).raw?.key || ''))
              }}</code>
              <button
                @click="copyKey(String((row as any).raw?.key || ''), Number((row as any).raw?.id || 0))"
                class="rounded p-1 transition hover:bg-surface-secondary"
                :class="copiedId === (row as any).raw?.id ? 'text-moss-600' : 'text-text-tertiary'"
              >
                <span v-if="copiedId === (row as any).raw?.id" class="text-xs">✓</span>
                <span v-else class="text-xs">📋</span>
              </button>
            </div>
          </template>
          <template #cell-status="{ value, row }">
            <StatusPill :label="getStatusLabel(String(value))" :tone="getStatusTone(String(value))" />
            <div v-if="(row as any).raw?.quota > 0" class="mt-1 text-xs text-text-tertiary">
              额度: ${{ ((row as any).raw?.quota_used || 0).toFixed(2) }} / ${{ ((row as any).raw?.quota || 0).toFixed(2) }}
            </div>
          </template>
          <template #cell-usage="{ row }">
            <div class="text-sm">
              <div class="text-text-primary">今日: ${{ (keyUsage[(row as any).raw?.id]?.today || 0).toFixed(4) }}</div>
              <div class="text-text-tertiary">总计: ${{ (keyUsage[(row as any).raw?.id]?.total || 0).toFixed(4) }}</div>
            </div>
          </template>
          <template #cell-actions="{ row }">
            <div class="flex gap-2">
              <button
                @click="editKey((row as any).raw)"
                class="rounded-full bg-surface-secondary px-3 py-1 text-xs font-black transition hover:bg-brand-100"
              >
                编辑
              </button>
              <button
                @click="toggleKeyStatus((row as any).raw)"
                class="rounded-full bg-surface-secondary px-3 py-1 text-xs font-black transition hover:bg-brand-100"
              >
                {{ (row as any).raw?.status === 'active' ? '禁用' : '启用' }}
              </button>
              <button
                @click="confirmDelete((row as any).raw)"
                class="rounded-full bg-surface-secondary px-3 py-1 text-xs font-black text-ember-600 transition hover:bg-ember-100"
              >
                删除
              </button>
            </div>
          </template>
        </SmartTable>
      </section>

      <EmptyScene
        v-else
        title="暂无密钥"
        description="创建你的第一个 API 密钥开始使用"
        mark="◇"
      >
        <ActionButton
          label="创建密钥"
          description="立即创建第一个密钥"
          tone="primary"
          @click="showCreateSheet = true"
        />
      </EmptyScene>
    </template>

    <ActionSheet
      :open="showCreateSheet"
      eyebrow="创建密钥"
      title="新建 API 密钥"
      description="填写密钥信息并创建"
      @close="showCreateSheet = false"
    >
      <div class="space-y-4">
        <div>
          <label class="mb-2 block text-sm font-black text-text-primary">密钥名称</label>
          <input
            v-model="createForm.name"
            type="text"
            placeholder="输入密钥名称"
            class="w-full rounded-lg border border-line bg-white px-4 py-2 text-sm transition focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div>
          <label class="mb-2 block text-sm font-black text-text-primary">选择分组</label>
          <select
            v-model="createForm.groupId"
            class="w-full rounded-lg border border-line bg-white px-4 py-2 text-sm transition focus:border-brand-500 focus:outline-none"
          >
            <option :value="null">无分组</option>
            <option v-for="group in groups" :key="group.id" :value="group.id">
              {{ group.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="mb-2 block text-sm font-black text-text-primary">额度限制 (USD)</label>
          <input
            v-model.number="createForm.quota"
            type="number"
            min="0"
            step="0.01"
            placeholder="0 = 无限制"
            class="w-full rounded-lg border border-line bg-white px-4 py-2 text-sm transition focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div>
          <label class="mb-2 block text-sm font-black text-text-primary">过期天数</label>
          <input
            v-model.number="createForm.expiresInDays"
            type="number"
            min="0"
            placeholder="0 = 永不过期"
            class="w-full rounded-lg border border-line bg-white px-4 py-2 text-sm transition focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div class="flex gap-3 pt-4">
          <button
            @click="handleCreate"
            :disabled="creating || !createForm.name"
            class="flex-1 rounded-full bg-brand-500 px-5 py-3 text-sm font-black text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {{ creating ? '创建中...' : '创建密钥' }}
          </button>
          <button
            @click="showCreateSheet = false"
            class="rounded-full border border-line bg-white px-5 py-3 text-sm font-black text-text-secondary transition hover:border-brand-300"
          >
            取消
          </button>
        </div>
      </div>
    </ActionSheet>

    <ActionSheet
      :open="showEditSheet"
      eyebrow="编辑密钥"
      title="修改密钥信息"
      description="更新密钥配置"
      @close="showEditSheet = false"
    >
      <div v-if="editingKey" class="space-y-4">
        <div>
          <label class="mb-2 block text-sm font-black text-text-primary">密钥名称</label>
          <input
            v-model="editForm.name"
            type="text"
            class="w-full rounded-lg border border-line bg-white px-4 py-2 text-sm transition focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div>
          <label class="mb-2 block text-sm font-black text-text-primary">选择分组</label>
          <select
            v-model="editForm.groupId"
            class="w-full rounded-lg border border-line bg-white px-4 py-2 text-sm transition focus:border-brand-500 focus:outline-none"
          >
            <option :value="null">无分组</option>
            <option v-for="group in groups" :key="group.id" :value="group.id">
              {{ group.name }}
            </option>
          </select>
        </div>
        <div class="flex gap-3 pt-4">
          <button
            @click="handleUpdate"
            :disabled="updating"
            class="flex-1 rounded-full bg-brand-500 px-5 py-3 text-sm font-black text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {{ updating ? '保存中...' : '保存修改' }}
          </button>
          <button
            @click="showEditSheet = false"
            class="rounded-full border border-line bg-white px-5 py-3 text-sm font-black text-text-secondary transition hover:border-brand-300"
          >
            取消
          </button>
        </div>
      </div>
    </ActionSheet>
  </AtlasPage>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { keysAPI, groupsAPI, usageAPI } from '@/api'
import type { ApiKey, Group } from '@/types'
import {
  ActionButton,
  ActionSheet,
  AtlasPage,
  EmptyScene,
  MetricTile,
  SmartTable,
  StatusPill,
} from '@/components/atlas'

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

const columns = [
  { key: 'name', label: '名称' },
  { key: 'key', label: '密钥' },
  { key: 'group', label: '分组' },
  { key: 'status', label: '状态' },
  { key: 'usage', label: '用量' },
  { key: 'updated', label: '更新时间' },
  { key: 'actions', label: '操作' },
]

const activeCount = computed(() => keys.value.filter((k) => k.status === 'active').length)
const todayCost = computed(() =>
  Object.values(keyUsage.value).reduce((sum, usage) => sum + usage.today, 0),
)
const totalCost = computed(() =>
  Object.values(keyUsage.value).reduce((sum, usage) => sum + usage.total, 0),
)

const tableRows = computed(() =>
  keys.value.map((key) => ({
    id: String(key.id),
    name: key.name,
    key: key.key,
    group: key.group?.name || '-',
    status: key.status,
    usage: '-',
    updated: new Date(key.updated_at).toLocaleString('zh-CN'),
    raw: key,
  })),
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

const getStatusTone = (status: string): 'success' | 'warning' | 'neutral' => {
  if (status === 'active') return 'success'
  if (status === 'expired' || status === 'quota_exhausted') return 'warning'
  return 'neutral'
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
    alert('创建失败: ' + (error as Error).message)
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
    alert('更新失败: ' + (error as Error).message)
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
    alert('操作失败: ' + (error as Error).message)
  }
}

const confirmDelete = async (key: ApiKey) => {
  if (!confirm(`确定要删除密钥 "${key.name}" 吗？此操作不可恢复。`)) return

  try {
    await keysAPI.delete(key.id)
    await loadKeys()
  } catch (error) {
    console.error('删除密钥失败:', error)
    alert('删除失败: ' + (error as Error).message)
  }
}

onMounted(() => {
  loadKeys()
  loadGroups()
})
</script>
