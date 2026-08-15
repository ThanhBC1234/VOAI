import type { Metadata } from "next";
import { NotebookHub } from "../../components/NotebookHub";

export const metadata: Metadata = {
  title: "Notebook Colab — VOAI Lab",
  description: "Tám notebook thực hành VOAI có TODO, visible tests và exit ticket, mở trực tiếp từ GitHub bằng Google Colab.",
};

export const dynamic = "force-static";

export default function NotebooksPage() {
  return (
    <main className="inner-page notebooks-page">
      <header className="page-hero compact">
        <p className="eyebrow">CODE TRÊN ĐÁM MÂY</p>
        <h1>Tám notebook có khung.<br /><em>Phần còn lại là của bạn.</em></h1>
        <p>Mỗi notebook có TODO, kiểm tra nhìn thấy và exit ticket. Hãy tự viết trước; chỉ hỏi AI để kiểm tra lập luận sau khi đã lưu code, kết quả và giải thích của mình.</p>
      </header>
      <NotebookHub />
    </main>
  );
}
