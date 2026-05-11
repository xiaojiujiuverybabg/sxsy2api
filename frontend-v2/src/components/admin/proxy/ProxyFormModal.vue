<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Proxy } from '@/types'

const props = defineProps<{
  show: boolean
  editProxy?: Proxy | null
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', data: Record<string, unknown>, isEdit: boolean): void
  (e: 'batchCreate', proxies: Record<string, unknown>[]): void
}>()

const isEdit = ref(false)
const mode = ref<'standard' | 'batch'>('standard')
const batchText = ref('')
const batchError = ref('')

const form = ref({
  name: '',
  protocol: 'http' as string,
  host: '',
  port: 1080,
  username: '',
  password: '',
  status: 'active' as string,
})

const showPassword = ref(false)
const passwordDirty = ref(false)

watch(() => props.show, (val) => {
  if (!val) return
  batchText.value = ''
  batchError.value = ''
  passwordDirty.value = false
  showPassword.value = false
  if (props.editProxy) {
    isEdit.value = true
    mode.value = 'standard'
    const p = props.editProxy
    form.value = {
      name: p.name,
      protocol: p.protocol,
      host: p.host,
      port: p.port,
      username: p.username || '',
      password: '',
      status: p.status,
    }
  } else {
    isEdit.value = false
    mode.value = 'standard'
    form.value = { name: '', protocol: 'http', host: '', port: 1080, username: '', password: '', status: 'active' }
  }
})

const batchParsed = computed(() => {
  if (!batchText.value.trim()) return { valid: [], invalid: 0, duplicate: 0 }
  const lines = batchText.value.trim().split('\n').filter(l => l.trim())
  const seen = new Set<string>()
  const valid: Record<string, unknown>[] = []
  let invalid = 0
  let duplicate = 0

  for (const line of lines) {
    const m = line.trim().match(/^(https?|socks5h?):\/\/(?:([^:@]+):([^@]+)@)?([^:]+):(\d+)$/)
    if (!m) { invalid++; continue }
    const [, protocol, user, pass, host, port] = m
    const key = `${host}:${port}:${user || ''}:${pass || ''}`
    if (seen.has(key)) { duplicate++; continue }
    seen.add(key)
    valid.push({
      name: `${host}:${port}`,
      protocol,
      host,
      port: parseInt(port),
      username: user || null,
      password: pass || null,
    })
  }
  return { valid, invalid, duplicate }
})

function handleSubmit() {
  const payload: Record<string, unknown> = {
    name: form.value.name,
    protocol: form.value.protocol,
    host: form.value.host,
    port: form.value.port,
    username: form.value.username || null,
  }
  if (passwordDirty.value || (!isEdit.value && form.value.password)) {
    payload.password = form.value.password || null
  }
  if (isEdit.value) {
    payload.status = form.value.status
  }
  emit('submit', payload, isEdit.value)
}

function handleBatchSubmit() {
  if (batchParsed.value.valid.length === 0) {
    batchError.value = '没有有效的代理地址'
    return
  }
  batchError.value = ''
  emit('batchCreate', batchParsed.value.valid)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="show" class="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm" @click.self="emit('close')">
        <aside class="ml-auto flex h-full w-full max-w-2xl flex-col border-l border-white/10 bg-[#080b14] shadow-2xl">
          <header class="flex-shrink-0 flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
            <div>
              <p class="text-xs font-bold uppercase tracking-widest text-violet-400">{{ isEdit ? '编辑代理' : '新建代理' }}</p>
              <h2 class="mt-1 text-2xl font-black text-white">{{ isEdit ? (form.name || '编辑代理') : '创建代理' }}</h2>
            </div>
            <button class="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-slate-400 transition hover:border-violet-500 hover:text-violet-300" @click="emit('close')">关闭</button>
          </header>

          <div class="flex-1 overflow-y-auto bg-[#080b14] p-6">
            <!-- Mode tabs (create only) -->
            <div v-if="!isEdit" class="flex gap-2 mb-5">
              <button :class="['rounded-lg px-3 py-1.5 text-xs font-bold transition', mode === 'standard' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'bg-white/[0.04] text-slate-400 border border-white/5']" @click="mode = 'standard'">标准添加</button>
              <button :class="['rounded-lg px-3 py-1.5 text-xs font-bold transition', mode === 'batch' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'bg-white/[0.04] text-slate-400 border border-white/5']" @click="mode = 'batch'">批量添加</button>
            </div>

            <!-- Standard form -->
            <form v-if="mode === 'standard'" class="space-y-5" @submit.prevent="handleSubmit">
              <div class="rounded-xl border border-white/10 bg-[#0a0e18] p-4">
                <h3 class="mb-4 text-sm font-bold text-white">基本信息</h3>
                <div class="grid gap-4 md:grid-cols-2">
                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-slate-400">名称 <span class="text-red-400">*</span></label>
                    <input v-model="form.name" type="text" required placeholder="代理名称" class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white placeholder-slate-500 transition focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
                  </div>
                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-slate-400">协议</label>
                    <select v-model="form.protocol" class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white transition focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20">
                      <option value="http">HTTP</option>
                      <option value="https">HTTPS</option>
                      <option value="socks5">SOCKS5</option>
                      <option value="socks5h">SOCKS5H</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="rounded-xl border border-white/10 bg-[#0a0e18] p-4">
                <h3 class="mb-4 text-sm font-bold text-white">连接信息</h3>
                <div class="grid gap-4 md:grid-cols-2">
                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-slate-400">主机 <span class="text-red-400">*</span></label>
                    <input v-model="form.host" type="text" required placeholder="IP 或域名" class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white placeholder-slate-500 transition focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
                  </div>
                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-slate-400">端口 <span class="text-red-400">*</span></label>
                    <input v-model.number="form.port" type="number" min="1" max="65535" required class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white transition focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
                  </div>
                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-slate-400">用户名</label>
                    <input v-model="form.username" type="text" placeholder="可选" class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white placeholder-slate-500 transition focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
                  </div>
                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-slate-400">密码</label>
                    <div class="relative">
                      <input v-model="form.password" :type="showPassword ? 'text' : 'password'" :placeholder="isEdit ? '留空不修改' : '可选'" class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 pr-9 text-sm text-white placeholder-slate-500 transition focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20" @input="passwordDirty = true" />
                      <button type="button" class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition" @click="showPassword = !showPassword">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4"><path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" /><path fill-rule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="isEdit" class="rounded-xl border border-white/10 bg-[#0a0e18] p-4">
                <label class="mb-1.5 block text-xs font-medium text-slate-400">状态</label>
                <select v-model="form.status" class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white transition focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20">
                  <option value="active">活跃</option>
                  <option value="inactive">未激活</option>
                </select>
              </div>
            </form>

            <!-- Batch mode -->
            <div v-else class="space-y-4">
              <div class="rounded-xl border border-white/10 bg-[#0a0e18] p-4">
                <h3 class="mb-2 text-sm font-bold text-white">批量添加代理</h3>
                <p class="mb-3 text-[11px] text-slate-500">每行一个代理地址，格式：<code class="text-violet-400">protocol://user:pass@host:port</code> 或 <code class="text-violet-400">protocol://host:port</code></p>
                <textarea
                  v-model="batchText"
                  rows="8"
                  placeholder="socks5://user:pass@1.2.3.4:1080
http://5.6.7.8:3128
https://user:pass@9.10.11.12:443"
                  class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white placeholder-slate-600 font-mono transition focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                ></textarea>
                <div v-if="batchText.trim()" class="flex gap-3 text-[11px] mt-2">
                  <span class="text-emerald-400">{{ batchParsed.valid.length }} 有效</span>
                  <span v-if="batchParsed.invalid" class="text-red-400">{{ batchParsed.invalid }} 无效</span>
                  <span v-if="batchParsed.duplicate" class="text-amber-400">{{ batchParsed.duplicate }} 重复</span>
                </div>
                <p v-if="batchError" class="mt-2 text-[11px] text-red-400">{{ batchError }}</p>
              </div>
            </div>
          </div>

          <footer class="flex-shrink-0 flex items-center justify-end gap-3 border-t border-white/10 px-6 py-4">
            <button type="button" class="rounded-full border border-white/10 px-5 py-2.5 text-sm font-bold text-slate-400 transition hover:border-violet-500 hover:text-violet-300" @click="emit('close')">取消</button>
            <button
              v-if="mode === 'standard'"
              :disabled="loading || !form.name || !form.host || !form.port"
              class="rounded-full bg-gradient-to-r from-violet-500 to-violet-600 px-6 py-2.5 text-sm font-black text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-600 hover:to-violet-700 disabled:opacity-50"
              @click="handleSubmit"
            >{{ loading ? '提交中...' : (isEdit ? '保存' : '创建') }}</button>
            <button
              v-else
              :disabled="loading || batchParsed.valid.length === 0"
              class="rounded-full bg-gradient-to-r from-violet-500 to-violet-600 px-6 py-2.5 text-sm font-black text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-600 hover:to-violet-700 disabled:opacity-50"
              @click="handleBatchSubmit"
            >批量创建 ({{ batchParsed.valid.length }})</button>
          </footer>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-enter-active, .drawer-leave-active { transition: all 0.25s ease; }
.drawer-enter-active aside, .drawer-leave-active aside { transition: transform 0.25s ease; }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }
.drawer-enter-from aside, .drawer-leave-to aside { transform: translateX(100%); }
</style>
