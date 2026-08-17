/**
 * Section A1 — Công cụ nền tảng: Python, NumPy/Pandas, trực quan hoá,
 * scikit-learn, PyTorch, thao tác tensor, CPU/GPU, xử lý dữ liệu và feature
 * engineering.
 *
 * Mỗi mục syllabus có 5 câu theo cùng một khuôn: 1 Nhận biết, 1 Thông hiểu,
 * 2 Vận dụng, 1 Vận dụng cao.
 */

import type { TheoryQuestion } from "./types";

export const sectionA1Questions: readonly TheoryQuestion[] = [
  /* ---------------- python ---------------- */
  {
    id: "python-01",
    syllabusId: "python",
    difficulty: "recall",
    format: "single-choice",
    stem: "Phát biểu nào đúng về `list` và `tuple` trong Python?",
    choices: [
      "Cả hai đều không thể thay đổi sau khi tạo.",
      "`list` thay đổi được tại chỗ, `tuple` thì không.",
      "`tuple` không được phép chứa phần tử là `list`.",
      "Cả `list` và `tuple` đều không dùng được làm phần tử của `set`.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: `list` là kiểu mutable, `append` và gán theo chỉ số đều đổi tại chỗ.",
      "Đúng: đây chính là khác biệt cốt lõi giữa hai kiểu.",
      "Sai: `tuple` chứa được `list`, nhưng khi đó tuple mất tính hashable.",
      "Sai: `tuple` chỉ gồm phần tử hashable thì dùng làm phần tử của `set` được; chỉ `list` là không.",
    ],
    explanation:
      "`tuple` bất biến ở tầng chính nó: không thêm, xoá hay gán lại phần tử. Nó vẫn có thể tham chiếu tới một đối tượng mutable bên trong, và chính điều đó làm nó mất hashable.",
  },
  {
    id: "python-02",
    syllabusId: "python",
    difficulty: "understand",
    format: "numeric",
    stem: "Cho `a = [[0, 0], [0, 0]]`, sau đó `b = a[:]` rồi `b[0][0] = 9`. Giá trị của `a[0][0]` là bao nhiêu?",
    answer: 9,
    tolerance: 0,
    calculation: [
      "`a[:]` tạo bản sao nông: list ngoài là mới, nhưng hai phần tử vẫn trỏ tới đúng hai list con cũ.",
      "`b[0]` và `a[0]` là cùng một đối tượng.",
      "Gán `b[0][0] = 9` sửa list con dùng chung nên `a[0][0]` cũng thành 9.",
    ],
    explanation:
      "Sao chép nông chỉ nhân bản một tầng. Muốn tách hẳn hai cấu trúc lồng nhau phải dùng `copy.deepcopy`.",
  },
  {
    id: "python-03",
    syllabusId: "python",
    difficulty: "apply",
    format: "numeric",
    stem: "Cho `def add(item, bucket=[]): bucket.append(item); return bucket`. Gọi lần lượt `add(1)`, `add(2)`, rồi `r = add(3)`. `len(r)` bằng bao nhiêu?",
    answer: 3,
    tolerance: 0,
    calculation: [
      "Giá trị mặc định được tạo **một lần** lúc định nghĩa hàm, không phải mỗi lần gọi.",
      "Ba lần gọi cùng dùng chung một list mặc định.",
      "Sau `add(1)`, `add(2)`, `add(3)` list đó là `[1, 2, 3]` nên độ dài là 3.",
    ],
    explanation:
      "Đây là bẫy mutable default argument. Cách viết an toàn là `bucket=None` rồi `if bucket is None: bucket = []` trong thân hàm.",
  },
  {
    id: "python-04",
    syllabusId: "python",
    difficulty: "apply",
    format: "single-choice",
    stem: "Kết quả của `fs = [lambda: i for i in range(3)]` rồi `[f() for f in fs]` là gì?",
    choices: ["[0, 1, 2]", "[2, 2, 2]", "[3, 3, 3]", "Báo lỗi NameError"],
    answerIndex: 1,
    choiceNotes: [
      "Sai: đây là kết quả nếu `i` được chốt ngay lúc tạo lambda, ví dụ `lambda i=i: i`.",
      "Đúng: mọi lambda cùng đọc biến `i` tại thời điểm gọi, khi đó `i` đã dừng ở 2.",
      "Sai: `range(3)` dừng ở 2; biến vòng lặp không bao giờ nhận giá trị 3.",
      "Sai: `i` vẫn tồn tại trong phạm vi bao ngoài sau khi vòng lặp kết thúc.",
    ],
    explanation:
      "Closure trong Python bắt *biến* chứ không bắt *giá trị* (late binding). Muốn chốt giá trị, truyền qua tham số mặc định hoặc dùng `functools.partial`.",
  },
  {
    id: "python-05",
    syllabusId: "python",
    difficulty: "advanced",
    format: "true-false-set",
    stem: "Xét các phát biểu về ngữ nghĩa Python (CPython 3.11).",
    statements: [
      {
        text: "`sorted` là thuật toán sắp xếp ổn định: hai phần tử bằng khoá giữ nguyên thứ tự tương đối.",
        answer: true,
        note: "Tính ổn định được đặc tả bảo đảm, nhờ đó sắp xếp nhiều khoá bằng cách gọi `sorted` nhiều lần từ khoá phụ đến khoá chính.",
      },
      {
        text: "Từ Python 3.7, `dict` giữ thứ tự chèn theo đặc tả ngôn ngữ chứ không chỉ là chi tiết cài đặt.",
        answer: true,
        note: "3.6 đã có hành vi này nhưng chỉ là chi tiết cài đặt của CPython; 3.7 nâng lên thành bảo đảm của ngôn ngữ.",
      },
      {
        text: "Một generator đã duyệt hết có thể duyệt lại bằng cách gọi `iter()` lên chính nó.",
        answer: false,
        note: "`iter(gen)` trả về chính generator đã cạn, nên vòng lặp sau đó chạy 0 lần. Muốn duyệt lại phải tạo generator mới.",
      },
      {
        text: "Với hai số nguyên bất kỳ, `a == b` đúng thì `a is b` cũng đúng.",
        answer: false,
        note: "Chỉ đúng trong vùng cache số nhỏ (-5..256). Với `a = b = 1000` tạo riêng lẻ, `a is b` có thể False.",
      },
    ],
    trap: "Ý (d) nghe hợp lý vì thử với số nhỏ trong REPL luôn ra True; bẫy nằm ở chỗ hành vi đó là tối ưu hoá bộ nhớ, không phải ngữ nghĩa.",
    explanation:
      "`is` so sánh danh tính đối tượng, `==` so sánh giá trị. Nhầm hai toán tử này là nguồn lỗi im lặng khi so sánh số lớn hoặc chuỗi dựng động.",
  },

  /* ---------------- numpy-pandas ---------------- */
  {
    id: "numpy-pandas-01",
    syllabusId: "numpy-pandas",
    difficulty: "recall",
    format: "single-choice",
    stem: "Cộng hai mảng NumPy có shape `(3, 1)` và `(1, 4)` cho kết quả shape nào?",
    choices: ["(3, 1)", "(1, 4)", "(3, 4)", "Lỗi vì shape không khớp"],
    answerIndex: 2,
    choiceNotes: [
      "Sai: chiều thứ hai được nong từ 1 lên 4.",
      "Sai: chiều thứ nhất được nong từ 1 lên 3.",
      "Đúng: mỗi chiều có kích thước 1 được lặp lại để khớp chiều còn lại.",
      "Sai: quy tắc broadcasting cho phép khi mỗi chiều bằng nhau hoặc bằng 1.",
    ],
    explanation:
      "Broadcasting so khớp shape từ phải sang trái; hai chiều tương thích khi bằng nhau hoặc một trong hai bằng 1, và chiều bằng 1 sẽ được nong ra.",
  },
  {
    id: "numpy-pandas-02",
    syllabusId: "numpy-pandas",
    difficulty: "understand",
    format: "single-choice",
    stem: "So sánh `x[1:3]` khi `x` là `ndarray` với khi `x` là `list` Python.",
    choices: [
      "Cả hai đều trả về bản sao độc lập.",
      "NumPy trả về view dùng chung bộ nhớ; list trả về bản sao nông.",
      "NumPy trả về bản sao; list trả về view.",
      "Cả hai đều trả về view dùng chung bộ nhớ.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: chỉ list mới sao chép, NumPy thì không.",
      "Đúng: đây là khác biệt gây lỗi im lặng phổ biến nhất khi chuyển từ list sang NumPy.",
      "Sai: đảo ngược hoàn toàn hành vi thật.",
      "Sai: slicing list luôn tạo list mới.",
    ],
    explanation:
      "Slicing cơ bản của NumPy chỉ đổi stride/offset trên cùng vùng nhớ nên ghi vào view sẽ đổi mảng gốc. Muốn tách hẳn phải gọi `.copy()`. Ngược lại, fancy indexing (`x[[0, 2]]`) luôn trả bản sao.",
  },
  {
    id: "numpy-pandas-03",
    syllabusId: "numpy-pandas",
    difficulty: "apply",
    format: "numeric",
    stem: "Cho `A = np.array([[1, 2, 3], [4, 5, 6]])`. Tính tổng các phần tử của `A.mean(axis=1)`.",
    answer: 7,
    tolerance: 1e-9,
    calculation: [
      "`axis=1` gộp theo chiều cột, giữ lại một giá trị cho mỗi hàng.",
      "Hàng 1: (1+2+3)/3 = 2. Hàng 2: (4+5+6)/3 = 5.",
      "Tổng: 2 + 5 = 7.",
    ],
    explanation:
      "Quy ước cần thuộc: `axis=k` là chiều **bị triệt tiêu**. `A.mean(axis=1)` cho shape (2,), `A.mean(axis=0)` cho shape (3,).",
  },
  {
    id: "numpy-pandas-04",
    syllabusId: "numpy-pandas",
    difficulty: "apply",
    format: "single-choice",
    stem: "`df1` có cột khoá `k = [1, 2, 2, 3]`, `df2` có `k = [2, 2, 4]`. `df1.merge(df2, on='k', how='inner')` cho bao nhiêu dòng?",
    choices: ["2", "3", "4", "7"],
    answerIndex: 2,
    choiceNotes: [
      "Sai: đây là số dòng có `k = 2` ở một phía, chưa nhân chéo.",
      "Sai: không tương ứng với phép nối nào ở đây.",
      "Đúng: chỉ khoá 2 khớp, 2 dòng trái × 2 dòng phải = 4 dòng.",
      "Sai: 7 là tổng số dòng hai bảng, không phải kết quả nối.",
    ],
    explanation:
      "Inner join nhân chéo theo từng khoá khớp. Khoá lặp ở cả hai phía làm số dòng phình lên — đây là nguyên nhân thường gặp khi bảng sau khi merge lớn hơn cả hai bảng đầu vào.",
  },
  {
    id: "numpy-pandas-05",
    syllabusId: "numpy-pandas",
    difficulty: "advanced",
    format: "multi-select",
    stem: "Chọn tất cả phát biểu đúng về NumPy/Pandas.",
    choices: [
      "`df[df.a > 0]['b'] = 0` không bảo đảm ghi được vào `df` vì có thể thao tác trên bản sao.",
      "Một cột `int64` mặc định của pandas khi xuất hiện giá trị thiếu sẽ được nâng kiểu lên `float64`.",
      "`np.nan == np.nan` trả về `True`.",
      "`df.loc[mask, 'b'] = 0` là cách gán có điều kiện an toàn.",
      "`np.array([-1.7, 1.7]).astype(np.int32)` cho `[-2, 2]`.",
    ],
    answerIndexes: [0, 1, 3],
    choiceNotes: [
      "Đúng: chained indexing tạo đối tượng trung gian; pandas cảnh báo `SettingWithCopyWarning` chính vì lý do này.",
      "Đúng: `int64` không biểu diễn được NaN nên cột bị nâng lên float, trừ khi dùng kiểu nullable `Int64`.",
      "Sai: NaN không bằng chính nó theo IEEE 754; phải dùng `np.isnan` hoặc `.isna()`.",
      "Đúng: `.loc` gán trực tiếp trên đối tượng gốc trong một bước.",
      "Sai: `astype` cắt phần thập phân về phía 0, cho `[-1, 1]`, không làm tròn.",
    ],
    scoring: "all-or-nothing",
    trap: "Phương án cuối hấp dẫn vì ta quen `round`; nhưng ép kiểu số nguyên trong NumPy là truncation, và sai lệch này âm thầm làm hỏng nhãn hoặc chỉ số.",
    explanation:
      "Ba lỗi im lặng hay gặp nhất khi làm dữ liệu: gán qua chained indexing, nâng kiểu ngoài ý muốn khi có NaN, và so sánh trực tiếp với NaN.",
  },

  /* ---------------- visualization ---------------- */
  {
    id: "visualization-01",
    syllabusId: "visualization",
    difficulty: "recall",
    format: "single-choice",
    stem: "Sau `fig, ax = plt.subplots(2, 2)`, biến `ax` là gì?",
    choices: [
      "Một đối tượng `Axes` duy nhất.",
      "Một mảng NumPy 2×2 các đối tượng `Axes`.",
      "Một list phẳng gồm 4 đối tượng `Figure`.",
      "Một dict ánh xạ vị trí sang `Axes`.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: chỉ đúng khi gọi `plt.subplots()` không tham số.",
      "Đúng: truy cập bằng `ax[0, 1]`, hoặc `ax.ravel()` để duyệt phẳng.",
      "Sai: chỉ có một `Figure`; các ô vẽ là `Axes`.",
      "Sai: matplotlib không trả về dict ở đây.",
    ],
    explanation:
      "Phân biệt `Figure` (khung hình tổng) với `Axes` (một hệ trục để vẽ) là điều kiện để đọc được mọi ví dụ matplotlib theo phong cách hướng đối tượng.",
  },
  {
    id: "visualization-02",
    syllabusId: "visualization",
    difficulty: "understand",
    format: "single-choice",
    stem: "Tăng số bin của histogram lên rất lớn so với số mẫu thì điều gì xảy ra?",
    choices: [
      "Ước lượng phân phối mượt hơn và ổn định hơn.",
      "Mỗi bin còn rất ít mẫu nên hình bị răng cưa, nhiễu lấn át cấu trúc.",
      "Hình dạng histogram không đổi, chỉ đổi màu sắc.",
      "Histogram tự động chuyển thành ước lượng mật độ hạt nhân.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: đó là hệ quả của việc *giảm* số bin, kèm rủi ro che mất chi tiết.",
      "Đúng: đây là đánh đổi bias–variance ở dạng trực quan.",
      "Sai: số bin là tham số hình dạng, không phải tham số thẩm mỹ.",
      "Sai: KDE là phương pháp riêng, phải gọi tường minh.",
    ],
    explanation:
      "Bin rộng cho bias cao (làm phẳng chi tiết), bin hẹp cho variance cao (nhiễu). Phải thử vài mức bin trước khi kết luận về hình dạng phân phối.",
  },
  {
    id: "visualization-03",
    syllabusId: "visualization",
    difficulty: "apply",
    format: "single-choice",
    stem: "Cần so sánh phân phối của một biến liên tục giữa 5 nhóm, đồng thời thấy được trung vị và các điểm ngoại lai. Biểu đồ nào phù hợp nhất?",
    choices: [
      "5 biểu đồ tròn, mỗi nhóm một biểu đồ.",
      "Biểu đồ cột chiều cao bằng giá trị trung bình mỗi nhóm.",
      "Boxplot (hoặc violin plot) song song cho 5 nhóm.",
      "Biểu đồ đường nối trung bình của 5 nhóm.",
    ],
    answerIndex: 2,
    choiceNotes: [
      "Sai: biểu đồ tròn dùng cho tỷ trọng của một tổng, không mô tả phân phối.",
      "Sai: cột trung bình giấu mất độ phân tán; hai nhóm rất khác nhau vẫn có thể cùng trung bình.",
      "Đúng: hiển thị trực tiếp trung vị, tứ phân vị và ngoại lai; violin bổ sung hình dạng phân phối.",
      "Sai: đường nối ám chỉ thứ tự/liên tục giữa các nhóm rời rạc.",
    ],
    explanation:
      "Khi câu hỏi là “phân phối khác nhau thế nào”, biểu đồ chỉ vẽ một con số tóm tắt cho mỗi nhóm luôn là lựa chọn sai.",
  },
  {
    id: "visualization-04",
    syllabusId: "visualization",
    difficulty: "apply",
    format: "single-choice",
    stem: "Scatter plot 50.000 điểm bị chồng lấn dày đặc thành một mảng đen. Cách xử lý nào giữ được thông tin mật độ tốt nhất?",
    choices: [
      "Giảm kích thước hình để các điểm sát lại.",
      "Dùng hexbin hoặc histogram 2D, hoặc hạ `alpha` kèm lấy mẫu con.",
      "Đổi màu điểm từ đen sang đỏ.",
      "Bỏ bớt ngẫu nhiên 90% điểm rồi kết luận trên phần còn lại như dữ liệu đầy đủ.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: thu nhỏ hình làm chồng lấn nặng hơn.",
      "Đúng: các phương pháp này mã hoá mật độ thành màu/độ đậm thay vì chồng điểm lên nhau.",
      "Sai: đổi màu không giải quyết được việc nhiều điểm đè lên một pixel.",
      "Sai một phần: lấy mẫu con là kỹ thuật hợp lệ để nhìn, nhưng không được coi kết quả là thống kê của toàn bộ dữ liệu.",
    ],
    explanation:
      "Overplotting làm mọi vùng đủ đông trông giống nhau. Hexbin/histogram 2D biến số lượng điểm thành một kênh thị giác đọc được.",
  },
  {
    id: "visualization-05",
    syllabusId: "visualization",
    difficulty: "advanced",
    format: "single-choice",
    stem: "Một báo cáo vẽ biểu đồ cột so sánh accuracy của 3 mô hình: 0.90, 0.91 và 0.92, với trục y bắt đầu từ 0.895. Nhận định nào đúng nhất?",
    choices: [
      "Cách vẽ này hợp lệ vì trục vẫn ghi rõ giá trị.",
      "Trục cắt làm chênh lệch 0.02 trông như gấp nhiều lần; với biểu đồ cột nên bắt đầu từ 0 hoặc đổi sang dạng biểu diễn khác kèm khoảng tin cậy.",
      "Nên đổi sang biểu đồ tròn để so sánh công bằng hơn.",
      "Vấn đề duy nhất là thiếu màu phân biệt giữa ba cột.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: ghi nhãn trục không xoá được ấn tượng thị giác sai lệch mà chiều dài cột tạo ra.",
      "Đúng: cột mã hoá giá trị bằng *chiều dài*, nên gốc trục khác 0 phá vỡ tỷ lệ; ngoài ra chênh lệch 0.01 có thể nằm trong nhiễu lấy mẫu.",
      "Sai: biểu đồ tròn còn kém hơn cho việc so sánh các giá trị gần nhau.",
      "Sai: màu sắc không liên quan tới sai lệch tỷ lệ.",
    ],
    trap: "Bẫy là quy tắc “luôn cắt trục cho dễ nhìn khác biệt”. Với biểu đồ đường theo thời gian, cắt trục thường chấp nhận được; với biểu đồ cột thì không, vì kênh mã hoá là chiều dài.",
    explanation:
      "Câu này kiểm tra hai điều cùng lúc: kênh thị giác nào đang mã hoá giá trị, và chênh lệch quan sát được có vượt nhiễu hay không. Không có khoảng tin cậy thì khoảng cách 0.01 accuracy hầu như không kết luận được gì.",
  },

  /* ---------------- sklearn ---------------- */
  {
    id: "sklearn-01",
    syllabusId: "sklearn",
    difficulty: "recall",
    format: "single-choice",
    stem: "Trong scikit-learn, phương thức nào *học* tham số từ dữ liệu?",
    choices: ["`transform`", "`fit`", "`predict`", "`score`"],
    answerIndex: 1,
    choiceNotes: [
      "Sai: `transform` áp dụng tham số đã học lên dữ liệu mới.",
      "Đúng: `fit` ước lượng và lưu tham số vào các thuộc tính kết thúc bằng dấu gạch dưới, ví dụ `mean_`.",
      "Sai: `predict` sinh dự đoán từ mô hình đã fit.",
      "Sai: `score` tính chỉ số đánh giá.",
    ],
    explanation:
      "Quy ước fit/transform/predict là xương sống của toàn bộ API. Nắm nó thì đọc được mọi estimator, kể cả loại chưa từng dùng.",
  },
  {
    id: "sklearn-02",
    syllabusId: "sklearn",
    difficulty: "understand",
    format: "single-choice",
    stem: "Vì sao `StandardScaler` phải `fit` trên tập train rồi mới `transform` tập test, thay vì `fit_transform` trên toàn bộ dữ liệu?",
    choices: [
      "Vì `fit_transform` chạy chậm hơn trên dữ liệu lớn.",
      "Vì trung bình và độ lệch chuẩn tính từ cả tập test sẽ rò rỉ thông tin của test vào quá trình huấn luyện.",
      "Vì scikit-learn không cho phép gọi `fit` hai lần.",
      "Vì tập test luôn có phân phối khác tập train.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: tốc độ không phải lý do; khác biệt là tính đúng đắn.",
      "Đúng: đây là data leakage; điểm test sẽ lạc quan hơn thực tế.",
      "Sai: gọi `fit` lại hoàn toàn được, nó chỉ ghi đè tham số cũ.",
      "Sai: giả định chuẩn là hai tập cùng phân phối; nếu khác thì đó là vấn đề riêng (distribution shift).",
    ],
    explanation:
      "Tập test phải mô phỏng dữ liệu chưa từng thấy. Mọi thống kê dùng để biến đổi dữ liệu đều là tham số học được, nên chỉ được ước lượng từ train.",
  },
  {
    id: "sklearn-03",
    syllabusId: "sklearn",
    difficulty: "apply",
    format: "single-choice",
    stem: "Quy trình gồm chuẩn hoá, chọn 20 đặc trưng tốt nhất bằng `SelectKBest`, rồi huấn luyện logistic regression, và cần đánh giá bằng 5-fold CV. Cách làm đúng là gì?",
    choices: [
      "Chuẩn hoá và chọn đặc trưng trên toàn bộ dữ liệu, sau đó chạy `cross_val_score` cho riêng mô hình.",
      "Đưa cả ba bước vào một `Pipeline` rồi truyền pipeline đó cho `cross_val_score`.",
      "Chạy `cross_val_score` ba lần, mỗi lần cho một bước.",
      "Chọn đặc trưng trên toàn bộ dữ liệu, còn chuẩn hoá thì đặt trong pipeline.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: chọn đặc trưng đã nhìn thấy nhãn của fold validation, gây leakage nặng.",
      "Đúng: mỗi fold, pipeline fit lại toàn bộ các bước chỉ trên phần train của fold đó.",
      "Sai: các bước phụ thuộc nhau, không đánh giá tách rời được.",
      "Sai: leakage vẫn còn nguyên ở bước chọn đặc trưng.",
    ],
    explanation:
      "`Pipeline` không chỉ để gọn code — nó là cơ chế bảo đảm mọi bước học tham số đều nằm *bên trong* vòng lặp cross-validation.",
  },
  {
    id: "sklearn-04",
    syllabusId: "sklearn",
    difficulty: "apply",
    format: "numeric",
    stem: "`GridSearchCV` với lưới tham số gồm 3 giá trị `C` và 4 giá trị `gamma`, đặt `cv=5`. Có bao nhiêu lần `fit` được thực hiện trong giai đoạn tìm kiếm (chưa tính lần refit cuối)?",
    answer: 60,
    tolerance: 0,
    calculation: [
      "Số tổ hợp tham số: 3 × 4 = 12.",
      "Mỗi tổ hợp được đánh giá trên 5 fold: 12 × 5 = 60.",
      "Lần refit trên toàn bộ dữ liệu là lần thứ 61, không tính vào đây.",
    ],
    explanation:
      "Ước lượng được số lần fit là kỹ năng thực dụng: nó cho biết chi phí thời gian trước khi bấm chạy, và giải thích vì sao lưới tham số lớn kèm CV nhiều fold có thể tốn hàng giờ.",
  },
  {
    id: "sklearn-05",
    syllabusId: "sklearn",
    difficulty: "advanced",
    format: "multi-select",
    stem: "Chọn tất cả thao tác gây data leakage khi đánh giá bằng cross-validation.",
    choices: [
      "Điền giá trị thiếu bằng trung bình tính trên toàn bộ dữ liệu trước khi chia fold.",
      "Chọn đặc trưng theo tương quan với nhãn trên toàn bộ dữ liệu rồi mới chạy CV.",
      "Dùng `StratifiedKFold` thay cho `KFold` với bài toán phân loại mất cân bằng.",
      "Oversampling lớp thiểu số (SMOTE) trên toàn bộ dữ liệu trước khi chia fold.",
      "Chuẩn hoá bằng `StandardScaler` đặt bên trong `Pipeline` truyền cho `cross_val_score`.",
    ],
    answerIndexes: [0, 1, 3],
    choiceNotes: [
      "Leakage: trung bình đã chứa thông tin của các mẫu nằm trong fold validation.",
      "Leakage: đây là dạng nặng nhất, có thể tạo ra điểm cao giả trên dữ liệu hoàn toàn ngẫu nhiên.",
      "Không leakage: phân tầng chỉ giữ tỷ lệ lớp giữa các fold, hoàn toàn nên làm.",
      "Leakage: mẫu tổng hợp sinh từ mẫu validation sẽ xuất hiện trong tập train của fold đó.",
      "Không leakage: đây chính là cách làm đúng.",
    ],
    scoring: "all-or-nothing",
    trap: "SMOTE là bẫy khó nhất: nó trông giống bước tiền xử lý vô hại, nhưng vì sinh mẫu mới từ láng giềng nên bản sao gần đúng của mẫu validation lọt vào tập train.",
    explanation:
      "Nguyên tắc duy nhất cần nhớ: mọi bước *học tham số từ dữ liệu* — kể cả điền thiếu, chọn đặc trưng, cân bằng lớp — đều phải nằm trong pipeline và fit lại ở từng fold.",
  },

  /* ---------------- pytorch ---------------- */
  {
    id: "pytorch-01",
    syllabusId: "pytorch",
    difficulty: "recall",
    format: "single-choice",
    stem: "Thuộc tính nào cho biết một tensor sẽ được autograd theo dõi để tính gradient?",
    choices: ["`is_leaf`", "`requires_grad`", "`grad_fn`", "`retain_graph`"],
    answerIndex: 1,
    choiceNotes: [
      "Sai: `is_leaf` cho biết tensor có phải nút lá của đồ thị hay không.",
      "Đúng: đặt `requires_grad=True` thì mọi phép toán trên tensor đó được ghi lại.",
      "Sai: `grad_fn` là hàm backward của tensor kết quả, chỉ tồn tại khi tensor được sinh ra từ phép toán có theo dõi.",
      "Sai: `retain_graph` là tham số của `backward()`, không phải thuộc tính tensor.",
    ],
    explanation:
      "Tham số của `nn.Module` mặc định có `requires_grad=True`; dữ liệu đầu vào thì không. Đóng băng một lớp chính là đặt `requires_grad=False` cho tham số của nó.",
  },
  {
    id: "pytorch-02",
    syllabusId: "pytorch",
    difficulty: "understand",
    format: "single-choice",
    stem: "Điều gì xảy ra nếu quên gọi `optimizer.zero_grad()` trong vòng lặp huấn luyện?",
    choices: [
      "Gradient của các batch bị cộng dồn, nên bước cập nhật dùng tổng gradient của nhiều batch.",
      "Chương trình báo lỗi runtime ngay ở batch thứ hai.",
      "Gradient bị ghi đè, kết quả giống hệt như có gọi.",
      "Learning rate tự động giảm về 0.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: `.grad` được cộng dồn theo thiết kế, nên bỏ qua bước xoá sẽ trộn gradient các batch cũ.",
      "Sai: không có lỗi nào được ném ra — đây chính là lý do lỗi này khó phát hiện.",
      "Sai: hành vi mặc định là cộng dồn chứ không ghi đè.",
      "Sai: learning rate do scheduler quản lý, không liên quan.",
    ],
    explanation:
      "Cộng dồn gradient là tính năng có chủ đích, dùng để mô phỏng batch lớn trên GPU nhỏ (gradient accumulation). Bỏ quên `zero_grad` biến tính năng đó thành lỗi im lặng.",
  },
  {
    id: "pytorch-03",
    syllabusId: "pytorch",
    difficulty: "apply",
    format: "numeric",
    stem: "`nn.Linear(10, 4)` có tổng cộng bao nhiêu tham số học được (tính cả bias)?",
    answer: 44,
    tolerance: 0,
    calculation: [
      "Ma trận trọng số có shape (4, 10) → 40 tham số.",
      "Vector bias có shape (4,) → 4 tham số.",
      "Tổng: 40 + 4 = 44.",
    ],
    explanation:
      "Đếm tham số là kỹ năng nền cho câu hỏi về dung lượng mô hình và overfitting. Lưu ý PyTorch lưu trọng số dạng (out_features, in_features).",
  },
  {
    id: "pytorch-04",
    syllabusId: "pytorch",
    difficulty: "apply",
    format: "true-false-set",
    stem: "Xét `model.eval()` và `torch.no_grad()` khi chạy suy luận.",
    statements: [
      {
        text: "`model.eval()` tắt dropout.",
        answer: true,
        note: "Ở chế độ eval, dropout trở thành ánh xạ đồng nhất thay vì loại ngẫu nhiên các đơn vị.",
      },
      {
        text: "`model.eval()` khiến BatchNorm dùng thống kê chạy (running statistics) thay vì thống kê của batch hiện tại.",
        answer: true,
        note: "Nhờ đó kết quả suy luận không phụ thuộc vào các mẫu khác trong cùng batch.",
      },
      {
        text: "`model.eval()` tự động ngừng tính và lưu gradient.",
        answer: false,
        note: "Đây là nhầm lẫn phổ biến nhất: `eval()` chỉ đổi hành vi của một số lớp; muốn ngừng ghi đồ thị phải bọc `torch.no_grad()`.",
      },
      {
        text: "`torch.no_grad()` giảm bộ nhớ vì không lưu đồ thị tính toán cho backward.",
        answer: true,
        note: "Nhờ đó batch suy luận có thể lớn hơn nhiều so với batch huấn luyện.",
      },
    ],
    explanation:
      "Hai cơ chế này độc lập nhau và đều cần thiết khi đánh giá: `eval()` cho đúng hành vi lớp, `no_grad()` cho đúng chi phí bộ nhớ.",
  },
  {
    id: "pytorch-05",
    syllabusId: "pytorch",
    difficulty: "advanced",
    format: "single-choice",
    stem: "Vòng lặp huấn luyện dùng `total_loss += loss` (thay vì `loss.item()`) để cộng dồn loss của cả epoch. Hậu quả là gì?",
    choices: [
      "Không có gì khác biệt, chỉ là kiểu dữ liệu tensor thay vì float.",
      "Mỗi `loss` giữ nguyên đồ thị tính toán của batch, nên bộ nhớ tăng dần theo số batch và có thể tràn.",
      "Gradient bị tính sai dấu.",
      "Learning rate bị nhân lên theo số batch.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: khác biệt không nằm ở kiểu dữ liệu mà ở đồ thị autograd đi kèm.",
      "Đúng: `total_loss` giữ tham chiếu tới đồ thị của mọi batch, nên đồ thị không được giải phóng.",
      "Sai: dấu gradient không đổi.",
      "Sai: learning rate không bị ảnh hưởng.",
    ],
    trap: "Bẫy nằm ở chỗ mã vẫn chạy đúng vài chục batch rồi mới hết bộ nhớ, nên người học dễ đổ lỗi cho batch size hoặc mô hình.",
    explanation:
      "`loss.item()` (hoặc `loss.detach()`) tách giá trị khỏi đồ thị. Quy tắc chung: mọi đại lượng chỉ để ghi log đều phải detach trước khi tích luỹ.",
  },

  /* ---------------- tensor ---------------- */
  {
    id: "tensor-01",
    syllabusId: "tensor",
    difficulty: "recall",
    format: "single-choice",
    stem: "Tensor có shape `(2, 3, 4)` thì số chiều và tổng số phần tử là bao nhiêu?",
    choices: [
      "3 chiều, 9 phần tử",
      "3 chiều, 24 phần tử",
      "24 chiều, 3 phần tử",
      "2 chiều, 12 phần tử",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: 9 là tổng các kích thước chiều, không phải tích.",
      "Đúng: số chiều là độ dài của shape, số phần tử là tích 2 × 3 × 4 = 24.",
      "Sai: đảo ngược hai khái niệm.",
      "Sai: shape có ba giá trị nên tensor có ba chiều.",
    ],
    explanation:
      "Thói quen đọc shape thành “bao nhiêu chiều, mỗi chiều bao nhiêu, tổng bao nhiêu phần tử” giúp bắt lỗi shape trước khi chạy.",
  },
  {
    id: "tensor-02",
    syllabusId: "tensor",
    difficulty: "understand",
    format: "single-choice",
    stem: "Khác biệt cốt lõi giữa `x.view(...)` và `x.reshape(...)` trong PyTorch là gì?",
    choices: [
      "`view` sao chép dữ liệu, `reshape` thì không.",
      "`view` yêu cầu shape mới tương thích với size/stride hiện tại và luôn trả về view; `reshape` có thể sao chép khi cần.",
      "`view` chỉ dùng cho tensor 2 chiều.",
      "Hai hàm hoàn toàn tương đương, chỉ khác tên gọi.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: ngược lại — `view` mới là hàm không sao chép.",
      "Đúng: sau `transpose`/`permute`, shape mong muốn thường không còn tương thích với stride nên `view` báo lỗi.",
      "Sai: `view` dùng cho số chiều bất kỳ.",
      "Sai: khác biệt về contiguous là thật và gây lỗi runtime.",
    ],
    explanation:
      "Nói cho chính xác: điều kiện của `view` là shape mới **tương thích với size/stride**, không phải “tensor bắt buộc phải contiguous”. Nhiều tensor không contiguous vẫn `view` được nếu shape yêu cầu hợp với stride sẵn có — ví dụ tensor đã `transpose` vẫn view được sang shape giữ nguyên bố cục. Gặp lỗi “view size is not compatible with input tensor's size and stride”, cách xử lý là `x.contiguous().view(...)` hoặc dùng thẳng `reshape`.",
  },
  {
    id: "tensor-03",
    syllabusId: "tensor",
    difficulty: "apply",
    format: "numeric",
    stem: "Cho `x` có shape `(8, 3, 32, 32)`. Tensor `x.mean(dim=(2, 3))` có tổng cộng bao nhiêu phần tử?",
    answer: 24,
    tolerance: 0,
    calculation: [
      "Lấy trung bình theo dim 2 và 3 triệt tiêu hai chiều không gian.",
      "Shape kết quả: (8, 3).",
      "Số phần tử: 8 × 3 = 24.",
    ],
    explanation:
      "Đây chính là phép global average pooling viết bằng tay: từ feature map không gian rút về một vector đặc trưng cho mỗi kênh của mỗi mẫu.",
  },
  {
    id: "tensor-04",
    syllabusId: "tensor",
    difficulty: "apply",
    format: "single-choice",
    stem: "`torch.matmul(A, B)` với `A` shape `(5, 2, 3)` và `B` shape `(5, 3, 4)` cho shape nào?",
    choices: ["(5, 2, 4)", "(5, 3, 3)", "(2, 4)", "Lỗi vì số chiều không khớp"],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: chiều đầu là batch, hai chiều cuối nhân ma trận (2×3)(3×4) = (2×4).",
      "Sai: chiều trong (3) bị triệt tiêu, không xuất hiện trong kết quả.",
      "Sai: chiều batch được giữ nguyên chứ không bị gộp.",
      "Sai: batched matmul hợp lệ khi hai chiều cuối tương thích.",
    ],
    explanation:
      "Quy tắc: `matmul` áp dụng lên hai chiều cuối, mọi chiều trước đó được xử lý như batch và tuân theo broadcasting.",
  },
  {
    id: "tensor-05",
    syllabusId: "tensor",
    difficulty: "advanced",
    format: "single-choice",
    stem: "`pred` có shape `(100, 1)`, `target` có shape `(100,)`. Tính `((pred - target) ** 2).mean()` cho kết quả thế nào?",
    choices: [
      "Đúng MSE, vì hai tensor cùng có 100 phần tử.",
      "Báo lỗi vì shape không khớp.",
      "Chạy được nhưng sai: broadcasting tạo ma trận (100, 100) nên trung bình được lấy trên 10.000 cặp, gồm cả các cặp không tương ứng.",
      "Chạy được và cho kết quả bằng đúng MSE nhân với 100.",
    ],
    answerIndex: 2,
    choiceNotes: [
      "Sai: cùng số phần tử không có nghĩa là cùng shape; broadcasting hoạt động theo shape.",
      "Sai: không có lỗi nào được ném ra, đó chính là điều nguy hiểm.",
      "Đúng: (100, 1) và (100,) → (100, 100). Loss vẫn giảm được nhưng mô hình học sai mục tiêu.",
      "Sai: không phải quan hệ nhân đơn giản; giá trị phụ thuộc toàn bộ ma trận chênh lệch chéo.",
    ],
    trap: "Bẫy là loss vẫn ra một con số hợp lý và vẫn giảm khi huấn luyện, nên lỗi tồn tại qua nhiều epoch trước khi bị phát hiện qua kết quả đánh giá kém bất thường.",
    explanation:
      "Luôn ép shape trước khi tính loss: `pred.squeeze(-1)` hoặc `target.unsqueeze(-1)`. Thêm `assert pred.shape == target.shape` vào vòng lặp huấn luyện là cách chặn rẻ nhất.",
  },

  /* ---------------- cpu-gpu ---------------- */
  {
    id: "cpu-gpu-01",
    syllabusId: "cpu-gpu",
    difficulty: "recall",
    format: "single-choice",
    stem: "Để huấn luyện trên GPU, những gì phải được chuyển sang thiết bị đó?",
    choices: [
      "Chỉ mô hình.",
      "Chỉ dữ liệu đầu vào.",
      "Cả mô hình và các tensor đầu vào/nhãn của mỗi batch.",
      "Chỉ optimizer.",
    ],
    answerIndex: 2,
    choiceNotes: [
      "Sai: mô hình trên GPU nhưng dữ liệu trên CPU sẽ báo lỗi khác thiết bị.",
      "Sai: tương tự, thiếu phía mô hình.",
      "Đúng: mọi tensor tham gia cùng một phép toán phải nằm trên cùng thiết bị.",
      "Sai: optimizer làm việc trên tham số của mô hình, tự đi theo mô hình.",
    ],
    explanation:
      "Lỗi kinh điển “Expected all tensors to be on the same device” đến từ việc quên `.to(device)` cho một trong hai phía.",
  },
  {
    id: "cpu-gpu-02",
    syllabusId: "cpu-gpu",
    difficulty: "understand",
    format: "single-choice",
    stem: "Vì sao GPU thường huấn luyện mạng nơ-ron nhanh hơn CPU nhiều lần?",
    choices: [
      "Vì mỗi lõi GPU chạy ở xung nhịp cao hơn nhiều so với lõi CPU.",
      "Vì GPU có hàng nghìn lõi đơn giản, phù hợp với phép nhân ma trận song song hoá cao.",
      "Vì GPU có dung lượng bộ nhớ lớn hơn CPU.",
      "Vì GPU tự động dùng độ chính xác thấp nên phép tính ít hơn.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: xung nhịp lõi GPU thường *thấp* hơn CPU.",
      "Đúng: khối lượng tính toán của mạng nơ-ron chủ yếu là GEMM, chia được thành rất nhiều phép độc lập.",
      "Sai: RAM hệ thống thường lớn hơn VRAM.",
      "Sai: độ chính xác hỗn hợp phải bật tường minh và không phải nguồn tăng tốc chính.",
    ],
    explanation:
      "GPU thắng nhờ băng thông và mức song song, không nhờ tốc độ từng lõi. Vì thế tác vụ tuần tự, nhiều rẽ nhánh chạy trên GPU không nhanh hơn đáng kể.",
  },
  {
    id: "cpu-gpu-03",
    syllabusId: "cpu-gpu",
    difficulty: "apply",
    format: "single-choice",
    stem: "GPU chỉ đủ VRAM cho batch size 16, nhưng thí nghiệm cần batch hiệu dụng 64. Cách xử lý đúng nhất là gì?",
    choices: [
      "Giảm learning rate xuống 4 lần rồi giữ nguyên batch 16.",
      "Tích luỹ gradient qua 4 batch nhỏ rồi mới gọi `optimizer.step()` và `zero_grad()`.",
      "Tăng số epoch lên 4 lần.",
      "Chuyển toàn bộ mô hình về CPU.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: đổi learning rate là chuyện khác, không tái tạo được thống kê gradient của batch 64.",
      "Đúng: gradient accumulation cho gradient tương đương batch 64 với bộ nhớ của batch 16.",
      "Sai: nhiều epoch hơn không đổi kích thước batch hiệu dụng.",
      "Sai: chạy được nhưng chậm hơn rất nhiều và không phải cách giải quyết vấn đề đặt ra.",
    ],
    explanation:
      "Với accumulation, cần chia loss cho số bước tích luỹ (hoặc dùng trung bình) để độ lớn gradient khớp với batch lớn thật.",
  },
  {
    id: "cpu-gpu-04",
    syllabusId: "cpu-gpu",
    difficulty: "apply",
    format: "single-choice",
    stem: "Trong lúc huấn luyện, mức sử dụng GPU dao động quanh 15% còn CPU luôn ở 100%. Nguyên nhân khả dĩ nhất là gì?",
    choices: [
      "Mô hình quá lớn so với GPU.",
      "Pipeline nạp và tiền xử lý dữ liệu là nút cổ chai, GPU phải chờ dữ liệu.",
      "Learning rate quá cao.",
      "Thiếu batch normalization.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: mô hình quá lớn thường gây lỗi hết bộ nhớ, và GPU sẽ bận chứ không rảnh.",
      "Đúng: dấu hiệu CPU đầy tải còn GPU rảnh chỉ đúng với nghẽn ở khâu dữ liệu.",
      "Sai: learning rate ảnh hưởng chất lượng hội tụ, không ảnh hưởng mức sử dụng thiết bị.",
      "Sai: batch norm là lựa chọn kiến trúc, không liên quan tới tải thiết bị.",
    ],
    explanation:
      "Hướng xử lý: tăng `num_workers`, bật `pin_memory`, chuyển augmentation nặng sang dạng rẻ hơn hoặc tiền tính, và lưu dữ liệu ở định dạng đọc nhanh.",
  },
  {
    id: "cpu-gpu-05",
    syllabusId: "cpu-gpu",
    difficulty: "advanced",
    format: "single-choice",
    stem: "Đo thời gian một lượt forward trên GPU bằng `t0 = time.time(); y = model(x); t = time.time() - t0` cho kết quả nhỏ bất thường. Vì sao?",
    choices: [
      "Vì `time.time()` không đủ độ phân giải cho phép đo mili giây.",
      "Vì lệnh GPU chạy bất đồng bộ: hàm trả về ngay khi lệnh được xếp hàng, chưa tính xong; phải gọi `torch.cuda.synchronize()` trước khi lấy mốc thời gian.",
      "Vì lần chạy đầu tiên luôn bị bỏ qua bởi trình biên dịch.",
      "Vì mô hình chưa được chuyển sang chế độ `eval`.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: độ phân giải của `time.time()` đủ dùng ở thang mili giây trên nền tảng hiện đại.",
      "Đúng: CPU chỉ xếp kernel vào hàng đợi rồi đi tiếp, nên mốc thời gian dừng trước khi GPU tính xong.",
      "Sai: không có cơ chế bỏ qua như vậy; tuy nhiên vài lần chạy đầu *chậm* hơn do warm-up.",
      "Sai: `eval()` đổi hành vi lớp chứ không đổi cách đo thời gian.",
    ],
    trap: "Bẫy kép: ngoài tính bất đồng bộ, vài iteration đầu còn tốn thời gian khởi tạo CUDA context và chọn thuật toán cuDNN, nên phép đo đúng phải bỏ vài vòng warm-up rồi lấy trung bình nhiều vòng.",
    explanation:
      "Quy trình đo đúng: chạy warm-up vài chục vòng, `torch.cuda.synchronize()`, đo trung bình nhiều lần lặp, và báo cả độ lệch chuẩn.",
  },

  /* ---------------- data-processing ---------------- */
  {
    id: "data-processing-01",
    syllabusId: "data-processing",
    difficulty: "recall",
    format: "single-choice",
    stem: "Vai trò của tập validation khác tập test ở điểm nào?",
    choices: [
      "Validation dùng để chọn siêu tham số và dừng sớm; test chỉ dùng một lần để ước lượng hiệu năng cuối.",
      "Validation luôn lớn hơn test.",
      "Test dùng trong lúc huấn luyện, validation dùng sau khi huấn luyện.",
      "Hai tập hoàn toàn thay thế nhau được.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: mỗi quyết định dựa trên validation là một lần “tiêu thụ” tập đó, nên cần tập test riêng biệt.",
      "Sai: kích thước tương đối do bài toán quyết định.",
      "Sai: đảo ngược vai trò.",
      "Sai: dùng test để chọn mô hình khiến điểm test mất ý nghĩa.",
    ],
    explanation:
      "Chọn mô hình trên tập test nhiều lần chính là overfitting lên tập test — điểm báo cáo sẽ lạc quan hơn hiệu năng thật.",
  },
  {
    id: "data-processing-02",
    syllabusId: "data-processing",
    difficulty: "understand",
    format: "single-choice",
    stem: "Một cột số có 30% giá trị thiếu, và việc thiếu lại phụ thuộc chính giá trị của nó (ví dụ người thu nhập cao thường không khai). Cách xử lý nào phù hợp nhất?",
    choices: [
      "Điền bằng trung bình của cột và không làm gì thêm.",
      "Xoá toàn bộ các dòng bị thiếu.",
      "Điền giá trị kèm thêm một cột cờ đánh dấu “đã bị thiếu”, để mô hình học được bản thân việc thiếu.",
      "Điền bằng 0 vì 0 là giá trị trung lập.",
    ],
    answerIndex: 2,
    choiceNotes: [
      "Sai: điền trung bình làm co phương sai và xoá mất tín hiệu chứa trong việc thiếu.",
      "Sai: xoá 30% dữ liệu vừa mất mẫu vừa tạo thiên lệch, vì phần bị xoá không ngẫu nhiên.",
      "Đúng: khi cơ chế thiếu mang thông tin, cờ missing thường là đặc trưng có giá trị dự báo.",
      "Sai: 0 là một giá trị hợp lệ trong thang đo, điền 0 sẽ bóp méo phân phối.",
    ],
    explanation:
      "Phân biệt MCAR / MAR / MNAR quyết định cách xử lý. Trường hợp trong đề là MNAR: bản thân sự vắng mặt là dữ liệu, không phải nhiễu cần lấp.",
  },
  {
    id: "data-processing-03",
    syllabusId: "data-processing",
    difficulty: "apply",
    format: "single-choice",
    stem: "Dữ liệu phân loại nhị phân có 990 mẫu lớp 0 và 10 mẫu lớp 1. Mô hình luôn dự đoán 0 đạt accuracy 99%. Cách đánh giá đúng là gì?",
    choices: [
      "Chấp nhận accuracy 99% vì đó là chỉ số chuẩn.",
      "Dùng precision/recall/F1 cho lớp thiểu số, hoặc PR-AUC, và báo cáo kèm confusion matrix.",
      "Đổi sang bài toán hồi quy.",
      "Nhân đôi tập test để cân bằng lớp.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: accuracy bị chi phối bởi lớp đa số nên không phản ánh năng lực phát hiện lớp hiếm.",
      "Đúng: các chỉ số này soi trực tiếp vào lớp thiểu số — thứ mà bài toán thực sự quan tâm.",
      "Sai: bản chất bài toán vẫn là phân loại.",
      "Sai: sửa tập test làm mất tính đại diện cho phân phối thật.",
    ],
    explanation:
      "Với dữ liệu mất cân bằng nặng, mô hình hằng số luôn là baseline bắt buộc phải vượt qua. Nếu chỉ số nào không phân biệt nổi mô hình của bạn với baseline hằng số thì chỉ số đó vô dụng ở đây.",
  },
  {
    id: "data-processing-04",
    syllabusId: "data-processing",
    difficulty: "apply",
    format: "numeric",
    stem: "Bộ dữ liệu 1.000 dòng: 80 dòng thiếu ở cột A, 50 dòng thiếu ở cột B, trong đó 20 dòng thiếu cả hai cột. Nếu xoá mọi dòng có ít nhất một giá trị thiếu, còn lại bao nhiêu dòng?",
    answer: 890,
    tolerance: 0,
    calculation: [
      "Số dòng thiếu ít nhất một cột = |A ∪ B| = 80 + 50 − 20 = 110.",
      "Số dòng còn lại = 1000 − 110 = 890.",
    ],
    explanation:
      "Bao hàm–loại trừ là bước tính bắt buộc trước khi quyết định `dropna()`. Ở đây mất 11% dữ liệu; nếu tỷ lệ đó cao hơn, phải cân nhắc điền giá trị thay vì xoá.",
  },
  {
    id: "data-processing-05",
    syllabusId: "data-processing",
    difficulty: "advanced",
    format: "multi-select",
    stem: "Dữ liệu là log giao dịch theo thời gian, mỗi khách hàng có nhiều dòng. Chọn tất cả phát biểu đúng về cách chia dữ liệu.",
    choices: [
      "Chia ngẫu nhiên theo dòng khiến giao dịch tương lai của cùng một khách lọt vào train, gây leakage.",
      "Nên chia theo mốc thời gian: train là quá khứ, test là tương lai.",
      "Nếu bài toán dự báo ở mức khách hàng, nên chia theo nhóm khách (`GroupKFold`) để một khách không nằm ở cả hai phía.",
      "`KFold` xáo trộn ngẫu nhiên luôn là lựa chọn an toàn cho dữ liệu chuỗi thời gian.",
      "Các dòng trùng lặp gần như hoàn toàn nên được kiểm tra trước khi chia, vì chúng có thể xuất hiện ở cả train lẫn test.",
    ],
    answerIndexes: [0, 1, 2, 4],
    choiceNotes: [
      "Đúng: mô hình được nhìn thấy tương lai — điểm test sẽ cao giả tạo.",
      "Đúng: chia theo thời gian mô phỏng đúng cách mô hình được dùng trong thực tế.",
      "Đúng: `GroupKFold` chặn rò rỉ danh tính giữa các fold.",
      "Sai: xáo trộn ngẫu nhiên phá vỡ trật tự thời gian và là nguồn leakage điển hình.",
      "Đúng: bản sao gần đúng là dạng leakage khó thấy nhưng rất phổ biến trong dữ liệu log.",
    ],
    scoring: "all-or-nothing",
    trap: "Ba nguồn leakage ở đây chồng lên nhau (thời gian, danh tính, trùng lặp) nên chỉ xử lý một nguồn vẫn cho kết quả lạc quan sai.",
    explanation:
      "Câu hỏi cần đặt trước mọi lần chia dữ liệu: “ở thời điểm dự đoán thật, mô hình được phép biết những gì?”. Cách chia phải tái tạo đúng ranh giới đó.",
  },

  /* ---------------- feature-engineering ---------------- */
  {
    id: "feature-engineering-01",
    syllabusId: "feature-engineering",
    difficulty: "recall",
    format: "single-choice",
    stem: "Khi nào nên dùng one-hot encoding thay vì gán số nguyên (label encoding) cho biến hạng mục?",
    choices: [
      "Khi các hạng mục không có thứ tự tự nhiên và mô hình diễn giải giá trị số theo thang đo.",
      "Khi số hạng mục rất lớn, vì one-hot tiết kiệm bộ nhớ hơn.",
      "Khi biến hạng mục là nhãn cần dự đoán.",
      "Luôn luôn, với mọi mô hình và mọi biến hạng mục.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: mã hoá số nguyên sẽ áp đặt quan hệ thứ tự và khoảng cách không có thật.",
      "Sai: one-hot làm số chiều phình theo số hạng mục, tốn bộ nhớ hơn.",
      "Sai: đây là chuyện mã hoá đặc trưng đầu vào, không phải nhãn.",
      "Sai: mô hình dựa trên cây xử lý được mã hoá số nguyên; hạng mục nhiều mức lại cần kỹ thuật khác.",
    ],
    explanation:
      "Với hồi quy tuyến tính hay mạng nơ-ron, `màu = 3` ngụ ý “lớn gấp ba `màu = 1`”. One-hot loại bỏ giả định sai đó.",
  },
  {
    id: "feature-engineering-02",
    syllabusId: "feature-engineering",
    difficulty: "understand",
    format: "single-choice",
    stem: "Vì sao target encoding (thay hạng mục bằng trung bình nhãn của hạng mục đó) rất dễ gây leakage?",
    choices: [
      "Vì nó làm tăng số chiều dữ liệu.",
      "Vì giá trị mã hoá của mỗi dòng được tính có chứa chính nhãn của dòng đó, nhất là ở hạng mục hiếm.",
      "Vì nó chỉ dùng được cho bài toán hồi quy.",
      "Vì nó luôn tạo ra giá trị thiếu ở tập test.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: target encoding *giảm* số chiều so với one-hot.",
      "Đúng: ở hạng mục chỉ xuất hiện một lần, giá trị mã hoá chính là nhãn của dòng đó.",
      "Sai: dùng được cho cả phân loại (trung bình xác suất lớp).",
      "Sai: hạng mục mới ở test cần giá trị dự phòng, nhưng đó là vấn đề riêng, không phải bản chất leakage.",
    ],
    explanation:
      "Cách làm an toàn: tính mã hoá theo out-of-fold (mỗi fold dùng thống kê từ các fold còn lại) và làm mượt về trung bình toàn cục theo tần suất hạng mục.",
  },
  {
    id: "feature-engineering-03",
    syllabusId: "feature-engineering",
    difficulty: "apply",
    format: "single-choice",
    stem: "Biến “thu nhập” lệch phải rất mạnh, đa số giá trị nhỏ và một ít giá trị cực lớn. Với mô hình tuyến tính, phép biến đổi nào thường hợp lý nhất?",
    choices: [
      "Không biến đổi, vì mô hình tuyến tính tự xử lý được.",
      "Biến đổi `log(1 + x)` để nén đuôi phải và làm quan hệ gần tuyến tính hơn.",
      "Bình phương giá trị để tách biệt các mẫu lớn.",
      "Chuyển thành biến nhị phân theo ngưỡng trung bình.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: vài giá trị cực lớn sẽ chi phối hàm bình phương sai số.",
      "Đúng: `log1p` nén đuôi, giảm ảnh hưởng điểm cực trị và xử lý được giá trị 0.",
      "Sai: bình phương làm đuôi phải nặng hơn nữa.",
      "Sai: nhị phân hoá vứt bỏ phần lớn thông tin định lượng.",
    ],
    explanation:
      "Với biến dương lệch phải, `log1p` là lựa chọn mặc định hợp lý. Nhớ rằng khi đó hệ số được diễn giải theo thay đổi tương đối, không phải tuyệt đối.",
  },
  {
    id: "feature-engineering-04",
    syllabusId: "feature-engineering",
    difficulty: "apply",
    format: "single-choice",
    stem: "Nhãn phụ thuộc vào tích của hai đặc trưng `x1 · x2`. Mô hình nào cần bạn tạo đặc trưng tương tác một cách tường minh nhất?",
    choices: [
      "Hồi quy tuyến tính.",
      "Random forest.",
      "Gradient boosting trên cây.",
      "Mạng nơ-ron nhiều lớp.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: mô hình tuyến tính chỉ cộng các đóng góp riêng lẻ, không tự tạo được tích.",
      "Sai: cây xấp xỉ được tương tác qua các lần chia lồng nhau.",
      "Sai: tương tự cây, boosting nắm được tương tác qua độ sâu.",
      "Sai: lớp ẩn phi tuyến cho phép xấp xỉ tương tác.",
    ],
    explanation:
      "Đây là lý do feature engineering quan trọng nhất với mô hình tuyến tính: sức mạnh của nó bị giới hạn bởi không gian đặc trưng mà bạn cung cấp.",
  },
  {
    id: "feature-engineering-05",
    syllabusId: "feature-engineering",
    difficulty: "advanced",
    format: "true-false-set",
    stem: "Một đặc trưng hạng mục có 50.000 mức (ví dụ mã sản phẩm). Xét các phát biểu.",
    statements: [
      {
        text: "One-hot encoding trực tiếp tạo ra 50.000 cột thưa, thường không khả thi với mô hình dày đặc.",
        answer: true,
        note: "Ngoài chi phí bộ nhớ, số tham số phình lên khiến mô hình dễ overfit trên các mức hiếm.",
      },
      {
        text: "Học một embedding có số chiều thấp là cách xử lý phổ biến trong mô hình mạng nơ-ron.",
        answer: true,
        note: "Embedding học được chia sẻ thông tin giữa các mức và giữ số chiều ở mức kiểm soát được.",
      },
      {
        text: "Gộp mọi mức có tần suất rất thấp vào một nhóm “khác” là kỹ thuật hợp lệ.",
        answer: true,
        note: "Nó giảm số mức, đồng thời tạo sẵn chỗ chứa cho những mức chưa từng thấy ở tập test.",
      },
      {
        text: "Vì đặc trưng có rất nhiều mức nên nó chắc chắn mang nhiều thông tin dự báo hơn các đặc trưng ít mức.",
        answer: false,
        note: "Số mức cao không đồng nghĩa với sức dự báo; thậm chí một khoá gần như duy nhất cho mỗi dòng còn là nguồn overfitting.",
      },
    ],
    trap: "Ý (d) đánh vào trực giác “nhiều thông tin hơn thì tốt hơn”. Thực tế đặc trưng gần như định danh cho mỗi dòng có thể ghi nhớ tập train mà không tổng quát hoá được chút nào.",
    explanation:
      "Ba hướng xử lý hạng mục nhiều mức: gộp mức hiếm, embedding học được, hoặc target encoding out-of-fold có làm mượt. Chọn hướng nào phụ thuộc mô hình đang dùng.",
  },
];
