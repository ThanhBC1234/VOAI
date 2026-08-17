/**
 * Sinh chunk chi tiết assessment tĩnh vào `public/data/assessments/`.
 *
 * PERF-P3-01: payload đầu của `/assessments` chỉ mang catalog; phần chi tiết
 * của từng tuần nằm ở đây và chỉ được tải khi người học chọn một bài trong
 * tuần đó. Đầu ra là JSON tĩnh nên chạy được trên GitHub Pages, không cần
 * backend và vẫn nằm trong HTTP cache của trình duyệt.
 *
 * Chạy tự động trong `scripts/run-vinext.mjs` trước mọi chế độ (dev/build/
 * start/pages), nên không có đường nào phát hành trang mà thiếu chunk.
 *
 * Đầu ra **tất định**: cùng nội dung nguồn thì cùng byte, để chạy lại không tạo
 * diff và không làm hỏng cache.
 */

import { build } from "esbuild";
import fs from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(".");
const OUTPUT_DIRECTORY = path.join(ROOT, "public", "data", "assessments");

async function loadCatalogModule() {
  const scratch = fs.mkdtempSync(path.join(tmpdir(), "voai-chunks-"));
  const outfile = path.join(scratch, "assessment-catalog.mjs");
  try {
    await build({
      entryPoints: [path.join(ROOT, "content", "assessment-catalog.ts")],
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

export async function emitAssessmentChunks() {
  const { buildAssessmentChunks, ASSESSMENT_CATALOG_VALIDATION } = await loadCatalogModule();
  const chunks = buildAssessmentChunks();

  fs.mkdirSync(OUTPUT_DIRECTORY, { recursive: true });
  const expected = new Set(chunks.map((chunk) => `${chunk.chunk}.json`));
  // Xoá chunk mồ côi của lần sinh trước: một tuần bị đổi tên mà tệp cũ còn lại
  // sẽ khiến bản export mang dữ liệu không ai tham chiếu tới.
  for (const entry of fs.readdirSync(OUTPUT_DIRECTORY)) {
    if (entry.endsWith(".json") && !expected.has(entry)) {
      fs.rmSync(path.join(OUTPUT_DIRECTORY, entry));
    }
  }

  let bytes = 0;
  for (const chunk of chunks) {
    const payload = `${JSON.stringify(chunk)}\n`;
    const target = path.join(OUTPUT_DIRECTORY, `${chunk.chunk}.json`);
    // Chỉ ghi khi khác: giữ nguyên mtime để watcher của dev server không phải
    // rebuild vòng lặp mỗi lần khởi động.
    const current = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : null;
    if (current !== payload) fs.writeFileSync(target, payload, "utf8");
    bytes += Buffer.byteLength(payload, "utf8");
  }

  return {
    chunks: chunks.length,
    assessments: ASSESSMENT_CATALOG_VALIDATION.total,
    bytes,
    directory: OUTPUT_DIRECTORY,
  };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await emitAssessmentChunks();
  console.log(
    `Đã sinh ${result.chunks} chunk cho ${result.assessments} assessment ` +
      `(${(result.bytes / 1024).toFixed(1)} KB raw) tại public/data/assessments/.`,
  );
}
