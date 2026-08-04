import { useMemo, useState } from 'react'
import AuthLayout from '../layouts/AuthLayout.jsx'
import AuthCard from '../shared/components/AuthCard.jsx'
import FormInput from '../shared/components/FormInput.jsx'
import LoadingButton from '../shared/components/LoadingButton.jsx'
import PasswordInput from '../shared/components/PasswordInput.jsx'
import OtpInput from '../shared/components/OtpInput.jsx'
import UniversitySelector from '../shared/components/UniversitySelector.jsx'
import AccountTypeSelector from '../shared/components/AccountTypeSelector.jsx'
import IdentityVerificationForm from '../shared/components/IdentityVerificationForm.jsx'
import PasswordForm from '../shared/components/PasswordForm.jsx'
import { calculatePasswordStrength, getPasswordStrengthLabel } from '../auth/authService.js'
import { getMockUniversities } from '../shared/services/authMockService.js'
import { useAuth } from '../auth/useAuth.js'
import { authApi } from '../services/authApi.js'

const modeMeta = {
  login: {
    title: 'Welcome back',
    subtitle: 'Sign in to continue managing results and academic records.',
    submitLabel: 'Sign in',
    switchLabel: 'Create a university account',
    switchTo: 'register',
  },
  register: {
    title: 'Create your university account',
    subtitle: 'Set up a secure institutional account with your university, role, and verification details.',
    submitLabel: 'Create account',
    switchLabel: 'Already have an account?',
    switchTo: 'login',
  },
  activate: {
    title: 'Activate your account',
    subtitle: 'Complete your pre-provisioned university account setup securely.',
    submitLabel: 'Continue',
    switchLabel: 'Back to sign in',
    switchTo: 'login',
  },
  'forgot-password': {
    title: 'Password recovery',
    subtitle: 'Enter your email to receive a reset link.',
    submitLabel: 'Send reset link',
    switchLabel: 'Back to sign in',
    switchTo: 'login',
  },
  'reset-password': {
    title: 'Set a new password',
    subtitle: 'Choose a strong password to secure your account.',
    submitLabel: 'Reset password',
    switchLabel: 'Return to sign in',
    switchTo: 'login',
  },
  'verify-email': {
    title: 'Verify your email',
    subtitle: 'Use the confirmation link or code we sent you.',
    submitLabel: 'Verify email',
    switchLabel: 'Resend code',
    switchTo: 'forgot-password',
  },
  otp: {
    title: 'Two-step verification',
    subtitle: 'Enter the one-time code from your authenticator app.',
    submitLabel: 'Confirm code',
    switchLabel: 'Use another method',
    switchTo: 'login',
  },
  'session-expired': {
    title: 'Session expired',
    subtitle: 'Your session has ended for security reasons. Sign in again to continue.',
    submitLabel: 'Sign in again',
    switchLabel: 'Back to dashboard',
    switchTo: 'login',
  },
  unauthorized: {
    title: 'Access restricted',
    subtitle: 'You do not have the permission required for this area.',
    submitLabel: 'Back to dashboard',
    switchLabel: 'Sign out',
    switchTo: 'login',
  },
  'not-found': {
    title: 'Page not found',
    subtitle: 'The page you requested does not exist or may have moved.',
    submitLabel: 'Return home',
    switchLabel: 'Go to sign in',
    switchTo: 'login',
  },
}

export default function AuthenticationView({ mode = 'login', onModeChange, onAuthenticated }) {
  const { signIn, setSessionExpired } = useAuth()
  const [form, setForm] = useState({
    email: 'admin@greenfield.edu',
    password: 'Admin@123',
    fullName: '',
    confirmPassword: '',
    rememberMe: true,
    otp: '',
    universityId: 'greenfield',
    accountType: 'student',
    identityValue: 'STU-1001',
    token: 'TOKEN-1002',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [activationStep, setActivationStep] = useState('university')
  const [activationSession, setActivationSession] = useState(null)
  const universities = useMemo(() => getMockUniversities(), [])

  const meta = modeMeta[mode] || modeMeta.login
  const passwordStrength = useMemo(() => calculatePasswordStrength(form.password), [form.password])
  const passwordStrengthLabel = getPasswordStrengthLabel(form.password)
  const isSetupMode = mode === 'register' || mode === 'activate'

  const handleModeSwitch = (nextMode) => {
    if (nextMode === 'login') {
      onModeChange?.('login')
      return
    }

    onModeChange?.(nextMode)
  }

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (mode === 'login') {
        if (!form.email || !form.password) {
          throw new Error('Please enter your email and password.')
        }
        await signIn({ email: form.email, password: form.password, rememberMe: form.rememberMe })
        setMessage('Signed in successfully.')
        onAuthenticated?.()
        return
      }

      if (mode === 'register') {
        if (!form.fullName || !form.email || !form.password) {
          throw new Error('Please provide your full name, email, and password.')
        }
        if (form.password !== form.confirmPassword) {
          throw new Error('Passwords do not match.')
        }

        const body = await authApi.register({
          full_name: form.fullName,
          email: form.email,
          password: form.password,
          role: 'student',
        })

        setMessage(body.verificationToken ? 'Account created. Please verify your email to continue.' : 'Account created. You can now sign in.')
        onModeChange?.('login')
        return
      }

      if (mode === 'forgot-password') {
        setMessage('A reset link has been prepared for your inbox.')
        onModeChange?.('reset-password')
        return
      }

      if (mode === 'reset-password') {
        if (form.password !== form.confirmPassword) {
          throw new Error('Passwords do not match.')
        }
        setMessage('Password reset successfully. You can continue to sign in.')
        onModeChange?.('login')
        return
      }

      if (mode === 'otp' || mode === 'verify-email') {
        setMessage('Verification complete. You can continue.')
        onModeChange?.('login')
        return
      }

      if (mode === 'session-expired') {
        setSessionExpired(true)
        onModeChange?.('login')
        return
      }

      if (mode === 'unauthorized') {
        onAuthenticated?.()
        return
      }

      onAuthenticated?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleActivationStep = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (activationStep === 'university') {
        if (!form.universityId) {
          throw new Error('Select a university to continue.')
        }
        setActivationStep('account-type')
        return
      }

      if (activationStep === 'account-type') {
        if (!form.accountType) {
          throw new Error('Choose whether you are a student or staff member.')
        }
        setActivationStep('identity')
        return
      }

      if (activationStep === 'identity') {
        const body = await authApi.activateValidate({
          universityId: form.universityId,
          accountType: form.accountType,
          identityValue: form.identityValue,
          token: form.token,
        })

        setActivationSession(body.session)
        setActivationStep('profile')
        return
      }

      if (activationStep === 'profile') {
        setActivationStep('password')
        return
      }

      if (activationStep === 'password') {
        if (!form.password || form.password !== form.confirmPassword) {
          throw new Error('Please choose a matching password.')
        }

        const body = await authApi.activateComplete({ userId: activationSession?.userId, password: form.password })

        setMessage(body.message || 'Account activation completed successfully.')
        setActivationStep('complete')
        setTimeout(() => {
          onModeChange?.('login')
        }, 800)
        return
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const activationTitle = activationStep === 'university' ? 'Select your university' : activationStep === 'account-type' ? 'Choose account type' : activationStep === 'identity' ? 'Verify your identity' : activationStep === 'profile' ? 'Review your profile' : activationStep === 'password' ? 'Choose a password' : 'Activation complete'
  const activationSubtitle = activationStep === 'university' ? 'Start by choosing the university that issued your account.' : activationStep === 'account-type' ? 'Tell us whether this is a student or staff account.' : activationStep === 'identity' ? 'Enter the verified identifier and token issued to you.' : activationStep === 'profile' ? 'Confirm your institutional details before completing activation.' : activationStep === 'password' ? 'Set a password for your secured account access.' : 'Your pre-provisioned account is ready to access URMIS.'

  const renderActivationFlow = () => (
    <AuthCard title={activationTitle} subtitle={activationSubtitle} icon={<span className="brand-mark auth-brand">A</span>}>
      {message ? <div className="auth-message success">{message}</div> : null}
      {error ? <div className="auth-message error">{error}</div> : null}

      {activationStep === 'university' ? (
        <UniversitySelector
          options={universities}
          value={form.universityId}
          onChange={(event) => setForm((current) => ({ ...current, universityId: event.target.value }))}
        />
      ) : null}

      {activationStep === 'account-type' ? (
        <AccountTypeSelector
          value={form.accountType}
          onChange={(event) => setForm((current) => ({ ...current, accountType: event.target.value }))}
        />
      ) : null}

      {activationStep === 'identity' ? (
        <IdentityVerificationForm
          accountType={form.accountType}
          values={{ identityValue: form.identityValue, token: form.token }}
          onChange={(event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))}
          onSubmit={handleActivationStep}
          loading={loading}
          error={error}
        />
      ) : null}

      {activationStep === 'profile' && activationSession ? (
        <div className="strength-card">
          <strong>{activationSession.profile?.name}</strong>
          <p>{activationSession.profile?.university}</p>
          <p>{activationSession.profile?.faculty} • {activationSession.profile?.department || activationSession.profile?.programme}</p>
          <p>{activationSession.profile?.universityEmail}</p>
        </div>
      ) : null}

      {activationStep === 'password' ? (
        <PasswordForm
          values={{ password: form.password, confirmPassword: form.confirmPassword }}
          onChange={(event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))}
          onSubmit={handleActivationStep}
          loading={loading}
          error={error}
          success={message}
        />
      ) : null}

      {activationStep === 'complete' ? (
        <div className="strength-card">
          <strong>Activation ready</strong>
          <p>Use the sign-in form to enter your university email and the password you just created.</p>
        </div>
      ) : null}

      {activationStep !== 'identity' && activationStep !== 'password' && activationStep !== 'complete' ? (
        <LoadingButton loading={loading} type="button" onClick={handleActivationStep}>{activationStep === 'profile' ? 'Continue' : 'Continue'}</LoadingButton>
      ) : null}
    </AuthCard>
  )

  if (isSetupMode) {
    return (
      <AuthLayout title={meta.title} subtitle={meta.subtitle} footer={
        <button className="link-button" type="button" onClick={() => handleModeSwitch('login')}>
          {meta.switchLabel}
        </button>
      }>
        {renderActivationFlow()}
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title={meta.title} subtitle={meta.subtitle} footer={
      <button className="link-button" type="button" onClick={() => handleModeSwitch(meta.switchTo)}>
        {meta.switchLabel}
      </button>
    }>
      <form className="auth-form" onSubmit={handleSubmit}>
        {message ? <div className="auth-message success">{message}</div> : null}
        {error ? <div className="auth-message error">{error}</div> : null}

        {mode === 'register' ? (
          <FormInput label="Full name" name="fullName" value={form.fullName} onChange={handleChange} placeholder="Ada Lovelace" autoComplete="name" required />
        ) : null}

        <FormInput label="Email" name="email" value={form.email} onChange={handleChange} type="email" placeholder="you@urmis.edu" autoComplete="email" required />

        {(mode === 'login' || mode === 'register' || mode === 'reset-password') ? (
          <>
            <PasswordInput label="Password" name="password" value={form.password} onChange={handleChange} placeholder="Enter password" autoComplete="current-password" required />
            {mode === 'register' || mode === 'reset-password' ? (
              <>
                <PasswordInput label="Confirm password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm password" autoComplete="new-password" required />
                <div className="strength-card">
                  <div className="strength-row">
                    <span>Password strength</span>
                    <strong>{passwordStrengthLabel}</strong>
                  </div>
                  <div className="strength-bar"><span style={{ width: `${Math.min(100, passwordStrength.score * 25)}%` }} /></div>
                  <small>{passwordStrength.checks.join(', ') || 'Add more characters'}</small>
                </div>
              </>
            ) : null}
          </>
        ) : null}

        {mode === 'otp' || mode === 'verify-email' ? (
          <div className="otp-card">
            <OtpInput value={form.otp} onChange={(value) => setForm((current) => ({ ...current, otp: value }))} />
          </div>
        ) : null}

        {mode === 'login' ? (
          <label className="checkbox-row">
            <input type="checkbox" name="rememberMe" checked={form.rememberMe} onChange={handleChange} />
            <span>Remember me</span>
          </label>
        ) : null}

        <LoadingButton loading={loading} type="submit">{meta.submitLabel}</LoadingButton>
      </form>
    </AuthLayout>
  )
}
