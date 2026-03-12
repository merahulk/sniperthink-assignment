const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/interest
router.post('/', async (req, res) => {
  const { name, email, selectedStep } = req.body;

  // Validation
  if (!name || !email || !selectedStep) {
    return res.status(400).json({
      success: false,
      message: 'name, email, and selectedStep are required'
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
  }

  try {
    // Simulate slight processing delay for realism
    await new Promise((r) => setTimeout(r, 500));

    await db.runAsync(
      `INSERT INTO interest_submissions (name, email, selected_step) VALUES (?, ?, ?)`,
      [name.trim(), email.trim().toLowerCase(), selectedStep]
    );

    return res.status(201).json({
      success: true,
      message: `Thanks ${name}! We'll be in touch about "${selectedStep}".`
    });
  } catch (err) {
    console.error('Interest submission error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// GET /api/interest — list all submissions (admin)
router.get('/', async (req, res) => {
  try {
    const rows = await db.allAsync(
      `SELECT * FROM interest_submissions ORDER BY created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
