import { PaginationMeta, PaginatedResult } from './pagination.type.js';
export declare function calculateSkip(page: number, limit: number): number;
export declare function createPaginationMeta(total: number, page: number, limit: number): PaginationMeta;
export declare function createPaginatedResult<T>(data: T[], total: number, page: number, limit: number): PaginatedResult<T>;
