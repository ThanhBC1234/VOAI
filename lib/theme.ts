/**
 * Chế độ sáng/tối: một nguồn sự thật cho cả script chống nháy lẫn nút bật tắt.
 *
 * Vì sao cần script chạy trước khi vẽ (`THEME_INIT_SCRIPT`): website là bản
 * xuất tĩnh, HTML gửi đi luôn giống nhau cho mọi người. Nếu chờ React hydrate
 * rồi mới gắn `data-theme`, người chọn nền tối sẽ thấy **một nháy trắng** ở mỗi
 * lần chuyển trang — đúng thứ mà chế độ tối sinh ra để tránh. Script nội tuyến
 * chạy đồng bộ trong `<head>` nên thuộc tính có mặt trước khung hình đầu tiên.
 *
 * Vì sao lưu cả `"system"`: bỏ theo cài đặt hệ điều hành là một lựa chọn thật,
 * khác với "chưa từng chọn". Người đã bấm về `system` phải tiếp tục đổi màu
 * theo máy của họ, không bị khoá cứng vào giá trị lúc bấm.
 */

export const THEME_STORAGE_KEY = "voai-theme-v1";

export type ThemeChoice = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export function isThemeChoice(value: unknown): value is ThemeChoice {
  return value === "light" || value === "dark" || value === "system";
}

/**
 * Script nội tuyến đặt `data-theme` trước khung hình đầu tiên.
 *
 * Bọc trong `try` vì `localStorage` có thể ném khi cookie bị chặn hoàn toàn;
 * hỏng ở đây mà không bắt là trang trắng, nên thà rơi về chế độ theo hệ điều
 * hành còn hơn.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});var t=(s==="light"||s==="dark")?s:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=t;}catch(e){}})();`;

/** Áp lựa chọn lên thẻ `<html>`; `"system"` hỏi lại cài đặt hệ điều hành. */
export function applyTheme(choice: ThemeChoice): ResolvedTheme {
  const resolved: ResolvedTheme =
    choice === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : choice;
  document.documentElement.dataset.theme = resolved;
  return resolved;
}
