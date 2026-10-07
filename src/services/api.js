/**
 * Central API client for DevVerse.
 *
 * - Base URL comes from VITE_API_URL (empty means same-origin, which is what
 *   the Vite dev middleware / the Express static build serve).
 * - JSON in, JSON out, automatic Bearer token, consistent error shape.
 * - Network failures surface as ApiUnavailableError so pages can render a
 *   real "backend unavailable" state instead of a blank screen.
 */

const rawBase = import.meta.env.VITE_API_URL ?? '';
export const API_BASE = String(rawBase).replace(/\/+$/, '');

const TOKEN_KEY = 'devverse_auth_token';
const UNAUTHORIZED_EVENT = 'devverse:unauthorized';

export class ApiError extends Error {
  constructor(message, { status = 0, payload = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

/** The backend could not be reached at all (offline, not started, blocked). */
export class ApiUnavailableError extends ApiError {
  constructor(message = 'Unable to reach the DevVerse API.') {
    super(message, { status: 0 });
    this.name = 'ApiUnavailableError';
  }
}

export const getToken = () => {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token) => {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage disabled */
  }
};

export const clearToken = () => setToken(null);

/** Fired when the API answers 401 so AuthContext can drop the stale session. */
export const onUnauthorized = (handler) => {
  const listener = () => handler();
  window.addEventListener(UNAUTHORIZED_EVENT, listener);
  return () => window.removeEventListener(UNAUTHORIZED_EVENT, listener);
};

const buildUrl = (path) => {
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
};

const extractMessage = (payload, fallback) =>
  payload?.message ||
  (typeof payload?.error === 'string' ? payload.error : null) ||
  fallback;

/**
 * @param {string} path
 * @param {{ method?: string, body?: any, headers?: Record<string,string>, auth?: boolean, signal?: AbortSignal }} options
 */
export const request = async (path, options = {}) => {
  const { method = 'GET', body, headers = {}, auth = true, signal } = options;

  const finalHeaders = { Accept: 'application/json', ...headers };
  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders['Content-Type'] = 'application/json';
  }

  const token = auth ? getToken() : null;
  if (token) finalHeaders.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(buildUrl(path), {
      method,
      headers: finalHeaders,
      body:
        body === undefined
          ? undefined
          : body instanceof FormData
            ? body
            : JSON.stringify(body),
      signal
    });
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new ApiUnavailableError('Unable to reach the DevVerse API. Is the server running?');
  }

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok) {
    if (response.status === 401 && auth) {
      clearToken();
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    throw new ApiError(extractMessage(payload, `Request failed (${response.status})`), {
      status: response.status,
      payload
    });
  }

  return payload;
};

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' })
};

/** True when the error means "the backend is not reachable". */
export const isUnavailable = (error) => error instanceof ApiUnavailableError;
