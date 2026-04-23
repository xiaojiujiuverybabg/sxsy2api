<template>
  <Teleport to="body">
    <Transition name="atlas-slide">
      <div v-if="open" class="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm" @click.self="$emit('close')">
        <aside class="ml-auto flex h-full w-full max-w-xl flex-col border-l border-white/10 bg-[#080b14] p-5 shadow-panel">
          <header class="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <p class="atlas-kicker">{{ eyebrow }}</p>
              <h2 class="mt-2 text-2xl font-black text-text-primary">{{ title }}</h2>
              <p v-if="description" class="mt-2 text-sm leading-6 text-text-secondary">{{ description }}</p>
            </div>
            <button class="rounded-full border border-white/10 px-4 py-2 text-sm font-black text-text-secondary transition hover:border-brand-500 hover:text-brand-300" @click="$emit('close')">
              关闭
            </button>
          </header>

          <div class="min-h-0 flex-1 overflow-y-auto py-5">
            <slot />
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean
  eyebrow: string
  title: string
  description?: string
}>()

defineEmits<{
  close: []
}>()
</script>
