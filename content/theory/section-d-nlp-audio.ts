/**
 * Section D — NLP và Audio: phân loại văn bản, encoder văn bản tiền huấn luyện
 * (BERT), mô hình ngôn ngữ, kiến trúc encoder–decoder, mô hình ngôn ngữ lớn,
 * encoder audio tự giám sát (HuBERT) và các mô hình audio (Whisper, Qwen-Audio,
 * Voxtral).
 *
 * Mỗi mục syllabus có 5 câu: 1 Nhận biết, 1 Thông hiểu, 2 Vận dụng,
 * 1 Vận dụng cao.
 */

import type { TheoryQuestion } from "./types";

export const sectionDQuestions: readonly TheoryQuestion[] = [
  /* ---------------- text-classification ---------------- */
  {
    id: "text-classification-01",
    syllabusId: "text-classification",
    difficulty: "recall",
    format: "single-choice",
    stem: "Biểu diễn bag-of-words của một văn bản là gì?",
    choices: [
      "Vector đếm (hoặc trọng số) số lần xuất hiện của từng từ trong từ vựng, bỏ qua thứ tự từ.",
      "Chuỗi các chỉ số từ theo đúng thứ tự xuất hiện.",
      "Vector dày học được từ mạng nơ-ron.",
      "Cây cú pháp của câu.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: mỗi chiều ứng với một từ trong từ vựng.",
      "Sai: bag-of-words cố tình bỏ thứ tự.",
      "Sai: đó là embedding.",
      "Sai: đó là phân tích cú pháp.",
    ],
    explanation:
      "Vector bag-of-words rất thưa và có số chiều bằng kích thước từ vựng. Dù đơn giản, nó vẫn là baseline mạnh cho phân loại chủ đề văn bản.",
  },
  {
    id: "text-classification-02",
    syllabusId: "text-classification",
    difficulty: "understand",
    format: "single-choice",
    stem: "Thành phần IDF trong TF-IDF phục vụ mục đích gì?",
    choices: [
      "Tăng trọng số cho các từ xuất hiện trong nhiều tài liệu.",
      "Hạ trọng số các từ xuất hiện ở hầu hết tài liệu (như “và”, “của”) và nâng trọng số các từ hiếm, mang nhiều thông tin phân biệt hơn.",
      "Chuẩn hoá độ dài của tài liệu.",
      "Loại bỏ các từ viết sai chính tả.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: đảo ngược đúng ý nghĩa của “inverse”.",
      "Đúng: IDF = log(N/df) nên df càng lớn thì trọng số càng nhỏ.",
      "Sai: chuẩn hoá độ dài là bước riêng, thường dùng chuẩn L2.",
      "Sai: TF-IDF không sửa chính tả.",
    ],
    explanation:
      "Nếu chỉ dùng TF, các hư từ có tần suất cao nhất sẽ chi phối vector. IDF là cách tự động hạ trọng số chúng mà không cần danh sách stopword thủ công.",
  },
  {
    id: "text-classification-03",
    syllabusId: "text-classification",
    difficulty: "apply",
    format: "numeric",
    stem: "Kho có 1.000 tài liệu, một từ xuất hiện trong 10 tài liệu. Tính IDF = log₁₀(N/df).",
    answer: 2,
    tolerance: 0.01,
    calculation: ["N/df = 1000/10 = 100.", "IDF = log₁₀(100) = 2."],
    explanation:
      "Đối chiếu: từ xuất hiện ở cả 1.000 tài liệu cho IDF = log₁₀(1) = 0, tức bị loại bỏ hoàn toàn khỏi vector. Lưu ý nhiều thư viện dùng biến thể có cộng thêm 1 để tránh chia 0.",
  },
  {
    id: "text-classification-04",
    syllabusId: "text-classification",
    difficulty: "apply",
    format: "single-choice",
    stem: "Mô hình phân tích cảm xúc dùng unigram bag-of-words phân loại sai câu “phim này không hay chút nào” thành tích cực. Cách khắc phục đơn giản và hợp lý nhất là gì?",
    choices: [
      "Tăng số lượng tài liệu huấn luyện lên gấp mười.",
      "Bổ sung n-gram (bigram/trigram) để mô hình nắm được cụm phủ định như “không hay”, hoặc chuyển sang mô hình có ngữ cảnh.",
      "Loại bỏ từ “không” khỏi từ vựng.",
      "Chuyển sang bài toán hồi quy.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: thêm dữ liệu không sửa được hạn chế biểu diễn: unigram không bao giờ thấy được quan hệ phủ định.",
      "Đúng: bigram “không hay” trở thành một đặc trưng riêng mang dấu tiêu cực.",
      "Sai: loại bỏ từ phủ định làm mất chính thông tin quyết định.",
      "Sai: bản chất bài toán vẫn là phân loại.",
    ],
    explanation:
      "Đây là ví dụ điển hình về giới hạn của biểu diễn bỏ qua thứ tự: “không hay” và “hay không” cho cùng một vector unigram.",
  },
  {
    id: "text-classification-05",
    syllabusId: "text-classification",
    difficulty: "advanced",
    format: "single-choice",
    stem: "So với TF-IDF, ưu thế cốt lõi của biểu diễn theo ngữ cảnh (như BERT) trong phân loại văn bản là gì?",
    choices: [
      "Nó luôn nhanh hơn khi suy luận.",
      "Cùng một từ nhận biểu diễn khác nhau tuỳ ngữ cảnh, nên mô hình phân biệt được các nghĩa khác nhau và nắm được quan hệ phụ thuộc xa; đổi lại chi phí tính toán cao hơn nhiều.",
      "Nó không cần dữ liệu huấn luyện.",
      "Nó tạo ra vector thưa nên tiết kiệm bộ nhớ hơn.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: TF-IDF cộng mô hình tuyến tính nhanh hơn hàng trăm lần khi suy luận.",
      "Đúng: nêu đúng cả ưu thế lẫn cái giá phải trả.",
      "Sai: vẫn cần dữ liệu để finetune, dù ít hơn nhờ tiền huấn luyện.",
      "Sai: embedding theo ngữ cảnh là vector dày.",
    ],
    trap: "Bẫy là mặc định “mô hình hiện đại luôn là lựa chọn đúng”. Với phân loại chủ đề đơn giản, dữ liệu nhỏ và yêu cầu độ trễ thấp, TF-IDF cộng logistic regression thường là lựa chọn hợp lý hơn.",
    explanation:
      "Quy trình đúng là luôn dựng baseline TF-IDF trước: nó rẻ, tái lập được và cho biết mô hình phức tạp thật sự mang lại thêm bao nhiêu.",
  },

  /* ---------------- bert ---------------- */
  {
    id: "bert-01",
    syllabusId: "bert",
    difficulty: "recall",
    format: "single-choice",
    stem: "Nhiệm vụ tiền huấn luyện chính của BERT là gì?",
    choices: [
      "Masked language modeling: che ngẫu nhiên một số token và huấn luyện mô hình dự đoán chúng từ ngữ cảnh hai phía.",
      "Dự đoán token kế tiếp theo chiều trái sang phải.",
      "Dịch câu sang một ngôn ngữ khác.",
      "Tái tạo lại câu từ một vector nén.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: khoảng 15% token được chọn để che trong công thức gốc.",
      "Sai: đó là mục tiêu của mô hình kiểu GPT.",
      "Sai: dịch máy là nhiệm vụ hạ nguồn, không phải mục tiêu tiền huấn luyện của BERT.",
      "Sai: đó là autoencoder.",
    ],
    explanation:
      "Chính việc phải đoán token bị che từ *cả hai phía* mang lại tính hai chiều — điều mô hình tự hồi quy không có được.",
  },
  {
    id: "bert-02",
    syllabusId: "bert",
    difficulty: "understand",
    format: "single-choice",
    stem: "Token `[CLS]` trong BERT dùng để làm gì?",
    choices: [
      "Đánh dấu kết thúc câu.",
      "Đứng đầu chuỗi và biểu diễn tương ứng của nó được dùng làm vector tổng hợp cho cả câu trong các nhiệm vụ phân loại.",
      "Thay thế các token bị che.",
      "Phân tách hai câu trong cặp câu đầu vào.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: kết thúc chuỗi thường là `[SEP]`.",
      "Đúng: người ta gắn một lớp phân loại lên trên biểu diễn của `[CLS]`.",
      "Sai: token che là `[MASK]`.",
      "Sai: đó là vai trò của `[SEP]`.",
    ],
    explanation:
      "Vì self-attention cho phép `[CLS]` nhìn toàn bộ chuỗi, biểu diễn của nó tổng hợp được thông tin toàn câu sau khi được finetune cho nhiệm vụ cụ thể.",
  },
  {
    id: "bert-03",
    syllabusId: "bert",
    difficulty: "apply",
    format: "single-choice",
    stem: "Tokenizer subword (WordPiece/BPE) xử lý một từ chưa từng xuất hiện trong từ vựng như thế nào?",
    choices: [
      "Thay bằng token `[UNK]` và mất toàn bộ thông tin.",
      "Tách thành các mảnh subword đã có trong từ vựng, nhờ đó vẫn giữ được một phần thông tin hình thái.",
      "Bỏ qua từ đó khỏi chuỗi.",
      "Tự động thêm từ mới vào từ vựng và huấn luyện lại.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: `[UNK]` chỉ dùng cho ký tự thực sự không xử lý được; subword giảm mạnh tần suất này.",
      "Đúng: ví dụ một từ hiếm được tách thành vài mảnh có nghĩa hình thái.",
      "Sai: không có token nào bị bỏ.",
      "Sai: từ vựng cố định sau khi huấn luyện tokenizer.",
    ],
    explanation:
      "Đây là lý do subword tokenization trở thành chuẩn: nó cân bằng giữa từ vựng ở mức từ (nhiều OOV) và ở mức ký tự (chuỗi quá dài).",
  },
  {
    id: "bert-04",
    syllabusId: "bert",
    difficulty: "apply",
    format: "single-choice",
    stem: "Finetune BERT cho bài toán phân loại 3 lớp cần làm gì?",
    choices: [
      "Huấn luyện lại BERT từ đầu trên dữ liệu của bài toán.",
      "Thêm một lớp phân loại (3 đầu ra) lên trên biểu diễn `[CLS]`, rồi huấn luyện toàn bộ (hoặc một phần) với learning rate nhỏ, cỡ 2e-5.",
      "Chỉ thay tokenizer bằng tokenizer mới.",
      "Đóng băng toàn bộ mô hình và không huấn luyện gì thêm.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: như vậy là vứt bỏ toàn bộ giá trị tiền huấn luyện.",
      "Đúng: đây là công thức finetune tiêu chuẩn.",
      "Sai: đổi tokenizer làm biểu diễn không còn khớp với trọng số đã học.",
      "Sai: vẫn cần ít nhất huấn luyện phần head mới.",
    ],
    explanation:
      "Khoảng learning rate 2e-5 đến 5e-5 và 2–4 epoch là công thức kinh nghiệm phổ biến; learning rate lớn hơn thường phá hỏng trọng số pretrained.",
  },
  {
    id: "bert-05",
    syllabusId: "bert",
    difficulty: "advanced",
    format: "single-choice",
    stem: "Cần phân loại tài liệu dài 5.000 token bằng BERT (giới hạn 512 token). Hướng xử lý hợp lý nhất là gì?",
    choices: [
      "Cắt lấy 512 token đầu và coi như đủ, không cần cân nhắc gì thêm.",
      "Cân nhắc nhiều hướng: chia tài liệu thành các đoạn chồng lấn rồi tổng hợp dự đoán, hoặc dùng mô hình hỗ trợ ngữ cảnh dài (Longformer, BigBird), hoặc rút trích trước các đoạn liên quan nhất.",
      "Tăng kích thước positional embedding lên 5.000 mà giữ nguyên trọng số pretrained.",
      "Nén văn bản bằng thuật toán nén dữ liệu rồi đưa vào mô hình.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: có thể tạm chấp nhận với một số loại văn bản, nhưng bỏ qua 90% nội dung là quyết định phải được kiểm chứng chứ không mặc định.",
      "Đúng: nêu được ba hướng chuẩn và cho thấy hiểu nguồn gốc giới hạn.",
      "Sai: positional embedding chỉ được học tới vị trí 512; mở rộng tuỳ tiện làm các vị trí mới vô nghĩa.",
      "Sai: nén dữ liệu không tạo ra chuỗi token có nghĩa.",
    ],
    trap: "Bẫy là quên rằng giới hạn 512 bắt nguồn từ chi phí attention bậc hai *và* từ phạm vi positional embedding đã học, nên không thể nới ra bằng một dòng cấu hình.",
    explanation:
      "Chọn hướng nào phụ thuộc bài toán: nếu tín hiệu phân tán khắp tài liệu thì chia đoạn rồi tổng hợp; nếu tập trung ở vài đoạn thì rút trích trước sẽ vừa rẻ vừa chính xác hơn.",
  },

  /* ---------------- language-modeling ---------------- */
  {
    id: "language-modeling-01",
    syllabusId: "language-modeling",
    difficulty: "recall",
    format: "single-choice",
    stem: "Mô hình ngôn ngữ tự hồi quy được huấn luyện để làm gì?",
    choices: [
      "Dự đoán token kế tiếp dựa trên các token đứng trước.",
      "Phân loại văn bản vào các chủ đề.",
      "Dịch văn bản giữa hai ngôn ngữ.",
      "Tóm tắt văn bản thành một vector duy nhất.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: từ đó suy ra xác suất của cả chuỗi bằng quy tắc nhân xác suất có điều kiện.",
      "Sai: đó là nhiệm vụ hạ nguồn.",
      "Sai: dịch máy cần thêm điều kiện là câu nguồn.",
      "Sai: đó là encoder.",
    ],
    explanation:
      "Mục tiêu đơn giản này lại đủ tổng quát: để đoán đúng token kế tiếp trên dữ liệu đa dạng, mô hình buộc phải học ngữ pháp, sự kiện và cả một phần khả năng suy luận.",
  },
  {
    id: "language-modeling-02",
    syllabusId: "language-modeling",
    difficulty: "understand",
    format: "single-choice",
    stem: "Perplexity của mô hình ngôn ngữ đo điều gì?",
    choices: [
      "Số tham số của mô hình.",
      "Mức “bối rối” của mô hình, tương đương số lựa chọn khả dĩ trung bình ở mỗi bước; perplexity càng thấp càng tốt.",
      "Tốc độ sinh token mỗi giây.",
      "Tỷ lệ token được sinh đúng chính tả.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: đó là kích thước mô hình.",
      "Đúng: perplexity là luỹ thừa của cross-entropy trung bình.",
      "Sai: đó là chỉ số thông lượng.",
      "Sai: perplexity không đo chính tả.",
    ],
    explanation:
      "Perplexity bằng số lựa chọn hiệu dụng: mô hình đoán đều giữa 100 từ có perplexity 100. Mô hình càng chắc chắn và càng đúng thì perplexity càng thấp.",
  },
  {
    id: "language-modeling-03",
    syllabusId: "language-modeling",
    difficulty: "apply",
    format: "numeric",
    stem: "Mô hình ngôn ngữ có cross-entropy trung bình 2.303 nats/token. Perplexity xấp xỉ bằng bao nhiêu?",
    answer: 10,
    tolerance: 0.2,
    calculation: [
      "Perplexity = exp(cross-entropy) khi cross-entropy tính bằng nats.",
      "exp(2.303) ≈ 10.",
    ],
    explanation:
      "Nghĩa là mô hình bối rối như thể đang chọn đều giữa 10 khả năng ở mỗi token. Lưu ý nếu cross-entropy tính bằng bits thì phải dùng 2^CE thay cho e^CE.",
  },
  {
    id: "language-modeling-04",
    syllabusId: "language-modeling",
    difficulty: "apply",
    format: "single-choice",
    stem: "Giảm temperature khi sinh văn bản từ 1.0 xuống 0.2 gây tác dụng gì?",
    choices: [
      "Phân phối token trở nên nhọn hơn: đầu ra xác định và an toàn hơn nhưng lặp lại nhiều và ít sáng tạo.",
      "Phân phối phẳng hơn nên văn bản đa dạng hơn.",
      "Tốc độ sinh tăng gấp năm lần.",
      "Mô hình bỏ qua prompt đầu vào.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: chia logits cho temperature nhỏ làm khuếch đại chênh lệch giữa các token.",
      "Sai: đó là hiệu ứng khi *tăng* temperature.",
      "Sai: temperature không ảnh hưởng tốc độ.",
      "Sai: prompt vẫn được dùng đầy đủ.",
    ],
    explanation:
      "Quy tắc chọn: nhiệm vụ cần chính xác và tái lập (trích xuất, phân loại, sinh mã) dùng temperature rất thấp; nhiệm vụ cần đa dạng (viết sáng tạo, brainstorm) dùng cao hơn.",
  },
  {
    id: "language-modeling-05",
    syllabusId: "language-modeling",
    difficulty: "advanced",
    format: "true-false-set",
    stem: "Xét việc dùng perplexity để so sánh các mô hình ngôn ngữ.",
    statements: [
      {
        text: "Không so sánh trực tiếp được perplexity của hai mô hình dùng tokenizer khác nhau.",
        answer: true,
        note: "Perplexity tính trên mỗi token, nên cách cắt token khác nhau làm mẫu số khác nhau; phải quy về mỗi ký tự hoặc mỗi từ mới so được.",
      },
      {
        text: "Perplexity thấp không bảo đảm văn bản sinh ra hữu ích, đúng sự thật hay an toàn.",
        answer: true,
        note: "Perplexity chỉ đo khả năng khớp phân phối văn bản huấn luyện, không đo tính đúng đắn hay hữu ích.",
      },
      {
        text: "Perplexity đo trên tập test đã bị lẫn vào dữ liệu huấn luyện là con số vô nghĩa.",
        answer: true,
        note: "Nhiễm bẩn dữ liệu là vấn đề nghiêm trọng khi đánh giá mô hình huấn luyện trên kho web quy mô lớn.",
      },
      {
        text: "Mô hình có perplexity thấp hơn chắc chắn cho kết quả tốt hơn ở mọi nhiệm vụ hạ nguồn.",
        answer: false,
        note: "Tương quan có nhưng không tuyệt đối; xếp hạng theo perplexity và theo chỉ số hạ nguồn có thể khác nhau.",
      },
    ],
    trap: "Ba ý đầu đều đúng nên ý (d) dễ được chọn theo quán tính. Đây là kiểu bẫy phổ biến của dạng đúng/sai bốn ý.",
    explanation:
      "Nguyên tắc chung: chỉ số nội tại (perplexity) hữu ích để theo dõi quá trình huấn luyện, nhưng quyết định lựa chọn mô hình phải dựa trên chỉ số của chính nhiệm vụ đích.",
  },

  /* ---------------- encoder-decoder ---------------- */
  {
    id: "encoder-decoder-01",
    syllabusId: "encoder-decoder",
    difficulty: "recall",
    format: "single-choice",
    stem: "Trong kiến trúc encoder–decoder cho dịch máy, vai trò của hai thành phần là gì?",
    choices: [
      "Encoder đọc và biểu diễn câu nguồn; decoder sinh câu đích từng token dựa trên biểu diễn đó.",
      "Encoder sinh câu đích; decoder kiểm tra chất lượng.",
      "Cả hai cùng sinh câu đích rồi lấy trung bình.",
      "Encoder nén dữ liệu để lưu trữ; decoder giải nén khi cần.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: đây là sơ đồ chuẩn cho các bài toán chuỗi sang chuỗi.",
      "Sai: đảo ngược vai trò.",
      "Sai: không phải cơ chế ensemble.",
      "Sai: đó là nén dữ liệu thông thường.",
    ],
    explanation:
      "Sơ đồ này dùng cho mọi bài toán biến đổi chuỗi sang chuỗi: dịch máy, tóm tắt, nhận dạng tiếng nói, và cả mô hình ngôn ngữ–thị giác.",
  },
  {
    id: "encoder-decoder-02",
    syllabusId: "encoder-decoder",
    difficulty: "understand",
    format: "single-choice",
    stem: "Trước khi có attention, seq2seq nén toàn bộ câu nguồn vào một vector ngữ cảnh cố định. Vấn đề là gì và attention giải quyết ra sao?",
    choices: [
      "Vector cố định tính toán quá chậm; attention làm nó nhanh hơn.",
      "Vector cố định là nút thắt thông tin, đặc biệt với câu dài; attention cho decoder truy cập lại toàn bộ trạng thái ẩn của encoder và tự chọn phần liên quan ở mỗi bước sinh.",
      "Vector cố định làm mô hình không hội tụ; attention thêm regularization.",
      "Vector cố định chỉ dùng được cho một ngôn ngữ; attention hỗ trợ đa ngôn ngữ.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: vấn đề là năng lực biểu diễn, không phải tốc độ.",
      "Đúng: đây chính là động cơ ra đời của cơ chế attention.",
      "Sai: attention không phải kỹ thuật regularization.",
      "Sai: không liên quan tới số ngôn ngữ.",
    ],
    explanation:
      "Chất lượng dịch của seq2seq không attention giảm mạnh theo độ dài câu. Attention xoá bỏ đúng hiện tượng đó, và trọng số attention còn cho phép quan sát mô hình đang “nhìn” từ nguồn nào.",
  },
  {
    id: "encoder-decoder-03",
    syllabusId: "encoder-decoder",
    difficulty: "apply",
    format: "single-choice",
    stem: "Teacher forcing khi huấn luyện mô hình sinh chuỗi nghĩa là gì?",
    choices: [
      "Dùng token *đúng* của chuỗi đích làm đầu vào cho bước tiếp theo của decoder, thay vì dùng token mà mô hình vừa dự đoán.",
      "Ép mô hình sinh đúng độ dài chuỗi đích.",
      "Dùng một mô hình lớn hơn để giám sát mô hình nhỏ.",
      "Tăng dần learning rate theo từng epoch.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: nhờ đó huấn luyện song song hoá được và hội tụ nhanh hơn nhiều.",
      "Sai: độ dài do token kết thúc quyết định.",
      "Sai: đó là knowledge distillation.",
      "Sai: đó là learning rate schedule.",
    ],
    explanation:
      "Không có teacher forcing, một lỗi ở bước đầu sẽ lan ra toàn chuỗi và làm tín hiệu huấn luyện gần như vô dụng ở giai đoạn đầu.",
  },
  {
    id: "encoder-decoder-04",
    syllabusId: "encoder-decoder",
    difficulty: "apply",
    format: "single-choice",
    stem: "Beam search khác greedy decoding ở điểm nào?",
    choices: [
      "Beam search luôn tìm được chuỗi có xác suất cao nhất tuyệt đối.",
      "Beam search giữ lại k chuỗi ứng viên tốt nhất ở mỗi bước thay vì chỉ một, nên thường tìm được chuỗi có xác suất tổng thể cao hơn với chi phí tính toán lớn hơn.",
      "Beam search nhanh hơn greedy decoding.",
      "Beam search không cần mô hình đã huấn luyện.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: beam search vẫn là tìm kiếm heuristic, không bảo đảm tối ưu toàn cục.",
      "Đúng: k là beam width, đánh đổi trực tiếp giữa chất lượng và chi phí.",
      "Sai: nó tốn khoảng k lần chi phí của greedy.",
      "Sai: vẫn cần mô hình để chấm điểm ứng viên.",
    ],
    explanation:
      "Greedy chọn token tốt nhất ở từng bước nên có thể bỏ lỡ chuỗi tốt hơn bắt đầu bằng một token kém. Cần chuẩn hoá theo độ dài, nếu không beam search thiên vị chuỗi ngắn.",
  },
  {
    id: "encoder-decoder-05",
    syllabusId: "encoder-decoder",
    difficulty: "advanced",
    format: "single-choice",
    stem: "Mô hình dịch máy có loss huấn luyện rất thấp nhưng khi sinh câu dài thì chất lượng suy giảm nhanh và bắt đầu lặp từ. Hiện tượng này gọi là gì?",
    choices: [
      "Overfitting đơn thuần, xử lý bằng dropout.",
      "Exposure bias: khi huấn luyện mô hình luôn được cho token đúng (teacher forcing), còn khi suy luận nó phải dựa vào token do chính nó sinh ra, nên lỗi tích luỹ dần và mô hình rơi vào trạng thái chưa từng gặp lúc huấn luyện.",
      "Vanishing gradient trong decoder.",
      "Tokenizer bị lỗi.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: overfitting không giải thích được vì sao lỗi tăng theo *độ dài* chuỗi sinh.",
      "Đúng: đây là sự lệch giữa phân phối lúc huấn luyện và lúc suy luận.",
      "Sai: không phải vấn đề luồng gradient.",
      "Sai: lỗi tokenizer sẽ biểu hiện ngay từ token đầu tiên.",
    ],
    trap: "Bẫy nằm ở chỗ loss huấn luyện rất đẹp: nó được tính trong điều kiện teacher forcing, tức trong một chế độ khác hẳn chế độ suy luận thật.",
    explanation:
      "Các hướng giảm thiểu: scheduled sampling (thỉnh thoảng cho mô hình ăn chính đầu ra của nó khi huấn luyện), tối ưu theo chỉ số ở mức chuỗi, hoặc thêm hình phạt lặp khi giải mã.",
  },

  /* ---------------- pretrained-lms ---------------- */
  {
    id: "pretrained-lms-01",
    syllabusId: "pretrained-lms",
    difficulty: "recall",
    format: "single-choice",
    stem: "In-context learning ở mô hình ngôn ngữ lớn nghĩa là gì?",
    choices: [
      "Mô hình thực hiện nhiệm vụ mới dựa trên hướng dẫn và ví dụ đặt ngay trong prompt, mà không cập nhật trọng số.",
      "Mô hình được huấn luyện lại trên dữ liệu của người dùng sau mỗi câu hỏi.",
      "Mô hình tự động tải thêm dữ liệu từ internet.",
      "Mô hình ghi nhớ vĩnh viễn mọi cuộc hội thoại.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: trọng số hoàn toàn không đổi; “học” diễn ra trong ngữ cảnh của một lượt suy luận.",
      "Sai: không có bước cập nhật trọng số nào.",
      "Sai: đó là công cụ tìm kiếm được gắn thêm, không phải in-context learning.",
      "Sai: ngữ cảnh bị giới hạn và không tự lưu qua các phiên.",
    ],
    explanation:
      "Hệ quả quan trọng: mọi thứ mô hình “học” trong một prompt sẽ biến mất khi ngữ cảnh kết thúc. Muốn thay đổi bền vững thì phải finetune.",
  },
  {
    id: "pretrained-lms-02",
    syllabusId: "pretrained-lms",
    difficulty: "understand",
    format: "single-choice",
    stem: "Khác biệt giữa zero-shot và few-shot prompting là gì?",
    choices: [
      "Zero-shot chỉ đưa hướng dẫn; few-shot đưa thêm một vài ví dụ mẫu đầu vào–đầu ra ngay trong prompt.",
      "Zero-shot không dùng mô hình; few-shot thì có.",
      "Zero-shot cần finetune; few-shot thì không.",
      "Few-shot luôn cho kết quả kém hơn zero-shot.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: ví dụ giúp mô hình nắm định dạng đầu ra và cách hiểu nhiệm vụ.",
      "Sai: cả hai đều dùng mô hình.",
      "Sai: cả hai đều không cần finetune.",
      "Sai: few-shot thường tốt hơn, nhất là khi định dạng đầu ra đặc thù.",
    ],
    explanation:
      "Few-shot đặc biệt hiệu quả khi cần đầu ra theo một định dạng chặt chẽ: ví dụ minh hoạ định dạng tốt hơn nhiều so với mô tả bằng lời.",
  },
  {
    id: "pretrained-lms-03",
    syllabusId: "pretrained-lms",
    difficulty: "apply",
    format: "single-choice",
    stem: "Cần một trợ lý trả lời câu hỏi dựa trên tài liệu nội bộ của trường, cập nhật hằng tuần và phải dẫn được nguồn. Kiến trúc phù hợp nhất là gì?",
    choices: [
      "Finetune lại mô hình mỗi tuần trên toàn bộ tài liệu.",
      "RAG: lập chỉ mục tài liệu thành vector, truy hồi các đoạn liên quan theo câu hỏi, rồi đưa chúng vào prompt để mô hình trả lời kèm trích dẫn.",
      "Dán toàn bộ tài liệu vào mỗi prompt.",
      "Dùng zero-shot prompting và tin vào kiến thức sẵn có của mô hình.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: tốn kém, chậm và vẫn không cho phép dẫn nguồn chính xác.",
      "Đúng: cập nhật chỉ cần lập chỉ mục lại, và đoạn truy hồi chính là nguồn để trích dẫn.",
      "Sai: vượt giới hạn ngữ cảnh và tốn chi phí khổng lồ mỗi lượt hỏi.",
      "Sai: mô hình không biết gì về tài liệu nội bộ.",
    ],
    explanation:
      "Ba yêu cầu trong đề — kiến thức riêng, cập nhật thường xuyên, và dẫn nguồn — đều là những điểm mà RAG giải quyết còn finetune thì không.",
  },
  {
    id: "pretrained-lms-04",
    syllabusId: "pretrained-lms",
    difficulty: "apply",
    format: "single-choice",
    stem: "Dùng LLM để trích xuất thông tin có cấu trúc (JSON) từ văn bản, yêu cầu kết quả ổn định giữa các lần chạy. Cấu hình nào phù hợp?",
    choices: [
      "Temperature cao (1.0–1.5) để mô hình linh hoạt hơn.",
      "Temperature bằng 0 (hoặc rất thấp), kèm mô tả schema rõ ràng, ví dụ mẫu và bước kiểm tra tính hợp lệ của JSON sau khi sinh.",
      "Bật chế độ sinh ngẫu nhiên và chạy nhiều lần rồi chọn tuỳ ý.",
      "Không cần cấu hình gì, LLM luôn cho kết quả xác định.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: temperature cao làm đầu ra dao động, trái yêu cầu ổn định.",
      "Đúng: kết hợp cấu hình xác định với ràng buộc định dạng và kiểm tra hậu kỳ.",
      "Sai: chọn tuỳ ý không phải quy trình kiểm soát chất lượng.",
      "Sai: mặc định của hầu hết API là có yếu tố ngẫu nhiên.",
    ],
    explanation:
      "Với đầu ra máy đọc, luôn phải có bước xác thực: parse JSON, kiểm tra schema, và có đường xử lý khi thất bại. Không được giả định mô hình luôn tuân thủ định dạng.",
  },
  {
    id: "pretrained-lms-05",
    syllabusId: "pretrained-lms",
    difficulty: "advanced",
    format: "single-choice",
    stem: "LLM trả lời một câu hỏi chuyên môn bằng giọng điệu rất tự tin, kèm một trích dẫn nghiên cứu không tồn tại. Nhận định đúng nhất là gì?",
    choices: [
      "Mô hình bị lỗi phần mềm, cần khởi động lại.",
      "Đây là hallucination: mô hình tối ưu việc sinh chuỗi có xác suất cao chứ không có cơ chế kiểm chứng sự thật, nên độ tự tin trong văn phong không tương quan với độ đúng; phải đối chiếu với nguồn độc lập.",
      "Chỉ cần tăng temperature là hết hiện tượng này.",
      "Điều này chỉ xảy ra với mô hình nhỏ.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: đây là hành vi phát sinh từ cách mô hình được huấn luyện, không phải lỗi kỹ thuật.",
      "Đúng: nêu đúng nguyên nhân, hệ quả và biện pháp.",
      "Sai: tăng temperature thường làm hiện tượng nặng thêm.",
      "Sai: mọi mô hình hiện nay đều có thể bịa, dù tỷ lệ khác nhau.",
    ],
    trap: "Bẫy là dùng sự trôi chảy và tự tin của văn bản làm tín hiệu về độ tin cậy. Với mô hình ngôn ngữ, hai thứ đó gần như độc lập nhau.",
    explanation:
      "Giảm thiểu: dùng RAG có trích dẫn kiểm chứng được, yêu cầu mô hình nói rõ khi không chắc, và luôn có người kiểm tra ở các quyết định quan trọng. Điều này khớp với quy tắc COACH-10 của lộ trình: AI dùng để đối chiếu, không dùng làm nguồn sự thật.",
  },

  /* ---------------- hubert ---------------- */
  {
    id: "hubert-01",
    syllabusId: "hubert",
    difficulty: "recall",
    format: "single-choice",
    stem: "HuBERT là loại mô hình gì?",
    choices: [
      "Encoder audio được tiền huấn luyện tự giám sát trên tiếng nói không nhãn.",
      "Mô hình sinh nhạc từ văn bản.",
      "Bộ mã hoá nén âm thanh không mất dữ liệu.",
      "Mô hình dịch máy giữa các ngôn ngữ nói.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: nó học biểu diễn tiếng nói mà không cần bản phiên âm.",
      "Sai: đó là các mô hình sinh nhạc.",
      "Sai: đó là codec âm thanh.",
      "Sai: dịch tiếng nói là nhiệm vụ hạ nguồn.",
    ],
    explanation:
      "HuBERT áp dụng ý tưởng kiểu BERT cho tiếng nói: che một phần tín hiệu và dự đoán đơn vị ẩn tương ứng, với nhãn giả sinh từ phân cụm đặc trưng.",
  },
  {
    id: "hubert-02",
    syllabusId: "hubert",
    difficulty: "understand",
    format: "single-choice",
    stem: "Vì sao tiền huấn luyện tự giám sát đặc biệt giá trị trong xử lý tiếng nói?",
    choices: [
      "Vì mô hình audio luôn nhỏ hơn mô hình văn bản.",
      "Vì âm thanh thô rất dồi dào trong khi bản phiên âm chuẩn rất tốn kém và chậm để tạo ra, nhất là với ngôn ngữ ít tài nguyên.",
      "Vì tiếng nói không có nhiễu.",
      "Vì audio không cần tiền xử lý.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: kích thước mô hình không phải lý do.",
      "Đúng: mất cân bằng giữa dữ liệu chưa nhãn và dữ liệu có nhãn chính là động lực của SSL cho audio.",
      "Sai: tiếng nói thực tế đầy nhiễu và biến thiên giọng.",
      "Sai: audio cần khá nhiều bước tiền xử lý.",
    ],
    explanation:
      "Nhờ SSL, một mô hình ASR chất lượng cho ngôn ngữ ít tài nguyên có thể chỉ cần vài chục giờ có phiên âm, thay vì hàng nghìn giờ như cách tiếp cận thuần giám sát.",
  },
  {
    id: "hubert-03",
    syllabusId: "hubert",
    difficulty: "apply",
    format: "single-choice",
    stem: "Muốn xây bộ phân loại cảm xúc từ giọng nói với 500 mẫu có nhãn, cách dùng HuBERT hợp lý nhất là gì?",
    choices: [
      "Huấn luyện HuBERT từ đầu trên 500 mẫu.",
      "Dùng HuBERT pretrained để trích xuất biểu diễn, rồi huấn luyện một bộ phân loại nhẹ lên trên (hoặc finetune vài lớp cuối với learning rate nhỏ).",
      "Chuyển audio thành văn bản rồi bỏ hoàn toàn tín hiệu âm thanh.",
      "Dùng trực tiếp HuBERT để dự đoán cảm xúc mà không thêm lớp nào.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: 500 mẫu là quá ít cho tiền huấn luyện.",
      "Đúng: đây là quy trình chuẩn khi có ít dữ liệu có nhãn.",
      "Sai: cảm xúc nằm nhiều ở ngữ điệu và cao độ — những thông tin mất đi khi chỉ giữ văn bản.",
      "Sai: HuBERT không có đầu ra cảm xúc; phải gắn head phân loại.",
    ],
    explanation:
      "Lưu ý phương án thứ ba: nó minh hoạ một sai lầm thiết kế thường gặp — chọn biểu diễn trung gian làm mất chính tín hiệu mà nhiệm vụ cần.",
  },
  {
    id: "hubert-04",
    syllabusId: "hubert",
    difficulty: "apply",
    format: "single-choice",
    stem: "Mô hình tiếng nói pretrained yêu cầu đầu vào 16 kHz, nhưng dữ liệu thu ở 44.1 kHz. Cần làm gì?",
    choices: [
      "Đưa thẳng vào mô hình, sample rate không quan trọng.",
      "Resample về đúng 16 kHz trước khi đưa vào, vì mô hình đã học các mẫu ở tỷ lệ thời gian–tần số tương ứng với sample rate huấn luyện.",
      "Nhân đôi độ dài tín hiệu.",
      "Chuyển sang định dạng MP3.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: sai sample rate làm mọi đặc trưng tần số bị lệch, kết quả hỏng hoàn toàn.",
      "Đúng: khớp tiền xử lý với điều kiện tiền huấn luyện là bắt buộc.",
      "Sai: không phải phép biến đổi đúng.",
      "Sai: định dạng nén không liên quan tới sample rate.",
    ],
    explanation:
      "Cùng nguyên tắc với mean/std trong thị giác: pipeline tiền xử lý lúc suy luận phải trùng khớp với pipeline lúc tiền huấn luyện.",
  },
  {
    id: "hubert-05",
    syllabusId: "hubert",
    difficulty: "advanced",
    format: "single-choice",
    stem: "Mô hình nhận dạng tiếng nói đạt kết quả tốt trên dữ liệu thu trong phòng thu nhưng kém hẳn trên ghi âm điện thoại ngoài đường. Nguyên nhân và hướng xử lý phù hợp nhất là gì?",
    choices: [
      "Mô hình quá nhỏ; chỉ cần tăng số tham số.",
      "Sai lệch điều kiện âm học giữa huấn luyện và triển khai; xử lý bằng augmentation âm học (thêm nhiễu nền, mô phỏng vọng, giả lập băng thông điện thoại) và bổ sung dữ liệu huấn luyện từ chính điều kiện thật.",
      "Chỉ cần tăng sample rate lên 44.1 kHz.",
      "Đổi hàm mất mát sang MSE.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: mô hình lớn hơn vẫn kém nếu chưa từng thấy điều kiện âm học đó.",
      "Đúng: nêu đúng bản chất là distribution shift và các biện pháp tương ứng.",
      "Sai: điện thoại vốn giới hạn băng thông; nâng sample rate không tạo lại thông tin đã mất.",
      "Sai: MSE không phù hợp cho ASR.",
    ],
    trap: "Bẫy là quy mọi suy giảm hiệu năng về dung lượng mô hình. Ở đây vấn đề là phạm vi dữ liệu, và tăng tham số còn có thể làm mô hình khớp chặt hơn vào điều kiện phòng thu.",
    explanation:
      "Đây là phiên bản audio của bài toán dịch chuyển phân phối trong thị giác. Nguyên tắc chung: tập huấn luyện phải bao phủ các điều kiện thu thập mà hệ thống sẽ gặp khi vận hành.",
  },

  /* ---------------- audio-models ---------------- */
  {
    id: "audio-models-01",
    syllabusId: "audio-models",
    difficulty: "recall",
    format: "single-choice",
    stem: "Whisper là mô hình phục vụ nhiệm vụ chính nào?",
    choices: [
      "Nhận dạng tiếng nói tự động (chuyển giọng nói thành văn bản), kèm khả năng dịch sang tiếng Anh và nhận diện ngôn ngữ.",
      "Sinh giọng nói từ văn bản.",
      "Tách nhạc thành các nhạc cụ thành phần.",
      "Nén tệp âm thanh.",
    ],
    answerIndex: 0,
    choiceNotes: [
      "Đúng: Whisper là mô hình ASR đa ngôn ngữ, đa nhiệm.",
      "Sai: đó là text-to-speech, hướng ngược lại.",
      "Sai: đó là bài toán tách nguồn âm.",
      "Sai: đó là codec.",
    ],
    explanation:
      "Whisper dùng kiến trúc encoder–decoder trên biểu diễn Mel spectrogram, được huấn luyện giám sát yếu trên lượng lớn dữ liệu web đa ngôn ngữ.",
  },
  {
    id: "audio-models-02",
    syllabusId: "audio-models",
    difficulty: "understand",
    format: "single-choice",
    stem: "Vì sao Mel spectrogram được dùng phổ biến làm đầu vào cho mô hình tiếng nói thay vì sóng âm thô?",
    choices: [
      "Vì sóng âm thô không lưu trữ được.",
      "Vì Mel spectrogram biểu diễn năng lượng theo thời gian–tần số trên thang tần số mô phỏng cảm nhận của tai người, cho đầu vào gọn và giàu thông tin hơn nhiều so với chuỗi mẫu thô rất dài.",
      "Vì Mel spectrogram là biểu diễn không mất mát thông tin.",
      "Vì sóng âm thô chỉ dùng được cho nhạc.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: sóng âm thô lưu trữ bình thường.",
      "Đúng: một giây audio 16 kHz có 16.000 mẫu; Mel spectrogram rút xuống còn khoảng 100 khung.",
      "Sai: nó có mất mát — pha bị bỏ đi.",
      "Sai: sóng thô dùng cho mọi loại âm thanh.",
    ],
    explanation:
      "Chuỗi thời gian quá dài khiến mô hình attention không xử lý nổi. Mel spectrogram là bước rút gọn có cơ sở tri giác, đánh đổi bằng việc mất thông tin pha.",
  },
  {
    id: "audio-models-03",
    syllabusId: "audio-models",
    difficulty: "apply",
    format: "numeric",
    stem: "Câu tham chiếu có 10 từ. Bản nhận dạng có 2 từ sai (substitution), 1 từ bị bỏ (deletion) và 1 từ thừa (insertion). Tính WER.",
    answer: 0.4,
    tolerance: 0.001,
    calculation: [
      "WER = (S + D + I)/N.",
      "= (2 + 1 + 1)/10 = 4/10 = 0.4, tức 40%.",
    ],
    explanation:
      "Lưu ý WER có thể vượt quá 100% khi số từ chèn thêm rất lớn, vì mẫu số chỉ là số từ của câu tham chiếu chứ không phải tổng số từ của cả hai câu.",
  },
  {
    id: "audio-models-04",
    syllabusId: "audio-models",
    difficulty: "apply",
    format: "single-choice",
    stem: "Cần xây hệ thống trả lời câu hỏi bằng giọng nói cho tiếng Việt, có sẵn Whisper và một LLM. Kiến trúc ghép nối đơn giản và hợp lý là gì?",
    choices: [
      "Đưa thẳng sóng âm vào LLM văn bản.",
      "Whisper chuyển giọng nói thành văn bản → LLM xử lý và sinh câu trả lời → (tuỳ chọn) mô hình text-to-speech đọc lại; cần đánh giá WER của bước đầu vì lỗi sẽ lan sang các bước sau.",
      "Dùng Whisper để sinh câu trả lời trực tiếp.",
      "Huấn luyện lại Whisper thành mô hình hỏi đáp.",
    ],
    answerIndex: 1,
    choiceNotes: [
      "Sai: LLM văn bản không nhận đầu vào âm thanh thô.",
      "Đúng: nêu đúng chuỗi xử lý và nhận ra rủi ro lan truyền lỗi.",
      "Sai: Whisper chỉ phiên âm/dịch, không trả lời câu hỏi.",
      "Sai: tốn kém và không cần thiết khi đã có LLM.",
    ],
    explanation:
      "Ý quan trọng nhất là *lan truyền lỗi*: nếu WER ở bước phiên âm là 20% thì LLM đang trả lời một câu hỏi đã bị bóp méo. Các mô hình audio đầu-cuối như Qwen-Audio hay Voxtral ra đời để rút ngắn chuỗi này.",
  },
  {
    id: "audio-models-05",
    syllabusId: "audio-models",
    difficulty: "advanced",
    format: "true-false-set",
    stem: "Xét việc đánh giá hệ thống nhận dạng tiếng nói bằng WER.",
    statements: [
      {
        text: "WER coi mọi lỗi từ là như nhau, nên không phân biệt được lỗi ở hư từ với lỗi ở một con số hay tên riêng quan trọng.",
        answer: true,
        note: "Nhận sai “không” thành “có” chỉ tính một lỗi, dù nó đảo ngược hoàn toàn nghĩa của câu.",
      },
      {
        text: "WER phụ thuộc vào cách chuẩn hoá văn bản (chữ hoa/thường, dấu câu, cách viết số), nên phải nêu rõ quy tắc chuẩn hoá khi báo cáo.",
        answer: true,
        note: "Hai hệ thống chỉ so sánh được khi dùng cùng một bộ quy tắc chuẩn hoá.",
      },
      {
        text: "WER có thể lớn hơn 1 (trên 100%).",
        answer: true,
        note: "Khi số từ chèn thêm vượt quá số từ của câu tham chiếu, tỷ số vượt 1.",
      },
      {
        text: "Hệ thống có WER thấp hơn chắc chắn cho trải nghiệm người dùng tốt hơn ở mọi ứng dụng.",
        answer: false,
        note: "Với trợ lý giọng nói, một hệ thống WER cao hơn nhưng nhận đúng các từ khoá điều khiển có thể hữu dụng hơn nhiều.",
      },
    ],
    trap: "Ý (d) là bẫy quán tính giống các câu chỉ số khác: WER là đại lượng thay thế tiện dụng, không phải thước đo giá trị sử dụng.",
    explanation:
      "Bài học xuyên suốt cả ngân hàng câu hỏi này: mọi chỉ số đều là đại lượng thay thế cho điều ta thực sự quan tâm. Trước khi tối ưu một chỉ số, phải biết nó bỏ sót điều gì.",
  },
];
