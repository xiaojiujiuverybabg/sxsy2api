<template>
  <section class="atlas-panel relative overflow-hidden p-5 md:p-8">
    <div class="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-100/60 blur-3xl"></div>
    <div class="pointer-events-none absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-success-100/60 blur-3xl"></div>

    <div class="relative">
      <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="atlas-kicker">{{ eyebrow }}</p>
          <h1 class="mt-3 max-w-4xl text-5xl font-black leading-[0.92] tracking-tight text-text-primary md:text-7xl">
            {{ title }}
          </h1>
          <p v-if="description" class="mt-5 max-w-2xl text-base leading-8 text-text-secondary">
            {{ description }}
          </p>
        </div>

        <slot name="actions" />
      </div>

      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  description?: string
}>()
</script>
