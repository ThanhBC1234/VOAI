import type { LessonTheoryMap } from "./types";

export const foundationsMlTheory = {
  // Các bài 01–22 được bổ sung theo schema LessonDeepTheory.
  "foundation-python": {
    lessonId: "foundation-python",
    readingMinutes: 28,
    openingQuestions: [
      "Vì sao chương trình chạy được vẫn có thể tạo dữ liệu sai?",
      "Tên biến và đối tượng khác nhau thế nào trong Python?",
      "Cần ghi gì để chạy lại một thí nghiệm có ngẫu nhiên?",
    ],
    sections: [
      {
        title: "Tên, đối tượng và hợp đồng dữ liệu",
        paragraphs: [
          "Trong Python, phép gán gắn một tên với một đối tượng chứ không mặc nhiên sao chép. Hai tên có thể cùng trỏ tới một list, nên sửa qua tên thứ nhất làm kết quả nhìn qua tên thứ hai thay đổi. Tuple bất biến vẫn có thể chứa một list khả biến; cần phân biệt bất biến của vỏ với bất biến sâu.",
          "Pipeline AI nên coi shape, dtype, miền nhãn và quan hệ X[i]–y[i] là hợp đồng. Type hint giúp người đọc nhưng không kiểm tra runtime; assert, exception có thông báo và test biên mới bảo vệ hợp đồng. Hàm biến đổi nên trả dữ liệu mới hoặc nói rõ nó sửa tại chỗ.",
        ],
        bullets: ["Không dùng list/dict mutable làm giá trị mặc định.", "Tách parse, validate, transform và split.", "Chỉ dùng zip sau khi xác nhận các dãy cùng độ dài."],
      },
      {
        title: "Iterator, lỗi và tính tái lập",
        paragraphs: [
          "Iterator sinh từng phần tử và có thể chỉ duyệt một lần; generator giúp đọc dữ liệu lớn mà không giữ toàn bộ trong RAM. Nếu duyệt generator để đếm rồi duyệt lần nữa, lượt sau có thể rỗng. Khi cần nhiều lượt, hãy tạo lại iterator hoặc vật hóa có chủ đích.",
          "Seed chỉ kiểm soát nguồn ngẫu nhiên tương ứng. Bản ghi tái lập tối thiểu gồm seed, phiên bản thư viện, cấu hình, cách chia và hash dữ liệu. Không gọi seed lại trong mỗi batch vì sẽ lặp cùng chuỗi.",
        ],
        formulas: ["len(X)=len(y)", "train ∩ validation = train ∩ test = validation ∩ test = ∅"],
      },
      {
        title: "Kiến trúc script và chi phí",
        paragraphs: [
          "Module nên được import mà không tự nạp dữ liệu hay huấn luyện. Đặt luồng chạy trong main, truyền cấu hình vào hàm và trả metric thay vì phụ thuộc biến toàn cục. Context manager bảo đảm file được đóng khi có exception.",
          "Đọc n hàng, d cột cần Θ(nd) thời gian. Generator có thể hạ bộ nhớ làm việc về Θ(d), còn comprehension chỉ ngắn hơn chứ không tự nhanh như vector hóa. Tối ưu sau khi đo và tránh vòng lặp lồng ngoài ý muốn.",
        ],
        formulas: ["T_read(n,d)=Θ(nd)", "M_eager=Θ(nd), M_stream=Θ(d)"],
      },
    ],
    workedExamples: [{
      title: "Chia sáu mẫu không làm lệch nhãn",
      problem: "X shape (6,3), y shape (6,), hoán vị [4,0,5,2,1,3]. Chia 50% train, 1/6 validation, còn lại test.",
      steps: [
        { state: "n_train=floor(6×0.5)=3; n_val=floor(6/6)=1", explanation: "Công bố quy tắc làm tròn để kết quả duy nhất." },
        { state: "train=[4,0,5], val=[2], test=[1,3]", explanation: "Cắt một hoán vị bảo đảm ba tập rời nhau và phủ range(6)." },
        { state: "X_train shape (3,3); y_train shape (3,)", explanation: "Dùng cùng index giữ nguyên cặp mẫu–nhãn." },
        { state: "sorted(train+val+test)=[0,1,2,3,4,5]", explanation: "Kiểm tra phủ và mỗi chỉ số đúng một lần." },
      ],
      conclusion: "Chỉ hoán vị chỉ số một lần rồi áp dụng đồng bộ cho X và y.",
      sanityChecks: ["Cùng seed cho cùng kết quả.", "Ba tập đôi một rời.", "n=0 và tỉ lệ 0 không gây lỗi."],
    }],
    implementationChecklist: ["Kiểm tra shape/dtype.", "Không dùng RNG toàn cục ẩn.", "Tách I/O khỏi biến đổi.", "Test đầu vào rỗng và biên.", "Ghi seed và phiên bản môi trường."],
    masteryChecklist: ["Giải thích alias khác copy.", "Dự đoán generator bị tiêu thụ.", "Tự viết bộ chia rời nhau.", "Đọc traceback đúng tầng.", "Phân tích thời gian và bộ nhớ."],
    glossary: [
      { term: "Alias", definition: "Tên khác cùng tham chiếu một đối tượng." },
      { term: "Mutable", definition: "Đối tượng có thể đổi trạng thái." },
      { term: "Iterator", definition: "Nguồn cung cấp lần lượt phần tử và có thể bị tiêu thụ." },
      { term: "Invariant", definition: "Điều kiện phải luôn đúng." },
      { term: "Reproducibility", definition: "Khả năng tái tạo kết quả dưới cấu hình và dữ liệu đã ghi." },
    ],
    sourceIds: ["ioai-2026", "d2l-vi"],
  },
  "foundation-numpy-tensors": {
    lessonId: "foundation-numpy-tensors",
    readingMinutes: 32,
    openingQuestions: ["Shape đúng có đủ chứng minh phép toán đúng ý nghĩa?", "Broadcasting ghép trục theo quy tắc nào?", "Vì sao softmax trực tiếp có thể tràn số?"],
    sections: [
      {
        title: "Shape, trục và ngữ nghĩa",
        paragraphs: [
          "Mỗi trục tensor phải có tên ngữ nghĩa như batch, thời gian, kênh hay đặc trưng. X shape (n,d) nhân W shape (d,k) cho (n,k); một transpose nhầm đôi khi vẫn chạy nhưng trộn sai mẫu với đặc trưng. Hãy chú thích shape tại biên mỗi hàm.",
          "Reduction loại một trục trừ khi keepdims=true. mean(axis=0) trên (n,d) tính theo đặc trưng, còn axis=1 tính theo mẫu. Slicing cơ bản thường cho view; advanced indexing thường cho copy, nên phép sửa có thể hoặc không lan về mảng gốc.",
        ],
        formulas: ["(n,d) @ (d,k) → (n,k)", "μ_j=(1/n)Σ_i X_ij"],
      },
      {
        title: "Broadcasting và vector hóa",
        paragraphs: [
          "Broadcasting so kích thước từ trục cuối: hai kích thước phải bằng nhau hoặc một bên bằng 1. Vector μ shape (d,) trừ được khỏi X shape (n,d). Reshape chỉ để làm code chạy mà không xác định ý nghĩa trục là nguồn lỗi nguy hiểm.",
          "Vector hóa giảm overhead Python nhưng không đổi Big-O. Khoảng cách cặp có thể dùng ||a||²+||b||²−2a·b, tránh tensor (n,m,d); cần clamp sai số âm rất nhỏ về 0.",
        ],
        formulas: ["D²=||A||²_row+||B||²_rowᵀ−2ABᵀ", "broadcast hợp lệ nếu a=b hoặc a=1 hoặc b=1"],
      },
      {
        title: "Dtype và ổn định số",
        paragraphs: [
          "float32 nhanh và tiết kiệm hơn float64 nhưng có ít chữ số chính xác. Phép chia số nguyên, overflow exp, log(0) và phép trừ hai số gần nhau đều cần được chủ động xử lý; epsilon phải có mục đích, không dùng để che dữ liệu vô hạn.",
          "Softmax ổn định trừ max logit trước exp vì dịch mọi logit cùng hằng số không đổi xác suất. Transpose có thể tạo bố trí không contiguous, khiến reshape hoặc kernel sau đó phải copy.",
        ],
        formulas: ["softmax(z)_k=exp(z_k−m)/Σ_j exp(z_j−m), m=max(z)", "Z_ij=(X_ij−μ_j)/(σ_j+ε)"],
      },
    ],
    workedExamples: [{
      title: "Chuẩn hóa đúng trục",
      problem: "X=[[1,2,3],[3,4,7]] shape (2,3). Chuẩn hóa từng cột bằng population standard deviation.",
      steps: [
        { state: "μ=[2,3,5], shape (3,)", explanation: "Mỗi trung bình ứng với một đặc trưng." },
        { state: "X−μ=[[-1,-1,-2],[1,1,2]]", explanation: "μ broadcast qua trục batch." },
        { state: "σ=[1,1,2], shape (3,)", explanation: "Dùng ddof=0 cho population std." },
        { state: "Z=[[-1,-1,-1],[1,1,1]]", explanation: "Mỗi cột có mean 0 và std 1." },
      ],
      conclusion: "Axis mang ý nghĩa thống kê; chọn nhầm axis vẫn có thể trả số hợp lệ.",
      sanityChecks: ["Z.mean(axis=0)≈0.", "Z.std(axis=0)≈1.", "X gốc không đổi nếu hàm không in-place."],
    }],
    implementationChecklist: ["Ghi tên và shape từng trục.", "Test broadcast bằng mảng nhỏ.", "Ép float trước chia/log.", "Dùng softmax ổn định.", "Đo bộ nhớ của tensor trung gian."],
    masteryChecklist: ["Suy luận shape không chạy code.", "Phân biệt view/copy.", "Vector hóa khoảng cách cặp.", "Giải thích trừ max.", "Phát hiện axis sai ngữ nghĩa."],
    glossary: [{ term: "Axis", definition: "Trục tensor gắn với ý nghĩa dữ liệu." }, { term: "Broadcasting", definition: "Mở rộng logic các trục tương thích." }, { term: "View", definition: "Mảng dùng chung vùng nhớ với nguồn." }, { term: "Dtype", definition: "Kiểu biểu diễn phần tử." }, { term: "Numerical stability", definition: "Thiết kế phép tính hạn chế overflow, underflow và mất chính xác." }],
    sourceIds: ["d2l-vi", "d2l-en", "mml"],
  },
  "foundation-math-linear-algebra": {
    lessonId: "foundation-math-linear-algebra",
    readingMinutes: 38,
    openingQuestions: ["Tích vô hướng mang ý nghĩa hình học gì?", "Rank thấp khác kém điều kiện thế nào?", "SVD liên hệ gì với PCA?"],
    sections: [
      {
        title: "Vector, chuẩn và phép chiếu",
        paragraphs: [
          "Vector có thể là điểm, hướng hoặc danh sách đặc trưng. Tích vô hướng đo độ thẳng hàng có trọng số; cosine bỏ ảnh hưởng độ dài, chỉ phù hợp khi độ lớn không mang tín hiệu cần giữ.",
          "Chiếu x lên vector đơn vị u cho (x·u)u; residual vuông góc u. Bình phương khoảng cách tới một không gian con nhỏ nhất khi residual trực giao với mọi hướng trong không gian đó.",
        ],
        formulas: ["x·w=Σ_jx_jw_j=||x||||w||cosθ", "proj_u(x)=(x·u)u khi ||u||=1"],
      },
      {
        title: "Ma trận, rank và điều kiện",
        paragraphs: [
          "Ma trận là ánh xạ tuyến tính; rank là số hướng độc lập còn lại. Đặc trưng phụ thuộc tuyến tính khiến nhiều hệ số cho cùng dự đoán và XᵀX có thể suy biến.",
          "Condition number lớn làm nhiễu nhỏ khuếch đại trong nghiệm. Dùng solve, QR hoặc SVD thay vì tính inverse chỉ để giải Ax=b. Regularization giảm độ nhạy nhưng không làm dữ liệu tự nhiên đầy rank.",
        ],
        formulas: ["rank(X)≤min(n,d)", "κ(A)=σ_max/σ_min", "min_w ||Xw−y||₂²"],
      },
      {
        title: "Trị riêng, SVD và hạng thấp",
        paragraphs: [
          "Eigenvector là hướng chỉ bị co giãn bởi ánh xạ vuông. SVD áp dụng cho mọi X=UΣVᵀ; singular value đo độ mạnh theo cặp hướng. Dấu singular vector không duy nhất nhưng phép tái tạo không đổi.",
          "Giữ k singular values lớn nhất cho xấp xỉ hạng k tốt nhất theo chuẩn Frobenius. Với dữ liệu đã center, PCA dùng các hướng V đầu để giữ phương sai tối đa.",
        ],
        formulas: ["X=UΣVᵀ", "X_k=U[:,:k]Σ_kV[:,:k]ᵀ theo chỉ số 0-based", "ratio_k=Σ_{j≤k}σ_j²/Σ_jσ_j²"],
      },
    ],
    workedExamples: [{
      title: "Tách phần song song và vuông góc",
      problem: "x=[3,1], u=[1/√2,1/√2], đều shape (2,). Tính projection và residual.",
      steps: [
        { state: "x·u=(3+1)/√2=2√2", explanation: "Tọa độ có dấu trên hướng u." },
        { state: "proj=2√2u=[2,2]", explanation: "Projection nằm trên đường y=x." },
        { state: "r=x−proj=[1,−1]", explanation: "Residual là phần một chiều u không biểu diễn." },
        { state: "r·u=0; ||x||²=10=8+2", explanation: "Trực giao và Pythagoras xác nhận kết quả." },
      ],
      conclusion: "Least squares tổng quát hóa phép chiếu này lên không gian cột.",
      sanityChecks: ["proj+r=x.", "Projection cùng shape (2,).", "Đổi u thành −u không đổi projection."],
    }],
    implementationChecklist: ["Chú thích chiều ma trận.", "Kiểm tra trực giao bằng tolerance.", "Dùng solve/SVD thay inverse.", "Center trước PCA.", "Báo explained variance khi chọn rank."],
    masteryChecklist: ["Giải thích dot product bằng góc.", "Tự tính projection 2D.", "Phân biệt rank và conditioning.", "Giải thích dấu SVD.", "Liên hệ SVD–PCA–least squares."],
    glossary: [{ term: "Basis", definition: "Tập vector độc lập sinh không gian." }, { term: "Rank", definition: "Số chiều độc lập của ma trận." }, { term: "Condition number", definition: "Mức khuếch đại tương đối của nhiễu." }, { term: "Singular value", definition: "Hệ số co giãn không âm trong SVD." }, { term: "Orthogonal", definition: "Hai vector có tích vô hướng bằng 0." }],
    sourceIds: ["mml", "d2l-vi", "pml-intro"],
  },
  "foundation-math-calculus-probability": {
    lessonId: "foundation-math-calculus-probability",
    readingMinutes: 42,
    openingQuestions: ["Gradient nói gì ngoài hướng tăng nhanh nhất?", "Chain rule truyền ảnh hưởng qua mô hình ra sao?", "Xác suất có điều kiện khác xác suất đồng thời thế nào?"],
    sections: [
      {
        title: "Đạo hàm, gradient và chain rule",
        paragraphs: [
          "Đạo hàm là tốc độ thay đổi cục bộ; gradient gom đạo hàm riêng và chỉ hướng tăng nhanh nhất theo chuẩn Euclid. Directional derivative theo hướng đơn vị v là ∇f·v. Gradient bằng 0 chỉ là điểm dừng, không tự chứng minh cực tiểu.",
          "Mô hình là hợp thành nhiều hàm nên chain rule nhân các độ nhạy cục bộ. Backpropagation tái sử dụng các giá trị trung gian trên đồ thị tính toán thay vì khai triển một biểu thức khổng lồ.",
        ],
        formulas: ["D_v f(x)=∇f(x)ᵀv", "dL/dx=(dL/du)(du/dx)", "∇_w(1/2)(wᵀx−y)²=(wᵀx−y)x"],
      },
      {
        title: "Tối ưu và xấp xỉ cục bộ",
        paragraphs: [
          "Gradient descent cập nhật ngược gradient. Learning rate quá lớn có thể vượt qua thung lũng, quá nhỏ hội tụ chậm. Scale đặc trưng khác nhau tạo địa hình kéo dài và làm cùng một learning rate hoạt động không đều.",
          "Taylor bậc một giải thích bước giảm; Hessian mô tả độ cong nhưng tốn O(d²) bộ nhớ. Convexity bảo đảm mọi cực tiểu cục bộ là toàn cục, song mạng sâu thường không convex nên cần theo dõi loss, gradient và validation.",
        ],
        formulas: ["w_{t+1}=w_t−η∇L(w_t)", "f(w+Δ)≈f(w)+∇f(w)ᵀΔ", "H_ij=∂²f/(∂w_i∂w_j)"],
      },
      {
        title: "Xác suất, kỳ vọng và Bayes",
        paragraphs: [
          "Biến ngẫu nhiên ánh xạ kết quả thí nghiệm thành số; phân phối mô tả xác suất chứ không phải danh sách quan sát. Kỳ vọng là trung bình dài hạn, variance đo bình phương độ lệch. Independence mạnh hơn tương quan bằng 0.",
          "Xác suất có điều kiện cập nhật không gian mẫu khi đã biết bằng chứng. Bayes đảo chiều điều kiện bằng prior và likelihood; posterior phụ thuộc cả bằng chứng lẫn base rate. Trong ML, empirical mean xấp xỉ expectation khi mẫu đại diện.",
        ],
        formulas: ["Var(X)=E[X²]−E[X]²", "P(A|B)=P(A∩B)/P(B)", "P(H|D)=P(D|H)P(H)/P(D)"],
      },
    ],
    workedExamples: [{
      title: "Một bước gradient của logistic loss",
      problem: "x=[2,−1] shape (2,), w=[0.5,0.5], y=1, η=0.1. Tính một bước không có bias.",
      steps: [
        { state: "z=w·x=0.5", explanation: "0.5×2+0.5×(−1)=0.5." },
        { state: "p=σ(z)=1/(1+e^−0.5)≈0.6225", explanation: "Đây là xác suất lớp 1." },
        { state: "∇L=(p−y)x≈−0.3775[2,−1]=[−0.7550,0.3775]", explanation: "Chain rule rút gọn gradient cross-entropy logistic." },
        { state: "w_new=w−0.1∇L≈[0.5755,0.46225]", explanation: "Bước đi ngược gradient làm logit cho mẫu dương tăng." },
      ],
      conclusion: "Gradient có cùng shape với w và dấu cập nhật phù hợp nhãn dương.",
      sanityChecks: ["z_new≈0.68875 lớn hơn 0.5.", "Loss mới phải nhỏ hơn loss cũ.", "Finite difference gần gradient giải tích."],
    }],
    implementationChecklist: ["Viết rõ scalar/vector và shape.", "Kiểm tra gradient bằng finite difference.", "Theo dõi norm gradient.", "Không nhầm likelihood với posterior.", "Ghi giả định độc lập."],
    masteryChecklist: ["Tính chain rule nhiều tầng.", "Giải thích learning rate.", "Phân biệt điểm dừng và cực tiểu.", "Dùng Bayes với base rate.", "Tính expectation và variance rời rạc."],
    glossary: [{ term: "Gradient", definition: "Vector đạo hàm riêng chỉ hướng tăng nhanh nhất cục bộ." }, { term: "Chain rule", definition: "Quy tắc đạo hàm của hàm hợp." }, { term: "Likelihood", definition: "Mức phù hợp của dữ liệu khi giả thuyết cố định." }, { term: "Posterior", definition: "Phân phối giả thuyết sau khi quan sát dữ liệu." }, { term: "Random variable", definition: "Ánh xạ kết quả ngẫu nhiên thành giá trị số." }],
    sourceIds: ["mml", "pml-intro", "d2l-vi"],
  },
  "foundation-pandas-visualization": {
    lessonId: "foundation-pandas-visualization",
    readingMinutes: 30,
    openingQuestions: ["Một cột object có thể che giấu những kiểu dữ liệu nào?", "Join làm số hàng tăng khi nào?", "Biểu đồ đẹp nhưng trục sai có thể dẫn đến kết luận gì?"],
    sections: [
      {
        title: "Bảng dữ liệu và schema",
        paragraphs: [
          "Một hàng nên là một đơn vị quan sát, một cột là một biến và một ô là một giá trị. Dtype object có thể trộn số, chuỗi và giá trị thiếu; phải parse ngày, category và số có lỗi thành schema rõ ràng trước khi thống kê.",
          "Missingness không đồng nghĩa số 0. MCAR, MAR và MNAR dẫn tới mức độ lệch khác nhau; ít nhất cần báo tỉ lệ thiếu theo cột và theo nhóm nhãn trước khi chọn bỏ hàng hay impute.",
        ],
        formulas: ["missing_rate_j = count(isna(X[:,j]))/n", "n_unique(key) phải khớp quan hệ khóa dự kiến"],
      },
      {
        title: "Join, groupby và rò rỉ",
        paragraphs: [
          "Merge là phép toán quan hệ, không chỉ ghép cột. Khóa trùng ở cả hai bảng tạo many-to-many và nhân số hàng; luôn dùng validate theo quan hệ dự kiến và indicator để xem hàng không khớp.",
          "Groupby thực hiện split–apply–combine. Aggregate phải có đơn vị rõ ràng và không dùng thông tin tương lai hoặc toàn bộ dataset để tạo feature cho validation. Mọi thống kê target encoding phải được học chỉ trong fold train.",
        ],
        bullets: ["Kiểm tra số hàng trước/sau merge.", "Kiểm tra uniqueness của khóa.", "Không fit imputer/scaler trước khi split."],
      },
      {
        title: "Trực quan hóa có trách nhiệm",
        paragraphs: [
          "Chọn biểu đồ theo câu hỏi: histogram cho phân phối một biến, scatter cho quan hệ hai biến, box/violin cho phân phối theo nhóm, line cho thứ tự thời gian. Bar chart cần baseline 0 khi chiều dài cột mã hóa độ lớn.",
          "Không chỉ nhìn trung bình; hiển thị cỡ mẫu, độ phân tán và outlier. Overplotting cần alpha, sampling hoặc binning. Màu phải có chú giải và không dùng rainbow cho thang liên tục nếu nó tạo ranh giới giả.",
        ],
        formulas: ["mean_g=Σ_{i∈g}x_i/n_g", "IQR=Q3−Q1"],
      },
    ],
    workedExamples: [{
      title: "Phát hiện join nhân bản quan sát",
      problem: "scores shape (4,2): id=[1,2,3,4], score=[8,6,9,7]. meta shape (4,2): id=[1,2,2,3]. Left join theo id.",
      steps: [
        { state: "id=2 khớp hai hàng meta", explanation: "Khóa bên phải không duy nhất nên một điểm số bị lặp." },
        { state: "Kết quả có 5 hàng, shape (5,3)", explanation: "id 1 một hàng, id 2 hai hàng, id 3 một hàng, id 4 một hàng NA." },
        { state: "mean sau join=(8+6+6+9+7)/5=7.2", explanation: "Mẫu id=2 bị đặt trọng số gấp đôi." },
        { state: "mean gốc=(8+6+9+7)/4=7.5", explanation: "Chênh lệch chứng minh join đã làm sai thống kê." },
      ],
      conclusion: "validate='many_to_one' phải báo lỗi để buộc xử lý khóa trùng trước merge.",
      sanityChecks: ["Số hàng không tăng nếu quan hệ many-to-one đúng.", "id=4 được đánh dấu left_only.", "Mean chỉ tính trên đúng đơn vị quan sát."],
    }],
    implementationChecklist: ["Khai báo schema/dtype.", "Báo missing theo nhóm.", "Validate quan hệ merge.", "So số hàng trước/sau.", "Ghi đơn vị và cỡ mẫu trên biểu đồ."],
    masteryChecklist: ["Phân biệt 0 với missing.", "Dự đoán số hàng của join.", "Viết groupby đúng đơn vị.", "Chọn biểu đồ theo câu hỏi.", "Nhận ra leakage từ aggregate."],
    glossary: [{ term: "Tidy data", definition: "Mỗi hàng là quan sát, mỗi cột là biến." }, { term: "Cardinality", definition: "Số giá trị hoặc quan hệ ghép của khóa." }, { term: "Aggregation", definition: "Tóm tắt nhiều quan sát thành thống kê nhóm." }, { term: "Overplotting", definition: "Nhiều điểm chồng khiến mật độ bị che khuất." }, { term: "Missingness", definition: "Cơ chế và mẫu hình khiến giá trị bị thiếu." }],
    sourceIds: ["ioai-2026", "pml-intro"],
  },
  "foundation-sklearn-pipeline": {
    lessonId: "foundation-sklearn-pipeline",
    readingMinutes: 31,
    openingQuestions: ["fit khác transform ở trạng thái nào?", "Vì sao preprocessing trước cross-validation gây leakage?", "Pipeline bảo vệ điều gì và không bảo vệ điều gì?"],
    sections: [
      {
        title: "Estimator và trạng thái đã học",
        paragraphs: [
          "Trong scikit-learn, fit học tham số từ dữ liệu; transform chỉ áp dụng trạng thái đã học; predict sinh đầu ra. StandardScaler học mean/std, imputer học thống kê thay thế, model học hệ số. fit_transform trên validation làm validation tham gia huấn luyện dù không chạm nhãn.",
          "Estimator nên nhận hyperparameter trong constructor và trạng thái học được xuất hiện sau fit. clone tạo estimator chưa fit với cùng hyperparameter; không tái sử dụng một object đã fit giữa các fold.",
        ],
        formulas: ["z=(x−μ_train)/σ_train", "fit: D_train→state; transform: (state,X)→Z"],
      },
      {
        title: "Pipeline và dữ liệu hỗn hợp",
        paragraphs: [
          "Pipeline xâu chuỗi transformer rồi estimator, bảo đảm mỗi fold chỉ fit preprocessing trên train. ColumnTransformer cho phép số được impute/scale, category được impute/one-hot. handle_unknown cần chính sách rõ cho category chỉ xuất hiện lúc test.",
          "Pipeline không tự phát hiện feature chứa tương lai, bản sao target hay group leakage. Split phải theo time, patient, video hoặc nguồn dữ liệu trước khi gọi cross-validation nếu các hàng không độc lập.",
        ],
        bullets: ["Đặt toàn bộ bước học thống kê vào pipeline.", "Dùng tên cột ổn định thay vị trí khi schema có thể đổi.", "Kiểm tra output feature names sau one-hot."],
      },
      {
        title: "Đánh giá và khả năng tái lập",
        paragraphs: [
          "Chọn scorer theo mục tiêu; score cao hơn trong API không phải lúc nào là metric gốc, ví dụ neg_mean_squared_error đổi dấu. Cross-validation trả phân phối điểm, không chỉ trung bình. random_state cần đặt ở splitter và estimator có ngẫu nhiên.",
          "Sau chọn hyperparameter, fit lại pipeline trên train+validation rồi đánh giá đúng một lần trên test khóa kín. Serialization cần lưu cùng phiên bản thư viện và schema; pickle từ nguồn không tin cậy không được nạp.",
        ],
        formulas: ["CV_mean=(1/K)Σ_k score_k", "test chỉ được dùng sau khi khóa lựa chọn"],
      },
    ],
    workedExamples: [{
      title: "Scaler chỉ học từ train",
      problem: "Train X=[[0,10],[2,14],[4,18],[6,22]] shape (4,2); validation=[[8,26],[10,30]] shape (2,2). Dùng population std.",
      steps: [
        { state: "μ_train=[3,16]", explanation: "Không dùng hai hàng validation." },
        { state: "σ_train=[√5,√20]≈[2.236,4.472]", explanation: "Variance lần lượt là 5 và 20." },
        { state: "transform [8,26]→[(8−3)/2.236,(26−16)/4.472]≈[2.236,2.236]", explanation: "Validation có thể nằm ngoài khoảng chuẩn hóa ±1." },
        { state: "Nếu fit toàn bộ, μ=[5,20]", explanation: "Mean này đã nhìn validation và làm điểm CV lạc quan." },
      ],
      conclusion: "Pipeline đặt scaler bên trong fold để fit chỉ trên phần train của fold.",
      sanityChecks: ["Train transformed có mean gần 0.", "Validation không buộc mean 0.", "Pipeline output có 2 cột."],
    }],
    implementationChecklist: ["Split trước mọi fit.", "Đưa preprocessing vào Pipeline.", "Đặt random_state.", "Kiểm tra scorer và dấu.", "Khóa test đến quyết định cuối."],
    masteryChecklist: ["Phân biệt fit/transform.", "Giải thích clone estimator.", "Thiết kế ColumnTransformer.", "Nhận ra group leakage.", "Diễn giải phân phối điểm CV."],
    glossary: [{ term: "Estimator", definition: "Đối tượng học tham số qua fit." }, { term: "Transformer", definition: "Estimator biến đổi X qua transform." }, { term: "Pipeline", definition: "Chuỗi bước được fit/áp dụng theo thứ tự." }, { term: "Leakage", definition: "Thông tin ngoài train đi vào quá trình học hoặc chọn mô hình." }, { term: "Splitter", definition: "Quy tắc tạo các tập train và validation." }],
    sourceIds: ["ioai-2026", "pml-intro"],
  },
  "foundation-pytorch-autograd-device": {
    lessonId: "foundation-pytorch-autograd-device",
    readingMinutes: 35,
    openingQuestions: ["Autograd lưu gì trên computation graph?", "Vì sao gradient tích lũy qua nhiều backward?", "train/eval khác no_grad ở đâu?"],
    sections: [
      {
        title: "Tensor, dtype và device",
        paragraphs: [
          "Tensor PyTorch mang shape, dtype, device và cờ requires_grad. Các toán hạng phải ở device tương thích; nhãn cho CrossEntropyLoss thường là long shape (N,), còn đầu ra logits shape (N,C). Chuyển device trong forward lặp lại gây copy và khó theo dõi.",
          "Dimension batch nên được giữ kể cả batch=1. squeeze không chỉ rõ dim có thể xóa nhầm batch; permute đổi thứ tự trục nhưng có thể tạo tensor non-contiguous.",
        ],
        formulas: ["logits: (N,C), targets: (N,)", "linear: (N,d)@(d,k)+(k,)→(N,k)"],
      },
      {
        title: "Computation graph và backpropagation",
        paragraphs: [
          "Autograd ghi các phép toán tạo tensor khi gradient được theo dõi. backward trên scalar truyền vector–Jacobian product ngược graph và cộng vào .grad của leaf tensor. Vì gradient tích lũy, training loop phải zero_grad có chủ đích trước lượt mới.",
          "detach tách tensor khỏi graph; no_grad tạm ngừng ghi graph. In-place operation trên giá trị cần cho backward có thể làm autograd báo version mismatch. retain_graph chỉ dùng khi thật sự backward nhiều lần trên cùng graph.",
        ],
        formulas: ["∂L/∂x=(∂y/∂x)ᵀ∂L/∂y", "p.grad ← p.grad + ∂L/∂p"],
      },
      {
        title: "Training loop và trạng thái mô hình",
        paragraphs: [
          "Một vòng chuẩn gồm model.train, forward, loss, zero_grad, backward và optimizer.step. model.eval thay hành vi Dropout/BatchNorm nhưng không tắt gradient; inference cần thêm no_grad hoặc inference_mode.",
          "Checkpoint tối thiểu để tiếp tục gần đúng gồm model state, optimizer state, scheduler, epoch, seed và cấu hình. Muốn resume chính xác còn phải lưu trạng thái RNG của Python/NumPy/CPU/CUDA, AMP GradScaler và trạng thái sampler hoặc dataloader khi chúng ảnh hưởng thứ tự batch. Theo dõi loss theo đơn vị mẫu, không trung bình các mean batch như nhau khi batch cuối nhỏ. Gradient clipping xử lý bùng nổ chứ không chữa learning rate hay dữ liệu sai.",
        ],
        formulas: ["epoch_loss=Σ_b loss_b·n_b / Σ_b n_b", "clip: g←g·min(1,c/||g||)"],
      },
    ],
    workedExamples: [{
      title: "Một bước MSE của lớp tuyến tính",
      problem: "X=[[1,2],[0,−1]] shape (2,2), w=[[1],[2]] shape (2,1), b=0, y=[[5],[−1]], η=0.1.",
      steps: [
        { state: "ŷ=Xw+b=[[5],[−2]] shape (2,1)", explanation: "Hàng đầu khớp, hàng sau sai −1." },
        { state: "L=mean((ŷ−y)²)=(0²+(−1)²)/2=0.5", explanation: "Reduction mean chia cho N=2." },
        { state: "∇w=(2/N)Xᵀ(ŷ−y)=[[0],[1]]; ∇b=−1", explanation: "Gradient có cùng shape với tham số." },
        { state: "w_new=[[1],[1.9]], b_new=0.1", explanation: "Optimizer đi ngược gradient." },
      ],
      conclusion: "Sau bước, loss phải giảm; zero_grad thiếu sẽ làm bước sau cộng thêm gradient cũ.",
      sanityChecks: ["w.grad shape (2,1).", "b.grad là scalar.", "Forward mới cho hàng đầu 4.9."],
    }],
    implementationChecklist: ["Assert shape/dtype/device.", "zero_grad trước backward.", "Dùng train/eval đúng pha.", "Dùng no_grad khi đánh giá.", "Lưu optimizer trong checkpoint."],
    masteryChecklist: ["Vẽ computation graph nhỏ.", "Tính gradient ví dụ bằng tay.", "Giải thích tích lũy gradient.", "Phân biệt eval và no_grad.", "Khôi phục training từ checkpoint."],
    glossary: [{ term: "Leaf tensor", definition: "Tensor gốc nhận gradient trong .grad." }, { term: "Autograd", definition: "Hệ thống vi phân tự động của PyTorch." }, { term: "Detach", definition: "Tạo tensor chia sẻ dữ liệu nhưng tách graph." }, { term: "Checkpoint", definition: "Gói trạng thái được lưu với phạm vi phù hợp mục tiêu suy luận hoặc tiếp tục huấn luyện." }, { term: "Computation graph", definition: "Đồ thị phép toán dùng để truyền gradient ngược." }],
    sourceIds: ["ioai-2026", "d2l-vi", "d2l-en"],
  },
  "ml-linear-regression": {
    lessonId: "ml-linear-regression",
    readingMinutes: 36,
    openingQuestions: ["Least squares đang tối ưu đại lượng nào?", "Hệ số có thể diễn giải nhân quả không?", "Normal equation thất bại khi nào?"],
    sections: [
      {
        title: "Mô hình tuyến tính và residual",
        paragraphs: [
          "Hồi quy tuyến tính giả sử kỳ vọng của y là tổ hợp tuyến tính của đặc trưng: ŷ=Xw+b. Tuyến tính theo tham số không có nghĩa quan hệ với biến gốc luôn là đường thẳng; có thể đưa x² hoặc interaction vào X nhưng mô hình vẫn tuyến tính theo w.",
          "Residual e=y−ŷ là sai số trên dữ liệu quan sát. Least squares chọn tham số giảm tổng bình phương residual, nên phạt mạnh outlier. Hệ số mô tả thay đổi dự đoán khi giữ các feature khác cố định; không tự mang ý nghĩa nhân quả.",
        ],
        formulas: ["ŷ=Xw+b", "MSE=(1/n)||Xw+b−y||₂²", "R²=1−SS_res/SS_tot"],
      },
      {
        title: "Nghiệm, gradient và điều kiện",
        paragraphs: [
          "Thêm cột 1 vào design matrix để gộp bias. Nếu XᵀX khả nghịch, nghiệm đóng là (XᵀX)⁻¹Xᵀy, nhưng triển khai nên dùng lstsq/QR/SVD để tránh inverse và xử lý rank thiếu.",
          "Gradient descent phù hợp dữ liệu lớn và mở đường sang mô hình khác. Feature scale chênh lệch làm các hướng có độ cong khác nhau; chuẩn hóa giúp bước học đồng đều. Learning curve và residual plot hữu ích hơn chỉ nhìn train MSE.",
        ],
        formulas: ["∇_w MSE=(2/n)Xᵀ(Xw−y)", "w*=argmin_w ||Xw−y||²"],
      },
      {
        title: "Giả định và chẩn đoán",
        paragraphs: [
          "Diễn giải thống kê cổ điển thường cần tuyến tính có điều kiện, residual độc lập, phương sai tương đối ổn định và không đa cộng tuyến hoàn hảo. Dự đoán có thể vẫn hữu ích khi một số giả định inference không đúng, nhưng uncertainty và p-value không còn đáng tin.",
          "Residual có hình cong báo thiếu phi tuyến; hình phễu báo heteroscedasticity; điểm leverage cao có thể kéo đường hồi quy. Luôn so với baseline dự đoán mean và đánh giá trên dữ liệu chưa dùng để fit.",
        ],
        bullets: ["Không báo R² mà bỏ MAE/RMSE.", "Không extrapolate xa miền train mà không cảnh báo.", "Kiểm tra target transform nếu phân phối lệch mạnh."],
      },
    ],
    workedExamples: [{
      title: "Giải đường thẳng qua ba điểm",
      problem: "x=[0,1,2], y=[1,3,5]. Design có bias X=[[1,0],[1,1],[1,2]] shape (3,2).",
      steps: [
        { state: "XᵀX=[[3,3],[3,5]]; Xᵀy=[9,13]", explanation: "Hai phương trình chuẩn ứng với bias và slope." },
        { state: "3b+3a=9; 3b+5a=13", explanation: "Trừ hai phương trình cho 2a=4." },
        { state: "a=2, b=1", explanation: "Thế lại phương trình đầu." },
        { state: "ŷ=[1,3,5], residual=[0,0,0], MSE=0", explanation: "Ba điểm nằm đúng trên một đường." },
      ],
      conclusion: "Nghiệm chính xác ở ví dụ sạch không bảo đảm mô hình phù hợp dữ liệu có nhiễu hoặc phi tuyến.",
      sanityChecks: ["w shape (2,).", "Xw shape (3,).", "Gradient tại nghiệm bằng 0."],
    }],
    implementationChecklist: ["Thêm bias đúng một lần.", "Dùng lstsq thay inverse.", "Fit scaler chỉ trên train.", "Vẽ residual.", "So baseline mean."],
    masteryChecklist: ["Suy ra gradient MSE.", "Giải ví dụ bằng normal equations.", "Giải thích R² âm.", "Nhận ra heteroscedasticity.", "Phân biệt dự đoán với nhân quả."],
    glossary: [{ term: "Residual", definition: "Chênh lệch y−ŷ trên quan sát." }, { term: "Least squares", definition: "Tiêu chuẩn tối thiểu tổng bình phương sai số." }, { term: "Leverage", definition: "Mức bất thường của vị trí feature so với phần còn lại." }, { term: "Heteroscedasticity", definition: "Phương sai residual thay đổi theo mức dự đoán hoặc feature." }, { term: "Coefficient", definition: "Trọng số tuyến tính gắn với một feature." }],
    sourceIds: ["ioai-2026", "mml", "pml-intro"],
  },
  "ml-logistic-regression": {
    lessonId: "ml-logistic-regression",
    readingMinutes: 37,
    openingQuestions: ["Vì sao hồi quy logistic là classifier tuyến tính?", "Logit khác xác suất thế nào?", "Ngưỡng 0.5 có phải luôn tối ưu?"],
    sections: [
      {
        title: "Logit, sigmoid và biên quyết định",
        paragraphs: [
          "Mô hình tạo logit z=wᵀx+b rồi biến thành p(y=1|x)=sigmoid(z). Sigmoid đơn điệu nên ngưỡng p=0.5 tương ứng z=0, một siêu phẳng tuyến tính trong feature space. Feature phi tuyến có thể làm biên cong trong không gian gốc.",
          "Odds=p/(1−p), log-odds=log(odds)=z. Hệ số w_j là thay đổi log-odds khi x_j tăng một đơn vị và các feature khác giữ nguyên; scale của feature quyết định độ lớn hệ số.",
        ],
        formulas: ["σ(z)=1/(1+e^(−z))", "log(p/(1−p))=wᵀx+b", "boundary: wᵀx+b=0"],
      },
      {
        title: "Likelihood và cross-entropy",
        paragraphs: [
          "Bernoulli likelihood nhân xác suất của nhãn quan sát. Lấy negative log biến tích thành tổng và cho binary cross-entropy. Loss convex theo w với feature cố định; dữ liệu tách hoàn hảo có thể làm norm hệ số tăng vô hạn nếu không regularize.",
          "Cài đặt ổn định nên dùng logits trực tiếp với softplus hoặc BCEWithLogitsLoss, không tính sigmoid rồi log. Gradient (p−y)x cho thấy mẫu dự đoán sai tự tạo cập nhật lớn hơn.",
        ],
        formulas: ["L=−Σ_i[y_i log p_i+(1−y_i)log(1−p_i)]", "∇_w L=Σ_i(p_i−y_i)x_i"],
      },
      {
        title: "Ngưỡng, calibration và đa lớp",
        paragraphs: [
          "Ngưỡng phải gắn với chi phí false positive/false negative và prevalence. ROC/PR khảo sát nhiều ngưỡng; dự đoán xác suất tốt còn cần calibration, nghĩa là trong nhóm p≈0.8 khoảng 80% thật sự dương. Với lớp hiếm, precision–recall thường cho góc nhìn trực tiếp hơn accuracy.",
          "Đa lớp dùng one-vs-rest hoặc softmax multinomial. Softmax logits chỉ xác định tới một hằng số chung; trừ max giữ nguyên xác suất. Class weight thay objective, không tự sửa xác suất theo prevalence mới.",
        ],
        formulas: ["softmax(z)_c=exp(z_c)/Σ_jexp(z_j)", "predict 1 nếu p≥τ"],
      },
    ],
    workedExamples: [{
      title: "Từ logit đến loss và confusion",
      problem: "Ba logit z=[−2,0,1.386], nhãn y=[0,0,1], shape (3,). Dùng ngưỡng p≥0.5.",
      steps: [
        { state: "p≈[0.119,0.500,0.800]", explanation: "Áp dụng sigmoid từng logit." },
        { state: "ŷ=[0,1,1]", explanation: "Quy ước ≥ khiến p=0.5 thành lớp 1." },
        { state: "TN=1, FP=1, TP=1, FN=0", explanation: "Đếm theo từng cặp y và ŷ." },
        { state: "BCE≈[0.1269+0.6931+0.2231]/3=0.3477", explanation: "Lấy mean negative log-likelihood." },
      ],
      conclusion: "Đổi ngưỡng thay confusion nhưng không thay xác suất hay BCE của mô hình.",
      sanityChecks: ["Mọi p nằm trong (0,1).", "Loss không âm.", "Logit 1.386 cho odds gần 4."],
    }],
    implementationChecklist: ["Dùng loss nhận logits.", "Scale feature trong pipeline.", "Chọn ngưỡng trên validation.", "Báo calibration nếu dùng xác suất.", "Xử lý đa lớp rõ chiến lược."],
    masteryChecklist: ["Đổi logit↔odds↔p.", "Suy ra gradient BCE.", "Giải thích biên tuyến tính.", "Chọn ngưỡng theo chi phí.", "Phân biệt discrimination và calibration."],
    glossary: [{ term: "Logit", definition: "Log-odds chưa chặn trên trục số thực." }, { term: "Odds", definition: "Tỉ số p/(1−p)." }, { term: "Cross-entropy", definition: "Negative log-likelihood cho phân loại xác suất." }, { term: "Calibration", definition: "Mức khớp giữa xác suất dự báo và tần suất thực." }, { term: "Decision threshold", definition: "Ngưỡng đổi xác suất hoặc score thành nhãn." }],
    sourceIds: ["ioai-2026", "mml", "pml-intro"],
  },
  "ml-l1-l2-regularization": {
    lessonId: "ml-l1-l2-regularization",
    readingMinutes: 32,
    openingQuestions: ["Regularization thêm giả định nào vào bài toán?", "Vì sao L1 tạo nghiệm bằng 0 còn L2 thường chỉ co nhỏ?", "Scale feature ảnh hưởng penalty ra sao?"],
    sections: [
      {
        title: "Ràng buộc năng lực mô hình",
        paragraphs: [
          "Regularization thêm giá cho tham số lớn, đổi bài toán từ chỉ khớp train sang cân bằng fit và độ đơn giản. λ=0 trở về objective gốc; λ quá lớn gây underfit. λ là hyperparameter phải chọn bên trong cross-validation.",
          "Penalty phụ thuộc đơn vị của feature: nếu một cột được nhân 100, hệ số cần chia 100 để cùng dự đoán và chịu penalty khác. Vì vậy linear model có regularization thường cần scale trong pipeline.",
        ],
        formulas: ["J(w)=L_data(w)+λΩ(w)", "λ≥0"],
      },
      {
        title: "L2, shrinkage và ổn định",
        paragraphs: [
          "Ridge dùng ||w||₂², có gradient trơn 2w. Nó co các hệ số tương quan về phía 0 và cải thiện conditioning của XᵀX bằng cách cộng λI. Thường không phạt intercept khi dữ liệu đã center.",
          "L2 tương ứng Gaussian prior trong diễn giải MAP. Nó giảm variance nhưng tăng bias; hiệu quả cần đánh giá trên validation, không kết luận từ norm nhỏ hơn.",
        ],
        formulas: ["Ω₂=Σ_jw_j²", "w_ridge=(XᵀX+λI)⁻¹Xᵀy"],
      },
      {
        title: "L1, sparsity và elastic net",
        paragraphs: [
          "Lasso dùng Σ|w_j|; điểm gấp tại 0 cho phép nghiệm chính xác bằng 0 qua subgradient/proximal update. Khi feature tương quan mạnh, L1 có thể chọn một feature khá bất ổn thay vì chia trọng số.",
          "Elastic net kết hợp L1 và L2 để có sparsity nhưng ổn định hơn theo nhóm feature. Số feature khác 0 không đồng nghĩa feature có quan hệ nhân quả; lựa chọn còn phụ thuộc fold và scale.",
        ],
        formulas: ["Ω₁=Σ_j|w_j|", "soft_threshold(a,t)=sign(a)max(|a|−t,0)", "Ω_EN=α||w||₁+(1−α)||w||₂²"],
      },
    ],
    workedExamples: [{
      title: "So một bước cập nhật L1 và L2",
      problem: "w=[3,4], gradient data g=[−1,2], λ=0.5, η=0.1. Dùng L2=λ||w||² và L1=λ||w||₁.",
      steps: [
        { state: "L2 penalty=0.5×25=12.5; gradient penalty=2λw=[3,4]", explanation: "L2 tăng bậc hai theo độ lớn." },
        { state: "g_total_L2=[2,6]; w_new=[2.8,3.4]", explanation: "Cả hai hệ số bị co dù gradient data muốn tăng w1." },
        { state: "L1 penalty=0.5×7=3.5; subgradient=[0.5,0.5]", explanation: "Vì cả hai hệ số đang dương." },
        { state: "g_total_L1=[−0.5,2.5]; w_new=[3.05,3.75]", explanation: "Proximal update mới tạo sparsity rõ khi hệ số gần 0." },
      ],
      conclusion: "L1 và L2 không chỉ khác giá trị penalty; hình học và quy tắc cập nhật cũng khác.",
      sanityChecks: ["Gradient penalty cùng shape (2,).", "Không phạt bias nếu thiết kế nói vậy.", "λ=0 cho cùng update không regularize."],
    }],
    implementationChecklist: ["Scale trong từng fold.", "Không phạt intercept mặc định mù quáng.", "Chọn λ bằng CV.", "Báo norm và số hệ số khác 0.", "Kiểm tra ổn định lựa chọn feature."],
    masteryChecklist: ["Vẽ contour L1/L2.", "Tính gradient L2.", "Giải thích subgradient tại 0.", "Liên hệ ridge với conditioning.", "Phân biệt sparsity với nhân quả."],
    glossary: [{ term: "Regularization", definition: "Hạn chế năng lực mô hình qua penalty hoặc ràng buộc." }, { term: "Shrinkage", definition: "Co độ lớn hệ số về 0." }, { term: "Sparsity", definition: "Nhiều hệ số bằng 0." }, { term: "Subgradient", definition: "Khái quát gradient tại điểm hàm convex không trơn." }, { term: "Elastic net", definition: "Penalty kết hợp L1 và L2." }],
    sourceIds: ["mml", "pml-intro", "ioai-2026"],
  },
  "ml-knn": {
    lessonId: "ml-knn",
    readingMinutes: 29,
    openingQuestions: ["k-NN học tham số gì khi fit?", "Khoảng cách nào phù hợp từng feature?", "Vì sao chiều cao làm láng giềng kém ý nghĩa?"],
    sections: [
      {
        title: "Học dựa trên lân cận",
        paragraphs: [
          "k-NN là lazy learner: fit chủ yếu lưu train; dự đoán mới tính khoảng cách và lấy k láng giềng. Classification bỏ phiếu, regression lấy trung bình hoặc trung vị. k nhỏ variance cao, k lớn bias cao và làm mờ ranh giới.",
          "Tie-breaking phải xác định trước: tổng khoảng cách, prior lớp hoặc thứ tự nhãn. Không được dùng test để chọn k. Với classification nhị phân, k lẻ giảm nhưng không loại mọi khả năng hòa.",
        ],
        formulas: ["N_k(x)=k điểm có d(x,x_i) nhỏ nhất", "ŷ=mode{y_i:i∈N_k(x)}"],
      },
      {
        title: "Metric và preprocessing",
        paragraphs: [
          "Euclid giả định các trục cùng đơn vị và đóng góp hình học tương đương. Standardization cần fit trên train. Manhattan bền hơn với một số outlier theo trục; cosine phù hợp hướng vector khi độ lớn không quan trọng; category cần metric/encoding thích hợp.",
          "Distance weighting cho láng giềng gần ảnh hưởng lớn hơn nhưng cần xử lý khoảng cách 0. Missing values không thể tùy tiện thay 0 nếu 0 có nghĩa thật.",
        ],
        formulas: ["d₂(x,z)=√Σ_j(x_j−z_j)²", "vote_c=Σ_{i∈N_k}1[y_i=c]/(d_i+ε)"],
      },
      {
        title: "Chi phí và curse of dimensionality",
        paragraphs: [
          "Brute-force dự đoán q điểm trên n mẫu d chiều cần O(qnd), lưu O(nd). KD-tree/ball-tree chỉ hữu ích trong điều kiện metric và số chiều phù hợp; chiều cao làm pruning kém.",
          "Trong chiều cao, khoảng cách gần và xa có xu hướng tương tự, khiến local neighborhood ít phân biệt. Feature selection, PCA hoặc metric learning có thể giúp, nhưng phải nằm trong CV để tránh leakage.",
        ],
        formulas: ["T_predict=O(qnd)", "distance concentration: (d_far−d_near)/d_near giảm khi d tăng trong nhiều phân phối"],
      },
    ],
    workedExamples: [{
      title: "Bỏ phiếu ba láng giềng",
      problem: "A=(0,0),y=0; B=(1,2),y=1; C=(2,1),y=1; D=(3,3),y=0. Query q=(1,1), dữ liệu shape (4,2), k=3.",
      steps: [
        { state: "d(A,q)=√2≈1.414", explanation: "Khoảng cách Euclid hai chiều." },
        { state: "d(B,q)=1; d(C,q)=1; d(D,q)=√8≈2.828", explanation: "Sắp theo khoảng cách tăng." },
        { state: "N3={B,C,A} với nhãn [1,1,0]", explanation: "D không được chọn." },
        { state: "vote lớp 1=2, lớp 0=1 ⇒ ŷ=1", explanation: "Đa số đơn giản cho lớp 1." },
      ],
      conclusion: "Kết quả phụ thuộc metric, scale và k chứ không chỉ vị trí nhìn bằng mắt.",
      sanityChecks: ["Không đưa query vào train nếu nó là chính mẫu đang đánh giá.", "k≤n.", "Hai khoảng cách bằng nhau có tie policy."],
    }],
    implementationChecklist: ["Fit scaler trên train.", "Vector hóa khoảng cách.", "Định nghĩa tie-breaking.", "Chọn k trong CV.", "Xử lý distance=0."],
    masteryChecklist: ["Tính láng giềng bằng tay.", "Giải thích bias–variance theo k.", "Chọn metric theo dữ liệu.", "Phân tích O(qnd).", "Giải thích curse of dimensionality."],
    glossary: [{ term: "Lazy learning", definition: "Hoãn phần lớn tính toán đến lúc dự đoán." }, { term: "Metric", definition: "Hàm khoảng cách thỏa các tiên đề metric." }, { term: "Neighborhood", definition: "Tập điểm gần query theo metric." }, { term: "Distance weighting", definition: "Bỏ phiếu có trọng số giảm theo khoảng cách." }, { term: "Curse of dimensionality", definition: "Hiện tượng dữ liệu thưa và khoảng cách kém phân biệt khi số chiều tăng." }],
    sourceIds: ["ioai-2026", "pml-intro", "mml"],
  },
  "ml-decision-tree": {
    lessonId: "ml-decision-tree",
    readingMinutes: 38,
    openingQuestions: ["Một split tốt giảm bất định bằng cách nào?", "Cây biểu diễn interaction ra sao?", "Vì sao cây sâu dễ overfit?"],
    sections: [
      {
        title: "Phân hoạch đệ quy",
        paragraphs: [
          "Decision tree chia feature space thành các vùng theo điều kiện x_j≤t. Mỗi lá dự đoán phân phối lớp hoặc trung bình target. Đường từ gốc tới lá là một luật AND; các nhánh khác nhau tạo interaction mà không cần khai báo trước.",
          "Thuật toán greedy chọn split tốt nhất tại nút hiện tại, không bảo đảm cây toàn cục tối ưu. Threshold số thường xét giữa các giá trị đã sắp xếp; category cần chiến lược không tạo thứ tự giả.",
        ],
        formulas: ["R_left={i:x_ij≤t}", "prediction_leaf=mean(y_i) hoặc class frequencies"],
      },
      {
        title: "Impurity và information gain",
        paragraphs: [
          "Gini và entropy bằng 0 khi nút thuần, lớn khi lớp trộn. Gain là impurity cha trừ trung bình có trọng số của hai con. Split tạo con rất nhỏ có thể đạt gain cao do nhiễu, nên cần min_samples_leaf.",
          "Regression tree thường giảm sum of squared errors. Missing value cần impute, surrogate split hoặc quy tắc riêng; không mặc nhiên so NaN với threshold.",
        ],
        formulas: ["Gini=1−Σ_cp_c²", "Entropy=−Σ_cp_c log₂p_c", "Gain=I(parent)−(n_LI_L+n_RI_R)/n"],
      },
      {
        title: "Kiểm soát độ phức tạp và diễn giải",
        paragraphs: [
          "max_depth, min_samples_split, min_samples_leaf và cost-complexity pruning điều khiển variance. Chọn bằng validation; train accuracy 100% không phải mục tiêu. Xáo thứ tự hàng không nên đổi cây nếu tie được xử lý xác định.",
          "Feature importance theo tổng impurity decrease thiên về feature nhiều điểm chia và không phải causal importance. Hãy kiểm tra permutation importance và trace đường quyết định trên mẫu cụ thể.",
        ],
        formulas: ["R_α(T)=R(T)+α|leaves(T)|"],
      },
    ],
    workedExamples: [{
      title: "So hai ngưỡng bằng Gini",
      problem: "x=[1,2,3,6,7,8], y=[0,0,1,1,1,0], shape (6,1). So threshold 2.5 và 4.5/giữa 3,6.",
      steps: [
        { state: "Gini cha=1−(3/6)²−(3/6)²=0.5", explanation: "Ba mẫu mỗi lớp." },
        { state: "t=2.5: trái [0,0] G=0; phải [1,1,1,0] G=0.375", explanation: "Impurity có trọng số=2/6×0+4/6×0.375=0.25." },
        { state: "Gain(2.5)=0.5−0.25=0.25", explanation: "Split làm nút thuần bên trái." },
        { state: "t=4.5: hai con [0,0,1] và [1,1,0], mỗi G=4/9", explanation: "Impurity có trọng số=4/9, gain≈0.0556." },
      ],
      conclusion: "Greedy chọn t=2.5 vì gain 0.25 lớn hơn, dù chưa xét ảnh hưởng các tầng sau.",
      sanityChecks: ["Số mẫu hai con cộng bằng 6.", "Gain không âm cho split được chọn tối ưu.", "Không xét threshold tạo con rỗng."],
    }],
    implementationChecklist: ["Sort giá trị hiệu quả.", "Không tạo con rỗng.", "Tính weight theo số mẫu.", "Đặt stopping rules.", "Test tie và feature hằng."],
    masteryChecklist: ["Tính Gini/entropy.", "Trace dự đoán một mẫu.", "Giải thích greedy.", "Phân biệt pre/post-pruning.", "Phê bình impurity importance."],
    glossary: [{ term: "Impurity", definition: "Mức trộn nhãn tại một nút." }, { term: "Information gain", definition: "Mức giảm impurity sau split." }, { term: "Leaf", definition: "Nút kết thúc chứa quy tắc dự đoán." }, { term: "Pruning", definition: "Giảm nhánh để kiểm soát độ phức tạp." }, { term: "Threshold", definition: "Giá trị cắt một feature số thành hai nhánh." }],
    sourceIds: ["ioai-2026", "pml-intro"],
  },
  "ml-bagging-random-forest": {
    lessonId: "ml-bagging-random-forest",
    readingMinutes: 36,
    openingQuestions: ["Bagging giảm bias hay variance chủ yếu?", "Bootstrap để lại bao nhiêu mẫu OOB?", "Random feature subset giúp các cây ở điểm nào?"],
    sections: [
      {
        title: "Bootstrap và trung bình mô hình",
        paragraphs: [
          "Bagging huấn luyện nhiều learner trên bootstrap sample kích thước n lấy có hoàn lại. Mỗi sample chứa khoảng 63.2% quan sát duy nhất khi n lớn; phần còn lại là out-of-bag. Trung bình làm giảm variance mạnh nhất khi lỗi các learner ít tương quan.",
          "Classification có thể vote lớp hoặc trung bình xác suất; hai cách không luôn giống nhau. Regression lấy trung bình, giúp làm mượt các cây có variance cao nhưng không sửa bias chung.",
        ],
        formulas: ["P(một điểm OOB)=(1−1/n)^n≈e^(−1)", "Var(mean)≈σ²[ρ+(1−ρ)/B]"],
      },
      {
        title: "Random forest và khử tương quan",
        paragraphs: [
          "Random forest thêm việc chỉ xét một subset feature ngẫu nhiên ở mỗi split. Cây có thể yếu hơn riêng lẻ nhưng ít giống nhau hơn, làm correlation ρ giảm và ensemble tốt hơn.",
          "max_features quá nhỏ tăng bias; quá lớn làm cây tương quan. Cây thường mọc sâu và ensemble kiểm soát variance, nhưng min_samples_leaf vẫn hữu ích với noise hoặc xác suất cần ổn định.",
        ],
        formulas: ["ŷ_class=mode_b T_b(x)", "ŷ_reg=(1/B)Σ_bT_b(x)"],
      },
      {
        title: "OOB, importance và giới hạn",
        paragraphs: [
          "Mỗi điểm được dự đoán bởi các cây không thấy nó, tạo OOB estimate mà không cần validation riêng cho kiểm tra nhanh. Số cây OOB trên từng điểm khác nhau; cần đủ B để dự đoán ổn định.",
          "Impurity importance thiên về feature liên tục/cardinality cao. Permutation importance cũng bị chia sẻ khi feature tương quan. Forest không extrapolate regression tốt ngoài miền target của lá và model lớn tốn RAM/latency.",
        ],
        bullets: ["Đặt seed nhưng không dùng cùng bootstrap cho mọi cây.", "Báo số cây và OOB coverage.", "Không dùng OOB thay test cuối."],
      },
    ],
    workedExamples: [{
      title: "Ba bootstrap và một lần vote",
      problem: "n=5, ba cây nhận chỉ số T1=[0,1,1,3,4], T2=[0,2,2,3,3], T3=[1,2,4,4,4]. Query có dự đoán [1,0,1].",
      steps: [
        { state: "OOB(T1)={2}", explanation: "Chỉ index 2 không xuất hiện ở sample T1." },
        { state: "OOB(T2)={1,4}; OOB(T3)={0,3}", explanation: "Mỗi cây có tập kiểm tra nội bộ khác." },
        { state: "votes=[1,0,1] ⇒ lớp 1 nhận 2/3", explanation: "Majority vote dự đoán lớp 1." },
        { state: "Nếu probabilities=[0.51,0.10,0.55], mean=0.3867", explanation: "Trung bình probability với ngưỡng 0.5 lại cho lớp 0." },
      ],
      conclusion: "Phải công bố ensemble vote nhãn hay trung bình xác suất vì kết quả có thể khác.",
      sanityChecks: ["Mỗi bootstrap có đúng 5 phần tử.", "OOB là complement của unique sample.", "Khi các cây được lấy mẫu độc lập theo cùng quy trình, vote hoặc mean thường ổn định dần khi B lớn; metric không được bảo đảm cải thiện đơn điệu."],
    }],
    implementationChecklist: ["Sinh bootstrap độc lập.", "Lấy feature subset tại từng split.", "Tích lũy OOB theo điểm.", "Công bố cách vote.", "Đo latency và kích thước model."],
    masteryChecklist: ["Tính xác suất OOB.", "Giải thích vai trò correlation.", "Phân biệt bagging và random forest.", "Đọc OOB score đúng giới hạn.", "Phê bình feature importance."],
    glossary: [{ term: "Bootstrap", definition: "Lấy mẫu có hoàn lại cùng kích thước dữ liệu gốc." }, { term: "Out-of-bag", definition: "Quan sát không xuất hiện trong bootstrap của một learner." }, { term: "Bagging", definition: "Trung bình learner huấn luyện trên các bootstrap khác nhau." }, { term: "Decorrelation", definition: "Làm lỗi giữa các learner ít tương quan hơn." }, { term: "Ensemble", definition: "Tập nhiều mô hình được kết hợp thành một dự đoán." }],
    sourceIds: ["ioai-2026", "pml-intro"],
  },
  "ml-gradient-boosting": {
    lessonId: "ml-gradient-boosting",
    readingMinutes: 40,
    openingQuestions: ["Boosting sửa lỗi của mô hình trước như thế nào?", "Learning rate và số cây đánh đổi gì?", "Vì sao gradient boosting nhạy noise hơn bagging?"],
    sections: [
      {
        title: "Mô hình cộng dần",
        paragraphs: [
          "Gradient boosting xây F_M(x)=F_0(x)+Σηf_m(x), mỗi weak learner sửa hướng loss còn giảm được. Với squared error, negative gradient chính là residual; với logistic loss, pseudo-residual phụ thuộc xác suất hiện tại.",
          "Các cây được huấn luyện tuần tự nên không thể độc lập như bagging. Mỗi cây thường nông để đóng vai trò một bước nhỏ; cây sâu cho interaction cao nhưng dễ bám noise.",
        ],
        formulas: ["F_m=F_{m−1}+ηf_m", "r_im=−[∂L(y_i,F(x_i))/∂F(x_i)]_{F=F_{m−1}}"],
      },
      {
        title: "Shrinkage, depth và regularization",
        paragraphs: [
          "Learning rate η nhỏ thường cần nhiều cây hơn và có thể tổng quát tốt hơn nếu early stopping. n_estimators và η phải chọn cùng nhau. subsample<1 tạo stochastic boosting, giảm correlation và cung cấp regularization.",
          "min_samples_leaf, max_depth, L1/L2 trên leaf weight và giới hạn bin đều tác động capacity. Validation curve theo iteration cho điểm dừng; chọn iteration trên test là leakage.",
        ],
        formulas: ["capacity tăng theo số cây và độ sâu", "early_stop = argmin_m L_validation(F_m)"],
      },
      {
        title: "Dữ liệu bảng và lỗi thường gặp",
        paragraphs: [
          "Boosted trees mạnh trên tabular nhờ bắt nonlinearity và interaction, ít cần scale. Tuy nhiên category encoding, missing policy, class imbalance và monotonic constraints vẫn cần thiết kế theo bài toán.",
          "Outlier target có thể tạo residual lớn chi phối cây sau; loss robust như Huber có thể phù hợp hơn. Probability có thể kém calibrated dù ranking tốt; dùng validation riêng khi calibrate.",
        ],
        bullets: ["Theo dõi train và validation theo iteration.", "Khóa test cuối.", "Báo baseline và seed."],
      },
    ],
    workedExamples: [{
      title: "Một cây sửa residual",
      problem: "Regression y=[3,5,4], F0=mean(y)=4, shape (3,). Weak tree fit residual và cho f1=[−0.8,0.8,0], η=0.5.",
      steps: [
        { state: "F0=[4,4,4]; residual y−F0=[−1,1,0]", explanation: "Squared loss dùng residual làm negative gradient." },
        { state: "F1=F0+0.5f1=[3.6,4.4,4]", explanation: "Shrinkage chỉ áp dụng nửa correction." },
        { state: "residual mới=[−0.6,0.6,0]", explanation: "Sai số cùng hướng nhưng nhỏ hơn." },
        { state: "SSE giảm từ 2 xuống 0.72", explanation: "0.36+0.36 chứng minh bước này giảm train loss." },
      ],
      conclusion: "Cây sau phải fit residual mới, không fit lại target gốc một cách độc lập.",
      sanityChecks: ["F và residual cùng shape (3,).", "η=0 giữ nguyên F0.", "Validation có thể tăng dù train tiếp tục giảm."],
    }],
    implementationChecklist: ["Khởi tạo F0 theo loss.", "Tính pseudo-residual đúng.", "Nhân learning rate khi cộng.", "Theo dõi validation từng vòng.", "Chọn loss theo outlier/imbalance."],
    masteryChecklist: ["Suy residual cho MSE.", "Giải thích boosting khác bagging.", "Phân tích η–số cây.", "Đọc early stopping curve.", "Nhận ra calibration kém."],
    glossary: [{ term: "Weak learner", definition: "Mô hình đơn giản đóng góp một cải thiện nhỏ." }, { term: "Pseudo-residual", definition: "Negative gradient của loss theo prediction hiện tại." }, { term: "Shrinkage", definition: "Nhân đóng góp learner với learning rate nhỏ." }, { term: "Early stopping", definition: "Dừng tại iteration tốt nhất trên validation." }, { term: "Additive model", definition: "Mô hình là tổng đóng góp tuần tự của các learner." }],
    sourceIds: ["ioai-2026", "pml-intro"],
  },
  "ml-svm": {
    lessonId: "ml-svm",
    readingMinutes: 41,
    openingQuestions: ["Margin hình học khác functional margin thế nào?", "Chỉ những điểm nào quyết định siêu phẳng?", "Kernel trick tránh tính feature map ra sao?"],
    sections: [
      {
        title: "Siêu phẳng và maximum margin",
        paragraphs: [
          "SVM nhị phân dùng score f(x)=wᵀx+b và nhãn sign(f). Vì nhân w,b với cùng hằng số không đổi biên, ta chuẩn hóa constraint y_i f(x_i)≥1; khoảng cách giữa hai biên hỗ trợ là 2/||w||.",
          "Hard-margin chỉ khả thi khi dữ liệu tách tuyến tính. Support vectors nằm trên hoặc vi phạm margin và quyết định nghiệm; điểm xa biên thường không đổi nghiệm khi dịch nhỏ.",
        ],
        formulas: ["f(x)=wᵀx+b", "geometric margin_i=y_if(x_i)/||w||", "max margin ⇔ min (1/2)||w||²"],
      },
      {
        title: "Soft margin và hinge loss",
        paragraphs: [
          "Slack ξ_i cho phép điểm vào margin hoặc phân loại sai. C cân bằng margin rộng với tổng vi phạm; C lớn phạt lỗi mạnh và có thể tăng variance, C nhỏ regularize mạnh.",
          "Hinge loss max(0,1−yf) bằng 0 ngoài margin đúng, tuyến tính khi vi phạm và không trơn tại 1. Scale feature quan trọng vì norm w và khoảng cách phụ thuộc hệ tọa độ.",
        ],
        formulas: ["min (1/2)||w||²+CΣ_iξ_i", "hinge=max(0,1−y_if_i)"],
      },
      {
        title: "Dual và kernel",
        paragraphs: [
          "Trong dual, dữ liệu xuất hiện qua dot product. Kernel K(x,z)=φ(x)·φ(z) cho phép làm việc trong feature space mà không tính φ trực tiếp. Kernel phải positive semidefinite để bài toán convex chuẩn.",
          "RBF K=exp(−γ||x−z||²): γ lớn tạo ảnh hưởng rất cục bộ, γ nhỏ làm biên mượt. C và γ cần search theo log scale trong CV. SVM score không phải xác suất; calibration là bước riêng.",
        ],
        formulas: ["K_RBF(x,z)=exp(−γ||x−z||²)", "f(x)=Σ_i α_iy_iK(x_i,x)+b"],
      },
    ],
    workedExamples: [{
      title: "Margin trên bốn điểm một chiều",
      problem: "x=[−2,−1,1,2] shape (4,1), y=[−1,−1,1,1]. Xét w=1,b=0.",
      steps: [
        { state: "scores=[−2,−1,1,2]", explanation: "Biên quyết định ở x=0." },
        { state: "functional margins y·f=[2,1,1,2]", explanation: "Tất cả đúng lớp và thỏa constraint ≥1." },
        { state: "support vectors x=−1 và x=1", explanation: "Hai điểm có margin đúng 1." },
        { state: "width=2/||w||=2", explanation: "Hai hyperplane hỗ trợ ở x=−1 và x=1." },
      ],
      conclusion: "Hai điểm gần biên quyết định margin; ±2 không là support vectors trong nghiệm này.",
      sanityChecks: ["Đổi dấu đồng thời w,b và nhãn quy ước đổi prediction.", "Scale w,b mà không chuẩn hóa đổi functional nhưng không đổi geometric boundary.", "Hinge loss bằng 0."],
    }],
    implementationChecklist: ["Mã hóa nhãn ±1.", "Scale trong fold.", "Tính hinge ổn định.", "Search C/γ log scale.", "Không gọi score là xác suất."],
    masteryChecklist: ["Tính geometric margin.", "Xác định support vectors.", "Giải thích vai trò C.", "Phân tích γ RBF.", "Phân biệt primal/dual."],
    glossary: [{ term: "Margin", definition: "Khoảng đệm từ biên tới điểm gần nhất." }, { term: "Support vector", definition: "Điểm nằm trên hoặc vi phạm margin có hệ số dual khác 0." }, { term: "Hinge loss", definition: "Loss tuyến tính cho điểm nằm trong hoặc sai margin." }, { term: "Kernel", definition: "Hàm tính inner product ngầm trong feature space." }, { term: "Slack variable", definition: "Biến đo mức vi phạm margin trong soft-margin SVM." }],
    sourceIds: ["ioai-2026", "mml", "pml-intro"],
  },
  "ml-kmeans": {
    lessonId: "ml-kmeans",
    readingMinutes: 36,
    openingQuestions: ["k-means tối ưu objective nào?", "Vì sao khởi tạo thay đổi nghiệm?", "Cluster có nhất thiết là nhóm thật trong thế giới không?"],
    sections: [
      {
        title: "Objective và hai bước xen kẽ",
        paragraphs: [
          "k-means tìm k centroid để tối thiểu tổng bình phương khoảng cách Euclid từ mỗi điểm tới centroid được gán. Assignment chọn centroid gần nhất; update lấy mean của từng cluster. Mỗi bước không tăng objective nên thuật toán hội tụ, nhưng chỉ tới local optimum.",
          "Mean là nghiệm tối ưu cho squared Euclidean distance; thay metric nhưng vẫn lấy mean có thể làm mất bảo đảm. Cluster rỗng cần quy tắc tái khởi tạo rõ ràng.",
        ],
        formulas: ["J=Σ_i||x_i−μ_{c_i}||₂²", "c_i=argmin_k||x_i−μ_k||²", "μ_k=(1/|C_k|)Σ_{i∈C_k}x_i"],
      },
      {
        title: "Khởi tạo, scale và hình học",
        paragraphs: [
          "Random seed khác nhau có thể vào local optimum khác; chạy nhiều n_init và giữ inertia thấp nhất. k-means++ chọn centroid xa có xác suất lớn hơn để giảm khởi tạo trùng vùng.",
          "Euclid khiến feature đơn vị lớn chi phối; scale phải fit trên train hoặc toàn bộ tập unsupervised theo đúng thiết kế sử dụng. k-means thích cluster gần hình cầu, kích thước và mật độ tương tự; hình lưỡi liềm hoặc mật độ chênh lệch dễ bị cắt sai.",
        ],
        formulas: ["P(chọn x làm tâm tiếp)∝D(x)²", "inertia=J tại nghiệm cuối"],
      },
      {
        title: "Chọn k và đánh giá",
        paragraphs: [
          "Inertia luôn không tăng khi k tăng nên không thể tự chọn k bằng giá trị nhỏ nhất. Elbow, silhouette, stability qua bootstrap và ý nghĩa miền phải được xem cùng nhau. Silhouette gần 1 tốt, gần 0 chồng lấn, âm có thể gán sai.",
          "Cluster id là nhãn tùy ý: hoán vị centroid không đổi nghiệm. Nếu có nhãn thật chỉ để đánh giá, dùng ARI/NMI không phụ thuộc hoán vị; không dùng nhãn đó để chỉnh preprocessing rồi gọi là unsupervised.",
        ],
        formulas: ["s(i)=(b(i)−a(i))/max(a(i),b(i))", "J(k+1)≤J(k)"],
      },
    ],
    workedExamples: [{
      title: "Một vòng Lloyd trên bốn điểm",
      problem: "X=[[0,0],[0,2],[8,8],[10,8]] shape (4,2), k=2, tâm đầu μ1=[0,0], μ2=[8,8].",
      steps: [
        { state: "Hai điểm đầu gần μ1; hai điểm cuối gần μ2", explanation: "So squared distance tới từng tâm." },
        { state: "C1={0,1}; C2={2,3}", explanation: "Assignment tạo hai cluster không rỗng." },
        { state: "μ1_new=[0,1]; μ2_new=[9,8]", explanation: "Update lấy mean theo cột." },
        { state: "J=1+1+1+1=4", explanation: "Tổng squared distance tới hai tâm mới." },
      ],
      conclusion: "Vòng tiếp theo giữ nguyên assignment nên thuật toán hội tụ với inertia 4.",
      sanityChecks: ["Centroid shape (2,2).", "Mỗi điểm thuộc đúng một cluster.", "Objective không tăng sau update."],
    }],
    implementationChecklist: ["Scale theo thiết kế.", "Dùng k-means++/n_init.", "Xử lý cluster rỗng.", "Theo dõi inertia đơn điệu.", "Đánh giá stability và silhouette."],
    masteryChecklist: ["Suy ra mean update.", "Chạy một vòng bằng tay.", "Giải thích local optimum.", "Nêu hình học k-means thất bại.", "Chọn k không chỉ bằng inertia."],
    glossary: [{ term: "Centroid", definition: "Trung bình vector của điểm trong cluster." }, { term: "Inertia", definition: "Tổng squared distance trong cluster." }, { term: "Lloyd algorithm", definition: "Lặp assignment và centroid update." }, { term: "Silhouette", definition: "Điểm so độ gắn kết nội cụm với cụm gần nhất." }, { term: "Local optimum", definition: "Nghiệm tốt trong lân cận nhưng chưa chắc tốt nhất toàn cục." }],
    sourceIds: ["ioai-2026", "pml-intro", "mml"],
  },
  "ml-pca": {
    lessonId: "ml-pca",
    readingMinutes: 39,
    openingQuestions: ["PCA giữ phương sai hay thông tin nhãn?", "Center và scale thay đổi nghiệm thế nào?", "Vì sao dấu principal component không xác định?"],
    sections: [
      {
        title: "Phương sai cực đại và phép chiếu",
        paragraphs: [
          "PCA tìm các hướng đơn vị trực giao có phương sai projection lớn nhất trên dữ liệu đã center. Hướng đầu giải max vᵀSv với ||v||=1; các hướng sau thêm ràng buộc trực giao. PCA không nhìn target nên phương sai lớn chưa chắc hữu ích cho phân loại.",
          "Center dịch gốc tọa độ về mean. Nếu feature khác đơn vị, PCA trên covariance ưu tiên variance tuyệt đối; standardize tương đương làm PCA trên correlation và trả lời câu hỏi khác.",
        ],
        formulas: ["S=(1/n)X_cᵀX_c", "v1=argmax_{||v||=1}vᵀSv", "z=X_cv"],
      },
      {
        title: "SVD, reconstruction và số chiều",
        paragraphs: [
          "SVD X_c=UΣVᵀ cho principal directions là các cột V và score UΣ. Trị riêng covariance bằng σ_j²/n theo quy ước population. Dấu v có thể đảo cùng dấu score mà reconstruction không đổi.",
          "Giữ k thành phần tạo X_hat=ZV_kᵀ+mean. PCA tối thiểu reconstruction squared error trong các phép chiếu tuyến tính hạng k. explained variance ratio hỗ trợ chọn k nhưng cần cân nhắc downstream metric và chi phí.",
        ],
        formulas: ["X_c=UΣVᵀ", "Z=X_cV_k", "X_hat=ZV_kᵀ+μ", "EVR_j=σ_j²/Σ_lσ_l²"],
      },
      {
        title: "Leakage và giới hạn",
        paragraphs: [
          "Mean, scale và components phải fit trong mỗi train fold nếu PCA là bước của supervised pipeline. Fit PCA trước CV làm validation ảnh hưởng hướng projection dù không dùng nhãn.",
          "PCA tuyến tính, nhạy outlier và không bảo toàn cluster phi tuyến. Component có loading lớn không tự là feature quan trọng nhân quả. Whitening chia theo singular value, có thể khuếch đại noise ở hướng variance rất nhỏ.",
        ],
        bullets: ["Kiểm tra reconstruction.", "Báo EVR tích lũy.", "Không diễn giải dấu component tuyệt đối."],
      },
    ],
    workedExamples: [{
      title: "PCA một chiều tái tạo chính xác",
      problem: "X=[[1,1],[3,1],[2,1]] shape (3,2). Dùng population covariance và k=1.",
      steps: [
        { state: "μ=[2,1]; Xc=[[-1,0],[1,0],[0,0]]", explanation: "Center từng cột." },
        { state: "S=XcᵀXc/3=[[2/3,0],[0,0]]", explanation: "Chỉ trục x có variance." },
        { state: "v1=[1,0]; scores z=[−1,1,0] shape (3,1)", explanation: "Chiếu lên principal direction." },
        { state: "Xhat=zv1ᵀ+μ=X", explanation: "Dữ liệu nằm trên đường y=1 nên một chiều đủ." },
      ],
      conclusion: "EVR thành phần đầu bằng 1 và reconstruction error bằng 0.",
      sanityChecks: ["v1 norm 1.", "Xc mean mỗi cột bằng 0.", "Đổi v1 thành [−1,0] không đổi Xhat."],
    }],
    implementationChecklist: ["Fit center/scale trong fold.", "Dùng SVD ổn định.", "Sort component theo variance.", "Kiểm tra orthonormality.", "Báo reconstruction và EVR."],
    masteryChecklist: ["Tính covariance nhỏ.", "Liên hệ eigen và SVD.", "Giải thích sign ambiguity.", "Chọn k theo mục tiêu.", "Nhận ra leakage PCA."],
    glossary: [{ term: "Principal component", definition: "Hướng trực giao giữ phương sai lớn theo thứ tự." }, { term: "Loading", definition: "Hệ số feature trong principal direction." }, { term: "Score", definition: "Tọa độ mẫu sau projection." }, { term: "Whitening", definition: "Scale component để variance đầu ra bằng nhau." }, { term: "Explained variance", definition: "Phần phương sai dữ liệu gắn với một component." }],
    sourceIds: ["ioai-2026", "mml", "pml-intro"],
  },
  "ml-tsne": {
    lessonId: "ml-tsne",
    readingMinutes: 34,
    openingQuestions: ["t-SNE bảo toàn quan hệ cục bộ bằng phân phối nào?", "Perplexity điều khiển điều gì?", "Khoảng cách giữa hai cụm trên hình có ý nghĩa định lượng không?"],
    sections: [
      {
        title: "Xác suất lân cận ở không gian gốc",
        paragraphs: [
          "t-SNE đổi khoảng cách cao chiều thành xác suất lân cận Gaussian có điều kiện. Mỗi điểm có bandwidth riêng được chọn để entropy đạt perplexity mục tiêu; vì thế mật độ khác nhau được thích nghi cục bộ.",
          "Xác suất được symmetrize thành p_ij. Perplexity gần số láng giềng hiệu dụng: quá nhỏ chỉ nhìn cấu trúc rất gần, quá lớn làm trộn cấu trúc; phải nhỏ hơn đáng kể số mẫu và nên thử nhiều giá trị.",
        ],
        formulas: ["p_{j|i}∝exp(−||x_i−x_j||²/(2σ_i²))", "perplexity=2^{H(P_i)}", "p_ij=(p_{j|i}+p_{i|j})/(2n)"],
      },
      {
        title: "Student-t và KL divergence",
        paragraphs: [
          "Trong 2D/3D, q_ij dùng Student-t một bậc tự do với đuôi nặng. Điều này giảm crowding: điểm không gần có thể tách xa hơn mà vẫn còn xác suất. Objective KL(P||Q) phạt mạnh cặp gần ở gốc nhưng xa trên hình.",
          "KL bất đối xứng nên t-SNE ưu tiên recall của lân cận hơn bảo toàn khoảng cách toàn cục. Early exaggeration tạm tăng lực hút của p_ij; learning rate và initialization ảnh hưởng nghiệm.",
        ],
        formulas: ["q_ij∝(1+||y_i−y_j||²)^(−1)", "KL(P||Q)=Σ_{i≠j}p_ij log(p_ij/q_ij)"],
      },
      {
        title: "Cách đọc hình và giới hạn",
        paragraphs: [
          "t-SNE là công cụ khám phá/visualization, không phải bằng chứng số cluster. Kích thước, mật độ và khoảng cách giữa các đảo có thể bị objective làm biến dạng; trục và phép quay không mang ý nghĩa.",
          "Cần scale/feature selection hợp lý, thường PCA trước cho dữ liệu rất chiều cao, chạy nhiều seed và tô màu bằng metadata chỉ sau khi embedding. Không fit chung train-test nếu hình được dùng trong quy trình đánh giá.",
        ],
        bullets: ["Báo perplexity, seed và số iteration.", "So lân cận trên hình với dữ liệu gốc.", "Không dùng tọa độ t-SNE như feature mặc định."],
      },
    ],
    workedExamples: [{
      title: "So lực lân cận Gaussian và Student",
      problem: "X=[0,1,3] shape (3,1). Với điểm x0=0 chọn σ0=1; embedding tạm y=[0,1,2] shape (3,1).",
      steps: [
        { state: "Gaussian weights từ x0: [e^(−1/2),e^(−9/2)]≈[0.6065,0.0111]", explanation: "Điểm cách 3 bị giảm rất mạnh." },
        { state: "p_{1|0}≈0.9820; p_{2|0}≈0.0180", explanation: "Chuẩn hóa hai weight trong hàng điều kiện." },
        { state: "Student weights từ y0: [1/(1+1),1/(1+4)]=[0.5,0.2]", explanation: "Đuôi nặng giảm chậm hơn Gaussian." },
        { state: "Tỷ lệ chuẩn hóa cục bộ≈[0.7143,0.2857]", explanation: "Đây minh họa đuôi nặng; q thật chuẩn hóa trên mọi cặp." },
      ],
      conclusion: "Student-t dành nhiều khối lượng hơn cho điểm xa, giúp giảm crowding trong embedding thấp chiều.",
      sanityChecks: ["Conditional probabilities cộng 1.", "Không diễn giải trục y.", "Chạy seed khác để kiểm tra ổn định lân cận."],
    }],
    implementationChecklist: ["Scale/chọn feature trước.", "Tính perplexity hợp lệ.", "Dùng Student-t q toàn cục.", "Chạy nhiều seed.", "Lưu cấu hình visualization."],
    masteryChecklist: ["Giải thích perplexity.", "Phân biệt p và q.", "Giải thích KL bất đối xứng.", "Nhận ra crowding.", "Không suy cluster từ khoảng cách đảo."],
    glossary: [{ term: "Perplexity", definition: "Kích thước lân cận hiệu dụng từ entropy." }, { term: "Crowding", definition: "Thiếu thể tích thấp chiều để giữ mọi lân cận cao chiều." }, { term: "Early exaggeration", definition: "Tạm khuếch đại p để hình thành cấu trúc đầu." }, { term: "KL divergence", definition: "Độ lệch bất đối xứng giữa hai phân phối." }, { term: "Student-t kernel", definition: "Kernel đuôi nặng dùng để tạo similarity trong embedding." }],
    sourceIds: ["ioai-2026", "pml-intro"],
  },
  "ml-umap": {
    lessonId: "ml-umap",
    readingMinutes: 35,
    openingQuestions: ["UMAP xây fuzzy graph từ k-NN thế nào?", "n_neighbors và min_dist tác động khác nhau ra sao?", "UMAP giữ topology tuyệt đối hay xấp xỉ?"],
    sections: [
      {
        title: "Đồ thị lân cận mờ",
        paragraphs: [
          "UMAP tìm k-NN theo metric, rồi đặt khoảng cách cục bộ ρ_i để láng giềng gần nhất có membership cao và scale σ_i để thích nghi mật độ. Directed memberships được hợp bằng fuzzy union thành trọng số cạnh đối xứng.",
          "n_neighbors nhỏ ưu tiên cấu trúc rất cục bộ; lớn đưa thêm bối cảnh toàn cục nhưng có thể xóa nhóm nhỏ. Metric phải phản ánh dữ liệu: cosine cho hướng embedding, Euclid cho tọa độ đã scale.",
        ],
        formulas: ["w_{i→j}=exp(−max(0,d_ij−ρ_i)/σ_i)", "w_ij=w_{i→j}+w_{j→i}−w_{i→j}w_{j→i}"],
      },
      {
        title: "Tối ưu embedding",
        paragraphs: [
          "Trong thấp chiều, UMAP định nghĩa hàm membership giảm theo khoảng cách và tối ưu cross-entropy giữa graph gốc với graph embedding. Cạnh thật tạo lực hút; negative sampling xấp xỉ lực đẩy cho non-edge.",
          "min_dist điều khiển mức điểm được phép đóng gói trong cluster, không phải số cluster. Optimization stochastic nên seed, initialization và số epoch ảnh hưởng tọa độ; quay/phản chiếu không đổi ý nghĩa.",
        ],
        formulas: ["v_ij=1/(1+a||y_i−y_j||^{2b})", "CE=−Σ[w log v+(1−w)log(1−v)]"],
      },
      {
        title: "Ứng dụng và kiểm định",
        paragraphs: [
          "UMAP thường nhanh và có transform cho điểm mới, nhưng transform phụ thuộc graph/model đã fit. Nếu dùng trong supervised pipeline, fit reducer chỉ trên train. Tọa độ 2D phục vụ xem dữ liệu; embedding nhiều chiều có thể là feature nhưng phải validation.",
          "Không xem các đảo là class thật nếu chưa kiểm tra stability, trustworthiness và metadata độc lập. So nhiều n_neighbors/min_dist, nhiều seed và chất lượng k-NN trước/sau.",
        ],
        bullets: ["Báo metric và tham số.", "Kiểm tra duplicate/outlier.", "Không fit train-test chung."],
      },
    ],
    workedExamples: [{
      title: "Tính membership cục bộ",
      problem: "Từ điểm i có ba khoảng cách [0.2,0.5,1.0], chọn ρ_i=0.2, σ_i=0.4. Vector khoảng cách shape (3,).",
      steps: [
        { state: "w_i1=exp(−max(0,0.2−0.2)/0.4)=1", explanation: "Láng giềng trong bán kính cục bộ có membership tối đa." },
        { state: "w_i2=exp(−0.3/0.4)≈0.4724", explanation: "Membership giảm theo khoảng cách đã hiệu chỉnh." },
        { state: "w_i3=exp(−0.8/0.4)≈0.1353", explanation: "Điểm xa vẫn có trọng số dương nhỏ." },
        { state: "Nếu w_{2→i}=0.6 thì union=0.4724+0.6−0.4724×0.6≈0.7889", explanation: "Fuzzy union kết hợp hai hướng mà không vượt 1." },
      ],
      conclusion: "ρ và σ làm khoảng cách được chuẩn hóa theo mật độ cục bộ trước khi dựng graph.",
      sanityChecks: ["Mọi membership trong [0,1].", "Union đối xứng.", "Khoảng cách tăng không làm directed weight tăng."],
    }],
    implementationChecklist: ["Chọn metric hợp dữ liệu.", "Xây k-NN không gồm chính điểm.", "Giải σ theo mục tiêu.", "Dùng fuzzy union đúng.", "Đánh giá nhiều seed/tham số."],
    masteryChecklist: ["Tính membership nhỏ.", "Giải thích n_neighbors.", "Phân biệt min_dist.", "Hiểu negative sampling.", "Đánh giá trustworthiness."],
    glossary: [{ term: "Fuzzy graph", definition: "Đồ thị có cạnh mang membership trong [0,1]." }, { term: "Local connectivity", definition: "Bán kính ρ bảo đảm lân cận gần có liên kết mạnh." }, { term: "Negative sampling", definition: "Lấy mẫu non-edge để xấp xỉ lực đẩy." }, { term: "Trustworthiness", definition: "Mức lân cận thấp chiều không tạo hàng xóm giả." }, { term: "min_dist", definition: "Tham số điều khiển độ đóng gói cục bộ của embedding UMAP." }],
    sourceIds: ["ioai-2026", "pml-intro"],
  },
  "ml-dbscan": {
    lessonId: "ml-dbscan",
    readingMinutes: 34,
    openingQuestions: ["Core, border và noise được định nghĩa ra sao?", "DBSCAN tìm cluster hình dạng nào?", "Một epsilon có thể xử lý mật độ khác nhau không?"],
    sections: [
      {
        title: "Mật độ và density reachability",
        paragraphs: [
          "DBSCAN định nghĩa ε-neighborhood quanh mỗi điểm. Core point có ít nhất min_samples điểm trong vùng, thường tính cả chính nó; border point nằm trong vùng của core nhưng không đủ dày; còn lại là noise.",
          "Cluster là tập điểm density-connected qua chuỗi core. Thuật toán mở rộng từ core, thêm hàng xóm và tiếp tục khi gặp core mới. Border có thể chạm hai cluster; thứ tự duyệt có thể quyết định nó thuộc bên nào nhưng core components không đổi.",
        ],
        formulas: ["N_ε(x)={z:d(x,z)≤ε}", "core nếu |N_ε(x)|≥min_samples"],
      },
      {
        title: "Chọn epsilon, metric và scale",
        paragraphs: [
          "k-distance plot sắp khoảng cách tới láng giềng thứ k để tìm khuỷu gợi ý ε; đây không phải quy tắc tự động chắc chắn. min_samples lớn đòi vùng dày hơn và thường tăng noise. Scale feature thay đổi hoàn toàn neighborhood.",
          "Euclid phù hợp tọa độ liên tục đã scale; haversine cho địa lý, cosine cho hướng embedding nhưng cần kiểm tra implementation có hỗ trợ index. Trong chiều cao, khoảng cách tập trung làm khái niệm mật độ yếu.",
        ],
        formulas: ["k thường liên hệ min_samples", "ε có cùng đơn vị với metric sau preprocessing"],
      },
      {
        title: "Ưu điểm, giới hạn và chi phí",
        paragraphs: [
          "DBSCAN không cần k, nhận cluster phi lồi và gắn noise rõ ràng. Nó thất bại khi cluster có mật độ rất khác vì một ε hoặc làm vỡ cụm thưa hoặc nối cụm dày; OPTICS/HDBSCAN là hướng thay thế.",
          "Range query có spatial index có thể gần O(n log n) trong điều kiện thuận lợi; brute force O(n²) khoảng cách. Đánh giá cần xét stability và miền, không chỉ silhouette vì noise và hình phi lồi làm metric này khó đọc.",
        ],
        formulas: ["T_bruteforce=O(n²d)", "label noise thường là −1"],
      },
    ],
    workedExamples: [{
      title: "Hai cụm và một điểm nhiễu trên trục số",
      problem: "X=[0,0.1,0.2,1.0,1.1,3.0] shape (6,1), ε=0.15, min_samples=2, tính cả chính điểm.",
      steps: [
        { state: "N(0)={0,0.1}; N(0.1)={0,0.1,0.2}; N(0.2)={0.1,0.2}", explanation: "Ba điểm đầu đều là core và nối thành chuỗi." },
        { state: "N(1.0)={1.0,1.1}; N(1.1)={1.0,1.1}", explanation: "Hai điểm tạo component core thứ hai." },
        { state: "N(3.0)={3.0}", explanation: "Chỉ một điểm, nhỏ hơn min_samples nên không core." },
        { state: "labels có thể [0,0,0,1,1,−1]", explanation: "Số id cluster tùy thứ tự, cấu trúc hai cụm + noise không đổi." },
      ],
      conclusion: "DBSCAN suy cluster từ kết nối mật độ, không từ centroid.",
      sanityChecks: ["Khoảng cách dùng ≤ε nhất quán.", "Tính chính điểm trong neighborhood.", "Hoán vị cluster id không đổi partition."],
    }],
    implementationChecklist: ["Scale/chọn metric.", "Xác định có tính self.", "Dùng queue tránh mở rộng lặp.", "Đánh dấu core/border/noise.", "Kiểm tra nhiều ε/min_samples."],
    masteryChecklist: ["Phân loại core/border/noise.", "Trace expansion nhỏ.", "Đọc k-distance plot.", "Nêu lỗi mật độ biến đổi.", "Phân tích index và O(n²)."],
    glossary: [{ term: "Core point", definition: "Điểm có neighborhood đủ min_samples." }, { term: "Border point", definition: "Điểm không core nhưng nằm gần core." }, { term: "Noise", definition: "Điểm không density-reachable từ core." }, { term: "Density-connected", definition: "Hai điểm nối được qua chuỗi core lân cận." }, { term: "Epsilon neighborhood", definition: "Tập điểm cách query không quá ε theo metric." }],
    sourceIds: ["ioai-2026", "pml-intro"],
  },
  "ml-hierarchical-clustering": {
    lessonId: "ml-hierarchical-clustering",
    readingMinutes: 35,
    openingQuestions: ["Linkage định nghĩa khoảng cách giữa hai cluster thế nào?", "Dendrogram height có ý nghĩa gì?", "Ward linkage dùng được với mọi metric không?"],
    sections: [
      {
        title: "Agglomerative và dendrogram",
        paragraphs: [
          "Agglomerative clustering bắt đầu mỗi điểm là một cluster rồi lặp ghép cặp gần nhất. Lịch sử n−1 lần ghép tạo dendrogram; cắt cây ở độ cao hoặc số cluster cho partition. ID và thứ tự trái-phải của nhánh không mang ý nghĩa.",
          "Khoảng cách tại merge không nhất thiết là khoảng cách giữa centroid; nó phụ thuộc linkage. Dendrogram cho thấy nhiều mức phân giải, nhưng không chứng minh hierarchy tồn tại tự nhiên trong dữ liệu.",
        ],
        formulas: ["ban đầu C_i={x_i}", "mỗi bước: (A,B)=argmin linkage(A,B)"],
      },
      {
        title: "Single, complete, average và Ward",
        paragraphs: [
          "Single lấy khoảng cách nhỏ nhất và bắt cluster dạng chuỗi nhưng dễ chaining qua cầu noise. Complete lấy lớn nhất, tạo cụm compact nhưng nhạy outlier. Average lấy trung bình mọi cặp, cân bằng hai hành vi.",
          "Ward chọn merge làm tăng within-cluster SSE ít nhất và gắn với squared Euclidean geometry; không kết hợp tùy tiện Ward với cosine/manhattan. Feature scale vẫn quyết định khoảng cách.",
        ],
        formulas: ["single(A,B)=min_{a,b}d(a,b)", "complete=max_{a,b}d(a,b)", "average=(1/|A||B|)Σd(a,b)"],
      },
      {
        title: "Tính toán và đánh giá cây",
        paragraphs: [
          "Ma trận pairwise đầy đủ dùng O(n²) bộ nhớ; naive merge có thể O(n³), implementation tối ưu thường khoảng O(n² log n) hoặc O(n²) tùy linkage. Vì thế sample lớn cần cân nhắc BIRCH hoặc phương pháp khác.",
          "Chọn cut bằng silhouette/stability và kiến thức miền. Cophenetic distance đo height hai điểm lần đầu cùng cluster; correlation với khoảng cách gốc đánh giá dendrogram bảo tồn cặp khoảng cách, không tự chọn partition tốt nhất.",
        ],
        formulas: ["cophenetic(i,j)=height của merge chung đầu tiên", "n điểm tạo n−1 merge"],
      },
    ],
    workedExamples: [{
      title: "Linkage thay đổi độ cao merge cuối",
      problem: "Bốn điểm 1D A=0,B=1,C=5,D=6, dữ liệu shape (4,1).",
      steps: [
        { state: "Ghép A–B ở distance 1 và C–D ở distance 1", explanation: "Hai cặp gần nhất độc lập." },
        { state: "single({A,B},{C,D})=min{5,6,4,5}=4", explanation: "Dùng cặp B–C gần nhất." },
        { state: "complete=max{5,6,4,5}=6", explanation: "Dùng cặp A–D xa nhất." },
        { state: "average=(5+6+4+5)/4=5", explanation: "Ba linkage tạo cùng hai cụm ở k=2 nhưng dendrogram height khác." },
      ],
      conclusion: "Linkage là giả định hình học, không phải chi tiết triển khai có thể bỏ qua.",
      sanityChecks: ["Có đúng 3 merge.", "Height đầu là 1.", "Hoán vị input không đổi distance multiset."],
    }],
    implementationChecklist: ["Scale/chọn metric.", "Khóa linkage tương thích.", "Lưu n−1 merge.", "Không dựng matrix quá RAM.", "Đánh giá nhiều mức cắt."],
    masteryChecklist: ["Tính ba linkage.", "Đọc dendrogram.", "Giải thích chaining.", "Nêu điều kiện Ward.", "Phân tích O(n²) memory."],
    glossary: [{ term: "Linkage", definition: "Quy tắc khoảng cách giữa hai cluster." }, { term: "Dendrogram", definition: "Cây biểu diễn lịch sử merge và độ cao." }, { term: "Chaining", definition: "Single linkage nối cụm qua chuỗi điểm/cầu." }, { term: "Cophenetic distance", definition: "Độ cao lần đầu hai điểm cùng cluster." }, { term: "Ward linkage", definition: "Quy tắc ghép làm tăng within-cluster SSE ít nhất." }],
    sourceIds: ["ioai-2026", "pml-intro"],
  },
  "ml-spectral-clustering": {
    lessonId: "ml-spectral-clustering",
    readingMinutes: 40,
    openingQuestions: ["Graph Laplacian mã hóa cluster thế nào?", "Vì sao eigenvector nhỏ nhất giúp cắt graph?", "Similarity graph sai làm kết quả sai ở đâu?"],
    sections: [
      {
        title: "Từ điểm dữ liệu sang similarity graph",
        paragraphs: [
          "Spectral clustering biến mẫu thành node, cạnh mang similarity. Có thể dùng ε-neighborhood, k-NN hoặc RBF đầy đủ. k-NN directed cần symmetrize; graph quá thưa bị vỡ, quá dày làm mất cấu trúc manifold.",
          "RBF bandwidth γ/σ quyết định locality và chịu scale feature. Self-loop thường bỏ. Chất lượng graph quan trọng hơn eigen solver; feature noise tạo cạnh tắt nối hai cụm sẽ làm cut khó.",
        ],
        formulas: ["W_ij=exp(−||x_i−x_j||²/(2σ²))", "D_ii=Σ_jW_ij"],
      },
      {
        title: "Laplacian và eigenvectors",
        paragraphs: [
          "Unnormalized Laplacian L=D−W là positive semidefinite. Số eigenvalue 0 bằng số connected components; vector chỉ báo component nằm trong null space. Khi graph gần tách, các eigenvector nhỏ tương ứng gần piecewise constant.",
          "Normalized variants L_sym=I−D^(−1/2)WD^(−1/2) và random-walk L_rw=I−D^(−1)W xử lý degree khác nhau. Phải dùng đúng eigenvectors và chuẩn hóa hàng theo biến thể thuật toán.",
        ],
        formulas: ["L=D−W", "L_sym=I−D^(−1/2)WD^(−1/2)", "zᵀLz=(1/2)Σ_ijW_ij(z_i−z_j)²"],
      },
      {
        title: "Embedding, k-means và giới hạn",
        paragraphs: [
          "Lấy k eigenvectors phù hợp tạo U shape (n,k), xem mỗi hàng là embedding node rồi chạy k-means. Với biến thể normalized L_sym theo Ng–Jordan–Weiss, cần chuẩn hóa từng hàng U trước k-means; biến thể unnormalized thường gom trực tiếp các hàng. Dấu/rotation trong eigenspace suy biến có thể đổi nhưng pairwise geometry và partition lý tưởng không đổi.",
          "Phương pháp bắt cluster phi lồi nhưng cần chọn k và graph parameters. Ma trận dense tốn O(n²) memory, eigendecomposition có thể O(n³); sparse graph và solver Lanczos giúp scale, còn Nyström xấp xỉ cho n lớn.",
        ],
        formulas: ["U=[u_1,…,u_k]∈R^{n×k}", "labels=kmeans(U,k), hoặc kmeans(row_normalize(U),k) theo biến thể Laplacian"],
      },
    ],
    workedExamples: [{
      title: "Hai connected components cho hai cluster chính xác",
      problem: "W shape (4,4) có cạnh 0–1 và 2–3 trọng số 1, không có cạnh chéo: W=[[0,1,0,0],[1,0,0,0],[0,0,0,1],[0,0,1,0]].",
      steps: [
        { state: "D=I₄ vì mỗi node degree 1", explanation: "Tổng mỗi hàng W bằng 1." },
        { state: "L=D−W gồm hai block [[1,−1],[−1,1]]", explanation: "Mỗi block là Laplacian của một cặp nối." },
        { state: "Hai eigenvalue 0 với vectors [1,1,0,0] và [0,0,1,1]", explanation: "Số zero eigenvalues bằng hai components." },
        { state: "U shape (4,2): hai hàng đầu giống nhau, hai hàng cuối giống nhau", explanation: "k-means k=2 tách chính xác {0,1} và {2,3}." },
      ],
      conclusion: "Spectral embedding biến connectivity phi tuyến thành các điểm dễ tách trong eigenspace.",
      sanityChecks: ["W đối xứng và không âm.", "L·1_component=0.", "Eigenvalues không âm trong sai số số."],
    }],
    implementationChecklist: ["Scale trước dựng graph.", "Symmetrize k-NN.", "Kiểm tra connected components.", "Dùng Laplacian/eigenvectors nhất quán.", "Dùng sparse solver khi n lớn."],
    masteryChecklist: ["Tính W,D,L nhỏ.", "Giải thích zero eigenvalues.", "Phân biệt Laplacian variants.", "Trace U→k-means.", "Chẩn đoán graph quá thưa/dày."],
    glossary: [{ term: "Similarity graph", definition: "Đồ thị có cạnh biểu diễn độ giống giữa mẫu." }, { term: "Graph Laplacian", definition: "Ma trận D−W hoặc biến thể chuẩn hóa mã hóa độ trơn trên graph." }, { term: "Connected component", definition: "Tập node có đường đi nối nhau." }, { term: "Spectral embedding", definition: "Tọa độ node tạo từ eigenvectors của Laplacian." }, { term: "Eigengap", definition: "Khoảng cách giữa eigenvalues liên tiếp dùng gợi ý số cluster." }],
    sourceIds: ["ioai-2026", "mml", "pml-intro"],
  },
} satisfies LessonTheoryMap;
