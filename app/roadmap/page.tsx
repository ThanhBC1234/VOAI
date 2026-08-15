import type { Metadata } from "next";
import { InternalLink } from "../../components/InternalLink";
import { RoadmapExplorer } from "../../components/RoadmapExplorer";
import { CURRICULUM_SESSIONS, CURRICULUM_SUMMARY, IOAI_2026_SYLLABUS_COVERAGE, MILESTONES, WEEKLY_CURRICULUM } from "../../content/curriculum";

export const metadata: Metadata = {
  title: "Lộ trình 290 ngày — VOAI Lab",
  description: "41 tuần và 3 ngày tổng kết từ Python nền tảng đến mock VOAI: ngày thường 30–60 phút, riêng R1 180 phút và R2 360 phút.",
};

export const dynamic = "force-static";

export default function RoadmapPage() {
  return (
    <main className="inner-page">
      <header className="page-hero roadmap-hero">
        <div><p className="eyebrow">15.08.2026 — 31.05.2027</p><h1>290 ngày được chia nhỏ<br /><em>đến mức có thể bắt đầu ngay.</em></h1><p>Ngày thường có bản Core 30 phút và Deep 60 phút. Hai checkpoint sức bền là ngoại lệ có chủ đích: R1 kéo dài 180 phút và R2 kéo dài 360 phút. Năm bài mới, một lab tích hợp và một checkpoint đóng tài liệu tạo thành nhịp cố định mỗi tuần.</p><InternalLink className="text-link" href="/assessments">Mở hệ thống 290 assessment →</InternalLink></div>
        <div className="roadmap-summary"><div><strong>{CURRICULUM_SUMMARY.lessons}</strong><span>bài học</span></div><div><strong>{CURRICULUM_SUMMARY.labs}</strong><span>phòng lab</span></div><div><strong>{CURRICULUM_SUMMARY.checkpoints}</strong><span>checkpoint</span></div><div><strong>{CURRICULUM_SUMMARY.syllabusItems}</strong><span>mục IOAI</span></div></div>
      </header>
      <RoadmapExplorer weeks={WEEKLY_CURRICULUM} sessions={CURRICULUM_SESSIONS} milestones={MILESTONES} coverage={IOAI_2026_SYLLABUS_COVERAGE} />
    </main>
  );
}
