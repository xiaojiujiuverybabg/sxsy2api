<template>
  <nav class="fixed inset-x-3 bottom-3 z-40 md:inset-x-8 md:bottom-6">
    <div class="mx-auto flex max-w-5xl items-center justify-between gap-2 rounded-[28px] border border-white/70 bg-neutral-900/94 p-2 text-white shadow-panel backdrop-blur-xl">
      <RouterLink
        v-for="item in primaryItems"
        :key="item.path"
        :to="item.path"
        class="group flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[22px] px-2 py-3 text-center transition hover:bg-white/10"
        active-class="bg-white text-text-primary hover:bg-white"
      >
        <span class="text-lg">{{ item.mark }}</span>
        <span class="max-w-full truncate text-xs font-black">{{ item.label }}</span>
      </RouterLink>

      <button class="mx-1 hidden h-12 w-px bg-white/10 md:block" aria-hidden="true"></button>

      <RouterLink
        v-for="item in adminItems"
        :key="item.path"
        :to="item.path"
        class="group hidden min-w-0 flex-1 flex-col items-center gap-1 rounded-[22px] px-2 py-3 text-center text-white/68 transition hover:bg-white/10 hover:text-white md:flex"
        active-class="bg-brand-100 text-brand-700 hover:bg-brand-100 hover:text-brand-700"
      >
        <span class="text-lg">{{ item.mark }}</span>
        <span class="max-w-full truncate text-xs font-black">{{ item.label }}</span>
      </RouterLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
const primaryItems = [
  { label: '工作台', path: '/dashboard', mark: '⌁' },
  { label: '密钥', path: '/keys', mark: '◇' },
  { label: '用量', path: '/usage', mark: '◌' },
  { label: '购买', path: '/purchase', mark: '✦' },
]

const adminItems = [
  { label: '总览', path: '/admin/dashboard', mark: '◈' },
  { label: '用户', path: '/admin/users', mark: '◎' },
  { label: '渠道', path: '/admin/channels', mark: '▣' },
]
</script>
