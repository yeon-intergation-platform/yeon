# 작업 로그: 카드방/타자방 음성통화 단일 실행(yeon-3)

## 시작

- 작업자: codex
- 목표: 카드방/타자방 음성통화 기능을 **하나의 lane(yeon-3)에서 순차적으로 완결**
- 전략: 병렬 분할 없이 핵심 설계 → 구현 → 통합 테스트를 한 흐름으로 진행
- 범위: 클라이언트 UI/상태/오류 처리, 시그널링 계약 동기화, QA 체크포인트 정리

## 진행 내역

- 이전 요청대로 병렬 분할 계획에서 단일-lane 방식으로 정정
- 채팅 기능과 병행 가능한 음성통화 우선 MVP(1:1) 중심으로 범위를 고정
- 통화 실패 시 텍스트 채팅 지속성과 복구 UX를 우선 보장

## 1차 — 범위 고정 및 기본 플로우 설계

### 작업내용

- 1:1 음성통화 MVP로 범위를 고정(연결/대기/종료/재시도)
- 채팅 유지 전제에서 음성 통화 상태 모델(연결중/통화중/오류/종료)을 통합 설계
- 마이크 권한·브라우저 호환·권한 거부 안내의 UX를 한 번에 결정

### 논의 필요

- 음성통화 시작 버튼 배치(헤더/패널/오버레이)
- 통화 초대 응답 타임아웃 기준(예: 20~30초)

### 선택지

1. 1:1 통화 우선 + 텍스트 채팅은 항상 가동
2. 1:N 통화 먼저 탑재 후 축소

### 추천

- **선택지 1** (1:1 우선)
- 이유: 실시간 미디어의 안정성을 확보한 뒤에만 멀티파티 확장 가능

### 사용자 방향

- 추천 기준

## 구현 완료 메모

### 변경 요약

- `packages/race-shared`: 음성통화 공통 이벤트/상태/payload 타입 추가.
- `apps/race-server`: 카드방/타자방에 WebRTC offer/answer/ICE/end/mute relay 추가.
- `apps/web`: 공통 `useRoomVoiceCall` 훅과 `RoomVoiceCallPanel` 추가, 카드방/타자방 실제 참가자와 Colyseus room 연결에 통합.
- `.env.example`: `NEXT_PUBLIC_ENABLE_ROOM_VOICE_CALL=false` 기본값 추가.

### 실제 제품 경로 확인

- 목데이터를 만들지 않고, 카드방은 Spring 카드방 입장 결과의 participant id와 race-server `card_room` 연결을 사용.
- 타자방은 기존 `useRaceRoom`의 Colyseus room 인스턴스와 `roomSnapshot.participants`를 사용.
- 서버는 SDP/ICE를 저장하지 않고 room 메모리의 active voice session만 이용해 relay/중복 방어/퇴장 정리를 수행.

### 검증

- `pnpm --filter @yeon/race-shared typecheck`
- `pnpm --filter @yeon/race-server typecheck`
- `pnpm --filter @yeon/race-server lint`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/race-server build`
- `pnpm --filter @yeon/web build`
- `git diff --check`

### 남은 수동 확인

- 서로 다른 브라우저 2개에서 `NEXT_PUBLIC_ENABLE_ROOM_VOICE_CALL=true`로 카드방/타자방 통화 시작→수락→음소거→종료 확인.
- 마이크 권한 거부/상대 미응답/퇴장 시 텍스트 채팅이 유지되는지 확인.

## 2차 — 순차 구현(연결/제어/예외)

### 작업내용

- 통화 시작/수락/종료 동작의 기본 체인 구현
- 음소거/통화 끊기/재연결 버튼 및 상태 배지 구현
- 권한 거부, 네트워크 불안정, 상대 미응답 시 텍스트 fallback 처리

### 논의 필요

- 자동 재시도 횟수와 수동 재시도 노출 방식
- 비회원/게스트 통화 허용 범위

### 선택지

1. 자동 재시도 1회 후 수동 재시도
2. 실패 시 즉시 수동 재시도만 허용

### 추천

- **선택지 1**
- 이유: 채팅 중심 업무 연속성을 빠르게 회복

### 사용자 방향

- 추천 기준

## 3차 — 단일 lane 통합 검증

### 작업내용

- 구현 완료 후 회귀 시나리오(입장·퇴장·중복 시작·강제 종료·재접속) 작성
- 통화 중 텍스트 채팅 동작 보장 여부 확인
- 운영 인수 기준(연결 성공률/오류율) 최소선 정리

### 논의 필요

- 베타 롤아웃 범위(초기 멤버/구간)

### 선택지

1. 내부 베타 후 전체 롤아웃
2. 기능 플래그로 구간 점진 롤아웃

### 추천

- **선택지 2**
- 이유: 실시간 미디어 리스크를 구간 제어

### 사용자 방향

- 추천 기준
