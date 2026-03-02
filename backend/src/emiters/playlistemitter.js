/**
 * PlaylistEmitter
 * 
 * Single place that holds the io reference and sends PLAYLIST_UPDATE.
 * 
 * INIT ONCE in server.js:
 *   const playlistEmitter = require('./socket/playlistEmitter');
 *   playlistEmitter.init(io);
 * 
 * THEN USE ANYWHERE:
 *   const playlistEmitter = require('./socket/playlistEmitter');
 *   await playlistEmitter.toBranch(branchId);
 */

const playlistService = require('../services/playlistService');
const logger = require('../utils/logger');

class PlaylistEmitter {
    constructor() {
        this._io = null;
    }

    /**
     * Call once at server startup after io is created.
     * server.js → playlistEmitter.init(io)
     */
    init(io) {
        this._io = io;
        logger.info('[PlaylistEmitter] Initialized');
    }

    /**
     * Send PLAYLIST_UPDATE to every device in the branch room.
     * Called by: playlistController after any mutation.
     */
    async toBranch(branchId) {
        if (!this._io) {
            logger.warn('[PlaylistEmitter] Not initialized — call init(io) in server.js');
            return;
        }

        try {
            const playlist = await playlistService.buildPlaylistPayload(branchId);

            this._io.to(`branch_${branchId}`).emit('command', {
                type: 'PLAYLIST_UPDATE',
                playlist
            });

            logger.info(`[PlaylistEmitter] → branch_${branchId} | ${playlist.length} tracks`);
        } catch (err) {
            logger.error('[PlaylistEmitter] Failed to emit:', err);
        }
    }
}

// Singleton — same instance shared everywhere
module.exports = new PlaylistEmitter();