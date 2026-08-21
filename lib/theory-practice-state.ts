export const THEORY_PRACTICE_STORAGE_KEY = "voai-theory-practice-v1";
export const THEORY_PRACTICE_SCHEMA_VERSION = 1;

export type TheoryPracticeResponse =
  | number
  | number[]
  | Array<boolean | null>
  | string
  | null;

export interface TheoryPracticeState {
  version: typeof THEORY_PRACTICE_SCHEMA_VERSION;
  responses: Record<string, TheoryPracticeResponse>;
  revealed: string[];
}

export type TheoryPracticeStorageInspection =
  | { status: "missing" }
  | { status: "valid"; state: TheoryPracticeState }
  | { status: "invalid" };

export type TheoryPracticeReviewMode = "all" | "unanswered" | "wrong" | "correct";

/** `Array.every` bỏ qua hole; phải kiểm từng chỉ số để sparse array không giả hoàn tất. */
export function hasCompleteTrueFalseResponse(value: unknown, statementCount: number): boolean {
  if (!Array.isArray(value) || value.length !== statementCount) return false;
  for (let index = 0; index < statementCount; index += 1) {
    if (typeof value[index] !== "boolean") return false;
  }
  return true;
}
/**
 * Một câu chưa đối chiếu vẫn phải ở lại hàng chờ dù người học vừa nhập đủ đáp
 * án; nếu loại nó ngay, nút Đối chiếu biến mất trước khi có thể bấm.
 */
export function matchesTheoryPracticeReviewMode(
  mode: TheoryPracticeReviewMode,
  isRevealed: boolean,
  isCorrect: boolean,
): boolean {
  if (mode === "unanswered") return !isRevealed;
  if (mode === "wrong") return isRevealed && !isCorrect;
  if (mode === "correct") return isRevealed && isCorrect;
  return true;
}
export const EMPTY_THEORY_PRACTICE_STATE: TheoryPracticeState = {
  version: THEORY_PRACTICE_SCHEMA_VERSION,
  responses: {},
  revealed: [],
};

const MAX_QUESTION_ENTRIES = 2_000;
export const MAX_RESPONSE_TEXT_LENGTH = 4_000;
const MAX_RESPONSE_ARRAY_LENGTH = 100;

function isSafeId(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 200;
}

function parseResponse(value: unknown): TheoryPracticeResponse | undefined {
  if (value === null) return null;
  if (typeof value === "string") {
    return value.length <= MAX_RESPONSE_TEXT_LENGTH ? value : undefined;
  }
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (!Array.isArray(value) || value.length > MAX_RESPONSE_ARRAY_LENGTH) return undefined;

  if (value.every((entry) => typeof entry === "number" && Number.isInteger(entry))) {
    return [...value] as number[];
  }
  // Một bộ Đúng/Sai đang làm dở có thể được JSON.stringify thành `null` ở các
  // vị trí chưa chọn. Giữ `null` để không biến một ý chưa trả lời thành Sai.
  if (value.every((entry) => entry === null || typeof entry === "boolean")) {
    return [...value] as Array<boolean | null>;
  }
  return undefined;
}

/**
 * Kiểm định nghiêm ngặt payload dùng cho quyết định có được phép ghi lại hay
 * không. Khác parser cứu dữ liệu bên dưới, inspector không cắt hay bỏ mục lỗi:
 * nếu việc chuẩn hóa có thể làm mất byte dữ liệu cũ, toàn khối được xem là
 * invalid và UI phải giữ nguyên raw storage.
 */
export function inspectTheoryPracticeStorage(
  raw: string | null | undefined,
): TheoryPracticeStorageInspection {
  if (raw === null || raw === undefined) return { status: "missing" };

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return { status: "invalid" };
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { status: "invalid" };
  }

  const candidate = value as { version?: unknown; responses?: unknown; revealed?: unknown };
  const topLevelKeys = Object.keys(candidate);
  if (
    candidate.version !== THEORY_PRACTICE_SCHEMA_VERSION ||
    topLevelKeys.some((key) => !["version", "responses", "revealed"].includes(key)) ||
    typeof candidate.responses !== "object" ||
    candidate.responses === null ||
    Array.isArray(candidate.responses) ||
    !Array.isArray(candidate.revealed)
  ) {
    return { status: "invalid" };
  }

  const responseEntries = Object.entries(candidate.responses);
  if (
    responseEntries.length > MAX_QUESTION_ENTRIES ||
    candidate.revealed.length > MAX_QUESTION_ENTRIES
  ) {
    return { status: "invalid" };
  }

  const responses: Record<string, TheoryPracticeResponse> = {};
  for (const [id, rawResponse] of responseEntries) {
    const response = parseResponse(rawResponse);
    if (!isSafeId(id) || response === undefined) return { status: "invalid" };
    Object.defineProperty(responses, id, {
      value: response,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  }

  const revealed: string[] = [];
  const seenRevealed = new Set<string>();
  for (const id of candidate.revealed) {
    if (
      !isSafeId(id) ||
      seenRevealed.has(id) ||
      !Object.hasOwn(responses, id)
    ) {
      return { status: "invalid" };
    }
    seenRevealed.add(id);
    revealed.push(id);
  }

  return {
    status: "valid",
    state: {
      version: THEORY_PRACTICE_SCHEMA_VERSION,
      responses,
      revealed,
    },
  };
}

export function canPersistTheoryPracticeStorage(
  inspection: TheoryPracticeStorageInspection,
): boolean {
  return inspection.status !== "invalid";
}
/** Kiểm tra preflight phía ghi bằng đúng contract nghiêm ngặt của inspector. */
export function isTheoryPracticeStateWritable(state: TheoryPracticeState): boolean {
  try {
    return inspectTheoryPracticeStorage(JSON.stringify(state)).status === "valid";
  } catch {
    return false;
  }
}

/**
 * Merge snapshot mới nhất trong storage với đúng các id mà tab hiện tại đã sửa.
 * Nhờ vậy hai tab bắt đầu từ cùng một snapshot nhưng sửa Q1/Q2 không ghi đè lẫn
 * nhau; nếu cùng sửa một id, lần flush sau cùng vẫn thắng như localStorage.
 */
export function mergeTheoryPracticeDelta(
  liveState: TheoryPracticeState,
  localState: TheoryPracticeState,
  dirtyResponseIds: Iterable<string>,
  dirtyRevealedIds: Iterable<string>,
): TheoryPracticeState {
  const responses: Record<string, TheoryPracticeResponse> = { ...liveState.responses };
  for (const id of dirtyResponseIds) {
    if (Object.hasOwn(localState.responses, id)) {
      Object.defineProperty(responses, id, {
        value: localState.responses[id],
        enumerable: true,
        configurable: true,
        writable: true,
      });
    } else {
      delete responses[id];
    }
  }

  const revealed = new Set(liveState.revealed);
  const localRevealed = new Set(localState.revealed);
  for (const id of dirtyRevealedIds) {
    if (localRevealed.has(id)) revealed.add(id);
    else revealed.delete(id);
  }

  return {
    version: THEORY_PRACTICE_SCHEMA_VERSION,
    responses,
    revealed: [...revealed],
  };
}
/**
 * Parser không ném và cứu được từng mục hợp lệ. Dữ liệu hỏng ở một câu không
 * làm mất đáp án của 349 câu còn lại; version lạ thì được bỏ qua nguyên khối.
 */
export function parseTheoryPracticeState(
  raw: string | null | undefined,
): TheoryPracticeState {
  if (!raw) return EMPTY_THEORY_PRACTICE_STATE;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return EMPTY_THEORY_PRACTICE_STATE;
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return EMPTY_THEORY_PRACTICE_STATE;
  }

  const candidate = value as { version?: unknown; responses?: unknown; revealed?: unknown };
  if (candidate.version !== THEORY_PRACTICE_SCHEMA_VERSION) {
    return EMPTY_THEORY_PRACTICE_STATE;
  }

  const responses: Record<string, TheoryPracticeResponse> = {};
  if (
    typeof candidate.responses === "object" &&
    candidate.responses !== null &&
    !Array.isArray(candidate.responses)
  ) {
    for (const [id, rawResponse] of Object.entries(candidate.responses).slice(0, MAX_QUESTION_ENTRIES)) {
      // Giữ cả câu không còn trong ngân hàng hiện tại. Một lần đổi nội dung
      // không được biến lần lưu kế tiếp thành thao tác xoá lịch sử đã lưu trữ.
      if (!isSafeId(id)) continue;
      const response = parseResponse(rawResponse);
      if (response !== undefined) responses[id] = response;
    }
  }

  const revealed = Array.isArray(candidate.revealed)
    ? [...new Set(
        candidate.revealed
          .slice(0, MAX_QUESTION_ENTRIES)
          .filter(
            (id): id is string => isSafeId(id),
          ),
      )]
    : [];

  return {
    version: THEORY_PRACTICE_SCHEMA_VERSION,
    responses,
    revealed,
  };
}

/**
 * Chỉ một câu hiện còn trong ngân hàng mới cần kiểm định theo format trước khi
 * khóa sau hydration. Các id đã archived vẫn được giữ nguyên để lần ghi kế
 * tiếp không làm mất dữ liệu của một phiên bản nội dung cũ.
 */
export function sanitiseTheoryPracticeReveals(
  state: TheoryPracticeState,
  knownQuestionIds: ReadonlySet<string>,
  hasCompleteKnownResponse: (id: string, response: TheoryPracticeResponse) => boolean,
): TheoryPracticeState {
  return {
    version: THEORY_PRACTICE_SCHEMA_VERSION,
    responses: { ...state.responses },
    revealed: state.revealed.filter((id) => {
      if (!knownQuestionIds.has(id)) return true;
      if (!Object.hasOwn(state.responses, id)) return false;
      return hasCompleteKnownResponse(id, state.responses[id]);
    }),
  };
}

export function createTheoryPracticeState(
  responses: Readonly<Record<string, TheoryPracticeResponse>>,
  revealed: ReadonlySet<string>,
): TheoryPracticeState {
  return {
    version: THEORY_PRACTICE_SCHEMA_VERSION,
    responses: { ...responses },
    revealed: [...revealed],
  };
}
