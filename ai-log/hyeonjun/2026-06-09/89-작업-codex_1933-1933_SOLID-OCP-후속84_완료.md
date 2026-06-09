# 89. SOLID OCP 후속 84

## 대상

- 300개 SOLID/예외 원칙 적용 백로그 항목 281
- `apps/mobile/src/features/card-service/use-card-deck-play-state.ts`

## 변경

- 카드 학습 상세 조회 source 판정을 `createCardDeckPlayDetailReader`로 분리했다.

## 검증

- 완료: `pnpm --filter @yeon/mobile lint`
- 완료: `pnpm --filter @yeon/mobile typecheck`
- 완료: `pnpm verify:parity`
- 완료: `git diff --check`
