import { apiClient } from './client'
import type { NotifyEmailEntry, User } from '@/types'

export async function getProfile(): Promise<User> {
  const { data } = await apiClient.get<User>('/user/profile')
  return data
}

export async function updateProfile(profile: {
  username?: string
  avatar_url?: string | null
  balance_notify_enabled?: boolean
  balance_notify_threshold?: number | null
  balance_notify_extra_emails?: NotifyEmailEntry[]
}): Promise<User> {
  const { data } = await apiClient.put<User>('/user', profile)
  return data
}

export async function changePassword(oldPassword: string, newPassword: string): Promise<{ message: string }> {
  const { data } = await apiClient.put<{ message: string }>('/user/password', {
    old_password: oldPassword,
    new_password: newPassword,
  })
  return data
}

export async function toggleNotifyEmail(email: string, disabled: boolean): Promise<User> {
  const { data } = await apiClient.put<User>('/user/notify-email/toggle', { email, disabled })
  return data
}

export const userAPI = { getProfile, updateProfile, changePassword, toggleNotifyEmail }
export default userAPI
