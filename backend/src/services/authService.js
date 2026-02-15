const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');

class AuthService {
  async login(email, password) {
    logger.debug('AuthService.login - Starting', { email });
    try {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        logger.error('AuthService.login - User not found', { email });
        throw new Error('Invalid credentials');
      }

      if (!user.is_active) {
        logger.error('AuthService.login - User account inactive', { email, userId: user.id });
        throw new Error('User account is inactive');
      }

      const isValidPassword = await user.validatePassword(password);

      if (!isValidPassword) {
        logger.error('AuthService.login - Invalid password', { email });
        throw new Error('Invalid credentials');
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      logger.debug('AuthService.login - Success', { userId: user.id, email });
      return {
        token,
        user: user.toJSON(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };
    } catch (error) {
      logger.error('AuthService.login - Error', { email, error: error.message, stack: error.stack });
      throw error;
    }
  }
}

module.exports = new AuthService();