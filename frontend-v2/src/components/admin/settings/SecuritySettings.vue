<template>
  <div class="space-y-6">
    <!-- Registration Settings -->
    <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
      <div class="border-b border-slate-700/50 px-6 py-4">
        <h2 class="text-lg font-semibold text-white">注册设置</h2>
        <p class="mt-1 text-sm text-slate-400">配置用户注册、验证和认证相关选项</p>
      </div>
      <div class="p-6 space-y-4">
        <!-- registration_enabled -->
        <div class="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/30 p-4">
          <div>
            <p class="text-sm font-medium text-white">启用注册</p>
            <p class="text-xs text-slate-400 mt-0.5">允许新用户自行注册账号</p>
          </div>
          <button type="button" @click="toggle('registration_enabled')" class="toggle-switch" :class="form.registration_enabled ? 'bg-gold-500' : 'bg-slate-700'">
            <span class="toggle-knob" :class="form.registration_enabled ? 'translate-x-6' : 'translate-x-1'" />
          </button>
        </div>

        <!-- email_verify_enabled -->
        <div class="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/30 p-4">
          <div>
            <p class="text-sm font-medium text-white">邮箱验证</p>
            <p class="text-xs text-slate-400 mt-0.5">注册时要求用户验证邮箱地址</p>
          </div>
          <button type="button" @click="toggle('email_verify_enabled')" class="toggle-switch" :class="form.email_verify_enabled ? 'bg-gold-500' : 'bg-slate-700'">
            <span class="toggle-knob" :class="form.email_verify_enabled ? 'translate-x-6' : 'translate-x-1'" />
          </button>
        </div>

        <!-- registration_email_suffix_whitelist -->
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-300">邮箱后缀白名单</label>
          <p class="text-xs text-slate-400 mb-2">输入邮箱后缀（不含 @ 前缀），按 Enter 或逗号添加。留空表示允许所有邮箱后缀。</p>
          <div class="flex flex-wrap gap-2 mb-2">
            <span
              v-for="(suffix, i) in form.registration_email_suffix_whitelist"
              :key="i"
              class="inline-flex items-center gap-1 rounded-full bg-gold-500/10 border border-gold-500/30 px-2.5 py-1 text-xs text-gold-400"
            >
              @{{ suffix }}
              <button type="button" @click="removeEmailSuffix(i)" class="text-gold-400 hover:text-gold-200 transition">
                <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </span>
          </div>
          <input
            v-model="emailSuffixInput"
            type="text"
            class="form-input"
            placeholder="例如：gmail.com, qq.com"
            @keydown.enter.prevent="addEmailSuffix"
            @keydown.,.prevent="addEmailSuffix"
          />
        </div>

        <!-- invitation_code_enabled -->
        <div class="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/30 p-4">
          <div>
            <p class="text-sm font-medium text-white">邀请码</p>
            <p class="text-xs text-slate-400 mt-0.5">要求新用户注册时提供有效邀请码</p>
          </div>
          <button type="button" @click="toggle('invitation_code_enabled')" class="toggle-switch" :class="form.invitation_code_enabled ? 'bg-gold-500' : 'bg-slate-700'">
            <span class="toggle-knob" :class="form.invitation_code_enabled ? 'translate-x-6' : 'translate-x-1'" />
          </button>
        </div>

        <!-- promo_code_enabled -->
        <div class="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/30 p-4">
          <div>
            <p class="text-sm font-medium text-white">促销码</p>
            <p class="text-xs text-slate-400 mt-0.5">允许用户使用促销码兑换奖励</p>
          </div>
          <button type="button" @click="toggle('promo_code_enabled')" class="toggle-switch" :class="form.promo_code_enabled ? 'bg-gold-500' : 'bg-slate-700'">
            <span class="toggle-knob" :class="form.promo_code_enabled ? 'translate-x-6' : 'translate-x-1'" />
          </button>
        </div>

        <!-- password_reset_enabled -->
        <div class="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/30 p-4">
          <div>
            <p class="text-sm font-medium text-white">密码重置</p>
            <p class="text-xs text-slate-400 mt-0.5">允许用户通过邮箱重置密码</p>
          </div>
          <button type="button" @click="toggle('password_reset_enabled')" class="toggle-switch" :class="form.password_reset_enabled ? 'bg-gold-500' : 'bg-slate-700'">
            <span class="toggle-knob" :class="form.password_reset_enabled ? 'translate-x-6' : 'translate-x-1'" />
          </button>
        </div>

        <!-- totp_enabled -->
        <div class="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/30 p-4">
          <div>
            <p class="text-sm font-medium text-white">TOTP 双因素认证</p>
            <p class="text-xs text-slate-400 mt-0.5">启用基于时间的一次性密码双因素认证</p>
          </div>
          <div class="flex items-center gap-3">
            <span v-if="!form.totp_encryption_key_configured" class="text-xs text-amber-400">未配置加密密钥</span>
            <button type="button" @click="toggle('totp_enabled')" class="toggle-switch" :class="form.totp_enabled ? 'bg-gold-500' : 'bg-slate-700'">
              <span class="toggle-knob" :class="form.totp_enabled ? 'translate-x-6' : 'translate-x-1'" />
            </button>
          </div>
        </div>
        <div v-if="!form.totp_encryption_key_configured && form.totp_enabled" class="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-400">
          <svg class="inline h-4 w-4 mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          TOTP 加密密钥尚未配置，请设置环境变量后重启服务。
        </div>

        <!-- frontend_url (shown when password_reset_enabled) -->
        <div v-if="form.password_reset_enabled">
          <label class="mb-1.5 block text-sm font-medium text-slate-300">前端 URL</label>
          <p class="text-xs text-slate-400 mb-2">密码重置邮件中使用的链接基础地址</p>
          <input v-model="form.frontend_url" type="text" class="form-input" placeholder="https://your-frontend.com" />
        </div>
      </div>
    </div>

    <!-- Cloudflare Turnstile -->
    <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
      <div class="border-b border-slate-700/50 px-6 py-4">
        <h2 class="text-lg font-semibold text-white">Cloudflare Turnstile</h2>
        <p class="mt-1 text-sm text-slate-400">人机验证服务配置</p>
      </div>
      <div class="p-6 space-y-4">
        <div class="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/30 p-4">
          <div>
            <p class="text-sm font-medium text-white">启用 Turnstile</p>
            <p class="text-xs text-slate-400 mt-0.5">在登录和注册页面开启 Turnstile 人机验证</p>
          </div>
          <button type="button" @click="toggle('turnstile_enabled')" class="toggle-switch" :class="form.turnstile_enabled ? 'bg-gold-500' : 'bg-slate-700'">
            <span class="toggle-knob" :class="form.turnstile_enabled ? 'translate-x-6' : 'translate-x-1'" />
          </button>
        </div>
        <template v-if="form.turnstile_enabled">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-300">站点密钥 (Site Key)</label>
            <input v-model="form.turnstile_site_key" type="text" class="form-input" placeholder="Turnstile 站点密钥" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-300">密钥 (Secret Key)</label>
            <div class="relative">
              <input
                :type="passwordVisible.turnstile_secret_key ? 'text' : 'password'"
                v-model="form.turnstile_secret_key"
                class="form-input pr-20"
                placeholder="Turnstile 密钥"
              />
              <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <span v-if="form.turnstile_secret_key_configured && !form.turnstile_secret_key" class="rounded bg-green-500/10 border border-green-500/30 px-1.5 py-0.5 text-xs text-green-400">已配置</span>
                <button type="button" @click="togglePasswordVisibility('turnstile_secret_key')" class="rounded p-1 text-slate-400 hover:text-white transition">
                  <svg v-if="passwordVisible.turnstile_secret_key" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M15 12a3 3 0 01-4.243 4.243M3 3l18 18" /></svg>
                  <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- LinuxDo Connect OAuth -->
    <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
      <div class="border-b border-slate-700/50 px-6 py-4">
        <h2 class="text-lg font-semibold text-white">LinuxDo Connect OAuth</h2>
        <p class="mt-1 text-sm text-slate-400">LinuxDo 第三方登录集成配置</p>
      </div>
      <div class="p-6 space-y-4">
        <div class="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/30 p-4">
          <div>
            <p class="text-sm font-medium text-white">启用 LinuxDo</p>
            <p class="text-xs text-slate-400 mt-0.5">开启 LinuxDo OAuth 2.0 第三方登录</p>
          </div>
          <button type="button" @click="toggle('linuxdo_connect_enabled')" class="toggle-switch" :class="form.linuxdo_connect_enabled ? 'bg-gold-500' : 'bg-slate-700'">
            <span class="toggle-knob" :class="form.linuxdo_connect_enabled ? 'translate-x-6' : 'translate-x-1'" />
          </button>
        </div>
        <template v-if="form.linuxdo_connect_enabled">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-300">客户端 ID (Client ID)</label>
            <input v-model="form.linuxdo_connect_client_id" type="text" class="form-input" placeholder="LinuxDo OAuth 客户端 ID" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-300">客户端密钥 (Client Secret)</label>
            <div class="relative">
              <input
                :type="passwordVisible.linuxdo_connect_client_secret ? 'text' : 'password'"
                v-model="form.linuxdo_connect_client_secret"
                class="form-input pr-20"
                placeholder="LinuxDo OAuth 客户端密钥"
              />
              <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <span v-if="form.linuxdo_connect_client_secret_configured && !form.linuxdo_connect_client_secret" class="rounded bg-green-500/10 border border-green-500/30 px-1.5 py-0.5 text-xs text-green-400">已配置</span>
                <button type="button" @click="togglePasswordVisibility('linuxdo_connect_client_secret')" class="rounded p-1 text-slate-400 hover:text-white transition">
                  <svg v-if="passwordVisible.linuxdo_connect_client_secret" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M15 12a3 3 0 01-4.243 4.243M3 3l18 18" /></svg>
                  <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </button>
              </div>
            </div>
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-300">重定向 URL</label>
            <div class="flex gap-2">
              <input v-model="form.linuxdo_connect_redirect_url" type="text" class="form-input flex-1" placeholder="OAuth 回调地址" />
              <button
                type="button"
                @click="setAndCopy('linuxdo_connect_redirect_url', `${form.api_base_url}/auth/linuxdo/callback`)"
                class="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-300 hover:border-gold-500 hover:text-gold-400 transition whitespace-nowrap"
              >
                设置并复制
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- WeChat Connect OAuth -->
    <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
      <div class="border-b border-slate-700/50 px-6 py-4">
        <h2 class="text-lg font-semibold text-white">微信 Connect OAuth</h2>
        <p class="mt-1 text-sm text-slate-400">微信第三方登录集成配置（三种模式互斥）</p>
      </div>
      <div class="p-6 space-y-4">
        <div class="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/30 p-4">
          <div>
            <p class="text-sm font-medium text-white">启用微信</p>
            <p class="text-xs text-slate-400 mt-0.5">开启微信 OAuth 2.0 第三方登录</p>
          </div>
          <button type="button" @click="toggle('wechat_connect_enabled')" class="toggle-switch" :class="form.wechat_connect_enabled ? 'bg-gold-500' : 'bg-slate-700'">
            <span class="toggle-knob" :class="form.wechat_connect_enabled ? 'translate-x-6' : 'translate-x-1'" />
          </button>
        </div>
        <template v-if="form.wechat_connect_enabled">
          <p class="text-xs text-amber-400 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">三种模式互斥：启用一个将自动禁用其余两个。请根据你的微信应用类型选择其一。</p>

          <!-- Open Platform (PC) -->
          <div class="rounded-lg border border-slate-700/50 bg-slate-900/30 p-4 space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-white">开放平台 (PC)</p>
                <p class="text-xs text-slate-400 mt-0.5">微信开放平台网站应用</p>
              </div>
              <button type="button" @click="toggleWechatMode('open')" class="toggle-switch" :class="form.wechat_connect_open_enabled ? 'bg-gold-500' : 'bg-slate-700'">
                <span class="toggle-knob" :class="form.wechat_connect_open_enabled ? 'translate-x-6' : 'translate-x-1'" />
              </button>
            </div>
            <template v-if="form.wechat_connect_open_enabled">
              <div>
                <label class="mb-1 block text-xs text-slate-500">App ID</label>
                <input v-model="form.wechat_connect_open_app_id" type="text" class="form-input" placeholder="微信开放平台 App ID" />
              </div>
              <div>
                <label class="mb-1 block text-xs text-slate-500">App Secret</label>
                <div class="relative">
                  <input
                    :type="passwordVisible.wechat_connect_open_app_secret ? 'text' : 'password'"
                    v-model="form.wechat_connect_open_app_secret"
                    class="form-input pr-20"
                    placeholder="微信开放平台 App Secret"
                  />
                  <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    <span v-if="form.wechat_connect_open_app_secret_configured && !form.wechat_connect_open_app_secret" class="rounded bg-green-500/10 border border-green-500/30 px-1.5 py-0.5 text-xs text-green-400">已配置</span>
                    <button type="button" @click="togglePasswordVisibility('wechat_connect_open_app_secret')" class="rounded p-1 text-slate-400 hover:text-white transition">
                      <svg v-if="passwordVisible.wechat_connect_open_app_secret" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M15 12a3 3 0 01-4.243 4.243M3 3l18 18" /></svg>
                      <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <!-- Official Account (MP) -->
          <div class="rounded-lg border border-slate-700/50 bg-slate-900/30 p-4 space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-white">公众号 (MP)</p>
                <p class="text-xs text-slate-400 mt-0.5">微信公众号网页授权</p>
              </div>
              <button type="button" @click="toggleWechatMode('mp')" class="toggle-switch" :class="form.wechat_connect_mp_enabled ? 'bg-gold-500' : 'bg-slate-700'">
                <span class="toggle-knob" :class="form.wechat_connect_mp_enabled ? 'translate-x-6' : 'translate-x-1'" />
              </button>
            </div>
            <template v-if="form.wechat_connect_mp_enabled">
              <div>
                <label class="mb-1 block text-xs text-slate-500">App ID</label>
                <input v-model="form.wechat_connect_mp_app_id" type="text" class="form-input" placeholder="微信公众号 App ID" />
              </div>
              <div>
                <label class="mb-1 block text-xs text-slate-500">App Secret</label>
                <div class="relative">
                  <input
                    :type="passwordVisible.wechat_connect_mp_app_secret ? 'text' : 'password'"
                    v-model="form.wechat_connect_mp_app_secret"
                    class="form-input pr-20"
                    placeholder="微信公众号 App Secret"
                  />
                  <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    <span v-if="form.wechat_connect_mp_app_secret_configured && !form.wechat_connect_mp_app_secret" class="rounded bg-green-500/10 border border-green-500/30 px-1.5 py-0.5 text-xs text-green-400">已配置</span>
                    <button type="button" @click="togglePasswordVisibility('wechat_connect_mp_app_secret')" class="rounded p-1 text-slate-400 hover:text-white transition">
                      <svg v-if="passwordVisible.wechat_connect_mp_app_secret" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M15 12a3 3 0 01-4.243 4.243M3 3l18 18" /></svg>
                      <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <!-- Mobile App -->
          <div class="rounded-lg border border-slate-700/50 bg-slate-900/30 p-4 space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-white">移动应用</p>
                <p class="text-xs text-slate-400 mt-0.5">微信开放平台移动应用</p>
              </div>
              <button type="button" @click="toggleWechatMode('mobile')" class="toggle-switch" :class="form.wechat_connect_mobile_enabled ? 'bg-gold-500' : 'bg-slate-700'">
                <span class="toggle-knob" :class="form.wechat_connect_mobile_enabled ? 'translate-x-6' : 'translate-x-1'" />
              </button>
            </div>
            <template v-if="form.wechat_connect_mobile_enabled">
              <div>
                <label class="mb-1 block text-xs text-slate-500">App ID</label>
                <input v-model="form.wechat_connect_mobile_app_id" type="text" class="form-input" placeholder="微信移动应用 App ID" />
              </div>
              <div>
                <label class="mb-1 block text-xs text-slate-500">App Secret</label>
                <div class="relative">
                  <input
                    :type="passwordVisible.wechat_connect_mobile_app_secret ? 'text' : 'password'"
                    v-model="form.wechat_connect_mobile_app_secret"
                    class="form-input pr-20"
                    placeholder="微信移动应用 App Secret"
                  />
                  <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    <span v-if="form.wechat_connect_mobile_app_secret_configured && !form.wechat_connect_mobile_app_secret" class="rounded bg-green-500/10 border border-green-500/30 px-1.5 py-0.5 text-xs text-green-400">已配置</span>
                    <button type="button" @click="togglePasswordVisibility('wechat_connect_mobile_app_secret')" class="rounded p-1 text-slate-400 hover:text-white transition">
                      <svg v-if="passwordVisible.wechat_connect_mobile_app_secret" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M15 12a3 3 0 01-4.243 4.243M3 3l18 18" /></svg>
                      <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-300">重定向 URL</label>
              <input v-model="form.wechat_connect_redirect_url" type="text" class="form-input" placeholder="微信 OAuth 回调地址" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-300">前端重定向 URL</label>
              <input v-model="form.wechat_connect_frontend_redirect_url" type="text" class="form-input" placeholder="微信登录后前端跳转地址" />
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Generic OIDC OAuth -->
    <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
      <div class="border-b border-slate-700/50 px-6 py-4">
        <h2 class="text-lg font-semibold text-white">通用 OIDC OAuth</h2>
        <p class="mt-1 text-sm text-slate-400">OpenID Connect 通用第三方登录集成配置</p>
      </div>
      <div class="p-6 space-y-4">
        <div class="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/30 p-4">
          <div>
            <p class="text-sm font-medium text-white">启用 OIDC</p>
            <p class="text-xs text-slate-400 mt-0.5">开启通用 OpenID Connect 第三方登录</p>
          </div>
          <button type="button" @click="toggle('oidc_connect_enabled')" class="toggle-switch" :class="form.oidc_connect_enabled ? 'bg-gold-500' : 'bg-slate-700'">
            <span class="toggle-knob" :class="form.oidc_connect_enabled ? 'translate-x-6' : 'translate-x-1'" />
          </button>
        </div>
        <template v-if="form.oidc_connect_enabled">
          <!-- Basic Settings -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-300">提供商名称</label>
              <input v-model="form.oidc_connect_provider_name" type="text" class="form-input" placeholder="例如：Keycloak" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-300">客户端 ID</label>
              <input v-model="form.oidc_connect_client_id" type="text" class="form-input" placeholder="OIDC 客户端 ID" />
            </div>
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-300">客户端密钥 (Client Secret)</label>
            <div class="relative">
              <input
                :type="passwordVisible.oidc_connect_client_secret ? 'text' : 'password'"
                v-model="form.oidc_connect_client_secret"
                class="form-input pr-20"
                placeholder="OIDC 客户端密钥"
              />
              <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <span v-if="form.oidc_connect_client_secret_configured && !form.oidc_connect_client_secret" class="rounded bg-green-500/10 border border-green-500/30 px-1.5 py-0.5 text-xs text-green-400">已配置</span>
                <button type="button" @click="togglePasswordVisibility('oidc_connect_client_secret')" class="rounded p-1 text-slate-400 hover:text-white transition">
                  <svg v-if="passwordVisible.oidc_connect_client_secret" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M15 12a3 3 0 01-4.243 4.243M3 3l18 18" /></svg>
                  <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Endpoint URLs -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-300">发行者 URL (Issuer)</label>
              <input v-model="form.oidc_connect_issuer_url" type="text" class="form-input" placeholder="https://..." />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-300">发现 URL (Discovery)</label>
              <input v-model="form.oidc_connect_discovery_url" type="text" class="form-input" placeholder="https://.../.well-known/openid-configuration" />
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-300">授权 URL (Authorize)</label>
              <input v-model="form.oidc_connect_authorize_url" type="text" class="form-input" placeholder="https://..." />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-300">令牌 URL (Token)</label>
              <input v-model="form.oidc_connect_token_url" type="text" class="form-input" placeholder="https://..." />
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-300">用户信息 URL (UserInfo)</label>
              <input v-model="form.oidc_connect_userinfo_url" type="text" class="form-input" placeholder="https://..." />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-300">JWKS URL</label>
              <input v-model="form.oidc_connect_jwks_url" type="text" class="form-input" placeholder="https://..." />
            </div>
          </div>

          <!-- Scopes & Redirect URLs -->
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-300">作用域 (Scopes)</label>
            <input v-model="form.oidc_connect_scopes" type="text" class="form-input" placeholder="openid email profile" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-300">重定向 URL</label>
            <div class="flex gap-2">
              <input v-model="form.oidc_connect_redirect_url" type="text" class="form-input flex-1" placeholder="OIDC 回调地址" />
              <button type="button" @click="setAndCopy('oidc_connect_redirect_url', `${form.api_base_url}/auth/oidc/callback`)" class="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-300 hover:border-gold-500 hover:text-gold-400 transition whitespace-nowrap">
                设置并复制
              </button>
            </div>
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-300">前端重定向 URL</label>
            <input v-model="form.oidc_connect_frontend_redirect_url" type="text" class="form-input" placeholder="OIDC 登录后前端跳转地址" />
          </div>

          <!-- Token & Security Settings -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-300">令牌授权方法 (Token Auth Method)</label>
              <select v-model="form.oidc_connect_token_auth_method" class="form-input">
                <option value="client_secret_post">client_secret_post</option>
                <option value="client_secret_basic">client_secret_basic</option>
                <option value="private_key_jwt">private_key_jwt</option>
              </select>
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-300">允许的签名算法</label>
              <input v-model="form.oidc_connect_allowed_signing_algs" type="text" class="form-input" placeholder="RS256,ES256,PS256" />
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-300">时钟偏差秒数</label>
              <input v-model.number="form.oidc_connect_clock_skew_seconds" type="number" class="form-input" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/30 p-3">
              <div>
                <p class="text-sm font-medium text-white">Use PKCE</p>
              </div>
              <button type="button" @click="toggle('oidc_connect_use_pkce')" class="toggle-switch" :class="form.oidc_connect_use_pkce ? 'bg-gold-500' : 'bg-slate-700'">
                <span class="toggle-knob" :class="form.oidc_connect_use_pkce ? 'translate-x-6' : 'translate-x-1'" />
              </button>
            </div>
            <div class="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/30 p-3">
              <div>
                <p class="text-sm font-medium text-white">验证 ID 令牌</p>
              </div>
              <button type="button" @click="toggle('oidc_connect_validate_id_token')" class="toggle-switch" :class="form.oidc_connect_validate_id_token ? 'bg-gold-500' : 'bg-slate-700'">
                <span class="toggle-knob" :class="form.oidc_connect_validate_id_token ? 'translate-x-6' : 'translate-x-1'" />
              </button>
            </div>
            <div class="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/30 p-3">
              <div>
                <p class="text-sm font-medium text-white">要求邮箱已验证</p>
              </div>
              <button type="button" @click="toggle('oidc_connect_require_email_verified')" class="toggle-switch" :class="form.oidc_connect_require_email_verified ? 'bg-gold-500' : 'bg-slate-700'">
                <span class="toggle-knob" :class="form.oidc_connect_require_email_verified ? 'translate-x-6' : 'translate-x-1'" />
              </button>
            </div>
          </div>

          <!-- UserInfo Path Mapping -->
          <div class="rounded-lg border border-slate-700/50 bg-slate-900/30 p-4">
            <p class="text-sm font-medium text-white mb-3">用户信息字段路径映射</p>
            <p class="text-xs text-slate-400 mb-3">指定从 OIDC UserInfo 响应中提取对应字段的 JSON 路径（支持点号分隔，如 email、sub、name）</p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="mb-1 block text-xs text-slate-500">邮箱路径</label>
                <input v-model="form.oidc_connect_userinfo_email_path" type="text" class="form-input" placeholder="email" />
              </div>
              <div>
                <label class="mb-1 block text-xs text-slate-500">ID 路径</label>
                <input v-model="form.oidc_connect_userinfo_id_path" type="text" class="form-input" placeholder="sub" />
              </div>
              <div>
                <label class="mb-1 block text-xs text-slate-500">用户名路径</label>
                <input v-model="form.oidc_connect_userinfo_username_path" type="text" class="form-input" placeholder="preferred_username" />
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Admin API Key -->
    <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
      <div class="border-b border-slate-700/50 px-6 py-4">
        <h2 class="text-lg font-semibold text-white">管理员 API 密钥</h2>
        <p class="mt-1 text-sm text-slate-400">管理用于外部系统集成的管理员 API 密钥</p>
      </div>
      <div class="p-6 space-y-4">
        <!-- Security Warning -->
        <div class="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
          <svg class="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          <div class="text-sm text-amber-400">
            <p class="font-medium">安全警告</p>
            <p class="mt-1 text-xs text-amber-400/80">管理员 API 密钥拥有完整的系统管理权限。请妥善保管密钥，不要分享给未经授权的人员。密钥仅在创建时显示一次。</p>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="adminApiKeyLoading" class="flex items-center justify-center py-6">
          <svg class="animate-spin h-5 w-5 text-gold-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span class="ml-3 text-sm text-slate-400">加载中...</span>
        </div>

        <!-- Key Status -->
        <template v-else>
          <div class="rounded-lg border border-slate-700/50 bg-slate-900/30 p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-white">管理员 API 密钥状态</p>
                <p v-if="adminApiKeyExists" class="text-xs text-slate-400 mt-0.5">
                  已配置密钥：<code class="text-gold-400 font-mono">{{ adminApiKeyMasked }}</code>
                </p>
                <p v-else class="text-xs text-slate-400 mt-0.5">尚未创建管理员 API 密钥</p>
              </div>
              <div class="flex items-center gap-2">
                <button
                  v-if="!adminApiKeyExists"
                  type="button"
                  @click="createAdminApiKey"
                  :disabled="adminApiKeyOperating"
                  class="rounded-lg bg-gold-500/20 border border-gold-500/50 px-4 py-2 text-sm font-medium text-gold-400 hover:bg-gold-500/30 transition disabled:opacity-50"
                >
                  <svg v-if="adminApiKeyOperating" class="inline animate-spin h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                  {{ adminApiKeyOperating ? '创建中...' : '创建' }}
                </button>
                <template v-if="adminApiKeyExists">
                  <button
                    type="button"
                    @click="regenerateAdminApiKey"
                    :disabled="adminApiKeyOperating"
                    class="rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400 hover:bg-amber-500/20 transition disabled:opacity-50"
                  >
                    <svg v-if="adminApiKeyOperating" class="inline animate-spin h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                    {{ adminApiKeyOperating ? '重新生成中...' : '重新生成' }}
                  </button>
                  <button
                    type="button"
                    @click="deleteAdminApiKey"
                    :disabled="adminApiKeyOperating"
                    class="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition disabled:opacity-50"
                  >
                    {{ adminApiKeyOperating ? '删除中...' : '删除' }}
                  </button>
                </template>
              </div>
            </div>
          </div>

          <!-- New Key Display -->
          <div v-if="newAdminApiKey" class="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-green-400">新 API 密钥已生成</p>
                <p class="text-xs text-green-400/70 mt-1 mb-2">请立即复制并妥善保存此密钥。关闭此页面后将无法再次查看。</p>
                <code class="block break-all rounded bg-slate-950/50 px-3 py-2 text-sm font-mono text-green-300 border border-green-500/20">{{ newAdminApiKey }}</code>
              </div>
              <button
                type="button"
                @click="copyNewKey"
                class="rounded-lg border border-green-500/50 bg-green-500/10 px-3 py-2 text-sm text-green-400 hover:bg-green-500/20 transition whitespace-nowrap flex items-center gap-1.5 flex-shrink-0"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                {{ keyCopied ? '已复制' : '复制密钥' }}
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import type { SystemSettings } from '@/types'
import { adminAPI } from '@/api/admin'
import { showSuccess, showError } from '@/utils/toast'

const props = defineProps<{
  form: SystemSettings & Record<string, any>
}>()

defineEmits<{
  'update:form': [partial: Partial<SystemSettings>]
}>()

const form = computed(() => props.form)

function toggle(key: string) {
  ;(form.value as any)[key] = !(form.value as any)[key]
}

// ---- Email Suffix Whitelist ----
const emailSuffixInput = ref('')

function addEmailSuffix() {
  const raw = emailSuffixInput.value.trim()
  if (!raw) return
  // Split by comma to handle paste of comma-separated values
  const parts = raw
    .split(',')
    .map((s) => s.trim().replace(/^@/, ''))
    .filter((s) => s.length > 0)
  if (parts.length === 0) return
  if (!form.value.registration_email_suffix_whitelist) {
    form.value.registration_email_suffix_whitelist = []
  }
  for (const part of parts) {
    if (!form.value.registration_email_suffix_whitelist.includes(part)) {
      form.value.registration_email_suffix_whitelist.push(part)
    }
  }
  emailSuffixInput.value = ''
}

function removeEmailSuffix(i: number) {
  form.value.registration_email_suffix_whitelist.splice(i, 1)
}

// ---- Password Visibility ----
const passwordVisible = reactive<Record<string, boolean>>({})

function togglePasswordVisibility(key: string) {
  passwordVisible[key] = !passwordVisible[key]
}

// ---- WeChat Mode Mutual Exclusivity ----
function toggleWechatMode(mode: 'open' | 'mp' | 'mobile') {
  const key =
    mode === 'open'
      ? 'wechat_connect_open_enabled'
      : mode === 'mp'
      ? 'wechat_connect_mp_enabled'
      : 'wechat_connect_mobile_enabled'
  const otherKeys =
    mode === 'open'
      ? ['wechat_connect_mp_enabled', 'wechat_connect_mobile_enabled']
      : mode === 'mp'
      ? ['wechat_connect_open_enabled', 'wechat_connect_mobile_enabled']
      : ['wechat_connect_open_enabled', 'wechat_connect_mp_enabled']

  // If currently enabled, allow turning off
  if ((form.value as any)[key]) {
    ;(form.value as any)[key] = false
    return
  }

  // Turn on and disable others
  ;(form.value as any)[key] = true
  for (const other of otherKeys) {
    ;(form.value as any)[other] = false
  }

  // Set mode string for API
  form.value.wechat_connect_mode = mode
}

// ---- Set and Copy Helper ----
async function setAndCopy(key: string, value: string) {
  ;(form.value as any)[key] = value
  try {
    await navigator.clipboard.writeText(value)
    showSuccess('已设置并复制到剪贴板')
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = value
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      showSuccess('已设置并复制到剪贴板')
    } catch {
      showError('复制失败，请手动复制')
    }
  }
}

// ---- Admin API Key ----
const adminApiKeyLoading = ref(true)
const adminApiKeyExists = ref(false)
const adminApiKeyMasked = ref('')
const adminApiKeyOperating = ref(false)
const newAdminApiKey = ref('')
const keyCopied = ref(false)

async function loadAdminApiKey() {
  adminApiKeyLoading.value = true
  try {
    const result = await adminAPI.settings.getAdminApiKey()
    adminApiKeyExists.value = result.exists
    adminApiKeyMasked.value = result.masked_key || ''
  } catch (e: any) {
    console.error('Failed to load admin API key status:', e)
  } finally {
    adminApiKeyLoading.value = false
  }
}

async function createAdminApiKey() {
  if (!window.confirm('确定要创建管理员 API 密钥吗？密钥创建后将拥有完整的管理权限。')) return
  adminApiKeyOperating.value = true
  try {
    const result = await adminAPI.settings.regenerateAdminApiKey()
    newAdminApiKey.value = result.key
    adminApiKeyExists.value = true
    keyCopied.value = false
    showSuccess('管理员 API 密钥已创建')
  } catch (e: any) {
    showError(e?.response?.data?.message || e?.message || '创建失败')
  } finally {
    adminApiKeyOperating.value = false
  }
}

async function regenerateAdminApiKey() {
  if (!window.confirm('重新生成密钥后旧密钥将立即失效，所有使用旧密钥的外部系统将无法连接。确定要继续吗？')) return
  adminApiKeyOperating.value = true
  try {
    const result = await adminAPI.settings.regenerateAdminApiKey()
    newAdminApiKey.value = result.key
    keyCopied.value = false
    showSuccess('管理员 API 密钥已重新生成')
  } catch (e: any) {
    showError(e?.response?.data?.message || e?.message || '重新生成失败')
  } finally {
    adminApiKeyOperating.value = false
  }
}

async function deleteAdminApiKey() {
  if (!window.confirm('删除后所有使用此密钥的外部系统将立即断开连接。确定要删除吗？')) return
  adminApiKeyOperating.value = true
  try {
    await adminAPI.settings.deleteAdminApiKey()
    adminApiKeyExists.value = false
    adminApiKeyMasked.value = ''
    newAdminApiKey.value = ''
    showSuccess('管理员 API 密钥已删除')
  } catch (e: any) {
    showError(e?.response?.data?.message || e?.message || '删除失败')
  } finally {
    adminApiKeyOperating.value = false
  }
}

async function copyNewKey() {
  if (!newAdminApiKey.value) return
  try {
    await navigator.clipboard.writeText(newAdminApiKey.value)
    keyCopied.value = true
    showSuccess('已复制到剪贴板')
    setTimeout(() => { keyCopied.value = false }, 3000)
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = newAdminApiKey.value
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      keyCopied.value = true
      showSuccess('已复制到剪贴板')
      setTimeout(() => { keyCopied.value = false }, 3000)
    } catch {
      showError('复制失败，请手动复制')
    }
  }
}

onMounted(() => {
  loadAdminApiKey()
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
.toggle-switch {
  @apply relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200;
}
.toggle-knob {
  @apply inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200;
}
</style>
