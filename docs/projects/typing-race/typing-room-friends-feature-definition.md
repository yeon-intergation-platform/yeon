# 타자방 친구/DM/초대 기능정의서

작성일: 2026-05-12
위치: `docs/projects/typing-race/typing-room-friends-feature-definition.md`
상태: 구현 전 기능 정의
적용 서비스: `typing-service`, `chat-service`, `race-server`

## 0. 결론

타자방 친구 기능은 **Spring `apps/backend`가 source of truth**다. Next.js는 화면과 임시 BFF/proxy만 담당하고, 친구 관계/DM/초대 저장·검증·권한 판정은 Spring에서 처리한다.

현재 구현에는 Spring `chat-service` 친구/DM 기반이 일부 존재하지만, 타자방 UX 요구와는 차이가 있다.

- 현재 Spring 친구 요청: 첫 액션은 `pending`, 반대편도 추가하면 `accepted`.
- 목표 정책: **한 사람이 친구 추가를 누르면 즉시 친구 관계가 성립**한다. 별도 수락 버튼/대기함은 타자방 MVP에서 사용하지 않는다.
- 현재 타자방 초대: URL 복사 중심.
- 목표 정책: 타자방 안에서 친구를 선택해 초대한다.

## 1. 목표

### G-01. 타자방 참가자 친구 추가

- 타자방 로비 참여자 카드에서 다른 참여자를 친구로 추가할 수 있다.
- 자기 자신에게는 친구 추가 액션을 노출하지 않는다.
- 이미 친구인 참여자는 `친구` 상태로 보이고, 다시 추가해도 idempotent 하게 성공한다.
- 차단 관계에서는 친구 추가가 실패한다.

### G-02. 친구 관리

- 타자 서비스 안에서 친구 목록을 확인할 수 있다.
- 친구 목록에서 1:1 대화를 열 수 있다.
- 친구 목록에서 현재 타자방으로 친구를 초대할 수 있다.
- pending 요청 목록은 신규 타자방 UX에서 핵심이 아니다. 기존 계약 호환을 위해 남길 수 있지만 화면 우선순위에서는 제외한다.

### G-03. 친구 1:1 대화

- 친구끼리는 별도 1:1 대화를 할 수 있다.
- 타자방 안에서 대화 진입 시 레이스 연결을 끊지 않는다.
- 친구가 아닌 대상은 타자방 표면에서 DM 버튼 대신 `친구 추가`를 먼저 노출한다.

### G-04. 타자방 친구 초대

- 타자방 대기중 상태에서 친구를 선택해 초대할 수 있다.
- 초대받은 친구는 초대함/알림에서 방으로 입장한다.
- 시작중/진행중/종료됨 방은 초대하지 않는다.
- 기존 링크 복사는 보조 액션으로 유지한다.

## 2. 범위

### 포함

- Spring 친구 관계 정책 정의
- Spring DM 진입 정책 정의
- Spring 타자방 초대 저장/조회 API 정의
- 타자방 participant와 chat profile 연결 정책
- 타자방 화면/친구 관리 화면/초대 모달/DM 패널 요구사항

### 제외

- race-server가 친구 관계 source of truth가 되는 구조
- Next.js API route가 DB에 직접 쓰는 신규 백엔드 구조
- 비친구 유료 DM unlock을 타자방 핵심 플로우로 노출하는 구조
- 진행중 방 중도 초대/관전 모드

## 3. 현재 구현 근거

| 영역 | 현재 상태 | 목표와의 차이 |
| --- | --- | --- |
| Spring friend request | `POST /chat-service/friends/requests` 존재 | pending 기반이라 즉시 친구 정책과 다름 |
| Spring friends overview | `GET /chat-service/friends/overview` 존재 | pending 필드가 있으나 타자방 MVP는 accepted 중심 |
| Spring DM open | `POST /chat-service/chat/open` 존재 | 비친구도 포인트로 unlock 가능, 타자방에서는 친구 기반만 우선 |
| 타자방 participant | `id`, `label`, `characterId`, role/ready/progress 중심 | chat profile id가 없어 친구 관계와 직접 연결 불가 |
| 타자방 초대 | URL 복사 | 친구 선택 초대/초대함 없음 |

## 4. 도메인 정의

### 4-1. Profile

친구/DM/초대의 사용자 식별 source of truth는 `chat_service_profiles.id`다.

- `typing player id`: 브라우저 localStorage 기반 레이스 참가자 식별자. 재접속/레이스 seat 유지용이다.
- `chat profile id`: Spring chat-service 프로필 식별자. 친구/DM/초대 권한 판정용이다.

**규칙:** 친구 관계에는 local typing player id를 저장하지 않는다.

### 4-2. FriendLink

친구 관계는 두 profile 사이의 관계다.

- 상태값: `accepted`가 기본 source of truth.
- `pending`은 기존 데이터/계약 호환용으로만 유지 가능하다.
- 신규 타자방 친구 추가는 즉시 `accepted`를 만든다.
- 양방향 중복을 막기 위해 canonical pair unique가 필요하다.

권장 canonical key:

- `profile_low_id = least(requester_id, addressee_id)`
- `profile_high_id = greatest(requester_id, addressee_id)`
- unique: `(profile_low_id, profile_high_id)` 또는 expression unique index

### 4-3. DirectMessageRoom

1:1 대화방은 기존 chat-service DM room을 사용한다.

- 친구 관계가 있으면 무료로 open.
- 타자방 표면에서는 친구가 아닌 상대의 DM open을 노출하지 않는다.
- 기존 community/chat-service의 비친구 유료 unlock 정책은 별도 제품 정책으로 남길 수 있으나, 타자방 신규 UX의 기본 경로는 아니다.

### 4-4. TypingRoomInvite

타자방 친구 초대는 Spring이 저장한다.

필드 초안:

| 필드 | 설명 |
| --- | --- |
| `id` | UUID |
| `roomId` | race-server room id |
| `roomTitle` | 초대 당시 방 이름 |
| `roomCode` | 표시용 코드 |
| `inviterProfileId` | 초대한 친구 |
| `inviteeProfileId` | 초대받은 친구 |
| `status` | `pending`, `accepted`, `expired`, `cancelled` |
| `expiresAt` | 만료 시각, MVP 기본 10분 |
| `createdAt` | 생성 시각 |
| `respondedAt` | 수락/만료 처리 시각 |

## 5. 기능 요구사항

### F-01. 타자방 참가자와 chat profile 연결

#### 설명

타자방 participant snapshot에 친구 기능을 연결하려면 참가자의 chat profile id가 필요하다.

#### 정책

- 웹은 타자방 입장 전 Spring chat session/profile을 확인한다.
- profile이 있으면 race-server 입장 payload에 `chatProfileId`를 함께 전달한다.
- profile이 없으면 participant card에서 친구 액션을 숨기고 `친구 기능은 커뮤니티 프로필이 필요해요.` 안내 CTA를 노출한다.
- race-server는 `chatProfileId`를 room snapshot에 포함할 수 있지만, 친구 관계 계산은 하지 않는다.

#### 성공 기준

- 같은 방 참가자 중 profile id가 있는 사람끼리 친구 상태를 계산할 수 있다.
- local player id만으로 친구 관계가 생성되지 않는다.

### F-02. 친구 추가

#### 진입

- 타자방 로비 participant card
- 경기 결과 화면 participant/result row
- 친구 관리 화면 추천/검색 결과

#### 동작

1. 사용자가 `친구 추가`를 누른다.
2. 웹이 Spring API에 `targetProfileId`를 전송한다.
3. Spring은 자기 자신/차단/프로필 존재 여부를 검증한다.
4. 기존 관계가 없으면 즉시 `accepted` 관계를 생성한다.
5. 기존 관계가 `pending`이면 즉시 `accepted`로 승격한다.
6. 기존 관계가 `accepted`이면 성공으로 반환한다.
7. 화면은 해당 상대를 `친구` 상태로 갱신한다.

#### 실패

| 조건 | 상태 | 사용자 메시지 |
| --- | --- | --- |
| 자기 자신 | 400 | `자기 자신은 친구로 추가할 수 없어요.` |
| 차단 관계 | 403 | `차단 관계에서는 친구 추가를 할 수 없어요.` |
| 대상 프로필 없음 | 404 | `친구 추가 대상 프로필을 찾지 못했어요.` |
| 인증/profile 없음 | 401/403 | `친구 기능을 사용하려면 커뮤니티 프로필이 필요해요.` |
| 네트워크/서버 오류 | 500 | `친구 추가에 실패했어요. 잠시 후 다시 시도해주세요.` |

#### idempotency

- 동일 사용자가 같은 대상을 여러 번 눌러도 친구 관계는 하나만 유지된다.
- A→B, B→A 동시 요청도 하나의 accepted 관계가 되어야 한다.

### F-03. 친구 관리

#### 표시 데이터

- 친구 목록
- 차단 목록은 기존 chat-service 정책이 있으면 표시 가능하되 타자방 MVP 필수는 아니다.
- 기존 pending 목록은 API 호환용으로 받을 수 있으나 신규 타자방 화면에서는 숨긴다.

#### 액션

- 1:1 대화 열기
- 현재 방으로 초대
- 친구 삭제는 후속 기능으로 분리한다.
- 차단/신고는 community chat-service 정책과 맞춰 후속 표면에서 다룬다.

### F-04. 친구 1:1 대화

#### 진입

- 타자방 participant card의 `대화` 버튼
- 친구 관리 drawer의 친구 row
- 친구 초대 모달의 친구 row 보조 액션

#### 동작

- 친구 관계가 accepted이면 Spring DM room을 open하고 메시지를 표시한다.
- 타자방 로비에서는 DM panel/drawer가 열려도 race-server room 연결은 유지한다.
- DM 메시지 저장/조회/읽음 상태는 Spring이 소유한다.

#### 메시지 제한

- 기존 chat-service 메시지 제한을 따른다.
- 권장: 1~1000자.

### F-05. 친구 초대

#### 진입

- 타자방 헤더 `초대` 버튼
- 친구 관리 drawer의 친구 row `초대`

#### 동작

1. 현재 방 상태가 `대기중`인지 확인한다.
2. 친구 목록을 연다.
3. 초대할 친구를 1명 이상 선택한다.
4. Spring에 초대 요청을 보낸다.
5. Spring은 친구 관계/방 상태/중복 초대/만료를 검증한다.
6. 초대받은 친구는 초대함에서 방 제목과 초대한 사람을 본다.
7. 초대 수락 시 `/typing-service/rooms/{roomId}`로 이동한다.
8. race-server가 최종 입장 가능 여부를 검증한다.

#### 중복 처리

- 같은 방 + 같은 invitee에 pending 초대가 있으면 새 row를 만들지 않고 기존 초대의 `expiresAt`을 갱신하거나 기존 초대를 그대로 반환한다.

#### 실패

| 조건 | 상태 | 사용자 메시지 |
| --- | --- | --- |
| 방이 대기중이 아님 | 409 | `이미 시작된 방에는 초대할 수 없어요.` |
| 친구가 아님 | 403 | `친구만 타자방에 초대할 수 있어요.` |
| 대상 없음 | 404 | `초대할 친구를 찾지 못했어요.` |
| 정원 초과 예상 | 409 | `방 인원이 가득 찼어요.` |
| 서버 오류 | 500 | `초대를 보내지 못했어요. 잠시 후 다시 시도해주세요.` |

### F-06. 초대함

#### 위치

- 타자방 로비 목록 상단
- 타자방 헤더 친구 버튼 안

#### 동작

- pending 초대 목록을 보여준다.
- 만료된 초대는 표시하지 않는다.
- 클릭 시 방 입장 경로로 이동한다.
- 입장 실패 시 기존 타자방 오류 문구를 따른다.

## 6. Spring API 정의 초안

공개 Next.js API path가 유지되더라도 DB write/source of truth는 Spring이다.

### 6-1. 친구 추가

#### 호환 경로

`POST /chat-service/friends/requests`

#### 권장 신규 alias

`POST /chat-service/friends`

#### Request

```json
{
  "targetProfileId": "uuid"
}
```

#### Response

```json
{
  "ok": true,
  "status": "accepted"
}
```

기존 `ok: true`만 반환하는 계약은 유지 가능하다. 단 신규 UI가 즉시 상태 갱신을 안정적으로 하려면 `status` 추가가 권장된다.

### 6-2. 친구 overview

`GET /chat-service/friends/overview`

#### Response 확장 권장

```json
{
  "friends": [],
  "pendingSent": [],
  "pendingReceived": [],
  "suggested": [],
  "blocked": []
}
```

- 신규 타자방 UI는 `friends` 중심으로 사용한다.
- `pendingSent`, `pendingReceived`는 호환 필드다.

### 6-3. DM open

`POST /chat-service/chat/open`

#### Request

```json
{
  "targetProfileId": "uuid",
  "source": "typing_room"
}
```

#### 정책

- `source=typing_room`일 때는 accepted friend만 허용한다.
- 기존 community surface의 비친구 unlock 정책은 별도 source로 분리한다.

### 6-4. 타자방 친구 초대 생성

`POST /typing-service/rooms/{roomId}/invites`

#### Request

```json
{
  "targetProfileIds": ["uuid"],
  "roomTitle": "오늘의 타자방",
  "roomCode": "ABCD12"
}
```

#### Response

```json
{
  "ok": true,
  "invites": [
    {
      "id": "uuid",
      "roomId": "colyseus-room-id",
      "inviteeProfileId": "uuid",
      "status": "pending",
      "expiresAt": "2026-05-12T09:10:00Z"
    }
  ]
}
```

### 6-5. 내 타자방 초대 목록

`GET /typing-service/room-invites`

#### Response

```json
{
  "invites": [
    {
      "id": "uuid",
      "roomId": "colyseus-room-id",
      "roomTitle": "오늘의 타자방",
      "roomCode": "ABCD12",
      "inviter": {
        "id": "uuid",
        "nickname": "타자왕"
      },
      "expiresAt": "2026-05-12T09:10:00Z"
    }
  ]
}
```

### 6-6. 초대 수락/소비

`POST /typing-service/room-invites/{inviteId}/accept`

#### Response

```json
{
  "ok": true,
  "roomId": "colyseus-room-id"
}
```

Spring은 초대 상태를 `accepted`로 바꾸고, 실제 room 입장은 웹이 race-server로 이동해 수행한다.

## 7. race-server 계약 변경 초안

`packages/race-shared`의 participant snapshot에 아래 필드 추가를 검토한다.

```ts
export type TypingRoomParticipantSnapshot = {
  id: string;
  label: string;
  chatProfileId?: string | null;
  characterId?: string;
  role: "host" | "guest";
  isReady: boolean;
  // 기존 레이스 상태 생략
};
```

입장 payload:

```ts
export type TypingRoomJoinMessage = {
  playerLabel: string;
  playerId?: string;
  chatProfileId?: string | null;
  locale?: "ko" | "en";
  password?: string;
};
```

주의:

- race-server는 친구 상태를 계산하지 않는다.
- race-server는 seed/protocol/레이스 상태 무결성을 유지한다.
- 친구 상태 병합은 웹 + Spring query 결과로 처리한다.

## 8. 권한 매트릭스

| 기능 | chat profile 있음 | chat profile 없음 | 친구 | 비친구 | 차단 |
| --- | --- | --- | --- | --- | --- |
| participant 보기 | 가능 | 가능 | 가능 | 가능 | 가능 |
| 친구 추가 | 가능 | 불가 | idempotent 성공 | 가능 | 불가 |
| DM 열기 | 가능 | 불가 | 가능 | 타자방에서는 불가 | 불가 |
| 방 초대 보내기 | 가능 | 불가 | 가능 | 불가 | 불가 |
| 초대 수락 | 가능 | 불가 | 가능 | 불가 | 불가 |

## 9. 이벤트/분석

권장 이벤트:

- `typing_friend_add_click`
- `typing_friend_add_success`
- `typing_friend_add_failed`
- `typing_dm_open_click`
- `typing_room_friend_invite_open`
- `typing_room_friend_invite_send`
- `typing_room_friend_invite_accept`

필수 속성:

- `source`: `typing_room_participant`, `typing_friends_drawer`, `typing_room_result`
- `room_id`
- `target_profile_id`는 개인정보 정책에 따라 해시/비식별 처리 검토

## 10. 구현 순서

1. Spring friend add 즉시 accepted 정책 + canonical pair unique 보강.
2. Spring friends overview를 타자방 UI가 쓰기 쉬운 accepted 중심으로 안정화.
3. chat profile id를 typing room 입장 payload/snapshot에 연결.
4. 타자방 participant card에 친구 상태/친구 추가 버튼 추가.
5. 친구 DM drawer 연결.
6. Spring typing room invite API/table 추가.
7. 타자방 친구 초대 모달/초대함 UI 추가.

## 11. 완료 기준

- 타자방 참가자 A가 B의 카드에서 `친구 추가`를 누르면 B의 별도 수락 없이 서로 친구 상태가 된다.
- 같은 액션을 반복해도 중복 friend link가 생기지 않는다.
- 친구 상태가 되면 같은 화면에서 1:1 대화를 열 수 있다.
- 친구 초대 모달에서 친구를 선택해 현재 대기중 방으로 초대할 수 있다.
- 초대받은 친구가 초대함에서 방으로 입장할 수 있다.
- 신규 백엔드 write/권한 판정은 Spring에 있고, Next.js는 source of truth가 아니다.
