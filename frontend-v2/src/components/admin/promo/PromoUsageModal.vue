<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import type { PromoCode } from '@/types'
import { adminAPI } from '@/api/admin'
import { showError } from '@/utils/toast'

const props = defineProps<{ show: boolean; promo: PromoCode | null }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const loading = ref(false)
const usages = ref<Record<string, unknown>[]>([])
const page = ref(1)
const total = ref(0)
const pages = ref(0)
let abortController: AbortController | null = null

watch(() => props.show, async (val) => {
  if (val && props.promo) { page.value = 1; await loadUsages() }
})

async function loadUsages() {
  if (!props.promo) return
  if (abortController) abortController.abort()
  const ctrl = new AbortController(); abortController = ctrl
  loading.value = true
  try {
    const resp = await adminAPI.promo.getUsages(props.promo.id, page.value, 20, { signal: ctrl.signal })
    if (ctrl.signal.aborted) return
    usages.value = resp.items; total.value = resp.total; pages.value = resp.pages
  } catch (e: any) { if (e?.name !== 'AbortError') showError('加载使用记录失败') }
  finally { if (abortController === ctrl) { loading.value = false; abortController = null } }
}

function goPage(p: number) { if (p < 1 || p > pages.value) return; page.value = p; loadUsages() }

onUnmounted(() => { if (abortController) abortController.abort() })
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" @click.self="emit('close')">
      <div class="w-full max-w-xl max-h-[80vh] flex flex-col rounded-2xl border border-white/10 bg-[#080b14] shadow-2xl">
        <div class="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div><p class="text-xs font-bold uppercase tracking-widest text-rose-400">使用记录</p><h2 class="mt-1 text-xl font-black text-white font-mono">{{ promo?.code }}</h2></div>
          <button class="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-slate-400 transition hover:border-rose-500 hover:text-rose-300" @click="emit('close')">关闭</button>
        </div>
        <div class="flex-1 overflow-y-auto p-4">
          <div v-if="loading" class="flex items-center justify-center py-12"><div class="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-rose-500"></div></div>
          <div v-else-if="usages.length === 0" class="text-center py-12"><p class="text-sm text-slate-500">暂无使用记录</p></div>
          <div v-else class="space-y-2">
            <div v-for="u in usages" :key="u.id as number" class="flex items-center justify-between rounded-lg bg-white/[0.03] p-3">
              <div><p class="text-sm font-bold text-white">{{ (u.user as any)?.email || `用户 #${u.user_id}` }}</p><p class="text-[10px] text-slate-500">{{ new Date(u.used_at as string).toLocaleString('zh-CN') }}</p></div>
              <span class="text-sm font-black text-rose-400">+${{ Number(u.bonus_amount || 0).toFixed(2) }}</span>
            </div>
          </div>
        </div>
        <div v-if="total > 0" class="flex items-center justify-between border-t border-white/[0.06] px-6 py-3">
          <span class="text-xs text-slate-500">共 {{ total }} 条</span>
          <div class="flex items-center gap-3">
            <button :disabled="page <= 1" class="rounded-lg border border-white/10 px-3 py-1 text-xs text-slate-400 hover:border-rose-500/30 hover:text-rose-400 disabled:opacity-30" @click="goPage(page - 1)">上一页</button>
            <span class="text-xs text-slate-400">{{ page }}/{{ pages }}</span>
            <button :disabled="page >= pages" class="rounded-lg border border-white/10 px-3 py-1 text-xs text-slate-400 hover:border-rose-500/30 hover:text-rose-400 disabled:opacity-30" @click="goPage(page + 1)">下一页</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
