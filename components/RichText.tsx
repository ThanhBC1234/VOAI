"use client";

import katex from "katex";
import type { ReactNode } from "react";

/**
 * Kết xuất một chuỗi nội dung có đánh dấu inline sang React node.
 *
 * Nội dung trong `content/` được viết như văn bản kỹ thuật: công thức đặt giữa
 * `$…$`, tên định danh đặt giữa dấu backtick, và phần nhấn mạnh đặt giữa `**`.
 * Trước đây mỗi trang tự tách riêng `$…$` rồi in thẳng phần còn lại, nên người
 * học nhìn thấy nguyên ký tự đánh dấu — ví dụ "thành **một** số đo" hay
 * "`axis=k` là chiều bị triệt tiêu". Gom một chỗ để ba trang Toán, Bài giảng và
 * Lý thuyết đọc giống nhau và chỉ phải sửa một nơi.
 *
 * Chỉ nhận `**đậm**` và `` `mã` `` vì hai dấu này không nhập nhằng. Dấu `*` đơn
 * cố ý bị bỏ qua: trong nội dung này nó thường là phép nhân (`*T^2*`, `*(d*`),
 * nên diễn giải nó thành in nghiêng sẽ làm hỏng công thức.
 */

const MATH_SEGMENT = /(\$[^$]+\$)/g;
const INLINE_MARKUP = /(\*\*[^*]+\*\*|`[^`]+`)/g;

function renderProse(text: string, keyPrefix: string): ReactNode[] {
  return text
    .split(INLINE_MARKUP)
    .filter(Boolean)
    .map((part, index) => {
      const key = `${keyPrefix}-${index}`;
      if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
        return <strong key={key}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
        return (
          <code className="inline-code" key={key}>
            {part.slice(1, -1)}
          </code>
        );
      }
      return <span key={key}>{part}</span>;
    });
}

export function RichText({ children }: { children: string }) {
  return (
    <>
      {children
        .split(MATH_SEGMENT)
        .filter(Boolean)
        .map((part, index) => {
          if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
            const formula = part.slice(1, -1);
            return (
              <span
                className="lesson-formula"
                aria-label={formula}
                key={`math-${index}`}
                dangerouslySetInnerHTML={{
                  __html: katex.renderToString(formula, {
                    throwOnError: false,
                    strict: "warn",
                    trust: false,
                  }),
                }}
              />
            );
          }
          return <span key={`prose-${index}`}>{renderProse(part, String(index))}</span>;
        })}
    </>
  );
}
