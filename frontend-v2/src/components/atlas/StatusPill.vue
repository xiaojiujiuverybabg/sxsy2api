<template>
  <span class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black" :class="toneClass">
    <span class="h-1.5 w-1.5 rounded-full" :class="dotClass"></span>
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    label: string
    tone?: 'success' | 'warning' | 'danger' | 'neutral' | 'light'
  }>(),
  {
    tone: 'neutral',
  },
)

const toneClass = computed(() => {
  const tones = {
    success: 'bg-success-100 text-success-700',
    warning: 'bg-warning-100 text-warning-700',
    danger: 'bg-danger-100 text-danger-700',
    neutral: 'bg-surface-soft text-text-secondary',
    light: 'bg-white/15 text-white',
  }

  return tones[props.tone]
})

const dotClass = computed(() => {
  const tones = {
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-danger-500',
    neutral: 'bg-neutral-500',
    light: 'bg-white',
  }

  return tones[props.tone]
})
</script>
