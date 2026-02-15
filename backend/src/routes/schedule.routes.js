const express = require('express');

const { scheduleController } = require('../controllers');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, validateParams } = require('../middleware/validation');
const schemas = require('../validators/schemas');

// Note: The '/schedules' prefix is handled by the main router index

const router = express.Router();


router.post('/',
  authenticate,
  authorize('SUPER_ADMIN'),
  validate(schemas.createScheduleSchema),
  scheduleController.create
);

router.get('/',
  authenticate,
  scheduleController.getAll
);

router.get('/:id',
  authenticate,
  validateParams(schemas.idParamSchema),
  scheduleController.getById
);

router.put('/:id',
  authenticate,
  authorize('SUPER_ADMIN'),
  validateParams(schemas.idParamSchema),
  validate(schemas.updateScheduleSchema),
  scheduleController.update
);

router.delete('/:id',
  authenticate,
  authorize('SUPER_ADMIN'),
  validateParams(schemas.idParamSchema),
  scheduleController.delete
);

module.exports = router;