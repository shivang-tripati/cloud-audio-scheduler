const userController = require('./userController');
const authController = require('./authController');
const branchController = require('./branchController');
const deviceController = require('./deviceController');
const audioController = require('./audioController');
const scheduleController = require('./scheduleController');
const logController = require('./logController');
const playlistController = require('./branchPlaylistController');

module.exports = {
  authController,
  branchController,
  deviceController,
  audioController,
  scheduleController,
  playlistController,
  logController,
  userController
};