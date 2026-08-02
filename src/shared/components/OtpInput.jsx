export default function OtpInput({ value, onChange, length = 6 }) {
  const digits = Array.from({ length }, (_, index) => value[index] ?? '')

  const onDigitChange = (index, nextValue) => {
    const sanitized = nextValue.replace(/\D/g, '').slice(0, 1)
    const next = value.split('')
    next[index] = sanitized
    onChange(next.join('').slice(0, length))
  }

  return (
    <div className="otp-grid">
      {digits.map((digit, index) => (
        <input
          key={index}
          className="otp-input"
          inputMode="numeric"
          maxLength="1"
          value={digit}
          onChange={(event) => onDigitChange(index, event.target.value)}
        />
      ))}
    </div>
  )
}
