# 타자방 친구/DM/초대 Spring 구현 백로그

작성일: 2026-05-12

## 1차수. 기능·화면 정의 고정

### 작업내용
- 타자방에서 참가자끼리 친구 추가, 친구 관리, 1:1 대화, 방 초대를 사용할 수 있는 기능정의서를 작성한다.
- 타자방 로비/친구 관리/친구 초대/1:1 대화 화면정의서를 작성한다.
- 백엔드 source of truth는 Next.js가 아니라 Spring(`apps/backend`)으로 고정한다.

### 논의 필요
- 타자방 게스트(local playerId)만 있는 사용자를 친구 기능에 바로 포함할지, 커뮤니티 프로필 생성 후 허용할지.
- 친구 초대 알림을 MVP에서 폴링 기반으로 시작할지, Spring 실시간 채널까지 포함할지.

### 선택지
- A. 기존 community chat-service 친구 모델을 재사용하고 타자방 participant에 chatProfileId를 연결한다.
- B. 타자방 전용 friend 테이블을 새로 만든다.
- C. race-server 내부 메모리에 친구 상태를 둔다.

### 추천
- A. 이미 Spring에 `chat_service_friend_links`, friends overview, friend request, DM open 영역이 있으므로, 친구 관계/DM은 chat-service 프로필 기반으로 통합한다. race-server는 레이스 상태만 유지한다.

### 사용자 방향
- 타자방에서 서로 친구 추가할 수 있어야 한다.
- 친구 추가는 상대가 별도 수락을 누르지 않아도, 추가 액션 한 번으로 친구가 되게 한다.
- 친구끼리는 따로 대화할 수 있어야 한다.
- 타자방에서 친구를 초대할 수 있어야 한다.
- 백엔드는 Next.js가 아니라 Spring에 구현한다.

## 2차수. Spring 친구 관계 정책 정리

### 작업내용
- `POST /chat-service/friends/requests`의 호환 경로는 유지하되 동작을 즉시 `accepted` 친구 관계 생성으로 변경한다.
- 새 명확 경로 `POST /chat-service/friends`를 추가할 수 있으면 같은 서비스 메서드로 alias 처리한다.
- 양방향 중복 생성을 막기 위해 canonical pair unique 정책을 추가한다.

### 논의 필요
- 기존 `pendingSent/pendingReceived` 응답 필드를 UI 호환을 위해 빈 배열로 유지할지, 계약에서 deprecated 표시할지.

### 선택지
- A. 즉시 수락 정책으로 바꾸고 pending 필드는 호환용 유지.
- B. pending 필드를 계약에서 즉시 제거.

### 추천
- A. 기존 web/mobile 소비자가 있을 수 있으므로 필드는 유지하고 신규 UI에서는 사용하지 않는다.

### 사용자 방향
-

## 3차수. 타자방 참가자와 chat profile 연결

### 작업내용
- 웹이 race-server 입장 시 `playerId`와 별도로 Spring chat profile id를 전달할 수 있게 한다.
- race-server snapshot participant에 `chatProfileId`, `friendStatus`, `canAddFriend`, `canOpenDm` 같은 UI 판단용 최소 필드를 싣거나, 웹이 Spring overview와 room participants를 조합한다.
- 개인 식별 정보는 Spring profile id만 사용하고 local typing player id는 친구 관계 source of truth로 쓰지 않는다.

### 논의 필요
- race-server가 Spring을 조회할지, 웹이 room snapshot + Spring overview를 병합할지.

### 선택지
- A. 웹 병합: race-server는 profile id만 전달하고 친구 상태는 웹 TanStack Query로 Spring에서 조회.
- B. race-server 병합: race-server가 Spring API를 호출해 snapshot에 상태까지 포함.

### 추천
- A. race-server를 게임 상태에 집중시켜 seed/protocol 무결성을 유지한다.

### 사용자 방향
-

## 4차수. 친구 DM 진입

### 작업내용
- 친구 관계가 `accepted`인 경우 1:1 대화방을 무료로 열 수 있게 한다.
- 타자방 참가자 카드와 친구 관리 화면에서 DM 열기 액션을 제공한다.
- Next.js는 임시 BFF/proxy만 수행하고 DM 생성/조회/메시지 저장은 Spring이 소유한다.

### 논의 필요
- 기존 비친구 유료 DM unlock 정책을 타자방 진입면에서는 숨길지, 전체 정책에서 제거할지.

### 선택지
- A. 타자방에서는 친구 DM만 노출하고 비친구는 친구 추가 후 대화.
- B. 타자방에서도 비친구 유료 DM을 노출.

### 추천
- A. 사용자가 요구한 흐름은 친구 기반 대화이므로 타자방에서는 친구 관계를 먼저 만든다.

### 사용자 방향
-

## 5차수. 친구 초대

### 작업내용
- Spring에 타자방 친구 초대 저장/조회 API를 추가한다.
- 타자방 헤더 `초대` 버튼은 링크 복사만이 아니라 친구 선택 초대 모달을 연다.
- 친구는 초대 알림/초대함에서 방으로 입장한다.

### 논의 필요
- 초대 만료 시간 기본값.
- 이미 진행중인 방 초대를 허용하지 않을지.

### 선택지
- A. MVP는 대기중 방만 초대, 10분 만료, 폴링 초대함.
- B. 진행중 방 관전/중도 입장을 포함.

### 추천
- A. 현재 타자방 입장 제한 정책과 충돌하지 않는다.

### 사용자 방향
-
