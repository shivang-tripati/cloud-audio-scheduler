const { Device, Branch } = require('../models');
const logger = require('../utils/logger');

module.exports.pushScheduleToDevices = async function () {
    const allDevices = await Device.findAll({
        include: [{ model: Branch, as: 'branch' }]
    });
    const onlineDevices = allDevices.filter(d => d.status.toUpperCase() === 'ONLINE');
    logger.info(`System has ${allDevices.length} total devices. ${onlineDevices.length} are ONLINE.`);
    // logger.debug('ScheduleBroadcaster.pushScheduleToDevices - Starting', { count: devices.length });
    // logger.info(`Found ${devices.length} online devices to update schedule`);

    if (onlineDevices.length === 0) {
        // Log the status of the first device to see why it failed the filter
        logger.warn(`Debug: First device status is [${allDevices[0]?.status}]`);
    }

    for (const device of onlineDevices) {
        try {
            const isSocketActive = global.deviceSockets ? global.deviceSockets.has(device.id) : false;
            if (!isSocketActive) {
                logger.debug(`Device ${device.device_code} is not active`);
                continue;
            }

            logger.info(`📡 Checking Map for Device ID ${device.id} (${device.device_code}): ${isSocketActive ? 'MATCH FOUND' : 'NO ACTIVE SOCKET'}`);
            const scheduleService = require('../services/scheduleService');
            const schedule = await scheduleService.getDeviceSchedule(device.device_code);

            global.sendToDevice(device.id, {
                type: "SCHEDULE_UPDATE",
                schedule: schedule.schedules
            });

            logger.info(`📤 Schedule pushed → ${device.device_code}`);
        } catch (err) {
            logger.error(`Failed pushing schedule to ${device.device_code}`, err.message);
        }
    }
};
