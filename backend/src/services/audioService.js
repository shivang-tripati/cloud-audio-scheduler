const { AudioFile, Schedule } = require('../models');
const audioProcessor = require('../utils/audioProcessor');
const logger = require('../utils/logger');
const path = require('path');

class AudioService {
  async createAudio(data, file) {
    logger.debug('AudioService.createAudio - Starting', file);
    logger.debug('AudioService.createAudio - Starting', { title: data.title, audio_type: data.audio_type, file });
    try {
      if (!file) {
        logger.error('AudioService.createAudio - No file provided');
        throw new Error('Audio file is required');
      }

      const errors = audioProcessor.validateAudioFile(file);
      if (errors.length > 0) {
        logger.error('AudioService.createAudio - Validation errors', { errors });
        throw new Error(errors.join(', '));
      }

      // Get audio duration
      logger.debug('AudioService.createAudio - Getting audio duration');
      const duration = await audioProcessor.getAudioDuration(file.path);

      // Build file URL (adjust for your deployment)
      const fileUrl = `/uploads/audio/${file.filename}`;

      const audioData = {
        title: data.title,
        audio_type: data.audio_type,
        language: data.language,
        file_url: fileUrl,
        file_path: file.path, // Store local path for deletion
        duration_seconds: duration,
        is_active: data.is_active !== undefined ? data.is_active : true
      };

      const audio = await AudioFile.create(audioData);
      logger.debug('AudioService.createAudio - Success', { audioId: audio.id });
      return audio.toJSON();
    } catch (error) {
      logger.error('AudioService.createAudio - Error', { error: error.message, stack: error.stack });
      throw error;
    }
  }

  async getAllAudios() {
    logger.debug('AudioService.getAllAudios - Starting');
    try {
      const audios = await AudioFile.findAll({
        order: [['created_at', 'DESC']]
      });
      logger.debug('AudioService.getAllAudios - Success', { count: audios.length });
      return audios.map(audio => audio.toJSON());
    } catch (error) {
      logger.error('AudioService.getAllAudios - Error', { error: error.message, stack: error.stack });
      throw error;
    }
  }

  async getAudioById(id) {
    logger.debug('AudioService.getAudioById - Starting', { id });
    try {
      const audio = await AudioFile.findByPk(id, {
        include: [{
          model: Schedule,
          as: 'schedules',
          attributes: ['id', 'schedule_type', 'play_time', 'priority', 'is_active']
        }]
      });

      if (!audio) {
        logger.error('AudioService.getAudioById - Audio not found', { id });
        throw new Error('Audio file not found');
      }
      logger.debug('AudioService.getAudioById - Success', { id });
      return audio.toJSON();
    } catch (error) {
      logger.error('AudioService.getAudioById - Error', { id, error: error.message, stack: error.stack });
      throw error;
    }
  }

  async updateAudio(id, data, file) {
    logger.debug('AudioService.updateAudio - Starting', { id, hasFile: !!file });
    try {
      const audio = await AudioFile.findByPk(id);
      if (!audio) {
        logger.error('AudioService.updateAudio - Audio not found', { id });
        throw new Error('Audio file not found');
      }

      const updateData = { ...data };

      if (file) {
        // Delete old file
        if (audio.file_path) {
          logger.debug('AudioService.updateAudio - Deleting old file', { filePath: audio.file_path });
          await audioProcessor.deleteAudioFile(audio.file_path);
        }

        if (data.file_url) {
          const file = audio.file_url;
          const errors = audioProcessor.validateAudioFile(file);
          if (errors.length > 0) {
            logger.error('AudioService.updateAudio - Validation errors', { errors });
            throw new Error(errors.join(', '));
          }
        }

        // Get new audio duration
        const duration = await audioProcessor.getAudioDuration(file.path);

        updateData.file_url = `/uploads/audio/${file.filename}`;
        updateData.file_path = file.path;
        updateData.duration_seconds = duration;

      }
      await audio.update(updateData);
      logger.debug('AudioService.updateAudio - Success', { id });
      return audio.toJSON();
    } catch (error) {
      logger.error('AudioService.updateAudio - Error', { id, error: error.message, stack: error.stack });
      throw error;
    }
  }

  async deleteAudio(id) {
    logger.debug('AudioService.deleteAudio - Starting', { id });
    try {
      const audio = await AudioFile.findByPk(id);
      if (!audio) {
        logger.error('AudioService.deleteAudio - Audio not found', { id });
        throw new Error('Audio file not found');
      }

      // Delete physical file
      if (audio.file_path) {
        logger.debug('AudioService.deleteAudio - Deleting physical file', { filePath: audio.file_path });
        await audioProcessor.deleteAudioFile(audio.file_path);
      }

      await audio.destroy();
      logger.debug('AudioService.deleteAudio - Success', { id });
      return { message: 'Audio file deleted successfully' };
    } catch (error) {
      logger.error('AudioService.deleteAudio - Error', { id, error: error.message, stack: error.stack });
      throw error;
    }
  }
}

module.exports = new AudioService();