import { Router } from 'express'
import prisma from '../../prisma.js'
import { requireAuth, requireRole } from '../../shared/middlewares/auth.js'

const router = Router()
const validApprovalRoles = ['lecturer', 'hod', 'dean', 'exam_officer', 'admin', 'staff', 'university_administrator']
const validTaskActions = ['approve', 'reject', 'publish']

const normalizeWorkflow = (workflow) => ({
  id: workflow.id,
  institution_id: workflow.institutionId,
  name: workflow.name,
  description: workflow.description,
  is_active: workflow.is_active,
  created_at: workflow.created_at,
  updated_at: workflow.updated_at,
  stages: workflow.stages?.map(normalizeStage) ?? [],
})

const normalizeStage = (stage) => ({
  id: stage.id,
  workflow_id: stage.workflowId,
  name: stage.name,
  role: stage.role,
  order: stage.stage_order,
  is_active: stage.is_active,
  created_at: stage.created_at,
})

const normalizeTask = (task) => ({
  id: task.id,
  workflow_id: task.workflowId,
  institution_id: task.institutionId,
  target_type: task.target_type,
  target_id: task.target_id,
  title: task.title,
  description: task.description,
  status: task.status,
  current_stage_id: task.currentStageId,
  current_stage: task.currentStage ? normalizeStage(task.currentStage) : null,
  created_at: task.created_at,
  updated_at: task.updated_at,
})

const normalizeHistory = (history) => ({
  id: history.id,
  task_id: history.taskId,
  stage_id: history.stageId,
  actor_id: history.actorId,
  actor_name: history.actor.full_name,
  action: history.action,
  comment: history.comment,
  created_at: history.created_at,
})

const normalizeComment = (comment) => ({
  id: comment.id,
  task_id: comment.taskId,
  author_id: comment.authorId,
  author_name: comment.author.full_name,
  message: comment.message,
  created_at: comment.created_at,
})

const normalizePublicationLog = (log) => ({
  id: log.id,
  task_id: log.taskId,
  published_by: log.published_by,
  published_by_name: log.publishedBy.full_name,
  note: log.note,
  created_at: log.created_at,
})

const enforceInstitutionAccess = (institutionId, req, res) => {
  if (req.user.role !== 'admin' && institutionId !== req.user.institutionId) {
    res.status(403).json({ message: 'Forbidden: access denied.' })
    return false
  }
  return true
}

const loadWorkflow = async (id) => {
  return prisma.approvalWorkflow.findUnique({
    where: { id: Number(id) },
    include: { stages: { orderBy: { stage_order: 'asc' } } },
  })
}

const getNextStage = async (workflowId, currentOrder) => {
  return prisma.approvalStage.findFirst({
    where: { workflowId, stage_order: { gt: currentOrder }, is_active: true },
    orderBy: { stage_order: 'asc' },
  })
}

router.get('/', requireAuth, (req, res) => {
  res.json({ status: 'ok', module: 'approval' })
})

router.get('/workflows', requireAuth, async (req, res) => {
  try {
    const where = {}
    if (req.user.role !== 'admin') {
      where.institutionId = req.user.institutionId
    }
    if (req.query.is_active !== undefined) {
      where.is_active = String(req.query.is_active).toLowerCase() === 'true'
    }

    const workflows = await prisma.approvalWorkflow.findMany({
      where,
      orderBy: { id: 'desc' },
      include: { stages: { orderBy: { stage_order: 'asc' } } },
    })

    res.json(workflows.map(normalizeWorkflow))
  } catch (error) {
    console.error('Failed to load approval workflows:', error)
    res.status(500).json({ message: 'Unable to load approval workflows.' })
  }
})

router.post('/workflows', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { name, description, institution_id, stages = [] } = req.body
    if (!name) {
      return res.status(400).json({ message: 'Workflow name is required.' })
    }

    const institutionId = Number(institution_id ?? req.user.institutionId)
    if (!institutionId || Number.isNaN(institutionId)) {
      return res.status(400).json({ message: 'Valid institution_id is required.' })
    }

    const stageData = stages.map((stage, index) => {
      const role = String(stage.role || '').toLowerCase()
      if (!validApprovalRoles.includes(role)) {
        throw new Error(`Invalid stage role: ${stage.role}`)
      }
      if (!stage.name) {
        throw new Error('Each stage requires a name.')
      }
      return {
        name: stage.name,
        role,
        stage_order: stage.stage_order ?? index + 1,
      }
    })

    const workflow = await prisma.approvalWorkflow.create({
      data: {
        name,
        description,
        institutionId,
        stages: {
          create: stageData,
        },
      },
      include: { stages: { orderBy: { stage_order: 'asc' } } },
    })

    res.status(201).json(normalizeWorkflow(workflow))
  } catch (error) {
    console.error('Failed to create approval workflow:', error)
    res.status(400).json({ message: error.message || 'Unable to create approval workflow.' })
  }
})

router.get('/workflows/:id', requireAuth, async (req, res) => {
  try {
    const workflow = await loadWorkflow(req.params.id)
    if (!workflow) {
      return res.status(404).json({ message: 'Approval workflow not found.' })
    }

    if (!enforceInstitutionAccess(workflow.institutionId, req, res)) {
      return
    }

    res.json(normalizeWorkflow(workflow))
  } catch (error) {
    console.error('Failed to load approval workflow:', error)
    res.status(500).json({ message: 'Unable to load approval workflow.' })
  }
})

router.put('/workflows/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const workflow = await loadWorkflow(req.params.id)
    if (!workflow) {
      return res.status(404).json({ message: 'Approval workflow not found.' })
    }

    const { name, description, is_active } = req.body
    const updateData = {}
    if (name) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (is_active !== undefined) updateData.is_active = Boolean(is_active)

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No fields provided for update.' })
    }

    const updatedWorkflow = await prisma.approvalWorkflow.update({
      where: { id: workflow.id },
      data: updateData,
      include: { stages: { orderBy: { stage_order: 'asc' } } },
    })

    res.json(normalizeWorkflow(updatedWorkflow))
  } catch (error) {
    console.error('Failed to update approval workflow:', error)
    res.status(400).json({ message: error.message || 'Unable to update approval workflow.' })
  }
})

router.delete('/workflows/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const workflow = await loadWorkflow(req.params.id)
    if (!workflow) {
      return res.status(404).json({ message: 'Approval workflow not found.' })
    }

    await prisma.approvalWorkflow.update({
      where: { id: workflow.id },
      data: { is_active: false },
    })

    res.status(204).send()
  } catch (error) {
    console.error('Failed to retire approval workflow:', error)
    res.status(500).json({ message: 'Unable to remove approval workflow.' })
  }
})

router.post('/workflows/:id/stages', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const workflow = await loadWorkflow(req.params.id)
    if (!workflow) {
      return res.status(404).json({ message: 'Approval workflow not found.' })
    }

    const { name, role, order } = req.body
    if (!name || !role) {
      return res.status(400).json({ message: 'Stage name and role are required.' })
    }

    const normalizedRole = String(role).toLowerCase()
    if (!validApprovalRoles.includes(normalizedRole)) {
      return res.status(400).json({ message: 'Invalid stage role.' })
    }

    const stageOrder = Number(order ?? (workflow.stages.length + 1))
    if (Number.isNaN(stageOrder) || stageOrder < 1) {
      return res.status(400).json({ message: 'Stage order must be a positive number.' })
    }

    const stage = await prisma.approvalStage.create({
      data: {
        workflowId: workflow.id,
        name,
        role: normalizedRole,
        stage_order: stageOrder,
      },
    })

    res.status(201).json(normalizeStage(stage))
  } catch (error) {
    console.error('Failed to create approval stage:', error)
    res.status(400).json({ message: error.message || 'Unable to create approval stage.' })
  }
})

router.put('/stages/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const stageId = Number(req.params.id)
    if (Number.isNaN(stageId)) {
      return res.status(400).json({ message: 'Invalid stage identifier.' })
    }

    const stage = await prisma.approvalStage.findUnique({ where: { id: stageId } })
    if (!stage) {
      return res.status(404).json({ message: 'Approval stage not found.' })
    }

    const workflow = await loadWorkflow(stage.workflowId)
    if (!workflow) {
      return res.status(404).json({ message: 'Approval workflow not found.' })
    }

    const { name, role, order, is_active } = req.body
    const updateData = {}

    if (name) updateData.name = name
    if (role) {
      const normalizedRole = String(role).toLowerCase()
      if (!validApprovalRoles.includes(normalizedRole)) {
        return res.status(400).json({ message: 'Invalid stage role.' })
      }
      updateData.role = normalizedRole
    }
    if (order !== undefined) {
      const stageOrder = Number(order)
      if (Number.isNaN(stageOrder) || stageOrder < 1) {
        return res.status(400).json({ message: 'Stage order must be a positive number.' })
      }
      updateData.stage_order = stageOrder
    }
    if (is_active !== undefined) updateData.is_active = Boolean(is_active)

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No fields provided for stage update.' })
    }

    const updatedStage = await prisma.approvalStage.update({ where: { id: stage.id }, data: updateData })
    res.json(normalizeStage(updatedStage))
  } catch (error) {
    console.error('Failed to update approval stage:', error)
    res.status(400).json({ message: error.message || 'Unable to update approval stage.' })
  }
})

router.delete('/stages/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const stageId = Number(req.params.id)
    if (Number.isNaN(stageId)) {
      return res.status(400).json({ message: 'Invalid stage identifier.' })
    }

    const stage = await prisma.approvalStage.findUnique({ where: { id: stageId } })
    if (!stage) {
      return res.status(404).json({ message: 'Approval stage not found.' })
    }

    await prisma.approvalStage.delete({ where: { id: stage.id } })
    res.status(204).send()
  } catch (error) {
    console.error('Failed to delete approval stage:', error)
    res.status(500).json({ message: 'Unable to delete approval stage.' })
  }
})

router.get('/tasks', requireAuth, async (req, res) => {
  try {
    const where = {}
    if (req.user.role !== 'admin') {
      where.institutionId = req.user.institutionId
    }
    if (req.query.workflow_id) {
      where.workflowId = Number(req.query.workflow_id)
    }
    if (req.query.target_type) {
      where.target_type = String(req.query.target_type)
    }
    if (req.query.status) {
      where.status = String(req.query.status)
    }

    const tasks = await prisma.approvalTask.findMany({
      where,
      orderBy: { id: 'desc' },
      include: { currentStage: true },
    })

    res.json(tasks.map(normalizeTask))
  } catch (error) {
    console.error('Failed to load approval tasks:', error)
    res.status(500).json({ message: 'Unable to load approval tasks.' })
  }
})

router.get('/tasks/:id', requireAuth, async (req, res) => {
  try {
    const taskId = Number(req.params.id)
    if (Number.isNaN(taskId)) {
      return res.status(400).json({ message: 'Invalid task identifier.' })
    }

    const task = await prisma.approvalTask.findUnique({
      where: { id: taskId },
      include: {
        currentStage: true,
        workflow: true,
        history: { include: { actor: true, stage: true }, orderBy: { created_at: 'asc' } },
        comments: { include: { author: true }, orderBy: { created_at: 'asc' } },
        publicationLogs: { include: { publishedBy: true }, orderBy: { created_at: 'asc' } },
      },
    })

    if (!task) {
      return res.status(404).json({ message: 'Approval task not found.' })
    }

    if (!enforceInstitutionAccess(task.institutionId, req, res)) {
      return
    }

    res.json({
      ...normalizeTask(task),
      history: task.history.map(normalizeHistory),
      comments: task.comments.map(normalizeComment),
      publication_logs: task.publicationLogs.map(normalizePublicationLog),
    })
  } catch (error) {
    console.error('Failed to load approval task:', error)
    res.status(500).json({ message: 'Unable to load approval task.' })
  }
})

router.post('/tasks', requireAuth, requireRole('admin', 'lecturer', 'hod', 'dean', 'exam_officer', 'staff', 'university_administrator'), async (req, res) => {
  try {
    const { workflow_id, target_type, target_id, title, description } = req.body
    if (!workflow_id || !target_type || !target_id || !title) {
      return res.status(400).json({ message: 'workflow_id, target_type, target_id and title are required.' })
    }

    const workflow = await loadWorkflow(workflow_id)
    if (!workflow || !workflow.is_active) {
      return res.status(404).json({ message: 'Approval workflow not found or not active.' })
    }

    if (!enforceInstitutionAccess(workflow.institutionId, req, res)) {
      return
    }

    const firstStage = workflow.stages[0]
    if (!firstStage) {
      return res.status(400).json({ message: 'Approval workflow has no stages defined.' })
    }

    const task = await prisma.approvalTask.create({
      data: {
        workflowId: workflow.id,
        institutionId: workflow.institutionId,
        target_type: String(target_type),
        target_id: Number(target_id),
        title: String(title),
        description: description || null,
        currentStageId: firstStage.id,
      },
      include: { currentStage: true },
    })

    await prisma.approvalHistory.create({
      data: {
        taskId: task.id,
        stageId: firstStage.id,
        actorId: req.user.id,
        action: 'submitted',
        comment: 'Task submitted for approval.',
      },
    })

    const createdTask = await prisma.approvalTask.findUnique({
      where: { id: task.id },
      include: { currentStage: true },
    })

    res.status(201).json(normalizeTask(createdTask))
  } catch (error) {
    console.error('Failed to create approval task:', error)
    res.status(400).json({ message: error.message || 'Unable to create approval task.' })
  }
})

router.post('/tasks/:id/actions', requireAuth, async (req, res) => {
  try {
    const taskId = Number(req.params.id)
    if (Number.isNaN(taskId)) {
      return res.status(400).json({ message: 'Invalid task identifier.' })
    }

    const { action, comment } = req.body
    if (!action || !validTaskActions.includes(String(action).toLowerCase())) {
      return res.status(400).json({ message: `Action must be one of: ${validTaskActions.join(', ')}.` })
    }

    const task = await prisma.approvalTask.findUnique({
      where: { id: taskId },
      include: { currentStage: true, workflow: { include: { stages: { orderBy: { stage_order: 'asc' } } } } },
    })
    if (!task) {
      return res.status(404).json({ message: 'Approval task not found.' })
    }

    if (!enforceInstitutionAccess(task.institutionId, req, res)) {
      return
    }

    const normalizedAction = String(action).toLowerCase()
    if (normalizedAction === 'publish') {
      if (task.status !== 'approved') {
        return res.status(400).json({ message: 'Only approved tasks can be published.' })
      }
      if (req.user.role !== 'exam_officer' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: only exam officer or admin can publish.' })
      }

      const updatedTask = await prisma.approvalTask.update({
        where: { id: task.id },
        data: { status: 'published', currentStageId: null },
        include: { currentStage: true },
      })

      await prisma.publicationLog.create({
        data: {
          taskId: task.id,
          published_by: req.user.id,
          note: comment || 'Published approval item.',
        },
      })

      await prisma.approvalHistory.create({
        data: {
          taskId: task.id,
          stageId: task.currentStageId,
          actorId: req.user.id,
          action: 'published',
          comment: comment || null,
        },
      })

      return res.json(normalizeTask(updatedTask))
    }

    if (!task.currentStage) {
      return res.status(400).json({ message: 'Approval task is not assigned to a current stage.' })
    }

    if (req.user.role !== task.currentStage.role && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: inactive role for this stage.' })
    }

    if (normalizedAction === 'reject') {
      const updatedTask = await prisma.approvalTask.update({
        where: { id: task.id },
        data: { status: 'rejected' },
        include: { currentStage: true },
      })

      await prisma.approvalHistory.create({
        data: {
          taskId: task.id,
          stageId: task.currentStage.id,
          actorId: req.user.id,
          action: 'rejected',
          comment: comment || null,
        },
      })

      return res.json(normalizeTask(updatedTask))
    }

    if (normalizedAction === 'approve') {
      if (task.status !== 'pending') {
        return res.status(400).json({ message: 'Only pending tasks can be approved.' })
      }

      const nextStage = await getNextStage(task.workflowId, task.currentStage.stage_order)
      const updatedTask = await prisma.approvalTask.update({
        where: { id: task.id },
        data: {
          currentStageId: nextStage ? nextStage.id : null,
          status: nextStage ? 'pending' : 'approved',
        },
        include: { currentStage: true },
      })

      await prisma.approvalHistory.create({
        data: {
          taskId: task.id,
          stageId: task.currentStage.id,
          actorId: req.user.id,
          action: 'approved',
          comment: comment || null,
        },
      })

      return res.json(normalizeTask(updatedTask))
    }

    return res.status(400).json({ message: 'Unsupported action.' })
  } catch (error) {
    console.error('Failed to perform approval action:', error)
    res.status(400).json({ message: error.message || 'Unable to perform approval action.' })
  }
})

router.post('/tasks/:id/comments', requireAuth, async (req, res) => {
  try {
    const taskId = Number(req.params.id)
    if (Number.isNaN(taskId)) {
      return res.status(400).json({ message: 'Invalid task identifier.' })
    }

    const { message } = req.body
    if (!message) {
      return res.status(400).json({ message: 'Comment message is required.' })
    }

    const task = await prisma.approvalTask.findUnique({ where: { id: taskId } })
    if (!task) {
      return res.status(404).json({ message: 'Approval task not found.' })
    }

    if (!enforceInstitutionAccess(task.institutionId, req, res)) {
      return
    }

    const comment = await prisma.approvalComment.create({
      data: {
        taskId: task.id,
        authorId: req.user.id,
        message: String(message),
      },
      include: { author: true },
    })

    res.status(201).json(normalizeComment(comment))
  } catch (error) {
    console.error('Failed to create approval comment:', error)
    res.status(400).json({ message: error.message || 'Unable to create approval comment.' })
  }
})

router.get('/publication-logs', requireAuth, async (req, res) => {
  try {
    const where = {}
    if (req.user.role !== 'admin') {
      where.task = { institutionId: req.user.institutionId }
    }

    const logs = await prisma.publicationLog.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: { publishedBy: true },
    })

    res.json(logs.map(normalizePublicationLog))
  } catch (error) {
    console.error('Failed to load publication logs:', error)
    res.status(500).json({ message: 'Unable to load publication logs.' })
  }
})

export default router
