# 차수35 멱등성 점검 후보 추출
- 생성일시: 2026-05-09T19:23:50.775397
- 대상 도메인: card-decks ,counseling-records ,spaces
- 검사 라우트: 43

- **작업내용**: mutation 라우트 43개를 대상으로 중복요청 노출 지점을 추출해 멱등성 키 미확보 구간을 분리했다.
- **논의 필요**: 멱등성 키 정책을 즉시 일괄 적용할지, 경합 빈도 상위부터 단계적 적용할지.
- **선택지**:
  1. 즉시 전 항목에 멱등성 키를 적용
  2. 경합 우선순위 상위부터 단계적 확장
- **추천**: 경합 우선 단계적 적용으로 리스크를 줄인다.
- **사용자 방향**: 추천 기준 진행

## 멱등성 키워드 미확보 후보
- apps/web/src/app/api/v1/card-decks/[deckId]/items/[itemId]/review/route.ts (POST)
- apps/web/src/app/api/v1/card-decks/[deckId]/items/[itemId]/route.ts (DELETE, PATCH)
- apps/web/src/app/api/v1/card-decks/[deckId]/items/bulk/route.ts (POST)
- apps/web/src/app/api/v1/card-decks/[deckId]/items/route.ts (POST)
- apps/web/src/app/api/v1/card-decks/[deckId]/route.ts (DELETE, PATCH)
- apps/web/src/app/api/v1/card-decks/assets/route.ts (POST)
- apps/web/src/app/api/v1/card-decks/merge-guest/route.ts (POST)
- apps/web/src/app/api/v1/card-decks/route.ts (POST)
- apps/web/src/app/api/v1/card-decks/study-preference/route.ts (PATCH)
- apps/web/src/app/api/v1/counseling-records/[recordId]/analyze/route.ts (POST)
- apps/web/src/app/api/v1/counseling-records/[recordId]/chat/route.ts (DELETE, POST)
- apps/web/src/app/api/v1/counseling-records/[recordId]/route.ts (DELETE, PATCH)
- apps/web/src/app/api/v1/counseling-records/[recordId]/segments/[segmentId]/route.ts (PATCH)
- apps/web/src/app/api/v1/counseling-records/[recordId]/segments/bulk/route.ts (PATCH)
- apps/web/src/app/api/v1/counseling-records/[recordId]/transcribe/route.ts (POST)
- apps/web/src/app/api/v1/counseling-records/analyze-trend/route.ts (POST)
- apps/web/src/app/api/v1/counseling-records/details/route.ts (POST)
- apps/web/src/app/api/v1/counseling-records/route.ts (POST)
- apps/web/src/app/api/v1/spaces/[spaceId]/apply-template/route.ts (POST)
- apps/web/src/app/api/v1/spaces/[spaceId]/member-fields/[fieldId]/route.ts (DELETE, PATCH)
- apps/web/src/app/api/v1/spaces/[spaceId]/member-tabs/[tabId]/fields/reorder/route.ts (PATCH)
- apps/web/src/app/api/v1/spaces/[spaceId]/member-tabs/[tabId]/fields/route.ts (POST)
- apps/web/src/app/api/v1/spaces/[spaceId]/member-tabs/[tabId]/route.ts (DELETE, PATCH)
- apps/web/src/app/api/v1/spaces/[spaceId]/member-tabs/reorder/route.ts (PATCH)
- apps/web/src/app/api/v1/spaces/[spaceId]/member-tabs/reset/route.ts (POST)
- apps/web/src/app/api/v1/spaces/[spaceId]/member-tabs/route.ts (POST)
- apps/web/src/app/api/v1/spaces/[spaceId]/members/[memberId]/activity-logs/route.ts (POST)
- apps/web/src/app/api/v1/spaces/[spaceId]/members/[memberId]/field-values/route.ts (PATCH)
- apps/web/src/app/api/v1/spaces/[spaceId]/members/[memberId]/profile-import/route.ts (POST)
- apps/web/src/app/api/v1/spaces/[spaceId]/members/[memberId]/route.ts (DELETE, PATCH)
- apps/web/src/app/api/v1/spaces/[spaceId]/members/bulk-delete/route.ts (POST)
- apps/web/src/app/api/v1/spaces/[spaceId]/members/route.ts (POST)
- apps/web/src/app/api/v1/spaces/[spaceId]/public-check-sessions/[sessionId]/route.ts (PATCH)
- apps/web/src/app/api/v1/spaces/[spaceId]/route.ts (DELETE, PATCH)
- apps/web/src/app/api/v1/spaces/[spaceId]/sheet-export/import/route.ts (POST)
- apps/web/src/app/api/v1/spaces/[spaceId]/sheet-export/route.ts (DELETE, POST)
- apps/web/src/app/api/v1/spaces/[spaceId]/sheet-export/sync/route.ts (POST)
- apps/web/src/app/api/v1/spaces/[spaceId]/sheet-integrations/[integrationId]/sync/route.ts (POST)
- apps/web/src/app/api/v1/spaces/[spaceId]/sheet-integrations/route.ts (POST)
- apps/web/src/app/api/v1/spaces/[spaceId]/snapshot-template/route.ts (POST)
- apps/web/src/app/api/v1/spaces/[spaceId]/student-board/[memberId]/route.ts (PATCH)
- apps/web/src/app/api/v1/spaces/[spaceId]/student-board/route.ts (POST)
- apps/web/src/app/api/v1/spaces/route.ts (POST)

## 멱등성 키워드 확보 후보
