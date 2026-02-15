const express = require('express');

const { audioController } = require('../controllers');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, validateParams } = require('../middleware/validation');
const { upload } = require('../config/storage');
const schemas = require('../validators/schemas');

// Note: The '/audio' prefix is handled by the main router index

const router = express.Router();



router.post('/',
  authenticate,
  authorize('SUPER_ADMIN'),
  upload.single('audio_file'),
  validate(schemas.createAudioSchema),
  audioController.create
);

router.get('/',
  authenticate,
  audioController.getAll
);

router.get('/:id',
  authenticate,
  validateParams(schemas.idParamSchema),
  audioController.getById
);

router.put('/:id',
  authenticate,
  authorize('SUPER_ADMIN'),
  validateParams(schemas.idParamSchema),
  upload.single('audio_file'),
  validate(schemas.updateAudioSchema),
  audioController.update
);

router.delete('/:id',
  authenticate,
  authorize('SUPER_ADMIN'),
  validateParams(schemas.idParamSchema),
  audioController.delete
);

module.exports = router;
