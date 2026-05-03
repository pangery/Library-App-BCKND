const ValidationHelper = require('../validation-helper');
const authorDao = require('../author-dao');
const bookDao = require('../book-dao');
const UuAppError = require('../uu-app-error');

/**
 * Command book/create — validation, referential integrity, create book.
 * @returns {{ book: object|null, uuAppErrorMap: object }}
 */
function execute(dtoIn) {
  const validation = ValidationHelper.validateBookCreate(dtoIn);
  if (!validation.valid) {
    return { book: null, uuAppErrorMap: validation.uuAppErrorMap };
  }

  const author = authorDao.get(dtoIn.authorId);
  if (!author) {
    throw new UuAppError({
      code: 'authorNotFound',
      message: 'Autor se zadaným ID neexistuje.',
      params: { authorId: dtoIn.authorId },
    });
  }

  const book = bookDao.create({
    title: dtoIn.title,
    authorId: dtoIn.authorId,
    isbn: dtoIn.isbn,
  });

  return { book, uuAppErrorMap: {} };
}

module.exports = { execute };
