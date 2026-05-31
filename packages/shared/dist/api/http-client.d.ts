export declare class ApiError extends Error {
    status: number;
    constructor(status: number, message: string);
}
export interface HttpClientConfig {
    baseURL: string;
    getToken?: () => string | null;
}
export declare function createHttpClient(config: HttpClientConfig): {
    get: <T>(endpoint: string, params?: Record<string, string | number | undefined>) => Promise<T>;
    post: <T>(endpoint: string, body?: unknown) => Promise<T>;
    patch: <T>(endpoint: string, body?: unknown) => Promise<T>;
    delete: <T>(endpoint: string) => Promise<T>;
};
export type HttpClient = ReturnType<typeof createHttpClient>;
