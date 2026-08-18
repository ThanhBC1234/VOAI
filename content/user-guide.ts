/**
 * Hướng dẫn sử dụng VOAI Lab — **nguồn sự thật duy nhất**.
 *
 * Trước đây người học phải đọc rải rác 5 tệp trong `docs/` (BAT_DAU_SU_DUNG,
 * HUONG_DAN_NGUOI_HOC, GITHUB_ONLINE, QUY_TAC_SOLO_90, LO_TRINH_41_TUAN) và
 * phần lớn trong đó viết cho *người triển khai* chứ không cho *người học*. Tệp
 * này gộp đúng phần người học cần, và là nguồn để sinh ra cả ba đầu ra:
 *
 * - trang web `/huong-dan` (nơi khách hàng đọc, không cần vào GitHub);
 * - `docs/HUONG_DAN_SU_DUNG.md` (sinh bởi `scripts/emit-user-guide.mjs`);
 * - `docs/HUONG_DAN_SU_DUNG.docx` (sinh tiếp từ tệp .md đó).
 *
 * Sửa nội dung hướng dẫn thì sửa **ở đây**, rồi chạy lại script sinh tài liệu.
 * Đừng sửa thẳng vào .md/.docx vì chúng sẽ bị ghi đè.
 */

export type GuideBlock =
  | { kind: "text"; value: string }
  | { kind: "list"; items: readonly [string, ...string[]] }
  | { kind: "steps"; items: readonly [string, string, ...string[]] }
  | {
      kind: "table";
      head: readonly [string, ...string[]];
      rows: readonly [readonly string[], ...(readonly string[])[]];
    }
  | { kind: "note"; tone: "info" | "warn"; title: string; value: string };

export interface GuideSection {
  id: string;
  title: string;
  /** Một câu tóm tắt để người đọc biết có cần đọc mục này không. */
  lead: string;
  blocks: readonly [GuideBlock, ...GuideBlock[]];
}

export const USER_GUIDE_TITLE = "Hướng dẫn sử dụng VOAI Lab";
export const USER_GUIDE_LEAD =
  "Tất cả những gì người học cần, gộp trong một trang: mở gì trước, mỗi ngày làm gì, " +
  "dùng AI tới đâu, tự chấm thế nào và tiến độ được lưu ở đâu.";

export const USER_GUIDE_SECTIONS: readonly GuideSection[] = [
  {
    id: "voai-lab-la-gi",
    title: "1. VOAI Lab là gì và dành cho ai",
    lead: "Đọc 1 phút để biết bạn có đúng đối tượng không.",
    blocks: [
      {
        kind: "text",
        value:
          "VOAI Lab là bộ học liệu **tự học AI** cho học sinh THPT đã biết lập trình cơ bản, " +
          "hướng tới kỳ thi VOAI/IOAI. Toàn bộ chạy trong trình duyệt — **không cần cài gì**.",
      },
      {
        kind: "list",
        items: [
          "**290 phiên học** trải từ 15/08/2026 đến 31/05/2027, mỗi ngày 30–60 phút.",
          "**78 bài giảng** thuật toán, **5 module Toán** (23 chủ đề · 69 bài luyện có đáp án).",
          "**350 câu lý thuyết** cho vòng 1, kèm đề thi thử 100 câu trong 180 phút.",
          "**6 phòng lab** tương tác, **5 bài Code Arena** chạy Python ngay trong trình duyệt.",
          "**8 notebook** thực hành mở thẳng trên Google Colab.",
        ],
      },
      {
        kind: "note",
        tone: "info",
        title: "Nguyên tắc xuyên suốt: SOLO-90",
        value:
          "Tối thiểu 90% việc học phải do bạn tự làm. AI chỉ được dùng để **kiểm chứng**, " +
          "không dùng để sinh lời giải. Chi tiết ở mục 6.",
      },
    ],
  },
  {
    id: "bat-dau",
    title: "2. Bắt đầu trong 5 phút",
    lead: "Làm đúng 4 bước này là xong buổi học đầu tiên.",
    blocks: [
      {
        kind: "steps",
        items: [
          "Mở trang **Lộ trình**. Tìm phiên có ngày hôm nay (hoặc phiên chưa tích gần nhất) rồi bấm mở tuần chứa nó.",
          "Đọc mục tiêu và phần `soloBuild` của phiên — đây là thứ bạn phải tự làm được, không phải thứ để đọc cho biết.",
          "Mở **Đánh giá** ở tab khác, tìm đúng phiên đó, và trả lời phần truy hồi **khi tài liệu còn đóng**.",
          "Code phần nhỏ nhất chạy được + ít nhất một test biên. Quay lại phiếu đánh giá, ghi bằng chứng, tự chấm, bấm lưu.",
        ],
      },
      {
        kind: "note",
        tone: "warn",
        title: "Đừng tích hoàn thành khi chưa có sản phẩm",
        value:
          "Dấu tích chỉ để theo dõi. Nếu chưa có tệp chạy được, test, hay phần giải thích thì phiên đó **chưa xong** — " +
          "dù bạn đã đọc hết bài giảng.",
      },
    ],
  },
  {
    id: "ban-do-trang",
    title: "3. Bản đồ 11 trang — dùng trang nào khi nào",
    lead: "Mỗi trang có một việc. Đây là bảng tra nhanh.",
    blocks: [
      {
        kind: "table",
        head: ["Trang", "Dùng để làm gì", "Khi nào mở"],
        rows: [
          ["Trang chủ", "Giới thiệu và lối vào nhanh", "Lần đầu vào web"],
          ["**Hướng dẫn**", "Chính trang bạn đang đọc", "Khi quên cách dùng gì đó"],
          ["Lộ trình", "290 phiên theo ngày, mục tiêu, tích hoàn thành", "**Mở đầu tiên mỗi ngày**"],
          ["Bài giảng", "78 bài: trực giác, công thức, lỗi thường gặp, quiz", "Khi cần hiểu cơ chế"],
          ["Toán", "5 module toán thi, có ví dụ mẫu và bài luyện tự chấm", "Khi hổng nền toán"],
          ["Lý thuyết", "350 câu vòng 1 + đề thi thử tính giờ", "Luyện trắc nghiệm, thi thử"],
          ["Đánh giá", "Phiếu 1:1 cho từng phiên: bằng chứng + tự chấm", "**Cuối mỗi phiên học**"],
          ["Phòng lab", "6 mô phỏng kéo–thả để thấy thuật toán chuyển động", "Khi khái niệm còn mơ hồ"],
          ["Chấm bài", "Code Arena: viết Python, chạy test ngay trên web", "Khi cần luyện code"],
          ["Notebook", "8 notebook mở trên Colab", "Bài thực hành dài"],
          ["Tài nguyên", "Nguồn học hợp pháp đã kiểm", "Khi muốn học thêm"],
        ],
      },
      {
        kind: "note",
        tone: "info",
        title: "Nền sáng hay nền tối tuỳ bạn",
        value:
          "Nút đổi nền nằm ở góc phải thanh điều hướng. Lựa chọn được nhớ lại cho những lần sau, " +
          "và mặc định đi theo cài đặt sáng/tối của máy bạn.",
      },
    ],
  },
  {
    id: "mot-phien-hoc",
    title: "4. Một phiên học diễn ra thế nào",
    lead: "Phiên chuẩn 30 phút; có thời gian thì thêm 30 phút nữa.",
    blocks: [
      { kind: "text", value: "**Phiên Core — 30 phút:**" },
      {
        kind: "steps",
        items: [
          "**5 phút truy hồi.** Mở phiếu đánh giá, trả lời khi chưa mở tài liệu. Viết sai cũng ghi — đó là dữ liệu về chỗ hổng.",
          "**10 phút hiểu.** Đọc bài giảng tương ứng trong tuần, tính tay một ví dụ nhỏ. Không đọc lướt.",
          "**15 phút tự làm.** Code lát cắt nhỏ nhất trong `soloBuild` + một test biên. Ghi bằng chứng và tự chấm trước khi hết giờ.",
        ],
      },
      {
        kind: "text",
        value:
          "Kết thúc bằng một câu tự hỏi: **“Đổi input hay ràng buộc nào thì cách làm hiện tại sẽ sai?”** " +
          "Trả lời được câu đó mới thật sự hiểu.",
      },
      { kind: "text", value: "**Phiên Deep — thêm 30 phút:** làm đủ Core rồi thêm ít nhất một trong các việc sau." },
      {
        kind: "list",
        items: [
          "Mở rộng từ ví dụ đồ chơi sang batch hoặc dữ liệu thật nhỏ.",
          "So sánh bản tự viết với thư viện trên cùng seed; hoặc làm một ablation.",
          "Thêm property test, gradient check hoặc kiểm tra rò rỉ dữ liệu.",
          "Đo thời gian/bộ nhớ thật thay vì chỉ nói Big-O.",
          "Chạy lại từ đầu (restart & run all) trước khi khóa phiên.",
        ],
      },
      {
        kind: "note",
        tone: "warn",
        title: "Deep không phải là xem thêm video",
        value: "Phần 30 phút thêm phải tạo ra **bằng chứng kỹ thuật mới**, nếu không thì nó không tính.",
      },
    ],
  },
  {
    id: "nhip-tuan",
    title: "5. Nhịp một tuần",
    lead: "Mỗi tuần đúng 7 phiên, lặp lại cố định suốt 41 tuần.",
    blocks: [
      {
        kind: "table",
        head: ["Ngày", "Loại phiên", "Kết quả tối thiểu"],
        rows: [
          ["1–5", "Năm bài khái niệm", "Mỗi ngày một hàm/trace nhỏ kèm test"],
          ["6", "Lab tích hợp", "Sản phẩm đạt đúng tiêu chí đề ra"],
          ["7", "Checkpoint", "Bài đóng tài liệu + tự chấm + kế hoạch sửa"],
        ],
      },
      {
        kind: "text",
        value:
          "**Không đi tiếp chỉ vì đã sang ngày mới.** Checkpoint trượt thì dùng quy tắc làm lại của tuần đó " +
          "và làm lại phần yếu **từ trang trắng**, không sửa vá bài cũ.",
      },
    ],
  },
  {
    id: "solo-90",
    title: "6. Dùng AI tới đâu — quy tắc SOLO-90",
    lead: "Phần quan trọng nhất. Vi phạm là bài nộp mất giá trị làm bằng chứng.",
    blocks: [
      {
        kind: "table",
        head: ["Được phép hỏi AI (sau khi đã tự chạy)", "Không được phép"],
        rows: [
          ["“Kết luận độ phức tạp O(nd) của em đúng không?”", "“Viết hàm này cho em”"],
          ["“Theo traceback này, em sai nhóm shape hay dtype?”", "“Sửa dòng 17 giúp em”"],
          ["“Test biên em đề xuất có kiểm được mutation không?”", "“Cho em pseudocode thuật toán”"],
          ["“Lập luận về rò rỉ dữ liệu của em đúng chưa?”", "“Tối ưu toàn bộ notebook này”"],
        ],
      },
      {
        kind: "text",
        value: "**Cổng 6 ô — chỉ mở AI khi cả sáu ô đều đã có nội dung do bạn tự viết:**",
      },
      {
        kind: "list",
        items: [
          "Đã viết input, output, shape/dtype và ràng buộc.",
          "Đã nêu ít nhất hai trường hợp biên **trước khi** code.",
          "Đã có một bản chạy được, hoặc một lỗi cụ thể.",
          "Đã chạy test và giữ nguyên thông báo lỗi quan sát được.",
          "Đã viết một giả thuyết có thể bác bỏ (không phải “code không chạy”).",
          "Đã tự thử một cách sửa do mình nghĩ ra và ghi lại kết quả.",
        ],
      },
      {
        kind: "note",
        tone: "warn",
        title: "Nếu đã lỡ nhìn thấy lời giải",
        value:
          "Lần nộp đó không còn là bằng chứng SOLO-90. Đóng đáp án lại, ghi vào nhật ký, " +
          "và làm **một biến thể mới từ trang trắng**. Đây là quy tắc tự bảo vệ, không phải hình phạt.",
      },
    ],
  },
  {
    id: "tu-cham",
    title: "7. Tự chấm một bài",
    lead: "Thang 100 điểm, và sáu điều kiện khiến bài bị loại bất kể điểm số.",
    blocks: [
      {
        kind: "table",
        head: ["Hạng mục", "Điểm", "Chấm cái gì"],
        rows: [
          ["Tính đúng", "45", "Tỷ lệ test bắt buộc đã đạt (fresh run mới tính)"],
          ["Giải thích cơ chế", "20", "Input/output, trace, failure mode, nối với metric"],
          ["Test tự viết", "10", "Case thường, biên, property, chống rò rỉ"],
          ["Độ phức tạp", "10", "Thời gian, bộ nhớ, liên hệ ràng buộc"],
          ["Chất lượng & tái lập", "10", "Hợp đồng hàm, seed, chạy lại được"],
          ["Sổ lỗi & phản tư", "5", "Triệu chứng → giả thuyết → thí nghiệm → nguyên nhân"],
        ],
      },
      {
        kind: "text",
        value:
          "**Mức đánh giá:** dưới 70 là chưa đạt (thu nhỏ bài, làm lại) · 75–84 đạt · " +
          "85–94 vững · 95–100 giải thích và tạo biến thể được.",
      },
      {
        kind: "note",
        tone: "warn",
        title: "Sáu điều làm bài bị loại dù đủ điểm",
        value:
          "Không giải thích được từng khối code · không chạy lại được từ trạng thái sạch · " +
          "dùng dữ liệu bị rò rỉ · dùng code do AI sinh · vi phạm ràng buộc đề · " +
          "chỉ pass nhờ trạng thái sót lại từ lần chạy trước.",
      },
    ],
  },
  {
    id: "cong-cu",
    title: "8. Code Arena, Notebook và chấm bài",
    lead: "Ba công cụ thực hành, mỗi cái có giới hạn riêng cần biết trước.",
    blocks: [
      {
        kind: "text",
        value:
          "**Code Arena** (trang Chấm bài): viết Python và chạy test ngay trong trình duyệt, không cần cài Python. " +
          "Lần chạy đầu tiên **cần mạng** và mất khoảng 15–30 giây để tải bộ chạy Python; " +
          "các lần sau nhanh hơn. Mỗi lần chạy giới hạn 8 giây.",
      },
      {
        kind: "text",
        value:
          "**Notebook**: bấm nút mở thẳng trên Google Colab, không cần cài gì. " +
          "Luôn **Restart & Run All** trước khi coi là xong — kết quả chỉ đáng tin khi chạy lại từ đầu vẫn ra như vậy.",
      },
      {
        kind: "note",
        tone: "info",
        title: "Điểm trên web không phải điểm chấm tự động",
        value:
          "Phiếu đánh giá là **tự chấm dựa trên bằng chứng**. Nó không chạy code của bạn và không kiểm tra link. " +
          "Muốn chấm tự động thật thì dùng bộ chấm dòng lệnh trong mã nguồn (cần cài Python trên máy).",
      },
    ],
  },
  {
    id: "tien-do",
    title: "9. Tiến độ được lưu ở đâu",
    lead: "Đọc kỹ mục này, nếu không bạn sẽ mất tiến độ mà không hiểu vì sao.",
    blocks: [
      {
        kind: "text",
        value:
          "Toàn bộ tiến độ lưu **ngay trong trình duyệt của bạn**, không có tài khoản và không đồng bộ lên máy chủ. " +
          "Những thứ sau được **tự động lưu**, không cần bấm nút nào:",
      },
      {
        kind: "list",
        items: [
          "Phiên đã tích hoàn thành ở Lộ trình.",
          "**Bản nháp phiếu đánh giá** — đổi phiên hay tải lại trang đều không mất.",
          "**Code bạn viết trong Code Arena** — lưu riêng cho từng bài, còn nguyên sau khi tải lại trang.",
          "Lịch sử tự chấm, chủ đề Toán đã đánh dấu, và bài thi thử đang làm dở (giữ cả đồng hồ).",
        ],
      },
      {
        kind: "note",
        tone: "info",
        title: "Lỡ tay thì sao?",
        value:
          "Các thao tác xoá đều **hỏi lại trước khi thực hiện**: nút “Khôi phục” trong Code Arena và việc rời khỏi " +
          "bài thi thử đang chạy. Bấm nhầm rồi chọn Huỷ thì bài làm vẫn còn nguyên.",
      },
      {
        kind: "list",
        items: [
          "Đổi máy hoặc đổi trình duyệt = **không thấy tiến độ cũ** (dữ liệu không theo bạn sang máy khác).",
          "Dùng chế độ ẩn danh = mất hết khi đóng cửa sổ.",
          "Xóa dữ liệu duyệt web = mất tiến độ.",
        ],
      },
      {
        kind: "note",
        tone: "warn",
        title: "Cách giữ tiến độ lâu dài",
        value:
          "Bấm **Xuất tiến độ** ở trang Lộ trình và **Xuất attempts JSON** ở trang Đánh giá theo định kỳ (ví dụ mỗi tuần), " +
          "rồi lưu tệp đó vào máy hoặc cloud. Đây là cách duy nhất mang dữ liệu sang thiết bị khác.",
      },
    ],
  },
  {
    id: "su-co",
    title: "10. Xử lý sự cố thường gặp",
    lead: "Bốn lỗi hay gặp nhất và cách xử lý.",
    blocks: [
      {
        kind: "table",
        head: ["Hiện tượng", "Cách xử lý"],
        rows: [
          [
            "Trang hiện chữ trơ trọi, mất màu và bố cục",
            "Trình duyệt còn nhớ bản cũ. Nhấn **Ctrl + F5** để tải lại bỏ bộ nhớ đệm.",
          ],
          [
            "Code Arena báo không tải được Python",
            "Kiểm tra mạng → tắt trình chặn quảng cáo cho trang này → thử trình duyệt khác.",
          ],
          [
            "Code chạy quá 8 giây rồi dừng",
            "Gần như luôn là vòng lặp vô hạn hoặc độ phức tạp quá cao. Thu nhỏ đầu vào rồi thử lại.",
          ],
          [
            "Trang Đánh giá hiện tiêu đề nhưng thiếu đề bài",
            "Mạng chập chờn khi tải chi tiết. Bấm **Thử tải lại** — bản nháp của bạn không bị mất.",
          ],
        ],
      },
    ],
  },
  {
    id: "faq",
    title: "11. Câu hỏi thường gặp",
    lead: "Những câu người mới hay hỏi nhất.",
    blocks: [
      {
        kind: "table",
        head: ["Câu hỏi", "Trả lời"],
        rows: [
          ["Có cần cài phần mềm gì không?", "**Không.** Chỉ cần trình duyệt và mạng. Chỉ khi muốn dùng bộ chấm dòng lệnh mới cần cài Python."],
          ["Có cần đăng ký tài khoản không?", "Không. Không có đăng nhập, và cũng không có dữ liệu nào của bạn gửi lên máy chủ."],
          ["Có tốn phí không?", "Không. Website và notebook trên Colab đều miễn phí."],
          ["Học trên điện thoại được không?", "Đọc thì được, nhưng phần viết code và phòng lab cần màn hình lớn để làm tử tế."],
          ["Bỏ lỡ vài ngày thì sao?", "Đừng học dồn. Bỏ phần mở rộng, giữ phần lõi + một test, rồi đi tiếp theo lịch."],
          ["Bài quá khó thì làm gì?", "Thu nhỏ về ví dụ 1–3 phần tử, tính tay, rồi mới code lại. Vẫn kẹt thì ghi giả thuyết và dùng cổng 6 ô ở mục 6."],
        ],
      },
    ],
  },
];

/**
 * Cổng kiểm tra chạy lúc import: hướng dẫn hỏng theo kiểu im lặng (mục rỗng,
 * bảng lệch số cột) sẽ không làm bản dựng gãy nếu không kiểm ở đây.
 */
export const USER_GUIDE_VALIDATION = (() => {
  const ids = new Set<string>();
  let blocks = 0;
  for (const section of USER_GUIDE_SECTIONS) {
    if (!section.id.trim() || ids.has(section.id)) {
      throw new Error(`Mục hướng dẫn trùng hoặc thiếu id: ${section.id}`);
    }
    ids.add(section.id);
    if (!section.title.trim() || !section.lead.trim()) {
      throw new Error(`Mục ${section.id} thiếu tiêu đề hoặc câu dẫn.`);
    }
    for (const block of section.blocks) {
      blocks += 1;
      if (block.kind === "table") {
        for (const row of block.rows) {
          if (row.length !== block.head.length) {
            throw new Error(
              `Bảng ở mục ${section.id} có hàng ${row.length} ô nhưng tiêu đề ${block.head.length} ô.`,
            );
          }
        }
      }
    }
  }
  if (USER_GUIDE_SECTIONS.length < 5) {
    throw new Error("Hướng dẫn sử dụng quá ngắn để thay thế các tệp cũ.");
  }
  return { sections: USER_GUIDE_SECTIONS.length, blocks };
})();
