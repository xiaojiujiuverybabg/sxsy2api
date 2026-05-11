<template>
  <div class="space-y-6">
    <!-- ==================== 1. Overload Cooldown (529) Settings ==================== -->
    <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
      <div class="border-b border-slate-700/50 px-6 py-4">
        <h2 class="text-lg font-semibold text-white">Overload Cooldown (529) 设置</h2>
        <p class="mt-1 text-sm text-slate-400">配置账户触发 529 overload 后的冷却策略</p>
      </div>
      <div class="p-6 space-y-4">
        <div v-if="overloadCooldownLoading" class="flex items-center justify-center py-6">
          <svg class="h-5 w-5 animate-spin text-gold-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span class="ml-2 text-sm text-slate-400">加载中...</span>
        </div>
        <template v-else>
          <div class="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/30 p-4">
            <div>
              <p class="text-sm font-medium text-white">启用</p>
              <p class="text-xs text-slate-400 mt-0.5">开启后，触发 529 overload 的账户将在冷却期内不会被调度</p>
            </div>
            <button
              type="button"
              @click="overloadCooldownForm.enabled = !overloadCooldownForm.enabled"
              class="toggle-switch"
              :class="overloadCooldownForm.enabled ? 'bg-gold-500' : 'bg-slate-700'"
            >
              <span class="toggle-knob" :class="overloadCooldownForm.enabled ? 'translate-x-6' : 'translate-x-1'" />
            </button>
          </div>
          <div v-if="overloadCooldownForm.enabled">
            <label class="mb-1.5 block text-sm font-medium text-slate-300">冷却分钟数 (1-120)</label>
            <input
              v-model.number="overloadCooldownForm.cooldown_minutes"
              type="number"
              min="1"
              max="120"
              class="form-input w-48"
            />
          </div>
          <div class="pt-2">
            <button
              type="button"
              @click="saveOverloadCooldown"
              :disabled="overloadCooldownSaving"
              class="rounded-lg bg-gold-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="overloadCooldownSaving" class="mr-1.5 inline h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              保存
            </button>
          </div>
        </template>
      </div>
    </div>

    <!-- ==================== 2. Stream Timeout Settings ==================== -->
    <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
      <div class="border-b border-slate-700/50 px-6 py-4">
        <h2 class="text-lg font-semibold text-white">流式超时设置</h2>
        <p class="mt-1 text-sm text-slate-400">配置流式请求超时检测与自动处理策略</p>
      </div>
      <div class="p-6 space-y-4">
        <div v-if="streamTimeoutLoading" class="flex items-center justify-center py-6">
          <svg class="h-5 w-5 animate-spin text-gold-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span class="ml-2 text-sm text-slate-400">加载中...</span>
        </div>
        <template v-else>
          <div class="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/30 p-4">
            <div>
              <p class="text-sm font-medium text-white">启用</p>
              <p class="text-xs text-slate-400 mt-0.5">开启后，系统将自动检测并处理流式请求超时</p>
            </div>
            <button
              type="button"
              @click="streamTimeoutForm.enabled = !streamTimeoutForm.enabled"
              class="toggle-switch"
              :class="streamTimeoutForm.enabled ? 'bg-gold-500' : 'bg-slate-700'"
            >
              <span class="toggle-knob" :class="streamTimeoutForm.enabled ? 'translate-x-6' : 'translate-x-1'" />
            </button>
          </div>
          <template v-if="streamTimeoutForm.enabled">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="mb-1.5 block text-sm font-medium text-slate-300">操作</label>
                <select v-model="streamTimeoutForm.action" class="form-input">
                  <option value="temp_unsched">临时取消调度</option>
                  <option value="error">报错</option>
                  <option value="none">无操作</option>
                </select>
              </div>
              <div v-if="streamTimeoutForm.action === 'temp_unsched'">
                <label class="mb-1.5 block text-sm font-medium text-slate-300">临时取消调度分钟数</label>
                <input
                  v-model.number="streamTimeoutForm.temp_unsched_minutes"
                  type="number"
                  min="1"
                  class="form-input w-48"
                />
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="mb-1.5 block text-sm font-medium text-slate-300">阈值计数</label>
                <input
                  v-model.number="streamTimeoutForm.threshold_count"
                  type="number"
                  min="1"
                  class="form-input w-48"
                />
                <p class="mt-1 text-xs text-slate-500">触发操作前的超时次数阈值</p>
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-slate-300">阈值窗口分钟数</label>
                <input
                  v-model.number="streamTimeoutForm.threshold_window_minutes"
                  type="number"
                  min="1"
                  class="form-input w-48"
                />
                <p class="mt-1 text-xs text-slate-500">计数归零的时间窗口</p>
              </div>
            </div>
          </template>
          <div class="pt-2">
            <button
              type="button"
              @click="saveStreamTimeout"
              :disabled="streamTimeoutSaving"
              class="rounded-lg bg-gold-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="streamTimeoutSaving" class="mr-1.5 inline h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              保存
            </button>
          </div>
        </template>
      </div>
    </div>

    <!-- ==================== 3. Rectifier Settings ==================== -->
    <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
      <div class="border-b border-slate-700/50 px-6 py-4">
        <h2 class="text-lg font-semibold text-white">整流器设置</h2>
        <p class="mt-1 text-sm text-slate-400">配置请求整流器，自动修正模型返回的签名问题</p>
      </div>
      <div class="p-6 space-y-4">
        <div v-if="rectifierLoading" class="flex items-center justify-center py-6">
          <svg class="h-5 w-5 animate-spin text-gold-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span class="ml-2 text-sm text-slate-400">加载中...</span>
        </div>
        <template v-else>
          <div class="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/30 p-4">
            <div>
              <p class="text-sm font-medium text-white">启用整流器</p>
              <p class="text-xs text-slate-400 mt-0.5">主开关，控制所有整流器功能</p>
            </div>
            <button
              type="button"
              @click="rectifierForm.enabled = !rectifierForm.enabled"
              class="toggle-switch"
              :class="rectifierForm.enabled ? 'bg-gold-500' : 'bg-slate-700'"
            >
              <span class="toggle-knob" :class="rectifierForm.enabled ? 'translate-x-6' : 'translate-x-1'" />
            </button>
          </div>
          <template v-if="rectifierForm.enabled">
            <div class="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/30 p-4">
              <div>
                <p class="text-sm font-medium text-white">思考签名整流器</p>
                <p class="text-xs text-slate-400 mt-0.5">自动修正 thinking signature 相关问题</p>
              </div>
              <button
                type="button"
                @click="rectifierForm.thinking_signature_enabled = !rectifierForm.thinking_signature_enabled"
                class="toggle-switch"
                :class="rectifierForm.thinking_signature_enabled ? 'bg-gold-500' : 'bg-slate-700'"
              >
                <span class="toggle-knob" :class="rectifierForm.thinking_signature_enabled ? 'translate-x-6' : 'translate-x-1'" />
              </button>
            </div>
            <div class="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/30 p-4">
              <div>
                <p class="text-sm font-medium text-white">思考预算整流器</p>
                <p class="text-xs text-slate-400 mt-0.5">自动修正 thinking budget 相关问题</p>
              </div>
              <button
                type="button"
                @click="rectifierForm.thinking_budget_enabled = !rectifierForm.thinking_budget_enabled"
                class="toggle-switch"
                :class="rectifierForm.thinking_budget_enabled ? 'bg-gold-500' : 'bg-slate-700'"
              >
                <span class="toggle-knob" :class="rectifierForm.thinking_budget_enabled ? 'translate-x-6' : 'translate-x-1'" />
              </button>
            </div>
            <div class="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/30 p-4">
              <div>
                <p class="text-sm font-medium text-white">API 密钥签名整流器</p>
                <p class="text-xs text-slate-400 mt-0.5">自动修正 API key signature 相关问题</p>
              </div>
              <button
                type="button"
                @click="rectifierForm.apikey_signature_enabled = !rectifierForm.apikey_signature_enabled"
                class="toggle-switch"
                :class="rectifierForm.apikey_signature_enabled ? 'bg-gold-500' : 'bg-slate-700'"
              >
                <span class="toggle-knob" :class="rectifierForm.apikey_signature_enabled ? 'translate-x-6' : 'translate-x-1'" />
              </button>
            </div>
            <div v-if="rectifierForm.apikey_signature_enabled" class="space-y-3 ml-4 pl-4 border-l-2 border-slate-700/50">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium text-slate-300">签名匹配模式</p>
                <button
                  type="button"
                  @click="addApikeySignaturePattern"
                  class="rounded-lg border border-dashed border-slate-600 px-3 py-1 text-xs text-slate-400 hover:border-gold-500 hover:text-gold-400 transition"
                >
                  + 添加模式
                </button>
              </div>
              <div v-if="!rectifierForm.apikey_signature_patterns || rectifierForm.apikey_signature_patterns.length === 0" class="text-center text-sm text-slate-500 py-2">
                暂无模式，点击上方按钮添加
              </div>
              <div
                v-for="(pattern, pi) in rectifierForm.apikey_signature_patterns"
                :key="pi"
                class="flex items-center gap-2"
              >
                <input
                  v-model="rectifierForm.apikey_signature_patterns[pi]"
                  type="text"
                  class="form-input flex-1 font-mono text-sm"
                  placeholder="正则表达式模式"
                />
                <button
                  type="button"
                  @click="removeApikeySignaturePattern(pi)"
                  class="rounded-lg p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          </template>
          <div class="pt-2">
            <button
              type="button"
              @click="saveRectifier"
              :disabled="rectifierSaving"
              class="rounded-lg bg-gold-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="rectifierSaving" class="mr-1.5 inline h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              保存
            </button>
          </div>
        </template>
      </div>
    </div>

    <!-- ==================== 4. Beta Policy Rules ==================== -->
    <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
      <div class="border-b border-slate-700/50 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-white">Beta 策略规则</h2>
          <p class="mt-1 text-sm text-slate-400">管理 API 请求中 beta token 的处理策略</p>
        </div>
        <button
          type="button"
          @click="addBetaPolicyRule"
          class="rounded-lg border border-dashed border-slate-600 px-3 py-1.5 text-xs text-slate-400 hover:border-gold-500 hover:text-gold-400 transition"
        >
          + 添加规则
        </button>
      </div>
      <div class="p-6 space-y-4">
        <div v-if="betaPolicyLoading" class="flex items-center justify-center py-6">
          <svg class="h-5 w-5 animate-spin text-gold-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span class="ml-2 text-sm text-slate-400">加载中...</span>
        </div>
        <div v-else-if="!betaPolicyForm.rules || betaPolicyForm.rules.length === 0" class="text-center text-sm text-slate-500 py-6">
          暂无 Beta 策略规则，点击上方按钮添加
        </div>
        <template v-else>
          <div
            v-for="(rule, ri) in betaPolicyForm.rules"
            :key="ri"
            class="rounded-lg border border-slate-700/50 bg-slate-900/30 p-4 space-y-4"
          >
            <!-- Rule header -->
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gold-400">规则 #{{ ri + 1 }}</span>
              <button
                type="button"
                @click="removeBetaPolicyRule(ri)"
                class="rounded-lg p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>

            <!-- Beta Token -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-300">Beta Token</label>
              <input
                v-model="rule.beta_token"
                type="text"
                class="form-input"
                placeholder="输入 Beta Token 名称或 ID"
              />
            </div>

            <!-- Action + Scope row -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="mb-1.5 block text-sm font-medium text-slate-300">操作</label>
                <select v-model="rule.action" class="form-input">
                  <option value="pass">通过</option>
                  <option value="filter">过滤</option>
                  <option value="block">阻止</option>
                </select>
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-slate-300">范围</label>
                <select v-model="rule.scope" class="form-input">
                  <option value="all">全部</option>
                  <option value="oauth">OAuth</option>
                  <option value="apikey">API 密钥</option>
                  <option value="bedrock">Bedrock</option>
                </select>
              </div>
            </div>

            <!-- Error message (when action=block) -->
            <div v-if="rule.action === 'block'">
              <label class="mb-1.5 block text-sm font-medium text-slate-300">错误消息</label>
              <input
                v-model="rule.error_message"
                type="text"
                class="form-input"
                placeholder="当操作为阻止时返回的错误消息"
              />
            </div>

            <!-- Model Whitelist -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-300">模型白名单</label>
              <div
                class="form-input flex flex-wrap items-center gap-1 py-1.5 min-h-[2.5rem] cursor-text"
                @click="focusBetaTagInput(ri, $event)"
              >
                <span
                  v-for="(tag, ti) in (rule.model_whitelist || [])"
                  :key="ti"
                  class="inline-flex items-center gap-1 rounded bg-gold-500/20 px-2 py-0.5 text-xs text-gold-400"
                >
                  {{ tag }}
                  <button
                    type="button"
                    @click.stop="removeModelTag(rule, ti)"
                    class="text-gold-500 hover:text-gold-300 transition"
                  >&times;</button>
                </span>
                <input
                  :ref="(el: any) => { if (el) betaTagInputRefs[ri] = el }"
                  type="text"
                  class="flex-1 min-w-[80px] border-none bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                  placeholder="输入模型后按回车或逗号添加"
                  @keydown.enter.prevent="addModelTagFromEvent(rule, $event)"
                  @keydown.,.prevent="addModelTagFromEvent(rule, $event)"
                  @keydown.delete="handleTagBackspace(rule, ri, $event)"
                />
              </div>
              <div class="mt-1.5 flex flex-wrap gap-1">
                <span class="text-xs text-slate-500 mr-1 pt-0.5">快速添加:</span>
                <button
                  v-for="preset in modelWhitelistPresets"
                  :key="preset"
                  type="button"
                  @click="addPresetModelTag(rule, preset)"
                  class="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-slate-400 hover:bg-gold-500/20 hover:text-gold-400 transition"
                >{{ preset }}</button>
              </div>
            </div>

            <!-- Fallback (when model_whitelist has items) -->
            <template v-if="rule.model_whitelist && rule.model_whitelist.length > 0">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-300">回退操作</label>
                  <select v-model="rule.fallback_action" class="form-input">
                    <option value="pass">通过</option>
                    <option value="filter">过滤</option>
                    <option value="block">阻止</option>
                  </select>
                </div>
                <div v-if="rule.fallback_action === 'block'">
                  <label class="mb-1.5 block text-sm font-medium text-slate-300">回退错误消息</label>
                  <input
                    v-model="rule.fallback_error_message"
                    type="text"
                    class="form-input"
                    placeholder="回退操作为阻止时的错误消息"
                  />
                </div>
              </div>
            </template>
          </div>
          <div class="pt-2">
            <button
              type="button"
              @click="saveBetaPolicy"
              :disabled="betaPolicySaving"
              class="rounded-lg bg-gold-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="betaPolicySaving" class="mr-1.5 inline h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              保存
            </button>
          </div>
        </template>
      </div>
    </div>

    <!-- ==================== 5. Claude Code Settings ==================== -->
    <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
      <div class="border-b border-slate-700/50 px-6 py-4">
        <h2 class="text-lg font-semibold text-white">Claude Code 设置</h2>
        <p class="mt-1 text-sm text-slate-400">限制允许使用的 Claude Code 版本范围</p>
      </div>
      <div class="p-6 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-300">最低 Claude Code 版本</label>
            <input
              v-model="form.min_claude_code_version"
              type="text"
              class="form-input font-mono text-sm"
              placeholder='例如: "0.2.0"'
            />
            <p class="mt-1 text-xs text-slate-500">留空则不限制最低版本</p>
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-300">最高 Claude Code 版本</label>
            <input
              v-model="form.max_claude_code_version"
              type="text"
              class="form-input font-mono text-sm"
              placeholder='例如: "0.3.0"'
            />
            <p class="mt-1 text-xs text-slate-500">留空则不限制最高版本</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 6. Dispatch Settings ==================== -->
    <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
      <div class="border-b border-slate-700/50 px-6 py-4">
        <h2 class="text-lg font-semibold text-white">调度设置</h2>
        <p class="mt-1 text-sm text-slate-400">控制 API 密钥和请求的调度行为</p>
      </div>
      <div class="p-6 space-y-4">
        <div class="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/30 p-4">
          <div>
            <p class="text-sm font-medium text-white">允许无分组密钥调度</p>
            <p class="text-xs text-slate-400 mt-0.5">启用后，未绑定分组的 API 密钥也可以进行调度</p>
          </div>
          <button
            type="button"
            @click="toggle('allow_ungrouped_key_scheduling')"
            class="toggle-switch"
            :class="form.allow_ungrouped_key_scheduling ? 'bg-gold-500' : 'bg-slate-700'"
          >
            <span class="toggle-knob" :class="form.allow_ungrouped_key_scheduling ? 'translate-x-6' : 'translate-x-1'" />
          </button>
        </div>
        <div class="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/30 p-4">
          <div>
            <p class="text-sm font-medium text-white">OpenAI 实验性调度器</p>
            <p class="text-xs text-slate-400 mt-0.5">启用实验性的 OpenAI 高级调度功能</p>
          </div>
          <button
            type="button"
            @click="toggle('openai_advanced_scheduler_enabled')"
            class="toggle-switch"
            :class="form.openai_advanced_scheduler_enabled ? 'bg-gold-500' : 'bg-slate-700'"
          >
            <span class="toggle-knob" :class="form.openai_advanced_scheduler_enabled ? 'translate-x-6' : 'translate-x-1'" />
          </button>
        </div>
      </div>
    </div>

    <!-- ==================== 7. Forwarding Behavior ==================== -->
    <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
      <div class="border-b border-slate-700/50 px-6 py-4">
        <h2 class="text-lg font-semibold text-white">转发行为</h2>
        <p class="mt-1 text-sm text-slate-400">控制请求转发时的处理行为</p>
      </div>
      <div class="p-6 space-y-4">
        <div class="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/30 p-4">
          <div>
            <p class="text-sm font-medium text-white">指纹统一</p>
            <p class="text-xs text-slate-400 mt-0.5">对不同的出口统一浏览器指纹特征</p>
          </div>
          <button
            type="button"
            @click="toggle('enable_fingerprint_unification')"
            class="toggle-switch"
            :class="form.enable_fingerprint_unification ? 'bg-gold-500' : 'bg-slate-700'"
          >
            <span class="toggle-knob" :class="form.enable_fingerprint_unification ? 'translate-x-6' : 'translate-x-1'" />
          </button>
        </div>
        <div class="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/30 p-4">
          <div>
            <p class="text-sm font-medium text-white">元数据透传</p>
            <p class="text-xs text-slate-400 mt-0.5">将请求中的元数据透传到上游服务</p>
          </div>
          <button
            type="button"
            @click="toggle('enable_metadata_passthrough')"
            class="toggle-switch"
            :class="form.enable_metadata_passthrough ? 'bg-gold-500' : 'bg-slate-700'"
          >
            <span class="toggle-knob" :class="form.enable_metadata_passthrough ? 'translate-x-6' : 'translate-x-1'" />
          </button>
        </div>
        <div class="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/30 p-4">
          <div>
            <p class="text-sm font-medium text-white">CCH 签名</p>
            <p class="text-xs text-slate-400 mt-0.5">对请求进行 CCH (Claude Code Host) 签名处理</p>
          </div>
          <button
            type="button"
            @click="toggle('enable_cch_signing')"
            class="toggle-switch"
            :class="form.enable_cch_signing ? 'bg-gold-500' : 'bg-slate-700'"
          >
            <span class="toggle-knob" :class="form.enable_cch_signing ? 'translate-x-6' : 'translate-x-1'" />
          </button>
        </div>
      </div>
    </div>

    <!-- ==================== 8. Web Search Emulation ==================== -->
    <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
      <div class="border-b border-slate-700/50 px-6 py-4">
        <h2 class="text-lg font-semibold text-white">Web 搜索模拟</h2>
        <p class="mt-1 text-sm text-slate-400">配置 Web 搜索 API 的模拟与代理</p>
      </div>
      <div class="p-6 space-y-4">
        <div v-if="webSearchLoading" class="flex items-center justify-center py-6">
          <svg class="h-5 w-5 animate-spin text-gold-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span class="ml-2 text-sm text-slate-400">加载中...</span>
        </div>
        <template v-else>
          <!-- Master toggle -->
          <div class="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/30 p-4">
            <div>
              <p class="text-sm font-medium text-white">启用 Web 搜索模拟</p>
              <p class="text-xs text-slate-400 mt-0.5">开启后，系统将拦截并模拟第三方 Web 搜索 API 请求</p>
            </div>
            <button
              type="button"
              @click="toggle('web_search_emulation_enabled')"
              class="toggle-switch"
              :class="form.web_search_emulation_enabled ? 'bg-gold-500' : 'bg-slate-700'"
            >
              <span class="toggle-knob" :class="form.web_search_emulation_enabled ? 'translate-x-6' : 'translate-x-1'" />
            </button>
          </div>

          <!-- Provider list -->
          <div
            v-for="(prov, pi) in webSearchProviders"
            :key="pi"
            class="rounded-lg border border-slate-700/50 bg-slate-900/30 p-4 space-y-4"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  @click="toggleWsProvider(pi)"
                  class="text-slate-400 hover:text-white transition"
                >
                  <svg
                    class="h-4 w-4 transition-transform"
                    :class="{ 'rotate-90': wsProviderExpanded[pi] }"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <span class="text-sm font-medium text-white">
                  提供者 #{{ pi + 1 }}
                  <span class="ml-2 text-xs text-gold-400">{{ prov.type === 'brave' ? 'Brave Search' : 'Tavily' }}</span>
                </span>
                <!-- Quota usage bar -->
                <div v-if="prov.quota_limit !== null && prov.quota_limit > 0" class="ml-4 flex items-center gap-2">
                  <div class="h-2 w-24 rounded-full bg-slate-700 overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all"
                      :class="(prov.quota_used || 0) >= prov.quota_limit ? 'bg-red-500' : (prov.quota_used || 0) / prov.quota_limit > 0.8 ? 'bg-amber-500' : 'bg-emerald-500'"
                      :style="{ width: Math.min(((prov.quota_used || 0) / prov.quota_limit) * 100, 100) + '%' }"
                    />
                  </div>
                  <span class="text-xs text-slate-400">{{ (prov.quota_used || 0).toLocaleString() }} / {{ prov.quota_limit.toLocaleString() }}</span>
                </div>
                <span v-else-if="prov.quota_used" class="ml-4 text-xs text-slate-500">已使用: {{ prov.quota_used.toLocaleString() }}</span>
              </div>
              <button
                type="button"
                @click="removeWsProvider(pi)"
                class="rounded-lg p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>

            <template v-if="wsProviderExpanded[pi]">
              <!-- Provider type selector -->
              <div>
                <label class="mb-1.5 block text-sm font-medium text-slate-300">类型</label>
                <select v-model="prov.type" class="form-input w-48">
                  <option value="brave">Brave Search</option>
                  <option value="tavily">Tavily</option>
                </select>
              </div>

              <!-- API Key -->
              <div>
                <label class="mb-1.5 block text-sm font-medium text-slate-300">API Key</label>
                <div class="flex items-center gap-2">
                  <div class="relative flex-1">
                    <input
                      :type="wsKeyVisible[pi] ? 'text' : 'password'"
                      v-model="wsProviderKeyInputs[pi]"
                      class="form-input pr-20"
                      :placeholder="prov.api_key_configured ? '已配置 (输入新值替换)' : '输入 API Key'"
                    />
                    <button
                      type="button"
                      @click="wsKeyVisible[pi] = !wsKeyVisible[pi]"
                      class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
                    >
                      <svg v-if="wsKeyVisible[pi]" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </button>
                  </div>
                  <button
                    v-if="prov.api_key_configured"
                    type="button"
                    @click="copyToClipboard(prov.api_key || '')"
                    class="rounded-lg p-2 text-slate-500 hover:text-gold-400 hover:bg-gold-500/10 transition"
                    title="复制 API Key"
                  >
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </button>
                </div>
              </div>

              <!-- Quota limit + Subscription date -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-300">配额限制</label>
                  <input
                    v-model.number="prov.quota_limit"
                    type="number"
                    class="form-input"
                    placeholder="留空 = 无限制"
                  />
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-300">订阅日期</label>
                  <input
                    :value="unixToDateInput(prov.subscribed_at)"
                    @input="prov.subscribed_at = dateInputToUnix(($event.target as HTMLInputElement).value)"
                    type="date"
                    class="form-input"
                  />
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-300">到期日期</label>
                  <input
                    :value="unixToDateInput(prov.expires_at)"
                    @input="prov.expires_at = dateInputToUnix(($event.target as HTMLInputElement).value)"
                    type="date"
                    class="form-input"
                  />
                </div>
              </div>

              <!-- Quota usage progress bar (full width) -->
              <div v-if="prov.quota_limit !== null && prov.quota_limit > 0" class="rounded-lg border border-slate-700/50 bg-slate-800/50 p-3">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs text-slate-400">配额使用情况</span>
                  <span class="text-xs text-slate-400">
                    {{ ((prov.quota_used || 0)).toLocaleString() }} / {{ prov.quota_limit.toLocaleString() }}
                    <span v-if="(prov.quota_used || 0) >= prov.quota_limit" class="ml-1 text-red-400">(已用尽)</span>
                  </span>
                </div>
                <div class="h-3 w-full rounded-full bg-slate-700 overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    :class="(prov.quota_used || 0) >= prov.quota_limit ? 'bg-red-500' : (prov.quota_used || 0) / prov.quota_limit > 0.8 ? 'bg-amber-500' : 'bg-emerald-500'"
                    :style="{ width: Math.min(((prov.quota_used || 0) / prov.quota_limit) * 100, 100) + '%' }"
                  />
                </div>
                <div class="flex justify-between mt-1">
                  <span class="text-xs text-slate-500">{{ Math.round(((prov.quota_used || 0) / prov.quota_limit) * 100) }}%</span>
                  <button
                    type="button"
                    @click="resetWsUsage(pi)"
                    :disabled="wsResetLoading[pi]"
                    class="text-xs text-amber-400 hover:text-amber-300 transition disabled:opacity-50"
                  >
                    <svg v-if="wsResetLoading[pi]" class="mr-1 inline h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    重置使用量
                  </button>
                </div>
              </div>

              <!-- Proxy selector -->
              <div>
                <label class="mb-1.5 block text-sm font-medium text-slate-300">代理 ID</label>
                <input
                  v-model.number="prov.proxy_id"
                  type="number"
                  class="form-input w-48"
                  placeholder="留空 = 不使用代理"
                />
              </div>

              <!-- Test section -->
              <div class="rounded-lg border border-slate-700/50 bg-slate-800/50 p-3 space-y-3">
                <button
                  type="button"
                  @click="toggleWsTest(pi)"
                  class="text-sm text-gold-400 hover:text-gold-300 transition flex items-center gap-1"
                >
                  <svg
                    class="h-4 w-4 transition-transform"
                    :class="{ 'rotate-90': wsTestVisible[pi] }"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                  测试
                </button>
                <template v-if="wsTestVisible[pi]">
                  <div class="flex items-center gap-2">
                    <input
                      v-model="wsTestQuery[pi]"
                      type="text"
                      class="form-input flex-1"
                      placeholder="输入搜索查询词"
                      @keydown.enter="runWsTest(pi)"
                    />
                    <button
                      type="button"
                      @click="runWsTest(pi)"
                      :disabled="wsTestLoading[pi]"
                      class="rounded-lg bg-gold-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg v-if="wsTestLoading[pi]" class="mr-1.5 inline h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      测试
                    </button>
                  </div>
                  <!-- Test results -->
                  <div v-if="wsTestResults[pi] && wsTestResults[pi].length > 0" class="space-y-2 mt-2">
                    <div
                      v-for="(result, tri) in wsTestResults[pi]"
                      :key="tri"
                      class="rounded-lg border border-slate-700/50 bg-slate-900/30 p-3"
                    >
                      <a v-if="result.url" :href="result.url" target="_blank" class="text-sm font-medium text-blue-400 hover:text-blue-300 transition">{{ result.title || result.url }}</a>
                      <p v-else-if="result.title" class="text-sm font-medium text-white">{{ result.title }}</p>
                      <p v-if="result.snippet" class="mt-1 text-xs text-slate-400">{{ result.snippet }}</p>
                    </div>
                  </div>
                  <div v-else-if="wsTestResults[pi] && wsTestResults[pi].length === 0" class="text-xs text-slate-500">
                    无搜索结果
                  </div>
                </template>
              </div>
            </template>
          </div>

          <!-- Add provider button -->
          <button
            type="button"
            @click="addWsProvider"
            class="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-slate-600 py-2.5 text-sm text-slate-400 hover:border-gold-500 hover:text-gold-400 transition"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
            添加提供者
          </button>

          <!-- Save button -->
          <div class="pt-2">
            <button
              type="button"
              @click="saveWebSearch"
              :disabled="webSearchSaving"
              class="rounded-lg bg-gold-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="webSearchSaving" class="mr-1.5 inline h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              保存
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { adminAPI } from '@/api/admin'
import { showSuccess, showError } from '@/utils/toast'
import type { SystemSettings, OverloadCooldownSettings, StreamTimeoutSettings, RectifierSettings, BetaPolicySettings, BetaPolicyRule, WebSearchEmulationConfig, WebSearchProviderConfig } from '@/types'

// ==================== Props ====================
const props = defineProps<{
  form: SystemSettings & Record<string, any>
}>()

const form = computed(() => props.form)

// ==================== Form-level toggle helper ====================
function toggle(key: string) {
  ;(form.value as any)[key] = !(form.value as any)[key]
}

// ==================== 1. Overload Cooldown State ====================
const overloadCooldownForm = reactive<OverloadCooldownSettings>({
  enabled: true,
  cooldown_minutes: 10,
})

const overloadCooldownLoading = ref(true)
const overloadCooldownSaving = ref(false)

async function loadOverloadCooldown() {
  try {
    overloadCooldownLoading.value = true
    const data = await adminAPI.settings.getOverloadCooldownSettings()
    Object.assign(overloadCooldownForm, data)
  } catch {
    // Keep defaults
  } finally {
    overloadCooldownLoading.value = false
  }
}

async function saveOverloadCooldown() {
  try {
    overloadCooldownSaving.value = true
    await adminAPI.settings.updateOverloadCooldownSettings({ ...overloadCooldownForm })
    showSuccess('Overload Cooldown 设置已保存')
  } catch (e: any) {
    showError(e?.response?.data?.message || e?.message || '保存失败')
  } finally {
    overloadCooldownSaving.value = false
  }
}

// ==================== 2. Stream Timeout State ====================
const streamTimeoutForm = reactive<StreamTimeoutSettings>({
  enabled: true,
  action: 'temp_unsched',
  temp_unsched_minutes: 5,
  threshold_count: 3,
  threshold_window_minutes: 10,
})

const streamTimeoutLoading = ref(true)
const streamTimeoutSaving = ref(false)

async function loadStreamTimeout() {
  try {
    streamTimeoutLoading.value = true
    const data = await adminAPI.settings.getStreamTimeoutSettings()
    Object.assign(streamTimeoutForm, data)
  } catch {
    // Keep defaults
  } finally {
    streamTimeoutLoading.value = false
  }
}

async function saveStreamTimeout() {
  try {
    streamTimeoutSaving.value = true
    await adminAPI.settings.updateStreamTimeoutSettings({ ...streamTimeoutForm })
    showSuccess('流式超时设置已保存')
  } catch (e: any) {
    showError(e?.response?.data?.message || e?.message || '保存失败')
  } finally {
    streamTimeoutSaving.value = false
  }
}

// ==================== 3. Rectifier State ====================
const rectifierForm = reactive<RectifierSettings>({
  enabled: true,
  thinking_signature_enabled: true,
  thinking_budget_enabled: true,
  apikey_signature_enabled: false,
  apikey_signature_patterns: [],
})

const rectifierLoading = ref(true)
const rectifierSaving = ref(false)

function addApikeySignaturePattern() {
  rectifierForm.apikey_signature_patterns.push('')
}

function removeApikeySignaturePattern(index: number) {
  rectifierForm.apikey_signature_patterns.splice(index, 1)
}

async function loadRectifier() {
  try {
    rectifierLoading.value = true
    const data = await adminAPI.settings.getRectifierSettings()
    Object.assign(rectifierForm, data)
  } catch {
    // Keep defaults
  } finally {
    rectifierLoading.value = false
  }
}

async function saveRectifier() {
  try {
    rectifierSaving.value = true
    await adminAPI.settings.updateRectifierSettings({ ...rectifierForm })
    showSuccess('整流器设置已保存')
  } catch (e: any) {
    showError(e?.response?.data?.message || e?.message || '保存失败')
  } finally {
    rectifierSaving.value = false
  }
}

// ==================== 4. Beta Policy State ====================
const betaPolicyForm = reactive<BetaPolicySettings>({
  rules: [],
})

const betaPolicyLoading = ref(true)
const betaPolicySaving = ref(false)
const betaTagInputRefs = reactive<Record<number, HTMLInputElement | null>>({})

const modelWhitelistPresets = [
  'claude-opus-4-6',
  'claude-sonnet-4-6',
  'claude-opus-*',
  'claude-sonnet-*',
]

function createBetaPolicyRule(): BetaPolicyRule {
  return {
    beta_token: '',
    action: 'filter',
    scope: 'all',
    error_message: '',
    model_whitelist: [],
    fallback_action: 'pass',
    fallback_error_message: '',
  }
}

function addBetaPolicyRule() {
  betaPolicyForm.rules.push(createBetaPolicyRule())
}

function removeBetaPolicyRule(index: number) {
  betaPolicyForm.rules.splice(index, 1)
}

function addModelTagFromEvent(rule: BetaPolicyRule, e: KeyboardEvent) {
  const input = e.target as HTMLInputElement
  const value = input.value.trim()
  if (value) {
    if (!rule.model_whitelist) rule.model_whitelist = []
    // Support comma-separated paste
    const tags = value.split(',').map(t => t.trim()).filter(Boolean)
    rule.model_whitelist.push(...tags)
    input.value = ''
  }
}

function addPresetModelTag(rule: BetaPolicyRule, tag: string) {
  if (!rule.model_whitelist) rule.model_whitelist = []
  if (!rule.model_whitelist.includes(tag)) {
    rule.model_whitelist.push(tag)
  }
}

function removeModelTag(rule: BetaPolicyRule, index: number) {
  if (rule.model_whitelist) {
    rule.model_whitelist.splice(index, 1)
  }
}

function focusBetaTagInput(ri: number, e: MouseEvent) {
  const target = e.target as HTMLElement
  if (target.tagName === 'INPUT') return
  const input = betaTagInputRefs[ri]
  if (input) input.focus()
}

function handleTagBackspace(rule: BetaPolicyRule, ri: number, e: KeyboardEvent) {
  const input = e.target as HTMLInputElement
  if (input.value === '' && rule.model_whitelist && rule.model_whitelist.length > 0) {
    rule.model_whitelist.pop()
  }
}

async function loadBetaPolicy() {
  try {
    betaPolicyLoading.value = true
    const data = await adminAPI.settings.getBetaPolicySettings()
    betaPolicyForm.rules = data.rules || []
  } catch {
    // Keep defaults
  } finally {
    betaPolicyLoading.value = false
  }
}

async function saveBetaPolicy() {
  try {
    betaPolicySaving.value = true
    await adminAPI.settings.updateBetaPolicySettings({ rules: betaPolicyForm.rules })
    showSuccess('Beta 策略规则已保存')
  } catch (e: any) {
    showError(e?.response?.data?.message || e?.message || '保存失败')
  } finally {
    betaPolicySaving.value = false
  }
}

// ==================== 5 & 6 & 7: Form-level settings (bound to form prop) ====================
// No additional state needed; toggles use form directly

// ==================== 8. Web Search Emulation State ====================
const webSearchProviders = ref<WebSearchProviderConfig[]>([])
const webSearchLoading = ref(true)
const webSearchSaving = ref(false)

const wsProviderExpanded = reactive<Record<number, boolean>>({})
const wsKeyVisible = reactive<Record<number, boolean>>({})
const wsProviderKeyInputs = reactive<Record<number, string>>({})

const wsTestVisible = reactive<Record<number, boolean>>({})
const wsTestQuery = reactive<Record<number, string>>({})
const wsTestLoading = reactive<Record<number, boolean>>({})
const wsTestResults = reactive<Record<number, any[]>>({})
const wsResetLoading = reactive<Record<number, boolean>>({})

function toggleWsProvider(pi: number) {
  wsProviderExpanded[pi] = !wsProviderExpanded[pi]
}

function toggleWsTest(pi: number) {
  wsTestVisible[pi] = !wsTestVisible[pi]
}

function addWsProvider() {
  webSearchProviders.value.push({
    type: 'brave',
    api_key: '',
    api_key_configured: false,
    quota_limit: null,
    subscribed_at: null,
    quota_used: 0,
    proxy_id: null,
    expires_at: null,
  })
  const pi = webSearchProviders.value.length - 1
  wsProviderExpanded[pi] = true
  wsKeyVisible[pi] = false
  wsProviderKeyInputs[pi] = ''
}

function removeWsProvider(pi: number) {
  webSearchProviders.value.splice(pi, 1)
}

function unixToDateInput(unix: number | null | undefined): string {
  if (!unix) return ''
  const d = new Date(unix * 1000)
  return d.toISOString().slice(0, 10)
}

function dateInputToUnix(dateStr: string): number | null {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T00:00:00Z')
  return Math.floor(d.getTime() / 1000)
}

function copyToClipboard(text: string) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      showSuccess('已复制到剪贴板')
    })
  }
}

async function resetWsUsage(pi: number) {
  try {
    wsResetLoading[pi] = true
    await adminAPI.settings.resetWebSearchUsage({ provider_type: webSearchProviders.value[pi].type })
    webSearchProviders.value[pi].quota_used = 0
    showSuccess('使用量已重置')
  } catch (e: any) {
    showError(e?.response?.data?.message || e?.message || '重置失败')
  } finally {
    wsResetLoading[pi] = false
  }
}

async function runWsTest(pi: number) {
  const query = wsTestQuery[pi]
  if (!query || !query.trim()) {
    showError('请输入搜索查询词')
    return
  }
  try {
    wsTestLoading[pi] = true
    const response = await adminAPI.settings.testWebSearchEmulation(query.trim())
    // API returns data directly or nested in data
    const results = (response as any)?.data?.results || (response as any)?.results || []
    wsTestResults[pi] = Array.isArray(results) ? results : [results].filter(Boolean)
  } catch (e: any) {
    showError(e?.response?.data?.message || e?.message || '测试失败')
  } finally {
    wsTestLoading[pi] = false
  }
}

async function loadWebSearch() {
  try {
    webSearchLoading.value = true
    const data = await adminAPI.settings.getWebSearchEmulationConfig()
    webSearchProviders.value = data.providers || []
    if (form.value.web_search_emulation_enabled === undefined) {
      form.value.web_search_emulation_enabled = data.enabled
    }
    // Initialize per-provider state
    webSearchProviders.value.forEach((_, pi) => {
      wsProviderExpanded[pi] = false
      wsKeyVisible[pi] = false
      wsProviderKeyInputs[pi] = ''
      wsTestVisible[pi] = false
      wsTestQuery[pi] = ''
      wsTestLoading[pi] = false
      wsTestResults[pi] = []
      wsResetLoading[pi] = false
    })
  } catch {
    // Keep empty
  } finally {
    webSearchLoading.value = false
  }
}

async function saveWebSearch() {
  try {
    webSearchSaving.value = true
    const providers = webSearchProviders.value.map((p, pi) => {
      const keyInput = wsProviderKeyInputs[pi]
      return {
        ...p,
        api_key: keyInput || p.api_key || '',
      }
    })
    await adminAPI.settings.updateWebSearchEmulationConfig({
      enabled: form.value.web_search_emulation_enabled ?? false,
      providers,
    })
    showSuccess('Web 搜索模拟配置已保存')
  } catch (e: any) {
    showError(e?.response?.data?.message || e?.message || '保存失败')
  } finally {
    webSearchSaving.value = false
  }
}

// ==================== Lifecycle ====================
onMounted(() => {
  loadOverloadCooldown()
  loadStreamTimeout()
  loadRectifier()
  loadBetaPolicy()
  loadWebSearch()
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
