const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AudioFile = sequelize.define('AudioFile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 255]
    }
  },
  audio_type: {
    type: DataTypes.ENUM('PRAYER', 'FESTIVAL', 'DAILY', 'OTHER'),
    allowNull: false
  },
  language: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  file_url: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  file_path: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Local file path for deletion'
  },
  duration_seconds: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'audio_files',
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  indexes: [
    { fields: ['audio_type'] },
    { fields: ['language'] },
    { fields: ['is_active'] },
    { fields: ['deleted_at'] }
  ]
});

AudioFile.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.deleted_at;
  delete values.file_path;
  return values;
};

module.exports = AudioFile;