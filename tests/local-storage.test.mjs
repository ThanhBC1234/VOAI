import assert from "node:assert/strict";
import test, { after, before, beforeEach } from "node:test";

import { cleanupLoadedModules, loadTypeScriptModule } from "./helpers/load-module.mjs";

let storage;

/** localStorage giả lập, có thể bắt ném lỗi theo ý muốn. */
function installStorage({ throwOnGet = false, throwOnSet = false, quota = false } = {}) {
  const map = new Map();
  globalThis.window = {
    localStorage: {
      getItem(key) {
        if (throwOnGet) throw new Error("getItem bị chặn");
        return map.has(key) ? map.get(key) : null;
      },
      setItem(key, value) {
        if (quota) {
          const error = new Error("đầy");
          error.name = "QuotaExceededError";
          throw error;
        }
        if (throwOnSet) throw new Error("setItem bị chặn");
        map.set(key, value);
      },
      removeItem(key) {
        map.delete(key);
      },
    },
  };
  return map;
}

before(async () => {
  storage = await loadTypeScriptModule("lib/local-storage.ts");
});

after(async () => {
  delete globalThis.window;
  await cleanupLoadedModules();
});

beforeEach(() => {
  delete globalThis.window;
});

const acceptArray = (value) => (Array.isArray(value) ? value : null);

test("reading malformed JSON returns the fallback instead of throwing", () => {
  const map = installStorage();
  map.set("k", "{ không phải json");
  assert.deepEqual(storage.readJson("k", acceptArray, []), []);
});

test("reading when the value fails validation returns the fallback", () => {
  const map = installStorage();
  map.set("k", JSON.stringify({ khong: "phải mảng" }));
  assert.deepEqual(storage.readJson("k", acceptArray, ["mặc định"]), ["mặc định"]);
});

test("a validator that throws is contained", () => {
  const map = installStorage();
  map.set("k", JSON.stringify([1]));
  const result = storage.readJson("k", () => {
    throw new Error("validator lỗi");
  }, "an toàn");
  assert.equal(result, "an toàn");
});

test("getItem throwing does not propagate", () => {
  installStorage({ throwOnGet: true });
  assert.equal(storage.readRaw("k"), null);
  assert.deepEqual(storage.readJson("k", acceptArray, []), []);
});

test("setItem throwing is reported instead of thrown", () => {
  installStorage({ throwOnSet: true });
  assert.equal(storage.writeJson("k", [1, 2]), "failed");
});

test("quota errors are distinguished so the UI can explain them", () => {
  installStorage({ quota: true });
  const status = storage.writeJson("k", [1, 2]);
  assert.equal(status, "quota-exceeded");
  assert.match(storage.describeWriteStatus(status), /đã đầy/);
});

test("a blocked storage reports unavailable and stays silent", () => {
  delete globalThis.window;
  assert.equal(storage.writeJson("k", [1]), "unavailable");
  assert.equal(storage.readRaw("k"), null);
  assert.match(storage.describeWriteStatus("unavailable"), /chặn bộ nhớ cục bộ/);
});

test("values that cannot be serialised are reported, not thrown", () => {
  installStorage();
  const cycle = {};
  cycle.self = cycle;
  assert.equal(storage.writeJson("k", cycle), "failed");
});

test("a successful write reports ok and no message", () => {
  const map = installStorage();
  assert.equal(storage.writeJson("k", { a: 1 }), "ok");
  assert.equal(map.get("k"), '{"a":1}');
  assert.equal(storage.describeWriteStatus("ok"), null);
});

// STORAGE-P2-01: id lạ không được tính vào phần trăm nhưng phải được giữ lại.
test("unknown progress ids are archived rather than dropped", () => {
  const known = new Set(["a", "b"]);
  const { active, archived } = storage.partitionKnownIds(["a", "đã-xoá", "b", "cũ"], known);
  assert.deepEqual(active, ["a", "b"]);
  assert.deepEqual(archived, ["đã-xoá", "cũ"]);
});
