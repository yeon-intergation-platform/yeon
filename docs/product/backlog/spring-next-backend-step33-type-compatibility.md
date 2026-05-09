# 차수33 타입/날짜/정렬 계약 동등성 체크 포인트
- 생성일시: 2026-05-09T19:23:38.895877
- route.ts 총계: 111
- 검색 파라미터 처리 라우트: 18
- 바디 파싱 라우트: 53
- 형변환 의심 라우트: 10

- **작업내용**: query/body 변환이 많은 라우트 81개를 우선분류해, 타입/날짜/정렬 변환 경계를 계약 항목으로 정리했다.
- **논의 필요**: 변환 실패를 서비스 단에서 막을지, 스키마 단에서 선단속할지.
- **선택지**:
  1. 런타임 변환 허용 + 에러 처리 강화
  2. 입력 스키마로 선단속 강화
- **추천**: 런타임 실패 복구를 전제로 하는 방어적 파싱을 유지하되, 반복 실패 지점은 스키마 반영
- **사용자 방향**: 추천 기준 진행

## 검색 파라미터 처리 라우트
apps/web/src/app/api/v1/counseling-records/route.ts [manual]
apps/web/src/app/api/v1/integrations/googledrive/file/[fileId]/route.ts [manual]
apps/web/src/app/api/v1/integrations/googledrive/files/route.ts [manual]
apps/web/src/app/api/v1/integrations/local/drafts/route.ts [manual]
apps/web/src/app/api/v1/integrations/onedrive/file/[fileId]/route.ts [manual]
apps/web/src/app/api/v1/integrations/onedrive/files/route.ts [manual]
apps/web/src/app/api/v1/life-os/reports/daily/route.ts [safeParse]
apps/web/src/app/api/v1/life-os/reports/weekly/route.ts [safeParse]
apps/web/src/app/api/v1/public-check-sessions/[token]/qr/route.ts [safeParse]
apps/web/src/app/api/v1/public-check-sessions/[token]/route.ts [safeParse]
apps/web/src/app/api/v1/spaces/[spaceId]/member-tabs/[tabId]/fields/route.ts [safeParse]
apps/web/src/app/api/v1/spaces/[spaceId]/members/[memberId]/activity-logs/route.ts [safeParse]
apps/web/src/app/api/v1/spaces/[spaceId]/members/[memberId]/board-history/route.ts [safeParse]
apps/web/src/app/api/v1/spaces/[spaceId]/members/[memberId]/counseling-records/route.ts [manual]
apps/web/src/app/api/v1/spaces/[spaceId]/members/[memberId]/field-values/route.ts [safeParse]
apps/web/src/app/api/v1/spaces/[spaceId]/public-check-locations/route.ts [manual]
apps/web/src/app/api/v1/spaces/[spaceId]/student-board/route.ts [safeParse]
apps/web/src/app/api/v1/typing-decks/route.ts [safeParse]

## 형변환/타입 변환 의심 라우트
- apps/web/src/app/api/v1/chat-service/auth/verify-otp/route.ts
- apps/web/src/app/api/v1/counseling-records/[recordId]/chat/route.ts
- apps/web/src/app/api/v1/counseling-records/route.ts
- apps/web/src/app/api/v1/integrations/local/analyze/route.ts
- apps/web/src/app/api/v1/integrations/local/drafts/route.ts
- apps/web/src/app/api/v1/mobile/auth/credentials/login/route.ts
- apps/web/src/app/api/v1/spaces/[spaceId]/members/[memberId]/activity-logs/route.ts
- apps/web/src/app/api/v1/spaces/[spaceId]/members/[memberId]/counseling-records/route.ts
- apps/web/src/app/api/v1/spaces/[spaceId]/sheet-export/import/route.ts
- apps/web/src/app/api/v1/spaces/[spaceId]/sheet-export/sync/route.ts
