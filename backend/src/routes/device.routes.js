const express = require('express');

const { deviceController } = require('../controllers');
const { logController } = require('../controllers');
const { scheduleController } = require('../controllers');
const { authenticate, authorize, authenticateDevice } = require('../middleware/auth');
const { validate, validateParams, validateQuery } = require('../middleware/validation');
const schemas = require('../validators/schemas');

// Note: The 'devices' prefix is handled by the main router index

const router = express.Router();


// ==================== DEVICE SYNC ROUTE (CORE) ====================
router.get('/sync',
  validateQuery(schemas.deviceSyncQuerySchema),
  scheduleController.getDeviceSchedule
);

// ==================== LOG ROUTES ====================
router.post('/logs',
  validate(schemas.playbackLogSchema),
  logController.recordPlayback
);

router.post('/heartbeat',
  authenticateDevice,
  validate(schemas.heartbeatSchema),
  deviceController.heartbeat
);



router.post('/register',
  authenticate,
  authorize('SUPER_ADMIN'),
  validate(schemas.registerDeviceSchema),
  deviceController.register
);

router.post('/activate',
  validate(schemas.activateDeviceSchema),
  deviceController.activate
);

router.post('/:id/reset',
  authenticate,
  authorize('SUPER_ADMIN'),
  validateParams(schemas.idParamSchema),
  deviceController.reset
);

router.get('/status',
  authenticate,
  deviceController.getStatus
);


router.get('/',
  authenticate,
  deviceController.getAll
);


router.get('/:id',
  authenticate,
  validateParams(schemas.idParamSchema),
  deviceController.getById
);

router.put('/:id',
  authenticate,
  authorize('SUPER_ADMIN'),
  validateParams(schemas.idParamSchema),
  validate(schemas.updateDeviceSchema),
  deviceController.update
);

router.delete('/:id',
  authenticate,
  authorize('SUPER_ADMIN'),
  validateParams(schemas.idParamSchema),
  deviceController.delete
);



module.exports = router;