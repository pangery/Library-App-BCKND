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
  update: (id, data) => {
    const index = authors.findIndex((a) => a.id === id);
    if (index === -1) return null;
    authors[index] = { ...authors[index], ...data };
    return authors[index];
  },
  delete: (id) => {
    authors = authors.filter(a => a.id !== id);
  },
};

module.exports = AuthorDao;
