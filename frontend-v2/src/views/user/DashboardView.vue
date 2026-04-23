<template>
  <div class="h-full overflow-y-auto surface-grid">
    <!-- Loading State -->
    <div v-if="loading && !stats" class="flex h-full items-center justify-center">
      <div class="text-center">
        <div class="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-brand-500/20 border-t-brand-500"></div>
        <p class="text-sm text-text-secondary">加载统计数据...</p>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else-if="stats" class="p-6">
      <div class="mx-auto max-w-[1920px]">
        <!-- 左右分栏布局 -->
        <div class="grid gap-6 lg:grid-cols-3">
          <!-- 左侧：统计 + 图表 + 快速操作 (2/3) -->
          <div class="space-y-6 lg:col-span-2">
            <!-- 统计卡片 - 4列 -->
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <!-- 余额 -->
              <div v-if="!isSimpleMode" class="group relative overflow-hidden rounded-2xl border border-brand-500/20 bg-surface-card/60 p-5 backdrop-blur-xl transition-all duration-300 hover:border-brand-500/40 hover:shadow-[0_0_30px_rgba(220,38,38,0.2)]">
                <div class="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-500/10 blur-3xl transition-all duration-300 group-hover:bg-brand-500/20"></div>
                <div class="relative">
                  <div class="mb-2 flex items-center justify-between">
                    <span class="text-xs font-bold uppercase tracking-wider text-text-muted">账户余额</span>
                    <div class="flex h-9 w-9 items-center justify-center rounded-lg border border-brand-500/30 bg-brand-500/20">
                      <span class="text-lg">💰</span>
                    </div>
                  </div>
                  <p class="text-2xl font-black text-white">${{ formatBalance(balance) }}</p>
                  <p class="mt-1 text-xs text-text-secondary">可用余额</p>
                </div>
              </div>

              <!-- 密钥数量 -->
              <div class="group relative overflow-hidden rounded-2xl border border-gold-500/20 bg-surface-card/60 p-5 backdrop-blur-xl transition-all duration-300 hover:border-gold-500/40 hover:shadow-[0_0_30px_rgba(251,191,36,0.2)]">
                <div class="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gold-500/10 blur-3xl transition-all duration-300 group-hover:bg-gold-500/20"></div>
                <div class="relative">
                  <div class="mb-2 flex items-center justify-between">
                    <span class="text-xs font-bold uppercase tracking-wider text-text-muted">API 密钥</span>
                    <div class="flex h-9 w-9 items-center justify-center rounded-lg border border-gold-500/30 bg-gold-500/20">
                      <span class="text-lg">🔑</span>
                    </div>
                  </div>
                  <p class="text-2xl font-black text-white">{{ stats.total_api_keys }}</p>
                  <p class="mt-1 text-xs text-success-400">{{ stats.active_api_keys }} 个活跃</p>
                </div>
              </div>

              <!-- 今日请求 -->
              <div class="group relative overflow-hidden rounded-2xl border border-success-500/20 bg-surface-card/60 p-5 backdrop-blur-xl transition-all duration-300 hover:border-success-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <div class="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-success-500/10 blur-3xl transition-all duration-300 group-hover:bg-success-500/20"></div>
                <div class="relative">
                  <div class="mb-2 flex items-center justify-between">
                    <span class="text-xs font-bold uppercase tracking-wider text-text-muted">今日请求</span>
                    <div class="flex h-9 w-9 items-center justify-center rounded-lg border border-success-500/30 bg-success-500/20">
                      <span class="text-lg">📊</span>
                    </div>
                  </div>
                  <p class="text-2xl font-black text-white">{{ formatNumber(stats.today_requests) }}</p>
                  <p class="mt-1 text-xs text-text-secondary">总计 {{ formatNumber(stats.total_requests) }}</p>
                </div>
              </div>

              <!-- 今日消费 -->
              <div class="group relative overflow-hidden rounded-2xl border border-warning-500/20 bg-surface-card/60 p-5 backdrop-blur-xl transition-all duration-300 hover:border-warning-500/40 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                <div class="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-warning-500/10 blur-3xl transition-all duration-300 group-hover:bg-warning-500/20"></div>
                <div class="relative">
                  <div class="mb-2 flex items-center justify-between">
                    <span class="text-xs font-bold uppercase tracking-wider text-text-muted">今日消费</span>
                    <div class="flex h-9 w-9 items-center justify-center rounded-lg border border-warning-500/30 bg-warning-500/20">
                      <span class="text-lg">💸</span>
                    </div>
                  </div>
                  <p class="text-2xl font-black text-white">${{ formatCost(stats.today_actual_cost) }}</p>
                  <p class="mt-1 text-xs text-text-secondary">总计 ${{ formatCost(stats.total_actual_cost) }}</p>
                </div>
              </div>
            </div>

            <!-- 次要统计 - 4列 -->
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div class="rounded-xl border border-white/5 bg-surface-card/40 p-4 backdrop-blur-md">
                <p class="text-xs font-bold uppercase tracking-wider text-text-muted">今日 Token</p>
                <p class="mt-2 text-lg font-black text-white">{{ formatTokens(stats.today_tokens) }}</p>
                <p class="mt-1 text-xs text-text-secondary">输入 {{ formatTokens(stats.today_input_tokens) }} / 输出 {{ formatTokens(stats.today_output_tokens) }}</p>
              </div>
              <div class="rounded-xl border border-white/5 bg-surface-card/40 p-4 backdrop-blur-md">
                <p class="text-xs font-bold uppercase tracking-wider text-text-muted">总 Token</p>
                <p class="mt-2 text-lg font-black text-white">{{ formatTokens(stats.total_tokens) }}</p>
                <p class="mt-1 text-xs text-text-secondary">输入 {{ formatTokens(stats.total_input_tokens) }} / 输出 {{ formatTokens(stats.total_output_tokens) }}</p>
              </div>
              <div class="rounded-xl border border-white/5 bg-surface-card/40 p-4 backdrop-blur-md">
                <p class="text-xs font-bold uppercase tracking-wider text-text-muted">性能指标</p>
                <p class="mt-2 text-lg font-black text-white">{{ formatNumber(stats.rpm) }} <span class="text-sm text-text-muted">RPM</span></p>
                <p class="mt-1 text-xs text-text-secondary">{{ formatTokens(stats.tpm) }} TPM</p>
              </div>
              <div class="rounded-xl border border-white/5 bg-surface-card/40 p-4 backdrop-blur-md">
                <p class="text-xs font-bold uppercase tracking-wider text-text-muted">平均响应</p>
                <p class="mt-2 text-lg font-black text-white">{{ formatDuration(stats.average_duration_ms) }}</p>
                <p class="mt-1 text-xs text-text-secondary">平均请求耗时</p>
              </div>
            </div>

            <!-- 用量趋势图 -->
            <div class="rounded-2xl border border-brand-500/20 bg-surface-card/60 p-6 backdrop-blur-xl">
              <div class="mb-4 flex items-center justify-between">
                <h3 class="text-lg font-black text-white">用量趋势</h3>
                <div class="flex gap-2">
                  <select
                    v-model="dateRange"
                    @change="loadTrendData"
                    class="rounded-lg border border-white/10 bg-surface-card px-3 py-1.5 text-sm text-white focus:border-brand-500 focus:outline-none"
                  >
                    <option value="7">近7天</option>
                    <option value="30">近30天</option>
                    <option value="90">近90天</option>
                  </select>
                  <select
                    v-model="granularity"
                    @change="loadTrendData"
                    class="rounded-lg border border-white/10 bg-surface-card px-3 py-1.5 text-sm text-white focus:border-brand-500 focus:outline-none"
                  >
                    <option value="day">按天</option>
                    <option value="hour">按小时</option>
                  </select>
                </div>
              </div>
              <div v-if="trendLoading" class="flex h-48 items-center justify-center">
                <div class="text-text-secondary">加载中...</div>
              </div>
              <div v-else-if="trendData && trendData.length > 0" class="h-48">
                <canvas ref="trendChartRef"></canvas>
              </div>
              <div v-else class="flex h-48 items-center justify-center text-text-secondary">
                暂无数据
              </div>
            </div>

            <!-- 模型使用分布 -->
            <div class="rounded-2xl border border-gold-500/20 bg-surface-card/60 p-6 backdrop-blur-xl">
              <h3 class="mb-4 text-lg font-black text-white">模型使用分布</h3>
              <div v-if="modelsLoading" class="flex h-48 items-center justify-center">
                <div class="text-text-secondary">加载中...</div>
              </div>
              <div v-else-if="modelsData && modelsData.length > 0" class="h-48">
                <canvas ref="modelsChartRef"></canvas>
              </div>
              <div v-else class="flex h-48 items-center justify-center text-text-secondary">
                暂无数据
              </div>
            </div>

            <!-- 快速操作 -->
            <div class="rounded-2xl border border-brand-500/20 bg-surface-card/60 p-6 backdrop-blur-xl">
              <h3 class="mb-4 text-lg font-black text-white">快速操作</h3>
              <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <!-- 创建密钥 -->
                <button
                  @click="$router.push('/keys')"
                  class="group flex flex-col items-center gap-3 rounded-xl border border-white/5 bg-surface-card/40 p-4 text-center transition-all duration-200 hover:border-brand-500/30 hover:bg-surface-card/60 hover:shadow-[0_0_20px_rgba(220,38,38,0.2)]"
                >
                  <div class="flex h-12 w-12 items-center justify-center rounded-lg border border-brand-500/30 bg-brand-500/20 transition-transform group-hover:scale-110">
                    <span class="text-2xl">🔑</span>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-white">创建密钥</p>
                    <p class="mt-1 text-xs text-text-muted">生成访问密钥</p>
                  </div>
                </button>

                <!-- 查看用量 -->
                <button
                  @click="$router.push('/usage')"
                  class="group flex flex-col items-center gap-3 rounded-xl border border-white/5 bg-surface-card/40 p-4 text-center transition-all duration-200 hover:border-success-500/30 hover:bg-surface-card/60 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                >
                  <div class="flex h-12 w-12 items-center justify-center rounded-lg border border-success-500/30 bg-success-500/20 transition-transform group-hover:scale-110">
                    <span class="text-2xl">📊</span>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-white">查看用量</p>
                    <p class="mt-1 text-xs text-text-muted">使用记录详情</p>
                  </div>
                </button>

                <!-- 兑换码 -->
                <button
                  @click="$router.push('/redeem')"
                  class="group flex flex-col items-center gap-3 rounded-xl border border-white/5 bg-surface-card/40 p-4 text-center transition-all duration-200 hover:border-gold-500/30 hover:bg-surface-card/60 hover:shadow-[0_0_20px_rgba(251,191,36,0.2)]"
                >
                  <div class="flex h-12 w-12 items-center justify-center rounded-lg border border-gold-500/30 bg-gold-500/20 transition-transform group-hover:scale-110">
                    <span class="text-2xl">🎁</span>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-white">兑换码</p>
                    <p class="mt-1 text-xs text-text-muted">充值余额</p>
                  </div>
                </button>

                <!-- 邀请好友 -->
                <button
                  @click="handleInvite"
                  class="group flex flex-col items-center gap-3 rounded-xl border border-white/5 bg-surface-card/40 p-4 text-center transition-all duration-200 hover:border-warning-500/30 hover:bg-surface-card/60 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                >
                  <div class="flex h-12 w-12 items-center justify-center rounded-lg border border-warning-500/30 bg-warning-500/20 transition-transform group-hover:scale-110">
                    <span class="text-2xl">👥</span>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-white">邀请好友</p>
                    <p class="mt-1 text-xs text-text-muted">获得奖励</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <!-- 右侧：使用记录 + 公告 (1/3) -->
          <div class="flex flex-col gap-6">
            <!-- 最近使用记录 -->
            <div class="flex-1 rounded-2xl border border-brand-500/20 bg-surface-card/60 p-6 backdrop-blur-xl">
              <div class="mb-4 flex items-center justify-between">
                <h3 class="text-lg font-black text-white">最近使用</h3>
                <RouterLink
                  to="/usage"
                  class="text-xs font-bold text-brand-400 transition hover:text-brand-300"
                >
                  查看全部 →
                </RouterLink>
              </div>

              <!-- 有数据 -->
              <div v-if="recentUsage.length > 0" class="space-y-3">
                <div
                  v-for="log in recentUsage.slice(0, 10)"
                  :key="log.id"
                  class="rounded-lg border border-white/5 bg-surface-page/40 p-3 transition hover:bg-surface-page/60"
                >
                  <div class="mb-2 flex items-start justify-between gap-2">
                    <code class="flex-1 truncate rounded bg-white/10 px-2 py-1 text-xs font-mono text-gold-400">{{ log.model || '-' }}</code>
                    <span
                      :class="[
                        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-bold',
                        (log as any).status === 200
                          ? 'border-success-500/30 bg-success-500/20 text-success-400'
                          : 'border-error-500/30 bg-error-500/20 text-error-400'
                      ]"
                    >
                      <span
                        class="h-1.5 w-1.5 rounded-full"
                        :class="[(log as any).status === 200 ? 'bg-success-400' : 'bg-error-400']"
                      ></span>
                      {{ (log as any).status || 200 }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-text-secondary">
                      {{ new Date(log.created_at).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }}
                    </span>
                    <span class="font-mono text-white">${{ (log.actual_cost || 0).toFixed(4) }}</span>
                  </div>
                </div>
              </div>

              <!-- 空状态 -->
              <div v-else class="flex flex-col items-center justify-center py-12 text-center">
                <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5">
                  <svg class="h-7 w-7 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 class="text-sm font-black text-white">暂无调用记录</h3>
                <p class="mt-1 text-xs text-text-secondary">创建密钥后开始使用</p>
              </div>
            </div>

            <!-- 最新公告 -->
            <div class="flex-1 rounded-2xl border border-gold-500/20 bg-surface-card/60 p-6 backdrop-blur-xl">
              <div class="mb-4 flex items-center justify-between">
                <h3 class="text-lg font-black text-white">最新公告</h3>
                <button
                  @click="loadAnnouncements"
                  class="text-xs font-bold text-brand-400 transition hover:text-brand-300"
                >
                  刷新
                </button>
              </div>

              <!-- 有数据 -->
              <div v-if="announcements.length > 0" class="space-y-3">
                <div
                  v-for="announcement in announcements.slice(0, 5)"
                  :key="announcement.id"
                  class="rounded-lg border border-white/5 bg-surface-page/40 p-4 transition hover:bg-surface-page/60"
                >
                  <div class="mb-2 flex items-start justify-between gap-2">
                    <h4 class="flex-1 text-sm font-bold text-white">{{ announcement.title }}</h4>
                    <span
                      v-if="announcement.is_pinned"
                      class="inline-flex items-center rounded-full border border-brand-500/30 bg-brand-500/20 px-2 py-0.5 text-xs font-bold text-brand-400"
                    >
                      置顶
                    </span>
                  </div>
                  <p class="mb-2 line-clamp-2 text-xs text-text-secondary">{{ announcement.content }}</p>
                  <div class="text-xs text-text-muted">
                    {{ new Date(announcement.created_at).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }}
                  </div>
                </div>
              </div>

              <!-- 空状态 -->
              <div v-else class="flex flex-col items-center justify-center py-8 text-center">
                <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
                  <svg class="h-6 w-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <h3 class="text-sm font-black text-white">暂无公告</h3>
                <p class="mt-1 text-xs text-text-secondary">敬请期待</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
            <!-- 统计卡片保持不变，已在上一步更新 -->

            <!-- 右侧：使用记录 + 公告 (1/3) -->
            <div class="flex flex-col gap-6">
              <!-- 最近使用记录 -->
              <div class="flex-1 rounded-2xl border border-brand-500/20 bg-surface-card/60 p-6 backdrop-blur-xl">
                <div class="mb-4 flex items-center justify-between">
                  <h3 class="text-lg font-black text-white">最近使用</h3>
                  <RouterLink
                    to="/usage"
                    class="text-xs font-bold text-brand-400 transition hover:text-brand-300"
                  >
                    查看全部 →
                  </RouterLink>
                </div>

                <!-- 有数据 -->
                <div v-if="recentUsage.length > 0" class="space-y-3">
                  <div
                    v-for="log in recentUsage.slice(0, 10)"
                    :key="log.id"
                    class="rounded-lg border border-white/5 bg-surface-page/40 p-3 transition hover:bg-surface-page/60"
                  >
                    <div class="mb-2 flex items-start justify-between gap-2">
                      <code class="flex-1 truncate rounded bg-white/10 px-2 py-1 text-xs font-mono text-gold-400">{{ log.model || '-' }}</code>
                      <span
                        :class="[
                          'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-bold',
                          (log as any).status === 200
                            ? 'border-success-500/30 bg-success-500/20 text-success-400'
                            : 'border-error-500/30 bg-error-500/20 text-error-400'
                        ]"
                      >
                        <span
                          class="h-1.5 w-1.5 rounded-full"
                          :class="[(log as any).status === 200 ? 'bg-success-400' : 'bg-error-400']"
                        ></span>
                        {{ (log as any).status || 200 }}
                      </span>
                    </div>
                    <div class="flex items-center justify-between text-xs">
                      <span class="text-text-secondary">
                        {{ new Date(log.created_at).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }}
                      </span>
                      <span class="font-mono text-white">${{ (log.actual_cost || 0).toFixed(4) }}</span>
                    </div>
                  </div>
                </div>

                <!-- 空状态 -->
                <div v-else class="flex flex-col items-center justify-center py-12 text-center">
                  <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5">
                    <svg class="h-7 w-7 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 class="text-sm font-black text-white">暂无调用记录</h3>
                  <p class="mt-1 text-xs text-text-secondary">创建密钥后开始使用</p>
                </div>
              </div>

              <!-- 最新公告 -->
              <div class="flex-1 rounded-2xl border border-gold-500/20 bg-surface-card/60 p-6 backdrop-blur-xl">
                <div class="mb-4 flex items-center justify-between">
                  <h3 class="text-lg font-black text-white">最新公告</h3>
                  <button
                    @click="loadAnnouncements"
                    class="text-xs font-bold text-brand-400 transition hover:text-brand-300"
                  >
                    刷新
                  </button>
                </div>

                <!-- 有数据 -->
                <div v-if="announcements.length > 0" class="space-y-3">
                  <div
                    v-for="announcement in announcements.slice(0, 5)"
                    :key="announcement.id"
                    class="rounded-lg border border-white/5 bg-surface-page/40 p-4 transition hover:bg-surface-page/60"
                  >
                    <div class="mb-2 flex items-start justify-between gap-2">
                      <h4 class="flex-1 text-sm font-bold text-white">{{ announcement.title }}</h4>
                      <span
                        v-if="announcement.is_pinned"
                        class="inline-flex items-center rounded-full border border-brand-500/30 bg-brand-500/20 px-2 py-0.5 text-xs font-bold text-brand-400"
                      >
                        置顶
                      </span>
                    </div>
                    <p class="mb-2 line-clamp-2 text-xs text-text-secondary">{{ announcement.content }}</p>
                    <div class="text-xs text-text-muted">
                      {{ new Date(announcement.created_at).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }}
                    </div>
                  </div>
                </div>

                <!-- 空状态 -->
                <div v-else class="flex flex-col items-center justify-center py-8 text-center">
                  <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
                    <svg class="h-6 w-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <h3 class="text-sm font-black text-white">暂无公告</h3>
                  <p class="mt-1 text-xs text-text-secondary">敬请期待</p>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usageAPI } from '@/api/usage'
import { announcementsAPI } from '@/api/announcements'
import type { UserDashboardStats } from '@/api/usage'
import type { UsageLog, UserAnnouncement } from '@/types'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const authStore = useAuthStore()
const balance = computed(() => authStore.user?.balance || 0)
const isSimpleMode = computed(() => authStore.isSimpleMode)

const loading = ref(false)
const stats = ref<UserDashboardStats | null>(null)
const recentUsage = ref<UsageLog[]>([])
const announcements = ref<UserAnnouncement[]>([])

// 图表相关
const dateRange = ref('7')
const granularity = ref('day')
const trendLoading = ref(false)
const trendData = ref<any[]>([])
const trendChartRef = ref<HTMLCanvasElement | null>(null)
let trendChart: Chart | null = null

const modelsLoading = ref(false)
const modelsData = ref<any[]>([])
const modelsChartRef = ref<HTMLCanvasElement | null>(null)
let modelsChart: Chart | null = null

const formatBalance = (b: number) =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(b)
const formatNumber = (n: number) => n.toLocaleString()
const formatCost = (c: number) => c.toFixed(4)
const formatTokens = (t: number) => {
  if (t >= 1_000_000) return `${(t / 1_000_000).toFixed(1)}M`
  if (t >= 1000) return `${(t / 1000).toFixed(1)}K`
  return t.toString()
}
const formatDuration = (ms: number) => (ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms.toFixed(0)}ms`)

const loadStats = async () => {
  try {
    await authStore.refreshUser()
    stats.value = await usageAPI.getDashboardStats()
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const loadRecentUsage = async () => {
  try {
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0]
    const res = await usageAPI.query({ start_date: startDate, end_date: endDate, page: 1, page_size: 10 })
    recentUsage.value = res.items
  } catch (error) {
    console.error('加载最近用量失败:', error)
  }
}

const loadAnnouncements = async () => {
  try {
    const data = await announcementsAPI.list()
    announcements.value = data
  } catch (error) {
    console.error('加载公告失败:', error)
  }
}

const loadTrendData = async () => {
  trendLoading.value = true
  try {
    const endDate = new Date()
    const startDate = new Date(Date.now() - parseInt(dateRange.value) * 86400000)
    const data = await usageAPI.getDashboardTrend({
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      granularity: granularity.value as 'day' | 'hour'
    })
    trendData.value = data
    await nextTick()
    renderTrendChart()
  } catch (error) {
    console.error('加载趋势数据失败:', error)
  } finally {
    trendLoading.value = false
  }
}

const loadModelsData = async () => {
  modelsLoading.value = true
  try {
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - 29 * 86400000).toISOString().split('T')[0]
    const data = await usageAPI.getDashboardModels({ start_date: startDate, end_date: endDate })
    modelsData.value = data
    await nextTick()
    renderModelsChart()
  } catch (error) {
    console.error('加载模型数据失败:', error)
  } finally {
    modelsLoading.value = false
  }
}

const renderTrendChart = () => {
  if (!trendChartRef.value || !trendData.value.length) return

  if (trendChart) {
    trendChart.destroy()
  }

  const ctx = trendChartRef.value.getContext('2d')
  if (!ctx) return

  trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: trendData.value.map(d => d.date || d.hour),
      datasets: [
        {
          label: '请求数',
          data: trendData.value.map(d => d.requests),
          borderColor: 'rgb(6, 182, 212)',
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: '消费 ($)',
          data: trendData.value.map(d => d.cost),
          borderColor: 'rgb(168, 85, 247)',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          labels: {
            color: 'rgb(156, 163, 175)'
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.05)'
          },
          ticks: {
            color: 'rgb(156, 163, 175)'
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          grid: {
            color: 'rgba(255, 255, 255, 0.05)'
          },
          ticks: {
            color: 'rgb(156, 163, 175)'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: {
            drawOnChartArea: false
          },
          ticks: {
            color: 'rgb(156, 163, 175)'
          }
        }
      }
    }
  })
}

const renderModelsChart = () => {
  if (!modelsChartRef.value || !modelsData.value.length) return

  if (modelsChart) {
    modelsChart.destroy()
  }

  const ctx = modelsChartRef.value.getContext('2d')
  if (!ctx) return

  const colors = [
    'rgb(59, 130, 246)',
    'rgb(16, 185, 129)',
    'rgb(245, 158, 11)',
    'rgb(239, 68, 68)',
    'rgb(168, 85, 247)',
    'rgb(236, 72, 153)'
  ]

  modelsChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: modelsData.value.map(d => d.model),
      datasets: [
        {
          data: modelsData.value.map(d => d.requests),
          backgroundColor: colors.slice(0, modelsData.value.length),
          borderColor: 'rgb(17, 24, 39)',
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: 'rgb(156, 163, 175)',
            padding: 15,
            font: {
              size: 12
            }
          }
        }
      }
    }
  })
}

const handleInvite = () => {
  // TODO: 实现邀请好友功能
  // 可以跳转到邀请页面或显示邀请链接弹窗
  alert('邀请好友功能开发中...')
}

const refreshAll = async () => {
  loading.value = true
  try {
    await Promise.all([
      loadStats(),
      loadRecentUsage(),
      loadAnnouncements(),
      loadTrendData(),
      loadModelsData()
    ])
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  refreshAll()
})
</script>
