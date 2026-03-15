require('dotenv').config();
const { sequelize, testConnection } = require('./config/database');
const playlistEmitter = require('./emiters/playlistemitter');


const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');



const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS.split(','),
    methods: ["GET", "POST"],
    credentials: true
  },
})

require('./socket')(io);

// ── PlaylistEmitter init ──
// Must happen AFTER io is created.
// This gives playlistEmitter its io reference so
// controllers can call playlistEmitter.toBranch(id) from anywhere.
playlistEmitter.init(io)

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  console.log('--- DEBUG ENV ---');
  console.log('DB_USER:', process.env.DB_USER);
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('-----------------');
  try {
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Sync database (use migrations in production)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync();
      console.log('✓ Database synchronized');
    }

    // Start server
    server.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ API Base URL: http://localhost:${PORT}/api`);

      require('./jobs/deviceJobs')();
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer();