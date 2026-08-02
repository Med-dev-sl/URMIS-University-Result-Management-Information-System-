export default function PasswordForm({ values, onChange, onSubmit, loading, error, success }) {
  return (
    <form className="auth-form" onSubmit={onSubmit}>
      <div className="auth-field">
        <label htmlFor="password" className="input-label">Password</label>
        <input id="password" name="password" type="password" value={values.password} onChange={onChange} required />
      </div>
      <div className="auth-field">
        <label htmlFor="confirmPassword" className="input-label">Confirm password</label>
        <input id="confirmPassword" name="confirmPassword" type="password" value={values.confirmPassword} onChange={onChange} required />
      </div>
      {error ? <p className="auth-error">{error}</p> : null}
      {success ? <p className="auth-message success">{success}</p> : null}
      <button type="submit" className="auth-submit" disabled={loading}>Complete activation</button>
    </form>
  )
}
