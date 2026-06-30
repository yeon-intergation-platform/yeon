# MoodDesk Study Desk — 카드 학습 뽀모도로 작업대

## 배경

기존 MoodDesk 마음 저널 정적 프로토타입은 감성 기록 중심이라 Yeon의 유지보수 대상 서비스와 실용적 연결이 약했다. MoodDesk를 카드 덱 학습을 실행하는 뽀모도로 작업대로 전환한다. `card-service`는 덱/카드/복습 기록의 원천이고, `todo-service`는 할 일 관리의 원천이며, Study Desk는 선택된 덱과 선택된 할 일을 집중 세션으로 실행하는 역할만 가진다.

## 1차: 카드 덱 선택형 Study Desk MVP

### 작업내용

- `/card-service/study-desk` 신규 화면을 추가한다.
- 플랫폼 홈의 `mooddesk` descriptor를 정적 마음 저널 경로에서 카드 Study Desk 경로로 전환한다.
- 사용자가 카드 덱을 직접 선택하고 `10분`, `25분`, `50분` 세션 중 하나를 시작할 수 있게 한다.
- 기본 MVP는 25분 뽀모도로 세션을 중심으로 동작한다.
- 선택된 덱의 카드만 세션 큐로 사용한다.
- 기존 card-service repository/hook을 통해 덱 목록, 덱 상세, review 저장을 재사용한다.
- MoodDesk는 카드 생성/편집/삭제를 제공하지 않는다.
- 세션 완료 화면에서 복습 수, 어려움/보통/쉬움/스킵 수, 실제 경과 시간을 보여준다.
- todo 연동은 1차에서 얇게 처리한다. todo 화면에서 `todoTaskId`와 `todoTitle` query를 넘겨 Study Desk로 진입하고, Study Desk는 완료 후 host 기준 Today 복귀 CTA만 제공한다.

### 논의 필요

- 전용 `mooddesk.yeon.world` 서브도메인을 만들지 여부.
- Study Desk를 모바일 카드 앱에도 동일 화면으로 넣을지 여부.
- todo 자동 완료/시간 기록을 언제 Spring-backed 계약으로 승격할지 여부.

### 선택지

- A. `/card-service/study-desk`로 구현하고 `card.yeon.world/study-desk`에서 쓰게 한다. card의 게스트/인증 repository와 복습 저장 흐름을 그대로 재사용할 수 있다.
- B. `/mooddesk` 독립 서비스로 유지한다. 브랜드는 분리되지만 card guest store, 인증 분기, review 저장 흐름이 중복되거나 깨질 가능성이 크다.
- C. card 기존 `/decks/[deckId]/play` 화면에 타이머만 붙인다. 구현은 빠르지만 MoodDesk의 작업대 포지션이 약하고 todo 연결 여지가 작다.

### 추천

A. Study Desk는 card-service 안에 두고 실행 세션만 소유한다. 원천 데이터는 card/todo에 둔다.

### 사용자 방향

추천대로 진행한다. 단, 최종 품질은 multi-agent review 기준 구현 점수 90점 이상을 목표로 한다.

## 2차: todo 계약 연동

### 작업내용

- todo가 서버 계약을 갖춘 뒤 Study Desk 세션 완료 이벤트를 todo에 기록한다.
- 세션 완료 화면에서 사용자가 명시적으로 누를 때만 todo task를 완료 처리한다.
- 자동 완료 처리, 자동 task 생성, todo 우선순위 변경은 하지 않는다.

### 논의 필요

- todo-service의 서버 저장 전환 시점.
- focus session 로그를 todo 도메인에 둘지 별도 session 도메인에 둘지.

### 선택지

- A. todo 도메인에 focus session 로그를 둔다.
- B. 별도 focus-session 도메인을 만들고 todo/card는 foreign reference만 가진다.

### 추천

2차에서는 A로 시작한다. 별도 도메인은 반복 사용량과 분석 요구가 생긴 뒤 검토한다.

### 사용자 방향

1차 완료 후 재논의한다.

## 완료 조건

- `/card-service/study-desk`에서 덱 선택, 25분 세션 시작, 카드 정답 보기, review 저장, 요약 화면까지 동작한다.
- Study Desk에서 카드 생성/편집/삭제 기능이 없다.
- 플랫폼 홈 MoodDesk 카드가 Study Desk로 연결된다.
- todo는 완료 자동 처리를 하지 않고 `todoTaskId`/`todoTitle` context가 보존되는 Study Desk 진입 링크와 돌아가기 링크만 제공한다.
- 카드 큐를 다 봐도 세션을 즉시 종료하지 않고, 타이머 종료 또는 사용자 명시 종료 전까지 집중 상태를 유지한다.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm verify:parity` 통과.
- Playwright로 로컬 card 서비스 대응 경로에서 덱 선택 → 25분 세션 시작 → 카드 채점 → 요약 화면을 확인한다.
