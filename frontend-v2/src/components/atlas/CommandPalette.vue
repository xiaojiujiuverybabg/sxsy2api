<template>
  <Teleport to="body">
    <Transition name="atlas-fade">
      <div v-if="open" class="fixed inset-0 z-50 bg-neutral-900/45 p-4 backdrop-blur-sm" @click.self="$emit('close')">
        <section class="mx-auto mt-16 max-w-3xl overflow-hidden rounded-[34px] border border-white/60 bg-white/92 shadow-panel backdrop-blur-xl">
          <div class="border-b border-line p-4">
            <p class="atlas-kicker">命令面板</p>
            <input
              v-model="query"
              class="mt-3 w-full bg-transparent text-3xl font-black text-text-primary outline-none placeholder:text-text-muted"
              placeholder="搜索页面、任务或动作..."
              autofocus
            />
          </div>

          <div class="max-h-[58vh] overflow-y-auto p-3">
            <RouterLink
              v-for="item in filteredItems"
              :key="item.to"
              :to="item.to"
              class="group flex items-center justify-between rounded-[24px] px-4 py-4 transition hover:bg-brand-50"
              @click="$emit('close')"
            >
              <span>
                <strong class="block text-sm font-black text-text-primary">{{ item.label }}</strong>
                <small class="mt-1 block text-xs leading-5 text-text-secondary">{{ item.description }}</small>
              </span>
              <span class="rounded-full bg-brand-500 px-3 py-1 text-xs font-black text-white transition group-hover:bg-brand-700">打开</span>
            </RouterLink>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  open: boolean
  items: Array<{
    label: string
    description: string
    to: string
  }>
}>()

defineEmits<{
  close: []
}>()

const query = ref('')

const filteredItems = computed(() => {
  const keyword = query.value.trim().toLowerCase()

  if (!keyword) {
    return props.items
  }

  return props.items.filter((item) => {
    return `${item.label} ${item.description} ${item.to}`.toLowerCase().includes(keyword)
  })
})
</script>
