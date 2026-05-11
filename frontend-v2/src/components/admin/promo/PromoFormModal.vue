<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PromoCode } from '@/types'
import DateTimePicker from '@/components/ui/DateTimePicker.vue'

const props = defineProps<{ show: boolean; editPromo?: PromoCode | null; loading: boolean }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'submit', data: Record<string, unknown>, isEdit: boolean): void }>()

const isEdit = ref(false)
const form = ref({ code: '', bonus_amount: 1, max_uses: 0, status: 'active' as string, expires_at: '', notes: '' })

watch(() => props.show, (val) => {
  if (!val) return
  if (props.editPromo) {
    isEdit.value = true
    const p = props.editPromo
    form.value = { code: p.code, bonus_amount: p.bonus_amount, max_uses: p.max_uses, status: p.status, expires_at: p.expires_at ? new Date(p.expires_at).toISOString().slice(0, 16) : '', notes: p.notes || '' }
  } else {
    isEdit.value = false
    form.value = { code: '', bonus_amount: 1, max_uses: 0, status: 'active', expires_at: '', notes: '' }
  }
})

function handleSubmit() {
  const payload: Record<string, unknown> = {
    bonus_amount: form.value.bonus_amount,
    max_uses: form.value.max_uses || 0,
    notes: form.value.notes || null,
  }
  if (form.value.code.trim()) payload.code = form.value.code.trim().toUpperCase()
  if (form.value.expires_at) payload.expires_at = Math.floor(new Date(form.value.expires_at).getTime() / 1000)
  else if (isEdit.value) payload.expires_at = null
  if (isEdit.value) payload.status = form.value.status
  emit('submit', payload, isEdit.value)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="show" class="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm" @click.self="emit('close')">
        <aside class="ml-auto flex h-full w-full max-w-lg flex-col border-l border-white/10 bg-[#080b14] shadow-2xl">
          <header class="flex-shrink-0 flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
            <div><p class="text-xs font-bold uppercase tracking-widest text-rose-400">{{ isEdit ? '编辑优惠码' : '新建优惠码' }}</p><h2 class="mt-1 text-2xl font-black text-white">{{ isEdit ? (form.code || '编辑') : '创建优惠码' }}</h2></div>
            <button class="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-slate-400 transition hover:border-rose-500 hover:text-rose-300" @click="emit('close')">关闭</button>
          </header>
          <form class="flex-1 overflow-y-auto bg-[#080b14] p-6 space-y-5" @submit.prevent="handleSubmit">
            <div class="rounded-xl border border-white/10 bg-[#0a0e18] p-4">
              <label class="mb-1.5 block text-xs font-medium text-slate-400">优惠码</label>
              <input v-model="form.code" type="text" :placeholder="isEdit ? '' : '留空则自动生成'" class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 font-mono text-sm text-white placeholder-slate-500 uppercase transition focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20" />
            </div>
            <div class="rounded-xl border border-white/10 bg-[#0a0e18] p-4">
              <label class="mb-1.5 block text-xs font-medium text-slate-400">奖金金额 ($) <span class="text-red-400">*</span></label>
              <input v-model.number="form.bonus_amount" type="number" min="0.01" step="0.01" required class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white transition focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20" />
            </div>
            <div class="rounded-xl border border-white/10 bg-[#0a0e18] p-4">
              <label class="mb-1.5 block text-xs font-medium text-slate-400">最大使用次数</label>
              <input v-model.number="form.max_uses" type="number" min="0" class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white transition focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20" />
              <p class="mt-1 text-[10px] text-slate-600">0 表示无限制</p>
            </div>
            <div v-if="isEdit" class="rounded-xl border border-white/10 bg-[#0a0e18] p-4">
              <label class="mb-1.5 block text-xs font-medium text-slate-400">状态</label>
              <select v-model="form.status" class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white transition focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"><option value="active">活跃</option><option value="disabled">禁用</option></select>
            </div>
            <div class="rounded-xl border border-white/10 bg-[#0a0e18] p-4">
              <label class="mb-1.5 block text-xs font-medium text-slate-400">过期时间</label>
              <DateTimePicker v-model="form.expires_at" placeholder="留空表示永不过期" />
            </div>
            <div class="rounded-xl border border-white/10 bg-[#0a0e18] p-4">
              <label class="mb-1.5 block text-xs font-medium text-slate-400">备注</label>
              <textarea v-model="form.notes" rows="2" placeholder="可选备注" class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white placeholder-slate-500 transition focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"></textarea>
            </div>
          </form>
          <footer class="flex-shrink-0 flex items-center justify-end gap-3 border-t border-white/10 px-6 py-4">
            <button type="button" class="rounded-full border border-white/10 px-5 py-2.5 text-sm font-bold text-slate-400 transition hover:border-rose-500 hover:text-rose-300" @click="emit('close')">取消</button>
            <button :disabled="loading || !form.bonus_amount" class="rounded-full bg-gradient-to-r from-rose-500 to-rose-600 px-6 py-2.5 text-sm font-black text-white shadow-lg shadow-rose-500/20 transition hover:from-rose-600 hover:to-rose-700 disabled:opacity-50" @click="handleSubmit">{{ loading ? '提交中...' : (isEdit ? '保存' : '创建') }}</button>
          </footer>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>
