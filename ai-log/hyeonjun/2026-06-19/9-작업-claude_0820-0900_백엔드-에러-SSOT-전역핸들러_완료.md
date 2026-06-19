# 백엔드 에러 SSOT: 공통 ApiException + 전역 핸들러 (에러 감사 후속 3단계, 1차)

## 배경

백엔드 75개 컨트롤러가 각자 `public record ErrorResponse(String code, String message) {}` + 도메인별 `@ExceptionHandler`를 중복 정의(SSOT 부재). 도메인 예외는 모두 `(int status, String code, String message)` + `status()`/`code()` 동일 패턴.

## 변경

### 공통 인프라 (신규, world.yeon.backend.common.error)

- `ApiException` (abstract extends RuntimeException, status/code 보유) — 도메인 예외 공통 베이스.
- `ApiErrorResponse` (record(code, message)) — 프론트 계약 errorResponseSchema와 1:1.
- `GlobalApiExceptionHandler` (@RestControllerAdvice) — ApiException을 일관 응답으로 변환. 컨트롤러 로컬 @ExceptionHandler가 우선하므로 미전환(동결) 도메인은 기존 동작 보존.

### 비동결 16개 도메인 전환

card*decks(assets/merge_guest/route), card_rooms, typing_decks, typing_character_frames, community_chat, chat_service*\*(ask/auth/blocks/chat_open/chat_rooms/feed/friend_requests/my_profile/profiles/reports).

- 각 `*ServiceException`: `extends RuntimeException`(status/code 필드+메서드) → `extends ApiException`(super 위임, 중복 제거).
- 각 컨트롤러: 중복 `@ExceptionHandler` + `record ErrorResponse` 삭제(전역 핸들러가 대체). `ErrorResponse`가 다른 용도로 쓰인 3곳은 유지.

## 검증

- `./gradlew compileJava` EXIT=0 (baseline 및 전환 후 재확인).
- 예외 17개 `extends ApiException` 확인. 응답 형태(code, message) 불변.
- 동결/범위밖(counseling/member/student/space/sheet/onedrive/googledrive/life_os/local_import/activity/home_insight/star_lobby/import/public_check/oauth/users/user_experience/public_content/root_auth/credential_auth) 미접촉 확인.
- **런타임 통합 검증은 CI Karate/Testcontainers(Docker)에 위임** — 로컬은 compileJava까지. 응답 형태 동일 + ApiException 상속이라 회귀 위험 낮음. CI 통과 시 자동 머지(--auto)로 게이트.

## 남은 후속

- 비동결 잔여 도메인(auth/users/user_experience/public_content/root_auth/credential_auth 등) 동일 패턴 전환.
- ErrorCode enum 표준화(현재 code 문자열 하드코딩 → 도메인별 상수/enum).
- 동결 도메인은 동결 해제 시 일괄 전환.
