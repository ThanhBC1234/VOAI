import { InternalLink } from "./InternalLink";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  return (
    <header className="topbar">
      <InternalLink className="brand" href="/" aria-label="VOAI Lab - Trang chủ">
        <span className="brand-mark">V</span>
        <span>
          <strong>VOAI Lab</strong>
          <small>Hiểu sâu · Tự code · Thi thật</small>
        </span>
      </InternalLink>
      <nav aria-label="Điều hướng chính">
        <InternalLink href="/huong-dan">Hướng dẫn</InternalLink>
        <InternalLink href="/roadmap">Lộ trình</InternalLink>
        <InternalLink href="/lessons">Bài giảng</InternalLink>
        <InternalLink href="/math">Toán</InternalLink>
        <InternalLink href="/theory">Lý thuyết</InternalLink>
        <InternalLink href="/assessments">Đánh giá</InternalLink>
        <InternalLink href="/labs">Phòng lab</InternalLink>
        <InternalLink href="/notebooks">Notebook</InternalLink>
        <InternalLink href="/practice">Chấm bài</InternalLink>
        <InternalLink href="/resources">Tài nguyên</InternalLink>
      </nav>
      <div className="header-actions">
        <span className="streak" aria-label="Chế độ học tự lực">SOLO·90</span>
        <ThemeToggle />
        <InternalLink className="profile" href="/roadmap" aria-label="Hồ sơ người học">L11</InternalLink>
      </div>
    </header>
  );
}
