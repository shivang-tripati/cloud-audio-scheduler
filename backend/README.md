# Cloud Audio & Announcement System - Backend

## 🎯 Product Overview

Production-grade backend for a **Cloud Audio & Announcement System** designed specifically for **Jewellery Retail Chains in India**.

### Core Capabilities
- ✅ Scheduled audio playback across multiple store locations
- ✅ Guaranteed daily prayer broadcast (never missed)
- ✅ Festival & recurring announcements
- ✅ Multi-region/branch targeting
- ✅ Offline support for critical content
- ✅ Browser-based device management
- ✅ Low-cost infrastructure

### What This System Does
- Central backend controls **what** plays and **when**
- Store devices (browsers) pull schedules and play audio
- Backend resolves all priority conflicts
- Devices only execute the resolved schedule

### What This System Is NOT
- ❌ NOT a live streaming system
- ❌ NOT a mobile app backend
- ❌ NOT a real-time WebSocket system
- ❌ NOT an AI voice generation system

---

## 🏗️ Architecture

### Tech Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MySQL 8.0+
- **ORM**: Sequelize
- **Authentication**: JWT
- **Validation**: Joi
- **Testing**: Jest + Supertest

### Architecture Pattern
```
┌─────────────┐      ┌──────────────┐      ┌──────────────┐
│  Controller │ ───> │   Service    │ ───> │    Model     │
│   (HTTP)    │      │ (Business    │      │ (Database)   │
│             │      │  Logic)      │      │              │
└─────────────┘      └──────────────┘      └──────────────┘
```

### Database Schema
```
users ──┐
        │
branches ──> devices ──> playback_logs
   │                 └──> device_heartbeats
   │
   └──> (region/branch targeting)
        
audio_files ──> schedules ──> schedule_targets
                   │
                   └──> (resolved by backend)
```

---

## 📦 Installation

### Prerequisites
- Node.js >= 18.0.0
- MySQL >= 8.0
- npm or yarn

### Setup Steps

1. **Clone & Install**
```bash
git clone <repository-url>
cd cloud-audio-announcement-backend
npm install
```

2. **Configure Environment**
```bash
cp .env.example .env
```

Edit `.env`:
```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=audio_announcement_system
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
```

3. **Create Database**
```bash
mysql -u root -p
CREATE DATABASE audio_announcement_system;
exit
```

4. **Run Migrations**
```bash
# Import schema
mysql -u root -p audio_announcement_system < schema.sql
```

5. **Seed Database**
```bash
npm run seed
```

6. **Start Server**
```bash
# Development
npm run dev

# Production
npm start
```

Server will start on `http://localhost:3000`

---

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Test Categories
- **Unit Tests**: Service & model logic
- **Integration Tests**: Complete API flows
- **Priority Resolution Tests**: Schedule conflict handling

### Test Credentials
After seeding:
- **Admin**: `admin@jewellery.com` / `admin123`
- **Manager**: `manager@jewellery.com` / `manager123`

---

## 🔑 Key Features

### 1. Role-Based Access Control
- **SUPER_ADMIN**: Full CRUD access
- **STORE_MANAGER**: Read-only access

### 2. Schedule Priority System
Priority hierarchy (automatically resolved by backend):
1. **DAILY_PRAYER** (Priority 1) - Highest
2. **FESTIVAL** (Priority 2-10)
3. **DAILY** (Priority 11+) - Regular announcements

### 3. Targeting System
Schedules can target:
- **ALL**: Every branch
- **REGION**: Specific region (e.g., "West", "North")
- **BRANCH**: Specific branch code (e.g., "MUM-001")

### 4. Device Sync Endpoint
**Most Important Endpoint**: `GET /api/device/sync`

This endpoint:
- Returns resolved daily schedule for a device
- Handles all priority conflicts
- Filters by branch/region
- Marks prayer as `offline_required`
- Sorts by play time

Example response:
```json
{
  "success": true,
  "data": {
    "device": {...},
    "branch": {...},
    "schedule_date": "2026-01-01",
    "schedules": [
      {
        "schedule_id": 1,
        "audio": {...},
        "play_time": "10:00:00",
        "priority": 1,
        "offline_required": true
      }
    ]
  }
}
```

### 5. Offline Support
- Only **DAILY_PRAYER** is guaranteed offline
- Marked with `offline_required: true`
- Device must cache prayer audio
- Other content may be skipped if offline

### 6. Soft Deletes
- All entities use soft delete (paranoid mode)
- Deleted records kept with `deleted_at` timestamp
- Can be restored if needed

---

## 📡 API Overview

### Core Endpoints

**Authentication**
- `POST /api/auth/login` - Login

**Users** (SUPER_ADMIN only for write)
- `POST /api/users` - Create user
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

**Branches** (SUPER_ADMIN only for write)
- `POST /api/branches` - Create branch
- `GET /api/branches` - List branches
- `GET /api/branches/:id` - Get branch
- `PUT /api/branches/:id` - Update branch
- `DELETE /api/branches/:id` - Delete branch

**Devices** (SUPER_ADMIN only for write)
- `POST /api/devices/register` - Register device
- `GET /api/devices` - List devices
- `GET /api/devices/:id` - Get device
- `GET /api/devices/status` - Get all device statuses
- `PUT /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Delete device

**Audio Files** (SUPER_ADMIN only for write)
- `POST /api/audio` - Create audio
- `GET /api/audio` - List audio files
- `GET /api/audio/:id` - Get audio
- `PUT /api/audio/:id` - Update audio
- `DELETE /api/audio/:id` - Delete audio

**Schedules** (SUPER_ADMIN only for write)
- `POST /api/schedules` - Create schedule
- `GET /api/schedules` - List schedules
- `GET /api/schedules/:id` - Get schedule
- `PUT /api/schedules/:id` - Update schedule
- `DELETE /api/schedules/:id` - Delete schedule

**Device Sync** (No auth required - used by devices)
- `GET /api/device/sync?device_code=XXX` - Get resolved schedule

**Logs** (No auth required - used by devices)
- `POST /api/device/logs` - Record playback
- `POST /api/device/heartbeat` - Send heartbeat

Full API documentation in `API_DOCUMENTATION.md`

---

## 🎯 Business Rules

### Critical Rules (NEVER violate)

1. **Prayer is Sacred**
   - Must play once per day
   - Highest priority (1)
   - Must be cached offline
   - Must NOT play twice same day

2. **Priority Resolution**
   - Backend resolves ALL conflicts
   - Device does NOT compute priority
   - Only highest priority plays at each time slot

3. **Targeting Logic**
   - ALL = applies to every branch
   - REGION = only branches in that region
   - BRANCH = only that specific branch

4. **Offline Behavior**
   - Only prayer guaranteed offline
   - Other audio may be skipped
   - Device caches prayer file

5. **Device Trust**
   - Device pulls schedule
   - Device executes schedule
   - Device logs playback
   - Backend has authority

---

## 🚀 Deployment

### Production Checklist

1. **Environment**
```bash
NODE_ENV=production
JWT_SECRET=<strong-secret-256-bits>
```

2. **Database**
- Use managed MySQL (AWS RDS, Google Cloud SQL)
- Enable automated backups
- Set up read replicas for scaling

3. **Security**
- Enable HTTPS only
- Set strong JWT secret
- Configure CORS properly
- Use environment variables for secrets
- Enable rate limiting

4. **Monitoring**
- Set up error logging (Sentry, LogRocket)
- Monitor API response times
- Track device heartbeats
- Alert on missed prayers

5. **Scaling**
- Use load balancer for multiple instances
- Enable database connection pooling
- Cache frequently accessed data
- CDN for audio files

### Deployment Options

**Option 1: Traditional VPS**
- Deploy on Digital Ocean, Linode, AWS EC2
- Use PM2 for process management
- Nginx as reverse proxy

**Option 2: Platform-as-a-Service**
- Heroku, Railway, Render
- Automatic scaling
- Built-in monitoring

**Option 3: Containerized**
- Docker + Kubernetes
- AWS ECS, Google Cloud Run
- Easy scaling and updates

---

## 📊 Performance Considerations

### Optimization Tips

1. **Database Indexes**
   - All foreign keys indexed
   - Frequently queried columns indexed
   - Composite indexes for common queries

2. **Query Optimization**
   - Use eager loading (includes)
   - Limit result sets
   - Cache schedule resolutions

3. **API Performance**
   - Rate limiting enabled
   - Request size limits
   - Gzip compression

4. **Caching Strategy**
   - Cache resolved schedules (1 hour)
   - Cache audio file metadata
   - Invalidate on schedule updates

---

## 🔧 Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check MySQL is running
systemctl status mysql

# Test connection
mysql -u root -p

# Verify credentials in .env
```

**JWT Token Invalid**
```bash
# Ensure JWT_SECRET matches
# Token might be expired
# Check token format: "Bearer <token>"
```

**Schedule Not Appearing**
- Check schedule is active
- Verify date range includes today
- Confirm target matches device branch/region
- Check audio file is active

**Prayer Not Marked Offline**
- Verify schedule_type is "DAILY_PRAYER"
- Check priority is 1
- Confirm backend logic in scheduleService.js

---

## 📝 Development Guidelines

### Code Style
- Use consistent naming conventions
- Write self-documenting code
- Add comments for complex logic
- Follow Express.js best practices

### Git Workflow
```bash
# Feature branch
git checkout -b feature/new-feature

# Commit with clear messages
git commit -m "feat: add schedule conflict resolution"

# Push and create PR
git push origin feature/new-feature
```

### Testing Requirements
- Write tests for ALL new features
- Maintain >80% code coverage
- Test success + failure cases
- Test edge cases

---

## 📚 Additional Resources

- [API Documentation](./API_DOCUMENTATION.md)
- [Database Schema](./schema.sql)
- [Test Suite](./tests/)
- [Sequelize Docs](https://sequelize.org/docs/v6/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Write tests
4. Submit pull request

---

## 📄 License

Proprietary - All Rights Reserved

---

## 👥 Support

For issues or questions:
- Create GitHub issue
- Contact: support@example.com

---

## 🎉 Credits

Built with ❤️ for Indian Jewellery Retail Chains

**System Requirements Designed For:**
- Low infrastructure cost
- Existing store hardware
- Indian retail workflows
- Festival & prayer scheduling
- Multi-branch management