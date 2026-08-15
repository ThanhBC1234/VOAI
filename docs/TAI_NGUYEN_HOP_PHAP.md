# Tài nguyên học VOAI/IOAI hợp pháp

> Kiểm tra đường dẫn lần cuối: **15/08/2026**. Đây là danh mục liên kết, không phải gói sách/dữ liệu/model được sao chép vào dự án.

## Nguyên tắc bắt buộc

1. Chỉ mở tài liệu từ trang tác giả, trường đại học, tổ chức cuộc thi, nhà xuất bản, kho mã chính thức hoặc kho lưu trữ học thuật như arXiv.
2. **Được đọc miễn phí không có nghĩa được quyền đăng lại.** Nếu không thấy giấy phép cho phép phân phối, chỉ lưu đường dẫn; không đưa PDF, video, dataset hay model weights vào ZIP/website.
3. Không dùng bản scan, link Drive/Telegram, torrent, website vượt paywall hoặc bản đã xóa trang bản quyền. Nếu một sách thương mại hữu ích, mượn thư viện hoặc mua từ nhà xuất bản.
4. Với code, model và dataset, đọc riêng `LICENSE`, model card/dataset card và điều khoản sử dụng của **đúng phiên bản** trước khi tải hoặc deploy. Giấy phép code không tự động áp dụng cho weights, dữ liệu hay nhãn.
5. Không đưa API key, dữ liệu cá nhân, giọng nói/ảnh chưa được đồng ý lên notebook công khai hoặc dịch vụ bên ngoài.
6. Khi dùng một nguồn trong bài viết/notebook, ghi tên tác giả/tổ chức, tiêu đề, URL, phiên bản hoặc ngày truy cập. Trích dẫn ý tưởng; không chép nguyên chương.

## 1. Phạm vi thi chính thức

- [IOAI 2026 Syllabus — PDF chính thức](https://ioai-official.org/wp-content/uploads/2025/10/Syllabus.pdf): nguồn chuẩn để gắn `officialCategory` cho lộ trình. Syllabus chia kiến thức thành **Theory**, **Practice** và **Both**.
- [Trang Syllabus 2026 của IOAI](https://ioai-official.org/republic-of-kazakhstan/syllabus-2026/): giải thích ý nghĩa ba category và dẫn tới bản tải chính thức.
- [IOAI Education Hub](https://ioai-official.org/resources/): syllabus, đề/tài nguyên các mùa trước và các khóa học do IOAI tập hợp.
- [Quy chế, nội quy Olympic AI cho học sinh — OLP Việt Nam](https://www.olp.vn/olympic-ai-cho-h%E1%BB%8Dc-sinh/quy-ch%E1%BA%BF-n%E1%BB%99i-quy): dùng để kiểm tra quy định tuyển chọn/thi trong nước; quy chế có thể cập nhật nên phải đọc lại trước mỗi kỳ.

### Cách hiểu phạm vi trong catalog

- `Both — IOAI 2026`: phải giải thích được cơ chế/toán và triển khai được.
- `Practice — IOAI 2026`: biết chọn phương pháp, dùng API/thư viện đúng, đọc output và đánh giá; catalog vẫn yêu cầu tự cài phần lõi để người mới hiểu bản chất.
- `Nền bổ trợ`: STFT, Mel và MFCC không phải các dòng độc lập trong bảng IOAI 2026, nhưng cần để hiểu preprocessing/audio models.
- `Dạng dữ liệu`: video và time-series được ghi ở chú thích cuối syllabus; phải xử lý bằng các phương pháp đã liệt kê, không nên tuyên bố chúng là category riêng.
- Bản PDF ghi `DERT` trong dòng object detection; catalog dùng tên thuật toán chuẩn **DETR**.

## 2. Sách và khóa nền tảng

| Nguồn | Nên học phần nào | Quyền truy cập/sử dụng |
| --- | --- | --- |
| [Mathematics for Machine Learning](https://mml-book.github.io/) — Deisenroth, Faisal, Ong | Đại số tuyến tính, đạo hàm ma trận, xác suất, tối ưu | PDF miễn phí do chính tác giả cung cấp. Chỉ liên kết tới trang tác giả; xem thông báo bản quyền trước khi phân phối lại. |
| [Dive into Deep Learning](https://d2l.ai/) | MLP, CNN, attention, Transformer, CV/NLP và notebook thực hành | Nội dung sách CC BY-SA 4.0; sample code có giấy phép riêng trong repo. Khi phái sinh phải ghi nguồn và tuân ShareAlike. |
| [Deep Learning](https://www.deeplearningbook.org/) — Goodfellow, Bengio, Courville | Nền toán, optimization, CNN, sequence và generative models | Bản HTML đọc miễn phí từ website tác giả; không đóng gói lại sách nếu chưa có quyền. |
| [Speech and Language Processing, 3rd ed. draft](https://web.stanford.edu/~jurafsky/slp3/) — Jurafsky, Martin | Tokenization, LM, Transformers, ASR và đánh giá ngôn ngữ/giọng nói | Bản thảo online do tác giả phát hành cho học tập/lớp học. Đây không phải mặc nhiên là giấy phép open-content; giữ nguyên link và citation, không re-host PDF. |
| [Google Machine Learning Crash Course](https://developers.google.com/machine-learning/crash-course) | Ôn supervised learning, loss, generalization và dữ liệu | Khóa học chính chủ, đọc online. Kiểm tra điều khoản Google nếu muốn sao chép nội dung. |
| [fast.ai Practical Deep Learning](https://course.fast.ai/) | Thực hành project, transfer learning và quy trình thử nghiệm | Khóa học miễn phí chính chủ; chỉ nhúng/link nội dung theo giấy phép hiển thị trên từng tài nguyên. |
| [PyTorch Tutorials](https://docs.pytorch.org/tutorials/) | Tensor/autograd, training loop, CV, audio và deployment | Tài liệu chính thức; nhiều tutorial ghi license riêng trong mã nguồn. Giữ attribution/license khi tái sử dụng code. |

### Thứ tự đọc cho học sinh lớp 11

1. Đọc đúng chương toán cần dùng trong tuần; không đợi học hết sách toán rồi mới code.
2. Dùng D2L/PyTorch để đối chiếu sau khi đã tự viết phiên bản NumPy/PyTorch lõi.
3. Với chương nâng cao, đọc phần intuition → công thức → tự code → chỉ sau đó mới đọc implementation chính thức.
4. Mỗi nguồn tham khảo phải dẫn tới một ghi chú tự viết hoặc test tự chạy; không tính thời gian xem thụ động là đã thành thạo.

## 3. Computer Vision

### Bài giảng và tài liệu thực hành

- [Stanford CS231n course notes](https://cs231n.github.io/): image classification, convolution, optimization, transfer learning và generative modeling. Repo notes công khai tại [cs231n.github.io](https://github.com/cs231n/cs231n.github.io) có giấy phép MIT; vẫn phải giữ thông báo bản quyền khi tái sử dụng.
- [PyTorch Transfer Learning for Computer Vision](https://docs.pytorch.org/tutorials/beginner/transfer_learning_tutorial.html): quy trình freeze/fine-tune encoder.
- [TorchVision Object Detection Finetuning](https://docs.pytorch.org/tutorials/intermediate/torchvision_tutorial.html): hợp đồng Dataset, boxes/masks và vòng fine-tune.
- [TorchVision model documentation](https://docs.pytorch.org/vision/stable/models.html): weights, transforms và model metadata của đúng phiên bản torchvision.
- [TensorFlow Playground](https://playground.tensorflow.org/): trực quan decision boundary; chỉ dùng như mô phỏng, không thay bài tự code.

### Bài báo gốc nên đọc theo câu hỏi cụ thể

- ResNet: [Deep Residual Learning for Image Recognition](https://arxiv.org/abs/1512.03385).
- U-Net: [U-Net: Convolutional Networks for Biomedical Image Segmentation](https://arxiv.org/abs/1505.04597).
- YOLO: [You Only Look Once](https://arxiv.org/abs/1506.02640). Các phiên bản YOLO hiện đại có implementation/license khác nhau; không coi một package thương mại là định nghĩa duy nhất của thuật toán.
- SSD: [SSD: Single Shot MultiBox Detector](https://arxiv.org/abs/1512.02325).
- DETR: [End-to-End Object Detection with Transformers](https://arxiv.org/abs/2005.12872).
- GAN: [Generative Adversarial Nets](https://arxiv.org/abs/1406.2661).
- Self-supervised contrastive vision: [A Simple Framework for Contrastive Learning of Visual Representations (SimCLR)](https://arxiv.org/abs/2002.05709).
- Vision Transformer: [An Image is Worth 16x16 Words](https://arxiv.org/abs/2010.11929).
- CLIP: [Learning Transferable Visual Models From Natural Language Supervision](https://arxiv.org/abs/2103.00020), [repo OpenAI CLIP](https://github.com/openai/CLIP) và [model card](https://github.com/openai/CLIP/blob/main/model-card.md). Code repo dùng MIT; phải đọc riêng model card/weights.
- DDPM: [Denoising Diffusion Probabilistic Models](https://arxiv.org/abs/2006.11239).

ArXiv cho phép đọc/tải bài từ trang học thuật chính chủ, nhưng giấy phép tái phân phối khác nhau theo từng bài. Catalog chỉ trích công thức ở mức giải thích và dẫn nguồn; không sao chép toàn bộ bài báo vào dự án.

## 4. NLP và Language Models

- [Hugging Face NLP Course](https://huggingface.co/learn/nlp-course/): tokenizer, Transformers, fine-tuning, datasets và chia sẻ model. Luôn đọc model/dataset card riêng.
- [Transformers documentation](https://huggingface.co/docs/transformers/): API theo phiên bản cho BERT, encoder–decoder, causal LM, generation và PEFT integrations.
- [BERT documentation](https://huggingface.co/docs/transformers/model_doc/bert) và bài gốc [BERT: Pre-training of Deep Bidirectional Transformers](https://arxiv.org/abs/1810.04805).
- [Attention Is All You Need](https://arxiv.org/abs/1706.03762): kiến trúc Transformer gốc.
- [scikit-learn text feature extraction](https://scikit-learn.org/stable/modules/feature_extraction.html#text-feature-extraction): kiểm tra TF–IDF/vectorizer sau khi tự cài baseline.
- [PEFT documentation](https://huggingface.co/docs/peft/): LoRA/adapters; kiểm tra version, base-model license và khả năng tương thích trước khi train.

### Quy tắc dùng pretrained/API model

- Chỉ lấy model từ trang nhà phát triển hoặc model card đã xác minh; pin model ID và revision/commit.
- Giá, context limit, endpoint và chính sách dữ liệu là thông tin động: link tài liệu hiện hành, không chép một con số vào giáo trình rồi coi là vĩnh viễn.
- API key chỉ ở server/secret store; không lưu trong Git, notebook output hoặc biến public của frontend.
- Mọi so sánh model phải giữ cùng eval cases, prompt/template, decoding budget và metric. Output trôi chảy không phải bằng chứng đúng.

## 5. Audio

### Nền tín hiệu

- [librosa STFT documentation](https://librosa.org/doc/latest/generated/librosa.stft.html): dùng để đối chiếu shape, phase, `center`, `n_fft`, `win_length` và `hop_length` sau khi tự cài.
- [librosa feature documentation](https://librosa.org/doc/latest/feature.html) và [MFCC reference](https://librosa.org/doc/latest/generated/librosa.feature.mfcc.html): đối chiếu Mel/MFCC conventions; không trộn `power`, HTK/Slaney, DCT norm giữa train và inference.
- [SciPy Signal Processing](https://docs.scipy.org/doc/scipy/reference/signal.html): resampling, windows và spectral analysis từ tài liệu thư viện chính thức.
- Chương speech/ASR trong [Speech and Language Processing](https://web.stanford.edu/~jurafsky/slp3/): đọc từ trang tác giả, không tải từ mirror.

### Pretrained audio encoders/models

- HuBERT: [Transformers HuBERT documentation](https://huggingface.co/docs/transformers/model_doc/hubert) và bài [HuBERT: Self-Supervised Speech Representation Learning by Masked Prediction of Hidden Units](https://arxiv.org/abs/2106.07447). Docs hiện hành ghi rõ raw audio/sample rate kỳ vọng; vẫn phải đọc model card của checkpoint cụ thể.
- Whisper: [repo chính thức OpenAI Whisper](https://github.com/openai/whisper), [Transformers Whisper documentation](https://huggingface.co/docs/transformers/model_doc/whisper) và bài [Robust Speech Recognition via Large-Scale Weak Supervision](https://arxiv.org/abs/2212.04356).
- Qwen-Audio/Qwen2-Audio: [repo Qwen2-Audio](https://github.com/QwenLM/Qwen2-Audio), [Qwen2-Audio model card](https://huggingface.co/Qwen/Qwen2-Audio-7B) và [Transformers Qwen2-Audio documentation](https://huggingface.co/docs/transformers/model_doc/qwen2_audio). Dùng đúng processor/chat template của checkpoint; kiểm tra license trên model card tại lúc dùng.
- Voxtral: [Mistral Audio documentation](https://docs.mistral.ai/studio/audio/overview), [trang giới thiệu Voxtral](https://mistral.ai/news/voxtral/) và [Transformers Voxtral documentation](https://huggingface.co/docs/transformers/model_doc/voxtral). Họ model/capability/license có thể đổi theo phiên bản; model card chính thức là nguồn quyết định.

## 6. Multimodal, video và time-series

- CLIP paper/repo/model card ở mục CV là nguồn chính cho dual-encoder và image–text retrieval.
- [Hugging Face video classification guide](https://huggingface.co/docs/transformers/tasks/video_classification): tham khảo sampling/preprocessing/model contracts sau khi đã làm baseline frame encoder + temporal pooling.
- [PyTorch sequence models/tutorials](https://docs.pytorch.org/tutorials/): dùng API chính thức cho 1D CNN/RNN/Transformer; không bỏ các baseline thời gian.
- [D2L Time Series Forecasting](https://d2l.ai/chapter_recurrent-neural-networks/sequence.html): tạo windows và baseline sequence. D2L là CC BY-SA 4.0 nếu tái sử dụng nội dung.
- [scikit-learn preprocessing](https://scikit-learn.org/stable/modules/preprocessing.html): đối chiếu scaler/imputer đã fit **chỉ trên train**.
- Với vector search, bắt đầu bằng exact cosine tự code. Chỉ chọn thư viện/vector database sau khi đọc license, metric convention, index persistence và benchmark recall–latency trên dữ liệu thật.

## 7. Dữ liệu và đề luyện tập

Ưu tiên theo thứ tự:

1. Đề/dataset từ [IOAI Education Hub](https://ioai-official.org/resources/) và trang ban tổ chức cuộc thi tương ứng.
2. Dataset từ trang tác giả/tổ chức, có dataset card hoặc license rõ.
3. Dataset tự tạo/tự thu thập với consent, provenance và quy tắc xóa dữ liệu.

Trước khi dùng, ghi lại:

- URL gốc, phiên bản/ngày tải và checksum;
- chủ sở hữu, license và điều khoản citation/redistribution;
- loại dữ liệu cá nhân/nhạy cảm, consent và giới hạn sử dụng;
- unit cần group khi split: người nói, bệnh nhân, video, người dùng, thiết bị hoặc sự kiện;
- nhãn, missing values, duplicate/near-duplicate và nguy cơ leakage;
- những file nào được phép đưa vào artifact public.

Không lấy dataset từ một notebook/repo thứ ba nếu repo đó không chỉ ra nguồn và quyền sử dụng ban đầu.

## 8. Checklist trước khi đưa tài nguyên vào bộ học

- [ ] URL thuộc nguồn chính thức và còn truy cập được.
- [ ] Đã đọc license/terms của **content, code, model weights và data** riêng biệt.
- [ ] Nếu chỉ được đọc: catalog lưu link, không lưu bản sao.
- [ ] Nếu được phép tái sử dụng: giữ attribution, copyright notice và license theo yêu cầu.
- [ ] Model/dataset có model card/dataset card và phiên bản cố định.
- [ ] Không có key, cookie, PII, giọng/ảnh chưa consent trong commit hoặc notebook output.
- [ ] Bài học yêu cầu người học tự code; source tham khảo chỉ được xem sau attempt đầu tiên.
- [ ] Mọi code lấy cảm hứng trực tiếp đều có citation; không đổi tên biến rồi coi là tự viết.
- [ ] Website deploy chỉ tải asset/model/data có quyền phân phối và phù hợp chính sách nhà cung cấp hosting.

## 9. Quy tắc “tự code 90%, AI 10%” khi dùng các nguồn trên

1. Đọc mục tiêu và công thức, đóng tài liệu rồi tự viết pseudocode.
2. Tự cài phiên bản tối giản và ít nhất ba test tính tay.
3. Chỉ mở implementation tham khảo sau khi bản tự viết đã chạy hoặc đã ghi rõ blocker.
4. Không hỏi AI xin lời giải, starter hoàn chỉnh, test ẩn hoặc sửa toàn bộ code.
5. Chỉ hỏi một nhận xét hẹp sau attempt, ví dụ: “Tôi cho rằng lỗi do mask ngược, nhận xét này đúng không?”. Không dán dữ liệu/key/đáp án kín.
6. Tự viết bản sửa và nhật ký: giả thuyết ban đầu, test bác bỏ/xác nhận, thay đổi cuối cùng.
7. Nếu đã xem lời giải đầy đủ, đánh dấu bài chưa đạt và làm lại bằng đề biến thể sau ít nhất 48 giờ.

Quy tắc này biến sách/docs thành công cụ kiểm chứng, không thành nguồn chép code; đúng với mục tiêu hiểu cơ chế trước khi học nâng cao và thi VOAI/IOAI.
