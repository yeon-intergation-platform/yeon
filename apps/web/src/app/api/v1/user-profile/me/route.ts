import { NextResponse } from "next/server";
import { updateUserProfileRequestSchema } from "@yeon/api-contract/user-profile";
import { getCurrentAuthUser } from "@/server/auth/session";
import { CANONICAL_SITE_URL } from "@/lib/seo";
import {
  getMyProfile,
  updateMyProfile,
  UserProfileRequestError,
} from "@/server/user-profile-spring-client";

export const runtime = "nodejs";

// 아바타는 절대 URL로만 저장한다(세션 authUserDto avatarUrl이 .url() 검증이라 상대경로면 깨짐).
// 업로드(/api/v1/card-decks/assets)는 상대경로를 반환하므로 정식 도메인으로 절대화한다.
function absolutizeAvatar(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/")) {
    try {
      return new URL(trimmed, CANONICAL_SITE_URL).href;
    } catch {
      return null;
    }
  }
  return null;
}

export async function GET() {
  const user = await getCurrentAuthUser();
  if (!user) {
    return NextResponse.json(
      { message: "로그인이 필요합니다." },
      { status: 401 }
    );
  }
  try {
    return NextResponse.json(await getMyProfile(user.id));
  } catch (error) {
    if (error instanceof UserProfileRequestError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      );
    }
    console.error("프로필 조회 실패", error);
    return NextResponse.json(
      { message: "프로필을 불러오지 못했습니다." },
      { status: 502 }
    );
  }
}

export async function PATCH(request: Request) {
  const user = await getCurrentAuthUser();
  if (!user) {
    return NextResponse.json(
      { message: "로그인이 필요합니다." },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "잘못된 요청입니다." },
      { status: 400 }
    );
  }

  const parsed = updateUserProfileRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "닉네임을 확인해 주세요." },
      { status: 400 }
    );
  }

  try {
    const profile = await updateMyProfile(user.id, {
      displayName: parsed.data.displayName,
      avatarUrl: absolutizeAvatar(parsed.data.avatarUrl),
    });
    return NextResponse.json(profile);
  } catch (error) {
    if (error instanceof UserProfileRequestError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      );
    }
    console.error("프로필 갱신 실패", error);
    return NextResponse.json(
      { message: "프로필을 저장하지 못했습니다." },
      { status: 502 }
    );
  }
}
