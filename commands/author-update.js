const ValidationHelper = require('../validation-helper');
const authorDao = require('../author-dao');
const UuAppError = require('../uu-app-error');

/**
 * Command author/update — validation, existence, update name/surname.
 * @returns {{ author: object|null, uuAppErrorMap: object }}
 */
function execute(dtoIn) {
  const validation = ValidationHelper.validateAuthorUpdate(dtoIn);
  if (!validation.valid) {
    return { author: null, uuAppErrorMap: validation.uuAppErrorMap };
  }

  const author = authorDao.get(dtoIn.id);
  if (!author) {
    throw new UuAppError({
      code: 'authorNotFound',
      message: 'Autor se zadaným ID neexistuje.',
      params: { id: dtoIn.id },
    });
  }

  const updated = authorDao.update(dtoIn.id, {
    name: dtoIn.name.trim(),
    surname: dtoIn.surname.trim(),
  });

  return { author: updated, uuAppErrorMap: {} };
}

module.exports = { execute };
