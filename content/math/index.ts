/**
 * Lắp ráp lớp Toán và cổng kiểm tra dữ liệu chạy lúc import.
 *
 * Cổng này tồn tại vì nội dung toán hỏng theo kiểu **im lặng**: một dấu `$` lẻ
 * làm KaTeX nuốt cả đoạn văn, một `tolerance` âm khiến mọi đáp án đều sai, một
 * id trùng khiến hai bài luyện ghi đè tiến độ của nhau. Không thứ nào trong số
 * đó làm bản dựng gãy nếu không kiểm — chúng chỉ lặng lẽ đi vào trang web.
 *
 * Đáp án **số** còn được `tests/math-content.test.mjs` tính lại độc lập; cổng ở
 * đây chỉ lo phần cấu trúc.
 */

import { LINEAR_ALGEBRA_MODULE } from "./module-linear-algebra";
import { CALCULUS_MODULE } from "./module-calculus";
import { PROBABILITY_MODULE } from "./module-probability";
import { OPTIMIZATION_MODULE } from "./module-optimization";
import { MEASUREMENT_MODULE } from "./module-measurement";
import { MATH_LEVELS, type MathLevel, type MathModule, type MathTopic } from "./types";

export * from "./types";

/**
 * Thứ tự học có chủ đích: đại số tuyến tính là ngôn ngữ của dữ liệu, giải tích
 * cho cơ chế học, xác suất cho hàm mất mát, tối ưu cho vòng lặp huấn luyện, và
 * đo lường để kết luận. Đảo thứ tự sẽ khiến module sau tham chiếu tới thứ chưa
 * dạy.
 */
export const MATH_MODULES: readonly MathModule[] = [
  LINEAR_ALGEBRA_MODULE,
  CALCULUS_MODULE,
  PROBABILITY_MODULE,
  OPTIMIZATION_MODULE,
  MEASUREMENT_MODULE,
];

export interface MathValidationSummary {
  modules: number;
  topics: number;
  drills: number;
  formulas: number;
  byLevel: Readonly<Record<MathLevel, number>>;
}

function assertNonBlank(value: string, label: string): void {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${label} không được rỗng.`);
  }
}

/**
 * Đếm dấu `$` chưa bị escape. Số lẻ nghĩa là có một công thức không đóng, và
 * `MathText` sẽ render nguyên phần còn lại của chuỗi thành một khối công thức.
 */
function unbalancedMathDelimiters(value: string): boolean {
  let count = 0;
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] !== "$") continue;
    if (index > 0 && value[index - 1] === "\\") continue;
    count += 1;
  }
  return count % 2 !== 0;
}

function assertMathSafe(value: string, label: string): void {
  assertNonBlank(value, label);
  if (unbalancedMathDelimiters(value)) {
    throw new Error(`${label} có số dấu "$" lẻ nên công thức không đóng.`);
  }
}

function validateTopic(
  topic: MathTopic,
  moduleId: string,
  topicIds: Set<string>,
  drillIds: Set<string>,
): void {
  const label = `math ${moduleId}/${topic.id || "<missing-id>"}`;
  assertNonBlank(topic.id, `${label}.id`);
  if (topicIds.has(topic.id)) throw new Error(`Trùng id chủ đề toán: ${topic.id}`);
  topicIds.add(topic.id);

  assertMathSafe(topic.title, `${label}.title`);
  assertMathSafe(topic.examUse, `${label}.examUse`);
  if (!MATH_LEVELS.includes(topic.level)) {
    throw new Error(`${label} có mức độ không hợp lệ: ${topic.level}`);
  }
  if (topic.keyIdeas.length < 2) throw new Error(`${label} cần ít nhất 2 ý cốt lõi.`);
  topic.keyIdeas.forEach((idea, index) => assertMathSafe(idea, `${label}.keyIdeas[${index}]`));

  if (topic.formulas.length < 1) throw new Error(`${label} cần ít nhất 1 công thức.`);
  topic.formulas.forEach((formula, index) => {
    assertNonBlank(formula.latex, `${label}.formulas[${index}].latex`);
    // `latex` là nội dung *bên trong* `$…$` nên bản thân nó không được chứa `$`.
    if (formula.latex.includes("$")) {
      throw new Error(`${label}.formulas[${index}].latex không được chứa dấu "$".`);
    }
    assertNonBlank(formula.reading, `${label}.formulas[${index}].reading`);
  });

  assertMathSafe(topic.worked.prompt, `${label}.worked.prompt`);
  if (topic.worked.steps.length < 2) {
    throw new Error(`${label}.worked cần ít nhất 2 bước; một bước thì không phải lời giải.`);
  }
  topic.worked.steps.forEach((step, index) =>
    assertMathSafe(step, `${label}.worked.steps[${index}]`),
  );
  assertMathSafe(topic.worked.answer, `${label}.worked.answer`);

  if (topic.pitfalls.length < 1) throw new Error(`${label} cần ít nhất 1 bẫy.`);
  topic.pitfalls.forEach((pitfall, index) => assertMathSafe(pitfall, `${label}.pitfalls[${index}]`));

  if (topic.drills.length < 1) throw new Error(`${label} cần ít nhất 1 bài luyện.`);
  for (const drill of topic.drills) {
    const drillLabel = `${label}/${drill.id || "<missing-id>"}`;
    assertNonBlank(drill.id, `${drillLabel}.id`);
    if (drillIds.has(drill.id)) throw new Error(`Trùng id bài luyện toán: ${drill.id}`);
    drillIds.add(drill.id);
    assertMathSafe(drill.prompt, `${drillLabel}.prompt`);
    if (!Number.isFinite(drill.answer)) {
      throw new Error(`${drillLabel}.answer phải là số hữu hạn.`);
    }
    if (!Number.isFinite(drill.tolerance) || drill.tolerance < 0) {
      throw new Error(`${drillLabel}.tolerance phải là số không âm.`);
    }
    if (drill.solution.length < 1) throw new Error(`${drillLabel} phải có lời giải.`);
    drill.solution.forEach((line, index) =>
      assertMathSafe(line, `${drillLabel}.solution[${index}]`),
    );
  }

  if (topic.appearsIn.length < 1) {
    throw new Error(`${label} phải nêu ít nhất một chỗ kiến thức này được dùng lại.`);
  }
  topic.appearsIn.forEach((item, index) => assertNonBlank(item, `${label}.appearsIn[${index}]`));
}

function validateMathModules(): MathValidationSummary {
  const moduleIds = new Set<string>();
  const topicIds = new Set<string>();
  const drillIds = new Set<string>();
  const byLevel: Record<MathLevel, number> = { core: 0, applied: 0, advanced: 0 };
  let topics = 0;
  let drills = 0;
  let formulas = 0;

  for (const group of MATH_MODULES) {
    assertNonBlank(group.id, "math module id");
    if (moduleIds.has(group.id)) throw new Error(`Trùng id module toán: ${group.id}`);
    moduleIds.add(group.id);
    assertNonBlank(group.title, `math ${group.id}.title`);
    assertNonBlank(group.purpose, `math ${group.id}.purpose`);
    assertNonBlank(group.prerequisite, `math ${group.id}.prerequisite`);
    if (group.topics.length < 1) throw new Error(`math ${group.id} không có chủ đề nào.`);

    for (const topic of group.topics) {
      validateTopic(topic, group.id, topicIds, drillIds);
      topics += 1;
      drills += topic.drills.length;
      formulas += topic.formulas.length;
      byLevel[topic.level] += 1;
    }
  }

  if (byLevel.core < 1 || byLevel.applied < 1) {
    throw new Error("Lớp Toán phải có cả chủ đề nền lẫn chủ đề vận dụng.");
  }

  return { modules: MATH_MODULES.length, topics, drills, formulas, byLevel };
}

// Cổng chạy lúc import: dữ liệu sai không đi vào bản dựng.
export const MATH_VALIDATION: MathValidationSummary = validateMathModules();

export const MATH_TOPICS: readonly MathTopic[] = MATH_MODULES.flatMap((group) => group.topics);

export function mathModuleOf(topicId: string): MathModule | null {
  return MATH_MODULES.find((group) => group.topics.some((topic) => topic.id === topicId)) ?? null;
}

// Hàm chấm nằm ở module riêng, không mang dữ liệu, để component client import
// được mà không kéo theo toàn bộ nội dung 5 module vào bundle JS.
export { checkDrillAnswer, type DrillAnswerSpec } from "./check-answer";
