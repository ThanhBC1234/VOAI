import assert from "node:assert/strict";
import test, { after, before } from "node:test";

import { cleanupLoadedModules, loadTypeScriptModule } from "./helpers/load-module.mjs";

let theory;

before(async () => {
  theory = await loadTypeScriptModule("lib/theory-exam-state.ts");
});

after(async () => {
  await cleanupLoadedModules();
});

const fullSections = {
  "Nền tảng Toán & Tin": { correct: 30, total: 30 },
  "Foundational Skills & Classical ML": { correct: 28, total: 28 },
};

/* ---------------- THEORY-P1-02: verdict phải xét đủ ba gate ---------------- */

test("verdict fails when the advanced gate is missed despite a passing total", () => {
  // 266/344 điểm ≈ 77% tổng, nhưng nhóm câu phân loại 0%.
  const verdict = theory.evaluateGates({
    scorePercent: 77,
    bySection: fullSections,
    byDifficulty: { advanced: { correct: 0, total: 13 } },
  });
  assert.equal(verdict.passed, false, "Advanced 0% vẫn được báo đậu");
  assert.ok(verdict.failures.some((failure) => failure.gate === "advanced"));
});

test("verdict fails when one section is below the section gate", () => {
  const verdict = theory.evaluateGates({
    scorePercent: 90,
    bySection: {
      "Nền tảng Toán & Tin": { correct: 30, total: 30 },
      "Computer Vision": { correct: 5, total: 11 }, // ≈45%
    },
    byDifficulty: { advanced: { correct: 13, total: 13 } },
  });
  assert.equal(verdict.passed, false);
  const failure = verdict.failures.find((item) => item.gate === "section");
  assert.ok(failure);
  assert.equal(failure.label, "Computer Vision");
});

test("verdict passes only when total, every section and advanced all clear", () => {
  const verdict = theory.evaluateGates({
    scorePercent: 80,
    bySection: fullSections,
    byDifficulty: { advanced: { correct: 10, total: 13 } },
  });
  assert.equal(verdict.passed, true);
  assert.equal(verdict.failures.length, 0);
});

test("gate boundaries at exactly 75, 60 and 50 percent count as passing", () => {
  const verdict = theory.evaluateGates({
    scorePercent: 75,
    bySection: { "Computer Vision": { correct: 6, total: 10 } }, // đúng 60%
    byDifficulty: { advanced: { correct: 5, total: 10 } }, // đúng 50%
  });
  assert.equal(verdict.passed, true, "Đúng biên bị tính là trượt");
});

test("just below each boundary fails", () => {
  assert.equal(
    theory.evaluateGates({
      scorePercent: 74,
      bySection: fullSections,
      byDifficulty: { advanced: { correct: 13, total: 13 } },
    }).passed,
    false,
  );
  assert.equal(
    theory.evaluateGates({
      scorePercent: 90,
      bySection: { CV: { correct: 59, total: 100 } },
      byDifficulty: { advanced: { correct: 13, total: 13 } },
    }).passed,
    false,
  );
  assert.equal(
    theory.evaluateGates({
      scorePercent: 90,
      bySection: fullSections,
      byDifficulty: { advanced: { correct: 49, total: 100 } },
    }).passed,
    false,
  );
});

/* ---------------- THEORY-P2-01: deadline tuyệt đối ---------------- */

test("clock is derived from an absolute deadline, not from per-second subtraction", () => {
  const deadline = 1_000_000;
  assert.equal(theory.secondsLeftUntil(deadline, deadline - 10_000), 10);
  // Nhảy đồng hồ 5 phút (tab nền/máy sleep): thời gian còn lại phải tụt đúng 5 phút.
  assert.equal(theory.secondsLeftUntil(deadline, deadline - 10_000 + 300_000), 0);
  assert.equal(theory.secondsLeftUntil(deadline, deadline + 1), 0, "Quá hạn phải là 0, không âm");
});

test("clock formatting stays stable at the boundaries", () => {
  assert.equal(theory.formatClock(0), "00:00");
  assert.equal(theory.formatClock(59), "00:59");
  assert.equal(theory.formatClock(180 * 60), "180:00");
  assert.equal(theory.formatClock(-5), "00:00");
});

/* ---------------- THEORY-P1-03: khôi phục attempt ---------------- */

test("an active attempt round-trips through storage with its question order", () => {
  const attempt = theory.createActiveAttempt(["a", "b", "c"], 1_000, "attempt-1");
  attempt.responses = { a: 2 };
  const restored = theory.parseActiveAttempt(JSON.stringify(attempt));
  assert.deepEqual(restored.questionIds, ["a", "b", "c"], "Thứ tự câu bị đổi sau khi khôi phục");
  assert.deepEqual(restored.responses, { a: 2 });
  assert.equal(restored.deadlineEpochMs, 1_000 + theory.MOCK_DURATION_MS);
  assert.equal(restored.submitted, false);
});

test("malformed or stale storage falls back to null instead of throwing", () => {
  for (const raw of [
    null,
    "",
    "{",
    "[]",
    '"chuỗi"',
    JSON.stringify({ version: 999, attemptId: "x", questionIds: ["a"] }),
    JSON.stringify({ version: 1, attemptId: "", questionIds: ["a"], startedAtEpochMs: 0, deadlineEpochMs: 1, submitted: false }),
    JSON.stringify({ version: 1, attemptId: "x", questionIds: [], startedAtEpochMs: 0, deadlineEpochMs: 1, submitted: false }),
    JSON.stringify({ version: 1, attemptId: "x", questionIds: ["a"], startedAtEpochMs: "hôm qua", deadlineEpochMs: 1, submitted: false }),
  ]) {
    assert.equal(theory.parseActiveAttempt(raw), null, `Không fallback an toàn với: ${raw}`);
  }
});

test("an attempt referencing unknown questions is rejected", () => {
  const attempt = theory.createActiveAttempt(["a", "đã-xoá"], 0, "attempt-2");
  assert.equal(theory.activeAttemptIsUsable(attempt, new Set(["a", "b"])), false);
  assert.equal(theory.activeAttemptIsUsable(attempt, new Set(["a", "đã-xoá"])), true);
});

test("a restored attempt past its deadline reports zero seconds left", () => {
  const attempt = theory.createActiveAttempt(["a"], 0, "attempt-3");
  const afterDeadline = attempt.deadlineEpochMs + 60_000;
  assert.equal(theory.secondsLeftUntil(attempt.deadlineEpochMs, afterDeadline), 0);
});
