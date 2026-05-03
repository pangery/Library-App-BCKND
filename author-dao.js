const { v4: uuidv4 } = require('uuid');

let authors = []; // Simulace DB

const AuthorDao = {
  create: (data) => {
    const newAuthor = { id: uuidv4(), ...data };
    authors.push(newAuthor);
    return newAuthor;
  },
  get: (id) => authors.find(a => a.id === id),
  list: () => authors,
  delete: (id) => {
    authors = authors.filter(a => a.id !== id);
  }
};

module.exports = AuthorDao;
