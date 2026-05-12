# typing room lifecycle grace 2026-05-13

## 배경

타자방은 참가자가 모두 사라지면 목록에서 없어져야 하지만, 새로고침이나 일시적 네트워크 끊김을 즉시 퇴장으로 처리하면 기존 roomId 복귀가 불가능해진다. 명시적 나가기와 임시 disconnect를 분리해야 한다.

## 1차: 방 lifecycle 상태 도입

### 작업내용

- 타자방 공유 프로토콜에 lifecycle 상태를 추가한다.
  - `ACTIVE`: 참가자가 연결된 정상 방
  - `EMPTY_GRACE`: 연결된 참가자가 0명이지만 기존 참여자의 재접속을 기다리는 방
  - `CLOSED`: 삭제/종료되어 더 이상 입장할 수 없는 방
- race-server는 lobby room metadata에 lifecycle을 반영한다.
- `EMPTY_GRACE` 방은 public room 목록에서 숨긴다.

### 논의 필요

- 없음. 사용자가 lifecycle 상태와 목록 숨김 정책을 지정했다.

### 선택지

1. 기존 `status`에 `empty_grace`를 추가한다.
2. 게임 진행 `status`와 별도 `lifecycle` 필드를 둔다.

### 추천

- 2번. `waiting/live/finished`는 경기 상태이고 `active/empty_grace/closed`는 방 생명주기이므로 source of truth를 분리한다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 2차: explicit leave와 temporary disconnect 분리

### 작업내용

- 클라이언트가 나가기 버튼을 누르면 `ROOM_LEAVE` 메시지를 보내고 서버가 즉시 explicit leave로 처리한다.
- explicit leave 후 참가자가 0명이면 방을 즉시 `CLOSED`로 전환하고 disconnect한다.
- React cleanup, 새로고침, WebSocket close는 `room.leave(false)`로 temporary disconnect로 처리한다.
- temporary disconnect로 연결 참가자가 0명이 되면 `EMPTY_GRACE`로 전환하고 30초 후 기존 참가자가 돌아오지 않으면 삭제한다.
- 유예 시간 안에 같은 `playerId`가 같은 `roomId`로 돌아오면 `ACTIVE`로 복구한다.

### 논의 필요

- 없음.

### 선택지

1. Colyseus close code만으로 명시/임시를 추론한다.
2. 명시적 나가기는 별도 메시지로 먼저 알리고 서버가 퇴장을 수행한다.

### 추천

- 2번. React unmount와 브라우저 reload 모두 close처럼 보일 수 있으므로 UI 의도를 별도 protocol event로 전달한다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 3차: 검증

### 작업내용

- race-shared, race-server, web 타입검사를 실행한다.
- race-server build와 web build를 실행한다.
- SSOT/diff 검증을 실행한다.

### 논의 필요

- 실제 브라우저 새로고침 수동 smoke는 개발자가 이미 켜둔 로컬 서버 기준으로 확인할 수 있다.

### 선택지

1. 타입/빌드 검증으로 protocol 정합성을 확인한다.
2. Playwright까지 추가한다.

### 추천

- 1번. 이번 변경은 Colyseus lifecycle/protocol 중심이라 타입/빌드와 코드 감사로 먼저 막는다.

### 사용자 방향

- 추천 기준으로 진행한다.
