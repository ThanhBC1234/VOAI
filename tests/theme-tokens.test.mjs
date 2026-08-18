/**
 * Bảo vệ hệ token màu của chế độ sáng/tối.
 *
 * Ba lỗi dưới đây đều **build xanh, test xanh, rồi hỏng trên trang thật** — nên
 * chúng phải bị chặn ở đây chứ không phải phát hiện bằng mắt:
 *
 * 1. Thêm một mã màu cứng vào quy tắc mới. Nó sẽ giữ nguyên màu của theme sáng
 *    khi người dùng bật nền tối — chữ trắng trên nền trắng hoặc ngược lại.
 * 2. Thêm token cho theme sáng mà quên bản tối. Token rơi về giá trị sáng.
 * 3. Sửa một trong hai khối tối mà quên khối kia: người bật nền tối bằng nút
 *    thấy một bảng màu, người để theo hệ điều hành thấy bảng màu khác.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

// Bỏ chú thích ngay từ đầu: phần giải thích cũng nhắc tới mã màu, và nếu để lại
// thì phép quét "còn mã màu cứng không" sẽ báo nhầm.
const css = (await readFile(new URL("../app/globals.css", import.meta.url), "utf8")).replace(
  /\/\*[\s\S]*?\*\//g,
  "",
);

/** Cắt một khối `{ … }` cân bằng ngoặc, bắt đầu từ vị trí của bộ chọn. */
function block(selector) {
  const start = css.indexOf(selector);
  assert.notEqual(start, -1, `không tìm thấy bộ chọn ${selector}`);
  const open = css.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < css.length; i += 1) {
    if (css[i] === "{") depth += 1;
    else if (css[i] === "}") {
      depth -= 1;
      if (depth === 0) return css.slice(open + 1, i);
    }
  }
  throw new Error(`khối ${selector} không đóng ngoặc`);
}

function tokens(source) {
  return new Map(
    [...source.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]),
  );
}

const TOKEN_BLOCKS = [":root {", ':root:not([data-theme="light"])', ':root[data-theme="dark"]'];
const light = tokens(block(TOKEN_BLOCKS[0]));
const bySystem = tokens(block(TOKEN_BLOCKS[1]));
const byChoice = tokens(block(TOKEN_BLOCKS[2]));

// Bán kính bo góc không đổi theo chế độ nên không cần bản tối.
const GEOMETRY_ONLY = new Set(["radius", "radius-sm", "radius-lg"]);

test("mọi token màu của theme sáng đều có bản cho theme tối", () => {
  const missing = [...light.keys()].filter((name) => !GEOMETRY_ONLY.has(name) && !byChoice.has(name));
  assert.deepEqual(missing, [], `token thiếu giá trị ở theme tối: ${missing.join(", ")}`);
});

test("hai lối vào theme tối định nghĩa cùng một bảng màu", () => {
  // `@media` phục vụ người chưa bấm nút, `[data-theme]` phục vụ người đã chọn.
  // Hai khối buộc phải khớp từng giá trị, nếu không cùng một người sẽ thấy hai
  // giao diện khác nhau tuỳ theo họ tới bằng đường nào.
  assert.deepEqual([...bySystem.keys()].sort(), [...byChoice.keys()].sort());
  for (const [name, value] of byChoice) {
    assert.equal(bySystem.get(name), value, `token --${name} lệch giữa hai khối theme tối`);
  }
});

test("token tối phải khác token sáng, nếu không là quên đổi", () => {
  // Vài token cố ý giữ nguyên: mint vẫn tươi ở cả hai chế độ, và các chấm trang
  // trí không mang chữ nên không cần đổi.
  const INTENTIONALLY_SHARED = new Set(["mint-fill", "on-ink-soft", "dot-coral", "accent-coral", "accent-gold"]);
  const unchanged = [...byChoice.entries()]
    .filter(([name, value]) => !INTENTIONALLY_SHARED.has(name) && light.get(name) === value)
    .map(([name]) => name);
  assert.deepEqual(unchanged, [], `token chưa được đổi cho theme tối: ${unchanged.join(", ")}`);
});

test("không còn mã màu cứng nào ngoài các khối token", () => {
  // Bỏ ba khối khai báo token rồi quét phần còn lại: mọi quy tắc phải trỏ tới
  // biến, vì chỉ biến mới đổi được theo chế độ.
  let rules = css;
  for (const selector of TOKEN_BLOCKS) rules = rules.replace(block(selector), "");
  const literals = rules.match(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g) ?? [];
  assert.deepEqual(literals, [], `mã màu cứng còn sót: ${literals.join(", ")}`);
});

test("script chống nháy chạy trước khi trang được vẽ", async () => {
  // Không có script này, mỗi lần chuyển trang người chọn nền tối sẽ thấy một
  // nháy trắng — đúng thứ mà chế độ tối sinh ra để tránh.
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  assert.match(layout, /<head>[\s\S]*THEME_INIT_SCRIPT[\s\S]*<\/head>/);

  const theme = await readFile(new URL("../lib/theme.ts", import.meta.url), "utf8");
  assert.match(theme, /prefers-color-scheme: dark/);
  assert.match(theme, /try\{/, "truy cập localStorage phải được bọc try/catch");
});
