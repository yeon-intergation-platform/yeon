# 코드 품질 원칙 위반 리팩터링 55개 - 6차 배치

## 범위

- 태스크 13: 모바일 카드 게스트 opt-in clear fallback cleanup 정책 명시.
- 태스크 14: 모바일 카드 세션 boot 실패 처리 책임 분리.
- 태스크 15: 모바일 카드 세션 logout 서버 실패 로깅 helper화.

## 변경

- `onboarding-storage.ts`의 browser read/write/clear 실패 로깅을 helper로 분리했다.
- `clearCardGuestOptIn`가 browser `removeItem` 실패를 로깅하고 in-memory fallback은 항상 정리하도록 했다.
- `use-card-session-state.ts`의 boot 실패 처리에서 로깅, 토큰 정리, signed-out gate 전이, alert 표시 책임을 분리했다.
- logout 서버 세션 무효화 실패 로깅을 helper로 분리하고, 로컬 로그아웃은 계속 진행되게 유지했다.

## 검증

- `pnpm --filter @yeon/mobile typecheck`
- `pnpm --filter @yeon/mobile lint`
- `bash bin/verify-ssot.sh --project-only`
- `git diff --check`
