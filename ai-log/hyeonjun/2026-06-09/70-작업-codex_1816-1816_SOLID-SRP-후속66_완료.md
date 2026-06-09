# SOLID/예외 300 백로그 후속 66

- 항목: 221
- 대상: `apps/web/src/features/card-service/components/bulk-add-cards-form.tsx`
- 원칙: SRP(S)
- 변경:
  - raw 입력, help visibility event, parser 결과, preview count, add/replace mutation submit, action state 파생을 `use-bulk-add-cards-form-state.ts`로 분리.
  - `BulkAddCardsForm`은 입력/help/status/preview 렌더링만 담당하도록 축소.
  - 기존 `BULK_ADD_CARDS_FORM_INITIAL_ACTION_STATE`와 `BulkAddCardsFormActionState` export 호환 유지.
- 검증 예정:
  - `CI=true pnpm --filter @yeon/web lint`
  - `CI=true pnpm --filter @yeon/web typecheck`
  - `git diff --check`
