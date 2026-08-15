import type { Metadata } from "next";
import { CodePractice } from "../../components/CodePractice";

export const metadata: Metadata = {
  title: "Tự code & chấm bài — VOAI Lab",
  description: "Viết Python trong trình duyệt, chạy test công khai và kiểm tra mù phía client theo nguyên tắc SOLO-90.",
};

export const dynamic = "force-static";

export default function PracticePage() {
  return (
    <main className="inner-page practice-page">
      <header className="page-hero compact">
        <p className="eyebrow">SOLO·90 CODE ARENA</p>
        <h1>File gần như trắng.<br /><em>Tư duy hoàn toàn của bạn.</em></h1>
        <p>Pyodide có trạng thái tải riêng; bộ đếm 8 giây chỉ bắt đầu khi runtime đã sẵn sàng. Mỗi lượt chạy dùng một Web Worker và Python runtime mới để không rò trạng thái sang bài sau, nhưng vẫn không phải sandbox cho mã thù địch. Test công khai giúp debug; kiểm tra mù chỉ giấu ca kiểm tra khỏi giao diện trước khi chạy — nội dung vẫn có thể đọc trong source/bundle phía client.</p>
      </header>
      <CodePractice />
    </main>
  );
}
