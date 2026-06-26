# 19 작업 codex policy-state-machine-hardening batch 4 완료

## 범위

- 카드 학습 play index 파싱, clamp, 이전/다음 이동 가능 조건을 `@yeon/ui` card-deck port 정책으로 이동했다.
- 복습 모드 채점 가능 조건을 `currentItemId`, 정답 공개 여부, 저장 중 여부로 고정했다.
- web/mobile 카드 학습 화면이 같은 정책 함수를 사용하도록 연결했다.
- Universal UI parity 검사를 통해 추가 registry entry 없이 기존 공유 정책 범위에서 통과함을 확인했다.

## 변경 파일

- `packages/ui/src/runtime/ports/card-deck/play-policy.ts`
- `packages/ui/src/runtime/ports/card-deck/index.ts`
- `apps/web/src/features/card-service/deck-play-policy.test.ts`
- `apps/web/src/features/card-service/hooks/use-deck-play-state.ts`
- `apps/web/src/features/card-service/deck-play-screen.tsx`
- `apps/mobile/src/features/card-service/use-card-deck-play-state.ts`
- `docs/product/backlog/2026-06-26-policy-state-machine-hardening-50.md`

## 검증

- `pnpm --filter @yeon/web test -- src/features/card-service/deck-play-policy.test.ts`
  - web Vitest 228개 파일 / 1016개 테스트 통과
- `pnpm --filter @yeon/ui lint`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/mobile lint`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/mobile typecheck`
- `pnpm --filter @yeon/ui typecheck`
- `pnpm verify:parity`
- `bash bin/verify-ssot.sh --project-only`
- `git diff --check`

## 장부

- 완료 태스크: 37, 38, 46
- 누적 완료: 34/50
