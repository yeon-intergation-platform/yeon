# 카드 에디터 표 미리보기 표시 일치

## 목표

- 편집기 표를 미리보기와 같은 content 기준 compact 표시로 맞춘다.
- 작업 후 main merge와 yeon pull까지 완료한다.

## 변경

- 편집기 table에서 ProseMirror `colgroup`/`col` 폭 영향을 숨겨 미리보기처럼 content 기준으로 column 폭이 잡히게 했다.
- 편집기 table/th/td에 `text-align: left`, `width: auto`를 적용해 미리보기와 정렬/폭 기준을 맞췄다.
- 편집기 table cell 내부 paragraph margin을 제거해 셀 내부 불필요한 높이/여백을 줄였다.

## 검증

- `git diff --check`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web build`

## 배포

- PR 생성 후 `main`에 머지 예정.
- `yeon` 워크트리는 머지 후 `git pull` 예정.
