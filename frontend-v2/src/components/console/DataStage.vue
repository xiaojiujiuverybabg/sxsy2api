<template>
  <section class="overflow-hidden rounded-[34px] border border-white/10 bg-neutral-950/55 shadow-[0_24px_80px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
    <header class="flex flex-col gap-3 border-b border-white/10 p-5 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="atlas-kicker">{{ eyebrow }}</p>
        <h2 class="mt-2 text-xl font-black text-text-primary">{{ title }}</h2>
      </div>
      <slot name="actions" />
    </header>

    <div v-if="loading" class="grid gap-3 p-5">
      <div v-for="item in 5" :key="item" class="h-16 animate-pulse rounded-[22px] bg-white/[0.05]"></div>
    </div>

    <div v-else-if="error" class="p-5">
      <ErrorScene title="数据加载失败" :description="error" />
    </div>

    <div v-else-if="rows.length === 0" class="p-5">
      <EmptyScene title="暂无结果" description="调整筛选条件，或完成第一条业务数据后这里会展示实时结果。" mark="0" />
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full min-w-[760px] border-collapse text-left">
        <thead>
          <tr class="bg-white/[0.035]">
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-text-muted"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/10">
          <tr
            v-for="row in rows"
            :key="String(row.id)"
            class="cursor-pointer transition hover:bg-brand-500/[0.08]"
            @click="$emit('select', row)"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-5 py-4 text-sm font-semibold text-text-secondary"
            >
              <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
                {{ row[column.key] ?? '-' }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { EmptyScene, ErrorScene } from '@/components/atlas'

export type DataStageRow = {
  id: string | number
  [key: string]: unknown
}

defineProps<{
  eyebrow: string
  title: string
  columns: Array<{ key: string; label: string }>
  rows: DataStageRow[]
  loading?: boolean
  error?: string
}>()

defineEmits<{
  select: [row: DataStageRow]
}>()
</script>
