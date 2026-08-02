import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { clearSession, getStoredSession, persistSession } from '../../services/storage.js'
import { getRolePermissions } from '../../permissions/roles.js'

const AuthContext = createContext(null)

function normalizeUser(user, accessToken) {
  const role = user?.role || 'student'
  const permissions = Array.isArray(user?.permissions) && user.permissions.length > 0
    ? user.permissions
    : getRolePermissions(role)

  return {
    ...user,
    role,
    permissions,
    token: accessToken || user?.token || null,
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = getStoredSession()
    return stored?.user ? normalizeUser(stored.user, stored.accessToken) : null
  })
  const [loading, setLoading] = useState(() => !getStoredSession())
  const [sessionExpired, setSessionExpired] = useState(false)

  const signIn = useCallback(async ({ email, password, rememberMe }) => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const body = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(body.message || 'Invalid email or password')
      }

      const normalizedUser = normalizeUser({ ...body.user, token: body.accessToken }, body.accessToken)
      const session = {
        accessToken: body.accessToken,
        refreshToken: body.refreshToken,
        user: normalizedUser,
      }

      persistSession(session, rememberMe)
      setUser(normalizedUser)
      setSessionExpired(false)
      return session
    } finally {
      setLoading(false)
    }
  }, [])

  const signOut = useCallback(() => {
    clearSession()
    setUser(null)
    setSessionExpired(false)
    setLoading(false)
  }, [])

  const refreshSession = useCallback(async () => {
    const stored = getStoredSession()
    if (!stored?.user) {
      throw new Error('Session expired')
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: stored.refreshToken }),
      })

      const body = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(body.message || 'Session expired')
      }

      const refreshed = {
        accessToken: body.accessToken,
        refreshToken: body.refreshToken,
        user: normalizeUser({ ...body.user, token: body.accessToken }, body.accessToken),
      }
      persistSession(refreshed, true)
      setUser(refreshed.user)
      setSessionExpired(false)
      return refreshed
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!user) {
      return
    }

    const stored = getStoredSession()
    if (!stored?.user) {
      return
    }

    let active = true
    const timeoutId = window.setTimeout(() => {
      refreshSession().catch(() => {
        if (!active) {
          return
        }
        clearSession()
        setUser(null)
        setSessionExpired(true)
      })
    }, 0)

    return () => {
      active = false
      window.clearTimeout(timeoutId)
    }
  }, [refreshSession, user])

  const value = useMemo(() => ({
    user,
    loading,
    sessionExpired,
    setSessionExpired,
    signIn,
    signOut,
    refreshSession,
    permissions: user?.permissions || [],
  }), [user, loading, sessionExpired, signIn, signOut, refreshSession])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext }
