import type { LessonTheoryMap } from "./types";

export const dataScienceTheory = {
  "ds-metrics": {
    lessonId: "ds-metrics",
    readingMinutes: 28,
    openingQuestions: [
      "Một mô hình có sai số trung bình nhỏ hơn có chắc chắn hữu ích hơn trong bài toán thực tế không?",
      "Vì sao phải chọn thước đo trước khi xem kết quả thử nghiệm thay vì chọn thước đo làm mô hình trông tốt nhất?",
    ],
    sections: [
      {
        title: "Metric là cách mã hóa mục tiêu ra quyết định",
        paragraphs: [
          "Metric không chỉ là một con số để xếp hạng mô hình. Nó biến mục tiêu nghiệp vụ và chi phí của các loại sai lầm thành một quy tắc đo lường có thể lặp lại. Trước khi chọn metric, cần xác định đơn vị dự đoán, chân trời thời gian, nhóm người chịu tác động và hành động sẽ được kích hoạt bởi dự đoán. Hai mô hình có thể đổi thứ hạng chỉ vì ta đổi từ sai số tuyệt đối sang sai số bình phương; điều đó phản ánh một giả định khác về chi phí sai lầm chứ không phải phép đo nào tự nhiên đúng hơn.",
          "Metric đánh giá phải được định nghĩa trước khi quan sát tập kiểm tra. Nếu thử nhiều metric rồi chỉ báo cáo metric thuận lợi, tập kiểm tra đã tham gia vào quá trình lựa chọn và kết quả trở nên lạc quan. Một thiết kế tốt phân biệt loss dùng để tối ưu, metric dùng để chọn mô hình và chỉ số vận hành dùng để giám sát sau triển khai. Ba đại lượng có thể giống nhau, nhưng không bắt buộc giống nhau.",
        ],
        bullets: [
          "Regression: MAE mô tả sai lệch tuyệt đối điển hình và ít nhạy với ngoại lệ hơn MSE/RMSE; RMSE phạt mạnh sai số lớn.",
          "Classification: accuracy đo đúng tỷ lệ dự đoán đúng nhưng dễ che lỗi ở lớp hiếm khi dữ liệu lệch; chỉ dùng nó làm metric chính khi phù hợp mục tiêu và chi phí sai lầm, đồng thời báo metric theo lớp hoặc macro-F1 khi cần.",
          "Ranking hoặc retrieval: precision@k, recall@k, MAP hay NDCG đo chất lượng phần đầu danh sách thay vì ép bài toán về một nhãn duy nhất.",
        ],
        formulas: [
          "MAE = (1/n) * sum_i |y_i - y_hat_i|",
          "RMSE = sqrt((1/n) * sum_i (y_i - y_hat_i)^2)",
        ],
      },
      {
        title: "Tách khả năng phân biệt, hiệu chuẩn và ngưỡng quyết định",
        paragraphs: [
          "Một xác suất dự đoán có ba khía cạnh khác nhau. Discrimination hỏi mô hình có xếp mẫu dương cao hơn mẫu âm không. Calibration hỏi trong các mẫu được dự đoán khoảng 0.7 thì có gần 70% thật sự dương không. Decision quality hỏi ngưỡng và hành động cụ thể tạo ra lợi ích bao nhiêu. AUC có thể tốt nhưng xác suất vẫn lệch; ngược lại, một phép hiệu chuẩn đơn điệu có thể cải thiện log loss mà gần như không đổi thứ hạng.",
          "Các metric xác suất như log loss và Brier score là proper scoring rules: về kỳ vọng, dự báo trung thực phân phối tin tưởng của mô hình là tối ưu. Chúng hữu ích khi xác suất sẽ được dùng cho nhiều ngưỡng hoặc để ước lượng rủi ro. Tuy vậy, log loss phạt rất nặng dự báo tự tin nhưng sai, nên phải kiểm tra nhãn nhiễu và giới hạn số học khi tính log.",
        ],
        formulas: [
          "logloss = -(1/n) * sum_i [y_i log(p_i) + (1-y_i) log(1-p_i)]",
          "Brier = (1/n) * sum_i (p_i - y_i)^2",
        ],
      },
      {
        title: "Ước lượng bất định thay vì chỉ báo cáo một điểm",
        paragraphs: [
          "Metric trên một tập hữu hạn là một ước lượng ngẫu nhiên. Chênh lệch 0.2 điểm phần trăm có thể chỉ là nhiễu lấy mẫu. Nên báo cáo cỡ mẫu, khoảng tin cậy hoặc phân phối bootstrap, và nếu hai mô hình được đánh giá trên cùng mẫu thì dùng so sánh ghép cặp để tận dụng tương quan giữa các lỗi. Với dữ liệu theo người dùng, bệnh nhân, video hay phiên giao dịch, bootstrap phải lấy theo cụm độc lập chứ không lấy từng hàng vốn có tương quan.",
          "Metric tổng hợp có thể che khuất thất bại trên nhóm hiếm. Cần phân rã theo lớp, nguồn dữ liệu, thời gian và nhóm có ý nghĩa nghiệp vụ; đồng thời tránh kết luận quá mạnh từ nhóm quá nhỏ. Báo cáo tốt luôn đi kèm baseline, hướng tốt/xấu của metric và quy tắc xử lý trường hợp mẫu số bằng không.",
        ],
      },
    ],
    workedExamples: [
      {
        title: "Chọn metric cho dự báo nhu cầu có một ngoại lệ lớn",
        problem: "Giá trị thật là [10, 10, 10, 10] và hai mô hình dự đoán A=[9, 9, 9, 25], B=[7, 7, 7, 13]. So sánh MAE và RMSE để thấy giả định chi phí.",
        steps: [
          { state: "Sai số tuyệt đối A=[1,1,1,15], B=[3,3,3,3]", explanation: "A chính xác ở ba mẫu nhưng sai rất lớn ở một mẫu; B sai đều." },
          { state: "MAE_A=18/4=4.5, MAE_B=12/4=3", explanation: "Với chi phí tuyến tính theo độ lớn sai số, B tốt hơn." },
          { state: "RMSE_A=sqrt(57)=7.55; RMSE_B=3", explanation: "Bình phương làm ngoại lệ của A chi phối mạnh hơn, nên khoảng cách giữa hai mô hình tăng." },
          { state: "Quyết định", explanation: "Nếu thiếu hàng cực lớn gây chi phí tăng siêu tuyến tính, RMSE hợp lý hơn; nếu dữ liệu có lỗi cảm biến và chi phí gần tuyến tính, MAE có thể đáng tin hơn." },
        ],
        conclusion: "Không có metric tốt nhất độc lập với bài toán; lựa chọn metric chính là lựa chọn mô hình chi phí.",
        sanityChecks: [
          "MAE và RMSE đều không âm và bằng 0 khi dự đoán hoàn hảo.",
          "RMSE luôn không nhỏ hơn MAE trên cùng tập; kết quả 7.55 >= 4.5 và 3 = 3 phù hợp.",
        ],
      },
    ],
    implementationChecklist: [
      "Chốt metric chính, metric phụ và chiều tối ưu trước khi huấn luyện.",
      "Tính metric trên dữ liệu chưa tham gia fit, chọn đặc trưng hay chọn ngưỡng.",
      "Xử lý rõ NaN, nhãn thiếu, sample weight và mẫu số bằng không.",
      "Báo cáo baseline, cỡ mẫu, khoảng tin cậy và phân rã theo nhóm quan trọng.",
      "Viết test bằng ví dụ nhỏ có kết quả tính tay.",
    ],
    masteryChecklist: [
      "Giải thích được metric đang ngầm giả định chi phí sai lầm nào.",
      "Phân biệt discrimination, calibration và quyết định theo ngưỡng.",
      "Chọn được MAE/RMSE hoặc metric xác suất cho một tình huống cụ thể.",
      "Nhận ra khi chênh lệch metric chưa lớn hơn bất định lấy mẫu.",
    ],
    glossary: [
      { term: "Metric", definition: "Quy tắc ánh xạ dự đoán và nhãn thật thành đại lượng đánh giá." },
      { term: "Proper scoring rule", definition: "Thước đo xác suất khuyến khích dự báo trung thực phân phối tin tưởng." },
      { term: "Calibration", definition: "Mức độ tần suất thực nghiệm phù hợp với xác suất dự đoán." },
      { term: "Bootstrap", definition: "Kỹ thuật lấy mẫu lại để ước lượng phân phối của thống kê." },
      { term: "Baseline", definition: "Mốc tham chiếu đơn giản dùng để kiểm tra mô hình có tạo giá trị hay không." },
    ],
    sourceIds: ["pml-intro", "d2l-en", "ioai-2026"],
  },

  "ds-confusion-roc-pr": {
    lessonId: "ds-confusion-roc-pr",
    readingMinutes: 30,
    openingQuestions: [
      "Tại sao accuracy 99% có thể vô dụng khi lớp dương chỉ chiếm 1%?",
      "ROC-AUC cao có đảm bảo precision cao ở ngưỡng triển khai không?",
    ],
    sections: [
      {
        title: "Ma trận nhầm lẫn là nền tảng của quyết định nhị phân",
        paragraphs: [
          "Với một ngưỡng xác định, mỗi mẫu rơi vào TP, FP, TN hoặc FN. Các đại lượng này chỉ có nghĩa khi quy ước lớp dương rõ ràng. Recall hay sensitivity đo phần dương thật được tìm thấy; specificity đo phần âm thật được loại đúng; precision đo độ tinh khiết của các cảnh báo dương. Precision phụ thuộc mạnh vào prevalence, vì vậy không thể chuyển nguyên giá trị precision từ một quần thể sang quần thể có tỷ lệ lớp khác mà không điều chỉnh.",
          "F1 là trung bình điều hòa của precision và recall, hữu ích khi muốn cân bằng hai đại lượng nhưng bỏ qua TN và xem precision/recall quan trọng ngang nhau. F-beta cho phép đặt trọng số recall cao hơn hoặc thấp hơn. Nếu chi phí FP và FN có thể định lượng, tối ưu utility hoặc expected cost thường minh bạch hơn F1.",
        ],
        formulas: [
          "precision = TP/(TP+FP); recall = TP/(TP+FN)",
          "F1 = 2 * precision * recall / (precision + recall)",
          "expected_cost = C_FP * FP + C_FN * FN",
        ],
      },
      {
        title: "ROC và PR trả lời những câu hỏi khác nhau",
        paragraphs: [
          "Đường ROC quét mọi ngưỡng, biểu diễn TPR theo FPR. ROC-AUC có diễn giải xác suất rằng một mẫu dương ngẫu nhiên được xếp điểm cao hơn một mẫu âm ngẫu nhiên, với cách xử lý hòa điểm thích hợp. Vì mẫu số FPR là toàn bộ lớp âm, rất nhiều âm thật có thể làm FPR trông nhỏ dù số FP tuyệt đối vẫn quá lớn cho vận hành.",
          "Đường precision-recall tập trung vào chất lượng lớp dương và thường giàu thông tin hơn khi lớp dương hiếm. Baseline của average precision thay đổi theo prevalence, nên chỉ so sánh AP giữa các tập có phân bố lớp tương thích. Cả ROC-AUC lẫn AP đều tóm tắt nhiều ngưỡng; triển khai vẫn cần chọn một ngưỡng cụ thể dựa trên giới hạn công suất, chi phí hoặc recall tối thiểu.",
        ],
      },
      {
        title: "Chọn ngưỡng mà không làm rò rỉ tập kiểm tra",
        paragraphs: [
          "Ngưỡng là một tham số của hệ thống. Nó phải được chọn trên validation hoặc qua cross-validation, không chọn bằng cách tối đa F1 trên test rồi báo cáo chính F1 đó. Khi xác suất đã hiệu chuẩn và biết chi phí, ngưỡng Bayes có thể suy ra từ tỷ lệ chi phí; trong thực tế còn phải tính đến công suất xử lý cảnh báo, trì hoãn nhãn và thay đổi prevalence.",
          "Đánh giá nên kèm confusion matrix tại ngưỡng triển khai, đường cong toàn ngưỡng, và phân tích theo nhóm. Với multiclass, cần nêu rõ macro, micro hay weighted averaging. Macro cho mỗi lớp trọng lượng ngang nhau; micro gộp quyết định từng mẫu; weighted macro có thể gần bị lớp lớn chi phối. Không được trộn các cách lấy trung bình rồi so sánh như cùng một đại lượng.",
        ],
      },
    ],
    workedExamples: [
      {
        title: "Accuracy cao nhưng cảnh báo gần như vô dụng",
        problem: "Trong 10.000 giao dịch có 100 gian lận. Mô hình bắt được 80 gian lận và cảnh báo nhầm 180 giao dịch hợp lệ.",
        steps: [
          { state: "TP=80, FN=20, FP=180, TN=9720", explanation: "Bốn ô cộng lại đúng 10.000; số dương thật là 100." },
          { state: "accuracy=(80+9720)/10000=98%", explanation: "Con số cao phần lớn đến từ lớp âm rất lớn." },
          { state: "recall=80/100=80%; precision=80/260≈30.8%", explanation: "Mô hình tìm được đa số gian lận nhưng chưa đến một phần ba cảnh báo là đúng." },
          { state: "FPR=180/9900≈1.82%", explanation: "FPR nhỏ vẫn tương ứng 180 ca cần kiểm tra, lớn hơn số TP." },
        ],
        conclusion: "Phải chọn metric và ngưỡng theo mục tiêu bắt gian lận cùng năng lực xử lý cảnh báo, không dựa vào accuracy.",
        sanityChecks: [
          "TP+FN bằng đúng 100 mẫu dương thật và FP+TN bằng 9.900 mẫu âm thật.",
          "Precision nằm giữa 0 và 1, đồng thời thấp vì FP lớn hơn TP.",
        ],
      },
    ],
    implementationChecklist: [
      "Ghi rõ lớp dương và thứ tự nhãn khi tạo confusion matrix.",
      "Chọn ngưỡng trên validation, khóa ngưỡng trước lần đánh giá test cuối.",
      "Báo cáo confusion matrix, precision, recall và số lượng tuyệt đối tại ngưỡng vận hành.",
      "Dùng PR curve khi lớp dương hiếm và nêu prevalence của tập đánh giá.",
      "Với multiclass, ghi rõ macro/micro/weighted và cách xử lý lớp vắng mặt.",
    ],
    masteryChecklist: [
      "Tính đúng TP, FP, TN, FN từ một bảng dự đoán nhỏ.",
      "Giải thích vì sao precision thay đổi theo prevalence.",
      "Phân biệt ý nghĩa ROC-AUC và average precision.",
      "Chọn ngưỡng dựa trên chi phí hoặc ràng buộc công suất mà không dùng test.",
    ],
    glossary: [
      { term: "Prevalence", definition: "Tỷ lệ lớp dương trong quần thể đánh giá." },
      { term: "Precision", definition: "Tỷ lệ dự đoán dương là dương thật." },
      { term: "Recall", definition: "Tỷ lệ dương thật được mô hình phát hiện." },
      { term: "ROC-AUC", definition: "Diện tích dưới đường TPR-FPR khi quét ngưỡng." },
      { term: "Average precision", definition: "Đại lượng tóm tắt đường precision-recall theo thứ hạng." },
      { term: "Decision threshold", definition: "Ngưỡng chuyển điểm hoặc xác suất thành hành động rời rạc." },
    ],
    sourceIds: ["pml-intro", "d2l-en", "ioai-2026"],
  },

  "ds-underfit-overfit": {
    lessonId: "ds-underfit-overfit",
    readingMinutes: 27,
    openingQuestions: [
      "Khoảng cách train-validation lớn có phải lúc nào cũng đồng nghĩa mô hình quá phức tạp?",
      "Làm sao phân biệt thiếu năng lực mô hình với dữ liệu validation bị lệch phân phối?",
    ],
    sections: [
      {
        title: "Generalization và phép chẩn đoán bằng hai loại lỗi",
        paragraphs: [
          "Mục tiêu học máy không phải ghi nhớ tập huấn luyện mà là giảm rủi ro kỳ vọng trên dữ liệu mới từ quy trình sinh dữ liệu mục tiêu. Training error ước lượng mức mô hình khớp dữ liệu đã thấy; validation error ước lượng khả năng khái quát trong điều kiện thiết kế split. Underfitting thường biểu hiện cả lỗi train và validation đều cao so với mức có thể đạt. Overfitting thường biểu hiện train tốt nhưng validation kém, tuy nhiên khoảng cách này cũng có thể đến từ split sai, preprocessing khác nhau hoặc distribution shift.",
          "Khái niệm bias-variance giúp suy luận nhưng không nên được dùng như nhãn tuyệt đối cho một lần chạy. Mô hình quá hạn chế tạo systematic error; mô hình nhạy với mẫu huấn luyện tạo variance. Nhiễu không thể giảm đặt sàn cho hiệu năng. Tăng dữ liệu thường giảm variance, còn thêm đặc trưng hoặc tăng năng lực có thể giảm bias nhưng cũng làm tăng variance nếu không có regularization và validation đúng.",
        ],
      },
      {
        title: "Learning curve và quy trình cô lập nguyên nhân",
        paragraphs: [
          "Learning curve vẽ metric train và validation theo số mẫu huấn luyện, giữ nguyên quy trình đánh giá. Nếu cả hai đường hội tụ ở mức kém, thêm dữ liệu cùng phân phối thường không giải quyết bias chính; cần cải thiện đặc trưng, kiến trúc hoặc tối ưu. Nếu train tốt còn validation kém và khoảng cách thu hẹp khi thêm dữ liệu, dữ liệu hoặc regularization có triển vọng. Mỗi điểm nên lặp nhiều seed hoặc fold để thấy bất định.",
          "Trước khi điều chỉnh mô hình, phải kiểm tra baseline, nhãn, split theo thực thể/thời gian, pipeline fit riêng từng fold và sự nhất quán của metric. Một mô hình trông overfit có thể chỉ vì cùng một người xuất hiện ở train nhiều lần nhưng validation chứa người hoàn toàn mới, nghĩa là nhiệm vụ đánh giá khác nhiệm vụ huấn luyện. Chẩn đoán đúng bắt đầu từ định nghĩa mẫu độc lập và mục tiêu triển khai.",
        ],
      },
      {
        title: "Regularization là thay đổi giả thuyết, không phải phép chữa chung",
        paragraphs: [
          "L1/L2, early stopping, data augmentation, dropout, giảm độ sâu cây và giới hạn đặc trưng đều đưa vào inductive bias khác nhau. Regularization mạnh hơn thường tăng training error nhưng có thể giảm validation error. Cần điều chỉnh cường độ trên validation; nếu dùng test để chọn, ta lại overfit vào test. Trong dữ liệu nhỏ, nested cross-validation cho ước lượng bớt lạc quan khi có nhiều lựa chọn siêu tham số.",
          "Độ phức tạp không chỉ là số tham số. Cách tối ưu, biên độ trọng số, augmentation, preprocessing và cấu trúc dữ liệu đều ảnh hưởng effective capacity. Vì thế quy tắc máy móc như ít tham số luôn khái quát tốt hơn là sai; bằng chứng phải đến từ đánh giá ngoài mẫu được thiết kế đúng.",
        ],
      },
    ],
    workedExamples: [
      {
        title: "Đọc learning curve thay vì đoán",
        problem: "Một bộ phân loại cho kết quả theo số mẫu: 1.000 mẫu train/val=99%/78%; 5.000=96%/85%; 20.000=93%/90%.",
        steps: [
          { state: "Khoảng cách 21 điểm ở 1.000 mẫu", explanation: "Mô hình khớp train rất mạnh nhưng ước lượng validation bất ổn và kém." },
          { state: "Khoảng cách giảm còn 11 điểm ở 5.000 mẫu", explanation: "Thêm dữ liệu làm validation tăng và train giảm, phù hợp với variance đang giảm." },
          { state: "Khoảng cách còn 3 điểm ở 20.000 mẫu", explanation: "Hai đường đang hội tụ quanh 90-93%; thêm dữ liệu vẫn có thể giúp nhưng lợi ích biên giảm." },
          { state: "Can thiệp ưu tiên", explanation: "Kiểm tra split rồi thử thêm dữ liệu/augmentation và regularization vừa phải; chưa có bằng chứng cần tăng năng lực mô hình." },
        ],
        conclusion: "Xu hướng theo kích thước dữ liệu cung cấp bằng chứng tốt hơn một cặp train-validation đơn lẻ.",
        sanityChecks: [
          "Mọi điểm validation phải được tính trên mẫu không tham gia fit ở kích thước tương ứng.",
          "Nếu split hoặc preprocessing đổi giữa các điểm thì không được diễn giải đây là learning curve thuần túy.",
        ],
      },
    ],
    implementationChecklist: [
      "Thiết lập baseline và metric ngoài mẫu trước khi tăng độ phức tạp.",
      "Vẽ learning curve với cùng split logic và nhiều seed/fold.",
      "Fit mọi transformer chỉ trên phần train của từng split.",
      "Điều chỉnh regularization trên validation, giữ test cho lần đánh giá cuối.",
      "Kiểm tra distribution shift và nhóm dữ liệu trước khi kết luận overfit.",
    ],
    masteryChecklist: [
      "Phân biệt underfitting, overfitting và distribution shift bằng bằng chứng.",
      "Giải thích xu hướng train/validation khi tăng dữ liệu.",
      "Nêu được can thiệp hợp lý cho bias cao và variance cao.",
      "Giải thích vì sao nhiều lựa chọn trên cùng test làm kết quả lạc quan.",
    ],
    glossary: [
      { term: "Generalization", definition: "Khả năng duy trì hiệu năng trên dữ liệu mới thuộc mục tiêu triển khai." },
      { term: "Underfitting", definition: "Trạng thái mô hình chưa mô tả đủ cấu trúc hữu ích, thường lỗi train còn cao." },
      { term: "Overfitting", definition: "Trạng thái mô hình khớp chi tiết riêng của train làm hiệu năng ngoài mẫu suy giảm." },
      { term: "Learning curve", definition: "Đồ thị hiệu năng train và validation theo lượng dữ liệu hoặc quá trình học." },
      { term: "Effective capacity", definition: "Năng lực biểu diễn thực tế sau khi tính cả kiến trúc, tối ưu và regularization." },
      { term: "Distribution shift", definition: "Sự khác biệt giữa phân phối huấn luyện và phân phối đánh giá/triển khai." },
    ],
    sourceIds: ["pml-intro", "d2l-en", "mml"],
  },

  "ds-cross-validation": {
    lessonId: "ds-cross-validation",
    readingMinutes: 32,
    openingQuestions: [
      "K-fold ngẫu nhiên sẽ sai như thế nào nếu một người dùng xuất hiện ở nhiều hàng?",
      "Cross-validation ước lượng hiệu năng của mô hình nào: từng fold, quy trình chọn mô hình hay mô hình cuối cùng?",
    ],
    sections: [
      {
        title: "Cross-validation ước lượng một quy trình học",
        paragraphs: [
          "Trong K-fold, dữ liệu được chia thành K phần; mỗi lần dùng K-1 phần để fit toàn bộ pipeline và phần còn lại để đánh giá. Trung bình qua fold ước lượng hiệu năng của quy trình huấn luyện trên khoảng (K-1)/K lượng dữ liệu, không phải lời đảm bảo cho một mô hình cố định. Sau khi lựa chọn xong, mô hình thường được fit lại trên toàn bộ tập phát triển; test độc lập mới dùng để ước lượng cuối cùng.",
          "Fold phải bao trùm mọi bước học từ dữ liệu: imputation, scaling, chọn đặc trưng, oversampling, PCA và chọn siêu tham số. Nếu chuẩn hóa trên toàn bộ dữ liệu trước CV, thống kê của fold validation đã chảy vào train. Dù mức rò rỉ có thể nhỏ, quy trình không còn mô phỏng việc gặp dữ liệu mới.",
        ],
      },
      {
        title: "Split phải phản ánh đơn vị độc lập và hướng thời gian",
        paragraphs: [
          "Random K-fold giả định các mẫu gần như exchangeable. Với nhiều ảnh của cùng bệnh nhân, nhiều cửa sổ từ cùng chuỗi hay nhiều dòng của cùng người dùng, phải GroupKFold theo thực thể để tránh học dấu vân tay của nhóm. Với dự báo tương lai, train luôn phải đứng trước validation; random split có thể cho mô hình học xu hướng hoặc từ vựng tương lai.",
          "Stratification giúp tỷ lệ lớp ổn định giữa các fold nhưng không thay thế grouping. Khi vừa có nhóm vừa mất cân bằng, cần thuật toán chia nhóm có stratification hoặc thiết kế thủ công có kiểm chứng. Với không gian/địa lý, nên dùng block split đủ xa để phản ánh tự tương quan. Quy tắc chung là hỏi: khi triển khai, mẫu nào thật sự chưa từng được hệ thống nhìn thấy?",
        ],
      },
      {
        title: "Nested CV và cách diễn giải bất định",
        paragraphs: [
          "Nếu dùng cùng kết quả CV để thử nhiều cấu hình rồi báo cáo cấu hình tốt nhất, ước lượng bị selection bias. Nested CV dùng vòng trong để chọn siêu tham số và vòng ngoài để đánh giá toàn bộ quy trình chọn. Nó tốn tính toán nhưng quan trọng khi dữ liệu nhỏ và không có test đủ lớn.",
          "Độ lệch chuẩn giữa fold thường được báo cáo nhưng các fold không hoàn toàn độc lập vì tập train chồng lấn. Không nên biến mean ± std thành khoảng tin cậy chuẩn một cách máy móc. Nên lưu dự đoán out-of-fold, phân tích theo fold/nhóm và nếu cần khoảng bất định thì dùng phương pháp phù hợp với cấu trúc dữ liệu. Seed của việc chia fold cũng là một nguồn biến thiên cần ghi lại.",
        ],
      },
    ],
    workedExamples: [
      {
        title: "Phát hiện rò rỉ do bệnh nhân lặp lại",
        problem: "Có 1.000 ảnh từ 100 bệnh nhân, mỗi bệnh nhân 10 ảnh. Random 5-fold cho accuracy 95%, GroupKFold theo bệnh nhân cho 78%.",
        steps: [
          { state: "Random 5-fold chia từng ảnh", explanation: "Ảnh khác của cùng bệnh nhân có xác suất cao nằm cả train và validation." },
          { state: "Mô hình đạt 95%", explanation: "Một phần điểm số có thể đến từ nhận dạng đặc trưng riêng bệnh nhân hoặc điều kiện chụp, không phải tín hiệu bệnh tổng quát." },
          { state: "GroupKFold giữ toàn bộ ảnh một bệnh nhân trong một fold", explanation: "Validation giờ mô phỏng bệnh nhân hoàn toàn mới." },
          { state: "Accuracy giảm còn 78%", explanation: "Đây là ước lượng phù hợp hơn nếu mục tiêu triển khai là dự đoán cho bệnh nhân mới." },
        ],
        conclusion: "Split đúng có thể làm điểm thấp hơn nhưng làm bằng chứng đáng tin hơn; không được chọn split chỉ vì điểm cao.",
        sanityChecks: [
          "Giao của tập patient_id train và validation ở mỗi fold phải rỗng.",
          "Mỗi mẫu phải xuất hiện đúng một lần trong dự đoán out-of-fold của một vòng CV.",
        ],
      },
    ],
    implementationChecklist: [
      "Xác định đơn vị độc lập, nhóm và chiều thời gian trước khi chọn splitter.",
      "Đặt preprocessing, resampling và model trong một pipeline được fit trong từng fold.",
      "Lưu index fold, seed, dự đoán out-of-fold và metric từng fold.",
      "Dùng nested CV hoặc test độc lập khi đã tìm nhiều siêu tham số.",
      "Kiểm thử không giao nhóm và không dùng dữ liệu tương lai ở mọi fold.",
    ],
    masteryChecklist: [
      "Giải thích được đối tượng mà K-fold đang ước lượng.",
      "Chọn đúng random, stratified, group hay time-series split cho tình huống cụ thể.",
      "Nhận diện preprocessing ngoài fold là data leakage.",
      "Phân biệt CV chọn mô hình, nested CV và test cuối.",
    ],
    glossary: [
      { term: "Fold", definition: "Một phần dữ liệu lần lượt đóng vai trò validation trong cross-validation." },
      { term: "Exchangeability", definition: "Giả định thứ tự mẫu không mang thông tin và các mẫu có thể hoán đổi cho mục đích suy luận." },
      { term: "GroupKFold", definition: "Phép chia giữ toàn bộ mẫu của một nhóm ở cùng phía trong mỗi lần đánh giá." },
      { term: "Out-of-fold prediction", definition: "Dự đoán cho mỗi mẫu từ mô hình không được fit trên mẫu đó." },
      { term: "Nested cross-validation", definition: "CV hai tầng tách việc chọn cấu hình khỏi việc ước lượng hiệu năng của quy trình chọn." },
      { term: "Selection bias", definition: "Độ lạc quan phát sinh khi báo cáo lựa chọn tốt nhất trong nhiều thử nghiệm trên cùng dữ liệu." },
    ],
    sourceIds: ["pml-intro", "d2l-en", "ioai-2026"],
  },

  "ds-hyperparameter-tuning": {
    lessonId: "ds-hyperparameter-tuning",
    readingMinutes: 30,
    openingQuestions: [
      "Tại sao thử càng nhiều cấu hình trên cùng validation có thể làm điểm validation càng kém đáng tin?",
      "Khi nào random search hiệu quả hơn grid search và khi nào cần tối ưu tuần tự?",
    ],
    sections: [
      {
        title: "Siêu tham số là một phần của quy trình lựa chọn mô hình",
        paragraphs: [
          "Siêu tham số điều khiển giả thuyết hoặc quá trình học nhưng không được ước lượng trực tiếp như trọng số mô hình: độ sâu cây, cường độ regularization, learning rate, số chiều embedding. Mỗi cấu hình phải được đánh giá bằng cùng split và cùng metric. Nếu cấu hình được chọn từ validation, điểm tốt nhất là ước lượng lạc quan cho chính cấu hình đó; test phải vẫn được khóa.",
          "Không gian tìm kiếm nên được xây từ hiểu biết về thang đo. Learning rate, C, alpha và weight decay thường trải nhiều bậc độ lớn nên tìm trên log scale. Tham số nguyên nhỏ hoặc lựa chọn rời rạc cần phân phối khác. Điều kiện phụ thuộc cũng quan trọng: tham số của kernel RBF không nên được thử khi kernel tuyến tính.",
        ],
      },
      {
        title: "Grid, random và tìm kiếm thích nghi",
        paragraphs: [
          "Grid search lãng phí khi chỉ vài chiều thật sự quan trọng, vì nó dành nhiều thử nghiệm cho tổ hợp khác nhau ở các chiều không ảnh hưởng. Random search lấy nhiều giá trị khác nhau hơn trên từng chiều với cùng ngân sách và là baseline mạnh. Bayesian optimization dùng lịch sử để cân bằng khai thác vùng tốt và khám phá vùng bất định; successive halving/Hyperband cấp tài nguyên dần và dừng sớm cấu hình kém.",
          "Early stopping chỉ công bằng nếu tín hiệu trung gian có thể so sánh và ngân sách tối thiểu đủ để cấu hình chậm thể hiện tiềm năng. Cần ghi nhận cấu hình thất bại, thời gian, tài nguyên và seed; bỏ im lặng các lần OOM hoặc NaN có thể làm kết quả thiên lệch. Tối ưu đa mục tiêu nên giữ Pareto frontier của chất lượng, độ trễ, bộ nhớ thay vì ép tất cả vào một metric tùy tiện.",
        ],
      },
      {
        title: "Tránh overfit vào validation và tái lập lựa chọn",
        paragraphs: [
          "Mỗi quyết định dựa trên validation—chọn đặc trưng, đổi seed, chọn epoch, chỉnh phạm vi—tiêu thụ thông tin của tập đó. Sau hàng trăm thử nghiệm, chênh lệch nhỏ có thể chỉ là may mắn. Có thể giảm rủi ro bằng CV, nested CV, tập validation thứ hai, giới hạn ngân sách và quy tắc lựa chọn ưu tiên mô hình đơn giản trong vùng sai số thống kê tương đương.",
          "Tái lập đòi hỏi lưu đầy đủ search space, sampler, seed, code/data version và mapping trial-to-result. Sau khi khóa cấu hình, fit lại theo quy trình đã định rồi đánh giá test đúng một lần. Không được dùng test để sửa thêm và vẫn gọi đó là test cuối; nếu sửa, test đã trở thành validation và cần một tập độc lập mới.",
        ],
      },
    ],
    workedExamples: [
      {
        title: "Thiết kế random search theo log scale",
        problem: "Cần thử learning rate trong [1e-5, 1e-1] và dropout trong [0, 0.5] với ngân sách 20 trial.",
        steps: [
          { state: "u ~ Uniform(-5,-1); lr=10^u", explanation: "Lấy log-uniform cho learning rate phân bổ cơ hội đều trên bốn bậc độ lớn." },
          { state: "dropout ~ Uniform(0,0.5)", explanation: "Dropout nằm trên đoạn tuyến tính hữu hạn nên uniform thông thường là điểm khởi đầu hợp lý." },
          { state: "Mỗi trial dùng cùng fold và seed list", explanation: "Common random numbers làm so sánh cấu hình bớt nhiễu; vẫn có thể lặp seed cho cấu hình cuối." },
          { state: "Chọn theo mean CV, dùng quy tắc đơn giản hơn nếu gần hòa", explanation: "Tránh chọn cấu hình phức tạp chỉ vì chênh lệch nhỏ hơn bất định." },
        ],
        conclusion: "Phân phối tìm kiếm phải phản ánh thang đo; không chỉ khai báo hai đầu khoảng rồi mặc định uniform tuyến tính.",
        sanityChecks: [
          "Mọi learning rate sinh ra phải thuộc [1e-5,1e-1] và xuất hiện trên nhiều bậc độ lớn.",
          "Tập test không được truy cập trong bất kỳ trial hay quyết định dừng nào.",
        ],
      },
    ],
    implementationChecklist: [
      "Định nghĩa metric, split và ngân sách trước khi chạy search.",
      "Dùng log scale cho đại lượng trải nhiều bậc và khai báo điều kiện phụ thuộc.",
      "Đưa toàn bộ preprocessing vào pipeline của từng trial/fold.",
      "Lưu cấu hình, seed, phiên bản dữ liệu/mã, lỗi và tài nguyên của mọi trial.",
      "Khóa cấu hình trước khi đánh giá test; dùng nested CV khi dữ liệu nhỏ.",
    ],
    masteryChecklist: [
      "Phân biệt tham số học được và siêu tham số.",
      "Giải thích lợi thế của random search trong không gian nhiều chiều.",
      "Thiết kế phân phối tìm kiếm đúng thang đo.",
      "Nhận diện và hạn chế overfit vào validation sau nhiều trial.",
    ],
    glossary: [
      { term: "Search space", definition: "Tập miền giá trị và điều kiện của các siêu tham số được phép thử." },
      { term: "Trial", definition: "Một lần huấn luyện-đánh giá với một cấu hình siêu tham số." },
      { term: "Log-uniform", definition: "Phân phối uniform trên logarithm, phù hợp đại lượng trải nhiều bậc." },
      { term: "Bayesian optimization", definition: "Tối ưu tuần tự dùng mô hình thay thế để chọn thử nghiệm tiếp theo." },
      { term: "Successive halving", definition: "Phương pháp dừng sớm cấu hình kém và tăng tài nguyên cho cấu hình tốt." },
      { term: "Pareto frontier", definition: "Các nghiệm không bị nghiệm khác đồng thời vượt trội trên mọi mục tiêu." },
    ],
    sourceIds: ["pml-intro", "d2l-en", "ioai-2026"],
  },

  "ds-feature-engineering": {
    lessonId: "ds-feature-engineering",
    readingMinutes: 31,
    openingQuestions: [
      "Một đặc trưng dự đoán rất mạnh có thể là dấu hiệu tốt hay dấu hiệu rò rỉ dữ liệu?",
      "Làm sao biến thời gian, danh mục và biến số thành đầu vào phù hợp mà vẫn giữ quy trình ngoài mẫu đúng?",
    ],
    sections: [
      {
        title: "Đặc trưng phải tồn tại tại thời điểm dự đoán",
        paragraphs: [
          "Feature engineering là đưa inductive bias và ngữ cảnh miền vào biểu diễn đầu vào. Câu hỏi đầu tiên không phải tương quan bao nhiêu mà là tại thời điểm hệ thống phải dự đoán, đặc trưng này đã thật sự có và được tính theo đúng dữ liệu quá khứ chưa. Một biến như trạng thái hoàn tiền có thể dự đoán gian lận gần hoàn hảo nhưng chỉ xuất hiện sau khi sự kiện đã được điều tra; dùng nó là target leakage.",
          "Cần lập lineage cho mỗi đặc trưng: nguồn, timestamp sự kiện, timestamp khả dụng, cửa sổ tổng hợp và khóa join. Với dự báo theo thời gian, rolling mean tại thời điểm t chỉ được dùng quan sát trước t; thao tác rolling mặc định có thể vô tình chứa hàng hiện tại. Với dữ liệu theo thực thể, aggregate target encoding phải được tính out-of-fold để nhãn của hàng validation không quay lại chính nó.",
        ],
      },
      {
        title: "Biểu diễn số, danh mục và chu kỳ",
        paragraphs: [
          "Standardization hữu ích cho mô hình nhạy thang đo như hồi quy có regularization, SVM và kNN, nhưng ít cần thiết cho cây quyết định. Biến lệch phải được biến đổi dựa trên giả định: log1p phù hợp cho đại lượng không âm có tỷ lệ, nhưng không hợp lệ một cách máy móc với số âm. Missingness có thể mang tín hiệu; imputation nên kèm chỉ báo thiếu nếu cơ chế thiếu có ý nghĩa, đồng thời phải xem xét thiên lệch do dữ liệu không thiếu ngẫu nhiên.",
          "One-hot encoding không tạo thứ tự giả nhưng có thể bùng nổ chiều với cardinality cao. Hashing, frequency encoding, target encoding có smoothing hoặc embedding là lựa chọn khác, mỗi cách có trade-off về va chạm, leakage và khả năng xử lý hạng mục mới. Thời gian theo chu kỳ nên dùng sin/cos để khoảng cách giữa 23 giờ và 0 giờ nhỏ; xu hướng dài hạn và mùa vụ cần được biểu diễn riêng.",
        ],
        formulas: [
          "hour_sin = sin(2*pi*hour/24); hour_cos = cos(2*pi*hour/24)",
          "z = (x - mean_train) / std_train",
        ],
      },
      {
        title: "Chọn đặc trưng là một bước học phải nằm trong validation",
        paragraphs: [
          "Filter methods xếp đặc trưng bằng thống kê đơn biến, wrapper methods đánh giá tập con qua mô hình, embedded methods chọn trong quá trình fit như L1 hoặc importance của cây. Nếu chọn đặc trưng trên toàn bộ dữ liệu trước cross-validation, validation đã ảnh hưởng lựa chọn. Mọi bước dựa trên phân phối X hoặc quan hệ X-y phải fit trong fold.",
          "Feature importance không đồng nghĩa quan hệ nhân quả. Đặc trưng tương quan có thể chia sẻ hoặc che importance; impurity importance thiên về biến nhiều điểm chia; permutation importance phải đo trên dữ liệu ngoài mẫu và phá vỡ cấu trúc phụ thuộc. Đặc trưng tốt được đánh giá bằng ablation, độ ổn định qua fold/thời gian, chi phí thu thập, độ trễ và rủi ro drift, không chỉ một lần tăng metric.",
        ],
      },
    ],
    workedExamples: [
      {
        title: "Target encoding không rò rỉ",
        problem: "Mã hóa biến city bằng tỷ lệ mua hàng trung bình cho 4-fold cross-validation.",
        steps: [
          { state: "Chọn fold 1 làm validation", explanation: "Không dùng bất kỳ nhãn nào của fold 1 để tạo mapping cho các hàng fold 1." },
          { state: "Tính mean target theo city trên folds 2-4", explanation: "Có thể smoothing về global mean của chính phần train để ổn định thành phố ít mẫu." },
          { state: "Áp mapping lên fold 1", explanation: "City chưa từng thấy nhận global mean hoặc giá trị fallback được định trước." },
          { state: "Lặp bốn fold và fit mapping cuối trên toàn bộ train", explanation: "Out-of-fold values dùng cho đánh giá; mapping toàn train chỉ dùng sau khi chốt pipeline để phục vụ dữ liệu tương lai." },
        ],
        conclusion: "Target encoding là supervised transformation nên phải được cross-fit giống một mô hình.",
        sanityChecks: [
          "Nhãn của một hàng không được góp phần tạo encoding cho chính hàng đó trong đánh giá.",
          "Mọi category mới phải có fallback hữu hạn và không tạo NaN ngoài dự kiến.",
        ],
      },
    ],
    implementationChecklist: [
      "Ghi timestamp khả dụng và lineage cho từng đặc trưng.",
      "Fit imputer, scaler, encoder và selector chỉ trên train của từng fold.",
      "Xử lý rõ category mới, giá trị thiếu, ngoại lệ và đơn vị đo.",
      "Cross-fit mọi đặc trưng dùng target hoặc thống kê theo nhóm có nhãn.",
      "Đánh giá bằng ablation ngoài mẫu, độ ổn định, độ trễ và chi phí thu thập.",
    ],
    masteryChecklist: [
      "Phân biệt feature engineering hợp lệ với target/future leakage.",
      "Chọn biểu diễn phù hợp cho số, danh mục và biến chu kỳ.",
      "Giải thích vì sao target encoding cần out-of-fold.",
      "Diễn giải feature importance mà không suy ra quan hệ nhân quả.",
    ],
    glossary: [
      { term: "Feature lineage", definition: "Dòng nguồn gốc và phép biến đổi tạo nên một đặc trưng." },
      { term: "Target leakage", definition: "Thông tin về nhãn hoặc tương lai không có lúc dự đoán lọt vào đầu vào." },
      { term: "Target encoding", definition: "Mã hóa category bằng thống kê nhãn có smoothing và kiểm soát rò rỉ." },
      { term: "Cardinality", definition: "Số giá trị phân biệt của một biến danh mục." },
      { term: "Cross-fitting", definition: "Tạo biến đổi cho mỗi fold bằng mô hình/thống kê fit trên các fold còn lại." },
      { term: "Ablation", definition: "Thử nghiệm loại bỏ một thành phần để đo đóng góp ngoài mẫu của nó." },
    ],
    sourceIds: ["pml-intro", "d2l-en", "mml"],
  },

  "ds-data-processing": {
    lessonId: "ds-data-processing",
    readingMinutes: 34,
    openingQuestions: [
      "Vì sao cùng một thuật toán có thể cho kết quả rất khác chỉ vì cách định nghĩa một hàng dữ liệu và thời điểm cắt dữ liệu?",
      "Kiểm tra nào giúp ngăn imputation, augmentation hoặc cân bằng lớp làm rò rỉ validation?",
    ],
    sections: [
      {
        title: "Bắt đầu từ hợp đồng dữ liệu và đơn vị quan sát",
        paragraphs: [
          "Data processing không phải khâu dọn dẹp trung tính; nó xác định bài toán mà mô hình thực sự học. Cần khai báo một hàng đại diện cho gì, khóa duy nhất, nhãn được quan sát khi nào, feature cutoff khi nào và quần thể được lấy mẫu ra sao. Duplicate cùng thực thể có thể khiến mô hình ghi nhớ và làm test lạc quan; duplicate hợp lệ theo thời gian lại không thể xóa máy móc.",
          "Schema nên ràng buộc kiểu, miền giá trị, đơn vị, timezone, category cho phép và quy tắc thiếu. Kiểm tra dữ liệu phải chạy ở ranh giới ingest và trước fit: uniqueness, referential integrity, phân phối, tỷ lệ thiếu, nhãn bất thường. Mọi phép sửa cần có provenance để tái lập. Không nên âm thầm ép lỗi parse thành NaN rồi impute, vì điều đó che hỏng nguồn dữ liệu.",
        ],
      },
      {
        title: "Thứ tự split rồi mới fit phép biến đổi",
        paragraphs: [
          "Nguyên tắc cốt lõi là chia dữ liệu theo thiết kế đánh giá trước, sau đó fit các transformer trên train. Median imputation, mean/std, vocabulary, PCA, feature selection và outlier threshold đều học thống kê dữ liệu. Nếu tính trên toàn bộ tập, validation cung cấp thông tin cho pipeline. Augmentation và oversampling chỉ áp dụng cho train; nếu tạo bản sao trước split, họ hàng của cùng mẫu có thể xuất hiện ở hai phía.",
          "Xử lý mất cân bằng không đồng nghĩa bắt buộc cân bằng phân phối. Class weight thay đổi loss; undersampling bỏ thông tin; oversampling thay đổi tần suất; SMOTE đưa giả định nội suy trong không gian đặc trưng. Dù dùng cách nào, validation/test phải giữ prevalence mục tiêu và metric phải phù hợp. Nếu huấn luyện trên prevalence nhân tạo, xác suất đầu ra có thể cần hiệu chuẩn hoặc hiệu chỉnh prior trước khi diễn giải.",
        ],
      },
      {
        title: "Chất lượng, drift và tính tái lập của pipeline",
        paragraphs: [
          "Outlier có thể là lỗi đo, trường hợp hiếm hợp lệ hoặc chính tín hiệu cần phát hiện. Quy tắc winsorize/xóa phải dựa trên train và lý do miền; xóa theo nhãn có thể thay đổi mục tiêu. Missing data cũng có cơ chế MCAR, MAR hoặc MNAR khác nhau; imputation không phục hồi thông tin bị thiếu và không tự loại bỏ thiên lệch chọn mẫu.",
          "Pipeline sản xuất cần version dữ liệu, schema, code, tham số và artifact transformer. Kiểm tra train-serving skew bằng cách dùng chung logic biến đổi và test trên golden records. Sau triển khai, giám sát schema, missingness, category mới, drift của đầu vào và hiệu năng khi nhãn đến; drift thống kê không luôn kéo theo suy giảm metric nhưng là tín hiệu cần điều tra. Một pipeline tốt phải fail loudly cho vi phạm nghiêm trọng và có chính sách fallback rõ.",
        ],
      },
    ],
    workedExamples: [
      {
        title: "Pipeline đúng thứ tự cho dữ liệu mất cân bằng",
        problem: "Xây bộ phân loại với giá trị thiếu, standardization và oversampling trong 5-fold CV.",
        steps: [
          { state: "Chia fold theo thực thể trước", explanation: "Khóa mọi mẫu của một thực thể trong cùng fold để tránh leakage." },
          { state: "Fit median và mean/std trên train-fold", explanation: "Áp cùng thống kê lên validation-fold mà không fit lại." },
          { state: "Oversample chỉ ma trận train-fold đã biến đổi", explanation: "Validation giữ nguyên prevalence và không chứa mẫu tổng hợp." },
          { state: "Fit model rồi đánh giá validation nguyên bản", explanation: "Lặp mỗi fold; test cuối chỉ được biến đổi bằng artifact fit trên toàn train." },
        ],
        conclusion: "Split boundary phải bao quanh toàn bộ chuỗi thao tác học từ dữ liệu, không chỉ lời gọi model.fit.",
        sanityChecks: [
          "Số hàng và phân bố nhãn validation không đổi do oversampling/augmentation.",
          "Không có ID hoặc nguồn gốc mẫu tổng hợp nào giao giữa train và validation.",
          "Transformer dùng cho validation chỉ mang thống kê của train-fold tương ứng.",
        ],
      },
    ],
    implementationChecklist: [
      "Định nghĩa grain, khóa, feature cutoff, label time và schema trước xử lý.",
      "Split theo thực thể/thời gian trước khi fit mọi thống kê hoặc tạo mẫu tổng hợp.",
      "Đặt imputation, scaling, encoding, selection và model trong pipeline tái lập.",
      "Giữ validation/test theo prevalence mục tiêu; ghi rõ class weighting/resampling.",
      "Version dữ liệu và artifact, kiểm tra schema, drift và train-serving skew.",
    ],
    masteryChecklist: [
      "Giải thích được đơn vị quan sát và feature cutoff của một dataset.",
      "Xếp đúng thứ tự split, fit transformer, resample, fit model và evaluate.",
      "Phân biệt outlier lỗi với trường hợp hiếm hợp lệ và nêu bằng chứng cần có.",
      "Nhận diện leakage qua imputation, scaling, augmentation và oversampling.",
      "Thiết kế được kiểm tra schema và golden-record cho pipeline triển khai.",
    ],
    glossary: [
      { term: "Data contract", definition: "Cam kết máy đọc được về schema, ý nghĩa và chất lượng dữ liệu." },
      { term: "Grain", definition: "Đơn vị quan sát mà mỗi hàng dữ liệu đại diện." },
      { term: "Feature cutoff", definition: "Mốc thời gian cuối cùng mà thông tin đầu vào được phép sử dụng." },
      { term: "Train-serving skew", definition: "Khác biệt logic hoặc phân phối biến đổi giữa huấn luyện và phục vụ." },
      { term: "Oversampling", definition: "Tăng biểu diễn của lớp/nhóm bằng lặp hoặc tạo mẫu trong phần train." },
      { term: "Data drift", definition: "Sự thay đổi phân phối dữ liệu đầu vào theo thời gian hoặc môi trường." },
    ],
    sourceIds: ["pml-intro", "d2l-en", "ioai-2026"],
  },
} satisfies LessonTheoryMap;
