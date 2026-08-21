import type { LessonTheoryMap } from "./types";

export const deepLearningTheoryA = {
  "dl-perceptron": {
    lessonId: "dl-perceptron",
    readingMinutes: 24,
    openingQuestions: [
      "Vì sao một tích vô hướng có thể tạo thành biên quyết định?",
      "Điều kiện nào khiến quy tắc học perceptron hội tụ?",
      "Tại sao đầu ra perceptron không phải là xác suất?",
    ],
    sections: [
      {
        title: "Điểm số tuyến tính và hình học của biên",
        paragraphs: [
          "Perceptron nhận x thuộc R^d, tính z = w^T x + b rồi áp dụng hàm ngưỡng. Với nhãn 0/1, mô hình trả 1 khi z >= 0 và trả 0 khi z < 0. Vectơ w vuông góc với siêu phẳng w^T x + b = 0; dấu của z cho biết mẫu nằm ở phía nào, còn |z|/||w||_2 là khoảng cách đến biên. Thay đổi hướng w sẽ xoay biên, trong khi thay đổi b sẽ tịnh tiến biên mà không đổi pháp tuyến.",
          "Với batch X shape (B, d), w shape (d,) và b vô hướng, Xw + b phải tạo B điểm số. Bias được broadcast cho mọi mẫu chứ không phải một bias riêng cho từng hàng. Perceptron chỉ tạo biên tuyến tính trong không gian đặc trưng hiện tại. Thêm đặc trưng như x_1*x_2 hoặc x_1^2 có thể làm bài toán tuyến tính ở không gian mới, nhưng đó là thay đổi biểu diễn đầu vào chứ không làm bản thân bộ phân loại trở thành phi tuyến.",
        ],
        formulas: [
          "z = w^T x + b; y_hat = 1[z >= 0]",
          "signed_distance = (w^T x + b) / ||w||_2",
        ],
      },
      {
        title: "Quy tắc sửa lỗi và điều kiện hội tụ",
        paragraphs: [
          "Đặt e = y - y_hat. Quy tắc online là w <- w + eta e x và b <- b + eta e. Mẫu dương bị đoán thành 0 có e = 1 nên điểm số của nó được kéo lên; mẫu âm bị đoán thành 1 có e = -1 nên điểm số bị đẩy xuống. Mẫu đã đúng cho e = 0 và không đổi tham số. Đây là quy tắc sửa lỗi rời rạc, không phải gradient descent qua hàm ngưỡng, vì đạo hàm của hàm ngưỡng bằng 0 gần như mọi nơi và không xác định tại ngưỡng.",
          "Định lý hội tụ perceptron cần dữ liệu phân tách tuyến tính với biên dương. Khi giả định đó đúng, số lỗi là hữu hạn; định lý không nói nghiệm là duy nhất hoặc có biên lớn nhất. Với dữ liệu chồng lấn, nhiễu nhãn hay mẫu XOR, tham số có thể dao động mãi. Khi đó phải giới hạn epoch, theo dõi số lỗi, cân nhắc averaged perceptron, đổi đặc trưng hoặc dùng logistic regression/SVM tùy mục tiêu xác suất và biên.",
        ],
        formulas: [
          "w_next = w + eta (y - y_hat) x",
          "b_next = b + eta (y - y_hat)",
        ],
      },
      {
        title: "Giới hạn, đánh giá và mở rộng",
        paragraphs: [
          "Perceptron là mô hình tốt để học phép affine, bias và cập nhật online, nhưng điểm z không được hiệu chuẩn thành xác suất: z = 0.8 không có nghĩa xác suất lớp dương là 80%. Scale đặc trưng ảnh hưởng mạnh tới độ lớn cập nhật, nên các chiều có đơn vị rất khác nhau cần được chuẩn hóa. Với C lớp, multiclass perceptron dùng W shape (C, d), chọn argmax điểm số, tăng hàng của lớp thật và giảm hàng của lớp dự đoán khi phân loại sai.",
          "Không đánh giá chỉ bằng accuracy trên tập huấn luyện. Cần tách validation, xem confusion matrix khi lệch lớp và kiểm tra các điểm sát biên. Nếu lỗi tập trung ở một vùng, hãy hỏi dữ liệu có phân tách tuyến tính trong biểu diễn hiện tại không thay vì tăng epoch vô hạn. Mạng sâu vẫn dùng phép affine ở mỗi nơ-ron, nhưng activation khả vi và nhiều tầng cho phép học biểu diễn phi tuyến bằng backpropagation.",
        ],
        bullets: [
          "Không diễn giải điểm số ngưỡng như xác suất.",
          "Không hứa hội tụ nếu chưa kiểm tra giả định phân tách tuyến tính.",
          "Theo dõi số lỗi theo epoch để phát hiện dao động.",
        ],
      },
    ],
    workedExamples: [
      {
        title: "Sửa một mẫu dương bị đoán sai",
        problem: "Cho x = [2, -1] shape (2,), w = [0.5, 1.0], b = -0.2, eta = 0.1 và y = 1. Tính dự đoán, cập nhật và kiểm tra lại.",
        steps: [
          {
            state: "z = 0.5*2 + 1.0*(-1) - 0.2 = -0.2; y_hat = 0",
            explanation: "Điểm âm nên mô hình chọn lớp 0, trái với nhãn thật.",
          },
          {
            state: "e = 1; w_new = [0.5, 1.0] + 0.1*[2, -1] = [0.7, 0.9]",
            explanation: "Cập nhật đi theo đặc trưng của mẫu dương; chiều thứ hai âm làm w_2 giảm.",
          },
          {
            state: "b_new = -0.2 + 0.1 = -0.1",
            explanation: "Bias tăng để kéo điểm số của mẫu dương về phía dương.",
          },
          {
            state: "z_new = 0.7*2 + 0.9*(-1) - 0.1 = 0.4; y_hat_new = 1",
            explanation: "Sau cập nhật, chính mẫu đang xét đã chuyển sang phía đúng của biên.",
          },
        ],
        conclusion: "Một bước đã sửa mẫu này, nhưng chưa chứng minh toàn bộ tập được phân loại đúng hoặc thuật toán sẽ hội tụ.",
        sanityChecks: [
          "w_new vẫn có shape (2,) và b_new vẫn là vô hướng.",
          "Điểm số tăng từ -0.2 lên 0.4, đúng hướng cần thiết cho mẫu dương.",
          "Nếu dự đoán ban đầu đã đúng thì e = 0 và tham số phải giữ nguyên.",
        ],
      },
    ],
    implementationChecklist: [
      "Chốt quy ước nhãn 0/1 hoặc -1/+1 trước khi viết cập nhật.",
      "Kiểm tra X shape (B, d), w shape (d,) và số nhãn bằng B.",
      "Shuffle giữa các epoch nhưng giữ seed khi cần tái lập.",
      "Đặt giới hạn epoch và log số mẫu sai ở từng epoch.",
      "Viết test cho mẫu đúng, dương sai, âm sai và z đúng bằng 0.",
    ],
    masteryChecklist: [
      "Vẽ được w, biên và hai nửa không gian trong bài toán hai chiều.",
      "Tính tay một lượt dự đoán và cập nhật không nhầm dấu bias.",
      "Nêu đúng điều kiện hội tụ và phản ví dụ XOR.",
      "Phân biệt perceptron với logistic regression về activation, loss và xác suất.",
      "Nhận ra lỗi shape khi mở rộng sang batch hoặc nhiều lớp.",
    ],
    glossary: [
      { term: "Siêu phẳng", definition: "Tập điểm thỏa w^T x + b = 0, đóng vai trò biên tuyến tính." },
      { term: "Bias", definition: "Tham số dịch chuyển biên mà không phụ thuộc trực tiếp vào đặc trưng." },
      { term: "Hàm ngưỡng", definition: "Hàm rời rạc biến điểm số thành nhãn theo một ngưỡng." },
      { term: "Phân tách tuyến tính", definition: "Tồn tại một siêu phẳng đặt các lớp về đúng hai phía." },
      { term: "Biên dương", definition: "Khoảng cách tối thiểu khác 0 giữa mẫu và một siêu phẳng phân tách." },
      { term: "Averaged perceptron", definition: "Biến thể dùng trung bình tham số qua các bước để giảm dao động." },
    ],
    sourceIds: ["d2l-vi", "d2l-en", "mml", "ioai-2026"],
  },
  "dl-gradient-descent": {
    lessonId: "dl-gradient-descent",
    readingMinutes: 28,
    openingQuestions: [
      "Vì sao đi ngược gradient chỉ là bảo đảm cục bộ chứ không phải lời hứa toàn cục?",
      "Batch size và quy ước mean hoặc sum thay đổi độ lớn bước cập nhật ra sao?",
      "Tại sao cùng một learning rate ổn theo chiều này nhưng dao động theo chiều khác?",
    ],
    sections: [
      {
        title: "Đạo hàm cục bộ và hướng giảm",
        paragraphs: [
          "Với loss khả vi L(theta), gradient chứa đạo hàm riêng theo mọi tham số và có cùng cấu trúc shape với theta. Khai triển Taylor bậc nhất cho dịch chuyển nhỏ Delta cho L(theta + Delta) xấp xỉ L(theta) + grad L(theta)^T Delta. Chọn Delta = -eta grad L với eta dương đủ nhỏ làm số hạng bậc nhất bằng -eta||grad L||^2, nên loss được dự đoán giảm. Từ khóa là đủ nhỏ: độ cong và các số hạng bậc cao có thể làm một bước lớn tăng loss.",
          "Trong mạng nơ-ron, theta là tập nhiều tensor thay vì một vectơ được nối thật sự. Gradient của W shape (d_in, d_out) phải giữ shape đó; gradient của bias shape (d_out,) phải cộng đúng trên trục batch. Automatic differentiation tính gradient nhưng không tự bảo đảm loss đúng, reduction đúng hoặc tham số đang được optimizer quản lý. Cũng phải xóa gradient tích lũy đúng lúc, nếu không bước sau vô tình cộng thêm gradient của batch trước.",
        ],
        formulas: [
          "L(theta + Delta) ≈ L(theta) + grad L(theta)^T Delta",
          "theta_next = theta - eta grad L(theta)",
        ],
      },
      {
        title: "Full batch, stochastic và mini-batch",
        paragraphs: [
          "Full-batch gradient descent lấy trung bình trên toàn bộ N mẫu trước khi cập nhật, cho gradient xác định nhưng có thể tốn bộ nhớ và thời gian. Stochastic gradient descent dùng một mẫu nên rẻ nhưng nhiễu. Mini-batch dùng B mẫu để vector hóa tốt trên phần cứng và giảm phương sai. Nếu batch được lấy ngẫu nhiên đúng cách, gradient mini-batch là ước lượng không chệch của gradient toàn tập; điều này không có nghĩa từng bước mini-batch phải giảm loss toàn tập.",
          "Quy ước reduction quyết định scale. Với loss mean, tăng B không tự làm gradient lớn B lần; với loss sum, điều đó thường xảy ra. Gradient accumulation qua K micro-batch chỉ tương đương một batch lớn khi các micro-batch có cùng số mẫu và được chia nhất quán. Nếu batch cuối nhỏ hơn hoặc số token hợp lệ khác nhau, phải lấy trung bình có trọng số theo số mẫu hoặc token thay vì trung bình đều các mean. Shuffle và sampler cân bằng lớp còn có thể đổi phân phối cập nhật, nên báo cáo phải ghi batch size, sampler, reduction, accumulation steps và learning rate.",
        ],
        formulas: [
          "g_B(theta) = (1/B) sum_{i in batch} grad l_i(theta)",
          "E[g_B(theta)] = grad L(theta) under unbiased sampling",
        ],
      },
      {
        title: "Độ cong, hội tụ và chẩn đoán",
        paragraphs: [
          "Một mặt loss dạng thung lũng hẹp có độ cong khác nhau theo các hướng. Learning rate an toàn cho hướng dốc có thể khiến tiến triển theo hướng phẳng rất chậm; learning rate lớn để tăng tốc hướng phẳng lại gây dao động ngang thung lũng. Chuẩn hóa đặc trưng, initialization, momentum và optimizer thích nghi có thể cải thiện quỹ đạo, nhưng không thay thế việc kiểm tra learning rate. Gradient clipping chỉ hạn chế bước bất thường do gradient lớn, không chữa dữ liệu sai hay loss viết sai.",
          "Gradient bằng gần 0 không tự chứng minh đã đạt cực tiểu: đó có thể là saddle point, activation bão hòa hoặc tham số bị tách khỏi đồ thị. Tiêu chí dừng thực tế kết hợp epoch tối đa, mức cải thiện validation, gradient norm và patience. Với bài toán không lồi, gradient descent thường tìm nghiệm hữu ích chứ không bảo đảm cực tiểu toàn cục. Khi loss NaN, hãy kiểm tra dữ liệu finite, log/exp, learning rate và gradient theo thứ tự có bằng chứng thay vì đổi optimizer ngẫu nhiên.",
        ],
        bullets: [
          "Loss batch dao động không đồng nghĩa quá trình thất bại.",
          "Loss train giảm nhưng validation xấu thường chỉ ra overfitting hoặc lệch phân phối.",
          "Loss đứng yên cần kiểm tra gradient None, tham số freeze và scale đầu vào.",
        ],
      },
    ],
    workedExamples: [
      {
        title: "Một bước trên hàm bậc hai không đẳng hướng",
        problem: "Cho L(w) = 1/2[(w_1 - 2)^2 + 4(w_2 + 1)^2], w_0 = [0, 0] shape (2,) và eta = 0.1. Tính gradient, tham số mới và hai giá trị loss.",
        steps: [
          {
            state: "grad L(w) = [w_1 - 2, 4(w_2 + 1)]; grad L(w_0) = [-2, 4]",
            explanation: "Hệ số 4 làm chiều w_2 có độ cong và thành phần gradient lớn hơn.",
          },
          {
            state: "w_new = [0, 0] - 0.1*[-2, 4] = [0.2, -0.4]",
            explanation: "Bước đi ngược gradient và vẫn giữ shape (2,).",
          },
          {
            state: "L(w_0) = 1/2[4 + 4] = 4",
            explanation: "Hai chiều đóng góp bằng nhau vào loss ban đầu sau hệ số một phần hai.",
          },
          {
            state: "L(w_new) = 1/2[(-1.8)^2 + 4*(0.6)^2] = 2.34",
            explanation: "Loss giảm 1.66, phù hợp với dự đoán hướng giảm ở learning rate này.",
          },
        ],
        conclusion: "Gradient descent giảm loss trong một bước; độ cong khác nhau giải thích vì sao tốc độ theo hai chiều không giống nhau.",
        sanityChecks: [
          "Gradient bằng 0 tại w = [2, -1], đúng với cực tiểu của tổng bình phương.",
          "Loss luôn không âm và 2.34 nhỏ hơn 4.",
          "Nếu vô tình cộng eta*gradient thì bước cục bộ sẽ đi theo hướng tăng.",
        ],
      },
    ],
    implementationChecklist: [
      "Bảo đảm loss cuối là vô hướng và gradient từng tham số có đúng shape.",
      "Xóa gradient tích lũy trước backward tiếp theo ở đúng thời điểm.",
      "Ghi rõ reduction mean hoặc sum và giữ nhất quán khi đổi batch size.",
      "Log learning rate thực tế, gradient norm, train loss và validation loss.",
      "Kiểm tra finite cho input, loss, gradient và tham số sau cập nhật.",
      "Lưu seed, sampler, optimizer state và checkpoint để tái lập.",
    ],
    masteryChecklist: [
      "Dùng Taylor bậc nhất để giải thích dấu trừ của cập nhật.",
      "Tính tay gradient và một bước cho hàm hai biến.",
      "Phân biệt full batch, stochastic, mini-batch và accumulation.",
      "Giải thích vì sao một mini-batch có thể tăng loss toàn tập.",
      "Chẩn đoán loss dao động, đứng yên và NaN từ log cụ thể.",
    ],
    glossary: [
      { term: "Gradient", definition: "Tập đạo hàm riêng của loss vô hướng theo các tham số." },
      { term: "Learning rate", definition: "Hệ số điều khiển độ dài bước tối ưu." },
      { term: "Mini-batch", definition: "Tập con mẫu dùng để ước lượng gradient trong một bước." },
      { term: "Conditioning", definition: "Mức chênh lệch độ cong theo các hướng, chi phối tốc độ hội tụ." },
      { term: "Saddle point", definition: "Điểm dừng có hướng cong lên và hướng cong xuống." },
      { term: "Patience", definition: "Số lần đánh giá không cải thiện được cho phép trước khi dừng." },
    ],
    sourceIds: ["d2l-vi", "d2l-en", "mml", "pml-intro"],
  },
  "dl-backpropagation": {
    lessonId: "dl-backpropagation",
    readingMinutes: 32,
    openingQuestions: [
      "Backpropagation tạo quy tắc đạo hàm mới hay chỉ tổ chức chain rule hiệu quả?",
      "Vì sao gradient phải được cộng tại tensor đi vào nhiều nhánh?",
      "Shape của gradient tầng affine được suy ra như thế nào?",
    ],
    sections: [
      {
        title: "Đồ thị tính toán và reverse-mode",
        paragraphs: [
          "Backpropagation áp dụng chain rule theo reverse-mode trên đồ thị tính toán có đầu ra loss vô hướng. Forward pass tạo các giá trị như z = Wx + b, h = phi(z) và L; backward pass đi theo thứ tự ngược, nhân gradient đi vào với đạo hàm cục bộ. Backprop không phải optimizer và không tự cập nhật tham số. Nó chỉ cung cấp dL/dW, dL/db cùng các gradient khác; optimizer dùng những đại lượng đó để chọn bước thay đổi.",
          "Reverse-mode phù hợp khi có rất nhiều tham số nhưng chỉ một loss, vì mỗi phép toán cần vector-Jacobian product thay vì dựng toàn bộ Jacobian. Nếu tensor x rẽ vào hai nhánh f(x), g(x) rồi cùng ảnh hưởng L, dL/dx là tổng đóng góp từ cả hai nhánh. Quên phép cộng này cho gradient sai dù đạo hàm từng nhánh đúng. Thứ tự topo ngược bảo đảm mọi đóng góp đã đến trước khi tiếp tục truyền về cha.",
        ],
        formulas: [
          "dL/dx = (dL/dy)(dy/dx) for a scalar chain",
          "if x feeds two branches, dL/dx = dL/df * df/dx + dL/dg * dg/dx",
        ],
      },
      {
        title: "Đạo hàm tầng affine và activation",
        paragraphs: [
          "Theo quy ước batch theo hàng, X shape (B, d_in), W shape (d_in, d_out), b shape (d_out,) và Z = XW + b. Nếu G = dL/dZ shape (B, d_out), ta có dW = X^T G shape (d_in, d_out), db = sum G theo trục batch shape (d_out,), dX = G W^T shape (B, d_in). Shape là phép kiểm nhanh rất mạnh, nhưng shape đúng chưa đủ chứng minh giá trị đúng hoặc hệ số chia batch đúng.",
          "Với H = phi(Z) theo từng phần tử, dZ = dH nhân từng phần tử với phi'(Z). ReLU dùng mask Z > 0; tại 0 đạo hàm không duy nhất và thư viện thường chọn 0. Sigmoid có thể dùng output s đã cache để tính s(1-s), tanh dùng 1-h^2. Lưu quá nhiều activation tốn bộ nhớ; gradient checkpointing chủ động bỏ một phần cache và tính lại forward trong backward để đổi thêm compute lấy ít memory hơn.",
        ],
        formulas: [
          "dW = X^T G; db = sum_rows(G); dX = G W^T",
          "dZ = dH ⊙ phi'(Z)",
        ],
      },
      {
        title: "Kiểm chứng và chẩn đoán gradient",
        paragraphs: [
          "Finite-difference check so sánh gradient giải tích với [L(theta + epsilon) - L(theta - epsilon)]/(2 epsilon) trên vài phần tử. Epsilon quá lớn gây sai số xấp xỉ, quá nhỏ gây triệt tiêu số học; nên thử khoảng 1e-4 đến 1e-6 trong float64 cho mạng nhỏ. So sai số tương đối, tắt dropout và cố định hành vi normalization. Gradient check không chạy cho toàn mô hình lớn nhưng rất hữu ích khi tự cài layer hay loss.",
          "Lỗi thường gặp gồm broadcast bias sai trục, quên chia B khi forward dùng mean, mutate cache, dùng tham số đã cập nhật để tính gradient còn lại, hoặc backward hai lần sau khi đồ thị đã được giải phóng. Vanishing và exploding gradient là hệ quả của nhiều phép nhân Jacobian, không tự chứng minh code backprop sai. Hãy log gradient norm theo tầng và dùng initialization, activation, normalization, residual hay clipping theo nguyên nhân đã đo.",
        ],
        bullets: [
          "Hoàn tất toàn bộ backward trước khi cập nhật bất kỳ tham số nào.",
          "Cộng gradient từ mọi nhánh của đồ thị.",
          "Gradient check trên mạng nhỏ, xác định và không có phép ngẫu nhiên.",
        ],
      },
    ],
    workedExamples: [
      {
        title: "Lan truyền ngược qua một hidden layer ReLU",
        problem: "Cho x = [1, 2] shape (2,), W = [[0.1, 0.2], [0.3, 0.4]] shape (2, 2), v = [0.7, -0.5], z = Wx, h = ReLU(z), y_hat = v^T h, y = 1 và L = 1/2(y_hat-y)^2.",
        steps: [
          {
            state: "z = [0.5, 1.1]; h = [0.5, 1.1]; y_hat = 0.35 - 0.55 = -0.2",
            explanation: "Cả hai pre-activation dương nên mask ReLU là [1, 1].",
          },
          {
            state: "dL/dy_hat = -1.2; dL/dv = (-1.2)h = [-0.6, -1.32]",
            explanation: "Gradient của v có shape (2,), đúng với hai hidden units.",
          },
          {
            state: "dL/dh = (-1.2)v = [-0.84, 0.6]; dL/dz = [-0.84, 0.6]",
            explanation: "ReLU truyền gradient ở cả hai vị trí vì z đều dương.",
          },
          {
            state: "dL/dW = (dL/dz) x^T = [[-0.84, -1.68], [0.6, 1.2]]",
            explanation: "Outer product có shape (2 hidden, 2 input), khớp W theo quy ước vectơ cột.",
          },
          {
            state: "dL/dx = W^T(dL/dz) = [0.096, 0.072]",
            explanation: "Hai thành phần lần lượt là 0.1*(-0.84)+0.3*0.6 và 0.2*(-0.84)+0.4*0.6.",
          },
        ],
        conclusion: "Một lượt backward dùng các đạo hàm cục bộ để thu gradient cho cả hai tầng mà không dựng Jacobian toàn cục.",
        sanityChecks: [
          "dW shape (2, 2), dv và dx shape (2,), khớp các tensor tương ứng.",
          "L = 1/2*(-1.2)^2 = 0.72 và dL/dy_hat âm, nên tăng y_hat sẽ giảm loss.",
          "Nếu một z âm, hàng gradient tương ứng qua ReLU phải bằng 0.",
        ],
      },
    ],
    implementationChecklist: [
      "Ghi rõ quy ước shape và hướng nhân ma trận trước khi suy diễn.",
      "Cache đúng giá trị forward cần thiết và không mutate cache.",
      "Cộng gradient từ mọi nhánh tại tensor được tái sử dụng.",
      "Giữ reduction của loss nhất quán với hệ số chia batch.",
      "Gradient-check vài phần tử bằng float64 trên mạng nhỏ.",
      "Log gradient norm theo tầng để định vị vanishing hoặc exploding.",
    ],
    masteryChecklist: [
      "Vẽ đồ thị tính toán và ghi gradient đi vào, đi ra ở từng nút.",
      "Suy ra dW, db, dX của tầng affine theo một quy ước batch.",
      "Giải thích vì sao gradient cộng tại nút phân nhánh.",
      "Thực hiện finite-difference check và đọc sai số tương đối.",
      "Phân biệt backpropagation, automatic differentiation và optimizer.",
    ],
    glossary: [
      { term: "Đồ thị tính toán", definition: "Các tensor và phép toán phụ thuộc tạo nên forward." },
      { term: "Chain rule", definition: "Quy tắc ghép đạo hàm của các hàm hợp." },
      { term: "Reverse-mode", definition: "Vi phân đi từ đầu ra về đầu vào, hiệu quả khi loss ít và tham số nhiều." },
      { term: "Vector-Jacobian product", definition: "Tích gradient đi vào với Jacobian cục bộ mà không dựng toàn Jacobian." },
      { term: "Cache", definition: "Giá trị forward lưu lại để dùng trong backward." },
      { term: "Gradient check", definition: "Đối chiếu gradient giải tích với sai phân hữu hạn." },
    ],
    sourceIds: ["d2l-vi", "d2l-en", "mml", "pml-intro"],
  },
  "dl-activation-functions": {
    lessonId: "dl-activation-functions",
    readingMinutes: 28,
    openingQuestions: [
      "Nếu xếp nhiều tầng affine mà không có activation, mạng còn học được gì hơn một tầng?",
      "Vì sao sigmoid phù hợp cho một số đầu ra nhưng thường không phải lựa chọn mặc định ở hidden layer?",
      "Dead ReLU, saturation và zero-centered mô tả ba vấn đề khác nhau như thế nào?",
    ],
    sections: [
      {
        title: "Phi tuyến là điều tạo nên chiều sâu",
        paragraphs: [
          "Hai phép affine liên tiếp vẫn rút gọn thành một phép affine: W_2(W_1x+b_1)+b_2 = (W_2W_1)x + (W_2b_1+b_2). Vì vậy chỉ tăng số tầng tuyến tính không mở rộng họ hàm biểu diễn. Activation phi tuyến đặt giữa các tầng phá phép rút gọn đó, cho phép không gian được chia thành nhiều vùng và tạo đặc trưng bậc cao. Activation thường áp dụng từng phần tử nên input và output giữ cùng shape, nhưng giá trị và gradient bị biến đổi.",
          "Chọn activation phải xét miền giá trị, đạo hàm, độ ổn định số và vị trí trong mạng. Hidden layer cần gradient đủ hữu ích trên miền hoạt động. Output layer phải khớp mô hình xác suất hoặc miền đích: logits thô cho cross-entropy nhiều lớp, sigmoid cho xác suất Bernoulli độc lập, linear cho hồi quy không chặn. Không nên thêm activation vì thói quen rồi dùng một loss giả định đầu vào khác.",
        ],
        formulas: [
          "affine_2(affine_1(x)) = (W_2 W_1)x + (W_2 b_1 + b_2)",
          "h = phi(z), with h and z sharing the same elementwise shape",
        ],
      },
      {
        title: "ReLU và các biến thể không bão hòa phía dương",
        paragraphs: [
          "ReLU(z)=max(0,z) rẻ, thưa ở phía âm và có đạo hàm 1 ở phía dương, nên giúp gradient đi qua tốt hơn sigmoid trong nhiều mạng sâu. Nhược điểm là một unit có thể rơi vào miền âm cho mọi mẫu và nhận gradient 0, tạo dead ReLU. Learning rate quá lớn, bias bất lợi hoặc dữ liệu lệch scale đều có thể gây hiện tượng này. Tại z=0 đạo hàm không duy nhất; framework chọn một subgradient, thường là 0.",
          "Leaky ReLU giữ độ dốc alpha nhỏ ở miền âm nên giảm nguy cơ chết hoàn toàn; ELU làm miền âm mượt hơn nhưng tốn phép exp. GELU nhân đầu vào với một cổng trơn gần xác suất và được dùng rộng rãi trong Transformer. Không có activation tốt nhất cho mọi mô hình. Phải so bằng validation, gradient statistics và chi phí, đồng thời giữ các yếu tố khác cố định để không quy kết sai kết quả cho activation.",
        ],
        formulas: [
          "ReLU(z) = max(0,z); ReLU'(z) = 1[z>0] under the common z=0 convention",
          "LeakyReLU(z) = z if z>=0 else alpha*z",
        ],
      },
      {
        title: "Sigmoid, tanh, saturation và đầu ra",
        paragraphs: [
          "Sigmoid ánh xạ R vào (0, 1), hữu ích cho đầu ra nhị phân hoặc cổng, nhưng đạo hàm s(1-s) tối đa chỉ 0.25 và gần 0 khi |z| lớn. Khi nhiều tầng liên tiếp nằm trong vùng bão hòa, tích Jacobian làm gradient nhỏ nhanh. Tanh ánh xạ vào (-1, 1), zero-centered hơn nhưng vẫn bão hòa. Chuẩn hóa, initialization và residual giúp kiểm soát miền pre-activation; chúng không làm mất hoàn toàn giới hạn đạo hàm của activation.",
          "Softmax khác sigmoid từng phần tử: nó chuẩn hóa cả trục lớp để tổng xác suất bằng 1 và các lớp cạnh tranh. Với multi-label, mỗi nhãn có thể đúng độc lập nên dùng sigmoid cho từng logit; với single-label C lớp loại trừ nhau, dùng softmax ngầm trong cross-entropy. Để ổn định số, loss thường nhận logits và thực hiện log-sum-exp bên trong. Tự sigmoid hoặc softmax trước một hàm loss nhận logits có thể vừa sai công thức vừa làm mất ổn định.",
        ],
        formulas: [
          "sigmoid(z) = 1/(1+exp(-z)); sigmoid'(z)=s(1-s)",
          "tanh'(z)=1-tanh(z)^2",
          "softmax(z)_i = exp(z_i-m) / sum_j exp(z_j-m), m=max_j z_j",
        ],
      },
    ],
    workedExamples: [
      {
        title: "So activation và gradient trên ba pre-activation",
        problem: "Cho z = [-2, 0, 2] shape (3,) và gradient đi vào dL/dh = [1, 1, 1]. Tính output cùng gradient qua ReLU, sigmoid và tanh.",
        steps: [
          {
            state: "ReLU(z) = [0, 0, 2]; dL/dz = [0, 0, 1]",
            explanation: "Dùng quy ước đạo hàm ReLU tại 0 bằng 0; phần tử âm bị chặn hoàn toàn.",
          },
          {
            state: "sigmoid(z) ≈ [0.1192, 0.5, 0.8808]",
            explanation: "Sigmoid nén cả ba giá trị vào (0, 1) và không tạo giá trị âm.",
          },
          {
            state: "sigmoid'(z) ≈ [0.1050, 0.25, 0.1050]",
            explanation: "Gradient lớn nhất tại 0 và nhỏ dần khi tiến vào hai vùng bão hòa.",
          },
          {
            state: "tanh(z) ≈ [-0.9640, 0, 0.9640]; tanh'(z) ≈ [0.0707, 1, 0.0707]",
            explanation: "Tanh zero-centered nhưng còn bão hòa mạnh tại độ lớn 2.",
          },
        ],
        conclusion: "Cùng input và gradient đi vào, mỗi activation tạo miền output và khả năng truyền gradient rất khác nhau.",
        sanityChecks: [
          "Mọi output và gradient vẫn có shape (3,) vì ba activation đều áp dụng từng phần tử.",
          "Sigmoid derivative không vượt 0.25; tanh derivative không vượt 1.",
          "ReLU output không âm và đúng bằng input ở phần tử z=2.",
        ],
      },
    ],
    implementationChecklist: [
      "Chọn activation đầu ra dựa trên loại nhãn và loss, không theo thói quen.",
      "Không áp dụng softmax trước cross-entropy nếu API yêu cầu logits.",
      "Theo dõi tỉ lệ activation bằng 0 và gradient norm để phát hiện dead ReLU.",
      "Dùng công thức ổn định cho sigmoid, softmax hoặc gọi primitive đã kiểm chứng.",
      "Test giá trị rất âm, bằng 0, rất dương và kiểm tra finite.",
      "Ghi rõ trục lớp khi dùng softmax trên tensor nhiều chiều.",
    ],
    masteryChecklist: [
      "Chứng minh hai tầng affine không activation vẫn là một tầng affine.",
      "Vẽ và so miền giá trị, đạo hàm của ReLU, sigmoid và tanh.",
      "Giải thích dead ReLU khác saturation như thế nào.",
      "Chọn đúng output activation cho regression, binary, multiclass và multi-label.",
      "Tính tay output và gradient activation cho một vectơ nhỏ.",
    ],
    glossary: [
      { term: "Activation", definition: "Phép biến đổi thường phi tuyến đặt sau pre-activation." },
      { term: "Pre-activation", definition: "Giá trị affine z trước khi đi qua activation." },
      { term: "Saturation", definition: "Vùng activation thay đổi rất ít nên đạo hàm gần 0." },
      { term: "Dead ReLU", definition: "Unit ReLU luôn ở miền âm và gần như không còn nhận gradient." },
      { term: "Zero-centered", definition: "Phân bố output có cả dấu âm và dương quanh 0." },
      { term: "Logit", definition: "Điểm số chưa chuẩn hóa được đưa vào loss phân loại ổn định." },
    ],
    sourceIds: ["d2l-vi", "d2l-en", "pml-intro", "ioai-2026"],
  },
  "dl-loss-functions": {
    lessonId: "dl-loss-functions",
    readingMinutes: 30,
    openingQuestions: [
      "Loss, metric và mục tiêu kinh doanh có phải cùng một đại lượng không?",
      "Vì sao cross-entropy nên nhận logits thay vì xác suất đã softmax thủ công?",
      "MSE, MAE và Huber phản ứng với outlier khác nhau ra sao?",
    ],
    sections: [
      {
        title: "Loss là tín hiệu huấn luyện, metric là cách đánh giá",
        paragraphs: [
          "Loss biến dự đoán và mục tiêu của một mẫu hoặc batch thành một mục tiêu vô hướng mà optimizer có thể xử lý bằng gradient hoặc subgradient; không phải mọi loss khả vi tại mọi điểm. Metric như accuracy, F1 hay IoU có thể gần mục tiêu sử dụng hơn nhưng thường rời rạc hoặc khó tối ưu trực tiếp. Một loss thấp không tự bảo đảm metric mong muốn cao nếu surrogate không khớp, dữ liệu lệch hoặc ngưỡng quyết định chưa chọn đúng. Vì vậy phải định nghĩa loss, metric và quy tắc chọn checkpoint tách biệt.",
          "Reduction là một phần của định nghĩa. none giữ loss từng mẫu, sum cộng tất cả, mean lấy trung bình trên các phần tử hợp lệ. Trong sequence có padding, mẫu segmentation khác kích thước hoặc trọng số lớp, mẫu số của mean phải là số phần tử có hiệu lực hay tổng trọng số theo đúng API. Chia sai làm learning rate hiệu dụng đổi theo batch, độ dài chuỗi hoặc tỉ lệ padding dù code vẫn chạy.",
        ],
        formulas: [
          "L_batch = (1/B) sum_i l(y_i, y_hat_i) for an unweighted mean",
          "weighted_mean = sum_i alpha_i l_i / sum_i alpha_i",
        ],
      },
      {
        title: "Hồi quy: MSE, MAE và Huber",
        paragraphs: [
          "MSE lấy trung bình bình phương residual r = y_hat-y, trơn và phạt sai số lớn theo bậc hai. Với giả định nhiễu Gaussian phương sai cố định, tối thiểu MSE liên hệ với cực đại likelihood. Tuy nhiên outlier có gradient lớn và có thể chi phối batch. Scale của mục tiêu cũng làm MSE thay đổi theo bình phương, nên chuẩn hóa target và báo metric ở đơn vị gốc là hai việc khác nhau.",
          "MAE dùng |r|, bền hơn với outlier và liên hệ nhiễu Laplace, nhưng không khả vi tại 0; framework dùng subgradient. Huber dùng vùng bậc hai quanh 0 để tối ưu mượt và vùng tuyến tính khi |r| vượt delta để giảm ảnh hưởng outlier. Delta có đơn vị của target và phải chọn theo scale dữ liệu, không phải một hằng số phổ quát. Với dự đoán bất định, có thể học cả mean và variance bằng negative log-likelihood thay vì chỉ một điểm.",
        ],
        formulas: [
          "MSE = mean((y_hat-y)^2); MAE = mean(|y_hat-y|)",
          "Huber_delta(r) = 0.5 r^2 if |r|<=delta else delta(|r|-0.5 delta)",
        ],
      },
      {
        title: "Phân loại ổn định từ logits",
        paragraphs: [
          "Với C lớp loại trừ nhau, cross-entropy của lớp thật k là -log softmax(z)_k. Tính trực tiếp exp(z) có thể overflow; trừ max logit hoặc dùng log-sum-exp giữ kết quả toán học nhưng ổn định hơn. Đạo hàm theo logits là p-one_hot(y), một công thức gọn kết hợp softmax và cross-entropy. Label smoothing thay one-hot bằng phân phối mềm để giảm quá tự tin, nhưng cũng thay đổi hiệu chuẩn và cách diễn giải loss.",
          "Binary cross-entropy with logits phù hợp một nhãn nhị phân hoặc nhiều nhãn độc lập. Multi-label không dùng softmax vì tổng xác suất không cần bằng 1. Class weights, focal loss và sampling có thể hỗ trợ lệch lớp nhưng thay đổi mục tiêu tối ưu; phải đánh giá precision-recall và hiệu chuẩn, không chỉ loss. Không softmax/sigmoid trước hàm loss có hậu tố with_logits hoặc cross_entropy nhận logits, vì sẽ lặp activation và làm gradient sai.",
        ],
        formulas: [
          "CE(z,k) = -z_k + log(sum_j exp(z_j))",
          "dCE/dz = softmax(z) - one_hot(k)",
          "BCEWithLogits(z,y) = max(z,0) - zy + log(1+exp(-|z|))",
        ],
      },
    ],
    workedExamples: [
      {
        title: "Cross-entropy ba lớp bằng log-sum-exp",
        problem: "Cho logits z = [2, 1, 0] shape (3,) và lớp thật k = 0. Tính softmax, loss và gradient theo logits.",
        steps: [
          {
            state: "m = max(z) = 2; exp(z-m) = [1, 0.3679, 0.1353]",
            explanation: "Trừ max tránh exp của số lớn mà không đổi softmax.",
          },
          {
            state: "S = 1.5032; p ≈ [0.6652, 0.2447, 0.0900]",
            explanation: "Ba xác suất không âm và tổng xấp xỉ 1.",
          },
          {
            state: "CE = -log(0.6652) ≈ 0.4076",
            explanation: "Lớp thật có xác suất khá cao nên loss dương nhưng nhỏ hơn log(3).",
          },
          {
            state: "dL/dz = p - [1, 0, 0] ≈ [-0.3348, 0.2447, 0.0900]",
            explanation: "Gradient khuyến khích tăng logit lớp thật và giảm hai logit còn lại.",
          },
        ],
        conclusion: "Cross-entropy tạo gradient trên mọi lớp và nên được tính từ logits bằng primitive ổn định.",
        sanityChecks: [
          "Tổng xác suất xấp xỉ 1 và tổng ba thành phần gradient xấp xỉ 0.",
          "Loss không âm; nếu logit lớp thật tăng riêng lẻ thì loss phải giảm.",
          "Gradient có shape (3,), đúng với logits.",
        ],
      },
    ],
    implementationChecklist: [
      "Đối chiếu loại bài toán với output shape và API loss.",
      "Truyền logits thô cho cross_entropy hoặc BCEWithLogits.",
      "Ghi rõ reduction, mask, class weights và mẫu số của phép mean.",
      "Test loss ở dự đoán hoàn hảo, đồng đều, sai tự tin và target biên.",
      "Kiểm tra mọi giá trị finite trước và sau loss.",
      "Báo metric phù hợp bên cạnh loss và chọn checkpoint theo tiêu chí đã chốt.",
    ],
    masteryChecklist: [
      "Phân biệt loss tối ưu, metric báo cáo và mục tiêu sử dụng.",
      "Suy ra gradient p-one_hot của softmax cross-entropy.",
      "Chọn MSE, MAE hay Huber từ giả định nhiễu và outlier.",
      "Phân biệt multiclass với multi-label ở output và loss.",
      "Giải thích tác dụng của log-sum-exp và reduction.",
    ],
    glossary: [
      { term: "Surrogate loss", definition: "Hàm khả vi thay thế cho mục tiêu rời rạc khó tối ưu trực tiếp." },
      { term: "Logit", definition: "Điểm số chưa chuẩn hóa trước sigmoid hoặc softmax." },
      { term: "Cross-entropy", definition: "Negative log-likelihood của lớp hoặc nhãn quan sát." },
      { term: "Reduction", definition: "Cách gộp loss từng phần tử thành none, sum hoặc mean." },
      { term: "Huber loss", definition: "Loss hồi quy bậc hai gần 0 và tuyến tính ngoài ngưỡng delta." },
      { term: "Label smoothing", definition: "Thay target one-hot bằng phân phối có một lượng nhỏ khối lượng ở lớp khác." },
    ],
    sourceIds: ["d2l-vi", "d2l-en", "pml-intro", "mml"],
  },
  "dl-mlp": {
    lessonId: "dl-mlp",
    readingMinutes: 32,
    openingQuestions: [
      "Một MLP khác hồi quy tuyến tính ở đâu nếu mỗi tầng đều bắt đầu bằng phép affine?",
      "Width, depth và số tham số tác động đến năng lực biểu diễn như thế nào?",
      "Vì sao định lý xấp xỉ phổ quát không bảo đảm mô hình sẽ học tốt từ dữ liệu hữu hạn?",
    ],
    sections: [
      {
        title: "Ghép affine và activation với shape minh bạch",
        paragraphs: [
          "Multilayer perceptron ghép các tầng h_l = phi_l(h_{l-1}W_l + b_l), bắt đầu từ h_0 = X. Theo quy ước batch theo hàng, X shape (B, d_0), W_l shape (d_{l-1}, d_l), b_l shape (d_l,) và h_l shape (B, d_l). Bias broadcast theo batch. Nếu bỏ mọi activation, tích nhiều ma trận cùng các bias vẫn rút về một phép affine, nên chiều sâu chỉ có ý nghĩa biểu diễn khi giữa các tầng có phi phi tuyến hoặc cơ chế khác không rút gọn được.",
          "Tầng cuối phụ thuộc nhiệm vụ. Hồi quy thường cho output tuyến tính shape (B, q); binary classification cho một logit shape (B,) hoặc (B,1); multiclass cho C logits shape (B,C). Activation xác suất thường được gộp trong loss ổn định. Viết shape ở mỗi dòng forward giúp phát hiện transpose nhầm, bias sai trục và squeeze làm mất batch dimension khi B=1. Không dựa vào broadcasting tình cờ để che một thiết kế shape chưa rõ.",
        ],
        formulas: [
          "H_0 = X; H_l = phi_l(H_{l-1} W_l + b_l)",
          "parameter_count_layer = d_in*d_out + d_out",
        ],
      },
      {
        title: "Năng lực biểu diễn: width, depth và vùng tuyến tính",
        paragraphs: [
          "MLP ReLU biểu diễn một hàm tuyến tính từng vùng: mỗi mẫu kích hoạt một pattern unit, và trong vùng có pattern cố định mạng tương đương phép affine. Tăng width thêm nhiều đặc trưng song song; tăng depth cho phép tái sử dụng và kết hợp đặc trưng theo cấp. Cùng một hàm có thể cần mạng nông rất rộng nhưng mạng sâu gọn hơn, song độ sâu cũng làm tối ưu và truyền gradient khó hơn nếu thiếu initialization hay residual phù hợp.",
          "Định lý xấp xỉ phổ quát nói một mạng đủ rộng với activation thích hợp có thể xấp xỉ hàm liên tục trên miền compact đến độ chính xác tùy ý. Nó không cho biết cần bao nhiêu unit, dữ liệu huấn luyện nào, optimizer nào, hay mô hình có tổng quát hóa ngoài mẫu quan sát không. Khả năng biểu diễn chỉ là một điều kiện; học được nghiệm cần inductive bias, dữ liệu đại diện, loss phù hợp và quy trình validation không rò rỉ.",
        ],
        formulas: [
          "ReLU MLP is affine within each fixed activation pattern",
          "total_parameters = sum_l (d_{l-1} d_l + d_l)",
        ],
      },
      {
        title: "Huấn luyện, regularization và baseline",
        paragraphs: [
          "MLP cho dữ liệu bảng thường cần chuẩn hóa đặc trưng liên tục và mã hóa biến phân loại cẩn thận. Với ảnh, chuỗi hay âm thanh, MLP thuần làm phẳng cấu trúc và bỏ inductive bias về không gian hoặc thời gian; CNN hay attention thường hiệu quả tham số hơn. Tuy vậy MLP vẫn là baseline quan trọng: nếu kiến trúc phức tạp không vượt MLP được tune công bằng trên validation, lợi ích kiến trúc chưa được chứng minh.",
          "Overfitting được kiểm soát bằng weight decay, dropout, early stopping, data augmentation phù hợp và giới hạn capacity. Dropout chỉ bật ở train; normalization cũng có hành vi train/eval cần quản lý. Cần theo dõi train loss cùng validation metric, lưu checkpoint tốt nhất và so nhiều seed vì mạng có tính ngẫu nhiên. Một learning curve mà train lẫn validation đều kém gợi ý underfitting hoặc lỗi tối ưu; khoảng cách lớn gợi ý variance cao nhưng vẫn phải kiểm tra lệch phân phối.",
        ],
        bullets: [
          "Bắt đầu bằng một hidden layer nhỏ và baseline tuyến tính.",
          "Tăng capacity chỉ sau khi xác nhận pipeline, loss và metric đúng.",
          "Báo số tham số cùng chi phí suy luận, không chỉ accuracy.",
        ],
      },
    ],
    workedExamples: [
      {
        title: "Forward một MLP 3-2-1 cho batch hai mẫu",
        problem: "Cho X = [[1, 0, -1], [0, 2, 1]] shape (2, 3), W_1 = [[1, 0], [0, 1], [1, -1]] shape (3, 2), b_1 = [0, 0], ReLU, W_2 = [[2], [-1]] shape (2, 1), b_2 = [0.5].",
        steps: [
          {
            state: "Z_1 = XW_1 + b_1 = [[0, 1], [1, 1]] shape (2, 2)",
            explanation: "Ví dụ hàng đầu: [1, 0, -1] nhân hai cột cho [0, 1].",
          },
          {
            state: "H_1 = ReLU(Z_1) = [[0, 1], [1, 1]]",
            explanation: "Mọi phần tử không âm nên ReLU không đổi giá trị trong batch này.",
          },
          {
            state: "Y_hat = H_1 W_2 + b_2 = [[-0.5], [1.5]] shape (2, 1)",
            explanation: "Mẫu đầu cho 0*2 + 1*(-1) + 0.5; mẫu sau cho 1*2 + 1*(-1) + 0.5.",
          },
          {
            state: "Số tham số = (3*2+2) + (2*1+1) = 11",
            explanation: "Tám tham số ở tầng đầu và ba tham số ở tầng cuối.",
          },
        ],
        conclusion: "Forward giữ nguyên batch size, biến chiều đặc trưng 3 thành hidden 2 rồi output 1 cho mỗi mẫu.",
        sanityChecks: [
          "Các phép nhân trong lần lượt là (2, 3)(3, 2)->(2, 2) và (2, 2)(2, 1)->(2, 1).",
          "Broadcast b_1 chỉ theo hai hàng; không tạo bias shape (2, 2) độc lập cho từng mẫu.",
          "Nếu bỏ ReLU trong ví dụ này output vẫn trùng vì Z_1 không âm, nhưng không đúng cho mọi input.",
        ],
      },
    ],
    implementationChecklist: [
      "Ghi assertion shape sau mỗi tầng trong phiên bản học tập.",
      "Khởi tạo từng Linear với đúng d_in, d_out và không squeeze mất batch.",
      "Khớp số output logits với loại bài toán và API loss.",
      "Tách train/eval để dropout và normalization hoạt động đúng.",
      "So baseline tuyến tính, MLP nhỏ và MLP lớn bằng cùng split, metric, budget.",
      "Log số tham số, learning curve, seed và checkpoint tốt nhất.",
    ],
    masteryChecklist: [
      "Tính được shape và số tham số của MLP bất kỳ.",
      "Chứng minh MLP không activation rút về một phép affine.",
      "Tính tay forward batch nhỏ qua affine, ReLU và output.",
      "Giải thích đúng phạm vi của định lý xấp xỉ phổ quát.",
      "Phân biệt dấu hiệu underfitting, overfitting và lỗi pipeline.",
    ],
    glossary: [
      { term: "MLP", definition: "Mạng feed-forward gồm các tầng affine xen kẽ activation." },
      { term: "Hidden layer", definition: "Tầng biểu diễn trung gian không phải input hoặc output cuối." },
      { term: "Width", definition: "Số unit hoặc chiều đặc trưng của một hidden layer." },
      { term: "Depth", definition: "Số tầng biến đổi liên tiếp trong mạng." },
      { term: "Universal approximation", definition: "Kết quả về khả năng xấp xỉ hàm dưới điều kiện phù hợp, không phải bảo đảm học." },
      { term: "Inductive bias", definition: "Giả định cấu trúc giúp ưu tiên một họ nghiệm từ dữ liệu hữu hạn." },
      { term: "Capacity", definition: "Mức linh hoạt của họ hàm mà mô hình có thể biểu diễn." },
    ],
    sourceIds: ["d2l-vi", "d2l-en", "mml", "pml-intro"],
  },
} satisfies LessonTheoryMap;
