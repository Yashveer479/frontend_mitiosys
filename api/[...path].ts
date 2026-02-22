import { NextRequest, NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  const TARGET_BASE = 'http://13.205.230.226:5000/api';
  const path = req.nextUrl.pathname.replace(/^\/api\//, '');
  const url = `${TARGET_BASE}/${path}`;

  const headers = new Headers(req.headers);
  headers.delete('host');
  if (req.method !== 'GET' && req.method !== 'HEAD' && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  const resp = await fetch(url, {
    method: req.method,
    headers,
    body: req.body,
  });

  const response = new NextResponse(resp.body, {
    status: resp.status,
    headers: resp.headers,
  });
  return response;
}
