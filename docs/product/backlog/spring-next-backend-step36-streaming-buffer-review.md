# 차수36 업로드/스트리밍 라우트 분류
- 생성일시: 2026-05-09T19:24:01.266015
- 대상 route.ts: 111
- formData 사용 라우트: 6
- 스트리밍/바이너리 키워드 라우트: 3

- **작업내용**: 폼데이터/바이너리/스트림 처리 후보 라우트를 분리해 업로드/처리 지연 위험 구간을 선별했다.
- **논의 필요**: 공통 버퍼 정책 통합/분리 여부.
- **선택지**:
  1. Next와 동일한 버퍼 기본값 유지
  2. API별 별도 튜닝
- **추천**: 기존 동작 유지 + 경합 구간만 미세 튜닝
- **사용자 방향**: 추천 기준 진행

## formData/멀티파트 추정 라우트
- apps/web/src/app/api/v1/card-decks/assets/[...assetKey]/route.ts
- apps/web/src/app/api/v1/card-decks/assets/route.ts
- apps/web/src/app/api/v1/counseling-records/[recordId]/chat/route.ts
- apps/web/src/app/api/v1/counseling-records/route.ts
- apps/web/src/app/api/v1/integrations/local/analyze/route.ts
- apps/web/src/app/api/v1/spaces/[spaceId]/members/[memberId]/profile-import/route.ts

## 스트리밍/대용량 전송 추정 라우트

- apps/web/src/app/api/v1/card-decks/assets/[...assetKey]/route.ts
- apps/web/src/app/api/v1/counseling-records/[recordId]/chat/route.ts
- apps/web/src/app/api/v1/integrations/local/analyze/route.ts
