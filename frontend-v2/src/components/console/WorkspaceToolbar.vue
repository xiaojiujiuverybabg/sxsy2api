<template>
  <section class="rounded-[28px] border border-white/10 bg-white/[0.035] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
    <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_170px]">
        <input
          :value="search"
          class="h-12 rounded-2xl border border-white/10 bg-neutral-950/80 px-4 text-sm font-bold text-text-primary outline-none transition placeholder:text-text-muted focus:border-brand-500 focus:bg-neutral-950"
          :placeholder="searchPlaceholder"
          @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
          @keydown.enter="$emit('refresh')"
        />
        <select
          :value="status"
          class="h-12 rounded-2xl border border-white/10 bg-neutral-950/80 px-4 text-sm font-bold text-text-primary outline-none transition focus:border-brand-500"
          @change="$emit('update:status', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">全部状态</option>
          <option v-for="option in statusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-black text-text-secondary transition hover:border-brand-500/70 hover:bg-brand-500/10 hover:text-brand-300"
          @click="$emit('refresh')"
        >
          刷新
        </button>
        <slot />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    search: string
    status: string
    searchPlaceholder?: string
    statusOptions?: Array<{ value: string; label: string }>
  }>(),
  {
    searchPlaceholder: '搜索名称、邮箱或关键词',
    statusOptions: () => [
      { value: 'active', label: '活跃' },
      { value: 'inactive', label: '停用' },
      { value: 'disabled', label: '禁用' },
      { value: 'pending', label: '待处理' },
    ],
  },
)

defineEmits<{
  'update:search': [value: string]
  'update:status': [value: string]
  refresh: []
}>()
</script>
