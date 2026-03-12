const path = require('path');
const fs = require('fs');
const db = require('../db');

/**
 * Core text analysis logic — used by both the queue worker
 * and the inline (in-process) fallback.
 */

function extractTextFromTxt(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

async function extractTextFromPdf(filePath) {
  try {
    const pdfParse = require('pdf-parse');
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (err) {
    throw new Error('Failed to parse PDF: ' + err.message);
  }
}

function analyzeText(text) {
  // Normalize line endings
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Word count
  const words = normalized.match(/\b\w+\b/g) || [];
  const wordCount = words.length;

  // Paragraph count (blank line separated)
  const paragraphs = normalized
    .split(/\n\s*\n/)
    .filter((p) => p.trim().length > 0);
  const paragraphCount = paragraphs.length;

  // Keyword frequency (exclude common stop words)
  const stopWords = new Set([
    'the','a','an','and','or','but','in','on','at','to','for','of',
    'with','by','from','up','about','into','through','is','was','are',
    'were','be','been','being','have','has','had','do','does','did',
    'will','would','could','should','may','might','shall','can','it',
    'its','this','that','these','those','i','you','he','she','we','they',
    'me','him','her','us','them','my','your','his','our','their','what',
    'which','who','when','where','how','not','no','so','if','as','than',
    'then','there','here','all','each','every','both','few','more','most',
    'other','some','such','only','same','also','just','now','any'
  ]);

  const wordFreq = {};
  words.forEach((w) => {
    const lower = w.toLowerCase();
    if (!stopWords.has(lower) && lower.length > 2) {
      wordFreq[lower] = (wordFreq[lower] || 0) + 1;
    }
  });

  const topKeywords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));

  return { wordCount, paragraphCount, topKeywords };
}

/**
 * Process a single job by ID.
 * Updates DB status/progress throughout.
 */
async function processJob(jobId) {
  const job = await db.getAsync(
    `SELECT * FROM file_jobs WHERE id = ?`,
    [jobId]
  );

  if (!job) throw new Error(`Job ${jobId} not found`);

  // Mark as processing
  await db.runAsync(
    `UPDATE file_jobs SET status='processing', progress=10, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
    [jobId]
  );

  const filePath = path.join(__dirname, '../uploads', job.filename);

  if (!fs.existsSync(filePath)) {
    await db.runAsync(
      `UPDATE file_jobs SET status='failed', error_message='File not found on disk', updated_at=CURRENT_TIMESTAMP WHERE id=?`,
      [jobId]
    );
    return;
  }

  try {
    // Extract text
    await db.runAsync(
      `UPDATE file_jobs SET progress=30, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
      [jobId]
    );

    let text;
    if (job.file_type === 'application/pdf') {
      text = await extractTextFromPdf(filePath);
    } else {
      text = extractTextFromTxt(filePath);
    }

    await db.runAsync(
      `UPDATE file_jobs SET progress=60, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
      [jobId]
    );

    // Analyze
    const result = analyzeText(text);

    await db.runAsync(
      `UPDATE file_jobs SET progress=90, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
      [jobId]
    );

    // Simulate slight delay
    await new Promise((r) => setTimeout(r, 300));

    // Store result
    await db.runAsync(
      `UPDATE file_jobs 
       SET status='completed', progress=100, result=?, updated_at=CURRENT_TIMESTAMP 
       WHERE id=?`,
      [JSON.stringify(result), jobId]
    );

    console.log(`Job ${jobId} completed:`, result);
  } catch (err) {
    await db.runAsync(
      `UPDATE file_jobs 
       SET status='failed', error_message=?, updated_at=CURRENT_TIMESTAMP 
       WHERE id=?`,
      [err.message, jobId]
    );
    console.error(`Job ${jobId} failed:`, err.message);
  }
}

module.exports = { processJob, analyzeText };
