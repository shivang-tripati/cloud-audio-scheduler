const fs = require('fs').promises;
const path = require('path');
const mm = require('music-metadata');
const logger = require('../utils/logger');

class AudioProcessor {
  /**
   * Get audio duration using file metadata
   * For production, use a library like 'music-metadata' or 'node-audioinfo'
   * This is a placeholder implementation
   */
  async getAudioDuration(filePath) {
    logger.debug('AudioProcessor.getAudioDuration - Starting', { filePath });
    try {
      // For now, return estimated duration
      // In production, use music-metadata library:
      // const metadata = await mm.parseFile(filePath);
      // return Math.round(metadata.format.duration);

      const metadata = await mm.parseFile(filePath);
      if (metadata && metadata.format && metadata.format.duration) {
        return Math.round(metadata.format.duration);
      }

      const stats = await fs.stat(filePath);
      const fileSizeInMB = stats.size / (1024 * 1024);

      // Rough estimate: MP3 at 128kbps ~ 1MB per minute
      // This is just a fallback - use proper audio library in production
      const estimatedSeconds = Math.round(fileSizeInMB * 60);

      return estimatedSeconds || 60; // Default to 60 seconds if calculation fails
    } catch (error) {
      logger.error('AudioProcessor.getAudioDuration - Error', { error: error.message, stack: error.stack });
      return 60; // Default duration
    }
  }

  /**
   * Delete audio file from disk
   */
  async deleteAudioFile(filePath) {
    logger.debug('AudioProcessor.deleteAudioFile - Starting', { filePath });
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      logger.error('AudioProcessor.deleteAudioFile - Error', { error: error.message, stack: error.stack });
      return false;
    }
  }

  /**
   * Validate audio file
   */
  validateAudioFile(file) {
    const errors = [];

    logger.debug('AudioProcessor.validateAudioFile - Starting', { file });
    if (!file) {
      errors.push('Audio file is required');
    }

    if (file && file.size > 50 * 1024 * 1024) {
      errors.push('Audio file size must be less than 50MB');
    }

    const allowedExtensions = ['.mp3', '.wav', '.ogg', '.m4a'];
    const fileExt = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(fileExt)) {
      errors.push('Only MP3, WAV, OGG, and M4A files are allowed');
    }

    return errors;
  }
}

module.exports = new AudioProcessor();