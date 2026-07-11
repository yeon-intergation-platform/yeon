import { NextResponse } from "next/server";
import type { ZodError, ZodType } from "zod";
import { jsonError } from "@/app/api/v1/counseling-records/_shared";
import { CardRecallSpringBackendHttpError } from "@/server/card-recall-spring-client";

const INVALID_UPSTREAM_RESPONSE = {
  code: "CARD_RECALL_UPSTREAM_INVALID_RESPONSE",
  message: "백지 학습 서버 응답 형식이 올바르지 않습니다.",
} as const;

class CardRecallUpstreamResponseError extends Error {
  constructor(readonly validationError: ZodError) {
    super(INVALID_UPSTREAM_RESPONSE.message);
    this.name = "CardRecallUpstreamResponseError";
  }
}

export async function readRecallRequestJson(request: Request) {
  try {
    return { body: await request.json(), response: null } as const;
  } catch {
    return {
      body: null,
      response: jsonError("요청 본문이 올바른 JSON 형식이 아닙니다.", 400),
    } as const;
  }
}

export function handleRecallRouteError(error: unknown, fallback: string) {
  if (error instanceof CardRecallSpringBackendHttpError) {
    return jsonError(error.message, error.status, { code: error.code });
  }
  if (error instanceof CardRecallUpstreamResponseError) {
    console.error(
      "백지 학습 Spring 응답 계약이 일치하지 않습니다.",
      error.validationError
    );
    return jsonError(INVALID_UPSTREAM_RESPONSE.message, 502, {
      code: INVALID_UPSTREAM_RESPONSE.code,
    });
  }
  console.error(fallback, error);
  return jsonError(fallback, 500);
}

export function parseRecallUpstreamResponse<T>(
  schema: ZodType<T>,
  value: unknown
) {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    throw new CardRecallUpstreamResponseError(parsed.error);
  }
  return parsed.data;
}

export function recallJson(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}
