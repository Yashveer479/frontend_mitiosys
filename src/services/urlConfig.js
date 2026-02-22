const stripTrailingSlash = (value) => value.replace(/\/+$/, '');

const isMixedContentUrl = (value) => {
    if (typeof window === 'undefined') return false;
    return window.location.protocol === 'https:' && /^http:\/\//i.test(value);
};

const normalizeBaseUrl = (value, fallback) => {
    const raw = (value || '').trim();
    if (!raw || isMixedContentUrl(raw)) {
        return fallback;
    }
    return stripTrailingSlash(raw);
};

export const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_URL, '/api');
export const SERVER_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_SERVER_URL, API_BASE_URL);

export const toServerUrl = (path) => {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) {
        return isMixedContentUrl(path) ? null : path;
    }
    return `${SERVER_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

