const STORAGE_KEYS = {
  accessToken: 'urmis_access_token',
  refreshToken: 'urmis_refresh_token',
  user: 'urmis_user',
  rememberMe: 'urmis_remember_me',
}

export function getStoredSession() {
  if (typeof window === 'undefined') return null

  let accessToken = window.localStorage.getItem(STORAGE_KEYS.accessToken)
  let refreshToken = window.localStorage.getItem(STORAGE_KEYS.refreshToken)
  let user = window.localStorage.getItem(STORAGE_KEYS.user)

  if (!accessToken || !user) {
    accessToken = window.sessionStorage.getItem(STORAGE_KEYS.accessToken)
    refreshToken = window.sessionStorage.getItem(STORAGE_KEYS.refreshToken)
    user = window.sessionStorage.getItem(STORAGE_KEYS.user)
  }

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
