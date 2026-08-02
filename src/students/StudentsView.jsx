import { useMemo, useState } from 'react'

export default function StudentsView({ students = [] }) {
  const [search, setSearch] = useState('')

  const filteredStudents = useMemo(() => {
    return students.filter((student) => `${student.full_name ?? ''} ${student.student_id ?? ''} ${student.department_name ?? ''}`.toLowerCase().includes(search.toLowerCase()))
  }, [search, students])

  return (
    <section className="student-module-panel">
      <div className="student-hero">
        <div>
          <p className="eyebrow">Students module</p>
          <h2>Student directory and academic overview</h2>
          <p className="panel-subtitle">Browse registered students, departments, and current academic standing.</p>
        </div>
        <div className="student-hero-badge">
          <strong>{students.length}</strong>
          <span>Students listed</span>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3>Find a student</h3>
          <span className="pill">Search</span>
        </div>
        <input className="field-input" placeholder="Search students" value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3>All students</h3>
          <span className="pill">{filteredStudents.length} results</span>
        </div>
        <div className="stacked-list">
          {filteredStudents.map((student) => (
            <div key={student.id} className="student-card">
              <div className="student-card-main">
                <div className="user-avatar">{(student.full_name ?? 'ST').split(' ').map((word) => word[0]).slice(0, 2).join('')}</div>
                <div>
                  <strong>{student.full_name}</strong>
                  <p className="panel-subtitle">{student.student_id} · {student.department_name} · {student.enrollment_year}</p>
                </div>
              </div>
              <span className="pill">{student.semester}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
