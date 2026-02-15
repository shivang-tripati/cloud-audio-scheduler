# Audio File Upload - Complete Documentation

## Overview

The system now supports **full audio file upload** functionality. Super Admin can upload audio files directly through the API.

---

## Installation

### 1. Install New Dependencies

```bash
npm install multer uuid
```

Or update your `package.json`:
```json
{
  "dependencies": {
    "multer": "^1.4.5-lts.1",
    "uuid": "^9.0.1"
  }
}
```

### 2. Optional: Better Audio Duration Detection

For production, install `music-metadata` for accurate audio duration:

```bash
npm install music-metadata
```

Then update `src/utils/audioProcessor.js`:
```javascript
const mm = require('music-metadata');

async getAudioDuration(filePath) {
  try {
    const metadata = await mm.parseFile(filePath);
    return Math.round(metadata.format.duration);
  } catch (error) {
    console.error('Error getting audio duration:', error);
    return 60;
  }
}
```

---

## API Endpoints

### 1. Upload Audio File

**Create a new audio file with file upload**

```http
POST /api/audio
Authorization: Bearer <SUPER_ADMIN_TOKEN>
Content-Type: multipart/form-data
```

**Form Data:**
```
audio_file: [Binary File]
title: "Morning Prayer - Hindi"
audio_type: "PRAYER"
language: "Hindi"
is_active: true
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/audio \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "audio_file=@/path/to/prayer.mp3" \
  -F "title=Morning Prayer - Hindi" \
  -F "audio_type=PRAYER" \
  -F "language=Hindi" \
  -F "is_active=true"
```

**JavaScript/Fetch Example:**
```javascript
const formData = new FormData();
formData.append('audio_file', fileInput.files[0]);
formData.append('title', 'Morning Prayer - Hindi');
formData.append('audio_type', 'PRAYER');
formData.append('language', 'Hindi');
formData.append('is_active', 'true');

const response = await fetch('http://localhost:3000/api/audio', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`
  },
  body: formData
});

const result = await response.json();
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Morning Prayer - Hindi",
    "audio_type": "PRAYER",
    "language": "Hindi",
    "file_url": "/uploads/audio/a1b2c3d4-e5f6-7890-abcd-ef1234567890.mp3",
    "duration_seconds": 180,
    "is_active": true,
    "created_at": "2026-01-01T10:00:00.000Z",
    "updated_at": "2026-01-01T10:00:00.000Z"
  }
}
```

---

### 2. Update Audio File

**Update audio metadata or replace the audio file**

```http
PUT /api/audio/:id
Authorization: Bearer <SUPER_ADMIN_TOKEN>
Content-Type: multipart/form-data
```

**Form Data (all fields optional):**
```
audio_file: [Binary File] (optional - only if replacing file)
title: "Updated Prayer Title"
audio_type: "PRAYER"
language: "Hindi"
is_active: true
```

**Example - Update Metadata Only:**
```bash
curl -X PUT http://localhost:3000/api/audio/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "title=Updated Morning Prayer" \
  -F "is_active=false"
```

**Example - Replace Audio File:**
```bash
curl -X PUT http://localhost:3000/api/audio/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "audio_file=@/path/to/new_prayer.mp3" \
  -F "title=New Morning Prayer"
```

---

### 3. Download Audio File

**Download the original audio file**

```http
GET /api/audio/:id/download
Authorization: Bearer <TOKEN>
```

**Example:**
```bash
curl -X GET http://localhost:3000/api/audio/1/download \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o downloaded_prayer.mp3
```

This endpoint streams the file to the client with proper filename.

---

### 4. Get Audio File Info

```http
GET /api/audio/:id
Authorization: Bearer <TOKEN>
```

Returns audio metadata including the file URL for playback.

---

### 5. Delete Audio File

```http
DELETE /api/audio/:id
Authorization: Bearer <SUPER_ADMIN_TOKEN>
```

**What happens:**
1. Deletes the database record (soft delete)
2. Deletes the physical audio file from disk
3. Associated schedules remain but become inactive

---

## File Specifications

### Supported Audio Formats
- **MP3** (recommended for compatibility)
- **WAV** (high quality, larger size)
- **OGG** (good compression)
- **M4A** (Apple format)

### File Constraints
- **Max File Size**: 50MB
- **Storage Location**: `uploads/audio/` directory
- **Filename Format**: UUID-based (e.g., `a1b2c3d4-e5f6-7890-abcd-ef1234567890.mp3`)

### Best Practices
- **Format**: Use MP3 at 128-192 kbps for optimal size/quality
- **Sample Rate**: 44.1 kHz or 48 kHz
- **Channels**: Mono for voice, Stereo for music
- **Duration**: Keep under 5 minutes for faster loading

---

## Storage Structure

```
project-root/
├── uploads/
│   └── audio/
│       ├── a1b2c3d4-e5f6-7890-abcd-ef1234567890.mp3
│       ├── b2c3d4e5-f6a7-8901-bcde-f12345678901.mp3
│       └── c3d4e5f6-a7b8-9012-cdef-123456789012.mp3
├── src/
└── ...
```

**Files are:**
- Stored with UUID filenames (prevents conflicts)
- Organized in `uploads/audio/` directory
- Served statically via `/uploads/audio/` URL path
- Automatically deleted when database record is deleted

---

## Audio URL Format

After upload, the audio file is accessible at:
```
http://your-server.com/uploads/audio/[UUID].mp3
```

Example:
```
http://localhost:3000/uploads/audio/a1b2c3d4-e5f6-7890-abcd-ef1234567890.mp3
```

This URL is what gets stored in the database and returned to devices for playback.

---

## Error Handling

### Common Errors

**1. No File Uploaded**
```json
{
  "success": false,
  "message": "Audio file is required"
}
```

**2. Invalid File Format**
```json
{
  "success": false,
  "message": "File validation failed",
  "errors": [
    "Only MP3, WAV, OGG, and M4A files are allowed"
  ]
}
```

**3. File Too Large**
```json
{
  "success": false,
  "message": "File too large"
}
```

**4. Unauthorized**
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

---

## Complete Workflow Example

### Scenario: Admin Uploads Daily Prayer Audio

**Step 1: Login as Super Admin**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@jewellery.com",
    "password": "admin123"
  }'
```

Response includes token.

---

**Step 2: Upload Prayer Audio**
```bash
curl -X POST http://localhost:3000/api/audio \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "audio_file=@morning_prayer.mp3" \
  -F "title=Morning Prayer - Hindi" \
  -F "audio_type=PRAYER" \
  -F "language=Hindi" \
  -F "is_active=true"
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 5,
    "title": "Morning Prayer - Hindi",
    "audio_type": "PRAYER",
    "language": "Hindi",
    "file_url": "/uploads/audio/abc123.mp3",
    "duration_seconds": 180
  }
}
```

---

**Step 3: Create Schedule for Prayer**
```bash
curl -X POST http://localhost:3000/api/schedules \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "audio_id": 5,
    "schedule_type": "DAILY_PRAYER",
    "play_time": "10:00:00",
    "priority": 1,
    "is_active": true,
    "targets": [
      {
        "target_type": "ALL",
        "target_value": null
      }
    ]
  }'
```

---

**Step 4: Device Pulls Schedule**
```bash
curl -X GET "http://localhost:3000/api/device/sync?device_code=MUM-001-DEV-01"
```

Response includes the audio file URL:
```json
{
  "success": true,
  "data": {
    "schedules": [
      {
        "audio": {
          "id": 5,
          "title": "Morning Prayer - Hindi",
          "file_url": "/uploads/audio/abc123.mp3",
          "duration_seconds": 180
        },
        "play_time": "10:00:00",
        "offline_required": true
      }
    ]
  }
}
```

---

**Step 5: Device Plays Audio**

The device (browser) can now:
1. Download audio from: `http://localhost:3000/uploads/audio/abc123.mp3`
2. Cache it for offline playback
3. Play at scheduled time (10:00 AM)

---

## Security Considerations

### File Upload Security

1. **File Type Validation**: Only audio MIME types allowed
2. **File Size Limit**: 50MB maximum
3. **UUID Filenames**: Prevents path traversal attacks
4. **RBAC**: Only SUPER_ADMIN can upload
5. **Virus Scanning**: Add antivirus scanning in production

### Production Recommendations

```javascript
// Add virus scanning
const ClamScan = require('clamscan');

const clamscan = await new ClamScan().init({
  clamdscan: {
    path: '/usr/bin/clamdscan'
  }
});

// Before saving file
const { isInfected, viruses } = await clamscan.isInfected(file.path);
if (isInfected) {
  await fs.unlink(file.path);
  throw new Error('File contains virus');
}
```

---

## Production Deployment

### Option 1: Local Storage (Development/Small Scale)

Current implementation. Files stored on server disk.

**Pros:**
- Simple setup
- No external dependencies
- Low cost

**Cons:**
- Not scalable across multiple servers
- Backups needed
- No CDN benefits

---

### Option 2: Cloud Storage (Production Recommended)

Use AWS S3, Google Cloud Storage, or Azure Blob Storage.

**Example with AWS S3:**

```bash
npm install @aws-sdk/client-s3 multer-s3
```

```javascript
// src/config/storage.js - S3 Version
const { S3Client } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
  }
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const uniqueName = `audio/${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    }
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: fileFilter
});
```

**Benefits:**
- Scalable across multiple servers
- CDN integration
- Automatic backups
- Global distribution

---

## Testing Audio Upload

### Unit Test Example

```javascript
// tests/integration/audio-upload.test.js
const request = require('supertest');
const app = require('../../src/app');
const path = require('path');

describe('Audio Upload API', () => {
  test('should upload audio file', async () => {
    const testFile = path.join(__dirname, '../fixtures/test-audio.mp3');
    
    const res = await request(app)
      .post('/api/audio')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('title', 'Test Audio')
      .field('audio_type', 'PRAYER')
      .field('language', 'Hindi')
      .attach('audio_file', testFile);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('file_url');
    expect(res.body.data).toHaveProperty('duration_seconds');
  });

  test('should reject non-audio files', async () => {
    const testFile = path.join(__dirname, '../fixtures/test.txt');
    
    const res = await request(app)
      .post('/api/audio')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('title', 'Test Audio')
      .field('audio_type', 'PRAYER')
      .field('language', 'Hindi')
      .attach('audio_file', testFile);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
```

---

## Migration from Existing System

If you already have audio files hosted elsewhere (e.g., CDN):

**Option A: Keep External URLs**
The system accepts external URLs. Just create audio records:

```bash
curl -X POST http://localhost:3000/api/audio \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Prayer",
    "audio_type": "PRAYER",
    "language": "Hindi",
    "file_url": "https://cdn.example.com/prayer.mp3",
    "duration_seconds": 180
  }'
```

**Option B: Migrate Files to System**
1. Download all existing audio files
2. Upload through API
3. Update schedules with new audio IDs

---

## Summary

✅ **Full audio upload functionality implemented**
✅ **File validation and security**
✅ **Automatic duration detection**
✅ **File management (create, update, delete)**
✅ **Download endpoint for admins**
✅ **Static file serving for devices**
✅ **Production-ready architecture**

The Super Admin can now upload prayer audio, festival announcements, and daily audio directly through the API without any manual file handling!