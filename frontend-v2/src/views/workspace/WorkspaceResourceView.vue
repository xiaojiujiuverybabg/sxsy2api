<template>
  <section class="relative overflow-hidden rounded-[38px] border border-white/10 bg-[#070a13]/82 p-4 shadow-[0_34px_120px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl md:p-6">
    <div class="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-500/16 blur-3xl"></div>
    <div class="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-warning/10 blur-3xl"></div>
    <div class="pointer-events-none absolute bottom-0 left-1/2 h-64 w-64 rounded-full bg-success-500/10 blur-3xl"></div>

    <div class="relative grid gap-5">
      <header class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div class="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.035] to-transparent p-6">
          <div class="pointer-events-none absolute right-8 top-6 hidden h-28 w-28 rounded-full border border-brand-500/20 md:block"></div>
          <p class="atlas-kicker">{{ config.eyebrow }}</p>
          <h1 class="mt-4 max-w-4xl text-3xl font-black leading-none tracking-tight text-text-primary md:text-5xl">
            {{ config.title }}
          </h1>
          <p class="mt-4 max-w-2xl text-sm leading-7 text-text-secondary md:text-base">
            {{ config.description }}
          </p>

          <div class="mt-6 flex flex-wrap gap-3">
            <button class="rounded-2xl bg-brand-500 px-5 py-3 text-sm font-black text-white transition hover:bg-brand-700" @click="load">
              重新同步
            </button>
            <button class="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-black text-text-secondary transition hover:border-brand-500/60 hover:text-brand-300" @click="drawerOpen = true">
              打开情境
            </button>
            <StatusPill :label="loading ? '同步中' : '数据就绪'" :tone="loading ? 'warning' : 'success'" />
          </div>
        </div>

        <aside class="grid gap-3 rounded-[32px] border border-white/10 bg-neutral-950/55 p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="atlas-kicker">Pulse</p>
              <h2 class="mt-2 text-xl font-black text-text-primary">页面脉冲</h2>
            </div>
            <span class="grid h-12 w-12 place-items-center rounded-2xl bg-brand-500/15 text-sm font-black text-brand-300">{{ filteredRows.length }}</span>
          </div>
          <div class="grid gap-2">
            <div v-for="metric in compactMetrics" :key="metric.label" class="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
              <div class="flex items-center justify-between gap-3">
                <span class="text-xs font-black uppercase tracking-[0.2em] text-text-muted">{{ metric.label }}</span>
                <strong class="text-lg font-black text-text-primary">{{ metric.value(loadContext) }}</strong>
              </div>
              <p class="mt-1 line-clamp-1 text-xs text-text-secondary">{{ metric.hint }}</p>
            </div>
          </div>
        </aside>
      </header>

      <section class="grid gap-4 lg:grid-cols-[0.85fr_1.15fr] xl:grid-cols-[360px_minmax(0,1fr)]">
        <div class="grid content-start gap-4">
          <WorkspaceToolbar
            v-model:search="search"
            v-model:status="status"
            :search-placeholder="config.searchPlaceholder || '搜索关键词'"
            :status-options="config.statusOptions"
            @refresh="load"
          >
            <button
              type="button"
              class="h-12 rounded-2xl bg-brand-500 px-4 text-sm font-black text-white transition hover:bg-brand-700"
              @click="drawerOpen = true"
            >
              情境
            </button>
          </WorkspaceToolbar>

          <div class="grid gap-3">
            <SceneCard
              v-for="card in sceneCards"
              :key="card.title"
              :title="card.title"
              :description="card.description"
              :mark="card.mark"
            >
              <p class="text-sm font-semibold text-text-secondary">{{ card.meta }}</p>
            </SceneCard>
          </div>
        </div>

        <DataStage
          :eyebrow="config.toolbarTitle"
          :title="config.toolbarDescription"
          :columns="config.columns"
          :rows="filteredRows"
          :loading="loading"
          :error="error"
          @select="selectRow"
        >
          <template #cell-status="{ value }">
            <StatusPill :label="String(value)" :tone="statusTone(value)" />
          </template>
        </DataStage>
      </section>

      <section class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div class="grid gap-3 md:grid-cols-3">
          <div
            v-for="metric in largeMetrics"
            :key="metric.label"
            class="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 transition hover:-translate-y-1 hover:border-brand-500/50 hover:bg-brand-500/[0.06]"
          >
            <div class="flex items-start justify-between gap-3">
              <span class="text-xs font-black uppercase tracking-[0.22em] text-text-muted">{{ metric.label }}</span>
              <span class="grid h-9 w-9 place-items-center rounded-2xl bg-white/[0.06] text-xs font-black text-brand-300">{{ metric.mark || 'M' }}</span>
            </div>
            <strong class="mt-5 block text-3xl font-black text-text-primary">{{ metric.value(loadContext) }}</strong>
            <p class="mt-2 text-sm leading-6 text-text-secondary">{{ metric.hint }}</p>
          </div>
        </div>

        <ActionPanel eyebrow="Command Stack" title="任务栈">
          <ActionButton
            v-for="action in config.actions"
            :key="action.label"
            :label="action.label"
            :description="action.description"
            :to="action.to"
            :tone="action.tone === 'primary' ? 'primary' : undefined"
          />
        </ActionPanel>
      </section>
    </div>

    <DetailDrawer
      :open="drawerOpen"
      eyebrow="Context Drawer"
      :title="selectedName"
      :description="detailText"
      @close="drawerOpen = false"
    >
      <div class="grid gap-4">
        <div class="rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
          <p class="atlas-kicker">当前筛选</p>
          <div class="mt-3 grid gap-2 text-sm font-bold text-text-secondary">
            <span>关键词：{{ search || '未设置' }}</span>
            <span>状态：{{ status || '全部' }}</span>
            <span>结果：{{ filteredRows.length }}</span>
          </div>
        </div>
        <pre class="max-h-80 overflow-auto rounded-[28px] border border-white/10 bg-black/35 p-4 text-xs leading-6 text-white/80">{{ selectedPreview }}</pre>
      </div>
    </DetailDrawer>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  ActionButton,
  ActionPanel,
  StatusPill,
} from '@/components/atlas'
import DataStage, { type DataStageRow } from '@/components/console/DataStage.vue'
import DetailDrawer from '@/components/console/DetailDrawer.vue'
import SceneCard from '@/components/console/SceneCard.vue'
import WorkspaceToolbar from '@/components/console/WorkspaceToolbar.vue'
import { statusTone } from '@/utils/format'
import { getWorkspacePage, type WorkspaceLoadContext } from './pageCatalog'

const props = defineProps<{
  pageKey: string
}>()

const config = computed(() => getWorkspacePage(props.pageKey))
const search = ref('')
const status = ref('')
const loading = ref(false)
const error = ref('')
const rows = ref<DataStageRow[]>([])
const raw = ref<unknown>()
const detail = ref('')
const selected = ref<DataStageRow | null>(null)
const drawerOpen = ref(false)
let controller: AbortController | null = null

const filteredRows = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  if (!keyword) return rows.value
  return rows.value.filter((row) => JSON.stringify(row).toLowerCase().includes(keyword))
})

const loadContext = computed<WorkspaceLoadContext>(() => ({
  rows: rows.value,
  raw: raw.value,
  metrics: {
    count: rows.value.length,
    total: rows.value.length,
    active: rows.value.filter((row) => statusTone(row.status) === 'success').length,
    warning: rows.value.filter((row) => statusTone(row.status) === 'warning').length,
    danger: rows.value.filter((row) => statusTone(row.status) === 'danger').length,
    ...(raw.value && typeof raw.value === 'object' ? (raw.value as Record<string, unknown>) : {}),
  },
}))

const compactMetrics = computed(() => config.value.metrics.slice(0, 3))
const largeMetrics = computed(() => config.value.metrics.slice(1, 4))
const selectedName = computed(() => String(selected.value?.name || config.value.title))
const detailText = computed(() => detail.value || '这里承载当前页面的筛选说明、对象详情和下一步动作。')
const selectedPreview = computed(() => JSON.stringify(selected.value?.raw || selected.value || raw.value || {}, null, 2))

const sceneCards = computed(() => [
  {
    title: '任务入口',
    description: '主要动作被收束到任务栈，不再铺满行内按钮。',
    mark: '01',
    meta: config.value.kind.toUpperCase(),
  },
  {
    title: '结果舞台',
    description: '数据区保持主视觉重量，筛选和说明退到辅助层。',
    mark: '02',
    meta: `${filteredRows.value.length} 条结果`,
  },
  {
    title: '情境抽屉',
    description: '详情和风险提示按需打开，避免页面被说明文字淹没。',
    mark: '03',
    meta: selectedName.value,
  },
])

async function load() {
  controller?.abort()
  controller = new AbortController()
  loading.value = true
  error.value = ''

  try {
    const result = await config.value.loader({
      search: search.value,
      status: status.value,
      signal: controller.signal,
    })
    rows.value = result.rows || []
    raw.value = result.raw
    detail.value = result.detail || ''
    selected.value = rows.value[0] || null
  } catch (err) {
    error.value = err instanceof Error ? err.message : '数据加载失败'
  } finally {
    loading.value = false
  }
}

function selectRow(row: DataStageRow) {
  selected.value = row
  drawerOpen.value = true
}

watch(
  () => props.pageKey,
  () => {
    search.value = ''
    status.value = ''
    rows.value = []
    raw.value = undefined
    void load()
  },
)

onMounted(load)
</script>
