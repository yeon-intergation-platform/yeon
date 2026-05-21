# 카드 에디터 표 미리보기 표시 일치 백로그 (2026-05-21)

## 배경

카드 직접 작성 에디터의 표는 미리보기보다 불필요하게 큰 column 폭과 cell 여백을 가진다. 사용자는 미리보기 오른쪽 div의 compact table 표시가 기준이며, 편집기도 같은 방식으로 표가 보여야 한다고 명시했다.

## 1차

### 작업내용

- 편집기 ProseMirror table의 colgroup/col inline width 영향을 줄여 content 기준 compact 폭으로 표시한다.
- 편집기 table cell 내부 paragraph 여백을 미리보기처럼 줄인다.
- 편집기와 미리보기의 table width/padding/line-height 감각을 맞춘다.

### 논의 필요

- 없음. 미리보기 표시를 기준으로 편집기 표시를 맞춘다.

### 선택지

1. 미리보기를 편집기처럼 키운다.
   - 사용자가 미리보기 현재 상태를 좋다고 했다.
2. 편집기 표 표시를 미리보기 compact table 기준으로 맞춘다.
   - 요구와 일치한다.
3. 표 삽입 기본 데이터만 바꾼다.
   - ProseMirror colgroup/렌더 CSS 문제라 해결되지 않는다.

### 추천

2번. 편집기 표시 레이어에서 미리보기와 같은 폭/밀도를 강제한다.

### 사용자 방향

추천 기준으로 진행한다.

## 완료 기준

- 편집기 표가 미리보기처럼 content 기준 compact 폭으로 보인다.
- 불필요한 큰 column 폭/빈 여백이 줄어든다.
- web lint/typecheck/build를 통과한다.
