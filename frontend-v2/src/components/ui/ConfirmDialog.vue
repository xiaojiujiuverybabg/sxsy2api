<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        @click.self="onCancel"
      >
        <div class="w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-900 p-6 shadow-2xl">
          <!-- 标题 -->
          <div class="mb-4 flex items-start gap-3">
            <div class="flex-shrink-0 text-3xl">
              {{ icon }}
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold text-white">{{ title }}</h3>
              <p class="mt-2 text-sm text-slate-300">{{ message }}</p>
            </div>
          </div>

          <!-- 按钮 -->
          <div class="flex gap-3">
            <button
              @click="onCancel"
              class="flex-1 rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2.5 text-sm font-medium text-slate-300 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800"
            >
              {{ cancelText }}
            </button>
            <button
              @click="onConfirm"
              class="flex-1 rounded-lg px-4 py-2.5 text-sm font-bold text-white shadow-lg transition"
              :class="confirmButtonClass"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Props {
  type?: 'danger' | 'warning' | 'info'
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'warning',
  title: '确认操作',
  confirmText: '确认',
  cancelText: '取消'
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const visible = ref(false)

const icon = computed(() => {
  const icons = {
    danger: '⚠',
    warning: '⚠',
    info: 'ℹ'
  }
  return icons[props.type]
})

const confirmButtonClass = computed(() => {
  const classes = {
    danger: 'bg-gradient-to-r from-red-500 to-red-600 shadow-red-500/30 hover:shadow-red-500/50',
    warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-yellow-500/30 hover:shadow-yellow-500/50',
    info: 'bg-gradient-to-r from-brand-500 to-brand-600 shadow-brand-500/30 hover:shadow-brand-500/50'
  }
  return classes[props.type]
})

const onConfirm = () => {
  visible.value = false
  setTimeout(() => emit('confirm'), 300)
}

const onCancel = () => {
  visible.value = false
  setTimeout(() => emit('cancel'), 300)
}

onMounted(() => {
  visible.value = true
})
</script>

<style scoped>
.dialog-enter-active,
.dialog-leave-active {
  transition: all 0.3s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-from > div,
.dialog-leave-to > div {
  transform: scale(0.9);
}
</style>
