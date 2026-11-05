import { readFileSync } from "node:fs";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { fileURLToPath } from "node:url";
import { HttpError, readBody, sendJson, type Ctx } from "./lib/http.js";
import { buildRouter } from "./routes.js";

const openapiPath = fileURLToPath(new URL("../openapi.yaml", import.meta.url));
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS ?? "http://localhost:5173").split(",");

const swaggerHtml = `<!doctype html>
<html lang="tr"><head><meta charset="utf-8"><title>StudioPass API</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css"></head>
<body><div id="swagger"></div>
<script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
<script>SwaggerUIBundle({ url: "/openapi.yaml", dom_id: "#swagger", persistAuthorization: true });</script>
</body></html>`;

function log(req: IncomingMessage, status: number, startedAt: number) {
  if (process.env.NODE_ENV === "test") return;
  // NFR-07: yöntem, yol, durum kodu ve süre
  console.log(`${req.method} ${req.url} ${status} ${(performance.now() - startedAt).toFixed(1)}ms`);
}

export function createApp() {
  const router = buildRouter();

  return createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const startedAt = performance.now();
    const url = new URL(req.url ?? "/", "http://localhost");
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    }
    res.setHeader("X-Content-Type-Options", "nosniff");

    try {
      if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }
      if (url.pathname === "/docs") { res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }); res.end(swaggerHtml); return; }
      if (url.pathname === "/openapi.yaml") { res.writeHead(200, { "Content-Type": "text/yaml; charset=utf-8" }); res.end(readFileSync(openapiPath)); return; }

      const match = router.match(req.method ?? "GET", url.pathname);
      if (match === null) throw new HttpError(404, "NOT_FOUND", "Kaynak bulunamadı");
      if (match === "method-not-allowed") throw new HttpError(405, "METHOD_NOT_ALLOWED", "Bu yöntem desteklenmiyor");

      const ctx: Ctx = { req, res, params: match.params, query: url.searchParams, body: await readBody(req) };
      let result: unknown;
      for (const h of match.route.handlers) result = await h(ctx);
      const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 200;
      sendJson(res, status, result);
      log(req, status, startedAt);
    } catch (err) {
      if (err instanceof HttpError) {
        sendJson(res, err.status, { error: { code: err.code, message: err.message, ...(err.details ? { fields: err.details } : {}) } });
        log(req, err.status, startedAt);
      } else {
        // NFR-03: iç hata ayrıntısı istemciye gönderilmez
        console.error(err);
        sendJson(res, 500, { error: { code: "INTERNAL_ERROR", message: "Beklenmeyen bir hata oluştu" } });
        log(req, 500, startedAt);
      }
    }
  });
}
