<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    @click.self="handleCancel"
  >
    <div class="w-full max-w-md rounded-xl border border-slate-700/50 bg-slate-900 p-6 shadow-2xl">
      <div class="mb-4 flex items-center gap-3">
        <div class="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
          <span class="text-2xl">⚠️</span>
        </div>
        <div>
          <h2 class="text-lg font-bold text-white">{{ title }}</h2>
        </div>
      </div>

      <p class="mb-6 text-sm text-slate-300">{{ message }}</p>

      <div class="flex justify-end gap-3">
        <button
          @click="handleCancel"
          class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800"
        >
          取消
        </button>
        <button
          @click="handleConfirm"
          class="rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-red-500/30 transition hover:shadow-red-500/50"
        >
          确认删除
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  show: boolean
  title: string
  message: string
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
}
</script>
