<template>
  <RouterLink
    v-if="to"
    :to="to"
    class="group flex items-center justify-between gap-4 rounded-[24px] border px-4 py-4 text-left transition duration-300"
    :class="buttonClass"
  >
    <span>
      <strong class="block text-sm font-black">{{ label }}</strong>
      <small v-if="description" class="mt-1 block text-xs leading-5 opacity-70">{{ description }}</small>
    </span>
    <span class="transition group-hover:translate-x-1">→</span>
  </RouterLink>

  <button
    v-else
    type="button"
    class="group flex items-center justify-between gap-4 rounded-[24px] border px-4 py-4 text-left transition duration-300"
    :class="buttonClass"
  >
    <span>
      <strong class="block text-sm font-black">{{ label }}</strong>
      <small v-if="description" class="mt-1 block text-xs leading-5 opacity-70">{{ description }}</small>
    </span>
    <span class="transition group-hover:translate-x-1">→</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = withDefaults(
  defineProps<{
    label: string
    description?: string
    to?: string
    tone?: 'primary' | 'ghost'
  }>(),
  {
    tone: 'ghost',
  },
)

const buttonClass = computed(() => {
  if (props.tone === 'primary') {
    return 'border-brand-500 bg-brand-500 text-white hover:border-brand-700 hover:bg-brand-700'
  }

  return 'border-white/10 bg-white/[0.04] text-text-secondary hover:border-brand-500/50 hover:bg-brand-500/[0.08] hover:text-brand-300'
})
</script>
