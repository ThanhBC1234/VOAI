# Lộ trình VOAI/IOAI 41 tuần cho học sinh lớp 11

> Thời gian: **15/08/2026–31/05/2027**, đúng **290 ngày = 41 tuần trọn vẹn + 3 ngày tổng kết**.
> Nhịp học: **Core 30 phút/ngày** hoặc **Deep 60 phút/ngày**.
> Cấu trúc bắt buộc mỗi tuần: **5 bài học + 1 lab + 1 checkpoint**.
> Nguyên tắc: **SOLO-90** (tự học/tự code/tự debug 90%) và **COACH-10** (AI chỉ kiểm tra/gợi mở tối đa 10%).

Hai checkpoint thi thử là ngoại lệ thời lượng có chủ đích: **180 phút ở tuần 32** và **360 phút ở tuần 38**. Các ngày còn lại vẫn theo nhịp Core 30/Deep 60; không tự kéo dài buổi học chỉ để bù tiến độ.

## 1. Đích đến và bằng chứng tốt nghiệp

Lộ trình phục vụ đồng thời hai mục tiêu:

1. Thi VOAI: đọc đề, dựng baseline nhanh, validation không rò rỉ, quản lý thí nghiệm, tạo submission và notebook Colab/Kaggle tái lập.
2. Làm dự án AI: hiểu nguyên lý, xây pipeline đầu-cuối, đánh giá đúng, làm demo, viết technical report/model card và bảo vệ lựa chọn.

Đến 31/05/2027, người học phải có bằng chứng chứ không chỉ “đã xem bài”:

- 205 bài học có sản phẩm code nhỏ (41 × 5).
- 41 lab chạy được.
- 41 checkpoint có điểm, lỗi gốc và lần sửa.
- 2 dự án theo modality, 1 mock sơ loại 180 phút, 1 mock chung kết 6 giờ, các block remediation và 1 capstone.
- 1 portfolio có notebook, tests, experiment ledger, report, model card và demo.
- 1 bài closed-book coding + oral defense đạt ít nhất 85/100.

## 2. Phạm vi chính thức và giới hạn phiên bản

Lộ trình bám [IOAI 2026 Syllabus chính thức](https://ioai-official.org/wp-content/uploads/2025/10/Syllabus.pdf): Foundational Skills & Classical ML; Neural Networks & Deep Learning; Computer Vision; NLP & Audio. Mọi mục trong syllabus được ánh xạ trong `IOAI_2026_SYLLABUS_COVERAGE` ở `content/curriculum.ts`.

[Quy chế VOAI do OLP đăng](https://www.olp.vn/olympic-ai-cho-h%E1%BB%8Dc-sinh/quy-ch%E1%BA%BF-n%E1%BB%99i-quy) cho biết VOAI theo đề cương IOAI. [Thông báo VOAI 2026](https://www.olp.vn/olympic-ai-cho-h%E1%BB%8Dc-sinh/th%C3%B4ng-b%C3%A1o-voai) là mốc gần nhất để luyện hai điều kiện thời gian: vòng sơ loại trắc nghiệm trên máy **180 phút** và vòng chung kết lập trình **6 giờ**. Lộ trình chỉ dùng hai mốc này để tạo sức bền và quy trình làm bài; **không khẳng định lịch, số bài, luật, cách chấm, ngưỡng chọn hay thời lượng VOAI 2027**. Tất cả các mục đó mang trạng thái `TBD` cho đến khi Ban Tổ chức công bố nguồn chính thức; khi có nguồn mới, phải lập bảng khác biệt rồi sửa runbook/mock, không bỏ nền tảng.

Ngoài syllabus, tuần 3 bổ sung toán cầu nối và tuần 39/41 bổ sung kỹ nghệ dự án. Các nội dung này được ghi “Bridge”, không giả vờ là mục thi chính thức.

## 3. Hợp đồng SOLO-90 / COACH-10

### Việc phải tự làm — SOLO-90

- Viết giả thuyết, pseudocode, code, tests, biểu đồ, error analysis và kết luận.
- Debug tối thiểu 20 phút: thu nhỏ lỗi, dự đoán nguyên nhân, tạo failing test, thử ít nhất hai cách sửa.
- Với thuật toán cốt lõi, phải có bản from-scratch được yêu cầu; không thay bằng một lệnh thư viện.
- Checkpoint: 20 phút đầu đóng tài liệu và không AI.
- Mọi code phải giải thích được từng shape, loss, metric, split và trade-off.

### AI chỉ được làm — COACH-10

- Xác nhận “đúng/chưa đúng” sau khi người học đã chốt đáp án.
- Đưa một phản ví dụ, một câu hỏi gợi mở hoặc chỉ tên khái niệm cần kiểm tra.
- Soát rubric/checklist, không viết lời giải, pseudocode đầy đủ hay code thay.

Prompt mặc định:

> Đây là giả thuyết, test và kết quả em tự làm. Hãy chỉ nói ĐÚNG/CHƯA ĐÚNG, nêu một phản ví dụ hoặc một câu hỏi gợi mở; không viết code thay em.

Nếu AI đưa code ngoài yêu cầu, đóng câu trả lời đó, không chép; quay lại failing test. Nhật ký học phải ghi số lần đã hỏi AI và câu hỏi đã hỏi.

## 4. Cách học mỗi ngày

### Core 30 phút

- 5 phút: retrieval — tự viết lại điều hôm qua mà không mở tài liệu.
- 10 phút: học một khái niệm, dự đoán output/shape trước khi chạy.
- 15 phút: tự code một lát cắt chạy được và một test.

### Deep 60 phút

Làm trọn Core, sau đó thêm 30 phút cho một trong bốn việc: phản ví dụ, unit/property test, benchmark/ablation, hoặc error analysis. Không dùng 30 phút thêm chỉ để xem video.

Ngoại lệ readiness không phải lịch học hằng ngày: checkpoint tuần 32 là một mock 180 phút liền mạch và checkpoint tuần 38 là một mock 6 giờ liền mạch. Phải đặt trước hai buổi này, nghỉ đúng cách và làm trên đề/dữ liệu luyện hợp pháp. Nếu sức khỏe hoặc lịch học không cho phép, dời nguyên khối; không chẻ nhỏ rồi vẫn gọi đó là bằng chứng sức bền thi.

### Ngày 6 — Lab

- 5 phút viết hypothesis và acceptance tests.
- 20/50 phút tự code một vertical slice.
- 5 phút lưu evidence: commit, tests, metric, lỗi còn lại.

### Ngày 7 — Checkpoint

- 20 phút closed-book, không AI.
- 5 phút chạy tests/chấm rubric.
- 5 phút viết lỗi gốc và kế hoạch sửa.
- Ở chế độ Deep: thêm biến thể ẩn, oral defense hoặc code lại từ trang trắng.

## 5. Rubric chung và quy tắc qua cổng

| Thành phần | Điểm | Bằng chứng |
|---|---:|---|
| Hiểu lý thuyết | 25 | giải thích, tính tay, dự đoán failure mode |
| Implementation | 45 | code tự viết, tests, shape/device/data contracts |
| Evaluation | 20 | split/metric/baseline/ablation/error analysis |
| Reflection | 10 | lỗi gốc, giới hạn, bước tiếp theo |

Mặc định đạt từ 70/100; các cổng backprop/attention/dự án yêu cầu 80–85. **Tự động trượt** nếu notebook không Run all, submission sai schema, có leakage, không giải thích được code, hoặc claim vượt bằng chứng. Học sinh sửa đúng mục trượt rồi thi biến thể mới; không làm lại y hệt để học thuộc.

## 6. Bảy chặng và milestones

| Chặng | Tuần | Đầu ra chính | Milestone |
|---|---:|---|---|
| Nền móng | 1–4 | Python, dữ liệu, toán, baseline | M1: pipeline sạch, không leakage |
| Classical ML | 5–14 | thuật toán từ đầu + dự án bảng/chuỗi | M2: dự án ML + blind challenge |
| Deep Learning | 15–22 | PyTorch, backprop, attention, transformer | M3: tự viết loop/cốt lõi, fine-tune nhỏ |
| Computer Vision | 23–31 | CNN, ResNet, detection, U-Net, generative, CLIP | M4: dự án CV có bảo vệ |
| NLP & Audio | 32–38 | text, BERT, LM, seq2seq, LLM, HuBERT/ASR | R1 trước 01/04: mock 180 phút; M5/R2 trước 08/05: benchmark + mock 6 giờ |
| Tích hợp | 39 | time-series/video/multimodal | Pipeline thiếu modality vẫn chạy |
| VOAI & capstone | 40–41 + 3 ngày | remediation, rules-diff, release, defense | M6: capstone + portfolio + closed-book |

## 7. Lộ trình chi tiết 41 tuần

Mỗi dòng “B1…B5” là năm phiên liên tiếp; sau đó Lab và Checkpoint. Tên artifact chuẩn nằm ở cuối tuần để web/notebook grader cùng dùng.

### Chặng 1 — Nền móng

#### Tuần 01 · 15/08–21/08/2026 · Python cho người đã biết C++

- Tiên quyết: biến/vòng lặp/hàm/STL C++; Python hoặc Colab.
- Mục tiêu: Python cơ bản, hàm thuần + assert, notebook không state ẩn. Syllabus: Python Basics (Practice).
- B1 Cú pháp và kiểu dữ liệu; B2 loop/comprehension; B3 hàm/scope/type hints; B4 CSV/JSON/exception; B5 notebook tái lập.
- Lab: mini EDA thuần Python; phải Run all, có ≥10 assert. Checkpoint: quiz + code hai hàm + debug stateful notebook, đạt ≥70.
- Deliverable: `w01_python_bridge.ipynb` + nhật ký lỗi.

#### Tuần 02 · 22/08–28/08/2026 · NumPy, Pandas, Tensor và visualization

- Tiên quyết: tuần 1. Mục tiêu: shape/dtype/broadcast, DataFrame sạch, biểu đồ trả lời câu hỏi.
- B1 ndarray/axis; B2 broadcasting/vectorization; B3 Pandas + missing; B4 groupby/join/ragged; B5 Matplotlib/Seaborn.
- Lab: tìm và sửa 5 lỗi chất lượng dữ liệu. Checkpoint: 10 câu shape + 3 bug Pandas + vectorization, đạt ≥75; câu shape phải đúng 100%.
- Deliverable: `w02_data_detective.ipynb`.

#### Tuần 03 · 29/08–04/09/2026 · Toán vừa đủ để hiểu mô hình

- Tiên quyết: đại số THPT + NumPy. Mục tiêu: vector/matrix, Bayes/thống kê, gradient/chain rule.
- B1 norm/dot/cosine; B2 matrix transformation; B3 conditional probability/Bayes; B4 expectation/variance; B5 derivative/gradient.
- Lab: trực quan dot product, Bayes, gradient. Checkpoint: tính tay + gradient check + giải thích Bayes, đạt ≥70.
- Deliverable: `w03_math_visual.ipynb` + formula sheet tự viết.

#### Tuần 04 · 05/09–11/09/2026 · Pipeline dữ liệu và baseline

- Tiên quyết: tuần 1–3. Mục tiêu: split đúng, transformation fit train-only, metric theo mục tiêu.
- B1 framing/metric; B2 leakage/split; B3 impute/encode/scale; B4 feature + baseline; B5 experiment ledger.
- Lab: sklearn pipeline không leakage. Checkpoint: audit pipeline + submission CSV + vấn đáp, đạt ≥75.
- Deliverable: `w04_baseline_pipeline.ipynb`, `experiment.csv`. **M1: baseline tái lập, không leakage.**

### Chặng 2 — Học máy cổ điển

#### Tuần 05 · 12/09–18/09/2026 · Linear Regression

- Tiên quyết: matrix/gradient/pipeline. Mục tiêu: MSE/MAE, gradient descent, residual diagnosis.
- B1 y=Xw+b; B2 MSE/MAE; B3 gradient; B4 pseudo-inverse; B5 residual plots.
- Lab: house-price regression from scratch + sklearn. Checkpoint: suy gradient, code predict/loss/train, đọc residual, đạt ≥75.
- Deliverable: `w05_linear_regression.ipynb`.

#### Tuần 06 · 19/09–25/09/2026 · Logistic Regression và metrics

- Tiên quyết: tuần 5 + xác suất. Mục tiêu: sigmoid/log-loss, confusion/ROC/PR, threshold trên validation.
- B1 logit/sigmoid ổn định; B2 BCE; B3 confusion/precision/recall/F1; B4 ROC-AUC/PR-AUC; B5 calibration/threshold.
- Lab: imbalanced classifier. Checkpoint: metric tính tay + chọn metric + debug threshold leakage, đạt ≥80.
- Deliverable: `w06_logistic_metrics.ipynb`.

#### Tuần 07 · 26/09–02/10/2026 · Regularization, bias–variance, CV và tuning

- Tiên quyết: tuần 5–6. Mục tiêu: chẩn đoán learning curves, L1/L2, CV đúng cấu trúc, search không leakage.
- B1 bias–variance; B2 L2; B3 L1; B4 KFold/Stratified/Group/TimeSeries; B5 grid/random search.
- Lab: model selection tournament, chỉ mở locked test một lần. Checkpoint: chẩn đoán curve + thiết kế CV + giải thích L1/L2, đạt ≥75.
- Deliverable: `w07_model_selection.ipynb`.

#### Tuần 08 · 03/10–09/10/2026 · K-NN và SVM

- Tiên quyết: distance/dot/scaling/CV. Mục tiêu: K-NN from scratch, maximum margin, kernel/C/gamma.
- B1 distance + curse of dimensionality; B2 K-NN; B3 margin/support vectors; B4 RBF kernel; B5 benchmark cost.
- Lab: boundary explorer. Checkpoint: code K-NN + vẽ margin + chọn model theo constraint, đạt ≥75; pipeline phải scale.
- Deliverable: `w08_knn_svm.ipynb`.

#### Tuần 09 · 10/10–16/10/2026 · Decision Trees

- Tiên quyết: classification metrics + entropy. Mục tiêu: Gini/entropy, best split, recursive tree/pruning.
- B1 impurity; B2 best split; B3 recursive tree; B4 overfit/pruning; B5 interpretability limits.
- Lab: cây NumPy depth-limited có tests. Checkpoint: tính split + trace prediction + diagnosis, đạt ≥75.
- Deliverable: `w09_decision_tree.ipynb`.

#### Tuần 10 · 17/10–23/10/2026 · Ensembles

- Tiên quyết: trees + bias–variance. Mục tiêu: bagging/RF/boosting, OOB/CV, Pareto điểm–time–memory.
- B1 bootstrap/bagging; B2 Random Forest; B3 residual boosting; B4 gradient boosting; B5 resource budget.
- Lab: tabular leaderboard với ba ensemble và ablation. Checkpoint: phân biệt cơ chế + đọc ablation + chọn theo constraint, đạt ≥75.
- Deliverable: `w10_ensembles.ipynb`, `model_card.md`.

#### Tuần 11 · 24/10–30/10/2026 · K-Means

- Tiên quyết: distance/scaling. Mục tiêu: Lloyd algorithm, k-means++, k/stability/failure modes.
- B1 objective; B2 assign/update; B3 initialization; B4 elbow/silhouette; B5 non-convex/outlier/scale failures.
- Lab: segmentation khách hàng có stability. Checkpoint: tính một iteration + code + chẩn đoán dataset, đạt ≥75.
- Deliverable: `w11_kmeans.ipynb`.

#### Tuần 12 · 31/10–06/11/2026 · PCA, t-SNE, UMAP

- Tiên quyết: matrix/variance/scaling. Mục tiêu: PCA from SVD, explained variance, diễn giải embedding 2D có cảnh giác.
- B1 projection; B2 eigen/SVD; B3 explained variance; B4 t-SNE; B5 UMAP + original-space checks.
- Lab: embedding atlas nhiều seed. Checkpoint: trace PCA + chọn chiều + phản biện plot, đạt ≥75.
- Deliverable: `w12_dimensionality.ipynb`.

#### Tuần 13 · 07/11–13/11/2026 · DBSCAN, Hierarchical, Spectral

- Tiên quyết: K-Means/PCA. Mục tiêu: density/noise, dendrogram/linkage, spectral cho cụm phi lồi.
- B1 DBSCAN; B2 k-distance/eps; B3 hierarchical; B4 spectral; B5 chọn thuật toán.
- Lab: benchmark 4 thuật toán × 5 toy datasets nhỏ để vừa phiên 60 phút; mở rộng kích thước ở phiên dự án. Checkpoint: core/border/noise + dendrogram + lựa chọn 4 tình huống, đạt ≥75.
- Deliverable: `w13_clustering_arena.ipynb`.

#### Tuần 14 · 14/11–20/11/2026 · Dự án 1 — Tabular/Time-series

- Tiên quyết: tuần 4–13. Mục tiêu: baseline ≤30 phút, tối đa 12 trials có log, report tái lập.
- B1 framing/data audit; B2 validation/baseline; B3 feature hypotheses; B4 ensemble sprint; B5 error analysis/report.
- Lab: blind mini-competition. Checkpoint: fresh runtime demo + oral defense + thích nghi metric, đạt ≥80.
- Deliverable: `project_01_tabular/`. **M2: dự án ML đầu-cuối và blind challenge đầu tiên.**

### Chặng 3 — Mạng nơ-ron và học sâu

#### Tuần 15 · 21/11–27/11/2026 · PyTorch, Tensor, CPU/GPU

- Tiên quyết: NumPy + gradient. Mục tiêu: tensor/autograd/device, Dataset/DataLoader, loop/checkpoint tái lập.
- B1 dtype/device; B2 autograd; B3 Dataset/DataLoader; B4 train/eval loop; B5 checkpoint/seed.
- Lab: reusable training template. Checkpoint: sửa shape/device bugs + viết loop từ skeleton + giải thích autograd, đạt ≥80.
- Deliverable: `w15_pytorch_template.ipynb`, `train_utils.py`.

#### Tuần 16 · 28/11–04/12/2026 · Perceptron, activation và loss

- Tiên quyết: PyTorch + logistic regression. Mục tiêu: perceptron, ReLU/Sigmoid/Tanh, output–loss contract.
- B1 perceptron/XOR; B2 sigmoid/tanh; B3 ReLU; B4 MSE/MAE; B5 logits/BCE/CE.
- Lab: activation/loss playground. Checkpoint: trace forward + ghép loss + stable CE, đạt ≥80.
- Deliverable: `w16_neuron_playground.ipynb`.

#### Tuần 17 · 05/12–11/12/2026 · GD, SGD, Adam/AdamW và learning rate

- Tiên quyết: gradient + loop. Mục tiêu: optimizer dynamics, schedules, weight initialization/convergence.
- B1 batch/SGD/mini-batch; B2 momentum; B3 Adam/AdamW; B4 LR schedules; B5 zero/Xavier/He.
- Lab: optimizer race nhiều seed. Checkpoint: tính update + đọc curves + sửa non-convergence, đạt ≥75.
- Deliverable: `w17_optimizer_race.ipynb`.

#### Tuần 18 · 12/12–18/12/2026 · Backpropagation và MLP from scratch

- Tiên quyết: activation/loss + gradient check. Mục tiêu: computational graph, dense backward, MLP NumPy/PyTorch.
- B1 graph/local derivatives; B2 dense backward; B3 activation/loss backward; B4 NumPy MLP; B5 PyTorch MLP.
- Lab: micrograd-style MLP có unit/gradient tests. Checkpoint: derivation + backward code + oral chain rule, đạt ≥85.
- Deliverable: `w18_mlp_from_scratch.ipynb` + tests.

#### Tuần 19 · 19/12–25/12/2026 · Regularization và BatchNorm

- Tiên quyết: MLP + bias–variance. Mục tiêu: weight decay/dropout/early stop/BN và ablation.
- B1 weight decay; B2 dropout; B3 early stopping; B4 batch norm train/eval; B5 controlled ablation.
- Lab: cứu MLP overfit. Checkpoint: đọc curves + sửa mode bug + chọn technique, đạt ≥75.
- Deliverable: `w19_regularization.ipynb`.

#### Tuần 20 · 26/12/2026–01/01/2027 · Embeddings, pooling, autoencoder

- Tiên quyết: MLP + tensor shapes. Mục tiêu: embedding lookup/patch, max/avg pooling, AE + linear probe.
- B1 lookup; B2 text/image/audio patch embeddings; B3 pooling; B4 autoencoder; B5 representation evaluation.
- Lab: representation zoo (raw/PCA/AE). Checkpoint: trace shape + chọn pooling + bottleneck reasoning, đạt ≥75.
- Deliverable: `w20_representations.ipynb`.

#### Tuần 21 · 02/01–08/01/2027 · Attention

- Tiên quyết: dot product + embeddings + softmax. Mục tiêu: scaled attention, masks, multi-head.
- B1 Q/K/V; B2 scaling/softmax; B3 padding/causal masks; B4 multi-head; B5 interpretation limits.
- Lab: attention microscope. Checkpoint: tính matrix + code mask + trace shapes, đạt ≥85; toàn bộ mask tests phải pass.
- Deliverable: `w21_attention.ipynb`.

#### Tuần 22 · 09/01–15/01/2027 · Transformer và fine-tuning

- Tiên quyết: attention + PyTorch. Mục tiêu: encoder/decoder/position, full fine-tune và PEFT/LoRA.
- B1 encoder block; B2 causal decoder; B3 positional info; B4 full/frozen fine-tuning; B5 PEFT.
- Lab: tiny transformer adaptation. Checkpoint: vẽ block + trace mask + chọn full/PEFT, đạt ≥80.
- Deliverable: `w22_transformer_finetune.ipynb`. **M3: tự viết loop/cốt lõi và fine-tune transformer nhỏ.**

### Chặng 4 — Computer Vision

#### Tuần 23 · 16/01–22/01/2027 · Ảnh, convolution và augmentation

- Tiên quyết: tensor/pooling/PyTorch. Mục tiêu: HWC/CHW, conv/receptive field, patching và train-only augmentation.
- B1 image contracts; B2 conv from scratch; B3 feature maps; B4 pooling/patching; B5 valid augmentation.
- Lab: CNN shape explorer. Checkpoint: output shape + kernel trace + augmentation audit, đạt ≥80; shape đúng 100%.
- Deliverable: `w23_convolution.ipynb`.

#### Tuần 24 · 23/01–29/01/2027 · Image Classification và ResNet

- Tiên quyết: convolution + fine-tuning. Mục tiêu: tiny CNN, residual block, pretrained ResNet, per-class errors.
- B1 pipeline; B2 residual connections; B3 linear probe; B4 freeze/unfreeze; B5 error gallery.
- Lab: species classifier. Checkpoint: baseline 30 phút + preprocessing bug + residual oral, đạt ≥75.
- Deliverable: `w24_image_classifier.ipynb`.

#### Tuần 25 · 30/01–05/02/2027 · Object Detection

- Tiên quyết: CNN + box geometry. Mục tiêu: box/IoU/matching/NMS/mAP; YOLO, SSD, DETR (PDF ghi DERT).
- B1 box formats/IoU; B2 matching; B3 NMS; B4 architecture trade-offs; B5 mAP/error taxonomy.
- Lab: detector pretrained, fine-tune số batch/epoch cố định trên tiny subset rồi báo mAP/latency. Checkpoint: code IoU/NMS + trace matching + AP, đạt ≥75; geometry tests phải pass.
- Deliverable: `w25_object_detection.ipynb`.

#### Tuần 26 · 06/02–12/02/2027 · Segmentation với U-Net

- Tiên quyết: CNN + geometry. Mục tiêu: mask contracts, U-Net, Dice/IoU, paired augmentation.
- B1 mask/task types; B2 U-Net; B3 segmentation losses; B4 paired transforms; B5 metrics/postprocess.
- Lab: road-mask U-Net. Checkpoint: shape + Dice + mask pipeline audit, đạt ≥75.
- Deliverable: `w26_unet_segmentation.ipynb`.

#### Tuần 27 · 13/02–19/02/2027 · GAN

- Tiên quyết: CNN + optimization. Mục tiêu: DCGAN loop, detach/gradient flow, mode collapse/evaluation.
- B1 minimax; B2 G/D modules; B3 update loop; B4 instability; B5 non-cherry-picked evaluation/ethics.
- Lab: small-image GAN. Checkpoint: trace detach + sửa update + collapse diagnosis, đạt ≥70.
- Deliverable: `w27_gan.ipynb`, `responsible_use.md`.

#### Tuần 28 · 20/02–26/02/2027 · Self-Supervised Vision

- Tiên quyết: ResNet + augmentation + embeddings. Mục tiêu: paired views, contrastive loss, pretrain + linear probe.
- B1 pretext/shortcut; B2 positive/negative pairs; B3 contrastive loss; B4 pretraining; B5 label-efficiency probe.
- Lab: toy SSL run ngắn, sau đó linear probe trên embeddings đã cache; full pretrain là mở rộng ngoài phiên 60 phút. Checkpoint: chọn augment + trace batch + đọc probe table, đạt ≥70.
- Deliverable: `w28_vision_ssl.ipynb`.

#### Tuần 29 · 27/02–05/03/2027 · CLIP và vision–text

- Tiên quyết: embeddings + attention + image classification. Mục tiêu: dual encoder, prompts, zero-shot, retrieval.
- B1 dual towers; B2 contrastive alignment; B3 zero-shot prompts; B4 Recall@K retrieval; B5 bias/domain shift.
- Lab: CLIP semantic search Việt/Anh. Checkpoint: similarity + prompts + error analysis, đạt ≥70.
- Deliverable: `w29_clip_retrieval.ipynb`.

#### Tuần 30 · 06/03–12/03/2027 · Diffusion Models

- Tiên quyết: probability + U-Net + generative model. Mục tiêu: noising, denoising, sampling, conditioning, safety.
- B1 forward process; B2 noise objective; B3 sampling; B4 guidance; B5 prompt×seed evaluation.
- Lab: diffusion parameter studio. Checkpoint: trace forward + chọn sampling budget + phản biện gallery, đạt ≥70.
- Deliverable: `w30_diffusion.ipynb`.

#### Tuần 31 · 13/03–19/03/2027 · Dự án 2 — CV competition sprint

- Tiên quyết: tuần 23–30. Mục tiêu: data audit, pretrained baseline, tối đa 10 ablations, reproducible package.
- B1 duplicate/group split; B2 baseline; B3 augmentation/finetune ablation; B4 error-driven fix; B5 package/report.
- Lab: blind CV challenge. Checkpoint: fresh runtime + oral + live preprocessing fix, đạt ≥80.
- Deliverable: `project_02_cv/`. **M4: dự án CV thi đấu và bảo vệ pipeline.**

### Chặng 5 — NLP và Audio

#### Tuần 32 · 20/03–26/03/2027 · Text processing và classification

- Tiên quyết: embeddings + metrics. Mục tiêu: Unicode/token/vocab/OOV, padding/masks, TF-IDF, neural baseline và cổng luyện sơ loại trước tháng 4.
- B1 normalization; B2 token/vocab; B3 padding/truncation/mask; B4 TF-IDF; B5 embedding+pooling.
- Lab: Vietnamese text classifier.
- Checkpoint ngoại lệ: làm một mạch mock trắc nghiệm trên máy **180 phút**, đóng tài liệu, theo định dạng VOAI 2026 chỉ để luyện; chấm theo miền và lập error ledger. Ngưỡng nội bộ 75/100 và mỗi miền 60% chỉ là gate học tập, **không phải ngưỡng chọn VOAI 2027**.
- Deliverable: `w32_text_classification.ipynb` + `readiness/preliminary_reference_2026/scorecard.md`. **R1 trước 01/04/2027: hoàn thành mock; mọi thông số VOAI 2027 vẫn TBD.**

#### Tuần 33 · 27/03–02/04/2027 · BERT

- Tiên quyết: transformer + text pipeline. Mục tiêu: MLM/bidirectional, special tokens, CLS/mean pooling, tuning.
- B1 architecture/pretraining; B2 tokenizer/masks; B3 pooling; B4 frozen/full; B5 error/bias slices.
- Lab: frozen vs fine-tuned BERT. Checkpoint: trace inputs + phân biệt BERT/causal LM + tuning choice, đạt ≥75.
- Deliverable: `w33_bert.ipynb`.

#### Tuần 34 · 03/04–09/04/2027 · Language Modeling

- Tiên quyết: decoder + tokenization. Mục tiêu: next-token data, CE/perplexity, sampling, hallucination evaluation.
- B1 n-gram; B2 shifted targets; B3 perplexity; B4 temperature/top-k/top-p; B5 factuality/safety rubric.
- Lab: tiny Vietnamese LM. Checkpoint: trace batch + perplexity + sampler, đạt ≥80.
- Deliverable: `w34_language_model.ipynb`.

#### Tuần 35 · 10/04–16/04/2027 · Encoder–Decoder, MT và VLM

- Tiên quyết: attention + LM. Mục tiêu: seq2seq/masks, teacher forcing, beam search, BLEU/chrF + human checks.
- B1 data flow; B2 teacher forcing/BOS/EOS; B3 decoding; B4 MT metrics; B5 captioning/hallucinated objects.
- Lab: translation/captioning. Checkpoint: trace masks + toy beam search + metric choice, đạt ≥75.
- Deliverable: `w35_encoder_decoder.ipynb`.

#### Tuần 36 · 17/04–23/04/2027 · Pre-trained Language Models

- Tiên quyết: LM + evaluation. Mục tiêu: open-source/API adapter, structured output, fixed eval, cost/safety.
- B1 model/API contract; B2 prompt baseline; B3 JSON schema/retry; B4 local inference; B5 blind evaluation.
- Lab: LLM evaluator, không phải LLM làm bài hộ. Checkpoint: parser + eval design + reproducibility, đạt ≥75.
- Deliverable: `w36_pretrained_lm.ipynb`, `eval_cases.json`.

#### Tuần 37 · 24/04–30/04/2027 · Audio processing và HuBERT

- Tiên quyết: signals cơ bản + embeddings. Mục tiêu: waveform/resample, STFT/spectrogram, ragged masks, HuBERT.
- B1 sample rate/channels; B2 framing/STFT; B3 audio augmentation; B4 collate/mask; B5 encoder embeddings.
- Lab: sound embedding explorer. Checkpoint: duration + STFT shape + padding mask, đạt ≥75.
- Deliverable: `w37_audio_hubert.ipynb`.

#### Tuần 38 · 01/05–07/05/2027 · Whisper, Qwen-Audio, Voxtral

- Tiên quyết: audio + seq2seq/eval. Mục tiêu: ASR, WER/CER, chunking, audio-language models, privacy/bias và một full mock trước cửa sổ giữa tháng 5.
- B1 Whisper; B2 edit-distance WER/CER; B3 long/noisy audio; B4 Qwen-Audio/Voxtral; B5 slices/safety.
- Lab: Vietnamese ASR benchmark.
- Checkpoint ngoại lệ: làm một mạch mock lập trình **6 giờ** gồm ML/CV/NLP theo định dạng VOAI 2026 chỉ để luyện; nộp submission, notebook Colab/Kaggle chạy sạch, report và ledger cho từng track. Ngưỡng 80/100 là gate nội bộ; format VOAI 2027 vẫn TBD.
- Deliverable: `w38_audio_models.ipynb`, `benchmark.csv`, `readiness/final_reference_2026/`. **M5/R2 trước 08/05/2027: NLP/Audio benchmark + full mock 6 giờ.**

### Chặng 6–7 — Tích hợp, VOAI và capstone

#### Tuần 39 · 08/05–14/05/2027 · Time-series, video, multimodal

- Tiên quyết: preprocessing + CNN/transformer/audio. Mục tiêu: time split/window, irregular/missing data, video sampling, fusion/fallback.
- B1 temporal split; B2 imputation/indicators; B3 frame/clip sampling; B4 early/late fusion; B5 missing modality.
- Lab: mini-project ≥2 modalities. Checkpoint: leakage audit + fusion shapes + missing-modality fix, đạt ≥75.
- Deliverable: `w39_multimodal.ipynb`.

#### Tuần 40 · 15/05–21/05/2027 · VOAI remediation và thích nghi thông báo chính thức

- Tiên quyết: tuần 1–39, R1 tuần 32, R2 tuần 38 và hai dự án đã bảo vệ. Mục tiêu: đóng ba lỗ hổng lớn nhất, tái chạy block yếu và chỉ đổi runbook theo nguồn VOAI 2027 chính thức.
- B1 audit hai scorecard; B2 ML remediation 60 phút; B3 CV remediation 60 phút; B4 NLP remediation 60 phút; B5 lập bảng `mốc VOAI 2026 tham chiếu ↔ thông báo VOAI 2027`, hoặc ghi nguyên trạng `TBD` nếu chưa có nguồn.
- Lab: ba block retest có raw→submission và evidence. Checkpoint: judge notebook, vấn đáp rules-diff/TBD và reproduce một run, đạt ≥80.
- Deliverable: `readiness/remediation/` gồm scorecards, ba block retests, `rules-diff.md`, submissions và report. Đây không phải mock duy nhất và không được dùng để trì hoãn readiness tới giữa tháng 5.

#### Tuần 41 · 22/05–28/05/2027 · Capstone và portfolio

- Tiên quyết: tuần 1–40 + vấn đề/dữ liệu hợp pháp. Mục tiêu: project contract, raw→eval pipeline, demo, report/model card, defense.
- B1 spec/non-goals; B2 reproducible pipeline; B3 interactive demo; B4 report/model card; B5 defense rehearsal.
- Lab: release candidate. Checkpoint: demo + code walkthrough + judge Q&A + reproduce metric, đạt ≥85.
- Deliverable: `capstone/` + portfolio index. **M6: release candidate sẵn sàng bảo vệ và hồ sơ readiness truy xuất được qua R1/R2/remediation.**

## 8. Ba ngày cuối — 29/05–31/05/2027

1. **Ngày 288 — Coverage audit:** mở bằng chứng cho từng mục IOAI 2026; chọn ba lỗ hổng thật, làm lại checkpoint yếu nhất nếu học Deep.
2. **Ngày 289 — Closed-book coding & oral defense:** 20 phút code, 5 phút tests, 5 phút giải thích; Deep làm biến thể ẩn. Đạt ≥85 và không qua nếu không giải thích code.
3. **Ngày 290 — Release & retrospective:** fresh-run, đóng release, viết retrospective và kế hoạch 90 ngày dựa trên thông báo VOAI/IOAI mới nhất.

## 9. Prerequisite graph và cơ chế hồi phục

- Không hiểu shape/axis → quay tuần 2 trước PyTorch/CV/attention.
- Không gradient-check được → quay tuần 3/5 trước backprop.
- Không dựng split chống leakage → quay tuần 4/7 trước mọi competition project.
- Không viết được PyTorch loop → quay tuần 15 trước modality model.
- Không qua mask tests → quay tuần 21/32 trước transformer/LM/audio.
- Project không Run all → sửa reproducibility trước khi tuning thêm.

Không “bù” hai ngày bằng một phiên 2 giờ. Nếu nghỉ, tiếp tục đúng phiên còn thiếu; ngày lịch trên web là mốc kế hoạch, còn tiến độ phải dựa artifact/checkpoint. Mỗi 4–5 tuần có thể dùng Deep extension để sửa nợ, nhưng vẫn giữ Core mỗi ngày. Chỉ R1 180 phút và R2 360 phút là ngoại lệ đã định trước; dời nguyên khối nếu cần, không biến mọi cuối tuần thành marathon.

## 10. Cấu trúc deliverable chuẩn

Mỗi lab/project nên có:

```text
artifact/
├── README.md              # vấn đề, cách chạy, kết quả xác minh
├── solution.ipynb         # restart + Run all
├── src/                   # code tái dùng nếu cần
├── tests/                 # shape/data/metric contracts
├── experiment.csv         # seed, config, metric, cost, note
├── report.md              # baseline, ablation, error analysis
└── model_card.md          # data, metric, giới hạn, rủi ro
```

Checklist nộp bài kiểu VOAI:

- Chỉ dùng dữ liệu được phép; test không tham gia train/tuning.
- Pipeline tự chạy từ raw data đến submission.
- Submission đúng số dòng, ID/order/schema, không NaN.
- Không gán nhãn test thủ công, không chỉnh prediction bằng tay.
- Notebook chạy hoàn toàn trên môi trường được yêu cầu; không lệ thuộc cell ẩn/path cục bộ.
- Lần nộp có hypothesis và được ghi ledger; không dò leaderboard vô hướng.
- Technical report khớp đúng code/config của lần chọn.

## 11. Sách và tài nguyên nên dùng

Ưu tiên nguồn miễn phí/chính thức; không cần đọc tuyến tính từ đầu đến cuối:

- *Dive into Deep Learning* — tra cứu toán, MLP, CNN, attention/transformer.
- *An Introduction to Statistical Learning* — classical ML, evaluation, regularization.
- scikit-learn User Guide — pipeline, model selection, metrics, algorithms.
- PyTorch Tutorials — tensors, autograd, datasets, training, transfer learning.
- Hugging Face Course/docs — transformers, tokenizers, fine-tuning, audio/CV models.
- Syllabus/đề IOAI và quy chế/thông báo VOAI — nguồn quyết định phạm vi thi; kiểm tra bản mới trước R1, R2 và mọi lần sửa `rules-diff.md`.

Không dùng sách như bằng chứng đã thành thạo. Bằng chứng luôn là code, tests, experiment, checkpoint và phần giải thích của chính người học.

## 12. Dữ liệu TypeScript cho website/grader

`content/curriculum.ts` export:

- `WEEKLY_CURRICULUM`: 41 tuần, mỗi tuần có prerequisite, objectives, đúng 5 lessons, lab, checkpoint, deliverable, assessment và milestone.
- `IOAI_2026_SYLLABUS_COVERAGE`: ma trận toàn bộ mục syllabus → tuần học.
- `generateCurriculumSessions()`: sinh 290 phiên ngày ISO liên tục.
- `CURRICULUM_SESSIONS`: dữ liệu đã sinh để render calendar/dashboard.
- `CURRICULUM_SUMMARY`, `MILESTONES`, `STUDY_CONTRACT`: số liệu và guardrails dùng chung.

Các invariant cần được test khi tích hợp:

```text
start = 2026-08-15
end = 2027-05-31
weeks = 41
lessons = 205
labs = 41
checkpoints = 41
finale = 3
sessions = 290
mọi ngày ISO liên tục, không trùng/khuyết
```
