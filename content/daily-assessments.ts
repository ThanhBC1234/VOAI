import {
  CURRICULUM_SESSIONS,
  TOTAL_CALENDAR_DAYS,
  type CurriculumSession,
  type SessionKind,
} from "./curriculum";

/**
 * Lớp đánh giá 1:1 cho 290 phiên học.
 *
 * Tệp này chỉ mô tả đề bài, tiêu chí công khai và *nhóm* test ẩn. Nó không
 * chứa test case cụ thể, expected output, pseudocode hoàn chỉnh hay lời giải.
 */

export const ASSESSMENT_AI_MODE = ["SOLO-90", "COACH-10"] as const;

export type AssessmentAiMode = typeof ASSESSMENT_AI_MODE;
export type NonEmptyStrings = readonly [string, ...string[]];
export type RetrievalQuestions = readonly [string, string, ...string[]];

export interface AssessmentScoreWeights {
  retrieval: number;
  coding: number;
  validation: number;
  explanation: number;
}

export interface AssessmentPassRule {
  minimumScore: number;
  minimumSectionScores: AssessmentScoreWeights;
  requiredSections: NonEmptyStrings;
  automaticFailConditions: NonEmptyStrings;
  retryRule: string;
}

export interface AssessmentMasteryRule {
  minimumScore: number;
  evidenceRequired: NonEmptyStrings;
  delayedTransferCheck: string;
}

export interface DailyAssessment {
  id: string;
  sessionId: string;
  ordinal: number;
  date: string;
  week: number | null;
  kind: SessionKind;
  domain: CurriculumSession["domain"];
  title: string;
  outcome: string;
  retrievalQuestions: RetrievalQuestions;
  codingTask: string;
  visibleCriteria: NonEmptyStrings;
  hiddenTestCategories: NonEmptyStrings;
  explainPrompt: string;
  aiMode: AssessmentAiMode;
  aiBoundary: string;
  scoreWeights: AssessmentScoreWeights;
  passRule: AssessmentPassRule;
  mastery: AssessmentMasteryRule;
}

export interface DailyAssessmentValidationSummary {
  total: number;
  uniqueAssessmentIds: number;
  uniqueSessionIds: number;
  uniqueDates: number;
  byKind: Readonly<Record<SessionKind, number>>;
  firstDate: string;
  lastDate: string;
}

const SCORE_WEIGHTS: Readonly<Record<SessionKind, AssessmentScoreWeights>> = {
  lesson: { retrieval: 20, coding: 50, validation: 20, explanation: 10 },
  lab: { retrieval: 10, coding: 50, validation: 25, explanation: 15 },
  checkpoint: { retrieval: 20, coding: 45, validation: 20, explanation: 15 },
  finale: { retrieval: 10, coding: 40, validation: 30, explanation: 20 },
};

const SCORE_CATEGORIES = ["retrieval", "coding", "validation", "explanation"] as const;

function minimumSectionScoresFor(
  weights: AssessmentScoreWeights,
): AssessmentScoreWeights {
  return {
    retrieval: Math.max(1, Math.ceil(weights.retrieval * 0.4)),
    coding: Math.max(1, Math.ceil(weights.coding * 0.4)),
    validation: Math.max(1, Math.ceil(weights.validation * 0.4)),
    explanation: Math.max(1, Math.ceil(weights.explanation * 0.4)),
  };
}

function declaredScore(session: CurriculumSession): number | null {
  const match = `${session.outcome} ${session.assessment}`.match(/(\d{2,3})\/100/);
  if (!match) return null;
  const score = Number(match[1]);
  return Number.isInteger(score) && score >= 0 && score <= 100 ? score : null;
}

function passScoreFor(session: CurriculumSession): number {
  const explicit = declaredScore(session);
  if (explicit !== null && (session.kind === "checkpoint" || session.kind === "finale")) {
    return explicit;
  }
  if (session.kind === "lab") return 75;
  if (session.kind === "finale") return 85;
  return 70;
}

function masteryScoreFor(session: CurriculumSession, passScore: number): number {
  const floorByKind: Record<SessionKind, number> = {
    lesson: 80,
    lab: 80,
    checkpoint: 80,
    finale: 90,
  };
  const checkpointStretch = session.kind === "checkpoint" ? passScore + 5 : passScore;
  return Math.min(100, Math.max(floorByKind[session.kind], checkpointStretch));
}

function retrievalQuestionsFor(session: CurriculumSession): RetrievalQuestions {
  switch (session.kind) {
    case "lesson":
      return [
        `Không mở tài liệu: với "${session.title}", hãy viết lại cơ chế chính bằng 3–5 câu và nêu một giả định em đang dùng.`,
        `Mục tiêu của phiên là "${session.outcome}". Hãy tự tạo một ví dụ nhỏ, dự đoán kết quả hoặc shape trước khi chạy code.`,
        `Nêu một trường hợp biên có thể làm phần cài đặt cho "${session.title}" sai dù ví dụ thông thường vẫn chạy.`,
      ];
    case "lab":
      return [
        `Với "${session.title}", hãy viết hypothesis và hai dấu hiệu quan sát được cho biết lab đang đi đúng hướng.`,
        `Từ mục tiêu "${session.outcome}", hãy xác định input, output, metric và bằng chứng tối thiểu trước khi mở notebook cũ.`,
        `Nêu một rủi ro tích hợp hoặc rò rỉ dữ liệu cần chủ động kiểm tra trong lab này.`,
      ];
    case "checkpoint":
      return [
        `Closed-book: hãy tóm tắt những ý bắt buộc phải chứng minh trong "${session.title}" mà không xem bài cũ.`,
        `Phiên yêu cầu "${session.outcome}". Hãy nêu trước tiêu chí nào chứng minh code đúng và tiêu chí nào chứng minh em thật sự hiểu.`,
        `Viết một failure mode quan trọng và cách em sẽ phát hiện nó bằng test hoặc vấn đáp, chưa viết cách sửa.`,
      ];
    case "finale":
      return [
        `Không mở portfolio: hãy lập bản đồ bằng chứng cần kiểm tra cho "${session.title}" và đánh dấu phần em chưa chắc.`,
        `Để đạt "${session.outcome}", hãy nêu ba bằng chứng độc lập có thể được người khác kiểm tra lại.`,
        `Nêu một claim trong sản phẩm cuối có nguy cơ vượt quá bằng chứng và cách em sẽ kiểm chứng claim đó.`,
      ];
  }
}

const PRETRAINED_OR_LARGE_MODEL_PATTERN =
  /(?:\bwhisper\b|\bqwen[-\s]?audio\b|\bvoxtral\b|\bhubert\b|\bclip\b|\bdiffusion\b|\bbert\b|\byolo\b|\bdetr\b|\bssd\b)/i;

function usesPretrainedOrLargeModel(session: CurriculumSession): boolean {
  return PRETRAINED_OR_LARGE_MODEL_PATTERN.test(
    `${session.title} ${session.outcome} ${session.artifact} ${session.assessment}`,
  );
}

function codingTaskFor(session: CurriculumSession): string {
  if (usesPretrainedOrLargeModel(session)) {
    return `Tự xây pipeline, evaluation và ít nhất một ablation có kiểm soát cho "${session.title}" để chứng minh mục tiêu "${session.outcome}". Được phép dùng thư viện và model/pretrained weights phù hợp (Whisper, Qwen-Audio, Voxtral, HuBERT, CLIP, diffusion, BERT, YOLO, DETR hoặc SSD); không yêu cầu tự huấn luyện hay viết toàn bộ model từ đầu. Phần người học phải tự viết gồm luồng dữ liệu/inference hoặc training, metric, kiểm tra shape/schema, error analysis và mã tạo artifact "${session.artifact}"; mọi dependency và giới hạn tài nguyên phải được ghi rõ.`;
  }

  switch (session.kind) {
    case "lesson":
      return `Tự triển khai một lát cắt chạy được cho "${session.title}" để chứng minh mục tiêu "${session.outcome}". Sản phẩm phải thể hiện yêu cầu "${session.artifact}" và có test do em tự viết. Chỉ khi artifact hoặc self-check yêu cầu cài/tính từ đầu cho một thuật toán nhỏ phù hợp, không được thay phần cốt lõi bằng hàm thư viện triển khai sẵn; các phiên sử dụng hoặc đánh giá model có sẵn không thuộc hạn chế from-scratch này.`;
    case "lab":
      return `Tự xây một vertical slice đầu-cuối cho "${session.title}" nhằm đạt "${session.outcome}". Nộp "${session.artifact}", kèm lệnh fresh-run, acceptance tests và evidence quan sát được; ưu tiên một luồng nhỏ chạy đúng trước khi mở rộng.`;
    case "checkpoint":
      return `Trong thời gian closed-book, tự code một biến thể mới của "${session.title}" để chứng minh "${session.outcome}". Nộp "${session.artifact}" cùng test, điểm tự chấm và lỗi gốc; không dùng lại nguyên code của bài luyện hoặc nhờ AI sinh code.`;
    case "finale":
      return `Tự hoàn tất nhiệm vụ tổng hợp "${session.title}" để đạt "${session.outcome}". Sản phẩm bắt buộc là "${session.artifact}" và phải có quy trình kiểm tra từ trạng thái sạch, bằng chứng truy xuất được và phần giới hạn do chính em viết.`;
  }
}

function visibleCriteriaFor(session: CurriculumSession, passScore: number): NonEmptyStrings {
  switch (session.kind) {
    case "lesson":
      return [
        `Code và test cho "${session.title}" do người học tự viết; lịch sử làm bài thể hiện SOLO-90.`,
        `Kết quả hoặc kiểm tra số trực tiếp hỗ trợ mục tiêu "${session.outcome}".`,
        `Hoàn thành phép tự kiểm tra công khai: ${session.assessment}`,
        "Chạy được từ đầu trong môi trường sạch và không phụ thuộc thứ tự cell ẩn.",
        "Giải thích được input, output, invariant, một test biên và độ phức tạp liên quan.",
      ];
    case "lab":
      return [
        `Artifact "${session.artifact}" tồn tại, mở được và tạo ra sản phẩm "${session.outcome}".`,
        `Các điều kiện đạt công khai của "${session.title}" đều có evidence: ${session.assessment}`,
        "Có ít nhất một vertical slice đầu-cuối, acceptance tests và kết quả test được lưu.",
        "Fresh-run thành công với seed, dữ liệu, cấu hình và metric được ghi rõ.",
        "Có error analysis hoặc ablation nhỏ; không chỉ trình diễn một mẫu đẹp.",
      ];
    case "checkpoint":
      return [
        `Đạt tối thiểu ${passScore}/100 và hoàn thành đúng yêu cầu công khai: ${session.assessment}`,
        `Bằng chứng nộp khớp artifact "${session.artifact}" và mục tiêu "${session.outcome}".`,
        "Phần closed-book được hoàn thành trước khi mở tài liệu hoặc dùng COACH-10.",
        "Code qua visible tests, có tự chấm theo rubric và ghi lỗi gốc thay vì chỉ ghi đáp án sai.",
        "Người học bảo vệ được lựa chọn, shape/data flow, metric và một failure mode bằng lời của mình.",
      ];
    case "finale":
      return [
        `Đạt tối thiểu ${passScore}/100 cho "${session.title}" và trực tiếp chứng minh "${session.outcome}".`,
        `Artifact cuối "${session.artifact}" có thể được người khác mở và kiểm tra lại.`,
        `Đáp ứng tiêu chí công khai của phiên: ${session.assessment}`,
        "Toàn bộ claim quan trọng liên kết tới notebook, test, metric, commit hoặc bản ghi bảo vệ tương ứng.",
        "Fresh-run/release check thành công; giới hạn, rủi ro và bước tiếp theo được ghi trung thực.",
      ];
  }
}

function hiddenTestCategoriesFor(session: CurriculumSession): NonEmptyStrings {
  switch (session.kind) {
    case "lesson":
      return [
        `Tính đúng trên ví dụ chưa thấy nhưng cùng nguyên lý với "${session.title}".`,
        "Đầu vào rỗng, cực tiểu/cực đại, sai shape hoặc sai kiểu theo hợp đồng của bài.",
        "Tính tất định, không sửa input ngoài ý muốn và không phụ thuộc state toàn cục/cell cũ.",
        "Invariant số học, độ ổn định số và sai số dung sai phù hợp với miền bài học.",
        "Giới hạn thời gian/bộ nhớ và phát hiện lối tắt gọi implementation có sẵn khi bài yêu cầu from-scratch.",
      ];
    case "lab":
      return [
        `Fresh-run toàn pipeline của "${session.title}" trên cấu hình hoặc seed chưa thấy.`,
        "Hợp đồng giữa các bước: schema, shape, dtype, device, label mapping và đường dẫn artifact.",
        "Robustness với dữ liệu thiếu, lớp hiếm, độ dài khác nhau hoặc mẫu lỗi phù hợp modality.",
        "Không leakage giữa train/validation/test và mọi transform học tham số chỉ fit trên train.",
        "Tái lập metric/evidence và phát hiện báo cáo chỉ chọn mẫu thuận lợi.",
      ];
    case "checkpoint":
      return [
        `Biến thể tương đương nhưng chưa luyện trước của "${session.title}".`,
        "Test biên, test bất biến và test phản ví dụ đối với lỗi phổ biến của chủ đề.",
        "Fresh implementation hoặc thay đổi interface nhỏ để phát hiện học thuộc code.",
        "Kiểm tra chéo code–metric–artifact và tính tái lập từ runtime sạch.",
        "Oral defense ngẫu nhiên về một dòng code, shape, giả định, độ phức tạp hoặc failure mode.",
      ];
    case "finale":
      return [
        `Audit truy xuất bằng chứng và liên kết artifact của "${session.title}".`,
        "Fresh-run/release trên môi trường sạch hoặc cấu hình chưa dùng trong lần trình diễn.",
        "Kiểm tra biến thể tổng hợp xuyên modality, metric hoặc constraint mà không báo trước dữ liệu cụ thể.",
        "Đối chiếu claim với log, test, notebook, model card và giới hạn đã công bố.",
        "Bảo vệ miệng ngẫu nhiên và chỉnh sửa nhỏ trực tiếp để chứng minh quyền sở hữu hiểu biết.",
      ];
  }
}

function explainPromptFor(session: CurriculumSession): string {
  return `Không nhìn AI hoặc lời giải mẫu, hãy bảo vệ "${session.title}" và mục tiêu "${session.outcome}": (1) mô tả data flow/shape, (2) giải thích vì sao cách làm hợp lệ, (3) diễn giải một test biên, (4) nêu độ phức tạp hoặc chi phí chính, (5) chỉ ra một failure mode, giới hạn bằng chứng và thay đổi em sẽ thử tiếp theo.`;
}

function passRuleFor(session: CurriculumSession, passScore: number): AssessmentPassRule {
  const minimumSectionScores = minimumSectionScoresFor(SCORE_WEIGHTS[session.kind]);
  const kindRequirement: Record<SessionKind, string> = {
    lesson: "Phần coding và validation đều phải có điểm; retrieval không được bỏ trống.",
    lab: "Vertical slice, fresh-run và acceptance evidence đều phải hiện diện.",
    checkpoint: "Phải hoàn thành closed-book và qua cả code lẫn oral defense; điểm tổng không thể bù cho một phần bằng 0.",
    finale: "Phải qua fresh-run, audit bằng chứng và bảo vệ; portfolio đẹp không thay thế khả năng tái lập.",
  };
  const retryByKind: Record<SessionKind, string> = {
    lesson: `Nếu chưa đạt, ghi lỗi gốc, tự sửa đúng phần trượt rồi làm một ví dụ mới của "${session.title}"; không chép lại đáp án cũ.`,
    lab: `Nếu chưa đạt, thu nhỏ pipeline của "${session.title}" tới vertical slice nhỏ nhất, sửa từ failing test rồi fresh-run lại.`,
    checkpoint: `Nếu chưa đạt, ôn đúng lỗ hổng và thi lại bằng biến thể mới của "${session.title}" sau tối thiểu một phiên; không dùng lại test ẩn cũ.`,
    finale: `Nếu chưa đạt, bổ sung bằng chứng còn thiếu cho "${session.title}", đóng release mới và bảo vệ lại phần bị trượt.`,
  };

  return {
    minimumScore: passScore,
    minimumSectionScores,
    requiredSections: [
      kindRequirement[session.kind],
      `Bằng chứng phải trực tiếp hỗ trợ mục tiêu "${session.outcome}" và khớp artifact đã khai báo.`,
      `Ngoài tổng điểm, từng phần phải đạt sàn tự chấm: retrieval ${minimumSectionScores.retrieval}, coding ${minimumSectionScores.coding}, validation ${minimumSectionScores.validation}, explanation ${minimumSectionScores.explanation}.`,
      "Tổng điểm được tính theo scoreWeights; mọi phần do người học tự tạo theo SOLO-90.",
    ],
    automaticFailConditions: [
      "Không giải thích được code, data flow/shape, metric hoặc test do mình nộp.",
      "Code/notebook không chạy từ trạng thái sạch, artifact sai schema hoặc kết quả không tái lập mà không có giải trình.",
      "Có leakage, dùng test để tuning, làm sai quy tắc dữ liệu hoặc claim vượt bằng chứng.",
      "AI/người khác viết lời giải hay phần code cốt lõi, hoặc người học không chứng minh được quyền sở hữu bài làm.",
    ],
    retryRule: retryByKind[session.kind],
  };
}

function masteryRuleFor(
  session: CurriculumSession,
  passScore: number,
): AssessmentMasteryRule {
  const masteryScore = masteryScoreFor(session, passScore);
  const transferByKind: Record<SessionKind, string> = {
    lesson: `Sau 7 ngày, giải một ví dụ mới của "${session.title}" từ trang trắng và giải thích khác biệt mà không xem notebook cũ.`,
    lab: `Sau 7–14 ngày, thay một seed/split/modality constraint trong "${session.title}", fresh-run và giải thích ảnh hưởng lên metric.`,
    checkpoint: `Ở checkpoint kế tiếp, hoàn thành một câu liên kết lại "${session.title}" mà không được báo trước dạng cụ thể.`,
    finale: `Sau bản release, để người khác chọn ngẫu nhiên một artifact của "${session.title}" và yêu cầu tái lập hoặc bảo vệ trực tiếp.`,
  };

  return {
    minimumScore: masteryScore,
    evidenceRequired: [
      `Đã qua phiên hiện tại với ít nhất ${passScore}/100 và đạt ít nhất ${masteryScore}/100 ở lần chứng minh năng lực.`,
      `Tự code lại hoặc thích nghi được nguyên lý của "${session.title}" cho dữ liệu/constraint mới.`,
      `Giải thích được cách bằng chứng hỗ trợ "${session.outcome}" và nêu được giới hạn của kết luận.`,
      "Vượt qua delayed transfer check; điểm pass ngay sau khi học chưa tự động đồng nghĩa đã mastery.",
    ],
    delayedTransferCheck: transferByKind[session.kind],
  };
}

function createDailyAssessment(session: CurriculumSession): DailyAssessment {
  const passScore = passScoreFor(session);
  return {
    id: `assessment-${session.id}`,
    sessionId: session.id,
    ordinal: session.ordinal,
    date: session.date,
    week: session.week,
    kind: session.kind,
    domain: session.domain,
    title: session.title,
    outcome: session.outcome,
    retrievalQuestions: retrievalQuestionsFor(session),
    codingTask: codingTaskFor(session),
    visibleCriteria: visibleCriteriaFor(session, passScore),
    hiddenTestCategories: hiddenTestCategoriesFor(session),
    explainPrompt: explainPromptFor(session),
    aiMode: ASSESSMENT_AI_MODE,
    aiBoundary: `SOLO-90: tự làm retrieval, thiết kế, code, test, debug và giải thích. COACH-10 chỉ được dùng sau khi đã lưu giả thuyết, code và test của mình. Khi hỏi AI, dùng đúng ranh giới: ${session.coachBoundary}`,
    scoreWeights: SCORE_WEIGHTS[session.kind],
    passRule: passRuleFor(session, passScore),
    mastery: masteryRuleFor(session, passScore),
  };
}

export function generateDailyAssessments(
  sessions: readonly CurriculumSession[] = CURRICULUM_SESSIONS,
): DailyAssessment[] {
  return sessions.map(createDailyAssessment);
}

export const DAILY_ASSESSMENTS: readonly DailyAssessment[] = generateDailyAssessments();

function assertNonBlank(value: string, label: string): void {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string.`);
  }
}

function assertNonBlankList(
  value: readonly string[],
  minimumLength: number,
  label: string,
): void {
  if (!Array.isArray(value) || value.length < minimumLength) {
    throw new Error(`${label} must contain at least ${minimumLength} item(s).`);
  }
  value.forEach((item, index) => assertNonBlank(item, `${label}[${index}]`));
}

/**
 * Kiểm chứng mạnh quan hệ 1:1 giữa curriculum và assessment.
 * Hàm ném Error ngay khi thiếu/thừa/trùng ID, trùng ngày, sai metadata hoặc có
 * trường bắt buộc rỗng; vì vậy có thể gọi trong CI lẫn khi import dữ liệu.
 */
export function validateDailyAssessments(
  assessments: readonly DailyAssessment[] = DAILY_ASSESSMENTS,
  sessions: readonly CurriculumSession[] = CURRICULUM_SESSIONS,
): DailyAssessmentValidationSummary {
  if (sessions.length !== TOTAL_CALENDAR_DAYS) {
    throw new Error(`Expected ${TOTAL_CALENDAR_DAYS} curriculum sessions, got ${sessions.length}.`);
  }
  if (assessments.length !== sessions.length) {
    throw new Error(`Assessment/session count mismatch: ${assessments.length}/${sessions.length}.`);
  }

  const sourceById = new Map(sessions.map((session) => [session.id, session]));
  if (sourceById.size !== sessions.length) {
    throw new Error("Curriculum session IDs must be unique before assessments can be validated.");
  }

  const assessmentIds = new Set<string>();
  const sessionIds = new Set<string>();
  const dates = new Set<string>();
  const byKind: Record<SessionKind, number> = {
    lesson: 0,
    lab: 0,
    checkpoint: 0,
    finale: 0,
  };

  for (const assessment of assessments) {
    const label = `assessment ${assessment.id || "<missing-id>"}`;
    assertNonBlank(assessment.id, `${label}.id`);
    assertNonBlank(assessment.sessionId, `${label}.sessionId`);
    assertNonBlank(assessment.date, `${label}.date`);
    assertNonBlank(assessment.title, `${label}.title`);
    assertNonBlank(assessment.outcome, `${label}.outcome`);
    assertNonBlank(assessment.codingTask, `${label}.codingTask`);
    assertNonBlank(assessment.explainPrompt, `${label}.explainPrompt`);
    assertNonBlank(assessment.aiBoundary, `${label}.aiBoundary`);
    assertNonBlankList(assessment.retrievalQuestions, 2, `${label}.retrievalQuestions`);
    assertNonBlankList(assessment.visibleCriteria, 1, `${label}.visibleCriteria`);
    assertNonBlankList(assessment.hiddenTestCategories, 1, `${label}.hiddenTestCategories`);
    assertNonBlankList(assessment.passRule.requiredSections, 1, `${label}.passRule.requiredSections`);
    assertNonBlankList(
      assessment.passRule.automaticFailConditions,
      1,
      `${label}.passRule.automaticFailConditions`,
    );
    assertNonBlank(assessment.passRule.retryRule, `${label}.passRule.retryRule`);
    assertNonBlankList(assessment.mastery.evidenceRequired, 1, `${label}.mastery.evidenceRequired`);
    assertNonBlank(assessment.mastery.delayedTransferCheck, `${label}.mastery.delayedTransferCheck`);

    if (assessmentIds.has(assessment.id)) throw new Error(`Duplicate assessment id: ${assessment.id}.`);
    if (sessionIds.has(assessment.sessionId)) throw new Error(`Duplicate assessed session id: ${assessment.sessionId}.`);
    if (dates.has(assessment.date)) throw new Error(`More than one assessment on ${assessment.date}.`);
    assessmentIds.add(assessment.id);
    sessionIds.add(assessment.sessionId);
    dates.add(assessment.date);

    const source = sourceById.get(assessment.sessionId);
    if (!source) throw new Error(`${label} does not map to a curriculum session.`);
    if (assessment.id !== `assessment-${source.id}`) throw new Error(`${label} has a non-canonical id.`);
    if (
      assessment.ordinal !== source.ordinal ||
      assessment.date !== source.date ||
      assessment.week !== source.week ||
      assessment.kind !== source.kind ||
      assessment.domain !== source.domain ||
      assessment.title !== source.title ||
      assessment.outcome !== source.outcome
    ) {
      throw new Error(`${label} metadata does not match curriculum session ${source.id}.`);
    }

    const retrievalText = assessment.retrievalQuestions.join(" ");
    if (!retrievalText.includes(source.title) || !retrievalText.includes(source.outcome)) {
      throw new Error(`${label} retrieval questions must be specific to both title and outcome.`);
    }
    if (!assessment.codingTask.includes(source.title) || !assessment.codingTask.includes(source.outcome)) {
      throw new Error(`${label} codingTask must be specific to both title and outcome.`);
    }
    if (!assessment.explainPrompt.includes(source.title) || !assessment.explainPrompt.includes(source.outcome)) {
      throw new Error(`${label} explainPrompt must be specific to both title and outcome.`);
    }
    if (
      assessment.aiMode.length !== 2 ||
      assessment.aiMode[0] !== "SOLO-90" ||
      assessment.aiMode[1] !== "COACH-10"
    ) {
      throw new Error(`${label} must use SOLO-90 followed by COACH-10.`);
    }

    const scoreTotal = Object.values(assessment.scoreWeights).reduce((sum, weight) => sum + weight, 0);
    if (scoreTotal !== 100) throw new Error(`${label} score weights total ${scoreTotal}, not 100.`);
    if (
      !assessment.passRule.minimumSectionScores ||
      typeof assessment.passRule.minimumSectionScores !== "object"
    ) {
      throw new Error(`${label} must define minimumSectionScores.`);
    }
    let minimumSectionScoreTotal = 0;
    for (const category of SCORE_CATEGORIES) {
      const weight = assessment.scoreWeights[category];
      const floor = assessment.passRule.minimumSectionScores[category];
      if (!Number.isFinite(weight) || weight < 0) {
        throw new Error(`${label} has an invalid ${category} score weight.`);
      }
      if (!Number.isFinite(floor) || floor < 0 || floor > weight) {
        throw new Error(
          `${label} ${category} floor ${floor} must be between 0 and weight ${weight}.`,
        );
      }
      minimumSectionScoreTotal += floor;
    }
    if (minimumSectionScoreTotal > assessment.passRule.minimumScore) {
      throw new Error(
        `${label} section floors total ${minimumSectionScoreTotal}, above pass score ${assessment.passRule.minimumScore}.`,
      );
    }
    if (
      !Number.isFinite(assessment.passRule.minimumScore) ||
      assessment.passRule.minimumScore < 0 ||
      assessment.passRule.minimumScore > 100 ||
      !Number.isFinite(assessment.mastery.minimumScore) ||
      assessment.mastery.minimumScore < assessment.passRule.minimumScore ||
      assessment.mastery.minimumScore > 100
    ) {
      throw new Error(`${label} has an invalid pass/mastery threshold.`);
    }

    byKind[assessment.kind] += 1;
  }

  for (const source of sessions) {
    if (!sessionIds.has(source.id)) throw new Error(`Missing assessment for session ${source.id}.`);
    if (!dates.has(source.date)) throw new Error(`Missing assessment for date ${source.date}.`);
  }

  return {
    total: assessments.length,
    uniqueAssessmentIds: assessmentIds.size,
    uniqueSessionIds: sessionIds.size,
    uniqueDates: dates.size,
    byKind,
    firstDate: sessions[0]?.date ?? "",
    lastDate: sessions.at(-1)?.date ?? "",
  };
}

// Import-time gate: dữ liệu sai sẽ không âm thầm đi vào web hoặc hệ thống chấm.
export const DAILY_ASSESSMENTS_VALIDATION = validateDailyAssessments();
