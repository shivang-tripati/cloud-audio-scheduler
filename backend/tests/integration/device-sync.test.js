const request = require('supertest');
const app = require('../../src/app');
const { setupTestDB, cleanupTestDB, closeTestDB } = require('../setup');
const { Branch, Device, AudioFile, Schedule, ScheduleTarget } = require('../../src/models');

describe('Device Sync API - CORE FUNCTIONALITY', () => {
  let branch, device, prayerAudio, festivalAudio;

  beforeAll(async () => {
    await setupTestDB();

    // Create test data
    branch = await Branch.create({
      branch_code: 'TEST-001',
      name: 'Test Branch',
      city: 'Mumbai',
      state: 'Maharashtra',
      region: 'West',
      is_active: true
    });

    device = await Device.create({
      branch_id: branch.id,
      device_code: 'TEST-001-DEV-01',
      device_name: 'Test Device',
      status: 'ONLINE'
    });

    prayerAudio = await AudioFile.create({
      title: 'Morning Prayer',
      audio_type: 'PRAYER',
      language: 'Hindi',
      file_url: 'https://example.com/prayer.mp3',
      duration_seconds: 180,
      is_active: true
    });

    festivalAudio = await AudioFile.create({
      title: 'Festival Audio',
      audio_type: 'FESTIVAL',
      language: 'Hindi',
      file_url: 'https://example.com/festival.mp3',
      duration_seconds: 120,
      is_active: true
    });
  });

  afterAll(async () => {
    await cleanupTestDB();
    await closeTestDB();
  });

  describe('GET /api/device/sync', () => {
    test('should return resolved schedule for device', async () => {
      // Create prayer schedule (highest priority)
      const prayerSchedule = await Schedule.create({
        audio_id: prayerAudio.id,
        schedule_type: 'DAILY_PRAYER',
        play_time: '10:00:00',
        priority: 1,
        is_active: true
      });

      await ScheduleTarget.create({
        schedule_id: prayerSchedule.id,
        target_type: 'ALL',
        target_value: null
      });

      const res = await request(app)
        .get('/api/device/sync')
        .query({ device_code: 'TEST-001-DEV-01' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('device');
      expect(res.body.data).toHaveProperty('branch');
      expect(res.body.data).toHaveProperty('schedules');
      expect(Array.isArray(res.body.data.schedules)).toBe(true);
      expect(res.body.data.schedules.length).toBeGreaterThan(0);
    });

    test('should mark daily prayer as offline_required', async () => {
      const res = await request(app)
        .get('/api/device/sync')
        .query({ device_code: 'TEST-001-DEV-01' });

      expect(res.status).toBe(200);
      const prayerSchedule = res.body.data.schedules.find(
        s => s.schedule_type === 'DAILY_PRAYER'
      );

      expect(prayerSchedule).toBeDefined();
      expect(prayerSchedule.offline_required).toBe(true);
    });

    test('should resolve priority conflicts correctly', async () => {
      // Create two schedules at same time with different priorities
      const highPrioritySchedule = await Schedule.create({
        audio_id: prayerAudio.id,
        schedule_type: 'DAILY_PRAYER',
        play_time: '11:00:00',
        priority: 1,
        is_active: true
      });

      const lowPrioritySchedule = await Schedule.create({
        audio_id: festivalAudio.id,
        schedule_type: 'FESTIVAL',
        start_date: '2026-01-01',
        end_date: '2026-12-31',
        play_time: '11:00:00',
        priority: 5,
        is_active: true
      });

      await ScheduleTarget.create({
        schedule_id: highPrioritySchedule.id,
        target_type: 'ALL',
        target_value: null
      });

      await ScheduleTarget.create({
        schedule_id: lowPrioritySchedule.id,
        target_type: 'ALL',
        target_value: null
      });

      const res = await request(app)
        .get('/api/device/sync')
        .query({ device_code: 'TEST-001-DEV-01' });

      expect(res.status).toBe(200);
      
      // Should only have one schedule at 11:00:00 (the higher priority one)
      const elevenOClockSchedules = res.body.data.schedules.filter(
        s => s.play_time === '11:00:00'
      );

      expect(elevenOClockSchedules.length).toBe(1);
      expect(elevenOClockSchedules[0].priority).toBe(1);
      expect(elevenOClockSchedules[0].schedule_type).toBe('DAILY_PRAYER');
    });

    test('should filter schedules by region target', async () => {
      // Create region-specific schedule
      const regionalSchedule = await Schedule.create({
        audio_id: festivalAudio.id,
        schedule_type: 'FESTIVAL',
        start_date: '2026-01-01',
        end_date: '2026-12-31',
        play_time: '12:00:00',
        priority: 2,
        is_active: true
      });

      await ScheduleTarget.create({
        schedule_id: regionalSchedule.id,
        target_type: 'REGION',
        target_value: 'West'
      });

      const res = await request(app)
        .get('/api/device/sync')
        .query({ device_code: 'TEST-001-DEV-01' });

      expect(res.status).toBe(200);
      
      const regionalAudio = res.body.data.schedules.find(
        s => s.play_time === '12:00:00'
      );

      expect(regionalAudio).toBeDefined();
    });

    test('should not return schedules for different region', async () => {
      // Create schedule for different region
      const otherRegionSchedule = await Schedule.create({
        audio_id: festivalAudio.id,
        schedule_type: 'FESTIVAL',
        start_date: '2026-01-01',
        end_date: '2026-12-31',
        play_time: '13:00:00',
        priority: 2,
        is_active: true
      });

      await ScheduleTarget.create({
        schedule_id: otherRegionSchedule.id,
        target_type: 'REGION',
        target_value: 'North'
      });

      const res = await request(app)
        .get('/api/device/sync')
        .query({ device_code: 'TEST-001-DEV-01' });

      expect(res.status).toBe(200);
      
      const otherRegionAudio = res.body.data.schedules.find(
        s => s.play_time === '13:00:00'
      );

      expect(otherRegionAudio).toBeUndefined();
    });

    test('should filter by branch target', async () => {
      const branchSchedule = await Schedule.create({
        audio_id: festivalAudio.id,
        schedule_type: 'DAILY',
        start_date: '2026-01-01',
        end_date: '2026-12-31',
        play_time: '14:00:00',
        priority: 3,
        is_active: true
      });

      await ScheduleTarget.create({
        schedule_id: branchSchedule.id,
        target_type: 'BRANCH',
        target_value: 'TEST-001'
      });

      const res = await request(app)
        .get('/api/device/sync')
        .query({ device_code: 'TEST-001-DEV-01' });

      expect(res.status).toBe(200);
      
      const branchAudio = res.body.data.schedules.find(
        s => s.play_time === '14:00:00'
      );

      expect(branchAudio).toBeDefined();
    });

    test('should reject missing device_code', async () => {
      const res = await request(app)
        .get('/api/device/sync');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should reject invalid device_code', async () => {
      const res = await request(app)
        .get('/api/device/sync')
        .query({ device_code: 'INVALID-CODE' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test('should not return inactive schedules', async () => {
      const inactiveSchedule = await Schedule.create({
        audio_id: festivalAudio.id,
        schedule_type: 'DAILY',
        start_date: '2026-01-01',
        end_date: '2026-12-31',
        play_time: '15:00:00',
        priority: 3,
        is_active: false
      });

      await ScheduleTarget.create({
        schedule_id: inactiveSchedule.id,
        target_type: 'ALL',
        target_value: null
      });

      const res = await request(app)
        .get('/api/device/sync')
        .query({ device_code: 'TEST-001-DEV-01' });

      expect(res.status).toBe(200);
      
      const inactiveAudio = res.body.data.schedules.find(
        s => s.play_time === '15:00:00'
      );

      expect(inactiveAudio).toBeUndefined();
    });

    test('should return schedules sorted by priority then time', async () => {
      const res = await request(app)
        .get('/api/device/sync')
        .query({ device_code: 'TEST-001-DEV-01' });

      expect(res.status).toBe(200);
      
      const schedules = res.body.data.schedules;
      
      // Verify sorting
      for (let i = 0; i < schedules.length - 1; i++) {
        const current = schedules[i];
        const next = schedules[i + 1];
        
        const currentTime = current.play_time.split(':').map(Number);
        const nextTime = next.play_time.split(':').map(Number);
        const currentMinutes = currentTime[0] * 60 + currentTime[1];
        const nextMinutes = nextTime[0] * 60 + nextTime[1];
        
        expect(currentMinutes).toBeLessThanOrEqual(nextMinutes);
      }
    });
  });
});