import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Resume from '../models/Resume.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const uploadDir = path.join(__dirname, '../uploads/resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and DOCX files are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.get('/folder/:folderId', async (req, res) => {
  try {
    const resumes = await Resume.find({ folderId: req.params.folderId }).sort({ uploadedAt: -1 });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    const { folderId } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const resume = new Resume({
      folderId,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      filePath: req.file.path
    });

    await resume.save();
    res.status(201).json(resume);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', upload.single('resume'), async (req, res) => {
  try {
    const oldResume = await Resume.findById(req.params.id);
    if (!oldResume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    if (req.file) {
      if (fs.existsSync(oldResume.filePath)) {
        fs.unlinkSync(oldResume.filePath);
      }

      oldResume.fileName = req.file.filename;
      oldResume.originalName = req.file.originalname;
      oldResume.fileSize = req.file.size;
      oldResume.mimeType = req.file.mimetype;
      oldResume.filePath = req.file.path;
      await oldResume.save();
    }

    res.json(oldResume);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const resume = await Resume.findByIdAndDelete(req.params.id);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    if (fs.existsSync(resume.filePath)) {
      fs.unlinkSync(resume.filePath);
    }

    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/download/:id', async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    res.download(resume.filePath, resume.originalName);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});







export default router;
