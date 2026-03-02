const { Device } = require('./models');
const jwt = require('jsonwebtoken');
const cookie = require("cookie");
const scheduleService = require('./services/scheduleService');
const playlistService = require('./services/playlistService');
const logger = require('./utils/logger');





const deviceSockets = new Map(); // device_id → socket
global.deviceSockets = deviceSockets; // making it global for scheduleService

module.exports = (io) => {
    // ─────────────────────────────────────────────
    // AUTH MIDDLEWARE
    // ─────────────────────────────────────────────
    io.use(async (socket, next) => {
        try {
            const authHeader = socket.handshake.auth?.token;

            if (!authHeader)
                return next(new Error("NO_TOKEN"));


            const token = authHeader.replace('Bearer ', '');

            const device = await Device.findOne({
                where: { device_token: token }
            });

            if (device) {
                socket.device = device;
                socket.type = "device";
                deviceSockets.set(device.id, socket);

                return next();

            }




            // ─────────────────────────────────
            // TRY ADMIN AUTH
            // ─────────────────────────────────

            try {

                const decoded = jwt.verify(token, process.env.JWT_SECRET);

                socket.user = decoded;
                socket.type = "admin";

                return next();

            }
            catch {

                return next(new Error("INVALID_TOKEN"));

            }

        } catch (err) {
            return next(new Error("Unauthorized"));
        }
    });

    // ─────────────────────────────────────────────
    // CONNECTION HANDLER
    // ─────────────────────────────────────────────
    io.on('connection', async (socket) => {

        // ─────────────────────────────────────────────
        // DEVICE CONNECTION (EXISTING LOGIC — UNTOUCHED)
        // ─────────────────────────────────────────────
        if (socket.type === "device" && socket.device) {

            const device = socket.device;

            logger.info(`🔌 Device connected: ${device.device_code} (branch: ${device.branch_id})`);

            // Join branch room so we can broadcast playlist updates to all branch devices at once
            socket.join(`branch_${device.branch_id}`);

            //1. Send volume settings
            socket.emit('command', {
                type: "VOLUME",
                masterVolume: device.master_volume,
                branchVolume: device.branch_volume
            });

            //2. Send schedule
            const schedule = await scheduleService.getDeviceSchedule(device.device_code);

            socket.emit('command', {
                type: "SCHEDULE_UPDATE",
                schedule: schedule.schedules
            });

            //3. Send playlist
            try {

                const playlist = await playlistService.buildPlaylistPayload(device.branch_id);

                socket.emit('command', {
                    type: "PLAYLIST_UPDATE",
                    playlist
                });

                logger.info(`📻 Sent playlist to ${device.device_code} — ${playlist.length} tracks`);

            } catch (error) {

                logger.error(`Failed to send playlist to ${device.device_code}:`, error);

            }

            // Heartbeat
            socket.on('heartbeat', async (data) => {

                const actual_time = new Date();

                logger.info(`💓 Heartbeat from ${device.device_code}:`, data);

                await device.update({

                    status: "ONLINE",
                    current_state: data.status,
                    current_audio: data.current_audio,
                    volume: data.volume,
                    last_seen: actual_time

                });

                // Broadcast to ALL dashboards
                io.emit('device_status_update', {
                    device_id: device.id,
                    status: 'ONLINE',
                    branch_id: device.branch_id,
                    current_state: data.status,
                    current_audio: data.current_audio,
                    volume: data.volume,
                    last_seen: actual_time,
                    mode: data.mode,
                    audio_id: data.audio_id,
                    position_ms: data.position_ms

                });

            });

        }


        // ─────────────────────────────────────────────
        // ADMIN FRONTEND CONNECTION (NEW — SAFE ADD)
        // ─────────────────────────────────────────────
        if (socket.type === "admin") {

            logger.info(`🌐 Admin dashboard connected`);

            // No extra logic needed.
            // Admin will automatically receive:
            // device_status_update
            // playlist updates
            // etc.

        }


        // ─────────────────────────────────────────────
        // DISCONNECT HANDLER (SAFE FOR BOTH)
        // ─────────────────────────────────────────────
        socket.on('disconnect', () => {

            if (socket.type === "device" && socket.device) {

                socket.device.update({ status: 'OFFLINE' });

                deviceSockets.delete(socket.device.id);

                logger.info(`📡 Agent ${socket.device.device_code} went OFFLINE`);

                // Notify dashboard
                io.emit('device_status_update', {

                    device_id: socket.device.id,
                    status: 'OFFLINE',
                    branch_id: socket.device.branch_id,
                    last_seen: new Date()

                });

            }

            else if (socket.type === "admin") {

                logger.info(`🌐 Admin User disconnected`);

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
