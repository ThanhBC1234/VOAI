import type { Metadata } from "next";
import { AssessmentExplorer } from "../../components/AssessmentExplorer";
import {
  DAILY_ASSESSMENTS,
  DAILY_ASSESSMENTS_VALIDATION,
} from "../../content/daily-assessments";
import { ASSESSMENT_CATALOG, detailOf } from "../../content/assessment-catalog";

export const metadata: Metadata = {
  title: "Đánh giá 290 phiên — VOAI Lab",
  description:
    "Retrieval, tự code, bằng chứng, giải thích và rubric cho từng ngày trong lộ trình VOAI 290 phiên.",
};

export const dynamic = "force-static";

/**
 * PERF-P3-01: chỉ catalog nhẹ đi vào HTML/RSC. Chi tiết của bài đầu tiên được
 * gửi kèm để màn hình đầu không phải chờ mạng; 289 bài còn lại nằm trong chunk
 * JSON tĩnh theo tuần và chỉ tải khi người học chọn tới.
 */
const firstAssessment = DAILY_ASSESSMENTS[0];
if (!firstAssessment) {
  throw new Error("Ngân hàng assessment rỗng; trang /assessments không thể render.");
}
const initialDetail = detailOf(firstAssessment);

export default function AssessmentsPage() {
  return (
    <main className="inner-page assessments-page">
      <header className="page-hero assessments-hero">
        <div>
          <p className="eyebrow">SOLO-90 · COACH-10 · FORMATIVE EVIDENCE</p>
          <h1>
            Mỗi ngày học kết thúc
            <br />
            <em>bằng một bằng chứng.</em>
          </h1>
          <p>
            Trả lời retrieval, tự code, lưu test/evidence, giải thích và tự chấm theo
            rubric. Attempt chỉ nằm trên thiết bị này và có thể xuất JSON.
          </p>
        </div>
        <div className="assessment-hero-proof" aria-label="Kiểm chứng dữ liệu assessment">
          <span>DỮ LIỆU ĐÃ ĐỐI CHIẾU</span>
          <strong>{DAILY_ASSESSMENTS_VALIDATION.total}/290</strong>
          <p>
            {DAILY_ASSESSMENTS_VALIDATION.uniqueSessionIds} session ID ·{" "}
            {DAILY_ASSESSMENTS_VALIDATION.uniqueDates} ngày duy nhất
          </p>
          <small>
            Đây là hệ thống tự đánh giá thủ công; pass không tự động chứng minh code đúng.
          </small>
        </div>
      </header>
      <AssessmentExplorer catalog={ASSESSMENT_CATALOG} initialDetail={initialDetail} />
    </main>
  );
}
