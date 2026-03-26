const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// GET /api/equipment — list all available equipment
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM equipment 
      ORDER BY available DESC, created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch equipment.' });
  }
});

// POST /api/equipment/request — request equipment
router.post('/request', async (req, res) => {
  const { equipment_id, user_name, user_email, user_phone, message } = req.body;
  if (!equipment_id || !user_name || !user_email) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  try {
    const [equip] = await db.query('SELECT * FROM equipment WHERE id = ?', [equipment_id]);
    if (equip.length === 0) return res.status(404).json({ error: 'Equipment not found.' });
    if (!equip[0].available) return res.status(409).json({ error: 'Equipment not available.' });

    await db.query(
      'INSERT INTO equipment_requests (equipment_id, user_name, user_email, user_phone, message) VALUES (?, ?, ?, ?, ?)',
      [equipment_id, user_name, user_email, user_phone, message || null]
    );

    // Notify admin via email + in-app notification
    const { sendEquipmentRequestNotification } = require('../services/email');
    sendEquipmentRequestNotification(process.env.ADMIN_EMAIL, {
      userName: user_name,
      userEmail: user_email,
      userPhone: user_phone,
      equipmentName: equip[0].name,
      message
    }).catch(err => console.error('Email error:', err));

    // Also notify the user that request was received
    const db2 = require('../db/connection');
    await db2.query(
      'INSERT INTO notifications (user_email, title, message, type) VALUES (?, ?, ?, ?)',
      [user_email, 'Equipment Request Submitted 🏀', `Your request for ${equip[0].name} has been submitted and is pending approval.`, 'equipment']
    );

    res.status(201).json({ message: 'Equipment request submitted successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit request.' });
  }
});

// POST /api/equipment/share — share equipment
router.post('/share', async (req, res) => {
  const { name, description, quantity, condition_status, owner_email, owner_name } = req.body;
  if (!name || !owner_email || !owner_name) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  try {
    await db.query(
      'INSERT INTO equipment (name, description, quantity, condition_status, available, owner_email, owner_name, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, description || null, quantity || 1, condition_status || 'good', true, owner_email, owner_name, 'shared']
    );
    res.status(201).json({ message: 'Equipment shared successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to share equipment.' });
  }
});

// GET /api/equipment/my-requests/:email — get user's requests
router.get('/my-requests/:email', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT er.*, e.name AS equipment_name, e.condition_status
      FROM equipment_requests er
      JOIN equipment e ON er.equipment_id = e.id
      WHERE er.user_email = ?
      ORDER BY er.created_at DESC
    `, [req.params.email]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch requests.' });
  }
});

module.exports = router;