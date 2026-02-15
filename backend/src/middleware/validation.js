const Joi = require('joi');
const logger = require('../utils/logger');

const validate = (schema) => {
  return (req, res, next) => {
    logger.debug('Validation middleware - Starting', { body: req.body });
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      logger.error('Validation middleware - Error', { errors });

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    logger.debug('Validation middleware - Starting', { query: req.query });
    const { error } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });


    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      logger.error('Validation middleware - Error', { errors });

      return res.status(400).json({
        success: false,
        message: 'Query validation failed',
        errors
      });
    }

    next();
  };
};

const validateParams = (schema) => {
  return (req, res, next) => {
    logger.debug('Validation middleware - Starting', { params: req.params });
    const { error } = schema.validate(req.params, {
      abortEarly: false
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      logger.error('Validation middleware - Error', { errors });

      return res.status(400).json({
        success: false,
        message: 'Parameter validation failed',
        errors
      });
    }

    next();
  };
};

module.exports = { validate, validateQuery, validateParams };