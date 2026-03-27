const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { initiatePayment } = require('../services/payment');
const { sendBookingConfirmation } = require('../services/email');

// POST /api/bookings — create a new booking
router.post('/', async (req, res) => {
  const { court_id, user_name, user_email, user_phone, date, time_slot, duration } = req.body;

  if (!court_id || !user_name || !user_email || !user_phone || !date || !time_slot) {
    return res.status(400).json({ error: 'All booking fields are required.' });
  }

  try {
    const [courtRows] = await db.query('SELECT price_rwf, name FROM courts WHERE id = ?', [court_id]);
    if (courtRows.length === 0) return res.status(404).json({ error: 'Court not found.' });

    const court = courtRows[0];
    const hours = parseInt(duration) || 1;
    const total_cost = court.price_rwf * hours;

    const [existing] = await db.query(
      "SELECT id FROM bookings WHERE court_id = ? AND date = ? AND time_slot = ? AND status = 'confirmed'",
      [court_id, date, time_slot]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'This time slot is already booked. Please choose another.' });
    }

    const [result] = await db.query(
      'INSERT INTO bookings (court_id, user_name, user_email, user_phone, date, time_slot, duration, total_cost, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [court_id, user_name, user_email, user_phone, date, time_slot, hours, total_cost, 'pending']
    );

    const bookingId = result.insertId;

    // Confirm booking immediately
    await db.query('UPDATE bookings SET status = ? WHERE id = ?', ['confirmed', bookingId]);

    // Payment in background
    if (total_cost > 0) {
      initiatePayment(user_phone, total_cost).catch(err => {
        console.error('Background payment error:', err);
      });
    }

    // Email in background — never blocks response
    sendBookingConfirmation(user_email, {
      courtName: court.name,
      date,
      timeSlot: time_slot,
      amount: total_cost
    }).catch(err => {
      console.error('Background email error:', err);
    });

    return res.status(201).json({
      message: total_cost > 0
        ? `Booking confirmed! Payment of ${total_cost} RWF initiated to ${user_phone} 🏀`
        : `Court booked! See you at ${court.name} 🏀`,
      booking: { id: bookingId, court_id, date, time_slot, duration: hours, total_cost }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create booking.' });
  }
});

// GET /api/bookings — list all bookings (admin use)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT b.*, c.name AS court_name
      FROM bookings b
      JOIN courts c ON b.court_id = c.id
      ORDER BY b.date DESC, b.time_slot ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bookings.' });
  }
});

// GET /api/bookings/user/:email — get bookings for a specific user
router.get('/user/:email', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT b.*, c.name AS court_name, c.location AS court_location
      FROM bookings b
      JOIN courts c ON b.court_id = c.id
      WHERE b.user_email = ?
      ORDER BY b.date DESC, b.time_slot ASC
    `, [req.params.email]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bookings.' });
  }
});

module.exports = router;