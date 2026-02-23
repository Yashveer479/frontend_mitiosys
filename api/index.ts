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
    const whitelist = ['content-type', 'authorization', 'accept', 'user-agent', 'cookie', 'x-auth-token', 'origin', 'referer', 'accept-encoding'];
    for (const [key, value] of incomingHeaders.entries()) {
        const lowerKey = key.toLowerCase();
        if (whitelist.includes(lowerKey) || lowerKey.startsWith('x-')) {
            headers.set(key, value);
        }
    }

    // Explicitly set the host header to the target backend (without the hostname mapping for Host header)
    // The target host is 13.205.230.226:5000 via its sslip.io mapping.
    headers.set('host', '13.205.230.226:5000');

    // Do NOT set Origin manually, as the backend's CORS policy is strict and rejects the sslip.io hostname.
    // By not sending an Origin, the backend's CORS middleware (configured with a whitelist) 
    // will usually allow the request (confirmed via curl diagnostics).

    try {
        const resp = await fetch(url, {
            method: req.method,
            headers,
            body: req.method === 'GET' || req.method === 'HEAD' ? undefined : req.body,
            // @ts-ignore - duplex is required for streaming bodies in Edge fetch
            duplex: 'half'
        });

        // Forward headers from backend, but ensure we don't leak backend server info
        const responseHeaders = new Headers();
        const restrictedHeaders = [
            'connection',
            'keep-alive',
            'transfer-encoding',
            'content-encoding',
            'content-length' // Let Vercel calculate this
        ];

        for (const [key, value] of resp.headers.entries()) {
            if (!restrictedHeaders.includes(key.toLowerCase())) {
                responseHeaders.set(key, value);
            }
        }

        return new Response(resp.body, {
            status: resp.status,
            headers: responseHeaders,
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.stack || error.message : String(error);
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
