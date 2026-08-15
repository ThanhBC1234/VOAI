import { spawn } from "node:child_process";
import path from "node:path";

const mode = process.argv[2];
if (!new Set(["dev", "build", "start"]).has(mode)) {
  throw new Error(`Unsupported vinext mode: ${mode ?? "missing"}`);
}

const executable = process.execPath;
const cli = path.join("node_modules", "vinext", "dist", "cli.js");

const child = spawn(executable, [cli, mode], {
  stdio: "inherit",
  env: {
    ...process.env,
    WRANGLER_LOG_PATH: path.join(".wrangler", "wrangler.log"),
  },
});

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});

child.on("exit", (code) => process.exit(code ?? 1));
