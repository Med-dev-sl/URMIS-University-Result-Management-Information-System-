import { apiClient } from '../../../services/apiClient.js'

export const academicService = {
  faculties: () => apiClient.get('/faculties'),
  departments: (facultyId) => apiClient.get(`/departments${facultyId ? `?faculty_id=${encodeURIComponent(facultyId)}` : ''}`),
  courses: (departmentId) => apiClient.get(`/courses${departmentId ? `?department_id=${encodeURIComponent(departmentId)}` : ''}`),
  modules: (courseId) => apiClient.get(`/modules${courseId ? `?course_id=${encodeURIComponent(courseId)}` : ''}`),
}
