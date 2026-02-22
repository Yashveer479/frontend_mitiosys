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
    const whitelist = ['content-type', 'authorization', 'accept', 'user-agent'];
    for (const [key, value] of incomingHeaders.entries()) {
        if (whitelist.includes(key.toLowerCase()) || key.toLowerCase().startsWith('x-')) {
            headers.set(key, value);
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
            // @ts-ignore - duplex is required when body is a stream in some environments
            duplex: 'half'
        });

        // If not successful (like 403), capture the error body to see why the backend rejected it
        if (!resp.ok) {
            const errorText = await resp.text();
            return new Response(JSON.stringify({
                error: 'Backend Error',
                status: resp.status,
                statusText: resp.statusText,
                body: errorText,
                targetUrl: url
            }), {
                status: resp.status,
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
            error: 'Proxy Fetch Error',
            details: errorMessage,
            targetUrl: url
        }), {
            status: 502,
            headers: { 'content-type': 'application/json' },
        });
    }
}
