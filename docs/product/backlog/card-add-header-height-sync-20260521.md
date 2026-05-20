# 카드 추가 모달 4개 헤더 높이 통일 백로그 (2026-05-21)

## 배경

카드 추가 직접 작성 화면은 카드 질문 editor, 카드 질문 preview, 카드 답변 editor, 카드 답변 preview 4개 cell이 같은 grid 단위다. 각 cell의 header 높이가 다르면 사용자는 같은 수준의 영역으로 인식하기 어렵다.

## 1차

### 작업내용

- compact editor toolbar header와 preview face header의 높이 기준을 같은 값으로 맞춘다.
- 질문/답변 editor header 2개와 질문/답변 preview header 2개의 header 크기를 동일하게 유지한다.
- 기존 4분할 width, row height pairing, gutter 제거는 유지한다.

### 논의 필요

- 없음. 사용자가 4개 header 크기 동일을 명시했다.

### 선택지

1. preview header만 대충 padding을 늘린다.
   - editor header와 같은 SSOT가 아니어서 다시 틀어질 수 있다.
2. editor toolbar와 preview header에 같은 min-height 기준을 부여한다.
   - 작고 명확하며 현재 문제와 맞다.
3. header component를 새로 추출한다.
   - 장기적으로 좋지만 현재 수정 범위보다 크다.

### 추천

2번. 같은 compact class object 안에서 header height 기준을 동일하게 맞추는 것이 가장 직접적이다.

### 사용자 방향

추천 기준으로 진행한다.

## 완료 기준

- 카드 질문 editor header, 카드 질문 preview header, 카드 답변 editor header, 카드 답변 preview header가 같은 높이 기준을 쓴다.
- 기존 grid width/row height 동작은 유지된다.
- web lint/typecheck/build를 통과한다.
