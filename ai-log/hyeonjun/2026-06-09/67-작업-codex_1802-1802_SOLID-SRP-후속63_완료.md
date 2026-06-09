# SOLID/예외 300 백로그 후속 63

- 항목: 218
- 대상: `apps/web/src/features/card-service/components/add-card-form.tsx`
- 원칙: SRP(S)
- 변경:
  - draft localStorage load/save, beforeunload guard, upload pending, submit mutation, action state 파생을 `use-add-card-form-state.ts`로 분리.
  - `AddCardForm`은 에디터와 미리보기 렌더링, form shell만 담당하도록 축소.
  - 기존 `ADD_CARD_FORM_INITIAL_ACTION_STATE`와 `AddCardFormActionState` export 호환은 유지.
- 검증 예정:
  - `CI=true pnpm --filter @yeon/web lint`
  - `CI=true pnpm --filter @yeon/web typecheck`
  - `git diff --check`
