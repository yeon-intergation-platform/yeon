# 카드 표 최소 셀 크기와 렌더 경로 일치

## 목표

- 카드 미리보기/실제 학습 카드에서 빈 표 셀도 안정적인 최소 크기를 갖게 한다.
- 편집기/미리보기/학습 카드 표 표시 기준을 맞춘다.
- 작업 후 main merge와 yeon pull까지 완료한다.

## 확인

- 웹 카드 미리보기, 카드 목록, 일반 학습 카드, 복습 카드, 카드방 학습 패널은 모두 `MarkdownContent`를 통해 카드 본문을 렌더링한다.
- 모바일 카드 서비스는 현재 카드 본문을 plain `Text`로 렌더링하고 있어 웹 Markdown table 표시 경로와는 별도다.

## 변경

- `MarkdownContent`에 카드 표 최소 셀 폭/높이 상수를 추가했다.
- HTML 기반 카드 표와 Markdown 기반 카드 표 모두 최소 셀 크기, line-height, box-sizing을 적용했다.
- 학습 화면처럼 큰 글자 wrapper 안에 들어가는 HTML table도 표 자체는 안정적인 13px 기준으로 보이게 고정했다.
- 편집기 table cell도 같은 최소 셀 크기 상수를 import해서 미리보기/학습 카드와 기준을 맞췄다.

## 검증

- `git diff --check`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web build`

## 배포

- PR 생성 후 `main`에 머지 예정.
- `yeon` 워크트리는 머지 후 `git pull` 예정.
