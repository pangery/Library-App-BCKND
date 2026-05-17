import { type FormEvent, useMemo, useState } from 'react';
import type { Author, Book } from '../types';
import { authorFullName, matchesSearch } from '../utils/helpers';
import { EmptyState } from './EmptyState';
import { IconBook, IconPlus } from './icons';
import { SearchField } from './SearchField';
import { SkeletonTable } from './Skeleton';

interface Props {
  books: Book[];
  authors: Author[];
  loading: boolean;
  highlightId: string | null;
  onCreate: (title: string, authorId: string, isbn?: string) => Promise<void>;
}

function authorLabel(authors: Author[], authorId: string): string {
  const author = authors.find((a) => a.id === authorId);
  return author ? authorFullName(author) : 'Neznámý autor';
}

export function BookPanel({ books, authors, loading, highlightId, onCreate }: Props) {
  const [title, setTitle] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [isbn, setIsbn] = useState('');
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formOpen, setFormOpen] = useState(true);

  const filtered = useMemo(() => {
    const sorted = [...books].sort((a, b) => a.title.localeCompare(b.title, 'cs'));
    return sorted.filter((b) => {
      const author = authorLabel(authors, b.authorId);
      return matchesSearch(search, b.title, b.isbn ?? '', author);
    });
  }, [books, authors, search]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !authorId) return;
    setSubmitting(true);
    try {
      await onCreate(title.trim(), authorId, isbn.trim() || undefined);
      setTitle('');
      setIsbn('');
    } finally {
      setSubmitting(false);
    }
  }

  const noAuthors = authors.length === 0;

  return (
    <section className="panel panel--books" aria-labelledby="books-heading">
      <div className="panel__top">
        <div className="panel__header">
          <div className="panel__title-wrap">
            <IconBook className="panel__icon" />
            <h2 id="books-heading" className="panel__title">
              Knihy
            </h2>
          </div>
          <span className="panel__badge">{books.length}</span>
        </div>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => setFormOpen((v) => !v)}
          aria-expanded={formOpen}
        >
          {formOpen ? 'Skrýt formulář' : 'Nová kniha'}
        </button>
      </div>

      {formOpen && (
        <form className="form form--card" onSubmit={handleSubmit}>
          <label className="field field--full">
            <span className="field__label">Název knihy</span>
            <input
              className="field__input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Malý princ"
              required
              disabled={submitting || noAuthors}
            />
          </label>
          <div className="form__row">
            <label className="field">
              <span className="field__label">Autor</span>
              <select
                className="field__input field__select"
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                required
                disabled={submitting || noAuthors}
              >
                <option value="">Vyberte autora</option>
                {[...authors]
                  .sort((a, b) => a.surname.localeCompare(b.surname, 'cs'))
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} {a.surname}
                    </option>
                  ))}
              </select>
            </label>
            <label className="field">
              <span className="field__label">
                ISBN <span className="field__optional">(volitelné)</span>
              </span>
              <input
                className="field__input"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="978-80-00-00000-0"
                disabled={submitting || noAuthors}
              />
            </label>
          </div>
          {noAuthors && (
            <p className="form__hint">Nejdříve přidejte alespoň jednoho autora.</p>
          )}
          <button
            type="submit"
            className="btn btn--primary"
            disabled={submitting || noAuthors}
          >
            <IconPlus className="btn__icon" />
            {submitting ? 'Ukládám…' : 'Přidat knihu'}
          </button>
        </form>
      )}

      {books.length > 2 && (
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Hledat knihu, autora, ISBN…"
        />
      )}

      <div className="list-wrap">
        {loading ? (
          <SkeletonTable rows={4} />
        ) : books.length === 0 ? (
          <EmptyState
            icon={<IconBook />}
            title="Žádné knihy"
            description={
              noAuthors
                ? 'Nejdříve přidejte autora, poté můžete přidat knihu.'
                : 'Přidejte první knihu pomocí formuláře výše.'
            }
          />
        ) : filtered.length === 0 ? (
          <p className="empty-inline">Žádná kniha neodpovídá hledání.</p>
        ) : (
          <ul className="book-grid">
            {filtered.map((book) => (
              <li
                key={book.id}
                className={`book-card ${highlightId === book.id ? 'book-card--new' : ''}`}
              >
                <div className="book-card__spine" aria-hidden />
                <div className="book-card__content">
                  <h3 className="book-card__title">{book.title}</h3>
                  <p className="book-card__author">{authorLabel(authors, book.authorId)}</p>
                  {book.isbn && <code className="book-card__isbn">{book.isbn}</code>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
