<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Announcement, AdminGroup, AnnouncementTargeting, AnnouncementCondition, AnnouncementConditionGroup } from '@/types'
import DateTimePicker from '@/components/ui/DateTimePicker.vue'

const props = defineProps<{
  show: boolean
  editAnnouncement?: Announcement | null
  groups: AdminGroup[]
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', data: Record<string, unknown>, isEdit: boolean): void
}>()

const isEdit = ref(false)
const targetingMode = ref<'all' | 'custom'>('all')
const orGroups = ref<{ conditions: AnnouncementCondition[] }[]>([])
const showAdvanced = ref(false)

const form = ref({
  title: '',
  content: '',
  status: 'draft' as string,
  notify_mode: 'silent' as string,
  starts_at: '',
  ends_at: '',
})

const operatorLabels: Record<string, string> = {
  gt: '>', gte: '>=', lt: '<', lte: '<=', eq: '=',
}

watch(() => props.show, (val) => {
  if (!val) return
  if (props.editAnnouncement) {
    isEdit.value = true
    const a = props.editAnnouncement
    form.value = {
      title: a.title,
      content: a.content,
      status: a.status,
      notify_mode: a.notify_mode,
      starts_at: a.starts_at ? new Date(a.starts_at).toISOString().slice(0, 16) : '',
      ends_at: a.ends_at ? new Date(a.ends_at).toISOString().slice(0, 16) : '',
    }
    // Parse targeting
    const t = a.targeting
    if (t && t.any_of && t.any_of.length > 0) {
      targetingMode.value = 'custom'
      orGroups.value = t.any_of.map(g => ({
        conditions: (g.all_of || []).map(c => ({ ...c }))
      }))
    } else {
      targetingMode.value = 'all'
      orGroups.value = []
    }
    showAdvanced.value = false
  } else {
    isEdit.value = false
    targetingMode.value = 'all'
    orGroups.value = []
    showAdvanced.value = false
    form.value = { title: '', content: '', status: 'draft', notify_mode: 'silent', starts_at: '', ends_at: '' }
  }
})

function addOrGroup() {
  if (orGroups.value.length >= 50) return
  orGroups.value.push({ conditions: [] })
}

function removeOrGroup(i: number) {
  orGroups.value.splice(i, 1)
  if (orGroups.value.length === 0) targetingMode.value = 'all'
}

function addCondition(gi: number) {
  if (orGroups.value[gi].conditions.length >= 50) return
  orGroups.value[gi].conditions.push({ type: 'subscription', operator: 'in', group_ids: [] })
}

function removeCondition(gi: number, ci: number) {
  orGroups.value[gi].conditions.splice(ci, 1)
}

function toggleGroupInCondition(gi: number, ci: number, gid: number) {
  const cond = orGroups.value[gi].conditions[ci]
  if (!cond.group_ids) cond.group_ids = []
  const idx = cond.group_ids.indexOf(gid)
  if (idx >= 0) cond.group_ids.splice(idx, 1)
  else cond.group_ids.push(gid)
}

function buildTargeting(): AnnouncementTargeting {
  if (targetingMode.value === 'all' || orGroups.value.length === 0) {
    return { any_of: [] }
  }
  const groups: AnnouncementConditionGroup[] = orGroups.value
    .filter(g => g.conditions.length > 0)
    .map(g => ({
      all_of: g.conditions
    }))
  return { any_of: groups.length > 0 ? groups : [] }
}

const targetingSummary = computed(() => {
  if (targetingMode.value === 'all' || orGroups.value.length === 0) return '全部用户'
  const count = orGroups.value.filter(g => g.conditions.length > 0).length
  return `自定义规则 (${count} 组)`
})

function handleSubmit() {
  const targeting = buildTargeting()
  const payload: Record<string, unknown> = {
    title: form.value.title,
    content: form.value.content,
    status: form.value.status,
    notify_mode: form.value.notify_mode,
    targeting,
  }
  if (form.value.starts_at) {
    payload.starts_at = Math.floor(new Date(form.value.starts_at).getTime() / 1000)
  }
  if (form.value.ends_at) {
    payload.ends_at = Math.floor(new Date(form.value.ends_at).getTime() / 1000)
  }
  emit('submit', payload, isEdit.value)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div
        v-if="show"
        class="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm"
        @click.self="emit('close')"
      >
        <aside class="ml-auto flex h-full w-full max-w-2xl flex-col border-l border-white/10 bg-[#080b14] shadow-2xl">
          <!-- Header -->
          <header class="flex-shrink-0 flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
            <div>
              <p class="text-xs font-bold uppercase tracking-widest text-amber-400">
                {{ isEdit ? '编辑公告' : '新建公告' }}
              </p>
              <h2 class="mt-1 text-2xl font-black text-white">
                {{ isEdit ? (form.title || '编辑公告') : '创建公告' }}
              </h2>
            </div>
            <button
              class="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-slate-400 transition hover:border-amber-500 hover:text-amber-300"
              @click="emit('close')"
            >
              关闭
            </button>
          </header>

          <!-- Form -->
          <form class="flex-1 overflow-y-auto bg-[#080b14] p-6" @submit.prevent="handleSubmit">
            <div class="space-y-5">
              <!-- Title -->
              <div class="rounded-xl border border-white/10 bg-[#0a0e18] p-4">
                <label class="mb-1.5 block text-xs font-medium text-slate-400">标题 <span class="text-red-400">*</span></label>
                <input
                  v-model="form.title"
                  type="text"
                  required
                  placeholder="公告标题"
                  class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white placeholder-slate-500 transition focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <!-- Content -->
              <div class="rounded-xl border border-white/10 bg-[#0a0e18] p-4">
                <label class="mb-1.5 block text-xs font-medium text-slate-400">内容 <span class="text-red-400">*</span></label>
                <textarea
                  v-model="form.content"
                  rows="5"
                  required
                  placeholder="公告内容（支持 Markdown）"
                  class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white placeholder-slate-500 transition focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                ></textarea>
              </div>

              <!-- Status & Notify Mode -->
              <div class="rounded-xl border border-white/10 bg-[#0a0e18] p-4">
                <h3 class="mb-4 text-sm font-bold text-white">发布设置</h3>
                <div class="grid gap-4 md:grid-cols-2">
                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-slate-400">状态</label>
                    <select
                      v-model="form.status"
                      class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white transition focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    >
                      <option value="draft">草稿</option>
                      <option value="active">展示中</option>
                      <option value="archived">已归档</option>
                    </select>
                  </div>
                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-slate-400">通知方式</label>
                    <select
                      v-model="form.notify_mode"
                      class="w-full rounded-lg border border-white/10 bg-[#0d1117]/80 px-3 py-2 text-sm text-white transition focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    >
                      <option value="silent">静默（仅列表展示）</option>
                      <option value="popup">弹窗（强制弹出通知）</option>
                    </select>
                    <p v-if="form.notify_mode === 'popup'" class="mt-1.5 text-[11px] text-amber-400/70">
                      弹窗模式会在用户下次访问时自动弹出公告窗口
                    </p>
                  </div>
                </div>
              </div>

              <!-- Time Range -->
              <div class="rounded-xl border border-white/10 bg-[#0a0e18] p-4">
                <h3 class="mb-4 text-sm font-bold text-white">时间范围</h3>
                <div class="grid gap-4 md:grid-cols-2">
                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-slate-400">开始时间</label>
                    <DateTimePicker v-model="form.starts_at" placeholder="留空表示立即生效" />
                    <p class="mt-1 text-[10px] text-slate-600">留空表示立即生效</p>
                  </div>
                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-slate-400">结束时间</label>
                    <DateTimePicker v-model="form.ends_at" placeholder="留空表示永不过期" />
                    <p class="mt-1 text-[10px] text-slate-600">留空表示永不过期</p>
                  </div>
                </div>
              </div>

              <!-- Targeting -->
              <div class="rounded-xl border border-white/10 bg-[#0a0e18] p-4">
                <button
                  type="button"
                  class="flex w-full items-center justify-between text-sm font-bold text-white"
                  @click="showAdvanced = !showAdvanced"
                >
                  <div class="flex items-center gap-2">
                    <span>展示条件</span>
                    <span class="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-slate-400">{{ targetingSummary }}</span>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                    :class="['h-4 w-4 text-slate-400 transition', showAdvanced ? 'rotate-180' : '']"
                  >
                    <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
                  </svg>
                </button>

                <div v-if="showAdvanced" class="mt-4 space-y-4 border-t border-white/[0.06] pt-4">
                  <!-- Mode toggle -->
                  <div class="flex gap-2">
                    <button
                      type="button"
                      :class="[
                        'rounded-lg px-3 py-1.5 text-xs font-bold transition',
                        targetingMode === 'all'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-white/[0.04] text-slate-400 border border-white/5'
                      ]"
                      @click="targetingMode = 'all'"
                    >全部用户</button>
                    <button
                      type="button"
                      :class="[
                        'rounded-lg px-3 py-1.5 text-xs font-bold transition',
                        targetingMode === 'custom'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-white/[0.04] text-slate-400 border border-white/5'
                      ]"
                      @click="targetingMode = 'custom'; if (!orGroups.length) addOrGroup()"
                    >自定义条件</button>
                  </div>

                  <!-- Custom conditions -->
                  <template v-if="targetingMode === 'custom'">
                    <p class="text-[10px] text-slate-500">
                      满足任意一组（OR）中的所有条件（AND）的用户可以看到公告。最多 50 组，每组最多 50 个条件。
                    </p>

                    <div v-for="(group, gi) in orGroups" :key="gi" class="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 space-y-2">
                      <div class="flex items-center justify-between">
                        <span class="text-[11px] font-bold text-slate-400">条件组 #{{ gi + 1 }}</span>
                        <button
                          type="button"
                          class="text-[10px] text-red-400/60 hover:text-red-400 transition"
                          @click="removeOrGroup(gi)"
                        >删除组</button>
                      </div>

                      <div v-for="(cond, ci) in group.conditions" :key="ci" class="flex items-center gap-2 rounded-md bg-white/[0.03] p-2">
                        <!-- Condition type -->
                        <select
                          v-model="cond.type"
                          class="shrink-0 rounded border border-white/10 bg-[#0d1117] px-2 py-1 text-[11px] text-white"
                        >
                          <option value="subscription">订阅</option>
                          <option value="balance">余额</option>
                        </select>

                        <!-- Subscription: multi-select groups -->
                        <template v-if="cond.type === 'subscription'">
                          <div class="flex flex-wrap gap-1 flex-1">
                            <button
                              v-for="g in props.groups"
                              :key="g.id"
                              type="button"
                              :class="[
                                'rounded px-1.5 py-0.5 text-[10px] transition',
                                (cond.group_ids || []).includes(g.id)
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-white/[0.04] text-slate-500 border border-white/5'
                              ]"
                              @click="toggleGroupInCondition(gi, ci, g.id)"
                            >
                              {{ g.name }}
                            </button>
                            <span v-if="!props.groups.length" class="text-[10px] text-slate-600">无可用分组</span>
                          </div>
                        </template>

                        <!-- Balance: operator + value -->
                        <template v-else>
                          <select
                            v-model="cond.operator"
                            class="shrink-0 rounded border border-white/10 bg-[#0d1117] px-2 py-1 text-[11px] text-white"
                          >
                            <option value="gt">&gt;</option>
                            <option value="gte">&ge;</option>
                            <option value="lt">&lt;</option>
                            <option value="lte">&le;</option>
                            <option value="eq">=</option>
                          </select>
                          <input
                            v-model.number="cond.value"
                            type="number"
                            step="0.01"
                            placeholder="金额"
                            class="w-20 rounded border border-white/10 bg-[#0d1117] px-2 py-1 text-[11px] text-white"
                          />
                        </template>

                        <button
                          type="button"
                          class="shrink-0 text-[10px] text-slate-500 hover:text-red-400 transition"
                          @click="removeCondition(gi, ci)"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-3.5 w-3.5"><path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" /></svg>
                        </button>
                      </div>

                      <button
                        v-if="group.conditions.length < 50"
                        type="button"
                        class="text-[10px] text-slate-500 hover:text-amber-400 transition"
                        @click="addCondition(gi)"
                      >+ 添加 AND 条件</button>
                    </div>

                    <button
                      v-if="orGroups.length < 50"
                      type="button"
                      class="w-full rounded-lg border border-dashed border-white/10 py-2 text-[11px] text-slate-500 hover:border-amber-500/30 hover:text-amber-400 transition"
                      @click="addOrGroup"
                    >+ 添加 OR 条件组</button>
                  </template>
                </div>
              </div>
            </div>
          </form>

          <!-- Footer -->
          <footer class="flex-shrink-0 flex items-center justify-end gap-3 border-t border-white/10 px-6 py-4">
            <button
              type="button"
              class="rounded-full border border-white/10 px-5 py-2.5 text-sm font-bold text-slate-400 transition hover:border-amber-500 hover:text-amber-300"
              @click="emit('close')"
            >取消</button>
            <button
              type="submit"
              :disabled="loading || !form.title || !form.content"
              class="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2.5 text-sm font-black text-white shadow-lg shadow-amber-500/20 transition hover:from-amber-600 hover:to-amber-700 disabled:opacity-50"
              @click="handleSubmit"
            >
              <span v-if="loading">提交中...</span>
              <span v-else>{{ isEdit ? '保存' : '创建' }}</span>
            </button>
          </footer>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: all 0.25s ease;
}
.drawer-enter-active aside,
.drawer-leave-active aside {
  transition: transform 0.25s ease;
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
.drawer-enter-from aside,
.drawer-leave-to aside {
  transform: translateX(100%);
}
</style>
