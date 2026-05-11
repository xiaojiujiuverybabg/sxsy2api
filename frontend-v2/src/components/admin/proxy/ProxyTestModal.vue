<script setup lang="ts">
defineProps<{
  show: boolean
  proxyName: string
  loading: boolean
  result: Record<string, unknown> | null
  error: string
}>()

const emit = defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" @click.self="emit('close')">
      <div class="w-full max-w-lg rounded-2xl border border-white/10 bg-[#080b14] shadow-2xl">
        <div class="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <p class="text-xs font-bold uppercase tracking-widest text-violet-400">连接测试</p>
            <h2 class="mt-1 text-xl font-black text-white truncate">{{ proxyName }}</h2>
          </div>
          <button class="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-slate-400 transition hover:border-violet-500 hover:text-violet-300" @click="emit('close')">关闭</button>
        </div>
        <div class="p-6">
          <div v-if="loading" class="flex items-center justify-center py-12">
            <div class="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-violet-500"></div>
            <p class="text-sm text-slate-400 ml-3">测试中...</p>
          </div>
          <div v-else-if="error" class="text-center py-8">
            <p class="text-3xl mb-2">❌</p>
            <p class="text-sm text-red-400">{{ error }}</p>
          </div>
          <div v-else-if="result" class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <div class="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500">状态</p>
                <p :class="['mt-1 text-sm font-bold', result.success !== false ? 'text-emerald-400' : 'text-red-400']">{{ result.success !== false ? '成功' : '失败' }}</p>
              </div>
              <div class="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500">延迟</p>
                <p class="mt-1 text-sm font-bold text-white">{{ result.latency_ms ? `${result.latency_ms}ms` : '-' }}</p>
              </div>
              <div class="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500">IP</p>
                <p class="mt-1 text-sm font-bold text-white">{{ result.ip_address || '-' }}</p>
              </div>
              <div class="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500">位置</p>
                <p class="mt-1 text-sm font-bold text-white">{{ [result.city, result.region, result.country].filter(Boolean).join(', ') || '-' }}</p>
              </div>
            </div>
            <p v-if="result.message" class="text-xs text-slate-400">{{ result.message }}</p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
