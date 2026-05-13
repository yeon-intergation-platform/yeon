# 프론트 3축 구조 리팩토링 백로그 (2026-05-13)

## 1차 — 학생관리 대형 컴포넌트 분해

### 작업내용

- `student-management`의 대형 컴포넌트 중 현재 가장 큰 `student-check-board-panel.tsx`에서 독립 UI/파생 로직을 feature 하위 파일로 분리한다.
- app route가 아닌 feature 내부 책임으로 유지하며, 서버 상태/query/fetch 소유권은 새로 늘리지 않는다.
- 기존 선택/저장/삭제/optimistic 동작은 변경하지 않는다.

### 논의 필요

- 전체 1200줄 파일을 한 번에 분해할지, 회귀가 낮은 pure view/lib 단위부터 나눌지.

### 선택지

1. pure formatter/view 단위만 먼저 분리한다.
2. hook/model까지 한 번에 분리한다.
3. 학생관리 대신 typing/card부터 진행한다.

### 추천

- 1번. 학생관리 화면은 server/local/draft 상태가 얽혀 있으므로 상태 전이는 건드리지 않고 독립 UI/derive부터 줄인다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 2차 — typing-service 대형 화면 분해

### 작업내용

- `typing-service`의 남은 대형 파일 중 최근 분해와 겹치지 않는 화면에서 독립 view 또는 pure derive를 분리한다.
- query key/fetch boundary는 기존 factory/wrapper를 유지한다.
- 대기방/설정/덱 분해 완료분은 반복하지 않는다.

### 논의 필요

- `typing-race-solo-screen.tsx`, `typing-room-lobby-screen.tsx`, `typing-race-multiplayer-screen.tsx` 중 어느 파일을 우선할지.

### 선택지

1. 가장 큰 solo screen에서 순수 view를 분리한다.
2. lobby screen에서 반복 UI를 분리한다.
3. multiplayer screen에서 결과/입력 view를 분리한다.

### 추천

- 1번. solo screen은 단독 사용자 화면이라 회귀 반경이 작고 구조 개선 효과가 크다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 3차 — card-service/card-room 대형 파일 분해

### 작업내용

- card-service/card-room의 남은 대형 파일에서 이미 완료된 card-room header/chat/panel, rich editor view split과 겹치지 않는 독립 view/lib를 분리한다.
- guest/auth 저장소와 mutation 소유권은 변경하지 않는다.

### 논의 필요

- `deck-play-screen.tsx`, `card-room-lobby-screen.tsx`, `card-room-create-screen.tsx`, `card-rich-markdown-editor.tsx` 중 어느 파일을 우선할지.

### 선택지

1. 학습 진입 영향이 큰 `deck-play-screen.tsx`에서 표시 view를 분리한다.
2. card-room lobby/create에서 방 생성 UI를 분리한다.
3. rich editor 후속 분리를 진행한다.

### 추천

- 1번. `deck-play-screen`은 큰 화면이면서 room 작업과 충돌이 적어 3축 리팩토링의 독립 PR 단위로 안전하다.

### 사용자 방향

- 추천 기준으로 진행한다.
