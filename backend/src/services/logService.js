const { PlaybackLog, Device, AudioFile } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class LogService {
  async recordPlaybackLog(data) {
    logger.debug('LogService.recordPlaybackLog - Starting', { deviceCode: data.device_code, audioId: data.audio_id });
    try {
      const device = await Device.findOne({
        where: { device_code: data.device_code }
      });

      if (!device) {
        logger.error('LogService.recordPlaybackLog - Device not found', { deviceCode: data.device_code });
        throw new Error('Device not found');
      }

      const audio = await AudioFile.findByPk(data.audio_id);
      if (!audio) {
        logger.error('LogService.recordPlaybackLog - Audio file not found', { audioId: data.audio_id });
        throw new Error('Audio file not found');
      }

      const log = await PlaybackLog.create({
        device_id: device.id,
        audio_id: data.audio_id,
        played_at: data.played_at,
        status: data.status,
        reason: data.reason
      });

      logger.debug('LogService.recordPlaybackLog - Success', { logId: log.id });
      return log.toJSON();
    } catch (error) {
      logger.error('LogService.recordPlaybackLog - Error', { error: error.message, stack: error.stack });
      throw error;
    }
  }

  async getPlaybackLogs(filters = {}) {
    logger.debug('LogService.getPlaybackLogs - Starting', { filters });
    try {
      const where = {};

      if (filters.device_id) {
        where.device_id = filters.device_id;
      }

      if (filters.audio_id) {
        where.audio_id = filters.audio_id;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.start_date && filters.end_date) {
        where.played_at = {
          [Op.between]: [filters.start_date, filters.end_date]
        };
      }

      const logs = await PlaybackLog.findAll({
        where,
        include: [
          {
            model: Device,
            as: 'device',
            attributes: ['id', 'device_code', 'device_name']
          },
          {
            model: AudioFile,
            as: 'audio',
            attributes: ['id', 'title', 'audio_type']
          }
        ],
        order: [['played_at', 'DESC']],
        limit: filters.limit || 100
      });

      logger.debug('LogService.getPlaybackLogs - Success', { count: logs.length });
      return logs.map(log => log.toJSON());
    } catch (error) {
      logger.error('LogService.getPlaybackLogs - Error', { error: error.message, stack: error.stack });
      throw error;
    }
  }
}

module.exports = new LogService();