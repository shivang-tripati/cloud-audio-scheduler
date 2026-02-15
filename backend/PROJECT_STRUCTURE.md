# Project Structure

```
cloud-audio-announcement-backend/
│
├── src/
│   ├── config/
│   │   └── database.js              # Sequelize configuration
│   │
│   ├── models/
│   │   ├── index.js                 # Model associations
│   │   ├── User.js                  # User model
│   │   ├── Branch.js                # Branch model
│   │   ├── Device.js                # Device model
│   │   ├── AudioFile.js             # Audio file model
│   │   ├── Schedule.js              # Schedule model
│   │   ├── ScheduleTarget.js        # Schedule target model
│   │   └── PlaybackLog.js           # Playback log & heartbeat models
│   │
│   ├── controllers/
│   │   └── index.js                 # All controllers (auth, user, branch, etc.)
│   │
│   ├── services/
│   │   ├── authService.js           # Authentication business logic
│   │   ├── userService.js           # User CRUD logic
│   │   ├── branchService.js         # Branch CRUD logic
│   │   ├── deviceService.js         # Device CRUD & status logic
│   │   ├── audioService.js          # Audio CRUD logic
│   │   ├── scheduleService.js       # Schedule CRUD & sync logic (CORE)
│   │   └── logService.js            # Playback logging logic
│   │
│   ├── middleware/
│   │   ├── auth.js                  # JWT authentication & RBAC
│   │   └── validation.js            # Request validation middleware
│   │
│   ├── validators/
│   │   └── schemas.js               # Joi validation schemas
│   │
│   ├── routes/
│   │   └── index.js                 # All API routes
│   │
│   ├── database/
│   │   └── seed.js                  # Database seeding script
│   │
│   ├── app.js                       # Express app configuration
│   └── server.js                    # Server entry point
│
├── tests/
│   ├── setup.js                     # Test setup & utilities
│   ├── integration/
│   │   ├── auth.test.js            # Auth API tests
│   │   ├── users.test.js           # Users API tests
│   │   ├── branches.test.js        # Branches API tests
│   │   ├── devices.test.js         # Devices API tests
│   │   ├── audio.test.js           # Audio API tests
│   │   ├── schedules.test.js       # Schedules API tests
│   │   ├── device-sync.test.js     # Device sync tests (CRITICAL)
│   │   └── logs.test.js            # Logging tests
│   │
│   └── unit/
│       ├── services/
│       │   ├── authService.test.js
│       │   ├── userService.test.js
│       │   ├── branchService.test.js
│       │   ├── deviceService.test.js
│       │   ├── audioService.test.js
│       │   ├── scheduleService.test.js
│       │   └── logService.test.js
│       │
│       └── models/
│           ├── User.test.js
│           ├── Branch.test.js
│           └── Schedule.test.js
│
├── .env.example                     # Environment variables template
├── .gitignore                       # Git ignore rules
├── package.json                     # NPM dependencies & scripts
├── schema.sql                       # MySQL database schema
├── README.md                        # Project documentation
├── API_DOCUMENTATION.md             # Complete API reference
└── PROJECT_STRUCTURE.md             # This file

```

---

## File Descriptions

### Core Application Files

**src/server.js**
- Entry point for the application
- Database connection initialization
- Server startup logic
- Error handling for unhandled rejections

**src/app.js**
- Express application configuration
- Middleware setup (CORS, helmet, rate limiting)
- Route mounting
- Global error handler

**src/config/database.js**
- Sequelize ORM configuration
- Database connection pool settings
- Connection testing utility

---

### Models Layer

All models follow these patterns:
- Sequelize model definitions
- Field validations
- Timestamps (created_at, updated_at)
- Soft delete support (deleted_at)
- Custom instance/static methods
- JSON serialization (removes sensitive fields)

**Key Models:**
- **User**: Authentication & authorization
- **Branch**: Store locations
- **Device**: Browser-based players
- **AudioFile**: Audio content metadata
- **Schedule**: Playback schedules
- **ScheduleTarget**: Schedule targeting rules
- **PlaybackLog**: Playback history
- **DeviceHeartbeat**: Device status tracking

---

### Services Layer (Business Logic)

Each service handles business logic for its domain:

**authService.js**
- User login validation
- JWT token generation
- Password verification

**scheduleService.js** (MOST CRITICAL)
- Schedule CRUD operations
- Device schedule resolution
- Priority conflict handling
- Target filtering (ALL/REGION/BRANCH)
- Date range validation

**deviceService.js**
- Device registration
- Status tracking
- Heartbeat recording
- Online/offline detection

---

### Controllers Layer

Controllers handle HTTP request/response:
- Extract request data
- Call appropriate service
- Format response
- Handle errors
- Return appropriate status codes

All controllers follow this pattern:
```javascript
async controllerMethod(req, res) {
  try {
    const result = await service.method(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}
```

---

### Middleware Layer

**auth.js**
- `authenticate()`: Verify JWT token
- `authorize(...roles)`: Check user role

**validation.js**
- `validate(schema)`: Validate request body
- `validateQuery(schema)`: Validate query params
- `validateParams(schema)`: Validate URL params

---

### Routes Layer

Single route file (`src/routes/index.js`) that:
- Defines all API endpoints
- Applies authentication middleware
- Applies authorization middleware
- Applies validation middleware
- Maps to controllers

---

### Database Layer

**schema.sql**
- Complete MySQL schema
- All table definitions
- Indexes for performance
- Foreign key constraints

**seed.js**
- Creates sample data
- Test credentials
- Sample branches, devices
- Sample audio files
- Sample schedules

---

### Testing Layer

**Test Structure:**
```
tests/
├── setup.js              # Test database setup
├── integration/          # API endpoint tests
└── unit/                 # Service & model tests
```

**Test Coverage Requirements:**
- All API endpoints
- Success cases
- Failure cases
- Validation errors
- Authorization checks
- Edge cases
- Priority resolution logic

---

## Code Organization Principles

### 1. Separation of Concerns
- **Controllers**: HTTP handling only
- **Services**: Business logic
- **Models**: Data structure & validation
- **Middleware**: Cross-cutting concerns

### 2. Single Responsibility
- Each file has one clear purpose
- Functions do one thing well
- Clear naming conventions

### 3. DRY (Don't Repeat Yourself)
- Shared logic in services
- Reusable middleware
- Common validation schemas

### 4. Testability
- Pure functions where possible
- Dependency injection
- Mocked external dependencies

---

## Configuration Files

**.env.example**
```env
# Application
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=audio_announcement_system
DB_USER=root
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# CORS
ALLOWED_ORIGINS=http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**package.json Scripts**
```json
{
  "start": "node src/server.js",
  "dev": "nodemon src/server.js",
  "migrate": "node src/database/migrate.js",
  "seed": "node src/database/seed.js",
  "test": "jest --coverage --verbose",
  "test:watch": "jest --watch",
  "test:unit": "jest --testPathPattern=tests/unit",
  "test:integration": "jest --testPathPattern=tests/integration"
}
```

---

## Development Workflow

### 1. Adding New Feature

```bash
# 1. Create feature branch
git checkout -b feature/new-endpoint

# 2. Create/update files in this order:
#    - Model (if needed)
#    - Validation schema
#    - Service (business logic)
#    - Controller
#    - Routes
#    - Tests

# 3. Run tests
npm test

# 4. Commit and push
git add .
git commit -m "feat: add new endpoint"
git push origin feature/new-endpoint
```

### 2. Typical File Creation Order

For a new resource (e.g., "Announcements"):

1. **Model**: `src/models/Announcement.js`
2. **Schema**: Add to `src/validators/schemas.js`
3. **Service**: `src/services/announcementService.js`
4. **Controller**: Add to `src/controllers/index.js`
5. **Routes**: Add to `src/routes/index.js`
6. **Tests**: `tests/integration/announcements.test.js`

---

## Key Design Decisions

### Why Sequelize?
- Mature ORM for Node.js
- Strong MySQL support
- Migration support
- Association handling

### Why JWT?
- Stateless authentication
- Scalable across instances
- Standard industry practice

### Why Joi?
- Schema-based validation
- Clear error messages
- Extensive validation rules

### Why Service Layer?
- Separates business logic from HTTP
- Reusable across controllers
- Easier to test
- Clear responsibility boundaries

### Why Soft Deletes?
- Data recovery possible
- Audit trail maintained
- Historical data preserved

---

## Performance Optimizations

### Database
- Indexes on frequently queried columns
- Composite indexes for multi-column queries
- Connection pooling
- Query result limits

### API
- Rate limiting prevents abuse
- Gzip compression
- Request size limits
- Pagination for large datasets

### Caching Strategy (Future)
```javascript
// Cache resolved schedules
const cacheKey = `schedule:${deviceCode}:${date}`;
const cached = await cache.get(cacheKey);
if (cached) return cached;

// Generate schedule
const schedule = await scheduleService.getDeviceSchedule(deviceCode);

// Cache for 1 hour
await cache.set(cacheKey, schedule, 3600);
```

---

## Security Measures

1. **Authentication**: JWT with expiration
2. **Authorization**: Role-based access control
3. **Validation**: All inputs validated with Joi
4. **SQL Injection**: Prevented by Sequelize ORM
5. **Rate Limiting**: Prevents brute force attacks
6. **Helmet**: Security headers
7. **CORS**: Controlled origins
8. **Password Hashing**: Bcrypt with salt

---

## Monitoring & Logging

### Production Logging
```javascript
// Request logging
app.use(morgan('combined'));

// Error logging
console.error('Error:', error);

// Future: Integration with services like:
// - Sentry (error tracking)
// - LogRocket (session replay)
// - Datadog (APM)
```

### Health Checks
```javascript
GET /api/health
{
  "status": "OK",
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

---

## Scalability Considerations

### Horizontal Scaling
- Stateless design (JWT)
- Database connection pooling
- Load balancer ready
- No session storage

### Database Scaling
- Read replicas for queries
- Write to primary only
- Connection pool per instance

### Caching Layer (Future)
- Redis for schedule caching
- Cache invalidation on updates
- Reduce database load

---

## Future Enhancements

### Planned Features
1. Analytics dashboard
2. Real-time notifications
3. Audio file upload
4. Schedule templates
5. Multi-language support
6. Advanced reporting
7. Mobile admin app
8. Webhook integrations

### Technical Improvements
1. GraphQL API option
2. WebSocket for real-time updates
3. Microservices architecture
4. Event-driven architecture
5. Advanced caching
6. CDN integration
7. Container orchestration
8. CI/CD pipeline

---

This structure follows enterprise-level Node.js/Express.js best practices and is production-ready for deployment.