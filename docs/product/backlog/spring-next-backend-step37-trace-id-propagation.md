# 차수37 요청 추적 헤더 전달 확인
- 생성일시: 2026-05-09T19:24:12.988626
- 대상 route.ts: 111
- 추적 헤더 직접 처리 라우트: 0

- **작업내용**: 111개 라우트에서 트레이스 헤더 직접 전달이 없는 점을 확인하고 미들웨어 레벨 전달 체계를 점검 대상으로 삼았다.
- **논의 필요**: traceId seed 권한을 Next 혹은 Spring 어느 쪽에서 생성할지.
- **선택지**:
  1. Next에서 생성해 Spring으로 상속
  2. Spring에서 생성 후 Next 요청만 상속
- **추천**: Next seed + Spring 상속(현재 브릿지 경로 영향 최소화)
- **사용자 방향**: 추천 기준 진행

## 추적 헤더 키워드 직접 처리 라우트(예비)

## 자동 프록시 추정(직접 헤더 처리 미확인)
- apps/web/src/app/api/v1/auth/session/route.ts
- apps/web/src/app/api/v1/card-decks/[deckId]/items/[itemId]/review/route.ts
- apps/web/src/app/api/v1/card-decks/[deckId]/items/[itemId]/route.ts
- apps/web/src/app/api/v1/card-decks/[deckId]/items/bulk/route.ts
- apps/web/src/app/api/v1/card-decks/[deckId]/items/route.ts
- apps/web/src/app/api/v1/card-decks/[deckId]/route.ts
- apps/web/src/app/api/v1/card-decks/assets/[...assetKey]/route.ts
- apps/web/src/app/api/v1/card-decks/assets/route.ts
- apps/web/src/app/api/v1/card-decks/merge-guest/route.ts
- apps/web/src/app/api/v1/card-decks/route.ts
- apps/web/src/app/api/v1/card-decks/study-preference/route.ts
- apps/web/src/app/api/v1/chat-service/ask/[postId]/vote/route.ts
- apps/web/src/app/api/v1/chat-service/ask/route.ts
- apps/web/src/app/api/v1/chat-service/auth/request-otp/route.ts
- apps/web/src/app/api/v1/chat-service/auth/session/route.ts
- apps/web/src/app/api/v1/chat-service/auth/verify-otp/route.ts
- apps/web/src/app/api/v1/chat-service/chat/open/route.ts
- apps/web/src/app/api/v1/chat-service/chat/rooms/[roomId]/messages/route.ts
- apps/web/src/app/api/v1/chat-service/chat/rooms/[roomId]/route.ts
- apps/web/src/app/api/v1/chat-service/chat/rooms/route.ts
- ...(+91)
