<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    @click.self="$emit('close')"
  >
    <div class="w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-700/50 bg-slate-800/95 backdrop-blur-xl shadow-2xl">
      <!-- 头部 -->
      <div class="flex-shrink-0 border-b border-slate-700/50 px-6 py-4">
        <h2 class="text-xl font-bold text-white">
          {{ isEdit ? '✏️ 编辑渠道' : '➕ 创建渠道' }}
        </h2>
      </div>

      <!-- Tab Bar -->
      <div class="flex-shrink-0 flex items-center border-b border-slate-700/50 px-6 overflow-x-auto">
        <button
          type="button"
          @click="activeTab = 'basic'"
          class="px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
          :class="activeTab === 'basic' ? 'border-brand-500 text-brand-400' : 'border-transparent text-slate-400 hover:text-slate-300'"
        >
          基础设置
        </button>
        <button
          v-for="section in form.platforms.filter(s => s.enabled)"
          :key="section.platform"
          type="button"
          @click="activeTab = section.platform"
          class="px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5"
          :class="activeTab === section.platform ? 'border-brand-500 text-brand-400' : 'border-transparent text-slate-400 hover:text-slate-300'"
        >
          <span :class="platformTextClass(section.platform)">{{ platformLabel(section.platform) }}</span>
        </button>
      </div>

      <!-- 表单内容 -->
      <form id="channel-form" @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto p-6 space-y-5">
        <!-- Basic Settings Tab -->
        <div v-show="activeTab === 'basic'" class="space-y-5">
          <!-- Name -->
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">
              名称 <span class="text-red-400">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="输入渠道名称"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2 text-sm text-white placeholder-slate-500 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <!-- Description -->
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">描述</label>
            <textarea
              v-model="form.description"
              rows="2"
              placeholder="可选描述"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2 text-sm text-white placeholder-slate-500 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            ></textarea>
          </div>

          <!-- Status (edit only) -->
          <div v-if="isEdit">
            <label class="mb-2 block text-sm font-medium text-slate-300">状态</label>
            <select
              v-model="form.status"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2 text-sm text-white transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="active">启用</option>
              <option value="disabled">停用</option>
            </select>
          </div>

          <!-- Model Restriction -->
          <div>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                v-model="form.restrict_models"
                class="h-4 w-4 rounded border-slate-700/50 bg-slate-900/50 text-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
              <span class="text-sm font-medium text-slate-300">限制模型</span>
            </label>
            <p class="mt-1 ml-6 text-xs text-slate-400">
              开启后仅允许定价列表中的模型，不在列表中的模型请求将被拒绝。
            </p>
          </div>

          <!-- Billing Basis -->
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">计费基准</label>
            <select
              v-model="form.billing_model_source"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2 text-sm text-white transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="channel_mapped">以渠道映射后模型计费</option>
              <option value="requested">以请求模型计费</option>
              <option value="upstream">以最终模型计费</option>
            </select>
            <p class="mt-1 text-xs text-slate-400">控制使用哪个模型名称来查找定价</p>
          </div>

          <!-- Platform Management -->
          <div class="space-y-3">
            <label class="text-sm font-medium text-slate-300">平台配置</label>
            <div class="flex flex-wrap gap-2">
              <label
                v-for="p in platformOrder"
                :key="p"
                class="inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors"
                :class="activePlatforms.includes(p)
                  ? 'border-brand-500/50 bg-brand-500/10 text-brand-300'
                  : 'border-slate-700/50 text-slate-400 hover:bg-slate-800'"
              >
                <input
                  type="checkbox"
                  :checked="activePlatforms.includes(p)"
                  class="h-3.5 w-3.5 rounded border-slate-700/50 bg-slate-900/50 text-brand-500"
                  @change="togglePlatform(p)"
                />
                <span :class="platformTextClass(p)">{{ platformLabel(p) }}</span>
              </label>
            </div>
          </div>

          <!-- Apply Pricing to Account Stats -->
          <div class="border-t border-slate-700/30 pt-4">
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-slate-300">应用模型定价到账号统计</label>
                <p class="mt-0.5 text-xs text-slate-400">启用后未匹配自定义规则的请求将使用标准模型定价计算账号统计</p>
              </div>
              <button
                type="button"
                @click="form.apply_pricing_to_account_stats = !form.apply_pricing_to_account_stats"
                :class="[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  form.apply_pricing_to_account_stats ? 'bg-brand-500' : 'bg-slate-600'
                ]"
              >
                <span
                  :class="[
                    'inline-block h-4 w-4 transform rounded-full bg-white transition',
                    form.apply_pricing_to_account_stats ? 'translate-x-6' : 'translate-x-1'
                  ]"
                ></span>
              </button>
            </div>
          </div>
        </div>

        <!-- Platform Tab Content -->
        <div
          v-for="(section, sIdx) in form.platforms"
          :key="'tab-' + section.platform"
          v-show="section.enabled && activeTab === section.platform"
          class="space-y-4"
        >
          <!-- Groups -->
          <div>
            <label class="text-sm font-medium text-slate-300">
              关联分组 <span class="text-red-400">*</span>
              <span v-if="section.group_ids.length > 0" class="ml-1 font-normal text-slate-400">(已选 {{ section.group_ids.length }} 个)</span>
            </label>
            <div class="mt-2 max-h-40 overflow-auto rounded-lg border border-slate-700/50 bg-slate-900/30 p-2">
              <div v-if="groupsLoading" class="py-2 text-center text-xs text-slate-500">加载中...</div>
              <div v-else-if="getGroupsForPlatform(section.platform).length === 0" class="py-2 text-center text-xs text-slate-500">暂无可用分组</div>
              <div v-else class="flex flex-wrap gap-1">
                <label
                  v-for="group in getGroupsForPlatform(section.platform)"
                  :key="group.id"
                  class="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-700/50 px-2 py-1 text-xs transition-colors hover:bg-slate-800"
                  :class="[
                    section.group_ids.includes(group.id) ? 'border-brand-500/50 bg-brand-500/10' : '',
                    isGroupInOtherChannel(group.id) ? 'opacity-40' : ''
                  ]"
                >
                  <input
                    type="checkbox"
                    :checked="section.group_ids.includes(group.id)"
                    :disabled="isGroupInOtherChannel(group.id)"
                    class="h-3 w-3 rounded border-slate-700/50 bg-slate-900/50 text-brand-500"
                    @change="toggleGroupInSection(sIdx, group.id)"
                  />
                  <span :class="platformTextClass(group.platform)">{{ group.name }}</span>
                  <span class="rounded-full bg-slate-700/50 px-1 py-0 text-[10px] text-slate-300">{{ group.rate_multiplier }}x</span>
                  <span class="text-[10px] text-slate-400">{{ group.account_count || 0 }}</span>
                  <span v-if="isGroupInOtherChannel(group.id)" class="text-[10px] text-slate-400">已属于「{{ getGroupChannelName(group.id) }}」</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Web Search Emulation (Anthropic only) -->
          <div v-if="section.platform === 'anthropic' && webSearchGlobalEnabled" class="border-t border-slate-700/30 pt-3">
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-slate-300">Web Search 模拟</label>
                <p class="mt-0.5 text-[11px] text-red-400">开启后将拦截该渠道所有 Anthropic 分组的 web_search 请求</p>
              </div>
              <button
                type="button"
                @click="section.web_search_emulation = !section.web_search_emulation"
                :class="[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  section.web_search_emulation ? 'bg-brand-500' : 'bg-slate-600'
                ]"
              >
                <span
                  :class="[
                    'inline-block h-4 w-4 transform rounded-full bg-white transition',
                    section.web_search_emulation ? 'translate-x-6' : 'translate-x-1'
                  ]"
                ></span>
              </button>
            </div>
          </div>

          <!-- Model Mapping -->
          <div>
            <div class="mb-1 flex items-center justify-between">
              <label class="text-sm font-medium text-slate-300">模型映射</label>
              <button type="button" @click="addMappingEntry(sIdx)" class="text-xs text-brand-400 hover:text-brand-300">+ 添加</button>
            </div>
            <div v-if="Object.keys(section.model_mapping).length === 0" class="rounded border border-dashed border-slate-700/50 p-2 text-center text-xs text-slate-400">
              暂无映射规则，点击"添加"创建
            </div>
            <div v-else class="space-y-1">
              <div
                v-for="(_, srcModel) in section.model_mapping"
                :key="srcModel"
                class="flex items-center gap-2"
              >
                <input
                  :value="srcModel"
                  type="text"
                  class="flex-1 rounded border border-slate-700/50 bg-slate-900/50 px-2 py-1 text-xs text-white"
                  :class="platformTextClass(section.platform)"
                  placeholder="源模型"
                  @change="renameMappingKey(sIdx, srcModel, ($event.target as HTMLInputElement).value)"
                />
                <span class="text-slate-400 text-xs">→</span>
                <input
                  :value="section.model_mapping[srcModel]"
                  type="text"
                  class="flex-1 rounded border border-slate-700/50 bg-slate-900/50 px-2 py-1 text-xs text-white"
                  :class="platformTextClass(section.platform)"
                  placeholder="目标模型"
                  @input="section.model_mapping[srcModel] = ($event.target as HTMLInputElement).value"
                />
                <button
                  type="button"
                  @click="removeMappingEntry(sIdx, srcModel)"
                  class="rounded p-0.5 text-slate-400 hover:text-red-400"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4"><path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" /></svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Model Pricing -->
          <div>
            <div class="mb-1 flex items-center justify-between">
              <label class="text-sm font-medium text-slate-300">模型定价</label>
              <button type="button" @click="addPricingEntry(sIdx)" class="text-xs text-brand-400 hover:text-brand-300">+ 添加</button>
            </div>
            <div v-if="section.model_pricing.length === 0" class="rounded border border-dashed border-slate-700/50 p-2 text-center text-xs text-slate-400">
              暂无定价规则，点击"添加"创建
            </div>
            <div v-else class="space-y-2">
              <PricingEntryCard
                v-for="(entry, idx) in section.model_pricing"
                :key="idx"
                :entry="entry"
                :platform="section.platform"
                @update="updatePricingEntry(sIdx, idx, $event)"
                @remove="removePricingEntry(sIdx, idx)"
              />
            </div>
          </div>

          <!-- Account Stats Pricing Rules -->
          <div class="mt-4 border-t border-slate-700/30 pt-4 space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-medium text-slate-300">自定义账号统计定价规则</h4>
              <button type="button" @click="addAccountStatsRule(sIdx)" class="rounded-lg border border-brand-500/30 px-3 py-1 text-xs font-medium text-brand-400 hover:bg-brand-500/10">+ 添加规则</button>
            </div>

            <p v-if="section.account_stats_pricing_rules.length === 0" class="text-xs italic text-slate-400">暂无规则</p>

            <div
              v-for="(rule, ruleIndex) in section.account_stats_pricing_rules"
              :key="ruleIndex"
              class="space-y-3 rounded-lg border border-slate-700/50 p-4"
            >
              <div class="flex items-center justify-between">
                <input
                  v-model="rule.name"
                  placeholder="规则名称（可选）"
                  class="bg-transparent text-sm font-medium text-slate-300 placeholder-slate-500 outline-none"
                />
                <button type="button" @click="removeAccountStatsRule(sIdx, ruleIndex)" class="text-xs text-red-400 hover:text-red-300">删除</button>
              </div>

              <div>
                <label class="text-xs text-slate-400">关联分组</label>
                <div class="mt-1 flex flex-wrap gap-1">
                  <label
                    v-for="gid in section.group_ids"
                    :key="gid"
                    class="inline-flex cursor-pointer items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors"
                    :class="rule.group_ids.includes(gid)
                      ? 'border-brand-500/50 bg-brand-500/10'
                      : 'border-slate-700/50 hover:bg-slate-800'"
                  >
                    <input type="checkbox" :checked="rule.group_ids.includes(gid)" class="h-3 w-3 rounded border-slate-700/50 bg-slate-900/50 text-brand-500" @change="rule.group_ids.includes(gid) ? rule.group_ids.splice(rule.group_ids.indexOf(gid), 1) : rule.group_ids.push(gid)" />
                    <span :class="platformTextClass(section.platform)">{{ getGroupNameById(gid) }}</span>
                  </label>
                </div>
                <p v-if="section.group_ids.length === 0" class="mt-1 text-xs text-slate-400">该渠道暂无分组</p>
              </div>

              <div>
                <label class="text-xs text-slate-400">关联账号</label>
                <div class="mt-1 flex flex-wrap gap-1">
                  <span
                    v-for="accountId in rule.account_ids"
                    :key="accountId"
                    class="inline-flex items-center gap-1 rounded-md border border-brand-500/30 bg-brand-500/10 px-2 py-0.5 text-xs"
                  >
                    <span :class="platformTextClass(section.platform)">{{ getRuleAccountLabel(accountId) }}</span>
                    <button type="button" @click="removeRuleAccount(rule, accountId)" class="text-slate-400 hover:text-red-400">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-3 w-3"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
                    </button>
                  </span>
                </div>
                <div class="relative mt-1 rule-account-search-container">
                  <input
                    v-model="ruleAccountSearchKeyword[`${section.platform}-${ruleIndex}`]"
                    type="text"
                    class="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-2 text-sm text-white placeholder-slate-500"
                    placeholder="搜索账号..."
                    @input="onRuleAccountSearchInput(section.platform, ruleIndex)"
                    @focus="onRuleAccountSearchFocus(section.platform, ruleIndex)"
                  />
                  <div
                    v-if="showRuleAccountDropdown[`${section.platform}-${ruleIndex}`] && (ruleAccountSearchResults[`${section.platform}-${ruleIndex}`]?.length ?? 0) > 0"
                    class="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-slate-700/50 bg-slate-800 shadow-lg"
                  >
                    <button
                      v-for="account in ruleAccountSearchResults[`${section.platform}-${ruleIndex}`]"
                      :key="account.id"
                      type="button"
                      @click="selectRuleAccount(rule, account, section.platform, ruleIndex)"
                      class="w-full px-3 py-2 text-left text-sm hover:bg-slate-700"
                      :class="{ 'opacity-50': rule.account_ids.includes(account.id) }"
                      :disabled="rule.account_ids.includes(account.id)"
                    >
                      <span :class="platformTextClass(account.platform)">{{ account.name }}</span>
                      <span class="ml-2 text-xs text-slate-400">#{{ account.id }}</span>
                    </button>
                  </div>
                </div>
                <p class="mt-1 text-xs text-slate-400">搜索并选择要应用此规则的账号</p>
              </div>

              <div>
                <div class="mb-1 flex items-center justify-between">
                  <label class="text-xs text-slate-400">模型定价</label>
                  <button type="button" @click="addRulePricingEntry(sIdx, ruleIndex)" class="text-xs text-brand-400 hover:text-brand-300">+ 添加</button>
                </div>
                <div v-if="rule.pricing.length === 0" class="rounded border border-dashed border-slate-700/50 p-2 text-center text-xs text-slate-400">暂无定价规则</div>
                <div v-else class="space-y-2">
                  <PricingEntryCard
                    v-for="(entry, pIdx) in rule.pricing"
                    :key="pIdx"
                    :entry="entry"
                    :platform="section.platform"
                    @update="rule.pricing.splice(pIdx, 1, $event)"
                    @remove="removeRulePricingEntry(sIdx, ruleIndex, pIdx)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      <!-- Footer -->
      <div class="flex-shrink-0 flex justify-end gap-3 border-t border-slate-700/50 px-6 py-4">
        <button @click="$emit('close')" type="button" class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800">
          取消
        </button>
        <button
          type="submit"
          form="channel-form"
          :disabled="submitting"
          class="rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:from-brand-600 hover:to-brand-700 disabled:opacity-50"
        >
          {{ submitting ? '提交中...' : (isEdit ? '更新' : '创建') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import PricingEntryCard from './PricingEntryCard.vue'
import {
  mTokToPerToken, perTokenToMTok, apiIntervalsToForm, formIntervalsToAPI,
  findModelConflict, validateIntervals, platformTextClass
} from './types'
import type { Channel, AdminGroup, GroupPlatform, CreateChannelRequest, UpdateChannelRequest, AccountStatsPricingRule, ChannelModelPricing } from '@/types'
import type { PricingFormEntry, PlatformSection, FormPricingRule } from '@/types/channels'
import { adminAPI } from '@/api/admin'
import { showError, showSuccess } from '@/utils/toast'
import { extractErrorMessage } from '@/utils/format'

const props = defineProps<{
  show: boolean
  channel?: Channel | null
  allGroups: AdminGroup[]
  allChannels: Channel[]
  webSearchGlobalEnabled: boolean
}>()

const emit = defineEmits<{
  close: []
  success: []
}>()

const isEdit = computed(() => !!props.channel)
const platformOrder: GroupPlatform[] = ['anthropic', 'openai', 'gemini', 'antigravity']

const form = reactive({
  name: '',
  description: '',
  status: 'active' as 'active' | 'disabled',
  restrict_models: false,
  billing_model_source: 'channel_mapped' as string,
  platforms: [] as PlatformSection[],
  apply_pricing_to_account_stats: false,
})

const activeTab = ref('basic')
const submitting = ref(false)
const groupsLoading = ref(false)

const activePlatforms = computed(() => form.platforms.filter(s => s.enabled).map(s => s.platform))

function platformLabel(p: string) {
  switch (p) {
    case 'anthropic': return 'Anthropic'
    case 'openai': return 'OpenAI'
    case 'gemini': return 'Gemini'
    case 'antigravity': return 'Antigravity'
    default: return p
  }
}

function addPlatformSection(platform: GroupPlatform) {
  form.platforms.push({
    platform,
    enabled: true,
    collapsed: false,
    group_ids: [],
    model_mapping: {},
    model_pricing: [],
    web_search_emulation: false,
    account_stats_pricing_rules: [],
  })
}

function togglePlatform(platform: GroupPlatform) {
  const section = form.platforms.find(s => s.platform === platform)
  if (section) {
    section.enabled = !section.enabled
    if (!section.enabled && activeTab.value === platform) {
      activeTab.value = 'basic'
    }
  } else {
    addPlatformSection(platform)
  }
}

function getGroupsForPlatform(platform: GroupPlatform): AdminGroup[] {
  return props.allGroups.filter(g => g.platform === platform)
}

// ── Group conflict detection ────────────────────────────
const groupToChannelMap = computed(() => {
  const map = new Map<number, Channel>()
  for (const ch of props.allChannels) {
    if (props.channel && ch.id === props.channel.id) continue
    for (const gid of ch.group_ids || []) {
      map.set(gid, ch)
    }
  }
  return map
})

function isGroupInOtherChannel(groupId: number): boolean {
  return groupToChannelMap.value.has(groupId)
}

function getGroupChannelName(groupId: number): string {
  return groupToChannelMap.value.get(groupId)?.name || ''
}

function toggleGroupInSection(sectionIdx: number, groupId: number) {
  const section = form.platforms[sectionIdx]
  const idx = section.group_ids.indexOf(groupId)
  if (idx >= 0) {
    section.group_ids.splice(idx, 1)
  } else {
    section.group_ids.push(groupId)
  }
}

function getGroupNameById(groupId: number): string {
  const group = props.allGroups.find(g => g.id === groupId)
  return group ? group.name : `#${groupId}`
}

// ── Pricing helpers ─────────────────────────────────────
function addPricingEntry(sectionIdx: number) {
  form.platforms[sectionIdx].model_pricing.push({
    models: [],
    billing_mode: 'token',
    input_price: null,
    output_price: null,
    cache_write_price: null,
    cache_read_price: null,
    image_output_price: null,
    per_request_price: null,
    intervals: []
  })
}

function updatePricingEntry(sectionIdx: number, idx: number, updated: PricingFormEntry) {
  form.platforms[sectionIdx].model_pricing.splice(idx, 1, updated)
}

function removePricingEntry(sectionIdx: number, idx: number) {
  form.platforms[sectionIdx].model_pricing.splice(idx, 1)
}

// ── Model Mapping helpers ───────────────────────────────
function addMappingEntry(sectionIdx: number) {
  const mapping = form.platforms[sectionIdx].model_mapping
  let key = ''
  let i = 1
  while (key === '' || key in mapping) {
    key = `model-${i}`
    i++
  }
  mapping[key] = ''
}

function removeMappingEntry(sectionIdx: number, key: string) {
  delete form.platforms[sectionIdx].model_mapping[key]
}

function renameMappingKey(sectionIdx: number, oldKey: string, newKey: string) {
  newKey = newKey.trim()
  if (!newKey || newKey === oldKey) return
  const mapping = form.platforms[sectionIdx].model_mapping
  if (newKey in mapping) return
  const value = mapping[oldKey]
  delete mapping[oldKey]
  mapping[newKey] = value
}

// ── Account Stats Pricing helpers ───────────────────────
function addAccountStatsRule(sectionIdx: number) {
  form.platforms[sectionIdx].account_stats_pricing_rules.push({
    name: '',
    group_ids: [],
    account_ids: [],
    pricing: []
  })
}

function addRulePricingEntry(sectionIdx: number, ruleIndex: number) {
  form.platforms[sectionIdx].account_stats_pricing_rules[ruleIndex].pricing.push({
    models: [],
    billing_mode: 'token',
    input_price: null,
    output_price: null,
    cache_write_price: null,
    cache_read_price: null,
    image_output_price: null,
    per_request_price: null,
    intervals: []
  })
}

function removeAccountStatsRule(sectionIdx: number, ruleIndex: number) {
  form.platforms[sectionIdx].account_stats_pricing_rules.splice(ruleIndex, 1)
  clearRuleAccountSearchState(sectionIdx, ruleIndex)
}

function removeRulePricingEntry(sectionIdx: number, ruleIndex: number, pricingIndex: number) {
  form.platforms[sectionIdx].account_stats_pricing_rules[ruleIndex].pricing.splice(pricingIndex, 1)
}

// ── Account search for pricing rules ────────────────────
interface SimpleAccount { id: number; name: string; platform: string }

const ruleAccountSearchKeyword = ref<Record<string, string>>({})
const ruleAccountSearchResults = ref<Record<string, SimpleAccount[]>>({})
const showRuleAccountDropdown = ref<Record<string, boolean>>({})
const ruleAccountNameCache = ref<Record<number, string>>({})

let searchTimers: Record<string, ReturnType<typeof setTimeout>> = {}

async function runAccountSearch(key: string, keyword: string) {
  try {
    const platform = key.split('-')[0]
    const res = await adminAPI.accounts.list(1, 20, { platform, search: keyword })
    ruleAccountSearchResults.value[key] = res.items.map(a => ({ id: a.id, name: a.name, platform: a.platform }))
  } catch {
    ruleAccountSearchResults.value[key] = []
  }
}

function onRuleAccountSearchInput(platform: string, ruleIndex: number) {
  const key = `${platform}-${ruleIndex}`
  showRuleAccountDropdown.value[key] = true
  clearTimeout(searchTimers[key])
  searchTimers[key] = setTimeout(() => {
    runAccountSearch(key, ruleAccountSearchKeyword.value[key] || '')
  }, 300)
}

function onRuleAccountSearchFocus(platform: string, ruleIndex: number) {
  const key = `${platform}-${ruleIndex}`
  showRuleAccountDropdown.value[key] = true
  if (!ruleAccountSearchResults.value[key]?.length) {
    runAccountSearch(key, ruleAccountSearchKeyword.value[key] || '')
  }
}

function selectRuleAccount(
  rule: { account_ids: number[] },
  account: SimpleAccount,
  platform: string,
  ruleIndex: number,
) {
  if (!rule.account_ids.includes(account.id)) {
    rule.account_ids.push(account.id)
    ruleAccountNameCache.value[account.id] = account.name
  }
  const key = `${platform}-${ruleIndex}`
  ruleAccountSearchKeyword.value[key] = ''
  showRuleAccountDropdown.value[key] = false
}

function removeRuleAccount(rule: { account_ids: number[] }, accountId: number) {
  const idx = rule.account_ids.indexOf(accountId)
  if (idx !== -1) rule.account_ids.splice(idx, 1)
}

function getRuleAccountLabel(accountId: number): string {
  const name = ruleAccountNameCache.value[accountId]
  return name ? `${name} #${accountId}` : `#${accountId}`
}

function clearRuleAccountSearchState(sectionIdx?: number, ruleIndex?: number) {
  if (sectionIdx !== undefined && ruleIndex !== undefined) {
    const key = `${form.platforms[sectionIdx]?.platform}-${ruleIndex}`
    delete ruleAccountSearchKeyword.value[key]
    delete ruleAccountSearchResults.value[key]
    delete showRuleAccountDropdown.value[key]
  } else {
    ruleAccountSearchKeyword.value = {}
    ruleAccountSearchResults.value = {}
    showRuleAccountDropdown.value = {}
  }
}

function handleRuleAccountClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.rule-account-search-container')) {
    Object.keys(showRuleAccountDropdown.value).forEach(key => {
      showRuleAccountDropdown.value[key] = false
    })
  }
}

function accountStatsRulesToAPI(): AccountStatsPricingRule[] {
  const rules: AccountStatsPricingRule[] = []
  for (const section of form.platforms) {
    if (!section.enabled) continue
    for (const rule of section.account_stats_pricing_rules) {
      rules.push({
        name: rule.name,
        group_ids: rule.group_ids,
        account_ids: rule.account_ids,
        pricing: rule.pricing
          .filter(p => p.models.length > 0)
          .map(p => ({
            platform: section.platform,
            models: p.models,
            billing_mode: p.billing_mode,
            input_price: mTokToPerToken(p.input_price),
            output_price: mTokToPerToken(p.output_price),
            cache_write_price: mTokToPerToken(p.cache_write_price),
            cache_read_price: mTokToPerToken(p.cache_read_price),
            image_output_price: mTokToPerToken(p.image_output_price),
            per_request_price: p.per_request_price != null && p.per_request_price !== '' ? Number(p.per_request_price) : null,
            intervals: formIntervalsToAPI(p.intervals || [])
          }))
      })
    }
  }
  return rules
}

// ── Form ↔ API conversion ───────────────────────────────
function formToAPI(): { group_ids: number[]; model_pricing: any[]; model_mapping: Record<string, Record<string, string>>; features_config: Record<string, unknown> } {
  const group_ids: number[] = []
  const model_pricing: any[] = []
  const model_mapping: Record<string, Record<string, string>> = {}
  const featuresConfig: Record<string, unknown> = props.channel?.features_config
    ? { ...props.channel.features_config }
    : {}

  for (const section of form.platforms) {
    if (!section.enabled) continue
    group_ids.push(...section.group_ids)

    if (Object.keys(section.model_mapping).length > 0) {
      model_mapping[section.platform] = { ...section.model_mapping }
    }

    for (const entry of section.model_pricing) {
      if (entry.models.length === 0) continue
      model_pricing.push({
        platform: section.platform,
        models: entry.models,
        billing_mode: entry.billing_mode,
        input_price: mTokToPerToken(entry.input_price),
        output_price: mTokToPerToken(entry.output_price),
        cache_write_price: mTokToPerToken(entry.cache_write_price),
        cache_read_price: mTokToPerToken(entry.cache_read_price),
        image_output_price: mTokToPerToken(entry.image_output_price),
        per_request_price: entry.per_request_price != null && entry.per_request_price !== '' ? Number(entry.per_request_price) : null,
        intervals: formIntervalsToAPI(entry.intervals || [])
      })
    }
  }

  const wsEmulation: Record<string, boolean> = {}
  for (const section of form.platforms) {
    if (!section.enabled) continue
    if (section.platform === 'anthropic') {
      wsEmulation[section.platform] = !!section.web_search_emulation
    }
  }
  if (Object.keys(wsEmulation).length > 0) {
    featuresConfig.web_search_emulation = wsEmulation
  } else {
    delete featuresConfig.web_search_emulation
  }

  return { group_ids, model_pricing, model_mapping, features_config: featuresConfig }
}

function apiToForm(channel: Channel): PlatformSection[] {
  const groupPlatformMap = new Map<number, GroupPlatform>()
  for (const g of props.allGroups) {
    groupPlatformMap.set(g.id, g.platform)
  }

  const activePlatforms = new Set<GroupPlatform>()
  for (const gid of channel.group_ids || []) {
    const p = groupPlatformMap.get(gid)
    if (p) activePlatforms.add(p)
  }
  for (const p of channel.model_pricing || []) {
    if (p.platform) activePlatforms.add(p.platform as GroupPlatform)
  }
  for (const p of Object.keys(channel.model_mapping || {})) {
    if (platformOrder.includes(p as GroupPlatform)) activePlatforms.add(p as GroupPlatform)
  }

  const sections: PlatformSection[] = []
  for (const platform of platformOrder) {
    if (!activePlatforms.has(platform)) continue

    const groupIds = (channel.group_ids || []).filter((gid: number) => groupPlatformMap.get(gid) === platform)
    const mapping = (channel.model_mapping || {})[platform] || {}
    const pricing = (channel.model_pricing || [])
      .filter((p: ChannelModelPricing) => (p.platform || 'anthropic') === platform)
      .map((p: ChannelModelPricing) => ({
        models: p.models || [],
        billing_mode: p.billing_mode,
        input_price: perTokenToMTok(p.input_price),
        output_price: perTokenToMTok(p.output_price),
        cache_write_price: perTokenToMTok(p.cache_write_price),
        cache_read_price: perTokenToMTok(p.cache_read_price),
        image_output_price: perTokenToMTok(p.image_output_price),
        per_request_price: p.per_request_price,
        intervals: apiIntervalsToForm(p.intervals || [])
      } as PricingFormEntry))

    const fc = channel.features_config
    const wsEmulation = fc?.web_search_emulation as Record<string, boolean> | undefined
    const webSearchEnabled = wsEmulation?.[platform] === true

    sections.push({
      platform,
      enabled: true,
      collapsed: false,
      group_ids: groupIds,
      model_mapping: { ...mapping },
      model_pricing: pricing,
      web_search_emulation: webSearchEnabled,
      account_stats_pricing_rules: [],
    })
  }

  return sections
}

function distributeRulesToPlatforms(apiRules: AccountStatsPricingRule[]) {
  const groupPlatformMap = new Map<number, GroupPlatform>()
  for (const g of props.allGroups) {
    groupPlatformMap.set(g.id, g.platform)
  }

  for (const apiRule of apiRules) {
    const platforms = new Set<GroupPlatform>()
    for (const gid of apiRule.group_ids || []) {
      const p = groupPlatformMap.get(gid)
      if (p) platforms.add(p)
    }
    if (platforms.size === 0 && apiRule.pricing?.length > 0) {
      const p = apiRule.pricing[0].platform as GroupPlatform | undefined
      if (p) platforms.add(p)
    }
    const targetPlatform = platforms.size >= 1 ? [...platforms][0] : null
    if (!targetPlatform) continue

    const section = form.platforms.find(s => s.platform === targetPlatform)
    if (!section) continue

    const formRule: FormPricingRule = {
      name: apiRule.name || '',
      group_ids: [...(apiRule.group_ids || [])],
      account_ids: [...(apiRule.account_ids || [])],
      pricing: (apiRule.pricing || []).map((p: ChannelModelPricing) => ({
        models: [...(p.models || [])],
        billing_mode: p.billing_mode,
        input_price: perTokenToMTok(p.input_price),
        output_price: perTokenToMTok(p.output_price),
        cache_write_price: perTokenToMTok(p.cache_write_price),
        cache_read_price: perTokenToMTok(p.cache_read_price),
        image_output_price: perTokenToMTok(p.image_output_price),
        per_request_price: p.per_request_price,
        intervals: apiIntervalsToForm(p.intervals || [])
      } as PricingFormEntry))
    }
    section.account_stats_pricing_rules.push(formRule)
  }
}

async function populateRuleAccountNameCache() {
  const allAccountIds = new Set<number>()
  for (const section of form.platforms) {
    for (const rule of section.account_stats_pricing_rules) {
      for (const id of rule.account_ids) {
        allAccountIds.add(id)
      }
    }
  }
  if (allAccountIds.size === 0) return

  // Fetch account details in parallel
  const ids = [...allAccountIds]
  const results = await Promise.allSettled(
    ids.map(id => adminAPI.accounts.getById(id))
  )
  for (let i = 0; i < ids.length; i++) {
    const result = results[i]
    if (result.status === 'fulfilled') {
      ruleAccountNameCache.value[ids[i]] = result.value.name
    }
  }
}

// ── Reset / Init ────────────────────────────────────────
function resetForm() {
  form.name = ''
  form.description = ''
  form.status = 'active'
  form.restrict_models = false
  form.billing_model_source = 'channel_mapped'
  form.platforms = []
  form.apply_pricing_to_account_stats = false
  activeTab.value = 'basic'
  clearRuleAccountSearchState()
  ruleAccountNameCache.value = {}
}

async function initForm() {
  if (props.channel) {
    form.name = props.channel.name
    form.description = props.channel.description || ''
    form.status = props.channel.status as 'active' | 'disabled'
    form.restrict_models = props.channel.restrict_models || false
    form.billing_model_source = props.channel.billing_model_source || 'channel_mapped'
    form.apply_pricing_to_account_stats = props.channel.apply_pricing_to_account_stats || false
    form.platforms = apiToForm(props.channel)
    distributeRulesToPlatforms(props.channel.account_stats_pricing_rules || [])
    await populateRuleAccountNameCache()
  } else {
    resetForm()
  }
}

watch(() => props.show, (show) => {
  if (show) {
    initForm()
  }
})

// ── Submit ──────────────────────────────────────────────
async function handleSubmit() {
  if (submitting.value) return
  if (!form.name.trim()) {
    showError('请输入渠道名称')
    return
  }

  for (const section of form.platforms.filter(s => s.enabled)) {
    if (section.group_ids.length === 0) {
      showError(`${platformLabel(section.platform)} 平台未选择分组，请至少选择一个分组或禁用该平台`)
      activeTab.value = section.platform
      return
    }
    for (const entry of section.model_pricing) {
      if (entry.models.length === 0) {
        showError(`${platformLabel(section.platform)} 平台下有定价条目未添加模型`)
        activeTab.value = section.platform
        return
      }
    }
  }

  for (const section of form.platforms.filter(s => s.enabled)) {
    const allModels: string[] = []
    for (const entry of section.model_pricing) {
      allModels.push(...entry.models)
    }
    const pricingConflict = findModelConflict(allModels)
    if (pricingConflict) {
      showError(`模型模式 '${pricingConflict[0]}' 和 '${pricingConflict[1]}' 冲突：匹配范围重叠`)
      activeTab.value = section.platform
      return
    }
    const mappingKeys = Object.keys(section.model_mapping)
    if (mappingKeys.length > 0) {
      const mappingConflict = findModelConflict(mappingKeys)
      if (mappingConflict) {
        showError(`模型映射源 '${mappingConflict[0]}' 和 '${mappingConflict[1]}' 冲突：匹配范围重叠`)
        activeTab.value = section.platform
        return
      }
    }
  }

  for (const section of form.platforms.filter(s => s.enabled)) {
    for (const entry of section.model_pricing) {
      if (entry.models.length === 0) continue
      if ((entry.billing_mode === 'per_request' || entry.billing_mode === 'image') &&
          (entry.per_request_price == null || entry.per_request_price === '') &&
          (!entry.intervals || entry.intervals.length === 0)) {
        showError('按次/图片计费模式必须设置默认价格或至少一个计费层级')
        return
      }
    }
  }

  for (const section of form.platforms.filter(s => s.enabled)) {
    for (const entry of section.model_pricing) {
      if (!entry.intervals || entry.intervals.length === 0) continue
      const intervalErr = validateIntervals(entry.intervals)
      if (intervalErr) {
        const modelLabel = entry.models.join(', ') || '未命名'
        showError(`${platformLabel(section.platform)} - ${modelLabel}: ${intervalErr}`)
        activeTab.value = section.platform
        return
      }
    }
  }

  const { group_ids, model_pricing, model_mapping, features_config } = formToAPI()

  submitting.value = true
  try {
    if (props.channel) {
      const req: UpdateChannelRequest = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        status: form.status,
        group_ids,
        model_pricing,
        model_mapping: Object.keys(model_mapping).length > 0 ? model_mapping : {},
        billing_model_source: form.billing_model_source,
        restrict_models: form.restrict_models,
        features_config,
        apply_pricing_to_account_stats: form.apply_pricing_to_account_stats,
        account_stats_pricing_rules: accountStatsRulesToAPI()
      }
      await adminAPI.channels.update(props.channel.id, req)
      showSuccess('渠道更新成功')
    } else {
      const req: CreateChannelRequest = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        group_ids,
        model_pricing,
        model_mapping: Object.keys(model_mapping).length > 0 ? model_mapping : {},
        billing_model_source: form.billing_model_source,
        restrict_models: form.restrict_models,
        features_config,
        apply_pricing_to_account_stats: form.apply_pricing_to_account_stats,
        account_stats_pricing_rules: accountStatsRulesToAPI()
      }
      await adminAPI.channels.create(req)
      showSuccess('渠道创建成功')
    }
    emit('success')
    emit('close')
  } catch (error: unknown) {
    showError(extractErrorMessage(error, props.channel ? '更新渠道失败' : '创建渠道失败'))
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleRuleAccountClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleRuleAccountClickOutside)
  Object.values(searchTimers).forEach(clearTimeout)
})
</script>
