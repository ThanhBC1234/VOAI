/**
 * Section B2 — Thành phần kiến trúc mạng sâu: embedding, pooling, attention,
 * transformer, autoencoder, regularization cho học sâu, khởi tạo trọng số,
 * batch normalization và finetuning.
 *
 * Mỗi mục syllabus có 5 câu: 1 Nhận biết, 1 Thông hiểu, 2 Vận dụng,
 * 1 Vận dụng cao.
 */

import type { TheoryQuestion } from "./types";

export const sectionB2Questions: readonly TheoryQuestion[] = [
  /* ---------------- embeddings ---------------- */
  {
    id: "embeddings-01",
    syllabusId: "embeddings",
    difficulty: "recall",
    format: "single-choice",
    stem: "Embedding trong học sâu là gì?",
    choices: [
      "Vector số thực dày, số chiều thấp, dùng để biểu diễn một đối tượng rời rạc như từ, ảnh hoặc người dùng.",
      "Một lớp dùng để giảm learning rate.",
      "Một dạng hàm mất mát cho bài toán phân loại.",
      "Kỹ thuật nén mô hình sau khi huấn luyện.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: embedding biến đối tượng rời rạc thành điểm trong không gian vector liên tục.",
      "Sai: đó là scheduler.",
      "Sai: embedding là biểu diễn, không phải mục tiêu tối ưu.",
      "Sai: đó là quantization/pruning.",
    ],
    explanation:
      "Điểm mấu chốt: embedding được *học* cùng mô hình, nên khoảng cách trong không gian đó phản ánh sự tương đồng theo nghĩa mà nhiệm vụ huấn luyện định nghĩa.",
  },
  {
    id: "embeddings-02",
    syllabusId: "embeddings",
    difficulty: "understand",
    format: "single-choice",
    stem: "Ưu điểm chính của embedding so với one-hot encoding cho từ vựng 50.000 từ là gì?",
    choices: [
      "Embedding luôn huấn luyện nhanh hơn.",
      "Số chiều thấp hơn nhiều và các từ có nghĩa gần nhau nằm gần nhau, trong khi mọi cặp one-hot đều cách đều nhau.",
      "Embedding không cần dữ liệu huấn luyện.",
      "One-hot không biểu diễn được từ hiếm.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: tốc độ là hệ quả phụ, không phải ưu điểm cốt lõi.",
      "Đúng: one-hot cho mọi cặp từ khoảng cách bằng nhau nên không mang thông tin ngữ nghĩa nào.",
      "Sai: embedding phải được học từ dữ liệu.",
      "Sai: one-hot biểu diễn được, chỉ là không hiệu quả.",
    ],
    explanation:
      "Với one-hot, “mèo” và “chó” xa nhau đúng bằng “mèo” và “máy bay”. Embedding học được cấu trúc quan hệ đó từ ngữ cảnh xuất hiện.",
  },
  {
    id: "embeddings-03",
    syllabusId: "embeddings",
    difficulty: "apply",
    format: "numeric",
    stem: "`nn.Embedding(10000, 128)` có bao nhiêu tham số học được?",
    answer: 1280000,
    tolerance: 0,
    calculation: [
      "Bảng embedding là ma trận kích thước (số mục từ vựng × số chiều).",
      "10.000 × 128 = 1.280.000 tham số.",
      "Lớp embedding không có bias.",
    ],
    explanation:
      "Bảng embedding thường chiếm phần lớn tham số của mô hình NLP nhỏ. Đây là lý do người ta cắt bớt từ vựng hoặc dùng subword tokenization.",
  },
  {
    id: "embeddings-04",
    syllabusId: "embeddings",
    difficulty: "apply",
    format: "single-choice",
    stem: "Muốn tìm các mục tương tự nhau trong không gian embedding, độ đo nào thường được dùng nhất?",
    choices: [
      "Cosine similarity (hoặc dot product trên vector đã chuẩn hoá).",
      "Số lượng phần tử khác 0 của vector.",
      "Tổng các thành phần của vector.",
      "Phương sai của các thành phần.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: cosine đo góc nên bỏ qua độ dài vector, phù hợp khi hướng mới mang ngữ nghĩa.",
      "Sai: embedding là vector dày, hầu hết phần tử khác 0.",
      "Sai: tổng thành phần không mang ý nghĩa tương đồng.",
      "Sai: phương sai nội tại của một vector không đo được quan hệ giữa hai vector.",
    ],
    explanation:
      "Sau khi chuẩn hoá L2, cosine similarity và dot product tương đương nhau, và xếp hạng theo cosine trùng với xếp hạng theo khoảng cách Euclid.",
  },
  {
    id: "embeddings-05",
    syllabusId: "embeddings",
    difficulty: "advanced",
    format: "single-choice",
    stem: "Nhóm lấy embedding ảnh từ một mô hình và embedding văn bản từ một mô hình khác (huấn luyện độc lập), rồi tính cosine similarity giữa chúng để ghép ảnh với chú thích. Vấn đề cốt lõi là gì?",
    choices: [
      "Hai vector có số chiều khác nhau nên không tính được.",
      "Kể cả khi cùng số chiều, hai không gian embedding được học độc lập nên không chia sẻ hệ trục ngữ nghĩa; cosine giữa chúng không có ý nghĩa.",
      "Cosine similarity không dùng được cho embedding ảnh.",
      "Cần chuẩn hoá L2 trước là đủ để khắc phục.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: có thể trùng số chiều, và đó cũng không phải vấn đề bản chất.",
      "Đúng: mỗi mô hình định nghĩa hệ trục riêng; chiều thứ k của mô hình này không liên quan chiều thứ k của mô hình kia.",
      "Sai: cosine dùng tốt cho embedding ảnh trong cùng một không gian.",
      "Sai: chuẩn hoá chỉ đổi độ dài, không làm hai không gian trở nên tương thích.",
    ],
    trap: "Bẫy là việc phép tính *chạy được* và trả về một con số trong [−1, 1] trông rất hợp lý, khiến lỗi khái niệm này khó bị phát hiện.",
    explanation:
      "Đây chính là lý do CLIP tồn tại: nó huấn luyện đồng thời encoder ảnh và encoder văn bản bằng contrastive loss để đưa cả hai vào *một* không gian chung, khi đó cosine mới có nghĩa.",
  },

  /* ---------------- pooling ---------------- */
  {
    id: "pooling-01",
    syllabusId: "pooling",
    difficulty: "recall",
    format: "single-choice",
    stem: "Max pooling thực hiện phép gì?",
    choices: [
      "Lấy giá trị lớn nhất trong mỗi cửa sổ trượt.",
      "Lấy trung bình các giá trị trong mỗi cửa sổ.",
      "Nhân các giá trị trong cửa sổ với trọng số học được.",
      "Sắp xếp các giá trị trong cửa sổ theo thứ tự tăng dần.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: giữ lại tín hiệu kích hoạt mạnh nhất trong vùng.",
      "Sai: đó là average pooling.",
      "Sai: pooling không có tham số học được.",
      "Sai: pooling không sắp xếp.",
    ],
    explanation:
      "Vì không có tham số, pooling giảm kích thước mà không tăng số tham số mô hình. Gradient chỉ chảy ngược về đúng vị trí đạt cực đại.",
  },
  {
    id: "pooling-02",
    syllabusId: "pooling",
    difficulty: "understand",
    format: "single-choice",
    stem: "Hai tác dụng chính của pooling trong CNN là gì?",
    choices: [
      "Tăng số kênh và tăng số tham số.",
      "Giảm kích thước không gian (giảm chi phí tính toán) và tạo bất biến nhỏ với dịch chuyển cục bộ.",
      "Tăng độ phân giải và tăng độ chính xác vị trí.",
      "Chuẩn hoá phân phối kích hoạt và tăng tốc hội tụ.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: pooling không đổi số kênh và không thêm tham số.",
      "Đúng: đây là hai lý do kinh điển để dùng pooling.",
      "Sai: pooling *giảm* độ phân giải.",
      "Sai: đó là tác dụng của batch normalization.",
    ],
    explanation:
      "Bất biến ở đây là bất biến *nhỏ*: dịch vài pixel không đổi đầu ra. Dịch chuyển lớn vẫn làm đổi kết quả, nên augmentation vẫn cần thiết.",
  },
  {
    id: "pooling-03",
    syllabusId: "pooling",
    difficulty: "apply",
    format: "numeric",
    stem: "Feature map 32×32 đi qua max pooling cửa sổ 2×2, stride 2, không padding. Kích thước một cạnh của đầu ra là bao nhiêu?",
    answer: 16,
    tolerance: 0,
    calculation: [
      "Công thức: ⌊(W − K)/S⌋ + 1 = ⌊(32 − 2)/2⌋ + 1.",
      "= 15 + 1 = 16.",
      "Đầu ra là 16×16, số kênh giữ nguyên.",
    ],
    explanation:
      "Với pooling 2×2 stride 2, quy tắc nhanh là chia đôi mỗi chiều không gian. Bốn tầng như vậy đưa 224 về 14 — đúng bằng kích thước feature map cuối của nhiều mạng CNN kinh điển.",
  },
  {
    id: "pooling-04",
    syllabusId: "pooling",
    difficulty: "apply",
    format: "single-choice",
    stem: "Global average pooling trước lớp phân loại có lợi ích gì so với trải phẳng rồi nối lớp fully connected lớn?",
    choices: [
      "Giữ được nhiều thông tin vị trí hơn.",
      "Giảm mạnh số tham số và rủi ro overfitting, đồng thời cho phép mô hình nhận ảnh đầu vào có kích thước thay đổi.",
      "Tăng độ phân giải của feature map.",
      "Loại bỏ nhu cầu dùng hàm kích hoạt.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: GAP gộp toàn bộ chiều không gian nên bỏ thông tin vị trí.",
      "Đúng: mỗi kênh rút về một số, nên lớp phân loại chỉ cần (số kênh × số lớp) tham số.",
      "Sai: GAP giảm chiều không gian xuống 1×1.",
      "Sai: phi tuyến vẫn cần thiết.",
    ],
    explanation:
      "Ví dụ: feature map 7×7×512 trải phẳng cho 25.088 đầu vào; sau GAP chỉ còn 512. Với 1.000 lớp, số tham số giảm từ ~25 triệu xuống 512.000.",
  },
  {
    id: "pooling-05",
    syllabusId: "pooling",
    difficulty: "advanced",
    format: "single-choice",
    stem: "Vì sao các kiến trúc phân đoạn ảnh (segmentation) và phát hiện đối tượng thường hạn chế pooling hoặc bù lại bằng cơ chế riêng?",
    choices: [
      "Vì pooling làm tăng số tham số quá nhiều.",
      "Vì pooling làm mất thông tin vị trí chính xác, trong khi các bài toán này cần dự đoán ở mức từng pixel hoặc toạ độ hộp; nên dùng skip connection, upsampling hoặc dilated convolution để khôi phục độ phân giải.",
      "Vì pooling chỉ hoạt động với ảnh vuông.",
      "Vì pooling làm mô hình không hội tụ.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: pooling không có tham số nào.",
      "Đúng: đánh đổi giữa ngữ cảnh rộng và độ chính xác vị trí là vấn đề trung tâm của các bài toán dự đoán dày đặc.",
      "Sai: pooling áp dụng cho mọi kích thước.",
      "Sai: pooling không cản trở hội tụ.",
    ],
    trap: "Bẫy là áp dụng máy móc bài học từ phân loại ảnh (“pooling luôn tốt”) sang bài toán có yêu cầu định vị. Cùng một thao tác có thể có lợi ở nhiệm vụ này và có hại ở nhiệm vụ khác.",
    explanation:
      "U-Net xử lý đúng vấn đề này bằng skip connection: đường đi xuống lấy ngữ cảnh, đường đi lên khôi phục độ phân giải, và skip connection mang chi tiết vị trí từ tầng nông sang.",
  },

  /* ---------------- attention ---------------- */
  {
    id: "attention-01",
    syllabusId: "attention",
    difficulty: "recall",
    format: "single-choice",
    stem: "Trong scaled dot-product attention, ba đại lượng Q, K, V lần lượt là gì?",
    choices: [
      "Query, Key, Value.",
      "Quantity, Kernel, Variance.",
      "Quality, Knowledge, Vector.",
      "Query, Kernel, Vocabulary.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: Q hỏi, K để so khớp, V mang nội dung được lấy ra.",
      "Sai: không phải thuật ngữ của attention.",
      "Sai: không đúng.",
      "Sai: chỉ Q đúng.",
    ],
    explanation:
      "Công thức: Attention(Q, K, V) = softmax(QKᵀ/√d_k)·V. Trực giác giống tra cứu từ điển mềm: so query với mọi key để lấy tổ hợp có trọng số của các value.",
  },
  {
    id: "attention-02",
    syllabusId: "attention",
    difficulty: "understand",
    format: "single-choice",
    stem: "Vì sao tích QKᵀ được chia cho √d_k trước khi đưa qua softmax?",
    choices: [
      "Để kết quả nằm trong khoảng [0, 1].",
      "Vì khi d_k lớn, tích vô hướng có phương sai lớn, đẩy softmax vào vùng bão hoà nơi gradient rất nhỏ; chia cho √d_k giữ phương sai ở mức ổn định.",
      "Để tiết kiệm bộ nhớ.",
      "Để bảo đảm ma trận attention đối xứng.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: softmax mới là bước đưa về khoảng [0, 1].",
      "Đúng: với các thành phần độc lập phương sai 1, tích vô hướng d_k chiều có phương sai d_k.",
      "Sai: phép chia vô hướng không đổi bộ nhớ.",
      "Sai: ma trận attention nói chung không đối xứng.",
    ],
    explanation:
      "Softmax bão hoà cho gradient gần 0, khiến mô hình gần như không học được. Đây là lý do chữ “scaled” nằm ngay trong tên gọi của cơ chế.",
  },
  {
    id: "attention-03",
    syllabusId: "attention",
    difficulty: "apply",
    format: "numeric",
    stem: "Self-attention trên chuỗi có 4 token. Ma trận trọng số attention (sau softmax) có bao nhiêu phần tử?",
    answer: 16,
    tolerance: 0,
    calculation: [
      "Mỗi token làm query so với mọi token làm key.",
      "Ma trận có kích thước 4 × 4.",
      "Số phần tử: 16. Mỗi hàng cộng lại bằng 1.",
    ],
    explanation:
      "Ma trận n×n này chính là nguồn gốc chi phí bậc hai của self-attention: chuỗi dài gấp đôi thì bộ nhớ và tính toán cho attention tăng gấp bốn.",
  },
  {
    id: "attention-04",
    syllabusId: "attention",
    difficulty: "apply",
    format: "single-choice",
    stem: "Trong mô hình ngôn ngữ tự hồi quy, causal mask (mặt nạ nhân quả) có tác dụng gì?",
    choices: [
      "Loại bỏ các token hiếm khỏi từ vựng.",
      "Chặn mỗi vị trí nhìn sang các token phía sau nó, bảo đảm dự đoán token t chỉ dùng thông tin từ các token trước t.",
      "Giảm số đầu attention để tiết kiệm bộ nhớ.",
      "Chuẩn hoá trọng số attention về tổng bằng 1.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: đó là việc lọc từ vựng khi tokenize.",
      "Đúng: thường cài bằng cách đặt −∞ cho các vị trí tương lai trước khi softmax.",
      "Sai: số đầu attention là lựa chọn kiến trúc.",
      "Sai: softmax đã tự bảo đảm điều đó.",
    ],
    explanation:
      "Không có causal mask, mô hình nhìn thấy đáp án ngay trong đầu vào — loss sẽ giảm rất nhanh nhưng mô hình hoàn toàn vô dụng khi sinh văn bản thật.",
  },
  {
    id: "attention-05",
    syllabusId: "attention",
    difficulty: "advanced",
    format: "single-choice",
    stem: "Độ dài chuỗi tăng từ 512 lên 4096 token. Bộ nhớ cho ma trận attention của self-attention tiêu chuẩn tăng khoảng bao nhiêu lần?",
    choices: ["8 lần", "16 lần", "64 lần", "Không đổi"],
    answerIndex: 2,
    choiceNotes: [
      "Sai: 8 lần là mức tăng của độ dài chuỗi, tức tăng tuyến tính.",
      "Sai: 16 lần không tương ứng quan hệ nào ở đây.",
      "Đúng: bộ nhớ tỷ lệ n², nên (4096/512)² = 8² = 64 lần.",
      "Sai: chi phí phụ thuộc mạnh vào độ dài chuỗi.",
    ],
    trap: "Bẫy là chọn 8 theo phản xạ tuyến tính. Phải nhớ ma trận attention có kích thước n×n, nên mọi thứ gắn với nó đều là bậc hai.",
    explanation:
      "Chính rào cản bậc hai này thúc đẩy các hướng nghiên cứu về attention thưa, attention tuyến tính và FlashAttention (giảm bộ nhớ bằng cách không hiện thực hoá toàn bộ ma trận n×n).",
  },

  /* ---------------- transformers ---------------- */
  {
    id: "transformers-01",
    syllabusId: "transformers",
    difficulty: "recall",
    format: "single-choice",
    stem: "Điểm khác biệt kiến trúc căn bản giữa transformer và RNN là gì?",
    choices: [
      "Transformer xử lý toàn bộ chuỗi song song bằng self-attention, thay vì xử lý tuần tự theo từng bước thời gian.",
      "Transformer không dùng phép nhân ma trận.",
      "Transformer không cần huấn luyện.",
      "Transformer chỉ dùng được cho ảnh.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: bỏ tính đệ quy cho phép tận dụng GPU và rút ngắn đường đi giữa hai vị trí xa nhau.",
      "Sai: transformer dựa nặng vào phép nhân ma trận.",
      "Sai: vẫn phải huấn luyện.",
      "Sai: transformer ra đời cho dịch máy, sau đó mới mở sang thị giác.",
    ],
    explanation:
      "Trong RNN, thông tin giữa vị trí 1 và vị trí n phải đi qua n bước. Trong self-attention, mọi cặp vị trí cách nhau đúng một bước — đó là lý do transformer nắm phụ thuộc xa tốt hơn.",
  },
  {
    id: "transformers-02",
    syllabusId: "transformers",
    difficulty: "understand",
    format: "single-choice",
    stem: "Vì sao transformer cần positional encoding?",
    choices: [
      "Để giảm số tham số.",
      "Vì self-attention tương đương với hoán vị (permutation-equivariant): nếu không thêm thông tin vị trí, đảo trật tự từ chỉ làm output đảo theo, nên mô hình không phân biệt được trật tự.",
      "Để chuẩn hoá độ dài chuỗi về cùng một giá trị.",
      "Để mã hoá nhãn của bài toán phân loại.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: positional encoding không nhằm giảm tham số.",
      "Đúng: phép attention là tổng có trọng số nên không phân biệt thứ tự đầu vào.",
      "Sai: độ dài chuỗi được xử lý bằng padding và mask.",
      "Sai: nhãn không liên quan tới positional encoding.",
    ],
    explanation:
      "Nói cho chính xác, self-attention thuần là **permutation-equivariant** chứ không phải permutation-invariant: hoán vị token đầu vào thì vector đầu ra của từng token hoán vị y hệt theo. Hệ quả là “mèo đuổi chuột” và “chuột đuổi mèo” cho cùng một *tập* biểu diễn, chỉ khác thứ tự — nên mô hình mất hoàn toàn thông tin cú pháp. (Tính invariant thật sự chỉ xuất hiện sau một phép gộp không phụ thuộc thứ tự như mean-pooling.)",
  },
  {
    id: "transformers-03",
    syllabusId: "transformers",
    difficulty: "apply",
    format: "single-choice",
    stem: "Vì sao multi-head attention tốt hơn một đầu attention duy nhất có cùng tổng số chiều?",
    choices: [
      "Vì nhiều đầu làm giảm số tham số.",
      "Vì mỗi đầu học một kiểu quan hệ khác nhau trong các không gian con khác nhau (ví dụ quan hệ cú pháp, quan hệ đồng tham chiếu), rồi kết quả được ghép lại.",
      "Vì nhiều đầu làm ma trận attention trở nên thưa.",
      "Vì mỗi đầu xử lý một token riêng biệt.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: tổng số tham số xấp xỉ như nhau khi chia đều số chiều.",
      "Đúng: một softmax duy nhất buộc mô hình gộp mọi loại quan hệ vào một phân phối trọng số.",
      "Sai: tính thưa không phải mục tiêu ở đây.",
      "Sai: mọi đầu đều nhìn toàn bộ chuỗi.",
    ],
    explanation:
      "Ví dụ: với 512 chiều và 8 đầu, mỗi đầu làm việc trên 64 chiều. Chi phí tương đương một đầu 512 chiều, nhưng mô hình biểu diễn được nhiều kiểu quan hệ song song.",
  },
  {
    id: "transformers-04",
    syllabusId: "transformers",
    difficulty: "apply",
    format: "single-choice",
    stem: "Nhiệm vụ nào phù hợp nhất với kiến trúc encoder-only kiểu BERT?",
    choices: [
      "Sinh văn bản tiếp nối một đoạn mở đầu.",
      "Phân loại cảm xúc của một câu cho trước.",
      "Dịch máy từ tiếng Việt sang tiếng Anh.",
      "Sinh ảnh từ mô tả văn bản.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: sinh văn bản tự hồi quy cần kiến trúc decoder-only kiểu GPT.",
      "Đúng: encoder-only cho biểu diễn hai chiều của toàn câu, rất hợp cho các nhiệm vụ hiểu.",
      "Sai: dịch máy cổ điển dùng encoder-decoder.",
      "Sai: đó là bài toán sinh ảnh, dùng kiến trúc khác hẳn.",
    ],
    explanation:
      "Nhớ theo bộ ba: encoder-only cho *hiểu* (phân loại, NER, truy hồi); decoder-only cho *sinh*; encoder-decoder cho *biến đổi chuỗi sang chuỗi*.",
  },
  {
    id: "transformers-05",
    syllabusId: "transformers",
    difficulty: "advanced",
    format: "true-false-set",
    stem: "So sánh BERT và GPT.",
    statements: [
      {
        text: "BERT được huấn luyện bằng masked language modeling, nhìn được ngữ cảnh cả hai phía của token bị che.",
        answer: true,
        note: "Tính hai chiều này là lý do BERT mạnh ở các nhiệm vụ hiểu văn bản.",
      },
      {
        text: "GPT được huấn luyện bằng dự đoán token kế tiếp, chỉ nhìn được ngữ cảnh phía trái.",
        answer: true,
        note: "Ràng buộc nhân quả này cho phép sinh văn bản tự hồi quy một cách nhất quán.",
      },
      {
        text: "BERT có thể dùng trực tiếp để sinh văn bản tự hồi quy chất lượng cao như GPT.",
        answer: false,
        note: "Mục tiêu huấn luyện của BERT không phải dự đoán token kế tiếp, và tính hai chiều mâu thuẫn với việc sinh tuần tự.",
      },
      {
        text: "Cả hai đều dựa trên khối transformer và đều dùng cơ chế self-attention.",
        answer: true,
        note: "Khác biệt nằm ở mặt nạ attention và mục tiêu tiền huấn luyện, không nằm ở khối tính toán cơ bản.",
      },
    ],
    trap: "Ý (c) là điểm phân loại: nhiều người biết BERT “mạnh hơn” ở một số bảng xếp hạng nên suy ra nó làm được mọi việc. Năng lực của mô hình bị quyết định bởi *mục tiêu tiền huấn luyện*, không bởi danh tiếng.",
    explanation:
      "Một câu tóm tắt: cùng khối xây dựng, khác mặt nạ và khác mục tiêu huấn luyện, dẫn tới hai họ năng lực khác nhau.",
  },

  /* ---------------- autoencoders ---------------- */
  {
    id: "autoencoders-01",
    syllabusId: "autoencoders",
    difficulty: "recall",
    format: "single-choice",
    stem: "Autoencoder được huấn luyện với mục tiêu gì?",
    choices: [
      "Tái tạo lại chính đầu vào sau khi đi qua một nút thắt cổ chai có số chiều nhỏ hơn.",
      "Phân loại đầu vào vào một trong các lớp cho trước.",
      "Dự đoán token kế tiếp trong chuỗi.",
      "Cực đại hoá khoảng cách giữa các mẫu.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: loss là sai khác giữa đầu vào và bản tái tạo, nên không cần nhãn.",
      "Sai: đó là học có giám sát.",
      "Sai: đó là mô hình ngôn ngữ.",
      "Sai: đó là ý tưởng của contrastive learning.",
    ],
    explanation:
      "Vì nhãn chính là đầu vào, autoencoder thuộc nhóm tự giám sát. Giá trị thu được nằm ở biểu diễn tại nút thắt, không phải ở bản tái tạo.",
  },
  {
    id: "autoencoders-02",
    syllabusId: "autoencoders",
    difficulty: "understand",
    format: "single-choice",
    stem: "Nếu lớp nút thắt của autoencoder có số chiều bằng hoặc lớn hơn đầu vào và không có ràng buộc nào khác, điều gì xảy ra?",
    choices: [
      "Mô hình học được biểu diễn tốt hơn nhờ nhiều chiều hơn.",
      "Mô hình có thể học ánh xạ đồng nhất (chỉ sao chép đầu vào) mà không học được đặc trưng hữu ích nào.",
      "Mô hình không hội tụ được.",
      "Mô hình trở thành mô hình phân loại.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: nhiều chiều hơn ở đây làm mất áp lực buộc phải nén.",
      "Đúng: loss tái tạo về 0 nhưng biểu diễn vô dụng.",
      "Sai: nó hội tụ rất nhanh — về đúng nghiệm tầm thường.",
      "Sai: mục tiêu huấn luyện không đổi.",
    ],
    explanation:
      "Đây là lý do phải có ràng buộc: nút thắt hẹp, phạt thưa, thêm nhiễu (denoising), hoặc ràng buộc phân phối tiềm ẩn (VAE).",
  },
  {
    id: "autoencoders-03",
    syllabusId: "autoencoders",
    difficulty: "apply",
    format: "single-choice",
    stem: "Dùng autoencoder để phát hiện bất thường hoạt động theo nguyên tắc nào?",
    choices: [
      "Huấn luyện trên dữ liệu bình thường; mẫu bất thường sẽ có lỗi tái tạo cao vì mô hình chưa từng học cách nén chúng.",
      "Autoencoder phân loại trực tiếp mẫu bất thường nhờ nhãn ở lớp đầu ra.",
      "Autoencoder đếm số mẫu hiếm trong tập dữ liệu.",
      "Autoencoder gán xác suất cho từng lớp bất thường.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: ngưỡng trên lỗi tái tạo trở thành bộ phát hiện bất thường.",
      "Sai: autoencoder không dùng nhãn.",
      "Sai: nó không thực hiện phép đếm nào.",
      "Sai: autoencoder chuẩn không xuất phân phối lớp.",
    ],
    explanation:
      "Ưu điểm lớn: chỉ cần dữ liệu bình thường, vốn luôn dồi dào hơn nhiều so với mẫu bất thường đã gán nhãn. Ngưỡng lỗi phải chọn trên tập validation có cả hai loại.",
  },
  {
    id: "autoencoders-04",
    syllabusId: "autoencoders",
    difficulty: "apply",
    format: "single-choice",
    stem: "Denoising autoencoder được huấn luyện thế nào?",
    choices: [
      "Đầu vào bị thêm nhiễu, mục tiêu tái tạo là phiên bản sạch ban đầu.",
      "Đầu vào sạch, mục tiêu là tạo ra phiên bản có nhiễu.",
      "Đầu vào và mục tiêu đều có nhiễu như nhau.",
      "Chỉ huấn luyện phần decoder, giữ nguyên encoder.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: mô hình buộc phải học cấu trúc thật của dữ liệu để loại nhiễu.",
      "Sai: đảo ngược mục tiêu.",
      "Sai: khi đó mô hình có thể học sao chép cả nhiễu.",
      "Sai: cả hai phần đều được huấn luyện.",
    ],
    explanation:
      "Thêm nhiễu là cách ràng buộc thay cho nút thắt hẹp: mô hình không thể sao chép đầu vào vì đầu vào đã bị hỏng, nên buộc phải học biểu diễn có ý nghĩa.",
  },
  {
    id: "autoencoders-05",
    syllabusId: "autoencoders",
    difficulty: "advanced",
    format: "single-choice",
    stem: "Một autoencoder chỉ gồm các lớp tuyến tính, huấn luyện với MSE, nút thắt k chiều. Quan hệ của nó với PCA là gì?",
    choices: [
      "Hoàn toàn không liên quan.",
      "Nó học được cùng một không gian con k chiều mà PCA tìm ra, dù các trục học được nói chung không trực giao và không sắp theo phương sai như thành phần chính.",
      "Nó luôn cho kết quả kém hơn PCA về lỗi tái tạo.",
      "Nó tương đương với t-SNE.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: có quan hệ toán học chặt chẽ và đã được chứng minh.",
      "Đúng: cả hai cùng cực tiểu hoá lỗi tái tạo bình phương nên trải cùng một không gian con tối ưu.",
      "Sai: ở nghiệm tối ưu, lỗi tái tạo bằng nhau.",
      "Sai: t-SNE là phương pháp phi tuyến, không tối ưu lỗi tái tạo.",
    ],
    trap: "Bẫy là kết luận “tương đương với PCA” một cách tuyệt đối. Chúng trải cùng không gian con, nhưng cơ sở cụ thể khác nhau, nên không diễn giải trục của autoencoder như thành phần chính được.",
    explanation:
      "Hệ quả thực dụng: autoencoder chỉ đáng dùng thay PCA khi có phi tuyến trong encoder/decoder. Autoencoder tuyến tính vừa chậm hơn vừa khó tái lập hơn PCA.",
  },

  /* ---------------- dl-regularization ---------------- */
  {
    id: "dl-regularization-01",
    syllabusId: "dl-regularization",
    difficulty: "recall",
    format: "single-choice",
    stem: "Dropout hoạt động thế nào trong giai đoạn huấn luyện?",
    choices: [
      "Tạm thời vô hiệu hoá ngẫu nhiên một tỷ lệ các đơn vị trong lớp ở mỗi bước.",
      "Xoá vĩnh viễn các nơ-ron có trọng số nhỏ.",
      "Giảm learning rate theo tỷ lệ p.",
      "Bỏ ngẫu nhiên một số mẫu khỏi batch.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: mỗi bước huấn luyện làm việc với một mạng con khác nhau.",
      "Sai: đó là pruning, thực hiện sau huấn luyện.",
      "Sai: dropout không liên quan learning rate.",
      "Sai: dropout tác động lên đơn vị kích hoạt, không lên mẫu.",
    ],
    explanation:
      "Cách hiểu hữu ích: dropout xấp xỉ việc lấy trung bình một tập rất lớn các mạng con chia sẻ trọng số, và ngăn các nơ-ron đồng thích nghi với nhau.",
  },
  {
    id: "dl-regularization-02",
    syllabusId: "dl-regularization",
    difficulty: "understand",
    format: "single-choice",
    stem: "Ở giai đoạn suy luận, dropout được xử lý thế nào?",
    choices: [
      "Vẫn tắt ngẫu nhiên các nơ-ron như khi huấn luyện.",
      "Tắt hoàn toàn dropout, và kích hoạt được chia tỷ lệ phù hợp (thường đã xử lý sẵn bằng inverted dropout lúc huấn luyện) để kỳ vọng đầu ra khớp nhau.",
      "Tăng tỷ lệ dropout lên gấp đôi.",
      "Dropout được thay bằng batch normalization.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: suy luận phải xác định, không được ngẫu nhiên.",
      "Đúng: cài đặt hiện đại chia cho (1 − p) ngay khi huấn luyện, nên lúc suy luận chỉ cần tắt.",
      "Sai: không có cơ chế nào như vậy.",
      "Sai: hai kỹ thuật độc lập.",
    ],
    explanation:
      "Đây chính là việc mà `model.eval()` làm. Quên gọi `eval()` khiến kết quả đánh giá dao động ngẫu nhiên giữa các lần chạy trên cùng dữ liệu.",
  },
  {
    id: "dl-regularization-03",
    syllabusId: "dl-regularization",
    difficulty: "apply",
    format: "numeric",
    stem: "Một lớp có 200 nơ-ron, dropout với p = 0.5. Kỳ vọng số nơ-ron còn hoạt động trong một bước huấn luyện là bao nhiêu?",
    answer: 100,
    tolerance: 0,
    calculation: [
      "Mỗi nơ-ron được giữ lại với xác suất 1 − p = 0.5.",
      "Kỳ vọng: 200 × 0.5 = 100 nơ-ron.",
    ],
    explanation:
      "Vì chỉ khoảng một nửa số đơn vị hoạt động ở mỗi bước, mạng dùng dropout mạnh thường cần nhiều epoch hơn để hội tụ so với mạng không dùng.",
  },
  {
    id: "dl-regularization-04",
    syllabusId: "dl-regularization",
    difficulty: "apply",
    format: "single-choice",
    stem: "Với bài toán thị giác máy tính có ít dữ liệu gán nhãn, biện pháp regularization nào thường mang lại cải thiện lớn nhất?",
    choices: [
      "Tăng tỷ lệ dropout lên 0.9.",
      "Data augmentation phù hợp với bất biến của bài toán (lật, cắt ngẫu nhiên, đổi màu nhẹ), kết hợp với transfer learning.",
      "Giảm số epoch xuống còn 1.",
      "Tăng learning rate.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: dropout quá mạnh làm mô hình không học nổi.",
      "Đúng: augmentation bơm thêm thông tin về bất biến thật của bài toán, thứ mà dropout không làm được.",
      "Sai: đó là dừng huấn luyện chứ không phải regularization hợp lý.",
      "Sai: learning rate không phải công cụ regularization ở đây.",
    ],
    explanation:
      "Lưu ý phép biến đổi phải bảo toàn nhãn: lật ngang hợp lý với ảnh mèo/chó nhưng sai với biển báo giao thông hoặc chữ số.",
  },
  {
    id: "dl-regularization-05",
    syllabusId: "dl-regularization",
    difficulty: "advanced",
    format: "single-choice",
    stem: "Đặt dropout ngay trước một lớp batch normalization thường gây vấn đề gì?",
    choices: [
      "Không có vấn đề gì, đây là thứ tự chuẩn.",
      "Dropout làm phương sai của kích hoạt khác nhau giữa lúc huấn luyện và lúc suy luận, khiến thống kê chạy mà BatchNorm tích luỹ không còn khớp với phân phối lúc suy luận.",
      "Mô hình sẽ báo lỗi shape.",
      "Gradient trở thành NaN.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: đây là tổ hợp đã được ghi nhận là gây bất hoà phương sai.",
      "Đúng: BatchNorm học thống kê trên kích hoạt *đã bị dropout*, nhưng lúc suy luận dropout đã tắt.",
      "Sai: shape không đổi.",
      "Sai: không gây NaN, chỉ làm kết quả kém đi một cách khó truy vết.",
    ],
    trap: "Bẫy là hiện tượng chỉ lộ ra ở khoảng cách giữa điểm train và điểm test, rất dễ bị quy nhầm cho overfitting thông thường.",
    explanation:
      "Thực hành phổ biến: nếu đã dùng BatchNorm thì giảm hoặc bỏ dropout ở các lớp tích chập, và nếu vẫn cần dropout thì đặt sau BatchNorm hoặc chỉ dùng ở phần đầu phân loại.",
  },

  /* ---------------- initialization ---------------- */
  {
    id: "initialization-01",
    syllabusId: "initialization",
    difficulty: "recall",
    format: "single-choice",
    stem: "Khởi tạo toàn bộ trọng số của một lớp bằng 0 gây hậu quả gì?",
    choices: [
      "Mọi nơ-ron trong lớp nhận cùng gradient và cập nhật giống hệt nhau, nên lớp đó mãi chỉ biểu diễn được một đặc trưng duy nhất.",
      "Mạng hội tụ nhanh hơn vì xuất phát từ điểm trung lập.",
      "Gradient trở thành NaN ngay bước đầu.",
      "Không ảnh hưởng gì vì gradient sẽ phá vỡ sự đối xứng.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: đây là vấn đề phá vỡ đối xứng (symmetry breaking).",
      "Sai: mạng gần như không học được gì có ích.",
      "Sai: không có NaN, chỉ là mô hình mất năng lực.",
      "Sai: gradient của các nơ-ron giống nhau nên đối xứng được duy trì mãi.",
    ],
    explanation:
      "Riêng bias thì khởi tạo bằng 0 hoàn toàn được, vì tính đối xứng đã bị phá vỡ bởi trọng số ngẫu nhiên.",
  },
  {
    id: "initialization-02",
    syllabusId: "initialization",
    difficulty: "understand",
    format: "single-choice",
    stem: "Mục tiêu chung của các sơ đồ khởi tạo như Xavier/Glorot và He là gì?",
    choices: [
      "Làm cho trọng số ban đầu càng nhỏ càng tốt.",
      "Giữ phương sai của tín hiệu (và của gradient) ổn định khi truyền qua nhiều lớp, tránh bùng nổ hoặc tiêu biến.",
      "Bảo đảm mọi trọng số đều dương.",
      "Làm cho tất cả các lớp có cùng số tham số.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: quá nhỏ cũng gây tiêu biến tín hiệu.",
      "Đúng: phương sai khởi tạo được đặt theo số đầu vào/đầu ra của lớp chính vì mục tiêu này.",
      "Sai: trọng số cần cả dấu dương lẫn âm.",
      "Sai: số tham số do kiến trúc quyết định.",
    ],
    explanation:
      "Xavier phù hợp với hàm kích hoạt đối xứng quanh 0 như tanh; He nhân đôi phương sai để bù cho việc ReLU cắt bỏ một nửa miền giá trị.",
  },
  {
    id: "initialization-03",
    syllabusId: "initialization",
    difficulty: "apply",
    format: "single-choice",
    stem: "Mạng dùng ReLU ở mọi lớp ẩn thì nên chọn sơ đồ khởi tạo nào?",
    choices: ["Xavier/Glorot", "He (Kaiming)", "Khởi tạo toàn 0", "Khởi tạo toàn 1"],
    answerIndex: 1,
    choiceNotes: [
      "Sai: Xavier được suy ra cho hàm kích hoạt đối xứng, sẽ hơi nhỏ với ReLU.",
      "Đúng: He được thiết kế riêng cho ReLU và các biến thể.",
      "Sai: gây lỗi đối xứng.",
      "Sai: cũng gây lỗi đối xứng và làm kích hoạt bùng nổ.",
    ],
    explanation:
      "ReLU đưa khoảng một nửa số kích hoạt về 0, làm phương sai tín hiệu giảm một nửa qua mỗi lớp; He bù lại bằng hệ số 2 trong công thức phương sai.",
  },
  {
    id: "initialization-04",
    syllabusId: "initialization",
    difficulty: "apply",
    format: "single-choice",
    stem: "Khởi tạo trọng số với phương sai quá lớn trong mạng sâu dẫn tới hiện tượng gì ở những bước đầu?",
    choices: [
      "Kích hoạt và gradient bùng nổ theo độ sâu, loss rất lớn hoặc thành NaN ngay từ đầu.",
      "Mạng hội tụ ngay ở epoch đầu tiên.",
      "Mọi kích hoạt về 0.",
      "Mô hình bỏ qua lớp đầu tiên.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: mỗi lớp nhân phương sai lên, hiệu ứng luỹ thừa theo số lớp.",
      "Sai: không có chuyện đó.",
      "Sai: đó là hệ quả của khởi tạo quá nhỏ.",
      "Sai: không có cơ chế bỏ qua lớp.",
    ],
    explanation:
      "Chẩn đoán nhanh: in giá trị trung bình và độ lệch chuẩn của kích hoạt từng lớp ở batch đầu tiên. Nếu độ lệch chuẩn tăng dần theo độ sâu thì khởi tạo quá lớn.",
  },
  {
    id: "initialization-05",
    syllabusId: "initialization",
    difficulty: "advanced",
    format: "true-false-set",
    stem: "Xét vai trò của khởi tạo trong mạng sâu hiện đại.",
    statements: [
      {
        text: "Bias có thể được khởi tạo bằng 0 mà không gây vấn đề đối xứng.",
        answer: true,
        note: "Trọng số ngẫu nhiên đã đủ để phá vỡ đối xứng giữa các nơ-ron.",
      },
      {
        text: "Batch normalization và các lớp chuẩn hoá khác làm mô hình bớt nhạy cảm với lựa chọn khởi tạo.",
        answer: true,
        note: "Vì thống kê kích hoạt được chuẩn hoá lại ở mỗi lớp, sai lệch thang đo ban đầu bị hiệu chỉnh.",
      },
      {
        text: "Khi finetune một mô hình pretrained, ta vẫn nên khởi tạo lại toàn bộ trọng số theo He để bảo đảm ổn định.",
        answer: false,
        note: "Làm vậy sẽ xoá sạch toàn bộ tri thức đã học — chỉ lớp head mới thêm mới cần khởi tạo ngẫu nhiên.",
      },
      {
        text: "Khởi tạo là siêu tham số ảnh hưởng chủ yếu tới giai đoạn đầu huấn luyện, nhưng có thể quyết định việc mạng rất sâu có huấn luyện được hay không.",
        answer: true,
        note: "Trước khi có chuẩn hoá và kết nối tắt, khởi tạo là rào cản chính khiến mạng sâu không huấn luyện được.",
      },
    ],
    trap: "Ý (c) là bẫy nguy hiểm nhất trong thực hành: nó nghe giống một “thực hành tốt” nhưng thực chất phá huỷ toàn bộ giá trị của transfer learning.",
    explanation:
      "Quy tắc khi finetune: giữ nguyên trọng số pretrained, chỉ khởi tạo ngẫu nhiên phần head mới, và dùng learning rate nhỏ hơn cho phần thân mạng.",
  },

  /* ---------------- batch-norm ---------------- */
  {
    id: "batch-norm-01",
    syllabusId: "batch-norm",
    difficulty: "recall",
    format: "single-choice",
    stem: "Batch normalization làm gì trong lượt truyền xuôi lúc huấn luyện?",
    choices: [
      "Chuẩn hoá kích hoạt theo trung bình và phương sai của batch hiện tại, rồi co giãn/dịch bằng hai tham số học được γ và β.",
      "Chuẩn hoá trọng số của lớp về chuẩn đơn vị.",
      "Chuẩn hoá nhãn đầu ra.",
      "Loại bỏ các mẫu ngoại lai khỏi batch.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: chuẩn hoá rồi cho mô hình quyền học lại thang đo và độ dịch phù hợp.",
      "Sai: đó là weight normalization.",
      "Sai: BatchNorm tác động lên kích hoạt bên trong mạng.",
      "Sai: BatchNorm không loại bỏ mẫu.",
    ],
    explanation:
      "γ và β quan trọng: chúng cho phép mạng khôi phục lại phân phối gốc nếu việc chuẩn hoá là bất lợi, nên BatchNorm không bao giờ làm giảm năng lực biểu diễn.",
  },
  {
    id: "batch-norm-02",
    syllabusId: "batch-norm",
    difficulty: "understand",
    format: "single-choice",
    stem: "Vì sao BatchNorm hành xử khác nhau giữa `train` và `eval`?",
    choices: [
      "Vì lúc eval không có gradient.",
      "Vì lúc huấn luyện nó dùng thống kê của batch hiện tại, còn lúc suy luận phải dùng thống kê chạy tích luỹ được, để đầu ra của một mẫu không phụ thuộc các mẫu khác trong batch.",
      "Vì γ và β chỉ tồn tại lúc huấn luyện.",
      "Vì lúc eval batch size luôn bằng 1.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: việc có gradient hay không là chuyện của autograd.",
      "Đúng: suy luận phải xác định và độc lập giữa các mẫu.",
      "Sai: γ và β là tham số cố định, dùng ở cả hai chế độ.",
      "Sai: batch size lúc eval có thể bất kỳ.",
    ],
    explanation:
      "Nếu dùng thống kê batch lúc suy luận, dự đoán cho một ảnh sẽ đổi tuỳ theo những ảnh nào tình cờ nằm cùng batch — hành vi không chấp nhận được trong sản phẩm.",
  },
  {
    id: "batch-norm-03",
    syllabusId: "batch-norm",
    difficulty: "apply",
    format: "single-choice",
    stem: "Huấn luyện mô hình phát hiện đối tượng với batch size chỉ 2 ảnh do giới hạn bộ nhớ. BatchNorm gây vấn đề gì và nên thay bằng gì?",
    choices: [
      "Không vấn đề gì, BatchNorm hoạt động tốt với mọi batch size.",
      "Thống kê tính trên 2 mẫu rất nhiễu khiến huấn luyện bất ổn; nên dùng GroupNorm hoặc LayerNorm vì chúng không phụ thuộc kích thước batch.",
      "Nên tăng learning rate để bù lại.",
      "Nên bỏ hoàn toàn mọi lớp chuẩn hoá.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: chất lượng ước lượng thống kê phụ thuộc trực tiếp vào số mẫu trong batch.",
      "Đúng: GroupNorm chuẩn hoá theo nhóm kênh trong từng mẫu nên hoàn toàn độc lập với batch size.",
      "Sai: learning rate không sửa được nhiễu thống kê.",
      "Sai: bỏ chuẩn hoá thường làm huấn luyện khó hơn nữa.",
    ],
    explanation:
      "Đây chính là lý do GroupNorm ra đời và được dùng rộng rãi trong phát hiện đối tượng và phân đoạn, nơi ảnh lớn buộc batch phải nhỏ.",
  },
  {
    id: "batch-norm-04",
    syllabusId: "batch-norm",
    difficulty: "apply",
    format: "single-choice",
    stem: "Vì sao lớp Linear/Conv đứng ngay trước BatchNorm thường được đặt `bias=False`?",
    choices: [
      "Để giảm thời gian huấn luyện xuống một nửa.",
      "Vì BatchNorm trừ đi trung bình nên mọi hằng số cộng thêm bị triệt tiêu; vai trò dịch chuyển đã do tham số β của BatchNorm đảm nhiệm.",
      "Vì bias làm gradient bùng nổ.",
      "Vì BatchNorm không tương thích với bias về mặt kiểu dữ liệu.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: mức tiết kiệm không đáng kể.",
      "Đúng: bias trở thành tham số thừa, không ảnh hưởng đầu ra.",
      "Sai: bias không gây bùng nổ.",
      "Sai: không có xung đột kiểu dữ liệu nào.",
    ],
    explanation:
      "Chi tiết nhỏ nhưng cho thấy đã hiểu cơ chế: phép trừ trung bình xoá mọi độ dịch cố định, nên giữ bias chỉ tốn tham số mà không thêm năng lực.",
  },
  {
    id: "batch-norm-05",
    syllabusId: "batch-norm",
    difficulty: "advanced",
    format: "single-choice",
    stem: "Vì sao transformer dùng LayerNorm thay vì BatchNorm?",
    choices: [
      "Vì LayerNorm tính nhanh hơn nhiều lần.",
      "Vì LayerNorm chuẩn hoá trong từng mẫu theo chiều đặc trưng nên không phụ thuộc batch và xử lý được chuỗi có độ dài thay đổi cùng padding, trong khi BatchNorm cần thống kê ổn định trên batch và bị nhiễu bởi token đệm.",
      "Vì BatchNorm không dùng được với dữ liệu văn bản về mặt kiểu dữ liệu.",
      "Vì LayerNorm không có tham số học được nên ít overfit hơn.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: chi phí tính toán của hai phương pháp tương đương.",
      "Đúng: tính độc lập giữa các mẫu là yêu cầu then chốt với chuỗi độ dài biến thiên.",
      "Sai: không có rào cản kiểu dữ liệu.",
      "Sai: LayerNorm cũng có γ và β học được.",
    ],
    trap: "Bẫy là quy mọi khác biệt về tốc độ. Lý do thật thuộc về ngữ nghĩa dữ liệu: chuỗi dài ngắn khác nhau làm thống kê theo batch mất ý nghĩa.",
    explanation:
      "Nắm được trục chuẩn hoá là chìa khoá: BatchNorm gộp theo *batch* cho mỗi kênh; LayerNorm gộp theo *đặc trưng* trong từng mẫu; GroupNorm ở giữa hai cực đó.",
  },

  /* ---------------- finetuning ---------------- */
  {
    id: "finetuning-01",
    syllabusId: "finetuning",
    difficulty: "recall",
    format: "single-choice",
    stem: "Transfer learning trong học sâu nghĩa là gì?",
    choices: [
      "Dùng mô hình đã được huấn luyện trước trên tập dữ liệu lớn làm điểm khởi đầu cho một nhiệm vụ mới liên quan.",
      "Chuyển mô hình từ CPU sang GPU.",
      "Chuyển dữ liệu giữa các định dạng lưu trữ khác nhau.",
      "Huấn luyện nhiều mô hình rồi lấy trung bình dự đoán.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: các đặc trưng tổng quát học được ở nhiệm vụ nguồn được tái sử dụng.",
      "Sai: đó chỉ là chuyển thiết bị.",
      "Sai: đó là chuyển đổi dữ liệu.",
      "Sai: đó là ensemble.",
    ],
    explanation:
      "Cơ sở của transfer learning: các lớp đầu học đặc trưng phổ quát (cạnh, kết cấu, hình thái ngôn ngữ cơ bản) dùng lại được cho hầu hết nhiệm vụ cùng miền dữ liệu.",
  },
  {
    id: "finetuning-02",
    syllabusId: "finetuning",
    difficulty: "understand",
    format: "single-choice",
    stem: "Vì sao khi finetune nên dùng learning rate nhỏ hơn nhiều so với khi huấn luyện từ đầu?",
    choices: [
      "Vì mô hình pretrained có nhiều tham số hơn.",
      "Vì trọng số pretrained đã ở gần một nghiệm tốt; bước lớn sẽ phá huỷ tri thức đã học trước khi mô hình kịp thích nghi với nhiệm vụ mới.",
      "Vì learning rate lớn làm mô hình chạy chậm hơn.",
      "Vì bộ nhớ GPU không đủ cho learning rate lớn.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: số tham số không quyết định điều này.",
      "Đúng: đây là hiện tượng catastrophic forgetting.",
      "Sai: learning rate không ảnh hưởng tốc độ mỗi bước.",
      "Sai: learning rate không liên quan tới dung lượng bộ nhớ.",
    ],
    explanation:
      "Thực hành phổ biến: dùng learning rate phân tầng — rất nhỏ cho các lớp gần đầu vào, lớn hơn cho các lớp gần đầu ra, và lớn nhất cho head mới khởi tạo.",
  },
  {
    id: "finetuning-03",
    syllabusId: "finetuning",
    difficulty: "apply",
    format: "single-choice",
    stem: "Có 500 ảnh gán nhãn cho một nhiệm vụ rất gần với ImageNet. Chiến lược hợp lý nhất là gì?",
    choices: [
      "Huấn luyện một CNN từ đầu.",
      "Đóng băng phần thân mạng pretrained, chỉ huấn luyện lớp phân loại mới; nếu còn dư dữ liệu và thời gian thì mở dần vài lớp cuối với learning rate rất nhỏ.",
      "Finetune toàn bộ mạng với learning rate lớn.",
      "Dùng mô hình pretrained mà không huấn luyện thêm gì cả.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: 500 ảnh quá ít để huấn luyện từ đầu, sẽ overfit nặng.",
      "Đúng: ít dữ liệu và miền gần nhau là điều kiện điển hình cho việc chỉ huấn luyện head.",
      "Sai: rất dễ phá hỏng trọng số pretrained với ít dữ liệu như vậy.",
      "Sai: lớp phân loại cũ ứng với 1.000 lớp ImageNet, không dùng cho nhãn mới được.",
    ],
    explanation:
      "Quy tắc bốn ô: ít dữ liệu + miền gần ⇒ chỉ huấn luyện head; nhiều dữ liệu + miền xa ⇒ finetune toàn bộ (hoặc huấn luyện từ đầu); hai ô còn lại nằm giữa.",
  },
  {
    id: "finetuning-04",
    syllabusId: "finetuning",
    difficulty: "apply",
    format: "single-choice",
    stem: "Mục đích chính của các phương pháp finetuning hiệu quả tham số như LoRA là gì?",
    choices: [
      "Tăng độ chính xác vượt xa finetuning toàn bộ trong mọi trường hợp.",
      "Chỉ huấn luyện một lượng nhỏ tham số thêm vào (giữ nguyên trọng số gốc), nhờ đó giảm mạnh bộ nhớ và chi phí lưu trữ khi thích ứng mô hình lớn cho nhiều nhiệm vụ.",
      "Nén mô hình xuống độ chính xác 8 bit.",
      "Loại bỏ nhu cầu dùng dữ liệu gán nhãn.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: mục tiêu là đạt kết quả *xấp xỉ* với chi phí thấp hơn nhiều.",
      "Đúng: mỗi nhiệm vụ chỉ cần lưu một bộ adapter nhỏ thay vì một bản sao toàn bộ mô hình.",
      "Sai: đó là quantization, một kỹ thuật khác.",
      "Sai: vẫn cần dữ liệu cho nhiệm vụ đích.",
    ],
    explanation:
      "LoRA phân tích cập nhật trọng số thành tích hai ma trận hạng thấp. Với mô hình hàng tỷ tham số, số tham số cần huấn luyện có thể giảm xuống dưới 1%.",
  },
  {
    id: "finetuning-05",
    syllabusId: "finetuning",
    difficulty: "advanced",
    format: "single-choice",
    stem: "Sau khi finetune trên nhiệm vụ mới, mô hình đạt kết quả tốt ở nhiệm vụ đó nhưng mất gần hết năng lực ở nhiệm vụ gốc. Hiện tượng này gọi là gì và cách giảm thiểu hợp lý là gì?",
    choices: [
      "Overfitting; giảm bằng cách thêm dropout.",
      "Catastrophic forgetting; giảm bằng learning rate nhỏ, đóng băng một phần mạng, dùng adapter/LoRA giữ nguyên trọng số gốc, hoặc trộn thêm dữ liệu của nhiệm vụ gốc khi huấn luyện.",
      "Vanishing gradient; giảm bằng cách đổi hàm kích hoạt.",
      "Data leakage; giảm bằng cách chia lại dữ liệu.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: overfitting là kém trên dữ liệu *mới* của cùng nhiệm vụ, không phải mất năng lực nhiệm vụ cũ.",
      "Đúng: nhận đúng tên hiện tượng và bốn hướng xử lý tương ứng.",
      "Sai: đây không phải vấn đề luồng gradient.",
      "Sai: không liên quan tới cách chia dữ liệu.",
    ],
    trap: "Bẫy là gộp mọi suy giảm hiệu năng vào nhãn “overfitting”. Ở đây mô hình vẫn tổng quát hoá tốt cho nhiệm vụ mới — thứ bị mất là tri thức cũ.",
    explanation:
      "Nếu cần giữ cả hai năng lực, hướng an toàn nhất là adapter/LoRA: trọng số gốc không đổi nên luôn khôi phục được hành vi ban đầu bằng cách gỡ adapter.",
  },
];
