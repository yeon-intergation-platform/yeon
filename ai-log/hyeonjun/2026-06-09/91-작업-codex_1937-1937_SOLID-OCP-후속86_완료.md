# 91. SOLID OCP 후속 86

## 대상

- 300개 SOLID/예외 원칙 적용 백로그 항목 284
- `apps/mobile/src/features/card-service/use-markdown-text-field-controller.ts`

## 변경

- 마크다운 삽입 길이 제한 판정을 `createMarkdownInsertionLengthPolicy`로 분리했다.

## 검증

- 완료: `pnpm --filter @yeon/mobile lint`
- 완료: `pnpm --filter @yeon/mobile typecheck`
- 완료: `pnpm verify:parity`
- 완료: `git diff --check`
