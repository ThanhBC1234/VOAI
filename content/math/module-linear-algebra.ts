import type { MathModule } from "./types";

/**
 * Đại số tuyến tính — phần chiếm tỷ trọng lớn nhất trong khối Toán của đề AI.
 *
 * Cắt phạm vi: giữ đúng năm nhóm mà một câu hỏi VOAI có thể hỏi trực tiếp —
 * chuẩn, tích vô hướng, nhân ma trận/shape, định thức–hạng–nghịch đảo, trị
 * riêng–PCA. Bỏ hẳn không gian vector trừu tượng, cơ sở trực chuẩn tổng quát và
 * mọi chứng minh: chúng không xuất hiện trong đề và không giúp viết được code.
 */
export const LINEAR_ALGEBRA_MODULE: MathModule = {
  id: "linear-algebra",
  title: "Đại số tuyến tính",
  purpose:
    "Mọi dữ liệu trong bài thi đều là vector hoặc ma trận. Phần này quyết định bạn đọc được shape, tính tay được một phép nhân nhỏ và hiểu PCA đang làm gì.",
  prerequisite: "Cộng, nhân số thực và căn bậc hai. Không cần gì hơn.",
  topics: [
    {
      id: "la-norms",
      title: "Vector và ba chuẩn phải thuộc",
      level: "core",
      examUse:
        "Đề hay cho một vector 2–4 chiều rồi hỏi độ dài, hoặc hỏi regularization L1/L2 phạt cái gì. Cả hai đều là chuẩn.",
      keyIdeas: [
        "Chuẩn là cách biến một vector thành **một** số đo “độ lớn”. Đổi chuẩn là đổi định nghĩa độ lớn, không phải đổi vector.",
        "L2 phạt mạnh thành phần lớn (vì bình phương); L1 phạt đều mọi thành phần nên hay đẩy trọng số về đúng 0.",
        "L∞ chỉ nhìn thành phần lớn nhất — dùng khi cần chặn trường hợp xấu nhất, ví dụ ràng buộc nhiễu adversarial.",
      ],
      formulas: [
        {
          latex: "\\|x\\|_1 = \\sum_{i=1}^{n} |x_i|",
          reading: "Chuẩn L1: cộng trị tuyệt đối của mọi thành phần.",
        },
        {
          latex: "\\|x\\|_2 = \\sqrt{\\sum_{i=1}^{n} x_i^2}",
          reading: "Chuẩn L2 (Euclid): căn bậc hai của tổng bình phương — chính là độ dài hình học.",
        },
        {
          latex: "\\|x\\|_\\infty = \\max_i |x_i|",
          reading: "Chuẩn L∞: thành phần có trị tuyệt đối lớn nhất.",
        },
      ],
      worked: {
        prompt: "Cho $x = (3, -4, 12)$. Tính cả ba chuẩn.",
        steps: [
          "L1: $|3| + |-4| + |12| = 3 + 4 + 12 = 19$.",
          "L2: $\\sqrt{3^2 + (-4)^2 + 12^2} = \\sqrt{9 + 16 + 144} = \\sqrt{169} = 13$.",
          "L∞: lớn nhất trong $\\{3, 4, 12\\}$ là $12$.",
        ],
        answer: "L1 = 19, L2 = 13, L∞ = 12.",
      },
      pitfalls: [
        "Quên căn bậc hai ở L2 và trả lời 169. Tổng bình phương **không** phải chuẩn L2 — nó là bình phương của chuẩn.",
        "Nghĩ L1 luôn nhỏ hơn L2. Ngược lại: với vector nhiều chiều, L1 ≥ L2 luôn đúng, dấu bằng chỉ khi vector có tối đa một thành phần khác 0.",
        "Nhầm “L2 regularization phạt trọng số lớn” thành “L2 làm trọng số bằng 0”. Đẩy về đúng 0 là đặc trưng của L1.",
      ],
      drills: [
        {
          id: "la-norms-d1",
          prompt: "Tính $\\|x\\|_2$ với $x = (-6, 8)$.",
          answer: 10,
          tolerance: 0,
          solution: ["$\\sqrt{(-6)^2 + 8^2} = \\sqrt{36 + 64} = \\sqrt{100} = 10$."],
        },
        {
          id: "la-norms-d2",
          prompt: "Tính $\\|x\\|_1$ với $x = (1, -2, 2, -4)$.",
          answer: 9,
          tolerance: 0,
          solution: ["$1 + 2 + 2 + 4 = 9$. Dấu âm bị trị tuyệt đối xoá trước khi cộng."],
        },
        {
          id: "la-norms-d3",
          prompt:
            "Chuẩn hoá $x = (3, 4)$ thành vector đơn vị theo L2. Thành phần đầu tiên bằng bao nhiêu?",
          answer: 0.6,
          tolerance: 0.001,
          solution: [
            "$\\|x\\|_2 = \\sqrt{9 + 16} = 5$.",
            "Chia từng thành phần cho 5: $(3/5,\\ 4/5) = (0{,}6;\\ 0{,}8)$.",
          ],
        },
      ],
      appearsIn: [
        "Weight decay và so sánh L1/L2 trong hồi quy tuyến tính (tuần 5–7).",
        "Chuẩn hoá embedding trước khi tính độ tương tự (khối NLP).",
      ],
    },
    {
      id: "la-dot-cosine",
      title: "Tích vô hướng và cosine similarity",
      level: "core",
      examUse:
        "Đây là phép toán được hỏi nhiều nhất: nó là một nơ-ron, là attention score, và là thước đo giống nhau giữa hai embedding.",
      keyIdeas: [
        "Tích vô hướng là **một số**, không phải vector. Đây là lỗi đọc đề phổ biến nhất.",
        "Dấu của tích vô hướng cho biết hướng: dương là cùng phía, 0 là vuông góc, âm là ngược phía.",
        "Cosine bỏ hoàn toàn độ dài, chỉ giữ góc. Hai vector khác độ dài mà cùng hướng có cosine đúng bằng 1.",
      ],
      formulas: [
        {
          latex: "a \\cdot b = \\sum_{i=1}^{n} a_i b_i",
          reading: "Nhân từng cặp thành phần cùng vị trí rồi cộng lại; kết quả là một số vô hướng.",
        },
        {
          latex: "a \\cdot b = \\|a\\|_2\\,\\|b\\|_2 \\cos\\theta",
          reading: "Cùng một đại lượng nhìn theo hình học: độ dài nhân độ dài nhân cosin góc giữa hai vector.",
        },
        {
          latex: "\\cos\\theta = \\dfrac{a \\cdot b}{\\|a\\|_2\\,\\|b\\|_2}",
          reading: "Cosine similarity: luôn nằm trong đoạn [-1, 1] vì đã chia hết phần độ dài.",
        },
      ],
      worked: {
        prompt: "Cho $a = (1, 2, 2)$ và $b = (2, 3, 6)$. Tính $a \\cdot b$ và $\\cos\\theta$.",
        steps: [
          "$a \\cdot b = 1\\cdot 2 + 2\\cdot 3 + 2\\cdot 6 = 2 + 6 + 12 = 20$.",
          "$\\|a\\|_2 = \\sqrt{1 + 4 + 4} = 3$ và $\\|b\\|_2 = \\sqrt{4 + 9 + 36} = 7$.",
          "$\\cos\\theta = 20 / (3 \\cdot 7) = 20/21 \\approx 0{,}952$.",
        ],
        answer: "$a \\cdot b = 20$, $\\cos\\theta \\approx 0{,}952$ — hai vector gần cùng hướng.",
      },
      pitfalls: [
        "Trả lời tích vô hướng dưới dạng vector. Phép nhân từng phần tử (Hadamard) mới cho vector; tích vô hướng đã cộng hết lại.",
        "Dùng cosine để kết luận “hai vector bằng nhau”. Cosine bằng 1 chỉ nói cùng hướng: $(1,1)$ và $(100,100)$ có cosine bằng 1.",
        "Quên rằng cosine không xác định khi một vector bằng 0 — mẫu số bằng 0. Trong code phải chặn trường hợp này.",
      ],
      drills: [
        {
          id: "la-dot-d1",
          prompt: "Tính $a \\cdot b$ với $a = (3, 0, 4)$ và $b = (0, 5, 0)$.",
          answer: 0,
          tolerance: 0,
          solution: [
            "$3\\cdot 0 + 0\\cdot 5 + 4\\cdot 0 = 0$.",
            "Bằng 0 nghĩa là hai vector vuông góc, dù cả hai đều khác vector không.",
          ],
        },
        {
          id: "la-dot-d2",
          prompt: "Tính $\\cos\\theta$ giữa $a = (1, 1)$ và $b = (1, 0)$.",
          answer: 0.7071,
          tolerance: 0.001,
          solution: [
            "$a \\cdot b = 1$; $\\|a\\|_2 = \\sqrt 2$; $\\|b\\|_2 = 1$.",
            "$\\cos\\theta = 1/\\sqrt 2 \\approx 0{,}7071$, tương ứng góc 45°.",
          ],
        },
        {
          id: "la-dot-d3",
          prompt: "Tính $\\cos\\theta$ giữa $a = (1, 2, 3)$ và $b = (4, 5, 6)$.",
          answer: 0.9746,
          tolerance: 0.001,
          solution: [
            "$a \\cdot b = 4 + 10 + 18 = 32$.",
            "$\\|a\\|_2 = \\sqrt{14}$, $\\|b\\|_2 = \\sqrt{77}$, nên mẫu số là $\\sqrt{1078} \\approx 32{,}833$.",
            "$\\cos\\theta \\approx 32/32{,}833 \\approx 0{,}9746$.",
          ],
        },
      ],
      appearsIn: [
        "Điểm attention $QK^\\top$ trong Transformer (khối NLP).",
        "Truy hồi văn bản/ảnh bằng cosine similarity trên embedding.",
      ],
    },
    {
      id: "la-matmul",
      title: "Nhân ma trận, shape và broadcasting",
      level: "applied",
      examUse:
        "Câu hỏi shape là dạng ăn điểm chắc nhất và cũng là lỗi runtime số một khi tự code. Đề thường cho hai shape rồi hỏi kết quả hoặc hỏi số phép nhân.",
      keyIdeas: [
        "Quy tắc duy nhất cần nhớ: $(m \\times n)(n \\times p) \\to (m \\times p)$. Hai chiều **trong cùng** phải khớp và biến mất.",
        "Phần tử $C_{ij}$ là tích vô hướng của hàng $i$ của $A$ với cột $j$ của $B$. Không có gì khác.",
        "Broadcasting so shape từ **phải sang trái**: mỗi chiều phải bằng nhau hoặc bằng 1; chiều bằng 1 được nhân bản.",
      ],
      formulas: [
        {
          latex: "C_{ij} = \\sum_{k=1}^{n} A_{ik} B_{kj}",
          reading: "Phần tử hàng i cột j của tích: quét chỉ số chung k qua hàng của A và cột của B.",
        },
        {
          latex: "(m \\times n)\\,(n \\times p) \\rightarrow (m \\times p)",
          reading: "Quy tắc shape. Nếu chiều trong không khớp thì phép nhân không tồn tại, không có ngoại lệ.",
        },
        {
          latex: "\\text{FLOPs}_{\\text{nhân}} = m \\cdot n \\cdot p",
          reading: "Số phép nhân của một matmul dày: mỗi phần tử kết quả tốn n phép nhân, có m·p phần tử.",
        },
      ],
      worked: {
        prompt:
          "Cho $A = \\begin{pmatrix} 1 & 2 & 3 \\\\ 4 & 5 & 6 \\end{pmatrix}$ và $B = \\begin{pmatrix} 7 & 8 \\\\ 9 & 10 \\\\ 11 & 12 \\end{pmatrix}$. Tính $AB$.",
        steps: [
          "Shape: $(2\\times 3)(3\\times 2) \\to (2\\times 2)$. Chiều 3 khớp nên phép nhân hợp lệ.",
          "$C_{11} = 1\\cdot 7 + 2\\cdot 9 + 3\\cdot 11 = 7 + 18 + 33 = 58$.",
          "$C_{12} = 1\\cdot 8 + 2\\cdot 10 + 3\\cdot 12 = 8 + 20 + 36 = 64$.",
          "$C_{21} = 4\\cdot 7 + 5\\cdot 9 + 6\\cdot 11 = 28 + 45 + 66 = 139$.",
          "$C_{22} = 4\\cdot 8 + 5\\cdot 10 + 6\\cdot 12 = 32 + 50 + 72 = 154$.",
        ],
        answer: "$AB = \\begin{pmatrix} 58 & 64 \\\\ 139 & 154 \\end{pmatrix}$.",
      },
      pitfalls: [
        "Coi nhân ma trận là giao hoán. $AB$ và $BA$ thường khác nhau, và rất hay còn không cùng shape.",
        "Nhầm matmul với nhân từng phần tử. Trong NumPy, `A @ B` là matmul còn `A * B` là Hadamard — hai kết quả hoàn toàn khác.",
        "Broadcasting so shape từ trái sang phải. Phải so từ **phải sang trái**: $(32,1,64)$ với $(10,64)$ vẫn hợp lệ và ra $(32,10,64)$.",
      ],
      drills: [
        {
          id: "la-matmul-d1",
          prompt:
            "Một lớp Linear nhân ma trận $(128 \\times 64)$ với $(64 \\times 256)$. Cần bao nhiêu phép nhân?",
          answer: 2097152,
          tolerance: 0,
          solution: [
            "$m\\cdot n\\cdot p = 128 \\cdot 64 \\cdot 256$.",
            "$128 \\cdot 64 = 8192$; $8192 \\cdot 256 = 2\\,097\\,152$.",
          ],
        },
        {
          id: "la-matmul-d2",
          prompt:
            "Với $A$ và $B$ trong ví dụ mẫu ở trên, phần tử $C_{21}$ của $AB$ bằng bao nhiêu?",
          answer: 139,
          tolerance: 0,
          solution: [
            "Hàng 2 của $A$ là $(4,5,6)$; cột 1 của $B$ là $(7,9,11)$.",
            "$4\\cdot 7 + 5\\cdot 9 + 6\\cdot 11 = 28 + 45 + 66 = 139$.",
          ],
        },
        {
          id: "la-matmul-d3",
          prompt:
            "Broadcasting tensor shape $(32, 1, 64)$ với $(1, 10, 64)$. Kết quả có tất cả bao nhiêu phần tử?",
          answer: 20480,
          tolerance: 0,
          solution: [
            "So từ phải sang trái: $64$ với $64$ khớp; $1$ với $10$ nở thành $10$; $32$ với $1$ nở thành $32$.",
            "Shape kết quả $(32, 10, 64)$, tổng $32 \\cdot 10 \\cdot 64 = 20\\,480$ phần tử.",
          ],
        },
      ],
      appearsIn: [
        "Forward pass của mọi lớp Linear/Conv (tuần 12 trở đi).",
        "Ước lượng chi phí tính toán khi so sánh hai kiến trúc.",
      ],
    },
    {
      id: "la-det-rank",
      title: "Định thức, hạng và ma trận nghịch đảo",
      level: "applied",
      examUse:
        "Đề hỏi khi nào hệ phương trình vô nghiệm/vô số nghiệm, khi nào ma trận hiệp phương sai suy biến, và vì sao normal equation của hồi quy tuyến tính hỏng.",
      keyIdeas: [
        "Định thức bằng 0 ⇔ ma trận suy biến ⇔ **không** có nghịch đảo ⇔ các cột phụ thuộc tuyến tính.",
        "Hạng là số cột (hoặc hàng) độc lập tuyến tính. Hạng thiếu nghĩa là dữ liệu có cột thừa, ví dụ hai đặc trưng là bội của nhau.",
        "Với ma trận $2\\times 2$, cả định thức lẫn nghịch đảo đều có công thức đóng — phải thuộc lòng vì đề hay dừng ở cỡ này.",
      ],
      formulas: [
        {
          latex: "\\det\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} = ad - bc",
          reading: "Định thức 2×2: tích đường chéo chính trừ tích đường chéo phụ.",
        },
        {
          latex:
            "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}^{-1} = \\dfrac{1}{ad-bc}\\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix}",
          reading: "Nghịch đảo 2×2: đổi chỗ a với d, đổi dấu b và c, rồi chia cho định thức.",
        },
        {
          latex: "\\operatorname{rank}(A) < \\min(m, n) \\Rightarrow \\det(A^\\top A) = 0",
          reading: "Hạng thiếu kéo theo ma trận Gram suy biến — đây chính là lúc normal equation không giải được.",
        },
      ],
      worked: {
        prompt: "Cho $A = \\begin{pmatrix} 4 & 7 \\\\ 2 & 6 \\end{pmatrix}$. Tính $\\det A$ và $A^{-1}$.",
        steps: [
          "$\\det A = 4\\cdot 6 - 7\\cdot 2 = 24 - 14 = 10 \\neq 0$, nên nghịch đảo tồn tại.",
          "Hoán vị đường chéo và đổi dấu: $\\begin{pmatrix} 6 & -7 \\\\ -2 & 4 \\end{pmatrix}$.",
          "Chia cho 10: $A^{-1} = \\begin{pmatrix} 0{,}6 & -0{,}7 \\\\ -0{,}2 & 0{,}4 \\end{pmatrix}$.",
        ],
        answer: "$\\det A = 10$ và $A^{-1} = \\begin{pmatrix} 0{,}6 & -0{,}7 \\\\ -0{,}2 & 0{,}4 \\end{pmatrix}$.",
      },
      pitfalls: [
        "Quên đổi dấu $b$ và $c$ khi lấy nghịch đảo 2×2 — sai dấu là lỗi phổ biến nhất ở dạng này.",
        "Kết luận “định thức lớn thì ma trận ổn định”. Cái quyết định độ ổn định số là số điều kiện, không phải giá trị định thức.",
        "Nghĩ định thức bằng 0 nghĩa là hệ vô nghiệm. Nó chỉ nghĩa là **không có nghiệm duy nhất**: có thể vô nghiệm, cũng có thể vô số nghiệm.",
      ],
      drills: [
        {
          id: "la-det-d1",
          prompt: "Tính $\\det\\begin{pmatrix} 3 & 8 \\\\ 4 & 6 \\end{pmatrix}$.",
          answer: -14,
          tolerance: 0,
          solution: ["$3\\cdot 6 - 8\\cdot 4 = 18 - 32 = -14$. Định thức âm là bình thường."],
        },
        {
          id: "la-det-d2",
          prompt: "Hạng của $\\begin{pmatrix} 2 & 1 \\\\ 6 & 3 \\end{pmatrix}$ bằng bao nhiêu?",
          answer: 1,
          tolerance: 0,
          solution: [
            "$\\det = 2\\cdot 3 - 1\\cdot 6 = 0$, nên hạng nhỏ hơn 2.",
            "Hàng 2 đúng bằng 3 lần hàng 1, mà ma trận khác 0, nên hạng bằng 1.",
          ],
        },
        {
          id: "la-det-d3",
          prompt:
            "Với $A = \\begin{pmatrix} 4 & 7 \\\\ 2 & 6 \\end{pmatrix}$, phần tử hàng 1 cột 1 của $A^{-1}$ bằng bao nhiêu?",
          answer: 0.6,
          tolerance: 0.001,
          solution: ["$d/\\det = 6/10 = 0{,}6$."],
        },
      ],
      appearsIn: [
        "Nghiệm đóng của hồi quy tuyến tính $(X^\\top X)^{-1}X^\\top y$ (tuần 6).",
        "Phát hiện đặc trưng cộng tuyến trước khi huấn luyện.",
      ],
    },
    {
      id: "la-eigen-pca",
      title: "Trị riêng, vector riêng và PCA",
      level: "advanced",
      examUse:
        "PCA là chủ đề unsupervised được hỏi thường xuyên nhất, và mọi câu hỏi PCA đều quy về trị riêng của ma trận hiệp phương sai.",
      keyIdeas: [
        "$Av = \\lambda v$ nghĩa là: nhân với $A$ chỉ **kéo dãn** $v$, không xoay nó. $\\lambda$ là hệ số kéo dãn.",
        "Tổng trị riêng bằng vết (trace) và tích trị riêng bằng định thức. Hai đẳng thức này giải nhanh phần lớn câu 2×2.",
        "Trong PCA, trị riêng của ma trận hiệp phương sai chính là phương sai được giữ lại theo mỗi trục; tỷ lệ giải thích là $\\lambda_i/\\sum\\lambda$.",
      ],
      formulas: [
        {
          latex: "A v = \\lambda v,\\quad v \\neq 0",
          reading: "Định nghĩa: v là vector riêng, λ là trị riêng tương ứng.",
        },
        {
          latex: "\\lambda^2 - \\operatorname{tr}(A)\\,\\lambda + \\det(A) = 0",
          reading: "Phương trình đặc trưng của ma trận 2×2 — dùng trace và định thức, không cần khai triển tay.",
        },
        {
          latex: "\\text{tỷ lệ giải thích}_i = \\dfrac{\\lambda_i}{\\sum_{j} \\lambda_j}",
          reading: "Phần phương sai mà thành phần chính thứ i giữ lại, tính trên tổng mọi trị riêng.",
        },
      ],
      worked: {
        prompt: "Tìm trị riêng của $A = \\begin{pmatrix} 2 & 1 \\\\ 1 & 2 \\end{pmatrix}$.",
        steps: [
          "$\\operatorname{tr}(A) = 4$ và $\\det(A) = 4 - 1 = 3$.",
          "Phương trình đặc trưng: $\\lambda^2 - 4\\lambda + 3 = 0$.",
          "Nghiệm: $\\lambda = 3$ và $\\lambda = 1$. Kiểm tra: tổng $= 4 = $ trace, tích $= 3 = \\det$. ✓",
        ],
        answer: "$\\lambda_1 = 3$ (vector riêng $(1,1)$), $\\lambda_2 = 1$ (vector riêng $(1,-1)$).",
      },
      pitfalls: [
        "Chạy PCA mà quên chuẩn hoá thang đo. Một đặc trưng đo bằng đơn vị lớn sẽ chiếm trọn thành phần chính đầu tiên chỉ vì đơn vị.",
        "Nghĩ thành phần chính là “đặc trưng quan trọng nhất cho dự đoán”. PCA hoàn toàn không nhìn nhãn: nó tối đa phương sai, không tối đa khả năng phân loại.",
        "Nhân vector riêng với một số rồi cho là vector riêng khác. Mọi bội khác 0 của một vector riêng vẫn là vector riêng của cùng trị riêng đó.",
      ],
      drills: [
        {
          id: "la-eigen-d1",
          prompt: "Trị riêng lớn nhất của $\\begin{pmatrix} 4 & 1 \\\\ 2 & 3 \\end{pmatrix}$ bằng bao nhiêu?",
          answer: 5,
          tolerance: 0,
          solution: [
            "$\\operatorname{tr} = 7$, $\\det = 12 - 2 = 10$.",
            "$\\lambda^2 - 7\\lambda + 10 = 0 \\Rightarrow \\lambda \\in \\{5, 2\\}$.",
          ],
        },
        {
          id: "la-eigen-d2",
          prompt:
            "PCA cho ba trị riêng $\\lambda = (6, 3, 1)$. Thành phần chính thứ nhất giữ lại bao nhiêu phần phương sai? (trả lời dạng thập phân)",
          answer: 0.6,
          tolerance: 0.001,
          solution: ["Tổng phương sai $= 6 + 3 + 1 = 10$; tỷ lệ $= 6/10 = 0{,}6$, tức 60%."],
        },
        {
          id: "la-eigen-d3",
          prompt:
            "Ma trận đối xứng $\\begin{pmatrix} 5 & 2 \\\\ 2 & 5 \\end{pmatrix}$ có trị riêng nhỏ hơn bằng bao nhiêu?",
          answer: 3,
          tolerance: 0,
          solution: [
            "$\\operatorname{tr} = 10$, $\\det = 25 - 4 = 21$.",
            "$\\lambda^2 - 10\\lambda + 21 = 0 \\Rightarrow \\lambda \\in \\{7, 3\\}$; nhỏ hơn là 3.",
          ],
        },
      ],
      appearsIn: [
        "Giảm chiều trước khi cụm hoặc trực quan hoá (tuần 9–10).",
        "Phân tích whitening và ma trận hiệp phương sai trong tiền xử lý ảnh.",
      ],
    },
  ],
};
