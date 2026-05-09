# 차수34 Next↔Spring 브릿지 호환성 확인
- 생성일시: 2026-05-09T19:23:33.096770
- 분석 대상: route.ts 111개
- 쿠키/세션 키워드 포함 라우트: 20개
- 인증 의존 라우트: 9개
- chat-service auth 브릿지 라우트: 7개

- **작업내용**: Next 브릿지로 남겨야 할 인증/세션 의존 라우트를 20개로 추려, 브릿지 제거 우선순위와 남길 한계를 정의했다.
- **논의 필요**: 브릿지 유지 기간을 기능별로 다르게 둘지, 전 도메인 공통 날짜로 둘지.
- **선택지**:
  1. 기능 중요도 기준으로 브릿지 단계적 제거
  2. 기간 기준으로 일괄 제거
- **추천**: 기능 중요도와 장애 이력 우선으로 브릿지 축소
- **사용자 방향**: 추천 기준 진행

## 인증 의존 라우트(전체)
- apps/web/src/app/api/v1/auth/session/route.ts
- apps/web/src/app/api/v1/card-decks/merge-guest/route.ts
- apps/web/src/app/api/v1/chat-service/profile/me/route.ts
- apps/web/src/app/api/v1/counseling-records/[recordId]/chat/route.ts
- apps/web/src/app/api/v1/counseling-records/route.ts
- apps/web/src/app/api/v1/mobile/auth/credentials/login/route.ts
- apps/web/src/app/api/v1/spaces/[spaceId]/public-check-sessions/[sessionId]/route.ts
- apps/web/src/app/api/v1/spaces/[spaceId]/student-board/route.ts
- apps/web/src/app/api/v1/users/route.ts

## chat-service auth 브릿지 라우트
- apps/web/src/app/api/v1/chat-service/auth/request-otp/route.ts
- apps/web/src/app/api/v1/chat-service/auth/session/route.ts
- apps/web/src/app/api/v1/chat-service/auth/verify-otp/route.ts
- apps/web/src/app/api/v1/integrations/googledrive/auth/callback/route.ts
- apps/web/src/app/api/v1/integrations/googledrive/auth/route.ts
- apps/web/src/app/api/v1/integrations/onedrive/auth/callback/route.ts
- apps/web/src/app/api/v1/integrations/onedrive/auth/route.ts
