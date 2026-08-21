import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { loadTypeScriptModule } from "./helpers/load-module.mjs";

const [practiceModule, coreModule, multimodalModule] = await Promise.all([
  loadTypeScriptModule("content/lesson-practice/index.ts"),
  loadTypeScriptModule("content/lessons-core.ts"),
  loadTypeScriptModule("content/lessons-multimodal.ts"),
]);
const practiceVisualModule = await loadTypeScriptModule("lib/lesson-practice-visual.ts");

const lessonIds = [
  ...coreModule.coreLessonOrder,
  ...multimodalModule.multimodalLessons.map((lesson) => lesson.id),
];

test("78 bài đều có tình huống, code, output và minh họa thực hành", () => {
  assert.equal(lessonIds.length, 78);
  practiceModule.assertLessonPracticeCoverage(lessonIds);
  assert.deepEqual(Object.keys(practiceModule.lessonPractice).sort(), [...lessonIds].sort());
  for (const lessonId of lessonIds) {
    const practice = practiceModule.lessonPractice[lessonId];
    assert.match(practice.python.codeTemplate, /\bprint\s*\(/, `${lessonId} thiếu print`);
    assert.equal(practice.experiment.variants.length, 3, `${lessonId} phải có 3 biến thể`);
    assert.ok(new Set(practice.experiment.variants.map((item) => item.expectedOutput)).size >= 2, `${lessonId} cần output biến đổi theo tham số`);
  }
});

test("quality gate từ chối lessonId, token và số biến thể sai contract", () => {
  const original = practiceModule.lessonPractice[lessonIds[0]];
  const mutations = [
    (practice) => { practice.lessonId = "sai-id"; },
    (practice) => { practice.python.codeTemplate = practice.python.codeTemplate.replace("{{seed}}", "42"); },
    (practice) => { practice.experiment.variants = practice.experiment.variants.slice(0, 2); },
    (practice) => { practice.experiment.variants[0].expectedOutput = " "; },
  ];

  for (const mutate of mutations) {
    const malformed = structuredClone(original);
    mutate(malformed);
    assert.ok(
      practiceModule.validateLessonPracticeEntry(lessonIds[0], malformed).length > 0,
      "validator nhận nhầm entry hỏng",
    );
  }
});

test("coverage gate từ chối thiếu hoặc thừa bài so với catalog", () => {
  const lessonId = lessonIds[0];
  const original = practiceModule.lessonPractice[lessonId];
  try {
    delete practiceModule.lessonPractice[lessonId];
    assert.throws(
      () => practiceModule.assertLessonPracticeCoverage(lessonIds),
      /Thiếu bài thực hành/,
    );
  } finally {
    practiceModule.lessonPractice[lessonId] = original;
  }

  try {
    practiceModule.lessonPractice["extra-practice"] = {
      ...structuredClone(original),
      lessonId: "extra-practice",
    };
    assert.throws(
      () => practiceModule.assertLessonPracticeCoverage(lessonIds),
      /Thừa bài thực hành/,
    );
  } finally {
    delete practiceModule.lessonPractice["extra-practice"];
  }
});

test("renderer dùng đúng metadata nối đường và thang màu phân kỳ", async () => {
  const [component, css] = await Promise.all([
    readFile(new URL("../components/LessonPracticalContent.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  assert.match(component, /visual\.connect\s*&&[\s\S]*<polyline/);
  assert.match(component, /visual\.scale\s*\?\?\s*"sequential"/);
  assert.match(css, /practice-matrix\.is-diverging td\.is-negative/);
  assert.match(css, /practice-plot-lines polyline\.tone-accent/);
});

test("bar âm và dương dùng cùng baseline 0 và giữ độ dài đối xứng", () => {
  const negative = practiceVisualModule.practicalBarGeometry(-2, -2, 2);
  const zero = practiceVisualModule.practicalBarGeometry(0, -2, 2);
  const positive = practiceVisualModule.practicalBarGeometry(2, -2, 2);

  assert.equal(negative.zero, 50);
  assert.equal(positive.zero, 50);
  assert.equal(negative.width, positive.width);
  assert.deepEqual(negative, { left: 0, width: 50, zero: 50 });
  assert.deepEqual(zero, { left: 50, width: 0, zero: 50 });
  assert.deepEqual(positive, { left: 50, width: 50, zero: 50 });

  assert.deepEqual(
    practiceVisualModule.practicalBarGeometry(-5, -10, 0),
    { left: 50, width: 50, zero: 100 },
  );
});
