<template>
  <div class="flex h-screen overflow-hidden bg-surface-page">
    <!-- Left Sidebar -->
    <aside class="flex w-64 flex-col border-r border-brand-500/10 bg-surface-card/40 backdrop-blur-xl">
      <!-- Logo -->
      <div class="flex items-center gap-3 border-b border-brand-500/10 p-6">
        <div class="relative grid h-10 w-10 place-items-center rounded-xl border border-brand-500/30 bg-brand-500/20 shadow-[0_0_15px_rgba(220,38,38,0.4)]">
          <img src="/logo.png" alt="AICodeRelay" class="h-8 w-8 object-contain" />
          <div class="absolute inset-0 rounded-xl bg-brand-500 opacity-20 blur-md"></div>
        </div>
        <div>
          <h1 class="text-base font-black tracking-widest text-white">AICodeRelay</h1>
          <p class="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-gold-400">控制中枢</p>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto p-4">
        <div class="mb-2 px-2">
          <p class="text-xs font-bold uppercase tracking-wider text-text-muted">
            {{ isAdminMode ? '管理功能' : '用户功能' }}
          </p>
        </div>
        <div class="space-y-1">
          <RouterLink
            v-for="item in currentNav"
            :key="item.to"
            :to="item.to"
            class="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition"
            :class="isActive(item.to)
              ? isAdminMode
                ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30 shadow-[0_0_15px_rgba(251,191,36,0.2)]'
                : 'bg-brand-500/20 text-brand-400 border border-brand-500/30 shadow-[0_0_15px_rgba(220,38,38,0.2)]'
              : 'text-text-secondary hover:bg-white/5 hover:text-white border border-transparent'"
          >
            <span class="text-lg">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
            <svg v-if="isActive(item.to)" class="ml-auto h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </RouterLink>
        </div>
      </nav>

      <!-- User Info -->
      <div class="border-t border-brand-500/10 p-4">
        <div class="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
          <div class="h-10 w-10 rounded-full border border-brand-500/30 bg-brand-500/20 flex items-center justify-center">
            <span class="text-sm font-black text-brand-400">{{ userInitial }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="truncate text-sm font-bold text-white">{{ userName }}</p>
            <p class="text-xs text-text-muted">{{ userRole }}</p>
          </div>
          <button
            @click="handleLogout"
            class="rounded-lg p-2 text-text-muted transition hover:bg-white/10 hover:text-danger-400"
            title="退出登录"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex flex-1 flex-col overflow-hidden">
      <!-- Top Bar -->
      <header class="relative z-50 flex items-center justify-between border-b border-brand-500/10 bg-surface-card/40 px-6 py-4 backdrop-blur-xl">
        <div class="flex items-center gap-4">
          <div class="h-2 w-2 rounded-full bg-success-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
          <div>
            <p class="text-sm font-bold text-white">{{ pageTitle }}</p>
            <p class="text-xs text-text-muted">{{ pageSubtitle }}</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <!-- Balance Display -->
          <div v-if="!isSimpleMode && balance !== null" class="flex items-center gap-2 rounded-lg border border-brand-500/20 bg-brand-500/10 px-4 py-2">
            <span class="text-xs font-bold uppercase tracking-wider text-text-muted">余额</span>
            <span class="text-sm font-black text-brand-400">${{ formatBalance(balance) }}</span>
          </div>

          <!-- Mode Toggle Button (Admin Only) -->
          <button
            v-if="isAdmin"
            @click="toggleMode"
            class="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-bold transition"
            :class="isAdminMode
              ? 'border-brand-500/20 bg-brand-500/10 text-brand-400 hover:border-brand-500/40 hover:bg-brand-500/20'
              : 'border-gold-500/20 bg-gold-500/10 text-gold-400 hover:border-gold-500/40 hover:bg-gold-500/20'"
          >
            <span>{{ isAdminMode ? '👤' : '🎛️' }}</span>
            <span>{{ isAdminMode ? '用户功能' : '管理功能' }}</span>
          </button>
        </div>
      </header>

      <!-- Page Content -->
      <div class="flex-1 overflow-y-auto">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { confirm } from '@/utils/toast'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isAdminMode = ref(false)

// 根据当前路由自动判断模式
watch(() => route.path, (newPath) => {
  if (newPath.startsWith('/admin/')) {
    isAdminMode.value = true
  } else if (newPath.startsWith('/')) {
    isAdminMode.value = false
  }
}, { immediate: true })

const userName = computed(() => authStore.user?.username || '用户')
const userRole = computed(() => authStore.user?.role === 'admin' ? '管理员' : '普通用户')
const userInitial = computed(() => (authStore.user?.username || 'U').charAt(0).toUpperCase())
const isAdmin = computed(() => authStore.user?.role === 'admin')
const balance = computed(() => authStore.user?.balance ?? null)
const isSimpleMode = computed(() => authStore.isSimpleMode)

// 当前显示的导航菜单
const currentNav = computed(() => {
  return isAdminMode.value ? adminNav : userNav
})

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/dashboard': '工作台',
    '/keys': '密钥管理',
    '/usage': '用量统计',
    '/profile': '个人设置',
    '/subscriptions': '费用管理',
    '/purchase': '购买套餐',
    '/orders': '订单列表',
    '/redeem': '兑换码',
    '/admin/dashboard': '管理总览',
    '/admin/ops': '运维监控',
    '/admin/users': '用户管理',
    '/admin/groups': '分组管理',
    '/admin/channels': '渠道管理',
    '/admin/subscriptions': '订阅管理',
    '/admin/accounts': '账号管理',
    '/admin/announcements': '公告管理',
    '/admin/proxies': '代理管理',
    '/admin/redeem': '兑换码管理',
    '/admin/promo-codes': '优惠码管理',
    '/admin/orders': '订单管理',
    '/admin/orders/plans': '套餐管理',
    '/admin/usage': '用量统计',
    '/admin/settings': '系统设置',
  }
  return titles[route.path] || '控制台'
})

const pageSubtitle = computed(() => {
  const subtitles: Record<string, string> = {
    '/dashboard': '查看统计数据和最近活动',
    '/keys': '创建和管理 API 密钥',
    '/usage': '查看详细的用量记录',
    '/profile': '管理账户信息和安全设置',
    '/subscriptions': '管理订阅套餐和购买新套餐',
    '/purchase': '购买或续订套餐',
    '/orders': '查看订单历史',
    '/redeem': '兑换优惠码',
    '/admin/dashboard': '系统运行状态总览',
    '/admin/ops': '监控系统运行状态',
    '/admin/users': '管理用户账户',
    '/admin/groups': '管理用户分组',
    '/admin/channels': '管理 API 渠道',
    '/admin/subscriptions': '管理用户订阅',
    '/admin/accounts': '管理第三方账号',
    '/admin/announcements': '发布和管理公告',
    '/admin/proxies': '管理代理配置',
    '/admin/redeem': '管理兑换码',
    '/admin/promo-codes': '管理优惠码',
    '/admin/orders': '管理订单记录',
    '/admin/orders/plans': '管理套餐配置',
    '/admin/usage': '查看系统用量统计',
    '/admin/settings': '配置系统参数',
  }
  return subtitles[route.path] || ''
})

const userNav = [
  { to: '/dashboard', label: '工作台', icon: '📊' },
  { to: '/keys', label: '密钥管理', icon: '🔑' },
  // { to: '/usage', label: '用量统计', icon: '📈' },
  { to: '/subscriptions', label: '费用管理', icon: '💳' },
  // { to: '/purchase', label: '购买套餐', icon: '🛒' },
  { to: '/orders', label: '订单列表', icon: '📦' },
  { to: '/redeem', label: '兑换码', icon: '🎁' },
  { to: '/profile', label: '个人设置', icon: '⚙️' },
]

const adminNav = [
  { to: '/admin/dashboard', label: '管理总览', icon: '🎛️' },
  { to: '/admin/ops', label: '运维监控', icon: '🔍' },
  { to: '/admin/users', label: '用户管理', icon: '👥' },
  { to: '/admin/groups', label: '分组管理', icon: '📁' },
  { to: '/admin/channels', label: '渠道管理', icon: '🔌' },
  { to: '/admin/subscriptions', label: '订阅管理', icon: '💳' },
  { to: '/admin/accounts', label: '账号管理', icon: '🔐' },
  { to: '/admin/announcements', label: '公告管理', icon: '📢' },
  { to: '/admin/proxies', label: '代理管理', icon: '🛡️' },
  { to: '/admin/redeem', label: '兑换码管理', icon: '🎫' },
  { to: '/admin/promo-codes', label: '优惠码管理', icon: '🎁' },
  { to: '/admin/orders', label: '订单管理', icon: '📦' },
  { to: '/admin/orders/plans', label: '套餐管理', icon: '📋' },
  { to: '/admin/settings', label: '系统设置', icon: '🛠️' },
]

const allNavPaths = computed(() => [...userNav, ...adminNav].map(n => n.to))

const isActive = (path: string) => {
  if (route.path === path) return true
  if (!route.path.startsWith(path + '/')) return false
  // 存在更长的匹配项时，短路径不高亮（如 /admin/orders 在 /admin/orders/dashboard 时不高亮）
  return !allNavPaths.value.some(p => p !== path && p.startsWith(path + '/') && route.path.startsWith(p))
}

const formatBalance = (b: number) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(b)

const toggleMode = () => {
  if (isAdminMode.value) {
    // 切换到用户模式
    isAdminMode.value = false
    router.push('/dashboard')
  } else {
    // 切换到管理模式
    isAdminMode.value = true
    router.push('/admin/dashboard')
  }
}

const handleLogout = async () => {
  const confirmed = await confirm({
    type: 'warning',
    title: '确认退出',
    message: '确定要退出登录吗？',
    confirmText: '退出',
    cancelText: '取消'
  })

  if (confirmed) {
    await authStore.logout()
    router.push('/login')
  }
}
</script>
