<template>
  <label class="grid gap-2">
    <span class="text-xs font-black uppercase tracking-[0.22em] text-text-secondary">{{ label }}</span>
    <textarea
      v-if="textarea"
      :value="modelValue"
      class="min-h-28 rounded-[22px] border border-line bg-surface-card/80 px-4 py-3 text-sm font-semibold text-text-primary outline-none transition focus:border-brand-500"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
    <input
      v-else
      :value="modelValue"
      :type="type"
      class="rounded-[22px] border border-line bg-surface-card/80 px-4 py-3 text-sm font-semibold text-text-primary outline-none transition focus:border-brand-500"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </label>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    modelValue: string | number
    placeholder?: string
    type?: string
    textarea?: boolean
  }>(),
  {
    placeholder: '',
    type: 'text',
    textarea: false,
  },
)

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
