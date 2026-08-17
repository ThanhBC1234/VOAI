import assert from "node:assert/strict";
import test, { after, before } from "node:test";

import { cleanupLoadedModules, loadTypeScriptModule } from "./helpers/load-module.mjs";

let bank;

before(async () => {
  bank = await loadTypeScriptModule("content/theory/index.ts");
});

after(async () => {
  await cleanupLoadedModules();
});

const questionById = (id) => bank.THEORY_BANK.find((question) => question.id === id);

test("the 350-question bank still passes its import-time gate", () => {
  const summary = bank.THEORY_BANK_VALIDATION;
  assert.equal(summary.total, 350);
  assert.equal(summary.syllabusItemsCovered, summary.syllabusItemsTotal);
  assert.equal(bank.REFERENCE_MOCK_PAPER.questions.length, bank.MOCK_PAPER_QUESTION_COUNT);
});

test("every numeric question has a finite answer and a usable tolerance", () => {
  const numeric = bank.THEORY_BANK.filter((question) => question.format === "numeric");
  assert.ok(numeric.length >= 40, `chỉ có ${numeric.length} câu numeric`);
  for (const question of numeric) {
    assert.ok(Number.isFinite(question.answer), `${question.id} có đáp án không hữu hạn`);
    assert.ok(Number.isFinite(question.tolerance) && question.tolerance >= 0, `${question.id} sai tolerance`);
    assert.ok(question.explanation.trim().length > 0, `${question.id} thiếu giải thích`);
  }
});

/**
 * CONTENT-P2-01: các đáp án số được tính lại độc lập ngay trong test, thay vì
 * tin vào con số đã ghi trong ngân hàng.
 */
test("numeric answers match an independent recomputation", () => {
  const cases = [
    ["math-linear-algebra-08", 1 * 4 + 2 * 5 + 3 * 6], // tích vô hướng
    ["math-linear-algebra-09", Math.sqrt(3 ** 2 + 4 ** 2)], // chuẩn L2
    ["math-linear-algebra-10", 1 * 4 - 2 * 3], // định thức 2×2
    ["math-calculus-07", 3 * 2 ** 2], // đạo hàm x³ tại 2
    ["math-calculus-08", 2 * 2 * 3], // ∂(x²y)/∂x tại (2,3)
    ["math-probability-07", 0.5 * 0.5], // hai đồng xu cùng ngửa
    ["math-probability-08", (0.99 * 0.01) / (0.99 * 0.01 + 0.05 * 0.99)], // Bayes
    ["math-probability-09", 2], // độ lệch chuẩn tổng thể
    ["metrics-03", (2 * 0.8 * (8 / 12)) / (0.8 + 8 / 12)], // F1
    ["object-detection-03", 1 / 7], // IoU hai hộp
    ["segmentation-03", 60 / 140], // IoU vùng
    ["convolution-03", Math.floor((32 - 5) / 1) + 1], // shape đầu ra conv
    ["convolution-04", 16 * 3 * 3 * 3 + 16], // tham số Conv2d
    ["pooling-03", Math.floor((32 - 2) / 2) + 1], // shape sau maxpool
    ["embeddings-03", 10000 * 128], // bảng embedding
    ["mlp-03", 20 * 10 + 20 + 5 * 20 + 5], // tham số MLP
    ["pytorch-03", 4 * 10 + 4], // tham số nn.Linear
    ["l1-l2-03", 2 * (Math.abs(3) + Math.abs(-4))], // phạt L1
    ["trees-03", 1 - (0.75 ** 2 + 0.25 ** 2)], // Gini
    ["gradient-descent-03", 3 - 0.1 * 2 * 3], // một bước GD
    ["losses-03", -Math.log(0.5)], // cross-entropy
    ["language-modeling-03", Math.exp(2.303)], // perplexity
    ["audio-models-03", (2 + 1 + 1) / 10], // WER
    ["text-classification-03", Math.log10(1000 / 10)], // IDF
    ["cross-validation-03", 100 - 100 / 5], // số mẫu train mỗi fold
    ["linear-regression-03", (1 + 0 + 1) / 3], // MSE
  ];

  for (const [id, expected] of cases) {
    const question = questionById(id);
    assert.ok(question, `không tìm thấy câu ${id}`);
    assert.equal(question.format, "numeric", `${id} không phải câu numeric`);
    assert.ok(
      Math.abs(question.answer - expected) <= Math.max(question.tolerance, 1e-9),
      `${id}: ngân hàng ghi ${question.answer} nhưng tính lại được ${expected}`,
    );
  }
});

/**
 * Các phát biểu đã bị audit chỉ ra là sai. Test khóa lại để tránh sửa một nơi
 * nhưng còn mâu thuẫn ở nơi khác.
 */
test("corrected conceptual statements do not regress", () => {
  const text = (id) => {
    const question = questionById(id);
    assert.ok(question, `không tìm thấy câu ${id}`);
    return [
      question.stem,
      question.explanation,
      question.trap ?? "",
      ...(question.choices ?? []),
      ...(question.choiceNotes ?? []),
      ...(question.calculation ?? []),
      ...(question.statements ?? []).flatMap((statement) => [statement.text, statement.note]),
    ].join(" ");
  };

  // 1. k-NN có trọng số 1/d đảo kết quả, A thắng.
  assert.match(text("knn-03"), /1\/0\.1 = 10/);
  assert.doesNotMatch(text("knn-03"), /A cũng vẫn thua/);

  // 2. Chênh lệch O(n²) vs O(n log n) là ~3.8 bậc, không phải 6 bậc.
  assert.doesNotMatch(text("computing-python-09"), /sáu bậc/);
  assert.doesNotMatch(text("computing-python-09"), /hàng triệu lần/);

  // 3. Adam chưa hiệu chỉnh cho bước LỚN hơn, không phải nhỏ hơn.
  assert.match(text("adam-03"), /3\.16/);
  assert.doesNotMatch(text("adam-03"), /quá nhỏ một cách giả tạo/);

  // 4. det = 0 không có nghĩa least-squares vô nghiệm.
  assert.match(text("math-linear-algebra-10"), /vẫn \*có\* nghiệm|giả nghịch đảo/);

  // 5. Residual không bảo đảm gradient khỏi triệt tiêu.
  assert.match(text("vision-encoders-02"), /không bảo đảm|I \+ J_F|`J_F` xấp xỉ/);

  // 6 + 10. Equivariant, không phải invariant.
  assert.match(text("mlp-04"), /tương đương tịnh tiến/);
  assert.doesNotMatch(text("mlp-04"), /và bất biến tịnh tiến\./);
  assert.match(text("transformers-02"), /permutation-equivariant/);

  // 7. view phụ thuộc size/stride, không phải "mọi tensor non-contiguous đều hỏng".
  assert.match(text("tensor-02"), /size\/stride/);

  // 9. Cosine đã tự chia chuẩn nên chuẩn hoá không bắt buộc.
  assert.match(text("math-linear-algebra-09"), /không\*\* bắt buộc|không bắt buộc/);

  // 11. Quan hệ Dice–IoU.
  assert.match(text("segmentation-03"), /2·IoU\/\(1 \+ IoU\)/);
  assert.doesNotMatch(text("segmentation-03"), /luôn cao hơn IoU/);
});
