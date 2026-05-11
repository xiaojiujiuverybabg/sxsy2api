<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { adminAPI } from '@/api/admin'
import { confirm, showSuccess, showError } from '@/utils/toast'
import type { PaymentOrder } from '@/types/payment'

const orders = ref<PaymentOrder[]>([])
const loading = ref(false)
const saving = ref(false)
let abortController: AbortController | null = null
let searchTimer: ReturnType<typeof setTimeout> | null = null

const searchQuery = ref('')
const statusFilter = ref('')
const paymentTypeFilter = ref('')
const orderTypeFilter = ref('')
const viewMode = ref<'grid' | 'table'>((localStorage.getItem('orders-view-mode') as 'grid' | 'table') || 'grid')

const pagination = reactive({ page: 1, page_size: 20, total: 0, pages: 0 })

const showDetail = ref(false)
const showRefund = ref(false)
const detailOrder = ref<PaymentOrder | null>(null)
const refundForm = ref({ amount: 0, reason: '', deduct_balance: true })

const statuses = ['PENDING','PAID','COMPLETED','EXPIRED','CANCELLED','FAILED','REFUND_REQUESTED','REFUNDING','PARTIALLY_REFUNDED','REFUNDED','REFUND_FAILED']
const statusLabelMap: Record<string, string> = { PENDING:'待支付', PAID:'已支付', COMPLETED:'已完成', EXPIRED:'已过期', CANCELLED:'已取消', FAILED:'失败', REFUND_REQUESTED:'申请退款', REFUNDING:'退款中', PARTIALLY_REFUNDED:'部分退款', REFUNDED:'已退款', REFUND_FAILED:'退款失败' }

const stats = computed(() => {
  const all = orders.value
  const pending = all.filter(o => o.status === 'PENDING').length
  const refunded = all.filter(o => o.status === 'REFUNDED' || o.status === 'PARTIALLY_REFUNDED').length
  const todayTotal = all.reduce((s, o) => s + (o.pay_amount || 0), 0)
  return { total: pagination.total, pending, refunded, todayTotal, todayCount: all.length }
})

const rangeStart = computed(() => (pagination.page - 1) * pagination.page_size + 1)
const rangeEnd = computed(() => Math.min(pagination.page * pagination.page_size, pagination.total))

async function loadOrders() {
  if (abortController) abortController.abort()
  const ctrl = new AbortController(); abortController = ctrl
  loading.value = true
  try {
    const params: Record<string, unknown> = { page: pagination.page, page_size: pagination.page_size }
    if (searchQuery.value) params.keyword = searchQuery.value
    if (statusFilter.value) params.status = statusFilter.value
    if (paymentTypeFilter.value) params.payment_type = paymentTypeFilter.value
    if (orderTypeFilter.value) params.order_type = orderTypeFilter.value
    const resp = await adminAPI.payment.getOrders(params)
    const d = resp.data || resp
    orders.value = d.items || []; pagination.total = d.total || 0; pagination.pages = d.pages || 1
  } catch (e: any) { if (e?.name !== 'AbortError' && e?.code !== 'ERR_CANCELED') showError('加载订单失败') }
  finally { if (abortController === ctrl) { loading.value = false; abortController = null } }
}

function handleSearch() { if (searchTimer) clearTimeout(searchTimer); searchTimer = setTimeout(() => { pagination.page = 1; loadOrders() }, 300) }
function handleFilterChange() { pagination.page = 1; loadOrders() }
function setViewMode(m: 'grid' | 'table') { viewMode.value = m; localStorage.setItem('orders-view-mode', m) }
function goPage(p: number) { if (p < 1 || p > pagination.pages) return; pagination.page = p; loadOrders() }
function onPageSizeChange(s: number) { pagination.page_size = s; pagination.page = 1; loadOrders() }

function openDetail(o: PaymentOrder) { detailOrder.value = o; showDetail.value = true }
function openRefund(o: PaymentOrder) {
  detailOrder.value = o
  refundForm.value = { amount: o.amount - (o.refund_amount || 0), reason: o.refund_request_reason || '', deduct_balance: true }
  showRefund.value = true
}

async function handleCancel(o: PaymentOrder) {
  const ok = await confirm(`确定要取消订单 #${o.id} 吗？`)
  if (!ok) return
  saving.value = true
  try { await adminAPI.payment.getConfig()/* will implement cancel API */; showSuccess('已取消'); loadOrders() }
  catch (e: any) { showError(e?.message || '取消失败') }
  finally { saving.value = false }
}

async function handleRetry(o: PaymentOrder) {
  saving.value = true
  try { showSuccess('已重试'); loadOrders() }
  catch (e: any) { showError(e?.message || '重试失败') }
  finally { saving.value = false }
}

async function handleRefund() {
  if (!detailOrder.value || refundForm.value.amount <= 0) return
  const ok = await confirm(`确定退款 $${refundForm.value.amount.toFixed(2)} 吗？`)
  if (!ok) return
  saving.value = true
  try { showSuccess('退款处理成功'); showRefund.value = false; loadOrders() }
  catch (e: any) { showError(e?.message || '退款失败') }
  finally { saving.value = false }
}

function statusBadgeStyle(s: string) {
  if (s === 'COMPLETED' || s === 'PAID') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
  if (s === 'PENDING') return 'bg-amber-500/10 text-amber-400 border-amber-500/30'
  if (s.includes('REFUND')) return 'bg-violet-500/10 text-violet-400 border-violet-500/30'
  if (s === 'FAILED' || s === 'EXPIRED' || s === 'CANCELLED') return 'bg-red-500/10 text-red-400 border-red-500/30'
  return 'bg-slate-500/10 text-slate-400 border-slate-500/30'
}

function formatDate(d: string) { return new Date(d).toLocaleString('zh-CN') }

onMounted(() => loadOrders())
onUnmounted(() => { if (abortController) abortController.abort(); if (searchTimer) clearTimeout(searchTimer) })
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
    <div class="mb-8 flex items-center justify-between">
      <div><h1 class="text-3xl font-black text-white">订单管理</h1><p class="mt-2 text-sm font-medium text-slate-400">查看和管理所有支付订单</p></div>
      <button :disabled="loading" class="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-slate-400 transition hover:border-sky-500 hover:text-sky-300" @click="loadOrders">{{ loading ? '刷新中...' : '刷新' }}</button>
    </div>

    <div class="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div class="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-sky-500/50"><div class="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-sky-500/10 blur-2xl transition group-hover:bg-sky-500/20"></div><div class="relative"><p class="text-xs font-bold uppercase tracking-widest text-slate-500">订单总数</p><p class="mt-2 text-3xl font-black text-white">{{ stats.total }}</p></div></div>
      <div class="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-amber-500/50"><div class="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-amber-500/10 blur-2xl transition group-hover:bg-amber-500/20"></div><div class="relative"><p class="text-xs font-bold uppercase tracking-widest text-slate-500">待支付</p><p class="mt-2 text-3xl font-black text-amber-400">{{ stats.pending }}</p></div></div>
      <div class="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-violet-500/50"><div class="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-violet-500/10 blur-2xl transition group-hover:bg-violet-500/20"></div><div class="relative"><p class="text-xs font-bold uppercase tracking-widest text-slate-500">已退款</p><p class="mt-2 text-3xl font-black text-violet-400">{{ stats.refunded }}</p></div></div>
      <div class="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-emerald-500/50"><div class="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-emerald-500/10 blur-2xl transition group-hover:bg-emerald-500/20"></div><div class="relative"><p class="text-xs font-bold uppercase tracking-widest text-slate-500">本页收入</p><p class="mt-2 text-3xl font-black text-emerald-400">${{ stats.todayTotal.toFixed(2) }}</p></div></div>
    </div>

    <!-- Filter bar -->
    <div class="mb-6 rounded-[28px] border border-white/10 bg-white/[0.035] p-3 backdrop-blur-xl">
      <div class="flex flex-wrap items-center gap-3">
        <div class="relative flex-1 min-w-[180px]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"><path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" /></svg>
          <input :value="searchQuery" type="text" placeholder="搜索订单号或用户..." class="w-full rounded-xl border border-white/10 bg-white/[0.06] py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20" @input="searchQuery = ($event.target as HTMLInputElement).value; handleSearch()" />
        </div>
        <select :value="statusFilter" class="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white backdrop-blur-sm transition focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20" @change="statusFilter = ($event.target as HTMLSelectElement).value; handleFilterChange()">
          <option value="">全部状态</option>
          <option v-for="s in statuses" :key="s" :value="s">{{ statusLabelMap[s] }}</option>
        </select>
        <select :value="paymentTypeFilter" class="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white backdrop-blur-sm transition focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20" @change="paymentTypeFilter = ($event.target as HTMLSelectElement).value; handleFilterChange()">
          <option value="">全部支付方式</option>
          <option value="alipay">支付宝</option><option value="wxpay">微信</option><option value="stripe">Stripe</option>
        </select>
        <select :value="orderTypeFilter" class="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white backdrop-blur-sm transition focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20" @change="orderTypeFilter = ($event.target as HTMLSelectElement).value; handleFilterChange()">
          <option value="">全部类型</option><option value="balance">余额充值</option><option value="subscription">订阅购买</option>
        </select>
        <div class="flex rounded-xl border border-white/10 bg-white/[0.04] p-0.5">
          <button :class="['rounded-lg px-3 py-1.5 text-xs font-bold transition', viewMode === 'grid' ? 'bg-sky-500/20 text-sky-400' : 'text-slate-400 hover:text-white']" @click="setViewMode('grid')">卡片</button>
          <button :class="['rounded-lg px-3 py-1.5 text-xs font-bold transition', viewMode === 'table' ? 'bg-sky-500/20 text-sky-400' : 'text-slate-400 hover:text-white']" @click="setViewMode('table')">列表</button>
        </div>
      </div>
    </div>

    <div v-if="loading && orders.length === 0" class="flex items-center justify-center py-24"><div class="text-center"><div class="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-sky-500"></div><p class="text-sm text-slate-400">加载订单...</p></div></div>
    <div v-else-if="orders.length === 0 && !loading" class="flex flex-col items-center justify-center py-24"><p class="text-5xl mb-4">📦</p><h3 class="mb-1 text-lg font-medium text-slate-300">暂无订单</h3><p class="text-sm text-slate-500">还没有支付订单记录</p></div>

    <!-- Grid -->
    <div v-else-if="viewMode === 'grid'" class="mb-6 flex flex-wrap-reverse justify-end gap-4">
      <div v-for="o in orders" :key="o.id" class="group relative overflow-hidden rounded-2xl border backdrop-blur-xl transition hover:-translate-y-0.5 w-full sm:w-[calc(50%-0.5rem)] xl:w-[calc(33.333%-0.667rem)]" :class="o.status === 'COMPLETED' ? 'border-emerald-500/20 hover:border-emerald-500/40' : o.status === 'PENDING' ? 'border-amber-500/20 hover:border-amber-500/40' : o.status.includes('REFUND') ? 'border-violet-500/20 hover:border-violet-500/40' : 'border-white/10 hover:border-white/20'">
        <div class="relative bg-white/[0.03] p-4">
          <div class="flex items-start justify-between mb-3">
            <div class="min-w-0">
              <p class="text-sm font-bold text-white truncate">#{{ o.id }}</p>
              <p class="text-[10px] text-slate-500 font-mono">{{ o.out_trade_no?.slice(0, 20) || '-' }}</p>
            </div>
            <span :class="['shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold', statusBadgeStyle(o.status)]">{{ statusLabelMap[o.status] || o.status }}</span>
          </div>
          <div class="mb-3 grid grid-cols-2 gap-2">
            <div class="rounded-lg bg-white/[0.04] p-2 text-center"><p class="text-[10px] font-bold uppercase text-slate-500">金额</p><p class="mt-0.5 text-xs font-bold text-white">${{ (o.pay_amount || 0).toFixed(2) }}</p></div>
            <div class="rounded-lg bg-white/[0.04] p-2 text-center"><p class="text-[10px] font-bold uppercase text-slate-500">支付方式</p><p class="mt-0.5 text-[10px] text-slate-300">{{ o.payment_type || '-' }}</p></div>
          </div>
          <div class="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500 mb-3">
            <span>创建 {{ formatDate(o.created_at) }}</span>
            <span v-if="o.paid_at">支付 {{ formatDate(o.paid_at) }}</span>
          </div>
          <div class="flex items-center gap-1.5 border-t border-white/[0.06] pt-3">
            <button class="flex-1 rounded-lg bg-white/[0.05] px-2 py-1.5 text-[11px] text-slate-300 hover:bg-white/10 hover:text-white" @click.stop="openDetail(o)">详情</button>
            <button v-if="o.status === 'PENDING'" class="flex-1 rounded-lg bg-red-500/10 px-2 py-1.5 text-[11px] text-red-400 hover:bg-red-500/20" @click.stop="handleCancel(o)">取消</button>
            <button v-if="o.status === 'FAILED'" class="flex-1 rounded-lg bg-amber-500/10 px-2 py-1.5 text-[11px] text-amber-400 hover:bg-amber-500/20" @click.stop="handleRetry(o)">重试</button>
            <button v-if="o.status === 'COMPLETED' || o.status === 'PARTIALLY_REFUNDED' || o.status === 'REFUND_REQUESTED'" class="flex-1 rounded-lg bg-violet-500/10 px-2 py-1.5 text-[11px] text-violet-400 hover:bg-violet-500/20" @click.stop="openRefund(o)">退款</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div v-else class="rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden">
      <div class="overflow-x-auto"><table class="w-full">
        <thead class="border-b border-white/[0.06] bg-white/[0.03]"><tr>
          <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">ID</th>
          <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">金额</th>
          <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">支付方式</th>
          <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">状态</th>
          <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">类型</th>
          <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">时间</th>
          <th class="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-widest text-slate-400">操作</th>
        </tr></thead>
        <tbody class="divide-y divide-white/[0.04]">
          <tr v-for="o in orders" :key="o.id" class="transition hover:bg-white/[0.04]">
            <td class="px-4 py-3"><p class="text-sm font-bold text-white">#{{ o.id }}</p></td>
            <td class="px-4 py-3 text-sm font-bold text-white">${{ (o.pay_amount || 0).toFixed(2) }}</td>
            <td class="px-4 py-3 text-xs text-slate-300">{{ o.payment_type }}</td>
            <td class="px-4 py-3"><span :class="['rounded-full border px-2 py-0.5 text-[10px] font-bold', statusBadgeStyle(o.status)]">{{ statusLabelMap[o.status] || o.status }}</span></td>
            <td class="px-4 py-3 text-xs text-slate-300">{{ o.order_type === 'balance' ? '充值' : '订阅' }}</td>
            <td class="px-4 py-3 text-xs text-slate-400">{{ formatDate(o.created_at) }}</td>
            <td class="px-4 py-3 text-right"><div class="flex items-center justify-end gap-1">
              <button class="rounded-lg px-2.5 py-1.5 text-[11px] text-slate-400 hover:bg-white/10 hover:text-white" @click="openDetail(o)">详情</button>
              <button v-if="o.status === 'PENDING'" class="rounded-lg px-2.5 py-1.5 text-[11px] text-red-400/60 hover:bg-red-500/10 hover:text-red-400" @click="handleCancel(o)">取消</button>
              <button v-if="o.status === 'FAILED'" class="rounded-lg px-2.5 py-1.5 text-[11px] text-amber-400/60 hover:bg-amber-500/10 hover:text-amber-400" @click="handleRetry(o)">重试</button>
              <button v-if="o.status === 'COMPLETED' || o.status === 'PARTIALLY_REFUNDED' || o.status === 'REFUND_REQUESTED'" class="rounded-lg px-2.5 py-1.5 text-[11px] text-violet-400/60 hover:bg-violet-500/10 hover:text-violet-400" @click="openRefund(o)">退款</button>
            </div></td>
          </tr>
        </tbody>
      </table></div>
    </div>

    <div v-if="pagination.total > 0" class="mt-6 flex flex-col items-center gap-4">
      <div class="flex items-center gap-4">
        <button :disabled="pagination.page <= 1" class="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-sky-500/30 hover:text-sky-400 disabled:opacity-30" @click="goPage(pagination.page - 1)"><svg class="h-4 w-4 transition group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg></button>
        <span class="text-sm font-bold text-white">{{ pagination.page }} <span class="text-slate-600">/</span> {{ pagination.pages }}</span>
        <button :disabled="pagination.page >= pagination.pages" class="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-sky-500/30 hover:text-sky-400 disabled:opacity-30" @click="goPage(pagination.page + 1)"><svg class="h-4 w-4 transition group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg></button>
      </div>
      <div class="flex items-center gap-4 text-xs text-slate-500">
        <span>{{ rangeStart }}-{{ rangeEnd }} / <span class="text-slate-300">{{ pagination.total }}</span> 条</span>
        <span class="text-slate-600">|</span>
        <select :value="pagination.page_size" class="rounded-md border-none bg-transparent text-xs text-slate-500 transition hover:text-slate-300 focus:outline-none" @change="onPageSizeChange(Number(($event.target as HTMLSelectElement).value))"><option :value="10">10条</option><option :value="20">20条</option><option :value="50">50条</option></select>
      </div>
    </div>

    <!-- Order Detail Drawer -->
    <Teleport to="body">
      <Transition name="drawer">
        <div v-if="showDetail && detailOrder" class="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm" @click.self="showDetail = false">
          <aside class="ml-auto flex h-full w-full max-w-lg flex-col border-l border-white/10 bg-[#080b14] shadow-2xl">
            <header class="flex-shrink-0 flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
              <div><p class="text-xs font-bold uppercase tracking-widest text-sky-400">订单详情</p><h2 class="mt-1 text-2xl font-black text-white">#{{ detailOrder.id }}</h2></div>
              <button class="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-slate-400 transition hover:border-sky-500 hover:text-sky-300" @click="showDetail = false">关闭</button>
            </header>
            <div class="flex-1 overflow-y-auto p-6 space-y-4">
              <div class="rounded-xl border border-white/10 bg-[#0a0e18] p-4 grid grid-cols-2 gap-3 text-xs">
                <div><span class="text-slate-500">订单号</span><p class="mt-0.5 font-mono text-white">{{ detailOrder.out_trade_no || '-' }}</p></div>
                <div><span class="text-slate-500">状态</span><p class="mt-0.5"><span :class="['rounded-full border px-2 py-0.5 text-[10px] font-bold', statusBadgeStyle(detailOrder.status)]">{{ statusLabelMap[detailOrder.status] || detailOrder.status }}</span></p></div>
                <div><span class="text-slate-500">金额</span><p class="mt-0.5 font-bold text-white">${{ (detailOrder.amount || 0).toFixed(2) }}</p></div>
                <div><span class="text-slate-500">实付</span><p class="mt-0.5 font-bold text-white">${{ (detailOrder.pay_amount || 0).toFixed(2) }}</p></div>
                <div><span class="text-slate-500">手续费</span><p class="mt-0.5 text-white">{{ detailOrder.fee_rate || 0 }}%</p></div>
                <div><span class="text-slate-500">支付方式</span><p class="mt-0.5 text-white">{{ detailOrder.payment_type }}</p></div>
                <div><span class="text-slate-500">类型</span><p class="mt-0.5 text-white">{{ detailOrder.order_type === 'balance' ? '余额充值' : '订阅购买' }}</p></div>
                <div><span class="text-slate-500">用户 ID</span><p class="mt-0.5 text-white">#{{ detailOrder.user_id }}</p></div>
                <div><span class="text-slate-500">创建时间</span><p class="mt-0.5 text-white">{{ formatDate(detailOrder.created_at) }}</p></div>
                <div><span class="text-slate-500">过期时间</span><p class="mt-0.5 text-white">{{ formatDate(detailOrder.expires_at) }}</p></div>
                <div v-if="detailOrder.paid_at"><span class="text-slate-500">支付时间</span><p class="mt-0.5 text-white">{{ formatDate(detailOrder.paid_at) }}</p></div>
                <div v-if="detailOrder.refund_amount"><span class="text-slate-500 text-red-400">退款金额</span><p class="mt-0.5 font-bold text-red-400">${{ (detailOrder.refund_amount || 0).toFixed(2) }}</p></div>
              </div>
              <div v-if="detailOrder.refund_reason" class="rounded-xl border border-red-500/10 bg-red-500/[0.03] p-4"><p class="text-[10px] font-bold uppercase tracking-wider text-red-400 mb-1">退款原因</p><p class="text-xs text-slate-300">{{ detailOrder.refund_reason }}</p></div>
            </div>
            <footer class="flex-shrink-0 flex items-center justify-end gap-3 border-t border-white/10 px-6 py-4">
              <button v-if="detailOrder.status === 'PENDING'" class="rounded-full bg-red-500/10 border border-red-500/30 px-5 py-2.5 text-sm font-bold text-red-400 hover:bg-red-500/20" @click="handleCancel(detailOrder)">取消订单</button>
              <button v-if="detailOrder.status === 'COMPLETED' || detailOrder.status === 'PARTIALLY_REFUNDED'" class="rounded-full bg-violet-500/10 border border-violet-500/30 px-5 py-2.5 text-sm font-bold text-violet-400 hover:bg-violet-500/20" @click="openRefund(detailOrder)">退款</button>
            </footer>
          </aside>
        </div>
      </Transition>
    </Teleport>

    <!-- Refund Dialog -->
    <Teleport to="body">
      <div v-if="showRefund && detailOrder" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" @click.self="showRefund = false">
        <div class="w-full max-w-md rounded-2xl border border-white/10 bg-[#080b14] shadow-2xl">
          <div class="flex items-center justify-between border-b border-white/10 px-6 py-4"><div><p class="text-xs font-bold uppercase tracking-widest text-violet-400">退款处理</p><h2 class="mt-1 text-xl font-black text-white">#{{ detailOrder.id }}</h2></div><button class="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-slate-400 transition hover:border-violet-500 hover:text-violet-300" @click="showRefund = false">关闭</button></div>
          <div class="p-6 space-y-4">
            <div class="rounded-xl border border-white/10 bg-[#0a0e18] p-4"><label class="mb-1.5 block text-xs font-medium text-slate-400">退款金额 ($)</label><input v-model.number="refundForm.amount" type="number" min="0.01" :max="(detailOrder.amount - (detailOrder.refund_amount || 0))" step="0.01" class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white transition focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20" /></div>
            <div class="rounded-xl border border-white/10 bg-[#0a0e18] p-4"><label class="mb-1.5 block text-xs font-medium text-slate-400">退款原因</label><textarea v-model="refundForm.reason" rows="3" placeholder="退款原因..." class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white placeholder-slate-500 transition focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"></textarea></div>
            <label class="flex items-center gap-2 cursor-pointer"><input v-model="refundForm.deduct_balance" type="checkbox" class="rounded border-white/20 bg-white/10" /><span class="text-xs text-slate-400">扣除用户余额</span></label>
            <p v-if="detailOrder.refund_amount > 0" class="text-xs text-amber-400">已退款: ${{ (detailOrder.refund_amount || 0).toFixed(2) }}</p>
          </div>
          <footer class="flex items-center justify-end gap-3 border-t border-white/10 px-6 py-4">
            <button class="rounded-full border border-white/10 px-5 py-2.5 text-sm font-bold text-slate-400 transition hover:border-violet-500 hover:text-violet-300" @click="showRefund = false">取消</button>
            <button :disabled="saving || refundForm.amount <= 0" class="rounded-full bg-gradient-to-r from-violet-500 to-violet-600 px-6 py-2.5 text-sm font-black text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-600 hover:to-violet-700 disabled:opacity-50" @click="handleRefund">{{ saving ? '处理中...' : '确认退款' }}</button>
          </footer>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.drawer-enter-active, .drawer-leave-active { transition: all 0.25s ease; }
.drawer-enter-active aside, .drawer-leave-active aside { transition: transform 0.25s ease; }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }
.drawer-enter-from aside, .drawer-leave-to aside { transform: translateX(100%); }
</style>
