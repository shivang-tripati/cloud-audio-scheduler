const request = require('supertest');
const app = require('../../src/app');
const { setupTestDB, cleanupTestDB, closeTestDB, getTokens } = require('../setup');

describe('Users API', () => {
  let adminToken, managerToken;

  beforeAll(async () => {
    const tokens = await setupTestDB();
    adminToken = tokens.adminToken;
    managerToken = tokens.managerToken;
  });

  afterAll(async () => {
    await cleanupTestDB();
    await closeTestDB();
  });

  describe('POST /api/users', () => {
    test('should create user as SUPER_ADMIN', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New User',
          email: 'newuser@test.com',
          password: 'password123',
          role: 'STORE_MANAGER'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('email', 'newuser@test.com');
      expect(res.body.data).not.toHaveProperty('password_hash');
    });

    test('should reject duplicate email', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Duplicate',
          email: 'admin@test.com',
          password: 'password123',
          role: 'STORE_MANAGER'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });

    test('should reject STORE_MANAGER creating user', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          name: 'Unauthorized User',
          email: 'unauthorized@test.com',
          password: 'password123',
          role: 'STORE_MANAGER'
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Insufficient permissions');
    });

    test('should reject unauthenticated request', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({
          name: 'No Auth',
          email: 'noauth@test.com',
          password: 'password123',
          role: 'STORE_MANAGER'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('should reject invalid role', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Invalid Role',
          email: 'invalid@test.com',
          password: 'password123',
          role: 'INVALID_ROLE'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should reject short password', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Short Pass',
          email: 'short@test.com',
          password: '123',
          role: 'STORE_MANAGER'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/users', () => {
    test('should get all users when authenticated', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    test('should reject unauthenticated request', async () => {
      const res = await request(app).get('/api/users');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/users/:id', () => {
    test('should get user by id', async () => {
      const res = await request(app)
        .get('/api/users/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id', 1);
    });

    test('should return 404 for non-existent user', async () => {
      const res = await request(app)
        .get('/api/users/9999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test('should reject invalid id format', async () => {
      const res = await request(app)
        .get('/api/users/abc')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/users/:id', () => {
    test('should update user as SUPER_ADMIN', async () => {
      const res = await request(app)
        .put('/api/users/2')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Manager'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Updated Manager');
    });

    test('should reject STORE_MANAGER updating user', async () => {
      const res = await request(app)
        .put('/api/users/1')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          name: 'Unauthorized Update'
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/users/:id', () => {
    test('should delete user as SUPER_ADMIN', async () => {
      // First create a user to delete
      const createRes = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'To Delete',
          email: 'delete@test.com',
          password: 'password123',
          role: 'STORE_MANAGER'
        });

      const userId = createRes.body.data.id;

      const res = await request(app)
        .delete(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('should reject STORE_MANAGER deleting user', async () => {
      const res = await request(app)
        .delete('/api/users/1')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});