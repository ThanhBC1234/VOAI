import type {
  LessonPracticeMap,
  PracticalBarItem,
  PracticalIllustration,
  PracticalPlotSeries,
  PracticalSequenceItem,
} from "./types";

function bars(
  title: string,
  caption: string,
  items: PracticalBarItem[],
  range: { min?: number; max?: number } = {},
): PracticalIllustration {
  return { kind: "bars", title, caption, items, ...range };
}

function sequence(
  title: string,
  caption: string,
  items: PracticalSequenceItem[],
  layout: "pipeline" | "cards" | "timeline" = "pipeline",
): PracticalIllustration {
  return { kind: "sequence", title, caption, items, layout };
}

function matrix(
  title: string,
  caption: string,
  rows: string[],
  columns: string[],
  values: number[][],
  displayValues?: string[][],
  scale: "sequential" | "diverging" = "sequential",
): PracticalIllustration {
  return { kind: "matrix", title, caption, rows, columns, values, ...(displayValues ? { displayValues } : {}), scale };
}

function plot(
  title: string,
  caption: string,
  xLabel: string,
  yLabel: string,
  series: PracticalPlotSeries[],
  connect = true,
): PracticalIllustration {
  return { kind: "plot", title, caption, xLabel, yLabel, series, connect };
}

export const dataDeepLearningPractice = {
  "ds-metrics": {
    lessonId: "ds-metrics",
    scenario: {
      title: "Chọn ngưỡng cho bộ lọc thư rác của trường",
      context: "Nhóm CNTT thử bộ lọc trên sáu thư đã được giáo viên gắn nhãn. Mỗi thư có một xác suất là thư rác; thay ngưỡng sẽ đổi đồng thời số thư rác bắt được và thư hợp lệ bị chặn nhầm.",
      goal: "Tính accuracy, precision, recall và F1 từ cùng một ngưỡng để không tối ưu nhầm một chỉ số đơn lẻ.",
    },
    inputs: [
      { label: "Nhãn thật và xác suất", format: "python", value: "truth = [1, 0, 1, 0, 1, 0]\nscores = [0.92, 0.71, 0.64, 0.40, 0.35, 0.10]" },
    ],
    python: {
      title: "Tính bốn metric nhị phân từ đầu",
      filename: "spam_metrics.py",
      codeTemplate: `threshold = {{threshold}}
truth = [1, 0, 1, 0, 1, 0]
scores = [0.92, 0.71, 0.64, 0.40, 0.35, 0.10]
pred = [int(score >= threshold) for score in scores]
tp = sum(a == b == 1 for a, b in zip(truth, pred))
fp = sum(a == 0 and b == 1 for a, b in zip(truth, pred))
fn = sum(a == 1 and b == 0 for a, b in zip(truth, pred))
tn = len(truth) - tp - fp - fn
accuracy = (tp + tn) / len(truth)
precision = tp / (tp + fp) if tp + fp else 0.0
recall = tp / (tp + fn) if tp + fn else 0.0
f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
print(f"threshold={threshold:.2f}")
print(f"TP={tp} FP={fp} FN={fn} TN={tn}")
print(f"accuracy={accuracy:.3f} precision={precision:.3f} recall={recall:.3f} f1={f1:.3f}")`,
    },
    explanation: [
      { title: "Đổi xác suất thành quyết định", text: "Mỗi score lớn hơn hoặc bằng threshold được gán nhãn 1; đây là bước duy nhất thay đổi giữa ba lượt thử." },
      { title: "Đếm bốn trường hợp", text: "TP, FP, FN và TN được đếm trực tiếp từ từng cặp nhãn thật–dự đoán nên tổng của chúng luôn bằng sáu." },
      { title: "Tính metric đúng mẫu số", text: "Precision dùng TP+FP, recall dùng TP+FN, còn accuracy dùng toàn bộ mẫu; nhánh điều kiện tránh chia cho 0." },
      { title: "Đọc trade-off", text: "Hạ ngưỡng bắt được nhiều thư rác hơn nhưng cũng chặn nhầm nhiều thư hợp lệ hơn; F1 cân bằng precision và recall chứ không thay thế chi phí nghiệp vụ." },
    ],
    experiment: {
      question: "Ngưỡng nào phù hợp nếu nhà trường ưu tiên không bỏ sót thư rác, và cái giá phải trả là gì?",
      parameterLabels: { threshold: "Ngưỡng phân loại" },
      defaultVariantId: "balanced",
      variants: [
        {
          id: "recall-first", label: "0,30 · ưu tiên recall", parameters: { threshold: 0.3 },
          expectedOutput: "threshold=0.30\nTP=3 FP=2 FN=0 TN=1\naccuracy=0.667 precision=0.600 recall=1.000 f1=0.750",
          observation: "Không bỏ sót thư rác nào, nhưng hai trong ba thư hợp lệ bị chặn nhầm.",
          illustration: bars("Metric tại ngưỡng 0,30", "Recall đạt 1,00 trong khi precision giảm còn 0,60.", [
            { label: "Accuracy", value: 0.667 }, { label: "Precision", value: 0.6, tone: "warn" },
            { label: "Recall", value: 1, tone: "good" }, { label: "F1", value: 0.75, tone: "accent" },
          ], { min: 0, max: 1 }),
        },
        {
          id: "balanced", label: "0,50 · cân bằng", parameters: { threshold: 0.5 },
          expectedOutput: "threshold=0.50\nTP=2 FP=1 FN=1 TN=2\naccuracy=0.667 precision=0.667 recall=0.667 f1=0.667",
          observation: "Precision và recall bằng nhau; một thư rác bị bỏ sót và một thư hợp lệ bị chặn nhầm.",
          illustration: bars("Metric tại ngưỡng 0,50", "Bốn metric bằng nhau trên tập toy này.", [
            { label: "Accuracy", value: 0.667 }, { label: "Precision", value: 0.667 },
            { label: "Recall", value: 0.667 }, { label: "F1", value: 0.667, tone: "accent" },
          ], { min: 0, max: 1 }),
        },
        {
          id: "precision-first", label: "0,70 · ngưỡng chặt", parameters: { threshold: 0.7 },
          expectedOutput: "threshold=0.70\nTP=1 FP=1 FN=2 TN=2\naccuracy=0.500 precision=0.500 recall=0.333 f1=0.400",
          observation: "Ngưỡng cao không cải thiện precision trong mẫu này vì score 0,71 vẫn là một false positive, đồng thời recall giảm mạnh.",
          illustration: bars("Metric tại ngưỡng 0,70", "Ngưỡng cao hơn không mặc nhiên tốt hơn nếu thứ hạng score chưa tốt.", [
            { label: "Accuracy", value: 0.5 }, { label: "Precision", value: 0.5 },
            { label: "Recall", value: 0.333, tone: "warn" }, { label: "F1", value: 0.4, tone: "warn" },
          ], { min: 0, max: 1 }),
        },
      ],
    },
    transferQuestion: "Nếu false positive làm mất một email quan trọng còn false negative chỉ đưa một thư rác vào hộp thư, bạn sẽ chọn metric và ngưỡng bằng cách nào trên validation set?",
  },

  "ds-confusion-roc-pr": {
    lessonId: "ds-confusion-roc-pr",
    scenario: {
      title: "Ưu tiên ca bệnh trong hàng chờ khám",
      context: "Một mô hình nhỏ chấm điểm nguy cơ cho tám hồ sơ đã có kết luận bác sĩ. Bệnh viện cần nhìn ma trận nhầm lẫn cùng TPR, FPR và precision trước khi chọn ngưỡng chuyển ca sang hàng ưu tiên.",
      goal: "Quan sát một ngưỡng tạo ra đồng thời một điểm trên ROC và một điểm trên đường precision–recall.",
    },
    inputs: [
      { label: "Tám hồ sơ kiểm định", format: "python", value: "truth = [1,1,0,1,0,0,1,0]\nscores = [0.90,0.70,0.80,0.55,0.40,0.30,0.20,0.10]" },
    ],
    python: {
      title: "Dựng ma trận nhầm lẫn tại một ngưỡng",
      filename: "triage_threshold.py",
      codeTemplate: `threshold = {{threshold}}
truth = [1, 1, 0, 1, 0, 0, 1, 0]
scores = [0.90, 0.70, 0.80, 0.55, 0.40, 0.30, 0.20, 0.10]
pred = [int(score >= threshold) for score in scores]
tp = sum(y == p == 1 for y, p in zip(truth, pred))
fp = sum(y == 0 and p == 1 for y, p in zip(truth, pred))
fn = sum(y == 1 and p == 0 for y, p in zip(truth, pred))
tn = sum(y == p == 0 for y, p in zip(truth, pred))
tpr = tp / (tp + fn)
fpr = fp / (fp + tn)
precision = tp / (tp + fp) if tp + fp else 1.0
print(f"threshold={threshold:.2f}")
print(f"matrix=[[{tp},{fn}],[{fp},{tn}]]")
print(f"TPR={tpr:.2f} FPR={fpr:.2f} precision={precision:.2f}")`,
    },
    explanation: [
      { title: "Ngưỡng tạo nhãn", text: "Score được giữ liên tục cho tới bước so sánh; không làm tròn score trước khi phân loại." },
      { title: "Xếp đúng bốn ô", text: "Hai hàng ma trận lần lượt là lớp thật dương và âm, hai cột là dự đoán dương và âm." },
      { title: "Nối sang ROC", text: "TPR là trục dọc và FPR là trục ngang của ROC; thay ngưỡng tạo một điểm khác trên đường cong." },
      { title: "Nối sang PR", text: "Precision dùng số dự đoán dương làm mẫu số nên nhạy với tỷ lệ lớp, khác với FPR dùng số âm thật." },
    ],
    experiment: {
      question: "Khi hạ ngưỡng, TPR tăng nhanh hơn hay FPR tăng nhanh hơn trên tám hồ sơ này?",
      parameterLabels: { threshold: "Ngưỡng chuyển ca" },
      defaultVariantId: "middle",
      variants: [
        {
          id: "wide", label: "0,25 · nhận rộng", parameters: { threshold: 0.25 },
          expectedOutput: "threshold=0.25\nmatrix=[[3,1],[3,1]]\nTPR=0.75 FPR=0.75 precision=0.50",
          observation: "Ba ca dương được tìm thấy nhưng ba ca âm cũng bị đưa vào hàng ưu tiên.",
          illustration: matrix("Ma trận ở ngưỡng 0,25", "Hàng là nhãn thật; cột là quyết định ưu tiên.", ["Thật +", "Thật −"], ["Dự đoán +", "Dự đoán −"], [[3, 1], [3, 1]], [["TP 3", "FN 1"], ["FP 3", "TN 1"]]),
        },
        {
          id: "middle", label: "0,50 · trung tâm", parameters: { threshold: 0.5 },
          expectedOutput: "threshold=0.50\nmatrix=[[3,1],[1,3]]\nTPR=0.75 FPR=0.25 precision=0.75",
          observation: "Giữ nguyên ba true positive so với ngưỡng 0,25 nhưng loại được hai false positive.",
          illustration: matrix("Ma trận ở ngưỡng 0,50", "Điểm ROC là (FPR 0,25; TPR 0,75).", ["Thật +", "Thật −"], ["Dự đoán +", "Dự đoán −"], [[3, 1], [1, 3]], [["TP 3", "FN 1"], ["FP 1", "TN 3"]]),
        },
        {
          id: "strict", label: "0,75 · nhận chặt", parameters: { threshold: 0.75 },
          expectedOutput: "threshold=0.75\nmatrix=[[1,3],[1,3]]\nTPR=0.25 FPR=0.25 precision=0.50",
          observation: "Ngưỡng chặt bỏ sót ba trong bốn ca dương mà vẫn còn một false positive score 0,80.",
          illustration: matrix("Ma trận ở ngưỡng 0,75", "TPR giảm xuống 0,25; đây không phải điểm vận hành tốt cho mục tiêu sàng lọc.", ["Thật +", "Thật −"], ["Dự đoán +", "Dự đoán −"], [[1, 3], [1, 3]], [["TP 1", "FN 3"], ["FP 1", "TN 3"]]),
        },
      ],
    },
    transferQuestion: "Với bệnh hiếm 1%, vì sao một điểm ROC có vẻ đẹp vẫn có thể cho precision thấp khi triển khai thực tế?",
  },

  "ds-underfit-overfit": {
    lessonId: "ds-underfit-overfit",
    scenario: {
      title: "Hiệu chỉnh cảm biến nhiệt trong nhà kính",
      context: "Nhóm kỹ thuật thử ba mức độ phức tạp cho đường hiệu chỉnh cảm biến. Log thí nghiệm cho thấy mô hình quá đơn giản sai ở cả train lẫn validation, còn mô hình bậc cao bám nhiễu train nhưng lệch trên ngày đo mới.",
      goal: "Dùng đồng thời train error, validation error và generalization gap để nhận diện underfit, mức phù hợp và overfit.",
    },
    inputs: [
      { label: "Log lỗi theo bậc mô hình", format: "json", value: "{\"1\":[8.4,9.1],\"3\":[3.2,3.6],\"9\":[0.8,5.7]}" },
    ],
    python: {
      title: "Đọc khoảng cách khái quát hóa",
      filename: "capacity_gap.py",
      codeTemplate: `degree = {{degree}}
errors = {1: (8.4, 9.1), 3: (3.2, 3.6), 9: (0.8, 5.7)}
train_error, validation_error = errors[degree]
gap = validation_error - train_error
if validation_error > 7:
    diagnosis = "underfit"
elif gap > 2:
    diagnosis = "overfit"
else:
    diagnosis = "balanced"
print(f"degree={degree}")
print(f"train={train_error:.1f} validation={validation_error:.1f} gap={gap:.1f}")
print(f"diagnosis={diagnosis}")`,
    },
    explanation: [
      { title: "Giữ nguyên cách chia dữ liệu", text: "Ba mô hình phải được so trên cùng train/validation split; nếu đổi split, chênh lệch có thể đến từ dữ liệu thay vì capacity." },
      { title: "Đọc train error", text: "Train error cao ở bậc 1 báo mô hình chưa đủ linh hoạt để mô tả quan hệ ngay trên dữ liệu đã thấy." },
      { title: "Đọc validation error", text: "Validation error thấp nhất ở bậc 3 cho thấy đây là lựa chọn tốt hơn trên log hiện có, không phải một định luật chung về đa thức bậc ba." },
      { title: "Đọc gap", text: "Bậc 9 có train error rất thấp nhưng gap 4,9, một dấu hiệu mô hình đang ghi nhớ nhiễu thay vì khái quát." },
    ],
    experiment: {
      question: "Khi tăng bậc từ 3 lên 9, cải thiện trên train có bù được suy giảm trên validation không?",
      parameterLabels: { degree: "Bậc đa thức" },
      defaultVariantId: "fit",
      variants: [
        {
          id: "under", label: "Bậc 1", parameters: { degree: 1 },
          expectedOutput: "degree=1\ntrain=8.4 validation=9.1 gap=0.7\ndiagnosis=underfit",
          observation: "Cả hai lỗi đều cao; gap nhỏ không có nghĩa mô hình tốt nếu train cũng chưa fit.",
          illustration: bars("Sai số bậc 1", "Đường thẳng bỏ qua độ cong của cảm biến.", [{ label: "Train", value: 8.4, tone: "warn" }, { label: "Validation", value: 9.1, tone: "warn" }], { min: 0, max: 10 }),
        },
        {
          id: "fit", label: "Bậc 3", parameters: { degree: 3 },
          expectedOutput: "degree=3\ntrain=3.2 validation=3.6 gap=0.4\ndiagnosis=balanced",
          observation: "Validation error thấp nhất và gap nhỏ trên ba ứng viên được thử.",
          illustration: bars("Sai số bậc 3", "Mô hình đủ linh hoạt mà chưa tạo khoảng cách khái quát hóa lớn.", [{ label: "Train", value: 3.2 }, { label: "Validation", value: 3.6, tone: "good" }], { min: 0, max: 10 }),
        },
        {
          id: "over", label: "Bậc 9", parameters: { degree: 9 },
          expectedOutput: "degree=9\ntrain=0.8 validation=5.7 gap=4.9\ndiagnosis=overfit",
          observation: "Train gần hoàn hảo nhưng validation xấu hơn bậc 3; gap tăng mạnh.",
          illustration: bars("Sai số bậc 9", "Khoảng cách 4,9 là dấu hiệu overfit rõ trên split này.", [{ label: "Train", value: 0.8, tone: "good" }, { label: "Validation", value: 5.7, tone: "warn" }], { min: 0, max: 10 }),
        },
      ],
    },
    transferQuestion: "Nếu validation set chỉ có mười mẫu, bạn cần thêm bằng chứng nào trước khi kết luận bậc 3 thật sự khái quát tốt nhất?",
  },

  "ds-cross-validation": {
    lessonId: "ds-cross-validation",
    scenario: {
      title: "Đánh giá mô hình dự báo tiêu thụ điện theo tuần",
      context: "Một trường chỉ có ít tuần dữ liệu đã gắn nhãn. Nhóm dự án ghi validation MAE trên nhiều fold để ước lượng cả mức lỗi trung bình lẫn độ dao động do cách chia mẫu.",
      goal: "Tính mean và population standard deviation của fold scores, đồng thời nhận ra số fold nhiều hơn không tự động làm metric tốt hơn.",
    },
    inputs: [
      { label: "MAE theo số fold", format: "python", value: "scores = {3:[0.24,0.31,0.27], 4:[0.24,0.31,0.27,0.29], 5:[0.24,0.31,0.27,0.29,0.26]}" },
    ],
    python: {
      title: "Tổng hợp điểm cross-validation",
      filename: "cv_summary.py",
      codeTemplate: `folds = {{folds}}
all_scores = {
    3: [0.24, 0.31, 0.27],
    4: [0.24, 0.31, 0.27, 0.29],
    5: [0.24, 0.31, 0.27, 0.29, 0.26],
}
scores = all_scores[folds]
mean = sum(scores) / len(scores)
std = (sum((score - mean) ** 2 for score in scores) / len(scores)) ** 0.5
print(f"folds={folds} scores={scores}")
print(f"mean={mean:.4f} std={std:.4f}")`,
    },
    explanation: [
      { title: "Một mẫu, một validation fold", text: "Trong k-fold chuẩn, mỗi mẫu làm validation đúng một lần; mọi biến đổi học từ dữ liệu phải fit riêng trong từng training fold." },
      { title: "Lấy trung bình", text: "Mean fold score cho một ước lượng tổng hợp, nhưng không cho biết kết quả nhạy với split đến mức nào." },
      { title: "Đo độ dao động", text: "Standard deviation ở đây dùng đúng danh sách fold scores như một population mô tả các fold đã chạy, không phải khoảng tin cậy độc lập." },
      { title: "Cân nhắc chi phí", text: "Tăng k dùng nhiều dữ liệu train hơn mỗi lượt nhưng phải fit nhiều lần và các fold scores vẫn tương quan." },
    ],
    experiment: {
      question: "Trong log này, thêm fold làm mean và độ dao động thay đổi ra sao?",
      parameterLabels: { folds: "Số fold" },
      defaultVariantId: "four",
      variants: [
        {
          id: "three", label: "3 fold", parameters: { folds: 3 },
          expectedOutput: "folds=3 scores=[0.24, 0.31, 0.27]\nmean=0.2733 std=0.0287",
          observation: "Ba lượt fit cho mean 0,2733; một fold 0,31 tạo độ dao động dễ thấy.",
          illustration: bars("MAE của 3 fold", "Mỗi cột là một lượt validation; thấp hơn là tốt hơn.", [{ label: "F1", value: 0.24 }, { label: "F2", value: 0.31, tone: "warn" }, { label: "F3", value: 0.27 }], { min: 0, max: 0.35 }),
        },
        {
          id: "four", label: "4 fold", parameters: { folds: 4 },
          expectedOutput: "folds=4 scores=[0.24, 0.31, 0.27, 0.29]\nmean=0.2775 std=0.0259",
          observation: "Fold thứ tư làm mean tăng nhẹ nhưng std giảm; không thể chỉ nhìn một trong hai số.",
          illustration: bars("MAE của 4 fold", "Mean 0,2775 không tốt hơn 3-fold dù số fold lớn hơn.", [{ label: "F1", value: 0.24 }, { label: "F2", value: 0.31, tone: "warn" }, { label: "F3", value: 0.27 }, { label: "F4", value: 0.29 }], { min: 0, max: 0.35 }),
        },
        {
          id: "five", label: "5 fold", parameters: { folds: 5 },
          expectedOutput: "folds=5 scores=[0.24, 0.31, 0.27, 0.29, 0.26]\nmean=0.2740 std=0.0242",
          observation: "Fold thứ năm đưa mean gần lại 3-fold và giảm std mô tả xuống 0,0242.",
          illustration: bars("MAE của 5 fold", "Thêm lượt đánh giá làm tốn thêm một lần fit mô hình.", [{ label: "F1", value: 0.24 }, { label: "F2", value: 0.31, tone: "warn" }, { label: "F3", value: 0.27 }, { label: "F4", value: 0.29 }, { label: "F5", value: 0.26 }], { min: 0, max: 0.35 }),
        },
      ],
    },
    transferQuestion: "Với dữ liệu theo thời gian, vì sao random k-fold có thể rò tương lai và bạn sẽ thay bằng chiến lược chia nào?",
  },

  "ds-hyperparameter-tuning": {
    lessonId: "ds-hyperparameter-tuning",
    scenario: {
      title: "Tối ưu learning rate trong ngân sách GPU hữu hạn",
      context: "Một đội thi đã xáo trộn trước năm cấu hình learning rate và chỉ đủ thời gian chạy một phần danh sách. Mỗi lượt trả về validation F1; cấu hình tốt nhất chỉ được chọn trong những lượt thật sự đã đánh giá.",
      goal: "Mô phỏng ảnh hưởng của budget lên best-so-far và tránh tuyên bố cấu hình chưa chạy là tốt nhất.",
    },
    inputs: [
      { label: "Hàng đợi cấu hình", format: "csv", value: "lr,val_f1\n0.001,0.71\n0.01,0.82\n0.1,0.76\n0.03,0.85\n0.003,0.80" },
    ],
    python: {
      title: "Chọn best-so-far theo budget",
      filename: "tuning_budget.py",
      codeTemplate: `budget = {{budget}}
candidates = [(0.001, 0.71), (0.01, 0.82), (0.1, 0.76), (0.03, 0.85), (0.003, 0.80)]
evaluated = candidates[:budget]
best_lr, best_f1 = max(evaluated, key=lambda item: item[1])
print(f"budget={budget} evaluated={len(evaluated)}")
print(f"best_lr={best_lr:g} best_f1={best_f1:.2f}")`,
    },
    explanation: [
      { title: "Cố định thứ tự thử", text: "Ví dụ giữ một hàng đợi xác định để chỉ thay budget; trong random search thực, cần ghi seed và toàn bộ cấu hình đã lấy mẫu." },
      { title: "Cắt đúng ngân sách", text: "Danh sách evaluated chỉ chứa số lượt được phép chạy nên không dùng thông tin từ tương lai." },
      { title: "Chọn theo validation", text: "Hàm max so validation F1, không chọn theo train score; test set vẫn được giữ kín cho tới khi chốt cấu hình." },
      { title: "Đọc best-so-far", text: "Best-so-far có thể đứng yên khi thêm lượt chạy và chỉ tăng khi gặp cấu hình tốt hơn; nó không được bảo đảm tăng ở mọi seed." },
    ],
    experiment: {
      question: "Lượt chạy nào đầu tiên làm thay đổi cấu hình tốt nhất sau budget 2?",
      parameterLabels: { budget: "Số cấu hình được chạy" },
      defaultVariantId: "medium",
      variants: [
        {
          id: "small", label: "2 lượt", parameters: { budget: 2 },
          expectedOutput: "budget=2 evaluated=2\nbest_lr=0.01 best_f1=0.82",
          observation: "Trong hai cấu hình đầu, learning rate 0,01 đang dẫn đầu với F1 0,82.",
          illustration: sequence("Hai lượt đầu", "Dấu sao là best-so-far.", [{ label: "lr 0,001", value: "0,71" }, { label: "lr 0,01", value: "0,82 ★", tone: "good" }]),
        },
        {
          id: "medium", label: "3 lượt", parameters: { budget: 3 },
          expectedOutput: "budget=3 evaluated=3\nbest_lr=0.01 best_f1=0.82",
          observation: "Thêm learning rate 0,1 nhưng F1 0,76 không vượt best hiện tại.",
          illustration: sequence("Ba lượt đầu", "Best-so-far có thể không đổi sau một lượt tốn kém.", [{ label: "lr 0,001", value: "0,71" }, { label: "lr 0,01", value: "0,82 ★", tone: "good" }, { label: "lr 0,1", value: "0,76", tone: "warn" }]),
        },
        {
          id: "full", label: "5 lượt", parameters: { budget: 5 },
          expectedOutput: "budget=5 evaluated=5\nbest_lr=0.03 best_f1=0.85",
          observation: "Lượt thứ tư tìm được learning rate 0,03 với F1 0,85; lượt thứ năm không vượt qua.",
          illustration: sequence("Đủ năm lượt", "Cấu hình tốt nhất xuất hiện ở lượt thứ tư.", [{ label: "lr 0,001", value: "0,71" }, { label: "lr 0,01", value: "0,82" }, { label: "lr 0,1", value: "0,76" }, { label: "lr 0,03", value: "0,85 ★", tone: "good" }, { label: "lr 0,003", value: "0,80" }]),
        },
      ],
    },
    transferQuestion: "Nếu bạn thử 200 cấu hình trên cùng validation set, vì sao best validation score có thể lạc quan và nested CV giải quyết phần nào vấn đề đó?",
  },

  "ds-feature-engineering": {
    lessonId: "ds-feature-engineering",
    scenario: {
      title: "Giảm ảnh hưởng chuyến giao hàng cực xa",
      context: "Một mô hình dự báo thời gian giao hàng dùng khoảng cách làm feature. Bốn chuyến nội đô nằm trong 15 km nhưng một chuyến 40 km có thể kéo thang đo và làm baseline tuyến tính quá nhạy.",
      goal: "Thử clip khoảng cách ở ba mức và quan sát feature sau biến đổi trước khi quyết định bằng cross-validation.",
    },
    inputs: [
      { label: "Khoảng cách năm chuyến", format: "python", value: "distances_km = [1, 3, 8, 15, 40]" },
    ],
    python: {
      title: "Clip feature bằng ngưỡng học từ train",
      filename: "clip_distance.py",
      codeTemplate: `cap = {{cap}}
distances = [1, 3, 8, 15, 40]
clipped = [min(distance, cap) for distance in distances]
mean = sum(clipped) / len(clipped)
print(f"cap={cap}km")
print(f"clipped={clipped}")
print(f"mean={mean:.1f}km")`,
    },
    explanation: [
      { title: "Nhìn phân bố gốc", text: "Giá trị 40 km khác xa bốn chuyến còn lại; phải xác minh đây là chuyến hợp lệ chứ không phải lỗi nhập liệu trước khi biến đổi." },
      { title: "Áp cùng một hàm", text: "Clip giữ nguyên giá trị dưới cap và thay mọi giá trị lớn hơn bằng cap, không làm thay đổi số hàng." },
      { title: "Fit trên train", text: "Trong dự án thật, cap theo quantile phải được học chỉ từ train fold rồi áp sang validation/test để tránh leakage." },
      { title: "Đánh giá mất thông tin", text: "Cap thấp làm mô hình bền với outlier nhưng khiến các chuyến 8, 15 và 40 km trở nên giống nhau ở feature này." },
    ],
    experiment: {
      question: "Cap nào bắt đầu làm mất sự khác biệt giữa nhiều chuyến nội đô?",
      parameterLabels: { cap: "Khoảng cách clip tối đa" },
      defaultVariantId: "moderate",
      variants: [
        {
          id: "strong", label: "5 km", parameters: { cap: 5 },
          expectedOutput: "cap=5km\nclipped=[1, 3, 5, 5, 5]\nmean=3.8km",
          observation: "Ba chuyến rất khác nhau đều thành 5 km; biến đổi này mạnh và có thể underfit.",
          illustration: plot("Khoảng cách sau clip 5 km", "Đường ngang ở 5 km cho thấy ba điểm bị bão hòa.", "Chuyến", "km", [{ label: "Đã clip", tone: "warn", points: [1, 3, 5, 5, 5].map((y, index) => ({ x: index + 1, y })) }]),
        },
        {
          id: "moderate", label: "10 km", parameters: { cap: 10 },
          expectedOutput: "cap=10km\nclipped=[1, 3, 8, 10, 10]\nmean=6.4km",
          observation: "Ba chuyến ngắn giữ nguyên; chuyến 15 và 40 km cùng bị giới hạn ở 10 km.",
          illustration: plot("Khoảng cách sau clip 10 km", "Cap vừa phải vẫn phân biệt ba chuyến đầu.", "Chuyến", "km", [{ label: "Đã clip", tone: "accent", points: [1, 3, 8, 10, 10].map((y, index) => ({ x: index + 1, y })) }]),
        },
        {
          id: "light", label: "20 km", parameters: { cap: 20 },
          expectedOutput: "cap=20km\nclipped=[1, 3, 8, 15, 20]\nmean=9.4km",
          observation: "Chỉ chuyến 40 km bị clip; phần lớn cấu trúc khoảng cách được giữ lại.",
          illustration: plot("Khoảng cách sau clip 20 km", "Chỉ outlier bị nén từ 40 xuống 20 km.", "Chuyến", "km", [{ label: "Đã clip", tone: "good", points: [1, 3, 8, 15, 20].map((y, index) => ({ x: index + 1, y })) }]),
        },
      ],
    },
    transferQuestion: "Nếu khoảng cách 40 km là nhóm khách hàng quan trọng chứ không phải outlier, bạn sẽ tạo feature nào thay vì clip mất tín hiệu này?",
  },

  "ds-data-processing": {
    lessonId: "ds-data-processing",
    scenario: {
      title: "Lọc bản ghi cảm biến thiếu quá nhiều trường",
      context: "Năm bản ghi trạm thời tiết lần lượt thiếu 0, 1, 2, 3 và 1 trường. Trước khi impute, nhóm dữ liệu đặt giới hạn số trường thiếu được chấp nhận cho mỗi hàng.",
      goal: "Thấy rõ quy tắc lọc thay đổi số hàng và ID nào còn lại, thay vì xóa dữ liệu thiếu một cách âm thầm.",
    },
    inputs: [
      { label: "Số trường thiếu theo ID", format: "csv", value: "station_id,missing_fields\nS0,0\nS1,1\nS2,2\nS3,3\nS4,1" },
    ],
    python: {
      title: "Lọc hàng theo missingness",
      filename: "filter_missing_rows.py",
      codeTemplate: `max_missing = {{max_missing}}
station_ids = ["S0", "S1", "S2", "S3", "S4"]
missing_counts = [0, 1, 2, 3, 1]
kept = [station for station, missing in zip(station_ids, missing_counts) if missing <= max_missing]
dropped = [station for station, missing in zip(station_ids, missing_counts) if missing > max_missing]
print(f"max_missing={max_missing}")
print(f"kept={kept}")
print(f"dropped={dropped}")`,
    },
    explanation: [
      { title: "Định nghĩa quy tắc trước", text: "Điều kiện dùng <= nên hàng thiếu đúng max_missing vẫn được giữ; ghi rõ toán tử tránh lỗi biên." },
      { title: "Giữ ID để audit", text: "Code trả cả danh sách kept và dropped thay vì chỉ một ma trận vô danh, giúp truy ngược bản ghi bị loại." },
      { title: "Không impute trước split", text: "Nếu bước sau tính median/mean, thống kê đó phải fit trên train và áp sang validation/test." },
      { title: "Kiểm tra thiên lệch", text: "Tỷ lệ bị loại cần được phân tích theo loại trạm, vùng và mùa vì missingness có thể không ngẫu nhiên." },
    ],
    experiment: {
      question: "Quy tắc nào loại ít dữ liệu hơn nhưng chuyển gánh nặng sang bước imputation?",
      parameterLabels: { max_missing: "Số trường thiếu tối đa" },
      defaultVariantId: "one",
      variants: [
        {
          id: "none", label: "Không chấp nhận thiếu", parameters: { max_missing: 0 },
          expectedOutput: "max_missing=0\nkept=['S0']\ndropped=['S1', 'S2', 'S3', 'S4']",
          observation: "Chỉ một trong năm hàng còn lại; dữ liệu sạch nhưng mất 80% mẫu.",
          illustration: sequence("Luồng lọc nghiêm ngặt", "Bốn bản ghi bị loại trước imputation.", [{ label: "S0", value: "giữ", tone: "good" }, { label: "S1", value: "loại", tone: "warn" }, { label: "S2", value: "loại", tone: "warn" }, { label: "S3", value: "loại", tone: "warn" }, { label: "S4", value: "loại", tone: "warn" }], "cards"),
        },
        {
          id: "one", label: "Tối đa 1 trường", parameters: { max_missing: 1 },
          expectedOutput: "max_missing=1\nkept=['S0', 'S1', 'S4']\ndropped=['S2', 'S3']",
          observation: "Giữ ba hàng và chỉ cần impute một trường ở S1, S4.",
          illustration: sequence("Luồng lọc vừa phải", "Ba bản ghi được giữ với quy tắc minh bạch.", [{ label: "S0", value: "giữ", tone: "good" }, { label: "S1", value: "giữ", tone: "good" }, { label: "S2", value: "loại", tone: "warn" }, { label: "S3", value: "loại", tone: "warn" }, { label: "S4", value: "giữ", tone: "good" }], "cards"),
        },
        {
          id: "two", label: "Tối đa 2 trường", parameters: { max_missing: 2 },
          expectedOutput: "max_missing=2\nkept=['S0', 'S1', 'S2', 'S4']\ndropped=['S3']",
          observation: "Bốn hàng được giữ, nhưng S2 cần impute hai trường nên độ bất định cao hơn.",
          illustration: sequence("Luồng lọc rộng", "Chỉ S3 bị loại; pipeline sau phải xử lý nhiều giá trị thiếu hơn.", [{ label: "S0", value: "giữ", tone: "good" }, { label: "S1", value: "giữ", tone: "good" }, { label: "S2", value: "giữ", tone: "accent" }, { label: "S3", value: "loại", tone: "warn" }, { label: "S4", value: "giữ", tone: "good" }], "cards"),
        },
      ],
    },
    transferQuestion: "Bạn sẽ ghi lại những thống kê nào để phát hiện việc lọc missingness làm biến mất không cân xứng dữ liệu của một vùng địa lý?",
  },

  "dl-perceptron": {
    lessonId: "dl-perceptron",
    scenario: {
      title: "Luật cảnh báo quá tải cho máy chủ phòng lab",
      context: "Một perceptron nhận ba tín hiệu nhị phân: CPU cao, còn ít RAM và hàng đợi dài. Trọng số [2, -1, 1] đã được chốt; ngưỡng quyết định độ nhạy của cảnh báo.",
      goal: "Tính score tuyến tính và xem ngưỡng biến ba trạng thái máy chủ thành cảnh báo như thế nào.",
    },
    inputs: [{ label: "Ba trạng thái máy chủ", format: "python", value: "states = [[1,1,0], [0,1,1], [1,0,1]]\nweights = [2,-1,1]" }],
    python: {
      title: "Perceptron forward không dùng thư viện",
      filename: "server_perceptron.py",
      codeTemplate: `threshold = {{threshold}}
states = [[1, 1, 0], [0, 1, 1], [1, 0, 1]]
weights = [2, -1, 1]
scores = [sum(value * weight for value, weight in zip(state, weights)) for state in states]
alerts = [int(score >= threshold) for score in scores]
print(f"threshold={threshold}")
print(f"scores={scores}")
print(f"alerts={alerts} total={sum(alerts)}")`,
    },
    explanation: [
      { title: "Nhân từng tín hiệu", text: "CPU cao đóng góp +2, ít RAM đóng góp -1 trong luật toy này, còn hàng đợi dài đóng góp +1." },
      { title: "Cộng thành score", text: "Perceptron chỉ nhìn tổng có trọng số; hai trạng thái khác nhau có thể có cùng score và cùng quyết định." },
      { title: "Áp hàm bước", text: "Điều kiện >= quy định điểm đúng bằng threshold vẫn phát cảnh báo, một chi tiết biên cần test." },
      { title: "Đổi chính sách", text: "Tăng threshold giảm số cảnh báo nhưng không đổi score; đây là đổi quy tắc vận hành chứ chưa huấn luyện lại trọng số." },
    ],
    experiment: {
      question: "Máy chủ nào đổi quyết định đầu tiên khi ngưỡng tăng?",
      parameterLabels: { threshold: "Ngưỡng cảnh báo" }, defaultVariantId: "normal",
      variants: [
        { id: "sensitive", label: "Ngưỡng 0", parameters: { threshold: 0 }, expectedOutput: "threshold=0\nscores=[1, 0, 3]\nalerts=[1, 1, 1] total=3", observation: "Trạng thái thứ hai nằm đúng biên score 0 nên vẫn phát cảnh báo.", illustration: sequence("Ba quyết định ở ngưỡng 0", "Mọi trạng thái đều qua hàm bước.", [{ label: "Máy 1", value: "1 → cảnh báo", tone: "warn" }, { label: "Máy 2", value: "0 → cảnh báo", tone: "warn" }, { label: "Máy 3", value: "3 → cảnh báo", tone: "warn" }], "cards") },
        { id: "normal", label: "Ngưỡng 1", parameters: { threshold: 1 }, expectedOutput: "threshold=1\nscores=[1, 0, 3]\nalerts=[1, 0, 1] total=2", observation: "Máy 2 không còn cảnh báo; máy 1 đúng biên 1 vẫn được đánh dấu.", illustration: sequence("Ba quyết định ở ngưỡng 1", "Hai máy có score đủ lớn.", [{ label: "Máy 1", value: "1 → cảnh báo", tone: "warn" }, { label: "Máy 2", value: "0 → bình thường", tone: "good" }, { label: "Máy 3", value: "3 → cảnh báo", tone: "warn" }], "cards") },
        { id: "strict", label: "Ngưỡng 2", parameters: { threshold: 2 }, expectedOutput: "threshold=2\nscores=[1, 0, 3]\nalerts=[0, 0, 1] total=1", observation: "Chỉ trạng thái đồng thời CPU cao và hàng đợi dài vượt ngưỡng.", illustration: sequence("Ba quyết định ở ngưỡng 2", "Luật chặt hơn giảm cảnh báo nhưng có thể bỏ sót máy 1.", [{ label: "Máy 1", value: "1 → bình thường", tone: "good" }, { label: "Máy 2", value: "0 → bình thường", tone: "good" }, { label: "Máy 3", value: "3 → cảnh báo", tone: "warn" }], "cards") },
      ],
    },
    transferQuestion: "Nếu tín hiệu ít RAM thực ra làm nguy cơ tăng, bạn cần thay đổi trọng số nào và thu thập nhãn lịch sử ra sao để kiểm chứng?",
  },

  "dl-gradient-descent": {
    lessonId: "dl-gradient-descent",
    scenario: {
      title: "Hiệu chỉnh nhiệt độ mục tiêu của bộ điều khiển",
      context: "Một tham số theta bắt đầu ở 0 trong khi giá trị hiệu chỉnh tốt nhất là 3. Hàm loss bình phương cho phép nhìn trực tiếp learning rate quyết định bước đi chậm, nhanh hay dao động.",
      goal: "Chạy bốn bước gradient descent và so lịch sử theta cùng loss cuối ở ba learning rate.",
    },
    inputs: [{ label: "Bài toán tối ưu", format: "text", value: "J(theta) = (theta - 3)^2; theta ban đầu = 0; chạy 4 bước" }],
    python: {
      title: "Bốn bước gradient descent",
      filename: "thermostat_gradient.py",
      codeTemplate: `learning_rate = {{learning_rate}}
theta = 0.0
history = []
for _ in range(4):
    gradient = 2 * (theta - 3)
    theta -= learning_rate * gradient
    history.append(round(theta, 4))
loss = (theta - 3) ** 2
print(f"lr={learning_rate:.2f}")
print(f"history={history}")
print(f"theta={theta:.4f} loss={loss:.4f}")`,
    },
    explanation: [
      { title: "Tính hướng dốc", text: "Gradient 2(theta-3) âm khi theta dưới 3, vì vậy phép trừ gradient làm theta tăng về phía cực tiểu." },
      { title: "Nhân learning rate", text: "Learning rate chỉ thay độ dài bước; gradient vẫn được tính lại tại theta mới sau mỗi vòng." },
      { title: "Ghi lịch sử", text: "History cho thấy quỹ đạo mà chỉ nhìn loss cuối có thể che khuất, đặc biệt khi cập nhật vượt qua cực tiểu." },
      { title: "Kiểm tra loss", text: "Với bài toán lồi một chiều này, theta gần 3 hơn phải cho loss nhỏ hơn; đây là sanity check trực tiếp." },
    ],
    experiment: {
      question: "Learning rate nào đi qua lại hai phía của theta=3 nhưng vẫn hội tụ nhanh trong bốn bước?",
      parameterLabels: { learning_rate: "Learning rate" }, defaultVariantId: "steady",
      variants: [
        { id: "slow", label: "0,05 · chậm", parameters: { learning_rate: 0.05 }, expectedOutput: "lr=0.05\nhistory=[0.3, 0.57, 0.813, 1.0317]\ntheta=1.0317 loss=3.8742", observation: "Mỗi bước chỉ đi 10% khoảng cách còn lại; sau bốn bước theta vẫn xa 3.", illustration: plot("Quỹ đạo learning rate 0,05", "Theta tăng đơn điệu nhưng chậm.", "Bước", "theta", [{ label: "theta", points: [{ x: 0, y: 0 }, { x: 1, y: 0.3 }, { x: 2, y: 0.57 }, { x: 3, y: 0.813 }, { x: 4, y: 1.0317 }] }, { label: "đích", tone: "good", points: [{ x: 0, y: 3 }, { x: 4, y: 3 }] }]) },
        { id: "steady", label: "0,20 · ổn định", parameters: { learning_rate: 0.2 }, expectedOutput: "lr=0.20\nhistory=[1.2, 1.92, 2.352, 2.6112]\ntheta=2.6112 loss=0.1512", observation: "Theta tiến đều về 3 và loss giảm mạnh sau bốn bước.", illustration: plot("Quỹ đạo learning rate 0,20", "Bước lớn hơn nhưng chưa vượt cực tiểu.", "Bước", "theta", [{ label: "theta", tone: "accent", points: [{ x: 0, y: 0 }, { x: 1, y: 1.2 }, { x: 2, y: 1.92 }, { x: 3, y: 2.352 }, { x: 4, y: 2.6112 }] }, { label: "đích", tone: "good", points: [{ x: 0, y: 3 }, { x: 4, y: 3 }] }]) },
        { id: "oscillate", label: "0,60 · dao động", parameters: { learning_rate: 0.6 }, expectedOutput: "lr=0.60\nhistory=[3.6, 2.88, 3.024, 2.9952]\ntheta=2.9952 loss=0.0000", observation: "Theta vượt qua 3 ở mỗi bước nhưng biên độ dao động co nhanh.", illustration: plot("Quỹ đạo learning rate 0,60", "Đường đi cắt qua mức tối ưu rồi hội tụ.", "Bước", "theta", [{ label: "theta", tone: "warn", points: [{ x: 0, y: 0 }, { x: 1, y: 3.6 }, { x: 2, y: 2.88 }, { x: 3, y: 3.024 }, { x: 4, y: 2.9952 }] }, { label: "đích", tone: "good", points: [{ x: 0, y: 3 }, { x: 4, y: 3 }] }]) },
      ],
    },
    transferQuestion: "Nếu loss có hai chiều với độ cong rất khác nhau, vì sao cùng một learning rate có thể chậm theo một hướng nhưng dao động theo hướng kia?",
  },
  "dl-backpropagation": {
    lessonId: "dl-backpropagation",
    scenario: {
      title: "Gradient cho nút dự báo hủy đơn",
      context: "Một nút sigmoid nhận hai feature [1, 2] với trọng số [0,2; -0,1]. Logit bằng 0 nên xác suất đúng 0,5, thuận tiện để nhìn tín hiệu lỗi quay ngược khi đổi target.",
      goal: "Tính forward probability rồi backprop gradient BCE qua logit, hai trọng số và bias.",
    },
    inputs: [{ label: "Nút sigmoid", format: "python", value: "x=[1.0,2.0]; weights=[0.2,-0.1]; bias=0.0" }],
    python: {
      title: "Backprop một nút sigmoid",
      filename: "single_neuron_backprop.py",
      codeTemplate: `import math
target = {{target}}
x = [1.0, 2.0]
weights = [0.2, -0.1]
logit = sum(a * b for a, b in zip(x, weights))
probability = 1 / (1 + math.exp(-logit))
d_logit = probability - target
d_weights = [d_logit * value for value in x]
print(f"target={target:.1f} probability={probability:.2f}")
print(f"d_logit={d_logit:.2f}")
print("d_weights=[" + ", ".join(f"{value:.2f}" for value in d_weights) + f"] d_bias={d_logit:.2f}")`,
    },
    explanation: [
      { title: "Forward", text: "Hai tích 1×0,2 và 2×-0,1 triệt tiêu, nên logit 0 và sigmoid trả xác suất 0,5." },
      { title: "Đạo hàm gộp", text: "Với sigmoid kết hợp BCE, đạo hàm theo logit rút gọn thành probability-target." },
      { title: "Lan về trọng số", text: "Mỗi d_weight bằng d_logit nhân feature tương ứng; feature thứ hai gấp đôi nên gradient cũng gấp đôi." },
      { title: "Đọc dấu", text: "Target lớn hơn dự đoán tạo gradient âm; gradient descent sẽ tăng logit ở bước kế tiếp." },
    ],
    experiment: {
      question: "Dấu gradient đổi ra sao khi cùng dự đoán 0,5 được so với ba target?",
      parameterLabels: { target: "Nhãn mục tiêu" }, defaultVariantId: "soft",
      variants: [
        { id: "negative", label: "Target 0", parameters: { target: 0 }, expectedOutput: "target=0.0 probability=0.50\nd_logit=0.50\nd_weights=[0.50, 1.00] d_bias=0.50", observation: "Gradient dương khiến gradient descent giảm logit.", illustration: sequence("Gradient nhãn âm", "Tín hiệu lỗi đi từ BCE về tham số.", [{ label: "p", value: "0,50" }, { label: "p-y", value: "+0,50", tone: "warn" }, { label: "dw₁", value: "+0,50" }, { label: "dw₂", value: "+1,00" }]) },
        { id: "soft", label: "Target 0,5", parameters: { target: 0.5 }, expectedOutput: "target=0.5 probability=0.50\nd_logit=0.00\nd_weights=[0.00, 0.00] d_bias=0.00", observation: "Dự đoán trùng target mềm nên mọi gradient bằng 0.", illustration: sequence("Gradient tại điểm khớp", "Không có tín hiệu cập nhật.", [{ label: "p", value: "0,50" }, { label: "p-y", value: "0,00", tone: "good" }, { label: "dw₁", value: "0,00" }, { label: "dw₂", value: "0,00" }]) },
        { id: "positive", label: "Target 1", parameters: { target: 1 }, expectedOutput: "target=1.0 probability=0.50\nd_logit=-0.50\nd_weights=[-0.50, -1.00] d_bias=-0.50", observation: "Dấu đảo ngược so với target 0; gradient descent sẽ tăng logit.", illustration: sequence("Gradient nhãn dương", "Feature thứ hai khuếch đại gradient gấp đôi.", [{ label: "p", value: "0,50" }, { label: "p-y", value: "-0,50", tone: "accent" }, { label: "dw₁", value: "-0,50" }, { label: "dw₂", value: "-1,00" }]) },
      ],
    },
    transferQuestion: "Nếu feature thứ hai lớn thêm 100 lần do chưa chuẩn hóa, gradient và learning rate an toàn sẽ thay đổi thế nào?",
  },

  "dl-activation-functions": {
    lessonId: "dl-activation-functions",
    scenario: {
      title: "Giữ tín hiệu âm trong cảm biến rung",
      context: "Một tầng ẩn nhận năm activation trước phi tuyến, trong đó hai giá trị âm chứa thông tin về hướng dao động. Leaky ReLU cho phép thử mức rò alpha thay vì cắt sạch phía âm.",
      goal: "Quan sát alpha thay đổi activation âm nhưng giữ nguyên phần dương và điểm 0.",
    },
    inputs: [{ label: "Activation trước phi tuyến", format: "python", value: "values = [-2.0, -0.5, 0.0, 1.0, 3.0]" }],
    python: {
      title: "Leaky ReLU với alpha tùy chỉnh",
      filename: "leaky_relu.py",
      codeTemplate: `alpha = {{alpha}}
values = [-2.0, -0.5, 0.0, 1.0, 3.0]
activated = [value if value >= 0 else alpha * value for value in values]
formatted = ", ".join(f"{value:.2f}" for value in activated)
print(f"alpha={alpha:.2f}")
print(f"activated=[{formatted}]")
print(f"negative_sum={sum(value for value in activated if value < 0):.2f}")`,
    },
    explanation: [
      { title: "Tách hai nhánh", text: "Giá trị không âm đi qua y nguyên; giá trị âm được nhân alpha nên hàm liên tục tại 0." },
      { title: "Đọc gradient", text: "Đạo hàm phía dương là 1 và phía âm là alpha; alpha 0 tái tạo ReLU." },
      { title: "Theo dõi độ lớn", text: "Negative_sum chỉ là chỉ báo toy cho lượng tín hiệu âm còn lại, không phải metric mô hình." },
      { title: "Chọn bằng validation", text: "Alpha lớn giữ nhiều tín hiệu âm hơn nhưng giảm tính chọn lọc; cần so trên dữ liệu thật." },
    ],
    experiment: {
      question: "Alpha tăng làm hai activation âm tiến gần hay xa 0 hơn?",
      parameterLabels: { alpha: "Hệ số rò alpha" }, defaultVariantId: "leaky",
      variants: [
        { id: "relu", label: "0,00 · ReLU", parameters: { alpha: 0 }, expectedOutput: "alpha=0.00\nactivated=[-0.00, -0.00, 0.00, 1.00, 3.00]\nnegative_sum=0.00", observation: "Hai giá trị âm bị đưa về signed zero.", illustration: bars("Activation alpha 0", "Phần âm bị cắt.", [{ label: "-2", value: 0 }, { label: "-0,5", value: 0 }, { label: "0", value: 0 }, { label: "1", value: 1 }, { label: "3", value: 3, tone: "good" }], { min: -1, max: 3 }) },
        { id: "leaky", label: "0,10 · rò nhẹ", parameters: { alpha: 0.1 }, expectedOutput: "alpha=0.10\nactivated=[-0.20, -0.05, 0.00, 1.00, 3.00]\nnegative_sum=-0.25", observation: "Tín hiệu âm còn lại ở thang nhỏ, cho gradient khác 0.", illustration: bars("Activation alpha 0,10", "Hai cột âm nhỏ vẫn được giữ.", [{ label: "-2", value: -0.2, tone: "accent" }, { label: "-0,5", value: -0.05, tone: "accent" }, { label: "0", value: 0 }, { label: "1", value: 1 }, { label: "3", value: 3, tone: "good" }], { min: -1, max: 3 }) },
        { id: "wide", label: "0,30 · rò mạnh", parameters: { alpha: 0.3 }, expectedOutput: "alpha=0.30\nactivated=[-0.60, -0.15, 0.00, 1.00, 3.00]\nnegative_sum=-0.75", observation: "Activation âm xa 0 hơn ba lần so với alpha 0,10.", illustration: bars("Activation alpha 0,30", "Độ dốc âm lớn giữ nhiều biên độ hơn.", [{ label: "-2", value: -0.6, tone: "accent" }, { label: "-0,5", value: -0.15, tone: "accent" }, { label: "0", value: 0 }, { label: "1", value: 1 }, { label: "3", value: 3, tone: "good" }], { min: -1, max: 3 }) },
      ],
    },
    transferQuestion: "Bạn sẽ dùng histogram activation và gradient thế nào để phân biệt dead ReLU với một tầng chỉ nhận input âm hợp lệ?",
  },

  "dl-loss-functions": {
    lessonId: "dl-loss-functions",
    scenario: {
      title: "Dự báo xe buýt có một chuyến bất thường",
      context: "Ba residual chuẩn hóa là 0,2; -0,4 và 3,0. Sai số 3,0 đến từ một chuyến kẹt xe hiếm; Huber loss dùng delta để chuyển từ bình phương sang tuyến tính khi residual lớn.",
      goal: "Tính loss từng mẫu và mean Huber ở ba delta để thấy mức phạt outlier thay đổi.",
    },
    inputs: [{ label: "Residual ba chuyến", format: "python", value: "residuals = [0.2, -0.4, 3.0]" }],
    python: {
      title: "Huber loss từ công thức từng nhánh",
      filename: "huber_bus_delay.py",
      codeTemplate: `delta = {{delta}}
residuals = [0.2, -0.4, 3.0]
losses = []
for residual in residuals:
    absolute = abs(residual)
    loss = 0.5 * residual ** 2 if absolute <= delta else delta * (absolute - 0.5 * delta)
    losses.append(loss)
print(f"delta={delta:.1f}")
print("losses=[" + ", ".join(f"{loss:.3f}" for loss in losses) + "]")
print(f"mean={sum(losses) / len(losses):.4f}")`,
    },
    explanation: [
      { title: "So với delta", text: "Mỗi mẫu chọn nhánh bằng trị tuyệt đối residual; dấu không làm loss âm." },
      { title: "Vùng bình phương", text: "Residual nhỏ dùng 0,5r² nên loss trơn quanh 0." },
      { title: "Vùng tuyến tính", text: "Residual lớn có gradient bị chặn ở ±delta thay vì tăng vô hạn như MSE." },
      { title: "Giữ ngữ cảnh", text: "Delta điều khiển ảnh hưởng chứ không kết luận chuyến kẹt xe là dữ liệu rác." },
    ],
    experiment: {
      question: "Delta tăng làm loss của residual 3,0 tiến gần MAE hay MSE hơn?",
      parameterLabels: { delta: "Ngưỡng Huber delta" }, defaultVariantId: "standard",
      variants: [
        { id: "robust", label: "Delta 0,5", parameters: { delta: 0.5 }, expectedOutput: "delta=0.5\nlosses=[0.020, 0.080, 1.375]\nmean=0.4917", observation: "Outlier bị phạt thấp nhất; hai residual nhỏ vẫn ở vùng bình phương.", illustration: bars("Huber delta 0,5", "Outlier được khống chế bởi nhánh tuyến tính.", [{ label: "r=0,2", value: 0.02 }, { label: "r=-0,4", value: 0.08 }, { label: "r=3", value: 1.375, tone: "warn" }], { min: 0, max: 4.1 }) },
        { id: "standard", label: "Delta 1,0", parameters: { delta: 1 }, expectedOutput: "delta=1.0\nlosses=[0.020, 0.080, 2.500]\nmean=0.8667", observation: "Hai residual nhỏ không đổi; outlier chịu gradient tối đa 1.", illustration: bars("Huber delta 1,0", "Delta chỉ ảnh hưởng mẫu vượt vùng bình phương.", [{ label: "r=0,2", value: 0.02 }, { label: "r=-0,4", value: 0.08 }, { label: "r=3", value: 2.5, tone: "warn" }], { min: 0, max: 4.1 }) },
        { id: "quadratic", label: "Delta 2,0", parameters: { delta: 2 }, expectedOutput: "delta=2.0\nlosses=[0.020, 0.080, 4.000]\nmean=1.3667", observation: "Loss outlier 4,0 tiến gần MSE 4,5 hơn.", illustration: bars("Huber delta 2,0", "Tăng delta làm mô hình nhạy hơn với residual lớn.", [{ label: "r=0,2", value: 0.02 }, { label: "r=-0,4", value: 0.08 }, { label: "r=3", value: 4, tone: "warn" }], { min: 0, max: 4.1 }) },
      ],
    },
    transferQuestion: "Nếu target chuyển từ giờ sang phút, bạn phải đổi delta thế nào để giữ cùng ý nghĩa?",
  },

  "dl-mlp": {
    lessonId: "dl-mlp",
    scenario: {
      title: "Ước lượng nguy cơ quá tải phòng máy",
      context: "Một MLP toy nhận tải CPU chuẩn hóa và cờ giờ cao điểm bằng 1. Hai nút ReLU phản ứng khác nhau trước khi tầng sigmoid tạo xác suất quá tải.",
      goal: "Theo dõi input qua affine, ReLU, affine và sigmoid khi mức tải thay đổi.",
    },
    inputs: [{ label: "Tham số mạng", format: "python", value: "W_hidden=[[1,-0.5],[-1,1]]; W_out=[0.8,-0.4]; b_out=0.1" }],
    python: {
      title: "Forward pass MLP nhỏ",
      filename: "tiny_mlp_load.py",
      codeTemplate: `import math
load = {{load}}
x = [load, 1.0]
hidden_weights = [[1.0, -0.5], [-1.0, 1.0]]
hidden = [max(0.0, sum(value * weight for value, weight in zip(x, row))) for row in hidden_weights]
logit = 0.8 * hidden[0] - 0.4 * hidden[1] + 0.1
probability = 1 / (1 + math.exp(-logit))
print(f"load={load:.1f}")
print("hidden=[" + ", ".join(f"{value:.2f}" for value in hidden) + "]")
print(f"logit={logit:.2f} probability={probability:.4f}")`,
    },
    explanation: [
      { title: "Tạo input", text: "Feature thứ hai bằng 1 đóng vai trò cờ cao điểm; load là tham số duy nhất thay đổi." },
      { title: "Hai phép chiếu", text: "Nút đầu tăng khi load vượt 0,5; nút thứ hai giảm khi load tăng về 1." },
      { title: "ReLU tạo miền", text: "Pre-activation âm bị cắt, làm mạng ghép các miền tuyến tính khác nhau." },
      { title: "Sigmoid", text: "Tầng output trộn hai activation thành logit rồi nén về khoảng (0,1)." },
    ],
    experiment: {
      question: "Tại mức tải nào hai nút ẩn cùng hoạt động?",
      parameterLabels: { load: "Tải CPU chuẩn hóa" }, defaultVariantId: "medium",
      variants: [
        { id: "low", label: "Tải 0,2", parameters: { load: 0.2 }, expectedOutput: "load=0.2\nhidden=[0.00, 0.80]\nlogit=-0.22 probability=0.4452", observation: "Nút đầu tắt, nút thứ hai kéo logit xuống.", illustration: matrix("Forward tải 0,2", "Số là activation từng tầng.", ["Giá trị"], ["load", "h1", "h2", "prob"], [[0.2, 0, 0.8, 0.4452]], [["0,20", "0,00", "0,80", "0,4452"]]) },
        { id: "medium", label: "Tải 0,8", parameters: { load: 0.8 }, expectedOutput: "load=0.8\nhidden=[0.30, 0.20]\nlogit=0.26 probability=0.5646", observation: "Cả hai nút hoạt động; đóng góp dương từ h1 chiếm ưu thế.", illustration: matrix("Forward tải 0,8", "Hai đường ẩn cùng truyền tín hiệu.", ["Giá trị"], ["load", "h1", "h2", "prob"], [[0.8, 0.3, 0.2, 0.5646]], [["0,80", "0,30", "0,20", "0,5646"]]) },
        { id: "high", label: "Tải 1,4", parameters: { load: 1.4 }, expectedOutput: "load=1.4\nhidden=[0.90, 0.00]\nlogit=0.82 probability=0.6942", observation: "Nút thứ hai tắt, nút đầu đưa xác suất lên gần 0,7.", illustration: matrix("Forward tải 1,4", "ReLU chọn miền tuyến tính khác.", ["Giá trị"], ["load", "h1", "h2", "prob"], [[1.4, 0.9, 0, 0.6942]], [["1,40", "0,90", "0,00", "0,6942"]]) },
      ],
    },
    transferQuestion: "Nếu chuẩn hóa sai khiến load triển khai quanh 14 thay vì 1,4, activation và calibration sẽ đổi thế nào?",
  },
  "dl-embeddings": {
    lessonId: "dl-embeddings",
    scenario: { title: "Tìm từ gần nghĩa trong ô tìm kiếm", context: "Một cửa hàng có embedding hai chiều cho mèo, chó, xe và bus. Hệ thống dùng cosine để tìm mục gần nhất mà không bị độ dài vector chi phối.", goal: "Chuẩn hóa bằng norm, tính cosine và trả hàng xóm gần nhất." },
    inputs: [{ label: "Embedding toy", format: "json", value: "{\"mèo\":[1,0.2],\"chó\":[0.9,0.3],\"xe\":[-0.2,1],\"bus\":[-0.1,0.9]}" }],
    python: {
      title: "Cosine nearest neighbor từ đầu", filename: "embedding_search.py",
      codeTemplate: `import math
query_index = {{query_index}}
names = ["mèo", "chó", "xe", "bus"]
vectors = [[1.0, 0.2], [0.9, 0.3], [-0.2, 1.0], [-0.1, 0.9]]
query = vectors[query_index]
def cosine(a, b):
    return sum(x*y for x,y in zip(a,b)) / (math.sqrt(sum(x*x for x in a)) * math.sqrt(sum(y*y for y in b)))
candidates = [(cosine(query, vector), name) for i, (name, vector) in enumerate(zip(names, vectors)) if i != query_index]
score, neighbor = max(candidates)
print(f"query={names[query_index]}")
print(f"nearest={neighbor} cosine={score:.4f}")`,
    },
    explanation: [
      { title: "Chọn query", text: "Index chỉ chọn một hàng embedding; trị số ID không mang nghĩa khoảng cách." },
      { title: "Dot product", text: "Dot đo mức cùng hướng nhưng còn phụ thuộc độ dài vector." },
      { title: "Chia norm", text: "Cosine chuẩn hóa độ dài và nằm trong [-1,1] khi norm khác 0." },
      { title: "Loại chính nó", text: "Query không nằm trong candidates, nếu không cosine 1 với chính nó luôn thắng." },
    ],
    experiment: {
      question: "Các từ tạo thành hai cụm động vật và phương tiện không?", parameterLabels: { query_index: "Từ truy vấn" }, defaultVariantId: "dog",
      variants: [
        { id: "cat", label: "mèo", parameters: { query_index: 0 }, expectedOutput: "query=mèo\nnearest=chó cosine=0.9923", observation: "Mèo gần chó gần như cùng hướng.", illustration: { kind: "tokens", title: "Hàng xóm của mèo", caption: "Trọng số là cosine.", items: [{ label: "mèo", weight: 1, tone: "accent" }, { label: "chó", weight: 0.9923, tone: "good" }, { label: "xe", weight: 0 }, { label: "bus", weight: 0.0866 }] } },
        { id: "dog", label: "chó", parameters: { query_index: 1 }, expectedOutput: "query=chó\nnearest=mèo cosine=0.9923", observation: "Cosine đối xứng nên chó cũng chọn mèo.", illustration: { kind: "tokens", title: "Hàng xóm của chó", caption: "Mèo có cosine lớn nhất.", items: [{ label: "mèo", weight: 0.9923, tone: "good" }, { label: "chó", weight: 1, tone: "accent" }, { label: "xe", weight: 0.124 }, { label: "bus", weight: 0.2097 }] } },
        { id: "vehicle", label: "xe", parameters: { query_index: 2 }, expectedOutput: "query=xe\nnearest=bus cosine=0.9962", observation: "Xe gần bus, tạo cụm phương tiện.", illustration: { kind: "tokens", title: "Hàng xóm của xe", caption: "Bus gần như cùng hướng.", items: [{ label: "mèo", weight: 0 }, { label: "chó", weight: 0.124 }, { label: "xe", weight: 1, tone: "accent" }, { label: "bus", weight: 0.9962, tone: "good" }] } },
      ],
    },
    transferQuestion: "Vì sao không được chèn từ mới giữa ID map cũ nếu model đã lưu embedding theo hàng?",
  },

  "dl-pooling": {
    lessonId: "dl-pooling",
    scenario: { title: "Rút gọn đỉnh rung động cơ", context: "Cảm biến ghi sáu biên độ [1,3,2,5,4,0]. Max pooling giữ đỉnh trong mỗi cửa sổ không chồng để giảm chiều trước bộ phân loại lỗi.", goal: "Thay kernel và quan sát output cùng phần đuôi bị bỏ." },
    inputs: [{ label: "Tín hiệu", format: "python", value: "signal=[1,3,2,5,4,0]; stride=kernel" }],
    python: {
      title: "Max pooling một chiều", filename: "max_pool_signal.py",
      codeTemplate: `kernel = {{kernel}}
signal = [1, 3, 2, 5, 4, 0]
windows = [signal[start:start + kernel] for start in range(0, len(signal) - kernel + 1, kernel)]
pooled = [max(window) for window in windows]
used = len(windows) * kernel
print(f"kernel={kernel} windows={windows}")
print(f"pooled={pooled}")
print(f"used={used} dropped={len(signal) - used}")`,
    },
    explanation: [
      { title: "Stride bằng kernel", text: "Các cửa sổ không chồng nên mỗi phần tử được dùng tối đa một lần." },
      { title: "Cửa sổ đủ", text: "Giới hạn len-kernel+1 loại cửa sổ thiếu ở cuối thay vì tự padding." },
      { title: "Lấy cực đại", text: "Mỗi output giữ đỉnh nhưng mất các giá trị khác trong cửa sổ." },
      { title: "Audit phần đuôi", text: "Biến dropped làm rõ dữ liệu không được phủ khi chiều dài không chia hết." },
    ],
    experiment: {
      question: "Kernel nào bỏ hai mẫu cuối?", parameterLabels: { kernel: "Kích thước cửa sổ" }, defaultVariantId: "three",
      variants: [
        { id: "two", label: "Kernel 2", parameters: { kernel: 2 }, expectedOutput: "kernel=2 windows=[[1, 3], [2, 5], [4, 0]]\npooled=[3, 5, 4]\nused=6 dropped=0", observation: "Ba cửa sổ phủ đủ tín hiệu.", illustration: sequence("Pooling kernel 2", "Mỗi thẻ là cửa sổ và cực đại.", [{ label: "[1,3]", value: "max 3" }, { label: "[2,5]", value: "max 5", tone: "accent" }, { label: "[4,0]", value: "max 4" }], "cards") },
        { id: "three", label: "Kernel 3", parameters: { kernel: 3 }, expectedOutput: "kernel=3 windows=[[1, 3, 2], [5, 4, 0]]\npooled=[3, 5]\nused=6 dropped=0", observation: "Hai cửa sổ phủ đủ nhưng output chỉ còn hai số.", illustration: sequence("Pooling kernel 3", "Mức nén từ 6 xuống 2.", [{ label: "[1,3,2]", value: "max 3" }, { label: "[5,4,0]", value: "max 5", tone: "accent" }], "cards") },
        { id: "four", label: "Kernel 4", parameters: { kernel: 4 }, expectedOutput: "kernel=4 windows=[[1, 3, 2, 5]]\npooled=[5]\nused=4 dropped=2", observation: "Hai mẫu [4,0] không thuộc cửa sổ đủ nào.", illustration: sequence("Pooling kernel 4", "Phần đuôi cần quy tắc rõ.", [{ label: "[1,3,2,5]", value: "max 5", tone: "accent" }, { label: "[4,0]", value: "bị bỏ", tone: "warn" }], "cards") },
      ],
    },
    transferQuestion: "Nếu đỉnh lỗi nằm ở phần đuôi, bạn sẽ chọn padding, ceil mode hay cửa sổ chồng?",
  },
  "dl-attention": {
    lessonId: "dl-attention",
    scenario: { title: "Tổng hợp ba ghi chú hỗ trợ khách hàng", context: "Một query có score [2,1,0] với ba ghi chú mang value [10,20,40]. Temperature điều khiển attention tập trung vào ghi chú score cao hay phân bổ đều.", goal: "Tính softmax ổn định và weighted sum ở ba temperature." },
    inputs: [{ label: "Score và value", format: "python", value: "scores=[2.0,1.0,0.0]; values=[10.0,20.0,40.0]" }],
    python: {
      title: "Attention một query", filename: "temperature_attention.py",
      codeTemplate: `import math
temperature = {{temperature}}
scores = [2.0, 1.0, 0.0]
values = [10.0, 20.0, 40.0]
scaled = [score / temperature for score in scores]
maximum = max(scaled)
exponentials = [math.exp(score - maximum) for score in scaled]
weights = [value / sum(exponentials) for value in exponentials]
output = sum(weight * value for weight, value in zip(weights, values))
print(f"temperature={temperature:.1f}")
print("weights=[" + ", ".join(f"{weight:.4f}" for weight in weights) + "]")
print(f"output={output:.4f}")`,
    },
    explanation: [
      { title: "Chia temperature", text: "Temperature dưới 1 kéo giãn chênh lệch score; trên 1 nén chúng lại." },
      { title: "Trừ max", text: "Softmax ổn định trừ score lớn nhất trước exp mà không đổi tỷ lệ." },
      { title: "Chuẩn hóa", text: "Ba weight không âm và tổng bằng 1 nên output là tổ hợp lồi." },
      { title: "Tổng hợp value", text: "Weight chọn mức đóng góp; thay value đổi output dù weight giữ nguyên." },
    ],
    experiment: {
      question: "Temperature tăng kéo output về phía value nào?", parameterLabels: { temperature: "Temperature" }, defaultVariantId: "base",
      variants: [
        { id: "sharp", label: "0,5 · sắc", parameters: { temperature: 0.5 }, expectedOutput: "temperature=0.5\nweights=[0.8668, 0.1173, 0.0159]\noutput=11.6494", observation: "86,68% trọng số dồn vào value 10.", illustration: { kind: "tokens", title: "Attention sắc", caption: "Token đầu chiếm ưu thế.", items: [{ label: "A · 10", weight: 0.8668, tone: "accent" }, { label: "B · 20", weight: 0.1173 }, { label: "C · 40", weight: 0.0159 }] } },
        { id: "base", label: "1,0 · chuẩn", parameters: { temperature: 1 }, expectedOutput: "temperature=1.0\nweights=[0.6652, 0.2447, 0.0900]\noutput=15.1482", observation: "Token thứ ba đóng góp rõ hơn, kéo output lên.", illustration: { kind: "tokens", title: "Attention chuẩn", caption: "Phân phối vẫn ưu tiên score 2.", items: [{ label: "A · 10", weight: 0.6652, tone: "accent" }, { label: "B · 20", weight: 0.2447 }, { label: "C · 40", weight: 0.09 }] } },
        { id: "soft", label: "2,0 · mềm", parameters: { temperature: 2 }, expectedOutput: "temperature=2.0\nweights=[0.5065, 0.3072, 0.1863]\noutput=18.6617", observation: "Phân phối đều hơn; value 40 kéo output tăng.", illustration: { kind: "tokens", title: "Attention mềm", caption: "Các token ít chênh lệch hơn.", items: [{ label: "A · 10", weight: 0.5065, tone: "accent" }, { label: "B · 20", weight: 0.3072 }, { label: "C · 40", weight: 0.1863 }] } },
      ],
    },
    transferQuestion: "Nếu một key bị padding mask, bạn phải áp mask trước hay sau softmax để weight đúng bằng 0?",
  },

  "dl-transformer": {
    lessonId: "dl-transformer",
    scenario: { title: "Giới hạn ngữ cảnh khi dự đoán token", context: "Decoder xử lý bốn token [A,B,C,D]. Causal mask cấm nhìn tương lai, còn context window chỉ cho mỗi vị trí nhìn lại một số token gần nhất.", goal: "Dựng ma trận mask và đếm số key nhìn thấy ở ba cửa sổ." },
    inputs: [{ label: "Chuỗi token", format: "text", value: "0:A, 1:B, 2:C, 3:D; causal attention" }],
    python: {
      title: "Causal sliding-window mask", filename: "causal_window.py",
      codeTemplate: `context = {{context}}
tokens = ["A", "B", "C", "D"]
mask = [[int(key <= query and query - key < context) for key in range(len(tokens))] for query in range(len(tokens))]
visible = [sum(row) for row in mask]
print(f"context={context}")
print(f"visible={visible} total={sum(visible)}")
for row in mask:
    print("".join(str(value) for value in row))`,
    },
    explanation: [
      { title: "Causal condition", text: "key<=query loại tương lai; đường chéo vẫn được phép." },
      { title: "Giới hạn khoảng cách", text: "query-key<context giữ token gần nhất trong cửa sổ." },
      { title: "Đếm kết nối", text: "Tổng liên kết xấp xỉ O(L×context) khi context nhỏ hơn L." },
      { title: "Không đổi tham số", text: "Mask đổi đường truyền thông tin và chi phí, không đổi weights model." },
    ],
    experiment: {
      question: "Context bao nhiêu khôi phục full causal attention?", parameterLabels: { context: "Chiều cửa sổ" }, defaultVariantId: "local",
      variants: [
        { id: "self", label: "Context 1", parameters: { context: 1 }, expectedOutput: "context=1\nvisible=[1, 1, 1, 1] total=4\n1000\n0100\n0010\n0001", observation: "Mỗi token chỉ nhìn chính nó.", illustration: matrix("Mask context 1", "1 là liên kết được phép.", ["Q:A","Q:B","Q:C","Q:D"], ["K:A","K:B","K:C","K:D"], [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]) },
        { id: "local", label: "Context 2", parameters: { context: 2 }, expectedOutput: "context=2\nvisible=[1, 2, 2, 2] total=7\n1000\n1100\n0110\n0011", observation: "Mỗi vị trí nhìn chính nó và một token trước.", illustration: matrix("Mask context 2", "D chỉ truy cập C và D.", ["Q:A","Q:B","Q:C","Q:D"], ["K:A","K:B","K:C","K:D"], [[1,0,0,0],[1,1,0,0],[0,1,1,0],[0,0,1,1]]) },
        { id: "full", label: "Context 4", parameters: { context: 4 }, expectedOutput: "context=4\nvisible=[1, 2, 3, 4] total=10\n1000\n1100\n1110\n1111", observation: "Context bằng chiều dài khôi phục tam giác causal đầy đủ.", illustration: matrix("Full causal mask", "Mỗi query nhìn toàn bộ prefix.", ["Q:A","Q:B","Q:C","Q:D"], ["K:A","K:B","K:C","K:D"], [[1,0,0,0],[1,1,0,0],[1,1,1,0],[1,1,1,1]]) },
      ],
    },
    transferQuestion: "Với 8.000 token, thông tin đầu tài liệu có thể tới token cuối qua nhiều tầng local attention bằng cách nào?",
  },
  "dl-autoencoder": {
    lessonId: "dl-autoencoder",
    scenario: { title: "Nén độ ẩm cảm biến vào bottleneck ít bit", context: "Năm giá trị độ ẩm đã chuẩn hóa nằm trong [0,1]. Autoencoder toy được mô phỏng bằng lượng tử hóa bottleneck: càng ít bit thì reconstruction chỉ chọn được ít mức.", goal: "Đo reconstruction và MSE khi bottleneck có 1, 2 hoặc 3 bit." },
    inputs: [{ label: "Tín hiệu chuẩn hóa", format: "python", value: "values=[0.0,0.25,0.5,0.75,1.0]" }],
    python: {
      title: "Bottleneck lượng tử hóa", filename: "quantized_autoencoder.py",
      codeTemplate: `bits = {{bits}}
values = [0.0, 0.25, 0.5, 0.75, 1.0]
steps = 2 ** bits - 1
reconstruction = [round(value * steps) / steps for value in values]
mse = sum((a - b) ** 2 for a, b in zip(values, reconstruction)) / len(values)
print(f"bits={bits} levels={steps + 1}")
print("reconstruction=[" + ", ".join(f"{value:.4f}" for value in reconstruction) + "]")
print(f"mse={mse:.4f}")`,
    },
    explanation: [
      { title: "Tạo số mức", text: "B bit biểu diễn 2^b mức; steps là số khoảng giữa 0 và 1." },
      { title: "Encode", text: "Nhân steps và làm tròn chọn mã bottleneck gần nhất." },
      { title: "Decode", text: "Chia lại cho steps đưa mã về thang [0,1]." },
      { title: "Đo mất mát", text: "MSE reconstruction giảm khi nhiều mức hơn, đổi lại bottleneck chứa nhiều bit." },
    ],
    experiment: {
      question: "Thêm mỗi bit làm số mức và MSE thay đổi ra sao?", parameterLabels: { bits: "Số bit bottleneck" }, defaultVariantId: "two",
      variants: [
        { id: "one", label: "1 bit", parameters: { bits: 1 }, expectedOutput: "bits=1 levels=2\nreconstruction=[0.0000, 0.0000, 0.0000, 1.0000, 1.0000]\nmse=0.0750", observation: "Chỉ có hai mức 0 và 1 nên ba giá trị giữa bị méo mạnh.", illustration: plot("Reconstruction 1 bit", "Hai mức làm đường bậc thang thô.", "Mẫu", "Giá trị", [{ label: "gốc", points: [0,.25,.5,.75,1].map((y,i)=>({x:i,y})) }, { label: "tái tạo", tone: "warn", points: [0,0,0,1,1].map((y,i)=>({x:i,y})) }]) },
        { id: "two", label: "2 bit", parameters: { bits: 2 }, expectedOutput: "bits=2 levels=4\nreconstruction=[0.0000, 0.3333, 0.6667, 0.6667, 1.0000]\nmse=0.0083", observation: "Bốn mức giảm MSE gần chín lần so với 1 bit.", illustration: plot("Reconstruction 2 bit", "Các điểm giữa gần tín hiệu gốc hơn.", "Mẫu", "Giá trị", [{ label: "gốc", points: [0,.25,.5,.75,1].map((y,i)=>({x:i,y})) }, { label: "tái tạo", tone: "accent", points: [0,.3333,.6667,.6667,1].map((y,i)=>({x:i,y})) }]) },
        { id: "three", label: "3 bit", parameters: { bits: 3 }, expectedOutput: "bits=3 levels=8\nreconstruction=[0.0000, 0.2857, 0.5714, 0.7143, 1.0000]\nmse=0.0015", observation: "Tám mức cho reconstruction sát hơn nhưng bottleneck gấp ba bit so với cấu hình đầu.", illustration: plot("Reconstruction 3 bit", "Sai khác khó thấy hơn trên thang [0,1].", "Mẫu", "Giá trị", [{ label: "gốc", points: [0,.25,.5,.75,1].map((y,i)=>({x:i,y})) }, { label: "tái tạo", tone: "good", points: [0,.2857,.5714,.7143,1].map((y,i)=>({x:i,y})) }]) },
      ],
    },
    transferQuestion: "Một autoencoder reconstruction tốt có chắc phát hiện anomaly tốt không, và bạn sẽ kiểm chứng threshold bằng dữ liệu nào?",
  },

  "dl-sgd-minibatch": {
    lessonId: "dl-sgd-minibatch",
    scenario: { title: "Cập nhật giá giao hàng từ bốn gradient", context: "Bốn đơn hàng tạo gradient [2,-1,3,0] cho cùng tham số theta. Batch size quyết định cập nhật sau từng mẫu hay sau khi trung bình nhiều mẫu.", goal: "So lịch sử theta và số lần cập nhật với batch size 1, 2 và 4." },
    inputs: [{ label: "Gradient từng mẫu", format: "python", value: "gradients=[2.0,-1.0,3.0,0.0]; theta=1.0; lr=0.1" }],
    python: {
      title: "Mini-batch SGD một epoch", filename: "minibatch_updates.py",
      codeTemplate: `batch_size = {{batch_size}}
gradients = [2.0, -1.0, 3.0, 0.0]
theta = 1.0
means, history = [], []
for start in range(0, len(gradients), batch_size):
    batch = gradients[start:start + batch_size]
    mean_gradient = sum(batch) / len(batch)
    theta -= 0.1 * mean_gradient
    means.append(mean_gradient)
    history.append(theta)
print(f"batch_size={batch_size} updates={len(history)}")
print("means=[" + ", ".join(f"{value:.2f}" for value in means) + "]")
print("theta_history=[" + ", ".join(f"{value:.2f}" for value in history) + "]")`,
    },
    explanation: [
      { title: "Cắt batch", text: "Range bước theo batch_size tạo các nhóm theo đúng thứ tự mẫu hiện tại." },
      { title: "Trung bình gradient", text: "Mean giữ scale cập nhật tương đối ổn định khi đổi batch size." },
      { title: "Cập nhật tuần tự", text: "Batch size nhỏ dùng theta mới sớm hơn nên cùng tổng gradient vẫn có quỹ đạo khác." },
      { title: "Đếm optimizer step", text: "Một epoch có ceil(n/batch_size) bước; scheduler theo step phải biết con số này." },
    ],
    experiment: {
      question: "Vì sao ba cấu hình có thể kết thúc ở theta khác nhau hoặc giống nhau tùy loss?", parameterLabels: { batch_size: "Batch size" }, defaultVariantId: "mini",
      variants: [
        { id: "online", label: "Batch 1", parameters: { batch_size: 1 }, expectedOutput: "batch_size=1 updates=4\nmeans=[2.00, -1.00, 3.00, 0.00]\ntheta_history=[0.80, 0.90, 0.60, 0.60]", observation: "Bốn bước cho quỹ đạo nhiễu nhất và theta cuối 0,60 trong ví dụ gradient cố định.", illustration: sequence("SGD từng mẫu", "Một gradient tạo một optimizer step.", [{label:"g=2",value:"θ 0,80"},{label:"g=-1",value:"θ 0,90"},{label:"g=3",value:"θ 0,60",tone:"warn"},{label:"g=0",value:"θ 0,60"}]) },
        { id: "mini", label: "Batch 2", parameters: { batch_size: 2 }, expectedOutput: "batch_size=2 updates=2\nmeans=[0.50, 1.50]\ntheta_history=[0.95, 0.80]", observation: "Hai gradient đối dấu đầu được trung bình thành 0,50, làm bước đầu nhỏ.", illustration: sequence("Mini-batch hai mẫu", "Hai optimizer step trong epoch.", [{label:"mean(2,-1)",value:"0,50 → θ 0,95"},{label:"mean(3,0)",value:"1,50 → θ 0,80",tone:"accent"}]) },
        { id: "full", label: "Batch 4", parameters: { batch_size: 4 }, expectedOutput: "batch_size=4 updates=1\nmeans=[1.00]\ntheta_history=[0.90]", observation: "Một bước dùng gradient trung bình 1,00 và che dao động giữa các mẫu.", illustration: sequence("Full batch", "Toàn bộ epoch được gộp thành một bước.", [{label:"mean tất cả",value:"1,00"},{label:"cập nhật",value:"θ 1,00 → 0,90",tone:"good"}]) },
      ],
    },
    transferQuestion: "Khi gradient phụ thuộc theta hiện tại thay vì được cố định như toy này, thứ tự mini-batch có thể đổi kết quả epoch ra sao?",
  },

  "dl-adam-adamw": {
    lessonId: "dl-adam-adamw",
    scenario: { title: "Một bước AdamW cho trọng số bộ dự báo", context: "Một trọng số bắt đầu ở 2,0 với gradient 0,5. Ở bước đầu, Adam chuẩn hóa gradient gần thành 1; AdamW còn co trọng số trực tiếp theo weight decay.", goal: "Tách adaptive update khỏi decoupled weight decay ở ba hệ số." },
    inputs: [{ label: "Trạng thái bước đầu", format: "text", value: "w=2.0, g=0.5, lr=0.1, beta1=0.9, beta2=0.999" }],
    python: {
      title: "Bước AdamW đầu tiên", filename: "adamw_first_step.py",
      codeTemplate: `weight_decay = {{weight_decay}}
weight, gradient = 2.0, 0.5
beta1, beta2, learning_rate, epsilon = 0.9, 0.999, 0.1, 1e-8
m = (1 - beta1) * gradient
v = (1 - beta2) * gradient ** 2
m_hat = m / (1 - beta1)
v_hat = v / (1 - beta2)
adaptive_step = learning_rate * m_hat / (v_hat ** 0.5 + epsilon)
decay_step = learning_rate * weight_decay * weight
new_weight = weight - adaptive_step - decay_step
print(f"weight_decay={weight_decay:.2f}")
print(f"adaptive_step={adaptive_step:.4f} decay_step={decay_step:.4f}")
print(f"new_weight={new_weight:.4f}")`,
    },
    explanation: [
      { title: "Moment bậc một", text: "m giữ trung bình mũ gradient; ở bước đầu nó bằng 0,05." },
      { title: "Moment bậc hai", text: "v giữ trung bình mũ bình phương gradient và luôn không âm." },
      { title: "Bias correction", text: "Chia 1-beta^t khôi phục m_hat 0,5 và v_hat 0,25 ở t=1." },
      { title: "Decay tách rời", text: "AdamW trừ lr×weight_decay×weight ngoài adaptive gradient step." },
    ],
    experiment: {
      question: "Weight decay tác động bao nhiêu so với adaptive step 0,1?", parameterLabels: { weight_decay: "Weight decay" }, defaultVariantId: "small",
      variants: [
        { id: "none", label: "0,00", parameters: { weight_decay: 0 }, expectedOutput: "weight_decay=0.00\nadaptive_step=0.1000 decay_step=0.0000\nnew_weight=1.9000", observation: "Không decay, trọng số chỉ giảm bởi adaptive step.", illustration: bars("Adam không decay", "Hai thành phần của cập nhật.", [{label:"Adaptive",value:.1,tone:"accent"},{label:"Decay",value:0}], {min:0,max:.1}) },
        { id: "small", label: "0,01", parameters: { weight_decay: 0.01 }, expectedOutput: "weight_decay=0.01\nadaptive_step=0.1000 decay_step=0.0020\nnew_weight=1.8980", observation: "Decay nhỏ bằng 2% adaptive step ở bước này.", illustration: bars("AdamW decay 0,01", "Decay tách rời có độ lớn 0,002.", [{label:"Adaptive",value:.1,tone:"accent"},{label:"Decay",value:.002}], {min:0,max:.1}) },
        { id: "large", label: "0,10", parameters: { weight_decay: 0.1 }, expectedOutput: "weight_decay=0.10\nadaptive_step=0.1000 decay_step=0.0200\nnew_weight=1.8800", observation: "Decay bằng 20% adaptive step và làm trọng số co nhanh hơn.", illustration: bars("AdamW decay 0,10", "Hai thành phần cộng lại thành 0,12.", [{label:"Adaptive",value:.1,tone:"accent"},{label:"Decay",value:.02,tone:"warn"}], {min:0,max:.1}) },
      ],
    },
    transferQuestion: "Vì sao thường không áp weight decay cho bias và tham số scale của normalization?",
  },

  "dl-learning-rate-convergence": {
    lessonId: "dl-learning-rate-convergence",
    scenario: { title: "Chẩn đoán hội tụ từ learning curve", context: "Tối ưu loss J(theta)=(theta-2)^2 từ theta=0 trong năm bước. Ba learning rate cho hành vi chậm, chạm cực tiểu ngay và phân kỳ.", goal: "Đọc quỹ đạo theta thay vì chỉ thử ngẫu nhiên learning rate." },
    inputs: [{ label: "Hàm loss", format: "text", value: "J(theta)=(theta-2)^2; theta0=0; 5 bước" }],
    python: {
      title: "So quỹ đạo hội tụ", filename: "learning_rate_curve.py",
      codeTemplate: `learning_rate = {{learning_rate}}
theta = 0.0
history = []
for _ in range(5):
    theta -= learning_rate * 2 * (theta - 2)
    history.append(round(theta, 4))
loss = (theta - 2) ** 2
print(f"lr={learning_rate:.1f}")
print(f"theta={history}")
print(f"loss={loss:.4f}")`,
    },
    explanation: [
      { title: "Độ cong cố định", text: "Gradient là 2(theta-2), nên có thể phân tích chính xác hệ số co sau mỗi bước." },
      { title: "Learning rate nhỏ", text: "Hệ số co gần 1 làm tiến chậm dù loss giảm đơn điệu." },
      { title: "Learning rate vừa", text: "Với lr 0,5, một bước đưa theta đúng về 2 cho hàm toy này." },
      { title: "Learning rate quá lớn", text: "Trị tuyệt đối hệ số co vượt 1 làm dao động có biên độ tăng và loss nổ." },
    ],
    experiment: {
      question: "Dấu hiệu nào trong theta history báo phân kỳ?", parameterLabels: { learning_rate: "Learning rate" }, defaultVariantId: "critical",
      variants: [
        { id: "slow", label: "0,1", parameters: { learning_rate: 0.1 }, expectedOutput: "lr=0.1\ntheta=[0.4, 0.72, 0.976, 1.1808, 1.3446]\nloss=0.4295", observation: "Theta tăng đơn điệu nhưng còn cách 2 khá xa.", illustration: plot("Hội tụ chậm", "Năm bước chưa chạm cực tiểu.", "Bước", "theta", [{label:"theta",points:[0,.4,.72,.976,1.1808,1.3446].map((y,i)=>({x:i,y}))}]) },
        { id: "critical", label: "0,5", parameters: { learning_rate: 0.5 }, expectedOutput: "lr=0.5\ntheta=[2.0, 2.0, 2.0, 2.0, 2.0]\nloss=0.0000", observation: "Bước đầu chạm đúng cực tiểu và gradient sau đó bằng 0.", illustration: plot("Chạm cực tiểu", "Theta giữ nguyên ở 2.", "Bước", "theta", [{label:"theta",tone:"good",points:[0,2,2,2,2,2].map((y,i)=>({x:i,y}))}]) },
        { id: "diverge", label: "1,1", parameters: { learning_rate: 1.1 }, expectedOutput: "lr=1.1\ntheta=[4.4, -0.88, 5.456, -2.1472, 6.9766]\nloss=24.7669", observation: "Theta đổi dấu quanh 2 với biên độ tăng; loss cuối lớn hơn ban đầu.", illustration: plot("Dao động phân kỳ", "Biên độ xa mức 2 tăng qua mỗi bước.", "Bước", "theta", [{label:"theta",tone:"warn",points:[0,4.4,-.88,5.456,-2.1472,6.9766].map((y,i)=>({x:i,y}))}]) },
      ],
    },
    transferQuestion: "Với mini-batch nhiễu, bạn sẽ kết hợp learning-rate schedule, gradient norm và validation loss để phân biệt dao động lành mạnh với phân kỳ thế nào?",
  },
  "dl-regularization": {
    lessonId: "dl-regularization",
    scenario: { title: "Co trọng số mô hình dự báo nhu cầu", context: "Ba trọng số [2,-1,0,5] nhận data gradient [0,4;-0,2;0,1]. L2 thêm gradient tỷ lệ với chính trọng số để hạn chế hệ số quá lớn.", goal: "Tách data gradient và penalty gradient rồi đo norm sau một bước." },
    inputs: [{ label: "Trọng số và gradient", format: "python", value: "weights=[2.0,-1.0,0.5]; data_gradient=[0.4,-0.2,0.1]; lr=0.1" }],
    python: {
      title: "Một bước gradient với L2", filename: "l2_update.py",
      codeTemplate: `import math
l2 = {{l2}}
weights = [2.0, -1.0, 0.5]
data_gradient = [0.4, -0.2, 0.1]
total_gradient = [gradient + 2 * l2 * weight for weight, gradient in zip(weights, data_gradient)]
updated = [weight - 0.1 * gradient for weight, gradient in zip(weights, total_gradient)]
norm = math.sqrt(sum(weight ** 2 for weight in updated))
print(f"l2={l2:.1f}")
print("updated=[" + ", ".join(f"{value:.2f}" for value in updated) + "]")
print(f"weight_norm={norm:.4f}")`,
    },
    explanation: [
      { title: "Data gradient", text: "Gradient dữ liệu chỉ phản ánh batch hiện tại và được giữ cố định trong toy example." },
      { title: "Penalty gradient", text: "Đạo hàm lambda||w||² là 2lambda w, nên trọng số lớn bị co mạnh hơn." },
      { title: "Cộng trước cập nhật", text: "Total gradient kết hợp hai mục tiêu rồi dùng cùng learning rate." },
      { title: "Theo dõi norm", text: "Norm giảm khi lambda tăng, nhưng validation error mới quyết định mức regularization hữu ích." },
    ],
    experiment: {
      question: "Lambda tăng làm từng trọng số và toàn bộ norm co ra sao?", parameterLabels: { l2: "Hệ số L2" }, defaultVariantId: "mild",
      variants: [
        { id: "none", label: "L2 0", parameters: { l2: 0 }, expectedOutput: "l2=0.0\nupdated=[1.96, -0.98, 0.49]\nweight_norm=2.2455", observation: "Chỉ data gradient tác động; norm vẫn gần ban đầu.", illustration: bars("Trọng số không L2", "Độ lớn sau một bước.", [{label:"w1",value:1.96},{label:"|w2|",value:.98},{label:"w3",value:.49}], {min:0,max:2}) },
        { id: "mild", label: "L2 0,1", parameters: { l2: 0.1 }, expectedOutput: "l2=0.1\nupdated=[1.92, -0.96, 0.48]\nweight_norm=2.1996", observation: "Penalty co mỗi hệ số thêm một lượng tỷ lệ độ lớn.", illustration: bars("Trọng số L2 0,1", "Norm giảm còn 2,1996.", [{label:"w1",value:1.92},{label:"|w2|",value:.96},{label:"w3",value:.48}], {min:0,max:2}) },
        { id: "strong", label: "L2 1,0", parameters: { l2: 1 }, expectedOutput: "l2=1.0\nupdated=[1.56, -0.78, 0.39]\nweight_norm=1.7872", observation: "Co mạnh có thể giảm variance nhưng cũng dễ underfit.", illustration: bars("Trọng số L2 1,0", "Mọi hệ số bị co rõ.", [{label:"w1",value:1.56,tone:"warn"},{label:"|w2|",value:.78},{label:"w3",value:.39}], {min:0,max:2}) },
      ],
    },
    transferQuestion: "Vì sao feature chưa chuẩn hóa khiến cùng một lambda L2 đối xử không công bằng giữa các hệ số?",
  },

  "dl-weight-initialization": {
    lessonId: "dl-weight-initialization",
    scenario: { title: "Theo dõi biên độ qua bốn tầng", context: "Một mạng scalar toy truyền activation dương qua bốn tầng có multiplier cố định [1,2;0,8;1,1;0,9]. Scale khởi tạo nhân vào mỗi tầng, làm tín hiệu tiêu biến hoặc bùng nổ.", goal: "Quan sát activation history ở ba scale trước khi huấn luyện." },
    inputs: [{ label: "Gain nền mỗi tầng", format: "python", value: "multipliers=[1.2,0.8,1.1,0.9]; activation0=1.0" }],
    python: {
      title: "Lan truyền activation theo scale", filename: "initialization_scale.py",
      codeTemplate: `scale = {{scale}}
multipliers = [1.2, 0.8, 1.1, 0.9]
activation = 1.0
history = []
for multiplier in multipliers:
    activation = max(0.0, activation * multiplier * scale)
    history.append(activation)
print(f"scale={scale:.1f}")
print("activations=[" + ", ".join(f"{value:.4f}" for value in history) + "]")
print(f"final_gain={activation:.4f}")`,
    },
    explanation: [
      { title: "Khởi tạo input", text: "Activation đầu bằng 1 giúp final activation đọc trực tiếp như gain toàn mạng." },
      { title: "Nhân qua tầng", text: "Scale xuất hiện ở mọi tầng nên ảnh hưởng lũy thừa theo độ sâu." },
      { title: "ReLU", text: "Các multiplier dương giữ ReLU hoạt động; ví dụ cô lập vấn đề biên độ khỏi dead unit." },
      { title: "Đọc ổn định", text: "Scale tốt giữ activation cùng bậc độ lớn, nhưng mạng thật cần xem cả variance và gradient." },
    ],
    experiment: {
      question: "Scale nào giữ gain cuối gần 1 nhất?", parameterLabels: { scale: "Scale khởi tạo" }, defaultVariantId: "stable",
      variants: [
        { id: "small", label: "Scale 0,5", parameters: { scale: 0.5 }, expectedOutput: "scale=0.5\nactivations=[0.6000, 0.2400, 0.1320, 0.0594]\nfinal_gain=0.0594", observation: "Tín hiệu giảm hơn 16 lần qua bốn tầng.", illustration: plot("Activation tiêu biến", "Mỗi tầng kéo biên độ xuống.", "Tầng", "Activation", [{label:"a",tone:"warn",points:[1,.6,.24,.132,.0594].map((y,i)=>({x:i,y}))}]) },
        { id: "stable", label: "Scale 1,0", parameters: { scale: 1 }, expectedOutput: "scale=1.0\nactivations=[1.2000, 0.9600, 1.0560, 0.9504]\nfinal_gain=0.9504", observation: "Activation dao động quanh 1 và gain cuối gần ban đầu.", illustration: plot("Activation ổn định", "Biên độ cùng bậc qua bốn tầng.", "Tầng", "Activation", [{label:"a",tone:"good",points:[1,1.2,.96,1.056,.9504].map((y,i)=>({x:i,y}))}]) },
        { id: "large", label: "Scale 1,5", parameters: { scale: 1.5 }, expectedOutput: "scale=1.5\nactivations=[1.8000, 2.1600, 3.5640, 4.8114]\nfinal_gain=4.8114", observation: "Biên độ tăng gần năm lần và có xu hướng bùng nổ theo độ sâu.", illustration: plot("Activation bùng nổ", "Scale lặp ở mọi tầng.", "Tầng", "Activation", [{label:"a",tone:"warn",points:[1,1.8,2.16,3.564,4.8114].map((y,i)=>({x:i,y}))}]) },
      ],
    },
    transferQuestion: "Xavier và He initialization dùng fan-in/fan-out thế nào để giữ variance khi activation và độ rộng tầng thay đổi?",
  },

  "dl-batch-normalization": {
    lessonId: "dl-batch-normalization",
    scenario: { title: "Chuẩn hóa batch nhiệt độ ba phòng", context: "Một channel trong mini-batch có giá trị [2,4,6]. Batch normalization trừ mean 4 và chia căn variance cộng epsilon; epsilon lớn tăng ổn định số nhưng làm variance output lệch 1.", goal: "Tính normalized values và variance output ở ba epsilon." },
    inputs: [{ label: "Một channel", format: "python", value: "values=[2.0,4.0,6.0]; gamma=1; beta=0" }],
    python: {
      title: "Batch normalization từ đầu", filename: "batch_norm_epsilon.py",
      codeTemplate: `import math
epsilon = {{epsilon}}
values = [2.0, 4.0, 6.0]
mean = sum(values) / len(values)
variance = sum((value - mean) ** 2 for value in values) / len(values)
normalized = [(value - mean) / math.sqrt(variance + epsilon) for value in values]
output_variance = sum(value ** 2 for value in normalized) / len(normalized)
print(f"epsilon={epsilon:g} mean={mean:.1f} variance={variance:.4f}")
print("normalized=[" + ", ".join(f"{value:.4f}" for value in normalized) + "]")
print(f"output_variance={output_variance:.4f}")`,
    },
    explanation: [
      { title: "Batch mean", text: "Mean 4 được tính trên đúng ba giá trị của channel." },
      { title: "Population variance", text: "BatchNorm dùng trung bình bình phương sai lệch với mẫu số N trong forward train." },
      { title: "Epsilon", text: "Cộng epsilon trước căn tránh chia cho số quá nhỏ." },
      { title: "Train và eval", text: "Ví dụ dùng batch statistics; inference thực dùng running statistics đã lưu." },
    ],
    experiment: {
      question: "Epsilon lớn làm output variance gần hay xa 1 hơn?", parameterLabels: { epsilon: "Epsilon" }, defaultVariantId: "medium",
      variants: [
        { id: "tiny", label: "1e-5", parameters: { epsilon: 0.00001 }, expectedOutput: "epsilon=1e-05 mean=4.0 variance=2.6667\nnormalized=[-1.2247, 0.0000, 1.2247]\noutput_variance=1.0000", observation: "Epsilon rất nhỏ nên variance output làm tròn thành 1.", illustration: bars("BatchNorm epsilon 1e-5", "Ba activation đối xứng quanh 0.", [{label:"x=2",value:-1.2247},{label:"x=4",value:0},{label:"x=6",value:1.2247}], {min:-1.3,max:1.3}) },
        { id: "medium", label: "0,01", parameters: { epsilon: 0.01 }, expectedOutput: "epsilon=0.01 mean=4.0 variance=2.6667\nnormalized=[-1.2225, 0.0000, 1.2225]\noutput_variance=0.9963", observation: "Độ lớn giảm nhẹ và variance output còn 0,9963.", illustration: bars("BatchNorm epsilon 0,01", "Epsilon bắt đầu nén biên độ.", [{label:"x=2",value:-1.2225},{label:"x=4",value:0},{label:"x=6",value:1.2225}], {min:-1.3,max:1.3}) },
        { id: "large", label: "0,1", parameters: { epsilon: 0.1 }, expectedOutput: "epsilon=0.1 mean=4.0 variance=2.6667\nnormalized=[-1.2024, 0.0000, 1.2024]\noutput_variance=0.9639", observation: "Epsilon lớn làm variance output lệch 1 rõ hơn.", illustration: bars("BatchNorm epsilon 0,1", "Biên độ bị nén để đổi lấy mẫu số ổn định hơn.", [{label:"x=2",value:-1.2024,tone:"warn"},{label:"x=4",value:0},{label:"x=6",value:1.2024,tone:"warn"}], {min:-1.3,max:1.3}) },
      ],
    },
    transferQuestion: "Vì sao batch rất nhỏ làm running statistics nhiễu, và LayerNorm tránh phụ thuộc batch axis như thế nào?",
  },

  "dl-finetuning": {
    lessonId: "dl-finetuning",
    scenario: { title: "Mở dần backbone phân loại ảnh cây bệnh", context: "Model pretrained có stem 1.200, block1 3.000, block2 5.000 và head mới 600 tham số. Nhóm thử đóng băng toàn backbone hoặc mở dần các block cuối.", goal: "Tính số tham số trainable và danh sách layer được cập nhật." },
    inputs: [{ label: "Parameter count", format: "json", value: "{\"stem\":1200,\"block1\":3000,\"block2\":5000,\"head\":600}" }],
    python: {
      title: "Lập kế hoạch unfreeze", filename: "finetune_plan.py",
      codeTemplate: `unfreeze_blocks = {{unfreeze_blocks}}
backbone = [("stem", 1200), ("block1", 3000), ("block2", 5000)]
head = ("head", 600)
selected = backbone[-unfreeze_blocks:] if unfreeze_blocks else []
trainable_layers = selected + [head]
trainable = sum(count for _, count in trainable_layers)
total = sum(count for _, count in backbone) + head[1]
print(f"unfreeze_blocks={unfreeze_blocks}")
print(f"layers={[name for name, _ in trainable_layers]}")
print(f"trainable={trainable}/{total} ({100 * trainable / total:.1f}%)")`,
    },
    explanation: [
      { title: "Head luôn học", text: "Head mới phải train để ánh xạ representation pretrained sang nhãn cây bệnh." },
      { title: "Mở từ cuối", text: "Các block gần output thường chuyên biệt hơn nên được unfreeze trước." },
      { title: "Đếm tham số", text: "Trainable count quyết định bộ nhớ gradient và optimizer state, không chỉ thời gian forward." },
      { title: "Tách learning rate", text: "Khi mở backbone, thường dùng learning rate nhỏ hơn head để hạn chế quên kiến thức pretrained." },
    ],
    experiment: {
      question: "Mở block cuối làm trainable count tăng bao nhiêu so với chỉ head?", parameterLabels: { unfreeze_blocks: "Số block backbone mở" }, defaultVariantId: "last",
      variants: [
        { id: "head", label: "Chỉ head", parameters: { unfreeze_blocks: 0 }, expectedOutput: "unfreeze_blocks=0\nlayers=['head']\ntrainable=600/9800 (6.1%)", observation: "Chỉ 6,1% tham số học; nhanh và ít overfit nhưng representation không thích nghi.", illustration: sequence("Linear probe", "Backbone đóng băng.", [{label:"stem",value:"freeze"},{label:"block1",value:"freeze"},{label:"block2",value:"freeze"},{label:"head",value:"train",tone:"good"}]) },
        { id: "last", label: "Mở block2", parameters: { unfreeze_blocks: 1 }, expectedOutput: "unfreeze_blocks=1\nlayers=['block2', 'head']\ntrainable=5600/9800 (57.1%)", observation: "Trainable count tăng 5.000 tham số và vượt nửa model.", illustration: sequence("Fine-tune block cuối", "Block2 và head nhận gradient.", [{label:"stem",value:"freeze"},{label:"block1",value:"freeze"},{label:"block2",value:"train",tone:"accent"},{label:"head",value:"train",tone:"good"}]) },
        { id: "all", label: "Mở toàn bộ", parameters: { unfreeze_blocks: 3 }, expectedOutput: "unfreeze_blocks=3\nlayers=['stem', 'block1', 'block2', 'head']\ntrainable=9800/9800 (100.0%)", observation: "Toàn bộ model cập nhật; linh hoạt nhất nhưng tốn bộ nhớ và dễ catastrophic forgetting.", illustration: sequence("Full fine-tuning", "Mọi layer nhận gradient.", [{label:"stem",value:"train",tone:"accent"},{label:"block1",value:"train",tone:"accent"},{label:"block2",value:"train",tone:"accent"},{label:"head",value:"train",tone:"good"}]) },
      ],
    },
    transferQuestion: "Với chỉ 200 ảnh gắn nhãn, bạn sẽ dùng validation curve nào để quyết định dừng ở linear probe, mở block cuối hay full fine-tuning?",
  },
} satisfies LessonPracticeMap;