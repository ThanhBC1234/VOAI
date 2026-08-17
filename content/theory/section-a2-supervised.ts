/**
 * Section A2 — Học máy có giám sát cổ điển: hồi quy tuyến tính, hồi quy
 * logistic, regularization L1/L2, k-NN, cây quyết định, ensemble và SVM.
 *
 * Mỗi mục syllabus có 5 câu: 1 Nhận biết, 1 Thông hiểu, 2 Vận dụng,
 * 1 Vận dụng cao.
 */

import type { TheoryQuestion } from "./types";

export const sectionA2Questions: readonly TheoryQuestion[] = [
  /* ---------------- linear-regression ---------------- */
  {
    id: "linear-regression-01",
    syllabusId: "linear-regression",
    difficulty: "recall",
    format: "single-choice",
    stem: "Hàm mất mát chuẩn của hồi quy tuyến tính là gì?",
    choices: [
      "Cross-entropy",
      "Sai số bình phương trung bình (MSE)",
      "Hinge loss",
      "Phân kỳ Kullback–Leibler",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: cross-entropy dùng cho bài toán phân loại với đầu ra xác suất.",
      "Đúng: cực tiểu MSE tương đương ước lượng hợp lý cực đại khi nhiễu là Gaussian.",
      "Sai: hinge loss gắn với SVM.",
      "Sai: KL đo khoảng cách giữa hai phân phối, không dùng làm loss hồi quy cơ bản.",
    ],
    explanation:
      "MSE = (1/n)·Σ(yᵢ − ŷᵢ)². Việc bình phương vừa làm hàm khả vi ở mọi điểm, vừa dẫn tới nghiệm dạng đóng qua phương trình chuẩn.",
  },
  {
    id: "linear-regression-02",
    syllabusId: "linear-regression",
    difficulty: "understand",
    format: "single-choice",
    stem: "Vì sao MSE nhạy với điểm ngoại lai hơn MAE?",
    choices: [
      "Vì MSE luôn có giá trị lớn hơn MAE.",
      "Vì sai số được bình phương nên một điểm lệch xa đóng góp phần lớn tổng mất mát và kéo đường hồi quy về phía nó.",
      "Vì MAE không khả vi nên bỏ qua điểm ngoại lai.",
      "Vì MSE chỉ tính trên tập train.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: quan hệ độ lớn phụ thuộc thang đo, và đó không phải nguyên nhân.",
      "Đúng: sai số gấp 10 lần đóng góp gấp 100 lần vào MSE nhưng chỉ gấp 10 lần vào MAE.",
      "Sai: MAE không khả vi tại 0 nhưng vẫn tính đủ mọi điểm.",
      "Sai: cả hai chỉ số đều tính được trên mọi tập.",
    ],
    explanation:
      "Chọn loss là chọn định nghĩa “sai bao nhiêu thì nghiêm trọng”. Dữ liệu có ngoại lai thật (không phải lỗi nhập) thường hợp với MAE hoặc Huber hơn.",
  },
  {
    id: "linear-regression-03",
    syllabusId: "linear-regression",
    difficulty: "apply",
    format: "numeric",
    stem: "Cho `y_true = [2, 4, 6]` và `y_pred = [3, 4, 5]`. Tính MSE.",
    answer: 0.6667,
    tolerance: 0.01,
    calculation: [
      "Sai số từng điểm: 2−3 = −1; 4−4 = 0; 6−5 = 1.",
      "Bình phương: 1; 0; 1. Tổng = 2.",
      "MSE = 2 / 3 ≈ 0.6667.",
    ],
    explanation:
      "Lưu ý MSE chia cho số mẫu chứ không chia cho bậc tự do. RMSE = √0.6667 ≈ 0.816 mới cùng đơn vị với biến mục tiêu.",
  },
  {
    id: "linear-regression-04",
    syllabusId: "linear-regression",
    difficulty: "apply",
    format: "single-choice",
    stem: "Nghiệm chuẩn `w = (XᵀX)⁻¹Xᵀy` không tính được trong trường hợp nào?",
    choices: [
      "Khi số mẫu lớn hơn số đặc trưng.",
      "Khi `XᵀX` suy biến, ví dụ số đặc trưng vượt số mẫu hoặc có cột phụ thuộc tuyến tính.",
      "Khi biến mục tiêu có giá trị âm.",
      "Khi các đặc trưng chưa được chuẩn hoá.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: đây chính là trường hợp thuận lợi, `XᵀX` thường khả nghịch.",
      "Đúng: ma trận không khả nghịch nên nghịch đảo không tồn tại; phải dùng giả nghịch đảo hoặc thêm regularization.",
      "Sai: dấu của `y` không ảnh hưởng tới khả nghịch của `XᵀX`.",
      "Sai: chuẩn hoá ảnh hưởng điều kiện số, nhưng không tự làm ma trận suy biến.",
    ],
    explanation:
      "Ridge sửa đúng vấn đề này: `(XᵀX + λI)` luôn khả nghịch với λ > 0. Đây là lý do thực dụng khiến ridge được dùng cả khi không cần chống overfitting.",
  },
  {
    id: "linear-regression-05",
    syllabusId: "linear-regression",
    difficulty: "advanced",
    format: "single-choice",
    stem: "Hai đặc trưng có tương quan 0.99. Mô hình cho R² cao trên cả train lẫn test, nhưng hệ số của hai đặc trưng rất lớn và trái dấu, đồng thời đổi mạnh khi thêm bớt vài mẫu. Kết luận đúng nhất là gì?",
    choices: [
      "Mô hình đang overfit nặng, phải giảm số đặc trưng ngay.",
      "Đa cộng tuyến làm ước lượng hệ số không ổn định và mất khả năng diễn giải riêng lẻ, trong khi năng lực dự đoán vẫn có thể tốt.",
      "R² cao chứng tỏ hệ số đã đáng tin cậy.",
      "Đây là dấu hiệu dữ liệu bị rò rỉ nhãn.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: hiệu năng test vẫn tốt nên không phải overfitting theo nghĩa thông thường.",
      "Đúng: đa cộng tuyến ảnh hưởng *phương sai của hệ số*, không nhất thiết ảnh hưởng dự đoán.",
      "Sai: R² đo chất lượng khớp tổng thể, không nói gì về độ ổn định của từng hệ số.",
      "Sai: leakage sẽ biểu hiện bằng hiệu năng cao bất thường, không phải bằng hệ số trái dấu.",
    ],
    trap: "Bẫy là phản xạ “hệ số kỳ lạ ⇒ mô hình tệ”. Ở đây mục tiêu dự đoán vẫn đạt; chỉ mục tiêu *diễn giải* mới bị phá vỡ.",
    explanation:
      "Cách xử lý phụ thuộc mục tiêu: cần dự đoán thì dùng ridge để ổn định hệ số; cần diễn giải thì bỏ bớt một trong hai đặc trưng, gộp chúng, hoặc dùng PCA. Kiểm tra bằng VIF.",
  },

  /* ---------------- logistic-regression ---------------- */
  {
    id: "logistic-regression-01",
    syllabusId: "logistic-regression",
    difficulty: "recall",
    format: "single-choice",
    stem: "Hàm sigmoid trong hồi quy logistic ánh xạ đầu vào thực về khoảng nào?",
    choices: ["[−1, 1]", "(0, 1)", "[0, ∞)", "(−∞, ∞)"],
    answerIndex: 1,
    choiceNotes: [
      "Sai: đó là khoảng giá trị của tanh.",
      "Đúng: σ(z) = 1/(1+e^{−z}) nhận giá trị trong (0, 1), diễn giải được như xác suất.",
      "Sai: đó là khoảng giá trị của ReLU.",
      "Sai: đó là miền xác định chứ không phải miền giá trị.",
    ],
    explanation:
      "Sigmoid không bao giờ đạt đúng 0 hoặc 1, nên log loss luôn hữu hạn — trừ khi cài đặt số học bị tràn và làm tròn về biên.",
  },
  {
    id: "logistic-regression-02",
    syllabusId: "logistic-regression",
    difficulty: "understand",
    format: "single-choice",
    stem: "Vì sao hồi quy logistic dùng cross-entropy thay vì MSE?",
    choices: [
      "Vì MSE không tính được với đầu ra xác suất.",
      "Vì kết hợp MSE với sigmoid cho hàm mất mát không lồi theo tham số và gradient tắt dần khi dự đoán sai chắc chắn, trong khi cross-entropy giữ được gradient lớn.",
      "Vì cross-entropy luôn cho giá trị nhỏ hơn MSE.",
      "Vì MSE chỉ dùng được khi nhãn là số thực dương.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: về mặt tính toán vẫn tính được, chỉ là tối ưu kém.",
      "Đúng: với cross-entropy, gradient theo z rút gọn thành (p − y), luôn tỷ lệ với mức sai.",
      "Sai: độ lớn giá trị loss không phải tiêu chí chọn.",
      "Sai: MSE không có ràng buộc đó.",
    ],
    explanation:
      "Điểm mấu chốt: khi mô hình dự đoán 0.99 cho một mẫu nhãn 0, MSE ghép sigmoid cho gradient gần 0 (kẹt), còn cross-entropy cho gradient lớn để sửa nhanh.",
  },
  {
    id: "logistic-regression-03",
    syllabusId: "logistic-regression",
    difficulty: "apply",
    format: "numeric",
    stem: "Mô hình có `w = [1, −2]`, `b = −1`. Với `x = [3, 1]`, xác suất dự đoán cho lớp dương là bao nhiêu?",
    answer: 0.5,
    tolerance: 0.001,
    calculation: [
      "z = w·x + b = 1×3 + (−2)×1 + (−1) = 3 − 2 − 1 = 0.",
      "σ(0) = 1/(1 + e⁰) = 1/2 = 0.5.",
    ],
    explanation:
      "z = 0 chính là ranh giới quyết định với ngưỡng 0.5. Mọi điểm thoả `w·x + b = 0` nằm trên siêu phẳng phân tách.",
  },
  {
    id: "logistic-regression-04",
    syllabusId: "logistic-regression",
    difficulty: "apply",
    format: "single-choice",
    stem: "Hạ ngưỡng phân loại từ 0.5 xuống 0.3 thì điều gì xảy ra?",
    choices: [
      "Recall của lớp dương tăng (hoặc giữ nguyên), precision thường giảm.",
      "Cả precision và recall đều tăng.",
      "Accuracy chắc chắn tăng.",
      "Không có gì thay đổi vì mô hình không được huấn luyện lại.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: nhiều mẫu được gán nhãn dương hơn nên bắt được nhiều dương thật hơn, kèm nhiều dương giả hơn.",
      "Sai: hai chỉ số này đánh đổi nhau khi trượt ngưỡng.",
      "Sai: accuracy có thể giảm, nhất là khi lớp dương hiếm.",
      "Sai: ngưỡng là bước hậu xử lý, đổi ngưỡng đổi ngay nhãn dự đoán.",
    ],
    explanation:
      "Xác suất và ngưỡng là hai quyết định tách rời. Đường ROC/PR chính là quỹ tích của mô hình khi quét toàn bộ ngưỡng.",
  },
  {
    id: "logistic-regression-05",
    syllabusId: "logistic-regression",
    difficulty: "advanced",
    format: "true-false-set",
    stem: "Xét bản chất của hồi quy logistic.",
    statements: [
      {
        text: "Ranh giới quyết định của hồi quy logistic trên không gian đặc trưng gốc là một siêu phẳng.",
        answer: true,
        note: "Vì ngưỡng trên σ(w·x+b) tương đương ngưỡng trên chính w·x+b, vốn tuyến tính.",
      },
      {
        text: "Hồi quy logistic tuyến tính theo log-odds của xác suất.",
        answer: true,
        note: "log(p/(1−p)) = w·x + b; đây là lý do nó thuộc họ mô hình tuyến tính suy rộng.",
      },
      {
        text: "Với đặc trưng gốc `x₁, x₂`, hồi quy logistic học được hàm XOR.",
        answer: false,
        note: "XOR không tách được tuyến tính; phải thêm đặc trưng tương tác như x₁·x₂ thì mới giải được.",
      },
      {
        text: "Tên gọi có chữ “hồi quy” nên nó là mô hình dự đoán giá trị liên tục, không dùng cho phân loại.",
        answer: false,
        note: "Nó dự đoán một xác suất liên tục nhưng phục vụ bài toán phân loại; tên gọi đến từ việc hồi quy trên log-odds.",
      },
    ],
    trap: "Ý (a) và (c) phải trả lời nhất quán: ranh giới tuyến tính chính là lý do XOR bất khả thi. Trả lời (a) đúng nhưng (c) cũng đúng là mâu thuẫn nội tại.",
    explanation:
      "Hồi quy logistic tuyến tính trong không gian đặc trưng *được cung cấp*. Mọi khả năng phi tuyến đều phải đến từ đặc trưng do bạn tạo ra.",
  },

  /* ---------------- l1-l2 ---------------- */
  {
    id: "l1-l2-01",
    syllabusId: "l1-l2",
    difficulty: "recall",
    format: "single-choice",
    stem: "Số hạng phạt của L1 và L2 lần lượt là gì?",
    choices: [
      "L1: λ·Σ|wⱼ| ; L2: λ·Σwⱼ²",
      "L1: λ·Σwⱼ² ; L2: λ·Σ|wⱼ|",
      "Cả hai đều là λ·Σ|wⱼ|, chỉ khác cách chọn λ.",
      "L1: λ·max|wⱼ| ; L2: λ·Σwⱼ",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: L1 phạt theo chuẩn 1, L2 phạt theo bình phương chuẩn 2.",
      "Sai: đảo ngược hai định nghĩa.",
      "Sai: hai chuẩn khác nhau về bản chất hình học.",
      "Sai: đó là chuẩn vô cùng và tổng có dấu, không phải L1/L2.",
    ],
    explanation:
      "Quy ước quan trọng: hệ số chặn `b` thường **không** bị phạt, vì phạt nó sẽ ràng buộc mức nền của dự đoán một cách vô lý.",
  },
  {
    id: "l1-l2-02",
    syllabusId: "l1-l2",
    difficulty: "understand",
    format: "single-choice",
    stem: "Vì sao L1 tạo ra nghiệm thưa (nhiều hệ số đúng bằng 0) còn L2 thì không?",
    choices: [
      "Vì L1 có giá trị phạt lớn hơn L2 với mọi w.",
      "Vì vùng ràng buộc của L1 là hình thoi có góc nhọn nằm trên các trục toạ độ, nên nghiệm tối ưu dễ rơi đúng vào góc, tức một số toạ độ bằng 0.",
      "Vì L1 chỉ áp dụng cho đặc trưng hạng mục.",
      "Vì L2 không khả vi tại 0.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: với |w| < 1 thì w² còn nhỏ hơn |w|; độ lớn không phải nguyên nhân.",
      "Đúng: đây là giải thích hình học chuẩn — hình thoi có góc, hình tròn thì không.",
      "Sai: L1 áp cho hệ số của mọi loại đặc trưng.",
      "Sai: ngược lại — chính L1 mới không khả vi tại 0, và điều đó liên quan tới tính thưa.",
    ],
    explanation:
      "Cách nhìn khác qua gradient: đạo hàm của L1 là ±λ không đổi, đủ sức đẩy hệ số nhỏ về đúng 0; đạo hàm của L2 là 2λw, co lại khi w nhỏ nên không bao giờ về hẳn 0.",
  },
  {
    id: "l1-l2-03",
    syllabusId: "l1-l2",
    difficulty: "apply",
    format: "numeric",
    stem: "Với `w = [3, −4]` và λ = 2, số hạng phạt L1 (λ·Σ|wⱼ|) bằng bao nhiêu?",
    answer: 14,
    tolerance: 0,
    calculation: ["Σ|wⱼ| = |3| + |−4| = 7.", "Phạt = λ × 7 = 2 × 7 = 14."],
    explanation:
      "Đối chiếu: phạt L2 với cùng w và λ sẽ là 2 × (9 + 16) = 50. Hai chuẩn phạt rất khác nhau khi hệ số lớn, nên λ tối ưu của L1 và L2 không so sánh trực tiếp được.",
  },
  {
    id: "l1-l2-04",
    syllabusId: "l1-l2",
    difficulty: "apply",
    format: "single-choice",
    stem: "Tăng λ từ 0.01 lên 10 trong ridge regression thì bias và variance của mô hình thay đổi thế nào?",
    choices: [
      "Bias giảm, variance tăng.",
      "Bias tăng, variance giảm.",
      "Cả hai cùng tăng.",
      "Cả hai cùng giảm.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: đây là hướng khi *giảm* λ.",
      "Đúng: phạt mạnh kéo hệ số về 0, mô hình đơn giản hơn nên ổn định hơn nhưng khớp dữ liệu kém hơn.",
      "Sai: regularization là công cụ đánh đổi, không làm xấu cả hai phía.",
      "Sai: nếu có λ làm giảm cả hai thì λ = 0 đã không bao giờ được dùng.",
    ],
    explanation:
      "λ là núm điều chỉnh trực tiếp trên đường cong bias–variance. λ → ∞ cho mô hình hằng số: variance bằng 0, bias cực đại.",
  },
  {
    id: "l1-l2-05",
    syllabusId: "l1-l2",
    difficulty: "advanced",
    format: "multi-select",
    stem: "Chọn tất cả phát biểu đúng về regularization.",
    choices: [
      "Phải chuẩn hoá đặc trưng trước khi phạt, nếu không đặc trưng có thang đo lớn sẽ bị phạt nhẹ hơn một cách tuỳ tiện.",
      "Với hai đặc trưng tương quan mạnh, L1 có xu hướng chọn một và loại bỏ cái còn lại, còn L2 chia đều hệ số cho cả hai.",
      "Elastic Net kết hợp L1 và L2 để vừa có tính thưa vừa xử lý ổn định nhóm đặc trưng tương quan.",
      "Regularization luôn cải thiện hiệu năng trên tập test.",
      "Hệ số chặn thường không được đưa vào số hạng phạt.",
    ],
    answerIndexes: [0, 1, 2, 4],
    choiceNotes: [
      "Đúng: hệ số của đặc trưng đo bằng đơn vị lớn tự nhiên sẽ nhỏ, nên chịu phạt ít hơn dù tầm quan trọng như nhau.",
      "Đúng: đây là hành vi đã biết của lasso với nhóm đặc trưng tương quan.",
      "Đúng: chính là động cơ ra đời của Elastic Net.",
      "Sai: nếu mô hình đang underfit, thêm phạt còn làm tệ hơn; λ phải chọn bằng validation.",
      "Đúng: phạt hệ số chặn sẽ ràng buộc giá trị trung bình của dự đoán một cách vô lý.",
    ],
    scoring: "all-or-nothing",
    trap: "Phương án thứ tư là bẫy kinh điển: regularization được dạy như “cách chống overfitting” nên dễ bị hiểu thành luôn tốt. Nó chỉ có ích khi variance đang là vấn đề.",
    explanation:
      "Ba điều phải nhớ khi dùng phạt: chuẩn hoá trước, không phạt bias, và chọn λ bằng validation chứ không theo mặc định.",
  },

  /* ---------------- knn ---------------- */
  {
    id: "knn-01",
    syllabusId: "knn",
    difficulty: "recall",
    format: "single-choice",
    stem: "Vì sao k-NN được gọi là “lazy learner”?",
    choices: [
      "Vì nó hội tụ chậm hơn các mô hình khác.",
      "Vì nó không xây dựng mô hình trong giai đoạn huấn luyện mà chỉ lưu dữ liệu, dồn toàn bộ tính toán sang lúc dự đoán.",
      "Vì nó chỉ dùng được với tập dữ liệu nhỏ.",
      "Vì nó bỏ qua các mẫu ở xa.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: k-NN không có quá trình tối ưu lặp nên không nói tới tốc độ hội tụ.",
      "Đúng: `fit` gần như chỉ là lưu trữ; chi phí nằm ở `predict`.",
      "Sai: đó là hệ quả thực dụng, không phải định nghĩa.",
      "Sai: nó phải tính khoảng cách tới mọi mẫu rồi mới biết mẫu nào ở xa.",
    ],
    explanation:
      "Hệ quả trực tiếp: huấn luyện O(1) nhưng mỗi lần dự đoán tốn O(n·d). Với tập lớn phải dùng KD-tree, Ball-tree hoặc tìm kiếm láng giềng xấp xỉ.",
  },
  {
    id: "knn-02",
    syllabusId: "knn",
    difficulty: "understand",
    format: "single-choice",
    stem: "Tăng k trong k-NN từ 1 lên 50 ảnh hưởng thế nào tới ranh giới quyết định?",
    choices: [
      "Ranh giới gồ ghề hơn, mô hình nhạy nhiễu hơn.",
      "Ranh giới mượt hơn: variance giảm, bias tăng.",
      "Ranh giới không đổi, chỉ tốc độ dự đoán thay đổi.",
      "Mô hình trở thành tuyến tính.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: đó là hướng khi k *giảm*; k = 1 cho ranh giới gồ ghề nhất.",
      "Đúng: lấy phiếu từ nhiều láng giềng làm trung bình hoá nhiễu cục bộ.",
      "Sai: k trực tiếp quyết định hình dạng ranh giới.",
      "Sai: k rất lớn cho mô hình gần như hằng số (đoán lớp đa số), không phải tuyến tính.",
    ],
    explanation:
      "k = 1 luôn đạt accuracy 100% trên chính tập train — bằng chứng rõ ràng rằng điểm train không đo được năng lực tổng quát hoá.",
  },
  {
    id: "knn-03",
    syllabusId: "knn",
    difficulty: "apply",
    format: "single-choice",
    stem: "Các láng giềng của một điểm cần dự đoán, sắp theo (khoảng cách, nhãn): (0.1, A), (0.2, B), (0.3, B), (0.9, A), (1.2, A). Với k = 3 và bỏ phiếu đa số không trọng số, nhãn dự đoán là gì?",
    choices: ["A", "B", "Hoà, không quyết định được", "Phụ thuộc thang đo đặc trưng"],
    answerIndex: 1,
    choiceNotes: [
      "Sai: A chỉ chiếm 1 trong 3 láng giềng gần nhất.",
      "Đúng: ba láng giềng gần nhất là (0.1, A), (0.2, B), (0.3, B) → B thắng 2–1.",
      "Sai: 2–1 không phải thế hoà.",
      "Sai: khoảng cách đã cho sẵn nên không cần bàn tới thang đo ở bước này.",
    ],
    explanation:
      "Chú ý chỉ lấy đúng k láng giềng *gần nhất*; hai điểm A ở xa (0.9 và 1.2) hoàn toàn không tham gia bỏ phiếu. Đáng chú ý là bỏ phiếu **có trọng số 1/d** lại đảo ngược kết quả: A được 1/0.1 = 10 điểm, còn B chỉ được 1/0.2 + 1/0.3 ≈ 8.33, nên A thắng. Cùng một tập láng giềng mà đổi quy tắc bỏ phiếu là đổi nhãn dự đoán — vì thế quy tắc bỏ phiếu phải được nêu rõ trong contract.",
  },
  {
    id: "knn-04",
    syllabusId: "knn",
    difficulty: "apply",
    format: "single-choice",
    stem: "Dữ liệu có hai đặc trưng: “tuổi” (18–70) và “thu nhập” (5.000.000–100.000.000). Dùng k-NN với khoảng cách Euclid mà không chuẩn hoá thì hậu quả là gì?",
    choices: [
      "Không sao, vì Euclid xử lý được mọi thang đo.",
      "Khoảng cách gần như chỉ do thu nhập quyết định, đặc trưng tuổi mất tác dụng.",
      "Mô hình báo lỗi vì các đặc trưng khác đơn vị.",
      "Tuổi sẽ chi phối vì có ít giá trị hơn.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: Euclid cộng bình phương chênh lệch thô, nên hoàn toàn phụ thuộc đơn vị đo.",
      "Đúng: chênh lệch thu nhập cỡ hàng triệu áp đảo chênh lệch tuổi cỡ hàng chục.",
      "Sai: không có lỗi nào; đây là lỗi im lặng.",
      "Sai: ngược lại, đặc trưng có biên độ lớn mới chi phối.",
    ],
    explanation:
      "Mọi thuật toán dựa trên khoảng cách — k-NN, k-means, SVM với RBF — đều bắt buộc chuẩn hoá. Ngược lại, mô hình dựa trên cây thì không cần.",
  },
  {
    id: "knn-05",
    syllabusId: "knn",
    difficulty: "advanced",
    format: "single-choice",
    stem: "Vì sao k-NN suy giảm mạnh khi số chiều tăng lên hàng trăm, dù số mẫu giữ nguyên?",
    choices: [
      "Vì chi phí tính khoảng cách tăng tuyến tính theo số chiều.",
      "Vì ở số chiều cao, khoảng cách từ một điểm tới láng giềng gần nhất và tới điểm xa nhất trở nên gần bằng nhau, nên khái niệm “láng giềng gần” mất ý nghĩa phân biệt.",
      "Vì bộ nhớ không đủ để lưu tập train.",
      "Vì hàm khoảng cách Euclid không định nghĩa được ở số chiều lớn hơn 3.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: chi phí tăng thật nhưng đó là vấn đề tốc độ, không phải chất lượng dự đoán.",
      "Đúng: tỷ số (d_max − d_min)/d_min tiến về 0 khi số chiều tăng — đây là lời nguyền số chiều.",
      "Sai: bộ nhớ tăng tuyến tính, thường không phải nút thắt.",
      "Sai: Euclid định nghĩa được ở mọi số chiều hữu hạn.",
    ],
    trap: "Bẫy là phương án nói về chi phí tính toán — đúng sự thật nhưng trả lời sai câu hỏi, vì đề hỏi về *chất lượng dự đoán* chứ không phải tốc độ.",
    explanation:
      "Hướng khắc phục: giảm chiều (PCA), chọn đặc trưng, hoặc học một metric/embedding phù hợp trước khi tìm láng giềng — đây chính là cách các hệ thống tìm kiếm vector hiện đại hoạt động.",
  },

  /* ---------------- trees ---------------- */
  {
    id: "trees-01",
    syllabusId: "trees",
    difficulty: "recall",
    format: "single-choice",
    stem: "Cây quyết định phân loại chọn điểm chia dựa trên tiêu chí nào?",
    choices: [
      "Cực đại hoá độ giảm độ vẩn (Gini) hoặc entropy sau khi chia.",
      "Cực tiểu hoá số lá của cây.",
      "Cực đại hoá khoảng cách Euclid giữa hai nhánh.",
      "Cực tiểu hoá số đặc trưng được sử dụng.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: mỗi lần chia, thuật toán duyệt các ngưỡng và chọn phép chia làm nút con “thuần” nhất.",
      "Sai: số lá bị kiểm soát bằng pruning và siêu tham số, không phải tiêu chí chia.",
      "Sai: cây không dùng khoảng cách giữa các mẫu.",
      "Sai: số đặc trưng dùng là hệ quả, không phải mục tiêu tối ưu.",
    ],
    explanation:
      "Gini và entropy cho kết quả rất gần nhau trong thực tế. Gini rẻ hơn vì không phải tính logarit, nên là mặc định trong scikit-learn.",
  },
  {
    id: "trees-02",
    syllabusId: "trees",
    difficulty: "understand",
    format: "single-choice",
    stem: "Cây quyết định được nuôi tới độ sâu tối đa, mỗi lá chỉ còn một mẫu. Điều gì đúng?",
    choices: [
      "Cây đạt accuracy 100% trên train và thường tổng quát hoá kém do overfitting.",
      "Cây đạt accuracy 100% trên cả train lẫn test.",
      "Cây trở nên đơn giản hơn nên ít overfit.",
      "Cây không dự đoán được dữ liệu mới.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: cây ghi nhớ được cả nhiễu của tập train.",
      "Sai: hiệu năng test thường giảm rõ rệt.",
      "Sai: cây sâu hơn nghĩa là phức tạp hơn.",
      "Sai: nó vẫn dự đoán được, chỉ là dự đoán kém.",
    ],
    explanation:
      "Các núm kiểm soát độ phức tạp: `max_depth`, `min_samples_leaf`, `min_samples_split`, `ccp_alpha` (cắt tỉa theo chi phí–độ phức tạp).",
  },
  {
    id: "trees-03",
    syllabusId: "trees",
    difficulty: "apply",
    format: "numeric",
    stem: "Một nút có 8 mẫu: 6 thuộc lớp A và 2 thuộc lớp B. Tính chỉ số Gini của nút này.",
    answer: 0.375,
    tolerance: 0.001,
    calculation: [
      "p_A = 6/8 = 0.75; p_B = 2/8 = 0.25.",
      "Σp² = 0.75² + 0.25² = 0.5625 + 0.0625 = 0.625.",
      "Gini = 1 − 0.625 = 0.375.",
    ],
    explanation:
      "Gini bằng 0 khi nút thuần tuyệt đối và đạt cực đại 0.5 với hai lớp cân bằng. Giá trị 0.375 cho thấy nút này đã khá thuần nhưng chưa hoàn toàn.",
  },
  {
    id: "trees-04",
    syllabusId: "trees",
    difficulty: "apply",
    format: "single-choice",
    stem: "Phát biểu nào đúng về tiền xử lý cho cây quyết định?",
    choices: [
      "Bắt buộc chuẩn hoá đặc trưng như với k-NN.",
      "Không cần chuẩn hoá, vì cây chỉ so sánh giá trị với một ngưỡng trên từng đặc trưng.",
      "Bắt buộc chuyển mọi đặc trưng về phân phối chuẩn.",
      "Bắt buộc one-hot mọi biến hạng mục, nếu không cây sẽ báo lỗi toán học.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: cây không dùng khoảng cách nên thang đo không ảnh hưởng.",
      "Đúng: mọi phép biến đổi đơn điệu trên một đặc trưng đều không đổi cấu trúc cây.",
      "Sai: cây không giả định phân phối của đặc trưng.",
      "Sai: cài đặt trong scikit-learn cần đầu vào số, nhưng đó là ràng buộc kỹ thuật, không phải yêu cầu toán học của thuật toán.",
    ],
    explanation:
      "Bất biến với phép biến đổi đơn điệu là ưu thế thực dụng lớn của cây: không cần scale, không cần log-transform, chịu được ngoại lai ở đặc trưng.",
  },
  {
    id: "trees-05",
    syllabusId: "trees",
    difficulty: "advanced",
    format: "multi-select",
    stem: "Chọn tất cả phát biểu đúng về hạn chế của cây quyết định và của độ quan trọng đặc trưng theo impurity.",
    choices: [
      "Feature importance theo impurity thiên vị các đặc trưng liên tục hoặc có nhiều mức giá trị.",
      "Cây chỉ tạo được ranh giới song song với các trục toạ độ, nên cần rất nhiều lần chia để xấp xỉ một ranh giới chéo.",
      "Đổi một chút dữ liệu train có thể làm cấu trúc cây thay đổi hoàn toàn.",
      "Feature importance cao chứng minh đặc trưng đó là nguyên nhân gây ra nhãn.",
      "Với hai đặc trưng tương quan mạnh, importance có thể dồn phần lớn cho một đặc trưng và làm đặc trưng kia trông vô dụng.",
    ],
    answerIndexes: [0, 1, 2, 4],
    choiceNotes: [
      "Đúng: nhiều ngưỡng chia khả dĩ hơn nghĩa là nhiều cơ hội giảm impurity hơn, kể cả một cách ngẫu nhiên.",
      "Đúng: đây là lý do cây cần nhiều bậc thang để xấp xỉ ranh giới `x₁ + x₂ = c`.",
      "Đúng: tính bất ổn này chính là động cơ của bagging/random forest.",
      "Sai: importance chỉ nói về mức đóng góp dự đoán trong mô hình, không nói gì về quan hệ nhân quả.",
      "Đúng: cây chọn một trong hai ở mỗi lần chia nên importance bị chia không đều.",
    ],
    scoring: "all-or-nothing",
    trap: "Phương án về nhân quả là bẫy nguy hiểm nhất vì nó xuất hiện thường xuyên trong báo cáo thật: “đặc trưng X quan trọng nhất nên X gây ra Y”.",
    explanation:
      "Muốn đánh giá tầm quan trọng đáng tin hơn, dùng permutation importance trên tập validation, và luôn kiểm tra tương quan giữa các đặc trưng trước khi diễn giải.",
  },

  /* ---------------- ensembles ---------------- */
  {
    id: "ensembles-01",
    syllabusId: "ensembles",
    difficulty: "recall",
    format: "single-choice",
    stem: "Khác biệt cơ bản giữa bagging và boosting là gì?",
    choices: [
      "Bagging huấn luyện các mô hình song song trên các mẫu bootstrap độc lập; boosting huấn luyện tuần tự, mỗi mô hình sửa lỗi của các mô hình trước.",
      "Bagging chỉ dùng cho hồi quy, boosting chỉ dùng cho phân loại.",
      "Bagging dùng cây sâu, boosting bắt buộc dùng mạng nơ-ron.",
      "Bagging huấn luyện tuần tự, boosting huấn luyện song song.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: đây là khác biệt về sơ đồ huấn luyện, kéo theo mọi khác biệt còn lại.",
      "Sai: cả hai đều dùng được cho cả hai loại bài toán.",
      "Sai: boosting phổ biến nhất là boosting trên cây nông.",
      "Sai: đảo ngược hoàn toàn.",
    ],
    explanation:
      "Từ khác biệt này suy ra mọi thứ: bagging song song hoá được và giảm variance; boosting phải tuần tự và giảm bias.",
  },
  {
    id: "ensembles-02",
    syllabusId: "ensembles",
    difficulty: "understand",
    format: "single-choice",
    stem: "Random forest thường dùng cây rất sâu, còn gradient boosting thường dùng cây nông (3–8 mức). Vì sao?",
    choices: [
      "Vì random forest cần giảm variance nên mỗi cây phải có bias thấp; boosting cộng dồn nhiều mô hình yếu để giảm bias nên mỗi cây chỉ cần rất đơn giản.",
      "Vì random forest chạy nhanh hơn nên cho phép cây sâu.",
      "Vì boosting không hỗ trợ cây sâu về mặt cài đặt.",
      "Vì cây nông luôn chính xác hơn cây sâu.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: bagging trung bình hoá variance của các mô hình bias thấp; boosting xây dần năng lực từ các mô hình bias cao.",
      "Sai: tốc độ là hệ quả, không phải nguyên nhân thiết kế.",
      "Sai: đặt `max_depth` lớn hoàn toàn được, chỉ là dễ overfit.",
      "Sai: cây nông đơn lẻ thường kém chính xác hơn.",
    ],
    explanation:
      "Một câu tóm tắt đáng thuộc: bagging lấy nhiều mô hình *quá khớp* rồi trung bình hoá; boosting lấy nhiều mô hình *dưới khớp* rồi cộng dồn.",
  },
  {
    id: "ensembles-03",
    syllabusId: "ensembles",
    difficulty: "apply",
    format: "single-choice",
    stem: "Ngoài bootstrap mẫu, random forest còn chọn ngẫu nhiên một tập con đặc trưng tại mỗi lần chia. Mục đích chính là gì?",
    choices: [
      "Giảm thời gian huấn luyện là mục đích chính.",
      "Giảm tương quan giữa các cây, nhờ đó trung bình hoá làm giảm variance hiệu quả hơn.",
      "Bảo đảm mọi đặc trưng đều được dùng đúng một lần.",
      "Cho phép mô hình xử lý được giá trị thiếu.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: có tăng tốc thật, nhưng đó là tác dụng phụ.",
      "Đúng: nếu mọi cây đều chọn cùng một đặc trưng mạnh ở gốc, chúng sẽ rất giống nhau và trung bình hoá gần như vô ích.",
      "Sai: không có bảo đảm nào như vậy.",
      "Sai: xử lý giá trị thiếu là cơ chế riêng của từng cài đặt.",
    ],
    explanation:
      "Phương sai của trung bình các biến có tương quan ρ không giảm về 0 mà tiệm cận ρ·σ². Vì thế giảm ρ quan trọng ngang với tăng số cây.",
  },
  {
    id: "ensembles-04",
    syllabusId: "ensembles",
    difficulty: "apply",
    format: "numeric",
    stem: "Với mẫu bootstrap kích thước n lấy có hoàn lại từ tập n mẫu, khi n lớn thì tỷ lệ mẫu **không** được chọn lần nào xấp xỉ bao nhiêu? (nhập số thập phân)",
    answer: 0.368,
    tolerance: 0.01,
    calculation: [
      "Xác suất một mẫu cụ thể không được chọn trong một lần rút: 1 − 1/n.",
      "Qua n lần rút độc lập: (1 − 1/n)ⁿ.",
      "Khi n → ∞, giới hạn là e⁻¹ ≈ 0.368.",
    ],
    explanation:
      "Khoảng 36.8% mẫu nằm ngoài mỗi bootstrap — đó chính là tập out-of-bag, dùng để ước lượng lỗi mà không cần tách riêng tập validation.",
  },
  {
    id: "ensembles-05",
    syllabusId: "ensembles",
    difficulty: "advanced",
    format: "true-false-set",
    stem: "Xét hành vi của random forest và gradient boosting khi tăng số cây `n_estimators`.",
    statements: [
      {
        text: "Với random forest, tăng số cây nói chung không gây overfitting, chỉ tốn thêm thời gian.",
        answer: true,
        note: "Trung bình hoá thêm các cây độc lập làm ước lượng hội tụ, không làm mô hình phức tạp hơn theo nghĩa gây overfit.",
      },
      {
        text: "Với gradient boosting, tăng số cây quá mức có thể gây overfitting.",
        answer: true,
        note: "Mỗi cây mới tiếp tục khớp phần dư, nên cuối cùng sẽ khớp cả nhiễu; vì thế cần early stopping trên tập validation.",
      },
      {
        text: "Trong gradient boosting, giảm learning rate thì nên tăng số cây để giữ nguyên năng lực mô hình.",
        answer: true,
        note: "Learning rate và số cây đánh đổi trực tiếp: bước nhỏ hơn cần nhiều bước hơn, đổi lại thường tổng quát hoá tốt hơn.",
      },
      {
        text: "Boosting bền với ngoại lai và nhãn sai hơn bagging.",
        answer: false,
        note: "Ngược lại: boosting dồn trọng số vào mẫu đang bị dự đoán sai, nên nhãn nhiễu bị nhấn mạnh qua từng vòng.",
      },
    ],
    trap: "Ý (a) và (b) trông đối xứng nhưng câu trả lời khác nhau — đây chính là điểm phân loại. Ai học thuộc câu “ensemble càng nhiều mô hình càng tốt” sẽ trả lời sai ý (b).",
    explanation:
      "Hệ quả thực hành: với random forest cứ tăng cây tới khi hết ngân sách tính toán; với boosting bắt buộc theo dõi validation và dừng sớm.",
  },

  /* ---------------- svm ---------------- */
  {
    id: "svm-01",
    syllabusId: "svm",
    difficulty: "recall",
    format: "single-choice",
    stem: "“Support vector” trong SVM là gì?",
    choices: [
      "Vector trọng số của siêu phẳng.",
      "Các mẫu huấn luyện nằm trên biên lề hoặc vi phạm lề, tức những mẫu quyết định vị trí siêu phẳng.",
      "Các mẫu nằm xa siêu phẳng nhất.",
      "Vector riêng của ma trận hiệp phương sai.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: vector trọng số là `w`, không gọi là support vector.",
      "Đúng: xoá các mẫu khác không làm đổi nghiệm; xoá một support vector thì có.",
      "Sai: mẫu ở xa hoàn toàn không ảnh hưởng nghiệm.",
      "Sai: đó là khái niệm của PCA.",
    ],
    explanation:
      "Vì nghiệm chỉ phụ thuộc một tập nhỏ các mẫu biên, SVM khá tiết kiệm bộ nhớ khi dự đoán, nhưng cũng nhạy với nhãn sai nằm gần ranh giới.",
  },
  {
    id: "svm-02",
    syllabusId: "svm",
    difficulty: "understand",
    format: "single-choice",
    stem: "Kernel trick cho phép làm gì?",
    choices: [
      "Tính tích vô hướng trong không gian đặc trưng nhiều chiều mà không cần ánh xạ dữ liệu sang không gian đó một cách tường minh.",
      "Giảm số chiều dữ liệu trước khi huấn luyện.",
      "Chuyển bài toán tối ưu không lồi thành lồi.",
      "Loại bỏ nhu cầu chuẩn hoá đặc trưng.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: chỉ cần hàm kernel K(x, x′) = ⟨φ(x), φ(x′)⟩, không bao giờ cần tính φ(x).",
      "Sai: kernel thường tương ứng với không gian *nhiều chiều hơn*, kể cả vô hạn chiều với RBF.",
      "Sai: bài toán SVM vốn đã lồi.",
      "Sai: kernel RBF phụ thuộc khoảng cách nên càng đòi hỏi chuẩn hoá.",
    ],
    explanation:
      "Đây là lý do SVM với kernel RBF học được ranh giới phi tuyến rất phức tạp mà số tham số vẫn gắn với số mẫu, không gắn với số chiều của không gian ẩn.",
  },
  {
    id: "svm-03",
    syllabusId: "svm",
    difficulty: "apply",
    format: "single-choice",
    stem: "Tăng tham số `C` trong soft-margin SVM lên rất lớn dẫn tới điều gì?",
    choices: [
      "Lề rộng hơn, chấp nhận nhiều mẫu bị phân loại sai trên tập train.",
      "Phạt vi phạm lề nặng hơn nên lề hẹp lại, ít lỗi train hơn và rủi ro overfitting cao hơn.",
      "Mô hình trở thành tuyến tính bất kể kernel.",
      "Số support vector luôn tăng.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: đó là hướng khi *giảm* C.",
      "Đúng: C là trọng số của phần phạt lỗi, C lớn nghĩa là gần như không khoan nhượng với lỗi train.",
      "Sai: C không đổi dạng kernel.",
      "Sai: C lớn thường làm *giảm* số support vector vì ít mẫu vi phạm lề hơn.",
    ],
    explanation:
      "Nhớ theo chiều: C nhỏ ⇒ lề mềm, mô hình đơn giản, bias cao. C lớn ⇒ lề cứng, mô hình phức tạp, variance cao.",
  },
  {
    id: "svm-04",
    syllabusId: "svm",
    difficulty: "apply",
    format: "single-choice",
    stem: "Với kernel RBF, tăng `gamma` rất lớn thì mô hình hành xử ra sao?",
    choices: [
      "Ảnh hưởng của mỗi mẫu lan rộng, ranh giới trở nên gần tuyến tính.",
      "Ảnh hưởng của mỗi mẫu thu hẹp lại quanh chính nó, ranh giới rất gồ ghề và mô hình dễ overfit.",
      "Mô hình bỏ qua tham số C.",
      "Thời gian huấn luyện giảm mạnh.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: đó là hành vi khi gamma *nhỏ*.",
      "Đúng: K(x, x′) = exp(−γ‖x − x′‖²) tắt rất nhanh theo khoảng cách khi γ lớn.",
      "Sai: C vẫn có tác dụng; hai tham số phải dò cùng nhau.",
      "Sai: gamma không quyết định tốc độ theo hướng đó.",
    ],
    explanation:
      "gamma lớn tạo ra các “ốc đảo” bao quanh từng mẫu train — accuracy train gần 100% còn test rất kém. Vì thế C và gamma luôn được dò trên lưới hai chiều.",
  },
  {
    id: "svm-05",
    syllabusId: "svm",
    difficulty: "advanced",
    format: "single-choice",
    stem: "Bài toán phân loại nhị phân có 200.000 mẫu và 3 đặc trưng, các lớp chồng lấn nhiều. Nhóm chọn SVM kernel RBF với `C = 1000`, `gamma = 100`, không chuẩn hoá đặc trưng. Vấn đề nghiêm trọng nhất trong lựa chọn này là gì?",
    choices: [
      "Chỉ riêng việc số đặc trưng quá ít khiến SVM không dùng được.",
      "Cả ba vấn đề cùng lúc: chi phí huấn luyện tăng siêu tuyến tính theo số mẫu, cặp `C`/`gamma` quá lớn gần như bảo đảm overfitting, và kernel RBF vô nghĩa khi đặc trưng chưa cùng thang đo.",
      "Kernel RBF không dùng được cho phân loại nhị phân.",
      "Chỉ cần đổi `C` về 1 là mọi vấn đề được giải quyết.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: SVM hoạt động tốt với số đặc trưng nhỏ.",
      "Đúng: cần nhận ra cả ba lỗi độc lập nhau chồng lên nhau.",
      "Sai: đây là ứng dụng chuẩn của RBF.",
      "Sai: sửa một tham số không xử lý được vấn đề quy mô dữ liệu lẫn thang đo.",
    ],
    trap: "Đề mời gọi chọn đúng một nguyên nhân. Câu phân loại ở đây yêu cầu thấy rằng nhiều quyết định sai độc lập đang cộng dồn.",
    explanation:
      "Hướng đúng: chuẩn hoá đặc trưng, dò `C`/`gamma` trên lưới log quanh giá trị mặc định, và với 200.000 mẫu nên cân nhắc `LinearSVC`, xấp xỉ kernel (Nyström, RBFSampler) hoặc gradient boosting.",
  },
];
