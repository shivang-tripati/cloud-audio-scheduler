/**
 * PlaylistController
 * Handles HTTP req/res only.
 * Delegates DB work to playlistService.
 * Delegates socket broadcast to playlistEmitter.
 */

const playlistService = require('../services/playlistService');
const playlistEmitter = require('../emiters/playlistemitter');
const logger = require('../utils/logger');

/**
 * GET /api/branches/:branchId/playlist
 * Agent-facing — active tracks only
 */
const getPlaylist = async (req, res) => {
    try {
        const { branchId } = req.params;
        const playlist = await playlistService.getActivePlaylist(branchId);

        if (playlist === null) {
            return res.status(404).json({ success: false, message: 'Branch not found' });
        }

        return res.json({ success: true, data: playlist });
    } catch (err) {
        logger.error('getPlaylist error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * GET /api/branches/:branchId/playlist/manage
 * Admin-facing — all items including inactive
 */
const getPlaylistManage = async (req, res) => {
    try {
        const { branchId } = req.params;
        const playlist = await playlistService.getPlaylistForAdmin(branchId);
        logger.debug("playlist", playlist);

        if (playlist === null) {
            return res.status(404).json({ success: false, message: 'Branch not found' });
        }

        return res.json({ success: true, data: playlist });
    } catch (err) {
        logger.error('getPlaylistManage error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * POST /api/branches/:branchId/playlist
 * Body: { audio_id }
 */
const addToPlaylist = async (req, res) => {
    try {
        const { branchId } = req.params;
        const { audio_id } = req.body;

        if (!audio_id) {
            return res.status(400).json({ success: false, message: 'audio_id is required' });
        }

        const result = await playlistService.addToPlaylist(branchId, audio_id);

        if (result.error) {
            return res.status(result.status).json({ success: false, message: result.error });
        }

        // Broadcast to all branch devices
        await playlistEmitter.toBranch(branchId);

        return res.status(201).json({ success: true, message: 'Audio added to playlist' });
    } catch (err) {
        logger.error('addToPlaylist error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * DELETE /api/branches/:branchId/playlist/:itemId
 */
const removeFromPlaylist = async (req, res) => {
    try {
        const { branchId, itemId } = req.params;

        const result = await playlistService.removeFromPlaylist(branchId, itemId);

        if (result.error) {
            return res.status(result.status).json({ success: false, message: result.error });
        }

        await playlistEmitter.toBranch(branchId);

        return res.json({ success: true, message: 'Removed from playlist' });
    } catch (err) {
        logger.error('removeFromPlaylist error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * PATCH /api/branches/:branchId/playlist/:itemId/toggle
 */
const togglePlaylistItem = async (req, res) => {
    try {
        const { branchId, itemId } = req.params;

        const result = await playlistService.toggleItem(branchId, itemId);

        if (result.error) {
            return res.status(result.status).json({ success: false, message: result.error });
        }

        await playlistEmitter.toBranch(branchId);

        return res.json({ success: true, is_active: result.is_active });
    } catch (err) {
        logger.error('togglePlaylistItem error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * PUT /api/branches/:branchId/playlist/reorder
 * Body: { items: [{ id, order_index }] }
 */
const reorderPlaylist = async (req, res) => {
    try {
        const { branchId } = req.params;
        const { items } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'items array required' });
        }

        await playlistService.reorderPlaylist(branchId, items);

        await playlistEmitter.toBranch(branchId);

        return res.json({ success: true, message: 'Playlist reordered' });
    } catch (err) {
        logger.error('reorderPlaylist error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * DELETE /api/branches/:branchId/playlist/clear
 */
const clearPlaylist = async (req, res) => {
    try {
        const { branchId } = req.params;

        await playlistService.clearPlaylist(branchId);

        await playlistEmitter.toBranch(branchId);

        return res.json({ success: true, message: 'Playlist cleared' });
    } catch (err) {
        logger.error('clearPlaylist error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    getPlaylist,
    getPlaylistManage,
    addToPlaylist,
    removeFromPlaylist,
    togglePlaylistItem,
    reorderPlaylist,
    clearPlaylist
};