<template>
  <div class="flex h-[calc(100vh-80px)] flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
    <!-- 加载状态 -->
    <div v-if="loading" class="flex h-full items-center justify-center">
      <div class="text-center">
        <div class="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-brand-500/20 border-t-brand-500"></div>
        <p class="text-sm text-slate-400">加载中...</p>
      </div>
    </div>

    <!-- 页面未找到 -->
    <div v-else-if="!menuItem" class="flex h-full items-center justify-center">
      <div class="max-w-md text-center">
        <div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
          <svg class="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-white">页面未找到</h3>
        <p class="mt-3 text-sm text-slate-400">请求的自定义页面不存在或已被删除</p>
        <button
          @click="$router.push('/dashboard')"
          class="mt-6 rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-500/30 transition hover:shadow-brand-500/50"
        >
          返回工作台
        </button>
      </div>
    </div>

    <!-- URL 未配置 -->
    <div v-else-if="!isValidUrl" class="flex h-full items-center justify-center">
      <div class="max-w-md text-center">
        <div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 backdrop-blur-sm">
          <svg class="h-10 w-10 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-white">页面未配置</h3>
        <p class="mt-3 text-sm text-slate-400">该自定义页面的 URL 尚未配置或无效</p>
        <button
          @click="$router.push('/dashboard')"
          class="mt-6 rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-500/30 transition hover:shadow-brand-500/50"
        >
          返回工作台
        </button>
      </div>
    </div>

    <!-- iframe 嵌入 -->
    <div v-else class="relative flex-1 overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm">
      <!-- 在新标签打开按钮 -->
      <a
        :href="embeddedUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-900/80 px-4 py-2 text-sm font-bold text-slate-300 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        <span>在新标签打开</span>
      </a>

      <!-- iframe -->
      <iframe
        :src="embeddedUrl"
        class="h-full w-full rounded-xl"
        allowfullscreen
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
      ></iframe>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const loading = ref(false)
const pageTheme = ref<'light' | 'dark'>('dark')
let themeObserver: MutationObserver | null = null

const menuItemId = computed(() => route.params.id as string)

// 这里需要从配置中获取自定义菜单项
// 暂时返回 null，实际需要从 store 或 API 获取
const menuItem = computed(() => {
  // TODO: 从 appStore.cachedPublicSettings?.custom_menu_items 获取
  return null
})

const embeddedUrl = computed(() => {
  if (!menuItem.value) return ''

  // 构建嵌入URL，可以传递用户信息和主题
  let url = menuItem.value.url || ''

  // 添加查询参数
  const params = new URLSearchParams()
  if (authStore.user?.id) params.set('user_id', String(authStore.user.id))
  if (authStore.token) params.set('token', authStore.token)
  params.set('theme', pageTheme.value)

  const separator = url.includes('?') ? '&' : '?'
  return url + separator + params.toString()
})

const isValidUrl = computed(() => {
  const url = menuItem.value?.url || ''
  return url.startsWith('http://') || url.startsWith('https://')
})

function detectTheme(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'dark'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

onMounted(async () => {
  pageTheme.value = detectTheme()

  if (typeof document !== 'undefined') {
    themeObserver = new MutationObserver(() => {
      pageTheme.value = detectTheme()
    })
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
  }

  // TODO: 加载自定义菜单配置
  // loading.value = true
  // try {
  //   await appStore.fetchPublicSettings()
  // } finally {
  //   loading.value = false
  // }
})

onUnmounted(() => {
  if (themeObserver) {
    themeObserver.disconnect()
    themeObserver = null
  }
})
</script>
