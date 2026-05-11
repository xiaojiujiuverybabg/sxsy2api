<script setup lang="ts">
import type { PromoCode } from '@/types'

defineProps<{ promo: PromoCode }>()
const emit = defineEmits<{ (e: 'edit', p: PromoCode): void; (e: 'delete', p: PromoCode): void
  (e: 'toggleStatus', p: PromoCode): void; (e: 'usage', p: PromoCode): void; (e: 'copyLink', p: PromoCode): void }>()

function usagePercent(p: PromoCode) { return p.max_uses > 0 ? Math.min((p.used_count / p.max_uses) * 100, 100) : 0 }
function isExpired(p: PromoCode) { return p.expires_at && new Date(p.expires_at) < new Date() }
function statusBadge(p: PromoCode) {
  if (isExpired(p)) return 'bg-red-500/10 text-red-400 border-red-500/30'
  if (p.status === 'active') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
  return 'bg-slate-500/10 text-slate-400 border-slate-500/30'
}
</script>

<template>
  <div class="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-rose-500/30">
    <div class="relative p-5">
      <div class="flex items-start justify-between mb-3">
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-lg">🎁</div>
          <div class="min-w-0">
            <code class="text-sm font-bold text-white truncate block">{{ promo.code }}</code>
            <span :class="['inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold mt-1', statusBadge(promo)]">{{ isExpired(promo) ? '已过期' : promo.status === 'active' ? '活跃' : '禁用' }}</span>
          </div>
        </div>
      </div>
      <div class="mb-3 grid grid-cols-3 gap-2">
        <div class="rounded-lg bg-white/[0.04] p-2 text-center"><p class="text-[10px] font-bold uppercase text-slate-500">奖金</p><p class="mt-0.5 text-xs font-bold text-rose-400">${{ promo.bonus_amount.toFixed(2) }}</p></div>
        <div class="rounded-lg bg-white/[0.04] p-2 text-center"><p class="text-[10px] font-bold uppercase text-slate-500">使用</p><p class="mt-0.5 text-xs font-bold text-white">{{ promo.used_count }}<span v-if="promo.max_uses > 0" class="text-slate-500">/{{ promo.max_uses }}</span><span v-else class="text-slate-500">/∞</span></p></div>
        <div class="rounded-lg bg-white/[0.04] p-2 text-center"><p class="text-[10px] font-bold uppercase text-slate-500">过期</p><p class="mt-0.5 text-xs text-slate-400 truncate">{{ promo.expires_at ? new Date(promo.expires_at).toLocaleDateString('zh-CN') : '永久' }}</p></div>
      </div>
      <!-- Progress bar -->
      <div v-if="promo.max_uses > 0" class="mb-3 h-1.5 rounded-full bg-white/[0.06] overflow-hidden"><div class="h-full rounded-full bg-rose-500 transition-all" :style="{ width: `${usagePercent(promo)}%` }" /></div>
      <div class="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500 mb-3">
        <span>创建 {{ new Date(promo.created_at).toLocaleDateString('zh-CN') }}</span>
        <span v-if="promo.notes" class="truncate max-w-[150px]">{{ promo.notes }}</span>
      </div>
      <div class="flex items-center gap-1.5 border-t border-white/[0.06] pt-3">
        <button class="flex-1 rounded-lg bg-white/[0.05] px-2 py-1.5 text-[11px] text-slate-300 hover:bg-white/10 hover:text-white" @click.stop="emit('edit', promo)">编辑</button>
        <button class="flex-1 rounded-lg bg-white/[0.05] px-2 py-1.5 text-[11px] text-slate-300 hover:bg-white/10 hover:text-white" @click.stop="emit('usage', promo)">使用</button>
        <button class="flex-1 rounded-lg bg-white/[0.05] px-2 py-1.5 text-[11px] text-slate-300 hover:bg-white/10 hover:text-white" @click.stop="emit('copyLink', promo)">链接</button>
        <button :class="['flex-1 rounded-lg px-2 py-1.5 text-[11px] font-medium', promo.status === 'active' ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20']" @click.stop="emit('toggleStatus', promo)">{{ promo.status === 'active' ? '禁用' : '启用' }}</button>
        <button class="rounded-lg bg-white/[0.05] px-2 py-1.5 text-[11px] text-red-400/50 hover:bg-red-500/10 hover:text-red-400" @click.stop="emit('delete', promo)"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-3.5 w-3.5"><path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" /></svg></button>
      </div>
    </div>
  </div>
</template>
