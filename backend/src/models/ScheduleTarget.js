const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ScheduleTarget = sequelize.define('ScheduleTarget', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  schedule_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'schedules',
      key: 'id'
    }
  },
  target_type: {
    type: DataTypes.ENUM('ALL', 'REGION', 'BRANCH'),
    allowNull: false
  },
  target_value: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'schedule_targets',
  timestamps: false,
  indexes: [
    { fields: ['schedule_id'] },
    { fields: ['target_type'] },
    { fields: ['target_value'] }
  ]
});

module.exports = ScheduleTarget;