<template>
  <AtlasPage eyebrow="个人设置" title="账户管理" description="管理你的个人信息和安全设置">
    <template #actions>
      <div class="flex flex-wrap gap-3">
        <button
          class="rounded-full border border-line bg-white px-4 py-2 text-sm font-black text-text-secondary transition hover:border-brand-300"
          @click="loadProfile"
        >
          刷新
        </button>
      </div>
    </template>

    <section v-if="loading" class="mt-8 flex items-center justify-center py-12">
      <div class="text-center">
        <div class="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"></div>
        <p class="text-sm text-text-secondary">加载个人信息...</p>
      </div>
    </section>

    <template v-else-if="user">
      <section class="mt-8 grid gap-6 lg:grid-cols-2">
        <!-- 基本信息 -->
        <div class="rounded-2xl border border-line bg-surface p-6">
          <div class="mb-4">
            <p class="text-xs font-black uppercase tracking-wider text-text-tertiary">基本信息</p>
            <h3 class="mt-1 text-lg font-black text-text-primary">个人资料</h3>
          </div>
          <div class="space-y-4">
            <div>
              <label class="mb-2 block text-sm font-black text-text-primary">用户名</label>
              <input
                v-model="profileForm.username"
                type="text"
                class="w-full rounded-lg border border-line bg-white px-4 py-2 text-sm transition focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label class="mb-2 block text-sm font-black text-text-primary">邮箱</label>
              <input
                :value="user.email"
                type="email"
                disabled
                class="w-full rounded-lg border border-line bg-surface-secondary px-4 py-2 text-sm text-text-tertiary"
              />
              <p class="mt-1 text-xs text-text-tertiary">邮箱不可修改</p>
            </div>
            <div>
              <label class="mb-2 block text-sm font-black text-text-primary">头像 URL</label>
              <input
                v-model="profileForm.avatar_url"
                type="url"
                placeholder="https://example.com/avatar.jpg"
                class="w-full rounded-lg border border-line bg-white px-4 py-2 text-sm transition focus:border-brand-500 focus:outline-none"
              />
            </div>
            <button
              @click="updateProfileInfo"
              :disabled="updatingProfile"
              class="w-full rounded-full bg-brand-500 px-5 py-3 text-sm font-black text-white transition hover:bg-brand-700 disabled:opacity-50"
            >
              {{ updatingProfile ? '保存中...' : '保存资料' }}
            </button>
          </div>
        </div>

        <!-- 密码修改 -->
        <div class="rounded-2xl border border-line bg-surface p-6">
          <div class="mb-4">
            <p class="text-xs font-black uppercase tracking-wider text-text-tertiary">安全设置</p>
            <h3 class="mt-1 text-lg font-black text-text-primary">修改密码</h3>
          </div>
          <div class="space-y-4">
            <div>
              <label class="mb-2 block text-sm font-black text-text-primary">当前密码</label>
              <input
                v-model="passwordForm.oldPassword"
                type="password"
                class="w-full rounded-lg border border-line bg-white px-4 py-2 text-sm transition focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label class="mb-2 block text-sm font-black text-text-primary">新密码</label>
              <input
                v-model="passwordForm.newPassword"
                type="password"
                class="w-full rounded-lg border border-line bg-white px-4 py-2 text-sm transition focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label class="mb-2 block text-sm font-black text-text-primary">确认新密码</label>
              <input
                v-model="passwordForm.confirmPassword"
                type="password"
                class="w-full rounded-lg border border-line bg-white px-4 py-2 text-sm transition focus:border-brand-500 focus:outline-none"
              />
            </div>
            <button
              @click="changePassword"
              :disabled="changingPassword || !canChangePassword"
              class="w-full rounded-full bg-brand-500 px-5 py-3 text-sm font-black text-white transition hover:bg-brand-700 disabled:opacity-50"
            >
              {{ changingPassword ? '修改中...' : '修改密码' }}
            </button>
          </div>
        </div>
      </section>

      <!-- 账户统计 -->
      <section class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          v-if="!isSimpleMode"
          label="账户余额"
          :value="`$${formatBalance(user.balance || 0)}`"
          mark="$"
          tone="ember"
          hint="当前可用余额"
        />
        <MetricTile
          label="用户角色"
          :value="getRoleLabel(user.role)"
          mark="◎"
          tone="moss"
          hint="账户权限级别"
        />
        <MetricTile
          label="注册时间"
          :value="formatDate((user as any).created_at || new Date().toISOString())"
          mark="◇"
          tone="steel"
          hint="账户创建日期"
        />
        <MetricTile
          label="账户状态"
          :value="getStatusLabel(user.status || 'active')"
          mark="✓"
          :tone="(user.status || 'active') === 'active' ? 'moss' : 'ink'"
          hint="当前账户状态"
        />
      </section>

      <!-- OAuth 绑定 -->
      <section v-if="hasOAuthProviders" class="mt-6 rounded-2xl border border-line bg-surface p-6">
        <div class="mb-4">
          <p class="text-xs font-black uppercase tracking-wider text-text-tertiary">第三方账号</p>
          <h3 class="mt-1 text-lg font-black text-text-primary">OAuth 绑定</h3>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <div
            v-if="publicSettings?.linuxdo_oauth_enabled"
            class="flex items-center justify-between rounded-lg border border-line bg-white p-4"
          >
            <div class="flex items-center gap-3">
              <div class="rounded-lg bg-brand-100 p-2">
                <span class="text-lg">🐧</span>
              </div>
              <div>
                <p class="font-black text-text-primary">LinuxDo</p>
                <p class="text-xs text-text-tertiary">
                  {{ (user as any).linuxdo_id ? '已绑定' : '未绑定' }}
                </p>
              </div>
            </div>
            <StatusPill :label="(user as any).linuxdo_id ? '已绑定' : '未绑定'" :tone="(user as any).linuxdo_id ? 'success' : 'neutral'" />
          </div>

          <div
            v-if="publicSettings?.wechat_oauth_enabled"
            class="flex items-center justify-between rounded-lg border border-line bg-white p-4"
          >
            <div class="flex items-center gap-3">
              <div class="rounded-lg bg-moss-100 p-2">
                <span class="text-lg">💬</span>
              </div>
              <div>
                <p class="font-black text-text-primary">微信</p>
                <p class="text-xs text-text-tertiary">
                  {{ (user as any).wechat_unionid ? '已绑定' : '未绑定' }}
                </p>
              </div>
            </div>
            <StatusPill :label="(user as any).wechat_unionid ? '已绑定' : '未绑定'" :tone="(user as any).wechat_unionid ? 'success' : 'neutral'" />
          </div>

          <div
            v-if="publicSettings?.oidc_oauth_enabled"
            class="flex items-center justify-between rounded-lg border border-line bg-white p-4"
          >
            <div class="flex items-center gap-3">
              <div class="rounded-lg bg-steel-100 p-2">
                <span class="text-lg">🔐</span>
              </div>
              <div>
                <p class="font-black text-text-primary">{{ publicSettings.oidc_oauth_provider_name || 'OIDC' }}</p>
                <p class="text-xs text-text-tertiary">
                  {{ (user as any).oidc_sub ? '已绑定' : '未绑定' }}
                </p>
              </div>
            </div>
            <StatusPill :label="(user as any).oidc_sub ? '已绑定' : '未绑定'" :tone="(user as any).oidc_sub ? 'success' : 'neutral'" />
          </div>
        </div>
      </section>

      <!-- 余额通知设置 -->
      <section v-if="(publicSettings as any)?.balance_low_notify_enabled" class="mt-6 rounded-2xl border border-line bg-surface p-6">
        <div class="mb-4">
          <p class="text-xs font-black uppercase tracking-wider text-text-tertiary">通知设置</p>
          <h3 class="mt-1 text-lg font-black text-text-primary">余额提醒</h3>
        </div>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-black text-text-primary">启用余额低提醒</p>
              <p class="text-sm text-text-tertiary">余额低于阈值时发送邮件通知</p>
            </div>
            <label class="relative inline-flex cursor-pointer items-center">
              <input
                v-model="notifyForm.enabled"
                type="checkbox"
                class="peer sr-only"
                @change="updateNotifySettings"
              />
              <div class="peer h-6 w-11 rounded-full bg-surface-secondary after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-brand-500 peer-checked:after:translate-x-full"></div>
            </label>
          </div>
          <div v-if="notifyForm.enabled">
            <label class="mb-2 block text-sm font-black text-text-primary">提醒阈值 (USD)</label>
            <input
              v-model.number="notifyForm.threshold"
              type="number"
              min="0"
              step="0.01"
              class="w-full rounded-lg border border-line bg-white px-4 py-2 text-sm transition focus:border-brand-500 focus:outline-none"
              @blur="updateNotifySettings"
            />
            <p class="mt-1 text-xs text-text-tertiary">
              系统默认: ${{ (((publicSettings as any)?.balance_low_notify_threshold || 0) as number).toFixed(2) }}
            </p>
          </div>
        </div>
      </section>
    </template>
  </AtlasPage>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { userAPI } from '@/api'
import type { User } from '@/types'
import { AtlasPage, MetricTile, StatusPill } from '@/components/atlas'

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
      notifyForm.value.enabled = (user.value as any).balance_notify_enabled ?? true
      notifyForm.value.threshold = (user.value as any).balance_notify_threshold ?? (publicSettings.value as any)?.balance_low_notify_threshold ?? 0
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
    alert('资料更新成功')
  } catch (error) {
    console.error('更新资料失败:', error)
    alert('更新失败: ' + (error as Error).message)
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
    alert('密码修改成功')
  } catch (error) {
    console.error('修改密码失败:', error)
    alert('修改失败: ' + (error as Error).message)
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
    alert('更新失败: ' + (error as Error).message)
  }
}

onMounted(() => {
  loadProfile()
})
</script>
