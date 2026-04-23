<template>
  <section class="rounded-[34px] border border-dashed border-line bg-white/62 p-8 text-center shadow-insetline backdrop-blur">
    <div class="mx-auto grid h-20 w-20 place-items-center rounded-[28px] bg-brand-100 text-3xl text-brand-700">{{ mark }}</div>
    <h2 class="mt-5 text-2xl font-black text-text-primary">{{ title }}</h2>
    <p class="mx-auto mt-3 max-w-md text-sm leading-7 text-text-secondary">{{ description }}</p>
    <div v-if="$slots.default" class="mt-6 flex justify-center">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    description: string
    mark?: string
  }>(),
  {
    mark: '◇',
  },
)
</script>
