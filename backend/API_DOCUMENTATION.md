# Cloud Audio & Announcement System API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "admin@jewellery.com",
  "password": "admin123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Super Admin",
      "email": "admin@jewellery.com",
      "role": "SUPER_ADMIN",
      "is_active": true,
      "created_at": "2026-01-01T00:00:00.000Z",
      "updated_at": "2026-01-01T00:00:00.000Z"
    }
  }
}
```

---

## Users

### Create User
```http
POST /users
Authorization: Bearer <SUPER_ADMIN_TOKEN>
```

**Request Body:**
```json
{
  "name": "Store Manager",
  "email": "manager@example.com",
  "password": "password123",
  "role": "STORE_MANAGER",
  "is_active": true
}
```

### Get All Users
```http
GET /users
Authorization: Bearer <TOKEN>
```

### Get User by ID
```http
GET /users/:id
Authorization: Bearer <TOKEN>
```

### Update User
```http
PUT /users/:id
Authorization: Bearer <SUPER_ADMIN_TOKEN>
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "is_active": false
}
```

### Delete User (Soft Delete)
```http
DELETE /users/:id
Authorization: Bearer <SUPER_ADMIN_TOKEN>
```

---

## Branches

### Create Branch
```http
POST /branches
Authorization: Bearer <SUPER_ADMIN_TOKEN>
```

**Request Body:**
```json
{
  "branch_code": "MUM-001",
  "name": "Mumbai Central Store",
  "city": "Mumbai",
  "state": "Maharashtra",
  "region": "West",
  "is_active": true
}
```

### Get All Branches
```http
GET /branches
Authorization: Bearer <TOKEN>
```

### Get Branch by ID
```http
GET /branches/:id
Authorization: Bearer <TOKEN>
```

### Update Branch
```http
PUT /branches/:id
Authorization: Bearer <SUPER_ADMIN_TOKEN>
```

### Delete Branch
```http
DELETE /branches/:id
Authorization: Bearer <SUPER_ADMIN_TOKEN>
```

---

## Devices

### Register Device
```http
POST /devices/register
Authorization: Bearer <SUPER_ADMIN_TOKEN>
```

**Request Body:**
```json
{
  "branch_id": 1,
  "device_code": "MUM-001-DEV-01",
  "device_name": "Ground Floor Player"
}
```

### Get All Devices
```http
GET /devices
Authorization: Bearer <TOKEN>
```

### Get Device Status
```http
GET /devices/status
Authorization: Bearer <TOKEN>
```

### Get Device by ID
```http
GET /devices/:id
Authorization: Bearer <TOKEN>
```

### Update Device
```http
PUT /devices/:id
Authorization: Bearer <SUPER_ADMIN_TOKEN>
```

### Delete Device
```http
DELETE /devices/:id
Authorization: Bearer <SUPER_ADMIN_TOKEN>
```

---

## Audio Files

### Create Audio File
```http
POST /audio
Authorization: Bearer <SUPER_ADMIN_TOKEN>
```

**Request Body:**
```json
{
  "title": "Morning Prayer - Hindi",
  "audio_type": "PRAYER",
  "language": "Hindi",
  "file_url": "https://cdn.example.com/prayer.mp3",
  "duration_seconds": 180,
  "is_active": true
}
```

**Audio Types:**
- `PRAYER` - Daily prayer audio
- `FESTIVAL` - Festival announcements
- `DAILY` - Regular announcements

### Get All Audio Files
```http
GET /audio
Authorization: Bearer <TOKEN>
```

### Get Audio by ID
```http
GET /audio/:id
Authorization: Bearer <TOKEN>
```

### Update Audio
```http
PUT /audio/:id
Authorization: Bearer <SUPER_ADMIN_TOKEN>
```

### Delete Audio
```http
DELETE /audio/:id
Authorization: Bearer <SUPER_ADMIN_TOKEN>
```

---

## Schedules

### Create Schedule
```http
POST /schedules
Authorization: Bearer <SUPER_ADMIN_TOKEN>
```

**Request Body:**
```json
{
  "audio_id": 1,
  "schedule_type": "DAILY_PRAYER",
  "start_date": null,
  "end_date": null,
  "play_time": "10:00:00",
  "repeat_interval_minutes": null,
  "priority": 1,
  "is_active": true,
  "targets": [
    {
      "target_type": "ALL",
      "target_value": null
    }
  ]
}
```

**Schedule Types:**
- `DAILY_PRAYER` - Must play once per day (highest priority)
- `FESTIVAL` - Festival-specific announcements
- `DAILY` - Regular scheduled announcements

**Target Types:**
- `ALL` - All branches
- `REGION` - Specific region (target_value: "West", "North", etc.)
- `BRANCH` - Specific branch (target_value: branch_code)

**Priority Rules:**
1. Priority 1 = Highest (DAILY_PRAYER should always be 1)
2. Lower number = Higher priority
3. Backend resolves conflicts automatically

### Get All Schedules
```http
GET /schedules
Authorization: Bearer <TOKEN>
```

### Get Schedule by ID
```http
GET /schedules/:id
Authorization: Bearer <TOKEN>
```

### Update Schedule
```http
PUT /schedules/:id
Authorization: Bearer <SUPER_ADMIN_TOKEN>
```

### Delete Schedule
```http
DELETE /schedules/:id
Authorization: Bearer <SUPER_ADMIN_TOKEN>
```

---

## Device Sync (CRITICAL ENDPOINT)

### Get Device Schedule
```http
GET /device/sync?device_code=MUM-001-DEV-01
```

**This is the CORE endpoint that devices call to get their daily schedule.**

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "device": {
      "id": 1,
      "device_code": "MUM-001-DEV-01",
      "device_name": "Ground Floor Player"
    },
    "branch": {
      "branch_code": "MUM-001",
      "name": "Mumbai Central Store",
      "region": "West"
    },
    "schedule_date": "2026-01-01",
    "schedules": [
      {
        "schedule_id": 1,
        "audio": {
          "id": 1,
          "title": "Morning Prayer - Hindi",
          "audio_type": "PRAYER",
          "language": "Hindi",
          "file_url": "https://cdn.example.com/prayer.mp3",
          "duration_seconds": 180
        },
        "schedule_type": "DAILY_PRAYER",
        "play_time": "10:00:00",
        "priority": 1,
        "offline_required": true
      },
      {
        "schedule_id": 2,
        "audio": {
          "id": 2,
          "title": "Welcome Message",
          "audio_type": "DAILY",
          "language": "English",
          "file_url": "https://cdn.example.com/welcome.mp3",
          "duration_seconds": 60
        },
        "schedule_type": "DAILY",
        "play_time": "09:30:00",
        "priority": 3,
        "offline_required": false
      }
    ]
  }
}
```

**Business Rules:**
- Returns only schedules applicable to the device's branch/region
- Automatically resolves priority conflicts (only highest priority schedule at each time)
- Schedules sorted by play_time
- `offline_required: true` only for DAILY_PRAYER
- Filters by active schedules and date ranges

---

## Logs

### Record Playback Log
```http
POST /device/logs
```

**Request Body:**
```json
{
  "device_code": "MUM-001-DEV-01",
  "audio_id": 1,
  "played_at": "2026-01-01T10:00:00.000Z",
  "status": "PLAYED",
  "reason": null
}
```

**Status Values:**
- `PLAYED` - Successfully played
- `MISSED` - Failed to play (provide reason)

### Record Device Heartbeat
```http
POST /device/heartbeat
```

**Request Body:**
```json
{
  "device_code": "MUM-001-DEV-01",
  "online": true
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "\"email\" must be a valid email"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No token provided"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Role-Based Access Control

### SUPER_ADMIN
- Full CRUD access to all resources
- Can create/update/delete users, branches, devices, audio, schedules

### STORE_MANAGER
- Read-only access to all resources
- Cannot create, update, or delete

---

## Business Logic Summary

1. **Prayer Priority**: DAILY_PRAYER must always have priority 1
2. **Offline Support**: Only DAILY_PRAYER is cached for offline playback
3. **Conflict Resolution**: Backend resolves all scheduling conflicts
4. **Targeting**: Schedules can target ALL, specific REGIONs, or specific BRANCHes
5. **Device Sync**: Devices call `/device/sync` to get resolved daily schedule
6. **Soft Deletes**: All entities use soft delete (paranoid)

---

## Setup Instructions

1. Clone repository
2. Install dependencies: `npm install`
3. Configure `.env` file
4. Run migrations: `npm run migrate`
5. Seed database: `npm run seed`
6. Start server: `npm start` (dev: `npm run dev`)
7. Run tests: `npm test`

---

## Testing

Run the complete test suite:
```bash
npm test
```

Run specific tests:
```bash
npm run test:unit
npm run test:integration
```

Test coverage:
```bash
npm test -- --coverage
```