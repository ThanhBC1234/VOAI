export type NotebookEntry = {
  file: string;
  title: string;
  domain: string;
  duration: string;
  purpose: string;
};

export const NOTEBOOKS: NotebookEntry[] = [
  {
    file: "00_khoi_dong_va_diagnostic.ipynb",
    title: "Khởi động và chẩn đoán đầu vào",
    domain: "Foundation",
    duration: "30–45 phút",
    purpose: "Kiểm tra Python, NumPy, tư duy shape và cách ghi evidence trước khi vào lộ trình.",
  },
  {
    file: "01_numpy_linear_regression.ipynb",
    title: "NumPy và Linear Regression từ đầu",
    domain: "ML cơ bản",
    duration: "45–60 phút",
    purpose: "Tự cài forward, loss và gradient descent mà không gọi mô hình có sẵn.",
  },
  {
    file: "02_classical_ml_pipeline.ipynb",
    title: "Pipeline Machine Learning cổ điển",
    domain: "Machine Learning",
    duration: "45–60 phút",
    purpose: "Tách dữ liệu, huấn luyện, đo metric và phát hiện leakage bằng một pipeline tái lập được.",
  },
  {
    file: "03_mlp_backprop_pytorch.ipynb",
    title: "MLP và backpropagation",
    domain: "Deep Learning",
    duration: "45–60 phút",
    purpose: "Đối chiếu đạo hàm tự tính với autograd rồi hoàn thiện training loop PyTorch nhỏ.",
  },
  {
    file: "04_computer_vision_cnn.ipynb",
    title: "Computer Vision và CNN",
    domain: "Computer Vision",
    duration: "45–60 phút",
    purpose: "Hiểu convolution theo từng cửa sổ trước khi dùng lớp Conv2d trong mô hình.",
  },
  {
    file: "05_nlp_attention.ipynb",
    title: "NLP và attention",
    domain: "Natural Language Processing",
    duration: "45–60 phút",
    purpose: "Tự tính scaled dot-product attention, mask và kiểm tra tổng trọng số.",
  },
  {
    file: "06_audio_stft_mel.ipynb",
    title: "Audio, STFT và Mel",
    domain: "Audio AI",
    duration: "45–60 phút",
    purpose: "Đi từ waveform sang phổ thời gian–tần số và giải thích các tham số biến đổi.",
  },
  {
    file: "07_mock_voai_end_to_end.ipynb",
    title: "Mock VOAI end-to-end",
    domain: "Thi đấu",
    duration: "6 × 60 phút",
    purpose: "Ghép đọc đề, baseline, thí nghiệm, metric và báo cáo ngắn thành một lượt thi mô phỏng.",
  },
];
