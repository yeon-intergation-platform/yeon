import { fetchYeon } from "@yeon/ui/runtime/YeonBrowserRuntime";
import { buildSpringBffHeaders } from "@/server/spring-bff-client";
import { resolveSpringBackendBaseUrl } from "@/server/user-experience-spring-client";

// 게임 플레이 경험치 적립은 Spring 내부 전용 엔드포인트(ROLE_INTERNAL, 내부 토큰)로만 호출한다.
// activityType은 백엔드 화이트리스트(game_play)로 제한되고, referenceId(slug:날짜)로
// "게임당 하루 1회" 멱등 적립이 보장된다(무한 반복 어뷰징 차단).
const INTERNAL_AWARD_PATH = "/api/v1/internal/experience/award";
const GAME_PLAY_ACTIVITY_TYPE = "game_play";

export async function awardGamePlayExperience(
  userId: string,
  gameSlug: string,
  dateKey: string
): Promise<boolean> {
  const headers = buildSpringBffHeaders({ "content-type": "application/json" });
  const response = await fetchYeon(
    `${resolveSpringBackendBaseUrl()}${INTERNAL_AWARD_PATH}`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        userId,
        activityType: GAME_PLAY_ACTIVITY_TYPE,
        referenceId: `${gameSlug}:${dateKey}`,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`게임 경험치 적립 실패: HTTP ${response.status}`);
  }
  return true;
}
