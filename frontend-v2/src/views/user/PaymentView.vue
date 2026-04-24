<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
    <!-- 页面标题 -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-white">充值中心</h1>
      <p class="mt-2 text-sm text-slate-400">选择套餐或充值余额，开始使用服务</p>
    </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="h-12 w-12 animate-spin rounded-full border-4 border-brand-500/20 border-t-brand-500"></div>
      </div>

      <template v-else>
        <!-- Tab 切换 -->
        <div v-if="!balanceDisabled" class="mb-6 flex gap-2 rounded-xl border border-slate-700/50 bg-slate-800/40 p-1.5 backdrop-blur-sm">
          <button
            @click="activeTab = 'recharge'"
            :class="[
              'flex-1 rounded-lg px-6 py-3 text-sm font-bold transition',
              activeTab === 'recharge'
                ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/30'
                : 'text-slate-400 hover:text-slate-300'
            ]"
          >
            💰 余额充值
          </button>
          <button
            @click="activeTab = 'subscription'"
            :class="[
              'flex-1 rounded-lg px-6 py-3 text-sm font-bold transition',
              activeTab === 'subscription'
                ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/30'
                : 'text-slate-400 hover:text-slate-300'
            ]"
          >
            🎁 订阅套餐
          </button>
        </div>

        <!-- 余额充值 Tab -->
        <div v-if="activeTab === 'recharge'" class="space-y-6">
          <!-- 账户信息 -->
          <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 p-6 backdrop-blur-sm">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-medium text-slate-500">充值账户</p>
                <p class="mt-1 text-lg font-bold text-white">{{ username }}</p>
              </div>
              <div class="text-right">
                <p class="text-xs font-medium text-slate-500">当前余额</p>
                <p class="mt-1 text-2xl font-bold text-emerald-400">${{ balance.toFixed(2) }}</p>
              </div>
            </div>
          </div>

          <!-- 充值金额 -->
          <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 p-6 backdrop-blur-sm">
            <h3 class="mb-4 text-sm font-bold text-white">充值金额</h3>
            <div class="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              <button
                v-for="amt in quickAmounts"
                :key="amt"
                @click="amount = amt"
                :class="[
                  'rounded-lg border px-4 py-3 text-sm font-bold transition',
                  amount === amt
                    ? 'border-brand-500 bg-brand-500/20 text-brand-400'
                    : 'border-slate-700/50 bg-slate-900/50 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                ]"
              >
                ¥{{ amt }}
              </button>
            </div>
            <input
              v-model.number="amount"
              type="number"
              :min="minAmount"
              :max="maxAmount"
              placeholder="输入自定义金额"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <p v-if="amountError" class="mt-2 text-xs text-amber-400">{{ amountError }}</p>
          </div>

          <!-- 支付方式 -->
          <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 p-6 backdrop-blur-sm">
            <h3 class="mb-4 text-sm font-bold text-white">支付方式</h3>
            <div class="grid gap-3 sm:grid-cols-2">
              <button
                v-for="method in availableMethods"
                :key="method.type"
                @click="selectedMethod = method.type"
                :disabled="!method.available"
                :class="[
                  'flex items-center gap-3 rounded-lg border p-4 text-left transition',
                  selectedMethod === method.type
                    ? 'border-brand-500 bg-brand-500/10'
                    : 'border-slate-700/50 bg-slate-900/30 hover:border-slate-600',
                  !method.available && 'opacity-50 cursor-not-allowed'
                ]"
              >
                <span class="text-2xl">{{ getMethodIcon(method.type) }}</span>
                <div class="flex-1">
                  <p class="font-bold text-white">{{ getMethodName(method.type) }}</p>
                  <p v-if="method.fee_rate > 0" class="text-xs text-slate-400">手续费 {{ method.fee_rate }}%</p>
                </div>
                <span v-if="selectedMethod === method.type" class="text-brand-400">✓</span>
              </button>
            </div>
          </div>

          <!-- 费用明细 -->
          <div v-if="validAmount > 0" class="rounded-xl border border-slate-700/50 bg-slate-800/40 p-6 backdrop-blur-sm">
            <h3 class="mb-4 text-sm font-bold text-white">费用明细</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-400">充值金额</span>
                <span class="text-white">¥{{ validAmount.toFixed(2) }}</span>
              </div>
              <div v-if="feeAmount > 0" class="flex justify-between">
                <span class="text-slate-400">手续费 ({{ feeRate }}%)</span>
                <span class="text-white">¥{{ feeAmount.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between border-t border-slate-700/50 pt-2 text-base font-bold">
                <span class="text-white">实付金额</span>
                <span class="text-brand-400">¥{{ totalAmount.toFixed(2) }}</span>
              </div>
              <div v-if="rechargeMultiplier !== 1" class="flex justify-between text-xs">
                <span class="text-slate-400">到账余额</span>
                <span class="text-emerald-400">${{ creditedAmount.toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <!-- 提交按钮 -->
          <button
            @click="handleRecharge"
            :disabled="!canSubmit || submitting"
            :class="[
              'w-full rounded-lg py-4 text-base font-bold text-white transition',
              canSubmit && !submitting
                ? 'bg-gradient-to-r from-brand-500 to-brand-600 shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50'
                : 'bg-slate-700 cursor-not-allowed opacity-50'
            ]"
          >
            <span v-if="submitting" class="flex items-center justify-center gap-2">
              <span class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              处理中...
            </span>
            <span v-else>立即充值 ¥{{ totalAmount.toFixed(2) }}</span>
          </button>
        </div>

        <!-- 订阅套餐 Tab -->
        <div v-else-if="activeTab === 'subscription'" class="space-y-6">
          <!-- 套餐列表 -->
          <div v-if="plans.length === 0" class="rounded-xl border border-slate-700/50 bg-slate-800/40 p-16 text-center backdrop-blur-sm">
            <p class="text-slate-400">暂无可用套餐</p>
          </div>
          <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="plan in plans"
              :key="plan.id"
              :class="[
                'group relative overflow-hidden rounded-xl border p-6 backdrop-blur-sm transition hover:scale-105',
                selectedPlan?.id === plan.id
                  ? 'border-brand-500 bg-brand-500/10'
                  : 'border-slate-700/50 bg-slate-800/40 hover:border-slate-600'
              ]"
            >
              <!-- 推荐标签 -->
              <div v-if="plan.original_price" class="absolute right-4 top-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-bold text-white">
                热门
              </div>

              <!-- 套餐名称 -->
              <h3 class="mb-2 text-xl font-bold text-white">{{ plan.name }}</h3>
              <p class="mb-4 text-xs text-slate-400">{{ plan.description }}</p>

              <!-- 价格 -->
              <div class="mb-4 flex items-baseline gap-2">
                <span v-if="plan.original_price" class="text-sm text-slate-500 line-through">¥{{ plan.original_price }}</span>
                <span class="text-3xl font-bold text-brand-400">¥{{ plan.price }}</span>
                <span class="text-sm text-slate-400">/ {{ getValidityText(plan) }}</span>
              </div>

              <!-- 套餐特性 -->
              <div class="mb-4 space-y-2">
                <div class="flex items-center gap-2 text-sm">
                  <span class="text-brand-400">⚡</span>
                  <span class="text-slate-300">倍率: ×{{ plan.rate_multiplier || 1 }}</span>
                </div>
                <div v-if="plan.daily_limit_usd" class="flex items-center gap-2 text-sm">
                  <span class="text-emerald-400">📊</span>
                  <span class="text-slate-300">日限额: ${{ plan.daily_limit_usd }}</span>
                </div>
                <div v-if="plan.monthly_limit_usd" class="flex items-center gap-2 text-sm">
                  <span class="text-blue-400">📈</span>
                  <span class="text-slate-300">月限额: ${{ plan.monthly_limit_usd }}</span>
                </div>
                <div v-if="!plan.daily_limit_usd && !plan.monthly_limit_usd" class="flex items-center gap-2 text-sm">
                  <span class="text-purple-400">♾️</span>
                  <span class="text-slate-300">无限额</span>
                </div>
              </div>

              <!-- 选择按钮 -->
              <button
                @click="selectPlan(plan)"
                :class="[
                  'w-full rounded-lg py-3 text-sm font-bold transition',
                  selectedPlan?.id === plan.id
                    ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/30'
                    : 'border border-slate-700/50 bg-slate-900/50 text-slate-300 hover:border-brand-500 hover:text-brand-400'
                ]"
              >
                {{ selectedPlan?.id === plan.id ? '已选择' : '选择套餐' }}
              </button>
            </div>
          </div>

          <!-- 订阅确认 -->
          <div v-if="selectedPlan" class="rounded-xl border border-brand-500/50 bg-brand-500/5 p-6 backdrop-blur-sm">
            <h3 class="mb-4 text-sm font-bold text-white">确认订阅</h3>

            <!-- 支付方式 -->
            <div class="mb-4">
              <p class="mb-3 text-xs font-medium text-slate-400">选择支付方式</p>
              <div class="grid gap-3 sm:grid-cols-2">
                <button
                  v-for="method in availableMethods"
                  :key="method.type"
                  @click="selectedMethod = method.type"
                  :disabled="!method.available"
                  :class="[
                    'flex items-center gap-3 rounded-lg border p-3 text-left transition',
                    selectedMethod === method.type
                      ? 'border-brand-500 bg-brand-500/10'
                      : 'border-slate-700/50 bg-slate-900/30 hover:border-slate-600',
                    !method.available && 'opacity-50 cursor-not-allowed'
                  ]"
                >
                  <span class="text-xl">{{ getMethodIcon(method.type) }}</span>
                  <span class="flex-1 text-sm font-bold text-white">{{ getMethodName(method.type) }}</span>
                  <span v-if="selectedMethod === method.type" class="text-brand-400">✓</span>
                </button>
              </div>
            </div>

            <!-- 费用明细 -->
            <div class="mb-4 space-y-2 rounded-lg border border-slate-700/50 bg-slate-900/50 p-4 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-400">套餐价格</span>
                <span class="text-white">¥{{ selectedPlan.price.toFixed(2) }}</span>
              </div>
              <div v-if="subFeeAmount > 0" class="flex justify-between">
                <span class="text-slate-400">手续费 ({{ feeRate }}%)</span>
                <span class="text-white">¥{{ subFeeAmount.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between border-t border-slate-700/50 pt-2 font-bold">
                <span class="text-white">实付金额</span>
                <span class="text-brand-400">¥{{ subTotalAmount.toFixed(2) }}</span>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="flex gap-3">
              <button
                @click="selectedPlan = null"
                class="flex-1 rounded-lg border border-slate-700/50 bg-slate-900/50 py-3 text-sm font-bold text-slate-300 transition hover:border-slate-600 hover:bg-slate-800"
              >
                取消
              </button>
              <button
                @click="handleSubscribe"
                :disabled="!canSubmitSubscription || submitting"
                :class="[
                  'flex-1 rounded-lg py-3 text-sm font-bold text-white transition',
                  canSubmitSubscription && !submitting
                    ? 'bg-gradient-to-r from-brand-500 to-brand-600 shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50'
                    : 'bg-slate-700 cursor-not-allowed opacity-50'
                ]"
              >
                <span v-if="submitting" class="flex items-center justify-center gap-2">
                  <span class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  处理中...
                </span>
                <span v-else>确认订阅</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 帮助信息 -->
        <div v-if="helpText || helpImageUrl" class="mt-6 rounded-xl border border-slate-700/50 bg-slate-800/40 p-6 backdrop-blur-sm">
          <div class="flex flex-col items-center gap-4">
            <img v-if="helpImageUrl" :src="helpImageUrl" alt="帮助" class="max-h-40 rounded-lg object-contain" />
            <p v-if="helpText" class="text-center text-sm text-slate-400">{{ helpText }}</p>
          </div>
        </div>
      </template>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { paymentAPI } from '@/api/payment'
import type { SubscriptionPlan, MethodLimit } from '@/types/payment'
import { showError } from '@/utils/toast'

// 状态
const loading = ref(true)
const submitting = ref(false)
const activeTab = ref<'recharge' | 'subscription'>('recharge')
const amount = ref<number | null>(null)
const selectedMethod = ref('')
const selectedPlan = ref<SubscriptionPlan | null>(null)

// 数据
const username = ref('')
const balance = ref(0)
const balanceDisabled = ref(false)
const rechargeMultiplier = ref(1)
const feeRate = ref(0)
const minAmount = ref(0)
const maxAmount = ref(0)
const methods = ref<Record<string, MethodLimit>>({})
const plans = ref<SubscriptionPlan[]>([])
const helpText = ref('')
const helpImageUrl = ref('')

// 快速金额选项
const quickAmounts = [10, 20, 50, 100, 200, 500, 1000, 2000]

// 计算属性
const validAmount = computed(() => amount.value || 0)

const availableMethods = computed(() => {
  return Object.entries(methods.value).map(([type, limit]) => ({
    type,
    fee_rate: limit.fee_rate || 0,
    available: limit.available && (activeTab.value === 'recharge'
      ? amountFitsMethod(validAmount.value, type)
      : amountFitsMethod(selectedPlan.value?.price || 0, type))
  }))
})

const amountError = computed(() => {
  if (validAmount.value <= 0) return ''
  if (minAmount.value > 0 && validAmount.value < minAmount.value) {
    return `最低充值金额为 ¥${minAmount.value}`
  }
  if (maxAmount.value > 0 && validAmount.value > maxAmount.value) {
    return `最高充值金额为 ¥${maxAmount.value}`
  }
  return ''
})

const feeAmount = computed(() => {
  if (feeRate.value <= 0 || validAmount.value <= 0) return 0
  return Math.ceil((validAmount.value * feeRate.value / 100) * 100) / 100
})

const totalAmount = computed(() => {
  if (feeRate.value <= 0) return validAmount.value
  return Math.round((validAmount.value + feeAmount.value) * 100) / 100
})

const creditedAmount = computed(() => {
  return Math.round(validAmount.value * rechargeMultiplier.value * 100) / 100
})

const canSubmit = computed(() => {
  return validAmount.value > 0 && !amountError.value && selectedMethod.value && !submitting.value
})

const subFeeAmount = computed(() => {
  const price = selectedPlan.value?.price || 0
  if (feeRate.value <= 0 || price <= 0) return 0
  return Math.ceil((price * feeRate.value / 100) * 100) / 100
})

const subTotalAmount = computed(() => {
  const price = selectedPlan.value?.price || 0
  if (feeRate.value <= 0) return price
  return Math.round((price + subFeeAmount.value) * 100) / 100
})

const canSubmitSubscription = computed(() => {
  return selectedPlan.value !== null && selectedMethod.value && !submitting.value
})

// 方法
function amountFitsMethod(amt: number, methodType: string): boolean {
  if (amt <= 0) return true
  const limit = methods.value[methodType]
  if (!limit) return false
  if (limit.single_min > 0 && amt < limit.single_min) return false
  if (limit.single_max > 0 && amt > limit.single_max) return false
  return true
}

function getMethodIcon(type: string): string {
  if (type.includes('alipay')) return '💳'
  if (type.includes('wxpay')) return '💚'
  if (type === 'stripe') return '💎'
  return '💰'
}

function getMethodName(type: string): string {
  if (type.includes('alipay')) return '支付宝'
  if (type.includes('wxpay')) return '微信支付'
  if (type === 'stripe') return 'Stripe'
  return type
}

function getValidityText(plan: SubscriptionPlan): string {
  if (plan.validity_unit === 'month') return '月'
  if (plan.validity_unit === 'year') return '年'
  return `${plan.validity_days}天`
}

function selectPlan(plan: SubscriptionPlan) {
  selectedPlan.value = plan
}

async function handleRecharge() {
  if (!canSubmit.value) return

  submitting.value = true
  try {
    const result = await paymentAPI.createOrder({
      amount: validAmount.value,
      payment_type: selectedMethod.value,
      order_type: 'balance'
    })

    // 跳转到支付页面
    if (result.data.pay_url) {
      window.location.href = result.data.pay_url
    }
  } catch (error) {
    console.error('创建订单失败:', error)
    showError('创建订单失败，请重试')
  } finally {
    submitting.value = false
  }
}

async function handleSubscribe() {
  if (!canSubmitSubscription.value || !selectedPlan.value) return

  submitting.value = true
  try {
    const result = await paymentAPI.createOrder({
      amount: selectedPlan.value.price,
      payment_type: selectedMethod.value,
      order_type: 'subscription',
      plan_id: selectedPlan.value.id
    })

    // 跳转到支付页面
    if (result.data.pay_url) {
      window.location.href = result.data.pay_url
    }
  } catch (error) {
    console.error('创建订单失败:', error)
    showError('创建订单失败，请重试')
  } finally {
    submitting.value = false
  }
}

// 初始化
onMounted(async () => {
  try {
    const response = await paymentAPI.getCheckoutInfo()
    const data = response.data

    methods.value = data.methods
    plans.value = data.plans.filter(p => p.for_sale).sort((a, b) => a.sort_order - b.sort_order)
    balanceDisabled.value = data.balance_disabled
    rechargeMultiplier.value = data.balance_recharge_multiplier || 1
    feeRate.value = data.recharge_fee_rate || 0
    minAmount.value = data.global_min
    maxAmount.value = data.global_max
    helpText.value = data.help_text
    helpImageUrl.value = data.help_image_url

    // 设置默认支付方式
    const methodKeys = Object.keys(methods.value)
    if (methodKeys.length > 0) {
      selectedMethod.value = methodKeys[0]
    }

    // 如果禁用余额充值，默认显示订阅
    if (balanceDisabled.value) {
      activeTab.value = 'subscription'
    }

    // 获取用户信息（假设从某处获取）
    username.value = 'User'
    balance.value = 0
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
})
</script>
