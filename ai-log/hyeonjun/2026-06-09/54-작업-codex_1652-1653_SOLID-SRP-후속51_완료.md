# SOLID SRP 후속 51 — 웹 카드 인증 context hook 책임 분리

## 목표

- 백로그 206번: `CardServiceAuthProvider` 주변의 인증 상태 동기화, mounted guard, 세션 refresh, browser event hook 책임을 분리한다.
- context 파일은 Provider wiring과 context read만 담당하게 한다.

## 진행

- 작업 워크트리 `yeon-2`를 `origin/main` 기준 `codex/solid-exception-followup-51`로 초기화했다.
- 카드 서비스 SSOT(`docs/agent-rules/card-service.md`)와 Next.js 관련 규칙을 확인했다.

## 변경

- `use-card-service-auth-state.ts`를 추가해 인증 상태 보관, 서버 인증 상태 refresh, focus/visibility 이벤트 갱신을 전담하게 했다.
- `auth-context.tsx`는 `useCardServiceAuthState` 결과를 Provider에 주입하고, context read helper만 유지한다.
- 백로그 206번을 완료 처리했다.

## 검증

- 진행률 스크립트: 300개 중 189개 완료, 다음 연속 후속 항목 207번.
- 라인 수: `auth-context.tsx` 50라인, `use-card-service-auth-state.ts` 62라인.
- `CI=true pnpm --filter @yeon/web lint`
- `CI=true pnpm --filter @yeon/web typecheck`
- `git diff --check`
