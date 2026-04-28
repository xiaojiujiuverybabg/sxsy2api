<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { Account } from '@/types'

const props = defineProps<{
  show: boolean
  account: Account | null
  loading: boolean
  output: string
  error: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'test', model: string): void
}>()

const selectedModel = ref('')
const terminalRef = ref<HTMLElement | null>(null)

watch(() => props.output, async () => {
  await nextTick()
  if (terminalRef.value) {
    terminalRef.value.scrollTop = terminalRef.value.scrollHeight
  }
})

watch(() => props.show, (val) => {
  if (val) {
    selectedModel.value = ''
  }
})

function runTest() {
  emit('test', selectedModel.value || '')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      @click.self="emit('close')"
    >
      <div class="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-white/10 bg-[#080b14] shadow-2xl">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <p class="text-xs font-bold uppercase tracking-widest text-brand-400">连接测试</p>
            <h2 class="mt-1 text-xl font-black text-white">{{ account?.name || '账号测试' }}</h2>
          </div>
          <button
            class="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-slate-400 transition hover:border-brand-500 hover:text-brand-300"
            @click="emit('close')"
          >
            关闭
          </button>
        </div>

        <!-- Controls -->
        <div class="flex items-center gap-3 border-b border-white/[0.06] px-6 py-3">
          <input
            v-model="selectedModel"
            type="text"
            placeholder="输入模型名称（可选，留空使用默认）"
            class="flex-1 rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white placeholder-slate-500 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            @keyup.enter="runTest"
          />
          <button
            :disabled="loading"
            class="shrink-0 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-2 text-sm font-black text-white shadow-lg shadow-brand-500/20 transition hover:from-brand-600 hover:to-brand-700 disabled:opacity-50"
            @click="runTest"
          >
            <span v-if="loading">测试中...</span>
            <span v-else>开始测试</span>
          </button>
        </div>

        <!-- Console output -->
        <div class="flex-1 overflow-hidden p-4">
          <div
            v-if="!output && !error"
            class="flex items-center justify-center h-full min-h-[200px]"
          >
            <div class="text-center">
              <p class="text-3xl mb-2">🔌</p>
              <p class="text-sm text-slate-500">选择模型后点击"开始测试"</p>
            </div>
          </div>

          <div
            v-else-if="error"
            class="flex items-center justify-center h-full min-h-[200px]"
          >
            <div class="text-center">
              <p class="text-3xl mb-2">❌</p>
              <p class="text-sm text-red-400">{{ error }}</p>
            </div>
          </div>

          <div
            v-else
            ref="terminalRef"
            class="h-full min-h-[200px] max-h-[400px] overflow-y-auto rounded-lg bg-black/60 p-4 font-mono text-xs text-green-400"
          >
            <pre class="whitespace-pre-wrap break-words">{{ output }}</pre>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
