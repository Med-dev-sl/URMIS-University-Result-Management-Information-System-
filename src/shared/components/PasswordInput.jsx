import { useState } from 'react'

export default function PasswordInput({ label, name, value, onChange, placeholder, autoComplete, required, error, hint }) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <label className="field-group">
      {label ? <span className="field-label">{label}</span> : null}
      <div className="password-field">
        <input
          className={`field-input ${error ? 'field-input-error' : ''}`}
          name={name}
          value={value}
          onChange={onChange}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
        />
        <button type="button" className="password-toggle" onClick={() => setShowPassword((current) => !current)}>
          {showPassword ? 'Hide' : 'Show'}
        </button>
      </div>
      {hint ? <small className="field-hint">{hint}</small> : null}
      {error ? <small className="field-error">{error}</small> : null}
    </label>
  )
}
