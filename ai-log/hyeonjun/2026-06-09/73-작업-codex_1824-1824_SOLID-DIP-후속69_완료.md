# SOLID/DIP 후속 69 — 카드 마크다운 언어 옵션 DOM 포트화

- 대상: `apps/web/src/features/card-service/components/markdown-content.tsx`
- 백로그: `docs/product/backlog/2026-06-09-solid-exception-300-audit.md` 225, 226번
- 원칙: D — 브라우저 전역 `document` 직접 의존 대신 rich DOM 포트 의존

## 변경

- 코드블록 언어 select의 `optgroup`/`option` 생성에 `document.createElement`를 직접 쓰지 않도록 변경했다.
- `appendCodeLanguageOptions`가 호출부의 `htmlDocument`를 받아 `createYeonDomElement` 포트로 요소를 생성하게 했다.
- 같은 owner document에서 wrapper/header/select/options가 생성되도록 흐름을 통일했다.

## 검증

- 완료: `CI=true pnpm --filter @yeon/web lint`
- 완료: `CI=true pnpm --filter @yeon/web typecheck`
- 완료: `git diff --check`
