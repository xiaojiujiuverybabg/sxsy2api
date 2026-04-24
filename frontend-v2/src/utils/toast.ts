import { createApp, h } from 'vue'
import Toast from '@/components/ui/Toast.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'

interface ToastOptions {
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
}

interface ConfirmOptions {
  type?: 'danger' | 'warning' | 'info'
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
}

// 错误消息中英文映射
const errorMessages: Record<string, string> = {
  // 通用错误
  'Network Error': '网络连接失败，请检查网络设置',
  'Request failed': '请求失败，请稍后重试',
  'Unauthorized': '未授权，请重新登录',
  'Forbidden': '没有权限执行此操作',
  'Not Found': '请求的资源不存在',
  'Internal Server Error': '服务器内部错误',
  'Bad Request': '请求参数错误',

  // 认证相关
  'Invalid credentials': '用户名或密码错误',
  'Token expired': '登录已过期，请重新登录',
  'Invalid token': '无效的登录凭证',

  // 用户相关
  'User not found': '用户不存在',
  'User already exists': '用户已存在',
  'Username already taken': '用户名已被占用',
  'Email already exists': '邮箱已被注册',

  // 密钥相关
  'Key not found': '密钥不存在',
  'Invalid key': '无效的密钥',
  'Key expired': '密钥已过期',
  'Key quota exceeded': '密钥额度已用完',

  // 余额相关
  'Insufficient balance': '余额不足',
  'Invalid amount': '金额无效',

  // 订阅相关
  'Subscription not found': '订阅不存在',
  'Subscription expired': '订阅已过期',
  'Already subscribed': '已经订阅过该套餐',

  // 订单相关
  'Order not found': '订单不存在',
  'Order already paid': '订单已支付',
  'Order expired': '订单已过期',

  // 兑换码相关
  'Invalid redeem code': '无效的兑换码',
  'Redeem code expired': '兑换码已过期',
  'Redeem code already used': '兑换码已被使用',

  // 渠道相关
  'Channel not found': '渠道不存在',
  'Channel disabled': '渠道已禁用',
  'Channel test failed': '渠道测试失败',

  // 文件上传
  'File too large': '文件太大',
  'Invalid file type': '不支持的文件类型',
  'Upload failed': '上传失败'
}

// 翻译错误消息
function translateError(error: string): string {
  // 精确匹配
  if (errorMessages[error]) {
    return errorMessages[error]
  }

  // 模糊匹配
  for (const [key, value] of Object.entries(errorMessages)) {
    if (error.toLowerCase().includes(key.toLowerCase())) {
      return value
    }
  }

  // 如果已经是中文，直接返回
  if (/[一-龥]/.test(error)) {
    return error
  }

  // 默认返回原文
  return error || '操作失败，请稍后重试'
}

// Toast 通知
export function toast(options: ToastOptions | string) {
  const opts = typeof options === 'string' ? { message: options } : options

  // 翻译错误消息
  if (opts.type === 'error') {
    opts.message = translateError(opts.message)
  }

  const container = document.createElement('div')
  document.body.appendChild(container)

  const app = createApp({
    render() {
      return h(Toast, {
        ...opts,
        onClose: () => {
          app.unmount()
          document.body.removeChild(container)
        }
      })
    }
  })

  app.mount(container)
}

// 快捷方法
export const showSuccess = (message: string, title?: string) => {
  toast({ type: 'success', message, title })
}

export const showError = (message: string, title?: string) => {
  toast({ type: 'error', message: translateError(message), title })
}

export const showWarning = (message: string, title?: string) => {
  toast({ type: 'warning', message, title })
}

export const showInfo = (message: string, title?: string) => {
  toast({ type: 'info', message, title })
}

// 确认对话框
export function confirm(options: ConfirmOptions | string): Promise<boolean> {
  return new Promise((resolve) => {
    const opts = typeof options === 'string' ? { message: options } : options

    const container = document.createElement('div')
    document.body.appendChild(container)

    const app = createApp({
      render() {
        return h(ConfirmDialog, {
          ...opts,
          onConfirm: () => {
            app.unmount()
            document.body.removeChild(container)
            resolve(true)
          },
          onCancel: () => {
            app.unmount()
            document.body.removeChild(container)
            resolve(false)
          }
        })
      }
    })

    app.mount(container)
  })
}

// 从 axios 错误中提取消息
export function extractErrorMessage(error: any): string {
  if (error.response?.data?.message) {
    return translateError(error.response.data.message)
  }
  if (error.response?.data?.error) {
    return translateError(error.response.data.error)
  }
  if (error.message) {
    return translateError(error.message)
  }
  return '操作失败，请稍后重试'
}
