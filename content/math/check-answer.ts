/**
 * Chấm một câu trả lời số của bài luyện toán.
 *
 * Tách riêng khỏi `index.ts` **có chủ đích**: `index.ts` import toàn bộ nội
 * dung 5 module, nên nếu component client import từ đó thì bundler sẽ gói cả
 * lớp Toán vào JS — trong khi nội dung đã đi qua RSC payload rồi, thành ra
 * người học tải hai lần. Đây đúng là cái bẫy đã phải sửa ở PERF-P3-01 với
 * `content/assessment-catalog.ts`.
 *
 * Quy tắc chấm:
 * - Chấp nhận cả `0.5` lẫn `0,5`, vì bàn phím tiếng Việt hay cho dấu phẩy.
 * - Trả `null` khi **chưa** đọc được số: “chưa trả lời” và “trả lời sai” là hai
 *   trạng thái khác nhau và giao diện hiển thị khác nhau.
 * - Cộng thêm `1e-12` vào ngưỡng để sai số dấu phẩy động không đánh trượt một
 *   đáp án đúng ở đúng biên (ví dụ `0.1 + 0.2`).
 */

export interface DrillAnswerSpec {
  answer: number;
  tolerance: number;
}

export function checkDrillAnswer(raw: string, drill: DrillAnswerSpec): boolean | null {
  const normalized = raw.trim().replace(",", ".");
  if (normalized.length === 0) return null;
  const value = Number(normalized);
  if (!Number.isFinite(value)) return null;
  return Math.abs(value - drill.answer) <= drill.tolerance + 1e-12;
}
