const express = require('express');
const router = express.Router();
const { userController } = require('../controllers');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, validateParams } = require('../middleware/validation');
const schemas = require('../validators/schemas');

// Note: The '/users' prefix is handled by the main router index
router.post('/',
  authenticate,
  authorize('SUPER_ADMIN'),
  validate(schemas.createUserSchema),
  userController.create
);

router.get('/',
  authenticate,
  userController.getAll
);

router.get('/:id',
  authenticate,
  validateParams(schemas.idParamSchema),
  userController.getById
);

router.put('/:id',
  authenticate,
  authorize('SUPER_ADMIN'),
  validateParams(schemas.idParamSchema),
  validate(schemas.updateUserSchema),
  userController.update
);

router.delete('/:id',
  authenticate,
  authorize('SUPER_ADMIN'),
  validateParams(schemas.idParamSchema),
  userController.delete
);


module.exports = router;