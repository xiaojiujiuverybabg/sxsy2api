<template>
  <section class="rounded-[32px] border border-white/10 bg-neutral-950/55 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="atlas-kicker">{{ eyebrow }}</p>
        <h2 class="mt-2 text-2xl font-black text-text-primary">{{ title }}</h2>
      </div>
      <slot name="badge" />
    </div>

    <div class="mt-5 grid gap-3">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
}>()
</script>
