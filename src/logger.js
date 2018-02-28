const winston = require('winston');

const winstonPapertrail = new winston.transports.Papertrail({
    host: process.env.PAPERTRAIL_HOST,
    port: process.env.PAPERTRAIL_PORT,
    hostname: process.env.PAPERTRAIL_HOST_NAME,
    colorize: true,
    level: 'debug'
});

const logger = new winston.Logger({
    transports: [winstonPapertrail]
});

module.exports = logger;