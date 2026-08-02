import { useMemo } from 'react'

export default function CrudManager({
  title,
  description,
  stats = [],
  items = [],
  columns = [],
  searchValue = '',
  onSearchChange,
  filterValue = 'all',
  onFilterChange,
  filterOptions = [],
  selectedItem = null,
  onSelectItem,
  onCreate,
  onEdit,
  onDelete,
  formFields = [],
  formState = {},
  onFormChange,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  saving = false,
  error = '',
  emptyMessage = 'No records found.',
  detailRenderer = null,
  showForm = false,
  showConfirmDelete = false,
  confirmTitle = 'Confirm deletion',
  confirmMessage = 'This action cannot be undone.',
  onConfirmDelete,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  pageLabel = 'Page',
  readOnly = false,
}) {
  const visibleColumns = useMemo(() => columns.filter(Boolean), [columns])

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h3>{title}</h3>
          <p className="field-hint">{description}</p>
        </div>
        {!readOnly ? (
          <button className="primary-button" type="button" onClick={onCreate}>
            Add new
          </button>
        ) : null}
      </div>

      {stats.length ? (
        <div className="stats-grid">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
              <div className="field-hint">{stat.detail}</div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="topbar-actions" style={{ marginBottom: '16px', flexWrap: 'wrap' }}>
        <input
          className="field-input"
          placeholder="Search records"
          value={searchValue}
          onChange={(event) => onSearchChange?.(event.target.value)}
          style={{ maxWidth: '280px' }}
        />
        {filterOptions.length ? (
          <select className="field-input" value={filterValue} onChange={(event) => onFilterChange?.(event.target.value)} style={{ maxWidth: '200px' }}>
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      {error ? <div className="alert">{error}</div> : null}

      <div className="content-grid">
        <div className="panel">
          <div className="panel-header">
            <h4>Records</h4>
            <span className="field-hint">{items.length} shown</span>
          </div>
          {items.length ? (
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {visibleColumns.map((column) => (
                      <th key={column.key} style={{ textAlign: 'left', padding: '10px 8px', borderBottom: '1px solid #e2e8f0' }}>{column.label}</th>
                    ))}
                    <th style={{ textAlign: 'right', padding: '10px 8px', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id ?? item.key ?? JSON.stringify(item)}>
                      {visibleColumns.map((column) => (
                        <td key={`${item.id ?? item.key ?? JSON.stringify(item)}-${column.key}`} style={{ padding: '10px 8px', borderBottom: '1px solid #f1f5f9' }}>
                          {column.render ? column.render(item) : item[column.key] ?? '—'}
                        </td>
                      ))}
                      <td style={{ padding: '10px 8px', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>
                        <div className="topbar-actions">
                          <button className="link-button" type="button" onClick={() => onSelectItem?.(item)}>View</button>
                          {!readOnly ? (
                            <>
                              <button className="link-button" type="button" onClick={() => onEdit?.(item)}>Edit</button>
                              <button className="link-button" type="button" onClick={() => onDelete?.(item)}>Delete</button>
                            </>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="topbar-actions" style={{ marginTop: '16px' }}>
                <button className="secondary-button" type="button" disabled={currentPage <= 1} onClick={() => onPageChange?.(currentPage - 1)}>Previous</button>
                <span className="field-hint">{pageLabel} {currentPage} / {totalPages}</span>
                <button className="secondary-button" type="button" disabled={currentPage >= totalPages} onClick={() => onPageChange?.(currentPage + 1)}>Next</button>
              </div>
            </>
          ) : (
            <div className="loading-card">{emptyMessage}</div>
          )}
        </div>

        {selectedItem ? (
          <div className="panel">
            <div className="panel-header">
              <h4>Details</h4>
            </div>
            {detailRenderer ? detailRenderer(selectedItem) : (
              <div className="tab-panel">
                <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{JSON.stringify(selectedItem, null, 2)}</pre>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {showForm ? (
        <div className="modal-overlay">
          <div className="modal-card" style={{ width: 'min(720px, calc(100% - 32px))', textAlign: 'left' }}>
            <div className="panel-header">
              <h3>{formFields.some((field) => field.defaultValue !== undefined) ? 'Edit item' : 'Create item'}</h3>
            </div>
            <form className="auth-form" onSubmit={onSubmit}>
              {formFields.map((field) => (
                <label key={field.name} className="field-group">
                  <span className="field-label">{field.label}</span>
                  {field.type === 'select' ? (
                    <select className="field-input" value={formState[field.name] ?? ''} onChange={(event) => onFormChange?.(field.name, event.target.value)}>
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea className="field-input" rows={4} value={formState[field.name] ?? ''} onChange={(event) => onFormChange?.(field.name, event.target.value)} />
                  ) : field.type === 'date' ? (
                    <input className="field-input" type="date" value={formState[field.name] ?? ''} onChange={(event) => onFormChange?.(field.name, event.target.value)} />
                  ) : field.type === 'number' ? (
                    <input className="field-input" type="number" value={formState[field.name] ?? ''} onChange={(event) => onFormChange?.(field.name, event.target.value)} />
                  ) : field.type === 'checkbox' ? (
                    <input type="checkbox" checked={Boolean(formState[field.name])} onChange={(event) => onFormChange?.(field.name, event.target.checked)} />
                  ) : (
                    <input className="field-input" type="text" value={formState[field.name] ?? ''} onChange={(event) => onFormChange?.(field.name, event.target.value)} />
                  )}
                </label>
              ))}
              <div className="topbar-actions">
                <button className="primary-button" type="submit" disabled={saving}>{saving ? 'Saving…' : submitLabel}</button>
                <button className="secondary-button" type="button" onClick={onCancel}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {showConfirmDelete ? (
        <div className="modal-overlay">
          <div className="modal-card" style={{ width: 'min(480px, calc(100% - 32px))', textAlign: 'left' }}>
            <h3>{confirmTitle}</h3>
            <p>{confirmMessage}</p>
            <div className="topbar-actions" style={{ marginTop: '16px' }}>
              <button className="primary-button" type="button" onClick={onConfirmDelete}>Confirm</button>
              <button className="secondary-button" type="button" onClick={onCancel}>Cancel</button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
