<template>
  <div class="space-y-6">
    <!-- S3 Storage Configuration Card -->
    <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
      <div class="border-b border-slate-700/50 px-6 py-4">
        <h2 class="text-lg font-semibold text-white">S3 存储配置</h2>
        <p class="mt-1 text-sm text-slate-400">配置用于备份存储的 S3 兼容对象存储服务</p>
      </div>
      <div class="p-6 space-y-4">
        <div v-if="s3Loading" class="text-center text-sm text-slate-500 py-4">加载中...</div>
        <template v-else>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-300">端点</label>
              <input v-model="s3Config.endpoint" type="text" class="form-input" placeholder="https://<account_id>.r2.cloudflarestorage.com" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-300">区域</label>
              <input v-model="s3Config.region" type="text" class="form-input" placeholder="auto" />
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-300">存储桶</label>
              <input v-model="s3Config.bucket" type="text" class="form-input" placeholder="my-backups" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-300">前缀</label>
              <input v-model="s3Config.prefix" type="text" class="form-input" placeholder="backups/" />
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-300">访问密钥 ID</label>
              <input v-model="s3Config.access_key_id" type="text" class="form-input" placeholder="访问密钥 ID" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-300">密钥访问密钥</label>
              <div class="relative">
                <input
                  v-model="s3SecretKeyInput"
                  :type="s3ShowSecret ? 'text' : 'password'"
                  class="form-input pr-20"
                  :placeholder="s3HadSecretKey && !s3SecretKeyInput ? '已配置（留空不修改）' : '密钥访问密钥'"
                />
                <button
                  type="button"
                  @click="s3ShowSecret = !s3ShowSecret"
                  class="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs text-slate-400 hover:text-white transition"
                >
                  {{ s3ShowSecret ? '隐藏' : '显示' }}
                </button>
              </div>
              <p v-if="s3HadSecretKey && !s3SecretKeyInput" class="mt-1 text-xs text-gold-400">已配置</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="s3Config.force_path_style" type="checkbox" class="sr-only peer" />
              <div class="w-9 h-5 rounded-full peer peer-checked:bg-gold-500 bg-slate-700 transition-colors after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
            <span class="text-sm text-slate-300">强制路径样式</span>
          </div>
          <div class="flex items-center gap-3 pt-2">
            <button
              type="button"
              @click="testS3Connection"
              :disabled="s3Testing"
              class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="s3Testing" class="inline-flex items-center gap-2">
                <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                测试中...
              </span>
              <span v-else>测试连接</span>
            </button>
            <button
              type="button"
              @click="saveS3Config"
              :disabled="s3Saving"
              class="rounded-lg border border-gold-500/50 bg-gradient-to-r from-gold-500/20 to-gold-600/20 px-4 py-2 text-sm font-medium text-gold-400 transition hover:border-gold-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="s3Saving" class="inline-flex items-center gap-2">
                <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                保存中...
              </span>
              <span v-else>保存</span>
            </button>
          </div>
        </template>
      </div>
    </div>

    <!-- Schedule Configuration Card -->
    <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
      <div class="border-b border-slate-700/50 px-6 py-4">
        <h2 class="text-lg font-semibold text-white">计划配置</h2>
        <p class="mt-1 text-sm text-slate-400">配置自动备份的执行计划</p>
      </div>
      <div class="p-6 space-y-4">
        <div v-if="scheduleLoading" class="text-center text-sm text-slate-500 py-4">加载中...</div>
        <template v-else>
          <div class="flex items-center gap-3">
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="scheduleConfig.enabled" type="checkbox" class="sr-only peer" />
              <div class="w-9 h-5 rounded-full peer peer-checked:bg-gold-500 bg-slate-700 transition-colors after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
            <span class="text-sm text-slate-300">启用</span>
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-300">Cron 表达式</label>
            <input v-model="scheduleConfig.cron_expr" type="text" class="form-input font-mono" placeholder="0 2 * * *" />
            <p class="mt-1 text-xs text-slate-500">每天凌晨 2 点执行：0 2 * * *</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-300">保留天数</label>
              <input v-model.number="scheduleConfig.retain_days" type="number" min="1" class="form-input" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-300">保留数量</label>
              <input v-model.number="scheduleConfig.retain_count" type="number" min="1" class="form-input" />
            </div>
          </div>
          <div class="flex items-center gap-3 pt-2">
            <button
              type="button"
              @click="saveSchedule"
              :disabled="scheduleSaving"
              class="rounded-lg border border-gold-500/50 bg-gradient-to-r from-gold-500/20 to-gold-600/20 px-4 py-2 text-sm font-medium text-gold-400 transition hover:border-gold-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="scheduleSaving" class="inline-flex items-center gap-2">
                <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                保存中...
              </span>
              <span v-else>保存</span>
            </button>
          </div>
        </template>
      </div>
    </div>

    <!-- Backup Operations Card -->
    <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
      <div class="border-b border-slate-700/50 px-6 py-4">
        <h2 class="text-lg font-semibold text-white">备份操作</h2>
        <p class="mt-1 text-sm text-slate-400">创建手动备份及管理备份记录</p>
      </div>
      <div class="p-6 space-y-6">
        <!-- Create Backup Section -->
        <div class="flex flex-wrap items-center gap-3 rounded-lg border border-slate-700/50 bg-slate-900/30 p-4">
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-slate-300 whitespace-nowrap">过期天数</label>
            <input v-model.number="manualExpireDays" type="number" min="1" class="form-input w-24" placeholder="30" />
          </div>
          <button
            type="button"
            @click="createBackup"
            :disabled="creatingBackup"
            class="rounded-lg border border-gold-500/50 bg-gradient-to-r from-gold-500/20 to-gold-600/20 px-4 py-2 text-sm font-medium text-gold-400 transition hover:border-gold-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="creatingBackup" class="inline-flex items-center gap-2">
              <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              创建中...
            </span>
            <span v-else>创建备份</span>
          </button>
          <button
            type="button"
            @click="loadBackups"
            :disabled="backupsLoading"
            class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="backupsLoading" class="inline-flex items-center gap-2">
              <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            </span>
            <span v-else>刷新</span>
          </button>
        </div>

        <!-- Backup Records Table -->
        <div v-if="backupsLoading" class="text-center text-sm text-slate-500 py-8">加载备份记录中...</div>
        <div v-else-if="backups.length === 0" class="text-center text-sm text-slate-500 py-8">暂无备份记录</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-700/50 text-left text-xs text-slate-400 uppercase tracking-wider">
                <th class="px-4 py-3 whitespace-nowrap">ID</th>
                <th class="px-4 py-3 whitespace-nowrap">状态</th>
                <th class="px-4 py-3 whitespace-nowrap">文件名</th>
                <th class="px-4 py-3 whitespace-nowrap">大小</th>
                <th class="px-4 py-3 whitespace-nowrap">过期时间</th>
                <th class="px-4 py-3 whitespace-nowrap">触发方式</th>
                <th class="px-4 py-3 whitespace-nowrap">开始时间</th>
                <th class="px-4 py-3 whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="backup in backups"
                :key="backup.id"
                class="border-b border-slate-700/30 hover:bg-slate-800/50 transition"
              >
                <td class="px-4 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">{{ backup.id.slice(0, 8) }}...</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span
                    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                    :class="statusBadgeClass(backup.status)"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" :class="statusDotClass(backup.status)"></span>
                    {{ statusLabel(backup.status) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-slate-300 max-w-[200px] truncate" :title="backup.file_name">{{ backup.file_name }}</td>
                <td class="px-4 py-3 text-slate-400 whitespace-nowrap">{{ formatSize(backup.size_bytes) }}</td>
                <td class="px-4 py-3 text-slate-400 whitespace-nowrap">{{ backup.expires_at ? formatDateTime(backup.expires_at) : '-' }}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span class="text-xs px-2 py-0.5 rounded-full" :class="backup.triggered_by === 'manual' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'">
                    {{ backup.triggered_by === 'manual' ? '手动' : '计划' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-slate-400 whitespace-nowrap">{{ formatDateTime(backup.started_at) }}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <!-- Restore inline -->
                    <template v-if="restoringId === backup.id">
                      <input
                        v-model="restorePassword"
                        type="password"
                        class="form-input w-32 !py-1.5 !text-xs"
                        placeholder="加密密码"
                        @keydown.enter="confirmRestore(backup.id)"
                      />
                      <button
                        type="button"
                        @click="confirmRestore(backup.id)"
                        class="rounded border border-gold-500/50 bg-gold-500/10 px-2 py-1 text-xs text-gold-400 hover:bg-gold-500/20 transition"
                      >
                        确认
                      </button>
                      <button
                        type="button"
                        @click="cancelRestore"
                        class="rounded border border-slate-600 px-2 py-1 text-xs text-slate-400 hover:text-white transition"
                      >
                        取消
                      </button>
                    </template>
                    <template v-else>
                      <button
                        type="button"
                        @click="downloadBackup(backup.id)"
                        class="rounded border border-slate-600 px-2 py-1 text-xs text-slate-400 hover:text-blue-400 hover:border-blue-500/50 transition"
                        title="下载"
                      >
                        下载
                      </button>
                      <button
                        type="button"
                        @click="startRestore(backup.id)"
                        class="rounded border border-slate-600 px-2 py-1 text-xs text-slate-400 hover:text-amber-400 hover:border-amber-500/50 transition"
                        title="恢复"
                      >
                        恢复
                      </button>
                      <button
                        type="button"
                        @click="deleteBackup(backup.id)"
                        class="rounded border border-slate-600 px-2 py-1 text-xs text-slate-400 hover:text-red-400 hover:border-red-500/50 transition"
                        title="删除"
                      >
                        删除
                      </button>
                    </template>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { adminAPI } from '@/api/admin'
import { showSuccess, showError } from '@/utils/toast'
import type { BackupS3Config, BackupScheduleConfig, BackupRecord } from '@/types'

// ==================== S3 Configuration ====================
const s3Config = reactive<BackupS3Config>({
  endpoint: '',
  region: 'auto',
  bucket: '',
  access_key_id: '',
  prefix: 'backups/',
  force_path_style: false,
})

const s3Loading = ref(false)
const s3Saving = ref(false)
const s3Testing = ref(false)
const s3SecretKeyInput = ref('')
const s3HadSecretKey = ref(false)
const s3ShowSecret = ref(false)

async function loadS3Config() {
  s3Loading.value = true
  try {
    const config = await adminAPI.backup.getS3Config()
    s3Config.endpoint = config.endpoint || ''
    s3Config.region = config.region || 'auto'
    s3Config.bucket = config.bucket || ''
    s3Config.access_key_id = config.access_key_id || ''
    s3Config.prefix = config.prefix || 'backups/'
    s3Config.force_path_style = config.force_path_style || false
    // Track whether the original config had a secret key
    s3HadSecretKey.value = !!config.secret_access_key
    s3SecretKeyInput.value = ''
  } catch (e: any) {
    showError(e?.response?.data?.message || e?.message || '加载 S3 配置失败')
  } finally {
    s3Loading.value = false
  }
}

async function saveS3Config() {
  s3Saving.value = true
  try {
    const payload: BackupS3Config & { secret_access_key?: string } = {
      endpoint: s3Config.endpoint,
      region: s3Config.region,
      bucket: s3Config.bucket,
      access_key_id: s3Config.access_key_id,
      prefix: s3Config.prefix,
      force_path_style: s3Config.force_path_style,
    }
    if (s3SecretKeyInput.value) {
      payload.secret_access_key = s3SecretKeyInput.value
    }
    await adminAPI.backup.updateS3Config(payload)
    showSuccess('S3 配置已保存')
    s3SecretKeyInput.value = ''
    s3HadSecretKey.value = true
  } catch (e: any) {
    showError(e?.response?.data?.message || e?.message || '保存 S3 配置失败')
  } finally {
    s3Saving.value = false
  }
}

async function testS3Connection() {
  s3Testing.value = true
  try {
    const payload: BackupS3Config & { secret_access_key?: string } = {
      endpoint: s3Config.endpoint,
      region: s3Config.region,
      bucket: s3Config.bucket,
      access_key_id: s3Config.access_key_id,
      prefix: s3Config.prefix,
      force_path_style: s3Config.force_path_style,
    }
    if (s3SecretKeyInput.value) {
      payload.secret_access_key = s3SecretKeyInput.value
    }
    await adminAPI.backup.testS3Connection(payload)
    showSuccess('S3 连接测试成功')
  } catch (e: any) {
    showError(e?.response?.data?.message || e?.message || 'S3 连接测试失败')
  } finally {
    s3Testing.value = false
  }
}

// ==================== Schedule Configuration ====================
const scheduleConfig = reactive<BackupScheduleConfig>({
  enabled: false,
  cron_expr: '0 2 * * *',
  retain_days: 14,
  retain_count: 10,
})

const scheduleLoading = ref(false)
const scheduleSaving = ref(false)

async function loadSchedule() {
  scheduleLoading.value = true
  try {
    const config = await adminAPI.backup.getSchedule()
    scheduleConfig.enabled = config.enabled
    scheduleConfig.cron_expr = config.cron_expr || '0 2 * * *'
    scheduleConfig.retain_days = config.retain_days ?? 14
    scheduleConfig.retain_count = config.retain_count ?? 10
  } catch (e: any) {
    showError(e?.response?.data?.message || e?.message || '加载计划配置失败')
  } finally {
    scheduleLoading.value = false
  }
}

async function saveSchedule() {
  scheduleSaving.value = true
  try {
    await adminAPI.backup.updateSchedule({
      enabled: scheduleConfig.enabled,
      cron_expr: scheduleConfig.cron_expr,
      retain_days: scheduleConfig.retain_days,
      retain_count: scheduleConfig.retain_count,
    })
    showSuccess('计划配置已保存')
  } catch (e: any) {
    showError(e?.response?.data?.message || e?.message || '保存计划配置失败')
  } finally {
    scheduleSaving.value = false
  }
}

// ==================== Backup Operations ====================
const backups = ref<BackupRecord[]>([])
const backupsLoading = ref(false)
const creatingBackup = ref(false)
const manualExpireDays = ref<number>(30)

const restoringId = ref<string | null>(null)
const restorePassword = ref('')

async function loadBackups() {
  backupsLoading.value = true
  try {
    const data = await adminAPI.backup.listBackups()
    backups.value = data.items || []
  } catch (e: any) {
    showError(e?.response?.data?.message || e?.message || '加载备份列表失败')
  } finally {
    backupsLoading.value = false
  }
}

async function createBackup() {
  creatingBackup.value = true
  try {
    const expireDays = manualExpireDays.value > 0 ? manualExpireDays.value : undefined
    await adminAPI.backup.createBackup(expireDays)
    showSuccess('备份创建成功')
    await loadBackups()
  } catch (e: any) {
    showError(e?.response?.data?.message || e?.message || '创建备份失败')
  } finally {
    creatingBackup.value = false
  }
}

async function downloadBackup(id: string) {
  try {
    const { url } = await adminAPI.backup.getDownloadURL(id)
    window.open(url, '_blank')
  } catch (e: any) {
    showError(e?.response?.data?.message || e?.message || '获取下载链接失败')
  }
}

function startRestore(id: string) {
  restoringId.value = id
  restorePassword.value = ''
}

function cancelRestore() {
  restoringId.value = null
  restorePassword.value = ''
}

async function confirmRestore(id: string) {
  if (!restorePassword.value.trim()) {
    showError('请输入加密密码')
    return
  }
  try {
    await adminAPI.backup.restoreBackup(id, restorePassword.value)
    showSuccess('备份恢复已启动')
    restoringId.value = null
    restorePassword.value = ''
    await loadBackups()
  } catch (e: any) {
    showError(e?.response?.data?.message || e?.message || '恢复备份失败')
  }
}

async function deleteBackup(id: string) {
  if (!window.confirm('确定要删除此备份吗？此操作不可撤销。')) return
  try {
    await adminAPI.backup.deleteBackup(id)
    showSuccess('备份已删除')
    await loadBackups()
  } catch (e: any) {
    showError(e?.response?.data?.message || e?.message || '删除备份失败')
  }
}

// ==================== Helpers ====================
function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  if (!bytes || bytes < 0) return '-'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 2) + ' ' + units[i]
}

function formatDateTime(iso: string): string {
  if (!iso) return '-'
  try {
    const d = new Date(iso)
    return d.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'completed': return 'bg-green-500/10 text-green-400'
    case 'running': return 'bg-blue-500/10 text-blue-400'
    case 'failed': return 'bg-red-500/10 text-red-400'
    case 'pending': return 'bg-yellow-500/10 text-yellow-400'
    default: return 'bg-slate-500/10 text-slate-400'
  }
}

function statusDotClass(status: string): string {
  switch (status) {
    case 'completed': return 'bg-green-500'
    case 'running': return 'bg-blue-500'
    case 'failed': return 'bg-red-500'
    case 'pending': return 'bg-yellow-500'
    default: return 'bg-slate-500'
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case 'completed': return '已完成'
    case 'running': return '运行中'
    case 'failed': return '失败'
    case 'pending': return '等待中'
    default: return status
  }
}

// ==================== Mount ====================
onMounted(() => {
  loadS3Config()
  loadSchedule()
  loadBackups()
})
</script>

<style scoped>
.form-input {
  @apply w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2 text-white backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20 placeholder:text-slate-600;
}

textarea.form-input {
  @apply resize-y;
}

select.form-input {
  @apply appearance-none cursor-pointer;
}
</style>
