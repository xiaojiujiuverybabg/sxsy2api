<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
    <!-- 页面标题 -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-white">🎁 兑换码管理</h1>
          <p class="mt-2 text-sm text-slate-400">生成和管理兑换码</p>
        </div>
        <div class="flex gap-3">
          <button
            @click="loadRedeemCodes"
            :disabled="loading"
            class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800 disabled:opacity-50"
          >
            <span v-if="loading">🔄 加载中...</span>
            <span v-else>🔄 刷新</span>
          </button>
          <button
            @click="openGenerateDialog"
            class="rounded-lg border border-gold-500/50 bg-gradient-to-r from-gold-500/20 to-gold-600/20 px-4 py-2 text-sm font-medium text-gold-400 backdrop-blur-sm transition hover:border-gold-400 hover:from-gold-500/30 hover:to-gold-600/30"
          >
            ➕ 生成兑换码
          </button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div v-if="stats" class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
      <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 p-5 backdrop-blur-sm">
        <div class="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">📦 总数</div>
        <div class="text-3xl font-bold text-white">{{ stats.total || 0 }}</div>
      </div>
      <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 p-5 backdrop-blur-sm">
        <div class="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">✅ 已使用</div>
        <div class="text-3xl font-bold text-emerald-400">{{ stats.used || 0 }}</div>
      </div>
      <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 p-5 backdrop-blur-sm">
        <div class="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">⏳ 未使用</div>
        <div class="text-3xl font-bold text-gold-400">{{ stats.unused || 0 }}</div>
      </div>
      <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 p-5 backdrop-blur-sm">
        <div class="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">⏰ 已过期</div>
        <div class="text-3xl font-bold text-red-400">{{ stats.expired || 0 }}</div>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="mb-6 rounded-xl border border-slate-700/50 bg-slate-800/40 p-4 backdrop-blur-sm">
      <div class="flex flex-wrap items-center gap-3">
        <select
          v-model="filters.type"
          @change="applyFilters"
          class="rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-2 text-sm text-white backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
        >
          <option value="">全部类型</option>
          <option value="balance">余额</option>
          <option value="subscription">订阅</option>
        </select>

        <select
          v-model="filters.status"
          @change="applyFilters"
          class="rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-2 text-sm text-white backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
        >
          <option value="">全部状态</option>
          <option value="unused">未使用</option>
          <option value="used">已使用</option>
          <option value="expired">已过期</option>
        </select>

        <input
          v-model="filters.search"
          type="text"
          placeholder="搜索兑换码..."
          class="flex-1 min-w-[200px] rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
          @input="handleSearch"
        />
      </div>
    </div>

    <!-- 兑换码列表 -->
    <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm overflow-hidden">
      <!-- 加载状态 -->
      <div v-if="loading && redeemCodes.length === 0" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-gold-500"></div>
          <p class="text-sm text-slate-400">加载中...</p>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="redeemCodes.length === 0" class="flex flex-col items-center justify-center py-20">
        <div class="mb-4 text-6xl">🎁</div>
        <p class="text-lg font-medium text-slate-300">暂无兑换码</p>
        <p class="mt-2 text-sm text-slate-500">点击"生成兑换码"按钮创建兑换码</p>
      </div>

      <!-- 兑换码表格 -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="border-b border-slate-700/50 bg-slate-900/50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">兑换码</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">类型</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">价值</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">状态</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">使用者</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">使用时间</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">过期时间</th>
              <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-700/30">
            <tr
              v-for="code in redeemCodes"
              :key="code.id"
              class="transition hover:bg-slate-700/20"
            >
              <!-- 兑换码 -->
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <code class="rounded bg-slate-900/50 px-2 py-1 text-sm font-mono text-gold-400">{{ code.code }}</code>
                  <button
                    @click="copyCode(code.code)"
                    class="text-slate-400 hover:text-gold-400 transition"
                    title="复制代码"
                  >
                    📋
                  </button>
                </div>
              </td>

              <!-- 类型 -->
              <td class="px-4 py-3">
                <span
                  :class="{
                    'bg-blue-500/20 text-blue-400 border-blue-500/50': code.type === 'balance',
                    'bg-purple-500/20 text-purple-400 border-purple-500/50': code.type === 'subscription'
                  }"
                  class="rounded-full border px-2 py-0.5 text-xs font-medium"
                >
                  {{ code.type === 'balance' ? '💰 余额' : '📅 订阅' }}
                </span>
              </td>

              <!-- 价值 -->
              <td class="px-4 py-3">
                <span class="text-sm font-semibold text-emerald-400">
                  {{ code.type === 'balance' ? `¥${code.value.toFixed(2)}` : `${code.value}天` }}
                </span>
              </td>

              <!-- 状态 -->
              <td class="px-4 py-3">
                <span
                  :class="{
                    'bg-green-500/20 text-green-400 border-green-500/50': code.status === 'unused',
                    'bg-slate-500/20 text-slate-400 border-slate-500/50': code.status === 'used',
                    'bg-red-500/20 text-red-400 border-red-500/50': code.status === 'expired'
                  }"
                  class="rounded-full border px-2 py-0.5 text-xs font-medium"
                >
                  {{ statusText(code.status) }}
                </span>
              </td>

              <!-- 使用者 -->
              <td class="px-4 py-3 text-sm text-slate-300">
                {{ code.used_by ? `用户 #${code.used_by}` : '-' }}
              </td>

              <!-- 使用时间 -->
              <td class="px-4 py-3 text-sm text-slate-300">
                {{ code.used_at ? formatDate(code.used_at) : '-' }}
              </td>

              <!-- 过期时间 -->
              <td class="px-4 py-3 text-sm text-slate-300">
                {{ code.expires_at ? formatDate(code.expires_at) : '永久' }}
              </td>

              <!-- 操作 -->
              <td class="px-4 py-3">
                <div class="flex justify-end gap-2">
                  <button
                    @click="deleteRedeemCode(code.id)"
                    :disabled="code.status === 'used'"
                    class="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 backdrop-blur-sm transition hover:border-red-400 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    🗑️ 删除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 生成对话框 -->
    <div
      v-if="showDialog"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      @click.self="closeDialog"
    >
      <div class="w-full max-w-lg rounded-xl border border-slate-700/50 bg-slate-900 p-6 shadow-2xl">
        <h2 class="mb-6 text-xl font-bold text-white">➕ 生成兑换码</h2>

        <div class="space-y-4">
          <!-- 类型 -->
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">类型</label>
            <select
              v-model="form.type"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-white backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            >
              <option value="balance">余额</option>
              <option value="subscription">订阅</option>
            </select>
          </div>

          <!-- 价值 -->
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">
              {{ form.type === 'balance' ? '余额金额（¥）' : '订阅天数' }}
            </label>
            <input
              v-model.number="form.value"
              type="number"
              :step="form.type === 'balance' ? '0.01' : '1'"
              min="0"
              :placeholder="form.type === 'balance' ? '0.00' : '30'"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            />
          </div>

          <!-- 生成数量 -->
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">生成数量</label>
            <input
              v-model.number="form.count"
              type="number"
              min="1"
              max="1000"
              placeholder="10"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            />
          </div>

          <!-- 过期时间 -->
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">过期时间（可选）</label>
            <DateTimePicker v-model="form.expires_at" placeholder="留空表示永不过期" />
          </div>

          <!-- 备注 -->
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">备注（可选）</label>
            <textarea
              v-model="form.notes"
              rows="2"
              placeholder="输入备注信息"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            ></textarea>
          </div>
        </div>

        <!-- 对话框按钮 -->
        <div class="mt-6 flex justify-end gap-3">
          <button
            @click="closeDialog"
            class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800"
          >
            取消
          </button>
          <button
            @click="generateRedeemCodes"
            :disabled="saving"
            class="rounded-lg border border-gold-500/50 bg-gradient-to-r from-gold-500/20 to-gold-600/20 px-4 py-2 text-sm font-medium text-gold-400 backdrop-blur-sm transition hover:border-gold-400 hover:from-gold-500/30 hover:to-gold-600/30 disabled:opacity-50"
          >
            {{ saving ? '生成中...' : '生成' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminAPI } from '@/api/admin'
import type { RedeemCode, RedeemCodeType } from '@/types'
import { showSuccess, showError, confirm } from '@/utils/toast'
import DateTimePicker from '@/components/ui/DateTimePicker.vue'

const loading = ref(false)
const saving = ref(false)
const redeemCodes = ref<RedeemCode[]>([])
const stats = ref<Record<string, number> | null>(null)
const filters = ref({
  type: '' as RedeemCodeType | '',
  status: '',
  search: ''
})

const showDialog = ref(false)
const form = ref({
  type: 'balance' as RedeemCodeType,
  value: 0,
  count: 10,
  expires_at: '',
  notes: ''
})

let searchTimeout: NodeJS.Timeout | null = null

onMounted(() => {
  loadRedeemCodes()
  loadStats()
})

async function loadRedeemCodes() {
  loading.value = true
  try {
    const response = await adminAPI.redeem.list(1, 100, filters.value)
    redeemCodes.value = response.data
  } catch (error: any) {
    showError(error.response?.data?.error || '加载兑换码失败')
  } finally {
    loading.value = false
  }
}

async function loadStats() {
  try {
    stats.value = await adminAPI.redeem.getStats()
  } catch (error: any) {
    console.error('加载统计失败:', error)
  }
}

function applyFilters() {
  loadRedeemCodes()
}

function handleSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadRedeemCodes()
  }, 500)
}

function openGenerateDialog() {
  form.value = {
    type: 'balance',
    value: 0,
    count: 10,
    expires_at: '',
    notes: ''
  }
  showDialog.value = true
}

function closeDialog() {
  showDialog.value = false
}

async function generateRedeemCodes() {
  if (form.value.value <= 0 || form.value.count <= 0) {
    showError('请填写有效的价值和数量')
    return
  }

  saving.value = true
  try {
    const data = {
      type: form.value.type,
      value: form.value.value,
      count: form.value.count,
      expires_at: form.value.expires_at || undefined,
      notes: form.value.notes || undefined
    }

    await adminAPI.redeem.generate(data)
    showSuccess(`成功生成 ${form.value.count} 个兑换码`)

    closeDialog()
    loadRedeemCodes()
    loadStats()
  } catch (error: any) {
    showError(error.response?.data?.error || '生成失败')
  } finally {
    saving.value = false
  }
}

async function deleteRedeemCode(id: number) {
  const confirmed = await confirm({
    title: '确认删除',
    message: '确定要删除这个兑换码吗？此操作不可恢复。'
  })

  if (!confirmed) return

  try {
    await adminAPI.redeem.delete(id)
    showSuccess('兑换码删除成功')
    loadRedeemCodes()
    loadStats()
  } catch (error: any) {
    showError(error.response?.data?.error || '删除失败')
  }
}

function copyCode(code: string) {
  navigator.clipboard.writeText(code)
  showSuccess('兑换码已复制到剪贴板')
}

function statusText(status: string): string {
  const map: Record<string, string> = {
    unused: '✓ 未使用',
    used: '✓ 已使用',
    expired: '✗ 已过期',
    active: '✓ 活跃'
  }
  return map[status] || status
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('zh-CN')
}
</script>
