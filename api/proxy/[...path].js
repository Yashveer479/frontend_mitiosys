export default async function handler(req, res) {
  const TARGET_BASE = 'http://13.205.230.226:5000/api';
  try {
    const pathPart = Array.isArray(req.query.path) ? req.query.path.join('/') : (req.query.path || '');
    const query = req.url && req.url.includes('?') ? req.url.split('?')[1] : '';
    const url = `${TARGET_BASE}/${pathPart}${query ? '?' + query : ''}`;

    console.log(`[PROXY] ${req.method} ${url}`);

    let bodyData = null;
    if (!['GET', 'HEAD'].includes(req.method)) {
      if (req.body) {
        bodyData = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      } else {
        const chunks = [];
        await new Promise((resolve, reject) => {
          req.on('data', (c) => chunks.push(c));
          req.on('end', () => resolve());
          req.on('error', reject);
        });
        bodyData = Buffer.concat(chunks);
      }
    }

    const headers = { ...req.headers };
    delete headers.host;
    if (!['GET', 'HEAD'].includes(req.method) && bodyData && !headers['content-type']) {
      headers['content-type'] = 'application/json';
    }

    const resp = await fetch(url, {
      method: req.method,
      headers,
      body: bodyData,
    });

    console.log(`[PROXY] Response: ${resp.status}`);
    res.status(resp.status);
    resp.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'transfer-encoding') return;
      res.setHeader(key, value);
    });

    const ab = await resp.arrayBuffer();
    res.send(Buffer.from(ab));
  } catch (err) {
    console.error('[PROXY] Error:', err);
    res.status(500).json({ error: 'Proxy error', details: err.message });
  }

}