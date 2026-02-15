const User = require('./User');
const Branch = require('./Branch');
const Device = require('./Device');
const AudioFile = require('./AudioFile');
const Schedule = require('./Schedule');
const ScheduleTarget = require('./ScheduleTarget');
const { PlaybackLog, DeviceHeartbeat } = require('./PlaybackLog');

// Define Associations

// Branch -> Devices (One-to-Many)
Branch.hasMany(Device, {
  foreignKey: 'branch_id',
  as: 'devices',
  onDelete: 'CASCADE'
});
Device.belongsTo(Branch, {
  foreignKey: 'branch_id',
  as: 'branch'
});

// AudioFile -> Schedules (One-to-Many)
AudioFile.hasMany(Schedule, {
  foreignKey: 'audio_id',
  as: 'schedules',
  onDelete: 'CASCADE'
});
Schedule.belongsTo(AudioFile, {
  foreignKey: 'audio_id',
  as: 'audio'
});

// Schedule -> ScheduleTargets (One-to-Many)
Schedule.hasMany(ScheduleTarget, {
  foreignKey: 'schedule_id',
  as: 'targets',
  onDelete: 'CASCADE'
});
ScheduleTarget.belongsTo(Schedule, {
  foreignKey: 'schedule_id',
  as: 'schedule'
});

// Device -> PlaybackLogs (One-to-Many)
Device.hasMany(PlaybackLog, {
  foreignKey: 'device_id',
  as: 'playback_logs',
  onDelete: 'CASCADE'
});
PlaybackLog.belongsTo(Device, {
  foreignKey: 'device_id',
  as: 'device'
});

// AudioFile -> PlaybackLogs (One-to-Many)
AudioFile.hasMany(PlaybackLog, {
  foreignKey: 'audio_id',
  as: 'playback_logs',
  onDelete: 'CASCADE'
});
PlaybackLog.belongsTo(AudioFile, {
  foreignKey: 'audio_id',
  as: 'audio'
});

// Device -> DeviceHeartbeats (One-to-Many)
Device.hasMany(DeviceHeartbeat, {
  foreignKey: 'device_id',
  as: 'heartbeats',
  onDelete: 'CASCADE'
});
DeviceHeartbeat.belongsTo(Device, {
  foreignKey: 'device_id',
  as: 'device'
});

module.exports = {
  User,
  Branch,
  Device,
  AudioFile,
  Schedule,
  ScheduleTarget,
  PlaybackLog,
  DeviceHeartbeat
};