import {
  describeWriteStatus,
  readJson,
  readRaw,
  writeJson,
  type StorageWriteStatus,
} from "./local-storage";

/** Kho canonical dùng chung cho Lộ trình, Assessment và Code Arena. */
export const LEARNING_PROGRESS_STORAGE_KEY = "voai-completed-sessions";

/** Sự kiện cùng tab; `storage` chỉ được trình duyệt phát sang tab khác. */
export const LEARNING_PROGRESS_EVENT = "voai-learning-progress-change";

export const MAX_PROGRESS_IDS = 10_000;
export const MAX_PROGRESS_ID_LENGTH = 256;

/**
 * Đủ cho chính snapshot canonical lớn nhất khi JSON pretty-print: một code
 * unit có thể thành escape `\\ud800` dài 6 byte, cộng quote/comma/indent.
 * Vì vậy mọi backup do `exportProgress` tạo từ kho hợp lệ đều nhập lại được.
 */
export const MAX_PROGRESS_IMPORT_BYTES =
  MAX_PROGRESS_IDS * (MAX_PROGRESS_ID_LENGTH * 6 + 8) + 4_096;

export type LearningProgressChangeDetail = {
  completed: string[];
};

export type LearningProgressWriteResult = {
  completed: string[];
  status: StorageWriteStatus;
  error?: "invalid-id" | "too-many-ids" | "corrupt-storage";
};

export type ProgressImportResult =
  | { ok: true; completed: string[] }
  | { ok: false; error: string };

function uniqueIds(ids: readonly string[]): string[] {
  return [...new Set(ids)];
}

function containsControlCharacter(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code <= 0x1f || (code >= 0x7f && code <= 0x9f)) return true;
  }
  return false;
}

/**
 * ID tiến độ chỉ là dữ liệu để so khớp, không bao giờ được ghép thành đường dẫn.
 * Vì vậy ta cho phép ID cũ có dấu cách, Unicode hoặc dấu `/`, nhưng chặn chuỗi
 * rỗng, quá dài và ký tự điều khiển vô hình. Cùng một cửa kiểm định được dùng
 * cho storage, ghi mới và file import để mọi dữ liệu xuất ra đều nhập lại được.
 */
export function isLearningProgressId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= MAX_PROGRESS_ID_LENGTH &&
    value.trim().length > 0 &&
    !containsControlCharacter(value)
  );
}

function normalizeProgressIds(
  ids: readonly unknown[],
):
  | { ok: true; completed: string[] }
  | { ok: false; error: "invalid-id" | "too-many-ids" } {
  if (!ids.every(isLearningProgressId)) return { ok: false, error: "invalid-id" };
  const completed = uniqueIds(ids);
  if (completed.length > MAX_PROGRESS_IDS) return { ok: false, error: "too-many-ids" };
  return { ok: true, completed };
}

function acceptStoredIds(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const normalized = normalizeProgressIds(value);
  if (!normalized.ok) return null;
  // Dữ liệu cũ có thể chứa id đã rời curriculum. Không lọc/xoá chúng ở đây.
  return normalized.completed;
}

function inspectStoredProgress(): { valid: true; completed: string[] } | { valid: false } {
  const raw = readRaw(LEARNING_PROGRESS_STORAGE_KEY);
  if (raw === null) return { valid: true, completed: [] };
  try {
    const completed = acceptStoredIds(JSON.parse(raw));
    return completed === null ? { valid: false } : { valid: true, completed };
  } catch {
    return { valid: false };
  }
}

function announceProgress(completed: string[]): void {
  try {
    if (typeof window === "undefined" || typeof window.dispatchEvent !== "function") return;
    window.dispatchEvent(
      new CustomEvent<LearningProgressChangeDetail>(LEARNING_PROGRESS_EVENT, {
        detail: { completed: [...completed] },
      }),
    );
  } catch {
    // Đồng bộ UI là best-effort; việc phát sự kiện không được làm hỏng lần ghi.
  }
}

/** Đọc tiến độ không bao giờ ném; JSON hỏng hoặc schema lạ trả về danh sách rỗng. */
export function readLearningProgress(): string[] {
  return readJson(LEARNING_PROGRESS_STORAGE_KEY, acceptStoredIds, [] as string[]);
}

/** Ghi ảnh chụp tiến độ và báo cho component khác trong cùng tab. */
export function writeLearningProgress(ids: readonly string[]): LearningProgressWriteResult {
  const normalized = normalizeProgressIds(ids);
  if (!normalized.ok) {
    return { completed: readLearningProgress(), status: "failed", error: normalized.error };
  }
  const completed = normalized.completed;
  if (!inspectStoredProgress().valid) {
    return { completed, status: "failed", error: "corrupt-storage" };
  }
  const status = writeJson(LEARNING_PROGRESS_STORAGE_KEY, completed);
  if (status === "ok") announceProgress(completed);
  return { completed, status };
}

/** Hợp nhất id mới với kho hiện tại; tuyệt đối không xoá id đang có. */
export function mergeLearningProgress(ids: readonly string[]): LearningProgressWriteResult {
  const stored = inspectStoredProgress();
  if (!stored.valid) {
    return { completed: [], status: "failed", error: "corrupt-storage" };
  }
  const normalized = normalizeProgressIds([...stored.completed, ...ids]);
  if (!normalized.ok) {
    return { completed: stored.completed, status: "failed", error: normalized.error };
  }
  const status = writeJson(LEARNING_PROGRESS_STORAGE_KEY, normalized.completed);
  if (status === "ok") announceProgress(normalized.completed);
  return { completed: normalized.completed, status };
}

/** Đánh dấu một phiên hoàn thành từ Assessment hoặc Code Arena. */
export function markSessionCompleted(sessionId: string): LearningProgressWriteResult {
  return mergeLearningProgress([sessionId]);
}

/**
 * Đảo đúng một ID trên snapshot canonical mới nhất. Roadmap không được dùng
 * Set trong React state vì tab khác có thể đã thêm ID sau lần render đó.
 */
export function toggleLearningProgress(sessionId: string): LearningProgressWriteResult {
  if (!isLearningProgressId(sessionId)) {
    return { completed: readLearningProgress(), status: "failed", error: "invalid-id" };
  }
  const stored = inspectStoredProgress();
  if (!stored.valid) {
    return { completed: [], status: "failed", error: "corrupt-storage" };
  }
  const next = stored.completed.includes(sessionId)
    ? stored.completed.filter((id) => id !== sessionId)
    : [...stored.completed, sessionId];
  const normalized = normalizeProgressIds(next);
  if (!normalized.ok) {
    return { completed: stored.completed, status: "failed", error: normalized.error };
  }
  const status = writeJson(LEARNING_PROGRESS_STORAGE_KEY, normalized.completed);
  if (status === "ok") announceProgress(normalized.completed);
  return { completed: normalized.completed, status };
}

/** Thông báo chi tiết hơn `StorageWriteStatus` cho các lỗi schema/giới hạn. */
export function describeLearningProgressWriteResult(
  result: LearningProgressWriteResult,
): string | null {
  if (result.status === "ok") return null;
  switch (result.error) {
    case "invalid-id":
      return "Tiến độ chứa mã phiên rỗng, quá dài hoặc có ký tự điều khiển nên chưa được lưu.";
    case "too-many-ids":
      return `Kho tiến độ đã chạm giới hạn ${MAX_PROGRESS_IDS.toLocaleString("vi-VN")} mã; thay đổi mới chưa được lưu.`;
    case "corrupt-storage":
      return "Kho tiến độ hiện có bị hỏng hoặc sai định dạng nên chưa được ghi đè. Hãy xuất bản sao dữ liệu trước khi thử lại.";
    default:
      return describeWriteStatus(result.status);
  }
}

/**
 * Kiểm định tệp backup Roadmap v1 trước khi hợp nhất.
 *
 * ID lạ nhưng đúng cú pháp vẫn được nhận để không làm mất lịch sử từ curriculum
 * cũ; Roadmap sẽ tách chúng thành phần archived và không tính vào phần trăm.
 */
export function parseProgressImport(text: string, declaredBytes?: number): ProgressImportResult {
  const actualBytes = new TextEncoder().encode(text).byteLength;
  if (
    actualBytes > MAX_PROGRESS_IMPORT_BYTES ||
    (declaredBytes !== undefined &&
      (!Number.isFinite(declaredBytes) || declaredBytes < 0 || declaredBytes > MAX_PROGRESS_IMPORT_BYTES))
  ) {
    return { ok: false, error: "Tệp tiến độ vượt quá giới hạn an toàn của backup." };
  }

  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return { ok: false, error: "Tệp không phải JSON hợp lệ." };
  }

  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { ok: false, error: "Tệp tiến độ không có cấu trúc hợp lệ." };
  }

  const record = value as Record<string, unknown>;
  if (record.format !== "voai-lab-progress" || record.version !== 1) {
    return { ok: false, error: "Chỉ hỗ trợ tệp voai-lab-progress phiên bản 1." };
  }
  if (!Array.isArray(record.completed) || record.completed.length > MAX_PROGRESS_IDS) {
    return { ok: false, error: "Danh sách phiên hoàn thành không hợp lệ." };
  }

  const completed: string[] = [];
  for (const id of record.completed) {
    if (!isLearningProgressId(id)) {
      return { ok: false, error: "Tệp chứa mã phiên học không hợp lệ." };
    }
    completed.push(id);
  }
  return { ok: true, completed: uniqueIds(completed) };
}
