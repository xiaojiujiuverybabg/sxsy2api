<script setup lang="ts">
defineProps<{
  searchQuery: string
  protocolFilter: string
  statusFilter: string
  viewMode: 'grid' | 'table'
  selectedCount: number
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:searchQuery', v: string): void
  (e: 'update:protocolFilter', v: string): void
  (e: 'update:statusFilter', v: string): void
  (e: 'update:viewMode', v: 'grid' | 'table'): void
  (e: 'search'): void
  (e: 'create'): void
  (e: 'batchTest'): void
  (e: 'batchQuality'): void
  (e: 'batchDelete'): void
  (e: 'import'): void
  (e: 'export'): void
}>()
</script>

<template>
  <section class="rounded-[28px] border border-white/10 bg-white/[0.035] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
    <div class="flex flex-col gap-3">
      <!-- Search + view toggle -->
      <div class="flex flex-wrap items-center gap-3">
        <div class="relative flex-1 min-w-[200px]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500">
            <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
          </svg>
          <input
            :value="searchQuery"
            type="text"
            placeholder="搜索代理名称、主机或 IP..."
            class="w-full rounded-xl border border-white/10 bg-white/[0.06] py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
            @keyup.enter="emit('search')"
          />
        </div>
        <div class="flex rounded-xl border border-white/10 bg-white/[0.04] p-0.5">
          <button :class="['rounded-lg px-3 py-1.5 text-xs font-bold transition', viewMode === 'grid' ? 'bg-violet-500/20 text-violet-400' : 'text-slate-400 hover:text-white']" @click="emit('update:viewMode', 'grid')">卡片</button>
          <button :class="['rounded-lg px-3 py-1.5 text-xs font-bold transition', viewMode === 'table' ? 'bg-violet-500/20 text-violet-400' : 'text-slate-400 hover:text-white']" @click="emit('update:viewMode', 'table')">列表</button>
        </div>
      </div>

      <!-- Filters + Actions -->
      <div class="flex flex-wrap items-center gap-2">
        <select
          :value="protocolFilter"
          class="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          @change="emit('update:protocolFilter', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">全部协议</option>
          <option value="http">HTTP</option>
          <option value="https">HTTPS</option>
          <option value="socks5">SOCKS5</option>
          <option value="socks5h">SOCKS5H</option>
        </select>
        <select
          :value="statusFilter"
          class="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          @change="emit('update:statusFilter', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">全部状态</option>
          <option value="active">活跃</option>
          <option value="inactive">未激活</option>
        </select>

        <span class="text-slate-600 mx-1">|</span>

        <button class="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-bold text-slate-400 transition hover:border-violet-500/30 hover:text-violet-400" @click="emit('create')">+ 创建</button>
        <button :disabled="loading" class="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-bold text-slate-400 transition hover:border-emerald-500/30 hover:text-emerald-400 disabled:opacity-50" @click="emit('batchTest')">批量测试</button>
        <button :disabled="loading" class="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-bold text-slate-400 transition hover:border-amber-500/30 hover:text-amber-400 disabled:opacity-50" @click="emit('batchQuality')">质量检查</button>
        <button :disabled="loading" class="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-bold text-slate-400 transition hover:border-blue-500/30 hover:text-blue-400 disabled:opacity-50" @click="emit('import')">导入</button>
        <button :disabled="loading" class="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-bold text-slate-400 transition hover:border-amber-500/30 hover:text-amber-400 disabled:opacity-50" @click="emit('export')">导出</button>
        <button
          v-if="selectedCount > 0"
          class="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-[11px] font-bold text-red-400 transition hover:border-red-500/40 hover:bg-red-500/20"
          @click="emit('batchDelete')"
        >删除所选 ({{ selectedCount }})</button>
      </div>
    </div>
  </section>
</template>
