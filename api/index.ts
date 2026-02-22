export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request) {
    const TARGET_BASE = 'http://13.205.230.226:5000/api';
    const incomingUrl = new URL(req.url);

    // Extract path accurately by splitting and taking everything after 'api'
    const pathParts = incomingUrl.pathname.split('/').filter(Boolean);
    const apiIndex = pathParts.indexOf('api');
    const path = apiIndex !== -1 ? pathParts.slice(apiIndex + 1).join('/') : '';

    const search = incomingUrl.search;
    const url = path ? `${TARGET_BASE}/${path}${search}` : `${TARGET_BASE}${search}`;

    const headers = new Headers(req.headers);

    // Sanitize headers to prevent 403s and conflicts
    headers.delete('host');
    headers.delete('origin');
    headers.delete('referer');

    // Remove Vercel-specific headers that might confuse the backend
    for (const [key] of headers.entries()) {
        if (key.toLowerCase().startsWith('x-vercel-')) {
            headers.delete(key);
        }
    }

    if (req.method !== 'GET' && req.method !== 'HEAD' && !headers.has('content-type')) {
        headers.set('content-type', 'application/json');
    }

    try {
        const resp = await fetch(url, {
            method: req.method,
            headers,
            body: req.method === 'GET' || req.method === 'HEAD' ? undefined : req.body,
        });

        return new Response(resp.body, {
            status: resp.status,
            headers: resp.headers,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return new Response(JSON.stringify({
            error: 'Proxy Fetch Error',
            details: errorMessage,
            targetUrl: url
        }), {
            status: 502,
            headers: { 'content-type': 'application/json' },
        });
    }
}
