import { createSpringInternalHeaders } from "./spring-backend-headers";

const DEFAULT_BACKEND_BASE_URL = "http://localhost:8080";
const TYPING_RACE_FINISHED_ACTIVITY = "typing_race_finished";

function backendBaseUrl() {
  const raw =
    process.env.SPRING_BACKEND_BASE_URL?.trim() ||
    process.env.SPRING_BOOTSTRAP_BASE_URL?.trim();
  return raw && raw.length > 0
    ? raw.replace(/\/$/, "")
    : DEFAULT_BACKEND_BASE_URL;
}

// 타자 레이스 완료 시 로그인 참가자에게 경험치를 적립하도록 Spring 내부 엔드포인트를 호출한다.
// best-effort: 호출 실패가 레이스 진행/결과를 깨지 않게 호출부에서 await 하지 않고 예외를 삼킨다.
// referenceId 는 (레이스 roomId + userId) 라 멱등이다 — 같은 레이스로 유저당 1회만 적립된다.
export async function awardTypingRaceFinished(userId: string, raceId: string) {
  try {
    const response = await fetch(
      `${backendBaseUrl()}/api/v1/internal/experience/award`,
      {
        method: "POST",
        headers: createSpringInternalHeaders({
          "content-type": "application/json",
        }),
        body: JSON.stringify({
          userId,
          activityType: TYPING_RACE_FINISHED_ACTIVITY,
          referenceId: `${raceId}#${userId}`,
        }),
      }
    );
    if (!response.ok) {
      console.warn(
        `타자 레이스 완료 경험치 적립 응답이 실패했습니다(레이스 진행은 정상). status=${response.status}`
      );
    }
  } catch (error) {
    console.warn(
      "타자 레이스 완료 경험치 적립 호출에 실패했습니다(레이스 진행은 정상).",
      error
    );
  }
}
