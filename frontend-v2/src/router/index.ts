import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import ConsoleLayout from '@/layouts/ConsoleLayout.vue'
import PublicLayout from '@/layouts/PublicLayout.vue'
import { useAuthStore } from '@/stores'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/',
    component: PublicLayout,
    children: [
      { path: 'home', name: 'Home', component: () => import('@/views/public/HomeView.vue'), meta: { title: '首页', requiresAuth: false } },
      { path: 'setup', name: 'Setup', component: () => import('@/views/setup/SetupWizardView.vue'), meta: { title: '初始化设置', requiresAuth: false } },
      { path: 'key-usage', name: 'KeyUsage', component: () => import('@/views/public/KeyUsageView.vue'), meta: { title: '密钥用量查询', requiresAuth: false } },
      { path: 'payment/result', name: 'PaymentResult', component: () => import('@/views/user/PaymentResultView.vue'), meta: { title: '支付结果', requiresAuth: false } },
    ],
  },
  {
    path: '/',
    component: AuthLayout,
    children: [
      { path: 'login', name: 'Login', component: () => import('@/views/auth/LoginView.vue'), meta: { title: '登录', requiresAuth: false } },
      { path: 'register', name: 'Register', component: () => import('@/views/auth/RegisterView.vue'), meta: { title: '注册', requiresAuth: false } },
      { path: 'email-verify', name: 'EmailVerify', component: () => import('@/views/auth/EmailVerifyView.vue'), meta: { title: '邮箱验证', requiresAuth: false } },
      { path: 'forgot-password', name: 'ForgotPassword', component: () => import('@/views/auth/ForgotPasswordView.vue'), meta: { title: '忘记密码', requiresAuth: false } },
      { path: 'reset-password', name: 'ResetPassword', component: () => import('@/views/auth/ResetPasswordView.vue'), meta: { title: '重置密码', requiresAuth: false } },
      { path: 'auth/callback', name: 'OAuthCallback', component: () => import('@/views/auth/OAuthCallbackView.vue'), meta: { title: 'OAuth 回调', requiresAuth: false } },
      { path: 'auth/linuxdo/callback', name: 'LinuxDoOAuthCallback', component: () => import('@/views/auth/LinuxDoCallbackView.vue'), meta: { title: 'LinuxDo 回调', requiresAuth: false } },
      { path: 'auth/wechat/callback', name: 'WeChatOAuthCallback', component: () => import('@/views/auth/WechatCallbackView.vue'), meta: { title: '微信回调', requiresAuth: false } },
      { path: 'auth/wechat/payment/callback', name: 'WeChatPaymentOAuthCallback', component: () => import('@/views/auth/WechatPaymentCallbackView.vue'), meta: { title: '微信支付回调', requiresAuth: false } },
      { path: 'auth/oidc/callback', name: 'OIDCOAuthCallback', component: () => import('@/views/auth/OidcCallbackView.vue'), meta: { title: 'OIDC 回调', requiresAuth: false } },
    ],
  },
  {
    path: '/',
    component: ConsoleLayout,
    children: [
      { path: 'dashboard', name: 'Dashboard', component: () => import('@/views/user/DashboardView.vue'), meta: { title: '用户工作台', requiresAuth: true } },
      { path: 'keys', name: 'Keys', component: () => import('@/views/user/KeysView.vue'), meta: { title: 'API 密钥', requiresAuth: true } },
      { path: 'usage', name: 'Usage', component: () => import('@/views/user/UsageView.vue'), meta: { title: '用量记录', requiresAuth: true } },
      { path: 'redeem', name: 'Redeem', component: () => import('@/views/user/RedeemView.vue'), meta: { title: '兑换码', requiresAuth: true } },
      { path: 'profile', name: 'Profile', component: () => import('@/views/user/ProfileView.vue'), meta: { title: '个人资料', requiresAuth: true } },
      { path: 'subscriptions', name: 'Subscriptions', component: () => import('@/views/user/SubscriptionsView.vue'), meta: { title: '我的订阅', requiresAuth: true } },
      { path: 'purchase', name: 'PurchaseSubscription', component: () => import('@/views/user/PaymentView.vue'), meta: { title: '购买订阅', requiresAuth: true } },
      { path: 'orders', name: 'OrderList', component: () => import('@/views/user/UserOrdersView.vue'), meta: { title: '我的订单', requiresAuth: true } },
      { path: 'payment/qrcode', name: 'PaymentQRCode', component: () => import('@/views/user/PaymentQRCodeView.vue'), meta: { title: '扫码支付', requiresAuth: true } },
      { path: 'payment/stripe', name: 'StripePayment', component: () => import('@/views/user/StripePaymentView.vue'), meta: { title: 'Stripe 支付', requiresAuth: true } },
      { path: 'payment/stripe-popup', name: 'StripePopup', component: () => import('@/views/user/StripePopupView.vue'), meta: { title: '支付弹窗', requiresAuth: true } },
      { path: 'custom/:id', name: 'CustomPage', component: () => import('@/views/user/CustomPageView.vue'), meta: { title: '自定义页面', requiresAuth: true } },
      { path: 'admin', redirect: '/admin/dashboard' },
      { path: 'admin/dashboard', name: 'AdminDashboard', component: () => import('@/views/admin/DashboardView.vue'), meta: { title: '管理总览', requiresAuth: true, requiresAdmin: true } },
      { path: 'admin/ops', name: 'AdminOps', component: () => import('@/views/admin/ops/OpsDashboard.vue'), meta: { title: '运维监控', requiresAuth: true, requiresAdmin: true } },
      { path: 'admin/users', name: 'AdminUsers', component: () => import('@/views/admin/UsersView.vue'), meta: { title: '用户管理', requiresAuth: true, requiresAdmin: true } },
      { path: 'admin/groups', name: 'AdminGroups', component: () => import('@/views/admin/GroupsView.vue'), meta: { title: '分组管理', requiresAuth: true, requiresAdmin: true } },
      { path: 'admin/channels', name: 'AdminChannels', component: () => import('@/views/admin/ChannelsView.vue'), meta: { title: '渠道管理', requiresAuth: true, requiresAdmin: true } },
      { path: 'admin/subscriptions', name: 'AdminSubscriptions', component: () => import('@/views/admin/SubscriptionsView.vue'), meta: { title: '订阅管理', requiresAuth: true, requiresAdmin: true } },
      { path: 'admin/accounts', name: 'AdminAccounts', component: () => import('@/views/admin/AccountsView.vue'), meta: { title: '账号管理', requiresAuth: true, requiresAdmin: true } },
      { path: 'admin/announcements', name: 'AdminAnnouncements', component: () => import('@/views/admin/AnnouncementsView.vue'), meta: { title: '公告管理', requiresAuth: true, requiresAdmin: true } },
      { path: 'admin/proxies', name: 'AdminProxies', component: () => import('@/views/admin/ProxiesView.vue'), meta: { title: '代理管理', requiresAuth: true, requiresAdmin: true } },
      { path: 'admin/redeem', name: 'AdminRedeem', component: () => import('@/views/admin/RedeemView.vue'), meta: { title: '兑换码管理', requiresAuth: true, requiresAdmin: true } },
      { path: 'admin/promo-codes', name: 'AdminPromoCodes', component: () => import('@/views/admin/PromoCodesView.vue'), meta: { title: '优惠码管理', requiresAuth: true, requiresAdmin: true } },
      { path: 'admin/settings', name: 'AdminSettings', component: () => import('@/views/admin/SettingsView.vue'), meta: { title: '系统设置', requiresAuth: true, requiresAdmin: true } },
      { path: 'admin/usage', name: 'AdminUsage', component: () => import('@/views/admin/UsageView.vue'), meta: { title: '用量管理', requiresAuth: true, requiresAdmin: true } },
      { path: 'admin/orders/dashboard', name: 'AdminPaymentDashboard', component: () => import('@/views/admin/orders/AdminPaymentDashboardView.vue'), meta: { title: '支付总览', requiresAuth: true, requiresAdmin: true } },
      { path: 'admin/orders', name: 'AdminOrders', component: () => import('@/views/admin/orders/AdminOrdersView.vue'), meta: { title: '订单管理', requiresAuth: true, requiresAdmin: true } },
      { path: 'admin/orders/plans', name: 'AdminPaymentPlans', component: () => import('@/views/admin/orders/AdminPaymentPlansView.vue'), meta: { title: '支付套餐', requiresAuth: true, requiresAdmin: true } },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/public/NotFoundView.vue'),
    meta: { title: '页面不存在', requiresAuth: false },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  if (!authStore.initialized) {
    await authStore.initialize()
  }

  document.title = `${String(to.meta.title || 'sxsy2Api')} - sxsy2Api`

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return {
      path: '/login',
      query: { redirect: to.fullPath },
    }
  }

  if (
    (to.name === 'Login' ||
      to.name === 'Register' ||
      to.name === 'EmailVerify' ||
      to.name === 'ForgotPassword' ||
      to.name === 'ResetPassword') &&
    authStore.isAuthenticated
  ) {
    return '/dashboard'
  }

  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return '/dashboard'
  }
})

window.addEventListener('sub2api:unauthorized', async () => {
  const authStore = useAuthStore()
  authStore.clearSession()
  if (!window.location.pathname.includes('/login')) {
    await router.push({
      path: '/login',
      query: { redirect: window.location.pathname + window.location.search },
    })
  }
})

export default router
