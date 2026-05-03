const express = require('express');
const bodyParser = require('body-parser');
const authorDao = require('./author-dao');
const bookDao = require('./book-dao');
const bookCreateCommand = require('./commands/book-create');
const authorDeleteCommand = require('./commands/author-delete');
const { handleCommandError } = require('./http-error-mapper');

const app = express();
app.use(bodyParser.json());

// --- COMMANDS: AUTHOR ---

// UC1: Vytvoření autora
app.post('/author/create', (req, res) => {
  const { name, surname } = req.body;

  if (!name || !surname) {
    return res.status(400).json({ error: 'invalidDtoIn', message: 'Name and surname are required.' });
  }

  const newAuthor = authorDao.create({ name, surname });
  res.status(201).json(newAuthor);
});

// UC2: Seznam autorů
app.get('/author/list', (req, res) => {
  res.json(authorDao.list());
});

// Command: author/delete
app.post('/author/delete', (req, res, next) => {
  try {
    const result = authorDeleteCommand.execute(req.body);
    const hasErrors = Object.keys(result.uuAppErrorMap).length > 0;
    const status = hasErrors ? 400 : 200;
    res.status(status).json({
      dtoOut: result.dtoOut,
      uuAppErrorMap: result.uuAppErrorMap,
    });
  } catch (err) {
    handleCommandError(err, res, next);
  }
});

// --- COMMANDS: BOOK ---

// Command: book/create
app.post('/book/create', (req, res, next) => {
  try {
    const result = bookCreateCommand.execute(req.body);
    const hasValidationErrors =
      result.uuAppErrorMap && Object.keys(result.uuAppErrorMap).length > 0;
    if (hasValidationErrors) {
      return res.status(400).json({
        book: result.book,
        uuAppErrorMap: result.uuAppErrorMap,
      });
    }
    return res.status(201).json({
      book: result.book,
      uuAppErrorMap: result.uuAppErrorMap,
    });
  } catch (err) {
    handleCommandError(err, res, next);
  }
});

// UC4: Seznam knih
app.get('/book/list', (req, res) => {
  res.json(bookDao.list());
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
