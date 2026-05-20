# 카드 추가 모달 행 높이 동기화 대상 분리 백로그 (2026-05-21)

## 배경

카드 추가 모달 직접 작성 grid는 질문 editor/질문 preview, 답변 editor/답변 preview가 각각 한 행으로 묶여야 한다. 현재 desktop row가 `1fr` 기반이라 질문 입력이 길어질 때 답변 preview 행까지 함께 커져 사용자가 보기에는 무관한 영역이 반응하는 것처럼 보인다.

## 1차

### 작업내용

- desktop grid row를 `auto/auto`로 바꿔 각 행 높이를 자기 행의 editor/preview 콘텐츠 기준으로만 계산한다.
- 질문 editor 높이 증가는 질문 preview만 함께 키우고, 답변 preview는 답변 editor 행 변화에만 반응하게 한다.
- 기존 4분할 동일 폭과 editor gutter 제거는 유지한다.

### 논의 필요

- 없음. 사용자가 동기화 대상 분리를 명시했다.

### 선택지

1. 현재 `1fr/1fr` 유지 후 preview만 max-height로 막는다.
   - 증상은 줄지만 row 동기화 원인은 남는다.
2. row sizing을 `auto/auto`로 바꾼다.
   - 질문 row와 답변 row의 높이 변화가 독립된다.
3. grid를 두 개의 독립 grid로 쪼갠다.
   - 가능하지만 현재 변경보다 범위가 크다.

### 추천

2번. DOM 순서상 1행은 질문 editor/preview, 2행은 답변 editor/preview이므로 row sizing만 auto로 바꾸면 사용자 기대와 맞는다.

### 사용자 방향

추천 기준으로 진행한다.

## 완료 기준

- 질문 입력 줄바꿈으로 질문 editor가 커질 때 질문 preview만 같은 행에서 커진다.
- 답변 preview는 답변 editor 행 변화에만 따라 커진다.
- 4개 cell width 동일은 유지된다.
- web lint/typecheck/build를 통과한다.
