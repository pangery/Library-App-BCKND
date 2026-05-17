import { useCallback, useEffect, useState } from 'react';
import { api, getErrorMessage } from './api/client';
import { AuthorPanel } from './components/AuthorPanel';
import { BookPanel } from './components/BookPanel';
import { Header } from './components/Header';
import { ToastContainer } from './components/ToastContainer';
import { useToast } from './hooks/useToast';
import type { Author, Book } from './types';

function useHighlight() {
  const [id, setId] = useState<string | null>(null);

  const flash = useCallback((entityId: string) => {
    setId(entityId);
    const t = setTimeout(() => setId(null), 2200);
    return () => clearTimeout(t);
  }, []);

  return { highlightId: id, flash };
}

export default function App() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loadingAuthors, setLoadingAuthors] = useState(true);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [backendDown, setBackendDown] = useState(false);
  const { toasts, show, dismiss } = useToast();
  const { highlightId, flash } = useHighlight();

  const refreshAuthors = useCallback(async () => {
    setLoadingAuthors(true);
    try {
      const data = await api.listAuthors();
      setAuthors(data);
      setBackendDown(false);
    } catch {
      setBackendDown(true);
    } finally {
      setLoadingAuthors(false);
    }
  }, []);

  const refreshBooks = useCallback(async () => {
    setLoadingBooks(true);
    try {
      const data = await api.listBooks();
      setBooks(data);
      setBackendDown(false);
    } catch {
      setBackendDown(true);
    } finally {
      setLoadingBooks(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshAuthors(), refreshBooks()]);
    setRefreshing(false);
  }, [refreshAuthors, refreshBooks]);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  async function handleCreateAuthor(name: string, surname: string) {
    try {
      const author = await api.createAuthor(name, surname);
      setAuthors((prev) => [...prev, author]);
      flash(author.id);
      show(`Autor ${author.name} ${author.surname} byl přidán.`, 'success');
    } catch (err) {
      show(getErrorMessage(err), 'error');
    }
  }

  async function handleUpdateAuthor(id: string, name: string, surname: string) {
    try {
      const author = await api.updateAuthor(id, name, surname);
      setAuthors((prev) => prev.map((a) => (a.id === id ? author : a)));
      flash(author.id);
      show(`Autor ${author.name} ${author.surname} byl upraven.`, 'success');
    } catch (err) {
      show(getErrorMessage(err), 'error');
    }
  }

  async function handleDeleteAuthor(id: string) {
    try {
      await api.deleteAuthor(id);
      setAuthors((prev) => prev.filter((a) => a.id !== id));
      show('Autor byl smazán.', 'success');
    } catch (err) {
      show(getErrorMessage(err), 'error');
    }
  }

  async function handleCreateBook(title: string, authorId: string, isbn?: string) {
    try {
      const book = await api.createBook(title, authorId, isbn);
      setBooks((prev) => [...prev, book]);
      flash(book.id);
      show(`Kniha „${book.title}" byla přidána.`, 'success');
    } catch (err) {
      show(getErrorMessage(err), 'error');
    }
  }

  return (
    <div className="app">
      <div className="app__bg" aria-hidden />
      <div className="app__grain" aria-hidden />
      <div className="app__container">
        <Header
          authorCount={authors.length}
          bookCount={books.length}
          onRefresh={() => void refreshAll()}
          refreshing={refreshing}
        />

        {backendDown && (
          <div className="banner banner--error" role="alert">
            Aplikace není dostupná
          </div>
        )}

        <main className="main">
          <AuthorPanel
            authors={authors}
            books={books}
            loading={loadingAuthors}
            highlightId={highlightId}
            onCreate={handleCreateAuthor}
            onUpdate={handleUpdateAuthor}
            onDelete={handleDeleteAuthor}
          />
          <BookPanel
            books={books}
            authors={authors}
            loading={loadingBooks}
            highlightId={highlightId}
            onCreate={handleCreateBook}
          />
        </main>

        <footer className="footer">
          <span>Library App</span>
          <span className="footer__dot" aria-hidden>·</span>
          <span>správa knihovny</span>
          <span>Created by <a href="https://github.com/pangery" target="_blank" rel="noopener noreferrer">pangery</a></span>
        </footer>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
