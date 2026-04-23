<template>
  <div class="flex h-screen overflow-hidden bg-surface-page">
    <!-- Left Sidebar -->
    <aside class="flex w-64 flex-col border-r border-brand-500/10 bg-surface-card/40 backdrop-blur-xl">
      <!-- Logo -->
      <div class="flex items-center gap-3 border-b border-brand-500/10 p-6">
        <div class="relative grid h-10 w-10 place-items-center rounded-xl border border-brand-500/30 bg-brand-500/20 shadow-[0_0_15px_rgba(220,38,38,0.4)]">
          <span class="text-sm font-black text-brand-400">S2</span>
          <div class="absolute inset-0 rounded-xl bg-brand-500 opacity-20 blur-md"></div>
        </div>
        <div>
          <h1 class="text-base font-black tracking-widest text-white">sxsy2Api</h1>
          <p class="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-gold-400">控制中枢</p>
        </div>
      </div>

      <!-- User Navigation -->
      <nav class="flex-1 overflow-y-auto p-4">
        <div class="mb-2 px-2">
          <p class="text-xs font-bold uppercase tracking-wider text-text-muted">用户功能</p>
        </div>
        <div class="space-y-1">
          <RouterLink
            v-for="item in userNav"
            :key="item.to"
            :to="item.to"
            class="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition"
            :class="isActive(item.to)
              ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30 shadow-[0_0_15px_rgba(220,38,38,0.2)]'
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
      <header class="flex items-center justify-between border-b border-brand-500/10 bg-surface-card/40 px-6 py-4 backdrop-blur-xl">
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

          <!-- Admin Menu -->
          <div v-if="isAdmin" class="relative">
            <button
              @click="showAdminMenu = !showAdminMenu"
              class="flex items-center gap-2 rounded-lg border border-gold-500/20 bg-gold-500/10 px-4 py-2 text-sm font-bold text-gold-400 transition hover:border-gold-500/40 hover:bg-gold-500/20"
            >
              <span>🎛️</span>
              <span>管理功能</span>
              <svg class="h-4 w-4 transition" :class="showAdminMenu ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Admin Dropdown -->
            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0 scale-95"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-95"
            >
              <div
                v-if="showAdminMenu"
                class="absolute right-0 top-full mt-2 w-56 origin-top-right rounded-xl border border-white/10 bg-surface-card/95 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl"
              >
                <RouterLink
                  v-for="item in adminNav"
                  :key="item.to"
                  :to="item.to"
                  class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold transition"
                  :class="isActive(item.to) ? 'bg-gold-500/20 text-gold-400' : 'text-white hover:bg-white/10'"
                  @click="showAdminMenu = false"
                >
                  <span>{{ item.icon }}</span>
                  <span>{{ item.label }}</span>
                </RouterLink>
              </div>
            </Transition>
          </div>
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
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const showAdminMenu = ref(false)

const userName = computed(() => authStore.user?.username || '用户')
const userRole = computed(() => authStore.user?.role === 'admin' ? '管理员' : '普通用户')
const userInitial = computed(() => (authStore.user?.username || 'U').charAt(0).toUpperCase())
const isAdmin = computed(() => authStore.user?.role === 'admin')
const balance = computed(() => authStore.user?.balance ?? null)
const isSimpleMode = computed(() => authStore.isSimpleMode)

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/dashboard': '工作台',
    '/keys': '密钥管理',
    '/usage': '用量统计',
    '/profile': '个人设置',
    '/subscriptions': '订阅管理',
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
    '/admin/orders/dashboard': '支付总览',
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
    '/subscriptions': '查看订阅状态',
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
    '/admin/orders/dashboard': '查看支付数据总览',
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
  { to: '/usage', label: '用量统计', icon: '📈' },
  { to: '/subscriptions', label: '订阅管理', icon: '💳' },
  { to: '/purchase', label: '购买套餐', icon: '🛒' },
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
  { to: '/admin/orders/dashboard', label: '支付总览', icon: '💰' },
  { to: '/admin/orders', label: '订单管理', icon: '📦' },
  { to: '/admin/orders/plans', label: '套餐管理', icon: '📋' },
  { to: '/admin/settings', label: '系统设置', icon: '🛠️' },
]

const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/')
}

const formatBalance = (b: number) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(b)

const handleLogout = async () => {
  if (confirm('确定要退出登录吗？')) {
    await authStore.logout()
    router.push('/login')
  }
}
</script>
