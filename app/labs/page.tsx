import type { Metadata } from "next";
import { InteractiveLabs } from "../../components/InteractiveLabs";

export const metadata: Metadata = {
  title: "Phòng lab tương tác — VOAI Lab",
  description: "Thay đổi dữ liệu và tham số để quan sát gradient descent, k-NN, convolution, attention, tín hiệu âm thanh và metric hoạt động.",
};

export default function LabsPage() {
  return (
    <main className="inner-page">
      <header className="page-hero compact">
        <p className="eyebrow">PHÒNG THÍ NGHIỆM</p>
        <h1>Đừng chỉ đọc công thức.<br /><em>Hãy làm nó chuyển động.</em></h1>
        <p>Mỗi mô phỏng dưới đây tính lại ngay trong trình duyệt. Hãy ghi dự đoán trước, thay một tham số, rồi giải thích vì sao kết quả đổi.</p>
      </header>
      <InteractiveLabs />
    </main>
  );
}
