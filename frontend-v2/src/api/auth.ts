import { apiClient } from './client'

export interface PublicSettings {
  site_name?: string
  site_logo?: string
  site_subtitle?: string
  version?: string
  contact_info?: string
  api_base_url?: string
  doc_url?: string
  registration_enabled?: boolean
  email_verify_enabled?: boolean
  force_email_on_third_party_signup?: boolean
  registration_email_suffix_whitelist?: string[]
  promo_code_enabled?: boolean
  invitation_code_enabled?: boolean
  turnstile_enabled: boolean
  turnstile_site_key: string
  linuxdo_oauth_enabled: boolean
  wechat_oauth_enabled: boolean
  wechat_oauth_open_enabled?: boolean
  wechat_oauth_mp_enabled?: boolean
  wechat_oauth_mobile_enabled?: boolean
  oidc_oauth_enabled: boolean
  oidc_oauth_provider_name: string
  backend_mode_enabled: boolean
  password_reset_enabled: boolean
}

export interface AuthUser {
  id: number
  username: string
  email: string
  role: 'admin' | 'user'
  balance?: number
  concurrency?: number
  status?: 'active' | 'disabled'
  run_mode?: 'standard' | 'simple'
}

export interface LoginRequest {
  email: string
  password: string
  turnstile_token?: string
}

export interface RegisterRequest {
  email: string
  password: string
  verify_code?: string
  turnstile_token?: string
  promo_code?: string
  invitation_code?: string
}

export interface SendVerifyCodeRequest {
  email: string
  turnstile_token?: string
}

export interface SendVerifyCodeResponse {
  message: string
  countdown: number
}

export interface ValidatePromoCodeResponse {
  valid: boolean
  bonus_amount?: number
  error_code?: string
  message?: string
}

export interface ValidateInvitationCodeResponse {
  valid: boolean
  error_code?: string
}

export interface ForgotPasswordRequest {
  email: string
  turnstile_token?: string
}

export interface ForgotPasswordResponse {
  message: string
}

export interface ResetPasswordRequest {
  email: string
  token: string
  new_password: string
}

export interface ResetPasswordResponse {
  message: string
}

export interface TotpLoginResponse {
  requires_2fa: true
  temp_token?: string
  user_email_masked?: string
}

export interface TotpLogin2FARequest {
  temp_token: string
  totp_code: string
}

export interface AuthResponse {
  access_token: string
  refresh_token?: string
  expires_in?: number
  token_type: string
  user: AuthUser
}

export type LoginResponse = AuthResponse | TotpLoginResponse

export interface RefreshTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
}

export interface OAuthAdoptionDecision {
  adopt_display_name?: boolean
  adopt_avatar?: boolean
}

export interface OAuthCompletionResponse {
  auth_result?: string
  access_token?: string
  refresh_token?: string
  expires_in?: number
  token_type?: string
  redirect?: string
  error?: string
  message?: string
  provider?: string
  intent?: string
  step?: string
  email?: string
  resolved_email?: string
  pending_email?: string
  existing_account_email?: string
  suggested_email?: string
  adoption_required?: boolean
  suggested_display_name?: string
  suggested_avatar_url?: string
  requires_2fa?: boolean
  temp_token?: string
  user_email_masked?: string
}

export interface PendingOAuthCreateAccountRequest extends OAuthAdoptionDecision {
  email: string
  password: string
  verify_code?: string
  invitation_code?: string
}

export interface PendingOAuthBindLoginRequest extends OAuthAdoptionDecision {
  email: string
  password: string
}

export function isTotp2FARequired(response: LoginResponse): response is TotpLoginResponse {
  return 'requires_2fa' in response && response.requires_2fa === true
}

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', request)
  return data
}

export async function register(request: RegisterRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', request)
  return data
}

export async function login2FA(request: TotpLogin2FARequest): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login/2fa', request)
  return data
}

export async function getCurrentUser(): Promise<AuthUser> {
  const { data } = await apiClient.get<AuthUser>('/auth/me')
  return data
}

export async function getPublicSettings(): Promise<PublicSettings> {
  const { data } = await apiClient.get<PublicSettings>('/settings/public')
  return data
}

export async function sendVerifyCode(request: SendVerifyCodeRequest): Promise<SendVerifyCodeResponse> {
  const { data } = await apiClient.post<SendVerifyCodeResponse>('/auth/send-verify-code', request)
  return data
}

export async function validatePromoCode(code: string): Promise<ValidatePromoCodeResponse> {
  const { data } = await apiClient.post<ValidatePromoCodeResponse>('/auth/validate-promo-code', { code })
  return data
}

export async function validateInvitationCode(code: string): Promise<ValidateInvitationCodeResponse> {
  const { data } = await apiClient.post<ValidateInvitationCodeResponse>('/auth/validate-invitation-code', { code })
  return data
}

export async function forgotPassword(request: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
  const { data } = await apiClient.post<ForgotPasswordResponse>('/auth/forgot-password', request)
  return data
}

export async function resetPassword(request: ResetPasswordRequest): Promise<ResetPasswordResponse> {
  const { data } = await apiClient.post<ResetPasswordResponse>('/auth/reset-password', request)
  return data
}

export async function exchangePendingOAuthCompletion(
  decision: OAuthAdoptionDecision = {},
): Promise<OAuthCompletionResponse> {
  const { data } = await apiClient.post<OAuthCompletionResponse>('/auth/oauth/pending/exchange', decision)
  return data
}

export async function completeOAuthRegistration(
  provider: 'linuxdo' | 'oidc' | 'wechat',
  invitationCode: string,
  decision: OAuthAdoptionDecision = {},
): Promise<OAuthCompletionResponse> {
  const { data } = await apiClient.post<OAuthCompletionResponse>(`/auth/oauth/${provider}/complete-registration`, {
    invitation_code: invitationCode,
    ...decision,
  })
  return data
}

export async function createPendingOAuthAccount(
  request: PendingOAuthCreateAccountRequest,
): Promise<OAuthCompletionResponse> {
  const { data } = await apiClient.post<OAuthCompletionResponse>('/auth/oauth/pending/create-account', request)
  return data
}

export async function bindPendingOAuthLogin(
  request: PendingOAuthBindLoginRequest,
): Promise<OAuthCompletionResponse> {
  const { data } = await apiClient.post<OAuthCompletionResponse>('/auth/oauth/pending/bind-login', request)
  return data
}

export async function prepareOAuthBindAccessTokenCookie(): Promise<void> {
  await apiClient.post('/auth/oauth/bind-token')
}

export async function logout(refreshToken?: string | null): Promise<void> {
  if (!refreshToken) {
    return
  }

  try {
    await apiClient.post('/auth/logout', { refresh_token: refreshToken })
  } catch {
    // Ignore server-side revoke failures and still clear local session.
  }
}

export async function refreshToken(refreshTokenValue: string): Promise<RefreshTokenResponse> {
  const { data } = await apiClient.post<RefreshTokenResponse>('/auth/refresh', {
    refresh_token: refreshTokenValue,
  })
  return data
}

export function resolveWeChatOAuthStart(
  settings: Pick<
    PublicSettings,
    'wechat_oauth_enabled' | 'wechat_oauth_open_enabled' | 'wechat_oauth_mp_enabled'
  >,
  userAgent?: string,
): { mode: 'open' | 'mp' | null; reason: 'not_configured' | 'external_browser_required' | 'wechat_browser_required' | null } {
  const normalizedUserAgent =
    (userAgent ?? (typeof navigator !== 'undefined' ? navigator.userAgent : '') ?? '').trim()
  const isWeChatBrowser = /MicroMessenger/i.test(normalizedUserAgent)
  const legacyEnabled = settings.wechat_oauth_enabled ?? false
  const openEnabled =
    typeof settings.wechat_oauth_open_enabled === 'boolean'
      ? settings.wechat_oauth_open_enabled
      : legacyEnabled
  const mpEnabled =
    typeof settings.wechat_oauth_mp_enabled === 'boolean'
      ? settings.wechat_oauth_mp_enabled
      : legacyEnabled

  if (isWeChatBrowser) {
    if (mpEnabled) {
      return { mode: 'mp', reason: null }
    }
    if (openEnabled) {
      return { mode: null, reason: 'external_browser_required' }
    }
    return { mode: null, reason: 'not_configured' }
  }

  if (openEnabled) {
    return { mode: 'open', reason: null }
  }
  if (mpEnabled) {
    return { mode: null, reason: 'wechat_browser_required' }
  }

  return { mode: null, reason: 'not_configured' }
}
