/**
 * Sinh một JSON chunk cho mỗi bài vào `public/data/lesson-theory/`.
 *
 * Nội dung TypeScript được nạp qua esbuild để script chạy trực tiếp bằng Node,
 * không phụ thuộc vào output của web build. Cùng nguồn luôn sinh cùng byte;
 * file không đổi không bị ghi lại để tránh kích hoạt watcher không cần thiết.
 */

import { build } from "esbuild";
import fs from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DEFAULT_OUTPUT_DIRECTORY = path.join(ROOT, "public", "data", "lesson-theory");

async function loadLessonTheorySource() {
  const scratch = fs.mkdtempSync(path.join(tmpdir(), "voai-lesson-theory-chunks-"));
  const outfile = path.join(scratch, "lesson-theory-source.mjs");
  try {
    await build({
      stdin: {
        contents: [
          'export { lessonDeepTheory, assertLessonTheoryCoverage } from "./content/lesson-theory/index.ts";',
          'export { lessonPractice, assertLessonPracticeCoverage } from "./content/lesson-practice/index.ts";',
          'export { LESSON_THEORY_CHUNK_VERSION, lessonTheoryChunkPath } from "./content/lesson-theory/chunk-format.ts";',
          'export { coreLessonOrder } from "./content/lessons-core.ts";',
          'export { multimodalLessons } from "./content/lessons-multimodal.ts";',
        ].join("\n"),
        loader: "ts",
        resolveDir: ROOT,
        sourcefile: "lesson-theory-chunk-entry.ts",
      },
      outfile,
      bundle: true,
      format: "esm",
      platform: "node",
      target: "node22",
      logLevel: "silent",
    });
    return await import(pathToFileURL(outfile).href);
  } finally {
    fs.rmSync(scratch, { recursive: true, force: true });
  }
}

function removeOrphanJsonFiles(outputDirectory, expectedFiles) {
  const resolvedDirectory = path.resolve(outputDirectory);
  for (const entry of fs.readdirSync(resolvedDirectory, { withFileTypes: true })) {
    if (!entry.isFile() || !/\.json$/i.test(entry.name) || expectedFiles.has(entry.name)) {
      continue;
    }
    const target = path.resolve(resolvedDirectory, entry.name);
    // `readdir` chỉ trả basename, nhưng vẫn kiểm lại ranh giới trước khi unlink:
    // cleanup không được phép thoát khỏi đúng thư mục output hoặc đi qua symlink.
    if (path.dirname(target) !== resolvedDirectory) {
      throw new Error(`Từ chối xóa orphan ngoài thư mục lesson theory: ${target}`);
    }
    fs.unlinkSync(target);
  }
}

let atomicWriteCounter = 0;

function readExistingRegularFile(target) {
  if (!fs.existsSync(target)) return null;
  const stats = fs.lstatSync(target);
  if (stats.isSymbolicLink() || !stats.isFile() || stats.nlink !== 1) {
    throw new Error(`Từ chối ghi đè chunk không phải file thường độc lập: ${target}`);
  }
  return fs.readFileSync(target, "utf8");
}

function writeFileAtomically(target, payload) {
  atomicWriteCounter += 1;
  const temporary = path.join(
    path.dirname(target),
    `.${path.basename(target)}.${process.pid}.${atomicWriteCounter}.tmp`,
  );
  let descriptor;
  try {
    descriptor = fs.openSync(temporary, "wx");
    fs.writeFileSync(descriptor, payload, "utf8");
    fs.fsyncSync(descriptor);
    fs.closeSync(descriptor);
    descriptor = undefined;
    // Rename thay directory entry thay vì mở target để ghi, nên symlink hoặc
    // hardlink xuất hiện sau bước lstat cũng không thể bị follow.
    fs.renameSync(temporary, target);
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
}

export async function emitLessonTheoryChunks(options = {}) {
  const outputDirectory = path.resolve(options.outputDirectory ?? DEFAULT_OUTPUT_DIRECTORY);
  if (path.basename(outputDirectory) !== "lesson-theory") {
    throw new Error(
      `Thư mục output chunk phải có segment cuối là lesson-theory: ${outputDirectory}`,
    );
  }
  const {
    LESSON_THEORY_CHUNK_VERSION,
    assertLessonTheoryCoverage,
    assertLessonPracticeCoverage,
    coreLessonOrder,
    lessonDeepTheory,
    lessonTheoryChunkPath,
    lessonPractice,
    multimodalLessons,
  } = await loadLessonTheorySource();

  const lessonIds = [
    ...coreLessonOrder,
    ...multimodalLessons.map((lesson) => lesson.id),
  ];
  const uniqueIds = new Set(lessonIds);
  if (lessonIds.length !== 78 || uniqueIds.size !== lessonIds.length) {
    throw new Error(
      `Catalog chunk lý thuyết phải có đúng 78 ID duy nhất; nhận ${lessonIds.length} ID, ` +
        `${uniqueIds.size} ID duy nhất.`,
    );
  }

  const outputFileByLessonId = new Map();
  for (const lessonId of lessonIds) {
    const validatedChunkPath = lessonTheoryChunkPath(lessonId);
    outputFileByLessonId.set(lessonId, path.posix.basename(validatedChunkPath));
  }

  // Cổng bắt buộc trước mọi thao tác output: không phát hành một tập chunk nếu
  // thiếu bài, thừa bài hoặc một entry không đạt contract nội dung.
  assertLessonPracticeCoverage(lessonIds);
  assertLessonTheoryCoverage(lessonIds);

  const chunks = lessonIds.map((lessonId) => ({
    version: LESSON_THEORY_CHUNK_VERSION,
    lessonId,
    theory: lessonDeepTheory[lessonId],
    practice: lessonPractice[lessonId],
  }));
  fs.mkdirSync(outputDirectory, { recursive: true });
  if (fs.lstatSync(outputDirectory).isSymbolicLink()) {
    throw new Error(`Từ chối sinh chunk qua symlink: ${outputDirectory}`);
  }
  const expectedFiles = new Set(
    chunks.map((chunk) => outputFileByLessonId.get(chunk.lessonId)),
  );
  removeOrphanJsonFiles(outputDirectory, expectedFiles);

  let bytes = 0;
  for (const chunk of chunks) {
    const payload = `${JSON.stringify(chunk)}\n`;
    const target = path.join(outputDirectory, outputFileByLessonId.get(chunk.lessonId));
    const current = readExistingRegularFile(target);
    if (current !== payload) writeFileAtomically(target, payload);
    bytes += Buffer.byteLength(payload, "utf8");
  }

  return { count: chunks.length, bytes, directory: outputDirectory };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await emitLessonTheoryChunks();
  console.log(
    `Đã sinh ${result.count} lesson theory chunk ` +
      `(${(result.bytes / 1024).toFixed(1)} KB raw) tại public/data/lesson-theory/.`,
  );
}
