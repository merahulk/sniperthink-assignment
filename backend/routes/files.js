const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { processJob } = require('../workers/fileProcessor');

// In-memory queue backed by a simple array + async runner
const jobQueue = [];
let isProcessing = false;

async function runQueue() {
  if (isProcessing || jobQueue.length === 0) return;
  isProcessing = true;

  while (jobQueue.length > 0) {
    const jobId = jobQueue.shift();
    try {
      await processJob(jobId);
    } catch (err) {
      console.error(`Queue runner error for job ${jobId}:`, err);
    }
  }

  isProcessing = false;
}

// Multer config
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../uploads'),
  filename: (req, file, cb) => {
    const unique = `${uuidv4()}-${Date.now()}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['application/pdf', 'text/plain'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and TXT files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// POST /api/files/upload
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const jobId = uuidv4();

  try {
    await db.runAsync(
      `INSERT INTO file_jobs (id, filename, original_name, file_type, file_size, status, progress)
       VALUES (?, ?, ?, ?, ?, 'pending', 0)`,
      [
        jobId,
        req.file.filename,
        req.file.originalname,
        req.file.mimetype,
        req.file.size
      ]
    );

    // Enqueue and start processing
    jobQueue.push(jobId);
    runQueue(); // fire-and-forget

    return res.status(202).json({
      success: true,
      jobId,
      message: 'File uploaded. Processing started.',
      filename: req.file.originalname
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ success: false, message: 'Server error during upload' });
  }
});

// GET /api/files/status/:jobId
router.get('/status/:jobId', async (req, res) => {
  const { jobId } = req.params;

  try {
    const job = await db.getAsync(
      `SELECT id, status, progress, error_message, created_at, updated_at FROM file_jobs WHERE id=?`,
      [jobId]
    );

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    return res.json({
      success: true,
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      error: job.error_message || null,
      createdAt: job.created_at,
      updatedAt: job.updated_at
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/files/result/:jobId
router.get('/result/:jobId', async (req, res) => {
  const { jobId } = req.params;

  try {
    const job = await db.getAsync(
      `SELECT * FROM file_jobs WHERE id=?`,
      [jobId]
    );

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: `Job is ${job.status}, not completed yet`,
        status: job.status,
        progress: job.progress
      });
    }

    const result = JSON.parse(job.result);

    return res.json({
      success: true,
      jobId: job.id,
      filename: job.original_name,
      fileType: job.file_type,
      fileSize: job.file_size,
      status: job.status,
      result,
      completedAt: job.updated_at
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/files — list all jobs
router.get('/', async (req, res) => {
  try {
    const rows = await db.allAsync(
      `SELECT id, original_name, file_type, file_size, status, progress, created_at 
       FROM file_jobs ORDER BY created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Error handler for multer
router.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File too large. Max 10MB.' });
  }
  if (err.message) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
});

module.exports = router;
