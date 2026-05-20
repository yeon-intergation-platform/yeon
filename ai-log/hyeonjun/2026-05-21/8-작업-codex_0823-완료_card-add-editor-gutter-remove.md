# 카드 추가 에디터 왼쪽 gutter 제거

## 목표

- compact editor body의 왼쪽 빈 grid/gutter를 제거한다.
- 작업 후 main merge와 yeon pull까지 완료한다.

## 변경

- compact editor body의 `grid-cols-[88px_minmax(0,1fr)]` 2열 구조를 제거했다.
- `editorBodyGutter`와 `editorBodyContent` wrapper를 제거하고 `EditorContent`가 body 전체 폭을 쓰게 했다.

## 검증

- `git diff --check` — 통과
- `pnpm --filter @yeon/web lint` — 통과
- `pnpm --filter @yeon/web typecheck` — 통과
- `pnpm --filter @yeon/web build` — 통과
