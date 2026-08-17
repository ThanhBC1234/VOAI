import assert from "node:assert/strict";
import { access, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { BASE_PATH, REPOSITORY_NAME } from "../site.config.mjs";

const artifactRoot = path.resolve("dist", "client");
const basePath = BASE_PATH;
const routes = [
  ["", /VOAI Lab — Lộ trình AI từ nền tảng đến thi đấu/],
  ["roadmap", /Lộ trình 290 ngày — VOAI Lab/],
  ["lessons", /78 bài giảng thuật toán — VOAI Lab/],
  ["assessments", /Đánh giá 290 phiên — VOAI Lab/],
  ["labs", /Phòng lab tương tác — VOAI Lab/],
  ["practice", /Tự code &amp; chấm bài — VOAI Lab/],
  ["resources", /Tài nguyên học hợp pháp — VOAI Lab/],
  ["notebooks", /Notebook Colab — VOAI Lab/],
  ["theory", /Lý thuyết vòng 1 — VOAI Lab/],
  ["math", /Toán cho VOAI — VOAI Lab/],
];
const expectedPrerenderRoutes = [
  "/",
  "/404",
  "/assessments",
  "/labs",
  "/lessons",
  "/math",
  "/notebooks",
  "/practice",
  "/resources",
  "/roadmap",
  "/theory",
];

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function assertExactCase(filePath) {
  const relativePath = path.relative(artifactRoot, filePath);
  assert.ok(
    relativePath && !relativePath.startsWith("..") && !path.isAbsolute(relativePath),
    `Reference escapes the Pages artifact: ${filePath}`,
  );
  let current = artifactRoot;
  for (const segment of relativePath.split(path.sep)) {
    const entries = await readdir(current);
    assert.ok(entries.includes(segment), `Case-sensitive artifact path is missing: ${relativePath}`);
    current = path.join(current, segment);
  }
}

function localReferences(html) {
  return [...html.matchAll(/\b(?:href|src)="([^"]+)"/g)]
    .map((match) => match[1].replaceAll("&amp;", "&"))
    .filter((value) => !/^(?:https?:|data:|mailto:|tel:|#)/i.test(value));
}

function artifactPathFor(reference) {
  assert.ok(reference.startsWith(`${basePath}/`), `Unprefixed root reference: ${reference}`);
  const url = new URL(reference, "https://example.github.io");
  const relativeUrlPath = decodeURIComponent(url.pathname.slice(`${basePath}/`.length));
  const relativeFilePath =
    relativeUrlPath === "" || relativeUrlPath.endsWith("/")
      ? path.join(relativeUrlPath, "index.html")
      : relativeUrlPath;
  const filePath = path.resolve(artifactRoot, relativeFilePath);
  const relativePath = path.relative(artifactRoot, filePath);
  assert.ok(
    relativePath && !relativePath.startsWith("..") && !path.isAbsolute(relativePath),
    `Reference escapes the Pages artifact: ${reference}`,
  );
  return filePath;
}

test("Vinext prerender manifest reports every route as rendered", async () => {
  const manifestPath = path.resolve("dist", "server", "vinext-prerender.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  assert.ok(manifest && typeof manifest === "object" && !Array.isArray(manifest));
  assert.ok(Array.isArray(manifest.routes), "Prerender manifest has no routes array");
  assert.equal(manifest.routes.length, expectedPrerenderRoutes.length);
  assert.deepEqual(
    manifest.routes.map((entry) => entry.route).sort(),
    [...expectedPrerenderRoutes].sort(),
  );
  for (const entry of manifest.routes) {
    assert.equal(entry.status, "rendered", `${entry.route} prerender status`);
  }
});

test("Pages export contains real route documents, RSC companions, and a real 404", async () => {
  assert.ok(await exists(artifactRoot), "Run npm run build:pages before this test");
  assert.ok(await exists(path.join(artifactRoot, "_next")), "Missing root _next assets");
  assert.ok(await exists(path.join(artifactRoot, ".nojekyll")), "Missing .nojekyll");
  assert.equal((await stat(path.join(artifactRoot, ".nojekyll"))).size, 0);
  assert.equal(
    await exists(path.join(artifactRoot, REPOSITORY_NAME)),
    false,
    `Artifact must deploy from its root, not a nested ${REPOSITORY_NAME} directory`,
  );

  for (const [route, title] of routes) {
    const routeDirectory = route ? path.join(artifactRoot, route) : artifactRoot;
    const htmlPath = path.join(routeDirectory, "index.html");
    const rscPath = path.join(routeDirectory, "index.rsc");
    const html = await readFile(htmlPath, "utf8");
    assert.match(html, /^<!DOCTYPE html>/i, `/${route} must be a rendered document`);
    assert.match(html, title, `/${route} title`);
    assert.doesNotMatch(html, /<meta[^>]+http-equiv=["']?refresh/i, `/${route} must not be a redirect shim`);
    assert.ok((await stat(htmlPath)).size > 5_000, `/${route} HTML is unexpectedly small`);
    assert.ok((await stat(rscPath)).size > 0, `/${route} is missing index.rsc`);
  }

  const notFound = await readFile(path.join(artifactRoot, "404.html"), "utf8");
  assert.match(notFound, /^<!DOCTYPE html>/i);
  assert.match(notFound, /404: This page could not be found\./);
  assert.match(notFound, /<meta name="robots" content="noindex"\s*\/>/i);
  assert.doesNotMatch(notFound, /<meta[^>]+http-equiv=["']?refresh/i);
});

test("every local HTML asset and navigation reference is base-prefixed and exists", async () => {
  const htmlFiles = [
    path.join(artifactRoot, "index.html"),
    path.join(artifactRoot, "404.html"),
    ...routes.slice(1).map(([route]) => path.join(artifactRoot, route, "index.html")),
  ];
  let nextAssetReferences = 0;
  for (const htmlFile of htmlFiles) {
    const html = await readFile(htmlFile, "utf8");
    for (const reference of localReferences(html)) {
      if (reference.startsWith(`${basePath}/_next/`)) nextAssetReferences += 1;
      const target = artifactPathFor(reference);
      assert.ok(await exists(target), `${path.relative(artifactRoot, htmlFile)} references missing ${reference}`);
      await assertExactCase(target);
    }
  }
  assert.ok(nextAssetReferences > 0, `No ${basePath}/_next asset references were found`);
});

// PERF-P3-01: chunk chi tiết assessment không nằm trong HTML nên không được test
// tham chiếu nào phía trên kiểm. Nếu `prepare-pages` hay `public/` sai đường, bản
// deploy vẫn “xanh” nhưng người học bấm vào bài nào cũng gặp lỗi tải.
test("Pages export ships every assessment detail chunk the catalog points at", async () => {
  const chunkDirectory = path.join(artifactRoot, "data", "assessments");
  assert.ok(await exists(chunkDirectory), "Bản export thiếu thư mục data/assessments");
  const files = (await readdir(chunkDirectory)).filter((name) => name.endsWith(".json"));
  assert.equal(files.length, 42, `Có ${files.length} chunk, phải là 41 tuần + finale`);
  assert.ok(files.includes("finale.json"));

  const sessionIds = new Set();
  for (const file of files) {
    assert.match(file, /^(?:week-\d{2}|finale)\.json$/, `Tên chunk lạ: ${file}`);
    const chunk = JSON.parse(await readFile(path.join(chunkDirectory, file), "utf8"));
    assert.equal(chunk.version, 1);
    assert.equal(`${chunk.chunk}.json`, file);
    assert.ok(Array.isArray(chunk.details) && chunk.details.length > 0);
    for (const detail of chunk.details) {
      assert.equal(sessionIds.has(detail.sessionId), false, `Trùng ${detail.sessionId}`);
      sessionIds.add(detail.sessionId);
      assert.ok(detail.codingTask.length > 0);
      assert.ok(detail.retrievalQuestions.length >= 2);
    }
  }
  assert.equal(sessionIds.size, 290, "Chunk không phủ đủ 290 phiên");

  // Và payload đầu vẫn phải nhẹ: 290 đề bài không được quay lại HTML.
  const assessments = await readFile(path.join(artifactRoot, "assessments", "index.html"), "utf8");
  assert.ok(
    assessments.length < 500_000,
    `/assessments HTML nặng ${assessments.length} byte — chi tiết có thể đã quay lại payload đầu`,
  );
  assert.equal((assessments.match(/data-assessment-item=/g) ?? []).length, 290);
});

test("Pages metadata, assessment links, and browser worker retain the repository base path", async () => {
  const home = await readFile(path.join(artifactRoot, "index.html"), "utf8");
  const roadmap = await readFile(path.join(artifactRoot, "roadmap", "index.html"), "utf8");
  const assessments = await readFile(path.join(artifactRoot, "assessments", "index.html"), "utf8");
  const worker = await readFile(path.join(artifactRoot, "pyodide-worker.js"), "utf8");

  assert.match(home, new RegExp(`https://[^/"']+${basePath}/og\\.png`));
  assert.doesNotMatch(home, /dixmilsapin\.chatgpt\.site/);
  // `\\?` chứ không phải `\?`: đây là template literal nên một dấu gạch chéo bị
  // chuỗi nuốt mất, và regex sẽ hiểu `?` là "ký tự trước không bắt buộc".
  assert.match(roadmap, new RegExp(`href="${basePath}/assessments/\\?session=w01-lesson-1"`));
  assert.match(roadmap, new RegExp(`href="${basePath}/lessons/\\?lesson=foundation-python"`));
  assert.equal((assessments.match(/data-assessment-item=/g) ?? []).length, 290);
  assert.match(assessments, /id="assessment-w01-lesson-1"/);
  // SUPPLY-P3-01: phiên bản vẫn được pin, ưu tiên bản cùng origin, và script
  // phải được băm kiểm tra trước khi thực thi thay vì importScripts thẳng.
  assert.match(worker, /const PYODIDE_VERSION = "0\.27\.7"/);
  assert.match(worker, /SELF_HOSTED_BASE/);
  assert.match(worker, /sha384/);
  assert.doesNotMatch(worker, /importScripts\(/, "vẫn nạp script thẳng từ CDN mà không xác minh");
  // Băm phải được pin thật. Chuỗi rỗng nghĩa là worker chỉ ghi cảnh báo rồi vẫn
  // chạy script chưa xác minh — đúng lỗ hổng SUPPLY-P3-01.
  assert.match(
    worker,
    /PYODIDE_LOADER_SHA384\s*=\s*\n?\s*"sha384-[A-Za-z0-9+/=]{60,}"/,
    "PYODIDE_LOADER_SHA384 chưa được pin nên kiểm tra toàn vẹn đang tắt",
  );

  const nextRoot = path.join(artifactRoot, "_next");
  const stack = [nextRoot];
  const JavaScript = [];
  while (stack.length > 0) {
    const directory = stack.pop();
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) stack.push(entryPath);
      else if (entry.name.endsWith(".js")) JavaScript.push(await readFile(entryPath, "utf8"));
    }
  }
  const clientBundle = JavaScript.join("\n");
  assert.match(clientBundle, /pyodide-worker\.js/, "Practice bundle does not reference the worker");
  assert.match(
    clientBundle,
    new RegExp(REPOSITORY_NAME),
    "Client bundle does not contain the configured Pages base path",
  );
});
