<template>
  <RouterView />
  <div class="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(92vw,360px)] flex-col gap-3">
    <div
      v-for="toast in appStore.toasts"
      :key="toast.id"
      class="rounded-[22px] border px-4 py-3 text-sm font-bold shadow-panel backdrop-blur"
      :class="toastClass(toast.type)"
    >
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAppStore, useAuthStore } from '@/stores'

const appStore = useAppStore()
const authStore = useAuthStore()

onMounted(async () => {
  await Promise.allSettled([authStore.initialize(), appStore.fetchPublicSettings()])
})

const toastClass = computed(() => {
  return (type: 'success' | 'error' | 'warning' | 'info') => {
    if (type === 'success') {
      return 'border-emerald-200 bg-emerald-50/90 text-emerald-800'
    }
    if (type === 'error') {
      return 'border-red-200 bg-red-50/90 text-red-800'
    }
    if (type === 'warning') {
      return 'border-amber-200 bg-amber-50/90 text-amber-800'
    }
    return 'border-slate-200 bg-white/90 text-slate-700'
  }
})
</script>
