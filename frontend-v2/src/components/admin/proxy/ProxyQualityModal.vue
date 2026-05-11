<script setup lang="ts">
defineProps<{
  show: boolean
  proxyName: string
  loading: boolean
  result: Record<string, unknown> | null
  error: string
}>()

const emit = defineEmits<{ (e: 'close'): void }>()

function itemLabel(t: string) {
  const m: Record<string, string> = { base_connectivity: '基础连通性', openai: 'OpenAI', anthropic: 'Anthropic', gemini: 'Gemini' }
  return m[t] || t
}
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" @click.self="emit('close')">
      <div class="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#080b14] shadow-2xl">
        <div class="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <p class="text-xs font-bold uppercase tracking-widest text-violet-400">质量检查</p>
            <h2 class="mt-1 text-xl font-black text-white truncate">{{ proxyName }}</h2>
          </div>
          <button class="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-slate-400 transition hover:border-violet-500 hover:text-violet-300" @click="emit('close')">关闭</button>
        </div>
        <div class="p-6">
          <div v-if="loading" class="flex items-center justify-center py-12">
            <div class="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-violet-500"></div>
            <p class="text-sm text-slate-400 ml-3">检查中...</p>
          </div>
          <div v-else-if="error" class="text-center py-8">
            <p class="text-sm text-red-400">{{ error }}</p>
          </div>
          <div v-else-if="result">
            <!-- Summary -->
            <div class="grid grid-cols-4 gap-3 mb-5">
              <div class="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500">评分</p>
                <p class="mt-1 text-xl font-black text-white">{{ result.score }}</p>
              </div>
              <div class="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500">等级</p>
                <p class="mt-1 text-xl font-black text-white">{{ result.grade }}</p>
              </div>
              <div class="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500">通过</p>
                <p class="mt-1 text-lg font-black text-emerald-400">{{ result.passed_count }}</p>
              </div>
              <div class="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500">失败</p>
                <p class="mt-1 text-lg font-black text-red-400">{{ result.failed_count }}</p>
              </div>
            </div>
            <p v-if="result.summary" class="mb-4 text-xs text-slate-400">{{ result.summary }}</p>
            <!-- Items table -->
            <div v-if="(result.items as any[])?.length">
              <table class="w-full text-xs">
                <thead class="border-b border-white/[0.06]">
                  <tr>
                    <th class="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">目标</th>
                    <th class="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">状态</th>
                    <th class="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">延迟</th>
                    <th class="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">信息</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/[0.04]">
                  <tr v-for="item in (result.items as any[])" :key="item.target">
                    <td class="px-3 py-2 text-white">{{ itemLabel(item.target) }}</td>
                    <td class="px-3 py-2">
                      <span :class="['inline-block rounded-full px-2 py-0.5 text-[10px] font-bold', item.status === 'pass' ? 'bg-emerald-500/10 text-emerald-400' : item.status === 'warn' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400']">{{ item.status }}</span>
                    </td>
                    <td class="px-3 py-2 text-slate-400">{{ item.latency_ms ? `${item.latency_ms}ms` : '-' }}</td>
                    <td class="px-3 py-2 text-slate-500 max-w-[200px] truncate">{{ item.message || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
