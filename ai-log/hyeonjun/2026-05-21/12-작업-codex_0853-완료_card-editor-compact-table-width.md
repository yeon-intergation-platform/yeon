# 카드 에디터 표 콘텐츠 기준 폭 정리

## 목표

- 표 삽입 결과가 전체 div 폭을 채우지 않고 content 기준 폭만 차지하게 한다.
- editor와 preview의 표 표시를 같은 밀도와 폭 기준으로 맞춘다.
- 작업 후 main merge와 yeon pull까지 완료한다.

## 변경

- 편집기 TipTap table의 full-width/fixed layout 강제를 제거하고 `max-content`/`table-auto` 기준으로 변경했다.
- 편집기와 미리보기 table cell padding을 줄이고 `white-space: nowrap`으로 column 폭이 같은 column 내 최장 content 기준이 되게 맞췄다.
- HTML 미리보기와 Markdown 미리보기 모두 `min-width: 100%`/`min-w-full`을 제거해 편집기와 같은 compact table 폭을 사용한다.

## 검증

- `git diff --check`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web build`

## 배포

- PR 생성 후 `main`에 머지 예정.
- `yeon` 워크트리는 머지 후 `git pull` 예정.
