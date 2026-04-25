<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    @click.self="$emit('close')"
  >
    <div class="w-full max-w-2xl rounded-2xl border border-slate-700/50 bg-slate-800/95 backdrop-blur-xl shadow-2xl">
      <!-- 头部 -->
      <div class="border-b border-slate-700/50 px-6 py-4">
        <h2 class="text-xl font-bold text-white">🔀 调整分组排序</h2>
        <p class="mt-1 text-sm text-slate-400">拖拽调整分组显示顺序</p>
      </div>

      <!-- 内容 -->
      <div class="p-6">
        <!-- 加载状态 -->
        <div v-if="loading" class="flex justify-center py-12">
          <div class="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-brand-500"></div>
        </div>

        <!-- 分组列表 -->
        <div v-else class="space-y-2">
          <div
            v-for="(group, index) in sortableGroups"
            :key="group.id"
            :draggable="true"
            @dragstart="handleDragStart(index)"
            @dragover.prevent
            @drop="handleDrop(index)"
            class="flex items-center gap-3 rounded-lg border border-slate-700/50 bg-slate-900/30 p-4 cursor-move transition hover:border-slate-600 hover:bg-slate-900/50"
          >
            <!-- 拖拽图标 -->
            <div class="text-slate-500">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
              </svg>
            </div>

            <!-- 序号 -->
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700/50 text-sm font-medium text-slate-300">
              {{ index + 1 }}
            </div>

            <!-- 分组信息 -->
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="font-medium text-white">{{ group.name }}</span>
                <span
                  :class="[
                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                    group.platform === 'openai' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    group.platform === 'anthropic' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                    group.platform === 'gemini' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                    'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  ]"
                >
                  {{ platformNames[group.platform] }}
                </span>
              </div>
              <div v-if="group.description" class="mt-1 text-xs text-slate-400">
                {{ group.description }}
              </div>
            </div>

            <!-- 状态 -->
            <span
              :class="[
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                group.status === 'active'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-700/50 text-slate-400'
              ]"
            >
              {{ group.status === 'active' ? '活跃' : '禁用' }}
            </span>
          </div>
        </div>

        <!-- 提示 -->
        <div class="mt-4 rounded-lg bg-blue-500/10 border border-blue-500/30 p-3">
          <div class="flex items-start gap-2">
            <span class="text-blue-400">💡</span>
            <p class="text-xs text-blue-300">
              排序会影响分组在列表中的显示顺序，以及某些场景下的优先级选择。
            </p>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="flex items-center justify-end gap-3 border-t border-slate-700/50 px-6 py-4">
        <button
          type="button"
          @click="$emit('close')"
          class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800"
        >
          取消
        </button>
        <button
          type="button"
          :disabled="saving || !hasChanges"
          @click="handleSave"
          class="rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:from-brand-600 hover:to-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ saving ? '保存中...' : '保存排序' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { AdminGroup } from '@/types'

interface Props {
  show: boolean
  groups: AdminGroup[]
}

interface Emits {
  (e: 'close'): void
  (e: 'save', sortedIds: number[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const platformNames: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  gemini: 'Gemini',
  antigravity: 'Antigravity'
}

const loading = ref(false)
const saving = ref(false)
const sortableGroups = ref<AdminGroup[]>([])
const draggedIndex = ref<number | null>(null)

const hasChanges = computed(() => {
  if (sortableGroups.value.length !== props.groups.length) return true
  return sortableGroups.value.some((group, index) => group.id !== props.groups[index]?.id)
})

const handleDragStart = (index: number) => {
  draggedIndex.value = index
}

const handleDrop = (dropIndex: number) => {
  if (draggedIndex.value === null || draggedIndex.value === dropIndex) return

  const newGroups = [...sortableGroups.value]
  const [draggedItem] = newGroups.splice(draggedIndex.value, 1)
  newGroups.splice(dropIndex, 0, draggedItem)

  sortableGroups.value = newGroups
  draggedIndex.value = null
}

const handleSave = async () => {
  saving.value = true
  try {
    const sortedIds = sortableGroups.value.map(g => g.id)
    emit('save', sortedIds)
  } finally {
    saving.value = false
  }
}

// 监听 groups 变化，初始化排序列表
watch(() => props.groups, (groups) => {
  if (groups && groups.length > 0) {
    sortableGroups.value = [...groups].sort((a, b) => {
      // 按 sort_order 排序，如果没有则按 id
      const orderA = a.sort_order ?? a.id
      const orderB = b.sort_order ?? b.id
      return orderA - orderB
    })
  }
}, { immediate: true })
</script>
