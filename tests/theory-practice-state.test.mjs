import assert from "node:assert/strict";
import test, { after, before } from "node:test";

import { cleanupLoadedModules, loadTypeScriptModule } from "./helpers/load-module.mjs";

let practice;

before(async () => {
  practice = await loadTypeScriptModule("lib/theory-practice-state.ts");
});

after(async () => {
  await cleanupLoadedModules();
});

test("practice responses and revealed ids survive a storage round trip", () => {
  const snapshot = practice.createTheoryPracticeState(
    { single: 2, multi: [0, 3], tf: [true, false, true, false], numeric: "3.14" },
    new Set(["single", "tf"]),
  );
  const restored = practice.parseTheoryPracticeState(JSON.stringify(snapshot));
  assert.deepEqual(restored, snapshot);
});

test("malformed storage falls back safely without throwing", () => {
  for (const raw of [null, "", "{", "[]", '"text"', JSON.stringify({ version: 99 })]) {
    assert.doesNotThrow(() => practice.parseTheoryPracticeState(raw));
    assert.deepEqual(practice.parseTheoryPracticeState(raw), practice.EMPTY_THEORY_PRACTICE_STATE);
  }
});

test("one damaged response does not discard the remaining valid progress", () => {
  const raw = JSON.stringify({
    version: 1,
    responses: {
      valid: 1,
      invalid: { surprise: true },
      removed: "old answer",
      huge: "x".repeat(4_001),
    },
    revealed: ["valid", "valid", "invalid", 42, "removed"],
  });
  const restored = practice.parseTheoryPracticeState(raw);
  assert.deepEqual(restored.responses, { valid: 1, removed: "old answer" });
  assert.deepEqual(restored.revealed, ["valid", "invalid", "removed"]);

  const hydrated = practice.sanitiseTheoryPracticeReveals(
    restored,
    new Set(["valid", "invalid", "huge"]),
    (id, response) => id === "valid" && response === 1,
  );
  assert.deepEqual(
    hydrated.revealed,
    ["valid", "removed"],
    "Câu hiện tại thiếu response hợp lệ không được bị khóa sau hydrate",
  );

  const nextSnapshot = practice.createTheoryPracticeState(
    { ...hydrated.responses, newest: 2 },
    new Set(hydrated.revealed),
  );
  assert.equal(nextSnapshot.responses.removed, "old answer");
  assert.ok(nextSnapshot.revealed.includes("removed"), "Tiến độ archived bị mất khi ghi lần kế tiếp");
});

test("an answered card stays in the pending filter until it is revealed", () => {
  assert.equal(practice.matchesTheoryPracticeReviewMode("unanswered", false, false), true);
  assert.equal(
    practice.matchesTheoryPracticeReviewMode("unanswered", false, true),
    true,
    "Nhập đáp án đúng làm card biến mất trước khi người học bấm Đối chiếu",
  );
  assert.equal(practice.matchesTheoryPracticeReviewMode("unanswered", true, true), false);
  assert.equal(practice.matchesTheoryPracticeReviewMode("wrong", true, false), true);
  assert.equal(practice.matchesTheoryPracticeReviewMode("correct", true, true), true);
});

test("true-false completion rejects sparse holes before and after JSON reload", () => {
  const pickedLastFirst = [];
  pickedLastFirst[3] = true;
  assert.equal(pickedLastFirst.length, 4);
  assert.equal(
    practice.hasCompleteTrueFalseResponse(pickedLastFirst, 4),
    false,
    "Sparse array bị coi là đã trả lời đủ",
  );

  const restored = JSON.parse(JSON.stringify(pickedLastFirst));
  assert.deepEqual(restored, [null, null, null, true]);
  assert.equal(practice.hasCompleteTrueFalseResponse(restored, 4), false);
  assert.equal(
    practice.hasCompleteTrueFalseResponse([true, false, true, false], 4),
    true,
  );
});

test("storage inspector distinguishes missing and preserves valid archived progress", () => {
  const missing = practice.inspectTheoryPracticeStorage(null);
  assert.deepEqual(missing, { status: "missing" });
  assert.equal(practice.canPersistTheoryPracticeStorage(missing), true);

  const raw = JSON.stringify({
    version: 1,
    responses: { current: 2, "archived-question": "old answer" },
    revealed: ["current", "archived-question"],
  });
  const inspected = practice.inspectTheoryPracticeStorage(raw);
  assert.equal(inspected.status, "valid");
  assert.deepEqual(inspected.state.responses, {
    current: 2,
    "archived-question": "old answer",
  });
  assert.deepEqual(inspected.state.revealed, ["current", "archived-question"]);

  const nextRaw = JSON.stringify(
    practice.createTheoryPracticeState(inspected.state.responses, new Set(inspected.state.revealed)),
  );
  const roundTrip = practice.inspectTheoryPracticeStorage(nextRaw);
  assert.equal(roundTrip.status, "valid");
  assert.equal(roundTrip.state.responses["archived-question"], "old answer");
  assert.ok(roundTrip.state.revealed.includes("archived-question"));
});

test("malformed, wrong-version and invalid entries are non-writable", () => {
  const candidates = [
    "",
    "{",
    JSON.stringify({ version: 99, responses: {}, revealed: [] }),
    JSON.stringify({ version: 1, responses: { broken: { nested: true } }, revealed: [] }),
    JSON.stringify({ version: 1, responses: {}, revealed: ["orphan"] }),
  ];
  for (const raw of candidates) {
    const inspected = practice.inspectTheoryPracticeStorage(raw);
    assert.deepEqual(inspected, { status: "invalid" });
    assert.equal(practice.canPersistTheoryPracticeStorage(inspected), false);
  }
});

test("storage inspector rejects response and revealed collections above 2000 entries", () => {
  const responses = Object.fromEntries(
    Array.from({ length: 2_001 }, (_, index) => [`q-${index}`, index]),
  );
  assert.deepEqual(
    practice.inspectTheoryPracticeStorage(
      JSON.stringify({ version: 1, responses, revealed: [] }),
    ),
    { status: "invalid" },
  );

  assert.deepEqual(
    practice.inspectTheoryPracticeStorage(
      JSON.stringify({
        version: 1,
        responses: { one: 1 },
        revealed: Array.from({ length: 2_001 }, () => "one"),
      }),
    ),
    { status: "invalid" },
  );
});

test("invalid storage keeps the original raw bytes when a write is attempted", () => {
  const originalRaw = "{payload cũ bị lỗi";
  const inspected = practice.inspectTheoryPracticeStorage(originalRaw);
  let storedRaw = originalRaw;
  let writeCount = 0;

  const simulateComponentWriteGate = (nextState) => {
    if (!practice.canPersistTheoryPracticeStorage(inspected)) return;
    writeCount += 1;
    storedRaw = JSON.stringify(nextState);
  };
  simulateComponentWriteGate(
    practice.createTheoryPracticeState({ current: 1 }, new Set(["current"])),
  );

  assert.equal(writeCount, 0);
  assert.equal(storedRaw, originalRaw);
});

test("stored text accepts 4000 characters and rejects 4001", () => {
  assert.equal(practice.MAX_RESPONSE_TEXT_LENGTH, 4_000);
  const inspectLength = (length) =>
    practice.inspectTheoryPracticeStorage(
      JSON.stringify({
        version: 1,
        responses: { text: "x".repeat(length) },
        revealed: [],
      }),
    ).status;

  assert.equal(inspectLength(4_000), "valid");
  assert.equal(inspectLength(4_001), "invalid");
});

test("two stale tabs merge dirty Q1 and Q2 without losing either answer", () => {
  const empty = practice.EMPTY_THEORY_PRACTICE_STATE;
  const staleTabA = practice.createTheoryPracticeState(
    { q1: 1 },
    new Set(["q1"]),
  );
  const staleTabB = practice.createTheoryPracticeState(
    { q2: 2 },
    new Set(["q2"]),
  );

  const afterA = practice.mergeTheoryPracticeDelta(
    empty,
    staleTabA,
    new Set(["q1"]),
    new Set(["q1"]),
  );
  const rawAfterA = JSON.stringify(afterA);
  const liveForB = practice.inspectTheoryPracticeStorage(rawAfterA);
  assert.equal(liveForB.status, "valid");

  const afterB = practice.mergeTheoryPracticeDelta(
    liveForB.state,
    staleTabB,
    new Set(["q2"]),
    new Set(["q2"]),
  );
  assert.equal(practice.isTheoryPracticeStateWritable(afterB), true);
  const roundTrip = practice.inspectTheoryPracticeStorage(JSON.stringify(afterB));
  assert.equal(roundTrip.status, "valid");
  assert.deepEqual(roundTrip.state.responses, { q1: 1, q2: 2 });
  assert.deepEqual(roundTrip.state.revealed, ["q1", "q2"]);
});

test("a 2001st response fails pre-write validation and leaves valid raw unchanged", () => {
  const archivedResponses = Object.fromEntries(
    Array.from({ length: 2_000 }, (_, index) => [`archived-${index}`, index]),
  );
  const originalRaw = JSON.stringify({
    version: 1,
    responses: archivedResponses,
    revealed: [],
  });
  const inspected = practice.inspectTheoryPracticeStorage(originalRaw);
  assert.equal(inspected.status, "valid");

  const localWithOneEdit = practice.createTheoryPracticeState(
    { ...inspected.state.responses, newest: 1 },
    new Set(),
  );
  const candidate = practice.mergeTheoryPracticeDelta(
    inspected.state,
    localWithOneEdit,
    new Set(["newest"]),
    new Set(),
  );
  assert.equal(practice.isTheoryPracticeStateWritable(candidate), false);

  let storedRaw = originalRaw;
  if (practice.isTheoryPracticeStateWritable(candidate)) {
    storedRaw = JSON.stringify(candidate);
  }
  assert.equal(storedRaw, originalRaw);
  assert.equal(practice.inspectTheoryPracticeStorage(storedRaw).status, "valid");
});