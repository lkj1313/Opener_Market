"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateSkip = calculateSkip;
exports.createPaginationMeta = createPaginationMeta;
exports.createPaginatedResult = createPaginatedResult;
function calculateSkip(page, limit) {
    return (page - 1) * limit;
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
