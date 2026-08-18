/**
 * Kiểm **hành vi** của lớp ghi nháp, không kiểm chữ trong mã nguồn.
 *
 * Mất bài làm là lỗi nặng nhất của một website học tập, nên ba tính chất dưới
 * đây phải được chốt bằng test chạy thật:
 *
 * - nhiều nhịp gõ chỉ tốn một lần ghi, và giá trị xuống đĩa là giá trị cuối;
 * - `flush` ghi ngay, dùng cho lúc rời trang;
 * - ghi hỏng phải báo ra ngoài chứ không im lặng.
 */

import assert from "node:assert/strict";
import test, { after, before, beforeEach } from "node:test";

import { cleanupLoadedModules, loadTypeScriptModule } from "./helpers/load-module.mjs";

let draftStorage;

/** localStorage giả lập; `quota` bật lên để mô phỏng bộ nhớ đầy. */
function installStorage({ quota = false } = {}) {
  const map = new Map();
  let writes = 0;
  globalThis.window = {
    localStorage: {
      getItem(key) {
        return map.has(key) ? map.get(key) : null;
      },
      setItem(key, value) {
        writes += 1;
        if (quota) {
          const error = new Error("đầy");
          error.name = "QuotaExceededError";
          throw error;
        }
        map.set(key, value);
      },
      removeItem(key) {
        map.delete(key);
      },
    },
  };
  return {
    map,
    /** Số lần thực sự chạm vào storage; đây là thứ việc gộp nhịp phải giảm. */
    get writes() {
      return writes;
    },
  };
}

/** Đồng hồ do test điều khiển: không có `sleep`, không có test chập chờn. */
function createClock() {
  const scheduled = new Map();
  let nextHandle = 1;
  return {
    setTimer(callback) {
      const handle = nextHandle++;
      scheduled.set(handle, callback);
      return handle;
    },
    clearTimer(handle) {
      scheduled.delete(handle);
    },
    /** Chạy mọi hẹn giờ đang chờ, như khi hết khoảng gộp nhịp. */
    tick() {
      const callbacks = [...scheduled.values()];
      scheduled.clear();
      for (const callback of callbacks) callback();
    },
    get pending() {
      return scheduled.size;
    },
  };
}

function makeWriter(key, { quota = false } = {}) {
  const storage = installStorage({ quota });
  const clock = createClock();
  const statuses = [];
  const writer = draftStorage.createDraftWriter(key, {
    onStatus: (notice) => statuses.push(notice),
    setTimer: clock.setTimer,
    clearTimer: clock.clearTimer,
  });
  return { storage, clock, statuses, writer };
}

before(async () => {
  draftStorage = await loadTypeScriptModule("lib/draft-storage.ts");
});

after(async () => {
  delete globalThis.window;
  await cleanupLoadedModules();
});

beforeEach(() => {
  delete globalThis.window;
});

test("typing many characters costs exactly one write, keeping the last value", () => {
  const { storage, clock, writer } = makeWriter("k");
  for (const text of ["d", "de", "def", "def f"]) writer.schedule({ code: text });

  assert.equal(storage.writes, 0, "chưa hết khoảng gộp nhịp thì không được chạm storage");
  clock.tick();
  assert.equal(storage.writes, 1, "bốn nhịp gõ phải gộp thành đúng một lần ghi");
  assert.deepEqual(JSON.parse(storage.map.get("k")), { code: "def f" });
});

test("flush writes immediately, which is what leaving the page relies on", () => {
  const { storage, clock, writer } = makeWriter("k");
  writer.schedule({ code: "đang gõ dở" });
  writer.flush();

  assert.equal(storage.writes, 1);
  assert.deepEqual(JSON.parse(storage.map.get("k")), { code: "đang gõ dở" });
  assert.equal(clock.pending, 0, "flush phải huỷ luôn hẹn giờ đang chờ");
});

test("flush with nothing pending never touches storage", () => {
  const { storage, writer } = makeWriter("k");
  writer.flush();
  writer.flush();
  assert.equal(storage.writes, 0);
});

test("a stale pending write cannot resurrect a draft that was just cleared", () => {
  // Đúng kịch bản lúc nộp bài: người học gõ (đã hẹn ghi), rồi bấm nộp — bản nháp
  // bị xoá khỏi kho. Nếu lần ghi cũ còn treo chạy sau, bài đã nộp sẽ hiện lại
  // như một bản nháp chưa nộp.
  const { storage, clock, writer } = makeWriter("k");
  writer.schedule({ drafts: { "phien-01": "câu trả lời dở" } });
  writer.schedule({ drafts: {} });
  writer.flush();

  assert.deepEqual(JSON.parse(storage.map.get("k")), { drafts: {} });
  clock.tick();
  assert.equal(storage.writes, 1, "lần ghi cũ không được chạy lại sau khi đã flush");
  assert.deepEqual(JSON.parse(storage.map.get("k")), { drafts: {} });
});

test("dispose drops the pending write without saving it", () => {
  const { storage, clock, writer } = makeWriter("k");
  writer.schedule({ code: "bỏ đi" });
  writer.dispose();
  clock.tick();
  assert.equal(storage.writes, 0);
  assert.equal(storage.map.has("k"), false);
});

test("a full storage is reported instead of being swallowed", () => {
  const { statuses, writer } = makeWriter("k", { quota: true });
  writer.schedule({ code: "x" });
  writer.flush();

  assert.equal(statuses.length, 1);
  assert.match(statuses[0] ?? "", /đầy/i, "người học phải được báo là bộ nhớ đã đầy");
});

test("a storage the browser blocks entirely is reported too", () => {
  const clock = createClock();
  const statuses = [];
  // Không cài `window`: đúng như khi cookie bị chặn hoàn toàn.
  const writer = draftStorage.createDraftWriter("k", {
    onStatus: (notice) => statuses.push(notice),
    setTimer: clock.setTimer,
    clearTimer: clock.clearTimer,
  });
  writer.schedule({ code: "x" });
  writer.flush();

  assert.equal(statuses.length, 1);
  assert.equal(typeof statuses[0], "string", "ghi hỏng phải có lời báo, không được là null");
});

test("a successful write reports no problem", () => {
  const { statuses, writer } = makeWriter("k");
  writer.schedule({ code: "x" });
  writer.flush();
  assert.deepEqual(statuses, [null]);
});
