# 21차 작업 — repo-wide next backend migration inventory

- 시작: 06:35
- 상태: 작업중

## 목표
- `apps/web`에 남아 있는 Next backend logic 전체 범위를 실측하고, 다음 smallest Spring migration lane을 고정한다.

## 진행
- route/service 실측을 수행했다.
- 이미 Spring migration된 축과 남은 큰 도메인을 분리했다.
- 다음 smallest lane을 `members CRUD`로 고정했다.
- 다음 smallest lane으로 members CRUD Spring cutover 구현을 시작했다.
- Spring `members` CRUD 패키지와 controller/service/repository/test를 추가했다.
- Next members route layer를 Spring client 기반 thin BFF로 전환했다.
  - `spaces/[spaceId]/members`
  - `spaces/[spaceId]/members/[memberId]`
  - `spaces/[spaceId]/members/bulk-delete`
  - `members/[memberId]`
- members 검증/존재 확인에 의존하던 보조 route도 Spring lookup으로 바꿨다.
  - `members/[memberId]/profile-import`
  - `members/[memberId]/counseling-records`
- `members-service.ts`는 다른 도메인(`student-board`, `counseling-records`, `activity-logs`)이 아직 직접 사용 중이라 삭제하지 않고 유지했다.
- 삭제됐던 `apps/web/src/server/services/__tests__/members-service.test.ts`는 복구했다.

## 검증
- `./gradlew test --tests 'world.yeon.backend.members.*'` ✅
- `pnpm --filter @yeon/web exec vitest run 'src/app/api/v1/spaces/[spaceId]/members/__tests__/route.test.ts' 'src/app/api/v1/spaces/[spaceId]/members/[memberId]/__tests__/route.test.ts' 'src/app/api/v1/spaces/[spaceId]/members/bulk-delete/__tests__/route.test.ts' 'src/app/api/v1/members/[memberId]/__tests__/route.test.ts'` ✅
- `pnpm --filter @yeon/web typecheck` ✅
- `pnpm --filter @yeon/web build` ✅
- `git diff --check` ✅
- `bash bin/sync-skills.sh --check` ✅
- `bash bin/verify-ssot.sh --project-only` ✅

## audit
- members route layer 기준 direct `members-service` import 없음
- members route layer 기준 direct `getDb()` / `requireSpaceInternalIdByPublicId` 없음

## 다음
- members route layer thin BFF화는 완료로 본다.
- activity-logs route layer thin BFF화도 완료했다.
- student-board member board-history read lane도 완료했다.
- public-check session PATCH lane도 완료했다.
- public-check session CREATE lane도 완료했다.
- 다음 smallest lane 실측 결과, `student-board/[memberId] PATCH`는 full board 응답 때문에 `student-board GET read`에 재의존한다.
- 그래서 다음 차수는 `student-board GET read` Spring cutover로 고정했다.
- `student-board GET read` Spring cutover도 완료했다.
- `student-board/[memberId] PATCH` Spring cutover도 완료했다.
- repo-wide 목표는 아직 미완료다.
- `student-board` route layer는 GET/PATCH 기준 thin BFF화 완료로 본다.
- `public-check-service` runtime flow Spring cutover도 완료했다.
- `public-check-locations` route의 owned-space direct check 제거도 완료했다.
- dead legacy file cleanup도 완료했다.
  - `public-check-service.ts` 삭제
  - `student-board-service.ts` 삭제
- 이제 student-board / public-check 축의 legacy Next backend 파일은 route layer 기준뿐 아니라 dead service file 기준으로도 정리됐다.
- `home-insight-banner` read/write Spring cutover와 dead service cleanup도 완료했다.
- 다음 smallest migration lane은 다른 도메인(`users`, `life-os`, `counseling-records`, `import-*`) 쪽 inventory 재실측이다.

- `users` list/create Spring cutover도 완료했다.
- `apps/web/src/app/api/v1/users/**`는 thin BFF화 완료로 본다.
- `users-service.ts`와 관련 test 삭제까지 마쳤다.
- 다음 smallest migration lane은 `life-os` vs `import-*` vs `counseling-records` 재실측이 필요하다.

- `life-os` days/read/write/report Spring cutover도 완료했다.
- `apps/web/src/app/api/v1/life-os/**`는 thin BFF화 완료로 본다.
- `life-os-service.ts` 삭제까지 마쳤다.
- 다음 smallest migration lane은 `import-*` vs `counseling-records` 재실측이 필요하다.

- `local import drafts` route layer Spring cutover도 완료했다.
- `apps/web/src/app/api/v1/integrations/local/drafts/**`는 thin BFF화 완료로 본다.
- `import-drafts-service.ts`는 analyze/shared consumer 때문에 아직 남아 있다.
- 다음 smallest migration lane은 `local analyze/import orchestration` vs `counseling-records` 재실측이 필요하다.


- `import commit orchestration` Spring cutover도 완료했다.
- 공통 import commit 경로인 `apps/web/src/app/api/v1/integrations/_shared.ts`에서 direct `importPreviewIntoSpaces` / `markImportDraftImporting` / `markImportDraftImported` 호출을 제거했다.
- local / googledrive / onedrive import commit route는 이제 Spring `import_commit` API를 통해 commit orchestration을 수행한다.
- `apps/web/src/app/api/v1/integrations/_shared.ts` 기준 commit path는 thin BFF화 완료로 본다.
- analyze flow와 draft lifecycle 일부는 아직 Next에 남아 있으므로 repo-wide 목표는 계속 미완료다.


- `spaces CRUD` Spring cutover도 완료했다.
- `apps/web/src/app/api/v1/spaces/route.ts`와 `apps/web/src/app/api/v1/spaces/[spaceId]/route.ts`에서 direct `spaces-service` / `member-tabs-service` 의존을 제거했다.
- space 생성 시 default system tabs + overview fields bootstrap도 Spring transaction 안으로 이동했다.
- `apps/web/src/app/api/v1/spaces/**` 기준 route layer는 thin BFF화 완료로 본다.


- `card-decks merge-guest` Spring cutover도 완료했다.
- `apps/web/src/app/api/v1/card-decks/merge-guest/route.ts`에서 direct `merge-guest-card-decks-service` 의존을 제거했다.
- guest deck import transaction은 Spring `card_decks.merge_guest` package로 이동했다.
- dead file `apps/web/src/server/services/merge-guest-card-decks-service.ts`도 삭제했다.


- `public-check-location-search` Spring cutover도 완료했다.
- `apps/web/src/app/api/v1/spaces/[spaceId]/public-check-locations/route.ts`에서 direct `public-check-location-search-service`와 ownership precheck 의존을 제거했다.
- Kakao local search + owned-space check는 Spring `public_check_locations` package로 이동했다.
- dead file `apps/web/src/server/services/public-check-location-search-service.ts`와 관련 test도 삭제했다.


- `member-risk-profile` Spring cutover도 완료했다.
- `apps/web/src/app/api/v1/members/[memberId]/route.ts`와 `apps/web/src/app/api/v1/spaces/[spaceId]/members/route.ts`에서 direct `member-risk-service` 의존을 제거했다.
- counseling record 기반 risk profile 집계는 Spring `member_risk_profiles` package로 이동했다.
- `member-risk-service.ts`는 아직 `members-service.ts` 내부 보조 의존이 남아 있어 파일 자체는 유지했다.


## 40차 — typing-decks route Spring pilot 완료
- 완료 범위
  - `/api/v1/typing-decks`
  - `/api/v1/typing-decks/[deckId]`
  - `/api/v1/typing-decks/[deckId]/passages`
  - `/api/v1/typing-decks/[deckId]/passages/bulk`
  - `/api/v1/typing-decks/[deckId]/passages/[passageId]`
  - `/api/v1/typing-decks/[deckId]/race-seed`
- 핵심 결과
  - route layer direct `typing-decks-service` 제거
  - DB-backed CRUD/race-seed Spring 이동
  - default deck static catalog/detail은 local helper 유지
- 검증
  - backend typing_decks tests ✅
  - web typing-decks route vitest ✅
  - web typecheck/build ✅


## 41차 — card-decks route Spring pilot 완료
- 완료 범위
  - `/api/v1/card-decks`
  - `/api/v1/card-decks/study-preference`
  - `/api/v1/card-decks/[deckId]`
  - `/api/v1/card-decks/[deckId]/items`
  - `/api/v1/card-decks/[deckId]/items/bulk`
  - `/api/v1/card-decks/[deckId]/items/[itemId]`
  - `/api/v1/card-decks/[deckId]/items/[itemId]/review`
- 핵심 결과
  - route layer direct `card-decks-service` 제거
  - deck/item CRUD + study-preference + review Spring 이동
  - dead Next card-decks service/test 삭제
- 검증
  - backend card_decks.route tests ✅
  - web card-decks route vitest ✅
  - web typecheck/build ✅


## 42차 — googledrive browser Spring pilot 완료
- 완료 범위
  - `/api/v1/integrations/googledrive/status`
  - `/api/v1/integrations/googledrive/files`
  - `/api/v1/integrations/googledrive/file/[fileId]`
- 핵심 결과
  - route layer direct `googledrive-service` 제거
  - token 조회/갱신 + Drive files list/content download를 Spring 이동
  - OAuth start/callback, analyze/import는 이번 차수 범위 밖 유지
- 검증
  - backend googledrive_browser tests ✅
  - web googledrive route vitest ✅
  - web typecheck/build ✅


## 43차 — onedrive browser Spring pilot 완료
- 완료 범위
  - `/api/v1/integrations/onedrive/status`
  - `/api/v1/integrations/onedrive/files`
  - `/api/v1/integrations/onedrive/file/[fileId]`
- 핵심 결과
  - route layer direct `onedrive-service` 제거
  - token 조회/갱신 + Graph files list/content download를 Spring 이동
  - OAuth start/callback, analyze/import는 이번 차수 범위 밖 유지
- 검증
  - backend onedrive_browser tests ✅
  - web onedrive route vitest ✅
  - web typecheck/build ✅


## 44차 — cloud analyze transport Spring pilot 완료
- 완료 범위
  - `/api/v1/integrations/googledrive/analyze`
  - `/api/v1/integrations/onedrive/analyze`
- 핵심 결과
  - route layer direct `googledrive-service` / `onedrive-service` 제거
  - browser Spring endpoint를 재사용해 cloud file byte download를 Spring 이동
  - draft lifecycle / analyzeBuffer / SSE는 아직 Next 유지
- 검증
  - web analyze route vitest ✅
  - web `_shared` vitest ✅
  - web typecheck/build ✅


## 45차 — cloud oauth route Spring pilot 완료
- 완료 범위
  - `/api/v1/integrations/googledrive/auth`
  - `/api/v1/integrations/googledrive/auth/callback`
  - `/api/v1/integrations/onedrive/auth`
  - `/api/v1/integrations/onedrive/auth/callback`
- 핵심 결과
  - route layer direct `googledrive-service` / `onedrive-service` 제거
  - oauth url 생성, code exchange, token save를 Spring 이동
  - cookie state/user 관리와 redirect 응답은 Next 유지
- 검증
  - backend oauth controller tests ✅
  - web auth route vitest ✅
  - web typecheck/build ✅


## 46차 — counseling-record students Spring pilot 완료
- 완료 범위
  - `/api/v1/counseling-records/students`
- 핵심 결과
  - route layer direct `counseling-records-service` 제거
  - 학생명별 record count / first / last counseling 집계를 Spring read endpoint로 이동
- 검증
  - backend counseling_record_students tests ✅
  - web counseling-record students route vitest ✅
  - web typecheck/build ✅


## 47차 — member counseling-records Spring pilot 완료
- 완료 범위
  - `/api/v1/spaces/[spaceId]/members/[memberId]/counseling-records`
- 핵심 결과
  - route layer direct `counseling-records-service` 제거
  - member별 counseling record list read를 Spring endpoint로 이동
- 검증
  - backend member_counseling_records tests ✅
  - web member counseling-records route vitest ✅
  - web typecheck/build ✅

## 48차 — counseling-record-details Spring pilot 완료
- range:
  - `/api/v1/counseling-records/details`
- backend:
  - `apps/backend/src/main/java/world/yeon/backend/counseling_record_details/**`
  - `apps/backend/src/test/java/world/yeon/backend/counseling_record_details/**`
- web:
  - `apps/web/src/server/counseling-record-details-spring-client.ts`
  - `apps/web/src/app/api/v1/counseling-records/details/route.ts`
  - `apps/web/src/app/api/v1/counseling-records/details/__tests__/route.test.ts`
- docs/log:
  - `docs/product/backlog/spring-counseling-record-details-pilot.md`
  - `docs/architecture/spring-counseling-record-details-pilot.md`
  - `ai-log/hyeonjun/2026-05-08/48-작업-codex_1711-1720_counseling-record-details-spring-pilot_[완료].md`

## 49차 — counseling-record route read Spring pilot 완료
- range:
  - `/api/v1/counseling-records/[recordId]` GET
- backend:
  - `apps/backend/src/main/java/world/yeon/backend/counseling_record_details/**`
  - `apps/backend/src/test/java/world/yeon/backend/counseling_record_details/**`
- web:
  - `apps/web/src/server/counseling-record-details-spring-client.ts`
  - `apps/web/src/app/api/v1/counseling-records/[recordId]/route.ts`
  - `apps/web/src/app/api/v1/counseling-records/[recordId]/__tests__/route.test.ts`
- docs/log:
  - `docs/product/backlog/spring-counseling-record-route-read-pilot.md`
  - `docs/architecture/spring-counseling-record-route-read-pilot.md`
  - `ai-log/hyeonjun/2026-05-08/49-작업-codex_1721-1732_counseling-record-route-read-spring-pilot_[완료].md`

## 50차 — counseling-record audio Spring pilot 완료
- range:
  - `/api/v1/counseling-records/[recordId]/audio`
- backend:
  - `apps/backend/src/main/java/world/yeon/backend/counseling_record_audio/**`
  - `apps/backend/src/test/java/world/yeon/backend/counseling_record_audio/**`
- web:
  - `apps/web/src/server/counseling-record-audio-spring-client.ts`
  - `apps/web/src/app/api/v1/counseling-records/[recordId]/audio/route.ts`
  - `apps/web/src/app/api/v1/counseling-records/[recordId]/__tests__/audio-route.test.ts`
- docs/log:
  - `docs/product/backlog/spring-counseling-record-audio-pilot.md`
  - `docs/architecture/spring-counseling-record-audio-pilot.md`
  - `ai-log/hyeonjun/2026-05-08/50-작업-codex_1733-1748_counseling-record-audio-spring-pilot_[완료].md`

## 51차 — counseling-record trend-source Spring pilot 완료
- range:
  - `/api/v1/counseling-records/analyze-trend`
- backend:
  - `apps/backend/src/main/java/world/yeon/backend/counseling_record_details/**`
  - `apps/backend/src/test/java/world/yeon/backend/counseling_record_details/**`
- web:
  - `apps/web/src/server/counseling-record-trend-spring-client.ts`
  - `apps/web/src/app/api/v1/counseling-records/analyze-trend/route.ts`
  - `apps/web/src/app/api/v1/counseling-records/analyze-trend/__tests__/route.test.ts`
- docs/log:
  - `docs/product/backlog/spring-counseling-record-trend-source-pilot.md`
  - `docs/architecture/spring-counseling-record-trend-source-pilot.md`
  - `ai-log/hyeonjun/2026-05-08/51-작업-codex_1749-1758_counseling-record-trend-source-spring-pilot_[완료].md`

## 52차 — counseling-record route mutation Spring pilot 완료
- range:
  - `/api/v1/counseling-records/[recordId]` PATCH / DELETE
- backend:
  - `apps/backend/src/main/java/world/yeon/backend/counseling_record_mutation/**`
  - `apps/backend/src/test/java/world/yeon/backend/counseling_record_mutation/**`
- web:
  - `apps/web/src/server/counseling-record-mutation-spring-client.ts`
  - `apps/web/src/app/api/v1/counseling-records/[recordId]/route.ts`
  - `apps/web/src/app/api/v1/counseling-records/[recordId]/__tests__/route.test.ts`
- docs/log:
  - `docs/product/backlog/spring-counseling-record-route-mutation-pilot.md`
  - `docs/architecture/spring-counseling-record-route-mutation-pilot.md`
  - `ai-log/hyeonjun/2026-05-08/52-작업-codex_1759-1810_counseling-record-route-mutation-spring-pilot_[완료].md`

## 53차 — counseling-records root list GET Spring cutover 완료
- route: `apps/web/src/app/api/v1/counseling-records/route.ts` GET
- backend: `world.yeon.backend.counseling_record_list`
- web client: `apps/web/src/server/counseling-record-list-spring-client.ts`
- note: POST 유지, scheduling side effect는 Next helper 유지

## 54차 — chat-service profile read Spring cutover 완료
- route: `apps/web/src/app/api/v1/chat-service/profiles/[profileId]/route.ts`
- backend: `world.yeon.backend.chat_service_profiles`
- web client: `apps/web/src/server/chat-service-profile-spring-client.ts`
- note: chat-service auth/session 해석은 Next 유지

## 55차 — chat-service profile block Spring cutover 완료
- route: `apps/web/src/app/api/v1/chat-service/profiles/[profileId]/block/route.ts`
- backend: `world.yeon.backend.chat_service_blocks`
- web client: `apps/web/src/server/chat-service-block-spring-client.ts`
- note: chat-service auth는 Next 유지, block/unblock mutation만 Spring 이동

## 56차 — chat-service friend request Spring cutover 완료
- route: `apps/web/src/app/api/v1/chat-service/friends/requests/route.ts`
- backend: `world.yeon.backend.chat_service_friend_requests`
- web client: `apps/web/src/server/chat-service-friend-request-spring-client.ts`
- note: chat-service auth는 Next 유지, friend request mutation만 Spring 이동

## 57차 — chat-service friends overview Spring cutover 완료
- route: `apps/web/src/app/api/v1/chat-service/friends/overview/route.ts`
- backend: `world.yeon.backend.chat_service_friends_overview`
- web client: `apps/web/src/server/chat-service-friends-overview-spring-client.ts`
- note: chat-service auth는 Next 유지, overview read만 Spring 이동

## 58차 — chat-service report Spring cutover 완료
- route: `apps/web/src/app/api/v1/chat-service/reports/route.ts`
- backend: `world.yeon.backend.chat_service_reports`
- web client: `apps/web/src/server/chat-service-report-spring-client.ts`
- note: chat-service auth는 Next 유지, report mutation만 Spring 이동


## 59차 — chat-service chat/open Spring pilot 완료
- 완료 범위
  - `/api/v1/chat-service/chat/open`
- 핵심 결과
  - route layer direct `chat-service/chat-service` 제거
  - blocked relation/self interaction guard, existing room lookup, accepted friend link 확인, room 생성, DM unlock 차감/기록을 Spring 이동
  - chat-service auth는 Next 유지
- 검증
  - backend chat_service_chat_open tests ✅
  - web chat/open route vitest ✅
  - web typecheck/build ✅


## 60차 — chat-service chat/rooms Spring pilot 완료
- 완료 범위
  - `/api/v1/chat-service/chat/rooms`
  - `/api/v1/chat-service/chat/rooms/{roomId}`
  - `/api/v1/chat-service/chat/rooms/{roomId}/messages`
- 핵심 결과
  - route layer direct `chat-service/chat-service` 제거
  - room list/detail read, participant ownership check, blocked relation guard, message insert, room lastMessageAt 갱신을 Spring 이동
  - chat-service auth는 Next 유지
- 검증
  - backend chat_service_chat_rooms tests ✅
  - web rooms route vitest ✅
  - web typecheck/build ✅


## 61차 — chat-service feed Spring pilot 완료
- 완료 범위
  - `/api/v1/chat-service/feed`
  - `/api/v1/chat-service/feed/{postId}/replies`
- 핵심 결과
  - route layer direct `feed-service` 제거
  - root/reply list read, blocked relation filtering, reply count aggregation, root/reply post create, parent validation을 Spring 이동
  - chat-service auth는 Next 유지
- 검증
  - backend chat_service_feed tests ✅
  - web feed route vitest ✅
  - web typecheck/build ✅


## 62차 — chat-service ask Spring pilot 완료
- 완료 범위
  - `/api/v1/chat-service/ask`
  - `/api/v1/chat-service/ask/{postId}/vote`
- 핵심 결과
  - route layer direct `ask-service` 제거
  - ask list read, blocked relation filtering, poll option/vote aggregation, ask create, vote upsert, poll validation을 Spring 이동
  - chat-service auth는 Next 유지
- 검증
  - backend chat_service_ask tests ✅
  - web ask route vitest ✅
  - web typecheck/build ✅


## 64차 — chat-service auth Spring pilot (작업중)
- 범위 예정
  - `/api/v1/chat-service/auth/request-otp`
  - `/api/v1/chat-service/auth/session`
  - `/api/v1/chat-service/auth/verify-otp`
- 현재 상태
  - backend `chat_service_auth` package/test skeleton 생성 완료
  - web thin BFF 교체/route test/검증은 아직 미완료
  - 사용자 요청으로 여기서 중단, 다음 턴에 이어서 진행
