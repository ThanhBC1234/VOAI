import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="topbar">
      <Link className="brand" href="/" aria-label="VOAI Lab - Trang chủ">
        <span className="brand-mark">V</span>
        <span>
          <strong>VOAI Lab</strong>
          <small>Hiểu sâu · Tự code · Thi thật</small>
        </span>
      </Link>
      <nav aria-label="Điều hướng chính">
        <Link href="/roadmap">Lộ trình</Link>
        <Link href="/lessons">Bài giảng</Link>
        <Link href="/assessments">Đánh giá</Link>
        <Link href="/labs">Phòng lab</Link>
        <Link href="/practice">Chấm bài</Link>
        <Link href="/resources">Tài nguyên</Link>
      </nav>
      <div className="header-actions">
        <span className="streak" aria-label="Chế độ học tự lực">SOLO·90</span>
        <Link className="profile" href="/roadmap" aria-label="Hồ sơ người học">L11</Link>
      </div>
    </header>
  );
}
