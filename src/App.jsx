import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import Sidebar from './shared/components/Sidebar'
import Topbar from './shared/components/Topbar'
import Modal from './shared/components/Modal'
import {
  createCourse,
  createDepartment,
  createFaculty,
  createModule,
  createResult,
  fetchCourses,
  fetchDashboard,
  fetchDepartments,
  fetchFaculties,
  fetchModules,
  fetchResults,
  fetchStudents,
} from './shared/api'

const DashboardView = lazy(() => import('./dashboard/DashboardView'))
const AuthenticationView = lazy(() => import('./authentication/AuthenticationView'))
const RegistrationView = lazy(() => import('./registration/RegistrationView'))
const PlatformView = lazy(() => import('./platform/PlatformView'))
const InstitutionView = lazy(() => import('./institution/AcademicsView'))
const StaffView = lazy(() => import('./staff/StaffView'))
const StudentsView = lazy(() => import('./students/StudentsView'))
const CoursesView = lazy(() => import('./courses/CoursesView'))
const AssessmentsView = lazy(() => import('./assessments/AssessmentsView'))
const ResultsView = lazy(() => import('./results/ResultsView'))
const ExaminationView = lazy(() => import('./examination/ExaminationView'))
const ApprovalView = lazy(() => import('./approval/ApprovalView'))
const DocumentsView = lazy(() => import('./documents/DocumentsView'))
const ReportsView = lazy(() => import('./reports/ReportsView'))
const CommunicationView = lazy(() => import('./communication/CommunicationView'))
const SettingsView = lazy(() => import('./settings/SettingsView'))

const emptyDashboard = {
  stats: [],
  students: [],
  recentResults: [],
}

const views = [
  'Dashboard',
  'Authentication',
  'Registration',
  'Platform',
  'Institution',
  'Staff',
  'Students',
  'Courses',
  'Assessments',
  'Results',
  'Examination',
  'Approval',
  'Documents',
  'Reports',
  'Communication',
  'Settings',
]

function App() {
  const [activeView, setActiveView] = useState('Dashboard')
  const [dashboard, setDashboard] = useState(emptyDashboard)
  const [students, setStudents] = useState([])
  const [faculties, setFaculties] = useState([])
  const [departments, setDepartments] = useState([])
  const [courses, setCourses] = useState([])
  const [modules, setModules] = useState([])
  const [selectedFaculty, setSelectedFaculty] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [formState, setFormState] = useState({
    student_id: '',
    course_id: '',
    assignment_score: '',
    exam_score: '',
    academic_session: '',
  })
  const [academicForm, setAcademicForm] = useState({
    facultyName: '',
    departmentName: '',
    courseCode: '',
    courseName: '',
    courseCreditHours: 3,
    moduleCode: '',
    moduleName: '',
    moduleCreditHours: 1,
    moduleDescription: '',
  })
  const [activeAcademicTab, setActiveAcademicTab] = useState('Faculty')
  const [modalData, setModalData] = useState({ visible: false, type: 'success', message: '' })

  const isDashboard = activeView === 'Dashboard'
  const isStudents = activeView === 'Students'
  const isResults = activeView === 'Results'
  const isInstitution = activeView === 'Institution'

  const showError = useCallback((message) => {
    setModalData({ visible: true, type: 'error', message })
  }, [])

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchDashboard()
      setDashboard(data)
    } catch (err) {
      showError(err.message)
    } finally {
      setLoading(false)
    }
  }, [showError])

  const loadStudents = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchStudents()
      setStudents(data)
    } catch (err) {
      showError(err.message)
    } finally {
      setLoading(false)
    }
  }, [showError])

  const loadResults = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchResults()
      setResults(data)
    } catch (err) {
      showError(err.message)
    } finally {
      setLoading(false)
    }
  }, [showError])

  const loadCourses = useCallback(async (departmentId) => {
    setLoading(true)
    try {
      const data = await fetchCourses(departmentId)
      setCourses(data)
    } catch (err) {
      showError(err.message)
    } finally {
      setLoading(false)
    }
  }, [showError])

  const loadFaculties = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchFaculties()
      setFaculties(data)
    } catch (err) {
      showError(err.message)
    } finally {
      setLoading(false)
    }
  }, [showError])

  const loadDepartments = useCallback(async (facultyId) => {
    setLoading(true)
    try {
      const data = await fetchDepartments(facultyId)
      setDepartments(data)
    } catch (err) {
      showError(err.message)
    } finally {
      setLoading(false)
    }
  }, [showError])

  const loadModules = useCallback(async (courseId) => {
    setLoading(true)
    try {
      const data = await fetchModules(courseId)
      setModules(data)
    } catch (err) {
      showError(err.message)
    } finally {
      setLoading(false)
    }
  }, [showError])

  useEffect(() => {
    fetchDashboard()
      .then(setDashboard)
      .catch((err) => showError(err.message))
  }, [showError])

  useEffect(() => {
    if (isStudents) {
      fetchStudents().then(setStudents).catch((err) => showError(err.message))
    }
    if (isResults) {
      fetchResults().then(setResults).catch((err) => showError(err.message))
      fetchCourses().then(setCourses).catch((err) => showError(err.message))
    }
    if (isInstitution) {
      fetchFaculties().then(setFaculties).catch((err) => showError(err.message))
    }
  }, [activeView, isStudents, isResults, isInstitution, showError])

  const studentOptions = useMemo(
    () => students.map((student) => ({ value: student.id, label: `${student.full_name} (${student.student_id})` })),
    [students],
  )

  const facultyOptions = useMemo(
    () => faculties.map((faculty) => ({ value: faculty.id, label: faculty.name })),
    [faculties],
  )

  const departmentOptions = useMemo(
    () => departments.map((department) => ({ value: department.id, label: department.name })),
    [departments],
  )

  const courseOptions = useMemo(
    () => courses.map((course) => ({ value: course.id, label: `${course.course_code} — ${course.course_name}` })),
    [courses],
  )

  const moduleList = useMemo(() => modules, [modules])

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormState((current) => ({ ...current, [name]: value }))
  }

  const handleAcademicInputChange = (event) => {
    const { name, value } = event.target
    setAcademicForm((current) => ({ ...current, [name]: value }))
  }

  const handleCreateFaculty = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      await createFaculty({ name: academicForm.facultyName })
      setModalData({ visible: true, type: 'success', message: 'Faculty created successfully.' })
      setAcademicForm((current) => ({ ...current, facultyName: '' }))
      loadFaculties()
    } catch (err) {
      showError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDepartment = async (event) => {
    event.preventDefault()
    if (!selectedFaculty) {
      showError('Select a faculty before creating a department.')
      return
    }

    setLoading(true)
    try {
      await createDepartment({ name: academicForm.departmentName, faculty_id: selectedFaculty })
      setModalData({ visible: true, type: 'success', message: 'Department created successfully.' })
      setAcademicForm((current) => ({ ...current, departmentName: '' }))
      loadDepartments(selectedFaculty)
    } catch (err) {
      showError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCourse = async (event) => {
    event.preventDefault()
    if (!selectedDepartment) {
      showError('Select a department before creating a course.')
      return
    }

    setLoading(true)
    try {
      await createCourse({
        course_code: academicForm.courseCode,
        course_name: academicForm.courseName,
        credit_hours: Number(academicForm.courseCreditHours),
        department_id: selectedDepartment,
      })
      setModalData({ visible: true, type: 'success', message: 'Course created successfully.' })
      setAcademicForm((current) => ({ ...current, courseCode: '', courseName: '', courseCreditHours: 3 }))
      loadCourses(selectedDepartment)
    } catch (err) {
      showError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateModule = async (event) => {
    event.preventDefault()
    if (!selectedCourse) {
      showError('Select a course before creating a module.')
      return
    }

    setLoading(true)
    try {
      await createModule({
        module_code: academicForm.moduleCode,
        module_name: academicForm.moduleName,
        credit_hours: Number(academicForm.moduleCreditHours),
        description: academicForm.moduleDescription,
        course_id: selectedCourse,
      })
      setModalData({ visible: true, type: 'success', message: 'Module created successfully.' })
      setAcademicForm((current) => ({ ...current, moduleCode: '', moduleName: '', moduleCreditHours: 1, moduleDescription: '' }))
      loadModules(selectedCourse)
    } catch (err) {
      showError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResultSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      await createResult({
        student_id: Number(formState.student_id),
        course_id: Number(formState.course_id),
        assignment_score: Number(formState.assignment_score),
        exam_score: Number(formState.exam_score),
        academic_session: formState.academic_session,
      })

      setModalData({ visible: true, type: 'success', message: 'Result saved successfully.' })
      setFormState({ student_id: '', course_id: '', assignment_score: '', exam_score: '', academic_session: '' })
      loadResults()
      loadDashboard()
    } catch (err) {
      showError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const onFacultyChange = async (event) => {
    const facultyId = event.target.value
    setSelectedFaculty(facultyId)
    setSelectedDepartment('')
    setSelectedCourse('')
    setDepartments([])
    setCourses([])
    setModules([])

    if (facultyId) {
      loadDepartments(facultyId)
    }
  }

  const onDepartmentChange = async (event) => {
    const departmentId = event.target.value
    setSelectedDepartment(departmentId)
    setSelectedCourse('')
    setCourses([])
    setModules([])

    if (departmentId) {
      loadCourses(departmentId)
    }
  }

  const onCourseChange = async (event) => {
    const courseId = event.target.value
    setSelectedCourse(courseId)
    setModules([])

    if (courseId) {
      loadModules(courseId)
    }
  }

  return (
    <main className="dashboard-shell" aria-label="URMIS dashboard">
      <Sidebar
        views={views}
        activeView={activeView}
        onSelectView={(view) => {
          setActiveView(view)
        }}
      />

      <section className="main-panel">
        <Topbar
          activeView={activeView}
          onRefresh={() => {
            if (isDashboard) loadDashboard()
            if (isStudents) loadStudents()
            if (isResults) loadResults()
            if (isInstitution) loadFaculties()
          }}
        />

        {loading ? (
          <div className="loading-card">Loading...</div>
        ) : (
          <Suspense fallback={<div className="loading-card">Loading view...</div>}>
            {isDashboard && <DashboardView dashboard={dashboard} onViewChange={setActiveView} />}
            {activeView === 'Authentication' && <AuthenticationView />}
            {activeView === 'Registration' && <RegistrationView />}
            {activeView === 'Platform' && <PlatformView />}
            {isInstitution && (
              <InstitutionView
                selectedFaculty={selectedFaculty}
                selectedDepartment={selectedDepartment}
                selectedCourse={selectedCourse}
                facultyOptions={facultyOptions}
                departmentOptions={departmentOptions}
                courseOptions={courseOptions}
                moduleList={moduleList}
                activeAcademicTab={activeAcademicTab}
                onChangeTab={setActiveAcademicTab}
                onAcademicInputChange={handleAcademicInputChange}
                onFacultyChange={onFacultyChange}
                onDepartmentChange={onDepartmentChange}
                onCourseChange={onCourseChange}
                onCreateFaculty={handleCreateFaculty}
                onCreateDepartment={handleCreateDepartment}
                onCreateCourse={handleCreateCourse}
                onCreateModule={handleCreateModule}
                academicForm={academicForm}
              />
            )}
            {activeView === 'Staff' && <StaffView />}
            {isStudents && <StudentsView students={students} />}
            {activeView === 'Courses' && <CoursesView />}
            {activeView === 'Assessments' && <AssessmentsView />}
            {isResults && (
              <ResultsView
                results={results}
                studentOptions={studentOptions}
                courseOptions={courseOptions}
                formState={formState}
                onInputChange={handleInputChange}
                onSubmit={handleResultSubmit}
              />
            )}
            {activeView === 'Examination' && <ExaminationView />}
            {activeView === 'Approval' && <ApprovalView />}
            {activeView === 'Documents' && <DocumentsView />}
            {activeView === 'Reports' && <ReportsView />}
            {activeView === 'Communication' && <CommunicationView />}
            {activeView === 'Settings' && <SettingsView />}
          </Suspense>
        )}
      </section>
    </main>
  )
}

export default App
