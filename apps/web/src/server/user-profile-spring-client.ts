import { fetchYeon } from "@yeon/ui/runtime/YeonBrowserRuntime";
import {
  userProfileResponseSchema,
  type UpdateUserProfileRequest,
  type UserProfileResponse,
} from "@yeon/api-contract/user-profile";
import { buildSpringBffHeaders } from "@/server/spring-bff-client";
import { resolveSpringBackendBaseUrl } from "@/server/user-experience-spring-client";

const PROFILE_PATH = "/user-profile/me";

async function readError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { message?: unknown };
    if (data && typeof data.message === "string") return data.message;
  } catch {
    // 무시: 기본 메시지 사용
  }
  return "요청을 처리하지 못했습니다.";
}

export class UserProfileRequestError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "UserProfileRequestError";
    this.status = status;
  }
}

export async function getMyProfile(
  userId: string
): Promise<UserProfileResponse> {
  const response = await fetchYeon(
    `${resolveSpringBackendBaseUrl()}${PROFILE_PATH}`,
    {
      method: "GET",
      headers: buildSpringBffHeaders(undefined, { userId }),
      cache: "no-store",
    }
  );
  if (!response.ok) {
    throw new UserProfileRequestError(
      response.status,
      await readError(response)
    );
  }
  return userProfileResponseSchema.parse(await response.json());
}

export async function updateMyProfile(
  userId: string,
  payload: UpdateUserProfileRequest
): Promise<UserProfileResponse> {
  const response = await fetchYeon(
    `${resolveSpringBackendBaseUrl()}${PROFILE_PATH}`,
    {
      method: "PATCH",
      headers: buildSpringBffHeaders(
        { "content-type": "application/json" },
        { userId }
      ),
      body: JSON.stringify(payload),
    }
  );
  if (!response.ok) {
    throw new UserProfileRequestError(
      response.status,
      await readError(response)
    );
  }
  return userProfileResponseSchema.parse(await response.json());
}
