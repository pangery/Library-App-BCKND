const { v4: uuidv4 } = require('uuid');

let books = [];

const BookDao = {
  create: (data) => {
    const newBook = { id: uuidv4(), ...data };
    books.push(newBook);
    return newBook;
  },
  list: () => books,
  listByAuthor: (authorId) => ({
    itemList: books.filter((b) => b.authorId === authorId),
  }),
};

module.exports = BookDao;
