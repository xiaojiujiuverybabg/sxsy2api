<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
    <!-- 页面标题 -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-white">个人资料</h1>
      <p class="mt-2 text-sm text-slate-400">管理你的账户信息和安全设置</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-brand-500/20 border-t-brand-500"></div>
        <p class="text-sm text-slate-400">加载个人信息...</p>
      </div>
    </div>

    <!-- 主内容 -->
    <div v-else-if="user" class="space-y-6">
      <!-- 账户统计卡片 -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <!-- 余额 -->
        <div v-if="!isSimpleMode" class="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/40 p-5 backdrop-blur-sm transition hover:border-brand-500/50">
          <div class="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-brand-500/10 blur-2xl"></div>
          <div class="relative">
            <div class="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">账户余额</div>
            <div class="text-3xl font-bold text-white">${{ formatBalance(user.balance) }}</div>
            <div class="mt-1 text-xs text-slate-400">可用余额</div>
          </div>
        </div>

        <!-- 角色 -->
        <div class="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/40 p-5 backdrop-blur-sm transition hover:border-emerald-500/50">
          <div class="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-emerald-500/10 blur-2xl"></div>
          <div class="relative">
            <div class="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">用户角色</div>
            <div class="text-3xl font-bold text-white">{{ getRoleLabel(user.role) }}</div>
            <div class="mt-1 text-xs text-slate-400">账户权限级别</div>
          </div>
        </div>

        <!-- 注册时间 -->
        <div class="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/40 p-5 backdrop-blur-sm transition hover:border-blue-500/50">
          <div class="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-blue-500/10 blur-2xl"></div>
          <div class="relative">
            <div class="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">注册时间</div>
            <div class="text-xl font-bold text-white">{{ formatDate(user.created_at) }}</div>
            <div class="mt-1 text-xs text-slate-400">账户创建日期</div>
          </div>
        </div>

        <!-- 状态 -->
        <div class="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/40 p-5 backdrop-blur-sm transition hover:border-gold-500/50">
          <div class="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-gold-500/10 blur-2xl"></div>
          <div class="relative">
            <div class="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">账户状态</div>
            <div class="text-3xl font-bold text-white">{{ getStatusLabel(user.status) }}</div>
            <div class="mt-1 text-xs text-slate-400">当前状态</div>
          </div>
        </div>
      </div>

      <!-- 基本信息和密码修改 -->
      <div class="grid gap-6 lg:grid-cols-2">
        <!-- 基本信息 -->
        <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 p-6 backdrop-blur-sm">
          <div class="mb-6 flex items-center gap-2">
            <span class="text-xl">👤</span>
            <h3 class="text-lg font-bold text-white">基本信息</h3>
          </div>
          <div class="space-y-4">
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-300">用户名</label>
              <input
                v-model="profileForm.username"
                type="text"
                placeholder="输入用户名"
                class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-300">邮箱</label>
              <input
                :value="user.email"
                type="email"
                disabled
                class="w-full rounded-lg border border-slate-700/50 bg-slate-900/30 px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
              />
              <p class="mt-1 text-xs text-slate-500">邮箱不可修改</p>
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-300">头像</label>
              <div class="space-y-3">
                <!-- 头像预览 -->
                <div v-if="avatarPreview" class="flex items-center gap-4">
                  <img
                    :src="avatarPreview"
                    alt="头像预览"
                    class="h-20 w-20 rounded-full border-2 border-slate-700/50 object-cover"
                  />
                  <button
                    @click="removeAvatar"
                    type="button"
                    class="text-sm text-red-400 hover:text-red-300 transition"
                  >
                    移除头像
                  </button>
                </div>

                <!-- 上传区域 -->
                <div
                  @click="triggerFileInput"
                  @dragover.prevent="isDragging = true"
                  @dragleave.prevent="isDragging = false"
                  @drop.prevent="handleDrop"
                  class="relative cursor-pointer rounded-lg border-2 border-dashed transition"
                  :class="isDragging ? 'border-brand-500 bg-brand-500/10' : 'border-slate-700/50 bg-slate-900/30 hover:border-brand-500/50 hover:bg-slate-900/50'"
                >
                  <div class="p-6 text-center">
                    <div class="mb-2 text-3xl">📸</div>
                    <p class="text-sm font-medium text-slate-300">点击上传或拖拽图片</p>
                    <p class="mt-1 text-xs text-slate-500">支持 JPG, PNG, GIF, WebP (最大 2MB)</p>
                    <p class="mt-1 text-xs text-slate-500">推荐尺寸: 200x200 像素</p>
                  </div>
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    @change="handleFileSelect"
                    class="hidden"
                  />
                </div>

                <!-- 错误提示 -->
                <p v-if="uploadError" class="text-xs text-red-400">{{ uploadError }}</p>
              </div>
            </div>
            <button
              @click="updateProfileInfo"
              :disabled="updatingProfile"
              class="w-full rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-500/30 transition hover:shadow-brand-500/50 disabled:opacity-50"
            >
              {{ updatingProfile ? '保存中...' : '保存资料' }}
            </button>
          </div>
        </div>

        <!-- 密码修改 -->
        <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 p-6 backdrop-blur-sm">
          <div class="mb-6 flex items-center gap-2">
            <span class="text-xl">🔒</span>
            <h3 class="text-lg font-bold text-white">修改密码</h3>
          </div>
          <div class="space-y-4">
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-300">当前密码</label>
              <input
                v-model="passwordForm.oldPassword"
                type="password"
                placeholder="输入当前密码"
                class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-300">新密码</label>
              <input
                v-model="passwordForm.newPassword"
                type="password"
                placeholder="输入新密码 (至少6位)"
                class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-300">确认新密码</label>
              <input
                v-model="passwordForm.confirmPassword"
                type="password"
                placeholder="再次输入新密码"
                class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <button
              @click="changePassword"
              :disabled="changingPassword || !canChangePassword"
              class="w-full rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-500/30 transition hover:shadow-brand-500/50 disabled:opacity-50"
            >
              {{ changingPassword ? '修改中...' : '修改密码' }}
            </button>
          </div>
        </div>
      </div>

      <!-- OAuth 绑定状态 -->
      <div v-if="hasOAuthProviders" class="rounded-xl border border-slate-700/50 bg-slate-800/40 p-6 backdrop-blur-sm">
        <div class="mb-6 flex items-center gap-2">
          <span class="text-xl">🔗</span>
          <h3 class="text-lg font-bold text-white">第三方账号绑定</h3>
        </div>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <!-- LinuxDo -->
          <div v-if="publicSettings?.linuxdo_oauth_enabled" class="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/40 p-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/20">
                <span class="text-lg">🐧</span>
              </div>
              <div>
                <p class="font-bold text-white">LinuxDo</p>
                <p class="text-xs text-slate-400">{{ (user as any).linuxdo_id ? '已绑定' : '未绑定' }}</p>
              </div>
            </div>
            <span
              class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
              :class="(user as any).linuxdo_id ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 text-slate-400'"
            >
              {{ (user as any).linuxdo_id ? '✓' : '✗' }}
            </span>
          </div>

          <!-- 微信 -->
          <div v-if="publicSettings?.wechat_oauth_enabled" class="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/40 p-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                <span class="text-lg">💬</span>
              </div>
              <div>
                <p class="font-bold text-white">微信</p>
                <p class="text-xs text-slate-400">{{ (user as any).wechat_unionid ? '已绑定' : '未绑定' }}</p>
              </div>
            </div>
            <span
              class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
              :class="(user as any).wechat_unionid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 text-slate-400'"
            >
              {{ (user as any).wechat_unionid ? '✓' : '✗' }}
            </span>
          </div>

          <!-- OIDC -->
          <div v-if="publicSettings?.oidc_oauth_enabled" class="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/40 p-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                <span class="text-lg">🔐</span>
              </div>
              <div>
                <p class="font-bold text-white">{{ publicSettings.oidc_oauth_provider_name || 'OIDC' }}</p>
                <p class="text-xs text-slate-400">{{ (user as any).oidc_sub ? '已绑定' : '未绑定' }}</p>
              </div>
            </div>
            <span
              class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
              :class="(user as any).oidc_sub ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 text-slate-400'"
            >
              {{ (user as any).oidc_sub ? '✓' : '✗' }}
            </span>
          </div>
        </div>
      </div>

      <!-- 余额低提醒设置 -->
      <div v-if="publicSettings?.balance_low_notify_enabled" class="rounded-xl border border-slate-700/50 bg-slate-800/40 p-6 backdrop-blur-sm">
        <div class="mb-6 flex items-center gap-2">
          <span class="text-xl">🔔</span>
          <h3 class="text-lg font-bold text-white">余额提醒设置</h3>
        </div>
        <div class="space-y-4">
          <div class="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/40 p-4">
            <div>
              <p class="font-bold text-white">启用余额低提醒</p>
              <p class="text-sm text-slate-400">余额低于阈值时发送邮件通知</p>
            </div>
            <label class="relative inline-flex cursor-pointer items-center">
              <input
                v-model="notifyForm.enabled"
                type="checkbox"
                class="peer sr-only"
                @change="updateNotifySettings"
              />
              <div class="peer h-6 w-11 rounded-full bg-slate-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-brand-500 peer-checked:after:translate-x-full"></div>
            </label>
          </div>
          <div v-if="notifyForm.enabled">
            <label class="mb-2 block text-sm font-medium text-slate-300">提醒阈值 (USD)</label>
            <input
              v-model.number="notifyForm.threshold"
              type="number"
              min="0"
              step="0.01"
              placeholder="输入阈值金额"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              @blur="updateNotifySettings"
            />
            <p class="mt-2 text-xs text-slate-500">
              系统默认阈值: ${{ (publicSettings.balance_low_notify_threshold || 0).toFixed(2) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { userAPI } from '@/api'
import { showSuccess, showError } from '@/utils/toast'

const authStore = useAuthStore()
const appStore = useAppStore()

const loading = ref(false)
const updatingProfile = ref(false)
const changingPassword = ref(false)

const user = computed(() => authStore.user)
const isSimpleMode = computed(() => authStore.isSimpleMode)
const publicSettings = computed(() => appStore.cachedPublicSettings)

const profileForm = ref({
  username: '',
  avatar_url: '',
})

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const notifyForm = ref({
  enabled: false,
  threshold: 0,
})

const fileInput = ref<HTMLInputElement | null>(null)
const avatarPreview = ref('')
const isDragging = ref(false)
const uploadError = ref('')

const hasOAuthProviders = computed(() => {
  return (
    publicSettings.value?.linuxdo_oauth_enabled ||
    publicSettings.value?.wechat_oauth_enabled ||
    publicSettings.value?.oidc_oauth_enabled
  )
})

const canChangePassword = computed(() => {
  return (
    passwordForm.value.oldPassword &&
    passwordForm.value.newPassword &&
    passwordForm.value.confirmPassword &&
    passwordForm.value.newPassword === passwordForm.value.confirmPassword &&
    passwordForm.value.newPassword.length >= 6
  )
})

const formatBalance = (b: number) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(b)

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    admin: '管理员',
    user: '普通用户',
  }
  return labels[role] || role
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    active: '正常',
    inactive: '禁用',
    banned: '封禁',
  }
  return labels[status] || status
}

const loadProfile = async () => {
  loading.value = true
  try {
    await Promise.all([authStore.refreshUser(), appStore.fetchPublicSettings()])

    if (user.value) {
      profileForm.value.username = user.value.username || ''
      profileForm.value.avatar_url = (user.value as any).avatar_url || ''
      avatarPreview.value = profileForm.value.avatar_url
      notifyForm.value.enabled = user.value.balance_notify_enabled ?? true
      notifyForm.value.threshold = user.value.balance_notify_threshold ?? publicSettings.value?.balance_low_notify_threshold ?? 0
    }
  } catch (error) {
    console.error('加载个人信息失败:', error)
  } finally {
    loading.value = false
  }
}

const updateProfileInfo = async () => {
  updatingProfile.value = true
  try {
    await userAPI.updateProfile({
      username: profileForm.value.username,
      avatar_url: profileForm.value.avatar_url || null,
    })
    await authStore.refreshUser()
    showSuccess('资料更新成功')
  } catch (error) {
    console.error('更新资料失败:', error)
    showError('更新失败: ' + (error as Error).message)
  } finally {
    updatingProfile.value = false
  }
}

const changePassword = async () => {
  if (!canChangePassword.value) return

  changingPassword.value = true
  try {
    await userAPI.changePassword(passwordForm.value.oldPassword, passwordForm.value.newPassword)
    passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
    showSuccess('密码修改成功')
  } catch (error) {
    console.error('修改密码失败:', error)
    showError('修改失败: ' + (error as Error).message)
  } finally {
    changingPassword.value = false
  }
}

const updateNotifySettings = async () => {
  try {
    await userAPI.updateProfile({
      balance_notify_enabled: notifyForm.value.enabled,
      balance_notify_threshold: notifyForm.value.threshold,
    })
    await authStore.refreshUser()
  } catch (error) {
    console.error('更新通知设置失败:', error)
    showError('更新失败: ' + (error as Error).message)
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processImage(file)
  }
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  const file = event.dataTransfer?.files[0]
  if (file) {
    processImage(file)
  }
}

const processImage = (file: File) => {
  uploadError.value = ''

  // 验证文件类型
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!validTypes.includes(file.type)) {
    uploadError.value = '不支持的图片格式，请上传 JPG, PNG, GIF 或 WebP 格式'
    return
  }

  // 验证文件大小 (2MB)
  const maxSize = 2 * 1024 * 1024
  if (file.size > maxSize) {
    uploadError.value = '图片大小超过 2MB，请选择更小的图片'
    return
  }

  // 读取并转换为 base64
  const reader = new FileReader()
  reader.onload = (e) => {
    const base64 = e.target?.result as string

    // 验证图片尺寸
    const img = new Image()
    img.onload = () => {
      // 如果图片过大，给出警告但仍然允许
      if (img.width > 500 || img.height > 500) {
        uploadError.value = '提示: 图片尺寸较大，建议使用 200x200 以获得更好的显示效果'
      }

      avatarPreview.value = base64
      profileForm.value.avatar_url = base64
    }
    img.onerror = () => {
      uploadError.value = '图片加载失败，请选择有效的图片文件'
    }
    img.src = base64
  }
  reader.onerror = () => {
    uploadError.value = '图片读取失败，请重试'
  }
  reader.readAsDataURL(file)
}

const removeAvatar = () => {
  avatarPreview.value = ''
  profileForm.value.avatar_url = ''
  uploadError.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

onMounted(() => {
  loadProfile()
})
</script>
