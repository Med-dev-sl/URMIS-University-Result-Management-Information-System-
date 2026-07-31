export default function Modal({ visible, type, message, onClose }) {
  if (!visible) return null

  return (
    <div className={`modal-overlay ${type}`} role="dialog" aria-modal="true">
      <div className="modal-card">
        <strong>{type === 'success' ? 'Success' : 'Error'}</strong>
        <p>{message}</p>
        <button type="button" className="primary-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}
