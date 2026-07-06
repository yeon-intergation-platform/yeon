import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  RECALL_GRADE_PASS_SCORE,
  RECALL_GRADE_SCORE_MAX,
  RECALL_GRADE_SCORE_MIN,
  RECALL_GRADE_VERDICT,
  recallGradeRequestSchema,
  type RecallGradeResponse,
} from "@/features/typing-service/recall-grade";

// 백지 의미 채점 프록시. Spring이 아니라 외부 AI(Z.ai) 프록시 역할이라 apps/web route 허용 범위다.
// 점수/진도 영속화는 하지 않는다.

const ZAI_DEFAULT_BASE_URL = "https://api.z.ai/api/paas/v4/chat/completions";
const ZAI_DEFAULT_MODEL = "glm-4.5-flash";
const ZAI_TIMEOUT_MS = 20000;
const ZAI_TEMPERATURE = 0.2;

const RECALL_GRADE_ERROR = {
  invalidBody: "채점 요청값이 올바르지 않습니다.",
  missingKey: "채점 키가 설정되지 않았습니다.",
  upstreamFailed: "채점에 실패했습니다. 잠시 후 다시 시도해 주세요.",
} as const;

const SYSTEM_PROMPT =
  "너는 채점자다. [정답]의 핵심 내용을 [사용자답변]이 담고 있는지 평가한다. " +
  "표현·어순·토씨 차이는 감점하지 말고 핵심 개념 포함 여부만 본다. " +
  "JSON만 출력한다: {score:0~100 정수, verdict:'pass'|'fail', missedPoints:[놓친 핵심 문자열], feedback:'한줄 한국어 피드백'}.";

// Z.ai(OpenAI 호환) chat completions 응답에서 실제 채점 payload만 뽑아낸다.
const zaiCompletionSchema = z.object({
  choices: z
    .array(z.object({ message: z.object({ content: z.string() }) }))
    .min(1),
});

// LLM 출력은 형이 흔들릴 수 있어 느슨하게 받은 뒤 서버에서 정규화한다.
const zaiGradeSchema = z.object({
  score: z.coerce.number(),
  verdict: z.string().optional(),
  missedPoints: z.array(z.string()).default([]),
  feedback: z.string().default(""),
});

function clampScore(score: number): number {
  if (!Number.isFinite(score)) return RECALL_GRADE_SCORE_MIN;
  return Math.min(
    RECALL_GRADE_SCORE_MAX,
    Math.max(RECALL_GRADE_SCORE_MIN, Math.round(score))
  );
}

function normalizeGrade(content: string): RecallGradeResponse | null {
  let raw: unknown;
  try {
    raw = JSON.parse(content);
  } catch {
    return null;
  }

  const parsed = zaiGradeSchema.safeParse(raw);
  if (!parsed.success) return null;

  const score = clampScore(parsed.data.score);
  const verdict =
    parsed.data.verdict === RECALL_GRADE_VERDICT.pass ||
    parsed.data.verdict === RECALL_GRADE_VERDICT.fail
      ? parsed.data.verdict
      : score >= RECALL_GRADE_PASS_SCORE
        ? RECALL_GRADE_VERDICT.pass
        : RECALL_GRADE_VERDICT.fail;

  return {
    score,
    verdict,
    missedPoints: parsed.data.missedPoints,
    feedback: parsed.data.feedback,
  };
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsedBody = recallGradeRequestSchema.safeParse(body);
  if (!parsedBody.success) {
    return jsonError(RECALL_GRADE_ERROR.invalidBody, 400);
  }

  const apiKey = process.env.ZAI_API_KEY;
  if (!apiKey) {
    return jsonError(RECALL_GRADE_ERROR.missingKey, 500);
  }

  const baseUrl = process.env.ZAI_BASE_URL || ZAI_DEFAULT_BASE_URL;
  const model = process.env.ZAI_GRADING_MODEL || ZAI_DEFAULT_MODEL;
  const { question, answer, userAnswer } = parsedBody.data;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ZAI_TIMEOUT_MS);

  let upstream: Response;
  try {
    upstream = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: ZAI_TEMPERATURE,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `[질문]\n${question}\n\n[정답]\n${answer}\n\n[사용자답변]\n${userAnswer}`,
          },
        ],
      }),
      signal: controller.signal,
    });
  } catch (error) {
    // 키 값은 절대 로깅하지 않는다.
    console.error("[recall-grade] Z.ai 호출 실패", error);
    return jsonError(RECALL_GRADE_ERROR.upstreamFailed, 502);
  } finally {
    clearTimeout(timeout);
  }

  if (!upstream.ok) {
    console.error("[recall-grade] Z.ai 응답 오류", upstream.status);
    return jsonError(RECALL_GRADE_ERROR.upstreamFailed, 502);
  }

  const completion = await upstream.json().catch(() => null);
  const parsedCompletion = zaiCompletionSchema.safeParse(completion);
  if (!parsedCompletion.success) {
    console.error("[recall-grade] Z.ai 응답 형식 오류");
    return jsonError(RECALL_GRADE_ERROR.upstreamFailed, 502);
  }

  const grade = normalizeGrade(
    parsedCompletion.data.choices[0].message.content
  );
  if (!grade) {
    console.error("[recall-grade] 채점 결과 파싱 실패");
    return jsonError(RECALL_GRADE_ERROR.upstreamFailed, 502);
  }

  return NextResponse.json(grade);
}
