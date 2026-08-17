import type { MathModule } from "./types";

/**
 * Xác suất – thống kê ở đúng liều lượng một đề AI hỏi.
 *
 * Cắt phạm vi: không kiểm định giả thuyết đầy đủ, không phân phối t/chi-square,
 * không quy trình lấy mẫu khảo sát. Giữ lại đúng bốn thứ đề hỏi thật: xác suất
 * có điều kiện, Bayes, kỳ vọng–phương sai, và cầu nối từ hợp lý cực đại sang
 * hàm mất mát.
 */
export const PROBABILITY_MODULE: MathModule = {
  id: "probability",
  title: "Xác suất và thống kê",
  purpose:
    "Mọi mô hình phân loại đều xuất ra xác suất, và mọi hàm mất mát chuẩn đều là hợp lý cực đại viết ngược dấu. Đây là module giải thích “vì sao dùng cross-entropy”.",
  prerequisite: "Phân số, phần trăm và tổ hợp $C_n^k$ ở chương trình lớp 11.",
  topics: [
    {
      id: "pr-conditional",
      title: "Xác suất có điều kiện và tính độc lập",
      level: "core",
      examUse:
        "Nền của Bayes, của Naive Bayes và của mọi câu hỏi rò rỉ dữ liệu (data leakage). Đề hay hỏi dưới dạng bảng số liệu nhỏ.",
      keyIdeas: [
        "$P(A\\mid B)$ đọc là: **trong số** các trường hợp $B$ đã xảy ra, bao nhiêu phần cũng có $A$. Mẫu số đã bị thu hẹp lại.",
        "Độc lập nghĩa là biết $B$ không đổi gì về $A$: $P(A\\mid B) = P(A)$, tương đương $P(A\\cap B) = P(A)P(B)$.",
        "Độc lập và xung khắc là **hai chuyện khác nhau**. Hai biến cố xung khắc có xác suất dương thì chắc chắn *không* độc lập.",
      ],
      formulas: [
        {
          latex: "P(A\\mid B) = \\dfrac{P(A\\cap B)}{P(B)},\\quad P(B) > 0",
          reading: "Định nghĩa xác suất có điều kiện: giao chia cho điều kiện.",
        },
        {
          latex: "P(A\\cap B) = P(B)\\,P(A\\mid B)",
          reading: "Quy tắc nhân, viết lại từ định nghĩa; dùng khi đề cho xác suất theo từng bước.",
        },
        {
          latex: "P(B) = \\sum_i P(B \\mid A_i)\\,P(A_i)",
          reading: "Công thức xác suất toàn phần: chia không gian thành các trường hợp rời nhau rồi cộng lại.",
        },
      ],
      worked: {
        prompt:
          "Một lô ảnh có 30% là ảnh ban đêm. Trong ảnh ban đêm, 50% bị mờ. Xác suất một ảnh vừa là ban đêm vừa bị mờ?",
        steps: [
          "Đặt $A$ = ban đêm, $B$ = mờ. Đề cho $P(A) = 0{,}3$ và $P(B\\mid A) = 0{,}5$.",
          "Quy tắc nhân: $P(A\\cap B) = P(A)\\,P(B\\mid A) = 0{,}3 \\cdot 0{,}5$.",
        ],
        answer: "$P(A\\cap B) = 0{,}15$, tức 15%.",
      },
      pitfalls: [
        "Đảo chiều điều kiện: $P(A\\mid B)$ và $P(B\\mid A)$ nói hai chuyện khác nhau và thường khác giá trị.",
        "Nhân xác suất như thể luôn độc lập. Chỉ được viết $P(A\\cap B)=P(A)P(B)$ khi đề đã nói hoặc đã chứng minh độc lập.",
        "Rút mẫu **không** hoàn lại nhưng vẫn tính như có hoàn lại — xác suất lần sau đã đổi vì mẫu số giảm.",
      ],
      drills: [
        {
          id: "pr-cond-d1",
          prompt: "$P(A) = 0{,}3$ và $P(B\\mid A) = 0{,}5$. Tính $P(A\\cap B)$.",
          answer: 0.15,
          tolerance: 0.0001,
          solution: ["$P(A\\cap B) = 0{,}3 \\cdot 0{,}5 = 0{,}15$."],
        },
        {
          id: "pr-cond-d2",
          prompt:
            "$P(A) = 0{,}4$, $P(B) = 0{,}5$, $P(A\\cap B) = 0{,}2$. Tính $P(A\\mid B)$.",
          answer: 0.4,
          tolerance: 0.0001,
          solution: [
            "$P(A\\mid B) = 0{,}2 / 0{,}5 = 0{,}4$.",
            "Bằng đúng $P(A)$, nên hai biến cố này độc lập.",
          ],
        },
        {
          id: "pr-cond-d3",
          prompt:
            "Rút liên tiếp 2 lá từ bộ 52 lá, không hoàn lại. Xác suất cả hai đều là át? (4 chữ số thập phân)",
          answer: 0.0045,
          tolerance: 0.0002,
          solution: [
            "Lần đầu: $4/52$. Sau khi rút một át, còn 3 át trong 51 lá: $3/51$.",
            "$\\dfrac{4}{52}\\cdot\\dfrac{3}{51} = \\dfrac{12}{2652} \\approx 0{,}0045$.",
          ],
        },
      ],
      appearsIn: [
        "Naive Bayes cho phân loại văn bản (tuần 8).",
        "Phát hiện rò rỉ dữ liệu khi chia train/test theo nhóm.",
      ],
    },
    {
      id: "pr-bayes",
      title: "Định lý Bayes và bẫy tỷ lệ nền",
      level: "applied",
      examUse:
        "Bài “xét nghiệm dương tính” là câu xác suất được ra đề nhiều nhất trong mọi kỳ thi AI, và cũng là câu bị sai nhiều nhất.",
      keyIdeas: [
        "Bayes chỉ là viết lại quy tắc nhân theo hai chiều: $P(A\\mid B)P(B) = P(B\\mid A)P(A)$.",
        "Khi bệnh hiếm, số **dương tính giả** áp đảo số dương tính thật, dù độ nhạy rất cao. Đây là bẫy tỷ lệ nền (base rate fallacy).",
        "Cùng một mô hình, đổi tỷ lệ nền là đổi hẳn kết luận. Đó là lý do độ chính xác trên tập mất cân bằng gần như vô nghĩa.",
      ],
      formulas: [
        {
          latex: "P(A\\mid B) = \\dfrac{P(B\\mid A)\\,P(A)}{P(B)}",
          reading: "Dạng gọn: hậu nghiệm bằng hợp lý nhân tiên nghiệm, chia cho bằng chứng.",
        },
        {
          latex:
            "P(A\\mid B) = \\dfrac{P(B\\mid A)P(A)}{P(B\\mid A)P(A) + P(B\\mid \\bar A)P(\\bar A)}",
          reading: "Dạng đầy đủ, khai triển mẫu số bằng xác suất toàn phần — dạng dùng để tính tay.",
        },
      ],
      worked: {
        prompt:
          "Bệnh có tỷ lệ 1%. Xét nghiệm có độ nhạy 99% và độ đặc hiệu 95%. Một người dương tính. Xác suất người đó thật sự mắc bệnh?",
        steps: [
          "Tử số (dương tính thật): $0{,}99 \\cdot 0{,}01 = 0{,}0099$.",
          "Dương tính giả: $(1 - 0{,}95) \\cdot 0{,}99 = 0{,}05 \\cdot 0{,}99 = 0{,}0495$.",
          "Mẫu số: $0{,}0099 + 0{,}0495 = 0{,}0594$.",
          "$P = 0{,}0099 / 0{,}0594 = 1/6 \\approx 0{,}1667$.",
        ],
        answer: "Chỉ khoảng 16,7% — nhỏ hơn nhiều so với trực giác 99%.",
      },
      pitfalls: [
        "Trả lời 99% vì nhầm độ nhạy $P(+\\mid D)$ với xác suất cần tìm $P(D\\mid +)$.",
        "Bỏ quên nhánh dương tính giả trong mẫu số. Với bệnh hiếm, nhánh này chiếm phần lớn tổng.",
        "Cho rằng cải thiện độ nhạy sẽ cứu được kết quả. Ở tỷ lệ nền thấp, thứ quyết định là **độ đặc hiệu**.",
      ],
      drills: [
        {
          id: "pr-bayes-d1",
          prompt:
            "Tỷ lệ nền 1%, độ nhạy 99%, độ đặc hiệu 95%. Tính $P(\\text{bệnh}\\mid +)$ (4 chữ số thập phân).",
          answer: 0.1667,
          tolerance: 0.001,
          solution: ["$\\dfrac{0{,}99\\cdot 0{,}01}{0{,}99\\cdot 0{,}01 + 0{,}05\\cdot 0{,}99} = \\dfrac{0{,}0099}{0{,}0594} \\approx 0{,}1667$."],
        },
        {
          id: "pr-bayes-d2",
          prompt:
            "Giữ nguyên xét nghiệm nhưng tỷ lệ nền là 10%. Tính $P(\\text{bệnh}\\mid +)$ (4 chữ số thập phân).",
          answer: 0.6875,
          tolerance: 0.001,
          solution: [
            "Tử số $0{,}99 \\cdot 0{,}1 = 0{,}099$; dương tính giả $0{,}05 \\cdot 0{,}9 = 0{,}045$.",
            "$0{,}099 / 0{,}144 = 0{,}6875$. Chỉ đổi tiên nghiệm mà kết luận đảo hẳn.",
          ],
        },
        {
          id: "pr-bayes-d3",
          prompt:
            "Bộ lọc thư rác: $P(\\text{rác}) = 0{,}4$, $P(\\text{từ khoá}\\mid \\text{rác}) = 0{,}6$, $P(\\text{từ khoá}\\mid \\text{không rác}) = 0{,}1$. Tính $P(\\text{rác}\\mid \\text{từ khoá})$.",
          answer: 0.8,
          tolerance: 0.001,
          solution: [
            "Tử số $0{,}6 \\cdot 0{,}4 = 0{,}24$; nhánh còn lại $0{,}1 \\cdot 0{,}6 = 0{,}06$.",
            "$0{,}24 / 0{,}30 = 0{,}8$.",
          ],
        },
      ],
      appearsIn: [
        "Chọn ngưỡng phân loại khi lớp dương hiếm (tuần 10).",
        "Giải thích vì sao precision tụt khi triển khai lên dữ liệu thật.",
      ],
    },
    {
      id: "pr-expectation",
      title: "Kỳ vọng, phương sai và quy tắc biến đổi",
      level: "applied",
      examUse:
        "Xuất hiện ở mọi câu hỏi về nhiễu, về batch size và về đánh đổi bias–variance. Ba quy tắc biến đổi dưới đây giải được phần lớn trong số đó.",
      keyIdeas: [
        "Kỳ vọng là trung bình có trọng số theo xác suất — giá trị “trung bình dài hạn”, không nhất thiết là giá trị có thể xảy ra.",
        "Phương sai đo độ tản mát quanh kỳ vọng; độ lệch chuẩn là căn của nó và **cùng đơn vị** với dữ liệu.",
        "Kỳ vọng tuyến tính với mọi biến, kể cả phụ thuộc nhau. Phương sai thì **không**: $\\operatorname{Var}(X+Y)$ chỉ bằng tổng khi hai biến không tương quan.",
      ],
      formulas: [
        {
          latex: "\\mathbb{E}[X] = \\sum_i x_i P(X = x_i)",
          reading: "Kỳ vọng của biến rời rạc: cộng giá trị nhân xác suất.",
        },
        {
          latex: "\\operatorname{Var}(X) = \\mathbb{E}[X^2] - \\bigl(\\mathbb{E}[X]\\bigr)^2",
          reading: "Công thức tính nhanh phương sai; luôn kiểm tra kết quả không âm.",
        },
        {
          latex: "\\operatorname{Var}(aX + b) = a^2\\operatorname{Var}(X)",
          reading: "Dịch chuyển b không đổi độ tản mát; nhân a làm phương sai đổi theo bình phương.",
        },
      ],
      worked: {
        prompt: "Biến $X$ nhận giá trị 0 với xác suất 0,5 và 10 với xác suất 0,5. Tính $\\operatorname{Var}(X)$.",
        steps: [
          "$\\mathbb{E}[X] = 0\\cdot 0{,}5 + 10\\cdot 0{,}5 = 5$.",
          "$\\mathbb{E}[X^2] = 0\\cdot 0{,}5 + 100\\cdot 0{,}5 = 50$.",
          "$\\operatorname{Var}(X) = 50 - 25 = 25$; độ lệch chuẩn $= 5$.",
        ],
        answer: "$\\operatorname{Var}(X) = 25$ — lưu ý giá trị 5 không bao giờ thật sự xảy ra.",
      },
      pitfalls: [
        "Quên bình phương kỳ vọng trong $\\mathbb{E}[X^2] - (\\mathbb{E}[X])^2$ và ra phương sai âm.",
        "Cộng phương sai của hai biến tương quan. Phải thêm $2\\operatorname{Cov}(X,Y)$.",
        "Nhầm $\\operatorname{Var}(aX) = a\\operatorname{Var}(X)$. Hệ số bị **bình phương**, nên nhân dữ liệu với 2 làm phương sai gấp 4.",
      ],
      drills: [
        {
          id: "pr-exp-d1",
          prompt: "$X \\sim \\text{Bernoulli}(0{,}3)$. Tính $\\operatorname{Var}(X)$.",
          answer: 0.21,
          tolerance: 0.0001,
          solution: ["$\\operatorname{Var} = p(1-p) = 0{,}3 \\cdot 0{,}7 = 0{,}21$."],
        },
        {
          id: "pr-exp-d2",
          prompt: "Xúc xắc cân đối 6 mặt. Tính $\\mathbb{E}[X]$.",
          answer: 3.5,
          tolerance: 0.0001,
          solution: ["$(1+2+3+4+5+6)/6 = 21/6 = 3{,}5$."],
        },
        {
          id: "pr-exp-d3",
          prompt: "Biết $\\operatorname{Var}(X) = 9$. Tính $\\operatorname{Var}(2X + 5)$.",
          answer: 36,
          tolerance: 0.0001,
          solution: ["$\\operatorname{Var}(2X+5) = 2^2 \\cdot 9 = 36$; hằng số 5 không ảnh hưởng."],
        },
      ],
      appearsIn: [
        "Chuẩn hoá đặc trưng và batch normalization (tuần 14).",
        "Phân tích bias–variance khi chọn độ phức tạp mô hình.",
      ],
    },
    {
      id: "pr-distributions",
      title: "Ba phân phối phải thuộc",
      level: "applied",
      examUse:
        "Bernoulli mô tả nhãn nhị phân, Binomial mô tả số lần đúng trong n lần, Gaussian mô tả nhiễu và khởi tạo trọng số. Đề chỉ hỏi trong ba cái này.",
      keyIdeas: [
        "Bernoulli là một lần thử; Binomial là $n$ lần thử Bernoulli độc lập cộng lại.",
        "Quy tắc 68–95–99,7 của Gaussian đủ để trả lời mọi câu hỏi “bao nhiêu phần trăm nằm trong $k$ độ lệch chuẩn”.",
        "Gaussian đối xứng và đuôi mỏng, nên nó là giả định **tệ** cho dữ liệu có ngoại lai nặng — một bẫy hay được ra đề.",
      ],
      formulas: [
        {
          latex: "P(X = k) = C_n^k\\, p^k (1-p)^{\\,n-k}",
          reading: "Binomial: chọn k vị trí đúng trong n lần, mỗi cách có xác suất p^k(1-p)^(n-k).",
        },
        {
          latex: "\\mathbb{E}[X] = np, \\qquad \\operatorname{Var}(X) = np(1-p)",
          reading: "Kỳ vọng và phương sai của Binomial; với n = 1 thu về Bernoulli.",
        },
        {
          latex: "P(\\mu - 2\\sigma < X < \\mu + 2\\sigma) \\approx 0{,}95",
          reading: "Quy tắc 2 sigma của phân phối chuẩn — con số hay bị hỏi trực tiếp.",
        },
      ],
      worked: {
        prompt: "Tung đồng xu cân đối 10 lần. Xác suất được đúng 5 mặt ngửa?",
        steps: [
          "$C_{10}^{5} = 252$.",
          "$p^5(1-p)^5 = 0{,}5^{10} = 1/1024$.",
          "$P = 252/1024 \\approx 0{,}2461$.",
        ],
        answer: "Khoảng 24,6% — kết quả “giữa” cũng chỉ chiếm chưa tới một phần tư.",
      },
      pitfalls: [
        "Quên hệ số tổ hợp $C_n^k$ và chỉ nhân xác suất — sai ngay lập tức với mọi $k$ khác 0 và $n$.",
        "Dùng Binomial khi các lần thử không độc lập hoặc $p$ thay đổi giữa các lần.",
        "Áp Gaussian cho đại lượng chỉ nhận giá trị dương (thời gian, giá tiền). Đuôi trái của Gaussian kéo sang số âm.",
      ],
      drills: [
        {
          id: "pr-dist-d1",
          prompt: "$X \\sim \\text{Binomial}(n=20,\\ p=0{,}3)$. Tính $\\mathbb{E}[X]$.",
          answer: 6,
          tolerance: 0.0001,
          solution: ["$np = 20 \\cdot 0{,}3 = 6$."],
        },
        {
          id: "pr-dist-d2",
          prompt: "Tung đồng xu cân đối 10 lần. Tính $P(X = 5)$ (4 chữ số thập phân).",
          answer: 0.2461,
          tolerance: 0.001,
          solution: ["$C_{10}^{5}\\,0{,}5^{10} = 252/1024 \\approx 0{,}2461$."],
        },
        {
          id: "pr-dist-d3",
          prompt:
            "$X$ phân phối chuẩn. Xấp xỉ tỷ lệ giá trị nằm trong khoảng $\\mu \\pm 2\\sigma$ (dạng thập phân).",
          answer: 0.95,
          tolerance: 0.01,
          solution: ["Quy tắc 68–95–99,7: khoảng $\\mu \\pm 2\\sigma$ chứa xấp xỉ 95% giá trị."],
        },
      ],
      appearsIn: [
        "Khởi tạo trọng số He/Xavier dựa trên phương sai (tuần 13).",
        "Sinh dữ liệu giả lập để kiểm tra pipeline trước khi dùng dữ liệu thật.",
      ],
    },
    {
      id: "pr-mle",
      title: "Hợp lý cực đại và nguồn gốc của hàm mất mát",
      level: "advanced",
      examUse:
        "Câu phân loại kinh điển: “vì sao phân loại dùng cross-entropy còn hồi quy dùng MSE?”. Trả lời đúng cần đi từ MLE.",
      keyIdeas: [
        "MLE chọn tham số làm dữ liệu quan sát được trở nên **khả dĩ nhất**. Vì tích nhiều xác suất rất nhỏ, ta tối đa log của nó.",
        "Lấy log rồi đổi dấu biến “tối đa hợp lý” thành “tối thiểu mất mát”. Đó chính là negative log-likelihood.",
        "Giả định Bernoulli cho ra **cross-entropy**; giả định Gaussian với phương sai cố định cho ra **MSE**. Hai hàm mất mát quen thuộc không phải chọn tuỳ tiện.",
      ],
      formulas: [
        {
          latex: "\\hat\\theta = \\arg\\max_{\\theta} \\prod_{i=1}^{n} P(x_i \\mid \\theta)",
          reading: "Định nghĩa MLE: tối đa tích xác suất của toàn bộ dữ liệu theo tham số.",
        },
        {
          latex: "-\\log \\mathcal{L} = -\\sum_{i} \\bigl[y_i\\log p_i + (1-y_i)\\log(1-p_i)\\bigr]",
          reading: "NLL của Bernoulli — đúng bằng binary cross-entropy đang dùng trong code.",
        },
        {
          latex: "\\hat p_{\\text{MLE}} = \\dfrac{\\text{số lần thành công}}{n}, \\qquad \\hat\\mu_{\\text{MLE}} = \\dfrac{1}{n}\\sum_i x_i",
          reading: "Hai nghiệm đóng hay bị hỏi: tần suất mẫu cho Bernoulli, trung bình mẫu cho Gaussian.",
        },
      ],
      worked: {
        prompt: "Quan sát 10 lần thử với 7 lần thành công. Ước lượng hợp lý cực đại của $p$?",
        steps: [
          "Hợp lý: $\\mathcal{L}(p) = p^{7}(1-p)^{3}$.",
          "Lấy log: $\\log\\mathcal{L} = 7\\log p + 3\\log(1-p)$.",
          "Đạo hàm bằng 0: $7/p - 3/(1-p) = 0 \\Rightarrow 7(1-p) = 3p \\Rightarrow p = 7/10$.",
        ],
        answer: "$\\hat p = 0{,}7$ — đúng bằng tần suất quan sát được.",
      },
      pitfalls: [
        "Tối đa tích xác suất trực tiếp bằng máy tính rồi bị tràn dưới (underflow). Luôn làm việc trên log.",
        "Nghĩ MLE luôn không chệch. MLE của phương sai Gaussian chia cho $n$ và **có chệch**; bản không chệch chia cho $n-1$.",
        "Dùng MSE cho bài phân loại nhị phân. Nó vẫn chạy nhưng gradient bị bão hoà, hội tụ chậm hơn hẳn cross-entropy.",
      ],
      drills: [
        {
          id: "pr-mle-d1",
          prompt: "10 lần thử, 7 lần thành công. Tính $\\hat p_{\\text{MLE}}$.",
          answer: 0.7,
          tolerance: 0.0001,
          solution: ["$\\hat p = 7/10 = 0{,}7$."],
        },
        {
          id: "pr-mle-d2",
          prompt: "Mẫu $\\{2, 4, 9\\}$ từ phân phối chuẩn. Tính $\\hat\\mu_{\\text{MLE}}$.",
          answer: 5,
          tolerance: 0.0001,
          solution: ["$\\hat\\mu = (2+4+9)/3 = 15/3 = 5$."],
        },
        {
          id: "pr-mle-d3",
          prompt:
            "Nhãn thật $y = 1$, mô hình dự đoán $p = 0{,}8$. Tính binary cross-entropy của mẫu này (4 chữ số thập phân, dùng $\\ln$).",
          answer: 0.2231,
          tolerance: 0.001,
          solution: [
            "Với $y=1$, công thức rút gọn còn $-\\ln p$.",
            "$-\\ln 0{,}8 \\approx 0{,}2231$.",
          ],
        },
      ],
      appearsIn: [
        "Chọn hàm mất mát khi thiết kế bài toán (tuần 6 và 11).",
        "Giải thích logistic regression như MLE của Bernoulli.",
      ],
    },
  ],
};
