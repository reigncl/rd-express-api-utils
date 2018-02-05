const error = (defaultMessage, statusCode) => function(message, errorCode) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message || defaultMessage;
    this.statusCode = statusCode;
    this.errorCode = errorCode || statusCode;
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
    expressErrorHandler: (error, req, res, next) => {
      res.status(error.statusCode || 500)
      .json({ errorCode: error.errorCode || 500, statusCode: error.statusCode || 500, message: error.message || 'The server encountered an unexpected condition which prevented it from fulfilling the request' });
    }
  };
  
  