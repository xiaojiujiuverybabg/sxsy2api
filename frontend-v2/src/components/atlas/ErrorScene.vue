<template>
  <section class="rounded-[34px] border border-red-200 bg-red-50/80 p-8 shadow-insetline">
    <p class="text-xs font-black uppercase tracking-[0.32em] text-red-700">Recovery</p>
    <h2 class="mt-3 text-3xl font-black text-red-950">{{ title }}</h2>
    <p class="mt-3 max-w-xl text-sm leading-7 text-red-800">{{ description }}</p>
    <div v-if="$slots.default" class="mt-6">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>
