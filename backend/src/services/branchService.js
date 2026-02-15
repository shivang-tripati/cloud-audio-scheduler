const { Branch, Device } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class BranchService {
  async createBranch(data) {
    logger.debug('BranchService.createBranch - Starting', { data });
    try {
      return await sequelize.transaction(async (t) => {
        const branch = await Branch.create(
          {
            ...data,
            branch_code: null
          },
          { transaction: t }
        );

        const branchCode = `BR-${String(branch.id).padStart(6, '0')}`;

        await branch.update(
          { branch_code: branchCode },
          { transaction: t }
        );

        logger.debug('BranchService.createBranch - Success', { branchId: branch.id, branchCode });
        return branch.toJSON();
      });
    } catch (error) {
      logger.error('BranchService.createBranch - Error', { error: error.message, stack: error.stack });
      throw error;
    }
  }

  async getAllBranches() {
    logger.debug('BranchService.getAllBranches - Starting');
    try {
      const branches = await Branch.findAll({
        include: [{
          model: Device,
          as: 'devices',
          attributes: ['id', 'device_code', 'device_name', 'status']
        }],
        order: [['created_at', 'DESC']]
      });
      logger.debug('BranchService.getAllBranches - Success', { count: branches.length });
      return branches.map(branch => branch.toJSON());
    } catch (error) {
      logger.error('BranchService.getAllBranches - Error', { error: error.message, stack: error.stack });
      throw error;
    }
  }

  async getBranchById(id) {
    logger.debug('BranchService.getBranchById - Starting', { id });
    try {
      const branch = await Branch.findByPk(id, {
        include: [{
          model: Device,
          as: 'devices',
          attributes: ['id', 'device_code', 'device_name', 'status', 'last_seen']
        }]
      });

      if (!branch) {
        logger.error('BranchService.getBranchById - Branch not found', { id });
        throw new Error('Branch not found');
      }
      logger.debug('BranchService.getBranchById - Success', { id });
      return branch.toJSON();
    } catch (error) {
      logger.error('BranchService.getBranchById - Error', { id, error: error.message, stack: error.stack });
      throw error;
    }
  }

  async updateBranch(id, data) {
    logger.debug('BranchService.updateBranch - Starting', { id, data });
    try {
      const branch = await Branch.findByPk(id);
      if (!branch) {
        logger.error('BranchService.updateBranch - Branch not found', { id });
        throw new Error('Branch not found');
      }

      if (data.branch_code && data.branch_code !== branch.branch_code) {
        const existing = await Branch.findOne({
          where: {
            branch_code: data.branch_code,
            id: { [Op.ne]: id }
          }
        });
        if (existing) {
          logger.error('BranchService.updateBranch - Branch code already exists', { branchCode: data.branch_code });
          throw new Error('Branch code already exists');
        }
      }

      await branch.update(data);
      logger.debug('BranchService.updateBranch - Success', { id });
      return branch.toJSON();
    } catch (error) {
      logger.error('BranchService.updateBranch - Error', { id, error: error.message, stack: error.stack });
      throw error;
    }
  }

  async deleteBranch(id) {
    logger.debug('BranchService.deleteBranch - Starting', { id });
    try {
      const branch = await Branch.findByPk(id);
      if (!branch) {
        logger.error('BranchService.deleteBranch - Branch not found', { id });
        throw new Error('Branch not found');
      }

      await branch.destroy();
      logger.debug('BranchService.deleteBranch - Success', { id });
      return { message: 'Branch deleted successfully' };
    } catch (error) {
      logger.error('BranchService.deleteBranch - Error', { id, error: error.message, stack: error.stack });
      throw error;
    }
  }
}

module.exports = new BranchService();