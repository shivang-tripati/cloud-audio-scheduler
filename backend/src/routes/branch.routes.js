const express = require('express');

const { branchController } = require('../controllers');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, validateParams } = require('../middleware/validation');
const schemas = require('../validators/schemas');

// Note: The '/branches' prefix is handled by the main router index

const router = express.Router();

router.post('/',
  authenticate,
  authorize('SUPER_ADMIN'),
  validate(schemas.createBranchSchema),
  branchController.create
);

router.get('/',
  authenticate,
  branchController.getAll
);

router.get('/:id',
  authenticate,
  validateParams(schemas.idParamSchema),
  branchController.getById
);

router.put('/:id',
  authenticate,
  authorize('SUPER_ADMIN'),
  validateParams(schemas.idParamSchema),
  validate(schemas.updateBranchSchema),
  branchController.update
);

router.delete('/:id',
  authenticate,
  authorize('SUPER_ADMIN'),
  validateParams(schemas.idParamSchema),
  branchController.delete
);

module.exports = router;