/**
 * Nạp một module TypeScript vào node:test mà không cần chạy cả bản dựng website.
 *
 * Các hàm thuần của dự án (chấm gate, deadline, migration storage) không đi qua
 * HTML render nên không kiểm được bằng `tests/rendered-html.test.mjs`. Helper này
 * biên dịch module bằng esbuild vào thư mục tạm rồi import động.
 */

import { build } from "esbuild";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const scratchDirectories = [];

/** Biên dịch `relativePath` (so với gốc repo) rồi trả về namespace đã import. */
export async function loadTypeScriptModule(relativePath) {
  const directory = await mkdtemp(path.join(tmpdir(), "voai-test-"));
  scratchDirectories.push(directory);
  const outfile = path.join(directory, "module.mjs");
  await build({
    entryPoints: [path.join(ROOT, relativePath)],
    outfile,
    bundle: true,
    format: "esm",
    platform: "node",
    target: "node22",
    logLevel: "silent",
  });
  return import(pathToFileURL(outfile).href);
}

export async function cleanupLoadedModules() {
  await Promise.all(
    scratchDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })),
  );
}
