const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

if (!process.env.DB_USER) {
  console.error('🔴 CRITICAL: .env variables not loaded in Test Environment!');
  console.log('Searching at path:', path.resolve(__dirname, '../.env'));
} else {
  console.log('🟢 Test Environment loaded for user:', process.env.DB_USER);
}

const { sequelize } = require('../src/config/database');
const { User } = require('../src/models');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';

let adminToken, managerToken;

const setupTestDB = async () => {
  await sequelize.sync({ force: true });
  
  // Create test users
  const adminPassword = await User.hashPassword('admin123');
  const managerPassword = await User.hashPassword('manager123');
  
  const admin = await User.create({
    name: 'Test Admin',
    email: 'admin@test.com',
    password_hash: adminPassword,
    role: 'SUPER_ADMIN',
    is_active: true
  });

  const manager = await User.create({
    name: 'Test Manager',
    email: 'manager@test.com',
    password_hash: managerPassword,
    role: 'STORE_MANAGER',
    is_active: true
  });

  // Generate tokens
  const jwt = require('jsonwebtoken');
  adminToken = jwt.sign(
    { id: admin.id, email: admin.email, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  managerToken = jwt.sign(
    { id: manager.id, email: manager.email, role: manager.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  return { admin, manager, adminToken, managerToken };
};

const cleanupTestDB = async () => {
  try {
    // Disable constraints to allow truncation of related tables
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.truncate(); 
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
  } catch (error) {
    console.error('Error cleaning up Test DB:', error);
  }
};

const closeTestDB = async () => {
  await sequelize.close();
};

module.exports = {
  setupTestDB,
  cleanupTestDB,
  closeTestDB,
  getTokens: () => ({ adminToken, managerToken })
};