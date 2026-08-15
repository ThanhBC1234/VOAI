import { InternalLink } from "../components/InternalLink";

export const dynamic = "force-static";

const phases = [
  { label: "Nền tảng", range: "Tuần 01–04", tone: "mint" },
  { label: "Machine Learning", range: "Tuần 05–14", tone: "sky" },
  { label: "Deep Learning", range: "Tuần 15–22", tone: "violet" },
  { label: "Computer Vision", range: "Tuần 23–31", tone: "coral" },
  { label: "NLP & Audio", range: "Tuần 32–38", tone: "gold" },
  { label: "Đa phương thức", range: "Tuần 39", tone: "coral" },
  { label: "VOAI & Capstone", range: "Tuần 40–41", tone: "mint" },
];

export default function Home() {
  return (
    <main>
      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">LỘ TRÌNH 15.08.2026 → 31.05.2027</p>
          <h1>Đi từ dòng Python đầu tiên<br />đến phòng thi <em>VOAI.</em></h1>
          <p className="hero-lead">
            Mỗi ngày 30–60 phút. Học cách thuật toán thật sự hoạt động,
            tự cài đặt trước khi dùng thư viện và biến kiến thức thành dự án AI hoàn chỉnh.
          </p>
          <div className="hero-actions">
            <InternalLink className="primary-button" href="/roadmap">Bắt đầu Ngày 1 <span>→</span></InternalLink>
            <InternalLink className="text-link" href="/roadmap">Xem toàn bộ 41 tuần</InternalLink>
          </div>
          <div className="commitment">
            <span className="commitment-number">90%</span>
            <span><strong>mã nguồn do chính bạn viết</strong><br />AI chỉ được dùng để kiểm tra suy luận.</span>
          </div>
        </div>

        <aside className="today-card" id="day-1" aria-labelledby="today-title">
          <div className="card-topline">
            <span>BUỔI KHỞI ĐỘNG · NGÀY 01</span>
            <span className="duration">45 phút</span>
          </div>
          <div className="lesson-symbol" aria-hidden="true">
            <span>&gt;_</span>
            <i className="dot dot-one" />
            <i className="dot dot-two" />
            <i className="dot dot-three" />
          </div>
          <p className="lesson-kicker">CHẶNG 1 · PYTHON TỪ C++</p>
          <h2 id="today-title">Biến, kiểu dữ liệu và tư duy vector</h2>
          <p>Viết chương trình Python đầu tiên, rồi khám phá vì sao NumPy nhanh hơn vòng lặp thuần.</p>
          <ul className="lesson-steps">
            <li><span>01</span><strong>Đọc & dự đoán</strong><small>10 phút</small></li>
            <li><span>02</span><strong>Tự code trong Lab</strong><small>25 phút</small></li>
            <li><span>03</span><strong>Kiểm tra không gợi ý</strong><small>10 phút</small></li>
          </ul>
          <InternalLink className="lesson-button" href="/lessons">Vào bài học <span>↗</span></InternalLink>
        </aside>
      </section>

      <section className="roadmap" id="lo-trinh" aria-labelledby="roadmap-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">BẢN ĐỒ HỌC TẬP</p>
            <h2 id="roadmap-title">41 tuần, một đích đến rõ ràng.</h2>
          </div>
          <p>Đi chậm ở nền tảng để đi nhanh khi gặp đề lạ. Mỗi chặng đều kết thúc bằng bài thi và một sản phẩm có thể chạy.</p>
        </div>
        <div className="phase-grid">
          {phases.map((phase, index) => (
            <article className={`phase-card ${phase.tone}`} key={phase.label}>
              <span className="phase-index">0{index + 1}</span>
              <div className="phase-line" />
              <h3>{phase.label}</h3>
              <p>{phase.range}</p>
              <span className="phase-status">{index === 0 ? "BẮT ĐẦU TẠI ĐÂY" : "SẮP TỚI"}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="principles" id="bai-hoc">
        <article><span>01</span><h3>Hiểu trước</h3><p>Trực quan hóa, toán vừa đủ và tự giải thích bằng lời của mình.</p></article>
        <article><span>02</span><h3>Code từ đầu</h3><p>Cài thuật toán bằng NumPy trước khi gọi scikit-learn hoặc PyTorch.</p></article>
        <article><span>03</span><h3>Đấu với dữ liệu</h3><p>Notebook, bài kiểm tra mù và bảng điểm mô phỏng nhịp thi thực hành.</p></article>
      </section>
    </main>
  );
}
