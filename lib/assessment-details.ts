/**
 * Tải phần chi tiết assessment theo chunk tuần, có cache và chống tải trùng.
 *
 * PERF-P3-01: payload đầu của `/assessments` chỉ mang catalog. Chi tiết của một
 * tuần được lấy từ `public/data/assessments/<chunk>.json` đúng **một lần** cho
 * mỗi phiên trình duyệt, kể cả khi component bị unmount rồi mount lại — cache
 * nằm ở mức module chứ không ở mức component.
 *
 * Ba tính chất được giữ chặt vì chúng là chỗ dễ hỏng nhất của lazy-load:
 *
 * - **Không tải trùng.** Hai lời gọi song song cho cùng một chunk chia sẻ một
 *   promise; lời gọi sau khi đã có cache không chạm tới mạng.
 * - **Thất bại không được cache.** Mất mạng một lần không được khoá vĩnh viễn
 *   một tuần; lần thử lại phải fetch thật.
 * - **Dữ liệu lạ bị từ chối.** Một tệp cũ còn trong HTTP cache, hoặc một
 *   response HTML 404 của Pages, không được đi tiếp vào UI dưới dạng chi tiết
 *   rỗng.
 */

// Chỉ import từ module *định dạng*: nó không mang dữ liệu nên bundle client
// không kéo theo 290 phiên qua `daily-assessments.ts` → `curriculum.ts`.
import {
  ASSESSMENT_CHUNK_VERSION,
  assessmentChunkPath,
  type AssessmentDetail,
} from "../content/assessment-chunk-format";
import { sitePath } from "./site-path";

export type AssessmentDetailMap = Readonly<Record<string, AssessmentDetail>>;

const loadedChunks = new Map<string, AssessmentDetailMap>();
const inflightChunks = new Map<string, Promise<AssessmentDetailMap>>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringList(value: unknown, minimum: number): value is string[] {
  return Array.isArray(value) && value.length >= minimum && value.every(isNonEmptyString);
}

function parseDetail(value: unknown): AssessmentDetail | null {
  if (!isRecord(value)) return null;
  if (
    !isNonEmptyString(value.sessionId) ||
    !isStringList(value.retrievalQuestions, 2) ||
    !isNonEmptyString(value.codingTask) ||
    !isStringList(value.visibleCriteria, 1) ||
    !isStringList(value.hiddenTestCategories, 1) ||
    !isNonEmptyString(value.explainPrompt) ||
    !isNonEmptyString(value.aiBoundary) ||
    !isRecord(value.passRule) ||
    !isRecord(value.mastery)
  ) {
    return null;
  }
  const passRule = value.passRule;
  if (
    typeof passRule.minimumScore !== "number" ||
    !Number.isFinite(passRule.minimumScore) ||
    !isRecord(passRule.minimumSectionScores) ||
    !isStringList(passRule.requiredSections, 1) ||
    !isStringList(passRule.automaticFailConditions, 1) ||
    !isNonEmptyString(passRule.retryRule)
  ) {
    return null;
  }
  const mastery = value.mastery;
  if (
    typeof mastery.minimumScore !== "number" ||
    !Number.isFinite(mastery.minimumScore) ||
    !isStringList(mastery.evidenceRequired, 1) ||
    !isNonEmptyString(mastery.delayedTransferCheck)
  ) {
    return null;
  }
  return value as unknown as AssessmentDetail;
}

/** Kiểm định phong bì chunk; trả `null` nếu bất kỳ điều gì không khớp. */
export function parseAssessmentChunk(
  chunk: string,
  value: unknown,
): AssessmentDetailMap | null {
  if (!isRecord(value)) return null;
  if (value.version !== ASSESSMENT_CHUNK_VERSION) return null;
  if (value.chunk !== chunk) return null;
  if (!Array.isArray(value.details) || value.details.length === 0) return null;
  const map: Record<string, AssessmentDetail> = {};
  for (const candidate of value.details) {
    const detail = parseDetail(candidate);
    if (!detail) return null;
    if (map[detail.sessionId]) return null;
    map[detail.sessionId] = detail;
  }
  return map;
}

export function cachedAssessmentChunk(chunk: string): AssessmentDetailMap | null {
  return loadedChunks.get(chunk) ?? null;
}

export interface LoadAssessmentChunkOptions {
  /** Chỉ dùng trong test; mặc định là `fetch` toàn cục. */
  fetchImplementation?: typeof fetch;
  signal?: AbortSignal;
}

export function loadAssessmentChunk(
  chunk: string,
  options: LoadAssessmentChunkOptions = {},
): Promise<AssessmentDetailMap> {
  const cached = loadedChunks.get(chunk);
  if (cached) return Promise.resolve(cached);
  const inflight = inflightChunks.get(chunk);
  if (inflight) return inflight;

  const fetchImplementation = options.fetchImplementation ?? globalThis.fetch;
  const url = sitePath(assessmentChunkPath(chunk));
  const request = (async () => {
    const response = await fetchImplementation(url, { signal: options.signal });
    if (!response.ok) {
      throw new Error(`Không tải được ${url}: HTTP ${response.status}`);
    }
    const parsed = parseAssessmentChunk(chunk, await response.json());
    if (!parsed) {
      throw new Error(`Dữ liệu chunk ${chunk} không đúng định dạng đang dùng.`);
    }
    loadedChunks.set(chunk, parsed);
    return parsed;
  })();

  // Xoá bản ghi in-flight ở cả hai nhánh: thất bại **không** được cache, nếu
  // không một lần mất mạng sẽ khoá vĩnh viễn cả tuần đó.
  const tracked = request.finally(() => {
    inflightChunks.delete(chunk);
  });
  inflightChunks.set(chunk, tracked);
  return tracked;
}

/** Chỉ dùng trong test. */
export function resetAssessmentChunkCache(): void {
  loadedChunks.clear();
  inflightChunks.clear();
}
