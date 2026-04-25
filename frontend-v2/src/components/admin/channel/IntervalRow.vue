<template>
  <div class="flex items-start gap-2 rounded border p-2"
       :class="isEmpty ? 'border-red-500/50 bg-red-500/10' : 'border-slate-700/50 bg-slate-900/50'">
    <!-- Token mode: context range + prices ($/MTok) -->
    <template v-if="mode === 'token'">
      <div class="w-20">
        <label class="text-xs text-slate-400">Min</label>
        <input :value="interval.min_tokens" @input="emitField('min_tokens', toInt(($event.target as HTMLInputElement).value))"
          type="number" min="0" class="w-full rounded border border-slate-700/50 bg-slate-900/50 px-2 py-1 text-xs text-white mt-0.5" />
      </div>
      <div class="w-20">
        <label class="text-xs text-slate-400">Max <span class="text-slate-500">(含)</span></label>
        <input :value="interval.max_tokens ?? ''" @input="emitField('max_tokens', toIntOrNull(($event.target as HTMLInputElement).value))"
          type="number" min="0" class="w-full rounded border border-slate-700/50 bg-slate-900/50 px-2 py-1 text-xs text-white mt-0.5" placeholder="∞" />
      </div>
      <div class="flex-1">
        <label class="text-xs text-slate-400">输入 <span v-if="isEmpty" class="text-red-400">*</span> <span class="text-slate-500">$/M</span></label>
        <input :value="interval.input_price" @input="emitField('input_price', ($event.target as HTMLInputElement).value)"
          type="number" step="any" min="0" class="w-full rounded border border-slate-700/50 bg-slate-900/50 px-2 py-1 text-xs text-white mt-0.5" />
      </div>
      <div class="flex-1">
        <label class="text-xs text-slate-400">输出 <span v-if="isEmpty" class="text-red-400">*</span> <span class="text-slate-500">$/M</span></label>
        <input :value="interval.output_price" @input="emitField('output_price', ($event.target as HTMLInputElement).value)"
          type="number" step="any" min="0" class="w-full rounded border border-slate-700/50 bg-slate-900/50 px-2 py-1 text-xs text-white mt-0.5" />
      </div>
      <div class="flex-1">
        <label class="text-xs text-slate-400">缓存W <span class="text-slate-500">$/M</span></label>
        <input :value="interval.cache_write_price" @input="emitField('cache_write_price', ($event.target as HTMLInputElement).value)"
          type="number" step="any" min="0" class="w-full rounded border border-slate-700/50 bg-slate-900/50 px-2 py-1 text-xs text-white mt-0.5" />
      </div>
      <div class="flex-1">
        <label class="text-xs text-slate-400">缓存R <span class="text-slate-500">$/M</span></label>
        <input :value="interval.cache_read_price" @input="emitField('cache_read_price', ($event.target as HTMLInputElement).value)"
          type="number" step="any" min="0" class="w-full rounded border border-slate-700/50 bg-slate-900/50 px-2 py-1 text-xs text-white mt-0.5" />
      </div>
    </template>

    <!-- Per-request / Image mode: tier label + context range + price -->
    <template v-else>
      <div class="w-24">
        <label class="text-xs text-slate-400">
          {{ mode === 'image' ? '分辨率' : '层级' }}
        </label>
        <input :value="interval.tier_label" @input="emitField('tier_label', ($event.target as HTMLInputElement).value)"
          type="text" class="w-full rounded border border-slate-700/50 bg-slate-900/50 px-2 py-1 text-xs text-white mt-0.5" :placeholder="mode === 'image' ? '1K / 2K / 4K' : ''" />
      </div>
      <div class="w-20">
        <label class="text-xs text-slate-400">Min</label>
        <input :value="interval.min_tokens" @input="emitField('min_tokens', toInt(($event.target as HTMLInputElement).value))"
          type="number" min="0" class="w-full rounded border border-slate-700/50 bg-slate-900/50 px-2 py-1 text-xs text-white mt-0.5" />
      </div>
      <div class="w-20">
        <label class="text-xs text-slate-400">Max <span class="text-slate-500">(含)</span></label>
        <input :value="interval.max_tokens ?? ''" @input="emitField('max_tokens', toIntOrNull(($event.target as HTMLInputElement).value))"
          type="number" min="0" class="w-full rounded border border-slate-700/50 bg-slate-900/50 px-2 py-1 text-xs text-white mt-0.5" placeholder="∞" />
      </div>
      <div class="flex-1">
        <label class="text-xs text-slate-400">单次价格 <span v-if="isEmpty" class="text-red-400">*</span> <span class="text-slate-500">$</span></label>
        <input :value="interval.per_request_price" @input="emitField('per_request_price', ($event.target as HTMLInputElement).value)"
          type="number" step="any" min="0" class="w-full rounded border border-slate-700/50 bg-slate-900/50 px-2 py-1 text-xs text-white mt-0.5" />
      </div>
    </template>

    <button type="button" @click="emit('remove')" class="mt-4 rounded p-0.5 text-slate-400 hover:text-red-400">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { IntervalFormEntry } from '@/types/channels'
import type { BillingMode } from '@/types/channels'

const props = defineProps<{
  interval: IntervalFormEntry
  mode: BillingMode
}>()

const emit = defineEmits<{
  update: [interval: IntervalFormEntry]
  remove: []
}>()

const isEmpty = computed(() => {
  const iv = props.interval
  return (iv.input_price == null || iv.input_price === '') &&
    (iv.output_price == null || iv.output_price === '') &&
    (iv.cache_write_price == null || iv.cache_write_price === '') &&
    (iv.cache_read_price == null || iv.cache_read_price === '') &&
    (iv.per_request_price == null || iv.per_request_price === '')
})

function emitField(field: keyof IntervalFormEntry, value: string | number | null) {
  emit('update', { ...props.interval, [field]: value === '' ? null : value })
}

function toInt(val: string): number {
  const n = parseInt(val, 10)
  return isNaN(n) ? 0 : n
}

function toIntOrNull(val: string): number | null {
  if (val === '') return null
  const n = parseInt(val, 10)
  return isNaN(n) ? null : n
}
</script>
