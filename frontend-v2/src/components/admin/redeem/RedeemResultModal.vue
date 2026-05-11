<script setup lang="ts">
import { ref, computed } from 'vue'
import type { RedeemCode } from '@/types'

const props = defineProps<{ show: boolean; codes: RedeemCode[] }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const copiedAll = ref(false)

const codeList = computed(() => props.codes.map(c => c.code).join('\n'))

async function copyAll() {
  try { await navigator.clipboard.writeText(codeList.value); copiedAll.value = true; setTimeout(() => copiedAll.value = false, 2000) }
  catch { /* ignore */ }
}

function download() {
  const blob = new Blob([codeList.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `redeem-codes-${new Date().toISOString().slice(0, 10)}.txt`; a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" @click.self="emit('close')">
      <div class="w-full max-w-lg rounded-2xl border border-white/10 bg-[#080b14] shadow-2xl">
        <div class="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div><p class="text-xs font-bold uppercase tracking-widest text-emerald-400">生成成功</p><h2 class="mt-1 text-xl font-black text-white">{{ codes.length }} 个兑换码</h2></div>
          <button class="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-slate-400 transition hover:border-emerald-500 hover:text-emerald-300" @click="emit('close')">关闭</button>
        </div>
        <div class="p-6 space-y-4">
          <textarea readonly rows="8" :value="codeList" class="w-full rounded-lg border border-white/10 bg-black/40 p-3 font-mono text-xs text-emerald-400 resize-none" />
          <div class="flex gap-3">
            <button class="flex-1 rounded-full border border-white/10 px-4 py-2.5 text-sm font-bold transition" :class="copiedAll ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:border-emerald-500/30 hover:text-emerald-400'" @click="copyAll">{{ copiedAll ? '已复制' : '复制全部' }}</button>
            <button class="flex-1 rounded-full border border-white/10 px-4 py-2.5 text-sm font-bold text-slate-400 transition hover:border-emerald-500/30 hover:text-emerald-400" @click="download">下载 .txt</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
