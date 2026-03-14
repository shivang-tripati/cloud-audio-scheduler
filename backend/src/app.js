const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const logger = require('./utils/logger')
const routes = require('./routes');
const path = require('path');


const app = express();

// Security middleware
app.use(helmet());

// CORS
app.set('trust proxy', 1); // important behind Traefik

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [];

app.use(cors({
  origin: function (origin, callback) {
    // Allow non-browser requests (like agents, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// VERY IMPORTANT for preflight
app.options('*', cors());

const isDev = process.env.NODE_ENV === 'development';

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: isDev ? 2000 : (parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000),
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.use('/api', (req, res, next) => {
  if (req.method === 'OPTIONS') return next(); // Skip preflight
  return limiter(req, res, next);
});

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Cleaner logs for development
} else {
  app.use(morgan('combined')); // Detailed logs for production
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded audio files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


// Routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    // Only show stack trace in development mode
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});


module.exports = app;