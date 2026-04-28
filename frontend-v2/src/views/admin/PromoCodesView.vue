<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
    <!-- 页面标题 -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-white">🎫 促销码管理</h1>
          <p class="mt-2 text-sm text-slate-400">创建和管理促销码</p>
        </div>
        <div class="flex gap-3">
          <button
            @click="loadPromoCodes"
            :disabled="loading"
            class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800 disabled:opacity-50"
          >
            <span v-if="loading">🔄 加载中...</span>
            <span v-else>🔄 刷新</span>
          </button>
          <button
            @click="openCreateDialog"
            class="rounded-lg border border-gold-500/50 bg-gradient-to-r from-gold-500/20 to-gold-600/20 px-4 py-2 text-sm font-medium text-gold-400 backdrop-blur-sm transition hover:border-gold-400 hover:from-gold-500/30 hover:to-gold-600/30"
          >
            ➕ 创建促销码
          </button>
        </div>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="mb-6 rounded-xl border border-slate-700/50 bg-slate-800/40 p-4 backdrop-blur-sm">
      <div class="flex flex-wrap items-center gap-3">
        <select
          v-model="filters.status"
          @change="applyFilters"
          class="rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-2 text-sm text-white backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
        >
          <option value="">全部状态</option>
          <option value="active">活跃</option>
          <option value="disabled">禁用</option>
        </select>
      </div>
    </div>

    <!-- 促销码列表 -->
    <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm overflow-hidden">
      <!-- 加载状态 -->
      <div v-if="loading && promoCodes.length === 0" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-gold-500"></div>
          <p class="text-sm text-slate-400">加载中...</p>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="promoCodes.length === 0" class="flex flex-col items-center justify-center py-20">
        <div class="mb-4 text-6xl">🎫</div>
        <p class="text-lg font-medium text-slate-300">暂无促销码</p>
        <p class="mt-2 text-sm text-slate-500">点击"创建促销码"按钮添加第一个促销码</p>
      </div>

      <!-- 促销码表格 -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="border-b border-slate-700/50 bg-slate-900/50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">代码</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">奖励金额</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">使用情况</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">状态</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">过期时间</th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">备注</th>
              <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-700/30">
            <tr
              v-for="promo in promoCodes"
              :key="promo.id"
              class="transition hover:bg-slate-700/20"
            >
              <!-- 代码 -->
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <code class="rounded bg-slate-900/50 px-2 py-1 text-sm font-mono text-gold-400">{{ promo.code }}</code>
                  <button
                    @click="copyCode(promo.code)"
                    class="text-slate-400 hover:text-gold-400 transition"
                    title="复制代码"
                  >
                    📋
                  </button>
                </div>
              </td>

              <!-- 奖励金额 -->
              <td class="px-4 py-3">
                <span class="text-sm font-semibold text-emerald-400">¥{{ promo.bonus_amount.toFixed(2) }}</span>
              </td>

              <!-- 使用情况 -->
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <span class="text-sm text-white">{{ promo.used_count }} / {{ promo.max_uses }}</span>
                  <div class="h-2 w-24 overflow-hidden rounded-full bg-slate-700/50">
                    <div
                      class="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-600"
                      :style="{ width: `${(promo.used_count / promo.max_uses) * 100}%` }"
                    ></div>
                  </div>
                </div>
              </td>

              <!-- 状态 -->
              <td class="px-4 py-3">
                <span
                  :class="{
                    'bg-green-500/20 text-green-400 border-green-500/50': promo.status === 'active',
                    'bg-slate-500/20 text-slate-400 border-slate-500/50': promo.status === 'disabled'
                  }"
                  class="rounded-full border px-2 py-0.5 text-xs font-medium"
                >
                  {{ promo.status === 'active' ? '✓ 活跃' : '✗ 禁用' }}
                </span>
              </td>

              <!-- 过期时间 -->
              <td class="px-4 py-3 text-sm text-slate-300">
                {{ promo.expires_at ? formatDate(promo.expires_at) : '永久' }}
              </td>

              <!-- 备注 -->
              <td class="px-4 py-3">
                <span class="text-sm text-slate-400 line-clamp-1" :title="promo.notes || ''">
                  {{ promo.notes || '-' }}
                </span>
              </td>

              <!-- 操作 -->
              <td class="px-4 py-3">
                <div class="flex justify-end gap-2">
                  <button
                    @click="toggleStatus(promo)"
                    class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800"
                  >
                    {{ promo.status === 'active' ? '禁用' : '启用' }}
                  </button>
                  <button
                    @click="openEditDialog(promo)"
                    class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800"
                  >
                    ✏️ 编辑
                  </button>
                  <button
                    @click="deletePromoCode(promo.id)"
                    class="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 backdrop-blur-sm transition hover:border-red-400 hover:bg-red-500/20"
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

    <!-- 创建/编辑对话框 -->
    <div
      v-if="showDialog"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      @click.self="closeDialog"
    >
      <div class="w-full max-w-lg rounded-xl border border-slate-700/50 bg-slate-900 p-6 shadow-2xl">
        <h2 class="mb-6 text-xl font-bold text-white">
          {{ editingPromoCode ? '✏️ 编辑促销码' : '➕ 创建促销码' }}
        </h2>

        <div class="space-y-4">
          <!-- 代码 -->
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">促销码</label>
            <input
              v-model="form.code"
              type="text"
              placeholder="输入促销码（如：WELCOME2024）"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 font-mono text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            />
          </div>

          <!-- 奖励金额 -->
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">奖励金额（¥）</label>
            <input
              v-model.number="form.bonus_amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            />
          </div>

          <!-- 最大使用次数 -->
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">最大使用次数</label>
            <input
              v-model.number="form.max_uses"
              type="number"
              min="1"
              placeholder="100"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            />
          </div>

          <!-- 状态 -->
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">状态</label>
            <select
              v-model="form.status"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-white backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            >
              <option value="active">活跃</option>
              <option value="disabled">禁用</option>
            </select>
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
              rows="3"
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
            @click="savePromoCode"
            :disabled="saving"
            class="rounded-lg border border-gold-500/50 bg-gradient-to-r from-gold-500/20 to-gold-600/20 px-4 py-2 text-sm font-medium text-gold-400 backdrop-blur-sm transition hover:border-gold-400 hover:from-gold-500/30 hover:to-gold-600/30 disabled:opacity-50"
          >
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminAPI } from '@/api/admin'
import type { PromoCode } from '@/types'
import { showSuccess, showError, confirm } from '@/utils/toast'
import DateTimePicker from '@/components/ui/DateTimePicker.vue'

const loading = ref(false)
const saving = ref(false)
const promoCodes = ref<PromoCode[]>([])
const filters = ref({
  status: ''
})

const showDialog = ref(false)
const editingPromoCode = ref<PromoCode | null>(null)
const form = ref({
  code: '',
  bonus_amount: 0,
  max_uses: 100,
  status: 'active' as 'active' | 'disabled',
  expires_at: '',
  notes: ''
})

onMounted(() => {
  loadPromoCodes()
})

async function loadPromoCodes() {
  loading.value = true
  try {
    const response = await adminAPI.promo.list(1, 100, filters.value)
    promoCodes.value = response.data
  } catch (error: any) {
    showError({ message: error.response?.data?.error || '加载促销码失败' })
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  loadPromoCodes()
}

function openCreateDialog() {
  editingPromoCode.value = null
  form.value = {
    code: '',
    bonus_amount: 0,
    max_uses: 100,
    status: 'active',
    expires_at: '',
    notes: ''
  }
  showDialog.value = true
}

function openEditDialog(promo: PromoCode) {
  editingPromoCode.value = promo
  form.value = {
    code: promo.code,
    bonus_amount: promo.bonus_amount,
    max_uses: promo.max_uses,
    status: promo.status,
    expires_at: promo.expires_at ? promo.expires_at.slice(0, 16) : '',
    notes: promo.notes || ''
  }
  showDialog.value = true
}

function closeDialog() {
  showDialog.value = false
  editingPromoCode.value = null
}

async function savePromoCode() {
  if (!form.value.code || form.value.bonus_amount <= 0 || form.value.max_uses <= 0) {
    showError({ message: '请填写完整信息' })
    return
  }

  saving.value = true
  try {
    const data = {
      code: form.value.code,
      bonus_amount: form.value.bonus_amount,
      max_uses: form.value.max_uses,
      status: form.value.status,
      expires_at: form.value.expires_at || null,
      notes: form.value.notes || null
    }

    if (editingPromoCode.value) {
      await adminAPI.promo.update(editingPromoCode.value.id, data)
      showSuccess({ message: '促销码更新成功' })
    } else {
      await adminAPI.promo.create(data)
      showSuccess({ message: '促销码创建成功' })
    }

    closeDialog()
    loadPromoCodes()
  } catch (error: any) {
    showError({ message: error.response?.data?.error || '保存失败' })
  } finally {
    saving.value = false
  }
}

async function toggleStatus(promo: PromoCode) {
  try {
    const newStatus = promo.status === 'active' ? 'disabled' : 'active'
    await adminAPI.promo.update(promo.id, { status: newStatus })
    showSuccess({ message: `促销码已${newStatus === 'active' ? '启用' : '禁用'}` })
    loadPromoCodes()
  } catch (error: any) {
    showError({ message: error.response?.data?.error || '操作失败' })
  }
}

async function deletePromoCode(id: number) {
  const confirmed = await confirm({
    title: '确认删除',
    message: '确定要删除这个促销码吗？此操作不可恢复。'
  })

  if (!confirmed) return

  try {
    await adminAPI.promo.delete(id)
    showSuccess({ message: '促销码删除成功' })
    loadPromoCodes()
  } catch (error: any) {
    showError({ message: error.response?.data?.error || '删除失败' })
  }
}

function copyCode(code: string) {
  navigator.clipboard.writeText(code)
  showSuccess({ message: '促销码已复制到剪贴板' })
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('zh-CN')
}
</script>
