const audioService = require('../services/audioService');
const youtubeService = require('../services/youtube.service');
const audioProcessor = require('../utils/audioProcessor')
const logger = require('../utils/logger');

const audioController = {


  async create(req, res) {
    logger.debug('AudioService.createAudio - Starting', req.body);
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Audio file is required'
        });
      }

      const validationErrors = audioProcessor.validateAudioFile(req.file);
      if (validationErrors.length > 0) {
        // Delete uploaded file if validation fails
        await audioProcessor.deleteAudioFile(req.file.path);
        logger.error('AudioService.createAudio - Validation errors', { errors: validationErrors });
        return res.status(400).json({
          success: false,
          message: 'File validation failed',
          errors: validationErrors
        });
      }

      const audio = await audioService.createAudio(req.body, req.file);
      res.status(201).json({
        success: true,
        data: audio
      });
    } catch (error) {
      // Delete uploaded file on error
      if (req.file) {
        await audioProcessor.deleteAudioFile(req.file.path);
      }
      logger.error('AudioService.createAudio - Error', { error: error.message, stack: error.stack });
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  async getAll(req, res) {
    try {
      const audios = await audioService.getAllAudios();
      res.status(200).json({
        success: true,
        data: audios
      });
    } catch (error) {
      logger.error('AudioService.getAllAudios - Error', { error: error.message, stack: error.stack });
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  async getById(req, res) {
    try {
      const audio = await audioService.getAudioById(req.params.id);
      res.status(200).json({
        success: true,
        data: audio
      });
    } catch (error) {
      logger.error('AudioService.getAudioById - Error', { error: error.message, stack: error.stack });
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  },

  async update(req, res) {
    try {
      logger.debug('AudioService.updateAudio - Starting', req.body);
      // If file uploaded, validate it
      if (req.file) {
        logger.debug('AudioService.updateAudio - Starting', req.file);
        const validationErrors = audioProcessor.validateAudioFile(req.file);
        if (validationErrors.length > 0) {
          await audioProcessor.deleteAudioFile(req.file.path);
          return res.status(400).json({
            success: false,
            message: 'File validation failed',
            errors: validationErrors
          });
        }
      }
      const audio = await audioService.updateAudio(req.params.id, req.body, req.file);
      res.status(200).json({
        success: true,
        data: audio
      });
    } catch (error) {
      logger.error('AudioService.updateAudio - Error', { error: error.message, stack: error.stack });
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  async delete(req, res) {
    try {
      const result = await audioService.deleteAudio(req.params.id);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  },

  async download(req, res) {
    try {
      const audio = await audioService.getAudioById(req.params.id);
      const filePath = path.join(__dirname, '../../', audio.file_url);
      logger.debug('AudioService.download - Starting', { filePath });
      res.download(filePath, `${audio.title}${path.extname(audio.file_url)}`);
    } catch (error) {
      logger.error('AudioService.download - Error', { error: error.message, stack: error.stack });
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  },

  async importLink(req, res) {
    const { url } = req.body;
    logger.info('AudioService.importLink - Starting', { url });
    try {
      if (!url) {
        return res.status(400).json({
          success: false,
          message: 'YouTube URL is required'
        });
      }

      const audio = await youtubeService.importLink(url);
      
      res.status(200).json({
        success: true,
        data: audio
      });
    } catch (error) {
      logger.error('AudioService.importLink - Error', { error: error.message, stack: error.stack });
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = audioController;