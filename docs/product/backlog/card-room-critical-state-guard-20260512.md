# 카드방 critical 상태 오염 방지 백로그

## 배경

- `origin/main` 기준 critical 코드리뷰에서 카드방 입장/상태 변경 경계에 상태 오염 가능성이 확인됐다.
- 목표는 UI/기능 확장이 아니라, 잘못된 참가자·다른 방 참가자가 Spring 카드방 상태를 오염시키지 않도록 막는 최소 수정이다.

## 1차 — Spring 카드방 참가자-방 소속 검증

### 작업내용

- `CardRoomService`의 참가자 기반 action에서 `participantId`가 요청 `roomId`에 속하는지 확인한다.
- 대상: 참가자 수정, 나가기, 메시지, 정답 공개, 결과 제출, 다음 카드.
- 소속이 다르면 403 또는 404 대신 명확한 서비스 예외로 차단한다.

### 논의 필요

- 다른 방 참가자 ID를 403으로 노출할지, 404처럼 숨길지.

### 선택지

1. `403 PARTICIPANT_ROOM_MISMATCH`로 상태 오염 시도를 명확히 차단한다.
2. `404 PARTICIPANT_NOT_FOUND`로 존재 여부를 숨긴다.

### 추천

- 1번. 내부/테스트 관점에서 실패 원인을 명확히 남기고, 프런트에는 이미 일반 오류 메시지로 전달된다.

### 사용자 방향

-

## 2차 — 카드방 클라이언트 profile/guestId 로드 전 입장 차단

### 작업내용

- `useCardRoomProfile`에 localStorage 로드 완료 상태를 추가한다.
- `CardRoomScreen`은 profile/guestId 로드 전에는 join 요청을 보내지 않는다.
- `CardRoomCreateScreen`은 로드 전 submit을 막아 기본 `Guest`/`guest-browser`로 방을 만들지 않게 한다.

### 논의 필요

- 로드 중 skeleton을 별도 표시할지.

### 선택지

1. 기존 화면을 유지하고 submit/join만 guard한다.
2. 별도 로딩 UI를 만든다.

### 추천

- 1번. critical fix 범위를 작게 유지한다.

### 사용자 방향

-

## 3차 — 검증 및 배포

### 작업내용

- backend 서비스 테스트 또는 최소 컴파일 검증을 추가/실행한다.
- web typecheck/lint/build를 실행한다.
- main 기준 PR 생성 후 merge한다.

### 논의 필요

- 전체 backend test가 오래 걸릴 경우 어느 범위까지 필수로 볼지.

### 선택지

1. 수정된 backend 테스트 + web 검증을 실행한다.
2. 전체 repo 검증을 실행한다.

### 추천

- 1번. critical fix 속도와 신뢰도를 균형 있게 맞춘다.

### 사용자 방향

-
