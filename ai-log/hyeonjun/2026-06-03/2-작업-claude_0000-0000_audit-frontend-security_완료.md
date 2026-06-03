# 작업: 프론트 정합/보안 audit 수정 (idx 133,137,138,142,144,158,160)

- 실행 주체: claude
- 대상 브랜치: codex/auth-menu-hidden-guest
- 날짜: 2026-06-03

## 처리 내역

### [158] apps/mobile/src/services/card-service/query-keys.ts + 호출부

- `deck(deckId, isSignedIn)` → `deckDetail: cardDeckQueryKeys.detail` (SSOT 직접 참조)
- 인자 순서 `(isAuthenticated, deckId)` — web adapter와 동일
- 호출부: card-deck-play-screen.tsx, card-deck-detail-screen.tsx, query-keys.test.ts 전수 수정

### [160] packages/ui/eslint.config.mjs (신규)

- src/patterns/**, src/runtime/ports/** 에 universalUiBoundary 적용
- src/primitives/\*\* 는 의도적으로 제외(플랫폼 어댑터 경계 자체)

### [133] apps/mobile/src/features/card-service/card-markdown.tsx

- 고정 height:180 → onLoad로 aspectRatio 계산, maxHeight:320 상한
- AdaptiveImage 컴포넌트 도입, useState + onLoad 기반

### [137] packages/ui/src/patterns/YeonEditableCardRow/index.native.tsx

- startY 상태 추가, deltaY > deltaX 일 때 스와이프 판정 무시
- 세로 스크롤 중 의도치 않은 삭제 노출 방지

### [138] packages/ui/src/patterns/YeonStudyCard/index.native.tsx

- YeonScrollView에 `scrollEnabled={false}` 추가
- 버튼 tap과 스크롤 제스처 경합 제거(최소 변경)

### [142] apps/web/src/server/auth/handlers.ts + apps/mobile/src/features/card-service/social-login.ts

- buildMobileReturnLocation: sensitiveParams → URL fragment(#), publicParams → querystring
- 세션 토큰/expiresAt은 fragment, 에러 코드는 querystring으로 분리
- 모바일 social-login.ts: parseFragment() 헬퍼 추가, result.url fragment 직접 파싱

### [144] apps/mobile/src/services/primary-auth/storage.ts

- localStorage → sessionStorage 폴백으로 교체(탭 닫힘 시 자동 소거)
- getYeonOptionalLocalStorage import 제거, 직접 globalThis.sessionStorage 사용
- 보안 주의 주석 업데이트

## 처리 7 / 스킵 0
