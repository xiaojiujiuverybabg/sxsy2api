<template>
  <aside class="rounded-[32px] border border-white/70 bg-white/72 p-5 shadow-panel backdrop-blur-xl">
    <p class="text-xs font-black uppercase tracking-[0.32em] text-brand-700">上下文</p>
    <h2 class="mt-3 text-2xl font-black tracking-tight text-text-primary">{{ title }}</h2>
    <p class="mt-3 text-sm leading-7 text-text-secondary">
      这里不是页面右侧空白区，而是页面级上下文面板。筛选、详情、风险提示、下一步动作都应该沉淀到这里。
    </p>

    <div class="mt-6 space-y-3">
      <article v-for="item in hints" :key="item.title" class="rounded-3xl border border-line bg-white/78 p-4">
        <p class="text-sm font-black text-text-primary">{{ item.title }}</p>
        <p class="mt-1 text-xs leading-5 text-text-secondary">{{ item.text }}</p>
      </article>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const title = computed(() => String(route.meta.title || '页面上下文'))

const hints = [
  {
    title: '不复制原有布局',
    text: '页面主体必须重新组织任务、指标、操作和详情。',
  },
  {
    title: '不复制原有操作',
    text: '行内按钮、传统弹窗表单、传统筛选条都需要重新设计。',
  },
  {
    title: '结果保持稳定',
    text: '页面体验会升级，操作结果保持一致。',
  },
]
</script>
