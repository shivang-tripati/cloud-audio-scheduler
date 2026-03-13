require('dotenv').config();
const { sequelize } = require('../config/database');
const { User } = require('../models');


async function seedData() {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connected');

    // DO NOT use force:true
    await sequelize.sync();
    console.log('✓ Tables synced');

    const adminExists = await User.findOne({
      where: { email: process.env.ADMIN_EMAIL }
    });

    if (!adminExists) {
      const adminPassword = await User.hashPassword(process.env.ADMIN_PASSWORD);

      await User.create({
        name: 'Super Admin',
        email: 'admin@radhakrishnajewellery.in',
        password_hash: adminPassword,
        role: 'SUPER_ADMIN',
        is_active: true
      });

      console.log('✓ Admin created');
    } else {
      console.log('✓ Admin already exists');
    }

    process.exit(0);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seedData();