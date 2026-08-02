export default function LoadingButton({ loading, children, type = 'button', ...props }) {
  return (
    <button className="primary-button auth-button" type={type} disabled={loading} {...props}>
      {loading ? 'Working…' : children}
    </button>
  )
}
