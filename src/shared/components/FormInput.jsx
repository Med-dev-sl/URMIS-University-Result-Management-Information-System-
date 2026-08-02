export default function FormInput({ label, name, value, onChange, type = 'text', placeholder, autoComplete, required, error, hint }) {
  return (
    <label className="field-group">
      {label ? <span className="field-label">{label}</span> : null}
      <input
        className={`field-input ${error ? 'field-input-error' : ''}`}
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
      />
      {hint ? <small className="field-hint">{hint}</small> : null}
      {error ? <small className="field-error">{error}</small> : null}
    </label>
  )
}
