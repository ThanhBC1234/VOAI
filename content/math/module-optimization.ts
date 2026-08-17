import type { MathModule } from "./types";

/**
 * Tối ưu — phần toán trả lời câu “vì sao mô hình không học được”.
 *
 * Cắt phạm vi: không nhân tử Lagrange, không quy hoạch lồi tổng quát, không
 * phương pháp bậc hai đầy đủ. Đề hỏi về learning rate, về cực tiểu địa phương,
 * về momentum/Adam và về regularization — bốn thứ đó là toàn bộ module này.
 */
export const OPTIMIZATION_MODULE: MathModule = {
  id: "optimization",
  title: "Tối ưu và huấn luyện",
  purpose:
    "Biết gradient rồi thì phải biết bước đi bao xa. Module này là cầu nối từ công thức đạo hàm sang vòng lặp huấn luyện thật.",
  prerequisite: "Module Giải tích và gradient.",
  topics: [
    {
      id: "op-gd",
      title: "Gradient descent và learning rate",
      level: "core",
      examUse:
        "Đề cho một hàm một biến, điểm xuất phát và learning rate, rồi bắt tính giá trị sau một vài bước. Dạng này ăn điểm chắc nếu cẩn thận.",
      keyIdeas: [
        "Một bước là: tính gradient tại điểm hiện tại, rồi **trừ** đi learning rate nhân gradient.",
        "Learning rate quá nhỏ thì hội tụ chậm; quá lớn thì bước vọt qua đáy và loss dao động hoặc phân kỳ.",
        "Mọi giá trị dùng trong một bước phải lấy từ **cùng một** điểm; cập nhật xong mới được tính gradient mới.",
      ],
      formulas: [
        {
          latex: "w_{t+1} = w_t - \\eta\\,\\nabla_w L(w_t)",
          reading: "Quy tắc cập nhật: η là learning rate, dấu trừ vì gradient chỉ hướng tăng.",
        },
        {
          latex: "f(w) = w^2 \\Rightarrow w_{t+1} = w_t(1 - 2\\eta)",
          reading: "Với hàm bậc hai đơn giản, một bước chỉ là nhân với hằng số — hội tụ khi |1−2η| < 1, tức 0 < η < 1.",
        },
      ],
      worked: {
        prompt: "Cho $f(w) = w^2$, $w_0 = 4$, $\\eta = 0{,}1$. Tính $w_2$.",
        steps: [
          "$f'(w) = 2w$. Tại $w_0 = 4$: gradient $= 8$.",
          "$w_1 = 4 - 0{,}1\\cdot 8 = 3{,}2$.",
          "Tại $w_1$: gradient $= 6{,}4$, nên $w_2 = 3{,}2 - 0{,}64 = 2{,}56$.",
        ],
        answer: "$w_2 = 2{,}56$; mỗi bước nhân với $1 - 2\\eta = 0{,}8$.",
      },
      pitfalls: [
        "Cộng thay vì trừ gradient — loss sẽ tăng đều, một triệu chứng rất dễ nhận ra khi debug.",
        "Dùng gradient cũ cho bước mới. Sau mỗi lần cập nhật phải tính lại gradient tại điểm mới.",
        "Kết luận “loss tăng nghĩa là code sai”. Learning rate quá lớn cũng cho đúng triệu chứng đó dù code hoàn toàn đúng.",
      ],
      drills: [
        {
          id: "op-gd-d1",
          prompt: "$f(w) = w^2$, $w_0 = 4$, $\\eta = 0{,}1$. Tính $w_2$ (sau hai bước).",
          answer: 2.56,
          tolerance: 0.0001,
          solution: ["$w_1 = 4 \\cdot 0{,}8 = 3{,}2$; $w_2 = 3{,}2 \\cdot 0{,}8 = 2{,}56$."],
        },
        {
          id: "op-gd-d2",
          prompt: "$f(w) = w^2$, $w_0 = 1$, $\\eta = 1{,}5$. Tính $w_1$.",
          answer: -2,
          tolerance: 0.0001,
          solution: [
            "Gradient $= 2$, nên $w_1 = 1 - 1{,}5\\cdot 2 = -2$.",
            "$|w|$ tăng từ 1 lên 2: learning rate quá lớn nên thuật toán phân kỳ.",
          ],
        },
        {
          id: "op-gd-d3",
          prompt:
            "$f(w) = (w-3)^2$, $w_0 = 0$, $\\eta = 0{,}25$. Tính $w_1$.",
          answer: 1.5,
          tolerance: 0.0001,
          solution: [
            "$f'(w) = 2(w-3)$; tại $w_0 = 0$ gradient $= -6$.",
            "$w_1 = 0 - 0{,}25\\cdot(-6) = 1{,}5$ — đi đúng về phía đáy tại $w = 3$.",
          ],
        },
      ],
      appearsIn: [
        "Vòng lặp huấn luyện tự viết trong notebook 01 và 03.",
        "Dò learning rate khi mô hình không hội tụ (tuần 15).",
      ],
    },
    {
      id: "op-convexity",
      title: "Hàm lồi, cực tiểu địa phương và điểm yên ngựa",
      level: "applied",
      examUse:
        "Đề hay hỏi “khi nào gradient descent bảo đảm tìm được nghiệm tốt nhất”. Câu trả lời nằm ở tính lồi.",
      keyIdeas: [
        "Hàm lồi có đúng **một** vùng đáy: mọi cực tiểu địa phương đều là cực tiểu toàn cục.",
        "Hồi quy tuyến tính và logistic regression là bài toán lồi; mạng nơ-ron nhiều tầng thì **không**.",
        "Trong không gian nhiều chiều, chướng ngại chính không phải cực tiểu địa phương mà là **điểm yên ngựa** — nơi gradient bằng 0 nhưng vẫn còn hướng đi xuống.",
      ],
      formulas: [
        {
          latex: "f\\bigl(\\lambda x + (1-\\lambda) y\\bigr) \\le \\lambda f(x) + (1-\\lambda) f(y)",
          reading: "Định nghĩa hàm lồi: dây cung luôn nằm trên hoặc trùng đồ thị, với mọi λ ∈ [0,1].",
        },
        {
          latex: "f''(x) \\ge 0 \\ \\forall x \\iff f \\text{ lồi (một biến)}",
          reading: "Kiểm tra nhanh cho hàm một biến khả vi hai lần: đạo hàm cấp hai không âm.",
        },
      ],
      worked: {
        prompt: "Hàm $f(x) = x^2 - 4x + 7$ có lồi không? Cực tiểu ở đâu và bằng bao nhiêu?",
        steps: [
          "$f''(x) = 2 > 0$ với mọi $x$, nên hàm lồi.",
          "$f'(x) = 2x - 4 = 0 \\Rightarrow x = 2$.",
          "$f(2) = 4 - 8 + 7 = 3$.",
        ],
        answer: "Lồi; cực tiểu toàn cục tại $x = 2$ với giá trị $3$.",
      },
      pitfalls: [
        "Cho rằng “có nhiều cực tiểu địa phương” là lý do chính khiến mạng sâu khó huấn luyện. Ở chiều cao, điểm yên ngựa phổ biến hơn nhiều.",
        "Nghĩ hàm mất mát lồi thì mô hình chắc chắn tốt. Lồi chỉ bảo đảm **tìm được** cực tiểu, không bảo đảm cực tiểu đó khái quát hoá tốt.",
        "Ghép ReLU vào rồi vẫn cho là bài toán lồi. Chỉ cần một tầng ẩn phi tuyến là mất tính lồi.",
      ],
      drills: [
        {
          id: "op-cvx-d1",
          prompt: "Cực tiểu của $f(x) = x^2 - 4x + 7$ đạt tại $x$ bằng bao nhiêu?",
          answer: 2,
          tolerance: 0.0001,
          solution: ["$f'(x) = 2x - 4 = 0 \\Rightarrow x = 2$."],
        },
        {
          id: "op-cvx-d2",
          prompt: "Giá trị nhỏ nhất của $f(x) = x^2 - 4x + 7$ bằng bao nhiêu?",
          answer: 3,
          tolerance: 0.0001,
          solution: ["$f(2) = 4 - 8 + 7 = 3$."],
        },
        {
          id: "op-cvx-d3",
          prompt:
            "Với $f(x) = x^3$, đạo hàm cấp hai tại $x = -1$ bằng bao nhiêu? (Kết quả cho thấy hàm này không lồi trên toàn trục.)",
          answer: -6,
          tolerance: 0.0001,
          solution: [
            "$f''(x) = 6x$, nên $f''(-1) = -6 < 0$.",
            "Có điểm mà đạo hàm cấp hai âm nên hàm không lồi trên $\\mathbb{R}$.",
          ],
        },
      ],
      appearsIn: [
        "So sánh logistic regression với MLP trong cùng một bài (tuần 11–13).",
        "Giải thích vì sao khởi tạo ngẫu nhiên lại quan trọng.",
      ],
    },
    {
      id: "op-momentum",
      title: "Momentum và Adam",
      level: "applied",
      examUse:
        "Đề hỏi công thức cập nhật hoặc hỏi “momentum giúp gì”. Chỉ cần thuộc hai dòng công thức và một câu giải thích.",
      keyIdeas: [
        "Momentum cộng dồn gradient các bước trước, nên nó vượt qua được vùng phẳng và làm dịu dao động ngang.",
        "Adam kết hợp momentum (mô-men bậc nhất) với chuẩn hoá theo độ lớn gradient (mô-men bậc hai), nên mỗi tham số có bước đi riêng.",
        "$\\varepsilon$ trong mẫu số của Adam không phải trang trí: nó chặn phép chia cho 0 khi gradient bằng 0 lâu.",
      ],
      formulas: [
        {
          latex: "v_t = \\beta v_{t-1} + g_t, \\qquad w_{t+1} = w_t - \\eta\\, v_t",
          reading: "Momentum dạng tích luỹ: v là vận tốc, β thường 0,9 — giữ lại 90% vận tốc cũ.",
        },
        {
          latex: "m_t = \\beta_1 m_{t-1} + (1-\\beta_1) g_t, \\qquad v_t = \\beta_2 v_{t-1} + (1-\\beta_2) g_t^2",
          reading: "Hai mô-men của Adam: trung bình trượt của gradient và của bình phương gradient.",
        },
        {
          latex: "w_{t+1} = w_t - \\eta\\,\\dfrac{\\hat m_t}{\\sqrt{\\hat v_t} + \\varepsilon}",
          reading: "Bước Adam sau khi hiệu chỉnh chệch; chia cho căn mô-men bậc hai để chuẩn hoá độ lớn bước đi.",
        },
      ],
      worked: {
        prompt:
          "Momentum với $\\beta = 0{,}9$, $v_0 = 0$. Gradient hai bước đầu đều bằng 2. Tính $v_2$.",
        steps: [
          "$v_1 = 0{,}9\\cdot 0 + 2 = 2$.",
          "$v_2 = 0{,}9\\cdot 2 + 2 = 1{,}8 + 2 = 3{,}8$.",
        ],
        answer: "$v_2 = 3{,}8$ — bước đi lớn gần gấp đôi so với không có momentum.",
      },
      pitfalls: [
        "Bỏ bước hiệu chỉnh chệch của Adam. Ở vài chục bước đầu, $m$ và $v$ bị kéo về 0 nên bước đi sai lệch rõ rệt.",
        "Dùng chung learning rate của SGD cho Adam. Adam thường cần $\\eta$ nhỏ hơn khoảng một bậc.",
        "Nghĩ momentum luôn tốt hơn. Với dữ liệu nhiễu mạnh, momentum có thể vọt qua đáy và làm loss dao động.",
      ],
      drills: [
        {
          id: "op-mom-d1",
          prompt: "Momentum $\\beta = 0{,}9$, $v_0 = 0$, gradient hai bước đều bằng 2. Tính $v_2$.",
          answer: 3.8,
          tolerance: 0.0001,
          solution: ["$v_1 = 2$; $v_2 = 0{,}9\\cdot 2 + 2 = 3{,}8$."],
        },
        {
          id: "op-mom-d2",
          prompt:
            "Adam với $\\beta_1 = 0{,}9$, $m_0 = 0$, gradient bước đầu $g_1 = 4$. Tính $m_1$ (chưa hiệu chỉnh chệch).",
          answer: 0.4,
          tolerance: 0.0001,
          solution: ["$m_1 = 0{,}9\\cdot 0 + 0{,}1\\cdot 4 = 0{,}4$ — nhỏ hơn hẳn gradient thật, đúng là chệch về 0."],
        },
        {
          id: "op-mom-d3",
          prompt:
            "Tiếp bài trên, hiệu chỉnh chệch $\\hat m_1 = m_1/(1-\\beta_1^{1})$. Giá trị $\\hat m_1$ bằng bao nhiêu?",
          answer: 4,
          tolerance: 0.0001,
          solution: [
            "$1 - 0{,}9^1 = 0{,}1$.",
            "$\\hat m_1 = 0{,}4 / 0{,}1 = 4$ — khôi phục đúng gradient thật ở bước đầu.",
          ],
        },
      ],
      appearsIn: [
        "Chọn optimizer khi huấn luyện CNN và Transformer (tuần 18 trở đi).",
        "Giải thích đường loss dao động trong báo cáo thí nghiệm.",
      ],
    },
    {
      id: "op-regularization",
      title: "Regularization L1, L2 và weight decay",
      level: "applied",
      examUse:
        "Câu hỏi overfitting gần như luôn dẫn tới L1/L2. Đề có thể cho vector trọng số rồi bắt tính giá trị phạt.",
      keyIdeas: [
        "Phạt L2 cộng $\\lambda\\|w\\|_2^2$ vào loss: trọng số lớn bị phạt theo bình phương nên bị ép nhỏ đều, hiếm khi về đúng 0.",
        "Phạt L1 cộng $\\lambda\\|w\\|_1$: gradient là hằng số theo dấu, nên nó **đẩy hẳn** nhiều trọng số về 0 — tạo mô hình thưa.",
        "$\\lambda$ lớn quá thì underfit, nhỏ quá thì vô tác dụng. Đây là một siêu tham số phải dò, không có giá trị mặc định đúng.",
      ],
      formulas: [
        {
          latex: "L_{\\text{tổng}} = L_{\\text{dữ liệu}} + \\lambda \\|w\\|_2^2",
          reading: "Ridge / weight decay: cộng bình phương chuẩn L2 của trọng số vào hàm mất mát.",
        },
        {
          latex: "L_{\\text{tổng}} = L_{\\text{dữ liệu}} + \\lambda \\|w\\|_1",
          reading: "Lasso: cộng chuẩn L1, cho nghiệm thưa.",
        },
        {
          latex: "\\dfrac{\\partial}{\\partial w}\\bigl(\\lambda\\|w\\|_2^2\\bigr) = 2\\lambda w",
          reading: "Gradient của phạt L2 tỉ lệ thuận với chính trọng số — chính là “weight decay”.",
        },
      ],
      worked: {
        prompt: "Cho $w = (3, -4)$ và $\\lambda = 0{,}1$. Tính phần phạt L2 và phần phạt L1.",
        steps: [
          "$\\|w\\|_2^2 = 9 + 16 = 25$, nên phạt L2 $= 0{,}1 \\cdot 25 = 2{,}5$.",
          "$\\|w\\|_1 = 3 + 4 = 7$, nên phạt L1 $= 0{,}1 \\cdot 7 = 0{,}7$.",
        ],
        answer: "Phạt L2 = 2,5; phạt L1 = 0,7.",
      },
      pitfalls: [
        "Phạt cả bias. Thông thường chỉ phạt trọng số; phạt bias làm mô hình không dịch chuyển được mức nền.",
        "Nhầm $\\|w\\|_2$ với $\\|w\\|_2^2$. Công thức ridge dùng **bình phương** chuẩn L2, không phải chuẩn.",
        "Quên chuẩn hoá đặc trưng trước khi phạt. Đặc trưng thang đo lớn sẽ có trọng số nhỏ và gần như không bị phạt.",
      ],
      drills: [
        {
          id: "op-reg-d1",
          prompt: "$w = (3, -4)$, $\\lambda = 0{,}1$. Tính phần phạt L2 $\\lambda\\|w\\|_2^2$.",
          answer: 2.5,
          tolerance: 0.0001,
          solution: ["$\\|w\\|_2^2 = 25$; $0{,}1 \\cdot 25 = 2{,}5$."],
        },
        {
          id: "op-reg-d2",
          prompt: "$w = (3, -4)$, $\\lambda = 0{,}1$. Tính phần phạt L1 $\\lambda\\|w\\|_1$.",
          answer: 0.7,
          tolerance: 0.0001,
          solution: ["$\\|w\\|_1 = 7$; $0{,}1 \\cdot 7 = 0{,}7$."],
        },
        {
          id: "op-reg-d3",
          prompt:
            "Với $\\lambda = 0{,}05$ và $w_j = 6$, phần gradient do phạt L2 đóng góp cho $w_j$ bằng bao nhiêu?",
          answer: 0.6,
          tolerance: 0.0001,
          solution: ["$2\\lambda w_j = 2 \\cdot 0{,}05 \\cdot 6 = 0{,}6$."],
        },
      ],
      appearsIn: [
        "Chống overfitting trong bài hồi quy và phân loại (tuần 7 và 16).",
        "Chọn đặc trưng bằng Lasso trước khi huấn luyện mô hình lớn.",
      ],
    },
  ],
};
