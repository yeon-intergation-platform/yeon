import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { publicCheckLocationSearchResponseSchema } from "@yeon/api-contract";

import {
  jsonError,
  requireAuthenticatedUser,
  withHandler,
} from "@/app/api/v1/counseling-records/_shared";
import {
  fetchPublicCheckLocationsFromSpring,
  PublicCheckLocationsSpringBackendHttpError,
} from "@/server/public-check-locations-spring-client";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ spaceId: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  return withHandler(async () => {
    const { currentUser, response } = await requireAuthenticatedUser(request);

    if (!currentUser) {
      return response as Response;
    }

    const { spaceId } = await context.params;
    const query = request.nextUrl.searchParams.get("query")?.trim() ?? "";

    if (!query) {
      return NextResponse.json(
        publicCheckLocationSearchResponseSchema.parse({ results: [] }),
      );
    }

    try {
      const data = await fetchPublicCheckLocationsFromSpring({
        userId: currentUser.id,
        spaceId,
        query,
      });
      return NextResponse.json(
        publicCheckLocationSearchResponseSchema.parse(data),
      );
    } catch (error) {
      if (error instanceof PublicCheckLocationsSpringBackendHttpError) {
        return jsonError(error.message, error.status);
      }

      throw error;
    }
  });
}
