import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test, { after, before } from "node:test";
import { fileURLToPath } from "node:url";

import { cleanupLoadedModules, loadTypeScriptModule } from "./helpers/load-module.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
let coreCatalog;
let multimodalCatalog;
let theoryCatalog;

before(async () => {
  [coreCatalog, multimodalCatalog, theoryCatalog] = await Promise.all([
    loadTypeScriptModule("content/lessons-core.ts"),
    loadTypeScriptModule("content/lessons-multimodal.ts"),
    loadTypeScriptModule("content/lesson-theory/index.ts"),
  ]);
});

after(async () => {
  await cleanupLoadedModules();
});

function lessonText(lessonId) {
  const lesson = theoryCatalog.lessonDeepTheory[lessonId];
  assert.ok(lesson, `Không tìm thấy lý thuyết ${lessonId}`);
  return JSON.stringify(lesson);
}

test("deep theory covers exactly the 78-lesson catalog and passes its quality gate", () => {
  const lessonIds = [
    ...coreCatalog.coreLessons.map((lesson) => lesson.id),
    ...multimodalCatalog.multimodalLessons.map((lesson) => lesson.id),
  ];

  assert.equal(lessonIds.length, 78);
  assert.equal(new Set(lessonIds).size, 78);
  assert.deepEqual(Object.keys(theoryCatalog.lessonDeepTheory).sort(), [...lessonIds].sort());
  assert.doesNotThrow(() => theoryCatalog.assertLessonTheoryCoverage(lessonIds));
});

test("quality gate rejects empty text in every nested learning structure", () => {
  const lessonId = "foundation-python";
  const original = theoryCatalog.lessonDeepTheory[lessonId];
  const lessonIds = [
    ...coreCatalog.coreLessons.map((lesson) => lesson.id),
    ...multimodalCatalog.multimodalLessons.map((lesson) => lesson.id),
  ];
  const mutations = [
    (theory) => { theory.openingQuestions[0] = " "; },
    (theory) => { theory.sections[0].paragraphs[0] = ""; },
    (theory) => { theory.sections[0].formulas = [""]; },
    (theory) => { theory.workedExamples[0].title = " "; },
    (theory) => { theory.workedExamples[0].steps[0].state = ""; },
    (theory) => { theory.workedExamples[0].sanityChecks[0] = " "; },
    (theory) => { theory.implementationChecklist[0] = ""; },
    (theory) => { theory.masteryChecklist[0] = " "; },
    (theory) => { theory.glossary[0].definition = ""; },
    (theory) => { theory.sourceIds[0] = " "; },
  ];

  try {
    for (const mutate of mutations) {
      const malformed = structuredClone(original);
      mutate(malformed);
      theoryCatalog.lessonDeepTheory[lessonId] = malformed;
      assert.throws(
        () => theoryCatalog.assertLessonTheoryCoverage(lessonIds),
        /Lesson theory catalog không hợp lệ/,
      );
    }
  } finally {
    theoryCatalog.lessonDeepTheory[lessonId] = original;
  }
});

test("every bundled PDF source exists and has a PDF header", async () => {
  const localSources = Object.values(theoryCatalog.theorySources).filter((source) => source.localPath);
  assert.equal(localSources.length, 6);

  for (const source of localSources) {
    assert.match(source.localPath, /^\/books\/[a-z0-9][a-z0-9._-]*\.pdf$/iu, source.id);
    const relativeSegments = source.localPath.replace(/^\//u, "").split("/");
    const bytes = await readFile(path.join(ROOT, "public", ...relativeSegments));
    assert.equal(bytes.subarray(0, 5).toString("ascii"), "%PDF-", `${source.id} không phải PDF hợp lệ`);
  }
});

test("model-specific audio lessons cite their primary official source", () => {
  const expectedSources = {
    "audio-05-hubert": "hubert-paper",
    "audio-06-whisper": "whisper-paper",
    "audio-07-qwen-audio": "qwen-audio-official",
    "audio-08-voxtral": "voxtral-official",
  };

  for (const [lessonId, sourceId] of Object.entries(expectedSources)) {
    assert.ok(theoryCatalog.lessonDeepTheory[lessonId].sourceIds.includes(sourceId), `${lessonId} thiếu ${sourceId}`);
  }
});

test("audited formulas and algorithm variants do not regress", () => {
  assert.match(lessonText("foundation-math-linear-algebra"), /X_k=U\[:,:k\]Σ_kV\[:,:k\]ᵀ theo chỉ số 0-based/u);
  assert.match(lessonText("nlp-02-text-classification"), /-sum_k \[y_k log sigma\(z_k\) \+ \(1-y_k\)log\(1-sigma\(z_k\)\)\]/u);
  assert.match(lessonText("ml-spectral-clustering"), /Ng–Jordan–Weiss/u);
  assert.match(lessonText("ml-spectral-clustering"), /biến thể unnormalized thường gom trực tiếp/u);
  assert.match(lessonText("nlp-04-language-modeling"), /beam search xấp xỉ tìm chuỗi/u);
  assert.doesNotMatch(lessonText("nlp-04-language-modeling"), /beam search tối ưu chuỗi xác suất/u);
  assert.match(lessonText("audio-01-waveform-sampling"), /biên Nyquist.*vùng chuyển tiếp/u);
  assert.match(lessonText("audio-04-mfcc"), /xấp xỉ.*không bảo đảm decorrelate/u);
  assert.match(lessonText("ds-metrics"), /accuracy đo đúng.*dễ che lỗi/u);
  assert.match(lessonText("cv-03-yolo"), /chỉ với head tách objectness/u);
  assert.match(lessonText("foundation-pytorch-autograd-device"), /AMP GradScaler.*sampler/u);
  assert.match(lessonText("ds-metrics"), /MAE_A=18\/4=4\.5/u);
  assert.match(lessonText("ml-bagging-random-forest"), /metric không được bảo đảm cải thiện đơn điệu/u);
  assert.match(lessonText("dl-embeddings"), /E'=EA/u);
  assert.doesNotMatch(lessonText("dl-embeddings"), /E'=\(AE\)/u);
  assert.match(lessonText("dl-loss-functions"), /gradient hoặc subgradient/u);
  assert.doesNotMatch(lessonText("dl-loss-functions"), /thành vô hướng khả vi để tạo gradient/u);
});
