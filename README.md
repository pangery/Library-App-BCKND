# Library App — Backend

Backendová část aplikace pro správu knihovny: **dvě propojené entity** (Autor, Kniha), REST API postavené na **Node.js** a **Express**. Bez registrace a přihlášení — veřejný přístup ke všem operacím.

## Požadavky

- [Node.js](https://nodejs.org/) (LTS)
- npm

## Instalace a spuštění

```bash
npm install
npm start
```

Server naslouchá na **http://localhost:3000**.

## API (přehled)

| Metoda | Endpoint | Popis |
|--------|----------|--------|
| `POST` | `/author/create` | Vytvoření autora (`name`, `surname`) |
| `GET` | `/author/list` | Seznam autorů |
| `POST` | `/author/delete` | Smazání autora (`id`) — nelze, pokud má knihy |
| `POST` | `/book/create` | Vytvoření knihy (`title`, `authorId`, `isbn`) |
| `GET` | `/book/list` | Seznam knih |

Příkazy `book/create` a `author/delete` vrací strukturu s `uuAppErrorMap` a při chybách referenční integrity používají sjednocené chybové kódy (`authorNotFound`, `authorHasBooks`, …).

## Technologie

- Express.js
- Úložiště dat v paměti (DAO moduly) — vhodné pro vývoj a školní úkoly

## Repozitář

- **GitHub:** [pangery/Library-App-BCKND](https://github.com/pangery/Library-App-BCKND)
- Název repozitáře: **Library-App-BCKND** (backend; frontend může být v samostatném repu dle zadání)

## Licence

Soukromý / školní projekt.
