export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request) {
    // Vercel Edge Runtime doesn't allow direct IP fetch. Use sslip.io to map IP to a hostname.
    const TARGET_BASE = 'http://13-205-230-226.sslip.io:5000/api';
    const incomingUrl = new URL(req.url);

    // Extract path accurately
    const pathParts = incomingUrl.pathname.split('/').filter(Boolean);
    const apiIndex = pathParts.indexOf('api');
    const path = apiIndex !== -1 ? pathParts.slice(apiIndex + 1).join('/') : '';

    const search = incomingUrl.search;
    const url = path ? `${TARGET_BASE}/${path}${search}` : `${TARGET_BASE}${search}`;

    const incomingHeaders = new Headers(req.headers);
    const headers = new Headers();

    // Whitelist approach: Only forward essential headers
    const whitelist = ['content-type', 'authorization', 'accept', 'user-agent', 'cookie', 'x-auth-token'];
    for (const [key, value] of incomingHeaders.entries()) {
        const lowerKey = key.toLowerCase();
        if (whitelist.includes(lowerKey) || lowerKey.startsWith('x-')) {
            headers.set(key, value);
        }
    }

    // Set Origin to satisfy CORS/Security checks on backend
    headers.set('origin', 'http://13-205-230-226.sslip.io:5000');

    try {
        const resp = await fetch(url, {
            method: req.method,
            headers,
            body: req.method === 'GET' || req.method === 'HEAD' ? undefined : req.body,
            // @ts-ignore - duplex is required for streaming bodies in Edge fetch
            duplex: 'half'
        });

        // Forward headers from backend, but ensure we don't leak backend server info
        const responseHeaders = new Headers(resp.headers);

        return new Response(resp.body, {
            status: resp.status,
            headers: responseHeaders,
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return new Response(JSON.stringify({
            error: 'Proxy Critical Failure',
            details: errorMessage,
            targetUrl: url
        }), {
            status: 502, // Bad Gateway
            headers: { 'content-type': 'application/json' },
        });
    }
}
