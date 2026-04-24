<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
    <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-white">费用管理</h1>
        <p class="mt-2 text-sm text-slate-400">管理你的订阅套餐和购买新套餐</p>
      </div>

      <!-- 主 Tab 切换 -->
      <div class="mb-6 flex gap-2 rounded-xl border border-slate-700/50 bg-slate-800/40 p-1.5 backdrop-blur-sm">
        <button
          @click="mainTab = 'my-subscriptions'"
          :class="[
            'flex-1 rounded-lg px-6 py-3 text-sm font-bold transition',
            mainTab === 'my-subscriptions'
              ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/30'
              : 'text-slate-400 hover:text-slate-300'
          ]"
        >
          我的订阅
        </button>
        <button
          @click="mainTab = 'purchase'"
          :class="[
            'flex-1 rounded-lg px-6 py-3 text-sm font-bold transition',
            mainTab === 'purchase'
              ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/30'
              : 'text-slate-400 hover:text-slate-300'
          ]"
        >
          购买套餐
        </button>
      </div>

      <!-- Tab 1: 我的订阅 -->
      <div v-if="mainTab === 'my-subscriptions'">
        <!-- 统计卡片 -->
        <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 p-5 backdrop-blur-sm">
            <div class="text-xs font-medium text-slate-500">活跃订阅</div>
            <div class="mt-2 text-3xl font-bold text-emerald-400">{{ activeCount }}</div>
          </div>
          <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 p-5 backdrop-blur-sm">
            <div class="text-xs font-medium text-slate-500">总订阅数</div>
            <div class="mt-2 text-3xl font-bold text-white">{{ subscriptions.length }}</div>
          </div>
          <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 p-5 backdrop-blur-sm">
            <div class="text-xs font-medium text-slate-500">即将过期</div>
            <div class="mt-2 text-3xl font-bold text-amber-400">{{ expiringCount }}</div>
          </div>
          <div class="group relative overflow-hidden rounded-xl border border-gold-500/30 bg-gradient-to-br from-gold-500/20 via-gold-600/10 to-amber-500/20 p-5 backdrop-blur-sm transition-all hover:border-gold-400/50 hover:shadow-lg hover:shadow-gold-500/20">
            <div class="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gold-400/10 blur-2xl"></div>
            <div class="relative">
              <div class="flex items-center gap-2 mb-3">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg">
                  <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="text-xs font-semibold uppercase tracking-wider text-gold-300">余额统计</div>
              </div>
              <div class="space-y-2">
                <div class="flex items-baseline justify-between">
                  <span class="text-xs text-gold-200/70">总金额</span>
                  <span class="text-lg font-bold text-white">${{ totalBalance.toFixed(2) }}</span>
                </div>
                <div class="flex items-baseline justify-between">
                  <span class="text-xs text-gold-200/70">已使用</span>
                  <span class="text-lg font-bold text-red-400">${{ usedBalance.toFixed(2) }}</span>
                </div>
                <div class="border-t border-gold-400/20 pt-2 flex items-baseline justify-between">
                  <span class="text-xs font-semibold text-gold-300">剩余</span>
                  <span class="text-2xl font-bold text-emerald-400">${{ currentBalance.toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loadingSubs" class="flex items-center justify-center py-20">
          <div class="h-12 w-12 animate-spin rounded-full border-4 border-brand-500/20 border-t-brand-500"></div>
        </div>

        <!-- 订阅列表 -->
        <div v-else-if="subscriptions.length > 0" class="grid gap-6 lg:grid-cols-2">
          <div
            v-for="sub in subscriptions"
            :key="sub.id"
            class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm"
          >
            <div class="border-b border-slate-700/50 p-5">
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="text-lg font-bold text-white">{{ sub.group?.name || `订阅 #${sub.group_id}` }}</h3>
                  <p v-if="sub.group?.description" class="mt-1 text-sm text-slate-400">{{ sub.group.description }}</p>
                </div>
                <span
                  class="rounded-full px-3 py-1 text-xs font-medium"
                  :class="sub.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 text-slate-400'"
                >
                  {{ sub.status === 'active' ? '活跃' : '已过期' }}
                </span>
              </div>
            </div>
            <div class="space-y-4 p-5">
              <div class="flex justify-between text-sm">
                <span class="text-slate-400">到期时间</span>
                <span v-if="sub.expires_at" class="text-slate-300">{{ formatDate(sub.expires_at) }}</span>
                <span v-else class="text-slate-300">永久有效</span>
              </div>
              <div v-if="sub.group?.daily_limit_usd" class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-slate-400">每日额度</span>
                  <span class="text-slate-400">${{ (sub.daily_usage_usd || 0).toFixed(2) }} / ${{ sub.group.daily_limit_usd.toFixed(2) }}</span>
                </div>
                <div class="h-2 overflow-hidden rounded-full bg-slate-700/50">
                  <div
                    class="h-full rounded-full bg-emerald-500 transition-all"
                    :style="{ width: getUsagePercent(sub.daily_usage_usd, sub.group.daily_limit_usd) }"
                  ></div>
                </div>
              </div>
              <button
                v-if="sub.status === 'active'"
                @click="renewSub(sub)"
                class="w-full rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-brand-500/20 transition hover:shadow-brand-500/40"
              >
                续订
              </button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="flex flex-col items-center justify-center rounded-xl border border-slate-700/50 bg-slate-800/40 py-20 backdrop-blur-sm">
          <div class="mb-4 text-6xl">📦</div>
          <h3 class="mb-2 text-xl font-bold text-white">暂无订阅</h3>
          <p class="mb-6 text-sm text-slate-400">购买订阅套餐以享受更多服务</p>
          <button
            @click="mainTab = 'purchase'"
            class="rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-500/30"
          >
            浏览套餐
          </button>
        </div>
      </div>

      <!-- Tab 2: 购买套餐 -->
      <div v-else-if="mainTab === 'purchase'">
        <!-- 加载状态 -->
        <div v-if="loadingPayment" class="flex items-center justify-center py-20">
          <div class="h-12 w-12 animate-spin rounded-full border-4 border-brand-500/20 border-t-brand-500"></div>
        </div>

        <template v-else>
          <!-- 子 Tab 切换 -->
          <div v-if="!balanceDisabled" class="mb-6 flex gap-2 rounded-xl border border-slate-700/50 bg-slate-800/40 p-1.5 backdrop-blur-sm">
            <button
              @click="purchaseTab = 'recharge'"
              :class="[
                'flex-1 rounded-lg px-6 py-3 text-sm font-bold transition',
                purchaseTab === 'recharge'
                  ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/30'
                  : 'text-slate-400 hover:text-slate-300'
              ]"
            >
              余额充值
            </button>
            <button
              @click="purchaseTab = 'subscription'"
              :class="[
                'flex-1 rounded-lg px-6 py-3 text-sm font-bold transition',
                purchaseTab === 'subscription'
                  ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/30'
                  : 'text-slate-400 hover:text-slate-300'
              ]"
            >
              订阅套餐
            </button>
          </div>

          <!-- 余额充值 -->
          <div v-if="purchaseTab === 'recharge'" class="space-y-6">
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
                      : 'border-slate-700/50 bg-slate-900/50 text-slate-300 hover:border-slate-600'
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
                class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

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
                <div class="flex justify-between border-t border-slate-700/50 pt-2 font-bold">
                  <span class="text-white">实付金额</span>
                  <span class="text-brand-400">¥{{ totalAmount.toFixed(2) }}</span>
                </div>
              </div>
            </div>

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
              <span v-if="submitting">处理中...</span>
              <span v-else>立即充值 ¥{{ totalAmount.toFixed(2) }}</span>
            </button>
          </div>

          <!-- 订阅套餐 -->
          <div v-else-if="purchaseTab === 'subscription'" class="space-y-6">
            <div v-if="plans.length === 0" class="rounded-xl border border-slate-700/50 bg-slate-800/40 p-16 text-center backdrop-blur-sm">
              <p class="text-slate-400">暂无可用套餐</p>
            </div>
            <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div
                v-for="plan in plans"
                :key="plan.id"
                :class="[
                  'relative overflow-hidden rounded-xl border p-6 backdrop-blur-sm transition hover:scale-105',
                  selectedPlan?.id === plan.id
                    ? 'border-brand-500 bg-brand-500/10'
                    : 'border-slate-700/50 bg-slate-800/40 hover:border-slate-600'
                ]"
              >
                <div v-if="plan.original_price" class="absolute right-4 top-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-bold text-white">
                  热门
                </div>
                <h3 class="mb-2 text-xl font-bold text-white">{{ plan.name }}</h3>
                <p class="mb-4 text-xs text-slate-400">{{ plan.description }}</p>
                <div class="mb-4 flex items-baseline gap-2">
                  <span v-if="plan.original_price" class="text-sm text-slate-500 line-through">¥{{ plan.original_price }}</span>
                  <span class="text-3xl font-bold text-brand-400">¥{{ plan.price }}</span>
                  <span class="text-sm text-slate-400">/ {{ getValidityText(plan) }}</span>
                </div>
                <div class="mb-4 space-y-2">
                  <div class="flex items-center gap-2 text-sm text-slate-300">
                    <span>倍率: ×{{ plan.rate_multiplier || 1 }}</span>
                  </div>
                  <div v-if="plan.daily_limit_usd" class="flex items-center gap-2 text-sm text-slate-300">
                    <span>日限额: ${{ plan.daily_limit_usd }}</span>
                  </div>
                  <div v-if="plan.monthly_limit_usd" class="flex items-center gap-2 text-sm text-slate-300">
                    <span>月限额: ${{ plan.monthly_limit_usd }}</span>
                  </div>
                  <div v-if="!plan.daily_limit_usd && !plan.monthly_limit_usd" class="flex items-center gap-2 text-sm text-slate-300">
                    <span>无限额</span>
                  </div>
                </div>
                <button
                  @click="selectPlan(plan)"
                  :class="[
                    'w-full rounded-lg py-3 text-sm font-bold transition',
                    selectedPlan?.id === plan.id
                      ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/30'
                      : 'border border-slate-700/50 bg-slate-900/50 text-slate-300 hover:border-brand-500'
                  ]"
                >
                  {{ selectedPlan?.id === plan.id ? '已选择' : '选择套餐' }}
                </button>
              </div>
            </div>

            <div v-if="selectedPlan" class="space-y-4">
              <button
                @click="selectedPlan = null"
                class="flex items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-800/40 px-4 py-2.5 text-sm font-bold text-slate-300 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800/60"
              >
                <span>←</span>
                <span>返回套餐列表</span>
              </button>

              <div class="rounded-xl border border-brand-500/50 bg-brand-500/5 p-6 backdrop-blur-sm">
                <h3 class="mb-4 text-sm font-bold text-white">确认订阅</h3>
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
              <div class="flex gap-3">
                <button
                  @click="selectedPlan = null"
                  class="flex-1 rounded-lg border border-slate-700/50 bg-slate-900/50 py-3 text-sm font-bold text-slate-300 transition hover:border-slate-600"
                >
                  取消
                </button>
                <button
                  @click="handleSubscribe"
                  :disabled="!canSubmitSub || submitting"
                  :class="[
                    'flex-1 rounded-lg py-3 text-sm font-bold text-white transition',
                    canSubmitSub && !submitting
                      ? 'bg-gradient-to-r from-brand-500 to-brand-600 shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50'
                      : 'bg-slate-700 cursor-not-allowed opacity-50'
                  ]"
                >
                  <span v-if="submitting">处理中...</span>
                  <span v-else>确认订阅</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        </template>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { subscriptionsAPI } from '@/api'
import { paymentAPI } from '@/api/payment'
import { useAuthStore } from '@/stores/auth'
import type { UserSubscription } from '@/types'
import type { SubscriptionPlan, MethodLimit } from '@/types/payment'
import { showError } from '@/utils/toast'

const authStore = useAuthStore()

const mainTab = ref<'my-subscriptions' | 'purchase'>('my-subscriptions')
const purchaseTab = ref<'recharge' | 'subscription'>('recharge')

// 当前余额
const currentBalance = computed(() => authStore.user?.balance ?? 0)

// 我的订阅数据
const loadingSubs = ref(false)
const subscriptions = ref<UserSubscription[]>([])

// 购买套餐数据
const loadingPayment = ref(false)
const submitting = ref(false)
const amount = ref<number | null>(null)
const selectedMethod = ref('')
const selectedPlan = ref<SubscriptionPlan | null>(null)
const balanceDisabled = ref(false)
const feeRate = ref(0)
const minAmount = ref(0)
const maxAmount = ref(0)
const methods = ref<Record<string, MethodLimit>>({})
const plans = ref<SubscriptionPlan[]>([])

const quickAmounts = [10, 20, 50, 100, 200, 500, 1000, 2000]

// 我的订阅计算属性
const activeCount = computed(() => subscriptions.value.filter(s => s.status === 'active').length)
const expiringCount = computed(() => {
  const now = new Date()
  const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  return subscriptions.value.filter(s => {
    if (!s.expires_at || s.status !== 'active') return false
    const expires = new Date(s.expires_at)
    return expires > now && expires <= sevenDays
  }).length
})

// 余额统计计算属性
const totalBalance = computed(() => {
  return subscriptions.value.reduce((sum, sub) => {
    return sum + (sub.balance_usd || 0)
  }, 0)
})

const usedBalance = computed(() => {
  return subscriptions.value.reduce((sum, sub) => {
    return sum + (sub.used_balance_usd || 0)
  }, 0)
})

// 购买套餐计算属性
const validAmount = computed(() => amount.value || 0)
const availableMethods = computed(() => {
  return Object.entries(methods.value).map(([type, limit]) => ({
    type,
    fee_rate: limit.fee_rate || 0,
    available: limit.available && amountFitsMethod(
      purchaseTab.value === 'recharge' ? validAmount.value : (selectedPlan.value?.price || 0),
      type
    )
  }))
})
const feeAmount = computed(() => {
  if (feeRate.value <= 0 || validAmount.value <= 0) return 0
  return Math.ceil((validAmount.value * feeRate.value / 100) * 100) / 100
})
const totalAmount = computed(() => {
  if (feeRate.value <= 0) return validAmount.value
  return Math.round((validAmount.value + feeAmount.value) * 100) / 100
})
const canSubmit = computed(() => {
  return validAmount.value > 0 && selectedMethod.value && !submitting.value
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
const canSubmitSub = computed(() => {
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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

function getUsagePercent(used: number | undefined, limit: number | null | undefined): string {
  if (!limit || limit === 0) return '0%'
  const percentage = Math.min(((used || 0) / limit) * 100, 100)
  return `${percentage}%`
}

function renewSub(sub: UserSubscription) {
  mainTab.value = 'purchase'
  purchaseTab.value = 'subscription'
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
  if (!canSubmitSub.value || !selectedPlan.value) return
  submitting.value = true
  try {
    const result = await paymentAPI.createOrder({
      amount: selectedPlan.value.price,
      payment_type: selectedMethod.value,
      order_type: 'subscription',
      plan_id: selectedPlan.value.id
    })
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

async function loadSubscriptions() {
  loadingSubs.value = true
  try {
    subscriptions.value = await subscriptionsAPI.getMySubscriptions()
  } catch (error) {
    console.error('加载订阅失败:', error)
  } finally {
    loadingSubs.value = false
  }
}

async function loadPaymentData() {
  loadingPayment.value = true
  try {
    const response = await paymentAPI.getCheckoutInfo()
    const data = response.data
    methods.value = data.methods
    plans.value = data.plans.filter(p => p.for_sale).sort((a, b) => a.sort_order - b.sort_order)
    balanceDisabled.value = data.balance_disabled
    feeRate.value = data.recharge_fee_rate || 0
    minAmount.value = data.global_min
    maxAmount.value = data.global_max
    const methodKeys = Object.keys(methods.value)
    if (methodKeys.length > 0) {
      selectedMethod.value = methodKeys[0]
    }
    if (balanceDisabled.value) {
      purchaseTab.value = 'subscription'
    }
  } catch (error) {
    console.error('加载支付数据失败:', error)
  } finally {
    loadingPayment.value = false
  }
}

onMounted(() => {
  loadSubscriptions()
  loadPaymentData()
})
</script>
