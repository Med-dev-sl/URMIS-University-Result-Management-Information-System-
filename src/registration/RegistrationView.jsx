import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../shared/context/useAuth.js'
import {
  fetchCourses,
  fetchDepartments,
  fetchFaculties,
  fetchRegistrationPeriods,
  fetchRegistrations,
  createRegistration,
  approveRegistration,
  rejectRegistration,
} from '../shared/api.js'
import { canApproveRegistration, getRegistrationRoleHint, getRegistrationStatusLabel, getSelectedCourseCreditUnits } from './registrationUtils.js'

const emptyPeriod = {
  id: null,
  name: 'No open registration period',
  academicSession: 'Unavailable',
  status: 'draft',
  maxCreditUnits: 24,
}

export default function RegistrationView() {
  const { user } = useAuth()
  const [period, setPeriod] = useState(emptyPeriod)
  const [registrations, setRegistrations] = useState([])
  const [facultyOptions, setFacultyOptions] = useState([])
  const [departmentOptions, setDepartmentOptions] = useState([])
  const [courseOptions, setCourseOptions] = useState([])
  const [selectedFaculty, setSelectedFaculty] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedCourseIds, setSelectedCourseIds] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const isStudent = user?.role === 'student'
  const canReview = canApproveRegistration(user?.role)
  const roleHint = getRegistrationRoleHint(user?.role)

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true)
      try {
        const [faculties, departments, courses, periods] = await Promise.all([
          fetchFaculties(),
          fetchDepartments(),
          fetchCourses(),
          fetchRegistrationPeriods(),
        ])

        setFacultyOptions(faculties)
        setDepartmentOptions(departments)
        setCourseOptions(courses)

        const activePeriod = Array.isArray(periods) && periods.find((entry) => entry.status === 'open')
        setPeriod(activePeriod || emptyPeriod)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadInitialData()
    }
  }, [user])

  useEffect(() => {
    const loadRegistrations = async () => {
      if (!user) return
      setLoading(true)
      try {
        const data = await fetchRegistrations()
        setRegistrations(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadRegistrations()
  }, [user])

  const selectedCourses = useMemo(() => {
    return courseOptions.filter((course) => selectedCourseIds.includes(course.id))
  }, [courseOptions, selectedCourseIds])

  const totalCreditUnits = useMemo(() => {
    return getSelectedCourseCreditUnits(selectedCourses, selectedCourseIds)
  }, [selectedCourses, selectedCourseIds])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!isStudent) {
      setError('Only students can submit a registration request.')
      return
    }

    if (!selectedCourseIds.length) {
      setError('Select at least one course before submitting.')
      return
    }

    if (period.status !== 'open') {
      setError('Registration is not open for the selected period.')
      return
    }

    if (totalCreditUnits > period.maxCreditUnits) {
      setError(`Selected courses exceed the maximum of ${period.maxCreditUnits} credit units.`)
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      await createRegistration({ courseIds: selectedCourseIds, registrationPeriodId: period.id })
      setMessage('Registration submitted successfully and is awaiting review.')
      setSelectedCourseIds([])
      const refreshed = await fetchRegistrations()
      setRegistrations(Array.isArray(refreshed) ? refreshed : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (registrationId) => {
    if (!canReview) return
    setLoading(true)
    try {
      await approveRegistration(registrationId)
      setMessage('Registration approved successfully.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async (registrationId) => {
    if (!canReview) return
    setLoading(true)
    try {
      await rejectRegistration(registrationId, 'Needs revision')
      setMessage('Registration rejected successfully.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <section className="panel">
        <h3>Registration</h3>
        <p>Please sign in to view or submit your registration request.</p>
      </section>
    )
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h3>Registration workflow</h3>
          <p className="field-hint">{roleHint.description}</p>
        </div>
      </div>

      {message ? <div className="auth-message success">{message}</div> : null}
      {error ? <div className="auth-message error">{error}</div> : null}

      <div className="tab-panel">
        <div className="strength-card">
          <div className="strength-row">
            <strong>Current period</strong>
            <span>{period.name}</span>
          </div>
          <div className="strength-row">
            <span>Academic session</span>
            <span>{period.academicSession}</span>
          </div>
          <div className="strength-row">
            <span>Status</span>
            <span>{period.status}</span>
          </div>
          <div className="strength-row">
            <span>Maximum credit units</span>
            <span>{period.maxCreditUnits}</span>
          </div>
        </div>
      </div>

      <div className="strength-card">
        <div className="strength-row">
          <strong>{roleHint.title}</strong>
          <span>{roleHint.cta}</span>
        </div>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="field-group">
          <label className="field-label" htmlFor="faculty-select">Faculty</label>
          <select id="faculty-select" className="field-input" value={selectedFaculty} onChange={(event) => setSelectedFaculty(event.target.value)}>
            <option value="">Select faculty</option>
            {facultyOptions.map((faculty) => (
              <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
            ))}
          </select>
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="department-select">Department</label>
          <select id="department-select" className="field-input" value={selectedDepartment} onChange={(event) => setSelectedDepartment(event.target.value)}>
            <option value="">Select department</option>
            {departmentOptions.map((department) => (
              <option key={department.id} value={department.id}>{department.name}</option>
            ))}
          </select>
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="course-select">Courses</label>
          <select id="course-select" className="field-input" multiple value={selectedCourseIds} onChange={(event) => {
            const values = Array.from(event.target.selectedOptions, (option) => Number(option.value))
            setSelectedCourseIds(values)
          }}>
            {courseOptions.map((course) => (
              <option key={course.id} value={course.id}>{course.course_code} — {course.course_name}</option>
            ))}
          </select>
          <small className="field-hint">Select one or more courses. Credit units are checked against the registration period limit.</small>
        </div>

        <div className="strength-card">
          <div className="strength-row">
            <span>Selected credit units</span>
            <strong>{totalCreditUnits}</strong>
          </div>
          <div className="strength-row">
            <span>Available slots</span>
            <strong>{Math.max(period.maxCreditUnits - totalCreditUnits, 0)}</strong>
          </div>
        </div>

        <button className="primary-button auth-button" type="submit" disabled={loading || !isStudent}>
          {loading ? 'Submitting...' : roleHint.cta}
        </button>
      </form>

      <div className="tab-panel">
        <h4>Recent registrations</h4>
        {loading ? <p className="field-hint">Loading registrations...</p> : null}
        {!loading && registrations.length === 0 ? <p className="field-hint">No registration requests have been submitted yet.</p> : null}
        <ul className="results-list">
          {registrations.map((registration) => (
            <li key={registration.id} className="result-item">
              <div>
                <strong>{registration.registrationPeriod?.name || 'Registration request'}</strong>
                <span>{getRegistrationStatusLabel(registration.status)}</span>
                <div className="field-hint">{registration.totalCreditUnits || 0} credit units</div>
              </div>
              {canReview ? (
                <div className="topbar-actions">
                  <button className="secondary-button" type="button" onClick={() => handleApprove(registration.id)}>Approve</button>
                  <button className="secondary-button" type="button" onClick={() => handleReject(registration.id)}>Reject</button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
