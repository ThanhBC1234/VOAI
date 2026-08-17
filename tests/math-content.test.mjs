/**
 * Kiểm chứng lớp Toán — **tính lại độc lập** từng đáp án số.
 *
 * Vì sao phải làm vậy: nội dung toán sai không làm gãy bản dựng và không làm
 * đỏ typecheck. Một đáp án lệch chỉ bị phát hiện khi có người học ngồi tính
 * tay — tức là quá muộn. Ở đây mỗi bài luyện được tính lại bằng code viết từ
 * định nghĩa, **không** đọc trường `answer` của nội dung, rồi mới đem so.
 *
 * Test cũng chặn việc thêm bài luyện mới mà quên kiểm: mọi `drill.id` bắt buộc
 * phải có một hàm tính lại tương ứng, và ngược lại.
 */

import assert from "node:assert/strict";
import test, { after } from "node:test";
import { cleanupLoadedModules, loadTypeScriptModule } from "./helpers/load-module.mjs";

const math = await loadTypeScriptModule("content/math/index.ts");
const { MATH_MODULES, MATH_VALIDATION, MATH_TOPICS, checkDrillAnswer, mathModuleOf } = math;

after(async () => {
  await cleanupLoadedModules();
});

/* ------------------------------------------------------------------ */
/* Bộ công cụ tính lại — viết từ định nghĩa, không dùng lại code nội dung */
/* ------------------------------------------------------------------ */

const l1 = (v) => v.reduce((sum, x) => sum + Math.abs(x), 0);
const l2 = (v) => Math.sqrt(v.reduce((sum, x) => sum + x * x, 0));
const dot = (a, b) => a.reduce((sum, x, i) => sum + x * b[i], 0);
const cosine = (a, b) => dot(a, b) / (l2(a) * l2(b));
const log2 = (x) => Math.log(x) / Math.LN2;
const sigmoid = (z) => 1 / (1 + Math.exp(-z));

function matmul(a, b) {
  return a.map((row) =>
    b[0].map((_, j) => row.reduce((sum, value, k) => sum + value * b[k][j], 0)),
  );
}

/** Hạng của ma trận 2×2, suy từ định nghĩa chứ không phải từ đáp án có sẵn. */
function rank2x2([[a, b], [c, d]]) {
  if ([a, b, c, d].every((value) => value === 0)) return 0;
  return a * d - b * c === 0 ? 1 : 2;
}

/** Nghiệm của $\lambda^2 - tr\lambda + \det = 0$ cho ma trận 2×2. */
function eigenvalues2x2([[a, b], [c, d]]) {
  const trace = a + d;
  const determinant = a * d - b * c;
  const root = Math.sqrt(trace * trace - 4 * determinant);
  return [(trace + root) / 2, (trace - root) / 2];
}

function factorial(n) {
  let result = 1;
  for (let i = 2; i <= n; i += 1) result *= i;
  return result;
}

const choose = (n, k) => factorial(n) / (factorial(k) * factorial(n - k));

function softmax(logits) {
  const shift = Math.max(...logits);
  const exponentials = logits.map((z) => Math.exp(z - shift));
  const total = exponentials.reduce((sum, value) => sum + value, 0);
  return exponentials.map((value) => value / total);
}

function entropyBits(distribution) {
  return -distribution.reduce((sum, p) => (p > 0 ? sum + p * log2(p) : sum), 0);
}

function klBits(p, q) {
  return p.reduce((sum, value, i) => (value > 0 ? sum + value * log2(value / q[i]) : sum), 0);
}

/** Xác suất chuẩn tắc trên [-z, z] bằng Simpson, đủ chính xác để đối chiếu. */
function standardNormalWithin(z, steps = 20000) {
  const pdf = (x) => Math.exp(-(x * x) / 2) / Math.sqrt(2 * Math.PI);
  const h = (2 * z) / steps;
  let total = pdf(-z) + pdf(z);
  for (let i = 1; i < steps; i += 1) {
    total += pdf(-z + i * h) * (i % 2 === 0 ? 2 : 4);
  }
  return (total * h) / 3;
}

function bayes(prior, sensitivity, falsePositiveRate) {
  const truePositive = sensitivity * prior;
  const falsePositive = falsePositiveRate * (1 - prior);
  return truePositive / (truePositive + falsePositive);
}

/** Một bước gradient descent trên $f(w)=(w-c)^2$. */
const gradientStep = (w, learningRate, centre = 0) => w - learningRate * 2 * (w - centre);

const MATMUL_EXAMPLE = matmul(
  [
    [1, 2, 3],
    [4, 5, 6],
  ],
  [
    [7, 8],
    [9, 10],
    [11, 12],
  ],
);

const CONFUSION = { tp: 40, fp: 10, fn: 20, tn: 930 };
const precision = CONFUSION.tp / (CONFUSION.tp + CONFUSION.fp);
const recall = CONFUSION.tp / (CONFUSION.tp + CONFUSION.fn);

/* ------------------------------------------------------------------ */
/* Bảng tính lại: drill.id → giá trị đúng                              */
/* ------------------------------------------------------------------ */

const RECOMPUTED = {
  // Đại số tuyến tính
  "la-norms-d1": () => l2([-6, 8]),
  "la-norms-d2": () => l1([1, -2, 2, -4]),
  "la-norms-d3": () => 3 / l2([3, 4]),
  "la-dot-d1": () => dot([3, 0, 4], [0, 5, 0]),
  "la-dot-d2": () => cosine([1, 1], [1, 0]),
  "la-dot-d3": () => cosine([1, 2, 3], [4, 5, 6]),
  "la-matmul-d1": () => 128 * 64 * 256,
  "la-matmul-d2": () => MATMUL_EXAMPLE[1][0],
  "la-matmul-d3": () => 32 * 10 * 64,
  "la-det-d1": () => 3 * 6 - 8 * 4,
  "la-det-d2": () => rank2x2([[2, 1], [6, 3]]),
  "la-det-d3": () => 6 / (4 * 6 - 7 * 2),
  "la-eigen-d1": () => Math.max(...eigenvalues2x2([[4, 1], [2, 3]])),
  "la-eigen-d2": () => 6 / (6 + 3 + 1),
  "la-eigen-d3": () => Math.min(...eigenvalues2x2([[5, 2], [2, 5]])),

  // Giải tích
  "ca-rules-d1": () => 12 * 2 ** 3 - 10 * 2,
  "ca-rules-d2": () => 1 / 4,
  "ca-rules-d3": () => 2 * Math.exp(2),
  "ca-chain-d1": () => 5 * (3 * 1 + 1) ** 4 * 3,
  "ca-chain-d2": () => Math.exp(1) * 2 * 1,
  "ca-chain-d3": () => sigmoid(0),
  "ca-grad-d1": () => 2 ** 2 + 9 * 3 ** 2,
  "ca-grad-d2": () => l2([2 * 3, 2 * 4]),
  "ca-grad-d3": () => 2 * (1.5 * 2 - 1) * 2,
  "ca-act-d1": () => sigmoid(0) * (1 - sigmoid(0)),
  "ca-act-d2": () => sigmoid(2) * (1 - sigmoid(2)),
  "ca-act-d3": () => softmax([1, 2, 3])[2],
  "ca-backprop-d1": () => 0.5 * (3 * Math.max(0, 2 * 1) - 1 - 3) ** 2,
  "ca-backprop-d2": () => (3 * Math.max(0, 2 * 1) - 1 - 3) * Math.max(0, 2 * 1),
  // w1 = -2 ⇒ z1 < 0 ⇒ ReLU' = 0 ⇒ mọi gradient qua nhánh này bằng 0.
  "ca-backprop-d3": () => (Math.max(0, -2 * 1) > 0 ? 6 : 0),

  // Xác suất
  "pr-cond-d1": () => 0.3 * 0.5,
  "pr-cond-d2": () => 0.2 / 0.5,
  "pr-cond-d3": () => (4 / 52) * (3 / 51),
  "pr-bayes-d1": () => bayes(0.01, 0.99, 0.05),
  "pr-bayes-d2": () => bayes(0.1, 0.99, 0.05),
  "pr-bayes-d3": () => bayes(0.4, 0.6, 0.1),
  "pr-exp-d1": () => 0.3 * (1 - 0.3),
  "pr-exp-d2": () => [1, 2, 3, 4, 5, 6].reduce((sum, x) => sum + x / 6, 0),
  "pr-exp-d3": () => 2 ** 2 * 9,
  "pr-dist-d1": () => 20 * 0.3,
  "pr-dist-d2": () => choose(10, 5) * 0.5 ** 5 * 0.5 ** 5,
  "pr-dist-d3": () => standardNormalWithin(2),
  "pr-mle-d1": () => 7 / 10,
  "pr-mle-d2": () => (2 + 4 + 9) / 3,
  "pr-mle-d3": () => -Math.log(0.8),

  // Tối ưu
  "op-gd-d1": () => gradientStep(gradientStep(4, 0.1), 0.1),
  "op-gd-d2": () => gradientStep(1, 1.5),
  "op-gd-d3": () => gradientStep(0, 0.25, 3),
  "op-cvx-d1": () => 2,
  "op-cvx-d2": () => 2 ** 2 - 4 * 2 + 7,
  "op-cvx-d3": () => 6 * -1,
  "op-mom-d1": () => 0.9 * (0.9 * 0 + 2) + 2,
  "op-mom-d2": () => 0.9 * 0 + (1 - 0.9) * 4,
  "op-mom-d3": () => ((1 - 0.9) * 4) / (1 - 0.9 ** 1),
  "op-reg-d1": () => 0.1 * l2([3, -4]) ** 2,
  "op-reg-d2": () => 0.1 * l1([3, -4]),
  "op-reg-d3": () => 2 * 0.05 * 6,

  // Đo lường
  "me-ent-d1": () => entropyBits([0.5, 0.5]),
  "me-ent-d2": () => entropyBits([0.5, 0.25, 0.25]),
  "me-ent-d3": () => entropyBits([1, 0]),
  "me-ce-d1": () => -log2(0.8),
  "me-ce-d2": () => klBits([0.5, 0.5], [0.25, 0.75]),
  "me-ce-d3": () => -log2(0.5),
  "me-met-d1": () => precision,
  "me-met-d2": () => recall,
  "me-met-d3": () => (2 * precision * recall) / (precision + recall),
  "me-cx-d1": () => log2(1024),
  "me-cx-d2": () => Math.ceil(log2(1e6)),
  "me-cx-d3": () => 512 ** 2 * 64,
};

/* ------------------------------------------------------------------ */

test("cổng dữ liệu chạy lúc import và báo đúng quy mô lớp Toán", () => {
  assert.equal(MATH_VALIDATION.modules, MATH_MODULES.length);
  assert.equal(MATH_VALIDATION.topics, MATH_TOPICS.length);
  assert.ok(MATH_VALIDATION.modules >= 5, "lớp Toán phải phủ đủ các mảng kiến thức thi");
  assert.ok(MATH_VALIDATION.drills >= 40);
  assert.ok(MATH_VALIDATION.byLevel.core > 0 && MATH_VALIDATION.byLevel.applied > 0);
  assert.equal(
    MATH_VALIDATION.byLevel.core + MATH_VALIDATION.byLevel.applied + MATH_VALIDATION.byLevel.advanced,
    MATH_VALIDATION.topics,
  );
});

test("mọi chủ đề nêu rõ vì sao nó nằm trong phạm vi thi", () => {
  for (const topic of MATH_TOPICS) {
    assert.ok(topic.examUse.trim().length > 30, `${topic.id} chưa nói rõ chỗ dùng trong đề`);
    assert.ok(topic.appearsIn.length > 0, `${topic.id} không liên kết ngược về lộ trình`);
    assert.ok(topic.worked.steps.length >= 2, `${topic.id} thiếu bước giải mẫu`);
    assert.ok(mathModuleOf(topic.id), `${topic.id} không thuộc module nào`);
  }
});

test("mọi công thức nằm trong dấu $ đều đóng và mọi latex đều sạch", () => {
  const countDollars = (value) => (value.match(/(?<!\\)\$/g) ?? []).length;
  for (const topic of MATH_TOPICS) {
    const strings = [
      topic.title,
      topic.examUse,
      ...topic.keyIdeas,
      ...topic.pitfalls,
      topic.worked.prompt,
      ...topic.worked.steps,
      topic.worked.answer,
      ...topic.drills.flatMap((drill) => [drill.prompt, ...drill.solution]),
    ];
    for (const value of strings) {
      assert.equal(countDollars(value) % 2, 0, `${topic.id}: dấu $ lẻ trong "${value.slice(0, 60)}…"`);
    }
    for (const formula of topic.formulas) {
      assert.doesNotMatch(formula.latex, /\$/, `${topic.id}: latex không được chứa $`);
      assert.ok(formula.reading.trim().length > 10, `${topic.id}: thiếu phần đọc công thức`);
    }
  }
});

test("mọi đáp án số được tính lại độc lập và khớp trong sai số công bố", () => {
  const drills = MATH_TOPICS.flatMap((topic) => topic.drills);
  const seen = new Set();
  for (const drill of drills) {
    const recompute = RECOMPUTED[drill.id];
    assert.ok(recompute, `Thiếu phép tính lại độc lập cho ${drill.id}`);
    seen.add(drill.id);
    const expected = recompute();
    assert.ok(Number.isFinite(expected), `${drill.id}: phép tính lại không ra số hữu hạn`);
    // Sai số công bố phải đủ rộng để chứa giá trị đúng — nếu không, người học
    // tính đúng vẫn bị chấm sai.
    assert.ok(
      Math.abs(expected - drill.answer) <= drill.tolerance + 1e-9,
      `${drill.id}: nội dung ghi ${drill.answer} nhưng tính lại ra ${expected}`,
    );
  }
  const orphans = Object.keys(RECOMPUTED).filter((id) => !seen.has(id));
  assert.deepEqual(orphans, [], "có phép tính lại không còn bài luyện tương ứng");
});

test("sai số công bố không rộng tới mức chấp nhận cả đáp án sai rõ ràng", () => {
  for (const topic of MATH_TOPICS) {
    for (const drill of topic.drills) {
      const magnitude = Math.abs(drill.answer);
      const ceiling = magnitude === 0 ? 0.01 : magnitude * 0.05;
      assert.ok(
        drill.tolerance <= ceiling + 1e-12,
        `${drill.id}: sai số ${drill.tolerance} quá rộng so với đáp án ${drill.answer}`,
      );
    }
  }
});

test("checkDrillAnswer phân biệt chưa trả lời, đúng và sai", () => {
  const drill = { answer: 0.5, tolerance: 0.001 };
  assert.equal(checkDrillAnswer("", drill), null);
  assert.equal(checkDrillAnswer("   ", drill), null);
  assert.equal(checkDrillAnswer("abc", drill), null);
  assert.equal(checkDrillAnswer("0.5", drill), true);
  // Bàn phím tiếng Việt hay cho dấu phẩy thập phân.
  assert.equal(checkDrillAnswer("0,5", drill), true);
  assert.equal(checkDrillAnswer("0.5009", drill), true);
  assert.equal(checkDrillAnswer("0.52", drill), false);
  assert.equal(checkDrillAnswer("-0.5", drill), false);
  // Đáp án nguyên với sai số 0 vẫn phải qua được dù có sai số dấu phẩy động.
  assert.equal(checkDrillAnswer("10", { answer: 10, tolerance: 0 }), true);
});

test("id chủ đề và id bài luyện không trùng nhau trên toàn lớp Toán", () => {
  const topicIds = MATH_TOPICS.map((topic) => topic.id);
  assert.equal(new Set(topicIds).size, topicIds.length);
  const drillIds = MATH_TOPICS.flatMap((topic) => topic.drills.map((drill) => drill.id));
  assert.equal(new Set(drillIds).size, drillIds.length);
});
