<template>
  <div class="space-y-6">
    <!-- Payment System Settings -->
    <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
      <div class="border-b border-slate-700/50 px-6 py-4">
        <h2 class="text-lg font-semibold text-white">支付系统设置</h2>
        <p class="mt-1 text-sm text-slate-400">配置支付网关、金额限制和取消速率限制</p>
      </div>
      <div class="p-6 space-y-4">
        <!-- Master Toggle -->
        <div class="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/30 p-4">
          <div>
            <p class="text-sm font-medium text-white">启用支付</p>
            <p class="text-xs text-slate-400 mt-0.5">开启或关闭整个支付系统</p>
          </div>
          <button
            type="button"
            @click="toggle('payment_enabled')"
            class="toggle-switch"
            :class="form.payment_enabled ? 'bg-gold-500' : 'bg-slate-700'"
          >
            <span class="toggle-knob" :class="form.payment_enabled ? 'translate-x-6' : 'translate-x-1'" />
          </button>
        </div>

        <template v-if="form.payment_enabled">
          <!-- Basic Payment Config -->
          <div class="border-t border-slate-700/50 pt-4 mt-2">
            <h3 class="text-sm font-semibold text-slate-300 mb-3">基本配置</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="mb-1.5 block text-sm font-medium text-slate-300">产品名称前缀</label>
                <input v-model="form.payment_product_name_prefix" type="text" class="form-input" placeholder="例如：MyPlatform - " />
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-slate-300">产品名称后缀</label>
                <input v-model="form.payment_product_name_suffix" type="text" class="form-input" placeholder="例如： 充值套餐" />
              </div>
            </div>
            <!-- Product Name Preview -->
            <div class="rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-3 mb-4">
              <span class="text-xs text-slate-500">预览：</span>
              <span class="text-sm text-gold-400 font-medium">{{ form.payment_product_name_prefix || '' }}充值{{ form.payment_product_name_suffix || '' }}</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label class="mb-1.5 block text-sm font-medium text-slate-300">最低金额</label>
                <input v-model.number="form.payment_min_amount" type="number" min="0" step="0.01" class="form-input" />
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-slate-300">最高金额</label>
                <input v-model.number="form.payment_max_amount" type="number" min="0" step="0.01" class="form-input" />
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-slate-300">每日限额</label>
                <input v-model.number="form.payment_daily_limit" type="number" min="0" step="0.01" class="form-input" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="mb-1.5 block text-sm font-medium text-slate-300">余额充值倍率</label>
                <input v-model.number="form.payment_balance_recharge_multiplier" type="number" min="0" step="0.01" class="form-input" />
                <p class="mt-1 text-xs text-slate-500">1 USD = X 余额</p>
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-slate-300">充值手续费率</label>
                <input v-model.number="form.payment_recharge_fee_rate" type="number" min="0" max="100" step="0.01" class="form-input" />
                <p class="mt-1 text-xs text-slate-500">0-100 (%)</p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="mb-1.5 block text-sm font-medium text-slate-300">订单超时（分钟）</label>
                <input v-model.number="form.payment_order_timeout_minutes" type="number" min="1" class="form-input" />
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-slate-300">最大待处理订单</label>
                <input v-model.number="form.payment_max_pending_orders" type="number" min="1" class="form-input" />
              </div>
            </div>

            <div class="mb-4">
              <label class="mb-1.5 block text-sm font-medium text-slate-300">负载均衡策略</label>
              <select v-model="form.payment_load_balance_strategy" class="form-input">
                <option value="round-robin">轮询 (round-robin)</option>
                <option value="least-amount">最少金额 (least-amount)</option>
              </select>
            </div>

            <div class="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/30 p-4">
              <div>
                <p class="text-sm font-medium text-white">禁用余额充值</p>
                <p class="text-xs text-slate-400 mt-0.5">禁止用户通过支付系统充值余额</p>
              </div>
              <button
                type="button"
                @click="toggle('payment_balance_disabled')"
                class="toggle-switch"
                :class="form.payment_balance_disabled ? 'bg-gold-500' : 'bg-slate-700'"
              >
                <span class="toggle-knob" :class="form.payment_balance_disabled ? 'translate-x-6' : 'translate-x-1'" />
              </button>
            </div>
          </div>

          <!-- Enabled Payment Types -->
          <div class="border-t border-slate-700/50 pt-4">
            <h3 class="text-sm font-semibold text-slate-300 mb-3">启用的支付方式</h3>
            <div class="flex flex-wrap gap-3">
              <button
                v-for="pt in paymentTypes"
                :key="pt.value"
                type="button"
                @click="togglePaymentType(pt.value)"
                class="rounded-lg border px-4 py-2 text-sm font-medium transition"
                :class="isPaymentTypeEnabled(pt.value)
                  ? 'border-gold-500/50 bg-gold-500/10 text-gold-400'
                  : 'border-slate-700/50 bg-slate-900/30 text-slate-400 hover:border-slate-600 hover:text-slate-300'"
              >
                {{ pt.label }}
              </button>
            </div>
          </div>

          <!-- Cancel Rate Limit -->
          <div class="border-t border-slate-700/50 pt-4">
            <div class="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/30 p-4 mb-4">
              <div>
                <p class="text-sm font-medium text-white">启用取消速率限制</p>
                <p class="text-xs text-slate-400 mt-0.5">限制用户取消订单的频率，防止滥用</p>
              </div>
              <button
                type="button"
                @click="toggle('payment_cancel_rate_limit_enabled')"
                class="toggle-switch"
                :class="form.payment_cancel_rate_limit_enabled ? 'bg-gold-500' : 'bg-slate-700'"
              >
                <span class="toggle-knob" :class="form.payment_cancel_rate_limit_enabled ? 'translate-x-6' : 'translate-x-1'" />
              </button>
            </div>

            <template v-if="form.payment_cancel_rate_limit_enabled">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-300">窗口模式</label>
                  <select v-model="form.payment_cancel_rate_limit_window_mode" class="form-input">
                    <option value="rolling">滚动 (rolling)</option>
                    <option value="fixed">固定 (fixed)</option>
                  </select>
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-300">最大次数</label>
                  <input v-model.number="form.payment_cancel_rate_limit_max" type="number" min="1" class="form-input" />
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-300">窗口大小</label>
                  <input v-model.number="form.payment_cancel_rate_limit_window" type="number" min="1" class="form-input" />
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-300">单位</label>
                  <select v-model="form.payment_cancel_rate_limit_unit" class="form-input">
                    <option value="minute">分钟</option>
                    <option value="hour">小时</option>
                    <option value="day">天</option>
                  </select>
                </div>
              </div>
            </template>
          </div>

          <!-- Help Content -->
          <div class="border-t border-slate-700/50 pt-4">
            <h3 class="text-sm font-semibold text-slate-300 mb-3">帮助内容</h3>
            <div class="space-y-4">
              <div>
                <label class="mb-1.5 block text-sm font-medium text-slate-300">帮助图片 URL</label>
                <input v-model="form.payment_help_image_url" type="text" class="form-input" placeholder="https://example.com/help.png" />
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-slate-300">帮助文本</label>
                <textarea v-model="form.payment_help_text" rows="4" class="form-input" placeholder="输入支付帮助文本..."></textarea>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Provider Management -->
    <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
      <div class="border-b border-slate-700/50 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-white">支付提供者管理</h2>
          <p class="mt-1 text-sm text-slate-400">管理支付提供者实例的配置和状态</p>
        </div>
        <button
          type="button"
          @click="showProviderForm = true"
          class="rounded-lg border border-dashed border-slate-600 px-3 py-1.5 text-xs text-slate-400 hover:border-gold-500 hover:text-gold-400 transition"
        >
          + 创建提供者
        </button>
      </div>
      <div class="p-6 space-y-4">
        <!-- Loading -->
        <div v-if="providersLoading" class="text-center text-sm text-slate-500 py-8">
          加载中...
        </div>

        <!-- Empty -->
        <div v-else-if="providers.length === 0" class="text-center text-sm text-slate-500 py-8">
          暂无支付提供者，点击上方按钮创建
        </div>

        <!-- Provider List -->
        <div
          v-for="provider in providers"
          :key="provider.id"
          class="rounded-lg border border-slate-700/50 bg-slate-900/30 p-4"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <span class="text-sm font-medium text-white">{{ provider.name }}</span>
                <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="provider.enabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700/50 text-slate-500'">
                  {{ provider.enabled ? '启用' : '禁用' }}
                </span>
                <span class="text-xs text-slate-500">{{ provider.provider_key }}</span>
              </div>
              <div class="flex flex-wrap gap-1.5 mb-2">
                <span
                  v-for="t in provider.supported_types"
                  :key="t"
                  class="rounded-md bg-slate-700/50 px-2 py-0.5 text-xs text-slate-400"
                >
                  {{ t }}
                </span>
              </div>
              <div class="text-xs text-slate-500">
                支付模式: {{ provider.payment_mode || '-' }} | 排序: {{ provider.sort_order }}
              </div>
            </div>
            <div class="flex items-center gap-2 ml-4">
              <button
                type="button"
                @click="toggleProvider(provider)"
                class="toggle-switch"
                :class="provider.enabled ? 'bg-gold-500' : 'bg-slate-700'"
              >
                <span class="toggle-knob" :class="provider.enabled ? 'translate-x-6' : 'translate-x-1'" />
              </button>
              <button
                type="button"
                @click="editProvider(provider)"
                class="rounded-lg p-1.5 text-slate-500 hover:text-gold-400 hover:bg-gold-500/10 transition"
                title="编辑"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </button>
              <button
                type="button"
                @click="deleteProvider(provider)"
                class="rounded-lg p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                title="删除"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Inline Provider Form -->
        <div v-if="showProviderForm" class="border-t border-slate-700/50 pt-4">
          <h3 class="text-sm font-semibold text-slate-300 mb-3">
            {{ editingProvider ? '编辑提供者' : '创建提供者' }}
          </h3>
          <div class="space-y-3">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label class="mb-1 block text-xs text-slate-500">名称</label>
                <input v-model="providerForm.name" type="text" class="form-input" placeholder="提供者名称" />
              </div>
              <div>
                <label class="mb-1 block text-xs text-slate-500">Provider Key</label>
                <input v-model="providerForm.provider_key" type="text" class="form-input" placeholder="例如：stripe, epay" />
              </div>
            </div>
            <div>
              <label class="mb-1 block text-xs text-slate-500">配置 (JSON)</label>
              <textarea v-model="providerForm.configText" rows="6" class="form-input font-mono text-xs" placeholder='{"api_key": "...", "webhook_secret": "..."}'></textarea>
              <p v-if="providerForm.configError" class="mt-1 text-xs text-red-400">{{ providerForm.configError }}</p>
            </div>
            <div class="flex gap-2">
              <button
                type="button"
                @click="saveProvider"
                :disabled="providerSaving"
                class="rounded-lg bg-gold-500/20 border border-gold-500/50 px-4 py-1.5 text-sm text-gold-400 hover:bg-gold-500/30 transition disabled:opacity-50"
              >
                {{ providerSaving ? '保存中...' : '保存' }}
              </button>
              <button
                type="button"
                @click="cancelProviderForm"
                class="rounded-lg border border-slate-700/50 px-4 py-1.5 text-sm text-slate-400 hover:text-slate-300 transition"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import type { SystemSettings } from '@/types'
import type { ProviderInstance } from '@/types/payment'
import { adminAPI } from '@/api/admin'
import { apiClient } from '@/api/client'
import { showSuccess, showError, confirm } from '@/utils/toast'

const props = defineProps<{
  form: SystemSettings & Record<string, any>
}>()

defineEmits<{
  'update:form': [partial: Partial<SystemSettings & Record<string, any>>]
}>()

const form = computed(() => props.form)

function toggle(key: string) {
  ;(form.value as any)[key] = !(form.value as any)[key]
}

// ---- Payment Types ----
const paymentTypes = [
  { label: '易支付', value: 'easypay' },
  { label: '支付宝', value: 'alipay' },
  { label: '微信支付', value: 'wxpay' },
  { label: 'Stripe', value: 'stripe' },
]

const enabledTypes = computed(() => {
  return (form.value.payment_enabled_types || []) as string[]
})

function isPaymentTypeEnabled(type: string): boolean {
  return enabledTypes.value.includes(type)
}

function togglePaymentType(type: string) {
  const arr = [...enabledTypes.value]
  const idx = arr.indexOf(type)
  if (idx >= 0) {
    arr.splice(idx, 1)
  } else {
    arr.push(type)
  }
  form.value.payment_enabled_types = arr
}

// ---- Provider Management ----
const providers = ref<ProviderInstance[]>([])
const providersLoading = ref(false)

const showProviderForm = ref(false)
const editingProvider = ref<ProviderInstance | null>(null)
const providerSaving = ref(false)
const providerForm = reactive({
  name: '',
  provider_key: '',
  configText: '{}',
  configError: '',
})

async function loadProviders() {
  providersLoading.value = true
  try {
    const res = await adminAPI.payment.getProviders()
    providers.value = res.data
  } catch (e: any) {
    // Silently handle – providers are non-critical
    providers.value = []
  } finally {
    providersLoading.value = false
  }
}

function editProvider(provider: ProviderInstance) {
  editingProvider.value = provider
  providerForm.name = provider.name
  providerForm.provider_key = provider.provider_key
  providerForm.configText = JSON.stringify(provider.config || {}, null, 2)
  providerForm.configError = ''
  showProviderForm.value = true
}

function cancelProviderForm() {
  showProviderForm.value = false
  editingProvider.value = null
  providerForm.name = ''
  providerForm.provider_key = ''
  providerForm.configText = '{}'
  providerForm.configError = ''
}

async function saveProvider() {
  if (!providerForm.name.trim()) {
    providerForm.configError = '名称不能为空'
    return
  }
  if (!providerForm.provider_key.trim()) {
    providerForm.configError = 'Provider Key 不能为空'
    return
  }

  let config: Record<string, string> = {}
  try {
    config = JSON.parse(providerForm.configText)
  } catch {
    providerForm.configError = '配置 JSON 格式无效'
    return
  }
  providerForm.configError = ''

  providerSaving.value = true
  try {
    const data = {
      name: providerForm.name.trim(),
      provider_key: providerForm.provider_key.trim(),
      config,
    }

    if (editingProvider.value) {
      await apiClient.put(`/admin/payment/providers/${editingProvider.value.id}`, data)
      showSuccess('提供者已更新')
    } else {
      await apiClient.post('/admin/payment/providers', data)
      showSuccess('提供者已创建')
    }

    cancelProviderForm()
    await loadProviders()
  } catch (e: any) {
    showError(e?.message || '保存提供者失败')
  } finally {
    providerSaving.value = false
  }
}

async function toggleProvider(provider: ProviderInstance) {
  try {
    await apiClient.put(`/admin/payment/providers/${provider.id}`, {
      enabled: !provider.enabled,
    })
    provider.enabled = !provider.enabled
    showSuccess(provider.enabled ? '提供者已启用' : '提供者已禁用')
  } catch (e: any) {
    showError(e?.message || '切换提供者状态失败')
  }
}

async function deleteProvider(provider: ProviderInstance) {
  const confirmed = await confirm({
    type: 'danger',
    title: '删除提供者',
    message: `确定要删除提供者 "${provider.name}" 吗？此操作不可撤销。`,
    confirmText: '删除',
    cancelText: '取消',
  })
  if (!confirmed) return

  try {
    await apiClient.delete(`/admin/payment/providers/${provider.id}`)
    showSuccess('提供者已删除')
    await loadProviders()
  } catch (e: any) {
    showError(e?.message || '删除提供者失败')
  }
}

onMounted(() => {
  loadProviders()
})
</script>

<style scoped>
.form-input {
  @apply w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2 text-white backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20 placeholder:text-slate-600;
}
textarea.form-input {
  @apply resize-y;
}
select.form-input {
  @apply appearance-none cursor-pointer;
}
.toggle-switch {
  @apply relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200;
}
.toggle-knob {
  @apply inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200;
}
</style>
