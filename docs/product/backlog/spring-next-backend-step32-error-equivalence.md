# 차수32 회귀성 비교 준비 - 에러 응답/상태 코드 점검
- 생성일시: 2026-05-09T10:23:03.442Z
- route.ts 총계: 111
- ServiceError 포함 라우트: 42
- ServiceError+SpringBackendHttpError 중첩 라우트: 29
- ServiceError만 존재(즉시 전환 필요 후보): 13
- Spring client 위주 라우트: 61

- **작업내용**: 에러 응답 모델을 기준으로 라우트를 세그먼트 분류해, 즉시 Spring 동등성 검증 대상(13개)과 1차 비교(29개)를 선별했다.
- **논의 필요**: 에러 메시지 본문까지 동일 비교할지, 상태코드/코드 중심 동등성으로 완화할지.
- **선택지**:
  1. 메시지 1:1 동일성까지 강제
  2. 상태코드+에러코드 중심 + 메시지 허용 오차 허용
- **추천**: 상태/코드 중심 검증으로 시작, 메시지 회귀는 예외 허용 폭으로 추적
- **사용자 방향**: 추천 기준 진행

## ServiceError만 존재하는 라우트(이관 완료 상태 점검 필요)

- apps/web/src/app/api/v1/card-decks/assets/[...assetKey]/route.ts
- apps/web/src/app/api/v1/card-decks/assets/route.ts
- apps/web/src/app/api/v1/chat-service/auth/request-otp/route.ts
- apps/web/src/app/api/v1/chat-service/auth/session/route.ts
- apps/web/src/app/api/v1/chat-service/auth/verify-otp/route.ts
- apps/web/src/app/api/v1/counseling-records/[recordId]/analyze/route.ts
- apps/web/src/app/api/v1/counseling-records/[recordId]/chat/route.ts
- apps/web/src/app/api/v1/counseling-records/[recordId]/segments/[segmentId]/route.ts
- apps/web/src/app/api/v1/counseling-records/[recordId]/segments/bulk/route.ts
- apps/web/src/app/api/v1/counseling-records/[recordId]/transcribe/route.ts
- apps/web/src/app/api/v1/integrations/local/analyze/route.ts
- apps/web/src/app/api/v1/spaces/[spaceId]/export/csv/route.ts
- apps/web/src/app/api/v1/spaces/[spaceId]/export/xlsx/route.ts

## ServiceError와 Spring 예외가 모두 존재(상태/메시지 동등성 체크 용이)

- apps/web/src/app/api/v1/chat-service/ask/[postId]/vote/route.ts
- apps/web/src/app/api/v1/chat-service/ask/route.ts
- apps/web/src/app/api/v1/chat-service/chat/open/route.ts
- apps/web/src/app/api/v1/chat-service/chat/rooms/[roomId]/messages/route.ts
- apps/web/src/app/api/v1/chat-service/chat/rooms/[roomId]/route.ts
- apps/web/src/app/api/v1/chat-service/chat/rooms/route.ts
- apps/web/src/app/api/v1/chat-service/feed/[postId]/replies/route.ts
- apps/web/src/app/api/v1/chat-service/feed/route.ts
- apps/web/src/app/api/v1/chat-service/friends/overview/route.ts
- apps/web/src/app/api/v1/chat-service/friends/requests/route.ts
- apps/web/src/app/api/v1/chat-service/profile/me/route.ts
- apps/web/src/app/api/v1/chat-service/profiles/[profileId]/block/route.ts
- apps/web/src/app/api/v1/chat-service/profiles/[profileId]/route.ts
- apps/web/src/app/api/v1/chat-service/reports/route.ts
- apps/web/src/app/api/v1/counseling-records/analyze-trend/route.ts
- apps/web/src/app/api/v1/counseling-records/route.ts
- apps/web/src/app/api/v1/integrations/googledrive/analyze/route.ts
- apps/web/src/app/api/v1/integrations/googledrive/auth/route.ts
- apps/web/src/app/api/v1/integrations/onedrive/analyze/route.ts
- apps/web/src/app/api/v1/integrations/onedrive/auth/route.ts
- apps/web/src/app/api/v1/spaces/[spaceId]/members/[memberId]/profile-import/route.ts
- apps/web/src/app/api/v1/spaces/[spaceId]/sheet-export/import/route.ts
- apps/web/src/app/api/v1/spaces/[spaceId]/sheet-export/sync/route.ts
- apps/web/src/app/api/v1/typing-decks/[deckId]/passages/[passageId]/route.ts
- apps/web/src/app/api/v1/typing-decks/[deckId]/passages/bulk/route.ts
- apps/web/src/app/api/v1/typing-decks/[deckId]/passages/route.ts
- apps/web/src/app/api/v1/typing-decks/[deckId]/race-seed/route.ts
- apps/web/src/app/api/v1/typing-decks/[deckId]/route.ts
- apps/web/src/app/api/v1/typing-decks/route.ts
