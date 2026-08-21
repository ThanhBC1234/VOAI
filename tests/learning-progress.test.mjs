import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import test, { after, before, beforeEach } from "node:test";

import { cleanupLoadedModules, loadTypeScriptModule } from "./helpers/load-module.mjs";

let progress;
let codePractice;
let roadmapExplorer;
let originalCustomEvent;

function installWindow(initial = [], { failWrites = false } = {}) {
  const map = new Map([
    ["voai-completed-sessions", JSON.stringify(initial)],
  ]);
  const events = new EventTarget();
  globalThis.window = {
    localStorage: {
      getItem: (key) => map.get(key) ?? null,
      setItem: (key, value) => {
        if (failWrites) throw new Error("storage blocked");
        map.set(key, value);
      },
      removeItem: (key) => map.delete(key),
    },
    addEventListener: events.addEventListener.bind(events),
    removeEventListener: events.removeEventListener.bind(events),
    dispatchEvent: events.dispatchEvent.bind(events),
  };
  return { map, events };
}

before(async () => {
  originalCustomEvent = globalThis.CustomEvent;
  if (typeof globalThis.CustomEvent === "undefined") {
    globalThis.CustomEvent = class CustomEvent extends Event {
      constructor(type, options = {}) {
        super(type);
        this.detail = options.detail;
      }
    };
  }
  progress = await loadTypeScriptModule("lib/learning-progress.ts");
  codePractice = await loadTypeScriptModule("components/CodePractice.tsx");
  roadmapExplorer = await loadTypeScriptModule("components/RoadmapExplorer.tsx");
});

after(async () => {
  delete globalThis.window;
  if (originalCustomEvent === undefined) delete globalThis.CustomEvent;
  else globalThis.CustomEvent = originalCustomEvent;
  await cleanupLoadedModules();
});

beforeEach(() => {
  delete globalThis.window;
});

test("merge keeps existing and archived ids while removing duplicates", () => {
  const { map } = installWindow(["w01-lesson-1", "old-session"]);
  const result = progress.mergeLearningProgress(["w01-lesson-1", "w05-lesson-1"]);

  assert.equal(result.status, "ok");
  assert.deepEqual(result.completed, ["w01-lesson-1", "old-session", "w05-lesson-1"]);
  assert.deepEqual(JSON.parse(map.get(progress.LEARNING_PROGRESS_STORAGE_KEY)), result.completed);
});

test("a successful write emits a same-tab progress event", () => {
  const { events } = installWindow([]);
  let detail;
  events.addEventListener(progress.LEARNING_PROGRESS_EVENT, (event) => {
    detail = event.detail;
  });

  progress.markSessionCompleted("w08-lesson-2");
  assert.deepEqual(detail, { completed: ["w08-lesson-2"] });
});

test("valid Roadmap v1 backup is parsed and deduplicated", () => {
  const result = progress.parseProgressImport(JSON.stringify({
    format: "voai-lab-progress",
    version: 1,
    completed: ["w01-lesson-3", "w01-lesson-3", "finale-day-1"],
  }));

  assert.deepEqual(result, {
    ok: true,
    completed: ["w01-lesson-3", "finale-day-1"],
  });
});

test("import rejects malformed JSON, wrong schema, bad ids and oversized files", () => {
  assert.equal(progress.parseProgressImport("{").ok, false);
  assert.equal(progress.parseProgressImport(JSON.stringify({
    format: "khac",
    version: 1,
    completed: [],
  })).ok, false);
  const backupWithId = (id) => JSON.stringify({
    format: "voai-lab-progress",
    version: 1,
    completed: [id],
  });
  assert.equal(progress.parseProgressImport(backupWithId("")).ok, false);
  assert.equal(progress.parseProgressImport(backupWithId("   ")).ok, false);
  assert.equal(progress.parseProgressImport(backupWithId("line\nbreak")).ok, false);
  assert.equal(
    progress.parseProgressImport(backupWithId("x".repeat(progress.MAX_PROGRESS_ID_LENGTH + 1))).ok,
    false,
  );
  assert.equal(progress.parseProgressImport("{}", progress.MAX_PROGRESS_IMPORT_BYTES + 1).ok, false);
});

test("corrupt canonical storage is ignored without throwing", () => {
  const { map } = installWindow([]);
  map.set(progress.LEARNING_PROGRESS_STORAGE_KEY, "not-json");
  assert.deepEqual(progress.readLearningProgress(), []);
  const result = progress.mergeLearningProgress(["w01-lesson-3"]);
  assert.equal(result.status, "failed");
  assert.equal(map.get(progress.LEARNING_PROGRESS_STORAGE_KEY), "not-json");
});

test("legacy archived ids round-trip through the same import validator", () => {
  const legacy = ["legacy/2024 lesson A", "../../session", "bài cũ #1"];
  installWindow(legacy);
  const completed = progress.readLearningProgress();
  const parsed = progress.parseProgressImport(JSON.stringify({
    format: "voai-lab-progress",
    version: 1,
    completed,
  }));

  assert.deepEqual(parsed, { ok: true, completed: legacy });
});

test("a failed storage write does not emit a same-tab progress event", () => {
  const { events, map } = installWindow([], { failWrites: true });
  let eventCount = 0;
  events.addEventListener(progress.LEARNING_PROGRESS_EVENT, () => {
    eventCount += 1;
  });

  const result = progress.markSessionCompleted("w08-lesson-2");
  assert.equal(result.status, "failed");
  assert.equal(eventCount, 0);
  assert.deepEqual(JSON.parse(map.get(progress.LEARNING_PROGRESS_STORAGE_KEY)), []);
});

test("merge enforces the 10k limit after deduplication and never writes overflow", () => {
  const ids = Array.from({ length: progress.MAX_PROGRESS_IDS }, (_, index) => `legacy item/${index}`);
  const { events, map } = installWindow(ids);
  let eventCount = 0;
  events.addEventListener(progress.LEARNING_PROGRESS_EVENT, () => {
    eventCount += 1;
  });

  const duplicateOnly = progress.mergeLearningProgress([ids[0], ids[0]]);
  assert.equal(duplicateOnly.status, "ok");
  assert.equal(duplicateOnly.completed.length, progress.MAX_PROGRESS_IDS);
  assert.equal(eventCount, 1);

  const beforeOverflow = map.get(progress.LEARNING_PROGRESS_STORAGE_KEY);
  const overflow = progress.mergeLearningProgress(["one-more-id"]);
  assert.equal(overflow.status, "failed");
  assert.equal(overflow.error, "too-many-ids");
  assert.equal(overflow.completed.length, progress.MAX_PROGRESS_IDS);
  assert.equal(map.get(progress.LEARNING_PROGRESS_STORAGE_KEY), beforeOverflow);
  assert.equal(eventCount, 1);
});

test("Code Arena exposes canonical progress write failure without replacing the pass result", async () => {
  const source = await readFile(new URL("../components/CodePractice.tsx", import.meta.url), "utf8");

  assert.match(source, /const \[progressNotice,setProgressNotice\]/);
  assert.match(source, /Bài code vẫn đạt toàn bộ test mù, nhưng tiến độ Lộ trình chưa được lưu/);
  assert.match(source, /progressNotice\?<p className="storage-notice" role="status" aria-live="polite">/);
  assert.match(
    source,
    /setResult\(event\.data\);[\s\S]*markSessionCompleted\(roadmapSessionId\)/,
    "kết quả pass phải được giữ độc lập với cảnh báo ghi tiến độ",
  );
});

test("legacy Code Arena migration accepts only exact app-owned pass records", () => {
  const validTimestamp = "2026-08-20T10:20:30.000Z";
  const result = codePractice.legacyArenaPassedSessionIds({
    "vector-mean": { passedAt: validTimestamp, solo: true },
    "linear-predict": { passedAt: "not-a-date", solo: true },
    "knn-vote": { passedAt: validTimestamp, solo: false },
    "binary-metrics": { passedAt: validTimestamp, solo: true, injected: true },
    "conv-valid": { passedAt: validTimestamp, solo: true },
    "unknown-exercise": { passedAt: validTimestamp, solo: true },
  });

  assert.deepEqual(result, ["w01-lesson-3", "w23-lesson-2"]);
  assert.deepEqual(codePractice.legacyArenaPassedSessionIds(null), []);
  assert.deepEqual(codePractice.legacyArenaPassedSessionIds([]), []);
});

test("stored pass hydration batches each subsystem into one canonical merge", async () => {
  const [assessmentSource, arenaSource] = await Promise.all([
    readFile(new URL("../components/AssessmentExplorer.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/CodePractice.tsx", import.meta.url), "utf8"),
  ]);
  const migrationBlock = (source, start, end) => {
    const startIndex = source.indexOf(start);
    const endIndex = source.indexOf(end);
    assert.ok(startIndex >= 0 && endIndex > startIndex, `missing migration block: ${start}`);
    return source.slice(startIndex, endIndex);
  };
  const assessmentMigration = migrationBlock(
    assessmentSource,
    "PROGRESS-MIGRATION-ASSESSMENT-START",
    "PROGRESS-MIGRATION-ASSESSMENT-END",
  );
  const arenaMigration = migrationBlock(
    arenaSource,
    "PROGRESS-MIGRATION-ARENA-START",
    "PROGRESS-MIGRATION-ARENA-END",
  );

  assert.match(assessmentMigration, /validAttempts[\s\S]*attempt\.status === "passed"/);
  assert.match(assessmentMigration, /new Set\(/);
  assert.match(assessmentMigration, /setTransferMessage\(/);
  assert.equal((assessmentMigration.match(/mergeLearningProgress\(/g) ?? []).length, 1);
  assert.match(arenaMigration, /legacyArenaPassedSessionIds\(legacyRecords\)/);
  assert.match(arenaMigration, /if\(warning\)\{[\s\S]*setProgressNotice\(/);
  assert.equal((arenaMigration.match(/mergeLearningProgress\(/g) ?? []).length, 1);
});

test("Roadmap raw inspection distinguishes missing, valid and invalid progress stores", () => {
  assert.deepEqual(roadmapExplorer.inspectRoadmapProgressRaw(null), {
    status: "missing",
    completed: [],
  });
  assert.deepEqual(
    roadmapExplorer.inspectRoadmapProgressRaw(JSON.stringify(["w01-lesson-1", "w01-lesson-1", "old/id"])),
    { status: "valid", completed: ["w01-lesson-1", "old/id"] },
  );
  assert.deepEqual(roadmapExplorer.inspectRoadmapProgressRaw("not-json"), { status: "invalid" });
  assert.deepEqual(roadmapExplorer.inspectRoadmapProgressRaw("{}"), { status: "invalid" });
  assert.deepEqual(
    roadmapExplorer.inspectRoadmapProgressRaw(JSON.stringify(["ok", "line\nbreak"])),
    { status: "invalid" },
  );
});

test("Roadmap invalid and over-limit raw stores stay byte-for-byte unchanged and locked", () => {
  const { map } = installWindow([]);
  const overLimitRaw = JSON.stringify(
    Array.from({ length: progress.MAX_PROGRESS_IDS + 1 }, (_, index) => `session-${index}`),
  );
  for (const raw of ["{broken", overLimitRaw]) {
    map.set(progress.LEARNING_PROGRESS_STORAGE_KEY, raw);
    assert.deepEqual(roadmapExplorer.inspectRoadmapProgressRaw(raw), { status: "invalid" });
    assert.equal(
      roadmapExplorer.roadmapProgressActionsLocked({ current: false }, { current: false }),
      true,
      "pre-hydrate/invalid store must lock export and mutations",
    );
    const writeResult = progress.writeLearningProgress(["w01-lesson-1"]);
    assert.equal(writeResult.status, "failed");
    assert.equal(writeResult.error, "corrupt-storage");
    assert.equal(map.get(progress.LEARNING_PROGRESS_STORAGE_KEY), raw);
  }
});

test("Roadmap synchronous import gate blocks deferred toggle/double-start and resumes from current data", async () => {
  const importGate = { current: false };
  const writesAllowed = { current: true };
  const canonical = ["existing"];
  let resolveFileText;
  const fileText = new Promise((resolve) => {
    resolveFileText = resolve;
  });
  let resumedCanonical;
  const importTask = (async () => {
    assert.equal(roadmapExplorer.claimRoadmapImport(importGate), true);
    await fileText;
    resumedCanonical = [...canonical];
    roadmapExplorer.releaseRoadmapImport(importGate);
  })();

  assert.equal(roadmapExplorer.isRoadmapImportActive(importGate), true);
  assert.equal(roadmapExplorer.claimRoadmapImport(importGate), false);
  const toggle = () => {
    if (roadmapExplorer.roadmapProgressActionsLocked(importGate, writesAllowed)) return false;
    canonical.push("local-toggle");
    return true;
  };
  assert.equal(toggle(), false);
  canonical.push("external-pass");
  assert.equal(typeof resolveFileText, "function");
  resolveFileText("backup json");
  await importTask;

  assert.deepEqual(resumedCanonical, ["existing", "external-pass"]);
  assert.equal(roadmapExplorer.isRoadmapImportActive(importGate), false);
});

test("Roadmap component uses canonical progress after await and locks export controls", async () => {
  const source = await readFile(new URL("../components/RoadmapExplorer.tsx", import.meta.url), "utf8");
  const start = source.indexOf("const importProgress=async");
  const end = source.indexOf("\n\n  return (", start);
  assert.ok(start >= 0 && end > start);
  const importSource = source.slice(start, end);
  assert.ok(importSource.indexOf("await file.text()") < importSource.indexOf("const before=readLearningProgress()"));
  assert.doesNotMatch(importSource, /const before=\[\.\.\.completed/);
  assert.match(importSource, /claimRoadmapImport\(importingRef\)/);
  assert.match(importSource, /releaseRoadmapImport\(importingRef\)/);
  assert.match(source, /const exportProgress=\(\)=>\{if\(roadmapProgressActionsLocked\(importingRef,progressWritesAllowedRef\)\)return/);
  assert.match(source, /inspectRoadmapProgressRaw\(readRaw\(LEARNING_PROGRESS_STORAGE_KEY\)\)/);
  assert.match(source, /disabled=\{progressActionsDisabled\}>Xuất tiến độ<\/button>/);
  assert.match(source, /type="file"[^>]*disabled=\{progressActionsDisabled\}/);
  assert.match(source, /disabled=\{progressActionsDisabled\} onToggle=/);
  assert.match(source, /role="status" aria-live="polite"/);
});

test("a largest-contract Roadmap export remains importable byte-for-byte", () => {
  const completed = Array.from({ length: progress.MAX_PROGRESS_IDS }, (_, index) => {
    const prefix = `session-${index}-`;
    return prefix + "\ud800".repeat(progress.MAX_PROGRESS_ID_LENGTH - prefix.length);
  });
  const envelope = JSON.stringify(
    {
      format: "voai-lab-progress",
      version: 1,
      exportedAt: "2026-08-21T00:00:00.000Z",
      completed,
    },
    null,
    2,
  );
  const bytes = new TextEncoder().encode(envelope).byteLength;

  assert.ok(bytes > 1_000_000, "fixture must cover the former 1 MB mismatch");
  assert.ok(bytes <= progress.MAX_PROGRESS_IMPORT_BYTES);
  const parsed = progress.parseProgressImport(envelope, bytes);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.completed.length, progress.MAX_PROGRESS_IDS);
  assert.equal(parsed.completed[0], completed[0]);
  assert.equal(parsed.completed.at(-1), completed.at(-1));
});

test("toggle uses latest canonical progress instead of deleting a cross-tab addition", () => {
  const { map } = installWindow(["A", "B"]);
  const staleUi = new Set(["A"]);
  assert.deepEqual([...staleUi], ["A"]);

  const result = progress.toggleLearningProgress("A");

  assert.equal(result.status, "ok");
  assert.deepEqual(result.completed, ["B"]);
  assert.deepEqual(JSON.parse(map.get(progress.LEARNING_PROGRESS_STORAGE_KEY)), ["B"]);
});

test("Roadmap export reads live canonical data and rejects invalid raw at click time", async () => {
  const staleUi = ["A"];
  const exportedAt = "2026-08-21T01:02:03.000Z";
  const prepared = roadmapExplorer.prepareRoadmapProgressExport(
    JSON.stringify(["A", "B"]),
    exportedAt,
  );

  assert.deepEqual(staleUi, ["A"]);
  assert.deepEqual(prepared, {
    ok: true,
    payload: {
      format: "voai-lab-progress",
      version: 1,
      exportedAt,
      completed: ["A", "B"],
    },
  });
  assert.deepEqual(
    roadmapExplorer.prepareRoadmapProgressExport("{broken", exportedAt),
    { ok: false },
  );

  const source = await readFile(new URL("../components/RoadmapExplorer.tsx", import.meta.url), "utf8");
  const start = source.indexOf("const exportProgress=");
  const end = source.indexOf("\n\n  const importProgress=", start);
  assert.ok(start >= 0 && end > start);
  const exportSource = source.slice(start, end);
  assert.match(
    exportSource,
    /prepareRoadmapProgressExport\([\s\S]*readRaw\(LEARNING_PROGRESS_STORAGE_KEY\)/,
  );
  assert.doesNotMatch(exportSource, /completed:\[\.\.\.completed/);
  assert.match(exportSource, /if\(!prepared\.ok\)\{[\s\S]*setProgressStoreLocked\(true\)[\s\S]*return;/);
  assert.match(exportSource, /JSON\.stringify\(prepared\.payload/);
});
