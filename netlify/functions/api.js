import { handleRequest } from "../../netlify-core.js";

export async function handler(event) {
  const headers = Object.fromEntries(Object.entries(event.headers || {}).map(([k, v]) => [k.toLowerCase(), v ?? ""]));
  const method = event.httpMethod || event.requestContext?.http?.method || "GET";
  const host = headers.host || "localhost";
  const proto = headers["x-forwarded-proto"] || "https";

  let pathname = event.path || "/";
  let query = "";
  try {
    const candidate = event.rawUrl || `${proto}://${host}${pathname}`;
    const parsed = new URL(candidate);
    pathname = parsed.pathname;
    query = parsed.search;
  } catch {
    pathname = event.path || "/";
  }

  const marker = "/.netlify/functions/api";
  if (pathname === marker) pathname = "/api";
  else if (pathname.startsWith(marker + "/")) pathname = "/api" + pathname.slice(marker.length);
  else if (!pathname.startsWith("/api")) {
    const idx = pathname.indexOf("/api/");
    if (idx >= 0) pathname = pathname.slice(idx);
  }

  const rawUrl = `${proto}://${host}${pathname}${query}`;
  const req = {
    method,
    url: rawUrl,
    headers,
    on(type, cb) {
      if (type === "data") {
        if (event.body) {
          const raw = event.isBase64Encoded ? Buffer.from(event.body, "base64") : Buffer.from(event.body);
          queueMicrotask(() => cb(raw));
        }
      } else if (type === "end") {
        queueMicrotask(() => cb());
      }
      return req;
    }
  };

  let statusCode = 200;
  const responseHeaders = {};
  const chunks = [];
  const res = {
    writeHead(status, nextHeaders = {}) { statusCode = status; Object.assign(responseHeaders, nextHeaders); },
    setHeader(name, value) { responseHeaders[name] = value; },
    end(body = "") { if (body !== undefined && body !== null) chunks.push(String(body)); }
  };

  try {
    await handleRequest(req, res);
  } catch (err) {
    console.error("TRENDOVA function error", err);
    statusCode = 500;
    responseHeaders["Content-Type"] = "application/json; charset=utf-8";
    chunks.length = 0;
    chunks.push(JSON.stringify({ error: "Internal server error" }));
  }

  const outHeaders = { ...responseHeaders };
  const multiValueHeaders = {};
  const cookieKey = Object.keys(outHeaders).find(k => k.toLowerCase() === "set-cookie");
  if (cookieKey) {
    const cookieValue = outHeaders[cookieKey];
    if (Array.isArray(cookieValue)) {
      multiValueHeaders[cookieKey] = cookieValue;
      delete outHeaders[cookieKey];
    } else if (typeof cookieValue === "string" && cookieValue.includes("\n")) {
      multiValueHeaders[cookieKey] = cookieValue.split("\n");
      delete outHeaders[cookieKey];
    }
  }

  return { statusCode, headers: outHeaders, multiValueHeaders, body: chunks.join(""), isBase64Encoded: false };
}
