import {
  dismissHomeInsightBannerBodySchema,
  dismissHomeInsightBannerResponseSchema,
  homeInsightBannerStateResponseSchema,
} from "@yeon/api-contract";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  jsonError,
  requireAuthenticatedUser,
  withHandler,
} from "@/app/api/v1/counseling-records/_shared";
import {
  dismissHomeInsightBannerInSpring,
  fetchHomeInsightBannerStateFromSpring,
  HomeInsightBannerSpringBackendHttpError,
} from "@/server/home-insight-banner-spring-client";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return withHandler(async () => {
    const { currentUser, response } = await requireAuthenticatedUser(request);
    if (!currentUser) {
      return response;
    }

    try {
      const state = await fetchHomeInsightBannerStateFromSpring(currentUser.id);

      return NextResponse.json(
        homeInsightBannerStateResponseSchema.parse(state),
      );
    } catch (error) {
      if (error instanceof HomeInsightBannerSpringBackendHttpError) {
        return jsonError(error.message, error.status);
      }
      throw error;
    }
  });
}

export async function POST(request: NextRequest) {
  return withHandler(async () => {
    const { currentUser, response } = await requireAuthenticatedUser(request);
    if (!currentUser) {
      return response;
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("요청 본문 JSON 형식이 올바르지 않습니다.", 400);
    }

    const parsed = dismissHomeInsightBannerBodySchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("배너 dismiss 요청 값이 올바르지 않습니다.", 400);
    }

    try {
      const result = await dismissHomeInsightBannerInSpring(currentUser.id, {
        bannerKey: parsed.data.bannerKey,
      });

      return NextResponse.json(
        dismissHomeInsightBannerResponseSchema.parse(result),
      );
    } catch (error) {
      if (error instanceof HomeInsightBannerSpringBackendHttpError) {
        return jsonError(error.message, error.status);
      }
      throw error;
    }
  });
}
