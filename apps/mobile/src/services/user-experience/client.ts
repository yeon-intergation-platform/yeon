import {
  type ExperienceHistoryResponse,
  type UserExperienceView,
  experienceHistoryResponseSchema,
  userExperienceViewSchema,
} from "@yeon/api-contract/user-experience";
import { getMobileApiBaseUrl } from "../api-base-url";

// 경험치 조회는 인증 필요. 모바일은 card-service와 동일하게 primary-auth 세션 토큰을
// Authorization: Bearer 로 Next BFF에 보내고, BFF가 세션→userId를 검증해
// X-Yeon-User-Id로 Spring backend에 전달한다(IDOR 방지, 토큰은 BFF만 신뢰).
export class UserExperienceApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "UserExperienceApiError";
  }
}

async function userExperienceFetch<T>(
  path: string,
  sessionToken: string,
  fallbackMessage: string,
  schema: { parse: (value: unknown) => T }
): Promise<T> {
  const response = await fetch(`${getMobileApiBaseUrl()}${path}`, {
    method: "GET",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${sessionToken}`,
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    let message = fallbackMessage;
    try {
      const parsed = JSON.parse(text) as { message?: string };
      if (parsed.message && !/spring|backend/i.test(parsed.message)) {
        message = parsed.message;
      }
    } catch {
      // 본문 파싱 실패는 fallback 사용.
    }
    throw new UserExperienceApiError(response.status, message);
  }

  return schema.parse(await response.json());
}

export const userExperienceApi = {
  getProgress(sessionToken: string): Promise<UserExperienceView> {
    return userExperienceFetch(
      "/api/v1/user-experience",
      sessionToken,
      "경험치 정보를 불러오지 못했습니다.",
      userExperienceViewSchema
    );
  },

  getHistory(
    sessionToken: string,
    limit?: number
  ): Promise<ExperienceHistoryResponse> {
    const query =
      limit && Number.isFinite(limit) && limit > 0
        ? `?limit=${Math.trunc(limit)}`
        : "";

    return userExperienceFetch(
      `/api/v1/user-experience/history${query}`,
      sessionToken,
      "경험치 이력을 불러오지 못했습니다.",
      experienceHistoryResponseSchema
    );
  },
};
