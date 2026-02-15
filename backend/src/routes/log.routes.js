const express = require('express');

const { logController, deviceController } = require('../controllers');
const { validate } = require('../middleware/validation');
const schemas = require('../validators/schemas');

// Note: The '/logs' prefix is handled by the main router index

const router = express.Router();

router.post('/',
  validate(schemas.playbackLogSchema),
  logController.recordPlayback
);

router.post('/device/heartbeat',
  validate(schemas.heartbeatSchema),
  deviceController.heartbeat
);

module.exports = router;