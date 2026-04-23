import { defineStore } from 'pinia'
import { getPublicSettings, type PublicSettings } from '@/api/auth'

export const useAppStore = defineStore('app', {
  state: () => ({
    sidebarCollapsed: false,
    siteName: 'Sub2Api',
    toasts: [] as Array<{
      id: number
      type: 'success' | 'error' | 'warning' | 'info'
      message: string
    }>,
    cachedPublicSettings: null as PublicSettings | null,
    publicSettingsLoaded: false,
  }),
  actions: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    setSiteName(siteName: string) {
      this.siteName = siteName || 'Sub2Api'
    },
    pushToast(type: 'success' | 'error' | 'warning' | 'info', message: string) {
      const id = Date.now() + Math.floor(Math.random() * 1000)
      this.toasts.push({ id, type, message })
      window.setTimeout(() => {
        this.toasts = this.toasts.filter((toast) => toast.id !== id)
      }, 3200)
    },
    showSuccess(message: string) {
      this.pushToast('success', message)
    },
    showError(message: string) {
      this.pushToast('error', message)
    },
    showWarning(message: string) {
      this.pushToast('warning', message)
    },
    showInfo(message: string) {
      this.pushToast('info', message)
    },
    async fetchPublicSettings(force = false) {
      if (this.publicSettingsLoaded && this.cachedPublicSettings && !force) {
        return this.cachedPublicSettings
      }

      const settings = await getPublicSettings()
      this.cachedPublicSettings = settings
      this.publicSettingsLoaded = true

      if (settings.site_name) {
        this.setSiteName(settings.site_name)
      }

      return settings
    },
  },
})
