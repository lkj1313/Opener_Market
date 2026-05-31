"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHttpClient = createHttpClient;
class ApiError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}
function normalizeHeaders(headers) {
    if (!headers)
        return {};
    if (headers instanceof Headers) {
        const obj = {};
        headers.forEach((v, k) => {
            obj[k] = v;
        });
        return obj;
    }
    if (Array.isArray(headers)) {
        return Object.fromEntries(headers);
    }
    return headers;
}
function createHttpClient(config) {
    async function request(endpoint, options = {}) {
        const { params, body, headers, ...rest } = options;
        let url = `${config.baseURL}${endpoint}`;
        if (params) {
            const filtered = Object.entries(params).filter(([, v]) => v !== undefined);
            const query = new URLSearchParams(filtered.map(([k, v]) => [k, String(v)]));
            if (query.toString())
                url += `?${query.toString()}`;
        }
        const token = config.getToken?.();
        const finalHeaders = {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...normalizeHeaders(headers),
        };
        const res = await fetch(url, {
            ...rest,
            headers: finalHeaders,
            body: body ? JSON.stringify(body) : undefined,
        });
        if (!res.ok) {
            const errorBody = await res.json().catch(() => ({ message: 'Unknown error' }));
            throw new ApiError(res.status, errorBody.message || `HTTP ${res.status}`);
        }
        return res.json();
    }
    return {
        get: (endpoint, params) => request(endpoint, { method: 'GET', params }),
        post: (endpoint, body) => request(endpoint, { method: 'POST', body }),
        patch: (endpoint, body) => request(endpoint, { method: 'PATCH', body }),
        delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
    };
}
