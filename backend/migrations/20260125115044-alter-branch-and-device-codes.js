'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Allow branch_id to be NULL
    await queryInterface.changeColumn('devices', 'branch_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    // 2. Add device_fingerprint
    await queryInterface.addColumn('devices', 'device_fingerprint', {
      type: Sequelize.STRING(255),
      allowNull: true,
      unique: true
    });

    // 3. Update status enum
    await queryInterface.changeColumn('devices', 'status', {
      type: Sequelize.ENUM(
        'PENDING',
        'ONLINE',
        'OFFLINE',
        'DISABLED'
      ),
      defaultValue: 'PENDING'
    });

    // 4. Indexes
    await queryInterface.addIndex('devices', ['device_fingerprint']);
    await queryInterface.addIndex('devices', ['status']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('devices', ['device_fingerprint']);
    await queryInterface.removeIndex('devices', ['status']);

    await queryInterface.removeColumn('devices', 'device_fingerprint');

    await queryInterface.changeColumn('devices', 'branch_id', {
      type: Sequelize.INTEGER,
      allowNull: false
    });

    await queryInterface.changeColumn('devices', 'status', {
      type: Sequelize.ENUM('ONLINE', 'OFFLINE', 'DISABLED'),
      defaultValue: 'OFFLINE'
    });
  }
};
