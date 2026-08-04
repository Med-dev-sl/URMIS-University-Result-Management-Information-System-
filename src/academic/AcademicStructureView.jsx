import { useEffect, useMemo, useState } from 'react'
import HierarchyTree from '../shared/components/HierarchyTree.jsx'
import { fetchAcademicStructure } from '../shared/api.js'

const initialFacultyData = [
  {
    id: 1,
    name: 'Faculty of Science',
    code: 'SCI',
    children: [
      {
        id: 11,
        name: 'Department of Computer Science',
        code: 'CSC',
        children: [
          { id: 111, name: 'Programme: BSc Computer Science', code: 'BCS' },
          { id: 112, name: 'Programme: MSc Computer Science', code: 'MCS' },
        ],
      },
      {
        id: 12,
        name: 'Department of Mathematics',
        code: 'MTH',
        children: [{ id: 121, name: 'Programme: BSc Mathematics', code: 'BMT' }],
      },
    ],
  },
  {
    id: 2,
    name: 'Faculty of Arts',
    code: 'ART',
    children: [{ id: 21, name: 'Department of English', code: 'ENG', children: [{ id: 211, name: 'Programme: BA English', code: 'BAE' }] }],
  },
]

const courseData = [
  { id: 1, code: 'CSC101', title: 'Introduction to Computing', category: 'Core', creditUnits: 3, department: 'Computer Science', semester: 'First Semester', status: 'Active', assignedLecturer: 'Dr. A. Mensah' },
  { id: 2, code: 'CSC201', title: 'Data Structures', category: 'Core', creditUnits: 4, department: 'Computer Science', semester: 'Second Semester', status: 'Active', assignedLecturer: 'Prof. B. Boateng' },
  { id: 3, code: 'ENG101', title: 'Communication Skills', category: 'General', creditUnits: 2, department: 'English', semester: 'First Semester', status: 'Draft', assignedLecturer: 'Dr. C. Doe' },
]

const categoryData = [
  { id: 1, name: 'Core', description: 'Mandatory for degree completion', status: 'Active' },
  { id: 2, name: 'Elective', description: 'Student choice', status: 'Active' },
  { id: 3, name: 'General', description: 'University-wide general study', status: 'Draft' },
]

const emptyForm = {
  name: '',
  code: '',
  description: '',
  department: '',
  category: 'Core',
  creditUnits: 3,
  semester: '',
  assignedLecturer: '',
  status: 'Active',
}

function buildFieldConfig(type) {
  switch (type) {
    case 'faculty':
      return [
        { name: 'name', label: 'Faculty name' },
        { name: 'code', label: 'Faculty code' },
        { name: 'description', label: 'Description', type: 'textarea' },
      ]
    case 'department':
      return [
        { name: 'name', label: 'Department name' },
        { name: 'code', label: 'Department code' },
        { name: 'description', label: 'Description', type: 'textarea' },
      ]
    case 'programme':
      return [
        { name: 'name', label: 'Programme name' },
        { name: 'code', label: 'Programme code' },
        { name: 'description', label: 'Description', type: 'textarea' },
      ]
    case 'course':
      return [
        { name: 'code', label: 'Course code' },
        { name: 'title', label: 'Course title' },
        { name: 'department', label: 'Department' },
        { name: 'category', label: 'Category' },
        { name: 'creditUnits', label: 'Credit units', type: 'number' },
        { name: 'semester', label: 'Semester' },
        { name: 'assignedLecturer', label: 'Assigned lecturer' },
        { name: 'status', label: 'Status', type: 'select', options: [{ value: 'Active', label: 'Active' }, { value: 'Draft', label: 'Draft' }] },
      ]
    case 'category':
      return [
        { name: 'name', label: 'Category name' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'status', label: 'Status', type: 'select', options: [{ value: 'Active', label: 'Active' }, { value: 'Draft', label: 'Draft' }] },
      ]
    default:
      return []
  }
}

export default function AcademicStructureView() {
  const [activeModule, setActiveModule] = useState('faculty')
  const [facultyData, setFacultyData] = useState(initialFacultyData)
  const [courseItems, setCourseItems] = useState(courseData)
  const [categories, setCategories] = useState(categoryData)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formState, setFormState] = useState(emptyForm)
  const [notice, setNotice] = useState('Manage faculties, departments, programmes, courses, and course categories from one structured workspace.')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadStructure = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await fetchAcademicStructure()
        if (Array.isArray(data) && data.length > 0) {
          const institutions = data
          const faculties = institutions.flatMap((institution) => (institution.faculties ?? []).map((faculty) => ({
            id: faculty.id,
            name: faculty.name,
            code: faculty.code ?? '',
            children: (faculty.departments ?? []).map((department) => ({
              id: department.id,
              name: department.name,
              code: department.code ?? '',
              children: (department.courses ?? []).map((course) => ({
                id: course.id,
                name: course.course_name || course.course_code,
                code: course.course_code,
                children: (course.modules ?? []).map((module) => ({
                  id: module.id,
                  name: module.module_name,
                  code: module.module_code,
                })),
              })),
            })),
          })))

          const mappedCourses = institutions.flatMap((institution) =>
            (institution.faculties ?? []).flatMap((faculty) =>
              (faculty.departments ?? []).flatMap((department) =>
                (department.courses ?? []).map((course) => ({
                  id: course.id,
                  code: course.course_code,
                  title: course.course_name,
                  category: 'Core',
                  creditUnits: course.credit_hours,
                  department: department.name,
                  semester: 'TBD',
                  status: 'Active',
                  assignedLecturer: 'Unassigned',
                }))
              )
            )
          )

          setFacultyData(faculties)
          setCourseItems(mappedCourses)
        }
      } catch (err) {
        setError(err.message || 'Unable to load academic structure.')
      } finally {
        setLoading(false)
      }
    }

    loadStructure()
  }, [])

  const activeItems = useMemo(() => {
    if (activeModule === 'course') return courseItems
    if (activeModule === 'category') return categories
    return facultyData
  }, [activeModule, facultyData, courseItems, categories])

  const filteredItems = useMemo(() => {
    const term = search.toLowerCase().trim()
    return activeItems.filter((item) => {
      if (filter !== 'all' && item.status && item.status !== filter) return false
      if (!term) return true
      return Object.values(item).some((value) => String(value ?? '').toLowerCase().includes(term))
    })
  }, [activeItems, search, filter])

  const stats = useMemo(() => [
    { label: 'Faculties', value: facultyData.length, detail: 'Academic units' },
    { label: 'Courses', value: courseItems.length, detail: 'Available modules' },
    { label: 'Categories', value: categories.length, detail: 'Course groups' },
    { label: 'Visible', value: filteredItems.length, detail: 'Filtered results' },
  ], [facultyData.length, courseItems.length, categories.length, filteredItems.length])

  const moduleConfig = useMemo(() => [
    { key: 'faculty', label: 'Faculty' },
    { key: 'department', label: 'Department' },
    { key: 'programme', label: 'Programme' },
    { key: 'course', label: 'Course' },
    { key: 'allocation', label: 'Course Allocation' },
    { key: 'semester', label: 'Semester' },
    { key: 'session', label: 'Academic Session' },
    { key: 'level', label: 'Level' },
    { key: 'category', label: 'Course Categories' },
    { key: 'credit', label: 'Credit Units' },
  ], [])

  const openCreate = () => {
    setEditingItem(null)
    setFormState(emptyForm)
    setFormOpen(true)
  }

  const openEdit = (item) => {
    setEditingItem(item)
    setFormState({ ...item })
    setFormOpen(true)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (activeModule === 'course') {
      if (editingItem) {
        setCourseItems((current) => current.map((item) => item.id === editingItem.id ? { ...item, ...formState } : item))
      } else {
        setCourseItems((current) => [{ id: Date.now(), ...formState }, ...current])
      }
    } else if (activeModule === 'category') {
      if (editingItem) {
        setCategories((current) => current.map((item) => item.id === editingItem.id ? { ...item, ...formState } : item))
      } else {
        setCategories((current) => [{ id: Date.now(), ...formState }, ...current])
      }
    } else {
      if (editingItem) {
        setFacultyData((current) => current.map((item) => item.id === editingItem.id ? { ...item, ...formState } : item))
      } else {
        setFacultyData((current) => [{ id: Date.now(), ...formState, children: [] }, ...current])
      }
    }
    setFormOpen(false)
    setFormState(emptyForm)
    setNotice(`${formState.name || formState.title || formState.code} has been saved.`)
  }

  const handleDelete = (item) => {
    if (activeModule === 'course') {
      setCourseItems((current) => current.filter((entry) => entry.id !== item.id))
    } else if (activeModule === 'category') {
      setCategories((current) => current.filter((entry) => entry.id !== item.id))
    } else {
      setFacultyData((current) => current.filter((entry) => entry.id !== item.id))
    }
    setNotice(`${item.name || item.title || item.code} was removed.`)
  }

  const hierarchyItems = useMemo(() => facultyData, [facultyData])

  if (loading) {
    return (
      <article className="panel academic-structure-panel">
        <div className="panel">
          <p>Loading academic structure...</p>
        </div>
      </article>
    )
  }

  if (error) {
    return (
      <article className="panel academic-structure-panel">
        <div className="panel auth-message error">
          <p>{error}</p>
        </div>
      </article>
    )
  }

  return (
    <article className="panel academic-structure-panel">
      <div className="panel-header">
        <div>
          <h3>Academic structure</h3>
          <p className="field-hint">Organize faculties, departments, programmes, courses, allocations, and academic rules in a structured hierarchy.</p>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value">{stat.value}</div>
            <div className="field-hint">{stat.detail}</div>
          </div>
        ))}
      </div>

      <div className="notice-banner">{notice}</div>

      <div className="topbar-actions" style={{ marginBottom: '16px' }}>
        <button className="primary-button" type="button" onClick={openCreate}>Create record</button>
      </div>

      <div className="academic-tabs" role="tablist" aria-label="Academic structure modules">
        {moduleConfig.map((module) => (
          <button key={module.key} type="button" className={`tab-item ${activeModule === module.key ? 'active' : ''}`} onClick={() => setActiveModule(module.key)}>{module.label}</button>
        ))}
      </div>

      <div className="user-filters">
        <input className="field-input" placeholder="Search records" value={search} onChange={(event) => setSearch(event.target.value)} />
        <select className="field-input" value={filter} onChange={(event) => setFilter(event.target.value)}>
          <option value="all">All statuses</option>
          <option value="Active">Active</option>
          <option value="Draft">Draft</option>
        </select>
      </div>

      <div className="academic-structure-grid">
        <div className="panel">
          <div className="panel-header">
            <h4>{moduleConfig.find((module) => module.key === activeModule)?.label}</h4>
            <span className="field-hint">{filteredItems.length} entries</span>
          </div>
          <div className="structure-list">
            {filteredItems.map((item) => (
              <div key={item.id} className="structure-card">
                <div>
                  <strong>{item.name || item.title || item.code}</strong>
                  <div className="field-hint">{item.code || item.department || item.category || item.description}</div>
                </div>
                <div className="structure-actions">
                  <button className="link-button" type="button" onClick={() => openEdit(item)}>Edit</button>
                  <button className="link-button" type="button" onClick={() => handleDelete(item)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="academic-side-panel">
          <HierarchyTree title="Faculty tree" items={hierarchyItems} selectedId={null} onSelect={() => {}} emptyMessage="No faculty hierarchy yet." />
          <div className="panel">
            <div className="panel-header">
              <h4>Course assignment</h4>
            </div>
            <div className="assignment-list">
              {courseItems.map((course) => (
                <div key={course.id} className="assignment-card">
                  <strong>{course.code}</strong>
                  <div className="field-hint">{course.title}</div>
                  <div className="field-hint">Lecturer: {course.assignedLecturer}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {formOpen ? (
        <div className="modal-overlay">
          <div className="modal-card" style={{ width: 'min(720px, calc(100% - 32px))', textAlign: 'left' }}>
            <div className="panel-header">
              <h3>{editingItem ? 'Edit record' : 'Create record'}</h3>
            </div>
            <form className="auth-form" onSubmit={handleSubmit}>
              {buildFieldConfig(activeModule === 'allocation' ? 'course' : activeModule === 'category' ? 'category' : activeModule === 'course' ? 'course' : activeModule === 'department' ? 'department' : activeModule === 'programme' ? 'programme' : activeModule === 'faculty' ? 'faculty' : 'faculty').map((field) => (
                <label key={field.name} className="field-group">
                  <span className="field-label">{field.label}</span>
                  {field.type === 'textarea' ? (
                    <textarea className="field-input" rows={3} value={formState[field.name] ?? ''} onChange={(event) => setFormState((current) => ({ ...current, [field.name]: event.target.value }))} />
                  ) : field.type === 'select' ? (
                    <select className="field-input" value={formState[field.name] ?? ''} onChange={(event) => setFormState((current) => ({ ...current, [field.name]: event.target.value }))}>
                      {field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  ) : field.type === 'number' ? (
                    <input className="field-input" type="number" value={formState[field.name] ?? ''} onChange={(event) => setFormState((current) => ({ ...current, [field.name]: event.target.value }))} />
                  ) : (
                    <input className="field-input" value={formState[field.name] ?? ''} onChange={(event) => setFormState((current) => ({ ...current, [field.name]: event.target.value }))} />
                  )}
                </label>
              ))}
              <div className="topbar-actions">
                <button className="primary-button" type="submit">Save</button>
                <button className="secondary-button" type="button" onClick={() => setFormOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </article>
  )
}
