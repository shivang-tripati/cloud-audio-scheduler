const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Schedule = sequelize.define('Schedule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Schedule'

  },
  audio_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'audio_files',
      key: 'id'
    }
  },
  schedule_mode: {
    type: DataTypes.ENUM("DAILY", "DATE_RANGE", "ONCE"),
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  play_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  play_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  play_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1
    }
  },
  priority: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 100
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'schedules',
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  indexes: [
    { fields: ['start_date', 'end_date'] },
    { fields: ['play_time'] },
    { fields: ['play_at'] },

  ]
});

Schedule.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.deleted_at;
  return values;
};

module.exports = Schedule;