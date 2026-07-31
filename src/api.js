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

export const fetchCourses = async () => {
  const response = await fetch(`${apiBase}/courses`)
  if (!response.ok) throw new Error('Course load failed')
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
