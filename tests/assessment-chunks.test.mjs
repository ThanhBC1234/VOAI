/**
 * PERF-P3-01 — cổng hồi quy cho việc tách catalog / chunk của `/assessments`.
 *
 * Ba thứ được khoá lại ở đây, vì mỗi thứ đều đã từng là lý do phải hoàn nguyên
 * lần refactor trước:
 *
 * 1. Catalog phải **đủ** để lọc, dựng nháp và kiểm định lịch sử attempt mà
 *    không cần chunk, nhưng **không** được mang theo phần chi tiết nặng.
 * 2. Chunk phải phủ trọn 290 phiên, mỗi phiên đúng một chunk, và tệp sinh ra
 *    phải tất định.
 * 3. Loader phải chống tải trùng, cache thành công, **không** cache thất bại và
 *    từ chối dữ liệu lạ.
 */

import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test, { after } from "node:test";
import { cleanupLoadedModules, loadTypeScriptModule } from "./helpers/load-module.mjs";

const catalogModule = await loadTypeScriptModule("content/assessment-catalog.ts");
const loaderModule = await loadTypeScriptModule("lib/assessment-details.ts");
const {
  ASSESSMENT_CATALOG,
  ASSESSMENT_CATALOG_VALIDATION,
  ASSESSMENT_CHUNK_VERSION,
  assessmentChunkKey,
  assessmentChunkPath,
  buildAssessmentChunks,
  detailOf,
} = catalogModule;
const {
  cachedAssessmentChunk,
  loadAssessmentChunk,
  parseAssessmentChunk,
  resetAssessmentChunkCache,
} = loaderModule;

const CHUNK_DIRECTORY = new URL("../public/data/assessments/", import.meta.url);

after(async () => {
  await cleanupLoadedModules();
});

test("catalog phủ đủ 290 phiên và chỉ mang những trường màn hình đầu thật sự cần", () => {
  assert.equal(ASSESSMENT_CATALOG.length, 290);
  assert.equal(ASSESSMENT_CATALOG_VALIDATION.total, 290);
  assert.equal(ASSESSMENT_CATALOG_VALIDATION.chunks, 42);

  const heavyFields = [
    "retrievalQuestions",
    "codingTask",
    "visibleCriteria",
    "hiddenTestCategories",
    "explainPrompt",
    "aiBoundary",
    "passRule",
    "mastery",
  ];
  for (const entry of ASSESSMENT_CATALOG) {
    for (const field of heavyFields) {
      assert.ok(
        !(field in entry),
        `catalog vẫn mang trường chi tiết "${field}" ở ${entry.sessionId}`,
      );
    }
    // Đủ để `emptyDraft()` dựng số ô nhập mà không cần nội dung câu hỏi.
    assert.ok(Number.isInteger(entry.retrievalCount) && entry.retrievalCount >= 2);
    // Đủ để `isStoredAttempt()` chấm lại một attempt cũ khi chưa có chunk nào.
    assert.equal(
      Object.values(entry.scoreWeights).reduce((sum, weight) => sum + weight, 0),
      100,
    );
    assert.ok(entry.minimumScore > 0 && entry.minimumScore <= 100);
    for (const category of ["retrieval", "coding", "validation", "explanation"]) {
      assert.ok(entry.minimumSectionScores[category] <= entry.scoreWeights[category]);
    }
    // Đủ để bộ lọc tìm kiếm giữ nguyên hành vi cũ.
    assert.ok(entry.outcome.trim().length > 0);
  }
});

test("catalog nhỏ hơn nhiều lần so với dữ liệu đầy đủ", async () => {
  const catalogBytes = Buffer.byteLength(JSON.stringify(ASSESSMENT_CATALOG), "utf8");
  const detailBytes = buildAssessmentChunks().reduce(
    (sum, chunk) => sum + Buffer.byteLength(JSON.stringify(chunk), "utf8"),
    0,
  );
  // Ngân sách: catalog phải dưới 1/5 phần chi tiết, nếu không việc tách là vô nghĩa.
  assert.ok(
    catalogBytes * 5 < detailBytes,
    `catalog ${catalogBytes} B so với chi tiết ${detailBytes} B — tỷ lệ tách quá thấp`,
  );
});

test("chunk phân hoạch trọn 290 phiên, mỗi phiên đúng một chunk", () => {
  const chunks = buildAssessmentChunks();
  assert.equal(chunks.length, 42);
  const seen = new Map();
  for (const chunk of chunks) {
    assert.equal(chunk.version, ASSESSMENT_CHUNK_VERSION);
    assert.ok(chunk.details.length > 0);
    for (const detail of chunk.details) {
      assert.equal(seen.has(detail.sessionId), false, `trùng ${detail.sessionId}`);
      seen.set(detail.sessionId, chunk.chunk);
    }
  }
  assert.equal(seen.size, 290);
  for (const entry of ASSESSMENT_CATALOG) {
    assert.equal(
      seen.get(entry.sessionId),
      entry.chunk,
      `${entry.sessionId} trỏ tới chunk không chứa nó`,
    );
  }
  assert.equal(assessmentChunkKey(7), "week-07");
  assert.equal(assessmentChunkKey(null), "finale");
  assert.equal(assessmentChunkPath("week-07"), "/data/assessments/week-07.json");
  assert.throws(() => assessmentChunkPath("../secrets"), /không hợp lệ/);
});

test("tệp chunk đã sinh khớp đúng nguồn và tất định", async () => {
  const files = (await readdir(CHUNK_DIRECTORY)).filter((name) => name.endsWith(".json"));
  const chunks = buildAssessmentChunks();
  assert.equal(files.length, chunks.length, "số tệp chunk lệch với nguồn");
  for (const chunk of chunks) {
    const raw = await readFile(new URL(`${chunk.chunk}.json`, CHUNK_DIRECTORY), "utf8");
    assert.equal(raw, `${JSON.stringify(chunk)}\n`, `${chunk.chunk}.json lệch với nguồn`);
    assert.deepEqual(JSON.parse(raw), JSON.parse(JSON.stringify(chunk)));
  }
});

test("parseAssessmentChunk từ chối phong bì sai và dữ liệu hỏng", () => {
  const [first] = buildAssessmentChunks();
  const good = JSON.parse(JSON.stringify(first));
  assert.ok(parseAssessmentChunk(good.chunk, good));

  assert.equal(parseAssessmentChunk(good.chunk, null), null);
  assert.equal(parseAssessmentChunk(good.chunk, "<html>404</html>"), null);
  assert.equal(parseAssessmentChunk(good.chunk, { ...good, version: 99 }), null);
  assert.equal(parseAssessmentChunk("week-99", good), null, "tên chunk lệch vẫn được nhận");
  assert.equal(parseAssessmentChunk(good.chunk, { ...good, details: [] }), null);
  assert.equal(
    parseAssessmentChunk(good.chunk, { ...good, details: [{ sessionId: "x" }] }),
    null,
  );
  assert.equal(
    parseAssessmentChunk(good.chunk, { ...good, details: [good.details[0], good.details[0]] }),
    null,
    "chunk có sessionId trùng vẫn được nhận",
  );
});

test("loader gộp request trùng, cache thành công và không cache thất bại", async () => {
  resetAssessmentChunkCache();
  const [first] = buildAssessmentChunks();
  const key = first.chunk;
  let calls = 0;

  const failing = async () => {
    calls += 1;
    return new Response("nope", { status: 503 });
  };
  await assert.rejects(
    () => loadAssessmentChunk(key, { fetchImplementation: failing }),
    /HTTP 503/,
  );
  assert.equal(calls, 1);
  assert.equal(cachedAssessmentChunk(key), null, "thất bại không được cache");

  // Lần thử lại phải thật sự fetch lại chứ không trả về lỗi đã nhớ.
  calls = 0;
  const ok = async () => {
    calls += 1;
    return new Response(JSON.stringify(first), {
      headers: { "content-type": "application/json" },
    });
  };
  const [a, b] = await Promise.all([
    loadAssessmentChunk(key, { fetchImplementation: ok }),
    loadAssessmentChunk(key, { fetchImplementation: ok }),
  ]);
  assert.equal(calls, 1, "hai lời gọi song song vẫn tải hai lần");
  assert.equal(a, b);
  assert.equal(Object.keys(a).length, first.details.length);

  const third = await loadAssessmentChunk(key, { fetchImplementation: ok });
  assert.equal(calls, 1, "chunk đã cache vẫn bị tải lại");
  assert.equal(third, a);
  assert.deepEqual(
    third[first.details[0].sessionId],
    JSON.parse(JSON.stringify(first.details[0])),
  );

  resetAssessmentChunkCache();
});

test("loader từ chối phản hồi 200 nhưng nội dung không phải chunk", async () => {
  resetAssessmentChunkCache();
  const [first] = buildAssessmentChunks();
  const wrongPayload = async () =>
    new Response(JSON.stringify({ version: 1, chunk: "week-99", details: [] }), {
      headers: { "content-type": "application/json" },
    });
  await assert.rejects(
    () => loadAssessmentChunk(first.chunk, { fetchImplementation: wrongPayload }),
    /không đúng định dạng/,
  );
  assert.equal(cachedAssessmentChunk(first.chunk), null);
  resetAssessmentChunkCache();
});

test("detailOf giữ đủ mọi trường mà giao diện chi tiết đang render", () => {
  const chunk = buildAssessmentChunks()[0];
  const detail = chunk.details[0];
  for (const field of [
    "sessionId",
    "retrievalQuestions",
    "codingTask",
    "visibleCriteria",
    "hiddenTestCategories",
    "explainPrompt",
    "aiBoundary",
    "passRule",
    "mastery",
  ]) {
    assert.ok(field in detail, `detail thiếu trường ${field}`);
  }
  assert.equal(typeof detailOf, "function");
  assert.ok(detail.passRule.requiredSections.length > 0);
  assert.ok(detail.passRule.automaticFailConditions.length > 0);
  assert.ok(detail.mastery.evidenceRequired.length > 0);
});
