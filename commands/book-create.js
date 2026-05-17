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

  const isbn =
    typeof dtoIn.isbn === 'string' && dtoIn.isbn.trim() !== ''
      ? dtoIn.isbn.trim()
      : null;

  const book = bookDao.create({
    title: dtoIn.title.trim(),
    authorId: dtoIn.authorId,
    isbn,
  });

  return { book, uuAppErrorMap: {} };
}

module.exports = { execute };
