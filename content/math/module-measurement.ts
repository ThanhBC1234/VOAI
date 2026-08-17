import type { MathModule } from "./types";

/**
 * Đo lường: thông tin, chỉ số đánh giá và độ phức tạp.
 *
 * Cắt phạm vi: đây là ba nhóm câu hỏi “tính ra một con số rồi kết luận” mà đề
 * AI hỏi liên tục — entropy/KL, ma trận nhầm lẫn, và ước lượng chi phí tính
 * toán. Không có mã hoá kênh, không có lý thuyết mã, không có phân tích thuật
 * toán tổng quát: những phần đó chưa từng xuất hiện trong đề vòng 1.
 */
export const MEASUREMENT_MODULE: MathModule = {
  id: "measurement",
  title: "Thông tin, chỉ số và độ phức tạp",
  purpose:
    "Ba loại con số bạn phải tính đúng để kết luận đúng: lượng thông tin, chất lượng mô hình, và chi phí chạy.",
  prerequisite: "Logarit cơ số 2 và module Xác suất và thống kê.",
  topics: [
    {
      id: "me-entropy",
      title: "Entropy — đo độ bất định",
      level: "applied",
      examUse:
        "Là tiêu chí chia nhánh của cây quyết định và là nền của cross-entropy. Đề hay cho một phân phối 2–4 giá trị rồi bắt tính.",
      keyIdeas: [
        "Entropy đo **độ bất ngờ trung bình**. Phân phối càng đều, entropy càng cao; chắc chắn hoàn toàn thì entropy bằng 0.",
        "Với $n$ kết quả đồng khả năng, entropy đúng bằng $\\log_2 n$ bit — đây là giá trị lớn nhất có thể.",
        "Quy ước $0\\log 0 = 0$: nhánh có xác suất 0 không đóng góp gì, và trong code phải xử lý riêng để tránh `log(0)`.",
      ],
      formulas: [
        {
          latex: "H(p) = -\\sum_i p_i \\log_2 p_i",
          reading: "Entropy tính bằng bit khi dùng log cơ số 2; đổi sang ln thì đơn vị là nat.",
        },
        {
          latex: "H_{\\max} = \\log_2 n",
          reading: "Cận trên của entropy trên n kết quả, đạt được khi phân phối đều.",
        },
        {
          latex: "IG = H(\\text{cha}) - \\sum_k \\dfrac{n_k}{n} H(\\text{con}_k)",
          reading: "Information gain: entropy trước khi chia trừ entropy trung bình có trọng số sau khi chia.",
        },
      ],
      worked: {
        prompt: "Tính entropy của phân phối $p = (0{,}5;\\ 0{,}25;\\ 0{,}25)$.",
        steps: [
          "$-0{,}5\\log_2 0{,}5 = -0{,}5\\cdot(-1) = 0{,}5$.",
          "$-0{,}25\\log_2 0{,}25 = -0{,}25\\cdot(-2) = 0{,}5$, và nhánh thứ ba cũng vậy.",
          "Cộng lại: $0{,}5 + 0{,}5 + 0{,}5 = 1{,}5$.",
        ],
        answer: "$H = 1{,}5$ bit, nhỏ hơn cận trên $\\log_2 3 \\approx 1{,}585$ vì phân phối không đều.",
      },
      pitfalls: [
        "Quên dấu trừ. Vì $\\log_2 p \\le 0$ với $p \\le 1$, thiếu dấu trừ sẽ ra entropy âm.",
        "Dùng $\\ln$ nhưng vẫn báo đơn vị là bit. $\\ln$ cho nat; $1$ nat $\\approx 1{,}443$ bit.",
        "Cho rằng entropy cao là xấu. Entropy chỉ mô tả độ bất định của dữ liệu, không phải chất lượng mô hình.",
      ],
      drills: [
        {
          id: "me-ent-d1",
          prompt: "Entropy của đồng xu cân đối, tính bằng bit?",
          answer: 1,
          tolerance: 0.0001,
          solution: ["$-2 \\cdot 0{,}5\\log_2 0{,}5 = 1$ bit."],
        },
        {
          id: "me-ent-d2",
          prompt: "Tính entropy (bit) của $p = (0{,}5;\\ 0{,}25;\\ 0{,}25)$.",
          answer: 1.5,
          tolerance: 0.001,
          solution: ["$0{,}5 + 0{,}5 + 0{,}5 = 1{,}5$ bit."],
        },
        {
          id: "me-ent-d3",
          prompt: "Một nút lá chỉ chứa một lớp duy nhất. Entropy của nút đó bằng bao nhiêu?",
          answer: 0,
          tolerance: 0.0001,
          solution: [
            "$p = (1, 0)$, mà $-1\\log_2 1 = 0$ và quy ước $0\\log_2 0 = 0$.",
            "Entropy bằng 0: nút đã thuần khiết, không còn gì để chia.",
          ],
        },
      ],
      appearsIn: [
        "Tiêu chí chia nhánh của Decision Tree và Random Forest (tuần 9).",
        "Đo độ bất định của mô hình khi phân tích lỗi.",
      ],
    },
    {
      id: "me-crossentropy",
      title: "Cross-entropy và KL divergence",
      level: "advanced",
      examUse:
        "Đây là hàm mất mát của mọi bài phân loại. Câu phân loại hay hỏi quan hệ giữa ba đại lượng $H(p)$, $H(p,q)$ và $D_{KL}(p\\|q)$.",
      keyIdeas: [
        "Quan hệ cần thuộc: $H(p, q) = H(p) + D_{KL}(p\\|q)$. Vì $H(p)$ cố định theo dữ liệu, tối thiểu cross-entropy **chính là** tối thiểu KL.",
        "KL luôn $\\ge 0$ và bằng 0 khi và chỉ khi $q$ trùng $p$; nhưng nó **không đối xứng**, nên không phải một khoảng cách.",
        "Với nhãn one-hot, cross-entropy rút gọn còn $-\\log q_{\\text{lớp đúng}}$ — chỉ xác suất của lớp đúng là có ảnh hưởng.",
      ],
      formulas: [
        {
          latex: "H(p, q) = -\\sum_i p_i \\log q_i",
          reading: "Cross-entropy: dùng phân phối thật p làm trọng số, nhưng lấy log của phân phối dự đoán q.",
        },
        {
          latex: "D_{KL}(p\\,\\|\\,q) = \\sum_i p_i \\log\\dfrac{p_i}{q_i} = H(p,q) - H(p)",
          reading: "KL divergence: phần dôi ra của cross-entropy so với entropy thật.",
        },
        {
          latex: "L = -\\log q_{y}",
          reading: "Dạng dùng trong code cho nhãn one-hot: chỉ lấy log xác suất của lớp đúng.",
        },
      ],
      worked: {
        prompt:
          "Nhãn thật $p = (1, 0)$, dự đoán $q = (0{,}8;\\ 0{,}2)$. Tính $H(p,q)$ và $D_{KL}(p\\|q)$ theo bit.",
        steps: [
          "$H(p,q) = -1\\cdot\\log_2 0{,}8 - 0\\cdot\\log_2 0{,}2 = -\\log_2 0{,}8 \\approx 0{,}3219$.",
          "$H(p) = 0$ vì $p$ là phân phối chắc chắn.",
          "$D_{KL} = H(p,q) - H(p) = 0{,}3219 - 0 = 0{,}3219$.",
        ],
        answer: "Cả hai đều $\\approx 0{,}322$ bit — với nhãn one-hot, hai đại lượng này trùng nhau.",
      },
      pitfalls: [
        "Đổi chỗ $p$ và $q$. $D_{KL}(p\\|q) \\ne D_{KL}(q\\|p)$; đề rất hay ra bẫy đúng chỗ này.",
        "Tính $\\log 0$ khi mô hình gán xác suất 0 cho lớp đúng. Trong code phải cắt (clip) xác suất hoặc dùng phiên bản gộp với softmax.",
        "Nghĩ cross-entropy bằng 0 là hoàn hảo. Nó chỉ bằng 0 khi $H(p) = 0$ **và** $q = p$; với nhãn mềm thì cận dưới là $H(p) > 0$.",
      ],
      drills: [
        {
          id: "me-ce-d1",
          prompt: "$p = (1, 0)$, $q = (0{,}8;\\ 0{,}2)$. Tính $H(p,q)$ theo bit (4 chữ số thập phân).",
          answer: 0.3219,
          tolerance: 0.001,
          solution: ["$-\\log_2 0{,}8 = \\log_2 1{,}25 \\approx 0{,}3219$ bit."],
        },
        {
          id: "me-ce-d2",
          prompt:
            "$p = (0{,}5;\\ 0{,}5)$, $q = (0{,}25;\\ 0{,}75)$. Tính $D_{KL}(p\\|q)$ theo bit (4 chữ số thập phân).",
          answer: 0.2075,
          tolerance: 0.002,
          solution: [
            "$0{,}5\\log_2(0{,}5/0{,}25) = 0{,}5 \\cdot 1 = 0{,}5$.",
            "$0{,}5\\log_2(0{,}5/0{,}75) = 0{,}5 \\cdot (-0{,}585) \\approx -0{,}2925$.",
            "Tổng $\\approx 0{,}2075$ bit.",
          ],
        },
        {
          id: "me-ce-d3",
          prompt:
            "Mô hình gán xác suất $0{,}5$ cho lớp đúng trong bài 4 lớp. Cross-entropy của mẫu này theo bit bằng bao nhiêu?",
          answer: 1,
          tolerance: 0.0001,
          solution: ["$-\\log_2 0{,}5 = 1$ bit. Số lớp không ảnh hưởng khi nhãn là one-hot."],
        },
      ],
      appearsIn: [
        "Hàm mất mát của mọi bài phân loại trong lộ trình.",
        "So sánh phân phối sinh ra với phân phối thật ở khối AI tạo sinh.",
      ],
    },
    {
      id: "me-metrics",
      title: "Ma trận nhầm lẫn, precision, recall và F1",
      level: "core",
      examUse:
        "Dạng câu hỏi có mặt gần như chắc chắn: cho bốn ô TP/FP/FN/TN rồi bắt tính. Chỉ cần nhớ đúng mẫu số của từng chỉ số.",
      keyIdeas: [
        "Precision có mẫu số là **những gì mô hình gọi là dương**; recall có mẫu số là **những gì thật sự dương**. Nhớ mẫu số là nhớ hết.",
        "F1 là trung bình điều hoà, nên nó bị kéo xuống bởi chỉ số thấp hơn — khác hẳn trung bình cộng.",
        "Trên dữ liệu mất cân bằng, accuracy có thể rất cao mà mô hình vô dụng: đoán toàn lớp đa số đã đủ đẹp con số.",
      ],
      formulas: [
        {
          latex: "\\text{Precision} = \\dfrac{TP}{TP + FP}, \\qquad \\text{Recall} = \\dfrac{TP}{TP + FN}",
          reading: "Hai chỉ số cốt lõi; chỉ khác nhau ở mẫu số.",
        },
        {
          latex: "F_1 = \\dfrac{2\\,PR}{P + R}",
          reading: "Trung bình điều hoà của precision và recall.",
        },
        {
          latex: "\\text{Accuracy} = \\dfrac{TP + TN}{TP + TN + FP + FN}",
          reading: "Tỷ lệ đoán đúng trên toàn bộ mẫu — chỉ đáng tin khi hai lớp cân bằng.",
        },
      ],
      worked: {
        prompt: "Cho $TP = 40$, $FP = 10$, $FN = 20$, $TN = 930$. Tính precision, recall và F1.",
        steps: [
          "Precision $= 40/(40+10) = 0{,}8$.",
          "Recall $= 40/(40+20) = 40/60 \\approx 0{,}6667$.",
          "$F_1 = 2 \\cdot 0{,}8 \\cdot 0{,}6667 / (0{,}8 + 0{,}6667) \\approx 1{,}0667/1{,}4667 \\approx 0{,}7273$.",
        ],
        answer:
          "P = 0,800; R ≈ 0,667; F1 ≈ 0,727 — trong khi accuracy là 0,970 và che mất toàn bộ vấn đề.",
      },
      pitfalls: [
        "Đảo mẫu số của precision và recall. Cách chống nhầm: precision nhìn **cột dự đoán dương**, recall nhìn **hàng thực tế dương**.",
        "Tính F1 bằng trung bình cộng. Với P = 1,0 và R = 0,0 thì trung bình cộng là 0,5 còn F1 đúng phải là 0.",
        "Báo cáo một con số accuracy trên tập mất cân bằng rồi kết luận mô hình tốt.",
      ],
      drills: [
        {
          id: "me-met-d1",
          prompt: "$TP = 40$, $FP = 10$, $FN = 20$, $TN = 930$. Tính precision.",
          answer: 0.8,
          tolerance: 0.001,
          solution: ["$40/(40+10) = 40/50 = 0{,}8$."],
        },
        {
          id: "me-met-d2",
          prompt: "Cùng ma trận nhầm lẫn đó, tính recall (4 chữ số thập phân).",
          answer: 0.6667,
          tolerance: 0.001,
          solution: ["$40/(40+20) = 40/60 \\approx 0{,}6667$."],
        },
        {
          id: "me-met-d3",
          prompt: "Cùng ma trận nhầm lẫn đó, tính $F_1$ (4 chữ số thập phân).",
          answer: 0.7273,
          tolerance: 0.001,
          solution: [
            "$F_1 = \\dfrac{2 \\cdot 0{,}8 \\cdot 0{,}6667}{0{,}8 + 0{,}6667} \\approx \\dfrac{1{,}0667}{1{,}4667} \\approx 0{,}7273$.",
            "Tương đương $2TP/(2TP + FP + FN) = 80/110$.",
          ],
        },
      ],
      appearsIn: [
        "Báo cáo kết quả của mọi bài phân loại trong hệ thống assessment.",
        "Chọn ngưỡng và vẽ đường PR/ROC (tuần 10).",
      ],
    },
    {
      id: "me-complexity",
      title: "Logarit và độ phức tạp tính toán",
      level: "core",
      examUse:
        "Đề hỏi số phép tính của một lớp mạng, số bước của tìm kiếm nhị phân, hoặc so sánh hai thuật toán. Toàn bộ nằm ở logarit và phép nhân.",
      keyIdeas: [
        "$\\log_2 n$ trả lời câu “chia đôi bao nhiêu lần thì còn 1”. Đó là toàn bộ trực giác cần cho tìm kiếm nhị phân và cây cân bằng.",
        "Big-O giữ lại **số hạng lớn nhất** và bỏ hằng số: $3n^2 + 100n$ là $O(n^2)$.",
        "Chi phí của attention là $O(n^2 d)$ theo độ dài chuỗi — lý do mọi biến thể Transformer dài đều nhắm vào số hạng $n^2$ này.",
      ],
      formulas: [
        {
          latex: "\\log_b(xy) = \\log_b x + \\log_b y, \\qquad \\log_b x^k = k\\log_b x",
          reading: "Hai tính chất logarit dùng nhiều nhất khi rút gọn log-likelihood.",
        },
        {
          latex: "\\log_2 n \\approx 3{,}32 \\log_{10} n",
          reading: "Đổi cơ số nhanh; hữu ích khi máy tính chỉ có log cơ số 10.",
        },
        {
          latex: "\\text{Attention}: O(n^2 d), \\qquad \\text{Linear}(d_{\\text{in}}, d_{\\text{out}}): O(d_{\\text{in}} d_{\\text{out}})",
          reading: "Hai chi phí hay được hỏi trực tiếp trong đề khối NLP.",
        },
      ],
      worked: {
        prompt:
          "Tìm kiếm nhị phân trên mảng đã sắp gồm 1 000 000 phần tử cần tối đa bao nhiêu lần so sánh?",
        steps: [
          "Mỗi bước loại bỏ một nửa, nên số bước là $\\lceil \\log_2 10^6 \\rceil$.",
          "$\\log_2 10^6 = 6\\log_2 10 \\approx 6 \\cdot 3{,}3219 \\approx 19{,}93$.",
          "Làm tròn lên: 20.",
        ],
        answer: "Tối đa 20 lần so sánh — so với 1 000 000 của tìm kiếm tuyến tính.",
      },
      pitfalls: [
        "Giữ lại hằng số trong big-O. $O(2n)$ và $O(n)$ là **một**; viết hằng số vào là hiểu sai ký hiệu.",
        "Nhầm $\\log(x+y)$ với $\\log x + \\log y$. Chỉ có tích mới tách được thành tổng.",
        "So sánh hai thuật toán chỉ bằng big-O ở $n$ nhỏ. Hằng số ẩn có thể đảo ngược kết quả khi dữ liệu bé.",
      ],
      drills: [
        {
          id: "me-cx-d1",
          prompt: "Tính $\\log_2 1024$.",
          answer: 10,
          tolerance: 0.0001,
          solution: ["$2^{10} = 1024$, nên $\\log_2 1024 = 10$."],
        },
        {
          id: "me-cx-d2",
          prompt:
            "Tìm kiếm nhị phân trên 1 000 000 phần tử cần tối đa bao nhiêu lần so sánh (số nguyên)?",
          answer: 20,
          tolerance: 0,
          solution: ["$\\lceil \\log_2 10^6 \\rceil = \\lceil 19{,}93 \\rceil = 20$."],
        },
        {
          id: "me-cx-d3",
          prompt:
            "Self-attention với độ dài chuỗi $n = 512$ và $d = 64$ tốn khoảng bao nhiêu phép tính theo $O(n^2 d)$?",
          answer: 16777216,
          tolerance: 0,
          solution: [
            "$n^2 = 512^2 = 262\\,144$.",
            "$262\\,144 \\cdot 64 = 16\\,777\\,216$ — gấp 512 lần một lớp Linear cùng $d$.",
          ],
        },
      ],
      appearsIn: [
        "Ước lượng chi phí trước khi chọn kiến trúc trong bài thi tổng hợp.",
        "Phân tích vì sao chuỗi dài làm Transformer chậm (khối NLP).",
      ],
    },
  ],
};
