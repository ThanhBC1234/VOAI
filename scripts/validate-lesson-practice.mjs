import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

const ROOT = path.resolve(import.meta.dirname, "..");
const ALLOWED_IMPORTS = new Set([
  "bisect", "collections", "dataclasses", "functools", "heapq", "itertools",
  "json", "math", "random", "re", "statistics", "string", "typing",
]);
const FORBIDDEN_CODE = /\b(?:open|input|eval|exec|compile|__import__)\s*\(|\b(?:os|pathlib|shutil|socket|subprocess|urllib|http|requests)\b/;

async function loadPracticeSource() {
  const scratch = fs.mkdtempSync(path.join(tmpdir(), "voai-practice-validation-"));
  const outfile = path.join(scratch, "practice-source.mjs");
  try {
    await build({
      stdin: {
        contents: [
          'export { lessonPractice, assertLessonPracticeCoverage } from "./content/lesson-practice/index.ts";',
          'export { coreLessonOrder } from "./content/lessons-core.ts";',
          'export { multimodalLessons } from "./content/lessons-multimodal.ts";',
        ].join("\n"),
        loader: "ts",
        resolveDir: ROOT,
        sourcefile: "lesson-practice-validation-entry.ts",
      },
      outfile,
      bundle: true,
      format: "esm",
      platform: "node",
      target: "node22",
      logLevel: "silent",
    });
    return await import(`${pathToFileURL(outfile).href}?v=${Date.now()}`);
  } finally {
    fs.rmSync(scratch, { recursive: true, force: true });
  }
}

function pythonLiteral(value) {
  if (typeof value === "boolean") return value ? "True" : "False";
  if (typeof value === "number") return String(value);
  return JSON.stringify(value);
}

export function renderPracticeCode(template, parameters) {
  return template.replace(/\{\{([a-z][a-z0-9_]*)\}\}/g, (token, key) =>
    Object.hasOwn(parameters, key) ? pythonLiteral(parameters[key]) : token,
  );
}

function normalizeOutput(value) {
  return value.replace(/\r\n/g, "\n").trimEnd();
}

function validateImports(lessonId, code, errors) {
  for (const line of code.split("\n")) {
    const match = line.match(/^\s*(?:from\s+([a-zA-Z_][\w.]*)\s+import|import\s+([a-zA-Z_][\w.]*))/);
    if (!match) continue;
    const root = (match[1] ?? match[2]).split(".")[0];
    if (!ALLOWED_IMPORTS.has(root)) errors.push(`${lessonId}: import ngoài allowlist: ${root}.`);
  }
}

export async function validateLessonPracticeRuntime() {
  const source = await loadPracticeSource();
  const lessonIds = [
    ...source.coreLessonOrder,
    ...source.multimodalLessons.map((lesson) => lesson.id),
  ];
  source.assertLessonPracticeCoverage(lessonIds);
  const errors = [];
  let variantsRun = 0;

  for (const lessonId of lessonIds) {
    const practice = source.lessonPractice[lessonId];
    const lineCount = practice.python.codeTemplate.split("\n").length;
    if (lineCount < 5 || lineCount > 120) errors.push(`${lessonId}: code phải dài 5–120 dòng; nhận ${lineCount}.`);
    if (FORBIDDEN_CODE.test(practice.python.codeTemplate)) errors.push(`${lessonId}: code chứa API bị cấm.`);
    validateImports(lessonId, practice.python.codeTemplate, errors);

    for (const variant of practice.experiment.variants) {
      const code = renderPracticeCode(practice.python.codeTemplate, variant.parameters);
      if (/\{\{[^}]+\}\}/.test(code)) {
        errors.push(`${lessonId}/${variant.id}: còn token chưa thay.`);
        continue;
      }
      const run = spawnSync("python", ["-I", "-c", code], {
        cwd: ROOT,
        encoding: "utf8",
        timeout: 2_000,
        maxBuffer: 16 * 1024,
        windowsHide: true,
        env: { ...process.env, PYTHONIOENCODING: "utf-8" },
      });
      variantsRun += 1;
      if (run.error) {
        errors.push(`${lessonId}/${variant.id}: không chạy được Python: ${run.error.message}`);
      } else if (run.status !== 0) {
        errors.push(`${lessonId}/${variant.id}: Python exit ${run.status}: ${normalizeOutput(run.stderr ?? "")}`);
      } else if (normalizeOutput(run.stdout ?? "") !== normalizeOutput(variant.expectedOutput)) {
        errors.push(
          `${lessonId}/${variant.id}: output lệch.\n` +
          `  expected: ${JSON.stringify(normalizeOutput(variant.expectedOutput))}\n` +
          `  actual:   ${JSON.stringify(normalizeOutput(run.stdout ?? ""))}`,
        );
      }
    }
  }

  if (errors.length > 0) throw new Error(`Validation thực hành thất bại:\n${errors.join("\n")}`);
  return { lessons: lessonIds.length, variants: variantsRun };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await validateLessonPracticeRuntime();
  console.log(`Đã chạy ${result.variants} biến thể Python của ${result.lessons} bài thực hành.`);
}
