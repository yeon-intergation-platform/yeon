/**
 * Spring 백엔드 에러 응답에서 code를 추출한다.
 *
 * 백엔드는 공통 `ApiErrorResponse` 평면 구조를 쓰지만,
 * 일부 경로는 `{ error: { code, message } }` 중첩 형태일 수 있어 둘 다 처리한다.
 * code가 없으면 undefined — 호출 측 BFF helper가 status 기반 기본 code를 채운다.
 */
export function extractSpringErrorCode(parsed: unknown): string | undefined {
  if (!parsed || typeof parsed !== "object") {
    return undefined;
  }

  if ("code" in parsed && typeof parsed.code === "string") {
    return parsed.code;
  }

  if (
    "error" in parsed &&
    parsed.error &&
    typeof parsed.error === "object" &&
    "code" in parsed.error &&
    typeof parsed.error.code === "string"
  ) {
    return parsed.error.code;
  }

  return undefined;
}
