export interface Author {
  id: string;
  name: string;
  surname: string;
}

export interface Book {
  id: string;
  title: string;
  authorId: string;
  isbn: string | null;
}

export interface UuAppErrorEntry {
  message: string;
  params?: Record<string, unknown>;
}

export type UuAppErrorMap = Record<string, UuAppErrorEntry>;

export interface ApiError extends Error {
  status: number;
  uuAppErrorMap?: UuAppErrorMap;
}
