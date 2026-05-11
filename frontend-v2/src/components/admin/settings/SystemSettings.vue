<template>
  <div class="space-y-6">
    <!-- System Version -->
    <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
      <div class="border-b border-slate-700/50 px-6 py-4">
        <h2 class="text-lg font-semibold text-white">系统版本</h2>
        <p class="mt-1 text-sm text-slate-400">查看当前版本并检查更新</p>
      </div>
      <div class="p-6 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-slate-400">当前版本</p>
            <p class="text-xl font-semibold text-white">{{ form.version || 'N/A' }}</p>
          </div>
          <button
            type="button"
            :disabled="versionLoading"
            @click="checkVersion"
            class="rounded-lg border border-gold-500/50 bg-gold-500/10 px-4 py-2 text-sm font-medium text-gold-400 hover:bg-gold-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="versionLoading" class="inline-flex items-center gap-2">
              <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
              检查中...
            </span>
            <span v-else>检查更新</span>
          </button>
        </div>

        <div v-if="versionInfo" class="rounded-lg border border-slate-700/50 bg-slate-900/30 p-4 space-y-3">
          <div class="flex items-center gap-2">
            <span v-if="versionInfo.has_update" class="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400">
              <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
              有新版本可用
            </span>
            <span v-else class="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
              <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
              已是最新版本
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span class="text-slate-500">当前版本：</span>
              <span class="text-slate-300">{{ versionInfo.current_version }}</span>
            </div>
            <div>
              <span class="text-slate-500">最新版本：</span>
              <span class="text-slate-300">{{ versionInfo.latest_version }}</span>
            </div>
            <div>
              <span class="text-slate-500">构建类型：</span>
              <span class="text-slate-300">{{ versionInfo.build_type || 'N/A' }}</span>
            </div>
          </div>

          <div v-if="versionInfo.release_info" class="rounded-lg border border-slate-700/50 bg-slate-800/60 p-3 space-y-2">
            <p class="text-sm font-medium text-white">{{ versionInfo.release_info.name }}</p>
            <p class="text-xs text-slate-400 whitespace-pre-wrap">{{ versionInfo.release_info.body }}</p>
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-500">{{ versionInfo.release_info.published_at }}</span>
              <a :href="versionInfo.release_info.html_url" target="_blank" rel="noopener noreferrer" class="text-gold-400 hover:text-gold-300 transition">
                查看详情
                <svg class="inline-block h-3 w-3 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </a>
            </div>
          </div>

          <div v-if="versionInfo.warning" class="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-sm text-amber-400">
            {{ versionInfo.warning }}
          </div>
        </div>
      </div>
    </div>

    <!-- System Operations -->
    <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
      <div class="border-b border-slate-700/50 px-6 py-4">
        <h2 class="text-lg font-semibold text-white">系统操作</h2>
        <p class="mt-1 text-sm text-slate-400">执行系统更新、回滚或重启</p>
      </div>
      <div class="p-6">
        <div class="flex flex-wrap items-center gap-3">
          <button
            type="button"
            :disabled="operationLoading === 'update'"
            @click="handleUpdate"
            class="inline-flex items-center gap-2 rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="operationLoading === 'update'" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
            <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" /></svg>
            {{ operationLoading === 'update' ? '更新中...' : '执行更新' }}
          </button>

          <button
            type="button"
            :disabled="operationLoading === 'rollback'"
            @click="handleRollback"
            class="inline-flex items-center gap-2 rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400 hover:bg-amber-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="operationLoading === 'rollback'" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
            <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" /></svg>
            {{ operationLoading === 'rollback' ? '回滚中...' : '回滚' }}
          </button>

          <button
            type="button"
            :disabled="operationLoading === 'restart'"
            @click="handleRestart"
            class="inline-flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="operationLoading === 'restart'" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
            <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            {{ operationLoading === 'restart' ? '重启中...' : '重启服务' }}
          </button>
        </div>

        <div v-if="operationResult" class="mt-4 rounded-lg border border-slate-700/50 bg-slate-900/30 p-3">
          <p class="text-sm text-slate-300">{{ operationResult }}</p>
          <p v-if="operationNeedRestart" class="mt-1 text-xs text-amber-400">服务需要重启以完成变更。</p>
        </div>
      </div>
    </div>

    <!-- Ops Monitoring Settings -->
    <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
      <div class="border-b border-slate-700/50 px-6 py-4">
        <h2 class="text-lg font-semibold text-white">运维监控设置</h2>
        <p class="mt-1 text-sm text-slate-400">配置系统运维监控相关参数</p>
      </div>
      <div class="p-6 space-y-4">
        <!-- Enable Ops Monitoring -->
        <div class="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/30 p-4">
          <div>
            <p class="text-sm font-medium text-white">启用 Ops 监控</p>
            <p class="text-xs text-slate-400 mt-0.5">开启后系统将收集并展示运维监控数据</p>
          </div>
          <button
            type="button"
            @click="toggle('ops_monitoring_enabled')"
            class="toggle-switch"
            :class="form.ops_monitoring_enabled ? 'bg-gold-500' : 'bg-slate-700'"
          >
            <span class="toggle-knob" :class="form.ops_monitoring_enabled ? 'translate-x-6' : 'translate-x-1'" />
          </button>
        </div>

        <!-- Enable Realtime Monitoring -->
        <div class="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/30 p-4">
          <div>
            <p class="text-sm font-medium text-white">启用实时监控</p>
            <p class="text-xs text-slate-400 mt-0.5">开启后系统将实时推送运维监控数据更新</p>
          </div>
          <button
            type="button"
            @click="toggle('ops_realtime_monitoring_enabled')"
            class="toggle-switch"
            :class="form.ops_realtime_monitoring_enabled ? 'bg-gold-500' : 'bg-slate-700'"
          >
            <span class="toggle-knob" :class="form.ops_realtime_monitoring_enabled ? 'translate-x-6' : 'translate-x-1'" />
          </button>
        </div>

        <!-- Default Query Mode -->
        <div class="rounded-lg border border-slate-700/50 bg-slate-900/30 p-4">
          <label class="mb-2 block text-sm font-medium text-white">默认查询模式</label>
          <p class="mb-2 text-xs text-slate-400">设置运维监控的默认数据查询模式</p>
          <select v-model="form.ops_query_mode_default" class="form-input max-w-xs">
            <option value="auto">auto (自动)</option>
            <option value="raw">raw (原始)</option>
            <option value="preagg">preagg (预聚合)</option>
          </select>
        </div>

        <!-- Metrics Interval -->
        <div class="rounded-lg border border-slate-700/50 bg-slate-900/30 p-4">
          <label class="mb-2 block text-sm font-medium text-white">指标采集间隔(秒)</label>
          <p class="mb-2 text-xs text-slate-400">设置运维监控指标采集的时间间隔，默认 60 秒</p>
          <input
            v-model.number="form.ops_metrics_interval_seconds"
            type="number"
            min="10"
            max="3600"
            class="form-input max-w-xs"
            placeholder="60"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { SystemSettings, VersionInfo, UpdateResult } from '@/types'
import { adminAPI } from '@/api/admin'
import { showSuccess, showError } from '@/utils/toast'

const props = defineProps<{
  form: SystemSettings & Record<string, any>
}>()

const form = computed(() => props.form)

function toggle(key: string) {
  ;(form.value as any)[key] = !(form.value as any)[key]
}

// ---- Version ----
const versionLoading = ref(false)
const versionInfo = ref<VersionInfo | null>(null)

async function checkVersion() {
  versionLoading.value = true
  try {
    const result = await adminAPI.system.checkUpdates(true)
    versionInfo.value = result
    if (result.has_update) {
      showSuccess(`发现新版本: ${result.latest_version}`)
    } else {
      showSuccess('已是最新版本')
    }
  } catch (e: any) {
    showError(e?.response?.data?.message || e?.message || '检查更新失败')
  } finally {
    versionLoading.value = false
  }
}

// ---- Operations ----
const operationLoading = ref<'update' | 'rollback' | 'restart' | null>(null)
const operationResult = ref<string | null>(null)
const operationNeedRestart = ref(false)

async function handleUpdate() {
  operationLoading.value = 'update'
  operationResult.value = null
  operationNeedRestart.value = false
  try {
    const result: UpdateResult = await adminAPI.system.performUpdate()
    operationResult.value = result.message
    operationNeedRestart.value = result.need_restart
    showSuccess(result.message || '更新完成')
  } catch (e: any) {
    showError(e?.response?.data?.message || e?.message || '执行更新失败')
  } finally {
    operationLoading.value = null
  }
}

async function handleRollback() {
  if (!window.confirm('确认要回滚到上一个版本吗？此操作不可撤销。')) return
  operationLoading.value = 'rollback'
  operationResult.value = null
  operationNeedRestart.value = false
  try {
    const result: UpdateResult = await adminAPI.system.rollback()
    operationResult.value = result.message
    operationNeedRestart.value = result.need_restart
    showSuccess(result.message || '回滚完成')
  } catch (e: any) {
    showError(e?.response?.data?.message || e?.message || '回滚失败')
  } finally {
    operationLoading.value = null
  }
}

async function handleRestart() {
  if (!window.confirm('确认要重启服务吗？正在进行的请求可能会被中断。')) return
  operationLoading.value = 'restart'
  operationResult.value = null
  operationNeedRestart.value = false
  try {
    const result = await adminAPI.system.restartService()
    operationResult.value = result.message
    showSuccess(result.message || '重启命令已发送')
  } catch (e: any) {
    showError(e?.response?.data?.message || e?.message || '重启服务失败')
  } finally {
    operationLoading.value = null
  }
}
</script>

<style scoped>
.form-input {
  @apply w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2 text-white backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20 placeholder:text-slate-600;
}
select.form-input {
  @apply appearance-none cursor-pointer;
}
.toggle-switch {
  @apply relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200;
}
.toggle-knob {
  @apply inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200;
}
</style>
