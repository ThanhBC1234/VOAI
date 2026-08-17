import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const md = (source) => ({ cell_type: "markdown", metadata: {}, source: source.split("\n").map((line) => `${line}\n`) });
const code = (source) => ({ cell_type: "code", execution_count: null, metadata: {}, outputs: [], source: source.split("\n").map((line) => `${line}\n`) });

/**
 * nbformat 4.5 bắt buộc mỗi cell có `id`: chuỗi 1–64 ký tự thuộc [a-zA-Z0-9-_]
 * và duy nhất trong notebook. Trước đây generator khai `nbformat_minor: 5`
 * nhưng không sinh id nào, nên cả 8 notebook đều sai schema (NOTEBOOK-P2-01).
 *
 * ID được suy ra tất định từ (tên tệp, vị trí cell) nên chạy generator hai lần
 * không tạo diff, và không phụ thuộc nội dung nên sửa chữ trong cell không làm
 * đổi id.
 */
const cellId = (file, index) =>
  `c${String(index).padStart(2, "0")}-${createHash("sha1").update(`${file}:${index}`).digest("hex").slice(0, 10)}`;

const withCellIds = (file, cells) => cells.map((cell, index) => ({ id: cellId(file, index), ...cell }));

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
    task: "def sigmoid(z):\n    # TODO: ban on dinh so hoc (tranh overflow khi z rat am/rat duong)\n    pass\n\ndef forward(X, W1, b1, W2, b2):\n    \"\"\"Contract:\n      - hidden activation: sigmoid; output activation: sigmoid\n      - tra (pred, cache) voi pred.shape == (N, 1)\n      - cache phai du cho backward: dict co khoa 'X', 'Z1', 'A1', 'Z2'\n    \"\"\"\n    # TODO\n    pass\n\ndef bce_loss(y, pred, eps=1e-12):\n    \"\"\"Binary cross-entropy trung binh theo mau. Kep pred vao [eps, 1-eps].\"\"\"\n    # TODO\n    pass\n\ndef backward(y, cache, W2):\n    \"\"\"Tra (dW1, db1, dW2, db2) cua bce_loss theo tung tham so.\n\n    Shape bat buoc: dW1 (2,4), db1 (1,4), dW2 (4,1), db2 (1,1).\n    Goi y: voi sigmoid o dau ra + BCE thi dZ2 = (pred - y) / N.\n    \"\"\"\n    # TODO\n    pass",
    tests: "assert np.allclose(sigmoid(np.array([0.])), .5)\npred, cache = forward(X, W1, b1, W2, b2)\nassert pred.shape == (4, 1) and np.all((pred > 0) & (pred < 1))\nassert {'X', 'Z1', 'A1', 'Z2'} <= set(cache), 'cache thieu khoa can cho backward'\n\n# Visible test PHAI goi backward va kiem tra shape tung gradient.\ndW1, db1, dW2, db2 = backward(y, cache, W2)\nassert dW1.shape == W1.shape and db1.shape == b1.shape\nassert dW2.shape == W2.shape and db2.shape == b2.shape\n\n# Numerical gradient check tren mot phan tu cua W2.\ndef loss_at(w2):\n    p, _ = forward(X, W1, b1, w2, b2)\n    return bce_loss(y, p)\n\neps = 1e-5\nW2p = W2.copy(); W2p[0, 0] += eps\nW2m = W2.copy(); W2m[0, 0] -= eps\nnumeric = (loss_at(W2p) - loss_at(W2m)) / (2 * eps)\nassert abs(numeric - dW2[0, 0]) < 1e-4, 'gradient giai tich khong khop gradient so'\nprint('OK Forward, backward va numerical gradient check deu dat')",
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
    task: "def tfidf_matrix(documents):\n    # TODO: tokenize don gian, smooth idf = log((1+n)/(1+df)) + 1\n    # tra (matrix, vocabulary) voi vocabulary theo thu tu tu dien\n    pass\n\ndef scaled_dot_attention(Q, K, V, mask=None):\n    \"\"\"Scaled dot-product attention co mask.\n\n    Contract:\n      - scores = Q @ K.T / sqrt(d_k)\n      - `mask` la mang bool broadcast duoc ve shape cua scores (n_q, n_k).\n        True = DUOC PHEP nhin, False = bi chan.\n      - Mask phai ap **truoc** softmax bang cach dat -inf cho vi tri bi chan,\n        khong duoc nhan 0 sau softmax (nhan sau lam tong trong so khac 1).\n      - softmax on dinh: tru max theo tung hang truoc khi exp.\n      - tra (output, weights); moi hang cua weights cong lai bang 1.\n    \"\"\"\n    # TODO\n    pass\n\ndef causal_mask(n):\n    \"\"\"Tra mask bool (n, n) cho mo hinh tu hoi quy: vi tri i chi nhin duoc j <= i.\"\"\"\n    # TODO\n    pass",
    tests: "M, vocab = tfidf_matrix(docs)\nassert M.shape == (3, len(vocab)) and vocab == sorted(vocab)\n\nQ = np.eye(2)\nV = np.array([[1., 2.], [3., 4.]])\nout, weights = scaled_dot_attention(Q, Q, V)\nassert out.shape == (2, 2) and np.allclose(weights.sum(axis=1), 1)\n\n# Mask phai chan that: vi tri bi chan co trong so ~0 va hang van tong bang 1.\nm = causal_mask(2)\nassert m.shape == (2, 2) and bool(m[0, 0]) and not bool(m[0, 1])\nout_m, w_m = scaled_dot_attention(Q, Q, V, mask=m)\nassert np.allclose(w_m.sum(axis=1), 1), 'mask ap sau softmax nen tong trong so khac 1'\nassert w_m[0, 1] < 1e-9, 'token tuong lai van nhan trong so'\nassert np.allclose(out_m[0], V[0]), 'hang dau phai chi lay tu token dau tien'\nprint('OK TF-IDF, attention va masking deu dat')",
    deep: "Giải thích vì sao softmax phải trừ max trước exp. Thay temperature và đo entropy từng hàng. So sánh classifier TF-IDF + LogisticRegression với embedding trung bình.",
  },
  {
    file: "06_audio_stft_mel.ipynb",
    title: "Audio: waveform, STFT, Mel và MFCC",
    duration: "60 phút",
    outcomes: ["Liên hệ sample rate với Nyquist", "Tự chia frame và dùng window", "Đọc spectrogram theo thời gian–tần số"],
    concept: "STFT áp dụng FFT trên các cửa sổ chồng lấn: cửa sổ ngắn định vị thời gian tốt nhưng phân giải tần số kém. Mel nén trục tần số theo cảm nhận; MFCC nén log-Mel bằng DCT.",
    setup: "import numpy as np\nsr=16000; duration=.5\nt=np.arange(int(sr*duration))/sr\nwave=.8*np.sin(2*np.pi*440*t)+.25*np.sin(2*np.pi*880*t)\nprint(len(wave), 'samples')",
    task: "def frame_signal(x, frame_length, hop_length):\n    # TODO: padding cuoi bang 0, tra shape (n_frames, frame_length)\n    pass\n\ndef stft_magnitude(x, frame_length=400, hop_length=160):\n    # TODO: Hann window + np.fft.rfft, tra magnitude (n_frames, n_fft//2+1)\n    pass\n\ndef hz_to_mel(f):\n    \"\"\"Thang Mel kieu HTK: 2595 * log10(1 + f/700).\"\"\"\n    # TODO\n    pass\n\ndef mel_to_hz(m):\n    # TODO: ham nguoc cua hz_to_mel\n    pass\n\ndef mel_filterbank(sr=16000, n_fft=400, n_mels=20, fmin=0.0, fmax=None):\n    \"\"\"Tra ma tran (n_mels, n_fft//2+1) gom cac bo loc tam giac.\n\n    Cac buoc: chia deu n_mels+2 diem tren thang Mel giua fmin va fmax, doi ve Hz,\n    quy ve chi so bin FFT, roi dung tam giac len/xuong giua ba diem lien tiep.\n    Moi he so phai khong am.\n    \"\"\"\n    # TODO\n    pass\n\ndef mfcc(log_mel, n_mfcc=13):\n    \"\"\"DCT-II truc giao theo truc Mel, tra shape (n_frames, n_mfcc).\"\"\"\n    # TODO\n    pass",
    tests: "frames = frame_signal(np.arange(7), 4, 2)\nassert frames.shape == (3, 4) and frames[-1].tolist() == [4, 5, 6, 0]\n\nS = stft_magnitude(wave)\nassert S.ndim == 2 and S.shape[1] == 201 and np.all(S >= 0)\n\nassert abs(hz_to_mel(0.0)) < 1e-9\nassert abs(mel_to_hz(hz_to_mel(440.0)) - 440.0) < 1e-6, 'hz_to_mel va mel_to_hz khong nghich dao nhau'\n\nfb = mel_filterbank(sr=16000, n_fft=400, n_mels=20)\nassert fb.shape == (20, 201), 'filterbank sai shape'\nassert np.all(fb >= 0), 'he so filterbank phai khong am'\nassert np.all(fb.sum(axis=1) > 0), 'co bo loc rong hoan toan'\n\nmel_spec = S @ fb.T\nlog_mel = np.log(mel_spec + 1e-10)\nC = mfcc(log_mel, n_mfcc=13)\nassert C.shape == (S.shape[0], 13), 'MFCC sai shape'\n\n# DCT cua tin hieu hang: chi he so bac 0 khac 0.\nflat = np.ones((1, 20))\nc0 = mfcc(flat, n_mfcc=5)\nassert abs(c0[0, 0]) > 1e-6 and np.allclose(c0[0, 1:], 0, atol=1e-8), 'DCT chua dung'\nprint('OK Framing, STFT, Mel filterbank va MFCC deu dat', C.shape)",
    deep: "Tìm bin gần 440 Hz và 880 Hz. Thay frame_length 256/1024, giải thích đánh đổi. Nếu cài librosa, so sánh output nhưng không thay phần tự cài.",
  },
  {
    file: "07_mock_voai_end_to_end.ipynb",
    title: "Mock VOAI: từ đề lạ đến submission tái lập",
    duration: "Chia 6 phiên × 60 phút",
    outcomes: ["Đọc metric và dựng baseline trong 30 phút", "Thiết kế split chống leakage", "Lưu prediction đúng format và tái lập bằng seed"],
    concept: "Trong đề thi, baseline sớm cho vòng lặp nhanh. Thứ tự an toàn: hiểu metric → kiểm tra dữ liệu → split → baseline → error analysis → một thay đổi mỗi lần → xác nhận validation → đóng gói submission.",
    setup: "import numpy as np\nfrom sklearn.datasets import make_classification\nX,y=make_classification(n_samples=900,n_features=24,n_informative=8,weights=[.72,.28],flip_y=.04,random_state=42)\nprint(X.shape, np.bincount(y))",
    task: "# PHIEN 1: data audit (phan bo lop, gia tri thieu, trung lap) va chon metric\n# PHIEN 2: split co stratify thanh train/valid/test; KHONG duoc chong chi so\n# PHIEN 3: baseline don gian, phai vuot muc doan lop da so\n# PHIEN 4: error analysis va dung MOT cai tien\n# PHIEN 5: ablation + xac nhan tai lap bang seed\n# PHIEN 6: xuat submission.csv va bao cao 1 trang\n\nSEED = 42          # TODO: dung SEED nay o moi cho co ngau nhien\ntrain_idx = None   # TODO: mang chi so\nvalid_idx = None   # TODO: mang chi so, khong giao voi train\ntest_idx = None    # TODO: mang chi so, giu kin toi phien cuoi\nmodel = None       # TODO: mot estimator da fit, co .fit/.predict\nvalidation_score = None  # TODO: F1 tren valid_idx, tu tinh lai duoc",
    tests: "# Audit checkpoint: mot placeholder rong (khong co fit/predict) KHONG duoc di qua.\nassert model is not None, 'Can mot mo hinh da fit'\nassert hasattr(model, 'fit') and hasattr(model, 'predict'), 'model phai co interface fit/predict'\nassert callable(model.predict), 'model.predict phai goi duoc'\n\nfor _name in ('train_idx', 'valid_idx', 'test_idx', 'SEED'):\n    assert globals().get(_name) is not None, 'thieu ' + _name\n\ntrain_idx = np.asarray(train_idx); valid_idx = np.asarray(valid_idx); test_idx = np.asarray(test_idx)\nassert len(set(train_idx) & set(valid_idx)) == 0, 'train va validation trung chi so - leakage'\nassert len(set(train_idx) & set(test_idx)) == 0, 'train va mock-test trung chi so - leakage'\nassert len(set(valid_idx) & set(test_idx)) == 0, 'validation va mock-test trung chi so - leakage'\nassert len(train_idx) + len(valid_idx) + len(test_idx) == len(y), 'split khong phu het du lieu'\n\npred_valid = np.asarray(model.predict(X[valid_idx]))\nassert pred_valid.shape[0] == len(valid_idx), 'predict tra sai so luong'\n\nfrom sklearn.metrics import f1_score\nmeasured = f1_score(y[valid_idx], pred_valid)\nassert 0 <= validation_score <= 1\nassert abs(measured - validation_score) < 1e-6, 'validation_score khong khop metric tinh lai'\n\nmajority = np.full(len(valid_idx), np.bincount(y[train_idx]).argmax())\nassert measured > f1_score(y[valid_idx], majority), 'chua vuot baseline doan lop da so'\nassert np.array_equal(pred_valid, np.asarray(model.predict(X[valid_idx]))), 'predict khong tat dinh'\n\nimport os\nassert os.path.exists('submission.csv'), 'thieu artifact submission.csv'\nprint('OK Audit dat - F1 validation', round(measured, 4), 'seed', SEED)",
    deep: "Lặp mock với ảnh, văn bản hoặc audio từ kho IOAI chính thức. Không reuse test để tuning. Nhật ký phải ghi thử nghiệm, seed, metric và quyết định giữ/bỏ.",
  },
];

const outputDir = join(process.cwd(), "notebooks");
mkdirSync(outputDir, { recursive: true });

for (const moduleSpec of modules) {
  const notebook = {
    cells: withCellIds(moduleSpec.file, [
      md(`# ${moduleSpec.title}\n\n**Thời lượng:** ${moduleSpec.duration}  \n**Chế độ:** SOLO-90 — không dùng AI sinh code hoặc pseudocode.\n\nNotebook này là bài thực hành có chủ đích, không phải lời giải mẫu.`),
      md(`## Mục tiêu\n\n${moduleSpec.outcomes.map((item) => `- ${item}`).join("\n")}`),
      md(`## Trực giác cốt lõi\n\n${moduleSpec.concept}\n\nTrước khi chạy cell tiếp theo, hãy viết một dự đoán vào sổ học.`),
      code(moduleSpec.setup),
      md("## Tự cài đặt\n\nKhông mở đáp án. Đầu tiên hãy ghi input/output, shape và edge cases; sau đó mới viết code."),
      code(moduleSpec.task),
      md("## Visible tests\n\nCác test dưới đây chỉ kiểm tra interface và trường hợp cơ bản. Notebook không có hidden test phía máy chủ; sau khi test đạt, hãy tự viết thêm edge case và lưu evidence vào bản sao của bạn."),
      code(moduleSpec.tests),
      md(`## Deep 60\n\n${moduleSpec.deep}`),
      md("## Exit ticket\n\n1. Tôi có thể giải thích thuật toán mà không nhìn code không?  \n2. Edge case nào làm bản đầu tiên sai?  \n3. Độ phức tạp thời gian/bộ nhớ là gì?  \n4. Tôi sẽ ôn lại điều gì vào ngày +1, +7 và +21?"),
    ]),
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
