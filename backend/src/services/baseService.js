const logger = require('../utils/logger');

class BaseService {
  constructor(model) {
    this.model = model;
  }

  async getAll(options = {}) {
    logger.debug(`BaseService.getAll - Starting for ${this.model.name}`);
    try {
      const records = await this.model.findAll({
        order: [['created_at', 'DESC']],
        ...options
      });
      logger.debug(`BaseService.getAll - Success for ${this.model.name}`, { count: records.length });
      return records.map(r => r.toJSON());
    } catch (error) {
      logger.error(`BaseService.getAll - Error for ${this.model.name}`, { error: error.message, stack: error.stack });
      throw error;
    }
  }

  async getById(id, options = {}) {
    logger.debug(`BaseService.getById - Starting for ${this.model.name}`, { id });
    try {
      const record = await this.model.findByPk(id, options);
      if (!record) {
        logger.error(`BaseService.getById - ${this.model.name} not found`, { id });
        throw new Error(`${this.model.name} not found`);
      }
      logger.debug(`BaseService.getById - Success for ${this.model.name}`, { id });
      return record.toJSON();
    } catch (error) {
      logger.error(`BaseService.getById - Error for ${this.model.name}`, { id, error: error.message, stack: error.stack });
      throw error;
    }
  }

  async delete(id) {
    logger.debug(`BaseService.delete - Starting for ${this.model.name}`, { id });
    try {
      const record = await this.model.findByPk(id);
      if (!record) {
        logger.error(`BaseService.delete - ${this.model.name} not found`, { id });
        throw new Error(`${this.model.name} not found`);
      }
      await record.destroy();
      logger.debug(`BaseService.delete - Success for ${this.model.name}`, { id });
      return { success: true };
    } catch (error) {
      logger.error(`BaseService.delete - Error for ${this.model.name}`, { id, error: error.message, stack: error.stack });
      throw error;
    }
  }
}
module.exports = BaseService;