<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
}>(), {
  placeholder: '选择日期时间',
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
}>()

const hiddenInput = ref<HTMLInputElement | null>(null)
const internalValue = ref(props.modelValue)

watch(() => props.modelValue, (v) => {
  internalValue.value = v
})

const displayText = computed(() => {
  if (!internalValue.value) return ''
  try {
    const d = new Date(internalValue.value)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
})

function openPicker() {
  if (props.disabled) return
  hiddenInput.value?.showPicker?.()
  hiddenInput.value?.click()
}

function handleChange(e: Event) {
  const target = e.target as HTMLInputElement
  internalValue.value = target.value
  emit('update:modelValue', target.value)
}

function clear() {
  internalValue.value = ''
  emit('update:modelValue', '')
}
</script>

<template>
  <div class="relative">
    <button
      type="button"
      :disabled="disabled"
      :class="[
        'group flex w-full items-center gap-2 rounded-lg border transition-all duration-200',
        'bg-[#0d1117]/80 px-3 py-2 text-sm',
        disabled ? 'opacity-50 cursor-not-allowed border-white/[0.04]' : 'cursor-pointer',
        internalValue
          ? 'border-brand-500/30 text-white'
          : 'border-white/10 text-slate-500',
        !disabled && 'hover:border-brand-500/40 focus-within:border-brand-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-brand-500/20'
      ]"
      @click="openPicker"
    >
      <!-- Calendar icon -->
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
        :class="['h-4 w-4 shrink-0 transition', internalValue ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-400']">
        <path fill-rule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clip-rule="evenodd" />
      </svg>

      <span class="flex-1 text-left truncate">{{ displayText || placeholder }}</span>

      <!-- Clear button -->
      <span
        v-if="internalValue && !disabled"
        class="shrink-0 rounded-full p-0.5 text-slate-500 transition hover:bg-white/10 hover:text-white"
        @click.stop="clear"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-3.5 w-3.5">
          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
        </svg>
      </span>
    </button>

    <!-- Hidden native input -->
    <input
      ref="hiddenInput"
      type="datetime-local"
      :value="internalValue"
      :required="required"
      class="sr-only"
      tabindex="-1"
      @change="handleChange"
    />
  </div>
</template>
