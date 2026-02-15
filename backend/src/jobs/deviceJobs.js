const cron = require('node-cron');
const { Device } = require('../models');
const { Op } = require('sequelize');

const startDeviceJobs = () => {
  // Every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      const threshold = new Date(Date.now() - 5 * 60 * 1000);

      const [count] = await Device.update(
        { status: 'OFFLINE' },
        {
          where: {
            status: 'ONLINE',
            last_seen: { [Op.lt]: threshold }
          }
        }
      );

      if (count > 0) {
        console.log(`[DeviceJob] Marked ${count} devices OFFLINE`);
      }
    } catch (err) {
      console.error('[DeviceJob] Error:', err);
    }
  });
};

module.exports = startDeviceJobs;
