# SOLID/DIP 후속 71 — 카드 복습 단축키 브라우저 포트화

- 대상: `apps/web/src/features/card-service/deck-play-screen.tsx`
- 백로그: `docs/product/backlog/2026-06-09-solid-exception-300-audit.md` 239, 240번
- 원칙: D — 화면 로직이 `window` 구체 구현보다 단축키 포트에 의존

## 변경

- 복습 모드 단축키 keydown 등록/해제를 `CardReviewShortcutBrowserPort.subscribeKeydown`으로 분리했다.
- 입력/버튼 등 단축키 차단 대상 판정도 같은 포트에 넣어 DOM 타입 의존을 화면 로직에서 제거했다.
- 브라우저 객체가 없는 환경에서는 빈 unsubscribe를 반환해 SSR/테스트 안전성을 유지했다.

## 검증

- 완료: `CI=true pnpm --filter @yeon/web lint`
- 완료: `CI=true pnpm --filter @yeon/web typecheck`
- 완료: `git diff --check`
