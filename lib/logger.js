const winston = require('winston');
const { LogstashUDP } = require('winston-logstash-udp');
const project = require('../package.json');

const winstonTransports = [
  new winston.transports.Console({
    level: process.env.LOG_LEVEL || 'silly',
    colorize: true,
    timestamp() {
      return new Date().toString();
    }
  })
];

if (process.env.LOGSTASH_UDP_PORT && process.env.LOGSTASH_UDP_HOST) {
  const transport = new LogstashUDP({
    host: process.env.LOGSTASH_UDP_HOST,
    port: process.env.LOGSTASH_UDP_PORT,
    appName: process.env.LOGSTASH_UDP_APPNAME || `${process.env.NODE_ENV}-${project.name}-${project.version}`
  });

  winstonTransports.push(transport);
}
const logger = new winston.Logger({
  transports: winstonTransports
});

logger.stream = {
  write: (message, encoding) => {
    logger.info(message);
  }
};

module.exports = logger;
