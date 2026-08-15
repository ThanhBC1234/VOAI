/**
 * Catalog bài học Computer Vision, NLP, Audio và Multimodal.
 *
 * Quy ước `officialCategory` bám Syllabus IOAI 2026:
 * - Both: cần hiểu cơ chế và biết thực hành.
 * - Practice: cần chọn đúng, dùng thư viện đúng và giải thích kết quả.
 * - Nền bổ trợ/Dạng dữ liệu: không phải một dòng độc lập trong syllabus, nhưng
 *   là kiến thức tối thiểu để làm được mục chính thức tương ứng.
 *
 * Mọi công thức trong `math` dùng Markdown/LaTeX để web có thể render trực tiếp.
 */

export type MultimodalDomain =
  | "Computer Vision"
  | "NLP"
  | "Audio"
  | "Multimodal"
  | "Video & Time-series";

export interface MiniQuizItem {
  question: string;
  expectedAnswer: string;
  misconceptionToCatch: string;
}

export interface CodingChallenge {
  task: string;
  durationMinutes: number;
  starterSignature: string;
  requirements: string[];
  acceptanceCriteria: string[];
  aiBoundary: string;
}

export interface MultimodalLesson {
  id: string;
  title: string;
  domain: MultimodalDomain;
  officialCategory: string;
  prerequisites: string[];
  outcomes: string[];
  intuition: string;
  math: string[];
  fromScratchSteps: string[];
  whenToUse: string[];
  failureModes: string[];
  complexity: string[];
  miniQuiz: MiniQuizItem[];
  codingChallenge: CodingChallenge;
  hiddenTestIdeas: string[];
  projectConnection: string;
}

const SELF_CODE_POLICY =
  "Tự viết tối thiểu 90% lời giải. Không gửi đề cho AI để xin code hoặc từng bước giải. Chỉ sau khi đã chạy test, được hỏi AI một câu đóng như ‘nhận xét này đúng hay sai?’ và phải tự sửa.";

export const multimodalLessons: readonly MultimodalLesson[] = [
  {
    id: "cv-01-convolution",
    title: "Tích chập 2D: từ cửa sổ trượt đến lớp convolution",
    domain: "Computer Vision",
    officialCategory: "Both — IOAI 2026 / Fundamentals / Convolutional Layers",
    prerequisites: [
      "Mảng NumPy 2D/3D, vòng lặp lồng nhau và broadcasting cơ bản",
      "Tích vô hướng, ma trận, đạo hàm riêng và quy tắc dây chuyền",
      "Khái niệm tensor ảnh theo thứ tự NCHW và NHWC",
    ],
    outcomes: [
      "Tự tính một phép cross-correlation 2D bằng tay và phân biệt nó với convolution toán học có lật kernel",
      "Tính chính xác kích thước đầu ra từ kernel, stride, padding và dilation",
      "Viết forward convolution nhiều kênh không dùng hàm conv có sẵn",
      "Giải thích locality, weight sharing, receptive field và equivariance theo phép tịnh tiến",
    ],
    intuition:
      "Kernel là một bộ dò mẫu nhỏ được dùng lặp lại ở mọi vị trí. Mỗi phần tử đầu ra trả lời ‘mẫu này xuất hiện mạnh đến đâu trong vùng nhìn hiện tại?’. Nhiều kernel học các cạnh, góc, họa tiết rồi ghép thành đặc trưng cấp cao. Padding giữ thông tin biên; stride đổi mật độ lấy mẫu; dilation mở rộng vùng nhìn mà không thêm trọng số. Trong thư viện deep learning, Conv2d thường thực hiện cross-correlation nhưng vẫn được gọi là convolution vì kernel được học nên việc lật kernel không làm giảm khả năng biểu diễn.",
    math: [
      "Kích thước một chiều: $O=\\lfloor (I+2P-D(K-1)-1)/S \\rfloor+1$.",
      "Forward NCHW: $Y_{n,o,i,j}=b_o+\\sum_c\\sum_u\\sum_v W_{o,c,u,v}X_{n,c,iS+uD-P,jS+vD-P}$.",
      "Số tham số: $C_{out}(C_{in}K_hK_w+1)$ nếu có bias; không phụ thuộc chiều rộng/cao ảnh.",
      "Receptive field qua nhiều lớp: $r_l=r_{l-1}+(k_l-1)j_{l-1}$ và jump $j_l=j_{l-1}s_l$.",
    ],
    fromScratchSteps: [
      "Viết hàm zero_pad cho tensor NCHW, không dùng np.pad ở lần đầu.",
      "Duyệt batch, output channel, tọa độ đầu ra; cắt đúng patch theo stride và dilation.",
      "Nhân patch với kernel theo mọi input channel, cộng bias và ghi vào đầu ra.",
      "So sánh số học với torch.nn.functional.conv2d trên seed cố định, gồm cả padding và stride khác 1.",
      "Dùng sai phân hữu hạn để kiểm tra gradient của đúng một phần tử kernel trước khi tự viết backward đầy đủ.",
    ],
    whenToUse: [
      "Dữ liệu có cấu trúc lưới cục bộ như ảnh, spectrogram hoặc bản đồ không gian",
      "Cần inductive bias mạnh và hiệu quả mẫu tốt hơn MLP thuần trên ảnh",
      "Cần backbone nhẹ hoặc đầu xử lý cục bộ trước Transformer",
    ],
    failureModes: [
      "Nhầm NCHW với NHWC làm kernel nhân sai trục nhưng chương trình vẫn chạy",
      "Công thức output âm hoặc không nguyên do kernel lớn hơn vùng input hiệu dụng",
      "Padding bằng 0 tạo artefact ở biên; reflect padding có thể phù hợp hơn cho khử nhiễu",
      "Stride lớn bỏ sót chi tiết nhỏ và gây aliasing",
      "Khẳng định convolution bất biến tịnh tiến; thực tế lớp cơ bản chủ yếu equivariant và pooling/aggregation mới tạo gần bất biến",
    ],
    complexity: [
      "Forward trực tiếp: $O(NC_{out}C_{in}H_{out}W_{out}K_hK_w)$.",
      "Bộ nhớ đầu ra: $O(NC_{out}H_{out}W_{out})$; im2col tăng bộ nhớ tạm để tận dụng GEMM.",
      "Depthwise separable convolution giảm phần chính từ $K^2C_{in}C_{out}$ xuống $K^2C_{in}+C_{in}C_{out}$ trên mỗi vị trí.",
    ],
    miniQuiz: [
      {
        question: "Ảnh 32×32, kernel 3, padding 1, stride 2, dilation 1 cho đầu ra bao nhiêu?",
        expectedAnswer: "16×16 vì floor((32+2−2−1)/2)+1 = 16.",
        misconceptionToCatch: "Làm tròn lên thành 17 hoặc quên số hạng dilation.",
      },
      {
        question: "Vì sao tăng số pixel ảnh không làm tăng số tham số Conv2d?",
        expectedAnswer: "Một bộ trọng số kernel được chia sẻ tại mọi vị trí; số vị trí chỉ tăng lượng tính toán.",
        misconceptionToCatch: "Cho rằng mỗi patch có kernel riêng.",
      },
    ],
    codingChallenge: {
      task: "Cài đặt conv2d_forward cho NCHW bằng NumPy, hỗ trợ kernel chữ nhật, stride/padding/dilation là cặp số và bias tùy chọn.",
      durationMinutes: 55,
      starterSignature:
        "def conv2d_forward(x, weight, bias=None, stride=(1, 1), padding=(0, 0), dilation=(1, 1)): ...",
      requirements: [
        "Không gọi torch, scipy.signal, cv2.filter2D hoặc hàm convolution có sẵn",
        "Kiểm tra shape và báo ValueError có nghĩa khi cấu hình không hợp lệ",
        "Không sửa in-place tensor đầu vào",
      ],
      acceptanceCriteria: [
        "Sai số cực đại < 1e-9 so với PyTorch float64 trên ít nhất 20 cấu hình",
        "Đúng với batch > 1, nhiều input/output channel và kernel không vuông",
        "Có giải thích bằng lời vì sao thư viện gọi cross-correlation là convolution",
      ],
      aiBoundary: SELF_CODE_POLICY,
    },
    hiddenTestIdeas: [
      "Input 1×1×1×1, kernel 1×1 để bắt lỗi index cơ bản",
      "Stride (2, 1), dilation (2, 1), padding không đối xứng theo hai chiều",
      "Nhiều kênh với toàn số âm và bias bằng 0",
      "Đầu vào/weight không contiguous nhưng có shape hợp lệ",
      "Cấu hình kernel hiệu dụng lớn hơn input phải ném lỗi thay vì trả mảng rỗng",
    ],
    projectConnection:
      "Là lõi để sau này tự xây CNN phân loại rác, backbone YOLO/SSD, encoder U-Net và front-end xử lý spectrogram; log shape từng tầng để tái dùng trong web trực quan kernel trượt.",
  },
  {
    id: "cv-02-image-classification",
    title: "Phân loại ảnh: pipeline, logits, loss và đánh giá",
    domain: "Computer Vision",
    officialCategory: "Practice — IOAI 2026 / Fundamentals / Image Classification",
    prerequisites: [
      "cv-01-convolution",
      "Softmax, cross-entropy, mini-batch và train/validation/test split",
      "PyTorch Dataset, DataLoader và vòng lặp huấn luyện cơ bản",
    ],
    outcomes: [
      "Xây pipeline phân loại ảnh không rò rỉ dữ liệu từ split đến inference",
      "Phân biệt logits, xác suất, nhãn dự đoán và ngưỡng quyết định",
      "Chọn accuracy, macro-F1, balanced accuracy hoặc top-k phù hợp",
      "Chẩn đoán overfit bằng learning curve và confusion matrix",
    ],
    intuition:
      "Mô hình biến ảnh thành vector đặc trưng rồi đặt ranh giới giữa các lớp. Logit là điểm chưa chuẩn hóa; softmax chỉ chuyển điểm thành phân phối tương đối. Chất lượng pipeline phụ thuộc nhiều vào cách chia dữ liệu: hai ảnh gần giống của cùng một đối tượng nằm ở train và validation có thể tạo điểm số giả cao. Một baseline nhỏ nhưng split đúng đáng tin hơn mô hình lớn với leakage.",
    math: [
      "Softmax: $p_k=\\exp(z_k-m)/\\sum_j\\exp(z_j-m)$ với $m=\\max_j z_j$ để ổn định số.",
      "Cross-entropy một mẫu: $L=-\\log p_y$; với label smoothing $q_y=1-\\epsilon+\\epsilon/K$.",
      "Macro-F1 là trung bình F1 theo lớp, không bị lớp lớn lấn át như micro-F1/accuracy.",
      "Expected calibration error nhóm dự đoán theo confidence rồi đo chênh lệch confidence–accuracy.",
    ],
    fromScratchSteps: [
      "Khảo sát phân bố lớp, kích thước, ảnh hỏng và nhóm đối tượng có quan hệ.",
      "Chia train/validation theo group trước rồi mới fit normalization/augmentation.",
      "Huấn luyện baseline linear trên ảnh resize hoặc feature đơn giản để có mốc kiểm tra.",
      "Thêm CNN nhỏ; theo dõi train loss, validation loss, macro-F1 và thời gian mỗi epoch.",
      "Phân tích confusion matrix và lưu 20 lỗi có confidence cao nhất thay vì chỉ nhìn một con số.",
    ],
    whenToUse: [
      "Mỗi ảnh có một hoặc vài nhãn toàn cục và không cần vị trí vật thể",
      "Cần baseline cho bài detection/segmentation bằng cách crop vùng quan tâm",
      "Cần triage nhanh ảnh trước bước xử lý đắt hơn",
    ],
    failureModes: [
      "Augmentation hoặc normalization được áp dụng sai cho validation/test",
      "Dùng softmax trước CrossEntropyLoss làm gradient và số học kém ổn định",
      "Accuracy cao do mất cân bằng lớp nhưng lớp hiếm gần như không được nhận ra",
      "Resize bóp méo tỉ lệ làm mất tín hiệu hình học",
      "Rò rỉ qua ảnh trùng, cùng video, cùng bệnh nhân hoặc cùng thiết bị chụp",
    ],
    complexity: [
      "Chi phí mỗi ảnh bằng tổng FLOPs các lớp; lớp convolution thường chi phối.",
      "Đầu phân loại tuyến tính: thời gian $O(BDK)$, tham số $DK+K$ với embedding D và K lớp.",
      "Inference batch lớn tăng throughput nhưng tăng latency chờ gom batch và bộ nhớ activation.",
    ],
    miniQuiz: [
      {
        question: "Khi nào macro-F1 hữu ích hơn accuracy?",
        expectedAnswer: "Khi lớp mất cân bằng và mỗi lớp đều quan trọng; macro-F1 cho trọng số ngang nhau giữa các lớp.",
        misconceptionToCatch: "Cho rằng F1 luôn tốt hơn mà không xét mục tiêu hoặc ngưỡng.",
      },
      {
        question: "Tại sao không nên gọi softmax trước nn.CrossEntropyLoss?",
        expectedAnswer: "Hàm loss nhận logits và tự kết hợp log-softmax ổn định số; softmax trước làm sai giao diện và giảm ổn định gradient.",
        misconceptionToCatch: "Nói CrossEntropyLoss chỉ nhận xác suất.",
      },
    ],
    codingChallenge: {
      task: "Từ một thư mục ảnh nhỏ, viết pipeline split theo group, CNN hai block và báo cáo macro-F1/confusion matrix mà không dùng trainer framework.",
      durationMinutes: 60,
      starterSignature: "def train_classifier(records, groups, seed=42): ...",
      requirements: [
        "Tự viết training/evaluation loop; được dùng tensor ops và lớp PyTorch",
        "Cố định seed và lưu index của ba split",
        "Không dùng ảnh validation để chọn normalization statistics ngoài train",
      ],
      acceptanceCriteria: [
        "Không có group xuất hiện ở nhiều split",
        "Metrics khớp phép tính sklearn trên bộ dự đoán cố định",
        "Báo cáo ít nhất ba lỗi cụ thể và một thí nghiệm cải thiện có kiểm soát",
      ],
      aiBoundary: SELF_CODE_POLICY,
    },
    hiddenTestIdeas: [
      "Dataset chỉ có hai mẫu ở lớp hiếm",
      "Batch cuối kích thước 1",
      "Logits cực lớn để bắt softmax không ổn định",
      "Nhãn không liên tiếp như 2, 4, 9",
      "Cùng group có nhiều ảnh gần trùng phải nằm cùng split",
    ],
    projectConnection:
      "Tạo baseline phân loại loại rác/động vật/biển báo; các lỗi và metadata được dùng tiếp để quyết định chuyển sang detection, augmentation hoặc transfer learning.",
  },
  {
    id: "cv-03-yolo",
    title: "YOLO: phát hiện vật thể một giai đoạn theo ô lưới",
    domain: "Computer Vision",
    officialCategory: "Practice — IOAI 2026 / Object Detection (YOLO)",
    prerequisites: [
      "cv-01-convolution",
      "cv-02-image-classification",
      "Bounding box theo xyxy/cxcywh, IoU, precision–recall và NMS",
    ],
    outcomes: [
      "Giải thích vì sao YOLO là one-stage detector và đầu ra dense prediction",
      "Chuyển đổi tọa độ hộp, tính IoU và thực hiện class-aware NMS",
      "Hiểu vai trò objectness, class score, box regression và anchor/anchor-free",
      "Đánh giá bằng AP/mAP thay vì accuracy trên từng ô",
    ],
    intuition:
      "YOLO nhìn toàn ảnh một lần, tạo dự đoán hộp và lớp tại nhiều vị trí/tỉ lệ rồi lọc chồng lặp. Mỗi vị trí chịu trách nhiệm cho vật thể phù hợp quy tắc gán nhãn. Tốc độ đến từ việc bỏ bước proposal rời; đổi lại, thiết kế target assignment, scale và suppression quyết định mạnh khả năng bắt vật nhỏ hoặc chen chúc.",
    math: [
      "IoU$(A,B)=|A\\cap B|/|A\\cup B|$ với diện tích giao được clamp về 0.",
      "Confidence thường kết hợp objectness $P(object)$ và xác suất lớp có điều kiện.",
      "NMS giữ hộp điểm cao nhất rồi loại hộp cùng lớp có IoU vượt ngưỡng; worst-case $O(M^2)$ cho M hộp.",
      "AP là diện tích dưới đường precision–recall; mAP trung bình theo lớp và, tùy chuẩn, theo nhiều ngưỡng IoU.",
    ],
    fromScratchSteps: [
      "Vẽ hộp và kiểm tra quy ước tọa độ trên ảnh thật trước khi huấn luyện.",
      "Tự viết pairwise IoU vectorized cho hai tập hộp.",
      "Giải mã một tensor dự đoán giả thành cxcywh, objectness và class score.",
      "Lọc score rồi chạy NMS riêng theo lớp; ánh xạ hộp từ ảnh letterbox về ảnh gốc.",
      "Fine-tune model pretrained, theo dõi AP theo kích thước small/medium/large và xem false positive.",
    ],
    whenToUse: [
      "Cần latency thấp hoặc xử lý video gần thời gian thực",
      "Có bounding-box labels và số lớp vừa phải",
      "Đối tượng không quá dày đặc hoặc phiên bản YOLO đã được kiểm chứng trên dữ liệu tương tự",
    ],
    failureModes: [
      "Đảo x/y hoặc nhầm tọa độ normalized và pixel",
      "Letterbox nhưng quên bỏ padding khi trả hộp về ảnh gốc",
      "NMS class-agnostic làm mất hai vật thể khác lớp chồng nhau",
      "mAP cao tổng thể nhưng AP vật nhỏ thấp vì resize quá mạnh",
      "Dùng validation threshold tối ưu rồi báo lại chính validation như test độc lập",
    ],
    complexity: [
      "Backbone/neck chi phối FLOPs; phần giải mã xấp xỉ tuyến tính theo số vị trí và lớp.",
      "NMS chuẩn worst-case $O(M^2)$; lọc top-k trước NMS giảm đáng kể M.",
      "Bộ nhớ tăng theo tổng feature-map nhiều scale, đặc biệt ở ảnh độ phân giải cao.",
    ],
    miniQuiz: [
      {
        question: "Hai hộp khác lớp có IoU 0.9 có nên loại nhau trong class-aware NMS không?",
        expectedAnswer: "Không; NMS theo lớp chỉ so các hộp cùng lớp, trừ khi hệ thống cố ý dùng class-agnostic NMS.",
        misconceptionToCatch: "Cho rằng mọi hộp chồng nhau đều là trùng dự đoán.",
      },
      {
        question: "Tăng confidence threshold thường làm precision và recall đổi thế nào?",
        expectedAnswer: "Precision thường tăng, recall thường giảm; không có bảo đảm tuyệt đối trên mọi tập nhỏ.",
        misconceptionToCatch: "Cho rằng cả hai cùng tăng.",
      },
    ],
    codingChallenge: {
      task: "Tự viết decode + IoU + class-aware NMS cho output YOLO giản lược, trả hộp xyxy trong hệ tọa độ ảnh gốc.",
      durationMinutes: 55,
      starterSignature:
        "def yolo_postprocess(pred, image_shape, input_shape, score_thr=0.25, iou_thr=0.5): ...",
      requirements: [
        "Không gọi torchvision.ops.nms hoặc thư viện detection",
        "Hỗ trợ batch 1, nhiều lớp và trường hợp không có hộp",
        "Không dùng vòng lặp theo từng pixel/ô khi có thể vector hóa",
      ],
      acceptanceCriteria: [
        "IoU đúng cho hộp rời, chạm cạnh, lồng nhau và hộp suy biến",
        "NMS có thứ tự xác định khi hai score bằng nhau",
        "Tọa độ sau bỏ letterbox không vượt biên ảnh",
      ],
      aiBoundary: SELF_CODE_POLICY,
    },
    hiddenTestIdeas: [
      "Tất cả score dưới ngưỡng",
      "Hai lớp cùng một hình học hộp",
      "Hộp zero-area hoặc tọa độ đảo",
      "Ảnh dọc letterbox vào khung vuông",
      "1000 hộp giống nhau để kiểm tra lọc và hiệu năng",
    ],
    projectConnection:
      "Dùng cho camera phân loại và đếm rác, biển báo hoặc vật thể; xuất thêm false-positive gallery để nối với bài augmentation và active error analysis.",
  },
  {
    id: "cv-04-ssd",
    title: "SSD và default boxes: phát hiện nhiều tỉ lệ trong một lượt",
    domain: "Computer Vision",
    officialCategory: "Practice — IOAI 2026 / Object Detection (SSD)",
    prerequisites: [
      "cv-03-yolo",
      "Feature pyramid, anchor/default box và IoU matching",
      "Smooth L1 loss, hard-negative mining",
    ],
    outcomes: [
      "Mô tả default boxes ở nhiều feature map và cách offset được mã hóa",
      "Tự ghép ground-truth với anchor theo IoU và bảo đảm mỗi ground-truth có match",
      "Giải thích hard-negative mining giải quyết chênh lệch background",
      "So sánh SSD với YOLO và DETR theo inductive bias, tốc độ và hậu xử lý",
    ],
    intuition:
      "SSD trải một tập hộp mặc định với tỉ lệ/kích thước khác nhau trên các feature map. Model chỉ học độ lệch từ hộp gần đúng và lớp tương ứng. Feature map lớn phụ trách vật nhỏ, map nhỏ phụ trách vật lớn. Vì đa số anchor là nền, phải chọn negative khó thay vì cho loss nền áp đảo.",
    math: [
      "Mã hóa tâm: $t_x=(g_x-d_x)/d_w$, $t_y=(g_y-d_y)/d_h$; kích thước: $t_w=\\log(g_w/d_w)$, $t_h=\\log(g_h/d_h)$.",
      "MultiBox loss: $L=(L_{conf}+\\alpha L_{loc})/N_{pos}$, xử lý riêng trường hợp $N_{pos}=0$.",
      "Số dự đoán là $\\sum_l H_lW_lA_l$ với $A_l$ default boxes mỗi vị trí của level l.",
    ],
    fromScratchSteps: [
      "Sinh default boxes cho một feature map 2×2 với hai tỉ lệ và vẽ chúng.",
      "Tính ma trận IoU anchor–ground-truth, gán positive/negative/ignore.",
      "Mã hóa ground-truth thành offsets rồi giải mã ngược để kiểm tra round-trip.",
      "Tính classification loss cho positive và top-k negative khó theo tỉ lệ 3:1.",
      "Dùng model SSD có sẵn để fine-tune và phân tích recall theo kích thước hộp.",
    ],
    whenToUse: [
      "Muốn detector one-stage cổ điển, dễ quan sát cơ chế anchor và multi-scale",
      "Thiết bị hạn chế khi backbone MobileNet + SSD đáp ứng latency",
      "Bài học cần hiểu rõ target matching trước khi dùng detector hiện đại",
    ],
    failureModes: [
      "Scale/aspect ratio anchor không khớp dữ liệu làm không có positive tốt",
      "Không ép best anchor cho mỗi ground-truth khiến vật thể bị bỏ hoàn toàn",
      "Chia loss cho 0 khi batch không có hộp",
      "Hard-negative mining chọn cả positive hoặc sort sai chiều",
      "Feature độ phân giải thấp làm SSD yếu với vật rất nhỏ",
    ],
    complexity: [
      "Matching trực tiếp: $O(AG)$ với A anchors và G ground-truth trên mỗi ảnh.",
      "Head prediction gần $O(AK)$ cho K lớp; NMS tương tự YOLO.",
      "Bộ nhớ target/probability tỷ lệ với tổng số anchors, thường lớn hơn DETR queries.",
    ],
    miniQuiz: [
      {
        question: "Tại sao SSD dùng nhiều feature map thay vì chỉ map cuối?",
        expectedAnswer: "Độ phân giải khác nhau cung cấp vùng nhìn và mật độ vị trí khác nhau để bắt vật thể nhiều kích thước.",
        misconceptionToCatch: "Nói chỉ để tăng số lớp của mạng.",
      },
      {
        question: "Hard-negative mining chọn negative có loss thấp hay cao?",
        expectedAnswer: "Loss cao, tức các nền mà model đang dễ nhầm thành vật thể.",
        misconceptionToCatch: "Chọn negative dễ để loss ổn định.",
      },
    ],
    codingChallenge: {
      task: "Cài đặt SSD anchor matching và encode/decode offsets cho một ảnh, không dùng torchvision detection utilities.",
      durationMinutes: 60,
      starterSignature: "def match_ssd(default_boxes, gt_boxes, gt_labels, pos_iou=0.5): ...",
      requirements: [
        "Quy ước boxes cxcywh được ghi rõ và validate kích thước dương",
        "Mỗi ground-truth phải có ít nhất một positive nếu có anchor",
        "Round-trip encode/decode được kiểm tra tự động",
      ],
      acceptanceCriteria: [
        "Match khớp expected trên ví dụ nhỏ tính tay",
        "Không hỏng khi không có ground-truth",
        "Sai số round-trip < 1e-6 với hộp hợp lệ",
      ],
      aiBoundary: SELF_CODE_POLICY,
    },
    hiddenTestIdeas: [
      "Hai ground-truth tranh cùng best anchor",
      "Không anchor nào vượt pos_iou",
      "Ground-truth sát biên và rất mảnh",
      "Danh sách ground-truth rỗng",
      "Default boxes chưa sort và có kích thước nhiều thang",
    ],
    projectConnection:
      "Cho phép thử detector nhẹ trên thiết bị yếu và tạo thí nghiệm so sánh cùng split với YOLO/DETR, tập trung vào AP-small, latency và số dự đoán trước NMS.",
  },
  {
    id: "cv-05-detr",
    title: "DETR: phát hiện vật thể như bài toán dự đoán tập hợp",
    domain: "Computer Vision",
    officialCategory: "Practice — IOAI 2026 / Object Detection (DETR; PDF syllabus ghi “DERT”)",
    prerequisites: [
      "cv-01-convolution",
      "Attention, Transformer encoder/decoder và positional encoding",
      "Bipartite matching, cross-entropy, L1 và generalized IoU",
    ],
    outcomes: [
      "Giải thích object queries và lớp no-object",
      "Mô tả Hungarian matching tạo ghép một-một giữa dự đoán và ground-truth",
      "Tính matching cost nhỏ bằng tay và phân biệt cost với training loss",
      "So sánh DETR với anchor detector về NMS, hội tụ và vật nhỏ",
    ],
    intuition:
      "DETR dự đoán một tập cố định các phần tử, mỗi query hoặc nhận một vật thể hoặc no-object. Hungarian matching chọn hoán vị tốt nhất nên thứ tự nhãn không quan trọng và mỗi vật thể chỉ ghép với một query. Cách nhìn set prediction loại bỏ anchor/NMS cổ điển, nhưng attention toàn cục và quá trình học vị trí khiến bản gốc huấn luyện lâu và khó với vật nhỏ.",
    math: [
      "Ghép tối ưu: $\\hat\\sigma=\\arg\\min_\\sigma\\sum_i C(y_i,\\hat y_{\\sigma(i)})$.",
      "Cost thường cộng classification, $L_1$ box và $1-GIoU$ với hệ số riêng.",
      "Self-attention chuẩn trên S tokens tốn $O(S^2d)$ thời gian và $O(S^2)$ ma trận attention.",
      "Số output luôn Q queries; Q phải lớn hơn số vật thể tối đa hợp lý.",
    ],
    fromScratchSteps: [
      "Tạo 3 ground-truth và 5 predictions; lập ma trận cost bằng NumPy.",
      "Brute-force mọi hoán vị trên ví dụ nhỏ để hiểu matching trước khi dùng linear_sum_assignment.",
      "Đánh dấu query chưa match thành no-object và tính loss theo cặp đã ghép.",
      "Fine-tune DETR pretrained, kiểm tra preprocessing/size mask và postprocess hộp.",
      "Vẽ attention/query predictions qua epoch để quan sát chuyên môn hóa.",
    ],
    whenToUse: [
      "Muốn pipeline set prediction gọn, tránh anchor tuning và NMS",
      "Có GPU và có thể dùng checkpoint pretrained/fine-tune",
      "Bài toán cần mở rộng kiến trúc Transformer sang panoptic hoặc vision-language",
    ],
    failureModes: [
      "Quên lớp no-object hoặc đặt trọng số quá lớn khiến mọi query dự đoán nền",
      "Nhầm hộp normalized cxcywh của model với xyxy pixel",
      "Dùng matching theo index thay vì tối ưu tập hợp",
      "Q nhỏ hơn số vật thể dày đặc dẫn đến trần recall",
      "Huấn luyện từ đầu trên dataset nhỏ và kết luận DETR kém mà không xét hội tụ/pretraining",
    ],
    complexity: [
      "Attention encoder theo số patch $S$: $O(S^2d)$; decoder cross-attention xấp xỉ $O(QSd)$ mỗi lớp.",
      "Hungarian matching thường $O(n^3)$ theo kích thước ma trận vuông hóa nhưng Q nhỏ hơn số dense anchors.",
      "Không có chi phí NMS; hậu xử lý chủ yếu lọc no-object và đổi tọa độ.",
    ],
    miniQuiz: [
      {
        question: "Vì sao không thể tính loss DETR bằng cách ghép dự đoán thứ i với nhãn thứ i?",
        expectedAnswer: "Ground-truth là tập không có thứ tự; Hungarian matching tìm hoán vị tối ưu và tránh phụ thuộc thứ tự file nhãn.",
        misconceptionToCatch: "Cho rằng query có lớp cố định từ trước.",
      },
      {
        question: "No-object có vai trò gì?",
        expectedAnswer: "Biểu diễn các query không được ghép với vật thể, cho phép số output cố định Q dù số vật thể thay đổi.",
        misconceptionToCatch: "Coi no-object là một vật thể nền cần bounding box thật.",
      },
    ],
    codingChallenge: {
      task: "Viết matcher DETR cho batch 1 bằng cost lớp + L1 + GIoU; brute-force khi Q≤8 để tự kiểm chứng nghiệm.",
      durationMinutes: 60,
      starterSignature: "def detr_match(logits, pred_cxcywh, targets, weights=(1.0, 5.0, 2.0)): ...",
      requirements: [
        "Tự viết box conversion, area, IoU và GIoU",
        "Không backprop qua chỉ số matching",
        "Xử lý đúng targets rỗng",
      ],
      acceptanceCriteria: [
        "Nghiệm khớp brute-force trên ít nhất 50 bài nhỏ random",
        "Bất biến khi hoán vị thứ tự targets",
        "Không NaN với hộp không giao nhau hoặc targets rỗng",
      ],
      aiBoundary: SELF_CODE_POLICY,
    },
    hiddenTestIdeas: [
      "Hai predictions cùng thích một target",
      "Đổi thứ tự target nhưng assignment hình học không đổi",
      "Tất cả logits nghiêng mạnh về no-object",
      "Hộp lồng nhau để phân biệt IoU và GIoU",
      "0 target và Q predictions",
    ],
    projectConnection:
      "Là detector Transformer đối chứng cho dự án thị giác; notebook so sánh phải giữ cùng dataset/split và báo mAP, latency, tham số, thời gian hội tụ thay vì chỉ ảnh minh họa đẹp.",
  },
  {
    id: "cv-06-unet",
    title: "U-Net: phân đoạn ảnh bằng encoder–decoder và skip connection",
    domain: "Computer Vision",
    officialCategory: "Practice — IOAI 2026 / Image Segmentation (U-Net)",
    prerequisites: [
      "cv-01-convolution",
      "Upsampling, transposed convolution và feature maps nhiều độ phân giải",
      "Binary/multiclass cross-entropy, Dice và IoU",
    ],
    outcomes: [
      "Phân biệt semantic, instance và panoptic segmentation",
      "Theo dõi shape encoder/decoder và ghép skip connection đúng trục",
      "Cài Dice score/loss ổn định cho binary và multiclass",
      "Xử lý mask resize, ignore index và class imbalance không làm hỏng nhãn",
    ],
    intuition:
      "Encoder nén ảnh để hiểu ngữ cảnh; decoder phóng trở lại để gán nhãn từng pixel. Nếu chỉ nén rồi phóng, biên và chi tiết nhỏ mất đi. Skip connection chuyển feature độ phân giải cao từ encoder sang decoder, kết hợp ‘ở đâu’ với ‘là gì’. U-Net dự đoán semantic mask; hai vật thể cùng lớp chạm nhau vẫn có thể dính thành một vùng.",
    math: [
      "Dice lớp c: $2\\sum_i p_{ic}y_{ic}/(\\sum_i p_{ic}+\\sum_i y_{ic})$ với smoothing chỉ để tránh 0/0.",
      "IoU: $TP/(TP+FP+FN)$; Dice và IoU liên hệ $Dice=2IoU/(1+IoU)$ trong binary hard mask.",
      "Pixel CE trung bình phải loại `ignore_index` khỏi cả tử và mẫu.",
      "Transposed convolution học upsampling nhưng có thể tạo checkerboard nếu kernel/stride không phù hợp.",
    ],
    fromScratchSteps: [
      "Đọc ảnh và mask; xác minh giá trị mask rời rạc sau mọi transform.",
      "Viết DoubleConv, Down và Up block; in shape của từng skip.",
      "Căn chỉnh khác biệt 1 pixel do pooling bằng crop/pad có chủ đích.",
      "Tính Dice/IoU theo lớp trên toàn validation set, không trung bình tùy tiện từng batch.",
      "Vẽ overlay input–ground truth–prediction và xem lỗi biên/lớp nhỏ.",
    ],
    whenToUse: [
      "Cần nhãn theo pixel cho y tế, vệ tinh, vật liệu hoặc vùng nền/đối tượng",
      "Dataset vừa/nhỏ và cần tận dụng skip connection mạnh",
      "Đầu ra là semantic mask; instance riêng biệt không phải yêu cầu chính",
    ],
    failureModes: [
      "Resize mask bằng bilinear tạo nhãn lớp phân số; phải dùng nearest cho mask rời rạc",
      "Tính Dice cả background làm che giấu lớp tiền cảnh kém",
      "Threshold tối ưu trên test gây leakage",
      "Skip tensor lệch shape do ảnh không chia hết cho $2^L$",
      "Mask rỗng làm định nghĩa metric mơ hồ; phải chốt quy ước trước",
    ],
    complexity: [
      "Convolution ở feature map lớn chi phối; xấp xỉ tổng $O(\\sum_l H_lW_lK_l^2C_{l-1}C_l)$.",
      "Skip connections giữ activation encoder đến lúc decode nên tốn bộ nhớ đáng kể.",
      "Tiling giảm bộ nhớ ảnh lớn nhưng cần overlap/blending để tránh đường nối.",
    ],
    miniQuiz: [
      {
        question: "Vì sao mask lớp không được resize bằng bilinear interpolation?",
        expectedAnswer: "Bilinear trộn mã lớp lân cận thành giá trị không phải nhãn; nearest giữ giá trị rời rạc.",
        misconceptionToCatch: "Cho rằng làm tròn sau bilinear luôn tương đương nearest.",
      },
      {
        question: "Skip connection U-Net giải quyết điều gì?",
        expectedAnswer: "Khôi phục thông tin không gian/biên độ phân giải cao bị mất trong encoder bằng cách ghép feature cùng scale.",
        misconceptionToCatch: "Nói skip chỉ giúp gradient như residual connection.",
      },
    ],
    codingChallenge: {
      task: "Tự xây U-Net mini bốn mức và Dice metric/loss cho bài binary segmentation hình học tổng hợp.",
      durationMinutes: 60,
      starterSignature: "class MiniUNet(nn.Module): ...\ndef dice_score(logits, target, threshold=0.5): ...",
      requirements: [
        "Không dùng thư viện segmentation/model zoo",
        "Mọi shape skip được assert với thông báo rõ",
        "Metric không giữ graph và tổng hợp theo pixel toàn epoch",
      ],
      acceptanceCriteria: [
        "Forward đúng cho ít nhất hai kích thước chia hết cho 16",
        "Dice khớp ví dụ tính tay, gồm mask rỗng theo quy ước đã ghi",
        "Overfit được 8 ảnh tổng hợp đến Dice > 0.95 để kiểm chứng pipeline",
      ],
      aiBoundary: SELF_CODE_POLICY,
    },
    hiddenTestIdeas: [
      "Prediction và target đều rỗng",
      "Target rỗng nhưng prediction có foreground",
      "Batch size 1 và mask không contiguous",
      "Logits rất lớn dương/âm",
      "Ảnh 64×80 để bắt giả định ảnh vuông",
    ],
    projectConnection:
      "Dùng để phân đoạn vùng rác/đường/ngập hoặc vùng bệnh; metric theo lớp và ảnh lỗi được đưa vào dashboard thay vì chỉ báo mean Dice.",
  },
  {
    id: "cv-07-resnet-transfer",
    title: "ResNet, encoder tiền huấn luyện và transfer learning",
    domain: "Computer Vision",
    officialCategory: "Practice — IOAI 2026 / Pre-trained Vision Encoders (e.g. ResNet)",
    prerequisites: [
      "cv-02-image-classification",
      "Residual block, batch normalization và optimizer",
      "Khái niệm pretraining, fine-tuning và domain shift",
    ],
    outcomes: [
      "Giải thích residual mapping và projection shortcut khi shape đổi",
      "Thay classification head, freeze/unfreeze có kiểm soát",
      "Dùng learning rate khác cho backbone và head",
      "Tránh sai preprocessing/BatchNorm khi chuyển miền",
    ],
    intuition:
      "Thay vì buộc block học toàn bộ ánh xạ H(x), ResNet học phần dư F(x)=H(x)−x rồi cộng lại x. Đường tắt cho tín hiệu và gradient đi qua dễ hơn. Pretrained encoder đã học cạnh, texture và cấu trúc; ta thay head và điều chỉnh từ ít đến nhiều tham số. Freeze không luôn tốt: nếu miền ảnh rất khác, cần unfreeze dần nhưng learning rate nhỏ.",
    math: [
      "Residual block: $y=\\sigma(F(x;W)+x)$; nếu shape đổi dùng $W_sx$ thay x.",
      "Bottleneck 1×1–3×3–1×1 giảm chi phí so với nhiều convolution 3×3 ở toàn bộ số kênh.",
      "Discriminative LR: $\\eta_{backbone} < \\eta_{head}$ để tránh catastrophic forgetting ban đầu.",
      "BatchNorm running mean/variance là trạng thái, không phải gradient; freeze weight chưa tự động quyết định chế độ train/eval.",
    ],
    fromScratchSteps: [
      "Cài BasicBlock với identity/projection và test shape ở stride 1/2.",
      "Nạp checkpoint chính thức, dùng đúng resize/crop/mean/std đi kèm weights.",
      "Thay head theo số lớp; train head-only để có baseline.",
      "Unfreeze stage cuối, đặt parameter groups với LR riêng và so sánh validation.",
      "Lưu checkpoint gồm model, optimizer, scheduler, label mapping và preprocessing config.",
    ],
    whenToUse: [
      "Dataset gán nhãn nhỏ/vừa và miền tương đối gần ảnh tự nhiên",
      "Cần encoder dùng chung cho classification, detection hoặc segmentation",
      "Cần baseline mạnh, ổn định trước mô hình chuyên biệt",
    ],
    failureModes: [
      "Dùng normalization khác checkpoint làm feature lệch",
      "Freeze backbone nhưng để BatchNorm cập nhật running stats ngoài ý muốn",
      "LR quá cao phá feature pretrained",
      "Head cũ chưa được thay đúng số lớp hoặc label index sai",
      "Đánh giá transfer bằng test nhiều lần trong quá trình chọn cấu hình",
    ],
    complexity: [
      "Freeze giảm activation/gradient cần lưu cho backbone nhưng forward FLOPs gần như không đổi.",
      "ResNet bottleneck tối ưu số FLOPs qua 1×1; độ phân giải input vẫn làm chi phí tăng gần bậc hai theo cạnh ảnh.",
      "Linear probing lưu embedding trước có thể giảm mỗi thí nghiệm xuống $O(ND K)$ cho head.",
    ],
    miniQuiz: [
      {
        question: "Khi nào shortcut cần projection 1×1?",
        expectedAnswer: "Khi số kênh hoặc kích thước không gian của F(x) khác x, thường do đổi channel hoặc stride.",
        misconceptionToCatch: "Luôn dùng projection trong mọi block.",
      },
      {
        question: "Freeze parameters có tự động chuyển BatchNorm sang eval không?",
        expectedAnswer: "Không; requires_grad và train/eval là hai cơ chế khác nhau, phải quản lý running stats có chủ đích.",
        misconceptionToCatch: "Cho rằng requires_grad=False đóng băng toàn bộ trạng thái layer.",
      },
    ],
    codingChallenge: {
      task: "Cài BasicBlock và mini-ResNet, sau đó viết hàm cấu hình head-only rồi unfreeze stage cuối với hai learning rate.",
      durationMinutes: 60,
      starterSignature: "class BasicBlock(nn.Module): ...\ndef configure_transfer(model, num_classes, phase): ...",
      requirements: [
        "Không dùng torchvision.models để cài block mini; được dùng checkpoint ở phần transfer riêng",
        "Liệt kê rõ tham số nào trainable ở từng phase",
        "Không thay đổi classifier bằng cách hard-code tên lớp duy nhất",
      ],
      acceptanceCriteria: [
        "Gradient đi qua identity và residual branch",
        "Output shape đúng khi stride/channel đổi",
        "Optimizer có đúng parameter groups, không trùng hoặc thiếu tham số trainable",
      ],
      aiBoundary: SELF_CODE_POLICY,
    },
    hiddenTestIdeas: [
      "Input/output channel giống nhau nhưng stride 2",
      "Số lớp mục tiêu bằng 1 và bằng 17",
      "Kiểm tra một parameter không xuất hiện ở hai optimizer groups",
      "BN running_mean không đổi trong phase freeze nếu chính sách yêu cầu",
      "State dict thiếu head nhưng backbone hợp lệ",
    ],
    projectConnection:
      "Cung cấp encoder chuẩn cho mọi dự án ảnh; báo cáo ablation random-init, linear probe và fine-tune để biết lợi ích thật của pretraining.",
  },
  {
    id: "cv-08-augmentation",
    title: "Image augmentation: tăng biến thiên mà không đổi ý nghĩa nhãn",
    domain: "Computer Vision",
    officialCategory: "Practice — IOAI 2026 / Image Augmentation",
    prerequisites: [
      "cv-02-image-classification",
      "Xác suất, biến đổi hình học và photometric",
      "Quy tắc đồng bộ transform giữa image, box và mask",
    ],
    outcomes: [
      "Chọn augmentation dựa trên invariance thật của bài toán",
      "Áp dụng đồng bộ random crop/flip cho ảnh và nhãn không gian",
      "Phân biệt train-time augmentation, test-time augmentation và leakage",
      "Thiết kế ablation để biết transform nào hữu ích",
    ],
    intuition:
      "Augmentation mã hóa giả định rằng nhãn không đổi dưới một biến đổi. Lật ngang hợp lý với mèo nhưng có thể đổi nghĩa chữ, biển báo hoặc bên trái/phải y khoa. Augmentation tốt tạo mẫu có thể xuất hiện ngoài đời; augmentation quá mạnh tạo dữ liệu sai nhãn. Với detection/segmentation, cùng một phép biến đổi ngẫu nhiên phải áp vào ảnh, hộp và mask.",
    math: [
      "Huấn luyện tối ưu kỳ vọng $E_{(x,y)}E_{t\\sim T}[L(f(t(x)),t_y(y))]$.",
      "Mixup: $\\tilde x=\\lambda x_i+(1-\\lambda)x_j$, $\\tilde y=\\lambda y_i+(1-\\lambda)y_j$, thường $\\lambda\\sim Beta(\\alpha,\\alpha)$.",
      "Crop hộp cần giao với crop window, dịch tọa độ, clip biên và lọc hộp còn diện tích/tỉ lệ đủ.",
    ],
    fromScratchSteps: [
      "Liệt kê invariance hợp lệ và biến đổi có thể phá nhãn cho dataset.",
      "Cài horizontal flip cho ảnh + xyxy boxes bằng công thức, vẽ kiểm tra.",
      "Dùng RNG nhận seed/generator thay vì random toàn cục khó tái lập.",
      "Huấn luyện baseline, thêm từng nhóm geometric/photometric rồi ghi delta metric.",
      "Kiểm tra 100 mẫu sau augmentation bằng contact sheet trước khi chạy lâu.",
    ],
    whenToUse: [
      "Dataset nhỏ hoặc train–test có biến thiên ánh sáng/góc nhìn hợp lý",
      "Cần regularization dựa trên hiểu biết miền",
      "Self-supervised learning cần hai views tương quan của cùng mẫu",
    ],
    failureModes: [
      "Biến đổi làm đổi nhãn nhưng pipeline giữ nguyên label",
      "Box/mask không đồng bộ với ảnh",
      "Áp random augmentation lên validation làm metric dao động",
      "Augmentation mạnh che mất vật thể nhỏ",
      "So sánh thí nghiệm với seed/split khác nên không quy được nguyên nhân",
    ],
    complexity: [
      "Transform CPU có thể trở thành bottleneck DataLoader dù không tăng FLOPs model.",
      "TTA nhân gần tuyến tính latency theo số views và cần quy tắc hợp nhất output.",
      "Cache ảnh sau augmentation cố định làm mất tính ngẫu nhiên giữa epoch và tốn dung lượng.",
    ],
    miniQuiz: [
      {
        question: "Lật ngang ảnh chữ viết có luôn là augmentation hợp lệ không?",
        expectedAnswer: "Không; nó tạo ký tự phản chiếu không tự nhiên và có thể đổi nhãn/ý nghĩa.",
        misconceptionToCatch: "Cho rằng mọi augmentation giữ nguyên label vì code không đổi label.",
      },
      {
        question: "Vì sao validation thường không dùng random crop/flip?",
        expectedAnswer: "Cần phép đo ổn định, đại diện deployment; random transform làm thay mục tiêu và tăng phương sai metric.",
        misconceptionToCatch: "Nói tuyệt đối không bao giờ được dùng TTA.",
      },
    ],
    codingChallenge: {
      task: "Viết RandomHorizontalFlip và RandomCrop đồng bộ cho image NumPy, xyxy boxes, labels và semantic mask.",
      durationMinutes: 55,
      starterSignature: "def augment_sample(image, boxes, labels, mask, rng): ...",
      requirements: [
        "Không dùng Albumentations/torchvision transforms cho phần cốt lõi",
        "Không mutate input và giữ labels thẳng hàng sau khi lọc box",
        "Cùng rng seed phải cho output giống hệt",
      ],
      acceptanceCriteria: [
        "Hộp sau biến đổi nằm trong ảnh và có diện tích dương",
        "Mask chỉ còn các mã lớp đầu vào",
        "Test hình học bằng ảnh có điểm mốc cho kết quả tính tay",
      ],
      aiBoundary: SELF_CODE_POLICY,
    },
    hiddenTestIdeas: [
      "Không có box",
      "Box nằm một phần ngoài crop",
      "Box đúng bằng biên phải ảnh",
      "Mask có ignore_index 255",
      "Crop loại toàn bộ đối tượng",
    ],
    projectConnection:
      "Xây thư viện augmentation chung cho classifier/detector/segmenter; mọi transform phải có ảnh preview và ablation metric để tránh ‘tăng cường theo cảm giác’.",
  },
  {
    id: "cv-09-gan",
    title: "GAN: trò chơi đối kháng để sinh ảnh",
    domain: "Computer Vision",
    officialCategory: "Practice — IOAI 2026 / Generating Images with GANs",
    prerequisites: [
      "MLP/CNN, backpropagation và binary cross-entropy",
      "Biến ngẫu nhiên tiềm ẩn và phân phối dữ liệu",
      "cv-08-augmentation",
    ],
    outcomes: [
      "Mô tả vai trò generator/discriminator và lịch cập nhật xen kẽ",
      "Cài DCGAN tối giản và tách graph đúng khi train D/G",
      "Nhận diện mode collapse, mất cân bằng và metric đánh giá không đầy đủ",
      "Không dùng ảnh tổng hợp để tuyên bố tăng dữ liệu nếu thiếu thí nghiệm downstream",
    ],
    intuition:
      "Generator biến noise thành ảnh; discriminator phân biệt thật–giả. Discriminator càng tốt tạo tín hiệu để generator dịch phân phối giả gần dữ liệu thật. Đây là tối ưu hai người chơi, không phải loss đơn giảm đều. Nếu một bên quá mạnh, gradient cho bên kia vô ích; nếu generator tìm vài mẫu đánh lừa tốt, nó có thể bỏ nhiều mode của dữ liệu.",
    math: [
      "Minimax: $\\min_G\\max_D E_{x\\sim p_{data}}\\log D(x)+E_{z\\sim p(z)}\\log(1-D(G(z)))$.",
      "Non-saturating G loss thường dùng $-E_z\\log D(G(z))$ để gradient mạnh hơn lúc đầu.",
      "FID so mean/covariance feature: $||\\mu_r-\\mu_g||^2+Tr(\\Sigma_r+\\Sigma_g-2(\\Sigma_r\\Sigma_g)^{1/2})$; cần nhiều mẫu và cùng pipeline feature.",
    ],
    fromScratchSteps: [
      "Tạo dataset 2D nhiều mode để quan sát hành vi trước ảnh.",
      "Cài G và D nhỏ; một bước train D dùng fake.detach().",
      "Đóng băng/zero gradient đúng rồi train G qua D mà không cập nhật D.",
      "Lưu fixed noise và ảnh grid qua epoch để theo dõi tiến triển.",
      "Đo diversity gần đúng và thử downstream utility thay vì chỉ chọn ảnh đẹp.",
    ],
    whenToUse: [
      "Cần mô hình sinh nhanh sau huấn luyện và chấp nhận khó ổn định",
      "Bài học về implicit generative modeling/adversarial training",
      "Có metric/kiểm tra miền rõ để đánh giá ảnh tổng hợp",
    ],
    failureModes: [
      "Mode collapse: nhiều z cho ảnh gần giống",
      "Discriminator quá mạnh làm gradient G yếu",
      "Quên detach fake khi train D khiến gradient chảy vào G ngoài ý muốn",
      "Chọn checkpoint bằng mắt trên test hoặc chỉ công bố vài ảnh đẹp",
      "Dùng FID trên quá ít mẫu hoặc khác preprocessing",
    ],
    complexity: [
      "Mỗi iteration cần forward/backward D trên real/fake và G qua D, đắt hơn một model đơn.",
      "Không cần likelihood hay chuỗi nhiều bước khi inference; sinh ảnh thường một forward G.",
      "Bộ nhớ phụ thuộc activation cả G và D; có thể cập nhật tuần tự để giải phóng graph.",
    ],
    miniQuiz: [
      {
        question: "Vì sao dùng fake.detach() khi cập nhật discriminator?",
        expectedAnswer: "Bước đó chỉ tối ưu D; detach ngăn gradient cập nhật/tích lũy vào G và giảm graph không cần thiết.",
        misconceptionToCatch: "Cho rằng detach làm ảnh fake mất giá trị.",
      },
      {
        question: "Loss GAN ổn định có đủ chứng minh ảnh tốt và đa dạng không?",
        expectedAnswer: "Không; loss hai người chơi khó diễn giải, cần mẫu cố định, diversity và metric/downstream evaluation.",
        misconceptionToCatch: "Đồng nhất loss thấp với chất lượng sinh cao.",
      },
    ],
    codingChallenge: {
      task: "Viết một iteration DCGAN gồm train_D và train_G, kèm test bảo đảm gradient chỉ xuất hiện ở mạng cần cập nhật.",
      durationMinutes: 55,
      starterSignature: "def gan_step(generator, discriminator, real, z, opt_g, opt_d): ...",
      requirements: [
        "Không dùng trainer/GAN library",
        "Zero gradient và detach đúng vị trí",
        "Trả scalar losses và batch fake đã tách graph để logging",
      ],
      acceptanceCriteria: [
        "Tham số G không đổi trong train_D và D không đổi trong train_G",
        "Không NaN với logits lớn nhờ BCEWithLogitsLoss",
        "Có fixed-noise sampling tái lập được",
      ],
      aiBoundary: SELF_CODE_POLICY,
    },
    hiddenTestIdeas: [
      "Batch size 1",
      "Discriminator trả shape (B,) thay vì (B,1)",
      "Kiểm tra data_ptr/parameter clone trước sau từng substep",
      "z cố định cho output eval xác định",
      "Real tensor requires_grad=True không được bị sửa",
    ],
    projectConnection:
      "Có thể tạo dữ liệu mô phỏng cho demo, nhưng chỉ đưa vào dự án chính nếu ablation trên test độc lập chứng minh cải thiện và có kiểm tra thiên lệch/ảnh lỗi.",
  },
  {
    id: "cv-10-self-supervised",
    title: "Self-supervised vision: contrastive learning và representation",
    domain: "Computer Vision",
    officialCategory: "Practice — IOAI 2026 / Self-Supervised Learning for Vision",
    prerequisites: [
      "cv-07-resnet-transfer",
      "cv-08-augmentation",
      "Embedding, cosine similarity, temperature và cross-entropy",
    ],
    outcomes: [
      "Phân biệt pretext objective, pretraining không nhãn và downstream evaluation",
      "Tạo hai views, positive/negative pairs và InfoNCE loss",
      "Hiểu augmentation quyết định invariance mà encoder học",
      "Đánh giá representation bằng linear probe và fine-tuning đúng split",
    ],
    intuition:
      "Hai biến thể của cùng ảnh phải có embedding gần nhau, ảnh khác xa nhau. Encoder vì thế học đặc trưng bền với crop/màu/nhiễu đã chọn. Projection head phục vụ contrastive loss; downstream thường lấy feature trước head. Nếu augmentation xóa tín hiệu nhãn, mô hình sẽ học bất biến với chính điều cần dự đoán.",
    math: [
      "Cosine $s(i,j)=z_i^Tz_j/(||z_i||||z_j||)$.",
      "InfoNCE một anchor: $-\\log \\frac{e^{s(i,j)/\\tau}}{\\sum_{k\\ne i}e^{s(i,k)/\\tau}}$.",
      "Với 2B views, similarity matrix cần $O(B^2D)$ thời gian và $O(B^2)$ bộ nhớ nếu materialize.",
    ],
    fromScratchSteps: [
      "Tạo batch B ảnh và hai augmented views theo cặp xác định.",
      "Encode 2B views, projection, L2-normalize.",
      "Tự xây similarity matrix, mask diagonal và chỉ số positive.",
      "Kiểm tra loss giảm khi cố ý làm positive vectors giống nhau.",
      "Đóng băng encoder, train linear probe trên labels rồi so với random encoder.",
    ],
    whenToUse: [
      "Có nhiều ảnh không nhãn và ít nhãn downstream",
      "Muốn encoder tái dùng cho nhiều nhiệm vụ",
      "Có thể thiết kế augmentations bảo toàn ngữ nghĩa",
    ],
    failureModes: [
      "Positive index lệch sau concat views",
      "Không mask self-similarity khiến bài toán quá dễ",
      "Batch quá nhỏ thiếu negatives hoặc temperature không phù hợp",
      "Representation collapse trong phương pháp không negative nếu thiếu cơ chế chống collapse",
      "Đánh giá bằng head pretraining thay vì feature encoder cần dùng",
    ],
    complexity: [
      "Hai views gần gấp đôi forward encoder so với supervised một view.",
      "Naive contrastive matrix $O(B^2)$ memory; distributed negatives cần gather đúng gradient semantics.",
      "Linear probe rẻ vì encoder freeze; full fine-tune cần lại activation memory.",
    ],
    miniQuiz: [
      {
        question: "Vì sao projection head thường bỏ khi làm downstream?",
        expectedAnswer: "Head tối ưu không gian cho pretext loss; feature encoder trước head thường giữ thông tin tổng quát hơn.",
        misconceptionToCatch: "Cho rằng projection head luôn vô dụng trong mọi downstream.",
      },
      {
        question: "Augmentation màu mạnh có thể gây hại khi nào?",
        expectedAnswer: "Khi màu là tín hiệu thật của nhãn; SSL sẽ học bỏ qua màu vì hai view bị ép gần nhau.",
        misconceptionToCatch: "Cho rằng augmentation càng mạnh càng tốt.",
      },
    ],
    codingChallenge: {
      task: "Cài NT-Xent/InfoNCE loss cho 2B embeddings và viết kiểm thử permutation/index positives.",
      durationMinutes: 50,
      starterSignature: "def nt_xent(z1, z2, temperature=0.2): ...",
      requirements: [
        "Không dùng loss contrastive có sẵn",
        "Ổn định số với logits shifting/logsumexp",
        "Không dùng vòng lặp Python theo từng mẫu",
      ],
      acceptanceCriteria: [
        "Loss bất biến khi hoán vị z1 và z2 cùng một permutation",
        "Loss thấp hơn rõ khi z1=z2 so với pair ngẫu nhiên",
        "Gradient hữu hạn với batch ≥2 và vector khác 0",
      ],
      aiBoundary: SELF_CODE_POLICY,
    },
    hiddenTestIdeas: [
      "B=2 để bắt mask/positive index",
      "z1/z2 chưa normalize",
      "Logits lớn do temperature rất nhỏ nhưng hợp lệ",
      "Hoán vị chỉ z2 phải làm loss đổi",
      "Kiểm tra không sửa input in-place",
    ],
    projectConnection:
      "Pretrain encoder trên ảnh không nhãn thu thập cho dự án rồi dùng cùng evaluation protocol linear probe/fine-tune; lưu augmentation config như một phần của model card.",
  },
  {
    id: "cv-11-clip",
    title: "CLIP: căn chỉnh embedding ảnh–văn bản",
    domain: "Multimodal",
    officialCategory: "Practice — IOAI 2026 / Vision-text Encoders (e.g. CLIP)",
    prerequisites: [
      "cv-10-self-supervised",
      "NLP tokenization và Transformer encoder cơ bản",
      "Cosine similarity, contrastive loss và retrieval metrics",
    ],
    outcomes: [
      "Giải thích dual encoder và batch contrastive objective hai chiều",
      "Thực hiện zero-shot classification bằng prompt embeddings",
      "Xây image-to-text/text-to-image retrieval và Recall@K",
      "Nhận diện prompt sensitivity, dataset bias và giới hạn open-vocabulary",
    ],
    intuition:
      "CLIP đưa ảnh và mô tả đúng vào cùng không gian vector. Trong batch, cặp cùng index là positive, các cặp khác là negatives. Khi zero-shot classification, tên lớp được viết thành prompt, encode thành prototypes rồi so cosine với ảnh. CLIP không ‘hiểu đúng mọi ảnh’; nó kế thừa dữ liệu web, nhạy với cách viết prompt và có thể dựa vào shortcut.",
    math: [
      "Logits ảnh–text: $L=\\exp(t)\\, Z_I Z_T^T$ với hai embedding đã L2-normalize và logit scale học được.",
      "Loss là trung bình cross-entropy theo hàng và theo cột, mục tiêu là đường chéo batch.",
      "Retrieval Recall@K: tỉ lệ query có ít nhất một positive trong top K; cần xử lý nhiều caption/ảnh đúng.",
    ],
    fromScratchSteps: [
      "Tạo embedding ảnh/text giả nhỏ và tính matrix cosine bằng tay.",
      "Viết symmetric contrastive loss và kiểm tra hoán vị cặp.",
      "Nạp checkpoint/model card chính thức, dùng đúng preprocess/tokenizer.",
      "Viết nhiều prompt templates cho mỗi class, normalize rồi ensemble prototypes.",
      "Đánh giá zero-shot và retrieval theo từng nhóm, xem top lỗi chứ không suy từ demo đơn lẻ.",
    ],
    whenToUse: [
      "Zero-shot/few-shot phân loại với nhãn có thể mô tả bằng ngôn ngữ",
      "Tìm kiếm ảnh bằng văn bản hoặc ngược lại",
      "Khởi tạo encoder cho hệ vision-language",
    ],
    failureModes: [
      "Quên L2 normalization làm dot product thiên về độ lớn vector",
      "Prompt chỉ là từ rời mơ hồ và kết luận model kém",
      "Dùng caption trùng/near-duplicate ở train và test retrieval",
      "Recall@K sai khi một query có nhiều positives",
      "Tin confidence cosine như xác suất đã hiệu chuẩn",
    ],
    complexity: [
      "Encode độc lập cho phép cache một phía; similarity toàn bộ $O(N_MD)$ cho một query với M candidates.",
      "Training batch contrastive materialize matrix $B×B$, thời gian $O(B^2D)$ và memory $O(B^2)$.",
      "ANN index giảm tìm kiếm quy mô lớn với trade-off recall–latency.",
    ],
    miniQuiz: [
      {
        question: "Tại sao zero-shot CLIP thường dùng nhiều prompt templates?",
        expectedAnswer: "Cách diễn đạt làm thay embedding text; ensemble giảm nhạy với một prompt và mô tả ngữ cảnh ảnh tốt hơn.",
        misconceptionToCatch: "Cho rằng prompt ensemble là huấn luyện lại model.",
      },
      {
        question: "Dual encoder khác cross-encoder ở lợi thế retrieval nào?",
        expectedAnswer: "Có thể encode/cache candidates độc lập và tìm kiếm vector nhanh; cross-encoder phải xử lý từng cặp.",
        misconceptionToCatch: "Cho rằng dual encoder luôn chính xác hơn.",
      },
    ],
    codingChallenge: {
      task: "Từ hai ma trận embeddings, cài symmetric CLIP loss và zero-shot classifier với prompt ensemble.",
      durationMinutes: 50,
      starterSignature: "def clip_loss(image_features, text_features, logit_scale): ...\ndef zero_shot_logits(images, class_prompt_features): ...",
      requirements: [
        "Tự viết normalization, similarity và loss; không dùng package CLIP cho phần toán",
        "Hỗ trợ nhiều prompt mỗi class với aggregation ghi rõ",
        "Kiểm tra dtype/device và batch shape",
      ],
      acceptanceCriteria: [
        "Loss khớp phép tính tham chiếu hai cross-entropy",
        "Hoán vị đồng thời hai modality giữ loss",
        "Classifier không thay đổi khi nhân raw feature với scalar dương trước normalize",
      ],
      aiBoundary: SELF_CODE_POLICY,
    },
    hiddenTestIdeas: [
      "Batch 1",
      "Embedding có norm rất nhỏ",
      "Số prompt mỗi lớp không đều",
      "Hai lớp có prototype giống nhau",
      "logit_scale được truyền ở dạng log-scale và raw-scale để bắt giao diện mơ hồ",
    ],
    projectConnection:
      "Là lõi cho tìm kiếm ảnh trường học/sản phẩm bằng tiếng Việt hoặc gán nhãn mở; cần benchmark prompt tiếng Việt/Anh và kiểm tra thiên lệch theo nhóm dữ liệu.",
  },
  {
    id: "cv-12-diffusion",
    title: "Diffusion models: thêm nhiễu, học khử nhiễu và lấy mẫu",
    domain: "Computer Vision",
    officialCategory: "Practice — IOAI 2026 / Diffusion Models",
    prerequisites: [
      "Xác suất Gaussian, kỳ vọng và reparameterization",
      "cv-06-unet",
      "Timestep embedding và conditional generation cơ bản",
    ],
    outcomes: [
      "Mô tả forward noising và reverse denoising nhiều bước",
      "Tạo $x_t$ trực tiếp từ $x_0$ và noise bằng cumulative alpha",
      "Huấn luyện noise predictor tối giản và viết sampling loop",
      "Giải thích classifier-free guidance, seed và trade-off bước lấy mẫu",
    ],
    intuition:
      "Forward process phá ảnh dần bằng Gaussian noise theo lịch biết trước. Mạng học đoán phần noise tại một thời điểm ngẫu nhiên; từ noise thuần, ta lặp khử nhiễu để sinh ảnh. Model không ghi nhớ một ảnh duy nhất mà học trường vector hướng về vùng dữ liệu. Guidance kéo mẫu theo điều kiện nhưng quá mạnh có thể giảm đa dạng hoặc tạo artefact.",
    math: [
      "$q(x_t|x_0)=\\mathcal N(\\sqrt{\\bar\\alpha_t}x_0,(1-\\bar\\alpha_t)I)$ nên $x_t=\\sqrt{\\bar\\alpha_t}x_0+\\sqrt{1-\\bar\\alpha_t}\\epsilon$.",
      "Simple objective: $E_{x_0,t,\\epsilon}||\\epsilon-\\epsilon_\\theta(x_t,t,c)||_2^2$.",
      "Classifier-free guidance: $\\epsilon=\\epsilon_{uncond}+w(\\epsilon_{cond}-\\epsilon_{uncond})$.",
      "Sampling T bước gọi denoiser T lần; latent diffusion giảm kích thước không gian xử lý.",
    ],
    fromScratchSteps: [
      "Tạo beta schedule nhỏ, tính alpha và cumulative product bằng float đủ chính xác.",
      "Viết q_sample nhận x0, timestep riêng từng mẫu và noise tùy chọn.",
      "Kiểm tra phân phối: t=0 gần ảnh, t lớn gần noise.",
      "Huấn luyện tiny noise network trên dữ liệu 2D/ảnh rất nhỏ.",
      "Cài reverse loop có torch.no_grad, seed và lưu intermediate samples.",
    ],
    whenToUse: [
      "Sinh/chỉnh sửa dữ liệu đa dạng khi chất lượng quan trọng hơn latency",
      "Inpainting, conditional generation hoặc học biểu diễn qua denoising",
      "Bài học cần hiểu mô hình sinh hiện đại thay cho GAN",
    ],
    failureModes: [
      "Lệch indexing beta/alpha giữa training và sampling",
      "Broadcast timestep sai theo batch/channel",
      "Thêm noise ở bước cuối t=0 trong sampler",
      "Guidance scale quá cao làm bão hòa, ít đa dạng",
      "Dùng ảnh sinh không kiểm tra bản quyền, bias, nội dung nguy hại hoặc downstream utility",
    ],
    complexity: [
      "Training một bước gần một forward/backward U-Net; sampling cần nhiều forward tuần tự.",
      "Self/cross-attention ở resolution cao tốn memory bậc hai theo số vị trí.",
      "Latent diffusion giảm H×W trước U-Net nhưng thêm encoder/decoder và sai số tái tạo.",
    ],
    miniQuiz: [
      {
        question: "Có cần mô phỏng tuần tự từ x0 đến xt khi train không?",
        expectedAnswer: "Không; công thức closed-form dùng cumulative alpha cho phép lấy xt trực tiếp ở timestep ngẫu nhiên.",
        misconceptionToCatch: "Cho rằng mỗi batch phải chạy qua mọi bước noising.",
      },
      {
        question: "Tăng số bước sampling luôn cải thiện vô hạn không?",
        expectedAnswer: "Không; có diminishing returns, phụ thuộc sampler/schedule/model và tăng latency.",
        misconceptionToCatch: "Đồng nhất nhiều bước với chắc chắn đúng hơn.",
      },
    ],
    codingChallenge: {
      task: "Cài linear beta schedule, q_sample và một reverse-step DDPM giản lược; test thống kê trên tensor nhỏ.",
      durationMinutes: 60,
      starterSignature: "def q_sample(x0, t, noise, alpha_bar): ...\ndef p_step(model, xt, t, schedule, generator=None): ...",
      requirements: [
        "Không dùng diffusion library",
        "Hỗ trợ timestep khác nhau trong cùng batch",
        "Không thêm random noise tại t=0",
      ],
      acceptanceCriteria: [
        "q_sample khớp công thức tham chiếu và shape input",
        "Cùng generator seed cho kết quả giống nhau",
        "Không NaN ở hai đầu schedule hợp lệ",
      ],
      aiBoundary: SELF_CODE_POLICY,
    },
    hiddenTestIdeas: [
      "Batch có t=[0,T−1]",
      "Tensor 1D và 4D để bắt broadcast hard-code",
      "Noise bằng 0 để kiểm tra hệ số",
      "float64 so với công thức exact",
      "t=0 không phụ thuộc generator noise",
    ],
    projectConnection:
      "Dùng demo sinh/khử nhiễu có slider timestep trên web; dự án thật phải ghi rõ model/license, provenance ảnh và không xem ảnh tổng hợp là dữ liệu thật đã kiểm chứng.",
  },
  {
    id: "cv-13-vision-transformer",
    title: "Vision Transformer: ảnh thành chuỗi patch tokens",
    domain: "Computer Vision",
    officialCategory: "Both — IOAI 2026 / Transformers (theory required for text and image)",
    prerequisites: [
      "Attention, multi-head self-attention và layer normalization",
      "cv-01-convolution",
      "Positional embeddings và MLP block",
    ],
    outcomes: [
      "Patching ảnh thành token và tính số token/shape chính xác",
      "Giải thích class token, positional embedding và pre-norm residual block",
      "So sánh inductive bias ViT với CNN",
      "Nhận biết chi phí attention khi tăng độ phân giải",
    ],
    intuition:
      "ViT chia ảnh thành các ô, tuyến tính hóa mỗi ô thành token rồi dùng Transformer để mọi patch trao đổi thông tin. CNN có locality/weight sharing mạnh; ViT ít bias không gian hơn nên thường cần pretraining/augmentation tốt nhưng linh hoạt với quan hệ xa. Positional embedding là cần thiết vì self-attention thuần không tự biết patch ở đâu.",
    math: [
      "Số patch $N=(H/P_h)(W/P_w)$ nếu chia hết; mỗi patch thô có $P_hP_wC$ phần tử.",
      "Attention$(Q,K,V)=softmax(QK^T/\\sqrt{d_k})V$.",
      "Attention trên N+1 tokens tốn $O(N^2d)$ và attention matrix $O(N^2)$.",
      "Patch embedding bằng Linear(flatten patch) tương đương Conv2d kernel=stride=P về shape.",
    ],
    fromScratchSteps: [
      "Dùng reshape/permute để patchify ảnh nhỏ và unpatchify kiểm tra round-trip.",
      "Project patch, prepend class token, cộng positional embeddings.",
      "Cài một pre-norm encoder block với residual đúng shape.",
      "Thêm head từ class token hoặc mean pooling và so sánh.",
      "Đo memory/token count khi đổi resolution hoặc patch size.",
    ],
    whenToUse: [
      "Có checkpoint pretrained phù hợp và cần quan hệ toàn cục",
      "Muốn backbone tương thích hệ multimodal/Transformer",
      "Resolution vừa phải hoặc có attention tối ưu/hierarchical design",
    ],
    failureModes: [
      "Ảnh không chia hết patch nhưng code reshape im lặng bỏ/nhầm pixel",
      "Permute sai làm patch trộn channel/vị trí",
      "Đổi resolution nhưng positional embedding không nội suy đúng",
      "Train từ đầu trên dataset nhỏ rồi so không công bằng với CNN pretrained",
      "Tăng resolution gấp đôi mỗi cạnh làm số token ×4 và attention matrix ×16",
    ],
    complexity: [
      "Patch projection $O(NP^2Cd)$; mỗi attention block $O(N^2d+Nd^2)$.",
      "Patch lớn giảm N và compute nhưng mất chi tiết nhỏ.",
      "Activation attention thường là nút thắt memory ở resolution cao.",
    ],
    miniQuiz: [
      {
        question: "Ảnh 224×224, patch 16×16 tạo bao nhiêu patch tokens trước class token?",
        expectedAnswer: "14×14 = 196 patch tokens.",
        misconceptionToCatch: "Cộng class token thành 197 dù câu hỏi hỏi trước class token.",
      },
      {
        question: "Vì sao phải có positional information?",
        expectedAnswer: "Self-attention thuần gần như permutation-equivariant; không có vị trí thì không phân biệt bố cục patch.",
        misconceptionToCatch: "Cho rằng thứ tự trong tensor tự động được attention biết.",
      },
    ],
    codingChallenge: {
      task: "Viết patchify/unpatchify và patch embedding bằng hai cách reshape+Linear và Conv2d, chứng minh output tương đương sau map weight.",
      durationMinutes: 55,
      starterSignature: "def patchify(x, patch_size): ...\ndef unpatchify(tokens, image_shape, patch_size): ...",
      requirements: [
        "Không dùng einops",
        "Assert điều kiện chia hết và ghi rõ thứ tự token",
        "Không hard-code ảnh vuông hoặc ba channel",
      ],
      acceptanceCriteria: [
        "unpatchify(patchify(x)) bằng x chính xác",
        "Linear và Conv2d patch embedding sai số < 1e-6 sau map weight",
        "Đúng với patch chữ nhật và ảnh không vuông hợp lệ",
      ],
      aiBoundary: SELF_CODE_POLICY,
    },
    hiddenTestIdeas: [
      "Ảnh 1 channel 8×12, patch 2×3",
      "Batch >1 và tensor non-contiguous",
      "Kích thước không chia hết phải báo lỗi",
      "Patch 1×1",
      "Kiểm tra thứ tự raster bằng ảnh chứa index tăng dần",
    ],
    projectConnection:
      "Chuẩn bị cho DETR, CLIP và hệ vision-language; web có thể hiển thị patch grid và attention map nhưng phải ghi rõ attention không tự động là lời giải thích nhân quả.",
  },
  {
    id: "nlp-01-tokenization-embeddings",
    title: "Tokenization và embedding văn bản: từ chuỗi đến tensor",
    domain: "NLP",
    officialCategory: "Both — IOAI 2026 / Data Embeddings (text) và nền bắt buộc cho NLP",
    prerequisites: [
      "Python string/Unicode, dictionary và NumPy",
      "Vector, cosine similarity và ma trận tra cứu",
      "Train/validation split và xử lý dữ liệu cơ bản",
    ],
    outcomes: [
      "Phân biệt tokenization theo từ, ký tự và subword; mô tả trade-off vocabulary–sequence length",
      "Tạo vocabulary chỉ từ train, xử lý PAD/UNK/BOS/EOS và padding mask",
      "Cài embedding lookup và mean pooling có mask",
      "Nhận biết Unicode normalization, data leakage và tokenizer/model mismatch",
    ],
    intuition:
      "Mô hình không nhận câu trực tiếp mà nhận dãy chỉ số. Tokenizer quyết định đơn vị: từ giúp chuỗi ngắn nhưng vocabulary lớn/OOV; ký tự bền với từ mới nhưng chuỗi dài; subword cân bằng hai phía. Embedding là bảng tra cứu biến mỗi id thành vector học được. Padding chỉ để ghép batch, không phải nội dung, nên mọi phép pooling/attention phải che PAD.",
    math: [
      "Embedding table $E\\in\\mathbb{R}^{V\\times d}$; token id i lấy hàng $E_i$, tương đương one-hot $e_i^TE$ nhưng không cần tạo one-hot.",
      "Mean pooling có mask: $h=\\sum_t m_th_t/\\max(1,\\sum_t m_t)$.",
      "BPE lặp ghép cặp ký hiệu có tần suất cao; tokenizer được fit chỉ trên train để tránh nhìn vocabulary của test.",
      "Cosine similarity đo góc, không đảm bảo quan hệ ngữ nghĩa nếu embeddings chưa được huấn luyện cho mục tiêu phù hợp.",
    ],
    fromScratchSteps: [
      "Chuẩn hóa Unicode theo chính sách NFC/NFKC đã ghi; không tự ý bỏ dấu tiếng Việt.",
      "Tách token baseline bằng regex và đếm tần suất trên train.",
      "Gán special tokens trước, lọc min frequency rồi xây token_to_id/id_to_token xác định.",
      "Encode/decode; pad batch, trả input_ids, attention_mask và lengths.",
      "Cài Embedding + masked mean classifier; kiểm tra thêm PAD không đổi pooled vector.",
    ],
    whenToUse: [
      "Mọi pipeline NLP trước encoder/LM",
      "Baseline nhỏ cần tokenizer/vocabulary tự kiểm soát",
      "Dữ liệu chuyên ngành cần đo OOV và độ dài trước khi chọn pretrained tokenizer",
    ],
    failureModes: [
      "Fit vocabulary trên toàn dataset gây leakage nhẹ nhưng thật",
      "lowercase/xóa dấu làm mất tín hiệu tiếng Việt hoặc tên riêng",
      "Tokenizer và checkpoint khác nhau làm id không còn đúng embedding",
      "Mean pooling tính cả PAD khiến câu ngắn bị pha loãng",
      "Cắt truncation ở đầu/cuối mà không xem thông tin quan trọng nằm đâu",
    ],
    complexity: [
      "Xây word vocabulary: $O(T)$ với T tokens và bộ nhớ $O(V)$.",
      "Embedding lookup batch: $O(BLd)$ thời gian/output memory; tham số $Vd$.",
      "Vocabulary lớn tăng model/checkpoint; vocabulary nhỏ tăng L và chi phí attention $O(L^2)$.",
    ],
    miniQuiz: [
      {
        question: "Vì sao subword tokenizer thường xử lý từ mới tốt hơn word-level tokenizer?",
        expectedAnswer: "Từ mới có thể tách thành các mảnh đã biết thay vì toàn bộ thành UNK; đổi lại chuỗi có thể dài hơn.",
        misconceptionToCatch: "Cho rằng subword không bao giờ có unknown hoặc luôn tách đúng hình vị.",
      },
      {
        question: "Tại sao PAD phải có mask khi mean pooling?",
        expectedAnswer: "PAD không mang nội dung; tính vào trung bình làm vector phụ thuộc số padding/batch thay vì câu.",
        misconceptionToCatch: "Cho rằng embedding PAD bằng 0 luôn đủ trong mọi layer vì bias/attention có thể làm nó khác 0.",
      },
    ],
    codingChallenge: {
      task: "Tự viết vocabulary, encode/decode và collate_fn tạo padded ids + mask cho câu Unicode tiếng Việt.",
      durationMinutes: 55,
      starterSignature: "def build_vocab(train_texts, min_freq=2): ...\ndef collate_texts(texts, vocab, max_length=None): ...",
      requirements: [
        "Không dùng tokenizer library",
        "Thứ tự id xác định khi tần suất bằng nhau",
        "Không sửa nội dung train_texts và không nhìn validation/test",
      ],
      acceptanceCriteria: [
        "Encode/decode giữ token đã biết và thay đúng UNK",
        "Mask đúng cho batch gồm câu rỗng/câu dài ngắn khác nhau",
        "Masked mean bất biến khi thêm PAD bên phải",
      ],
      aiBoundary: SELF_CODE_POLICY,
    },
    hiddenTestIdeas: [
      "Chuỗi rỗng và chỉ có khoảng trắng",
      "Ký tự tiếng Việt dạng combining marks",
      "Hai token cùng frequency để kiểm tra tie-break",
      "max_length ngắn hơn BOS+EOS",
      "Câu chứa literal <pad> không được nhầm special token nếu policy escape khác",
    ],
    projectConnection:
      "Tạo lớp dữ liệu chung cho classifier, BERT và encoder–decoder; notebook phải lưu tokenizer/vocabulary cùng checkpoint để inference trên web không lệch id.",
  },
  {
    id: "nlp-02-text-classification",
    title: "Phân loại văn bản: baseline sparse đến neural encoder",
    domain: "NLP",
    officialCategory: "Practice — IOAI 2026 / NLP / Text Classification",
    prerequisites: [
      "nlp-01-tokenization-embeddings",
      "Logistic regression, cross-entropy và regularization",
      "Precision, recall, macro/micro-F1 và confusion matrix",
    ],
    outcomes: [
      "Xây baseline TF–IDF + linear trước mô hình sâu",
      "Cài neural classifier masked pooling và training loop",
      "Chọn metric/ngưỡng cho multiclass hoặc multilabel",
      "Phân tích leakage, spurious cues, label noise và lỗi theo độ dài",
    ],
    intuition:
      "Phân loại text có thể rất mạnh với tín hiệu từ/cụm từ: TF–IDF + linear là baseline khó bỏ qua. Encoder neural hữu ích khi cần ngữ cảnh, word order hoặc transfer. Multiclass chọn một lớp bằng softmax; multilabel cho từng lớp một sigmoid độc lập. Không được suy mục tiêu chỉ từ shape nhãn.",
    math: [
      "TF–IDF thường $tf(t,d)\\log((N+1)/(df(t)+1))+1$; convention cụ thể phải thống nhất train/inference.",
      "Multiclass CE dùng một target; multilabel BCE: $-\\sum_k[y_k\\log p_k+(1-y_k)\\log(1-p_k)]$.",
      "Macro-F1 trung bình F1 từng lớp; threshold multilabel được chọn trên validation, không test.",
      "Class weights thay đổi objective; không tự động làm probability calibrated.",
    ],
    fromScratchSteps: [
      "Xác định unit split (người dùng, bài báo, thread) để tránh near-duplicate leakage.",
      "Cài count vectorizer/TF–IDF nhỏ và logistic/linear baseline.",
      "Tạo embedding + masked mean/1D CNN model và vòng train/eval.",
      "So sánh macro-F1, confusion matrix, calibration và thời gian.",
      "Đọc false positives/negatives sau khi ẩn thông tin nhạy cảm; đề xuất đúng một thay đổi mỗi thí nghiệm.",
    ],
    whenToUse: [
      "Spam/sentiment/chủ đề/ý định hoặc gắn nhiều nhãn tài liệu",
      "Cần routing trước mô hình sinh/API đắt hơn",
      "Cần baseline đo giá trị của encoder pretrained",
    ],
    failureModes: [
      "Random split làm cùng tác giả/thread xuất hiện cả train và test",
      "Dùng softmax cho multilabel hoặc sigmoid cho multiclass mà không hiểu loss",
      "Tối ưu accuracy trên dữ liệu lệch lớp",
      "Vocabulary chứa thông tin test hoặc preprocessing khác lúc deploy",
      "Model học chữ ký/URL/source thay vì nội dung thật",
    ],
    complexity: [
      "Sparse linear inference gần $O(nnz(x)K)$; thường rất nhanh và bộ nhớ thấp.",
      "Mean-embedding model $O(BLd+BdK)$; Transformer tăng attention lên $O(BL^2d)$.",
      "Multilabel output/metric tỷ lệ với K; threshold search ngây thơ tăng theo số ứng viên × K × N.",
    ],
    miniQuiz: [
      {
        question: "Một văn bản có thể đồng thời là ‘thể thao’ và ‘tin địa phương’; dùng softmax hay sigmoid?",
        expectedAnswer: "Sigmoid độc lập cho từng nhãn với BCE/multilabel objective.",
        misconceptionToCatch: "Dùng softmax vì mọi bài classification đều softmax.",
      },
      {
        question: "Vì sao TF–IDF + linear vẫn cần dù sẽ fine-tune BERT?",
        expectedAnswer: "Baseline nhanh phát hiện lỗi split/label, định lượng lợi ích model phức tạp và đôi khi đã đủ tốt.",
        misconceptionToCatch: "Cho rằng baseline cổ điển không có giá trị nếu model mới hơn tồn tại.",
      },
    ],
    codingChallenge: {
      task: "Cài TF–IDF transformer chỉ fit trên train và multiclass linear classifier gradient descent; không dùng sklearn cho phần thuật toán.",
      durationMinutes: 60,
      starterSignature: "class TfidfVectorizerScratch: ...\ndef train_softmax_regression(x_train, y_train, ...): ...",
      requirements: [
        "Sparse representation tự chọn nhưng không tạo one-hot token 3D",
        "Softmax ổn định số và L2 không regularize bias nếu đã chọn convention đó",
        "Lưu vocabulary, idf, weights và label mapping",
      ],
      acceptanceCriteria: [
        "IDF không đổi khi transform validation",
        "Loss giảm trên dataset đồ chơi tách tuyến tính",
        "Predictions/metrics khớp ví dụ tính tay và xử lý lớp vắng trong batch",
      ],
      aiBoundary: SELF_CODE_POLICY,
    },
    hiddenTestIdeas: [
      "Validation chứa toàn token mới",
      "Một document lặp một token nhiều lần",
      "Nhãn string không sort sẵn",
      "Logits cỡ ±1000",
      "Một lớp không được dự đoán để kiểm tra zero_division policy",
    ],
    projectConnection:
      "Dùng làm bộ lọc chủ đề/ý định cho trợ lý học tập; giữ baseline sparse bên cạnh BERT để có fallback nhanh và giải thích top-weight features.",
  },
  {
    id: "nlp-03-bert",
    title: "BERT: masked-language pretraining và fine-tune encoder",
    domain: "NLP",
    officialCategory: "Both — IOAI 2026 / Pre-trained Text Encoders (e.g. BERT)",
    prerequisites: [
      "nlp-01-tokenization-embeddings",
      "Self-attention, multi-head attention, residual và LayerNorm",
      "Transfer learning và cross-entropy",
    ],
    outcomes: [
      "Giải thích bidirectional context và masked language modeling",
      "Phân biệt input ids, attention mask, token type ids và special tokens theo model card",
      "Fine-tune encoder cho classification hoặc trích embedding có pooling rõ",
      "Nhận biết truncation, subword alignment và domain/language mismatch",
    ],
    intuition:
      "BERT che một số token rồi dùng cả ngữ cảnh trái lẫn phải để đoán chúng, nhờ đó học encoder giàu ngữ nghĩa. Fine-tuning gắn head nhỏ và cập nhật toàn bộ hoặc một phần model. `[CLS]` không tự động là sentence embedding tốt cho mọi checkpoint; phải xem mục tiêu pretraining/model card hoặc dùng pooling đã được đánh giá.",
    math: [
      "MLM loss chỉ tính trên vị trí được chọn: $L=-\\sum_{t\\in M}\\log p(x_t|x_{\\setminus M})$.",
      "Attention mask cộng số âm rất lớn vào logits của key PAD trước softmax.",
      "Self-attention một layer theo sequence length L tốn $O(L^2d+Ld^2)$.",
      "Fine-tune classification thường $z=W h_{CLS}+b$, nhưng pooling là quyết định mô hình cần kiểm chứng.",
    ],
    fromScratchSteps: [
      "Tự tạo ví dụ MLM nhỏ: tokenize, chọn mask positions và labels -100 cho vị trí không tính loss.",
      "Vẽ attention mask/batch padding và kiểm tra PAD không được attend như key.",
      "Nạp tokenizer/checkpoint cùng tên và đọc model card về ngôn ngữ/preprocess/license.",
      "Fine-tune với baseline LR nhỏ, gradient clipping và validation checkpoint.",
      "Phân tích lỗi theo độ dài, token bị cắt, từ hiếm và nhóm ngôn ngữ.",
    ],
    whenToUse: [
      "Phân loại, NER, QA extractive hoặc embedding cần ngữ cảnh hai chiều",
      "Có checkpoint phù hợp ngôn ngữ/miền",
      "Không cần sinh tự hồi quy token-by-token làm nhiệm vụ chính",
    ],
    failureModes: [
      "Tokenizer/checkpoint mismatch",
      "Quên attention mask hoặc padding_side không phù hợp",
      "Cắt câu mất đoạn chứa nhãn nhưng không đo truncation rate",
      "LR cao gây catastrophic forgetting trên dataset nhỏ",
      "Dùng raw CLS cosine như semantic similarity mà không benchmark",
    ],
    complexity: [
      "Attention memory $O(BL^2)$; padding batch theo câu dài nhất gây lãng phí nên dynamic batching hữu ích.",
      "Fine-tune lưu activation/optimizer states; freeze/PEFT giảm phần trainable nhưng forward vẫn chạy backbone.",
      "Inference encoder xử lý song song tokens, nhanh hơn autoregressive generation cho classification cùng độ dài.",
    ],
    miniQuiz: [
      {
        question: "Vì sao BERT không phải causal language model chuẩn?",
        expectedAnswer: "Encoder nhìn ngữ cảnh hai phía trong MLM; causal LM chỉ được nhìn token bên trái khi dự đoán token tiếp.",
        misconceptionToCatch: "Cho rằng mọi Transformer đều dùng cùng attention mask.",
      },
      {
        question: "Labels MLM ở token không bị chọn thường đặt -100 trong PyTorch để làm gì?",
        expectedAnswer: "CrossEntropyLoss ignore_index=-100 bỏ các vị trí đó khỏi loss.",
        misconceptionToCatch: "Cho rằng -100 là một token id đặc biệt của vocabulary.",
      },
    ],
    codingChallenge: {
      task: "Viết dynamic masking collator và một encoder block tối giản; sau đó fine-tune checkpoint BERT chính thức trên dataset đồ chơi.",
      durationMinutes: 60,
      starterSignature: "def mask_tokens(input_ids, special_mask, vocab_size, rng, mlm_probability=0.15): ...",
      requirements: [
        "Không mask PAD/special tokens",
        "Trả labels chỉ tính loss tại vị trí đã chọn",
        "Randomness nhận generator để test tái lập",
      ],
      acceptanceCriteria: [
        "Tỉ lệ mask gần cấu hình trên mẫu đủ lớn và không vi phạm special mask",
        "Cùng seed cho output giống nhau",
        "Loss chỉ thay đổi khi logits tại vị trí selected thay đổi",
      ],
      aiBoundary: SELF_CODE_POLICY,
    },
    hiddenTestIdeas: [
      "Sequence chỉ gồm special/PAD",
      "mlm_probability 0 và 1",
      "Vocabulary rất nhỏ nhưng special ids phải tránh",
      "Batch có padding trái",
      "Kiểm tra input tensor không bị mutate nếu hợp đồng nói không",
    ],
    projectConnection:
      "Encoder cho phân loại câu hỏi, tìm kiếm tài liệu và đánh giá câu trả lời; lưu model card, max length và tokenizer revision cùng artifact.",
  },
  {
    id: "nlp-04-language-modeling",
    title: "Language modeling tự hồi quy: xác suất chuỗi và sinh token",
    domain: "NLP",
    officialCategory: "Both — IOAI 2026 / Language Modeling",
    prerequisites: [
      "nlp-01-tokenization-embeddings",
      "Causal self-attention và Transformer decoder block",
      "Cross-entropy, sampling và logarithm",
    ],
    outcomes: [
      "Factorize xác suất chuỗi theo quy tắc dây chuyền",
      "Tạo shifted labels và causal mask không rò token tương lai",
      "Tính token-average NLL/perplexity với padding mask",
      "Cài greedy, temperature, top-k/top-p và nêu trade-off",
    ],
    intuition:
      "Causal LM dự đoán token kế tiếp từ prefix. Trong train, toàn chuỗi chạy song song nhưng causal mask che tương lai; label chỉ là input dịch một vị trí. Khi sinh, token mới lại trở thành input nên lỗi tích lũy và decoding policy ảnh hưởng mạnh output. Perplexity đo mức bất ngờ theo tokenizer/dataset cụ thể, không so trực tiếp giữa tokenizer khác nhau một cách ngây thơ.",
    math: [
      "$p(x_{1:T})=\\prod_{t=1}^T p(x_t|x_{<t})$, NLL $=-\\sum_t\\log p(x_t|x_{<t})$.",
      "$PPL=\\exp(\\text{tổng NLL}/\\text{số token hợp lệ})$.",
      "Temperature: softmax$(z/T)$; T→0 gần argmax, T cao làm phân phối phẳng hơn.",
      "Top-p giữ tập nhỏ nhất có cumulative probability ≥p rồi chuẩn hóa lại.",
    ],
    fromScratchSteps: [
      "Tạo corpus ký tự nhỏ, BOS/EOS và batch các đoạn cố định.",
      "Tạo input=x[:-1], labels=x[1:] và causal mask tam giác.",
      "Cài bigram LM trước để kiểm tra loss/perplexity.",
      "Cài một causal Transformer nhỏ, overfit một đoạn ngắn như sanity test.",
      "Viết sampler nhận generator, temperature/top-k/top-p và stop tại EOS/max tokens.",
    ],
    whenToUse: [
      "Sinh văn bản/code hoặc scoring xác suất prefix→continuation",
      "Pretraining tổng quát cần chuyển sang instruction/task adaptation",
      "Không cần encode hai phía tại cùng vị trí như BERT",
    ],
    failureModes: [
      "Không causal-mask khiến train loss rất đẹp do nhìn đáp án tương lai",
      "Shift labels sai một vị trí hoặc tính loss trên PAD",
      "Perplexity trung bình theo batch thay vì tổng token gây bias",
      "Top-p implement trên logits chưa softmax/sort đúng",
      "Sinh không giới hạn EOS/max length hoặc lặp do decoding không phù hợp",
    ],
    complexity: [
      "Train self-attention $O(BL^2d)$; generation không cache có thể lặp lại toàn prefix mỗi token.",
      "KV cache giảm compute lặp nhưng bộ nhớ tăng xấp xỉ tuyến tính theo layers × sequence × hidden.",
      "Full softmax output tốn $O(BLVd)$/projection theo vocabulary V; weight tying giảm tham số.",
    ],
    miniQuiz: [
      {
        question: "Tại sao train có thể dự đoán mọi vị trí song song dù generation tuần tự?",
        expectedAnswer: "Labels toàn chuỗi đã biết và causal mask bảo đảm mỗi vị trí chỉ dùng prefix; inference chưa biết token tương lai nên phải lặp.",
        misconceptionToCatch: "Cho rằng train được phép nhìn token tương lai vì teacher forcing.",
      },
      {
        question: "Perplexity 10 có nghĩa gì gần đúng?",
        expectedAnswer: "Model có độ bất ngờ tương đương chọn giữa khoảng 10 khả năng ở mỗi token theo trung bình hình học; chỉ diễn giải trong cùng tokenizer/distribution.",
        misconceptionToCatch: "Nói model đúng 1/10 token hoặc có 10 token vocabulary.",
      },
    ],
    codingChallenge: {
      task: "Cài causal mask, shifted LM loss và sampler top-k/top-p xác định theo seed cho logits giả.",
      durationMinutes: 60,
      starterSignature: "def causal_lm_loss(logits, input_ids, pad_id): ...\ndef sample_next(logits, temperature=1.0, top_k=None, top_p=None, generator=None): ...",
      requirements: [
        "Không dùng generate() của thư viện",
        "Ổn định với logits lớn và xử lý temperature=0 như greedy theo giao diện đã ghi",
        "Không tính label ngoài chiều dài hợp lệ",
      ],
      acceptanceCriteria: [
        "Loss/perplexity khớp phép tính tay trên batch nhỏ",
        "Causal mask chặn gradient từ output t về input token >t trong model test",
        "Sampling chỉ chọn token trong tập sau lọc và tái lập theo seed",
      ],
      aiBoundary: SELF_CODE_POLICY,
    },
    hiddenTestIdeas: [
      "Sequence chiều dài 1 không có target hợp lệ",
      "Tất cả labels PAD",
      "top_k=1 tương đương greedy",
      "top_p rất nhỏ vẫn giữ ít nhất một token",
      "Logits bằng nhau để kiểm tra tie/reproducibility",
    ],
    projectConnection:
      "Cơ sở cho trợ lý sinh phản hồi; dự án phải tách LM quality khỏi factuality/safety và không dùng perplexity như bằng chứng câu trả lời đúng.",
  },
  {
    id: "nlp-05-encoder-decoder",
    title: "Encoder–decoder: dịch máy, tóm tắt và vision-language",
    domain: "NLP",
    officialCategory: "Practice — IOAI 2026 / Encoder-Decoder Models",
    prerequisites: [
      "nlp-03-bert",
      "nlp-04-language-modeling",
      "Cross-attention, teacher forcing và sequence masks",
    ],
    outcomes: [
      "Phân biệt self-attention encoder, causal self-attention decoder và cross-attention",
      "Chuẩn bị source/target, shifted decoder inputs và ba loại mask",
      "Cài greedy/beam search tối giản với EOS và length normalization",
      "Đánh giá generation bằng metric tự động cộng error analysis",
    ],
    intuition:
      "Encoder đọc toàn bộ nguồn thành memory; decoder tạo đích từng token, vừa nhìn prefix đích vừa attention tới memory nguồn. Teacher forcing cho decoder token đích thật ở bước trước khi train, nhưng inference nhận token do chính nó sinh, tạo exposure bias. Với vision-language, encoder memory có thể là patch/image features thay vì text.",
    math: [
      "$p(y|x)=\\prod_t p(y_t|y_{<t},Enc(x))$.",
      "Cross-attention dùng $Q$ từ decoder, $K,V$ từ encoder memory.",
      "Beam score thường chuẩn hóa độ dài, ví dụ $s(y)/((5+|y|)/6)^\\alpha$; convention phải ghi rõ.",
      "BLEU dựa n-gram precision/brevity penalty; ROUGE thiên overlap recall; không đo đầy đủ đúng nghĩa/sự thật.",
    ],
    fromScratchSteps: [
      "Tạo bài toy đảo chuỗi/biến đổi số để biết đáp án exact.",
      "Xây source padding mask, target causal mask và target padding mask.",
      "Shift target: decoder input bắt đầu BOS, labels kết thúc EOS.",
      "Overfit tập toy; cài greedy decode trước beam.",
      "Viết beam search giữ state/score/EOS đúng, rồi đánh giá exact match và lỗi cụ thể.",
    ],
    whenToUse: [
      "Mapping sequence-to-sequence như dịch, tóm tắt, sửa lỗi hoặc captioning",
      "Đầu vào cần encoder hai chiều riêng",
      "Muốn condition decoder trên image/audio/text embeddings",
    ],
    failureModes: [
      "Target shift sai hoặc EOS/BOS trùng vai trò",
      "Decoder nhìn token tương lai do thiếu causal mask",
      "Cross-attention mask ngược True/False theo API",
      "Beam search ưu tiên câu ngắn vì cộng log-prob không chuẩn hóa",
      "Metric overlap cao nhưng hallucination/sai số quan trọng không được bắt",
    ],
    complexity: [
      "Encoder self-attention $O(S^2d)$; decoder self-attention $O(T^2d)$; cross-attention $O(STd)$.",
      "Beam width b tăng gần tuyến tính compute/memory decoder và KV cache theo b.",
      "Teacher-forced train song song target; inference vẫn tuần tự T bước.",
    ],
    miniQuiz: [
      {
        question: "Trong cross-attention, Q/K/V đến từ đâu?",
        expectedAnswer: "Q từ trạng thái decoder; K và V từ encoder memory.",
        misconceptionToCatch: "Cho rằng cả ba luôn cùng một tensor như self-attention.",
      },
      {
        question: "Vì sao BLEU cao chưa đủ chứng minh bản dịch đúng?",
        expectedAnswer: "BLEU đo overlap n-gram với reference hạn chế; có nhiều bản dịch đúng khác chữ và câu overlap cao vẫn có thể sai nghĩa quan trọng.",
        misconceptionToCatch: "Đồng nhất metric tự động với đánh giá ngữ nghĩa hoàn chỉnh.",
      },
    ],
    codingChallenge: {
      task: "Viết batch preparation và greedy decoder cho Transformer encoder–decoder toy; không dùng model.generate.",
      durationMinutes: 60,
      starterSignature: "def prepare_seq2seq_batch(src, tgt, pad_id, bos_id, eos_id): ...\ndef greedy_decode(model, src, max_new_tokens, ...): ...",
      requirements: [
        "Mask semantics được test và ghi rõ",
        "Dừng riêng từng sample khi EOS, phần còn lại không sinh token nội dung",
        "Không dùng target thật ở inference",
      ],
      acceptanceCriteria: [
        "Shifted decoder inputs/labels đúng trên ví dụ tính tay",
        "Greedy output khớp state-machine model giả",
        "Không vượt max_new_tokens nếu không có EOS",
      ],
      aiBoundary: SELF_CODE_POLICY,
    },
    hiddenTestIdeas: [
      "Một sample EOS ngay bước đầu, sample khác chạy dài",
      "Source có padding trái và phải theo config",
      "Target rỗng ngoài BOS/EOS",
      "Model luôn trả cùng token không EOS",
      "Kiểm tra decoder không được truyền labels lúc inference",
    ],
    projectConnection:
      "Kiến trúc nền cho dịch/tóm tắt tài liệu học và caption ảnh; web phải hiển thị nguồn, output và lỗi theo mẫu, không chỉ một score trung bình.",
  },
  {
    id: "nlp-06-pretrained-and-api",
    title: "Mô hình ngôn ngữ tiền huấn luyện: local, fine-tune, PEFT và API",
    domain: "NLP",
    officialCategory: "Practice — IOAI 2026 / Pre-trained Language Models (open-source and API-based)",
    prerequisites: [
      "nlp-04-language-modeling",
      "nlp-05-encoder-decoder",
      "HTTP/JSON, secret management và evaluation dataset",
    ],
    outcomes: [
      "Chọn model theo task, license, ngôn ngữ, context, hardware và dữ liệu",
      "Dùng tokenizer/chat template/model revision đúng model card",
      "Phân biệt prompting, full fine-tune, PEFT/LoRA và retrieval grounding",
      "Thiết kế wrapper API có timeout/retry/rate-limit/caching và đánh giá tái lập",
    ],
    intuition:
      "Pretrained model là thành phần có hợp đồng: input template, tokenizer, version, giới hạn context, output không đảm bảo. Local/open-weight cho kiểm soát và thí nghiệm nhưng cần tài nguyên/license; API giảm vận hành nhưng có chi phí, thay đổi phiên bản và dữ liệu rời hệ thống. Không chọn bằng demo; tạo bộ eval đại diện, baseline, tiêu chí đúng/sai và theo dõi latency/cost.",
    math: [
      "LoRA xấp xỉ cập nhật $\\Delta W=BA$ với rank r nhỏ hơn nhiều min(d,k); tham số trainable khoảng $r(d+k)$ thay vì $dk$ cho ma trận đó.",
      "Chi phí API ước tính từ input/output tokens × đơn giá tại thời điểm chạy; đơn giá là dữ liệu động, không hard-code vào giáo trình.",
      "Pass@k và majority/self-consistency thay đổi số lần gọi; phải báo ngân sách và không dùng test để chọn prompt.",
      "Structured output cần validate schema; xác suất model sinh JSON nhìn hợp lệ không bằng tính đúng nội dung.",
    ],
    fromScratchSteps: [
      "Viết task contract: input, output schema, metric, lỗi nghiêm trọng và 30–100 eval cases giữ kín.",
      "Chạy baseline deterministic; pin model/revision/tokenizer/prompt/template/seed nếu API hỗ trợ.",
      "Cài adapter thống nhất local/API, timeout, exponential backoff có jitter và giới hạn retry.",
      "Validate output schema rồi score nội dung; lưu hash prompt/model metadata, không log secret/PII.",
      "So prompting với retrieval/PEFT trên cùng eval và báo quality–latency–cost–privacy.",
    ],
    whenToUse: [
      "Bài toán cần tri thức/ngôn ngữ tổng quát và dữ liệu gán nhãn ít",
      "Cần prototype nhanh trước model chuyên biệt",
      "Có chính sách dữ liệu và tiêu chí đánh giá đủ rõ",
    ],
    failureModes: [
      "Đưa API key vào frontend/repo/notebook công khai",
      "Không pin revision/model alias thay đổi làm kết quả trôi",
      "Retry mọi lỗi kể cả 4xx/invalid request gây tốn tiền",
      "Dùng prompt chứa đáp án test hoặc tối ưu lặp trực tiếp trên test",
      "Tin output trôi chảy là đúng, bỏ schema/source/factual checks",
      "Dùng open-weight mà không đọc license/model card/acceptable use",
    ],
    complexity: [
      "Local inference bị giới hạn bởi tham số, KV cache và bandwidth; quantization giảm memory nhưng cần kiểm chứng chất lượng.",
      "API latency gồm mạng, queue và generation; output dài thường làm latency/cost tăng.",
      "PEFT giảm trainable/optimizer memory nhưng base model và activations vẫn chiếm phần lớn VRAM.",
    ],
    miniQuiz: [
      {
        question: "Vì sao không đặt API key trong biến JavaScript NEXT_PUBLIC_*?",
        expectedAnswer: "Biến public được bundle/gửi tới trình duyệt, người dùng có thể lấy key; lời gọi bí mật phải ở server và key trong secret store.",
        misconceptionToCatch: "Cho rằng obfuscation hoặc .env tự động giữ bí mật ở client.",
      },
      {
        question: "LoRA có nghĩa là không cần tải/chạy base model không?",
        expectedAnswer: "Không; LoRA chỉ thêm cập nhật hạng thấp, vẫn cần base model để forward/inference.",
        misconceptionToCatch: "Đồng nhất số tham số trainable thấp với tổng memory bằng adapter.",
      },
    ],
    codingChallenge: {
      task: "Viết ModelAdapter thống nhất mock local/API, có schema validation, timeout, retry phân loại lỗi và cache theo hash của toàn request config.",
      durationMinutes: 60,
      starterSignature: "class ModelAdapter:\n    def generate(self, request, *, timeout_s, max_retries): ...",
      requirements: [
        "Không gọi dịch vụ thật trong test; dùng fake transport",
        "Không retry validation/4xx cố định; tôn trọng Retry-After khi có",
        "Cache key gồm model revision, prompt/template, params và input nhưng log phải redact dữ liệu nhạy cảm",
      ],
      acceptanceCriteria: [
        "Fake 429→200 retry đúng số lần; fake 400 dừng ngay",
        "Output sai schema bị từ chối dù là JSON hợp lệ",
        "Cùng request cache hit, khác temperature/model revision cache miss",
      ],
      aiBoundary: SELF_CODE_POLICY,
    },
    hiddenTestIdeas: [
      "Timeout rồi success",
      "Retry-After quá dài phải bị giới hạn theo policy",
      "JSON có field thừa/thiếu/sai type",
      "API key xuất hiện trong exception không được log",
      "Hai dict cùng nghĩa nhưng thứ tự key khác phải có canonical cache key",
    ],
    projectConnection:
      "Tạo lớp tích hợp an toàn cho trợ lý học tập/giám khảo phản hồi. AI chỉ kiểm tra nhận xét sau khi học sinh tự làm; hệ thống không gửi đáp án, không tự chấm đúng chỉ dựa vào lời model.",
  },
  {
    id: "audio-01-waveform-sampling",
    title: "Âm thanh số: waveform, sampling, frame và resampling",
    domain: "Audio",
    officialCategory: "Nền bổ trợ — IOAI 2026 nêu Audio Processing nhưng không tách waveform thành dòng riêng",
    prerequisites: [
      "Hàm sin/cos, tần số, biên độ và pha ở mức phổ thông",
      "Mảng NumPy 1D/2D, dtype số nguyên và số thực",
      "Khái niệm train/validation/test split theo group",
    ],
    outcomes: [
      "Đọc waveform đúng sample rate/channel/dtype và chuẩn hóa PCM an toàn",
      "Giải thích Nyquist, aliasing, clipping và quantization",
      "Chia frame có padding/mask và resample bằng low-pass trước downsample",
      "Thiết kế split theo người nói/bản ghi để tránh leakage",
    ],
    intuition:
      "Waveform là các mẫu biên độ theo thời gian. Sample rate cho biết mỗi giây có bao nhiêu mẫu; nó không phải số bit hay độ lớn âm. Nếu lấy mẫu quá thưa, tần số cao giả thành tần số thấp (aliasing). Resampling không phải bỏ cách quãng đơn giản: cần lọc phần tần số vượt Nyquist mới. Stereo là nhiều channel đồng bộ, không phải chiều batch.",
    math: [
      "Nyquist: tín hiệu band-limited tới $f_{max}$ cần $f_s>2f_{max}$ để khôi phục lý tưởng.",
      "Thời lượng $T=N/f_s$; frame length samples $L=round(f_s\\,t_{frame})$ và hop $H=round(f_s\\,t_{hop})$.",
      "dBFS biên độ tương đối: $20\\log_{10}(|x|/x_{ref})$; năng lượng/công suất dùng hệ số 10.",
      "PCM signed b-bit thường map về khoảng gần [-1,1); phải tránh overflow khi lấy abs giá trị nhỏ nhất integer.",
    ],
    fromScratchSteps: [
      "Sinh hai sóng sin dưới/trên Nyquist, lấy mẫu và quan sát alias bằng FFT.",
      "Đọc metadata trước samples; chuyển int PCM sang float32 bằng scale đúng dtype.",
      "Trộn mono theo policy rõ, không tự cộng hai channel gây clipping.",
      "Cài framing bằng index/stride, trả frames và valid-length mask.",
      "So resampling naïve với resampler polyphase/thư viện chuẩn trên tone cao.",
    ],
    whenToUse: [
      "Bất kỳ pipeline speech/audio trước feature hoặc pretrained processor",
      "Cần chuẩn hóa input từ file/thiết bị có sample rate khác nhau",
      "Cần debug lỗi tốc độ/phát âm/shape trước khi đổ lỗi cho model",
    ],
    failureModes: [
      "Đọc int16 rồi chia sai scale hoặc abs(-32768) overflow",
      "Model mong 16 kHz nhưng truyền 44.1 kHz mà không resample",
      "Downsample bằng x[::k] gây aliasing",
      "Chia ngẫu nhiên các đoạn cùng người nói/file vào nhiều split",
      "Pad silence nhưng không mask khiến metric/model phụ thuộc độ dài padding",
    ],
    complexity: [
      "Đọc/framing tuyến tính $O(N)$ theo số samples; view strided có thể $O(1)$ bộ nhớ nhưng cần tránh sửa alias.",
      "Resampling FIR gần $O(NK)$ trực tiếp; polyphase tránh nhiều phép tính không cần.",
      "Lưu float32 dùng 4 bytes/sample/channel: audio dài dễ lớn hơn feature nén nhưng nhỏ hơn nhiều activation model.",
    ],
    miniQuiz: [
      {
        question: "Tín hiệu 10 kHz lấy mẫu ở 16 kHz có vi phạm Nyquist không?",
        expectedAnswer: "Có; Nyquist là 8 kHz nên thành phần 10 kHz sẽ alias nếu không lọc trước lấy mẫu/downsample.",
        misconceptionToCatch: "So 10 < 16 rồi kết luận hợp lệ.",
      },
      {
        question: "Tại sao không thể đổi 48 kHz xuống 16 kHz chỉ bằng lấy mỗi mẫu thứ ba?",
        expectedAnswer: "Cần low-pass bỏ thành phần >8 kHz trước; nếu không chúng gập xuống dải nghe được.",
        misconceptionToCatch: "Cho rằng index spacing là toàn bộ resampling.",
      },
    ],
    codingChallenge: {
      task: "Cài normalize_pcm và frame_audio có valid mask; tạo thí nghiệm aliasing khi decimate 48→16 kHz.",
      durationMinutes: 50,
      starterSignature: "def normalize_pcm(x): ...\ndef frame_audio(x, frame_length, hop_length, pad_end=True): ...",
      requirements: [
        "Hỗ trợ int16, int32, float32/64 với policy clipping ghi rõ",
        "Không dùng librosa framing",
        "Không sửa input và xử lý waveform rỗng",
      ],
      acceptanceCriteria: [
        "Giá trị biên integer map đúng và không overflow",
        "Frames/mask đúng ví dụ tính tay kể cả frame cuối",
        "Biểu đồ/ước lượng FFT chỉ ra alias của decimation naïve",
      ],
      aiBoundary: SELF_CODE_POLICY,
    },
    hiddenTestIdeas: [
      "int16 chứa -32768",
      "Audio ngắn hơn một frame",
      "hop lớn hơn frame",
      "Stereo (N,2) phải báo hoặc xử lý theo contract rõ",
      "pad_end=False và không frame hoàn chỉnh",
    ],
    projectConnection:
      "Là lớp nhập dữ liệu cho nhận dạng giọng nói/phân loại âm thanh; metadata sample rate, channel và speaker group phải đi cùng sample đến tận evaluator.",
  },
  {
    id: "audio-02-stft",
    title: "STFT: nhìn phổ thay đổi theo thời gian",
    domain: "Audio",
    officialCategory: "Nền bổ trợ cần thiết cho các audio models IOAI 2026; không phải dòng syllabus độc lập",
    prerequisites: [
      "audio-01-waveform-sampling",
      "Số phức, DFT/FFT và cửa sổ Hann",
      "Framing, hop length và zero padding",
    ],
    outcomes: [
      "Cài STFT tối giản từ framing, window và rFFT",
      "Giải thích trade-off thời gian–tần số do window length/hop",
      "Phân biệt complex STFT, magnitude, power và phase",
      "Đối chiếu center/padding/normalization conventions giữa thư viện",
    ],
    intuition:
      "FFT toàn tín hiệu cho biết có tần số nào nhưng mất thời điểm. STFT cắt waveform thành cửa sổ chồng lặp rồi FFT từng frame, tạo ma trận thời gian–tần số. Cửa sổ dài phân biệt tần số tốt hơn nhưng làm mờ thay đổi nhanh; cửa sổ ngắn ngược lại. Phase chứa thông tin cần cho tái tạo, dù nhiều model chỉ dùng magnitude/log-mel.",
    math: [
      "$X[m,k]=\\sum_{n=0}^{L-1}x[n+mH]w[n]e^{-j2\\pi kn/N_{fft}}$.",
      "Frequency bin $f_k=k f_s/N_{fft}$; rFFT tín hiệu thực giữ $N_{fft}/2+1$ bins.",
      "Magnitude $|X|$, power $|X|^2$; dB power thường $10\\log_{10}(P/P_{ref})$.",
      "Độ phân giải bin $f_s/N_{fft}$ không đồng nghĩa khả năng phân giải thật nếu chỉ zero-pad window ngắn.",
    ],
    fromScratchSteps: [
      "Sinh tone đổi tần số giữa hai nửa và xác định kỳ vọng trên spectrogram.",
      "Frame waveform, nhân Hann window và zero-pad tới n_fft.",
      "Gọi rFFT cho từng frame; trả complex matrix cùng trục/time/frequency metadata.",
      "So magnitude/power và vẽ log-power có epsilon.",
      "So với torch.stft/librosa dưới cùng center/pad/window convention.",
    ],
    whenToUse: [
      "Cần feature time–frequency có thể diễn giải",
      "Đầu vào cho log-mel/MFCC/CNN audio hoặc phân tích nhiễu",
      "Cần phát hiện sự kiện/tần số thay đổi theo thời gian",
    ],
    failureModes: [
      "Nhầm trục frame×frequency với frequency×frame",
      "So thư viện khác mà không khớp center/padding/window normalization",
      "log(0) tạo -inf/NaN",
      "Dùng magnitude nhưng gọi là power/dB với hệ số sai",
      "Zero-padding lớn rồi tuyên bố tăng độ phân giải vật lý",
    ],
    complexity: [
      "Với M frames, FFT tốn $O(MN_{fft}\\log N_{fft})$.",
      "Complex STFT memory $O(M(N_{fft}/2+1))$, khoảng gấp đôi real cùng dtype.",
      "Hop nhỏ tăng số frames, độ mượt thời gian và compute/memory gần tỉ lệ nghịch H.",
    ],
    miniQuiz: [
      {
        question: "Tăng window length thường tác động resolution thế nào?",
        expectedAnswer: "Tần số tốt hơn nhưng thời gian kém hơn, nếu các yếu tố khác hợp lý.",
        misconceptionToCatch: "Cho rằng tăng window cải thiện cả hai miễn phí.",
      },
      {
        question: "Vì sao rFFT có n_fft/2+1 bins cho tín hiệu thực?",
        expectedAnswer: "Phổ âm/dương liên hợp nên nửa không âm đủ thông tin, gồm DC và Nyquist khi n_fft chẵn.",
        misconceptionToCatch: "Cho rằng nửa còn lại bị mất ngẫu nhiên nên không tái tạo được.",
      },
    ],
    codingChallenge: {
      task: "Tự viết stft_scratch bằng NumPy framing + window + rFFT và trả times/frequencies đúng đơn vị.",
      durationMinutes: 55,
      starterSignature: "def stft_scratch(x, sample_rate, n_fft, win_length, hop_length, center=False): ...",
      requirements: [
        "Không gọi scipy.signal.stft/librosa.stft",
        "Ghi rõ convention center/pad và window periodic/symmetric",
        "Giữ complex output, không tự bỏ phase",
      ],
      acceptanceCriteria: [
        "Khớp NumPy reference từng frame trong tolerance",
        "Peak bin của tone đúng trong một bin",
        "Shape/time stamps đúng cho audio ngắn và frame cuối theo policy",
      ],
      aiBoundary: SELF_CODE_POLICY,
    },
    hiddenTestIdeas: [
      "n_fft lớn hơn win_length",
      "win_length không bằng frame length nếu API cho phép",
      "Tone đúng Nyquist",
      "Tín hiệu all-zero không sinh NaN",
      "center=True với tín hiệu ngắn hơn pad width",
    ],
    projectConnection:
      "Dữ liệu cho web heatmap spectrogram có cursor phát audio; thông số feature phải được lưu để model HuBERT/Whisper hoặc classifier không nhận sai biểu diễn.",
  },
  {
    id: "audio-03-mel-spectrogram",
    title: "Mel filterbank và log-mel spectrogram",
    domain: "Audio",
    officialCategory: "Nền bổ trợ cần thiết cho Whisper/audio classification; không phải dòng IOAI 2026 độc lập",
    prerequisites: [
      "audio-02-stft",
      "Ma trận, nội suy tuyến tính và log/dB",
      "Giới hạn Nyquist và power spectrum",
    ],
    outcomes: [
      "Chuyển Hz↔Mel theo một convention nhất quán",
      "Tự tạo triangular Mel filterbank và áp lên power STFT",
      "Phân biệt Mel spectrogram, log-mel và MFCC",
      "Hiểu tham số n_mels/fmin/fmax/n_fft phải khớp checkpoint",
    ],
    intuition:
      "Tai người phân giải tần số không tuyến tính: chi tiết hơn ở vùng thấp, thô hơn ở vùng cao. Mel filterbank gộp các FFT bins bằng các tam giác có tâm cách đều trên thang Mel. Log nén dynamic range và gần với cảm nhận độ lớn. Đây là phép biến đổi mất thông tin; không thể suy phase hay khôi phục waveform hoàn hảo chỉ từ log-mel.",
    math: [
      "Một convention phổ biến: $m=2595\\log_{10}(1+f/700)$, $f=700(10^{m/2595}-1)$.",
      "Mel energy frame: $M_{t,b}=\\sum_k |X_{t,k}|^2F_{b,k}$.",
      "Log-mel: $\\log(M+\\epsilon)$ hoặc dB; base/reference/top_db là một phần của contract.",
      "Filterbank normalization Slaney/area vs peak=1 cho scale khác; không trộn conventions giữa train/inference.",
    ],
    fromScratchSteps: [
      "Chọn fmin/fmax hợp lệ trong [0, fs/2] và tạo n_mels+2 điểm đều trên Mel.",
      "Đổi về Hz rồi FFT-bin positions; dựng ramp trái/phải cho từng filter.",
      "Kiểm tra filter không âm, có shape n_mels×(n_fft/2+1) và phủ dải mong muốn.",
      "Nhân power spectrogram với transpose filterbank rồi log có floor epsilon.",
      "So với thư viện dưới đúng HTK/Slaney/norm/power/center settings.",
    ],
    whenToUse: [
      "Feature cho ASR, speaker/audio event classification và Whisper-like encoder",
      "Muốn giảm trục tần số và ưu tiên phân giải gần cảm nhận",
      "Cần visualization gọn hơn linear spectrogram",
    ],
    failureModes: [
      "fmax vượt Nyquist hoặc filters rỗng do n_mels quá nhiều so với n_fft",
      "Dùng magnitude thay power nhưng compare với reference power=2",
      "Trộn log tự nhiên, log10 và dB",
      "Khác Mel formula/norm với pretrained processor",
      "Per-sample normalization xóa thông tin mức âm quan trọng mà không chủ đích",
    ],
    complexity: [
      "Filterbank projection $O(MF B)$ với M frames, F FFT bins, B mel bins; ma trận thưa có thể tối ưu.",
      "Output memory $O(MB)$, thường nhỏ hơn STFT khi B≪F.",
      "Filterbank cố định cache theo sample_rate/n_fft/n_mels/fmin/fmax/convention.",
    ],
    miniQuiz: [
      {
        question: "Mel spectrogram có giữ phase không?",
        expectedAnswer: "Không; thường nó tổng hợp power/magnitude qua filterbank, phase đã bị bỏ.",
        misconceptionToCatch: "Cho rằng spectrogram nào cũng đủ để inverse chính xác.",
      },
      {
        question: "Vì sao không được đổi n_mels tùy ý khi dùng checkpoint pretrained?",
        expectedAnswer: "Kiến trúc/preprocessing đã học trên shape và convention cụ thể; đổi làm shape hoặc phân phối feature không khớp.",
        misconceptionToCatch: "Cho rằng mọi log-mel chỉ khác độ phân giải hiển thị.",
      },
    ],
    codingChallenge: {
      task: "Cài hz_to_mel/mel_to_hz, triangular filterbank và log_mel_spectrogram từ power STFT.",
      durationMinutes: 55,
      starterSignature: "def mel_filterbank(sample_rate, n_fft, n_mels, fmin=0.0, fmax=None): ...",
      requirements: [
        "Không dùng librosa/torchaudio mel functions",
        "Validate fmin<fmax≤Nyquist và không im lặng tạo filter rỗng",
        "Convention công thức/norm được ghi trong docstring",
      ],
      acceptanceCriteria: [
        "Hz→Mel→Hz round-trip trong tolerance",
        "Filterbank đạt peak/area theo convention đã chọn",
        "Log-mel hữu hạn với silence và peak đúng vùng cho tone test",
      ],
      aiBoundary: SELF_CODE_POLICY,
    },
    hiddenTestIdeas: [
      "sample rate lẻ và n_fft lẻ",
      "fmin >0",
      "n_mels quá lớn tạo bins trùng",
      "Silence all-zero",
      "Power matrix có giá trị âm nhỏ do sai số phải reject/clip theo contract",
    ],
    projectConnection:
      "Feature đầu vào cho classifier/ASR và panel trực quan Mel; notebook lưu toàn bộ feature config cùng model, không chỉ n_mels.",
  },
  {
    id: "audio-04-mfcc",
    title: "MFCC: decorrelate log-mel cho đặc trưng phổ gọn",
    domain: "Audio",
    officialCategory: "Nền bổ trợ cổ điển cho Audio Processing; không phải dòng IOAI 2026 độc lập",
    prerequisites: [
      "audio-03-mel-spectrogram",
      "DCT, log-energy và normalization theo utterance/dataset",
      "Khái niệm spectral envelope",
    ],
    outcomes: [
      "Cài MFCC từ log-mel bằng DCT-II",
      "Giải thích số coefficient thấp mô tả spectral envelope",
      "Phân biệt MFCC với log-mel và pretrained raw-waveform encoder",
      "Xử lý C0/energy, liftering, delta theo convention rõ",
    ],
    intuition:
      "Log-mel bins lân cận còn tương quan. DCT chuyển chúng thành coefficients theo mức biến thiên dọc trục Mel; giữ một số hệ số đầu tạo biểu diễn gọn của bao phổ, hữu ích cho speech cổ điển. Các hệ số cao chứa biến đổi nhanh/chi tiết và nhiễu. MFCC không phải lựa chọn mặc định cho mọi model sâu; nhiều mạng hiện đại học trực tiếp từ log-mel hoặc waveform.",
    math: [
      "DCT-II: $c_n=\\sum_{m=0}^{M-1}L_m\\cos[\\pi n(m+1/2)/M]$ với normalization theo convention.",
      "Delta thường là hồi quy cửa sổ: $\\Delta c_t=\\frac{\\sum_{n=1}^N n(c_{t+n}-c_{t-n})}{2\\sum_{n=1}^N n^2}$.",
      "Cepstral mean normalization trừ mean theo trục thời gian/nhóm đã chọn; fit trên toàn test có thể làm evaluation không đúng deployment streaming.",
    ],
    fromScratchSteps: [
      "Lấy log-mel đã kiểm tra từ bài trước.",
      "Tạo DCT-II basis bằng NumPy theo ortho convention và nhân ma trận.",
      "Giữ n_mfcc coefficients; quyết định có thay C0 bằng log-energy hay không.",
      "Cài delta với padding edge/reflect được ghi rõ.",
      "So MFCC với thư viện khi mọi tham số upstream giống nhau.",
    ],
    whenToUse: [
      "Baseline speech/speaker/audio classification nhẹ",
      "Mô hình cổ điển GMM/HMM/SVM hoặc thiết bị hạn chế",
      "Cần feature nhỏ, tương đối decorrelated và dễ khảo sát",
    ],
    failureModes: [
      "So MFCC giữa thư viện nhưng upstream mel/log/DCT norm khác",
      "Giữ quá ít coefficient làm mất phân biệt, quá nhiều giữ nhiễu/chi tiết không cần",
      "Delta dùng future frames trong hệ streaming mà không khai báo latency",
      "Normalize mỗi file khiến mất tín hiệu mức/giọng cần cho task",
      "Dùng MFCC vì truyền thống dù checkpoint/model yêu cầu log-mel/raw waveform",
    ],
    complexity: [
      "DCT ma trận trực tiếp $O(TM C)$ với T frames, M mel bins, C coefficients; basis cache được.",
      "MFCC memory $O(TC)$, thường C=13–40 nhỏ hơn n_mels.",
      "Delta thêm $O(TCN)$ theo cửa sổ N và có thể concat làm số feature ×2/×3.",
    ],
    miniQuiz: [
      {
        question: "MFCC khác log-mel ở bước cốt lõi nào?",
        expectedAnswer: "MFCC áp DCT lên log-mel và thường chỉ giữ một số coefficients đầu.",
        misconceptionToCatch: "Cho rằng MFCC chỉ là tên khác của Mel spectrogram.",
      },
      {
        question: "Vì sao delta features có thể gây vấn đề streaming?",
        expectedAnswer: "Công thức đối xứng dùng frames tương lai, tạo look-ahead/latency hoặc leakage nếu deployment không có tương lai đó.",
        misconceptionToCatch: "Cho rằng mọi phép xử lý frame đều causal.",
      },
    ],
    codingChallenge: {
      task: "Cài DCT-II orthonormal và mfcc_from_logmel, kèm delta có mode causal/centered rõ ràng.",
      durationMinutes: 50,
      starterSignature: "def mfcc_from_logmel(log_mel, n_mfcc=13): ...\ndef delta(features, width=2, causal=False): ...",
      requirements: [
        "Không gọi scipy.fftpack.dct/librosa.feature.mfcc",
        "Không hard-code số mel bins",
        "Test riêng basis orthonormal",
      ],
      acceptanceCriteria: [
        "DCT rồi inverse DCT khôi phục vector khi giữ đủ coefficients",
        "MFCC khớp reference theo cùng convention",
        "Causal delta không đọc index tương lai",
      ],
      aiBoundary: SELF_CODE_POLICY,
    },
    hiddenTestIdeas: [
      "Một frame duy nhất",
      "n_mfcc bằng n_mels và lớn hơn n_mels phải xử lý rõ",
      "Feature constant theo thời gian cho delta gần 0",
      "Sequence ngắn hơn cửa sổ delta",
      "float64 tolerance basis transpose×basis≈I",
    ],
    projectConnection:
      "Tạo baseline nhẹ đối chứng với HuBERT/Whisper embeddings; báo accuracy/macro-F1 cùng latency và kích thước feature để biết model lớn có thực sự cần.",
  },
  {
    id: "audio-05-hubert",
    title: "HuBERT: encoder âm thanh tự giám sát bằng masked prediction",
    domain: "Audio",
    officialCategory: "Practice — IOAI 2026 / Pre-trained Audio Encoders: HuBERT",
    prerequisites: [
      "audio-01-waveform-sampling",
      "Self-supervised learning, Transformer encoder và padding mask",
      "Clustering/pseudo-label ở mức trực giác",
    ],
    outcomes: [
      "Giải thích feature encoder, masking và dự đoán cluster targets của HuBERT",
      "Dùng processor/checkpoint đúng sample rate và attention mask",
      "Trích frame/utterance embeddings với masked pooling",
      "Fine-tune head cho classification mà không làm sai split theo speaker",
    ],
    intuition:
      "HuBERT học từ audio không nhãn bằng cách che các đoạn latent và dự đoán đơn vị rời rạc tạo từ clustering. Pseudo-label ban đầu chưa hoàn hảo nhưng cấu trúc nhất quán giúp encoder học speech representation; các vòng sau có thể cluster feature tốt hơn. Downstream thường dùng hidden states cho ASR/classification, không cần tự tái tạo toàn bộ pretraining.",
    math: [
      "Masked prediction loss chỉ tính tại tập time steps M trên cluster id $z_t$: $-\\sum_{t\\in M}\\log p(z_t|\\tilde x)$.",
      "Conv feature encoder giảm waveform N samples thành L latent frames; receptive field/stride do checkpoint quyết định.",
      "Masked mean pooling dùng feature-level mask; waveform attention mask phải được ánh xạ xuống chiều latent đúng processor/model.",
    ],
    fromScratchSteps: [
      "Đọc model card và processor config: sample rate, normalization, padding và license.",
      "Resample waveform đúng, batch bằng processor và kiểm tra input_values/mask.",
      "Chạy encoder no_grad, xem hidden-state shape/time resolution.",
      "Pool có mask cho utterance classification; train linear head trước full fine-tune.",
      "Đánh giá speaker-disjoint và so với MFCC baseline.",
    ],
    whenToUse: [
      "Cần speech embeddings cho classification/ASR với ít nhãn",
      "Có waveform tiếng nói gần miền pretraining",
      "Muốn encoder thay vì model sinh văn bản hoàn chỉnh",
    ],
    failureModes: [
      "Sai sample rate làm âm thanh bị hiểu nhanh/chậm",
      "Pool cả padding latent",
      "Assume mọi layer phù hợp như nhau mà không validation",
      "Split ngẫu nhiên đoạn cùng speaker làm điểm giả cao",
      "Fine-tune toàn model với LR lớn/dataset nhỏ gây quên hoặc overfit",
    ],
    complexity: [
      "Conv frontend gần tuyến tính theo samples; Transformer attention bậc hai theo latent length.",
      "Audio dài cần chunking nhưng biên chunk làm mất context; overlap/aggregation tăng compute.",
      "Linear probe có thể cache embeddings; full fine-tune cần activation memory lớn.",
    ],
    miniQuiz: [
      {
        question: "HuBERT pretraining target ban đầu đến từ transcript thật không?",
        expectedAnswer: "Không nhất thiết; cốt lõi dùng cluster/pseudo-label từ đặc trưng audio và dự đoán chúng tại vùng bị mask.",
        misconceptionToCatch: "Cho rằng HuBERT luôn supervised bằng văn bản.",
      },
      {
        question: "Vì sao speaker-disjoint split quan trọng cho speaker/emotion tasks?",
        expectedAnswer: "Cùng giọng ở nhiều split cho model nhận dạng người/điều kiện ghi thay vì khái quát nhãn cần dự đoán.",
        misconceptionToCatch: "Cho rằng cắt file thành clip đã tạo mẫu độc lập.",
      },
    ],
    codingChallenge: {
      task: "Viết masked temporal pooling cho hidden states HuBERT và pipeline linear probe trên embeddings cache, dùng fake encoder trong test.",
      durationMinutes: 55,
      starterSignature: "def masked_audio_pool(hidden, feature_mask): ...\ndef extract_hubert_embeddings(records, processor, model): ...",
      requirements: [
        "Không gọi mean trực tiếp nếu có padding",
        "Cache key gồm audio hash, checkpoint revision và preprocessing config",
        "Extraction ở eval/no_grad và không giữ tensor GPU trong cache file",
      ],
      acceptanceCriteria: [
        "Pool bất biến khi append padded frames",
        "Không NaN với zero valid frames; phải reject hoặc policy rõ",
        "Cùng metadata tạo cache hit, đổi sample rate/revision tạo miss",
      ],
      aiBoundary: SELF_CODE_POLICY,
    },
    hiddenTestIdeas: [
      "Batch lengths [1,L]",
      "Mask bool và int được chuẩn hóa rõ",
      "Hidden non-contiguous",
      "Model trả tuple/object khác nhau qua fake adapter",
      "Audio trùng bytes nhưng filename khác phải dùng content hash nếu contract vậy",
    ],
    projectConnection:
      "Encoder cho phân loại cảm xúc/sự kiện giọng nói; so linear probe với MFCC và ghi rõ người nói không trùng split.",
  },
  {
    id: "audio-06-whisper",
    title: "Whisper: encoder–decoder cho nhận dạng và dịch tiếng nói",
    domain: "Audio",
    officialCategory: "Practice — IOAI 2026 / Audio Models: Whisper",
    prerequisites: [
      "audio-03-mel-spectrogram",
      "nlp-05-encoder-decoder",
      "WER/CER và normalization văn bản",
    ],
    outcomes: [
      "Mô tả log-mel encoder, text decoder và task/language/timestamp tokens",
      "Chuẩn bị audio theo processor/model card và decode không cắt sai",
      "Tính WER/CER từ edit distance với normalization công khai",
      "Xử lý chunking, silence, hallucination và multilingual evaluation",
    ],
    intuition:
      "Whisper encode log-mel của đoạn audio rồi decoder sinh text và token điều khiển. Đây là sequence-to-sequence, không phải chỉ HuBERT + linear head. Output phụ thuộc language/task prompt, decoding và segmenting. Với audio dài hoặc im lặng, model có thể lặp/hallucinate; cần VAD/chunk policy và đánh giá theo dữ liệu thật.",
    math: [
      "WER $=(S+D+I)/N$ theo word-level edit distance; có thể >100% khi insertions nhiều.",
      "CER tương tự trên ký tự; với tiếng Việt, Unicode/space/punctuation normalization thay đổi mạnh kết quả nên phải công bố.",
      "Encoder attention phụ thuộc số mel frames; decoder sinh tự hồi quy theo số tokens.",
      "Timestamps được lượng tử theo token/time grid của model, không phải thời gian liên tục tuyệt đối.",
    ],
    fromScratchSteps: [
      "Tự cài Levenshtein distance và WER trên câu ngắn tính tay.",
      "Đọc model card/processor: sample rate, chunk length, feature config và forced decoder ids/tokens.",
      "Transcribe clip ngắn có transcript; log language/task/decoding params.",
      "Thử silence, noise, code-switch và audio dài với chunk overlap.",
      "Báo WER/CER theo nhóm cùng lỗi substitutions/deletions/insertions.",
    ],
    whenToUse: [
      "Speech-to-text hoặc speech translation đa ngôn ngữ",
      "Tạo transcript/timestamp draft có bước kiểm tra",
      "Cần baseline ASR pretrained mạnh trước fine-tuning",
    ],
    failureModes: [
      "Sai sample rate/preprocess hoặc dùng feature extractor khác checkpoint",
      "Language/task token sai làm output ngôn ngữ/nhiệm vụ khác",
      "Chunk không overlap làm mất từ ở biên hoặc merge trùng câu",
      "Audio im lặng/nhiễu sinh hallucination nhưng hệ thống không reject",
      "WER so text normalized khác nhau hoặc dùng test để tune normalization",
    ],
    complexity: [
      "Encoder xử lý mel frames; decoder latency tăng theo output tokens và beam width.",
      "Chunk dài tăng context nhưng attention/memory; chunk ngắn tăng biên/overhead.",
      "Model size tạo trade-off VRAM–latency–WER; cần benchmark hardware mục tiêu.",
    ],
    miniQuiz: [
      {
        question: "WER có thể lớn hơn 100% không?",
        expectedAnswer: "Có; số insertions có thể làm S+D+I lớn hơn số từ reference N.",
        misconceptionToCatch: "Cho rằng mọi metric error bị chặn ở 1.",
      },
      {
        question: "Tại sao transcript nhìn đúng bằng mắt chưa đủ đánh giá ASR?",
        expectedAnswer: "Cần tập đại diện và WER/CER/error groups; một clip đẹp không đo giọng, nhiễu, silence, code-switch và lỗi hiếm.",
        misconceptionToCatch: "Dùng demo đơn làm bằng chứng tổng quát.",
      },
    ],
    codingChallenge: {
      task: "Tự viết edit distance backtrace trả S/D/I và WER corpus-level; xây wrapper Whisper giả lập chunk/merge để test không cần tải model.",
      durationMinutes: 60,
      starterSignature: "def word_error_counts(reference, hypothesis): ...\ndef corpus_wer(pairs): ...",
      requirements: [
        "Không dùng jiwer/editdistance cho phần thuật toán",
        "Normalization là hàm riêng, versioned và có test tiếng Việt",
        "Corpus WER cộng counts trước khi chia, không lấy mean WER từng câu",
      ],
      acceptanceCriteria: [
        "Backtrace đúng S/D/I trên ca tính tay và S+D+I bằng edit distance",
        "Xử lý reference rỗng theo policy rõ",
        "Unicode normalization không tự bỏ dấu tiếng Việt",
      ],
      aiBoundary: SELF_CODE_POLICY,
    },
    hiddenTestIdeas: [
      "Reference/hypothesis đều rỗng",
      "Chỉ insertion và chỉ deletion",
      "Từ lặp tạo nhiều alignment tối ưu",
      "Ký tự Unicode composed/decomposed",
      "Corpus gồm câu reference rỗng và không rỗng",
    ],
    projectConnection:
      "Tạo transcript cho bài học/video; giao diện phải cho nghe lại đoạn lỗi và sửa transcript, không coi output model là bản chép lời đã xác minh.",
  },
  {
    id: "audio-07-qwen-audio",
    title: "Qwen-Audio: mô hình audio–language theo hướng instruction",
    domain: "Multimodal",
    officialCategory: "Practice — IOAI 2026 / Audio Models: Qwen-Audio",
    prerequisites: [
      "audio-06-whisper",
      "nlp-06-pretrained-and-api",
      "Multimodal prompting, structured evaluation và model cards",
    ],
    outcomes: [
      "Phân biệt audio-language model tổng quát với ASR chuyên dụng",
      "Dùng processor/chat template/checkpoint revision đúng tài liệu chính thức",
      "Thiết kế task audio question answering/classification có output kiểm chứng",
      "Đánh giá hallucination, prompt sensitivity, ngôn ngữ và giới hạn context",
    ],
    intuition:
      "Qwen-Audio nhận audio cùng chỉ dẫn văn bản để làm nhiều nhiệm vụ: nhận dạng, mô tả, trả lời câu hỏi hoặc phân loại. Tính linh hoạt đến từ việc audio encoder nối với language model; nó không bảo đảm vượt ASR/classifier chuyên dụng ở mọi bài. Prompt/chat template và phiên bản model là một phần input, không thể tự chế token format rồi so điểm.",
    math: [
      "Audio features được chiếu thành sequence embeddings rồi language model tối ưu next-token likelihood có điều kiện.",
      "Độ dài audio tokens + text tokens phải nằm trong context/model limits; truncation policy ảnh hưởng phần âm thanh được nghe.",
      "Task classification qua generation cần parse/normalize và đo invalid-output rate ngoài accuracy/F1.",
      "Không có một confidence chung đáng tin cho câu trả lời dài; log-prob token không đồng nghĩa factual correctness.",
    ],
    fromScratchSteps: [
      "Chọn đúng repository/model card/revision chính thức và đọc license/hardware/input format.",
      "Tạo 20 case nhỏ có audio, câu hỏi, đáp án/rubric và nhóm silence/noise/code-switch.",
      "Dùng processor/chat template chính thức; kiểm tra tensor/sequence lengths.",
      "Giới hạn output/schema, parse kết quả và lưu invalid cases.",
      "So với Whisper + text classifier hoặc HuBERT head trên cùng task/metric/cost.",
    ],
    whenToUse: [
      "Một giao diện cần nhiều tác vụ audio qua chỉ dẫn",
      "Audio QA/mô tả có ngữ cảnh ngôn ngữ",
      "Prototype multimodal trước khi quyết định model chuyên dụng",
    ],
    failureModes: [
      "Nhầm model generation/version hoặc chat template",
      "Dùng prompt văn bản có gợi ý đáp án và gọi đó là hiểu audio",
      "Audio bị truncate/resample sai nhưng không log",
      "Parse free-form bằng contains làm label sai",
      "Không so baseline chuyên dụng, bỏ qua latency/VRAM/license",
    ],
    complexity: [
      "Gồm audio encoder + projection + autoregressive LM; thường nặng hơn ASR/classifier chuyên dụng.",
      "Latency gồm encode audio và sinh tokens; câu trả lời dài tăng chi phí tuần tự.",
      "Batching bị giới hạn bởi audio/text lengths không đều và KV cache.",
    ],
    miniQuiz: [
      {
        question: "Tại sao Qwen-Audio không tự động thay thế Whisper trong mọi ASR task?",
        expectedAnswer: "Model tổng quát có overhead/độ bất định generation; cần benchmark WER, latency và miền cụ thể với ASR chuyên dụng.",
        misconceptionToCatch: "Cho rằng model nhiều nhiệm vụ luôn tốt nhất từng nhiệm vụ.",
      },
      {
        question: "Invalid-output rate quan trọng thế nào khi dùng generation cho classification?",
        expectedAnswer: "Model có thể sinh ngoài label/schema; phải đo riêng và có policy, không im lặng map bằng substring.",
        misconceptionToCatch: "Chỉ tính accuracy trên các output parse được.",
      },
    ],
    codingChallenge: {
      task: "Viết evaluator độc lập model cho audio QA/classification: validate input metadata, exact schema, invalid rate và grouped metrics bằng fake responses.",
      durationMinutes: 55,
      starterSignature: "def evaluate_audio_language_model(cases, adapter, parser): ...",
      requirements: [
        "Không tải/gọi model trong unit tests",
        "Không dùng substring để ép label",
        "Lưu model/preprocessor revision và prompt hash với result",
      ],
      acceptanceCriteria: [
        "Output hợp lệ/sai schema/timeout được phân loại tách biệt",
        "Metric denominator gồm mọi case theo policy công khai",
        "Grouped results đúng trên fake dataset tính tay",
      ],
      aiBoundary: SELF_CODE_POLICY,
    },
    hiddenTestIdeas: [
      "Label A xuất hiện trong câu giải thích nhưng schema sai",
      "Response null/timeout",
      "Audio metadata thiếu sample rate",
      "Hai case cùng id phải reject",
      "Nhóm không có sample không được báo 0 như score thật",
    ],
    projectConnection:
      "Dùng cho trợ lý hỏi–đáp trên audio bài giảng; evaluator bắt buộc so với transcript+NLP pipeline và yêu cầu người dùng xác nhận nội dung quan trọng.",
  },
  {
    id: "audio-08-voxtral",
    title: "Voxtral: speech understanding và transcription có chỉ dẫn",
    domain: "Multimodal",
    officialCategory: "Practice — IOAI 2026 / Audio Models: Voxtral",
    prerequisites: [
      "audio-06-whisper",
      "audio-07-qwen-audio",
      "nlp-06-pretrained-and-api",
    ],
    outcomes: [
      "Đọc model card/tài liệu phiên bản Voxtral đang dùng thay vì suy từ tên",
      "Xây adapter local/API không rò secret và có kiểm soát lỗi",
      "Đánh giá transcription, audio QA và classification bằng metric riêng",
      "So sánh model theo quality–latency–cost–privacy–license trên cùng cases",
    ],
    intuition:
      "Voxtral thuộc nhóm mô hình speech/audio hiểu chỉ dẫn và có thể được cung cấp dưới nhiều kích thước/cách truy cập theo thời điểm. Kỹ năng thi không phải nhớ một endpoint cố định mà là đọc model card, chuẩn hóa input, dùng prompt/task đúng, kiểm tra output và xây benchmark. Tên thương hiệu không thay thế hợp đồng phiên bản.",
    math: [
      "ASR dùng corpus WER/CER; QA/classification cần exact/F1/rubric và invalid rate — không trộn thành một score tùy ý.",
      "Đánh giá paired bootstrap có thể ước lượng uncertainty của chênh lệch model trên cùng cases.",
      "Real-time factor $RTF=t_{processing}/t_{audio}$; RTF<1 mới nhanh hơn thời lượng audio trên hardware đó.",
      "Chi phí/latency phải đo ở cùng độ dài audio/output và concurrency.",
    ],
    fromScratchSteps: [
      "Đọc nguồn chính thức hiện hành: input formats, sample rate, context, deployment/API, license và data policy.",
      "Định nghĩa ModelAdapter không chứa tên field vendor trong evaluator.",
      "Chạy fake transport tests trước; sau đó benchmark thật trên eval set đã khóa nếu có quyền/tài nguyên.",
      "Tách metrics ASR, classification, QA và safety/invalid outputs.",
      "Lập bảng so với Whisper/Qwen-Audio cùng hardware hoặc báo rõ khác điều kiện.",
    ],
    whenToUse: [
      "Cần speech understanding/instruction theo khả năng model card hiện hành",
      "Muốn so local/open deployment với API hoặc model khác",
      "Có eval set và chính sách dữ liệu phù hợp",
    ],
    failureModes: [
      "Hard-code API/model details có thể thay đổi vào giáo trình lâu hạn",
      "So model khác hardware/chunk/prompt rồi kết luận tuyệt đối",
      "Gửi audio nhạy cảm tới dịch vụ ngoài mà chưa có chấp thuận/chính sách",
      "Retry làm lặp request tính phí hoặc duplicate side effects",
      "Chỉ chấm câu trôi chảy, không chấm đúng nội dung/audio grounding",
    ],
    complexity: [
      "Đo thực nghiệm RTF, peak memory, first-token và total latency; không suy chỉ từ parameter count.",
      "Streaming/chunking thay context và latency; benchmark phải ghi chế độ.",
      "API concurrency/rate limits tạo queueing; local batching tạo trade-off throughput–latency.",
    ],
    miniQuiz: [
      {
        question: "RTF=0.4 nghĩa là gì?",
        expectedAnswer: "Xử lý mất 0.4 giây cho mỗi 1 giây audio trong điều kiện benchmark, tức nhanh hơn thời gian thực khoảng 2.5× về tổng thời gian.",
        misconceptionToCatch: "Cho rằng latency mỗi request luôn 0.4 giây bất kể audio dài.",
      },
      {
        question: "Vì sao giáo trình không nên hard-code endpoint/giá API?",
        expectedAnswer: "Đó là dữ liệu thay đổi; phải tra tài liệu chính thức tại thời điểm dùng và pin/version kết quả benchmark.",
        misconceptionToCatch: "Coi thông tin sản phẩm động là kiến thức thuật toán cố định.",
      },
    ],
    codingChallenge: {
      task: "Xây benchmark harness vendor-neutral cho fake Whisper/Qwen-Audio/Voxtral adapters, đo task metric, RTF, timeout và invalid outputs.",
      durationMinutes: 60,
      starterSignature: "def benchmark_audio_adapter(adapter, cases, clock, concurrency=1): ...",
      requirements: [
        "Test không cần mạng/key/model",
        "Dùng injected monotonic clock cho unit test latency",
        "Không log raw audio/text nếu case đánh dấu sensitive",
      ],
      acceptanceCriteria: [
        "RTF tính từ tổng processing/audio duration theo policy rõ",
        "Timeout/error không biến mất khỏi denominator",
        "Bảng kết quả chứa adapter version, prompt/config hash và environment",
      ],
      aiBoundary: SELF_CODE_POLICY,
    },
    hiddenTestIdeas: [
      "Audio duration 0 phải reject",
      "Adapter trả partial result rồi timeout",
      "Clock values không đơn điệu từ fake để bắt validation",
      "Sensitive case không xuất hiện raw trong logs",
      "Concurrency 2 nhưng kết quả phải giữ mapping id",
    ],
    projectConnection:
      "Là bài so sánh hệ thống, không phải quảng cáo model: người học phải chứng minh model nào phù hợp từng tác vụ và điều kiện triển khai bằng benchmark tái lập.",
  },
  {
    id: "mm-01-data-embeddings",
    title: "Data embeddings: không gian vector chung cho text, image và audio",
    domain: "Multimodal",
    officialCategory: "Both — IOAI 2026 / Deep Learning / Data Embeddings (text, image, audio)",
    prerequisites: [
      "Vector, ma trận, cosine/dot product và normalization",
      "nlp-01-tokenization-embeddings",
      "cv-11-clip và audio-05-hubert",
    ],
    outcomes: [
      "Phân biệt token/frame/patch/sequence embedding và pooling",
      "Chuẩn hóa/project embeddings khác chiều vào không gian chung",
      "Xây exact nearest-neighbor retrieval và Recall@K/MRR",
      "Nhận biết anisotropy, hubness, leakage và embedding drift",
    ],
    intuition:
      "Embedding nén một đối tượng thành vector sao cho quan hệ quan trọng cho objective được phản ánh bằng khoảng cách. Vector không mang ‘ngữ nghĩa phổ quát’: CLIP, BERT, HuBERT tối ưu mục tiêu khác nhau, nên không so trực tiếp nếu chưa align/project. Retrieval cần metric, normalization và relevance labels rõ; ảnh/text/audio của cùng nội dung có thể làm positive trong không gian chung.",
    math: [
      "Cosine$(u,v)=u^Tv/(||u||||v||)$; sau L2-normalize, xếp hạng cosine tương đương dot product.",
      "Projection tuyến tính $z=W h+b$ đổi chiều nhưng alignment cần objective/data, không chỉ shape.",
      "MRR $=\\frac1Q\\sum_q1/rank_q$ cho positive đầu; Recall@K xử lý nhiều positives theo policy.",
      "Exact search Q queries × N items tốn $O(QNd)$; ANN đổi exactness lấy latency/memory.",
    ],
    fromScratchSteps: [
      "Tạo vectors 2D và vẽ cosine vs Euclidean trước/sau normalize.",
      "Viết masked pooling cho token/frame/patch sequence.",
      "Viết exact top-k theo block để không materialize Q×N quá lớn.",
      "Tạo relevance sets, tính Recall@K/MRR và kiểm tra duplicate IDs.",
      "Lưu embedding metadata: encoder/revision/preprocess/dim/normalize/data hash.",
    ],
    whenToUse: [
      "Semantic search, clustering, deduplication hoặc retrieval-augmented systems",
      "Gắn modality khác nhau qua shared space/projection",
      "Cache feature để huấn luyện head nhẹ nhiều lần",
    ],
    failureModes: [
      "So dot product vector chưa normalize khi norm không mang ý nghĩa",
      "Trộn embeddings từ model/revision/preprocess khác trong cùng index",
      "Index chứa duplicate/near-duplicate của test",
      "Dùng t-SNE đẹp như bằng chứng retrieval/classification tốt",
      "Cache stale khi model/preprocess thay đổi",
    ],
    complexity: [
      "Lưu N float32 embeddings chiều d: $4Nd$ bytes chưa tính index metadata.",
      "Exact top-k $O(Nd)$ mỗi query; block search kiểm soát memory còn ANN cải thiện latency.",
      "Projection/pooling thường rẻ hơn encoder; encode dữ liệu mới là nút thắt chính.",
    ],
    miniQuiz: [
      {
        question: "Hai vectors BERT và HuBERT đều chiều 768 có thể cosine trực tiếp để so text–audio không?",
        expectedAnswer: "Không mặc nhiên; cùng chiều không nghĩa cùng hệ tọa độ/objective, cần mô hình alignment hoặc shared training.",
        misconceptionToCatch: "Đồng nhất shape với không gian ngữ nghĩa chung.",
      },
      {
        question: "Sau L2-normalize, dot product và cosine khác nhau thế nào?",
        expectedAnswer: "Chúng bằng nhau về giá trị/ranking (trong sai số số học) vì norm mỗi vector là 1.",
        misconceptionToCatch: "Cho rằng vẫn cần chia norm lần nữa mới đúng ranking.",
      },
    ],
    codingChallenge: {
      task: "Cài exact cosine top-k theo block và Recall@K/MRR cho relevance sets nhiều positive, không dùng vector DB.",
      durationMinutes: 55,
      starterSignature: "def blocked_cosine_topk(queries, corpus, k, block_size=1024): ...\ndef retrieval_metrics(ranked_ids, relevant_ids, ks=(1,5,10)): ...",
      requirements: [
        "Không materialize toàn Q×N nếu block_size nhỏ",
        "Tie-break xác định theo corpus id/index",
        "Reject/handle zero-norm theo contract rõ",
      ],
      acceptanceCriteria: [
        "Kết quả khớp full-matrix reference trên random data",
        "Metrics đúng ví dụ tính tay có nhiều positives",
        "k>N và corpus rỗng được xử lý rõ",
      ],
      aiBoundary: SELF_CODE_POLICY,
    },
    hiddenTestIdeas: [
      "Zero vector",
      "Duplicate vectors/scores bằng nhau",
      "Q=1 và block_size=1",
      "Query không có relevant item",
      "Relevant IDs trùng hoặc không tồn tại corpus",
    ],
    projectConnection:
      "Xây tầng tìm kiếm chung cho tài liệu, ảnh và audio học tập; version metadata chặn trộn index cũ với encoder mới.",
  },
  {
    id: "mm-02-video",
    title: "Video understanding: không gian cộng thời gian",
    domain: "Video & Time-series",
    officialCategory: "Dạng dữ liệu được nêu trong ghi chú IOAI 2026; xử lý bằng các phương pháp phía trên, không có category riêng",
    prerequisites: [
      "cv-02-image-classification và cv-13-vision-transformer",
      "Frame rate, timestamp và sampling",
      "Pooling/attention trên sequence embeddings",
    ],
    outcomes: [
      "Lấy mẫu frames theo thời gian/timestamp không nhầm FPS biến đổi",
      "Xây baseline 2D encoder + temporal pooling và nêu giới hạn mất chuyển động",
      "Phân biệt clip classification, temporal localization và tracking",
      "Chia dữ liệu theo source video/sự kiện để tránh leakage",
    ],
    intuition:
      "Video không chỉ là túi ảnh: thứ tự và chuyển động có thể quyết định nhãn. Baseline hiệu quả là encode vài frames bằng CNN/ViT rồi mean/max/attention pool theo thời gian. Nó bắt nội dung xuất hiện nhưng có thể không phân biệt ‘mở’ với ‘đóng’. 3D convolution/temporal attention xử lý động học tốt hơn nhưng tốn nhiều compute. Timestamp đáng tin hơn index nếu video có variable frame rate.",
    math: [
      "Uniform sampling K timestamps: $t_i=(i+0.5)T/K$; decode frame gần timestamp và lưu timestamp thật.",
      "Temporal mean có mask: $h=\\sum_t m_th_t/\\sum_t m_t$.",
      "3D convolution trực tiếp xấp xỉ $O(T_{out}H_{out}W_{out}K_tK_hK_wC_{in}C_{out})$.",
      "Temporal IoU cho segment thời gian dùng độ dài giao/hợp tương tự box 1D.",
    ],
    fromScratchSteps: [
      "Đọc metadata duration/FPS/timebase và xác minh bằng timestamps decoded.",
      "Lấy K frames uniform; tạo mask nếu decode thiếu.",
      "Encode từng frame bằng pretrained vision encoder và temporal mean baseline.",
      "Thêm temporal 1D conv/Transformer nhỏ, giữ cùng split và feature cache.",
      "Đánh giá theo source-disjoint, clip length và motion-dependent subset.",
    ],
    whenToUse: [
      "Phân loại hành động/sự kiện clip, moderation hoặc video retrieval",
      "Cần baseline nhanh từ image encoder pretrained",
      "Temporal order/motion có thể thêm sau khi baseline appearance được đo",
    ],
    failureModes: [
      "Random split clips từ cùng video/source vào train/test",
      "Tin FPS metadata cố định trên variable-frame-rate video",
      "Uniform K quá nhỏ bỏ lỡ sự kiện ngắn",
      "Mean pooling mất thứ tự và pha loãng event",
      "Resize/crop khác nhau từng frame gây flicker augmentation ngoài ý muốn",
    ],
    complexity: [
      "2D frame encoder compute gần K lần ảnh đơn; cache features giảm thí nghiệm temporal.",
      "Temporal attention $O(K^2d)$; spatiotemporal attention toàn patch có thể $O((KN)^2d)$.",
      "Decode I/O thường là bottleneck; benchmark phải tính cả decode nếu deployment cần.",
    ],
    miniQuiz: [
      {
        question: "Mean pooling frame embeddings có phân biệt được cùng frames theo thứ tự đảo ngược không?",
        expectedAnswer: "Không; mean là permutation-invariant, cần positional/temporal model để dùng thứ tự.",
        misconceptionToCatch: "Cho rằng encoder từng frame tự biết thứ tự video.",
      },
      {
        question: "Vì sao split theo clip ngẫu nhiên dễ leakage?",
        expectedAnswer: "Các clip cùng video có nền, người, camera và frames gần trùng; model có thể nhớ source thay vì hành động.",
        misconceptionToCatch: "Cho rằng timestamp khác làm clip độc lập.",
      },
    ],
    codingChallenge: {
      task: "Viết uniform timestamp sampler và masked temporal pooling/1D segment IoU, dùng metadata giả để test không cần codec.",
      durationMinutes: 55,
      starterSignature: "def sample_timestamps(duration_s, num_frames): ...\ndef temporal_pool(frame_features, valid_mask): ...",
      requirements: [
        "Không dựa vào integer FPS để tạo timestamps",
        "Không đọc padded/missing frames trong pooling",
        "Không hard-code video ngang hoặc số frames",
      ],
      acceptanceCriteria: [
        "Timestamps nằm trong [0,duration), tăng dần và ở tâm bins",
        "Pool bất biến khi append padded frames",
        "Temporal IoU đúng cho segments rời/chạm/lồng nhau",
      ],
      aiBoundary: SELF_CODE_POLICY,
    },
    hiddenTestIdeas: [
      "duration rất ngắn và K lớn",
      "duration 0/âm phải reject",
      "Một số frames giữa sequence invalid",
      "Feature shape B×T×D với B>1",
      "Temporal segment endpoints đảo ngược",
    ],
    projectConnection:
      "Dùng cho nhận diện hoạt động trong video trường học/thí nghiệm; dashboard báo riêng decode time, sampling coverage và lỗi sự kiện ngắn.",
  },
  {
    id: "mm-03-time-series",
    title: "Time-series: cửa sổ, dự báo và chống rò rỉ tương lai",
    domain: "Video & Time-series",
    officialCategory: "Dạng dữ liệu được nêu trong ghi chú IOAI 2026; xử lý bằng các phương pháp phía trên, không có category riêng",
    prerequisites: [
      "Thống kê mô tả, normalization và supervised learning",
      "Sequence padding/mask, MLP/CNN/Transformer cơ bản",
      "Timestamp, missing values và train/validation/test",
    ],
    outcomes: [
      "Biến chuỗi thành supervised windows không nhìn tương lai",
      "Chia theo thời gian/nhóm, fit scaler chỉ trên train",
      "Xây persistence/seasonal baseline trước neural model",
      "Đánh giá rolling-origin bằng MAE/RMSE/sMAPE và kiểm tra drift",
    ],
    intuition:
      "Mỗi sample gồm quá khứ đến thời điểm cutoff và target sau cutoff. Nếu scaler, interpolation, rolling feature hoặc split nhìn qua cutoff, điểm số bị thổi phồng. Dự báo tốt phải thắng baseline ‘giữ nguyên giá trị gần nhất’ hoặc mùa vụ. Transformer không sửa được timestamp sai, missing-not-at-random hay regime change.",
    math: [
      "Window: $X_t=[x_{t-L+1},...,x_t]$, target horizon h: $y_t=[x_{t+1},...,x_{t+h}]$.",
      "MAE $=mean|y-\\hat y|$; RMSE nhạy outlier hơn; sMAPE cần epsilon/policy gần 0.",
      "Causal rolling mean tại t chỉ dùng indices ≤t; centered rolling là leakage cho forecasting.",
      "1D dilated conv receptive field tăng theo dilation; Transformer attention chuẩn $O(L^2d)$.",
    ],
    fromScratchSteps: [
      "Vẽ chuỗi/timestamps, kiểm tra interval, duplicate, gap, missing và unit.",
      "Chốt cutoff train/validation/test theo thời gian và entity groups.",
      "Fit scaler/imputer trên train quá khứ; lưu state.",
      "Tạo windows cùng origin timestamp; cài persistence/seasonal baseline.",
      "Train MLP/1D CNN/Transformer nhỏ, đánh giá rolling origins và lỗi theo horizon/regime.",
    ],
    whenToUse: [
      "Dự báo cảm biến, nhu cầu, giá trị đo hoặc phân loại sequence",
      "Anomaly detection với baseline/threshold fit trên history sạch",
      "Dữ liệu có thứ tự thời gian không thể random shuffle split",
    ],
    failureModes: [
      "Random split overlapping windows làm gần cùng dữ liệu ở train/test",
      "Fit scaler toàn chuỗi hoặc backfill từ tương lai",
      "Centered moving average dùng future",
      "MAPE bùng nổ khi actual gần 0",
      "Không có persistence/seasonal baseline nên model phức tạp tưởng là tốt",
      "Timestamp irregular bị coi như spacing đều mà không có delta-time feature/resampling policy",
    ],
    complexity: [
      "Materialize windows naïve tốn $O(NL)$ memory; Dataset có thể slice on-demand.",
      "1D CNN gần $O(NLK C^2)$ tùy channel; Transformer attention $O(NL^2d)$ mỗi batch.",
      "Rolling-origin evaluation nhân số lần inference theo origins/horizons nhưng phản ánh deployment tốt hơn một split.",
    ],
    miniQuiz: [
      {
        question: "Tại sao random split các cửa sổ chồng lặp là nguy hiểm?",
        expectedAnswer: "Train/test có thể chia sẻ phần lớn timestamps, khiến model gần như thấy input test và điểm không phản ánh dự báo tương lai.",
        misconceptionToCatch: "Cho rằng sample index khác nghĩa là độc lập.",
      },
      {
        question: "Scaler được fit lúc nào trong forecasting?",
        expectedAnswer: "Chỉ trên dữ liệu train khả dụng trước cutoff; sau đó transform validation/test bằng state đó.",
        misconceptionToCatch: "Fit riêng từng split hoặc toàn chuỗi để ‘chuẩn hơn’.",
      },
    ],
    codingChallenge: {
      task: "Viết window generator có origin timestamps, train-only standardizer và rolling-origin evaluator cho multi-step forecast.",
      durationMinutes: 60,
      starterSignature: "def make_forecast_windows(values, timestamps, lookback, horizon, origins): ...",
      requirements: [
        "Không materialize dữ liệu ngoài cutoff vào feature",
        "Reject timestamps không tăng hoặc xử lý duplicate theo policy rõ",
        "Evaluator trả metric theo horizon và tổng hợp có trọng số count",
      ],
      acceptanceCriteria: [
        "Mọi input timestamp ≤ origin và target > origin",
        "Scaler stats khớp train slice tính tay",
        "Persistence baseline metric đúng trên chuỗi nhỏ",
      ],
      aiBoundary: SELF_CODE_POLICY,
    },
    hiddenTestIdeas: [
      "lookback/horizon vượt dữ liệu",
      "Missing values tại biên train/test",
      "Timestamps duplicate hoặc không đều",
      "Actual bằng 0 khi tính sMAPE",
      "Nhiều entities có timeline khác nhau không được nối window qua entity",
    ],
    projectConnection:
      "Dùng dự báo cảm biến/mức sử dụng trong dự án AI; báo cáo phải có baseline, cutoff, horizon và drift, không chỉ loss random validation.",
  },
  {
    id: "mm-04-fusion",
    title: "Multimodal fusion: ghép text, image, audio và dữ liệu thiếu modality",
    domain: "Multimodal",
    officialCategory: "Tổng hợp IOAI 2026 — embeddings, attention, transformers và các dạng dữ liệu trong ghi chú syllabus",
    prerequisites: [
      "mm-01-data-embeddings",
      "cv-11-clip",
      "nlp-05-encoder-decoder và audio-05-hubert",
    ],
    outcomes: [
      "Phân biệt early, late, gated và cross-attention fusion",
      "Chuẩn hóa shape/mask/projection cho mỗi modality",
      "Huấn luyện/evaluate khi thiếu modality mà không dùng placeholder gây shortcut",
      "Thiết kế ablation từng modality và kiểm tra alignment/leakage",
    ],
    intuition:
      "Early fusion ghép features sớm để học tương tác nhưng đòi alignment và dễ một modality lấn át. Late fusion kết hợp predictions nên đơn giản, bền với model độc lập nhưng bỏ tương tác chi tiết. Cross-attention cho token modality này truy vấn modality kia. Hệ tốt phải hoạt động khi audio/ảnh/text thiếu hoặc nhiễu; nếu trạng thái missing tương quan label, model có thể học shortcut.",
    math: [
      "Early concat: $z=[P_1h_1;...;P_mh_m]$; projections giúp scale/dimension tương thích nhưng normalization vẫn cần kiểm tra.",
      "Late fusion xác suất: $p=\\sum_m w_mp_m$, $w_m\\ge0$, $\\sum_mw_m=1$; logits averaging không giống probability averaging.",
      "Gated fusion: $g=softmax(G[h_1;...;h_m])$, $z=\\sum_m g_mP_mh_m$ với mask modality thiếu trước softmax.",
      "Cross-attention từ A sang B tốn $O(L_A L_B d)$ và phải mask padding của keys B.",
    ],
    fromScratchSteps: [
      "Định nghĩa sample id/timestamp alignment và kiểm tra một-một/một-nhiều trước model.",
      "Train unimodal baselines trên cùng split.",
      "Cài late fusion cố định, rồi concat/gated fusion với projection và masks.",
      "Thêm modality dropout lúc train nếu deployment có missing data.",
      "Đánh giá full, từng modality bị thiếu, noisy modality và ablation/shuffled modality.",
    ],
    whenToUse: [
      "Nhãn phụ thuộc tín hiệu bổ sung giữa hình–chữ–âm thanh",
      "Audio-visual event, video QA, sản phẩm + mô tả hoặc cảm biến + ảnh",
      "Có alignment và số mẫu đủ để học tương tác",
    ],
    failureModes: [
      "Ghép sample sai id/timestamp tạo label leakage hoặc noise",
      "Một modality có scale lớn thống trị concat",
      "Mask missing sai làm zero vector được hiểu như tín hiệu thật",
      "Chỉ báo full-modality score dù deployment thường thiếu dữ liệu",
      "Không có unimodal baselines nên không biết modality nào đóng góp",
      "Modality chứa proxy trực tiếp của nhãn như filename/transcript được tạo sau sự kiện",
    ],
    complexity: [
      "Tổng encode cost ít nhất bằng tổng các encoders được chạy; cache giúp train fusion head nhưng không giảm inference nếu cần raw inputs.",
      "Concat head tăng tham số theo tổng dimensions; cross-attention tăng theo tích sequence lengths.",
      "Late fusion dễ chạy song song và bỏ encoder khi modality thiếu; end-to-end early fusion tốn activation memory nhiều hơn.",
    ],
    miniQuiz: [
      {
        question: "Late fusion có ưu điểm chính nào khi modality có thể thiếu?",
        expectedAnswer: "Các model tạo dự đoán độc lập nên có thể kết hợp subset sẵn có theo policy; không cần token-level alignment chặt.",
        misconceptionToCatch: "Cho rằng late fusion luôn học tương tác chi tiết tốt hơn cross-attention.",
      },
      {
        question: "Vì sao phải chạy shuffled-modality test?",
        expectedAnswer: "Đổi modality giữa samples phá thông tin đúng nhưng giữ phân phối; nếu score không giảm, model có thể đang bỏ qua modality hoặc dùng shortcut.",
        misconceptionToCatch: "Cho rằng ablation chỉ cần bỏ toàn modality.",
      },
    ],
    codingChallenge: {
      task: "Cài masked gated fusion cho text/image/audio embeddings và evaluator ablation: full, each-missing, shuffled-each.",
      durationMinutes: 60,
      starterSignature: "class MaskedGatedFusion(nn.Module): ...\ndef multimodal_ablation(model, dataset, modalities): ...",
      requirements: [
        "Gate của modality thiếu bằng 0 và các gate còn lại tổng 1",
        "Không cho NaN khi chỉ một modality có mặt; reject khi tất cả thiếu theo contract",
        "Shuffle trong group/split bằng seed xác định",
      ],
      acceptanceCriteria: [
        "Output bất biến với giá trị rác ở embedding đã mask",
        "Gradient chảy tới mọi projection có modality hợp lệ",
        "Bảng ablation gắn count và confidence/variation qua seed nếu có",
      ],
      aiBoundary: SELF_CODE_POLICY,
    },
    hiddenTestIdeas: [
      "Mask [1,0,0], [0,1,1] trong cùng batch",
      "Embedding dimensions khác nhau",
      "Giá trị NaN trong modality đã mask không được lan nếu implementation sanitize theo contract",
      "Tất cả modalities thiếu",
      "Shuffling không được đổi labels/sample ids",
    ],
    projectConnection:
      "Bài capstone kết nối ảnh, mô tả, audio và chuỗi thời gian; báo cáo bắt buộc có unimodal baselines, missing/noisy tests và model card nêu giới hạn.",
  },
];

export default multimodalLessons;
