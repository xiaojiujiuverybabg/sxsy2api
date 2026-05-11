<script setup lang="ts">
import { ref } from 'vue'
import type { Proxy } from '@/types'

defineProps<{ proxy: Proxy }>()

const emit = defineEmits<{
  (e: 'edit', p: Proxy): void
  (e: 'delete', p: Proxy): void
  (e: 'toggleStatus', p: Proxy): void
  (e: 'test', p: Proxy): void
  (e: 'quality', p: Proxy): void
  (e: 'viewAccounts', p: Proxy): void
}>()

const showPassword = ref(false)

function protocolColor(p: string) {
  if (p === 'socks5' || p === 'socks5h') return 'bg-violet-500/10 text-violet-400 border-violet-500/30'
  if (p === 'https') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
  return 'bg-slate-500/10 text-slate-400 border-slate-500/30'
}

function latencyColor(ms: number | undefined) {
  if (!ms) return 'text-slate-500'
  if (ms < 200) return 'text-emerald-400'
  if (ms < 500) return 'text-amber-400'
  return 'text-red-400'
}

function copyAddress(p: Proxy) {
  let addr = `${p.protocol}://`
  if (p.username) addr += `${p.username}${p.password ? `:${p.password}` : ''}@`
  addr += `${p.host}:${p.port}`
  navigator.clipboard.writeText(addr)
}
</script>

<template>
  <div class="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-500/30">
    <div class="relative p-5">
      <!-- Header -->
      <div class="flex items-start justify-between mb-3">
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-lg">🛡️</div>
          <div class="min-w-0">
            <h3 class="text-sm font-bold text-white truncate">{{ proxy.name }}</h3>
            <div class="flex items-center gap-1.5 mt-0.5">
              <span :class="['inline-block h-1.5 w-1.5 rounded-full', proxy.status === 'active' ? 'bg-emerald-400' : 'bg-slate-500']" />
              <span class="text-[11px] text-slate-400">{{ proxy.status === 'active' ? '活跃' : '未激活' }}</span>
            </div>
          </div>
        </div>
        <span :class="['shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase', protocolColor(proxy.protocol)]">
          {{ proxy.protocol }}
        </span>
      </div>

      <!-- Address -->
      <div class="mb-3 flex items-center gap-2 rounded-lg bg-black/30 px-3 py-2 font-mono text-xs text-slate-300">
        <span class="truncate">{{ proxy.host }}:{{ proxy.port }}</span>
        <button class="shrink-0 text-slate-500 hover:text-white transition" @click="copyAddress(proxy)" title="复制地址">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-3.5 w-3.5"><path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" /><path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" /></svg>
        </button>
      </div>

      <!-- Auth -->
      <div v-if="proxy.username" class="mb-3 flex items-center gap-2 text-[11px] text-slate-400">
        <span class="text-slate-500">🔑</span>
        <span>{{ proxy.username }}</span>
        <template v-if="proxy.password">
          <span class="text-slate-600">:</span>
          <span class="font-mono">{{ showPassword ? proxy.password : '••••••' }}</span>
          <button class="text-slate-500 hover:text-white transition" @click="showPassword = !showPassword">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-3 w-3"><path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" /><path fill-rule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" /></svg>
          </button>
        </template>
      </div>

      <!-- Stats row -->
      <div class="mb-3 grid grid-cols-3 gap-2">
        <div class="rounded-lg bg-white/[0.04] p-2 text-center">
          <p class="text-[10px] font-bold uppercase tracking-wider text-slate-500">延迟</p>
          <p :class="['mt-0.5 text-xs font-bold', latencyColor(proxy.latency_ms)]">
            {{ proxy.latency_ms ? `${proxy.latency_ms}ms` : '-' }}
          </p>
        </div>
        <div
          class="rounded-lg p-2 text-center cursor-pointer transition"
          :class="(proxy.account_count || 0) > 0 ? 'bg-violet-500/[0.06] hover:bg-violet-500/10' : 'bg-white/[0.04]'"
          @click="(proxy.account_count || 0) > 0 && emit('viewAccounts', proxy)"
        >
          <p class="text-[10px] font-bold uppercase tracking-wider text-slate-500">关联账号</p>
          <p class="mt-0.5 text-xs font-bold text-white">{{ proxy.account_count || 0 }}</p>
        </div>
        <div class="rounded-lg bg-white/[0.04] p-2 text-center">
          <p class="text-[10px] font-bold uppercase tracking-wider text-slate-500">质量</p>
          <p :class="['mt-0.5 text-xs font-bold', proxy.quality_status === 'healthy' ? 'text-emerald-400' : proxy.quality_status === 'warn' ? 'text-amber-400' : proxy.quality_status ? 'text-red-400' : 'text-slate-500']">
            {{ proxy.quality_grade || '-' }}
          </p>
        </div>
      </div>

      <!-- Info row -->
      <div class="mb-4 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500">
        <span v-if="proxy.country">{{ proxy.country_code ? '🏳️' : '' }} {{ proxy.city || '' }} {{ proxy.country || '' }}</span>
        <span v-if="proxy.ip_address">{{ proxy.ip_address }}</span>
        <span>{{ new Date(proxy.created_at).toLocaleDateString('zh-CN') }}</span>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-1.5 border-t border-white/[0.06] pt-3">
        <button class="flex-1 rounded-lg bg-white/[0.05] px-2 py-1.5 text-[11px] font-medium text-slate-300 transition hover:bg-white/10 hover:text-white" @click.stop="emit('edit', proxy)">编辑</button>
        <button class="flex-1 rounded-lg bg-white/[0.05] px-2 py-1.5 text-[11px] font-medium text-slate-300 transition hover:bg-white/10 hover:text-white" @click.stop="emit('test', proxy)">测试</button>
        <button class="flex-1 rounded-lg bg-white/[0.05] px-2 py-1.5 text-[11px] font-medium text-slate-300 transition hover:bg-white/10 hover:text-white" @click.stop="emit('quality', proxy)">质检</button>
        <button
          :class="['flex-1 rounded-lg px-2 py-1.5 text-[11px] font-medium transition', proxy.status === 'active' ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20']"
          @click.stop="emit('toggleStatus', proxy)"
        >{{ proxy.status === 'active' ? '停用' : '启用' }}</button>
        <button class="rounded-lg bg-white/[0.05] px-2 py-1.5 text-[11px] font-medium text-red-400/50 transition hover:bg-red-500/10 hover:text-red-400" @click.stop="emit('delete', proxy)">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-3.5 w-3.5"><path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" /></svg>
        </button>
      </div>
    </div>
  </div>
</template>
