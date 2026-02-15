# Quick Start Guide - Audio Upload System

## 🚀 Setup (5 Minutes)

### 1. Install Dependencies
```bash
npm install
npm install multer uuid
# Optional for accurate audio duration:
npm install music-metadata
```

### 2. Add New Files

Copy these files to your project:

**New Files:**
- `src/config/storage.js` - Multer configuration
- `src/utils/audioProcessor.js` - Audio file utilities
- `tests/integration/audio-upload.test.js` - Upload tests

**Updated Files:**
- `src/models/AudioFile.js` - Added `file_path` field
- `src/services/audioService.js` - Upload logic
- `src/controllers/index.js` - Upload endpoints
- `src/routes/index.js` - Upload routes
- `src/app.js` - Static file serving

### 3. Database Migration

```bash
mysql -u root -p audio_announcement_system

ALTER TABLE audio_files 
ADD COLUMN file_path VARCHAR(500) NULL 
COMMENT 'Local file path for deletion' 
AFTER file_url;

exit
```

### 4. Create Upload Directory
```bash
mkdir -p uploads/audio
```

### 5. Start Server
```bash
npm start
```

---

## 📤 How to Upload Audio (Super Admin)

### Method 1: Using cURL

```bash
# Login first
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@jewellery.com","password":"admin123"}'

# Copy the token from response

# Upload audio
curl -X POST http://localhost:3000/api/audio \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "audio_file=@/path/to/morning_prayer.mp3" \
  -F "title=Morning Prayer - Hindi" \
  -F "audio_type=PRAYER" \
  -F "language=Hindi" \
  -F "is_active=true"
```

### Method 2: Using Postman

1. **Login** (`POST /api/auth/login`)
   - Body: `{"email":"admin@jewellery.com","password":"admin123"}`
   - Copy token from response

2. **Upload Audio** (`POST /api/audio`)
   - Headers: `Authorization: Bearer YOUR_TOKEN`
   - Body: form-data
     - `audio_file`: (select file)
     - `title`: "Morning Prayer - Hindi"
     - `audio_type`: "PRAYER"
     - `language`: "Hindi"
     - `is_active`: "true"

### Method 3: Using JavaScript

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
    'Authorization': 'Bearer ' + adminToken
  },
  body: formData
});

const result = await response.json();
console.log(result.data.file_url); // /uploads/audio/uuid.mp3
```

---

## 🔄 Complete Workflow Example

### Step 1: Admin Uploads Prayer Audio
```bash
curl -X POST http://localhost:3000/api/audio \
  -H "Authorization: Bearer TOKEN" \
  -F "audio_file=@morning_prayer.mp3" \
  -F "title=Morning Prayer - Hindi" \
  -F "audio_type=PRAYER" \
  -F "language=Hindi"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "title": "Morning Prayer - Hindi",
    "file_url": "/uploads/audio/abc123.mp3",
    "duration_seconds": 180
  }
}
```

### Step 2: Admin Creates Schedule
```bash
curl -X POST http://localhost:3000/api/schedules \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "audio_id": 5,
    "schedule_type": "DAILY_PRAYER",
    "play_time": "10:00:00",
    "priority": 1,
    "is_active": true,
    "targets": [{"target_type": "ALL"}]
  }'
```

### Step 3: Device Gets Schedule
```bash
curl -X GET "http://localhost:3000/api/device/sync?device_code=MUM-001-DEV-01"
```

**Response includes:**
```json
{
  "schedules": [{
    "audio": {
      "file_url": "/uploads/audio/abc123.mp3",
      "duration_seconds": 180
    },
    "play_time": "10:00:00",
    "offline_required": true
  }]
}
```

### Step 4: Device Downloads & Plays
```javascript
// Device downloads audio for offline caching
const audioUrl = 'http://localhost:3000/uploads/audio/abc123.mp3';
const audio = new Audio(audioUrl);

// Play at scheduled time
audio.play();
```

---

## 📋 Audio File Requirements

### Supported Formats
✅ **MP3** - Recommended (best compatibility)  
✅ **WAV** - High quality (larger size)  
✅ **OGG** - Good compression  
✅ **M4A** - Apple format  

### Constraints
- Max file size: **50MB**
- Storage: `uploads/audio/` directory
- Naming: Automatic UUID naming

### Best Practices
- **Format**: MP3 at 128-192 kbps
- **Sample Rate**: 44.1 kHz
- **Duration**: Under 5 minutes recommended
- **Quality**: Balance size vs quality for network efficiency

---

## 🔧 Common Operations

### Update Audio File
```bash
curl -X PUT http://localhost:3000/api/audio/5 \
  -H "Authorization: Bearer TOKEN" \
  -F "audio_file=@new_prayer.mp3" \
  -F "title=Updated Prayer"
```

### Update Metadata Only
```bash
curl -X PUT http://localhost:3000/api/audio/5 \
  -H "Authorization: Bearer TOKEN" \
  -F "title=New Title" \
  -F "is_active=false"
```

### Download Audio
```bash
curl -X GET http://localhost:3000/api/audio/5/download \
  -H "Authorization: Bearer TOKEN" \
  -o downloaded_prayer.mp3
```

### Delete Audio
```bash
curl -X DELETE http://localhost:3000/api/audio/5 \
  -H "Authorization: Bearer TOKEN"
```
*This deletes both database record and physical file*

---

## 🧪 Testing

```bash
# Run all tests including upload tests
npm test

# Run only upload tests
npm test -- audio-upload
```

---

## 🚨 Troubleshooting

### Issue: "Audio file is required"
**Solution:** Ensure field name is `audio_file` and file is attached

### Issue: "Only audio files are allowed"
**Solution:** Check file format (must be MP3, WAV, OGG, or M4A)

### Issue: "File too large"
**Solution:** File must be under 50MB

### Issue: "Insufficient permissions"
**Solution:** Must be logged in as SUPER_ADMIN

### Issue: Upload directory doesn't exist
**Solution:** 
```bash
mkdir -p uploads/audio
chmod 755 uploads
```

### Issue: Audio duration is 0 or incorrect
**Solution:** Install `music-metadata` for accurate duration:
```bash
npm install music-metadata
```

---

## 🌐 Production Deployment

### Option 1: Local Storage (Current)
- Files stored on server disk
- Simple setup
- Good for single-server deployments

### Option 2: Cloud Storage (Recommended)

**AWS S3:**
```bash
npm install @aws-sdk/client-s3 multer-s3
```

Update `src/config/storage.js` to use S3.

**Benefits:**
- Scalable across servers
- CDN integration
- Automatic backups
- Global distribution

---

## 📊 Audio Statistics

Get audio file info:
```bash
curl -X GET http://localhost:3000/api/audio/5 \
  -H "Authorization: Bearer TOKEN"
```

**Response:**
```json
{
  "id": 5,
  "title": "Morning Prayer",
  "audio_type": "PRAYER",
  "file_url": "/uploads/audio/abc123.mp3",
  "duration_seconds": 180,
  "schedules": [
    {
      "id": 1,
      "schedule_type": "DAILY_PRAYER",
      "play_time": "10:00:00"
    }
  ]
}
```

---

## ✅ Feature Checklist

- ✅ Audio file upload (MP3, WAV, OGG, M4A)
- ✅ Automatic duration detection
- ✅ File validation & size limits
- ✅ UUID-based unique filenames
- ✅ Update audio with new file
- ✅ Download endpoint
- ✅ Physical file deletion on delete
- ✅ Static file serving for devices
- ✅ Integration with schedules
- ✅ Role-based access (SUPER_ADMIN only)
- ✅ Complete test coverage

---

## 🎯 Summary

**For Super Admin:**
1. Upload audio via API
2. Create schedule using audio ID
3. Done! Devices will automatically get the schedule

**For Devices:**
1. Call `/device/sync` to get schedule
2. Download audio from `file_url`
3. Cache for offline (if prayer)
4. Play at scheduled time

**No manual file management needed!** 🎉