# 카드 추가 모달 버튼 모션 개선 백로그 (2026-05-21)

## 배경

카드 추가 모달의 직접 작성/일괄 추가 전환 버튼과 마크다운 툴바 버튼은 사용자가 자주 누르는 조작점이다. 현재 색상 전환만 있어 클릭 가능성은 보이지만 조작감이 약하다. 이미 web dependency에 `framer-motion`이 있으므로 작은 hover/tap 모션으로 반응성을 높인다.

## 1차

### 작업내용

- 직접 작성/일괄 추가 mode tab 버튼에 자연스러운 hover/tap motion을 적용한다.
- 카드 질문/답변 markdown toolbar icon 버튼에 같은 톤의 hover/tap motion을 적용한다.
- disabled 상태는 움직이지 않게 유지한다.
- 기존 layout, width, height, row 동기화는 변경하지 않는다.

### 논의 필요

- 없음. 사용자가 framer-motion 적용을 요청했다.

### 선택지

1. CSS transition만 추가한다.
   - framer-motion 요청과 다르다.
2. 버튼 hover/tap만 작은 spring motion으로 처리한다.
   - 가장 자연스럽고 안전하다.
3. 모달 전체 전환/콘텐츠 enter-exit까지 추가한다.
   - 범위가 커지고 현재 레이아웃 안정화 작업과 충돌할 수 있다.

### 추천

2번. 사용자가 언급한 버튼류에만 작고 일관된 motion을 넣어 조작감만 개선한다.

### 사용자 방향

추천 기준으로 진행한다.

## 완료 기준

- 직접 작성/일괄 추가 버튼에 framer-motion 기반 hover/tap 반응이 있다.
- markdown toolbar 버튼에 framer-motion 기반 hover/tap 반응이 있다.
- disabled 버튼은 움직이지 않는다.
- web lint/typecheck/build를 통과한다.
