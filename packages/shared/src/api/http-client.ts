interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | undefined>;
  body?: unknown;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function normalizeHeaders(
  headers?: HeadersInit,
): Record<string, string> {
  if (!headers) return {};
  if (headers instanceof Headers) {
    const obj: Record<string, string> = {};
    headers.forEach((v, k) => {
      obj[k] = v;
    });
    return obj;
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }
  return headers as Record<string, string>;
}

export interface HttpClientConfig {
  baseURL: string;
  getToken?: () => string | null;
}

export function createHttpClient(config: HttpClientConfig) {
  async function request<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const { params, body, headers, ...rest } = options;

    let url = `${config.baseURL}${endpoint}`;
    if (params) {
      const filtered = Object.entries(params).filter(([, v]) => v !== undefined);
      const query = new URLSearchParams(
        filtered.map(([k, v]) => [k, String(v)]),
      );
      if (query.toString()) url += `?${query.toString()}`;
    }

    const token = config.getToken?.();
    const finalHeaders: Record<string, string> = {
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

    const responseBody = await res.json();
    return responseBody?.data ?? responseBody;
  }

  return {
    get: <T>(
      endpoint: string,
      params?: Record<string, string | number | undefined>,
    ) => request<T>(endpoint, { method: 'GET', params }),

    post: <T>(endpoint: string, body?: unknown) =>
      request<T>(endpoint, { method: 'POST', body }),

    patch: <T>(endpoint: string, body?: unknown) =>
      request<T>(endpoint, { method: 'PATCH', body }),

    delete: <T>(endpoint: string) =>
      request<T>(endpoint, { method: 'DELETE' }),
  };
}

export type HttpClient = ReturnType<typeof createHttpClient>;
