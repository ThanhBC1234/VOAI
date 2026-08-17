import type { Metadata } from "next";
import { UserGuideView } from "../../components/UserGuideView";
import {
  USER_GUIDE_LEAD,
  USER_GUIDE_SECTIONS,
  USER_GUIDE_TITLE,
  USER_GUIDE_VALIDATION,
} from "../../content/user-guide";

export const metadata: Metadata = {
  title: "Hướng dẫn sử dụng — VOAI Lab",
  description:
    "Hướng dẫn sử dụng VOAI Lab cho người học: bắt đầu ở đâu, mỗi phiên học làm gì, dùng AI tới đâu, tự chấm thế nào và tiến độ được lưu ở đâu.",
};

export const dynamic = "force-static";

export default function UserGuidePage() {
  return (
    <main className="inner-page guide-page">
      <header className="page-hero guide-hero">
        <div>
          <p className="eyebrow">ĐỌC TRANG NÀY TRƯỚC · {USER_GUIDE_VALIDATION.sections} MỤC</p>
          <h1>
            {USER_GUIDE_TITLE}
            <br />
            <em>Tất cả trong một trang.</em>
          </h1>
          <p>{USER_GUIDE_LEAD}</p>
        </div>
      </header>
      <section className="guide-app" aria-label="Hướng dẫn sử dụng VOAI Lab">
        <UserGuideView sections={USER_GUIDE_SECTIONS} />
      </section>
    </main>
  );
}
