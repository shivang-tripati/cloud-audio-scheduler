const logService = require('../services/logService');

const logController = {
  async recordPlayback(req, res) {
    try {
      const log = await logService.recordPlaybackLog(req.body);
      res.status(201).json({
        success: true,
        data: log
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = logController;