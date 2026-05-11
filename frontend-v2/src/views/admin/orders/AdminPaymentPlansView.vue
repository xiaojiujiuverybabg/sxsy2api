<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { adminAPI } from '@/api/admin'
import { confirm, showSuccess, showError } from '@/utils/toast'
import type { SubscriptionPlan } from '@/types/payment'
import type { AdminGroup } from '@/types'

const plans = ref<SubscriptionPlan[]>([])
const groups = ref<AdminGroup[]>([])
const loading = ref(false)
const saving = ref(false)
const viewMode = ref<'grid' | 'table'>((localStorage.getItem('plans-view-mode') as 'grid' | 'table') || 'grid')

const showFormModal = ref(false)
const editingPlan = ref<SubscriptionPlan | null>(null)
const form = ref({ name: '', description: '', group_id: null as number | null, price: 0, original_price: 0, validity_days: 30, validity_unit: 'days' as string, sort_order: 0, features: '', for_sale: true })

const stats = computed(() => {
  const all = plans.value
  return { total: all.length, onSale: all.filter(p => p.for_sale).length, offSale: all.filter(p => !p.for_sale).length, avgPrice: all.length ? (all.reduce((s, p) => s + p.price, 0) / all.length) : 0 }
})

const subscriptionGroups = computed(() => groups.value.filter(g => (g as any).subscription_type === 'subscription'))

function platformColor(p: string | undefined) {
  const m: Record<string, string> = { anthropic: 'text-amber-400', openai: 'text-emerald-400', gemini: 'text-blue-400', antigravity: 'text-violet-400' }
  return m[p || ''] || 'text-slate-400'
}

async function loadAll() {
  loading.value = true
  try {
    const [pResp, g] = await Promise.all([adminAPI.payment.getPlans(), adminAPI.groups.getAll()])
    plans.value = (pResp as any).data || pResp || []
    groups.value = g
  } catch (e: any) { showError('加载失败') }
  finally { loading.value = false }
}

function openCreate() { editingPlan.value = null; form.value = { name: '', description: '', group_id: null, price: 0, original_price: 0, validity_days: 30, validity_unit: 'days', sort_order: 0, features: '', for_sale: true }; showFormModal.value = true }
function openEdit(p: SubscriptionPlan) { editingPlan.value = p; form.value = { name: p.name, description: p.description || '', group_id: p.group_id, price: p.price, original_price: p.original_price || 0, validity_days: p.validity_days, validity_unit: p.validity_unit || 'days', sort_order: p.sort_order, features: (p.features || []).join('\n'), for_sale: p.for_sale }; showFormModal.value = true }

async function handleSubmit() {
  if (!form.value.name || !form.value.group_id || form.value.price <= 0) { showError('请完善必填字段'); return }
  saving.value = true
  const features = form.value.features.split('\n').map(s => s.trim()).filter(Boolean)
  const payload: Record<string, unknown> = { name: form.value.name, description: form.value.description, group_id: form.value.group_id, price: form.value.price, original_price: form.value.original_price || null, validity_days: form.value.validity_days, validity_unit: form.value.validity_unit, sort_order: form.value.sort_order, features: features.join('\n'), for_sale: form.value.for_sale }
  try {
    if (editingPlan.value) { await adminAPI.payment.updatePlan(editingPlan.value.id, payload); showSuccess('套餐更新成功') }
    else { await adminAPI.payment.createPlan(payload); showSuccess('套餐创建成功') }
    showFormModal.value = false; loadAll()
  } catch (e: any) { showError(e?.message || '保存失败') }
  finally { saving.value = false }
}

async function handleDelete(p: SubscriptionPlan) {
  const ok = await confirm(`确定要删除套餐「${p.name}」吗？`)
  if (!ok) return
  try { await adminAPI.payment.deletePlan(p.id); showSuccess('已删除'); loadAll() }
  catch (e: any) { showError(e?.message || '删除失败') }
}

async function toggleForSale(p: SubscriptionPlan) {
  try { await adminAPI.payment.updatePlan(p.id, { for_sale: !p.for_sale }); p.for_sale = !p.for_sale; showSuccess(p.for_sale ? '已上架' : '已下架') }
  catch (e: any) { showError(e?.message || '操作失败') }
}

function selectedGroup() { return groups.value.find(g => g.id === form.value.group_id) }

onMounted(() => loadAll())
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
    <div class="mb-8 flex items-center justify-between">
      <div><h1 class="text-3xl font-black text-white">套餐管理</h1><p class="mt-2 text-sm font-medium text-slate-400">管理订阅套餐和定价</p></div>
      <div class="flex items-center gap-3">
        <button :disabled="loading" class="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-slate-400 hover:border-indigo-500 hover:text-indigo-300" @click="loadAll">{{ loading ? '...' : '刷新' }}</button>
        <button class="rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-600 hover:to-indigo-700" @click="openCreate">+ 创建套餐</button>
      </div>
    </div>

    <div class="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div class="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-indigo-500/50"><div class="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-indigo-500/10 blur-2xl transition group-hover:bg-indigo-500/20"></div><div class="relative"><p class="text-xs font-bold uppercase tracking-widest text-slate-500">套餐总数</p><p class="mt-2 text-3xl font-black text-white">{{ stats.total }}</p></div></div>
      <div class="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-emerald-500/50"><div class="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-emerald-500/10 blur-2xl transition group-hover:bg-emerald-500/20"></div><div class="relative"><p class="text-xs font-bold uppercase tracking-widest text-slate-500">已上架</p><p class="mt-2 text-3xl font-black text-emerald-400">{{ stats.onSale }}</p></div></div>
      <div class="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-slate-500/50"><div class="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-slate-500/10 blur-2xl"></div><div class="relative"><p class="text-xs font-bold uppercase tracking-widest text-slate-500">已下架</p><p class="mt-2 text-3xl font-black text-slate-400">{{ stats.offSale }}</p></div></div>
      <div class="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-amber-500/50"><div class="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-amber-500/10 blur-2xl transition group-hover:bg-amber-500/20"></div><div class="relative"><p class="text-xs font-bold uppercase tracking-widest text-slate-500">均价</p><p class="mt-2 text-3xl font-black text-amber-400">${{ stats.avgPrice.toFixed(2) }}</p></div></div>
    </div>

    <div class="mb-6 flex items-center gap-3">
      <div class="flex rounded-xl border border-white/10 bg-white/[0.04] p-0.5">
        <button :class="['rounded-lg px-3 py-1.5 text-xs font-bold transition', viewMode==='grid'?'bg-indigo-500/20 text-indigo-400':'text-slate-400 hover:text-white']" @click="viewMode='grid'">卡片</button>
        <button :class="['rounded-lg px-3 py-1.5 text-xs font-bold transition', viewMode==='table'?'bg-indigo-500/20 text-indigo-400':'text-slate-400 hover:text-white']" @click="viewMode='table'">列表</button>
      </div>
    </div>

    <div v-if="loading && plans.length===0" class="flex items-center justify-center py-24"><div class="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-indigo-500"></div></div>
    <div v-else-if="plans.length===0&&!loading" class="flex flex-col items-center justify-center py-24"><p class="text-5xl mb-4">📋</p><h3 class="text-lg font-medium text-slate-300">暂无套餐</h3><p class="text-sm text-slate-500 mb-4">点击创建添加订阅套餐</p><button class="rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-indigo-500/20" @click="openCreate">+ 创建套餐</button></div>

    <!-- Grid -->
    <div v-else-if="viewMode==='grid'" class="mb-6 flex flex-wrap-reverse justify-end gap-4">
      <div v-for="p in plans" :key="p.id" class="group relative overflow-hidden rounded-2xl border backdrop-blur-xl transition hover:-translate-y-0.5 w-full sm:w-[calc(50%-0.5rem)] xl:w-[calc(33.333%-0.667rem)]" :class="p.for_sale?'border-emerald-500/20 hover:border-emerald-500/40':'border-white/10 hover:border-white/20'">
        <div class="relative bg-white/[0.03] p-4">
          <div class="flex items-start justify-between mb-3"><div class="min-w-0"><h3 :class="['text-sm font-bold truncate', platformColor(p.group_platform)]">{{ p.name }}</h3><p class="text-[10px] text-slate-500">{{ p.group_name || '分组 #'+p.group_id }}</p></div><span :class="['shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold', p.for_sale?'bg-emerald-500/10 text-emerald-400 border-emerald-500/30':'bg-slate-500/10 text-slate-400 border-slate-500/30']">{{ p.for_sale?'已上架':'已下架' }}</span></div>
          <div class="mb-3 grid grid-cols-2 gap-2">
            <div class="rounded-lg bg-white/[0.04] p-2 text-center"><p class="text-[10px] font-bold uppercase text-slate-500">价格</p><p class="mt-0.5 text-xs font-bold text-white">${{ p.price.toFixed(2) }}<span v-if="p.original_price" class="text-slate-500 line-through ml-1">${{ p.original_price.toFixed(2) }}</span></p></div>
            <div class="rounded-lg bg-white/[0.04] p-2 text-center"><p class="text-[10px] font-bold uppercase text-slate-500">有效期</p><p class="mt-0.5 text-xs text-white">{{ p.validity_days }}{{ {days:'天',weeks:'周',months:'月'}[p.validity_unit]||p.validity_unit }}</p></div>
          </div>
          <p v-if="p.description" class="text-[11px] text-slate-400 mb-3 line-clamp-1">{{ p.description }}</p>
          <div class="flex items-center gap-1.5 border-t border-white/[0.06] pt-3">
            <button class="flex-1 rounded-lg bg-white/[0.05] px-2 py-1.5 text-[11px] text-slate-300 hover:bg-white/10 hover:text-white" @click.stop="openEdit(p)">编辑</button>
            <button :class="['flex-1 rounded-lg px-2 py-1.5 text-[11px] font-medium', p.for_sale?'bg-slate-500/10 text-slate-400 hover:bg-slate-500/20':'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20']" @click.stop="toggleForSale(p)">{{ p.for_sale?'下架':'上架' }}</button>
            <button class="rounded-lg bg-white/[0.05] px-2 py-1.5 text-[11px] text-red-400/50 hover:bg-red-500/10 hover:text-red-400" @click.stop="handleDelete(p)"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-3.5 w-3.5"><path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" /></svg></button>
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div v-else class="rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden">
      <div class="overflow-x-auto"><table class="w-full">
        <thead class="border-b border-white/[0.06] bg-white/[0.03]"><tr>
          <th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">名称</th><th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">分组</th><th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">价格</th><th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">有效期</th><th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">上架</th><th class="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">排序</th><th class="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-widest text-slate-400">操作</th>
        </tr></thead>
        <tbody class="divide-y divide-white/[0.04]">
          <tr v-for="p in plans" :key="p.id" class="transition hover:bg-white/[0.04]">
            <td class="px-4 py-3"><p :class="['text-sm font-bold', platformColor(p.group_platform)]">{{ p.name }}</p></td>
            <td class="px-4 py-3 text-xs text-slate-300">{{ p.group_name || '#'+p.group_id }}</td>
            <td class="px-4 py-3 text-xs font-bold text-white">${{ p.price.toFixed(2) }}<span v-if="p.original_price" class="text-slate-500 line-through ml-1">${{ p.original_price.toFixed(2) }}</span></td>
            <td class="px-4 py-3 text-xs text-slate-300">{{ p.validity_days }}{{ {days:'天',weeks:'周',months:'月'}[p.validity_unit]||p.validity_unit }}</td>
            <td class="px-4 py-3"><button :class="['rounded-full border px-2 py-0.5 text-[10px] font-bold transition', p.for_sale?'bg-emerald-500/10 text-emerald-400 border-emerald-500/30':'bg-slate-500/10 text-slate-400 border-slate-500/30']" @click="toggleForSale(p)">{{ p.for_sale?'已上架':'已下架' }}</button></td>
            <td class="px-4 py-3 text-xs text-slate-400">{{ p.sort_order }}</td>
            <td class="px-4 py-3 text-right"><div class="flex items-center justify-end gap-1">
              <button class="rounded-lg px-2.5 py-1.5 text-[11px] text-slate-400 hover:bg-white/10 hover:text-white" @click="openEdit(p)">编辑</button>
              <button class="rounded-lg px-2 py-1.5 text-[11px] text-red-400/40 hover:bg-red-500/10 hover:text-red-400" @click="handleDelete(p)"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-3.5 w-3.5"><path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" /></svg></button>
            </div></td>
          </tr>
        </tbody>
      </table></div>
    </div>

    <!-- Form Modal -->
    <Teleport to="body">
      <Transition name="drawer">
        <div v-if="showFormModal" class="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm" @click.self="showFormModal=false">
          <aside class="ml-auto flex h-full w-full max-w-lg flex-col border-l border-white/10 bg-[#080b14] shadow-2xl">
            <header class="flex-shrink-0 flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5"><div><p class="text-xs font-bold uppercase tracking-widest text-indigo-400">{{ editingPlan?'编辑套餐':'新建套餐' }}</p><h2 class="mt-1 text-2xl font-black text-white">{{ editingPlan?(form.name||'编辑'):'创建套餐' }}</h2></div><button class="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-slate-400 hover:border-indigo-500 hover:text-indigo-300" @click="showFormModal=false">关闭</button></header>
            <form class="flex-1 overflow-y-auto p-6 space-y-4" @submit.prevent="handleSubmit">
              <div class="rounded-xl border border-white/10 bg-[#0a0e18] p-4"><label class="mb-1.5 block text-xs font-medium text-slate-400">名称 <span class="text-red-400">*</span></label><input v-model="form.name" type="text" required placeholder="套餐名称" class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div>
              <div class="rounded-xl border border-white/10 bg-[#0a0e18] p-4"><label class="mb-1.5 block text-xs font-medium text-slate-400">分组 <span class="text-red-400">*</span></label><select v-model.number="form.group_id" required class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"><option :value="null" disabled>选择分组</option><option v-for="g in subscriptionGroups" :key="g.id" :value="g.id">{{ g.name }} ({{ g.platform }})</option></select>
                <div v-if="selectedGroup()" class="mt-2 rounded-lg bg-white/[0.04] p-2 text-[10px] text-slate-400"><p><span class="text-slate-500">平台:</span> {{ selectedGroup()!.platform }} <span class="text-slate-500">倍率:</span> ×{{ selectedGroup()!.rate_multiplier }}</p><p><span class="text-slate-500">日限额:</span> {{ (selectedGroup() as any).daily_limit_usd ? '$'+(selectedGroup() as any).daily_limit_usd : '无限' }} <span class="text-slate-500">周限额:</span> {{ (selectedGroup() as any).weekly_limit_usd ? '$'+(selectedGroup() as any).weekly_limit_usd : '无限' }}</p></div>
              </div>
              <div class="rounded-xl border border-white/10 bg-[#0a0e18] p-4"><label class="mb-1.5 block text-xs font-medium text-slate-400">描述</label><textarea v-model="form.description" rows="2" placeholder="套餐描述" class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"></textarea></div>
              <div class="rounded-xl border border-white/10 bg-[#0a0e18] p-4"><div class="grid grid-cols-2 gap-3"><div><label class="mb-1.5 block text-xs font-medium text-slate-400">价格 ($) <span class="text-red-400">*</span></label><input v-model.number="form.price" type="number" min="0.01" step="0.01" required class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div><div><label class="mb-1.5 block text-xs font-medium text-slate-400">原价 (可选)</label><input v-model.number="form.original_price" type="number" min="0" step="0.01" class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div></div></div>
              <div class="rounded-xl border border-white/10 bg-[#0a0e18] p-4"><div class="grid grid-cols-3 gap-3"><div><label class="mb-1.5 block text-xs font-medium text-slate-400">有效天数</label><input v-model.number="form.validity_days" type="number" min="1" class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div><div><label class="mb-1.5 block text-xs font-medium text-slate-400">单位</label><select v-model="form.validity_unit" class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"><option value="days">天</option><option value="weeks">周</option><option value="months">月</option></select></div><div><label class="mb-1.5 block text-xs font-medium text-slate-400">排序</label><input v-model.number="form.sort_order" type="number" min="0" class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div></div></div>
              <div class="rounded-xl border border-white/10 bg-[#0a0e18] p-4"><label class="mb-1.5 block text-xs font-medium text-slate-400">特性 (一行一个)</label><textarea v-model="form.features" rows="3" placeholder="每行一个特性" class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"></textarea></div>
              <div class="rounded-xl border border-white/10 bg-[#0a0e18] p-4"><label class="flex items-center gap-2 cursor-pointer"><input v-model="form.for_sale" type="checkbox" class="rounded border-white/20 bg-white/10" /><span class="text-xs text-slate-400">上架销售</span></label></div>
            </form>
            <footer class="flex-shrink-0 flex items-center justify-end gap-3 border-t border-white/10 px-6 py-4">
              <button type="button" class="rounded-full border border-white/10 px-5 py-2.5 text-sm font-bold text-slate-400 hover:border-indigo-500 hover:text-indigo-300" @click="showFormModal=false">取消</button>
              <button :disabled="saving" class="rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-2.5 text-sm font-black text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-50" @click="handleSubmit">{{ saving?'保存中...':(editingPlan?'保存':'创建') }}</button>
            </footer>
          </aside>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.drawer-enter-active,.drawer-leave-active{transition:all .25s ease}
.drawer-enter-active aside,.drawer-leave-active aside{transition:transform .25s ease}
.drawer-enter-from,.drawer-leave-to{opacity:0}
.drawer-enter-from aside,.drawer-leave-to aside{transform:translateX(100%)}
</style>
