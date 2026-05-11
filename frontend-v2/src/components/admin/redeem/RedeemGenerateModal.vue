<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { AdminGroup } from '@/types'

const props = defineProps<{
  show: boolean
  groups: AdminGroup[]
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'generate', data: Record<string, unknown>): void
}>()

const form = ref({
  type: 'balance' as string,
  value: 10,
  count: 1,
  group_id: null as number | null,
  validity_days: 30,
})

watch(() => form.value.type, (t) => {
  if (t === 'invitation') form.value.value = 0
  else if (form.value.value === 0) form.value.value = 10
})

watch(() => props.show, (val) => {
  if (val) form.value = { type: 'balance', value: 10, count: 1, group_id: null, validity_days: 30 }
})

const subscriptionGroups = computed(() => props.groups.filter(g => (g as any).subscription_type === 'subscription'))

function handleSubmit() {
  const payload: Record<string, unknown> = {
    type: form.value.type,
    count: form.value.count,
  }
  if (form.value.type === 'subscription') {
    payload.group_id = form.value.group_id
    payload.validity_days = form.value.validity_days
  } else if (form.value.type !== 'invitation') {
    payload.value = form.value.value
  }
  emit('generate', payload)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="show" class="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm" @click.self="emit('close')">
        <aside class="ml-auto flex h-full w-full max-w-lg flex-col border-l border-white/10 bg-[#080b14] shadow-2xl">
          <header class="flex-shrink-0 flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
            <div><p class="text-xs font-bold uppercase tracking-widest text-emerald-400">生成兑换码</p><h2 class="mt-1 text-2xl font-black text-white">批量生成</h2></div>
            <button class="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-slate-400 transition hover:border-emerald-500 hover:text-emerald-300" @click="emit('close')">关闭</button>
          </header>
          <form class="flex-1 overflow-y-auto bg-[#080b14] p-6 space-y-5" @submit.prevent="handleSubmit">
            <div class="rounded-xl border border-white/10 bg-[#0a0e18] p-4">
              <label class="mb-1.5 block text-xs font-medium text-slate-400">类型</label>
              <select v-model="form.type" class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                <option value="balance">余额</option>
                <option value="concurrency">并发数</option>
                <option value="subscription">订阅</option>
                <option value="invitation">邀请码</option>
              </select>
            </div>

            <div v-if="form.type === 'invitation'" class="rounded-xl border border-blue-500/20 bg-blue-500/[0.04] p-4">
              <p class="text-xs text-blue-300/80">邀请码类型无需设置数值，系统将自动处理注册邀请逻辑。</p>
            </div>

            <div v-else-if="form.type !== 'subscription'" class="rounded-xl border border-white/10 bg-[#0a0e18] p-4">
              <label class="mb-1.5 block text-xs font-medium text-slate-400">{{ form.type === 'balance' ? '金额 ($)' : '并发数' }}</label>
              <input v-model.number="form.value" type="number" :min="form.type === 'balance' ? 0.01 : 1" :step="form.type === 'balance' ? 0.01 : 1" class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </div>

            <template v-if="form.type === 'subscription'">
              <div class="rounded-xl border border-white/10 bg-[#0a0e18] p-4">
                <label class="mb-1.5 block text-xs font-medium text-slate-400">订阅分组 <span class="text-red-400">*</span></label>
                <select v-model.number="form.group_id" required class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                  <option :value="null" disabled>选择分组</option>
                  <option v-for="g in subscriptionGroups" :key="g.id" :value="g.id">{{ g.name }} ({{ g.platform }})</option>
                </select>
                <p v-if="subscriptionGroups.length === 0" class="mt-2 text-[10px] text-amber-400/70">没有可用的订阅分组</p>
              </div>
              <div class="rounded-xl border border-white/10 bg-[#0a0e18] p-4">
                <label class="mb-1.5 block text-xs font-medium text-slate-400">有效天数</label>
                <input v-model.number="form.validity_days" type="number" min="1" max="365" class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
              </div>
            </template>

            <div class="rounded-xl border border-white/10 bg-[#0a0e18] p-4">
              <label class="mb-1.5 block text-xs font-medium text-slate-400">生成数量</label>
              <input v-model.number="form.count" type="number" min="1" max="100" class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </div>
          </form>
          <footer class="flex-shrink-0 flex items-center justify-end gap-3 border-t border-white/10 px-6 py-4">
            <button type="button" class="rounded-full border border-white/10 px-5 py-2.5 text-sm font-bold text-slate-400 transition hover:border-emerald-500 hover:text-emerald-300" @click="emit('close')">取消</button>
            <button :disabled="loading || (form.type === 'subscription' && !form.group_id)" class="rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-2.5 text-sm font-black text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50" @click="handleSubmit">{{ loading ? '生成中...' : `生成 ${form.count} 个` }}</button>
          </footer>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-enter-active, .drawer-leave-active { transition: all 0.25s ease; }
.drawer-enter-active aside, .drawer-leave-active aside { transition: transform 0.25s ease; }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }
.drawer-enter-from aside, .drawer-leave-to aside { transform: translateX(100%); }
</style>
