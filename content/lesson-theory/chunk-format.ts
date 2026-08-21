/**
 * Định dạng chunk lý thuyết — chỉ chứa schema và cách dựng đường dẫn.
 *
 * File này cố ý không import giá trị runtime từ catalog lý thuyết. Loader chạy
 * ở client chỉ cần phiên bản, kiểu phong bì và đường dẫn; kéo `index.ts` vào đây
 * sẽ đưa toàn bộ nội dung 78 bài trở lại bundle ban đầu và làm mất ý nghĩa của
 * lazy-load.
 */

import { THEORY_SOURCE_IDS } from "./types";
import type { LessonDeepTheory } from "./types";

/** Thư mục chunk tĩnh trong `public/`, tính từ gốc site. */
export const LESSON_THEORY_CHUNK_DIRECTORY = "/data/lesson-theory";
/** Tăng số này khi hình dạng chunk thay đổi không tương thích ngược. */
export const LESSON_THEORY_CHUNK_VERSION = 1;

/** Runtime enum để client từ chối `sourceIds` lạ thay vì chỉ ép kiểu mù. */
export const LESSON_THEORY_SOURCE_IDS = THEORY_SOURCE_IDS;

/** Một file chứa đúng phần lý thuyết mở rộng của một bài học. */
export interface LessonTheoryChunk {
  version: number;
  lessonId: string;
  theory: LessonDeepTheory;
}

/**
 * ID bài học chỉ được dùng như một segment tên file an toàn.
 *
 * Catalog hiện tại dùng kebab-case ASCII. Giữ contract chặt ngăn traversal,
 * query/hash injection, tên file ẩn và các biến thể case gây lệch cache giữa
 * Windows với GitHub Pages.
 */
export function isValidLessonTheoryId(lessonId: string): boolean {
  return (
    lessonId.length >= 1 &&
    lessonId.length <= 96 &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(lessonId)
  );
}

export function lessonTheoryChunkPath(lessonId: string): string {
  if (!isValidLessonTheoryId(lessonId)) {
    throw new Error(`ID bài học không hợp lệ để dựng chunk: ${lessonId}`);
  }
  return `${LESSON_THEORY_CHUNK_DIRECTORY}/${lessonId}.json`;
}
