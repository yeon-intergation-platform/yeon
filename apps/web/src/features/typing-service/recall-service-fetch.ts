import {
  CARD_REVIEW_DIFFICULTIES,
  type CardReviewDifficulty,
} from "@yeon/api-contract/card-decks";
import {
  fetchYeon,
  type YeonResponse,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import {
  recallGradeResponseSchema,
  type RecallGradeRequest,
  type RecallGradeResponse,
} from "./recall-grade";

const RECALL_GRADE_FALLBACK_ERROR =
  "채점에 실패했습니다. 잠시 후 다시 시도해 주세요.";
const RECALL_GRADE_INVALID_RESPONSE = "채점 결과를 해석하지 못했습니다.";

// 백지 통과/실패를 SRS 난이도로 매핑한다. 통과=good, 실패=hard.
export const RECALL_REVIEW_DIFFICULTY = {
  pass: CARD_REVIEW_DIFFICULTIES.good,
  fail: CARD_REVIEW_DIFFICULTIES.hard,
} as const satisfies Record<"pass" | "fail", CardReviewDifficulty>;

async function readErrorMessage(
  response: YeonResponse,
  fallback: string
): Promise<string> {
  const text = await response.text().catch(() => "");
  if (!text) return fallback;
  try {
    const parsed = JSON.parse(text) as { message?: unknown };
    return typeof parsed.message === "string" && parsed.message
      ? parsed.message
      : fallback;
  } catch {
    return fallback;
  }
}

// 백지 채점 프록시 호출. Z.ai 의미 채점 결과를 받는다.
export async function gradeRecallAnswer(
  body: RecallGradeRequest
): Promise<RecallGradeResponse> {
  const response = await fetchYeon("/api/v1/recall/grade", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, RECALL_GRADE_FALLBACK_ERROR)
    );
  }

  const data = await response.json().catch(() => null);
  const parsed = recallGradeResponseSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(RECALL_GRADE_INVALID_RESPONSE);
  }
  return parsed.data;
}

// SRS 복습 반영은 선택 사항이다. 실패해도 세션은 계속되므로 조용히 로그만 남긴다.
export async function reviewRecallCardSilently(
  deckId: string,
  itemId: string,
  difficulty: CardReviewDifficulty
): Promise<void> {
  try {
    const response = await fetchYeon(
      `/api/v1/card-decks/${deckId}/items/${itemId}/review`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ difficulty }),
        credentials: "include",
      }
    );
    if (!response.ok) {
      console.warn("[recall] 복습 반영 실패", response.status);
    }
  } catch (error) {
    console.warn("[recall] 복습 반영 예외", error);
  }
}
