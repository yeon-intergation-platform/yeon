# Yeon 전수 감사 결과 — 2026-06-03

멀티에이전트 감사(15 lane × find→adversarial verify) 결과. 검증 통과 **189건**.

## 심각도 분포

| critical | high | medium | low | nit | 합계 |
| -------- | ---- | ------ | --- | --- | ---- |
| 6        | 38   | 59     | 64  | 22  | 189  |

## Lane별

- 백엔드 members/spaces/sheets: 25
- 백엔드 card_rooms: 17
- 백엔드 auth/users: 16
- 백엔드 chat_service: 16
- 백엔드 oauth/drive/config: 15
- 프론트 카드방 실시간: 15
- 교차 성능: 15
- 프론트 마크다운/이미지/표: 13
- 프론트 게이트/세션/소셜로그인: 13
- 백엔드 community/banners/logs: 11
- 교차 보안: 11
- 프론트 Universal UI: 10
- 백엔드 counseling(동결): 5
- 계약 드리프트: 4
- DB 마이그레이션: 3

## 카테고리별

- security: 45
- correctness: 26
- perf: 19
- error-handling: 15
- validation: 15
- race-condition: 11
- contract-drift: 11
- n+1: 7
- db-index: 7
- architecture: 6
- transaction: 5
- input-validation: 5
- dead-code: 5
- rate-limit: 2
- db-column-length: 1
- db-type: 1
- duplicate-code: 1
- [frozen] security: 1
- [frozen] race-condition: 1
- [frozen] validation: 1
- [frozen] reliability: 1
- [frozen] perf: 1
- naming: 1
- a11y: 1

## [CRITICAL] 6건

### getSpace가 소유권을 검증하지 않아 임의 스페이스 조회 가능(IDOR)

- **위치**: `apps/backend/src/main/java/world/yeon/backend/spaces/service/SpaceService.java:30-36` · **lane**: be-members-spaces · **cat**: security
- **이유**: getSpace(userId, spaceId)는 userId를 받지만 repository.findByPublicId(spaceId)만 호출하고 소유권을 검증하지 않는다. 같은 repository에 findOwnedByPublicId(userId, spaceId)(라인 74)가 존재하고 update/delete 경로는 이를 쓰지만 getSpace만 안 쓴다. 웹 라우트 apps/web/src/app/api/v1/spaces/[spaceId]/route.ts GET은 requireAuthenticatedUser(로그인 여부만) 후 fetchSpaceFromSpring(currentUser.id, spaceId)로 그대로 전달하므로, 로그인한 임의 사용자가 타인 spaceId만 알면 스페이스 상세를 조회할 수 있다.
- **수정**: getSpace에서 repository.findOwnedByPublicId(userId, spaceId)를 사용하거나 SpaceAccessService.requireOwnedSpace(spaceId, userId)로 소유권을 강제하고 미소유 시 404를 반환한다.

### member field-values 읽기/쓰기가 스페이스 소유권을 검증하지 않음(IDOR)

- **위치**: `apps/backend/src/main/java/world/yeon/backend/member_field_values/read/service/MemberFieldValueReadService.java:25-46` · **lane**: be-members-spaces · **cat**: security
- **이유**: listMemberValues/listValues는 컨트롤러에서 X-Yeon-User-Id를 받지만 서비스 시그니처로 전달되지 않고, space/member를 public_id로만 조회한다(findSpaceInternalId/findMemberInternalId, 소유권 필터 없음). 쓰기 경로 MemberFieldValueWriteService.bulkUpsert도 userId를 받기만 하고 소유권 검증에 쓰지 않는다(라인 32-40). (참고: listValues는 탭-스페이스 일치 검증은 라인 58-60에 존재하나 소유권 검증은 없음.) 결과적으로 로그인한 임의 사용자가 타인 스페이스/수강생의 커스텀 필드 값을 조회·수정할 수 있다.
- **수정**: 두 서비스 모두 진입 시 SpaceAccessService.requireOwnedSpace(spaceId, userId) 또는 findOwnedSpaceInternalId(spaceId, userId)로 소유권을 확인한 뒤 내부 ID 해석을 진행한다.

### applyTemplateToSpace가 스페이스 소유권 미검증 — 타인 스페이스 스키마/데이터 파괴

- **위치**: `apps/backend/src/main/java/world/yeon/backend/space_templates/write/service/SpaceTemplateWriteService.java:151-184` · **lane**: be-members-spaces · **cat**: security
- **이유**: applyTemplateToSpace는 applyRepository.requireSpaceInternalId(spaceId)로 존재만 확인하고 userId 소유권은 검증하지 않는다(라인 153). 이후 deleteAllFieldDefinitions, deleteCustomTabs를 수행하는데(라인 164-165), V8 마이그레이션에서 member_field_values가 member_field_definitions에 ON DELETE cascade(라인 1426)로, member_field_definitions가 spaces에 cascade로 걸려 있어, 임의 사용자가 타인 스페이스의 필드 정의와 연결된 모든 수강생 입력값을 영구 삭제할 수 있다.
- **수정**: applyTemplateToSpace 시작부에서 소유권을 검증한다(requireOwnedSpace(spaceId, userId)). requireSpaceInternalId를 owner-scoped 조회로 교체하거나 별도 ownership 가드를 추가한다.

### sheet-integrations 전 엔드포인트 소유권 미검증(IDOR)

- **위치**: `apps/backend/src/main/java/world/yeon/backend/sheet_integrations/service/SheetIntegrationService.java:48-76` · **lane**: be-members-spaces · **cat**: security
- **이유**: getIntegrations/createIntegration/syncIntegration 모두 requireSpace(spaceId)가 created_by_user_id 없이 spaces.public_id만으로 internalId를 조회한다(라인 176-182, repository.findSpaceInternalId). 컨트롤러는 X-Yeon-User-Id를 받지만 getIntegrations(spaceId)에는 전달조차 안 한다(controller 라인 38). 결과적으로 임의 인증 사용자가 타인 스페이스의 시트 연동을 조회·생성하고 동기화를 트리거(외부 Google Sheets 호출 및 activity_logs 쓰기)할 수 있다.
- **수정**: requireSpace에 userId를 받아 created_by_user_id 필터를 추가하거나, 컨트롤러/서비스 진입부에서 SpaceAccessService.requireOwnedSpace(spaceId, userId)를 호출한다.

### 필드 정의 update/delete가 userId(소유권)를 전혀 받지 않음

- **위치**: `apps/backend/src/main/java/world/yeon/backend/member_fields/write/controller/MemberFieldWriteController.java:50-67` · **lane**: be-members-spaces · **cat**: security
- **이유**: update/delete 핸들러는 X-Yeon-User-Id 헤더조차 받지 않고 spaceId만으로 service.update/delete를 호출한다(라인 51-58, 61-66). 서비스도 requireSpaceInternalId(public_id only, 라인 121-127)만 확인하므로, 임의 인증 사용자가 타인 스페이스의 필드 정의를 수정/소프트삭제할 수 있다.
- **수정**: 두 핸들러에 userId를 받고 서비스에서 소유권을 검증하도록 시그니처를 통일한다.

### chat-service OTP 인증이 영구적으로 우회됨 — 전화번호만 알면 임의 계정 탈취 가능

- **위치**: `apps/backend/src/main/java/world/yeon/backend/chat_service_auth/service/ChatServiceAuthService.java:47, 107, 108` · **lane**: x-security · **cat**: security
- **이유**: isBypassEnabled()가 하드코딩 true이고(line 107) 코드 전역 grep 결과 다른 환경변수/프로필 게이트가 전혀 없다. verifyOtp는 `if (!isBypassEnabled() && ...)`(line 47)로 bypass가 켜져 있으면 challenge.codeHash 비교를 건너뛰므로, 공격자가 피해자 전화번호와 임의 코드로 requestOtp→verifyOtp를 호출하면 해당 전화번호 프로필의 세션 토큰(line 55-58)을 그대로 발급받는다. createOtpCode()도 상수 "123456"을 반환한다(line 108). chat-service 전 사용자 계정에 대한 완전한 인증 우회(계정 탈취)이며, DM 방·신고·프로필 등 모든 인증 기능이 무력화된다.
- **수정**: isBypassEnabled()를 환경변수(예: CHAT_SERVICE_OTP_BYPASS)로 게이트하고 prod 프로필에서는 반드시 false가 되게 한다. createOtpCode()는 SecureRandom 6자리로 교체하고 실제 SMS 발송 경로와 연결한다. verifyOtp에 시도 횟수 제한을 추가한다.

## [HIGH] 38건

### checkAdmin가 세션 검증 없이 요청 본문 email로 임의 계정을 admin으로 승격

- **위치**: `apps/backend/src/main/java/world/yeon/backend/root_auth/service/AuthSessionService.java:157-174` · **lane**: be-auth-users · **cat**: security
- **이유**: 확인됨. checkAdmin은 request.userId로 findUserById를 호출하고, line 168에서 effectiveEmail = email == null ? normalizeEmail(user.email()) : email 로 요청 본문 email이 저장 email을 override한다. 이후 isSeedAdminEmail(effectiveEmail)이면 updateUserRole로 admin 승격. 세션 토큰 검증이 전혀 없고 userId/email 모두 호출자 입력이라, BFF 신뢰 경계가 깨지거나 다른 호출자가 생기면 임의 userId+seed admin email 조합으로 타 계정을 수직 권한 상승시킬 수 있다. AdminCheckRequest DTO에 email 필드 존재 확인.
- **수정**: 승격 판정은 요청 본문 email이 아니라 DB user.email로만 수행하고(email 파라미터 제거/무시), 승격은 세션 토큰으로 검증된 본인에 대해서만 허용하라. 최소한 email override 경로를 제거해 isSeedAdminEmail(user.email)만 사용하라.

### 상태 전이에 행 잠금이 없어 동시 요청 시 카드 인덱스/상태 race 발생

- **위치**: `apps/backend/src/main/java/world/yeon/backend/card_rooms/service/CardRoomService.java:226-238, 249-270, 213-224, 153-176` · **lane**: be-card-rooms · **cat**: race-condition
- **이유**: startRoom/next/reveal/submitResult 모두 requireRoom으로 현재 status·current_card_index를 읽은 뒤 updateStatus로 덮어쓰는 read-modify-write인데, 어디에도 SELECT ... FOR UPDATE 같은 행 잠금이나 낙관적 버전 검사가 없다. @Transactional은 기본 READ_COMMITTED라 같은 방에 next 두 번이 동시에 들어오면 둘 다 같은 currentCardIndex를 읽고 둘 다 +1 해 카드를 건너뛰거나, submitResult와 next가 겹쳐 결과 누락/중복 진행이 생긴다. 카드방은 다중 참가자가 동시에 누르는 실시간 도메인이라 실제로 자주 충돌한다.
- **수정**: requireRoom에서 status 전이가 필요한 경로(start/next/reveal/submitResult/end/leave)는 repository에 'select ... from card_rooms where public_id=? for update'를 추가해 방 행을 잠그거나, updateStatus를 'update ... where id=? and status=? and current_card_index=?' 조건부 갱신으로 바꿔 갱신 행 수가 0이면 충돌로 처리하라.

### joinRoom 중복 참가자 방지에 유니크 제약/잠금이 없어 동시 입장 시 중복 row 생성

- **위치**: `apps/backend/src/main/java/world/yeon/backend/card_rooms/service/CardRoomService.java:114-128` · **lane**: be-card-rooms · **cat**: race-condition
- **이유**: findActiveParticipantByIdentity로 기존 참가자를 조회한 뒤 없으면 insertParticipant 하는 TOCTOU 구조다. 동일 user_id/guest_id로 동시에 두 번 join 하면 둘 다 existing=null을 보고 두 participant row가 생긴다. DB에도 (room_id,user_id) where left_at is null 부분 유니크 인덱스가 없어(V6 마이그레이션 확인) 방어가 전혀 없다. 결과적으로 한 사용자가 두 역할/두 슬롯을 점유하고 host 중복 등 후속 로직이 깨진다.
- **수정**: card_room_participants에 'create unique index ... on (room_id, user_id) where left_at is null'와 guest_id용 부분 유니크 인덱스를 추가하고, insert 충돌(DuplicateKey)을 잡아 재조회·업데이트로 멱등 처리하라. 입장 경로에 방 행 잠금을 추가해도 된다.

### submitResult가 cardId를 현재 진행 카드와 대조하지 않아 임의 카드 결과 주입 가능

- **위치**: `apps/backend/src/main/java/world/yeon/backend/card_rooms/service/CardRoomService.java:249-270` · **lane**: be-card-rooms · **cat**: correctness
- **이유**: request.cardId로 findCard 후 room 소속만 확인할 뿐(257), card.orderIndex == room.currentCardIndex 검증이 없다. 클라이언트가 현재 카드가 아닌 다른(미래/과거) 카드 publicId를 보내도 통과하고, 그 결과로 updateStatus(result.nextStatus())가 호출돼 엉뚱한 카드 기준으로 방 상태가 PASSED/GIVEN_UP으로 바뀐다. 상태 머신과 결과 기록이 어긋난다.
- **수정**: card.orderIndex() != room.currentCardIndex()이면 CARD_NOT_RESOLVED/별도 에러로 거부하라. 또한 같은 카드에 대한 결과 중복 제출도 (room_id,card_id) 유니크 또는 status 가드로 막아라.

### 호스트가 leave/강제퇴장하면 방에 host가 사라져 시작·종료 불가 상태로 고착

- **위치**: `apps/backend/src/main/java/world/yeon/backend/card_rooms/service/CardRoomService.java:189-199` · **lane**: be-card-rooms · **cat**: correctness
- **이유**: leaveRoom은 is_host 여부와 무관하게 left_at만 찍는다. 호스트가 나가면 남은 참가자가 있어도(방은 CLOSED 안 됨) is_host=true인 활성 참가자가 없어 startRoom/endRoom의 requireHost가 항상 HOST_ONLY로 막혀 방이 영구히 진행 불가가 된다. findRoom의 host left join도 null이 되어 hostLabel이 게스트 라벨로 떨어진다.
- **수정**: 호스트가 떠날 때 남은 참가자(예: joined_at 최솟값)에게 is_host=true를 위임하거나, 활성 호스트가 없을 때 방을 CLOSED 처리하는 등 호스트 승계 로직을 추가하라.

### 에스크 투표 read-modify-write 경쟁 조건 → 동시 투표 시 unique 위반 500

- **위치**: `apps/backend/src/main/java/world/yeon/backend/chat_service_ask/service/ChatServiceAskService.java:55-60` · **lane**: be-chat-service · **cat**: race-condition
- **이유**: vote()는 findVote()로 기존 투표를 조회한 뒤 없으면 insertVote()를 한다(line 55-60). chat_service_ask_votes에는 UNIQUE(post_id, voter_id) 인덱스(V8 line 1219 chat_service_ask_votes_post_voter_key)가 존재한다. 같은 사용자가 동시에 두 번 투표하면 두 요청 모두 existingVote==null을 보고 둘 다 insertVote → unique 위반. insertVote(repository line 110-119)에는 on conflict 처리가 없고, ChatServiceAskController(line 44)의 @ExceptionHandler는 ChatServiceAskServiceException만 처리하며 chat_service 전역 ControllerAdvice도 없어 DataIntegrityViolationException은 500으로 노출된다.
- **수정**: insertVote를 'insert ... on conflict (post_id, voter_id) do update set option_index = excluded.option_index'로 단일 upsert 처리하거나, findVote/insert 분기를 제거하고 멱등 upsert 하나로 통일한다.

### 친구요청 동시 전송 시 friend_links unique 위반 500 (on conflict 누락)

- **위치**: `apps/backend/src/main/java/world/yeon/backend/chat_service_friend_requests/repository/ChatServiceFriendRequestRepository.java:54-63` · **lane**: be-chat-service · **cat**: race-condition
- **이유**: service send()(line 28-31)는 findLinkBetween()으로 기존 링크가 없으면 insertPendingLink()를 호출한다. chat_service_friend_links에는 UNIQUE(requester_id, addressee_id)(V8 line 1238 chat_service_friend_links_requester_addressee_key)가 있다. 같은 사용자가 동시에 두 번 친구요청을 보내면 둘 다 existingLink==null을 보고 둘 다 insert → unique 위반. insertPendingLink(line 54-63)에는 on conflict 처리가 없고 컨트롤러 @ExceptionHandler는 ServiceException만 처리하므로 500이 노출된다. chat_open insertRoom(repository line 67-71)은 'on conflict (room_key) do nothing'이 있는 것과 대비된다.
- **수정**: insertPendingLink에 'on conflict (requester_id, addressee_id) do nothing'을 추가하거나, 서비스 로직을 멱등 upsert 기반으로 재구성한다.

### 신고 대상 존재검증 쿼리가 uuid 컬럼을 String 파라미터와 비교 → 타입 오류 가능

- **위치**: `apps/backend/src/main/java/world/yeon/backend/chat_service_reports/repository/ChatServiceReportRepository.java:20-21,54-58` · **lane**: be-chat-service · **cat**: db-type
- **이유**: existsFeedPost/existsAskPost(line 20-21)는 existsById로 'select 1 from ... where id = :id'(line 54-58)에 String id를 바인딩한다. chat_service_feed_posts.id, chat_service_ask_posts.id는 uuid 타입(V8). Hibernate 네이티브 쿼리에서 String을 varchar로 바인딩하면 Postgres에서 'operator does not exist: uuid = character varying' 오류가 발생해 신고 검증 자체가 500으로 실패할 수 있다. findMessageRoom(line 23-36)의 'm.id = :messageId'도 동일하게 uuid 컬럼에 String을 바인딩한다. (insertReport는 target_id 컬럼이 text라 별개 문제는 없음.)
- **수정**: id를 UUID.fromString으로 변환하여 UUID로 바인딩하거나, 쿼리에서 'id = cast(:id as uuid)'로 명시 캐스트한다. 잘못된 형식의 targetId는 변환 단계에서 400으로 처리한다.

### 공개 체크인 submit이 트랜잭션 경계 없이 다중 쓰기를 수행해 부분 반영 위험

- **위치**: `apps/backend/src/main/java/world/yeon/backend/public_check_runtime/service/PublicCheckRuntimeService.java:74-151,153-177` · **lane**: be-community-misc · **cat**: transaction
- **이유**: submit()/updateBoardSnapshot()는 upsertBoardSnapshot, insertBoardHistory, insertSubmission을 순차 호출하지만 서비스 메서드에 @Transactional이 없다. 확인한 repository(PublicCheckRuntimeRepository)의 각 쓰기 메서드(upsertBoardSnapshot/insertBoardHistory/insertSubmission)는 모두 자체 @Transactional(기본 REQUIRED)이라 상위 트랜잭션이 없으면 호출마다 독립 트랜잭션으로 커밋된다. updateBoardSnapshot에서 snapshot upsert는 커밋됐는데 직후 insertBoardHistory나 line 140 insertSubmission에서 예외가 나면 board snapshot은 present로 갱신됐지만 제출 이력/감사 로그가 누락된 비일관 상태가 남는다.
- **수정**: PublicCheckRuntimeService.submit()(및 updateBoardSnapshot 호출 묶음)에 @Transactional을 부여해 snapshot+history+submission이 하나의 트랜잭션으로 원자적 커밋/롤백되게 한다. repository 메서드의 개별 @Transactional은 REQUIRED라 상위 트랜잭션에 합류한다.

### verifyIdentity가 phoneLast4 null일 때 NPE(500) 발생

- **위치**: `apps/backend/src/main/java/world/yeon/backend/public_check_runtime/service/PublicCheckRuntimeService.java:59,197` · **lane**: be-community-misc · **cat**: error-handling
- **이유**: verifyIdentity()(line 59)는 request.phoneLast4()를 검증 없이 matchMember()에 넘기고, matchMember 197행은 phoneLast4.equals(extractPhoneLast4(member.phone()))를 호출한다. 확인한 VerifyPublicCheckIdentityRequest record에는 name/phoneLast4 필드만 있고 @NotNull 등 검증이 전혀 없다. 클라이언트가 phoneLast4를 null로 보내면 NullPointerException이 그대로 터져 400 대신 500이 반환된다. submit 경로는 getSubmittedIdentity로 null을 막지만(line 96, 203-208) verify 경로엔 동일 보호가 없다.
- **수정**: verifyIdentity 진입부에서 name/phoneLast4를 normalizeNullable로 정규화하고 null이면 PublicCheckRuntimeServiceException(400, INVALID_REQUEST, ...)을 던진다. 또는 matchMember 197행을 Objects.equals(phoneLast4, ...)로 바꾼다.

### snapshotSpaceAsTemplate가 소유권 미검증 + N+1 필드 조회

- **위치**: `apps/backend/src/main/java/world/yeon/backend/space_templates/write/service/SpaceTemplateWriteService.java:110-149` · **lane**: be-members-spaces · **cat**: security
- **이유**: snapshotQueryRepository.existsSpace(spaceId)로 존재만 확인하고(count 기반, 라인 116) userId 소유권을 검증하지 않아 타인 스페이스 구조를 복제해 자기 템플릿으로 만들 수 있다(정보 노출). 추가로 loadTabs 후 탭마다 loadFields(spaceId, tab.name(), tab.displayOrder())를 호출하는 N+1 구조이며(라인 126), 탭을 (name, displayOrder)로 매칭해 동일 displayOrder/name 탭이 있으면 필드가 잘못 매핑될 수 있다.
- **수정**: existsSpace를 owner-scoped 검증으로 교체하고, loadTabs/loadFields를 단일 조인 쿼리(tab LEFT JOIN field)로 합쳐 메모리에서 그룹핑한다. 탭-필드 매칭은 tab_id 기반으로 바꾼다.

### sheet export import-mutation 소유권 미검증(IDOR)

- **위치**: `apps/backend/src/main/java/world/yeon/backend/sheet_export/import_mutation/service/SheetExportImportMutationService.java:32-53` · **lane**: be-members-spaces · **cat**: security
- **이유**: apply는 findLinkedExportSpaceInternalId(spaceId, sheetId)로 스페이스-시트 연동만 확인하고(라인 37) userId 소유권을 검증하지 않는다. 해당 쿼리는 public_id + sheet_id + data_type='export'만 필터하고 created_by_user_id 조건이 없다(repository 라인 25-27). 이후 수강생 생성/수정과 커스텀 필드값 upsert를 수행하므로, 타인 스페이스에 대해 sheetId만 알면 수강생 데이터를 변조·생성할 수 있다.
- **수정**: apply 진입부에서 소유권을 검증하고, findLinkedExportSpaceInternalId 쿼리에 created_by_user_id 조건을 추가한다.

### Google Sheets HttpClient에 connect/request 타임아웃 없음 — 무한 대기 위험

- **위치**: `apps/backend/src/main/java/world/yeon/backend/sheet_integrations/service/SheetIntegrationService.java:41-150` · **lane**: be-members-spaces · **cat**: error-handling
- **이유**: HttpClient.newHttpClient()(라인 41)는 connect timeout이 없고, HttpRequest.newBuilder(...)(라인 143-148)에도 .timeout()이 설정되지 않았다. Google Sheets 응답 지연/네트워크 행 시 httpClient.send(라인 150) 스레드가 무기한 블로킹되어 톰캣 스레드 고갈로 이어질 수 있다. 재시도 로직도 없다.
- **수정**: HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5))로 생성하고 HttpRequest에 .timeout(Duration.ofSeconds(15)) 설정. 일시적 5xx/429에 대한 제한적 재시도(backoff)와 토큰 캐싱을 추가한다.

### 시트 동기화에서 행마다 멤버 조회 — N+1 쿼리

- **위치**: `apps/backend/src/main/java/world/yeon/backend/sheet_integrations/service/SheetIntegrationService.java:95-138` · **lane**: be-members-spaces · **cat**: n+1
- **이유**: dataRows 루프(라인 95)에서 행마다 findMemberInternalIdByName(라인 114), existsActivityLog(라인 121), insertActivityLog(라인 125)를 각각 호출한다. A1:Z1000 범위(라인 144)에서 1000행 시 수천 번의 개별 쿼리가 발생한다. 또한 members(space_id, name) 인덱스가 없어(V8엔 members_space_created_at_idx만 존재) 각 이름 조회가 풀스캔에 가깝다.
- **수정**: 스페이스의 member name→id 맵을 한 번에 select해 메모리 캐시, 기존 activity_logs 키도 일괄 조회. INSERT는 batch/ON CONFLICT로 묶는다. members(space_id, name) 인덱스를 추가한다.

### 필드 생성 시 탭이 스페이스 소속인지 검증하지 않음 — 교차 스페이스 탭 주입

- **위치**: `apps/backend/src/main/java/world/yeon/backend/member_fields/write/service/MemberFieldWriteService.java:34-63` · **lane**: be-members-spaces · **cat**: validation
- **이유**: create는 findTabLookup(tabPublicId) 결과의 tabInternalId만 사용하고(라인 39-49) tabLookup.spaceInternalId()와 요청 spaceInternalId가 일치하는지 확인하지 않는다(동일 도메인의 read 서비스 listValues는 라인 58-60에서 이 검증을 함). 다른 스페이스의 탭 public_id를 넘기면 그 탭 하위로 필드가 생성되어 데이터 무결성이 깨진다. update의 tabId 변경 경로(라인 73-80, 104)도 동일하다.
- **수정**: create/update에서 tabLookup.spaceInternalId().equals(spaceInternalId)를 검증하고 불일치 시 400/404를 반환한다.

### 탭/필드 reset·write 경로 소유권 미검증

- **위치**: `apps/backend/src/main/java/world/yeon/backend/member_tabs/reset/service/MemberTabResetService.java:31-44` · **lane**: be-members-spaces · **cat**: security
- **이유**: resetTabs(및 member_tabs/write의 createCustomTab/updateTab/deleteCustomTab)는 requireSpaceInternalId/findSpaceInternalId가 public_id만으로 조회하고 userId 소유권을 확인하지 않는다(resetTabs 라인 32-36; MemberTabWriteService 라인 42, 64, 84, 97-98). resetTabs는 deleteCustomTabs까지 수행하므로(라인 38) 타인 스페이스의 커스텀 탭과(FK cascade로) 그 하위 필드 정의/값이 삭제될 수 있다.
- **수정**: 이들 서비스 진입부에 소유권 검증을 추가한다(공통 SpaceAccessService 활용).

### 외부 OAuth/Drive HTTP 호출에 타임아웃이 전혀 없어 요청 스레드가 무한 블로킹될 수 있다

- **위치**: `apps/backend/src/main/java/world/yeon/backend/googledrive_browser/service/GoogleDriveBrowserService.java:36, 56, 82, 91, 119, 140, 155` · **lane**: be-oauth-drive · **cat**: error-handling
- **이유**: HttpClient.newHttpClient()로 생성한 클라이언트에 connectTimeout이 없고(line 36), 모든 HttpRequest.newBuilder(...)에도 .timeout()이 지정되지 않았다(line 56, 82, 91, 119). httpClient.send(...)(line 140, 155)는 응답 타임아웃이 없어 Google 엔드포인트 지연 시 Tomcat 워커 스레드를 무한 점유한다. 동일 패턴이 OneDriveBrowserService, GoogleDriveOAuthService, OneDriveOAuthService 4개 서비스 전부에 존재함을 코드로 확인했다.
- **수정**: 공용 HttpClient를 connectTimeout(Duration.ofSeconds(5))로 빌드하고, 각 HttpRequest.newBuilder(...)에 .timeout(Duration.ofSeconds(10)) 등 응답 타임아웃을 지정한다. HttpTimeoutException을 catch해 502/타임아웃 에러로 매핑한다. 빈으로 공유 HttpClient를 주입하는 것이 바람직하다.

### OneDrive OAuth/Browser 서비스도 외부 호출 타임아웃이 없다

- **위치**: `apps/backend/src/main/java/world/yeon/backend/onedrive_oauth/service/OneDriveOAuthService.java:23, 46, 51` · **lane**: be-oauth-drive · **cat**: error-handling
- **이유**: OneDriveOAuthService line 23의 HttpClient.newHttpClient()와 line 46의 HttpRequest 빌더, line 51의 send()에 connectTimeout/timeout이 전혀 없다. OneDriveBrowserService(line 30, 46, 112)도 동일하다. login.microsoftonline.com / graph.microsoft.com 지연 시 스레드 무한 점유 위험이 코드상 실재한다.
- **수정**: GoogleDrive와 동일하게 connectTimeout + 요청별 timeout을 설정하고 HttpTimeoutException을 502로 매핑한다.

### DB 스키마에 암호화 컬럼이 있는데 토큰을 평문으로 저장하고 암호화 컬럼을 NULL로 지운다

- **위치**: `apps/backend/src/main/java/world/yeon/backend/googledrive_oauth/repository/GoogleDriveOAuthRepository.java:34-37, 50-52` · **lane**: be-oauth-drive · **cat**: security
- **이유**: V8 마이그레이션(V8\_\_ensure_legacy_web_public_schema.sql line 420-421, 652-653)의 googledrive_tokens/onedrive_tokens 테이블에 access_token_encrypted, refresh_token_encrypted 컬럼이 존재한다(암호화 저장 의도). 그런데 upsertTokens는 access_token/refresh_token에 평문을 넣고(line 34-35, 50-52) \*\_encrypted 컬럼을 명시적으로 null로 set한다(line 36-37). OAuth 장기 자격증명이 평문으로 저장되어 DB 유출 시 사용자 Drive/Sheets/OneDrive 전체 접근 권한이 탈취된다. 동일 문제가 OneDriveOAuthRepository(line 22-23, 38), GoogleDriveBrowserRepository(line 45-46), OneDriveBrowserRepository(line 45-46) update에도 코드로 확인됐다.
- **수정**: 애플리케이션 레벨 봉투 암호화(예: AES-GCM, KMS 키)로 \*\_encrypted 컬럼에 저장하고 access_token/refresh_token 평문 컬럼은 비우거나 제거한다. 최소한 토큰 컬럼을 pgcrypto 등으로 암호화한다.

### OpenAI 전사 실패 시 응답 원문(raw body)을 error_message로 그대로 저장·노출

- **위치**: `apps/backend/src/main/java/world/yeon/backend/counseling_record_transcription/service/CounselingRecordTranscriptionService.java:callOpenAiTranscription (statusCode 비정상 분기, 140~142행) + runTranscription markError 116~121행` · **lane**: be-counseling-frozen · **cat**: [frozen] security
- **이유**: line 141에서 statusCode가 2xx가 아니면 throw new CounselingRecordTranscriptionServiceException(502, "OPENAI_TRANSCRIPTION_FAILED", "OpenAI 전사 API 호출 실패: " + response.body())로 OpenAI 응답 본문 전체를 메시지에 담는다. runTranscription의 catch(116~121)에서 이 메시지를 repository.markError(record.internalId(), message)로 넘기고, markError(repository 185~201)는 message를 error_message와 processing_message 두 컬럼에 모두 저장한다. detail/list 응답 매핑(CounselingRecordDetailService.toResponse 151행 errorMessage, CounselingRecordListService 79행 errorMessage)은 이 값을 그대로 클라이언트에 노출한다. OpenAI 오류 본문에는 조직/요청 식별자 등 내부 단서가 포함될 수 있어 정보 노출이다. 같은 코드베이스 AI 서비스(CounselingRecordAiService.extractOpenAiErrorMessage 656~664)는 error.message만 추출하는데 전사 경로만 raw body를 노출해 일관성도 깨진다.
- **수정**: 전사 실패 메시지도 AI 서비스처럼 응답 JSON에서 error.message만 추출(extractOpenAiErrorMessage 동등 로직)하거나 고정 한국어 메시지로 대체하고, raw response.body()는 서버 로그(logger.warn)로만 남긴다.

### AI 분석 중복 실행 방지(processing 체크)가 TOCTOU 경쟁 — 동시 호출 시 OpenAI 분석 중복 과금

- **위치**: `apps/backend/src/main/java/world/yeon/backend/counseling_record_ai/service/CounselingRecordAiService.java:runRecordAnalysis 60~84 (체크 68행, markAnalysisProcessing 72행)` · **lane**: be-counseling-frozen · **cat**: [frozen] race-condition
- **이유**: runRecordAnalysis는 detailService.getDetail로 읽은 analysisStatus가 'processing'이면 409를 던지는 read-then-act 구조(68~70행)인데, 직후 호출하는 markAnalysisProcessing(repository 42~59)의 UPDATE에는 analysis_status <> 'processing' 같은 상태 가드가 없다(where created_by_user_id, public_id만). 동일 recordId로 거의 동시에 두 요청이 들어오면 둘 다 검사 통과 후 둘 다 markAnalysisProcessing → 둘 다 requestAnalysisResult(동기 OpenAI Chat Completions 호출, 147~182)를 수행한다. 분석은 요청 스레드에서 동기 실행되어 과금이 2배가 되고 두 saveAnalysisResult가 경쟁적으로 덮어쓴다. analyze 엔드포인트가 멱등하지 않다.
- **수정**: markAnalysisProcessing의 UPDATE에 조건부 락 의미를 부여한다. 예: update ... set analysis_status='processing' ... where public_id=:id and created_by_user_id=:userId and analysis_status <> 'processing' 로 하고 executeUpdate() 반환 행수가 0이면 이미 진행 중으로 보고 409를 던진다(원자적 compare-and-set).

### card_room_results에 (room_id, card_id, participant_id) 유니크 제약 없음 — 중복 결과 INSERT 허용

- **위치**: `apps/backend/src/main/resources/db/migration/V6__create_public_card_rooms_tables.sql:51-59, 70` · **lane**: db-migrations · **cat**: db-index
- **이유**: V6에는 card_room_results_room_card_idx(room_id, card_id) 비유니크 인덱스(line 70)만 있고 (room_id, card_id, participant_id) 유니크 제약이 없다. insertResult(CardRoomRepository.java:137)는 ON CONFLICT 없는 plain insert이고, 호출부 submitResult(CardRoomService.java:250-269)에도 같은 참가자/카드에 대한 dedup 가드가 없다. 따라서 한 참가자가 같은 카드 결과를 여러 번 제출하면 중복 행이 쌓여 점령전 결과 집계가 왜곡되며, 동시 제출 시 앱 레벨 dedup이 없어 레이스에도 취약하다.
- **수정**: create unique index card_room_results_room_card_participant_unique on public.card_room_results(room_id, card_id, participant_id); 추가하고 insertResult를 ON CONFLICT DO NOTHING/UPDATE로 바꾼다.

### card_room_participants에 (room_id, user_id)/(room_id, guest_id) 부분 유니크 제약 부재 — 활성 참가자 중복 생성 가능

- **위치**: `apps/backend/src/main/resources/db/migration/V6__create_public_card_rooms_tables.sql:26-39, 64-68` · **lane**: db-migrations · **cat**: race-condition
- **이유**: findActiveParticipantByIdentity(CardRoomRepository.java:82-92)는 'where room_id=? and user_id=? and left_at is null ... limit 1' 앱 쿼리로만 단일 활성 참가자를 가정하고, insertParticipant(line 78)는 plain insert다. DB에는 card_room_participants_public_id_unique(line 64)만 있어 (room_id, user_id) where left_at is null 부분 유니크가 없다. 동시 join 요청 시 같은 user/guest가 한 방에 left_at is null 행을 2개 이상 만들 수 있는 check-then-insert 레이스가 존재한다.
- **수정**: 부분 유니크 인덱스 추가: create unique index card_room_participants_room_user_active_idx on public.card_room_participants(room_id, user_id) where left_at is null and user_id is not null; guest_id 동일. 또는 upsert로 변경.

### card_deck 이미지 필드(imageStorageKey/imageUrl)가 백엔드에 전혀 배선되지 않음 (계약 3자 드리프트)

- **위치**: `apps/backend/src/main/java/world/yeon/backend/card_decks/route/dto/CardDeckItemDto.java:3-12` · **lane**: contract-drift · **cat**: contract-drift
- **이유**: 검증 완료. zod cardDeckItemDtoSchema(card-decks.ts:103-117)는 imageStorageKey/imageUrl를, createCardDeckItemBodySchema(42-50)/updateCardDeckItemBodySchema(65-74)는 imageStorageKey를 포함하고, DB(V4 migration 35행, V8 65행)에 image_storage_key 컬럼이 존재하며, cardDeckAssetUploadResponseSchema(storageKey,imageUrl) 업로드 계약도 있다. 그러나 CardDeckItemDto 레코드(8필드)에 image 필드 없음, CreateCardDeckItemRequest는 (frontText,backText)뿐, repository.insertItem/updateItem/listDeckItems/findOwnedItem SELECT 어디에도 image_storage_key 없음, service.toItemDto(CardDeckRouteService.java:162-163)도 image를 매핑하지 않는다. api-client index.ts:237 schema.parse는 nullish 덕에 안 깨지지만, 클라이언트가 보낸 storageKey는 Jackson이 조용히 버리고 DB 컬럼은 영원히 NULL, 응답에도 절대 실리지 않아 이미지 기능이 죽은 계약이 됐다.
- **수정**: CardDeckItemDto에 imageStorageKey,imageUrl 필드 추가; CreateCardDeckItemRequest에 imageStorageKey 추가하고 createItem/createItems가 전달; repository.insertItem/updateItem/SELECT에 image_storage_key 포함; toItemDto에서 storageKey→imageUrl(/api/v1/card-decks/assets/{key}) 변환; UpdateCardDeckItemRequest도 imageStorageKey 패치 지원.

### merge-guest 경로도 imageStorageKey를 영구 폐기함

- **위치**: `apps/backend/src/main/java/world/yeon/backend/card_decks/merge_guest/dto/MergeGuestCardDeckItemRequest.java:3-6` · **lane**: contract-drift · **cat**: contract-drift
- **이유**: 검증 완료. mergeGuestItemSchema(card-deck-merge-guest.ts:9-13)는 imageStorageKey(max512).nullish()를 받지만, MergeGuestCardDeckItemRequest 레코드는 frontText/backText만 갖는다. MergeGuestCardDeckService.merge(service 49-59행)는 insertRows에 {publicId,frontText,backText}만 담고 item.imageStorageKey()를 읽지 않으며(필드 자체가 없음), MergeGuestCardDeckRepository.insertItems의 INSERT(repository 47-56행)는 image_storage_key를 컬럼 목록에 아예 넣지 않는다. 게스트가 이미지 카드를 로그인 시 병합하면 이미지 키가 통째로 유실되며, 위 read 경로 결함과 합쳐 이미지 데이터가 write·merge·read 어디서도 살아남지 못한다.
- **수정**: MergeGuestCardDeckItemRequest에 imageStorageKey 추가, service가 trim 후 insertRows에 포함, insertItems INSERT 컬럼/파라미터에 image_storage_key 추가.

### 입장 후 참가자 목록에서 사라진 stale 참가자 ID 복구 로직 부재 — 영구히 죽은 방에 갇힘

- **위치**: `apps/mobile/src/features/card-service/rooms/card-room-screen.tsx:38-68` · **lane**: fe-card-rooms · **cat**: correctness
- **이유**: 웹(apps/web/src/features/card-service/card-room-screen.tsx:68-76)에는 state.participants에 내 participantId가 없으면 저장된 ID를 지우고 setParticipantId(null)로 재입장을 유도하는 useEffect가 있다. 모바일 card-room-screen에는 이 복구 effect가 전혀 없음을 확인했다(38-66은 입장 effect만 존재). 더구나 모바일은 participantId를 SecureStore(profile-storage writeItem→getYeonSecureStorage, 영구 저장)에 쓰는데 웹은 sessionStorage라 탭 닫으면 사라진다. 한 번 죽은 participantId가 앱 재시작 후에도 재사용되어 me=state.participants.find(...)??null=null → myRole="MEMORIZER", isHost=false(99-101)로 강등되고 정상 입장 불가 상태에 갇힌다.
- **수정**: card-room-screen에 web과 동일한 effect 추가: connection.state와 participantId가 있고 state.participants에 내 id가 없으면 저장된 participant 키 삭제 후 setParticipantId(null) 하여 REST join 재시도를 트리거. profile-storage에 deleteCardRoomParticipantId(roomId) 추가 필요.

### 방 나가기 시 서버에 LEAVE를 보내지 않고 router.back만 호출 — 좀비 참가자 잔존

- **위치**: `apps/mobile/src/features/card-service/rooms/card-room-screen.tsx:71-73` · **lane**: fe-card-rooms · **cat**: correctness
- **이유**: handleLeave는 router.back()만 한다(71-73). 웹 leaveRoom(card-room-screen.tsx:126-131)은 저장된 participant 키를 지우고 room.sendLeave()를 호출한다. race-server card-room.ts:247에 CARD_ROOM_EVENTS.LEAVE 핸들러가 실재하지만 모바일 connection 훅은 sendLeave 자체를 노출하지 않으므로(use-card-room-connection.ts 반환값에 sendLeave 없음) 명시적 퇴장을 보낼 수 없다. 저장된 participantId도 그대로 남아 다음 입장 시 stale ID로 재연결을 시도한다.
- **수정**: connection 훅에 sendLeave(CARD_ROOM_EVENTS.LEAVE)를 추가해 노출하고, handleLeave에서 participantId 있으면 connection.sendLeave() + deleteCardRoomParticipantId(roomId) 후 router.back().

### asset-upload 라우트가 인증·권한 검증 없이 누구나 업로드 가능(스토리지 남용/임의 호스팅 악용)

- **위치**: `apps/web/src/app/api/v1/card-decks/assets/route.ts:15-38` · **lane**: fe-markdown · **cat**: security
- **이유**: POST 핸들러에 세션/인증 체크가 전혀 없다. 같은 모듈의 card-decks/route.ts는 requireAuthenticatedUser로 보호하는데 assets/route.ts만 보호가 없고, 클라이언트(asset-upload.ts) 주석이 '게스트/로그인 무관하게 업로드 가능'이라고 설계로 명시한다. 인증 없이 multipart 파일을 그대로 Spring 백엔드 스토리지에 적재하므로 외부 공격자가 임의 파일을 무제한 업로드해 스토리지를 채우거나(DoS/비용) 임의 파일 호스팅(핫링크/불법 콘텐츠)에 악용할 수 있다. rate limit도 없다.
- **수정**: 라우트에 인증 가드(최소 게스트 토큰/세션 또는 rate limit)를 추가하고, 인증 사용자/게스트 식별자별 업로드 쿼터를 둔다. 게스트 허용이 필요하면 디바이스/세션 기반 토큰 + 요청 빈도 제한 + 만료 정책을 도입한다.

### 업로드 라우트에 파일 크기·MIME·확장자 검증 부재(대용량/비이미지 업로드 허용)

- **위치**: `apps/web/src/app/api/v1/card-decks/assets/route.ts:23-29` · **lane**: fe-markdown · **cat**: validation
- **이유**: isYeonFile(file)로 File 여부만 확인하고 곧장 uploadCardDeckAssetToSpring(file)에 넘긴다. 최대 바이트 수, content-type(image/\*) allowlist, 매직바이트 검증이 전혀 없다. 클라이언트(asset-upload.ts)는 asset.mimeType ?? 'image/jpeg'로 임의 type을 보내므로 서버가 신뢰하면 안 된다. 결과적으로 대용량 파일이나 비이미지 파일(SVG 스크립트, HTML 등)이 imageUrl로 발급되어 CardMarkdown/YeonImage가 렌더하거나 외부에 노출될 수 있다.
- **수정**: 서버에서 바이트 길이 상한(예: 5MB), image/png·jpeg·webp·gif allowlist, 매직바이트 sniffing 검증을 추가하고 위반 시 400을 반환한다. SVG는 스크립트 실행 위험이 있으므로 거부하거나 sanitize한다.

### YeonNavigationPort/YeonRouteTarget/YeonAppRuntime 등 핵심 포트 전부가 죽은 포트(dead port)

- **위치**: `packages/ui/src/runtime/ports/shared.ts:16-122` · **lane**: fe-universal-ui · **cat**: dead-code
- **이유**: grep 확인 결과 YeonRouteTarget/YeonNavigationPort/YeonSessionPort/YeonKeyValueStorePort/YeonAppRuntime(+Provider)/useYeonNavigation/useYeonSession/useYeonKeyValueStore 의 매칭은 shared.ts 자기 자신뿐이고 소스 어디에서도 소비/구현/주입되지 않는다. 실제 네비게이션은 routes.ts의 YEON_ROUTE_TEMPLATES+resolveYeonWebPath/모바일 템플릿 직접 사용으로 이뤄지고, 세션은 각 화면이 CARD_SERVICE_MODE/sessionToken/resolveCardServiceSession으로 직접 처리한다. 레지스트리(line 79/85)는 navigation-port/session-port의 SSOT를 이 죽은 포트로 못박았으나 실 소비 지점이 0개다.
- **수정**: 두 갈래 중 하나로 정리: (a) 실제로 화면이 useYeonNavigation/useYeonSession을 쓰도록 어댑터(YeonNavigationPort 구현 + YeonAppRuntimeProvider 배선)를 붙이거나, (b) 현 시점 미사용임을 인정하고 dead 포트를 제거(또는 명시적 'planned, not wired' 주석/registry 상태로 강등)해 죽은 인터페이스가 SSOT인 척하지 않게 한다.

### route-identity 개념이 두 곳(YeonRouteTarget union ↔ YEON_ROUTE_TEMPLATES)에 중복 선언되어 drift(parity 위반)

- **위치**: `packages/ui/src/runtime/ports/shared.ts:16-20` · **lane**: fe-universal-ui · **cat**: contract-drift
- **이유**: 레지스트리 line 64는 route-identity SSOT를 shared.ts의 YeonRouteTarget union으로 못박았는데 실제 소비되는 라우트 정체성은 routes.ts의 YEON_ROUTE_TEMPLATES다. 두 선언이 이미 어긋남: union은 cardDeckList/cardDeckDetail/cardDeckPlay/cardRoomLobby 를 갖고, 템플릿은 cardHome/cardDeckList/cardDeckDetail/cardDeckPlay/cardRoomList/cardRoomDetail 를 갖는다. union의 cardRoomLobby는 대응 템플릿이 없고, 템플릿의 cardHome/cardRoomList/cardRoomDetail은 union에 없다. 두 raw 선언 사이에 컴파일타임 연결이 없어 한쪽만 바뀌어도 잡히지 않는다.
- **수정**: 라우트 이름 집합을 한 출처(YeonRouteName=keyof YEON_ROUTE_TEMPLATES)에서 파생하도록 통일하고, YeonRouteTarget을 쓰려면 그 name을 YeonRouteName에서 도출(예: params는 매핑 타입)하게 묶는다. registry의 route-identity ssot 경로도 실제 소비처(routes.ts)로 수정한다.

### 모바일 detail/play 화면이 SSOT 우회한 raw queryKey ["card-service","deck","missing",mode] 재선언

- **위치**: `apps/mobile/src/features/card-service/card-deck-detail-screen.tsx:124` · **lane**: fe-universal-ui · **cat**: contract-drift
- **이유**: deckId가 없는 경우의 queryKey를 cardDeckQueryKeys(SSOT) 대신 raw 배열 ["card-service","deck","missing",mode] 로 직접 선언한다. SSOT(query-keys.ts:17/20/23) 네임스페이스는 'decks'(복수)인데 여기선 'deck'(단수)을 쓰고, scope도 'server'/'guest'(scope() 함수) 대신 mode 문자열을 그대로 박았다. card-deck-play-screen.tsx:91 에도 동일 패턴이 복제돼 있다. 정확히 레지스트리가 금지한 raw 재선언 drift.
- **수정**: missing 케이스도 SSOT에서 파생하도록 cardDeckQueryKeys에 placeholder/disabled 키(예: detail(scope,'**missing**')) 또는 enabled:false + 안전한 deck 키를 쓰게 통일한다. play 화면의 동일 라인도 함께 수정. 'deck' 단수 네임스페이스 금지.

### OTP requestOtp/verifyOtp에 rate limit·시도 제한 부재

- **위치**: `apps/backend/src/main/java/world/yeon/backend/chat_service_auth/service/ChatServiceAuthService.java:24-59` · **lane**: x-security · **cat**: rate-limit
- **이유**: requestOtp(line 24-32)는 동일 전화번호로 무제한 challenge 생성이 가능하고(실 SMS 연동 시 SMS 폭탄/비용 폭증), verifyOtp(line 34-59)는 challenge당 코드 입력 실패 횟수 제한이 전혀 없어 실제 코드 도입 시 6자리 무차별 대입이 가능하다. credential_auth에는 IP/계정 잠금(CredentialEmailRateLimiter, IP_LOGIN_LIMIT_PER_MINUTE)이 있으나 chat OTP 경로에는 동등한 보호가 없다.
- **수정**: 전화번호/IP 기준 requestOtp 발급 빈도 제한과 challenge별 검증 실패 N회 시 폐기 로직을 추가한다(credential_auth의 CredentialEmailRateLimiter 패턴 재사용).

### card-rooms 참가자 조작/퇴장이 인증·소유권 검증 없이 가능(IDOR)

- **위치**: `apps/web/src/app/api/v1/card-rooms/[roomId]/participants/[participantId]/route.ts:7-17` · **lane**: x-security · **cat**: security
- **이유**: PATCH/DELETE 모두 requireAuthenticatedUser나 호출자-참가자 바인딩 검증 없이 roomId/participantId만으로 Spring에 위임한다(line 10, 15). 백엔드 CardRoomService.updateParticipant/startRoom/endRoom/leaveRoom은 requireParticipantInRoom(line 297-303)으로 '참가자가 그 방에 있는지'만 확인하고, participantId는 비밀 토큰이 아니라 toParticipant(line 365-366)가 detail 응답에 row.publicId()로 넣어 모든 참가자에게 공개한다. 따라서 같은 방의 악의적 사용자가 다른 참가자의 publicId로 역할 변경·강제 ready·강제 퇴장을, 호스트 publicId로 start/end까지 수행할 수 있다.
- **수정**: 참가자 가입 시 서버가 발급하는 비밀 참가자 토큰(또는 인증 세션-참가자 매핑)을 도입하고, 모든 참가자 변이/방 제어 호출에서 호출자가 해당 participantId의 실제 소유자(또는 host)임을 검증한다.

### Colyseus card-room onJoin이 클라이언트 제공 participantId를 무검증 신뢰

- **위치**: `apps/race-server/src/rooms/card-room.ts:301-303` · **lane**: x-security · **cat**: security
- **이유**: onJoin은 options.participantId 존재 여부만 확인하고 그대로 client.sessionId에 매핑한다(this.participants.set, line 302-303). 이후 모든 메시지 핸들러가 withParticipant(line 753-775)로 이 값을 사용해 spring()에서 X-Yeon-Participant-Id로 전달하므로(springHeaders, line 158-164), 임의 클라이언트가 타인의 participantId로 방에 들어와 그 참가자로 가장해 실시간 액션(start/end/leave/reveal/next/메시지/보이스)을 수행할 수 있다. BFF IDOR와 동일한 근본 원인(참가자 식별자가 공개·비인증).
- **수정**: onJoin에서 서버 발급 참가자 토큰을 검증하거나, race-server가 Spring에 participantId+세션 토큰을 함께 검증 요청해 실제 소유자임을 확인한 뒤에만 매핑한다.

### 가져오기 커밋이 수강생·필드값을 행 단위 단일 INSERT로 반복 실행(N+1 쓰기)

- **위치**: `apps/backend/src/main/java/world/yeon/backend/import_commit/service/ImportCommitService.java:87-99` · **lane**: x-perf · **cat**: n+1
- **이유**: commitImport는 코호트마다 students 루프 안에서 repository.insertMember를 학생 1명당 1쿼리(L88), 다시 customFields 루프 안에서 insertFieldValue를 값 1개당 1쿼리(L97)로 실행한다. ImportCommitRepository.insertMember(L84-101)/insertFieldValue(L103-118)는 모두 단건 native INSERT다. 수백 명·수십 필드를 가져오면 수천 번의 개별 INSERT가 한 트랜잭션에서 발생해 가져오기 응답이 선형으로 느려진다.
- **수정**: insertMember는 VALUES 다중행 또는 unnest 기반 batch INSERT로, insertFieldValue는 멤버별 또는 전체 묶음 batch INSERT로 전환한다. JDBC batch(rewriteBatchedInserts) 또는 단일 multi-row native query 사용.

### 모바일 전반에 FlatList 미사용 — 채팅 메시지를 ScrollView+map으로 렌더

- **위치**: `apps/mobile/src/features/chat-service/chat/chat-room-screen.tsx:205` · **lane**: x-perf · **cat**: perf
- **이유**: apps/mobile/src 전체에 FlatList/FlashList/SectionList가 0건이다(rg 확인). 채팅방은 roomQuery.data.messages를 ChatMessageScroll(YeonScrollView 기반) 안에서 .map으로 전량 렌더(L205-221)하고, onContentSizeChange마다 scrollToEnd를 호출한다(L200-202). 메시지가 누적되면 전 메시지 노드가 항상 마운트되어 메모리·렌더 비용이 선형 증가하고 가상화가 없다.
- **수정**: 채팅 메시지를 inverted FlatList(또는 FlashList)로 전환해 화면 밖 항목을 언마운트하고, scrollToEnd 대신 inverted 리스트의 상단 정렬을 사용한다.

### 카드 덱 상세: 비가상화 리스트에서 카드마다 마크다운 2회 파싱

- **위치**: `apps/mobile/src/features/card-service/card-deck-detail-screen.tsx:428-433` · **lane**: x-perf · **cat**: perf
- **이유**: detail.items를 FormStack(MobileScreen 스크롤) 안에서 .map으로 전량 렌더(L428)하고, 카드마다 <CardMarkdown source={item.backText}/>와 <CardMarkdown source={item.frontText}/> 두 개의 파싱을 수행한다(L432-433). CardMarkdown은 plain 함수(card-markdown.tsx L141, memo 아님), EditableCardRow도 비메모(YeonEditableCardRow는 export function, L39)이며 onToggleMenu 등 인라인 화살표 콜백을 매 렌더 새로 만든다(L445-449). activeMenuItemId 토글(useState L106) 시 리스트 전체가 리렌더되어 모든 카드의 마크다운이 재파싱된다.
- **수정**: 카드 리스트를 FlatList로 가상화하고, EditableCardRow/CardMarkdown을 React.memo로 감싸며 콜백을 useCallback+안정 식별자로 전달해 메뉴 토글이 해당 카드만 리렌더하도록 한다.

## [MEDIUM] 59건

### 비-UUID userId/accountKey 입력 시 uuid 캐스트로 500 발생(우아한 실패 누락)

- **위치**: `apps/backend/src/main/java/world/yeon/backend/root_auth/repository/AuthSessionRepository.java:63-73` · **lane**: be-auth-users · **cat**: error-handling
- **이유**: 확인됨. findUserById는 where id = cast(:userId as uuid) 쿼리를 쓴다(line 67). checkAdmin(normalizeString(userId,64)), createSessionForUser(userId), resolveDevLoginUserId(accountKey)이 임의 문자열을 그대로 넘긴다. 유효 UUID가 아니면 Postgres가 invalid input syntax for type uuid를 던지고 PersistenceException이 발생하는데, AuthSessionController에는 이를 잡는 핸들러나 전역 ControllerAdvice가 없어 500이 된다. checkAdmin은 false, dev-login은 404를 반환해야 하나 비정상 입력에 500 노출.
- **수정**: 서비스 계층에서 UUID.fromString 파싱을 try/catch로 선검증해 형식 오류 시 null/404/false로 처리하거나, 리포지토리에서 invalid uuid를 빈 결과로 매핑하라.

### 이메일 기반 자동 계정 연결로 교차-provider 인계 가능

- **위치**: `apps/backend/src/main/java/world/yeon/backend/root_auth/service/AuthSessionService.java:206-223` · **lane**: be-auth-users · **cat**: security
- **이유**: 확인됨. upsertSocialLoginOnce는 검증 이메일이 있으면 findReusableUser(line 213, 225-235)로 동일 verified email의 기존 user를 찾아, 같은 provider의 충돌 identity가 없으면 insertIdentity(line 220)로 새 provider identity를 기존 계정에 자동 연결한다. 즉 Google로 가입된 email X 계정에 같은 email X로 검증된 Kakao identity가 붙어 동일 계정 로그인 권한을 얻는다. 양쪽 verified email을 요구하나 provider 이메일 검증 신뢰도에 전적으로 의존하는 묵시적 연결이라 takeover 위험.
- **수정**: 교차-provider 자동 연결을 막거나(이메일 일치만으로 연결 금지), 명시적 계정 연결 확인 플로우를 두고, 최소한 연결 시 감사 로그/알림을 남겨라.

### next가 PASSED/GIVEN_UP/REVEALED만 허용하지만 카드별 PASSED 상태가 방 전체 status에 저장돼 동시성과 충돌

- **위치**: `apps/backend/src/main/java/world/yeon/backend/card_rooms/service/CardRoomService.java:226-238` · **lane**: be-card-rooms · **cat**: architecture
- **이유**: 카드 진행 상태(PASSED/GIVEN_UP/REVEALED/ANSWERING)를 방 단일 row의 status 컬럼 하나에 저장한다. 결과(card_room_results)는 카드별로 쌓이는데 방 status는 마지막 submitResult가 덮어쓴다. 여러 참가자/여러 카드가 얽히면 '현재 카드가 resolved 인지'를 방 status로 판정하는 next의 전제가 깨진다(다른 카드 결과가 status를 PASSED로 바꿔둔 상태에서 next가 통과). 카드 단위 상태를 방 status로 압축한 모델 자체가 누락 케이스를 만든다.
- **수정**: 현재 카드의 resolved 여부를 card_room_results에서 (room_id,card_id=현재카드)로 직접 판정하도록 바꾸고, 방 status는 WAITING/IN_PROGRESS/FINISHED/CLOSED 같은 방 수준 상태만 갖게 분리하라.

### startRoom 역할 검증이 '대표 역할 1+1'만 보고 모든 참가자 역할 배정을 강제하지 않음

- **위치**: `apps/backend/src/main/java/world/yeon/backend/card_rooms/service/CardRoomService.java:160-168` · **lane**: be-card-rooms · **cat**: validation
- **이유**: role enum이 MEMORIZER/CHECKER 둘뿐이고 fromNullable 기본값이 항상 둘 중 하나로 떨어져 '역할 미배정'이라는 개념이 없다. hasMemorizer && hasChecker만 확인하므로 3인 이상일 때 특정 참가자가 의도와 다른 역할로 강제 배정돼도 검출되지 않는다. nextRole 로직(317-321)은 checker 유무만 보고 토글해 인원이 늘면 역할 분포가 불균형해진다.
- **수정**: 역할 배정을 명시적 단계로 만들고(미배정 상태 허용), 시작 시 모든 활성 참가자가 유효 역할을 가졌는지·최소 인원 조건을 함께 검증하라.

### insertMessage/insertResult가 방금 넣은 행을 전체 리스트 재조회 후 stream 필터로 찾음(N건 재스캔)

- **위치**: `apps/backend/src/main/java/world/yeon/backend/card_rooms/repository/CardRoomRepository.java:121-124, 136-139` · **lane**: be-card-rooms · **cat**: perf
- **이유**: insertMessage는 listMessages(roomId)로 방의 모든 메시지(최대 200)를 다시 join 조회한 뒤 stream으로 publicId 일치 1건을 찾는다. insertResult도 동일하게 전체 results를 재조회한다. 메시지/결과가 쌓일수록 매 insert마다 불필요한 풀스캔+join 비용이 들고, addMessage는 이어서 detail(roomId)에서 listMessages를 또 호출해 같은 쿼리를 2번 실행한다.
- **수정**: insert 후 RETURNING 또는 public_id 단건 조회 쿼리(findMessage(publicId)/findResult(publicId))로 방금 행만 가져오라. addMessage는 detail 한 번만 호출하도록 정리.

### detail()이 호출마다 방+카드+참가자+메시지+결과 5개 쿼리를 별도로 실행(N+1성 다중 왕복)

- **위치**: `apps/backend/src/main/java/world/yeon/backend/card_rooms/service/CardRoomService.java:272-279` · **lane**: be-card-rooms · **cat**: n+1
- **이유**: 거의 모든 mutation이 끝에 detail()을 호출하는데 detail은 requireRoom(findRoom: 호스트 join+3개 서브쿼리 count) + listCards + listParticipants + listMessages(join) + listResults(2 join) 총 5회 DB 왕복을 한다. submitResult/addMessage 등은 직전에 이미 requireRoom을 호출했으므로 findRoom이 중복 실행되기도 한다. 트래픽이 몰리는 실시간 방에서 왕복 수가 과하다.
- **수정**: 한 트랜잭션 안에서 이미 조회한 RoomRow를 detail에 전달해 findRoom 중복을 제거하고, count 서브쿼리를 한 번의 group by 또는 단일 조회로 줄여라. 폴링 빈도가 높다면 detail 조회 전용 read-only 경로를 최적화.

### card_room_results에 (room_id,card_id,participant_id) 유니크가 없어 같은 결과 중복 누적

- **위치**: `apps/backend/src/main/resources/db/migration/V6__create_public_card_rooms_tables.sql:51-70` · **lane**: be-card-rooms · **cat**: db-index
- **이유**: results 테이블에는 public_id 유니크와 (room_id,card_id) 일반 인덱스만 있고, 한 참가자가 같은 카드에 결과를 여러 번 제출하는 것을 막는 유니크 제약이 없다. submitResult에도 중복 가드가 없어 동일 카드/참가자에 대해 OK/GIVE_UP이 여러 row로 쌓이고 listResults가 중복 표시한다.
- **수정**: 비즈니스 규칙에 맞게 (room_id, card_id) 또는 (room_id, card_id, participant_id) 부분/전체 유니크 인덱스를 추가하고, 서비스에서 충돌을 멱등 처리하라.

### 신고 profile 대상의 UUID.fromString 미검증 예외 → 500

- **위치**: `apps/backend/src/main/java/world/yeon/backend/chat_service_reports/service/ChatServiceReportService.java:33` · **lane**: be-chat-service · **cat**: input-validation
- **이유**: targetType=='profile'일 때 repository.existsProfile(UUID.fromString(targetId))(line 33)를 직접 호출한다. targetId가 UUID 형식이 아니면 IllegalArgumentException이 발생하고 컨트롤러 @ExceptionHandler(controller line 30)는 ChatServiceReportServiceException만 잡으며 chat_service 전역 ControllerAdvice도 없어 500이 노출된다. targetId 형식 검증이 전혀 없다.
- **수정**: targetId를 try/catch로 파싱해 형식 오류 시 400(예: CHAT_SERVICE_REPORT_TARGET_INVALID)을 던진다. 다른 targetType의 uuid 비교 문제와 함께 일괄 처리.

### 신고 reason 입력 검증 부재 → null/과길이 시 DB 제약 위반 500

- **위치**: `apps/backend/src/main/java/world/yeon/backend/chat_service_reports/service/ChatServiceReportService.java:21,41` · **lane**: be-chat-service · **cat**: input-validation
- **이유**: reason은 어떤 검증도 없이 insertReport로 전달된다(service line 21 시그니처, line 41 호출). chat_service_reports.reason은 varchar(240) NOT NULL(V8 line 292). reason이 null이거나 240자를 초과하면 DB가 NOT NULL/length 위반을 던지고, 이는 ServiceException이 아니므로 500으로 노출된다. targetType만 화이트리스트 검증하고 본문 페이로드는 무방비.
- **수정**: reason을 trim 후 비어있음/길이(<=240) 검증하여 위반 시 400 ServiceException을 던진다. feed normalizeBody와 동일 패턴 적용.

### 내 프로필 수정 입력 검증 전무 → DB 제약 위반/과길이 시 500

- **위치**: `apps/backend/src/main/java/world/yeon/backend/chat_service_my_profile/service/ChatServiceMyProfileService.java:28-35` · **lane**: be-chat-service · **cat**: input-validation
- **이유**: update()(line 28-35)는 nickname/ageLabel/regionLabel/bio를 검증·정규화 없이 updateProfile로 넘긴다. 스키마상 nickname varchar(40), age_label varchar(20), region_label varchar(40), bio varchar(160)(V8 line 268-272). nickname=null 또는 40자 초과, bio 160자 초과 등은 DB 제약 위반 → 500(ServiceException 아님). 사용자 표시 핵심 필드인데 길이/공백/null 가드가 없다.
- **수정**: 각 필드 trim 및 null/empty·max length 검증(닉네임 1~40, age_label<=20, region_label<=40, bio<=160)을 추가하고 위반 시 400 ServiceException을 던진다. feed normalizeBody와 동일 패턴 적용.

### 에스크 글 작성 question/kind/options 검증 부재 → 500 및 잘못된 투표글 생성

- **위치**: `apps/backend/src/main/java/world/yeon/backend/chat_service_ask/service/ChatServiceAskService.java:32-40` · **lane**: be-chat-service · **cat**: input-validation
- **이유**: create()(line 32-40)는 question/kind/options를 전혀 검증하지 않고 insert한다. chat_service_ask_posts.question varchar(240), kind varchar(16)(V8 line 101-102). question=null/과길이면 DB 위반, kind는 임의 문자열 허용(vote()는 'poll'만 허용하므로 알 수 없는 kind 글은 영구 투표 불가). poll인데 options가 0~1개여도 막지 않는다. 또한 try/catch(Exception)(line 37)로 모든 예외를 CHAT_SERVICE_ASK_CREATE_FAILED 500으로 뭉뚱그려 400이어야 할 입력 오류도 500이 된다.
- **수정**: question(trim,1~240), kind를 허용 집합으로, kind=='poll'이면 options 2개 이상·각 라벨 trim·길이 검증을 추가하고 위반 시 400을 던진다. 광범위 catch는 검증 통과 후의 진짜 DB 오류만 500으로 매핑하도록 좁힌다.

### 채팅 메시지 전송 body 검증/정규화 부재 → null/공백/과길이 미차단

- **위치**: `apps/backend/src/main/java/world/yeon/backend/chat_service_chat_rooms/service/ChatServiceChatRoomsService.java:49-63` · **lane**: be-chat-service · **cat**: input-validation
- **이유**: send()(line 49-63)는 body를 검증·trim 없이 insertMessage로 전달한다(line 61). chat_service_chat_messages.body는 text NOT NULL(V8 line 175). body=null이면 NOT NULL 위반 500(ServiceException 아님), 빈 문자열/공백만 있는 메시지도 그대로 저장되어 last_message_at만 갱신되는 빈 메시지가 생긴다(피드는 normalizeBody로 막는 것과 비대칭).
- **수정**: body를 trim 후 비어있음 검증(1자 이상), 합리적 상한(예: 1000자) 길이 검증을 추가하고 위반 시 400 ServiceException을 던진다.

### 피드 루트/답글 목록 정렬(created_at desc)에 부합하는 인덱스 없음

- **위치**: `apps/backend/src/main/java/world/yeon/backend/chat_service_feed/repository/ChatServiceFeedRepository.java:32-42` · **lane**: be-chat-service · **cat**: db-index
- **이유**: listRootFeed(line 32-34)는 'where reply_to_post_id is null order by created_at desc limit 30', listReplies(line 37-41)는 'where reply_to_post_id = :postId order by created_at desc limit 50'을 실행한다. 그러나 feed_posts의 인덱스는 (author_id, created_at)와 (reply_to_post_id)뿐(V8 line 1235-1236). 루트 목록은 정렬을 지원받는 인덱스가 없어 매 호출 scan + sort, 답글 목록은 reply_idx로 필터는 되나 정렬은 메모리 sort. 데이터 증가 시 피드 첫 화면 쿼리가 느려진다.
- **수정**: 부분 인덱스 'create index on chat_service_feed_posts (created_at desc) where reply_to_post_id is null'과 복합 인덱스 '(reply_to_post_id, created_at desc)'를 V8 인덱스 섹션에 추가한다.

### 채팅방 상세의 메시지 조회에 LIMIT 없음 → 무제한 로드

- **위치**: `apps/backend/src/main/java/world/yeon/backend/chat_service_chat_rooms/repository/ChatServiceChatRoomsRepository.java:133-143` · **lane**: be-chat-service · **cat**: perf
- **이유**: listMessages(line 133-143)는 'where room_id = :roomId order by created_at asc'를 LIMIT/페이지네이션 없이 전부 가져온다. 오래 사용된 방은 수천~수만 메시지를 한 번에 직렬화/전송하게 되어 메모리·응답시간이 선형 증가한다. 다른 목록 쿼리(피드 30, 답글 50)는 limit이 있는데 메시지만 무제한.
- **수정**: 최근 N개(예: 100) limit + keyset(created_at/id 기준) 페이지네이션을 도입하고, 클라이언트가 위로 스크롤 시 더 불러오도록 한다.

### 제출자 이름/과제 링크 길이 미검증으로 컬럼 길이 초과 시 500

- **위치**: `apps/backend/src/main/java/world/yeon/backend/public_check_runtime/service/PublicCheckRuntimeService.java:86,104-105,126-127,142-143,203-208` · **lane**: be-community-misc · **cat**: validation
- **이유**: V8 마이그레이션에서 submitted_name은 varchar(100), assignment_link는 varchar(1000)으로 확인된다. 서비스는 getSubmittedIdentity/normalizeNullable에서 trim만 하고 최대 길이를 제한하지 않는다(normalizeNullable line 233은 trim/blank만 처리). 100자 초과 이름이나 1000자 초과 링크를 보내면 insertSubmission에서 PostgreSQL value-too-long 오류가 raw로 올라와 400이 아닌 500이 된다. 또한 미인증(unmatched) 경로(line 102-105)에서도 사용자 입력 이름이 그대로 저장된다.
- **수정**: name은 100자, assignmentLink는 1000자 상한을 서비스에서 검증해 초과 시 400(INVALID_REQUEST)을 반환한다. assignmentLink는 http/https URL 형식 검증 권장.

### 동명이인 멤버 매칭이 임의의 한 명에게 귀속됨

- **위치**: `apps/backend/src/main/java/world/yeon/backend/sheet_integrations/repository/SheetIntegrationRepository.java:105-118` · **lane**: be-members-spaces · **cat**: correctness
- **이유**: findMemberInternalIdByName은 space_id+name으로 정렬 기준 없이 limit 1 조회한다(라인 106-112). 같은 스페이스에 동명이인이 있으면 임의의 한 명에게 시트 활동 로그가 잘못 매칭된다. members.name에 유니크 제약도 없다.
- **수정**: 매칭 정책을 명확히 한다(예: 이메일/전화 보조키 병행, 다건이면 에러로 보고). 최소한 정렬 기준을 명시하고 다건일 때 errors로 카운트한다.

### parseRecordedAt가 날짜만 있는 셀(YYYY-MM-DD)을 처리하지 못해 정상 행이 errors 처리됨

- **위치**: `apps/backend/src/main/java/world/yeon/backend/sheet_integrations/service/SheetIntegrationService.java:261-267` · **lane**: be-members-spaces · **cat**: correctness
- **이유**: parseRecordedAt는 OffsetDateTime.parse 후 Instant.parse만 시도한다(라인 263, 266). 구글 시트에서 흔한 'YYYY-MM-DD' 또는 'YYYY-MM-DD HH:mm' 같은 오프셋 없는 표기는 둘 다 실패해 호출부 catch(라인 109-111)에서 errors++ 처리되어 동기화가 조용히 누락된다.
- **수정**: LocalDate/LocalDateTime 파서를 추가하고(시간 없으면 자정·기본 타임존 적용), 지원 포맷을 명시한다. 컬럼 매핑 문서와 일치시킨다.

### 존재하지 않는 시스템 탭에 대해 findSystemTabId가 예외 유발

- **위치**: `apps/backend/src/main/java/world/yeon/backend/space_templates/write/service/SpaceTemplateWriteService.java:167-171` · **lane**: be-members-spaces · **cat**: correctness
- **이유**: applyTemplateToSpace에서 system 탭 처리 시 findSystemTabId(spaceInternalId, systemKey)를 호출하는데(라인 169), repository 구현은 .query(Long.class).single()(SpaceTemplateApplyRepository 라인 90-91)이라 결과가 0건이면 EmptyResultDataAccessException을 던진다. ensureSystemTabs가 선행 삽입하지만 systemKey가 비표준이거나 동시성 상황에서 누락되면 트랜잭션 전체가 500으로 실패한다.
- **수정**: findSystemTabId를 optional()로 바꾸고 null이면 명시적 도메인 예외(혹은 ensureSystemTab 재시도)로 처리한다.

### 필드 reorder가 항목마다 UPDATE — N+1 + 소유권/존재 검증 없음

- **위치**: `apps/backend/src/main/java/world/yeon/backend/member_fields/reorder/service/MemberFieldReorderService.java:21-33` · **lane**: be-members-spaces · **cat**: n+1
- **이유**: reorderFields는 order 리스트 크기만큼 updateDisplayOrder를 개별 호출한다(라인 28-30, N개 UPDATE). 또한 findSpaceInternalId가 created_by_user_id 없이 public_id로만 조회되어(라인 23) 소유권 검증이 없고, 잘못된 fieldPublicId가 섞여도 0건 업데이트를 조용히 무시한다.
- **수정**: 단일 쿼리(VALUES 리스트 + CASE 또는 unnest 조인)로 일괄 업데이트하고, 소유권 검증과 영향 행 수 검증을 추가한다.

### bulkUpsert가 값마다 개별 upsert — N+1 쓰기

- **위치**: `apps/backend/src/main/java/world/yeon/backend/member_field_values/write/service/MemberFieldValueWriteService.java:63-81` · **lane**: be-members-spaces · **cat**: n+1
- **이유**: request.values()를 순회하며 repository.upsertValue를 1건씩 호출한다(라인 63-81). 시트 임포트(SheetExportImportMutationService)는 멤버마다 bulkUpsert를 또 호출하므로(라인 103), 멤버 수 x 필드 수 만큼 개별 INSERT가 누적된다. 대량 임포트 시 성능 저하.
- **수정**: 여러 값에 대한 batch upsert(다중 VALUES + ON CONFLICT) 또는 JDBC batchUpdate로 묶는다.

### members 이름 조회용 인덱스 부재로 시트 동기화/조회 풀스캔

- **위치**: `apps/backend/src/main/resources/db/migration/V8__ensure_legacy_web_public_schema.sql:1261` · **lane**: be-members-spaces · **cat**: db-index
- **이유**: members에는 members_space_created_at_idx(space_id, created_at)만 있고(라인 1261) (space_id, name) 인덱스가 없다. SheetIntegrationRepository.findMemberInternalIdByName이 space_id+name으로 조회하므로 멤버 수가 많은 스페이스에서 매 행 조회가 비효율적이다.
- **수정**: CREATE INDEX members_space_name_idx ON members(space_id, name) 추가(또는 동기화를 일괄 맵 조회로 변경).

### 토큰 교환 실패 시 제공자(raw) 응답 본문을 클라이언트 에러 메시지에 그대로 노출한다

- **위치**: `apps/backend/src/main/java/world/yeon/backend/googledrive_oauth/service/GoogleDriveOAuthService.java:59` · **lane**: be-oauth-drive · **cat**: security
- **이유**: line 59에서 GOOGLE_OAUTH_EXCHANGE_FAILED 예외 메시지에 response.body()를 직접 붙인다. GoogleDriveOAuthController line 37의 ExceptionHandler가 error.getMessage()를 ErrorResponse.message로 그대로 직렬화해 클라이언트까지 전파함을 확인했다. Google 토큰 엔드포인트 오류 본문에 진단/설정 정보가 노출될 수 있다. OneDriveOAuthService line 53도 동일.
- **수정**: 외부 응답 본문은 서버 로그에만 남기고(민감정보 마스킹), 클라이언트에는 고정된 일반 메시지("토큰 교환에 실패했습니다")만 반환한다.

### Google Drive 파일 목록 query에 folderId를 검증 없이 문자열로 삽입해 Drive query 인젝션이 가능하다

- **위치**: `apps/backend/src/main/java/world/yeon/backend/googledrive_browser/service/GoogleDriveBrowserService.java:53-55` · **lane**: be-oauth-drive · **cat**: validation
- **이유**: line 53에서 "'" + folderId + "' in parents" 형태로 folderId를 작은따옴표 사이에 그대로 끼워 넣고 line 54-55에서 q를 만든다. folderId 형식 검증이 전혀 없어, 작은따옴표나 " and ", "trashed=true" 등 Drive query 연산자 주입으로 trashed 필터 우회 등 검색 조건 조작이 가능하다.
- **수정**: folderId를 Google Drive ID 패턴(영숫자/-/\_ 등)으로 화이트리스트 정규식 검증하거나, 검증 실패 시 400을 반환한다. 최소한 작은따옴표 등 메타문자를 거부한다.

### OneDrive 스코프가 읽기 전용 브라우징에 비해 과다하다(Files.ReadWrite.All)

- **위치**: `apps/backend/src/main/java/world/yeon/backend/onedrive_oauth/service/OneDriveOAuthService.java:20` · **lane**: be-oauth-drive · **cat**: security
- **이유**: OneDriveBrowserService는 파일 목록 조회(listFiles)와 다운로드(downloadFile, 읽기)만 수행함을 확인했다. 그런데 OAuth 스코프(line 20)와 Browser SCOPES(line 27) 모두 Files.ReadWrite.All을 요청한다. 최소권한 원칙 위배로 토큰 유출 시 전체 OneDrive 파일 수정/삭제 권한이 노출된다.
- **수정**: 실제 필요한 권한으로 축소한다. 읽기만 필요하면 Files.Read.All(또는 Files.Read), offline_access, User.Read로 제한한다. OneDriveBrowserService.SCOPES(line 27)도 동일하게 맞춘다.

### 토큰 upsert가 UPDATE 후 INSERT 분리 패턴이라 동시 콜백 시 unique 제약 위반 경합이 발생한다

- **위치**: `apps/backend/src/main/java/world/yeon/backend/googledrive_oauth/repository/GoogleDriveOAuthRepository.java:31-62` · **lane**: be-oauth-drive · **cat**: race-condition
- **이유**: upsertTokens는 먼저 UPDATE를 실행하고(line 32-47) updated==0이면 INSERT한다(line 48-61). V8 마이그레이션 line 1108에 googledrive_tokens_user_id_unique 제약이 존재함을 확인했다. 같은 user가 동시에 두 번 콜백을 보내면 둘 다 UPDATE 0건→둘 다 INSERT 시도→하나가 unique violation으로 실패한다. ON CONFLICT 미사용으로 원자적 upsert가 아니다(OneDriveOAuthRepository line 18-47도 동일, onedrive_tokens_user_id_unique는 line 1156).
- **수정**: INSERT ... ON CONFLICT (user_id) DO UPDATE SET ... 단일 쿼리로 원자적 upsert를 구현한다. 또는 DataIntegrityViolation을 잡아 재시도/UPDATE로 폴백한다.

### tokeninfo 호출 시 access_token을 URL 쿼리스트링으로 전달해 로그 노출 위험이 있다

- **위치**: `apps/backend/src/main/java/world/yeon/backend/googledrive_browser/service/GoogleDriveBrowserService.java:91` · **lane**: be-oauth-drive · **cat**: security
- **이유**: line 91의 hasGoogleSheetsAccess가 TOKEN_INFO_URL + "?access_token=" + url(accessToken) 형태로 액세스 토큰을 URL 쿼리 파라미터에 담아 GET 요청한다. URL은 프록시/액세스 로그/모니터링에 평문 기록될 수 있어 토큰 누출 경로가 된다.
- **수정**: tokeninfo 대신 Authorization: Bearer 헤더로 권한을 확인하거나, 스코프 검증을 토큰 교환 시 저장해 둔 granted scope로 처리한다. 부득이 tokeninfo를 쓰면 헤더 방식 엔드포인트를 사용한다.

### /counseling-records/details, trend-source 요청 recordIds null 시 NPE(500) — 입력 검증 누락

- **위치**: `apps/backend/src/main/java/world/yeon/backend/counseling_record_details/service/CounselingRecordDetailService.java:getDetails 45~46 / getTrendSources 91~92 / repository.findOwnedRecords 67~70` · **lane**: be-counseling-frozen · **cat**: [frozen] validation
- **이유**: CounselingRecordDetailsRequest/CounselingRecordTrendSourcesRequest는 둘 다 record(List<String> recordIds)뿐이며 검증 애너테이션이 전혀 없다. 컨트롤러(CounselingRecordDetailController 34, 42행)는 request.recordIds()를 그대로 서비스에 전달한다. 본문이 {} 이면 recordIds가 null이 되어, getDetails→findOwnedRecords(userId, null)의 recordPublicIds.isEmpty()(repository 68행)에서 NPE; getTrendSources는 recordPublicIds.stream().limit(5)(service 92행)에서 NPE. 컨트롤러 ExceptionHandler에는 CounselingRecordDetailServiceException과 IllegalArgumentException만 있어(53~61행) NPE는 핸들러 없이 500 Internal Server Error로 떨어진다. 사용자 입력으로 손쉽게 500을 유발할 수 있다.
- **수정**: getDetails/getTrendSources 진입부에서 recordIds null/empty를 명시 검증해 400(IllegalArgumentException 또는 ServiceException)으로 응답한다. 추가로 IN 절 크기 상한(예: 200개)도 함께 둔다.

### 비동기 전사가 공용 ForkJoinPool에서 fire-and-forget — 서버 재시작 시 record가 'processing'에 영구 정체

- **위치**: `apps/backend/src/main/java/world/yeon/backend/counseling_record_transcription/service/CounselingRecordTranscriptionService.java:queueTranscription 64~66, runTranscription 87~122` · **lane**: be-counseling-frozen · **cat**: [frozen] reliability
- **이유**: queueTranscription(64~66)은 CompletableFuture.runAsync(...)에 executor를 지정하지 않아 공용 ForkJoinPool.commonPool에서 실행되며, runTranscription은 그 안에서 OpenAI HTTP 호출(httpClient.send, 동기 블로킹)과 다중 DB 트랜잭션(updateProcessing/persistTranscript/markError)을 수행한다. (1) 블로킹 작업이 공용 풀을 점유해 다른 parallelStream/CompletableFuture 작업을 굶길 수 있고, (2) 작업 중 인스턴스가 재배포/재시작되면 'processing'/'queued' 상태가 된 record의 비동기 전사가 유실된다. 코드베이스 counseling 영역에 @Scheduled/@Async 기반 stuck 레코드 복구 잡이 전혀 없음을 확인했다(grep 결과 없음). 영구 정체 상태를 만들 수 있다.
- **수정**: 전용 bounded 스레드풀(또는 @Async + TaskExecutor)을 사용하고, 시작 시 stuck 'processing' record를 회수하는 스케줄 복구(예: updated_at 기준 타임아웃 → 'error' 또는 재큐잉)나 메시지 큐 기반 처리로 전환한다. 동결 영역이면 최소한 stuck 레코드 복구 잡만이라도 둔다.

### /counseling-records 목록 limit 상한 없음 — 대량 조회 허용

- **위치**: `apps/backend/src/main/java/world/yeon/backend/counseling_record_list/repository/CounselingRecordListRepository.java:listRecords 118~119 (limit != null 일 때 query.setMaxResults(limit))` · **lane**: be-counseling-frozen · **cat**: [frozen] perf
- **이유**: 컨트롤러 @RequestParam limit(CounselingRecordListController 25행)이 서비스(38행)를 거쳐 repository로 그대로 전달되고 118~119행에서 상한 없이 setMaxResults(limit)된다. 클라이언트가 limit=1000000을 주면 해당 유저의 모든 counseling_records를 transcript_text(text 컬럼, select 77행 포함)까지 한 번에 로딩한다. 결과 셋 크기가 무제한이라 메모리/대역폭 폭증 가능. 비교 대상인 member_counseling_records/repository/MemberCounselingRecordRepository.java 90행은 setMaxResults(limit == null ? 100 : limit)로 limit==null만 100으로 캡하고 지정 시에는 동일하게 무제한임을 확인했다.
- **수정**: 두 목록 모두 limit을 안전한 상한(예: clamp 1~100)으로 보정한다. limit==null이면 기본값, 지정 시 Math.min(limit, MAX)로 캡.

### card_rooms.owner_user_id에 FK 부재 — 같은 도메인 card_decks와 비대칭, 소유자 무결성 미보장

- **위치**: `apps/backend/src/main/resources/db/migration/V6__create_public_card_rooms_tables.sql:7, 61-105` · **lane**: db-migrations · **cat**: db-index
- **이유**: card_rooms.owner_user_id(uuid, line 7)에 public.users FK가 없다(V6 전체에 owner_user_id 관련 FK 정의 없음). 반면 같은 식별자 도메인의 card_decks(V4:86-90)는 card_decks_owner_user_id_users_id_fk로 public.users(id) FK를 건다. 그 결과 소유 사용자가 삭제돼도 card_rooms는 dangling owner_user_id를 갖게 되어 무결성 보장이 도메인 내에서 일관되지 않는다.
- **수정**: owner_user_id에 public.users(id) FK(ON DELETE set null 등) 추가. 소유자 기준 방 조회가 있으면 (owner_user_id) where owner_user_id is not null 부분 인덱스도 추가.

### chat-service OTP 응답의 expiresAt가 서버 기본 타임존 offset으로 직렬화되어 zod .datetime()를 실패시킬 수 있음

- **위치**: `apps/backend/src/main/java/world/yeon/backend/chat_service_auth/service/ChatServiceAuthService.java:27,56` · **lane**: contract-drift · **cat**: contract-drift
- **이유**: 검증 완료(단, severity는 high→medium로 하향). requestOtp(L27)·verifyOtp(L56)는 OffsetDateTime.now()(시스템 기본 존)로 만든 expiresAt를 DB 왕복 없이 그대로 응답에 싣는다(L31,L58). zod 4.3.6에서 z.string().datetime()은 +09:00 같은 offset을 REJECT함을 직접 확인했고(Z/오프셋없음만 허용), 모바일 api-client index.ts:657,669는 schema.parse로 strict 검증한다. 다만 prod Dockerfile은 eclipse-temurin alpine + TZ 미설정으로 JVM 기본 존이 UTC라 prod에서는 Z로 나가 깨지지 않을 가능성이 높다. 그래도 application.yml/Dockerfile 어디에도 user.timezone=UTC 강제가 없어 비-UTC JVM(로컬 dev KST, 오설정 배포)에서는 +09:00로 직렬화돼 OTP/로그인 전체가 ZodError로 깨진다. card_rooms가 일관되게 ZoneOffset.UTC를 쓰는 것과 대비되는 실제 드리프트다.
- **수정**: expiresAt 생성을 OffsetDateTime.now(ZoneOffset.UTC)로 바꾸거나 직렬화 직전 .withOffsetSameInstant(ZoneOffset.UTC)로 정규화. JVM/컨테이너 TZ=UTC 고정 병행 권장. card_rooms와 UTC 정규화 패턴 통일.

### chat-service 날짜 필드가 JDBC OffsetDateTime을 UTC로 정규화하지 않고 통과시킴

- **위치**: `apps/backend/src/main/java/world/yeon/backend/chat_service_feed/repository/ChatServiceFeedRepository.java:169-173` · **lane**: contract-drift · **cat**: contract-drift
- **이유**: 검증 완료. asOffsetDateTime(L169-173)은 Timestamp 분기는 atOffset(ZoneOffset.UTC)로 정규화하지만 'value instanceof OffsetDateTime이면 그대로 반환'(L171). 동일 패턴이 chat_service_ask/repository:152-155, chat_service_chat_rooms/repository:192-195, chat_service_auth/repository:143-146에도 존재(확인). PostgreSQL JDBC가 timestamptz를 세션 타임존 offset 붙은 OffsetDateTime으로 돌려줄 수 있어, 비-UTC면 createdAt/lastMessageAt/expiresAt가 +09:00로 직렬화된다. zod 4.3.6 .datetime()이 offset을 REJECT함은 직접 확인. card_rooms 리포지토리가 항상 UTC로 정규화하는 것과 달리 OffsetDateTime 분기만 정규화 누락된 것이 드리프트 원인이다.
- **수정**: asOffsetDateTime의 OffsetDateTime 분기를 o.withOffsetSameInstant(ZoneOffset.UTC)로 바꿔 항상 UTC로 정규화. 4개 chat_service 리포지토리에 동일 적용.

### connecting/disconnected 상태가 stale state로 가려져 무한 로딩·재연결 UX 부재

- **위치**: `apps/mobile/src/features/card-service/rooms/card-room-screen.tsx:83-97` · **lane**: fe-card-rooms · **cat**: error-handling
- **이유**: 렌더 분기는 joinError(75) → connectionState===error(83) → !state(91) → 정상 순서다. onLeave로 connectionState가 'disconnected'가 되어도(use-card-room-connection.ts:77-79) 이전 state가 남아 있으면 정상 연결처럼 화면이 그대로 보이고, disconnected는 어떤 분기에서도 사용되지 않아 끊김 표시나 재연결 수단이 없다. connecting도 별도 처리가 없어 첫 연결 지연 시 !state 로딩만 보인다. room.reconnect 호출이 코드 어디에도 없다.
- **수정**: connectionState==='disconnected'일 때 재연결 배너/버튼 노출. onLeave에서 정상 종료와 비정상 끊김을 구분해 재연결 시도. 최소한 disconnected 상태를 사용자에게 알리는 UI 추가.

### ws-shim이 모듈 로드 시점 global.WebSocket을 캡처 — 폴리필 등록 순서 의존

- **위치**: `apps/mobile/ws-shim.js:3-7` · **lane**: fe-card-rooms · **cat**: correctness
- **이유**: const RNWebSocket = global.WebSocket를 모듈 평가 시점에 1회 캡처한다(3). ws-shim이 RN 전역 WebSocket 폴리필 설치보다 먼저 평가되면 RNWebSocket이 undefined로 고정되어 colyseus가 'ws is not a constructor' 류로 영구 실패한다. 번들 순서에 따라 간헐 발생하는 취약점.
- **수정**: getter로 늦은 평가를 하거나 module.exports를 function(...args){ return new global.WebSocket(...args); } 래퍼로 만들어 호출 시점에 global.WebSocket을 참조. 최소한 평가 시 global.WebSocket 존재를 단언.

### colyseus seat reservation 호환 패치(ensureYeonRealtimeSeatReservationCompat)가 모바일에서 미적용

- **위치**: `apps/mobile/src/features/card-service/rooms/use-card-room-connection.ts:56-61` · **lane**: fe-card-rooms · **cat**: contract-drift
- **이유**: ensureYeonRealtimeSeatReservationCompat는 Client.prototype.consumeSeatReservation을 전역 패치(packages/ui/.../shared.ts:30)하며 웹 typing use-race-room.ts:205에서만 호출된다(grep으로 소스 전역 확인). 모바일 카드방 연결 훅은 joinOrCreate 전에 이를 호출하지 않으며 모바일 어디에서도 호출되지 않는다. 패치는 전역 프로토타입에 1회만 적용되므로, 모바일에서 typing 연결을 먼저 거치지 않으면 race-server가 레거시 seat reservation 형태(response.room 없이 name/roomId)로 응답할 때 consumeSeatReservation 단계에서 입장이 실패한다(웹 카드방은 typing 경로가 패치를 먼저 적용해 우연히 동작).
- **수정**: use-card-room-connection effect 시작부 또는 모듈 init에서 ensureYeonRealtimeSeatReservationCompat()를 1회 호출해 웹/모바일이 동일 보정을 거치도록 일관화.

### CardMarkdown이 임의 이미지 src를 신뢰해 그대로 렌더(임의 외부/ data: src)

- **위치**: `apps/mobile/src/features/card-service/card-markdown.tsx:10-30` · **lane**: fe-markdown · **cat**: security
- **이유**: resolveImageSrc는 http(s)·data:·절대경로(/)를 모두 통과시키고, 절대경로는 getMobileApiBaseUrl()로 무조건 prefix를 붙인다. 마크다운 본문은 사용자/게스트가 자유롭게 입력하므로(![](임의URL)), 신뢰되지 않은 외부 URL이나 거대한 data: URI가 그대로 source uri로 들어간다. 호스트 allowlist가 없어 임의 도메인 이미지가 앱 내에서 로드되고(트래킹 픽셀으로 IP·접속 시각 수집), data: 대용량 base64는 메모리 폭증·렌더 정지를 유발할 수 있다.
- **수정**: 이미지 src를 신뢰 호스트 allowlist(자체 자산 도메인) 또는 내부 /api 상대경로로 제한하고, 그 외 출처는 렌더하지 않거나 플레이스홀더로 대체한다. data: URI는 길이 상한을 두거나 차단한다.

### 이미지 업로드 성공 후 maxLength 초과 시 commit이 조용히 드롭 — 사용자는 첨부 실패를 인지 못함

- **위치**: `apps/mobile/src/features/card-service/markdown-text-field.tsx:180-186, 221` · **lane**: fe-markdown · **cat**: correctness
- **이유**: commit()은 result.value.length > maxLength이면 onChangeText/setSelection 없이 즉시 return한다. handleInsertImage는 업로드를 끝낸 뒤 insertAtCursor로 \n![](url)\n을 더하는데, 현재 본문이 maxLength에 가까우면 삽입 후 길이가 초과되어 commit이 무음 실패한다. 업로드는 이미 서버에 일어났고(고아 자산 생성), 사용자에게는 아무 변화도 에러도 없어 '첨부했는데 안 들어감'으로 보인다.
- **수정**: commit이 초과로 거부될 때 showYeonAlert로 안내를 띄우고, 가능하면 이미지 마크다운은 maxLength 계산에서 제외하거나 별도 첨부 모델로 분리한다. 업로드는 길이 여유 확인 후 수행한다.

### 컨트롤드 selection prop이 onChangeText와 동기화되지 않아 입력 중 커서 점프 위험

- **위치**: `apps/mobile/src/features/card-service/markdown-text-field.tsx:177, 252-255` · **lane**: fe-markdown · **cat**: race-condition
- **이유**: TextField에 selection={selection}를 완전 컨트롤드로 넘기면서, 일반 타이핑은 onChangeText(부모 value 갱신)로만 value를 갱신하고 selection 상태는 onSelectionChange에만 의존한다. RN(특히 Android)에서 value와 controlled selection이 한 프레임이라도 어긋나면 커서가 끝/이전 위치로 튀는 알려진 문제가 있다. IME 조합 입력 중 onSelectionChange/onChangeText 순서가 엇갈리면 조합이 깨지거나 커서가 되돌아갈 수 있다.
- **수정**: 평상시에는 selection을 비제어로 두고, 툴바 삽입 직후에만 일시적으로 제어한 뒤 다음 onSelectionChange에서 해제하는 패턴으로 전환하거나, onChangeText에서 value 변경 시 selection도 함께 계산해 항상 동기 갱신한다.

### toolbar applyFormat/insertAtCursor가 stale closure value·selection을 사용 — 연속/비동기 조작 시 잘못된 위치 삽입·데이터 손실

- **위치**: `apps/mobile/src/features/card-service/markdown-text-field.tsx:188-229` · **lane**: fe-markdown · **cat**: correctness
- **이유**: handleAction/handleInsertImage는 클로저로 캡처된 value와 selection을 읽어 applyFormat/insertAtCursor에 넘긴다. handleInsertImage는 await(권한·picker·업로드) 동안 사용자가 본문을 더 타이핑하거나 커서를 옮길 수 있는데, 이후 commit(insertAtCursor(value, selection, ...))은 await 이전에 캡처된 옛 value/selection을 사용한다. 그 결과 최신 입력이 덮어써지거나(데이터 손실) 엉뚱한 오프셋에 이미지가 삽입된다.
- **수정**: 비동기 작업 후 삽입할 때는 onChangeText를 함수형 업데이트로 바꾸거나 최신 value/selection을 ref로 읽어 삽입 오프셋을 재계산한다. 업로드 동안 입력을 잠그는 것도 한 방법.

### 모바일이 소셜 로그인 응답의 expiresAt(세션 만료)을 완전히 무시한다

- **위치**: `apps/mobile/src/features/card-service/social-login.ts:63-72` · **lane**: fe-gate-auth · **cat**: correctness
- **이유**: 웹 콜백 handlers.ts(completeSocialAuth, 250-260행)는 딥링크로 token과 함께 expiresAt(ISO)을 돌려준다. 그러나 social-login.ts는 parsed.queryParams?.token만 읽고 expiresAt은 파싱·저장하지 않는다. writePrimaryAuthSessionToken도 토큰만 저장(primary-auth/storage.ts). 결과적으로 앱은 세션 만료 시각을 전혀 알지 못해 만료를 선제적으로 감지하지 못하고, 매 부팅 resolveCardServiceSession의 getAuthSession 401 왕복에만 의존한다. 만료된 토큰으로 booting 단계에서 불필요한 네트워크 실패/지연이 발생하고, 만료 임박 시 UX 경고/재로그인 유도가 불가능하다.
- **수정**: expiresAt도 firstQueryValue로 파싱해 MobileSocialLoginResult.success에 포함시키고, 토큰과 함께 SecureStore에 만료 시각을 저장하라. resolveCardServiceSession/boot에서 저장된 expiresAt이 현재 시각 이전이면 서버 호출 전에 토큰을 즉시 폐기하고 게스트로 전이하라.

### 모바일이 딥링크 콜백 URL의 scheme/host/path를 검증하지 않고 token 쿼리만 신뢰한다

- **위치**: `apps/mobile/src/features/card-service/social-login.ts:49-72` · **lane**: fe-gate-auth · **cat**: security
- **이유**: openAuthSessionAsync(startUrl, returnUrl) 성공 시 result.url을 Linking.parse만 하고, 반환 URL이 요청한 returnUrl(Linking.createURL("auth/social"))의 scheme/host/path와 일치하는지 전혀 확인하지 않는다. ASWebAuthenticationSession이 일부 보호를 주지만, 같은 앱 scheme을 가로채는 다른 경로(예: 다른 host/path로 떨어진 딥링크)나 콜백 URL 조작 상황에서 token 쿼리값을 그대로 신뢰해 writePrimaryAuthSessionToken으로 저장한다. 토큰 유효성은 서버 state 바인딩에 의존하지만, 클라이언트 측 returnUrl 매칭이 없으면 방어가 한 겹 부족하다.
- **수정**: result.url을 Linking.parse한 뒤 hostname/path가 요청한 returnUrl과 일치하는지 검증하고 불일치 시 error로 반환하라. 또한 token을 받은 직후 getAuthSession으로 서버에 즉시 검증(authenticated 확인)한 후에만 저장/전이하라.

### 세션 토큰이 딥링크 쿼리스트링으로 평문 전달되어 로그/히스토리에 노출될 수 있다

- **위치**: `apps/web/src/server/auth/handlers.ts:68-81, 250-260` · **lane**: fe-gate-auth · **cat**: security
- **이유**: completeSocialAuth는 성공 시 buildMobileReturnLocation으로 url.searchParams.set("token", session.sessionToken)을 호출해 세션 토큰을 딥링크 쿼리스트링에 실어 302 Location 헤더로 반환한다. 쿼리스트링의 토큰은 ASWebAuthenticationSession 내부 로그, 프록시/리버스프록시 액세스 로그, 크래시 리포트, OS 딥링크 라우팅 로그 등에 평문으로 남을 수 있다. fragment(#) 대비 노출면이 넓다.
- **수정**: 토큰을 쿼리스트링 대신 URL fragment(#token=...)로 전달하거나, 일회용 단명 코드(one-time exchange code)를 딥링크로 주고 앱이 별도 POST로 토큰을 교환하도록 변경하라. 최소한 토큰이 들어간 Location은 로깅 대상에서 제외하라.

### 네이티브에서 SecureStore 미가용 시 토큰이 in-memory Map으로 폴백되어 영속 실패(조용한 로그아웃)

- **위치**: `apps/mobile/src/services/primary-auth/storage.ts:33-57` · **lane**: fe-gate-auth · **cat**: error-handling
- **이유**: writePrimaryAuthSessionToken은 getYeonSecureStorage()가 null이면(native에서 canUseYeonSecureStorage 실패 시) getYeonOptionalLocalStorage()도 native에서 항상 null(YeonBrowserRuntime/index.native.ts 127-130)이라 결국 inMemoryStorage.set으로 떨어진다. 이 경우 토큰은 프로세스 메모리에만 남아 앱 재시작 시 readPrimaryAuthSessionToken이 null을 반환→resolveCardServiceSession이 게스트로 전이→사용자는 영문 모를 자동 로그아웃을 겪는다. 또한 setItemAsync가 throw하면 try/catch가 없어 handleSocialLogin/onSuccess 경로에서 예외가 그대로 전파된다.
- **수정**: SecureStore setItemAsync를 try/catch로 감싸고, 영속 저장 실패 시 사용자에게 '안전 저장소 사용 불가' 안내를 노출하거나 로그인 자체를 실패 처리하라. 무음 in-memory 폴백은 보안·UX 모두 위험하므로 native에서는 폴백을 허용하지 않거나 명시적 경고를 남겨라.

### 웹 빌드 경로에서 세션 토큰이 localStorage에 저장되어 XSS로 탈취 가능

- **위치**: `apps/mobile/src/services/primary-auth/storage.ts:44-53` · **lane**: fe-gate-auth · **cat**: security
- **이유**: isYeonWebPlatform()이 true인 웹 빌드(Expo web)에서는 getYeonSecureStorage()가 null을 반환(YeonSecureStorage/index.ts)하고, getYeonOptionalLocalStorage()가 globalThis.localStorage를 반환하므로 세션 토큰이 localStorage에 평문 저장된다. localStorage는 동일 출처의 어떤 JS(서드파티 스크립트, XSS)도 읽을 수 있어 Bearer 세션 토큰 탈취 위험이 크다. 같은 토큰이 Authorization: Bearer로 모든 카드 서비스 API에 쓰인다(api-client createAuthSessionHeaders).
- **수정**: 웹 경로에서는 세션 토큰을 localStorage 대신 HttpOnly 쿠키(서버 set) 기반으로 전환하라. 불가피하면 최소한 sessionStorage 사용 및 토큰 수명 단축, CSP 강화로 위험을 낮춰라.

### normalizeMobileReturnUrl이 허용 scheme의 host/path/query를 제약하지 않아 토큰이 임의 경로로 전달됨

- **위치**: `apps/web/src/server/auth/constants.ts:71-103` · **lane**: fe-gate-auth · **cat**: security
- **이유**: PRODUCTION_MOBILE_RETURN_PROTOCOLS에 포함된 scheme이면 protocol만 보고 trimmed 전체를 그대로 통과시킨다. 즉 yeon-card-service://attacker.example/steal?x=1 처럼 host/path/query가 임의여도 허용되고, handlers.ts buildMobileReturnLocation이 그 URL에 token을 붙여 반환한다. 동일 scheme을 등록한 악성 앱이 설치된 기기에서는 host/path 무관하게 딥링크를 가로챌 수 있어 토큰 탈취 위험이 있다. 또한 startMobileSocialLogin이 보내는 정상 returnUrl은 host 없는 path(auth/social)인데, 검증은 그 모양을 강제하지 않는다.
- **수정**: scheme뿐 아니라 host/path도 화이트리스트(예: host 없음 + pathname === '/auth/social' 또는 알려진 host)로 고정 검증하라. 쿼리/프래그먼트가 미리 채워진 returnUrl은 거부하라.

### resolveYeonNativeRoute 가 소스에서 한 번도 사용되지 않는 죽은 헬퍼(모바일은 템플릿을 as Href로 직접 사용)

- **위치**: `packages/ui/src/runtime/ports/routes.ts:33-41` · **lane**: fe-universal-ui · **cat**: dead-code
- **이유**: grep 결과 resolveYeonNativeRoute는 정의(routes.ts:33)만 있고 호출처가 0건이다. 모바일 화면들은 YEON_ROUTE_TEMPLATES.cardDeckDetail/cardDeckPlay/cardHome/cardRoomDetail 를 직접 읽어 expo Href로 캐스팅(`as Href`)해 쓴다(card-deck-list:55/62, card-deck-detail:42/68, card-deck-play:44, rooms/card-room-lobby:36). 의도된 변환 헬퍼가 우회되어 죽어 있다.
- **수정**: 모바일 화면이 resolveYeonNativeRoute(name, params)를 통해 {pathname, params}를 얻도록 바꾸거나(권장 — params 치환/일관성 확보), 사용하지 않을 거면 헬퍼를 제거한다. `as Href` 직접 캐스팅은 템플릿 문자열 drift를 타입검사에서 못 잡으므로 지양.

### 같은 플랫폼(mobile) 두 카드 어댑터가 세션 입력 형태를 서로 다르게 받아 표현 drift

- **위치**: `apps/mobile/src/features/card-service/runtime-adapters/card-item-repository.ts:30-41` · **lane**: fe-universal-ui · **cat**: contract-drift
- **이유**: createMobileCardItemRepository는 세션을 {mode:CardServiceMode, sessionToken}로 받고(line 30-41), createMobileCardDeckRepository(card-deck-repository.ts)는 {isSignedIn:boolean, sessionToken}로 받는다. 둘 다 '인증 스코프 → 토큰 사용 여부' 동일 개념인데 입력 표현이 boolean vs mode enum 으로 갈려 있어, 한 도메인 한 플랫폼 안에서 session-port 대용 표현이 통일되지 않아 호출부가 화면마다 다른 형태를 만들어 넘긴다. 누락/오변환 위험.
- **수정**: 두 어댑터의 세션 입력을 한 타입(예: {isAuthenticated:boolean, sessionToken:string|null} 또는 {mode, sessionToken} 중 하나)으로 통일한다. 레지스트리 session-port가 isAuthenticated로 이름 통일을 못박았으므로 boolean isAuthenticated 형태가 일관적.

### SSOT 재수출 어댑터의 detail 키 호출 시그니처가 web↔mobile 반대(인자 순서 drift)

- **위치**: `apps/mobile/src/services/card-service/query-keys.ts:7-11` · **lane**: fe-universal-ui · **cat**: contract-drift
- **이유**: web card-service-query-keys.ts:8 은 deckDetail: cardDeckQueryKeys.detail 을 그대로 노출해 호출부가 (isAuthenticated, deckId) 순서로 부른다. mobile(query-keys.ts:9-10)은 deck:(deckId, isSignedIn)=>cardDeckQueryKeys.detail(isSignedIn, deckId) 로 인자 순서를 뒤집어 노출한다. 최종 배열은 같지만 두 앱 어댑터 표면 API가 반대라, 공용 스크린으로 hoist 시 한쪽 호출 규약을 따르면 다른 쪽이 깨진다. '재수출만' 원칙이 인자 매핑에서 갈렸다.
- **수정**: 양 앱 어댑터의 키 함수 시그니처를 동일하게 맞춘다(예: 둘 다 detail(isAuthenticated, deckId) 또는 둘 다 (deckId, isAuthenticated)). 공용 스크린 도입 전에 통일해 두지 않으면 hoist 시점에 호출부 전수 수정 필요.

### Universal UI 경계 eslint가 데이터 SDK(@yeon/api-client) 직접 import를 막지 않는 구멍

- **위치**: `packages/config/eslint/universal-ui-boundary.mjs:13-101` · **lane**: fe-universal-ui · **cat**: architecture
- **이유**: 파일 상단 주석(line 4)은 '데이터 SDK'까지 직접 import 못하게 막는다고 명시하지만 restrictedPaths(13-86)/restrictedPatterns(88-101)에 @yeon/api-client나 raw fetch 클라이언트 경로가 없다. 실제로 feature 코드가 @yeon/api-client를 직접 import한다(apps/mobile/src/features/life-os/life-os-screen.tsx, apps/mobile/src/features/card-service/card-service-session.ts). '모든 접근은 포트를 거쳐야 한다'는 규칙이 데이터 접근 축에서 강제되지 않아 silent drift 통로가 열려 있다.
- **수정**: feature/screen 글롭에서 @yeon/api-client 직접 import를 restrictedPaths에 추가하고, 데이터 접근은 repository 포트(YeonCardDeckRepository/YeonCardItemRepository)나 명시적 services 어댑터로만 가게 한다. ApiClientError 같은 타입만 필요하면 ui 경계에서 재수출해 노출.

### card-deck 이미지 업로드 BFF가 비인증 — 익명 R2 저장소 남용 가능

- **위치**: `apps/web/src/app/api/v1/card-decks/assets/route.ts:15-38` · **lane**: x-security · **cat**: security
- **이유**: POST 핸들러(line 15-38)에 requireAuthenticatedUser/게스트 식별 등 어떤 인증도 없고 rate limit도 없다. 누구나 이미지를 R2 버킷에 적재할 수 있다. 백엔드(CardDeckAssetService)가 MIME 화이트리스트·5MB·랜덤 키로 일부 완화하나, 비인증 대량 업로드로 스토리지 비용/용량을 소진시키는 abuse가 가능하다.
- **수정**: 업로드 라우트에 인증(또는 최소한 게스트 세션) 검증과 사용자별 rate limit을 추가한다. 비로그인 업로드가 의도라면 일일 용량/요청 상한을 둔다.

### credential 로그인 IP rate limit이 스푸핑 가능한 X-Forwarded-For 첫 값에 의존

- **위치**: `apps/web/src/server/auth/credentials/route-helpers.ts:30-46` · **lane**: x-security · **cat**: security
- **이유**: getClientIp(line 30-46)가 X-Forwarded-For의 '첫 번째' 값(line 33-38)을 그대로 신뢰한다. 이 헤더는 클라이언트가 임의로 설정 가능하고, 이 값이 login route(api/auth/credentials/login/route.ts line 33)에서 백엔드 IP_LOGIN_LIMIT_PER_MINUTE(분당 30회, CredentialAuthService line 22/244)로 전달된다. 매 요청 가짜 IP를 보내면 IP 기반 제한을 우회할 수 있다. 계정 단위 잠금(이메일 기준)은 유효하나 IP 방어선은 무력화되고 분산 시도/이메일 enumeration에 취약해진다. CF-Connecting-IP 등 신뢰 헤더 사용 흔적은 grep 결과 없음.
- **수정**: 신뢰 프록시(Cloudflare/리버스 프록시) 뒤에서는 XFF의 '마지막' 신뢰 hop 또는 프록시가 주입하는 단일 신뢰 헤더(CF-Connecting-IP 등)만 사용하고, 신뢰 프록시 목록 밖의 XFF는 무시한다.

### star-lobby 게스트 리소스 권한이 클라이언트 제공 guest-session-id에만 의존

- **위치**: `apps/web/src/app/api/v1/star-lobby/_shared.ts:7-21` · **lane**: x-security · **cat**: security
- **이유**: resolveStarLobbyBffOwner(line 15-21)는 인증 사용자가 없으면 클라이언트가 보낸 x-yeon-guest-session-id 헤더/쿠키 값(resolveGuestSessionId, line 7-13)을 그대로 소유자 식별자로 사용한다. 이 값은 클라이언트가 완전히 통제하므로, 타 게스트의 session-id를 알아내면 그 게스트의 Discord 웹훅·알림 규칙을 조회/덮어쓸 수 있다. 식별자 자체가 비밀이자 권한 토큰으로 쓰이는 구조라 노출 시 즉시 탈취된다.
- **수정**: 게스트 식별자를 서명된(HMAC) 쿠키로 발급해 위조·임의 지정 불가하게 하고, 가능한 한 민감 작업(웹훅 설정)은 인증 사용자에게만 허용한다.

### 기본 탭/커스텀 필드 정의 삽입도 루프 내 단건 executeUpdate

- **위치**: `apps/backend/src/main/java/world/yeon/backend/import_commit/repository/ImportCommitRepository.java:38-82` · **lane**: x-perf · **cat**: n+1
- **이유**: insertDefaultTabs는 tabs 리스트를 for 루프로 돌며 탭 1개당 executeUpdate(L39-53)를, insertCustomFields도 필드 1개당 executeUpdate(L61-76)를 호출한다. 각 스페이스 생성 시 5개 기본 탭 + N개 커스텀 필드 INSERT가 개별 라운드트립으로 나간다. 대량 import 시 ImportCommitService 코호트 루프와 곱해져 쿼리 수가 급증한다.
- **수정**: member_tab_definitions / member_field_definitions 삽입을 multi-row VALUES INSERT 한 번으로 묶고 returning으로 id를 회수한다.

### 멤버 필드값 bulkUpsert가 값 1개당 upsert 쿼리 실행

- **위치**: `apps/backend/src/main/java/world/yeon/backend/member_field_values/write/service/MemberFieldValueWriteService.java:63-81` · **lane**: x-perf · **cat**: n+1
- **이유**: bulkUpsert는 request.values()를 순회하며 값마다 repository.upsertValue를 1쿼리씩(L72-80) 호출한다. 한 수강생의 모든 커스텀 필드를 한 번에 저장하는 화면에서 필드 수만큼 개별 upsert 라운드트립이 발생한다. 정의 조회(findDefinitions, L50)는 IN 절로 배치했지만 쓰기는 배치하지 않았다.
- **수정**: INSERT ... ON CONFLICT (member_id, field_definition_id) DO UPDATE를 multi-row VALUES로 한 번에 실행하도록 upsertValue를 배치화한다.

### member_field_definitions.tab_id FK에 인덱스 없음

- **위치**: `apps/backend/src/main/resources/db/migration/V8__ensure_legacy_web_public_schema.sql:1422` · **lane**: x-perf · **cat**: db-index
- **이유**: member_field_definitions는 tab_id로 member_tab_definitions를 참조하는 FK(L1422, ON DELETE cascade)를 가지나, 마이그레이션 전체를 grep한 결과 member_field_definitions에는 public_id UNIQUE(L1124)와 (space_id, source_key) UNIQUE(L1128)만 있고 tab_id를 포함한 인덱스가 전혀 없다. (space_id, tab_id) 필터는 인덱스로 좁혀지지 않으며, 탭 삭제 시 cascade가 tab_id 풀스캔을 유발한다.
- **수정**: CREATE INDEX member_field_definitions_space_tab_idx ON member_field_definitions(space_id, tab_id) (또는 tab_id 단독) 추가.

### 채팅방 목록을 ScrollView+map으로 비가상화 렌더

- **위치**: `apps/mobile/src/features/chat-service/chat/chat-list-screen.tsx:57` · **lane**: x-perf · **cat**: perf
- **이유**: roomsQuery.data.rooms를 MobileScreen(기본 scroll=true → YeonScrollView) 안에서 .map으로 전량 렌더한다(L57-). 방 수가 많아지면 모든 ProfileListRow가 마운트되어 초기 렌더와 스크롤 비용이 증가한다. 가상화가 없다.
- **수정**: rooms를 FlatList로 렌더하고 renderItem/keyExtractor를 분리한다.

### 피드 글 목록 비가상화 + 글마다 아바타 이미지 즉시 로드

- **위치**: `apps/mobile/src/features/chat-service/feed/feed-screen.tsx:199` · **lane**: x-perf · **cat**: perf
- **이유**: feedQuery.data.posts를 MobileScreen(기본 scroll=true → YeonScrollView) 안에서 .map으로 전량 렌더하며(L199-) 각 글에 PostAuthorHeader(아바타 이미지)를 포함한다(L201-203). 피드가 길어지면 화면 밖 글과 이미지까지 모두 마운트/요청되어 메모리·네트워크가 낭비된다.
- **수정**: 피드를 FlatList로 전환(windowSize/initialNumToRender 조정)하고 아바타는 화면 진입 시 로드되도록 가상화에 맡긴다.

### 세션 Provider value/콜백 미메모 — 모든 소비자 매 렌더 리렌더

- **위치**: `apps/mobile/src/providers/chat-service-session-provider.tsx:313-324` · **lane**: x-perf · **cat**: perf
- **이유**: ChatServiceSessionContext.Provider의 value를 인라인 객체 리터럴로 매 렌더 새로 생성하고(L315-324), requestOtp(L238)/verifyOtp(L256)/refreshSession(L274)/logout(L290)도 useCallback 없는 plain async function이라 매 렌더 재생성된다. 프로바이더 state(session/challenge/status)가 바뀔 때마다 참조가 전부 바뀌어 useChatServiceSession을 쓰는 모든 화면이 불필요하게 리렌더된다.
- **수정**: 콜백은 useCallback으로, context value는 useMemo로 감싸 의존성이 바뀔 때만 새 참조를 만든다.

### 웹 YeonImage가 raw <img> — next/image·lazy 로딩·치수 없음

- **위치**: `packages/ui/src/primitives/YeonImage/index.tsx:7-10` · **lane**: x-perf · **cat**: perf
- **이유**: 웹 YeonImage는 <img {...props}/> 단순 forwardRef 래퍼로(L7-11), apps/web·packages/ui에 실제 next/image 사용이 0건(유일한 매치는 proxy.ts의 라우팅 정규식)이고 loading="lazy"도 코드베이스 전체에 0건이다. YeonAvatarCircle은 imageUrl을 그대로 YeonImage src로 넘기므로(YeonAvatarCircle/index.tsx L24-26) 화면 밖 아바타까지 즉시 다운로드되고, width/height 미지정으로 CLS·과대 이미지 전송이 발생한다.
- **수정**: YeonAvatarCircle 등 리스트 이미지에 loading="lazy" decoding="async"와 명시적 width/height를 추가하고, 가능하면 next/image 또는 리사이즈된 썸네일 URL을 사용한다.

## [LOW] 64건

### InternalServiceTokenAuthFilter의 내부 토큰 비교가 비-상수시간(equals)

- **위치**: `apps/backend/src/main/java/world/yeon/backend/config/InternalServiceTokenAuthFilter.java:54` · **lane**: be-auth-users · **cat**: security
- **이유**: 확인됨. line 54 expectedToken.equals(provided)는 단락 평가로 비교 시간이 일치 접두 길이에 비례한다. 서버-서버 내부 토큰이지만 타이밍 사이드채널로 점진적 추정 여지가 있다.
- **수정**: java.security.MessageDigest.isEqual(byte[],byte[]) 또는 constant-time 비교로 교체하라.

### AUTH_SECRET 미설정/오타 시 토큰 해시 실패가 모든 인증 요청 500

- **위치**: `apps/backend/src/main/java/world/yeon/backend/root_auth/service/AuthTokenHasher.java:30-47` · **lane**: be-auth-users · **cat**: correctness
- **이유**: 확인됨. resolveAuthSecret이 AUTH_SECRET을 못 찾으면 line 46에서 AuthSessionServiceException(500)을 던지며, 이는 매 hash() 호출(= 매 세션 검증/생성)에서 발생한다. root_auth 패키지에 @PostConstruct/InitializingBean 부트 타임 검증이 없어 설정 누락이 런타임 전수 장애로만 드러난다. secret 길이/강도 검증도 없다.
- **수정**: 애플리케이션 시작 시(@PostConstruct 혹은 설정 바인딩) AUTH_SECRET 존재/최소 길이를 검증해 fail-fast 하라.

### getSession이 매 요청 4쿼리(N+1성 오버헤드)와 쓰기 트랜잭션 수행

- **위치**: `apps/backend/src/main/java/world/yeon/backend/root_auth/service/AuthSessionService.java:55-86` · **lane**: be-auth-users · **cat**: perf
- **이유**: 확인됨. @Transactional getSession은 findSessionByTokenHash(line 61) + findUserById(72) + listProvidersByUserId(78) + touchSession update(84) 4개 쿼리를 실행하고 쓰기 트랜잭션을 연다. providers 목록은 화면 표시용인데 인증 hot-path에서 매번 distinct 조회하고, touchSession은 매 요청 row 업데이트라 쓰기 부하/WAL을 키운다.
- **수정**: 세션+유저+providers를 단일 조인 쿼리로 합치고, last_accessed_at 갱신은 매 요청이 아니라 일정 간격(분 단위 throttle)으로만 수행하라.

### provider_user_id가 정규화/길이 제한 없이 저장되어 varchar(191) 초과 가능

- **위치**: `apps/backend/src/main/java/world/yeon/backend/root_auth/social/SocialIdentityProviderClient.java:59,91` · **lane**: be-auth-users · **cat**: db-column-length
- **이유**: 확인됨. requiredText(userInfo, sub/id, ...)로 받은 providerUserId(line 59, 91)는 trim/truncate 없이 SocialIdentityProfile에 담겨 insertIdentity로 전달된다. user_identities.provider_user_id는 V8 migration에서 varchar(191) NOT NULL(line 1000)로 정의됨. email/displayName/avatarUrl은 normalizeString으로 잘리지만 providerUserId만 빠져 있어 비정상적으로 긴 응답 시 INSERT가 DataIntegrityViolation으로 실패한다.
- **수정**: providerUserId도 normalizeString(value, 191)로 정규화하거나, 길이 초과 시 502/명확한 오류로 처리하라.

### social complete의 upsert가 check-then-insert라 동시성 시 1회 재시도에 의존

- **위치**: `apps/backend/src/main/java/world/yeon/backend/root_auth/service/AuthSessionService.java:176-223` · **lane**: be-auth-users · **cat**: race-condition
- **이유**: 확인됨. upsertSocialLoginOnce는 findIdentityByProviderUser/findIdentityByUserProvider로 존재 확인 후 insert하는 check-then-act 패턴이다. user_identities에 unique(provider,provider_user_id) 제약(V8 migration line 1286)이 있고, upsertSocialLogin(line 176-185)은 attempt<1로 단 1회만 재시도한다. 다수 동시 요청이나 insertUser email unique 충돌이 겹치면 재시도 한도를 넘겨 오류가 노출될 수 있다.
- **수정**: insert ... on conflict do nothing/update 기반 진짜 upsert로 바꾸거나, 재시도 횟수를 늘리고 충돌 유형별로 정확히 재조회하라.

### createSessionForUser/dev-login가 BFF 신뢰에만 의존해 임의 userId 세션 발급

- **위치**: `apps/backend/src/main/java/world/yeon/backend/root_auth/service/AuthSessionService.java:96-103` · **lane**: be-auth-users · **cat**: architecture
- **이유**: 확인됨. createSessionForUser(line 96-103)는 호출자가 준 userId에 provider만 존재하면 곧바로 createSession으로 30일짜리 세션 토큰을 발급한다(AUTH_SESSION_TTL_DAYS=30). 인증 증빙 없이 userId만으로 세션 발급이므로 내부 토큰 필터(BFF)가 유일한 방어선이다. internal token 유출이나 BFF가 사용자 입력 userId를 그대로 넘기면 임의 계정 가장이 가능하다.
- **수정**: 이 엔드포인트의 용도를 social-complete 직후 등으로 한정하고, 가능하면 백엔드에서 직접 세션을 만들거나 호출 출처를 더 강하게 검증(서명/짧은 1회용 토큰)하라.

### UserController가 X-Yeon-User-Id를 신뢰해 admin 판정(헤더 위조 의존)

- **위치**: `apps/backend/src/main/java/world/yeon/backend/users/controller/UserController.java:29,34` · **lane**: be-auth-users · **cat**: security
- **이유**: 확인됨. /users 목록(line 29)/생성(line 34)은 @RequestHeader X-Yeon-User-Id의 UUID를 그대로 현재 사용자로 보고 UserService.requireAdmin을 수행한다. 세션 토큰 검증 없이 헤더값만으로 신원이 정해지므로 내부 토큰 필터(BFF) 외에는 방어선이 없다. 헤더가 외부에서 도달 가능한 경로가 생기면 임의 admin userId를 넣어 사용자 목록 열람/생성이 가능하다.
- **수정**: 민감 엔드포인트는 헤더 userId가 아니라 세션 토큰으로 검증된 신원을 사용하거나, 게이트웨이에서 외부 X-Yeon-User-Id 헤더를 strip하도록 보장하고 그 전제를 코드/주석으로 명시하라.

### isDuplicateEmailError가 예외 메시지 문자열 매칭에 의존

- **위치**: `apps/backend/src/main/java/world/yeon/backend/users/service/UserService.java:101-111` · **lane**: be-auth-users · **cat**: error-handling
- **이유**: 확인됨. line 105에서 중복 이메일 판정을 message.contains(users_email | duplicate key | 23505)로 한다. 드라이버/로케일/Postgres 버전에 따라 메시지가 바뀌면 23505가 409가 아닌 500으로 새어나간다. users_email은 다른 제약/인덱스명과 우연히 겹칠 수 있다.
- **수정**: PSQLException.getSQLState()==23505 또는 Spring의 DuplicateKeyException 타입으로 판정하라.

### AuthSessionController가 Persistence/일반 예외를 처리하지 않아 raw 500 노출

- **위치**: `apps/backend/src/main/java/world/yeon/backend/root_auth/controller/AuthSessionController.java:62-70` · **lane**: be-auth-users · **cat**: error-handling
- **이유**: 확인됨. ExceptionHandler는 AuthSessionServiceException(line 62)과 IllegalStateException(line 67)만 처리한다. 백엔드에 auth/users 컨트롤러를 커버하는 전역 @RestControllerAdvice가 없음(grep 확인). uuid 캐스트 실패/DB 오류 등 PersistenceException·DataIntegrityViolationException은 표준화되지 않아 스택트레이스/내부 메시지가 그대로 500으로 노출될 수 있다.
- **수정**: 일반 예외에 대한 fallback 핸들러를 두어 표준 ErrorResponse로 변환하고 내부 세부정보를 숨겨라.

### updateUserForLogin이 email을 coalesce 없이 무조건 덮어써 NOT NULL 위반 위험

- **위치**: `apps/backend/src/main/java/world/yeon/backend/root_auth/repository/AuthSessionRepository.java:228-247` · **lane**: be-auth-users · **cat**: correctness
- **이유**: 확인됨. updateUserForLogin은 line 231에서 email = :email로 무조건 설정한다(displayName/avatar_url은 line 232-233 coalesce로 보호). 호출부 upsertSocialLoginOnce의 existing-identity 경로(line 200)에서 nextEmail = normalizedVerifiedEmail==null ? existingUser.email() : ...로 채우지만, 기존 user.email이 어떤 이유로 null이면 :email=null로 업데이트해 NOT NULL 제약 위반 500이 난다. email만 coalesce 미적용이라 비대칭.
- **수정**: email도 coalesce(:email, email)로 보호하거나, 호출부에서 email이 절대 null이 아님을 강하게 보장하는 가드를 추가하라.

### findCard가 left_at/room 결합 없이 publicId만으로 조회해 다른 방 카드 탐색 노출 가능

- **위치**: `apps/backend/src/main/java/world/yeon/backend/card_rooms/repository/CardRoomRepository.java:107-110` · **lane**: be-card-rooms · **cat**: security
- **이유**: findCard는 public_id로 전 테이블에서 카드를 찾고, 서비스가 사후에 card.roomId().equals(room.internalId())로 거른다(258). 카드 publicId만 알면 다른 방 카드의 존재/소속을 에러 코드 차이로 추론할 여지가 있고, 검증 책임이 서비스에 분산돼 누락 위험이 있다.
- **수정**: findCard에 room_id 파라미터를 받아 'where public_id=? and room_id=?'로 조회하거나, submitResult에서 room 기준 단일 쿼리로 카드 검증을 일원화하라.

### cleanup이 active 참가자 없는 방을 닫지만 leaveRoom 즉시 닫기와 중복/지연 불일치

- **위치**: `apps/backend/src/main/java/world/yeon/backend/card_rooms/service/CardRoomService.java:189-210` · **lane**: be-card-rooms · **cat**: correctness
- **이유**: leaveRoom은 listParticipants가 비면 즉시 CLOSED 처리하지만, 마지막 참가자가 timeout/비정상 종료로 left_at만 남기지 못하면 방이 열린 채 남는다. finishRoomsWithoutActiveParticipants가 보완하지만 스케줄 주기(기본 15분) 동안은 listPublicRooms에 참가자 0명인 좀비 방이 노출된다. 또 cleanup은 staleAfter 무시하고 즉시 닫아 두 경로 정책이 일관되지 않다.
- **수정**: leave 시 호스트 승계/즉시 종료 정책과 cleanup 정책을 일치시키고, listPublicRooms에서 활성 참가자 0인 방을 필터링하거나 cleanup 주기를 짧게 조정하라.

### updateParticipant가 status WAITING이 아닐 때 role/ready만 막고 nickname/character는 진행 중에도 변경 허용

- **위치**: `apps/backend/src/main/java/world/yeon/backend/card_rooms/service/CardRoomService.java:130-150` · **lane**: be-card-rooms · **cat**: validation
- **이유**: 134행 가드는 role!=null || isReady!=null 일 때만 ROOM_ALREADY_STARTED를 던진다. 따라서 학습 진행 중(answering 등)에도 profile(nickname/characterId)은 자유롭게 바뀐다. 시스템 메시지 '님이 입장했습니다'와 결과 표시 닉네임이 도중에 바뀌어 기록 일관성이 흔들릴 수 있다. 의도된 동작일 수 있으나 정책 명시가 없다.
- **수정**: 진행 중 프로필 변경 허용 여부를 명시적으로 결정하고, 금지라면 가드 조건을 profile 변경 포함으로 확장하라.

### normalizeText가 trim 후 maxLength로 잘라내며 multi-byte/검증 실패를 조용히 절단

- **위치**: `apps/backend/src/main/java/world/yeon/backend/card_rooms/service/CardRoomService.java:333-339` · **lane**: be-card-rooms · **cat**: validation
- **이유**: 초과 입력을 에러로 알리지 않고 substring으로 말없이 잘라낸다(338). DB 컬럼은 varchar(80/120/40/80)인데 CARD_FACE/CHAT_MESSAGE는 text라 룰 maxLength(2000/500)만 적용된다. 또 Character 단위가 아닌 UTF-16 char 단위 substring이라 surrogate pair(이모지) 중간을 잘라 깨진 문자를 저장할 수 있다.
- **수정**: 초과 길이는 명시적 검증 에러로 반환하거나, 최소한 codePoint 경계를 보존해 절단하라. CARD_FACE/NICKNAME 등 룰 maxLength와 DB 컬럼 길이를 일치시켜라.

### createRoom 게스트 카드 항목 개수 상한이 없어 대량 카드로 트랜잭션 폭주 가능

- **위치**: `apps/backend/src/main/java/world/yeon/backend/card_rooms/service/CardRoomService.java:92-107` · **lane**: be-card-rooms · **cat**: validation
- **이유**: guestDeck.items()를 개수 제한 없이 받아 for 루프로 카드마다 개별 insertCard를 실행한다(103-107). 악의적/실수로 수만 개 항목을 보내면 단일 트랜잭션에서 N번 insert가 돌아 커넥션을 장시간 점유하고 DB 부하/타임아웃을 유발한다. 배치 insert도 아니다.
- **수정**: 카드 개수 상한(예: 200)을 검증하고, insert는 jdbc batchUpdate로 묶어라.

### findRoom의 host left join이 다중 호스트/유령 호스트 시 방 행을 복제할 수 있음

- **위치**: `apps/backend/src/main/java/world/yeon/backend/card_rooms/repository/CardRoomRepository.java:45-57` · **lane**: be-card-rooms · **cat**: correctness
- **이유**: is_host=true and left_at is null인 활성 호스트가 (중복 join 버그/동시 입장으로) 2명 이상이면 left join이 방 row를 2개로 곱해 findRoom이 첫 행만 쓰더라도 listPublicRooms는 같은 방을 중복 노출한다. is_host 유일성을 보장하는 제약이 DB에 없다(V6).
- **수정**: (room_id) where is_host=true and left_at is null 부분 유니크 인덱스로 활성 호스트 유일성을 강제하거나, 서브쿼리/distinct on으로 host_label을 1행으로 보장하라.

### reveal/next/submitResult에 방 CLOSED 가드가 없어 종료된 방에도 일부 전이 시도 가능

- **위치**: `apps/backend/src/main/java/world/yeon/backend/card_rooms/service/CardRoomService.java:212-247` · **lane**: be-card-rooms · **cat**: error-handling
- **이유**: joinRoom만 ensureRoomOpen으로 CLOSED를 막고, reveal/next/submitResult는 ANSWERING/REVEALED 등 진행 status 가드로 간접 차단된다. 그러나 status별 에러 메시지(ROOM_NOT_ANSWERING 등)는 '이미 종료됨'이라는 의미를 전달하지 못해 클라이언트가 종료 상황을 구분하기 어렵다. addMessage는 CLOSED 방에도 무제한 채팅 허용된다.
- **수정**: 전이 계열 메서드에 CLOSED/FINISHED를 우선 검사해 ROOM_CLOSED를 던지고, addMessage의 종료 방 채팅 허용 여부를 정책으로 명시하라.

### 친구/추천 오버뷰 서비스에 트랜잭션 경계 없음 (다중 쿼리 비원자 읽기)

- **위치**: `apps/backend/src/main/java/world/yeon/backend/chat_service_friends_overview/service/ChatServiceFriendsOverviewService.java:24` · **lane**: be-chat-service · **cat**: transaction
- **이유**: getOverview()(line 24)는 listLinks, listBlockPairs, listBlockedProfiles, listProfilesByIds, listSuggestedProfiles 등 5개 분리된 네이티브 쿼리를 호출하지만 @Transactional이 전혀 없다(클래스/메서드에 어노테이션 없음). 같은 슬라이스의 다른 서비스들(예: chat_rooms list/get은 @Transactional(readOnly=true))은 붙어 있는데 이 서비스만 누락되어 쿼리 간 커밋된 변경이 섞여 보일 수 있고 커넥션이 쿼리마다 분리될 수 있다.
- **수정**: getOverview에 @Transactional(readOnly = true)를 추가한다.

### 추천 친구 목록 필터링을 메모리에서 수행해 후보 고갈 가능

- **위치**: `apps/backend/src/main/java/world/yeon/backend/chat_service_friends_overview/repository/ChatServiceFriendsOverviewRepository.java:81-92` · **lane**: be-chat-service · **cat**: correctness
- **이유**: listSuggestedProfiles(line 81-92)는 무조건 nickname asc 상위 20명을 가져온 뒤, 서비스단(line 59-64)에서 현재 사용자·관련(차단/친구)자를 제외하고 8명으로 자른다. 차단/친구가 nickname 사전순 앞쪽에 몰리면 20명이 모두 제외되어 추천이 0건이 될 수 있다. 또한 항상 동일한 사전순 상위만 노출되어 추천 다양성이 없다.
- **수정**: 제외 대상(current/related ids)을 SQL where 'id <> all(:excluded)'로 넘겨 DB에서 필터링하고, 안정적 무작위 또는 최근 가입 등 의미있는 정렬로 limit을 적용한다.

### findRoomSummary가 currentProfileId를 WHERE에서 사용하지 않아 권한검증을 쿼리 자체로 강제하지 못함

- **위치**: `apps/backend/src/main/java/world/yeon/backend/chat_service_chat_rooms/repository/ChatServiceChatRoomsRepository.java:85-117` · **lane**: be-chat-service · **cat**: security
- **이유**: findRoomSummary(line 85-117)는 currentProfileId를 peer 계산용 case 식(line 101)에만 쓰고 where는 'r.id = :roomId'(line 109)만 본다. 즉 참여자가 아니어도 방 요약을 반환한다. 현재는 service.get()(line 29-46)이 먼저 findRoomParticipant로 소유권을 검증하므로 노출되지 않지만, 쿼리 단독으로는 방어가 없어 향후 다른 호출 경로가 생기면 정보 노출로 이어질 수 있다(방어적 깊이 부족).
- **수정**: where 절에 '(r.user_a_id = :currentProfileId or r.user_b_id = :currentProfileId)' 조건을 추가해 비참여자에게는 row가 반환되지 않도록 쿼리 레벨에서도 강제한다.

### 백엔드가 X-Yeon-Chat-Profile-Id 헤더를 무검증 신뢰 (소유권 근거가 호출자 헤더)

- **위치**: `apps/backend/src/main/java/world/yeon/backend/chat_service_feed/controller/ChatServiceFeedController.java:49` · **lane**: be-chat-service · **cat**: security
- **이유**: 모든 chat_service 컨트롤러는 currentProfileId를 @RequestHeader('X-Yeon-Chat-Profile-Id')로 받아(예: feed controller line 33,40,49,57,66,75,84) 그대로 소유권/권한 판단의 근거로 쓴다. 백엔드 자체에는 이 헤더의 profile_id가 실제 세션 소유자인지 검증하는 필터/인터셉터가 없다(chat_service_auth_sessions와 대조 안 함). 보호가 전적으로 '신뢰된 호출자(BFF + 내부토큰)' 가정에 의존하여, 내부토큰 유출 또는 다른 내부 서비스가 임의 profile_id를 보내면 임의 사용자 사칭이 가능하다(방어적 깊이 부족).
- **수정**: 최소한 X-Yeon-Chat-Session-Token을 함께 받아 chat_service_auth_sessions로 profile_id를 서버측에서 재확인하는 인터셉터를 두거나, 헤더 profile_id와 세션 매핑 불일치 시 거부한다. 단기적으로는 BFF가 항상 세션 검증 후에만 헤더를 채운다는 불변식을 문서화/테스트로 고정한다.

### community chat 메시지 목록이 게스트 presence 세션 ID를 모든 사용자에게 노출

- **위치**: `apps/backend/src/main/java/world/yeon/backend/community_chat/service/CommunityChatService.java:34-36` · **lane**: be-community-misc · **cat**: security
- **이유**: toResponse()(line 35)는 게스트 메시지의 senderId를 'guest:' + row.guestSessionId()로 만들어 응답에 그대로 내보낸다. listMessages(line 20)는 @Transactional(readOnly=true) 공개 메서드로 인증 없이 호출 가능하므로, 한 게스트의 presence 세션 식별자가 채팅을 읽는 모든 사람에게 broadcast된다. 비밀 자격증명은 아니지만 같은 게스트의 여러 메시지를 상호 연관(linkability)시키고 스푸핑 단서를 제공한다.
- **수정**: 클라이언트가 자기 메시지 식별에 필요한 만큼만 노출하거나 guestSessionId 원문 대신 서버가 발급한 비가역 표시용 id(해시/익명 토큰)를 senderId에 사용한다.

### StudentBoardReadServiceException은 정의·핸들러만 있고 던져지지 않는 dead code

- **위치**: `apps/backend/src/main/java/world/yeon/backend/student_board_read/service/StudentBoardReadServiceException.java:1-15` · **lane**: be-community-misc · **cat**: dead-code
- **이유**: StudentBoardReadService는 NoSuchElementException(line 42)과 IllegalArgumentException(line 38)만 던지며 StudentBoardReadServiceException을 한 번도 throw하지 않는다. 그런데 StudentBoardReadController line 46에 전용 @ExceptionHandler(StudentBoardReadServiceException.class)가 등록돼 있어 도달 불가능하다. public_check_runtime 등 다른 도메인은 동일 패턴의 서비스 예외를 status/code와 함께 일관되게 던지는데 이 도메인만 어긋난다.
- **수정**: 권한 404·잘못된 period 400 등에서 StudentBoardReadServiceException을 던지도록 통일하거나, 사용하지 않을 거면 예외 클래스와 핸들러를 제거한다.

### getHistoryDateKey가 happened_at null일 때 NPE 가능(방어 부재)

- **위치**: `apps/backend/src/main/java/world/yeon/backend/student_board_read/service/StudentBoardReadService.java:55,121-123` · **lane**: be-community-misc · **cat**: correctness
- **이유**: historyRows 루프 55행에서 getHistoryDateKey(row.happenedAt())를 먼저 호출하는데, 122행은 value.withOffsetSameInstant(...)를 null 방어 없이 호출하므로 happenedAt이 null이면 NPE다. 정작 같은 셀의 timestamp 표시(62행)는 null을 명시적으로 처리한다. CREATE 시 happened_at은 NOT NULL이지만 V8 마이그레이션의 ADD COLUMN 경로(line 855)는 DEFAULT now()만 있고 NOT NULL 제약이 없어 레거시 테이블에선 nullable일 수 있다. null 행이 있으면 보드 조회 전체가 500이 된다.
- **수정**: getHistoryDateKey에서 null을 방어하거나, null happened_at row를 skip 처리해 한 행 결손이 화면 전체 실패로 번지지 않게 한다.

### activity_logs 조회가 불필요한 members/spaces 조인으로 이미 아는 public_id를 재조회

- **위치**: `apps/backend/src/main/java/world/yeon/backend/activity_logs/repository/ActivityLogRepository.java:70-87` · **lane**: be-community-misc · **cat**: perf
- **이유**: findActivityLogs(line 72-75)는 a.space_id/a.member_id 내부 id로 필터하면서 응답용 public_id를 얻으려 members와 spaces를 inner join한다. 그러나 service의 getActivityLogs는 requireOwnedMember에서 owned.memberId/owned.spaceId(public_id)를 이미 알고 있다(ActivityLogService line 30-31). 모든 행이 같은 멤버/스페이스이므로 조인은 매 행 동일 값을 가져오는 낭비다.
- **수정**: 조인을 제거하고 activity_logs만 조회한 뒤, service에서 알고 있는 memberId/spaceId(public_id)를 매핑 시 주입한다.

### ActivityLog 읽기 경로에 readOnly 트랜잭션 경계 없이 3개 쿼리 실행

- **위치**: `apps/backend/src/main/java/world/yeon/backend/activity_logs/service/ActivityLogService.java:28-34` · **lane**: be-community-misc · **cat**: transaction
- **이유**: getActivityLogs(line 28)는 findOwnedMemberInSpace + findActivityLogs + countActivityLogs를 @Transactional 없이 각각 별도 트랜잭션으로 실행한다. 일관 스냅샷이 없어 동시 쓰기 시 logs와 totalCount가 불일치할 수 있고 readOnly 최적화 힌트도 누락된다. community_chat의 listMessages가 @Transactional(readOnly=true)를 붙인 것과 대비된다.
- **수정**: getActivityLogs에 @Transactional(readOnly = true)를 부여해 세 쿼리를 하나의 읽기 트랜잭션으로 묶는다.

### checkbox 값 변환이 Boolean.valueOf로 'true' 외 모두 false 처리

- **위치**: `apps/backend/src/main/java/world/yeon/backend/member_field_values/write/service/MemberFieldValueWriteService.java:116` · **lane**: be-members-spaces · **cat**: validation
- **이유**: checkbox는 Boolean.valueOf(String.valueOf(value))를 쓴다(라인 116). '1','yes','TRUE '(공백) 등은 모두 false가 되고, 잘못된 입력(예: 숫자 1)도 조용히 false로 저장된다. 입력 검증이 없어 사용자가 의도한 체크 상태와 달라질 수 있다.
- **수정**: value instanceof Boolean 우선 처리하고, 문자열은 화이트리스트('true'/'false'/'1'/'0')로 파싱하되 그 외엔 400 에러로 거절한다.

### date 필드값에 형식 검증이 없어 임의 문자열 저장

- **위치**: `apps/backend/src/main/java/world/yeon/backend/member_field_values/write/service/MemberFieldValueWriteService.java:110-111` · **lane**: be-members-spaces · **cat**: validation
- **이유**: date 타입을 text와 동일하게(switch case 'text','...','date') 5000자 잘라 value_text에 저장할 뿐(라인 110-111) 날짜 형식 검증이 없다. 이후 읽기/정렬/필터 시 비정상 데이터가 그대로 노출된다(SpaceService는 스페이스 기간에 대해 ISO 날짜 검증을 하는데 필드값은 안 함 — 불일치).
- **수정**: date/email/url/phone 타입에 대해 최소 형식 검증을 추가하거나 정책상 자유 입력임을 명시한다.

### value_number 변환에서 NaN만 막고 Infinity는 통과

- **위치**: `apps/backend/src/main/java/world/yeon/backend/member_field_values/write/service/MemberFieldValueWriteService.java:122-130` · **lane**: be-members-spaces · **cat**: validation
- **이유**: toNumber는 Double.isNaN만 검사한다(라인 125). 'Infinity'/'-Infinity' 또는 매우 큰 값은 통과해 stripTrailingZero→BigDecimal.valueOf(Infinity)에서 NumberFormatException이 나거나 numeric 컬럼 범위를 벗어날 수 있다.
- **수정**: Double.isFinite(numeric)로 검사하고 무한/과대값은 400으로 거절한다.

### text 필드값 5000자 자르기로 사용자 데이터 무음 손실

- **위치**: `apps/backend/src/main/java/world/yeon/backend/member_field_values/write/service/MemberFieldValueWriteService.java:110-111` · **lane**: be-members-spaces · **cat**: correctness
- **이유**: value_text 컬럼은 text(무제한, V8 라인 589)인데 서비스가 5000자로 잘라 저장한다(라인 110-111). long_text도 동일하게 잘려 사용자 입력이 경고 없이 손실된다. 컬럼 타입과 애플리케이션 제한이 불일치한다.
- **수정**: 제한이 의도라면 초과 시 400으로 거절하고, 아니라면 잘라내기를 제거하거나 한도를 상향/문서화한다.

### bulkUpsert의 upsert가 멤버-스페이스 일치를 재검증하지 않음(definition만 검증)

- **위치**: `apps/backend/src/main/java/world/yeon/backend/member_field_values/write/repository/MemberFieldValueWriteRepository.java:81-128` · **lane**: be-members-spaces · **cat**: correctness
- **이유**: upsertValue는 member_id, field_definition_id만으로 insert/on conflict 한다(라인 81-128, 조인 검증 없음). 서비스가 member/space/definition을 각각 검증하지만 멤버-스페이스 정합성은 서비스 의존이라 향후 호출자 추가 시 우회 위험.
- **수정**: upsert SQL에 member가 해당 space 소속인지 조인 조건을 넣거나, 서비스 검증을 신뢰하는 경계를 주석/테스트로 고정한다.

### activity_logs 중복 검사 인덱스 컬럼 순서 불일치

- **위치**: `apps/backend/src/main/resources/db/migration/V8__ensure_legacy_web_public_schema.sql:1207` · **lane**: be-members-spaces · **cat**: db-index
- **이유**: existsActivityLog는 (member_id, recorded_at, type)으로 조회하는데(repository 라인 120-127) 인덱스는 activity_logs_member_space_recorded_at_idx(member_id, space_id, recorded_at)이다(라인 1207). type이 인덱스에 없고 space_id가 prefix에 끼어 있어 시트 동기화의 행별 존재 검사 효율이 떨어진다.
- **수정**: 중복 검사 쿼리에 맞춘 (member_id, type, recorded_at) 인덱스를 추가하거나 검사 쿼리를 일괄화한다.

### exchangeAndSave가 findRefreshToken 조회와 upsert를 분리된 트랜잭션으로 처리한다

- **위치**: `apps/backend/src/main/java/world/yeon/backend/googledrive_oauth/service/GoogleDriveOAuthService.java:45-71` · **lane**: be-oauth-drive · **cat**: transaction
- **이유**: line 46에서 findRefreshToken(비트랜잭션 read) 후 line 57에서 외부 HTTP 토큰 교환을 하고 line 71에서 upsertTokens(@Transactional)를 호출한다. 조회와 쓰기 사이에 외부 호출(수 초)이 끼어 있어, 그 사이 다른 콜백이 refresh_token을 갱신하면 stale한 existingRefreshToken(line 67)으로 덮어써 최신 refresh_token을 잃을 수 있다(read-modify-write 경합).
- **수정**: INSERT ... ON CONFLICT DO UPDATE에서 COALESCE(EXCLUDED.refresh_token, googledrive_tokens.refresh_token) 형태로 DB 레벨에서 보존 로직을 처리해 read-modify-write 윈도우를 제거한다.

### OAuth state가 백엔드에서 검증되지 않고 PKCE도 없는 confidential client 흐름이다

- **위치**: `apps/backend/src/main/java/world/yeon/backend/googledrive_oauth/service/GoogleDriveOAuthService.java:32-43` · **lane**: be-oauth-drive · **cat**: security
- **이유**: buildOAuthUrl(line 32-43)은 state 비어있음만 막고(line 33) 그대로 authorize URL에 넣는다(line 40). callback(exchangeAndSave)에서 state를 검증하지 않으며 PKCE(code_challenge)도 사용하지 않음을 코드로 확인했다. client_secret 기반 confidential client이므로 PKCE 부재는 허용 가능하나, CSRF 방어를 위한 state 바인딩 검증 책임이 전적으로 web BFF 콜백에 있다. 이 계약이 강제/문서화되지 않으면 web에서 state 검증 누락 시 OAuth CSRF가 가능하다.
- **수정**: web BFF 콜백이 발급한 state를 세션/쿠키에 바인딩해 콜백에서 반드시 검증하도록 보장하고(테스트로 강제), 백엔드 계약 문서(api-contract / agent-rules)에 state 검증 책임 위치를 명시한다.

### SecurityConfig가 httpBasic을 활성화해 불필요한 인증 표면을 노출한다

- **위치**: `apps/backend/src/main/java/world/yeon/backend/config/SecurityConfig.java:23` · **lane**: be-oauth-drive · **cat**: security
- **이유**: 실제 인증은 InternalServiceTokenAuthFilter(X-Yeon-Internal-Token)로 수행함을 확인했는데도 line 23에서 .httpBasic(Customizer.withDefaults())로 HTTP Basic 인증을 켜 둔다. 사용하지 않는 인증 메커니즘이 활성화되어 공격 표면이 늘고, 의도치 않은 Basic 인증 경로/브라우저 인증 팝업이 노출될 수 있다.
- **수정**: 내부 토큰 필터만 사용한다면 httpBasic을 disable한다(.httpBasic(AbstractHttpConfigurer::disable)).

### 내부 서비스 토큰 비교가 비-상수시간(equals)이라 타이밍 사이드채널 여지가 있다

- **위치**: `apps/backend/src/main/java/world/yeon/backend/config/InternalServiceTokenAuthFilter.java:54` · **lane**: be-oauth-drive · **cat**: security
- **이유**: line 54의 expectedToken.equals(provided)는 String.equals로 첫 불일치 문자에서 즉시 반환하는 비-상수시간 비교다. 내부 서비스 인증 토큰(시크릿)을 이렇게 비교하면 이론적으로 타이밍 공격 여지가 있다.
- **수정**: java.security.MessageDigest.isEqual 또는 상수시간 비교 유틸로 토큰을 비교한다.

### SecurityConfig가 community-chat 메시지 엔드포인트를 무인증 permitAll로 개방한다

- **위치**: `apps/backend/src/main/java/world/yeon/backend/config/SecurityConfig.java:30` · **lane**: be-oauth-drive · **cat**: security
- **이유**: line 30에서 /api/v1/community-chat/messages(및 /\*\*)를 permitAll로 열어 내부 토큰 없이 누구나 접근 가능함을 확인했다. drive/oauth lane 범위 밖이나, 백엔드가 internal-only로 의도된 경우 인증 우회 표면이 된다. 의도된 공개라면 rate limit/입력 검증이 충분한지 별도 확인이 필요하다.
- **수정**: 공개가 의도라면 명시적 주석/문서와 함께 rate limiting을 적용하고, 아니라면 인증 대상으로 되돌린다.

### colyseus STATE/ERROR onMessage 콜백이 cancelled 가드 없이 setState/setError 호출

- **위치**: `apps/mobile/src/features/card-service/rooms/use-card-room-connection.ts:70-76` · **lane**: fe-card-rooms · **cat**: race-condition
- **이유**: onLeave/onError 콜백은 if(!cancelled) 가드가 있는데(77-85) onMessage(STATE)의 setState(next)와 onMessage(ERROR)의 setError(message.message)는 가드가 없다(70-76). cleanup이 cancelled=true + roomRef.current?.leave()(fire-and-forget Promise, 95)를 호출해도 즉시 리스너가 끊기지 않을 수 있어 inflight 메시지가 전환된 컴포넌트의 이전 방 상태를 덮어쓸 위험이 있다. 다만 웹 use-card-room.ts:133-139도 동일하게 가드가 없어 모바일 고유 회귀는 아니며 실제 영향 범위가 좁아 severity를 low로 조정.
- **수정**: 두 onMessage 콜백 내부에도 if(!cancelled) 가드를 넣어 cleanup 이후 상태 갱신을 차단.

### 입장 실패가 terminal 상태 — 재시도 버튼 없이 에러 화면에 고정

- **위치**: `apps/mobile/src/features/card-service/rooms/card-room-screen.tsx:47-81` · **lane**: fe-card-rooms · **cat**: error-handling
- **이유**: joinRoom 실패 시 setJoinError로 StateBlock 에러 화면을 그린다(55-61, 75-81). participantId가 여전히 null이고 effect 의존성(loaded/profile/guestId/participantId/roomId)이 안 바뀌므로 자동 재시도가 없고 화면에 재시도 버튼도 없다. 네트워크 순단으로 한 번 실패하면 사용자는 뒤로 갔다 다시 들어와야 복구된다. 실사용 영향은 제한적이라 low로 조정.
- **수정**: StateBlock에 재시도 액션(joinError를 null로 리셋해 effect 재실행) 제공.

### 방 생성(로그인 사용자) 시 빈 문자열 participantId를 SecureStore에 영구 저장

- **위치**: `apps/mobile/src/features/card-service/rooms/card-room-create-sheet.tsx:101-104` · **lane**: fe-card-rooms · **cat**: correctness
- **이유**: cardRoomResponseSchema.participant는 optional(api-contract/src/card-rooms.ts:190). createRoom 응답에 participant가 없으면 response.participant?.id ?? ""로 빈 문자열을 writeCardRoomParticipantId로 SecureStore에 영구 저장한다(101-104). card-room-screen은 if(stored)(43)로 빈 문자열을 falsy 처리해 즉각 크래시는 없지만 의미 없는 빈 키를 영구 저장하고 join 흐름을 모호하게 한다.
- **수정**: response.participant?.id가 truthy일 때만 writeCardRoomParticipantId 호출. 없으면 저장을 건너뛰어 card-room-screen이 깔끔히 REST join 하도록.

### 게스트 ID read-or-create에 TOCTOU 경합 — 동시 호출 시 서로 다른 guestId 생성

- **위치**: `apps/mobile/src/services/card-rooms/profile-storage.ts:90-98` · **lane**: fe-card-rooms · **cat**: race-condition
- **이유**: readCardRoomGuestId는 read(91) → 없으면 generate(95) → write(96)의 비원자적 흐름이다. useCardRoomIdentity가 card-room-screen·card-room-create-sheet 양쪽에서 사용되며(grep 확인), 최초 실행에서 동시 마운트 시 둘 다 read에서 null을 받고 각자 다른 guest\_를 생성, 마지막 write가 이긴다. 다만 두 화면은 보통 동시에 마운트되지 않는 별도 경로라 실제 경합 확률은 낮아 low로 조정.
- **수정**: guestId 생성을 모듈 레벨 단일 in-flight Promise로 메모이즈하거나 앱 부팅 시 1회 초기화. 또는 useCardRoomIdentity 결과를 상위에서 한 번만 생성해 내려 중복 호출 제거.

### colyseus cleanup에서 leave() Promise를 await/catch하지 않아 잠재 unhandled rejection

- **위치**: `apps/mobile/src/features/card-service/rooms/use-card-room-connection.ts:93-97` · **lane**: fe-card-rooms · **cat**: error-handling
- **이유**: cleanup에서 roomRef.current?.leave()(95)를 호출 후 즉시 roomRef를 null로 둔다. leave()는 Promise를 반환하는데 거부(이미 끊긴 소켓 등) 시 catch가 없어 RN에서 unhandled promise rejection 경고를 유발할 수 있다.
- **수정**: roomRef.current?.leave()?.catch(() => {})로 거부를 무해 처리하거나 try/catch로 감싼다.

### 채팅 입력에 클라이언트측 길이 제한 없음 — 서버 절단 의존

- **위치**: `apps/mobile/src/features/card-service/rooms/card-room-screen.tsx:282-298` · **lane**: fe-card-rooms · **cat**: validation
- **이유**: API 계약상 content는 max 500(createCardRoomMessageBodySchema, api-contract/src/card-rooms.ts:104-105), 서버 card-room.ts:200도 MAX_CHAT_MESSAGE_LENGTH(28)로 slice한다. 하지만 모바일 chat TextField(284-289)에는 maxLength가 없어 사용자가 임의 길이를 입력/전송할 수 있고(조용히 절단됨) 길이 초과 피드백이 없다.
- **수정**: chat TextField에 maxLength={500} 적용, 전송 전 길이 검증/안내. 방 제목 TextField(max 80, create-sheet 140-145)에도 maxLength 부여 권장.

### 채팅 발신자 닉네임/메시지 본문에 대한 클라이언트 표시 sanitize 부재(닉네임은 서버 max 검증도 없음)

- **위치**: `apps/mobile/src/features/card-service/rooms/card-room-screen.tsx:262-277` · **lane**: fe-card-rooms · **cat**: security
- **이유**: RN <YeonText> 렌더라 HTML XSS는 성립하지 않지만, senderNickname/content는 서버 표시 문자열이다. cardRoomParticipantDtoSchema.nickname은 z.string()으로 max·trim 제약이 없음을 확인했다(api-contract/src/card-rooms.ts:121 — 입력 cardRoomProfileSchema는 max40이나 응답 DTO엔 상한 없음). 비정상적으로 긴/제어문자 닉네임이 오면 채팅 레이아웃이 깨질 수 있다.
- **수정**: 표시 직전 닉네임/본문을 안전 길이로 slice하고 개행·제어문자 정규화. 근본적으로 응답 DTO 스키마(nickname/content)에 max/trim 제약을 추가해 SSOT에서 방어.

### YeonImage 고정 height 180 + resizeMode contain으로 표·세로 이미지 잘림/여백 과다

- **위치**: `apps/mobile/src/features/card-service/card-markdown.tsx:18-29, 114-116` · **lane**: fe-markdown · **cat**: perf
- **이유**: image 스타일이 width:100%, height:180 고정이다. 원본 종횡비를 무시한 고정 높이라 가로로 긴 이미지는 좌우 큰 여백, 세로로 긴 이미지는 과도하게 축소되어 가독성이 떨어진다. 대형 이미지에 대한 적응 높이 처리가 없어 레이아웃이 어색해진다.
- **수정**: Image.getSize 또는 onLoad의 source 크기로 aspectRatio를 계산해 동적 높이를 적용하거나, maxHeight + aspectRatio 기반 스타일로 종횡비를 보존한다.

### 마크다운 link 렌더가 onLinkPress 정책 없이 라이브러리 기본 동작에 위임 — 스킴 allowlist 부재

- **위치**: `apps/mobile/src/features/card-service/card-markdown.tsx:17-30, 141-152` · **lane**: fe-markdown · **cat**: security
- **이유**: rules에 image만 커스텀했고 Markdown에 onLinkPress가 지정되지 않아 link는 react-native-markdown-display 기본 동작(Linking.openURL)에 맡겨진다. 신뢰되지 않은 사용자 본문의 링크(피싱·딥링크·custom scheme)가 탭 시 그대로 열릴 수 있고 스킴 allowlist가 없다.
- **수정**: Markdown에 onLinkPress를 지정해 http/https만 허용하고 그 외 스킴(javascript:, custom deep link 등)은 차단하거나 확인 다이얼로그를 띄운다.

### ReactNode 분기에서 typeof === 'string'만 평문 처리 — number/0/빈문자 등 엣지 렌더 불일치

- **위치**: `packages/ui/src/patterns/YeonReviewPanel/index.native.tsx:50-60, 70-80` · **lane**: fe-markdown · **cat**: correctness
- **이유**: questionText/answerText가 string일 때만 스타일된 YeonText로 감싸고, 그 외 ReactNode는 그대로 렌더한다. number(0 포함)나 boolean이 전달되면 YeonText 스타일이 적용되지 않은 채 렌더되거나 RN의 'Text strings must be rendered within a <Text>' 류 문제가 날 수 있다. 빈 문자열도 string 분기로 들어가 빈 박스만 보인다. YeonStudyCard(index.native.tsx 41-47)도 동일 패턴.
- **수정**: 분기를 typeof === 'string' || typeof === 'number'로 넓혀 String()으로 정규화하거나 호출부에서 string|ReactElement로 좁혀 계약을 명확히 한다. 빈 값일 때 빈 박스를 숨기는 처리도 고려.

### YeonEditableCardRow가 questionText/answerText 평문 분기와 content 분기를 동시에 노출 — content 제공 시 평문 prop이 죽은 채 필수로 남음

- **위치**: `packages/ui/src/patterns/YeonEditableCardRow/index.native.tsx:18-37, 126-152` · **lane**: fe-markdown · **cat**: contract-drift
- **이유**: questionContent/answerContent가 제공되면 questionText/answerText 평문은 렌더에 쓰이지 않지만 타입상 여전히 required(questionText, answerText: string)다. 호출부는 마크다운을 쓰면서도 의미 없는 평문을 강제로 채워야 하고, 이 평문이 실제 본문과 어긋나면 드리프트가 생긴다. content 분기 시 평문은 accessibilityLabel 등 어디에도 활용되지 않아 a11y 손실도 있다.
- **수정**: questionContent 제공 시 questionText를 옵셔널로 만들거나, content를 쓰는 경우 평문을 접근성 라벨(스크린리더용 fallback)로 활용한다. 계약을 discriminated union(평문 모드 | content 모드)으로 정리한다.

### deltaX 임계값 기반 스와이프-삭제가 탭/스크롤과 충돌해 의도치 않은 삭제 노출

- **위치**: `packages/ui/src/patterns/YeonEditableCardRow/index.native.tsx:61-89` · **lane**: fe-markdown · **cat**: correctness
- **이유**: pressIn/pressOut의 pageX 차이만으로 스와이프를 판정한다(-42 노출, +24 닫힘). PanResponder/Gesture가 아니라 단순 좌표 델타라, 세로 스크롤 중 약간의 수평 이동이나 빠른 탭에서도 삭제 레일이 노출/토글될 수 있고 멀티터치·제스처 경합을 처리하지 못한다. handleOpen은 삭제 노출 상태면 onEdit을 막아 사용자가 편집하려던 탭이 무시되는 혼란도 발생한다.
- **수정**: react-native-gesture-handler의 Swipeable/Pan으로 교체해 수평·수직 의도를 구분하고 임계값·속도 기반 판정을 적용한다. 최소한 세로 이동량이 클 때는 스와이프 판정을 무시하도록 가드한다.

### StudyCard에서 ScrollView가 YeonButton 내부에 중첩 — 스크롤·탭 제스처 충돌 및 a11y 저하

- **위치**: `packages/ui/src/patterns/YeonStudyCard/index.native.tsx:31-48` · **lane**: fe-markdown · **cat**: a11y
- **이유**: YeonStudyCard는 카드 전체가 onPress를 가진 YeonButton인데 그 안에 YeonScrollView로 body(긴 마크다운)를 감싼다. 누르기와 스크롤 제스처가 같은 영역에서 경합해, 긴 본문을 스크롤하려다 카드 탭(정답 공개 등)이 발화되거나 스크롤이 막힐 수 있다. 버튼 내부 스크롤 영역은 스크린리더에서 단일 버튼으로 묶여 본문 탐색 접근성이 떨어진다.
- **수정**: 탭 액션과 스크롤 영역을 분리하거나, 본문이 길 때만 스크롤 가능한 별도 컨테이너로 빼고 카드 탭은 명시적 버튼/하단 hint 영역에 둔다.

### asset-upload 클라이언트가 mimeType/name을 검증 없이 그대로 신뢰해 서버에 전송

- **위치**: `apps/mobile/src/services/card-service/asset-upload.ts:14-20` · **lane**: fe-markdown · **cat**: validation
- **이유**: asset.mimeType과 asset.name을 그대로 multipart part로 넣는다. 호출부(markdown-text-field.tsx 218-219)는 asset.mimeType ?? 'image/jpeg', asset.fileName ?? 'image.jpg'로 기본값만 줄 뿐 image/\* 여부를 확인하지 않는다. 서버 검증이 없는 현 상태와 결합되면 비이미지 파일도 무리 없이 업로드된다. name에 경로 구분자가 들어가면 백엔드 스토리지 키 처리에 따라 경로 조작 여지도 있다.
- **수정**: 클라이언트에서도 mimeType이 image/\*인지 확인하고 name을 안전한 파일명으로 정규화(경로 구분자 제거)한다. 단, 1차 방어는 서버에서 해야 한다.

### exp+ 딥링크 dev 허용 분기가 임의 exp+<scheme>을 통과시킨다

- **위치**: `apps/web/src/server/auth/constants.ts:95-100` · **lane**: fe-gate-auth · **cat**: security
- **이유**: protocol.startsWith("exp+")는 exp+yeon: 외에 exp+anything: 같은 임의 scheme도 dev에서 통과시킨다. NODE_ENV!=='production' 가드가 있어 prod에는 무영향이지만, dev/스테이징이 production이 아닌 상태로 외부에 노출되면 임의 exp+ scheme으로 토큰 리다이렉트가 가능하다. 환경 판별을 NODE_ENV 하나에만 의존하는 점도 취약하다.
- **수정**: exp+ 허용을 정확한 앱 slug(예: exp+yeon:)로 한정하거나, dev 딥링크 허용을 별도 명시 환경변수(ALLOW_EXPO_RETURN)로 게이트하라.

### 로그아웃이 서버 무효화 실패를 무시하고 항상 로컬 성공 처리 — 토큰이 서버에 유효한 채 남을 수 있음

- **위치**: `apps/mobile/src/features/card-service/card-session-context.tsx:102-118` · **lane**: fe-gate-auth · **cat**: security
- **이유**: logout()은 cardServiceApi.logout(sessionToken) 실패를 catch로 전부 삼키고 무조건 로컬 토큰만 지운다(주석: '로컬 로그아웃은 무조건 성공'). 서버 세션 무효화가 실패(네트워크 단절 등)하면 토큰은 서버에서 여전히 유효한 상태로 남는다. 만약 그 토큰이 어딘가(로그, 백업, 위 쿼리스트링 노출)로 유출됐다면 사용자가 로그아웃해도 세션이 살아있어 계정 탈취가 지속된다.
- **수정**: 서버 무효화 실패 시 재시도 큐에 적재하거나 사용자에게 '완전한 로그아웃 실패, 네트워크 연결 후 재시도' 안내를 노출하라. 최소한 실패를 telemetry로 기록해 좀비 세션을 추적하라.

### continueAsGuest가 기존 세션 토큰을 정리하지 않아 게스트/세션 상태가 어긋날 수 있음

- **위치**: `apps/mobile/src/features/card-service/card-session-context.tsx:93-96` · **lane**: fe-gate-auth · **cat**: correctness
- **이유**: continueAsGuest()는 writeCardGuestOptIn() 후 phase만 ready로 바꾼다. sessionToken/isSignedIn은 건드리지 않는다. 정상 게이트 진입 경로에서는 토큰이 없지만, openGate()로 게이트를 다시 띄운 뒤(토큰이 아직 남아있는 상태에서) 사용자가 '비회원으로 계속'을 누르면 isSignedIn=true이면서 guest opt-in이 기록되는 모순 상태가 만들어질 수 있다. 이후 boot에서는 signedIn이 우선이라 가려지지만, 런타임 중에는 게스트 의도와 서버 세션이 공존한다.
- **수정**: continueAsGuest 진입 시 명시적으로 isSignedIn===false/sessionToken===null임을 보장하거나, 토큰이 있으면 게스트 전환을 막고 로그아웃을 먼저 요구하라.

### boot()의 비동기 setState에 unmount 가드가 없어 unmounted 컴포넌트 setState 경고/누수 가능

- **위치**: `apps/mobile/src/features/card-service/card-session-context.tsx:58-77` · **lane**: fe-gate-auth · **cat**: race-condition
- **이유**: useEffect(()=>{void boot()},[])에서 boot은 resolveCardServiceSession(네트워크 getAuthSession 포함)을 await한 뒤 setSessionToken/setSignedIn/setPhase를 호출한다. 느린 네트워크 도중 Provider가 언마운트되면 unmounted 상태에서 setState가 호출된다. 또한 boot 중복 호출(개발 모드 StrictMode 이중 실행)에 대한 가드도 없어 토큰 검증이 중복 수행될 수 있다.
- **수정**: let mounted=true; cleanup에서 mounted=false; 각 setState를 if(mounted)로 가드하라. AbortController로 getAuthSession 요청도 취소하라.

### consumeOAuthStateCookieValue의 invalid_state/provider 미스매치 시 잔여 entry를 모두 보존해 재사용 가능 상태로 남김

- **위치**: `apps/web/src/server/auth/oauth-state.ts:111-139` · **lane**: fe-gate-auth · **cat**: security
- **이유**: consume은 매칭된 단일 entry만 제거하고 나머지(remainingEntries)는 전부 다시 쿠키에 서명·보존한다(encodePayloadOrNull). 매칭 실패(잘못된 state/provider) 시에는 matchedEntry=null이고 모든 entry가 그대로 살아남아 nextCookieValue로 재발급된다. 즉 콜백을 잘못된 state로 여러 번 호출해도 합법 entry들이 소모되지 않고 TTL(10분) 동안 계속 살아있어, state 재생(replay) 공격 시도 창이 넓어진다. max 8개 entry 누적도 동일 사용자 다중 시도 시 오래된 pending state를 길게 보존한다.
- **수정**: provider별로 하나의 진행 중 state만 유지하거나, 콜백 처리 시 만료/실패한 entry를 적극적으로 정리하라. state 매칭 실패가 반복되면 해당 provider의 pending entry 전체를 폐기하는 것을 검토하라.

### 포트 패키지(packages/ui) 자체에 경계 eslint 미적용 — 포트가 플랫폼 의존을 들여도 못 막음

- **위치**: `packages/config/eslint/universal-ui-boundary.mjs:104-116` · **lane**: fe-universal-ui · **cat**: architecture
- **이유**: universalUiBoundary는 apps/web/eslint.config.mjs, apps/mobile/eslint.config.mjs 에서만 호출되고 packages/ui 에는 eslint.config 파일이 부재하다(find 결과 no matches). 현재 ports는 깨끗하지만(shared.ts/routes.ts/index.ts에 react-native/next/expo/@tanstack 실 import 0건), 포트/스크린 SSOT 본체가 platform import를 들여도 lint가 구조적으로 못 잡는다. SSOT를 지키는 장치가 정작 SSOT 패키지엔 없음.
- **수정**: packages/ui에도 동일 boundary(최소 react-native/next/expo/@tanstack 직접 import 금지)를 적용하는 eslint.config를 추가해 포트 본체의 순수성을 강제한다.

### web/mobile guest study-mode 저장 함수의 동기/비동기 비대칭(포트 Promise 계약과 미묘한 불일치)

- **위치**: `apps/web/src/features/card-service/runtime-adapters/card-item-repository.tsx:134-138` · **lane**: fe-universal-ui · **cat**: contract-drift
- **이유**: web setGuestCardStudyMode는 동기 함수다(guest-card-service-store.ts:131 `export function`). 웹 어댑터(line 136)는 이를 await 없이 호출하고 즉시 {studyMode}를 반환(fire-and-forget)해 localStorage 쓰기 완료/실패가 호출부에 전파되지 않는다. 반면 모바일은 `export async function setGuestCardStudyMode`(storage.ts:203)를 await한다(card-item-repository.ts:122). 양쪽 모두 컴파일은 통과하나 '저장 성공 후 반환' 의미가 drift한다.
- **수정**: web setGuestCardStudyMode를 Promise 반환(또는 어댑터에서 try/catch로 실패 전파)으로 맞춰 양 플랫폼이 '저장 성공 후 반환' 의미를 동일하게 갖도록 한다. 최소한 어댑터 주석으로 동기 저장임을 명시.

### star-lobby 게스트 세션 ID 폴백이 추측 가능한 타임스탬프 사용

- **위치**: `apps/web/src/app/star-lobby/_components/star-lobby-live-panel.tsx:215` · **lane**: x-security · **cat**: security
- **이유**: ensureGuestSessionId(line 211-219)는 createYeonRandomUUID()가 null을 반환하면 `guest-${getYeonNow()}` 폴백을 쓴다(line 215). 이 값은 밀리초 타임스탬프 기반이라 좁은 범위 무차별 추측이 가능하며, 위 \_shared.ts의 게스트 권한 모델과 결합하면 타 게스트 리소스 접근 가능성이 생긴다.
- **수정**: randomUUID 미지원 환경에서도 crypto.getRandomValues 기반의 충분한 엔트로피 폴백을 사용하고, 타임스탬프 폴백은 제거한다.

### 클라우드 통합 OAuth 콜백의 userId 바인딩이 세션과 암호학적으로 결합되지 않음

- **위치**: `apps/web/src/app/api/v1/integrations/_shared.ts:143-225` · **lane**: x-security · **cat**: security
- **이유**: OAuth start(handleOAuthStartRoute, line 143-177) 시 state(randomUUID)와 userId를 각각 별도 httpOnly 쿠키로 저장하고(line 154-167), 콜백(resolveOAuthCallbackContext, line 197-225)은 state==savedState만 검증(line 218)한 뒤 user 쿠키의 userId로 토큰을 저장한다. state/user 쿠키가 현재 인증 세션과 서명으로 묶여 있지 않아, 쿠키 고정/주입이 가능한 환경에서는 account-linking CSRF 여지가 남는다.
- **수정**: state를 현재 인증 세션과 HMAC으로 바인딩(예: 세션 토큰 해시를 state에 포함)하고, 콜백에서 현재 로그인 사용자와 user 쿠키의 userId 일치 여부를 함께 검증한다.

### public-check-session 토큰/제출 경로에 rate limit 부재

- **위치**: `apps/web/src/app/api/v1/public-check-sessions/[token]/submit/route.ts:25-76` · **lane**: x-security · **cat**: rate-limit
- **이유**: 공개(비인증) capability-URL 기반 체크인 제출 엔드포인트(POST, line 25-76)로, 토큰만 알면 호출 가능하다. BFF 라우트는 본문 검증과 Spring 위임만 하며 토큰/IP 기준 제출 빈도 제한이 보이지 않아 토큰이 유출되면 대량 위조 체크인/자원 소모 abuse가 가능하다.
- **수정**: 토큰·IP 기준 제출 rate limit과 동일 멤버 중복 제출 방지 윈도우를 추가한다.

### guest 프로필 식별 키가 무염(salt 없는) 절단 SHA-256

- **위치**: `apps/backend/src/main/java/world/yeon/backend/chat_service_auth/service/ChatServiceAuthService.java:120-123` · **lane**: x-security · **cat**: security
- **이유**: buildGuestPhoneNumber(line 120-123)는 (nickname password)의 SHA-256(hash, line 124-128)을 14 hex(GUEST_PHONE_KEY_LENGTH=14, 약 56비트)로 절단해 게스트 식별 키로 쓴다. 무염·고속 해시라 닉네임/비밀번호 조합 사전 공격으로 타 게스트 프로필에 충돌·가장될 여지가 있고, 56비트 절단으로 충돌 확률도 증가한다. 인증 경계로 쓰이는 값이라 기록한다.
- **수정**: 게스트 비밀번호는 per-record salt가 있는 KDF(Argon2/bcrypt)로 처리하고, 식별 키 절단을 제거하거나 충분한 길이를 유지한다.

### 타자방 로비가 포커스와 무관하게 2.5초 폴링 지속

- **위치**: `apps/web/src/features/typing-service/use-typing-room-lobby.ts:28` · **lane**: x-perf · **cat**: perf
- **이유**: useQuery에 refetchInterval: 2500이 무조건 설정되어(L28) 컴포넌트가 마운트된 동안 탭 비가시 상태에서도 2.5초마다 race-server로 HTTP 요청을 보낸다. enabled 게이팅이나 refetchIntervalInBackground:false가 없다.
- **수정**: refetchIntervalInBackground:false 확인 및 document.visibilityState/탭 활성 여부로 enabled를 게이팅하거나, 함수형 refetchInterval로 비활성 시 false 반환.

### 스프라이트 프레임 목록 렌더에서 frames.findIndex O(n^2)

- **위치**: `apps/web/src/features/sprite-editor/sprite-frame-editor.tsx:882-884` · **lane**: x-perf · **cat**: perf
- **이유**: visibleFrames.map 내부에서 frame마다 frames.findIndex(item=>item.id===frame.id)를 호출한다(L882-885). 프레임 수 N에 대해 O(N^2)이며 스프라이트 시트가 많은 프레임을 가질 때 매 렌더마다 비용이 커진다.
- **수정**: frames의 id→index Map을 useMemo로 1회 구성하고 map 내부에서 O(1) 조회한다.

## [NIT] 22건

### social provider 호출 에러를 System.err로만 로깅

- **위치**: `apps/backend/src/main/java/world/yeon/backend/root_auth/social/SocialIdentityProviderClient.java:125,132` · **lane**: be-auth-users · **cat**: error-handling
- **이유**: 확인됨. OAuth 토큰 교환/프로필 조회 실패를 line 125, 132에서 System.err.println으로만 남긴다. 운영 로깅 파이프라인(SLF4J)으로 들어가지 않아 추적/알람이 어렵고 포맷도 비표준이다.
- **수정**: org.slf4j.Logger로 교체해 WARN/ERROR 레벨로 status/provider/label을 구조화 로깅하라.

### normalizeString의 substring이 surrogate pair를 분리할 수 있음

- **위치**: `apps/backend/src/main/java/world/yeon/backend/root_auth/service/AuthSessionService.java:343-347` · **lane**: be-auth-users · **cat**: correctness
- **이유**: 확인됨. line 346 trimmed.substring(0, Math.min(trimmed.length(), maxLength))는 UTF-16 code unit 기준이라 이모지 등 surrogate pair 경계에서 잘리면 깨진 문자가 저장될 수 있다. displayName(80) 한계 근처 이름에서 발생 가능. SocialIdentityProviderClient.normalizeString(line 167-171)도 동일.
- **수정**: code point 경계를 고려해 자르거나(BreakIterator/codePoints) 길이 초과 시 거부하는 정책으로 정리하라.

### createUser의 사전 findByEmail 중복검사가 트랜잭션 밖이라 race 존재

- **위치**: `apps/backend/src/main/java/world/yeon/backend/users/service/UserService.java:46-57` · **lane**: be-auth-users · **cat**: transaction
- **이유**: 확인됨. createUser는 @Transactional이 아니며 findByEmail(line 46) 후 insertUser(line 50)를 별개로 호출한다. 사전 검사와 insert 사이 race로 두 요청이 동시 통과하면 unique 제약에 의존(isDuplicateEmailError로 처리됨). 사전 findByEmail은 정상 경로 쿼리 1회를 추가할 뿐 race를 막지 못한다.
- **수정**: 사전 findByEmail 중복검사를 제거하고 unique 제약 위반(23505) 처리에 일원화하거나, 작업 전체를 @Transactional로 묶어라.

### newPublicId가 prefix별 충돌 검증 없이 insert 직행(이론상 UUID 충돌 시 unique 위반 미처리)

- **위치**: `apps/backend/src/main/java/world/yeon/backend/card_rooms/service/CardRoomService.java:353-355` · **lane**: be-card-rooms · **cat**: error-handling
- **이유**: public_id는 UUID 기반이라 충돌 확률은 무시할 수준이지만, insert 시 unique index 위반(DuplicateKeyException)에 대한 재시도/한국어 매핑이 없어 만약 충돌·재실행 시 500이 그대로 노출된다. 다른 에러는 CardRoomServiceException으로 일관 처리하는데 DB 제약 위반만 누락이다.
- **수정**: insert 경로의 DuplicateKeyException을 잡아 재생성 재시도 또는 일관된 에러 코드로 변환하라.

### ObjectMapper를 인스턴스 필드로 직접 생성 (스프링 빈 미사용)

- **위치**: `apps/backend/src/main/java/world/yeon/backend/chat_service_ask/service/ChatServiceAskService.java:18` · **lane**: be-chat-service · **cat**: architecture
- **이유**: line 18: private final ObjectMapper objectMapper = new ObjectMapper(); 로 컨테이너가 관리하는 ObjectMapper 빈(애플리케이션 전역 직렬화 설정 적용본)을 우회해 새로 만든다. 직렬화 정책이 컨트롤러 응답과 달라질 수 있고 테스트에서 mock 주입도 어렵다.
- **수정**: 생성자 주입으로 스프링이 구성한 ObjectMapper 빈을 받는다.

### 차단 관계 조회 로직이 슬라이스마다 중복 구현됨

- **위치**: `apps/backend/src/main/java/world/yeon/backend/chat_service_feed/repository/ChatServiceFeedRepository.java:44-58` · **lane**: be-chat-service · **cat**: duplicate-code
- **이유**: listBlockedRelationIds(feed line 44-58)와 hasBlockedRelation(예: friend_requests line 25-36, chat_rooms line 119-131) 양방향 차단 조회 쿼리가 feed/ask/chat_rooms/friend_requests/friends_overview 등 거의 모든 슬라이스 레포지토리에 동일 SQL로 복붙되어 있다. 한 곳에서 조건(예: 양방향 처리)을 바꾸면 다른 곳과 drift가 생기기 쉽다.
- **수정**: 차단 관계 조회를 공용 컴포넌트(예: ChatServiceBlockRelationReader)로 추출해 각 슬라이스가 재사용하도록 하되, 슬라이스 경계 규칙을 지키는 위치(공유 read 모듈)에 둔다.

### HomeInsightBannerRepository에 사용하지 않는 BigInteger import

- **위치**: `apps/backend/src/main/java/world/yeon/backend/home_insight_banners/repository/HomeInsightBannerRepository.java:4` · **lane**: be-community-misc · **cat**: dead-code
- **이유**: line 4에서 java.math.BigInteger를 import하지만 파일 어디에서도 사용하지 않는다(asOffsetDateTime은 Timestamp/Instant/Date/LocalDateTime/ZonedDateTime만 처리하고, 이 파일엔 asLong 메서드가 없다). 다른 repository의 asLong 패턴에서 복붙된 잔여물로 보인다.
- **수정**: 미사용 import를 제거한다.

### normalizeMemoText가 동일 정규화를 여러 번 반복 계산

- **위치**: `apps/backend/src/main/java/world/yeon/backend/activity_logs/service/ActivityLogService.java:67-70` · **lane**: be-community-misc · **cat**: perf
- **이유**: normalizeMemoText(line 69)는 raw.replaceAll(\\s+, ' ').trim()을 substring 대상과 length 계산에서 거듭 다시 수행한다(정규식 치환 반복). 결과는 정확하나 최대 2000자 입력에 대해 불필요한 반복 작업이다.
- **수정**: 정규화 결과를 지역 변수에 한 번 담은 뒤 그 변수로 length/substring을 계산한다.

### HomeInsightBanner dismiss가 잘못된 banner key를 IllegalArgument->일반 400으로만 처리(서비스 예외 패턴 불일치)

- **위치**: `apps/backend/src/main/java/world/yeon/backend/home_insight_banners/service/HomeInsightBannerService.java:23-31` · **lane**: be-community-misc · **cat**: validation
- **이유**: dismiss(line 24)는 bannerKey null과 미허용 키를 같은 IllegalArgumentException('배너 dismiss 요청 값이 올바르지 않습니다.')으로 묶어 던지고 컨트롤러가 일반 INVALID_REQUEST 400으로 매핑한다. 동작은 맞지만 다른 도메인이 쓰는 {status,code,message} 서비스 예외 규약과 어긋나 code가 일반화되고, null vs 미허용 키 구분이 없어 클라이언트 디버깅이 어렵다.
- **수정**: 전용 서비스 예외(code 구체화)로 통일하거나 최소한 null vs 미허용 키를 구분하는 메시지를 제공한다.

### 공유 자원이 아닌 인스턴스 필드 HttpClient/ObjectMapper 다중 생성

- **위치**: `apps/backend/src/main/java/world/yeon/backend/sheet_integrations/service/SheetIntegrationService.java:41-42` · **lane**: be-members-spaces · **cat**: perf
- **이유**: 서비스/리포지터리마다 new ObjectMapper().findAndRegisterModules()를 개별 생성한다(SheetIntegrationService 라인 42, MemberFieldValueReadService 라인 19, MemberFieldValueWriteService 라인 25, SpaceTemplateWriteService 라인 32 등 다수). ObjectMapper는 thread-safe하고 비용이 큰 객체라 Bean으로 주입해 재사용하는 것이 표준이다. HttpClient도 인스턴스 필드로 생성된다(라인 41).
- **수정**: 공용 ObjectMapper @Bean(또는 Spring 기본 Jackson Bean) 주입으로 통일한다.

### space 기간 비교를 문자열 사전식 비교로 처리

- **위치**: `apps/backend/src/main/java/world/yeon/backend/spaces/service/SpaceService.java:212-214` · **lane**: be-members-spaces · **cat**: correctness
- **이유**: compareSpaceDateStrings는 left.compareTo(right) 문자열 비교다(라인 212-214). isSpaceDateString이 'YYYY-MM-DD' 형식을 강제하므로 현재는 동작하지만, 형식 검증과 비교가 분리돼 있어 한쪽만 바뀌면 깨질 수 있는 암묵적 결합이다. normalizeDate는 10자만 자르고(라인 130-132) 형식 보장은 isSpaceDateString에 의존한다.
- **수정**: LocalDate.parse 후 LocalDate.isBefore로 비교해 의미를 명확히 한다.

### OAuth/Drive 서비스가 매 인스턴스마다 HttpClient/ObjectMapper를 새로 생성한다

- **위치**: `apps/backend/src/main/java/world/yeon/backend/googledrive_browser/service/GoogleDriveBrowserService.java:36-37` · **lane**: be-oauth-drive · **cat**: perf
- **이유**: @Service 싱글톤이라 인스턴스당 1회 생성이라 치명적이진 않으나, line 36-37처럼 4개 서비스가 각자 HttpClient(스레드풀/커넥션풀)와 ObjectMapper를 따로 만든다(OneDriveBrowserService line 30-31 등). 공용 빈으로 공유하면 리소스 사용과 타임아웃 정책 일관성이 좋아진다.
- **수정**: 공용 HttpClient/ObjectMapper 빈을 정의해 주입하고, 타임아웃 등 정책을 한 곳에서 관리한다.

### Google Drive 파일 size를 int로 파싱해 2GB 초과 파일에서 오버플로/0 처리된다

- **위치**: `apps/backend/src/main/java/world/yeon/backend/googledrive_browser/service/GoogleDriveBrowserService.java:65, 179` · **lane**: be-oauth-drive · **cat**: correctness
- **이유**: line 65에서 parseInt(file.path("size").asText("0"))로 size를 int로 파싱하고(line 179 parseInt 정의), GoogleDriveFileResponse DTO 필드도 int size다. Google Drive 파일 크기는 long(2GB 초과 가능)인데 int로 처리하면 parseInt 예외→0으로 떨어지거나 잘못된 값이 된다. OneDriveBrowserService(line 58 asInt)도 동일 한계가 있다.
- **수정**: 파일 크기를 long으로 파싱/전달하고 DTO 필드도 long으로 맞춘다.

### sendEnd가 노출되지만 어디에서도 호출되지 않는 dead code

- **위치**: `apps/mobile/src/features/card-service/rooms/use-card-room-connection.ts:132-135` · **lane**: fe-card-rooms · **cat**: dead-code
- **이유**: connection.sendEnd는 훅 반환값/메모 의존성에 포함되지만(132-135, 149, 162) card-room-screen 등 모바일 어디서도 사용되지 않는다. 정작 필요한 sendLeave는 모바일 훅에 없어 비대칭이다(웹은 sendLeave까지 노출).
- **수정**: 실제 종료 흐름(호스트 종료 UI)을 붙이거나 미사용이면 제거. 동시에 누락된 sendLeave를 추가해 web 훅과 표면을 맞춘다.

### normalizeConnectionError 패턴 배열이 웹과 중복 정의(SSOT 부재) — drift 위험

- **위치**: `apps/mobile/src/features/card-service/rooms/use-card-room-connection.ts:16-31` · **lane**: fe-card-rooms · **cat**: naming
- **이유**: CARD_ROOM_NETWORK_ERROR_PATTERNS와 normalize 로직(16-31)이 웹 use-card-room.ts:28-47과 거의 글자까지 동일하게 복제돼 있다. 한쪽 문구/패턴이 바뀌면 다른 쪽과 어긋나는 유지보수 부채.
- **수정**: 패턴/정규화 함수를 packages/race-shared 또는 공용 util로 추출해 웹·모바일이 공유하도록 SSOT화.

### 호스트가 아닌 사용자의 시작 버튼이 서버 거부에만 의존(낙관적 검증 부재)

- **위치**: `apps/mobile/src/features/card-service/rooms/card-room-screen.tsx:122-128` · **lane**: fe-card-rooms · **cat**: validation
- **이유**: 웹은 canStart로 역할/준비/카드수 조건을 클라이언트에서 계산해 시작 버튼을 비활성화한다(card-room-screen.tsx:99-111). 모바일 handleStart는 isHost만 알럿으로 막고(122-126) 나머지(MEMORIZER/CHECKER 각 1명, 전원 ready, 카드 존재)는 검증 없이 sendStart하여 서버 에러에 의존한다. 잘못된 시작 시도 시 사용자 피드백이 일관되지 않다.
- **수정**: web canStart와 동등한 조건을 계산해 시작 버튼 disabled/안내 처리하여 UX·검증을 일치.

### handleOpenRegister가 인증 base URL로 외부 브라우저를 열고 실패를 조용히 무시

- **위치**: `apps/mobile/src/features/card-service/card-onboarding-gate.tsx:113-122` · **lane**: fe-gate-auth · **cat**: error-handling
- **이유**: WebBrowser.openBrowserAsync(`${getMobileApiBaseUrl()}/auth/register`)로 회원가입 페이지를 일반 브라우저에서 연다. 회원가입 후 세션은 일반 브라우저 쿠키에 생기고 앱과 연동되지 않아 사용자가 회원가입해도 앱으로 자동 로그인 복귀가 없다(딥링크 콜백 미사용). 또한 오픈 실패를 catch{}로 완전히 삼켜 사용자에게 아무 피드백이 없다.
- **수정**: 회원가입도 mobileReturnUrl 딥링크 플로우로 통일하거나, 최소한 브라우저 오픈 실패 시 안내 alert를 노출하라.

### providerErrorDescription을 console.error로 로깅 — 공급자 에러 설명에 민감정보 유입 가능

- **위치**: `apps/web/src/server/auth/handlers.ts:199-203` · **lane**: fe-gate-auth · **cat**: security
- **이유**: completeSocialAuth는 공급자 error_description(공격자/공급자 제어 문자열)을 그대로 console.error로 남긴다. 일반적으로 무해하나, 로그 인젝션(개행 포함 문자열로 로그 위변조)이나 PII 유입 경로가 될 수 있다.
- **수정**: 로깅 전 error_description을 길이 제한·개행 제거 등으로 새니타이즈하거나, 코드(error)만 로깅하라.

### card-deck index.ts 와 index.native.ts 가 글자 그대로 동일 — 분리 파일 유지의 실익 없음(silent drift 위험)

- **위치**: `packages/ui/src/runtime/ports/card-deck/index.native.ts:1-6` · **lane**: fe-universal-ui · **cat**: architecture
- **이유**: diff 확인 결과 card-deck/index.ts 와 index.native.ts 가 byte-identical(둘 다 동일한 5개 export \* 줄)이다. card-rooms/typing-service/room-voice-call/life-os 및 ports 루트의 index.native.ts 모두 동일하게 IDENTICAL로 확인됨. 플랫폼 분기가 실제로 없는데 .native 변형을 둬서, 한쪽만 export를 추가하면 metro/webpack가 다른 파일을 픽해 플랫폼별 포트 표면이 조용히 갈릴 수 있다.
- **수정**: 플랫폼 분기가 불필요한 배럴은 index.native.ts를 제거(metro가 index.ts로 폴백)하거나, 의도적으로 분리한다면 'web/native 동일 유지' 테스트(파일 동등성 assert)를 추가해 한쪽만 바뀌는 drift를 차단한다.

### 커스텀 탭 렌더에서 필드마다 values.find 선형 탐색

- **위치**: `apps/web/src/features/student-management/components/custom-tab-content.tsx:128-129` · **lane**: x-perf · **cat**: perf
- **이유**: visibleFields.map 내부에서 field마다 values.find(v=>v.fieldDefinitionId===field.id)를 호출해(L128-129) O(fields×values)다. 필드/값 수가 늘면 수강생 카드 렌더마다 비용이 누적된다(여러 카드가 동시에 그려지는 보드에서 합산).
- **수정**: values를 fieldDefinitionId 키 Map으로 useMemo 변환 후 O(1) 조회로 바꾼다.

### 커뮤니티 채팅 폴링이 매 6초 전체 윈도우 재조회(증분 없음)

- **위치**: `apps/web/src/features/community/hooks/use-community-chat.ts:35-39` · **lane**: x-perf · **cat**: perf
- **이유**: messagesQuery가 refetchInterval: pollIntervalMs(기본 6000)로 communityChatApi.listMessages()를 호출해 최신 메시지 윈도우 전체를 다시 가져온다(L35-39, since/cursor 없음). 활성 사용자가 많을수록 동일 데이터 반복 전송과 매 폴링 후 정렬·리렌더 비용이 누적된다.
- **수정**: 마지막 createdAt 이후 증분 조회(since 파라미터) 또는 SSE/WebSocket로 전환하고, 변화 없을 때 캐시 갱신을 건너뛴다.

### counseling 전이 감지 useEffect의 records.find O(n^2)

- **위치**: `apps/web/src/features/counseling-record-workspace/hooks/use-counseling-record-server-records.ts:56-60` · **lane**: x-perf · **cat**: perf
- **이유**: serverData.records.filter 내부에서 prev.records.find(p=>p.id===item.id)를 호출해(L56-59) 폴링 갱신마다 O(records^2) 비교를 수행한다. 레코드가 많고 부스트 폴링 중이면 매 폴링마다 반복된다.
- **수정**: prev.records를 id→record Map으로 만든 뒤 filter에서 O(1) 조회한다.
