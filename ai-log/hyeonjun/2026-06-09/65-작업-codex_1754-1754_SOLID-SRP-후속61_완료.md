# SOLID/예외 300 백로그 후속 61

- 항목: 216
- 대상: `apps/web/src/features/card-service/card-service-decks-screen.tsx`
- 원칙: SRP(S)
- 변경:
  - 덱 목록 query/view-state 파생, 게스트 덱 개수 확인, merge dialog 상태, analytics 이벤트를 `use-card-service-decks-screen-state.ts`로 분리.
  - 헤더, hero, 덱 목록 section/list 상태 렌더링을 `card-service-decks-screen-parts.tsx`로 분리.
  - `CardServiceDecksScreen`은 page shell과 dialog 조립만 담당하도록 축소.
- 검증 예정:
  - `CI=true pnpm --filter @yeon/web lint`
  - `CI=true pnpm --filter @yeon/web typecheck`
  - `git diff --check`
