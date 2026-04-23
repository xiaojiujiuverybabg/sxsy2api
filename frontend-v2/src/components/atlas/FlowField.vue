<template>
  <label class="group block rounded-2xl border border-white/10 bg-surface-card/40 p-4 shadow-[0_4px_16px_rgba(0,0,0,0.2)] backdrop-blur-xl transition duration-300 focus-within:-translate-y-0.5 focus-within:border-brand-500/50 focus-within:bg-surface-card/60 focus-within:shadow-[0_0_20px_rgba(220,38,38,0.15)]">
    <span class="text-[0.68rem] font-bold uppercase tracking-[0.28em] text-text-muted transition group-focus-within:text-brand-400">{{ label }}</span>
    <input
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      class="mt-2 w-full bg-transparent text-lg font-bold text-white outline-none placeholder:text-text-muted/50"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </label>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue?: string
    label: string
    placeholder?: string
    type?: string
  }>(),
  {
    modelValue: '',
    placeholder: '',
    type: 'text',
  },
)

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
