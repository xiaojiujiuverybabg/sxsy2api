<template>
  <div class="rounded-lg border border-slate-700/50 bg-slate-800/40 p-3">
    <!-- Collapsed summary header (clickable) -->
    <div
      class="flex cursor-pointer select-none items-center gap-2"
      @click="collapsed = !collapsed"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4 flex-shrink-0 text-slate-400 transition-transform duration-200"
        :class="collapsed ? '' : 'rotate-90'"
      >
        <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
      </svg>

      <!-- Summary: model tags + billing badge -->
      <div v-if="collapsed" class="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
        <div class="flex min-w-0 flex-1 flex-wrap items-center gap-1">
          <span
            v-for="(m, i) in entry.models.slice(0, 3)"
            :key="i"
            class="inline-flex shrink-0 rounded px-1.5 py-0.5 text-xs"
            :class="getPlatformTagClass(props.platform || '')"
          >
            {{ m }}
          </span>
          <span
            v-if="entry.models.length > 3"
            class="whitespace-nowrap text-xs text-slate-400"
          >
            +{{ entry.models.length - 3 }}
          </span>
          <span
            v-if="entry.models.length === 0"
            class="text-xs italic text-slate-400"
          >
            未添加模型
          </span>
        </div>

        <span
          class="flex-shrink-0 rounded-full bg-brand-500/10 px-2 py-0.5 text-xs font-medium text-brand-400"
        >
          {{ billingModeLabel }}
        </span>
      </div>

      <!-- Expanded: show the label "Pricing Entry" or similar -->
      <div v-else class="flex-1 text-xs font-medium text-slate-400">
        定价配置
      </div>

      <!-- Remove button (always visible, stop propagation) -->
      <button
        type="button"
        @click.stop="emit('remove')"
        class="flex-shrink-0 rounded p-1 text-slate-400 hover:text-red-400"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
          <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>

    <!-- Expandable content -->
    <div
      class="grid transition-[grid-template-rows] duration-200"
      :class="collapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'"
    >
      <div class="overflow-hidden">
        <!-- Header: Models + Billing Mode -->
        <div class="mt-3 flex items-start gap-2">
          <div class="flex-1">
            <label class="text-xs font-medium text-slate-400">
              模型列表 <span class="text-red-400">*</span>
            </label>
            <ModelTagInput
              :models="entry.models"
              :platform="props.platform"
              @update:models="onModelsUpdate($event)"
              placeholder="输入模型名后按回车添加，支持通配符 *"
              class="mt-1"
            />
          </div>
          <div class="w-40">
            <label class="text-xs font-medium text-slate-400">
              计费模式
            </label>
            <select
              :value="entry.billing_mode"
              @change="emit('update', { ...entry, billing_mode: ($event.target as HTMLSelectElement).value as BillingMode, intervals: [] })"
              class="mt-1 w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-2 text-xs text-white"
            >
              <option value="token">Token</option>
              <option value="per_request">按次</option>
              <option value="image">图片（按次）</option>
            </select>
          </div>
        </div>

        <!-- Token mode -->
        <div v-if="entry.billing_mode === 'token'">
          <label class="mt-3 block text-xs font-medium text-slate-400">
            默认价格（未命中区间时使用） <span class="text-slate-500">$/MTok</span>
          </label>
          <div class="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-5">
            <div>
              <label class="text-xs text-slate-500">输入</label>
              <input :value="entry.input_price" @input="emitField('input_price', ($event.target as HTMLInputElement).value)"
                type="number" step="any" min="0" class="w-full rounded border border-slate-700/50 bg-slate-900/50 px-2 py-1 text-xs text-white mt-0.5" placeholder="默认" />
            </div>
            <div>
              <label class="text-xs text-slate-500">输出</label>
              <input :value="entry.output_price" @input="emitField('output_price', ($event.target as HTMLInputElement).value)"
                type="number" step="any" min="0" class="w-full rounded border border-slate-700/50 bg-slate-900/50 px-2 py-1 text-xs text-white mt-0.5" placeholder="默认" />
            </div>
            <div>
              <label class="text-xs text-slate-500">缓存写入</label>
              <input :value="entry.cache_write_price" @input="emitField('cache_write_price', ($event.target as HTMLInputElement).value)"
                type="number" step="any" min="0" class="w-full rounded border border-slate-700/50 bg-slate-900/50 px-2 py-1 text-xs text-white mt-0.5" placeholder="默认" />
            </div>
            <div>
              <label class="text-xs text-slate-500">缓存读取</label>
              <input :value="entry.cache_read_price" @input="emitField('cache_read_price', ($event.target as HTMLInputElement).value)"
                type="number" step="any" min="0" class="w-full rounded border border-slate-700/50 bg-slate-900/50 px-2 py-1 text-xs text-white mt-0.5" placeholder="默认" />
            </div>
            <div>
              <label class="text-xs text-slate-500">图片输出</label>
              <input :value="entry.image_output_price" @input="emitField('image_output_price', ($event.target as HTMLInputElement).value)"
                type="number" step="any" min="0" class="w-full rounded border border-slate-700/50 bg-slate-900/50 px-2 py-1 text-xs text-white mt-0.5" placeholder="默认" />
            </div>
          </div>

          <!-- Token intervals -->
          <div class="mt-3">
            <div class="flex items-center justify-between">
              <label class="text-xs font-medium text-slate-400">
                上下文区间定价（可选） <span class="text-slate-500">(min, max]</span>
              </label>
              <button type="button" @click="addInterval" class="text-xs text-brand-400 hover:text-brand-300">
                + 添加区间
              </button>
            </div>
            <div v-if="entry.intervals && entry.intervals.length > 0" class="mt-2 space-y-2">
              <IntervalRow
                v-for="(iv, idx) in entry.intervals"
                :key="idx"
                :interval="iv"
                :mode="entry.billing_mode"
                @update="updateInterval(idx, $event)"
                @remove="removeInterval(idx)"
              />
            </div>
          </div>
        </div>

        <!-- Per-request mode -->
        <div v-else-if="entry.billing_mode === 'per_request'">
          <label class="mt-3 block text-xs font-medium text-slate-400">
            默认单次价格（未命中层级时使用） <span class="text-slate-500">$</span>
          </label>
          <div class="mt-1 w-48">
            <input :value="entry.per_request_price" @input="emitField('per_request_price', ($event.target as HTMLInputElement).value)"
              type="number" step="any" min="0" class="w-full rounded border border-slate-700/50 bg-slate-900/50 px-2 py-1 text-xs text-white" placeholder="默认" />
          </div>

          <div class="mt-3 flex items-center justify-between">
            <label class="text-xs font-medium text-slate-400">
              按次计费层级
            </label>
            <button type="button" @click="addInterval" class="text-xs text-brand-400 hover:text-brand-300">
              + 添加层级
            </button>
          </div>
          <div v-if="entry.intervals && entry.intervals.length > 0" class="mt-2 space-y-2">
            <IntervalRow
              v-for="(iv, idx) in entry.intervals"
              :key="idx"
              :interval="iv"
              :mode="entry.billing_mode"
              @update="updateInterval(idx, $event)"
              @remove="removeInterval(idx)"
            />
          </div>
          <div v-else class="mt-2 rounded border border-dashed border-slate-700/50 p-3 text-center text-xs text-slate-400">
            暂无层级，点击添加配置按次计费价格
          </div>
        </div>

        <!-- Image mode -->
        <div v-else-if="entry.billing_mode === 'image'">
          <label class="mt-3 block text-xs font-medium text-slate-400">
            默认图片价格（未命中层级时使用） <span class="text-slate-500">$</span>
          </label>
          <div class="mt-1 w-48">
            <input :value="entry.per_request_price" @input="emitField('per_request_price', ($event.target as HTMLInputElement).value)"
              type="number" step="any" min="0" class="w-full rounded border border-slate-700/50 bg-slate-900/50 px-2 py-1 text-xs text-white" placeholder="默认" />
          </div>

          <div class="mt-3 flex items-center justify-between">
            <label class="text-xs font-medium text-slate-400">
              图片计费层级（按次）
            </label>
            <button type="button" @click="addImageTier" class="text-xs text-brand-400 hover:text-brand-300">
              + 添加层级
            </button>
          </div>
          <div v-if="entry.intervals && entry.intervals.length > 0" class="mt-2 space-y-2">
            <IntervalRow
              v-for="(iv, idx) in entry.intervals"
              :key="idx"
              :interval="iv"
              :mode="entry.billing_mode"
              @update="updateInterval(idx, $event)"
              @remove="removeInterval(idx)"
            />
          </div>
          <div v-else class="mt-2 rounded border border-dashed border-slate-700/50 p-3 text-center text-xs text-slate-400">
            暂无层级，点击添加配置图片计费价格
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ModelTagInput from './ModelTagInput.vue'
import IntervalRow from './IntervalRow.vue'
import { perTokenToMTok, getPlatformTagClass } from './types'
import type { PricingFormEntry, IntervalFormEntry, BillingMode } from '@/types/channels'
import { adminAPI } from '@/api/admin'

const props = defineProps<{
  entry: PricingFormEntry
  platform?: string
}>()

const emit = defineEmits<{
  update: [entry: PricingFormEntry]
  remove: []
}>()

const collapsed = ref(props.entry.models.length > 0)

const billingModeLabel = computed(() => {
  switch (props.entry.billing_mode) {
    case 'token': return 'Token'
    case 'per_request': return '按次'
    case 'image': return '图片（按次）'
    default: return props.entry.billing_mode
  }
})

function emitField(field: keyof PricingFormEntry, value: string) {
  emit('update', { ...props.entry, [field]: value === '' ? null : value })
}

function addInterval() {
  const intervals = [...(props.entry.intervals || [])]
  intervals.push({
    min_tokens: 0, max_tokens: null, tier_label: '',
    input_price: null, output_price: null, cache_write_price: null,
    cache_read_price: null, per_request_price: null,
    sort_order: intervals.length
  })
  emit('update', { ...props.entry, intervals })
}

function addImageTier() {
  const intervals = [...(props.entry.intervals || [])]
  const labels = ['1K', '2K', '4K', 'HD']
  intervals.push({
    min_tokens: 0, max_tokens: null, tier_label: labels[intervals.length] || '',
    input_price: null, output_price: null, cache_write_price: null,
    cache_read_price: null, per_request_price: null,
    sort_order: intervals.length
  })
  emit('update', { ...props.entry, intervals })
}

function updateInterval(idx: number, updated: IntervalFormEntry) {
  const intervals = [...(props.entry.intervals || [])]
  intervals[idx] = updated
  emit('update', { ...props.entry, intervals })
}

function removeInterval(idx: number) {
  const intervals = [...(props.entry.intervals || [])]
  intervals.splice(idx, 1)
  emit('update', { ...props.entry, intervals })
}

async function onModelsUpdate(newModels: string[]) {
  const oldModels = props.entry.models
  emit('update', { ...props.entry, models: newModels })

  const addedModels = newModels.filter(m => !oldModels.includes(m))
  if (addedModels.length === 0) return

  const e = props.entry
  const hasPrice = e.input_price != null || e.output_price != null ||
                   e.cache_write_price != null || e.cache_read_price != null
  if (hasPrice) return

  try {
    const result = await adminAPI.channels.getModelDefaultPricing(addedModels[0])
    if (result.found) {
      emit('update', {
        ...props.entry,
        models: newModels,
        input_price: perTokenToMTok(result.input_price ?? null),
        output_price: perTokenToMTok(result.output_price ?? null),
        cache_write_price: perTokenToMTok(result.cache_write_price ?? null),
        cache_read_price: perTokenToMTok(result.cache_read_price ?? null),
        image_output_price: perTokenToMTok(result.image_output_price ?? null),
      })
    }
  } catch {
    // 查询失败不影响用户操作
  }
}
</script>
