export type WeekLectureLink = { id: string; label: string };

export const WEEK_LECTURES: Readonly<Record<number, readonly WeekLectureLink[]>> = {
  1: [{ id: "foundation-python", label: "Python cho thí nghiệm tái lập" }],
  2: [
    { id: "foundation-numpy-tensors", label: "NumPy, tensor và broadcasting" },
    { id: "foundation-pandas-visualization", label: "Pandas và trực quan hóa" },
  ],
  3: [
    { id: "foundation-math-linear-algebra", label: "Đại số tuyến tính" },
    { id: "foundation-math-calculus-probability", label: "Vi tích phân, xác suất và thống kê" },
  ],
  4: [
    { id: "ds-data-processing", label: "Data processing" },
    { id: "foundation-sklearn-pipeline", label: "Pipeline và baseline chống leakage" },
  ],
  5: [{ id: "ml-linear-regression", label: "Linear Regression" }],
  6: [
    { id: "ml-logistic-regression", label: "Logistic Regression" },
    { id: "ds-metrics", label: "Metric hồi quy và phân lớp" },
    { id: "ds-confusion-roc-pr", label: "Confusion matrix, ROC và PR" },
  ],
  7: [
    { id: "ml-l1-l2-regularization", label: "L1, L2 và bias–variance" },
    { id: "ds-underfit-overfit", label: "Underfitting và overfitting" },
    { id: "ds-cross-validation", label: "Cross-validation" },
    { id: "ds-hyperparameter-tuning", label: "Tuning có ngân sách" },
  ],
  8: [
    { id: "ml-knn", label: "k-Nearest Neighbors" },
    { id: "ml-svm", label: "Support Vector Machine" },
  ],
  9: [{ id: "ml-decision-tree", label: "Decision Tree" }],
  10: [
    { id: "ml-bagging-random-forest", label: "Bagging và Random Forest" },
    { id: "ml-gradient-boosting", label: "Gradient Boosting" },
  ],
  11: [{ id: "ml-kmeans", label: "K-Means" }],
  12: [
    { id: "ml-pca", label: "PCA" },
    { id: "ml-tsne", label: "t-SNE" },
    { id: "ml-umap", label: "UMAP" },
  ],
  13: [
    { id: "ml-dbscan", label: "DBSCAN" },
    { id: "ml-hierarchical-clustering", label: "Hierarchical clustering" },
    { id: "ml-spectral-clustering", label: "Spectral clustering" },
  ],
  14: [
    { id: "ds-feature-engineering", label: "Feature engineering" },
    { id: "foundation-sklearn-pipeline", label: "Pipeline chống leakage" },
    { id: "ds-metrics", label: "Chọn metric" },
  ],
  15: [{ id: "foundation-pytorch-autograd-device", label: "PyTorch, autograd và device" }],
  16: [
    { id: "dl-perceptron", label: "Perceptron" },
    { id: "dl-activation-functions", label: "Activation functions" },
    { id: "dl-loss-functions", label: "Loss functions" },
  ],
  17: [
    { id: "dl-gradient-descent", label: "Gradient Descent" },
    { id: "dl-sgd-minibatch", label: "SGD và mini-batch" },
    { id: "dl-adam-adamw", label: "Adam và AdamW" },
    { id: "dl-learning-rate-convergence", label: "Learning rate và hội tụ" },
  ],
  18: [
    { id: "dl-backpropagation", label: "Backpropagation" },
    { id: "dl-mlp", label: "Multi-Layer Perceptron" },
  ],
  19: [
    { id: "dl-regularization", label: "Regularization" },
    { id: "dl-weight-initialization", label: "Khởi tạo trọng số" },
    { id: "dl-batch-normalization", label: "Batch Normalization" },
  ],
  20: [
    { id: "dl-embeddings", label: "Embeddings" },
    { id: "dl-pooling", label: "Pooling" },
    { id: "dl-autoencoder", label: "Autoencoder" },
  ],
  21: [{ id: "dl-attention", label: "Attention và masking" }],
  22: [
    { id: "dl-transformer", label: "Transformer" },
    { id: "dl-finetuning", label: "Fine-tuning" },
  ],
  23: [
    { id: "cv-01-convolution", label: "Convolution 2D" },
    { id: "cv-08-augmentation", label: "Image augmentation" },
  ],
  24: [
    { id: "cv-02-image-classification", label: "Image classification" },
    { id: "cv-07-resnet-transfer", label: "ResNet và transfer learning" },
  ],
  25: [
    { id: "cv-03-yolo", label: "YOLO" },
    { id: "cv-04-ssd", label: "SSD" },
    { id: "cv-05-detr", label: "DETR" },
  ],
  26: [{ id: "cv-06-unet", label: "U-Net" }],
  27: [{ id: "cv-09-gan", label: "GAN" }],
  28: [{ id: "cv-10-self-supervised", label: "Self-supervised vision" }],
  29: [
    { id: "cv-13-vision-transformer", label: "Vision Transformer" },
    { id: "cv-11-clip", label: "CLIP" },
  ],
  30: [{ id: "cv-12-diffusion", label: "Diffusion models" }],
  31: [
    { id: "cv-02-image-classification", label: "Pipeline phân loại ảnh" },
    { id: "cv-05-detr", label: "Detection theo tập hợp" },
    { id: "cv-06-unet", label: "Segmentation" },
  ],
  32: [
    { id: "nlp-01-tokenization-embeddings", label: "Tokenization và embeddings" },
    { id: "nlp-02-text-classification", label: "Text classification" },
  ],
  33: [{ id: "nlp-03-bert", label: "BERT" }],
  34: [{ id: "nlp-04-language-modeling", label: "Language modeling" }],
  35: [{ id: "nlp-05-encoder-decoder", label: "Encoder–decoder" }],
  36: [{ id: "nlp-06-pretrained-and-api", label: "Pre-trained LM, PEFT và API" }],
  37: [
    { id: "audio-01-waveform-sampling", label: "Waveform và sampling" },
    { id: "audio-02-stft", label: "STFT" },
    { id: "audio-03-mel-spectrogram", label: "Mel spectrogram" },
    { id: "audio-04-mfcc", label: "MFCC" },
    { id: "audio-05-hubert", label: "HuBERT" },
  ],
  38: [
    { id: "audio-06-whisper", label: "Whisper" },
    { id: "audio-07-qwen-audio", label: "Qwen-Audio" },
    { id: "audio-08-voxtral", label: "Voxtral" },
  ],
  39: [
    { id: "mm-03-time-series", label: "Time-series" },
    { id: "mm-02-video", label: "Video understanding" },
    { id: "mm-01-data-embeddings", label: "Không gian embedding chung" },
    { id: "mm-04-fusion", label: "Multimodal fusion" },
  ],
  40: [
    { id: "ds-metrics", label: "Rà soát metric" },
    { id: "ds-cross-validation", label: "Rà soát validation" },
    { id: "foundation-sklearn-pipeline", label: "Rà soát pipeline" },
  ],
  41: [
    { id: "ds-feature-engineering", label: "Feature engineering cho capstone" },
    { id: "mm-04-fusion", label: "Tích hợp đa phương thức" },
  ],
};
