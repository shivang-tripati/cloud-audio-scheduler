require('dotenv').config();
const { sequelize } = require('../config/database');
const {
  User, Branch, Device, AudioFile, Schedule, ScheduleTarget
} = require('../models');

const seedData = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connected');

    // THIS IS THE KEY: It wipes the old "64 key limit" mess and recreates clean tables
    await sequelize.sync({ force: true });
    console.log('✓ Database tables created (Clean Reset)');

    // 1. Create Users
    const adminPassword = await User.hashPassword('admin123');
    const managerPassword = await User.hashPassword('manager123');

    await User.bulkCreate([
      {
        name: 'Super Admin',
        email: 'admin@jewellery.com',
        password_hash: adminPassword,
        role: 'SUPER_ADMIN',
        is_active: true
      },
      {
        name: 'Store Manager',
        email: 'manager@jewellery.com',
        password_hash: managerPassword,
        role: 'STORE_MANAGER',
        is_active: true
      }
    ]);
    console.log('✓ Users created');

    // 2. Create Branches
    const branches = await Branch.bulkCreate([
      { name: 'Mumbai Central Store', city: 'Mumbai', state: 'Maharashtra', region: 'West', is_active: true },
      { name: 'Delhi Connaught Place', city: 'New Delhi', state: 'Delhi', region: 'North', is_active: true },
      { name: 'Bangalore MG Road', city: 'Bangalore', state: 'Karnataka', region: 'South', is_active: true }
    ]);

    // Update codes (BR-000001...)
    for (const branch of branches) {
      await branch.update({ branch_code: `BR-${String(branch.id).padStart(6, '0')}` });
    }
    console.log('✓ Branches created');

    // 3. Create Devices
    const devices = await Device.bulkCreate([
      { branch_id: branches[0].id, device_name: 'Ground Floor Player', status: 'ONLINE', last_seen: new Date() },
      { branch_id: branches[1].id, device_name: 'Main Hall Player', status: 'ONLINE', last_seen: new Date() },
      { branch_id: branches[2].id, device_name: 'Reception Player', status: 'OFFLINE', last_seen: new Date() }
    ]);

    for (const device of devices) {
      await device.update({ device_code: `DEV-${String(device.branch_id).padStart(6, '0')}-${String(device.id).padStart(3, '0')}` });
    }
    console.log('✓ Devices created');

    // 4. Create Audio Files
    const audioFiles = await AudioFile.bulkCreate([
      {
        title: 'Morning Prayer',
        audio_type: 'PRAYER',
        language: 'Hindi',
        file_url: 'uploads/audio/8cd8e649-ef13-49d7-8de8-c6b4a6125fff.mp3',
        duration_seconds: 180
      },
      {
        title: 'Diwali Promo',
        audio_type: 'FESTIVAL',
        language: 'Hindi',
        file_url: 'uploads/audio/1ba0ff30-39ec-4d10-92ea-e185c0410abd.mp3',
        duration_seconds: 120
      }
    ]);
    console.log('✓ Audio files created');

    // 5. Create Schedules (Refactored for your new Model)
    // PRAYER: Daily mode
    const prayerSchedule = await Schedule.create({
      title: 'Daily Morning Prayer',
      audio_id: audioFiles[0].id,
      schedule_mode: 'DAILY',
      play_time: '10:00:00',
      priority: 1,
      is_active: true
    });

    await ScheduleTarget.create({
      schedule_id: prayerSchedule.id,
      target_type: 'ALL'
    });

    // PROMO: Date Range mode
    const festivalSchedule = await Schedule.create({
      title: 'Diwali Festival Promo',
      audio_id: audioFiles[1].id,
      schedule_mode: 'DATE_RANGE',
      start_date: '2026-10-20',
      end_date: '2026-11-05',
      play_time: '12:00:00',
      play_count: 5, // Playing 5 times a day
      priority: 10,
      is_active: true
    });

    await ScheduleTarget.create({
      schedule_id: festivalSchedule.id,
      target_type: 'REGION',
      target_value: 'West'
    });

    console.log('✓ Schedules created');
    console.log('\n=== SEED SUCCESSFUL ===');
    process.exit(0);

  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seedData();