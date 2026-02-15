const express = require('express');
const router = express.Router();

// Import Sub-Routers
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const branchRoutes = require('./branch.routes');
const deviceRoutes = require('./device.routes');
const audioRoutes = require('./audio.routes');
const scheduleRoutes = require('./schedule.routes');
const logRoutes = require('./log.routes');

// Health Check (Common)
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Mount Routes
router.use('/auth', authRoutes);         // Result: /api/auth/...
router.use('/users', userRoutes);       // Result: /api/users/...
router.use('/branches', branchRoutes);   // Result: /api/branches/...
router.use('/devices', deviceRoutes);    // Result: /api/devices/...
router.use('/audio', audioRoutes);       // Result: /api/audio/...
router.use('/schedules', scheduleRoutes); // Result: /api/schedules/...
router.use('/logs', logRoutes);          // Result: /api/logs/...

module.exports = router;