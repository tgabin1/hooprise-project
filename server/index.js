// server/index.js
require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const authRoutes     = require('./routes/auth');
const courtsRoutes   = require('./routes/courts');
const bookingsRoutes = require('./routes/bookings');
const adminRoutes    = require('./routes/admin');
const equipmentRoutes = require('./routes/equipment');
const notificationsRoutes = require('./routes/notifications');
const programsRoutes = require('./routes/programs');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──
app.use(cors({ origin: '*' }));
app.use(express.json());

// ── Routes ──
app.use('/api/auth',     authRoutes);
app.use('/api/courts',   courtsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/programs', programsRoutes);


// ── Health check ──
app.get('/', (req, res) => res.json({ message: 'Hooprise API running 🏀' }));

app.listen(PORT, () => {
  console.log(`✅ Hooprise server running on http://localhost:${PORT}`);
});