# SOLID/예외 300 백로그 후속 65

- 항목: 220
- 대상: `apps/web/src/features/card-service/components/add-cards-panel.tsx`
- 원칙: SRP(S)
- 변경:
  - 모드/form id/dirty/action state/닫기 guard를 `use-add-cards-panel-state.tsx`로 분리.
  - footer, 모드 tab, manual/bulk body 렌더링을 `add-cards-panel-parts.tsx`로 분리.
  - `AddCardsPanel`은 ResponsiveModal shell 조립만 담당하도록 축소.
- 검증 예정:
  - `CI=true pnpm --filter @yeon/web lint`
  - `CI=true pnpm --filter @yeon/web typecheck`
  - `git diff --check`
