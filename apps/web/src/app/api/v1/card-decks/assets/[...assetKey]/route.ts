import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { Readable } from "node:stream";

import { jsonError } from "@/app/api/v1/counseling-records/_shared";
import { getCardDeckImageObject } from "@/server/services/card-deck-image-storage";
import { ServiceError } from "@/server/services/service-error";

export const runtime = "nodejs";

function bodyToWebStream(body: unknown) {
  if (!body || typeof body !== "object") {
    throw new ServiceError(404, "이미지를 찾지 못했습니다.");
  }

  if (
    "transformToWebStream" in body &&
    typeof body.transformToWebStream === "function"
  ) {
    return body.transformToWebStream() as ReadableStream<Uint8Array>;
  }

  if (body instanceof Readable) {
    return Readable.toWeb(body) as ReadableStream<Uint8Array>;
  }

  throw new ServiceError(500, "이미지 스트림을 읽지 못했습니다.");
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ assetKey: string[] }> }
) {
  const { assetKey: encodedKey } = await params;

  try {
    const storageKey = encodedKey
      .map((segment) => decodeURIComponent(segment))
      .join("/");
    const image = await getCardDeckImageObject(storageKey);
    return new NextResponse(bodyToWebStream(image.body), {
      headers: {
        "content-type": image.contentType,
        "cache-control": image.cacheControl,
      },
    });
  } catch (error) {
    if (error instanceof ServiceError) {
      return jsonError(error.message, error.status);
    }
    console.error(error);
    return jsonError("이미지를 불러오지 못했습니다.", 500);
  }
}
