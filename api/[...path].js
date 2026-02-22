export default async function handler(req, res) {
  const TARGET_BASE = 'http://13.205.230.226:5000';
  try {
    const fullUrlPath = req.url || '';
    const query = fullUrlPath.includes('?') ? fullUrlPath.split('?')[1] : '';
    const pathOnly = fullUrlPath.split('?')[0];
    const url = `${TARGET_BASE}${pathOnly}${query ? '?' + query : ''}`;

    const body = await new Promise((resolve, reject) => {
      const chunks = [];
      req.on('data', (c) => chunks.push(c));
      req.on('end', () => resolve(Buffer.concat(chunks)));
      req.on('error', reject);
    });

    const headers = { ...req.headers };
    delete headers.host;

    const resp = await fetch(url, {
      method: req.method,
      headers,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : body,
    });

    res.status(resp.status);
    resp.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'transfer-encoding') return;
      res.setHeader(key, value);
    });

    const ab = await resp.arrayBuffer();
    res.send(Buffer.from(ab));
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error' });
  }
}
