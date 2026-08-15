/**
 * Nguồn dữ liệu chuẩn cho lộ trình VOAI/IOAI 41 tuần.
 *
 * Mỗi tuần có đúng 5 bài học + 1 lab + 1 checkpoint. Hàm
 * `generateCurriculumSessions()` trải 41 tuần đó thành 287 phiên và nối thêm
 * 3 phiên tổng kết, tạo đúng 290 ngày liên tục từ 2026-08-15 đến 2027-05-31.
 */

export const COURSE_START_ISO = "2026-08-15";
export const COURSE_END_ISO = "2027-05-31";
export const TOTAL_CALENDAR_DAYS = 290;
export const COMPLETE_WEEKS = 41;
export const FINAL_SPRINT_DAYS = 3;

export const STUDY_CONTRACT = {
  coreMinutes: 30,
  deepMinutes: 60,
  soloLabel: "SOLO-90",
  coachLabel: "COACH-10",
  soloPercent: 90,
  coachPercent: 10,
  rule:
    "Tự đọc, suy luận, code và debug trước. Chỉ hỏi AI để kiểm tra lập luận hoặc một lỗi nhỏ; không xin lời giải hay đoạn code hoàn chỉnh.",
  coachPrompt:
    "Đây là giả thuyết, test và kết quả em tự làm. Hãy chỉ nói ĐÚNG/CHƯA ĐÚNG, nêu một phản ví dụ hoặc một câu hỏi gợi mở; không viết code thay em.",
} as const;

export type PhaseId =
  | "foundation"
  | "classical-ml"
  | "deep-learning"
  | "computer-vision"
  | "nlp-audio"
  | "integration"
  | "competition-project"
  | "graduation";

export type SyllabusCategory = "Theory" | "Practice" | "Both" | "Bridge";
export type SessionKind = "lesson" | "lab" | "checkpoint" | "finale";
export type Domain =
  | "Python"
  | "Math"
  | "Data"
  | "ML"
  | "DL"
  | "CV"
  | "NLP"
  | "Audio"
  | "Multimodal"
  | "VOAI"
  | "Project";

export interface LessonPlan {
  title: string;
  outcome: string;
  soloBuild: string;
  selfCheck: string;
}

export interface LabPlan {
  title: string;
  product: string;
  acceptance: readonly string[];
}

export interface CheckpointPlan {
  title: string;
  passScore: number;
  tasks: readonly string[];
  retryRule: string;
  /** Ngoại lệ thi thử có chủ đích; các checkpoint thường vẫn dùng Deep 60 phút. */
  extendedMinutes?: 180 | 360;
}

export interface AssessmentRubric {
  theory: number;
  implementation: number;
  evaluation: number;
  reflection: number;
  passScore: number;
  gate: string;
}

export interface WeekPlan {
  week: number;
  phaseId: PhaseId;
  phaseTitle: string;
  domain: Domain;
  title: string;
  startDate: string;
  endDate: string;
  focus: string;
  prerequisites: readonly string[];
  objectives: readonly string[];
  syllabusTopics: readonly string[];
  lessons: readonly LessonPlan[];
  lab: LabPlan;
  checkpoint: CheckpointPlan;
  deliverable: string;
  assessment: AssessmentRubric;
  milestone?: string;
}

export interface CurriculumSession {
  id: string;
  ordinal: number;
  date: string;
  week: number | null;
  dayInWeek: number;
  phaseId: PhaseId;
  phaseTitle: string;
  domain: Domain;
  kind: SessionKind;
  title: string;
  outcome: string;
  artifact: string;
  assessment: string;
  coreMinutes: 30;
  deepMinutes: 60 | 180 | 360;
  corePlan: readonly string[];
  deepExtension: string;
  labels: readonly ["SOLO-90", "COACH-10"];
  coachBoundary: string;
}

export interface SyllabusCoverageItem {
  id: string;
  section: "Foundational Skills & Classical ML" | "Neural Networks & Deep Learning" | "Computer Vision" | "NLP & Audio";
  topic: string;
  category: Exclude<SyllabusCategory, "Bridge">;
  weeks: readonly number[];
}

const PHASE_TITLES: Record<PhaseId, string> = {
  foundation: "Chặng 1 · Nền móng chuyển từ C++ sang AI",
  "classical-ml": "Chặng 2 · Học máy cổ điển và tư duy thực nghiệm",
  "deep-learning": "Chặng 3 · Mạng nơ-ron và học sâu",
  "computer-vision": "Chặng 4 · Thị giác máy tính",
  "nlp-audio": "Chặng 5 · NLP và âm thanh",
  integration: "Chặng 6 · Dữ liệu chuỗi, đa phương thức và tích hợp",
  "competition-project": "Chặng 7 · VOAI và dự án đầu-cuối",
  graduation: "Tổng kết · Chứng minh năng lực độc lập",
};

const DEFAULT_RUBRIC: AssessmentRubric = {
  theory: 25,
  implementation: 45,
  evaluation: 20,
  reflection: 10,
  passScore: 70,
  gate: "Không qua nếu không giải thích được code hoặc không tái lập được kết quả.",
};

function addDaysIso(iso: string, days: number): string {
  const parts = iso.split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    throw new Error(`Invalid ISO date: ${iso}`);
  }
  const [year, month, day] = parts;
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function lesson(title: string, outcome: string, soloBuild: string, selfCheck: string): LessonPlan {
  return { title, outcome, soloBuild, selfCheck };
}

type WeekInput = Omit<WeekPlan, "startDate" | "endDate" | "phaseTitle" | "assessment"> & {
  assessment?: AssessmentRubric;
};

function defineWeek(input: WeekInput): WeekPlan {
  if (input.lessons.length !== 5) {
    throw new Error(`Week ${input.week} must contain exactly 5 lessons.`);
  }
  const startDate = addDaysIso(COURSE_START_ISO, (input.week - 1) * 7);
  return {
    ...input,
    phaseTitle: PHASE_TITLES[input.phaseId],
    startDate,
    endDate: addDaysIso(startDate, 6),
    assessment: input.assessment ?? DEFAULT_RUBRIC,
  };
}

export const WEEKLY_CURRICULUM: readonly WeekPlan[] = [
  defineWeek({
    week: 1,
    phaseId: "foundation",
    domain: "Python",
    title: "Python cho người đã biết C++",
    focus: "Chuyển tư duy thuật toán sang Python sạch, kiểm thử được và phù hợp notebook.",
    prerequisites: ["Biết biến, vòng lặp, hàm, vector/map trong C++", "Cài Python hoặc dùng Colab"],
    objectives: ["Đọc/viết Python cơ bản", "Tách hàm và kiểm thử bằng assert", "Dùng notebook không phụ thuộc trạng thái ẩn"],
    syllabusTopics: ["Python Basics — Practice"],
    lessons: [
      lesson("Cú pháp và kiểu dữ liệu", "So sánh list/dict/set/tuple với STL.", "Viết lại 5 thao tác STL bằng Python.", "Tự dự đoán output trước khi chạy."),
      lesson("Điều khiển luồng kiểu Pythonic", "Dùng loop, comprehension, enumerate, zip đúng chỗ.", "Chuẩn hóa một bảng điểm không dùng AI.", "Test rỗng, trùng và số âm."),
      lesson("Hàm, scope và type hints", "Thiết kế hàm thuần có hợp đồng rõ.", "Tách pipeline 3 hàm có type hints.", "Mỗi hàm có ít nhất 3 assert."),
      lesson("File, CSV/JSON và lỗi", "Đọc dữ liệu an toàn, xử lý exception có chủ đích.", "Parser CSV nhỏ không nuốt lỗi.", "Dùng file hỏng để chứng minh lỗi được báo."),
      lesson("Notebook tái lập", "Hiểu cell order, seed và dependency.", "Tạo notebook chạy lại từ đầu không lỗi.", "Restart runtime rồi Run all."),
    ],
    lab: { title: "Mini EDA thuần Python", product: "Notebook đọc dữ liệu, thống kê, test và README ngắn.", acceptance: ["Run all thành công", "Ít nhất 10 assert", "Không copy code AI"] },
    checkpoint: { title: "Python bridge", passScore: 70, tasks: ["Quiz 10 câu", "Code 2 hàm trong 20 phút", "Giải thích một bug stateful notebook"], retryRule: "Sai mục nào, tự viết lại từ trang trắng mục đó vào ngày kế tiếp." },
    deliverable: "w01_python_bridge.ipynb + nhật ký lỗi.md",
  }),
  defineWeek({
    week: 2,
    phaseId: "foundation",
    domain: "Data",
    title: "NumPy, Pandas, Tensor và trực quan hóa",
    focus: "Thao tác dữ liệu vector hóa trước khi dùng mô hình.",
    prerequisites: ["Tuần 1", "Biết mảng nhiều chiều ở mức trực giác"],
    objectives: ["Kiểm soát shape/dtype/broadcast", "Làm sạch DataFrame", "Vẽ biểu đồ trả lời một câu hỏi"],
    syllabusTopics: ["NumPy and Pandas — Practice", "Matplotlib and Seaborn — Practice", "Tensor manipulation — Practice"],
    lessons: [
      lesson("ndarray, shape, axis", "Theo dõi hình dạng qua từng phép toán.", "Tự cài mean theo axis rồi đối chiếu NumPy.", "Ghi shape trước và sau mọi bước."),
      lesson("Broadcasting và vectorization", "Thay vòng lặp bằng phép toán mảng có kiểm soát.", "Chuẩn hóa ma trận không dùng sklearn.", "So khớp với loop trên dữ liệu nhỏ."),
      lesson("Pandas indexing và missing values", "Phân biệt loc/iloc và tránh chained assignment.", "Làm sạch bảng có NaN/trùng/sai kiểu.", "Báo cáo số dòng biến đổi."),
      lesson("Groupby, join và ragged data", "Gộp bảng mà không làm nhân bản sai.", "Tạo feature theo nhóm từ hai bảng.", "Kiểm tra khóa và số hàng trước/sau join."),
      lesson("Matplotlib/Seaborn có mục đích", "Chọn biểu đồ theo loại biến.", "Vẽ 3 biểu đồ, mỗi biểu đồ có kết luận.", "Xóa biểu đồ không trả lời câu hỏi."),
    ],
    lab: { title: "Data detective", product: "Notebook tìm 5 vấn đề chất lượng dữ liệu và sửa có bằng chứng.", acceptance: ["Không loop thừa", "Không rò rỉ target", "Biểu đồ có nhãn/đơn vị"] },
    checkpoint: { title: "Shape & data handling", passScore: 75, tasks: ["10 câu shape", "Sửa 3 bug Pandas", "Viết một transformation vector hóa"], retryRule: "Phải đạt 100% câu shape trước khi sang tuần 3." },
    deliverable: "w02_data_detective.ipynb",
  }),
  defineWeek({
    week: 3,
    phaseId: "foundation",
    domain: "Math",
    title: "Toán vừa đủ để hiểu mô hình",
    focus: "Xây trực giác đại số tuyến tính, xác suất, thống kê và vi tích phân bằng code.",
    prerequisites: ["Đại số THPT", "NumPy tuần 2"],
    objectives: ["Giải thích vector/matrix như biến đổi", "Tính xác suất và kỳ vọng", "Nối đạo hàm với tối ưu"],
    syllabusTopics: ["Bridge: linear algebra", "Bridge: probability & statistics", "Bridge: calculus for optimization"],
    lessons: [
      lesson("Vector, norm, dot product", "Hiểu độ dài và tương đồng.", "Cài dot/cosine bằng loop và NumPy.", "Thử vector 0, trực giao, cùng hướng."),
      lesson("Ma trận và phép biến đổi", "Đọc shape của Xw và affine map.", "Biến đổi 20 điểm 2D và vẽ.", "Dự đoán hình trước khi chạy."),
      lesson("Xác suất có điều kiện và Bayes", "Phân biệt P(A|B) với P(B|A).", "Mô phỏng bộ lọc spam nhỏ.", "So công thức với tần suất mô phỏng."),
      lesson("Kỳ vọng, phương sai, phân phối", "Đọc mean/std như đặc tính dữ liệu.", "Mô phỏng sampling distribution.", "Thay seed và giải thích dao động."),
      lesson("Đạo hàm, gradient, chain rule", "Theo dõi hướng giảm loss.", "Tính gradient số của hàm 2 biến.", "So với gradient giải tích sai số < 1e-5."),
    ],
    lab: { title: "Math visual lab", product: "Notebook tương tác cho dot product, Bayes và gradient.", acceptance: ["Có kiểm tra số", "Có hình trực quan", "Giải thích bằng lời của học sinh"] },
    checkpoint: { title: "Math readiness", passScore: 70, tasks: ["Tính tay 5 câu", "Code gradient check", "Giải thích Bayes bằng ví dụ mới"], retryRule: "Nếu gradient check trượt, lặp lại với hàm một biến rồi hai biến." },
    deliverable: "w03_math_visual.ipynb + one-page formula sheet tự viết",
  }),
  defineWeek({
    week: 4,
    phaseId: "foundation",
    domain: "Data",
    title: "Pipeline khoa học dữ liệu và baseline",
    focus: "Biến dữ liệu thô thành baseline hợp lệ bằng scikit-learn.",
    prerequisites: ["Tuần 1–3"],
    objectives: ["Chia train/validation/test đúng", "Tiền xử lý không leakage", "Chọn metric theo mục tiêu"],
    syllabusTopics: ["Scikit-learn — Practice", "Model evaluation metrics — Both", "Feature engineering — Practice", "Data processing — Practice"],
    lessons: [
      lesson("Bài toán, target và metric", "Chuyển mô tả thành supervised task.", "Viết problem card cho 3 tình huống.", "Nêu hậu quả của metric sai."),
      lesson("Split và leakage", "Nhận diện leakage theo thời gian/nhóm/người.", "Cài ba chiến lược split.", "Chứng minh không giao ID giữa split."),
      lesson("Imputation, encoding, scaling", "Fit transformation chỉ trên train.", "Dùng ColumnTransformer cho bảng hỗn hợp.", "Test unknown category và NaN."),
      lesson("Feature engineering và baseline", "Tạo feature có giả thuyết.", "So dummy, rule-based và model baseline.", "Giữ log thay đổi từng feature."),
      lesson("Experiment ledger", "Ghi seed, dữ liệu, metric và kết quả.", "Tạo bảng thí nghiệm tái lập.", "Chạy lại cho cùng kết quả trong sai số."),
    ],
    lab: { title: "Baseline không leakage", product: "Pipeline sklearn + validation + error analysis đầu tiên.", acceptance: ["Có dummy baseline", "Pipeline fit train-only", "Có bảng 10 lỗi"] },
    checkpoint: { title: "Foundation gate", passScore: 75, tasks: ["Audit pipeline có leakage", "Tạo submission CSV", "Vấn đáp 5 phút"], retryRule: "Không qua nếu submission sai schema hoặc không giải thích được split." },
    deliverable: "w04_baseline_pipeline.ipynb + experiment.csv",
    milestone: "M1 — Tự dựng được baseline dữ liệu bảng sạch, tái lập và không leakage.",
  }),
  defineWeek({
    week: 5,
    phaseId: "classical-ml",
    domain: "ML",
    title: "Linear Regression từ công thức đến sklearn",
    focus: "Hiểu dự đoán tuyến tính, loss và giả định thay vì chỉ gọi fit().",
    prerequisites: ["Ma trận, gradient", "Pipeline sklearn"],
    objectives: ["Suy luận MSE", "Cài linear regression bằng gradient descent", "Phân tích residual"],
    syllabusTopics: ["Linear Regression — Both", "MSE/MAE — Both"],
    lessons: [
      lesson("Mô hình y = Xw + b", "Giải thích hệ số và prediction.", "Cài predict không sklearn.", "So shape và output với ví dụ tay."),
      lesson("MSE, MAE và residual", "Biết metric nhạy outlier thế nào.", "Cài hai loss từ đầu.", "Tạo outlier và so thay đổi."),
      lesson("Gradient cho hồi quy", "Suy ra gradient MSE.", "Huấn luyện bằng loop gradient.", "Gradient check số."),
      lesson("Normal equation và điều kiện", "So lời giải đóng với tối ưu lặp.", "Dùng pseudo-inverse trên dữ liệu nhỏ.", "Kiểm tra collinearity."),
      lesson("Residual diagnosis", "Nhận biết nonlinear/heteroscedasticity.", "Vẽ residual và nêu 3 kết luận.", "Không kết luận quá dữ liệu."),
    ],
    lab: { title: "House-price regression from scratch", product: "Hai implementation + biểu đồ residual.", acceptance: ["Sai lệch sklearn nhỏ", "Có gradient check", "Có error analysis"] },
    checkpoint: { title: "Linear regression proof-of-work", passScore: 75, tasks: ["Suy ra một gradient", "Code predict/loss/train", "Giải thích residual"], retryRule: "Code lại bằng mảng nhỏ nếu dùng sai shape." },
    deliverable: "w05_linear_regression.ipynb",
  }),
  defineWeek({
    week: 6,
    phaseId: "classical-ml",
    domain: "ML",
    title: "Logistic Regression và đo lường phân loại",
    focus: "Từ logit đến ngưỡng quyết định và metric phù hợp dữ liệu lệch lớp.",
    prerequisites: ["Linear regression", "Xác suất cơ bản"],
    objectives: ["Cài sigmoid/log-loss", "Đọc confusion matrix/ROC", "Tối ưu threshold trên validation"],
    syllabusTopics: ["Logistic Regression — Both", "Confusion Matrix and ROC Curves — Both", "Accuracy/Precision/Recall/F1 — Both"],
    lessons: [
      lesson("Logit và sigmoid", "Nối linear score với xác suất.", "Cài sigmoid ổn định số.", "Test input ±1000."),
      lesson("Binary cross-entropy", "Hiểu phạt dự đoán tự tin sai.", "Cài BCE có clipping.", "So loss ba dự đoán tay."),
      lesson("Confusion matrix", "Tính TP/FP/FN/TN và metric.", "Cài metric không sklearn.", "Đối chiếu sklearn."),
      lesson("ROC-AUC và PR-AUC", "Phân biệt ranking với threshold.", "Quét threshold và vẽ hai curve.", "Giải thích khi PR hữu ích hơn."),
      lesson("Calibration và threshold", "Tách xác suất tốt khỏi quyết định tốt.", "Chọn threshold theo chi phí.", "Không dùng test để chọn."),
    ],
    lab: { title: "Imbalanced classifier", product: "Classifier + threshold policy + error slices.", acceptance: ["Có baseline majority", "Threshold chọn trên validation", "Báo cả F1 và PR-AUC"] },
    checkpoint: { title: "Classification metrics", passScore: 80, tasks: ["Tính metric bằng tay", "Chọn metric cho 3 bối cảnh", "Debug threshold leakage"], retryRule: "Phải đạt 100% bài confusion matrix." },
    deliverable: "w06_logistic_metrics.ipynb",
  }),
  defineWeek({
    week: 7,
    phaseId: "classical-ml",
    domain: "ML",
    title: "Regularization, bias–variance và chọn mô hình",
    focus: "Kiểm soát overfitting bằng L1/L2, cross-validation và tuning hợp lệ.",
    prerequisites: ["Tuần 5–6", "Pipeline tuần 4"],
    objectives: ["Giải thích under/overfitting", "Dùng L1/L2", "Thiết kế CV và search không leakage"],
    syllabusTopics: ["L1 & L2 Regularization — Both", "Underfitting/Overfitting — Theory", "Cross-Validation — Practice", "Hyperparameter Tuning — Practice"],
    lessons: [
      lesson("Bias–variance", "Đọc learning curve để chẩn đoán.", "Tạo dữ liệu polynomial và thay độ phức tạp.", "Giải thích cả train/val curve."),
      lesson("L2 và shrinkage", "Hiểu phạt norm bình phương.", "Thêm L2 vào gradient regression.", "So norm trọng số theo lambda."),
      lesson("L1 và sparsity", "Hiểu vì sao L1 tạo zero.", "Thực nghiệm Lasso trên feature nhiễu.", "Đếm feature được giữ."),
      lesson("Cross-validation đúng nhóm/thời gian", "Chọn splitter theo cấu trúc dữ liệu.", "So KFold, Stratified, Group, TimeSeries.", "Nêu splitter sai và hậu quả."),
      lesson("Grid/random search", "Tuning trên CV, khóa test.", "Tạo search space có log scale.", "Ghi mọi trial."),
    ],
    lab: { title: "Model selection tournament", product: "Learning curves + CV search + locked test report.", acceptance: ["Test chỉ mở một lần", "Có uncertainty CV", "Không chọn chỉ theo một seed"] },
    checkpoint: { title: "Generalization gate", passScore: 75, tasks: ["Chẩn đoán 4 learning curves", "Thiết kế CV", "Giải thích L1/L2"], retryRule: "Làm lại với sơ đồ train/val/test nếu có leakage." },
    deliverable: "w07_model_selection.ipynb",
  }),
  defineWeek({
    week: 8,
    phaseId: "classical-ml",
    domain: "ML",
    title: "K-NN và Support Vector Machines",
    focus: "Hiểu vai trò khoảng cách, scale, margin và kernel.",
    prerequisites: ["Norm/dot product", "Scaling và CV"],
    objectives: ["Cài K-NN", "Giải thích maximum margin", "Chọn kernel/C/gamma bằng CV"],
    syllabusTopics: ["K-Nearest Neighbors — Both", "Support Vector Machines — Both"],
    lessons: [
      lesson("Khoảng cách và lời nguyền chiều", "Biết scale/chiều ảnh hưởng hàng xóm.", "Cài Euclidean/Manhattan.", "Thử thêm feature nhiễu."),
      lesson("K-NN classification/regression", "Cài vote và tie-break.", "Viết K-NN từ NumPy.", "Đối chiếu sklearn trên toy set."),
      lesson("Margin và support vectors", "Vẽ hyperplane/margin 2D.", "Tìm điểm quyết định biên bằng thử nghiệm.", "Giải thích C lớn/nhỏ."),
      lesson("Kernel trick", "Hiểu ánh xạ ngầm ở mức trực giác.", "So linear/RBF trên moons.", "Vẽ decision boundary."),
      lesson("Tuning và chi phí", "So độ chính xác, thời gian, bộ nhớ.", "Benchmark K-NN vs SVM.", "Ghi complexity thực nghiệm."),
    ],
    lab: { title: "Boundary explorer", product: "Web/notebook trực quan hóa K-NN, SVM và scale.", acceptance: ["Có 3 dataset", "Điều chỉnh hyperparameter", "Có kết luận khi nào dùng"] },
    checkpoint: { title: "Distance & margin", passScore: 75, tasks: ["Code K-NN", "Vẽ margin", "Chọn model theo constraint"], retryRule: "Không qua nếu quên scaling trong pipeline." },
    deliverable: "w08_knn_svm.ipynb",
  }),
  defineWeek({
    week: 9,
    phaseId: "classical-ml",
    domain: "ML",
    title: "Decision Trees",
    focus: "Tự xây cây nhỏ để hiểu split, impurity, pruning và overfit.",
    prerequisites: ["Classification metrics", "Entropy cơ bản"],
    objectives: ["Tính Gini/entropy", "Tìm best split", "Kiểm soát độ sâu"],
    syllabusTopics: ["Decision Trees — Both"],
    lessons: [
      lesson("Gini và entropy", "Đo độ hỗn tạp của node.", "Cài hai impurity.", "Tính tay ba node."),
      lesson("Best split", "Tối đa hóa information gain.", "Quét threshold một feature.", "So với split tay."),
      lesson("Đệ quy xây cây", "Hiểu node/leaf/stopping.", "Cài stump rồi cây depth 3.", "In cây dạng text."),
      lesson("Overfit và pruning", "Điều chỉnh depth/min_samples.", "Vẽ train/val theo depth.", "Chọn bằng validation."),
      lesson("Interpretability có giới hạn", "Đọc feature importance thận trọng.", "So permutation với impurity importance.", "Tạo feature tương quan để phản biện."),
    ],
    lab: { title: "Tree from scratch", product: "Cây NumPy depth-limited + so sklearn.", acceptance: ["Prediction đúng toy tests", "Có stop conditions", "Có visualization"] },
    checkpoint: { title: "Tree mechanics", passScore: 75, tasks: ["Tính best split", "Trace một prediction", "Chẩn đoán overfit"], retryRule: "Vẽ cây 2 mức bằng tay rồi code lại." },
    deliverable: "w09_decision_tree.ipynb",
  }),
  defineWeek({
    week: 10,
    phaseId: "classical-ml",
    domain: "ML",
    title: "Bagging, Random Forest và Gradient Boosting",
    focus: "Kết hợp nhiều mô hình, đo OOB/CV và chọn ensemble theo ngân sách.",
    prerequisites: ["Decision tree", "Bias–variance"],
    objectives: ["Phân biệt bagging/boosting", "Dùng Random Forest", "Tuning boosting có log"],
    syllabusTopics: ["Model Ensembles: Bagging, Random Forest, Gradient Boosting — Practice"],
    lessons: [
      lesson("Bootstrap và bagging", "Hiểu giảm variance bằng trung bình.", "Mô phỏng bootstrap estimators.", "Đo variance qua seed."),
      lesson("Random Forest", "Hiểu random rows/features.", "Train forest và đọc OOB.", "So một tree với forest."),
      lesson("Boosting trực giác residual", "Học tuần tự từ lỗi.", "Cài boosting với stumps nhỏ.", "Vẽ residual qua vòng."),
      lesson("Gradient boosting thực hành", "Dùng implementation thư viện đúng.", "Tuning depth/rate/estimators.", "Có early stopping hoặc CV."),
      lesson("Ensemble và resource budget", "Cân bằng điểm/thời gian/bộ nhớ.", "Lập Pareto table 6 cấu hình.", "Chọn cấu hình có lý do."),
    ],
    lab: { title: "Tabular leaderboard", product: "Ba ensemble, ablation và submission hợp lệ.", acceptance: ["Có baseline", "Có time/memory", "Không test leakage"] },
    checkpoint: { title: "Ensemble decision", passScore: 75, tasks: ["Phân loại bagging/boosting", "Đọc ablation", "Chọn model theo giới hạn"], retryRule: "Nếu chỉ nêu điểm số, bổ sung cost và variance." },
    deliverable: "w10_ensembles.ipynb + model_card.md",
  }),
  defineWeek({
    week: 11,
    phaseId: "classical-ml",
    domain: "ML",
    title: "K-Means Clustering",
    focus: "Hiểu objective, khởi tạo, convergence và cách đánh giá không nhãn.",
    prerequisites: ["Khoảng cách", "Scaling"],
    objectives: ["Cài Lloyd algorithm", "Chọn k thận trọng", "Nhận biết cụm không cầu"],
    syllabusTopics: ["K-Means Clustering — Both"],
    lessons: [
      lesson("Mục tiêu within-cluster", "Viết objective và assignment.", "Tính một vòng bằng tay/code.", "Objective không tăng sau update."),
      lesson("Lloyd algorithm", "Lặp assign/update đến hội tụ.", "Cài K-Means NumPy.", "Test empty cluster."),
      lesson("Khởi tạo k-means++", "Hiểu local optimum và seed.", "So random với k-means++ qua 20 seed.", "Báo phân phối inertia."),
      lesson("Elbow và silhouette", "Không thần thánh hóa chọn k.", "Vẽ hai diagnostic.", "Nêu khi metric gây hiểu lầm."),
      lesson("Failure modes", "Nhận biết scale, outlier, non-convex.", "Tạo 3 dataset phản ví dụ.", "Đề xuất thuật toán thay thế."),
    ],
    lab: { title: "Customer segmentation audit", product: "Phân cụm + stability + mô tả cụm.", acceptance: ["Scale hợp lý", "Nhiều seed", "Không gán ý nghĩa quá mức"] },
    checkpoint: { title: "K-Means mechanics", passScore: 75, tasks: ["Tính một iteration", "Code assign/update", "Chẩn đoán dataset sai"], retryRule: "Làm lại toy 2D cho đến objective đơn điệu." },
    deliverable: "w11_kmeans.ipynb",
  }),
  defineWeek({
    week: 12,
    phaseId: "classical-ml",
    domain: "ML",
    title: "PCA, t-SNE và UMAP",
    focus: "Giảm chiều để nén/khám phá mà không diễn giải sai bản đồ 2D.",
    prerequisites: ["Ma trận, variance", "Scaling"],
    objectives: ["Giải thích principal components", "Dùng PCA trong pipeline", "Đọc t-SNE/UMAP có cảnh giác"],
    syllabusTopics: ["Principal Component Analysis — Both", "t-SNE and UMAP — Practice"],
    lessons: [
      lesson("Projection và variance", "Hiểu trục giữ phương sai lớn.", "Chiếu dữ liệu 2D lên vector.", "Tính reconstruction error."),
      lesson("Eigen/SVD trực giác", "Nối SVD với PCA.", "Cài PCA bằng SVD NumPy.", "So sklearn components tới dấu."),
      lesson("Explained variance", "Chọn số chiều theo mục tiêu.", "Vẽ cumulative variance.", "Đo downstream score."),
      lesson("t-SNE", "Hiểu bảo toàn lân cận cục bộ.", "Thử perplexity/seed.", "Không so kích thước cụm như mật độ thật."),
      lesson("UMAP và kiểm chứng", "Dùng UMAP như công cụ khám phá.", "So PCA/t-SNE/UMAP.", "Đối chiếu bằng metric ở không gian gốc."),
    ],
    lab: { title: "Embedding atlas", product: "Dashboard ba phép chiếu với cảnh báo diễn giải.", acceptance: ["Nhiều seed", "Có original-space check", "Có reconstruction metric cho PCA"] },
    checkpoint: { title: "Dimensionality reduction", passScore: 75, tasks: ["Trace PCA", "Chọn số chiều", "Phản biện một plot t-SNE"], retryRule: "Nếu diễn giải cluster từ plot đơn lẻ, làm lại với seed/perplexity khác." },
    deliverable: "w12_dimensionality.ipynb",
  }),
  defineWeek({
    week: 13,
    phaseId: "classical-ml",
    domain: "ML",
    title: "DBSCAN, Hierarchical và Spectral Clustering",
    focus: "Chọn thuật toán cụm theo hình học, nhiễu và kích thước dữ liệu.",
    prerequisites: ["K-Means", "PCA"],
    objectives: ["Dùng DBSCAN", "Đọc dendrogram", "Hiểu spectral clustering ở mức thực hành"],
    syllabusTopics: ["DBSCAN, Hierarchical & Spectral Clustering — Practice"],
    lessons: [
      lesson("Density và DBSCAN", "Hiểu core/border/noise.", "Gán nhãn một toy set.", "Thay eps/min_samples và giải thích."),
      lesson("k-distance tuning", "Chọn eps có bằng chứng.", "Vẽ k-distance graph.", "Kiểm tra nhạy scale."),
      lesson("Hierarchical clustering", "Phân biệt linkage.", "Tạo dendrogram và cắt cây.", "So single/complete/Ward."),
      lesson("Spectral clustering", "Dùng graph similarity cho cụm phi lồi.", "Chạy spectral trên moons.", "Theo dõi gamma/neighbors."),
      lesson("Algorithm selection", "Lập ma trận dữ liệu→thuật toán.", "Benchmark 4 thuật toán trên 5 toy datasets kích thước cố định nhỏ.", "Không chọn theo hình đẹp duy nhất."),
    ],
    lab: { title: "Clustering arena", product: "Benchmark 4×5 trên toy data nhỏ, có stability và runtime; chỉ mở rộng kích thước ở phiên dự án.", acceptance: ["Ít nhất 4 thuật toán", "Có noise dataset", "Có bảng quyết định"] },
    checkpoint: { title: "Clustering choice", passScore: 75, tasks: ["Gán core/border/noise", "Đọc dendrogram", "Chọn thuật toán 4 tình huống"], retryRule: "Nếu chọn sai, tạo phản ví dụ và giải thích lại." },
    deliverable: "w13_clustering_arena.ipynb",
  }),
  defineWeek({
    week: 14,
    phaseId: "classical-ml",
    domain: "Project",
    title: "Dự án 1 — Tabular/Time-series ML đầu-cuối",
    focus: "Ghép preprocessing, feature engineering, model selection và báo cáo kiểu VOAI.",
    prerequisites: ["Tuần 4–13"],
    objectives: ["Dựng baseline trong 30 phút", "Chạy thí nghiệm có ablation", "Nộp notebook/report tái lập"],
    syllabusTopics: ["Feature Engineering — Practice", "Data Processing — Practice", "Classical ML synthesis"],
    lessons: [
      lesson("Problem framing & EDA có thời hạn", "Khóa target/metric/split.", "Viết problem card và data audit.", "Mentor chỉ duyệt hợp lệ, không chọn model."),
      lesson("Baseline và validation", "Có mốc so sánh đáng tin.", "Dựng dummy + linear/tree baseline.", "Submission schema test."),
      lesson("Feature hypotheses", "Mỗi feature gắn giả thuyết.", "Thực hiện 5 feature theo nhóm/thời gian.", "Ablate từng nhóm."),
      lesson("Model/ensemble sprint", "Tối ưu có ngân sách.", "Chạy tối đa 12 trials có log.", "Không mở test."),
      lesson("Error analysis và report", "Chuyển lỗi thành next action.", "Phân tích slice + viết report 2 trang.", "Run all trên runtime sạch."),
    ],
    lab: { title: "Blind mini-competition", product: "Notebook Colab/Kaggle, submission và technical report.", acceptance: ["Không dữ liệu ngoài", "Tự động từ raw→submission", "Có ablation và error slices"] },
    checkpoint: { title: "Classical ML defense", passScore: 80, tasks: ["Demo từ runtime sạch", "Vấn đáp 10 phút", "Thay metric và thích nghi pipeline"], retryRule: "Không qua nếu không tái lập hoặc không bảo vệ được một lựa chọn." },
    deliverable: "project_01_tabular/ gồm notebook, report, model card, submission",
    milestone: "M2 — Hoàn tất dự án ML cổ điển đầu-cuối và vòng thi mù đầu tiên.",
  }),
  defineWeek({
    week: 15,
    phaseId: "deep-learning",
    domain: "DL",
    title: "PyTorch, tensor và CPU/GPU",
    focus: "Viết training loop minh bạch, kiểm soát device/dtype/shape.",
    prerequisites: ["NumPy", "Gradient"],
    objectives: ["Dùng tensor/autograd", "Chuyển CPU/GPU an toàn", "Viết dataset/dataloader/training loop"],
    syllabusTopics: ["PyTorch Basics — Practice", "Tensor Manipulation — Practice", "Training on CPU and GPU — Practice"],
    lessons: [
      lesson("Tensor, dtype, device", "Phân biệt NumPy tensor và torch tensor.", "Viết 15 phép shape/device.", "Test CPU; GPU nếu có."),
      lesson("Autograd graph", "Theo dõi requires_grad/backward.", "Tính gradient ba hàm.", "So gradient tay/số."),
      lesson("Dataset và DataLoader", "Batch/shuffle/collate đúng.", "Tạo custom Dataset.", "Test batch cuối và seed."),
      lesson("Training/eval loop", "Tách train, validation, no_grad.", "Viết loop không helper cao cấp.", "Kiểm tra model.train/eval."),
      lesson("Checkpoint và reproducibility", "Lưu/khôi phục model+optimizer+seed.", "Resume sau 3 epoch.", "Kết quả tiếp nối hợp lý."),
    ],
    lab: { title: "PyTorch loop clinic", product: "Template training loop dùng lại cho các modality.", acceptance: ["CPU chạy chắc chắn", "GPU optional", "Resume checkpoint", "Seed documented"] },
    checkpoint: { title: "PyTorch mechanics", passScore: 80, tasks: ["Sửa 5 bug shape/device", "Viết loop từ skeleton", "Giải thích autograd"], retryRule: "Không sang tuần 16 nếu chưa viết được loop từ trí nhớ." },
    deliverable: "w15_pytorch_template.ipynb + train_utils.py",
  }),
  defineWeek({
    week: 16,
    phaseId: "deep-learning",
    domain: "DL",
    title: "Perceptron, activation và loss",
    focus: "Hiểu viên gạch tạo nên mạng nơ-ron và chọn output/loss đúng bài toán.",
    prerequisites: ["PyTorch loop", "Logistic regression"],
    objectives: ["Cài perceptron", "So ReLU/Sigmoid/Tanh", "Ghép activation–loss đúng"],
    syllabusTopics: ["Perceptron Basics — Both", "Activation Functions — Both", "Loss Functions — Both"],
    lessons: [
      lesson("Perceptron và biên tuyến tính", "Trace weighted sum và update.", "Cài perceptron NumPy.", "Chứng minh XOR thất bại."),
      lesson("Sigmoid/Tanh", "Hiểu saturation và gradient.", "Vẽ hàm/đạo hàm.", "Test input lớn."),
      lesson("ReLU và variants", "Hiểu sparsity/dead neurons.", "So activation trên toy MLP.", "Theo dõi tỷ lệ zero."),
      lesson("Regression losses", "Chọn MSE/MAE theo noise.", "Tạo outlier experiment.", "Giải thích gradient khác nhau."),
      lesson("Classification losses", "Dùng logits, BCE/CE đúng shape.", "Cài stable softmax CE.", "So PyTorch sai số nhỏ."),
    ],
    lab: { title: "Activation & loss playground", product: "Trình mô phỏng gradient/decision boundary.", acceptance: ["Có XOR", "Có stable implementation", "Có bảng chọn loss"] },
    checkpoint: { title: "Neuron building blocks", passScore: 80, tasks: ["Trace forward", "Ghép output-loss", "Code CE"], retryRule: "Phải sửa hết lỗi sigmoid/softmax ổn định số." },
    deliverable: "w16_neuron_playground.ipynb",
  }),
  defineWeek({
    week: 17,
    phaseId: "deep-learning",
    domain: "DL",
    title: "Tối ưu: GD, SGD, Adam và learning rate",
    focus: "Quan sát động lực tối ưu thay vì chọn optimizer theo thói quen.",
    prerequisites: ["Gradient", "PyTorch loop"],
    objectives: ["Cài GD/SGD", "Dùng Momentum/Adam/AdamW", "Chẩn đoán learning rate/convergence/init"],
    syllabusTopics: ["Gradient Descent — Both", "SGD & Mini-batch GD — Both", "Momentum, Adam, AdamW — Practice", "Convergence & Learning Rates — Practice", "Weight Initialization — Practice"],
    lessons: [
      lesson("Batch GD, SGD, mini-batch", "So noise và cost mỗi update.", "Cài ba optimizer cho quadratic.", "Vẽ trajectory/loss."),
      lesson("Momentum", "Hiểu velocity và damping.", "Cài momentum từ đầu.", "Test ravine function."),
      lesson("Adam và AdamW", "Hiểu moving moments ở mức dùng đúng.", "Trace 3 bước Adam bằng tay/code.", "Phân biệt weight decay."),
      lesson("Learning-rate schedules", "Nhận diện lr quá lớn/nhỏ.", "So constant, step, cosine.", "Giữ các yếu tố khác cố định."),
      lesson("Initialization và convergence", "Duy trì signal qua layer.", "So zeros/Xavier/He.", "Theo dõi activation/gradient norms."),
    ],
    lab: { title: "Optimizer race", product: "Benchmark optimizer×lr×init có đồ thị.", acceptance: ["Controlled experiment", "Nhiều seed", "Có kết luận theo bằng chứng"] },
    checkpoint: { title: "Optimization diagnosis", passScore: 75, tasks: ["Tính 2 update", "Đọc 5 loss curves", "Sửa config không hội tụ"], retryRule: "Lặp lại trên hàm 2D nếu chưa giải thích được trajectory." },
    deliverable: "w17_optimizer_race.ipynb",
  }),
  defineWeek({
    week: 18,
    phaseId: "deep-learning",
    domain: "DL",
    title: "Backpropagation và MLP từ đầu",
    focus: "Tự cài forward/backward để hiểu chain rule trong mạng nhiều lớp.",
    prerequisites: ["Activation/loss", "Gradient check"],
    objectives: ["Trace computational graph", "Cài dense layer backward", "Train MLP NumPy và PyTorch"],
    syllabusTopics: ["Backpropagation — Both", "Multi-Layer Perceptrons — Both"],
    lessons: [
      lesson("Computational graph", "Tách phép toán và local derivative.", "Vẽ graph của MLP nhỏ.", "Trace forward/backward số tay."),
      lesson("Dense layer backward", "Suy ra dX/dW/db shape.", "Cài Linear NumPy.", "Gradient check mọi tham số."),
      lesson("Activation/loss backward", "Ghép chain rule.", "Cài ReLU/softmax CE backward.", "Finite difference < 1e-5."),
      lesson("MLP NumPy", "Ghép layers và optimizer.", "Train XOR/spiral.", "Loss giảm và boundary hợp lý."),
      lesson("MLP PyTorch", "Ánh xạ hiểu biết sang nn.Module.", "Viết cùng kiến trúc PyTorch.", "So learning curves."),
    ],
    lab: { title: "Micrograd-style MLP", product: "MLP NumPy có unit tests/gradient checks.", acceptance: ["Không autograd ở bản from-scratch", "Tests pass", "Giải thích mọi shape"] },
    checkpoint: { title: "Backprop gate", passScore: 85, tasks: ["Suy ra gradient dense", "Code backward", "Vấn đáp chain rule"], retryRule: "Bắt buộc đạt gradient check trước tuần 19." },
    deliverable: "w18_mlp_from_scratch.ipynb + tests",
  }),
  defineWeek({
    week: 19,
    phaseId: "deep-learning",
    domain: "DL",
    title: "Regularization và Batch Normalization",
    focus: "Ổn định huấn luyện và tổng quát hóa mạng sâu.",
    prerequisites: ["MLP", "Bias–variance"],
    objectives: ["Dùng dropout/weight decay", "Dùng early stopping", "Hiểu train/eval của batch norm"],
    syllabusTopics: ["Dropout, Early Stopping, Weight Decay — Practice", "Batch Normalization — Practice"],
    lessons: [
      lesson("Weight decay trong DL", "So L2 với AdamW thực hành.", "Sweep decay có log.", "Theo dõi norm và val score."),
      lesson("Dropout", "Hiểu mask train và scaling.", "Cài dropout đơn giản.", "Test expectation/train/eval."),
      lesson("Early stopping", "Chọn patience/min_delta hợp lý.", "Cài callback nhỏ.", "Khôi phục best weights."),
      lesson("Batch normalization", "Theo dõi batch/running stats.", "Trace BN 1D.", "So train/eval và batch nhỏ."),
      lesson("Ablation regularization", "Tách đóng góp từng kỹ thuật.", "Thiết kế ma trận 2×2×2.", "Không đổi nhiều biến ngoài kế hoạch."),
    ],
    lab: { title: "Overfit rescue", product: "Cứu MLP overfit bằng ablation minh bạch.", acceptance: ["Có unregularized baseline", "Có best checkpoint", "Có ablation table"] },
    checkpoint: { title: "Regularization clinic", passScore: 75, tasks: ["Chẩn đoán curve", "Sửa train/eval bug", "Chọn technique theo lỗi"], retryRule: "Nếu chỉ tăng dropout mù, phải bổ sung diagnosis." },
    deliverable: "w19_regularization.ipynb",
  }),
  defineWeek({
    week: 20,
    phaseId: "deep-learning",
    domain: "DL",
    title: "Embeddings, pooling và autoencoders",
    focus: "Biểu diễn text/image/audio thành vector và học representation nén.",
    prerequisites: ["MLP", "Tensor shapes"],
    objectives: ["Dùng embedding lookup", "Dùng max/average pooling", "Train autoencoder"],
    syllabusTopics: ["Data Embeddings — Both", "Pooling Techniques — Both", "Autoencoders — Practice"],
    lessons: [
      lesson("Embedding lookup", "Hiểu index→dense vector.", "Cài lookup và cosine neighbors.", "Test padding index."),
      lesson("Image/audio patch embeddings", "Hiểu flatten/project theo patch/frame.", "Tạo patchify đơn giản.", "Unpatchify khôi phục shape."),
      lesson("Max/average pooling", "So invariance và mất thông tin.", "Cài pooling 1D/2D nhỏ.", "Tính tay window có tie."),
      lesson("Autoencoder", "Nối bottleneck với reconstruction.", "Train AE trên ảnh nhỏ.", "So latent size/loss."),
      lesson("Representation evaluation", "Đánh giá embedding bằng downstream task.", "Linear probe trên latent.", "So raw/PCA/AE công bằng."),
    ],
    lab: { title: "Representation zoo", product: "So PCA, learned embeddings và AE trên một bộ dữ liệu.", acceptance: ["Cùng split/metric", "Có retrieval demo", "Có reconstruction examples"] },
    checkpoint: { title: "Representation reasoning", passScore: 75, tasks: ["Trace shapes", "Chọn pooling", "Giải thích bottleneck"], retryRule: "Sửa mọi lỗi padding/shape trước khi học attention." },
    deliverable: "w20_representations.ipynb",
  }),
  defineWeek({
    week: 21,
    phaseId: "deep-learning",
    domain: "DL",
    title: "Attention Mechanism",
    focus: "Tính attention bằng tay, hiểu mask và đọc attention thận trọng.",
    prerequisites: ["Dot product", "Embeddings", "Softmax"],
    objectives: ["Tính scaled dot-product attention", "Dùng padding/causal mask", "Cài multi-head attention nhỏ"],
    syllabusTopics: ["Attention Mechanism — Both"],
    lessons: [
      lesson("Query, Key, Value", "Hiểu truy vấn–khóa–giá trị.", "Tính attention 3 token bằng NumPy.", "Weights tổng bằng 1."),
      lesson("Scaling và softmax", "Hiểu 1/sqrt(dk).", "So entropy có/không scale.", "Thử d lớn."),
      lesson("Padding/causal masks", "Ngăn đọc token cấm.", "Cài hai mask.", "Assert masked weight gần 0."),
      lesson("Multi-head attention", "Hiểu chia không gian biểu diễn.", "Cài projection/split/concat.", "Trace shape từng bước."),
      lesson("Giới hạn diễn giải", "Không đồng nhất attention với explanation.", "Tạo hai attention patterns cùng output.", "Viết phản biện 150 chữ."),
    ],
    lab: { title: "Attention microscope", product: "Widget nhập Q/K/V, mask và xem weights/output.", acceptance: ["Tính tay được mẫu", "Có mask tests", "Có shape annotations"] },
    checkpoint: { title: "Attention mechanics", passScore: 85, tasks: ["Tính ma trận attention", "Code mask", "Trace multi-head shapes"], retryRule: "Phải đạt toàn bộ shape/mask tests." },
    deliverable: "w21_attention.ipynb",
  }),
  defineWeek({
    week: 22,
    phaseId: "deep-learning",
    domain: "DL",
    title: "Transformers và fine-tuning",
    focus: "Hiểu kiến trúc transformer cho text/image và thích nghi mô hình có sẵn.",
    prerequisites: ["Attention", "PyTorch"],
    objectives: ["Vẽ encoder/decoder block", "Phân biệt full/parameter-efficient fine-tuning", "Chạy fine-tune nhỏ"],
    syllabusTopics: ["Transformers (theory for text and image) — Both", "Model Finetuning: full & parameter-efficient — Practice"],
    lessons: [
      lesson("Transformer encoder block", "Trace residual/norm/attention/MLP.", "Cài block nhỏ hoặc ghép module.", "Annotate tensor shapes."),
      lesson("Decoder và causal modeling", "Hiểu shifted targets/causal mask.", "Tạo toy next-token batch.", "Không leakage token tương lai."),
      lesson("Positional information", "Biết vì sao attention cần vị trí.", "So no-position với encoding.", "Permutation test."),
      lesson("Full fine-tuning và transfer", "Thiết lập head/lr/freeze hợp lý.", "Fine-tune encoder nhỏ.", "So frozen vs full."),
      lesson("PEFT/LoRA", "Hiểu low-rank adapters ở mức dùng.", "Tính trainable params và chạy adapter nếu đủ máy.", "Báo memory/time/score."),
    ],
    lab: { title: "Tiny transformer adaptation", product: "Fine-tuning experiment có baseline, resource log và model card.", acceptance: ["Không test leakage", "Có parameter count", "Có failure analysis"] },
    checkpoint: { title: "DL foundation defense", passScore: 80, tasks: ["Vẽ transformer", "Trace shapes/masks", "Chọn full vs PEFT"], retryRule: "Không qua nếu không giải thích được residual hoặc causal mask." },
    deliverable: "w22_transformer_finetune.ipynb",
    milestone: "M3 — Tự viết training loop, backprop/attention cốt lõi và thích nghi transformer nhỏ.",
  }),
  defineWeek({
    week: 23,
    phaseId: "computer-vision",
    domain: "CV",
    title: "Ảnh, convolution và augmentation",
    focus: "Từ pixel/patch đến convolutional feature maps.",
    prerequisites: ["Tensor/pooling", "PyTorch loop"],
    objectives: ["Trace convolution", "Cài conv nhỏ", "Dùng augmentation train-only"],
    syllabusTopics: ["Convolutional Layers — Both", "Image Augmentation — Practice", "Image patching/data processing — Practice"],
    lessons: [
      lesson("Pixel, channel và normalization", "Đọc HWC/CHW/range.", "Viết loader kiểm tra ảnh.", "Test grayscale/RGBA/corrupt."),
      lesson("Convolution 2D", "Tính kernel, stride, padding.", "Cài conv 2D toy bằng loop.", "So torch output."),
      lesson("Feature maps và receptive field", "Hiểu hierarchy không gian.", "Vẽ activation maps.", "Tính receptive field nhỏ."),
      lesson("Pooling và patching", "So CNN pooling với image patches.", "Cài patchify ảnh.", "Khôi phục/kiểm shape."),
      lesson("Augmentation hợp lệ", "Chọn flip/crop/noise theo nhãn.", "Tạo pipeline train/eval riêng.", "Nêu 3 augmentation phá nhãn."),
    ],
    lab: { title: "CNN shape explorer", product: "Widget/kernel demo + augmentation gallery.", acceptance: ["Có conv from scratch", "Trace shape đúng", "Không augment validation"] },
    checkpoint: { title: "CNN mechanics", passScore: 80, tasks: ["Tính output shape", "Trace kernel", "Audit augmentation"], retryRule: "Phải đạt 100% shape questions." },
    deliverable: "w23_convolution.ipynb",
  }),
  defineWeek({
    week: 24,
    phaseId: "computer-vision",
    domain: "CV",
    title: "Image Classification và ResNet",
    focus: "Xây classifier, dùng pre-trained vision encoder và phân tích lỗi theo lớp.",
    prerequisites: ["Convolution", "Fine-tuning"],
    objectives: ["Train CNN classifier", "Fine-tune ResNet", "Phân tích confusion/error slices"],
    syllabusTopics: ["Image Classification — Practice", "Pre-trained Vision Encoders e.g. ResNet — Practice"],
    lessons: [
      lesson("Classification pipeline", "Dựng folder/dataset/split stratified.", "Train tiny CNN baseline.", "Kiểm class mapping."),
      lesson("Residual connections", "Hiểu skip connection.", "Cài residual block.", "Test shape projection."),
      lesson("Pretrained ResNet", "Chuẩn hóa đúng weights.", "Linear probe encoder.", "So random init."),
      lesson("Fine-tuning chiến lược", "Freeze/unfreeze và lr theo layer.", "Chạy hai chiến lược.", "Ghi resource/score."),
      lesson("CV error analysis", "Nhóm lỗi theo lớp/chất lượng.", "Tạo confusion + 20 ảnh lỗi.", "Đề xuất action có test."),
    ],
    lab: { title: "Species classifier", product: "ResNet baseline, fine-tune, model card.", acceptance: ["Split không trùng gần-duplicate", "Có per-class metric", "Có error gallery"] },
    checkpoint: { title: "Classification sprint", passScore: 75, tasks: ["Dựng baseline 30 phút", "Sửa preprocessing mismatch", "Vấn đáp residual"], retryRule: "Không qua nếu class mapping hoặc normalization không tái lập." },
    deliverable: "w24_image_classifier.ipynb",
  }),
  defineWeek({
    week: 25,
    phaseId: "computer-vision",
    domain: "CV",
    title: "Object Detection: YOLO, SSD và DETR",
    focus: "Hiểu box, matching, NMS và sử dụng detector có sẵn.",
    prerequisites: ["CNN classification", "IoU cơ bản"],
    objectives: ["Chuẩn hóa boxes", "Đọc precision/recall/mAP", "Fine-tune detector pretrained trên tiny subset có ngân sách"],
    syllabusTopics: ["Object Detection: YOLO, SSD, DETR (PDF syllabus ghi DERT) — Practice"],
    lessons: [
      lesson("Box formats và IoU", "Đổi xyxy/xywh/normalized.", "Cài IoU.", "Test boxes không giao/bao nhau."),
      lesson("Anchors, proposals và matching", "Hiểu assignment positive/negative.", "Match boxes trên toy data.", "Kiểm threshold edge."),
      lesson("NMS và confidence", "Loại dự đoán trùng.", "Cài NMS từ đầu.", "So kết quả thư viện."),
      lesson("YOLO/SSD/DETR", "So one-stage/anchor/transformer detector.", "Lập bảng kiến trúc–tradeoff.", "Chọn theo latency/data."),
      lesson("mAP và error analysis", "Đọc AP theo IoU/class.", "Đánh giá detector nhỏ.", "Phân loại localization/class/background errors."),
    ],
    lab: { title: "Tiny object detector", product: "Fine-tune detector pretrained trong số batch/epoch cố định trên tiny subset, rồi xuất visual predictions + mAP report.", acceptance: ["Box validation", "Không augment sai box", "Có latency và per-class AP"] },
    checkpoint: { title: "Detection mechanics", passScore: 75, tasks: ["Code IoU/NMS", "Trace matching", "Đọc AP curve"], retryRule: "Phải pass toàn bộ geometry tests." },
    deliverable: "w25_object_detection.ipynb",
  }),
  defineWeek({
    week: 26,
    phaseId: "computer-vision",
    domain: "CV",
    title: "Image Segmentation với U-Net",
    focus: "Dự đoán mask cấp pixel và đánh giá Dice/IoU đúng.",
    prerequisites: ["CNN", "Detection geometry"],
    objectives: ["Chuẩn bị mask", "Hiểu encoder–decoder/skip", "Train và đánh giá U-Net"],
    syllabusTopics: ["Image Segmentation: U-Net — Practice"],
    lessons: [
      lesson("Mask và task types", "Phân biệt semantic/instance.", "Kiểm mask class/palette.", "Overlay 20 samples."),
      lesson("U-Net architecture", "Trace down/up path và skip.", "Vẽ/cài U-Net nhỏ.", "Assert shapes concat."),
      lesson("Loss cho segmentation", "Dùng CE/BCE/Dice theo bài.", "Cài Dice loss.", "Test empty mask."),
      lesson("Augmentation đồng bộ", "Biến đổi ảnh/mask cùng hình học.", "Tạo paired pipeline.", "Pixel alignment test."),
      lesson("Metrics và postprocess", "Đo IoU/Dice per class.", "Tuning threshold/morphology trên val.", "Không dùng test."),
    ],
    lab: { title: "Road-mask U-Net", product: "U-Net + overlay gallery + per-class metrics.", acceptance: ["Paired augmentation", "Empty-mask handling", "Có baseline"] },
    checkpoint: { title: "Segmentation gate", passScore: 75, tasks: ["Trace U-Net shapes", "Code Dice", "Audit mask pipeline"], retryRule: "Phải sửa alignment trước mọi tuning model." },
    deliverable: "w26_unet_segmentation.ipynb",
  }),
  defineWeek({
    week: 27,
    phaseId: "computer-vision",
    domain: "CV",
    title: "Generative Adversarial Networks",
    focus: "Dùng GAN ở mức thực hành, hiểu trò chơi generator–discriminator và failure modes.",
    prerequisites: ["CNN", "Loss/optimization"],
    objectives: ["Train DCGAN nhỏ", "Nhận biết mode collapse", "Đánh giá mẫu không cherry-pick"],
    syllabusTopics: ["Generating Images with GANs — Practice"],
    lessons: [
      lesson("Minimax game", "Hiểu vai trò G/D.", "Trace loss trên toy scores.", "Giải thích equilibrium trực giác."),
      lesson("Generator/discriminator", "Thiết kế shapes ảnh nhỏ.", "Cài DCGAN modules.", "Unit test output/range."),
      lesson("Training loop GAN", "Tách update G/D.", "Viết loop có detach đúng.", "Theo dõi gradient flow."),
      lesson("Instability và mode collapse", "Nhận biết loss không đủ.", "Tạo fixed-noise gallery.", "Đo diversity đơn giản."),
      lesson("Đánh giá và ethics", "Không cherry-pick; ghi nguồn data.", "Tạo grid theo checkpoint.", "Model card nêu rủi ro."),
    ],
    lab: { title: "Small-image GAN", product: "DCGAN + fixed-seed evolution + failure report.", acceptance: ["Có checkpoint", "Không cherry-pick", "Có diversity evidence"] },
    checkpoint: { title: "GAN practice", passScore: 70, tasks: ["Trace detach", "Sửa update order", "Chẩn đoán collapse"], retryRule: "Ưu tiên loop đúng hơn ảnh đẹp." },
    deliverable: "w27_gan.ipynb + responsible_use.md",
  }),
  defineWeek({
    week: 28,
    phaseId: "computer-vision",
    domain: "CV",
    title: "Self-Supervised Learning for Vision",
    focus: "Học representation từ ảnh không nhãn và đánh giá bằng linear probe.",
    prerequisites: ["ResNet", "Augmentation", "Embeddings"],
    objectives: ["Hiểu pretext/contrastive idea", "Dùng augmentation pairs", "So frozen encoder với supervised baseline"],
    syllabusTopics: ["Self-Supervised Learning for Vision — Practice"],
    lessons: [
      lesson("Pretext và representation", "Phân biệt objective pretrain/downstream.", "Thiết kế 3 pretext tasks.", "Nêu shortcut risk."),
      lesson("Positive/negative pairs", "Hiểu invariance do augmentation.", "Tạo paired views.", "Visual audit 64 pairs."),
      lesson("Contrastive loss thực hành", "Dùng similarity/temperature.", "Cài toy NT-Xent hoặc dùng library.", "Test diagonal positives."),
      lesson("Pretraining loop", "Train encoder nhỏ.", "Chạy toy pretrain ngắn có checkpoint hoặc dùng checkpoint pretrained được chỉ định.", "Theo dõi collapse metrics."),
      lesson("Linear probing", "Đo chất lượng representation công bằng.", "Cache embeddings, freeze encoder và train head.", "So random/supervised/SSL trên cùng split."),
    ],
    lab: { title: "Label-scarce vision", product: "Toy SSL run ngắn + linear probes trên embeddings đã cache + label-efficiency curve; full pretrain là mở rộng ngoài phiên 60 phút.", acceptance: ["Encoder frozen khi probe", "Cùng split", "Có nhiều label budgets"] },
    checkpoint: { title: "SSL reasoning", passScore: 70, tasks: ["Chọn augmentations", "Trace contrastive batch", "Đọc probe table"], retryRule: "Nếu có shortcut, sửa views trước model." },
    deliverable: "w28_vision_ssl.ipynb",
  }),
  defineWeek({
    week: 29,
    phaseId: "computer-vision",
    domain: "Multimodal",
    title: "Vision–Text Encoders với CLIP",
    focus: "Ghép không gian ảnh–văn bản cho zero-shot classification và retrieval.",
    prerequisites: ["Embeddings", "Attention", "Image classification"],
    objectives: ["Dùng CLIP embeddings", "Thiết kế prompts", "Đánh giá retrieval/zero-shot"],
    syllabusTopics: ["Vision-text Encoders e.g. CLIP — Practice"],
    lessons: [
      lesson("Dual encoder", "Hiểu image/text towers và shared space.", "Trích embeddings từ model có sẵn.", "Normalize và kiểm shape."),
      lesson("Contrastive alignment", "Hiểu similarity matrix.", "Tính logits ảnh–text.", "Đúng cặp nằm diagonal."),
      lesson("Zero-shot classification", "Biến class thành prompts.", "So 5 prompt templates.", "Không chọn prompt trên test."),
      lesson("Cross-modal retrieval", "Đánh giá Recall@K.", "Cài image↔text retrieval.", "Phân tích 20 lỗi."),
      lesson("Bias và domain shift", "Nhận biết prompt/data bias.", "Tạo slice theo bối cảnh.", "Ghi hạn chế trong model card."),
    ],
    lab: { title: "CLIP semantic search", product: "Demo tìm ảnh bằng câu tiếng Việt/Anh + evaluation.", acceptance: ["Có Recall@K", "Có prompt ablation", "Có bias notes"] },
    checkpoint: { title: "Vision-language practice", passScore: 70, tasks: ["Tính similarity", "Thiết kế zero-shot prompts", "Phân tích retrieval errors"], retryRule: "Không qua nếu chỉ demo mà không evaluation." },
    deliverable: "w29_clip_retrieval.ipynb",
  }),
  defineWeek({
    week: 30,
    phaseId: "computer-vision",
    domain: "CV",
    title: "Diffusion Models",
    focus: "Dùng diffusion ở mức thực hành, quan sát forward noise/reverse denoising và điều kiện hóa.",
    prerequisites: ["Probability", "CNN/U-Net", "Generative models"],
    objectives: ["Mô phỏng forward diffusion", "Chạy pretrained pipeline", "Đánh giá seed/prompt/resource"],
    syllabusTopics: ["Diffusion Models — Practice"],
    lessons: [
      lesson("Forward noising", "Hiểu schedule và x_t.", "Mô phỏng thêm noise theo t.", "Vẽ cùng ảnh qua timesteps."),
      lesson("Denoising objective", "Hiểu model dự đoán noise ở mức thực hành.", "Train toy denoiser hoặc trace pretrained.", "Kiểm target shape."),
      lesson("Sampling", "Hiểu iterative reverse process.", "Chạy pipeline nhỏ nhiều steps.", "So quality/time."),
      lesson("Conditioning và guidance", "Điều khiển mẫu bằng text/class.", "Sweep guidance scale.", "Giữ seed cố định."),
      lesson("Evaluation/safety", "Không đánh giá qua một ảnh đẹp.", "Tạo prompt×seed grid.", "Ghi nguồn, license, bias."),
    ],
    lab: { title: "Diffusion parameter studio", product: "Gallery có kiểm soát seed/steps/guidance và report.", acceptance: ["Controlled grid", "Resource log", "Safety/model card"] },
    checkpoint: { title: "Diffusion practice", passScore: 70, tasks: ["Trace forward process", "Chọn sampling budget", "Phản biện gallery"], retryRule: "Nếu không đủ GPU, dùng toy 1D/ảnh nhỏ nhưng vẫn phải hoàn tất logic." },
    deliverable: "w30_diffusion.ipynb",
  }),
  defineWeek({
    week: 31,
    phaseId: "computer-vision",
    domain: "Project",
    title: "Dự án 2 — CV competition sprint",
    focus: "Giải một bài CV mù theo quy trình VOAI, từ raw data đến notebook/report.",
    prerequisites: ["Tuần 23–30"],
    objectives: ["Chọn đúng CV task", "Dựng pretrained baseline nhanh", "Ablation và error analysis có giới hạn tài nguyên"],
    syllabusTopics: ["CV synthesis: classification/detection/segmentation/generation/vision-text"],
    lessons: [
      lesson("Data audit và split", "Kiểm duplicate/group/leakage.", "Viết CV data card.", "Hash/perceptual audit."),
      lesson("Pretrained baseline", "Có submission sớm.", "Dựng encoder/task head phù hợp.", "Smoke test nhỏ trước full run."),
      lesson("Augmentation/finetune ablation", "Đổi một biến mỗi trial.", "Chạy tối đa 10 trials.", "Ledger đầy đủ."),
      lesson("Error-driven improvement", "Ưu tiên sửa lỗi lớn.", "Tạo gallery theo slice.", "Mỗi cải tiến gắn hypothesis."),
      lesson("Packaging và report", "Notebook chạy từ raw→submission.", "Dọn state ẩn và viết report.", "Run all runtime sạch."),
    ],
    lab: { title: "Blind CV challenge", product: "Notebook Colab/Kaggle + weights/config + report.", acceptance: ["Dữ liệu đúng quy định", "Submission tự sinh", "Có resource budget", "Có ablation"] },
    checkpoint: { title: "CV defense", passScore: 80, tasks: ["Demo runtime sạch", "Vấn đáp 10 phút", "Sửa một bug preprocessing trực tiếp"], retryRule: "Không qua nếu kết quả không tái lập hoặc chỉ dựa pretrained black box." },
    deliverable: "project_02_cv/ đầy đủ notebook, report, model card, submission",
    milestone: "M4 — Hoàn tất dự án CV thi đấu và bảo vệ được pipeline/metric/lỗi.",
  }),
  defineWeek({
    week: 32,
    phaseId: "nlp-audio",
    domain: "NLP",
    title: "Text processing và classification",
    focus: "Xây pipeline văn bản từ tokenization/vocabulary/padding đến baseline classifier.",
    prerequisites: ["Embeddings", "Classification metrics"],
    objectives: [
      "Tokenize/build vocab",
      "Padding/mask variable length",
      "So TF-IDF với neural baseline",
      "Qua cổng luyện sơ loại trước tháng 4 bằng mock 180 phút theo mốc tham chiếu VOAI 2026; không suy đoán format 2027",
    ],
    syllabusTopics: ["Text Classification — Practice", "Tokenization & vocabulary — Data Processing"],
    lessons: [
      lesson("Text normalization", "Không xóa tín hiệu mù quáng.", "Viết normalizer có tests Unicode.", "Giữ raw text và audit diff."),
      lesson("Tokenization và vocabulary", "Hiểu word/subword/OOV.", "Cài tokenizer/vocab nhỏ.", "Test dấu tiếng Việt/OOV."),
      lesson("Padding, truncation, masks", "Batch chuỗi độ dài khác nhau.", "Viết collate_fn.", "Mask padding không ảnh hưởng pooling."),
      lesson("TF-IDF baseline", "Có baseline mạnh, nhanh.", "Train linear text classifier.", "N-gram ablation."),
      lesson("Embedding + pooling classifier", "Ghép embedding và mask pooling.", "Train neural baseline.", "So công bằng TF-IDF."),
    ],
    lab: { title: "Vietnamese text classifier", product: "Hai baselines + slice analysis theo độ dài/OOV.", acceptance: ["Stratified/group split", "Unicode tests", "Có macro-F1"] },
    checkpoint: {
      title: "Cổng sơ loại tham chiếu",
      passScore: 75,
      tasks: [
        "Làm một mạch mock trắc nghiệm trên máy 180 phút, đóng tài liệu, theo định dạng VOAI 2026 chỉ để luyện",
        "Chấm theo từng miền kiến thức và lập error ledger thay vì chỉ ghi tổng điểm",
        "Gắn nhãn VOAI 2027 TBD; khi có thông báo chính thức phải cập nhật ma trận khác biệt trước lần luyện kế tiếp",
      ],
      retryRule: "Nếu dưới 75/100 nội bộ hoặc có miền dưới 60%, sửa ba lỗ hổng lớn nhất rồi làm một đề tương đương mới; đây không phải ngưỡng tuyển chọn chính thức.",
      extendedMinutes: 180,
    },
    deliverable: "w32_text_classification.ipynb + readiness/preliminary_reference_2026/scorecard.md",
    milestone: "R1 — Trước 01/04/2027: hoàn thành mock sơ loại 180 phút theo mốc VOAI 2026; format, lịch và ngưỡng VOAI 2027 vẫn TBD đến khi BTC công bố.",
  }),
  defineWeek({
    week: 33,
    phaseId: "nlp-audio",
    domain: "NLP",
    title: "Pre-trained Text Encoders: BERT",
    focus: "Hiểu encoder BERT và fine-tune/linear-probe cho downstream task.",
    prerequisites: ["Transformer", "Text classification"],
    objectives: ["Hiểu special tokens/masks", "Dùng BERT embeddings", "Fine-tune có layer-wise strategy"],
    syllabusTopics: ["Pre-trained Text Encoders e.g. BERT — Both"],
    lessons: [
      lesson("BERT encoder và pretraining", "Hiểu bidirectional masked modeling.", "Vẽ data flow BERT.", "Phân biệt với causal LM."),
      lesson("Tokenizer/special tokens", "Tạo input_ids/attention_mask.", "Trace một câu tiếng Việt.", "Kiểm truncation/padding."),
      lesson("CLS vs pooling", "Chọn sentence representation.", "So CLS/mean pooling.", "Mask-aware pooling."),
      lesson("Linear probe/fine-tune", "So frozen encoder với full tune.", "Chạy hai cấu hình.", "Cùng split/seed."),
      lesson("Error/bias analysis", "Phân tích theo độ dài/chủ đề.", "Tạo 4 slices.", "Ghi domain limits."),
    ],
    lab: { title: "BERT adaptation", product: "Frozen vs fine-tuned BERT classifier + model card.", acceptance: ["Mask đúng", "Có baseline TF-IDF", "Có resource/score table"] },
    checkpoint: { title: "BERT theory & practice", passScore: 75, tasks: ["Trace tokens/masks", "Giải thích bidirectional", "Chọn tuning strategy"], retryRule: "Không qua nếu nhầm causal và masked modeling." },
    deliverable: "w33_bert.ipynb",
  }),
  defineWeek({
    week: 34,
    phaseId: "nlp-audio",
    domain: "NLP",
    title: "Language Modeling",
    focus: "Tạo dữ liệu next-token, tính perplexity và sinh văn bản có đánh giá.",
    prerequisites: ["Transformer decoder", "Tokenization"],
    objectives: ["Dùng causal targets", "Tính cross-entropy/perplexity", "Train tiny LM hoặc fine-tune nhỏ"],
    syllabusTopics: ["Language Modeling — Both"],
    lessons: [
      lesson("N-gram đến neural LM", "Hiểu xác suất chuỗi.", "Cài bigram baseline.", "Kiểm tổng xác suất."),
      lesson("Shifted inputs/targets", "Ngăn target leakage.", "Tạo batches causal.", "Trace 2 sequences."),
      lesson("Cross-entropy và perplexity", "Đọc perplexity đúng miền.", "Tính tay/code.", "So datasets cùng tokenizer."),
      lesson("Sampling", "Dùng temperature/top-k/top-p.", "Cài sampler.", "Giữ seed và so diversity."),
      lesson("Evaluation và hallucination", "Tách fluency/factuality/safety.", "Thiết kế rubric 20 prompts.", "Không chấm chỉ bằng cảm giác."),
    ],
    lab: { title: "Tiny Vietnamese LM", product: "Bigram/tiny transformer LM + controlled generation report.", acceptance: ["Không leakage", "Có perplexity", "Có prompt rubric"] },
    checkpoint: { title: "LM mechanics", passScore: 80, tasks: ["Trace shifted batch", "Tính perplexity", "Sửa sampler"], retryRule: "Bắt buộc sửa hết leakage trước khi huấn luyện lại." },
    deliverable: "w34_language_model.ipynb",
  }),
  defineWeek({
    week: 35,
    phaseId: "nlp-audio",
    domain: "Multimodal",
    title: "Encoder–Decoder, dịch máy và vision-language",
    focus: "Dùng mô hình seq2seq cho translation/captioning, hiểu teacher forcing và decoding.",
    prerequisites: ["Attention", "Language modeling"],
    objectives: ["Trace encoder–decoder", "Dùng teacher forcing đúng", "Đánh giá generation nhiều chiều"],
    syllabusTopics: ["Encoder-Decoder Models for MT/VLM — Practice"],
    lessons: [
      lesson("Seq2seq data flow", "Phân biệt encoder/decoder states.", "Vẽ shapes cho batch.", "Trace source/target masks."),
      lesson("Teacher forcing", "Hiểu train/inference mismatch.", "Tạo decoder inputs/labels.", "Test BOS/EOS/padding."),
      lesson("Greedy và beam search", "So chất lượng/chi phí.", "Cài toy beam search.", "Trace beams 3 bước."),
      lesson("Machine translation metrics", "Dùng BLEU/chrF kèm human checks.", "Đánh giá sample outputs.", "Nêu giới hạn metric."),
      lesson("Vision-language encoder-decoder", "Ghép vision encoder và text decoder.", "Chạy captioning model có sẵn.", "Phân tích hallucinated objects."),
    ],
    lab: { title: "Translation/captioning lab", product: "Seq2seq inference + decoding ablation + error taxonomy.", acceptance: ["Mask đúng", "Có automatic + human rubric", "Có hallucination analysis"] },
    checkpoint: { title: "Seq2seq practice", passScore: 75, tasks: ["Trace masks", "Code beam search toy", "Chọn metric"], retryRule: "Phải pass BOS/EOS/padding tests." },
    deliverable: "w35_encoder_decoder.ipynb",
  }),
  defineWeek({
    week: 36,
    phaseId: "nlp-audio",
    domain: "NLP",
    title: "Pre-trained Language Models: open-source và API",
    focus: "Dùng LLM có sẵn như một thành phần được đo lường, không thay thế năng lực tự code.",
    prerequisites: ["Language modeling", "Evaluation"],
    objectives: ["Chạy model open-source/API", "Thiết kế prompt/eval set", "Quản lý cost, reproducibility, safety"],
    syllabusTopics: ["Pre-trained Language Models: open-source & API-based — Practice"],
    lessons: [
      lesson("Model/API contract", "Hiểu context, output, sampling.", "Viết adapter interface.", "Mock API test không mạng."),
      lesson("Prompt baseline", "Tạo prompt tối giản trước tối ưu.", "Chạy fixed eval set.", "Version prompt/model/settings."),
      lesson("Structured output", "Parse JSON và retry an toàn.", "Viết schema validator.", "Test malformed output."),
      lesson("Open-source inference", "Đọc tokenizer/device/quantization.", "Chạy model nhỏ nếu đủ máy.", "Log latency/memory."),
      lesson("Evaluation, cost, safety", "Tạo rubric chống cherry-pick.", "So 2 models/prompts blind.", "Có privacy/failure policy."),
    ],
    lab: { title: "LLM evaluator, not answerer", product: "Ứng dụng phân loại/trích xuất có eval harness.", acceptance: ["Học sinh tự code adapter/eval", "Không gửi dữ liệu nhạy cảm", "Có cost/error report"] },
    checkpoint: { title: "LLM engineering", passScore: 75, tasks: ["Sửa parser", "Thiết kế eval", "Giải thích reproducibility"], retryRule: "Không qua nếu demo không có test set cố định." },
    deliverable: "w36_pretrained_lm.ipynb + eval_cases.json",
  }),
  defineWeek({
    week: 37,
    phaseId: "nlp-audio",
    domain: "Audio",
    title: "Audio processing và HuBERT",
    focus: "Từ waveform/spectrogram/frames đến pre-trained audio embeddings.",
    prerequisites: ["Signals ở mức cơ bản", "Embeddings", "PyTorch"],
    objectives: ["Đọc/resample audio", "Tạo spectrogram/padding mask", "Dùng HuBERT encoder"],
    syllabusTopics: ["Pre-trained Audio Encoders: HuBERT — Practice", "Audio tokenization/vocabulary & variable-length processing"],
    lessons: [
      lesson("Waveform, sample rate, channels", "Đọc duration/amplitude.", "Viết loader/resampler nhỏ.", "Test mono/stereo/rate khác."),
      lesson("Framing, STFT, spectrogram", "Nối time↔frequency.", "Vẽ waveform/spectrogram.", "Thay window/hop và giải thích."),
      lesson("Audio augmentation", "Dùng noise/gain/time shift hợp nhãn.", "Tạo paired gallery nghe/nhìn.", "Không augment validation."),
      lesson("Variable length và masks", "Pad/collate audio đúng.", "Viết collate_fn.", "Mask padding trong pooling."),
      lesson("HuBERT embeddings", "Dùng pretrained encoder.", "Trích frame/utterance vectors.", "Linear probe nhỏ."),
    ],
    lab: { title: "Sound embedding explorer", product: "Audio loader + spectrogram + HuBERT retrieval/classifier.", acceptance: ["Sample-rate audit", "Mask đúng", "Có baseline handcrafted"] },
    checkpoint: { title: "Audio foundation", passScore: 75, tasks: ["Tính duration", "Trace STFT shapes", "Sửa padding mask"], retryRule: "Phải pass mixed sample-rate/length tests." },
    deliverable: "w37_audio_hubert.ipynb",
  }),
  defineWeek({
    week: 38,
    phaseId: "nlp-audio",
    domain: "Audio",
    title: "Whisper, Qwen-Audio và Voxtral",
    focus: "Sử dụng ASR/audio-language models, đánh giá WER và lỗi theo điều kiện âm thanh.",
    prerequisites: ["Audio processing", "Encoder-decoder/LLM eval"],
    objectives: [
      "Chạy Whisper ASR",
      "Khảo sát Qwen-Audio/Voxtral",
      "Đo WER/latency/error slices",
      "Hoàn thành mock lập trình 6 giờ ML/CV/NLP đầu tháng 5 theo mốc tham chiếu VOAI 2026",
    ],
    syllabusTopics: ["Audio Models: Qwen-Audio, Whisper, Voxtral — Practice"],
    lessons: [
      lesson("ASR pipeline và Whisper", "Hiểu chunk/language/decoding.", "Transcribe fixed audio set.", "Log model/settings."),
      lesson("WER/CER", "Cài edit distance metric.", "Tính WER/CER từ đầu.", "Test empty/repeated words."),
      lesson("Long/noisy audio", "Chunk/VAD và ghép transcript.", "So chunk sizes/noise levels.", "Phân tích deletion/substitution."),
      lesson("Qwen-Audio và Voxtral", "Biết input/output/use cases.", "Chạy model khả dụng hoặc adapter mock.", "Ghi rõ điều gì chưa chạy vì tài nguyên."),
      lesson("Audio-language safety", "Kiểm accent/privacy/hallucination.", "Tạo 4 error slices.", "Không tải audio cá nhân không đồng ý."),
    ],
    lab: { title: "Vietnamese ASR benchmark", product: "Benchmark Whisper + adapter Qwen-Audio/Voxtral + error report.", acceptance: ["Có WER/CER", "Có latency/resource", "Không tuyên bố model chưa chạy"] },
    checkpoint: {
      title: "Mock chung kết 6 giờ tham chiếu",
      passScore: 80,
      tasks: [
        "Làm một mạch mock lập trình 6 giờ gồm ML, CV và NLP theo định dạng VOAI 2026 chỉ để luyện",
        "Tạo submission hợp lệ, notebook Colab/Kaggle chạy từ trạng thái sạch, report và submission ledger cho từng track",
        "Audit dữ liệu, leakage, metric và giới hạn tài nguyên; ghi rõ lịch, luật, số bài và cách chấm VOAI 2027 đều TBD nếu chưa có thông báo",
      ],
      retryRule: "Nếu submission/notebook không hợp lệ thì checkpoint bằng 0; nếu dưới 80/100 nội bộ, sửa theo error ledger và chạy lại đúng block yếu bằng đề mới.",
      extendedMinutes: 360,
    },
    deliverable: "w38_audio_models.ipynb + benchmark.csv + readiness/final_reference_2026/",
    milestone: "M5/R2 — Trước 08/05/2027: hoàn tất NLP/Audio stack và một mock chung kết 6 giờ theo mốc VOAI 2026; không coi đây là xác nhận format VOAI 2027.",
  }),
  defineWeek({
    week: 39,
    phaseId: "integration",
    domain: "Multimodal",
    title: "Time-series, video và dữ liệu đa phương thức",
    focus: "Áp dụng các phương pháp đã học cho chuỗi, video và dữ liệu irregular/ragged.",
    prerequisites: ["Data processing", "CNN/transformer/audio"],
    objectives: ["Split chuỗi theo thời gian", "Tạo window/padding", "Fusion nhiều modality không leakage"],
    syllabusTopics: ["Data may be text, tabular, image, audio, video, time-series", "Missing/irregular data, sliding windows, padding, noise/cropping"],
    lessons: [
      lesson("Time-series split/window", "Ngăn nhìn tương lai.", "Cài sliding windows.", "Assert max train time < min val time."),
      lesson("Missing/irregular sequences", "Impute kèm missingness indicators.", "So mean/median/forward-fill.", "Fit statistics train-only."),
      lesson("Video sampling", "Biểu diễn video bằng frames/clips.", "Tạo sampler và pooled features.", "Test duration/fps khác."),
      lesson("Early/late fusion", "Ghép modality ở feature/decision level.", "So hai fusion baselines.", "Ablate từng modality."),
      lesson("Missing modality và deployment", "Xử lý text/audio/image vắng.", "Thiết kế fallback/mask.", "Test mọi tổ hợp thiếu."),
    ],
    lab: { title: "Multimodal mini-project", product: "Pipeline 2+ modalities có ablation và missing-modality tests.", acceptance: ["Không temporal leakage", "Có unimodal baselines", "Có fallback"] },
    checkpoint: { title: "Data-shape integration", passScore: 75, tasks: ["Audit time split", "Trace fusion shapes", "Sửa missing modality"], retryRule: "Phải sửa leakage trước mọi cải tiến điểm." },
    deliverable: "w39_multimodal.ipynb",
  }),
  defineWeek({
    week: 40,
    phaseId: "competition-project",
    domain: "VOAI",
    title: "VOAI remediation và thích nghi thông báo chính thức",
    focus: "Sửa đúng lỗ hổng từ hai cổng readiness, tái chạy block yếu và chỉ đổi runbook khi có tài liệu VOAI 2027 chính thức.",
    prerequisites: ["Tuần 1–39", "Cổng sơ loại W32", "Mock chung kết 6 giờ W38", "Hai dự án đã bảo vệ"],
    objectives: [
      "Đóng ba lỗ hổng lớn nhất từ error ledger",
      "Tái chạy các block ML/CV/NLP trong giới hạn 60 phút mỗi block",
      "Đối chiếu thông báo VOAI 2027 nếu đã công bố, không tự giả định lịch, luật, số bài hoặc thời lượng",
    ],
    syllabusTopics: ["Competition remediation trên IOAI 2026 coverage", "VOAI 2027 format/rules — TBD đến khi có nguồn chính thức"],
    lessons: [
      lesson("Audit hai readiness gate", "Biến scorecard thành danh sách lỗi có thứ tự.", "Chọn ba lỗi theo impact×frequency.", "Mỗi lỗi có evidence và stop rule."),
      lesson("ML remediation block", "Dựng lại baseline tabular/time-series trong 60 phút.", "Tạo valid submission từ runtime sạch.", "Không test leakage."),
      lesson("CV remediation block", "Sửa đúng failure slice lớn nhất.", "Tái chạy pretrained baseline + error gallery.", "Smoke test trước full run."),
      lesson("NLP remediation block", "Sửa đúng lỗi tokenization/mask/metric.", "Tái chạy text baseline và submission.", "Mask/tokenization tests."),
      lesson("Rules-diff và submission discipline", "Chỉ thay runbook theo nguồn chính thức.", "Lập bảng mốc 2026 tham chiếu ↔ thông báo 2027 hoặc ghi TBD.", "Mọi submit có hypothesis và ledger."),
    ],
    lab: { title: "Targeted three-block retest", product: "Ba block ML/CV/NLP 60 phút dựa trên lỗi thật, mỗi block có raw→submission và evidence.", acceptance: ["Ba lỗi ưu tiên được retest", "Submission hợp lệ", "Notebook/report tái lập", "Không tuyên bố quy chế 2027 khi chưa có nguồn"] },
    checkpoint: { title: "Competition readiness audit", passScore: 80, tasks: ["Judge ba notebook/block", "Vấn đáp rules-diff/TBD", "Reproduce một run được chọn ngẫu nhiên"], retryRule: "Nếu invalid submission/notebook hoặc tự suy đoán quy chế 2027, điểm tuần bằng 0 và phải sửa evidence trước khi chạy thêm." },
    deliverable: "readiness/remediation/ gồm scorecards, 3 block retests, rules-diff, submissions và report",
  }),
  defineWeek({
    week: 41,
    phaseId: "competition-project",
    domain: "Project",
    title: "Capstone và hồ sơ năng lực",
    focus: "Chốt một dự án AI có người dùng, metric, demo, tài liệu và bảo vệ kỹ thuật.",
    prerequisites: ["Tuần 1–40", "Chọn vấn đề và dữ liệu hợp pháp"],
    objectives: ["Hoàn thiện end-to-end project", "Đóng gói demo/repo/notebook", "Bảo vệ lựa chọn và giới hạn"],
    syllabusTopics: ["Full IOAI 2026 synthesis", "Project engineering beyond syllabus"],
    lessons: [
      lesson("Project contract", "Khóa user/problem/metric/scope.", "Viết one-page spec.", "Có non-goals và ethics."),
      lesson("Reproducible pipeline", "Raw→model→evaluation tự động.", "Hoàn thiện notebook/scripts.", "Fresh-run proof."),
      lesson("Interactive demo", "Cho người dùng thử inference an toàn.", "Hoàn thiện web demo.", "Loading/error/empty states."),
      lesson("Technical report/model card", "Trình bày data/model/eval/limits.", "Viết report và model card.", "Mọi claim có evidence."),
      lesson("Defense rehearsal", "Giải thích không nhìn code/AI.", "Thu video 10 phút + Q&A.", "Tự chấm theo rubric."),
    ],
    lab: { title: "Capstone release candidate", product: "Repo + notebook + demo + report + model card + test evidence.", acceptance: ["Tái lập", "Có baseline/ablation/error analysis", "Có user workflow", "Không claim quá bằng chứng"] },
    checkpoint: { title: "Final project defense", passScore: 85, tasks: ["Demo trực tiếp", "Code walkthrough", "Judge Q&A", "Reproduce key metric"], retryRule: "Chỉ tốt nghiệp khi qua cả reproducibility và oral defense." },
    deliverable: "capstone/ release candidate và portfolio index",
    milestone: "M6 — Hoàn thành toàn bộ 41 tuần; capstone đạt release candidate và hồ sơ readiness truy xuất được qua R1/R2/remediation.",
  }),
] as const;

export const IOAI_2026_SYLLABUS_COVERAGE: readonly SyllabusCoverageItem[] = [
  { id: "python", section: "Foundational Skills & Classical ML", topic: "Python Basics (loops, functions, etc.)", category: "Practice", weeks: [1] },
  { id: "numpy-pandas", section: "Foundational Skills & Classical ML", topic: "NumPy and Pandas for Data Handling", category: "Practice", weeks: [2] },
  { id: "visualization", section: "Foundational Skills & Classical ML", topic: "Matplotlib and Seaborn for Visualization", category: "Practice", weeks: [2] },
  { id: "sklearn", section: "Foundational Skills & Classical ML", topic: "Scikit-learn for ML", category: "Practice", weeks: [4] },
  { id: "pytorch", section: "Foundational Skills & Classical ML", topic: "PyTorch Basics", category: "Practice", weeks: [15] },
  { id: "tensor", section: "Foundational Skills & Classical ML", topic: "Tensor manipulation", category: "Practice", weeks: [2, 15] },
  { id: "cpu-gpu", section: "Foundational Skills & Classical ML", topic: "Training models on CPU and GPU", category: "Practice", weeks: [15] },
  { id: "linear-regression", section: "Foundational Skills & Classical ML", topic: "Linear Regression", category: "Both", weeks: [5] },
  { id: "logistic-regression", section: "Foundational Skills & Classical ML", topic: "Logistic Regression", category: "Both", weeks: [6] },
  { id: "l1-l2", section: "Foundational Skills & Classical ML", topic: "L1 & L2 Regularization", category: "Both", weeks: [7] },
  { id: "knn", section: "Foundational Skills & Classical ML", topic: "K-Nearest Neighbors", category: "Both", weeks: [8] },
  { id: "trees", section: "Foundational Skills & Classical ML", topic: "Decision Trees", category: "Both", weeks: [9] },
  { id: "ensembles", section: "Foundational Skills & Classical ML", topic: "Gradient Boosting, Bagging, Random Forest", category: "Practice", weeks: [10] },
  { id: "svm", section: "Foundational Skills & Classical ML", topic: "Support Vector Machines", category: "Both", weeks: [8] },
  { id: "kmeans", section: "Foundational Skills & Classical ML", topic: "K-Means Clustering", category: "Both", weeks: [11] },
  { id: "pca", section: "Foundational Skills & Classical ML", topic: "Principal Component Analysis", category: "Both", weeks: [12] },
  { id: "tsne-umap", section: "Foundational Skills & Classical ML", topic: "t-SNE, UMAP", category: "Practice", weeks: [12] },
  { id: "other-clustering", section: "Foundational Skills & Classical ML", topic: "DBSCAN, Hierarchical & Spectral Clustering", category: "Practice", weeks: [13] },
  { id: "metrics", section: "Foundational Skills & Classical ML", topic: "Accuracy, Precision, Recall, F1 and other metrics", category: "Both", weeks: [4, 6] },
  { id: "under-over", section: "Foundational Skills & Classical ML", topic: "Underfitting, Overfitting", category: "Theory", weeks: [7] },
  { id: "tuning", section: "Foundational Skills & Classical ML", topic: "Hyperparameter Tuning", category: "Practice", weeks: [7, 14] },
  { id: "cross-validation", section: "Foundational Skills & Classical ML", topic: "Cross-Validation", category: "Practice", weeks: [7] },
  { id: "confusion-roc", section: "Foundational Skills & Classical ML", topic: "Confusion Matrix and ROC Curves", category: "Both", weeks: [6] },
  { id: "feature-engineering", section: "Foundational Skills & Classical ML", topic: "Feature Engineering", category: "Practice", weeks: [4, 14, 39] },
  { id: "data-processing", section: "Foundational Skills & Classical ML", topic: "Data Processing", category: "Practice", weeks: [2, 4, 23, 32, 37, 39] },
  { id: "perceptron", section: "Neural Networks & Deep Learning", topic: "Perceptron Basics", category: "Both", weeks: [16] },
  { id: "gradient-descent", section: "Neural Networks & Deep Learning", topic: "Gradient Descent", category: "Both", weeks: [17] },
  { id: "backprop", section: "Neural Networks & Deep Learning", topic: "Backpropagation", category: "Both", weeks: [18] },
  { id: "activations", section: "Neural Networks & Deep Learning", topic: "ReLU, Sigmoid, Tanh", category: "Both", weeks: [16] },
  { id: "losses", section: "Neural Networks & Deep Learning", topic: "MSE, MAE, Cross Entropy and other losses", category: "Both", weeks: [5, 16] },
  { id: "mlp", section: "Neural Networks & Deep Learning", topic: "Multi-Layer Perceptrons", category: "Both", weeks: [18] },
  { id: "embeddings", section: "Neural Networks & Deep Learning", topic: "Data Embeddings (text, image, audio)", category: "Both", weeks: [20, 29, 37] },
  { id: "pooling", section: "Neural Networks & Deep Learning", topic: "Max and Average Pooling", category: "Both", weeks: [20, 23] },
  { id: "attention", section: "Neural Networks & Deep Learning", topic: "Attention Mechanism", category: "Both", weeks: [21] },
  { id: "transformers", section: "Neural Networks & Deep Learning", topic: "Transformers (theory for text and image)", category: "Both", weeks: [22, 33, 34] },
  { id: "autoencoders", section: "Neural Networks & Deep Learning", topic: "Autoencoders", category: "Practice", weeks: [20] },
  { id: "sgd", section: "Neural Networks & Deep Learning", topic: "SGD, Mini-Batch Gradient Descent", category: "Both", weeks: [17] },
  { id: "adam", section: "Neural Networks & Deep Learning", topic: "Momentum Methods (Adam, AdamW)", category: "Practice", weeks: [17] },
  { id: "convergence", section: "Neural Networks & Deep Learning", topic: "Convergence and Learning Rates", category: "Practice", weeks: [17] },
  { id: "dl-regularization", section: "Neural Networks & Deep Learning", topic: "Dropout, Early Stopping, Weight Decay", category: "Practice", weeks: [19] },
  { id: "initialization", section: "Neural Networks & Deep Learning", topic: "Weight Initialization", category: "Practice", weeks: [17] },
  { id: "batch-norm", section: "Neural Networks & Deep Learning", topic: "Batch Normalization", category: "Practice", weeks: [19] },
  { id: "finetuning", section: "Neural Networks & Deep Learning", topic: "Full and parameter-efficient finetuning", category: "Practice", weeks: [22, 24, 33] },
  { id: "convolution", section: "Computer Vision", topic: "Convolutional Layers", category: "Both", weeks: [23] },
  { id: "image-classification", section: "Computer Vision", topic: "Image Classification", category: "Practice", weeks: [24] },
  { id: "object-detection", section: "Computer Vision", topic: "Object Detection (YOLO, SSD, DERT/DETR)", category: "Practice", weeks: [25] },
  { id: "segmentation", section: "Computer Vision", topic: "Image Segmentation (U-Net)", category: "Practice", weeks: [26] },
  { id: "vision-encoders", section: "Computer Vision", topic: "Pre-trained Vision Encoders (e.g. ResNet)", category: "Practice", weeks: [24] },
  { id: "image-augmentation", section: "Computer Vision", topic: "Image Augmentation", category: "Practice", weeks: [23, 31] },
  { id: "gans", section: "Computer Vision", topic: "Generating Images with GANs", category: "Practice", weeks: [27] },
  { id: "vision-ssl", section: "Computer Vision", topic: "Self-Supervised Learning for Vision", category: "Practice", weeks: [28] },
  { id: "clip", section: "Computer Vision", topic: "Vision-text Encoders (e.g. CLIP)", category: "Practice", weeks: [29] },
  { id: "diffusion", section: "Computer Vision", topic: "Diffusion Models", category: "Practice", weeks: [30] },
  { id: "text-classification", section: "NLP & Audio", topic: "Text Classification", category: "Practice", weeks: [32] },
  { id: "bert", section: "NLP & Audio", topic: "Pre-trained Text Encoders (e.g. BERT)", category: "Both", weeks: [33] },
  { id: "language-modeling", section: "NLP & Audio", topic: "Language Modeling", category: "Both", weeks: [34] },
  { id: "encoder-decoder", section: "NLP & Audio", topic: "Encoder-Decoder Models for Machine Translation or VLM", category: "Practice", weeks: [35] },
  { id: "pretrained-lms", section: "NLP & Audio", topic: "Pre-trained Language Models (open-source and API-based)", category: "Practice", weeks: [36] },
  { id: "hubert", section: "NLP & Audio", topic: "Pre-trained Audio Encoders: HuBERT", category: "Practice", weeks: [37] },
  { id: "audio-models", section: "NLP & Audio", topic: "Qwen-Audio, Whisper, Voxtral", category: "Practice", weeks: [38] },
] as const;

function lessonSession(week: WeekPlan, lessonPlan: LessonPlan, dayIndex: number, ordinal: number): CurriculumSession {
  return {
    id: `w${String(week.week).padStart(2, "0")}-lesson-${dayIndex + 1}`,
    ordinal,
    date: addDaysIso(week.startDate, dayIndex),
    week: week.week,
    dayInWeek: dayIndex + 1,
    phaseId: week.phaseId,
    phaseTitle: week.phaseTitle,
    domain: week.domain,
    kind: "lesson",
    title: `Bài ${dayIndex + 1} · ${lessonPlan.title}`,
    outcome: lessonPlan.outcome,
    artifact: lessonPlan.soloBuild,
    assessment: lessonPlan.selfCheck,
    coreMinutes: 30,
    deepMinutes: 60,
    corePlan: ["5′ truy hồi: viết lại ý chính hôm trước mà không mở tài liệu", "10′ học khái niệm và tự dự đoán ví dụ", `15′ ${lessonPlan.soloBuild} [SOLO-90]`],
    deepExtension: `30′ mở rộng bằng phản ví dụ, benchmark hoặc unit test; kết thúc bằng ${lessonPlan.selfCheck}`,
    labels: ["SOLO-90", "COACH-10"],
    coachBoundary: STUDY_CONTRACT.coachPrompt,
  };
}

function labSession(week: WeekPlan, ordinal: number): CurriculumSession {
  return {
    id: `w${String(week.week).padStart(2, "0")}-lab`,
    ordinal,
    date: addDaysIso(week.startDate, 5),
    week: week.week,
    dayInWeek: 6,
    phaseId: week.phaseId,
    phaseTitle: week.phaseTitle,
    domain: week.domain,
    kind: "lab",
    title: `Lab · ${week.lab.title}`,
    outcome: week.lab.product,
    artifact: week.deliverable,
    assessment: `Đạt khi: ${week.lab.acceptance.join("; ")}.`,
    coreMinutes: 30,
    deepMinutes: 60,
    corePlan: ["5′ viết hypothesis và acceptance tests", "20′ tự code một lát cắt chạy được [SOLO-90]", "5′ lưu evidence: test, metric, lỗi còn lại"],
    deepExtension: "30′ hoàn thiện ablation/error analysis, chạy lại từ runtime sạch và cập nhật experiment ledger.",
    labels: ["SOLO-90", "COACH-10"],
    coachBoundary: STUDY_CONTRACT.coachPrompt,
  };
}

function checkpointSession(week: WeekPlan, ordinal: number): CurriculumSession {
  const extendedMinutes = week.checkpoint.extendedMinutes;
  return {
    id: `w${String(week.week).padStart(2, "0")}-checkpoint`,
    ordinal,
    date: addDaysIso(week.startDate, 6),
    week: week.week,
    dayInWeek: 7,
    phaseId: week.phaseId,
    phaseTitle: week.phaseTitle,
    domain: week.domain,
    kind: "checkpoint",
    title: `Checkpoint · ${week.checkpoint.title}`,
    outcome: `Chứng minh độc lập tối thiểu ${week.checkpoint.passScore}/100 điểm.`,
    artifact: `Phiếu chấm + link commit/notebook; ${week.deliverable}.`,
    assessment: `${week.checkpoint.tasks.join("; ")}. Quy tắc thi lại: ${week.checkpoint.retryRule}`,
    coreMinutes: 30,
    deepMinutes: extendedMinutes ?? 60,
    corePlan: ["20′ làm bài đóng tài liệu, không AI [SOLO-90]", "5′ chạy tests/chấm rubric", "5′ viết lỗi gốc và kế hoạch sửa"],
    deepExtension: extendedMinutes
      ? `${extendedMinutes}′ ngoại lệ thi thử có chủ đích: làm liền mạch, đóng tài liệu, theo đúng mốc tham chiếu ghi trong checkpoint; sau đó mới chấm và lập error ledger. AI chỉ được dùng sau khi đã khóa bài.`
      : "30′ làm challenge mới cùng nguyên lý, bảo vệ miệng hoặc sửa từ trang trắng; AI chỉ được xác nhận sau khi đã chốt đáp án.",
    labels: ["SOLO-90", "COACH-10"],
    coachBoundary: STUDY_CONTRACT.coachPrompt,
  };
}

const FINAL_SPRINT_BLUEPRINTS = [
  {
    title: "Ngày 288 · Audit bản đồ kiến thức",
    outcome: "Đối chiếu toàn bộ IOAI 2026 coverage và xác định lỗ hổng còn lại bằng evidence.",
    artifact: "final/coverage-audit.md + danh sách 3 lỗ hổng ưu tiên",
    assessment: "Mỗi syllabus item có ít nhất một notebook/checkpoint minh chứng; không tự đánh dấu nếu chưa mở được artifact.",
    corePlan: ["10′ duyệt coverage matrix", "15′ mở ngẫu nhiên 5 artifacts [SOLO-90]", "5′ chốt remediation list"],
    deepExtension: "30′ làm lại checkpoint yếu nhất từ trang trắng.",
  },
  {
    title: "Ngày 289 · Closed-book coding & oral defense",
    outcome: "Chứng minh có thể code và giải thích mà không dựa AI hay notebook cũ.",
    artifact: "final/closed-book-solution.py + defense-notes.md",
    assessment: "Đạt ≥85/100; code 60, test 15, giải thích 15, reflection 10; không qua nếu không giải thích được code.",
    corePlan: ["20′ code bài tổng hợp không tài liệu [SOLO-90]", "5′ tự viết tests", "5′ tự vấn đáp ghi âm/ghi chú"],
    deepExtension: "30′ làm biến thể ẩn và giải thích complexity/failure modes.",
  },
  {
    title: "Ngày 290 · Release, retrospective và kế hoạch VOAI tiếp theo",
    outcome: "Đóng bản phát hành capstone/portfolio và chuyển sang lịch thi chính thức mới nhất.",
    artifact: "final/portfolio-release + retrospective.md + next-90-days.md",
    assessment: "Fresh-run pass, link demo hoạt động, mọi claim có evidence, kế hoạch cập nhật khi VOAI/IOAI công bố syllabus mới.",
    corePlan: ["10′ fresh-run/smoke test", "10′ đóng release và checklist", "10′ viết retrospective + kế hoạch [SOLO-90]"],
    deepExtension: "30′ trình bày demo cho người thật và ghi nhận 3 phản hồi quan sát được.",
  },
] as const;

export function generateCurriculumSessions(): CurriculumSession[] {
  const sessions: CurriculumSession[] = [];

  for (const week of WEEKLY_CURRICULUM) {
    for (let lessonIndex = 0; lessonIndex < week.lessons.length; lessonIndex += 1) {
      sessions.push(lessonSession(week, week.lessons[lessonIndex], lessonIndex, sessions.length + 1));
    }
    sessions.push(labSession(week, sessions.length + 1));
    sessions.push(checkpointSession(week, sessions.length + 1));
  }

  FINAL_SPRINT_BLUEPRINTS.forEach((blueprint, index) => {
    sessions.push({
      id: `final-${index + 1}`,
      ordinal: sessions.length + 1,
      date: addDaysIso(COURSE_START_ISO, COMPLETE_WEEKS * 7 + index),
      week: null,
      dayInWeek: index + 1,
      phaseId: "graduation",
      phaseTitle: PHASE_TITLES.graduation,
      domain: index === 0 ? "VOAI" : "Project",
      kind: "finale",
      title: blueprint.title,
      outcome: blueprint.outcome,
      artifact: blueprint.artifact,
      assessment: blueprint.assessment,
      coreMinutes: 30,
      deepMinutes: 60,
      corePlan: blueprint.corePlan,
      deepExtension: blueprint.deepExtension,
      labels: ["SOLO-90", "COACH-10"],
      coachBoundary: STUDY_CONTRACT.coachPrompt,
    });
  });

  if (WEEKLY_CURRICULUM.length !== COMPLETE_WEEKS) {
    throw new Error(`Expected ${COMPLETE_WEEKS} weeks, got ${WEEKLY_CURRICULUM.length}.`);
  }
  if (sessions.length !== TOTAL_CALENDAR_DAYS) {
    throw new Error(`Expected ${TOTAL_CALENDAR_DAYS} sessions, got ${sessions.length}.`);
  }
  if (sessions[0]?.date !== COURSE_START_ISO || sessions.at(-1)?.date !== COURSE_END_ISO) {
    throw new Error(`Date range must be ${COURSE_START_ISO}..${COURSE_END_ISO}.`);
  }
  if (sessions.some((session, index) => session.date !== addDaysIso(COURSE_START_ISO, index))) {
    throw new Error("Curriculum dates must be continuous and unique.");
  }

  return sessions;
}

export const CURRICULUM_SESSIONS: readonly CurriculumSession[] = generateCurriculumSessions();

export const MILESTONES = WEEKLY_CURRICULUM.filter(
  (week): week is WeekPlan & { milestone: string } => Boolean(week.milestone),
).map((week) => ({ week: week.week, date: week.endDate, title: week.milestone }));

export const CURRICULUM_SUMMARY = {
  startDate: COURSE_START_ISO,
  endDate: COURSE_END_ISO,
  totalDays: CURRICULUM_SESSIONS.length,
  completeWeeks: WEEKLY_CURRICULUM.length,
  lessons: CURRICULUM_SESSIONS.filter((session) => session.kind === "lesson").length,
  labs: CURRICULUM_SESSIONS.filter((session) => session.kind === "lab").length,
  checkpoints: CURRICULUM_SESSIONS.filter((session) => session.kind === "checkpoint").length,
  finaleSessions: CURRICULUM_SESSIONS.filter((session) => session.kind === "finale").length,
  syllabusItems: IOAI_2026_SYLLABUS_COVERAGE.length,
} as const;
