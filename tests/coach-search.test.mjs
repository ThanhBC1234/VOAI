/**
 * Khoá chất lượng truy hồi của trợ giảng tự luận.
 *
 * Trợ giảng này hỏng theo kiểu **im lặng**: nó luôn trả về một cái gì đó trông
 * hợp lý, nên một thay đổi làm hỏng xếp hạng sẽ không làm đỏ bất kỳ test nào
 * khác, không ném lỗi, không hiện ra trên giao diện — người học chỉ đơn giản
 * nhận sai nội dung và không có cách nào biết. Vì vậy phần được khoá chặt nhất
 * ở đây là hai hướng hỏng đối nhau:
 *
 * - **Trả nhầm**: câu hỏi ngoài giáo trình mà vẫn kéo về vài đoạn nghe liên
 *   quan. Người học sẽ tưởng đó là câu trả lời.
 * - **Trả thiếu**: câu hỏi có trong giáo trình mà báo "không có", đẩy người học
 *   đi tra nguồn ngoài trong khi nội dung nằm ngay trong repo.
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

import { emitCoachIndex } from "../scripts/emit-coach-index.mjs";

/** Nạp module TypeScript bằng cách bundle qua esbuild, như các script khác. */
function loadTypeScript(entry) {
  const scratch = mkdtempSync(path.join(tmpdir(), "voai-coach-test-"));
  const outfile = path.join(scratch, "bundle.mjs");
  try {
    execFileSync(
      process.execPath,
      [
        path.join("node_modules", "esbuild", "bin", "esbuild"),
        entry,
        "--bundle",
        "--format=esm",
        "--platform=node",
        "--log-level=silent",
        `--outfile=${outfile}`,
      ],
      { stdio: "pipe" },
    );
    return import(pathToFileURL(outfile).href);
  } finally {
    process.on("exit", () => rmSync(scratch, { recursive: true, force: true }));
  }
}

const { buildCoachIndex, searchCoach, tokenize, normalizeVietnamese, socraticChallenge } =
  await loadTypeScript("lib/coach-search.ts");
const { parseCoachIndexPayload } = await loadTypeScript("lib/coach-index.ts");

// Dùng đúng chỉ mục mà website sẽ phát hành, không phải dữ liệu giả: một câu
// hỏi chỉ có ý nghĩa khi được đo trên toàn bộ giáo trình thật.
const emitted = await emitCoachIndex();
const payload = JSON.parse(readFileSync(path.join(emitted.directory, "index.json"), "utf8"));
const records = parseCoachIndexPayload(payload);
assert.ok(records, "chỉ mục vừa sinh phải qua được chính bộ kiểm định của nó");
const index = buildCoachIndex(records);

const titlesFor = (query) =>
  searchCoach(index, query, 4)
    .map((hit) => `${hit.record.title} ${hit.record.body} ${hit.record.topic}`)
    .join(" \n ")
    .toLowerCase();

test("bỏ dấu tiếng Việt xử lý được cả chữ đ", () => {
  assert.equal(normalizeVietnamese("Hồi quy tuyến tính"), "hoi quy tuyen tinh");
  assert.equal(normalizeVietnamese("ĐỘ PHỨC TẠP"), "do phuc tap");
});

test("hư từ bị loại, nhưng từ có dấu trùng hư từ thì không", () => {
  // "nổ" bỏ dấu thành "no", trùng với "không" đã bỏ dấu. Lọc hư từ theo dạng bỏ
  // dấu sẽ nuốt mất từ khoá phân biệt của câu hỏi về exploding gradient.
  assert.ok(!tokenize("là gì của và cho").length, "hư từ thuần phải bị loại hết");
  assert.ok(tokenize("gradient bùng nổ").includes("no"), "‘nổ’ phải được giữ lại");
});

test("chuỗi có gạch nối khớp được cả khi người học gõ liền", () => {
  // "k-NN" cắt thô sẽ ra ["nn"] vì mảnh "k" bị loại do một ký tự, nên câu hỏi
  // gõ "kNN" sẽ không khớp được gì.
  assert.ok(tokenize("k-NN").includes("knn"), "phải sinh thêm bản nối liền");
  assert.ok(titlesFor("độ phức tạp của kNN").includes("k-nn"), "phải tìm ra nội dung k-NN");
});

test("câu hỏi trong giáo trình tìm đúng nội dung", () => {
  const cases = [
    ["vì sao MSE nhạy với ngoại lai", "ngoại lai"],
    ["overfitting là gì", "overfitting"],
    ["công thức softmax", "softmax"],
    ["precision và recall khác nhau thế nào", "recall"],
    ["batch normalization dùng để làm gì", "normalization"],
    ["attention là gì", "attention"],
  ];
  for (const [query, expected] of cases) {
    assert.ok(titlesFor(query).includes(expected), `“${query}” phải tìm ra nội dung về “${expected}”`);
  }
});

test("gõ không dấu vẫn tìm được", () => {
  // Người học gõ vội hoặc dùng bàn phím không dấu; bắt gõ đúng dấu mới tìm được
  // là tự chặn đúng người đang cần giúp nhất.
  assert.ok(titlesFor("hoi quy logistic").includes("logistic"));
  assert.ok(titlesFor("do phuc tap knn").includes("k-nn"));
});

test("câu hỏi ngoài giáo trình trả về rỗng thay vì đoạn lạc đề", () => {
  // Đây là hướng hỏng nguy hiểm nhất: "phở/bò" khớp "phổ/bộ" sau khi bỏ dấu,
  // nên nếu chỉ đếm tỷ lệ từ khớp thì câu hỏi nấu ăn sẽ kéo về nội dung xử lý
  // tín hiệu — và người học không có cách nào biết đó là kết quả rác.
  for (const query of [
    "cách nấu phở bò",
    "Messi có mấy quả bóng vàng",
    "giá vàng hôm nay bao nhiêu",
    "dự báo thời tiết Hà Nội",
  ]) {
    assert.deepEqual(searchCoach(index, query, 4), [], `“${query}” phải trả về rỗng`);
  }
});

test("câu hỏi rỗng hoặc toàn hư từ không trả về gì", () => {
  assert.deepEqual(searchCoach(index, "", 4), []);
  assert.deepEqual(searchCoach(index, "   ", 4), []);
  assert.deepEqual(searchCoach(index, "là gì của và", 4), []);
});

test("kết quả xếp giảm dần theo điểm và không vượt quá giới hạn", () => {
  const hits = searchCoach(index, "overfitting", 3);
  assert.ok(hits.length > 0 && hits.length <= 3);
  for (let i = 1; i < hits.length; i += 1) {
    assert.ok(hits[i - 1].score >= hits[i].score, "điểm phải giảm dần");
  }
});

test("mỗi loại nguồn có một câu phản biện, không có câu kết luận thay", () => {
  // Hợp đồng COACH-10: trợ giảng chỉ đẩy người học tự kiểm chứng thêm một bước.
  for (const kind of ["theory", "lesson", "failure", "complexity", "math", "pitfall"]) {
    const challenge = socraticChallenge(kind);
    assert.ok(challenge.length > 20, `“${kind}” phải có câu phản biện`);
    assert.match(challenge, /\?|Viết lại|Chỉ ra|Nêu|Phát biểu/, "phải là câu hỏi hoặc yêu cầu tự kiểm");
  }
});

test("chỉ mục hỏng hoặc sai phiên bản bị từ chối thay vì dùng rỗng", () => {
  // Một tệp cũ còn trong HTTP cache, hoặc trang 404 dạng HTML của GitHub Pages,
  // không được đi tiếp thành "chỉ mục rỗng" — nếu không trợ giảng sẽ trả lời
  // "không có trong giáo trình" cho mọi câu hỏi mà không ai biết vì sao.
  assert.equal(parseCoachIndexPayload(null), null);
  assert.equal(parseCoachIndexPayload({ version: 999, records: [payload.records[0]] }), null);
  assert.equal(parseCoachIndexPayload({ version: 1, records: [] }), null);
  assert.equal(parseCoachIndexPayload({ version: 1, records: [{ kind: "khong-ton-tai" }] }), null);
  assert.equal(parseCoachIndexPayload("<!doctype html>"), null);
});

test("chỉ mục phủ đủ bốn nguồn nội dung của dự án", () => {
  const kinds = new Set(records.map((record) => record.kind));
  for (const kind of ["theory", "lesson", "failure", "complexity", "math", "pitfall"]) {
    assert.ok(kinds.has(kind), `chỉ mục phải có bản ghi loại “${kind}”`);
  }
  assert.ok(records.length > 500, `chỉ mục chỉ có ${records.length} bản ghi, nghi bị hụt nguồn`);
});
