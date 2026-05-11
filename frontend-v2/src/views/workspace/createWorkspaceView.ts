import { defineComponent, h, ref, onMounted } from 'vue'
import { apiClient } from '@/api/client'

type WorkspaceMode = 'adminOps' | 'keyUsage' | string

export function createWorkspaceView(mode: WorkspaceMode) {
  return defineComponent({
    name: 'WorkspaceView',
    setup() {
      const loading = ref(true)
      const data = ref<Record<string, any> | null>(null)
      const error = ref('')

      onMounted(async () => {
        try {
          if (mode === 'keyUsage') {
            // KeyUsage: query API key usage by key
            const key = new URLSearchParams(window.location.search).get('key') || ''
            if (key) {
              const { data: res } = await apiClient.get('/v1/usage/key', { params: { key } })
              data.value = res
            }
          }
        } catch (e: any) {
          error.value = e?.response?.data?.error || e?.message || '加载失败'
        } finally {
          loading.value = false
        }
      })

      return () => {
        if (mode === 'keyUsage') {
          if (loading.value) {
            return h('div', { class: 'flex items-center justify-center min-h-screen bg-slate-950' }, [
              h('div', { class: 'text-center' }, [
                h('div', { class: 'mb-4 inline-block h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-gold-500' }),
                h('p', { class: 'text-sm text-slate-400' }, '加载中...'),
              ]),
            ])
          }
          if (error.value) {
            return h('div', { class: 'flex items-center justify-center min-h-screen bg-slate-950' }, [
              h('div', { class: 'rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center' }, [
                h('p', { class: 'text-red-400' }, error.value),
              ]),
            ])
          }
          return h('div', { class: 'min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6' }, [
            h('div', { class: 'max-w-3xl mx-auto' }, [
              h('h1', { class: 'text-2xl font-bold text-white mb-6' }, '密钥用量查询'),
              data.value ? h('pre', { class: 'rounded-xl border border-slate-700/50 bg-slate-800/40 p-6 text-sm text-slate-300 overflow-auto' }, JSON.stringify(data.value, null, 2)) : null,
            ]),
          ])
        }

        // adminOps fallback — just show a simple placeholder
        return h('div', { class: 'flex items-center justify-center min-h-screen bg-slate-950' }, [
          h('div', { class: 'text-center' }, [
            h('h2', { class: 'text-xl font-bold text-white mb-2' }, '运维监控'),
            h('p', { class: 'text-sm text-slate-400' }, '请使用新版运维监控面板'),
          ]),
        ])
      }
    },
  })
}
