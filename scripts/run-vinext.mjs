import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const requestedMode = process.argv[2];
if (!new Set(["dev", "build", "start", "pages"]).has(requestedMode)) {
  throw new Error(`Unsupported vinext mode: ${requestedMode ?? "missing"}`);
}
const mode = requestedMode === "pages" ? "build" : requestedMode;

const executable = process.execPath;
const cli = path.join("node_modules", "vinext", "dist", "cli.js");
const cliArguments = [cli, mode];
if (requestedMode === "pages") {
  const workspaceRoot = path.resolve(".");
  const pagesOutput = path.resolve("dist");
  if (path.dirname(pagesOutput) !== workspaceRoot) {
    throw new Error(`Refusing to clean unexpected Pages output: ${pagesOutput}`);
  }
  fs.rmSync(pagesOutput, { recursive: true, force: true });
  cliArguments.push("--prerender-concurrency", "1");
}

const child = spawn(executable, cliArguments, {
  stdio: "inherit",
  env: {
    ...process.env,
    ...(requestedMode === "pages"
      ? {
          GITHUB_PAGES: "true",
          NEXT_PUBLIC_BASE_PATH: "/voai-lab",
          NEXT_PUBLIC_SITE_URL:
            process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.github.io",
        }
      : {}),
    WRANGLER_LOG_PATH: path.join(".wrangler", "wrangler.log"),
  },
});

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});

child.on("exit", (code) => {
  if (code !== 0 || requestedMode !== "pages") {
    process.exit(code ?? 1);
  }
  const result = spawnSync(executable, [path.join("scripts", "prepare-pages.mjs")], {
    stdio: "inherit",
    env: process.env,
  });
  process.exit(result.status ?? 1);
});
