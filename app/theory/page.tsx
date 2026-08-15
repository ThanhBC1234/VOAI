import type { Metadata } from "next";
import { TheoryExam } from "../../components/TheoryExam";
import {
  MOCK_DURATION_MINUTES,
  REFERENCE_MOCK_PAPER,
  THEORY_BANK,
  THEORY_BANK_VALIDATION,
  paperSectionOf,
} from "../../content/theory";

export const metadata: Metadata = {
  title: "Lý thuyết vòng 1 — VOAI Lab",
  description:
    "Ngân hàng 350 câu phủ 60/60 mục Syllabus IOAI và 5 nhóm nền tảng bổ sung, kèm đề mock 100 câu trong 180 phút cho vòng sơ loại VOAI.",
};

export const dynamic = "force-static";

const sectionOf = Object.fromEntries(
  THEORY_BANK.map((question) => [question.id, paperSectionOf(question)]),
);
const paperIds = REFERENCE_MOCK_PAPER.questions.map((question) => question.id);

export default function TheoryPage() {
  const advanced = THEORY_BANK_VALIDATION.byDifficulty.advanced;
  return (
    <main className="inner-page theory-page">
      <header className="page-hero theory-hero">
        <div>
          <p className="eyebrow">VÒNG 1 · TRẮC NGHIỆM TRÊN MÁY · {MOCK_DURATION_MINUTES} PHÚT</p>
          <h1>
            Vòng 1 hỏi lý thuyết.
            <br />
            <em>Nên phải luyện đúng thứ đó.</em>
          </h1>
          <p>
            {THEORY_BANK_VALIDATION.total} câu phân loại theo ba trục: chủ đề phủ{" "}
            {THEORY_BANK_VALIDATION.syllabusItemsCovered}/
            {THEORY_BANK_VALIDATION.syllabusItemsTotal} mục Syllabus IOAI và 5 nhóm nền tảng
            bổ sung, bốn mức độ từ Nhận biết tới Vận dụng cao, và bốn dạng thao tác đang
            dùng. Mỗi câu có lời giải và ghi chú cho từng phương án — kể cả phương án đúng.
          </p>
        </div>
        <div className="assessment-hero-proof" aria-label="Kiểm chứng ngân hàng câu hỏi">
          <span>DỮ LIỆU ĐÃ ĐỐI CHIẾU</span>
          <strong>{THEORY_BANK_VALIDATION.total} câu</strong>
          <p>
            {THEORY_BANK_VALIDATION.syllabusItemsCovered}/
            {THEORY_BANK_VALIDATION.syllabusItemsTotal} mục syllabus · {advanced} câu phân loại
          </p>
          <small>
            Số câu và thang điểm ở đây là tham số luyện tập nội bộ. Thông số chính thức của
            VOAI 2027 vẫn là TBD cho tới khi Ban Tổ chức công bố.
          </small>
        </div>
      </header>
      <TheoryExam questions={THEORY_BANK} sectionOf={sectionOf} paperIds={paperIds} />
    </main>
  );
}
