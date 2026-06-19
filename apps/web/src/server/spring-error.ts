/**
 * Spring 백엔드 에러 응답에서 code를 추출한다.
 *
 * 백엔드는 `record ErrorResponse(String code, String message)` 평면 구조를 쓰지만,
 * 일부 경로는 `{ error: { code, message } }` 중첩 형태일 수 있어 둘 다 처리한다.
 * code가 없으면 undefined — 호출 측은 message만으로 처리하면 된다.
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
