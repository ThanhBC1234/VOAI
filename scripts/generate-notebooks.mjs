import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const md = (source) => ({ cell_type: "markdown", metadata: {}, source: source.split("\n").map((line) => `${line}\n`) });
const code = (source) => ({ cell_type: "code", execution_count: null, metadata: {}, outputs: [], source: source.split("\n").map((line) => `${line}\n`) });

const modules = [
  {
    file: "00_khoi_dong_va_diagnostic.ipynb",
    title: "Khởi động & chẩn đoán Python từ nền C++",
    duration: "45–60 phút",
    outcomes: ["Phân biệt list, tuple, dict và NumPy array", "Đọc traceback từ dưới lên", "Viết hàm có assert và không thay đổi input"],
    concept: "Python ưu tiên biểu đạt ý tưởng, nhưng VOAI vẫn đòi hỏi kỷ luật về kiểu dữ liệu, shape và độ phức tạp. Khác C++, tên biến tham chiếu tới object; phép gán không mặc định sao chép list.",
    setup: "import random\nrandom.seed(42)\nvalues = [3, -1, 4, -1, 5, 9]\nprint('Dữ liệu:', values)",
    task: "def stable_unique(values):\n    \"\"\"Trả phần tử không trùng, giữ thứ tự xuất hiện; không sửa input.\"\"\"\n    # TODO: tự code, không dùng dict.fromkeys\n    pass",
    tests: "original = values.copy()\nassert stable_unique([3, 1, 3, 2, 1]) == [3, 1, 2]\nassert stable_unique([]) == []\nassert stable_unique(values) is not values\nassert values == original\nprint('✓ Visible tests đạt')",
    deep: "Phân tích độ phức tạp nếu dùng list để kiểm tra membership, rồi cải tiến bằng set. Giải thích vì sao set chỉ dùng để kiểm tra nhưng list vẫn cần để giữ thứ tự.",
  },
  {
    file: "01_numpy_linear_regression.ipynb",
    title: "NumPy & Linear Regression từ đầu",
    duration: "60 phút",
    outcomes: ["Dùng shape và broadcasting có chủ đích", "Cài predict, MSE và gradient", "Gradient-check bằng sai phân hữu hạn"],
    concept: "Linear regression tìm siêu phẳng Xw+b làm MSE nhỏ nhất. Gradient của MSE theo w là 2/n · Xᵀ(Xw+b−y); theo b là 2/n lần tổng residual.",
    setup: "import numpy as np\nnp.random.seed(42)\nX = np.linspace(-2, 2, 40).reshape(-1, 1)\ny = 3.0 * X[:, 0] - 0.7 + np.random.normal(0, 0.18, len(X))\nprint(X.shape, y.shape)",
    task: "def predict(X, w, b):\n    # TODO: vector hóa, không loop theo sample\n    pass\n\ndef mse_and_gradients(X, y, w, b):\n    # TODO: trả loss, grad_w, grad_b\n    pass\n\nw = np.zeros(X.shape[1]); b = 0.0\n# TODO: viết training loop 200 bước gradient descent",
    tests: "test_X=np.array([[1.,2.],[3.,4.]])\ntest_w=np.array([.5,-1.])\nassert np.allclose(predict(test_X,test_w,2.), np.array([.5,-.5]))\nloss,gw,gb=mse_and_gradients(np.array([[1.],[2.]]),np.array([2.,4.]),np.array([0.]),0.)\nassert np.isfinite(loss) and gw.shape==(1,) and np.isscalar(gb)\nprint('✓ Interface tests đạt; hãy tự gradient-check')",
    deep: "Tự viết numerical gradient với epsilon=1e-5. Nếu sai khác tương đối >1e-6, đừng huấn luyện tiếp: tìm lỗi shape hoặc hệ số 2/n.",
  },
  {
    file: "02_classical_ml_pipeline.ipynb",
    title: "Pipeline ML tabular không leakage",
    duration: "45–60 phút",
    outcomes: ["Chia train/validation/test trước preprocessing", "So sánh baseline, logistic, tree và random forest", "Chọn metric theo chi phí sai lầm"],
    concept: "Data leakage xảy ra khi thông tin ngoài tập train ảnh hưởng tới bước fit. Imputer, scaler, feature selection và tuning đều phải học chỉ từ train; Pipeline giúp đóng gói quy tắc đó.",
    setup: "from sklearn.datasets import load_breast_cancer\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.metrics import f1_score, confusion_matrix\nX,y=load_breast_cancer(return_X_y=True)\nX_train,X_test,y_train,y_test=train_test_split(X,y,test_size=.2,stratify=y,random_state=42)\nprint(X_train.shape, X_test.shape)",
    task: "# TODO 1: tách validation từ X_train\n# TODO 2: tạo Pipeline(SimpleImputer, StandardScaler, LogisticRegression)\n# TODO 3: fit trên train, chọn threshold bằng validation\n# TODO 4: đánh giá đúng một lần trên test\nmodel = None",
    tests: "assert X_train.shape[0] > X_test.shape[0]\nassert model is not None, 'Hãy tạo pipeline vào biến model'\nassert hasattr(model, 'predict')\nprint('✓ Pipeline tồn tại; kiểm tra tiếp confusion matrix và F1')",
    deep: "So sánh RandomForest và LogisticRegression trên cùng split. Viết bảng lỗi false negative/false positive và giải thích threshold nào phù hợp nếu bỏ sót ca dương đắt hơn báo động nhầm.",
  },
  {
    file: "03_mlp_backprop_pytorch.ipynb",
    title: "MLP, backprop và training loop PyTorch",
    duration: "60 phút",
    outcomes: ["Trace forward pass bằng NumPy", "Giải thích chain rule qua từng tensor", "Tự viết training loop PyTorch không helper"],
    concept: "Backprop không phải thuật toán tối ưu; nó tính gradient hiệu quả bằng chain rule. Optimizer mới dùng gradient để đổi tham số. Luôn kiểm tra shape: batch × feature.",
    setup: "import numpy as np\nnp.random.seed(42)\nX=np.array([[0.,0.],[0.,1.],[1.,0.],[1.,1.]])\ny=np.array([[0.],[1.],[1.],[0.]])\nW1=np.random.randn(2,4)*.3; b1=np.zeros((1,4)); W2=np.random.randn(4,1)*.3; b2=np.zeros((1,1))",
    task: "def sigmoid(z):\n    # TODO: bản ổn định số học\n    pass\n\ndef forward(X,W1,b1,W2,b2):\n    # TODO: trả prediction và cache cần cho backward\n    pass\n\ndef backward(y, cache, W2):\n    # TODO: tự suy ra 4 gradient\n    pass",
    tests: "assert np.allclose(sigmoid(np.array([0.])), .5)\npred,cache=forward(X,W1,b1,W2,b2)\nassert pred.shape==(4,1)\nassert np.all((pred>0)&(pred<1))\nprint('✓ Forward interface đạt; tiếp tục gradient-check từng tham số')",
    deep: "Sau khi bản NumPy đạt gradient-check, viết lại bằng torch.nn.Module nhưng tự viết zero_grad → forward → loss → backward → step. So sánh loss curve của SGD và Adam.",
  },
  {
    file: "04_computer_vision_cnn.ipynb",
    title: "Computer Vision: convolution đến transfer learning",
    duration: "45–60 phút",
    outcomes: ["Cài cross-correlation 2D", "Nhìn ảnh qua feature map", "Dựng Dataset/DataLoader và CNN nhỏ"],
    concept: "Convolution khai thác locality và weight sharing. Kernel dò cạnh phản ứng mạnh nơi pixel đổi nhanh; nhiều layer ghép đặc trưng đơn giản thành hình dạng phức tạp.",
    setup: "import numpy as np\nimage=np.array([[0,0,0,0,0],[0,1,1,1,0],[0,1,1,1,0],[0,1,1,1,0],[0,0,0,0,0]],dtype=float)\nedge=np.array([[-1,-1,-1],[-1,8,-1],[-1,-1,-1]],dtype=float)",
    task: "def conv2d_valid(image, kernel):\n    # TODO: stride=1, không padding, không scipy\n    pass\n\nfeature = conv2d_valid(image, edge)",
    tests: "assert conv2d_valid(np.array([[1,2],[3,4]]),np.array([[2]])).tolist()==[[2,4],[6,8]]\nassert feature.shape==(3,3)\nprint('Feature map:', feature)",
    deep: "Tạo ba ảnh toy: vùng phẳng, cạnh dọc, cạnh ngang. So sánh output của blur, sharpen và edge kernel. Sau đó dựng CNN PyTorch nhỏ và ghi rõ shape sau mỗi layer.",
  },
  {
    file: "05_nlp_attention.ipynb",
    title: "NLP: TF-IDF, embedding và attention",
    duration: "60 phút",
    outcomes: ["Chuẩn hóa Unicode tiếng Việt", "Cài TF-IDF nhỏ", "Tính scaled dot-product attention"],
    concept: "TF-IDF mô tả tài liệu bằng tần suất có điều chỉnh độ hiếm; embedding học tọa độ dày; attention tạo trọng số phụ thuộc ngữ cảnh giữa các token.",
    setup: "import math, re, unicodedata\nimport numpy as np\ndocs=['mô hình học từ dữ liệu','dữ liệu tốt giúp mô hình tốt','học máy cần đánh giá']\ndocs=[unicodedata.normalize('NFC',d.lower()) for d in docs]",
    task: "def tfidf_matrix(documents):\n    # TODO: tokenize đơn giản, smooth idf=log((1+n)/(1+df))+1\n    # trả matrix và vocabulary theo thứ tự từ điển\n    pass\n\ndef scaled_dot_attention(Q,K,V):\n    # TODO: softmax ổn định theo hàng\n    pass",
    tests: "M,vocab=tfidf_matrix(docs)\nassert M.shape==(3,len(vocab)) and vocab==sorted(vocab)\nQ=np.eye(2); out,weights=scaled_dot_attention(Q,Q,np.array([[1.,2.],[3.,4.]]))\nassert out.shape==(2,2) and np.allclose(weights.sum(axis=1),1)\nprint('✓ Shape và chuẩn hóa attention đạt')",
    deep: "Giải thích vì sao softmax phải trừ max trước exp. Thay temperature và đo entropy từng hàng. So sánh classifier TF-IDF + LogisticRegression với embedding trung bình.",
  },
  {
    file: "06_audio_stft_mel.ipynb",
    title: "Audio: waveform, STFT, Mel và MFCC",
    duration: "60 phút",
    outcomes: ["Liên hệ sample rate với Nyquist", "Tự chia frame và dùng window", "Đọc spectrogram theo thời gian–tần số"],
    concept: "STFT áp dụng FFT trên các cửa sổ chồng lấn: cửa sổ ngắn định vị thời gian tốt nhưng phân giải tần số kém. Mel nén trục tần số theo cảm nhận; MFCC nén log-Mel bằng DCT.",
    setup: "import numpy as np\nsr=16000; duration=.5\nt=np.arange(int(sr*duration))/sr\nwave=.8*np.sin(2*np.pi*440*t)+.25*np.sin(2*np.pi*880*t)\nprint(len(wave), 'samples')",
    task: "def frame_signal(x, frame_length, hop_length):\n    # TODO: padding cuối bằng 0, trả shape (n_frames, frame_length)\n    pass\n\ndef stft_magnitude(x, frame_length=400, hop_length=160):\n    # TODO: Hann window + np.fft.rfft, trả magnitude\n    pass",
    tests: "frames=frame_signal(np.arange(7),4,2)\nassert frames.shape==(3,4) and frames[-1].tolist()==[4,5,6,0]\nS=stft_magnitude(wave)\nassert S.ndim==2 and S.shape[1]==201 and np.all(S>=0)\nprint('✓ STFT shape:',S.shape)",
    deep: "Tìm bin gần 440 Hz và 880 Hz. Thay frame_length 256/1024, giải thích đánh đổi. Nếu cài librosa, so sánh output nhưng không thay phần tự cài.",
  },
  {
    file: "07_mock_voai_end_to_end.ipynb",
    title: "Mock VOAI: từ đề lạ đến submission tái lập",
    duration: "Chia 6 phiên × 60 phút",
    outcomes: ["Đọc metric và dựng baseline trong 30 phút", "Thiết kế split chống leakage", "Lưu prediction đúng format và tái lập bằng seed"],
    concept: "Trong đề thi, baseline sớm cho vòng lặp nhanh. Thứ tự an toàn: hiểu metric → kiểm tra dữ liệu → split → baseline → error analysis → một thay đổi mỗi lần → xác nhận validation → đóng gói submission.",
    setup: "import numpy as np\nfrom sklearn.datasets import make_classification\nX,y=make_classification(n_samples=900,n_features=24,n_informative=8,weights=[.72,.28],flip_y=.04,random_state=42)\nprint(X.shape, np.bincount(y))",
    task: "# PHIÊN 1: viết data audit và chọn metric\n# PHIÊN 2: split có stratify, giữ test giả lập kín\n# PHIÊN 3: baseline đơn giản\n# PHIÊN 4: error analysis và một cải tiến\n# PHIÊN 5: ablation + kiểm tra seed\n# PHIÊN 6: xuất submission.csv và báo cáo 1 trang\nmodel = None\nvalidation_score = None",
    tests: "assert model is not None, 'Cần một mô hình đã fit'\nassert validation_score is not None and 0 <= validation_score <= 1\n# TODO: thêm assert không trùng chỉ số giữa train/validation/mock-test\nprint('✓ Sẵn sàng chạy audit cuối')",
    deep: "Lặp mock với ảnh, văn bản hoặc audio từ kho IOAI chính thức. Không reuse test để tuning. Nhật ký phải ghi thử nghiệm, seed, metric và quyết định giữ/bỏ.",
  },
];

const outputDir = join(process.cwd(), "notebooks");
mkdirSync(outputDir, { recursive: true });

for (const moduleSpec of modules) {
  const notebook = {
    cells: [
      md(`# ${moduleSpec.title}\n\n**Thời lượng:** ${moduleSpec.duration}  \n**Chế độ:** SOLO-90 — không dùng AI sinh code hoặc pseudocode.\n\nNotebook này là bài thực hành có chủ đích, không phải lời giải mẫu.`),
      md(`## Mục tiêu\n\n${moduleSpec.outcomes.map((item) => `- ${item}`).join("\n")}`),
      md(`## Trực giác cốt lõi\n\n${moduleSpec.concept}\n\nTrước khi chạy cell tiếp theo, hãy viết một dự đoán vào sổ học.`),
      code(moduleSpec.setup),
      md("## Tự cài đặt\n\nKhông mở đáp án. Đầu tiên hãy ghi input/output, shape và edge cases; sau đó mới viết code."),
      code(moduleSpec.task),
      md("## Visible tests\n\nCác test dưới đây chỉ kiểm tra interface và trường hợp cơ bản. Hidden tests của bộ chấm sẽ dùng dữ liệu khác và edge cases."),
      code(moduleSpec.tests),
      md(`## Deep 60\n\n${moduleSpec.deep}`),
      md("## Exit ticket\n\n1. Tôi có thể giải thích thuật toán mà không nhìn code không?  \n2. Edge case nào làm bản đầu tiên sai?  \n3. Độ phức tạp thời gian/bộ nhớ là gì?  \n4. Tôi sẽ ôn lại điều gì vào ngày +1, +7 và +21?"),
    ],
    metadata: {
      kernelspec: { display_name: "Python 3", language: "python", name: "python3" },
      language_info: { name: "python", version: "3.11" },
      voai_lab: { solo90: true, generated: true, version: 1 },
    },
    nbformat: 4,
    nbformat_minor: 5,
  };
  writeFileSync(join(outputDir, moduleSpec.file), `${JSON.stringify(notebook, null, 2)}\n`, "utf8");
}

console.log(`Generated ${modules.length} notebooks in ${outputDir}`);
