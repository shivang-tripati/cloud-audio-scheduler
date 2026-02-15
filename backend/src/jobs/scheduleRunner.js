const cron = require('node-cron');
const { Op } = require('sequelize');
const { Schedule, ScheduleTarget, AudioFile, Device, Branch, PlaybackLog } = require('../models');

module.exports = function startScheduleRunner() {
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();
            const hhmm = now.toTimeString().slice(0, 5); // "09:30"
            const today = now.toISOString().split('T')[0];

            // 1. Get all schedules that should fire now
            const schedules = await Schedule.findAll({
                where: {
                    is_active: true,
                    play_time: hhmm,
                    [Op.or]: [
                        { start_date: null },
                        { start_date: { [Op.lte]: today } }
                    ],
                    [Op.or]: [
                        { end_date: null },
                        { end_date: { [Op.gte]: today } }
                    ]
                },
                include: [
                    { model: AudioFile, as: 'audio' },
                    { model: ScheduleTarget, as: 'targets' }
                ]
            });

            for (const schedule of schedules) {
                // 2. Find all devices that match targets
                const devices = await Device.findAll({
                    where: { status: 'ONLINE' },
                    include: [{ model: Branch, as: 'branch' }]
                });

                for (const device of devices) {
                    if (!matchesTarget(schedule.targets, device.branch)) continue;

                    const executionKey = `${schedule.id}_${device.id}_${today}_${hhmm}`;

                    // 3. Prevent duplicate play
                    const alreadyPlayed = await PlaybackLog.findOne({
                        where: { execution_key: executionKey }
                    });
                    if (alreadyPlayed) continue;

                    // 4. Send play to device
                    global.sendToDevice(device.id, {
                        type: "PLAY",
                        audio: schedule.audio,
                        priority: schedule.priority,
                        schedule_id: schedule.id
                    });

                    // 5. Log playback
                    await PlaybackLog.create({
                        device_id: device.id,
                        schedule_id: schedule.id,
                        execution_key: executionKey,
                        played_at: new Date()
                    });
                }
            }
        } catch (err) {
            console.error("ScheduleRunner error", err);
        }
    });
};

function matchesTarget(targets, branch) {
    return targets.some(t => {
        if (t.target_type === 'ALL') return true;
        if (t.target_type === 'REGION' && t.target_value === branch.region) return true;
        if (t.target_type === 'BRANCH' && t.target_value === branch.branch_code) return true;
        return false;
    });
}
