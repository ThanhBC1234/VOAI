/**
 * Nguồn sự thật duy nhất cho tên repository và base path của GitHub Pages.
 *
 * Vì sao tệp này tồn tại: trước đây chuỗi `/voai-lab` bị chép tay ở sáu nơi —
 * `next.config.ts`, `scripts/run-vinext.mjs`, `scripts/prepare-pages.mjs`,
 * `scripts/measure-payload.mjs`, `components/NotebookHub.tsx` và
 * `tests/pages-export.test.mjs`. Đổi tên repository mà sót một chỗ thì bản
 * deploy vẫn build xanh nhưng **404 toàn bộ CSS/JS/ảnh**, và lỗi chỉ lộ ra sau
 * khi đã lên mạng.
 *
 * Đổi tên repository ⇒ sửa **đúng một dòng** ở đây rồi chạy lại
 * `npm run build:pages && npm run test:pages`.
 *
 * Lưu ý phân biệt hoa/thường: URL của GitHub Pages phân biệt hoa thường, nên
 * giá trị dưới đây phải khớp **chính xác** tên repository trên GitHub.
 */

/** Tên repository trên GitHub, đúng hoa/thường. */
export const REPOSITORY_NAME = "VOAI";

/** Base path của site khi phát hành lên GitHub Pages. */
export const BASE_PATH = `/${REPOSITORY_NAME}`;
