const apiBase = '/api'

export const fetchDashboard = async () => {
  const response = await fetch(`${apiBase}/dashboard`)
  if (!response.ok) throw new Error('Dashboard load failed')
  return response.json()
}

export const fetchStudents = async () => {
  const response = await fetch(`${apiBase}/students`)
  if (!response.ok) throw new Error('Student load failed')
  return response.json()
}

export const fetchFaculties = async () => {
  const response = await fetch(`${apiBase}/faculties`)
  if (!response.ok) throw new Error('Faculty load failed')
  return response.json()
}

export const fetchDepartments = async (facultyId) => {
  const query = facultyId ? `?faculty_id=${encodeURIComponent(facultyId)}` : ''
  const response = await fetch(`${apiBase}/departments${query}`)
  if (!response.ok) throw new Error('Department load failed')
  return response.json()
}

export const fetchCourses = async (departmentId) => {
  const query = departmentId ? `?department_id=${encodeURIComponent(departmentId)}` : ''
  const response = await fetch(`${apiBase}/courses${query}`)
  if (!response.ok) throw new Error('Course load failed')
  return response.json()
}

export const fetchModules = async (courseId) => {
  const query = courseId ? `?course_id=${encodeURIComponent(courseId)}` : ''
  const response = await fetch(`${apiBase}/modules${query}`)
  if (!response.ok) throw new Error('Module load failed')
  return response.json()
}

export const createFaculty = async (payload) => {
  const response = await fetch(`${apiBase}/faculties`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.message || 'Faculty creation failed')
  }
  return response.json()
}

export const createDepartment = async (payload) => {
  const response = await fetch(`${apiBase}/departments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.message || 'Department creation failed')
  }
  return response.json()
}

export const createCourse = async (payload) => {
  const response = await fetch(`${apiBase}/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.message || 'Course creation failed')
  }
  return response.json()
}

export const createModule = async (payload) => {
  const response = await fetch(`${apiBase}/modules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.message || 'Module creation failed')
  }
  return response.json()
}

export const createResult = async (payload) => {
  const response = await fetch(`${apiBase}/results`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.message || 'Result creation failed')
  }

  return response.json()
}

export const fetchResults = async () => {
  const response = await fetch(`${apiBase}/results`)
  if (!response.ok) throw new Error('Results load failed')
  return response.json()
}
