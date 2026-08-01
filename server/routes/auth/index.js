import { Router } from 'express'
import authService from '../../shared/services/authService.js'
import { requireAuth } from '../../shared/middlewares/auth.js'

const router = Router()

router.post('/register', async (req, res) => {
  const { full_name, email, password, institutionId, role } = req.body

  if (!full_name || !email || !password) {
    return res.status(400).json({ message: 'full_name, email, and password are required' })
  }

  try {
    const user = await authService.register({ full_name, email, password, institutionId, role })
    const accessToken = authService.generateAccessToken(user)
    const refreshToken = authService.generateRefreshToken(user)

    await authService.saveRefreshToken(user.id, refreshToken)

    return res.status(201).json({
      user,
      accessToken,
      refreshToken,
    })
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  const user = await authService.verifyCredentials(email, password)
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' })
  }

  const accessToken = authService.generateAccessToken(user)
  const refreshToken = authService.generateRefreshToken(user)
  await authService.saveRefreshToken(user.id, refreshToken)

  return res.json({
    user,
    accessToken,
    refreshToken,
  })
})

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required' })
  }

  const user = await authService.refreshTokens(refreshToken)
  if (!user) {
    return res.status(401).json({ message: 'Invalid refresh token' })
  }

  const accessToken = authService.generateAccessToken(user)
  const newRefreshToken = authService.generateRefreshToken(user)

  await authService.saveRefreshToken(user.id, newRefreshToken)

  return res.json({
    accessToken,
    refreshToken: newRefreshToken,
  })
})

router.post('/logout', requireAuth, async (req, res) => {
  await authService.revokeRefreshToken(req.user.id)
  return res.status(204).send()
})

router.get('/me', requireAuth, async (req, res) => {
  const user = await authService.getUserById(req.user.id)
  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }

  return res.json({ user })
})

export default router
