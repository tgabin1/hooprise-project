const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// GET /api/programs — list all programs
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM programs ORDER BY start_date ASC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch programs.' });
  }
});

// GET /api/programs/:id — get single program
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM programs WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Program not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch program.' });
  }
});

// POST /api/programs/register — register for a program
router.post('/register', async (req, res) => {
  const { program_id, user_name, user_email, user_phone } = req.body;
  if (!program_id || !user_name || !user_email) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  try {
    // Check program exists and is open
    const [programs] = await db.query('SELECT * FROM programs WHERE id = ?', [program_id]);
    if (programs.length === 0) return res.status(404).json({ error: 'Program not found.' });

    const program = programs[0];
    if (program.status === 'closed') return res.status(409).json({ error: 'This program is closed.' });
    if (program.status === 'full') return res.status(409).json({ error: 'This program is full.' });

    // Check if already registered
    const [existing] = await db.query(
      "SELECT id FROM program_registrations WHERE program_id = ? AND user_email = ? AND status = 'registered'",
      [program_id, user_email]
    );
    if (existing.length > 0) return res.status(409).json({ error: 'You are already registered for this program.' });

    // Register user
    await db.query(
      'INSERT INTO program_registrations (program_id, user_name, user_email, user_phone) VALUES (?, ?, ?, ?)',
      [program_id, user_name, user_email, user_phone || null]
    );

    // Update participant count
    await db.query(
      'UPDATE programs SET current_participants = current_participants + 1 WHERE id = ?',
      [program_id]
    );

    // Check if now full
    if (program.current_participants + 1 >= program.max_participants) {
      await db.query('UPDATE programs SET status = ? WHERE id = ?', ['full', program_id]);
    }

    // Send email notification
    const { sendProgramRegistrationNotification } = require('../services/email');
    sendProgramRegistrationNotification(user_email, {
      userName: user_name,
      programTitle: program.title,
      location: program.location,
      startDate: program.start_date,
      startTime: program.start_time
    }).catch(err => console.error('Email error:', err));

    // Create in-app notification
    await db.query(
      'INSERT INTO notifications (user_email, title, message, type) VALUES (?, ?, ?, ?)',
      [user_email, 'Program Registration Confirmed!', `You have successfully registered for ${program.title}.`, 'general']
    );

    res.status(201).json({ message: `Successfully registered for ${program.title}!` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to register.' });
  }
});

// GET /api/programs/my-registrations/:email
router.get('/my-registrations/:email', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT pr.*, p.title, p.location, p.start_date, p.start_time, p.category
      FROM program_registrations pr
      JOIN programs p ON pr.program_id = p.id
      WHERE pr.user_email = ?
      ORDER BY pr.created_at DESC
    `, [req.params.email]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch registrations.' });
  }
});

module.exports = router;