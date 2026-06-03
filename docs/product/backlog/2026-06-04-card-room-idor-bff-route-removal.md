# 카드방 IDOR 차단 — 미사용 웹 BFF mutation 라우트 제거

## 배경 / 문제 (critical IDOR)

카드방 실시간 mutation 6종(`start`/`end`/`reveal`/`next`/`results`/`messages`)에 대해
웹 BFF HTTP 라우트(`apps/web/src/app/api/v1/card-rooms/[roomId]/*`)가
클라이언트가 보낸 `X-Yeon-Participant-Id`를 **소유권 검증 없이** Spring으로 패스스루한다.
participant publicId는 `GET /api/v1/card-rooms/{roomId}` 응답에 모든 참가자에게 평문 노출되므로,
roomId만 알면 호스트/타 역할 참가자를 행세해 방을 강제 시작·종료하거나(`requireHost`),
정답 공개·결과 조작·채팅 위조가 가능했다(IDOR, critical #1·#2).

## 조사 결론 (신뢰 경계)

- 웹·모바일 클라이언트는 6종 mutation을 **전부 WebSocket(`room.send(CARD_ROOM_EVENTS.*)`)** 으로 호출한다.
  - web: `apps/web/src/features/card-service/hooks/use-card-room.ts:173-210`
  - mobile: `apps/mobile/src/features/card-service/rooms/use-card-room-connection.ts:115-151`
- 정상 경로는 `클라이언트 → WS → race-server → Spring(직접 :8081)` 로 **웹 BFF를 우회**한다.
- race-server는 `withParticipant`에서 WS join 시 HMAC participant 토큰으로 검증된
  세션-바인딩 participantId만 사용하므로, race-server→Spring 직접 경로는 IDOR가 아니다.
- 6개 웹 BFF HTTP 라우트와 대응 `*InSpring` 함수는 **어떤 정상 클라이언트도 호출하지 않는다**
  (web/mobile/packages 전수 grep에서 fetch 호출처 0건). 즉 미사용 코드이면서 IDOR 공격면이다.

## 1차: 미사용 BFF 라우트 제거

### 작업내용

- 6개 라우트 핸들러 삭제: `apps/web/src/app/api/v1/card-rooms/[roomId]/{start,end,reveal,next,results,messages}/route.ts`
- `apps/web/src/server/card-rooms-spring-client.ts`의 미사용 6개 함수 삭제
  (`startCardRoomInSpring`/`endCardRoomInSpring`/`createCardRoomMessageInSpring`/
  `submitCardRoomResultInSpring`/`revealCardRoomInSpring`/`nextCardRoomCardInSpring`)
  및 그로 인해 죽는 `participantId` 분기·타입 import 정리.
- Spring 컨트롤러/서비스 및 race-server 경로는 **건드리지 않는다**(정상 실시간 경로라 blast radius 0).

### 논의 필요

- 향후 비실시간(HTTP 폴백) mutation이 필요해지면, 그때는 본 라우트를 단순 복원하지 말고
  HMAC participant 토큰 검증을 포함해 재설계한다.

### 선택지

1. 미사용 BFF 라우트 제거 (blast radius 0, 공격면 완전 제거)
2. Spring에 HMAC 토큰 검증 추가(방어심층) — 민감한 실시간 3서비스 경로 변경, 위험·범위 큼
3. 둘 다

### 추천

선택지 1. 정상 경로가 WS이고 6개 라우트는 미사용 공격면이므로, 제거가 가장 작고 안전하며 IDOR를 즉시 차단한다.

### 사용자 방향

선택지 1(미사용 BFF 라우트 제거)로 진행 — 사용자 확정.
