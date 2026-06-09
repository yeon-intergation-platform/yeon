# 80. SOLID DIP 후속 75

## 대상

- 300개 SOLID/예외 원칙 적용 백로그 항목 254-255
- `packages/ui/src/rich-content/YeonRichDom/index.ts`
- `packages/ui/src/runtime/YeonBrowserRuntime/index.ts`

## 변경

- DOMParser 생성자 조회를 `YeonDomParserPort`로 분리했다.
- local/session storage 조회를 `YeonBrowserStoragePort`와 `getOptionalBrowserStorage`로 분리했다.
- storage 접근 실패 fallback을 한 경계에서 처리해 호출부가 구체 브라우저 storage 구현에 직접 묶이지 않게 했다.

## 검증

- `CI=true pnpm --filter @yeon/ui lint`
- `CI=true pnpm --filter @yeon/ui typecheck`
- `git diff --check`
