<template>
  <Teleport to="body">
    <Transition name="atlas-slide">
      <div v-if="open" class="fixed inset-0 z-50 bg-neutral-900/35 backdrop-blur-sm" @click.self="$emit('close')">
        <aside class="absolute bottom-0 right-0 top-0 flex w-full max-w-xl flex-col border-l border-white/70 bg-white/92 p-5 shadow-panel backdrop-blur-xl">
          <header class="flex items-start justify-between gap-4">
            <div>
              <p class="atlas-kicker">{{ eyebrow }}</p>
              <h2 class="mt-2 text-3xl font-black text-text-primary">{{ title }}</h2>
              <p v-if="description" class="mt-2 text-sm leading-7 text-text-secondary">{{ description }}</p>
            </div>
            <button class="rounded-full bg-surface-soft px-4 py-2 text-sm font-black text-text-secondary transition hover:bg-neutral-900 hover:text-white" @click="$emit('close')">
              关闭
            </button>
          </header>

          <div class="mt-6 flex-1 overflow-y-auto">
            <slot />
          </div>

          <footer v-if="$slots.footer" class="mt-5 border-t border-line pt-5">
            <slot name="footer" />
          </footer>
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
