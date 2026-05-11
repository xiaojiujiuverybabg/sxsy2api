<script setup lang="ts">
withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
}>(), {
  placeholder: '选择日期时间',
  disabled: false,
  required: false,
})

const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()
</script>

<template>
  <input
    type="datetime-local"
    :value="modelValue"
    :disabled="disabled"
    :required="required"
    class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed [color-scheme:dark]"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>
