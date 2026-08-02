import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/useAuth.js'
import { hasPermission } from '../permissions/permissions.js'
import CrudManager from '../shared/components/CrudManager.jsx'
import { useCrudManager } from '../shared/hooks/useCrudManager.js'
import {
  createAcademicSession,
  createGradeScale,
  createInstitutionSetting,
  createLevel,
  createNotification,
  updateNotification,
  createProgramme,
  createSemester,
  deleteAcademicSession,
  deleteGradeScale,
  deleteInstitutionSetting,
  deleteLevel,
  deleteNotification,
  deleteProgramme,
  deleteSemester,
  fetchAcademicSessions,
  fetchAuditLogs,
  fetchGradeScales,
  fetchInstitutionSettings,
  fetchLevels,
  fetchNotifications,
  fetchProgrammes,
  fetchUniversityOverview,
  fetchSemesters,
  updateAcademicSession,
  updateGradeScale,
  updateInstitutionSetting,
  updateLevel,
  updateProgramme,
  updateSemester,
} from '../shared/services/universityService.js'

const MODULES = [
  { key: 'programmes', label: 'Programmes' },
  { key: 'sessions', label: 'Academic Sessions' },
  { key: 'semesters', label: 'Semesters' },
  { key: 'levels', label: 'Levels' },
  { key: 'grading', label: 'Grading Configuration' },
  { key: 'settings', label: 'University Settings' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'audit', label: 'Audit Logs' },
]

const emptyForm = {
  code: '',
  name: '',
  description: '',
  durationYears: 4,
  startDate: '',
  endDate: '',
  academicSessionId: '',
  gradeLetter: '',
  minimumScore: 0,
  maximumScore: 100,
  gradePoint: 0,
  key: '',
  value: '',
  category: 'general',
  title: '',
  message: '',
  channel: 'in-app',
  status: 'active',
  isCurrent: false,
  isDefault: false,
}

function buildFields(moduleKey) {
  switch (moduleKey) {
    case 'programmes':
      return [
        { name: 'code', label: 'Programme code' },
        { name: 'name', label: 'Programme name' },
        { name: 'durationYears', label: 'Duration years', type: 'number' },
        { name: 'description', label: 'Description', type: 'textarea' },
      ]
    case 'sessions':
      return [
        { name: 'name', label: 'Session name' },
        { name: 'startDate', label: 'Start date', type: 'date' },
        { name: 'endDate', label: 'End date', type: 'date' },
        { name: 'isCurrent', label: 'Current session', type: 'checkbox' },
      ]
    case 'semesters':
      return [
        { name: 'name', label: 'Semester name' },
        { name: 'code', label: 'Semester code' },
        { name: 'academicSessionId', label: 'Academic session id' },
        { name: 'isCurrent', label: 'Current semester', type: 'checkbox' },
      ]
    case 'levels':
      return [
        { name: 'name', label: 'Level name' },
        { name: 'code', label: 'Level code' },
        { name: 'sequence', label: 'Sequence', type: 'number' },
        { name: 'isCurrent', label: 'Current level', type: 'checkbox' },
      ]
    case 'grading':
      return [
        { name: 'gradeLetter', label: 'Grade letter' },
        { name: 'minimumScore', label: 'Minimum score', type: 'number' },
        { name: 'maximumScore', label: 'Maximum score', type: 'number' },
        { name: 'gradePoint', label: 'Grade point', type: 'number' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'isDefault', label: 'Default scale', type: 'checkbox' },
      ]
    case 'settings':
      return [
        { name: 'key', label: 'Setting key' },
        { name: 'value', label: 'Setting value' },
        { name: 'category', label: 'Category' },
        { name: 'description', label: 'Description', type: 'textarea' },
      ]
    case 'notifications':
      return [
        { name: 'title', label: 'Title' },
        { name: 'message', label: 'Message', type: 'textarea' },
        { name: 'channel', label: 'Channel' },
        { name: 'category', label: 'Category' },
        { name: 'status', label: 'Status' },
      ]
    case 'audit':
      return [
        { name: 'action', label: 'Action' },
        { name: 'actor', label: 'Actor' },
        { name: 'route', label: 'Route' },
      ]
    default:
      return []
  }
}

function buildColumns(moduleKey) {
  switch (moduleKey) {
    case 'programmes':
      return [{ key: 'name', label: 'Programme' }, { key: 'code', label: 'Code' }, { key: 'durationYears', label: 'Duration' }]
    case 'sessions':
      return [{ key: 'name', label: 'Session' }, { key: 'startDate', label: 'Start' }, { key: 'endDate', label: 'End' }]
    case 'semesters':
      return [{ key: 'name', label: 'Semester' }, { key: 'code', label: 'Code' }, { key: 'status', label: 'Status' }]
    case 'levels':
      return [{ key: 'name', label: 'Level' }, { key: 'code', label: 'Code' }, { key: 'sequence', label: 'Sequence' }]
    case 'grading':
      return [{ key: 'gradeLetter', label: 'Grade' }, { key: 'minimumScore', label: 'Min' }, { key: 'maximumScore', label: 'Max' }]
    case 'settings':
      return [{ key: 'key', label: 'Key' }, { key: 'value', label: 'Value' }, { key: 'category', label: 'Category' }]
    case 'notifications':
      return [{ key: 'title', label: 'Title' }, { key: 'channel', label: 'Channel' }, { key: 'status', label: 'Status' }]
    case 'audit':
      return [{ key: 'action', label: 'Action' }, { key: 'actor', label: 'Actor' }, { key: 'route', label: 'Route' }]
    default:
      return [{ key: 'name', label: 'Name' }]
  }
}

export default function UniversityAdminView() {
  const { user } = useAuth()
  const [activeModule, setActiveModule] = useState('programmes')
  const [records, setRecords] = useState([])
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formState, setFormState] = useState(emptyForm)
  const [editingItem, setEditingItem] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const api = useCrudManager({ items: records, pageSize: 6 })

  const canAccess = hasPermission(user, 'system:view') || user?.role === 'super_admin' || user?.role === 'admin'

  const currentModule = useMemo(() => MODULES.find((module) => module.key === activeModule) || MODULES[0], [activeModule])

  const hydrateModule = async (moduleKey) => {
    if (!user?.token) return
    setLoading(true)
    setError('')
    try {
      if (moduleKey === 'programmes') {
        const data = await fetchProgrammes(user.token)
        setRecords(data)
      } else if (moduleKey === 'sessions') {
        const data = await fetchAcademicSessions(user.token)
        setRecords(data)
      } else if (moduleKey === 'semesters') {
        const data = await fetchSemesters(user.token)
        setRecords(data)
      } else if (moduleKey === 'levels') {
        const data = await fetchLevels(user.token)
        setRecords(data)
      } else if (moduleKey === 'grading') {
        const data = await fetchGradeScales(user.token)
        setRecords(data)
      } else if (moduleKey === 'settings') {
        const data = await fetchInstitutionSettings(user.token)
        setRecords(data)
      } else if (moduleKey === 'notifications') {
        const data = await fetchNotifications(user.token)
        setRecords(data)
      } else if (moduleKey === 'audit') {
        const data = await fetchAuditLogs(user.token)
        setRecords(data)
      }
    } catch (loadError) {
      setError(loadError.message || 'Unable to load module data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user?.token) return
    const loadInitialData = async () => {
      try {
        const overviewData = await fetchUniversityOverview(user.token)
        setOverview(overviewData)
      } catch (overviewError) {
        setError(overviewError.message || 'Unable to load university overview.')
      }
      await hydrateModule(activeModule)
    }

    loadInitialData()
  }, [user?.token])

  const handleModuleChange = async (moduleKey) => {
    setActiveModule(moduleKey)
    setFormState(emptyForm)
    setEditingItem(null)
    api.setSelectedItem(null)
    api.setShowForm(false)
    api.setShowConfirmDelete(false)
    api.setSearch('')
    api.setFilter('all')
    api.setPage(1)
    setError('')
    await hydrateModule(moduleKey)
  }

  const handleCreate = () => {
    setFormState(emptyForm)
    setEditingItem(null)
    api.setShowForm(true)
    api.setShowConfirmDelete(false)
  }

  const handleEdit = (item) => {
    setFormState({
      ...item,
      ...(item.startDate ? { startDate: item.startDate.slice(0, 10) } : {}),
      ...(item.endDate ? { endDate: item.endDate.slice(0, 10) } : {}),
    })
    setEditingItem(item)
    api.setShowForm(true)
    api.setShowConfirmDelete(false)
  }

  const handleDelete = (item) => {
    api.setPendingDelete(item)
    api.setShowConfirmDelete(true)
  }

  const handleConfirmDelete = async () => {
    if (!api.pendingDelete) return
    try {
      setSaving(true)
      setError('')
      if (activeModule === 'programmes') {
        await deleteProgramme(user.token, api.pendingDelete.id)
      } else if (activeModule === 'sessions') {
        await deleteAcademicSession(user.token, api.pendingDelete.id)
      } else if (activeModule === 'semesters') {
        await deleteSemester(user.token, api.pendingDelete.id)
      } else if (activeModule === 'levels') {
        await deleteLevel(user.token, api.pendingDelete.id)
      } else if (activeModule === 'grading') {
        await deleteGradeScale(user.token, api.pendingDelete.id)
      } else if (activeModule === 'settings') {
        await deleteInstitutionSetting(user.token, api.pendingDelete.id)
      } else if (activeModule === 'notifications') {
        await deleteNotification(user.token, api.pendingDelete.id)
      }
      await hydrateModule(activeModule)
      api.setPendingDelete(null)
      api.setShowConfirmDelete(false)
      api.setSelectedItem(null)
    } catch (deleteError) {
      setError(deleteError.message || 'Delete failed.')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!user?.token) {
      setError('You need an active session to save this record.')
      return
    }

    try {
      setSaving(true)
      setError('')
      if (activeModule === 'programmes') {
        const payload = {
          code: formState.code,
          name: formState.name,
          durationYears: Number(formState.durationYears) || 4,
          description: formState.description,
        }
        if (editingItem) {
          await updateProgramme(user.token, editingItem.id, payload)
        } else {
          await createProgramme(user.token, payload)
        }
      } else if (activeModule === 'sessions') {
        const payload = {
          name: formState.name,
          startDate: formState.startDate,
          endDate: formState.endDate,
          isCurrent: Boolean(formState.isCurrent),
        }
        if (editingItem) {
          await updateAcademicSession(user.token, editingItem.id, payload)
        } else {
          await createAcademicSession(user.token, payload)
        }
      } else if (activeModule === 'semesters') {
        const payload = {
          name: formState.name,
          code: formState.code,
          academicSessionId: formState.academicSessionId,
          isCurrent: Boolean(formState.isCurrent),
        }
        if (editingItem) {
          await updateSemester(user.token, editingItem.id, payload)
        } else {
          await createSemester(user.token, payload)
        }
      } else if (activeModule === 'levels') {
        const payload = {
          name: formState.name,
          code: formState.code,
          sequence: Number(formState.sequence) || 1,
          isCurrent: Boolean(formState.isCurrent),
        }
        if (editingItem) {
          await updateLevel(user.token, editingItem.id, payload)
        } else {
          await createLevel(user.token, payload)
        }
      } else if (activeModule === 'grading') {
        const payload = {
          gradeLetter: formState.gradeLetter,
          minimumScore: Number(formState.minimumScore) || 0,
          maximumScore: Number(formState.maximumScore) || 100,
          gradePoint: Number(formState.gradePoint) || 0,
          description: formState.description,
          isDefault: Boolean(formState.isDefault),
        }
        if (editingItem) {
          await updateGradeScale(user.token, editingItem.id, payload)
        } else {
          await createGradeScale(user.token, payload)
        }
      } else if (activeModule === 'settings') {
        const payload = {
          key: formState.key,
          value: formState.value,
          category: formState.category,
          description: formState.description,
        }
        if (editingItem) {
          await updateInstitutionSetting(user.token, editingItem.id, payload)
        } else {
          await createInstitutionSetting(user.token, payload)
        }
      } else if (activeModule === 'notifications') {
        const payload = {
          title: formState.title,
          message: formState.message,
          channel: formState.channel,
          category: formState.category,
          status: formState.status,
        }
        if (editingItem) {
          await updateNotification(user.token, editingItem.id, payload)
        } else {
          await createNotification(user.token, payload)
        }
      }

      await hydrateModule(activeModule)
      api.setShowForm(false)
      api.setShowConfirmDelete(false)
      setFormState(emptyForm)
      setEditingItem(null)
    } catch (submitError) {
      setError(submitError.message || 'Unable to save record.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    api.setShowForm(false)
    api.setShowConfirmDelete(false)
    api.setPendingDelete(null)
    setFormState(emptyForm)
    setEditingItem(null)
    setError('')
  }

  const handleFormChange = (field, value) => {
    setFormState((current) => ({ ...current, [field]: value }))
  }

  const stats = useMemo(() => [
    { label: 'Records', value: records.length, detail: 'Visible entries' },
    { label: 'Programmes', value: overview?.programmeCount ?? 0, detail: 'Academic programmes' },
    { label: 'Sessions', value: overview?.sessionCount ?? 0, detail: 'Academic sessions' },
    { label: 'Notifications', value: overview?.notificationCount ?? 0, detail: 'Active notices' },
  ], [records.length, overview])

  const columns = useMemo(() => buildColumns(activeModule), [activeModule])
  const fields = useMemo(() => buildFields(activeModule), [activeModule])

  const itemPayload = useMemo(() => {
    const moduleItems = api.filteredItems.length ? api.filteredItems : records
    return moduleItems[0] || null
  }, [records, api.filteredItems.length, api.filteredItems])

  if (!canAccess) {
    return <article className="panel"><h3>University administration</h3><p>You do not have access to this module.</p></article>
  }

  return (
    <article className="panel">
      <div className="panel-header">
        <div>
          <h3>University administration</h3>
          <p className="field-hint">Manage academic structure, governance, and communication from one workspace.</p>
        </div>
      </div>

      <div className="academic-tabs" role="tablist" aria-label="University administration modules">
        {MODULES.map((module) => (
          <button key={module.key} type="button" className={`tab-item ${activeModule === module.key ? 'active' : ''}`} onClick={() => handleModuleChange(module.key)}>
            {module.label}
          </button>
        ))}
      </div>

      {error ? <div className="alert">{error}</div> : null}

      {loading ? <div className="loading-card">Loading university administration data…</div> : null}

      {!loading ? (
        <CrudManager
          title={currentModule.label}
          description={`Manage ${currentModule.label.toLowerCase()} with search, filtering, pagination, validation, and detail views.`}
          stats={stats}
          items={api.pagedItems}
          columns={columns}
          searchValue={api.search}
          onSearchChange={api.setSearch}
          filterValue={api.filter}
          onFilterChange={(value) => { api.setFilter(value); api.setPage(1) }}
          filterOptions={[{ value: 'all', label: 'All statuses' }, { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }, { value: 'pending', label: 'Pending' }]}
          selectedItem={api.selectedItem || itemPayload}
          onSelectItem={(item) => api.setSelectedItem(item)}
          onCreate={handleCreate}
          onEdit={handleEdit}
          onDelete={handleDelete}
          formFields={fields}
          formState={formState}
          onFormChange={handleFormChange}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Save record"
          saving={saving}
          error={error}
          emptyMessage="No records found for this module yet."
          showForm={api.showForm}
          showConfirmDelete={api.showConfirmDelete}
          confirmTitle="Delete this record?"
          confirmMessage="This action cannot be undone."
          onConfirmDelete={handleConfirmDelete}
          currentPage={api.page}
          totalPages={api.totalPages}
          onPageChange={(page) => { api.setPage(page); api.setSelectedItem(null) }}
        />
      ) : null}
    </article>
  )
}
