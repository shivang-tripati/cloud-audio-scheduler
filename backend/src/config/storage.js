const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/audio');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    logger.debug('Storage destination', { uploadDir });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    logger.debug('Storage filename', { uniqueName });
    cb(null, uniqueName);
  }
});

// File filter - only audio files
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'audio/mpeg',       // .mp3
    'audio/mp3',
    'audio/wav',        // .wav
    'audio/x-wav',
    'audio/wave',
    'audio/ogg',        // .ogg
    'audio/mp4',        // .m4a
    'audio/x-m4a'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    logger.debug('Storage file filter', { allowedMimes, fileMimetype: file.mimetype });
    cb(null, true);
  } else {
    logger.debug('Storage file filter', { allowedMimes, fileMimetype: file.mimetype });
    cb(new Error('Only audio files are allowed (MP3, WAV, OGG, M4A)'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max file size
  }
});

module.exports = { upload, uploadDir };