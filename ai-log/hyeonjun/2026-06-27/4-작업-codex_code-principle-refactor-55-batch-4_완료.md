# 4 작업 codex code-principle-refactor 55 batch 4 완료

## 목표

- 타자 deck form mode 분기와 territory phase raw 분기를 정리해 30~32번 원칙 위반을 닫는다.

## 변경

- `TypingDeckForm`에서 create/edit 판정을 `isCreateMode`로 단일화.
- `getTerritoryPhaseLabel`을 if-chain에서 phase label mapping으로 변경.
- territory submit guard의 raw `"playing"` 비교를 `TERRITORY_BATTLE_PHASE.PLAYING` constant로 교체.
- phase label 단위 테스트를 추가.

## 검증

- `pnpm --filter @yeon/web exec vitest run src/features/typing-service/use-territory-battle-room.test.ts`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`

## 결과

- 완료 태스크: 30~32
- 누적 완료: 22/55
- 상태: 완료.
