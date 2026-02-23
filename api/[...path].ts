export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const TARGET_BASE = 'http://13.205.230.226:5000/api';
  const incomingUrl = new URL(req.url);
  const path = incomingUrl.pathname.replace(/^\/api\/?/, '');
  const search = incomingUrl.search;
  const url = path ? `${TARGET_BASE}/${path}${search}` : `${TARGET_BASE}${search}`;

  const incomingHeaders = new Headers(req.headers);
  const headers = new Headers();

  const whitelist = ['content-type', 'authorization', 'accept', 'user-agent', 'cookie', 'x-auth-token', 'origin', 'referer', 'accept-encoding'];
  for (const [key, value] of incomingHeaders.entries()) {
    const lowerKey = key.toLowerCase();
    if (whitelist.includes(lowerKey) || lowerKey.startsWith('x-')) {
      headers.set(key, value);
    }
  }

  headers.set('host', '13.205.230.226:5000');

  try {
    const resp = await fetch(url, {
      method: req.method,
      headers,
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : req.body,
      // @ts-ignore - duplex is required for streaming bodies in Edge fetch
      duplex: 'half'
    });

    const responseHeaders = new Headers();
    const restrictedHeaders = ['connection', 'keep-alive', 'transfer-encoding', 'content-encoding', 'content-length'];

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
    return new Response(JSON.stringify({ error: 'Proxy Failure', details: String(error) }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    });
  }
}
