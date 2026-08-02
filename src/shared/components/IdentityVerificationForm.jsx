export default function IdentityVerificationForm({ accountType, values, onChange, onSubmit, loading, error }) {
  const label = accountType === 'staff' ? 'Staff ID' : 'Student ID'
  const helper = accountType === 'staff' ? 'Staff identification number' : 'Student identification number'

  return (
    <form className="auth-form" onSubmit={onSubmit}>
      <div className="auth-field">
        <label htmlFor="identityValue" className="input-label">{label}</label>
        <input id="identityValue" name="identityValue" value={values.identityValue} onChange={onChange} required />
      </div>
      <div className="auth-field">
        <label htmlFor="token" className="input-label">Registration token</label>
        <input id="token" name="token" value={values.token} onChange={onChange} required />
      </div>
      <p className="field-helper">{helper}</p>
      {error ? <p className="auth-error">{error}</p> : null}
      <button type="submit" className="auth-submit" disabled={loading}>Continue</button>
    </form>
  )
}
