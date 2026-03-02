const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BranchPlaylist = sequelize.define('BranchPlaylist', {
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
    audio_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'audio_files',
            key: 'id'
        }
    },
    order_index: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'branch_playlists',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    indexes: [
        { fields: ['branch_id'] },
        { fields: ['audio_id'] },
        { fields: ['branch_id', 'order_index'] },
        { fields: ['is_active'] }
    ]
});

BranchPlaylist.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.deleted_at;
    return values;
};

module.exports = BranchPlaylist;