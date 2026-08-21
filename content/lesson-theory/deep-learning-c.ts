import type { LessonTheoryMap } from "./types";

export const deepLearningTheoryC = {
  "dl-embeddings": {
    lessonId: "dl-embeddings",
    readingMinutes: 38,
    openingQuestions: [
      "Một ID rời rạc trở thành vector liên tục có thể học được bằng phép toán và gradient nào?",
      "Khoảng cách giữa hai embedding phản ánh objective huấn luyện chứ không tự nhiên mang nghĩa ra sao?",
      "Vocabulary lớn, ID mới và padding đặt ra những giới hạn bộ nhớ và triển khai nào?",
    ],
    sections: [
      {
        title: "Embedding table, lookup và shape",
        paragraphs: [
          "Embedding layer là ma trận E shape [V,d], trong đó V là số mục rời rạc và d là chiều biểu diễn. Với tensor ID shape [B,L], phép lookup lấy hàng tương ứng và trả tensor [B,L,d]. Nó tương đương nhân one-hot kích thước V với E nhưng không cần tạo tensor one-hot thưa khổng lồ. ID chỉ là chỉ mục; số 20 lớn hơn số 3 không có nghĩa mục 20 nhiều hơn hay tốt hơn mục 3.",
          "Gradient của lookup đi về các hàng đã xuất hiện. Nếu một ID lặp nhiều lần, đóng góp gradient của các lần xuất hiện được cộng hoặc chuẩn hóa theo loss reduction. Padding ID thường được cấu hình để hàng tương ứng không cập nhật và có thể giữ vector 0. Mọi ID phải nằm trong [0,V-1]; tokenizer, categorical encoder và checkpoint phải dùng cùng ánh xạ, nếu không code vẫn chạy nhưng lấy sai hàng.",
        ],
        formulas: ["E in R^{V x d}", "ids [B,L] -> lookup(E,ids) [B,L,d]", "onehot(i)^T E=E_i"],
      },
      {
        title: "Hình học được tạo bởi objective",
        paragraphs: [
          "Embedding chỉ trở nên hữu ích thông qua loss: classification kéo vector theo hướng giúp tách nhãn; metric learning so positive/negative pairs; language model tối ưu dự đoán ngữ cảnh; recommender thường dùng dot product giữa user và item. Vì objective chỉ ràng buộc những quan hệ cần cho nhiệm vụ, không nên diễn giải mọi trục hoặc mọi hàng xóm là thuộc tính nhân quả. Hai run có thể quay hoặc phản xạ toàn bộ không gian mà giữ dot products gần như không đổi.",
          "Dot product trộn cả hướng và độ dài; cosine chia norm nên chỉ đo góc khi hai norm khác 0. L2-normalize biến dot product thành cosine nhưng loại thông tin độ lớn có thể hữu ích. Contrastive loss và negative sampling phụ thuộc cách chọn negative; negative quá dễ cho ít tín hiệu, còn false negative có thể đẩy hai mục thực sự liên quan ra xa. Khoảng cách trong không gian anisotropic cũng có thể tạo hub xuất hiện gần nhiều điểm.",
        ],
        formulas: ["score(i,j)=E_i^T E_j", "cos(E_i,E_j)=E_i^T E_j/(||E_i||||E_j||)", "E'=EA với A in R^{d x d}; A trực giao bảo toàn dot/cosine, A không trực giao có thể đổi hình học"],
      },
      {
        title: "Năng lực, OOV và vòng đời artifact",
        paragraphs: [
          "Embedding table có Vd tham số, nên vocabulary lớn chi phối bộ nhớ optimizer: Adam còn giữ hai moment cùng shape ngoài weights và gradient. Dimension lớn tăng năng lực nhưng không bảo đảm chất lượng, dễ overfit ID hiếm và làm truy hồi tốn chi phí. Regularization, frequency-aware sampling, sharing hoặc factorization có thể giảm vấn đề nhưng đều thay đổi giả định mô hình.",
          "ID chưa thấy có thể ánh xạ tới UNK, được băm vào bucket hoặc được tạo từ đặc trưng nội dung; mỗi cách có trade-off collision và khả năng khái quát. Khi fine-tune pretrained embedding, có thể freeze, dùng learning rate nhỏ hoặc cập nhật toàn bộ. Artifact triển khai phải version cả ma trận, vocabulary/ID map, normalization và metric truy hồi. Thêm mục giữa vocabulary làm dịch mọi ID sau nó là lỗi tương thích nghiêm trọng; nên append hoặc rebuild đồng bộ có migration rõ.",
        ],
        formulas: ["parameter_count=Vd", "memory_weights≈Vd x bytes_per_value", "Adam state riêng cho embedding thường thêm m và v cùng shape"],
      },
    ],
    workedExamples: [
      {
        title: "Lookup, cosine và một bước cập nhật hàng",
        problem: "Cho E0=[1,0], E1=[0,1], E2=[1,1], E3=[-1,0], nên E shape [4,2]. IDs=[[2,0],[1,2]] shape [2,2]. Tính output lookup, cosine(E2,E1), rồi cập nhật E2 về target t=[0,1] với loss 0.5||E2-t||^2 và eta=0.1 cho một quan sát.",
        steps: [
          { state: "lookup=[[[1,1],[1,0]],[[0,1],[1,1]]]", explanation: "Mỗi scalar ID được thay bằng đúng hàng hai chiều; output có shape [2,2,2]." },
          { state: "dot(E2,E1)=1 và ||E2||=sqrt(2), ||E1||=1", explanation: "Dot product dùng cả hai tọa độ, còn norm chuẩn bị cho cosine." },
          { state: "cos(E2,E1)=1/sqrt(2)≈0.7071", explanation: "Hai vector không cùng hướng dù dot product dương." },
          { state: "gradient_E2=E2-t=[1,0]", explanation: "Đạo hàm của 0.5||E2-t||^2 theo hàng E2 có cùng shape (2,)." },
          { state: "E2_new=[1,1]-0.1[1,0]=[0.9,1]", explanation: "Chỉ hàng được tối ưu thay đổi trong ví dụ; E0, E1 và E3 giữ nguyên." },
        ],
        conclusion: "Lookup quyết định shape và hàng nhận gradient, còn ý nghĩa hình học đến từ loss cùng dữ liệu chứ không từ giá trị ID.",
        sanityChecks: [
          "Mọi ID 0,1,2 đều nhỏ hơn V=4; ID 4 phải bị từ chối thay vì wrap.",
          "Output lookup thêm đúng một trục cuối d=2 và giữ nguyên hai trục ID.",
          "Sau update, loss tới target phải giảm từ 0.5 xuống 0.405.",
        ],
      },
    ],
    implementationChecklist: [
      "Version vocabulary/ID map cùng embedding weights và assert mọi ID trong miền hợp lệ.",
      "Đánh dấu padding/UNK rõ ràng rồi test padding row có cập nhật theo đúng chủ đích.",
      "Ghi shape [V,d], loss reduction và cách gộp gradient khi ID lặp.",
      "Chọn dot, cosine hoặc L2 theo objective; xử lý vector norm 0 trước cosine.",
      "Đo bộ nhớ weights, gradient và optimizer state ở V,d mục tiêu.",
      "Đánh giá retrieval theo frequency/group và kiểm tra mục mới hoặc OOV.",
    ],
    masteryChecklist: [
      "Suy ra output shape của lookup từ shape ID và embedding dimension.",
      "Tính tay dot product, cosine và gradient của một hàng embedding.",
      "Giải thích vì sao thứ tự số ID không có nghĩa hình học.",
      "Phân biệt freeze, fine-tune và tạo embedding từ nội dung cho ID mới.",
      "Nêu giới hạn của việc diễn giải nearest neighbors như quan hệ nhân quả.",
    ],
    glossary: [
      { term: "Embedding table", definition: "Ma trận học được ánh xạ mỗi ID hợp lệ sang một vector d chiều." },
      { term: "Lookup", definition: "Phép lấy các hàng embedding theo tensor chỉ số mà không tạo one-hot đầy đủ." },
      { term: "Padding index", definition: "ID dành cho phần đệm, thường có hàng được giữ cố định theo cấu hình." },
      { term: "OOV", definition: "Mục nằm ngoài vocabulary hoặc ID map mà mô hình đã biết." },
      { term: "Negative sampling", definition: "Cách chọn ví dụ âm để xấp xỉ hoặc tạo tín hiệu cho objective so sánh." },
      { term: "Anisotropy", definition: "Phân bố vector tập trung không đều theo các hướng trong không gian biểu diễn." },
    ],
    sourceIds: ["d2l-vi", "d2l-en", "pml-intro", "mml"],
  },

  "dl-pooling": {
    lessonId: "dl-pooling",
    readingMinutes: 37,
    openingQuestions: [
      "Max pooling và average pooling giữ lại loại tín hiệu nào trong mỗi cửa sổ?",
      "Stride, padding và kernel quyết định output shape và phần dữ liệu bị bỏ qua ra sao?",
      "Pooling tạo bất biến cục bộ nhưng đánh mất vị trí và chi tiết ở mức nào?",
    ],
    sections: [
      {
        title: "Cửa sổ, stride và output shape",
        paragraphs: [
          "Pooling trượt một cửa sổ trên tensor và rút mỗi vùng thành giá trị tổng hợp. Với ảnh [B,C,H,W], pooling thường xử lý độc lập từng channel và giữ B,C; kernel, stride, padding, dilation quyết định H_out,W_out. Max pooling lấy cực đại, average pooling lấy trung bình theo quy ước có hoặc không tính vùng padding. Không có kernel weights học được, nhưng phép toán vẫn tham gia đồ thị gradient.",
          "Nếu cửa sổ không phủ hết biên, floor trong công thức output có thể bỏ phần tử cuối; ceil mode thay quy tắc và phải được ghi rõ. Padding bằng 0 có thể làm max sai ở dữ liệu toàn âm nếu implementation coi 0 như dữ liệu, nên framework thường dùng quy ước âm vô hạn hoặc biên đặc thù cho max. Luôn kiểm tra chính xác tài liệu thay vì suy từ tên layer.",
        ],
        formulas: ["H_out=floor((H+2p-dilation(k-1)-1)/stride+1)", "[B,C,H,W] -> [B,C,H_out,W_out]"],
      },
      {
        title: "Giá trị và gradient qua pooling",
        paragraphs: [
          "Max pooling giữ response mạnh nhất và truyền gradient upstream tới vị trí argmax. Nếu nhiều giá trị bằng cực đại, cách chọn hoặc chia gradient phụ thuộc implementation, nên finite-difference ngay tại tie không ổn định. Average pooling chia gradient đều cho các phần tử hợp lệ trong cửa sổ. Khi các cửa sổ chồng nhau, một input có thể nhận tổng gradient từ nhiều output.",
          "Global average pooling rút toàn bộ trục không gian thành một giá trị trên mỗi channel, biến [B,C,H,W] thành [B,C] hoặc [B,C,1,1]. Với chuỗi [B,L,d], masked mean phải chia theo số token thật; tính cả PAD làm câu ngắn bị kéo về padding value. Sum pooling giữ thông tin quy mô tập, còn mean pooling bớt nhạy với số phần tử; hai phép không hoán đổi nếu cardinality mang tín hiệu.",
        ],
        formulas: ["max-pool backward: grad x_argmax += grad y", "masked_mean=sum_t m_t h_t/(sum_t m_t)", "global average: y_bc=(1/HW)sum_{h,w}x_bchw"],
      },
      {
        title: "Bất biến, aliasing và giới hạn biểu diễn",
        paragraphs: [
          "Pooling tạo độ bền cục bộ với dịch chuyển nhỏ khi cực đại hoặc trung bình trong cửa sổ không đổi, nhưng không bảo đảm bất biến tịnh tiến toàn cục. Stride lớn downsample mà không lọc tần số đủ có thể gây aliasing; thay đổi một pixel gần biên cửa sổ có thể làm output nhảy. Anti-aliased pooling hoặc low-pass trước downsample giảm hiện tượng nhưng thêm chi phí và thiên kiến.",
          "Global pooling xóa vị trí, phù hợp classification nhưng có thể hại localization, segmentation hoặc sequence labeling. Attention pooling học trọng số dữ liệu phụ thuộc nhưng thêm tham số và không mặc nhiên dễ giải thích hơn. Strided convolution có thể học phép downsample, còn adaptive pooling chọn kernel/stride để đạt output size định trước. Chọn cơ chế theo thông tin cần giữ, không chỉ để giảm tensor nhanh nhất.",
        ],
        formulas: ["permutation-invariant set pooling: pool(PX)=pool(X) cho sum/mean/max phù hợp", "downsample stride s giảm mỗi trục không gian xấp xỉ s lần"],
      },
    ],
    workedExamples: [
      {
        title: "Forward và backward pooling một chiều",
        problem: "Cho x=[1,3,2,4], kernel=2, stride=2, không padding. Tính max pool, average pool và gradient về x khi upstream gradient là [10,20].",
        steps: [
          { state: "L_out=floor((4-2)/2+1)=2", explanation: "Hai cửa sổ không chồng là [1,3] và [2,4]." },
          { state: "max_pool(x)=[3,4]", explanation: "Mỗi output chọn phần tử lớn nhất của cửa sổ tương ứng." },
          { state: "avg_pool(x)=[(1+3)/2,(2+4)/2]=[2,3]", explanation: "Mỗi cửa sổ có đúng hai phần tử hợp lệ." },
          { state: "grad_x_max=[0,10,0,20]", explanation: "Các cực đại là x1=3 và x3=4, nên nhận toàn bộ upstream gradient của cửa sổ." },
          { state: "grad_x_avg=[5,5,10,10]", explanation: "Average chia 10 và 20 đều cho hai phần tử trong mỗi cửa sổ." },
        ],
        conclusion: "Max và average có cùng output shape nhưng giữ tín hiệu và phân phối gradient rất khác nhau.",
        sanityChecks: [
          "Tổng grad_x của mỗi cửa sổ bằng upstream gradient tương ứng cho cả max lẫn average.",
          "Không có tie ở hai cửa sổ, nên vị trí gradient max là duy nhất.",
          "Đổi stride thành 1 phải tạo ba cửa sổ và làm các input giữa nhận gradient chồng lấp.",
        ],
      },
    ],
    implementationChecklist: [
      "Tính output shape bằng tay cho ít nhất một tensor biên trước khi ghép layer.",
      "Ghi kernel, stride, padding, dilation, ceil mode và quy tắc average với padding.",
      "Dùng attention/padding mask cho pooling chuỗi và xử lý tổng mask bằng 0.",
      "Kiểm tra ties, cửa sổ chồng và gradient bằng tensor nhỏ có kết quả biết trước.",
      "Đánh giá mất chi tiết hoặc aliasing ở nhiệm vụ localization và tín hiệu tần số cao.",
      "Không giả định global pooling phù hợp nếu output cần giữ vị trí.",
    ],
    masteryChecklist: [
      "Suy ra output shape từ input, kernel, stride, padding và dilation.",
      "Tính tay forward/backward của max và average pooling.",
      "Giải thích sum, mean và max giữ thông tin cardinality khác nhau.",
      "Nêu vì sao pooling chỉ tạo độ bền cục bộ chứ không bảo đảm bất biến toàn cục.",
      "So sánh pooling, strided convolution và adaptive pooling theo thông tin bị mất.",
    ],
    glossary: [
      { term: "Pooling window", definition: "Vùng input được rút thành một giá trị output tại một vị trí." },
      { term: "Stride", definition: "Khoảng dịch cửa sổ giữa hai vị trí output liên tiếp." },
      { term: "Argmax", definition: "Vị trí đạt giá trị cực đại và thường nhận gradient trong max pooling." },
      { term: "Global pooling", definition: "Pooling trên toàn bộ một hay nhiều trục để loại các trục đó." },
      { term: "Aliasing", definition: "Méo tín hiệu do downsample không loại đủ thành phần tần số cao." },
      { term: "Adaptive pooling", definition: "Pooling chọn tham số cửa sổ để tạo output size được chỉ định." },
    ],
    sourceIds: ["d2l-vi", "d2l-en", "mml", "ioai-2026"],
  },

  "dl-attention": {
    lessonId: "dl-attention",
    readingMinutes: 42,
    openingQuestions: [
      "Query, key và value đóng vai trò gì khi một vị trí chọn thông tin từ nhiều vị trí nguồn?",
      "Scale 1/sqrt(d_k), softmax và mask cùng biến score thành weighted sum ổn định như thế nào?",
      "Attention weight cao có phải là bằng chứng đầy đủ rằng một token gây ra dự đoán hay không?",
    ],
    sections: [
      {
        title: "Query-key-value và hợp đồng shape",
        paragraphs: [
          "Attention nhận query mô tả điều cần tìm, key mô tả cách mỗi mục nguồn được so khớp và value chứa nội dung sẽ được tổng hợp. Với Q shape [B,h,L_q,d_k], K [B,h,L_k,d_k] và V [B,h,L_k,d_v], tích QK^T tạo score [B,h,L_q,L_k]. Softmax chạy trên trục key L_k, rồi nhân V để trả output [B,h,L_q,d_v]. Query length và key/value length có thể khác trong cross-attention.",
          "Trong self-attention, Q, K, V được chiếu từ cùng một dãy; trong cross-attention, query đến từ dãy đích còn key/value đến từ nguồn khác. Key và value phải có cùng L_k vì mỗi trọng số chọn một value tương ứng. d_k và d_v không bắt buộc bằng nhau về toán học, nhưng implementation multi-head thường chọn các chiều thuận tiện để ghép heads và chiếu về d_model.",
        ],
        formulas: ["S=QK^T/sqrt(d_k), shape [B,h,L_q,L_k]", "A=softmax(S+M, axis=-1)", "O=AV, shape [B,h,L_q,d_v]"],
      },
      {
        title: "Scale, softmax, mask và nhiều head",
        paragraphs: [
          "Nếu các thành phần q,k độc lập, mean 0 và variance xấp xỉ 1, dot product có variance tỷ lệ d_k. Chia sqrt(d_k) giữ score ở thang vừa phải, tránh softmax quá bão hòa khi d_k lớn. Softmax ổn định trừ max theo từng hàng trước exp. Mỗi hàng A không âm và tổng bằng 1 nếu có ít nhất một key hợp lệ, vì vậy output là tổ hợp lồi của các value trên từng head.",
          "Padding mask loại key đệm; causal mask cấm nhìn tương lai; các mask phải cộng vào score trước softmax. Một query bị mask toàn bộ có thể tạo hàng softmax không xác định hoặc NaN, nên pipeline phải ngăn hoặc xử lý trường hợp đó. Multi-head attention học nhiều phép chiếu Q,K,V, cho các head truy xuất quan hệ khác nhau, nhưng không bảo đảm các head tự động chuyên biệt hoặc không dư thừa.",
        ],
        formulas: ["Var(q^T k)≈d_k dưới giả định thành phần variance 1", "softmax(s)_j=exp(s_j-max(s))/sum_r exp(s_r-max(s))", "sum_j A_ij=1 nếu hàng i có key hợp lệ"],
      },
      {
        title: "Chi phí, biến thể và giới hạn diễn giải",
        paragraphs: [
          "Full dot-product attention lưu ma trận score/weight tỷ lệ O(BhL_qL_k) và tính QK^T tỷ lệ O(BhL_qL_kd_k). Với self-attention L_q=L_k=L, chi phí theo chiều dài là bậc hai. Local, sparse, low-rank hoặc kernelized attention giảm chi phí bằng cách hạn chế hoặc xấp xỉ tương tác; chúng thay đổi receptive field và sai số, không mặc nhiên tương đương full attention trên mọi dữ liệu.",
          "Attention weights hữu ích để debug mask, alignment và pattern truy xuất, nhưng weight cao không tự chứng minh quan hệ nhân quả hay đóng góp duy nhất cho output. Value vectors, residual paths, nhiều tầng và các phép chiếu sau attention đều ảnh hưởng dự đoán. Muốn giải thích cần kết hợp perturbation, ablation hoặc gradient-based evidence và kiểm tra tính ổn định. Trong serving tự hồi quy, KV cache tái sử dụng key/value prefix nhưng tăng bộ nhớ tuyến tính theo context và số tầng.",
        ],
        formulas: ["M_scores=O(BhL_qL_k)", "T_QK=O(BhL_qL_kd_k)", "self-attention: L_q=L_k=L nên score có L^2 phần tử mỗi head"],
      },
    ],
    workedExamples: [
      {
        title: "Scaled dot-product attention một query, hai key",
        problem: "Cho d_k=2, q=[1,0], K=[[1,0],[0,1]] và V=[[2,0],[0,4]]. Không mask ở lượt đầu. Tính score, attention weights, output; sau đó mask key thứ hai.",
        steps: [
          { state: "qK^T=[1,0]", explanation: "Query trùng hướng key đầu và trực giao key thứ hai; score thô có shape [1,2]." },
          { state: "s=[1/sqrt(2),0]≈[0.7071,0]", explanation: "Chia scale sqrt(d_k) trước softmax để kiểm soát độ lớn logit." },
          { state: "A=softmax(s)≈[0.6698,0.3302]", explanation: "Hai trọng số dương và tổng bằng 1, dù key thứ hai có dot product bằng 0." },
          { state: "o=0.6698[2,0]+0.3302[0,4]≈[1.3396,1.3208]", explanation: "Weighted sum giữ shape d_v=2 và nằm trong đoạn nối hai value." },
          { state: "Mask key 2: s'=[0.7071,-infinity], A'=[1,0], o'=[2,0]", explanation: "Mask được áp trước softmax nên value thứ hai không đóng góp." },
        ],
        conclusion: "Attention biến mức tương thích query-key thành phân phối trên value hợp lệ; scale và mask thay đổi trực tiếp phân phối đó.",
        sanityChecks: [
          "A và A' đều không âm, tổng mỗi hàng bằng 1.",
          "Output không mask có từng tọa độ đúng bằng weighted sum của cùng trọng số và V.",
          "Đổi V nhưng giữ Q,K phải giữ attention weights và chỉ đổi output weighted sum.",
          "Mask cả hai key phải được bắt như trường hợp lỗi/empty, không chấp nhận NaN âm thầm.",
        ],
      },
    ],
    implementationChecklist: [
      "Chú thích B,h,L_q,L_k,d_k,d_v và assert key/value có cùng chiều dài nguồn.",
      "Chia sqrt(d_k), dùng softmax ổn định và theo dõi NaN/Inf trong score lẫn weights.",
      "Kết hợp padding/causal mask trước softmax rồi test một query chỉ có một key hợp lệ.",
      "Xử lý rõ hàng bị mask toàn bộ và broadcast mask trên batch/head đúng ý định.",
      "Đo memory score/weights ở chiều dài thật, không chỉ parameter count.",
      "Không trình bày attention weights như giải thích nhân quả nếu chưa có kiểm chứng bổ sung.",
    ],
    masteryChecklist: [
      "Suy ra shape score, weights và output từ Q,K,V bất kỳ.",
      "Tính tay scaled score, softmax và weighted sum cho ví dụ nhỏ.",
      "Phân biệt self-attention, cross-attention, padding mask và causal mask.",
      "Giải thích vì sao chia sqrt(d_k) và khi nào một hàng softmax không hợp lệ.",
      "Phân tích chi phí theo L_q,L_k và giới hạn diễn giải của attention weights.",
    ],
    glossary: [
      { term: "Query", definition: "Vector biểu diễn nhu cầu truy xuất tại một vị trí đích." },
      { term: "Key", definition: "Vector dùng so khớp mỗi vị trí nguồn với query." },
      { term: "Value", definition: "Nội dung được tổng hợp theo attention weight sau khi key được so khớp." },
      { term: "Attention score", definition: "Logit tương thích query-key trước softmax và mask." },
      { term: "Cross-attention", definition: "Attention có query và key/value đến từ hai nguồn biểu diễn khác nhau." },
      { term: "Causal mask", definition: "Mặt nạ ngăn một query dùng key thuộc tương lai." },
      { term: "KV cache", definition: "Key/value prefix được lưu để tránh tính lại trong decode tự hồi quy." },
    ],
    sourceIds: ["d2l-vi", "d2l-en", "mml", "pml-intro", "ioai-2026"],
  },
} satisfies LessonTheoryMap;
