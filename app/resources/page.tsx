import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tài nguyên học hợp pháp — VOAI Lab",
  description: "Đề cương, đề thi, sách mở và tài liệu chính thức dùng trong lộ trình VOAI.",
};

const groups = [
  {
    title: "Chuẩn thi chính thức",
    note: "Dùng để xác định phạm vi — không học theo lời truyền miệng.",
    links: [
      ["Quy chế VOAI", "Hội Tin học Việt Nam", "https://www.olp.vn/olympic-ai-cho-h%E1%BB%8Dc-sinh/quy-ch%E1%BA%BF-n%E1%BB%99i-quy"],
      ["Đề cương IOAI 2026", "International Scientific Committee", "https://ioai-official.org/wp-content/uploads/2025/10/Syllabus.pdf"],
      ["Quy tắc thi IOAI 2026", "IOAI Official", "https://ioai-official.org/republic-of-kazakhstan/2026-contest-rules/"],
      ["Kho đề IOAI 2026", "Đề, dữ liệu, baseline và grader", "https://github.com/IOAI-official/IOAI-2026"],
      ["Kho đề IOAI 2025", "Sáu bài thi và lời giải tham khảo", "https://github.com/IOAI-official/IOAI-2025"],
    ],
  },
  {
    title: "Toán, Machine Learning",
    note: "Sách mở để tra sâu sau khi đã làm micro-lesson.",
    links: [
      ["Mathematics for Machine Learning", "Deisenroth, Faisal, Ong — bản PDF hợp pháp", "https://mml-book.github.io/"],
      ["An Introduction to Statistical Learning", "Bản Python miễn phí từ tác giả", "https://www.statlearning.com/"],
      ["scikit-learn User Guide", "Tài liệu API và ví dụ chính thức", "https://scikit-learn.org/stable/user_guide.html"],
      ["NumPy Learn", "Tài liệu học do NumPy tuyển chọn", "https://numpy.org/learn/"],
    ],
  },
  {
    title: "Deep Learning, CV, NLP, Audio",
    note: "Ưu tiên notebook nhỏ chạy CPU; dùng Colab khi cần GPU.",
    links: [
      ["Dive into Deep Learning", "Sách mở có code PyTorch", "https://d2l.ai/"],
      ["PyTorch Tutorials", "Training loop, CV, NLP và audio chính thức", "https://docs.pytorch.org/tutorials/"],
      ["Hugging Face Course", "Transformers, tokenizer và fine-tuning", "https://huggingface.co/learn"],
      ["OpenCV Tutorials", "Xử lý ảnh cổ điển và computer vision", "https://docs.opencv.org/4.x/d9/df8/tutorial_root.html"],
      ["librosa Documentation", "Waveform, STFT, Mel và MFCC", "https://librosa.org/doc/latest/index.html"],
    ],
  },
];

export default function ResourcesPage() {
  return (
    <main className="inner-page resources-page">
      <header className="page-hero compact">
        <p className="eyebrow">THƯ VIỆN ĐÃ TUYỂN CHỌN</p>
        <h1>Nguồn gốc rõ ràng.<br /><em>Không sách lậu, không link rác.</em></h1>
        <p>Mỗi tài nguyên ở đây là nguồn chính thức hoặc sách được tác giả phát hành miễn phí. Danh sách hiện được tuyển theo nhóm chủ đề và chưa có bảng ánh xạ từng bài sang chương sách; hãy tra cứu đúng khái niệm đang học thay vì đọc tuần tự cả cuốn.</p>
      </header>
      <section className="resource-groups">
        {groups.map((group,index)=><article key={group.title}><div className="resource-heading"><span>0{index+1}</span><div><h2>{group.title}</h2><p>{group.note}</p></div></div><div className="resource-links">{group.links.map(([title,source,url])=><a key={title} href={url} target="_blank" rel="noreferrer"><div><strong>{title}</strong><small>{source}</small></div><span>↗</span></a>)}</div></article>)}
      </section>
      <section className="resource-policy"><strong>Nguyên tắc sử dụng</strong><p>Không chép notebook mẫu rồi gọi là đã học. Hãy dự đoán, tự cài bản nhỏ, vượt bài kiểm tra mù và giải thích trước; tài liệu ngoài chỉ dùng để đối chiếu hoặc mở rộng.</p><a href="/practice">Vào phòng tự code →</a></section>
    </main>
  );
}
