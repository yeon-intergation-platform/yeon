# MoodDesk Study Desk 리팩터링 백로그

## 배경

- 사용자는 첨부한 전역 코드 검증 원칙을 기준으로 실제 코드 리팩터링을 요구했다.
- 현재 `apps/web/src/features/focus-desk/focus-desk-screen.tsx`는 1,000라인 이상이며 query 처리, 세션 상태, 타이머, 덱 선택 UI, 모드 UI, 카드 실행 UI, 요약 UI가 한 파일에 모여 있다.
- 이 구조는 동작은 하지만 SRP, SoC, 작은 함수, 테스트 가능성 원칙 관점에서 유지보수 비용이 높다.

## 1차

### 작업내용

- Study Desk 화면의 사용자 동작은 유지한다.
- `focus-desk-screen.tsx`에서 순수 포맷터와 표시 전용 섹션 컴포넌트를 분리한다.
- query/세션 orchestration은 `FocusDeskScreen`에 남기고, 렌더링 책임은 별도 컴포넌트로 이동한다.
- 포맷터 경계값 테스트를 추가해 리팩터링 후 표시 규칙이 유지되는지 검증한다.
- 표시 전용 시간 포맷터는 음수·소수 입력을 0 이상 정수 초로 보정한다. 이는 외부 상태가 순간적으로 흔들려도 UI 텍스트가 깨지지 않게 하는 경계값 처리이며, 세션 원천 상태나 저장 정책은 바꾸지 않는다.

### 논의 필요

- 이번 차수에서 session controller hook까지 분리할지 여부.

### 선택지

- A. 포맷터와 표시 컴포넌트만 분리한다.
- B. 포맷터, 표시 컴포넌트, 세션 controller hook까지 모두 분리한다.
- C. Study Desk 전체 구조를 card-service 공용 패턴으로 재배치한다.

### 추천

- A를 우선한다. 현재 요구는 리팩터링이며, 사용자 동작 보존과 검증 가능성이 가장 중요하다. controller hook 분리는 상태 전이 회귀 위험이 더 크므로 다음 차수로 남긴다.

### 사용자 방향

- 첨부 원칙을 따른다.
- 다른 에이전트가 95점 이상 줄 때까지 반복한다.

## 완료 기준

- `focus-desk-screen.tsx`가 orchestration 중심으로 줄고, 표시 섹션은 별도 파일에 응집된다.
- 기존 Study Desk 기능 테스트와 새 포맷터 테스트가 통과한다.
- web lint/typecheck, parity, diff check가 통과한다.
- 다른 에이전트 평가 점수가 95점 이상이다.

## 완료 결과

- `focus-desk-screen.tsx`는 1,076라인에서 298라인으로 줄었고, query/hook/session 상태 전이 orchestration만 담당한다.
- 표시 섹션은 hero, timer panel, sidebar, workspace 파일로 분리했다.
- code-simplifier 재평가 97/100 PASS, verifier 재평가 96/100 PASS.
