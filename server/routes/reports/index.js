import { Router } from 'express'
import prisma from '../../prisma.js'
import { requireAuth, requireRole } from '../../shared/middlewares/auth.js'

const router = Router()
const reportRoles = requireRole('admin', 'staff', 'university_administrator', 'exam_officer', 'dean', 'hod')

const buildInstitutionFilter = (req) => {
  if (req.user.role === 'admin' && req.query.institution_id) {
    return { institutionId: Number(req.query.institution_id) }
  }
  if (req.user.role !== 'admin') {
    return { institutionId: req.user.institutionId }
  }
  return {}
}

const parseNumber = (value) => {
  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

router.get('/', requireAuth, (req, res) => {
  res.json({ status: 'ok', module: 'reports' })
})

router.get('/student-reports', requireAuth, reportRoles, async (req, res) => {
  try {
    const filter = buildInstitutionFilter(req)
    if (req.query.department_id) {
      filter.departmentId = parseNumber(req.query.department_id)
    }
    if (req.query.semester) {
      filter.semester = String(req.query.semester)
    }

    const totalStudents = await prisma.student.count({ where: filter })
    const byDepartment = await prisma.student.groupBy({
      by: ['departmentId'],
      where: filter,
      _count: { id: true },
    })
    const bySemester = await prisma.student.groupBy({
      by: ['semester'],
      where: filter,
      _count: { id: true },
    })

    const departmentNames = await prisma.department.findMany({
      where: { id: { in: byDepartment.map((row) => row.departmentId).filter(Boolean) } },
      select: { id: true, name: true },
    })

    res.json({
      total_students: totalStudents,
      by_department: byDepartment.map((item) => ({
        department_id: item.departmentId,
        department_name: departmentNames.find((dept) => dept.id === item.departmentId)?.name ?? null,
        count: item._count.id,
      })),
      by_semester: bySemester.map((item) => ({
        semester: item.semester,
        count: item._count.id,
      })),
    })
  } catch (error) {
    console.error('Failed to load student reports:', error)
    res.status(500).json({ message: 'Unable to load student reports.' })
  }
})

router.get('/department-reports', requireAuth, reportRoles, async (req, res) => {
  try {
    const filter = buildInstitutionFilter(req)
    const departments = await prisma.department.findMany({ where: filter, select: { id: true, name: true } })
    const results = await prisma.result.findMany({
      where: filter,
      select: { percentage: true, grade: true, student: { select: { departmentId: true } } },
    })

    const departmentSummary = departments.map((department) => {
      const departmentResults = results.filter((result) => result.student.departmentId === department.id)
      const average = departmentResults.length
        ? departmentResults.reduce((sum, item) => sum + item.percentage, 0) / departmentResults.length
        : 0
      const passCount = departmentResults.filter((item) => item.grade !== 'F').length
      return {
        department_id: department.id,
        department_name: department.name,
        result_count: departmentResults.length,
        average_percentage: Number(average.toFixed(2)),
        pass_rate: departmentResults.length ? Number(((passCount / departmentResults.length) * 100).toFixed(2)) : 0,
      }
    })

    res.json({ departments: departmentSummary })
  } catch (error) {
    console.error('Failed to load department reports:', error)
    res.status(500).json({ message: 'Unable to load department reports.' })
  }
})

router.get('/faculty-reports', requireAuth, reportRoles, async (req, res) => {
  try {
    const filter = buildInstitutionFilter(req)
    const faculties = await prisma.faculty.findMany({ where: filter, select: { id: true, name: true } })
    const departments = await prisma.department.findMany({ where: filter, select: { id: true, facultyId: true } })
    const results = await prisma.result.findMany({
      where: filter,
      select: { percentage: true, grade: true, student: { select: { departmentId: true } } },
    })

    const facultySummary = faculties.map((faculty) => {
      const departmentIds = departments.filter((d) => d.facultyId === faculty.id).map((d) => d.id)
      const facultyResults = results.filter((result) => departmentIds.includes(result.student.departmentId))
      const average = facultyResults.length
        ? facultyResults.reduce((sum, item) => sum + item.percentage, 0) / facultyResults.length
        : 0
      const passCount = facultyResults.filter((item) => item.grade !== 'F').length
      return {
        faculty_id: faculty.id,
        faculty_name: faculty.name,
        result_count: facultyResults.length,
        average_percentage: Number(average.toFixed(2)),
        pass_rate: facultyResults.length ? Number(((passCount / facultyResults.length) * 100).toFixed(2)) : 0,
      }
    })

    res.json({ faculties: facultySummary })
  } catch (error) {
    console.error('Failed to load faculty reports:', error)
    res.status(500).json({ message: 'Unable to load faculty reports.' })
  }
})

router.get('/graduation-reports', requireAuth, reportRoles, async (req, res) => {
  try {
    const filter = buildInstitutionFilter(req)
    const withSession = { ...filter }
    if (req.query.academic_session) {
      withSession.academic_session = String(req.query.academic_session)
    }

    const results = await prisma.result.findMany({ where: withSession, select: { pass_fail: true, academic_session: true } })
    const total = results.length
    const passCount = results.filter((item) => item.pass_fail === 'PASS').length
    const failCount = results.filter((item) => item.pass_fail === 'FAIL').length

    const bySession = Array.from(results.reduce((map, result) => {
      const session = result.academic_session || 'unknown'
      if (!map.has(session)) {
        map.set(session, { session, total: 0, pass: 0, fail: 0 })
      }
      const entry = map.get(session)
      entry.total += 1
      if (result.pass_fail === 'PASS') entry.pass += 1
      if (result.pass_fail === 'FAIL') entry.fail += 1
      return map
    }, new Map()).values())

    res.json({
      total_results: total,
      pass_count: passCount,
      fail_count: failCount,
      pass_rate: total ? Number(((passCount / total) * 100).toFixed(2)) : 0,
      by_academic_session: bySession.map((item) => ({
        academic_session: item.session,
        total: item.total,
        pass: item.pass,
        fail: item.fail,
        pass_rate: item.total ? Number(((item.pass / item.total) * 100).toFixed(2)) : 0,
      })),
    })
  } catch (error) {
    console.error('Failed to load graduation reports:', error)
    res.status(500).json({ message: 'Unable to load graduation reports.' })
  }
})

router.get('/transcript-reports', requireAuth, reportRoles, async (req, res) => {
  try {
    const filter = buildInstitutionFilter(req)
    if (req.query.academic_session) {
      filter.academic_session = String(req.query.academic_session)
    }

    const totalTranscripts = await prisma.transcript.count({ where: filter })
    const bySession = await prisma.transcript.groupBy({
      by: ['academic_session'],
      where: filter,
      _count: { id: true },
    })

    res.json({
      total_transcripts: totalTranscripts,
      by_academic_session: bySession.map((item) => ({ academic_session: item.academic_session, count: item._count.id })),
    })
  } catch (error) {
    console.error('Failed to load transcript reports:', error)
    res.status(500).json({ message: 'Unable to load transcript reports.' })
  }
})

router.get('/performance-analytics', requireAuth, reportRoles, async (req, res) => {
  try {
    const filter = buildInstitutionFilter(req)
    const gradeGroups = await prisma.result.groupBy({
      by: ['grade'],
      where: filter,
      _count: { id: true },
    })
    const passFailGroups = await prisma.result.groupBy({
      by: ['pass_fail'],
      where: filter,
      _count: { id: true },
    })
    const aggregate = await prisma.result.aggregate({
      where: filter,
      _avg: { percentage: true },
      _min: { percentage: true },
      _max: { percentage: true },
    })

    res.json({
      average_percentage: aggregate._avg.percentage ?? 0,
      min_percentage: aggregate._min.percentage ?? 0,
      max_percentage: aggregate._max.percentage ?? 0,
      grade_distribution: gradeGroups.map((group) => ({ grade: group.grade, count: group._count.id })),
      pass_fail_distribution: passFailGroups.map((group) => ({ status: group.pass_fail, count: group._count.id })),
    })
  } catch (error) {
    console.error('Failed to load performance analytics:', error)
    res.status(500).json({ message: 'Unable to load performance analytics.' })
  }
})

router.get('/dashboard-statistics', requireAuth, reportRoles, async (req, res) => {
  try {
    const filter = buildInstitutionFilter(req)
    const [studentCount, courseCount, resultCount, transcriptCount, departmentCount, facultyCount] = await Promise.all([
      prisma.student.count({ where: filter }),
      prisma.course.count({ where: filter }),
      prisma.result.count({ where: filter }),
      prisma.transcript.count({ where: filter }),
      prisma.department.count({ where: filter }),
      prisma.faculty.count({ where: filter }),
    ])
    const resultAgg = await prisma.result.aggregate({ where: filter, _avg: { percentage: true } })

    res.json({
      students: studentCount,
      courses: courseCount,
      results: resultCount,
      transcripts: transcriptCount,
      departments: departmentCount,
      faculties: facultyCount,
      average_result_percentage: resultAgg._avg.percentage ?? 0,
    })
  } catch (error) {
    console.error('Failed to load dashboard statistics:', error)
    res.status(500).json({ message: 'Unable to load dashboard statistics.' })
  }
})

export default router
