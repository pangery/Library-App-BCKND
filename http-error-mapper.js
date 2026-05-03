const UuAppError = require('./uu-app-error');

const CODE_TO_STATUS = {
  authorNotFound: 404,
  authorHasBooks: 409,
};

function uuAppErrorToResponseBody(err) {
  return {
    uuAppErrorMap: {
      [err.code]: {
        message: err.message,
        params: err.params,
      },
    },
  };
}

function handleCommandError(err, res, next) {
  if (err instanceof UuAppError) {
    const status = CODE_TO_STATUS[err.code] ?? 400;
    return res.status(status).json(uuAppErrorToResponseBody(err));
  }
  return next(err);
}

module.exports = { handleCommandError, uuAppErrorToResponseBody, CODE_TO_STATUS };
