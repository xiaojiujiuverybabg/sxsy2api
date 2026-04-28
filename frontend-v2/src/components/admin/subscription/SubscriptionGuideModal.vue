<template>
  <teleport to="body">
    <transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4" @mousedown.self="$emit('close')">
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')"></div>
        <div class="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-700/50 bg-slate-900 p-6 shadow-2xl">
          <button type="button" class="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition hover:text-white" @click="$emit('close')">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 class="mb-2 text-xl font-bold text-white">订阅管理指南</h2>
          <p class="mb-6 text-sm text-slate-400">快速了解如何管理用户订阅</p>

          <!-- Step 1: 创建分组 -->
          <div class="mb-5 rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">
            <h3 class="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
              <span class="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400">1</span>
              创建订阅分组
            </h3>
            <ol class="ml-8 list-decimal space-y-1 text-sm text-slate-400">
              <li>进入分组管理页面，点击「新增分组」</li>
              <li>将订阅类型设为「subscription」</li>
              <li>设置平台、倍率、用量上限等参数</li>
            </ol>
            <div class="ml-8 mt-2">
              <a href="/admin/groups" class="inline-flex items-center gap-1 text-sm font-medium text-blue-400 transition hover:text-blue-300">
                前往分组管理 →
              </a>
            </div>
          </div>

          <!-- Step 2: 分配订阅 -->
          <div class="mb-5 rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">
            <h3 class="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
              <span class="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">2</span>
              为用户分配订阅
            </h3>
            <ol class="ml-8 list-decimal space-y-1 text-sm text-slate-400">
              <li>在本页面点击「分配订阅」按钮</li>
              <li>搜索并选择目标用户</li>
              <li>选择对应的订阅分组</li>
              <li>设置有效期天数后提交</li>
            </ol>
          </div>

          <!-- Step 3: 管理操作 -->
          <div class="mb-5 rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">
            <h3 class="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
              <span class="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-400">3</span>
              订阅管理操作
            </h3>
            <div class="ml-8 overflow-hidden rounded-lg border border-slate-700/50">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-slate-700/50 bg-slate-800/80">
                    <th class="px-3 py-2 text-left text-xs font-medium text-slate-400">操作</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-slate-400">说明</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-slate-700/30 last:border-0">
                    <td class="whitespace-nowrap px-3 py-2 font-medium text-blue-400">调整</td>
                    <td class="px-3 py-2 text-slate-400">增减订阅有效天数，正值延长、负值缩短</td>
                  </tr>
                  <tr class="border-b border-slate-700/30 last:border-0">
                    <td class="whitespace-nowrap px-3 py-2 font-medium text-amber-400">重置配额</td>
                    <td class="px-3 py-2 text-slate-400">一键清零日/周/月用量统计，重新开始计数</td>
                  </tr>
                  <tr class="border-b border-slate-700/30 last:border-0">
                    <td class="whitespace-nowrap px-3 py-2 font-medium text-red-400">撤销</td>
                    <td class="px-3 py-2 text-slate-400">立即终止该订阅，用户将无法继续使用</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 提示 -->
          <div class="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 text-xs text-blue-300">
            💡 提示：订阅过期后用户将自动失去对应分组的 API 访问权限，可以在订阅卡片中随时调整或续期。
          </div>

          <div class="mt-6 text-right">
            <button type="button" class="rounded-lg bg-slate-700 px-4 py-2 text-sm text-white transition hover:bg-slate-600" @click="$emit('close')">关闭</button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
}>()

defineEmits<{
  close: []
}>()
</script>
