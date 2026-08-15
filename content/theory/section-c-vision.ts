/**
 * Section C — Computer Vision: tích chập, phân loại ảnh, phát hiện đối tượng,
 * phân đoạn, encoder thị giác tiền huấn luyện, tăng cường ảnh, GAN, học tự giám
 * sát cho thị giác, encoder ảnh–văn bản (CLIP) và mô hình khuếch tán.
 *
 * Mỗi mục syllabus có 5 câu: 1 Nhận biết, 1 Thông hiểu, 2 Vận dụng,
 * 1 Vận dụng cao.
 */

import type { TheoryQuestion } from "./types";

export const sectionCQuestions: readonly TheoryQuestion[] = [
  /* ---------------- convolution ---------------- */
  {
    id: "convolution-01",
    syllabusId: "convolution",
    difficulty: "recall",
    format: "single-choice",
    stem: "Đặc điểm nào định nghĩa một lớp tích chập so với lớp fully connected?",
    choices: [
      "Cùng một bộ trọng số (kernel) được dùng lại ở mọi vị trí không gian, và mỗi đầu ra chỉ nối với một vùng cục bộ của đầu vào.",
      "Mỗi nơ-ron nối với toàn bộ pixel của ảnh.",
      "Trọng số được cố định và không học được.",
      "Lớp tích chập không có bias.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: chia sẻ trọng số và kết nối cục bộ là hai đặc trưng cốt lõi.",
      "Sai: đó chính là lớp fully connected.",
      "Sai: kernel là tham số học được.",
      "Sai: lớp tích chập thường vẫn có bias theo từng kênh đầu ra.",
    ],
    explanation:
      "Chia sẻ trọng số vừa giảm mạnh số tham số vừa mã hoá giả định rằng một đặc trưng hữu ích ở góc trên trái cũng hữu ích ở góc dưới phải.",
  },
  {
    id: "convolution-02",
    syllabusId: "convolution",
    difficulty: "understand",
    format: "single-choice",
    stem: "Vì sao CNN phù hợp với ảnh hơn MLP?",
    choices: [
      "Vì CNN có nhiều tham số hơn nên biểu diễn mạnh hơn.",
      "Vì CNN khai thác cấu trúc không gian: kết nối cục bộ, chia sẻ trọng số và tương đương tịnh tiến, nên cần ít tham số hơn và tổng quát hoá tốt hơn.",
      "Vì CNN không cần hàm kích hoạt.",
      "Vì CNN xử lý ảnh màu còn MLP chỉ xử lý ảnh xám.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: CNN thường có *ít* tham số hơn MLP tương đương cho cùng đầu vào ảnh.",
      "Đúng: đây là ba inductive bias khiến CNN học hiệu quả trên dữ liệu ảnh.",
      "Sai: CNN vẫn dùng ReLU và các hàm phi tuyến khác.",
      "Sai: cả hai đều xử lý được ảnh màu.",
    ],
    explanation:
      "Inductive bias là kiến thức về bài toán được gắn sẵn vào kiến trúc. Bias đúng cho phép học tốt từ ít dữ liệu hơn — đây là lý do CNN thắng MLP trên ảnh.",
  },
  {
    id: "convolution-03",
    syllabusId: "convolution",
    difficulty: "apply",
    format: "numeric",
    stem: "Ảnh đầu vào 32×32, tích chập kernel 5×5, stride 1, không padding. Kích thước một cạnh của feature map đầu ra là bao nhiêu?",
    answer: 28,
    tolerance: 0,
    calculation: [
      "Công thức: ⌊(W + 2P − K)/S⌋ + 1.",
      "= ⌊(32 + 0 − 5)/1⌋ + 1 = 27 + 1 = 28.",
    ],
    explanation:
      "Công thức này phải thuộc lòng vì nó xuất hiện ở mọi bài tính shape. Muốn giữ nguyên kích thước với stride 1, chọn padding P = (K − 1)/2, tức P = 2 cho kernel 5×5.",
  },
  {
    id: "convolution-04",
    syllabusId: "convolution",
    difficulty: "apply",
    format: "numeric",
    stem: "`Conv2d(in_channels=3, out_channels=16, kernel_size=3)` có bao nhiêu tham số học được (tính cả bias)?",
    answer: 448,
    tolerance: 0,
    calculation: [
      "Mỗi kernel có kích thước 3 (kênh vào) × 3 × 3 = 27 trọng số.",
      "Có 16 kênh đầu ra: 16 × 27 = 432.",
      "Bias: một giá trị cho mỗi kênh đầu ra = 16. Tổng: 432 + 16 = 448.",
    ],
    explanation:
      "Chú ý số tham số **không** phụ thuộc kích thước ảnh — đó chính là hệ quả của việc chia sẻ trọng số, và là khác biệt lớn nhất so với lớp fully connected.",
  },
  {
    id: "convolution-05",
    syllabusId: "convolution",
    difficulty: "advanced",
    format: "single-choice",
    stem: "Tích chập 1×1 có tác dụng gì, khi nó không nhìn được vùng lân cận không gian nào?",
    choices: [
      "Không có tác dụng gì, chỉ sao chép đầu vào.",
      "Trộn thông tin giữa các kênh tại từng vị trí và thay đổi số kênh, nên dùng để giảm chiều kênh trước các phép tích chập đắt đỏ và thêm phi tuyến.",
      "Làm tăng độ phân giải không gian.",
      "Thay thế hoàn toàn cho pooling.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: nó là tổ hợp tuyến tính có trọng số học được trên chiều kênh.",
      "Đúng: đây là “bottleneck” trong ResNet và Inception.",
      "Sai: nó không đổi kích thước không gian.",
      "Sai: nó không giảm chiều không gian.",
    ],
    trap: "Bẫy là nghĩ theo chiều không gian và kết luận 1×1 vô dụng. Phải nhớ tích chập luôn tác động trên *toàn bộ* chiều kênh của đầu vào.",
    explanation:
      "Ví dụ cụ thể: giảm 256 kênh xuống 64 bằng 1×1 trước khi làm tích chập 3×3 rồi nâng lại 256. Cách này giảm chi phí nhiều lần so với 3×3 trực tiếp trên 256 kênh.",
  },

  /* ---------------- image-classification ---------------- */
  {
    id: "image-classification-01",
    syllabusId: "image-classification",
    difficulty: "recall",
    format: "single-choice",
    stem: "Lớp đầu ra tiêu chuẩn của mô hình phân loại ảnh nhiều lớp (mỗi ảnh một nhãn) dùng gì?",
    choices: [
      "Softmax trên số nơ-ron bằng số lớp, huấn luyện bằng cross-entropy.",
      "Sigmoid trên một nơ-ron duy nhất.",
      "Hàm tuyến tính không kích hoạt, huấn luyện bằng MSE.",
      "ReLU trên số nơ-ron bằng số lớp.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: softmax cho phân phối xác suất trên các lớp loại trừ lẫn nhau.",
      "Sai: đó là cấu hình cho phân loại nhị phân.",
      "Sai: đó là cấu hình hồi quy.",
      "Sai: ReLU không cho phân phối xác suất.",
    ],
    explanation:
      "Nếu mỗi ảnh có thể mang *nhiều* nhãn cùng lúc (multi-label), phải đổi sang sigmoid trên từng nơ-ron kèm binary cross-entropy, không dùng softmax.",
  },
  {
    id: "image-classification-02",
    syllabusId: "image-classification",
    difficulty: "understand",
    format: "single-choice",
    stem: "Top-5 accuracy nghĩa là gì?",
    choices: [
      "Accuracy trung bình của 5 mô hình tốt nhất.",
      "Tỷ lệ ảnh mà nhãn đúng nằm trong 5 lớp được mô hình cho điểm cao nhất.",
      "Accuracy tính trên 5 lớp phổ biến nhất.",
      "Accuracy sau 5 epoch huấn luyện.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: đây không phải chỉ số ensemble.",
      "Đúng: chỉ số nới lỏng, hữu ích khi có nhiều lớp rất giống nhau.",
      "Sai: không giới hạn tập lớp.",
      "Sai: không liên quan tới số epoch.",
    ],
    explanation:
      "Top-5 phổ biến ở ImageNet vì bộ dữ liệu có 1.000 lớp, trong đó nhiều lớp là các giống chó khác nhau — chỉ số top-1 phạt quá nặng những nhầm lẫn tinh vi.",
  },
  {
    id: "image-classification-03",
    syllabusId: "image-classification",
    difficulty: "apply",
    format: "single-choice",
    stem: "Dùng ResNet pretrained trên ImageNet nhưng quên áp dụng đúng mean/std chuẩn hoá mà mô hình được huấn luyện. Hậu quả là gì?",
    choices: [
      "Không ảnh hưởng vì mạng tự thích nghi.",
      "Phân phối đầu vào lệch so với lúc tiền huấn luyện nên chất lượng đặc trưng giảm rõ rệt, thường thấy ngay qua accuracy thấp bất thường.",
      "Mô hình báo lỗi shape.",
      "Chỉ ảnh hưởng tới tốc độ huấn luyện.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: chỉ đúng nếu finetune lâu trên nhiều dữ liệu, và vẫn lãng phí.",
      "Đúng: đây là lỗi im lặng rất phổ biến khi dùng mô hình pretrained.",
      "Sai: shape không đổi nên không có lỗi kỹ thuật.",
      "Sai: vấn đề nằm ở chất lượng, không phải tốc độ.",
    ],
    explanation:
      "Quy tắc: pipeline tiền xử lý lúc suy luận phải khớp *chính xác* pipeline lúc tiền huấn luyện — cùng kích thước, cùng thứ tự kênh, cùng mean/std.",
  },
  {
    id: "image-classification-04",
    syllabusId: "image-classification",
    difficulty: "apply",
    format: "single-choice",
    stem: "Confusion matrix cho thấy mô hình nhầm lẫn nặng giữa đúng hai lớp cụ thể, các lớp khác đều tốt. Hướng xử lý hợp lý nhất là gì?",
    choices: [
      "Tăng số lớp trong bài toán.",
      "Xem lại dữ liệu của hai lớp đó: kiểm tra nhãn có nhất quán không, thu thập thêm mẫu phân biệt, và cân nhắc đặc trưng/độ phân giải đủ để tách chúng.",
      "Đổi optimizer sang Adam.",
      "Giảm kích thước ảnh đầu vào.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: không giải quyết được vấn đề phân biệt hai lớp.",
      "Đúng: nhầm lẫn tập trung ở một cặp lớp là dấu hiệu vấn đề dữ liệu hoặc thông tin đầu vào, không phải vấn đề tối ưu chung.",
      "Sai: đổi optimizer ảnh hưởng toàn cục, không nhằm vào cặp lớp cụ thể.",
      "Sai: giảm độ phân giải càng làm mất chi tiết phân biệt.",
    ],
    explanation:
      "Confusion matrix đáng giá vì nó chỉ ra *lỗi nằm ở đâu*. Một chỉ số tổng hợp như accuracy không bao giờ dẫn bạn tới chẩn đoán này.",
  },
  {
    id: "image-classification-05",
    syllabusId: "image-classification",
    difficulty: "advanced",
    format: "single-choice",
    stem: "Mô hình đạt 97% trên tập test nội bộ nhưng chỉ 62% khi triển khai thực tế. Điều tra cho thấy ảnh thật được chụp bằng điện thoại trong điều kiện ánh sáng đa dạng, còn dữ liệu huấn luyện chụp trong studio. Đây là vấn đề gì?",
    choices: [
      "Overfitting thông thường, xử lý bằng dropout.",
      "Dịch chuyển phân phối (distribution shift) giữa dữ liệu huấn luyện và dữ liệu vận hành; cần thu thập dữ liệu đại diện cho điều kiện thật và tăng cường ảnh mô phỏng biến thiên ánh sáng/nhiễu.",
      "Data leakage trong tập train.",
      "Vanishing gradient.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: mô hình tổng quát hoá tốt *trong phân phối* của nó, bằng chứng là 97% trên test nội bộ.",
      "Đúng: tập test nội bộ cùng phân phối với train nên không phát hiện được vấn đề này.",
      "Sai: leakage sẽ làm điểm test nội bộ cao giả, nhưng nguyên nhân gốc ở đây là điều kiện thu thập.",
      "Sai: không liên quan tới luồng gradient.",
    ],
    trap: "Bẫy là điểm test nội bộ rất đẹp. Tập test chỉ chứng minh được điều gì đó *trong phạm vi phân phối mà nó đại diện*; nó không nói gì về dữ liệu ngoài phân phối đó.",
    explanation:
      "Bài học vận hành: tập test phải được lấy mẫu từ đúng điều kiện triển khai. Nếu chưa có, mọi con số đánh giá đều chỉ là giả định.",
  },

  /* ---------------- object-detection ---------------- */
  {
    id: "object-detection-01",
    syllabusId: "object-detection",
    difficulty: "recall",
    format: "single-choice",
    stem: "Đầu ra của một mô hình phát hiện đối tượng gồm những gì?",
    choices: [
      "Chỉ nhãn lớp của ảnh.",
      "Danh sách hộp giới hạn kèm nhãn lớp và điểm tin cậy cho từng đối tượng.",
      "Nhãn cho từng pixel của ảnh.",
      "Một vector embedding duy nhất.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: đó là phân loại ảnh.",
      "Đúng: phát hiện đối tượng trả lời đồng thời “cái gì” và “ở đâu”.",
      "Sai: đó là phân đoạn ngữ nghĩa.",
      "Sai: đó là đầu ra của một encoder.",
    ],
    explanation:
      "Ba bài toán thị giác cơ bản theo mức độ chi tiết tăng dần: phân loại (ảnh) → phát hiện (hộp) → phân đoạn (pixel).",
  },
  {
    id: "object-detection-02",
    syllabusId: "object-detection",
    difficulty: "understand",
    format: "single-choice",
    stem: "IoU (Intersection over Union) đo điều gì trong phát hiện đối tượng?",
    choices: [
      "Tỷ số giữa diện tích phần giao và diện tích phần hợp của hộp dự đoán với hộp thật.",
      "Tỷ lệ số hộp dự đoán đúng trên tổng số hộp.",
      "Khoảng cách giữa tâm hai hộp.",
      "Tỷ lệ giữa chiều rộng và chiều cao của hộp.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: giá trị nằm trong [0, 1], bằng 1 khi hai hộp trùng khít.",
      "Sai: đó là một dạng precision.",
      "Sai: khoảng cách tâm là độ đo khác, bỏ qua kích thước hộp.",
      "Sai: đó là tỷ lệ khung hình.",
    ],
    explanation:
      "IoU là nền tảng của cả việc gán nhãn dương/âm khi huấn luyện lẫn việc tính mAP khi đánh giá; ngưỡng phổ biến là 0.5.",
  },
  {
    id: "object-detection-03",
    syllabusId: "object-detection",
    difficulty: "apply",
    format: "numeric",
    stem: "Hộp A có toạ độ (x1, y1, x2, y2) = (0, 0, 2, 2); hộp B = (1, 1, 3, 3). Tính IoU (làm tròn 3 chữ số thập phân).",
    answer: 0.143,
    tolerance: 0.005,
    calculation: [
      "Diện tích A = 2×2 = 4; diện tích B = 2×2 = 4.",
      "Phần giao: x từ 1 đến 2 (rộng 1), y từ 1 đến 2 (cao 1) → diện tích 1.",
      "Phần hợp = 4 + 4 − 1 = 7. IoU = 1/7 ≈ 0.143.",
    ],
    explanation:
      "IoU ≈ 0.143 nằm xa dưới ngưỡng 0.5, nên với hầu hết giao thức đánh giá đây được tính là một dự đoán sai (dương tính giả).",
  },
  {
    id: "object-detection-04",
    syllabusId: "object-detection",
    difficulty: "apply",
    format: "single-choice",
    stem: "Non-Maximum Suppression (NMS) giải quyết vấn đề gì?",
    choices: [
      "Loại bỏ các hộp trùng lặp cho cùng một đối tượng, giữ lại hộp có điểm tin cậy cao nhất trong nhóm chồng lấn.",
      "Loại bỏ các ảnh nhiễu khỏi tập dữ liệu.",
      "Cân bằng số lượng mẫu giữa các lớp.",
      "Giảm số kênh của feature map.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: mô hình thường sinh nhiều hộp chồng nhau cho một đối tượng; NMS lọc chúng theo ngưỡng IoU.",
      "Sai: đó là làm sạch dữ liệu.",
      "Sai: đó là xử lý mất cân bằng lớp.",
      "Sai: đó là tích chập 1×1.",
    ],
    explanation:
      "Ngưỡng IoU của NMS là một đánh đổi: quá thấp sẽ xoá nhầm hai đối tượng đứng sát nhau; quá cao thì còn sót hộp trùng lặp.",
  },
  {
    id: "object-detection-05",
    syllabusId: "object-detection",
    difficulty: "advanced",
    format: "single-choice",
    stem: "Ứng dụng cần phát hiện đối tượng theo thời gian thực trên camera 30 khung hình/giây, chạy trên thiết bị biên. Nên chọn hướng nào và vì sao?",
    choices: [
      "Faster R-CNN, vì mô hình hai giai đoạn luôn chính xác hơn.",
      "Mô hình một giai đoạn như YOLO/SSD, vì chúng dự đoán hộp và lớp trong một lượt truyền xuôi nên độ trễ thấp hơn nhiều, đổi lại thường kém hơn đôi chút ở vật thể rất nhỏ.",
      "Chạy phân loại ảnh trên từng khung hình.",
      "Dùng mô hình khuếch tán để sinh hộp giới hạn.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: hai giai đoạn (đề xuất vùng rồi phân loại) chính xác hơn ở một số mốc nhưng quá chậm cho thời gian thực trên thiết bị biên.",
      "Đúng: nhận đúng đánh đổi giữa độ trễ và độ chính xác, và nêu được cái giá phải trả.",
      "Sai: phân loại không cho vị trí đối tượng.",
      "Sai: mô hình khuếch tán dùng để sinh ảnh, chi phí sampling rất cao.",
    ],
    trap: "Bẫy là chọn mô hình có mAP cao nhất trên bảng xếp hạng mà bỏ qua ràng buộc vận hành. Trong bài toán thực, ràng buộc độ trễ và phần cứng thường quyết định lựa chọn.",
    explanation:
      "Khi phải chọn kiến trúc, luôn nêu đủ ba yếu tố: chỉ số chất lượng (mAP), độ trễ mục tiêu, và giới hạn phần cứng. Chỉ nói “chính xác hơn” là câu trả lời chưa hoàn chỉnh.",
  },

  /* ---------------- segmentation ---------------- */
  {
    id: "segmentation-01",
    syllabusId: "segmentation",
    difficulty: "recall",
    format: "single-choice",
    stem: "Phân đoạn ngữ nghĩa (semantic segmentation) cho đầu ra gì?",
    choices: [
      "Một nhãn lớp cho từng pixel của ảnh.",
      "Một nhãn duy nhất cho toàn ảnh.",
      "Danh sách hộp giới hạn.",
      "Một vector đặc trưng cho mỗi ảnh.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: đầu ra có cùng kích thước không gian với đầu vào.",
      "Sai: đó là phân loại ảnh.",
      "Sai: đó là phát hiện đối tượng.",
      "Sai: đó là trích xuất đặc trưng.",
    ],
    explanation:
      "Phân đoạn ngữ nghĩa không phân biệt các thể hiện khác nhau của cùng một lớp: hai người đứng cạnh nhau đều được gán nhãn “người” mà không tách riêng.",
  },
  {
    id: "segmentation-02",
    syllabusId: "segmentation",
    difficulty: "understand",
    format: "single-choice",
    stem: "Khác biệt giữa semantic segmentation và instance segmentation là gì?",
    choices: [
      "Semantic gán nhãn lớp cho mỗi pixel; instance ngoài ra còn tách riêng từng đối tượng cụ thể của cùng một lớp.",
      "Semantic chỉ dùng cho ảnh xám, instance dùng cho ảnh màu.",
      "Instance nhanh hơn semantic.",
      "Semantic cần nhãn, instance thì không.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: instance trả lời được “có bao nhiêu đối tượng và pixel nào thuộc đối tượng nào”.",
      "Sai: cả hai đều dùng cho ảnh màu.",
      "Sai: instance thường tốn kém hơn.",
      "Sai: cả hai đều là học có giám sát cần nhãn dày đặc.",
    ],
    explanation:
      "Panoptic segmentation gộp cả hai: các lớp đếm được (người, xe) được tách theo thể hiện, còn các lớp nền liên tục (bầu trời, đường) chỉ cần nhãn ngữ nghĩa.",
  },
  {
    id: "segmentation-03",
    syllabusId: "segmentation",
    difficulty: "apply",
    format: "numeric",
    stem: "Vùng dự đoán có 100 pixel, vùng thật có 100 pixel, phần giao là 60 pixel. Tính IoU (làm tròn 3 chữ số thập phân).",
    answer: 0.429,
    tolerance: 0.005,
    calculation: [
      "Phần hợp = 100 + 100 − 60 = 140.",
      "IoU = 60/140 ≈ 0.4286.",
    ],
    explanation:
      "Đối chiếu Dice = 2×60/(100+100) = 0.6 — luôn cao hơn IoU với cùng dữ liệu. Vì thế phải nêu rõ đang báo cáo chỉ số nào khi so sánh kết quả.",
  },
  {
    id: "segmentation-04",
    syllabusId: "segmentation",
    difficulty: "apply",
    format: "single-choice",
    stem: "Skip connection trong U-Net phục vụ mục đích gì?",
    choices: [
      "Giảm số tham số của mô hình.",
      "Mang chi tiết không gian độ phân giải cao từ nhánh đi xuống sang nhánh đi lên, bù lại thông tin vị trí đã mất khi giảm mẫu.",
      "Tăng số lớp của mạng.",
      "Chuẩn hoá phân phối kích hoạt.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: skip connection ghép kênh nên thường làm tăng chi phí.",
      "Đúng: nhánh xuống cho ngữ cảnh, skip connection cho biên rõ nét.",
      "Sai: nó nối ngang chứ không thêm độ sâu.",
      "Sai: đó là vai trò của các lớp chuẩn hoá.",
    ],
    explanation:
      "Không có skip connection, đầu ra vẫn nhận diện đúng vùng nhưng biên bị nhoè, vì thông tin định vị chi tiết đã mất qua các tầng giảm mẫu.",
  },
  {
    id: "segmentation-05",
    syllabusId: "segmentation",
    difficulty: "advanced",
    format: "single-choice",
    stem: "Ảnh y tế phân đoạn khối u: vùng khối u chỉ chiếm khoảng 1% số pixel. Mô hình huấn luyện bằng cross-entropy theo pixel hội tụ về trạng thái dự đoán toàn bộ là nền. Cách xử lý phù hợp nhất là gì?",
    choices: [
      "Tăng số epoch huấn luyện.",
      "Dùng Dice loss (hoặc kết hợp Dice với cross-entropy có trọng số lớp), vì các loss này tập trung vào mức chồng lấn của vùng dương thay vì trung bình theo pixel.",
      "Giảm độ phân giải ảnh để giảm số pixel nền.",
      "Đổi optimizer sang SGD.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: mô hình đã hội tụ về một nghiệm tối ưu theo loss hiện tại; kéo dài không đổi được điều đó.",
      "Đúng: Dice tính trực tiếp trên độ chồng lấn nên không bị lớp nền chi phối.",
      "Sai: tỷ lệ mất cân bằng gần như không đổi, và mất chi tiết biên.",
      "Sai: optimizer không phải nguyên nhân.",
    ],
    trap: "Bẫy là mô hình đạt accuracy theo pixel tới 99% — con số nghe rất tốt nhưng tương ứng với một mô hình hoàn toàn vô dụng về mặt lâm sàng.",
    explanation:
      "Đây là phiên bản của nghịch lý accuracy trong bài toán dự đoán dày đặc: khi lớp đích cực hiếm, chỉ số trung bình theo pixel và loss trung bình theo pixel đều mất khả năng phân biệt.",
  },

  /* ---------------- vision-encoders ---------------- */
  {
    id: "vision-encoders-01",
    syllabusId: "vision-encoders",
    difficulty: "recall",
    format: "single-choice",
    stem: "Ý tưởng cốt lõi của khối residual trong ResNet là gì?",
    choices: [
      "Cộng đầu vào của khối vào đầu ra của khối, để mạng học phần dư thay vì học trực tiếp toàn bộ ánh xạ.",
      "Nhân đầu vào với đầu ra của khối.",
      "Bỏ qua hoàn toàn các lớp tích chập.",
      "Chia mạng thành nhiều nhánh song song rồi lấy trung bình.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: `y = F(x) + x` — đây là toàn bộ ý tưởng.",
      "Sai: phép nhân không phải cơ chế của residual.",
      "Sai: các lớp tích chập vẫn nằm trong khối.",
      "Sai: đó là ý tưởng của Inception.",
    ],
    explanation:
      "Nếu ánh xạ đồng nhất là tối ưu, mạng chỉ cần đẩy F(x) về 0 — việc này dễ hơn nhiều so với học một ánh xạ đồng nhất bằng chồng lớp phi tuyến.",
  },
  {
    id: "vision-encoders-02",
    syllabusId: "vision-encoders",
    difficulty: "understand",
    format: "single-choice",
    stem: "Vì sao kết nối tắt giúp huấn luyện được mạng rất sâu?",
    choices: [
      "Vì chúng làm giảm số tham số.",
      "Vì chúng tạo đường đi ngắn cho gradient về các lớp đầu, giảm hiện tượng tiêu biến gradient và loại bỏ vấn đề suy giảm khi tăng độ sâu.",
      "Vì chúng làm hàm mất mát trở nên lồi.",
      "Vì chúng loại bỏ nhu cầu dùng hàm kích hoạt.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: số tham số không giảm.",
      "Đúng: gradient chảy trực tiếp qua nhánh cộng mà không bị nhân dồn qua nhiều lớp.",
      "Sai: mặt lỗi vẫn không lồi, chỉ trở nên dễ đi hơn.",
      "Sai: phi tuyến vẫn cần.",
    ],
    explanation:
      "Đạo hàm của `y = F(x) + x` theo x có số hạng cộng bằng 1, nên gradient không thể bị triệt tiêu hoàn toàn dù mạng rất sâu.",
  },
  {
    id: "vision-encoders-03",
    syllabusId: "vision-encoders",
    difficulty: "apply",
    format: "single-choice",
    stem: "Muốn dùng ResNet50 pretrained làm bộ trích xuất đặc trưng cố định cho một nhiệm vụ mới, cần làm gì?",
    choices: [
      "Huấn luyện lại toàn bộ mạng từ trọng số ngẫu nhiên.",
      "Bỏ lớp phân loại cuối, đặt `requires_grad=False` cho phần thân, lấy đầu ra sau global average pooling làm vector đặc trưng và huấn luyện một bộ phân loại mới trên đó.",
      "Chỉ đổi hàm mất mát và giữ nguyên mọi thứ khác.",
      "Chuyển mô hình sang chế độ `train()` và chạy một epoch.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: như vậy là vứt bỏ toàn bộ giá trị của mô hình pretrained.",
      "Đúng: đây là quy trình chuẩn để dùng encoder như một hàm trích xuất đặc trưng.",
      "Sai: lớp đầu ra vẫn ứng với 1.000 lớp ImageNet.",
      "Sai: chế độ train không liên quan tới việc thay đầu ra.",
    ],
    explanation:
      "Nhớ gọi `model.eval()` khi trích xuất đặc trưng để BatchNorm dùng thống kê chạy, nếu không vector đặc trưng sẽ phụ thuộc vào batch.",
  },
  {
    id: "vision-encoders-04",
    syllabusId: "vision-encoders",
    difficulty: "apply",
    format: "single-choice",
    stem: "Vision Transformer (ViT) xử lý ảnh thế nào?",
    choices: [
      "Áp dụng tích chập nhiều tầng như CNN rồi thêm attention ở cuối.",
      "Cắt ảnh thành các patch nhỏ, chiếu tuyến tính mỗi patch thành một token, cộng positional embedding rồi đưa qua các khối transformer.",
      "Xử lý từng pixel như một token riêng biệt.",
      "Chuyển ảnh thành chuỗi ký tự rồi dùng mô hình ngôn ngữ.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: ViT thuần không dùng tầng tích chập nào.",
      "Đúng: patch 16×16 là cấu hình kinh điển, biến ảnh 224×224 thành 196 token.",
      "Sai: mỗi pixel là một token sẽ cho chuỗi 50.176 token — bất khả thi vì chi phí bậc hai.",
      "Sai: không có bước chuyển sang ký tự.",
    ],
    explanation:
      "Chính vì chi phí attention là bậc hai theo số token mà ViT phải chia patch: đây là quyết định thiết kế mang tính bắt buộc, không phải tuỳ chọn.",
  },
  {
    id: "vision-encoders-05",
    syllabusId: "vision-encoders",
    difficulty: "advanced",
    format: "single-choice",
    stem: "Với tập dữ liệu vừa phải (vài chục nghìn ảnh) và huấn luyện từ đầu, ViT thường thua CNN. Giải thích đúng nhất là gì?",
    choices: [
      "ViT có ít tham số hơn nên năng lực kém hơn.",
      "ViT có rất ít inductive bias về cấu trúc ảnh (không có kết nối cục bộ hay chia sẻ trọng số theo không gian), nên phải học các quy luật đó từ dữ liệu và cần lượng dữ liệu lớn hơn nhiều; với dữ liệu vừa phải nên dùng ViT pretrained hoặc chọn CNN.",
      "ViT không dùng được với ảnh màu.",
      "ViT chỉ hoạt động trên GPU chuyên dụng.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: ViT thường có nhiều tham số hơn CNN cùng hạng.",
      "Đúng: đây là đánh đổi trung tâm giữa inductive bias và nhu cầu dữ liệu.",
      "Sai: ViT xử lý ảnh màu bình thường.",
      "Sai: không có ràng buộc phần cứng đặc biệt.",
    ],
    trap: "Bẫy là suy luận “kiến trúc mới hơn thì luôn tốt hơn”. Ưu thế của ViT chỉ xuất hiện ở quy mô dữ liệu lớn hoặc khi tận dụng trọng số pretrained.",
    explanation:
      "Nguyên tắc tổng quát: bias mạnh giúp học từ ít dữ liệu nhưng đặt trần cho mô hình; bias yếu cần nhiều dữ liệu nhưng trần cao hơn. Chọn theo lượng dữ liệu đang có.",
  },

  /* ---------------- image-augmentation ---------------- */
  {
    id: "image-augmentation-01",
    syllabusId: "image-augmentation",
    difficulty: "recall",
    format: "single-choice",
    stem: "Data augmentation cho ảnh là gì?",
    choices: [
      "Tạo thêm mẫu huấn luyện bằng cách áp dụng các phép biến đổi bảo toàn nhãn lên ảnh gốc.",
      "Thu thập thêm ảnh mới từ internet.",
      "Tăng độ phân giải của ảnh bằng mô hình siêu phân giải.",
      "Nén ảnh để tiết kiệm bộ nhớ.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: lật, xoay, cắt ngẫu nhiên, đổi độ sáng… đều thuộc nhóm này.",
      "Sai: đó là thu thập dữ liệu, không phải augmentation.",
      "Sai: siêu phân giải là một nhiệm vụ riêng.",
      "Sai: nén không tạo mẫu huấn luyện mới.",
    ],
    explanation:
      "Điều kiện then chốt nằm ở cụm “bảo toàn nhãn”: phép biến đổi được phép làm đổi pixel nhưng không được làm đổi câu trả lời đúng.",
  },
  {
    id: "image-augmentation-02",
    syllabusId: "image-augmentation",
    difficulty: "understand",
    format: "single-choice",
    stem: "Augmentation nên được áp dụng ở đâu?",
    choices: [
      "Trên cả tập train, validation và test để nhất quán.",
      "Chỉ trên tập train; validation và test giữ nguyên để phản ánh đúng dữ liệu thật (trừ khi cố ý dùng test-time augmentation và nêu rõ).",
      "Chỉ trên tập test.",
      "Trên tập validation để tăng độ tin cậy của ước lượng.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: augmentation tập đánh giá làm chỉ số không còn phản ánh dữ liệu thực tế.",
      "Đúng: đây là quy tắc chuẩn, TTA là ngoại lệ có chủ đích và phải công bố.",
      "Sai: sẽ làm sai lệch chỉ số đánh giá.",
      "Sai: tương tự, làm hỏng vai trò của tập validation.",
    ],
    explanation:
      "Test-time augmentation (dự đoán trên nhiều biến thể rồi lấy trung bình) là kỹ thuật hợp lệ để tăng độ chính xác, nhưng phải báo cáo rõ vì nó làm tăng chi phí suy luận.",
  },
  {
    id: "image-augmentation-03",
    syllabusId: "image-augmentation",
    difficulty: "apply",
    format: "multi-select",
    stem: "Bài toán nhận dạng chữ số viết tay (0–9). Chọn tất cả phép augmentation **không an toàn** vì có thể phá vỡ nhãn.",
    choices: [
      "Lật ngang (horizontal flip).",
      "Xoay nhẹ ±10 độ.",
      "Xoay 180 độ.",
      "Dịch chuyển vài pixel.",
      "Thay đổi độ dày nét bằng phép co giãn hình thái nhẹ.",
    ],
    answerIndexes: [0, 2],
    choiceNotes: [
      "Không an toàn: chữ số không đối xứng gương; lật ngang tạo ra ký tự không hợp lệ.",
      "An toàn: chữ viết tay vốn nghiêng nhẹ, xoay nhỏ vẫn giữ nhãn.",
      "Không an toàn: 6 xoay 180 độ thành 9 — nhãn bị đổi hẳn.",
      "An toàn: vị trí trong khung không quyết định danh tính chữ số.",
      "An toàn: nét dày mỏng là biến thiên tự nhiên của chữ viết tay.",
    ],
    scoring: "all-or-nothing",
    explanation:
      "Câu hỏi luôn phải đặt trước mỗi phép biến đổi: “sau phép này, câu trả lời đúng có còn như cũ không?”. Augmentation phá nhãn còn tệ hơn không augmentation.",
  },
  {
    id: "image-augmentation-04",
    syllabusId: "image-augmentation",
    difficulty: "apply",
    format: "single-choice",
    stem: "Mixup trộn hai ảnh theo hệ số λ. Nhãn tương ứng được xử lý thế nào?",
    choices: [
      "Giữ nhãn của ảnh có trọng số lớn hơn.",
      "Trộn nhãn theo cùng hệ số λ, tạo nhãn mềm (ví dụ 0.7 lớp A và 0.3 lớp B).",
      "Bỏ nhãn và chuyển sang học không giám sát.",
      "Gán nhãn mới là một lớp “hỗn hợp” riêng.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: như vậy sẽ dạy mô hình rằng ảnh đã trộn vẫn thuộc trọn một lớp.",
      "Đúng: ảnh và nhãn phải được nội suy bằng cùng một hệ số.",
      "Sai: mixup vẫn là học có giám sát.",
      "Sai: không tạo lớp mới nào.",
    ],
    explanation:
      "Mixup buộc mô hình hành xử tuyến tính giữa các mẫu, nhờ đó giảm sự tự tin thái quá và cải thiện hiệu chỉnh xác suất. CutMix là biến thể dán một vùng ảnh này vào ảnh kia.",
  },
  {
    id: "image-augmentation-05",
    syllabusId: "image-augmentation",
    difficulty: "advanced",
    format: "single-choice",
    stem: "Nhóm thêm augmentation rất mạnh (xoay lớn, biến dạng, đổi màu cực đoan) và thấy accuracy validation *giảm*. Giải thích hợp lý nhất là gì?",
    choices: [
      "Augmentation luôn có hại, nên bỏ hoàn toàn.",
      "Augmentation quá mạnh tạo ra phân phối huấn luyện lệch khỏi phân phối thật, khiến mô hình học các bất biến không tồn tại trong dữ liệu vận hành; cường độ augmentation là siêu tham số cần dò.",
      "Mô hình cần thêm epoch, augmentation không liên quan.",
      "Validation set quá nhỏ.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: augmentation vừa phải thường có ích rõ rệt.",
      "Đúng: augmentation là một dạng ràng buộc; ràng buộc sai làm mô hình tệ đi.",
      "Sai: có thể cần thêm epoch, nhưng không giải thích được vì sao accuracy *giảm* so với trước.",
      "Sai: cỡ tập validation không đổi giữa hai lần thử.",
    ],
    trap: "Bẫy là coi augmentation như thứ “càng nhiều càng tốt”. Nó chỉ có ích khi các bất biến được tạo ra thật sự tồn tại trong bài toán.",
    explanation:
      "Cách làm đúng: chọn phép biến đổi từ hiểu biết về bài toán, rồi dò *cường độ* như một siêu tham số trên tập validation, thay vì bật tối đa mọi phép có sẵn.",
  },

  /* ---------------- gans ---------------- */
  {
    id: "gans-01",
    syllabusId: "gans",
    difficulty: "recall",
    format: "single-choice",
    stem: "GAN gồm hai mạng nào và chúng có quan hệ ra sao?",
    choices: [
      "Generator sinh mẫu giả và Discriminator phân biệt thật/giả; hai mạng cạnh tranh trong một trò chơi minimax.",
      "Encoder và Decoder cùng tối thiểu hoá lỗi tái tạo.",
      "Hai mạng giống hệt nhau được lấy trung bình.",
      "Một mạng giáo viên và một mạng học sinh cùng tối thiểu hoá một loss.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: đây là định nghĩa của GAN.",
      "Sai: đó là autoencoder.",
      "Sai: đó là ensemble.",
      "Sai: đó là knowledge distillation.",
    ],
    explanation:
      "Điểm đặc biệt: hai mạng có mục tiêu *đối nghịch*. Đây là nguồn gốc của cả sức mạnh lẫn sự bất ổn khét tiếng khi huấn luyện GAN.",
  },
  {
    id: "gans-02",
    syllabusId: "gans",
    difficulty: "understand",
    format: "single-choice",
    stem: "Mode collapse trong GAN là hiện tượng gì?",
    choices: [
      "Discriminator ngừng học sau vài epoch.",
      "Generator chỉ sinh ra một vài kiểu mẫu rất giống nhau, bỏ qua phần lớn sự đa dạng của phân phối thật.",
      "Loss của generator trở thành NaN.",
      "Ảnh sinh ra có độ phân giải thấp dần.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: đó là vấn đề mất cân bằng khác.",
      "Đúng: generator tìm được một điểm “đánh lừa” discriminator và bám mãi vào đó.",
      "Sai: NaN là lỗi số học, không phải mode collapse.",
      "Sai: độ phân giải do kiến trúc quyết định.",
    ],
    explanation:
      "Nguy hiểm ở chỗ loss có thể trông rất ổn trong khi mô hình đã hỏng. Vì thế phải luôn quan sát mẫu sinh ra và đo đa dạng, không chỉ nhìn đường cong loss.",
  },
  {
    id: "gans-03",
    syllabusId: "gans",
    difficulty: "apply",
    format: "single-choice",
    stem: "Trong quá trình huấn luyện GAN, discriminator đạt độ chính xác gần 100% và loss của generator tăng liên tục. Điều này nghĩa là gì?",
    choices: [
      "Huấn luyện đang rất tốt vì discriminator mạnh.",
      "Hai mạng mất cân bằng: discriminator quá mạnh nên gradient truyền về generator rất nhỏ, generator gần như không học được.",
      "Generator đã hội tụ hoàn hảo.",
      "Cần tăng batch size lên gấp mười.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: GAN cần hai bên cân bằng, không cần một bên thắng tuyệt đối.",
      "Đúng: khi discriminator phân biệt quá dễ, tín hiệu học cho generator gần như tắt.",
      "Sai: generator hội tụ tốt thì discriminator phải khó phân biệt, tức accuracy gần 50%.",
      "Sai: batch size không phải nguyên nhân gốc.",
    ],
    explanation:
      "Các biện pháp cân bằng: giảm số bước cập nhật discriminator, hạ learning rate của nó, dùng label smoothing, hoặc đổi sang hàm mất mát ổn định hơn như WGAN-GP.",
  },
  {
    id: "gans-04",
    syllabusId: "gans",
    difficulty: "apply",
    format: "single-choice",
    stem: "FID (Fréchet Inception Distance) đo điều gì khi đánh giá mô hình sinh ảnh?",
    choices: [
      "Độ sắc nét của từng ảnh riêng lẻ.",
      "Khoảng cách giữa phân phối đặc trưng của tập ảnh sinh ra và của tập ảnh thật; FID càng thấp càng tốt.",
      "Thời gian sinh một ảnh.",
      "Tỷ lệ ảnh bị discriminator phân loại nhầm.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: FID là chỉ số ở mức phân phối, không đánh giá từng ảnh.",
      "Đúng: đặc trưng được lấy từ một mạng Inception pretrained, rồi so hai phân phối Gaussian xấp xỉ.",
      "Sai: đó là chỉ số hiệu năng vận hành.",
      "Sai: đó là chỉ số nội bộ của quá trình huấn luyện, không dùng để so sánh mô hình.",
    ],
    explanation:
      "Vì FID so *phân phối*, nó phạt cả chất lượng kém lẫn thiếu đa dạng — nên phát hiện được mode collapse, điều mà việc ngắm vài ảnh đẹp không làm được.",
  },
  {
    id: "gans-05",
    syllabusId: "gans",
    difficulty: "advanced",
    format: "true-false-set",
    stem: "So sánh GAN với mô hình khuếch tán trong sinh ảnh.",
    statements: [
      {
        text: "GAN thường sinh ảnh nhanh hơn vì chỉ cần một lượt truyền xuôi, trong khi mô hình khuếch tán cần nhiều bước khử nhiễu.",
        answer: true,
        note: "Đây là ưu thế còn lại rõ rệt nhất của GAN; các kỹ thuật chưng cất đang thu hẹp khoảng cách này.",
      },
      {
        text: "Mô hình khuếch tán thường ổn định hơn khi huấn luyện vì mục tiêu là hồi quy khử nhiễu chứ không phải trò chơi đối kháng.",
        answer: true,
        note: "Không có cân bằng hai mạng nên không gặp mode collapse theo cách của GAN.",
      },
      {
        text: "Mô hình khuếch tán nói chung cho độ đa dạng mẫu tốt hơn GAN.",
        answer: true,
        note: "Vì chúng bao phủ phân phối tốt hơn, thay vì bị hút về một số mode dễ đánh lừa discriminator.",
      },
      {
        text: "Loss của generator trong GAN là chỉ số đáng tin để biết chất lượng ảnh sinh ra.",
        answer: false,
        note: "Loss chỉ phản ánh thế trận hiện tại với discriminator; nó không tương quan ổn định với chất lượng, nên phải dùng FID và quan sát mẫu.",
      },
    ],
    trap: "Ý (d) đánh vào thói quen “loss giảm là tốt”. Trong huấn luyện đối kháng, loss của hai mạng thay đổi theo nhau nên không đọc được như loss thông thường.",
    explanation:
      "Nguyên tắc chung: khi mục tiêu huấn luyện là một trò chơi chứ không phải một hàm mất mát cố định, giá trị loss mất ý nghĩa như thước đo tiến bộ.",
  },

  /* ---------------- vision-ssl ---------------- */
  {
    id: "vision-ssl-01",
    syllabusId: "vision-ssl",
    difficulty: "recall",
    format: "single-choice",
    stem: "Học tự giám sát (self-supervised learning) khác học có giám sát ở điểm nào?",
    choices: [
      "Nhãn giám sát được sinh tự động từ chính dữ liệu, không cần con người gán nhãn.",
      "Không dùng hàm mất mát nào.",
      "Chỉ dùng được cho dữ liệu văn bản.",
      "Không cần huấn luyện.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: ví dụ dự đoán phần bị che, hoặc nhận ra hai biến thể của cùng một ảnh.",
      "Sai: vẫn có hàm mất mát rõ ràng.",
      "Sai: SSL rất mạnh trong thị giác.",
      "Sai: vẫn phải huấn luyện, thường là rất tốn kém.",
    ],
    explanation:
      "SSL cho phép tận dụng kho ảnh không nhãn khổng lồ, rồi chỉ cần một lượng nhỏ dữ liệu có nhãn ở bước finetune phía sau.",
  },
  {
    id: "vision-ssl-02",
    syllabusId: "vision-ssl",
    difficulty: "understand",
    format: "single-choice",
    stem: "Trong contrastive learning kiểu SimCLR, cặp mẫu dương được tạo ra thế nào?",
    choices: [
      "Hai ảnh khác nhau cùng thuộc một lớp đã biết.",
      "Hai biến thể augmentation khác nhau của *cùng một* ảnh.",
      "Một ảnh và bản nhiễu ngẫu nhiên hoàn toàn.",
      "Hai ảnh liên tiếp trong tập dữ liệu.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: nếu biết lớp thì đã là học có giám sát.",
      "Đúng: mô hình học kéo hai góc nhìn của một ảnh lại gần nhau trong không gian biểu diễn.",
      "Sai: nhiễu thuần không mang nội dung để so khớp.",
      "Sai: thứ tự trong tập dữ liệu không bảo đảm cùng nội dung.",
    ],
    explanation:
      "Vì cặp dương do augmentation tạo ra, chất lượng của SSL contrastive phụ thuộc rất mạnh vào lựa chọn phép augmentation — đây là kết luận trung tâm của bài báo SimCLR.",
  },
  {
    id: "vision-ssl-03",
    syllabusId: "vision-ssl",
    difficulty: "apply",
    format: "single-choice",
    stem: "Có 1 triệu ảnh không nhãn và chỉ 2.000 ảnh có nhãn. Chiến lược hợp lý nhất là gì?",
    choices: [
      "Bỏ phần không nhãn, chỉ huấn luyện có giám sát trên 2.000 ảnh.",
      "Tiền huấn luyện tự giám sát trên 1 triệu ảnh để học biểu diễn, rồi finetune trên 2.000 ảnh có nhãn.",
      "Gán nhãn ngẫu nhiên cho 1 triệu ảnh rồi huấn luyện có giám sát.",
      "Dùng 1 triệu ảnh làm tập test.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: bỏ phí phần lớn thông tin sẵn có.",
      "Đúng: đây chính là kịch bản mà SSL được thiết kế để giải quyết.",
      "Sai: nhãn ngẫu nhiên là nhiễu thuần, mô hình chỉ học được rác.",
      "Sai: tập test cần nhãn đúng để đánh giá.",
    ],
    explanation:
      "Nếu có sẵn mô hình pretrained phù hợp miền, hãy so sánh: transfer learning từ mô hình công khai thường rẻ hơn nhiều so với tự chạy SSL trên 1 triệu ảnh.",
  },
  {
    id: "vision-ssl-04",
    syllabusId: "vision-ssl",
    difficulty: "apply",
    format: "single-choice",
    stem: "Đánh giá chất lượng biểu diễn học được từ SSL thường dùng giao thức nào?",
    choices: [
      "Đo loss tự giám sát trên tập test.",
      "Linear probing: đóng băng encoder, huấn luyện một bộ phân loại tuyến tính trên đặc trưng và đo accuracy ở nhiệm vụ có nhãn.",
      "Đếm số tham số của encoder.",
      "Đo thời gian huấn luyện.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: loss tự giám sát không so sánh được giữa các phương pháp có mục tiêu khác nhau.",
      "Đúng: nếu một bộ phân loại tuyến tính đã tách tốt các lớp thì biểu diễn đã mã hoá được thông tin ngữ nghĩa.",
      "Sai: số tham số không nói gì về chất lượng biểu diễn.",
      "Sai: đó là chỉ số chi phí.",
    ],
    explanation:
      "Giao thức bổ sung thường đi kèm là finetune toàn phần và đánh giá few-shot (k-NN trên đặc trưng), để thấy biểu diễn hữu ích ở các mức dữ liệu nhãn khác nhau.",
  },
  {
    id: "vision-ssl-05",
    syllabusId: "vision-ssl",
    difficulty: "advanced",
    format: "single-choice",
    stem: "Trong contrastive learning, nếu chỉ tối ưu việc kéo các cặp dương lại gần nhau mà không có cơ chế nào khác, điều gì xảy ra?",
    choices: [
      "Mô hình học được biểu diễn tốt nhất có thể.",
      "Biểu diễn sụp đổ: encoder xuất ra cùng một vector hằng cho mọi ảnh, khi đó loss đạt cực tiểu tầm thường; cần mẫu âm, hoặc cơ chế như stop-gradient/mạng đích (BYOL) hay khử tương quan chiều (Barlow Twins).",
      "Mô hình báo lỗi khi huấn luyện.",
      "Mô hình chuyển thành autoencoder.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: nghiệm tối ưu của mục tiêu này lại chính là nghiệm vô dụng.",
      "Đúng: nhận ra nghiệm tầm thường và biết các cơ chế chống sụp đổ.",
      "Sai: không có lỗi nào, loss giảm rất đẹp về 0.",
      "Sai: không liên quan tới tái tạo đầu vào.",
    ],
    trap: "Bẫy là đường cong loss hoàn hảo. Đây là ví dụ mẫu mực cho việc một hàm mục tiêu thiếu ràng buộc sẽ được tối ưu theo cách bạn không mong muốn.",
    explanation:
      "Mọi phương pháp SSL contrastive đều phải trả lời câu hỏi “điều gì ngăn biểu diễn sụp đổ?”. SimCLR dùng mẫu âm trong batch; BYOL dùng mạng đích và stop-gradient; VICReg/Barlow Twins ràng buộc phương sai và hiệp phương sai.",
  },

  /* ---------------- clip ---------------- */
  {
    id: "clip-01",
    syllabusId: "clip",
    difficulty: "recall",
    format: "single-choice",
    stem: "CLIP được huấn luyện trên dữ liệu gì?",
    choices: [
      "Các cặp (ảnh, đoạn văn bản mô tả) thu thập quy mô lớn từ web.",
      "Ảnh được gán nhãn thủ công theo 1.000 lớp.",
      "Chỉ văn bản, không có ảnh.",
      "Video có phụ đề thời gian thực.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: giám sát đến từ chính văn bản đi kèm ảnh trên web.",
      "Sai: đó là cách xây dựng ImageNet.",
      "Sai: CLIP là mô hình đa phương thức.",
      "Sai: CLIP làm việc với ảnh tĩnh.",
    ],
    explanation:
      "Nhờ giám sát bằng ngôn ngữ tự nhiên, CLIP không bị giới hạn trong một tập nhãn cố định — đây là điều kiện để nó phân loại zero-shot.",
  },
  {
    id: "clip-02",
    syllabusId: "clip",
    difficulty: "understand",
    format: "single-choice",
    stem: "Mục tiêu contrastive của CLIP là gì?",
    choices: [
      "Tái tạo ảnh từ văn bản.",
      "Trong một batch, làm cho embedding của cặp (ảnh, văn bản) đúng có độ tương đồng cao nhất so với mọi cặp ghép sai.",
      "Dự đoán từ tiếp theo trong chú thích.",
      "Phân loại ảnh vào 1.000 lớp cố định.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: CLIP không sinh ảnh.",
      "Đúng: với batch N cặp, bài toán trở thành phân loại N chiều theo cả hai hướng.",
      "Sai: đó là mục tiêu của mô hình ngôn ngữ.",
      "Sai: CLIP không dùng tập nhãn cố định.",
    ],
    explanation:
      "Kết quả là hai encoder được đưa vào một không gian embedding *chung*, nhờ đó so sánh trực tiếp ảnh với văn bản bằng cosine similarity mới có ý nghĩa.",
  },
  {
    id: "clip-03",
    syllabusId: "clip",
    difficulty: "apply",
    format: "single-choice",
    stem: "Dùng CLIP để phân loại zero-shot ảnh thành 3 lớp {mèo, chó, ngựa} được thực hiện thế nào?",
    choices: [
      "Finetune CLIP trên dữ liệu có nhãn của 3 lớp đó.",
      "Tạo câu mô tả cho từng lớp (ví dụ “một bức ảnh của con mèo”), mã hoá chúng bằng text encoder, rồi chọn lớp có cosine similarity cao nhất với embedding của ảnh.",
      "Dùng generator của CLIP để sinh ảnh mẫu cho mỗi lớp rồi so sánh pixel.",
      "Huấn luyện một bộ phân loại tuyến tính trên đặc trưng ảnh.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: nếu finetune thì đã không còn là zero-shot.",
      "Đúng: tập nhãn được định nghĩa bằng ngôn ngữ ngay tại thời điểm suy luận.",
      "Sai: CLIP không có bộ sinh ảnh.",
      "Sai: đó là linear probing, cần dữ liệu có nhãn.",
    ],
    explanation:
      "Sức mạnh nằm ở chỗ đổi tập nhãn chỉ tốn vài dòng văn bản, không cần huấn luyện lại — điều bất khả thi với bộ phân loại softmax cố định.",
  },
  {
    id: "clip-04",
    syllabusId: "clip",
    difficulty: "apply",
    format: "single-choice",
    stem: "Vì sao mẫu câu (prompt template) ảnh hưởng đáng kể tới độ chính xác zero-shot của CLIP?",
    choices: [
      "Vì text encoder chỉ nhận câu dài trên 10 từ.",
      "Vì embedding văn bản phụ thuộc toàn bộ câu; câu đầy đủ theo phong cách chú thích web (“một bức ảnh của …”) gần với phân phối huấn luyện hơn so với một từ đơn lẻ.",
      "Vì độ dài câu quyết định số chiều embedding.",
      "Vì CLIP dịch câu sang tiếng Anh trước khi mã hoá.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: không có ràng buộc độ dài tối thiểu như vậy.",
      "Đúng: đây là lý do kỹ thuật prompt ensembling (trung bình nhiều mẫu câu) thường cải thiện kết quả.",
      "Sai: số chiều embedding cố định.",
      "Sai: không có bước dịch tự động nào.",
    ],
    explanation:
      "Bài học tổng quát cho mọi mô hình nền: cách bạn *đặt câu hỏi* là một phần của hệ thống và cần được dò tìm như siêu tham số.",
  },
  {
    id: "clip-05",
    syllabusId: "clip",
    difficulty: "advanced",
    format: "single-choice",
    stem: "Nhóm dùng CLIP zero-shot để phân loại ảnh chụp X-quang thành “bình thường” và “bất thường”, kết quả rất kém. Giải thích đúng nhất là gì?",
    choices: [
      "CLIP bị lỗi cài đặt.",
      "Ảnh y khoa và thuật ngữ chuyên môn tương ứng gần như không xuất hiện trong dữ liệu ảnh–chú thích web mà CLIP được huấn luyện, nên biểu diễn của nó không tách được các dấu hiệu bệnh lý tinh vi.",
      "Cần đổi prompt sang tiếng Việt.",
      "Ảnh X-quang là ảnh xám nên CLIP không xử lý được.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: mô hình chạy đúng như thiết kế; vấn đề nằm ở miền dữ liệu.",
      "Đúng: năng lực zero-shot bị chặn bởi phạm vi phân phối tiền huấn luyện.",
      "Sai: CLIP gốc mạnh nhất với tiếng Anh; đổi ngôn ngữ không giải quyết vấn đề miền.",
      "Sai: ảnh xám vẫn đưa vào được dưới dạng ba kênh trùng nhau.",
    ],
    trap: "Bẫy là ngoại suy từ các trình diễn zero-shot ấn tượng trên ảnh đời thường sang miền chuyên biệt. Zero-shot chỉ mạnh trong phạm vi mà dữ liệu tiền huấn luyện bao phủ.",
    explanation:
      "Hướng đúng cho miền chuyên biệt: dùng mô hình đã tiền huấn luyện trên dữ liệu y khoa, hoặc finetune có giám sát trên dữ liệu chuyên ngành đã được chuyên gia gán nhãn.",
  },

  /* ---------------- diffusion ---------------- */
  {
    id: "diffusion-01",
    syllabusId: "diffusion",
    difficulty: "recall",
    format: "single-choice",
    stem: "Mô hình khuếch tán hoạt động theo nguyên lý nào?",
    choices: [
      "Quá trình xuôi thêm dần nhiễu Gaussian vào dữ liệu; mô hình học quá trình ngược để khử nhiễu từng bước, từ nhiễu thuần về mẫu dữ liệu.",
      "Hai mạng cạnh tranh trong trò chơi minimax.",
      "Nén dữ liệu qua nút thắt rồi tái tạo.",
      "Dự đoán token kế tiếp trong chuỗi.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: đây là định nghĩa của mô hình khuếch tán khử nhiễu.",
      "Sai: đó là GAN.",
      "Sai: đó là autoencoder.",
      "Sai: đó là mô hình ngôn ngữ tự hồi quy.",
    ],
    explanation:
      "Quá trình xuôi cố định và không có tham số; toàn bộ việc học nằm ở quá trình ngược, nơi mạng dự đoán thành phần nhiễu cần loại bỏ ở mỗi bước.",
  },
  {
    id: "diffusion-02",
    syllabusId: "diffusion",
    difficulty: "understand",
    format: "single-choice",
    stem: "Trong huấn luyện mô hình khuếch tán, mạng thường được huấn luyện để dự đoán gì?",
    choices: [
      "Trực tiếp ảnh sạch từ nhiễu thuần trong một bước.",
      "Thành phần nhiễu đã được thêm vào ở một bước thời gian t được chọn ngẫu nhiên.",
      "Nhãn lớp của ảnh.",
      "Bước thời gian t từ ảnh nhiễu.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: một bước từ nhiễu thuần về ảnh sạch là bài toán quá khó; khuếch tán chia nhỏ nó ra.",
      "Đúng: mục tiêu tiêu chuẩn là hồi quy MSE trên nhiễu ε.",
      "Sai: đó là bài toán phân loại.",
      "Sai: t được cho trước như đầu vào điều kiện.",
    ],
    explanation:
      "Chính việc chia bài toán sinh khó thành hàng loạt bước khử nhiễu nhỏ, mỗi bước là một bài hồi quy đơn giản, khiến việc huấn luyện ổn định hơn hẳn GAN.",
  },
  {
    id: "diffusion-03",
    syllabusId: "diffusion",
    difficulty: "apply",
    format: "single-choice",
    stem: "Giảm số bước sampling từ 1.000 xuống 20 khi sinh ảnh dẫn tới điều gì?",
    choices: [
      "Sinh nhanh hơn nhiều nhưng chất lượng thường giảm, trừ khi dùng bộ lấy mẫu hiệu quả (DDIM, DPM-Solver) hoặc mô hình đã được chưng cất.",
      "Chất lượng tăng vì ít nhiễu tích luỹ.",
      "Không có thay đổi nào.",
      "Mô hình phải được huấn luyện lại từ đầu.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: đây là đánh đổi trung tâm giữa tốc độ và chất lượng trong sinh ảnh khuếch tán.",
      "Sai: ít bước hơn làm mỗi bước phải nhảy xa hơn, sai số xấp xỉ lớn hơn.",
      "Sai: số bước ảnh hưởng trực tiếp cả chi phí lẫn chất lượng.",
      "Sai: số bước sampling là lựa chọn lúc suy luận.",
    ],
    explanation:
      "Số bước sampling là siêu tham số *lúc suy luận*, nên có thể dò mà không cần huấn luyện lại — điều rất tiện khi cần cân đối chất lượng với chi phí phục vụ.",
  },
  {
    id: "diffusion-04",
    syllabusId: "diffusion",
    difficulty: "apply",
    format: "single-choice",
    stem: "Tăng hệ số classifier-free guidance khi sinh ảnh từ văn bản gây tác dụng gì?",
    choices: [
      "Ảnh bám sát mô tả văn bản hơn nhưng độ đa dạng giảm và có thể xuất hiện hiện tượng bão hoà, ảnh trông giả tạo.",
      "Ảnh đa dạng hơn và bám sát văn bản hơn cùng lúc.",
      "Tốc độ sinh tăng lên.",
      "Không ảnh hưởng gì tới ảnh đầu ra.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: đây là đánh đổi giữa độ trung thành với điều kiện và độ đa dạng của mẫu.",
      "Sai: hai mục tiêu này đối nghịch nhau.",
      "Sai: guidance thường yêu cầu hai lượt đánh giá mỗi bước nên *chậm* hơn.",
      "Sai: đây là một trong những tham số ảnh hưởng mạnh nhất.",
    ],
    explanation:
      "Giá trị guidance quá cao làm ảnh quá bão hoà và mất tự nhiên; quá thấp làm ảnh đẹp nhưng lệch khỏi mô tả. Đây là tham số bắt buộc phải dò theo từng ứng dụng.",
  },
  {
    id: "diffusion-05",
    syllabusId: "diffusion",
    difficulty: "advanced",
    format: "single-choice",
    stem: "Latent diffusion (như Stable Diffusion) khác diffusion trên không gian pixel ở điểm nào và vì sao điều đó quan trọng?",
    choices: [
      "Nó bỏ hoàn toàn quá trình khuếch tán.",
      "Nó thực hiện khuếch tán trong không gian tiềm ẩn nén bởi một autoencoder, nên chi phí tính toán giảm rất nhiều lần, cho phép sinh ảnh độ phân giải cao với phần cứng phổ thông.",
      "Nó chỉ sinh được ảnh xám.",
      "Nó thay U-Net bằng một mạng fully connected.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: quá trình khuếch tán vẫn là cốt lõi, chỉ đổi không gian thực hiện.",
      "Đúng: ví dụ ảnh 512×512 được nén xuống latent 64×64 — số phần tử giảm 64 lần.",
      "Sai: nó sinh ảnh màu.",
      "Sai: U-Net vẫn là backbone khử nhiễu.",
    ],
    trap: "Bẫy là nghĩ latent diffusion là một họ mô hình sinh hoàn toàn khác. Nó vẫn là mô hình khuếch tán; đóng góp nằm ở việc *đổi không gian làm việc* để giảm chi phí.",
    explanation:
      "Đây là mẫu thiết kế đáng nhớ: khi phép toán quá đắt trên không gian gốc, hãy nén sang một không gian tiềm ẩn giữ đủ ngữ nghĩa rồi làm việc ở đó.",
  },
];
