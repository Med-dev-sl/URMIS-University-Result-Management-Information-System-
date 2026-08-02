export default function AccountTypeSelector({ value, onChange, error }) {
  return (
    <div className="auth-field">
      <label htmlFor="account-type" className="input-label">Choose account type</label>
      <select id="account-type" name="accountType" value={value} onChange={onChange}>
        <option value="staff">Staff</option>
        <option value="student">Student</option>
      </select>
      {error ? <small className="auth-error">{error}</small> : null}
    </div>
  )
}
