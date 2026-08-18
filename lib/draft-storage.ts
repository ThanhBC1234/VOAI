import { useEffect, useMemo, useState } from "react";
import { describeWriteStatus, writeJson } from "./local-storage";

/**
 * Ghi bản nháp của người học xuống `localStorage` một cách an toàn.
 *
 * Vì sao cần lớp này thay vì gọi thẳng `writeJson`: ba lỗi mất bài đã từng tồn
 * tại cùng lúc trong dự án, và cả ba đều nằm ở *nhịp ghi* chứ không ở bản thân
 * phép ghi.
 *
 * - **Ghi mỗi lần gõ phím.** Code Arena `JSON.stringify` toàn bộ kho nháp rồi
 *   `setItem` đồng bộ trên **từng ký tự**. Việc đó chặn luồng chính lúc gõ bài
 *   dài và đẩy nhanh việc chạm trần quota. Ở đây các nhịp gõ liên tiếp được gộp
 *   lại thành một lần ghi.
 * - **Không bao giờ ghi khi đang gõ.** Trang tự đánh giá chỉ ghi lúc *đổi bài*,
 *   nên tải lại trang là mất sạch phần đang gõ. Vì thế `flush` còn được gọi ở
 *   `pagehide`, lúc tab bị ẩn và lúc component bị gỡ — ba đường rời trang thật
 *   sự của một website.
 * - **Nuốt lỗi ghi.** Storage đầy hoặc bị chặn thì `writeJson` trả về trạng
 *   thái, nhưng nơi gọi bỏ qua nó, nên người học yên tâm gõ tiếp vào chỗ không
 *   được lưu. `notice` ở đây buộc lỗi phải hiện ra màn hình.
 *
 * Chỉ có **một** ô chờ cho mỗi khoá: lần lên lịch sau đè lên lần trước, nên giá
 * trị ghi xuống luôn là giá trị mới nhất. Nhờ vậy xoá nháp rồi lên lịch ghi
 * ngay sau đó không thể bị một lần ghi cũ còn treo làm sống lại.
 *
 * Phần lõi (`createDraftWriter`) cố ý **không** dính tới React, theo đúng cách
 * `lib/theory-exam-state.ts` tách logic thi khỏi component: nhịp gộp và thứ tự
 * ghi là chỗ dễ sai nhất, và chúng chỉ kiểm được tử tế khi test tự điều khiển
 * được đồng hồ.
 */

/** Gộp nhịp gõ trong khoảng này rồi mới chạm vào storage. */
export const DRAFT_FLUSH_DELAY_MS = 600;

export interface DraftWriterOptions {
  /** Nhận kết quả mỗi lần ghi; `null` nghĩa là ghi bình thường. */
  onStatus?: (notice: string | null) => void;
  /** Cho test tự điều khiển đồng hồ; mặc định dùng `setTimeout` của môi trường. */
  setTimer?: (callback: () => void, delayMs: number) => number;
  clearTimer?: (handle: number) => void;
  delayMs?: number;
}

export interface DraftWriterCore {
  /** Lên lịch ghi; nhiều lần gõ liên tiếp chỉ tốn đúng một lần ghi. */
  schedule: (value: unknown) => void;
  /** Ghi ngay phần đang chờ. Dùng khi đổi bài, nộp bài hoặc rời trang. */
  flush: () => void;
  /** Huỷ lần ghi đang chờ mà **không** ghi xuống. */
  dispose: () => void;
}

export function createDraftWriter(key: string, options: DraftWriterOptions = {}): DraftWriterCore {
  const {
    onStatus,
    setTimer = (callback, delayMs) => globalThis.setTimeout(callback, delayMs) as unknown as number,
    clearTimer = (handle) => globalThis.clearTimeout(handle),
    delayMs = DRAFT_FLUSH_DELAY_MS,
  } = options;

  // Bọc trong object để phân biệt "đang chờ ghi `undefined`" với "không có gì chờ".
  let pending: { value: unknown } | null = null;
  let timer: number | null = null;

  const cancelTimer = () => {
    if (timer !== null) {
      clearTimer(timer);
      timer = null;
    }
  };

  const flush = () => {
    cancelTimer();
    if (!pending) return;
    const { value } = pending;
    pending = null;
    onStatus?.(describeWriteStatus(writeJson(key, value)));
  };

  return {
    schedule(value: unknown) {
      pending = { value };
      cancelTimer();
      timer = setTimer(flush, delayMs);
    },
    flush,
    dispose() {
      cancelTimer();
      pending = null;
    },
  };
}

export interface DraftWriter {
  schedule: (value: unknown) => void;
  flush: () => void;
  /** Lời báo khi ghi hỏng; `null` nghĩa là đang lưu bình thường. */
  notice: string | null;
}

export function useDraftWriter(key: string): DraftWriter {
  const [notice, setNotice] = useState<string | null>(null);

  // `setNotice` giữ nguyên định danh qua mọi lần render, nên bộ ghi chỉ được
  // dựng lại khi `key` đổi. `flush` còn chạy lúc component đã bị gỡ (rời trang);
  // từ React 18 thì `setState` lúc đó là thao tác rỗng, không còn cảnh báo, nên
  // không cần cờ "còn sống" — mà cờ như vậy lại là đọc ref trong lúc render.
  const core = useMemo(() => createDraftWriter(key, { onStatus: setNotice }), [key]);

  useEffect(() => {
    // `pagehide` bắt được cả đóng tab lẫn điều hướng đi nơi khác, kể cả trên
    // iOS Safari — nơi `beforeunload` thường không chạy. `visibilitychange`
    // phủ thêm trường hợp người dùng chuyển tab rồi không quay lại.
    const flushNow = () => core.flush();
    const flushWhenHidden = () => {
      if (document.visibilityState === "hidden") core.flush();
    };
    window.addEventListener("pagehide", flushNow);
    document.addEventListener("visibilitychange", flushWhenHidden);
    return () => {
      window.removeEventListener("pagehide", flushNow);
      document.removeEventListener("visibilitychange", flushWhenHidden);
      // Gỡ component cũng là một đường rời trang: phần đang gõ phải xuống đĩa
      // trước khi bộ ghi bị vứt bỏ.
      core.flush();
      core.dispose();
    };
  }, [core]);

  // `core` chỉ đổi theo `key`, nên object trả về chỉ đổi khi `notice` đổi. Nơi
  // gọi được phép đặt thẳng `schedule` vào mảng phụ thuộc của `useEffect` mà
  // không làm effect chạy lại sau mỗi render — nếu nó chạy lại, hẹn giờ gộp
  // nhịp sẽ bị đặt lại mãi và không bao giờ ghi.
  return useMemo(
    () => ({ schedule: core.schedule, flush: core.flush, notice }),
    [core, notice],
  );
}
