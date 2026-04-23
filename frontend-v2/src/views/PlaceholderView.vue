<template>
  <AtlasPage
    eyebrow="功能画布"
    :title="title"
    description="这个页面正在准备中。完成后会提供清晰的任务路径、关键数据和快捷操作。"
  >
    <template #actions>
      <StatusPill label="即将上线" tone="warning" />
    </template>

    <div class="mt-8 grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
      <div class="rounded-[32px] bg-neutral-900 p-6 text-white md:p-8">
        <div class="mt-8 flex flex-wrap gap-3">
          <span class="rounded-full bg-white px-4 py-2 text-sm font-black text-text-primary">{{ route.path }}</span>
          <span class="rounded-full border border-white/20 px-4 py-2 text-sm font-black text-white/70">即将上线</span>
        </div>
      </div>

      <div class="grid gap-4">
        <article v-for="item in checks" :key="item.title" class="rounded-[28px] border border-line bg-white/90 p-5">
          <p class="text-sm font-black uppercase tracking-[0.22em] text-brand-700">{{ item.kicker }}</p>
          <h3 class="mt-2 text-xl font-black text-text-primary">{{ item.title }}</h3>
          <p class="mt-2 text-sm leading-6 text-text-secondary">{{ item.description }}</p>
        </article>
      </div>
    </div>
  </AtlasPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { AtlasPage, StatusPill } from '@/components/atlas'

const route = useRoute()
const title = computed(() => String(route.meta.title || route.name || '未命名页面'))

const checks = [
  {
    kicker: '01 / 能力',
    title: '能力保持稳定',
    description: '页面会延续当前产品能力和访问权限。',
  },
  {
    kicker: '02 / 布局',
    title: '体验重新设计',
    description: '核心信息、常用操作和详情会被重新组织。',
  },
  {
    kicker: '03 / 操作',
    title: '操作必须重组',
    description: '高频动作进入任务区，复杂动作进入动作面板、上下文面板或分步流。',
  },
]
</script>
