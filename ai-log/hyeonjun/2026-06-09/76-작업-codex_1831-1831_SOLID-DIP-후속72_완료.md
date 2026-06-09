# SOLID/DIP 후속 72 — life-os window 오탐 명명 정리

- 대상: `packages/domain/src/life-os.ts`
- 백로그: `docs/product/backlog/2026-06-09-solid-exception-300-audit.md` 241번
- 원칙: D — domain 순수 로직이 브라우저 전역처럼 보이는 이름에 의존하지 않게 유지

## 변경

- `findDenseMismatchHours` 내부 지역 변수 `window`를 `classificationWindow`로 변경했다.
- 실제 브라우저 전역 접근은 아니었지만, `window.filter`처럼 보이는 오탐/혼동을 제거했다.
- domain 패키지의 브라우저 런타임 비의존 의도를 더 명확하게 했다.

## 검증

- 완료: `CI=true pnpm --filter @yeon/domain lint`
- 완료: `CI=true pnpm --filter @yeon/domain typecheck`
- 완료: `git diff --check`
