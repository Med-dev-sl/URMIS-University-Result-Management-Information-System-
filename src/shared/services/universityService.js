const apiBase = '/api/university'

function buildHeaders(token) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

async function requestJson(path, { token, method = 'GET', body } = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    method,
    headers: buildHeaders(token),
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.message || 'University request failed')
  }

  return data
}

export async function fetchUniversityOverview(token) {
  return requestJson('/overview', { token })
}

export async function fetchProgrammes(token) {
  return requestJson('/programmes', { token })
}

export async function createProgramme(token, payload) {
  return requestJson('/programmes', { token, method: 'POST', body: payload })
}

export async function updateProgramme(token, id, payload) {
  return requestJson(`/programmes/${id}`, { token, method: 'PUT', body: payload })
}

export async function deleteProgramme(token, id) {
  return requestJson(`/programmes/${id}`, { token, method: 'DELETE' })
}

export async function fetchAcademicSessions(token) {
  return requestJson('/academic-sessions', { token })
}

export async function createAcademicSession(token, payload) {
  return requestJson('/academic-sessions', { token, method: 'POST', body: payload })
}

export async function updateAcademicSession(token, id, payload) {
  return requestJson(`/academic-sessions/${id}`, { token, method: 'PUT', body: payload })
}

export async function deleteAcademicSession(token, id) {
  return requestJson(`/academic-sessions/${id}`, { token, method: 'DELETE' })
}

export async function fetchSemesters(token) {
  return requestJson('/semesters', { token })
}

export async function createSemester(token, payload) {
  return requestJson('/semesters', { token, method: 'POST', body: payload })
}

export async function updateSemester(token, id, payload) {
  return requestJson(`/semesters/${id}`, { token, method: 'PUT', body: payload })
}

export async function deleteSemester(token, id) {
  return requestJson(`/semesters/${id}`, { token, method: 'DELETE' })
}

export async function fetchLevels(token) {
  return requestJson('/levels', { token })
}

export async function createLevel(token, payload) {
  return requestJson('/levels', { token, method: 'POST', body: payload })
}

export async function updateLevel(token, id, payload) {
  return requestJson(`/levels/${id}`, { token, method: 'PUT', body: payload })
}

export async function deleteLevel(token, id) {
  return requestJson(`/levels/${id}`, { token, method: 'DELETE' })
}

export async function fetchGradeScales(token) {
  return requestJson('/grade-scales', { token })
}

export async function createGradeScale(token, payload) {
  return requestJson('/grade-scales', { token, method: 'POST', body: payload })
}

export async function updateGradeScale(token, id, payload) {
  return requestJson(`/grade-scales/${id}`, { token, method: 'PUT', body: payload })
}

export async function deleteGradeScale(token, id) {
  return requestJson(`/grade-scales/${id}`, { token, method: 'DELETE' })
}

export async function fetchNotifications(token) {
  return requestJson('/notifications', { token })
}

export async function createNotification(token, payload) {
  return requestJson('/notifications', { token, method: 'POST', body: payload })
}

export async function updateNotification(token, id, payload) {
  return requestJson(`/notifications/${id}`, { token, method: 'PUT', body: payload })
}

export async function deleteNotification(token, id) {
  return requestJson(`/notifications/${id}`, { token, method: 'DELETE' })
}

export async function fetchInstitutionSettings(token) {
  return requestJson('/settings', { token })
}

export async function createInstitutionSetting(token, payload) {
  return requestJson('/settings', { token, method: 'POST', body: payload })
}

export async function updateInstitutionSetting(token, id, payload) {
  return requestJson(`/settings/${id}`, { token, method: 'PUT', body: payload })
}

export async function deleteInstitutionSetting(token, id) {
  return requestJson(`/settings/${id}`, { token, method: 'DELETE' })
}

export async function fetchAuditLogs(token) {
  return requestJson('/audit-logs', { token })
}
