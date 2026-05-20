# 카드 추가 모달 모서리 복구 백로그 (2026-05-21)

## 배경

카드 추가 모달의 4분할 폭은 동일해졌지만, editor shell 내부 toolbar/body가 rounded border 안에서 clipping되지 않아 카드 질문/답변 작성 영역의 오른쪽 모서리와 테두리가 비어 보인다.

## 1차

### 작업내용

- compact editor shell에 `overflow-hidden`을 복구해 toolbar/body가 rounded border 안에서 잘리게 한다.
- 질문/답변 editor 표면의 네 모서리가 preview 표면처럼 닫혀 보이게 한다.
- 기존 4분할 동일 폭, preview rounded border, 상태 뱃지 제거는 유지한다.

### 논의 필요

- 없음. 사용자가 모서리 복구를 명시했다.

### 선택지

1. border 색상만 진하게 한다.
   - 원인이 clipping이면 해결되지 않는다.
2. editor shell clipping을 복구한다.
   - 작고 직접적인 수정이다.
3. 카드 추가 모달 전체 shell을 재작성한다.
   - 범위가 과하다.

### 추천

2번. 현재 문제는 독립 surface의 rounded border가 내부 요소와 함께 닫혀 보이지 않는 것이므로 shell clipping 복구가 맞다.

### 사용자 방향

추천 기준으로 진행한다.

## 완료 기준

- 카드 질문/답변 editor shell의 네 모서리가 비지 않는다.
- 기존 4분할 동일 폭과 preview border는 유지된다.
- `pnpm --filter @yeon/web lint`, `typecheck`, `build`를 통과한다.
