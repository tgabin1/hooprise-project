// server/routes/courts.js
const express = require('express');
const router  = express.Router();
const db      = require('../db/connection');

// GET /api/courts — list all courts
router.get('/', async (req, res) => {
  try {
    const [courts] = await db.query('SELECT * FROM courts ORDER BY id ASC');
    res.json(courts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch courts.' });
  }
});

// GET /api/courts/:id/booked-slots?date=YYYY-MM-DD
// Returns booked time slots for a given court on a given date
router.get('/:id/booked-slots', async (req, res) => {
  const { id } = req.params;
  const { date } = req.query;

  if (!date) return res.status(400).json({ error: 'Date is required.' });

  try {
    const [rows] = await db.query(
      "SELECT time_slot FROM bookings WHERE court_id = ? AND date = ? AND status = 'confirmed'",
      [id, date]
    );
    const booked = rows.map(r => r.time_slot.slice(0, 5)); // "HH:MM"
    res.json({ booked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch booked slots.' });
  }
});

module.exports = router;
