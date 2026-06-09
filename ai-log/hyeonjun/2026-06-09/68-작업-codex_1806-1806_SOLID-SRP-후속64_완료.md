# SOLID/예외 300 백로그 후속 64

- 항목: 219
- 대상: `apps/web/src/features/card-service/components/add-card-form.tsx`
- 원칙: SRP(S)
- 변경:
  - 질문/답변 에디터와 앞/뒷면 미리보기 렌더링을 `add-card-form-parts.tsx`로 분리.
  - `AddCardForm`은 form shell과 `useAddCardFormState` 연결만 담당하도록 축소.
- 검증 예정:
  - `CI=true pnpm --filter @yeon/web lint`
  - `CI=true pnpm --filter @yeon/web typecheck`
  - `git diff --check`
