import type { ApiError, Author, Book, UuAppErrorMap } from '../types';

/** Relativní URL — API i UI běží na stejném originu (jedna aplikace). */
const API_BASE = import.meta.env.VITE_API_URL ?? '';

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<{ data: T; status: number }> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  let body: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      const preMatch = text.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
      const message = preMatch ? preMatch[1].trim() : text.slice(0, 200);
      body = { message };
    }
  }

  if (!res.ok) {
    const err = new Error('API request failed') as ApiError;
    err.status = res.status;
    if (body && typeof body === 'object' && 'uuAppErrorMap' in body) {
      err.uuAppErrorMap = (body as { uuAppErrorMap: UuAppErrorMap }).uuAppErrorMap;
    } else if (body && typeof body === 'object' && 'message' in body) {
      err.message = String((body as { message: string }).message);
    }
    throw err;
  }

  return { data: body as T, status: res.status };
}

function hasUuErrors(map?: UuAppErrorMap): boolean {
  return !!map && Object.keys(map).length > 0;
}

function formatUuErrors(map: UuAppErrorMap): string {
  return Object.entries(map)
    .map(([, entry]) => entry.message)
    .join(' ');
}

export const api = {
  async listAuthors(): Promise<Author[]> {
    const { data } = await request<Author[]>('/author/list');
    return data;
  },

  async createAuthor(name: string, surname: string): Promise<Author> {
    const { data } = await request<Author>('/author/create', {
      method: 'POST',
      body: JSON.stringify({ name, surname }),
    });
    return data;
  },

  async updateAuthor(id: string, name: string, surname: string): Promise<Author> {
    const { data } = await request<{ author: Author | null; uuAppErrorMap: UuAppErrorMap }>(
      '/author/update',
      {
        method: 'POST',
        body: JSON.stringify({ id, name, surname }),
      },
    );

    if (hasUuErrors(data.uuAppErrorMap)) {
      const err = new Error(formatUuErrors(data.uuAppErrorMap)) as ApiError;
      err.status = 400;
      err.uuAppErrorMap = data.uuAppErrorMap;
      throw err;
    }

    if (!data.author) {
      throw new Error('Autor nebyl aktualizován.');
    }

    return data.author;
  },

  async deleteAuthor(id: string): Promise<void> {
    const { data, status } = await request<{
      dtoOut: Record<string, unknown>;
      uuAppErrorMap: UuAppErrorMap;
    }>('/author/delete', {
      method: 'POST',
      body: JSON.stringify({ id }),
    });

    if (status === 400 && hasUuErrors(data.uuAppErrorMap)) {
      const err = new Error(formatUuErrors(data.uuAppErrorMap)) as ApiError;
      err.status = 400;
      err.uuAppErrorMap = data.uuAppErrorMap;
      throw err;
    }
  },

  async listBooks(): Promise<Book[]> {
    const { data } = await request<Book[]>('/book/list');
    return data;
  },

  async createBook(
    title: string,
    authorId: string,
    isbn?: string,
  ): Promise<Book> {
    const payload: { title: string; authorId: string; isbn?: string } = {
      title,
      authorId,
    };
    if (isbn?.trim()) payload.isbn = isbn.trim();

    const { data } = await request<{ book: Book | null; uuAppErrorMap: UuAppErrorMap }>(
      '/book/create',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );

    if (hasUuErrors(data.uuAppErrorMap)) {
      const err = new Error(formatUuErrors(data.uuAppErrorMap)) as ApiError;
      err.status = 400;
      err.uuAppErrorMap = data.uuAppErrorMap;
      throw err;
    }

    if (!data.book) {
      throw new Error('Kniha nebyla vytvořena.');
    }

    return data.book;
  },
};

export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    const apiErr = err as ApiError;
    if (apiErr.uuAppErrorMap) {
      return formatUuErrors(apiErr.uuAppErrorMap);
    }
    return err.message;
  }
  return 'Neočekávaná chyba.';
}
