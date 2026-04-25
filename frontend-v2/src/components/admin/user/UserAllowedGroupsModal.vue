<template>
  <div
    v-if="show && user"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    @click.self="handleClose"
  >
    <div class="w-full max-w-4xl rounded-xl border border-slate-700/50 bg-slate-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
      <h2 class="mb-6 text-xl font-bold text-white">📁 分组配置 - {{ user.email }}</h2>

      <!-- 加载状态 -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-brand-500"></div>
      </div>

      <div v-else class="space-y-6">
        <!-- 专属分组区域 -->
        <div v-if="exclusiveGroups.length > 0">
          <div class="mb-3 flex items-center gap-2">
            <div class="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
            <h4 class="text-sm font-semibold text-slate-300">专属分组</h4>
            <span class="text-xs text-slate-400">({{ exclusiveGroupConfigs.filter(c => c.isSelected).length }}/{{ exclusiveGroupConfigs.length }})</span>
          </div>
          <div class="grid gap-3">
            <div
              v-for="config in exclusiveGroupConfigs"
              :key="config.groupId"
              :class="[
                'rounded-xl border-2 p-4 transition-all',
                config.isSelected
                  ? 'border-purple-500/50 bg-purple-500/10'
                  : 'border-slate-700/50 bg-slate-800/40 hover:border-slate-600'
              ]"
            >
              <div class="flex items-center gap-4">
                <!-- 复选框 -->
                <label class="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    :checked="config.isSelected"
                    @change="toggleExclusiveGroup(config.groupId)"
                    class="h-5 w-5 rounded border-slate-600 bg-slate-800 text-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  />
                </label>

                <!-- 分组信息 -->
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="text-base font-semibold text-white">{{ config.groupName }}</span>
                    <span class="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs font-medium text-purple-300">
                      专属
                    </span>
                  </div>
                  <div class="mt-1 text-sm text-slate-400">
                    平台: {{ config.platform }} • 默认倍率: {{ config.defaultRate }}x
                  </div>
                </div>

                <!-- 专属倍率输入 -->
                <div class="flex items-center gap-2">
                  <label class="text-sm font-medium text-slate-400">自定义倍率</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    :value="config.customRate ?? ''"
                    @input="updateCustomRate(config.groupId, ($event.target as HTMLInputElement).value)"
                    :placeholder="String(config.defaultRate)"
                    class="w-24 rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-2 text-sm text-white placeholder-slate-500 transition focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 公开分组区域 -->
        <div v-if="publicGroups.length > 0">
          <div class="mb-3 flex items-center gap-2">
            <div class="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
            <h4 class="text-sm font-semibold text-slate-300">公开分组</h4>
            <span class="text-xs text-slate-400">({{ publicGroupConfigs.length }})</span>
          </div>
          <div class="grid gap-3">
            <div
              v-for="config in publicGroupConfigs"
              :key="config.groupId"
              class="rounded-xl border-2 border-emerald-500/50 bg-emerald-500/10 p-4"
            >
              <div class="flex items-center gap-4">
                <!-- 复选框（已选中，禁用） -->
                <div class="flex h-5 w-5 items-center justify-center rounded border-2 border-emerald-500 bg-emerald-500">
                  <svg class="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <!-- 分组信息 -->
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="text-base font-semibold text-white">{{ config.groupName }}</span>
                    <span class="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-300">
                      公开
                    </span>
                  </div>
                  <div class="mt-1 text-sm text-slate-400">
                    平台: {{ config.platform }} • 默认倍率: {{ config.defaultRate }}x
                  </div>
                </div>

                <!-- 专属倍率输入 -->
                <div class="flex items-center gap-2">
                  <label class="text-sm font-medium text-slate-400">自定义倍率</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    :value="config.customRate ?? ''"
                    @input="updateCustomRate(config.groupId, ($event.target as HTMLInputElement).value)"
                    :placeholder="String(config.defaultRate)"
                    class="w-24 rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-2 text-sm text-white placeholder-slate-500 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 无分组提示 -->
        <div v-if="groups.length === 0" class="flex flex-col items-center justify-center py-12">
          <div class="mb-4 text-6xl">📁</div>
          <h3 class="mb-2 text-lg font-bold text-white">暂无可用分组</h3>
          <p class="text-sm text-slate-400">系统中还没有创建任何分组</p>
        </div>
      </div>

      <!-- 按钮 -->
      <div class="mt-6 flex justify-end gap-3 border-t border-slate-700/50 pt-4">
        <button
          @click="handleClose"
          class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800"
        >
          取消
        </button>
        <button
          @click="handleSave"
          :disabled="submitting"
          class="rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-brand-500/30 transition hover:shadow-brand-500/50 disabled:opacity-50"
        >
          {{ submitting ? '保存中...' : '保存配置' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { adminAPI } from '@/api/admin'
import type { AdminUser, AdminGroup } from '@/types'
import { showSuccess, showError } from '@/utils/toast'

interface GroupRateConfig {
  groupId: number
  groupName: string
  platform: string
  isExclusive: boolean
  defaultRate: number
  customRate: number | null
  isSelected: boolean
}

const props = defineProps<{
  show: boolean
  user: AdminUser | null
}>()

const emit = defineEmits<{
  close: []
  success: []
}>()

const groups = ref<AdminGroup[]>([])
const groupConfigs = ref<GroupRateConfig[]>([])
const originalGroupRates = ref<Record<number, number>>({})
const loading = ref(false)
const submitting = ref(false)

const exclusiveGroups = computed(() => groups.value.filter((g) => g.is_exclusive))
const publicGroups = computed(() => groups.value.filter((g) => !g.is_exclusive))
const exclusiveGroupConfigs = computed(() => groupConfigs.value.filter((c) => c.isExclusive))
const publicGroupConfigs = computed(() => groupConfigs.value.filter((c) => !c.isExclusive))

watch(() => props.show, (newVal) => {
  if (newVal && props.user) {
    load()
  }
})

const load = async () => {
  loading.value = true
  try {
    const res = await adminAPI.groups.list(1, 1000)
    groups.value = res.items.filter((g) => g.subscription_type === 'standard' && g.status === 'active')

    const userAllowedGroups = props.user?.allowed_groups || []
    const userGroupRates = props.user?.group_rates || {}

    originalGroupRates.value = { ...userGroupRates }

    groupConfigs.value = groups.value.map((g) => ({
      groupId: g.id,
      groupName: g.name,
      platform: g.platform,
      isExclusive: g.is_exclusive,
      defaultRate: g.rate_multiplier,
      customRate: userGroupRates[g.id] ?? null,
      isSelected: g.is_exclusive ? userAllowedGroups.includes(g.id) : true,
    }))
  } catch (error: any) {
    showError(error.response?.data?.error || '加载分组失败')
  } finally {
    loading.value = false
  }
}

const toggleExclusiveGroup = (groupId: number) => {
  const config = groupConfigs.value.find((c) => c.groupId === groupId)
  if (config && config.isExclusive) {
    config.isSelected = !config.isSelected
  }
}

const updateCustomRate = (groupId: number, value: string) => {
  const config = groupConfigs.value.find((c) => c.groupId === groupId)
  if (config) {
    if (value === '' || value === null || value === undefined) {
      config.customRate = null
    } else {
      const numValue = parseFloat(value)
      config.customRate = isNaN(numValue) ? null : numValue
    }
  }
}

const handleSave = async () => {
  if (!props.user) return
  submitting.value = true

  try {
    const allowedGroups = groupConfigs.value.filter((c) => c.isExclusive && c.isSelected).map((c) => c.groupId)

    const groupRates: Record<number, number | null> = {}
    for (const c of groupConfigs.value) {
      const hadOriginalRate = originalGroupRates.value[c.groupId] !== undefined

      if (c.customRate !== null) {
        groupRates[c.groupId] = c.customRate
      } else if (hadOriginalRate) {
        groupRates[c.groupId] = null
      }
    }

    await adminAPI.users.update(props.user.id, {
      allowed_groups: allowedGroups,
      group_rates: Object.keys(groupRates).length > 0 ? groupRates : undefined,
    })

    showSuccess('分组配置已更新')
    emit('success')
    emit('close')
  } catch (error: any) {
    showError(error.response?.data?.error || '更新分组配置失败')
  } finally {
    submitting.value = false
  }
}

const handleClose = () => {
  emit('close')
}
</script>
