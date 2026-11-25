#!/usr/bin/env node
// Route smoke test against a running server.
//
// Usage: node scripts/smoke.mjs [--base http://localhost:3100] [--expect 404] <paths...>
//
// Each path must answer with the expected status (default 200, redirects are
// not followed). Pages expected to return 200 must also contain an <h1.
// Prints one line per path and exits non-zero if any path fails.

const USAGE =
  "Usage: node scripts/smoke.mjs [--base http://localhost:3100] [--expect 404] <paths...>";

function parseArgs(argv) {
  const options = { base: "http://localhost:3100", expect: 200, paths: [] };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--base" || arg === "--expect") {
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
  if (options.paths.length === 0) throw new Error("No paths given");
  return options;
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
    return { ok: true, line: `PASS ${res.status} ${path}` };
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

let failures = 0;
for (const path of options.paths) {
  const result = await check(options.base, path, options.expect);
  console.log(result.line);
  if (!result.ok) failures++;
}

const total = options.paths.length;
console.log(`${total - failures}/${total} passed (${options.base})`);
process.exit(failures === 0 ? 0 : 1);
