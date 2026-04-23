<template>
  <AtlasPage
    eyebrow="404 Signal"
    title="这个坐标没有页面"
    description="当前路径没有匹配到可访问的工作台。你可以回到首页，或进入登录后的命令坞继续操作。"
  >
    <template #actions>
      <div class="flex flex-wrap gap-3">
        <RouterLink class="rounded-full bg-brand-500 px-5 py-3 text-sm font-black text-white transition hover:bg-brand-700" to="/home">
          返回首页
        </RouterLink>
        <RouterLink class="rounded-full border border-line bg-white/80 px-5 py-3 text-sm font-black text-text-secondary transition hover:border-brand-300 hover:text-brand-700" to="/dashboard">
          进入工作台
        </RouterLink>
      </div>
    </template>

    <section class="mt-8 grid gap-4 md:grid-cols-3">
      <SceneCard title="路径检查" description="确认 URL 是否拼写正确，或是否需要登录后访问。" mark="P" />
      <SceneCard title="权限检查" description="管理端页面需要管理员身份，否则会回到用户工作台。" mark="A" />
      <SceneCard title="继续操作" description="使用首页或命令坞进入现有功能页面。" mark="N" />
    </section>
  </AtlasPage>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { AtlasPage } from '@/components/atlas'
import SceneCard from '@/components/console/SceneCard.vue'
</script>
