<template>
  <article
    class="group rounded-[30px] border p-5 shadow-insetline backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-panel"
    :class="inverted ? 'border-white/10 bg-white/10 hover:bg-white/15' : 'border-white/70 bg-white/80 hover:bg-white'"
  >
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-xs font-black uppercase tracking-[0.26em]" :class="inverted ? 'text-white/50' : 'text-text-muted'">{{ label }}</p>
        <p class="mt-3 text-4xl font-black tracking-tight" :class="inverted ? 'text-white' : 'text-text-primary'">{{ value }}</p>
      </div>
      <span class="grid h-12 w-12 place-items-center rounded-2xl text-xl" :class="toneClass">
        {{ mark }}
      </span>
    </div>
    <p v-if="hint" class="mt-4 text-sm leading-6" :class="inverted ? 'text-white/60' : 'text-text-secondary'">{{ hint }}</p>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    label: string
    value: string | number
    mark?: string
    tone?: 'ember' | 'moss' | 'ink' | 'steel'
    hint?: string
    inverted?: boolean
  }>(),
  {
    mark: '•',
    tone: 'ember',
    inverted: false,
  },
)

const toneClass = computed(() => {
  const tones = {
    ember: 'bg-brand-100 text-brand-700',
    moss: 'bg-success-100 text-success-700',
    ink: 'bg-neutral-900 text-white',
    steel: 'bg-surface-soft text-text-secondary',
  }

  return tones[props.tone]
})
</script>
