# 차수38 페이징 파라미터 점검(초안)
- 생성일시: 2026-05-09T19:24:28.501683
- searchParams.get 사용 라우트: 13

- **작업내용**: 페이징/검색 쿼리(13개)에서 limit/offset/cursor/query 처리 차이를 추적해 쿼리 정합성 체크리스트를 만들었다.
- **논의 필요**: cursor/offset 입력값 음수/0 처리 정책 고정치.
- **선택지**:
  1. 기존 Next 처리 유지
  2. 쿼리 정합성 중앙 처리기로 표준화
- **추천**: 기존 처리 유지 후 변이 포인트만 예외 처리
- **사용자 방향**: 추천 기준 진행

## 라우트별 쿼리 파라미터 추출
- apps/web/src/app/api/v1/integrations/googledrive/file/[fileId]/route.ts: mimeType
- apps/web/src/app/api/v1/integrations/googledrive/files/route.ts: folderId
- apps/web/src/app/api/v1/integrations/local/drafts/route.ts: limit
- apps/web/src/app/api/v1/integrations/onedrive/file/[fileId]/route.ts: mimeType
- apps/web/src/app/api/v1/integrations/onedrive/files/route.ts: folderId
- apps/web/src/app/api/v1/public-check-sessions/[token]/qr/route.ts: entry
- apps/web/src/app/api/v1/public-check-sessions/[token]/route.ts: entry
- apps/web/src/app/api/v1/spaces/[spaceId]/member-tabs/[tabId]/fields/route.ts: memberId
- apps/web/src/app/api/v1/spaces/[spaceId]/members/[memberId]/activity-logs/route.ts: limit, type
- apps/web/src/app/api/v1/spaces/[spaceId]/members/[memberId]/board-history/route.ts: period
- apps/web/src/app/api/v1/spaces/[spaceId]/members/[memberId]/counseling-records/route.ts: before, limit
- apps/web/src/app/api/v1/spaces/[spaceId]/public-check-locations/route.ts: query
- apps/web/src/app/api/v1/spaces/[spaceId]/student-board/route.ts: historyPeriod
