import { defineStore } from 'pinia'
import {
  getCurrentUser,
  login,
  login2FA,
  logout as logoutRequest,
  refreshToken as refreshTokenRequest,
  register,
  type AuthResponse,
  type AuthUser,
  type LoginRequest,
  type LoginResponse,
  type RegisterRequest,
  type TotpLogin2FARequest,
} from '@/api/auth'

const TOKEN_KEY = 'auth_token'
const LEGACY_TOKEN_KEY = 'token'
const USER_KEY = 'auth_user'
const REFRESH_TOKEN_KEY = 'refresh_token'
const TOKEN_EXPIRES_AT_KEY = 'token_expires_at'
const TOKEN_REFRESH_BUFFER_MS = 120 * 1000
const PENDING_OAUTH_SESSION_KEY = 'aicoderelay:pending-oauth-session'

type RunMode = 'standard' | 'simple'

export interface PendingOAuthSession {
  provider: 'linuxdo' | 'oidc' | 'wechat' | string
  redirect?: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY) || '',
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY) || '',
    tokenExpiresAt: Number(localStorage.getItem(TOKEN_EXPIRES_AT_KEY) || 0) || 0,
    user: readStoredUser(),
    runMode: 'standard' as RunMode,
    initialized: false,
    refreshTimer: 0 as ReturnType<typeof window.setTimeout> | 0,
    pendingOAuthSession: readPendingOAuthSession(),
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token && state.user),
    isAdmin: (state) => state.user?.role === 'admin',
    isSimpleMode: (state) => state.runMode === 'simple',
  },

  actions: {
    async initialize() {
      if (this.initialized) {
        return
      }

      this.initialized = true

      if (!this.token) {
        return
      }

      try {
        const user = await getCurrentUser()
        this.user = user
        this.runMode = user.run_mode || 'standard'
        persistUser(user)
        this.scheduleTokenRefresh()
      } catch {
        this.clearSession()
      }
    },

    async login(credentials: LoginRequest): Promise<LoginResponse> {
      const response = await login(credentials)

      if ('access_token' in response) {
        this.applyAuthResponse(response)
      }

      return response
    },

    async login2FA(tempToken: string, totpCode: string): Promise<AuthUser> {
      const response = await login2FA({
        temp_token: tempToken,
        totp_code: totpCode,
      } satisfies TotpLogin2FARequest)

      this.applyAuthResponse(response)
      return response.user
    },

    async register(payload: RegisterRequest): Promise<AuthUser> {
      const response = await register(payload)
      this.applyAuthResponse(response)
      return response.user
    },

    async setToken(accessToken: string, refreshTokenValue?: string, expiresIn?: number): Promise<AuthUser> {
      this.token = accessToken
      localStorage.setItem(TOKEN_KEY, accessToken)
      localStorage.setItem(LEGACY_TOKEN_KEY, accessToken)

      if (refreshTokenValue) {
        this.refreshToken = refreshTokenValue
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshTokenValue)
      }

      if (expiresIn) {
        this.tokenExpiresAt = Date.now() + expiresIn * 1000
        localStorage.setItem(TOKEN_EXPIRES_AT_KEY, String(this.tokenExpiresAt))
      }

      const user = await getCurrentUser()
      this.user = user
      this.runMode = user.run_mode || 'standard'
      persistUser(user)
      this.scheduleTokenRefresh()
      return user
    },

    setPendingOAuthSession(session: PendingOAuthSession) {
      this.pendingOAuthSession = session
      localStorage.setItem(PENDING_OAUTH_SESSION_KEY, JSON.stringify(session))
    },

    clearPendingOAuthSession() {
      this.pendingOAuthSession = null
      localStorage.removeItem(PENDING_OAUTH_SESSION_KEY)
    },

    async refreshCurrentUser() {
      if (!this.token) {
        throw new Error('Not authenticated')
      }

      const user = await getCurrentUser()
      this.user = user
      this.runMode = user.run_mode || 'standard'
      persistUser(user)
      return user
    },

    async refreshUser() {
      return this.refreshCurrentUser()
    },

    async logout() {
      const refreshTokenValue = this.refreshToken
      this.clearSession()
      await logoutRequest(refreshTokenValue || null)
    },

    clearSession() {
      this.clearRefreshTimer()
      this.token = ''
      this.refreshToken = ''
      this.tokenExpiresAt = 0
      this.user = null
      this.runMode = 'standard'
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(LEGACY_TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      localStorage.removeItem(TOKEN_EXPIRES_AT_KEY)
    },

    applyAuthResponse(response: AuthResponse) {
      this.token = response.access_token
      this.refreshToken = response.refresh_token || ''
      this.user = response.user
      this.runMode = response.user.run_mode || 'standard'
      localStorage.setItem(TOKEN_KEY, response.access_token)
      localStorage.setItem(LEGACY_TOKEN_KEY, response.access_token)
      persistUser(response.user)

      if (response.refresh_token) {
        localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token)
      } else {
        localStorage.removeItem(REFRESH_TOKEN_KEY)
      }

      if (response.expires_in) {
        this.tokenExpiresAt = Date.now() + response.expires_in * 1000
        localStorage.setItem(TOKEN_EXPIRES_AT_KEY, String(this.tokenExpiresAt))
      } else {
        this.tokenExpiresAt = 0
        localStorage.removeItem(TOKEN_EXPIRES_AT_KEY)
      }

      this.scheduleTokenRefresh()
    },

    scheduleTokenRefresh() {
      this.clearRefreshTimer()

      if (!this.refreshToken || !this.tokenExpiresAt) {
        return
      }

      const delay = Math.max(0, this.tokenExpiresAt - Date.now() - TOKEN_REFRESH_BUFFER_MS)
      this.refreshTimer = window.setTimeout(async () => {
        try {
          const response = await refreshTokenRequest(this.refreshToken)
          this.token = response.access_token
          this.refreshToken = response.refresh_token
          this.tokenExpiresAt = Date.now() + response.expires_in * 1000
          localStorage.setItem(TOKEN_KEY, response.access_token)
          localStorage.setItem(LEGACY_TOKEN_KEY, response.access_token)
          localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token)
          localStorage.setItem(TOKEN_EXPIRES_AT_KEY, String(this.tokenExpiresAt))
          this.scheduleTokenRefresh()
        } catch {
          this.clearSession()
        }
      }, delay)
    },

    clearRefreshTimer() {
      if (this.refreshTimer) {
        window.clearTimeout(this.refreshTimer)
        this.refreshTimer = 0
      }
    },
  },
})

function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    localStorage.removeItem(USER_KEY)
    return null
  }
}

function persistUser(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

function readPendingOAuthSession(): PendingOAuthSession | null {
  const raw = localStorage.getItem(PENDING_OAUTH_SESSION_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as PendingOAuthSession
  } catch {
    localStorage.removeItem(PENDING_OAUTH_SESSION_KEY)
    return null
  }
}
