const scheduleService = require('../services/scheduleService');

const scheduleController = {
  async create(req, res) {
    try {
      const schedule = await scheduleService.createSchedule(req.body);
      res.status(201).json({
        success: true,
        data: schedule
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
      const schedules = await scheduleService.getAllSchedules();
      res.status(200).json({
        success: true,
        data: schedules
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
      const schedule = await scheduleService.getScheduleById(req.params.id);
      res.status(200).json({
        success: true,
        data: schedule
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
      const schedule = await scheduleService.updateSchedule(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: schedule
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
      const result = await scheduleService.deleteSchedule(req.params.id);
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
  },

  async getDeviceSchedule(req, res) {
    try {
      const schedule = await scheduleService.getDeviceSchedule(req.query.device_code);
      res.status(200).json({
        success: true,
        data: schedule
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = scheduleController;