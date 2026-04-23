import { apiClient } from './client'
import type { BasePaginationResponse } from '@/types'
import type {
  CheckoutInfoResponse,
  CreateOrderRequest,
  CreateOrderResult,
  MethodLimitsResponse,
  PaymentChannel,
  PaymentConfig,
  PaymentOrder,
  SubscriptionPlan,
} from '@/types/payment'

export const paymentAPI = {
  getConfig() {
    return apiClient.get<PaymentConfig>('/payment/config')
  },
  getPlans() {
    return apiClient.get<SubscriptionPlan[]>('/payment/plans')
  },
  getChannels() {
    return apiClient.get<PaymentChannel[]>('/payment/channels')
  },
  getCheckoutInfo() {
    return apiClient.get<CheckoutInfoResponse>('/payment/checkout-info')
  },
  getLimits() {
    return apiClient.get<MethodLimitsResponse>('/payment/limits')
  },
  createOrder(data: CreateOrderRequest) {
    return apiClient.post<CreateOrderResult>('/payment/orders', data)
  },
  getMyOrders(params?: { page?: number; page_size?: number; status?: string }) {
    return apiClient.get<BasePaginationResponse<PaymentOrder>>('/payment/orders/my', { params })
  },
  getOrder(id: number) {
    return apiClient.get<PaymentOrder>(`/payment/orders/${id}`)
  },
  cancelOrder(id: number) {
    return apiClient.post(`/payment/orders/${id}/cancel`)
  },
  verifyOrder(outTradeNo: string) {
    return apiClient.post<PaymentOrder>('/payment/orders/verify', { out_trade_no: outTradeNo })
  },
  verifyOrderPublic(outTradeNo: string) {
    return apiClient.post<PaymentOrder>('/payment/public/orders/verify', { out_trade_no: outTradeNo })
  },
  resolveOrderPublicByResumeToken(resumeToken: string) {
    return apiClient.post<PaymentOrder>('/payment/public/orders/resolve', { resume_token: resumeToken })
  },
}

export default paymentAPI
