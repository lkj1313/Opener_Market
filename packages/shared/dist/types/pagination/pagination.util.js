"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateSkip = calculateSkip;
exports.normalizePagination = normalizePagination;
exports.createPaginationMeta = createPaginationMeta;
exports.createPaginatedResult = createPaginatedResult;
function calculateSkip(page, limit) {
    return (page - 1) * limit;
}
function normalizePagination(page, limit, maxLimit = 100, defaultLimit = 20) {
    const normalizedPage = Math.max(1, page ?? 1);
    const normalizedLimit = Math.max(1, Math.min(maxLimit, limit ?? defaultLimit));
    return { page: normalizedPage, limit: normalizedLimit };
}
function createPaginationMeta(total, page, limit) {
    return {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}
function createPaginatedResult(data, total, page, limit) {
    return {
        data,
        meta: createPaginationMeta(total, page, limit),
    };
}
