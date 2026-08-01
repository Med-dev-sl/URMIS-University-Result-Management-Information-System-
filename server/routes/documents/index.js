import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import multer from 'multer'
import prisma from '../../prisma-runtime.js'
import { requireAuth, requireRole } from '../../shared/middlewares/auth.js'
import { createAuditLog } from '../../shared/security/auditService.js'
import uploadsRoutes from './uploads.js'

const router = Router()
const uploadDir = path.resolve(process.cwd(), 'uploads', 'documents')
fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const timestamp = Date.now()
    const safeName = file.originalname.replace(/\s+/g, '_')
    cb(null, `${timestamp}-${safeName}`)
  },
})

const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } })

const documentRoles = requireRole('admin', 'staff', 'lecturer', 'hod', 'dean', 'exam_officer', 'university_administrator')

const getInstitutionId = (req) => {
  if (req.user.role === 'admin' && req.query.institution_id) {
    return Number(req.query.institution_id)
  }
  return req.user.institutionId
}

const normalizeDocument = (document) => ({
  id: document.id,
  institutionId: document.institutionId,
  folderId: document.folderId,
  uploadedBy: document.uploadedBy,
  faculty: document.faculty,
  department: document.department,
  title: document.title,
  description: document.description,
  fileName: document.fileName,
  storedName: document.storedName,
  mimeType: document.mimeType,
  size: document.size,
  version: document.version,
  isArchived: document.isArchived,
  archivedAt: document.archivedAt,
  created_at: document.created_at,
  updated_at: document.updated_at,
})

const requireDocumentAccess = async (req, documentId) => {
  const document = await prisma.document.findUnique({ where: { id: documentId } })
  if (!document) {
    return { document: null, allowed: false }
  }
  if (req.user.role === 'admin' || document.institutionId === req.user.institutionId) {
    return { document, allowed: true }
  }
  return { document, allowed: false }
}

router.get('/', requireAuth, documentRoles, async (req, res) => {
  try {
    const institutionId = getInstitutionId(req)
    if (!institutionId) {
      return res.status(400).json({ message: 'Institution context is required.' })
    }

    const where = { institutionId }
    if (req.query.faculty) where.faculty = String(req.query.faculty)
    if (req.query.department) where.department = String(req.query.department)
    if (req.query.archived === 'true') where.isArchived = true
    if (req.query.archived === 'false') where.isArchived = false
    if (req.query.folderId) where.folderId = Number(req.query.folderId)

    const documents = await prisma.document.findMany({
      where,
      include: { folder: true, uploader: { select: { id: true, full_name: true } } },
      orderBy: { created_at: 'desc' },
    })

    return res.json(documents.map(normalizeDocument))
  } catch (error) {
    console.error('Failed to load documents:', error)
    return res.status(500).json({ message: 'Unable to load documents.' })
  }
})

router.post('/', requireAuth, documentRoles, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'File is required.' })
    }

    const institutionId = getInstitutionId(req)
    if (!institutionId) {
      return res.status(400).json({ message: 'Institution context is required.' })
    }

    const folderId = req.body.folderId ? Number(req.body.folderId) : null
    const document = await prisma.document.create({
      data: {
        institutionId,
        folderId,
        uploadedBy: req.user.id,
        faculty: req.body.faculty ? String(req.body.faculty) : null,
        department: req.body.department ? String(req.body.department) : null,
        title: req.body.title ? String(req.body.title) : req.file.originalname,
        description: req.body.description ? String(req.body.description) : null,
        fileName: req.file.originalname,
        storedName: req.file.filename,
        mimeType: req.file.mimetype,
        size: req.file.size,
      },
    })

    await prisma.documentVersion.create({
      data: {
        institutionId,
        documentId: document.id,
        uploadedBy: req.user.id,
        versionNumber: 1,
        fileName: req.file.originalname,
        storedName: req.file.filename,
        mimeType: req.file.mimetype,
        size: req.file.size,
        changeSummary: 'Initial upload',
      },
    })

    await createAuditLog({
      institutionId,
      userId: req.user.id,
      route: req.originalUrl,
      method: req.method,
      action: 'document_uploaded',
      details: JSON.stringify({ documentId: document.id, title: document.title }),
      ip: req.ip,
      userAgent: req.get('user-agent'),
    })

    return res.status(201).json(normalizeDocument(document))
  } catch (error) {
    console.error('Failed to create document:', error)
    return res.status(500).json({ message: 'Unable to create document.' })
  }
})

router.put('/:id', requireAuth, documentRoles, async (req, res) => {
  try {
    const documentId = Number(req.params.id)
    const { document: existing, allowed } = await requireDocumentAccess(req, documentId)
    if (!allowed) {
      return res.status(403).json({ message: 'Forbidden: access denied.' })
    }

    const updated = await prisma.document.update({
      where: { id: documentId },
      data: {
        title: req.body.title ? String(req.body.title) : existing.title,
        description: req.body.description !== undefined ? String(req.body.description) : existing.description,
        faculty: req.body.faculty !== undefined ? String(req.body.faculty) : existing.faculty,
        department: req.body.department !== undefined ? String(req.body.department) : existing.department,
        folderId: req.body.folderId !== undefined ? Number(req.body.folderId) : existing.folderId,
        isArchived: req.body.isArchived !== undefined ? Boolean(req.body.isArchived) : existing.isArchived,
        archivedAt: req.body.isArchived !== undefined && Boolean(req.body.isArchived) ? new Date() : null,
      },
    })

    await createAuditLog({
      institutionId: existing.institutionId,
      userId: req.user.id,
      route: req.originalUrl,
      method: req.method,
      action: 'document_updated',
      details: JSON.stringify({ documentId, changes: req.body }),
      ip: req.ip,
      userAgent: req.get('user-agent'),
    })

    return res.json(normalizeDocument(updated))
  } catch (error) {
    console.error('Failed to update document:', error)
    return res.status(500).json({ message: 'Unable to update document.' })
  }
})

router.delete('/:id', requireAuth, documentRoles, async (req, res) => {
  try {
    const documentId = Number(req.params.id)
    const { document, allowed } = await requireDocumentAccess(req, documentId)
    if (!allowed) {
      return res.status(403).json({ message: 'Forbidden: access denied.' })
    }

    await prisma.documentVersion.deleteMany({ where: { documentId } })
    await prisma.document.delete({ where: { id: documentId } })

    await createAuditLog({
      institutionId: document.institutionId,
      userId: req.user.id,
      route: req.originalUrl,
      method: req.method,
      action: 'document_deleted',
      details: JSON.stringify({ documentId }),
      ip: req.ip,
      userAgent: req.get('user-agent'),
    })

    return res.status(204).send()
  } catch (error) {
    console.error('Failed to delete document:', error)
    return res.status(500).json({ message: 'Unable to delete document.' })
  }
})

router.get('/search', requireAuth, documentRoles, async (req, res) => {
  try {
    const institutionId = getInstitutionId(req)
    if (!institutionId) {
      return res.status(400).json({ message: 'Institution context is required.' })
    }

    const query = String(req.query.q || '').trim()
    if (!query) {
      return res.json([])
    }

    const documents = await prisma.document.findMany({
      where: {
        institutionId,
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
          { fileName: { contains: query } },
          { faculty: { contains: query } },
          { department: { contains: query } },
        ],
      },
      include: { folder: true, uploader: { select: { id: true, full_name: true } } },
      orderBy: { created_at: 'desc' },
    })

    return res.json(documents.map(normalizeDocument))
  } catch (error) {
    console.error('Failed to search documents:', error)
    return res.status(500).json({ message: 'Unable to search documents.' })
  }
})

router.post('/:id/restore', requireAuth, documentRoles, async (req, res) => {
  try {
    const documentId = Number(req.params.id)
    const { document, allowed } = await requireDocumentAccess(req, documentId)
    if (!allowed) {
      return res.status(403).json({ message: 'Forbidden: access denied.' })
    }

    const restored = await prisma.document.update({
      where: { id: documentId },
      data: {
        isArchived: false,
        archivedAt: null,
      },
    })

    await createAuditLog({
      institutionId: document.institutionId,
      userId: req.user.id,
      route: req.originalUrl,
      method: req.method,
      action: 'document_restored',
      details: JSON.stringify({ documentId }),
      ip: req.ip,
      userAgent: req.get('user-agent'),
    })

    return res.json(normalizeDocument(restored))
  } catch (error) {
    console.error('Failed to restore document:', error)
    return res.status(500).json({ message: 'Unable to restore document.' })
  }
})

router.get('/:id/versions', requireAuth, documentRoles, async (req, res) => {
  try {
    const documentId = Number(req.params.id)
    const { allowed } = await requireDocumentAccess(req, documentId)
    if (!allowed) {
      return res.status(403).json({ message: 'Forbidden: access denied.' })
    }

    const versions = await prisma.documentVersion.findMany({
      where: { documentId },
      orderBy: { versionNumber: 'asc' },
    })

    return res.json(versions)
  } catch (error) {
    console.error('Failed to load document versions:', error)
    return res.status(500).json({ message: 'Unable to load document versions.' })
  }
})

router.post('/:id/download', requireAuth, documentRoles, async (req, res) => {
  try {
    const documentId = Number(req.params.id)
    const { document, allowed } = await requireDocumentAccess(req, documentId)
    if (!allowed) {
      return res.status(403).json({ message: 'Forbidden: access denied.' })
    }

    const fullPath = path.resolve(process.cwd(), 'uploads', 'documents', document.storedName)
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: 'File not found on disk.' })
    }

    await createAuditLog({
      institutionId: document.institutionId,
      userId: req.user.id,
      route: req.originalUrl,
      method: req.method,
      action: 'document_downloaded',
      details: JSON.stringify({ documentId }),
      ip: req.ip,
      userAgent: req.get('user-agent'),
    })

    return res.download(fullPath, document.fileName)
  } catch (error) {
    console.error('Failed to download document:', error)
    return res.status(500).json({ message: 'Unable to download document.' })
  }
})

router.post('/folders', requireAuth, documentRoles, async (req, res) => {
  try {
    const institutionId = getInstitutionId(req)
    if (!institutionId) {
      return res.status(400).json({ message: 'Institution context is required.' })
    }

    const folder = await prisma.documentFolder.create({
      data: {
        institutionId,
        createdBy: req.user.id,
        name: String(req.body.name || 'New Folder'),
        parentFolderId: req.body.parentFolderId ? Number(req.body.parentFolderId) : null,
        description: req.body.description ? String(req.body.description) : null,
      },
    })

    return res.status(201).json(folder)
  } catch (error) {
    console.error('Failed to create folder:', error)
    return res.status(500).json({ message: 'Unable to create folder.' })
  }
})

router.get('/folders', requireAuth, documentRoles, async (req, res) => {
  try {
    const institutionId = getInstitutionId(req)
    if (!institutionId) {
      return res.status(400).json({ message: 'Institution context is required.' })
    }

    const folders = await prisma.documentFolder.findMany({
      where: { institutionId },
      include: { children: true },
      orderBy: { created_at: 'desc' },
    })

    return res.json(folders)
  } catch (error) {
    console.error('Failed to load folders:', error)
    return res.status(500).json({ message: 'Unable to load folders.' })
  }
})

router.put('/folders/:id', requireAuth, documentRoles, async (req, res) => {
  try {
    const folderId = Number(req.params.id)
    const folder = await prisma.documentFolder.findUnique({ where: { id: folderId } })
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found.' })
    }

    const updated = await prisma.documentFolder.update({
      where: { id: folderId },
      data: {
        name: req.body.name ? String(req.body.name) : folder.name,
        description: req.body.description !== undefined ? String(req.body.description) : folder.description,
        isArchived: req.body.isArchived !== undefined ? Boolean(req.body.isArchived) : folder.isArchived,
      },
    })

    return res.json(updated)
  } catch (error) {
    console.error('Failed to update folder:', error)
    return res.status(500).json({ message: 'Unable to update folder.' })
  }
})

router.delete('/folders/:id', requireAuth, documentRoles, async (req, res) => {
  try {
    const folderId = Number(req.params.id)
    const folder = await prisma.documentFolder.findUnique({ where: { id: folderId } })
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found.' })
    }

    await prisma.documentFolder.delete({ where: { id: folderId } })
    return res.status(204).send()
  } catch (error) {
    console.error('Failed to delete folder:', error)
    return res.status(500).json({ message: 'Unable to delete folder.' })
  }
})

router.use('/uploads', uploadsRoutes)

export default router
