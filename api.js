import coreHandler from '../../api/[...path].js';

function buildRequest(event) {
  const headers = Object.fromEntries(Object.entries(event.headers || {}).map(([k, v]) => [k.toLowerCase(), v ?? '']));
  const method = event.httpMethod || event.requestContext?.http?.method || 'GET';
  const host = headers.host || event.headers?.host || 'localhost';
  const proto = headers['x-forwarded-proto'] || 'https';

  // Netlify invokes this function through /.netlify/functions/api,
  // while the core router expects public routes beginning with /api.
  // Normalize both direct-function and /api/* rewrite requests.
  let pathname = event.path || '/';
  let query = '';
  try {
    const candidate = event.rawUrl || `${proto}://${host}${pathname}`;
    const parsed = new URL(candidate);
    pathname = parsed.pathname;
    query = parsed.search;
  } catch {
    pathname = event.path || '/';
  }
  const marker = '/.netlify/functions/api';
  if (pathname === marker) pathname = '/api';
  else if (pathname.startsWith(marker + '/')) pathname = '/api' + pathname.slice(marker.length);
  else if (!pathname.startsWith('/api')) {
    const idx = pathname.indexOf('/api/');
    if (idx >= 0) pathname = pathname.slice(idx);
  }
  const rawUrl = `${proto}://${host}${pathname}${query}`;

  const chunks = [];
  const req = {
    method,
    url: rawUrl,
    headers,
    on(type, cb) {
      if (type === 'data') {
        if (event.body) {
          const raw = event.isBase64Encoded
            ? Buffer.from(event.body, 'base64')
            : Buffer.from(event.body);
          chunks.push(raw);
          queueMicrotask(() => cb(raw));
        }
      } else if (type === 'end') {
        queueMicrotask(() => cb());
      } else if (type === 'error') {
        // no-op: Netlify has already parsed the event body
      }
      return req;
    }
  };
  return req;
}

function buildResponse() {
  let statusCode = 200;
  const headers = {};
  const bodyChunks = [];
  return {
    writeHead(status, nextHeaders = {}) {
      statusCode = status;
      Object.assign(headers, nextHeaders);
    },
    setHeader(name, value) {
      headers[name] = value;
    },
    end(body = '') {
      if (body !== undefined && body !== null) bodyChunks.push(String(body));
    },
    result() {
      const body = bodyChunks.join('');
      const outHeaders = { ...headers };
      const cookieKey = Object.keys(outHeaders).find(k => k.toLowerCase() === 'set-cookie');
      const multiValueHeaders = {};
      if (cookieKey) {
        const cookieValue = outHeaders[cookieKey];
        if (Array.isArray(cookieValue)) {
          multiValueHeaders[cookieKey] = cookieValue;
          delete outHeaders[cookieKey];
        } else if (typeof cookieValue === 'string' && cookieValue.includes('\n')) {
          multiValueHeaders[cookieKey] = cookieValue.split('\n');
          delete outHeaders[cookieKey];
        }
      }
      return { statusCode, headers: outHeaders, multiValueHeaders, body, isBase64Encoded: false };
    }
  };
}

export async function handler(event) {
  const req = buildRequest(event);
  const res = buildResponse();
  await coreHandler(req, res);
  return res.result();
}

export default { handler };
