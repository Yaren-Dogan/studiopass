import type { IncomingMessage, ServerResponse } from "node:http";
import type { AuthUser } from "./auth.js";

/** İş kuralı ya da istek hatası. `code` istemcinin hatayı ayırt etmesi için sabittir. */
export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Record<string, string>,
  ) {
    super(message);
  }
}

export interface Ctx {
  req: IncomingMessage;
  res: ServerResponse;
  params: Record<string, string>;
  query: URLSearchParams;
  body: unknown;
  user?: AuthUser;
}

export type Handler = (ctx: Ctx) => Promise<unknown> | unknown;
type Method = "GET" | "POST" | "PATCH" | "DELETE";

interface Route {
  method: Method;
  regex: RegExp;
  keys: string[];
  handlers: Handler[];
}

/** Bağımlılıksız, küçük bir yönlendirici. `/api/members/:id` biçimindeki yolları destekler. */
export class Router {
  private routes: Route[] = [];

  add(method: Method, path: string, ...handlers: Handler[]) {
    const keys: string[] = [];
    const pattern = path.replace(/:(\w+)/g, (_, k: string) => {
      keys.push(k);
      return "([^/]+)";
    });
    this.routes.push({ method, regex: new RegExp(`^${pattern}/?$`), keys, handlers });
    return this;
  }

  get(path: string, ...h: Handler[]) { return this.add("GET", path, ...h); }
  post(path: string, ...h: Handler[]) { return this.add("POST", path, ...h); }
  patch(path: string, ...h: Handler[]) { return this.add("PATCH", path, ...h); }
  delete(path: string, ...h: Handler[]) { return this.add("DELETE", path, ...h); }

  match(method: string, pathname: string) {
    let pathMatched = false;
    for (const r of this.routes) {
      const m = r.regex.exec(pathname);
      if (!m) continue;
      pathMatched = true;
      if (r.method !== method) continue;
      const params: Record<string, string> = {};
      r.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
      return { route: r, params };
    }
    return pathMatched ? "method-not-allowed" : null;
  }
}

export function sendJson(res: ServerResponse, status: number, data: unknown) {
  const body = status === 204 ? "" : JSON.stringify(data);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(body);
}

export async function readBody(req: IncomingMessage, limitBytes = 100_000): Promise<unknown> {
  if (req.method === "GET" || req.method === "DELETE") return undefined;
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > limitBytes) throw new HttpError(413, "PAYLOAD_TOO_LARGE", "İstek gövdesi çok büyük");
    chunks.push(chunk as Buffer);
  }
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new HttpError(400, "INVALID_JSON", "İstek gövdesi geçerli JSON değil");
  }
}
