# 코드 품질 원칙 위반 리팩터링 55개 - 9차 배치

## 범위

- 태스크 34: race-server typing room 시간 기준 helper화.
- 태스크 35: race-server typing room 랜덤 ID/코드 생성 정책 정리.
- 태스크 36: race-server typing room waiting guard helper화.
- 태스크 37: race-server typing room lobby waiting guard helper화.
- 태스크 38: race-server typing room validation 실패 응답 helper화.
- 태스크 39: race-server territory room 시간 기준 helper화.
- 태스크 40: race-server territory player joinedAt 생성 정책 분리.
- 태스크 41: race-server Spring internal header 생성 중복 제거.
- 태스크 42: card room backend 오류 code 보존.

## 변경

- `typing-race-room.ts`의 직접 시간 호출을 `now()` 경계로 모으고, 방 코드 생성은 `crypto.randomInt`로 교체했다.
- `typing-race-room.ts`의 시스템/채팅/관리자 seed ID 생성, waiting guard, lobby waiting guard, room error 전송 정책을 helper로 분리했다.
- `territory-battle-room.ts`와 `territory-battle-players.ts`의 시간 생성 책임을 명시적인 helper/인자로 분리했다.
- `spring-backend-headers.ts`를 추가해 Spring internal token/header 생성을 card room/typing room backend client가 공유하도록 했다.
- 카드방 백엔드 오류를 `CardRoomBackendHttpError`로 표현해 Spring 오류 응답의 `status`, `code`, `detail`을 보존했다.

## 검증

- `pnpm --filter @yeon/race-server typecheck`
- `pnpm --filter @yeon/race-server lint`
- `pnpm --filter @yeon/race-server build`
- `bash bin/verify-ssot.sh --project-only`
- `git diff --check`
