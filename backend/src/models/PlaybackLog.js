// PlaybackLog.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PlaybackLog = sequelize.define('PlaybackLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  device_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'devices',
      key: 'id'
    }
  },
  audio_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'audio_files',
      key: 'id'
    }
  },
  played_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('PLAYED', 'MISSED'),
    allowNull: false
  },
  reason: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'playback_logs',
  timestamps: true,
  updatedAt: false,
  createdAt: 'created_at',
  indexes: [
    { fields: ['device_id'] },
    { fields: ['audio_id'] },
    { fields: ['played_at'] },
    { fields: ['status'] }
  ]
});

// DeviceHeartbeat.js
const DeviceHeartbeat = sequelize.define('DeviceHeartbeat', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  device_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'devices',
      key: 'id'
    }
  },
  heartbeat_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  online: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'device_heartbeats',
  timestamps: false,
  indexes: [
    { fields: ['device_id'] },
    { fields: ['heartbeat_time'] },
    { fields: ['online'] }
  ]
});

module.exports = { PlaybackLog, DeviceHeartbeat };