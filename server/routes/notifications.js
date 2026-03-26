const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// GET /api/notifications/:email — get all notifications for a user
router.get('/:email', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM notifications WHERE user_email = ? ORDER BY created_at DESC LIMIT 20',
      [req.params.email]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
});

// PUT /api/notifications/mark-read/:id — mark one as read
router.put('/mark-read/:id', async (req, res) => {
  try {
    await db.query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [req.params.id]);
    res.json({ message: 'Marked as read.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark as read.' });
  }
});

// PUT /api/notifications/mark-all/:email — mark all as read
router.put('/mark-all/:email', async (req, res) => {
  try {
    await db.query('UPDATE notifications SET is_read = TRUE WHERE user_email = ?', [req.params.email]);
    res.json({ message: 'All marked as read.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark all as read.' });
  }
});

module.exports = router;