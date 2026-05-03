/**
 * Application error matching uuApp error contract (code, message, params).
 */
class UuAppError extends Error {
  constructor({ code, message, params = {} }) {
    super(message);
    this.name = 'UuAppError';
    this.code = code;
    this.message = message;
    this.params = params;
  }
}

module.exports = UuAppError;
