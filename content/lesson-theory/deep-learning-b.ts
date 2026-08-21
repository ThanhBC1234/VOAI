import type { LessonTheoryMap } from "./types";

export const deepLearningTheoryB = {
  "dl-transformer": {
    lessonId: "dl-transformer",
    readingMinutes: 43,
    openingQuestions: [
      "Transformer biến một dãy token thành các biểu diễn có ngữ cảnh mà không dùng recurrence như thế nào?",
      "Mask, vị trí và residual connection quyết định luồng thông tin qua từng khối ra sao?",
      "Chi phí attention tăng theo chiều dài dãy ở mức nào và giới hạn đó dẫn tới lựa chọn gì?",
    ],
    sections: [
      {
        title: "Một khối Transformer và hợp đồng shape",
        paragraphs: [
          "Với batch B, độ dài L và kích thước mô hình d_model, đầu vào một khối có shape [B,L,d_model]. Multi-head attention chiếu đầu vào thành Q, K, V; mỗi head có d_k=d_model/h khi các head chia đều chiều. Attention tạo tổ hợp có trọng số của các hàng V, ghép h head rồi chiếu về d_model để cộng residual. Feed-forward network sau đó áp dụng cùng một MLP độc lập tại từng vị trí, thường mở rộng lên d_ff rồi thu về d_model. Vì residual yêu cầu hai nhánh cùng shape, mọi phép chiếu ở biên khối phải được kiểm tra rõ ràng.",
          "Layer normalization ổn định thang đặc trưng theo từng token. Pre-norm đặt normalization trước attention hoặc MLP; post-norm đặt sau phép cộng residual. Hai biến thể không tương đương về gradient và độ ổn định huấn luyện, nên checkpoint và code phải thống nhất. Residual tạo đường truyền đồng nhất thuận lợi nhưng không bảo đảm gradient luôn khác 0; saturation, mask sai hoặc số học không ổn định vẫn có thể phá luồng gradient.",
        ],
        formulas: [
          "Q=XW_Q, K=XW_K, V=XW_V",
          "Attention(Q,K,V)=softmax(QK^T/sqrt(d_k)+M)V",
          "[B,L,d_model] -> h x [B,L,d_k] -> [B,L,d_model]",
        ],
      },
      {
        title: "Mask và thông tin vị trí",
        paragraphs: [
          "Padding mask chặn token đệm, còn causal mask chặn vị trí t nhìn các vị trí lớn hơn t. Encoder hai chiều thường chỉ cần padding mask; decoder tự hồi quy cần cả causal mask và padding mask. Mask được cộng vào score trước softmax bằng 0 cho ô hợp lệ và một số âm rất lớn cho ô bị cấm. Dùng mask sau softmax hoặc mask có chiều broadcast sai có thể để lộ tương lai dù tensor vẫn chạy.",
          "Nếu không mã hóa vị trí, self-attention không tự phân biệt trật tự: hoán vị token sẽ hoán vị đầu ra tương ứng. Positional encoding tuyệt đối, embedding vị trí học được và các phương pháp tương đối đưa thứ tự vào theo những giả định khác nhau. Khi suy luận dài hơn context huấn luyện, không nên mặc định mọi cách mã hóa vị trí ngoại suy tốt; cần kiểm thử đúng độ dài và chế độ cache thực tế.",
        ],
        formulas: ["M_ij=0 nếu j được phép, M_ij=-infinity nếu j bị chặn", "causal: j<=i"],
      },
      {
        title: "Chi phí, cache và giới hạn",
        paragraphs: [
          "Score matrix của full attention có shape [B,h,L,L], nên thời gian phần QK^T tỷ lệ O(BhL^2d_k) và bộ nhớ attention tỷ lệ O(BhL^2). MLP lại tốn xấp xỉ O(BLd_modeld_ff). Với L lớn, ma trận L nhân L thường là nút thắt; giảm batch không thay đổi bản chất bậc hai theo L. Sparse, local hoặc linear attention thay đổi phép xấp xỉ và phạm vi tương tác, không phải bản thay thế luôn tương đương full attention.",
          "Trong sinh tự hồi quy, KV cache lưu key và value của prefix để không tính lại toàn bộ các tầng ở mỗi token. Cache làm bộ nhớ tăng tuyến tính theo số tầng, chiều dài và số KV head, nhưng giảm tính toán lặp. Cần phân biệt độ phức tạp của một lượt train song song với từng bước decode nối tiếp, đồng thời theo dõi mask, dtype và vị trí khi nối cache.",
        ],
        formulas: ["M_attention=O(BhL^2)", "T_QK=O(BL^2d_model)", "KV-cache shape mỗi tầng xấp xỉ [B,h_kv,L,d_k] cho K và V"],
      },
    ],
    workedExamples: [
      {
        title: "Tính tay một head attention hai token",
        problem: "Cho một head với d_k=1, score chưa chia scale là S=[[1,0],[0,1]] và V=[[2,0],[0,4]]. Không có padding mask. Tính attention hai chiều và so với causal mask.",
        steps: [
          { state: "softmax([1,0])≈[0.7311,0.2689]", explanation: "Vì sqrt(d_k)=1, hàng score thứ nhất giữ nguyên trước softmax." },
          { state: "o_1≈0.7311[2,0]+0.2689[0,4]=[1.4622,1.0756]", explanation: "Token thứ nhất trộn value của cả hai token trong attention hai chiều." },
          { state: "o_2≈0.2689[2,0]+0.7311[0,4]=[0.5378,2.9244]", explanation: "Hàng score thứ hai đảo hai trọng số nhưng mỗi hàng vẫn tổng bằng 1." },
          { state: "Causal row 1=[1,0], nên o_1^causal=[2,0]", explanation: "Ô nhìn token tương lai bị cộng âm vô hạn trước softmax; hàng thứ hai vẫn được nhìn cả hai vị trí." },
        ],
        conclusion: "Mask thay đổi phân phối xác suất trước khi trộn V; nó là ràng buộc luồng thông tin chứ không chỉ là thao tác định dạng.",
        sanityChecks: [
          "Mỗi hàng trọng số attention không âm và tổng xấp xỉ 1.",
          "Mỗi output nằm trong bao lồi của các value được phép nhìn.",
          "Trong causal attention, thay token thứ hai không được làm output vị trí đầu thay đổi.",
        ],
      },
    ],
    implementationChecklist: [
      "Assert d_model chia hết cho số head và ghi shape tại mọi phép reshape/transpose.",
      "Kết hợp padding mask với causal mask trước softmax rồi test bằng ví dụ cực nhỏ.",
      "Dùng softmax ổn định, dtype phù hợp và kiểm tra NaN ở score lẫn output.",
      "Đo riêng bộ nhớ attention, activation và KV cache ở context mục tiêu.",
      "Xác nhận quy ước pre-norm/post-norm và positional encoding khớp checkpoint.",
    ],
    masteryChecklist: [
      "Suy ra được shape Q, K, V, score và output cho B, L, h, d_model bất kỳ.",
      "Giải thích khác nhau giữa padding mask, causal mask và cross-attention mask.",
      "Tính tay softmax và weighted sum của một head nhỏ.",
      "Phân tích được phần nào bậc hai theo L và KV cache đổi chi phí decode ra sao.",
      "Nêu đúng vai trò cùng giới hạn của residual và positional encoding.",
    ],
    glossary: [
      { term: "Self-attention", definition: "Attention có query, key và value được tạo từ cùng một dãy biểu diễn." },
      { term: "Attention head", definition: "Một không gian chiếu Q, K, V độc lập trong multi-head attention." },
      { term: "Causal mask", definition: "Mặt nạ ngăn một vị trí dùng thông tin từ token tương lai." },
      { term: "Residual connection", definition: "Phép cộng đầu vào của một khối với biến đổi có cùng shape của khối đó." },
      { term: "Positional encoding", definition: "Tín hiệu đưa thông tin thứ tự hoặc khoảng cách token vào mô hình." },
      { term: "KV cache", definition: "Key và value của prefix được lưu để tái sử dụng khi decode tự hồi quy." },
    ],
    sourceIds: ["d2l-vi", "d2l-en", "mml", "ioai-2026"],
  },

  "dl-autoencoder": {
    lessonId: "dl-autoencoder",
    readingMinutes: 36,
    openingQuestions: [
      "Một mô hình có thể học biểu diễn hữu ích chỉ bằng mục tiêu tái tạo đầu vào không?",
      "Bottleneck, nhiễu và regularization ngăn autoencoder học phép chép nguyên trạng như thế nào?",
      "Reconstruction error cao có đủ để kết luận một mẫu là bất thường không?",
    ],
    sections: [
      {
        title: "Encoder, latent code và decoder",
        paragraphs: [
          "Autoencoder gồm encoder z=f_theta(x) và decoder x_hat=g_phi(z). Với batch X shape [B,d_x], latent thường có shape [B,d_z], rồi decoder trả reconstruction cùng shape và miền giá trị với X. Nếu d_z nhỏ hơn d_x, bottleneck buộc mô hình nén; nhưng một mạng phi tuyến có năng lực lớn vẫn có thể ghi nhớ tập train. Vì vậy kích thước latent chỉ là một phần của thiết kế, không tự bảo đảm biểu diễn có ý nghĩa.",
          "Loss tái tạo phải khớp mô hình quan sát. MSE phù hợp với giả định nhiễu Gaussian và đầu ra liên tục đã scale; BCE chỉ hợp lý khi mỗi chiều được diễn giải như Bernoulli hoặc giá trị trong [0,1] với output tương ứng. Việc áp BCE tùy tiện cho pixel hay feature ngoài miền có thể tạo gradient và diễn giải xác suất sai.",
        ],
        formulas: ["z=f_theta(x)", "x_hat=g_phi(z)", "L_MSE=(1/Bd_x) sum ||x-x_hat||_2^2"],
      },
      {
        title: "Các ràng buộc giúp học cấu trúc",
        paragraphs: [
          "Undercomplete autoencoder giảm chiều latent; sparse autoencoder phạt nhiều activation khác 0; denoising autoencoder nhận đầu vào bị làm nhiễu nhưng phải tái tạo mẫu sạch; contractive autoencoder phạt độ nhạy của encoder. Các cách này áp đặt những thiên kiến khác nhau về biểu diễn. Denoising không có nghĩa là thêm nhiễu vào cả nhãn đích, và corruption chỉ được dùng ở nhánh đầu vào trong train.",
          "Variational autoencoder là mô hình xác suất khác autoencoder xác định: encoder tham số hóa phân phối q(z|x), loss gồm reconstruction term và KL tới prior, rồi dùng reparameterization để truyền gradient qua sampling. Không nên gọi latent của autoencoder thường là phân phối Gaussian nếu mô hình không định nghĩa và tối ưu các đại lượng đó.",
        ],
        formulas: ["x_tilde~q(x_tilde|x), minimize ||x-g(f(x_tilde))||^2", "L_VAE=-E_q log p(x|z)+KL(q(z|x)||p(z))"],
      },
      {
        title: "Đánh giá, anomaly score và giới hạn",
        paragraphs: [
          "Reconstruction loss thấp trên train chỉ cho thấy mô hình khớp dữ liệu đã thấy. Cần validation độc lập, trực quan hóa residual, đánh giá downstream bằng linear probe hoặc clustering, và so với PCA hay identity-like baseline. Latent dimension, decoder capacity và normalization có thể làm thứ hạng mô hình thay đổi dù loss gần nhau.",
          "Dùng reconstruction error làm anomaly score cần ngưỡng chọn trên dữ liệu validation đại diện và metric theo chi phí lỗi. Autoencoder mạnh đôi khi tái tạo tốt cả mẫu bất thường; ngược lại, mẫu bình thường thuộc nhóm thiểu số có thể có lỗi cao. Vì vậy score không phải xác suất bất thường nếu chưa calibration, và split phải tránh cùng thực thể xuất hiện ở train lẫn test.",
        ],
        formulas: ["s(x)=mean_j (x_j-x_hat_j)^2", "anomaly nếu s(x)>tau, với tau chọn trên validation"],
      },
    ],
    workedExamples: [
      {
        title: "Autoencoder tuyến tính một chiều như phép chiếu",
        problem: "Cho x=[3,1] và vector đơn vị u=[1/sqrt(2),1/sqrt(2)]. Encoder z=u^T x, decoder x_hat=zu. Tính latent, reconstruction và MSE trên hai chiều.",
        steps: [
          { state: "z=(3+1)/sqrt(2)=2sqrt(2)", explanation: "Encoder gom x lên tọa độ duy nhất dọc theo hướng u." },
          { state: "x_hat=2sqrt(2)[1/sqrt(2),1/sqrt(2)]=[2,2]", explanation: "Decoder đưa tọa độ latent quay lại không gian hai chiều trên đường y=x." },
          { state: "r=x-x_hat=[1,-1]", explanation: "Residual trực giao với u vì r^T u=0." },
          { state: "MSE=(1^2+(-1)^2)/2=1", explanation: "Mean được tính trên hai feature; tổng squared error tương ứng bằng 2." },
        ],
        conclusion: "Autoencoder tuyến tính bị ràng buộc một chiều giữ phần chiếu và mất phần trực giao; mạng phi tuyến mở rộng ý tưởng sang manifold phức tạp hơn.",
        sanityChecks: [
          "z là scalar và x_hat có cùng shape (2,) với x.",
          "u có norm bằng 1 và residual vuông góc u.",
          "Nếu x nằm trên đường y=x thì reconstruction error phải bằng 0.",
        ],
      },
    ],
    implementationChecklist: [
      "Chuẩn hóa miền đầu vào và chọn output activation cùng reconstruction loss tương thích.",
      "Ghi rõ shape x, z, x_hat và kiểm tra decoder trả đúng miền giá trị.",
      "So sánh với PCA, mean predictor hoặc baseline đơn giản trên cùng split.",
      "Chọn threshold anomaly chỉ trên validation và báo precision-recall theo nhóm.",
      "Lưu cả encoder, decoder, scaler và cấu hình corruption để tái lập suy luận.",
    ],
    masteryChecklist: [
      "Phân biệt undercomplete, sparse, denoising và variational autoencoder.",
      "Tính tay latent và reconstruction của autoencoder tuyến tính nhỏ.",
      "Giải thích vì sao bottleneck nhỏ chưa đủ ngăn memorization.",
      "Chọn loss tái tạo phù hợp với loại dữ liệu và miền output.",
      "Nêu giới hạn của reconstruction error khi phát hiện bất thường.",
    ],
    glossary: [
      { term: "Encoder", definition: "Hàm ánh xạ đầu vào sang biểu diễn latent." },
      { term: "Decoder", definition: "Hàm ánh xạ latent về một reconstruction trong không gian đầu vào." },
      { term: "Bottleneck", definition: "Ràng buộc năng lực hoặc kích thước buộc mô hình nén thông tin." },
      { term: "Latent code", definition: "Biểu diễn trung gian z do encoder tạo ra." },
      { term: "Reconstruction loss", definition: "Độ sai khác giữa đầu vào đích và output tái tạo." },
      { term: "Denoising", definition: "Học tái tạo mẫu sạch từ phiên bản đầu vào bị làm nhiễu." },
    ],
    sourceIds: ["d2l-vi", "d2l-en", "pml-intro", "mml"],
  },

  "dl-sgd-minibatch": {
    lessonId: "dl-sgd-minibatch",
    readingMinutes: 35,
    openingQuestions: [
      "Gradient của một mini-batch liên hệ với gradient của toàn bộ tập train như thế nào?",
      "Vì sao batch lớn hơn làm gradient ít nhiễu nhưng không mặc nhiên cho mô hình tốt hơn?",
      "Epoch, step và gradient accumulation phải được phân biệt ra sao khi cấu hình lịch học?",
    ],
    sections: [
      {
        title: "Empirical risk và ước lượng gradient",
        paragraphs: [
          "Với n mẫu, empirical risk là trung bình loss từng mẫu. Full-batch gradient dùng cả n mẫu cho một update; stochastic gradient dùng một mẫu; mini-batch SGD dùng tập chỉ số B_t kích thước b. Nếu mẫu được chọn đều theo đúng thiết kế, trung bình gradient mini-batch là ước lượng không chệch của full gradient. Tuy nhiên sampler có trọng số, dữ liệu phụ thuộc theo thời gian hoặc batch được sắp theo nhãn có thể thay đổi kỳ vọng và phương sai.",
          "Gradient tensor luôn có cùng shape với tham số tương ứng. Loss reduction là mean hay sum ảnh hưởng trực tiếp scale gradient: dùng sum rồi tăng batch sẽ tăng độ lớn update nếu learning rate giữ nguyên. Vì thế log phải ghi reduction, effective batch size và quy tắc scale learning rate, không chỉ tên optimizer.",
        ],
        formulas: ["R(theta)=(1/n) sum_i ell_i(theta)", "g_B=(1/b) sum_{i in B} grad ell_i(theta)", "theta_{t+1}=theta_t-eta_t g_B"],
      },
      {
        title: "Batch size, phương sai và hệ thống",
        paragraphs: [
          "Batch nhỏ tạo gradient nhiễu hơn, có thể giúp thoát vùng phẳng hoặc đóng vai trò regularization ngầm, nhưng loss curve theo step dao động. Batch lớn khai thác vectorization và cho ước lượng ổn định hơn cho tới khi phần cứng bão hòa; nó cần nhiều bộ nhớ activation và thường có ít update hơn trong cùng một epoch. Không có batch size tối ưu phổ quát vì kết quả phụ thuộc dữ liệu, normalization, learning rate và ngân sách tính toán.",
          "Một epoch nghĩa là sampler đã đi qua xấp xỉ toàn bộ tập train, còn một step là một lần optimizer cập nhật. Với drop_last hoặc sampling có thay thế, số mẫu thực sự thấy trong epoch có thể khác n. So sánh thí nghiệm nên theo cả số token/mẫu đã xử lý, số update và thời gian, tránh chỉ so cùng số epoch.",
        ],
        formulas: ["steps_per_epoch=ceil(n/b) nếu không drop_last", "Var(g_B) thường giảm khi b tăng dưới lấy mẫu gần độc lập"],
      },
      {
        title: "Shuffle, accumulation và reproducibility",
        paragraphs: [
          "Shuffle mỗi epoch giúp phá tương quan do thứ tự file hoặc nhãn, nhưng split theo thời gian không đồng nghĩa có thể trộn tương lai vào train. Sampler phân tán phải bảo đảm các worker không lặp ngoài ý muốn và cần set_epoch hoặc cơ chế tương đương để đổi hoán vị giữa epoch. Seed, worker seed và trạng thái sampler đều ảnh hưởng khả năng chạy lại.",
          "Gradient accumulation chia effective batch thành nhiều micro-batch. Chia mỗi loss cho K chỉ tái tạo mean của batch lớn khi K micro-batch có cùng số mẫu hoặc cùng tổng trọng số. Nếu batch cuối hay số token khác nhau, phải cộng loss/gradient theo tổng số mẫu hoặc token thực rồi chia tổng trọng số; trung bình đều các mean micro-batch sẽ làm batch nhỏ có trọng số quá lớn. Batch normalization vẫn thống kê theo từng micro-batch, nên accumulation không hoàn toàn tương đương batch vật lý lớn. Scheduler theo step phải cập nhật ở optimizer step chứ không phải mỗi backward.",
        ],
        formulas: ["b_effective=b_micro x accumulation_steps x world_size", "g_effective=(sum_k n_k g_k)/(sum_k n_k); bằng (1/K)sum_k g_k chỉ khi mọi n_k bằng nhau"],
      },
    ],
    workedExamples: [
      {
        title: "Một bước mini-batch khác full gradient",
        problem: "Tại cùng theta=[1,1], bốn gradient từng mẫu là g1=[2,0], g2=[0,4], g3=[-2,2], g4=[0,-2]. Chọn mini-batch {1,2}, reduction mean và eta=0.1.",
        steps: [
          { state: "g_B=(g1+g2)/2=[1,2]", explanation: "Trung bình theo hai mẫu vì loss reduction là mean." },
          { state: "theta_new=[1,1]-0.1[1,2]=[0.9,0.8]", explanation: "Mỗi thành phần tham số đi ngược gradient mini-batch tương ứng." },
          { state: "g_full=(g1+g2+g3+g4)/4=[0,1]", explanation: "Mini-batch cụ thể không cần bằng full gradient; tính không chệch nói về kỳ vọng qua cách lấy mẫu." },
          { state: "Full-batch update sẽ cho [1,0.9]", explanation: "Hai update khác nhau nhưng đều hợp lệ theo estimator đã chọn." },
        ],
        conclusion: "Nhiễu SGD đến từ việc thay full gradient bằng estimator mini-batch; reduction và sampling xác định scale lẫn kỳ vọng của estimator.",
        sanityChecks: [
          "g_B và theta có cùng shape (2,).",
          "Nếu batch chứa cả bốn mẫu thì g_B phải đúng bằng [0,1].",
          "Với eta=0, tham số phải không đổi dù chọn batch nào.",
          "Hai micro-batch kích thước 2 và 1 phải ghép thành (2g_A+g_B)/3, không phải (g_A+g_B)/2.",
        ],
      },
    ],
    implementationChecklist: [
      "Ghi rõ batch size vật lý, effective batch, loss reduction và world size.",
      "Shuffle hoặc chọn sampler theo đúng cấu trúc dữ liệu, nhóm và thời gian.",
      "Chỉ gọi optimizer.step và scheduler.step sau accumulation; cân loss theo số mẫu/token thực của từng micro-batch.",
      "Xóa gradient đúng thời điểm và kiểm tra batch cuối nhỏ hơn hoặc drop_last.",
      "Theo dõi loss theo update, số mẫu/token đã thấy và thời gian thực.",
    ],
    masteryChecklist: [
      "Viết được empirical risk, full gradient và mini-batch estimator.",
      "Tính tay một update với mean reduction và giải thích dấu cập nhật.",
      "Phân biệt epoch, micro-batch, optimizer step và effective batch.",
      "Giải thích khi nào accumulation không tương đương batch vật lý lớn.",
      "Nêu điều kiện trực giác để gradient mini-batch không chệch.",
    ],
    glossary: [
      { term: "Empirical risk", definition: "Trung bình loss trên tập dữ liệu hữu hạn quan sát được." },
      { term: "Mini-batch", definition: "Tập con mẫu dùng để ước lượng gradient cho một lượt tính." },
      { term: "Optimizer step", definition: "Một lần áp dụng gradient để cập nhật tham số." },
      { term: "Epoch", definition: "Một lượt sampler đi qua xấp xỉ toàn bộ tập train." },
      { term: "Gradient accumulation", definition: "Cộng gradient từ nhiều micro-batch trước một optimizer step." },
      { term: "Unbiased estimator", definition: "Estimator có kỳ vọng bằng đại lượng mục tiêu dưới cơ chế lấy mẫu đã định." },
    ],
    sourceIds: ["d2l-vi", "d2l-en", "pml-intro", "ioai-2026"],
  },

  "dl-adam-adamw": {
    lessonId: "dl-adam-adamw",
    readingMinutes: 38,
    openingQuestions: [
      "Adam kết hợp momentum và chuẩn hóa theo bình phương gradient theo từng tham số như thế nào?",
      "Bias correction sửa sai lệch nào ở những bước đầu của quá trình tối ưu?",
      "AdamW khác việc cộng L2 penalty vào loss khi optimizer có adaptive preconditioning ở điểm nào?",
    ],
    sections: [
      {
        title: "Moment bậc một, moment bậc hai và cập nhật thích nghi",
        paragraphs: [
          "Adam duy trì exponential moving average m_t của gradient và v_t của bình phương gradient theo từng phần tử tham số. m_t làm mượt hướng giống momentum, còn căn v_t chuẩn hóa bước theo thang gradient gần đây. Với tensor tham số shape S, g, m và v đều có shape S; phép chia là elementwise chứ không phải chia bằng một norm chung. Tham số có gradient thường xuyên lớn vì scale có thể nhận bước hiệu dụng nhỏ hơn tham số có gradient nhỏ.",
          "Epsilon nằm trong mẫu số để tránh chia 0 và ảnh hưởng ổn định số; vị trí epsilon trong hay ngoài căn phải khớp định nghĩa implementation. Adam giảm nhu cầu chọn learning rate riêng cho từng chiều nhưng không làm learning rate gốc mất vai trò. Gradient bất thường, loss scaling sai hoặc beta không phù hợp vẫn có thể gây update quá lớn hoặc học chậm.",
        ],
        formulas: ["m_t=beta_1 m_{t-1}+(1-beta_1)g_t", "v_t=beta_2 v_{t-1}+(1-beta_2)g_t^2", "theta_t=theta_{t-1}-eta m_hat_t/(sqrt(v_hat_t)+epsilon)"],
      },
      {
        title: "Bias correction và trạng thái optimizer",
        paragraphs: [
          "Vì m_0=v_0=0, các moving average ban đầu bị kéo về 0, đặc biệt khi beta gần 1. Adam chia cho 1-beta_1^t và 1-beta_2^t để tạo m_hat, v_hat đã hiệu chỉnh. Ở bước đầu, nếu bỏ epsilon và gradient khác 0, tỷ số m_hat/sqrt(v_hat) gần dấu của gradient; nếu quên correction, tỷ số có scale sai phụ thuộc beta. Đây là lý do không thể chỉ nhìn m và v thô để diễn giải độ lớn update.",
          "Checkpoint muốn tiếp tục gần đúng phải lưu tham số, m, v, số bước t, scheduler và mixed-precision scaler. Muốn tái lập sát hơn còn cần trạng thái RNG của Python, NumPy, framework trên CPU/accelerator cùng sampler/dataloader cursor hoặc worker seed khi hệ thống hỗ trợ. Chỉ tải model weights rồi tạo Adam mới là thí nghiệm khác vì lịch sử moment đã mất; ngay cả đủ state, kernel không xác định hoặc môi trường khác vẫn có thể làm run lệch bit.",
        ],
        formulas: ["m_hat_t=m_t/(1-beta_1^t)", "v_hat_t=v_t/(1-beta_2^t)"],
      },
      {
        title: "AdamW và weight decay tách rời",
        paragraphs: [
          "Với SGD thuần, L2 penalty tạo gradient lambda theta và thường tương đương multiplicative weight decay dưới quy ước hệ số thích hợp. Trong Adam, nếu cộng lambda theta vào gradient trước adaptive normalization, thành phần regularization cũng bị chia theo sqrt(v), nên mức co tham số phụ thuộc lịch sử gradient từng chiều. AdamW tách decay khỏi gradient loss và trừ trực tiếp eta lambda theta ở bước cập nhật.",
          "Weight decay thường không áp cho bias và nhiều tham số normalization, nhưng đây là lựa chọn cần cấu hình theo nhóm tham số chứ không phải quy luật toán học bất biến. AdamW không tự giải quyết overfitting; vẫn cần validation, data augmentation, early stopping và tìm lambda. Khi so Adam với AdamW phải giữ rõ learning rate, schedule, epsilon, beta và nhóm decay để tránh gán khác biệt cho sai nguyên nhân.",
        ],
        formulas: ["AdamW: theta_t=(1-eta lambda)theta_{t-1}-eta m_hat_t/(sqrt(v_hat_t)+epsilon)", "L2-gradient: g_t <- g_t+lambda theta_{t-1}"],
      },
    ],
    workedExamples: [
      {
        title: "Bước AdamW đầu tiên trên hai tham số",
        problem: "Cho theta_0=[1,1], g_1=[2,-1], beta_1=0.9, beta_2=0.999, eta=0.1, lambda=0.01 và tạm bỏ epsilon vì hai gradient khác 0. Tính bước AdamW đầu.",
        steps: [
          { state: "m_1=0.1g_1=[0.2,-0.1]", explanation: "Trạng thái m_0 bằng 0 nên chỉ phần 1-beta_1 của gradient đi vào moment bậc một." },
          { state: "v_1=0.001g_1^2=[0.004,0.001]", explanation: "Bình phương thực hiện theo từng phần tử, nên mất dấu nhưng giữ scale." },
          { state: "m_hat_1=[2,-1], v_hat_1=[4,1]", explanation: "Chia lần lượt cho 1-0.9 và 1-0.999 sửa bias do khởi tạo 0." },
          { state: "adaptive step=0.1[1,-1]=[0.1,-0.1]", explanation: "m_hat/sqrt(v_hat) bằng dấu gradient ở bước đầu trong ví dụ không epsilon." },
          { state: "theta_1=[1,1]-[0.1,-0.1]-0.1x0.01[1,1]=[0.899,1.099]", explanation: "Decay [0.001,0.001] được tách khỏi adaptive step." },
        ],
        conclusion: "Bias correction phục hồi đúng scale moment ban đầu, còn AdamW co cả hai tọa độ theo theta trước đó độc lập với preconditioner.",
        sanityChecks: [
          "m, v và theta đều có shape (2,), còn v không âm.",
          "Bỏ weight decay phải cho [0.9,1.1], chênh đúng [0.001,0.001].",
          "Đổi eta về 0 phải làm cả adaptive update lẫn decay bằng 0.",
        ],
      },
    ],
    implementationChecklist: [
      "Log learning rate, beta_1, beta_2, epsilon, weight decay và quy ước vị trí epsilon.",
      "Tạo nhóm tham số decay/non-decay có tên rõ và kiểm tra không bỏ sót tham số.",
      "Lưu model, m, v, optimizer/scheduler/scaler, RNG và sampler/dataloader state khi checkpoint.",
      "Theo dõi norm gradient, norm update và tỷ lệ update/parameter theo tầng.",
      "Không gọi optimizer.step khi gradient chứa NaN hoặc sau micro-batch chưa đủ accumulation.",
    ],
    masteryChecklist: [
      "Tính được m, v, bias correction và một update Adam bằng tay.",
      "Giải thích vì sao v dùng bình phương gradient theo từng phần tử.",
      "Phân biệt L2 penalty với decoupled weight decay trong optimizer thích nghi.",
      "Nêu trạng thái cần lưu để resume sát và giới hạn của tái lập bit-for-bit.",
      "Phân tích tác động của eta, beta, epsilon và lambda mà không đồng nhất vai trò của chúng.",
    ],
    glossary: [
      { term: "First moment", definition: "Moving average của gradient dùng để làm mượt hướng cập nhật." },
      { term: "Second moment", definition: "Moving average của bình phương gradient dùng ước lượng thang theo từng tọa độ." },
      { term: "Bias correction", definition: "Hiệu chỉnh sai lệch về 0 do khởi tạo moving average bằng 0." },
      { term: "Preconditioner", definition: "Phép biến đổi thay đổi scale gradient trước cập nhật." },
      { term: "Weight decay", definition: "Phép co tham số trực tiếp theo tỷ lệ ở mỗi bước tối ưu." },
      { term: "Optimizer state", definition: "Các biến như moment và step count ngoài model parameters mà optimizer cần duy trì." },
    ],
    sourceIds: ["d2l-vi", "d2l-en", "pml-intro", "mml"],
  },

  "dl-learning-rate-convergence": {
    lessonId: "dl-learning-rate-convergence",
    readingMinutes: 39,
    openingQuestions: [
      "Learning rate lớn đến mức nào thì một bước đi ngược gradient vẫn làm loss giảm?",
      "Convergence trong lý thuyết tối ưu khác việc validation metric ngừng cải thiện như thế nào?",
      "Warmup và các schedule thay đổi learning rate theo update nhằm giải quyết vấn đề gì?",
    ],
    sections: [
      {
        title: "Learning rate, độ cong và điều kiện giảm",
        paragraphs: [
          "Gradient cho hướng giảm cục bộ, còn learning rate eta quyết định độ dài bước. Trên hàm quadratic một chiều có curvature a, cập nhật trở thành w_{t+1}=(1-eta a)w_t; hội tụ về 0 khi |1-eta a|<1, tức 0<eta<2/a. Learning rate lớn hơn ngưỡng có thể làm biên độ tăng dù luôn đi ngược gradient tại điểm hiện tại. Trong nhiều chiều, trị riêng lớn nhất của Hessian gần điểm xét chi phối ngưỡng ổn định cục bộ.",
          "Với hàm L-smooth, descent lemma đưa ra bảo đảm một bước giảm cho gradient descent khi eta đủ nhỏ, nhưng mạng sâu không convex và L toàn cục khó biết. Vì vậy các điều kiện này là công cụ trực giác, không phải giấy chứng nhận mọi run. Normalization, batch noise, momentum và adaptive preconditioning đều thay đổi động lực so với gradient descent xác định đơn giản.",
        ],
        formulas: ["w_{t+1}=w_t-eta grad f(w_t)", "quadratic: w_{t+1}=(1-eta a)w_t", "0<eta<2/a cho hội tụ một chiều"],
      },
      {
        title: "Schedule, warmup và đơn vị thời gian",
        paragraphs: [
          "Learning rate cố định hữu ích để tìm vùng ổn định, sau đó decay giúp giảm nhiễu quanh nghiệm. Step decay, exponential decay và cosine decay tạo đường cong khác nhau; cosine thường đi từ eta_max về eta_min theo một chu kỳ đã định. Warmup tăng eta từ nhỏ ở đầu run, hữu ích khi moment, normalization hoặc activation chưa ổn định, đặc biệt với batch lớn. Warmup không sửa một eta_max vốn quá lớn sau giai đoạn đầu.",
          "Scheduler phải biết đơn vị là optimizer step, epoch hay token. Với gradient accumulation và distributed training, gọi scheduler mỗi micro-batch sẽ làm lịch chạy nhanh hơn dự kiến. Khi resume cần lưu scheduler state và global step. So sánh schedule phải giữ cùng ngân sách update hoặc token; cùng số epoch nhưng batch khác cho số update khác.",
        ],
        formulas: ["cosine: eta_t=eta_min+0.5(eta_max-eta_min)(1+cos(pi t/T))", "linear warmup: eta_t=eta_max t/T_w cho t<=T_w"],
      },
      {
        title: "Chẩn đoán hội tụ bằng nhiều tín hiệu",
        paragraphs: [
          "Training loss giảm cho thấy optimizer khớp objective train tốt hơn, không tự chứng minh tổng quát hóa. Validation loss tăng khi train loss tiếp tục giảm thường gợi ý overfitting; cả hai loss dao động hoặc nổ có thể do learning rate, dữ liệu, mixed precision hoặc gradient bất thường. Plateau cũng có thể đến từ gradient quá nhỏ, capacity thiếu, nhãn nhiễu hoặc bug mask, nên giảm learning rate không phải phản xạ duy nhất.",
          "Theo dõi loss, gradient norm, update norm, parameter norm, learning rate và throughput theo global step. Gradient clipping có thể ngăn bước ngoại lệ nhưng nếu clip gần như mọi step thì đang che một vấn đề scale hoặc eta. Một run được xem là hội tụ theo tiêu chí vận hành khi metric và update ổn định dưới ngân sách định trước; tuy nhiên điểm dừng của mạng sâu không được bảo đảm là cực tiểu toàn cục.",
        ],
        formulas: ["relative_update=||Delta theta||/(||theta||+epsilon)", "clip: g <- g min(1,c/||g||)"],
      },
    ],
    workedExamples: [
      {
        title: "Ngưỡng ổn định trên một quadratic",
        problem: "Cho f(w)=0.5w^2, w_0=4. So sánh một bước gradient descent với eta=0.5 và eta=2.5.",
        steps: [
          { state: "grad f(w_0)=4 và f(w_0)=0.5x16=8", explanation: "Curvature a=1 nên khoảng hội tụ lý thuyết là 0<eta<2." },
          { state: "eta=0.5: w_1=4-0.5x4=2", explanation: "Hệ số 1-eta=0.5 có trị tuyệt đối nhỏ hơn 1." },
          { state: "f(2)=0.5x4=2<8", explanation: "Loss giảm bốn lần sau bước ổn định." },
          { state: "eta=2.5: w_1=4-2.5x4=-6", explanation: "Bước vượt qua 0 và biên độ tăng vì |1-eta|=1.5." },
          { state: "f(-6)=0.5x36=18>8", explanation: "Đi ngược gradient với bước quá dài vẫn làm objective tăng." },
        ],
        conclusion: "Hướng gradient và độ dài bước là hai điều kiện tách biệt; curvature đặt scale tự nhiên cho learning rate ổn định.",
        sanityChecks: [
          "Với eta=1, quadratic này đi từ w=4 tới đúng w=0 trong một bước.",
          "Với eta=2, w đổi dấu nhưng giữ biên độ nên không hội tụ.",
          "Gradient và w đều là scalar trong ví dụ nên không có lỗi broadcast ẩn.",
        ],
      },
    ],
    implementationChecklist: [
      "Log learning rate theo global optimizer step và xác nhận scheduler không chạy mỗi micro-batch.",
      "Chạy learning-rate range test hoặc sweep ngắn trước run dài khi ngân sách cho phép.",
      "Theo dõi train/validation loss, gradient norm, update norm và số lần clipping.",
      "Lưu global step cùng scheduler/optimizer để resume đúng pha của lịch.",
      "Định nghĩa trước tiêu chí early stopping, patience và ngân sách update/token.",
    ],
    masteryChecklist: [
      "Suy ra khoảng eta hội tụ cho quadratic một chiều có curvature a.",
      "Tính tay một bước ổn định và một bước phân kỳ.",
      "Phân biệt convergence của objective train với generalization trên validation.",
      "Giải thích warmup, decay và đơn vị step trong scheduler.",
      "Đọc loss cùng gradient/update norm để đề xuất chẩn đoán có kiểm chứng.",
    ],
    glossary: [
      { term: "Learning rate", definition: "Hệ số đặt độ dài cơ sở của bước cập nhật tham số." },
      { term: "Curvature", definition: "Mức thay đổi của gradient, thường được mô tả cục bộ bằng đạo hàm bậc hai." },
      { term: "Warmup", definition: "Giai đoạn tăng learning rate dần từ giá trị nhỏ ở đầu huấn luyện." },
      { term: "Scheduler", definition: "Quy tắc thay đổi learning rate theo thời gian huấn luyện." },
      { term: "Plateau", definition: "Giai đoạn metric gần như không cải thiện qua nhiều update." },
      { term: "Gradient clipping", definition: "Giới hạn độ lớn gradient trước khi optimizer cập nhật." },
    ],
    sourceIds: ["d2l-vi", "d2l-en", "mml", "pml-intro"],
  },

  "dl-regularization": {
    lessonId: "dl-regularization",
    readingMinutes: 40,
    openingQuestions: [
      "Regularization thay đổi objective, dữ liệu hiệu dụng hoặc thời điểm dừng theo những cơ chế nào?",
      "L1, L2, weight decay, dropout và early stopping có thể hoán đổi cho nhau hay không?",
      "Làm sao phát hiện một kỹ thuật giảm train score nhưng thực sự cải thiện khả năng tổng quát hóa?",
    ],
    sections: [
      {
        title: "Độ phức tạp, bias-variance và penalty",
        paragraphs: [
          "Regularization đưa thiên kiến vào quá trình học để giảm khoảng cách train-generalization dưới dữ liệu hữu hạn. L2 penalty cộng lambda||w||_2^2/2, tạo gradient lambda w và khuyến khích trọng số nhỏ nhưng thường không đúng bằng 0. L1 cộng lambda||w||_1, có subgradient tại 0 và có thể tạo nghiệm thưa trong một số bài toán. Hệ số lambda lớn hơn tăng sức ép đơn giản hóa nhưng có thể gây underfitting.",
          "Penalty phải được scale nhất quán với loss mean hay sum; nếu objective dữ liệu đổi theo batch hoặc n mà penalty không đổi quy ước, cùng lambda mang ý nghĩa khác. Bias và tham số normalization thường được xử lý riêng trong thực hành, nhưng cần nêu rõ lựa chọn. Với Adam, decoupled weight decay không đồng nhất với L2 penalty do adaptive normalization.",
        ],
        formulas: ["J(w)=R_train(w)+(lambda/2)||w||_2^2", "grad J=grad R_train+lambda w", "L1=lambda sum_j |w_j|"],
      },
      {
        title: "Dropout, augmentation và early stopping",
        paragraphs: [
          "Dropout đặt ngẫu nhiên một phần activation về 0 trong train. Inverted dropout chia activation còn lại cho keep probability q để kỳ vọng theo từng phần tử được giữ; ở eval không lấy mẫu mask và không scale thêm. Dropout thay đổi nhiễu nội bộ, không tương đương trực tiếp L2. Với recurrent, attention hoặc normalization, vị trí và loại dropout ảnh hưởng hành vi nên phải theo kiến trúc.",
          "Data augmentation mã hóa các biến đổi mà nhãn được giả định bất biến hoặc biến đổi theo quy tắc. Crop ảnh, noise âm thanh hay paraphrase văn bản chỉ hợp lệ khi không phá nhãn. Early stopping chọn checkpoint theo validation metric và có tác dụng regularization theo quỹ đạo tối ưu, nhưng nếu liên tục điều chỉnh theo test thì test đã bị rò rỉ.",
        ],
        formulas: ["dropout train: h_tilde=(m/q) elementwise h, m_j~Bernoulli(q)", "E[h_tilde_j]=h_j"],
      },
      {
        title: "Đánh giá regularization có kiểm soát",
        paragraphs: [
          "Một kỹ thuật regularization có thể làm train loss cao hơn nhưng validation loss thấp hơn; đó không phải dấu hiệu thất bại. So sánh phải giữ split, seed set, schedule, ngân sách và tiêu chí checkpoint. Báo trung bình cùng độ phân tán qua nhiều seed khi sai khác nhỏ, đồng thời xem metric theo nhóm để tránh cải thiện lớp lớn nhưng làm hại nhóm thiểu số.",
          "Train-validation gap chỉ là tín hiệu, không xác định duy nhất overfitting: preprocessing khác nhau, augmentation chỉ ở train và label noise cũng làm gap thay đổi. Ablation nên bật từng cơ chế, log norm tham số, sparsity, calibration và đường cong học. Hyperparameter được chọn trên validation; test chỉ dùng sau khi khóa quyết định để ước lượng cuối không bị lạc quan.",
        ],
        formulas: ["gap_loss=validation_loss-train_loss; gap_score=train_score-validation_score khi score càng lớn càng tốt", "checkpoint*=argmin_t validation_loss_t"],
      },
    ],
    workedExamples: [
      {
        title: "Nghiệm co bởi L2 và kỳ vọng của dropout",
        problem: "Xét J(w)=0.5(w-3)^2+0.5lambda w^2 với lambda=0.5. Sau đó cho h=[2,4], keep probability q=0.5 và mask m=[1,0].",
        steps: [
          { state: "dJ/dw=(w-3)+0.5w=1.5w-3", explanation: "Gradient gồm phần fit dữ liệu và phần L2 lambda w." },
          { state: "Đặt gradient bằng 0 cho w*=3/1.5=2", explanation: "Không regularization nghiệm là 3; L2 co nghiệm về 0 nhưng không ép đúng 0." },
          { state: "J(2)=0.5(2-3)^2+0.25x2^2=0.5+1=1.5", explanation: "Tổng objective cân bằng sai số fit và penalty." },
          { state: "h_tilde=(m/q) elementwise h=[4,0]", explanation: "Activation còn lại được nhân 1/q=2 trong inverted dropout." },
          { state: "Qua mọi mask, E[h_tilde]=[2,4]=h", explanation: "Mỗi chiều được giữ với xác suất 0.5 rồi scale gấp đôi." },
        ],
        conclusion: "L2 co tham số thông qua objective, còn dropout tạo estimator activation ngẫu nhiên giữ kỳ vọng; hai cơ chế không phải một phép toán.",
        sanityChecks: [
          "Khi lambda về 0, nghiệm w* phải trở lại 3.",
          "Khi q=1, dropout output phải luôn bằng h.",
          "Ở eval, dùng h trực tiếp chứ không áp lại mask [1,0].",
        ],
      },
    ],
    implementationChecklist: [
      "Ghi quy ước loss mean/sum và hệ số penalty hoặc weight decay chính xác.",
      "Chuyển model đúng train/eval để dropout và normalization hoạt động đúng chế độ.",
      "Chỉ áp augmentation bảo toàn nhãn và chỉ fit augmentation học được trên train.",
      "Chọn lambda, dropout rate và checkpoint bằng validation, không bằng test.",
      "Làm ablation cùng seed, schedule và ngân sách rồi báo metric theo nhóm.",
    ],
    masteryChecklist: [
      "Tính gradient và nghiệm của một objective quadratic có L2.",
      "So sánh tác động định tính của L1 và L2 lên tham số.",
      "Chứng minh kỳ vọng của inverted dropout cho một activation.",
      "Phân biệt penalty, decoupled weight decay, augmentation và early stopping.",
      "Thiết kế ablation không dùng test để chọn hyperparameter.",
    ],
    glossary: [
      { term: "Regularization", definition: "Thiên kiến hoặc ràng buộc nhằm cải thiện tổng quát hóa trên dữ liệu chưa thấy." },
      { term: "L1 penalty", definition: "Phạt tổng trị tuyệt đối tham số và có thể khuyến khích nghiệm thưa." },
      { term: "L2 penalty", definition: "Phạt bình phương chuẩn Euclid của tham số và khuyến khích trọng số nhỏ." },
      { term: "Dropout", definition: "Cơ chế đặt ngẫu nhiên activation về 0 trong train theo xác suất đã chọn." },
      { term: "Early stopping", definition: "Dừng hoặc chọn checkpoint dựa trên diễn biến metric validation." },
      { term: "Ablation", definition: "Thí nghiệm loại hoặc thay một thành phần để đo đóng góp có kiểm soát." },
    ],
    sourceIds: ["d2l-vi", "d2l-en", "pml-intro", "mml"],
  },

  "dl-weight-initialization": {
    lessonId: "dl-weight-initialization",
    readingMinutes: 37,
    openingQuestions: [
      "Vì sao khởi tạo mọi neuron bằng cùng một vector làm chúng không thể học vai trò khác nhau?",
      "Fan-in, fan-out và activation quyết định variance khởi tạo theo trực giác nào?",
      "Một công thức Xavier hoặc He đúng tên có đủ bảo đảm cả mạng sâu huấn luyện ổn định không?",
    ],
    sections: [
      {
        title: "Phá đối xứng và giữ tín hiệu",
        paragraphs: [
          "Nếu các neuron cùng tầng có trọng số và bias giống hệt nhau, chúng nhận cùng input, tạo cùng output và nhận cùng gradient; gradient descent giữ đối xứng đó nên nhiều neuron chỉ học bản sao. Khởi tạo ngẫu nhiên phá đối xứng, nhưng phân phối phải có mean và scale phù hợp. Trọng số quá nhỏ làm activation và gradient suy giảm qua nhiều tầng; quá lớn làm activation hoặc gradient nổ, đồng thời đẩy sigmoid/tanh vào vùng bão hòa.",
          "Bias thường có thể bắt đầu bằng 0 vì trọng số ngẫu nhiên đã phá đối xứng giữa neuron. Ngoại lệ có chủ đích tồn tại, như bias cổng hoặc output theo prior lớp. Khởi tạo là điều kiện đầu của tối ưu, không phải regularization tự động; hai seed có thể đi theo quỹ đạo khác nhau trong objective không convex dù cùng phân phối.",
        ],
        formulas: ["z_j=sum_{i=1}^{fan_in} W_ji x_i+b_j", "Var(z_j)≈fan_in Var(W_ji)Var(x_i) dưới giả định độc lập và mean 0"],
      },
      {
        title: "Xavier, He và shape của ma trận",
        paragraphs: [
          "Xavier/Glorot cân bằng tín hiệu thuận và ngược cho activation gần tuyến tính hoặc tanh, thường dùng variance 2/(fan_in+fan_out) cho normal. He/Kaiming bù việc ReLU đặt khoảng một nửa giá trị về 0, thường dùng variance 2/fan_in cho trọng số normal ở hướng forward. Đây là kết quả xấp xỉ dựa trên độc lập, phân phối đối xứng và thống kê đồng nhất; activation, gain và hướng fan phải khớp phép biến đổi thực.",
          "Với linear layer ánh xạ d_in sang d_out theo y=xW^T+b, W có shape [d_out,d_in], nên fan_in=d_in và fan_out=d_out. Với convolution, fan còn nhân kích thước kernel và số kênh theo group. Nhầm shape lưu trữ hoặc dùng fan_out khi muốn giữ forward variance làm scale sai dù code initializer vẫn chạy.",
        ],
        formulas: ["Xavier normal: Var(W)=2/(fan_in+fan_out)", "He normal cho ReLU forward: Var(W)=2/fan_in", "W_linear shape=[fan_out,fan_in]"],
      },
      {
        title: "Kiểm tra thực nghiệm và các trường hợp đặc biệt",
        paragraphs: [
          "Residual branches, normalization, depth, attention projections và gated activation làm giả định variance đơn giản lệch đi. Output head đôi khi cần scale nhỏ để logits ban đầu không quá tự tin; embedding padding row có thể cần giữ 0; recurrent matrix có thể dùng orthogonal initialization. Không được ghi đè pretrained weights bằng initializer chạy đệ quy sau khi load checkpoint.",
          "Một kiểm tra thực dụng là chạy vài batch không update, log mean, standard deviation và tỷ lệ 0 của activation theo tầng, rồi backward để xem gradient norm. Cần kiểm tra nhiều seed và dtype mục tiêu. Activation hữu hạn ở batch đầu chưa đủ chứng minh ổn định lâu dài, nhưng nhanh chóng phát hiện fan sai, saturation hoặc nhánh residual có scale bất thường trước khi tốn một run đầy đủ.",
        ],
        formulas: ["activation_std_l=std(h_l)", "gradient_ratio_l=||grad W_l||/(||W_l||+epsilon)"],
      },
    ],
    workedExamples: [
      {
        title: "Tính scale Xavier và He từ fan",
        problem: "Một linear layer có W shape [6,4], đầu vào bốn chiều độc lập, mean 0, variance 1. Tính variance/std Xavier normal và He normal cho ReLU; ước lượng second moment sau ReLU theo giả định đối xứng.",
        steps: [
          { state: "fan_in=4, fan_out=6", explanation: "Shape lưu là [số output, số input], nên không đảo hai fan." },
          { state: "Xavier Var(W)=2/(4+6)=0.2, std=sqrt(0.2)≈0.4472", explanation: "Công thức cân bằng cả hướng forward và backward trong giả định Glorot." },
          { state: "He Var(W)=2/4=0.5, std=sqrt(0.5)≈0.7071", explanation: "Scale lớn hơn bù việc ReLU loại phần âm." },
          { state: "E[z^2]≈4x0.5x1=2", explanation: "Tổng bốn tích độc lập cho pre-activation second moment xấp xỉ 2." },
          { state: "E[ReLU(z)^2]≈0.5E[z^2]=1", explanation: "Với phân phối z đối xứng, nửa second moment nằm ở phía dương; đây không phải khẳng định variance chính xác bằng 1 vì ReLU có mean dương." },
        ],
        conclusion: "He giữ second moment gần ổn định qua ReLU theo giả định, còn Xavier dùng cả fan-in và fan-out; cả hai cần đúng shape và activation.",
        sanityChecks: [
          "W phải có đúng 6x4=24 phần tử và bias shape (6,).",
          "Variance luôn không âm và std là căn bậc hai của variance.",
          "Nếu fan_in tăng mà các yếu tố khác giữ nguyên, He std phải giảm theo 1/sqrt(fan_in).",
        ],
      },
    ],
    implementationChecklist: [
      "Xác nhận shape lưu của từng linear/convolution trước khi tính fan-in và fan-out.",
      "Chọn initializer cùng gain theo activation, hướng truyền và kiến trúc thực tế.",
      "Không chạy khởi tạo lại lên tham số pretrained hoặc padding row cần bảo toàn.",
      "Probe activation và gradient trên vài batch ở nhiều tầng trước run dài.",
      "Ghi seed, initializer, gain, dtype và phiên bản framework trong cấu hình.",
    ],
    masteryChecklist: [
      "Giải thích bằng gradient vì sao khởi tạo đồng nhất không phá đối xứng.",
      "Tính fan-in/fan-out của linear và convolution đơn giản.",
      "Tính variance cùng standard deviation Xavier và He bằng tay.",
      "Phân biệt second moment sau ReLU với variance khi mean không bằng 0.",
      "Thiết kế probe phát hiện activation hoặc gradient nổ/biến mất ngay đầu run.",
    ],
    glossary: [
      { term: "Symmetry breaking", definition: "Tạo điều kiện đầu khác nhau để các neuron có thể học chức năng khác nhau." },
      { term: "Fan-in", definition: "Số kết nối đầu vào hiệu dụng của một đơn vị output." },
      { term: "Fan-out", definition: "Số kết nối đầu ra hiệu dụng nhận từ một đơn vị input." },
      { term: "Xavier initialization", definition: "Khởi tạo scale theo cả fan-in và fan-out để cân bằng truyền tín hiệu." },
      { term: "He initialization", definition: "Khởi tạo thường dùng scale 2/fan-in cho ReLU ở hướng forward." },
      { term: "Saturation", definition: "Vùng activation có đạo hàm rất nhỏ làm gradient khó truyền." },
    ],
    sourceIds: ["d2l-vi", "d2l-en", "mml", "pml-intro"],
  },

  "dl-batch-normalization": {
    lessonId: "dl-batch-normalization",
    readingMinutes: 40,
    openingQuestions: [
      "Batch normalization chuẩn hóa trên những trục nào đối với linear và convolution?",
      "Vì sao cùng một mẫu có thể cho output khác khi nằm trong hai mini-batch khác nhau ở chế độ train?",
      "Running statistics, gamma và beta được dùng khác nhau ra sao giữa train và inference?",
    ],
    sections: [
      {
        title: "Phép chuẩn hóa và tham số affine",
        paragraphs: [
          "Batch normalization tính mean và variance theo tập phần tử quy định cho từng feature/channel, chuẩn hóa rồi áp scale gamma và shift beta học được. Với tensor dense [B,d], thống kê thường lấy trên trục B cho mỗi feature. Với convolution [B,C,H,W], BatchNorm2d thường lấy trên B,H,W cho từng channel C. Output giữ nguyên shape đầu vào; gamma và beta có một giá trị trên mỗi feature hoặc channel và được broadcast qua các trục còn lại.",
          "Epsilon ngăn mẫu số bằng 0 và ảnh hưởng số học khi variance rất nhỏ. Trong forward train, mean/variance batch làm output của một mẫu phụ thuộc các mẫu cùng batch; đó là đặc tính chứ không phải phép chuẩn hóa từng mẫu. Gamma và beta cho phép tầng khôi phục scale/shift hữu ích, nên BN không ép mọi output cuối cùng phải có mean 0 và variance 1.",
        ],
        formulas: ["mu_B=(1/m)sum_i x_i", "sigma_B^2=(1/m)sum_i(x_i-mu_B)^2", "y_i=gamma (x_i-mu_B)/sqrt(sigma_B^2+epsilon)+beta"],
      },
      {
        title: "Chế độ train, inference và running statistics",
        paragraphs: [
          "Ở train, BN dùng thống kê mini-batch để chuẩn hóa và đồng thời cập nhật running mean/variance bằng moving average theo quy ước framework. Ở inference, nó dùng running statistics cố định để output không phụ thuộc các mẫu khác trong request. Quên chuyển sang eval khiến dự đoán phụ thuộc batch composition; ngược lại, vô tình để eval trong training ngăn running statistics cập nhật và thay đổi gradient qua phép chuẩn hóa.",
          "Chi tiết variance dùng trong forward và running update có thể khác giữa framework, nên checkpoint phải đi cùng implementation/config. Khi fine-tune, có thể cập nhật cả affine parameters lẫn running statistics, hoặc đóng băng một phần; hai lựa chọn mang hành vi khác nhau dưới domain shift. Batch size nhỏ làm statistics nhiễu và running estimates kém đại diện.",
        ],
        formulas: ["running_mu <- (1-alpha)running_mu+alpha mu_B", "inference: y=gamma(x-running_mu)/sqrt(running_var+epsilon)+beta"],
      },
      {
        title: "Tương tác kiến trúc và giới hạn",
        paragraphs: [
          "BN thường đặt sau linear/convolution và trước hoặc sau activation tùy kiến trúc đã chọn; đổi vị trí làm hàm mô hình khác, nên phải nhất quán với checkpoint. Bias ngay trước BN đôi khi dư thừa vì mean subtraction và beta có thể hấp thụ shift, nhưng không nên xóa khỏi mô hình pretrained tùy tiện. Gradient qua BN ghép các mẫu trong batch, vì mean và variance cùng phụ thuộc toàn batch.",
          "Trong sequence model với batch/token count thay đổi hoặc distributed training, local BN ở mỗi device thấy thống kê khác; synchronized BN trao đổi statistics nhưng tăng chi phí. Layer normalization chuẩn hóa theo feature trong từng mẫu và không cần running stats; group normalization gom channel theo nhóm. Chúng giải quyết các chế độ khác nhau và không phải thay thế tương đương chỉ bằng đổi tên layer.",
        ],
        formulas: ["Dense BN axes=[0] trên [B,d]", "Conv2d BN axes=[0,2,3] trên [B,C,H,W]"],
      },
    ],
    workedExamples: [
      {
        title: "Chuẩn hóa một feature trong batch ba mẫu",
        problem: "Cho x=[1,3,5], dùng variance chia m, tạm đặt epsilon=0, gamma=2 và beta=1. Tính output train của BN cho feature này.",
        steps: [
          { state: "mu_B=(1+3+5)/3=3", explanation: "Có ba phần tử cùng feature trong batch." },
          { state: "sigma_B^2=((1-3)^2+0^2+(5-3)^2)/3=8/3", explanation: "Forward dùng variance theo quy ước chia m đã nêu trong bài toán." },
          { state: "x_hat=[-2,0,2]/sqrt(8/3)≈[-1.2247,0,1.2247]", explanation: "Vector chuẩn hóa có mean 0 và variance 1 khi epsilon bằng 0." },
          { state: "y=2x_hat+1≈[-1.4495,1,3.4495]", explanation: "Gamma scale variance và beta dịch mean sau chuẩn hóa." },
        ],
        conclusion: "Phần normalized có mean 0, variance 1 trong ví dụ; sau affine, output có mean beta=1 và variance gamma^2=4.",
        sanityChecks: [
          "Ba output có tổng bằng 3 nên mean đúng bằng 1.",
          "Đổi thứ tự ba mẫu chỉ đổi thứ tự output, không đổi thống kê batch.",
          "Nếu mọi x bằng nhau và epsilon dương, phần normalized phải bằng 0 thay vì chia 0.",
        ],
      },
    ],
    implementationChecklist: [
      "Chọn đúng lớp BN cho rank tensor và xác nhận các trục dùng tính statistics.",
      "Chuyển train/eval đúng lúc và lưu running mean, running variance, gamma, beta.",
      "Theo dõi batch size thực trên mỗi device, kể cả batch cuối và distributed sampler.",
      "Khi fine-tune, quyết định rõ affine parameters và running stats có được cập nhật hay không.",
      "Test dự đoán một mẫu ở các batch composition trong eval phải gần như không đổi.",
    ],
    masteryChecklist: [
      "Suy ra axes chuẩn hóa và shape gamma/beta cho dense và conv tensor.",
      "Tính tay mean, variance, normalized value và affine output.",
      "Giải thích sự khác nhau giữa batch statistics và running statistics.",
      "Chẩn đoán lỗi quên train/eval và batch quá nhỏ.",
      "So sánh BN với layer normalization mà không coi chúng tương đương.",
    ],
    glossary: [
      { term: "Batch statistics", definition: "Mean và variance tính từ mini-batch hiện tại trong chế độ train." },
      { term: "Running statistics", definition: "Ước lượng moving average dùng làm thống kê cố định ở inference." },
      { term: "Affine parameters", definition: "Gamma và beta học được để scale và shift giá trị đã chuẩn hóa." },
      { term: "Synchronized BN", definition: "Batch normalization tổng hợp statistics giữa nhiều worker hoặc device." },
      { term: "Layer normalization", definition: "Chuẩn hóa theo các feature của từng mẫu và không dùng running batch statistics." },
      { term: "Distribution shift", definition: "Sự thay đổi phân phối giữa dữ liệu huấn luyện và dữ liệu áp dụng." },
    ],
    sourceIds: ["d2l-vi", "d2l-en", "pml-intro", "ioai-2026"],
  },

  "dl-finetuning": {
    lessonId: "dl-finetuning",
    readingMinutes: 42,
    openingQuestions: [
      "Khi nào linear probe đủ, khi nào cần mở toàn bộ backbone để fine-tune?",
      "Learning rate, normalization và optimizer state của pretrained backbone nên khác head mới ra sao?",
      "Làm thế nào chứng minh cải thiện đến từ transfer thay vì leakage hoặc split dễ?",
    ],
    sections: [
      {
        title: "Transfer, task head và mức độ cập nhật",
        paragraphs: [
          "Fine-tuning bắt đầu từ tham số pretrained thay vì khởi tạo ngẫu nhiên, rồi tối ưu trên nhiệm vụ đích. Bước đầu phải khớp tokenizer/preprocessing, input channels, label mapping và kiến trúc checkpoint. Head mới có output dimension đúng số lớp hoặc target; backbone tạo feature. Linear probe đóng băng backbone và chỉ học head, cho baseline đo mức tuyến tính của biểu diễn. Full fine-tuning cập nhật mọi tham số và linh hoạt hơn nhưng tốn bộ nhớ, dễ overfit hoặc quên tri thức khi dữ liệu nhỏ.",
          "Giữa hai cực có gradual unfreezing, adapters hoặc low-rank updates: chỉ một phần tham số được học. Không có chiến lược thắng phổ quát; lựa chọn phụ thuộc độ lệch miền, quy mô dữ liệu và ngân sách. Một checkpoint cùng lĩnh vực nhưng preprocessing sai có thể kém hơn model tổng quát được tích hợp đúng.",
        ],
        formulas: ["h=f_{theta_b}(x), logits=W_h h+b_h", "linear probe: optimize theta_h, giữ theta_b cố định", "full fine-tune: optimize theta_b và theta_h"],
      },
      {
        title: "Parameter groups, forgetting và normalization",
        paragraphs: [
          "Backbone thường dùng learning rate nhỏ hơn head mới vì feature pretrained đã hữu ích, còn head cần thích nghi từ đầu. Discriminative learning rates tạo parameter groups; weight decay và scheduler cũng có thể khác theo nhóm. Phải kiểm tra mỗi tham số xuất hiện đúng một nhóm, requires_grad đúng ý định và optimizer chỉ được tạo sau khi đóng/mở băng. Khi unfreeze giữa run, optimizer cần nhận tham số mới và trạng thái được quản lý rõ.",
          "Catastrophic forgetting là suy giảm năng lực cũ khi update quá mạnh trên dữ liệu đích hẹp. Learning rate nhỏ, regularization về weights gốc, rehearsal hoặc parameter-efficient tuning có thể giảm nhưng không bảo đảm. Batch normalization đặc biệt nhạy: dù weights đóng băng, running statistics vẫn có thể đổi nếu module ở train mode. Quyết định cập nhật hay giữ statistics phải dựa trên batch size và domain shift.",
        ],
        formulas: ["theta_b <- theta_b-eta_b g_b", "theta_h <- theta_h-eta_h g_h, thường eta_h>eta_b", "Delta theta_b norm dùng theo dõi mức drift"],
      },
      {
        title: "Đánh giá transfer và triển khai",
        paragraphs: [
          "Split phải theo thực thể, thời gian hoặc nguồn để ngăn các bản gần trùng qua train-validation. So sánh ít nhất random-init, frozen probe và fine-tune trên cùng split, augmentation, seed set và ngân sách. Khi lớp lệch, báo metric theo lớp và calibration; checkpoint chọn bằng validation. Test không được dùng lặp lại để quyết định tầng mở băng hay learning rate.",
          "Fine-tuning cần lưu base checkpoint identifier, revision, tokenizer, label map, preprocessing và phần adapter/head. Resume phải quyết định giữ hay đặt lại optimizer state, nhất là khi thay parameter groups. Trước triển khai, kiểm tra input ngoài miền, batch size 1, dtype và parity giữa train preprocessing với serving. Cải thiện validation nhỏ hơn biến thiên qua seed chưa đủ làm bằng chứng chắc chắn cho chiến lược phức tạp hơn.",
        ],
        formulas: ["transfer_gain=metric_finetune-metric_random_init trên cùng protocol", "relative_drift=||theta_b-theta_b0||/(||theta_b0||+epsilon)"],
      },
    ],
    workedExamples: [
      {
        title: "Một bước với learning rate phân biệt",
        problem: "Backbone có theta_b=[1,-2], gradient g_b=[0.2,-0.4]; head có theta_h=[0.5], gradient g_h=[1]. Dùng eta_b=0.001, eta_h=0.01, không momentum và không decay.",
        steps: [
          { state: "Delta theta_b=-0.001[0.2,-0.4]=[-0.0002,0.0004]", explanation: "Backbone thay đổi nhỏ vì learning rate thấp để giữ feature pretrained." },
          { state: "theta_b_new=[0.9998,-1.9996]", explanation: "Cộng update theo đúng từng tọa độ; thành phần thứ hai bớt âm." },
          { state: "Delta theta_h=-0.01[1]=[-0.01]", explanation: "Head mới nhận bước lớn gấp 10 lần theo learning rate cơ sở của nhóm." },
          { state: "theta_h_new=[0.49]", explanation: "Head có shape (1,) trong ví dụ toy; thực tế output head phải khớp số target." },
          { state: "Nếu linear probe, đặt g_b không tham gia optimizer nên theta_b giữ [1,-2]", explanation: "Đóng băng không chỉ đặt learning rate cực nhỏ; nó loại update backbone khỏi bài toán tối ưu." },
        ],
        conclusion: "Parameter groups cho phép head thích nghi nhanh hơn backbone, nhưng việc đóng băng, decay và optimizer state phải được xác nhận bằng tham số thực sự được update.",
        sanityChecks: [
          "Mỗi gradient có cùng shape với nhóm tham số tương ứng.",
          "Nếu eta_b=0 hoặc backbone bị freeze, theta_b phải giữ nguyên chính xác.",
          "Norm thay đổi backbone phải nhỏ hơn nhiều so với norm tham số khi chủ đích dùng learning rate thấp.",
        ],
      },
    ],
    implementationChecklist: [
      "Pin base checkpoint/revision, tokenizer, preprocessing và label mapping cùng artifact.",
      "In danh sách tham số trainable và assert mỗi tham số thuộc đúng một optimizer group.",
      "Thiết lập learning rate, decay và scheduler riêng có chủ đích cho backbone/head/adapter.",
      "Quyết định rõ train/eval cùng running statistics cho các normalization layer.",
      "So sánh random-init, linear probe và fine-tune trên cùng split, seed và ngân sách.",
      "Chọn checkpoint bằng validation rồi kiểm tra serving parity và ngoài miền trước phát hành.",
    ],
    masteryChecklist: [
      "Phân biệt feature extraction, linear probe, gradual unfreezing và full fine-tuning.",
      "Tính tay update của hai parameter groups có learning rate khác nhau.",
      "Giải thích catastrophic forgetting và đề xuất phép đo parameter drift.",
      "Phát hiện trường hợp backbone freeze nhưng BatchNorm statistics vẫn đổi.",
      "Thiết kế protocol đánh giá transfer không dùng test để chọn cấu hình.",
    ],
    glossary: [
      { term: "Pretrained backbone", definition: "Phần mô hình đã học biểu diễn từ nhiệm vụ hoặc dữ liệu nguồn." },
      { term: "Linear probe", definition: "Head tuyến tính được huấn luyện trên backbone đóng băng để đánh giá biểu diễn." },
      { term: "Full fine-tuning", definition: "Cập nhật cả backbone và task head trên dữ liệu đích." },
      { term: "Parameter group", definition: "Nhóm tham số optimizer nhận hyperparameter cập nhật riêng." },
      { term: "Catastrophic forgetting", definition: "Suy giảm năng lực đã học khi tham số bị điều chỉnh mạnh cho nhiệm vụ mới." },
      { term: "Domain shift", definition: "Khác biệt phân phối hoặc quan hệ dữ liệu giữa nguồn pretraining và nhiệm vụ đích." },
      { term: "Adapter", definition: "Module nhỏ được thêm vào và huấn luyện thay cho cập nhật toàn bộ backbone." },
    ],
    sourceIds: ["d2l-vi", "d2l-en", "pml-intro", "ioai-2026"],
  },
} satisfies LessonTheoryMap;
