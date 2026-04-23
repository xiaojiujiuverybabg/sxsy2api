<template>
  <section class="rounded-[34px] border border-white/70 bg-white/78 p-4 shadow-insetline backdrop-blur">
    <header class="flex flex-col gap-4 border-b border-line pb-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="atlas-kicker">{{ eyebrow }}</p>
        <h2 class="mt-2 text-2xl font-black text-text-primary">{{ title }}</h2>
      </div>
      <slot name="toolbar" />
    </header>

    <div class="mt-4 overflow-hidden rounded-[26px] border border-line">
      <table class="w-full border-collapse text-left">
        <thead class="bg-neutral-900 text-white">
          <tr>
            <th v-for="column in columns" :key="column.key" class="px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-white/60">
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-line bg-white/75">
          <tr v-for="row in rows" :key="row.id" class="transition hover:bg-brand-50/70">
            <td v-for="column in columns" :key="column.key" class="px-4 py-4 text-sm font-semibold text-text-secondary">
              <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
                {{ row[column.key] }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
type SmartTableCell = string | number | boolean | null | undefined
type SmartTableRow = {
  id: string | number
  [key: string]: SmartTableCell | Record<string, unknown> | unknown
}

defineProps<{
  eyebrow: string
  title: string
  columns: Array<{
    key: string
    label: string
  }>
  rows: SmartTableRow[]
}>()
</script>
