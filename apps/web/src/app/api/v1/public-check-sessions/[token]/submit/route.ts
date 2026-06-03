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

// 보안 참고(IDX 172): 이 엔드포인트는 capability-URL(token) 기반 비인증 제출을 허용한다.
// 토큰 단위 제출 빈도 제한은 Spring PublicCheckRuntimeService.submit 의 앱 레벨 인메모리 토큰버킷으로 1차 방어한다.
// 인메모리 limiter 는 단일 인스턴스 기준 best-effort 이므로, 다중 인스턴스/네트워크 레벨 방어가 필요하면
// Cloudflare Rate Limiting 등 인프라 레벨 rate limit 을 추가로 둔다.
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
