<template>
  <AtlasPage
    eyebrow="Setup Orbit"
    title="系统初始化引导"
    description="安装流程被组织为检查点式画布：数据库、Redis、管理员账号和服务参数依次确认，不改变后端安装接口。"
  >
    <template #actions>
      <div class="flex flex-wrap gap-3">
        <button class="rounded-full bg-brand-500 px-5 py-3 text-sm font-black text-white transition hover:bg-brand-700" @click="refresh">
          重新检查
        </button>
        <StatusPill :label="statusLabel" :tone="needsSetup ? 'warning' : 'success'" />
      </div>
    </template>

    <section class="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricTile label="安装状态" :value="statusLabel" hint="来自 /setup/status" mark="S" tone="ember" />
      <MetricTile label="当前步骤" :value="setupStatus?.step || '-'" hint="后端返回的安装阶段" mark="P" tone="moss" />
      <MetricTile label="数据库" value="待验证" hint="使用原测试数据库接口" mark="D" tone="steel" />
      <MetricTile label="Redis" value="待验证" hint="使用原测试 Redis 接口" mark="R" tone="ink" />
    </section>

    <section class="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div class="grid gap-4 md:grid-cols-2">
        <SceneCard v-for="step in steps" :key="step.title" :title="step.title" :description="step.description" :mark="step.mark">
          <StatusPill :label="step.status" :tone="step.tone" />
        </SceneCard>
      </div>

      <ActionPanel eyebrow="Install Actions" title="初始化动作">
        <ActionButton label="测试数据库" description="通过 /setup/test-db 验证连接配置。" />
        <ActionButton label="测试 Redis" description="通过 /setup/test-redis 验证缓存配置。" />
        <ActionButton label="提交安装" description="通过 /setup/install 完成初始化。" tone="primary" />
      </ActionPanel>
    </section>
  </AtlasPage>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ActionButton, ActionPanel, AtlasPage, MetricTile, StatusPill } from '@/components/atlas'
import SceneCard from '@/components/console/SceneCard.vue'
import { setupAPI } from '@/api'
import type { SetupStatus } from '@/types'

const setupStatus = ref<SetupStatus | null>(null)
const error = ref('')

const needsSetup = computed(() => setupStatus.value?.needs_setup !== false)
const statusLabel = computed(() => {
  if (error.value) return '检查失败'
  return needsSetup.value ? '需要初始化' : '已初始化'
})

const steps = computed(() => [
  { title: '数据库检查点', description: '填写并测试数据库连接，成功后进入下一检查点。', mark: '1', status: '待配置', tone: 'warning' as const },
  { title: 'Redis 检查点', description: '验证缓存服务，不改变后端 Redis 配置协议。', mark: '2', status: '待配置', tone: 'warning' as const },
  { title: '管理员账号', description: '创建首个管理员身份，后续进入登录页。', mark: '3', status: needsSetup.value ? '待创建' : '已完成', tone: needsSetup.value ? 'warning' as const : 'success' as const },
  { title: '服务参数', description: '确认服务监听参数并提交安装请求。', mark: '4', status: setupStatus.value?.step || '等待', tone: 'neutral' as const },
])

async function refresh() {
  error.value = ''
  try {
    setupStatus.value = await setupAPI.getSetupStatus()
  } catch (err) {
    error.value = err instanceof Error ? err.message : '初始化状态检查失败'
  }
}

onMounted(refresh)
</script>
