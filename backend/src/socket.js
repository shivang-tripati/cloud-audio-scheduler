const { Device } = require('./models');
const jwt = require('jsonwebtoken');
const scheduleService = require('./services/scheduleService');


const deviceSockets = new Map(); // device_id → socket
global.deviceSockets = deviceSockets; // making it global for scheduleService

module.exports = (io) => {
    io.use(async (socket, next) => {
        try {
            const authHeader = socket.handshake.auth?.token;
            if (!authHeader) return next(new Error('NO_TOKEN'));

            const token = authHeader.replace('Bearer ', '');

            const device = await Device.findOne({
                where: { device_token: token }
            });

            if (!device) throw "Invalid token";

            socket.device = device;
            deviceSockets.set(device.id, socket);

            return next();
        } catch (err) {
            return next(new Error("Unauthorized device"));
        }
    });

    io.on('connection', async (socket) => {
        const device = socket.device;

        console.log(`🔌 Device connected: ${device.device_code}`);


        const schedule = await scheduleService.getDeviceSchedule(device.device_code);

        socket.emit('command', {
            type: "SCHEDULE_UPDATE",
            schedule: schedule.schedules
        });

        socket.on('heartbeat', async (data) => {
            const actual_time = new Date();
            console.log(`💓 Heartbeat from ${device.device_code}:`, data);
            await device.update({
                status: "ONLINE",
                current_state: data.status,
                current_audio: data.current_audio,
                volume: data.volume,
                last_seen: actual_time
            });

            io.emit("device_status_update", {
                device_id: device.id,
                status: "ONLINE",
                branch_id: device.branch_id,
                current_state: data.status,
                current_audio: data.current_audio,
                volume: data.volume,
                last_seen: actual_time
            });
        });

        socket.on('disconnect', () => {
            if (socket.device) {
                socket.device.update({ status: 'OFFLINE' });
                deviceSockets.delete(socket.device.id);
                console.log(`📡 Agent ${socket.device.device_code} went OFFLINE`);
            } else {
                console.log(`🌐 Admin User disconnected (Dashboard reload)`);
            }
        });
    });

    // Allow API to push commands
    global.sendToDevice = (deviceId, payload) => {
        const socket = global.deviceSockets.get(deviceId);
        if (socket) {
            socket.emit('command', payload);
        }
    };
};
