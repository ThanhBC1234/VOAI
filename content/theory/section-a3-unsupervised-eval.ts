/**
 * Section A3 — Học không giám sát và đánh giá mô hình: k-means, PCA, t-SNE/UMAP,
 * DBSCAN/phân cụm phân cấp/phổ, các chỉ số, underfitting–overfitting, dò siêu
 * tham số, cross-validation và confusion matrix/ROC.
 *
 * Mỗi mục syllabus có 5 câu: 1 Nhận biết, 1 Thông hiểu, 2 Vận dụng,
 * 1 Vận dụng cao.
 */

import type { TheoryQuestion } from "./types";

export const sectionA3Questions: readonly TheoryQuestion[] = [
  /* ---------------- kmeans ---------------- */
  {
    id: "kmeans-01",
    syllabusId: "kmeans",
    difficulty: "recall",
    format: "single-choice",
    stem: "k-means tối ưu hoá đại lượng nào?",
    choices: [
      "Tổng bình phương khoảng cách từ mỗi điểm tới tâm cụm của nó (inertia).",
      "Tổng khoảng cách giữa các tâm cụm.",
      "Entropy của phân bố nhãn trong mỗi cụm.",
      "Hệ số tương quan giữa các đặc trưng.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: mục tiêu là cực tiểu WCSS — tổng bình phương sai lệch trong cụm.",
      "Sai: khoảng cách giữa các tâm là hệ quả, không phải hàm mục tiêu.",
      "Sai: k-means không dùng nhãn.",
      "Sai: đây không phải đại lượng k-means tối ưu.",
    ],
    explanation:
      "Thuật toán lặp hai bước: gán mỗi điểm về tâm gần nhất, rồi đặt lại tâm bằng trung bình các điểm trong cụm. Mỗi bước đều làm inertia không tăng, nên thuật toán luôn hội tụ.",
  },
  {
    id: "kmeans-02",
    syllabusId: "kmeans",
    difficulty: "understand",
    format: "single-choice",
    stem: "Vì sao nên chạy k-means nhiều lần với khởi tạo khác nhau (`n_init > 1`)?",
    choices: [
      "Vì thuật toán không xác định nên kết quả luôn khác nhau hoàn toàn.",
      "Vì k-means chỉ bảo đảm hội tụ về cực tiểu địa phương, phụ thuộc vị trí tâm khởi tạo.",
      "Vì mỗi lần chạy dùng một số cụm khác nhau.",
      "Vì cần lấy trung bình các tâm của tất cả các lần chạy.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: kết quả có tính lặp lại khi cố định seed; vấn đề là chất lượng cực tiểu.",
      "Đúng: khởi tạo xấu có thể cho nghiệm với inertia cao hơn hẳn nghiệm tốt nhất.",
      "Sai: k giữ nguyên qua các lần khởi tạo.",
      "Sai: cách làm đúng là *chọn* lần chạy có inertia nhỏ nhất, không phải lấy trung bình.",
    ],
    explanation:
      "k-means++ chọn tâm khởi tạo phân tán theo xác suất tỷ lệ với bình phương khoảng cách, nhờ đó giảm mạnh rủi ro rơi vào cực tiểu địa phương kém.",
  },
  {
    id: "kmeans-03",
    syllabusId: "kmeans",
    difficulty: "apply",
    format: "numeric",
    stem: "Một cụm gồm ba điểm (1, 2), (3, 4) và (5, 0). Tính tổng hai toạ độ của tâm cụm sau bước cập nhật.",
    answer: 5,
    tolerance: 0.001,
    calculation: [
      "Toạ độ x của tâm: (1 + 3 + 5)/3 = 3.",
      "Toạ độ y của tâm: (2 + 4 + 0)/3 = 2.",
      "Tâm là (3, 2), tổng hai toạ độ = 5.",
    ],
    explanation:
      "Tâm cụm là trung bình cộng theo từng chiều. Chính vì dùng trung bình mà k-means nhạy với ngoại lai; k-medoids dùng mẫu thật làm tâm nên bền hơn.",
  },
  {
    id: "kmeans-04",
    syllabusId: "kmeans",
    difficulty: "apply",
    format: "single-choice",
    stem: "Vẽ inertia theo k từ 1 đến 10, đồ thị giảm đơn điệu và không có “khuỷu tay” rõ ràng. Kết luận nào hợp lý nhất?",
    choices: [
      "Chọn k = 10 vì inertia nhỏ nhất.",
      "Inertia luôn giảm khi tăng k, nên không có khuỷu tay nghĩa là dữ liệu không có cấu trúc cụm rõ; nên đối chiếu bằng silhouette và kiến thức miền.",
      "Chọn k = 1 vì đồ thị không có khuỷu.",
      "Thuật toán đã cài đặt sai.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: k = n cho inertia bằng 0, nên tiêu chí “inertia nhỏ nhất” luôn dẫn tới k lớn nhất.",
      "Đúng: elbow chỉ là gợi ý; thiếu khuỷu là một kết quả có ý nghĩa, không phải lỗi.",
      "Sai: k = 1 là mô hình không phân cụm gì cả.",
      "Sai: hành vi giảm đơn điệu của inertia là đúng lý thuyết.",
    ],
    explanation:
      "Silhouette đo đồng thời độ chặt trong cụm và độ tách giữa các cụm nên nói được nhiều hơn inertia. Với dữ liệu có nhãn tham chiếu, có thể dùng ARI hoặc NMI.",
  },
  {
    id: "kmeans-05",
    syllabusId: "kmeans",
    difficulty: "advanced",
    format: "multi-select",
    stem: "Chọn tất cả tình huống mà k-means cho kết quả kém dù được cấu hình đúng số cụm.",
    choices: [
      "Các cụm có dạng hình vành khăn lồng nhau.",
      "Các cụm có kích thước rất chênh lệch về số điểm và bán kính.",
      "Các cụm là những đám cầu tách rời, kích thước tương đương.",
      "Các đặc trưng chưa được chuẩn hoá và khác nhau vài bậc độ lớn.",
      "Các cụm có dạng thuôn dài theo hướng chéo.",
    ],
    answerIndexes: [0, 1, 3, 4],
    choiceNotes: [
      "Kém: k-means chia không gian bằng các siêu phẳng trung trực, không tạo được vùng cong bao quanh.",
      "Kém: mục tiêu bình phương khoảng cách thiên vị các cụm có kích thước tương đương nhau.",
      "Tốt: đây đúng là giả định mà k-means được thiết kế cho.",
      "Kém: khoảng cách bị chi phối bởi đặc trưng có biên độ lớn nhất.",
      "Kém: cụm thuôn dài bị cắt ngang vì k-means ngầm giả định cụm đẳng hướng.",
    ],
    scoring: "all-or-nothing",
    trap: "Điểm phân loại nằm ở chỗ nhận ra k-means có *ba* giả định ngầm cùng lúc: cụm lồi, đẳng hướng và kích thước tương đương. Chỉ nhớ một giả định sẽ bỏ sót phương án.",
    explanation:
      "Thay thế theo dạng hỏng: cụm cong hoặc mật độ khác nhau dùng DBSCAN; cụm elip dùng Gaussian Mixture với ma trận hiệp phương sai đầy đủ; cụm lồng nhau dùng spectral clustering.",
  },

  /* ---------------- pca ---------------- */
  {
    id: "pca-01",
    syllabusId: "pca",
    difficulty: "recall",
    format: "single-choice",
    stem: "Thành phần chính thứ nhất trong PCA là hướng nào?",
    choices: [
      "Hướng có phương sai của dữ liệu chiếu lên là lớn nhất.",
      "Hướng song song với trục toạ độ có giá trị trung bình lớn nhất.",
      "Hướng phân tách hai lớp tốt nhất.",
      "Hướng có tương quan với nhãn cao nhất.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: đó là vector riêng ứng với trị riêng lớn nhất của ma trận hiệp phương sai.",
      "Sai: PCA không bị ràng buộc theo trục gốc, và trung bình được trừ đi trước.",
      "Sai: đó là mục tiêu của LDA, một phương pháp có giám sát.",
      "Sai: PCA hoàn toàn không dùng nhãn.",
    ],
    explanation:
      "Các thành phần trực giao đôi một và được sắp theo phương sai giảm dần. Nhớ rằng PCA luôn trừ trung bình trước khi tính hiệp phương sai.",
  },
  {
    id: "pca-02",
    syllabusId: "pca",
    difficulty: "understand",
    format: "single-choice",
    stem: "Vì sao thường phải chuẩn hoá đặc trưng trước khi chạy PCA?",
    choices: [
      "Vì PCA không chạy được với giá trị âm.",
      "Vì PCA tối đa hoá phương sai, nên đặc trưng có đơn vị đo lớn sẽ chi phối các thành phần chính chỉ vì thang đo, không phải vì tầm quan trọng.",
      "Vì chuẩn hoá làm tăng số thành phần chính.",
      "Vì nếu không chuẩn hoá thì các thành phần không còn trực giao.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: PCA xử lý được giá trị âm bình thường.",
      "Đúng: đổi đơn vị từ mét sang milimét làm phương sai tăng 10⁶ lần và kéo thành phần chính về đặc trưng đó.",
      "Sai: số thành phần tối đa bằng min(số mẫu, số đặc trưng), không đổi vì chuẩn hoá.",
      "Sai: tính trực giao được bảo đảm bởi phép phân tích riêng.",
    ],
    explanation:
      "Chuẩn hoá z-score trước PCA tương đương làm PCA trên ma trận tương quan thay vì ma trận hiệp phương sai. Chỉ bỏ qua bước này khi mọi đặc trưng đã cùng đơn vị và cùng ý nghĩa thang đo.",
  },
  {
    id: "pca-03",
    syllabusId: "pca",
    difficulty: "apply",
    format: "numeric",
    stem: "Tỷ lệ phương sai giải thích của các thành phần lần lượt là 0.50, 0.30, 0.12, 0.08. Cần giữ ít nhất bao nhiêu thành phần để đạt tối thiểu 90% phương sai?",
    answer: 3,
    tolerance: 0,
    calculation: [
      "Tích luỹ 1 thành phần: 0.50 (chưa đủ).",
      "Tích luỹ 2 thành phần: 0.50 + 0.30 = 0.80 (chưa đủ).",
      "Tích luỹ 3 thành phần: 0.80 + 0.12 = 0.92 ≥ 0.90 → chọn 3.",
    ],
    explanation:
      "Trong scikit-learn có thể viết thẳng `PCA(n_components=0.90)` để thư viện tự chọn số thành phần theo ngưỡng phương sai tích luỹ.",
  },
  {
    id: "pca-04",
    syllabusId: "pca",
    difficulty: "apply",
    format: "single-choice",
    stem: "Sau khi giảm chiều bằng PCA, accuracy của bộ phân loại giảm rõ rệt dù 95% phương sai được giữ lại. Giải thích hợp lý nhất là gì?",
    choices: [
      "PCA đã cài đặt sai, vì giữ 95% phương sai luôn giữ được thông tin phân loại.",
      "PCA không dùng nhãn, nên hướng có phương sai nhỏ vẫn có thể là hướng phân tách hai lớp; loại bỏ nó làm mất tín hiệu phân loại.",
      "Vì số đặc trưng giảm nên mô hình chắc chắn underfit.",
      "Vì PCA làm dữ liệu không còn tuyến tính.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: phương sai lớn và khả năng phân biệt lớp là hai khái niệm khác nhau.",
      "Đúng: đây là hạn chế cốt lõi của một phương pháp không giám sát dùng cho bài toán có giám sát.",
      "Sai: giảm chiều không tự động gây underfit; vấn đề là *thông tin nào* bị bỏ.",
      "Sai: PCA là phép biến đổi tuyến tính, không tạo phi tuyến.",
    ],
    explanation:
      "Nếu mục tiêu là phân loại, hãy so sánh PCA với các phương pháp có giám sát (LDA, chọn đặc trưng theo nhãn) và luôn đặt số thành phần vào pipeline để dò như một siêu tham số.",
  },
  {
    id: "pca-05",
    syllabusId: "pca",
    difficulty: "advanced",
    format: "true-false-set",
    stem: "Xét việc sử dụng PCA trong một pipeline học máy.",
    statements: [
      {
        text: "PCA phải được `fit` trên tập train rồi mới `transform` tập test.",
        answer: true,
        note: "Ma trận hiệp phương sai và vector trung bình là tham số học được; fit trên toàn bộ dữ liệu là leakage.",
      },
      {
        text: "PCA là phép chọn đặc trưng: nó giữ lại một tập con các đặc trưng gốc.",
        answer: false,
        note: "PCA là phép *trích xuất* đặc trưng — mỗi thành phần là tổ hợp tuyến tính của tất cả đặc trưng gốc, nên khả năng diễn giải theo biến gốc bị mất.",
      },
      {
        text: "Dấu của một thành phần chính là tuỳ ý; đảo dấu toàn bộ một thành phần không làm đổi ý nghĩa.",
        answer: true,
        note: "Vector riêng xác định sai khác một hằng số nhân; các thư viện thường cố định dấu theo quy ước riêng.",
      },
      {
        text: "PCA luôn cải thiện tốc độ và độ chính xác của mô hình phía sau.",
        answer: false,
        note: "Tốc độ thường cải thiện, nhưng độ chính xác có thể giảm; PCA còn tốn chi phí tính toán riêng trên dữ liệu rất lớn.",
      },
    ],
    trap: "Ý (b) là bẫy vì cụm từ “giảm chiều” dễ bị hiểu thành “bỏ bớt cột”. Nhầm lẫn này dẫn tới việc diễn giải sai hệ số mô hình sau PCA theo tên biến gốc.",
    explanation:
      "Nếu bài toán yêu cầu diễn giải theo biến gốc, PCA là lựa chọn sai; hãy dùng chọn đặc trưng hoặc mô hình có khả năng diễn giải trực tiếp.",
  },

  /* ---------------- tsne-umap ---------------- */
  {
    id: "tsne-umap-01",
    syllabusId: "tsne-umap",
    difficulty: "recall",
    format: "single-choice",
    stem: "Mục đích chính của t-SNE và UMAP là gì?",
    choices: [
      "Nén dữ liệu để tiết kiệm bộ nhớ khi huấn luyện.",
      "Chiếu dữ liệu nhiều chiều xuống 2–3 chiều để trực quan hoá cấu trúc lân cận.",
      "Chọn ra các đặc trưng quan trọng nhất.",
      "Thay thế hoàn toàn cho PCA trong mọi tình huống.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: chúng không được thiết kế làm bước nén phục vụ huấn luyện.",
      "Đúng: chúng ưu tiên giữ quan hệ láng giềng cục bộ để mắt người đọc được.",
      "Sai: đầu ra là toạ độ mới, không phải tập con đặc trưng.",
      "Sai: PCA vẫn phù hợp hơn khi cần phép biến đổi tuyến tính, có thể đảo ngược và áp cho dữ liệu mới.",
    ],
    explanation:
      "Đây là công cụ *khám phá*. Dùng toạ độ t-SNE làm đặc trưng đầu vào cho mô hình là sai mục đích và thường gây leakage nếu tính trên toàn bộ dữ liệu.",
  },
  {
    id: "tsne-umap-02",
    syllabusId: "tsne-umap",
    difficulty: "understand",
    format: "single-choice",
    stem: "Trên một biểu đồ t-SNE, hai cụm nằm cách nhau rất xa còn hai cụm khác nằm sát nhau. Kết luận nào an toàn?",
    choices: [
      "Hai cụm ở xa nhau khác nhau nhiều hơn hẳn so với hai cụm ở gần nhau.",
      "Khoảng cách giữa các cụm trên biểu đồ t-SNE nói chung không diễn giải được; chỉ quan hệ láng giềng cục bộ mới đáng tin.",
      "Kích thước tương đối của các cụm phản ánh đúng mật độ dữ liệu gốc.",
      "Số cụm nhìn thấy chính là số cụm thật trong dữ liệu.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: t-SNE tối ưu quan hệ lân cận, không bảo toàn khoảng cách toàn cục.",
      "Đúng: đây là cảnh báo quan trọng nhất khi đọc biểu đồ t-SNE.",
      "Sai: t-SNE có xu hướng làm các cụm nở ra tương đương nhau bất kể mật độ gốc.",
      "Sai: số cụm nhìn thấy phụ thuộc mạnh vào perplexity và số vòng lặp.",
    ],
    explanation:
      "UMAP giữ cấu trúc toàn cục tốt hơn t-SNE nhưng vẫn không cho phép đo khoảng cách trên biểu đồ như đo trên dữ liệu gốc.",
  },
  {
    id: "tsne-umap-03",
    syllabusId: "tsne-umap",
    difficulty: "apply",
    format: "single-choice",
    stem: "Tăng `perplexity` của t-SNE từ 5 lên 50 thường dẫn tới điều gì?",
    choices: [
      "Biểu đồ chú trọng cấu trúc rộng hơn, các cụm nhỏ có xu hướng gộp lại.",
      "Biểu đồ chú trọng chi tiết cục bộ hơn, xuất hiện nhiều cụm vụn.",
      "Không có thay đổi nào vì perplexity chỉ ảnh hưởng tốc độ.",
      "Thuật toán chuyển sang chế độ có giám sát.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: perplexity đại khái là số láng giềng hiệu dụng mà mỗi điểm cân nhắc.",
      "Sai: đó là hiệu ứng khi *giảm* perplexity.",
      "Sai: perplexity là tham số hình dạng, ảnh hưởng trực tiếp kết quả.",
      "Sai: t-SNE luôn không giám sát.",
    ],
    explanation:
      "Quy trình đúng là chạy vài mức perplexity và chỉ tin những cấu trúc còn tồn tại ở mọi mức. Một cụm chỉ xuất hiện ở đúng một cấu hình thì không đáng tin.",
  },
  {
    id: "tsne-umap-04",
    syllabusId: "tsne-umap",
    difficulty: "apply",
    format: "single-choice",
    stem: "Cần chiếu các điểm dữ liệu *mới* vào cùng không gian 2 chiều đã dựng trước đó. Nhận định nào đúng?",
    choices: [
      "t-SNE trong scikit-learn không cung cấp `transform` cho dữ liệu mới; UMAP thì có.",
      "Cả hai đều có `transform` chuẩn cho dữ liệu mới.",
      "Chỉ cần chạy lại t-SNE trên tập gộp, toạ độ cũ sẽ được giữ nguyên.",
      "PCA không làm được việc này.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: `TSNE` chỉ có `fit_transform`; `umap.UMAP` có `transform` cho điểm mới.",
      "Sai: đây chính là khác biệt thực dụng giữa hai công cụ.",
      "Sai: chạy lại cho bố cục hoàn toàn khác, kể cả với cùng dữ liệu cũ.",
      "Sai: PCA lưu ma trận chiếu nên áp cho dữ liệu mới rất dễ.",
    ],
    explanation:
      "Nếu cần một phép nhúng ổn định, áp được cho dữ liệu mới và tái lập được, hãy dùng PCA hoặc một encoder học được thay vì t-SNE.",
  },
  {
    id: "tsne-umap-05",
    syllabusId: "tsne-umap",
    difficulty: "advanced",
    format: "single-choice",
    stem: "Một nhóm chạy t-SNE trên dữ liệu nhiễu hoàn toàn ngẫu nhiên và thu được biểu đồ có vài cụm tách bạch trông rất thuyết phục. Điều này chứng minh gì?",
    choices: [
      "Dữ liệu thật sự có cấu trúc cụm ẩn.",
      "t-SNE có thể tạo ra cụm là sản phẩm của thuật toán ngay cả khi dữ liệu không có cấu trúc; biểu đồ đẹp không phải bằng chứng.",
      "Perplexity đã được đặt quá cao.",
      "Cần tăng số vòng lặp để các cụm biến mất.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: đây chính là kết luận sai mà thí nghiệm cảnh báo.",
      "Đúng: đây là lý do t-SNE phải được coi là công cụ đặt giả thuyết, không phải công cụ kiểm định.",
      "Sai: hiện tượng xuất hiện ở nhiều mức perplexity khác nhau.",
      "Sai: chạy lâu hơn không làm cụm giả tự biến mất.",
    ],
    trap: "Bẫy là sức thuyết phục thị giác. Não người rất giỏi thấy cụm, còn t-SNE lại được thiết kế để làm nổi bật lân cận — hai thứ này cộng lại tạo ra bằng chứng giả rất mạnh.",
    explanation:
      "Muốn kết luận về sự tồn tại của cụm, phải kiểm định trên chính không gian gốc: silhouette, độ ổn định của phân cụm qua các lần lấy mẫu con, hoặc so với dữ liệu mô phỏng không có cấu trúc.",
  },

  /* ---------------- other-clustering ---------------- */
  {
    id: "other-clustering-01",
    syllabusId: "other-clustering",
    difficulty: "recall",
    format: "single-choice",
    stem: "Đặc điểm nào phân biệt DBSCAN với k-means?",
    choices: [
      "DBSCAN cần khai báo trước số cụm, k-means thì không.",
      "DBSCAN tự xác định số cụm và có nhãn riêng cho điểm nhiễu, k-means gán mọi điểm vào một cụm nào đó.",
      "DBSCAN chỉ dùng cho dữ liệu hai chiều.",
      "DBSCAN luôn nhanh hơn k-means.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: đảo ngược — k-means mới cần k.",
      "Đúng: DBSCAN nhận `eps` và `min_samples` thay vì số cụm, và gán nhãn −1 cho nhiễu.",
      "Sai: DBSCAN dùng được ở số chiều bất kỳ, dù hiệu quả giảm khi chiều cao.",
      "Sai: chi phí phụ thuộc cấu trúc chỉ mục không gian và mật độ dữ liệu.",
    ],
    explanation:
      "Khả năng đánh dấu nhiễu là ưu thế thực dụng lớn: k-means buộc phải nhét cả ngoại lai vào một cụm, làm lệch tâm cụm đó.",
  },
  {
    id: "other-clustering-02",
    syllabusId: "other-clustering",
    difficulty: "understand",
    format: "single-choice",
    stem: "Trong DBSCAN, tăng `eps` lên rất lớn dẫn tới điều gì?",
    choices: [
      "Số cụm tăng và số điểm nhiễu tăng.",
      "Các cụm bị gộp lại với nhau, số điểm nhiễu giảm, cuối cùng có thể chỉ còn một cụm duy nhất.",
      "Thuật toán chuyển thành phân cụm phân cấp.",
      "Không ảnh hưởng vì `min_samples` mới là tham số quyết định.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: đó là hiệu ứng khi *giảm* eps.",
      "Đúng: bán kính lân cận lớn làm mọi điểm trở nên liên thông mật độ với nhau.",
      "Sai: DBSCAN không đổi họ thuật toán vì tham số.",
      "Sai: hai tham số phối hợp; eps quyết định bán kính lân cận.",
    ],
    explanation:
      "Cách chọn eps thông dụng: vẽ đồ thị khoảng cách tới láng giềng thứ k của mọi điểm, sắp tăng dần và chọn eps ở vị trí đồ thị bẻ gấp.",
  },
  {
    id: "other-clustering-03",
    syllabusId: "other-clustering",
    difficulty: "apply",
    format: "single-choice",
    stem: "Dữ liệu hai chiều gồm hai vòng tròn đồng tâm, mỗi vòng là một cụm. Thuật toán nào có khả năng tách đúng?",
    choices: [
      "k-means với k = 2.",
      "DBSCAN hoặc spectral clustering.",
      "PCA giữ 1 thành phần.",
      "Phân cụm phân cấp với linkage Ward.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: k-means chỉ tạo được ranh giới tuyến tính giữa hai tâm, sẽ cắt đôi hai vòng.",
      "Đúng: DBSCAN nối theo mật độ liên thông; spectral clustering làm việc trên đồ thị lân cận nên tách được cụm không lồi.",
      "Sai: PCA không phải thuật toán phân cụm.",
      "Sai: Ward tối thiểu hoá phương sai trong cụm nên cũng thiên về cụm cầu.",
    ],
    explanation:
      "Nguyên tắc chọn: cụm lồi và đẳng hướng thì k-means/Ward; cụm cong hoặc liên thông theo mật độ thì DBSCAN/spectral.",
  },
  {
    id: "other-clustering-04",
    syllabusId: "other-clustering",
    difficulty: "apply",
    format: "single-choice",
    stem: "Với phân cụm phân cấp, dendrogram cho biết điều gì?",
    choices: [
      "Số cụm tối ưu được thuật toán tự xác định.",
      "Toàn bộ quá trình hợp nhất theo từng mức khoảng cách, cho phép cắt ngang ở ngưỡng bất kỳ để lấy số cụm mong muốn.",
      "Tỷ lệ phương sai giải thích của từng cụm.",
      "Vị trí tâm của các cụm trong không gian đặc trưng.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: thuật toán không tự chọn; người dùng chọn ngưỡng cắt.",
      "Đúng: đây chính là ưu thế của phương pháp phân cấp — một lần chạy cho mọi số cụm.",
      "Sai: đó là khái niệm của PCA.",
      "Sai: phân cụm phân cấp theo linkage không nhất thiết có tâm cụm tường minh.",
    ],
    explanation:
      "Chiều cao nhánh hợp nhất chính là khoảng cách giữa hai cụm được gộp. Nhánh dài bất thường gợi ý một mức cắt tự nhiên.",
  },
  {
    id: "other-clustering-05",
    syllabusId: "other-clustering",
    difficulty: "advanced",
    format: "single-choice",
    stem: "Dữ liệu có một cụm rất dày và một cụm thưa hơn nhiều nằm cách xa. DBSCAN với một cặp (`eps`, `min_samples`) cho kết quả: cụm thưa bị gán gần như toàn bộ là nhiễu. Nguyên nhân cốt lõi là gì?",
    choices: [
      "`min_samples` đặt quá thấp.",
      "DBSCAN dùng một ngưỡng mật độ toàn cục, nên không xử lý được các cụm có mật độ khác nhau rõ rệt.",
      "Dữ liệu chưa được chuẩn hoá.",
      "Số chiều dữ liệu quá thấp.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: hạ `min_samples` có thể cứu cụm thưa nhưng sẽ làm cụm dày vỡ vụn hoặc dính vào nhiễu — vẫn không giải quyết được gốc rễ.",
      "Đúng: một cặp (eps, min_samples) định nghĩa đúng một mức mật độ; hai cụm khác mật độ cần hai mức khác nhau.",
      "Sai: chuẩn hoá quan trọng nhưng không phải nguyên nhân của hiện tượng mô tả trong đề.",
      "Sai: số chiều thấp là điều kiện thuận lợi cho DBSCAN.",
    ],
    trap: "Bẫy là chỉnh tham số vòng quanh: mỗi lần sửa `eps` hoặc `min_samples` lại hỏng phía còn lại, vì hạn chế nằm ở thiết kế thuật toán chứ không ở giá trị tham số.",
    explanation:
      "HDBSCAN được tạo ra chính để xử lý việc này: nó xét cụm trên nhiều mức mật độ rồi giữ lại các cụm ổn định nhất, thay cho một ngưỡng cố định.",
  },

  /* ---------------- metrics ---------------- */
  {
    id: "metrics-01",
    syllabusId: "metrics",
    difficulty: "recall",
    format: "single-choice",
    stem: "Precision và recall được định nghĩa thế nào?",
    choices: [
      "Precision = TP/(TP+FP); Recall = TP/(TP+FN).",
      "Precision = TP/(TP+FN); Recall = TP/(TP+FP).",
      "Precision = TP/(TP+TN); Recall = TN/(TN+FP).",
      "Precision = (TP+TN)/tổng; Recall = TP/tổng.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: precision xét trong số các dự đoán dương, recall xét trong số các dương thật.",
      "Sai: hoán đổi hai mẫu số.",
      "Sai: TN không xuất hiện trong công thức của hai chỉ số này.",
      "Sai: dòng đầu là accuracy.",
    ],
    explanation:
      "Cách nhớ bằng mẫu số: precision chia cho *tất cả những gì tôi gọi là dương*, recall chia cho *tất cả những gì thật sự dương*.",
  },
  {
    id: "metrics-02",
    syllabusId: "metrics",
    difficulty: "understand",
    format: "single-choice",
    stem: "Hệ thống sàng lọc sơ bộ một bệnh nguy hiểm nhưng chữa được, bệnh nhân dương tính sẽ được xét nghiệm khẳng định sau đó. Nên ưu tiên chỉ số nào?",
    choices: [
      "Precision, vì cần tránh làm bệnh nhân lo lắng.",
      "Recall, vì bỏ sót ca bệnh (âm tính giả) nguy hiểm hơn nhiều so với một lần cảnh báo nhầm sẽ được xét nghiệm lại.",
      "Accuracy, vì đó là chỉ số tổng quát nhất.",
      "Specificity, vì cần loại đúng người khoẻ.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: chi phí của dương tính giả ở đây thấp vì đã có bước khẳng định phía sau.",
      "Đúng: chi phí bất đối xứng quyết định chỉ số; bỏ sót là lỗi tốn kém nhất.",
      "Sai: bệnh hiếm khiến accuracy bị lớp âm tính chi phối.",
      "Sai: tối đa hoá specificity sẽ khuyến khích mô hình bỏ sót ca bệnh.",
    ],
    explanation:
      "Nguyên tắc chung: xác định chi phí thật của FP và FN trước, rồi mới chọn chỉ số. Không có chỉ số nào “tốt nhất” độc lập với bài toán.",
  },
  {
    id: "metrics-03",
    syllabusId: "metrics",
    difficulty: "apply",
    format: "numeric",
    stem: "Một mô hình có TP = 8, FP = 2, FN = 4. Tính F1-score (làm tròn 3 chữ số thập phân).",
    answer: 0.727,
    tolerance: 0.005,
    calculation: [
      "Precision = 8/(8+2) = 0.8.",
      "Recall = 8/(8+4) = 8/12 ≈ 0.6667.",
      "F1 = 2·P·R/(P+R) = 2(0.8)(0.6667)/(1.4667) ≈ 0.727.",
    ],
    explanation:
      "F1 là trung bình điều hoà nên bị kéo về phía chỉ số nhỏ hơn. Trung bình cộng của 0.8 và 0.667 là 0.733 — cao hơn F1, và đó chính là lý do người ta chọn trung bình điều hoà.",
  },
  {
    id: "metrics-04",
    syllabusId: "metrics",
    difficulty: "apply",
    format: "single-choice",
    stem: "Bài toán 4 lớp rất mất cân bằng, cần chỉ số phản ánh hiệu năng trên *mọi* lớp kể cả lớp hiếm. Nên chọn cách gộp nào?",
    choices: [
      "Micro-average, vì nó cộng dồn TP/FP/FN trên toàn bộ mẫu.",
      "Macro-average, vì nó lấy trung bình không trọng số các chỉ số của từng lớp nên lớp hiếm có tiếng nói ngang lớp lớn.",
      "Weighted-average, vì nó trọng số theo tần suất lớp.",
      "Accuracy, vì với nhiều lớp nó tự cân bằng.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: micro-average bị lớp đông chi phối; với phân loại đơn nhãn nó bằng đúng accuracy.",
      "Đúng: đây là lựa chọn tiêu chuẩn khi lớp hiếm quan trọng ngang lớp phổ biến.",
      "Sai: weighted-average cũng thiên về lớp đông vì trọng số chính là tần suất.",
      "Sai: accuracy càng bị lớp đông chi phối.",
    ],
    explanation:
      "Nói gọn: macro coi mọi *lớp* như nhau, micro/weighted coi mọi *mẫu* như nhau. Chọn cái nào là quyết định về giá trị, không phải về kỹ thuật.",
  },
  {
    id: "metrics-05",
    syllabusId: "metrics",
    difficulty: "advanced",
    format: "multi-select",
    stem: "Bài toán phát hiện gian lận: 0.5% giao dịch là gian lận, bỏ sót một vụ tốn 10 triệu đồng, kiểm tra nhầm một giao dịch sạch tốn 20 nghìn đồng. Chọn tất cả nhận định đúng.",
    choices: [
      "Accuracy gần như vô dụng vì mô hình luôn đoán “không gian lận” đã đạt 99.5%.",
      "PR-AUC phù hợp hơn ROC-AUC để so sánh mô hình trên bài toán này.",
      "F1 với trọng số cân bằng chưa phản ánh đúng vì chi phí FN gấp 500 lần chi phí FP.",
      "Ngưỡng quyết định nên được chọn bằng cách cực tiểu hoá tổng chi phí kỳ vọng, không mặc định 0.5.",
      "Vì lớp dương rất hiếm nên cần cân bằng lại tập test cho tỷ lệ 50/50 trước khi đo.",
    ],
    answerIndexes: [0, 1, 2, 3],
    choiceNotes: [
      "Đúng: baseline hằng số đã đạt 99.5%, nên accuracy không phân biệt được mô hình nào.",
      "Đúng: ROC dùng FPR có mẫu số là số âm tính rất lớn nên ít nhạy; PR tập trung vào lớp dương hiếm.",
      "Đúng: F1 ngầm coi FP và FN quan trọng ngang nhau, trái với chi phí thực tế; nên dùng F-beta với β > 1 hoặc trực tiếp tính chi phí.",
      "Đúng: ngưỡng tối ưu về chi phí ở đây thấp hơn 0.5 rất nhiều.",
      "Sai: cân bằng lại tập *test* phá vỡ tính đại diện; chỉ được cân bằng ở tập train nếu cần.",
    ],
    scoring: "all-or-nothing",
    trap: "Phương án cuối rất hấp dẫn vì kỹ thuật cân bằng lớp được dạy rất nhiều — nhưng nó chỉ áp dụng cho tập huấn luyện. Cân bằng tập test làm precision đo được không còn ý nghĩa trong vận hành thật.",
    explanation:
      "Khi có ma trận chi phí tường minh, hãy tối ưu thẳng chi phí kỳ vọng thay vì mượn một chỉ số tổng hợp. Các chỉ số chuẩn chỉ là xấp xỉ cho những trường hợp chưa biết chi phí.",
  },

  /* ---------------- under-over ---------------- */
  {
    id: "under-over-01",
    syllabusId: "under-over",
    difficulty: "recall",
    format: "single-choice",
    stem: "Overfitting được nhận ra qua dấu hiệu nào?",
    choices: [
      "Hiệu năng kém trên cả tập train lẫn tập validation.",
      "Hiệu năng rất tốt trên tập train nhưng kém rõ rệt trên tập validation.",
      "Hiệu năng tốt trên cả hai tập.",
      "Hàm mất mát trên train dao động mạnh giữa các batch.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: đó là underfitting.",
      "Đúng: khoảng cách lớn giữa hai đường cong là dấu hiệu đặc trưng của variance cao.",
      "Sai: đó là mô hình tốt.",
      "Sai: dao động theo batch thường liên quan learning rate hoặc batch size.",
    ],
    explanation:
      "Chẩn đoán theo cặp số liệu, không theo một con số. Chỉ nhìn điểm train thì không bao giờ phân biệt được mô hình tốt với mô hình học thuộc lòng.",
  },
  {
    id: "under-over-02",
    syllabusId: "under-over",
    difficulty: "understand",
    format: "single-choice",
    stem: "Learning curve cho thấy lỗi train và lỗi validation đều cao và đã hội tụ sát nhau. Bổ sung thêm dữ liệu huấn luyện sẽ giúp gì?",
    choices: [
      "Giúp nhiều, vì thêm dữ liệu luôn cải thiện mô hình.",
      "Hầu như không giúp: đây là dấu hiệu bias cao, cần mô hình mạnh hơn hoặc đặc trưng tốt hơn.",
      "Giúp, vì nó làm giảm bias.",
      "Không kết luận được từ learning curve.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: thêm dữ liệu chủ yếu chữa variance, không chữa bias.",
      "Đúng: hai đường cong đã gặp nhau ở mức lỗi cao nghĩa là mô hình không đủ năng lực biểu diễn.",
      "Sai: bias đến từ giới hạn của lớp mô hình, không đến từ số lượng mẫu.",
      "Sai: learning curve được dùng đúng cho chẩn đoán này.",
    ],
    explanation:
      "Đối chiếu: nếu lỗi train thấp còn lỗi validation cao và khoảng cách chưa thu hẹp, thì thêm dữ liệu (hoặc regularization) mới là hướng đúng.",
  },
  {
    id: "under-over-03",
    syllabusId: "under-over",
    difficulty: "apply",
    format: "multi-select",
    stem: "Mạng nơ-ron đạt accuracy train 0.99 và validation 0.72. Chọn tất cả biện pháp hợp lý.",
    choices: [
      "Thêm dropout hoặc weight decay.",
      "Tăng cường dữ liệu (data augmentation).",
      "Tăng số lớp và số nơ-ron mỗi lớp.",
      "Dừng sớm dựa trên lỗi validation.",
      "Thu thập thêm dữ liệu huấn luyện.",
    ],
    answerIndexes: [0, 1, 3, 4],
    choiceNotes: [
      "Hợp lý: cả hai đều là công cụ giảm variance trực tiếp.",
      "Hợp lý: augmentation mở rộng phân phối train mà không cần gán nhãn thêm.",
      "Không hợp lý: tăng năng lực mô hình khi đang overfit sẽ làm khoảng cách rộng thêm.",
      "Hợp lý: early stopping cắt đúng thời điểm mô hình bắt đầu học thuộc nhiễu.",
      "Hợp lý: thêm dữ liệu là cách giảm variance hiệu quả nhất khi khả thi.",
    ],
    scoring: "all-or-nothing",
    explanation:
      "Chẩn đoán trước, kê đơn sau. Ở đây triệu chứng là variance cao, nên mọi biện pháp đúng đều đi theo hướng giảm năng lực hiệu dụng hoặc tăng lượng thông tin huấn luyện.",
  },
  {
    id: "under-over-04",
    syllabusId: "under-over",
    difficulty: "apply",
    format: "single-choice",
    stem: "Mô hình đạt accuracy train 0.62 và validation 0.61 trên bài toán mà con người đạt khoảng 0.95. Hướng xử lý đúng là gì?",
    choices: [
      "Thêm regularization mạnh hơn.",
      "Tăng năng lực mô hình, huấn luyện lâu hơn, tạo đặc trưng tốt hơn — vì đây là underfitting.",
      "Giảm kích thước tập train để mô hình học nhanh hơn.",
      "Tăng tỷ lệ dropout.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: regularization chữa variance, ở đây variance đã rất thấp.",
      "Đúng: khoảng cách giữa 0.62 và mức tham chiếu 0.95 là bias, không phải variance.",
      "Sai: ít dữ liệu hơn không làm mô hình mạnh hơn.",
      "Sai: dropout mạnh hơn càng hạn chế năng lực đang thiếu.",
    ],
    explanation:
      "Mức tham chiếu của con người (hoặc một baseline mạnh đã biết) là thước đo cần thiết để biết khoảng cách còn lại là bias hay là nhiễu không thể giảm.",
  },
  {
    id: "under-over-05",
    syllabusId: "under-over",
    difficulty: "advanced",
    format: "true-false-set",
    stem: "Xét phân rã lỗi kỳ vọng thành bias², variance và nhiễu không thể giảm.",
    statements: [
      {
        text: "Nhiễu không thể giảm là chặn dưới của lỗi mà không mô hình nào vượt qua được trên phân phối đó.",
        answer: true,
        note: "Nó đến từ tính ngẫu nhiên vốn có của bài toán và thông tin không được ghi trong đặc trưng.",
      },
      {
        text: "Tăng độ phức tạp mô hình nói chung làm giảm bias và tăng variance.",
        answer: true,
        note: "Đây chính là hình dạng chữ U của đường cong lỗi kiểm tra theo độ phức tạp.",
      },
      {
        text: "Tăng số lượng mẫu huấn luyện làm giảm variance nhưng nói chung không làm giảm bias.",
        answer: true,
        note: "Bias là giới hạn của lớp mô hình; thêm dữ liệu không mở rộng lớp mô hình.",
      },
      {
        text: "Một mô hình có lỗi train bằng 0 thì bias bằng 0.",
        answer: false,
        note: "Lỗi train bằng 0 chỉ nói về một lần khớp cụ thể; bias là sai lệch kỳ vọng qua nhiều tập train khác nhau và vẫn có thể lớn.",
      },
    ],
    trap: "Ý (d) trộn lẫn “lỗi trên một tập train cụ thể” với “kỳ vọng qua các tập train”. Bias và variance đều là đại lượng lấy kỳ vọng trên phân phối của tập huấn luyện.",
    explanation:
      "Nắm phân rã này giúp trả lời được câu hỏi thực dụng nhất: “nên bỏ công vào thu thập thêm dữ liệu, hay vào đổi mô hình?”.",
  },

  /* ---------------- tuning ---------------- */
  {
    id: "tuning-01",
    syllabusId: "tuning",
    difficulty: "recall",
    format: "single-choice",
    stem: "Đâu là siêu tham số chứ không phải tham số học được?",
    choices: [
      "Trọng số của lớp linear.",
      "Learning rate.",
      "Hệ số chặn của hồi quy tuyến tính.",
      "Giá trị embedding của một từ.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: trọng số được cập nhật bằng gradient descent.",
      "Đúng: learning rate do người dùng đặt trước và không được học bằng gradient của hàm mất mát huấn luyện.",
      "Sai: hệ số chặn cũng được ước lượng từ dữ liệu.",
      "Sai: embedding là tham số học được.",
    ],
    explanation:
      "Ranh giới: tham số được tối ưu bởi thuật toán huấn luyện; siêu tham số được chọn *bên ngoài* vòng huấn luyện, dựa trên tập validation.",
  },
  {
    id: "tuning-02",
    syllabusId: "tuning",
    difficulty: "understand",
    format: "single-choice",
    stem: "Vì sao random search thường hiệu quả hơn grid search với cùng ngân sách thử nghiệm?",
    choices: [
      "Vì nó luôn tìm được nghiệm tối ưu toàn cục.",
      "Vì thường chỉ vài siêu tham số thực sự quan trọng; random search thử nhiều giá trị khác nhau cho các chiều quan trọng đó, còn grid search lãng phí lượt thử lặp lại giá trị cũ trên các chiều ít quan trọng.",
      "Vì nó cần ít bộ nhớ hơn.",
      "Vì nó không cần định nghĩa khoảng tìm kiếm.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: không phương pháp nào bảo đảm tối ưu toàn cục.",
      "Đúng: với lưới 3×3, mỗi siêu tham số chỉ được thử 3 giá trị dù có tới 9 lượt chạy.",
      "Sai: bộ nhớ không phải khác biệt đáng kể.",
      "Sai: random search vẫn cần khoảng hoặc phân phối lấy mẫu.",
    ],
    explanation:
      "Đây là kết quả kinh điển của Bergstra & Bengio. Với ngân sách lớn hơn, tối ưu Bayes hoặc Hyperband thường vượt cả hai.",
  },
  {
    id: "tuning-03",
    syllabusId: "tuning",
    difficulty: "apply",
    format: "single-choice",
    stem: "Cần dò learning rate trong khoảng từ 1e-5 đến 1e-1. Cách lấy mẫu nào hợp lý?",
    choices: [
      "Lấy đều trên thang tuyến tính giữa 0.00001 và 0.1.",
      "Lấy đều trên thang log, ví dụ 1e-5, 1e-4, 1e-3, 1e-2, 1e-1.",
      "Chỉ thử đúng giá trị mặc định của thư viện.",
      "Lấy đều trên thang tuyến tính giữa 0 và 1.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: gần như mọi mẫu sẽ rơi vào vùng 0.01–0.1, bỏ sót hoàn toàn các bậc độ lớn nhỏ.",
      "Đúng: learning rate ảnh hưởng theo bậc độ lớn nên phải lấy mẫu theo log.",
      "Sai: giá trị mặc định là điểm khởi đầu, không phải kết quả dò tìm.",
      "Sai: còn tệ hơn phương án đầu.",
    ],
    explanation:
      "Quy tắc chung: siêu tham số có ý nghĩa theo tỷ lệ nhân (learning rate, λ, gamma, C) thì lấy mẫu theo log; loại có ý nghĩa cộng (số lớp, độ sâu cây) thì lấy mẫu tuyến tính.",
  },
  {
    id: "tuning-04",
    syllabusId: "tuning",
    difficulty: "apply",
    format: "single-choice",
    stem: "Cần vừa chọn siêu tham số vừa ước lượng không thiên lệch hiệu năng của quy trình mô hình hoá. Thiết kế đúng là gì?",
    choices: [
      "Một vòng cross-validation, báo cáo điểm tốt nhất trong các cấu hình đã thử.",
      "Nested cross-validation: vòng trong chọn siêu tham số, vòng ngoài ước lượng hiệu năng.",
      "Chọn siêu tham số trên tập test rồi báo cáo chính điểm đó.",
      "Chia 50/50 train–test và dò siêu tham số trên tập test.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: lấy điểm tốt nhất trên chính tập dùng để chọn là ước lượng lạc quan.",
      "Đúng: vòng ngoài chưa từng tham gia vào bất kỳ quyết định nào của vòng trong.",
      "Sai: đây là leakage trực tiếp lên tập test.",
      "Sai: tương tự, tập test bị tiêu thụ trong quá trình chọn.",
    ],
    explanation:
      "Nguyên tắc gốc: mỗi tập dữ liệu chỉ trả lời được một loại câu hỏi. Tập đã dùng để *chọn* thì không còn dùng để *đo* được nữa.",
  },
  {
    id: "tuning-05",
    syllabusId: "tuning",
    difficulty: "advanced",
    format: "single-choice",
    stem: "Nhóm thử 800 cấu hình siêu tham số, chọn cấu hình có điểm validation cao nhất là 0.94 (các cấu hình tốt khác quanh 0.90). Trên tập test, mô hình chỉ đạt 0.89. Giải thích đúng nhất là gì?",
    choices: [
      "Tập test có phân phối khác tập validation.",
      "Chọn cực đại trên 800 lần thử làm điểm validation bị thiên lệch lạc quan: một phần của 0.94 là may mắn ngẫu nhiên trên chính tập validation.",
      "Mô hình đã underfit.",
      "800 cấu hình là quá ít để tìm được cấu hình tốt.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: có thể xảy ra, nhưng khoảng cách so với nhóm 0.90 đã giải thích được bằng chính hiệu ứng chọn cực đại.",
      "Đúng: đây là overfitting lên tập validation, và mức thiên lệch tăng theo số cấu hình được thử.",
      "Sai: hiệu năng 0.89 trên test không phải dấu hiệu underfit trong ngữ cảnh này.",
      "Sai: thử nhiều hơn chỉ làm thiên lệch nặng thêm.",
    ],
    trap: "Bẫy là coi điểm validation cao nhất như một ước lượng không thiên lệch. Thực tế nó là *cực đại của 800 biến ngẫu nhiên*, nên kỳ vọng của nó cao hơn giá trị thật.",
    explanation:
      "Dấu hiệu nhận biết: cấu hình tốt nhất bỏ xa cụm còn lại một cách bất thường. Cách phòng: dùng nested CV, giữ tập test tách biệt tuyệt đối, và ưu tiên cấu hình nằm trong vùng ổn định thay vì đỉnh nhọn đơn lẻ.",
  },

  /* ---------------- cross-validation ---------------- */
  {
    id: "cross-validation-01",
    syllabusId: "cross-validation",
    difficulty: "recall",
    format: "single-choice",
    stem: "k-fold cross-validation hoạt động thế nào?",
    choices: [
      "Chia dữ liệu thành k phần; lần lượt lấy một phần làm validation và k−1 phần còn lại làm train, lặp k lần rồi lấy trung bình kết quả.",
      "Huấn luyện k mô hình khác nhau trên toàn bộ dữ liệu rồi lấy trung bình.",
      "Chia dữ liệu thành k phần và chỉ huấn luyện trên phần đầu tiên.",
      "Lặp lại việc chia train–test ngẫu nhiên đúng k lần với tỷ lệ bất kỳ.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: mỗi mẫu được dùng làm validation đúng một lần.",
      "Sai: mô tả này không có phần dữ liệu nào được giữ ra để đánh giá.",
      "Sai: bỏ phí k−1 phần dữ liệu.",
      "Sai: đó là ShuffleSplit, không bảo đảm mỗi mẫu được validation đúng một lần.",
    ],
    explanation:
      "Giá trị lớn nhất của k-fold là cho một ước lượng có phương sai thấp hơn so với chia train–test một lần, đặc biệt khi dữ liệu ít.",
  },
  {
    id: "cross-validation-02",
    syllabusId: "cross-validation",
    difficulty: "understand",
    format: "single-choice",
    stem: "So với 5-fold, leave-one-out CV (k = n) có đặc điểm gì?",
    choices: [
      "Chi phí tính toán thấp hơn và ước lượng ổn định hơn.",
      "Bias thấp hơn (mỗi lần train dùng gần như toàn bộ dữ liệu) nhưng chi phí rất cao và ước lượng thường có phương sai lớn.",
      "Luôn cho kết quả giống hệt 5-fold.",
      "Không dùng được cho bài toán phân loại.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: LOOCV phải huấn luyện n lần nên đắt hơn nhiều.",
      "Đúng: đánh đổi kinh điển giữa bias và variance của chính ước lượng lỗi.",
      "Sai: hai phương pháp cho ước lượng khác nhau.",
      "Sai: dùng được, dù mỗi fold validation chỉ có một mẫu nên chỉ số theo fold rất thô.",
    ],
    explanation:
      "Trong thực hành, k = 5 hoặc k = 10 là điểm cân bằng phổ biến giữa chi phí và chất lượng ước lượng.",
  },
  {
    id: "cross-validation-03",
    syllabusId: "cross-validation",
    difficulty: "apply",
    format: "numeric",
    stem: "Dùng 5-fold cross-validation trên 100 mẫu. Mỗi lần huấn luyện, mô hình được học trên bao nhiêu mẫu?",
    answer: 80,
    tolerance: 0,
    calculation: [
      "Mỗi fold có 100/5 = 20 mẫu.",
      "Một fold làm validation, bốn fold còn lại làm train: 4 × 20 = 80 mẫu.",
    ],
    explanation:
      "Hệ quả cần nhớ: mô hình đánh giá bằng CV luôn được huấn luyện trên ít dữ liệu hơn mô hình cuối cùng (fit trên 100% dữ liệu), nên CV có xu hướng hơi bi quan.",
  },
  {
    id: "cross-validation-04",
    syllabusId: "cross-validation",
    difficulty: "apply",
    format: "single-choice",
    stem: "Dữ liệu ảnh y tế: 500 ảnh từ 50 bệnh nhân, mỗi bệnh nhân 10 ảnh. Cách chia fold đúng là gì?",
    choices: [
      "`KFold` ngẫu nhiên trên 500 ảnh.",
      "`GroupKFold` theo mã bệnh nhân, để mọi ảnh của cùng một người nằm trọn trong một fold.",
      "`StratifiedKFold` theo nhãn là đủ.",
      "Chia theo thứ tự tên tệp.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: ảnh của cùng bệnh nhân sẽ nằm ở cả train lẫn validation, mô hình nhận diện bệnh nhân thay vì bệnh.",
      "Đúng: đơn vị độc lập ở đây là bệnh nhân, không phải ảnh.",
      "Sai: phân tầng theo nhãn không ngăn được rò rỉ danh tính.",
      "Sai: thứ tự tên tệp không bảo đảm tách theo bệnh nhân.",
    ],
    explanation:
      "Câu hỏi luôn phải đặt: “đơn vị độc lập của bài toán là gì?”. Chia dữ liệu phải theo đơn vị đó, chứ không theo dòng dữ liệu.",
  },
  {
    id: "cross-validation-05",
    syllabusId: "cross-validation",
    difficulty: "advanced",
    format: "single-choice",
    stem: "Dự báo doanh thu tháng tới từ chuỗi doanh thu 5 năm. Nhóm dùng `KFold(shuffle=True)` và đạt MAE rất thấp, nhưng khi triển khai thì sai số lớn gấp ba. Nguyên nhân chính là gì?",
    choices: [
      "Số fold quá ít.",
      "Xáo trộn ngẫu nhiên khiến mô hình được huấn luyện trên dữ liệu tương lai để dự đoán quá khứ — điều không bao giờ xảy ra khi triển khai.",
      "MAE là chỉ số sai cho bài toán này.",
      "Mô hình cần nhiều đặc trưng hơn.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: tăng số fold không sửa được vi phạm về trật tự thời gian.",
      "Đúng: chuỗi thời gian có tự tương quan mạnh, nên nhìn thấy điểm liền kề trong tương lai làm bài toán dễ đi rất nhiều.",
      "Sai: MAE hoàn toàn hợp lý cho dự báo doanh thu.",
      "Sai: thêm đặc trưng không xử lý được lỗi thiết kế đánh giá.",
    ],
    trap: "Bẫy là kết quả CV *rất đẹp*. Với chuỗi thời gian, chỉ số CV tốt bất thường thường là dấu hiệu của leakage chứ không phải của mô hình tốt.",
    explanation:
      "Dùng `TimeSeriesSplit` (train luôn nằm trước validation theo thời gian), cân nhắc khoảng đệm giữa train và validation để tránh rò rỉ qua tự tương quan, và đánh giá bằng backtesting cuốn chiếu.",
  },

  /* ---------------- confusion-roc ---------------- */
  {
    id: "confusion-roc-01",
    syllabusId: "confusion-roc",
    difficulty: "recall",
    format: "single-choice",
    stem: "Trong confusion matrix nhị phân, “false positive” là gì?",
    choices: [
      "Mẫu thật sự dương nhưng bị dự đoán là âm.",
      "Mẫu thật sự âm nhưng bị dự đoán là dương.",
      "Mẫu thật sự dương và được dự đoán đúng là dương.",
      "Mẫu bị mô hình bỏ qua vì thiếu đặc trưng.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: đó là false negative.",
      "Đúng: “false” chỉ việc dự đoán sai, “positive” chỉ nhãn mà mô hình đưa ra.",
      "Sai: đó là true positive.",
      "Sai: không phải khái niệm trong confusion matrix.",
    ],
    explanation:
      "Cách đọc tên: từ thứ hai là *nhãn mô hình dự đoán*, từ thứ nhất cho biết dự đoán đó đúng hay sai. Nắm quy tắc này thì không bao giờ nhầm FP với FN.",
  },
  {
    id: "confusion-roc-02",
    syllabusId: "confusion-roc",
    difficulty: "understand",
    format: "single-choice",
    stem: "ROC-AUC bằng 0.85 có nghĩa là gì?",
    choices: [
      "Mô hình phân loại đúng 85% số mẫu.",
      "Xác suất mô hình xếp một mẫu dương ngẫu nhiên có điểm cao hơn một mẫu âm ngẫu nhiên là 0.85.",
      "85% các dự đoán dương là đúng.",
      "Mô hình đạt recall 0.85 ở ngưỡng 0.5.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: đó là accuracy, phụ thuộc ngưỡng cụ thể.",
      "Đúng: đây là diễn giải xác suất chuẩn của AUC (tương đương thống kê Mann–Whitney U).",
      "Sai: đó là precision.",
      "Sai: AUC tổng hợp trên mọi ngưỡng chứ không gắn với ngưỡng nào.",
    ],
    explanation:
      "Vì AUC chỉ phụ thuộc *thứ hạng* nên nó không nói gì về mức hiệu chỉnh (calibration) của xác suất. Hai mô hình cùng AUC có thể cho xác suất lệch nhau rất nhiều.",
  },
  {
    id: "confusion-roc-03",
    syllabusId: "confusion-roc",
    difficulty: "apply",
    format: "numeric",
    stem: "Cho TP = 40, FN = 10, FP = 30, TN = 120. Tính false positive rate (FPR).",
    answer: 0.2,
    tolerance: 0.001,
    calculation: [
      "FPR = FP/(FP + TN).",
      "FP + TN = 30 + 120 = 150 (tổng số mẫu thật sự âm).",
      "FPR = 30/150 = 0.2.",
    ],
    explanation:
      "Đối chiếu: TPR = 40/(40+10) = 0.8. Cặp (FPR, TPR) = (0.2, 0.8) chính là một điểm trên đường ROC ứng với ngưỡng đang dùng.",
  },
  {
    id: "confusion-roc-04",
    syllabusId: "confusion-roc",
    difficulty: "apply",
    format: "single-choice",
    stem: "Một mô hình có ROC-AUC bằng 0.5. Điều đó nghĩa là gì?",
    choices: [
      "Mô hình phân loại hoàn hảo.",
      "Khả năng xếp hạng của mô hình không tốt hơn đoán ngẫu nhiên.",
      "Mô hình dự đoán ngược hoàn toàn, chỉ cần đảo nhãn là được mô hình hoàn hảo.",
      "Mô hình đạt accuracy đúng 50%.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: hoàn hảo là AUC = 1.",
      "Đúng: 0.5 là đường chéo của biểu đồ ROC.",
      "Sai: đó là trường hợp AUC gần 0.",
      "Sai: AUC không quy đổi trực tiếp thành accuracy.",
    ],
    explanation:
      "AUC dưới 0.5 đáng chú ý: nó cho thấy mô hình có tín hiệu nhưng bị đảo dấu — thường do nhầm lẫn nhãn lớp dương/âm trong mã nguồn.",
  },
  {
    id: "confusion-roc-05",
    syllabusId: "confusion-roc",
    difficulty: "advanced",
    format: "single-choice",
    stem: "Bài toán có 1% mẫu dương. Mô hình đạt ROC-AUC 0.95 nhưng ở ngưỡng vận hành, precision chỉ 0.09. Giải thích đúng nhất là gì?",
    choices: [
      "Kết quả mâu thuẫn, chắc chắn có lỗi khi tính toán.",
      "Không mâu thuẫn: FPR có mẫu số là số lượng âm tính rất lớn, nên FPR nhỏ vẫn tương ứng với rất nhiều dương tính giả, kéo precision xuống.",
      "AUC 0.95 chứng tỏ precision phải trên 0.9.",
      "Vấn đề chỉ nằm ở việc chưa chuẩn hoá đặc trưng.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: đây là hiện tượng có thật và rất phổ biến với dữ liệu mất cân bằng.",
      "Đúng: với 99% mẫu âm, FPR = 0.05 đã tạo ra số FP gấp nhiều lần tổng số mẫu dương.",
      "Sai: AUC và precision không có quan hệ ràng buộc như vậy.",
      "Sai: chuẩn hoá không liên quan tới hiệu ứng mẫu số này.",
    ],
    trap: "Bẫy là tin rằng AUC cao đồng nghĩa với “dùng được trong thực tế”. Với lớp dương hiếm, ROC trông rất đẹp trong khi hệ thống vẫn tạo ra hàng loạt cảnh báo sai.",
    explanation:
      "Ví dụ số: 100.000 mẫu, 1.000 dương. Ở TPR 0.9 và FPR 0.05 ta có TP = 900 và FP = 4.950, nên precision ≈ 0.154. Vì thế với dữ liệu mất cân bằng phải báo cáo PR-AUC và precision tại ngưỡng vận hành thật.",
  },
];
