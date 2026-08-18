"use client";

import { useEffect, useRef } from "react";
import { readRaw, writeRaw } from "../lib/local-storage";
import { applyTheme, isThemeChoice, THEME_STORAGE_KEY, type ThemeChoice } from "../lib/theme";

/**
 * Nút đổi sáng ⇄ tối trên thanh điều hướng.
 *
 * Ba điểm dễ hỏng, đã xử lý sẵn:
 *
 * - **Không so khớp khi hydrate.** Máy chủ không biết người dùng chọn gì, nên
 *   markup gửi đi phải giống hệt nhau ở mọi chế độ. Vì thế cả hai biểu tượng
 *   đều được render, CSS mới quyết định cái nào hiện — không có nhánh nào phụ
 *   thuộc chế độ trong lần vẽ đầu.
 * - **Lựa chọn giữ trong `ref`, không phải state.** Không có gì trong markup
 *   phụ thuộc vào nó, nên đặt vào state chỉ tạo thêm một vòng render ngay lúc
 *   trang vừa tải mà chẳng đổi lấy một pixel nào.
 * - **Đang để "theo hệ thống" thì phải đổi theo hệ thống.** Khi chưa có lựa
 *   chọn lưu sẵn, component nghe `prefers-color-scheme`; người dùng đổi cài đặt
 *   máy giữa chừng là trang đổi theo ngay. Bấm nút một lần là chốt lựa chọn thủ
 *   công, và từ đó tín hiệu của hệ điều hành bị bỏ qua.
 */
export function ThemeToggle() {
  const choice = useRef<ThemeChoice>("system");

  useEffect(() => {
    const stored = readRaw(THEME_STORAGE_KEY);
    choice.current = isThemeChoice(stored) ? stored : "system";
    applyTheme(choice.current);

    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      if (choice.current === "system") applyTheme("system");
    };
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  function toggle() {
    // Nguồn sự thật là thuộc tính đang có trên `<html>`: nó đã gộp sẵn cả lựa
    // chọn thủ công lẫn cài đặt hệ điều hành, nên "ngược lại với cái đang thấy"
    // luôn đúng với thứ người dùng đang nhìn.
    const next: ThemeChoice = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    choice.current = next;
    applyTheme(next);
    writeRaw(THEME_STORAGE_KEY, next);
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label="Đổi giữa nền sáng và nền tối"
      title="Đổi giữa nền sáng và nền tối"
    >
      <svg className="theme-icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
      </svg>
      <svg className="theme-icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    </button>
  );
}
