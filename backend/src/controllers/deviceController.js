const deviceService = require('../services/deviceService');

const deviceController = {
  async register(req, res) {
    try {
      const device = await deviceService.registerDevice(req.body);
      res.status(201).json({
        success: true,
        data: device
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message``
      });
    }
  },

  async activate(req, res) {
    try {
      const result = await deviceService.activateDevice(req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  async reset(req, res) {
    try {
      const device = await deviceService.resetDevice(req.params.id);
      res.status(200).json({
        success: true,
        data: device
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  },

  async getAll(req, res) {
    try {
      const devices = await deviceService.getAllDevices();
      res.status(200).json({
        success: true,
        data: devices
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
      const device = await deviceService.getDeviceById(req.params.id);
      res.status(200).json({
        success: true,
        data: device
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
      const device = await deviceService.updateDevice(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: device
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
      const result = await deviceService.deleteDevice(req.params.id);
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

  async getStatus(req, res) {
    try {
      const status = await deviceService.getDeviceStatus();
      res.status(200).json({
        success: true,
        data: status
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  async heartbeat(req, res) {
    try {
      const device = req.device;

      if (device.status === 'DISABLED') {
        return res.status(403).json({
          success: false,
          message: 'Device is disabled'
        });
      }
      device.last_seen = new Date();
      device.status = 'ONLINE';
      await device.save();


      res.json({ success: true, message: 'Heartbeat recorded' });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },


};

module.exports = deviceController;