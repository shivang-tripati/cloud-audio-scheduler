const branchService = require('../services/branchService');

const branchController = {
  async create(req, res) {
    try {
      console.log(req.body);
      const branch = await branchService.createBranch(req.body);
      res.status(201).json({
        success: true,
        data: branch
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  async getAll(req, res) {
    try {
      const branches = await branchService.getAllBranches();
      res.status(200).json({
        success: true,
        data: branches
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  async getById(req, res) {
    try {
      const branch = await branchService.getBranchById(req.params.id);
      res.status(200).json({
        success: true,
        data: branch
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  },

  async update(req, res) {
    try {
      const branch = await branchService.updateBranch(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: branch
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  async delete(req, res) {
    try {
      const result = await branchService.deleteBranch(req.params.id);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = branchController;