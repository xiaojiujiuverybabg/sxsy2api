<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
    <!-- 页面标题 -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-white">🌐 代理管理</h1>
          <p class="mt-2 text-sm text-slate-400">管理代理服务器配置</p>
        </div>
        <div class="flex gap-3">
          <button
            @click="loadProxies"
            :disabled="loading"
            class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800 disabled:opacity-50"
          >
            <span v-if="loading">🔄 加载中...</span>
            <span v-else>🔄 刷新</span>
          </button>
          <button
            @click="openCreateDialog"
            class="rounded-lg border border-gold-500/50 bg-gradient-to-r from-gold-500/20 to-gold-600/20 px-4 py-2 text-sm font-medium text-gold-400 backdrop-blur-sm transition hover:border-gold-400 hover:from-gold-500/30 hover:to-gold-600/30"
          >
            ➕ 添加代理
          </button>
        </div>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="mb-6 rounded-xl border border-slate-700/50 bg-slate-800/40 p-4 backdrop-blur-sm">
      <div class="flex flex-wrap items-center gap-3">
        <select
          v-model="filters.protocol"
          @change="applyFilters"
          class="rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-2 text-sm text-white backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
        >
          <option value="">全部协议</option>
          <option value="http">HTTP</option>
          <option value="https">HTTPS</option>
          <option value="socks5">SOCKS5</option>
        </select>

        <select
          v-model="filters.status"
          @change="applyFilters"
          class="rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-2 text-sm text-white backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
        >
          <option value="">全部状态</option>
          <option value="active">活跃</option>
          <option value="inactive">停用</option>
        </select>

        <input
          v-model="filters.search"
          type="text"
          placeholder="搜索代理名称或地址..."
          class="flex-1 min-w-[200px] rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
          @input="handleSearch"
        />
      </div>
    </div>

    <!-- 代理列表 -->
    <div class="space-y-4">
      <!-- 加载状态 -->
      <div v-if="loading && proxies.length === 0" class="flex items-center justify-center rounded-xl border border-slate-700/50 bg-slate-800/40 py-20 backdrop-blur-sm">
        <div class="text-center">
          <div class="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-gold-500"></div>
          <p class="text-sm text-slate-400">加载中...</p>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="proxies.length === 0" class="flex flex-col items-center justify-center rounded-xl border border-slate-700/50 bg-slate-800/40 py-20 backdrop-blur-sm">
        <div class="mb-4 text-6xl">🌐</div>
        <p class="text-lg font-medium text-slate-300">暂无代理</p>
        <p class="mt-2 text-sm text-slate-500">点击"添加代理"按钮创建代理配置</p>
      </div>

      <!-- 代理卡片 -->
      <div
        v-for="proxy in proxies"
        :key="proxy.id"
        class="rounded-xl border border-slate-700/50 bg-slate-800/40 p-6 backdrop-blur-sm transition hover:border-slate-600"
      >
        <div class="flex items-start justify-between">
          <!-- 左侧信息 -->
          <div class="flex-1">
            <div class="mb-3 flex items-center gap-3">
              <h3 class="text-lg font-semibold text-white">{{ proxy.name }}</h3>
              <span
                :class="{
                  'bg-blue-500/20 text-blue-400 border-blue-500/50': proxy.protocol === 'http',
                  'bg-green-500/20 text-green-400 border-green-500/50': proxy.protocol === 'https',
                  'bg-purple-500/20 text-purple-400 border-purple-500/50': proxy.protocol === 'socks5'
                }"
                class="rounded-full border px-2 py-0.5 text-xs font-medium uppercase"
              >
                {{ proxy.protocol }}
              </span>
              <span
                :class="{
                  'bg-green-500/20 text-green-400 border-green-500/50': proxy.status === 'active',
                  'bg-slate-500/20 text-slate-400 border-slate-500/50': proxy.status === 'inactive'
                }"
                class="rounded-full border px-2 py-0.5 text-xs font-medium"
              >
                {{ proxy.status === 'active' ? '✓ 活跃' : '✗ 停用' }}
              </span>
            </div>

            <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
              <!-- 地址 -->
              <div>
                <div class="text-xs text-slate-500">地址</div>
                <div class="mt-1 font-mono text-sm text-slate-300">{{ proxy.host }}:{{ proxy.port }}</div>
              </div>

              <!-- 认证 -->
              <div>
                <div class="text-xs text-slate-500">认证</div>
                <div class="mt-1 text-sm text-slate-300">
                  {{ proxy.username ? '✓ 已配置' : '✗ 无需认证' }}
                </div>
              </div>

              <!-- 延迟 -->
              <div>
                <div class="text-xs text-slate-500">延迟</div>
                <div class="mt-1 text-sm">
                  <span
                    v-if="proxy.latency_ms"
                    :class="{
                      'text-green-400': proxy.latency_ms < 200,
                      'text-yellow-400': proxy.latency_ms >= 200 && proxy.latency_ms < 500,
                      'text-red-400': proxy.latency_ms >= 500
                    }"
                  >
                    {{ proxy.latency_ms }}ms
                  </span>
                  <span v-else class="text-slate-500">未测试</span>
                </div>
              </div>

              <!-- 关联账户 -->
              <div>
                <div class="text-xs text-slate-500">关联账户</div>
                <div class="mt-1 text-sm text-slate-300">{{ proxy.account_count || 0 }} 个</div>
              </div>

              <!-- IP 信息 -->
              <div v-if="proxy.ip_address">
                <div class="text-xs text-slate-500">IP 地址</div>
                <div class="mt-1 font-mono text-sm text-slate-300">{{ proxy.ip_address }}</div>
              </div>

              <!-- 位置 -->
              <div v-if="proxy.country">
                <div class="text-xs text-slate-500">位置</div>
                <div class="mt-1 text-sm text-slate-300">
                  {{ proxy.country_code }} {{ proxy.city || proxy.region || '' }}
                </div>
              </div>

              <!-- 质量状态 -->
              <div v-if="proxy.quality_status">
                <div class="text-xs text-slate-500">质量</div>
                <div class="mt-1">
                  <span
                    :class="{
                      'bg-green-500/20 text-green-400 border-green-500/50': proxy.quality_status === 'healthy',
                      'bg-yellow-500/20 text-yellow-400 border-yellow-500/50': proxy.quality_status === 'warn',
                      'bg-orange-500/20 text-orange-400 border-orange-500/50': proxy.quality_status === 'challenge',
                      'bg-red-500/20 text-red-400 border-red-500/50': proxy.quality_status === 'failed'
                    }"
                    class="rounded-full border px-2 py-0.5 text-xs font-medium"
                  >
                    {{ proxy.quality_grade || proxy.quality_status }}
                  </span>
                </div>
              </div>

              <!-- 创建时间 -->
              <div>
                <div class="text-xs text-slate-500">创建时间</div>
                <div class="mt-1 text-sm text-slate-300">{{ formatDate(proxy.created_at) }}</div>
              </div>
            </div>
          </div>

          <!-- 右侧操作 -->
          <div class="ml-4 flex flex-col gap-2">
            <button
              @click="testProxy(proxy.id)"
              class="rounded-lg border border-blue-500/50 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-400 backdrop-blur-sm transition hover:border-blue-400 hover:bg-blue-500/20"
            >
              🔍 测试
            </button>
            <button
              @click="toggleProxyStatus(proxy)"
              class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800"
            >
              {{ proxy.status === 'active' ? '⏸️ 停用' : '▶️ 启用' }}
            </button>
            <button
              @click="openEditDialog(proxy)"
              class="rounded-lg border border-gold-500/50 bg-gold-500/10 px-3 py-1.5 text-xs font-medium text-gold-400 backdrop-blur-sm transition hover:border-gold-400 hover:bg-gold-500/20"
            >
              ✏️ 编辑
            </button>
            <button
              @click="deleteProxy(proxy.id)"
              class="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 backdrop-blur-sm transition hover:border-red-400 hover:bg-red-500/20"
            >
              🗑️ 删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建/编辑对话框 -->
    <div
      v-if="showDialog"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      @click.self="closeDialog"
    >
      <div class="w-full max-w-2xl rounded-xl border border-slate-700/50 bg-slate-900 p-6 shadow-2xl">
        <h2 class="mb-6 text-xl font-bold text-white">
          {{ editingProxy ? '✏️ 编辑代理' : '➕ 添加代理' }}
        </h2>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <!-- 名称 -->
          <div class="md:col-span-2">
            <label class="mb-2 block text-sm font-medium text-slate-300">名称 *</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="代理名称"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            />
          </div>

          <!-- 协议 -->
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">协议 *</label>
            <select
              v-model="form.protocol"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-white backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            >
              <option value="http">HTTP</option>
              <option value="https">HTTPS</option>
              <option value="socks5">SOCKS5</option>
            </select>
          </div>

          <!-- 状态 -->
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">状态 *</label>
            <select
              v-model="form.status"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-white backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            >
              <option value="active">活跃</option>
              <option value="inactive">停用</option>
            </select>
          </div>

          <!-- 主机 -->
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">主机 *</label>
            <input
              v-model="form.host"
              type="text"
              placeholder="proxy.example.com"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            />
          </div>

          <!-- 端口 -->
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">端口 *</label>
            <input
              v-model.number="form.port"
              type="number"
              placeholder="8080"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            />
          </div>

          <!-- 用户名 -->
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">用户名（可选）</label>
            <input
              v-model="form.username"
              type="text"
              placeholder="username"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            />
          </div>

          <!-- 密码 -->
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">密码（可选）</label>
            <input
              v-model="form.password"
              type="password"
              placeholder="password"
              class="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            />
          </div>
        </div>

        <!-- 对话框按钮 -->
        <div class="mt-6 flex justify-end gap-3">
          <button
            @click="closeDialog"
            class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800"
          >
            取消
          </button>
          <button
            @click="saveProxy"
            :disabled="saving"
            class="rounded-lg border border-gold-500/50 bg-gradient-to-r from-gold-500/20 to-gold-600/20 px-4 py-2 text-sm font-medium text-gold-400 backdrop-blur-sm transition hover:border-gold-400 hover:from-gold-500/30 hover:to-gold-600/30 disabled:opacity-50"
          >
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminAPI } from '@/api/admin'
import type { Proxy, ProxyProtocol } from '@/types'
import { showSuccess, showError, confirm } from '@/utils/toast'

const loading = ref(false)
const saving = ref(false)
const proxies = ref<Proxy[]>([])
const filters = ref({
  protocol: '' as ProxyProtocol | '',
  status: '',
  search: ''
})

const showDialog = ref(false)
const editingProxy = ref<Proxy | null>(null)
const form = ref({
  name: '',
  protocol: 'http' as ProxyProtocol,
  host: '',
  port: 8080,
  username: '',
  password: '',
  status: 'active' as 'active' | 'inactive'
})

let searchTimeout: NodeJS.Timeout | null = null

onMounted(() => {
  loadProxies()
})

async function loadProxies() {
  loading.value = true
  try {
    const response = await adminAPI.proxies.list(1, 100, filters.value)
    proxies.value = response.data
  } catch (error: any) {
    showError(error.response?.data?.error || '加载代理失败')
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  loadProxies()
}

function handleSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadProxies()
  }, 500)
}

function openCreateDialog() {
  editingProxy.value = null
  form.value = {
    name: '',
    protocol: 'http',
    host: '',
    port: 8080,
    username: '',
    password: '',
    status: 'active'
  }
  showDialog.value = true
}

function openEditDialog(proxy: Proxy) {
  editingProxy.value = proxy
  form.value = {
    name: proxy.name,
    protocol: proxy.protocol,
    host: proxy.host,
    port: proxy.port,
    username: proxy.username || '',
    password: '',
    status: proxy.status
  }
  showDialog.value = true
}

function closeDialog() {
  showDialog.value = false
  editingProxy.value = null
}

async function saveProxy() {
  if (!form.value.name || !form.value.host || !form.value.port) {
    showError('请填写必填字段')
    return
  }

  saving.value = true
  try {
    const data = {
      name: form.value.name,
      protocol: form.value.protocol,
      host: form.value.host,
      port: form.value.port,
      username: form.value.username || null,
      password: form.value.password || null,
      status: form.value.status
    }

    if (editingProxy.value) {
      await adminAPI.proxies.update(editingProxy.value.id, data)
      showSuccess('代理更新成功')
    } else {
      await adminAPI.proxies.create(data)
      showSuccess('代理创建成功')
    }

    closeDialog()
    loadProxies()
  } catch (error: any) {
    showError(error.response?.data?.error || '保存失败')
  } finally {
    saving.value = false
  }
}

async function toggleProxyStatus(proxy: Proxy) {
  try {
    const newStatus = proxy.status === 'active' ? 'inactive' : 'active'
    await adminAPI.proxies.update(proxy.id, { status: newStatus })
    showSuccess(`代理已${newStatus === 'active' ? '启用' : '停用'}`)
    loadProxies()
  } catch (error: any) {
    showError(error.response?.data?.error || '状态切换失败')
  }
}

async function testProxy(id: number) {
  try {
    showSuccess('正在测试代理...')
    await adminAPI.proxies.test(id)
    showSuccess('代理测试完成')
    loadProxies()
  } catch (error: any) {
    showError(error.response?.data?.error || '测试失败')
  }
}

async function deleteProxy(id: number) {
  const confirmed = await confirm({
    title: '确认删除',
    message: '确定要删除这个代理吗？此操作不可恢复。'
  })

  if (!confirmed) return

  try {
    await adminAPI.proxies.delete(id)
    showSuccess('代理删除成功')
    loadProxies()
  } catch (error: any) {
    showError(error.response?.data?.error || '删除失败')
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('zh-CN')
}
</script>
