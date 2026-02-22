export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const TARGET_BASE = 'http://13.205.230.226:5000/api';
  const incomingUrl = new URL(req.url);
  const path = incomingUrl.pathname.replace(/^\/api\/?/, '');
  const search = incomingUrl.search;
  const url = path ? `${TARGET_BASE}/${path}${search}` : `${TARGET_BASE}${search}`;

  const headers = new Headers(req.headers);
  headers.delete('host');
  if (req.method !== 'GET' && req.method !== 'HEAD' && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  const resp = await fetch(url, {
    method: req.method,
    headers,
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : req.body,
  });

  return new Response(resp.body, {
    status: resp.status,
    headers: resp.headers,
  });
}
