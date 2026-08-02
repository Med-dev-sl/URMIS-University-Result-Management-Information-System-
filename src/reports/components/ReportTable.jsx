export default function ReportTable({ rows, columns }) {
  return (
    <div className="table-card">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.name || row.label || index}`}> 
              {columns.map((column) => (
                <td key={`${row.name || row.label || index}-${column}`}>{row[column.toLowerCase()] || row[column] || '-'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
