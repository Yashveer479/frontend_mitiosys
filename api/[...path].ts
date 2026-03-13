export const config = {
  runtime: 'nodejs',
};

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'content-length',
  'host'
]);

const TARGET_BASE = (process.env.BACKEND_API_URL || 'http://13-205-230-226.sslip.io:5000/api').replace(/\/+$/, '');

export default async function handler(req: Request) {
  const incomingUrl = new URL(req.url);
  const path = incomingUrl.pathname.replace(/^\/api\/?/, '');
  const targetUrl = path
    ? `${TARGET_BASE}/${path}${incomingUrl.search}`
    : `${TARGET_BASE}${incomingUrl.search}`;

  const headers = new Headers();
  for (const [key, value] of req.headers.entries()) {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  }

  try {
    const body = req.method === 'GET' || req.method === 'HEAD'
      ? undefined
      : await req.arrayBuffer();

    const resp = await fetch(targetUrl, {
      method: req.method,
      headers,
      body
    });

    const responseHeaders = new Headers();
    for (const [key, value] of resp.headers.entries()) {
      if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    }

    return new Response(resp.body, {
      status: resp.status,
      headers: responseHeaders,
    });
  } catch (error) {
    const details = error instanceof Error ? (error.stack || error.message) : String(error);
    return new Response(JSON.stringify({ error: 'Proxy Failure', details, targetUrl }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    });
  }
}
