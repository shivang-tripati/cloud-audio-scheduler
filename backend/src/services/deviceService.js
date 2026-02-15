const { Device, Branch, DeviceHeartbeat } = require('../models');
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');
const generateSecureToken = require('../utils/generateSecureToken');

class DeviceService {
  async registerDevice(data) {
    logger.debug('DeviceService.registerDevice - Starting', { branchId: data.branch_id, deviceName: data.device_name });
    try {
      const branch = await Branch.findByPk(data.branch_id);
      if (!branch) {
        logger.error('DeviceService.registerDevice - Branch not found', { branchId: data.branch_id });
        throw new Error('Branch not found');
      }

      return sequelize.transaction(async (t) => {
        const device = await Device.create(
          {
            ...data,
            status: 'PENDING',
            device_code: null
          },
          { transaction: t }
        );

        const deviceCode = `DEV-${String(branch.id).padStart(6, '0')}-${String(device.id).padStart(3, '0')}`;

        await device.update(
          { device_code: deviceCode },
          { transaction: t }
        );

        logger.debug('DeviceService.registerDevice - Success', { deviceId: device.id, deviceCode });
        return device.toJSON();
      });
    } catch (error) {
      logger.error('DeviceService.registerDevice - Error', { error: error.message, stack: error.stack });
      throw error;
    }
  }

  async activateDevice(payload) {

    const { device_code, device_fingerprint, device_uuid, host_name } = payload;


    if (!device_code || !device_fingerprint || !device_uuid || !host_name) {
      logger.error('DeviceService.activateDevice - Missing payload', { payload });
      throw new Error('Missing payload');
    }
    logger.debug('DeviceService.activateDevice - Starting', { device_code });
    try {
      const device = await Device.findOne({
        where: { device_code: device_code }
      });

      if (!device) {
        logger.error('DeviceService.activateDevice - Device not found', { device_code });
        throw new Error('Invalid device code');
      }

      if (device.status === 'DISABLED') {
        logger.error('DeviceService.activateDevice - Device is disabled', { device_code });
        throw new Error('Device is disabled');
      }

      // First-time activation
      if (!device.device_fingerprint) {
        device.device_fingerprint = device_fingerprint;
        device.device_uuid = device_uuid;
        device.host_name = host_name;
        device.device_token = generateSecureToken();
        device.status = 'OFFLINE';

        await device.save();
        return { token: device.device_token, branch_id: device.branch_id };
      }

      // re-install on same machine
      if (device.device_fingerprint === device_fingerprint) {
        device.device_token = generateSecureToken(); // rotate token
        await device.save();

        return { token: device.device_token, branch_id: device.branch_id };
      }

      throw new Error(
        'This device is already activated on another system. Contact admin.'
      );

    } catch (error) {
      logger.error('DeviceService.activateDevice - Error', { device_code, payload, error: error.message, stack: error.stack });
      throw error;
    }
  }


  async resetDevice(deviceId) {
    const device = await Device.findByPk(deviceId);
    if (!device) throw new Error('Device not found');

    device.device_fingerprint = null;
    device.host_name = null;
    device.device_token = null;
    device.device_uuid = null;
    device.status = 'PENDING';

    await device.save();
  }



  async getAllDevices() {
    logger.debug('DeviceService.getAllDevices - Starting');
    try {
      const devices = await Device.findAll({
        include: [{
          model: Branch,
          as: 'branch',
          attributes: ['id', 'branch_code', 'name', 'region']
        }],
        order: [['created_at', 'DESC']]
      });
      logger.debug('DeviceService.getAllDevices - Success', { count: devices.length });
      return devices.map(device => device.toJSON());
    } catch (error) {
      logger.error('DeviceService.getAllDevices - Error', { error: error.message, stack: error.stack });
      throw error;
    }
  }

  async getDeviceById(id) {
    logger.debug('DeviceService.getDeviceById - Starting', { id });
    try {
      const device = await Device.findByPk(id, {
        include: [{
          model: Branch,
          as: 'branch',
          attributes: ['id', 'branch_code', 'name', 'city', 'state', 'region']
        }]
      });

      if (!device) {
        logger.error('DeviceService.getDeviceById - Device not found', { id });
        throw new Error('Device not found');
      }
      logger.debug('DeviceService.getDeviceById - Success', { id });
      return device.toJSON();
    } catch (error) {
      logger.error('DeviceService.getDeviceById - Error', { id, error: error.message, stack: error.stack });
      throw error;
    }
  }

  async updateDevice(id, data) {
    logger.debug('DeviceService.updateDevice - Starting', { id, data });
    try {
      const device = await Device.findByPk(id);
      if (!device) {
        logger.error('DeviceService.updateDevice - Device not found', { id });
        throw new Error('Device not found');
      }

      if (data.branch_id) {
        const branch = await Branch.findByPk(data.branch_id);
        if (!branch) {
          logger.error('DeviceService.updateDevice - Branch not found', { branchId: data.branch_id });
          throw new Error('Branch not found');
        }
      }

      await device.update(data);
      logger.debug('DeviceService.updateDevice - Success', { id });
      return device.toJSON();
    } catch (error) {
      logger.error('DeviceService.updateDevice - Error', { id, error: error.message, stack: error.stack });
      throw error;
    }
  }

  async deleteDevice(id) {
    logger.debug('DeviceService.deleteDevice - Starting', { id });
    try {
      const device = await Device.findByPk(id);
      if (!device) {
        logger.error('DeviceService.deleteDevice - Device not found', { id });
        throw new Error('Device not found');
      }

      await device.destroy();
      logger.debug('DeviceService.deleteDevice - Success', { id });
      return { message: 'Device deleted successfully' };
    } catch (error) {
      logger.error('DeviceService.deleteDevice - Error', { id, error: error.message, stack: error.stack });
      throw error;
    }
  }

  async getDeviceStatus() {
    logger.debug('DeviceService.getDeviceStatus - Starting');
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

      const devices = await Device.findAll({
        include: [{
          model: Branch,
          as: 'branch',
          attributes: ['branch_code', 'name', 'region']
        }]
      });

      logger.debug('DeviceService.getDeviceStatus - Success', { count: devices.length });
      return devices.map(device => ({
        device_id: device.id,
        device_name: device.device_name,
        branch_id: device.branch_id,
        branch: device.branch,
        status: device.last_seen && device.last_seen > fiveMinutesAgo ? "ONLINE" : "OFFLINE",
        current_state: device.current_state,
        current_audio: device.current_audio,
        volume: device.volume,
        last_seen: device.last_seen
      }));

    } catch (error) {
      logger.error('DeviceService.getDeviceStatus - Error', { error: error.message, stack: error.stack });
      throw error;
    }
  }

  async recordHeartbeat(deviceCode, online = true) {
    logger.debug('DeviceService.recordHeartbeat - Starting', { deviceCode, online });
    try {
      const device = await Device.findOne({
        where: { device_code: deviceCode }
      });

      if (!device) {
        logger.error('DeviceService.recordHeartbeat - Device not found', { deviceCode });
        throw new Error('Device not found');
      }

      await device.update({
        last_seen: new Date(),
        status: online ? 'ONLINE' : 'OFFLINE'
      });

      await DeviceHeartbeat.create({
        device_id: device.id,
        heartbeat_time: new Date(),
        online
      });

      logger.debug('DeviceService.recordHeartbeat - Success', { deviceCode });
      return { message: 'Heartbeat recorded' };
    } catch (error) {
      logger.error('DeviceService.recordHeartbeat - Error', { deviceCode, error: error.message, stack: error.stack });
      throw error;
    }
  }
}

module.exports = new DeviceService();