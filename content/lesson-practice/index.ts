import { dataDeepLearningPractice } from "./data-deep-learning";
import { foundationsMachineLearningPractice } from "./foundations-ml";
import { visionLanguageAudioMultimodalPractice } from "./vision-language-audio-multimodal";
import type {
  LessonPractice,
  LessonPracticeMap,
  PracticalIllustration,
  PracticalScalar,
} from "./types";

export const lessonPractice: LessonPracticeMap = {
  ...foundationsMachineLearningPractice,
  ...dataDeepLearningPractice,
  ...visionLanguageAudioMultimodalPractice,
};

function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

function isFiniteScalar(value: PracticalScalar): boolean {
  return typeof value !== "number" || Number.isFinite(value);
}

function validateIllustration(
  lessonId: string,
  variantId: string,
  visual: PracticalIllustration,
): string[] {
  const prefix = `${lessonId}/${variantId}`;
  const errors: string[] = [];
  if (!isNonEmpty(visual.title) || !isNonEmpty(visual.caption)) {
    errors.push(`${prefix}: minh họa thiếu tiêu đề hoặc chú thích.`);
  }

  if (visual.kind === "sequence") {
    if (visual.items.length < 1 || visual.items.some((item) => !isNonEmpty(item.label))) {
      errors.push(`${prefix}: sequence cần ít nhất 1 phần tử có nhãn.`);
    }
  } else if (visual.kind === "bars") {
    if (
      visual.items.length < 2 ||
      visual.items.some((item) => !isNonEmpty(item.label) || !Number.isFinite(item.value))
    ) {
      errors.push(`${prefix}: biểu đồ cột cần ít nhất 2 giá trị hữu hạn có nhãn.`);
    }
    if (visual.min !== undefined && !Number.isFinite(visual.min)) {
      errors.push(`${prefix}: min của biểu đồ không hữu hạn.`);
    }
    if (visual.max !== undefined && !Number.isFinite(visual.max)) {
      errors.push(`${prefix}: max của biểu đồ không hữu hạn.`);
    }
    if (visual.min !== undefined && visual.max !== undefined && visual.max <= visual.min) {
      errors.push(`${prefix}: max của biểu đồ phải lớn hơn min.`);
    }
  } else if (visual.kind === "matrix") {
    if (visual.rows.length < 1 || visual.columns.length < 1) {
      errors.push(`${prefix}: ma trận phải có hàng và cột.`);
    }
    if (
      visual.values.length !== visual.rows.length ||
      visual.values.some(
        (row) => row.length !== visual.columns.length || row.some((cell) => !Number.isFinite(cell)),
      )
    ) {
      errors.push(`${prefix}: kích thước hoặc giá trị ma trận không hợp lệ.`);
    }
    if (
      visual.displayValues !== undefined &&
      (visual.displayValues.length !== visual.rows.length ||
        visual.displayValues.some((row) => row.length !== visual.columns.length))
    ) {
      errors.push(`${prefix}: displayValues không khớp kích thước ma trận.`);
    }
  } else if (visual.kind === "plot") {
    if (
      visual.series.length < 1 ||
      visual.series.some(
        (series) =>
          !isNonEmpty(series.label) ||
          series.points.length < 2 ||
          series.points.some((point) => !Number.isFinite(point.x) || !Number.isFinite(point.y)),
      )
    ) {
      errors.push(`${prefix}: biểu đồ điểm cần chuỗi có ít nhất 2 tọa độ hữu hạn.`);
    }
  } else if (
    visual.items.length < 1 ||
    visual.items.some(
      (item) =>
        !isNonEmpty(item.label) ||
        (item.weight !== undefined && !Number.isFinite(item.weight)),
    )
  ) {
    errors.push(`${prefix}: minh họa token cần ít nhất 1 token hợp lệ.`);
  }

  return errors;
}

export function validateLessonPracticeEntry(key: string, practice: LessonPractice): string[] {
  const errors: string[] = [];
  if (practice.lessonId !== key) errors.push(`${key}: lessonId không khớp key.`);
  if (
    !isNonEmpty(practice.scenario.title) ||
    !isNonEmpty(practice.scenario.context) ||
    !isNonEmpty(practice.scenario.goal)
  ) {
    errors.push(`${key}: tình huống thực tế chưa đầy đủ.`);
  }
  if (
    practice.inputs.length < 1 ||
    practice.inputs.length > 3 ||
    practice.inputs.some(
      (input) => !isNonEmpty(input.label) || !isNonEmpty(input.value),
    )
  ) {
    errors.push(`${key}: cần 1–3 input mẫu có nhãn và giá trị.`);
  }
  if (
    !isNonEmpty(practice.python.title) ||
    !/\.py$/i.test(practice.python.filename) ||
    !isNonEmpty(practice.python.codeTemplate)
  ) {
    errors.push(`${key}: khối Python thiếu tiêu đề, tên file .py hoặc code.`);
  }
  if (
    practice.explanation.length < 3 ||
    practice.explanation.length > 6 ||
    practice.explanation.some((step) => !isNonEmpty(step.title) || !isNonEmpty(step.text))
  ) {
    errors.push(`${key}: cần 3–6 bước giải thích đầy đủ.`);
  }
  if (!isNonEmpty(practice.experiment.question) || !isNonEmpty(practice.transferQuestion)) {
    errors.push(`${key}: thiếu câu hỏi thí nghiệm hoặc câu hỏi chuyển giao.`);
  }
  if (practice.experiment.variants.length !== 3) {
    errors.push(`${key}: cần đúng 3 biến thể để so sánh.`);
  }

  const variantIds = new Set(practice.experiment.variants.map((variant) => variant.id));
  if (variantIds.size !== practice.experiment.variants.length) errors.push(`${key}: variant id bị trùng.`);
  if (!variantIds.has(practice.experiment.defaultVariantId)) {
    errors.push(`${key}: defaultVariantId không tồn tại.`);
  }

  const tokenKeys = [...practice.python.codeTemplate.matchAll(/\{\{([a-z][a-z0-9_]*)\}\}/g)].map(
    (match) => match[1],
  );
  const expectedKeys = Object.keys(practice.experiment.parameterLabels).sort();
  if (
    expectedKeys.length < 1 ||
    expectedKeys.length > 2 ||
    Object.values(practice.experiment.parameterLabels).some((label) => !isNonEmpty(label))
  ) {
    errors.push(`${key}: cần 1–2 tham số thí nghiệm có nhãn.`);
  }
  if (JSON.stringify([...new Set(tokenKeys)].sort()) !== JSON.stringify(expectedKeys)) {
    errors.push(`${key}: token code không khớp parameterLabels.`);
  }
  if (!/\bprint\s*\(/.test(practice.python.codeTemplate)) {
    errors.push(`${key}: code mẫu phải in output.`);
  }

  for (const variant of practice.experiment.variants) {
    if (
      !isNonEmpty(variant.id) ||
      !isNonEmpty(variant.label) ||
      !isNonEmpty(variant.expectedOutput) ||
      !isNonEmpty(variant.observation)
    ) {
      errors.push(`${key}/${variant.id}: biến thể thiếu id, nhãn, output hoặc nhận xét.`);
    }
    if (JSON.stringify(Object.keys(variant.parameters).sort()) !== JSON.stringify(expectedKeys)) {
      errors.push(`${key}/${variant.id}: parameters không khớp contract.`);
    }
    if (Object.values(variant.parameters).some((value) => !isFiniteScalar(value))) {
      errors.push(`${key}/${variant.id}: parameter số không hữu hạn.`);
    }
    errors.push(...validateIllustration(key, variant.id, variant.illustration));
  }
  if (new Set(practice.experiment.variants.map((variant) => variant.expectedOutput)).size < 2) {
    errors.push(`${key}: thay tham số phải tạo ít nhất 2 output khác nhau.`);
  }
  return errors;
}

export function assertLessonPracticeEntries(): void {
  const errors = Object.entries(lessonPractice).flatMap(([key, practice]) =>
    validateLessonPracticeEntry(key, practice),
  );
  if (errors.length > 0) {
    throw new Error(`Nội dung thực hành không hợp lệ:\n${errors.join("\n")}`);
  }
}

export function assertLessonPracticeCoverage(lessonIds: readonly string[]): void {
  const expected = new Set(lessonIds);
  const actual = Object.keys(lessonPractice);
  const errors: string[] = [];
  if (expected.size !== lessonIds.length) errors.push("Catalog bài học chứa ID trùng.");
  for (const lessonId of lessonIds) {
    if (!Object.hasOwn(lessonPractice, lessonId)) errors.push(`Thiếu bài thực hành: ${lessonId}.`);
  }
  for (const lessonId of actual) {
    if (!expected.has(lessonId)) errors.push(`Thừa bài thực hành ngoài catalog: ${lessonId}.`);
  }
  for (const [key, practice] of Object.entries(lessonPractice)) {
    errors.push(...validateLessonPracticeEntry(key, practice));
  }
  if (errors.length > 0) {
    throw new Error(`Độ phủ nội dung thực hành không hợp lệ:\n${errors.join("\n")}`);
  }
}

export function getLessonPractice(lessonId: string): LessonPractice | undefined {
  return lessonPractice[lessonId];
}

export type {
  LessonPractice,
  LessonPracticeMap,
  PracticalIllustration,
  PracticalScalar,
  PracticalVariant,
} from "./types";
