# SOLID/예외 300 백로그 후속 62

- 항목: 217
- 대상: `apps/web/src/features/card-service/card-service-home.tsx`
- 원칙: SRP(S)
- 변경:
  - 인증/프로필/타자 설정/덱 목록 query와 CTA 상태 파생, analytics 부수효과를 `use-card-service-home-state.ts`로 분리.
  - header/help/settings, intro, profile panel, room/deck CTA 렌더링을 `card-service-home-parts.tsx`로 분리.
  - `CardServiceHome`은 page shell과 dialog 조립만 담당하도록 축소.
- 검증 예정:
  - `CI=true pnpm --filter @yeon/web lint`
  - `CI=true pnpm --filter @yeon/web typecheck`
  - `git diff --check`
