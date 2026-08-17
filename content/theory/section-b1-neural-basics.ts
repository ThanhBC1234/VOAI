/**
 * Section B1 — Nền tảng mạng nơ-ron: perceptron, gradient descent,
 * backpropagation, hàm kích hoạt, hàm mất mát, MLP, SGD/mini-batch, các phương
 * pháp momentum (Adam/AdamW) và hội tụ/learning rate.
 *
 * Mỗi mục syllabus có 5 câu: 1 Nhận biết, 1 Thông hiểu, 2 Vận dụng,
 * 1 Vận dụng cao.
 */

import type { TheoryQuestion } from "./types";

export const sectionB1Questions: readonly TheoryQuestion[] = [
  /* ---------------- perceptron ---------------- */
  {
    id: "perceptron-01",
    syllabusId: "perceptron",
    difficulty: "recall",
    format: "single-choice",
    stem: "Một perceptron cổ điển tính đầu ra như thế nào?",
    choices: [
      "Lấy tổng có trọng số của đầu vào cộng bias, rồi đưa qua hàm ngưỡng.",
      "Lấy tích của tất cả đầu vào rồi so với ngưỡng.",
      "Lấy khoảng cách Euclid từ đầu vào tới một tâm học được.",
      "Lấy trung vị của các đầu vào.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: y = step(w·x + b) — đây là đơn vị tính toán cơ bản của mọi mạng nơ-ron.",
      "Sai: phép tích không phải cấu trúc của perceptron.",
      "Sai: đó là ý tưởng của RBF network hoặc k-NN.",
      "Sai: perceptron không dùng thống kê thứ hạng.",
    ],
    explanation:
      "Mọi nơ-ron hiện đại vẫn giữ đúng cấu trúc này, chỉ thay hàm ngưỡng bằng hàm kích hoạt khả vi như ReLU để backpropagation hoạt động được.",
  },
  {
    id: "perceptron-02",
    syllabusId: "perceptron",
    difficulty: "understand",
    format: "single-choice",
    stem: "Vì sao một perceptron đơn không học được hàm XOR?",
    choices: [
      "Vì XOR cần quá nhiều dữ liệu huấn luyện.",
      "Vì XOR không khả tách tuyến tính, trong khi perceptron chỉ tạo được một siêu phẳng phân chia.",
      "Vì XOR có bốn đầu vào khác nhau.",
      "Vì hàm ngưỡng chỉ nhận giá trị 0 và 1.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: XOR chỉ có 4 mẫu và cả 4 đều được biết.",
      "Đúng: không tồn tại đường thẳng nào tách {(0,1), (1,0)} khỏi {(0,0), (1,1)}.",
      "Sai: số mẫu không phải nguyên nhân.",
      "Sai: miền giá trị đầu ra không phải giới hạn ở đây.",
    ],
    explanation:
      "Thêm một lớp ẩn giải quyết được XOR vì lớp ẩn tạo ra không gian đặc trưng mới, trong đó bài toán trở nên khả tách tuyến tính.",
  },
  {
    id: "perceptron-03",
    syllabusId: "perceptron",
    difficulty: "apply",
    format: "numeric",
    stem: "Perceptron có `w = [2, −1]`, `b = 0.5`. Với đầu vào `x = [1, 1]`, giá trị tổng có trọng số `z = w·x + b` bằng bao nhiêu?",
    answer: 1.5,
    tolerance: 0.001,
    calculation: ["w·x = 2×1 + (−1)×1 = 1.", "z = 1 + 0.5 = 1.5."],
    explanation:
      "z = 1.5 > 0 nên hàm ngưỡng cho đầu ra 1. Bias dịch chuyển siêu phẳng ra khỏi gốc toạ độ; thiếu bias thì ranh giới buộc phải đi qua điểm 0.",
  },
  {
    id: "perceptron-04",
    syllabusId: "perceptron",
    difficulty: "apply",
    format: "single-choice",
    stem: "Quy tắc học của perceptron cập nhật trọng số khi nào?",
    choices: [
      "Sau mỗi mẫu, bất kể dự đoán đúng hay sai.",
      "Chỉ khi mẫu bị phân loại sai, theo `w ← w + η·(y − ŷ)·x`.",
      "Chỉ sau khi duyệt hết toàn bộ tập dữ liệu một lần.",
      "Chỉ khi hàm mất mát tăng.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: mẫu đúng cho (y − ŷ) = 0 nên không có cập nhật nào.",
      "Đúng: đây chính là quy tắc học perceptron gốc.",
      "Sai: đó là chế độ batch, không phải quy tắc perceptron cổ điển.",
      "Sai: perceptron không theo dõi hàm mất mát theo cách đó.",
    ],
    explanation:
      "Cập nhật này đẩy siêu phẳng về phía phân loại đúng mẫu vừa sai. Chú ý bias cũng được cập nhật theo `b ← b + η·(y − ŷ)`.",
  },
  {
    id: "perceptron-05",
    syllabusId: "perceptron",
    difficulty: "advanced",
    format: "single-choice",
    stem: "Định lý hội tụ perceptron bảo đảm điều gì?",
    choices: [
      "Thuật toán luôn hội tụ sau hữu hạn bước với mọi tập dữ liệu.",
      "Nếu dữ liệu khả tách tuyến tính thì thuật toán tìm được một siêu phẳng phân tách sau hữu hạn bước; nếu không khả tách, nó có thể lặp mãi không dừng.",
      "Thuật toán luôn tìm được siêu phẳng có lề lớn nhất.",
      "Thuật toán hội tụ nhanh hơn khi learning rate lớn hơn.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: điều kiện khả tách tuyến tính là bắt buộc.",
      "Đúng: số bước bị chặn theo lề và bán kính dữ liệu, nhưng chỉ khi tồn tại nghiệm phân tách.",
      "Sai: perceptron dừng ở *một* siêu phẳng bất kỳ tách được; lề lớn nhất là mục tiêu của SVM.",
      "Sai: với perceptron, η chỉ đổi tỷ lệ trọng số chứ không đổi bản chất hội tụ.",
    ],
    trap: "Bẫy nằm ở phương án nói perceptron cho lề lớn nhất. Perceptron dừng ngay khi hết mẫu sai, nên nghiệm của nó thường nằm sát dữ liệu và tổng quát hoá kém hơn SVM.",
    explanation:
      "Hệ quả thực hành: chạy perceptron trên dữ liệu có nhiễu nhãn sẽ không bao giờ dừng nếu không đặt số vòng lặp tối đa. Đây là lý do người ta chuyển sang cực tiểu hoá một hàm mất mát khả vi.",
  },

  /* ---------------- gradient-descent ---------------- */
  {
    id: "gradient-descent-01",
    syllabusId: "gradient-descent",
    difficulty: "recall",
    format: "single-choice",
    stem: "Vì sao bước cập nhật của gradient descent là `w ← w − η·∇L`, tức đi *ngược* hướng gradient?",
    choices: [
      "Vì gradient chỉ hướng tăng nhanh nhất của hàm mất mát, nên muốn giảm phải đi ngược lại.",
      "Vì gradient luôn âm.",
      "Vì dấu trừ giúp tránh tràn số.",
      "Vì gradient chỉ hướng tới cực tiểu toàn cục.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: đây là định nghĩa của gradient trong giải tích nhiều biến.",
      "Sai: gradient có thể dương hoặc âm theo từng toạ độ.",
      "Sai: dấu trừ mang ý nghĩa hình học, không phải mẹo số học.",
      "Sai: gradient chỉ mang thông tin cục bộ.",
    ],
    explanation:
      "Gradient chỉ đúng cho một lân cận nhỏ quanh điểm hiện tại. Đó là lý do bước η phải đủ nhỏ, và cũng là lý do gradient descent không thấy được toàn cảnh mặt lỗi.",
  },
  {
    id: "gradient-descent-02",
    syllabusId: "gradient-descent",
    difficulty: "understand",
    format: "single-choice",
    stem: "Learning rate quá lớn thường gây ra hiện tượng gì?",
    choices: [
      "Loss giảm rất chậm nhưng ổn định.",
      "Loss dao động mạnh hoặc tăng dần, thậm chí thành NaN, vì mỗi bước nhảy vọt qua vùng cực tiểu.",
      "Mô hình chắc chắn hội tụ về cực tiểu toàn cục.",
      "Gradient trở thành 0 ở mọi bước.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: đó là triệu chứng của learning rate quá *nhỏ*.",
      "Đúng: bước quá dài làm điểm cập nhật văng sang sườn đối diện với giá trị hàm cao hơn.",
      "Sai: không có bảo đảm nào như vậy.",
      "Sai: gradient bằng 0 liên quan tới bão hoà kích hoạt, không phải learning rate lớn.",
    ],
    explanation:
      "Chẩn đoán theo đường cong loss: giảm rồi bật lên hình răng cưa hoặc phân kỳ ⇒ giảm learning rate; giảm gần như tuyến tính và rất chậm ⇒ tăng learning rate.",
  },
  {
    id: "gradient-descent-03",
    syllabusId: "gradient-descent",
    difficulty: "apply",
    format: "numeric",
    stem: "Cho `L(w) = w²`, giá trị hiện tại `w = 3`, learning rate η = 0.1. Sau một bước gradient descent, `w` bằng bao nhiêu?",
    answer: 2.4,
    tolerance: 0.001,
    calculation: [
      "∇L = dL/dw = 2w = 2 × 3 = 6.",
      "w ← w − η·∇L = 3 − 0.1 × 6 = 3 − 0.6 = 2.4.",
    ],
    explanation:
      "Thử với η = 1 sẽ cho w ← 3 − 6 = −3: giá trị hàm không đổi, thuật toán dao động vĩnh viễn. Với η > 1 nó phân kỳ. Đây là minh hoạ nhỏ nhất cho ngưỡng ổn định của learning rate.",
  },
  {
    id: "gradient-descent-04",
    syllabusId: "gradient-descent",
    difficulty: "apply",
    format: "single-choice",
    stem: "Đường cong loss huấn luyện đi ngang gần như phẳng ở mức cao ngay từ đầu và không giảm sau nhiều epoch. Kiểm tra đầu tiên nên là gì?",
    choices: [
      "Tăng số epoch lên gấp mười lần rồi chờ.",
      "Kiểm tra learning rate quá nhỏ, đồng thời kiểm tra gradient có thực sự chảy về các lớp (khởi tạo, kích hoạt bão hoà, chuẩn hoá đầu vào).",
      "Đổi ngay sang mô hình khác.",
      "Giảm kích thước tập huấn luyện.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: chờ lâu hơn không sửa được nguyên nhân, chỉ tốn tài nguyên.",
      "Đúng: cần phân biệt “bước quá nhỏ” với “gradient gần bằng 0”, vì hai nguyên nhân này cho cùng một triệu chứng.",
      "Sai: đổi mô hình khi chưa xác định nguyên nhân là đoán mò.",
      "Sai: ít dữ liệu hơn không giúp gì cho vấn đề tối ưu.",
    ],
    explanation:
      "Phép thử rẻ và hiệu quả: cố ý overfit một batch rất nhỏ (8–32 mẫu). Nếu không đưa được loss về gần 0 trên chính batch đó thì lỗi nằm ở pipeline hoặc cấu hình tối ưu, không phải ở lượng dữ liệu.",
  },
  {
    id: "gradient-descent-05",
    syllabusId: "gradient-descent",
    difficulty: "advanced",
    format: "single-choice",
    stem: "Trong huấn luyện mạng nơ-ron sâu, trở ngại tối ưu nào được coi là phổ biến và đáng ngại hơn cực tiểu địa phương?",
    choices: [
      "Cực đại toàn cục của hàm mất mát.",
      "Điểm yên ngựa và các vùng cao nguyên phẳng, nơi gradient rất nhỏ theo nhiều chiều nên tiến trình gần như dừng lại.",
      "Việc hàm mất mát không liên tục.",
      "Việc số tham số ít hơn số mẫu.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: gradient descent đi xuống nên không bị kẹt ở cực đại.",
      "Đúng: ở số chiều rất cao, điểm dừng ngẫu nhiên hầu như luôn là yên ngựa chứ không phải cực tiểu.",
      "Sai: các hàm mất mát dùng trong thực tế liên tục và khả vi hầu khắp.",
      "Sai: mạng sâu thường có nhiều tham số hơn mẫu.",
    ],
    trap: "Bẫy là kiến thức phổ thông “gradient descent kẹt ở cực tiểu địa phương”. Trực giác đó đến từ hình vẽ một chiều; ở hàng triệu chiều, xác suất mọi hướng đều đi lên là cực kỳ nhỏ.",
    explanation:
      "Momentum và các phương pháp thích nghi giúp thoát khỏi vùng phẳng nhanh hơn; nhiễu của mini-batch cũng đóng vai trò tương tự.",
  },

  /* ---------------- backprop ---------------- */
  {
    id: "backprop-01",
    syllabusId: "backprop",
    difficulty: "recall",
    format: "single-choice",
    stem: "Backpropagation dựa trên quy tắc toán học nào?",
    choices: [
      "Quy tắc chuỗi của đạo hàm hàm hợp.",
      "Định lý giá trị trung bình.",
      "Khai triển Taylor bậc hai.",
      "Quy tắc L'Hôpital.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: gradient theo tham số của lớp sâu bên trong được ghép từ các đạo hàm cục bộ nhân dồn.",
      "Sai: không phải nền tảng của backprop.",
      "Sai: Taylor bậc hai gắn với các phương pháp bậc hai như Newton.",
      "Sai: không liên quan.",
    ],
    explanation:
      "Backprop là cách cài đặt hiệu quả của quy tắc chuỗi theo chế độ ngược: đi từ loss về đầu vào, tái sử dụng kết quả trung gian thay vì tính lại.",
  },
  {
    id: "backprop-02",
    syllabusId: "backprop",
    difficulty: "understand",
    format: "single-choice",
    stem: "Phân biệt vai trò của backpropagation và optimizer.",
    choices: [
      "Backprop cập nhật trọng số, optimizer tính gradient.",
      "Backprop tính gradient của loss theo từng tham số; optimizer dùng gradient đó để quyết định cách cập nhật trọng số.",
      "Hai khái niệm chỉ là hai tên gọi của cùng một việc.",
      "Backprop chỉ chạy ở lớp cuối, optimizer chạy ở các lớp còn lại.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: đảo ngược vai trò.",
      "Đúng: tách bạch này giải thích vì sao đổi optimizer không cần đổi mô hình.",
      "Sai: trong PyTorch, `loss.backward()` và `optimizer.step()` là hai lời gọi tách biệt.",
      "Sai: backprop lan gradient qua toàn bộ mạng.",
    ],
    explanation:
      "Nhớ theo mã lệnh: `zero_grad()` xoá gradient cũ, `backward()` là backprop, `step()` là optimizer. Ba bước, ba nhiệm vụ khác nhau.",
  },
  {
    id: "backprop-03",
    syllabusId: "backprop",
    difficulty: "apply",
    format: "numeric",
    stem: "Cho `y = (2x + 1)²`. Tính `dy/dx` tại `x = 1`.",
    answer: 12,
    tolerance: 0.001,
    calculation: [
      "Đặt u = 2x + 1, khi đó y = u².",
      "dy/du = 2u; du/dx = 2 ⇒ dy/dx = 2u × 2 = 4(2x + 1).",
      "Tại x = 1: 4 × 3 = 12.",
    ],
    explanation:
      "Đây đúng là phép mà backprop thực hiện ở mỗi nút: nhân gradient đi vào với đạo hàm cục bộ của nút rồi truyền tiếp về phía đầu vào.",
  },
  {
    id: "backprop-04",
    syllabusId: "backprop",
    difficulty: "apply",
    format: "single-choice",
    stem: "Mạng 20 lớp dùng sigmoid ở mọi lớp ẩn. Các lớp gần đầu vào gần như không thay đổi trọng số trong suốt quá trình huấn luyện. Nguyên nhân là gì?",
    choices: [
      "Learning rate quá lớn.",
      "Vanishing gradient: đạo hàm sigmoid tối đa chỉ 0.25, nhân dồn qua nhiều lớp làm gradient về gần 0 ở các lớp đầu.",
      "Các lớp đầu không có bias.",
      "Batch size quá lớn.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: learning rate lớn gây phân kỳ chứ không gây đóng băng lớp đầu.",
      "Đúng: 0.25²⁰ là một số cực nhỏ, nên tín hiệu học gần như tắt hẳn trước khi tới lớp đầu.",
      "Sai: thiếu bias không tạo ra hiện tượng theo độ sâu như vậy.",
      "Sai: batch size ảnh hưởng nhiễu gradient, không ảnh hưởng theo độ sâu.",
    ],
    explanation:
      "Các cách khắc phục đã thành chuẩn: dùng ReLU và biến thể, khởi tạo He/Xavier, batch normalization, và kết nối tắt (residual) để gradient có đường đi ngắn về lớp đầu.",
  },
  {
    id: "backprop-05",
    syllabusId: "backprop",
    difficulty: "advanced",
    format: "true-false-set",
    stem: "Xét chi phí tính toán và bộ nhớ của backpropagation.",
    statements: [
      {
        text: "Chi phí tính toán của lượt backward cùng bậc với lượt forward (thường khoảng 1–2 lần).",
        answer: true,
        note: "Mỗi phép toán forward tương ứng một lượng công việc hữu hạn ở backward, nên không có bùng nổ theo độ sâu.",
      },
      {
        text: "Để tính gradient, các giá trị kích hoạt trung gian của lượt forward phải được lưu lại, nên bộ nhớ tăng theo độ sâu và theo batch size.",
        answer: true,
        note: "Đây là lý do batch size huấn luyện bị giới hạn bởi VRAM chặt hơn nhiều so với batch size suy luận.",
      },
      {
        text: "Gradient checkpointing đánh đổi thêm thời gian tính toán để giảm bộ nhớ, bằng cách tính lại một phần kích hoạt trong lượt backward.",
        answer: true,
        note: "Kỹ thuật tiêu chuẩn khi huấn luyện mô hình lớn trên phần cứng hạn chế.",
      },
      {
        text: "Backpropagation là một thuật toán tối ưu hoá, thay thế được cho gradient descent.",
        answer: false,
        note: "Backprop chỉ *tính* gradient; việc dùng gradient đó thế nào là do thuật toán tối ưu quyết định.",
      },
    ],
    trap: "Ý (d) lặp lại nhầm lẫn phổ biến nhất về backprop. Nó là thuật toán vi phân tự động, không phải thuật toán tối ưu.",
    explanation:
      "Nắm được chi phí bộ nhớ theo (độ sâu × batch size) giúp giải thích ngay vì sao lỗi hết bộ nhớ xuất hiện khi tăng batch, và vì sao `torch.no_grad()` cho phép batch suy luận lớn hơn nhiều.",
  },

  /* ---------------- activations ---------------- */
  {
    id: "activations-01",
    syllabusId: "activations",
    difficulty: "recall",
    format: "single-choice",
    stem: "Công thức của ReLU là gì?",
    choices: ["f(x) = max(0, x)", "f(x) = 1/(1 + e⁻ˣ)", "f(x) = tanh(x)", "f(x) = x²"],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: giữ nguyên phần dương, cắt phần âm về 0.",
      "Sai: đó là sigmoid.",
      "Sai: đó là tanh, miền giá trị (−1, 1).",
      "Sai: bình phương không được dùng làm hàm kích hoạt tiêu chuẩn.",
    ],
    explanation:
      "Đạo hàm của ReLU là 1 với x > 0 và 0 với x < 0 — không co nhỏ gradient, đó là lý do chính khiến nó thay thế sigmoid ở lớp ẩn.",
  },
  {
    id: "activations-02",
    syllabusId: "activations",
    difficulty: "understand",
    format: "single-choice",
    stem: "Điều gì xảy ra nếu bỏ toàn bộ hàm kích hoạt phi tuyến trong một mạng 10 lớp fully connected?",
    choices: [
      "Mạng học nhanh hơn nhưng kém chính xác một chút.",
      "Toàn bộ mạng suy biến thành một phép biến đổi tuyến tính duy nhất, tương đương một lớp duy nhất.",
      "Mạng vẫn học được hàm phi tuyến nhờ số lớp lớn.",
      "Mạng báo lỗi khi lan truyền ngược.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: vấn đề không phải tốc độ mà là năng lực biểu diễn bị sụp đổ.",
      "Đúng: hợp của các ánh xạ affine vẫn là một ánh xạ affine.",
      "Sai: số lớp không tạo ra phi tuyến nếu không có hàm kích hoạt.",
      "Sai: mã vẫn chạy bình thường — lỗi ở đây là lỗi thiết kế, không phải lỗi kỹ thuật.",
    ],
    explanation:
      "Đây là lý do tồn tại của hàm kích hoạt: chúng là nguồn phi tuyến duy nhất, nhờ đó mạng nhiều lớp mới mạnh hơn mô hình tuyến tính.",
  },
  {
    id: "activations-03",
    syllabusId: "activations",
    difficulty: "apply",
    format: "numeric",
    stem: "Đạo hàm của hàm sigmoid tại `x = 0` bằng bao nhiêu?",
    answer: 0.25,
    tolerance: 0.001,
    calculation: [
      "σ′(x) = σ(x)·(1 − σ(x)).",
      "σ(0) = 0.5.",
      "σ′(0) = 0.5 × 0.5 = 0.25 — đây cũng là giá trị lớn nhất của σ′.",
    ],
    explanation:
      "Vì cực đại của đạo hàm chỉ là 0.25, mỗi lớp sigmoid nhân gradient với một hệ số ≤ 0.25. Qua 10 lớp, hệ số suy giảm tối đa là 0.25¹⁰ ≈ 10⁻⁶.",
  },
  {
    id: "activations-04",
    syllabusId: "activations",
    difficulty: "apply",
    format: "single-choice",
    stem: "“Dying ReLU” là hiện tượng gì?",
    choices: [
      "ReLU làm loss tăng vọt thành NaN.",
      "Một số nơ-ron luôn nhận đầu vào âm nên đầu ra và gradient của chúng luôn bằng 0, khiến chúng ngừng học vĩnh viễn.",
      "ReLU khiến trọng số tăng không giới hạn.",
      "ReLU chỉ hoạt động ở lớp đầu tiên.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: NaN thường do learning rate quá lớn hoặc chia cho 0.",
      "Đúng: khi đã rơi vào vùng âm với mọi dữ liệu, nơ-ron không còn đường nào để hồi phục vì gradient bằng 0.",
      "Sai: ReLU không chặn trên nhưng đó là vấn đề khác.",
      "Sai: ReLU dùng được ở mọi lớp ẩn.",
    ],
    explanation:
      "Phòng ngừa: learning rate vừa phải, khởi tạo He, hoặc dùng Leaky ReLU/ELU/GELU — các biến thể giữ một độ dốc nhỏ khác 0 ở phần âm.",
  },
  {
    id: "activations-05",
    syllabusId: "activations",
    difficulty: "advanced",
    format: "multi-select",
    stem: "Chọn tất cả phát biểu đúng về việc chọn hàm kích hoạt.",
    choices: [
      "Sigmoid vẫn là lựa chọn đúng cho lớp đầu ra của bài toán phân loại nhị phân.",
      "Softmax dùng cho lớp đầu ra phân loại nhiều lớp, biến logits thành phân phối xác suất cộng lại bằng 1.",
      "Tanh có tâm ở 0 nên thường hội tụ tốt hơn sigmoid khi dùng ở lớp ẩn, dù vẫn bị bão hoà.",
      "Nên đặt ReLU ở lớp đầu ra của bài toán hồi quy có giá trị mục tiêu nhận cả số âm.",
      "GELU và các biến thể trơn của ReLU được dùng phổ biến trong kiến trúc transformer.",
    ],
    answerIndexes: [0, 1, 2, 4],
    choiceNotes: [
      "Đúng: ở lớp đầu ra, tính chất bão hoà không gây vấn đề mà còn cho diễn giải xác suất.",
      "Đúng: softmax kèm cross-entropy là cặp tiêu chuẩn cho phân loại đơn nhãn nhiều lớp.",
      "Đúng: đầu ra có tâm 0 giúp gradient của lớp sau ít bị lệch một chiều.",
      "Sai: ReLU chặn mọi giá trị âm về 0, nên mô hình không bao giờ dự đoán được số âm.",
      "Đúng: GELU là mặc định trong nhiều mô hình transformer hiện đại.",
    ],
    scoring: "all-or-nothing",
    trap: "Điểm phân loại: phải tách bạch hàm kích hoạt cho *lớp ẩn* với hàm cho *lớp đầu ra*. Sigmoid dở ở lớp ẩn nhưng đúng ở lớp đầu ra; ReLU ngược lại.",
    explanation:
      "Quy tắc chọn nhanh: lớp ẩn dùng ReLU/GELU; đầu ra nhị phân dùng sigmoid; đầu ra nhiều lớp dùng softmax; đầu ra hồi quy không ràng buộc thì để tuyến tính.",
  },

  /* ---------------- losses ---------------- */
  {
    id: "losses-01",
    syllabusId: "losses",
    difficulty: "recall",
    format: "single-choice",
    stem: "Cặp hàm mất mát nào phù hợp với cặp bài toán (hồi quy, phân loại nhiều lớp)?",
    choices: [
      "(MSE, cross-entropy)",
      "(cross-entropy, MSE)",
      "(hinge, MAE)",
      "(MAE, MSE)",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: MSE/MAE cho mục tiêu liên tục; cross-entropy cho phân phối xác suất trên các lớp.",
      "Sai: hoán đổi hai bài toán.",
      "Sai: hinge dùng cho SVM; MAE là loss hồi quy.",
      "Sai: cả hai đều là loss hồi quy.",
    ],
    explanation:
      "Chọn loss là mô hình hoá dạng nhiễu: MSE tương ứng nhiễu Gaussian, cross-entropy tương ứng hợp lý cực đại của phân phối phân loại.",
  },
  {
    id: "losses-02",
    syllabusId: "losses",
    difficulty: "understand",
    format: "single-choice",
    stem: "Vì sao các thư viện khuyến nghị truyền *logits* (chưa qua softmax) vào hàm cross-entropy thay vì truyền xác suất?",
    choices: [
      "Vì logits tính nhanh hơn.",
      "Vì kết hợp log và softmax trong một phép (log-sum-exp) ổn định số học hơn, tránh tràn số và tránh log(0).",
      "Vì xác suất không khả vi.",
      "Vì logits luôn nằm trong khoảng (0, 1).",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: khác biệt tốc độ không đáng kể.",
      "Đúng: đây là lý do `nn.CrossEntropyLoss` nhận logits và `log_softmax` tồn tại.",
      "Sai: xác suất vẫn khả vi.",
      "Sai: logits là số thực không bị chặn.",
    ],
    explanation:
      "Lỗi thường gặp: áp softmax rồi lại truyền vào `CrossEntropyLoss` — mô hình vẫn chạy và loss vẫn giảm, nhưng gradient bị bóp méo và kết quả kém hơn hẳn.",
  },
  {
    id: "losses-03",
    syllabusId: "losses",
    difficulty: "apply",
    format: "numeric",
    stem: "Một mẫu có nhãn đúng là lớp 2. Mô hình dự đoán xác suất cho lớp 2 là 0.5. Cross-entropy của mẫu này (dùng logarit tự nhiên) bằng bao nhiêu?",
    answer: 0.693,
    tolerance: 0.005,
    calculation: [
      "Với nhãn one-hot, CE = −log(p của lớp đúng).",
      "CE = −ln(0.5) = ln 2 ≈ 0.693.",
    ],
    explanation:
      "Mốc cần thuộc: đoán đều cho C lớp cho CE = ln C. Với 2 lớp là 0.693, với 10 lớp là 2.303. Loss huấn luyện cao hơn mốc này nghĩa là mô hình còn tệ hơn đoán ngẫu nhiên.",
  },
  {
    id: "losses-04",
    syllabusId: "losses",
    difficulty: "apply",
    format: "single-choice",
    stem: "Bài toán hồi quy có một số nhãn bị nhập sai thành giá trị cực lớn. Loss nào hạn chế được ảnh hưởng của chúng mà vẫn khả vi ở mọi điểm?",
    choices: [
      "MSE, vì nó khả vi.",
      "Huber loss: bậc hai với sai số nhỏ và tuyến tính với sai số lớn.",
      "Cross-entropy.",
      "Hinge loss.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: MSE khuếch đại đúng những mẫu sai lệch lớn nhất.",
      "Đúng: Huber giữ ưu điểm của MSE gần 0 và độ bền của MAE ở đuôi.",
      "Sai: đó là loss phân loại.",
      "Sai: hinge dành cho phân loại có lề.",
    ],
    explanation:
      "Tham số δ của Huber quyết định ranh giới giữa vùng bậc hai và vùng tuyến tính; nó nên được chọn theo thang đo sai số điển hình của bài toán.",
  },
  {
    id: "losses-05",
    syllabusId: "losses",
    difficulty: "advanced",
    format: "single-choice",
    stem: "Bài toán phân loại nhị phân với 2% mẫu dương. Mô hình huấn luyện bằng cross-entropy không trọng số hội tụ về trạng thái dự đoán gần như luôn âm. Cách can thiệp *ở tầng hàm mất mát* phù hợp nhất là gì?",
    choices: [
      "Đổi sang MSE để phạt nặng hơn.",
      "Dùng cross-entropy có trọng số lớp hoặc focal loss, để mẫu dương và mẫu khó đóng góp nhiều hơn vào gradient.",
      "Bỏ hoàn toàn hàm mất mát và tối ưu trực tiếp accuracy.",
      "Tăng learning rate lên 10 lần.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: MSE không sửa được mất cân bằng và còn kém phù hợp cho phân loại.",
      "Đúng: cả hai đều tái phân bổ trọng số gradient về phía lớp hiếm hoặc mẫu khó.",
      "Sai: accuracy là hàm bậc thang, gradient bằng 0 hầu khắp nên không tối ưu trực tiếp được.",
      "Sai: learning rate không xử lý được sự mất cân bằng của tín hiệu học.",
    ],
    trap: "Phương án “tối ưu trực tiếp accuracy” nghe rất hợp lý vì đó chính là thứ ta quan tâm — nhưng nó không khả vi, và đó là lý do tồn tại của các loss thay thế.",
    explanation:
      "Ba tầng can thiệp cho dữ liệu mất cân bằng, nên dùng phối hợp: tầng dữ liệu (lấy mẫu lại), tầng hàm mất mát (trọng số lớp, focal), và tầng quyết định (chọn ngưỡng theo chi phí).",
  },

  /* ---------------- mlp ---------------- */
  {
    id: "mlp-01",
    syllabusId: "mlp",
    difficulty: "recall",
    format: "single-choice",
    stem: "Một multi-layer perceptron gồm những thành phần nào?",
    choices: [
      "Các lớp kết nối đầy đủ xen kẽ với hàm kích hoạt phi tuyến.",
      "Các lớp tích chập và pooling.",
      "Các khối attention và feed-forward.",
      "Các cây quyết định được cộng dồn.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: đây là định nghĩa của MLP.",
      "Sai: đó là CNN.",
      "Sai: đó là transformer.",
      "Sai: đó là gradient boosting.",
    ],
    explanation:
      "MLP không giả định gì về cấu trúc dữ liệu, nên dùng được cho dữ liệu bảng, nhưng cũng vì thế mà kém hiệu quả với ảnh hoặc chuỗi so với kiến trúc chuyên biệt.",
  },
  {
    id: "mlp-02",
    syllabusId: "mlp",
    difficulty: "understand",
    format: "single-choice",
    stem: "Định lý xấp xỉ phổ quát nói rằng mạng một lớp ẩn đủ rộng xấp xỉ được mọi hàm liên tục trên tập compact. Hệ quả thực hành đúng là gì?",
    choices: [
      "Chỉ cần một lớp ẩn là đủ cho mọi bài toán thực tế.",
      "Định lý bảo đảm *tồn tại* bộ trọng số, nhưng không nói gì về việc huấn luyện có tìm ra được nó, cần bao nhiêu nơ-ron hay bao nhiêu dữ liệu.",
      "Mạng sâu không bao giờ tốt hơn mạng nông.",
      "Định lý bảo đảm mô hình sẽ tổng quát hoá tốt.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: số nơ-ron cần thiết có thể lớn đến mức không khả thi.",
      "Đúng: đây là khoảng cách giữa khả năng biểu diễn và khả năng học được.",
      "Sai: thực nghiệm cho thấy mạng sâu biểu diễn nhiều hàm hiệu quả hơn hẳn về số tham số.",
      "Sai: định lý chỉ nói về khớp hàm, không nói về tổng quát hoá.",
    ],
    explanation:
      "Ba câu hỏi luôn tách rời nhau: mô hình *có thể* biểu diễn không (representation), thuật toán *có tìm được* không (optimization), và kết quả *có tổng quát hoá* không (generalization).",
  },
  {
    id: "mlp-03",
    syllabusId: "mlp",
    difficulty: "apply",
    format: "numeric",
    stem: "MLP có kiến trúc 10 → 20 → 5 (hai lớp Linear, đều có bias). Tổng số tham số học được là bao nhiêu?",
    answer: 325,
    tolerance: 0,
    calculation: [
      "Lớp 1: trọng số 20 × 10 = 200, bias 20 → 220.",
      "Lớp 2: trọng số 5 × 20 = 100, bias 5 → 105.",
      "Tổng: 220 + 105 = 325.",
    ],
    explanation:
      "Số tham số của một lớp Linear là (số đầu vào × số đầu ra) + số đầu ra. Ước lượng nhanh con số này giúp phán đoán rủi ro overfitting so với lượng dữ liệu có sẵn.",
  },
  {
    id: "mlp-04",
    syllabusId: "mlp",
    difficulty: "apply",
    format: "single-choice",
    stem: "Vì sao dùng MLP trên ảnh 224×224×3 bằng cách trải phẳng thành vector là lựa chọn kém?",
    choices: [
      "Vì MLP không xử lý được đầu vào số thực.",
      "Vì mất hoàn toàn cấu trúc không gian lân cận và số tham số của lớp đầu bùng nổ (hơn 150.000 đầu vào cho mỗi nơ-ron), lại không có tính tương đương tịnh tiến.",
      "Vì MLP chỉ nhận đầu vào tối đa 1.000 chiều.",
      "Vì ảnh màu cần ba mạng riêng biệt.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: MLP nhận số thực bình thường.",
      "Đúng: ba vấn đề cùng lúc — cấu trúc, số tham số và tính tương đương tịnh tiến.",
      "Sai: không có giới hạn cứng như vậy.",
      "Sai: ba kênh được xử lý trong cùng một mạng.",
    ],
    explanation:
      "Convolution giải quyết cả ba: dùng chung trọng số theo vị trí, kết nối cục bộ và **tương đương tịnh tiến** (translation-equivariant) — dịch ảnh đi thì feature map dịch theo đúng chừng ấy. Nói chính xác thì bản thân convolution *không* bất biến tịnh tiến; tính bất biến gần đúng chỉ xuất hiện sau pooling hoặc global average pooling. Đây chính là lý do CNN ra đời.",
  },
  {
    id: "mlp-05",
    syllabusId: "mlp",
    difficulty: "advanced",
    format: "single-choice",
    stem: "Tăng độ sâu của một MLP thuần từ 8 lên 40 lớp khiến *cả* lỗi train lẫn lỗi test đều tệ hơn. Kết luận đúng nhất là gì?",
    choices: [
      "Đây là overfitting do mô hình quá lớn.",
      "Đây là vấn đề suy giảm (degradation) do tối ưu: mạng sâu hơn có năng lực biểu diễn lớn hơn nhưng khó huấn luyện hơn; kết nối tắt và chuẩn hoá là cách khắc phục.",
      "Đây là underfitting do thiếu tham số.",
      "Đây là dấu hiệu dữ liệu bị rò rỉ.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: overfitting làm lỗi *train* giảm; ở đây lỗi train cũng tăng.",
      "Đúng: mạng 40 lớp về lý thuyết biểu diễn được mọi thứ mạng 8 lớp làm được, nên vấn đề nằm ở khả năng huấn luyện.",
      "Sai: mạng sâu hơn có nhiều tham số hơn.",
      "Sai: leakage cho kết quả tốt bất thường, không phải xấu đi.",
    ],
    trap: "Điểm phân loại nằm ở việc đọc *lỗi train*. Phản xạ “sâu hơn thì overfit” sai ngay khi thấy lỗi train cũng tăng — đó là dấu hiệu của tối ưu, không phải của variance.",
    explanation:
      "Đây chính là quan sát dẫn tới ResNet: kết nối tắt cho phép mạng học phần dư và giữ đường truyền gradient ngắn, nhờ đó huấn luyện được mạng rất sâu.",
  },

  /* ---------------- sgd ---------------- */
  {
    id: "sgd-01",
    syllabusId: "sgd",
    difficulty: "recall",
    format: "single-choice",
    stem: "Khác biệt giữa batch gradient descent và mini-batch SGD là gì?",
    choices: [
      "Batch GD tính gradient trên toàn bộ tập train cho mỗi bước cập nhật; mini-batch SGD tính trên một nhóm nhỏ mẫu.",
      "Batch GD không dùng gradient.",
      "Mini-batch SGD chỉ dùng cho bài toán phân loại.",
      "Hai phương pháp chỉ khác nhau ở learning rate.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: khác biệt nằm ở lượng dữ liệu dùng để ước lượng gradient mỗi bước.",
      "Sai: cả hai đều dựa trên gradient.",
      "Sai: dùng được cho mọi bài toán tối ưu bằng gradient.",
      "Sai: learning rate là tham số riêng, không phải điểm phân biệt.",
    ],
    explanation:
      "Mini-batch là điểm cân bằng thực dụng: gradient đủ ổn định để học, đủ nhiễu để thoát vùng phẳng, và tận dụng được tính song song của GPU.",
  },
  {
    id: "sgd-02",
    syllabusId: "sgd",
    difficulty: "understand",
    format: "single-choice",
    stem: "Giảm batch size từ 512 xuống 32 ảnh hưởng thế nào tới quá trình huấn luyện?",
    choices: [
      "Ước lượng gradient nhiễu hơn, đường cong loss dao động mạnh hơn, nhưng số bước cập nhật mỗi epoch tăng lên.",
      "Ước lượng gradient chính xác hơn và ổn định hơn.",
      "Không ảnh hưởng gì tới quá trình học.",
      "Bộ nhớ GPU cần dùng tăng lên.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: phương sai của gradient ước lượng tỷ lệ nghịch với batch size.",
      "Sai: batch lớn mới cho ước lượng ít nhiễu hơn.",
      "Sai: batch size ảnh hưởng cả nhiễu, tốc độ lẫn kết quả cuối.",
      "Sai: batch nhỏ hơn cần *ít* bộ nhớ hơn.",
    ],
    explanation:
      "Nhiễu của mini-batch không hoàn toàn có hại: nó đóng vai trò như một dạng regularization ngầm, giúp mô hình tránh những cực tiểu quá hẹp.",
  },
  {
    id: "sgd-03",
    syllabusId: "sgd",
    difficulty: "apply",
    format: "numeric",
    stem: "Tập huấn luyện có 10.000 mẫu, batch size 32, và batch cuối cùng không đầy vẫn được dùng. Một epoch có bao nhiêu bước cập nhật trọng số?",
    answer: 313,
    tolerance: 0,
    calculation: [
      "10.000 / 32 = 312.5.",
      "312 batch đầy đủ, cộng một batch cuối gồm 10.000 − 312×32 = 16 mẫu.",
      "Tổng: 313 bước cập nhật.",
    ],
    explanation:
      "Con số này quyết định lịch learning rate theo bước và tần suất ghi log. Nếu đặt `drop_last=True` thì batch 16 mẫu bị bỏ và chỉ còn 312 bước.",
  },
  {
    id: "sgd-04",
    syllabusId: "sgd",
    difficulty: "apply",
    format: "single-choice",
    stem: "Vì sao nên xáo trộn (shuffle) dữ liệu ở mỗi epoch khi huấn luyện bằng mini-batch SGD?",
    choices: [
      "Để tăng tốc độ đọc dữ liệu từ đĩa.",
      "Để mỗi batch là một mẫu ngẫu nhiên đại diện cho phân phối, tránh việc thứ tự dữ liệu (ví dụ đã sắp theo lớp) tạo ra gradient thiên lệch có hệ thống.",
      "Để giảm dung lượng bộ nhớ.",
      "Để bảo đảm mỗi mẫu được dùng nhiều lần trong một epoch.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: xáo trộn thường làm việc đọc tuần tự *chậm* hơn.",
      "Đúng: dữ liệu sắp theo lớp sẽ tạo các batch chỉ gồm một lớp — gradient khi đó rất lệch.",
      "Sai: không liên quan tới bộ nhớ.",
      "Sai: mỗi epoch mỗi mẫu vẫn được dùng đúng một lần.",
    ],
    explanation:
      "Trường hợp hỏng kinh điển: tập dữ liệu sắp theo nhãn, không xáo trộn, mô hình lần lượt “quên” lớp cũ theo từng đoạn — loss dao động theo chu kỳ rất đặc trưng.",
  },
  {
    id: "sgd-05",
    syllabusId: "sgd",
    difficulty: "advanced",
    format: "true-false-set",
    stem: "Xét ảnh hưởng của việc tăng batch size lên rất lớn khi huấn luyện mạng sâu.",
    statements: [
      {
        text: "Khi tăng batch size, thường phải tăng learning rate tương ứng để giữ tiến độ học mỗi epoch.",
        answer: true,
        note: "Quy tắc kinh nghiệm phổ biến là tăng learning rate tuyến tính theo batch size, kèm giai đoạn warmup.",
      },
      {
        text: "Batch rất lớn có thể làm mô hình tổng quát hoá kém hơn nếu không điều chỉnh lịch learning rate.",
        answer: true,
        note: "Nhiễu gradient giảm làm mất tác dụng regularization ngầm của SGD.",
      },
      {
        text: "Tăng batch size làm giảm số bước cập nhật trong mỗi epoch.",
        answer: true,
        note: "Số bước bằng số mẫu chia batch size, nên tăng batch thì số bước giảm theo.",
      },
      {
        text: "Batch size lớn luôn cho thời gian huấn luyện tổng thể ngắn hơn tính theo giờ đồng hồ.",
        answer: false,
        note: "Mỗi bước rẻ hơn tính trên mỗi mẫu, nhưng cần nhiều epoch hơn để hội tụ, và lợi ích bão hoà khi vượt quá khả năng song song của phần cứng.",
      },
    ],
    trap: "Bộ ba (a)–(c) đều đúng khiến người làm dễ chọn (d) đúng theo quán tính. Đây là kiểu bẫy quán tính hay gặp ở dạng đúng/sai bốn ý.",
    explanation:
      "Batch size không phải núm chỉnh độc lập: đổi nó buộc phải đổi learning rate, lịch warmup và số epoch. Báo cáo kết quả mà chỉ đổi batch size là so sánh không công bằng.",
  },

  /* ---------------- adam ---------------- */
  {
    id: "adam-01",
    syllabusId: "adam",
    difficulty: "recall",
    format: "single-choice",
    stem: "Adam kết hợp hai ý tưởng nào?",
    choices: [
      "Momentum (trung bình trượt của gradient) và learning rate thích nghi theo từng tham số (trung bình trượt của bình phương gradient).",
      "Dropout và batch normalization.",
      "Early stopping và weight decay.",
      "Gradient clipping và label smoothing.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: moment bậc một cho hướng, moment bậc hai cho độ lớn bước theo từng tham số.",
      "Sai: đó là các kỹ thuật regularization, không phải thành phần của optimizer.",
      "Sai: đó cũng là kỹ thuật regularization/điều khiển huấn luyện.",
      "Sai: hai kỹ thuật này độc lập với Adam.",
    ],
    explanation:
      "Vì mỗi tham số có bước riêng, Adam ít nhạy với việc chọn learning rate ban đầu — đó là lý do nó thường là lựa chọn mặc định khi bắt đầu một bài toán mới.",
  },
  {
    id: "adam-02",
    syllabusId: "adam",
    difficulty: "understand",
    format: "single-choice",
    stem: "Momentum giúp gì cho quá trình tối ưu?",
    choices: [
      "Tích luỹ hướng di chuyển qua các bước, giúp tăng tốc theo hướng nhất quán và giảm dao động ngang trong các khe hẹp.",
      "Giảm số tham số của mô hình.",
      "Bảo đảm hội tụ về cực tiểu toàn cục.",
      "Thay thế cho việc chuẩn hoá dữ liệu.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: hình dung như quả bóng lăn — nó giữ quán tính theo hướng dốc ổn định.",
      "Sai: momentum không đổi kiến trúc.",
      "Sai: không có bảo đảm toàn cục.",
      "Sai: chuẩn hoá dữ liệu vẫn cần thiết.",
    ],
    explanation:
      "Trong khe hẹp (mặt lỗi kéo dài), gradient dao động mạnh theo chiều hẹp và rất nhỏ theo chiều dài. Momentum triệt tiêu dao động ngang và cộng dồn tiến bộ theo chiều dài.",
  },
  {
    id: "adam-03",
    syllabusId: "adam",
    difficulty: "apply",
    format: "single-choice",
    stem: "Vì sao Adam cần bước hiệu chỉnh thiên lệch (bias correction) ở các bước đầu?",
    choices: [
      "Vì gradient ban đầu luôn sai.",
      "Vì các moment được khởi tạo bằng 0 nên trung bình trượt bị kéo lệch về 0 ở những bước đầu; hiệu chỉnh khôi phục thang đo đúng.",
      "Vì learning rate ban đầu quá lớn.",
      "Vì trọng số chưa được khởi tạo.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: gradient ban đầu vẫn là ước lượng hợp lệ.",
      "Đúng: với β₁ = 0.9, sau bước đầu tiên m₁ chỉ bằng 10% và v₁ chỉ bằng 0.1% giá trị đáng có nếu không hiệu chỉnh.",
      "Sai: đây là vấn đề riêng của thống kê moment.",
      "Sai: trọng số đã được khởi tạo trước khi huấn luyện.",
    ],
    explanation:
      "Chú ý hai moment lệch **không** cùng mức nên tác động không triệt tiêu nhau. Với β₁ = 0.9, β₂ = 0.999, bước đầu chưa hiệu chỉnh có tỷ lệ m₁/√v₁ bị nhân thêm hệ số (1 − β₁)/√(1 − β₂) ≈ 3.16, tức bước cập nhật thường **lớn hơn** mức đáng có chứ không nhỏ đi. Sau vài trăm bước, hai hệ số hiệu chỉnh cùng tiến về 1 và ảnh hưởng biến mất.",
  },
  {
    id: "adam-04",
    syllabusId: "adam",
    difficulty: "apply",
    format: "single-choice",
    stem: "Khi nào SGD kèm momentum thường được ưu tiên hơn Adam?",
    choices: [
      "Khi cần nguyên mẫu nhanh trên bài toán mới chưa biết learning rate phù hợp.",
      "Khi huấn luyện các mô hình thị giác đã có công thức huấn luyện chuẩn, nơi SGD + momentum kèm lịch learning rate thường cho kết quả cuối tốt hơn.",
      "Khi dữ liệu rất thưa.",
      "Khi mô hình có ít hơn 1.000 tham số.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: đó chính là điểm mạnh của Adam.",
      "Đúng: nhiều kết quả tham chiếu trên ImageNet dùng SGD + momentum + cosine/step schedule.",
      "Sai: dữ liệu thưa là nơi các phương pháp thích nghi tỏ ra mạnh.",
      "Sai: số tham số nhỏ không phải tiêu chí chọn.",
    ],
    explanation:
      "Kinh nghiệm thực hành: Adam để dò nhanh và cho transformer/NLP; SGD + momentum khi cần vắt kiệt điểm cuối trên các kiến trúc thị giác đã có công thức chuẩn.",
  },
  {
    id: "adam-05",
    syllabusId: "adam",
    difficulty: "advanced",
    format: "single-choice",
    stem: "AdamW khác Adam ở điểm nào và vì sao khác biệt đó quan trọng?",
    choices: [
      "AdamW dùng learning rate lớn hơn theo mặc định.",
      "AdamW tách weight decay ra khỏi gradient của hàm mất mát, áp thẳng vào trọng số; trong Adam, L2 cộng vào gradient bị chia bởi moment bậc hai nên cường độ phạt bị méo theo từng tham số.",
      "AdamW không dùng momentum.",
      "AdamW chỉ dùng được cho transformer.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: learning rate mặc định không phải khác biệt bản chất.",
      "Đúng: đây chính là nội dung của bài báo “Decoupled Weight Decay Regularization”.",
      "Sai: AdamW vẫn giữ đầy đủ hai moment.",
      "Sai: dùng được cho mọi kiến trúc.",
    ],
    trap: "Bẫy là coi “L2 regularization” và “weight decay” luôn tương đương. Chúng tương đương với SGD thuần, nhưng *không* tương đương khi optimizer chia bước theo từng tham số.",
    explanation:
      "Hệ quả thực hành: khi dùng Adam mà muốn regularization hoạt động như mong đợi, hãy chọn AdamW và đặt `weight_decay` ở đó, thay vì cộng thủ công số hạng L2 vào loss.",
  },

  /* ---------------- convergence ---------------- */
  {
    id: "convergence-01",
    syllabusId: "convergence",
    difficulty: "recall",
    format: "single-choice",
    stem: "Learning rate schedule là gì?",
    choices: [
      "Quy tắc thay đổi learning rate theo tiến trình huấn luyện, ví dụ giảm dần theo bậc thang hoặc theo hàm cosine.",
      "Danh sách các learning rate được thử song song.",
      "Cách chia dữ liệu thành các batch.",
      "Số epoch tối đa được phép chạy.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: bước lớn ở giai đoạn đầu để đi nhanh, bước nhỏ về sau để tinh chỉnh.",
      "Sai: đó là dò siêu tham số.",
      "Sai: đó là cấu hình dataloader.",
      "Sai: đó là ngân sách huấn luyện.",
    ],
    explanation:
      "Trực giác: đầu quá trình cần đi xa nên bước dài; cuối quá trình cần dừng chính xác trong một vùng hẹp nên bước phải ngắn.",
  },
  {
    id: "convergence-02",
    syllabusId: "convergence",
    difficulty: "understand",
    format: "single-choice",
    stem: "Vì sao nhiều công thức huấn luyện transformer dùng giai đoạn warmup (tăng dần learning rate từ rất nhỏ trong vài nghìn bước đầu)?",
    choices: [
      "Để tiết kiệm điện năng ở giai đoạn đầu.",
      "Vì ở những bước đầu, thống kê moment của optimizer chưa đáng tin và trọng số còn ngẫu nhiên, nên bước lớn dễ đẩy mô hình vào vùng tồi hoặc gây phân kỳ.",
      "Vì dữ liệu đầu epoch luôn khó hơn.",
      "Vì warmup thay thế được cho việc chuẩn hoá đầu vào.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: không liên quan tới tiêu thụ năng lượng.",
      "Đúng: warmup cho optimizer thời gian tích luỹ thống kê trước khi đi bước dài.",
      "Sai: độ khó dữ liệu không phụ thuộc vị trí trong epoch nếu đã xáo trộn.",
      "Sai: hai kỹ thuật giải quyết hai vấn đề khác nhau.",
    ],
    explanation:
      "Warmup đặc biệt quan trọng với batch lớn và learning rate lớn, vốn là cấu hình tiêu chuẩn khi huấn luyện mô hình ngôn ngữ quy mô lớn.",
  },
  {
    id: "convergence-03",
    syllabusId: "convergence",
    difficulty: "apply",
    format: "multi-select",
    stem: "Loss đột ngột trở thành `NaN` sau vài trăm bước huấn luyện. Chọn tất cả nguyên nhân đáng nghi.",
    choices: [
      "Learning rate quá cao gây bùng nổ gradient.",
      "Phép `log` áp lên giá trị bằng 0 hoặc phép chia cho 0 trong hàm mất mát tự viết.",
      "Dữ liệu đầu vào có sẵn giá trị `NaN` hoặc `inf` chưa được lọc.",
      "Batch size là số lẻ.",
      "Dùng độ chính xác hỗn hợp mà không có loss scaling phù hợp.",
    ],
    answerIndexes: [0, 1, 2, 4],
    choiceNotes: [
      "Đáng nghi: đây là nguyên nhân phổ biến nhất, kiểm tra đầu tiên.",
      "Đáng nghi: cần cộng epsilon hoặc dùng phiên bản ổn định số học của hàm.",
      "Đáng nghi: một `NaN` trong dữ liệu lan ra toàn bộ tham số chỉ sau một bước.",
      "Không liên quan: tính chẵn lẻ của batch size không ảnh hưởng gì.",
      "Đáng nghi: fp16 tràn số ở gradient nhỏ hoặc lớn nếu không scale loss.",
    ],
    scoring: "all-or-nothing",
    explanation:
      "Quy trình truy vết: bật phát hiện bất thường của autograd, kiểm tra dữ liệu đầu vào, in chuẩn gradient theo bước, rồi hạ learning rate và thêm gradient clipping.",
  },
  {
    id: "convergence-04",
    syllabusId: "convergence",
    difficulty: "apply",
    format: "single-choice",
    stem: "Loss huấn luyện tiếp tục giảm đều trong khi loss validation đã chạm đáy ở epoch 12 rồi tăng dần. Hành động đúng là gì?",
    choices: [
      "Tiếp tục huấn luyện tới hết ngân sách epoch rồi lấy mô hình cuối cùng.",
      "Dừng sớm và khôi phục checkpoint tại epoch 12, đồng thời cân nhắc tăng regularization.",
      "Tăng learning rate để loss validation giảm trở lại.",
      "Bỏ tập validation và chỉ theo dõi loss train.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: mô hình cuối đã overfit rõ rệt so với điểm tốt nhất.",
      "Đúng: đây chính là định nghĩa của early stopping kèm khôi phục trọng số tốt nhất.",
      "Sai: tăng learning rate không xử lý được overfitting.",
      "Sai: bỏ validation là bỏ luôn khả năng phát hiện vấn đề.",
    ],
    explanation:
      "Nhớ bật `restore_best_weights` (hoặc lưu checkpoint theo chỉ số validation). Dừng sớm mà vẫn giữ trọng số cuối cùng thì mất phần lớn lợi ích.",
  },
  {
    id: "convergence-05",
    syllabusId: "convergence",
    difficulty: "advanced",
    format: "single-choice",
    stem: "Loss validation giảm đều nhưng chỉ số nghiệp vụ (ví dụ F1 của lớp hiếm) đứng yên suốt quá trình huấn luyện. Kết luận hợp lý nhất là gì?",
    choices: [
      "Loss được cài đặt sai, cần viết lại.",
      "Loss và chỉ số đánh giá đo hai thứ khác nhau: mô hình đang cải thiện mức hiệu chỉnh xác suất trên lớp đa số mà không cải thiện thứ hạng hay quyết định trên lớp hiếm.",
      "Cần tăng số epoch lên gấp năm lần.",
      "Tập validation quá lớn.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: loss giảm đều là dấu hiệu cài đặt đúng; vấn đề nằm ở sự lệch mục tiêu.",
      "Đúng: cross-entropy trung bình trên toàn bộ mẫu bị lớp đa số chi phối, còn F1 lớp hiếm phụ thuộc một nhóm nhỏ mẫu và ngưỡng quyết định.",
      "Sai: kéo dài huấn luyện không thu hẹp khoảng cách giữa hai mục tiêu.",
      "Sai: tập validation lớn làm ước lượng *tốt* hơn.",
    ],
    trap: "Bẫy là dùng loss làm thước đo tiến bộ duy nhất. Loss chỉ là đại lượng thay thế khả vi cho thứ ta thực sự quan tâm; hai đại lượng này có thể tách rời nhau.",
    explanation:
      "Cách xử lý: theo dõi chỉ số nghiệp vụ song song với loss ngay từ đầu, chọn checkpoint theo chỉ số nghiệp vụ, và cân nhắc đổi loss (trọng số lớp, focal) hoặc dò lại ngưỡng quyết định.",
  },
];
