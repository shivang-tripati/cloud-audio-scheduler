const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams: true is critical — gives access to :branchId from parent route

const { playlistController } = require('../controllers');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, validateParams } = require('../middleware/validation');
const schemas = require('../validators/schemas');

// ==================== AGENT-FACING ====================

// GET /api/branches/:branchId/playlist
// Agent calls this on startup / reconnect to get current playlist
router.get('/',
    authenticate,
    playlistController.getPlaylist
);

// ==================== ADMIN-FACING ====================

// GET /api/branches/:branchId/playlist/manage
// Admin UI — returns all items including inactive ones
router.get('/manage',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN'),
    playlistController.getPlaylistManage
);

router.get('/',
    authenticate,
    authorize("SUPER_ADMIN", "ADMIN"),
    playlistController.getPlaylist)

// POST /api/branches/:branchId/playlist
// Add an audio track to the branch playlist
router.post('/',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN'),
    validate(schemas.addToPlaylistSchema),
    playlistController.addToPlaylist
);

// PUT /api/branches/:branchId/playlist/reorder
// Drag-and-drop reorder — must be before /:itemId routes
router.put('/reorder',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN'),
    validate(schemas.reorderPlaylistSchema),
    playlistController.reorderPlaylist
);

// DELETE /api/branches/:branchId/playlist/clear
// Wipe entire playlist for a branch
router.delete('/clear',
    authenticate,
    authorize('SUPER_ADMIN'),
    playlistController.clearPlaylist
);

// DELETE /api/branches/:branchId/playlist/:itemId
router.delete('/:itemId',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN'),
    playlistController.removeFromPlaylist
);

// PATCH /api/branches/:branchId/playlist/:itemId/toggle
router.patch('/:itemId/toggle',
    authenticate,
    authorize('SUPER_ADMIN', 'ADMIN'),
    playlistController.togglePlaylistItem
);

module.exports = router;