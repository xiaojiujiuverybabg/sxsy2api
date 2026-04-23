import axios from 'axios'
import type { ApiResponse } from '@/types'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 30000,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('auth_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  if (config.method === 'get') {
    config.params = {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      ...(config.params || {}),
    }
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => {
    const payload = response.data as ApiResponse<unknown>
    if (payload && typeof payload === 'object' && 'code' in payload) {
      if (payload.code === 0) {
        response.data = payload.data
      } else {
        return Promise.reject({
          status: response.status,
          code: payload.code,
          message: payload.message || 'Request failed',
        })
      }
    }

    return response
  },
  (error) => {
    if (error?.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('sub2api:unauthorized'))
    }

    const data = error?.response?.data
    return Promise.reject({
      status: error?.response?.status || 0,
      code: data?.code,
      reason: data?.reason,
      message: data?.message || data?.detail || error?.message || 'Network error',
      metadata: data?.metadata,
    })
  },
)
