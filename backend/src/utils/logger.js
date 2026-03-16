const fs = require('fs');
const path = require('path');
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new DailyRotateFile({
            filename: 'logs/error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '7d',
            auditFile: 'logs/.audit.json'
        }),
        new DailyRotateFile({ filename: 'logs/warn-%DATE%.log', datePattern: 'YYYY-MM-DD', level: 'warn', zippedArchive: true, maxSize: '20m', maxFiles: '7d', auditFile: 'logs/.audit.json' }),
        new DailyRotateFile({ filename: 'logs/info-%DATE%.log', datePattern: 'YYYY-MM-DD', level: 'info', zippedArchive: true, maxSize: '20m', maxFiles: '7d', auditFile: 'logs/.audit.json' }),
        new DailyRotateFile({ filename: 'logs/debug-%DATE%.log', datePattern: 'YYYY-MM-DD', level: 'debug', zippedArchive: true, maxSize: '20m', maxFiles: '7d', auditFile: 'logs/.audit.json' }),
        new DailyRotateFile({
            filename: 'logs/combined-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '7d'
        })
    ],
    exceptionHandlers: [
        new DailyRotateFile({
            filename: path.join(logDir, 'exceptions-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxFiles: '14d'
        })
    ],

    rejectionHandlers: [
        new DailyRotateFile({
            filename: path.join(logDir, 'rejections-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxFiles: '14d'
        })
    ],
});

// If we're not in production, log to the console with pretty colors
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        ),
    }));
}

module.exports = logger;