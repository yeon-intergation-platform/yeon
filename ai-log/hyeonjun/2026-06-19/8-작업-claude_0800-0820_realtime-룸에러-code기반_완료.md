# realtime 타자 룸 에러 code 기반 분기 (에러 감사 후속 2단계-c)

## 배경

타자 레이스 룸 입장 거부를 클라가 `message.includes("full"/"가득"/"started"...)` 한·영 문자열 비교로 분기(안티패턴). 서버가 의미있는 code를 안 줘서 생긴 구조. 백엔드 메시지 문구만 바뀌어도 분기가 조용히 깨진다.

## 변경

race-server는 Colyseus `ServerError`가 아니라 커스텀 `RACE_EVENTS.ROOM_ERROR` 메시지로 거부한다. 프로토콜을 건드리지 않고 **페이로드에 code만 추가**한다(안전).

- `packages/race-shared/src/typing-race.ts`: `TYPING_ROOM_ERROR_CODE`(CLOSED/REJOIN_ONLY/STARTED/FULL) 상수 + `RoomErrorMessage.code?` 추가.
- `apps/race-server/src/rooms/typing-race-room.ts`: onJoin 거부 4케이스의 `client.send(ROOM_ERROR, ...)`에 code 추가(message 흐름 불변).
- `apps/web/src/features/typing-service/use-race-room.ts`: ROOM_ERROR 수신 시 `resolveRoomErrorMessage`가 **code → locale 메시지로 직접 매핑**. code 없으면 기존 `message.includes` 폴백(하위호환·Colyseus 자동 거부 대응). 영/한 메시지에 closed/rejoinOnly 추가(영어 설정 한글 노출 방지, #788/790 규칙 준수).

## 검증

- 신규 `use-race-room-error.test.ts` 5/5(code 매핑, 영어 locale 한글 미노출, code 없을 때 폴백).
- typecheck exit 0: race-shared/race-server/web/**mobile(race-shared 공유 호환)**. lint exit 0.
- race-server 거부 경로는 code 필드 추가뿐이라 정상 입장 흐름 불변. 멀티플레이 실측(4인+5번째 거부, 시작된 방 입장)은 자동화 한계 → CD/수동 확인 권장.

## 남은 후속

- card-room/territory realtime의 `_code` 활용도 동일 패턴으로 가능(이번 범위 밖).
- 3단계: 백엔드 전역 핸들러 + 공통 ErrorResponse + ErrorCode enum.
