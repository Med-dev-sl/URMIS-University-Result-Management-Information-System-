import { Router } from 'express'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { requireAuth, requireRole } from '../../shared/middlewares/auth.js'
import prisma from '../../prisma.js'

const router = Router()
const uploadDir = path.resolve(process.cwd(), 'uploads', 'documents')
fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const timestamp = Date.now()
    const safeName = file.originalname.replace(/\s+/g, '_')
    cb(null, `${timestamp}-${safeName}`)
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
})

const documentRoles = requireRole('admin', 'staff', 'lecturer', 'hod', 'dean', 'exam_officer', 'university_administrator')

const getInstitutionId = (req) => {
  if (req.user.role === 'admin') {
    return req.query.institution_id ? Number(req.query.institution_id) : req.user.institutionId
  }
  return req.user.institutionId
}

const normalizeDocument = (document) => ({
  id: document.id,
  institution_id: document.institutionId,
  uploaded_by: document.uploaded_by,
  uploader_name: document.uploader?.full_name ?? null,
  original_name: document.original_name,
  stored_name: document.stored_name,
  mime_type: document.mime_type,
  size: document.size,
  category: document.category,
  description: document.description,
  path: document.path,
  url: document.url,
  created_at: document.created_at,
  updated_at: document.updated_at,
})

const enforceDocumentAccess = (document, req, res) => {
  if (!document) {
    res.status(404).json({ message: 'Document not found.' })
    return false
  }
  if (req.user.role !== 'admin' && document.institutionId !== req.user.institutionId) {
    res.status(403).json({ message: 'Forbidden: access denied.' })
    return false
  }
  return true
}

router.get('/', requireAuth, documentRoles, async (req, res) => {
  try {
    const institutionId = getInstitutionId(req)
    if (!institutionId || Number.isNaN(institutionId)) {
      return res.status(400).json({ message: 'Valid institution_id is required.' })
    }

    const filter = { institutionId }
    if (req.query.category) {
      filter.category = String(req.query.category)
    }

    const documents = await prisma.uploadedDocument.findMany({
      where: filter,
      include: { uploader: true },
      orderBy: { created_at: 'desc' },
    })

    res.json(documents.map(normalizeDocument))
  } catch (error) {
    console.error('Failed to list uploaded documents:', error)
    res.status(500).json({ message: 'Unable to load uploaded documents.' })
  }
})

router.get('/:id/download', requireAuth, documentRoles, async (req, res) => {
  try {
    const document = await prisma.uploadedDocument.findUnique({ where: { id: Number(req.params.id) } })
    if (!enforceDocumentAccess(document, req, res)) {
      return
    }

    const fullPath = path.resolve(document.path)
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: 'File not found on disk.' })
    }

    res.download(fullPath, document.original_name)
  } catch (error) {
    console.error('Failed to download document:', error)
    res.status(500).json({ message: 'Unable to download document.' })
  }
})

router.get('/:id', requireAuth, documentRoles, async (req, res) => {
  try {
    const document = await prisma.uploadedDocument.findUnique({
      where: { id: Number(req.params.id) },
      include: { uploader: true },
    })
    if (!enforceDocumentAccess(document, req, res)) {
      return
    }

    res.json(normalizeDocument(document))
  } catch (error) {
    console.error('Failed to fetch uploaded document:', error)
    res.status(500).json({ message: 'Unable to load document.' })
  }
})

router.post('/', requireAuth, documentRoles, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'File is required.' })
    }

    const institutionId = req.user.role === 'admin'
      ? Number(req.body.institution_id || req.user.institutionId)
      : req.user.institutionId

    if (!institutionId || Number.isNaN(institutionId)) {
      return res.status(400).json({ message: 'Valid institution_id is required.' })
    }

    const document = await prisma.uploadedDocument.create({
      data: {
        institutionId,
        uploaded_by: req.user.id,
        original_name: req.file.originalname,
        stored_name: req.file.filename,
        mime_type: req.file.mimetype,
        size: req.file.size,
        category: String(req.body.category || 'general'),
        description: req.body.description ? String(req.body.description) : null,
        path: req.file.path,
        url: `/uploads/documents/${req.file.filename}`,
      },
    })

    res.status(201).json(normalizeDocument(document))
  } catch (error) {
    console.error('Failed to upload document:', error)
    res.status(500).json({ message: 'Unable to upload document.' })
  }
})

router.put('/:id', requireAuth, documentRoles, async (req, res) => {
  try {
    const existing = await prisma.uploadedDocument.findUnique({ where: { id: Number(req.params.id) } })
    if (!enforceDocumentAccess(existing, req, res)) {
      return
    }

    const updated = await prisma.uploadedDocument.update({
      where: { id: existing.id },
      data: {
        category: req.body.category ? String(req.body.category) : existing.category,
        description: req.body.description !== undefined ? String(req.body.description) : existing.description,
      },
    })

    res.json(normalizeDocument(updated))
  } catch (error) {
    console.error('Failed to update uploaded document:', error)
    res.status(500).json({ message: 'Unable to update document.' })
  }
})

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const document = await prisma.uploadedDocument.findUnique({ where: { id: Number(req.params.id) } })
    if (!document) {
      return res.status(404).json({ message: 'Document not found.' })
    }

    if (fs.existsSync(document.path)) {
      fs.unlinkSync(document.path)
    }

    await prisma.uploadedDocument.delete({ where: { id: document.id } })
    res.status(204).send()
  } catch (error) {
    console.error('Failed to delete uploaded document:', error)
    res.status(500).json({ message: 'Unable to delete document.' })
  }
})

export default router
