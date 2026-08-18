/**
 * Lớp truy cập `localStorage` dùng chung cho toàn bộ website.
 *
 * Vì sao cần (STORAGE-P2-01): các component trước đây tự gọi `JSON.parse` và
 * `setItem` rải rác. Cả hai đều có thể ném — dữ liệu hỏng, storage bị chặn
 * (chế độ riêng tư, cookie bị khoá), hoặc hết quota — và một lần ném chưa bắt
 * là đủ làm trắng cả trang.
 *
 * Nguyên tắc:
 * - Đọc không bao giờ ném: hỏng thì trả về giá trị mặc định.
 * - Ghi không bao giờ ném: thất bại thì báo về qua kết quả trả lời, state trong
 *   phiên vẫn giữ nguyên.
 * - Dữ liệu chưa hiểu được thì **giữ nguyên trong storage**, không ghi đè. Mất
 *   dữ liệu người học là lỗi nặng hơn nhiều so với việc bỏ qua một bản ghi lạ.
 */

export type StorageWriteStatus = "ok" | "unavailable" | "quota-exceeded" | "failed";

function getStorage(): Storage | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    // Truy cập localStorage có thể ném khi cookie bị chặn hoàn toàn.
    return null;
  }
}

/** Đọc chuỗi thô; trả `null` khi không đọc được vì bất kỳ lý do gì. */
export function readRaw(key: string): string | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

/** Ghi chuỗi thô; không bao giờ ném, dùng cho giá trị không phải JSON. */
export function writeRaw(key: string, value: string): StorageWriteStatus {
  const storage = getStorage();
  if (!storage) return "unavailable";
  try {
    storage.setItem(key, value);
    return "ok";
  } catch (error) {
    const name = error instanceof Error ? error.name : "";
    if (name === "QuotaExceededError" || name === "NS_ERROR_DOM_QUOTA_REACHED") {
      return "quota-exceeded";
    }
    return "failed";
  }
}

/**
 * Đọc và kiểm định JSON. `validate` quyết định dữ liệu có dùng được không;
 * mọi trường hợp còn lại trả `fallback` mà **không** đụng tới storage.
 */
export function readJson<T>(key: string, validate: (value: unknown) => T | null, fallback: T): T {
  const raw = readRaw(key);
  if (raw === null) return fallback;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return fallback;
  }
  try {
    const validated = validate(parsed);
    return validated === null ? fallback : validated;
  } catch {
    return fallback;
  }
}

/** Ghi JSON; không bao giờ ném, trả trạng thái để UI báo cho người dùng. */
export function writeJson(key: string, value: unknown): StorageWriteStatus {
  const storage = getStorage();
  if (!storage) return "unavailable";
  let payload: string;
  try {
    payload = JSON.stringify(value);
  } catch {
    return "failed";
  }
  try {
    storage.setItem(key, payload);
    return "ok";
  } catch (error) {
    const name = error instanceof Error ? error.name : "";
    if (name === "QuotaExceededError" || name === "NS_ERROR_DOM_QUOTA_REACHED") {
      return "quota-exceeded";
    }
    return "failed";
  }
}

export function removeKey(key: string): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(key);
  } catch {
    /* không có gì để làm thêm */
  }
}

export function describeWriteStatus(status: StorageWriteStatus): string | null {
  switch (status) {
    case "ok":
      return null;
    case "unavailable":
      return "Trình duyệt đang chặn bộ nhớ cục bộ nên tiến độ chỉ giữ trong phiên này.";
    case "quota-exceeded":
      return "Bộ nhớ cục bộ đã đầy. Hãy xuất dữ liệu rồi xoá bớt bản ghi cũ.";
    default:
      return "Không lưu được vào bộ nhớ cục bộ; dữ liệu chỉ còn trong phiên này.";
  }
}

/**
 * Tách danh sách id thành phần còn nhận diện được và phần lạ.
 *
 * Dùng cho tiến độ học: id không còn trong curriculum **không** được tính vào
 * phần trăm, nhưng vẫn phải được giữ lại khi ghi lại storage, để đổi nội dung
 * không âm thầm xoá lịch sử của người học.
 */
export function partitionKnownIds(
  ids: readonly string[],
  known: ReadonlySet<string>,
): { active: string[]; archived: string[] } {
  const active: string[] = [];
  const archived: string[] = [];
  for (const id of ids) {
    if (known.has(id)) active.push(id);
    else archived.push(id);
  }
  return { active, archived };
}
