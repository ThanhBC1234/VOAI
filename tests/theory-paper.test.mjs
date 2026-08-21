import assert from "node:assert/strict";
import test, { after, before } from "node:test";

import { cleanupLoadedModules, loadTypeScriptModule } from "./helpers/load-module.mjs";

let bank;
let paper;

before(async () => {
  [bank, paper] = await Promise.all([
    loadTypeScriptModule("content/theory/index.ts"),
    loadTypeScriptModule("lib/theory-paper.ts"),
  ]);
});

after(async () => {
  await cleanupLoadedModules();
});

function sectionMap() {
  return Object.fromEntries(bank.THEORY_BANK.map((question) => [question.id, bank.paperSectionOf(question)]));
}

test("client paper builder reproduces the server reference paper for seed 1", () => {
  const actual = paper.buildMockPaperQuestionIds(1, bank.THEORY_BANK, sectionMap());
  const expected = bank.REFERENCE_MOCK_PAPER.questions.map((question) => question.id);
  assert.deepEqual(actual, expected);
});

test("the same seed is stable and a different seed produces a fresh paper", () => {
  const sections = sectionMap();
  const first = paper.buildMockPaperQuestionIds(2027, bank.THEORY_BANK, sections);
  const repeated = paper.buildMockPaperQuestionIds(2027, bank.THEORY_BANK, sections);
  const different = paper.buildMockPaperQuestionIds(2028, bank.THEORY_BANK, sections);
  assert.deepEqual(first, repeated);
  assert.notDeepEqual(first, different);
  assert.equal(first.length, bank.MOCK_PAPER_QUESTION_COUNT);
  assert.equal(new Set(first).size, first.length, "Một đề không được lặp câu");
});

test("paper seeds are bounded uint32 values and advance predictably", () => {
  assert.equal(paper.normalisePaperSeed(-4), 0);
  assert.equal(paper.normalisePaperSeed(4.9), 4);
  assert.equal(paper.normalisePaperSeed(Number.NaN, 7), 7);
  assert.equal(paper.nextPaperSeed(7), 8);
  assert.equal(paper.nextPaperSeed(0xffff_ffff), 0);
});

test("restored papers must be complete, unique and match every blueprint bucket", () => {
  const sections = sectionMap();
  const valid = paper.buildMockPaperQuestionIds(2_027, bank.THEORY_BANK, sections);
  assert.equal(
    paper.isValidMockPaperQuestionIds(valid, bank.THEORY_BANK, sections),
    true,
  );

  assert.equal(
    paper.isValidMockPaperQuestionIds(valid.slice(1), bank.THEORY_BANK, sections),
    false,
    "Đề thiếu câu vẫn được khôi phục",
  );
  assert.equal(
    paper.isValidMockPaperQuestionIds([valid[0], ...valid.slice(0, -1)], bank.THEORY_BANK, sections),
    false,
    "Đề trùng câu vẫn được khôi phục",
  );

  const firstQuestion = bank.THEORY_BANK.find((question) => question.id === valid[0]);
  assert.ok(firstQuestion);
  const replacement = bank.THEORY_BANK.find(
    (question) =>
      !valid.includes(question.id) &&
      (sections[question.id] !== sections[firstQuestion.id] ||
        question.difficulty !== firstQuestion.difficulty),
  );
  assert.ok(replacement, "Ngân hàng phải có một câu khác bucket để tạo fixture");
  const wrongDistribution = [...valid];
  wrongDistribution[0] = replacement.id;
  assert.equal(new Set(wrongDistribution).size, wrongDistribution.length);
  assert.equal(
    paper.isValidMockPaperQuestionIds(wrongDistribution, bank.THEORY_BANK, sections),
    false,
    "Đề sai phân bố blueprint vẫn được khôi phục",
  );
});