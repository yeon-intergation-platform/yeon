# 백엔드(Spring) 에러 code를 BFF 직접 응답까지 중계 (에러 계약 후속)

## 배경

PR #795로 에러 계약(code/message + 선택 확장)과 api-client 경로 자동 개통은 끝났으나, **BFF 직접 응답 경로**는 백엔드 HTTP 에러(`XxxSpringBackendHttpError`)의 code를 여전히 버렸다. 각 spring-client가 `extractErrorMessage`로 message만 뽑고 code를 무시했기 때문.

## 변경

### 공통 헬퍼

- `apps/web/src/server/spring-error.ts` (신규): `extractSpringErrorCode(parsed)` — 평면 `{ code }`와 중첩 `{ error: { code } }` 모두 처리, 없으면 undefined.

### spring-client 11개 (유지보수 3종)

chat-service-feed/ask/my-profile/chat-open/profile/friends-overview/chat-rooms/friend-request/block + community-chat + typing-decks.

- 각 `XxxSpringBackendHttpError`에 `code?: string` 필드 + 생성자 3번째 인자 추가.
- `if (!response.ok)` throw 시 `extractSpringErrorCode(parsed)`로 code 전달.

### route catch Spring 분기

chat-service 18 route + community-chat/messages + typing-decks route들의 `error instanceof XxxSpringBackendHttpError` 분기를 `(error.message, error.status, { code: error.code })`로 변경. ServiceError 분기(이미 detail 전달)·fallback(500)은 보존.

### 부수 개선

- `typing-decks/_shared.ts`가 **동결 counseling의 `jsonError`를 import**하던 의존을 끊고 자체 정의(detail 지원)로 분리. counseling 파일 자체는 미수정(동결 준수).

## 검증

- 신규 `spring-error.test.ts` 5/5 통과(평면/중첩/없음/비문자열/비객체).
- 영향 도메인 테스트(server/**tests** + chat-service + typing-decks + community-chat): 34 파일 101 테스트 통과(기존 무손상).
- `pnpm --filter @yeon/web typecheck` exit 0 / `lint` exit 0.
- 변경 파일에 동결·범위밖 도메인(counseling/member/student/life-os/sheet/spaces/onedrive/import/activity/home-insight) 미포함 확인.

## 남은 후속(범위 밖)

- 프론트 features의 `error.code` 분기 소비(점진).
- 카드 도메인은 별도 spring-client 에러 중계 경로가 없어 이번 대상 아님(merge-guest의 ServiceError detail은 PR #795에서 완료).
