#!/usr/bin/env node
// Route smoke test against a running server.
//
// Usage: node scripts/smoke.mjs [--base http://localhost:3100] [--expect 404] [--sitemap] <paths...>
//
// Each path must answer with the expected status (default 200, redirects are
// not followed). Pages expected to return 200 must also contain an <h1.
// With --sitemap, every <loc> in <base>/sitemap.xml is checked too: its path
// (and query) is requested from the base, whatever origin the sitemap names.
// Pages whose <title> is longer than 60 characters are reported as WARN
// (they do not fail the run).
// Prints one line per path and exits non-zero if any path fails.

const USAGE =
  "Usage: node scripts/smoke.mjs [--base http://localhost:3100] [--expect 404] [--sitemap] <paths...>";

const MAX_TITLE_LENGTH = 60;

function parseArgs(argv) {
  const options = { base: "http://localhost:3100", expect: 200, sitemap: false, paths: [] };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--sitemap") {
      options.sitemap = true;
    } else if (arg === "--base" || arg === "--expect") {
      const value = argv[++i];
      if (value === undefined) throw new Error(`Missing value for ${arg}`);
      if (arg === "--base") {
        options.base = value.replace(/\/+$/, "");
      } else {
        const status = Number(value);
        if (!Number.isInteger(status) || status < 100 || status > 599) {
          throw new Error(`Invalid --expect status: ${value}`);
        }
        options.expect = status;
      }
    } else if (arg === "--help" || arg === "-h") {
      console.log(USAGE);
      process.exit(0);
    } else if (arg.startsWith("--")) {
      throw new Error(`Unknown option: ${arg}`);
    } else if (/^[A-Za-z]:[\\/]/.test(arg)) {
      // Git Bash (MSYS) rewrites "/design" to "C:/Program Files/Git/design".
      throw new Error(
        `"${arg}" is a filesystem path, not a URL path. In Git Bash run with MSYS_NO_PATHCONV=1, or use PowerShell.`,
      );
    } else {
      options.paths.push(arg.startsWith("/") ? arg : `/${arg}`);
    }
  }
  if (options.paths.length === 0 && !options.sitemap) throw new Error("No paths given");
  return options;
}

function decodeXml(text) {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

/** Paths (with query) of every <loc> in the base's sitemap.xml. */
async function sitemapPaths(base) {
  const res = await fetch(`${base}/sitemap.xml`, { signal: AbortSignal.timeout(30_000) });
  if (res.status !== 200) throw new Error(`sitemap.xml answered ${res.status}`);
  const xml = await res.text();
  const locs = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((m) => decodeXml(m[1]));
  if (locs.length === 0) throw new Error("sitemap.xml lists no <loc> entries");
  return locs.map((loc) => {
    const url = new URL(loc);
    return `${url.pathname}${url.search}`;
  });
}

function titleOf(body) {
  const match = /<title[^>]*>([^<]*)<\/title>/i.exec(body);
  return match ? decodeXml(match[1]).trim() : null;
}

async function check(base, path, expected) {
  const url = `${base}${path}`;
  try {
    const res = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(30_000),
    });
    const body = await res.text();
    if (res.status !== expected) {
      const location = res.headers.get("location");
      const detail = location ? ` -> ${location}` : "";
      return { ok: false, line: `FAIL ${res.status} ${path} (expected ${expected})${detail}` };
    }
    if (expected === 200 && !body.includes("<h1")) {
      return { ok: false, line: `FAIL ${res.status} ${path} (no <h1 in body)` };
    }
    const title = expected === 200 ? titleOf(body) : null;
    const warning =
      title && title.length > MAX_TITLE_LENGTH ? `WARN title ${title.length} chars on ${path}: "${title}"` : null;
    return { ok: true, line: `PASS ${res.status} ${path}`, warning };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    return { ok: false, line: `FAIL --- ${path} (${reason})` };
  }
}

let options;
try {
  options = parseArgs(process.argv.slice(2));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  console.error(USAGE);
  process.exit(2);
}

if (options.sitemap) {
  try {
    const fromSitemap = await sitemapPaths(options.base);
    console.log(`sitemap.xml lists ${fromSitemap.length} URLs`);
    options.paths = [...new Set([...options.paths, ...fromSitemap])];
  } catch (error) {
    console.error(`FAIL sitemap: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

let failures = 0;
const warnings = [];
for (const path of options.paths) {
  const result = await check(options.base, path, options.expect);
  console.log(result.line);
  if (!result.ok) failures++;
  if (result.warning) warnings.push(result.warning);
}

for (const warning of warnings) console.log(warning);
const total = options.paths.length;
console.log(
  `${total - failures}/${total} passed (${options.base})${warnings.length ? `, ${warnings.length} title warning(s)` : ""}`,
);
process.exit(failures === 0 ? 0 : 1);
