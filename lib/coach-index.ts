/**
 * Tải chỉ mục trợ giảng và dựng cấu trúc tìm kiếm — đúng một lần mỗi phiên.
 *
 * Chỉ mục nặng ~130 KB sau gzip, nên nó **không** được nằm trong payload đầu
 * của `/assessments`: người học chỉ mở trợ giảng khi đã bí, mà đa số phiên học
 * thì không mở lần nào. Vì vậy nó chỉ được tải khi bảng trợ giảng mở ra lần
 * đầu, và giữ ở mức module chứ không ở mức component — đóng bảng rồi mở lại
 * không tải lần hai. Cùng nguyên tắc với `lib/assessment-details.ts` (PERF-P3-01).
 */

import { buildCoachIndex, type CoachRecord, type SearchableCoachIndex } from "./coach-search";
import { sitePath } from "./site-path";

/** Phải khớp `COACH_INDEX_VERSION` trong `scripts/emit-coach-index.mjs`. */
export const COACH_INDEX_VERSION = 1;

export const COACH_INDEX_PATH = "/data/coach/index.json";

const RECORD_KINDS = new Set(["theory", "lesson", "failure", "complexity", "math", "pitfall"]);

let loaded: SearchableCoachIndex | null = null;
let inflight: Promise<SearchableCoachIndex> | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function parseRecord(value: unknown): CoachRecord | null {
  if (!isRecord(value)) return null;
  const { kind, title, body, note, topic, href } = value;
  if (typeof kind !== "string" || !RECORD_KINDS.has(kind)) return null;
  if (typeof title !== "string" || title.trim().length === 0) return null;
  if (typeof body !== "string" || body.trim().length === 0) return null;
  if (typeof note !== "string" || typeof topic !== "string" || typeof href !== "string") return null;
  return { kind: kind as CoachRecord["kind"], title, body, note, topic, href };
}

/**
 * Kiểm định payload trước khi dùng.
 *
 * Một tệp cũ còn trong HTTP cache, hoặc một trang 404 dạng HTML của GitHub
 * Pages, không được đi tiếp vào giao diện dưới dạng "chỉ mục rỗng" — vì như
 * thế trợ giảng sẽ im lặng trả lời "không có trong giáo trình" cho **mọi** câu
 * hỏi, và người học sẽ tưởng giáo trình thiếu nội dung.
 */
export function parseCoachIndexPayload(payload: unknown): CoachRecord[] | null {
  if (!isRecord(payload)) return null;
  if (payload.version !== COACH_INDEX_VERSION) return null;
  if (!Array.isArray(payload.records) || payload.records.length === 0) return null;
  const records: CoachRecord[] = [];
  for (const candidate of payload.records) {
    const record = parseRecord(candidate);
    if (!record) return null;
    records.push(record);
  }
  return records;
}

export interface LoadCoachIndexOptions {
  /** Chỉ dùng trong test; mặc định là `fetch` toàn cục. */
  fetchImplementation?: typeof fetch;
  signal?: AbortSignal;
}

export function loadCoachIndex(options: LoadCoachIndexOptions = {}): Promise<SearchableCoachIndex> {
  if (loaded) return Promise.resolve(loaded);
  if (inflight) return inflight;

  const fetchImplementation = options.fetchImplementation ?? globalThis.fetch;
  const url = sitePath(COACH_INDEX_PATH);
  const request = (async () => {
    const response = await fetchImplementation(url, { signal: options.signal });
    if (!response.ok) throw new Error(`Không tải được ${url}: HTTP ${response.status}`);
    const records = parseCoachIndexPayload(await response.json());
    if (!records) throw new Error("Chỉ mục trợ giảng không đúng định dạng đang dùng.");
    const index = buildCoachIndex(records);
    loaded = index;
    return index;
  })();

  // Thất bại **không** được cache: một lần mất mạng không được khoá vĩnh viễn
  // trợ giảng cho tới khi tải lại trang.
  const tracked = request.finally(() => {
    inflight = null;
  });
  inflight = tracked;
  return tracked;
}

/** Chỉ dùng trong test. */
export function resetCoachIndexCache(): void {
  loaded = null;
  inflight = null;
}
