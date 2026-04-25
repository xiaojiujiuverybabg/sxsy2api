<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    @click.self="$emit('close')"
  >
    <div class="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700/50 bg-slate-800/95 backdrop-blur-xl shadow-2xl">
      <!-- 头部 -->
      <div class="sticky top-0 z-10 border-b border-slate-700/50 bg-slate-800/95 backdrop-blur-xl px-6 py-4">
        <h2 class="text-xl font-bold text-white">
          {{ isEdit ? '✏️ 编辑分组' : '➕ 创建分组' }}
        </h2>
      </div>

      <!-- 表单内容 -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <!-- 基础信息 -->
        <div class="space-y-4">
          <h3 class="text-sm font-semibold text-slate-300 uppercase tracking-wider">基础信息</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-300">分组名称 *</label>
              <input
                v-model="formData.name"
                type="text"
                required
                placeholder="输入分组名称"
                class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-slate-300">平台 *</label>
              <select
                v-model="formData.platform"
                :disabled="isEdit"
                class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2 text-sm text-white backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50"
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="gemini">Gemini</option>
                <option value="antigravity">Antigravity</option>
              </select>
            </div>
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">描述</label>
            <textarea
              v-model="formData.description"
              placeholder="输入分组描述（可选）"
              rows="2"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            ></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-300">费率倍率 *</label>
              <input
                v-model.number="formData.rate_multiplier"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="1.0"
                class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-slate-300">状态</label>
              <select
                v-model="formData.status"
                class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2 text-sm text-white backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="active">活跃</option>
                <option value="inactive">禁用</option>
              </select>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <input
              v-model="formData.is_exclusive"
              type="checkbox"
              id="is_exclusive"
              class="h-4 w-4 rounded border-slate-700/50 bg-slate-900/50 text-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
            <label for="is_exclusive" class="text-sm font-medium text-slate-300">独占分组</label>
            <span class="text-xs text-slate-500">（独占分组的账号不会被其他分组使用）</span>
          </div>
        </div>

        <!-- 订阅配置 -->
        <div class="space-y-4 border-t border-slate-700/30 pt-6">
          <h3 class="text-sm font-semibold text-slate-300 uppercase tracking-wider">订阅配置</h3>

          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">订阅类型</label>
            <select
              v-model="formData.subscription_type"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2 text-sm text-white backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="standard">标准计费</option>
              <option value="subscription">订阅制</option>
            </select>
          </div>

          <div v-if="formData.subscription_type === 'subscription'" class="grid grid-cols-1 md:grid-cols-3 gap-4 pl-4 border-l-2 border-brand-500/30">
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-300">每日限额 (USD)</label>
              <input
                v-model.number="formData.daily_limit_usd"
                type="number"
                step="0.01"
                min="0"
                placeholder="不限制"
                class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-300">每周限额 (USD)</label>
              <input
                v-model.number="formData.weekly_limit_usd"
                type="number"
                step="0.01"
                min="0"
                placeholder="不限制"
                class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-300">每月限额 (USD)</label>
              <input
                v-model.number="formData.monthly_limit_usd"
                type="number"
                step="0.01"
                min="0"
                placeholder="不限制"
                class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>
        </div>

        <!-- 平台特定配置 -->
        <div v-if="showPlatformSpecificConfig" class="space-y-4 border-t border-slate-700/30 pt-6">
          <h3 class="text-sm font-semibold text-slate-300 uppercase tracking-wider">平台特定配置</h3>

          <!-- Anthropic: Claude Code Only -->
          <div v-if="formData.platform === 'anthropic'" class="space-y-3">
            <div class="flex items-center justify-between p-3 rounded-lg bg-slate-900/30">
              <div>
                <div class="text-sm font-medium text-slate-300">仅限 Claude Code 客户端</div>
                <div class="text-xs text-slate-500 mt-1">启用后只允许 Claude Code 客户端访问</div>
              </div>
              <button
                type="button"
                @click="formData.claude_code_only = !formData.claude_code_only"
                :class="[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  formData.claude_code_only ? 'bg-brand-500' : 'bg-slate-600'
                ]"
              >
                <span
                  :class="[
                    'inline-block h-4 w-4 transform rounded-full bg-white transition',
                    formData.claude_code_only ? 'translate-x-6' : 'translate-x-1'
                  ]"
                ></span>
              </button>
            </div>

            <div v-if="formData.claude_code_only">
              <label class="mb-2 block text-sm font-medium text-slate-300">降级分组</label>
              <select
                v-model="formData.fallback_group_id"
                class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2 text-sm text-white backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option :value="null">无降级</option>
                <option v-for="group in availableFallbackGroups" :key="group.id" :value="group.id">
                  {{ group.name }}
                </option>
              </select>
              <p class="mt-1 text-xs text-slate-500">非 Claude Code 客户端将使用此分组</p>
            </div>
          </div>

          <!-- OpenAI: 账号过滤 -->
          <div v-if="formData.platform === 'openai'" class="space-y-3">
            <div class="flex items-center justify-between p-3 rounded-lg bg-slate-900/30">
              <div>
                <div class="text-sm font-medium text-slate-300">仅允许 OAuth 账号</div>
                <div class="text-xs text-slate-500 mt-1">排除 API Key 类型账号</div>
              </div>
              <button
                type="button"
                @click="formData.require_oauth_only = !formData.require_oauth_only"
                :class="[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  formData.require_oauth_only ? 'bg-brand-500' : 'bg-slate-600'
                ]"
              >
                <span
                  :class="[
                    'inline-block h-4 w-4 transform rounded-full bg-white transition',
                    formData.require_oauth_only ? 'translate-x-6' : 'translate-x-1'
                  ]"
                ></span>
              </button>
            </div>
          </div>

          <!-- Antigravity: 支持的模型系列 -->
          <div v-if="formData.platform === 'antigravity'" class="space-y-3">
            <label class="block text-sm font-medium text-slate-300">支持的模型系列</label>
            <div class="space-y-2 pl-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  :checked="formData.supported_model_scopes.includes('claude')"
                  @change="toggleScope('claude')"
                  class="h-4 w-4 rounded border-slate-700/50 bg-slate-900/50 text-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
                <span class="text-sm text-slate-300">Claude</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  :checked="formData.supported_model_scopes.includes('gemini_text')"
                  @change="toggleScope('gemini_text')"
                  class="h-4 w-4 rounded border-slate-700/50 bg-slate-900/50 text-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
                <span class="text-sm text-slate-300">Gemini Text</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  :checked="formData.supported_model_scopes.includes('gemini_image')"
                  @change="toggleScope('gemini_image')"
                  class="h-4 w-4 rounded border-slate-700/50 bg-slate-900/50 text-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
                <span class="text-sm text-slate-300">Gemini Image</span>
              </label>
            </div>
          </div>

          <!-- 图片生成计费配置 -->
          <div v-if="['antigravity', 'gemini', 'openai'].includes(formData.platform)" class="space-y-3">
            <label class="block text-sm font-medium text-slate-300">图片生成计费配置</label>
            <p class="text-xs text-slate-500">设置不同分辨率图片的生成价格（USD）</p>
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="mb-2 block text-xs font-medium text-slate-400">1K ($)</label>
                <input
                  v-model.number="formData.image_price_1k"
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="0.134"
                  class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-2 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <div>
                <label class="mb-2 block text-xs font-medium text-slate-400">2K ($)</label>
                <input
                  v-model.number="formData.image_price_2k"
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="0.201"
                  class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-2 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <div>
                <label class="mb-2 block text-xs font-medium text-slate-400">4K ($)</label>
                <input
                  v-model.number="formData.image_price_4k"
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="0.268"
                  class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-2 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>
          </div>

          <!-- Antigravity: MCP XML 协议注入 -->
          <div v-if="formData.platform === 'antigravity'" class="space-y-3">
            <div class="flex items-center justify-between p-3 rounded-lg bg-slate-900/30">
              <div>
                <div class="text-sm font-medium text-slate-300">MCP XML 协议注入</div>
                <div class="text-xs text-slate-500 mt-1">启用后将注入 MCP XML 协议支持</div>
              </div>
              <button
                type="button"
                @click="formData.mcp_xml_inject = !formData.mcp_xml_inject"
                :class="[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  formData.mcp_xml_inject ? 'bg-brand-500' : 'bg-slate-600'
                ]"
              >
                <span
                  :class="[
                    'inline-block h-4 w-4 transform rounded-full bg-white transition',
                    formData.mcp_xml_inject ? 'translate-x-6' : 'translate-x-1'
                  ]"
                ></span>
              </button>
            </div>
          </div>

          <!-- Anthropic: 无效请求降级分组 -->
          <div v-if="formData.platform === 'anthropic' && formData.subscription_type !== 'subscription'" class="space-y-3">
            <label class="block text-sm font-medium text-slate-300">无效请求降级分组</label>
            <select
              v-model="formData.fallback_group_id_on_invalid_request"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2 text-sm text-white backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option :value="null" class="bg-slate-800 text-white">无降级</option>
              <option v-for="group in availableInvalidRequestFallbackGroups" :key="group.id" :value="group.id" class="bg-slate-800 text-white">
                {{ group.name }}
              </option>
            </select>
            <p class="text-xs text-slate-500">当请求无效时将使用此分组</p>
          </div>

          <!-- 账号过滤控制 -->
          <div v-if="['openai', 'antigravity', 'anthropic', 'gemini'].includes(formData.platform)" class="space-y-3">
            <div class="flex items-center justify-between p-3 rounded-lg bg-slate-900/30">
              <div>
                <div class="text-sm font-medium text-slate-300">仅允许隐私保护已设置的账号</div>
                <div class="text-xs text-slate-500 mt-1">Privacy 未设置的账号将被排除</div>
              </div>
              <button
                type="button"
                @click="formData.require_privacy_set = !formData.require_privacy_set"
                :class="[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  formData.require_privacy_set ? 'bg-brand-500' : 'bg-slate-600'
                ]"
              >
                <span
                  :class="[
                    'inline-block h-4 w-4 transform rounded-full bg-white transition',
                    formData.require_privacy_set ? 'translate-x-6' : 'translate-x-1'
                  ]"
                ></span>
              </button>
            </div>
          </div>
        </div>

        <!-- 从其他分组复制账号 -->
        <div v-if="!isEdit && availableCopyGroups.length > 0" class="space-y-4 border-t border-slate-700/30 pt-6">
          <h3 class="text-sm font-semibold text-slate-300 uppercase tracking-wider">从分组复制账号</h3>
          <p class="text-xs text-slate-500">创建分组时可以从现有分组复制账号</p>

          <div v-if="formData.copy_accounts_from_group_ids.length > 0" class="flex flex-wrap gap-2 mb-3">
            <span
              v-for="groupId in formData.copy_accounts_from_group_ids"
              :key="groupId"
              class="inline-flex items-center gap-1.5 rounded-full bg-brand-500/20 px-3 py-1 text-xs font-medium text-brand-400 border border-brand-500/30"
            >
              {{ availableCopyGroups.find(g => g.id === groupId)?.name || `#${groupId}` }}
              <button
                type="button"
                @click="removeCopyGroup(groupId)"
                class="text-brand-300 hover:text-brand-100"
              >
                ✕
              </button>
            </span>
          </div>

          <select
            @change="addCopyGroup"
            class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2 text-sm text-white backdrop-blur-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="" class="bg-slate-800 text-white">选择要复制账号的分组</option>
            <option
              v-for="group in availableCopyGroups"
              :key="group.id"
              :value="group.id"
              :disabled="formData.copy_accounts_from_group_ids.includes(group.id)"
              class="bg-slate-800 text-white"
            >
              {{ group.name }} ({{ group.account_count || 0 }} 个账号)
            </option>
          </select>
        </div>

        <!-- 底部按钮 -->
        <div class="sticky bottom-0 flex items-center justify-end gap-3 border-t border-slate-700/50 bg-slate-800/95 backdrop-blur-xl pt-4 -mx-6 -mb-6 px-6 pb-6">
          <button
            type="button"
            @click="$emit('close')"
            class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800"
          >
            取消
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:from-brand-600 hover:to-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { AdminGroup, GroupPlatform } from '@/types'

interface Props {
  show: boolean
  group?: AdminGroup | null
  availableGroups?: AdminGroup[]
}

interface Emits {
  (e: 'close'): void
  (e: 'submit', data: any): void
}

const props = withDefaults(defineProps<Props>(), {
  group: null,
  availableGroups: () => []
})

const emit = defineEmits<Emits>()

const saving = ref(false)
const isEdit = computed(() => !!props.group)

const formData = ref({
  name: '',
  description: '',
  platform: 'openai' as GroupPlatform,
  rate_multiplier: 1.0,
  status: 'active' as 'active' | 'inactive',
  is_exclusive: false,
  subscription_type: 'standard' as 'standard' | 'subscription',
  daily_limit_usd: null as number | null,
  weekly_limit_usd: null as number | null,
  monthly_limit_usd: null as number | null,
  claude_code_only: false,
  fallback_group_id: null as number | null,
  fallback_group_id_on_invalid_request: null as number | null,
  require_oauth_only: false,
  require_privacy_set: false,
  supported_model_scopes: ['claude', 'gemini_text', 'gemini_image'] as string[],
  image_price_1k: null as number | null,
  image_price_2k: null as number | null,
  image_price_4k: null as number | null,
  mcp_xml_inject: true,
  copy_accounts_from_group_ids: [] as number[]
})

const showPlatformSpecificConfig = computed(() => {
  return ['anthropic', 'openai', 'antigravity', 'gemini'].includes(formData.value.platform)
})

const availableFallbackGroups = computed(() => {
  return props.availableGroups.filter(g =>
    g.platform === 'anthropic' &&
    g.status === 'active' &&
    !g.claude_code_only &&
    g.id !== props.group?.id
  )
})

const availableInvalidRequestFallbackGroups = computed(() => {
  return props.availableGroups.filter(g =>
    g.platform === 'anthropic' &&
    g.status === 'active' &&
    g.subscription_type !== 'subscription' &&
    !g.fallback_group_id_on_invalid_request &&
    g.id !== props.group?.id
  )
})

const availableCopyGroups = computed(() => {
  return props.availableGroups.filter(g =>
    g.platform === formData.value.platform &&
    (g.account_count || 0) > 0 &&
    g.id !== props.group?.id
  )
})

const toggleScope = (scope: string) => {
  const index = formData.value.supported_model_scopes.indexOf(scope)
  if (index > -1) {
    formData.value.supported_model_scopes.splice(index, 1)
  } else {
    formData.value.supported_model_scopes.push(scope)
  }
}

const addCopyGroup = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const groupId = Number(target.value)
  if (groupId && !formData.value.copy_accounts_from_group_ids.includes(groupId)) {
    formData.value.copy_accounts_from_group_ids.push(groupId)
  }
  target.value = ''
}

const removeCopyGroup = (groupId: number) => {
  formData.value.copy_accounts_from_group_ids = formData.value.copy_accounts_from_group_ids.filter(id => id !== groupId)
}

const handleSubmit = async () => {
  saving.value = true
  try {
    emit('submit', { ...formData.value })
  } finally {
    saving.value = false
  }
}

// 监听 group 变化，初始化表单
watch(() => props.group, (group) => {
  if (group) {
    formData.value = {
      name: group.name,
      description: group.description || '',
      platform: group.platform,
      rate_multiplier: group.rate_multiplier,
      status: group.status,
      is_exclusive: group.is_exclusive,
      subscription_type: group.subscription_type || 'standard',
      daily_limit_usd: group.daily_limit_usd || null,
      weekly_limit_usd: group.weekly_limit_usd || null,
      monthly_limit_usd: group.monthly_limit_usd || null,
      claude_code_only: group.claude_code_only || false,
      fallback_group_id: group.fallback_group_id || null,
      fallback_group_id_on_invalid_request: group.fallback_group_id_on_invalid_request || null,
      require_oauth_only: group.require_oauth_only || false,
      require_privacy_set: group.require_privacy_set || false,
      supported_model_scopes: group.supported_model_scopes || ['claude', 'gemini_text', 'gemini_image'],
      image_price_1k: group.image_price_1k || null,
      image_price_2k: group.image_price_2k || null,
      image_price_4k: group.image_price_4k || null,
      mcp_xml_inject: group.mcp_xml_inject ?? true,
      copy_accounts_from_group_ids: []
    }
  } else {
    // 重置表单
    formData.value = {
      name: '',
      description: '',
      platform: 'openai',
      rate_multiplier: 1.0,
      status: 'active',
      is_exclusive: false,
      subscription_type: 'standard',
      daily_limit_usd: null,
      weekly_limit_usd: null,
      monthly_limit_usd: null,
      claude_code_only: false,
      fallback_group_id: null,
      fallback_group_id_on_invalid_request: null,
      require_oauth_only: false,
      require_privacy_set: false,
      supported_model_scopes: ['claude', 'gemini_text', 'gemini_image'],
      image_price_1k: null,
      image_price_2k: null,
      image_price_4k: null,
      mcp_xml_inject: true,
      copy_accounts_from_group_ids: []
    }
  }
}, { immediate: true })
</script>
