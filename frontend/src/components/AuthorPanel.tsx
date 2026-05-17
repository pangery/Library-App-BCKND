import { type FormEvent, useEffect, useMemo, useState } from 'react';
import type { Author, Book } from '../types';
import {
  authorFullName,
  authorInitials,
  bookCountByAuthor,
  matchesSearch,
} from '../utils/helpers';
import { EmptyState } from './EmptyState';
import { IconEdit, IconPlus, IconTrash, IconUsers } from './icons';
import { SearchField } from './SearchField';
import { SkeletonTable } from './Skeleton';

interface Props {
  authors: Author[];
  books: Book[];
  loading: boolean;
  highlightId: string | null;
  onCreate: (name: string, surname: string) => Promise<void>;
  onUpdate: (id: string, name: string, surname: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function AuthorPanel({
  authors,
  books,
  loading,
  highlightId,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSurname, setEditSurname] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(true);

  const filtered = useMemo(() => {
    const sorted = [...authors].sort((a, b) =>
      a.surname.localeCompare(b.surname, 'cs'),
    );
    return sorted.filter((a) =>
      matchesSearch(search, a.name, a.surname, authorFullName(a)),
    );
  }, [authors, search]);

  useEffect(() => {
    if (!confirmId && !editId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setConfirmId(null);
        setEditId(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [confirmId, editId]);

  function openEdit(author: Author) {
    setEditId(author.id);
    setEditName(author.name);
    setEditSurname(author.surname);
    setConfirmId(null);
  }

  function closeEdit() {
    setEditId(null);
    setEditName('');
    setEditSurname('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !surname.trim()) return;
    setSubmitting(true);
    try {
      await onCreate(name.trim(), surname.trim());
      setName('');
      setSurname('');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(e: FormEvent) {
    e.preventDefault();
    if (!editId || !editName.trim() || !editSurname.trim()) return;
    setUpdatingId(editId);
    try {
      await onUpdate(editId, editName.trim(), editSurname.trim());
      closeEdit();
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await onDelete(id);
      setConfirmId(null);
    } finally {
      setDeletingId(null);
    }
  }

  const authorToConfirm = authors.find((a) => a.id === confirmId);
  const confirmBookCount = authorToConfirm
    ? bookCountByAuthor(books, authorToConfirm.id)
    : 0;

  return (
    <section className="panel panel--authors" aria-labelledby="authors-heading">
      <div className="panel__top">
        <div className="panel__header">
          <div className="panel__title-wrap">
            <IconUsers className="panel__icon" />
            <h2 id="authors-heading" className="panel__title">
              Autoři
            </h2>
          </div>
          <span className="panel__badge">{authors.length}</span>
        </div>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => setFormOpen((v) => !v)}
          aria-expanded={formOpen}
        >
          {formOpen ? 'Skrýt formulář' : 'Nový autor'}
        </button>
      </div>

      {formOpen && (
        <form className="form form--card" onSubmit={handleSubmit}>
          <div className="form__row">
            <label className="field">
              <span className="field__label">Jméno</span>
              <input
                className="field__input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jan"
                required
                disabled={submitting}
                autoComplete="given-name"
              />
            </label>
            <label className="field">
              <span className="field__label">Příjmení</span>
              <input
                className="field__input"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                placeholder="Novák"
                required
                disabled={submitting}
                autoComplete="family-name"
              />
            </label>
          </div>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            <IconPlus className="btn__icon" />
            {submitting ? 'Ukládám…' : 'Přidat autora'}
          </button>
        </form>
      )}

      {authors.length > 2 && (
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Hledat autora…"
        />
      )}

      <div className="list-wrap">
        {loading ? (
          <SkeletonTable rows={3} />
        ) : authors.length === 0 ? (
          <EmptyState
            icon={<IconUsers />}
            title="Žádní autoři"
            description="Přidejte prvního autora pomocí formuláře výše."
          />
        ) : filtered.length === 0 ? (
          <p className="empty-inline">Žádný autor neodpovídá hledání.</p>
        ) : (
          <ul className="entity-list">
            {filtered.map((author) => {
              const count = bookCountByAuthor(books, author.id);
              const canDelete = count === 0;
              return (
                <li
                  key={author.id}
                  className={`entity-card ${highlightId === author.id ? 'entity-card--new' : ''}`}
                >
                  <div className="entity-card__avatar" aria-hidden>
                    {authorInitials(author.name, author.surname)}
                  </div>
                  <div className="entity-card__body">
                    <span className="entity-card__name">
                      {author.name} {author.surname}
                    </span>
                    <span className="entity-card__meta">
                      {count === 0
                        ? 'Bez knih'
                        : count === 1
                          ? '1 kniha'
                          : count < 5
                            ? `${count} knihy`
                            : `${count} knih`}
                    </span>
                  </div>
                  <div className="entity-card__actions">
                    <button
                      type="button"
                      className="btn btn--icon btn--ghost"
                      onClick={() => openEdit(author)}
                      disabled={updatingId === author.id}
                      title="Upravit autora"
                      aria-label={`Upravit ${author.name} ${author.surname}`}
                    >
                      <IconEdit className="btn__icon" />
                    </button>
                    <button
                      type="button"
                      className="btn btn--icon btn--ghost-danger"
                      onClick={() => setConfirmId(author.id)}
                      disabled={deletingId === author.id}
                      title={
                        canDelete
                          ? 'Smazat autora'
                          : 'Autora s knihami nelze smazat'
                      }
                      aria-label={`Smazat ${author.name} ${author.surname}`}
                    >
                      <IconTrash className="btn__icon" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {editId && (
        <div className="modal-backdrop" role="presentation" onClick={closeEdit}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-author-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="edit-author-title" className="modal__title">
              Upravit autora
            </h3>
            <form className="form" onSubmit={handleUpdate}>
              <div className="form__row">
                <label className="field">
                  <span className="field__label">Jméno</span>
                  <input
                    className="field__input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    disabled={!!updatingId}
                    autoFocus
                  />
                </label>
                <label className="field">
                  <span className="field__label">Příjmení</span>
                  <input
                    className="field__input"
                    value={editSurname}
                    onChange={(e) => setEditSurname(e.target.value)}
                    required
                    disabled={!!updatingId}
                  />
                </label>
              </div>
              <div className="modal__actions">
                <button type="button" className="btn btn--ghost" onClick={closeEdit}>
                  Zrušit
                </button>
                <button type="submit" className="btn btn--primary" disabled={!!updatingId}>
                  {updatingId ? 'Ukládám…' : 'Uložit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {authorToConfirm && (
        <div className="modal-backdrop" role="presentation" onClick={() => setConfirmId(null)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-author-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="delete-author-title" className="modal__title">
              Smazat autora?
            </h3>
            <p className="modal__text">
              Opravdu chcete smazat{' '}
              <strong>
                {authorToConfirm.name} {authorToConfirm.surname}
              </strong>
              ?
              {confirmBookCount > 0 && (
                <span className="modal__warn">
                  {' '}
                  Autor má {confirmBookCount} knih — smazání není možné.
                </span>
              )}
            </p>
            <div className="modal__actions">
              <button type="button" className="btn btn--ghost" onClick={() => setConfirmId(null)}>
                Zrušit
              </button>
              <button
                type="button"
                className="btn btn--danger"
                onClick={() => handleDelete(authorToConfirm.id)}
                disabled={deletingId === authorToConfirm.id || confirmBookCount > 0}
              >
                {deletingId === authorToConfirm.id ? 'Mažu…' : 'Smazat'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
