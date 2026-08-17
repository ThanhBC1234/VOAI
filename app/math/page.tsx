import type { Metadata } from "next";
import { MathExplorer } from "../../components/MathExplorer";
import { MATH_MODULES, MATH_VALIDATION } from "../../content/math";

export const metadata: Metadata = {
  title: "Toán cho VOAI — VOAI Lab",
  description:
    "Đại số tuyến tính, gradient, xác suất, tối ưu và lý thuyết thông tin — chỉ phần toán thật sự cần để làm được đề VOAI, kèm ví dụ giải mẫu và bài luyện tự chấm.",
};

export const dynamic = "force-static";

export default function MathPage() {
  return (
    <main className="inner-page math-page">
      <header className="page-hero math-hero">
        <div>
          <p className="eyebrow">
            {MATH_VALIDATION.modules} MODULE · {MATH_VALIDATION.topics} CHỦ ĐỀ ·{" "}
            {MATH_VALIDATION.drills} BÀI LUYỆN
          </p>
          <h1>
            Toán không phải môn phụ ở đây.
            <br />
            <em>Nhưng chỉ học phần dùng được.</em>
          </h1>
          <p>
            Mỗi chủ đề trong lớp này phải trả lời được câu hỏi “kiến thức này xuất hiện ở đâu
            trong đề hoặc trong đoạn code phải viết?”. Vì thế không có chứng minh định lý,
            không có giải tích tổng quát — chỉ có công thức phải thuộc, ví dụ tính tay từng
            bước, bẫy thường gặp và bài luyện có đáp án số để tự chấm.
          </p>
        </div>
        <div className="assessment-hero-proof" aria-label="Kiểm chứng lớp Toán">
          <span>PHẠM VI ĐÃ CẮT GỌN</span>
          <strong>{MATH_VALIDATION.topics} chủ đề</strong>
          <p>
            {MATH_VALIDATION.byLevel.core} bắt buộc thuộc · {MATH_VALIDATION.byLevel.applied} vận
            dụng · {MATH_VALIDATION.byLevel.advanced} câu phân loại
          </p>
          <small>
            {MATH_VALIDATION.drills} đáp án số đều được tính lại độc lập trong bộ test, nên một
            con số sai sẽ làm đỏ CI trước khi tới tay người học.
          </small>
        </div>
      </header>
      <MathExplorer modules={MATH_MODULES} />
    </main>
  );
}
