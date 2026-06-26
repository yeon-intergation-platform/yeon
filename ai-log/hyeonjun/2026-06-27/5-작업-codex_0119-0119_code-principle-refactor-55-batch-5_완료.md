# 코드 품질 원칙 위반 리팩터링 55개 - 5차 배치

## 범위

- 태스크 46: 카드 마크다운 코드 복사 실패 메시지 생성 정책 공용화.
- 태스크 49: 카드 덱 날짜 포맷 invalid/missing fallback 검증.
- 태스크 50: 카드 덱 상세 web/mobile created date formatter 중복 제거.

## 변경

- `apps/web/src/features/card-service/components/card-markdown-copy-utils.ts`를 추가해 복사 실패 메시지 생성을 단일화했다.
- `card-markdown-code-block.tsx`, `markdown-content.tsx`가 공용 메시지 helper를 사용하게 했다.
- `packages/ui/src/runtime/ports/card-deck/format.ts`에 invalid/missing 날짜 fallback과 created date formatter alias를 추가했다.
- `deck-detail-header.tsx`, `card-deck-detail-screen.tsx`가 공용 created date formatter를 사용하게 했다.
- 대상 순수 함수 테스트를 추가했다.

## 검증

- `pnpm --filter @yeon/web exec vitest run src/features/card-service/card-deck-format.test.ts src/features/card-service/components/card-markdown-copy-utils.test.ts`
- `pnpm --filter @yeon/ui typecheck`
- `pnpm --filter @yeon/ui lint`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/mobile typecheck`
- `pnpm --filter @yeon/mobile lint`
- `pnpm verify:parity`
- `bash bin/verify-ssot.sh --project-only`
- `git diff --check`
