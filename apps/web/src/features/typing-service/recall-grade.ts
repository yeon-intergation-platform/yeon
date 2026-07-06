import { z } from "zod";
import { CARD_TEXT_MAX_LENGTH } from "@yeon/api-contract/card-decks";

// 백지 채점 계약. Next.js 외부 API 프록시(route)와 클라이언트 fetch가 공유하는 진실의 원천.
// api-contract에 올리지 않고 web 로컬에 두되, route/클라이언트가 같은 스키마를 참조해 drift를 막는다.

// 채점 판정. enum 대신 as const + literal union.
export const RECALL_GRADE_VERDICT = {
  pass: "pass",
  fail: "fail",
} as const;
export type RecallGradeVerdict =
  (typeof RECALL_GRADE_VERDICT)[keyof typeof RECALL_GRADE_VERDICT];

// 통과 기준 점수. 이 값 이상이면 통과로 취급한다(값이 진실의 원천).
export const RECALL_GRADE_PASS_SCORE = 70 as const;

export const RECALL_GRADE_SCORE_MIN = 0 as const;
export const RECALL_GRADE_SCORE_MAX = 100 as const;

export const recallGradeRequestSchema = z.object({
  // 질문(카드 front)
  question: z.string().min(1).max(CARD_TEXT_MAX_LENGTH),
  // 정답(카드 back)
  answer: z.string().min(1).max(CARD_TEXT_MAX_LENGTH),
  // 사용자가 기억으로 써낸 답. 빈값 방어.
  userAnswer: z.string().min(1).max(CARD_TEXT_MAX_LENGTH),
});
export type RecallGradeRequest = z.infer<typeof recallGradeRequestSchema>;

export const recallGradeResponseSchema = z.object({
  score: z
    .number()
    .int()
    .min(RECALL_GRADE_SCORE_MIN)
    .max(RECALL_GRADE_SCORE_MAX),
  verdict: z.enum([RECALL_GRADE_VERDICT.pass, RECALL_GRADE_VERDICT.fail]),
  missedPoints: z.array(z.string()),
  feedback: z.string(),
});
export type RecallGradeResponse = z.infer<typeof recallGradeResponseSchema>;
