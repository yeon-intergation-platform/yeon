import { publicContentChannelSchema } from "@yeon/api-contract/public-content";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  PublicContentSpringBackendHttpError,
  downloadAdminPublicContentFromSpring,
} from "@/server/public-content-spring-client";
import {
  jsonAdminPublicContentError,
  requireAdminPublicContentAuthenticatedUser,
} from "../_shared";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await requireAdminPublicContentAuthenticatedUser(request);
  if (!auth.currentUser) return auth.response;

  const rawChannel = request.nextUrl.searchParams.get("channel");
  const parsedChannel = rawChannel
    ? publicContentChannelSchema.safeParse(rawChannel)
    : null;
  if (parsedChannel && !parsedChannel.success) {
    return jsonAdminPublicContentError("내보낼 채널을 확인해 주세요.", 400);
  }

  try {
    const download = await downloadAdminPublicContentFromSpring({
      userId: auth.currentUser.id,
      channel: parsedChannel?.success ? parsedChannel.data : undefined,
    });
    return new NextResponse(download.bytes, {
      headers: {
        "content-type": download.contentType,
        ...(download.contentDisposition
          ? { "content-disposition": download.contentDisposition }
          : {}),
      },
    });
  } catch (error) {
    if (error instanceof PublicContentSpringBackendHttpError) {
      return jsonAdminPublicContentError(error.message, error.status);
    }
    console.error(error);
    return jsonAdminPublicContentError(
      "공개 콘텐츠를 내보내지 못했습니다.",
      500
    );
  }
}
