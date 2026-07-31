export default function ResultsView({ results, studentOptions, courseOptions, formState, onInputChange, onSubmit }) {
  return (
    <>
      <ResultForm studentOptions={studentOptions} courseOptions={courseOptions} formState={formState} onInputChange={onInputChange} onSubmit={onSubmit} />

      <article className="panel full-width-panel">
        <div className="panel-header" style={{ marginTop: '28px' }}>
          <h3>Recent results</h3>
        </div>

        <ul className="results-list">
          {results.map((result) => (
            <li key={result.id} className="result-item">
              <div>
                <strong>{result.student_name}</strong>
                <span>{result.course_name}</span>
              </div>
              <div className="result-score">
                <span>{result.grade}</span>
                <small>{result.percentage}%</small>
              </div>
            </li>
          ))}
        </ul>
      </article>
    </>
  )
}
