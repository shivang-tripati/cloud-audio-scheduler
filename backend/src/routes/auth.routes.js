const express = require('express');
const { validate } = require('../middleware/validation');
const { authController } = require('../controllers');
const schemas = require('../validators/schemas');

const router = express.Router();

// Note: The '/auth' prefix is handled by the main router index

router.post('/login',
  validate(schemas.loginSchema),
  authController.login
);

// router.post('/register',
//   validate(schemas.registerSchema),S
//   authController.register
// );

// router.post('/logout',
//   authController.logout
// );

module.exports = router;