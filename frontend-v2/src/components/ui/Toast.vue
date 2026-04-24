<template>
  <Teleport to="body">
    <Transition name="toast">
      <div
        v-if="visible"
        class="fixed right-6 top-6 z-50 flex min-w-[320px] max-w-md items-start gap-3 rounded-xl border border-slate-700/50 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-sm"
        :class="typeClasses"
      >
        <!-- 图标 -->
        <div class="flex-shrink-0 text-2xl">
          {{ icon }}
        </div>

        <!-- 内容 -->
        <div class="flex-1 space-y-1">
          <div v-if="title" class="font-bold text-white">{{ title }}</div>
          <div class="text-sm text-slate-300">{{ message }}</div>
        </div>

        <!-- 关闭按钮 -->
        <button
          @click="close"
          class="flex-shrink-0 text-slate-400 transition hover:text-white"
        >
          ✕
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Props {
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 3000
})

const emit = defineEmits<{
  close: []
}>()

const visible = ref(false)

const icon = computed(() => {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }
  return icons[props.type]
})

const typeClasses = computed(() => {
  const classes = {
    success: 'border-l-4 border-l-green-500',
    error: 'border-l-4 border-l-red-500',
    warning: 'border-l-4 border-l-yellow-500',
    info: 'border-l-4 border-l-blue-500'
  }
  return classes[props.type]
})

const close = () => {
  visible.value = false
  setTimeout(() => emit('close'), 300)
}

onMounted(() => {
  visible.value = true
  if (props.duration > 0) {
    setTimeout(close, props.duration)
  }
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
