# 카드 추가 모달 4분할 균등 폭 복구 백로그 (2026-05-21)

## 배경

카드 추가 모달의 직접 작성 화면은 질문 editor, 질문 preview, 답변 editor, 답변 preview 4개 영역이 하나의 grid에서 같은 작업 단위처럼 나뉘어야 한다. 현재 데스크톱 grid가 좌측 editor column과 우측 preview column을 다른 비율로 나누고, preview face는 독립 cell로 쓰이면서도 자체 rounded/border shell이 없어 오른쪽 카드 질문/답변의 모서리와 테두리가 비어 보인다.

## 1차

### 작업내용

- 직접 작성 desktop grid의 두 column weight를 `1:1`로 맞춘다.
- 질문 editor, 질문 preview, 답변 editor, 답변 preview 4개 cell이 동일한 width를 나눠 갖게 한다.
- preview face를 독립 grid cell에서도 editor shell과 같은 수준의 rounded/border surface로 보이게 한다.
- 기존 모바일 editor-local preview 동작은 건드리지 않는다.

### 논의 필요

- 없음. 사용자가 4개 DIV width 동일과 preview 모서리/테두리 복구를 명시했다.

### 선택지

1. column 비율만 1:1로 바꾼다.
   - 폭 문제는 해결되지만 오른쪽 preview 모서리/테두리 문제는 남는다.
2. column 비율을 1:1로 바꾸고 preview face shell도 독립 카드 표면으로 복구한다.
   - 현재 지적된 두 문제를 함께 해결한다.
3. 전체 카드 추가 모달 layout을 재설계한다.
   - 범위가 크고 현재 문제보다 과하다.

### 추천

2번을 추천한다. 문제의 핵심은 `grid column weight 불균형`과 `preview face가 독립 cell인데 자체 shell이 없는 구조`이므로, grid 1:1과 preview rounded/border를 함께 고치는 것이 가장 작고 직접적이다.

### 사용자 방향

추천 기준으로 진행한다.

## 완료 기준

- 데스크톱 직접 작성 grid의 column weight가 1:1이다.
- 0,0 / 0,1 / 1,0 / 1,1 네 cell의 width가 동일하다.
- 카드 질문 preview와 카드 답변 preview가 독립 cell로서 rounded border를 가진다.
- `pnpm --filter @yeon/web lint`와 `pnpm --filter @yeon/web typecheck`를 통과한다.
