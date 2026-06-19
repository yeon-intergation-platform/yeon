import { createYeonResponse } from "@yeon/ui/runtime/YeonBrowserRuntime";
import type { NextRequest } from "next/server";
import { jsonError } from "@/app/api/v1/counseling-records/_shared";
import {
  CardDeckAssetsSpringBackendHttpError,
  fetchCardDeckAssetFromSpring,
} from "@/server/card-deck-assets-spring-client";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ assetKey: string[] }> }
) {
  const { assetKey: encodedKey } = await params;

  try {
    const storageKey = encodedKey
      .map((segment) => decodeURIComponent(segment))
      .join("/");
    const springResponse = await fetchCardDeckAssetFromSpring(storageKey);
    return createYeonResponse(springResponse.body, {
      headers: {
        "content-type":
          springResponse.headers.get("content-type") ??
          "application/octet-stream",
        "cache-control":
          springResponse.headers.get("cache-control") ??
          "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    if (error instanceof CardDeckAssetsSpringBackendHttpError) {
      return jsonError(error.message, error.status, { code: error.code });
    }
    console.error(error);
    return jsonError("이미지를 불러오지 못했습니다.", 500);
  }
}
