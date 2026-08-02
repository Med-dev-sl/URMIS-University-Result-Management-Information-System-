import { Router } from 'express'
import authService from '../../shared/services/authService.js'
import { requireAuth, requireRole } from '../../shared/middlewares/auth.js'

const router = Router()

router.post('/register', async (req, res) => {
  const { full_name, email, password, institutionId, role } = req.body

  if (!full_name || !email || !password) {
    return res.status(400).json({ message: 'full_name, email, and password are required' })
  }

  try {
    const result = await authService.register({ full_name, email, password, institutionId, role })
    return res.status(201).json(result)
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  const { user, reason } = await authService.verifyCredentials(email, password)
  if (!user) {
    if (reason === 'account_locked') {
      return res.status(423).json({ message: 'Account temporarily locked. Please try again later.' })
    }
    if (reason === 'account_pending_activation') {
      return res.status(403).json({ message: 'This account is pending activation. Please complete the activation steps first.' })
    }
    if (reason === 'email_not_verified') {
      return res.status(403).json({ message: 'Email verification is required before login.' })
    }
    return res.status(401).json({ message: 'Invalid email or password' })
  }

  const accessToken = authService.generateAccessToken(user)
  const refreshToken = authService.generateRefreshToken(user)
  await authService.saveRefreshToken(user.id, refreshToken)

  return res.json(authService.buildAuthResponse ? authService.buildAuthResponse(user, accessToken, refreshToken, res) : {
    user,
    accessToken,
    refreshToken,
  })
})

router.post('/activate/validate', async (req, res) => {
  const { universityId, accountType, identityValue, token } = req.body

  if (!universityId || !accountType || !identityValue || !token) {
    return res.status(400).json({ message: 'universityId, accountType, identityValue, and token are required.' })
  }

  try {
    const result = await authService.validateActivation({ universityId, accountType, identityValue, token })
    if (!result.success) {
      return res.status(400).json({ message: result.message })
    }

    return res.json(result)
  } catch (error) {
    return res.status(400).json({ message: error.message || 'Unable to validate activation request.' })
  }
})

router.post('/activate/provision', requireAuth, requireRole('admin', 'super_admin'), async (req, res) => {
  const { full_name, email, institutionId, role, accountType, identityValue, universityId } = req.body

  if (!full_name || !email || !institutionId) {
    return res.status(400).json({ message: 'full_name, email, and institutionId are required.' })
  }

  try {
    const result = await authService.provisionActivationAccount({
      full_name,
      email,
      institutionId,
      role,
      accountType,
      identityValue,
      universityId,
    })

    return res.status(201).json(result)
  } catch (error) {
    return res.status(400).json({ message: error.message || 'Unable to provision activation account.' })
  }
})

router.post('/activate/complete', async (req, res) => {
  const { userId, password } = req.body

  if (!userId || !password) {
    return res.status(400).json({ message: 'userId and password are required.' })
  }

  try {
    const result = await authService.completeActivation({ userId, password })
    if (!result.success) {
      return res.status(400).json({ message: result.message })
    }

    return res.json(result)
  } catch (error) {
    return res.status(400).json({ message: error.message || 'Unable to complete activation.' })
  }
})

router.post('/refresh', async (req, res) => {
  const refreshToken = req.body.refreshToken || authService.getTokenFromRequest(req, 'refresh')

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required' })
  }

  const result = await authService.refreshTokens(refreshToken)
  if (!result) {
    return res.status(401).json({ message: 'Invalid refresh token' })
  }

  return res.json({
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  })
})

router.post('/logout', requireAuth, async (req, res) => {
  const accessToken = authService.getTokenFromRequest(req, 'access')
  const refreshToken = authService.getTokenFromRequest(req, 'refresh')

  if (accessToken) {
    await authService.blacklistToken(req.user.id, accessToken, 'access')
  }
  if (refreshToken) {
    await authService.blacklistToken(req.user.id, refreshToken, 'refresh')
  }

  await authService.revokeRefreshToken(req.user.id)
  authService.clearAuthCookies(res)
  return res.status(204).send()
})

router.get('/me', requireAuth, async (req, res) => {
  const user = await authService.getUserById(req.user.id)
  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }

  return res.json({ user })
})

router.post('/verify-email', async (req, res) => {
  const { token } = req.body
  if (!token) {
    return res.status(400).json({ message: 'Verification token is required' })
  }

  const verified = await authService.verifyEmail(token)
  if (!verified) {
    return res.status(400).json({ message: 'Invalid or expired verification token' })
  }

  return res.json({ message: 'Email verified successfully' })
})

router.post('/resend-verification', async (req, res) => {
  const { email } = req.body
  if (!email) {
    return res.status(400).json({ message: 'Email is required' })
  }

  const result = await authService.resendVerification(email)
  if (!result) {
    return res.status(404).json({ message: 'User not found' })
  }

  return res.json({ message: 'Verification email re-sent', verificationToken: result.verificationToken })
})

router.post('/password-reset/request', async (req, res) => {
  const { email } = req.body
  if (!email) {
    return res.status(400).json({ message: 'Email is required' })
  }

  const result = await authService.requestPasswordReset(email)
  if (!result) {
    return res.status(404).json({ message: 'User not found' })
  }

  return res.json({ message: 'Password reset instructions sent', resetToken: result.resetToken })
})

router.post('/password-reset/confirm', async (req, res) => {
  const { token, password } = req.body
  if (!token || !password) {
    return res.status(400).json({ message: 'Token and password are required' })
  }

  const reset = await authService.resetPassword(token, password)
  if (!reset) {
    return res.status(400).json({ message: 'Invalid or expired reset token' })
  }

  return res.json({ message: 'Password updated successfully' })
})

export default router
