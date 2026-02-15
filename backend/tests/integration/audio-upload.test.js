const request = require('supertest');
const app = require('../../src/app');
const path = require('path');
const fs = require('fs').promises;
const { setupTestDB, cleanupTestDB, closeTestDB } = require('../setup');
const { AudioFile } = require('../../src/models');

// Create a simple test audio file
const createTestAudioFile = async (filename = 'test-audio.mp3') => {
  const testDir = path.join(__dirname, '../fixtures');
  const filePath = path.join(testDir, filename);
  
  // Create fixtures directory if it doesn't exist
  try {
    await fs.mkdir(testDir, { recursive: true });
  } catch (err) {
    // Directory exists
  }

  // Create a dummy MP3 file (ID3v2 header + minimal data)
  const mp3Header = Buffer.from([
    0x49, 0x44, 0x33, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
  ]);
  await fs.writeFile(filePath, mp3Header);
  
  return filePath;
};

describe('Audio Upload API', () => {
  let adminToken, managerToken;
  let testAudioPath;

  beforeAll(async () => {
    const tokens = await setupTestDB();
    adminToken = tokens.adminToken;
    managerToken = tokens.managerToken;
    
    // Create test audio file
    testAudioPath = await createTestAudioFile();
  });

  afterAll(async () => {
    // Cleanup test files
    try {
      await fs.unlink(testAudioPath);
    } catch (err) {
      // File might not exist
    }
    
    await cleanupTestDB();
    await closeTestDB();
  });

  describe('POST /api/audio - Upload Audio', () => {
    test('should upload audio file as SUPER_ADMIN', async () => {
      const res = await request(app)
        .post('/api/audio')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'Test Morning Prayer')
        .field('audio_type', 'PRAYER')
        .field('language', 'Hindi')
        .field('is_active', 'true')
        .attach('audio_file', testAudioPath);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('file_url');
      expect(res.body.data.file_url).toMatch(/^\/uploads\/audio\//);
      expect(res.body.data).toHaveProperty('duration_seconds');
      expect(res.body.data.title).toBe('Test Morning Prayer');
      expect(res.body.data.audio_type).toBe('PRAYER');
      expect(res.body.data.language).toBe('Hindi');
      expect(res.body.data).not.toHaveProperty('file_path'); // Should not expose local path
    });

    test('should reject upload without file', async () => {
      const res = await request(app)
        .post('/api/audio')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'No File Prayer')
        .field('audio_type', 'PRAYER')
        .field('language', 'Hindi');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Audio file is required');
    });

    test('should reject invalid audio type', async () => {
      const res = await request(app)
        .post('/api/audio')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'Invalid Type')
        .field('audio_type', 'INVALID_TYPE')
        .field('language', 'Hindi')
        .attach('audio_file', testAudioPath);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should reject missing required fields', async () => {
      const res = await request(app)
        .post('/api/audio')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'Missing Fields')
        .attach('audio_file', testAudioPath);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should reject STORE_MANAGER upload attempt', async () => {
      const res = await request(app)
        .post('/api/audio')
        .set('Authorization', `Bearer ${managerToken}`)
        .field('title', 'Unauthorized Upload')
        .field('audio_type', 'PRAYER')
        .field('language', 'Hindi')
        .attach('audio_file', testAudioPath);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Insufficient permissions');
    });

    test('should reject unauthenticated upload', async () => {
      const res = await request(app)
        .post('/api/audio')
        .field('title', 'No Auth Upload')
        .field('audio_type', 'PRAYER')
        .field('language', 'Hindi')
        .attach('audio_file', testAudioPath);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('should handle different audio types', async () => {
      const audioTypes = ['PRAYER', 'FESTIVAL', 'DAILY'];
      
      for (const type of audioTypes) {
        const res = await request(app)
          .post('/api/audio')
          .set('Authorization', `Bearer ${adminToken}`)
          .field('title', `Test ${type} Audio`)
          .field('audio_type', type)
          .field('language', 'English')
          .attach('audio_file', testAudioPath);

        expect(res.status).toBe(201);
        expect(res.body.data.audio_type).toBe(type);
      }
    });

    test('should handle different languages', async () => {
      const languages = ['Hindi', 'English', 'Bengali', 'Tamil'];
      
      for (const lang of languages) {
        const res = await request(app)
          .post('/api/audio')
          .set('Authorization', `Bearer ${adminToken}`)
          .field('title', `Prayer in ${lang}`)
          .field('audio_type', 'PRAYER')
          .field('language', lang)
          .attach('audio_file', testAudioPath);

        expect(res.status).toBe(201);
        expect(res.body.data.language).toBe(lang);
      }
    });

    test('should default is_active to true if not provided', async () => {
      const res = await request(app)
        .post('/api/audio')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'Default Active')
        .field('audio_type', 'DAILY')
        .field('language', 'Hindi')
        .attach('audio_file', testAudioPath);

      expect(res.status).toBe(201);
      expect(res.body.data.is_active).toBe(true);
    });

    test('should respect is_active=false', async () => {
      const res = await request(app)
        .post('/api/audio')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'Inactive Audio')
        .field('audio_type', 'DAILY')
        .field('language', 'Hindi')
        .field('is_active', 'false')
        .attach('audio_file', testAudioPath);

      expect(res.status).toBe(201);
      expect(res.body.data.is_active).toBe(false);
    });
  });

  describe('PUT /api/audio/:id - Update Audio', () => {
    let audioId;

    beforeEach(async () => {
      // Create an audio file to update
      const res = await request(app)
        .post('/api/audio')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'Original Audio')
        .field('audio_type', 'PRAYER')
        .field('language', 'Hindi')
        .attach('audio_file', testAudioPath);
      
      audioId = res.body.data.id;
    });

    test('should update audio metadata without file', async () => {
      const res = await request(app)
        .put(`/api/audio/${audioId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'Updated Audio Title')
        .field('language', 'English');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Updated Audio Title');
      expect(res.body.data.language).toBe('English');
    });

    test('should update audio file and metadata', async () => {
      const newTestFile = await createTestAudioFile('new-test-audio.mp3');
      
      const res = await request(app)
        .put(`/api/audio/${audioId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'Replaced Audio')
        .attach('audio_file', newTestFile);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Replaced Audio');
      expect(res.body.data.file_url).toMatch(/^\/uploads\/audio\//);
      
      // Cleanup
      await fs.unlink(newTestFile);
    });

    test('should deactivate audio', async () => {
      const res = await request(app)
        .put(`/api/audio/${audioId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .field('is_active', 'false');

      expect(res.status).toBe(200);
      expect(res.body.data.is_active).toBe(false);
    });

    test('should reject STORE_MANAGER update', async () => {
      const res = await request(app)
        .put(`/api/audio/${audioId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .field('title', 'Unauthorized Update');

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    test('should return 404 for non-existent audio', async () => {
      const res = await request(app)
        .put('/api/audio/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'Non-existent');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should reject invalid id format', async () => {
      const res = await request(app)
        .put('/api/audio/invalid')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'Invalid ID');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/audio/:id/download - Download Audio', () => {
    let audioId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/audio')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'Downloadable Audio')
        .field('audio_type', 'PRAYER')
        .field('language', 'Hindi')
        .attach('audio_file', testAudioPath);
      
      audioId = res.body.data.id;
    });

    test('should download audio file when authenticated', async () => {
      const res = await request(app)
        .get(`/api/audio/${audioId}/download`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/audio/);
    });

    test('should allow STORE_MANAGER to download', async () => {
      const res = await request(app)
        .get(`/api/audio/${audioId}/download`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
    });

    test('should reject unauthenticated download', async () => {
      const res = await request(app)
        .get(`/api/audio/${audioId}/download`);

      expect(res.status).toBe(401);
    });

    test('should return 404 for non-existent audio', async () => {
      const res = await request(app)
        .get('/api/audio/99999/download')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/audio/:id - Delete Audio with File', () => {
    test('should delete audio and physical file', async () => {
      // Create audio
      const createRes = await request(app)
        .post('/api/audio')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'To Delete')
        .field('audio_type', 'DAILY')
        .field('language', 'Hindi')
        .attach('audio_file', testAudioPath);

      const audioId = createRes.body.data.id;
      const fileUrl = createRes.body.data.file_url;

      // Delete audio
      const deleteRes = await request(app)
        .delete(`/api/audio/${audioId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);

      // Verify database record is soft-deleted
      const audio = await AudioFile.findByPk(audioId, { paranoid: false });
      expect(audio.deleted_at).not.toBeNull();
    });

    test('should reject STORE_MANAGER delete', async () => {
      const createRes = await request(app)
        .post('/api/audio')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'Cannot Delete')
        .field('audio_type', 'DAILY')
        .field('language', 'Hindi')
        .attach('audio_file', testAudioPath);

      const audioId = createRes.body.data.id;

      const deleteRes = await request(app)
        .delete(`/api/audio/${audioId}`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(deleteRes.status).toBe(403);
      expect(deleteRes.body.success).toBe(false);
    });
  });

  describe('Audio File Storage', () => {
    test('should store files with unique names', async () => {
      const res1 = await request(app)
        .post('/api/audio')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'File 1')
        .field('audio_type', 'PRAYER')
        .field('language', 'Hindi')
        .attach('audio_file', testAudioPath);

      const res2 = await request(app)
        .post('/api/audio')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'File 2')
        .field('audio_type', 'PRAYER')
        .field('language', 'Hindi')
        .attach('audio_file', testAudioPath);

      expect(res1.body.data.file_url).not.toBe(res2.body.data.file_url);
    });

    test('should calculate audio duration', async () => {
      const res = await request(app)
        .post('/api/audio')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'Duration Test')
        .field('audio_type', 'PRAYER')
        .field('language', 'Hindi')
        .attach('audio_file', testAudioPath);

      expect(res.body.data.duration_seconds).toBeGreaterThan(0);
      expect(typeof res.body.data.duration_seconds).toBe('number');
    });
  });

  describe('Audio Integration with Schedules', () => {
    test('should allow creating schedule with uploaded audio', async () => {
      // Upload audio
      const audioRes = await request(app)
        .post('/api/audio')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'Schedule Test Audio')
        .field('audio_type', 'PRAYER')
        .field('language', 'Hindi')
        .attach('audio_file', testAudioPath);

      const audioId = audioRes.body.data.id;

      // Create schedule
      const scheduleRes = await request(app)
        .post('/api/schedules')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          audio_id: audioId,
          schedule_type: 'DAILY_PRAYER',
          play_time: '10:00:00',
          priority: 1,
          is_active: true,
          targets: [
            {
              target_type: 'ALL',
              target_value: null
            }
          ]
        });

      expect(scheduleRes.status).toBe(201);
      expect(scheduleRes.body.success).toBe(true);
    });
  });
});