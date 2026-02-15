const { User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class UserService {
  async createUser(data) {
    logger.debug('UserService.createUser - Starting', { email: data.email, role: data.role });
    try {
      const existingUser = await User.findOne({ where: { email: data.email } });
      if (existingUser) {
        logger.error('UserService.createUser - Email already exists', { email: data.email });
        throw new Error('Email already exists');
      }

      data.password_hash = await User.hashPassword(data.password);
      delete data.password;

      const user = await User.create(data);
      logger.debug('UserService.createUser - Success', { userId: user.id, email: data.email });
      return user.toJSON();
    } catch (error) {
      logger.error('UserService.createUser - Error', { email: data.email, error: error.message, stack: error.stack });
      throw error;
    }
  }

  async getAllUsers() {
    logger.debug('UserService.getAllUsers - Starting');
    try {
      const users = await User.findAll({
        order: [['created_at', 'DESC']]
      });
      logger.debug('UserService.getAllUsers - Success', { count: users.length });
      return users.map(user => user.toJSON());
    } catch (error) {
      logger.error('UserService.getAllUsers - Error', { error: error.message, stack: error.stack });
      throw error;
    }
  }

  async getUserById(id) {
    logger.debug('UserService.getUserById - Starting', { id });
    try {
      const user = await User.findByPk(id);
      if (!user) {
        logger.error('UserService.getUserById - User not found', { id });
        throw new Error('User not found');
      }
      logger.debug('UserService.getUserById - Success', { id });
      return user.toJSON();
    } catch (error) {
      logger.error('UserService.getUserById - Error', { id, error: error.message, stack: error.stack });
      throw error;
    }
  }

  async updateUser(id, data) {
    logger.debug('UserService.updateUser - Starting', { id });
    try {
      const user = await User.findByPk(id);
      if (!user) {
        logger.error('UserService.updateUser - User not found', { id });
        throw new Error('User not found');
      }

      if (data.email && data.email !== user.email) {
        const existingUser = await User.findOne({
          where: {
            email: data.email,
            id: { [Op.ne]: id }
          }
        });
        if (existingUser) {
          logger.error('UserService.updateUser - Email already exists', { email: data.email });
          throw new Error('Email already exists');
        }
      }

      if (data.password) {
        data.password_hash = await User.hashPassword(data.password);
        delete data.password;
      }

      await user.update(data);
      logger.debug('UserService.updateUser - Success', { id });
      return user.toJSON();
    } catch (error) {
      logger.error('UserService.updateUser - Error', { id, error: error.message, stack: error.stack });
      throw error;
    }
  }

  async deleteUser(id) {
    logger.debug('UserService.deleteUser - Starting', { id });
    try {
      const user = await User.findByPk(id);
      if (!user) {
        logger.error('UserService.deleteUser - User not found', { id });
        throw new Error('User not found');
      }

      await user.destroy();
      logger.debug('UserService.deleteUser - Success', { id });
      return { message: 'User deleted successfully' };
    } catch (error) {
      logger.error('UserService.deleteUser - Error', { id, error: error.message, stack: error.stack });
      throw error;
    }
  }
}

module.exports = new UserService();