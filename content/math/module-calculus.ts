import type { MathModule } from "./types";

/**
 * Giải tích — chỉ giữ đúng phần chạy được backprop và đọc được một đường loss.
 *
 * Cắt phạm vi: không giới hạn theo định nghĩa epsilon–delta, không tích phân,
 * không chuỗi Taylor tổng quát. Đề AI hỏi đạo hàm để suy ra hướng cập nhật
 * trọng số, nên phạm vi dừng ở quy tắc chuỗi, gradient và đạo hàm của các hàm
 * kích hoạt/hàm mất mát đang dùng thật.
 */
export const CALCULUS_MODULE: MathModule = {
  id: "calculus",
  title: "Giải tích và gradient",
  purpose:
    "Huấn luyện chỉ là đi ngược gradient. Phần này cho bạn tính tay được đạo hàm của một mạng nhỏ — dạng câu phân loại hay gặp nhất.",
  prerequisite: "Đạo hàm của đa thức ở chương trình lớp 11–12.",
  topics: [
    {
      id: "ca-rules",
      title: "Đạo hàm cơ bản và ba quy tắc",
      level: "core",
      examUse:
        "Là bước đầu của mọi câu tính gradient. Sai ở đây thì cả bài backprop phía sau sai theo.",
      keyIdeas: [
        "Đạo hàm tại một điểm là **độ dốc** của tiếp tuyến: tăng x thêm một lượng rất nhỏ thì y đổi nhanh chậm ra sao.",
        "Ba hàm phải thuộc trong AI: luỹ thừa, $e^x$ và $\\ln x$. Gần như mọi hàm mất mát đều ghép từ ba hàm này.",
        "Đạo hàm bằng 0 là điều kiện **cần**, không đủ, để có cực trị: điểm yên ngựa cũng có đạo hàm bằng 0.",
      ],
      formulas: [
        {
          latex: "\\dfrac{d}{dx} x^n = n x^{n-1}",
          reading: "Quy tắc luỹ thừa: hạ số mũ xuống làm hệ số rồi giảm mũ đi 1.",
        },
        {
          latex: "\\dfrac{d}{dx} e^{x} = e^{x}, \\qquad \\dfrac{d}{dx}\\ln x = \\dfrac{1}{x}",
          reading: "Hai hàm nền của xác suất và log-loss; e^x là hàm duy nhất bằng đúng đạo hàm của nó.",
        },
        {
          latex: "(uv)' = u'v + uv', \\qquad \\left(\\dfrac{u}{v}\\right)' = \\dfrac{u'v - uv'}{v^2}",
          reading: "Quy tắc tích và quy tắc thương; dùng khi suy ra đạo hàm của sigmoid từ định nghĩa.",
        },
      ],
      worked: {
        prompt: "Cho $f(x) = 3x^4 - 5x^2 + 7$. Tính $f'(2)$.",
        steps: [
          "Đạo hàm từng hạng tử: $f'(x) = 12x^3 - 10x$ (hằng số 7 có đạo hàm bằng 0).",
          "Thay $x = 2$: $12\\cdot 8 - 10\\cdot 2 = 96 - 20$.",
        ],
        answer: "$f'(2) = 76$.",
      },
      pitfalls: [
        "Giữ lại hằng số khi lấy đạo hàm. $+7$ biến mất hoàn toàn, không thành $+7x$.",
        "Viết $\\frac{d}{dx} e^{2x} = e^{2x}$. Còn thiếu quy tắc chuỗi: kết quả đúng là $2e^{2x}$.",
        "Coi “đạo hàm bằng 0” là “đã tìm được điểm tốt nhất”. Trong mạng nơ-ron, đa số điểm dừng không phải cực tiểu toàn cục.",
      ],
      drills: [
        {
          id: "ca-rules-d1",
          prompt: "Cho $f(x) = 3x^4 - 5x^2 + 7$. Tính $f'(2)$.",
          answer: 76,
          tolerance: 0,
          solution: ["$f'(x) = 12x^3 - 10x$; thay $x=2$: $96 - 20 = 76$."],
        },
        {
          id: "ca-rules-d2",
          prompt: "Cho $f(x) = \\ln x$. Tính $f'(4)$.",
          answer: 0.25,
          tolerance: 0.0001,
          solution: ["$f'(x) = 1/x$, nên $f'(4) = 1/4 = 0{,}25$."],
        },
        {
          id: "ca-rules-d3",
          prompt: "Cho $f(x) = e^{2x}$. Tính $f'(1)$ (làm tròn 2 chữ số thập phân).",
          answer: 14.78,
          tolerance: 0.02,
          solution: [
            "Quy tắc chuỗi: $f'(x) = 2e^{2x}$.",
            "$f'(1) = 2e^2 \\approx 2 \\cdot 7{,}389 \\approx 14{,}78$.",
          ],
        },
      ],
      appearsIn: [
        "Suy ra công thức cập nhật của gradient descent (tuần 4–5).",
        "Kiểm tra gradient bằng sai phân hữu hạn khi tự viết layer.",
      ],
    },
    {
      id: "ca-chain",
      title: "Quy tắc chuỗi — hạt nhân của backprop",
      level: "core",
      examUse:
        "Backpropagation **chính là** quy tắc chuỗi áp dụng lặp lại. Đề hay cho một hàm hợp hai–ba tầng rồi bắt tính đạo hàm.",
      keyIdeas: [
        "Đạo hàm của hàm hợp là **tích** các đạo hàm dọc theo chuỗi, không phải tổng.",
        "Cách nhớ an toàn: đặt tên biến trung gian, tính đạo hàm từng chặng, rồi nhân lại. Làm tắt là nguồn lỗi chính.",
        "Vì là phép nhân, nhiều tầng có đạo hàm nhỏ hơn 1 sẽ nhân nhau thành số rất nhỏ — đó là gốc của hiện tượng vanishing gradient.",
      ],
      formulas: [
        {
          latex: "\\dfrac{dy}{dx} = \\dfrac{dy}{du}\\cdot\\dfrac{du}{dx}",
          reading: "Quy tắc chuỗi một biến: nhân đạo hàm ngoài với đạo hàm trong.",
        },
        {
          latex: "\\dfrac{\\partial L}{\\partial w_1} = \\dfrac{\\partial L}{\\partial a_2}\\cdot\\dfrac{\\partial a_2}{\\partial z_2}\\cdot\\dfrac{\\partial z_2}{\\partial a_1}\\cdot\\dfrac{\\partial a_1}{\\partial z_1}\\cdot\\dfrac{\\partial z_1}{\\partial w_1}",
          reading: "Cùng quy tắc đó trải qua hai tầng mạng: mỗi mũi tên trong đồ thị tính toán góp một thừa số.",
        },
      ],
      worked: {
        prompt: "Cho $f(x) = (3x+1)^5$. Tính $f'(1)$.",
        steps: [
          "Đặt $u = 3x + 1$, khi đó $f = u^5$.",
          "$\\dfrac{df}{du} = 5u^4$ và $\\dfrac{du}{dx} = 3$, nên $f'(x) = 15(3x+1)^4$.",
          "Thay $x = 1$: $u = 4$, $f'(1) = 15 \\cdot 4^4 = 15 \\cdot 256$.",
        ],
        answer: "$f'(1) = 3840$.",
      },
      pitfalls: [
        "Quên nhân đạo hàm trong. $((3x+1)^5)' = 5(3x+1)^4$ là thiếu hệ số 3.",
        "Cộng thay vì nhân các chặng. Quy tắc chuỗi luôn là tích; phép cộng chỉ xuất hiện khi một biến đi vào **nhiều** nhánh.",
        "Bỏ quên nhánh thứ hai khi một biến được dùng lại (ví dụ skip connection). Khi đó phải cộng đóng góp của mọi đường đi.",
      ],
      drills: [
        {
          id: "ca-chain-d1",
          prompt: "Cho $f(x) = (3x+1)^5$. Tính $f'(1)$.",
          answer: 3840,
          tolerance: 0,
          solution: ["$f'(x) = 5(3x+1)^4 \\cdot 3 = 15(3x+1)^4$; tại $x=1$: $15\\cdot 256 = 3840$."],
        },
        {
          id: "ca-chain-d2",
          prompt: "Cho $f(x) = e^{x^2}$. Tính $f'(1)$ (2 chữ số thập phân).",
          answer: 5.44,
          tolerance: 0.02,
          solution: [
            "$f'(x) = e^{x^2}\\cdot 2x$.",
            "$f'(1) = 2e \\approx 2 \\cdot 2{,}71828 \\approx 5{,}44$.",
          ],
        },
        {
          id: "ca-chain-d3",
          prompt:
            "Softplus $f(x) = \\ln(1 + e^{x})$. Tính $f'(0)$. (Gợi ý: kết quả là một hàm quen thuộc.)",
          answer: 0.5,
          tolerance: 0.0001,
          solution: [
            "$f'(x) = \\dfrac{e^{x}}{1+e^{x}} = \\sigma(x)$ — đúng bằng hàm sigmoid.",
            "$\\sigma(0) = 1/2 = 0{,}5$.",
          ],
        },
      ],
      appearsIn: [
        "Tự viết backward pass cho MLP trong notebook 03.",
        "Giải thích vì sao mạng sâu dùng ReLU thay vì sigmoid.",
      ],
    },
    {
      id: "ca-gradient",
      title: "Đạo hàm riêng và vector gradient",
      level: "applied",
      examUse:
        "Hàm mất mát luôn phụ thuộc nhiều tham số. Đề cho một hàm hai biến rồi hỏi gradient, hoặc hỏi hướng giảm nhanh nhất.",
      keyIdeas: [
        "Đạo hàm riêng theo $x$: coi mọi biến khác là **hằng số**, rồi lấy đạo hàm như hàm một biến.",
        "Gradient là vector gom mọi đạo hàm riêng. Nó chỉ hướng **tăng** nhanh nhất, nên gradient descent đi theo $-\\nabla$.",
        "Gradient có cùng shape với tham số. Đây là cách kiểm tra nhanh nhất xem code backward có sai shape không.",
      ],
      formulas: [
        {
          latex: "\\nabla f = \\left(\\dfrac{\\partial f}{\\partial x_1}, \\ldots, \\dfrac{\\partial f}{\\partial x_n}\\right)",
          reading: "Gradient: vector các đạo hàm riêng, cùng số chiều với biến đầu vào.",
        },
        {
          latex: "L = (\\hat y - y)^2 \\Rightarrow \\dfrac{\\partial L}{\\partial w} = 2(\\hat y - y)\\,x",
          reading: "Gradient của bình phương sai số theo trọng số của một đặc trưng: hai lần sai số nhân đầu vào.",
        },
      ],
      worked: {
        prompt: "Cho $f(x,y) = x^2 y + 3y^3$. Tính $\\nabla f$ tại $(2, 3)$.",
        steps: [
          "Coi $y$ là hằng: $\\partial f/\\partial x = 2xy$; tại $(2,3)$ được $2\\cdot 2\\cdot 3 = 12$.",
          "Coi $x$ là hằng: $\\partial f/\\partial y = x^2 + 9y^2$; tại $(2,3)$ được $4 + 81 = 85$.",
        ],
        answer: "$\\nabla f(2,3) = (12,\\ 85)$.",
      },
      pitfalls: [
        "Lấy đạo hàm riêng theo $x$ mà vẫn “đạo hàm” luôn $y$. Trong bước đó $y$ là hằng số, tuyệt đối không động vào.",
        "Đi theo $+\\nabla$ khi cập nhật. Gradient chỉ hướng tăng; giảm loss phải trừ đi.",
        "Quên hệ số 2 của bình phương sai số. Nhiều thư viện định nghĩa MSE có $\\frac12$ để triệt tiêu hệ số này — phải đọc kỹ đề dùng bản nào.",
      ],
      drills: [
        {
          id: "ca-grad-d1",
          prompt: "Cho $f(x,y) = x^2 y + 3y^3$. Tính $\\partial f/\\partial y$ tại $(2, 3)$.",
          answer: 85,
          tolerance: 0,
          solution: ["$\\partial f/\\partial y = x^2 + 9y^2 = 4 + 9\\cdot 9 = 85$."],
        },
        {
          id: "ca-grad-d2",
          prompt: "Cho $f(x,y) = x^2 + y^2$. Độ dài $\\|\\nabla f\\|_2$ tại $(3, 4)$ bằng bao nhiêu?",
          answer: 10,
          tolerance: 0.0001,
          solution: [
            "$\\nabla f = (2x, 2y) = (6, 8)$.",
            "$\\|(6,8)\\|_2 = \\sqrt{36+64} = 10$.",
          ],
        },
        {
          id: "ca-grad-d3",
          prompt:
            "Một nơ-ron tuyến tính $\\hat y = wx$ với $x = 2$, $w = 1{,}5$, nhãn $y = 1$, mất mát $L = (\\hat y - y)^2$. Tính $\\partial L/\\partial w$.",
          answer: 8,
          tolerance: 0.0001,
          solution: [
            "$\\hat y = 1{,}5 \\cdot 2 = 3$, sai số $\\hat y - y = 2$.",
            "$\\partial L/\\partial w = 2(\\hat y - y)\\,x = 2 \\cdot 2 \\cdot 2 = 8$.",
          ],
        },
      ],
      appearsIn: [
        "Cài đặt gradient descent thủ công trên hồi quy tuyến tính (notebook 01).",
        "Kiểm tra shape của gradient khi tự viết lớp mới.",
      ],
    },
    {
      id: "ca-activations",
      title: "Đạo hàm của hàm kích hoạt và softmax",
      level: "applied",
      examUse:
        "Câu hỏi kinh điển: “vì sao sigmoid gây vanishing gradient?” và “gradient của softmax + cross-entropy bằng gì?”. Cả hai chỉ cần thuộc hai công thức.",
      keyIdeas: [
        "$\\sigma'(z) = \\sigma(z)(1-\\sigma(z))$ đạt tối đa **0,25** tại $z=0$. Mỗi tầng sigmoid nhân gradient với ≤ 0,25 — vài tầng là gradient gần như biến mất.",
        "ReLU có đạo hàm đúng bằng 1 ở miền dương nên không làm co gradient; đổi lại nơ-ron ở miền âm có đạo hàm 0 và có thể “chết”.",
        "Ghép softmax với cross-entropy cho kết quả cực gọn: $\\partial L/\\partial z = p - y$. Đây là lý do hai hàm này luôn đi cùng nhau trong code.",
      ],
      formulas: [
        {
          latex: "\\sigma(z) = \\dfrac{1}{1+e^{-z}}, \\qquad \\sigma'(z) = \\sigma(z)\\bigl(1-\\sigma(z)\\bigr)",
          reading: "Sigmoid và đạo hàm của nó, viết lại được hoàn toàn qua chính giá trị đầu ra.",
        },
        {
          latex: "\\operatorname{ReLU}'(z) = \\begin{cases} 1 & z > 0 \\\\ 0 & z < 0 \\end{cases}",
          reading: "Đạo hàm ReLU; tại đúng z = 0 hàm không khả vi, thư viện quy ước lấy 0.",
        },
        {
          latex: "p_i = \\dfrac{e^{z_i}}{\\sum_j e^{z_j}}, \\qquad \\dfrac{\\partial L_{\\text{CE}}}{\\partial z} = p - y",
          reading: "Softmax và gradient của cross-entropy theo logit: xác suất dự đoán trừ nhãn one-hot.",
        },
      ],
      worked: {
        prompt: "Cho logits $z = (1, 2, 3)$. Tính $p_3$ của softmax.",
        steps: [
          "$e^1 \\approx 2{,}718$; $e^2 \\approx 7{,}389$; $e^3 \\approx 20{,}086$.",
          "Tổng $\\approx 2{,}718 + 7{,}389 + 20{,}086 = 30{,}193$.",
          "$p_3 = 20{,}086 / 30{,}193 \\approx 0{,}665$.",
        ],
        answer: "$p \\approx (0{,}090;\\ 0{,}245;\\ 0{,}665)$ — tổng bằng 1 như mọi phân phối.",
      },
      pitfalls: [
        "Tính softmax trực tiếp trên logit lớn rồi tràn số. Cách an toàn là trừ đi $\\max_j z_j$ trước khi lấy $e$; giá trị softmax không đổi.",
        "Cho rằng softmax là “chuẩn hoá tuyến tính”. Nó nhân mũ trước, nên chênh lệch nhỏ ở logit thành chênh lệch lớn ở xác suất.",
        "Áp dụng softmax cho bài toán nhiều nhãn cùng lúc. Softmax ép tổng bằng 1 nên loại trừ lẫn nhau; multi-label phải dùng sigmoid từng lớp.",
      ],
      drills: [
        {
          id: "ca-act-d1",
          prompt: "Tính $\\sigma'(0)$ với $\\sigma$ là hàm sigmoid.",
          answer: 0.25,
          tolerance: 0.0001,
          solution: ["$\\sigma(0) = 0{,}5$; $\\sigma'(0) = 0{,}5 \\cdot 0{,}5 = 0{,}25$ — giá trị lớn nhất có thể."],
        },
        {
          id: "ca-act-d2",
          prompt: "Tính $\\sigma'(2)$ (3 chữ số thập phân).",
          answer: 0.105,
          tolerance: 0.001,
          solution: [
            "$\\sigma(2) = 1/(1+e^{-2}) \\approx 0{,}8808$.",
            "$\\sigma'(2) \\approx 0{,}8808 \\cdot 0{,}1192 \\approx 0{,}105$ — đã nhỏ hơn 0,25 rất nhiều.",
          ],
        },
        {
          id: "ca-act-d3",
          prompt: "Với logits $z = (1, 2, 3)$, tính $p_3$ của softmax (3 chữ số thập phân).",
          answer: 0.665,
          tolerance: 0.002,
          solution: [
            "$e^3 \\approx 20{,}086$ và tổng $\\approx 30{,}193$.",
            "$p_3 \\approx 0{,}665$.",
          ],
        },
      ],
      appearsIn: [
        "So sánh ReLU/sigmoid/tanh khi chọn kiến trúc (tuần 13).",
        "Cài đặt cross-entropy ổn định số trong notebook 03 và 05.",
      ],
    },
    {
      id: "ca-backprop",
      title: "Lan truyền ngược trên một mạng nhỏ",
      level: "advanced",
      examUse:
        "Dạng câu phân loại điển hình: cho một mạng hai tầng với số cụ thể, hỏi gradient theo một trọng số. Phải làm được bằng tay, không máy tính.",
      keyIdeas: [
        "Luôn đi **xuôi trước, ngược sau**: tính và ghi lại mọi giá trị trung gian, rồi mới lan ngược.",
        "Mỗi trọng số nhận gradient bằng “tín hiệu lỗi đến nút đó” nhân “đầu vào của nó”. Nhớ đúng một câu này là đủ cho hầu hết bài thi.",
        "Kiểm tra bằng đơn vị: gradient theo $w$ phải cùng shape với $w$; nếu lệch shape thì chắc chắn sai.",
      ],
      formulas: [
        {
          latex: "\\delta^{(L)} = \\dfrac{\\partial L}{\\partial z^{(L)}}, \\qquad \\dfrac{\\partial L}{\\partial W^{(L)}} = \\delta^{(L)} \\bigl(a^{(L-1)}\\bigr)^{\\top}",
          reading: "Tín hiệu lỗi tại tầng L nhân với đầu ra của tầng trước cho gradient của ma trận trọng số tầng L.",
        },
        {
          latex: "\\delta^{(l)} = \\bigl(W^{(l+1)}\\bigr)^{\\top}\\delta^{(l+1)} \\odot f'\\!\\left(z^{(l)}\\right)",
          reading: "Đẩy lỗi về tầng trước: nhân ngược qua trọng số rồi nhân từng phần tử với đạo hàm hàm kích hoạt.",
        },
      ],
      worked: {
        prompt:
          "Mạng: $z_1 = w_1 x$, $a_1 = \\operatorname{ReLU}(z_1)$, $z_2 = w_2 a_1 + b_2$, $L = \\tfrac12 (z_2 - y)^2$. Cho $x=1$, $w_1=2$, $w_2=3$, $b_2=-1$, $y=3$. Tính $\\partial L/\\partial w_1$.",
        steps: [
          "Xuôi: $z_1 = 2$, $a_1 = \\operatorname{ReLU}(2) = 2$, $z_2 = 3\\cdot 2 - 1 = 5$, $L = \\tfrac12(5-3)^2 = 2$.",
          "Ngược tầng 2: $\\partial L/\\partial z_2 = z_2 - y = 2$.",
          "Đẩy về $a_1$: $\\partial L/\\partial a_1 = w_2 \\cdot 2 = 6$.",
          "Qua ReLU: $z_1 = 2 > 0$ nên đạo hàm bằng 1, $\\partial L/\\partial z_1 = 6$.",
          "Tới $w_1$: $\\partial L/\\partial w_1 = 6 \\cdot x = 6$.",
        ],
        answer: "$\\partial L/\\partial w_1 = 6$ (và $\\partial L/\\partial w_2 = 2 \\cdot a_1 = 4$).",
      },
      pitfalls: [
        "Dùng lại giá trị $a_1$ sau khi đã cập nhật trọng số. Mọi gradient phải tính trên **cùng một** lần forward.",
        "Quên đạo hàm ReLU khi $z_1 < 0$. Khi đó toàn bộ nhánh có gradient 0, không phải “gradient nhỏ”.",
        "Nhầm $\\tfrac12(z_2-y)^2$ với $(z_2-y)^2$. Hệ số $\\tfrac12$ làm gradient là $(z_2-y)$ chứ không phải $2(z_2-y)$.",
      ],
      drills: [
        {
          id: "ca-backprop-d1",
          prompt: "Với mạng và số liệu ở ví dụ mẫu, giá trị mất mát $L$ bằng bao nhiêu?",
          answer: 2,
          tolerance: 0.0001,
          solution: ["$z_2 = 5$, $y = 3$, nên $L = \\tfrac12(5-3)^2 = \\tfrac12 \\cdot 4 = 2$."],
        },
        {
          id: "ca-backprop-d2",
          prompt: "Cùng mạng đó, tính $\\partial L/\\partial w_2$.",
          answer: 4,
          tolerance: 0.0001,
          solution: [
            "$\\partial L/\\partial z_2 = z_2 - y = 2$.",
            "$\\partial L/\\partial w_2 = 2 \\cdot a_1 = 2 \\cdot 2 = 4$.",
          ],
        },
        {
          id: "ca-backprop-d3",
          prompt:
            "Vẫn mạng đó nhưng đổi $w_1 = -2$ (giữ nguyên $x=1$). Khi ấy $\\partial L/\\partial w_1$ bằng bao nhiêu?",
          answer: 0,
          tolerance: 0.0001,
          solution: [
            "$z_1 = -2 < 0$ nên $a_1 = 0$ và $\\operatorname{ReLU}'(z_1) = 0$.",
            "Mọi gradient đi qua nhánh này bị nhân với 0: $\\partial L/\\partial w_1 = 0$. Đây đúng là hiện tượng “ReLU chết”.",
          ],
        },
      ],
      appearsIn: [
        "Notebook 03 — tự viết backward pass rồi đối chiếu với autograd.",
        "Chẩn đoán mạng không học: gradient bằng 0 hay gradient bùng nổ.",
      ],
    },
  ],
};
