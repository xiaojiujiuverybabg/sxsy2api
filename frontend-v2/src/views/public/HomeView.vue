<template>
  <section class="surface-grid min-h-screen w-full overflow-hidden text-text-primary">
    <!-- Header -->
    <header class="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-brand-500/10 bg-surface-page/60 px-6 py-4 backdrop-blur-xl">
      <div class="flex items-center gap-4">
        <div class="relative grid h-10 w-10 place-items-center rounded-xl bg-brand-500/20 shadow-[0_0_15px_rgba(220,38,38,0.4)] border border-brand-500/30">
          <span class="text-sm font-black text-brand-400">S2</span>
          <div class="absolute inset-0 rounded-xl bg-brand-500 opacity-20 blur-md"></div>
        </div>
        <div>
          <h1 class="text-lg font-black tracking-widest text-white">sxsy2Api</h1>
          <p class="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-gold-400">智御中枢</p>
        </div>
      </div>
      <RouterLink to="/login" class="group relative overflow-hidden rounded-full border border-brand-500/50 bg-surface-card px-6 py-2 text-sm font-bold text-white transition hover:border-brand-400 hover:shadow-[0_0_20px_rgba(220,38,38,0.3)]">
        <span class="relative z-10 flex items-center gap-2">
          进入系统 <span class="text-brand-400 group-hover:translate-x-1 transition-transform">→</span>
        </span>
        <div class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-brand-500/20 to-transparent transition-transform duration-500 group-hover:translate-x-full"></div>
      </RouterLink>
    </header>

    <!-- Main Content -->
    <main class="relative z-10 mx-auto max-w-7xl px-6 pt-32 pb-16">
      <div class="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center min-h-[calc(100vh-12rem)]">

        <!-- Left Hero Section -->
        <div class="flex flex-col gap-8">
          <div class="inline-flex items-center gap-3 self-start rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-2 backdrop-blur-md">
            <span class="relative flex h-2.5 w-2.5">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75"></span>
              <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-500"></span>
            </span>
            <span class="text-xs font-bold uppercase tracking-widest text-brand-300">系统在线 · v2.0</span>
          </div>

          <h2 class="text-5xl font-black leading-tight tracking-tight text-white md:text-6xl lg:text-7xl">
            智能 <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-gold-400">API</span>
            <br />调度中枢
          </h2>

          <p class="max-w-xl text-lg leading-relaxed text-text-secondary">
            全新一代 API 管理平台。通过可视化控制台实现密钥分配、用量监测、渠道调度的毫秒级管理，重塑数据交互体验。
          </p>

          <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 mt-4">
            <div class="group relative overflow-hidden rounded-2xl border border-white/5 bg-surface-card/40 p-5 backdrop-blur-md transition hover:border-brand-500/30">
              <div class="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-brand-500/10 blur-xl transition group-hover:bg-brand-500/20"></div>
              <p class="text-2xl font-black text-white">99.9%</p>
              <p class="mt-1 text-xs font-bold uppercase tracking-wider text-text-muted">可用率</p>
            </div>
            <div class="group relative overflow-hidden rounded-2xl border border-white/5 bg-surface-card/40 p-5 backdrop-blur-md transition hover:border-gold-500/30">
              <div class="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gold-500/10 blur-xl transition group-hover:bg-gold-500/20"></div>
              <p class="text-2xl font-black text-white">&lt; 10ms</p>
              <p class="mt-1 text-xs font-bold uppercase tracking-wider text-text-muted">响应延迟</p>
            </div>
            <div class="group relative overflow-hidden rounded-2xl border border-white/5 bg-surface-card/40 p-5 backdrop-blur-md transition hover:border-success-500/30">
              <div class="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-success-500/10 blur-xl transition group-hover:bg-success-500/20"></div>
              <p class="text-2xl font-black text-white">∞</p>
              <p class="mt-1 text-xs font-bold uppercase tracking-wider text-text-muted">弹性扩展</p>
            </div>
          </div>
        </div>

        <!-- Right Visual Section -->
        <div class="flex flex-col gap-5 w-full max-w-lg mx-auto lg:max-w-none">
          <!-- Card 1: Core Capabilities -->
          <div class="relative overflow-hidden rounded-2xl border border-brand-500/20 bg-surface-card/60 p-6 shadow-[0_0_30px_rgba(220,38,38,0.08)] backdrop-blur-xl transition hover:border-brand-500/40 hover:shadow-[0_0_40px_rgba(220,38,38,0.15)]">
            <div class="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-500/10 blur-2xl"></div>
            <div class="flex items-center justify-between mb-5">
              <div class="flex items-center gap-3">
                <div class="h-9 w-9 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center shadow-[0_0_10px_rgba(220,38,38,0.3)]">
                  <svg class="h-4 w-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div>
                  <p class="text-sm font-bold text-white">核心能力</p>
                  <p class="text-[0.65rem] text-text-muted">平台能力</p>
                </div>
              </div>
              <span class="text-xs font-mono text-brand-400/70">v2.0</span>
            </div>
            <div class="grid gap-3">
              <div class="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-3 transition hover:bg-white/10">
                <div class="h-2 w-2 rounded-full bg-brand-400 shadow-[0_0_6px_rgba(220,38,38,0.8)]"></div>
                <div class="flex-1">
                  <p class="text-sm font-bold text-white">多渠道智能路由</p>
                  <p class="text-[0.65rem] text-text-muted">自动负载均衡与故障转移</p>
                </div>
              </div>
              <div class="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-3 transition hover:bg-white/10">
                <div class="h-2 w-2 rounded-full bg-gold-400 shadow-[0_0_6px_rgba(212,160,23,0.8)]"></div>
                <div class="flex-1">
                  <p class="text-sm font-bold text-white">密钥权限管理</p>
                  <p class="text-[0.65rem] text-text-muted">细粒度访问控制与额度分配</p>
                </div>
              </div>
              <div class="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-3 transition hover:bg-white/10">
                <div class="h-2 w-2 rounded-full bg-success-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]"></div>
                <div class="flex-1">
                  <p class="text-sm font-bold text-white">实时用量监控</p>
                  <p class="text-[0.65rem] text-text-muted">Token 消耗与调用趋势可视化</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 2: Supported Models -->
          <div class="relative overflow-hidden rounded-2xl border border-gold-500/20 bg-surface-card/60 p-6 shadow-[0_0_30px_rgba(212,160,23,0.08)] backdrop-blur-xl transition hover:border-gold-500/40 hover:shadow-[0_0_40px_rgba(212,160,23,0.15)]">
            <div class="absolute -left-8 -bottom-8 h-24 w-24 rounded-full bg-gold-500/10 blur-2xl"></div>
            <div class="flex items-center justify-between mb-5">
              <div class="flex items-center gap-3">
                <div class="h-9 w-9 rounded-lg bg-gold-500/20 border border-gold-500/30 flex items-center justify-center shadow-[0_0_10px_rgba(212,160,23,0.3)]">
                  <svg class="h-4 w-4 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <p class="text-sm font-bold text-white">模型矩阵</p>
                  <p class="text-[0.65rem] text-text-muted">支持模型</p>
                </div>
              </div>
              <span class="rounded-full border border-success-500/30 bg-success-500/10 px-2 py-0.5 text-[0.6rem] font-bold text-success-400">全部在线</span>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div v-for="model in modelList" :key="model.name" class="group rounded-xl border border-white/5 bg-white/5 p-3 transition hover:bg-white/10 hover:border-gold-500/20">
                <p class="text-sm font-bold text-white group-hover:text-gold-300 transition-colors">{{ model.name }}</p>
                <p class="text-[0.6rem] text-text-muted mt-1">{{ model.desc }}</p>
                <div class="mt-2 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-500" :class="model.barClass" :style="{ width: model.load }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

const modelList = [
  { name: 'GPT-5', desc: '多模态旗舰', load: '82%', barClass: 'bg-brand-500 shadow-[0_0_6px_rgba(220,38,38,0.6)]' },
  { name: 'Claude 4', desc: '长文本推理', load: '76%', barClass: 'bg-gold-500 shadow-[0_0_6px_rgba(212,160,23,0.6)]' },
  { name: 'Gemini Pro', desc: '高效推理', load: '58%', barClass: 'bg-success-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]' },
  { name: 'DeepSeek', desc: '代码与数学', load: '65%', barClass: 'bg-brand-400 shadow-[0_0_6px_rgba(248,113,113,0.6)]' },
]
</script>
