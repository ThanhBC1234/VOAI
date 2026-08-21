import type { LessonPracticeMap } from "./types";

export const foundationsMachineLearningPractice: LessonPracticeMap = {
  "foundation-python": {
    lessonId: "foundation-python",
    scenario: {
      title: "Chia dữ liệu khách hàng mà lần chạy nào cũng kiểm chứng được",
      context:
        "Một đội phân tích có 8 hồ sơ khách hàng mẫu để thử pipeline dự đoán rời bỏ. Nếu mỗi thành viên nhận một cách chia train/validation/test khác nhau, họ không thể biết chênh lệch điểm số đến từ mô hình hay từ dữ liệu.",
      goal:
        "Tạo ba tập rời nhau bằng một RNG cục bộ, giữ nguyên dữ liệu đầu vào và tái tạo chính xác phép chia chỉ từ seed.",
    },
    inputs: [
      {
        label: "Chỉ số hồ sơ",
        format: "python",
        value: "[0, 1, 2, 3, 4, 5, 6, 7]",
      },
      {
        label: "Tỉ lệ",
        format: "text",
        value: "train = 50% · validation = 25% · test = 25%",
      },
    ],
    python: {
      title: "Bộ chia chỉ số tất định — không dùng sklearn",
      filename: "deterministic_split.py",
      codeTemplate: `from random import Random

def split_indices(n, train_ratio, val_ratio, seed):
    if n < 0:
        raise ValueError("n phải không âm")
    if not (0 <= train_ratio <= 1 and 0 <= val_ratio <= 1):
        raise ValueError("tỉ lệ phải nằm trong [0, 1]")
    if train_ratio + val_ratio > 1:
        raise ValueError("tổng train + validation không được vượt 1")

    order = list(range(n))
    Random(seed).shuffle(order)  # Không làm đổi random toàn cục
    n_train = int(n * train_ratio)
    n_val = int(n * val_ratio)

    train = order[:n_train]
    val = order[n_train:n_train + n_val]
    test = order[n_train + n_val:]
    assert set(train).isdisjoint(val)
    assert set(train).isdisjoint(test)
    assert set(val).isdisjoint(test)
    assert sorted(train + val + test) == list(range(n))
    return train, val, test

train, val, test = split_indices(8, 0.5, 0.25, {{seed}})
print(f"train={train}")
print(f"validation={val}")
print(f"test={test}")`,
    },
    explanation: [
      {
        title: "Một nguồn xáo trộn duy nhất",
        text: "Ta chỉ trộn mảng chỉ số rồi dùng cùng các chỉ số cho cả đặc trưng và nhãn. Vì vậy cặp X[i]–y[i] không bao giờ bị lệch.",
      },
      {
        title: "RNG cục bộ thay cho trạng thái toàn cục",
        text: "Random(seed) tạo một bộ sinh riêng trong hàm. Code khác gọi random trước đó không thể âm thầm thay đổi phép chia.",
      },
      {
        title: "Bất biến được kiểm tra ngay",
        text: "Ba assertion xác nhận các tập không giao nhau; assertion cuối xác nhận không làm mất hoặc lặp hồ sơ nào.",
      },
      {
        title: "Quy tắc làm tròn phải rõ",
        text: "int lấy phần nguyên cho train và validation; toàn bộ phần dư đi vào test. Cùng dữ liệu, tỉ lệ và seed luôn cho cùng output.",
      },
    ],
    experiment: {
      question: "Đổi seed làm thay đổi điều gì, và điều gì bắt buộc phải giữ nguyên?",
      parameterLabels: { seed: "Seed xáo trộn" },
      defaultVariantId: "seed-42",
      variants: [
        {
          id: "seed-7",
          label: "Seed 7",
          parameters: { seed: 7 },
          expectedOutput: "train=[6, 7, 2, 4]\nvalidation=[0, 3]\ntest=[1, 5]",
          observation:
            "Thứ tự hồ sơ đổi, nhưng kích thước 4–2–2, tính rời nhau và độ phủ vẫn giữ nguyên.",
          illustration: {
            kind: "sequence",
            layout: "pipeline",
            title: "Dòng chảy dữ liệu với seed 7",
            caption: "Mỗi hồ sơ xuất hiện đúng một lần sau khi chia.",
            items: [
              { label: "Dữ liệu gốc", value: "0 1 2 3 4 5 6 7", detail: "8 hồ sơ", tone: "base" },
              { label: "Train", value: "6 7 2 4", detail: "4 hồ sơ", tone: "good" },
              { label: "Validation", value: "0 3", detail: "2 hồ sơ", tone: "accent" },
              { label: "Test", value: "1 5", detail: "2 hồ sơ", tone: "warn" },
            ],
          },
        },
        {
          id: "seed-42",
          label: "Seed 42",
          parameters: { seed: 42 },
          expectedOutput: "train=[3, 4, 6, 7]\nvalidation=[2, 5]\ntest=[0, 1]",
          observation:
            "Seed 42 tạo một phép chia khác seed 7, nhưng chạy lại bao nhiêu lần cũng trả đúng ba danh sách này.",
          illustration: {
            kind: "sequence",
            layout: "pipeline",
            title: "Dòng chảy dữ liệu với seed 42",
            caption: "Seed là một phần của cấu hình thí nghiệm, không phải chi tiết phụ.",
            items: [
              { label: "Dữ liệu gốc", value: "0 1 2 3 4 5 6 7", detail: "8 hồ sơ", tone: "base" },
              { label: "Train", value: "3 4 6 7", detail: "4 hồ sơ", tone: "good" },
              { label: "Validation", value: "2 5", detail: "2 hồ sơ", tone: "accent" },
              { label: "Test", value: "0 1", detail: "2 hồ sơ", tone: "warn" },
            ],
          },
        },
        {
          id: "seed-99",
          label: "Seed 99",
          parameters: { seed: 99 },
          expectedOutput: "train=[7, 2, 0, 5]\nvalidation=[4, 1]\ntest=[3, 6]",
          observation:
            "Dữ liệu nào đi vào từng tập thay đổi; các bất biến của phép chia vẫn không đổi.",
          illustration: {
            kind: "sequence",
            layout: "pipeline",
            title: "Dòng chảy dữ liệu với seed 99",
            caption: "Đổi seed là một ablation dữ liệu; phải ghi seed cạnh kết quả.",
            items: [
              { label: "Dữ liệu gốc", value: "0 1 2 3 4 5 6 7", detail: "8 hồ sơ", tone: "base" },
              { label: "Train", value: "7 2 0 5", detail: "4 hồ sơ", tone: "good" },
              { label: "Validation", value: "4 1", detail: "2 hồ sơ", tone: "accent" },
              { label: "Test", value: "3 6", detail: "2 hồ sơ", tone: "warn" },
            ],
          },
        },
      ],
    },
    transferQuestion:
      "Nếu dữ liệu có 100 khách nhưng chỉ 2 khách thuộc lớp dương, bộ chia ngẫu nhiên trên còn thiếu cơ chế gì để ba tập vẫn đại diện cho nhãn?",
  },
  "foundation-numpy-tensors": {
    lessonId: "foundation-numpy-tensors",
    scenario: {
      title: "Chuẩn hóa một batch ảnh camera theo từng kênh màu",
      context:
        "Camera kiểm tra sản phẩm trả về hai ảnh nhỏ có ba kênh RGB. Mỗi kênh dùng đơn vị và độ phân tán khác nhau, nên trừ một scalar chung sẽ làm sai ý nghĩa màu.",
      goal:
        "Mô phỏng broadcasting bằng Python thuần và quan sát cùng một tensor được chuẩn hóa khác nhau khi chọn kênh R, G hoặc B.",
    },
    inputs: [
      { label: "Batch 2 ảnh × 2 pixel × RGB", format: "python", value: "[[[12, 20, 30], [18, 26, 42]], [[10, 22, 34], [20, 28, 38]]]" },
      { label: "Mean theo kênh", format: "python", value: "[15, 24, 36]" },
      { label: "Scale theo kênh", format: "python", value: "[5, 4, 6]" },
    ],
    python: {
      title: "Broadcast mean và scale theo một trục",
      filename: "channel_broadcast.py",
      codeTemplate: `pixels = [
    [[12, 20, 30], [18, 26, 42]],
    [[10, 22, 34], [20, 28, 38]],
]
means = [15, 24, 36]
scales = [5, 4, 6]
channel = {{channel}}
names = ["R", "G", "B"]

normalized = [
    [round((pixel[channel] - means[channel]) / scales[channel], 2) for pixel in image]
    for image in pixels
]
print(f"channel={names[channel]}")
print("shape=2x2x3")
print(f"normalized={normalized}")`,
    },
    explanation: [
      { title: "Shape quyết định ý nghĩa", text: "Ba trục lần lượt là ảnh, pixel và kênh. channel chọn trục cuối chứ không chọn một ảnh." },
      { title: "Broadcast theo kênh", text: "Mỗi giá trị chỉ dùng mean và scale của đúng kênh màu tương ứng." },
      { title: "Không sửa tensor gốc", text: "List comprehension tạo kết quả mới, nên input còn nguyên để đối chiếu hoặc dùng lại." },
      { title: "Kiểm tra nhanh", text: "Giá trị bằng mean phải về 0; lệch đúng một scale phải về ±1." },
    ],
    experiment: {
      question: "Cùng một batch, chọn trục kênh khác làm các giá trị chuẩn hóa thay đổi thế nào?",
      parameterLabels: { channel: "Chỉ số kênh RGB" },
      defaultVariantId: "green-channel",
      variants: [
        {
          id: "red-channel", label: "Kênh R", parameters: { channel: 0 },
          expectedOutput: "channel=R\nshape=2x2x3\nnormalized=[[-0.6, 0.6], [-1.0, 1.0]]",
          observation: "Hai ảnh đều trải quanh mean 15; pixel đỏ thấp nhất và cao nhất lần lượt về -1 và 1.",
          illustration: { kind: "matrix", title: "Kênh R sau chuẩn hóa", caption: "Hàng là ảnh, cột là pixel.", rows: ["Ảnh 1", "Ảnh 2"], columns: ["Pixel 1", "Pixel 2"], values: [[-0.6, 0.6], [-1, 1]], scale: "diverging" },
        },
        {
          id: "green-channel", label: "Kênh G", parameters: { channel: 1 },
          expectedOutput: "channel=G\nshape=2x2x3\nnormalized=[[-1.0, 0.5], [-0.5, 1.0]]",
          observation: "Scale của G là 4, vì vậy chênh 2 đơn vị chỉ tương ứng 0.5 độ lệch chuẩn.",
          illustration: { kind: "matrix", title: "Kênh G sau chuẩn hóa", caption: "Khoảng giá trị vẫn được neo quanh 0.", rows: ["Ảnh 1", "Ảnh 2"], columns: ["Pixel 1", "Pixel 2"], values: [[-1, 0.5], [-0.5, 1]], scale: "diverging" },
        },
        {
          id: "blue-channel", label: "Kênh B", parameters: { channel: 2 },
          expectedOutput: "channel=B\nshape=2x2x3\nnormalized=[[-1.0, 1.0], [-0.33, 0.33]]",
          observation: "Hai pixel ảnh 2 chỉ lệch mean 2 đơn vị nên có độ lớn 0.33 thay vì 1.",
          illustration: { kind: "matrix", title: "Kênh B sau chuẩn hóa", caption: "Scale 6 làm sai khác nhỏ bớt nổi bật.", rows: ["Ảnh 1", "Ảnh 2"], columns: ["Pixel 1", "Pixel 2"], values: [[-1, 1], [-0.33, 0.33]], scale: "diverging" },
        },
      ],
    },
    transferQuestion: "Nếu tensor đổi sang layout channels-first [batch, channel, pixel], vòng lặp và trục broadcasting phải đổi ra sao?",
  },
  "foundation-math-linear-algebra": {
    lessonId: "foundation-math-linear-algebra",
    scenario: {
      title: "Xếp hạng sản phẩm bằng tích vô hướng embedding",
      context:
        "Một cửa hàng mã hóa sở thích người dùng và ba sản phẩm trong cùng không gian ba chiều: học tập, công nghệ và vận động.",
      goal:
        "Tính điểm tương đồng bằng tích vô hướng và thấy việc cắt bớt chiều có thể làm đổi khoảng cách giữa các lựa chọn.",
    },
    inputs: [
      { label: "Vector người dùng", format: "python", value: "[0.8, 0.4, 0.2]" },
      { label: "Vector sản phẩm", format: "python", value: "Sách=[0.9,0.1,0.0], Tai nghe=[0.2,0.9,0.4], Bình nước=[0.5,0.3,0.8]" },
    ],
    python: {
      title: "Recommendation score theo số chiều giữ lại",
      filename: "dot_product_ranking.py",
      codeTemplate: `user = [0.8, 0.4, 0.2]
products = {
    "Sách": [0.9, 0.1, 0.0],
    "Tai nghe": [0.2, 0.9, 0.4],
    "Bình nước": [0.5, 0.3, 0.8],
}
dimensions = {{dimensions}}

scores = {
    name: sum(a * b for a, b in zip(user[:dimensions], vector[:dimensions]))
    for name, vector in products.items()
}
ranking = sorted(scores, key=lambda name: (-scores[name], name))
print(f"dimensions={dimensions}")
print("ranking=" + " > ".join(ranking))
print("scores=" + ", ".join(f"{name}:{scores[name]:.2f}" for name in ranking))`,
    },
    explanation: [
      { title: "Cùng hệ tọa độ", text: "Tích vô hướng chỉ có ý nghĩa khi vector người dùng và sản phẩm dùng cùng thứ tự chiều." },
      { title: "Nhân rồi cộng", text: "Mỗi chiều đóng góp user[i] × product[i]; tổng lớn hơn nghĩa là khớp hơn trong ví dụ này." },
      { title: "Cắt chiều là mất thông tin", text: "dimensions mô phỏng phép nén: chiều bị cắt không còn tác động tới thứ hạng." },
      { title: "Tie-break tất định", text: "Khi hai điểm bằng nhau, tên sản phẩm được dùng để output luôn ổn định." },
    ],
    experiment: {
      question: "Giữ thêm chiều embedding nào làm hai sản phẩm đang hòa điểm tách nhau?",
      parameterLabels: { dimensions: "Số chiều giữ lại" },
      defaultVariantId: "two-dimensions",
      variants: [
        {
          id: "one-dimension", label: "Một chiều", parameters: { dimensions: 1 },
          expectedOutput: "dimensions=1\nranking=Sách > Bình nước > Tai nghe\nscores=Sách:0.72, Bình nước:0.40, Tai nghe:0.16",
          observation: "Chỉ chiều đầu được dùng nên Sách áp đảo; sở thích công nghệ và vận động bị bỏ qua.",
          illustration: { kind: "bars", title: "Điểm với một chiều", caption: "Mọi điểm chỉ đến từ tọa độ đầu.", max: 0.8, items: [{ label: "Sách", value: 0.72, tone: "good" }, { label: "Bình nước", value: 0.4, tone: "accent" }, { label: "Tai nghe", value: 0.16, tone: "base" }] },
        },
        {
          id: "two-dimensions", label: "Hai chiều", parameters: { dimensions: 2 },
          expectedOutput: "dimensions=2\nranking=Sách > Bình nước > Tai nghe\nscores=Sách:0.76, Bình nước:0.52, Tai nghe:0.52",
          observation: "Chiều công nghệ đưa Tai nghe lên ngang Bình nước; tie-break giữ output ổn định.",
          illustration: { kind: "bars", title: "Điểm với hai chiều", caption: "Hai sản phẩm cùng đạt 0.52.", max: 0.8, items: [{ label: "Sách", value: 0.76, tone: "good" }, { label: "Bình nước", value: 0.52, tone: "accent" }, { label: "Tai nghe", value: 0.52, tone: "accent" }] },
        },
        {
          id: "three-dimensions", label: "Ba chiều", parameters: { dimensions: 3 },
          expectedOutput: "dimensions=3\nranking=Sách > Bình nước > Tai nghe\nscores=Sách:0.76, Bình nước:0.68, Tai nghe:0.60",
          observation: "Chiều vận động nâng Bình nước thêm 0.16 và Tai nghe thêm 0.08, làm hết thế hòa.",
          illustration: { kind: "bars", title: "Điểm với đủ ba chiều", caption: "Chiều cuối chứa tín hiệu phân hạng bổ sung.", max: 0.8, items: [{ label: "Sách", value: 0.76, tone: "good" }, { label: "Bình nước", value: 0.68, tone: "accent" }, { label: "Tai nghe", value: 0.6, tone: "base" }] },
        },
      ],
    },
    transferQuestion: "Nếu một chiều embedding có thang đo lớn gấp 100 lần hai chiều còn lại, cần làm gì trước khi dùng tích vô hướng để xếp hạng?",
  },
  "foundation-math-calculus-probability": {
    lessonId: "foundation-math-calculus-probability",
    scenario: {
      title: "Hiệu chỉnh thời gian giao hàng bằng gradient",
      context:
        "Một đội giao hàng biết ba chuyến dài 1, 2, 3 km mất 12, 14, 16 phút. Mô hình dùng 10 phút cố định cộng với một hệ số theo quãng đường.",
      goal:
        "Cập nhật hệ số bằng đạo hàm MSE rồi chuyển dự đoán chuyến 3 km thành xác suất vượt mốc trễ 15 phút.",
    },
    inputs: [
      { label: "Quãng đường (km)", format: "python", value: "[1, 2, 3]" },
      { label: "Thời gian thực (phút)", format: "python", value: "[12, 14, 16]" },
      { label: "Mô hình", format: "text", value: "thời gian = 10 + slope × quãng đường" },
    ],
    python: {
      title: "Bốn bước gradient descent và xác suất trễ",
      filename: "delivery_gradient.py",
      codeTemplate: `from math import exp

distances = [1, 2, 3]
actual = [12, 14, 16]
slope = 0.0
learning_rate = {{learning_rate}}

for _ in range(4):
    errors = [10 + slope * x - y for x, y in zip(distances, actual)]
    gradient = 2 * sum(error * x for error, x in zip(errors, distances)) / len(distances)
    slope -= learning_rate * gradient

prediction = 10 + slope * 3
mse = sum((10 + slope * x - y) ** 2 for x, y in zip(distances, actual)) / len(distances)
late_probability = 1 / (1 + exp(-(prediction - 15)))
print(f"slope={slope:.3f}")
print(f"prediction_at_3km={prediction:.2f}")
print(f"late_probability={late_probability:.3f}")
print(f"mse={mse:.3f}")`,
    },
    explanation: [
      { title: "Sai số có hướng", text: "prediction − actual âm khi mô hình dự đoán thiếu, nên gradient kéo slope tăng lên." },
      { title: "Đạo hàm gom ba chuyến", text: "Mỗi error được nhân với quãng đường vì slope tác động mạnh hơn lên chuyến xa." },
      { title: "Learning rate điều khiển bước", text: "Bước quá nhỏ học chậm; bước phù hợp tiến nhanh tới slope thật bằng 2." },
      { title: "Xác suất là lớp diễn giải", text: "Sigmoid quanh mốc 15 biến mức vượt ngưỡng thành số trong [0,1], không thay thế việc hiệu chỉnh xác suất thực tế." },
    ],
    experiment: {
      question: "Sau đúng bốn bước, learning rate ảnh hưởng đồng thời tới loss và xác suất báo trễ ra sao?",
      parameterLabels: { learning_rate: "Learning rate" },
      defaultVariantId: "balanced-step",
      variants: [
        {
          id: "small-step", label: "Bước 0.01", parameters: { learning_rate: 0.01 },
          expectedOutput: "slope=0.648\nprediction_at_3km=11.95\nlate_probability=0.045\nmse=8.524",
          observation: "Bốn cập nhật chưa đủ: slope còn xa 2, dự đoán thấp và MSE còn lớn.",
          illustration: { kind: "plot", title: "Mô hình còn underfit", caption: "Đường dự đoán tăng quá chậm theo khoảng cách.", xLabel: "km", yLabel: "phút", connect: true, series: [{ label: "Thực tế", tone: "good", points: [{ x: 1, y: 12 }, { x: 2, y: 14 }, { x: 3, y: 16 }] }, { label: "Dự đoán", tone: "warn", points: [{ x: 1, y: 10.648 }, { x: 2, y: 11.296 }, { x: 3, y: 11.944 }] }] },
        },
        {
          id: "balanced-step", label: "Bước 0.05", parameters: { learning_rate: 0.05 },
          expectedOutput: "slope=1.838\nprediction_at_3km=15.51\nlate_probability=0.626\nmse=0.122",
          observation: "Slope đã sát 2 và dự đoán chuyến 3 km vượt mốc 15 phút với xác suất 0.626.",
          illustration: { kind: "plot", title: "Mô hình gần hội tụ", caption: "Đường dự đoán đã bám sát ba quan sát.", xLabel: "km", yLabel: "phút", connect: true, series: [{ label: "Thực tế", tone: "good", points: [{ x: 1, y: 12 }, { x: 2, y: 14 }, { x: 3, y: 16 }] }, { label: "Dự đoán", tone: "accent", points: [{ x: 1, y: 11.838 }, { x: 2, y: 13.676 }, { x: 3, y: 15.514 }] }] },
        },
        {
          id: "exact-step", label: "Bước 0.10", parameters: { learning_rate: 0.1 },
          expectedOutput: "slope=2.000\nprediction_at_3km=16.00\nlate_probability=0.731\nmse=0.000",
          observation: "Với bộ dữ liệu tuyến tính này, slope đạt đúng 2 sau bốn bước và MSE làm tròn về 0.",
          illustration: { kind: "plot", title: "Dự đoán trùng dữ liệu", caption: "Hai đường nằm đúng lên nhau tại ba điểm.", xLabel: "km", yLabel: "phút", connect: true, series: [{ label: "Thực tế", tone: "good", points: [{ x: 1, y: 12 }, { x: 2, y: 14 }, { x: 3, y: 16 }] }, { label: "Dự đoán", tone: "accent", points: [{ x: 1, y: 12 }, { x: 2, y: 14 }, { x: 3, y: 16 }] }] },
        },
      ],
    },
    transferQuestion: "Nếu chuyến 3 km bị ghi nhầm thành 60 phút, MSE và gradient sẽ phản ứng thế nào; loss nào có thể bền vững hơn?",
  },
  "foundation-pandas-visualization": {
    lessonId: "foundation-pandas-visualization",
    scenario: {
      title: "Audit cột giá trị đơn hàng trước khi lập biểu đồ",
      context:
        "Sáu đơn hàng mẫu chứa một giá trị thiếu và có thể chứa các đơn quá lớn so với phần còn lại. Vẽ ngay giá trung bình sẽ che khuất vấn đề chất lượng dữ liệu.",
      goal:
        "Đếm missing, đánh dấu outlier theo ngưỡng nghiệp vụ và tính median chỉ trên các giá trị dùng được.",
    },
    inputs: [{ label: "Giá trị đơn hàng (nghìn đồng)", format: "python", value: "[120, 150, None, 900, 130, 2500]" }],
    python: {
      title: "Báo cáo missing, outlier và median sạch",
      filename: "order_audit.py",
      codeTemplate: `from statistics import median

orders = [120, 150, None, 900, 130, 2500]
price_cap = {{price_cap}}
missing = sum(value is None for value in orders)
outliers = [value for value in orders if value is not None and value > price_cap]
usable = [value for value in orders if value is not None and value <= price_cap]

print(f"missing={missing}")
print(f"outliers={outliers}")
print(f"usable_count={len(usable)}")
print(f"median={median(usable):.1f}")`,
    },
    explanation: [
      { title: "Missing không phải số 0", text: "None được đếm riêng thay vì biến thành đơn hàng 0 đồng." },
      { title: "Ngưỡng có nguồn gốc", text: "price_cap đại diện một quy tắc nghiệp vụ cần được ghi cùng báo cáo." },
      { title: "Median chịu outlier tốt hơn", text: "Median mô tả đơn điển hình mà không bị một giá trị rất lớn kéo mạnh như mean." },
      { title: "Đếm trước khi vẽ", text: "Ba lượng missing, outlier và usable cho biết biểu đồ sau đó đang đại diện bao nhiêu dữ liệu." },
    ],
    experiment: {
      question: "Ngưỡng outlier thay đổi mẫu sạch và median như thế nào?",
      parameterLabels: { price_cap: "Ngưỡng giá tối đa" },
      defaultVariantId: "cap-1000",
      variants: [
        {
          id: "cap-500", label: "Tối đa 500", parameters: { price_cap: 500 },
          expectedOutput: "missing=1\noutliers=[900, 2500]\nusable_count=3\nmedian=130.0",
          observation: "Hai đơn lớn bị loại; median 130 dựa trên ba đơn phổ thông.",
          illustration: { kind: "bars", title: "Chất lượng với cap 500", caption: "Mỗi đơn thuộc đúng một nhóm.", max: 6, items: [{ label: "Dùng được", value: 3, tone: "good" }, { label: "Outlier", value: 2, tone: "warn" }, { label: "Missing", value: 1, tone: "base" }] },
        },
        {
          id: "cap-1000", label: "Tối đa 1.000", parameters: { price_cap: 1000 },
          expectedOutput: "missing=1\noutliers=[2500]\nusable_count=4\nmedian=140.0",
          observation: "Đơn 900 được giữ lại; median chỉ tăng nhẹ từ 130 lên 140.",
          illustration: { kind: "bars", title: "Chất lượng với cap 1.000", caption: "Chỉ đơn 2.500 còn bị gắn cờ.", max: 6, items: [{ label: "Dùng được", value: 4, tone: "good" }, { label: "Outlier", value: 1, tone: "warn" }, { label: "Missing", value: 1, tone: "base" }] },
        },
        {
          id: "cap-3000", label: "Tối đa 3.000", parameters: { price_cap: 3000 },
          expectedOutput: "missing=1\noutliers=[]\nusable_count=5\nmedian=150.0",
          observation: "Không có outlier theo quy tắc này; median 150 vẫn ít bị đơn 2.500 chi phối.",
          illustration: { kind: "bars", title: "Chất lượng với cap 3.000", caption: "Ngưỡng rộng giữ cả năm giá trị có mặt.", max: 6, items: [{ label: "Dùng được", value: 5, tone: "good" }, { label: "Outlier", value: 0, tone: "warn" }, { label: "Missing", value: 1, tone: "base" }] },
        },
      ],
    },
    transferQuestion: "Nếu đơn 2.500 là một khách sỉ hợp lệ chứ không phải lỗi, nên bổ sung cột hoặc cách phân nhóm nào trước khi đặt ngưỡng?",
  },
  "foundation-sklearn-pipeline": {
    lessonId: "foundation-sklearn-pipeline",
    scenario: {
      title: "Chuẩn hóa số lần đăng nhập mà không nhìn validation",
      context:
        "Ba khách train đăng nhập 10–14 lần, còn khách validation có 100 lần. Nếu dùng cả validation để fit scaler, thông tin tương lai làm điểm validation trông bình thường giả tạo.",
      goal:
        "So sánh không scale, fit trên train và fit sai trên toàn bộ dữ liệu để nhìn thấy leakage bằng con số.",
    },
    inputs: [
      { label: "Train", format: "python", value: "[10, 12, 14]" },
      { label: "Validation", format: "python", value: "[100]" },
    ],
    python: {
      title: "Scaler tối giản với ba phạm vi fit",
      filename: "leakage_scaler.py",
      codeTemplate: `from math import sqrt

train = [10, 12, 14]
validation = [100]
fit_scope = {{fit_scope}}

reference = [] if fit_scope == "none" else (train if fit_scope == "train" else train + validation)
mean = sum(reference) / len(reference) if reference else 0.0
scale = sqrt(sum((x - mean) ** 2 for x in reference) / len(reference)) if reference else 1.0
validation_z = (validation[0] - mean) / scale

print(f"mean={mean:.3f}")
print(f"scale={scale:.3f}")
print(f"validation_z={validation_z:.3f}")`,
    },
    explanation: [
      { title: "Fit và transform là hai pha", text: "Fit học mean/scale; transform chỉ áp dụng các số đã học." },
      { title: "Train là phạm vi hợp lệ", text: "Validation phải được xử lý như dữ liệu chưa từng thấy, nên không được tham gia tính thống kê." },
      { title: "Leakage làm đẹp số liệu", text: "Điểm 100 kéo mean và scale lên, khiến chính nó chỉ còn cách mean 1.731 scale." },
      { title: "Pipeline khóa thứ tự", text: "Trong hệ thật, scaler và mô hình phải nằm chung pipeline để mỗi fold tự fit đúng phần train." },
    ],
    experiment: {
      question: "Vì sao một điểm validation cực đoan lại trông bớt cực đoan khi bị dùng để fit scaler?",
      parameterLabels: { fit_scope: "Phạm vi fit scaler" },
      defaultVariantId: "train-only",
      variants: [
        {
          id: "no-scaling", label: "Không scale", parameters: { fit_scope: "none" },
          expectedOutput: "mean=0.000\nscale=1.000\nvalidation_z=100.000",
          observation: "Đây là giá trị thô; chưa có phép biến đổi nào được học.",
          illustration: { kind: "sequence", layout: "pipeline", title: "Bỏ qua scaler", caption: "Validation đi thẳng tới mô hình.", items: [{ label: "Train", value: "10 12 14", tone: "base" }, { label: "Không fit", value: "mean 0 · scale 1", tone: "warn" }, { label: "Validation", value: "z=100.000", tone: "accent" }] },
        },
        {
          id: "train-only", label: "Chỉ fit train", parameters: { fit_scope: "train" },
          expectedOutput: "mean=12.000\nscale=1.633\nvalidation_z=53.889",
          observation: "Giá trị 100 thực sự rất xa phân phối train; pipeline hợp lệ không che mất tín hiệu này.",
          illustration: { kind: "sequence", layout: "pipeline", title: "Pipeline đúng", caption: "Mean và scale chỉ học từ ba điểm train.", items: [{ label: "Fit train", value: "10 12 14", tone: "good" }, { label: "Scaler", value: "12.000 / 1.633", tone: "base" }, { label: "Transform validation", value: "z=53.889", tone: "accent" }] },
        },
        {
          id: "leaked-all", label: "Fit cả validation", parameters: { fit_scope: "all" },
          expectedOutput: "mean=34.000\nscale=38.131\nvalidation_z=1.731",
          observation: "Validation tự tham gia tạo mean/scale nên khoảng cách của nó bị thu nhỏ mạnh: đây là leakage.",
          illustration: { kind: "sequence", layout: "pipeline", title: "Pipeline bị rò rỉ", caption: "Điểm cần đánh giá đã đi ngược vào bước fit.", items: [{ label: "Fit train + validation", value: "10 12 14 100", tone: "warn" }, { label: "Scaler", value: "34.000 / 38.131", tone: "base" }, { label: "Validation", value: "z=1.731", tone: "warn" }] },
        },
      ],
    },
    transferQuestion: "Với one-hot encoder, loại thông tin nào từ validation cũng có thể bị rò rỉ nếu encoder được fit trước khi chia fold?",
  },
  "foundation-pytorch-autograd-device": {
    lessonId: "foundation-pytorch-autograd-device",
    scenario: {
      title: "Huấn luyện hệ số cảm biến dưới giới hạn bộ nhớ",
      context:
        "Một cảm biến có quan hệ chuẩn y = 2x. Thiết bị chỉ giữ được một số mẫu mỗi lượt, nên batch size quyết định số lần cập nhật và quỹ đạo học trong một epoch.",
      goal:
        "Tự tính gradient của MSE cho một trọng số và so sánh cùng dữ liệu khi batch size bằng 1, 2 hoặc 4.",
    },
    inputs: [
      { label: "Tín hiệu vào", format: "python", value: "[1.0, 2.0, 3.0, 4.0]" },
      { label: "Giá trị chuẩn", format: "python", value: "[2.0, 4.0, 6.0, 8.0]" },
    ],
    python: {
      title: "Vòng lặp mini-batch cho một trọng số",
      filename: "tiny_autograd_loop.py",
      codeTemplate: `xs = [1.0, 2.0, 3.0, 4.0]
ys = [2 * x for x in xs]
batch_size = {{batch_size}}
weight = 0.0
learning_rate = 0.05
updates = 0

for start in range(0, len(xs), batch_size):
    batch_x = xs[start:start + batch_size]
    batch_y = ys[start:start + batch_size]
    gradient = 2 * sum((weight * x - y) * x for x, y in zip(batch_x, batch_y)) / len(batch_x)
    weight -= learning_rate * gradient
    updates += 1

mse = sum((weight * x - y) ** 2 for x, y in zip(xs, ys)) / len(xs)
print(f"updates={updates}")
print(f"weight={weight:.3f}")
print(f"mse={mse:.3f}")`,
    },
    explanation: [
      { title: "Forward", text: "Mỗi dự đoán là weight × x; ban đầu weight bằng 0 nên mọi mẫu đều dự đoán thiếu." },
      { title: "Backward thủ công", text: "Biểu thức gradient là đạo hàm MSE theo weight, tương đương giá trị autograd sẽ tích lũy." },
      { title: "Step sau từng batch", text: "Batch nhỏ tạo nhiều lần cập nhật hơn trong một lượt đi qua dữ liệu." },
      { title: "Device không đổi toán học", text: "CPU/GPU phải cho cùng phép tính trong sai số số học; batch size chủ yếu đổi bộ nhớ và quỹ đạo tối ưu." },
    ],
    experiment: {
      question: "Vì sao cùng một epoch và learning rate nhưng batch size khác lại cho weight cuối khác nhau?",
      parameterLabels: { batch_size: "Kích thước mini-batch" },
      defaultVariantId: "batch-two",
      variants: [
        {
          id: "batch-one", label: "Batch 1", parameters: { batch_size: 1 },
          expectedOutput: "updates=4\nweight=2.065\nmse=0.031",
          observation: "Bốn cập nhật liên tiếp đưa weight hơi vượt 2 nhưng MSE đã rất nhỏ.",
          illustration: { kind: "sequence", layout: "timeline", title: "Bốn bước optimizer", caption: "Mỗi mẫu kích hoạt một backward và step.", items: [{ label: "Mẫu 1", detail: "update 1", tone: "base" }, { label: "Mẫu 2", detail: "update 2", tone: "base" }, { label: "Mẫu 3", detail: "update 3", tone: "accent" }, { label: "Mẫu 4", value: "w=2.065", detail: "update 4", tone: "good" }] },
        },
        {
          id: "batch-two", label: "Batch 2", parameters: { batch_size: 2 },
          expectedOutput: "updates=2\nweight=2.375\nmse=1.055",
          observation: "Hai gradient trung bình tạo hai bước; với learning rate cố định, weight vượt đích nhiều hơn batch 1.",
          illustration: { kind: "sequence", layout: "timeline", title: "Hai bước optimizer", caption: "Mỗi bước tổng hợp hai mẫu.", items: [{ label: "Mẫu 1–2", value: "update 1", tone: "base" }, { label: "Mẫu 3–4", value: "w=2.375", detail: "update 2", tone: "warn" }] },
        },
        {
          id: "batch-four", label: "Batch 4", parameters: { batch_size: 4 },
          expectedOutput: "updates=1\nweight=1.500\nmse=1.875",
          observation: "Full batch chỉ cập nhật một lần nên weight mới đi từ 0 tới 1.5 sau một epoch.",
          illustration: { kind: "sequence", layout: "timeline", title: "Một bước full-batch", caption: "Bốn mẫu dùng chung một gradient.", items: [{ label: "Mẫu 1–4", value: "gradient chung", tone: "base" }, { label: "Optimizer step", value: "w=1.500", tone: "accent" }] },
        },
      ],
    },
    transferQuestion: "Nếu muốn batch 1 mô phỏng batch 4 bằng gradient accumulation, cần dời thao tác cập nhật weight tới thời điểm nào?",
  },
  "ml-linear-regression": {
    lessonId: "ml-linear-regression",
    scenario: {
      title: "Ước lượng giá thuê căn hộ và đo tác động của một tin đăng bất thường",
      context:
        "Bốn căn hộ 30–90 m² có giá thuê gần tuyến tính. Tin cuối có thể bị nhập thêm một khoản bất thường, kéo đường bình phương tối thiểu lệch khỏi ba căn còn lại.",
      goal:
        "Tính slope, intercept bằng công thức đóng và quan sát dự đoán căn 60 m² khi outlier tăng.",
    },
    inputs: [
      { label: "Diện tích (m²)", format: "python", value: "[30, 50, 70, 90]" },
      { label: "Giá nền (triệu đồng)", format: "python", value: "[4, 6, 8, 10]" },
    ],
    python: {
      title: "OLS một biến không dùng thư viện ngoài",
      filename: "rent_regression.py",
      codeTemplate: `areas = [30, 50, 70, 90]
rents = [4, 6, 8, 10 + {{outlier_bonus}}]
x_mean = sum(areas) / len(areas)
y_mean = sum(rents) / len(rents)
slope = sum((x - x_mean) * (y - y_mean) for x, y in zip(areas, rents))
slope /= sum((x - x_mean) ** 2 for x in areas)
intercept = y_mean - slope * x_mean
print(f"slope={slope:.3f}")
print(f"intercept={intercept:.3f}")
print(f"rent_at_60={intercept + slope * 60:.2f}")`,
    },
    explanation: [
      { title: "Tâm hóa dữ liệu", text: "Trừ mean làm slope chỉ phụ thuộc đồng biến thiên giữa diện tích và giá." },
      { title: "Bình phương tối thiểu", text: "Slope được chọn để tổng bình phương residual nhỏ nhất trên cả bốn căn." },
      { title: "Outlier có đòn bẩy", text: "Căn 90 m² nằm xa mean diện tích nên sai số của nó tác động mạnh lên slope." },
      { title: "Dự đoán phải đi kèm phạm vi", text: "60 m² nằm trong miền quan sát; ngoại suy xa hơn 90 m² rủi ro hơn." },
    ],
    experiment: {
      question: "Một giá thuê bất thường ở đầu xa của trục x kéo đường hồi quy như thế nào?",
      parameterLabels: { outlier_bonus: "Phần giá cộng vào căn 90 m²" },
      defaultVariantId: "moderate-outlier",
      variants: [
        {
          id: "clean-line", label: "Không outlier", parameters: { outlier_bonus: 0 },
          expectedOutput: "slope=0.100\nintercept=1.000\nrent_at_60=7.00",
          observation: "Bốn điểm nằm đúng trên đường y = 1 + 0.1x.",
          illustration: { kind: "plot", title: "Dữ liệu tuyến tính sạch", caption: "Residual của cả bốn căn bằng 0.", xLabel: "m²", yLabel: "triệu", connect: true, series: [{ label: "Giá thuê", tone: "good", points: [{ x: 30, y: 4 }, { x: 50, y: 6 }, { x: 70, y: 8 }, { x: 90, y: 10 }] }] },
        },
        {
          id: "moderate-outlier", label: "Cộng 4 triệu", parameters: { outlier_bonus: 4 },
          expectedOutput: "slope=0.160\nintercept=-1.600\nrent_at_60=8.00",
          observation: "Slope tăng 60% và dự đoán 60 m² tăng từ 7 lên 8 triệu.",
          illustration: { kind: "plot", title: "Một điểm kéo đường fit", caption: "Căn 90 m² tăng lên 14 triệu.", xLabel: "m²", yLabel: "triệu", connect: true, series: [{ label: "Quan sát", tone: "warn", points: [{ x: 30, y: 4 }, { x: 50, y: 6 }, { x: 70, y: 8 }, { x: 90, y: 14 }] }, { label: "OLS", tone: "accent", points: [{ x: 30, y: 3.2 }, { x: 90, y: 12.8 }] }] },
        },
        {
          id: "large-outlier", label: "Cộng 12 triệu", parameters: { outlier_bonus: 12 },
          expectedOutput: "slope=0.280\nintercept=-6.800\nrent_at_60=10.00",
          observation: "Một điểm 22 triệu làm dự đoán căn trung tâm tăng thêm 3 triệu dù ba giá còn lại không đổi.",
          illustration: { kind: "plot", title: "Đòn bẩy outlier lớn", caption: "Đường OLS hy sinh độ khớp ba căn đầu để giảm residual căn cuối.", xLabel: "m²", yLabel: "triệu", connect: true, series: [{ label: "Quan sát", tone: "warn", points: [{ x: 30, y: 4 }, { x: 50, y: 6 }, { x: 70, y: 8 }, { x: 90, y: 22 }] }, { label: "OLS", tone: "accent", points: [{ x: 30, y: 1.6 }, { x: 90, y: 18.4 }] }] },
        },
      ],
    },
    transferQuestion: "Nếu tin 22 triệu là dữ liệu hợp lệ của căn penthouse, cần thêm feature nào thay vì đơn giản xóa điểm đó?",
  },
  "ml-logistic-regression": {
    lessonId: "ml-logistic-regression",
    scenario: {
      title: "Chọn ngưỡng cảnh báo khách hàng có nguy cơ vỡ nợ",
      context:
        "Mô hình trả bốn xác suất rủi ro; bộ phận thẩm định phải đổi xác suất thành quyết định điều tra hay bỏ qua.",
      goal:
        "Tính confusion matrix ở ba ngưỡng để thấy threshold đổi false positive và false negative, không đổi xác suất gốc.",
    },
    inputs: [
      { label: "Xác suất vỡ nợ", format: "python", value: "[0.12, 0.44, 0.58, 0.81]" },
      { label: "Nhãn thực", format: "python", value: "[0, 0, 1, 1]" },
    ],
    python: {
      title: "Từ xác suất logistic tới confusion matrix",
      filename: "risk_threshold.py",
      codeTemplate: `probabilities = [0.12, 0.44, 0.58, 0.81]
labels = [0, 0, 1, 1]
threshold = {{threshold}}
predictions = [int(p >= threshold) for p in probabilities]
tp = sum(p == 1 and y == 1 for p, y in zip(predictions, labels))
fp = sum(p == 1 and y == 0 for p, y in zip(predictions, labels))
fn = sum(p == 0 and y == 1 for p, y in zip(predictions, labels))
tn = sum(p == 0 and y == 0 for p, y in zip(predictions, labels))
print(f"predictions={predictions}")
print(f"tp={tp}, fp={fp}, fn={fn}, tn={tn}")`,
    },
    explanation: [
      { title: "Xác suất trước, quyết định sau", text: "Logistic regression tạo p; threshold thuộc chính sách sử dụng mô hình." },
      { title: "Ngưỡng thấp ưu tiên recall", text: "Nhiều hồ sơ bị cảnh báo hơn, giảm bỏ sót nhưng có thể tăng điều tra nhầm." },
      { title: "Ngưỡng cao ưu tiên precision", text: "Chỉ cảnh báo xác suất lớn, nhưng ca dương 0.58 có thể bị bỏ qua." },
      { title: "Chi phí quyết định ngưỡng", text: "Không có threshold tốt nhất nếu chưa biết chi phí FP và FN." },
    ],
    experiment: {
      question: "Khi tăng threshold từ 0.3 lên 0.7, loại lỗi nào xuất hiện và loại lỗi nào biến mất?",
      parameterLabels: { threshold: "Ngưỡng cảnh báo" },
      defaultVariantId: "threshold-050",
      variants: [
        {
          id: "threshold-030", label: "Ngưỡng 0.30", parameters: { threshold: 0.3 },
          expectedOutput: "predictions=[0, 1, 1, 1]\ntp=2, fp=1, fn=0, tn=1",
          observation: "Không bỏ sót ca dương nhưng hồ sơ 0.44 bị điều tra nhầm.",
          illustration: { kind: "matrix", title: "Confusion @ 0.30", caption: "Hàng là nhãn thực, cột là dự đoán.", rows: ["Thực 0", "Thực 1"], columns: ["Đoán 0", "Đoán 1"], values: [[1, 1], [0, 2]], scale: "sequential" },
        },
        {
          id: "threshold-050", label: "Ngưỡng 0.50", parameters: { threshold: 0.5 },
          expectedOutput: "predictions=[0, 0, 1, 1]\ntp=2, fp=0, fn=0, tn=2",
          observation: "Bốn mẫu nhỏ được tách đúng hoàn toàn ở ngưỡng 0.5.",
          illustration: { kind: "matrix", title: "Confusion @ 0.50", caption: "Chỉ đường chéo có giá trị.", rows: ["Thực 0", "Thực 1"], columns: ["Đoán 0", "Đoán 1"], values: [[2, 0], [0, 2]], scale: "sequential" },
        },
        {
          id: "threshold-070", label: "Ngưỡng 0.70", parameters: { threshold: 0.7 },
          expectedOutput: "predictions=[0, 0, 0, 1]\ntp=1, fp=0, fn=1, tn=2",
          observation: "Không điều tra nhầm nhưng bỏ sót hồ sơ dương có xác suất 0.58.",
          illustration: { kind: "matrix", title: "Confusion @ 0.70", caption: "Một false negative xuất hiện.", rows: ["Thực 0", "Thực 1"], columns: ["Đoán 0", "Đoán 1"], values: [[2, 0], [1, 1]], scale: "sequential" },
        },
      ],
    },
    transferQuestion: "Nếu bỏ sót một khoản vỡ nợ tốn gấp 8 lần điều tra nhầm, bạn sẽ tính expected cost cho từng threshold ra sao?",
  },
  "ml-l1-l2-regularization": {
    lessonId: "ml-l1-l2-regularization",
    scenario: {
      title: "Thu gọn bộ feature chấm điểm tín dụng bị trùng thông tin",
      context:
        "Ba hệ số ban đầu có độ lớn 3.0, 0.8 và 0.2. Đội phân tích muốn giảm độ nhạy nhưng cần phân biệt L1 có thể xóa feature với L2 chỉ co mềm.",
      goal:
        "Áp dụng một bước shrinkage minh họa cho L1 và L2 ở ba mức lambda.",
    },
    inputs: [{ label: "Hệ số chưa regularize", format: "python", value: "[3.0, 0.8, 0.2]" }],
    python: {
      title: "So sánh soft-threshold L1 và shrinkage L2",
      filename: "coefficient_shrinkage.py",
      codeTemplate: `weights = [3.0, 0.8, 0.2]
lambda_value = {{lambda_value}}
l1 = [max(weight - lambda_value, 0.0) for weight in weights]
l2 = [weight / (1 + lambda_value) for weight in weights]
print("l1=[" + ", ".join(f"{weight:.2f}" for weight in l1) + "]")
print("l2=[" + ", ".join(f"{weight:.2f}" for weight in l2) + "]")`,
    },
    explanation: [
      { title: "L1 có góc nhọn tại 0", text: "Soft-threshold trừ cùng lambda khỏi độ lớn và chặn tại 0, tạo sparsity." },
      { title: "L2 co theo tỉ lệ", text: "Chia cho 1 + lambda làm mọi hệ số nhỏ đi nhưng không đặt chính xác về 0 trong ví dụ." },
      { title: "Scale feature vẫn quan trọng", text: "Nếu các cột có đơn vị khác nhau, cùng một penalty không đối xử công bằng." },
      { title: "Lambda là trade-off", text: "Lambda lớn giảm variance nhưng có thể xóa tín hiệu thật và tăng bias." },
    ],
    experiment: {
      question: "Feature yếu nhất biến mất ở L1 từ mức nào, trong khi L2 xử lý nó ra sao?",
      parameterLabels: { lambda_value: "Độ mạnh regularization" },
      defaultVariantId: "medium-penalty",
      variants: [
        {
          id: "no-penalty", label: "Lambda 0", parameters: { lambda_value: 0 },
          expectedOutput: "l1=[3.00, 0.80, 0.20]\nl2=[3.00, 0.80, 0.20]",
          observation: "Không penalty nên hai phép biến đổi giữ nguyên cả ba hệ số.",
          illustration: { kind: "bars", title: "Hệ số gốc", caption: "L1 và L2 trùng nhau khi lambda bằng 0.", max: 3, items: [{ label: "w1", value: 3, tone: "accent" }, { label: "w2", value: 0.8, tone: "base" }, { label: "w3", value: 0.2, tone: "base" }] },
        },
        {
          id: "medium-penalty", label: "Lambda 0.5", parameters: { lambda_value: 0.5 },
          expectedOutput: "l1=[2.50, 0.30, 0.00]\nl2=[2.00, 0.53, 0.13]",
          observation: "L1 xóa w3; L2 vẫn giữ tín hiệu nhỏ 0.13 ở cả ba feature.",
          illustration: { kind: "bars", title: "Shrinkage vừa", caption: "So các hệ số sau penalty.", max: 2.5, items: [{ label: "L1 w1", value: 2.5, tone: "accent" }, { label: "L1 w2", value: 0.3 }, { label: "L1 w3", value: 0 }, { label: "L2 w1", value: 2, tone: "good" }, { label: "L2 w2", value: 0.53 }, { label: "L2 w3", value: 0.13 }] },
        },
        {
          id: "strong-penalty", label: "Lambda 1.5", parameters: { lambda_value: 1.5 },
          expectedOutput: "l1=[1.50, 0.00, 0.00]\nl2=[1.20, 0.32, 0.08]",
          observation: "L1 chỉ còn feature mạnh nhất; L2 vẫn phân bố trọng số nhỏ trên cả ba.",
          illustration: { kind: "bars", title: "Shrinkage mạnh", caption: "Sparsity của L1 hiện rõ.", max: 1.5, items: [{ label: "L1 w1", value: 1.5, tone: "accent" }, { label: "L1 w2", value: 0 }, { label: "L1 w3", value: 0 }, { label: "L2 w1", value: 1.2, tone: "good" }, { label: "L2 w2", value: 0.32 }, { label: "L2 w3", value: 0.08 }] },
        },
      ],
    },
    transferQuestion: "Nếu hai feature gần như bản sao nhau, vì sao L1 có thể giữ một feature bất kỳ còn L2 thường chia trọng số cho cả hai?",
  },
  "ml-knn": {
    lessonId: "ml-knn",
    scenario: {
      title: "Nhận biết trái cây chín theo màu và độ cứng",
      context:
        "Một cảm biến đo hai đặc trưng cho năm trái đã gán nhãn. Trái mới ở tọa độ (5, 6) cần được phân loại từ các mẫu gần nhất.",
      goal:
        "Tính khoảng cách Euclid, lấy k láng giềng và quan sát dự đoán đổi khi vùng bỏ phiếu rộng hơn.",
    },
    inputs: [
      { label: "Mẫu A–E", format: "python", value: "A chín(8,4), B chín(7,5), C xanh(3,8), D xanh(4,7), E chín(6,4)" },
      { label: "Trái cần đoán", format: "python", value: "(5, 6)" },
    ],
    python: {
      title: "KNN hai chiều từ đầu",
      filename: "fruit_knn.py",
      codeTemplate: `from math import sqrt

data = [
    ("A", "chín", (8, 4)), ("B", "chín", (7, 5)),
    ("C", "xanh", (3, 8)), ("D", "xanh", (4, 7)),
    ("E", "chín", (6, 4)),
]
query = (5, 6)
k = {{k}}
distance = lambda point: sqrt((point[0] - query[0]) ** 2 + (point[1] - query[1]) ** 2)
neighbors = sorted(data, key=lambda row: (distance(row[2]), row[0]))[:k]
counts = {label: sum(row[1] == label for row in neighbors) for label in ("chín", "xanh")}
prediction = max(counts, key=lambda label: (counts[label], label == "chín"))
print("neighbors=" + ", ".join(f"{row[0]}:{row[1]}:{distance(row[2]):.2f}" for row in neighbors))
print(f"prediction={prediction}")
print(f"votes=chín:{counts['chín']}, xanh:{counts['xanh']}")`,
    },
    explanation: [
      { title: "Khoảng cách cùng đơn vị", text: "Hai feature phải có scale tương đương; nếu không, feature lớn hơn sẽ chi phối Euclid." },
      { title: "Sắp xếp có tie-break", text: "ID mẫu phá hòa khoảng cách để kết quả lặp lại được." },
      { title: "k đặt độ cục bộ", text: "k nhỏ nhạy với một điểm; k lớn làm quyết định mượt hơn nhưng có thể nuốt cụm nhỏ." },
      { title: "Bỏ phiếu tạo nhãn", text: "Dự đoán là lớp xuất hiện nhiều nhất trong đúng k mẫu đã chọn." },
    ],
    experiment: {
      question: "Vì sao láng giềng gần nhất là xanh nhưng đa số ba láng giềng lại là chín?",
      parameterLabels: { k: "Số láng giềng" },
      defaultVariantId: "three-neighbors",
      variants: [
        {
          id: "one-neighbor", label: "k = 1", parameters: { k: 1 },
          expectedOutput: "neighbors=D:xanh:1.41\nprediction=xanh\nvotes=chín:0, xanh:1",
          observation: "Mẫu D gần nhất quyết định toàn bộ, nên dự đoán rất cục bộ.",
          illustration: { kind: "sequence", layout: "cards", title: "Một láng giềng", caption: "Chỉ D được quyền bỏ phiếu.", items: [{ label: "D", value: "xanh", detail: "d=1.41", tone: "good" }] },
        },
        {
          id: "three-neighbors", label: "k = 3", parameters: { k: 3 },
          expectedOutput: "neighbors=D:xanh:1.41, B:chín:2.24, E:chín:2.24\nprediction=chín\nvotes=chín:2, xanh:1",
          observation: "Hai mẫu chín B và E lật quyết định dù D vẫn là điểm gần nhất.",
          illustration: { kind: "sequence", layout: "cards", title: "Ba láng giềng", caption: "Đa số 2–1 thuộc lớp chín.", items: [{ label: "D", value: "xanh", detail: "1.41", tone: "accent" }, { label: "B", value: "chín", detail: "2.24", tone: "good" }, { label: "E", value: "chín", detail: "2.24", tone: "good" }] },
        },
        {
          id: "five-neighbors", label: "k = 5", parameters: { k: 5 },
          expectedOutput: "neighbors=D:xanh:1.41, B:chín:2.24, E:chín:2.24, C:xanh:2.83, A:chín:3.61\nprediction=chín\nvotes=chín:3, xanh:2",
          observation: "Dùng toàn bộ tập vẫn dự đoán chín, nhưng quyết định ít phản ánh vùng gần query hơn.",
          illustration: { kind: "bars", title: "Phiếu của năm mẫu", caption: "Khoảng cách bị bỏ qua sau bước chọn neighbor.", max: 5, items: [{ label: "Chín", value: 3, tone: "good" }, { label: "Xanh", value: 2, tone: "accent" }] },
        },
      ],
    },
    transferQuestion: "Nếu độ cứng đo theo thang 0–1000 còn màu theo 0–10, cần biến đổi dữ liệu thế nào trước khi tính khoảng cách?",
  },
  "ml-decision-tree": {
    lessonId: "ml-decision-tree",
    scenario: {
      title: "Mô phỏng cây duyệt khoản vay theo độ sâu",
      context:
        "Bốn hồ sơ A–D được kiểm tra lần lượt bằng thu nhập, tỉ lệ nợ và lịch sử tín dụng. Cắt cây sớm làm quyết định đơn giản nhưng bỏ qua điều kiện sau.",
      goal:
        "Áp dụng lần lượt tối đa ba rule và đếm hồ sơ còn được phê duyệt ở mỗi độ sâu.",
    },
    inputs: [{ label: "Hồ sơ", format: "csv", value: "id,income,debt_ratio,history_years\nA,40,0.30,3\nB,25,0.20,5\nC,50,0.60,4\nD,35,0.40,1" }],
    python: {
      title: "Cây rule ba tầng có thể pruning",
      filename: "loan_tree_depth.py",
      codeTemplate: `applicants = [
    ("A", 40, 0.30, 3), ("B", 25, 0.20, 5),
    ("C", 50, 0.60, 4), ("D", 35, 0.40, 1),
]
rules = [
    lambda row: row[1] >= 30,
    lambda row: row[2] <= 0.45,
    lambda row: row[3] >= 2,
]
max_depth = {{max_depth}}
approved = [row[0] for row in applicants if all(rule(row) for rule in rules[:max_depth])]
print(f"approved={approved}")
print(f"rejected={len(applicants) - len(approved)}")`,
    },
    explanation: [
      { title: "Mỗi tầng thêm một điều kiện", text: "Hồ sơ phải đi qua tất cả rule từ gốc tới độ sâu đang dùng." },
      { title: "Cây nông có bias lớn", text: "Depth 1 chỉ nhìn thu nhập, nên C và D vẫn được duyệt dù có rủi ro khác." },
      { title: "Cây sâu phân biệt kỹ hơn", text: "Depth 3 dùng cả lịch sử, tách D khỏi A." },
      { title: "Pruning là trade-off", text: "Trong dữ liệu thật, độ sâu phải chọn bằng validation thay vì mặc định càng sâu càng tốt." },
    ],
    experiment: {
      question: "Hồ sơ nào bị loại thêm tại mỗi tầng và rule nào gây ra quyết định đó?",
      parameterLabels: { max_depth: "Độ sâu cây" },
      defaultVariantId: "depth-two",
      variants: [
        {
          id: "depth-one", label: "Depth 1", parameters: { max_depth: 1 },
          expectedOutput: "approved=['A', 'C', 'D']\nrejected=1",
          observation: "Chỉ B bị loại vì thu nhập dưới 30; nợ và lịch sử chưa được xét.",
          illustration: { kind: "sequence", layout: "cards", title: "Chỉ nút thu nhập", caption: "Ba hồ sơ đi qua nhánh đạt.", items: [{ label: "income ≥ 30", value: "A C D", tone: "good" }, { label: "income < 30", value: "B", tone: "warn" }] },
        },
        {
          id: "depth-two", label: "Depth 2", parameters: { max_depth: 2 },
          expectedOutput: "approved=['A', 'D']\nrejected=2",
          observation: "C bị loại ở rule debt_ratio vì 0.60 lớn hơn 0.45.",
          illustration: { kind: "sequence", layout: "pipeline", title: "Hai tầng kiểm tra", caption: "C rời pipeline tại tầng nợ.", items: [{ label: "Thu nhập", value: "A C D", tone: "base" }, { label: "Nợ ≤ 0.45", value: "A D", tone: "accent" }, { label: "Duyệt", value: "A D", tone: "good" }] },
        },
        {
          id: "depth-three", label: "Depth 3", parameters: { max_depth: 3 },
          expectedOutput: "approved=['A']\nrejected=3",
          observation: "D bị loại vì lịch sử chỉ một năm; chỉ A vượt đủ ba rule.",
          illustration: { kind: "sequence", layout: "pipeline", title: "Đủ ba tầng", caption: "Mỗi tầng thu hẹp tập hồ sơ.", items: [{ label: "Thu nhập", value: "A C D" }, { label: "Tỉ lệ nợ", value: "A D" }, { label: "Lịch sử ≥ 2", value: "A", tone: "good" }] },
        },
      ],
    },
    transferQuestion: "Nếu rule thu nhập làm từ chối không công bằng một nhóm khách, cần audit thêm metric và feature nhạy cảm nào trước khi triển khai?",
  },
  "ml-bagging-random-forest": {
    lessonId: "ml-bagging-random-forest",
    scenario: {
      title: "Gộp nhiều cây để cảnh báo máy công nghiệp sắp hỏng",
      context:
        "Năm cây được huấn luyện trên các bootstrap sample khác nhau và bỏ phiếu cho ba máy M1–M3. Một cây đơn có thể phản ứng với nhiễu cảm biến.",
      goal:
        "Lấy majority vote của 1, 3 hoặc 5 cây và xem dự đoán máy M3 ổn định ra sao.",
    },
    inputs: [{ label: "Phiếu lỗi của năm cây", format: "python", value: "M1=[1,1,0,1,1], M2=[0,1,0,0,1], M3=[1,0,1,0,0]" }],
    python: {
      title: "Majority vote theo số cây",
      filename: "forest_votes.py",
      codeTemplate: `votes = {
    "M1": [1, 1, 0, 1, 1],
    "M2": [0, 1, 0, 0, 1],
    "M3": [1, 0, 1, 0, 0],
}
n_trees = {{n_trees}}
totals = {machine: sum(tree_votes[:n_trees]) for machine, tree_votes in votes.items()}
risk = [machine for machine, total in totals.items() if total > n_trees / 2]
print(f"risk={risk}")
print("votes=" + ", ".join(f"{machine}:{totals[machine]}/{n_trees}" for machine in votes))`,
    },
    explanation: [
      { title: "Mỗi cây là một phiếu", text: "Bagging tạo khác biệt giữa cây bằng dữ liệu bootstrap và feature subset." },
      { title: "Majority giảm variance", text: "Một phiếu bất thường ít có khả năng quyết định khi ensemble lớn hơn." },
      { title: "Cần cây đa dạng", text: "Nếu mọi cây giống hệt nhau, thêm cây không đem lại lợi ích." },
      { title: "Không bảo đảm đơn điệu", text: "Thêm cây có thể đổi một dự đoán cụ thể; lợi ích được đánh giá trên tập test, không từ một mẫu." },
    ],
    experiment: {
      question: "Máy nào đổi nhãn khi ensemble tăng từ một lên năm cây, và vì sao?",
      parameterLabels: { n_trees: "Số cây bỏ phiếu" },
      defaultVariantId: "three-trees",
      variants: [
        {
          id: "one-tree", label: "Một cây", parameters: { n_trees: 1 },
          expectedOutput: "risk=['M1', 'M3']\nvotes=M1:1/1, M2:0/1, M3:1/1",
          observation: "Cây đầu cảnh báo M1 và M3; chưa có cơ chế giảm nhiễu.",
          illustration: { kind: "bars", title: "Phiếu từ cây 1", caption: "Ngưỡng đa số là trên 0.5.", max: 1, items: [{ label: "M1", value: 1, tone: "warn" }, { label: "M2", value: 0 }, { label: "M3", value: 1, tone: "warn" }] },
        },
        {
          id: "three-trees", label: "Ba cây", parameters: { n_trees: 3 },
          expectedOutput: "risk=['M1', 'M3']\nvotes=M1:2/3, M2:1/3, M3:2/3",
          observation: "M1 và M3 vẫn đạt đa số 2/3; độ tin cậy nay thể hiện bằng tỉ lệ phiếu.",
          illustration: { kind: "bars", title: "Phiếu từ ba cây", caption: "Đường quyết định nằm trên 1.5 phiếu.", max: 3, items: [{ label: "M1", value: 2, tone: "warn" }, { label: "M2", value: 1 }, { label: "M3", value: 2, tone: "warn" }] },
        },
        {
          id: "five-trees", label: "Năm cây", parameters: { n_trees: 5 },
          expectedOutput: "risk=['M1']\nvotes=M1:4/5, M2:2/5, M3:2/5",
          observation: "Hai cây bổ sung không đồng ý về M3, khiến máy này mất đa số; M1 vẫn ổn định 4/5.",
          illustration: { kind: "bars", title: "Phiếu từ năm cây", caption: "Chỉ M1 vượt ngưỡng 2.5.", max: 5, items: [{ label: "M1", value: 4, tone: "warn" }, { label: "M2", value: 2 }, { label: "M3", value: 2 }] },
        },
      ],
    },
    transferQuestion: "Nếu cả năm cây đều học từ cùng một lỗi cảm biến hệ thống, tại sao majority vote không thể sửa bias đó?",
  },
  "ml-gradient-boosting": {
    lessonId: "ml-gradient-boosting",
    scenario: {
      title: "Sửa dần sai số dự đoán thời gian giao hàng",
      context:
        "Baseline dự đoán cả ba chuyến là 20 phút. Một cây yếu học được hướng sửa [-2, 3, 6] phút từ residual nhưng đội vận hành chưa biết nên nhận bao nhiêu phần của correction.",
      goal:
        "Nhân correction với learning rate, cập nhật dự đoán và đo MAE sau một vòng boosting.",
    },
    inputs: [
      { label: "Thời gian thực", format: "python", value: "[18, 24, 30]" },
      { label: "Baseline", format: "python", value: "[20, 20, 20]" },
      { label: "Correction của cây yếu", format: "python", value: "[-2, 3, 6]" },
    ],
    python: {
      title: "Một stage gradient boosting",
      filename: "residual_boost.py",
      codeTemplate: `actual = [18, 24, 30]
baseline = [20, 20, 20]
correction = [-2, 3, 6]
learning_rate = {{learning_rate}}
predictions = [base + learning_rate * delta for base, delta in zip(baseline, correction)]
mae = sum(abs(prediction - target) for prediction, target in zip(predictions, actual)) / len(actual)
print("predictions=[" + ", ".join(f"{value:.2f}" for value in predictions) + "]")
print(f"mae={mae:.3f}")`,
    },
    explanation: [
      { title: "Baseline mở đầu", text: "Boosting không fit đích từ đầu ở mỗi cây; stage mới sửa những gì ensemble hiện tại còn sai." },
      { title: "Cây học residual gần đúng", text: "Correction không hoàn hảo: chuyến thứ ba cần +10 nhưng cây chỉ đề xuất +6." },
      { title: "Shrinkage kiểm soát bước", text: "Learning rate nhỏ nhận một phần correction để giảm nguy cơ overfit qua nhiều stage." },
      { title: "Theo dõi validation", text: "MAE train giảm ở đây không bảo đảm stage tiếp theo cải thiện dữ liệu mới." },
    ],
    experiment: {
      question: "Một stage sửa được bao nhiêu lỗi khi thay đổi learning rate?",
      parameterLabels: { learning_rate: "Learning rate của stage" },
      defaultVariantId: "half-step",
      variants: [
        {
          id: "quarter-step", label: "Nhận 25%", parameters: { learning_rate: 0.25 },
          expectedOutput: "predictions=[19.50, 20.75, 21.50]\nmae=4.417",
          observation: "Bước thận trọng chỉ dịch baseline nhẹ; chuyến 30 phút vẫn bị đoán thiếu 8.5 phút.",
          illustration: { kind: "sequence", layout: "timeline", title: "Stage với shrinkage 0.25", caption: "Correction chỉ đóng góp một phần tư.", items: [{ label: "Baseline", value: "20.00 · 20.00 · 20.00" }, { label: "× 0.25", value: "-0.50 · +0.75 · +1.50", tone: "accent" }, { label: "Mới", value: "19.50 · 20.75 · 21.50", tone: "good" }] },
        },
        {
          id: "half-step", label: "Nhận 50%", parameters: { learning_rate: 0.5 },
          expectedOutput: "predictions=[19.00, 21.50, 23.00]\nmae=3.500",
          observation: "MAE giảm thêm, nhưng mỗi dự đoán vẫn còn residual để stage sau học.",
          illustration: { kind: "sequence", layout: "timeline", title: "Stage với shrinkage 0.5", caption: "Nửa correction được cộng vào ensemble.", items: [{ label: "Baseline", value: "20.00 · 20.00 · 20.00" }, { label: "× 0.5", value: "-1.00 · +1.50 · +3.00", tone: "accent" }, { label: "Mới", value: "19.00 · 21.50 · 23.00", tone: "good" }] },
        },
        {
          id: "full-step", label: "Nhận 100%", parameters: { learning_rate: 1 },
          expectedOutput: "predictions=[18.00, 23.00, 26.00]\nmae=1.667",
          observation: "Trên ba mẫu train, nhận toàn correction cho MAE thấp nhất; qua nhiều cây nó có thể quá mạnh.",
          illustration: { kind: "sequence", layout: "timeline", title: "Stage không shrinkage", caption: "Toàn bộ correction được cộng ngay.", items: [{ label: "Baseline", value: "20.00 · 20.00 · 20.00" }, { label: "× 1", value: "-2.00 · +3.00 · +6.00", tone: "accent" }, { label: "Mới", value: "18.00 · 23.00 · 26.00", tone: "good" }] },
        },
      ],
    },
    transferQuestion: "Nếu correction của cây mới làm validation MAE tăng dù train MAE giảm, nên điều chỉnh learning rate, số cây hoặc độ sâu cây thế nào?",
  },
  "ml-svm": {
    lessonId: "ml-svm",
    scenario: {
      title: "Phân loại linh kiện bằng khoảng cách tới hai support vector",
      context:
        "Một support vector đại diện linh kiện đạt ở (4,1), một vector đại diện lỗi ở (1,4). Linh kiện mới (3,2) được so bằng RBF kernel.",
      goal:
        "Tính chênh lệch similarity với hai support vector và thấy gamma quá lớn làm cả hai ảnh hưởng gần biến mất.",
    },
    inputs: [
      { label: "Support vector", format: "python", value: "đạt=(4,1), lỗi=(1,4)" },
      { label: "Linh kiện mới", format: "python", value: "(3,2)" },
    ],
    python: {
      title: "RBF decision score từ hai support vector",
      filename: "rbf_margin.py",
      codeTemplate: `from math import exp

query = (3, 2)
support_good = (4, 1)
support_bad = (1, 4)
gamma = {{gamma}}
squared_distance = lambda a, b: sum((x - y) ** 2 for x, y in zip(a, b))
good_similarity = exp(-gamma * squared_distance(query, support_good))
bad_similarity = exp(-gamma * squared_distance(query, support_bad))
score = good_similarity - bad_similarity
print(f"score={score:.4f}")
print(f"prediction={'đạt' if score >= 0 else 'lỗi'}")
print(f"margin_strength={abs(score):.4f}")`,
    },
    explanation: [
      { title: "Kernel đo similarity", text: "RBF lớn khi hai điểm gần nhau và tiến về 0 khi khoảng cách tăng." },
      { title: "Score có dấu", text: "Đóng góp support đạt trừ đóng góp support lỗi; dấu xác định phía quyết định." },
      { title: "Gamma đặt bán kính ảnh hưởng", text: "Gamma nhỏ cho vùng ảnh hưởng rộng; gamma lớn chỉ phản ứng sát support vector." },
      { title: "Margin yếu cần cảnh báo", text: "Prediction vẫn là đạt nhưng score gần 0 cho thấy quyết định nhạy, không nên đọc như xác suất." },
    ],
    experiment: {
      question: "Tại sao gamma rất lớn vẫn cho cùng nhãn nhưng margin_strength lại gần 0?",
      parameterLabels: { gamma: "Gamma của RBF" },
      defaultVariantId: "medium-gamma",
      variants: [
        {
          id: "wide-kernel", label: "Gamma 0.1", parameters: { gamma: 0.1 },
          expectedOutput: "score=0.3694\nprediction=đạt\nmargin_strength=0.3694",
          observation: "Cả hai support vector còn ảnh hưởng, nhưng vector đạt gần hơn tạo score dương.",
          illustration: { kind: "bars", title: "Kernel rộng", caption: "Similarity với support đạt và lỗi.", max: 1, items: [{ label: "Đạt", value: 0.8187, tone: "good" }, { label: "Lỗi", value: 0.4493, tone: "warn" }] },
        },
        {
          id: "medium-gamma", label: "Gamma 0.5", parameters: { gamma: 0.5 },
          expectedOutput: "score=0.3496\nprediction=đạt\nmargin_strength=0.3496",
          observation: "Support lỗi xa bị giảm gần 0, còn support đạt vẫn giữ similarity 0.368.",
          illustration: { kind: "bars", title: "Kernel vừa", caption: "Ảnh hưởng của điểm xa giảm nhanh.", max: 1, items: [{ label: "Đạt", value: 0.3679, tone: "good" }, { label: "Lỗi", value: 0.0183, tone: "warn" }] },
        },
        {
          id: "narrow-kernel", label: "Gamma 2.0", parameters: { gamma: 2 },
          expectedOutput: "score=0.0183\nprediction=đạt\nmargin_strength=0.0183",
          observation: "Query không đủ sát support nào; score dương rất nhỏ dù nhãn chưa đổi.",
          illustration: { kind: "bars", title: "Kernel quá hẹp", caption: "Cả hai similarity gần 0.", max: 1, items: [{ label: "Đạt", value: 0.0183, tone: "accent" }, { label: "Lỗi", value: 0.0000001, tone: "base" }] },
        },
      ],
    },
    transferQuestion: "Nếu thêm một support vector lỗi rất gần query, decision score và ranh giới cục bộ sẽ thay đổi theo hướng nào?",
  },
  "ml-kmeans": {
    lessonId: "ml-kmeans",
    scenario: {
      title: "Phân khúc khách hàng theo mức chi tiêu tháng",
      context:
        "Chín khách tạo ba dải chi tiêu quanh 12, 42 và 82. Đội marketing thử số cụm khác nhau để quyết định có nên tách nhóm nhỏ.",
      goal:
        "Chạy bốn vòng assign–update từ các tâm cố định và so tâm cùng kích thước cụm khi k thay đổi.",
    },
    inputs: [{ label: "Chi tiêu (đơn vị 100 nghìn)", format: "python", value: "[10, 12, 14, 40, 42, 44, 80, 82, 84]" }],
    python: {
      title: "K-Means một chiều tất định",
      filename: "customer_kmeans.py",
      codeTemplate: `values = [10, 12, 14, 40, 42, 44, 80, 82, 84]
seed_centers = {2: [10, 80], 3: [10, 40, 80], 4: [10, 14, 40, 80]}
k = {{k}}
centers = [float(value) for value in seed_centers[k]]

for _ in range(4):
    groups = [[] for _ in centers]
    for value in values:
        index = min(range(k), key=lambda i: (abs(value - centers[i]), i))
        groups[index].append(value)
    centers = [sum(group) / len(group) if group else centers[i] for i, group in enumerate(groups)]

print("centers=[" + ", ".join(f"{center:.1f}" for center in centers) + "]")
print(f"sizes={[len(group) for group in groups]}")`,
    },
    explanation: [
      { title: "Assign", text: "Mỗi khách vào tâm gần nhất; chỉ số tâm phá hòa để output tất định." },
      { title: "Update", text: "Tâm mới là mean chi tiêu của các khách vừa được gán." },
      { title: "Khởi tạo có ảnh hưởng", text: "Ví dụ cố định seed centers để chỉ so k, nhưng hệ thật nên chạy nhiều initialization." },
      { title: "Inertia không đủ một mình", text: "k lớn luôn có thể giảm sai số trong cụm; phân khúc còn phải hữu ích về nghiệp vụ." },
    ],
    experiment: {
      question: "Khi k vượt số dải tự nhiên, nhóm chi tiêu thấp bị chia nhỏ ra sao?",
      parameterLabels: { k: "Số cụm" },
      defaultVariantId: "three-clusters",
      variants: [
        {
          id: "two-clusters", label: "k = 2", parameters: { k: 2 },
          expectedOutput: "centers=[27.0, 82.0]\nsizes=[6, 3]",
          observation: "Hai dải 10–14 và 40–44 bị gộp, tạo tâm 27 không đại diện tốt khách nào.",
          illustration: { kind: "sequence", layout: "cards", title: "Hai phân khúc", caption: "Nhóm đầu chứa sáu khách khác biệt.", items: [{ label: "Cụm 1", value: "tâm 27", detail: "6 khách", tone: "warn" }, { label: "Cụm 2", value: "tâm 82", detail: "3 khách", tone: "good" }] },
        },
        {
          id: "three-clusters", label: "k = 3", parameters: { k: 3 },
          expectedOutput: "centers=[12.0, 42.0, 82.0]\nsizes=[3, 3, 3]",
          observation: "Ba tâm khớp đúng ba dải chi tiêu cân bằng.",
          illustration: { kind: "sequence", layout: "cards", title: "Ba phân khúc tự nhiên", caption: "Mỗi dải có ba khách.", items: [{ label: "Thấp", value: "12", detail: "3 khách" }, { label: "Trung", value: "42", detail: "3 khách", tone: "accent" }, { label: "Cao", value: "82", detail: "3 khách", tone: "good" }] },
        },
        {
          id: "four-clusters", label: "k = 4", parameters: { k: 4 },
          expectedOutput: "centers=[11.0, 14.0, 42.0, 82.0]\nsizes=[2, 1, 3, 3]",
          observation: "Dải thấp bị tách thành cụm hai khách và một khách, dấu hiệu over-segmentation.",
          illustration: { kind: "sequence", layout: "cards", title: "Bốn phân khúc", caption: "Một cụm chỉ còn một khách.", items: [{ label: "Thấp A", value: "11", detail: "2 khách" }, { label: "Thấp B", value: "14", detail: "1 khách", tone: "warn" }, { label: "Trung", value: "42", detail: "3 khách" }, { label: "Cao", value: "82", detail: "3 khách", tone: "good" }] },
        },
      ],
    },
    transferQuestion: "Nếu thêm khách chi tiêu 500, nên scale, biến đổi log hay dùng thuật toán nào bền vững hơn trước outlier?",
  },
  "ml-pca": {
    lessonId: "ml-pca",
    scenario: {
      title: "Nén ba nhóm cảm biến trước khi lưu dữ liệu máy",
      context:
        "Sau khi xoay sang các principal component, ba trục độc lập giữ phương sai 9, 4 và 1. Hệ thống cần giảm số chiều nhưng vẫn giữ đủ biến thiên.",
      goal:
        "Cộng phương sai các component được giữ và tính tỉ lệ explained variance cho 1–3 chiều.",
    },
    inputs: [{ label: "Phương sai theo PC", format: "python", value: "[9, 4, 1]" }],
    python: {
      title: "Explained variance của phép chiếu PCA",
      filename: "pca_variance_budget.py",
      codeTemplate: `variances = [9, 4, 1]
n_components = {{n_components}}
kept_variance = sum(variances[:n_components])
total_variance = sum(variances)
explained = 100 * kept_variance / total_variance
print(f"kept_variance={kept_variance}")
print(f"explained={explained:.1f}%")
print(f"compressed_dimensions={n_components}")`,
    },
    explanation: [
      { title: "PC được sắp theo phương sai", text: "PC1 giữ nhiều biến thiên nhất, nên cắt từ cuối thay vì chọn tùy ý." },
      { title: "Explained variance là ngân sách", text: "Tỉ lệ cộng dồn cho biết bao nhiêu biến thiên tuyến tính còn lại sau nén." },
      { title: "Nén có mất mát", text: "Một component bị bỏ vẫn có thể chứa tín hiệu nhãn dù phương sai nhỏ." },
      { title: "Fit chỉ trên train", text: "Mean và trục PCA phải học từ train để tránh leakage sang validation." },
    ],
    experiment: {
      question: "Mỗi chiều bổ sung mua thêm bao nhiêu phần trăm explained variance?",
      parameterLabels: { n_components: "Số principal component" },
      defaultVariantId: "two-components",
      variants: [
        {
          id: "one-component", label: "Giữ 1 PC", parameters: { n_components: 1 },
          expectedOutput: "kept_variance=9\nexplained=64.3%\ncompressed_dimensions=1",
          observation: "Nén mạnh từ ba chiều xuống một nhưng bỏ 35.7% phương sai.",
          illustration: { kind: "bars", title: "Chỉ giữ PC1", caption: "PC2 và PC3 bị loại.", max: 14, items: [{ label: "Giữ", value: 9, tone: "good" }, { label: "Bỏ", value: 5, tone: "warn" }] },
        },
        {
          id: "two-components", label: "Giữ 2 PC", parameters: { n_components: 2 },
          expectedOutput: "kept_variance=13\nexplained=92.9%\ncompressed_dimensions=2",
          observation: "Hai chiều giữ 13/14 phương sai, một trade-off nén hợp lý nếu downstream vẫn đạt.",
          illustration: { kind: "bars", title: "Giữ PC1 + PC2", caption: "Chỉ 1 đơn vị phương sai bị bỏ.", max: 14, items: [{ label: "Giữ", value: 13, tone: "good" }, { label: "Bỏ", value: 1, tone: "warn" }] },
        },
        {
          id: "three-components", label: "Giữ 3 PC", parameters: { n_components: 3 },
          expectedOutput: "kept_variance=14\nexplained=100.0%\ncompressed_dimensions=3",
          observation: "Không mất phương sai nhưng cũng không giảm số chiều.",
          illustration: { kind: "bars", title: "Giữ toàn bộ PC", caption: "Đây chỉ là phép xoay hệ tọa độ.", max: 14, items: [{ label: "Giữ", value: 14, tone: "good" }, { label: "Bỏ", value: 0, tone: "base" }] },
        },
      ],
    },
    transferQuestion: "Nếu PC3 chỉ giữ 7.1% phương sai nhưng quyết định toàn bộ nhãn lỗi hiếm, bạn sẽ chọn số component bằng kiểm tra nào?",
  },
  "ml-tsne": {
    lessonId: "ml-tsne",
    scenario: {
      title: "Điều chỉnh mức cục bộ khi xem embedding chữ số",
      context:
        "Một điểm ảnh chữ số có bốn láng giềng với bình phương khoảng cách 0.25, 1, 4 và 16. t-SNE chọn bandwidth sao cho entropy láng giềng đạt perplexity mục tiêu.",
      goal:
        "Dùng binary search tìm beta của Gaussian affinity và xem perplexity quyết định xác suất tập trung vào bao nhiêu neighbor.",
    },
    inputs: [{ label: "Bình phương khoảng cách tới bốn điểm", format: "python", value: "[0.25, 1.0, 4.0, 16.0]" }],
    python: {
      title: "Tìm local bandwidth theo perplexity",
      filename: "tsne_perplexity.py",
      codeTemplate: `from math import exp, log

distances_squared = [0.25, 1.0, 4.0, 16.0]
perplexity = {{perplexity}}
target_entropy = log(perplexity)
low, high = 1e-6, 100.0

for _ in range(60):
    beta = (low + high) / 2
    weights = [exp(-beta * distance) for distance in distances_squared]
    probabilities = [weight / sum(weights) for weight in weights]
    entropy = -sum(p * log(p) for p in probabilities if p > 0)
    if entropy > target_entropy:
        low = beta
    else:
        high = beta

print(f"beta={beta:.3f}")
print("probabilities=[" + ", ".join(f"{p:.3f}" for p in probabilities) + "]")
print(f"effective_neighbors={exp(entropy):.2f}")`,
    },
    explanation: [
      { title: "Perplexity là số láng giềng hiệu dụng", text: "exp(entropy) biến độ phân tán xác suất thành một lượng dễ đọc." },
      { title: "Mỗi điểm có bandwidth riêng", text: "Binary search tìm beta để điểm ở vùng dày và thưa cùng đạt perplexity mục tiêu." },
      { title: "Perplexity thấp rất cục bộ", text: "Xác suất dồn vào các điểm gần nhất và cấu trúc xa gần như biến mất." },
      { title: "Đây chưa phải layout cuối", text: "Affinity P chỉ là đầu vào; t-SNE còn tối ưu tọa độ thấp chiều bằng KL divergence." },
    ],
    experiment: {
      question: "Phân phối láng giềng phẳng dần thế nào khi perplexity tăng gần số điểm khả dụng?",
      parameterLabels: { perplexity: "Perplexity mục tiêu" },
      defaultVariantId: "perplexity-25",
      variants: [
        {
          id: "perplexity-15", label: "Perplexity 1.5", parameters: { perplexity: 1.5 },
          expectedOutput: "beta=2.423\nprobabilities=[0.860, 0.140, 0.000, 0.000]\neffective_neighbors=1.50",
          observation: "86% khối lượng dồn vào điểm gần nhất; hai điểm xa làm tròn về 0.",
          illustration: { kind: "bars", title: "Affinity rất cục bộ", caption: "Láng giềng 1 gần như quyết định.", max: 1, items: [{ label: "N1", value: 0.86, tone: "good" }, { label: "N2", value: 0.14 }, { label: "N3", value: 0 }, { label: "N4", value: 0 }] },
        },
        {
          id: "perplexity-25", label: "Perplexity 2.5", parameters: { perplexity: 2.5 },
          expectedOutput: "beta=0.485\nprobabilities=[0.538, 0.374, 0.087, 0.000]\neffective_neighbors=2.50",
          observation: "Ba điểm đầu bắt đầu đóng góp, nhưng điểm xa nhất vẫn không đáng kể.",
          illustration: { kind: "bars", title: "Affinity cục bộ vừa", caption: "Xác suất lan sang neighbor thứ ba.", max: 1, items: [{ label: "N1", value: 0.538, tone: "good" }, { label: "N2", value: 0.374, tone: "accent" }, { label: "N3", value: 0.087 }, { label: "N4", value: 0 }] },
        },
        {
          id: "perplexity-38", label: "Perplexity 3.8", parameters: { perplexity: 3.8 },
          expectedOutput: "beta=0.059\nprobabilities=[0.317, 0.303, 0.254, 0.126]\neffective_neighbors=3.80",
          observation: "Phân phối gần phẳng, nên cấu trúc xa có ảnh hưởng lớn hơn tới embedding.",
          illustration: { kind: "bars", title: "Affinity rộng", caption: "Cả bốn láng giềng đều có trọng số.", max: 1, items: [{ label: "N1", value: 0.317, tone: "good" }, { label: "N2", value: 0.303, tone: "accent" }, { label: "N3", value: 0.254 }, { label: "N4", value: 0.126 }] },
        },
      ],
    },
    transferQuestion: "Vì sao không thể đặt perplexity 50 khi chỉ có 20 mẫu, và điều gì xảy ra với khả năng bảo toàn cụm rất nhỏ?",
  },
  "ml-umap": {
    lessonId: "ml-umap",
    scenario: {
      title: "Dựng đồ thị sản phẩm và gắn một sản phẩm mới",
      context:
        "Năm sản phẩm A–E có tọa độ embedding một chiều 0, 1, 3, 4 và 9. Sản phẩm mới ở 3.6 cần được nối vào đồ thị láng giềng đã học.",
      goal:
        "Tạo cạnh k-nearest-neighbor đối xứng và quan sát mật độ graph cùng danh sách neighbor của điểm mới.",
    },
    inputs: [
      { label: "Embedding sản phẩm", format: "python", value: "A=0, B=1, C=3, D=4, E=9" },
      { label: "Embedding mới", format: "python", value: "3.6" },
    ],
    python: {
      title: "Đồ thị k-NN và transform điểm mới",
      filename: "umap_neighbor_graph.py",
      codeTemplate: `points = {"A": 0.0, "B": 1.0, "C": 3.0, "D": 4.0, "E": 9.0}
n_neighbors = {{n_neighbors}}
edges = set()

for name, value in points.items():
    nearest = sorted((abs(value - other_value), other) for other, other_value in points.items() if other != name)
    for _, other in nearest[:n_neighbors]:
        edges.add(tuple(sorted((name, other))))

new_value = 3.6
new_neighbors = [name for _, name in sorted((abs(new_value - value), name) for name, value in points.items())[:n_neighbors]]
print(f"graph_edges={len(edges)}")
print(f"new_neighbors={new_neighbors}")
print("edges=" + ", ".join("-".join(edge) for edge in sorted(edges)))`,
    },
    explanation: [
      { title: "Graph trước layout", text: "UMAP bắt đầu từ quan hệ láng giềng trong không gian gốc, không trực tiếp đoán tọa độ 2D." },
      { title: "Hợp cạnh hai chiều", text: "Set loại cạnh trùng khi A chọn B và B chọn A." },
      { title: "n_neighbors đổi mức nhìn", text: "k nhỏ ưu tiên cụm cục bộ; k lớn nối nhiều vùng và làm graph dày hơn." },
      { title: "Transform dùng graph đã học", text: "Điểm 3.6 tìm neighbor trong dữ liệu train thay vì fit lại toàn bộ embedding." },
    ],
    experiment: {
      question: "Graph và điểm mới kết nối rộng hơn ra sao khi tăng n_neighbors?",
      parameterLabels: { n_neighbors: "Số láng giềng" },
      defaultVariantId: "neighbors-two",
      variants: [
        {
          id: "neighbors-one", label: "1 neighbor", parameters: { n_neighbors: 1 },
          expectedOutput: "graph_edges=3\nnew_neighbors=['D']\nedges=A-B, C-D, D-E",
          observation: "Điểm mới chỉ nối D; graph tổng thể gồm ba cạnh rất cục bộ.",
          illustration: { kind: "sequence", layout: "cards", title: "Transform với k=1", caption: "3.6 gần D=4 nhất.", items: [{ label: "Điểm mới", value: "3.6", tone: "accent" }, { label: "D", value: "4.0", detail: "khoảng cách 0.4", tone: "good" }] },
        },
        {
          id: "neighbors-two", label: "2 neighbors", parameters: { n_neighbors: 2 },
          expectedOutput: "graph_edges=7\nnew_neighbors=['D', 'C']\nedges=A-B, A-C, B-C, B-D, C-D, C-E, D-E",
          observation: "Điểm mới dùng cả D và C; graph tăng lên bảy cạnh.",
          illustration: { kind: "sequence", layout: "cards", title: "Transform với k=2", caption: "Hai neo gần nhất bao quanh điểm mới.", items: [{ label: "C", value: "3.0", detail: "d=0.6", tone: "good" }, { label: "Mới", value: "3.6", tone: "accent" }, { label: "D", value: "4.0", detail: "d=0.4", tone: "good" }] },
        },
        {
          id: "neighbors-three", label: "3 neighbors", parameters: { n_neighbors: 3 },
          expectedOutput: "graph_edges=9\nnew_neighbors=['D', 'C', 'B']\nedges=A-B, A-C, A-D, B-C, B-D, B-E, C-D, C-E, D-E",
          observation: "B trở thành neo thứ ba và graph gần đầy, làm ranh giới cụm bớt cục bộ.",
          illustration: { kind: "sequence", layout: "cards", title: "Transform với k=3", caption: "Điểm B xa 2.6 vẫn tham gia.", items: [{ label: "B", value: "1.0", detail: "d=2.6" }, { label: "C", value: "3.0", detail: "d=0.6", tone: "good" }, { label: "D", value: "4.0", detail: "d=0.4", tone: "good" }] },
        },
      ],
    },
    transferQuestion: "Nếu sản phẩm mới ở 100, rất xa toàn bộ train, hệ thống nên phát cảnh báo out-of-distribution nào thay vì vẫn ép nó vào graph?",
  },
  "ml-dbscan": {
    lessonId: "ml-dbscan",
    scenario: {
      title: "Tìm điểm đón taxi đông và tách tọa độ GPS nhiễu",
      context:
        "Sáu vị trí một chiều nằm quanh 0, quanh 1 và một điểm xa ở 4 km. Với min_samples=2, eps quyết định điểm nào đủ kết nối mật độ để tạo cụm.",
      goal:
        "Nhóm các điểm liên tiếp cách nhau không quá eps, loại nhóm đơn lẻ thành noise và quan sát hiện tượng nối chuỗi.",
    },
    inputs: [{ label: "Vị trí dọc tuyến đường (km)", format: "python", value: "[0.0, 0.1, 0.2, 1.0, 1.1, 4.0]" }],
    python: {
      title: "DBSCAN một chiều với min_samples=2",
      filename: "gps_dbscan_1d.py",
      codeTemplate: `positions = [0.0, 0.1, 0.2, 1.0, 1.1, 4.0]
eps = {{eps}}
groups = []
current = [positions[0]]

for position in positions[1:]:
    if position - current[-1] <= eps:
        current.append(position)
    else:
        groups.append(current)
        current = [position]
groups.append(current)

clusters = [group for group in groups if len(group) >= 2]
noise = [position for group in groups if len(group) < 2 for position in group]
print(f"clusters={clusters}")
print(f"noise={noise}")`,
    },
    explanation: [
      { title: "eps tạo lân cận", text: "Hai điểm trực tiếp cách nhau không quá eps được nối trong ví dụ một chiều đã sắp xếp." },
      { title: "Mật độ tối thiểu", text: "Với min_samples=2 tính cả chính điểm đó, một nhóm phải có ít nhất hai vị trí để thành cụm." },
      { title: "Noise không bị ép vào cụm", text: "Điểm 4.0 được giữ thành noise thay vì phải nhận tâm như K-Means." },
      { title: "Kết nối có tính bắc cầu", text: "Một chuỗi bước nhỏ có thể nối hai vùng xa hơn eps; đây là density reachability." },
    ],
    experiment: {
      question: "Từ eps nào hai hotspot quanh 0 và 1 bị nối thành cùng một cụm?",
      parameterLabels: { eps: "Bán kính eps (km)" },
      defaultVariantId: "local-radius",
      variants: [
        {
          id: "tiny-radius", label: "eps = 0.08", parameters: { eps: 0.08 },
          expectedOutput: "clusters=[]\nnoise=[0.0, 0.1, 0.2, 1.0, 1.1, 4.0]",
          observation: "Không cặp nào cách nhau đủ gần, nên cả sáu điểm là noise.",
          illustration: { kind: "sequence", layout: "cards", title: "Bán kính quá nhỏ", caption: "Mỗi tọa độ đứng một mình.", items: [{ label: "0.0", tone: "warn" }, { label: "0.1", tone: "warn" }, { label: "0.2", tone: "warn" }, { label: "1.0", tone: "warn" }, { label: "1.1", tone: "warn" }, { label: "4.0", tone: "warn" }] },
        },
        {
          id: "local-radius", label: "eps = 0.15", parameters: { eps: 0.15 },
          expectedOutput: "clusters=[[0.0, 0.1, 0.2], [1.0, 1.1]]\nnoise=[4.0]",
          observation: "Hai hotspot cục bộ được phát hiện, còn tọa độ 4.0 vẫn là noise.",
          illustration: { kind: "sequence", layout: "cards", title: "Hai hotspot", caption: "Màu biểu thị hai cụm và noise.", items: [{ label: "Cụm 1", value: "0.0 · 0.1 · 0.2", tone: "good" }, { label: "Cụm 2", value: "1.0 · 1.1", tone: "accent" }, { label: "Noise", value: "4.0", tone: "warn" }] },
        },
        {
          id: "bridging-radius", label: "eps = 1.0", parameters: { eps: 1 },
          expectedOutput: "clusters=[[0.0, 0.1, 0.2, 1.0, 1.1]]\nnoise=[4.0]",
          observation: "Khoảng trống 0.8 được nối, khiến hai hotspot nhập thành một cụm kéo dài.",
          illustration: { kind: "sequence", layout: "cards", title: "Hiệu ứng nối chuỗi", caption: "Năm điểm đầu density-connected.", items: [{ label: "Cụm lớn", value: "0.0 → 1.1", detail: "5 điểm", tone: "accent" }, { label: "Noise", value: "4.0", tone: "warn" }] },
        },
      ],
    },
    transferQuestion: "Trong dữ liệu GPS hai chiều có mật độ trung tâm và ngoại ô rất khác nhau, vì sao một eps duy nhất có thể thất bại?",
  },
  "ml-hierarchical-clustering": {
    lessonId: "ml-hierarchical-clustering",
    scenario: {
      title: "Nhóm cửa hàng theo mức doanh thu tương đối",
      context:
        "Bốn cửa hàng A–D nằm tại các mức 0, 2, 5 và 9 sau khi chuẩn hóa doanh thu. Cách định nghĩa khoảng cách giữa hai cụm quyết định thứ tự sáp nhập.",
      goal:
        "Chạy agglomerative clustering tới khi còn hai cụm và so single, average, complete linkage.",
    },
    inputs: [{ label: "Vị trí doanh thu chuẩn hóa", format: "python", value: "A=0, B=2, C=5, D=9" }],
    python: {
      title: "Agglomerative clustering với ba linkage",
      filename: "store_hierarchy.py",
      codeTemplate: `values = {"A": 0.0, "B": 2.0, "C": 5.0, "D": 9.0}
linkage = {{linkage}}
clusters = [(name,) for name in values]
merges = []

while len(clusters) > 2:
    choices = []
    for i in range(len(clusters)):
        for j in range(i + 1, len(clusters)):
            distances = [abs(values[a] - values[b]) for a in clusters[i] for b in clusters[j]]
            distance = min(distances) if linkage == "single" else max(distances) if linkage == "complete" else sum(distances) / len(distances)
            choices.append((distance, clusters[i], clusters[j], i, j))
    distance, left, right, i, j = min(choices, key=lambda row: (row[0], row[1], row[2]))
    merges.append(f"{''.join(left)}+{''.join(right)}@{distance:.1f}")
    merged = tuple(sorted(left + right))
    clusters = [cluster for index, cluster in enumerate(clusters) if index not in (i, j)] + [merged]
    clusters.sort()

print(f"merges={merges}")
print(f"final={[''.join(cluster) for cluster in clusters]}")`,
    },
    explanation: [
      { title: "Bắt đầu từ singleton", text: "Mỗi cửa hàng là một cụm; thuật toán chỉ sáp nhập, không hoàn tác." },
      { title: "Single nhìn cặp gần nhất", text: "Một cầu nối gần có thể kéo dài cụm theo kiểu chaining." },
      { title: "Complete nhìn cặp xa nhất", text: "Cụm chỉ nhập khi mọi thành viên tương đối gần, nên có xu hướng gọn." },
      { title: "Dendrogram giữ toàn lịch sử", text: "Chọn hai cụm ở đây tương đương cắt cây sau hai lần merge." },
    ],
    experiment: {
      question: "Linkage nào tách AB và CD thành hai nhóm cân đối, và vì sao?",
      parameterLabels: { linkage: "Cách đo khoảng cách cụm" },
      defaultVariantId: "average-linkage",
      variants: [
        {
          id: "single-linkage", label: "Single", parameters: { linkage: "single" },
          expectedOutput: "merges=['A+B@2.0', 'AB+C@3.0']\nfinal=['ABC', 'D']",
          observation: "C nối vào AB nhờ khoảng cách B–C bằng 3, tạo cụm chuỗi ABC.",
          illustration: { kind: "sequence", layout: "timeline", title: "Single linkage", caption: "Mỗi merge dùng cặp gần nhất.", items: [{ label: "A + B", value: "2.0", tone: "good" }, { label: "AB + C", value: "3.0", tone: "accent" }, { label: "Cắt", value: "ABC | D" }] },
        },
        {
          id: "average-linkage", label: "Average", parameters: { linkage: "average" },
          expectedOutput: "merges=['A+B@2.0', 'AB+C@4.0']\nfinal=['ABC', 'D']",
          observation: "Kết quả cắt giống single nhưng khoảng cách merge AB–C tăng thành trung bình 4.",
          illustration: { kind: "sequence", layout: "timeline", title: "Average linkage", caption: "Dùng mean mọi cặp xuyên cụm.", items: [{ label: "A + B", value: "2.0", tone: "good" }, { label: "AB + C", value: "4.0", tone: "accent" }, { label: "Cắt", value: "ABC | D" }] },
        },
        {
          id: "complete-linkage", label: "Complete", parameters: { linkage: "complete" },
          expectedOutput: "merges=['A+B@2.0', 'C+D@4.0']\nfinal=['AB', 'CD']",
          observation: "Khoảng cách xa nhất AB–C là 5, nên C–D ở 4 được ghép trước và tạo hai cụm cân đối.",
          illustration: { kind: "sequence", layout: "timeline", title: "Complete linkage", caption: "Cặp có worst-case nhỏ hơn được ưu tiên.", items: [{ label: "A + B", value: "2.0", tone: "good" }, { label: "C + D", value: "4.0", tone: "accent" }, { label: "Cắt", value: "AB | CD" }] },
        },
      ],
    },
    transferQuestion: "Nếu D là outlier ở 100 thay vì 9, single, average và complete linkage sẽ thể hiện nó khác nhau thế nào trên dendrogram?",
  },
  "ml-spectral-clustering": {
    lessonId: "ml-spectral-clustering",
    scenario: {
      title: "Dựng đồ thị tương đồng cho bốn khu giao thông",
      context:
        "Bốn khu A–D nằm trên trục đặc trưng ở 0, 1, 4 và 5. Trước bước eigenvector, spectral clustering cần affinity graph không quá thưa cũng không quá dày.",
      goal:
        "Tính RBF affinity, giữ cạnh có trọng số ít nhất 0.2 và quan sát degree khi sigma thay đổi.",
    },
    inputs: [
      { label: "Vị trí đặc trưng", format: "python", value: "A=0, B=1, C=4, D=5" },
      { label: "Ngưỡng giữ cạnh", format: "text", value: "affinity ≥ 0.2" },
    ],
    python: {
      title: "RBF affinity graph trước eigendecomposition",
      filename: "spectral_affinity.py",
      codeTemplate: `from math import exp

positions = {"A": 0.0, "B": 1.0, "C": 4.0, "D": 5.0}
sigma = {{sigma}}
names = list(positions)
active_edges = []
degrees = {name: 0 for name in names}

for i, left in enumerate(names):
    for right in names[i + 1:]:
        distance = positions[left] - positions[right]
        weight = exp(-(distance ** 2) / (2 * sigma ** 2))
        if weight >= 0.2:
            active_edges.append(f"{left}-{right}")
            degrees[left] += 1
            degrees[right] += 1

print(f"active_edges={active_edges}")
print("degrees=" + ", ".join(f"{name}:{degrees[name]}" for name in names))`,
    },
    explanation: [
      { title: "Affinity thay khoảng cách", text: "RBF đổi khoảng cách thành trọng số gần 1 cho điểm gần và gần 0 cho điểm xa." },
      { title: "Sigma điều khiển độ rộng", text: "Sigma nhỏ làm graph thưa; sigma lớn tạo thêm cầu nối giữa vùng." },
      { title: "Degree phát hiện cô lập", text: "Degree 0 khiến normalized Laplacian cần xử lý đặc biệt và embedding dễ suy biến." },
      { title: "Graph mới là bước đầu", text: "Spectral clustering còn lập Laplacian, lấy eigenvector rồi chạy K-Means trên biểu diễn đó." },
    ],
    experiment: {
      question: "Sigma nào biểu diễn hai cặp AB và CD tách biệt mà không để node cô lập?",
      parameterLabels: { sigma: "Độ rộng RBF sigma" },
      defaultVariantId: "separated-pairs",
      variants: [
        {
          id: "isolated-nodes", label: "Sigma 0.5", parameters: { sigma: 0.5 },
          expectedOutput: "active_edges=[]\ndegrees=A:0, B:0, C:0, D:0",
          observation: "Ngay cả khoảng cách 1 chỉ có affinity 0.135, dưới ngưỡng 0.2; graph mất toàn bộ cấu trúc.",
          illustration: { kind: "matrix", title: "Adjacency rỗng", caption: "Không có cạnh hoạt động.", rows: ["A", "B", "C", "D"], columns: ["A", "B", "C", "D"], values: [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]], scale: "sequential" },
        },
        {
          id: "separated-pairs", label: "Sigma 1.0", parameters: { sigma: 1 },
          expectedOutput: "active_edges=['A-B', 'C-D']\ndegrees=A:1, B:1, C:1, D:1",
          observation: "Graph tạo đúng hai thành phần AB và CD; mỗi node có degree 1.",
          illustration: { kind: "matrix", title: "Hai block affinity", caption: "AB và CD không có cầu nối.", rows: ["A", "B", "C", "D"], columns: ["A", "B", "C", "D"], values: [[0,1,0,0],[1,0,0,0],[0,0,0,1],[0,0,1,0]], scale: "sequential" },
        },
        {
          id: "bridged-graph", label: "Sigma 2.0", parameters: { sigma: 2 },
          expectedOutput: "active_edges=['A-B', 'B-C', 'C-D']\ndegrees=A:1, B:2, C:2, D:1",
          observation: "Cạnh B–C nối hai vùng thành một chuỗi, làm ranh giới phổ bớt rõ.",
          illustration: { kind: "matrix", title: "Graph có cầu nối", caption: "B–C thêm liên kết xuyên cụm.", rows: ["A", "B", "C", "D"], columns: ["A", "B", "C", "D"], values: [[0,1,0,0],[1,0,1,0],[0,1,0,1],[0,0,1,0]], scale: "sequential" },
        },
      ],
    },
    transferQuestion: "Nếu degree giữa các node chênh lệch rất lớn, nên dùng unnormalized, symmetric normalized hay random-walk Laplacian, và vì sao?",
  },
};
