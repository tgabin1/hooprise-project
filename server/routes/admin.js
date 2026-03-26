const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const bcrypt = require('bcryptjs');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  const email = req.headers['admin-email'];
  if (!email) return res.status(401).json({ error: 'Unauthorized' });
  db.query('SELECT is_admin FROM users WHERE email = ?', [email])
    .then(([rows]) => {
      if (rows.length === 0 || !rows[0].is_admin) {
        return res.status(403).json({ error: 'Access denied' });
      }
      next();
    })
    .catch(() => res.status(500).json({ error: 'Server error' }));
};

// POST /api/admin/verify — verify admin password
router.post('/verify', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ? AND is_admin = TRUE', [email]);
    if (rows.length === 0) return res.status(403).json({ error: 'Not an admin account.' });

    const match = await bcrypt.compare(password, rows[0].password);
    if (!match) return res.status(401).json({ error: 'Wrong password.' });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/admin/bookings — all bookings
router.get('/bookings', isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT b.*, c.name AS court_name
      FROM bookings b
      JOIN courts c ON b.court_id = c.id
      ORDER BY b.date DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// GET /api/admin/users — all users
router.get('/users', isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, first_name, last_name, email, phone, location, position, is_admin FROM users ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/admin/revenue — revenue stats
router.get('/revenue', isAdmin, async (req, res) => {
  try {
    const [total] = await db.query("SELECT SUM(total_cost) AS total FROM bookings WHERE status = 'confirmed'");
    const [today] = await db.query("SELECT SUM(total_cost) AS total FROM bookings WHERE status = 'confirmed' AND date = CURDATE()");
    const [byCourt] = await db.query(`
      SELECT c.name, SUM(b.total_cost) AS revenue, COUNT(b.id) AS bookings
      FROM bookings b
      JOIN courts c ON b.court_id = c.id
      WHERE b.status = 'confirmed'
      GROUP BY c.id, c.name
      ORDER BY revenue DESC
    `);
    res.json({
      total: total[0].total || 0,
      today: today[0].total || 0,
      byCourt
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch revenue' });
  }
});

// GET /api/admin/courts — all courts
router.get('/courts', isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM courts ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch courts' });
  }
});

// POST /api/admin/courts — add court
router.post('/courts', isAdmin, async (req, res) => {
  const { name, location, surface, court_type, price_rwf, image_url } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO courts (name, location, surface, court_type, price_rwf, status, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, location, surface, court_type, price_rwf, 'open', image_url || null]
    );
    res.status(201).json({ message: 'Court added!', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add court' });
  }
});

// PUT /api/admin/courts/:id — edit court
router.put('/courts/:id', isAdmin, async (req, res) => {
  const { name, location, surface, court_type, price_rwf, image_url, status } = req.body;
  try {
    await db.query(
      'UPDATE courts SET name=?, location=?, surface=?, court_type=?, price_rwf=?, image_url=?, status=? WHERE id=?',
      [name, location, surface, court_type, price_rwf, image_url, status, req.params.id]
    );
    res.json({ message: 'Court updated!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update court' });
  }
});

// DELETE /api/admin/courts/:id — delete court
router.delete('/courts/:id', isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM courts WHERE id = ?', [req.params.id]);
    res.json({ message: 'Court deleted!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete court' });
  }
});

// GET /api/admin/equipment — all equipment
router.get('/equipment', isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM equipment ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
});

// GET /api/admin/equipment/requests — all requests
router.get('/equipment/requests', isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT er.*, e.name AS equipment_name
      FROM equipment_requests er
      JOIN equipment e ON er.equipment_id = e.id
      ORDER BY er.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// PUT /api/admin/equipment/requests/:id — approve or reject
router.put('/equipment/requests/:id', isAdmin, async (req, res) => {
  const { status } = req.body;
  try {
    await db.query('UPDATE equipment_requests SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: `Request ${status}!` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update request' });
  }
});

// ← NEW: GET /api/admin/programs — all programs
router.get('/programs', isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM programs ORDER BY start_date ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch programs' });
  }
});

// ← NEW: GET /api/admin/programs/registrations — all registrations
router.get('/programs/registrations', isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT pr.*, p.title AS program_title
      FROM program_registrations pr
      JOIN programs p ON pr.program_id = p.id
      ORDER BY pr.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

// ← NEW: POST /api/admin/programs — add program
router.post('/programs', isAdmin, async (req, res) => {
  const { title, description, location, start_date, end_date, start_time, max_participants, category, price_rwf } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO programs (title, description, location, start_date, end_date, start_time, max_participants, category, price_rwf, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description, location, start_date, end_date, start_time, max_participants || 20, category, price_rwf || 0, 'open']
    );
    res.status(201).json({ message: 'Program created!', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create program' });
  }
});

// ← NEW: PUT /api/admin/programs/:id — update program status
router.put('/programs/:id', isAdmin, async (req, res) => {
  const { status } = req.body;
  try {
    await db.query('UPDATE programs SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Program updated!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update program' });
  }
});

// ← NEW: DELETE /api/admin/programs/:id — delete program
router.delete('/programs/:id', isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM program_registrations WHERE program_id = ?', [req.params.id]);
    await db.query('DELETE FROM programs WHERE id = ?', [req.params.id]);
    res.json({ message: 'Program deleted!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete program' });
  }
});

module.exports = router;