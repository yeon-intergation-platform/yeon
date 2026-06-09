# SOLID/DIP 후속 70 — 카드 플레이 resize 브라우저 포트화

- 대상: `apps/web/src/features/card-service/components/play-card.tsx`
- 백로그: `docs/product/backlog/2026-06-09-solid-exception-300-audit.md` 227~238번
- 원칙: D — 컴포넌트가 `document`/`window` 구체 구현보다 포트에 의존

## 변경

- pointer resize drag의 body cursor/user-select 변경과 pointer event listener 등록/해제를 `CardResizePointerDragPort`로 분리했다.
- `PlayCard`는 시작 좌표/크기와 `onSizeChange`를 포트에 전달하고, 브라우저 전역 객체를 직접 다루지 않게 했다.
- 포트 내부에서 브라우저 객체가 없으면 조기 반환해 SSR/테스트 환경의 안전성을 유지했다.

## 검증

- 완료: `CI=true pnpm --filter @yeon/web lint`
- 완료: `CI=true pnpm --filter @yeon/web typecheck`
- 완료: `git diff --check`
