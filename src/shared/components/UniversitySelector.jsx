export default function UniversitySelector({ value, onChange, options = [], error }) {
  return (
    <div className="auth-field">
      <label htmlFor="university" className="input-label">Select university</label>
      <select id="university" name="universityId" value={value} onChange={onChange}>
        {options.map((option) => (
          <option key={option.id} value={option.id}>{option.name}</option>
        ))}
      </select>
      {error ? <small className="auth-error">{error}</small> : null}
    </div>
  )
}
