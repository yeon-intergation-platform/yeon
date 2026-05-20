# 카드 에디터 표 콘텐츠 기준 폭 정리 백로그 (2026-05-21)

## 배경

카드 에디터의 표 삽입 결과가 editor와 preview 모두에서 필요 이상으로 넓게 보인다. 표는 전체 너비를 채우는 layout table이 아니라, 각 column이 같은 column 안의 가장 긴 content 기준으로만 넓어지는 content table이어야 한다. 또한 editor div와 preview div에서 표가 같은 밀도와 폭 감각으로 보여야 한다.

## 1차

### 작업내용

- editor TipTap table CSS의 `width: 100%`/fixed layout 성격을 제거하고 content 기준 width로 바꾼다.
- preview HTML/Markdown table 렌더링도 full width 강제를 제거한다.
- editor/preview table cell padding과 table layout 기준을 맞춰 여백 낭비를 줄인다.
- 큰 표/긴 content는 container에서 x-scroll 가능하게 유지한다.

### 논의 필요

- 없음. 사용자가 content 기준 table width와 editor/preview 동일 표시를 명시했다.

### 선택지

1. 표 삽입 기본 Markdown만 바꾼다.
   - 렌더 CSS가 full width면 해결되지 않는다.
2. editor/preview table CSS를 같은 content-fit 기준으로 맞춘다.
   - 원인을 직접 해결한다.
3. table NodeView를 새로 구현한다.
   - 범위가 과하다.

### 추천

2번. 표의 폭/여백 문제는 삽입 데이터보다 렌더 CSS의 full width 강제와 cell padding에서 발생하므로 editor/preview CSS를 함께 맞춘다.

### 사용자 방향

추천 기준으로 진행한다.

## 완료 기준

- editor table이 content 기준 폭만 차지한다.
- preview table도 editor와 같은 content 기준 폭/compact padding으로 보인다.
- column 폭은 같은 column 안의 가장 긴 cell content 기준으로 결정된다.
- web lint/typecheck/build를 통과한다.
