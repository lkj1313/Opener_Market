import { PaginationMeta, PaginatedResult } from './pagination.type.js';

export function calculateSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}

export function createPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export function createPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return {
    data,
    meta: createPaginationMeta(total, page, limit),
  };
}
