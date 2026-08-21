import type {
  LessonPracticeMap,
  PracticalBarItem,
  PracticalIllustration,
  PracticalSequenceItem,
} from "./types";

function sequence(
  title: string,
  caption: string,
  items: PracticalSequenceItem[],
  layout: "pipeline" | "cards" | "timeline" = "pipeline",
): PracticalIllustration {
  return { kind: "sequence", layout, title, caption, items };
}

function bars(title: string, caption: string, items: PracticalBarItem[], max = 1): PracticalIllustration {
  return { kind: "bars", title, caption, min: 0, max, items };
}

export const visionLanguageAudioMultimodalPractice: LessonPracticeMap = {
  "cv-01-convolution": {
    lessonId: "cv-01-convolution",
    scenario: {
      title: "Làm nổi đường biên của miếng linh kiện trên ảnh kiểm tra",
      context:
        "Một camera công nghiệp chụp ảnh xám 3×3 của góc một miếng linh kiện. Bốn pixel sáng liền nhau biểu diễn vật thể; bộ lọc Laplacian cần làm nổi nơi cường độ đổi từ 0 sang 1 trước khi đo kích thước.",
      goal: "Tự tính cross-correlation có padding 1 và quan sát hệ số giữa của kernel điều khiển độ mạnh đáp ứng cạnh.",
    },
    inputs: [
      { label: "Ảnh xám nhị phân", format: "python", value: "[[0, 0, 0], [0, 1, 1], [0, 1, 1]]" },
      { label: "Kernel", format: "text", value: "[[0,-1,0],[-1,c,-1],[0,-1,0]]" },
    ],
    python: {
      title: "Cross-correlation 2D có zero padding",
      filename: "edge_kernel.py",
      codeTemplate: `image = [[0, 0, 0], [0, 1, 1], [0, 1, 1]]
center = {{center}}
kernel = [[0, -1, 0], [-1, center, -1], [0, -1, 0]]

def pixel(row, col):
    if 0 <= row < 3 and 0 <= col < 3:
        return image[row][col]
    return 0

output = []
for row in range(3):
    line = []
    for col in range(3):
        value = 0
        for kr in range(3):
            for kc in range(3):
                value += pixel(row + kr - 1, col + kc - 1) * kernel[kr][kc]
        line.append(value)
    output.append(line)

print(f"center={center}")
for line in output:
    print(" ".join(map(str, line)))`,
    },
    explanation: [
      { title: "Padding bảo toàn kích thước", text: "Ngoài biên ảnh, hàm pixel trả 0 nên feature map vẫn có kích thước 3×3." },
      { title: "Nhân rồi cộng tại từng vị trí", text: "Mỗi ô đầu ra là tổng chín tích giữa vùng ảnh và kernel; code không lật kernel nên đây là cross-correlation như các thư viện DL thường dùng." },
      { title: "Đáp ứng lớn ở vùng thay đổi", text: "Ô sáng có hàng xóm tối nhận giá trị dương, còn ô tối cạnh vật thể nhận giá trị âm; trị tuyệt đối lớn báo hiệu đường biên." },
    ],
    experiment: {
      question: "Tăng hệ số giữa c làm feature map đổi ra sao trong khi vị trí cạnh giữ nguyên?",
      parameterLabels: { center: "Hệ số giữa kernel" },
      defaultVariantId: "laplace-4",
      variants: [
        {
          id: "laplace-4", label: "c = 4", parameters: { center: 4 },
          expectedOutput: "center=4\n0 -1 -1\n-1 2 2\n-1 2 2",
          observation: "Kernel bốn lá cân bằng đúng bốn hàng xóm trực giao; phần trong vật thể nhận đáp ứng 2.",
          illustration: { kind: "matrix", title: "Feature map c = 4", caption: "Âm ở phía nền sát cạnh, dương ở phía vật thể.", rows: ["1", "2", "3"], columns: ["1", "2", "3"], values: [[0, -1, -1], [-1, 2, 2], [-1, 2, 2]], scale: "diverging" },
        },
        {
          id: "laplace-5", label: "c = 5", parameters: { center: 5 },
          expectedOutput: "center=5\n0 -1 -1\n-1 3 3\n-1 3 3",
          observation: "Thêm 1 vào tâm làm mọi pixel sáng tăng đúng 1 nhưng không làm đổi pixel nền.",
          illustration: { kind: "matrix", title: "Feature map c = 5", caption: "Đáp ứng phía vật thể mạnh hơn một đơn vị.", rows: ["1", "2", "3"], columns: ["1", "2", "3"], values: [[0, -1, -1], [-1, 3, 3], [-1, 3, 3]], scale: "diverging" },
        },
        {
          id: "laplace-8", label: "c = 8", parameters: { center: 8 },
          expectedOutput: "center=8\n0 -1 -1\n-1 6 6\n-1 6 6",
          observation: "Đáp ứng lớn hơn không tự động tốt hơn: ngưỡng phát hiện và nguy cơ khuếch đại nhiễu cũng phải được hiệu chỉnh lại.",
          illustration: { kind: "matrix", title: "Feature map c = 8", caption: "Biên vẫn ở cùng vị trí nhưng biên độ phía sáng tăng mạnh.", rows: ["1", "2", "3"], columns: ["1", "2", "3"], values: [[0, -1, -1], [-1, 6, 6], [-1, 6, 6]], scale: "diverging" },
        },
      ],
    },
    transferQuestion: "Nếu ảnh có nhiễu muối tiêu, bạn sẽ thêm bước nào trước convolution để không biến từng pixel nhiễu thành một cạnh mạnh?",
  },

  "cv-02-image-classification": {
    lessonId: "cv-02-image-classification",
    scenario: {
      title: "Hiệu chỉnh độ tự tin của bộ phân loại ảnh thú cưng",
      context:
        "Một ứng dụng nhận ba logit cố định cho ảnh mới: mèo 2,0; chó 1,0; chim 0,0. Nhãn dự đoán không đổi, nhưng đội sản phẩm cần xác suất đủ trung thực để quyết định lúc nào yêu cầu người dùng kiểm tra lại.",
      goal: "Chuyển logit thành xác suất softmax ổn định và thử temperature scaling mà không huấn luyện lại mô hình.",
    },
    inputs: [
      { label: "Nhãn", format: "python", value: "['cat', 'dog', 'bird']" },
      { label: "Logit", format: "python", value: "[2.0, 1.0, 0.0]" },
    ],
    python: {
      title: "Softmax ổn định có temperature",
      filename: "calibrate_classifier.py",
      codeTemplate: `from math import exp

labels = ["cat", "dog", "bird"]
logits = [2.0, 1.0, 0.0]
temperature = {{temperature}}
scaled = [value / temperature for value in logits]
maximum = max(scaled)
weights = [exp(value - maximum) for value in scaled]
total = sum(weights)
probabilities = [value / total for value in weights]

print(f"T={temperature:g}")
for label, probability in zip(labels, probabilities):
    print(f"{label}={probability:.3f}")
print(f"prediction={labels[max(range(len(labels)), key=probabilities.__getitem__)]}")`,
    },
    explanation: [
      { title: "Trừ logit lớn nhất", text: "Phép dịch cùng một hằng số không đổi softmax nhưng ngăn exp tràn số khi logit lớn." },
      { title: "Temperature đổi độ sắc", text: "T nhỏ hơn 1 kéo các logit ra xa nhau; T lớn hơn 1 nén chúng lại và làm phân phối phẳng hơn." },
      { title: "Nhãn và độ tin cậy là hai câu hỏi", text: "argmax vẫn là mèo trong cả ba biến thể, nhưng xác suất 0,867 và 0,506 dẫn đến quyết định sản phẩm rất khác." },
    ],
    experiment: {
      question: "Temperature nào làm mô hình bớt tự tin mà không đổi thứ tự lớp?",
      parameterLabels: { temperature: "Temperature" },
      defaultVariantId: "temperature-1",
      variants: [
        { id: "temperature-05", label: "T = 0,5", parameters: { temperature: 0.5 }, expectedOutput: "T=0.5\ncat=0.867\ndog=0.117\nbird=0.016\nprediction=cat", observation: "Phân phối rất sắc; mô hình dành gần 87% cho mèo.", illustration: bars("Xác suất với T = 0,5", "Khoảng cách logit được khuếch đại.", [{ label: "Mèo", value: 0.867, display: "86,7%", tone: "good" }, { label: "Chó", value: 0.117, display: "11,7%" }, { label: "Chim", value: 0.016, display: "1,6%" }]) },
        { id: "temperature-1", label: "T = 1", parameters: { temperature: 1 }, expectedOutput: "T=1\ncat=0.665\ndog=0.245\nbird=0.090\nprediction=cat", observation: "Softmax gốc vẫn ưu tiên mèo nhưng giữ xác suất đáng kể cho chó.", illustration: bars("Xác suất với T = 1", "Đây là phân phối chưa hiệu chỉnh.", [{ label: "Mèo", value: 0.665, display: "66,5%", tone: "good" }, { label: "Chó", value: 0.245, display: "24,5%" }, { label: "Chim", value: 0.09, display: "9,0%" }]) },
        { id: "temperature-2", label: "T = 2", parameters: { temperature: 2 }, expectedOutput: "T=2\ncat=0.506\ndog=0.307\nbird=0.186\nprediction=cat", observation: "Phân phối phẳng hơn; ngưỡng 60% giờ sẽ chuyển ảnh này sang hàng kiểm tra thủ công.", illustration: bars("Xác suất với T = 2", "Độ tự tin giảm nhưng lớp dẫn đầu không đổi.", [{ label: "Mèo", value: 0.506, display: "50,6%", tone: "good" }, { label: "Chó", value: 0.307, display: "30,7%" }, { label: "Chim", value: 0.186, display: "18,6%" }]) },
      ],
    },
    transferQuestion: "Bạn cần tập dữ liệu nào để chọn temperature thay vì chỉ nhìn một ảnh và tự đặt giá trị?",
  },

  "cv-03-yolo": {
    lessonId: "cv-03-yolo",
    scenario: {
      title: "Lọc dự đoán camera giao thông trước NMS",
      context:
        "Một head YOLO trả objectness và xác suất lớp cho ba hộp ứng viên trong cùng khung hình. Hệ thống phải bỏ hộp quá yếu trước khi chạy non-maximum suppression để giảm báo động giả và chi phí xử lý.",
      goal: "Tính confidence = objectness × class probability và quan sát ngưỡng giữ lại hộp nào.",
    },
    inputs: [{ label: "Ứng viên", format: "python", value: "[('car', .9, .8), ('person', .7, .6), ('bike', .8, .4)]" }],
    python: {
      title: "Lọc confidence trước NMS",
      filename: "yolo_confidence.py",
      codeTemplate: `candidates = [("car", 0.9, 0.8), ("person", 0.7, 0.6), ("bike", 0.8, 0.4)]
threshold = {{threshold}}
scored = [(label, objectness * class_probability)
          for label, objectness, class_probability in candidates]
kept = [(label, score) for label, score in scored if score >= threshold]

print(f"threshold={threshold:.2f}")
print("scores=" + ",".join(f"{label}:{score:.2f}" for label, score in scored))
print("kept=" + (",".join(label for label, _ in kept) if kept else "none"))`,
    },
    explanation: [
      { title: "Hai độ tin cậy được kết hợp", text: "Objectness hỏi hộp có chứa vật thể hay không; xác suất lớp hỏi vật thể đó thuộc lớp nào. Tích của chúng mới là confidence của lớp." },
      { title: "Ngưỡng chạy trước NMS", text: "Lọc confidence loại ứng viên yếu; NMS sau đó mới xử lý các hộp còn lại bị trùng vị trí." },
      { title: "Ngưỡng là trade-off vận hành", text: "Ngưỡng cao giảm false positive nhưng có thể bỏ người đi bộ hoặc xe đạp thật, nên phải chọn trên validation set theo chi phí lỗi." },
    ],
    experiment: {
      question: "Ngưỡng confidence thay đổi recall của camera giao thông như thế nào?",
      parameterLabels: { threshold: "Ngưỡng confidence" },
      defaultVariantId: "threshold-050",
      variants: [
        { id: "threshold-030", label: "Ngưỡng 0,30", parameters: { threshold: 0.3 }, expectedOutput: "threshold=0.30\nscores=car:0.72,person:0.42,bike:0.32\nkept=car,person,bike", observation: "Cả ba hộp qua vòng lọc; recall cao hơn nhưng NMS phải xử lý nhiều ứng viên.", illustration: bars("Confidence ba hộp", "Đường ngưỡng 0,30 nằm dưới cả ba giá trị.", [{ label: "Ô tô", value: 0.72, tone: "good" }, { label: "Người", value: 0.42, tone: "accent" }, { label: "Xe đạp", value: 0.32, tone: "warn" }]) },
        { id: "threshold-050", label: "Ngưỡng 0,50", parameters: { threshold: 0.5 }, expectedOutput: "threshold=0.50\nscores=car:0.72,person:0.42,bike:0.32\nkept=car", observation: "Chỉ ô tô còn lại; hai lớp yếu bị mất trước khi NMS có cơ hội xem xét vị trí.", illustration: bars("Confidence ba hộp", "Chỉ cột ô tô vượt ngưỡng 0,50.", [{ label: "Ô tô", value: 0.72, tone: "good" }, { label: "Người", value: 0.42, tone: "base" }, { label: "Xe đạp", value: 0.32, tone: "base" }]) },
        { id: "threshold-075", label: "Ngưỡng 0,75", parameters: { threshold: 0.75 }, expectedOutput: "threshold=0.75\nscores=car:0.72,person:0.42,bike:0.32\nkept=none", observation: "Không hộp nào được phát hiện; precision biểu kiến có thể cao nhưng recall bằng 0 trên khung hình này.", illustration: bars("Confidence ba hộp", "Mọi cột đều dưới ngưỡng 0,75.", [{ label: "Ô tô", value: 0.72, tone: "warn" }, { label: "Người", value: 0.42, tone: "warn" }, { label: "Xe đạp", value: 0.32, tone: "warn" }]) },
      ],
    },
    transferQuestion: "Sau bước lọc confidence, bạn cần thêm dữ liệu gì về từng hộp để thực hiện NMS đúng cách?",
  },

  "cv-04-ssd": {
    lessonId: "cv-04-ssd",
    scenario: {
      title: "Ghép default box với biển báo giao thông",
      context:
        "SSD tạo bốn default box quanh một biển báo thật. IoU của chúng lần lượt là 0,70; 0,50; 0,30 và 0,10. Trong huấn luyện, ngưỡng ghép quyết định box nào trở thành mẫu dương.",
      goal: "Áp dụng quy tắc IoU ≥ ngưỡng và thấy trực tiếp số lượng positive anchor thay đổi.",
    },
    inputs: [{ label: "IoU default box", format: "python", value: "{'A0': .70, 'A1': .50, 'A2': .30, 'A3': .10}" }],
    python: {
      title: "Matcher IoU tối giản",
      filename: "ssd_matcher.py",
      codeTemplate: `anchor_iou = {"A0": 0.70, "A1": 0.50, "A2": 0.30, "A3": 0.10}
threshold = {{threshold}}
positive = [name for name, iou in anchor_iou.items() if iou >= threshold]
negative = [name for name, iou in anchor_iou.items() if iou < threshold]

print(f"threshold={threshold:.2f}")
print("positive=" + (",".join(positive) if positive else "none"))
print("negative=" + (",".join(negative) if negative else "none"))`,
    },
    explanation: [
      { title: "Default box là giả thuyết hình học", text: "Mỗi anchor có vị trí và tỉ lệ cố định; IoU đo phần giao trên phần hợp với hộp thật." },
      { title: "Matcher tạo nhãn huấn luyện", text: "Anchor qua ngưỡng nhận lớp vật thể và mục tiêu offset; anchor còn lại thường được coi là nền hoặc bỏ qua tùy biến thể SSD." },
      { title: "Ngưỡng đổi cân bằng dương–âm", text: "Quá thấp tạo nhiều positive kém khớp; quá cao làm tín hiệu dương khan hiếm và khó học vật thể nhỏ." },
    ],
    experiment: {
      question: "Ngưỡng ghép nào cân bằng chất lượng hình học và số mẫu dương trong ví dụ này?",
      parameterLabels: { threshold: "Ngưỡng IoU" },
      defaultVariantId: "iou-050",
      variants: [
        { id: "iou-025", label: "IoU ≥ 0,25", parameters: { threshold: 0.25 }, expectedOutput: "threshold=0.25\npositive=A0,A1,A2\nnegative=A3", observation: "Ba anchor thành positive, bao gồm A2 chỉ giao 30% với hộp thật.", illustration: bars("IoU của default box", "A0, A1 và A2 nằm trên ngưỡng 0,25.", [{ label: "A0", value: 0.7, tone: "good" }, { label: "A1", value: 0.5, tone: "good" }, { label: "A2", value: 0.3, tone: "accent" }, { label: "A3", value: 0.1, tone: "warn" }]) },
        { id: "iou-050", label: "IoU ≥ 0,50", parameters: { threshold: 0.5 }, expectedOutput: "threshold=0.50\npositive=A0,A1\nnegative=A2,A3", observation: "Hai anchor khớp tốt nhất là positive; dấu bằng khiến A1 được giữ.", illustration: bars("IoU của default box", "A0 và A1 đạt ngưỡng 0,50.", [{ label: "A0", value: 0.7, tone: "good" }, { label: "A1", value: 0.5, tone: "good" }, { label: "A2", value: 0.3 }, { label: "A3", value: 0.1 }]) },
        { id: "iou-065", label: "IoU ≥ 0,65", parameters: { threshold: 0.65 }, expectedOutput: "threshold=0.65\npositive=A0\nnegative=A1,A2,A3", observation: "Chỉ A0 cung cấp gradient hồi quy; số positive giảm một nửa so với ngưỡng 0,50.", illustration: bars("IoU của default box", "Chỉ A0 vượt 0,65.", [{ label: "A0", value: 0.7, tone: "good" }, { label: "A1", value: 0.5, tone: "warn" }, { label: "A2", value: 0.3, tone: "warn" }, { label: "A3", value: 0.1, tone: "warn" }]) },
      ],
    },
    transferQuestion: "Vì sao một matcher thực tế thường vẫn ép default box tốt nhất thành positive dù IoU của nó chưa qua ngưỡng?",
  },

  "cv-05-detr": {
    lessonId: "cv-05-detr",
    scenario: {
      title: "Ghép ba object query với hai vật thể mà không dùng NMS",
      context:
        "Một ảnh có người và ô tô, còn DETR sinh ba query. Ta kết hợp chi phí hộp với chi phí lớp rồi tìm phép ghép một-một có tổng nhỏ nhất; query dư sẽ học lớp no-object.",
      goal: "Liệt kê toàn bộ phép ghép toy bằng itertools.permutations và quan sát trọng số lớp có thể đổi query được chọn.",
    },
    inputs: [
      { label: "Chi phí hộp theo target", format: "python", value: "person=[.1,.4,.6], car=[.7,.2,.3]" },
      { label: "Xác suất đúng lớp", format: "python", value: "person=[.8,.4,.3], car=[.2,.6,.7]" },
    ],
    python: {
      title: "Bipartite matching toy bằng vét cạn",
      filename: "detr_matching.py",
      codeTemplate: `from itertools import permutations

targets = ["person", "car"]
box_cost = {"person": [0.1, 0.4, 0.6], "car": [0.7, 0.2, 0.3]}
class_probability = {"person": [0.8, 0.4, 0.3], "car": [0.2, 0.6, 0.7]}
class_weight = {{class_weight}}

def cost(target, query):
    return box_cost[target][query] + class_weight * (1 - class_probability[target][query])

best = None
for chosen_queries in permutations(range(3), len(targets)):
    total = sum(cost(target, query) for target, query in zip(targets, chosen_queries))
    candidate = (total, chosen_queries)
    if best is None or candidate < best:
        best = candidate

total, chosen_queries = best
assignment = ",".join(f"q{query}->{target}" for target, query in zip(targets, chosen_queries))
print(f"class_weight={class_weight:g}")
print(f"assignment={assignment}")
print(f"cost={total:.2f}")`,
    },
    explanation: [
      { title: "Mỗi target nhận đúng một query", text: "permutations không lặp query, nên hai vật thể không tranh cùng một dự đoán." },
      { title: "Chi phí kết hợp hai tín hiệu", text: "Box cost đo sai lệch hình học; 1 − xác suất lớp phạt query không tin vào nhãn target." },
      { title: "Query dư có vai trò rõ", text: "Sau matching, query không được chọn không biến mất mà được giám sát thành no-object." },
      { title: "Vét cạn chỉ dành cho ví dụ nhỏ", text: "Ba query cho phép liệt kê; DETR thật dùng thuật toán Hungarian để giải assignment hiệu quả hơn." },
    ],
    experiment: {
      question: "Khi tăng class_weight, query nào được dành cho ô tô và vì sao?",
      parameterLabels: { class_weight: "Trọng số chi phí lớp" },
      defaultVariantId: "class-05",
      variants: [
        { id: "class-0", label: "Không dùng chi phí lớp", parameters: { class_weight: 0 }, expectedOutput: "class_weight=0\nassignment=q0->person,q1->car\ncost=0.30", observation: "Matching chỉ nhìn hình học nên q0 và q1 thắng với tổng box cost 0,30.", illustration: { kind: "matrix", title: "Chi phí khi trọng số lớp = 0", caption: "Mỗi hàng là query, mỗi cột là target.", rows: ["q0", "q1", "q2"], columns: ["Người", "Ô tô"], values: [[0.1, 0.7], [0.4, 0.2], [0.6, 0.3]], scale: "sequential" } },
        { id: "class-05", label: "Trọng số lớp 0,5", parameters: { class_weight: 0.5 }, expectedOutput: "class_weight=0.5\nassignment=q0->person,q1->car\ncost=0.60", observation: "q0–người và q1–ô tô vẫn tối ưu; tổng cost tăng vì cộng cả bất định lớp.", illustration: { kind: "matrix", title: "Chi phí khi trọng số lớp = 0,5", caption: "Đường chéo q0–người, q1–ô tô vẫn có tổng thấp nhất.", rows: ["q0", "q1", "q2"], columns: ["Người", "Ô tô"], values: [[0.2, 1.1], [0.7, 0.4], [0.95, 0.45]], scale: "sequential" } },
        { id: "class-2", label: "Trọng số lớp 2", parameters: { class_weight: 2 }, expectedOutput: "class_weight=2\nassignment=q0->person,q2->car\ncost=1.40", observation: "q2 thay q1 cho ô tô vì xác suất lớp ô tô 0,70 bù cho box cost cao hơn một chút.", illustration: { kind: "matrix", title: "Chi phí khi trọng số lớp = 2", caption: "q2–ô tô trở thành lựa chọn rẻ nhất cho target ô tô.", rows: ["q0", "q1", "q2"], columns: ["Người", "Ô tô"], values: [[0.5, 2.3], [1.6, 1.0], [2.0, 0.9]], scale: "sequential" } },
      ],
    },
    transferQuestion: "Trong DETR thật, bạn sẽ thêm thành phần nào vào box cost để vừa đo khoảng cách tọa độ vừa đo mức chồng lấp?",
  },

  "cv-06-unet": {
    lessonId: "cv-06-unet",
    scenario: {
      title: "Theo dõi shape khi phân đoạn tế bào bằng U-Net",
      context:
        "Ảnh kính hiển vi 128×128 đi qua nhiều lần downsample rồi upsample. Mỗi tầng decoder phải nối với skip connection có cùng độ phân giải; một sai lệch shape sẽ làm concat thất bại.",
      goal: "Sinh bảng độ phân giải encoder, bottleneck và decoder cho số tầng khác nhau, rồi kiểm tra từng skip ghép đúng shape.",
    },
    inputs: [{ label: "Kích thước ảnh", format: "text", value: "128 × 128 pixel" }],
    python: {
      title: "Shape trace đối xứng của U-Net",
      filename: "unet_shapes.py",
      codeTemplate: `image_size = 128
levels = {{levels}}
encoder = [image_size // (2 ** level) for level in range(levels + 1)]
bottleneck = encoder[-1]
decoder = list(reversed(encoder[:-1]))
skip_shapes = list(reversed(encoder[:-1]))
assert decoder == skip_shapes

print("encoder=" + "->".join(map(str, encoder)))
print(f"bottleneck={bottleneck}")
print("decoder=" + "->".join(map(str, decoder)))`,
    },
    explanation: [
      { title: "Mỗi downsample chia đôi cạnh", text: "Sau level bước, độ phân giải là 128 / 2^level nếu kích thước ban đầu chia hết." },
      { title: "Decoder đi theo thứ tự ngược", text: "Mỗi upsample khôi phục đúng độ phân giải của skip tương ứng từ encoder." },
      { title: "Shape đúng chưa đủ", text: "Concat còn yêu cầu batch và kích thước không gian giống nhau; số channel có thể khác vì chúng được ghép trên trục channel." },
    ],
    experiment: {
      question: "Tăng độ sâu làm bottleneck nhỏ đi nhanh đến mức nào?",
      parameterLabels: { levels: "Số tầng downsample" },
      defaultVariantId: "levels-3",
      variants: [
        { id: "levels-2", label: "2 tầng", parameters: { levels: 2 }, expectedOutput: "encoder=128->64->32\nbottleneck=32\ndecoder=64->128", observation: "Bottleneck còn 32×32, giữ nhiều chi tiết nhưng có receptive field nhỏ hơn.", illustration: sequence("U-Net 2 tầng", "Hai skip nối các cặp cùng độ phân giải.", [{ label: "Ảnh", value: "128²" }, { label: "Encode", value: "64²", tone: "accent" }, { label: "Bottleneck", value: "32²", tone: "warn" }, { label: "Decode", value: "64²", tone: "accent" }, { label: "Mask", value: "128²", tone: "good" }]) },
        { id: "levels-3", label: "3 tầng", parameters: { levels: 3 }, expectedOutput: "encoder=128->64->32->16\nbottleneck=16\ndecoder=32->64->128", observation: "Đây là trace cân bằng: bottleneck 16×16 và ba mức skip để phục hồi biên tế bào.", illustration: sequence("U-Net 3 tầng", "Ba mức chi tiết được chuyển từ encoder sang decoder.", [{ label: "Ảnh", value: "128²" }, { label: "E1", value: "64²" }, { label: "E2", value: "32²" }, { label: "Bottleneck", value: "16²", tone: "warn" }, { label: "D2", value: "32²" }, { label: "D1", value: "64²" }, { label: "Mask", value: "128²", tone: "good" }]) },
        { id: "levels-4", label: "4 tầng", parameters: { levels: 4 }, expectedOutput: "encoder=128->64->32->16->8\nbottleneck=8\ndecoder=16->32->64->128", observation: "Bottleneck 8×8 nén mạnh hơn; chi tiết biên phụ thuộc nhiều hơn vào skip connection.", illustration: sequence("U-Net 4 tầng", "Đường đi sâu hơn đổi chi tiết không gian lấy ngữ cảnh.", [{ label: "Ảnh", value: "128²" }, { label: "E1", value: "64²" }, { label: "E2", value: "32²" }, { label: "E3", value: "16²" }, { label: "Bottleneck", value: "8²", tone: "warn" }, { label: "D3", value: "16²" }, { label: "D2", value: "32²" }, { label: "D1", value: "64²" }, { label: "Mask", value: "128²", tone: "good" }]) },
      ],
    },
    transferQuestion: "Nếu ảnh đầu vào là 130×130 và dùng pooling chia 2 bốn lần, bạn phải xử lý crop/padding thế nào để skip connection vẫn ghép được?",
  },

  "cv-07-resnet-transfer": {
    lessonId: "cv-07-resnet-transfer",
    scenario: {
      title: "Chọn phần ResNet cần fine-tune cho ảnh lá bệnh",
      context:
        "Một ResNet toy pretrained có bốn khối tham số: stem 200, layer1 400, layer2 800 và head mới 300. Tập ảnh lá bệnh nhỏ nên nhóm muốn đóng băng đặc trưng thấp tầng để giảm overfit.",
      goal: "Tính chính xác số tham số trainable khi đóng băng một tiền tố các khối và liên hệ với chi phí huấn luyện.",
    },
    inputs: [{ label: "Khối tham số", format: "python", value: "[('stem',200), ('layer1',400), ('layer2',800), ('head',300)]" }],
    python: {
      title: "Đếm tham số sau khi đóng băng",
      filename: "freeze_resnet.py",
      codeTemplate: `blocks = [("stem", 200), ("layer1", 400), ("layer2", 800), ("head", 300)]
frozen_blocks = {{frozen_blocks}}
frozen = blocks[:frozen_blocks]
trainable = blocks[frozen_blocks:]

print("frozen=" + (",".join(name for name, _ in frozen) if frozen else "none"))
print("trainable=" + ",".join(name for name, _ in trainable))
print(f"trainable_parameters={sum(count for _, count in trainable)}")`,
    },
    explanation: [
      { title: "Đóng băng theo tiền tố", text: "Các block đầu học cạnh và texture phổ quát hơn; head cuối phải học lại cho nhãn bệnh lá mới." },
      { title: "Trainable không đồng nghĩa toàn bộ bộ nhớ biến mất", text: "Activation vẫn cần cho forward; đóng băng chủ yếu loại gradient và optimizer state của tham số đó." },
      { title: "Chọn bằng validation", text: "Ít dữ liệu ưu tiên đóng băng nhiều hơn, nhưng domain shift lớn có thể buộc mở các block sâu để thích nghi." },
    ],
    experiment: {
      question: "Mở thêm block làm năng lực thích nghi và nguy cơ overfit đổi cùng nhau ra sao?",
      parameterLabels: { frozen_blocks: "Số block đầu bị đóng băng" },
      defaultVariantId: "freeze-2",
      variants: [
        { id: "freeze-0", label: "Fine-tune toàn bộ", parameters: { frozen_blocks: 0 }, expectedOutput: "frozen=none\ntrainable=stem,layer1,layer2,head\ntrainable_parameters=1700", observation: "Nhiều năng lực thích nghi nhất nhưng optimizer phải cập nhật đủ 1.700 tham số toy.", illustration: bars("Tham số trainable", "Mọi khối đều được cập nhật.", [{ label: "stem", value: 200 }, { label: "layer1", value: 400 }, { label: "layer2", value: 800, tone: "accent" }, { label: "head", value: 300, tone: "good" }], 800) },
        { id: "freeze-2", label: "Đóng băng stem + layer1", parameters: { frozen_blocks: 2 }, expectedOutput: "frozen=stem,layer1\ntrainable=layer2,head\ntrainable_parameters=1100", observation: "Layer2 và head thích nghi; số tham số trainable giảm khoảng 35%.", illustration: bars("Tham số trainable", "Hai khối đầu không nhận cập nhật optimizer.", [{ label: "stem", value: 0, display: "frozen" }, { label: "layer1", value: 0, display: "frozen" }, { label: "layer2", value: 800, tone: "accent" }, { label: "head", value: 300, tone: "good" }], 800) },
        { id: "freeze-3", label: "Chỉ học head", parameters: { frozen_blocks: 3 }, expectedOutput: "frozen=stem,layer1,layer2\ntrainable=head\ntrainable_parameters=300", observation: "Đây là linear probing: nhanh và ổn định, nhưng backbone không thể thích nghi với texture lá bệnh.", illustration: bars("Tham số trainable", "Chỉ classifier head được học.", [{ label: "stem", value: 0, display: "frozen" }, { label: "layer1", value: 0, display: "frozen" }, { label: "layer2", value: 0, display: "frozen" }, { label: "head", value: 300, tone: "good" }], 800) },
      ],
    },
    transferQuestion: "Ngoài số block trainable, learning rate của backbone và head nên khác nhau thế nào khi bạn mở layer2?",
  },

  "cv-08-augmentation": {
    lessonId: "cv-08-augmentation",
    scenario: {
      title: "Mô phỏng thay đổi ánh sáng cho camera nhà kính",
      context:
        "Bốn pixel toy đại diện vùng lá chụp sáng tối khác nhau trong ngày. Augmentation cộng độ sáng phải giữ mọi giá trị trong miền ảnh 8-bit [0,255], nếu không dữ liệu huấn luyện không còn hợp lệ.",
      goal: "Áp dụng brightness shift có clipping và so sánh pixel bị bão hòa ở hai đầu miền.",
    },
    inputs: [{ label: "Patch ảnh 2×2", format: "python", value: "[[20, 80], [140, 220]]" }],
    python: {
      title: "Brightness augmentation có clipping",
      filename: "brightness_augmentation.py",
      codeTemplate: `image = [[20, 80], [140, 220]]
delta = {{delta}}
augmented = [[max(0, min(255, pixel + delta)) for pixel in row] for row in image]

print(f"delta={delta:+d}")
for row in augmented:
    print(" ".join(map(str, row)))`,
    },
    explanation: [
      { title: "Một tham số áp dụng nhất quán", text: "Cùng delta được cộng cho toàn patch, mô phỏng thay đổi độ phơi sáng toàn cục thay vì noise từng pixel." },
      { title: "Clipping bảo vệ miền dữ liệu", text: "max và min ép giá trị về [0,255]; pixel vượt miền không được phép wrap quanh như số nguyên không dấu." },
      { title: "Bão hòa làm mất thông tin", text: "Pixel 20 thành 0 khi làm tối và pixel 220 thành 255 khi làm sáng; nhiều delta cực đoan sẽ xóa tương phản vùng đó." },
    ],
    experiment: {
      question: "Augmentation nào còn bảo toàn đủ tương phản của patch?",
      parameterLabels: { delta: "Độ dịch sáng" },
      defaultVariantId: "brightness-0",
      variants: [
        { id: "brightness-minus40", label: "Tối đi 40", parameters: { delta: -40 }, expectedOutput: "delta=-40\n0 40\n100 180", observation: "Pixel tối nhất bão hòa tại 0; ba pixel khác vẫn giữ chênh lệch ban đầu.", illustration: { kind: "matrix", title: "Patch sau delta −40", caption: "Ô 20 bị cắt xuống 0.", rows: ["1", "2"], columns: ["1", "2"], values: [[0, 40], [100, 180]], scale: "sequential" } },
        { id: "brightness-0", label: "Giữ nguyên", parameters: { delta: 0 }, expectedOutput: "delta=+0\n20 80\n140 220", observation: "Đây là mẫu đối chứng để kiểm tra augmentation không vô tình đổi dữ liệu ở delta 0.", illustration: { kind: "matrix", title: "Patch gốc", caption: "Không pixel nào bị clipping.", rows: ["1", "2"], columns: ["1", "2"], values: [[20, 80], [140, 220]], scale: "sequential" } },
        { id: "brightness-plus50", label: "Sáng lên 50", parameters: { delta: 50 }, expectedOutput: "delta=+50\n70 130\n190 255", observation: "Pixel 220 bão hòa ở 255; khoảng cách với pixel 140 giảm từ 80 xuống 65.", illustration: { kind: "matrix", title: "Patch sau delta +50", caption: "Ô sáng nhất chạm trần ảnh 8-bit.", rows: ["1", "2"], columns: ["1", "2"], values: [[70, 130], [190, 255]], scale: "sequential" } },
      ],
    },
    transferQuestion: "Bạn sẽ giới hạn khoảng delta bằng thống kê nào của ảnh thật để augmentation không tạo mẫu phi thực tế?",
  },

  "cv-09-gan": {
    lessonId: "cv-09-gan",
    scenario: {
      title: "Đọc cân bằng trò chơi GAN từ một ảnh giả",
      context:
        "Discriminator đang cho ảnh thật xác suất 0,9 và một ảnh giả xác suất p. Nhóm muốn biết p quá thấp, cân bằng hay quá cao ảnh hưởng thế nào đến loss discriminator và non-saturating generator.",
      goal: "Tính hai loss nhị phân từ cùng fake score và nhận diện trạng thái bên nào đang áp đảo.",
    },
    inputs: [{ label: "Điểm ảnh thật", format: "text", value: "D(x_real) = 0.9" }],
    python: {
      title: "Loss GAN cho một cặp thật–giả",
      filename: "gan_balance.py",
      codeTemplate: `from math import log

real_score = 0.9
fake_score = {{fake_score}}
discriminator_loss = -0.5 * (log(real_score) + log(1 - fake_score))
generator_loss = -log(fake_score)

print(f"D(fake)={fake_score:.1f}")
print(f"discriminator_loss={discriminator_loss:.3f}")
print(f"generator_loss={generator_loss:.3f}")`,
    },
    explanation: [
      { title: "Discriminator muốn hai quyết định đúng", text: "Nó tối thiểu hóa −log D(real) và −log(1−D(fake)); fake score càng cao thì vế thứ hai càng bị phạt." },
      { title: "Generator muốn ảnh giả được tin", text: "Non-saturating loss −log D(fake) rất lớn khi discriminator dễ dàng nhận ra ảnh giả." },
      { title: "Không tối ưu loss riêng lẻ một cách tĩnh", text: "Hai mạng thay đổi luân phiên; một snapshot chỉ giúp chẩn đoán mất cân bằng, không phải đích hội tụ duy nhất." },
    ],
    experiment: {
      question: "Fake score nào cho thấy discriminator áp đảo và generator nhận gradient lớn nhất?",
      parameterLabels: { fake_score: "D(fake)" },
      defaultVariantId: "fake-05",
      variants: [
        { id: "fake-01", label: "D(fake) = 0,1", parameters: { fake_score: 0.1 }, expectedOutput: "D(fake)=0.1\ndiscriminator_loss=0.105\ngenerator_loss=2.303", observation: "Discriminator gần hoàn hảo; generator chịu loss lớn và có nguy cơ học khó nếu tín hiệu quá lệch.", illustration: bars("Loss tại D(fake)=0,1", "Generator chịu phần lớn áp lực cập nhật.", [{ label: "Discriminator", value: 0.105, tone: "good" }, { label: "Generator", value: 2.303, tone: "warn" }], 2.5) },
        { id: "fake-05", label: "D(fake) = 0,5", parameters: { fake_score: 0.5 }, expectedOutput: "D(fake)=0.5\ndiscriminator_loss=0.399\ngenerator_loss=0.693", observation: "Ảnh giả ở ranh giới 50%; hai loss đều hữu hạn và trò chơi bớt lệch.", illustration: bars("Loss tại D(fake)=0,5", "Hai mạng nhận tín hiệu cập nhật vừa phải.", [{ label: "Discriminator", value: 0.399, tone: "accent" }, { label: "Generator", value: 0.693, tone: "accent" }], 2.5) },
        { id: "fake-09", label: "D(fake) = 0,9", parameters: { fake_score: 0.9 }, expectedOutput: "D(fake)=0.9\ndiscriminator_loss=1.204\ngenerator_loss=0.105", observation: "Generator đang đánh lừa tốt; discriminator chịu loss lớn vì gọi ảnh giả là thật.", illustration: bars("Loss tại D(fake)=0,9", "Áp lực cập nhật chuyển sang discriminator.", [{ label: "Discriminator", value: 1.204, tone: "warn" }, { label: "Generator", value: 0.105, tone: "good" }], 2.5) },
      ],
    },
    transferQuestion: "Ngoài hai loss, bạn cần xem thêm dấu hiệu nào trên mẫu sinh để phát hiện mode collapse?",
  },

  "cv-10-self-supervised": {
    lessonId: "cv-10-self-supervised",
    scenario: {
      title: "Kéo hai crop của cùng chiếc lá lại gần trong không gian biểu diễn",
      context:
        "Một anchor có cosine similarity 0,8 với crop dương của cùng ảnh và 0,2; 0,0 với hai ảnh âm. Contrastive learning phải biến ba similarity thành xác suất chọn đúng positive.",
      goal: "Tính InfoNCE ổn định và quan sát temperature điều khiển độ sắc của phân phối so sánh.",
    },
    inputs: [{ label: "Cosine similarities", format: "python", value: "positive=0.8, negatives=[0.2, 0.0]" }],
    python: {
      title: "InfoNCE cho một anchor",
      filename: "infonce_temperature.py",
      codeTemplate: `from math import exp, log

similarities = [0.8, 0.2, 0.0]  # positive đứng đầu
temperature = {{temperature}}
scaled = [value / temperature for value in similarities]
maximum = max(scaled)
weights = [exp(value - maximum) for value in scaled]
positive_probability = weights[0] / sum(weights)
loss = -log(positive_probability)

print(f"temperature={temperature:g}")
print(f"positive_probability={positive_probability:.3f}")
print(f"InfoNCE={loss:.3f}")`,
    },
    explanation: [
      { title: "Positive cạnh tranh với toàn bộ negatives", text: "Mẫu số chứa cả ba cặp; loss thấp khi similarity dương vượt rõ các similarity âm." },
      { title: "Temperature chia logit", text: "T nhỏ phóng đại chênh lệch cosine, làm xác suất rất sắc và gradient tập trung vào negative khó." },
      { title: "Ổn định số giống softmax", text: "Trừ maximum trước exp giữ nguyên xác suất nhưng tránh overflow khi temperature nhỏ." },
    ],
    experiment: {
      question: "Temperature nhỏ có luôn tốt hơn, hay có thể làm mô hình quá tự tin vào chênh lệch nhỏ?",
      parameterLabels: { temperature: "Temperature contrastive" },
      defaultVariantId: "temp-05",
      variants: [
        { id: "temp-01", label: "T = 0,1", parameters: { temperature: 0.1 }, expectedOutput: "temperature=0.1\npositive_probability=0.997\nInfoNCE=0.003", observation: "Chênh cosine 0,6 được khuếch đại thành tỉ số rất lớn; positive gần như chắc chắn.", illustration: bars("Xác suất chọn cặp", "T = 0,1 tạo phân phối rất sắc.", [{ label: "Positive", value: 0.997, tone: "good" }, { label: "Negative 1", value: 0.0025 }, { label: "Negative 2", value: 0.0003 }]) },
        { id: "temp-05", label: "T = 0,5", parameters: { temperature: 0.5 }, expectedOutput: "temperature=0.5\npositive_probability=0.665\nInfoNCE=0.408", observation: "Positive vẫn dẫn rõ nhưng hai negative còn góp gradient đáng kể.", illustration: bars("Xác suất chọn cặp", "T = 0,5 giữ cạnh tranh vừa phải.", [{ label: "Positive", value: 0.665, tone: "good" }, { label: "Negative 1", value: 0.2 }, { label: "Negative 2", value: 0.134 }]) },
        { id: "temp-10", label: "T = 1", parameters: { temperature: 1 }, expectedOutput: "temperature=1\npositive_probability=0.500\nInfoNCE=0.692", observation: "Phân phối phẳng hơn; positive chỉ nhận khoảng một nửa xác suất dù cosine cao nhất.", illustration: bars("Xác suất chọn cặp", "T = 1 làm các cặp gần nhau hơn trên softmax.", [{ label: "Positive", value: 0.5, tone: "good" }, { label: "Negative 1", value: 0.275 }, { label: "Negative 2", value: 0.225 }]) },
      ],
    },
    transferQuestion: "Khi batch có nhiều negative gần giống anchor, bạn dự đoán loss và yêu cầu batch size thay đổi thế nào?",
  },

  "cv-11-clip": {
    lessonId: "cv-11-clip",
    scenario: {
      title: "Ghép ảnh sản phẩm với hai mô tả bằng CLIP",
      context:
        "Hai embedding ảnh và hai embedding mô tả đã được chuẩn hóa cho ma trận cosine [[0,9;0,2],[0,3;0,8]]. Hệ thống tìm kiếm cần biết logit scale làm độ tin cậy ghép cặp thay đổi ra sao.",
      goal: "Nhân similarity với scale, softmax theo từng ảnh và báo mô tả tốt nhất cùng xác suất của nó.",
    },
    inputs: [{ label: "Ma trận cosine", format: "python", value: "[[0.9, 0.2], [0.3, 0.8]]" }],
    python: {
      title: "Image-to-text softmax",
      filename: "clip_retrieval.py",
      codeTemplate: `from math import exp

similarity = [[0.9, 0.2], [0.3, 0.8]]
scale = {{scale}}
matches = []
confidences = []
for image_index, row in enumerate(similarity):
    logits = [value * scale for value in row]
    maximum = max(logits)
    weights = [exp(value - maximum) for value in logits]
    probabilities = [value / sum(weights) for value in weights]
    caption_index = max(range(len(row)), key=probabilities.__getitem__)
    matches.append(f"image{image_index}->caption{caption_index}")
    confidences.append(probabilities[caption_index])

print(f"scale={scale:g}")
print("matches=" + ",".join(matches))
print("confidence=" + ",".join(f"{value:.3f}" for value in confidences))`,
    },
    explanation: [
      { title: "Chuẩn hóa biến dot product thành cosine", text: "Khi embedding có norm 1, tích vô hướng đo hướng tương đồng thay vì bị độ dài vector chi phối." },
      { title: "Softmax chạy theo truy vấn ảnh", text: "Mỗi hàng cạnh tranh hai caption; softmax theo cột sẽ trả lời câu hỏi ngược là ảnh nào hợp mỗi caption." },
      { title: "Scale không đổi argmax", text: "Với scale dương, thứ tự similarity giữ nguyên nhưng xác suất được làm sắc hoặc phẳng." },
    ],
    experiment: {
      question: "Vì sao scale lớn làm confidence gần 1 dù ma trận similarity không đổi?",
      parameterLabels: { scale: "Logit scale" },
      defaultVariantId: "scale-5",
      variants: [
        { id: "scale-1", label: "Scale 1", parameters: { scale: 1 }, expectedOutput: "scale=1\nmatches=image0->caption0,image1->caption1\nconfidence=0.668,0.622", observation: "Hai ghép cặp đúng nhưng confidence còn dè dặt vì chênh cosine chỉ 0,7 và 0,5.", illustration: { kind: "matrix", title: "Cosine ảnh–mô tả", caption: "Đường chéo có similarity lớn nhất.", rows: ["Ảnh 0", "Ảnh 1"], columns: ["Mô tả 0", "Mô tả 1"], values: [[0.9, 0.2], [0.3, 0.8]], scale: "sequential" } },
        { id: "scale-5", label: "Scale 5", parameters: { scale: 5 }, expectedOutput: "scale=5\nmatches=image0->caption0,image1->caption1\nconfidence=0.971,0.924", observation: "Scale khuếch đại khoảng cách, đưa confidence hai cặp lên trên 92%.", illustration: bars("Confidence ghép cặp", "Cả hai hàng softmax đều trở nên sắc.", [{ label: "Ảnh 0 ↔ mô tả 0", value: 0.971, tone: "good" }, { label: "Ảnh 1 ↔ mô tả 1", value: 0.924, tone: "good" }]) },
        { id: "scale-10", label: "Scale 10", parameters: { scale: 10 }, expectedOutput: "scale=10\nmatches=image0->caption0,image1->caption1\nconfidence=0.999,0.993", observation: "Confidence gần bão hòa; nếu similarity sai do domain shift, hệ thống vẫn có thể rất tự tin một cách nguy hiểm.", illustration: bars("Confidence ghép cặp", "Softmax gần one-hot dù cosine gốc giữ nguyên.", [{ label: "Ảnh 0 ↔ mô tả 0", value: 0.999, tone: "warn" }, { label: "Ảnh 1 ↔ mô tả 1", value: 0.993, tone: "warn" }]) },
      ],
    },
    transferQuestion: "Muốn đánh giá retrieval nhiều mô tả cho một ảnh, bạn sẽ dùng Recall@K thế nào thay cho chỉ nhìn top-1?",
  },

  "cv-12-diffusion": {
    lessonId: "cv-12-diffusion",
    scenario: {
      title: "Theo dõi một pixel qua forward diffusion",
      context:
        "Một pixel chuẩn hóa x₀ = 1 và nhiễu cố định ε = −0,5 được trộn theo alpha_bar. Cùng một epsilon giúp ta tách ảnh hưởng của lịch nhiễu khỏi ngẫu nhiên khi so sánh ba thời điểm.",
      goal: "Tính x_t = sqrt(alpha_bar)x₀ + sqrt(1−alpha_bar)ε và tỉ số tín hiệu trên nhiễu.",
    },
    inputs: [{ label: "Pixel và nhiễu", format: "text", value: "x₀ = 1.0 · ε = -0.5" }],
    python: {
      title: "Forward noising một chiều",
      filename: "diffusion_forward.py",
      codeTemplate: `from math import sqrt

x0 = 1.0
epsilon = -0.5
alpha_bar = {{alpha_bar}}
xt = sqrt(alpha_bar) * x0 + sqrt(1 - alpha_bar) * epsilon
snr = alpha_bar / (1 - alpha_bar)

print(f"alpha_bar={alpha_bar:g}")
print(f"x_t={xt:.3f}")
print(f"snr={snr:.3f}")`,
    },
    explanation: [
      { title: "Hai hệ số giữ phương sai có kiểm soát", text: "Căn alpha_bar giữ phần tín hiệu; căn 1−alpha_bar điều chỉnh phần nhiễu." },
      { title: "alpha_bar giảm theo thời gian", text: "Đầu chuỗi, x_t còn gần x₀; cuối chuỗi, thành phần epsilon chi phối nhiều hơn." },
      { title: "SNR định lượng độ khó denoise", text: "SNR cao nghĩa là tín hiệu rõ; SNR thấp buộc mô hình suy ra cấu trúc từ quan sát rất nhiễu." },
    ],
    experiment: {
      question: "Khi alpha_bar giảm, pixel và SNR dịch chuyển theo hướng nào với epsilon cố định này?",
      parameterLabels: { alpha_bar: "Alpha tích lũy" },
      defaultVariantId: "alpha-05",
      variants: [
        { id: "alpha-09", label: "alpha_bar = 0,9", parameters: { alpha_bar: 0.9 }, expectedOutput: "alpha_bar=0.9\nx_t=0.791\nsnr=9.000", observation: "Tín hiệu gấp chín lần nhiễu theo SNR; x_t vẫn gần pixel gốc 1.", illustration: sequence("Bước nhiễu nhẹ", "Thành phần tín hiệu còn chiếm ưu thế.", [{ label: "x₀", value: "1,000", tone: "good" }, { label: "Trộn ε", value: "−0,5" }, { label: "x_t", value: "0,791", tone: "accent" }]) },
        { id: "alpha-05", label: "alpha_bar = 0,5", parameters: { alpha_bar: 0.5 }, expectedOutput: "alpha_bar=0.5\nx_t=0.354\nsnr=1.000", observation: "Năng lượng tín hiệu và nhiễu cân bằng; dấu của x_t vẫn dương vì x₀ mạnh hơn epsilon âm.", illustration: sequence("Bước nhiễu giữa", "SNR bằng 1: tín hiệu và nhiễu cân bằng.", [{ label: "x₀", value: "1,000" }, { label: "Trộn ε", value: "−0,5" }, { label: "x_t", value: "0,354", tone: "accent" }]) },
        { id: "alpha-01", label: "alpha_bar = 0,1", parameters: { alpha_bar: 0.1 }, expectedOutput: "alpha_bar=0.1\nx_t=-0.158\nsnr=0.111", observation: "Nhiễu chi phối và kéo pixel qua giá trị âm; bài toán denoise khó hơn rõ rệt.", illustration: sequence("Bước nhiễu mạnh", "SNR chỉ còn khoảng 0,111.", [{ label: "x₀", value: "1,000" }, { label: "Trộn ε", value: "−0,5", tone: "warn" }, { label: "x_t", value: "−0,158", tone: "warn" }]) },
      ],
    },
    transferQuestion: "Trong huấn luyện thật, vì sao phải lấy epsilon mới cho mỗi mẫu thay vì cố định như ví dụ kiểm chứng này?",
  },

  "cv-13-vision-transformer": {
    lessonId: "cv-13-vision-transformer",
    scenario: {
      title: "Biến ảnh vệ tinh 4×4 thành chuỗi patch token",
      context:
        "Một ảnh xám toy 4×4 có cường độ 1 đến 16. Trước transformer, ảnh được chia thành các patch không chồng lấp và mỗi patch được tóm tắt bằng giá trị trung bình để nhìn rõ tác động của patch size.",
      goal: "Tạo chuỗi patch theo thứ tự hàng, đếm token và xem patch lớn đánh đổi độ phân giải không gian lấy chuỗi ngắn.",
    },
    inputs: [{ label: "Ảnh 4×4", format: "python", value: "[[1,2,3,4],[5,6,7,8],[9,10,11,12],[13,14,15,16]]" }],
    python: {
      title: "Patchify và mean pooling từng patch",
      filename: "vit_patchify.py",
      codeTemplate: `image = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]]
patch = {{patch}}
if 4 % patch:
    raise ValueError("patch phải chia hết kích thước ảnh")

means = []
for top in range(0, 4, patch):
    for left in range(0, 4, patch):
        values = [image[row][col]
                  for row in range(top, top + patch)
                  for col in range(left, left + patch)]
        means.append(sum(values) / len(values))

print(f"patch={patch}")
print(f"tokens={len(means)}")
print("means=" + ",".join(f"{value:.1f}" for value in means))`,
    },
    explanation: [
      { title: "Patch không chồng lấp", text: "Hai vòng lặp nhảy đúng patch pixel nên mỗi pixel thuộc chính xác một token." },
      { title: "Thứ tự chuỗi phải xác định", text: "Code quét từ trái sang phải rồi trên xuống dưới; positional embedding sau đó cho transformer biết vị trí này." },
      { title: "Mean chỉ là phép chiếu minh họa", text: "ViT thật trải phẳng patch rồi dùng linear projection để giữ nhiều đặc trưng hơn một số trung bình." },
    ],
    experiment: {
      question: "Patch size tăng làm số token và chi phí self-attention thay đổi thế nào?",
      parameterLabels: { patch: "Cạnh patch" },
      defaultVariantId: "patch-2",
      variants: [
        { id: "patch-1", label: "Patch 1×1", parameters: { patch: 1 }, expectedOutput: "patch=1\ntokens=16\nmeans=1.0,2.0,3.0,4.0,5.0,6.0,7.0,8.0,9.0,10.0,11.0,12.0,13.0,14.0,15.0,16.0", observation: "Mỗi pixel là một token; giữ vị trí chi tiết nhất nhưng attention phải xử lý 16 token.", illustration: { kind: "tokens", title: "16 pixel token", caption: "Chuỗi dài nhất, mỗi token chứa một cường độ.", items: Array.from({ length: 16 }, (_, index) => ({ label: String(index + 1), weight: (index + 1) / 16 })) } },
        { id: "patch-2", label: "Patch 2×2", parameters: { patch: 2 }, expectedOutput: "patch=2\ntokens=4\nmeans=3.5,5.5,11.5,13.5", observation: "Chuỗi giảm còn bốn token; mỗi token gộp bốn pixel lân cận.", illustration: { kind: "matrix", title: "Bốn patch mean", caption: "Mỗi ô là một patch 2×2 của ảnh gốc.", rows: ["Trên", "Dưới"], columns: ["Trái", "Phải"], values: [[3.5, 5.5], [11.5, 13.5]], scale: "sequential" } },
        { id: "patch-4", label: "Patch 4×4", parameters: { patch: 4 }, expectedOutput: "patch=4\ntokens=1\nmeans=8.5", observation: "Toàn ảnh thành một token; self-attention rẻ nhưng không còn cấu trúc vị trí nội ảnh.", illustration: { kind: "tokens", title: "Một token toàn ảnh", caption: "Mean 8,5 không thể nói vùng sáng nằm ở đâu.", items: [{ label: "Toàn ảnh", weight: 0.531, tone: "warn" }] } },
      ],
    },
    transferQuestion: "Với ảnh 224×224, patch 16 tạo bao nhiêu token trước khi thêm CLS token, và attention có bao nhiêu cặp token?",
  },
  "nlp-01-tokenization-embeddings": {
    lessonId: "nlp-01-tokenization-embeddings",
    scenario: { title: "Biến câu hỏi tiếng Việt thành dãy ID có thể kiểm tra", context: "Một bộ tìm kiếm nhận câu ‘AI học từ dữ liệu mới’. Trước khi chạy mô hình, nhóm cần thấy tokenizer tạo token nào, ánh xạ ID nào và việc cắt độ dài làm mất phần nào của câu.", goal: "Tokenize bằng khoảng trắng toy, lookup vocabulary và tính embedding vô hướng trung bình cho phần câu còn lại." },
    inputs: [
      { label: "Câu đầu vào", format: "text", value: "AI học từ dữ liệu mới" },
      { label: "Vocabulary toy", format: "python", value: "{'ai':1, 'học':2, 'từ':3, 'dữ':4, 'liệu':5, 'mới':6}" },
    ],
    python: { title: "Tokenizer và lookup embedding tối giản", filename: "tokenize_lookup.py", codeTemplate: `text = "AI học từ dữ liệu mới"
vocabulary = {"ai": 1, "học": 2, "từ": 3, "dữ": 4, "liệu": 5, "mới": 6}
max_tokens = {{max_tokens}}
tokens = text.lower().split()[:max_tokens]
ids = [vocabulary.get(token, 0) for token in tokens]
embedding_mean = sum(ids) / len(ids)
print(f"max_tokens={max_tokens}")
print("tokens=" + "|".join(tokens))
print("ids=" + ",".join(map(str, ids)))
print(f"embedding_mean={embedding_mean:.2f}")` },
    explanation: [
      { title: "Chuẩn hóa trước lookup", text: "lower biến AI thành ai để khớp vocabulary; tokenizer thật còn phải xử lý dấu câu, Unicode và subword." },
      { title: "ID chỉ là địa chỉ", text: "Ví dụ dùng ID làm embedding vô hướng để phép tính nhìn thấy được; mô hình thật tra một vector học được cho mỗi ID." },
      { title: "Truncation đổi ngữ nghĩa", text: "Cắt cuối câu làm mất ‘dữ liệu mới’; max length không chỉ là tối ưu bộ nhớ mà có thể đổi thông tin đầu vào." },
    ],
    experiment: { question: "Cắt chuỗi sớm làm token, ID và biểu diễn trung bình thay đổi ra sao?", parameterLabels: { max_tokens: "Số token tối đa" }, defaultVariantId: "tokens-4", variants: [
      { id: "tokens-2", label: "Giữ 2 token", parameters: { max_tokens: 2 }, expectedOutput: "max_tokens=2\ntokens=ai|học\nids=1,2\nembedding_mean=1.50", observation: "Câu chỉ còn chủ đề và động từ; đối tượng ‘dữ liệu mới’ biến mất.", illustration: { kind: "tokens", title: "Chuỗi sau truncation 2", caption: "Hai token còn trong input model.", items: [{ label: "ai", weight: 1 / 6 }, { label: "học", weight: 2 / 6, tone: "accent" }] } },
      { id: "tokens-4", label: "Giữ 4 token", parameters: { max_tokens: 4 }, expectedOutput: "max_tokens=4\ntokens=ai|học|từ|dữ\nids=1,2,3,4\nembedding_mean=2.50", observation: "‘dữ’ bị tách khỏi ‘liệu’, cho thấy ranh giới token tiếng Việt cần được cân nhắc.", illustration: { kind: "tokens", title: "Chuỗi sau truncation 4", caption: "Một từ ghép bị cắt giữa ranh giới tiếng.", items: [{ label: "ai" }, { label: "học" }, { label: "từ" }, { label: "dữ", tone: "warn" }] } },
      { id: "tokens-6", label: "Giữ đủ 6 token", parameters: { max_tokens: 6 }, expectedOutput: "max_tokens=6\ntokens=ai|học|từ|dữ|liệu|mới\nids=1,2,3,4,5,6\nembedding_mean=3.50", observation: "Toàn bộ câu được giữ và từ khóa ‘mới’ không bị mất.", illustration: { kind: "tokens", title: "Chuỗi đầy đủ", caption: "Sáu token theo đúng thứ tự câu.", items: [{ label: "ai" }, { label: "học" }, { label: "từ" }, { label: "dữ" }, { label: "liệu" }, { label: "mới", tone: "good" }] } },
    ] },
    transferQuestion: "Với từ chưa từng thấy, bạn sẽ dùng UNK, character hay subword để tránh mất toàn bộ thông tin?",
  },

  "nlp-02-text-classification": {
    lessonId: "nlp-02-text-classification",
    scenario: { title: "Phân loại phản hồi giao hàng cần xử lý", context: "Phản hồi ‘good fast but noisy’ tạo logit 0,4 từ bốn trọng số từ khóa. Xác suất mô hình cố định, nhưng ngưỡng nghiệp vụ quyết định tự gắn nhãn tích cực hay chuyển sang kiểm tra.", goal: "Tính bag-of-words logit, sigmoid và tách xác suất mô hình khỏi ngưỡng quyết định." },
    inputs: [
      { label: "Phản hồi", format: "text", value: "good fast but noisy" },
      { label: "Trọng số", format: "python", value: "good=1.2, fast=0.8, but=-0.5, noisy=-1.1" },
    ],
    python: { title: "Logistic text classifier có ngưỡng", filename: "review_classifier.py", codeTemplate: `from math import exp
tokens = "good fast but noisy".split()
weights = {"good": 1.2, "fast": 0.8, "but": -0.5, "noisy": -1.1}
threshold = {{threshold}}
logit = sum(weights.get(token, 0) for token in tokens)
probability = 1 / (1 + exp(-logit))
label = "positive" if probability >= threshold else "review"
print(f"logit={logit:.2f}")
print(f"probability={probability:.3f}")
print(f"threshold={threshold:.2f}")
print(f"label={label}")` },
    explanation: [
      { title: "Token đóng góp vào logit", text: "good và fast kéo logit lên; but và noisy kéo xuống. Tổng 0,4 nghiêng dương nhưng không áp đảo." },
      { title: "Sigmoid tạo xác suất", text: "Sigmoid đưa logit thật vào miền (0,1); logit 0,4 cho xác suất khoảng 0,599." },
      { title: "Ngưỡng thuộc quyết định", text: "Đổi threshold không đổi mô hình; nó chỉ đổi hành động theo chi phí false positive và false negative." },
    ],
    experiment: { question: "Ở ngưỡng nào phản hồi đổi từ positive sang review?", parameterLabels: { threshold: "Ngưỡng nhãn dương" }, defaultVariantId: "threshold-060", variants: [
      { id: "threshold-040", label: "Ngưỡng 0,40", parameters: { threshold: 0.4 }, expectedOutput: "logit=0.40\nprobability=0.599\nthreshold=0.40\nlabel=positive", observation: "Mẫu vượt ngưỡng và được tự động gắn tích cực.", illustration: bars("Xác suất và ngưỡng 0,40", "Xác suất nằm trên ngưỡng.", [{ label: "P(tích cực)", value: 0.599, tone: "good" }, { label: "Ngưỡng", value: 0.4, tone: "accent" }]) },
      { id: "threshold-060", label: "Ngưỡng 0,60", parameters: { threshold: 0.6 }, expectedOutput: "logit=0.40\nprobability=0.599\nthreshold=0.60\nlabel=review", observation: "Chênh chỉ 0,001 nhưng giá trị thật thấp hơn ngưỡng; không được quyết định bằng số đã làm tròn.", illustration: bars("Xác suất và ngưỡng 0,60", "Hai giá trị gần nhau nhưng quyết định khác.", [{ label: "P(tích cực)", value: 0.599, tone: "warn" }, { label: "Ngưỡng", value: 0.6, tone: "accent" }]) },
      { id: "threshold-080", label: "Ngưỡng 0,80", parameters: { threshold: 0.8 }, expectedOutput: "logit=0.40\nprobability=0.599\nthreshold=0.80\nlabel=review", observation: "Quy tắc thận trọng tăng precision của nhãn positive nhưng gửi nhiều mẫu sang kiểm tra.", illustration: bars("Xác suất và ngưỡng 0,80", "Khoảng cách tới ngưỡng đủ lớn.", [{ label: "P(tích cực)", value: 0.599, tone: "warn" }, { label: "Ngưỡng", value: 0.8, tone: "accent" }]) },
    ] },
    transferQuestion: "Nếu chỉ 5% phản hồi thật sự tích cực, precision–recall curve giúp chọn threshold tốt hơn accuracy ra sao?",
  },
  "nlp-03-bert": {
    lessonId: "nlp-03-bert",
    scenario: { title: "Che một token trong thông báo phí ngân hàng", context: "Câu toy ‘[CLS] ngân hàng tăng phí [SEP]’ dùng cho masked language modeling. Ta che một từ nội dung rồi tóm tắt ngữ cảnh còn lại để thấy target chỉ nằm ở vị trí bị mask.", goal: "Tạo input có [MASK], giữ target gốc và tính context mean từ các token nội dung chưa bị che." },
    inputs: [{ label: "Token", format: "python", value: "['[CLS]','ngân','hàng','tăng','phí','[SEP]']" }],
    python: { title: "Masked-token example có target riêng", filename: "bert_masking.py", codeTemplate: `tokens = ["[CLS]", "ngân", "hàng", "tăng", "phí", "[SEP]"]
embedding = {"ngân": 1, "hàng": 3, "tăng": 6, "phí": 8}
mask_index = {{mask_index}}
if mask_index not in range(1, len(tokens) - 1):
    raise ValueError("chỉ mask token nội dung")
target = tokens[mask_index]
masked = tokens.copy()
masked[mask_index] = "[MASK]"
context_values = [embedding[token] for index, token in enumerate(tokens)
                  if index != mask_index and token in embedding]
print("masked=" + " ".join(masked))
print(f"target={target}")
print(f"context_mean={sum(context_values) / len(context_values):.2f}")` },
    explanation: [
      { title: "Input và target tách nhau", text: "Mô hình nhận [MASK], còn loss so dự đoán tại vị trí đó với token gốc lưu riêng." },
      { title: "Ngữ cảnh hai chiều", text: "Token bị che dùng cả từ bên trái và bên phải, khác language model nhân quả chỉ nhìn quá khứ." },
      { title: "Mean chỉ là minh họa", text: "BERT thật dùng nhiều lớp self-attention; phép trung bình chỉ làm dòng dữ liệu có thể kiểm chứng bằng tay." },
    ],
    experiment: { question: "Che vị trí khác làm target và thống kê ngữ cảnh đổi thế nào?", parameterLabels: { mask_index: "Vị trí token bị che" }, defaultVariantId: "mask-tang", variants: [
      { id: "mask-ngan", label: "Che ‘ngân’", parameters: { mask_index: 1 }, expectedOutput: "masked=[CLS] [MASK] hàng tăng phí [SEP]\ntarget=ngân\ncontext_mean=5.67", observation: "Ngữ cảnh còn hàng, tăng, phí; mean cao vì bỏ embedding 1 của ‘ngân’.", illustration: { kind: "tokens", title: "Mask token 1", caption: "Target không xuất hiện trong input.", items: [{ label: "[CLS]" }, { label: "[MASK]", tone: "warn" }, { label: "hàng" }, { label: "tăng" }, { label: "phí" }, { label: "[SEP]" }] } },
      { id: "mask-tang", label: "Che ‘tăng’", parameters: { mask_index: 3 }, expectedOutput: "masked=[CLS] ngân hàng [MASK] phí [SEP]\ntarget=tăng\ncontext_mean=4.00", observation: "Cụm ‘ngân hàng … phí’ mang tín hiệu mạnh để đoán động từ.", illustration: { kind: "tokens", title: "Mask token 3", caption: "Attention nhìn cả cụm trước và từ phía sau.", items: [{ label: "[CLS]" }, { label: "ngân" }, { label: "hàng" }, { label: "[MASK]", tone: "warn" }, { label: "phí" }, { label: "[SEP]" }] } },
      { id: "mask-phi", label: "Che ‘phí’", parameters: { mask_index: 4 }, expectedOutput: "masked=[CLS] ngân hàng tăng [MASK] [SEP]\ntarget=phí\ncontext_mean=3.33", observation: "Target cuối câu còn ngữ cảnh nội dung bên trái; [SEP] chỉ đánh dấu biên.", illustration: { kind: "tokens", title: "Mask token 4", caption: "Token đích nằm ngay trước [SEP].", items: [{ label: "[CLS]" }, { label: "ngân" }, { label: "hàng" }, { label: "tăng" }, { label: "[MASK]", tone: "warn" }, { label: "[SEP]" }] } },
    ] },
    transferQuestion: "Nếu luôn thay 100% token được chọn bằng [MASK], vì sao sẽ tạo chênh lệch giữa pretraining và fine-tuning?",
  },

  "nlp-04-language-modeling": {
    lessonId: "nlp-04-language-modeling",
    scenario: { title: "Chọn từ tiếp theo cho câu ‘mô hình …’", context: "Corpus toy đếm sau cụm ‘mô hình’ có ‘học’ 6 lần, ‘dự’ 3 lần và ‘sai’ 1 lần. Temperature sampling phải đổi độ sắc mà không đổi từ có xác suất cao nhất.", goal: "Dùng log-count làm logit, áp temperature và in xác suất ba token kế tiếp." },
    inputs: [{ label: "Bigram count", format: "python", value: "{'học': 6, 'dự': 3, 'sai': 1}" }],
    python: { title: "Temperature trên phân phối next-token", filename: "next_token.py", codeTemplate: `from math import exp, log
counts = {"học": 6, "dự": 3, "sai": 1}
temperature = {{temperature}}
tokens = list(counts)
logits = [log(counts[token]) / temperature for token in tokens]
maximum = max(logits)
weights = [exp(value - maximum) for value in logits]
probabilities = [value / sum(weights) for value in weights]
print(f"temperature={temperature:g}")
print("probabilities=" + ",".join(f"{token}:{probability:.3f}" for token, probability in zip(tokens, probabilities)))
print(f"greedy={tokens[max(range(len(tokens)), key=probabilities.__getitem__)]}")` },
    explanation: [
      { title: "Count thành xác suất tại T = 1", text: "Tổng count bằng 10 nên phân phối gốc là 0,6; 0,3; 0,1." },
      { title: "Temperature tác động trong log-space", text: "Chia logit cho T tương đương nâng count lên lũy thừa 1/T rồi chuẩn hóa." },
      { title: "Greedy không phải sampling", text: "argmax luôn chọn ‘học’; sampling mới dùng toàn phân phối và có thể tạo token ít phổ biến." },
    ],
    experiment: { question: "Temperature nào tăng đa dạng nhưng vẫn giữ ‘học’ là top-1?", parameterLabels: { temperature: "Temperature sinh token" }, defaultVariantId: "lm-temp-1", variants: [
      { id: "lm-temp-05", label: "T = 0,5", parameters: { temperature: 0.5 }, expectedOutput: "temperature=0.5\nprobabilities=học:0.783,dự:0.196,sai:0.022\ngreedy=học", observation: "Count bị bình phương tương đối; từ phổ biến nhất gần như chi phối.", illustration: bars("Next-token với T = 0,5", "Phân phối sắc, ít đa dạng.", [{ label: "học", value: 0.783, tone: "good" }, { label: "dự", value: 0.196 }, { label: "sai", value: 0.022 }]) },
      { id: "lm-temp-1", label: "T = 1", parameters: { temperature: 1 }, expectedOutput: "temperature=1\nprobabilities=học:0.600,dự:0.300,sai:0.100\ngreedy=học", observation: "Phân phối khớp đúng tần suất bigram quan sát.", illustration: bars("Next-token với T = 1", "Xác suất tỉ lệ trực tiếp với count.", [{ label: "học", value: 0.6, tone: "good" }, { label: "dự", value: 0.3 }, { label: "sai", value: 0.1 }]) },
      { id: "lm-temp-2", label: "T = 2", parameters: { temperature: 2 }, expectedOutput: "temperature=2\nprobabilities=học:0.473,dự:0.334,sai:0.193\ngreedy=học", observation: "Token hiếm ‘sai’ tăng gần gấp đôi xác suất; đa dạng và rủi ro cùng tăng.", illustration: bars("Next-token với T = 2", "Ba lựa chọn trở nên gần nhau hơn.", [{ label: "học", value: 0.473, tone: "good" }, { label: "dự", value: 0.334 }, { label: "sai", value: 0.193, tone: "warn" }]) },
    ] },
    transferQuestion: "Top-k hoặc nucleus sampling loại token ‘sai’ khác temperature scaling như thế nào?",
  },
  "nlp-05-encoder-decoder": {
    lessonId: "nlp-05-encoder-decoder",
    scenario: { title: "Theo dõi decoder dịch câu ngắn đến EOS", context: "Encoder đã mã hóa câu ‘xin chào’. Decoder toy dự đoán lần lượt hello, world và EOS. Giới hạn bước quá ngắn trả bản dịch cụt dù mỗi token trước đó đúng.", goal: "Chạy vòng lặp autoregressive, dừng khi gặp EOS và phân biệt dừng tự nhiên với hết max_steps." },
    inputs: [{ label: "Chuỗi dự đoán toy", format: "python", value: "['hello', 'world', '<EOS>']" }],
    python: { title: "Greedy decoder có điều kiện dừng", filename: "greedy_decoder.py", codeTemplate: `predicted_stream = ["hello", "world", "<EOS>"]
max_steps = {{max_steps}}
output = []
stopped_on_eos = False
steps_used = 0
for token in predicted_stream[:max_steps]:
    steps_used += 1
    if token == "<EOS>":
        stopped_on_eos = True
        break
    output.append(token)
print(f"max_steps={max_steps}")
print("translation=" + " ".join(output))
print(f"stopped_on_eos={stopped_on_eos}")
print(f"steps_used={steps_used}")` },
    explanation: [
      { title: "Output trước thành input sau", text: "Decoder autoregressive dùng token vừa chọn để dự đoán bước kế tiếp; lỗi sớm có thể lan cả chuỗi." },
      { title: "EOS không thuộc câu hiển thị", text: "EOS là tín hiệu điều khiển nên vòng lặp dừng trước khi append token này." },
      { title: "max_steps là hàng rào", text: "Nó ngăn chạy vô hạn khi mô hình không phát EOS, nhưng đặt quá thấp gây truncation." },
    ],
    experiment: { question: "Giới hạn bao nhiêu bước mới cho phép decoder xác nhận EOS?", parameterLabels: { max_steps: "Số bước decode tối đa" }, defaultVariantId: "decode-2", variants: [
      { id: "decode-1", label: "Tối đa 1 bước", parameters: { max_steps: 1 }, expectedOutput: "max_steps=1\ntranslation=hello\nstopped_on_eos=False\nsteps_used=1", observation: "Bản dịch bị cắt sau token đầu và chưa kết thúc tự nhiên.", illustration: sequence("Decode 1 bước", "max_steps chặn trước khi sinh đủ câu.", [{ label: "BOS" }, { label: "hello", tone: "accent" }, { label: "Dừng do giới hạn", tone: "warn" }], "timeline") },
      { id: "decode-2", label: "Tối đa 2 bước", parameters: { max_steps: 2 }, expectedOutput: "max_steps=2\ntranslation=hello world\nstopped_on_eos=False\nsteps_used=2", observation: "Nội dung trông hoàn chỉnh nhưng decoder chưa phát EOS; không nên suy đoán trạng thái dừng.", illustration: sequence("Decode 2 bước", "Hai từ đã có nhưng EOS chưa được đọc.", [{ label: "BOS" }, { label: "hello" }, { label: "world", tone: "accent" }, { label: "Dừng do giới hạn", tone: "warn" }], "timeline") },
      { id: "decode-4", label: "Tối đa 4 bước", parameters: { max_steps: 4 }, expectedOutput: "max_steps=4\ntranslation=hello world\nstopped_on_eos=True\nsteps_used=3", observation: "Decoder gặp EOS ở bước 3 và dừng sớm, không dùng hết ngân sách.", illustration: sequence("Decode đến EOS", "Vòng lặp kết thúc tự nhiên ở bước ba.", [{ label: "BOS" }, { label: "hello" }, { label: "world" }, { label: "EOS", tone: "good" }], "timeline") },
    ] },
    transferQuestion: "Beam search phải lưu trạng thái finished của từng giả thuyết thế nào để không mở rộng chuỗi đã gặp EOS?",
  },

  "nlp-06-pretrained-and-api": {
    lessonId: "nlp-06-pretrained-and-api",
    scenario: { title: "Kiểm tra response API trước khi tự động hóa", context: "Dịch vụ pretrained trả ba nhãn với confidence 0,92; 0,68 và 0,41. Pipeline phải xác nhận schema và áp ngưỡng trước khi chuyển kết quả sang hệ thống nghiệp vụ.", goal: "Parse JSON mô phỏng cục bộ, kiểm tra từng item và tách nhãn accepted khỏi nhánh fallback." },
    inputs: [{ label: "Response mô phỏng", format: "json", value: "{\"predictions\":[{\"label\":\"billing\",\"confidence\":0.92},{\"label\":\"technical\",\"confidence\":0.68},{\"label\":\"other\",\"confidence\":0.41}]}" }],
    python: { title: "Schema guard và confidence gate", filename: "validate_api_response.py", codeTemplate: `import json
payload = json.loads('{"predictions":[{"label":"billing","confidence":0.92},{"label":"technical","confidence":0.68},{"label":"other","confidence":0.41}]}')
min_confidence = {{min_confidence}}
predictions = payload.get("predictions")
if not isinstance(predictions, list):
    raise ValueError("predictions phải là list")
for item in predictions:
    if not isinstance(item.get("label"), str) or not isinstance(item.get("confidence"), (int, float)):
        raise ValueError("prediction sai schema")
    if not 0 <= item["confidence"] <= 1:
        raise ValueError("confidence ngoài [0,1]")
accepted = [item["label"] for item in predictions if item["confidence"] >= min_confidence]
print(f"min_confidence={min_confidence:.2f}")
print("accepted=" + (",".join(accepted) if accepted else "none"))
print("fallback=" + ("no" if accepted else "manual_review"))` },
    explanation: [
      { title: "Parse chưa đồng nghĩa hợp lệ", text: "JSON đúng cú pháp vẫn có thể thiếu predictions, sai type hoặc confidence ngoài miền." },
      { title: "Ngưỡng sau schema guard", text: "Chỉ giá trị số đã kiểm định mới được so sánh; lỗi dữ liệu không được biến thành quyết định im lặng." },
      { title: "Fallback là output hợp lệ", text: "Không nhãn nào đạt ngưỡng phải chuyển manual review, không tự lấy top-1 yếu." },
      { title: "Ví dụ không gọi mạng", text: "Response cố định giúp chạy lặp lại; tích hợp thật còn cần timeout, retry và model version." },
    ],
    experiment: { question: "Ngưỡng nào khiến pipeline chuyển hoàn toàn sang manual review?", parameterLabels: { min_confidence: "Confidence tối thiểu" }, defaultVariantId: "api-070", variants: [
      { id: "api-040", label: "Ngưỡng 0,40", parameters: { min_confidence: 0.4 }, expectedOutput: "min_confidence=0.40\naccepted=billing,technical,other\nfallback=no", observation: "Cả nhãn yếu 0,41 cũng được chấp nhận.", illustration: sequence("API gate 0,40", "Ba item cùng qua confidence gate.", [{ label: "Parse JSON" }, { label: "Schema hợp lệ", tone: "accent" }, { label: "3 nhãn accepted", tone: "good" }]) },
      { id: "api-070", label: "Ngưỡng 0,70", parameters: { min_confidence: 0.7 }, expectedOutput: "min_confidence=0.70\naccepted=billing\nfallback=no", observation: "Chỉ billing 0,92 được tự động hóa; hai nhãn còn lại bị loại.", illustration: sequence("API gate 0,70", "Confidence gate chỉ giữ một nhãn.", [{ label: "3 predictions" }, { label: "Validate schema", tone: "accent" }, { label: "billing", value: "0,92", tone: "good" }]) },
      { id: "api-095", label: "Ngưỡng 0,95", parameters: { min_confidence: 0.95 }, expectedOutput: "min_confidence=0.95\naccepted=none\nfallback=manual_review", observation: "Không dự đoán nào đủ chuẩn; nhánh manual review ngăn hành động tự động yếu.", illustration: sequence("API gate 0,95", "Không item nào vượt ngưỡng.", [{ label: "3 predictions" }, { label: "Validate schema", tone: "accent" }, { label: "Manual review", tone: "warn" }]) },
    ] },
    transferQuestion: "Ngoài schema và confidence, bạn sẽ log model version, request ID và latency thế nào để điều tra quyết định sai?",
  },
  "audio-01-waveform-sampling": {
    lessonId: "audio-01-waveform-sampling",
    scenario: { title: "Lấy mẫu tiếng còi 4 Hz mà không tạo tín hiệu giả", context: "Một cảm biến toy ghi sóng sin 4 Hz trong nửa giây. Nếu sample rate quá thấp hoặc rơi đúng pha xấu, các mẫu có thể trông như tín hiệu bằng 0 dù sóng liên tục vẫn dao động.", goal: "Sinh mẫu tại ba sample rate và đối chiếu số mẫu trên mỗi chu kỳ với biên Nyquist." },
    inputs: [{ label: "Tín hiệu liên tục", format: "text", value: "x(t) = sin(2π·4t), thời lượng 0,5 s" }],
    python: { title: "Sampler sóng sin tất định", filename: "sample_waveform.py", codeTemplate: `from math import pi, sin
frequency = 4
duration = 0.5
sample_rate = {{sample_rate}}
samples = []
for index in range(int(sample_rate * duration)):
    value = sin(2 * pi * frequency * index / sample_rate)
    samples.append(0.0 if abs(value) < 1e-9 else value)
print(f"sample_rate={sample_rate}")
print(f"samples_per_cycle={sample_rate / frequency:.1f}")
print("samples=" + ",".join(f"{value:.2f}" for value in samples))` },
    explanation: [
      { title: "Thời điểm lấy mẫu", text: "Mẫu thứ n được đo tại t=n/sample_rate; tăng sample rate tạo nhiều điểm hơn trên cùng thời lượng." },
      { title: "Nyquist là biên, không phải vùng an toàn", text: "8 Hz chỉ bằng hai lần 4 Hz. Ở pha này mọi mẫu rơi vào zero crossing nên tín hiệu quan sát mất hoàn toàn." },
      { title: "Khoảng chuyển tiếp cần dư địa", text: "Hệ thống thật lấy mẫu cao hơn biên và dùng anti-alias filter trước ADC để chặn thành phần trên Nyquist." },
    ],
    experiment: { question: "Sample rate nào bắt đầu thể hiện rõ hình dạng chu kỳ thay vì chỉ chạm vài pha?", parameterLabels: { sample_rate: "Tần số lấy mẫu (Hz)" }, defaultVariantId: "sr-16", variants: [
      { id: "sr-8", label: "8 mẫu/giây", parameters: { sample_rate: 8 }, expectedOutput: "sample_rate=8\nsamples_per_cycle=2.0\nsamples=0.00,0.00,0.00,0.00", observation: "Lấy đúng biên Nyquist và đúng pha làm bốn mẫu đều bằng 0; tín hiệu 4 Hz trở nên không phân biệt với im lặng.", illustration: { kind: "plot", title: "Mẫu ở 8 Hz", caption: "Bốn điểm đều nằm trên trục 0.", xLabel: "Chỉ số mẫu", yLabel: "Biên độ", connect: true, series: [{ label: "waveform", tone: "warn", points: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }] }] } },
      { id: "sr-16", label: "16 mẫu/giây", parameters: { sample_rate: 16 }, expectedOutput: "sample_rate=16\nsamples_per_cycle=4.0\nsamples=0.00,1.00,0.00,-1.00,0.00,1.00,0.00,-1.00", observation: "Bốn mẫu mỗi chu kỳ bắt được đỉnh dương, zero crossing và đỉnh âm.", illustration: { kind: "plot", title: "Mẫu ở 16 Hz", caption: "Hai chu kỳ hiện rõ trong tám mẫu.", xLabel: "Chỉ số mẫu", yLabel: "Biên độ", connect: true, series: [{ label: "waveform", tone: "accent", points: [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 0 }, { x: 3, y: -1 }, { x: 4, y: 0 }, { x: 5, y: 1 }, { x: 6, y: 0 }, { x: 7, y: -1 }] }] } },
      { id: "sr-32", label: "32 mẫu/giây", parameters: { sample_rate: 32 }, expectedOutput: "sample_rate=32\nsamples_per_cycle=8.0\nsamples=0.00,0.71,1.00,0.71,0.00,-0.71,-1.00,-0.71,0.00,0.71,1.00,0.71,0.00,-0.71,-1.00,-0.71", observation: "Tám mẫu mỗi chu kỳ mô tả đường cong mượt hơn và cho anti-alias filter nhiều vùng chuyển tiếp hơn.", illustration: { kind: "plot", title: "Mẫu ở 32 Hz", caption: "Mật độ điểm cao hơn mô tả pha trung gian.", xLabel: "Chỉ số mẫu", yLabel: "Biên độ", connect: true, series: [{ label: "waveform", tone: "good", points: [{ x: 0, y: 0 }, { x: 1, y: .71 }, { x: 2, y: 1 }, { x: 3, y: .71 }, { x: 4, y: 0 }, { x: 5, y: -.71 }, { x: 6, y: -1 }, { x: 7, y: -.71 }] }] } },
    ] },
    transferQuestion: "Nếu tín hiệu còn có thành phần 11 Hz, sample rate 16 Hz sẽ alias nó về tần số quan sát nào?",
  },

  "audio-02-stft": {
    lessonId: "audio-02-stft",
    scenario: { title: "Chọn hop length để không bỏ lỡ tiếng bíp ngắn", context: "Tám mẫu toy chứa hai chu kỳ [0,1,0,-1]. STFT dùng frame dài 4; hop quyết định số cửa sổ thời gian và mức chồng lấp, còn peak frequency bin của từng frame giữ nguyên.", goal: "Cắt frame theo ba hop length và tính DFT để báo vị trí frame cùng peak bin." },
    inputs: [{ label: "Waveform", format: "python", value: "[0,1,0,-1,0,1,0,-1]" }],
    python: { title: "STFT toy không dùng NumPy", filename: "stft_frames.py", codeTemplate: `from math import cos, pi, sin
samples = [0, 1, 0, -1, 0, 1, 0, -1]
frame_length = 4
hop = {{hop}}
starts = list(range(0, len(samples) - frame_length + 1, hop))
peaks = []
for start in starts:
    frame = samples[start:start + frame_length]
    magnitudes = []
    for bin_index in range(frame_length // 2 + 1):
        real = sum(value * cos(2 * pi * bin_index * n / frame_length) for n, value in enumerate(frame))
        imaginary = -sum(value * sin(2 * pi * bin_index * n / frame_length) for n, value in enumerate(frame))
        magnitudes.append((real * real + imaginary * imaginary) ** 0.5)
    peaks.append(max(range(len(magnitudes)), key=magnitudes.__getitem__))
print(f"hop={hop}")
print("frame_starts=" + ",".join(map(str, starts)))
print("peak_bins=" + ",".join(map(str, peaks)))` },
    explanation: [
      { title: "Frame tạo độ phân giải thời gian", text: "Mỗi cửa sổ dài 4 chỉ nhìn một đoạn waveform; start xác định thời điểm của cột spectrogram." },
      { title: "DFT chạy trong từng frame", text: "Code tính ba bin một phía và chọn magnitude lớn nhất; waveform này luôn có peak ở bin 1." },
      { title: "Hop đổi mật độ cột", text: "Hop nhỏ tăng overlap và chi phí nhưng giảm nguy cơ một sự kiện ngắn nằm giữa hai frame thưa." },
    ],
    experiment: { question: "Hop nào cho nhiều mốc thời gian nhất mà không đổi peak bin của tín hiệu ổn định?", parameterLabels: { hop: "Hop length" }, defaultVariantId: "hop-2", variants: [
      { id: "hop-1", label: "Hop 1", parameters: { hop: 1 }, expectedOutput: "hop=1\nframe_starts=0,1,2,3,4\npeak_bins=1,1,1,1,1", observation: "Năm frame chồng lấp 75%, cho timeline dày nhất.", illustration: sequence("Năm cửa sổ STFT", "Mỗi frame dịch một mẫu.", [{ label: "F0", value: "0–3" }, { label: "F1", value: "1–4" }, { label: "F2", value: "2–5" }, { label: "F3", value: "3–6" }, { label: "F4", value: "4–7", tone: "good" }], "timeline") },
      { id: "hop-2", label: "Hop 2", parameters: { hop: 2 }, expectedOutput: "hop=2\nframe_starts=0,2,4\npeak_bins=1,1,1", observation: "Ba frame chồng lấp 50%, thường là cân bằng hợp lý giữa thời gian và chi phí.", illustration: sequence("Ba cửa sổ STFT", "Mỗi frame dịch hai mẫu.", [{ label: "F0", value: "0–3" }, { label: "F1", value: "2–5", tone: "accent" }, { label: "F2", value: "4–7", tone: "good" }], "timeline") },
      { id: "hop-4", label: "Hop 4", parameters: { hop: 4 }, expectedOutput: "hop=4\nframe_starts=0,4\npeak_bins=1,1", observation: "Hai frame không overlap; rẻ nhất nhưng timeline thưa và dễ bỏ lỡ chuyển tiếp ngắn.", illustration: sequence("Hai cửa sổ STFT", "Hai frame phủ liền nhau, không chồng lấp.", [{ label: "F0", value: "0–3" }, { label: "F1", value: "4–7", tone: "warn" }], "timeline") },
    ] },
    transferQuestion: "Tăng frame length trong khi giữ sample rate sẽ đổi độ phân giải tần số và độ định vị thời gian theo hướng nào?",
  },
  "audio-03-mel-spectrogram": {
    lessonId: "audio-03-mel-spectrogram",
    scenario: { title: "Gộp phổ giọng nói thành các dải dễ học", context: "Một frame có tám năng lượng phổ đối xứng [1,2,4,8,8,4,2,1]. Filterbank toy gộp các bin kề nhau thành số dải khác nhau để cho thấy nén tần số làm mất chi tiết nào.", goal: "Chia phổ thành các nhóm bằng nhau, cộng năng lượng mỗi nhóm và so sánh độ dài vector đặc trưng." },
    inputs: [{ label: "Năng lượng phổ", format: "python", value: "[1,2,4,8,8,4,2,1]" }],
    python: { title: "Filterbank aggregation có thể tính tay", filename: "mel_bands_toy.py", codeTemplate: `spectrum = [1, 2, 4, 8, 8, 4, 2, 1]
bands = {{bands}}
if len(spectrum) % bands:
    raise ValueError("số bands phải chia hết số bin")
width = len(spectrum) // bands
energies = [sum(spectrum[start:start + width]) for start in range(0, len(spectrum), width)]
print(f"bands={bands}")
print(f"bins_per_band={width}")
print("band_energy=" + ",".join(map(str, energies)))` },
    explanation: [
      { title: "Filterbank giảm chiều", text: "Mỗi band tóm tắt nhiều frequency bin; ít band tạo vector ngắn nhưng che khuất cấu trúc hẹp." },
      { title: "Năng lượng được bảo toàn trong toy", text: "Vì chỉ cộng các nhóm rời nhau, tổng band energy luôn bằng tổng spectrum là 30." },
      { title: "Mel thật không chia đều bin", text: "Filter tam giác được đặt theo thang mel, dày hơn ở tần số thấp để gần với cảm nhận cao độ của người." },
    ],
    experiment: { question: "Số band nào còn cho thấy hai vùng năng lượng cao ở giữa phổ?", parameterLabels: { bands: "Số dải filterbank" }, defaultVariantId: "bands-4", variants: [
      { id: "bands-2", label: "2 dải", parameters: { bands: 2 }, expectedOutput: "bands=2\nbins_per_band=4\nband_energy=15,15", observation: "Hai nửa phổ trông giống hệt nhau; cấu trúc bên trong mỗi nửa bị mất.", illustration: bars("Năng lượng 2 dải", "Mỗi dải gộp bốn bin.", [{ label: "Band 1", value: 15, tone: "accent" }, { label: "Band 2", value: 15, tone: "accent" }], 15) },
      { id: "bands-4", label: "4 dải", parameters: { bands: 4 }, expectedOutput: "bands=4\nbins_per_band=2\nband_energy=3,12,12,3", observation: "Hai dải giữa nổi bật 12, mô tả vùng phổ tập trung năng lượng.", illustration: bars("Năng lượng 4 dải", "Cấu trúc giữa phổ xuất hiện rõ.", [{ label: "B1", value: 3 }, { label: "B2", value: 12, tone: "good" }, { label: "B3", value: 12, tone: "good" }, { label: "B4", value: 3 }], 15) },
      { id: "bands-8", label: "8 dải", parameters: { bands: 8 }, expectedOutput: "bands=8\nbins_per_band=1\nband_energy=1,2,4,8,8,4,2,1", observation: "Không còn nén; vector giữ toàn bộ chi tiết và chi phí đầu vào cao nhất.", illustration: bars("Năng lượng 8 dải", "Mỗi band trùng một frequency bin.", [{ label: "B1", value: 1 }, { label: "B2", value: 2 }, { label: "B3", value: 4 }, { label: "B4", value: 8, tone: "good" }, { label: "B5", value: 8, tone: "good" }, { label: "B6", value: 4 }, { label: "B7", value: 2 }, { label: "B8", value: 1 }], 8) },
    ] },
    transferQuestion: "Vì sao trước khi lấy log-mel cần thêm epsilon hoặc floor cho band có năng lượng bằng 0?",
  },

  "audio-04-mfcc": {
    lessonId: "audio-04-mfcc",
    scenario: { title: "Nén log-mel thành hệ số cepstral cho từ khóa", context: "Một frame toy có bốn log-mel energy [1,2,3,4]. DCT-II gom xu hướng phổ vào các hệ số đầu; hệ thống từ khóa có thể giữ ít hệ số để giảm chiều.", goal: "Tính DCT-II trực tiếp bằng math.cos và quan sát thêm hệ số cao giữ bao nhiêu chi tiết." },
    inputs: [{ label: "Log-mel energy", format: "python", value: "[1.0, 2.0, 3.0, 4.0]" }],
    python: { title: "DCT-II tạo MFCC toy", filename: "mfcc_dct.py", codeTemplate: `from math import cos, pi
log_mel = [1.0, 2.0, 3.0, 4.0]
n_coeffs = {{n_coeffs}}
coefficients = []
for k in range(n_coeffs):
    value = sum(sample * cos(pi * (index + 0.5) * k / len(log_mel))
                for index, sample in enumerate(log_mel))
    coefficients.append(value)
print(f"n_coeffs={n_coeffs}")
print("mfcc=" + ",".join(f"{value:.3f}" for value in coefficients))` },
    explanation: [
      { title: "C0 đo mức tổng quát", text: "Với chuẩn hóa toy này, hệ số đầu là tổng log-mel bằng 10 và liên quan mức năng lượng chung." },
      { title: "Hệ số sau mô tả biến thiên", text: "Các cosine nhanh dần đo hình dạng phổ từ thô đến chi tiết; độ lớn thường giảm khi phổ trơn." },
      { title: "Decorrelate chỉ là xấp xỉ", text: "DCT thường tập trung thông tin nhưng không bảo đảm mọi hệ số độc lập trên mọi phân phối dữ liệu." },
    ],
    experiment: { question: "Giữ thêm hệ số có bổ sung tín hiệu đáng kể cho frame tuyến tính này không?", parameterLabels: { n_coeffs: "Số MFCC giữ lại" }, defaultVariantId: "mfcc-3", variants: [
      { id: "mfcc-2", label: "Giữ 2 hệ số", parameters: { n_coeffs: 2 }, expectedOutput: "n_coeffs=2\nmfcc=10.000,-3.154", observation: "C0 và C1 giữ mức tổng cùng xu hướng dốc chính của phổ.", illustration: bars("Hai hệ số đầu", "C1 âm nên hiển thị độ lớn và giá trị exact trong nhãn.", [{ label: "C0", value: 10, display: "10,000", tone: "good" }, { label: "C1", value: 3.154, display: "−3,154", tone: "accent" }], 10) },
      { id: "mfcc-3", label: "Giữ 3 hệ số", parameters: { n_coeffs: 3 }, expectedOutput: "n_coeffs=3\nmfcc=10.000,-3.154,-0.000", observation: "C2 gần 0 vì log-mel tăng tuyến tính và đối xứng với basis này.", illustration: bars("Ba hệ số đầu", "Hệ số C2 không bổ sung đáng kể.", [{ label: "C0", value: 10, display: "10,000", tone: "good" }, { label: "C1", value: 3.154, display: "−3,154" }, { label: "C2", value: 0, display: "−0,000" }], 10) },
      { id: "mfcc-4", label: "Giữ đủ 4 hệ số", parameters: { n_coeffs: 4 }, expectedOutput: "n_coeffs=4\nmfcc=10.000,-3.154,-0.000,-0.224", observation: "C3 chỉ có độ lớn 0,224; nén còn ba hệ số mất ít thông tin trong frame toy.", illustration: bars("Bốn hệ số", "Năng lượng cepstral tập trung ở C0 và C1.", [{ label: "C0", value: 10, display: "10,000", tone: "good" }, { label: "C1", value: 3.154, display: "−3,154" }, { label: "C2", value: 0, display: "−0,000" }, { label: "C3", value: .224, display: "−0,224" }], 10) },
    ] },
    transferQuestion: "Nếu bỏ C0 để giảm ảnh hưởng âm lượng, bạn cần chuẩn hóa hoặc bổ sung đặc trưng năng lượng nào cho bài toán nhận dạng?",
  },
  "audio-05-hubert": {
    lessonId: "audio-05-hubert",
    scenario: { title: "Che cụm acoustic unit trước khi học biểu diễn tiếng nói", context: "Một utterance đã được quantize thành sáu acoustic unit [4,2,7,2,5,7]. HuBERT che liên tiếp hai vị trí và yêu cầu encoder dự đoán target rời rạc từ ngữ cảnh còn lại.", goal: "Tạo masked input và target theo ba vị trí bắt đầu mà không làm thay đổi chuỗi unit gốc." },
    inputs: [{ label: "Acoustic units", format: "python", value: "[4, 2, 7, 2, 5, 7]" }],
    python: { title: "Span masking cho acoustic units", filename: "hubert_masking.py", codeTemplate: `units = [4, 2, 7, 2, 5, 7]
mask_start = {{mask_start}}
span = 2
if not 0 <= mask_start <= len(units) - span:
    raise ValueError("mask span ngoài chuỗi")
masked = units.copy()
target = units[mask_start:mask_start + span]
for index in range(mask_start, mask_start + span):
    masked[index] = -1
assert units == [4, 2, 7, 2, 5, 7]
print(f"mask_start={mask_start}")
print("masked=" + ",".join(map(str, masked)))
print("target=" + ",".join(map(str, target)))` },
    explanation: [
      { title: "Mask theo span liên tục", text: "Âm thanh có tương quan cục bộ mạnh nên che một cụm khó hơn che một frame rời rạc." },
      { title: "Target đến từ clustering", text: "Các số là pseudo-label acoustic unit, không phải ký tự hay transcript do con người gán." },
      { title: "Không rò rỉ target", text: "Input thay hai vị trí bằng -1 trong bản copy; assertion xác nhận chuỗi gốc vẫn nguyên vẹn." },
    ],
    experiment: { question: "Dịch mask span làm phần ngữ cảnh trái/phải thay đổi thế nào?", parameterLabels: { mask_start: "Vị trí bắt đầu span" }, defaultVariantId: "mask-middle", variants: [
      { id: "mask-left", label: "Che vị trí 0–1", parameters: { mask_start: 0 }, expectedOutput: "mask_start=0\nmasked=-1,-1,7,2,5,7\ntarget=4,2", observation: "Không có ngữ cảnh bên trái; encoder phải dựa hoàn toàn vào bốn unit phía sau.", illustration: { kind: "tokens", title: "Mask đầu utterance", caption: "Hai target 4,2 bị ẩn khỏi input.", items: [{ label: "MASK", tone: "warn" }, { label: "MASK", tone: "warn" }, { label: "7" }, { label: "2" }, { label: "5" }, { label: "7" }] } },
      { id: "mask-middle", label: "Che vị trí 2–3", parameters: { mask_start: 2 }, expectedOutput: "mask_start=2\nmasked=4,2,-1,-1,5,7\ntarget=7,2", observation: "Span giữa có ngữ cảnh ở cả hai phía, gần với bài toán phục hồi hai chiều của HuBERT.", illustration: { kind: "tokens", title: "Mask giữa utterance", caption: "Ngữ cảnh 4,2 và 5,7 kẹp quanh span.", items: [{ label: "4" }, { label: "2" }, { label: "MASK", tone: "warn" }, { label: "MASK", tone: "warn" }, { label: "5" }, { label: "7" }] } },
      { id: "mask-right", label: "Che vị trí 4–5", parameters: { mask_start: 4 }, expectedOutput: "mask_start=4\nmasked=4,2,7,2,-1,-1\ntarget=5,7", observation: "Không có ngữ cảnh bên phải; dự đoán chỉ dựa trên prefix acoustic.", illustration: { kind: "tokens", title: "Mask cuối utterance", caption: "Hai target cuối bị ẩn.", items: [{ label: "4" }, { label: "2" }, { label: "7" }, { label: "2" }, { label: "MASK", tone: "warn" }, { label: "MASK", tone: "warn" }] } },
    ] },
    transferQuestion: "Nếu pseudo-label clustering sai có hệ thống với một giọng vùng miền, representation HuBERT có thể mang bias đó theo cách nào?",
  },

  "audio-06-whisper": {
    lessonId: "audio-06-whisper",
    scenario: { title: "Lọc segment im lặng khi chép cuộc họp", context: "Ba segment 2 giây có no-speech probability 0,10; 0,70 và 0,20. Segment giữa chỉ là nhiễu quạt nhưng decoder vẫn sinh chữ ‘nhiễu’; ngưỡng quá lỏng sẽ đưa hallucination vào transcript.", goal: "Giữ segment có no-speech probability không vượt ngưỡng và ghép transcript kèm timestamp." },
    inputs: [{ label: "Segment mô phỏng", format: "python", value: "[(0,2,'xin chào',.10),(2,4,'nhiễu',.70),(4,6,'VOAI',.20)]" }],
    python: { title: "No-speech gate cho segment Whisper", filename: "whisper_segments.py", codeTemplate: `segments = [(0.0, 2.0, "xin chào", 0.10), (2.0, 4.0, "nhiễu", 0.70), (4.0, 6.0, "VOAI", 0.20)]
threshold = {{threshold}}
kept = [(start, end, text) for start, end, text, no_speech in segments if no_speech <= threshold]
print(f"threshold={threshold:.2f}")
print("transcript=" + (" ".join(text for _, _, text in kept) if kept else "<empty>"))
print("timestamps=" + (",".join(f"{start:.1f}-{end:.1f}" for start, end, _ in kept) if kept else "none"))` },
    explanation: [
      { title: "Chấm theo từng segment", text: "Mỗi cửa sổ có xác suất no-speech riêng; quyết định cục bộ giữ timestamp của phần được chấp nhận." },
      { title: "Ngưỡng cao là dễ giữ", text: "Vì code giữ no_speech ≤ threshold, tăng threshold làm gate lỏng hơn và có thể giữ cả nhiễu." },
      { title: "Không dùng gate một mình", text: "Whisper thật còn dùng log probability, compression ratio và ngữ cảnh; một threshold không thay thế error analysis." },
    ],
    experiment: { question: "Ngưỡng nào giữ hai câu có tiếng nói nhưng loại segment nhiễu?", parameterLabels: { threshold: "Ngưỡng no-speech" }, defaultVariantId: "whisper-050", variants: [
      { id: "whisper-015", label: "Ngưỡng 0,15", parameters: { threshold: 0.15 }, expectedOutput: "threshold=0.15\ntranscript=xin chào\ntimestamps=0.0-2.0", observation: "Gate quá chặt bỏ cả segment VOAI có no-speech 0,20, làm recall transcript giảm.", illustration: sequence("Transcript ngưỡng 0,15", "Chỉ segment đầu được giữ.", [{ label: "0–2 s", value: "xin chào", tone: "good" }, { label: "2–4 s", value: "loại" }, { label: "4–6 s", value: "loại", tone: "warn" }], "timeline") },
      { id: "whisper-050", label: "Ngưỡng 0,50", parameters: { threshold: 0.5 }, expectedOutput: "threshold=0.50\ntranscript=xin chào VOAI\ntimestamps=0.0-2.0,4.0-6.0", observation: "Hai segment lời nói được giữ và đoạn nhiễu 0,70 bị loại.", illustration: sequence("Transcript ngưỡng 0,50", "Timeline có khoảng im lặng 2–4 giây.", [{ label: "0–2 s", value: "xin chào", tone: "good" }, { label: "2–4 s", value: "lọc nhiễu", tone: "warn" }, { label: "4–6 s", value: "VOAI", tone: "good" }], "timeline") },
      { id: "whisper-075", label: "Ngưỡng 0,75", parameters: { threshold: 0.75 }, expectedOutput: "threshold=0.75\ntranscript=xin chào nhiễu VOAI\ntimestamps=0.0-2.0,2.0-4.0,4.0-6.0", observation: "Gate lỏng giữ hallucination ‘nhiễu’ và làm transcript liền mạch giả tạo.", illustration: sequence("Transcript ngưỡng 0,75", "Cả ba segment được giữ, kể cả nhiễu.", [{ label: "0–2 s", value: "xin chào" }, { label: "2–4 s", value: "nhiễu", tone: "warn" }, { label: "4–6 s", value: "VOAI" }], "timeline") },
    ] },
    transferQuestion: "Bạn sẽ đo word error rate riêng cho speech và false-alarm rate trên silence để chọn threshold thế nào?",
  },
  "audio-07-qwen-audio": {
    lessonId: "audio-07-qwen-audio",
    scenario: { title: "Kết hợp âm thanh và câu hỏi để nhận diện sự kiện", context: "Clip có bằng chứng âm thanh cho còi xe 0,9 và mưa 0,4; câu hỏi văn bản lại gợi ý còi xe 0,2 và mưa 0,8. Trọng số modality quyết định câu trả lời cuối.", goal: "Tính late-fusion score cho hai nhãn và thấy khi nào bằng chứng audio thắng prior từ prompt." },
    inputs: [
      { label: "Audio scores", format: "python", value: "còi xe=0.9, mưa=0.4" },
      { label: "Text scores", format: "python", value: "còi xe=0.2, mưa=0.8" },
    ],
    python: { title: "Fusion toy cho audio question answering", filename: "qwen_audio_fusion.py", codeTemplate: `labels = ["còi xe", "mưa"]
audio_scores = [0.9, 0.4]
text_scores = [0.2, 0.8]
audio_weight = {{audio_weight}}
fused = [audio_weight * audio + (1 - audio_weight) * text
         for audio, text in zip(audio_scores, text_scores)]
best = max(range(len(labels)), key=fused.__getitem__)
print(f"audio_weight={audio_weight:.1f}")
print("scores=" + ",".join(f"{label}:{score:.2f}" for label, score in zip(labels, fused)))
print(f"answer={labels[best]}")` },
    explanation: [
      { title: "Hai modality có thể mâu thuẫn", text: "Audio ủng hộ còi xe còn prompt prior ủng hộ mưa; fusion phải bộc lộ trade-off thay vì che nó." },
      { title: "Trọng số là ablation", text: "audio_weight từ 0 đến 1 đi từ chỉ dùng text sang chỉ dùng audio, giúp đo đóng góp từng modality." },
      { title: "Model thật học fusion phi tuyến", text: "Qwen-Audio dùng representation và attention giàu hơn; trung bình có trọng số chỉ minh họa hướng ảnh hưởng." },
    ],
    experiment: { question: "Bằng chứng audio cần trọng số bao nhiêu mới lật câu trả lời từ mưa sang còi xe?", parameterLabels: { audio_weight: "Trọng số audio" }, defaultVariantId: "audio-05", variants: [
      { id: "audio-0", label: "Chỉ dùng text", parameters: { audio_weight: 0 }, expectedOutput: "audio_weight=0.0\nscores=còi xe:0.20,mưa:0.80\nanswer=mưa", observation: "Hệ thống bỏ toàn bộ clip và trả prior từ câu hỏi, dù tiếng còi rõ.", illustration: bars("Điểm chỉ từ text", "Mưa dẫn trước 0,80 so với 0,20.", [{ label: "Còi xe", value: .2 }, { label: "Mưa", value: .8, tone: "good" }]) },
      { id: "audio-05", label: "Chia đều", parameters: { audio_weight: 0.5 }, expectedOutput: "audio_weight=0.5\nscores=còi xe:0.55,mưa:0.60\nanswer=mưa", observation: "Hai nhãn gần hòa; text prior vẫn nhỉnh hơn 0,05.", illustration: bars("Điểm fusion 50–50", "Khoảng cách nhỏ báo hiệu câu trả lời không ổn định.", [{ label: "Còi xe", value: .55, tone: "accent" }, { label: "Mưa", value: .6, tone: "warn" }]) },
      { id: "audio-1", label: "Chỉ dùng audio", parameters: { audio_weight: 1 }, expectedOutput: "audio_weight=1.0\nscores=còi xe:0.90,mưa:0.40\nanswer=còi xe", observation: "Bằng chứng âm thanh lật quyết định sang còi xe; prompt không còn ảnh hưởng.", illustration: bars("Điểm chỉ từ audio", "Còi xe dẫn rõ với 0,90.", [{ label: "Còi xe", value: .9, tone: "good" }, { label: "Mưa", value: .4 }]) },
    ] },
    transferQuestion: "Bạn sẽ phát hiện prompt chứa giả định sai và yêu cầu model ưu tiên bằng chứng audio bằng metric hoặc dữ liệu đối nghịch nào?",
  },

  "audio-08-voxtral": {
    lessonId: "audio-08-voxtral",
    scenario: { title: "Lọc chunk streaming trước khi tạo transcript", context: "Bốn chunk liên tiếp có speech score 0,20; 0,65; 0,80; 0,40 và decoder toy sinh ‘nhiễu xin chào vang’. VAD threshold quyết định chunk nào đi tiếp vào transcript streaming.", goal: "Lọc chunk theo speech score, giữ thứ tự thời gian và quan sát ngưỡng cao có thể làm mất đầu hoặc cuối câu." },
    inputs: [{ label: "Chunk", format: "python", value: "nhiễu=.20, xin=.65, chào=.80, vang=.40" }],
    python: { title: "Streaming VAD gate", filename: "voxtral_stream.py", codeTemplate: `chunks = [(0, "nhiễu", 0.20), (1, "xin", 0.65), (2, "chào", 0.80), (3, "vang", 0.40)]
threshold = {{threshold}}
kept = [(index, token) for index, token, speech_score in chunks if speech_score >= threshold]
print(f"threshold={threshold:.2f}")
print("kept_chunks=" + (",".join(str(index) for index, _ in kept) if kept else "none"))
print("transcript=" + (" ".join(token for _, token in kept) if kept else "<empty>"))` },
    explanation: [
      { title: "VAD chạy trước transcript", text: "Chunk dưới threshold không đi vào decoder tiếp theo, giúp giảm chi phí và hallucination trong im lặng." },
      { title: "Thứ tự streaming được bảo toàn", text: "List comprehension chỉ lọc, không sắp lại; timestamp chunk vẫn tăng dần." },
      { title: "Ngưỡng cao cắt lời yếu", text: "Âm đầu câu hoặc tiếng cuối xa micro có speech score thấp hơn và dễ bị loại dù mang nội dung." },
    ],
    experiment: { question: "Ngưỡng nào giữ trọn ‘xin chào’ nhưng bỏ nhiễu và tiếng vang?", parameterLabels: { threshold: "Ngưỡng speech score" }, defaultVariantId: "vad-060", variants: [
      { id: "vad-030", label: "Ngưỡng 0,30", parameters: { threshold: 0.3 }, expectedOutput: "threshold=0.30\nkept_chunks=1,2,3\ntranscript=xin chào vang", observation: "Nhiễu đầu bị loại nhưng tiếng vang 0,40 vẫn lọt vào transcript.", illustration: sequence("VAD ngưỡng 0,30", "Ba chunk cuối được giữ.", [{ label: "0", value: "loại" }, { label: "1", value: "xin", tone: "good" }, { label: "2", value: "chào", tone: "good" }, { label: "3", value: "vang", tone: "warn" }], "timeline") },
      { id: "vad-060", label: "Ngưỡng 0,60", parameters: { threshold: 0.6 }, expectedOutput: "threshold=0.60\nkept_chunks=1,2\ntranscript=xin chào", observation: "Hai chunk lời nói rõ được giữ, nhiễu và vang bị loại.", illustration: sequence("VAD ngưỡng 0,60", "Transcript chỉ còn nội dung mục tiêu.", [{ label: "0", value: "loại" }, { label: "1", value: "xin", tone: "good" }, { label: "2", value: "chào", tone: "good" }, { label: "3", value: "loại" }], "timeline") },
      { id: "vad-075", label: "Ngưỡng 0,75", parameters: { threshold: 0.75 }, expectedOutput: "threshold=0.75\nkept_chunks=2\ntranscript=chào", observation: "Âm ‘xin’ 0,65 bị cắt; transcript mất đầu câu dù precision chunk tăng.", illustration: sequence("VAD ngưỡng 0,75", "Chỉ chunk mạnh nhất còn lại.", [{ label: "0", value: "loại" }, { label: "1", value: "mất ‘xin’", tone: "warn" }, { label: "2", value: "chào", tone: "good" }, { label: "3", value: "loại" }], "timeline") },
    ] },
    transferQuestion: "Hysteresis với hai ngưỡng start/stop giúp tránh transcript bật tắt quanh ngưỡng đơn như thế nào?",
  },
  "mm-01-data-embeddings": {
    lessonId: "mm-01-data-embeddings",
    scenario: { title: "Truy hồi tài liệu khi query pha trộn chữ và âm thanh", context: "Kho đa phương thức có embedding ảnh [0,8;0,6], audio [0,6;0,8] và text [1;0]. Query pha giữa hướng text [1;0] và audio cue [0;1], rồi so cosine với cả ba tài liệu.", goal: "Chuẩn hóa vector, tính cosine trong cùng không gian và quan sát trọng số audio làm đổi thứ hạng retrieval." },
    inputs: [
      { label: "Candidate embeddings", format: "python", value: "image=[.8,.6], audio=[.6,.8], text=[1,0]" },
      { label: "Query endpoints", format: "python", value: "text_query=[1,0], audio_query=[0,1]" },
    ],
    python: { title: "Cross-modal cosine retrieval", filename: "multimodal_retrieval.py", codeTemplate: `from math import sqrt
candidates = {"image": [0.8, 0.6], "audio": [0.6, 0.8], "text": [1.0, 0.0]}
audio_weight = {{audio_weight}}
query = [1 - audio_weight, audio_weight]
def normalize(vector):
    norm = sqrt(sum(value * value for value in vector))
    return [value / norm for value in vector]
query = normalize(query)
scores = {name: sum(a * b for a, b in zip(query, normalize(vector)))
          for name, vector in candidates.items()}
ranking = sorted(scores, key=lambda name: (-scores[name], list(candidates).index(name)))
print(f"audio_weight={audio_weight:.1f}")
print("scores=" + ",".join(f"{name}:{scores[name]:.3f}" for name in candidates))
print("ranking=" + ">".join(ranking))` },
    explanation: [
      { title: "Cùng số chiều chưa đủ", text: "Các modality chỉ so được khi encoder đã căn chỉnh ý nghĩa của các trục trong cùng không gian." },
      { title: "Chuẩn hóa loại ảnh hưởng norm", text: "Cosine dùng hướng vector; normalize cả query và candidate trước dot product." },
      { title: "Fusion query đổi ý định", text: "audio_weight dịch query từ trục text sang trục audio và có thể lật top-1 dù kho không đổi." },
    ],
    experiment: { question: "Khi nào tài liệu audio vượt text và image trong thứ hạng?", parameterLabels: { audio_weight: "Trọng số audio trong query" }, defaultVariantId: "embed-05", variants: [
      { id: "embed-0", label: "Query thuần text", parameters: { audio_weight: 0 }, expectedOutput: "audio_weight=0.0\nscores=image:0.800,audio:0.600,text:1.000\nranking=text>image>audio", observation: "Candidate text trùng hướng query và đứng đầu; ảnh vẫn gần hơn audio.", illustration: bars("Cosine query thuần text", "Text đạt cosine 1,0.", [{ label: "Image", value: .8 }, { label: "Audio", value: .6 }, { label: "Text", value: 1, tone: "good" }]) },
      { id: "embed-05", label: "Query pha 50–50", parameters: { audio_weight: 0.5 }, expectedOutput: "audio_weight=0.5\nscores=image:0.990,audio:0.990,text:0.707\nranking=image>audio>text", observation: "Image và audio đối xứng nên hòa 0,990; quy tắc tie-break ổn định giữ image trước.", illustration: bars("Cosine query pha", "Hai modality phi văn bản cùng gần query.", [{ label: "Image", value: .99, tone: "good" }, { label: "Audio", value: .99, tone: "good" }, { label: "Text", value: .707 }]) },
      { id: "embed-1", label: "Query thuần audio", parameters: { audio_weight: 1 }, expectedOutput: "audio_weight=1.0\nscores=image:0.600,audio:0.800,text:0.000\nranking=audio>image>text", observation: "Audio candidate đứng đầu; text trực giao query và nhận cosine 0.", illustration: bars("Cosine query thuần audio", "Audio dẫn đầu với 0,8.", [{ label: "Image", value: .6 }, { label: "Audio", value: .8, tone: "good" }, { label: "Text", value: 0 }]) },
    ] },
    transferQuestion: "Bạn sẽ kiểm tra embedding collapse thế nào nếu mọi candidate đều có cosine gần 0,99 với mọi query?",
  },

  "mm-02-video": {
    lessonId: "mm-02-video",
    scenario: { title: "Lấy frame để phát hiện chuyển động trong video ngắn", context: "Tám frame toy có mức vị trí [0,1,1,4,4,9,9,16]. Pipeline chỉ giữ mỗi stride frame rồi tính độ dịch chuyển giữa các frame đã chọn; stride lớn rẻ hơn nhưng làm mờ thời điểm chuyển động.", goal: "Lấy chỉ số frame, tính motion difference và xác định chuyển động lớn nhất sau sampling." },
    inputs: [{ label: "Vị trí theo frame", format: "python", value: "[0,1,1,4,4,9,9,16]" }],
    python: { title: "Temporal sampling và motion trace", filename: "video_sampling.py", codeTemplate: `positions = [0, 1, 1, 4, 4, 9, 9, 16]
stride = {{stride}}
indices = list(range(0, len(positions), stride))
sampled = [positions[index] for index in indices]
motion = [abs(current - previous) for previous, current in zip(sampled, sampled[1:])]
print(f"stride={stride}")
print("frame_indices=" + ",".join(map(str, indices)))
print("sampled=" + ",".join(map(str, sampled)))
print("motion=" + (",".join(map(str, motion)) if motion else "none"))` },
    explanation: [
      { title: "Stride chọn ngân sách thời gian", text: "Stride s chỉ giữ frame 0,s,2s… nên số lần chạy encoder giảm gần s lần." },
      { title: "Motion phụ thuộc khoảng cách mẫu", text: "Hiệu lớn ở stride 4 tích lũy thay đổi qua bốn frame, không phải vận tốc tức thời lớn hơn." },
      { title: "Sampling có thể bỏ sự kiện ngắn", text: "Một thay đổi xuất hiện rồi biến mất giữa hai frame được chọn sẽ không có mặt trong sampled sequence." },
    ],
    experiment: { question: "Stride tăng làm timeline ngắn đi và diễn giải motion thay đổi ra sao?", parameterLabels: { stride: "Khoảng cách lấy frame" }, defaultVariantId: "stride-2", variants: [
      { id: "stride-1", label: "Mọi frame", parameters: { stride: 1 }, expectedOutput: "stride=1\nframe_indices=0,1,2,3,4,5,6,7\nsampled=0,1,1,4,4,9,9,16\nmotion=1,0,3,0,5,0,7", observation: "Giữ đủ các đoạn đứng yên xen kẽ chuyển động; timeline chi tiết nhất.", illustration: sequence("Tám frame", "Mọi thay đổi và khoảng đứng yên đều hiện.", [{ label: "F0", value: "0" }, { label: "F1", value: "1" }, { label: "F2", value: "1" }, { label: "F3", value: "4" }, { label: "F4", value: "4" }, { label: "F5", value: "9" }, { label: "F6", value: "9" }, { label: "F7", value: "16", tone: "good" }], "timeline") },
      { id: "stride-2", label: "Mỗi 2 frame", parameters: { stride: 2 }, expectedOutput: "stride=2\nframe_indices=0,2,4,6\nsampled=0,1,4,9\nmotion=1,3,5", observation: "Bốn frame vẫn biểu diễn xu hướng tăng nhưng mất các bản sao đứng yên.", illustration: sequence("Bốn frame được chọn", "Chi phí encoder giảm một nửa.", [{ label: "F0", value: "0" }, { label: "F2", value: "1" }, { label: "F4", value: "4" }, { label: "F6", value: "9", tone: "good" }], "timeline") },
      { id: "stride-4", label: "Mỗi 4 frame", parameters: { stride: 4 }, expectedOutput: "stride=4\nframe_indices=0,4\nsampled=0,4\nmotion=4", observation: "Chỉ còn hai quan sát; motion 4 là thay đổi tích lũy và không cho biết nó xảy ra ở frame nào.", illustration: sequence("Hai frame được chọn", "Timeline bị nén mạnh.", [{ label: "F0", value: "0" }, { label: "F4", value: "4", tone: "warn" }], "timeline") },
    ] },
    transferQuestion: "Nếu sự kiện chỉ xuất hiện ở frame 3 rồi biến mất ở frame 4, uniform stride 2 có thấy không và bạn sẽ lấy mẫu thích nghi thế nào?",
  },
  "mm-03-time-series": {
    lessonId: "mm-03-time-series",
    scenario: { title: "Phát hiện đột biến nhiệt độ cảm biến", context: "Chuỗi nhiệt độ toy [10,11,12,20,13,12] có một đỉnh 20. Baseline dự đoán mỗi điểm bằng moving average của cửa sổ quá khứ, rồi dùng residual để tìm thời điểm bất thường nhất.", goal: "Tạo dự đoán causal không nhìn tương lai, tính residual và báo chỉ số có sai lệch tuyệt đối lớn nhất." },
    inputs: [{ label: "Chuỗi nhiệt độ", format: "python", value: "[10,11,12,20,13,12]" }],
    python: { title: "Moving-average anomaly baseline", filename: "time_series_anomaly.py", codeTemplate: `series = [10, 11, 12, 20, 13, 12]
window = {{window}}
predictions = []
residuals = []
indices = list(range(window, len(series)))
for index in indices:
    prediction = sum(series[index - window:index]) / window
    predictions.append(prediction)
    residuals.append(series[index] - prediction)
largest = max(range(len(residuals)), key=lambda i: abs(residuals[i]))
print(f"window={window}")
print("predictions=" + ",".join(f"{value:.2f}" for value in predictions))
print("residuals=" + ",".join(f"{value:.2f}" for value in residuals))
print(f"largest_anomaly=index{indices[largest]}:{abs(residuals[largest]):.2f}")` },
    explanation: [
      { title: "Causal window chỉ dùng quá khứ", text: "Slice kết thúc trước index hiện tại nên không rò rỉ chính điểm cần dự đoán hay tương lai." },
      { title: "Residual giữ hướng sai lệch", text: "Giá trị dương là quan sát cao hơn baseline; giá trị âm là thấp hơn. Xếp hạng anomaly dùng trị tuyệt đối." },
      { title: "Window điều khiển độ trễ", text: "Window dài làm baseline mượt nhưng đỉnh 20 còn ảnh hưởng nhiều dự đoán sau khi sự kiện đã qua." },
    ],
    experiment: { question: "Window nào phát hiện đúng đỉnh 20 và window nào bị chính đỉnh đó kéo lệch lâu nhất?", parameterLabels: { window: "Độ dài cửa sổ" }, defaultVariantId: "window-3", variants: [
      { id: "window-2", label: "Cửa sổ 2", parameters: { window: 2 }, expectedOutput: "window=2\npredictions=10.50,11.50,16.00,16.50\nresiduals=1.50,8.50,-3.00,-4.50\nlargest_anomaly=index3:8.50", observation: "Đỉnh index 3 nổi rõ 8,50; hai dự đoán sau bị kéo lên vì window còn chứa 20.", illustration: { kind: "plot", title: "Quan sát và baseline window 2", caption: "Khoảng cách lớn nhất xuất hiện tại index 3.", xLabel: "Thời điểm", yLabel: "Nhiệt độ", connect: true, series: [{ label: "Quan sát", tone: "warn", points: [{ x: 0, y: 10 }, { x: 1, y: 11 }, { x: 2, y: 12 }, { x: 3, y: 20 }, { x: 4, y: 13 }, { x: 5, y: 12 }] }, { label: "Dự đoán", tone: "accent", points: [{ x: 2, y: 10.5 }, { x: 3, y: 11.5 }, { x: 4, y: 16 }, { x: 5, y: 16.5 }] }] } },
      { id: "window-3", label: "Cửa sổ 3", parameters: { window: 3 }, expectedOutput: "window=3\npredictions=11.00,14.33,15.00\nresiduals=9.00,-1.33,-3.00\nlargest_anomaly=index3:9.00", observation: "Baseline trước đỉnh là 11 nên residual đạt 9; ảnh hưởng của đỉnh được pha loãng trong ba mẫu.", illustration: { kind: "plot", title: "Quan sát và baseline window 3", caption: "Đỉnh 20 lệch 9 đơn vị khỏi ba điểm trước.", xLabel: "Thời điểm", yLabel: "Nhiệt độ", connect: true, series: [{ label: "Quan sát", tone: "warn", points: [{ x: 0, y: 10 }, { x: 1, y: 11 }, { x: 2, y: 12 }, { x: 3, y: 20 }, { x: 4, y: 13 }, { x: 5, y: 12 }] }, { label: "Dự đoán", tone: "accent", points: [{ x: 3, y: 11 }, { x: 4, y: 14.33 }, { x: 5, y: 15 }] }] } },
      { id: "window-4", label: "Cửa sổ 4", parameters: { window: 4 }, expectedOutput: "window=4\npredictions=13.25,14.00\nresiduals=-0.25,-2.00\nlargest_anomaly=index5:2.00", observation: "Không còn dự đoán tại index 3 vì cần bốn điểm lịch sử; đỉnh đã lọt vào context và không thể được chấm là anomaly.", illustration: { kind: "plot", title: "Baseline window 4", caption: "Warm-up dài làm bỏ qua đỉnh sớm ở index 3.", xLabel: "Thời điểm", yLabel: "Nhiệt độ", connect: true, series: [{ label: "Quan sát", tone: "warn", points: [{ x: 0, y: 10 }, { x: 1, y: 11 }, { x: 2, y: 12 }, { x: 3, y: 20 }, { x: 4, y: 13 }, { x: 5, y: 12 }] }, { label: "Dự đoán", tone: "accent", points: [{ x: 4, y: 13.25 }, { x: 5, y: 14 }] }] } },
    ] },
    transferQuestion: "Bạn sẽ xử lý warm-up thế nào để không bỏ qua anomaly xảy ra trước khi đủ một cửa sổ dài?",
  },

  "mm-04-fusion": {
    lessonId: "mm-04-fusion",
    scenario: { title: "Hợp nhất ảnh, chữ và âm thanh cho cảnh báo sự cố", context: "Ba classifier cùng dự đoán lớp A/B: vision [0,8;0,2], text [0,3;0,7], audio [0,6;0,4]. Vision ủng hộ A, text ủng hộ B, audio nghiêng nhẹ A; hệ thống cần ablation trọng số minh bạch.", goal: "Dành một trọng số cho vision, chia đều phần còn lại cho text/audio và tính xác suất late fusion." },
    inputs: [
      { label: "Vision", format: "python", value: "A=0.8, B=0.2" },
      { label: "Text và audio", format: "python", value: "text=[0.3,0.7], audio=[0.6,0.4]" },
    ],
    python: { title: "Late fusion ba modality", filename: "late_fusion.py", codeTemplate: `labels = ["A", "B"]
vision = [0.8, 0.2]
text = [0.3, 0.7]
audio = [0.6, 0.4]
vision_weight = {{vision_weight}}
other_weight = (1 - vision_weight) / 2
fused = [vision_weight * v + other_weight * t + other_weight * a
         for v, t, a in zip(vision, text, audio)]
prediction = labels[max(range(len(labels)), key=fused.__getitem__)]
print(f"vision_weight={vision_weight:.1f}")
print(f"weights=vision:{vision_weight:.2f},text:{other_weight:.2f},audio:{other_weight:.2f}")
print("fused=" + ",".join(f"{label}:{score:.3f}" for label, score in zip(labels, fused)))
print(f"prediction={prediction}")` },
    explanation: [
      { title: "Trọng số tổng bằng 1", text: "Phần không dành cho vision được chia đôi nên ba hệ số luôn cộng đúng 1." },
      { title: "Late fusion làm việc trên score", text: "Mỗi encoder/classifier đã chạy riêng; fusion không học tương tác token hay feature chéo modality." },
      { title: "Ablation phát hiện modality lấn át", text: "Thử trọng số 0 và 1 cho biết quyết định có phụ thuộc quá mức vào vision hay không." },
    ],
    experiment: { question: "Vision cần bao nhiêu trọng số để lật quyết định từ B sang A?", parameterLabels: { vision_weight: "Trọng số vision" }, defaultVariantId: "fusion-05", variants: [
      { id: "fusion-0", label: "Bỏ vision", parameters: { vision_weight: 0 }, expectedOutput: "vision_weight=0.0\nweights=vision:0.00,text:0.50,audio:0.50\nfused=A:0.450,B:0.550\nprediction=B", observation: "Text kéo kết quả sang B dù audio nghiêng A; đây là ablation không dùng ảnh.", illustration: bars("Fusion không vision", "B dẫn 0,55 so với 0,45.", [{ label: "A", value: .45 }, { label: "B", value: .55, tone: "good" }]) },
      { id: "fusion-05", label: "Vision 50%", parameters: { vision_weight: 0.5 }, expectedOutput: "vision_weight=0.5\nweights=vision:0.50,text:0.25,audio:0.25\nfused=A:0.625,B:0.375\nprediction=A", observation: "Bằng chứng vision đủ mạnh để lật dự đoán sang A; text và audio mỗi modality còn 25%.", illustration: bars("Fusion vision 50%", "A dẫn rõ với 0,625.", [{ label: "A", value: .625, tone: "good" }, { label: "B", value: .375 }]) },
      { id: "fusion-1", label: "Chỉ vision", parameters: { vision_weight: 1 }, expectedOutput: "vision_weight=1.0\nweights=vision:1.00,text:0.00,audio:0.00\nfused=A:0.800,B:0.200\nprediction=A", observation: "Output trùng classifier ảnh; hai modality còn lại không thể sửa một lỗi vision.", illustration: bars("Fusion chỉ vision", "Đây là ablation bỏ text và audio.", [{ label: "A", value: .8, tone: "good" }, { label: "B", value: .2 }]) },
    ] },
    transferQuestion: "Nếu một modality bị thiếu ở runtime, bạn sẽ renormalize trọng số và hiệu chỉnh confidence thế nào thay vì điền score 0?",
  },
};
