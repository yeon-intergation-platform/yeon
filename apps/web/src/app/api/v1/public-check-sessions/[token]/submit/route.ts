import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  submitPublicCheckBodySchema,
  submitPublicCheckResultSchema,
} from "@yeon/api-contract";

import { jsonError } from "@/app/api/v1/counseling-records/_shared";
import {
  applyRememberedPublicCheckIdentityCookie,
  clearRememberedPublicCheckIdentityCookie,
  getRememberedPublicCheckIdentities,
} from "@/server/public-check-device-cookie-bff";
import {
  PublicCheckRuntimeSpringBackendHttpError,
  submitPublicCheckInSpring,
} from "@/server/public-check-runtime-spring-client";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ token: string }>;
};

// 보안 참고: 이 엔드포인트는 capability-URL(token) 기반 비인증 제출을 허용한다.
// 토큰·IP 단위 제출 빈도 제한(rate limit)이 없어 토큰 유출 시 대량 위조 체크인이 가능하다.
// 운영 환경에서는 Cloudflare Rate Limiting 또는 미들웨어 레벨 rate limit 추가를 권장한다.
export async function POST(request: NextRequest, context: RouteContext) {
  const { token } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("요청 본문이 올바른 JSON 형식이 아닙니다.", 400);
  }

  const parsed = submitPublicCheckBodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("체크인 요청 값이 올바르지 않습니다.", 400);
  }

  try {
    const outcome = await submitPublicCheckInSpring(token, {
      ...parsed.data,
      remembered: getRememberedPublicCheckIdentities(request).map(
        (identity) => `${identity.spaceId}:${identity.memberId}`
      ),
    });
    const response = NextResponse.json(
      submitPublicCheckResultSchema.parse(outcome.result)
    );

    if (outcome.shouldClearRememberedIdentity) {
      clearRememberedPublicCheckIdentityCookie(
        response,
        request,
        outcome.spaceId
      );
    }

    if (outcome.rememberedMemberId) {
      applyRememberedPublicCheckIdentityCookie(response, {
        request,
        spaceId: outcome.spaceId,
        memberId: outcome.rememberedMemberId,
      });
    }

    return response;
  } catch (error) {
    if (error instanceof PublicCheckRuntimeSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }

    console.error(error);
    return jsonError("체크인을 처리하지 못했습니다.", 500);
  }
}
