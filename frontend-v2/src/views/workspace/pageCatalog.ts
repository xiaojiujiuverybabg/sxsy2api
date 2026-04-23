import { adminAPI, announcementsAPI, keysAPI, paymentAPI, redeemAPI, setupAPI, subscriptionsAPI, usageAPI, userAPI } from '@/api'
import type { DataStageRow } from '@/components/console/DataStage.vue'
import { extractErrorMessage, formatCompactNumber, formatDateTime, formatMoney, formatNumber, statusTone } from '@/utils/format'

export type WorkspacePageKind = 'public' | 'user' | 'admin' | 'payment' | 'system'

export interface WorkspaceMetricConfig {
  label: string
  value: (context: WorkspaceLoadContext) => string
  hint: string
  mark?: string
  tone?: 'ember' | 'moss' | 'steel' | 'ink'
}

export interface WorkspaceActionConfig {
  label: string
  description: string
  to?: string
  tone?: 'primary' | 'default'
}

export interface WorkspaceLoaderResult {
  metrics?: Record<string, unknown>
  rows?: DataStageRow[]
  detail?: string
  raw?: unknown
}

export interface WorkspaceLoadContext {
  metrics: Record<string, unknown>
  rows: DataStageRow[]
  raw?: unknown
}

export interface WorkspacePageConfig {
  key: string
  kind: WorkspacePageKind
  eyebrow: string
  title: string
  description: string
  toolbarTitle: string
  toolbarDescription: string
  searchPlaceholder?: string
  statusOptions?: Array<{ value: string; label: string }>
  columns: Array<{ key: string; label: string }>
  metrics: WorkspaceMetricConfig[]
  actions: WorkspaceActionConfig[]
  loader: (params: { search: string; status: string; signal?: AbortSignal }) => Promise<WorkspaceLoaderResult>
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

function listRows(payload: unknown): DataStageRow[] {
  if (Array.isArray(payload)) {
    return payload.map((item, index) => normalizeRow(item, index))
  }

  const record = asRecord(payload)
  const items = record.items
  if (Array.isArray(items)) {
    return items.map((item, index) => normalizeRow(item, index))
  }

  const subscriptions = record.subscriptions
  if (Array.isArray(subscriptions)) {
    return subscriptions.map((item, index) => normalizeRow(item, index))
  }

  return []
}

function normalizeRow(item: unknown, index: number): DataStageRow {
  const record = asRecord(item)
  const user = asRecord(record.user)
  const group = asRecord(record.group)
  return {
    id: String(record.id ?? record.code ?? record.out_trade_no ?? record.request_id ?? index),
    name: String(record.name ?? record.title ?? record.email ?? record.code ?? record.out_trade_no ?? record.request_id ?? `#${index + 1}`),
    status: String(record.status ?? record.payment_status ?? record.type ?? '-'),
    owner: String(user.email ?? user.username ?? record.username ?? record.user_id ?? '-'),
    group: String(group.name ?? record.group_name ?? record.group_id ?? '-'),
    model: String(record.model ?? record.platform ?? record.payment_type ?? record.order_type ?? '-'),
    amount: formatMoney(record.amount ?? record.value ?? record.balance ?? record.total_cost ?? record.actual_cost ?? 0),
    usage: formatCompactNumber(record.total_tokens ?? record.quota_used ?? record.requests ?? record.used_count ?? 0),
    updated: formatDateTime(record.updated_at ?? record.created_at ?? record.used_at ?? record.expires_at),
    raw: record,
  }
}

function metricsFromRows(rows: DataStageRow[], raw?: unknown): Record<string, unknown> {
  const rawRecord = asRecord(raw)
  return {
    count: rows.length,
    total: rawRecord.total ?? rows.length,
    active: rows.filter((row) => statusTone(row.status) === 'success').length,
    warning: rows.filter((row) => statusTone(row.status) === 'warning').length,
    danger: rows.filter((row) => statusTone(row.status) === 'danger').length,
  }
}

function standardMetrics(primaryLabel = '资源数量'): WorkspaceMetricConfig[] {
  return [
    { label: primaryLabel, value: ({ metrics }) => formatNumber(metrics.total ?? metrics.count), hint: '当前数据舞台加载的业务对象', mark: 'A', tone: 'ember' },
    { label: '活跃状态', value: ({ metrics }) => formatNumber(metrics.active), hint: '处于可用、完成或健康状态的对象', mark: 'H', tone: 'moss' },
    { label: '待处理', value: ({ metrics }) => formatNumber(metrics.warning), hint: '需要继续确认的任务或订单', mark: 'P', tone: 'steel' },
    { label: '风险项', value: ({ metrics }) => formatNumber(metrics.danger), hint: '禁用、失败、过期或异常状态', mark: 'R', tone: 'ink' },
  ]
}

function standardActions(extra: WorkspaceActionConfig[] = []): WorkspaceActionConfig[] {
  return [
    { label: '刷新数据', description: '重新读取当前页面关联的后端数据。' },
    { label: '打开情境面板', description: '查看筛选、详情与下一步操作建议。', tone: 'primary' },
    ...extra,
  ]
}

async function loadList(
  source: Promise<unknown>,
  fallbackDetail = '页面已接入后端查询接口，数据将按当前账号权限展示。',
): Promise<WorkspaceLoaderResult> {
  const raw = await source
  const rows = listRows(raw)
  return { raw, rows, metrics: metricsFromRows(rows, raw), detail: fallbackDetail }
}

function fallbackFromError(error: unknown): WorkspaceLoaderResult {
  return {
    rows: [],
    metrics: { count: 0, total: 0, active: 0, warning: 0, danger: 1 },
    detail: extractErrorMessage(error, '当前接口暂不可用，请稍后刷新。'),
  }
}

async function guarded(loader: () => Promise<WorkspaceLoaderResult>): Promise<WorkspaceLoaderResult> {
  try {
    return await loader()
  } catch (error) {
    return fallbackFromError(error)
  }
}

const resourceColumns = [
  { key: 'name', label: '对象' },
  { key: 'status', label: '状态' },
  { key: 'group', label: '分组' },
  { key: 'usage', label: '用量' },
  { key: 'updated', label: '时间' },
]

const paymentColumns = [
  { key: 'name', label: '订单' },
  { key: 'status', label: '状态' },
  { key: 'model', label: '类型' },
  { key: 'amount', label: '金额' },
  { key: 'updated', label: '时间' },
]

export const workspacePages: Record<string, WorkspacePageConfig> = {
  keys: {
    key: 'keys',
    kind: 'user',
    eyebrow: 'Key Canvas',
    title: '密钥胶囊工作台',
    description: '用任务卡、结果舞台和情境抽屉管理 API 密钥，不回到传统表格后台。',
    toolbarTitle: '密钥筛选带',
    toolbarDescription: '搜索名称、状态与分组，结果在数据舞台中即时重组。',
    searchPlaceholder: '搜索密钥名称',
    columns: resourceColumns,
    metrics: standardMetrics('密钥总数'),
    actions: standardActions([{ label: '创建密钥', description: '进入分步骤密钥创建流程。', tone: 'primary' }]),
    loader: ({ search, status, signal }) => guarded(() => loadList(keysAPI.list(1, 20, { search, status }, { signal }))),
  },
  usage: {
    key: 'usage',
    kind: 'user',
    eyebrow: 'Usage Stage',
    title: '用量观测舞台',
    description: '按请求、模型、成本与耗时查看调用轨迹，筛选信息不再挤在表格行内。',
    toolbarTitle: '调用记录筛选',
    toolbarDescription: '支持关键词和状态组合，后续可继续扩展保存筛选方案。',
    searchPlaceholder: '搜索模型或请求 ID',
    columns: [
      { key: 'name', label: '请求' },
      { key: 'model', label: '模型' },
      { key: 'usage', label: 'Tokens' },
      { key: 'amount', label: '成本' },
      { key: 'updated', label: '时间' },
    ],
    metrics: standardMetrics('记录数量'),
    actions: standardActions([{ label: '导出用量', description: '保留原有导出链路的入口位置。' }]),
    loader: ({ signal }) => guarded(() => loadList(usageAPI.query({ page: 1, page_size: 20 }, { signal }))),
  },
  redeem: {
    key: 'redeem',
    kind: 'user',
    eyebrow: 'Redeem Flow',
    title: '兑换任务台',
    description: '兑换码输入、历史记录和结果反馈集中在一个任务流中。',
    toolbarTitle: '兑换记录',
    toolbarDescription: '展示当前账号已使用或可追踪的兑换记录。',
    searchPlaceholder: '搜索兑换码',
    columns: resourceColumns,
    metrics: standardMetrics('兑换记录'),
    actions: standardActions([{ label: '提交兑换码', description: '通过任务抽屉提交兑换码。', tone: 'primary' }]),
    loader: () => guarded(() => loadList(redeemAPI.getHistory())),
  },
  profile: {
    key: 'profile',
    kind: 'user',
    eyebrow: 'Identity Hub',
    title: '个人身份与安全中心',
    description: '把资料、安全、通知和身份绑定组织成一个身份画布。',
    toolbarTitle: '账号信息',
    toolbarDescription: '读取当前用户资料，并在情境面板中展示关键安全状态。',
    searchPlaceholder: '搜索资料字段',
    columns: resourceColumns,
    metrics: [
      { label: '账户余额', value: ({ raw }) => formatMoney(asRecord(raw).balance), hint: '当前账号可用余额', mark: '$', tone: 'ember' },
      { label: '并发额度', value: ({ raw }) => formatNumber(asRecord(raw).concurrency), hint: '当前账号并发配置', mark: 'C', tone: 'moss' },
      { label: '身份角色', value: ({ raw }) => String(asRecord(raw).role ?? '-'), hint: '账号权限角色', mark: 'R', tone: 'steel' },
      { label: '账号状态', value: ({ raw }) => String(asRecord(raw).status ?? '-'), hint: '是否允许继续使用', mark: 'S', tone: 'ink' },
    ],
    actions: standardActions([{ label: '更新资料', description: '修改用户名、通知阈值或安全设置。', tone: 'primary' }]),
    loader: () => guarded(async () => {
      const raw = await userAPI.getProfile()
      const rows = listRows([{ id: raw.id, name: raw.email, status: raw.status, group_name: raw.role, value: raw.balance, created_at: raw.created_at }])
      return { raw, rows, metrics: metricsFromRows(rows, raw), detail: '已读取当前账号资料，保存动作仍使用原后端资料接口。' }
    }),
  },
  subscriptions: {
    key: 'subscriptions',
    kind: 'user',
    eyebrow: 'Subscription Map',
    title: '订阅与额度地图',
    description: '订阅状态、有效期与限额进度以卡片化地图呈现。',
    toolbarTitle: '订阅筛选',
    toolbarDescription: '按状态浏览当前账号订阅。',
    searchPlaceholder: '搜索分组或订阅',
    columns: resourceColumns,
    metrics: standardMetrics('订阅数量'),
    actions: standardActions([{ label: '购买套餐', description: '跳转到购买工作台。', to: '/purchase', tone: 'primary' }]),
    loader: () => guarded(() => loadList(subscriptionsAPI.getMySubscriptions())),
  },
  purchase: {
    key: 'purchase',
    kind: 'payment',
    eyebrow: 'Checkout Canvas',
    title: '购买与充值工作台',
    description: '套餐、支付方式、限额提示集中在支付画布中，减少跳转和弹窗干扰。',
    toolbarTitle: '支付资源',
    toolbarDescription: '读取可用套餐与支付配置。',
    searchPlaceholder: '搜索套餐',
    columns: paymentColumns,
    metrics: standardMetrics('套餐数量'),
    actions: standardActions([{ label: '创建订单', description: '选择套餐后创建支付订单。', tone: 'primary' }]),
    loader: () => guarded(async () => {
      const [plans, config] = await Promise.all([paymentAPI.getPlans(), paymentAPI.getConfig()])
      const rows = listRows(plans.data)
      return { raw: { plans: plans.data, config: config.data }, rows, metrics: metricsFromRows(rows, plans.data), detail: '已接入套餐和支付配置接口，创建订单仍走原支付接口。' }
    }),
  },
  orders: {
    key: 'orders',
    kind: 'payment',
    eyebrow: 'Order Orbit',
    title: '我的订单轨道',
    description: '订单状态、金额、回流动作在同一个数据舞台里闭环。',
    toolbarTitle: '订单筛选',
    toolbarDescription: '按支付状态筛选我的订单。',
    searchPlaceholder: '搜索订单号',
    columns: paymentColumns,
    metrics: standardMetrics('订单数量'),
    actions: standardActions([{ label: '继续支付', description: '对待支付订单恢复支付链路。', tone: 'primary' }]),
    loader: ({ status }) => guarded(() => loadList(paymentAPI.getMyOrders({ page: 1, page_size: 20, status: status || undefined }).then((r) => r.data))),
  },
  paymentQrcode: {
    key: 'paymentQrcode',
    kind: 'payment',
    eyebrow: 'QRCode Pay',
    title: '扫码支付检查点',
    description: '承载二维码支付、订单恢复与支付状态确认。',
    toolbarTitle: '支付回流',
    toolbarDescription: '页面会根据订单参数恢复支付上下文。',
    searchPlaceholder: '输入订单号',
    columns: paymentColumns,
    metrics: standardMetrics('支付对象'),
    actions: standardActions([{ label: '验证支付', description: '按订单号确认支付状态。', tone: 'primary' }]),
    loader: () => guarded(async () => ({ rows: [], metrics: { total: 0, active: 0, warning: 1, danger: 0 }, detail: '等待 URL 订单参数后恢复二维码支付信息。' })),
  },
  stripePayment: {
    key: 'stripePayment',
    kind: 'payment',
    eyebrow: 'Stripe Flow',
    title: 'Stripe 支付画布',
    description: '以独立支付画布承载 Stripe client secret、确认动作和状态回写。',
    toolbarTitle: 'Stripe 状态',
    toolbarDescription: '用于恢复或继续 Stripe 支付链路。',
    searchPlaceholder: '搜索 Stripe 订单',
    columns: paymentColumns,
    metrics: standardMetrics('支付对象'),
    actions: standardActions([{ label: '继续 Stripe 支付', description: '根据订单上下文继续确认支付。', tone: 'primary' }]),
    loader: () => guarded(async () => ({ rows: [], metrics: { total: 0, active: 0, warning: 1, danger: 0 }, detail: '等待支付上下文参数后继续 Stripe 支付。' })),
  },
  stripePopup: {
    key: 'stripePopup',
    kind: 'payment',
    eyebrow: 'Payment Popup',
    title: '支付弹层容器',
    description: '用轻量工作台承载弹层支付结果，而不是传统居中空白跳转页。',
    toolbarTitle: '弹层通信',
    toolbarDescription: '用于承接父窗口支付状态同步。',
    searchPlaceholder: '搜索支付状态',
    columns: paymentColumns,
    metrics: standardMetrics('支付对象'),
    actions: standardActions([{ label: '同步结果', description: '向父窗口回写支付状态。', tone: 'primary' }]),
    loader: () => guarded(async () => ({ rows: [], metrics: { total: 0, active: 0, warning: 1, danger: 0 }, detail: '等待支付平台回调后同步弹层状态。' })),
  },
  customPage: {
    key: 'customPage',
    kind: 'user',
    eyebrow: 'Custom Surface',
    title: '自定义内容画布',
    description: '承载系统配置的自定义菜单内容，并保持统一工作台外观。',
    toolbarTitle: '自定义入口',
    toolbarDescription: '根据路由参数展示对应自定义内容。',
    searchPlaceholder: '搜索内容',
    columns: resourceColumns,
    metrics: standardMetrics('内容块'),
    actions: standardActions(),
    loader: () => guarded(async () => ({ rows: [], metrics: { total: 0, active: 0, warning: 0, danger: 0 }, detail: '自定义内容依赖系统菜单配置，当前保持统一容器。' })),
  },
  keyUsage: {
    key: 'keyUsage',
    kind: 'public',
    eyebrow: 'Public Lookup',
    title: '密钥用量公开查询',
    description: '为无需登录的密钥用量查询提供独立查询画布。',
    toolbarTitle: '查询条件',
    toolbarDescription: '输入密钥信息后展示用量结果，不暴露控制台结构。',
    searchPlaceholder: '输入 API Key',
    columns: resourceColumns,
    metrics: standardMetrics('查询结果'),
    actions: standardActions([{ label: '查询用量', description: '按输入密钥查询公开用量。', tone: 'primary' }]),
    loader: () => guarded(async () => ({ rows: [], metrics: { total: 0, active: 0, warning: 0, danger: 0 }, detail: '等待输入密钥后发起公开查询。' })),
  },
  paymentResult: {
    key: 'paymentResult',
    kind: 'payment',
    eyebrow: 'Payment Result',
    title: '支付结果回流站',
    description: '统一承接支付成功、失败、取消和待确认状态。',
    toolbarTitle: '结果确认',
    toolbarDescription: '根据回流参数确认订单状态。',
    searchPlaceholder: '输入订单号',
    columns: paymentColumns,
    metrics: standardMetrics('回流结果'),
    actions: standardActions([{ label: '验证订单', description: '向后端确认最终支付状态。', tone: 'primary' }]),
    loader: () => guarded(async () => ({ rows: [], metrics: { total: 0, active: 0, warning: 1, danger: 0 }, detail: '等待支付平台回流参数后确认订单。' })),
  },
  adminDashboard: {
    key: 'adminDashboard',
    kind: 'admin',
    eyebrow: 'Admin Command',
    title: '管理总览指挥画布',
    description: '把用户、密钥、账号、成本与请求健康度压缩成管理端任务画布。',
    toolbarTitle: '全局态势',
    toolbarDescription: '读取管理端统计接口，展示系统运行摘要。',
    searchPlaceholder: '搜索管理对象',
    columns: resourceColumns,
    metrics: [
      { label: '用户总数', value: ({ raw }) => formatNumber(asRecord(raw).total_users), hint: '系统用户规模', mark: 'U', tone: 'ember' },
      { label: '今日请求', value: ({ raw }) => formatCompactNumber(asRecord(raw).today_requests), hint: '今日 API 请求量', mark: 'Q', tone: 'moss' },
      { label: '正常账号', value: ({ raw }) => formatNumber(asRecord(raw).normal_accounts), hint: '可调度账号数量', mark: 'A', tone: 'steel' },
      { label: '今日成本', value: ({ raw }) => formatMoney(asRecord(raw).today_actual_cost), hint: '今日实际成本', mark: '$', tone: 'ink' },
    ],
    actions: standardActions([{ label: '查看运维', description: '进入运维监控画布。', to: '/admin/ops', tone: 'primary' }]),
    loader: () => guarded(async () => {
      const raw = await adminAPI.dashboard.getStats()
      return { raw, rows: [], metrics: metricsFromRows([], raw), detail: '管理端统计接口已接入。' }
    }),
  },
  adminOps: {
    key: 'adminOps',
    kind: 'admin',
    eyebrow: 'Ops Radar',
    title: '运维监控雷达',
    description: '错误日志、健康状态和系统风险统一进入运维雷达。',
    toolbarTitle: '错误日志',
    toolbarDescription: '按时间与状态观察异常。',
    searchPlaceholder: '搜索错误内容',
    columns: resourceColumns,
    metrics: standardMetrics('异常记录'),
    actions: standardActions(),
    loader: () => guarded(() => loadList(adminAPI.ops.listErrorLogs({ page: 1, page_size: 20 }))),
  },
  adminUsers: {
    key: 'adminUsers',
    kind: 'admin',
    eyebrow: 'User Matrix',
    title: '用户矩阵管理',
    description: '用户状态、余额、角色和订阅信息进入卡片化管理流。',
    toolbarTitle: '用户筛选',
    toolbarDescription: '支持状态、角色和关键词筛选。',
    searchPlaceholder: '搜索邮箱或用户名',
    columns: resourceColumns,
    metrics: standardMetrics('用户数量'),
    actions: standardActions([{ label: '新增用户', description: '打开用户创建任务抽屉。', tone: 'primary' }]),
    loader: ({ search, status, signal }) => guarded(() => loadList(adminAPI.users.list(1, 20, { search, status: status as 'active' | 'disabled' | undefined }, { signal }))),
  },
  adminGroups: {
    key: 'adminGroups',
    kind: 'admin',
    eyebrow: 'Group Dock',
    title: '分组调度舱',
    description: '分组、倍率、订阅类型和账号绑定以调度舱方式展示。',
    toolbarTitle: '分组筛选',
    toolbarDescription: '查看不同平台和状态的分组。',
    searchPlaceholder: '搜索分组名称',
    columns: resourceColumns,
    metrics: standardMetrics('分组数量'),
    actions: standardActions([{ label: '新增分组', description: '打开分组配置任务。', tone: 'primary' }]),
    loader: ({ search, status, signal }) => guarded(() => loadList(adminAPI.groups.list(1, 20, { search, status: status as 'active' | 'inactive' | undefined }, { signal }))),
  },
  adminChannels: {
    key: 'adminChannels',
    kind: 'admin',
    eyebrow: 'Channel Flow',
    title: '渠道任务卡流',
    description: '渠道管理采用任务卡与结果区组合，不复用原纯表格布局。',
    toolbarTitle: '渠道筛选',
    toolbarDescription: '按状态、平台和关键词定位渠道。',
    searchPlaceholder: '搜索渠道',
    columns: resourceColumns,
    metrics: standardMetrics('渠道数量'),
    actions: standardActions([{ label: '新增渠道', description: '打开渠道创建任务。', tone: 'primary' }]),
    loader: ({ search, status, signal }) => guarded(() => loadList(adminAPI.channels.list(1, 20, { search, status }, { signal }))),
  },
  adminSubscriptions: {
    key: 'adminSubscriptions',
    kind: 'admin',
    eyebrow: 'Subscription Control',
    title: '订阅管理控制台',
    description: '管理员订阅分配、进度和到期风险集中展示。',
    toolbarTitle: '订阅筛选',
    toolbarDescription: '按用户、状态和分组过滤订阅。',
    searchPlaceholder: '搜索用户或分组',
    columns: resourceColumns,
    metrics: standardMetrics('订阅数量'),
    actions: standardActions([{ label: '分配订阅', description: '打开订阅分配任务。', tone: 'primary' }]),
    loader: ({ search, status, signal }) => guarded(() => loadList(adminAPI.subscriptions.list(1, 20, { search, status }, { signal }))),
  },
  adminAccounts: {
    key: 'adminAccounts',
    kind: 'admin',
    eyebrow: 'Account Grid',
    title: '账号资源网格',
    description: '账号、代理、并发和错误状态以资源网格方式管理。',
    toolbarTitle: '账号筛选',
    toolbarDescription: '定位平台、状态和调度异常。',
    searchPlaceholder: '搜索账号',
    columns: resourceColumns,
    metrics: standardMetrics('账号数量'),
    actions: standardActions([{ label: '新增账号', description: '打开账号接入任务。', tone: 'primary' }]),
    loader: ({ search, status, signal }) => guarded(() => loadList(adminAPI.accounts.list(1, 20, { search, status }, { signal }))),
  },
  adminAnnouncements: {
    key: 'adminAnnouncements',
    kind: 'admin',
    eyebrow: 'Notice Studio',
    title: '公告编排工作室',
    description: '公告草稿、投放条件和已读状态进入编排式画布。',
    toolbarTitle: '公告筛选',
    toolbarDescription: '按状态查看公告。',
    searchPlaceholder: '搜索公告标题',
    columns: resourceColumns,
    metrics: standardMetrics('公告数量'),
    actions: standardActions([{ label: '创建公告', description: '打开公告编辑任务。', tone: 'primary' }]),
    loader: ({ search, status, signal }) => guarded(() => loadList(adminAPI.announcements.list(1, 20, { search, status }, { signal }))),
  },
  adminProxies: {
    key: 'adminProxies',
    kind: 'admin',
    eyebrow: 'Proxy Mesh',
    title: '代理质量网格',
    description: '代理节点、延迟、质量评分和绑定账号集中呈现。',
    toolbarTitle: '代理筛选',
    toolbarDescription: '按状态和关键词筛选代理。',
    searchPlaceholder: '搜索代理',
    columns: resourceColumns,
    metrics: standardMetrics('代理数量'),
    actions: standardActions([{ label: '新增代理', description: '打开代理创建任务。', tone: 'primary' }]),
    loader: ({ search, status, signal }) => guarded(() => loadList(adminAPI.proxies.list(1, 20, { search, status }, { signal }))),
  },
  adminRedeem: {
    key: 'adminRedeem',
    kind: 'admin',
    eyebrow: 'Redeem Factory',
    title: '兑换码工厂',
    description: '批量生成、状态追踪和使用记录在同一工厂流中完成。',
    toolbarTitle: '兑换码筛选',
    toolbarDescription: '按类型和状态查看兑换码。',
    searchPlaceholder: '搜索兑换码',
    columns: resourceColumns,
    metrics: standardMetrics('兑换码数量'),
    actions: standardActions([{ label: '批量生成', description: '打开兑换码生成任务。', tone: 'primary' }]),
    loader: ({ search, status, signal }) => guarded(() => loadList(adminAPI.redeem.list(1, 20, { search, status }, { signal }))),
  },
  adminPromoCodes: {
    key: 'adminPromoCodes',
    kind: 'admin',
    eyebrow: 'Promo Lab',
    title: '优惠码实验室',
    description: '优惠码额度、使用次数和有效期以实验室卡片流组织。',
    toolbarTitle: '优惠码筛选',
    toolbarDescription: '定位可用、停用或过期优惠码。',
    searchPlaceholder: '搜索优惠码',
    columns: resourceColumns,
    metrics: standardMetrics('优惠码数量'),
    actions: standardActions([{ label: '创建优惠码', description: '打开优惠码创建任务。', tone: 'primary' }]),
    loader: ({ search, status, signal }) => guarded(() => loadList(adminAPI.promo.list(1, 20, { search, status }, { signal }))),
  },
  adminSettings: {
    key: 'adminSettings',
    kind: 'admin',
    eyebrow: 'Settings Console',
    title: '系统设置工作台',
    description: '设置项、变更摘要和预览反馈在一个工作台中完成。',
    toolbarTitle: '设置检索',
    toolbarDescription: '读取系统设置并按关键字定位。',
    searchPlaceholder: '搜索设置项',
    columns: resourceColumns,
    metrics: standardMetrics('设置项'),
    actions: standardActions([{ label: '保存变更', description: '保存设置草稿。', tone: 'primary' }]),
    loader: () => guarded(async () => {
      const raw = await adminAPI.settings.getSettings()
      const rows = Object.entries(raw).slice(0, 20).map(([key, value], index) => normalizeRow({ id: key, name: key, status: typeof value, value: index }, index))
      return { raw, rows, metrics: metricsFromRows(rows, raw), detail: '系统设置接口已接入，保存动作使用原管理端设置接口。' }
    }),
  },
  adminUsage: {
    key: 'adminUsage',
    kind: 'admin',
    eyebrow: 'Usage Command',
    title: '全局用量指挥台',
    description: '管理员用量、用户排行、模型成本和异常调用统一观察。',
    toolbarTitle: '用量筛选',
    toolbarDescription: '按用户、模型、状态和时间定位调用记录。',
    searchPlaceholder: '搜索用户或模型',
    columns: resourceColumns,
    metrics: standardMetrics('调用记录'),
    actions: standardActions([{ label: '导出日志', description: '导出全局调用日志。' }]),
    loader: ({ signal }) => guarded(() => loadList(adminAPI.usage.list({ page: 1, page_size: 20 }, { signal }))),
  },
  adminPaymentDashboard: {
    key: 'adminPaymentDashboard',
    kind: 'admin',
    eyebrow: 'Payment Ops',
    title: '支付总览指挥台',
    description: '收入、订单、渠道和套餐在支付运营画布中聚合。',
    toolbarTitle: '支付统计',
    toolbarDescription: '读取支付统计接口。',
    searchPlaceholder: '搜索支付对象',
    columns: paymentColumns,
    metrics: standardMetrics('支付对象'),
    actions: standardActions([{ label: '查看订单', description: '进入订单管理。', to: '/admin/orders', tone: 'primary' }]),
    loader: () => guarded(async () => {
      const response = await adminAPI.payment.getDashboard(7)
      return { raw: response.data, rows: [], metrics: metricsFromRows([], response.data), detail: '支付统计接口已接入。' }
    }),
  },
  adminOrders: {
    key: 'adminOrders',
    kind: 'admin',
    eyebrow: 'Order Control',
    title: '订单管理轨道',
    description: '所有订单、支付状态、退款和回调检查集中管理。',
    toolbarTitle: '订单筛选',
    toolbarDescription: '按状态、用户和支付方式筛选订单。',
    searchPlaceholder: '搜索订单号',
    columns: paymentColumns,
    metrics: standardMetrics('订单数量'),
    actions: standardActions([{ label: '刷新订单', description: '重新获取订单状态。', tone: 'primary' }]),
    loader: ({ search, status, signal }) => guarded(() => loadList(adminAPI.payment.getOrders({ page: 1, page_size: 20, search, status, signal }).then((r) => r.data))),
  },
  adminPaymentPlans: {
    key: 'adminPaymentPlans',
    kind: 'admin',
    eyebrow: 'Plan Studio',
    title: '支付套餐工作室',
    description: '套餐、渠道和供应商实例以运营工作室方式维护。',
    toolbarTitle: '套餐筛选',
    toolbarDescription: '查看支付套餐和渠道。',
    searchPlaceholder: '搜索套餐',
    columns: paymentColumns,
    metrics: standardMetrics('套餐数量'),
    actions: standardActions([{ label: '创建套餐', description: '打开套餐编辑任务。', tone: 'primary' }]),
    loader: () => guarded(async () => {
      const [plans, channels] = await Promise.all([adminAPI.payment.getPlans(), adminAPI.payment.getChannels()])
      const rows = listRows(plans.data)
      return { raw: { plans: plans.data, channels: channels.data }, rows, metrics: metricsFromRows(rows, plans.data), detail: '支付套餐与渠道接口已接入。' }
    }),
  },
}

export function getWorkspacePage(key: string): WorkspacePageConfig {
  return workspacePages[key]
}
