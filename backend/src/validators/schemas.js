const Joi = require('joi');

// Auth Schemas
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('SUPER_ADMIN', 'STORE_MANAGER').required()
});

// const forgotPasswordSchema = Joi.object({
//   email: Joi.string().email().required()
// });

// User Schemas
const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('SUPER_ADMIN', 'STORE_MANAGER').required(),
  is_active: Joi.boolean().default(true)
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(255),
  email: Joi.string().email(),
  password: Joi.string().min(6),
  role: Joi.string().valid('SUPER_ADMIN', 'STORE_MANAGER'),
  is_active: Joi.boolean()
}).min(1);

// Branch Schemas
const createBranchSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  city: Joi.string().min(2).max(100).required(),
  state: Joi.string().min(2).max(100).required(),
  region: Joi.string().min(2).max(100).required(),
  is_active: Joi.boolean().default(true)
});

const updateBranchSchema = Joi.object({
  name: Joi.string().min(2).max(255),
  city: Joi.string().min(2).max(100),
  state: Joi.string().min(2).max(100),
  region: Joi.string().min(2).max(100),
  is_active: Joi.boolean()
}).min(1);

// Device Schemas
const registerDeviceSchema = Joi.object({
  branch_id: Joi.number().integer().positive().required(),
  device_name: Joi.string().max(255).allow(null, '')
});

const updateDeviceSchema = Joi.object({
  device_name: Joi.string().max(255).allow(null, ''),
  branch_id: Joi.number().integer().positive(),
  status: Joi.string().valid('ONLINE', 'OFFLINE')
}).min(1);


const activateDeviceSchema = Joi.object({
  device_code: Joi.string().required(),
  device_fingerprint: Joi.string().required(),
  device_uuid: Joi.string().required(),
  host_name: Joi.string().required()
});


// Audio File Schemas
const createAudioSchema = Joi.object({
  title: Joi.string().min(2).max(255).required(),
  audio_type: Joi.string().valid('PRAYER', 'FESTIVAL', 'DAILY').required(),
  language: Joi.string().min(2).max(50).required(),
  is_active: Joi.boolean().default(true)
  // file_url and duration_seconds are auto-generated from upload
});

const updateAudioSchema = Joi.object({
  title: Joi.string().min(2).max(255),
  audio_type: Joi.string().valid('PRAYER', 'FESTIVAL', 'DAILY'),
  language: Joi.string().min(2).max(50),
  // file_url: Joi.string().uri().max(500),
  // file_path: Joi.string().uri().max(500),
  // duration_seconds: Joi.number().integer().min(1),
  is_active: Joi.boolean()
  // file can be optionally uploaded
}).min(1);

// Schedule Schemas
const createScheduleSchema = Joi.object({
  audio_id: Joi.number().integer().positive().required(),
  schedule_mode: Joi.string().valid('DAILY', 'DATE_RANGE', 'ONCE').required(),
  start_date: Joi.date().iso()
    .when('schedule_mode', {
      is: 'DATE_RANGE',
      then: Joi.required(),
      otherwise: Joi.optional().allow(null)
    }),
  end_date: Joi.date().iso()
    .min(Joi.ref('start_date'))
    .when('schedule_mode', {
      is: 'DATE_RANGE',
      then: Joi.required(),
      otherwise: Joi.optional().allow(null)
    }),

  play_time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .when('schedule_mode', {
      is: 'ONCE',
      then: Joi.forbidden(),
      otherwise: Joi.required()
    }),
  play_count: Joi.number()
    .integer()
    .min(1)
    .default(1),
  // ONCE only
  play_at: Joi.date().iso()
    .when('schedule_mode', {
      is: 'ONCE',
      then: Joi.required(),
      otherwise: Joi.forbidden()
    }),
  repeat_interval_minutes: Joi.number().integer().min(1).allow(null),
  priority: Joi.number().integer().min(1).max(100).required(),
  is_active: Joi.boolean().default(true),
  targets: Joi.array().items(
    Joi.object({
      target_type: Joi.string().valid('ALL', 'REGION', 'BRANCH').required(),
      target_value: Joi.string().max(255).allow(null, '')
    })
  ).min(1).required()
});

const updateScheduleSchema = Joi.object({
  audio_id: Joi.number().integer().positive(),
  schedule_mode: Joi.string().valid('DAILY', 'DATE_RANGE', 'ONCE'),

  play_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/),

  start_date: Joi.date().iso().allow(null),
  end_date: Joi.date().iso().allow(null),

  play_at: Joi.date().iso(),

  play_count: Joi.number().integer().min(1),

  priority: Joi.number().integer().min(1).max(100),
  is_active: Joi.boolean(),

  targets: Joi.array().min(1)
}).min(1);


// Log Schemas
const playbackLogSchema = Joi.object({
  device_code: Joi.string().required(),
  audio_id: Joi.number().integer().positive().required(),
  played_at: Joi.date().iso().required(),
  status: Joi.string().valid('PLAYED', 'MISSED').required(),
  reason: Joi.string().max(255).allow(null, '')
});

//
//Your heartbeat schema should not accept device_id.
//Identity comes from token, not body.
const heartbeatSchema = Joi.object({
  status: Joi.string().valid('PLAYING', 'IDLE').required(),
  current_audio: Joi.string().allow(null),
  volume: Joi.number().min(0).max(100)
});


// Query Schemas
const deviceSyncQuerySchema = Joi.object({
  device_code: Joi.string().required()
});

const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

module.exports = {
  loginSchema,
  registerSchema,
  createUserSchema,
  updateUserSchema,
  createBranchSchema,
  updateBranchSchema,
  registerDeviceSchema,
  activateDeviceSchema,
  updateDeviceSchema,
  createAudioSchema,
  updateAudioSchema,
  createScheduleSchema,
  updateScheduleSchema,
  playbackLogSchema,
  heartbeatSchema,
  deviceSyncQuerySchema,
  idParamSchema
};