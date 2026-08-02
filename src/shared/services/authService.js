const STORAGE_KEYS = {
  accessToken: 'urmis_access_token',
  refreshToken: 'urmis_refresh_token',
  user: 'urmis_user',
  rememberMe: 'urmis_remember_me',
}

export function calculatePasswordStrength(password) {
  let score = 0

  if (!password) {
    return { score: 0, label: 'Empty', checks: [] }
  }

  const checks = []
  if (password.length >= 8) {
    score += 1
    checks.push('length')
  }
  if (/[A-Z]/.test(password)) {
    score += 1
    checks.push('uppercase')
  }
  if (/[0-9]/.test(password)) {
    score += 1
    checks.push('number')
  }
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1
    checks.push('symbol')
  }

  let label = 'Weak'
  if (score >= 3) label = 'Good'
  if (score >= 4) label = 'Strong'

  return { score, label, checks }
}

export function getPasswordStrengthLabel(password) {
  return calculatePasswordStrength(password).label
}

export function getStoredSession() {
  if (typeof window === 'undefined') return null
  const accessToken = window.localStorage.getItem(STORAGE_KEYS.accessToken)
  const refreshToken = window.localStorage.getItem(STORAGE_KEYS.refreshToken)
  const user = window.localStorage.getItem(STORAGE_KEYS.user)

  if (!accessToken || !user) return null

  return {
    accessToken,
    refreshToken,
    user: JSON.parse(user),
  }
}

export function persistSession(session, rememberMe = false) {
  if (typeof window === 'undefined') return
  const storage = rememberMe ? window.localStorage : window.sessionStorage
  storage.setItem(STORAGE_KEYS.accessToken, session.accessToken)
  storage.setItem(STORAGE_KEYS.refreshToken, session.refreshToken || '')
  storage.setItem(STORAGE_KEYS.user, JSON.stringify(session.user))
  window.localStorage.setItem(STORAGE_KEYS.rememberMe, rememberMe ? '1' : '0')
}

export function clearSession() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEYS.accessToken)
  window.localStorage.removeItem(STORAGE_KEYS.refreshToken)
  window.localStorage.removeItem(STORAGE_KEYS.user)
  window.localStorage.removeItem(STORAGE_KEYS.rememberMe)
  window.sessionStorage.removeItem(STORAGE_KEYS.accessToken)
  window.sessionStorage.removeItem(STORAGE_KEYS.refreshToken)
  window.sessionStorage.removeItem(STORAGE_KEYS.user)
}

export function getRememberMePreference() {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(STORAGE_KEYS.rememberMe) === '1'
}

export function buildAuthPayload(payload) {
  return payload
}
