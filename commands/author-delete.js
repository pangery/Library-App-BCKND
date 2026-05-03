const ValidationHelper = require('../validation-helper');
const authorDao = require('../author-dao');
const bookDao = require('../book-dao');
const UuAppError = require('../uu-app-error');

/**
 * Command author/delete — validation, existence, no dependent books, delete.
 * @returns {{ dtoOut: object, uuAppErrorMap: object }}
 */
function execute(dtoIn) {
  const validation = ValidationHelper.validateAuthorDelete(dtoIn);
  if (!validation.valid) {
    return { dtoOut: {}, uuAppErrorMap: validation.uuAppErrorMap };
  }

  const author = authorDao.get(dtoIn.id);
  if (!author) {
    throw new UuAppError({
      code: 'authorNotFound',
      message: 'Autor se zadaným ID neexistuje.',
      params: { id: dtoIn.id },
    });
  }

  const bookList = bookDao.listByAuthor(dtoIn.id);
  if (bookList.itemList.length > 0) {
    throw new UuAppError({
      code: 'authorHasBooks',
      message: 'Nelze smazat autora, který má přiřazené knihy.',
      params: { bookCount: bookList.itemList.length },
    });
  }

  authorDao.delete(dtoIn.id);
  return { dtoOut: {}, uuAppErrorMap: {} };
}

module.exports = { execute };
