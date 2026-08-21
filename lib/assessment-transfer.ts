/**
 * Phong bì sao lưu/khôi phục của trang Assessment.
 *
 * Lớp này chỉ kiểm định hình dạng ngoài, giới hạn tài nguyên và độ an toàn của
 * JSON. Attempt/draft đã biết vẫn phải đi qua validator gắn với catalog/rubric
 * trong `AssessmentExplorer`; dữ liệu chưa hiểu được chỉ được giữ ở dạng opaque
 * để tái xuất về sau, không bao giờ được đưa vào UI hay thực thi.
 */

export const ASSESSMENT_TRANSFER_FORMAT = "voai-assessment-attempts";
export const ASSESSMENT_TRANSFER_VERSION = 2;
/** Mỗi kho local (attempt hoặc draft) được giữ dưới 5 MiB. */
export const MAX_ASSESSMENT_LOCAL_STORE_BYTES = 5 * 1024 * 1024;
/** Backup chứa cả hai kho cộng metadata, nên phải lớn hơn tổng hai trần local. */
export const MAX_ASSESSMENT_IMPORT_BYTES =
  MAX_ASSESSMENT_LOCAL_STORE_BYTES * 2 + 64 * 1024;
export const MAX_ASSESSMENT_IMPORT_ATTEMPTS = 10_000;
export const MAX_ASSESSMENT_IMPORT_DRAFTS = 1_000;
export const MAX_ASSESSMENT_LOCAL_NODES = 120_000;
export const MAX_ASSESSMENT_TRANSFER_NODES = MAX_ASSESSMENT_LOCAL_NODES * 2;
export const MAX_OPAQUE_STRING_LENGTH = 1_000_000;

const MAX_OPAQUE_DEPTH = 24;
const MAX_JSON_KEY_LENGTH = 256;
const MAX_DRAFT_KEY_LENGTH = 128;
const DANGEROUS_KEYS = new Set(["__proto__", "constructor", "prototype"]);
const DRAFT_KEY_PATTERN = /^[a-z0-9][a-z0-9._:-]*$/i;

export interface AssessmentTransferEnvelope {
  version: 1 | 2;
  attempts: readonly unknown[];
  /** `null` phân biệt backup v1 không có draft với backup v2 có kho draft rỗng. */
  drafts: Readonly<Record<string, unknown>> | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

/** Khoá draft cũng là sessionId; chặn magic keys trước khi ghép object. */
export function isSafeAssessmentDraftKey(key: string): boolean {
  return (
    key.length > 0 &&
    key.length <= MAX_DRAFT_KEY_LENGTH &&
    DRAFT_KEY_PATTERN.test(key) &&
    !DANGEROUS_KEYS.has(key)
  );
}

type JsonBudget = { nodes: number; maxNodes: number };

function inspectJsonValue(value: unknown, depth: number, budget: JsonBudget): boolean {
  budget.nodes += 1;
  if (budget.nodes > budget.maxNodes || depth > MAX_OPAQUE_DEPTH) return false;
  if (value === null || typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "string") return value.length <= MAX_OPAQUE_STRING_LENGTH;
  if (Array.isArray(value)) {
    for (const item of value) {
      if (!inspectJsonValue(item, depth + 1, budget)) return false;
    }
    return true;
  }
  if (!isRecord(value)) return false;
  for (const [key, item] of Object.entries(value)) {
    if (
      key.length > MAX_JSON_KEY_LENGTH ||
      DANGEROUS_KEYS.has(key) ||
      !inspectJsonValue(item, depth + 1, budget)
    ) {
      return false;
    }
  }
  return true;
}

/**
 * Cho phép giữ một giá trị JSON chưa hiểu được, nhưng chỉ khi nó hữu hạn và
 * không chứa magic keys có thể gây prototype pollution lúc được ghép về sau.
 */
export function isBoundedAssessmentOpaqueValue(value: unknown): boolean {
  return inspectJsonValue(value, 0, {
    nodes: 0,
    maxNodes: MAX_ASSESSMENT_LOCAL_NODES,
  });
}

/** Dấu vân tay chính xác dùng để không nhân đôi dữ liệu opaque khi nhập lại. */
export function assessmentOpaqueFingerprint(value: unknown): string | null {
  if (!isBoundedAssessmentOpaqueValue(value)) return null;
  try {
    const serialized = JSON.stringify(value);
    return typeof serialized === "string" ? serialized : null;
  } catch {
    return null;
  }
}

function inspectDraftRecord(
  value: unknown,
  budget: JsonBudget,
): value is Record<string, unknown> {
  if (!isRecord(value)) return false;
  const entries = Object.entries(value);
  if (entries.length > MAX_ASSESSMENT_IMPORT_DRAFTS) return false;
  for (const [key, draft] of entries) {
    if (!isSafeAssessmentDraftKey(key) || !inspectJsonValue(draft, 0, budget)) return false;
  }
  return true;
}

/** Kiểm định kho draft local v1 trước khi component phân loại theo catalog. */
export function parseAssessmentDraftStore(
  value: unknown,
): Readonly<Record<string, unknown>> | null {
  if (!isRecord(value) || value.version !== 1) return null;
  const budget = { nodes: 0, maxNodes: MAX_ASSESSMENT_LOCAL_NODES };
  return inspectDraftRecord(value.drafts, budget) ? value.drafts : null;
}

/**
 * Chỉ nhận đúng một draft thực sự rỗng; object hỏng/thiếu trường không được coi
 * là rỗng vì như vậy file nhập có thể vô tình ghi đè dữ liệu chưa hiểu được.
 */
export function isEmptyAssessmentDraft(value: unknown): boolean {
  if (!isRecord(value)) return false;
  const answers = value.retrievalAnswers;
  const scores = value.scores;
  if (
    !Array.isArray(answers) ||
    !answers.every((answer) => typeof answer === "string" && answer.trim() === "") ||
    typeof value.codeEvidence !== "string" ||
    value.codeEvidence.trim() !== "" ||
    typeof value.evidenceLink !== "string" ||
    value.evidenceLink.trim() !== "" ||
    typeof value.explanation !== "string" ||
    value.explanation.trim() !== "" ||
    value.soloConfirmed !== false ||
    value.noAutomaticFailConfirmed !== false ||
    !isRecord(scores)
  ) {
    return false;
  }
  const categories = ["retrieval", "coding", "validation", "explanation"] as const;
  return (
    Object.keys(scores).length === categories.length &&
    categories.every((category) => scores[category] === 0)
  );
}

/**
 * Quy tắc hợp nhất draft đã kiểm định: backup chỉ thay draft rỗng do giao diện
 * tự tạo; draft local có nội dung luôn thắng.
 */
export function shouldAcceptImportedAssessmentDraft(
  localDraft: unknown | undefined,
  importedDraft: unknown,
): boolean {
  if (localDraft === undefined) return true;
  return isEmptyAssessmentDraft(localDraft) && !isEmptyAssessmentDraft(importedDraft);
}

/**
 * Đọc JSON do người dùng chọn mà không bao giờ ném. Ngoài số lượng collection,
 * parser tự kiểm tra kích thước UTF-8, độ sâu/số node và magic keys; vì vậy
 * component có thể giữ nguyên dữ liệu opaque hợp lệ mà không phải tin nó.
 */
export function parseAssessmentTransferJson(raw: string): AssessmentTransferEnvelope | null {
  if (typeof raw !== "string" || raw.length > MAX_ASSESSMENT_IMPORT_BYTES) return null;
  try {
    if (new TextEncoder().encode(raw).byteLength > MAX_ASSESSMENT_IMPORT_BYTES) return null;
  } catch {
    return null;
  }

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isRecord(value) || value.format !== ASSESSMENT_TRANSFER_FORMAT) return null;
  if (!Array.isArray(value.attempts)) return null;
  if (value.attempts.length > MAX_ASSESSMENT_IMPORT_ATTEMPTS) return null;

  const budget = { nodes: 0, maxNodes: MAX_ASSESSMENT_TRANSFER_NODES };
  for (const attempt of value.attempts) {
    if (!inspectJsonValue(attempt, 0, budget)) return null;
  }

  if (value.version === 1) {
    return { version: 1, attempts: value.attempts, drafts: null };
  }
  if (value.version !== ASSESSMENT_TRANSFER_VERSION) return null;
  if (!inspectDraftRecord(value.drafts, budget)) return null;
  return { version: 2, attempts: value.attempts, drafts: value.drafts };
}

export type AssessmentLocalStoreInspection<T> =
  | { status: "missing" }
  | { status: "invalid" }
  | { status: "valid"; value: T };

function parseBoundedLocalJson(raw: string): unknown | null {
  if (raw.length > MAX_ASSESSMENT_LOCAL_STORE_BYTES) return null;
  try {
    if (new TextEncoder().encode(raw).byteLength > MAX_ASSESSMENT_LOCAL_STORE_BYTES) return null;
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

/**
 * Phân biệt kho attempt chưa tồn tại với kho tồn tại nhưng không thể hydrate.
 * Caller phải khóa mọi lần ghi trong trường hợp `invalid` để không đè dữ liệu.
 */
export function inspectAssessmentAttemptsStoreRaw(
  raw: string | null,
): AssessmentLocalStoreInspection<readonly unknown[]> {
  if (raw === null) return { status: "missing" };
  const parsed = parseBoundedLocalJson(raw);
  if (!Array.isArray(parsed) || parsed.length > MAX_ASSESSMENT_IMPORT_ATTEMPTS) {
    return { status: "invalid" };
  }
  const budget = { nodes: 0, maxNodes: MAX_ASSESSMENT_LOCAL_NODES };
  for (const candidate of parsed) {
    if (!inspectJsonValue(candidate, 0, budget)) return { status: "invalid" };
  }
  return { status: "valid", value: parsed };
}

/**
 * Phân biệt kho draft chưa tồn tại với kho tồn tại nhưng sai schema/quá giới
 * hạn. `invalid` không bao giờ được diễn giải thành kho rỗng.
 */
export function inspectAssessmentDraftStoreRaw(
  raw: string | null,
): AssessmentLocalStoreInspection<Readonly<Record<string, unknown>>> {
  if (raw === null) return { status: "missing" };
  const parsed = parseBoundedLocalJson(raw);
  if (parsed === null) return { status: "invalid" };
  const drafts = parseAssessmentDraftStore(parsed);
  return drafts === null ? { status: "invalid" } : { status: "valid", value: drafts };
}

export type AssessmentDraftResolution<T> =
  | { kind: "known"; value: T }
  | { kind: "unknown" }
  | { kind: "invalid" };

export type AssessmentDraftPartition<T> =
  | { status: "invalid-known" }
  | {
      status: "valid";
      known: Record<string, T>;
      opaque: Record<string, unknown>;
    };

/**
 * Phân loại draft sau khi lớp ngoài đã hợp lệ. Chỉ một draft thuộc session hiện
 * hành sai schema cũng làm cả kho bị khóa; biến nó thành draft rỗng sẽ khiến lần
 * autosave kế tiếp xóa bằng chứng cũ.
 */
export function partitionAssessmentDraftStore<T>(
  drafts: Readonly<Record<string, unknown>>,
  resolve: (sessionId: string, value: unknown) => AssessmentDraftResolution<T>,
): AssessmentDraftPartition<T> {
  const known = Object.create(null) as Record<string, T>;
  const opaque = Object.create(null) as Record<string, unknown>;
  for (const [sessionId, candidate] of Object.entries(drafts)) {
    const resolution = resolve(sessionId, candidate);
    if (resolution.kind === "invalid") return { status: "invalid-known" };
    if (resolution.kind === "known") {
      known[sessionId] = resolution.value;
    } else {
      // Caller thường nhận dữ liệu từ inspectAssessmentDraftStoreRaw, nhưng
      // vẫn phòng thủ nếu helper được dùng độc lập ở nơi khác.
      if (
        !isSafeAssessmentDraftKey(sessionId) ||
        !isBoundedAssessmentOpaqueValue(candidate)
      ) {
        return { status: "invalid-known" };
      }
      opaque[sessionId] = candidate;
    }
  }
  return { status: "valid", known, opaque };
}

export interface AssessmentInteractionLocks {
  formLocked: boolean;
  exportLocked: boolean;
}

/**
 * Một nguồn sự thật cho khóa UI: import khóa toàn bộ form; export chỉ mở khi cả
 * hai kho local đã hydrate và được phép ghi. Nếu không, file xuất rỗng sẽ tạo
 * cảm giác backup thành công trong khi dữ liệu gốc vẫn mắc lại ở localStorage.
 */
export function assessmentInteractionLocks(
  isImporting: boolean,
  attemptStoreWritable: boolean,
  draftStoreWritable: boolean,
): AssessmentInteractionLocks {
  return {
    formLocked: isImporting,
    exportLocked: isImporting || !attemptStoreWritable || !draftStoreWritable,
  };
}
function serializedBytesAtMost(value: unknown, maximum: number): boolean {
  try {
    const serialized = JSON.stringify(value);
    return (
      typeof serialized === "string" &&
      new TextEncoder().encode(serialized).byteLength <= maximum
    );
  } catch {
    return false;
  }
}

/** Cắt tại đúng trần dùng chung; `maxLength` trên DOM chỉ là lớp UX đầu tiên. */
export function capAssessmentString(value: string): string {
  return value.length <= MAX_OPAQUE_STRING_LENGTH
    ? value
    : value.slice(0, MAX_OPAQUE_STRING_LENGTH);
}

/** Contract bắt buộc trước mọi lần ghi kho attempts local. */
export function isAssessmentAttemptsStoreValueSafe(value: unknown): value is readonly unknown[] {
  if (!Array.isArray(value) || value.length > MAX_ASSESSMENT_IMPORT_ATTEMPTS) return false;
  const budget = { nodes: 0, maxNodes: MAX_ASSESSMENT_LOCAL_NODES };
  for (const candidate of value) {
    if (!inspectJsonValue(candidate, 0, budget)) return false;
  }
  return serializedBytesAtMost(value, MAX_ASSESSMENT_LOCAL_STORE_BYTES);
}

/** Contract bắt buộc trước mọi lần schedule/ghi kho drafts local. */
export function isAssessmentDraftStoreValueSafe(value: unknown): boolean {
  return (
    parseAssessmentDraftStore(value) !== null &&
    serializedBytesAtMost(value, MAX_ASSESSMENT_LOCAL_STORE_BYTES)
  );
}

/**
 * Serialize compact rồi tự parse lại bằng chính importer. Giá trị khác `null`
 * là bằng chứng file sắp tải xuống có thể nhập lại theo đúng contract hiện hành.
 */
export function serializeAssessmentTransferPayload(value: unknown): string | null {
  let serialized: string;
  try {
    serialized = JSON.stringify(value);
  } catch {
    return null;
  }
  return parseAssessmentTransferJson(serialized) === null ? null : serialized;
}

export interface AssessmentAttemptStoreMerge {
  value: readonly unknown[];
  /** Chỉ những mục thực sự chưa có trong snapshot live. */
  added: readonly unknown[];
}

/**
 * Hợp nhất additions vào snapshot attempt vừa đọc từ localStorage. Dedupe key
 * do caller cấp vì chỉ component có catalog để phân biệt attempt hiện hành với
 * dữ liệu opaque. Snapshot live luôn thắng khi cùng key.
 */
export function mergeAssessmentAttemptStoreValues(
  live: readonly unknown[],
  additions: readonly unknown[],
  identify: (value: unknown) => string | null,
): AssessmentAttemptStoreMerge | null {
  if (!isAssessmentAttemptsStoreValueSafe(live)) return null;
  const merged: unknown[] = [];
  const added: unknown[] = [];
  const seen = new Set<string>();

  for (const candidate of live) {
    const key = identify(candidate);
    if (key === null) return null;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(candidate);
  }
  for (const candidate of additions) {
    const key = identify(candidate);
    if (key === null) return null;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(candidate);
    added.push(candidate);
  }

  return isAssessmentAttemptsStoreValueSafe(merged) ? { value: merged, added } : null;
}

export type AssessmentDraftStoreDelta =
  | { sessionId: string; kind: "replace"; value: unknown }
  | { sessionId: string; kind: "remove" };

/**
 * Áp đúng một delta lên snapshot draft live. Đây là primitive chống mất dữ
 * liệu cross-tab: tab đang gõ session B không mang snapshot cũ đi ghi đè và
 * xóa session A vừa được tab khác lưu.
 */
export function mergeAssessmentDraftStoreDelta(
  liveDrafts: Readonly<Record<string, unknown>>,
  delta: AssessmentDraftStoreDelta,
): { version: 1; drafts: Record<string, unknown> } | null {
  if (!isSafeAssessmentDraftKey(delta.sessionId)) return null;
  const livePayload = { version: 1 as const, drafts: liveDrafts };
  if (!isAssessmentDraftStoreValueSafe(livePayload)) return null;

  const drafts = Object.create(null) as Record<string, unknown>;
  for (const [sessionId, candidate] of Object.entries(liveDrafts)) {
    drafts[sessionId] = candidate;
  }
  if (delta.kind === "remove") {
    delete drafts[delta.sessionId];
  } else {
    drafts[delta.sessionId] = delta.value;
  }

  const payload = { version: 1 as const, drafts };
  return isAssessmentDraftStoreValueSafe(payload) ? payload : null;
}
