import type { LessonTheoryMap } from "./types";

export const visionTheory = {
  "cv-01-convolution": {
    lessonId: "cv-01-convolution",
    readingMinutes: 32,
    openingQuestions: [
      "Vì sao một kernel nhỏ có thể phát hiện cùng một cạnh ở nhiều vị trí?",
      "Padding, stride và dilation thay đổi kích thước lẫn ý nghĩa của feature map ra sao?",
    ],
    sections: [
      {
        title: "Từ điểm ảnh đến đáp ứng cục bộ",
        paragraphs: [
          "Ảnh số là tensor có hai trục không gian và một trục kênh. Phép tích chập lấy một cửa sổ cục bộ, nhân từng phần tử với trọng số kernel rồi cộng lại. Cùng một kernel được dùng ở mọi vị trí, vì vậy mô hình vừa tiết kiệm tham số vừa tìm được cùng một mẫu dù mẫu dịch chuyển trong ảnh.",
          "Trong thư viện học sâu, phép toán thường là cross-correlation vì kernel không bị lật; cách gọi convolution vẫn được giữ theo quy ước. Mỗi kênh đầu ra có một bộ kernel đi qua toàn bộ kênh đầu vào, nên tensor trọng số có shape [C_out, C_in, K_h, K_w].",
        ],
        formulas: [
          "Y[o,i,j] = b[o] + sum_c sum_u sum_v W[o,c,u,v] X[c,iS_h+uD_h-P_h,jS_w+vD_w-P_w]",
          "H_out = floor((H + 2P_h - D_h(K_h-1) - 1)/S_h) + 1",
        ],
      },
      {
        title: "Hình học receptive field",
        paragraphs: [
          "Stride lớn làm giảm độ phân giải; padding quyết định cách xử lý biên; dilation tạo khoảng cách giữa các phần tử kernel để mở rộng vùng nhìn mà không tăng số trọng số. Chúng không phải ba nút chỉnh độc lập về mặt ý nghĩa: thay đổi một giá trị có thể làm lệch tâm đặc trưng hoặc bỏ sót chi tiết nhỏ.",
          "Nhiều lớp 3x3 liên tiếp thường tốt hơn một kernel rất lớn: receptive field tăng dần, có thêm phi tuyến và số tham số thấp hơn. Tuy nhiên receptive field lý thuyết không đồng nghĩa mọi pixel trong vùng đều ảnh hưởng như nhau; vùng ảnh hưởng hiệu dụng thường tập trung gần tâm.",
        ],
        bullets: [
          "Kiểm tra shape sau từng lớp thay vì đoán.",
          "Dùng padding đối xứng khi cần giữ tâm lưới; ghi rõ quy ước với kernel chẵn.",
          "Không nhầm translation-equivariant của feature map với translation-invariant của toàn mô hình.",
        ],
      },
      {
        title: "Từ phép tính tay đến implementation",
        paragraphs: [
          "Một implementation học tập nên có hai bản: vòng lặp rõ ràng để kiểm chứng và bản vector hóa bằng im2col/unfold hoặc toán tử thư viện. Hai bản phải trùng nhau trong dung sai số, kể cả trường hợp nhiều batch, nhiều kênh và biên ảnh.",
          "Khi huấn luyện, cần phân biệt lỗi hình học với lỗi tối ưu. Nếu loss không giảm, hãy kiểm tra thứ tự NCHW/NHWC, dtype, normalization, cách cộng bias và gradient trước khi đổi optimizer.",
        ],
      },
    ],
    workedExamples: [
      {
        title: "Tính một feature map 2x2",
        problem: "Cho ảnh một kênh X=[[1,2,0],[0,1,3],[2,1,0]], kernel K=[[1,0],[-1,1]], stride=1, padding=0. Tính output theo cross-correlation.",
        steps: [
          { state: "Y[0,0] = 1*1 + 2*0 + 0*(-1) + 1*1 = 2", explanation: "Lấy cửa sổ hàng 0..1, cột 0..1." },
          { state: "Y[0,1] = 2*1 + 0*0 + 1*(-1) + 3*1 = 4", explanation: "Dịch cửa sổ sang phải một pixel." },
          { state: "Y[1,0] = 0*1 + 1*0 + 2*(-1) + 1*1 = -1", explanation: "Dịch cửa sổ xuống hàng tiếp theo." },
          { state: "Y[1,1] = 1*1 + 3*0 + 1*(-1) + 0*1 = 0", explanation: "Cửa sổ cuối tạo phần tử cuối." },
        ],
        conclusion: "Feature map là [[2,4],[-1,0]] với shape [1,2,2]; dấu và độ lớn biểu diễn mức khớp cục bộ với kernel.",
        sanityChecks: ["Output phải có H_out=W_out=2.", "Đổi kernel thành toàn số 1 phải cho tổng từng cửa sổ.", "So kết quả với conv2d dùng cùng quy ước cross-correlation."],
      },
    ],
    implementationChecklist: ["Kiểm tra NCHW và shape kernel.", "Viết test cho stride, padding, dilation và nhiều kênh.", "So bản vòng lặp với toán tử thư viện.", "Kiểm tra gradient bằng bài toán rất nhỏ."],
    masteryChecklist: ["Tự suy ra công thức kích thước output.", "Giải thích được weight sharing.", "Tính tay một output nhiều kênh.", "Phân biệt equivariance và invariance."],
    glossary: [
      { term: "kernel", definition: "Tensor trọng số quét trên vùng cục bộ của input." },
      { term: "receptive field", definition: "Vùng input có thể ảnh hưởng đến một đơn vị đặc trưng." },
      { term: "dilation", definition: "Khoảng cách lấy mẫu bên trong kernel." },
      { term: "stride", definition: "Bước dịch của kernel giữa hai vị trí đầu ra liên tiếp." },
      { term: "padding", definition: "Vùng giá trị bổ sung quanh input để kiểm soát biên và kích thước output." },
    ],
    sourceIds: ["d2l-vi", "vision-book"],
  },

  "cv-02-image-classification": {
    lessonId: "cv-02-image-classification",
    readingMinutes: 30,
    openingQuestions: ["Classifier đang học vật thể hay học phông nền?", "Accuracy tổng có che giấu lớp hiếm bị dự đoán sai hết không?"],
    sections: [
      {
        title: "Định nghĩa bài toán và nhãn",
        paragraphs: [
          "Phân loại ảnh ánh xạ một ảnh sang phân phối xác suất trên các lớp. Trước khi chọn mạng, phải chốt đơn nhãn hay đa nhãn, các lớp có loại trừ nhau không, đơn vị tách train/validation là ảnh hay đối tượng, và nhãn có nhất quán hay không.",
          "Logit là điểm chưa chuẩn hóa. Với bài toán đơn nhãn, softmax và cross-entropy so logit của lớp đúng với log-sum-exp của mọi lớp. Với đa nhãn, mỗi lớp dùng sigmoid và binary cross-entropy độc lập; dùng softmax ở đây sẽ áp đặt cạnh tranh sai.",
        ],
        formulas: ["p_k = exp(z_k) / sum_j exp(z_j)", "L_CE = -log p_y"],
      },
      {
        title: "Pipeline dữ liệu không rò rỉ",
        paragraphs: [
          "Tách dữ liệu trước khi augment và trước mọi thao tác học thống kê. Nếu nhiều ảnh thuộc cùng bệnh nhân, video hoặc vật thể, phải group-split để các bản gần trùng không nằm ở hai phía. Chuẩn hóa phải dùng thống kê của train hoặc chuẩn tương thích pretrained model.",
          "Augmentation chỉ nên mô phỏng biến thiên giữ nguyên nhãn. Lật chữ, đổi màu của tín hiệu y khoa hoặc crop làm mất vật thể có thể phá nhãn. Quan sát batch đã biến đổi là bước kiểm tra bắt buộc.",
        ],
        bullets: ["Theo dõi phân bố lớp sau split.", "Lưu mapping class-to-index cùng checkpoint.", "Đánh giá thêm macro-F1, confusion matrix và calibration khi phù hợp."],
      },
      {
        title: "Chẩn đoán sai số và độ tin cậy",
        paragraphs: [
          "Một mô hình tốt không chỉ có accuracy cao mà còn cần lỗi phù hợp mục tiêu sử dụng. Hãy chia lỗi theo lớp, nguồn dữ liệu, độ sáng, kích thước vật thể và mức tin cậy. Xem ảnh sai có xác suất cao thường phát hiện shortcut hoặc lỗi nhãn nhanh hơn nhìn loss.",
          "Softmax cao không phải bằng chứng mô hình biết đúng. Calibration kiểm tra xác suất 0.8 có đúng khoảng 80% trường hợp hay không; dữ liệu ngoài phân phối cần cơ chế phát hiện hoặc ít nhất cảnh báo phạm vi sử dụng.",
        ],
      },
    ],
    workedExamples: [
      {
        title: "Từ logits đến quyết định",
        problem: "Một ảnh có logits [2.0, 1.0, 0.0] cho ba lớp A, B, C. Tính softmax gần đúng và loss nếu nhãn đúng là B.",
        steps: [
          { state: "Trừ max: [0,-1,-2]", explanation: "Ổn định số mà không đổi softmax." },
          { state: "exp ≈ [1,0.368,0.135], tổng ≈ 1.503", explanation: "Chuyển điểm sang trọng số dương." },
          { state: "p ≈ [0.665,0.245,0.090]", explanation: "Chuẩn hóa thành phân phối." },
          { state: "L = -log(0.245) ≈ 1.407", explanation: "Mô hình đang ưu tiên sai lớp A nên loss còn lớn." },
        ],
        conclusion: "Top-1 là A dù nhãn đúng B; gradient cross-entropy sẽ hạ logit A và nâng logit B.",
        sanityChecks: ["Ba xác suất cộng xấp xỉ 1.", "Loss dương.", "Nếu tăng logit B, loss phải giảm."],
      },
    ],
    implementationChecklist: ["Xác định single-label hay multi-label.", "Group-split trước augmentation.", "Lưu preprocessing và class mapping.", "Báo cáo metric theo lớp và xem mẫu sai."],
    masteryChecklist: ["Giải thích logits, softmax và cross-entropy.", "Nhận diện data leakage.", "Chọn metric cho dữ liệu lệch lớp.", "Thiết kế một error-analysis table."],
    glossary: [
      { term: "logit", definition: "Điểm đầu ra chưa chuẩn hóa của mô hình." },
      { term: "calibration", definition: "Mức khớp giữa xác suất dự đoán và tần suất đúng thực tế." },
      { term: "shortcut", definition: "Tín hiệu phụ dễ học nhưng không phải quan hệ cần tổng quát hóa." },
      { term: "cross-entropy", definition: "Loss âm log-xác suất mà mô hình gán cho nhãn mục tiêu." },
      { term: "confusion matrix", definition: "Bảng đếm lớp thật và lớp dự đoán để phân tích kiểu nhầm lẫn." },
    ],
    sourceIds: ["ioai-2026", "d2l-vi", "vision-book"],
  },

  "cv-03-yolo": {
    lessonId: "cv-03-yolo",
    readingMinutes: 34,
    openingQuestions: ["Một detector một giai đoạn biến feature map thành box như thế nào?", "Vì sao confidence cao vẫn có thể tạo nhiều box trùng nhau?"],
    sections: [
      {
        title: "Object detection là bài toán có cấu trúc",
        paragraphs: [
          "Detector phải trả cả lớp và vị trí của số lượng vật thể thay đổi theo ảnh. Họ YOLO thực hiện dự đoán dày đặc tại nhiều vị trí và nhiều tỉ lệ, nên nhanh hơn pipeline tách region proposal thành giai đoạn riêng.",
          "Một prediction thường gồm tham số box, objectness và điểm lớp. Cách mã hóa box, anchor-free hay anchor-based và cách gán ground truth thay đổi theo phiên bản; vì vậy không nên trộn công thức của các đời YOLO rồi xem như một thuật toán duy nhất.",
        ],
      },
      {
        title: "Box, IoU và loss",
        paragraphs: [
          "Box có thể biểu diễn bằng góc hoặc tâm-kích thước. Mọi bước resize, letterbox và augmentation phải cập nhật tọa độ nhất quán. IoU đo phần giao chia phần hợp; các biến thể GIoU/DIoU/CIoU bổ sung tín hiệu khi box không giao hoặc cần xét khoảng cách tâm và tỉ lệ cạnh.",
          "Loss detector là tổ hợp localization, objectness và classification. Trọng số giữa các phần, quy tắc positive assignment và class imbalance ảnh hưởng mạnh; chỉ nhìn tổng loss không đủ để biết lỗi nằm ở định vị hay nhận lớp.",
        ],
        formulas: ["IoU(A,B) = area(A intersection B) / area(A union B)", "score = objectness * class_probability chỉ với head tách objectness; kiểm tra đúng phiên bản detector"],
      },
      {
        title: "Decode, NMS và đánh giá",
        paragraphs: [
          "Sau decode, detector có thể sinh nhiều box cùng vật thể. Non-maximum suppression giữ box điểm cao rồi loại box cùng lớp có IoU vượt ngưỡng; threshold quá thấp làm mất vật thể gần nhau, quá cao giữ trùng lặp.",
          "mAP cần được báo kèm định nghĩa ngưỡng IoU. AP50 dễ hơn AP@[.50:.95]. Phân tích theo kích thước vật thể và đường precision-recall giúp phân biệt thiếu recall do resize với false positive do nền phức tạp.",
        ],
      },
    ],
    workedExamples: [
      {
        title: "Một vòng NMS",
        problem: "Ba box cùng lớp có score A=0.90, B=0.75, C=0.60; IoU(A,B)=0.70, IoU(A,C)=0.20, ngưỡng NMS=0.50.",
        steps: [
          { state: "Chọn A", explanation: "A có score cao nhất." },
          { state: "Loại B vì 0.70 > 0.50", explanation: "B được xem là dự đoán trùng A." },
          { state: "Giữ C vì 0.20 <= 0.50", explanation: "C có thể là vật thể khác." },
        ],
        conclusion: "Output NMS gồm A và C; thay ngưỡng sẽ đổi cân bằng giữa box trùng và vật thể sát nhau.",
        sanityChecks: ["NMS không thay tọa độ box được giữ.", "NMS thường chạy theo lớp.", "Đổi thứ tự input không được đổi kết quả nếu score khác nhau."],
      },
    ],
    implementationChecklist: ["Xác nhận format và hệ tọa độ box.", "Test transform ảnh-box cùng nhau.", "Ghi rõ confidence/NMS threshold.", "Đánh giá AP theo IoU và kích thước vật thể."],
    masteryChecklist: ["Tính IoU bằng tay.", "Giải thích dense prediction.", "Mô phỏng một vòng NMS.", "Phân biệt AP50 và COCO mAP."],
    glossary: [
      { term: "objectness", definition: "Điểm thể hiện khả năng vị trí chứa một vật thể." },
      { term: "NMS", definition: "Bước hậu xử lý loại các box trùng có điểm thấp hơn." },
      { term: "mAP", definition: "Trung bình AP trên lớp và đôi khi trên nhiều ngưỡng IoU." },
      { term: "IoU", definition: "Diện tích giao chia diện tích hợp của hai bounding box." },
      { term: "confidence threshold", definition: "Ngưỡng điểm dùng loại dự đoán có độ tin cậy thấp." },
    ],
    sourceIds: ["ioai-2026", "vision-book"],
  },

  "cv-04-ssd": {
    lessonId: "cv-04-ssd",
    readingMinutes: 28,
    openingQuestions: ["Default box giúp SSD bao phủ nhiều tỉ lệ ra sao?", "Hard-negative mining giải quyết mất cân bằng nào?"],
    sections: [
      {
        title: "Dự đoán đa tỉ lệ bằng default boxes",
        paragraphs: [
          "SSD đặt nhiều default box có scale và aspect ratio khác nhau tại từng ô của nhiều feature map. Feature map độ phân giải cao phục vụ vật thể nhỏ; map sâu, thưa hơn có receptive field lớn cho vật thể lớn.",
          "Mỗi default box dự đoán offset so với box gốc và điểm lớp gồm cả background. Số đầu ra tăng theo số ô nhân số box trên ô, nên shape phải được suy ra trước khi reshape và concatenate các mức.",
        ],
      },
      {
        title: "Matching và regression",
        paragraphs: [
          "Trong train, ground-truth được ghép với default box theo IoU, đồng thời bảo đảm mỗi vật thể có ít nhất một match tốt nhất. Offset tâm thường được chuẩn hóa theo kích thước default box; chiều rộng/cao dùng log-ratio để regression ổn định hơn.",
          "Positive rất ít so với background. Hard-negative mining chọn một lượng negative có loss phân lớp lớn, thường theo tỉ lệ giới hạn với positive, thay vì để hàng nghìn negative dễ lấn át gradient.",
        ],
        formulas: ["t_x = (g_x-d_x)/d_w", "t_w = log(g_w/d_w)"],
      },
      {
        title: "Điểm mạnh, giới hạn và kiểm định",
        paragraphs: [
          "SSD có pipeline một giai đoạn đơn giản và độ trễ thấp, nhưng phiên bản gốc khó với vật thể rất nhỏ. Tăng input size có thể giúp nhưng tốn bộ nhớ; feature fusion và detector hiện đại giải quyết vấn đề theo nhiều cách khác.",
          "Kiểm định cần tách lỗi localization, confusion và background false positive. Việc default boxes không khớp phân bố tỉ lệ của dữ liệu có thể làm matching nghèo nàn ngay cả khi backbone tốt.",
        ],
      },
    ],
    workedExamples: [
      {
        title: "Đếm số dự đoán",
        problem: "Một feature map 38x38 dùng 4 default boxes mỗi ô; mỗi box xuất 4 offset và 6 logits lớp kể cả background. Tính shape phẳng cho batch 8.",
        steps: [
          { state: "38*38*4 = 5,776 boxes/ảnh", explanation: "Mỗi ô đóng góp bốn box." },
          { state: "Mỗi box có 4+6=10 số", explanation: "Regression và classification được ghép." },
          { state: "Output batch có shape [8,5776,10]", explanation: "Giữ trục box giúp decode và matching rõ ràng." },
        ],
        conclusion: "Chỉ một mức feature map đã tạo 46,208 box cho batch; đây là nguồn mất cân bằng negative.",
        sanityChecks: ["Số box không phụ thuộc số ground-truth.", "Đổi số lớp chỉ đổi trục cuối.", "Regression luôn bốn giá trị cho box 2D dạng tâm-kích thước."],
      },
    ],
    implementationChecklist: ["Sinh default boxes đúng scale/aspect ratio.", "Test encode-decode là phép nghịch đảo gần đúng.", "Bảo đảm mỗi ground-truth có match.", "Giới hạn negative theo chính sách rõ ràng."],
    masteryChecklist: ["Giải thích vai trò multi-scale maps.", "Tính số default boxes.", "Suy ra offset encode/decode.", "Phân tích vì sao hard-negative mining cần thiết."],
    glossary: [
      { term: "default box", definition: "Box tham chiếu cố định để detector dự đoán offset." },
      { term: "matching", definition: "Quy trình gán ground-truth cho prediction candidate." },
      { term: "hard negative", definition: "Mẫu nền mà mô hình hiện phân loại sai hoặc thiếu chắc chắn." },
      { term: "offset", definition: "Độ dịch và co giãn mà model dự đoán so với default box." },
      { term: "multi-scale feature", definition: "Feature map ở nhiều độ phân giải để phát hiện vật thể nhiều kích thước." },
    ],
    sourceIds: ["vision-book", "d2l-en"],
  },

  "cv-05-detr": {
    lessonId: "cv-05-detr",
    readingMinutes: 34,
    openingQuestions: ["Set prediction loại bỏ anchor và NMS bằng cách nào?", "Vì sao matching phải là một-một?"],
    sections: [
      {
        title: "Detection như dự đoán một tập hợp",
        paragraphs: [
          "DETR xem output là một tập có kích thước tối đa cố định. Backbone tạo feature map, Transformer trao đổi thông tin toàn cục, còn các object query tạo từng slot dự đoán lớp hoặc no-object cùng một box.",
          "Vì thứ tự vật thể không có ý nghĩa, loss không thể ghép prediction thứ i với ground-truth thứ i. Thuật toán Hungarian tìm phép ghép một-một có tổng chi phí thấp nhất, biến supervision tập hợp thành các cặp rõ ràng.",
        ],
      },
      {
        title: "Matching cost và training loss",
        paragraphs: [
          "Matching cost thường kết hợp chi phí lớp, L1 box và generalized IoU. Sau khi ghép, loss được tính trên các cặp; query không ghép học lớp no-object. Hệ số các phần quyết định mô hình ưu tiên đúng lớp hay đúng hình học.",
          "Một-một làm các query cạnh tranh để đại diện vật thể khác nhau, nhờ đó không cần NMS ở pipeline chuẩn. Tuy nhiên huấn luyện DETR gốc hội tụ chậm, đặc biệt với vật thể nhỏ; các biến thể dùng multi-scale và deformable attention để cải thiện.",
        ],
        formulas: ["sigma* = argmin_sigma sum_i cost(y_i, yhat_sigma(i))", "L_box = lambda_1 ||b-bhat||_1 + lambda_giou L_GIoU"],
      },
      {
        title: "Shape, mask và diễn giải query",
        paragraphs: [
          "Feature map [B,C,H,W] được chiếu về d_model rồi flatten thành [B,HW,d_model], cộng positional encoding và padding mask. Decoder nhận Q object queries, xuất [B,Q,d_model], sau đó hai head tạo logits [B,Q,K+1] và boxes [B,Q,4].",
          "Object query không phải nhãn cố định như 'query người'. Ý nghĩa slot nổi lên qua training và có thể thay đổi giữa ảnh. Debug nên theo dõi tỷ lệ no-object, matching và gradient của head box, không gán nghĩa ngữ nghĩa cứng cho chỉ số query.",
        ],
      },
    ],
    workedExamples: [
      {
        title: "Ghép hai vật thể với ba query",
        problem: "Ma trận cost giữa GT1,GT2 và Q1,Q2,Q3 là [[1,5,4],[4,2,3]]. Chọn matching một-một có tổng cost nhỏ nhất.",
        steps: [
          { state: "GT1→Q1 có cost 1", explanation: "Đây là lựa chọn tốt nhất cho GT1." },
          { state: "GT2→Q2 có cost 2", explanation: "Q2 chưa dùng và là tốt nhất cho GT2." },
          { state: "Tổng cost = 3; Q3→no-object", explanation: "Matching không cho hai GT dùng cùng query." },
        ],
        conclusion: "Loss box/lớp áp cho Q1,Q2; Q3 chỉ nhận supervision no-object.",
        sanityChecks: ["Số cặp bằng số ground-truth nếu Q đủ lớn.", "Không query nào xuất hiện trong hai cặp.", "Thử mọi hoán vị nhỏ phải không có tổng dưới 3."],
      },
    ],
    implementationChecklist: ["Theo dõi shape trước/sau flatten.", "Truyền padding mask đúng chiều.", "Tách matching cost khỏi differentiable loss.", "Kiểm tra no-object weighting và box normalization."],
    masteryChecklist: ["Giải thích set prediction.", "Làm matching nhỏ bằng tay.", "Suy ra shape Q queries.", "Nêu lý do DETR chuẩn không dùng NMS."],
    glossary: [
      { term: "object query", definition: "Vector học được dùng làm slot truy vấn vật thể trong decoder." },
      { term: "Hungarian matching", definition: "Tối ưu ghép một-một với tổng chi phí thấp nhất." },
      { term: "no-object", definition: "Lớp dành cho query không ghép với vật thể thật." },
      { term: "set prediction", definition: "Dự đoán một tập không có thứ tự thay vì chuỗi box theo vị trí cố định." },
      { term: "GIoU", definition: "Biến thể IoU cung cấp tín hiệu cả khi hai box không giao nhau." },
    ],
    sourceIds: ["ioai-2026", "vision-book"],
  },

  "cv-06-unet": {
    lessonId: "cv-06-unet",
    readingMinutes: 30,
    openingQuestions: ["Skip connection trong U-Net khôi phục chi tiết gì?", "Pixel accuracy có thể cao khi mask vật thể gần như bằng 0 không?"],
    sections: [
      {
        title: "Phân đoạn theo từng pixel",
        paragraphs: [
          "Semantic segmentation dự đoán lớp cho mỗi pixel. Encoder giảm độ phân giải để học ngữ cảnh; decoder tăng độ phân giải. U-Net nối feature encoder cùng scale vào decoder để kết hợp vị trí chi tiết với biểu diễn ngữ nghĩa sâu.",
          "Concatenation yêu cầu kích thước không gian khớp. Với convolution không padding ở U-Net gốc cần crop; với same padding vẫn phải xử lý kích thước lẻ khi pooling/upsampling. Sai một pixel có thể làm pipeline vỡ hoặc dịch mask.",
        ],
      },
      {
        title: "Loss và dữ liệu mất cân bằng",
        paragraphs: [
          "Cross-entropy theo pixel phù hợp đa lớp, BCE-with-logits phù hợp nhị phân/đa nhãn. Khi foreground nhỏ, Dice loss hoặc tổ hợp BCE+Dice tăng trọng số cho vùng cần phân đoạn; nhưng cần epsilon để tránh chia 0 và quy ước rõ với mask rỗng.",
          "Mask phải dùng nearest-neighbor khi resize để không tạo nhãn trung gian. Augmentation hình học phải áp đồng bộ ảnh-mask; color augmentation chỉ áp lên ảnh.",
        ],
        formulas: ["Dice = 2 sum_i p_i y_i / (sum_i p_i + sum_i y_i)", "IoU = TP/(TP+FP+FN)"],
      },
      {
        title: "Đánh giá biên và lỗi cấu trúc",
        paragraphs: [
          "Pixel accuracy dễ bị nền chi phối. Báo Dice/IoU theo lớp, kiểm tra ảnh có mask rỗng, và xem overlay prediction trên ảnh. Với ứng dụng coi trọng biên, thêm boundary metric hoặc khoảng cách bề mặt.",
          "Threshold sigmoid nên chọn trên validation theo mục tiêu, không mặc định 0.5 cho mọi dữ liệu. Post-processing như connected components cần được khai báo thành phần pipeline và kiểm định riêng.",
        ],
      },
    ],
    workedExamples: [
      {
        title: "Dice từ confusion counts",
        problem: "Mask nhị phân có TP=30, FP=10, FN=20. Tính Dice và IoU.",
        steps: [
          { state: "Dice = 2*30/(60+10+20)=60/90=0.667", explanation: "Mẫu số tương đương 2TP+FP+FN." },
          { state: "IoU = 30/(30+10+20)=30/60=0.500", explanation: "IoU dùng union một lần." },
          { state: "Dice = 2*IoU/(1+IoU)=1/1.5=0.667", explanation: "Kiểm tra quan hệ giữa hai metric cho cùng confusion counts." },
        ],
        conclusion: "Dice cao hơn IoU trong trường hợp trung gian này nhưng không phải lúc nào cũng cao nghiêm ngặt; chúng bằng nhau tại 0 và 1.",
        sanityChecks: ["Cả hai metric nằm trong [0,1].", "Prediction hoàn hảo cho cả hai bằng 1.", "Thêm false positive phải làm cả hai giảm."],
      },
    ],
    implementationChecklist: ["Đồng bộ transform ảnh-mask.", "Kiểm tra shape skip ở mọi scale.", "Dùng interpolation phù hợp cho mask.", "Báo metric theo lớp và xem overlay."],
    masteryChecklist: ["Vẽ được encoder-decoder và skip paths.", "Tính Dice/IoU bằng tay.", "Giải thích nhược điểm pixel accuracy.", "Xử lý mask rỗng có chủ đích."],
    glossary: [
      { term: "skip connection", definition: "Đường truyền feature từ encoder sang decoder cùng độ phân giải." },
      { term: "foreground", definition: "Vùng pixel thuộc đối tượng quan tâm." },
      { term: "Dice", definition: "Mức chồng lấp bằng hai lần giao chia tổng kích thước hai mask." },
      { term: "semantic segmentation", definition: "Gán một nhãn ngữ nghĩa cho từng pixel của ảnh." },
      { term: "upsampling", definition: "Tăng độ phân giải không gian của feature map trong decoder." },
    ],
    sourceIds: ["ioai-2026", "vision-book"],
  },

  "cv-07-resnet-transfer": {
    lessonId: "cv-07-resnet-transfer",
    readingMinutes: 31,
    openingQuestions: ["Residual block làm tối ưu mạng sâu dễ hơn như thế nào?", "Khi nào nên freeze backbone và khi nào phải fine-tune?"],
    sections: [
      {
        title: "Học phần dư thay vì ánh xạ trực tiếp",
        paragraphs: [
          "Residual block biểu diễn y = F(x)+x khi shape khớp. Đường identity tạo tuyến truyền tín hiệu và gradient ngắn hơn, giúp mạng sâu tối ưu dễ hơn; nó không bảo đảm gradient không bao giờ triệt tiêu vì Jacobian I+J_F vẫn phụ thuộc F.",
          "Khi đổi số kênh hoặc stride, shortcut cần projection, thường convolution 1x1. Phép cộng bắt buộc hai nhánh cùng shape; lỗi projection là lỗi cấu trúc, không thể sửa bằng broadcasting tùy tiện.",
        ],
        formulas: ["y = F(x;W) + x", "dy/dx = I + dF/dx"],
      },
      {
        title: "Transfer learning có kiểm soát",
        paragraphs: [
          "Pretrained backbone cung cấp feature đã học từ dữ liệu lớn. Linear probing đóng băng backbone và chỉ học head để kiểm tra độ phù hợp của biểu diễn. Fine-tuning mở một phần hoặc toàn bộ backbone với learning rate thường nhỏ hơn head.",
          "Normalization là điểm dễ sai: input phải theo preprocessing của weights; BatchNorm khi freeze cần quyết định có cập nhật running statistics hay không. Dữ liệu đích quá khác nguồn có thể cần mở nhiều block hơn hoặc pretraining phù hợp miền.",
        ],
      },
      {
        title: "Thiết kế thí nghiệm và tránh rò rỉ",
        paragraphs: [
          "So sánh ít nhất baseline train-from-scratch, frozen backbone và fine-tune trong cùng split/metric. Chỉ thay một biến mỗi thí nghiệm, lưu seed, checkpoint và lịch learning rate.",
          "Early stopping và chọn hyperparameter dùng validation; test chỉ mở một lần ở kết luận. Nếu dùng test để quyết định số block mở, test đã trở thành validation và kết quả bị lạc quan.",
        ],
      },
    ],
    workedExamples: [
      {
        title: "Đếm tham số head mới",
        problem: "Backbone ResNet xuất vector 2048 chiều. Bài toán mới có 5 lớp; head là Linear(2048,5). Tính số tham số trainable khi chỉ học head.",
        steps: [
          { state: "Trọng số: 2048*5 = 10,240", explanation: "Mỗi lớp có một vector 2048 chiều." },
          { state: "Bias: 5", explanation: "Một bias cho mỗi logit." },
          { state: "Tổng = 10,245", explanation: "Backbone đã freeze nên không tính vào trainable parameters." },
        ],
        conclusion: "Linear probing chỉ tối ưu 10,245 tham số dù toàn model có hàng triệu tham số.",
        sanityChecks: ["Output head có shape [B,5].", "Optimizer chỉ nhận requires_grad=true.", "Backbone không có gradient sau backward."],
      },
    ],
    implementationChecklist: ["Dùng preprocessing đúng weights.", "Thay head đúng input dimension.", "Kiểm tra optimizer không chứa phần đã freeze.", "So frozen, fine-tune và scratch công bằng."],
    masteryChecklist: ["Giải thích residual Jacobian không tuyệt đối hóa.", "Nhận biết khi cần projection shortcut.", "Phân biệt linear probing và fine-tuning.", "Thiết kế ablation về số block mở."],
    glossary: [
      { term: "residual", definition: "Phần biến đổi F(x) được cộng với shortcut." },
      { term: "linear probing", definition: "Đánh giá biểu diễn bằng head tuyến tính khi backbone bị đóng băng." },
      { term: "fine-tuning", definition: "Tiếp tục tối ưu weights pretrained trên dữ liệu đích." },
      { term: "projection shortcut", definition: "Phép chiếu trên nhánh tắt để khớp shape trước phép cộng." },
      { term: "backbone", definition: "Phần mạng trích xuất feature trước head của nhiệm vụ đích." },
    ],
    sourceIds: ["d2l-vi", "vision-book", "pml-advanced"],
  },

  "cv-08-augmentation": {
    lessonId: "cv-08-augmentation",
    readingMinutes: 27,
    openingQuestions: ["Biến đổi nào thực sự giữ nguyên nhãn trong miền dữ liệu này?", "Làm sao biết augmentation đang regularize chứ không phá dữ liệu?"],
    sections: [
      {
        title: "Augmentation là giả định về bất biến",
        paragraphs: [
          "Mỗi phép augmentation nói rằng nhãn nên không đổi dưới một biến đổi. Horizontal flip hợp lý với nhiều vật thể tự nhiên nhưng sai với chữ, biển báo bất đối xứng hoặc ảnh y khoa có bên trái/phải. Vì vậy policy phải xuất phát từ cơ chế sinh dữ liệu, không từ danh sách mặc định.",
          "Biến đổi hình học tác động cả ảnh và annotation. Với detection phải cập nhật box rồi clip/loại box mất diện tích; với segmentation phải biến đổi mask bằng nội suy nhãn; với keypoint cần đổi tọa độ và đôi khi đổi danh tính trái-phải.",
        ],
      },
      {
        title: "Mixup, CutMix và label mềm",
        paragraphs: [
          "Mixup nội suy hai ảnh và hai nhãn; CutMix dán một vùng ảnh và trộn nhãn theo diện tích. Chúng làm biên quyết định mượt hơn nhưng thay đổi cách đọc loss và calibration. Label phải là phân phối mềm, không argmax trở lại trước loss.",
          "Augmentation mạnh không thay thế dữ liệu sạch. Nếu train accuracy giảm nhẹ nhưng validation tốt hơn có thể là regularization; nếu cả hai giảm và mẫu biến đổi vô lý, policy có thể quá mạnh hoặc sai miền.",
        ],
        formulas: ["x_tilde = lambda x_i + (1-lambda) x_j", "y_tilde = lambda y_i + (1-lambda) y_j"],
      },
      {
        title: "Đo hiệu quả bằng ablation",
        paragraphs: [
          "Giữ nguyên split, seed, lịch train và model; so no augmentation, từng phép riêng, rồi policy kết hợp. Báo trung bình nhiều seed khi chênh lệch nhỏ. Xem metric theo subgroup để tránh policy cải thiện tổng nhưng làm hại nhóm quan trọng.",
          "Validation và test không được dùng stochastic train augmentation. Test-time augmentation là kỹ thuật khác: chạy nhiều view rồi gộp dự đoán, phải tính cả độ trễ và quy tắc aggregation.",
        ],
      },
    ],
    workedExamples: [
      {
        title: "Nhãn Mixup cụ thể",
        problem: "Trộn ảnh mèo nhãn [1,0,0] và chó [0,1,0] với lambda=0.7. Tính nhãn mới và cross-entropy nếu model dự đoán p=[0.6,0.3,0.1].",
        steps: [
          { state: "y_tilde=[0.7,0.3,0]", explanation: "Nhãn giữ cùng hệ số trộn như ảnh." },
          { state: "L=-0.7 log(0.6)-0.3 log(0.3)", explanation: "Cross-entropy hỗ trợ phân phối mục tiêu mềm." },
          { state: "L≈0.719", explanation: "Dùng log tự nhiên: 0.3576+0.3612." },
        ],
        conclusion: "Không được đổi nhãn thành mèo one-hot; làm vậy bỏ mất supervision từ ảnh chó.",
        sanityChecks: ["Các phần tử nhãn cộng bằng 1.", "Lambda=1 khôi phục mẫu đầu.", "Loss hữu hạn vì các xác suất dương."],
      },
    ],
    implementationChecklist: ["Chứng minh mỗi transform giữ nhãn.", "Biến đổi annotation đồng bộ.", "Quan sát batch sau transform.", "Ablation policy trên cùng split/seed."],
    masteryChecklist: ["Nêu augmentation sai cho một miền cụ thể.", "Tính nhãn Mixup.", "Phân biệt train augmentation và TTA.", "Đọc learning curve khi augmentation quá mạnh."],
    glossary: [
      { term: "invariance assumption", definition: "Giả định nhãn không đổi dưới một phép biến đổi." },
      { term: "Mixup", definition: "Nội suy hai input và hai nhãn bằng cùng hệ số." },
      { term: "ablation", definition: "Thí nghiệm cô lập đóng góp của một thành phần." },
      { term: "CutMix", definition: "Dán vùng của ảnh khác và trộn nhãn theo tỷ lệ diện tích." },
      { term: "test-time augmentation", definition: "Gộp dự đoán từ nhiều biến thể input ở thời điểm suy luận." },
    ],
    sourceIds: ["d2l-en", "vision-book"],
  },

  "cv-09-gan": {
    lessonId: "cv-09-gan",
    readingMinutes: 34,
    openingQuestions: ["Vì sao GAN là một trò chơi tối ưu thay vì một loss đơn?", "Mode collapse trông như thế nào trong sample và metric?"],
    sections: [
      {
        title: "Generator và discriminator",
        paragraphs: [
          "Generator G biến nhiễu z thành mẫu giả; discriminator D phân biệt dữ liệu thật và giả. Hai mạng tối ưu mục tiêu đối kháng: D cải thiện ranh giới, G tạo mẫu làm D nhầm. Điểm cân bằng lý tưởng không có nghĩa D luôn thua mà là phân phối giả trùng phân phối thật và D không thể phân biệt tốt hơn ngẫu nhiên.",
          "Loss minimax gốc có thể làm gradient G yếu khi D quá tốt. Non-saturating loss thường tối ưu -log D(G(z)) cho G để có tín hiệu mạnh hơn. Các họ Wasserstein thay divergence và ràng buộc critic nhằm cải thiện hình học tối ưu.",
        ],
        formulas: ["min_G max_D E_x log D(x) + E_z log(1-D(G(z)))", "L_G,NS = -E_z log D(G(z))"],
      },
      {
        title: "Động lực huấn luyện và lỗi phổ biến",
        paragraphs: [
          "GAN nhạy với tỉ lệ learning rate, normalization, capacity và số bước D/G. Loss không đơn điệu như supervised learning; D loss thấp chưa chắc sample tốt. Luôn lưu sample theo latent cố định để theo dõi tiến triển nhất quán.",
          "Mode collapse xảy ra khi nhiều z tạo các output giống nhau, đạt chất lượng cục bộ nhưng thiếu đa dạng. Checkerboard artifact thường liên quan transposed convolution; upsample rồi convolution là một lựa chọn kiểm soát hơn.",
        ],
      },
      {
        title: "Đánh giá mô hình sinh",
        paragraphs: [
          "Không đánh giá bằng vài ảnh đẹp. Cần kiểm tra chất lượng, đa dạng, memorization và subgroup. FID so thống kê feature giữa hai tập nhưng phụ thuộc feature extractor, số mẫu và preprocessing; không nên so số FID từ pipeline khác nhau.",
          "Nearest-neighbor với train data giúp phát hiện sao chép thô nhưng không chứng minh riêng tư. Với dữ liệu nhạy cảm cần đánh giá privacy chuyên biệt.",
        ],
      },
    ],
    workedExamples: [
      {
        title: "Một batch loss non-saturating",
        problem: "D cho hai ảnh giả xác suất thật [0.2,0.5]. Tính generator loss trung bình -mean(log D(G(z))).",
        steps: [
          { state: "-log(0.2)≈1.609", explanation: "Mẫu đầu bị D nhận ra giả mạnh nên phạt lớn." },
          { state: "-log(0.5)≈0.693", explanation: "Mẫu thứ hai đánh lừa D tốt hơn." },
          { state: "L_G≈(1.609+0.693)/2=1.151", explanation: "Lấy trung bình batch." },
        ],
        conclusion: "G nhận gradient khuyến khích tăng xác suất thật của cả hai mẫu.",
        sanityChecks: ["D(G(z)) tiến về 1 thì loss tiến về 0.", "Không lấy log của logit chưa sigmoid nếu dùng công thức xác suất.", "Dùng BCE-with-logits để ổn định số trong code."],
      },
    ],
    implementationChecklist: ["Tách optimizer G và D.", "Detach fake khi cập nhật D.", "Lưu fixed latent samples.", "Theo dõi đa dạng và memorization ngoài loss."],
    masteryChecklist: ["Mô tả trò chơi minimax.", "Giải thích non-saturating loss.", "Nhận diện mode collapse.", "Nêu giới hạn của FID."],
    glossary: [
      { term: "mode collapse", definition: "Generator chỉ tạo một phần nhỏ các kiểu dữ liệu có thể có." },
      { term: "critic", definition: "Mạng cho điểm trong một số biến thể GAN, không nhất thiết là xác suất." },
      { term: "FID", definition: "Khoảng cách giữa thống kê Gaussian của feature thật và giả." },
      { term: "generator", definition: "Mạng biến latent noise thành mẫu dữ liệu giả." },
      { term: "discriminator", definition: "Mạng học phân biệt mẫu thật với mẫu do generator tạo." },
    ],
    sourceIds: ["d2l-en", "pml-advanced", "vision-book"],
  },

  "cv-10-self-supervised": {
    lessonId: "cv-10-self-supervised",
    readingMinutes: 33,
    openingQuestions: ["Positive pair phải giữ lại thông tin nào và bỏ thông tin nào?", "Collapse biểu diễn là gì và các phương pháp tránh nó ra sao?"],
    sections: [
      {
        title: "Học biểu diễn không cần nhãn thủ công",
        paragraphs: [
          "Self-supervised learning tạo tín hiệu giám sát từ chính dữ liệu. Trong contrastive learning, hai view của cùng ảnh là positive và các ảnh khác thường là negative; encoder được học để positive gần nhau và negative xa nhau trong không gian biểu diễn.",
          "Augmentation định nghĩa invariance. Nếu crop làm mất đối tượng hoặc màu là tín hiệu lớp quan trọng, positive pair có thể trở nên sai. Policy tốt phụ thuộc domain và nhiệm vụ downstream.",
        ],
      },
      {
        title: "InfoNCE, temperature và batch",
        paragraphs: [
          "InfoNCE biến similarity thành bài toán phân loại positive giữa candidates. Temperature nhỏ làm phân phối sắc và nhấn mạnh hard negatives nhưng có thể gây gradient cực đoan. Nhiều negatives giúp nhưng tăng batch/memory; queue hoặc memory bank là giải pháp thay thế.",
          "Các phương pháp không negative tránh collapse bằng kiến trúc bất đối xứng, stop-gradient, predictor, momentum teacher hoặc regularization variance/covariance. Không thể chỉ bỏ negative mà giữ mọi thứ khác rồi mong biểu diễn hữu ích.",
        ],
        formulas: ["L_i = -log exp(sim(z_i,z_j)/tau) / sum_{k!=i} exp(sim(z_i,z_k)/tau)"],
      },
      {
        title: "Đánh giá representation",
        paragraphs: [
          "Linear probe đo khả năng tách lớp khi encoder freeze; fine-tuning đo khả năng thích nghi cuối. k-NN trên embedding là kiểm tra nhanh. Cả ba cần split sạch và preprocessing nhất quán.",
          "Đánh giá thêm retrieval, transfer ít nhãn và robustness. Loss pretraining thấp không đảm bảo downstream tốt nếu shortcut augmentation hoặc false negatives chi phối.",
        ],
      },
    ],
    workedExamples: [
      {
        title: "InfoNCE cho một anchor",
        problem: "Similarity đã chia temperature của anchor với positive và hai negative lần lượt là [2,1,0]. Tính xác suất positive và loss.",
        steps: [
          { state: "exp scores≈[7.389,2.718,1]", explanation: "Softmax trên ba candidate." },
          { state: "p_pos=7.389/11.107≈0.665", explanation: "Positive nhận khoảng hai phần ba xác suất." },
          { state: "L=-log(0.665)≈0.408", explanation: "Loss giảm khi positive tách xa negatives." },
        ],
        conclusion: "Tăng similarity positive hoặc giảm similarity negative đều làm InfoNCE giảm.",
        sanityChecks: ["Xác suất candidates cộng 1.", "Nếu mọi score bằng nhau, loss=log 3.", "Similarity cần cùng quy ước normalization."],
      },
    ],
    implementationChecklist: ["Tạo hai view độc lập đúng domain.", "L2-normalize nếu dùng dot product như cosine.", "Ngăn self-pair trong denominator.", "Đánh giá linear probe và fine-tune."],
    masteryChecklist: ["Giải thích vai trò augmentation.", "Tính InfoNCE nhỏ bằng tay.", "Mô tả collapse và một cơ chế chống collapse.", "Phân biệt pretext loss với downstream quality."],
    glossary: [
      { term: "positive pair", definition: "Hai view được coi là cùng nội dung ngữ nghĩa cần giữ." },
      { term: "temperature", definition: "Hệ số điều khiển độ sắc của softmax similarity." },
      { term: "collapse", definition: "Trạng thái encoder xuất biểu diễn gần như giống nhau cho mọi input." },
      { term: "InfoNCE", definition: "Objective contrastive nhận diện positive giữa các candidate bằng softmax similarity." },
      { term: "linear probe", definition: "Head tuyến tính học trên encoder đã đóng băng để đo chất lượng biểu diễn." },
    ],
    sourceIds: ["vision-book", "pml-advanced"],
  },

  "cv-11-clip": {
    lessonId: "cv-11-clip",
    readingMinutes: 34,
    openingQuestions: ["CLIP đưa ảnh và văn bản vào cùng không gian bằng tín hiệu nào?", "Vì sao zero-shot accuracy thay đổi khi đổi prompt?"],
    sections: [
      {
        title: "Hai encoder và không gian chung",
        paragraphs: [
          "CLIP-style training dùng image encoder và text encoder. Trong một batch các cặp ảnh-caption, cặp cùng chỉ số là positive; mọi cặp chéo còn lại làm negative. Embedding được chuẩn hóa, ma trận similarity BxB cung cấp logits cho hai hướng image-to-text và text-to-image.",
          "Mục tiêu hai chiều tránh chỉ học retrieval một phía. Logit scale tương đương nghịch đảo temperature và thường được học; cần clamp hợp lý để tránh logits quá cực đoan.",
        ],
        formulas: ["S_ij = exp(s) * normalize(v_i)^T normalize(t_j)", "L = (CE_rows(S)+CE_cols(S))/2"],
      },
      {
        title: "Zero-shot classification bằng prompt",
        paragraphs: [
          "Mỗi tên lớp được đặt vào template như 'một ảnh của {class}', qua text encoder tạo prototype. Ảnh được so cosine với prototypes rồi softmax. Đây là classification thông qua retrieval, không phải head lớp đã train trên dataset đích.",
          "Prompt thay đổi ngữ cảnh ngôn ngữ và vì thế thay prototype. Prompt ensembling lấy trung bình nhiều embedding template để giảm nhạy cảm câu chữ. Tên lớp mơ hồ cần mô tả giàu ngữ cảnh nhưng không được chứa thông tin test ngoài phạm vi.",
        ],
      },
      {
        title: "Giới hạn và đánh giá đa phương thức",
        paragraphs: [
          "Caption web có nhiễu và thiên lệch; mô hình có thể dựa vào chữ trong ảnh, watermark hoặc tương quan xã hội. Zero-shot mạnh không loại bỏ nhu cầu đánh giá subgroup, domain shift và prompt sensitivity.",
          "Retrieval dùng Recall@K; classification dùng metric theo lớp và calibration. Luôn cache text embeddings đúng model/tokenizer và kiểm tra thứ tự class-prototype trước khi suy luận.",
        ],
      },
    ],
    workedExamples: [
      {
        title: "Zero-shot với ba prototype",
        problem: "Cosine similarity của ảnh với 'mèo','chó','xe' là [0.30,0.20,-0.10], logit scale=10. Tính dự đoán softmax gần đúng.",
        steps: [
          { state: "Logits=[3,2,-1]", explanation: "Nhân similarity với logit scale." },
          { state: "Trừ max→[0,-1,-4], exp≈[1,0.368,0.018]", explanation: "Ổn định số." },
          { state: "p≈[0.721,0.265,0.013]", explanation: "Chuẩn hóa ba trọng số." },
        ],
        conclusion: "Ảnh được gán lớp mèo, nhưng xác suất phụ thuộc cả scale và prompt tạo prototype.",
        sanityChecks: ["Thứ tự prototype phải trùng class labels.", "Embeddings được normalize trước dot product.", "Xác suất cộng xấp xỉ 1."],
      },
    ],
    implementationChecklist: ["Dùng đúng cặp model-tokenizer-preprocess.", "Normalize cả hai embedding.", "Kiểm tra ma trận similarity BxB và labels đường chéo.", "Đánh giá nhiều prompt và subgroup."],
    masteryChecklist: ["Vẽ pipeline hai encoder.", "Giải thích loss hai chiều.", "Tạo zero-shot prototypes.", "Nêu hai nguồn bias/prompt sensitivity."],
    glossary: [
      { term: "prototype", definition: "Embedding văn bản đại diện cho một lớp ở zero-shot classification." },
      { term: "logit scale", definition: "Hệ số khuếch đại similarity trước softmax." },
      { term: "Recall@K", definition: "Tỷ lệ truy vấn có kết quả đúng trong K vị trí đầu." },
      { term: "dual encoder", definition: "Kiến trúc mã hóa hai modality bằng hai encoder rồi so embedding." },
      { term: "prompt ensemble", definition: "Gộp nhiều template văn bản để tạo prototype lớp ổn định hơn." },
    ],
    sourceIds: ["ioai-2026", "vision-book", "nlp-representation"],
  },

  "cv-12-diffusion": {
    lessonId: "cv-12-diffusion",
    readingMinutes: 37,
    openingQuestions: ["Forward process thêm nhiễu theo lịch nào?", "Mô hình dự đoán noise liên quan gì tới việc phục hồi ảnh?"],
    sections: [
      {
        title: "Forward diffusion có công thức đóng",
        paragraphs: [
          "Forward process thêm Gaussian noise theo beta_t, với alpha_t=1-beta_t và alpha_bar_t là tích lũy. Nhờ tính chất Gaussian, có thể lấy trực tiếp x_t từ x_0 ở bất kỳ timestep thay vì mô phỏng toàn chuỗi.",
          "Lịch noise quyết định signal-to-noise ratio theo thời gian. Nếu beta quá lớn sớm, tín hiệu bị phá nhanh; nếu quá nhỏ, chuỗi dài và sampling tốn kém.",
        ],
        formulas: ["q(x_t|x_0)=N(sqrt(alpha_bar_t)x_0,(1-alpha_bar_t)I)", "x_t=sqrt(alpha_bar_t)x_0+sqrt(1-alpha_bar_t)epsilon"],
      },
      {
        title: "Reverse model và mục tiêu dự đoán",
        paragraphs: [
          "U-Net có điều kiện timestep nhận x_t và dự đoán epsilon, x_0 hoặc một tham số hóa tương đương. Mục tiêu epsilon-prediction cơ bản là MSE giữa nhiễu thật và nhiễu dự đoán. Timestep embedding cho mạng biết mức nhiễu đang xử lý.",
          "Conditional diffusion thêm class/text embedding qua attention hoặc conditioning khác. Classifier-free guidance kết hợp dự đoán có điều kiện và không điều kiện; guidance cao tăng bám prompt nhưng có thể giảm đa dạng và làm màu/chi tiết cực đoan.",
        ],
        formulas: ["L_simple=E||epsilon-epsilon_theta(x_t,t,c)||^2", "eps_guided=eps_uncond+w(eps_cond-eps_uncond)"],
      },
      {
        title: "Sampling, kiểm định và trách nhiệm",
        paragraphs: [
          "Sampling lặp từ noise về dữ liệu nên chậm hơn generator một bước. DDIM và solver nhanh giảm số bước nhưng tạo trade-off chất lượng. Seed, scheduler, số bước và guidance phải được lưu để tái lập.",
          "Đánh giá cần chất lượng, đa dạng, prompt alignment, memorization và bias. Với ảnh sinh, provenance và quyền dữ liệu là một phần kỹ thuật triển khai, không chỉ vấn đề giao diện.",
        ],
      },
    ],
    workedExamples: [
      {
        title: "Tạo x_t từ một pixel",
        problem: "Một giá trị chuẩn hóa x0=0.8, alpha_bar_t=0.64 và mẫu noise epsilon=-0.5. Tính x_t.",
        steps: [
          { state: "sqrt(alpha_bar)=0.8", explanation: "Phần tín hiệu giữ lại." },
          { state: "sqrt(1-alpha_bar)=sqrt(0.36)=0.6", explanation: "Độ lệch chuẩn phần noise." },
          { state: "x_t=0.8*0.8+0.6*(-0.5)=0.64-0.30=0.34", explanation: "Kết hợp tín hiệu và nhiễu." },
        ],
        conclusion: "Tại timestep này pixel còn 0.64 đóng góp tín hiệu và -0.30 nhiễu cụ thể.",
        sanityChecks: ["alpha_bar nằm trong [0,1].", "Khi alpha_bar→1, x_t→x0.", "Khi alpha_bar→0, x_t gần noise."],
      },
    ],
    implementationChecklist: ["Chuẩn hóa dữ liệu đúng range.", "Lấy timestep/noise độc lập cho batch.", "Kiểm tra broadcast hệ số theo shape.", "Lưu scheduler, seed, steps và guidance."],
    masteryChecklist: ["Suy ra x_t từ x0 và epsilon.", "Giải thích timestep conditioning.", "Phân biệt forward train và reverse sampling.", "Mô tả trade-off classifier-free guidance."],
    glossary: [
      { term: "noise schedule", definition: "Chuỗi mức nhiễu quy định forward process." },
      { term: "denoiser", definition: "Mạng ước lượng noise hoặc tín hiệu sạch từ trạng thái nhiễu." },
      { term: "guidance", definition: "Cơ chế tăng ảnh hưởng của điều kiện khi sampling." },
      { term: "timestep embedding", definition: "Vector cho model biết mức nhiễu hiện tại của mẫu." },
      { term: "classifier-free guidance", definition: "Kết hợp dự đoán có và không điều kiện để tăng độ bám điều kiện." },
    ],
    sourceIds: ["pml-advanced", "vision-book"],
  },

  "cv-13-vision-transformer": {
    lessonId: "cv-13-vision-transformer",
    readingMinutes: 35,
    openingQuestions: ["Một ảnh trở thành chuỗi token bằng cách nào?", "Chi phí attention tăng theo số patch ra sao?"],
    sections: [
      {
        title: "Patchification và embedding",
        paragraphs: [
          "Vision Transformer chia ảnh HxW thành các patch PxP không chồng lấp, flatten mỗi patch C*P*P rồi chiếu tuyến tính sang d_model. Số patch N=(H/P)(W/P); có thể thêm class token và positional embeddings.",
          "Patch projection tương đương convolution kernel=P, stride=P. Patch lớn giảm N và chi phí nhưng mất chi tiết; patch nhỏ giữ chi tiết nhưng attention O(N^2) tốn bộ nhớ.",
        ],
        formulas: ["N=(H/P)(W/P)", "tokens = reshape(image_patches) W_E + E_pos"],
      },
      {
        title: "Self-attention trên token ảnh",
        paragraphs: [
          "Mỗi block dùng multi-head self-attention, MLP, residual và normalization. Attention cho phép patch tương tác toàn cục ngay từ lớp đầu, khác inductive bias cục bộ mạnh của CNN; đổi lại ViT thường cần nhiều dữ liệu hoặc pretraining.",
          "Positional information là cần thiết để phân biệt bố cục. Khi đổi độ phân giải, learned positional embeddings có thể cần nội suy theo lưới patch; class token không thuộc lưới nên xử lý riêng.",
        ],
        formulas: ["Attention(Q,K,V)=softmax(QK^T/sqrt(d_k))V"],
      },
      {
        title: "Fine-tuning và kiểm soát shape",
        paragraphs: [
          "Pipeline pretrained phải khớp kích thước, normalization và cách resize. Fine-tuning có thể dùng class token hoặc pooling token tùy checkpoint. Không nên giả định mọi ViT có cùng head hay positional encoding.",
          "Debug theo chuỗi shape: [B,C,H,W] → [B,N,d] → [B,N+1,d] → [B,K]. Attention map chỉ là một tín hiệu diễn giải, không tự động là lời giải nhân quả cho quyết định.",
        ],
      },
    ],
    workedExamples: [
      {
        title: "Đếm token và ma trận attention",
        problem: "Ảnh 224x224, patch 16x16, thêm một class token, batch 8, d_model=768. Tính token shape và kích thước attention mỗi head.",
        steps: [
          { state: "224/16=14 patch mỗi chiều", explanation: "Ảnh chia hết cho patch size." },
          { state: "N=14*14=196; thêm CLS→197", explanation: "Class token tăng chiều chuỗi một." },
          { state: "Token tensor [8,197,768]", explanation: "Mỗi token có embedding 768 chiều." },
          { state: "Attention/head [8,197,197]", explanation: "Mỗi query token so với mọi key token." },
        ],
        conclusion: "Mỗi head lưu 8*197^2≈310 nghìn score trước khi tính nhiều lớp/head.",
        sanityChecks: ["N phải là số nguyên khi không pad/crop.", "CLS không được nội suy như patch grid.", "Softmax attention theo trục key cộng bằng 1."],
      },
    ],
    implementationChecklist: ["Xác nhận image/patch size và preprocessing.", "Assert chuỗi shape patch→tokens.", "Xử lý positional embedding khi đổi resolution.", "Theo dõi bộ nhớ theo N^2."],
    masteryChecklist: ["Tính số patch/token.", "Giải thích patch projection.", "So inductive bias ViT và CNN.", "Suy ra shape attention nhiều head."],
    glossary: [
      { term: "patch token", definition: "Vector biểu diễn một vùng ảnh cố định." },
      { term: "class token", definition: "Token học được dùng tổng hợp biểu diễn cho phân loại ở nhiều ViT." },
      { term: "positional embedding", definition: "Tín hiệu mã hóa vị trí token trong lưới/chuỗi." },
      { term: "patch projection", definition: "Phép chiếu mỗi patch phẳng sang chiều embedding của Transformer." },
      { term: "self-attention", definition: "Cơ chế mỗi token tổng hợp thông tin từ các token cùng chuỗi." },
    ],
    sourceIds: ["ioai-2026", "d2l-en", "vision-book"],
  },
} satisfies LessonTheoryMap;
