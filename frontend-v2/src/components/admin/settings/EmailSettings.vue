<template>
  <div class="space-y-6">
    <!-- SMTP Settings Card -->
    <template v-if="form.email_verify_enabled">
      <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
        <div class="border-b border-slate-700/50 px-6 py-4">
          <h2 class="text-lg font-semibold text-white">SMTP 设置</h2>
          <p class="mt-1 text-sm text-slate-400">配置邮件发送服务</p>
        </div>
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-300">主机</label>
              <input v-model="form.smtp_host" type="text" class="form-input" placeholder="例如：smtp.example.com" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-300">端口</label>
              <input v-model.number="form.smtp_port" type="number" min="1" max="65535" class="form-input" placeholder="587" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-300">用户名</label>
              <input v-model="form.smtp_username" type="text" class="form-input" placeholder="SMTP 用户名" />
            </div>
            <div>
              <label class="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
                密码
                <span
                  v-if="form.smtp_password_configured && !smtpPasswordManuallyEdited"
                  class="inline-flex items-center rounded-full border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-xs text-green-400"
                >
                  已配置
                </span>
              </label>
              <div class="relative">
                <input
                  v-model="form.smtp_password"
                  :type="showSmtpPassword ? 'text' : 'password'"
                  class="form-input pr-10"
                  placeholder="SMTP 密码"
                  @input="smtpPasswordManuallyEdited = true"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                  @click="showSmtpPassword = !showSmtpPassword"
                >
                  <svg v-if="showSmtpPassword" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                  <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-300">发件人邮箱</label>
              <input v-model="form.smtp_from_email" type="email" class="form-input" placeholder="例如：noreply@example.com" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-300">发件人名称</label>
              <input v-model="form.smtp_from_name" type="text" class="form-input" placeholder="例如：MyAPI" />
            </div>
          </div>

          <div class="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/30 p-4">
            <div>
              <p class="text-sm font-medium text-white">使用 TLS</p>
              <p class="text-xs text-slate-400 mt-0.5">启用 TLS 加密连接</p>
            </div>
            <button
              type="button"
              @click="toggle('smtp_use_tls')"
              class="toggle-switch"
              :class="form.smtp_use_tls ? 'bg-gold-500' : 'bg-slate-700'"
            >
              <span class="toggle-knob" :class="form.smtp_use_tls ? 'translate-x-6' : 'translate-x-1'" />
            </button>
          </div>

          <div class="flex justify-end">
            <button
              type="button"
              @click="testSmtp"
              :disabled="testingSmtp"
              class="rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-gold-500 hover:text-gold-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="testingSmtp" class="inline-flex items-center gap-2">
                <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                测试中...
              </span>
              <span v-else>测试连接</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Send Test Email Card -->
      <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
        <div class="border-b border-slate-700/50 px-6 py-4">
          <h2 class="text-lg font-semibold text-white">发送测试邮件</h2>
          <p class="mt-1 text-sm text-slate-400">使用当前 SMTP 配置发送一封测试邮件</p>
        </div>
        <div class="p-6">
          <div class="flex gap-3 items-end">
            <div class="flex-1">
              <label class="mb-1.5 block text-sm font-medium text-slate-300">收件人邮箱</label>
              <input v-model="testEmailAddress" type="email" class="form-input" placeholder="例如：admin@example.com" />
            </div>
            <button
              type="button"
              @click="sendTestEmail"
              :disabled="sendingTestEmail || !testEmailAddress"
              class="rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-gold-500 hover:text-gold-400 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <span v-if="sendingTestEmail" class="inline-flex items-center gap-2">
                <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                发送中...
              </span>
              <span v-else>发送测试邮件</span>
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Email Not Enabled Message -->
    <div v-else class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
      <div class="p-6 text-center">
        <svg class="mx-auto h-12 w-12 text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <p class="text-sm text-slate-400">请先在安全设置中启用邮箱验证</p>
      </div>
    </div>

    <!-- Low Balance Notification Card -->
    <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
      <div class="border-b border-slate-700/50 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-white">余额不足通知</h2>
          <p class="mt-1 text-sm text-slate-400">用户余额低于阈值时发送邮件通知</p>
        </div>
        <button
          type="button"
          @click="toggle('balance_low_notify_enabled')"
          class="toggle-switch"
          :class="form.balance_low_notify_enabled ? 'bg-gold-500' : 'bg-slate-700'"
        >
          <span class="toggle-knob" :class="form.balance_low_notify_enabled ? 'translate-x-6' : 'translate-x-1'" />
        </button>
      </div>
      <div v-if="form.balance_low_notify_enabled" class="p-6 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-300">阈值 (USD)</label>
            <input
              v-model.number="form.balance_low_notify_threshold"
              type="number"
              min="0"
              step="0.01"
              class="form-input"
              placeholder="例如：1.00"
            />
            <p class="mt-1 text-xs text-slate-500">用户余额低于此金额时将触发通知</p>
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-300">充值 URL</label>
            <input v-model="form.balance_low_notify_recharge_url" type="url" class="form-input" placeholder="https://example.com/recharge" />
            <p class="mt-1 text-xs text-slate-500">通知邮件中的充值链接地址</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Account Quota Notification Card -->
    <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
      <div class="border-b border-slate-700/50 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-white">额度用尽通知</h2>
          <p class="mt-1 text-sm text-slate-400">上游账户额度即将耗尽时发送通知</p>
        </div>
        <button
          type="button"
          @click="toggle('account_quota_notify_enabled')"
          class="toggle-switch"
          :class="form.account_quota_notify_enabled ? 'bg-gold-500' : 'bg-slate-700'"
        >
          <span class="toggle-knob" :class="form.account_quota_notify_enabled ? 'translate-x-6' : 'translate-x-1'" />
        </button>
      </div>
      <div v-if="form.account_quota_notify_enabled" class="p-6 space-y-3">
        <div
          v-for="(entry, i) in form.account_quota_notify_emails"
          :key="i"
          class="flex items-center gap-3 rounded-lg border border-slate-700/50 bg-slate-900/30 p-3"
        >
          <button
            type="button"
            @click="entry.disabled = !entry.disabled"
            class="toggle-switch shrink-0"
            :class="!entry.disabled ? 'bg-gold-500' : 'bg-slate-700'"
          >
            <span class="toggle-knob" :class="!entry.disabled ? 'translate-x-6' : 'translate-x-1'" />
          </button>
          <div class="flex-1">
            <input
              v-model="entry.email"
              type="email"
              class="form-input"
              :class="entry.verified ? 'border-green-500/50' : ''"
              placeholder="输入通知邮箱"
            />
          </div>
          <span
            v-if="entry.verified"
            class="inline-flex items-center shrink-0 rounded-full border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-xs text-green-400"
          >
            已验证
          </span>
          <button
            type="button"
            @click="removeQuotaEmail(i)"
            class="rounded-lg p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition shrink-0"
            title="删除"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <div v-if="!form.account_quota_notify_emails || form.account_quota_notify_emails.length === 0" class="text-center text-sm text-slate-500 py-4">
          暂无通知邮箱，点击下方按钮添加
        </div>

        <button
          type="button"
          @click="addQuotaEmail"
          class="rounded-lg border border-dashed border-slate-600 px-3 py-1.5 text-xs text-slate-400 hover:border-gold-500 hover:text-gold-400 transition"
        >
          + 添加邮箱
        </button>

        <div class="rounded-lg border border-slate-700/50 bg-slate-900/30 p-4 space-y-2">
          <p class="text-xs text-slate-400">
            当任意上游账户的额度低于 5% 时，系统会向列表中的所有启用邮箱发送通知邮件。每个邮箱可以独立启用或禁用通知。标记为"已验证"的邮箱表示已通过邮箱验证。
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { SystemSettings } from '@/types'
import { adminAPI } from '@/api/admin'
import { showSuccess, showError } from '@/utils/toast'

const props = defineProps<{
  form: SystemSettings & Record<string, any>
}>()

const form = computed(() => props.form)

function toggle(key: string) {
  ;(form.value as any)[key] = !(form.value as any)[key]
}

// SMTP password show/hide and manual edit tracking
const showSmtpPassword = ref(false)
const smtpPasswordManuallyEdited = ref(false)

// Test SMTP connection
const testingSmtp = ref(false)

async function testSmtp() {
  testingSmtp.value = true
  try {
    await adminAPI.settings.testSmtpConnection({
      host: form.value.smtp_host,
      port: form.value.smtp_port,
      username: form.value.smtp_username,
      password: form.value.smtp_password || undefined,
      from_email: form.value.smtp_from_email,
      from_name: form.value.smtp_from_name,
      use_tls: form.value.smtp_use_tls,
    })
    showSuccess('SMTP 连接测试成功')
  } catch (error: any) {
    showError(error.response?.data?.error || error.response?.data?.message || 'SMTP 连接测试失败')
  } finally {
    testingSmtp.value = false
  }
}

// Send test email
const testEmailAddress = ref('')
const sendingTestEmail = ref(false)

async function sendTestEmail() {
  if (!testEmailAddress.value) return
  sendingTestEmail.value = true
  try {
    await adminAPI.settings.sendTestEmail({
      to: testEmailAddress.value,
      host: form.value.smtp_host,
      port: form.value.smtp_port,
      username: form.value.smtp_username,
      password: form.value.smtp_password || undefined,
      from_email: form.value.smtp_from_email,
      from_name: form.value.smtp_from_name,
      use_tls: form.value.smtp_use_tls,
    })
    showSuccess('测试邮件发送成功')
  } catch (error: any) {
    showError(error.response?.data?.error || error.response?.data?.message || '测试邮件发送失败')
  } finally {
    sendingTestEmail.value = false
  }
}

// Account quota notification emails
function addQuotaEmail() {
  if (!form.value.account_quota_notify_emails) {
    form.value.account_quota_notify_emails = []
  }
  form.value.account_quota_notify_emails.push({ email: '', disabled: false, verified: false })
}

function removeQuotaEmail(i: number) {
  form.value.account_quota_notify_emails.splice(i, 1)
}
</script>

<style scoped>
.form-input {
  @apply w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2 text-white backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20 placeholder:text-slate-600;
}

.toggle-switch {
  @apply relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200;
}

.toggle-knob {
  @apply inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200;
}
</style>
