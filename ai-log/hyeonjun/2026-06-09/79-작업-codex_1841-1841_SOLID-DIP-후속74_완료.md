# SOLID/DIP 후속 74 — YeonPortal container 포트화

- 대상: `packages/ui/src/primitives/YeonPortal/index.tsx`
- 백로그: `docs/product/backlog/2026-06-09-solid-exception-300-audit.md` 253번
- 원칙: D — portal 컴포넌트가 `document.body` 구체 구현보다 container 포트에 의존

## 변경

- portal container 조회를 `YeonPortalContainerPort`로 분리했다.
- `YeonPortal`은 포트가 반환한 container가 있을 때만 `createPortal`을 호출한다.
- 브라우저 document가 없는 환경에서는 기존처럼 `null`을 반환한다.

## 검증

- 완료: `CI=true pnpm --filter @yeon/ui lint`
- 완료: `CI=true pnpm --filter @yeon/ui typecheck`
- 완료: `git diff --check`
