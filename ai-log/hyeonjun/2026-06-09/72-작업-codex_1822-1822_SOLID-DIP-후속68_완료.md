# SOLID/DIP 후속 68 — 카드 에디터 rich content DOM 포트 분리

- 대상: `apps/web/src/features/card-service/components/card-editor-codeblock-utils.ts`
- 백로그: `docs/product/backlog/2026-06-09-solid-exception-300-audit.md` 223, 224번
- 원칙: D — 구체 브라우저 DOM 구현보다 포트에 의존

## 변경

- rich content HTML 파싱/코드블록 조회/본문 직렬화를 `CardEditorRichContentParserPort`와 문서/코드블록 포트로 감쌌다.
- `updateCardEditorCodeBlockLanguageInRichContent`는 기본 브라우저 구현을 주입받되, 내부 로직은 포트 인터페이스에만 의존하게 했다.
- DOMParser가 없는 환경에서는 기존 markdown fence fallback을 유지한다.

## 검증

- 완료: `CI=true pnpm --filter @yeon/web lint`
- 완료: `CI=true pnpm --filter @yeon/web typecheck`
- 완료: `git diff --check`
