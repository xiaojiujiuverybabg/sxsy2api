<template>
  <article class="relative overflow-hidden rounded-[32px] p-5 text-white shadow-panel transition duration-300 hover:-translate-y-1" :class="cardClass">
    <div class="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/16 blur-2xl"></div>
    <div class="relative">
      <div class="flex items-start justify-between gap-4">
        <span class="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 text-xl">{{ mark }}</span>
        <StatusPill :label="status" tone="light" />
      </div>
      <h3 class="mt-7 text-2xl font-black leading-tight">{{ title }}</h3>
      <p class="mt-3 text-sm leading-7 text-white/68">{{ description }}</p>
      <slot />
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import StatusPill from './StatusPill.vue'

const props = withDefaults(
  defineProps<{
    title: string
    description: string
    mark?: string
    status?: string
    tone?: 'ember' | 'ink' | 'moss' | 'steel'
  }>(),
  {
    mark: '✦',
    status: 'Ready',
    tone: 'ink',
  },
)

const cardClass = computed(() => {
  const tones = {
    ember: 'bg-brand-500 hover:bg-brand-700',
    ink: 'bg-neutral-900 hover:bg-neutral-700',
    moss: 'bg-success-500 hover:bg-success-700',
    steel: 'bg-neutral-700 hover:bg-neutral-900',
  }

  return tones[props.tone]
})
</script>
