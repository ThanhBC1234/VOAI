import { foundationsMlTheory } from "./foundations-ml";
import { dataScienceTheory } from "./data-science";
import { deepLearningTheory } from "./deep-learning";
import { languageAudioMultimodalTheory } from "./language-audio-multimodal";
import { theorySources } from "./sources";
import type { LessonDeepTheory, LessonTheoryMap } from "./types";
import { visionTheory } from "./vision";

const theoryMaps: LessonTheoryMap[] = [
  foundationsMlTheory,
  dataScienceTheory,
  deepLearningTheory,
  visionTheory,
  languageAudioMultimodalTheory,
];

export const lessonDeepTheory: LessonTheoryMap = Object.assign({}, ...theoryMaps);

function wordCount(value: string): number {
  return value.trim().split(/\s+/u).filter(Boolean).length;
}

function hasOnlyNonEmptyText(values: readonly string[]): boolean {
  return values.every((value) => value.trim().length > 0);
}

function findDuplicateValues(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

function validateEntry(key: string, theory: LessonDeepTheory): string[] {
  const errors: string[] = [];
  const sectionWordCount = theory.sections.reduce(
    (total, section) =>
      total +
      section.paragraphs.reduce((sum, paragraph) => sum + wordCount(paragraph), 0) +
      (section.bullets ?? []).reduce((sum, bullet) => sum + wordCount(bullet), 0),
    0,
  );
  const framingWordCount =
    theory.openingQuestions.reduce((total, question) => total + wordCount(question), 0) +
    theory.sections.reduce(
      (total, section) =>
        total + wordCount(section.title) + (section.formulas ?? []).reduce((sum, formula) => sum + wordCount(formula), 0),
      0,
    );
  const exampleWordCount = theory.workedExamples.reduce(
    (total, example) =>
      total +
      wordCount(example.title) +
      wordCount(example.problem) +
      wordCount(example.conclusion) +
      example.steps.reduce(
        (sum, step) => sum + wordCount(step.state) + wordCount(step.explanation),
        0,
      ) +
      example.sanityChecks.reduce((sum, check) => sum + wordCount(check), 0),
    0,
  );
  const checklistWordCount = [...theory.implementationChecklist, ...theory.masteryChecklist].reduce(
    (total, item) => total + wordCount(item),
    0,
  );
  const glossaryWordCount = theory.glossary.reduce(
    (total, item) => total + wordCount(item.term) + wordCount(item.definition),
    0,
  );
  const contentWordCount =
    framingWordCount + sectionWordCount + exampleWordCount + checklistWordCount + glossaryWordCount;

  if (theory.lessonId !== key) errors.push(`${key}: lessonId không khớp khóa map.`);
  if (
    !Number.isFinite(theory.readingMinutes) ||
    theory.readingMinutes < 10 ||
    theory.readingMinutes > 90
  ) {
    errors.push(`${key}: readingMinutes phải nằm trong 10–90 phút.`);
  }
  if (
    theory.openingQuestions.length < 2 ||
    !hasOnlyNonEmptyText(theory.openingQuestions)
  ) {
    errors.push(`${key}: cần ít nhất 2 câu hỏi dẫn đường không rỗng.`);
  }
  if (theory.sections.length < 3) errors.push(`${key}: cần ít nhất 3 mục lý thuyết.`);
  if (sectionWordCount < 180) errors.push(`${key}: phần lý thuyết cốt lõi dưới 180 từ.`);
  if (contentWordCount < 380) errors.push(`${key}: tổng nội dung học tập dưới 380 từ.`);
  if (
    theory.sections.some(
      (section) =>
        !section.title.trim() ||
        section.paragraphs.length === 0 ||
        !hasOnlyNonEmptyText(section.paragraphs) ||
        (section.bullets !== undefined && !hasOnlyNonEmptyText(section.bullets)) ||
        (section.formulas !== undefined && !hasOnlyNonEmptyText(section.formulas)),
    )
  ) {
    errors.push(`${key}: mục lý thuyết thiếu tiêu đề hoặc đoạn giải thích.`);
  }
  if (theory.workedExamples.length === 0) errors.push(`${key}: thiếu ví dụ giải từng bước.`);
  for (const [index, example] of theory.workedExamples.entries()) {
    if (example.steps.length < 3) errors.push(`${key}: ví dụ ${index + 1} cần ít nhất 3 bước.`);
    if (!example.title.trim() || !example.problem.trim() || !example.conclusion.trim()) {
      errors.push(`${key}: ví dụ ${index + 1} thiếu tiêu đề, đề bài hoặc kết luận.`);
    }
    if (
      example.steps.some(
        (step) => !step.state.trim() || !step.explanation.trim(),
      )
    ) {
      errors.push(`${key}: ví dụ ${index + 1} có bước giải rỗng.`);
    }
    if (example.sanityChecks.length < 2) {
      errors.push(`${key}: ví dụ ${index + 1} cần ít nhất 2 phép kiểm tra hợp lý.`);
    } else if (!hasOnlyNonEmptyText(example.sanityChecks)) {
      errors.push(`${key}: ví dụ ${index + 1} có phép kiểm tra hợp lý rỗng.`);
    }
  }
  if (
    theory.implementationChecklist.length < 4 ||
    !hasOnlyNonEmptyText(theory.implementationChecklist)
  ) {
    errors.push(`${key}: checklist triển khai cần ít nhất 4 mục không rỗng.`);
  }
  if (
    theory.masteryChecklist.length < 4 ||
    !hasOnlyNonEmptyText(theory.masteryChecklist)
  ) {
    errors.push(`${key}: checklist làm chủ cần ít nhất 4 mục không rỗng.`);
  }
  if (
    theory.glossary.length < 5 ||
    theory.glossary.some((item) => !item.term.trim() || !item.definition.trim())
  ) {
    errors.push(`${key}: từ điển cần ít nhất 5 thuật ngữ có định nghĩa không rỗng.`);
  }
  if (theory.sourceIds.length < 2 || !hasOnlyNonEmptyText(theory.sourceIds)) {
    errors.push(`${key}: cần ít nhất 2 nguồn đọc không rỗng.`);
  }
  const duplicateSourceIds = findDuplicateValues(theory.sourceIds);
  if (duplicateSourceIds.length > 0) {
    errors.push(`${key}: sourceId bị lặp: ${duplicateSourceIds.join(", ")}.`);
  }
  for (const sourceId of theory.sourceIds) {
    if (!theorySources[sourceId]) errors.push(`${key}: sourceId không tồn tại: ${sourceId}.`);
  }
  return errors;
}

export function assertLessonTheoryCoverage(expectedLessonIds: string[]): void {
  const errors: string[] = [];
  const expected = new Set(expectedLessonIds);
  const duplicateExpectedIds = findDuplicateValues(expectedLessonIds);
  if (duplicateExpectedIds.length > 0) {
    errors.push(`Catalog bài học có ID bị lặp: ${duplicateExpectedIds.join(", ")}.`);
  }
  const seen = new Set<string>();
  for (const [sourceKey, source] of Object.entries(theorySources)) {
    if (source.id !== sourceKey) errors.push(`${sourceKey}: id của nguồn không khớp khóa catalog.`);
    if (!source.url.startsWith("https://")) {
      errors.push(`${sourceKey}: URL nguồn phải dùng HTTPS.`);
    }
    if (source.localPath && !/^\/books\/[a-z0-9][a-z0-9._-]*\.pdf$/iu.test(source.localPath)) {
      errors.push(`${sourceKey}: localPath phải có dạng /books/<tệp>.pdf.`);
    }
  }



  for (const map of theoryMaps) {
    for (const key of Object.keys(map)) {
      if (seen.has(key)) errors.push(`${key}: xuất hiện trong nhiều theory map.`);
      seen.add(key);
    }
  }

  for (const id of expected) {
    if (!lessonDeepTheory[id]) errors.push(`${id}: thiếu nội dung lý thuyết mở rộng.`);
  }
  for (const id of Object.keys(lessonDeepTheory)) {
    if (!expected.has(id)) errors.push(`${id}: không khớp bài nào trong catalog hiện tại.`);
  }
  for (const [key, theory] of Object.entries(lessonDeepTheory)) {
    errors.push(...validateEntry(key, theory));
  }

  if (errors.length > 0) {
    throw new Error(`Lesson theory catalog không hợp lệ:\n- ${errors.join("\n- ")}`);
  }
}

export function getLessonDeepTheory(lessonId: string): LessonDeepTheory {
  const theory = lessonDeepTheory[lessonId];
  if (!theory) throw new Error(`Thiếu lý thuyết mở rộng cho bài ${lessonId}.`);
  return theory;
}

export { theorySources } from "./sources";
export type {
  DeepTheorySection,
  LessonDeepTheory,
  LessonTheoryMap,
  TheoryGlossaryItem,
  TheorySource,
  TheorySourceId,
  TheoryTraceStep,
  TheoryWorkedExample,
} from "./types";
