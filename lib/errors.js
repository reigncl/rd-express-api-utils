/* eslint no-unused-vars:off */
const logger = require('./logger');

const error = (defaultMessage, statusCode) => {
  let makeCustomError = function (message, errorCode) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message || defaultMessage;
    this.statusCode = statusCode;
    this.errorCode = errorCode || statusCode;
  };

  makeCustomError.prototype.toString = function(){
    return this.message;
  }

  return makeCustomError;
};

module.exports = {
  BadRequest: error('The request could not be understood by the server due to malformed syntax.', 400),
  Unauthorized: error('The request requires user authentication', 401),
  Forbidden: error('The server understood the request, but is refusing to fulfill it', 403),
  NotFound: error('The requested resource couldn\'t be found', 404),
  Conflict: error('The request could not be completed due to a conflict with the current state of the resource', 409),
  InternalServerError: error('The server encountered an unexpected condition which prevented it from fulfilling the request', 500),
  NotImplemented: error('The server does not support the functionality required to fulfill the request', 501),
  custom: (message, statusCode, errorCode) => new (error(message, statusCode))(message, errorCode),
  expressErrorHandler: (err, req, res, next) => {
    logger.error(err.stack || err);
    res.status(err.statusCode || 500)
      .json({
        errCode: err.errCode || 500,
        statusCode: err.statusCode || 500,
        message: err.message || 'The server encountered an unexpected condition which prevented it from fulfilling the request',
      });
  },
};

