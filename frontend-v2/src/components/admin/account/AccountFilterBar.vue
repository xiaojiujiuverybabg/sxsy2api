<script setup lang="ts">
defineProps<{
  searchQuery: string
  platformFilter: string
  typeFilter: string
  statusFilter: string
  groupFilter: string
  groups: Array<{ id: number; name: string }>
  viewMode: 'grid' | 'table'
}>()

const emit = defineEmits<{
  (e: 'update:searchQuery', v: string): void
  (e: 'update:platformFilter', v: string): void
  (e: 'update:typeFilter', v: string): void
  (e: 'update:statusFilter', v: string): void
  (e: 'update:groupFilter', v: string): void
  (e: 'update:viewMode', v: 'grid' | 'table'): void
  (e: 'search'): void
}>()
</script>

<template>
  <section class="rounded-[28px] border border-white/10 bg-white/[0.035] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
    <div class="flex flex-col gap-3">
      <!-- Search row -->
      <div class="flex flex-wrap items-center gap-3">
        <div class="relative flex-1 min-w-[200px]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500">
            <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
          </svg>
          <input
            :value="searchQuery"
            type="text"
            placeholder="搜索账号名称..."
            class="w-full rounded-xl border border-white/10 bg-white/[0.06] py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
            @keyup.enter="emit('search')"
          />
        </div>

        <!-- View toggle -->
        <div class="flex rounded-xl border border-white/10 bg-white/[0.04] p-0.5">
          <button
            :class="[
              'rounded-lg px-3 py-1.5 text-xs font-bold transition',
              viewMode === 'grid' ? 'bg-brand-500/20 text-brand-400' : 'text-slate-400 hover:text-white'
            ]"
            @click="emit('update:viewMode', 'grid')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="inline h-3.5 w-3.5 mr-1 -mt-0.5"><path d="M3.25 4A2.25 2.25 0 015.5 1.75h2.25a.75.75 0 01.75.75v5a.75.75 0 01-.75.75H5.5A2.25 2.25 0 013.25 6V4zM3.25 11A2.25 2.25 0 015.5 8.75h2.25a.75.75 0 01.75.75v5a.75.75 0 01-.75.75H5.5A2.25 2.25 0 013.25 13v-2zM11.5 1.75a.75.75 0 00-.75.75v5c0 .414.336.75.75.75h2.25A2.25 2.25 0 0016 6V4a2.25 2.25 0 00-2.25-2.25h-2.25zM11.5 8.75a.75.75 0 00-.75.75v5c0 .414.336.75.75.75h2.25A2.25 2.25 0 0016 13v-2a2.25 2.25 0 00-2.25-2.25h-2.25z" /></svg>
            卡片
          </button>
          <button
            :class="[
              'rounded-lg px-3 py-1.5 text-xs font-bold transition',
              viewMode === 'table' ? 'bg-brand-500/20 text-brand-400' : 'text-slate-400 hover:text-white'
            ]"
            @click="emit('update:viewMode', 'table')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="inline h-3.5 w-3.5 mr-1 -mt-0.5"><path fill-rule="evenodd" d="M.99 5.24A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25l.01 9.5A2.25 2.25 0 0116.76 17H3.26A2.267 2.267 0 011 14.74l-.01-9.5zm8.26 9.52v-5.5h-6v5.5h6zm1.5 0h6v-5.5h-6v5.5zm6-7h-6v-5.5h4.74c.7 0 1.26.56 1.26 1.25v4.25zm-7.5-5.5v5.5h-6v-4.25c0-.69.56-1.25 1.26-1.25h4.74z" clip-rule="evenodd" /></svg>
            列表
          </button>
        </div>
      </div>

      <!-- Filters row -->
      <div class="flex flex-wrap items-center gap-2">
        <select
          :value="platformFilter"
          class="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          @change="emit('update:platformFilter', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">全部平台</option>
          <option value="anthropic">Anthropic</option>
          <option value="openai">OpenAI</option>
          <option value="gemini">Gemini</option>
          <option value="antigravity">Antigravity</option>
        </select>

        <select
          :value="typeFilter"
          class="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          @change="emit('update:typeFilter', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">全部类型</option>
          <option value="oauth">OAuth</option>
          <option value="setup-token">Setup Token</option>
          <option value="apikey">API Key</option>
          <option value="upstream">Upstream</option>
          <option value="bedrock">Bedrock</option>
        </select>

        <select
          :value="statusFilter"
          class="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          @change="emit('update:statusFilter', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">全部状态</option>
          <option value="active">活跃</option>
          <option value="inactive">未激活</option>
          <option value="error">异常</option>
        </select>

        <select
          :value="groupFilter"
          class="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          @change="emit('update:groupFilter', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">全部分组</option>
          <option v-for="g in groups" :key="g.id" :value="String(g.id)">{{ g.name }}</option>
        </select>
      </div>
    </div>
  </section>
</template>
