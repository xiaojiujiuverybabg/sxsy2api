<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Proxy } from '@/types'
import { adminAPI } from '@/api/admin'

const props = defineProps<{
  show: boolean
  proxy: Proxy | null
}>()

const emit = defineEmits<{ (e: 'close'): void }>()

const loading = ref(false)
const accounts = ref<Record<string, unknown>[]>([])
const error = ref('')

watch(() => props.show, async (val) => {
  if (val && props.proxy) {
    loading.value = true
    error.value = ''
    try {
      accounts.value = await adminAPI.proxies.getProxyAccounts(props.proxy.id)
    } catch (e: any) {
      error.value = e?.message || '加载失败'
    } finally {
      loading.value = false
    }
  }
})
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" @click.self="emit('close')">
      <div class="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#080b14] shadow-2xl">
        <div class="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <p class="text-xs font-bold uppercase tracking-widest text-violet-400">关联账号</p>
            <h2 class="mt-1 text-xl font-black text-white">{{ proxy?.name }}</h2>
          </div>
          <button class="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-slate-400 transition hover:border-violet-500 hover:text-violet-300" @click="emit('close')">关闭</button>
        </div>
        <div class="p-6">
          <div v-if="loading" class="flex items-center justify-center py-12">
            <div class="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-violet-500"></div>
            <p class="text-sm text-slate-400 ml-3">加载中...</p>
          </div>
          <div v-else-if="error" class="text-center py-8">
            <p class="text-sm text-red-400">{{ error }}</p>
          </div>
          <div v-else-if="accounts.length === 0" class="text-center py-8">
            <p class="text-sm text-slate-500">暂无关联账号</p>
          </div>
          <table v-else class="w-full text-xs">
            <thead class="border-b border-white/[0.06]">
              <tr>
                <th class="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">账号</th>
                <th class="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">平台</th>
                <th class="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">类型</th>
                <th class="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">备注</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/[0.04]">
              <tr v-for="a in accounts" :key="a.id as number">
                <td class="px-3 py-2 text-white font-bold">{{ a.name }}</td>
                <td class="px-3 py-2 text-slate-300">{{ a.platform }}</td>
                <td class="px-3 py-2"><span class="rounded-full bg-white/[0.08] px-2 py-0.5 text-[10px] font-bold uppercase text-slate-400">{{ a.type }}</span></td>
                <td class="px-3 py-2 text-slate-500 truncate max-w-[150px]">{{ (a.notes as string) || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </Teleport>
</template>
