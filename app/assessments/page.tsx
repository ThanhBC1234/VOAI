import type { Metadata } from "next";
import { AssessmentExplorer } from "../../components/AssessmentExplorer";
import {
  DAILY_ASSESSMENTS,
  DAILY_ASSESSMENTS_VALIDATION,
} from "../../content/daily-assessments";

export const metadata: Metadata = {
  title: "Đánh giá 290 phiên — VOAI Lab",
  description:
    "Retrieval, tự code, bằng chứng, giải thích và rubric cho từng ngày trong lộ trình VOAI 290 phiên.",
};

export const dynamic = "force-static";

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
      <AssessmentExplorer
        assessments={DAILY_ASSESSMENTS}
      />
    </main>
  );
}
