/**
 * Cổng hồi quy cho lazy-load lý thuyết: source → 78 file tất định → parser và
 * loader an toàn dưới GitHub Pages base path.
 */

import assert from "node:assert/strict";
import { link, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test, { after } from "node:test";
import { emitLessonTheoryChunks } from "../scripts/emit-lesson-theory-chunks.mjs";
import { cleanupLoadedModules, loadTypeScriptModule } from "./helpers/load-module.mjs";

const previousBasePath = process.env.NEXT_PUBLIC_BASE_PATH;
process.env.NEXT_PUBLIC_BASE_PATH = "/VOAI";
const chunkFormatModule = await loadTypeScriptModule("content/lesson-theory/chunk-format.ts");
const loaderModule = await loadTypeScriptModule("lib/lesson-theory-details.ts");
if (previousBasePath === undefined) delete process.env.NEXT_PUBLIC_BASE_PATH;
else process.env.NEXT_PUBLIC_BASE_PATH = previousBasePath;

const theoryModule = await loadTypeScriptModule("content/lesson-theory/index.ts");
const coreModule = await loadTypeScriptModule("content/lessons-core.ts");
const multimodalModule = await loadTypeScriptModule("content/lessons-multimodal.ts");

const {
  LESSON_THEORY_CHUNK_VERSION,
  isValidLessonTheoryId,
  lessonTheoryChunkPath,
} = chunkFormatModule;
const {
  cachedLessonTheoryDetails,
  loadLessonTheoryDetails,
  parseLessonTheoryChunk,
  resetLessonTheoryDetailsCache,
} = loaderModule;
const { assertLessonTheoryCoverage, lessonDeepTheory } = theoryModule;
const lessonIds = [
  ...coreModule.coreLessonOrder,
  ...multimodalModule.multimodalLessons.map((lesson) => lesson.id),
];

const scratchDirectory = await mkdtemp(path.join(tmpdir(), "voai-lesson-theory-test-"));
const outputDirectory = path.join(scratchDirectory, "lesson-theory");
const emission = await emitLessonTheoryChunks({ outputDirectory });

function chunkFor(lessonId) {
  return {
    version: LESSON_THEORY_CHUNK_VERSION,
    lessonId,
    theory: lessonDeepTheory[lessonId],
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

after(async () => {
  resetLessonTheoryDetailsCache();
  await Promise.all([
    cleanupLoadedModules(),
    rm(scratchDirectory, { recursive: true, force: true }),
  ]);
});

test("path chỉ nhận lesson ID kebab-case an toàn và giữ tên file JSON", () => {
  assert.equal(isValidLessonTheoryId("foundation-python"), true);
  assert.equal(
    lessonTheoryChunkPath("foundation-python"),
    "/data/lesson-theory/foundation-python.json",
  );
  for (const invalid of [
    "",
    ".",
    "../secret",
    "a/b",
    "a\\b",
    "UPPERCASE",
    "under_score",
    "double--dash",
    "query?x=1",
    "already.json",
  ]) {
    assert.equal(isValidLessonTheoryId(invalid), false, `nhận nhầm ID ${invalid}`);
    assert.throws(() => lessonTheoryChunkPath(invalid), /ID bài học không hợp lệ/);
  }
});

test("emitter sinh đúng 78 file, đúng source, tất định và xóa orphan JSON an toàn", async () => {
  assert.equal(lessonIds.length, 78);
  assert.equal(new Set(lessonIds).size, 78);
  assert.doesNotThrow(() => assertLessonTheoryCoverage(lessonIds));
  assert.equal(emission.count, 78);

  const unsafeOutput = path.join(scratchDirectory, "not-the-chunk-directory");
  await assert.rejects(
    () => emitLessonTheoryChunks({ outputDirectory: unsafeOutput }),
    /segment cuối là lesson-theory/,
  );
  await assert.rejects(readdir(unsafeOutput), /ENOENT/, "emitter đã mkdir trước khi fail");

  const expectedFiles = lessonIds
    .map((id) => path.posix.basename(lessonTheoryChunkPath(id)))
    .sort();
  const actualFiles = (await readdir(outputDirectory))
    .filter((name) => name.endsWith(".json"))
    .sort();
  assert.deepEqual(actualFiles, expectedFiles);

  let expectedBytes = 0;
  for (const lessonId of lessonIds) {
    const expected = `${JSON.stringify(chunkFor(lessonId))}\n`;
    const raw = await readFile(path.join(outputDirectory, `${lessonId}.json`), "utf8");
    assert.equal(raw, expected, `${lessonId}.json lệch source`);
    const parsed = JSON.parse(raw);
    assert.deepEqual(parsed, chunkFor(lessonId));
    assert.deepEqual(parseLessonTheoryChunk(lessonId, parsed), chunkFor(lessonId).theory);
    expectedBytes += Buffer.byteLength(expected, "utf8");
  }
  assert.equal(emission.bytes, expectedBytes);

  await writeFile(path.join(outputDirectory, "stale-lesson.json"), "{}\n", "utf8");
  await writeFile(path.join(outputDirectory, "KEEP.txt"), "sentinel\n", "utf8");
  const second = await emitLessonTheoryChunks({ outputDirectory });
  assert.equal(second.count, 78);
  assert.equal(second.bytes, expectedBytes);
  await assert.rejects(readFile(path.join(outputDirectory, "stale-lesson.json")), /ENOENT/);
  assert.equal(await readFile(path.join(outputDirectory, "KEEP.txt"), "utf8"), "sentinel\n");

  const outsideFile = path.join(scratchDirectory, "outside-sentinel.txt");
  const linkedChunk = path.join(outputDirectory, `${lessonIds[0]}.json`);
  await writeFile(outsideFile, "outside must not change\n", "utf8");
  await rm(linkedChunk);
  await link(outsideFile, linkedChunk);
  await assert.rejects(
    () => emitLessonTheoryChunks({ outputDirectory }),
    /file thường độc lập/,
  );
  assert.equal(await readFile(outsideFile, "utf8"), "outside must not change\n");

  await rm(linkedChunk);
  await emitLessonTheoryChunks({ outputDirectory });
  assert.equal(
    (await readdir(outputDirectory)).some((name) => name.endsWith(".tmp")),
    false,
  );
});

test("parser kiểm đủ phong bì và mọi cấu trúc lồng nhau của LessonDeepTheory", () => {
  const lessonId = lessonIds[0];
  const good = chunkFor(lessonId);
  assert.deepEqual(parseLessonTheoryChunk(lessonId, clone(good)), good.theory);

  const badValues = [
    null,
    "<html>404</html>",
    { ...good, version: 99 },
    { ...good, lessonId: lessonIds[1] },
    { ...good, theory: { ...good.theory, lessonId: lessonIds[1] } },
    { ...good, theory: { ...good.theory, readingMinutes: "15" } },
    { ...good, theory: { ...good.theory, openingQuestions: ["chỉ một câu"] } },
    {
      ...good,
      theory: {
        ...good.theory,
        sections: [{ title: "hỏng", paragraphs: [] }, ...good.theory.sections.slice(1)],
      },
    },
    {
      ...good,
      theory: {
        ...good.theory,
        workedExamples: [
          { ...good.theory.workedExamples[0], steps: [{ state: "x", explanation: "y" }] },
        ],
      },
    },
    {
      ...good,
      theory: {
        ...good.theory,
        glossary: [{ term: "", definition: "hỏng" }, ...good.theory.glossary.slice(1)],
      },
    },
    { ...good, theory: { ...good.theory, sourceIds: [42, "d2l-en"] } },
    { ...good, theory: { ...good.theory, sourceIds: ["unknown-source", "d2l-en"] } },
    { ...good, theory: { ...good.theory, sourceIds: ["d2l-en", "d2l-en"] } },
  ];
  for (const bad of badValues) {
    assert.equal(parseLessonTheoryChunk(lessonId, bad), null);
  }
  assert.throws(() => parseLessonTheoryChunk("../bad", good), /ID bài học không hợp lệ/);
});

test("loader dùng sitePath, gộp inflight, cache thành công và retry sau thất bại", async () => {
  resetLessonTheoryDetailsCache();
  const lessonId = lessonIds[0];
  const good = chunkFor(lessonId);
  let calls = 0;
  let requestedUrl = "";

  const failing = async (url) => {
    calls += 1;
    requestedUrl = String(url);
    return new Response("temporarily unavailable", { status: 503 });
  };
  await assert.rejects(
    () => loadLessonTheoryDetails(lessonId, { fetchImplementation: failing }),
    /HTTP 503/,
  );
  assert.equal(calls, 1);
  assert.equal(requestedUrl, `/VOAI${lessonTheoryChunkPath(lessonId)}`);
  assert.equal(cachedLessonTheoryDetails(lessonId), null);

  calls = 0;
  const successful = async (url) => {
    calls += 1;
    requestedUrl = String(url);
    return new Response(JSON.stringify(good), {
      headers: { "content-type": "application/json" },
    });
  };
  const [first, second] = await Promise.all([
    loadLessonTheoryDetails(lessonId, { fetchImplementation: successful }),
    loadLessonTheoryDetails(lessonId, { fetchImplementation: successful }),
  ]);
  assert.equal(calls, 1, "hai lời gọi đồng thời vẫn fetch hai lần");
  assert.equal(requestedUrl, `/VOAI${lessonTheoryChunkPath(lessonId)}`);
  assert.equal(first, second);
  assert.deepEqual(first, good.theory);
  assert.equal(cachedLessonTheoryDetails(lessonId), first);

  const third = await loadLessonTheoryDetails(lessonId, { fetchImplementation: successful });
  assert.equal(calls, 1, "theory đã cache vẫn bị fetch lại");
  assert.equal(third, first);
  resetLessonTheoryDetailsCache();
});

test("loader không cache response 200 bị sai envelope hoặc JSON hỏng", async () => {
  resetLessonTheoryDetailsCache();
  const lessonId = lessonIds[1];
  let calls = 0;
  const malformedEnvelope = async () => {
    calls += 1;
    return new Response(
      JSON.stringify({ ...chunkFor(lessonId), version: LESSON_THEORY_CHUNK_VERSION + 1 }),
      { headers: { "content-type": "application/json" } },
    );
  };
  await assert.rejects(
    () => loadLessonTheoryDetails(lessonId, { fetchImplementation: malformedEnvelope }),
    /không đúng định dạng/,
  );
  assert.equal(cachedLessonTheoryDetails(lessonId), null);

  const malformedJson = async () => {
    calls += 1;
    return new Response("<html>not json</html>", {
      headers: { "content-type": "text/html" },
    });
  };
  await assert.rejects(() =>
    loadLessonTheoryDetails(lessonId, { fetchImplementation: malformedJson }),
  );
  assert.equal(calls, 2, "lỗi trước đã bị cache thay vì retry fetch");
  assert.equal(cachedLessonTheoryDetails(lessonId), null);
  resetLessonTheoryDetailsCache();
});
