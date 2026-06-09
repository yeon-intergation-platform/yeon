# 88. SOLID OCP 후속 83

## 대상

- 300개 SOLID/예외 원칙 적용 백로그 항목 280
- `apps/mobile/src/features/card-service/card-deck-detail-screen.tsx`

## 변경

- 카드 상세 sheet mode 잠금 판정을 `deriveSheetModeSwitchPolicy`와 `SHEET_MODE_LOCKED_KINDS`로 분리했다.

## 검증

- 완료: `pnpm --filter @yeon/mobile lint`
- 완료: `pnpm --filter @yeon/mobile typecheck`
- 완료: `pnpm verify:parity`
- 완료: `git diff --check`
