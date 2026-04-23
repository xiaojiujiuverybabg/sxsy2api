<template>
  <article class="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-brand-500/50 hover:bg-brand-500/[0.07]">
    <div class="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-brand-500/10 blur-2xl transition group-hover:bg-brand-500/20"></div>
    <div class="relative">
      <div class="flex items-start justify-between gap-3">
        <span class="grid h-10 w-10 place-items-center rounded-2xl border border-brand-500/20 bg-brand-500/10 text-sm font-black text-brand-300">{{ mark }}</span>
        <slot name="badge" />
      </div>
      <h3 class="mt-5 text-lg font-black text-text-primary">{{ title }}</h3>
      <p class="mt-2 text-sm leading-6 text-text-secondary">{{ description }}</p>
      <div v-if="$slots.default" class="mt-5">
        <slot />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    description: string
    mark?: string
  }>(),
  {
    mark: '•',
  },
)
</script>
