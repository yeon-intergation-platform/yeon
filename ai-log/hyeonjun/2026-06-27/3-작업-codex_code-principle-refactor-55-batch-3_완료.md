# 3 작업 codex code-principle-refactor 55 batch 3 완료

## 목표

- 카드 서비스 mutation 인증 만료 처리와 덱 목록 fetch 오류 계약을 정리해 16~18번 원칙 위반을 닫는다.

## 변경

- `card-service-mutation-policy.ts`를 추가해 401 인증 만료 판정, server/guest query invalidation, 원인 예외 보존 wrapper를 공용화.
- card item/deck mutation hook의 중복 401 cleanup 로직을 공용 정책으로 이동.
- `listServerCardDecksOrNull`가 401은 guest fallback으로 유지하고, 그 외 오류는 `CardServiceApiError`로 status/code/message를 보존하도록 변경.
- 관련 단위 테스트를 추가했다.

## 검증

- `pnpm --filter @yeon/web exec vitest run src/features/card-service/card-service-fetch.test.ts src/features/card-service/hooks/card-service-mutation-policy.test.ts`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `bash bin/verify-ssot.sh --project-only`
- `git diff --check`

## 결과

- 완료 태스크: 16~18
- 누적 완료: 19/55
- 상태: 완료.
