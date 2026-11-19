// Resolve Playwright from the user's project (cwd), then this skill's folder, then global npm.
// Needed because a script living in the skill folder can't see the project's node_modules.
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";

export async function loadPlaywright() {
  const bases = [path.join(process.cwd(), "noop.js"), import.meta.url];
  try { bases.push(path.join(execSync("npm root -g", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim(), "noop.js")); } catch {}
  for (const b of bases) {
    try {
      const p = createRequire(b).resolve("playwright");
      const m = await import(pathToFileURL(p).href);
      return m.chromium ? m : m.default;
    } catch {}
  }
  console.error("Playwright not found. In the project folder run:\n  npm i -D playwright && npx playwright install chromium");
  process.exit(2);
}
