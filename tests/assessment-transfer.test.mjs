import assert from "node:assert/strict";
import test, { after } from "node:test";

import { cleanupLoadedModules, loadTypeScriptModule } from "./helpers/load-module.mjs";

const transfer = await loadTypeScriptModule("lib/assessment-transfer.ts");

after(async () => {
  await cleanupLoadedModules();
});

test("assessment backup v1 remains importable without inventing drafts", () => {
  const parsed = transfer.parseAssessmentTransferJson(JSON.stringify({
    format: "voai-assessment-attempts",
    version: 1,
    attempts: [{ id: "legacy" }],
  }));
  assert.deepEqual(parsed, {
    version: 1,
    attempts: [{ id: "legacy" }],
    drafts: null,
  });
});

test("assessment backup v2 carries attempts and drafts", () => {
  const parsed = transfer.parseAssessmentTransferJson(JSON.stringify({
    format: transfer.ASSESSMENT_TRANSFER_FORMAT,
    version: transfer.ASSESSMENT_TRANSFER_VERSION,
    attempts: [{ id: "attempt-1" }],
    drafts: { "w01-lab": { codeEvidence: "pytest -q" } },
  }));
  assert.equal(parsed?.version, 2);
  assert.deepEqual(parsed?.attempts, [{ id: "attempt-1" }]);
  assert.deepEqual(parsed?.drafts, { "w01-lab": { codeEvidence: "pytest -q" } });
});

test("assessment transfer parser rejects malformed or oversized envelopes", () => {
  for (const invalid of [
    "not json",
    JSON.stringify(null),
    JSON.stringify({ format: "something-else", version: 2, attempts: [], drafts: {} }),
    JSON.stringify({ format: "voai-assessment-attempts", version: 3, attempts: [], drafts: {} }),
    JSON.stringify({ format: "voai-assessment-attempts", version: 2, attempts: {}, drafts: {} }),
    JSON.stringify({ format: "voai-assessment-attempts", version: 2, attempts: [], drafts: [] }),
  ]) {
    assert.equal(transfer.parseAssessmentTransferJson(invalid), null);
  }

  const tooManyAttempts = Array.from(
    { length: transfer.MAX_ASSESSMENT_IMPORT_ATTEMPTS + 1 },
    (_, index) => index,
  );
  assert.equal(transfer.parseAssessmentTransferJson(JSON.stringify({
    format: "voai-assessment-attempts",
    version: 1,
    attempts: tooManyAttempts,
  })), null);
});

test("assessment parser enforces UTF-8 byte, draft-count, depth, and prototype bounds", () => {
  const utf8Oversized = `"${"é".repeat(Math.ceil(transfer.MAX_ASSESSMENT_IMPORT_BYTES / 2))}"`;
  assert.ok(utf8Oversized.length < transfer.MAX_ASSESSMENT_IMPORT_BYTES);
  assert.equal(transfer.parseAssessmentTransferJson(utf8Oversized), null);

  const tooManyDrafts = Object.fromEntries(
    Array.from(
      { length: transfer.MAX_ASSESSMENT_IMPORT_DRAFTS + 1 },
      (_, index) => [`archived-${index}`, { answer: index }],
    ),
  );
  assert.equal(transfer.parseAssessmentTransferJson(JSON.stringify({
    format: transfer.ASSESSMENT_TRANSFER_FORMAT,
    version: 2,
    attempts: [],
    drafts: tooManyDrafts,
  })), null);

  const unsafe =
    '{"format":"voai-assessment-attempts","version":2,"attempts":[],' +
    '"drafts":{"archived":{"__proto__":{"polluted":true}}}}';
  assert.equal(transfer.parseAssessmentTransferJson(unsafe), null);

  let nested = 0;
  for (let index = 0; index < 30; index += 1) nested = [nested];
  assert.equal(transfer.parseAssessmentTransferJson(JSON.stringify({
    format: transfer.ASSESSMENT_TRANSFER_FORMAT,
    version: 1,
    attempts: [nested],
  })), null);
});

test("opaque assessment values remain fingerprintable but unsafe values do not", () => {
  const opaque = { id: "old-attempt", schema: 99, evidence: ["kept", 2] };
  assert.equal(transfer.isBoundedAssessmentOpaqueValue(opaque), true);
  assert.equal(
    transfer.assessmentOpaqueFingerprint(opaque),
    transfer.assessmentOpaqueFingerprint(structuredClone(opaque)),
  );

  const unsafe = JSON.parse('{"constructor":{"prototype":{"polluted":true}}}');
  assert.equal(transfer.isBoundedAssessmentOpaqueValue(unsafe), false);
  assert.equal(transfer.assessmentOpaqueFingerprint(unsafe), null);
});

test("draft-store hydration parser accepts bounded archived data and rejects unsafe stores", () => {
  const archived = { note: "không còn trong catalog", answer: 42 };
  const parsed = transfer.parseAssessmentDraftStore({
    version: 1,
    drafts: { "w00-archived": archived },
  });
  assert.deepEqual(parsed, { "w00-archived": archived });

  assert.equal(transfer.parseAssessmentDraftStore({ version: 2, drafts: {} }), null);
  assert.equal(
    transfer.parseAssessmentDraftStore(
      JSON.parse('{"version":1,"drafts":{"__proto__":{"polluted":true}}}'),
    ),
    null,
  );
});

test("a real imported draft replaces only an empty local auto-draft", () => {
  const empty = {
    retrievalAnswers: ["", "  "],
    codeEvidence: "",
    evidenceLink: " ",
    explanation: "",
    scores: { retrieval: 0, coding: 0, validation: 0, explanation: 0 },
    soloConfirmed: false,
    noAutomaticFailConfirmed: false,
  };
  const real = {
    ...empty,
    retrievalAnswers: ["vector", "shape"],
    codeEvidence: "pytest -q",
  };

  assert.equal(transfer.isEmptyAssessmentDraft(empty), true);
  assert.equal(transfer.isEmptyAssessmentDraft(real), false);
  assert.equal(transfer.isEmptyAssessmentDraft({}), false);
  assert.equal(transfer.shouldAcceptImportedAssessmentDraft(undefined, real), true);
  assert.equal(transfer.shouldAcceptImportedAssessmentDraft(empty, real), true);
  assert.equal(transfer.shouldAcceptImportedAssessmentDraft(empty, empty), false);
  assert.equal(transfer.shouldAcceptImportedAssessmentDraft(real, empty), false);
  assert.equal(transfer.shouldAcceptImportedAssessmentDraft(real, real), false);
});

test("over-limit local attempt stores are invalid, never equivalent to missing", () => {
  assert.deepEqual(transfer.inspectAssessmentAttemptsStoreRaw(null), { status: "missing" });
  assert.deepEqual(transfer.inspectAssessmentAttemptsStoreRaw("[]"), {
    status: "valid",
    value: [],
  });

  const overLimit = Array.from(
    { length: transfer.MAX_ASSESSMENT_IMPORT_ATTEMPTS + 1 },
    (_, index) => ({ archivedId: index }),
  );
  assert.deepEqual(
    transfer.inspectAssessmentAttemptsStoreRaw(JSON.stringify(overLimit)),
    { status: "invalid" },
  );
  assert.deepEqual(transfer.inspectAssessmentAttemptsStoreRaw("{"), { status: "invalid" });
});

test("over-limit local draft stores are invalid, never equivalent to an empty store", () => {
  assert.deepEqual(transfer.inspectAssessmentDraftStoreRaw(null), { status: "missing" });
  assert.deepEqual(
    transfer.inspectAssessmentDraftStoreRaw(JSON.stringify({ version: 1, drafts: {} })),
    { status: "valid", value: {} },
  );

  const overLimitDrafts = Object.fromEntries(
    Array.from(
      { length: transfer.MAX_ASSESSMENT_IMPORT_DRAFTS + 1 },
      (_, index) => [`archived-${index}`, { evidence: `kept-${index}` }],
    ),
  );
  assert.deepEqual(
    transfer.inspectAssessmentDraftStoreRaw(
      JSON.stringify({ version: 1, drafts: overLimitDrafts }),
    ),
    { status: "invalid" },
  );
  assert.deepEqual(
    transfer.inspectAssessmentDraftStoreRaw(JSON.stringify({ version: 2, drafts: {} })),
    { status: "invalid" },
  );

  assert.deepEqual(transfer.assessmentInteractionLocks(false, true, true), {
    formLocked: false,
    exportLocked: false,
  });
  assert.deepEqual(transfer.assessmentInteractionLocks(true, true, true), {
    formLocked: true,
    exportLocked: true,
  });
  assert.equal(transfer.assessmentInteractionLocks(false, false, true).exportLocked, true);
  assert.equal(transfer.assessmentInteractionLocks(false, true, false).exportLocked, true);
});

test("an unreadable current-session draft locks the whole partition instead of becoming empty", () => {
  const drafts = {
    "w01-lesson-1": { malformed: true, evidence: "must stay in localStorage" },
    "archived-session": { evidence: "also preserved" },
  };
  const partition = transfer.partitionAssessmentDraftStore(
    drafts,
    (sessionId, value) => {
      if (sessionId === "archived-session") return { kind: "unknown" };
      return Object.hasOwn(value, "retrievalAnswers")
        ? { kind: "known", value }
        : { kind: "invalid" };
    },
  );
  assert.deepEqual(partition, { status: "invalid-known" });
});

test("valid current drafts and archived opaque drafts partition without data loss", () => {
  const knownDraft = { retrievalAnswers: ["answer"] };
  const archivedDraft = { evidence: "old curriculum" };
  const partition = transfer.partitionAssessmentDraftStore(
    { "w01-lesson-1": knownDraft, "archived-session": archivedDraft },
    (sessionId, value) =>
      sessionId === "w01-lesson-1"
        ? { kind: "known", value }
        : { kind: "unknown" },
  );
  assert.equal(partition.status, "valid");
  assert.deepEqual({ ...partition.known }, { "w01-lesson-1": knownDraft });
  assert.deepEqual({ ...partition.opaque }, { "archived-session": archivedDraft });
});

test("assessment UI strings and local write payloads are capped before persistence", () => {
  const oversized = "x".repeat(transfer.MAX_OPAQUE_STRING_LENGTH + 1);
  const capped = transfer.capAssessmentString(oversized);
  assert.equal(capped.length, transfer.MAX_OPAQUE_STRING_LENGTH);
  assert.equal(transfer.isAssessmentAttemptsStoreValueSafe([oversized]), false);
  assert.equal(transfer.isAssessmentAttemptsStoreValueSafe([capped]), true);

  const atLimit = Object.fromEntries(
    Array.from(
      { length: transfer.MAX_ASSESSMENT_IMPORT_DRAFTS },
      (_, index) => ["archived-" + index, { evidence: index }],
    ),
  );
  assert.equal(
    transfer.isAssessmentDraftStoreValueSafe({ version: 1, drafts: atLimit }),
    true,
  );
  assert.equal(
    transfer.isAssessmentDraftStoreValueSafe({
      version: 1,
      drafts: { ...atLimit, "session-1001": { evidence: "must not overwrite" } },
    }),
    false,
  );
});

test("a combined near-limit export is still accepted by the importer", () => {
  const chunk = "x".repeat(transfer.MAX_OPAQUE_STRING_LENGTH);
  const attempts = Array.from(
    { length: 4 },
    (_, index) => ({ id: "attempt-" + index, payload: chunk }),
  );
  const draftStore = {
    version: 1,
    drafts: {
      "archived-session": {
        evidenceA: chunk,
        evidenceB: chunk,
        evidenceC: chunk,
        evidenceD: chunk,
      },
    },
  };
  assert.equal(transfer.isAssessmentAttemptsStoreValueSafe(attempts), true);
  assert.equal(transfer.isAssessmentDraftStoreValueSafe(draftStore), true);

  const serialized = transfer.serializeAssessmentTransferPayload({
    format: transfer.ASSESSMENT_TRANSFER_FORMAT,
    version: transfer.ASSESSMENT_TRANSFER_VERSION,
    attempts,
    drafts: draftStore.drafts,
  });
  assert.notEqual(serialized, null);
  const byteLength = Buffer.byteLength(serialized, "utf8");
  assert.ok(byteLength > transfer.MAX_ASSESSMENT_LOCAL_STORE_BYTES);
  assert.ok(byteLength <= transfer.MAX_ASSESSMENT_IMPORT_BYTES);
  assert.equal(transfer.parseAssessmentTransferJson(serialized)?.attempts.length, attempts.length);
  assert.ok(
    transfer.MAX_ASSESSMENT_TRANSFER_NODES >=
      transfer.MAX_ASSESSMENT_LOCAL_NODES * 2,
  );
});

test("live-first attempt merge prevents stale tabs from dropping another tab's save", () => {
  const identify = (value) => "id:" + value.id;
  const attemptA = { id: "attempt-a", evidence: "tab A" };
  const attemptB = { id: "attempt-b", evidence: "tab B" };

  const afterA = transfer.mergeAssessmentAttemptStoreValues([], [attemptA], identify);
  assert.ok(afterA);
  const afterB = transfer.mergeAssessmentAttemptStoreValues(afterA.value, [attemptB], identify);
  assert.ok(afterB);
  assert.deepEqual(afterB.value.map((attempt) => attempt.id), ["attempt-a", "attempt-b"]);
  assert.deepEqual(afterB.added, [attemptB]);

  const duplicateA = transfer.mergeAssessmentAttemptStoreValues(
    afterB.value,
    [structuredClone(attemptA)],
    identify,
  );
  assert.ok(duplicateA);
  assert.equal(duplicateA.added.length, 0);

  const exported = transfer.serializeAssessmentTransferPayload({
    format: transfer.ASSESSMENT_TRANSFER_FORMAT,
    version: transfer.ASSESSMENT_TRANSFER_VERSION,
    attempts: afterB.value,
    drafts: {},
  });
  assert.notEqual(exported, null);
  assert.deepEqual(
    transfer.parseAssessmentTransferJson(exported)?.attempts.map((attempt) => attempt.id),
    ["attempt-a", "attempt-b"],
  );
});

test("draft delta merge preserves sessions saved by another tab and enforces count bounds", () => {
  const afterA = transfer.mergeAssessmentDraftStoreDelta(
    {},
    { sessionId: "session-a", kind: "replace", value: { evidence: "tab A" } },
  );
  assert.ok(afterA);
  const afterB = transfer.mergeAssessmentDraftStoreDelta(
    afterA.drafts,
    { sessionId: "session-b", kind: "replace", value: { evidence: "tab B" } },
  );
  assert.ok(afterB);
  assert.deepEqual({ ...afterB.drafts }, {
    "session-a": { evidence: "tab A" },
    "session-b": { evidence: "tab B" },
  });

  const removedB = transfer.mergeAssessmentDraftStoreDelta(
    afterB.drafts,
    { sessionId: "session-b", kind: "remove" },
  );
  assert.ok(removedB);
  assert.deepEqual({ ...removedB.drafts }, { "session-a": { evidence: "tab A" } });

  const full = Object.fromEntries(
    Array.from(
      { length: transfer.MAX_ASSESSMENT_IMPORT_DRAFTS },
      (_, index) => ["archived-" + index, { evidence: index }],
    ),
  );
  assert.equal(
    transfer.mergeAssessmentDraftStoreDelta(
      full,
      { sessionId: "session-1001", kind: "replace", value: { evidence: "blocked" } },
    ),
    null,
  );
  assert.notEqual(
    transfer.mergeAssessmentDraftStoreDelta(
      full,
      { sessionId: "archived-0", kind: "replace", value: { evidence: "replacement" } },
    ),
    null,
  );
});
