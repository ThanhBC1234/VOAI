/**
 * Tải phần lý thuyết mở rộng của một bài khi người học mở bài đó.
 *
 * Cache nằm ở mức module để việc chuyển tab hoặc remount component không tải
 * lại. Hai lời gọi đồng thời dùng chung một promise; mọi thất bại đều bị loại
 * khỏi inflight và không bao giờ đi vào cache thành công.
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
import { sitePath } from "./site-path";

const loadedTheory = new Map<string, LessonDeepTheory>();
const inflightTheory = new Map<string, Promise<LessonDeepTheory>>();
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
  ) {
    return null;
  }
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
  ) {
    return null;
  }
  return value as unknown as LessonDeepTheory;
}

/** Kiểm định cả phong bì lẫn toàn bộ cấu trúc lồng nhau của `LessonDeepTheory`. */
export function parseLessonTheoryChunk(
  lessonId: string,
  value: unknown,
): LessonDeepTheory | null {
  // Đồng thời kiểm ID trước khi so phong bì; input traversal không được coi như
  // một cache key hợp lệ ngay cả khi caller chỉ dùng parser.
  lessonTheoryChunkPath(lessonId);
  if (!isRecord(value)) return null;
  if (value.version !== LESSON_THEORY_CHUNK_VERSION) return null;
  if (value.lessonId !== lessonId) return null;
  const theory = parseTheory(value.theory);
  if (!theory || theory.lessonId !== lessonId) return null;
  return theory;
}

export function cachedLessonTheoryDetails(lessonId: string): LessonDeepTheory | null {
  lessonTheoryChunkPath(lessonId);
  return loadedTheory.get(lessonId) ?? null;
}

export interface LoadLessonTheoryDetailsOptions {
  /** Chỉ dùng trong test; mặc định là `fetch` toàn cục. */
  fetchImplementation?: typeof fetch;
  signal?: AbortSignal;
}

export function loadLessonTheoryDetails(
  lessonId: string,
  options: LoadLessonTheoryDetailsOptions = {},
): Promise<LessonDeepTheory> {
  const chunkPath = lessonTheoryChunkPath(lessonId);
  const cached = loadedTheory.get(lessonId);
  if (cached) return Promise.resolve(cached);
  const inflight = inflightTheory.get(lessonId);
  if (inflight) return inflight;

  const fetchImplementation = options.fetchImplementation ?? globalThis.fetch;
  const url = sitePath(chunkPath);
  const request = (async () => {
    const response = await fetchImplementation(url, { signal: options.signal });
    if (!response.ok) {
      throw new Error(`Không tải được ${url}: HTTP ${response.status}`);
    }
    const theory = parseLessonTheoryChunk(lessonId, await response.json());
    if (!theory) {
      throw new Error(`Dữ liệu lý thuyết của bài ${lessonId} không đúng định dạng.`);
    }
    loadedTheory.set(lessonId, theory);
    return theory;
  })();

  const tracked = request.finally(() => {
    inflightTheory.delete(lessonId);
  });
  inflightTheory.set(lessonId, tracked);
  return tracked;
}

/** Chỉ dùng trong test. */
export function resetLessonTheoryDetailsCache(): void {
  loadedTheory.clear();
  inflightTheory.clear();
}
