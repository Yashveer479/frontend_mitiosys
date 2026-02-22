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

    // Explicitly set the Origin to the target backend to satisfy CORS/Security checks
    headers.set('origin', 'http://13.205.230.226:5000');

    try {
        const resp = await fetch(url, {
            method: req.method,
            headers,
            body: req.method === 'GET' || req.method === 'HEAD' ? undefined : req.body,
            // @ts-ignore - duplex is required for streaming bodies in Edge
            duplex: 'half'
        });

        if (!resp.ok) {
            const errorText = await resp.text();
            // TEMPORARY: Return 200 so Axios doesn't throw and you can see the body in the App
            return new Response(JSON.stringify({
                isProxyError: true,
                status: resp.status,
                statusText: resp.statusText,
                body: errorText,
                targetUrl: url,
                sentHeaders: Object.fromEntries(headers.entries())
            }), {
                status: 200,
                headers: { 'content-type': 'application/json' }
            });
        }

        return new Response(resp.body, {
            status: resp.status,
            headers: resp.headers,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return new Response(JSON.stringify({
            isProxyError: true,
            error: 'Proxy Critical Failure',
            details: errorMessage,
            targetUrl: url
        }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
        });
    }
}
