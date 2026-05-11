<template>
  <div class="space-y-6">
    <!-- Site Settings -->
    <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
      <div class="border-b border-slate-700/50 px-6 py-4">
        <h2 class="text-lg font-semibold text-white">站点设置</h2>
        <p class="mt-1 text-sm text-slate-400">配置站点品牌、URL和页面内容</p>
      </div>
      <div class="p-6 space-y-4">
        <!-- Backend Mode -->
        <div class="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/30 p-4">
          <div>
            <p class="text-sm font-medium text-white">后端模式</p>
            <p class="text-xs text-slate-400 mt-0.5">启用后，未登录用户仅能访问登录、用量查询、初始化配置和支付结果页面</p>
          </div>
          <button
            type="button"
            @click="toggle('backend_mode_enabled')"
            class="toggle-switch"
            :class="form.backend_mode_enabled ? 'bg-gold-500' : 'bg-slate-700'"
          >
            <span class="toggle-knob" :class="form.backend_mode_enabled ? 'translate-x-6' : 'translate-x-1'" />
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-300">站点名称</label>
            <input v-model="form.site_name" type="text" class="form-input" placeholder="例如：MyAPI" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-300">站点副标题</label>
            <input v-model="form.site_subtitle" type="text" class="form-input" placeholder="例如：Subscription to API Conversion Platform" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-300">API Base URL</label>
            <input v-model="form.api_base_url" type="text" class="form-input font-mono text-sm" placeholder="对外使用的 API 基础地址" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-300">站点 Logo URL</label>
            <input v-model="form.site_logo" type="text" class="form-input" placeholder="Logo 图片 URL（最大 300KB）" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-300">表格默认每页数量 (5-1000)</label>
            <input v-model.number="form.table_default_page_size" type="number" min="5" max="1000" class="form-input" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-300">表格每页数量选项 (逗号分隔)</label>
            <input v-model="tablePageSizeOptionsInput" type="text" class="form-input" placeholder="10, 20, 50, 100" @change="syncTablePageSizeOptions" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-300">联系信息</label>
            <input v-model="form.contact_info" type="text" class="form-input" placeholder="客户支持联系方式" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-300">文档 URL</label>
            <input v-model="form.doc_url" type="text" class="form-input" placeholder="https://docs.example.com" />
          </div>
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-300">首页内容 (支持 HTML)</label>
          <textarea v-model="form.home_content" rows="4" class="form-input" placeholder="输入首页展示的 HTML 内容..."></textarea>
          <p class="mt-1 text-xs text-amber-400">注意：若包含 iframe，请确保其来源允许被嵌入，否则部分浏览器可能因 CSP 策略阻止加载。</p>
        </div>

        <div class="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/30 p-4">
          <div>
            <p class="text-sm font-medium text-white">隐藏 CCS 导入按钮</p>
            <p class="text-xs text-slate-400 mt-0.5">在 Chrome 扩展中隐藏 Claude Code Subscription 导入按钮</p>
          </div>
          <button type="button" @click="toggle('hide_ccs_import_button')" class="toggle-switch" :class="form.hide_ccs_import_button ? 'bg-gold-500' : 'bg-slate-700'">
            <span class="toggle-knob" :class="form.hide_ccs_import_button ? 'translate-x-6' : 'translate-x-1'" />
          </button>
        </div>
      </div>
    </div>

    <!-- Custom Endpoints -->
    <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
      <div class="border-b border-slate-700/50 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-white">自定义端点</h2>
          <p class="mt-1 text-sm text-slate-400">添加自定义 API 端点供用户使用</p>
        </div>
        <button type="button" @click="addEndpoint" class="rounded-lg border border-dashed border-slate-600 px-3 py-1.5 text-xs text-slate-400 hover:border-gold-500 hover:text-gold-400 transition">
          + 添加端点
        </button>
      </div>
      <div class="p-6 space-y-3">
        <div v-if="!form.custom_endpoints || form.custom_endpoints.length === 0" class="text-center text-sm text-slate-500 py-4">
          暂无自定义端点，点击上方按钮添加
        </div>
        <div v-for="(ep, i) in form.custom_endpoints" :key="i" class="flex gap-3 items-start rounded-lg border border-slate-700/50 bg-slate-900/30 p-4">
          <div class="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
            <input v-model="ep.name" type="text" class="form-input" placeholder="名称" />
            <input v-model="ep.endpoint" type="text" class="form-input font-mono text-sm" placeholder="端点 URL" />
            <input v-model="ep.description" type="text" class="form-input" placeholder="描述" />
          </div>
          <button type="button" @click="removeEndpoint(i)" class="rounded-lg p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Custom Menu Items -->
    <div class="rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
      <div class="border-b border-slate-700/50 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-white">自定义菜单项</h2>
          <p class="mt-1 text-sm text-slate-400">管理侧边栏自定义导航菜单</p>
        </div>
        <button type="button" @click="addMenuItem" class="rounded-lg border border-dashed border-slate-600 px-3 py-1.5 text-xs text-slate-400 hover:border-gold-500 hover:text-gold-400 transition">
          + 添加菜单项
        </button>
      </div>
      <div class="p-6 space-y-3">
        <div v-if="!form.custom_menu_items || form.custom_menu_items.length === 0" class="text-center text-sm text-slate-500 py-4">
          暂无自定义菜单项，点击上方按钮添加
        </div>
        <div v-for="(item, i) in form.custom_menu_items" :key="item.id || i" class="flex gap-3 items-start rounded-lg border border-slate-700/50 bg-slate-900/30 p-4">
          <div class="flex flex-col gap-1">
            <button type="button" @click="moveMenuItem(i, -1)" :disabled="i === 0" class="rounded p-1 text-slate-500 hover:text-white disabled:opacity-30 transition" title="上移">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>
            </button>
            <button type="button" @click="moveMenuItem(i, 1)" :disabled="i === (form.custom_menu_items?.length || 0) - 1" class="rounded p-1 text-slate-500 hover:text-white disabled:opacity-30 transition" title="下移">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>
          <div class="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label class="mb-1 block text-xs text-slate-500">菜单名称</label>
              <input v-model="item.label" type="text" class="form-input" placeholder="菜单名称" />
            </div>
            <div>
              <label class="mb-1 block text-xs text-slate-500">可见性</label>
              <select v-model="item.visibility" class="form-input">
                <option value="user">用户可见</option>
                <option value="admin">管理员可见</option>
              </select>
            </div>
            <div>
              <label class="mb-1 block text-xs text-slate-500">URL 地址</label>
              <input v-model="item.url" type="text" class="form-input" placeholder="URL 地址" />
            </div>
            <div>
              <label class="mb-1 block text-xs text-slate-500">SVG 图标</label>
              <input v-model="item.icon_svg" type="text" class="form-input" placeholder="SVG 图标 (可选)" />
            </div>
          </div>
          <button type="button" @click="removeMenuItem(i)" class="rounded-lg p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition mt-5">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { SystemSettings } from '@/types'

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

const tablePageSizeOptionsInput = ref(form.value.table_page_size_options?.join(', ') || '10, 20, 50, 100')

function syncTablePageSizeOptions() {
  const parts = tablePageSizeOptionsInput.value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n > 0)
  form.value.table_page_size_options = parts.length > 0 ? parts : [10, 20, 50, 100]
}

watch(() => form.value.table_page_size_options, (v) => {
  if (v && v.join(', ') !== tablePageSizeOptionsInput.value) {
    tablePageSizeOptionsInput.value = v.join(', ')
  }
})

function addEndpoint() {
  if (!form.value.custom_endpoints) form.value.custom_endpoints = []
  form.value.custom_endpoints.push({ name: '', endpoint: '', description: '' })
}

function removeEndpoint(i: number) {
  form.value.custom_endpoints.splice(i, 1)
}

function addMenuItem() {
  if (!form.value.custom_menu_items) form.value.custom_menu_items = []
  form.value.custom_menu_items.push({
    id: crypto.randomUUID?.() || Date.now().toString(),
    label: '',
    icon_svg: '',
    url: '',
    visibility: 'user',
    sort_order: form.value.custom_menu_items.length,
  })
}

function removeMenuItem(i: number) {
  form.value.custom_menu_items.splice(i, 1)
  form.value.custom_menu_items.forEach((item: any, idx: number) => item.sort_order = idx)
}

function moveMenuItem(i: number, dir: number) {
  const arr = form.value.custom_menu_items
  const newIdx = i + dir
  if (newIdx < 0 || newIdx >= arr.length) return
  const temp = arr[i]
  arr[i] = arr[newIdx]
  arr[newIdx] = temp
  arr.forEach((item: any, idx: number) => item.sort_order = idx)
}
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
