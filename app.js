const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const authorDao = require('./author-dao');
const bookDao = require('./book-dao');
const bookCreateCommand = require('./commands/book-create');
const authorDeleteCommand = require('./commands/author-delete');
const authorUpdateCommand = require('./commands/author-update');
const { handleCommandError } = require('./http-error-mapper');

const app = express();
const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV !== 'production';
const frontendDir = path.join(__dirname, 'frontend');
const distDir = path.join(frontendDir, 'dist');

app.use(bodyParser.json());

// --- API: AUTHOR ---

app.post('/author/create', (req, res) => {
  const { name, surname } = req.body;

  if (!name || !surname) {
    return res.status(400).json({ error: 'invalidDtoIn', message: 'Name and surname are required.' });
  }

  const newAuthor = authorDao.create({ name, surname });
  res.status(201).json(newAuthor);
});

app.get('/author/list', (req, res) => {
  res.json(authorDao.list());
});

app.post('/author/update', (req, res, next) => {
  try {
    const result = authorUpdateCommand.execute(req.body);
    const hasErrors = Object.keys(result.uuAppErrorMap).length > 0;
    if (hasErrors) {
      return res.status(400).json({
        author: result.author,
        uuAppErrorMap: result.uuAppErrorMap,
      });
    }
    return res.status(200).json({
      author: result.author,
      uuAppErrorMap: result.uuAppErrorMap,
    });
  } catch (err) {
    handleCommandError(err, res, next);
  }
});

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

// --- API: BOOK ---

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

app.get('/book/list', (req, res) => {
  res.json(bookDao.list());
});

async function setupFrontend() {
  if (isDev) {
    const viteEntry = path.join(frontendDir, 'node_modules', 'vite', 'dist', 'node', 'index.js');
    if (!fs.existsSync(viteEntry)) {
      console.error('Chybí frontend závislosti. Spusťte: npm install --prefix frontend');
      process.exit(1);
    }
    const { createServer } = await import(pathToFileURL(viteEntry).href);
    const vite = await createServer({
      root: frontendDir,
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    return;
  }

  const indexHtml = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexHtml)) {
    console.error('Frontend není sestavený. Spusťte: npm run build');
    process.exit(1);
  }

  app.use(express.static(distDir));
  app.get('*', (req, res, next) => {
    if (req.method !== 'GET') return next();
    res.sendFile(indexHtml, (err) => (err ? next(err) : undefined));
  });
}

async function start() {
  await setupFrontend();
  app.listen(PORT, () => {
    const mode = isDev ? 'vývoj' : 'produkce';
    console.log(`Knihovna běží (${mode}) → http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
