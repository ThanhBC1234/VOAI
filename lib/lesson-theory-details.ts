/**
 * Tải chi tiết lý thuyết và ví dụ thực hành của một bài khi người học mở bài đó.
 *
 * Cache nằm ở mức module để việc chuyển tab hoặc remount component không tải
 * lại. Hai lời gọi đồng thời dùng chung một promise; thất bại không đi vào cache.
 */

import {
  LESSON_THEORY_CHUNK_VERSION,
  LESSON_THEORY_SOURCE_IDS,
  lessonTheoryChunkPath,
} from "../content/lesson-theory/chunk-format";
import type {
  DeepTheorySection,
  LessonDeepTheory,
  TheoryGlossaryItem,
  TheoryTraceStep,
  TheoryWorkedExample,
} from "../content/lesson-theory/types";
import type {
  LessonPractice,
  PracticalIllustration,
  PracticalScalar,
} from "../content/lesson-practice/types";
import { sitePath } from "./site-path";

export interface LessonDetails {
  theory: LessonDeepTheory;
  practice: LessonPractice;
}

const loadedDetails = new Map<string, LessonDetails>();
const inflightDetails = new Map<string, Promise<LessonDetails>>();
const knownSourceIds: ReadonlySet<string> = new Set(LESSON_THEORY_SOURCE_IDS);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringList(value: unknown, minimum = 0): value is string[] {
  return Array.isArray(value) && value.length >= minimum && value.every(isNonEmptyString);
}

function isScalar(value: unknown): value is PracticalScalar {
  return typeof value === "string" || typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value));
}

function isTone(value: unknown): boolean {
  return value === undefined || value === "base" || value === "good" ||
    value === "warn" || value === "accent";
}

function parseSection(value: unknown): DeepTheorySection | null {
  if (!isRecord(value)) return null;
  if (!isNonEmptyString(value.title) || !isStringList(value.paragraphs, 1)) return null;
  if (value.bullets !== undefined && !isStringList(value.bullets)) return null;
  if (value.formulas !== undefined && !isStringList(value.formulas)) return null;
  return value as unknown as DeepTheorySection;
}

function parseTraceStep(value: unknown): TheoryTraceStep | null {
  if (!isRecord(value)) return null;
  if (!isNonEmptyString(value.state) || !isNonEmptyString(value.explanation)) return null;
  return value as unknown as TheoryTraceStep;
}

function parseWorkedExample(value: unknown): TheoryWorkedExample | null {
  if (!isRecord(value)) return null;
  if (
    !isNonEmptyString(value.title) ||
    !isNonEmptyString(value.problem) ||
    !Array.isArray(value.steps) ||
    value.steps.length < 3 ||
    !value.steps.every((step) => parseTraceStep(step) !== null) ||
    !isNonEmptyString(value.conclusion) ||
    !isStringList(value.sanityChecks, 2)
  ) return null;
  return value as unknown as TheoryWorkedExample;
}

function parseGlossaryItem(value: unknown): TheoryGlossaryItem | null {
  if (!isRecord(value)) return null;
  if (!isNonEmptyString(value.term) || !isNonEmptyString(value.definition)) return null;
  return value as unknown as TheoryGlossaryItem;
}

function parseTheory(value: unknown): LessonDeepTheory | null {
  if (!isRecord(value)) return null;
  if (
    !isNonEmptyString(value.lessonId) ||
    typeof value.readingMinutes !== "number" ||
    !Number.isFinite(value.readingMinutes) ||
    value.readingMinutes < 10 ||
    value.readingMinutes > 90 ||
    !isStringList(value.openingQuestions, 2) ||
    !Array.isArray(value.sections) ||
    value.sections.length < 3 ||
    !value.sections.every((section) => parseSection(section) !== null) ||
    !Array.isArray(value.workedExamples) ||
    value.workedExamples.length < 1 ||
    !value.workedExamples.every((example) => parseWorkedExample(example) !== null) ||
    !isStringList(value.implementationChecklist, 4) ||
    !isStringList(value.masteryChecklist, 4) ||
    !Array.isArray(value.glossary) ||
    value.glossary.length < 5 ||
    !value.glossary.every((item) => parseGlossaryItem(item) !== null) ||
    !isStringList(value.sourceIds, 2) ||
    !value.sourceIds.every((sourceId) => knownSourceIds.has(sourceId)) ||
    new Set(value.sourceIds).size !== value.sourceIds.length
  ) return null;
  return value as unknown as LessonDeepTheory;
}

function parseIllustration(value: unknown): PracticalIllustration | null {
  if (!isRecord(value) || !isNonEmptyString(value.title) || !isNonEmptyString(value.caption)) return null;
  if (value.kind === "sequence") {
    if (
      !(value.layout === "pipeline" || value.layout === "cards" || value.layout === "timeline") ||
      !Array.isArray(value.items) || value.items.length < 1 ||
      !value.items.every((item) => isRecord(item) && isNonEmptyString(item.label) &&
        (item.value === undefined || isNonEmptyString(item.value)) &&
        (item.detail === undefined || isNonEmptyString(item.detail)) && isTone(item.tone))
    ) return null;
  } else if (value.kind === "bars") {
    if (
      !Array.isArray(value.items) || value.items.length < 2 ||
      (value.min !== undefined && (typeof value.min !== "number" || !Number.isFinite(value.min))) ||
      (value.max !== undefined && (typeof value.max !== "number" || !Number.isFinite(value.max))) ||
      (typeof value.min === "number" && typeof value.max === "number" && value.max <= value.min) ||
      !value.items.every((item) => isRecord(item) && isNonEmptyString(item.label) &&
        typeof item.value === "number" && Number.isFinite(item.value) &&
        (item.display === undefined || isNonEmptyString(item.display)) && isTone(item.tone))
    ) return null;
  } else if (value.kind === "matrix") {
    const rows = value.rows;
    const columns = value.columns;
    const values = value.values;
    const displayValues = value.displayValues;
    if (
      (value.scale !== undefined && value.scale !== "sequential" && value.scale !== "diverging") ||
      !isStringList(rows, 1) || !isStringList(columns, 1) ||
      !Array.isArray(values) || values.length !== rows.length ||
      !values.every((row) => Array.isArray(row) && row.length === columns.length &&
        row.every((cell) => typeof cell === "number" && Number.isFinite(cell)))
    ) return null;
    if (
      displayValues !== undefined &&
      (!Array.isArray(displayValues) || displayValues.length !== rows.length ||
        !displayValues.every((row) => isStringList(row) && row.length === columns.length))
    ) return null;
  } else if (value.kind === "plot") {
    if (
      !isNonEmptyString(value.xLabel) || !isNonEmptyString(value.yLabel) ||
      (value.connect !== undefined && typeof value.connect !== "boolean") ||
      !Array.isArray(value.series) || value.series.length < 1 ||
      !value.series.every((series) => isRecord(series) && isNonEmptyString(series.label) &&
        isTone(series.tone) && Array.isArray(series.points) && series.points.length >= 2 &&
        series.points.every((point) => isRecord(point) &&
          typeof point.x === "number" && Number.isFinite(point.x) &&
          typeof point.y === "number" && Number.isFinite(point.y) &&
          (point.label === undefined || isNonEmptyString(point.label))))
    ) return null;
  } else if (value.kind === "tokens") {
    if (
      !Array.isArray(value.items) || value.items.length < 1 ||
      !value.items.every((item) => isRecord(item) && isNonEmptyString(item.label) &&
        (item.weight === undefined || (typeof item.weight === "number" && Number.isFinite(item.weight))) &&
        isTone(item.tone))
    ) return null;
  } else return null;
  return value as unknown as PracticalIllustration;
}

function parsePractice(value: unknown): LessonPractice | null {
  if (
    !isRecord(value) || !isNonEmptyString(value.lessonId) || !isRecord(value.scenario) ||
    !isNonEmptyString(value.scenario.title) || !isNonEmptyString(value.scenario.context) ||
    !isNonEmptyString(value.scenario.goal)
  ) return null;
  if (
    !Array.isArray(value.inputs) || value.inputs.length < 1 || value.inputs.length > 3 ||
    !value.inputs.every((item) => isRecord(item) && isNonEmptyString(item.label) &&
      (item.format === "python" || item.format === "json" || item.format === "csv" || item.format === "text") &&
      isNonEmptyString(item.value))
  ) return null;
  if (
    !isRecord(value.python) || !isNonEmptyString(value.python.title) ||
    !isNonEmptyString(value.python.filename) || !/\.py$/i.test(value.python.filename) ||
    !isNonEmptyString(value.python.codeTemplate) || !/\bprint\s*\(/.test(value.python.codeTemplate)
  ) return null;
  if (
    !Array.isArray(value.explanation) || value.explanation.length < 3 || value.explanation.length > 6 ||
    !value.explanation.every((step) => isRecord(step) &&
      isNonEmptyString(step.title) && isNonEmptyString(step.text))
  ) return null;
  if (
    !isRecord(value.experiment) || !isNonEmptyString(value.experiment.question) ||
    !isRecord(value.experiment.parameterLabels) || !isNonEmptyString(value.experiment.defaultVariantId) ||
    !Array.isArray(value.experiment.variants) || value.experiment.variants.length !== 3
  ) return null;

  const variants = value.experiment.variants;
  const parameterKeys = Object.keys(value.experiment.parameterLabels);
  const sortedParameterKeys = [...parameterKeys].sort().join("|");
  if (
    parameterKeys.length < 1 || parameterKeys.length > 2 ||
    !Object.values(value.experiment.parameterLabels).every(isNonEmptyString)
  ) return null;
  if (
    !variants.every((variant) => isRecord(variant) &&
      isNonEmptyString(variant.id) && isNonEmptyString(variant.label) &&
      isRecord(variant.parameters) &&
      Object.keys(variant.parameters).sort().join("|") === sortedParameterKeys &&
      Object.values(variant.parameters).every(isScalar) &&
      isNonEmptyString(variant.expectedOutput) && isNonEmptyString(variant.observation) &&
      parseIllustration(variant.illustration) !== null)
  ) return null;
  const defaultVariantId = value.experiment.defaultVariantId;
  const parsedVariants = variants as Array<Record<string, unknown>>;
  const variantIds = parsedVariants.map((variant) => variant.id as string);
  const tokenKeys = [...value.python.codeTemplate.matchAll(/\{\{([a-z][a-z0-9_]*)\}\}/g)]
    .map((match) => match[1]);
  if (
    new Set(variantIds).size !== variantIds.length ||
    !variantIds.includes(defaultVariantId) ||
    JSON.stringify([...new Set(tokenKeys)].sort()) !==
      JSON.stringify([...parameterKeys].sort()) ||
    new Set(parsedVariants.map((variant) => variant.expectedOutput)).size < 2 ||
    !isNonEmptyString(value.transferQuestion)
  ) return null;
  return value as unknown as LessonPractice;
}

export function parseLessonDetailsChunk(lessonId: string, value: unknown): LessonDetails | null {
  lessonTheoryChunkPath(lessonId);
  if (!isRecord(value)) return null;
  if (value.version !== LESSON_THEORY_CHUNK_VERSION || value.lessonId !== lessonId) return null;
  const theory = parseTheory(value.theory);
  if (!theory || theory.lessonId !== lessonId) return null;
  if (value.practice === undefined) return null;
  const practice = parsePractice(value.practice);
  if (!practice || practice.lessonId !== lessonId) return null;
  return { theory, practice };
}

/** Adapter tương thích cho nơi chỉ cần phần lý thuyết. */
export function parseLessonTheoryChunk(lessonId: string, value: unknown): LessonDeepTheory | null {
  return parseLessonDetailsChunk(lessonId, value)?.theory ?? null;
}

export function cachedLessonTheoryDetails(lessonId: string): LessonDeepTheory | null {
  lessonTheoryChunkPath(lessonId);
  return loadedDetails.get(lessonId)?.theory ?? null;
}

export function cachedLessonPracticeDetails(lessonId: string): LessonPractice | null {
  lessonTheoryChunkPath(lessonId);
  return loadedDetails.get(lessonId)?.practice ?? null;
}

export interface LoadLessonTheoryDetailsOptions {
  /** Chỉ dùng trong test; mặc định là fetch toàn cục. */
  fetchImplementation?: typeof fetch;
  signal?: AbortSignal;
}

export function loadLessonDetails(
  lessonId: string,
  options: LoadLessonTheoryDetailsOptions = {},
): Promise<LessonDetails> {
  const chunkPath = lessonTheoryChunkPath(lessonId);
  const cached = loadedDetails.get(lessonId);
  if (cached) return Promise.resolve(cached);
  const inflight = inflightDetails.get(lessonId);
  if (inflight) return inflight;

  const fetchImplementation = options.fetchImplementation ?? globalThis.fetch;
  const url = sitePath(chunkPath);
  const request = (async () => {
    const response = await fetchImplementation(url, { signal: options.signal });
    if (!response.ok) throw new Error("Không tải được " + url + ": HTTP " + response.status);
    const details = parseLessonDetailsChunk(lessonId, await response.json());
    if (!details) throw new Error("Dữ liệu bài " + lessonId + " không đúng định dạng.");
    loadedDetails.set(lessonId, details);
    return details;
  })();

  const tracked = request.finally(() => inflightDetails.delete(lessonId));
  inflightDetails.set(lessonId, tracked);
  return tracked;
}

export function loadLessonTheoryDetails(
  lessonId: string,
  options: LoadLessonTheoryDetailsOptions = {},
): Promise<LessonDeepTheory> {
  return loadLessonDetails(lessonId, options).then((details) => details.theory);
}

export function loadLessonPracticeDetails(
  lessonId: string,
  options: LoadLessonTheoryDetailsOptions = {},
): Promise<LessonPractice> {
  return loadLessonDetails(lessonId, options).then((details) => details.practice);
}

/** Chỉ dùng trong test. */
export function resetLessonTheoryDetailsCache(): void {
  loadedDetails.clear();
  inflightDetails.clear();
}
