# SOLID/DIP 후속 73 — YeonBrowserHooks 브라우저 포트화

- 대상: `packages/ui/src/hooks/YeonBrowserHooks/index.ts`
- 백로그: `docs/product/backlog/2026-06-09-solid-exception-300-audit.md` 242~252번
- 원칙: D — hook 로직이 `document`/`window` 구체 구현보다 브라우저 포트에 의존

## 변경

- body overflow 조회/설정과 body class add/remove를 `YEON_BROWSER_HOOKS_PORT.body`로 분리했다.
- document/window event listener 등록/해제를 `YEON_BROWSER_HOOKS_PORT.events`의 subscribe 메서드로 통일했다.
- 브라우저 객체가 없는 환경에서는 빈 unsubscribe 또는 no-op로 동작해 SSR/테스트 안전성을 유지했다.

## 검증

- 완료: `CI=true pnpm --filter @yeon/ui lint`
- 완료: `CI=true pnpm --filter @yeon/ui typecheck`
- 완료: `git diff --check`
