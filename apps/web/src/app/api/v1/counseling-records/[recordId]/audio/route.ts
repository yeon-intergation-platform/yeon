import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  CounselingRecordAudioSpringBackendHttpError,
  fetchCounselingRecordAudioFromSpring,
} from "@/server/counseling-record-audio-spring-client";

import { jsonError, requireAuthenticatedUser } from "../../_shared";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    recordId: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { currentUser, response } = await requireAuthenticatedUser(request);

  if (!currentUser) {
    return response;
  }

  const { recordId } = await context.params;

  try {
    const audio = await fetchCounselingRecordAudioFromSpring({
      userId: currentUser.id,
      recordId,
      rangeHeader: request.headers.get("range"),
    });

    return new NextResponse(audio.bytes, {
      status: audio.status,
      headers: {
        "content-type": audio.mimeType,
        ...(audio.contentLength
          ? {
              "content-length": audio.contentLength,
            }
          : {}),
        ...(audio.contentDisposition
          ? {
              "content-disposition": audio.contentDisposition,
            }
          : {}),
        "cache-control": "private, no-store",
        "accept-ranges": "bytes",
        ...(audio.contentRange
          ? {
              "content-range": audio.contentRange,
            }
          : {}),
      },
    });
  } catch (error) {
    if (error instanceof CounselingRecordAudioSpringBackendHttpError) {
      return jsonError(error.message, error.status);
    }

    console.error(error);
    return jsonError("원본 음성 파일을 불러오지 못했습니다.", 500);
  }
}
