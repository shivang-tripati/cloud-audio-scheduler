const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Device = sequelize.define('Device', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  branch_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'branches',
      key: 'id'
    }
  },
  current_state: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'IDLE'
  },
  current_audio: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  volume: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
    allowNull: true
  },
  device_code: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true
  },
  device_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  host_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  device_uuid: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  device_fingerprint: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true
  },
  device_token: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  last_seen: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('ONLINE', 'OFFLINE', 'DISABLED', 'PENDING'),
    defaultValue: 'PENDING'
  }
}, {
  tableName: 'devices',
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  indexes: [
    { fields: ['branch_id'] },
  ]
});

Device.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.deleted_at;
  return values;
};

module.exports = Device;