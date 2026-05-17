import type { Author, Book } from '../types';

export function authorInitials(name: string, surname: string): string {
  return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
}

export function bookCountByAuthor(books: Book[], authorId: string): number {
  return books.filter((b) => b.authorId === authorId).length;
}

export function authorFullName(author: Author): string {
  return `${author.name} ${author.surname}`;
}

export function normalizeSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

export function matchesSearch(query: string, ...fields: string[]): boolean {
  if (!query.trim()) return true;
  const q = normalizeSearch(query);
  return fields.some((f) => normalizeSearch(f).includes(q));
}
