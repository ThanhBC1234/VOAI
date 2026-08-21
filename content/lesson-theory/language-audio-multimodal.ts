import type { LessonTheoryMap } from "./types";

export const languageAudioMultimodalTheory = {
  "nlp-01-tokenization-embeddings": {
    lessonId: "nlp-01-tokenization-embeddings",
    readingMinutes: 34,
    openingQuestions: [
      "Một câu tiếng Việt biến thành dãy số mà mô hình hiểu được qua những bước nào?",
      "Vì sao tokenizer và embedding matrix bắt buộc phải đi cùng đúng checkpoint?",
    ],
    sections: [
      {
        title: "Tokenization là một phần của mô hình",
        paragraphs: [
          "Máy không nhận trực tiếp chuỗi ký tự. Tokenizer chuẩn hóa văn bản theo quy ước, tách thành token rồi ánh xạ token sang ID trong vocabulary. Tách theo từ dễ hiểu nhưng gặp từ mới; tách theo ký tự không có OOV nhưng chuỗi dài; subword cân bằng hai phía bằng cách ghép các mảnh thường gặp.",
          "BPE, WordPiece và unigram language model đều tạo vocabulary subword nhưng có thuật toán học và giải mã khác nhau. Các special token như BOS, EOS, PAD, MASK mang nghĩa giao thức. Tự thay ID hoặc dùng tokenizer khác checkpoint làm embedding lookup sai dù code vẫn chạy.",
        ],
        bullets: ["Kiểm tra Unicode và dấu tiếng Việt trước khi tokenize.", "Lưu attention mask cùng input IDs.", "Đo độ dài theo token, không theo số ký tự."],
      },
      {
        title: "Từ one-hot tới embedding học được",
        paragraphs: [
          "Embedding layer là bảng E có shape [V,d]. Lookup ID i lấy hàng E_i; nó tương đương nhân one-hot với E nhưng không tạo vector one-hot khổng lồ. Trong huấn luyện, chỉ các hàng xuất hiện trong batch nhận gradient trực tiếp.",
          "Embedding tĩnh cho một token một vector ở mọi ngữ cảnh; contextual embedding phụ thuộc cả câu. Cosine similarity đã tự chia norm, nên L2-normalize trước chỉ là cách tối ưu tính toán dot product, không phải điều kiện toán học bắt buộc để cosine tồn tại.",
        ],
        formulas: ["e_i = onehot(i)^T E", "cos(u,v) = (u^T v)/(||u|| ||v||)"],
      },
      {
        title: "Padding, truncation và kiểm tra round-trip",
        paragraphs: [
          "Batch cần chiều dài chung nên chuỗi ngắn được padding. Attention mask bằng 0 tại PAD để mô hình không dùng nội dung giả. Truncation có thể cắt mất nhãn hoặc kết luận cuối văn bản; chiến lược head, tail hay sliding window phải phù hợp nhiệm vụ.",
          "Debug bắt đầu bằng encode rồi decode một số câu, in token boundaries, IDs, mask và số token bị cắt. Với offset mapping, kiểm tra span token quay lại đúng đoạn ký tự gốc trước khi làm NER hoặc question answering.",
        ],
      },
    ],
    workedExamples: [
      {
        title: "Shape của một batch subword",
        problem: "Hai câu sau tokenization có 5 và 8 token, thêm BOS/EOS đã nằm trong số đếm. Pad về length 8, embedding dimension 256. Xác định input, mask và output shape.",
        steps: [
          { state: "input_ids có shape [2,8]", explanation: "Câu đầu thêm 3 PAD; câu sau không thêm." },
          { state: "mask câu đầu=[1,1,1,1,1,0,0,0]", explanation: "Chỉ năm vị trí thật được chú ý." },
          { state: "embedding output [2,8,256]", explanation: "Mỗi ID được lookup thành vector 256 chiều." },
        ],
        conclusion: "Padding làm đồng nhất shape nhưng mask phải giữ ranh giới dữ liệu thật.",
        sanityChecks: ["ID PAD nằm trong vocabulary.", "Tổng mask mỗi hàng bằng số token thật.", "Tokenizer decode không đưa PAD vào nội dung cuối."],
      },
    ],
    implementationChecklist: ["Pin đúng tokenizer và checkpoint.", "Test Unicode/encode-decode tiếng Việt.", "Theo dõi truncation rate.", "Assert ID nhỏ hơn vocabulary size."],
    masteryChecklist: ["So sánh word/character/subword.", "Suy ra shape embedding batch.", "Giải thích attention mask.", "Phân biệt static và contextual embedding."],
    glossary: [
      { term: "vocabulary", definition: "Tập token và ánh xạ token-ID của tokenizer." },
      { term: "subword", definition: "Mảnh ký tự/từ dùng để biểu diễn cả từ quen và từ mới." },
      { term: "embedding", definition: "Vector đặc trưng dày được học cho token hoặc ngữ cảnh." },
      { term: "padding", definition: "Token đệm để các chuỗi trong batch có cùng chiều dài." },
      { term: "attention mask", definition: "Mặt nạ cho biết vị trí nào là dữ liệu hợp lệ khi attention." },
    ],
    sourceIds: ["ioai-2026", "nlp-principles", "nlp-representation"],
  },

  "nlp-02-text-classification": {
    lessonId: "nlp-02-text-classification",
    readingMinutes: 32,
    openingQuestions: ["Nên biểu diễn cả văn bản bằng token nào hoặc phép pooling nào?", "Split ngẫu nhiên có làm cùng tác giả hoặc cùng mẫu văn bản rò sang validation không?"],
    sections: [
      {
        title: "Định nghĩa nhãn và đơn vị dữ liệu",
        paragraphs: [
          "Text classification có thể đơn nhãn, đa nhãn hoặc thứ bậc. Nhãn cảm xúc, chủ đề, ý định hay độc hại đều cần hướng dẫn gán nhãn, cách xử lý mơ hồ và tỷ lệ đồng thuận. Nếu một tài liệu bị chia thành nhiều đoạn, mọi đoạn cùng tài liệu phải ở cùng split.",
          "Baseline TF-IDF + linear model rất quan trọng: nhanh, dễ giải thích và phát hiện leakage từ từ khóa. Mô hình neural chỉ có ý nghĩa khi so trên cùng split, metric và preprocessing.",
        ],
      },
      {
        title: "Pooling và loss",
        paragraphs: [
          "Encoder trả hidden states [B,L,d]. Có thể dùng CLS token, mean pooling có mask, max pooling hoặc attention pooling để tạo vector [B,d]. Mean pooling phải chia theo số token thật; nếu tính cả PAD, câu ngắn bị kéo về embedding PAD.",
          "Đơn nhãn dùng K logits và cross-entropy; đa nhãn dùng K logits sigmoid cùng BCE-with-logits. Class weighting, focal loss hoặc resampling có thể hỗ trợ lệch lớp nhưng phải đánh giá calibration và minority recall.",
        ],
        formulas: ["h_doc = sum_t m_t h_t / sum_t m_t", "L_multi = -sum_k [y_k log sigma(z_k) + (1-y_k)log(1-sigma(z_k))]"],
      },
      {
        title: "Error analysis theo ngôn ngữ",
        paragraphs: [
          "Confusion matrix cho biết các lớp bị lẫn, nhưng cần đọc mẫu sai theo phủ định, mỉa mai, từ mới, code-switching, độ dài và nguồn. Counterfactual đơn giản như đổi tên thực thể hoặc bỏ từ khóa giúp phát hiện shortcut.",
          "Threshold đa nhãn nên chọn trên validation theo chi phí lỗi, không mặc định 0.5 cho mọi lớp. Báo micro-F1 và macro-F1: micro bị lớp lớn chi phối, macro cho mỗi lớp trọng số ngang nhau.",
        ],
      },
    ],
    workedExamples: [
      {
        title: "Masked mean pooling",
        problem: "Một câu có ba hidden scalar [2,4,100] và mask [1,1,0], trong đó 100 là PAD. Tính pooling đúng và pooling sai nếu quên mask.",
        steps: [
          { state: "Đúng: (2+4)/(1+1)=3", explanation: "Chỉ hai token thật tham gia." },
          { state: "Sai: (2+4+100)/3=35.33", explanation: "PAD áp đảo biểu diễn câu." },
          { state: "Output một chiều [B,1] trong toy example", explanation: "Thực tế giữ d chiều feature." },
        ],
        conclusion: "Mask không chỉ phục vụ attention; nó còn bắt buộc trong các phép pooling theo chuỗi.",
        sanityChecks: ["Thêm PAD không được đổi pooled vector.", "Mẫu không được có tổng mask bằng 0.", "Output pooling không còn trục L."],
      },
    ],
    implementationChecklist: ["Group-split theo nguồn/tài liệu.", "Có baseline TF-IDF.", "Pooling dùng mask.", "Báo metric theo lớp và đọc mẫu sai."],
    masteryChecklist: ["Chọn loss đúng loại nhãn.", "Tính masked mean.", "Giải thích micro/macro-F1.", "Thiết kế một counterfactual test."],
    glossary: [
      { term: "pooling", definition: "Phép gom chuỗi hidden states thành biểu diễn cố định." },
      { term: "multi-label", definition: "Một mẫu có thể đồng thời thuộc nhiều lớp." },
      { term: "macro-F1", definition: "Trung bình F1 của từng lớp với trọng số ngang nhau." },
      { term: "micro-F1", definition: "F1 tính sau khi gộp counts của mọi lớp." },
      { term: "counterfactual", definition: "Biến thể có kiểm soát dùng kiểm tra mô hình dựa vào tín hiệu nào." },
    ],
    sourceIds: ["nlp-principles", "nlp-representation", "pml-intro"],
  },

  "nlp-03-bert": {
    lessonId: "nlp-03-bert",
    readingMinutes: 36,
    openingQuestions: ["Bidirectional encoder khác causal language model ở mặt nạ attention nào?", "Fine-tuning BERT cần xử lý CLS, segment và padding ra sao?"],
    sections: [
      {
        title: "Encoder hai chiều và masked language modeling",
        paragraphs: [
          "BERT là chồng Transformer encoder. Mỗi token có thể chú ý cả trái và phải, nên biểu diễn phù hợp nhiệm vụ hiểu văn bản nhưng không trực tiếp dùng làm bộ sinh autoregressive trái-sang-phải. Pretraining che một phần token rồi dự đoán token gốc từ ngữ cảnh.",
          "Input embedding là tổng token, position và token-type embeddings trong biến thể gốc. Nhiều checkpoint không dùng token-type theo cùng cách; luôn theo config và tokenizer của checkpoint thay vì hard-code giả định BERT-base.",
        ],
        formulas: ["H^0 = E_token + E_position + E_segment", "L_MLM = -sum_{i in masked} log p(x_i|x_visible)"],
      },
      {
        title: "Attention mask và fine-tuning heads",
        paragraphs: [
          "Padding mask ngăn mô hình đọc PAD, nhưng BERT không dùng causal mask trong encoder chuẩn. Classification thường lấy CLS hoặc pooled representation; token classification dùng hidden state từng token; question answering dự đoán start/end logits.",
          "Subword làm nhãn token-level phức tạp: cần căn offset và chọn gán nhãn cho token đầu hay mọi subtoken. Đánh giá NER phải ghép span đúng, không chỉ accuracy trên token vì lớp O chiếm đa số.",
        ],
      },
      {
        title: "Fine-tuning ổn định và giới hạn",
        paragraphs: [
          "Learning rate nhỏ, warmup, weight decay và gradient clipping thường quan trọng. Với dữ liệu ít, chạy nhiều seed vì kết quả có thể dao động. Layer-wise learning rate decay là một lựa chọn, không phải quy tắc bắt buộc.",
          "Giới hạn context khiến văn bản dài cần chunking. Chunk độc lập có thể mất quan hệ xa và gây nhãn trùng; aggregation phải được định nghĩa ở cấp tài liệu. BERT cũng kế thừa bias từ pretraining corpus và có thể quá tự tin ngoài miền.",
        ],
      },
    ],
    workedExamples: [
      {
        title: "Shape fine-tuning classification",
        problem: "Batch 16, sequence length 128, hidden size 768, 4 lớp. Suy ra shape chính từ encoder đến logits.",
        steps: [
          { state: "Encoder output [16,128,768]", explanation: "Một contextual vector cho mỗi token." },
          { state: "Lấy CLS → [16,768]", explanation: "Chọn vị trí đầu cho mỗi mẫu." },
          { state: "Linear(768,4) → logits [16,4]", explanation: "Không softmax trước CrossEntropyLoss dạng logits." },
        ],
        conclusion: "Trục chuỗi bị gom trước head; labels đơn nhãn có shape [16].",
        sanityChecks: ["Attention mask có shape [16,128].", "Logits hữu hạn trước softmax.", "Tokenizer vocab khớp embedding matrix."],
      },
    ],
    implementationChecklist: ["Nạp tokenizer/config cùng checkpoint.", "Truyền attention mask.", "Căn offset cho token labels.", "Theo dõi nhiều seed và validation metric."],
    masteryChecklist: ["Phân biệt bidirectional và causal mask.", "Suy ra shape classification head.", "Giải thích MLM.", "Thiết kế chunking cho văn bản dài."],
    glossary: [
      { term: "MLM", definition: "Mục tiêu dự đoán token bị che từ ngữ cảnh hai chiều." },
      { term: "CLS token", definition: "Token đặc biệt thường dùng làm vị trí tổng hợp cho classification." },
      { term: "segment embedding", definition: "Embedding phân biệt các đoạn/câu trong một số mô hình BERT." },
      { term: "warmup", definition: "Giai đoạn tăng learning rate dần ở đầu huấn luyện." },
      { term: "offset mapping", definition: "Ánh xạ tokenized span về vị trí ký tự trong văn bản gốc." },
    ],
    sourceIds: ["ioai-2026", "nlp-principles", "nlp-representation"],
  },

  "nlp-04-language-modeling": {
    lessonId: "nlp-04-language-modeling",
    readingMinutes: 37,
    openingQuestions: ["Teacher forcing làm train khác generation ở điểm nào?", "Perplexity thấp hơn có luôn đồng nghĩa câu trả lời hữu ích hơn không?"],
    sections: [
      {
        title: "Phân rã xác suất autoregressive",
        paragraphs: [
          "Causal language model phân rã xác suất chuỗi thành tích xác suất token tiếp theo điều kiện trên prefix. Causal mask chặn attention nhìn token tương lai. Trong train, toàn chuỗi có thể xử lý song song vì target được shift một vị trí.",
          "Teacher forcing cung cấp prefix đúng ở train, còn generation phải dùng token mô hình vừa sinh. Sai lầm có thể tích lũy; đây là khoảng cách train-inference chứ không phải lỗi implementation tự động.",
        ],
        formulas: ["p(x_1:T)=product_t p(x_t|x_<t)", "PPL=exp(-1/N sum_t log p(x_t|x_<t))"],
      },
      {
        title: "Loss masking và context",
        paragraphs: [
          "Labels thường là input IDs dịch trái; PAD hoặc phần prompt không cần học được gán ignore index. Nếu tính loss trên PAD, mô hình học phân bố độ dài giả. Với instruction tuning, phải xác định có tính loss phần user prompt hay chỉ assistant response.",
          "Context window tính bằng token. KV cache lưu key/value cũ để không tính lại toàn prefix khi decode, đổi bộ nhớ lấy tốc độ. Cache phải tách theo batch/request và xóa đúng lúc.",
        ],
      },
      {
        title: "Decoding và đánh giá",
        paragraphs: [
          "Greedy chọn token lớn nhất; beam search xấp xỉ tìm chuỗi có log-probability cao bằng cách chỉ giữ một số prefix, nên không bảo đảm tối ưu toàn cục và vẫn dễ lặp hoặc nhạt. Sampling với temperature, top-k hoặc top-p tạo đa dạng. Temperature không sửa kiến thức mô hình mà chỉ biến đổi phân phối chọn token.",
          "Perplexity phụ thuộc tokenizer và corpus nên không so trực tiếp giữa tokenization khác nhau. Đánh giá generation cần task metrics, factuality, safety và human rubric; một mô hình dự đoán token tốt vẫn có thể trả lời sai sự thật.",
        ],
      },
    ],
    workedExamples: [
      {
        title: "NLL và perplexity của ba token",
        problem: "Mô hình gán xác suất cho ba token đúng lần lượt [0.5,0.25,0.5]. Tính NLL trung bình và perplexity.",
        steps: [
          { state: "Tổng -log p = 0.693+1.386+0.693=2.772", explanation: "Dùng log tự nhiên." },
          { state: "NLL trung bình=2.772/3=0.924", explanation: "Chuẩn hóa theo số token được chấm." },
          { state: "PPL=exp(0.924)≈2.52", explanation: "Diễn giải như số lựa chọn hiệu dụng trung bình trong điều kiện lý tưởng hóa." },
        ],
        conclusion: "Một token xác suất 0.25 làm perplexity tăng đáng kể dù hai token còn lại đạt 0.5.",
        sanityChecks: ["PPL tối thiểu là 1.", "Token ignore không vào N.", "Dùng cùng tokenizer khi so PPL."],
      },
    ],
    implementationChecklist: ["Shift inputs/labels đúng một vị trí.", "Áp causal và padding masks đúng.", "Mask loss phần không chấm.", "Lưu decoding config cùng output."],
    masteryChecklist: ["Viết phân rã autoregressive.", "Tính perplexity.", "Giải thích teacher forcing.", "So sánh greedy/beam/sampling."],
    glossary: [
      { term: "causal mask", definition: "Mặt nạ ngăn token nhìn các vị trí tương lai." },
      { term: "teacher forcing", definition: "Dùng token đúng trước đó làm input trong huấn luyện tuần tự." },
      { term: "perplexity", definition: "Hàm mũ của negative log-likelihood trung bình theo token." },
      { term: "KV cache", definition: "Bộ nhớ key/value attention của prefix để tăng tốc decode." },
      { term: "top-p sampling", definition: "Lấy mẫu từ tập token nhỏ nhất có tổng xác suất đạt ngưỡng p." },
    ],
    sourceIds: ["d2l-vi", "nlp-principles", "nlp-representation"],
  },

  "nlp-05-encoder-decoder": {
    lessonId: "nlp-05-encoder-decoder",
    readingMinutes: 36,
    openingQuestions: ["Decoder cross-attention lấy query, key và value từ đâu?", "Vì sao chuỗi target phải có BOS/EOS và dịch vị trí?"],
    sections: [
      {
        title: "Kiến trúc sequence-to-sequence",
        paragraphs: [
          "Encoder đọc toàn bộ source với padding mask và tạo memory [B,S,d]. Decoder vừa self-attend causal trên target prefix, vừa cross-attend tới memory. Trong cross-attention, query từ decoder còn key/value từ encoder.",
          "Mô hình dùng cho dịch, tóm tắt, caption và nhiều phép biến đổi chuỗi. Khác causal LM nối prompt-output thành một chuỗi, encoder-decoder tách rõ source và target, thuận tiện khi source dài và output ngắn.",
        ],
      },
      {
        title: "Dịch target và loss",
        paragraphs: [
          "Nếu target tokens là [BOS,y1,y2,EOS], decoder input bỏ EOS còn labels bỏ BOS. Mỗi vị trí dự đoán token kế tiếp. PAD trong labels bị ignore; target causal mask ngăn nhìn đáp án tương lai.",
          "Label smoothing giảm mục tiêu one-hot tuyệt đối và có thể cải thiện tổng quát hóa, nhưng thay đổi calibration. Scheduled sampling là một hướng xử lý exposure bias, song có trade-off và không phải mặc định cho Transformer hiện đại.",
        ],
        formulas: ["P(y|x)=product_t P(y_t|y_<t, Enc(x))"],
      },
      {
        title: "Search và đánh giá chuỗi",
        paragraphs: [
          "Beam search giữ k prefix điểm cao. Tổng log-prob thiên về chuỗi ngắn nên thường có length penalty; EOS handling sai có thể khiến output rỗng hoặc không dừng. Batched beam cần theo dõi parent indices và reorder cache chính xác.",
          "BLEU/ROUGE đo overlap nhưng không thay thế đánh giá nghĩa. Với dịch có nhiều câu đúng; với tóm tắt cần kiểm tra factual consistency với source. Báo latency và memory khi chọn beam width.",
        ],
      },
    ],
    workedExamples: [
      {
        title: "Tạo decoder input và labels",
        problem: "Target đã pad là [BOS, 7, 9, EOS, PAD]. Viết decoder input và labels dùng dự đoán token kế tiếp.",
        steps: [
          { state: "decoder_input=[BOS,7,9,EOS]", explanation: "Bỏ token cuối." },
          { state: "labels=[7,9,EOS,PAD]", explanation: "Bỏ BOS để dịch trái một vị trí." },
          { state: "Loss mask=[1,1,1,0]", explanation: "Không chấm PAD cuối." },
        ],
        conclusion: "Ba prediction hữu ích lần lượt học 7, 9 và EOS.",
        sanityChecks: ["Hai chuỗi có cùng length.", "BOS không phải target ở vị trí đầu.", "EOS phải được chấm để model học dừng."],
      },
    ],
    implementationChecklist: ["Tách source/target masks.", "Shift target đúng.", "Ignore PAD trong loss.", "Test generation dừng tại EOS."],
    masteryChecklist: ["Vẽ self/cross-attention.", "Tạo input-label từ target.", "Giải thích exposure bias.", "Mô tả beam search và length penalty."],
    glossary: [
      { term: "encoder memory", definition: "Chuỗi hidden states source mà decoder cross-attend." },
      { term: "cross-attention", definition: "Attention dùng query decoder và key/value encoder." },
      { term: "BOS", definition: "Token đánh dấu bắt đầu chuỗi đích." },
      { term: "EOS", definition: "Token đánh dấu kết thúc chuỗi." },
      { term: "beam search", definition: "Tìm kiếm giữ nhiều prefix ứng viên tốt nhất qua từng bước." },
    ],
    sourceIds: ["d2l-vi", "nlp-principles"],
  },

  "nlp-06-pretrained-and-api": {
    lessonId: "nlp-06-pretrained-and-api",
    readingMinutes: 33,
    openingQuestions: ["Làm sao tái lập một kết quả khi model/API có phiên bản và sampling?", "Dữ liệu nào tuyệt đối không được gửi sang dịch vụ bên ngoài?"],
    sections: [
      {
        title: "Chọn pretrained model theo ràng buộc",
        paragraphs: [
          "Model card, license, ngôn ngữ, context, latency, memory và benchmark đúng miền quan trọng hơn số tham số đơn thuần. Chạy baseline trên tập kiểm định của chính bài toán; benchmark công bố không bảo đảm hiệu năng ở dữ liệu Việt Nam hoặc domain riêng.",
          "Pin model revision, tokenizer revision, dtype và preprocessing. Với API, pin model identifier khi nhà cung cấp hỗ trợ và lưu request parameters; tên alias có thể đổi backend theo thời gian.",
        ],
      },
      {
        title: "Giao thức API đáng tin cậy",
        paragraphs: [
          "Request cần timeout, retry có exponential backoff và jitter, giới hạn concurrency, idempotency khi tác vụ có side effect, cùng xử lý rate limit. Retry mù có thể nhân chi phí hoặc tạo bản ghi trùng.",
          "Output mô hình là dữ liệu không tin cậy. Nếu cần JSON, validate bằng schema, giới hạn kích thước, xử lý từ chối và không thực thi code/HTML từ output. Prompt injection trong tài liệu đầu vào không được có quyền thay đổi policy hệ thống hoặc gọi công cụ ngoài ý muốn.",
        ],
      },
      {
        title: "Riêng tư, chi phí và đánh giá",
        paragraphs: [
          "Phân loại dữ liệu trước khi gửi: thông tin cá nhân, bí mật, bài thi chưa công bố và dữ liệu có điều khoản hạn chế có thể không được rời hệ thống. Redaction phải kiểm chứng; log cũng có thể rò dữ liệu như payload.",
          "Tính chi phí theo input/output tokens, cache và số retry; theo dõi p50/p95 latency. Evaluation set cố định cần so quality, refusal, hallucination và regression qua phiên bản, không chỉ chấm vài prompt mẫu bằng mắt.",
        ],
        formulas: ["cost = n_in*c_in + n_out*c_out", "backoff_k = min(cap, base*2^k) + jitter"],
      },
    ],
    workedExamples: [
      {
        title: "Ước lượng ngân sách batch",
        problem: "1,000 request, mỗi request trung bình 800 input và 200 output tokens. Giá giả định 2 đơn vị/triệu input, 6 đơn vị/triệu output. Tính chi phí trước retry.",
        steps: [
          { state: "Input=800,000 tokens → 0.8*2=1.6", explanation: "Quy đổi sang triệu token." },
          { state: "Output=200,000 tokens → 0.2*6=1.2", explanation: "Output có đơn giá riêng." },
          { state: "Tổng=2.8 đơn vị", explanation: "Chưa gồm retry, cache hay phí khác." },
        ],
        conclusion: "Giảm output dư thừa có thể tiết kiệm mạnh vì đơn giá output cao hơn trong giả định.",
        sanityChecks: ["Đơn vị giá và token thống nhất.", "Theo dõi retry thực tế.", "Không ghi payload nhạy cảm vào cost log."],
      },
    ],
    implementationChecklist: ["Pin revision và tham số.", "Có timeout/retry/rate limit.", "Validate output schema.", "Lọc dữ liệu và đo cost/latency."],
    masteryChecklist: ["Đọc model card theo use case.", "Thiết kế retry an toàn.", "Nêu threat của prompt injection.", "Lập evaluation regression set."],
    glossary: [
      { term: "model card", definition: "Tài liệu mô tả model, dữ liệu, đánh giá, giới hạn và cách dùng." },
      { term: "revision pinning", definition: "Khóa phiên bản artifact để tái lập hành vi." },
      { term: "rate limit", definition: "Giới hạn số request hoặc token theo thời gian." },
      { term: "idempotency", definition: "Tính chất gọi lặp không tạo thêm hiệu ứng ngoài ý muốn." },
      { term: "prompt injection", definition: "Nội dung đầu vào cố thao túng chỉ dẫn hoặc quyền công cụ của hệ thống." },
    ],
    sourceIds: ["nlp-principles", "pml-advanced"],
  },

  "audio-01-waveform-sampling": {
    lessonId: "audio-01-waveform-sampling",
    readingMinutes: 31,
    openingQuestions: ["Sample rate giới hạn tần số biểu diễn được như thế nào?", "Chuẩn hóa amplitude có thể phá thông tin loudness cần cho nhiệm vụ không?"],
    sections: [
      {
        title: "Waveform và lấy mẫu",
        paragraphs: [
          "Âm thanh số là chuỗi biên độ theo thời gian. Sample rate f_s cho biết số mẫu mỗi giây; đoạn T giây có gần T*f_s mẫu. Bit depth mô tả độ phân giải lượng tử hóa, khác sample rate.",
          "Định lý Nyquist yêu cầu tần số tín hiệu nhỏ hơn f_s/2 để tránh aliasing trong mô hình band-limited lý tưởng. f_s/2 là biên Nyquist, không phải tần số nội dung an toàn mặc định; bộ lọc anti-alias thực cần vùng chuyển tiếp nên băng thông hữu dụng phải thấp hơn biên. Khi downsample phải low-pass trước; lấy mỗi k mẫu trực tiếp có thể gập tần số cao thành tần số giả thấp.",
        ],
        formulas: ["N = T f_s", "f_Nyquist = f_s/2"],
      },
      {
        title: "Kênh, biên độ và đơn vị",
        paragraphs: [
          "Mono có một kênh, stereo thường hai kênh. Shape có thể [channels,time] hoặc [time,channels]; nhầm trục làm resample/normalize sai. PCM integer cần đổi sang float đúng scale và tránh overflow.",
          "Peak normalization, RMS normalization và loudness normalization phục vụ mục tiêu khác nhau. Nếu loudness là tín hiệu nhãn, normalize từng clip có thể xóa thông tin. DC offset và clipping nên được đo trước khi xử lý.",
        ],
      },
      {
        title: "Cắt đoạn và split dữ liệu",
        paragraphs: [
          "Mô hình thường cần clip cố định nên phải pad/crop hoặc chunk waveform. Random crop trong train tăng đa dạng; evaluation cần quy tắc deterministic và aggregation cấp file.",
          "Không để đoạn từ cùng recording hoặc cùng speaker lọt sang train và validation. Acoustic conditions gần trùng làm metric ảo cao hơn khả năng tổng quát sang người nói/phòng mới.",
        ],
      },
    ],
    workedExamples: [
      {
        title: "Độ dài và Nyquist",
        problem: "Clip 2.5 giây ở 16 kHz. Có bao nhiêu mẫu và biên Nyquist là bao nhiêu? Nếu stereo, tensor channel-first có shape nào?",
        steps: [
          { state: "N=2.5*16000=40,000", explanation: "Số mẫu trên mỗi kênh." },
          { state: "f_N=8,000 Hz", explanation: "Đây là biên Nyquist; nội dung cần nằm dưới biên và chừa vùng chuyển tiếp cho bộ lọc anti-alias thực." },
          { state: "Stereo shape [2,40000]", explanation: "Hai kênh cùng số mẫu theo quy ước channel-first." },
        ],
        conclusion: "Stereo có 80,000 giá trị tổng nhưng duration vẫn 2.5 giây.",
        sanityChecks: ["Duration=N/f_s.", "Resample phải cập nhật f_s metadata.", "Không suy ra bit depth từ float tensor."],
      },
    ],
    implementationChecklist: ["Ghi sample rate và channel convention.", "Dùng resampler có anti-alias.", "Đo clipping/DC offset.", "Group-split theo recording/speaker."],
    masteryChecklist: ["Tính samples từ duration.", "Giải thích aliasing.", "Phân biệt sample rate/bit depth.", "Chọn normalization không phá nhãn."],
    glossary: [
      { term: "waveform", definition: "Chuỗi biên độ âm thanh theo thời gian." },
      { term: "sample rate", definition: "Số mẫu thu trên một giây." },
      { term: "Nyquist frequency", definition: "Một nửa sample rate, biên tần số lý tưởng trước aliasing." },
      { term: "aliasing", definition: "Hiện tượng tần số cao xuất hiện thành tần số khác sau lấy mẫu." },
      { term: "clipping", definition: "Biên độ bị cắt ở giới hạn biểu diễn, gây méo." },
    ],
    sourceIds: ["speech-processing", "think-dsp"],
  },

  "audio-02-stft": {
    lessonId: "audio-02-stft",
    readingMinutes: 35,
    openingQuestions: ["Vì sao FFT toàn clip không cho biết sự kiện xảy ra lúc nào?", "Window length tạo trade-off thời gian-tần số ra sao?"],
    sections: [
      {
        title: "Từ Fourier transform tới STFT",
        paragraphs: [
          "FFT toàn tín hiệu cho phổ tần tổng nhưng mất vị trí thời gian. STFT chia waveform thành frame chồng lấp, nhân window rồi FFT từng frame, tạo ma trận frequency x time.",
          "Window làm giảm spectral leakage do cắt đoạn đột ngột. Hann phổ biến nhưng không phải duy nhất. Hop length quyết định khoảng cách frame; n_fft quyết định lưới tần số và có thể lớn hơn win length nhờ zero-padding, nhưng zero-padding không tạo thêm độ phân giải vật lý.",
        ],
        formulas: ["X[m,k]=sum_n x[n+mH] w[n] exp(-j2pi kn/N)", "f_k = k f_s/n_fft"],
      },
      {
        title: "Độ phân giải và shape",
        paragraphs: [
          "Window dài phân biệt tần số gần nhau tốt hơn nhưng làm mờ biến đổi nhanh; window ngắn định vị thời gian tốt hơn nhưng phổ thô. Đây là giới hạn time-frequency, không thể tăng cả hai chỉ bằng zero-padding.",
          "Với real FFT, số bin là floor(n_fft/2)+1. Số frame phụ thuộc padding/center convention; công thức phải khớp thư viện. Magnitude bỏ phase, power bình phương magnitude; hai đại lượng không thay thế lẫn nhau trong log conversion.",
        ],
      },
      {
        title: "Kiểm tra tái tạo và log scale",
        paragraphs: [
          "Inverse STFT cần phase và điều kiện overlap-add phù hợp. Reconstruction error trên waveform toy là kiểm tra mạnh cho window, hop và center. Nếu chỉ lưu magnitude thì không thể tái tạo chính xác phase gốc.",
          "Log magnitude nén dynamic range: dùng epsilon hoặc tham chiếu dB rõ ràng. Không lấy log trực tiếp của 0 và không trộn 10log10 power với 20log10 amplitude.",
        ],
      },
    ],
    workedExamples: [
      {
        title: "Shape phổ STFT",
        problem: "Waveform N=16000, n_fft=400, win=400, hop=160, center=false. Tính số frequency bins và frames.",
        steps: [
          { state: "F=floor(400/2)+1=201", explanation: "Real FFT giữ tần số không âm." },
          { state: "T=floor((16000-400)/160)+1=98", explanation: "Không padding vì center=false." },
          { state: "STFT complex shape [201,98]", explanation: "Theo quy ước frequency-first." },
        ],
        conclusion: "Magnitude và phase đều có cùng shape [201,98].",
        sanityChecks: ["Frame đầu dùng samples 0..399.", "Frame cuối không vượt N.", "Đổi center=true sẽ đổi số frame."],
      },
    ],
    implementationChecklist: ["Ghi rõ n_fft/win/hop/window/center.", "Assert STFT shape.", "Phân biệt magnitude và power.", "Test inverse STFT khi cần phase."],
    masteryChecklist: ["Giải thích trade-off thời gian-tần số.", "Tính bins/frames.", "Nêu vai trò window.", "Dùng dB đúng amplitude/power."],
    glossary: [
      { term: "frame", definition: "Đoạn waveform ngắn dùng cho một phép FFT." },
      { term: "hop length", definition: "Khoảng cách số mẫu giữa hai frame liên tiếp." },
      { term: "spectral leakage", definition: "Năng lượng tần số lan sang bin lân cận do quan sát hữu hạn." },
      { term: "magnitude", definition: "Độ lớn của hệ số STFT phức." },
      { term: "phase", definition: "Góc của hệ số phức, chứa thông tin căn chỉnh dao động." },
    ],
    sourceIds: ["speech-processing", "think-dsp"],
  },

  "audio-03-mel-spectrogram": {
    lessonId: "audio-03-mel-spectrogram",
    readingMinutes: 32,
    openingQuestions: ["Mel filterbank nén trục tần số theo trực giác thính giác ra sao?", "Log-mel preprocessing phải khớp pretrained model ở những tham số nào?"],
    sections: [
      {
        title: "Từ power spectrum tới mel bands",
        paragraphs: [
          "Mel spectrogram lấy power hoặc magnitude spectrogram rồi nhân filterbank tam giác trên trục tần số. Các band dày hơn ở tần số thấp và thưa hơn ở cao, phản ánh gần đúng độ phân giải cảm nhận cao độ.",
          "Số mel bands, f_min, f_max, scale formula và normalization filter đều ảnh hưởng giá trị. Hai thư viện dùng mặc định khác nhau có thể tạo input khác đáng kể dù cùng tên log-mel.",
        ],
        formulas: ["M[m,t]=sum_k H[m,k] |X[k,t]|^2", "mel(f)=2595 log10(1+f/700)"],
      },
      {
        title: "Log compression và chuẩn hóa",
        paragraphs: [
          "Năng lượng âm thanh có dải động lớn. log(M+epsilon) hoặc dB làm nổi cấu trúc yếu và thuận lợi tối ưu. Reference dB, top_db và epsilon phải được pin nếu muốn tái lập.",
          "Mean-variance normalization có thể theo dataset, utterance hoặc feature bin. Chuẩn hóa từng utterance bỏ khác biệt năng lượng toàn cục; điều này tốt hay xấu tùy nhiệm vụ.",
        ],
      },
      {
        title: "Đọc hình học log-mel",
        paragraphs: [
          "Trục ngang là frame thời gian, trục dọc là mel band, không phải Hz tuyến tính. Harmonics, formants, onset và silence tạo mẫu khác nhau. Khi hiển thị cần gắn extent đúng để không gán nhãn tần số sai.",
          "SpecAugment che block thời gian/tần số trong train để regularize; không dùng cho validation. Nó giả định một phần phổ bị mất vẫn giữ nhãn, nên mức che phải phù hợp độ dài và nội dung.",
        ],
      },
    ],
    workedExamples: [
      {
        title: "Nhân một mel filter",
        problem: "Một frame power có ba bin [1,4,9]. Hai filter mel có trọng số h1=[1,0.5,0], h2=[0,0.5,1]. Tính mel energies và log tự nhiên với epsilon bỏ qua.",
        steps: [
          { state: "M1=1*1+0.5*4+0*9=3", explanation: "Filter thấp ưu tiên bin đầu." },
          { state: "M2=0*1+0.5*4+1*9=11", explanation: "Filter cao ưu tiên bin cuối." },
          { state: "log-M≈[1.099,2.398]", explanation: "Nén dynamic range sau khi cộng năng lượng." },
        ],
        conclusion: "Filterbank biến 3 FFT bins thành 2 mel bands rồi log-compress.",
        sanityChecks: ["Trọng số filter không âm.", "Mel energy không âm trước log.", "Không log giá trị 0 nếu thiếu epsilon."],
      },
    ],
    implementationChecklist: ["Pin STFT và mel parameters.", "Xác nhận power hay magnitude.", "Ghi rõ log/dB convention.", "Quan sát phổ với trục đúng."],
    masteryChecklist: ["Mô tả mel filterbank.", "Tính mel energy toy.", "Giải thích log compression.", "Nêu hậu quả mismatch preprocessing."],
    glossary: [
      { term: "mel scale", definition: "Thang tần số phi tuyến gần với cảm nhận cao độ." },
      { term: "filterbank", definition: "Tập bộ lọc gộp năng lượng các vùng tần số." },
      { term: "log-mel", definition: "Mel spectrogram sau phép nén log hoặc dB." },
      { term: "dynamic range", definition: "Khoảng chênh giữa mức tín hiệu nhỏ và lớn." },
      { term: "SpecAugment", definition: "Augmentation che vùng thời gian hoặc tần số của spectrogram." },
    ],
    sourceIds: ["speech-processing", "think-dsp"],
  },

  "audio-04-mfcc": {
    lessonId: "audio-04-mfcc",
    readingMinutes: 31,
    openingQuestions: ["DCT trên log-mel tách thông tin bao phổ như thế nào?", "Giữ bao nhiêu hệ số MFCC là hợp lý cho nhiệm vụ cụ thể?"],
    sections: [
      {
        title: "Pipeline MFCC đầy đủ",
        paragraphs: [
          "MFCC thường đi qua pre-emphasis tùy chọn, framing/windowing, power spectrum, mel filterbank, log và DCT. Mỗi bước có tham số; gọi một hàm mặc định mà không ghi cấu hình làm kết quả khó tái lập.",
          "DCT thường làm các log-mel bands bớt tương quan một cách xấp xỉ dưới thống kê tiếng nói thường gặp, đồng thời gom biến thiên trơn của spectral envelope vào hệ số thấp; nó không bảo đảm decorrelate mọi dữ liệu. MFCC không phải phổ có thể đọc trực tiếp theo tần số và đã bỏ nhiều chi tiết fine spectrum.",
        ],
        formulas: ["c_n = sum_{m=0}^{M-1} log(M_m) cos(pi n(m+1/2)/M)"],
      },
      {
        title: "Hệ số 0, liftering và delta",
        paragraphs: [
          "Hệ số c0 liên quan năng lượng trung bình log-mel; một số pipeline giữ, thay bằng log energy hoặc bỏ. Liftering tái trọng số cepstral coefficients. Các lựa chọn này phải khớp model downstream.",
          "Delta và delta-delta xấp xỉ thay đổi theo thời gian qua cửa sổ nhiều frame. Chúng cần xử lý biên và không nên tính độc lập sau khi shuffle frame.",
        ],
      },
      {
        title: "Khi dùng MFCC và khi không",
        paragraphs: [
          "MFCC là feature gọn, mạnh cho nhiều hệ thống speech truyền thống và baseline nhỏ. Mạng sâu hiện đại thường học trực tiếp từ log-mel hoặc waveform để giữ nhiều thông tin hơn.",
          "Đánh giá số coefficients bằng ablation. Quá ít mất phân biệt âm vị; quá nhiều giữ noise/fine detail và giảm lợi ích nén. Chuẩn hóa cepstral mean/variance phải fit trên train hoặc theo quy tắc đã chọn.",
        ],
      },
    ],
    workedExamples: [
      {
        title: "DCT hai hệ số",
        problem: "Log-mel frame có M=2 giá trị [a,b]=[1,3]. Dùng DCT không chuẩn hóa c_n=sum_m x_m cos(pi*n*(m+0.5)/M). Tính c0,c1.",
        steps: [
          { state: "c0=1+3=4", explanation: "cos(0)=1 cho mọi band." },
          { state: "c1=1*cos(pi/4)+3*cos(3pi/4)", explanation: "Hai hệ số có dấu đối nhau." },
          { state: "c1≈0.707-2.121=-1.414", explanation: "Hệ số mô tả độ dốc giữa hai band." },
        ],
        conclusion: "c0 giữ mức chung còn c1 phản ánh tương phản thấp-cao trong toy example.",
        sanityChecks: ["Kết quả phụ thuộc normalization DCT.", "DCT chạy trên log-mel, không trực tiếp waveform.", "Shape cuối là [n_mfcc,time]."],
      },
    ],
    implementationChecklist: ["Ghi toàn bộ frontend parameters.", "Chốt c0/energy convention.", "Tính delta trước shuffle.", "Fit normalization không rò validation."],
    masteryChecklist: ["Liệt kê pipeline MFCC.", "Tính DCT toy.", "Giải thích spectral envelope.", "So MFCC và log-mel cho deep learning."],
    glossary: [
      { term: "cepstrum", definition: "Biểu diễn sau biến đổi log spectrum, tách biến thiên trơn và nhanh." },
      { term: "DCT", definition: "Biến đổi cosine rời rạc dùng nén/correlate log-mel features." },
      { term: "c0", definition: "Hệ số MFCC bậc 0 liên quan mức log-energy tổng." },
      { term: "delta feature", definition: "Xấp xỉ đạo hàm thời gian của cepstral feature." },
      { term: "CMVN", definition: "Chuẩn hóa trung bình và phương sai cepstral features." },
    ],
    sourceIds: ["speech-processing", "think-dsp"],
  },

  "audio-05-hubert": {
    lessonId: "audio-05-hubert",
    readingMinutes: 34,
    openingQuestions: ["HuBERT tạo pseudo-label cho audio chưa gán nhãn bằng cách nào?", "Masking liên tục theo thời gian khác che từng frame độc lập ra sao?"],
    sections: [
      {
        title: "Hidden-unit pretraining",
        paragraphs: [
          "HuBERT dùng feature acoustic ban đầu để clustering frame thành pseudo-label rời rạc. Mô hình che các đoạn waveform latent rồi dự đoán cluster ID tại vị trí che từ ngữ cảnh, học biểu diễn trước khi có transcript.",
          "Pseudo-label vòng đầu có thể thô; sau pretraining, feature tốt hơn được cluster lại cho iteration kế tiếp. Cluster không nhất thiết là phoneme thật, mà là mục tiêu ẩn đủ nhất quán để ép mô hình học cấu trúc âm thanh.",
        ],
      },
      {
        title: "Feature encoder, masking và objective",
        paragraphs: [
          "Convolutional feature encoder giảm waveform thành chuỗi latent tốc độ thấp hơn. Transformer contextual encoder xử lý chuỗi với mask spans. Loss classification chỉ hoặc chủ yếu tại masked positions, tránh sao chép local input quá dễ.",
          "Padding mask theo thời lượng thật và mask pretraining là hai mặt nạ khác nhau. Trộn chúng làm mô hình chấm PAD hoặc không học vị trí che.",
        ],
        formulas: ["L_mask=-sum_{t in M} log p(c_t|x_masked)"],
      },
      {
        title: "Fine-tuning và đánh giá",
        paragraphs: [
          "Cho ASR, thêm CTC head và fine-tune với transcript; cho classification, pooling contextual states. Freeze feature encoder ở giai đoạn đầu có thể ổn định khi nhãn ít, nhưng cần ablation.",
          "Split theo speaker/recording, theo dõi hours chứ không chỉ số file. Pretraining overlap với test corpus có thể làm kết quả lạc quan; model card và provenance dữ liệu cần được kiểm tra.",
        ],
      },
    ],
    workedExamples: [
      {
        title: "Mask spans trên latent sequence",
        problem: "Latent có 12 frame. Chọn start positions 2 và 8, mask length 3, chỉ số từ 0. Liệt kê vị trí mask và tỷ lệ.",
        steps: [
          { state: "Span 1={2,3,4}", explanation: "Ba frame liên tục từ vị trí 2." },
          { state: "Span 2={8,9,10}", explanation: "Hai span không chồng trong ví dụ." },
          { state: "6/12=50% frame bị che", explanation: "Loss pseudo-label tập trung tại các vị trí này." },
        ],
        conclusion: "Span masking buộc mô hình dùng ngữ cảnh rộng hơn che frame rời rạc.",
        sanityChecks: ["Không mask vượt chiều dài thật.", "PAD không được tính vào tỷ lệ.", "Mask spans có thể overlap; code phải định nghĩa cách đếm."],
      },
    ],
    implementationChecklist: ["Khớp sample rate checkpoint.", "Tách padding/masking masks.", "Theo dõi latent frame rate.", "Group-split theo speaker."],
    masteryChecklist: ["Giải thích pseudo-label clustering.", "Mô tả span masking.", "Chọn head fine-tuning.", "Nêu rủi ro corpus overlap."],
    glossary: [
      { term: "pseudo-label", definition: "Nhãn tự sinh từ clustering hoặc mô hình thay cho annotation thủ công." },
      { term: "hidden unit", definition: "Cụm rời rạc đại diện mẫu acoustic tiềm ẩn." },
      { term: "span masking", definition: "Che một đoạn frame liên tục thay vì điểm độc lập." },
      { term: "feature encoder", definition: "Khối biến waveform thành chuỗi latent." },
      { term: "CTC head", definition: "Head dự đoán token theo frame với objective CTC." },
    ],
    sourceIds: ["hubert-paper", "speech-processing", "pml-advanced"],
  },

  "audio-06-whisper": {
    lessonId: "audio-06-whisper",
    readingMinutes: 36,
    openingQuestions: ["Whisper đóng gói task, ngôn ngữ và timestamp vào token như thế nào?", "WER có thể vượt 100% và vì sao normalization ảnh hưởng điểm?"],
    sections: [
      {
        title: "Audio encoder và text decoder",
        paragraphs: [
          "Whisper-style ASR biến audio thành log-mel theo cấu hình cố định, encoder tạo audio memory, decoder autoregressive sinh token. Special tokens chỉ task transcription/translation, ngôn ngữ, timestamp và trạng thái no-speech.",
          "Đây là encoder-decoder, không phải chỉ CTC. Decoder có language modeling mạnh nên có thể sửa noise nhưng cũng hallucinate văn bản hợp ngữ pháp khi audio im lặng hoặc ngoài miền.",
        ],
      },
      {
        title: "Chunking, timestamps và decode",
        paragraphs: [
          "Audio dài được chia window và cần chiến lược overlap/context. Ghép chunk phải loại trùng, giữ timestamp đơn điệu và không cắt giữa từ tùy tiện. Voice activity detection có thể giảm silence nhưng lỗi VAD làm mất tiếng nói.",
          "Temperature fallback, beam size, no-speech threshold và condition-on-previous-text ảnh hưởng kết quả. Lưu cấu hình decode để tái lập; không chỉ lưu transcript.",
        ],
      },
      {
        title: "WER và error analysis",
        paragraphs: [
          "WER=(S+D+I)/N với substitution, deletion, insertion sau normalization đã công bố. WER có thể lớn hơn 100% nếu insertion nhiều. Với tiếng Việt, cách xử lý dấu, chữ số, viết tắt và punctuation phải nhất quán giữa reference/hypothesis.",
          "Báo WER theo speaker, noise, độ dài và ngôn ngữ; xem alignment để biết loại lỗi. Tên riêng có thể cần metric bổ sung vì một lỗi entity quan trọng hơn nhiều function words.",
        ],
        formulas: ["WER=(S+D+I)/N"],
      },
    ],
    workedExamples: [
      {
        title: "Tính WER từ alignment",
        problem: "Reference có 5 từ. Hypothesis có 1 substitution, 1 deletion và 2 insertion. Tính WER.",
        steps: [
          { state: "Tổng edit errors=1+1+2=4", explanation: "Cộng S,D,I." },
          { state: "N=5", explanation: "Mẫu số là số từ reference, không phải hypothesis." },
          { state: "WER=4/5=0.8=80%", explanation: "Bốn lỗi trên năm từ tham chiếu." },
        ],
        conclusion: "Nếu insertion tăng lên 5 với lỗi khác giữ nguyên, WER sẽ vượt 100%.",
        sanityChecks: ["Normalization chạy trước alignment.", "N=0 cần quy ước riêng.", "Không báo accuracy=1-WER khi WER có thể >1."],
      },
    ],
    implementationChecklist: ["Dùng đúng sample rate/log-mel config.", "Pin language/task/decode params.", "Xử lý chunk overlap/timestamps.", "Báo WER cùng normalization."],
    masteryChecklist: ["Vẽ encoder-decoder ASR.", "Giải thích hallucination trên silence.", "Tính WER.", "Thiết kế error analysis theo subgroup."],
    glossary: [
      { term: "ASR", definition: "Nhận dạng tiếng nói tự động thành văn bản." },
      { term: "WER", definition: "Tỷ lệ edit word-level trên số từ tham chiếu." },
      { term: "timestamp token", definition: "Token biểu diễn mốc thời gian trong output decoder." },
      { term: "VAD", definition: "Phát hiện vùng có tiếng nói trong audio." },
      { term: "hallucination", definition: "Transcript có vẻ hợp lý nhưng không được audio hỗ trợ." },
    ],
    sourceIds: ["whisper-paper", "speech-processing"],
  },

  "audio-07-qwen-audio": {
    lessonId: "audio-07-qwen-audio",
    readingMinutes: 34,
    openingQuestions: ["Audio encoder được nối vào language model qua adapter nào?", "Làm sao phân biệt khả năng nghe thật với suy đoán từ prompt văn bản?"],
    sections: [
      {
        title: "Audio-language model tổng quát",
        paragraphs: [
          "Mô hình kiểu Qwen-Audio kết hợp audio encoder với language model để xử lý ASR, mô tả âm thanh, trả lời câu hỏi và nhiều task qua instruction. Audio features được projector/adapter đưa về không gian embedding mà decoder ngôn ngữ có thể cross-attend hoặc nhận như token mềm.",
          "Template hội thoại, special audio markers và processor là một phần checkpoint. Bỏ marker hoặc tự ghép prompt khác format có thể làm model không xác định ranh giới audio.",
        ],
      },
      {
        title: "Tiền xử lý và giới hạn context",
        paragraphs: [
          "Sample rate, số kênh, duration tối đa và audio frontend phải theo processor. Audio dài tạo nhiều frames/tokens và cạnh tranh context với text. Chunking độc lập làm mất câu hỏi-ngữ cảnh và quan hệ xuyên đoạn.",
          "Batch multimodal cần padding/masks cho cả audio và text. Theo dõi shape sau encoder, projector và sequence assembly; lỗi offset khiến labels text bị lệch so với logits.",
        ],
      },
      {
        title: "Đánh giá grounding và an toàn",
        paragraphs: [
          "Tạo paired tests giữ prompt nhưng đổi audio, và giữ audio nhưng đổi câu hỏi. Nếu output không đổi khi audio đổi quan trọng, model đang dựa vào prior ngôn ngữ. Thêm negative audio/silence để đo refusal hoặc uncertainty.",
          "Không xem câu trả lời trôi chảy là đúng. Chấm ASR bằng WER, event QA bằng accuracy/F1 và caption bằng human grounding rubric. Audio có thể chứa dữ liệu cá nhân; pipeline upload/log cần chính sách rõ.",
        ],
      },
    ],
    workedExamples: [
      {
        title: "Theo dõi shape qua adapter",
        problem: "Audio encoder xuất [B=2,T=300,d_a=1024], projector Linear(1024,4096), prompt text 40 token. Nếu nối audio tokens trước text, sequence embedding có shape nào?",
        steps: [
          { state: "Project audio→[2,300,4096]", explanation: "Projector chỉ đổi feature dimension." },
          { state: "Text embeddings=[2,40,4096]", explanation: "Cùng d_model của language model." },
          { state: "Concatenate→[2,340,4096]", explanation: "Mask/position phải đánh dấu đúng 300 audio và 40 text token." },
        ],
        conclusion: "Audio duration làm sequence length tăng trực tiếp trong kiến trúc nối token giả định này.",
        sanityChecks: ["Adapter output dimension bằng LM d_model.", "Attention mask length=340.", "Labels chỉ chấm vị trí response theo template."],
      },
    ],
    implementationChecklist: ["Dùng processor/chat template chính thức.", "Assert sample rate/duration.", "Theo dõi audio-text masks và offsets.", "Chạy paired grounding tests."],
    masteryChecklist: ["Mô tả encoder-adapter-LM.", "Suy ra multimodal shape.", "Thiết kế test chống language prior.", "Chọn metric theo task audio."],
    glossary: [
      { term: "audio encoder", definition: "Mạng biến waveform/features thành chuỗi biểu diễn acoustic." },
      { term: "projector", definition: "Khối ánh xạ feature audio sang chiều language model." },
      { term: "audio token", definition: "Vector đại diện một đoạn audio trong chuỗi multimodal." },
      { term: "grounding", definition: "Mức câu trả lời thực sự dựa trên nội dung audio." },
      { term: "chat template", definition: "Quy ước ghép vai, special tokens và modal inputs cho checkpoint." },
    ],
    sourceIds: ["qwen-audio-official", "speech-processing", "nlp-representation"],
  },

  "audio-08-voxtral": {
    lessonId: "audio-08-voxtral",
    readingMinutes: 33,
    openingQuestions: ["Mô hình audio instruction cần được benchmark khác ASR thuần như thế nào?", "Streaming và batch inference đánh đổi độ trễ, context ra sao?"],
    sections: [
      {
        title: "Audio instruction model và phạm vi task",
        paragraphs: [
          "Mô hình kiểu Voxtral nhận audio cùng chỉ dẫn văn bản để transcription, translation, summarization hoặc audio QA. Một checkpoint đa nhiệm cần task token/template rõ; không suy diễn mọi khả năng từ tên model mà phải kiểm tra model card và phiên bản cụ thể.",
          "Audio frontend tạo sequence features, connector đưa vào language backbone/decoder. Context budget gồm cả audio và text; duration hỗ trợ trên giấy có thể khác duration cho chất lượng ổn định trong domain đích.",
        ],
      },
      {
        title: "Batching, streaming và phục vụ",
        paragraphs: [
          "Offline batch có toàn bộ context và throughput cao. Streaming phải quyết định chunk size, overlap, state/cache và khi nào commit token. Chunk nhỏ giảm latency đầu nhưng thiếu context; chunk lớn tăng độ trễ.",
          "Dynamic batching cần nhóm duration gần nhau để giảm padding. Theo dõi real-time factor, time-to-first-token, p95 latency, memory và queue time; chỉ đo tokens/s không phản ánh trải nghiệm audio.",
        ],
        formulas: ["RTF = processing_time/audio_duration"],
      },
      {
        title: "Benchmark chống ảo tưởng năng lực",
        paragraphs: [
          "Tách bộ ASR, translation, QA, speaker/noise và long-form. Dùng silence, corrupt audio và câu hỏi không thể trả lời để đánh giá calibration/refusal. Transcript tham chiếu cần normalization cố định.",
          "Phiên bản model/API có thể thay đổi, nên lưu identifier, processor, decoding params và ngày chạy. Với model đóng, regression suite nội bộ là bằng chứng đáng tin hơn mô tả marketing.",
        ],
      },
    ],
    workedExamples: [
      {
        title: "Tính real-time factor",
        problem: "Hệ thống xử lý batch gồm 6 phút audio trong 90 giây. Tính RTF và throughput theo phút audio mỗi phút máy.",
        steps: [
          { state: "Audio duration=360 giây", explanation: "Đổi 6 phút sang giây." },
          { state: "RTF=90/360=0.25", explanation: "Nhỏ hơn 1 nghĩa nhanh hơn thời gian thực." },
          { state: "Throughput=6/1.5=4 phút audio/phút máy", explanation: "Nghịch đảo tương ứng của RTF trong điều kiện batch." },
        ],
        conclusion: "RTF 0.25 chưa nói time-to-first-token; streaming vẫn cần đo latency riêng.",
        sanityChecks: ["Dùng cùng đơn vị thời gian.", "RTF theo batch không tự động là RTF một request.", "Không bỏ queue/network time nếu đo trải nghiệm thật."],
      },
    ],
    implementationChecklist: ["Pin model/processor/template.", "Benchmark duration/noise/subgroup.", "Đo RTF và p95 latency.", "Có negative/silence tests."],
    masteryChecklist: ["Phân biệt offline/streaming.", "Tính RTF.", "Thiết kế benchmark đa nhiệm.", "Giải thích context budget audio-text."],
    glossary: [
      { term: "RTF", definition: "Thời gian xử lý chia thời lượng audio." },
      { term: "streaming", definition: "Xử lý audio dần khi dữ liệu đang đến." },
      { term: "time-to-first-token", definition: "Độ trễ từ request tới token output đầu tiên." },
      { term: "dynamic batching", definition: "Ghép request đang chờ thành batch theo thời điểm/shape." },
      { term: "regression suite", definition: "Bộ test cố định phát hiện chất lượng giảm qua phiên bản." },
    ],
    sourceIds: ["voxtral-official", "speech-processing", "nlp-representation"],
  },

  "mm-01-data-embeddings": {
    lessonId: "mm-01-data-embeddings",
    readingMinutes: 34,
    openingQuestions: ["Hai modality có thể so embedding trực tiếp khi được học bằng mục tiêu nào?", "Negative sampling sai có thể biến cặp cùng nghĩa thành đối nghịch không?"],
    sections: [
      {
        title: "Dữ liệu paired và biểu diễn chung",
        paragraphs: [
          "Multimodal dataset có thể paired một-một, weakly paired theo thời gian/tài liệu, hoặc unpaired. Mức liên kết quyết định objective. Với ảnh-caption, hai encoder tạo vectors cùng dimension và contrastive loss kéo cặp đúng gần nhau.",
          "Entity, timestamp và license là phần schema dữ liệu. Split phải theo entity/source để near-duplicate không rò. Missing modality cần cờ rõ, không điền tensor zero rồi giả như dữ liệu thật.",
        ],
      },
      {
        title: "Similarity, negatives và retrieval",
        paragraphs: [
          "Cosine similarity hoặc normalized dot product thường dùng. In-batch negatives hiệu quả nhưng có false negatives: hai caption khác chỉ số vẫn có thể mô tả cùng nội dung. Dedup hoặc multi-positive loss giúp giảm supervision sai.",
          "Retrieval đánh giá Recall@K theo hai hướng, median rank và subgroup. Candidate pool size ảnh hưởng độ khó; phải báo kích thước pool và chính sách duplicate.",
        ],
        formulas: ["S_ij = normalize(a_i)^T normalize(b_j)/tau"],
      },
      {
        title: "Indexing và drift",
        paragraphs: [
          "Production retrieval thường precompute embeddings rồi dùng approximate nearest neighbor. Cần version cho encoder, preprocessing và index; trộn embeddings từ hai phiên bản có thể làm similarity vô nghĩa.",
          "Theo dõi norm distribution, nearest-neighbor examples và retrieval metrics qua thời gian. Drift dữ liệu hoặc encoder update yêu cầu re-embed/re-index có kế hoạch rollback.",
        ],
      },
    ],
    workedExamples: [
      {
        title: "Recall@2 cho ba truy vấn",
        problem: "Rank của kết quả đúng cho ba truy vấn lần lượt là 1,2,4. Tính Recall@1 và Recall@2.",
        steps: [
          { state: "R@1: chỉ rank 1 đạt → 1/3=0.333", explanation: "K=1 yêu cầu đứng đầu." },
          { state: "R@2: rank 1 và 2 đạt → 2/3=0.667", explanation: "Hai truy vấn có đúng trong top 2." },
          { state: "Query rank 4 trượt cả hai", explanation: "Nó chỉ được tính từ Recall@4 trở lên." },
        ],
        conclusion: "Recall@K không chấm độ hợp lý của các kết quả sai; cần xem mẫu retrieval bổ sung.",
        sanityChecks: ["Recall@K không giảm khi K tăng.", "Mỗi query có quy tắc ground-truth rõ.", "Candidate pool giữ cố định khi so model."],
      },
    ],
    implementationChecklist: ["Version schema/encoder/index.", "Group-split và deduplicate.", "Xử lý missing modality rõ.", "Báo retrieval hai hướng."],
    masteryChecklist: ["Phân biệt paired/weakly paired.", "Giải thích false negatives.", "Tính Recall@K.", "Lập kế hoạch re-index khi model đổi."],
    glossary: [
      { term: "modality", definition: "Loại tín hiệu như ảnh, văn bản, audio hoặc sensor." },
      { term: "paired data", definition: "Các mẫu modality được liên kết cùng một đối tượng/sự kiện." },
      { term: "in-batch negative", definition: "Mẫu khác trong batch được dùng làm đối chứng âm." },
      { term: "ANN index", definition: "Chỉ mục tìm láng giềng gần đúng trong không gian embedding." },
      { term: "embedding drift", definition: "Phân bố/ý nghĩa vector thay đổi theo dữ liệu hoặc model version." },
    ],
    sourceIds: ["ioai-2026", "pml-advanced", "nlp-representation"],
  },

  "mm-02-video": {
    lessonId: "mm-02-video",
    readingMinutes: 35,
    openingQuestions: ["Sampling bao nhiêu frame có thể bỏ lỡ một hành động ngắn?", "Mô hình video cần phân biệt biến đổi không gian và thời gian thế nào?"],
    sections: [
      {
        title: "Video là tensor không gian-thời gian",
        paragraphs: [
          "Video thường có shape [B,T,C,H,W]. Frame rate, duration và sampling policy quyết định T. Uniform sampling bao phủ toàn clip nhưng có thể bỏ sự kiện ngắn; random temporal crop tăng đa dạng train; evaluation cần multi-clip aggregation nếu một clip không đủ.",
          "Decode là phần pipeline: variable frame rate, frame bị hỏng, audio sync và rotation metadata có thể tạo sai lệch. Lưu timestamp mẫu tốt hơn giả định frame index/fps khi nguồn phức tạp.",
        ],
      },
      {
        title: "Kiến trúc và chi phí",
        paragraphs: [
          "2D CNN + temporal pooling rẻ nhưng tương tác thời gian hạn chế. 3D convolution dùng kernel theo T,H,W; two-stream thêm optical flow; video Transformer chú ý tokens theo không gian-thời gian. Factorized attention giảm chi phí so attention toàn cục.",
          "Số tokens bằng T nhân số patch mỗi frame, nên attention toàn cục tăng bình phương theo cả T. Chọn resolution, frames và patch size dựa trên budget, không chỉ accuracy.",
        ],
        formulas: ["N_tokens = T(H/P)(W/P)", "global_attention_cost = O(N_tokens^2 d)"],
      },
      {
        title: "Nhãn thời gian và evaluation",
        paragraphs: [
          "Clip classification cho một nhãn cả đoạn; temporal localization cần start/end; frame labeling cần alignment dày. Annotation mơ hồ ở biên nên metric IoU thời gian cần nhiều threshold.",
          "Split theo source video/person/event để clip gần kề không rò. Đánh giá theo duration, motion speed và camera; accuracy tổng che giấu lỗi hành động ngắn.",
        ],
      },
    ],
    workedExamples: [
      {
        title: "Đếm video tokens",
        problem: "Lấy T=8 frame, mỗi frame 224x224, patch 16. Không CLS. Tính số tokens và kích thước attention matrix một head cho một clip.",
        steps: [
          { state: "14*14=196 patches/frame", explanation: "224/16=14 mỗi chiều." },
          { state: "N=8*196=1568 tokens", explanation: "Nhân trục thời gian." },
          { state: "Attention=1568x1568≈2.46 triệu scores", explanation: "Chưa nhân số head/layer/batch." },
        ],
        conclusion: "Tăng gấp đôi frames làm số score attention toàn cục gần gấp bốn.",
        sanityChecks: ["Token order giữ mapping frame-patch.", "Mask frame padding khi duration khác nhau.", "Không nhầm fps nguồn với số frame đã sample."],
      },
    ],
    implementationChecklist: ["Ghi sampling timestamps.", "Assert [B,T,C,H,W].", "Group-split theo source/event.", "Đo memory/latency theo T và resolution."],
    masteryChecklist: ["So sánh 2D/3D/Transformer.", "Tính video tokens.", "Giải thích sampling bias.", "Chọn metric temporal localization."],
    glossary: [
      { term: "frame rate", definition: "Số frame biểu diễn mỗi giây video." },
      { term: "temporal crop", definition: "Chọn một đoạn liên tục theo thời gian." },
      { term: "3D convolution", definition: "Convolution quét đồng thời theo thời gian và không gian." },
      { term: "optical flow", definition: "Ước lượng chuyển động pixel giữa các frame." },
      { term: "temporal IoU", definition: "Tỷ lệ giao/hợp giữa hai khoảng thời gian." },
    ],
    sourceIds: ["ioai-2026", "vision-book", "pml-advanced"],
  },

  "mm-03-time-series": {
    lessonId: "mm-03-time-series",
    readingMinutes: 36,
    openingQuestions: ["Vì sao random split thường sai với chuỗi thời gian?", "Cửa sổ input-target được tạo thế nào để không nhìn tương lai?"],
    sections: [
      {
        title: "Chỉ số thời gian, tần suất và missingness",
        paragraphs: [
          "Time series là quan sát có thứ tự; timestamp, timezone, sampling frequency và entity key là dữ liệu cốt lõi. Resampling có thể tạo missing values; interpolation dùng tương lai có thể gây leakage nếu áp trước split.",
          "Missingness đôi khi có ý nghĩa, nên giữ mask và time-since-last-observation thay vì điền im lặng. Standardization phải fit trên train window, đặc biệt khi mean/variance drift.",
        ],
      },
      {
        title: "Windowing và forecasting",
        paragraphs: [
          "Với lookback L và horizon H, input tại cutoff t dùng x[t-L+1:t], target dùng y[t+1:t+H]. Feature nào chỉ biết sau cutoff không được đưa vào input. Known-future covariates như lịch có thể dùng nếu thực sự có sẵn lúc dự báo.",
          "Autoregressive multi-step lặp dự báo một bước và tích lũy lỗi; direct model xuất cả horizon; seq2seq kết hợp hai cách. Baseline last-value, seasonal-naive và moving average phải có trước model phức tạp.",
        ],
        formulas: ["X_t = x_{t-L+1:t}", "Y_t = y_{t+1:t+H}"],
      },
      {
        title: "Backtesting và metric",
        paragraphs: [
          "Không random split. Rolling-origin evaluation huấn luyện/đánh giá trên nhiều cutoff theo thứ tự thời gian, mô phỏng triển khai. Gap giữa train và validation hữu ích khi label hoặc feature có độ trễ.",
          "MAE dễ hiểu, RMSE phạt lỗi lớn, MAPE vỡ khi giá trị thật gần 0. Báo metric theo horizon/entity/season; prediction interval cần coverage và sharpness, không chỉ point error.",
        ],
        formulas: ["MAE = mean |y-yhat|", "RMSE=sqrt(mean (y-yhat)^2)"],
      },
    ],
    workedExamples: [
      {
        title: "Tạo supervised windows",
        problem: "Chuỗi [10,12,13,15,18,20], lookback L=3, horizon H=2. Liệt kê các cặp window đầy đủ.",
        steps: [
          { state: "X1=[10,12,13], Y1=[15,18]", explanation: "Ba quá khứ dự báo hai tương lai." },
          { state: "X2=[12,13,15], Y2=[18,20]", explanation: "Dịch cutoff một bước." },
          { state: "Chỉ có 2 windows", explanation: "Cần L+H=5 điểm cho mỗi cửa sổ." },
        ],
        conclusion: "Split phải dựa trên cutoff; không để X/Y của validation chồng label train ngoài chính sách.",
        sanityChecks: ["Không target nào nằm trong input cùng window.", "Thứ tự không bị shuffle trước split.", "Scaler chỉ fit phần train."],
      },
    ],
    implementationChecklist: ["Chuẩn hóa timezone/frequency.", "Tạo window không nhìn tương lai.", "Fit imputer/scaler trên train.", "Backtest nhiều cutoff với baseline."],
    masteryChecklist: ["Tạo window bằng tay.", "Giải thích random-split leakage.", "Chọn metric phù hợp zero values.", "Phân biệt autoregressive/direct forecast."],
    glossary: [
      { term: "lookback", definition: "Số bước quá khứ dùng làm input." },
      { term: "forecast horizon", definition: "Số bước tương lai cần dự báo." },
      { term: "cutoff", definition: "Thời điểm mô phỏng lúc dự báo được tạo." },
      { term: "rolling-origin", definition: "Đánh giá qua nhiều cutoff tăng dần theo thời gian." },
      { term: "seasonal naive", definition: "Baseline dùng giá trị cùng mùa/chu kỳ trước làm dự báo." },
    ],
    sourceIds: ["pml-intro", "pml-advanced"],
  },

  "mm-04-fusion": {
    lessonId: "mm-04-fusion",
    readingMinutes: 36,
    openingQuestions: ["Early, late và cross-attention fusion giả định gì về alignment?", "Mô hình phản ứng thế nào khi một modality bị thiếu hoặc nhiễu?"],
    sections: [
      {
        title: "Ba họ fusion chính",
        paragraphs: [
          "Early fusion nối features trước predictor, cho tương tác sớm nhưng đòi scale/alignment tốt. Late fusion kết hợp logits/probabilities của các model riêng, dễ modular và xử lý modality độc lập. Intermediate fusion dùng cross-attention/gating ở nhiều tầng, linh hoạt nhưng phức tạp hơn.",
          "Không có chiến lược luôn tốt nhất. Alignment chặt theo thời gian/vị trí ủng hộ early/intermediate; modality không đồng bộ hoặc deployment tách rời có thể phù hợp late fusion.",
        ],
      },
      {
        title: "Cross-attention, gating và shape",
        paragraphs: [
          "Cross-attention dùng query từ modality A và key/value từ B. A-attends-B khác B-attends-A về output length và ý nghĩa. Projection đưa các feature về cùng d_model; masks giữ padding và missing tokens.",
          "Gating học trọng số theo mẫu nhưng có thể collapse vào modality dễ nhất. Modality dropout trong train, entropy/usage diagnostics và balanced data giúp tăng robustness.",
        ],
        formulas: ["CrossAttn(A,B)=softmax((A W_Q)(B W_K)^T/sqrt(d_k))(B W_V)", "h = g h_a + (1-g) h_b"],
      },
      {
        title: "Đánh giá đóng góp và missing modality",
        paragraphs: [
          "Báo full model, từng modality riêng, shuffled modality và missing-modality tests. Nếu shuffle audio không đổi metric, audio branch có thể bị bỏ qua; nếu full thấp hơn best unimodal, fusion đang thêm noise hoặc tối ưu kém.",
          "Production cần chính sách khi modality vắng: learned missing token, mask, fallback model hay từ chối. Tensor zero không đủ nếu zero cũng là dữ liệu hợp lệ. Calibration phải kiểm tra riêng theo pattern thiếu modality.",
        ],
      },
    ],
    workedExamples: [
      {
        title: "Shape cross-attention ảnh-văn bản",
        problem: "Image tokens A có shape [B=4,196,512], text tokens B [4,32,768]. Chiếu cả hai về d=256; dùng image queries và text key/value. Tính shape score và output.",
        steps: [
          { state: "Q=[4,196,256]", explanation: "Output length theo image queries." },
          { state: "K,V=[4,32,256]", explanation: "Text cung cấp 32 key/value." },
          { state: "Scores=[4,196,32]", explanation: "Mỗi image token so với mỗi text token." },
          { state: "Output=[4,196,256]", explanation: "Weighted sum giữ số query và value dimension." },
        ],
        conclusion: "Đảo hướng attention sẽ cho output length 32, nên hai hướng không tương đương.",
        sanityChecks: ["Mask text broadcast tới trục 32.", "Softmax theo key dimension.", "Missing text cần mask/fallback, không ma trận rỗng."],
      },
    ],
    implementationChecklist: ["Ghi alignment và missingness schema.", "Assert projections/masks.", "Chạy unimodal/shuffle/missing ablations.", "Đo calibration theo modality pattern."],
    masteryChecklist: ["So sánh early/late/intermediate fusion.", "Suy ra cross-attention shapes.", "Phát hiện modality collapse.", "Thiết kế fallback thiếu modality."],
    glossary: [
      { term: "early fusion", definition: "Kết hợp modalities ở mức feature đầu pipeline." },
      { term: "late fusion", definition: "Kết hợp dự đoán từ các model/modalities riêng." },
      { term: "cross-attention", definition: "Attention với query và key/value đến từ hai nguồn khác nhau." },
      { term: "modality dropout", definition: "Cố ý bỏ modality trong train để tăng robustness." },
      { term: "modality collapse", definition: "Fusion model gần như bỏ qua một modality và dựa vào modality khác." },
    ],
    sourceIds: ["ioai-2026", "pml-advanced", "nlp-representation"],
  },
} satisfies LessonTheoryMap;
