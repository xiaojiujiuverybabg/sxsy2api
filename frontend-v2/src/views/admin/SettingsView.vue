<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
    <!-- 页面标题 -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-white">⚙️ 系统设置</h1>
          <p class="mt-2 text-sm text-slate-400">管理系统配置和参数</p>
        </div>
        <div class="flex gap-3">
          <button
            @click="loadSettings"
            :disabled="loading"
            class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800 disabled:opacity-50"
          >
            <span v-if="loading">🔄 加载中...</span>
            <span v-else>🔄 刷新</span>
          </button>
          <button
            @click="saveSettings"
            :disabled="saving"
            class="rounded-lg border border-gold-500/50 bg-gradient-to-r from-gold-500/20 to-gold-600/20 px-4 py-2 text-sm font-medium text-gold-400 backdrop-blur-sm transition hover:border-gold-400 hover:from-gold-500/30 hover:to-gold-600/30 disabled:opacity-50"
          >
            {{ saving ? '保存中...' : '💾 保存设置' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading && !settings" class="flex items-center justify-center rounded-xl border border-slate-700/50 bg-slate-800/40 py-20 backdrop-blur-sm">
      <div class="text-center">
        <div class="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-gold-500"></div>
        <p class="text-sm text-slate-400">加载中...</p>
      </div>
    </div>

    <!-- 设置表单 -->
    <div v-else-if="settings" class="space-y-6">
      <!-- 基本设置 -->
      <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 p-6 backdrop-blur-sm">
        <h2 class="mb-4 text-xl font-semibold text-white">🏠 基本设置</h2>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">站点名称</label>
            <input
              v-model="settings.site_name"
              type="text"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2 text-white backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">站点副标题</label>
            <input
              v-model="settings.site_subtitle"
              type="text"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2 text-white backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">站点 Logo URL</label>
            <input
              v-model="settings.site_logo"
              type="text"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2 text-white backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">API Base URL</label>
            <input
              v-model="settings.api_base_url"
              type="text"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2 text-white backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">联系方式</label>
            <input
              v-model="settings.contact_info"
              type="text"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2 text-white backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">文档 URL</label>
            <input
              v-model="settings.doc_url"
              type="text"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2 text-white backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            />
          </div>
        </div>
      </div>

      <!-- 功能开关 -->
      <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 p-6 backdrop-blur-sm">
        <h2 class="mb-4 text-xl font-semibold text-white">🔧 功能开关</h2>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <label class="flex items-center gap-3 rounded-lg border border-slate-700/50 bg-slate-900/30 p-4 cursor-pointer transition hover:border-slate-600">
            <input
              v-model="settings.registration_enabled"
              type="checkbox"
              class="h-5 w-5 rounded border-slate-600 bg-slate-800 text-gold-500 focus:ring-2 focus:ring-gold-500/20"
            />
            <span class="text-sm text-slate-300">启用注册</span>
          </label>

          <label class="flex items-center gap-3 rounded-lg border border-slate-700/50 bg-slate-900/30 p-4 cursor-pointer transition hover:border-slate-600">
            <input
              v-model="settings.email_verify_enabled"
              type="checkbox"
              class="h-5 w-5 rounded border-slate-600 bg-slate-800 text-gold-500 focus:ring-2 focus:ring-gold-500/20"
            />
            <span class="text-sm text-slate-300">启用邮箱验证</span>
          </label>

          <label class="flex items-center gap-3 rounded-lg border border-slate-700/50 bg-slate-900/30 p-4 cursor-pointer transition hover:border-slate-600">
            <input
              v-model="settings.password_reset_enabled"
              type="checkbox"
              class="h-5 w-5 rounded border-slate-600 bg-slate-800 text-gold-500 focus:ring-2 focus:ring-gold-500/20"
            />
            <span class="text-sm text-slate-300">启用密码重置</span>
          </label>

          <label class="flex items-center gap-3 rounded-lg border border-slate-700/50 bg-slate-900/30 p-4 cursor-pointer transition hover:border-slate-600">
            <input
              v-model="settings.invitation_code_enabled"
              type="checkbox"
              class="h-5 w-5 rounded border-slate-600 bg-slate-800 text-gold-500 focus:ring-2 focus:ring-gold-500/20"
            />
            <span class="text-sm text-slate-300">启用邀请码</span>
          </label>

          <label class="flex items-center gap-3 rounded-lg border border-slate-700/50 bg-slate-900/30 p-4 cursor-pointer transition hover:border-slate-600">
            <input
              v-model="settings.promo_code_enabled"
              type="checkbox"
              class="h-5 w-5 rounded border-slate-600 bg-slate-800 text-gold-500 focus:ring-2 focus:ring-gold-500/20"
            />
            <span class="text-sm text-slate-300">启用促销码</span>
          </label>

          <label class="flex items-center gap-3 rounded-lg border border-slate-700/50 bg-slate-900/30 p-4 cursor-pointer transition hover:border-slate-600">
            <input
              v-model="settings.payment_enabled"
              type="checkbox"
              class="h-5 w-5 rounded border-slate-600 bg-slate-800 text-gold-500 focus:ring-2 focus:ring-gold-500/20"
            />
            <span class="text-sm text-slate-300">启用支付</span>
          </label>

          <label class="flex items-center gap-3 rounded-lg border border-slate-700/50 bg-slate-900/30 p-4 cursor-pointer transition hover:border-slate-600">
            <input
              v-model="settings.turnstile_enabled"
              type="checkbox"
              class="h-5 w-5 rounded border-slate-600 bg-slate-800 text-gold-500 focus:ring-2 focus:ring-gold-500/20"
            />
            <span class="text-sm text-slate-300">启用 Turnstile</span>
          </label>

          <label class="flex items-center gap-3 rounded-lg border border-slate-700/50 bg-slate-900/30 p-4 cursor-pointer transition hover:border-slate-600">
            <input
              v-model="settings.backend_mode_enabled"
              type="checkbox"
              class="h-5 w-5 rounded border-slate-600 bg-slate-800 text-gold-500 focus:ring-2 focus:ring-gold-500/20"
            />
            <span class="text-sm text-slate-300">启用后端模式</span>
          </label>

          <label class="flex items-center gap-3 rounded-lg border border-slate-700/50 bg-slate-900/30 p-4 cursor-pointer transition hover:border-slate-600">
            <input
              v-model="settings.balance_low_notify_enabled"
              type="checkbox"
              class="h-5 w-5 rounded border-slate-600 bg-slate-800 text-gold-500 focus:ring-2 focus:ring-gold-500/20"
            />
            <span class="text-sm text-slate-300">启用余额低通知</span>
          </label>
        </div>
      </div>

      <!-- OAuth 设置 -->
      <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 p-6 backdrop-blur-sm">
        <h2 class="mb-4 text-xl font-semibold text-white">🔐 OAuth 设置</h2>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <label class="flex items-center gap-3 rounded-lg border border-slate-700/50 bg-slate-900/30 p-4 cursor-pointer transition hover:border-slate-600">
            <input
              v-model="settings.linuxdo_oauth_enabled"
              type="checkbox"
              class="h-5 w-5 rounded border-slate-600 bg-slate-800 text-gold-500 focus:ring-2 focus:ring-gold-500/20"
            />
            <span class="text-sm text-slate-300">LinuxDo OAuth</span>
          </label>

          <label class="flex items-center gap-3 rounded-lg border border-slate-700/50 bg-slate-900/30 p-4 cursor-pointer transition hover:border-slate-600">
            <input
              v-model="settings.wechat_oauth_enabled"
              type="checkbox"
              class="h-5 w-5 rounded border-slate-600 bg-slate-800 text-gold-500 focus:ring-2 focus:ring-gold-500/20"
            />
            <span class="text-sm text-slate-300">微信 OAuth</span>
          </label>

          <label class="flex items-center gap-3 rounded-lg border border-slate-700/50 bg-slate-900/30 p-4 cursor-pointer transition hover:border-slate-600">
            <input
              v-model="settings.oidc_oauth_enabled"
              type="checkbox"
              class="h-5 w-5 rounded border-slate-600 bg-slate-800 text-gold-500 focus:ring-2 focus:ring-gold-500/20"
            />
            <span class="text-sm text-slate-300">OIDC OAuth</span>
          </label>
        </div>

        <div v-if="settings.oidc_oauth_enabled" class="mt-4">
          <label class="mb-2 block text-sm font-medium text-slate-300">OIDC 提供商名称</label>
          <input
            v-model="settings.oidc_oauth_provider_name"
            type="text"
            class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2 text-white backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
          />
        </div>
      </div>

      <!-- 通知设置 -->
      <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 p-6 backdrop-blur-sm">
        <h2 class="mb-4 text-xl font-semibold text-white">🔔 通知设置</h2>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">余额低通知阈值</label>
            <input
              v-model.number="settings.balance_low_notify_threshold"
              type="number"
              step="0.01"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2 text-white backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            />
          </div>
        </div>
      </div>

      <!-- 系统信息 -->
      <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 p-6 backdrop-blur-sm">
        <h2 class="mb-4 text-xl font-semibold text-white">ℹ️ 系统信息</h2>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <div class="text-sm text-slate-400">版本</div>
            <div class="mt-1 text-lg font-semibold text-white">{{ settings.version || 'N/A' }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminAPI } from '@/api/admin'
import type { PublicSettings } from '@/types'
import { showSuccess, showError } from '@/utils/toast'

const loading = ref(false)
const saving = ref(false)
const settings = ref<PublicSettings | null>(null)

onMounted(() => {
  loadSettings()
})

async function loadSettings() {
  loading.value = true
  try {
    const data = await adminAPI.settings.getSettings()
    settings.value = data as PublicSettings
  } catch (error: any) {
    showError(error.response?.data?.error || '加载设置失败')
  } finally {
    loading.value = false
  }
}

async function saveSettings() {
  if (!settings.value) return

  saving.value = true
  try {
    await adminAPI.settings.updateSettings(settings.value)
    showSuccess('设置保存成功')
  } catch (error: any) {
    showError(error.response?.data?.error || '保存失败')
  } finally {
    saving.value = false
  }
}
</script>
