/**
 * Đo *tổng transfer ban đầu* của một route trong bản export GitHub Pages.
 *
 * PERF-P3-01 yêu cầu ngân sách tính đủ HTML + RSC + mọi JS mà tài liệu tự nạp
 * trước tương tác, ở cả raw, gzip và brotli. Đo hai tệp HTML là không đủ: phần
 * lớn khối lượng nằm trong RSC payload và trong các chunk `modulepreload`.
 *
 * Cách đo — chỉ đếm thứ **trình duyệt thật sự tải trước tương tác**:
 * - `<script src>` và `<link rel="modulepreload"|"preload" as="script">` trong
 *   HTML. Vite phát ra đủ thẻ `modulepreload` cho toàn bộ đồ thị import *tĩnh*
 *   của route, nên tập này chính là initial JS set.
 * - Chunk chỉ được nạp qua `import(…)` **không** tính: đó là phần đã bị đẩy ra
 *   khỏi payload đầu, chỉ tải khi người dùng cần.
 *
 * Cạm bẫy đã dính một lần: không được quét chuỗi đường dẫn bên trong chunk. Bản
 * dựng rolldown gom mọi chunk client vào một mảng `__vite__mapDeps` dưới dạng
 * chuỗi thường; đếm theo chuỗi sẽ cộng nhầm cả `LessonsExplorer` (267 KB) vào
 * mọi route và làm sai lệch hoàn toàn con số.
 *
 * Dùng: `node scripts/measure-payload.mjs [--json] [route…]`
 */

import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { brotliCompressSync, gzipSync } from "node:zlib";
import path from "node:path";
import { BASE_PATH } from "../site.config.mjs";

const ARTIFACT_ROOT = path.resolve("dist", "client");
const DEFAULT_ROUTES = ["assessments", "theory", "roadmap", "lessons"];

/**
 * Tập JS mà tài liệu tự khai báo: `<script src>` cộng các thẻ `<link>` có
 * `rel="modulepreload"` hoặc `rel="preload" as="script"`.
 */
function initialScriptSet(html) {
  const references = new Set();
  for (const match of html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)) {
    references.add(match[1].replaceAll("&amp;", "&"));
  }
  for (const match of html.matchAll(/<link\b[^>]*>/g)) {
    const tag = match[0];
    const isModulePreload = /\brel="modulepreload"/.test(tag);
    const isScriptPreload = /\brel="preload"/.test(tag) && /\bas="script"/.test(tag);
    if (!isModulePreload && !isScriptPreload) continue;
    const href = tag.match(/\bhref="([^"]+)"/);
    if (href) references.add(href[1].replaceAll("&amp;", "&"));
  }
  return new Set(
    [...references].filter(
      (reference) => reference.startsWith(`${BASE_PATH}/_next/`) && reference.endsWith(".js"),
    ),
  );
}

function artifactPathFor(reference) {
  const relative = reference.slice(`${BASE_PATH}/`.length);
  const filePath = path.resolve(ARTIFACT_ROOT, relative);
  const inside = path.relative(ARTIFACT_ROOT, filePath);
  if (!inside || inside.startsWith("..") || path.isAbsolute(inside)) {
    throw new Error(`Tham chiếu thoát khỏi artifact: ${reference}`);
  }
  return filePath;
}

function sizesOf(buffer) {
  return {
    raw: buffer.length,
    gzip: gzipSync(buffer).length,
    brotli: brotliCompressSync(buffer).length,
  };
}

export async function measureRoute(route) {
  const directory = route ? path.join(ARTIFACT_ROOT, route) : ARTIFACT_ROOT;
  const html = await readFile(path.join(directory, "index.html"));
  const rsc = await readFile(path.join(directory, "index.rsc"));

  const scripts = initialScriptSet(html.toString("utf8"));
  const javascript = { raw: 0, gzip: 0, brotli: 0 };
  for (const reference of scripts) {
    const sizes = sizesOf(await readFile(artifactPathFor(reference)));
    javascript.raw += sizes.raw;
    javascript.gzip += sizes.gzip;
    javascript.brotli += sizes.brotli;
  }

  const htmlSizes = sizesOf(html);
  const rscSizes = sizesOf(rsc);
  return {
    route: `/${route}`,
    chunks: scripts.size,
    scripts: [...scripts].sort(),
    html: htmlSizes,
    rsc: rscSizes,
    javascript,
    total: {
      raw: htmlSizes.raw + rscSizes.raw + javascript.raw,
      gzip: htmlSizes.gzip + rscSizes.gzip + javascript.gzip,
      brotli: htmlSizes.brotli + rscSizes.brotli + javascript.brotli,
    },
  };
}

function formatKilobytes(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

async function main() {
  const args = process.argv.slice(2);
  const asJson = args.includes("--json");
  const routes = args.filter((value) => !value.startsWith("--"));
  const measurements = [];
  for (const route of routes.length > 0 ? routes : DEFAULT_ROUTES) {
    measurements.push(await measureRoute(route));
  }
  if (asJson) {
    console.log(JSON.stringify(measurements, null, 2));
    return;
  }
  console.log("Route            chunks     HTML        RSC        JS    TOTAL raw     gzip    brotli");
  for (const item of measurements) {
    console.log(
      [
        item.route.padEnd(16),
        String(item.chunks).padStart(6),
        " ",
        formatKilobytes(item.html.raw).padStart(9),
        formatKilobytes(item.rsc.raw).padStart(10),
        formatKilobytes(item.javascript.raw).padStart(9),
        formatKilobytes(item.total.raw).padStart(12),
        formatKilobytes(item.total.gzip).padStart(9),
        formatKilobytes(item.total.brotli).padStart(9),
      ].join(""),
    );
  }
}

// Windows sinh `file:///C:/…`; so sánh chuỗi thô sẽ luôn sai nên phải dùng
// `pathToFileURL` thay vì tự ghép tiền tố.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
