// StudioPass web — esbuild ile derleme ve geliştirme sunucusu.
// `node build.mjs`            → dist/ klasörüne üretim derlemesi
// `node build.mjs --serve`    → http://localhost:5173 (dosya değişince yeniden derler, /api → API_URL)
import * as esbuild from "esbuild";
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { createServer, request } from "node:http";
import { extname, join, normalize } from "node:path";

const serve = process.argv.includes("--serve");
const watch = serve && !process.argv.includes("--no-watch");
const PORT = Number(process.env.PORT ?? 5173);
const API_URL = new URL(process.env.API_URL ?? "http://localhost:4000");
const outdir = "dist";

mkdirSync(outdir, { recursive: true });
copyFileSync("index.html", join(outdir, "index.html"));
if (existsSync("public/favicon.svg")) copyFileSync("public/favicon.svg", join(outdir, "favicon.svg"));

const options = {
  entryPoints: ["src/main.tsx"],
  bundle: true,
  outdir,
  entryNames: "app",
  format: "esm",
  jsx: "automatic",
  sourcemap: true,
  minify: !serve,
  target: ["es2022"],
  define: { "process.env.NODE_ENV": JSON.stringify(serve ? "development" : "production") },
  logLevel: "info",
};

if (!serve) {
  await esbuild.build(options);
  process.exit(0);
}

const ctx = await esbuild.context(options);
if (watch) await ctx.watch();
else await ctx.rebuild();

const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".map": "application/json" };

createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  if (url.pathname.startsWith("/api/")) {
    const proxied = request(
      { hostname: API_URL.hostname, port: API_URL.port, path: req.url, method: req.method, headers: { ...req.headers, host: API_URL.host } },
      (upstream) => { res.writeHead(upstream.statusCode ?? 502, upstream.headers); upstream.pipe(res); },
    );
    proxied.on("error", () => { res.writeHead(502, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: { code: "API_UNREACHABLE", message: "Sunucuya ulaşılamadı" } })); });
    req.pipe(proxied);
    return;
  }
  const file = normalize(join(outdir, url.pathname)).startsWith(outdir) ? join(outdir, url.pathname) : "";
  const target = file && existsSync(file) && extname(file) ? file : join(outdir, "index.html"); // SPA geri dönüşü
  res.writeHead(200, { "Content-Type": `${types[extname(target)] ?? "application/octet-stream"}; charset=utf-8` });
  res.end(readFileSync(target));
}).listen(PORT, () => console.log(`StudioPass web → http://localhost:${PORT}  (API: ${API_URL.origin})`));
