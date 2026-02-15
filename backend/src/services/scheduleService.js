const { Schedule, ScheduleTarget, AudioFile, Device, Branch } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const { flattenScheduleTargets } = require('../utils/scheduleMapper');
const { pushScheduleToDevices } = require('../realtime/scheduleBroadcaster');

class ScheduleService {
  async createSchedule(data) {
    logger.debug('ScheduleService.createSchedule - Starting', { audioId: data.audio_id, scheduleType: data.schedule_type });
    try {
      const audio = await AudioFile.findByPk(data.audio_id);
      if (!audio) {
        logger.error('ScheduleService.createSchedule - Audio file not found', { audioId: data.audio_id });
        throw new Error('Audio file not found');
      }

      const targets = data.targets;

      const uniqueTypes = new Set(targets.map(t => t.target_type));
      if (uniqueTypes.size > 1) {
        throw new Error('Mixed target types are not allowed');
      }

      if (targets[0].target_type === 'ALL' && targets.length !== 1) {
        throw new Error('ALL target must be single');
      }

      if (targets[0].target_type === 'REGION' && targets.length !== 1) {
        throw new Error('Only one region allowed');
      }


      delete data.targets;

      const transaction = await sequelize.transaction();

      try {
        const schedule = await Schedule.create(data, { transaction });

        const targetRecords = targets.map(target => ({
          schedule_id: schedule.id,
          ...target
        }));

        await ScheduleTarget.bulkCreate(targetRecords, { transaction });
        await transaction.commit();

        pushScheduleToDevices().catch(err => {
          logger.error('ScheduleService.createSchedule - Background socket push failed after creating schedule', { error: err.message, stack: err.stack });
        });

        logger.debug('ScheduleService.createSchedule - Success', { scheduleId: schedule.id });
        return await this.getScheduleById(schedule.id);
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      logger.error('ScheduleService.createSchedule - Error', { error: error.message, stack: error.stack });
      throw error;
    }
  }

  async getAllSchedules() {
    logger.debug('ScheduleService.getAllSchedules - Starting');
    try {
      const schedules = await Schedule.findAll({
        include: [
          {
            model: AudioFile,
            as: 'audio',
            attributes: ['id', 'title', 'audio_type', 'language', 'file_url', 'duration_seconds']
          },
          {
            model: ScheduleTarget,
            as: 'targets',
            attributes: ['id', 'target_type', 'target_value']
          }
        ],
        order: [['priority', 'ASC'], ['play_time', 'ASC']]
      });
      logger.debug('ScheduleService.getAllSchedules - Success', { count: schedules.length });
      return schedules.map(s => flattenScheduleTargets(s.toJSON()));
    } catch (error) {
      logger.error('ScheduleService.getAllSchedules - Error', { error: error.message, stack: error.stack });
      throw error;
    }
  }

  async getScheduleById(id) {
    logger.debug('ScheduleService.getScheduleById - Starting', { id });
    try {
      const schedule = await Schedule.findByPk(id, {
        include: [
          {
            model: AudioFile,
            as: 'audio',
            attributes: ['id', 'title', 'audio_type', 'language', 'file_url', 'duration_seconds']
          },
          {
            model: ScheduleTarget,
            as: 'targets',
            attributes: ['id', 'target_type', 'target_value']
          }
        ]
      });

      if (!schedule) {
        logger.error('ScheduleService.getScheduleById - Schedule not found', { id });
        throw new Error('Schedule not found');
      }
      logger.debug('ScheduleService.getScheduleById - Success', { id });
      return flattenScheduleTargets(schedule.toJSON());
    } catch (error) {
      logger.error('ScheduleService.getScheduleById - Error', { id, error: error.message, stack: error.stack });
      throw error;
    }
  }

  async updateSchedule(id, data) {
    logger.debug('ScheduleService.updateSchedule - Starting', { id });
    try {
      const schedule = await Schedule.findByPk(id);
      if (!schedule) {
        logger.error('ScheduleService.updateSchedule - Schedule not found', { id });
        throw new Error('Schedule not found');
      }

      if (data.audio_id) {
        const audio = await AudioFile.findByPk(data.audio_id);
        if (!audio) {
          logger.error('ScheduleService.updateSchedule - Audio file not found', { audioId: data.audio_id });
          throw new Error('Audio file not found');
        }
      }

      const targets = data.targets;

      const uniqueTypes = new Set(targets.map(t => t.target_type));
      if (uniqueTypes.size > 1) {
        throw new Error('Mixed target types are not allowed');
      }

      if (targets[0].target_type === 'ALL' && targets.length !== 1) {
        throw new Error('ALL target must be single');
      }

      if (targets[0].target_type === 'REGION' && targets.length !== 1) {
        throw new Error('Only one region allowed');
      }


      delete data.targets;

      const transaction = await sequelize.transaction();

      try {
        await schedule.update(data, { transaction });

        if (targets) {
          await ScheduleTarget.destroy({
            where: { schedule_id: id },
            transaction
          });

          const targetRecords = targets.map(target => ({
            schedule_id: id,
            ...target
          }));

          await ScheduleTarget.bulkCreate(targetRecords, { transaction });
        }

        await transaction.commit();
        pushScheduleToDevices().catch(err => {
          logger.error('ScheduleService.updateSchedule - Background socket push failed after updating schedule', { error: err.message, stack: err.stack });
        });
        logger.debug('ScheduleService.updateSchedule - Success', { id });
        return await this.getScheduleById(id);
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      logger.error('ScheduleService.updateSchedule - Error', { id, error: error.message, stack: error.stack });
      throw error;
    }
  }

  async deleteSchedule(id) {
    logger.debug('ScheduleService.deleteSchedule - Starting', { id });
    try {
      const schedule = await Schedule.findByPk(id);
      if (!schedule) {
        logger.error('ScheduleService.deleteSchedule - Schedule not found', { id });
        throw new Error('Schedule not found');
      }

      await schedule.destroy();
      pushScheduleToDevices().catch(err =>
        logger.error('ScheduleService.deleteSchedule - Background socket push failed after deleting schedule', { error: err.message, stack: err.stack })
      );
      logger.debug('ScheduleService.deleteSchedule - Success', { id });
      return { message: 'Schedule deleted successfully' };
    } catch (error) {
      logger.error('ScheduleService.deleteSchedule - Error', { id, error: error.message, stack: error.stack });
      throw error;
    }
  }

  async getDeviceSchedule(deviceCode) {
    logger.debug('ScheduleService.getDeviceSchedule - Starting', { deviceCode });
    try {
      const device = await Device.findOne({
        where: { device_code: deviceCode },
        include: [{
          model: Branch,
          as: 'branch'
        }]
      });

      if (!device) {
        logger.error('ScheduleService.getDeviceSchedule - Device not found', { deviceCode });
        throw new Error('Device not found');
      }

      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      logger.debug('ScheduleService.getDeviceSchedule - Fetching schedules', { deviceCode, todayStr });

      const schedules = await Schedule.findAll({
        where: {
          is_active: true,
          [Op.or]: [
            { start_date: null },
            { start_date: { [Op.lte]: todayStr } }
          ],
          [Op.or]: [
            { end_date: null },
            { end_date: { [Op.gte]: todayStr } }
          ]
        },
        include: [
          {
            model: AudioFile,
            as: 'audio',
            where: { is_active: true }
          },
          {
            model: ScheduleTarget,
            as: 'targets'
          }
        ],
        order: [['priority', 'ASC'], ['play_time', 'ASC']]
      });

      const filteredSchedules = schedules.filter(schedule => {
        return schedule.targets.some(target => {
          if (target.target_type === 'ALL') return true;
          if (target.target_type === 'REGION' && target.target_value === device.branch.region) return true;
          if (target.target_type === 'BRANCH' && target.target_value === device.branch.branch_code) return true;
          return false;
        });
      });

      const resolvedSchedule = this._resolvePriorityConflicts(filteredSchedules);

      logger.debug('ScheduleService.getDeviceSchedule - Success', { deviceCode, scheduleCount: resolvedSchedule.length });

      return {
        device: {
          id: device.id,
          device_code: device.device_code,
          device_name: device.device_name
        },
        branch: {
          branch_code: device.branch.branch_code,
          name: device.branch.name,
          region: device.branch.region
        },
        schedule_date: todayStr,
        schedules: resolvedSchedule.map(s => ({
          schedule_id: s.id,
          audio: {
            id: s.audio.id,
            title: s.audio.title,
            audio_type: s.audio.audio_type,
            language: s.audio.language,
            file_url: `${process.env.BASE_URL || 'http://127.0.0.1:3000'}/${s.audio.file_url}`,
            duration_seconds: s.audio.duration_seconds
          },
          schedule_type: s.schedule_type,
          play_time: s.play_time,
          play_count: s.play_count,
          priority: s.priority,
          offline_required: s.schedule_type === 'DAILY_PRAYER'
        }))
      };
    } catch (error) {
      logger.error('ScheduleService.getDeviceSchedule - Error', { deviceCode, error: error.message, stack: error.stack });
      throw error;
    }
  }

  _resolvePriorityConflicts(schedules) {
    logger.debug('ScheduleService._resolvePriorityConflicts - Starting', { inputCount: schedules.length });
    const timeSlots = new Map();

    schedules.forEach(schedule => {
      const key = schedule.play_time;
      const existing = timeSlots.get(key);

      if (!existing || schedule.priority < existing.priority) {
        timeSlots.set(key, schedule);
      }
    });

    const result = Array.from(timeSlots.values()).sort((a, b) => {
      const timeA = a.play_time.split(':').map(Number);
      const timeB = b.play_time.split(':').map(Number);
      return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
    });

    logger.debug('ScheduleService._resolvePriorityConflicts - Done', { outputCount: result.length });
    return result;
  }
}

module.exports = new ScheduleService();