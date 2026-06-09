# SOLID / 예외 원칙 300개 감사 백로그

## 배경

사용자 지시: SOLID 원칙(SRP/OCP/LSP/ISP/DIP)과 예외 처리 원칙 10개를 모두 지키도록, 지켜지지 않는 곳은 고치고 적용하면 좋은 곳을 300개 찾아 리스트업한다.

## 범위

- 유지보수 대상 서비스: 카드(`card-service`), 타자(`typing-service`), 커뮤니티(`community`) 및 공유 패키지/공통 런타임.
- 상담 워크스페이스는 프로젝트 동결 정책에 따라 신규 리팩토링/수정 대상에서 제외한다.

## 차수 1

### 작업내용

- 정적 검색과 파일 근거로 300개 TODO를 수집한다.
- 안전한 소규모 개선은 같은 브랜치에서 바로 적용한다.

### 논의 필요

- 300개 전체를 한 번에 코드 수정할 경우 회귀 위험이 크므로, 이번 차수는 공식 항목화와 저위험 수정으로 제한할지 여부.

### 선택지

- 선택지 1: 300개 전체를 즉시 대규모 수정한다.
- 선택지 2: 300개를 공식 백로그로 만들고, 저위험/반복성 높은 항목부터 일부 수정한다.
- 선택지 3: 300개를 서비스별 후속 이슈로 쪼갠다.

### 추천

- 선택지 2. 현재 제품 코드가 넓고 web/mobile/backend를 모두 건드리므로, 먼저 근거 있는 300개 항목을 공식화하고 자동 검증 가능한 저위험 개선부터 적용한다.

### 사용자 방향

- 추천 기준으로 진행.

## 이번 차수 적용 완료

- `AuthSessionServiceException`에 cause 보존 생성자를 추가해 원래 예외 정보를 잃지 않게 했다.
- `AuthTokenHasher`의 HMAC 실패 처리를 `Exception`에서 `GeneralSecurityException`으로 좁히고 cause를 보존했다.
- `CardRoomParticipantTokenService`와 `TypingRaceSeedSigner`의 HMAC 실패 처리를 `GeneralSecurityException`으로 좁혔다.
- `SocialIdentityProviderClient`의 OAuth provider 호출 실패를 `InterruptedException`/`JsonProcessingException`/`IOException`으로 나누고, 인터럽트 복원 및 cause 보존을 적용했다.

## 2차 적용 완료

- `TypingCharacterFrameRepository`의 JSON 역직렬화/직렬화 실패 처리를 `Exception`에서 `JsonProcessingException`으로 좁혔다.
- 모바일 카드 온보딩/세션/게스트 선택 저장소의 빈 catch를 원인 로그와 사용자 안내 또는 fallback 기록으로 바꿨다.
- race-server JSON body 파싱 실패에서 원래 오류를 `cause`로 보존했다.
- 웹 카드 인증 상태 refresh와 카드 서비스 에러 메시지 JSON 파싱에서 예외를 숨기지 않도록 원인 로그 또는 `SyntaxError` 한정 처리로 바꿨다.
- 웹 카드 편집 draft/profile/size/YouTube 파싱은 예상 가능한 `SyntaxError`/`TypeError`만 fallback하고 그 외 예외는 다시 던지도록 바꿨다.
- 웹 카드 HEIC 변환 실패는 사용자 메시지와 함께 원래 오류를 `cause`로 보존하도록 바꿨다.
- 웹 카드 클립보드 이미지 읽기와 커뮤니티 게스트/presence 실패는 원인 로그를 남기도록 바꿨다.

## 3차 적용 완료

- 항목 24~36 완료: 웹 타자 서비스의 빈 catch를 제거하고, 초대 링크 복사·오류 응답 파싱·캐릭터 프레임 fallback·레이스 사용자 토큰 fallback·로컬 저장소 fallback·룸 cleanup/퇴장 fallback·레이스 seed fallback에 원인 로그를 추가했다.
- UX fallback은 유지하되 `E3`(예외 숨김 금지)와 `E7`(원래 예외 정보 보존)을 만족하도록 실패 원인을 `console.warn`에 남긴다.

## 4차 적용 완료

- 항목 37~47 완료: API client 오류 응답 파싱, Mermaid 렌더링 fallback, UI runtime localStorage/sessionStorage 및 루프 오디오 fallback에서 빈 catch를 제거했다.
- 공용 패키지 경계를 유지하며 앱 의존을 추가하지 않고, fallback 원인을 `console.warn`으로 남겨 `E3`(예외 숨김 금지)와 `E7`(원래 예외 정보 보존)을 강화했다.

## 5차 적용 완료

- 항목 48 완료: `card-room.ts`에서 Spring backend base URL, internal token/participant header, JSON fetch/오류 응답 처리 책임을 `card-room-backend-client.ts`로 분리했다. Room 클래스는 realtime room state/protocol/voice session 조정에 집중한다.
- 항목 60 완료: `card-room.ts`의 직접 `fetch` 의존을 제거하고 카드방 backend client 함수(`loadCardRoomDetail`, `requestCardRoomBackend`) 뒤로 숨겼다.

## 6차 적용 완료

- 항목 49 완료: `typing-race-room.ts`에서 Spring backend base URL, internal token header, experience award fetch 책임을 `typing-race-room-backend-client.ts`로 분리했다. Room 파일은 seed/protocol/state/voice session 조정에 더 집중한다.
- 항목 61 완료: `typing-race-room.ts`의 직접 `fetch` 의존을 제거하고 typing race backend client 함수(`awardTypingRaceFinished`) 뒤로 숨겼다.

## 7차 적용 완료

- 항목 59 완료: `TypingDeckService`의 Spring 운영 생성자를 단일 public 생성자로 정리하고 `@Autowired` 의존을 제거했다. 테스트 전용 기본 signer 구성은 이름 있는 정적 팩토리(`createForTest`)로 분리해 운영 DI 경계와 테스트 편의 책임을 구분했다.

## 8차 적용 완료

- 항목 63 완료: `useTypingRoomLobby`에서 race-server endpoint 해석과 public waiting room HTTP 로더 조합을 제거하고 `typing-room-lobby-client.ts`의 `loadTypingRoomLobbyRooms`로 분리했다. 훅은 query 상태/표시 상태 조합에 집중한다.

## 9차 적용 완료

- 항목 71~78 완료: 모바일 카드 상세 화면의 deckId 누락/일괄 입력 파싱 실패를 `CardDeckDetailInputError`와 operation별 guard로 변환했다. 반복 `덱 ID가 없습니다.`/`인식할 수 있는 카드가 없습니다.` 대신 실패 동작과 원인(경로 deckId 누락, 인식된 카드 0장, 필요 마커)을 메시지에 포함한다.

## 10차 적용 완료

- 항목 79~83 완료: 모바일 카드 상세 화면의 반복 catch 분기를 `getCardDetailErrorMessage`로 통합했다. `Error`는 원 메시지를 보존하고, string/기타 unknown 값은 fallback 메시지에 원인 문자열을 붙여 예외 정보를 숨기지 않게 했다.

## 11차 적용 완료

- 항목 84 완료: 모바일 카드 덱 목록 화면의 덱 생성 catch와 목록 query error 메시지 변환을 `getCardDeckListErrorMessage`로 통합했다. `Error`는 원 메시지를 보존하고 string/기타 unknown 값은 fallback 메시지에 원인 문자열을 붙인다.

## 12차 적용 완료

- 항목 85~87 완료: 모바일 카드 학습 화면의 deckId 누락과 비회원 덱 미존재 오류를 `CardDeckPlayInputError`와 operation별 guard로 변환했다. 학습 상세 조회/비회원 상세 조회/복습 저장 실패 메시지에 실패 동작과 경로 deckId 누락 또는 저장소 미존재 원인을 포함한다.

## 13차 적용 완료

- 항목 88~89 완료: 모바일 카드 온보딩 게이트의 이메일/소셜 로그인 catch 메시지 변환을 `getCardLoginErrorMessage`로 통합했다. `Error`는 원 메시지를 보존하고 string/기타 unknown 값은 fallback 메시지에 원인 문자열을 붙인다.

## 14차 적용 완료

- 항목 90~91 완료: 모바일 카드 세션 검증 catch를 401/403 만료 세션과 처리 불가 오류로 분리했다. 처리 불가 세션 검증 실패는 원인을 보존한 `CardServiceSessionResolutionError`로 변환하고 boot 경계에서 알림/콘솔로 드러낸다. `useCardSession` Provider 누락도 `MissingCardSessionProviderError`로 구체화했다.

## 15차 적용 완료

- 항목 92~94 완료: 모바일 마크다운 이미지 첨부 catch 메시지를 `getImageAttachmentErrorMessage`로 통합해 Error/string/기타 unknown 원인을 보존했다. 카드방 생성 입력 검증은 `CardRoomCreateInputError`로 변환하고, 생성 catch는 `getCardRoomCreateErrorMessage`로 unknown 원인을 숨기지 않게 했다.

## 16차 적용 완료

- 항목 95~99 완료: 모바일 카드방 입장/실시간 연결 catch 메시지 변환을 helper로 분리하고 cleanup leave 실패를 콘솔에 남기도록 바꿨다. race-server 스타 로비 이벤트와 카드방 join/leave/request 오류는 원인을 보존한 메시지 helper와 `CardRoomJoinValidationError`로 변환했다.

## 17차 적용 완료

- 항목 100~108 완료: race-server 카드방 leave/request catch는 16차 helper 반영 상태를 확인해 완료 처리했고, typing-race-room의 기존 catch 후보는 현재 코드에서 제거된 상태를 확인했다. 웹 커뮤니티 404 catch는 처리 가능한 Spring 404만 null로 변환하고 나머지는 재전파하는 경계로 유지했다. 웹 카드 인증 Provider 누락, 카드방 생성/입장, 게스트 덱 개수 확인 실패는 원인을 포함한 helper/전용 Error/사용자 실패 메시지로 구체화했다.

## 46차 적용 완료

- 항목 201 완료: 모바일 `CardRoomScreen`의 헤더, 참가자, 대기 컨트롤, 학습 카드, 완료 패널, 채팅 렌더링 섹션을 `card-room-screen-sections.tsx`로 이동하고 스타일을 `card-room-screen-styles.ts`로 분리했다. Screen 파일은 입장/연결 상태와 섹션 조립만 담당하게 축소했다.

## 45차 적용 완료

- 항목 200 완료: 모바일 `CardRoomLobbyScreen`의 카드방 목록 조회, 필터/검색 파생 상태, 카드방 라우팅, 생성 sheet 열림 상태를 `card-room-lobby-state.ts`로 이동했다. Header/filter/search/list/card UI는 `card-room-lobby-sections.tsx`, 스타일은 `card-room-lobby-styles.ts`, route helper는 `card-room-lobby-route.ts`로 분리해 screen 컴포넌트는 로비 섹션 조립만 담당한다.

## 44차 적용 완료

- 항목 199 완료: 모바일 `CardRoomCreateSheet`의 덱 조회, 생성 body 구성, 게스트 덱 스냅샷 변환, 참가자 토큰 저장, 오류 표시 부수효과를 `use-card-room-create-sheet-state.ts` hook으로 이동했다. 덱/공개범위 선택 UI와 스타일은 section/style 파일로 분리해 sheet 컴포넌트는 bottom sheet form 조립만 담당한다.

## 43차 적용 완료

- 항목 198 완료: 모바일 `MarkdownTextField`의 선택 상태/업로드/서식 삽입 부수효과를 전용 controller hook으로 이동하고, 마크다운 서식 helper·툴바·스타일을 별도 파일로 분리했다. 화면 컴포넌트는 컨트롤러 연결과 `TextField` 조립만 담당한다.

## 42차 적용 완료

- 항목 197 완료: 모바일 `CardSessionProvider`의 세션 boot/authenticate/guest/logout 상태 전이와 query/cache/storage 부수효과를 `use-card-session-state.ts` hook으로 분리했다. Context 파일은 Provider 연결과 `useCardSession` 접근 가드만 담당한다.

## 41차 적용 완료

- 항목 196 완료: 모바일 `CardOnboardingGate`의 이메일 로그인 mutation, 소셜 로그인, 회원가입 브라우저 오픈, 입력/sheet 상태를 `use-card-onboarding-gate-state.ts` hook으로 분리했다. 게이트 화면은 62라인 렌더링 조립 책임으로 축소했다.

## 40차 적용 완료

- 항목 195 완료: 모바일 `CardOnboardingGate`의 hero/social/secondary/guest/email sheet 렌더링 섹션과 스타일을 `card-onboarding-gate-sections.tsx`, `card-onboarding-gate-styles.ts`로 분리했다. 게이트 파일은 인증 상태와 액션 조정 중심으로 축소했다.

## 39차 적용 완료

- 항목 193 완료: 모바일 카드 학습 화면의 세션/query/mutation/학습 상태 hook 호출을 `use-card-deck-play-state.ts`로 분리했다.
- 항목 194 완료: 기존 긴 화면 함수에서 검증/변환/부수효과와 이동/복습 이벤트를 hook으로 옮겨 화면 파일을 124라인 렌더링 조립 책임으로 축소했다.

## 38차 적용 완료

- 항목 192 완료: `card-deck-play-screen.tsx`의 입력 검증/모드 배지 helper와 학습 모드 패널 렌더링을 별도 파일로 분리했다. 화면은 세션/query/mutation 상태 조정에 집중하고, 복습/플래시카드 UI 조립은 `card-deck-play-mode-panels.tsx`가 담당한다.

## 37차 적용 완료

- 항목 191 완료: 모바일 `CardDeckListScreen`의 헤더, 이어서 학습 카드, 게스트 동기화 배너, 덱 목록 상태 분기, 생성 바텀시트를 `card-deck-list-sections.tsx` 섹션 컴포넌트로 분리했다.
- 화면 함수는 `useCardDeckListState` 결과와 섹션 컴포넌트를 조립하는 52라인 컴포넌트로 축소되어 긴 렌더링/조건 분기 책임을 제거했다.
- 모바일 카드 서비스 변경에 따라 모바일 lint/typecheck와 parity 검증을 수행한다.

## 36차 적용 완료

- 항목 190 완료: 모바일 `CardDeckListScreen`의 query, create mutation, create sheet 상태, session/repository 조립, navigation handler를 `useCardDeckListState` hook으로 분리했다.
- 화면 컴포넌트는 `useCardDeckListState` 결과를 받아 헤더/배너/목록/바텀시트를 렌더링하고, 데이터·폼·이벤트 부수효과는 hook이 담당한다.
- 모바일 카드 서비스 변경에 따라 모바일 lint/typecheck와 parity 검증을 수행한다.

## 35차 적용 완료

- 항목 189 완료: 기존 `CardDeckListScreen` 내부 `DeckCard`는 34차에서 `card-deck-list-deck-card.tsx` 전용 컴포넌트로 분리되어 화면 hook/쿼리/생성 상태와 카드 행 렌더링 책임이 분리된 상태임을 확인했다.
- `DeckCard`는 hook 호출 없이 `deck`, `index`, `onOpen` props와 카드 이미지/메타 렌더링만 담당하고, 화면 파일은 query/session/create sheet 흐름을 소유한다.
- 현재 코드 근거를 백로그와 작업 로그에 반영하고 docs/SSOT 검증을 수행한다.

## 34차 적용 완료

- 항목 188 완료: 모바일 `CardDeckListScreen`의 덱 카드 렌더링, 홈 이미지 에셋, 스타일 선언을 각각 `card-deck-list-deck-card.tsx`, `card-deck-list-assets.ts`, `card-deck-list-screen.styles.ts`로 분리했다.
- 목록 화면 파일은 세션/쿼리/생성 sheet 흐름과 화면 조립에 집중하고, 반복 카드 행과 스타일/에셋 책임은 전용 모듈이 담당한다.
- 모바일 카드 서비스 변경에 따라 모바일 lint/typecheck와 parity 검증을 수행한다.

## 33차 적용 완료

- 항목 187 완료: 모바일 `CardDeckDetailScreen`의 mutation, 입력 검증, 캐시 무효화, alert 부수효과, submit/delete handler를 `useCardDeckDetailActions` hook으로 분리했다.
- 세션 bootstrap 부수효과를 `useCardServiceResolvedSession` hook으로 분리해 화면 함수는 repository/query/action hook 결과와 렌더링 조립에 집중하게 했다.
- 모바일 카드 서비스 변경에 따라 모바일 lint/typecheck와 parity 검증을 수행한다.

## 32차 적용 완료

- 항목 186 완료: 모바일 `CardDeckDetailScreen`의 수동/일괄 입력값, sheet 모드/상태, 활성 카드 메뉴 상태를 `useCardDeckDetailSheetState` hook으로 분리했다.
- 화면 컴포넌트는 sheet 상태와 이벤트 액션을 hook 결과로 사용하고, 상태 초기화/편집 sheet 준비/메뉴 토글 책임은 hook이 담당한다.
- 모바일 카드 서비스 변경에 따라 모바일 lint/typecheck와 parity 검증을 수행한다.

## 31차 적용 완료

- 항목 185 완료: 모바일 `CardDeckDetailScreen`의 상세 조회 `useQuery`와 view-state 파생 책임을 `useCardDeckDetailQuery` hook으로 분리했다.
- 화면 컴포넌트는 `cardCount`/`detailState`/`listItems` 결과를 사용해 렌더링하고, 쿼리 key·enabled·오류 메시지 변환은 hook이 담당한다.
- 모바일 카드 서비스 변경에 따라 모바일 lint/typecheck와 parity 검증을 수행한다.

## 30차 적용 완료

- 항목 184 완료: 모바일 `CardDeckDetailScreen`에서 카드 row 렌더링/메뉴 이벤트 책임을 `DeckCardRow` 전용 컴포넌트 파일로 분리했다.
- 상세 화면은 세션/쿼리/mutation/시트 상태 흐름에 집중하고, 카드 row 표시와 `CardMarkdown` 렌더링은 `card-deck-detail-card-row.tsx`가 담당한다.
- 모바일 카드 서비스 변경에 따라 모바일 lint/typecheck와 parity 검증을 수행한다.

## 29차 적용 완료

- 항목 183 완료: `TypingDeckService`의 응답 DTO 조립 책임을 `TypingDeckResponseMapper` Spring 컴포넌트로 분리했다.
- `TypingDeckService`는 목록/상세/생성/수정/삭제/seed 유스케이스 흐름과 권한 검증에 집중하고, `TypingDeckDto`/`TypingDeckPassageDto` 변환은 mapper에 위임한다.
- Spring bean 추가에 따라 타자 덱 도메인 테스트와 ApplicationContext 부팅 검증을 수행한다.

## 28차 적용 완료

- 항목 182 완료: `TypingDeckRepository`의 native query row 조립 책임을 `TypingDeckRowMapper` Spring 컴포넌트로 분리했다.
- `TypingDeckRepository`는 SQL 조립/파라미터 바인딩/저장소 접근에 집중하고, `TypingDeckRow`/`TypingDeckListRow`/`TypingDeckPassageRow` 변환은 mapper에 위임한다.
- Spring bean 추가에 따라 타자 덱 도메인 테스트와 ApplicationContext 부팅 검증을 수행한다.

## 27차 적용 완료

- 항목 181 완료: `AuthSessionService`에서 세션 토큰 발급, 만료시각 계산, 세션 저장, 출석 경험치 적립 책임을 `AuthSessionIssuer` Spring 서비스로 분리했다.
- 추가 보강: `root_auth`가 `credential_auth` concrete token factory에 의존하지 않도록 `AuthSessionTokenGenerator` 포트를 추가하고 `AuthSessionTokenFactory`가 구현하게 했다.
- `AuthSessionService`는 세션 조회/소셜 인증/dev-login/admin 확인 유스케이스 순서에 집중하고, 세션 발급 side effect는 전용 issuer에 위임한다.
- Spring bean 추가에 따라 인증 도메인 테스트와 ApplicationContext 부팅 검증을 수행한다.

## 26차 적용 완료

- 항목 180 완료: `AuthSessionRepository`의 native query row 매핑 책임을 `AuthSessionRowMapper` Spring 컴포넌트로 분리했다.
- `AuthSessionRepository`는 SQL 실행/파라미터 바인딩/저장소 접근에 집중하고, `SessionRow`/`UserRow`/`IdentityRow` 조립은 mapper에 위임한다.
- Spring bean 추가에 따라 인증 도메인 테스트와 ApplicationContext 부팅 검증을 수행했다.

## 25차 적용 완료

- 항목 179 완료: `CardRoomService`에서 public id 생성/중복 재시도 책임을 `CardRoomPublicIdService`로 분리했다.
- 항목 179 완료: 카드방 참가자 응답의 participant token 조립 책임을 `CardRoomParticipantResponseFactory`로 분리했다.
- Spring bean 추가에 따라 `CardRoomServiceTests` fixture를 새 의존성 조합으로 갱신하고 ApplicationContext 부팅 검증을 수행했다.

## 24차 적용 완료

- 항목 175~178 완료: `CardDeckDetailScreen`의 생성/일괄추가/일괄덮어쓰기/수정/삭제/상세조회 오류 메시지 분기를 `getCardServiceErrorMessage` 공용 어댑터로 이동했다.
- 추가 적용: 모바일 카드 서비스의 목록, 온보딩, 세션, 이미지 첨부, 학습 화면, 카드방 생성/입장/연결 오류 메시지 분기도 같은 어댑터를 사용하게 정리했다.
- 예외 원칙 보강: 화면 컴포넌트가 `unknown` 오류 타입을 직접 판별하지 않고, 메시지는 fallback과 원인을 함께 포함하도록 통일했다.

## 23차 적용 완료

- 항목 161~166 완료: `AuthSessionRepository`의 native query row/time/UUID 변환 책임을 저장소 내부 분기에서 공용 `NativeQueryRow`/`NativeQueryValue` 어댑터 의존으로 끌어올렸다.
- 항목 167~174 완료: `TypingDeckRepository`의 `Object[]`, `Number`, 시간 타입별 `instanceof` 변환 분기를 제거하고 같은 공용 native query 값 어댑터를 사용하도록 변경했다.
- 예외 원칙 보강: native row 컬럼 부족 메시지에 필요한/실제 컬럼 수와 컬럼 label을 남겨 원인 추적 가능성을 높였다.

## 22차 적용 완료

- 항목 151~160 완료: 카드/커뮤니티/인증 Spring repository의 native query 날짜·UUID·row 변환을 `NativeTimeValueReader`, `NativeValueReader`, `NativeQueryRow/Value` 어댑터로 분리했다. repository 매핑 메서드는 row/value 추상화에 의존하게 하고, 하위 타입별 변환은 작은 reader 목록으로 확장 가능하게 정리했다. row 컬럼 부족 오류는 필요한/실제 컬럼 수와 위치를 포함한다.

## 21차 적용 완료

- 항목 141~150 완료: UI bottom sheet/editable card row props를 content/state/action/style 단위로 분리하고, 카드 Spring repository의 native query row/scalar 변환을 작은 어댑터로 모아 호출부의 Object[]/Number/시간 타입 instanceof 분기를 줄였다. row 길이/빈 값 오류 메시지는 필요한 컬럼과 실제 컬럼/위치를 포함하도록 구체화했다.

## 20차 적용 완료

- 항목 129~140 완료: 타이핑 서비스 캐릭터/솔로 연습/방 대기/레이스 훅/영토전 훅 타입과 domain LifeOS 지표/리포트 타입을 표시·상태·액션·측정 단위로 분리해 큰 인터페이스 의존을 줄였다. 기존 export 이름은 조합 타입으로 유지해 호출부 런타임 동작과 API 형태를 보존했다.

## 19차 적용 완료

- 항목 119~128 완료: race-server 참가자 타입과 웹 카드 서비스 헤더/학습/에디터/카드 행/복습 카드 props를 상태·액션·표시·정체성 단위의 작은 타입으로 분리해 ISP 위반 후보를 줄였다. 런타임 동작은 유지하고 큰 prop/interface만 조합 타입으로 대체했다.

## 18차 적용 완료

- 항목 109~118 완료: 웹 카드 에디터 이미지 정규화/업로드/붙여넣기, 코드 블록 복사, 덱 내보내기, 게스트 덱 이관 실패 메시지를 helper로 통합해 Error/string/기타 unknown 원인을 보존했다. 클립보드 실패는 복사 대상 길이/카드 수와 브라우저 권한 원인을 사용자 메시지 또는 로그로 드러낸다.

## 300개 TODO

> 아래 항목은 실제 코드 경로/라인을 기준으로 작성한다. `원칙`은 SOLID 또는 예외 처리 원칙 번호를 표시한다.

### 수집 요약

- 후보 검색 결과: 유지보수 범위에서 835개 후보 중 300개를 우선순위/원칙 균형으로 선별.
- 원칙별 선별 수: Exception 95개, SRP 55개, DIP 45개, ISP 25개, LSP 35개, OCP 45개.
- 우선순위: P1 즉시 점검, P2 구조 개선, P3 적용하면 좋은 확장성 개선.
- `E1~E10`은 사용자 예외 처리 원칙 1~10을 의미한다.

### Exception

1. **[완료][P1] 광범위 예외 포착 축소** `apps/backend/src/main/java/world/yeon/backend/card_rooms/service/CardRoomParticipantTokenService.java:49` — 원칙 `E2`. Exception/Throwable 포착은 처리 가능한 구체 예외로 좁힌다. 근거: `} catch (Exception error) {`
2. **[완료][P1] 광범위 예외 포착 축소** `apps/backend/src/main/java/world/yeon/backend/root_auth/service/AuthTokenHasher.java:35` — 원칙 `E2`. Exception/Throwable 포착은 처리 가능한 구체 예외로 좁힌다. 근거: `} catch (Exception error) {`
3. **[완료][P1] 광범위 예외 포착 축소** `apps/backend/src/main/java/world/yeon/backend/root_auth/social/SocialIdentityProviderClient.java:134` — 원칙 `E2`. Exception/Throwable 포착은 처리 가능한 구체 예외로 좁힌다. 근거: `} catch (Exception error) {`
4. **[완료][P1] 광범위 예외 포착 축소** `apps/backend/src/main/java/world/yeon/backend/typing_character_frames/repository/TypingCharacterFrameRepository.java:87` — 원칙 `E2`. Exception/Throwable 포착은 처리 가능한 구체 예외로 좁힌다. 근거: `} catch (Exception error) {`
5. **[완료][P1] 광범위 예외 포착 축소** `apps/backend/src/main/java/world/yeon/backend/typing_character_frames/repository/TypingCharacterFrameRepository.java:95` — 원칙 `E2`. Exception/Throwable 포착은 처리 가능한 구체 예외로 좁힌다. 근거: `} catch (Exception error) {`
6. **[완료][P1] 광범위 예외 포착 축소** `apps/backend/src/main/java/world/yeon/backend/typing_decks/service/TypingRaceSeedSigner.java:33` — 원칙 `E2`. Exception/Throwable 포착은 처리 가능한 구체 예외로 좁힌다. 근거: `} catch (Exception error) {`
7. **[완료][P1] 빈 catch 금지** `apps/mobile/src/features/card-service/card-onboarding-gate.tsx:119` — 원칙 `E3`. 예외를 숨기지 말고 로그/전역 처리/재던지기 중 하나를 명시한다. 근거: `} catch {`
8. **[완료][P1] 빈 catch 금지** `apps/mobile/src/features/card-service/card-session-context.tsx:130` — 원칙 `E3`. 예외를 숨기지 말고 로그/전역 처리/재던지기 중 하나를 명시한다. 근거: `} catch {`
9. **[완료][P1] 빈 catch 금지** `apps/mobile/src/features/card-service/onboarding-storage.ts:29` — 원칙 `E3`. 예외를 숨기지 말고 로그/전역 처리/재던지기 중 하나를 명시한다. 근거: `} catch {`
10. **[완료][P1] 빈 catch 금지** `apps/mobile/src/features/card-service/onboarding-storage.ts:51` — 원칙 `E3`. 예외를 숨기지 말고 로그/전역 처리/재던지기 중 하나를 명시한다. 근거: `} catch {`
11. **[완료][P1] 빈 catch 금지** `apps/race-server/src/index.ts:55` — 원칙 `E3`. 예외를 숨기지 말고 로그/전역 처리/재던지기 중 하나를 명시한다. 근거: `} catch {`
12. **[완료][P1] 빈 catch 금지** `apps/web/src/features/card-service/auth-context.tsx:60` — 원칙 `E3`. 예외를 숨기지 말고 로그/전역 처리/재던지기 중 하나를 명시한다. 근거: `} catch {`
13. **[완료][P1] 빈 catch 금지** `apps/web/src/features/card-service/card-service-fetch.ts:65` — 원칙 `E3`. 예외를 숨기지 말고 로그/전역 처리/재던지기 중 하나를 명시한다. 근거: `} catch {`
14. **[완료][P1] 빈 catch 금지** `apps/web/src/features/card-service/components/add-card-form.tsx:132` — 원칙 `E3`. 예외를 숨기지 말고 로그/전역 처리/재던지기 중 하나를 명시한다. 근거: `} catch {`
15. **[완료][P1] 빈 catch 금지** `apps/web/src/features/card-service/components/card-editor-image-utils.ts:303` — 원칙 `E3`. 예외를 숨기지 말고 로그/전역 처리/재던지기 중 하나를 명시한다. 근거: `} catch {`
16. **[완료][P1] 빈 catch 금지** `apps/web/src/features/card-service/components/card-editor-youtube-utils.ts:174` — 원칙 `E3`. 예외를 숨기지 말고 로그/전역 처리/재던지기 중 하나를 명시한다. 근거: `} catch {`
17. **[완료][P1] 빈 catch 금지** `apps/web/src/features/card-service/components/card-markdown-code-block.tsx:64` — 원칙 `E3`. 예외를 숨기지 말고 로그/전역 처리/재던지기 중 하나를 명시한다. 근거: `} catch {`
18. **[완료][P1] 빈 catch 금지** `apps/web/src/features/card-service/components/use-card-editor-image-upload.ts:65` — 원칙 `E3`. 예외를 숨기지 말고 로그/전역 처리/재던지기 중 하나를 명시한다. 근거: `} catch {`
19. **[완료][P1] 빈 catch 금지** `apps/web/src/features/card-service/components/use-card-editor-image-upload.ts:129` — 원칙 `E3`. 예외를 숨기지 말고 로그/전역 처리/재던지기 중 하나를 명시한다. 근거: `} catch {`
20. **[완료][P1] 빈 catch 금지** `apps/web/src/features/card-service/hooks/use-card-room-profile.ts:45` — 원칙 `E3`. 예외를 숨기지 말고 로그/전역 처리/재던지기 중 하나를 명시한다. 근거: `} catch {`
21. **[완료][P1] 빈 catch 금지** `apps/web/src/features/card-service/utils/card-play-card-size.ts:71` — 원칙 `E3`. 예외를 숨기지 말고 로그/전역 처리/재던지기 중 하나를 명시한다. 근거: `} catch {`
22. **[완료][P1] 빈 catch 금지** `apps/web/src/features/community/community-guest-identity.ts:55` — 원칙 `E3`. 예외를 숨기지 말고 로그/전역 처리/재던지기 중 하나를 명시한다. 근거: `} catch {`
23. **[완료][P1] 빈 catch 금지** `apps/web/src/features/community/components/community-presence-tracker.tsx:20` — 원칙 `E3`. 예외를 숨기지 말고 로그/전역 처리/재던지기 중 하나를 명시한다. 근거: `} catch {`
24. **[완료][P1] 빈 catch 금지** `apps/web/src/features/typing-service/typing-room-screen.tsx:738` — 원칙 `E3`. 예외를 숨기지 말고 로그/전역 처리/재던지기 중 하나를 명시한다. 근거: `} catch {`
25. **[완료][P1] 빈 catch 금지** `apps/web/src/features/typing-service/typing-service-fetch.ts:39` — 원칙 `E3`. 예외를 숨기지 말고 로그/전역 처리/재던지기 중 하나를 명시한다. 근거: `} catch {`
26. **[완료][P1] 빈 catch 금지** `apps/web/src/features/typing-service/typing-service-fetch.ts:126` — 원칙 `E3`. 예외를 숨기지 말고 로그/전역 처리/재던지기 중 하나를 명시한다. 근거: `} catch {`
27. **[완료][P1] 빈 catch 금지** `apps/web/src/features/typing-service/typing-service-fetch.ts:216` — 원칙 `E3`. 예외를 숨기지 말고 로그/전역 처리/재던지기 중 하나를 명시한다. 근거: `} catch {`
28. **[완료][P1] 빈 catch 금지** `apps/web/src/features/typing-service/use-player-identity.ts:31` — 원칙 `E3`. 예외를 숨기지 말고 로그/전역 처리/재던지기 중 하나를 명시한다. 근거: `} catch {`
29. **[완료][P1] 빈 catch 금지** `apps/web/src/features/typing-service/use-race-room.ts:256` — 원칙 `E3`. 예외를 숨기지 말고 로그/전역 처리/재던지기 중 하나를 명시한다. 근거: `} catch {`
30. **[완료][P1] 빈 catch 금지** `apps/web/src/features/typing-service/use-race-room.ts:321` — 원칙 `E3`. 예외를 숨기지 말고 로그/전역 처리/재던지기 중 하나를 명시한다. 근거: `} catch {`
31. **[완료][P1] 빈 catch 금지** `apps/web/src/features/typing-service/use-race-room.ts:384` — 원칙 `E3`. 예외를 숨기지 말고 로그/전역 처리/재던지기 중 하나를 명시한다. 근거: `} catch {`
32. **[완료][P1] 빈 catch 금지** `apps/web/src/features/typing-service/use-race-room.ts:387` — 원칙 `E3`. 예외를 숨기지 말고 로그/전역 처리/재던지기 중 하나를 명시한다. 근거: `} catch {`
33. **[완료][P1] 빈 catch 금지** `apps/web/src/features/typing-service/use-territory-battle-room.ts:239` — 원칙 `E3`. 예외를 숨기지 말고 로그/전역 처리/재던지기 중 하나를 명시한다. 근거: `} catch {`
34. **[완료][P1] 빈 catch 금지** `apps/web/src/features/typing-service/use-typing-profile.ts:43` — 원칙 `E3`. 예외를 숨기지 말고 로그/전역 처리/재던지기 중 하나를 명시한다. 근거: `} catch {`
35. **[완료][P1] 빈 catch 금지** `apps/web/src/features/typing-service/use-typing-profile.ts:54` — 원칙 `E3`. 예외를 숨기지 말고 로그/전역 처리/재던지기 중 하나를 명시한다. 근거: `} catch {`
36. **[완료][P1] 빈 catch 금지** `apps/web/src/features/typing-service/use-typing-settings.ts:531` — 원칙 `E3`. 예외를 숨기지 말고 로그/전역 처리/재던지기 중 하나를 명시한다. 근거: `} catch {`
37. **[완료][P1] 빈 catch 금지** `packages/api-client/src/index.ts:153` — 원칙 `E3`. 예외를 숨기지 말고 로그/전역 처리/재던지기 중 하나를 명시한다. 근거: `} catch {`
38. **[완료][P1] 빈 catch 금지** `packages/ui/src/rich-content/YeonMermaid/index.ts:37` — 원칙 `E3`. 예외를 숨기지 말고 로그/전역 처리/재던지기 중 하나를 명시한다. 근거: `} catch {`
39. **[완료][P1] 빈 catch 금지** `packages/ui/src/runtime/YeonBrowserRuntime/index.native.ts:136` — 원칙 `E3`. 예외를 숨기지 말고 로그/전역 처리/재던지기 중 하나를 명시한다. 근거: `} catch {`
40. **[완료][P1] 빈 catch 금지** `packages/ui/src/runtime/YeonBrowserRuntime/index.ts:163` — 원칙 `E3`. 예외를 숨기지 말고 로그/전역 처리/재던지기 중 하나를 명시한다. 근거: `} catch {`
41. **[완료][P1] 빈 catch 금지** `packages/ui/src/runtime/YeonBrowserRuntime/index.ts:175` — 원칙 `E3`. 예외를 숨기지 말고 로그/전역 처리/재던지기 중 하나를 명시한다. 근거: `} catch {`
42. **[완료][P1] 빈 catch 금지** `packages/ui/src/runtime/YeonBrowserRuntime/index.ts:183` — 원칙 `E3`. 예외를 숨기지 말고 로그/전역 처리/재던지기 중 하나를 명시한다. 근거: `} catch {`
43. **[완료][P1] 빈 catch 금지** `packages/ui/src/runtime/YeonBrowserRuntime/index.ts:191` — 원칙 `E3`. 예외를 숨기지 말고 로그/전역 처리/재던지기 중 하나를 명시한다. 근거: `} catch {`
44. **[완료][P1] 빈 catch 금지** `packages/ui/src/runtime/YeonBrowserRuntime/index.ts:199` — 원칙 `E3`. 예외를 숨기지 말고 로그/전역 처리/재던지기 중 하나를 명시한다. 근거: `} catch {`
45. **[완료][P1] 빈 catch 금지** `packages/ui/src/runtime/YeonBrowserRuntime/index.ts:207` — 원칙 `E3`. 예외를 숨기지 말고 로그/전역 처리/재던지기 중 하나를 명시한다. 근거: `} catch {`
46. **[완료][P1] 빈 catch 금지** `packages/ui/src/runtime/YeonBrowserRuntime/index.ts:215` — 원칙 `E3`. 예외를 숨기지 말고 로그/전역 처리/재던지기 중 하나를 명시한다. 근거: `} catch {`
47. **[완료][P1] 빈 catch 금지** `packages/ui/src/runtime/YeonBrowserRuntime/index.ts:787` — 원칙 `E3`. 예외를 숨기지 말고 로그/전역 처리/재던지기 중 하나를 명시한다. 근거: `} catch {`

### SRP

48. **[완료][P1] 큰 파일 책임 분리** `apps/race-server/src/rooms/card-room.ts:1` — 원칙 `S`. 812라인 파일이다. 단일 책임 원칙 기준으로 화면/상태/IO/변환 책임 분리 후보다. 근거: `import { type Client, Room } from "@colyseus/core";`
49. **[완료][P1] 큰 파일 책임 분리** `apps/race-server/src/rooms/typing-race-room.ts:1` — 원칙 `S`. 2069라인 파일이다. 단일 책임 원칙 기준으로 화면/상태/IO/변환 책임 분리 후보다. 근거: `import {`
50. **[P1] 큰 파일 책임 분리** `apps/web/src/features/card-service/components/card-rich-markdown-editor.tsx:1` — 원칙 `S`. 1269라인 파일이다. 단일 책임 원칙 기준으로 화면/상태/IO/변환 책임 분리 후보다. 근거: `"use client";`
51. **[P1] 큰 파일 책임 분리** `apps/web/src/features/card-service/components/markdown-content.tsx:1` — 원칙 `S`. 810라인 파일이다. 단일 책임 원칙 기준으로 화면/상태/IO/변환 책임 분리 후보다. 근거: `"use client";`
52. **[P1] 큰 파일 책임 분리** `apps/web/src/features/typing-service/typing-race-multiplayer-screen.tsx:1` — 원칙 `S`. 747라인 파일이다. 단일 책임 원칙 기준으로 화면/상태/IO/변환 책임 분리 후보다. 근거: `"use client";`
53. **[P1] 큰 파일 책임 분리** `apps/web/src/features/typing-service/typing-race-solo-screen.tsx:1` — 원칙 `S`. 821라인 파일이다. 단일 책임 원칙 기준으로 화면/상태/IO/변환 책임 분리 후보다. 근거: `"use client";`
54. **[P1] 큰 파일 책임 분리** `apps/web/src/features/typing-service/typing-room-screen.tsx:1` — 원칙 `S`. 1084라인 파일이다. 단일 책임 원칙 기준으로 화면/상태/IO/변환 책임 분리 후보다. 근거: `"use client";`
55. **[P1] 큰 파일 책임 분리** `apps/web/src/features/typing-service/typing-territory-battle-screen.tsx:1` — 원칙 `S`. 1191라인 파일이다. 단일 책임 원칙 기준으로 화면/상태/IO/변환 책임 분리 후보다. 근거: `"use client";`
56. **[P1] 큰 파일 책임 분리** `packages/api-client/src/index.ts:1` — 원칙 `S`. 960라인 파일이다. 단일 책임 원칙 기준으로 화면/상태/IO/변환 책임 분리 후보다. 근거: `import { authSessionResponseSchema } from "@yeon/api-contract/auth";`
57. **[P1] 큰 파일 책임 분리** `packages/domain/src/life-os.ts:1` — 원칙 `S`. 714라인 파일이다. 단일 책임 원칙 기준으로 화면/상태/IO/변환 책임 분리 후보다. 근거: `export const lifeOsCategories = [`
58. **[P1] 큰 파일 책임 분리** `packages/ui/src/runtime/YeonBrowserRuntime/index.ts:1` — 원칙 `S`. 843라인 파일이다. 단일 책임 원칙 기준으로 화면/상태/IO/변환 책임 분리 후보다. 근거: `export type YeonBrowserStorage = Pick<`

### DIP

59. **[완료][P2] 필드 주입 제거** `apps/backend/src/main/java/world/yeon/backend/typing_decks/service/TypingDeckService.java:48` — 원칙 `D`. 필드 주입 대신 생성자 주입과 인터페이스 의존으로 바꾼다. 근거: `@Autowired`
60. **[완료][P2] fetch 직접 의존 포트화** `apps/race-server/src/rooms/card-room.ts:168` — 원칙 `D`. 구체 fetch 호출을 repository/client 포트 뒤로 숨긴다. 근거: `const response = await fetch(\`${backendBaseUrl()}${path}\`, {`
61. **[완료][P2] fetch 직접 의존 포트화** `apps/race-server/src/rooms/typing-race-room.ts:479` — 원칙 `D`. 구체 fetch 호출을 repository/client 포트 뒤로 숨긴다. 근거: `const response = await fetch(`
62. **[P2] 브라우저 저장소 직접 의존 분리** `apps/web/src/features/community/hooks/use-community-chat-panel.ts:59` — 원칙 `D`. 구체 저장소 접근을 KV/storage 포트로 격리한다. 근거: `/** 사용자가 직접 열고/닫을 때 호출. 선택은 localStorage에 보존되어 라우트 이동 후에도 유지된다. */`
63. **[완료][P2] fetch 직접 의존 포트화** `apps/web/src/features/typing-service/use-typing-room-lobby.ts:63` — 원칙 `D`. 구체 fetch 호출을 repository/client 포트 뒤로 숨긴다. 근거: `void roomsQuery.refetch();`
64. **[P2] 브라우저 저장소 직접 의존 분리** `packages/ui/src/runtime/YeonBrowserRuntime/index.native.ts:133` — 원칙 `D`. 구체 저장소 접근을 KV/storage 포트로 격리한다. 근거: `return typeof globalThis.localStorage === "undefined"`
65. **[P2] 브라우저 저장소 직접 의존 분리** `packages/ui/src/runtime/YeonBrowserRuntime/index.native.ts:135` — 원칙 `D`. 구체 저장소 접근을 KV/storage 포트로 격리한다. 근거: `: globalThis.localStorage;`
66. **[P2] fetch 직접 의존 포트화** `packages/ui/src/runtime/YeonBrowserRuntime/index.native.ts:203` — 원칙 `D`. 구체 fetch 호출을 repository/client 포트 뒤로 숨긴다. 근거: `return fetch(input, init);`
67. **[P2] 브라우저 저장소 직접 의존 분리** `packages/ui/src/runtime/YeonBrowserRuntime/index.ts:139` — 원칙 `D`. 구체 저장소 접근을 KV/storage 포트로 격리한다. 근거: `return kind === "local" ? window.localStorage : window.sessionStorage;`
68. **[P2] 브라우저 저장소 직접 의존 분리** `packages/ui/src/runtime/YeonBrowserRuntime/index.ts:162` — 원칙 `D`. 구체 저장소 접근을 KV/storage 포트로 격리한다. 근거: `return typeof window === "undefined" ? null : window.localStorage;`
69. **[P2] fetch 직접 의존 포트화** `packages/ui/src/runtime/YeonBrowserRuntime/index.ts:279` — 원칙 `D`. 구체 fetch 호출을 repository/client 포트 뒤로 숨긴다. 근거: `return fetch(input, init);`
70. **[P2] 브라우저 저장소 직접 의존 분리** `packages/ui/src/runtime/ports/shared.ts:67` — 원칙 `D`. 구체 저장소 접근을 KV/storage 포트로 격리한다. 근거: `// 비동기로 통일(모바일 SecureStore 친화). 웹 localStorage는 Promise로 감싼다.`

### Exception

71. **[완료][P2] 일반 Error 메시지 구체화** `apps/mobile/src/features/card-service/card-deck-detail-screen.tsx:177` — 원칙 `E4/E6`. 오류 메시지에 실패한 입력/외부 의존/상태 원인을 드러낸다. 근거: `throw new Error(CARD_SERVICE_TEXT.detail.missingDeckIdMessage);`
72. **[완료][P2] 일반 Error 메시지 구체화** `apps/mobile/src/features/card-service/card-deck-detail-screen.tsx:195` — 원칙 `E4/E6`. 오류 메시지에 실패한 입력/외부 의존/상태 원인을 드러낸다. 근거: `throw new Error(CARD_SERVICE_TEXT.detail.missingDeckIdMessage);`
73. **[완료][P2] 일반 Error 메시지 구체화** `apps/mobile/src/features/card-service/card-deck-detail-screen.tsx:207` — 원칙 `E4/E6`. 오류 메시지에 실패한 입력/외부 의존/상태 원인을 드러낸다. 근거: `throw new Error(CARD_SERVICE_TEXT.detail.missingDeckIdMessage);`
74. **[완료][P2] 일반 Error 메시지 구체화** `apps/mobile/src/features/card-service/card-deck-detail-screen.tsx:211` — 원칙 `E4/E6`. 오류 메시지에 실패한 입력/외부 의존/상태 원인을 드러낸다. 근거: `throw new Error(CARD_SERVICE_TEXT.detail.noParseResultMessage);`
75. **[완료][P2] 일반 Error 메시지 구체화** `apps/mobile/src/features/card-service/card-deck-detail-screen.tsx:230` — 원칙 `E4/E6`. 오류 메시지에 실패한 입력/외부 의존/상태 원인을 드러낸다. 근거: `throw new Error(CARD_SERVICE_TEXT.detail.missingDeckIdMessage);`
76. **[완료][P2] 일반 Error 메시지 구체화** `apps/mobile/src/features/card-service/card-deck-detail-screen.tsx:234` — 원칙 `E4/E6`. 오류 메시지에 실패한 입력/외부 의존/상태 원인을 드러낸다. 근거: `throw new Error(CARD_SERVICE_TEXT.detail.noParseResultMessage);`
77. **[완료][P2] 일반 Error 메시지 구체화** `apps/mobile/src/features/card-service/card-deck-detail-screen.tsx:253` — 원칙 `E4/E6`. 오류 메시지에 실패한 입력/외부 의존/상태 원인을 드러낸다. 근거: `throw new Error(CARD_SERVICE_TEXT.detail.missingDeckIdMessage);`
78. **[완료][P2] 일반 Error 메시지 구체화** `apps/mobile/src/features/card-service/card-deck-detail-screen.tsx:269` — 원칙 `E4/E6`. 오류 메시지에 실패한 입력/외부 의존/상태 원인을 드러낸다. 근거: `throw new Error(CARD_SERVICE_TEXT.detail.missingDeckIdMessage);`
79. **[완료][P2] TypeScript catch 처리 책임 명확화** `apps/mobile/src/features/card-service/card-deck-detail-screen.tsx:347` — 원칙 `E1/E2`. catch 값은 unknown으로 좁히고 처리 못 할 예외는 숨기지 않는다. 근거: `} catch (error) {`
80. **[완료][P2] TypeScript catch 처리 책임 명확화** `apps/mobile/src/features/card-service/card-deck-detail-screen.tsx:359` — 원칙 `E1/E2`. catch 값은 unknown으로 좁히고 처리 못 할 예외는 숨기지 않는다. 근거: `} catch (error) {`
81. **[완료][P2] TypeScript catch 처리 책임 명확화** `apps/mobile/src/features/card-service/card-deck-detail-screen.tsx:389` — 원칙 `E1/E2`. catch 값은 unknown으로 좁히고 처리 못 할 예외는 숨기지 않는다. 근거: `} catch (error) {`
82. **[완료][P2] TypeScript catch 처리 책임 명확화** `apps/mobile/src/features/card-service/card-deck-detail-screen.tsx:419` — 원칙 `E1/E2`. catch 값은 unknown으로 좁히고 처리 못 할 예외는 숨기지 않는다. 근거: `} catch (error) {`
83. **[완료][P2] TypeScript catch 처리 책임 명확화** `apps/mobile/src/features/card-service/card-deck-detail-screen.tsx:439` — 원칙 `E1/E2`. catch 값은 unknown으로 좁히고 처리 못 할 예외는 숨기지 않는다. 근거: `} catch (error) {`
84. **[완료][P2] TypeScript catch 처리 책임 명확화** `apps/mobile/src/features/card-service/card-deck-list-screen.tsx:140` — 원칙 `E1/E2`. catch 값은 unknown으로 좁히고 처리 못 할 예외는 숨기지 않는다. 근거: `} catch (error) {`
85. **[완료][P2] 일반 Error 메시지 구체화** `apps/mobile/src/features/card-service/card-deck-play-screen.tsx:73` — 원칙 `E4/E6`. 오류 메시지에 실패한 입력/외부 의존/상태 원인을 드러낸다. 근거: `throw new Error(CARD_SERVICE_TEXT.detail.missingDeckIdMessage);`
86. **[완료][P2] 일반 Error 메시지 구체화** `apps/mobile/src/features/card-service/card-deck-play-screen.tsx:82` — 원칙 `E4/E6`. 오류 메시지에 실패한 입력/외부 의존/상태 원인을 드러낸다. 근거: `throw new Error(CARD_SERVICE_TEXT.shared.notFoundMessage);`
87. **[완료][P2] 일반 Error 메시지 구체화** `apps/mobile/src/features/card-service/card-deck-play-screen.tsx:115` — 원칙 `E4/E6`. 오류 메시지에 실패한 입력/외부 의존/상태 원인을 드러낸다. 근거: `throw new Error(CARD_SERVICE_TEXT.detail.missingDeckIdMessage);`
88. **[완료][P2] TypeScript catch 처리 책임 명확화** `apps/mobile/src/features/card-service/card-onboarding-gate.tsx:73` — 원칙 `E1/E2`. catch 값은 unknown으로 좁히고 처리 못 할 예외는 숨기지 않는다. 근거: `} catch (error) {`
89. **[완료][P2] TypeScript catch 처리 책임 명확화** `apps/mobile/src/features/card-service/card-onboarding-gate.tsx:102` — 원칙 `E1/E2`. catch 값은 unknown으로 좁히고 처리 못 할 예외는 숨기지 않는다. 근거: `} catch (error) {`
90. **[완료][P2] TypeScript catch 처리 책임 명확화** `apps/mobile/src/features/card-service/card-service-session.ts:50` — 원칙 `E1/E2`. catch 값은 unknown으로 좁히고 처리 못 할 예외는 숨기지 않는다. 근거: `} catch (error) {`
91. **[완료][P2] 일반 Error 메시지 구체화** `apps/mobile/src/features/card-service/card-session-context.tsx:44` — 원칙 `E4/E6`. 오류 메시지에 실패한 입력/외부 의존/상태 원인을 드러낸다. 근거: `throw new Error(`
92. **[완료][P2] TypeScript catch 처리 책임 명확화** `apps/mobile/src/features/card-service/markdown-text-field.tsx:245` — 원칙 `E1/E2`. catch 값은 unknown으로 좁히고 처리 못 할 예외는 숨기지 않는다. 근거: `} catch (error) {`
93. **[완료][P2] 일반 Error 메시지 구체화** `apps/mobile/src/features/card-service/rooms/card-room-create-sheet.tsx:72` — 원칙 `E4/E6`. 오류 메시지에 실패한 입력/외부 의존/상태 원인을 드러낸다. 근거: `throw new Error(`
94. **[완료][P2] TypeScript catch 처리 책임 명확화** `apps/mobile/src/features/card-service/rooms/card-room-create-sheet.tsx:130` — 원칙 `E1/E2`. catch 값은 unknown으로 좁히고 처리 못 할 예외는 숨기지 않는다. 근거: `} catch (error) {`
95. **[완료][P2] TypeScript catch 처리 책임 명확화** `apps/mobile/src/features/card-service/rooms/card-room-screen.tsx:80` — 원칙 `E1/E2`. catch 값은 unknown으로 좁히고 처리 못 할 예외는 숨기지 않는다. 근거: `} catch (error) {`
96. **[완료][P2] TypeScript catch 처리 책임 명확화** `apps/mobile/src/features/card-service/rooms/use-card-room-connection.ts:99` — 원칙 `E1/E2`. catch 값은 unknown으로 좁히고 처리 못 할 예외는 숨기지 않는다. 근거: `.catch((err) => {`
97. **[완료][P2] TypeScript catch 처리 책임 명확화** `apps/race-server/src/index.ts:127` — 원칙 `E1/E2`. catch 값은 unknown으로 좁히고 처리 못 할 예외는 숨기지 않는다. 근거: `} catch (error) {`
98. **[완료][P2] 일반 Error 메시지 구체화** `apps/race-server/src/rooms/card-room.ts:303` — 원칙 `E4/E6`. 오류 메시지에 실패한 입력/외부 의존/상태 원인을 드러낸다. 근거: `if (!options.participantId) throw new Error("참가자 식별자가 필요합니다.");`
99. **[완료][P2] 일반 Error 메시지 구체화** `apps/race-server/src/rooms/card-room.ts:317` — 원칙 `E4/E6`. 오류 메시지에 실패한 입력/외부 의존/상태 원인을 드러낸다. 근거: `throw new Error("참가자 인증에 실패했습니다.");`
100.  **[완료][P2] TypeScript catch 처리 책임 명확화** `apps/race-server/src/rooms/card-room.ts:357` — 원칙 `E1/E2`. catch 값은 unknown으로 좁히고 처리 못 할 예외는 숨기지 않는다. 근거: `} catch (error) {`
101.  **[완료][P2] TypeScript catch 처리 책임 명확화** `apps/race-server/src/rooms/card-room.ts:783` — 원칙 `E1/E2`. catch 값은 unknown으로 좁히고 처리 못 할 예외는 숨기지 않는다. 근거: `} catch (error) {`
102.  **[완료][P2] TypeScript catch 처리 책임 명확화** `apps/race-server/src/rooms/typing-race-room.ts:496` — 원칙 `E1/E2`. catch 값은 unknown으로 좁히고 처리 못 할 예외는 숨기지 않는다. 근거: `} catch (error) {`
103.  **[완료][P2] TypeScript catch 처리 책임 명확화** `apps/web/src/app/community/posts/[postId]/page.tsx:23` — 원칙 `E1/E2`. catch 값은 unknown으로 좁히고 처리 못 할 예외는 숨기지 않는다. 근거: `} catch (error) {`
104.  **[완료][P2] 일반 Error 메시지 구체화** `apps/web/src/features/card-service/auth-context.tsx:87` — 원칙 `E4/E6`. 오류 메시지에 실패한 입력/외부 의존/상태 원인을 드러낸다. 근거: `throw new Error(`
105.  **[완료][P2] TypeScript catch 처리 책임 명확화** `apps/web/src/features/card-service/card-room-create-screen.tsx:128` — 원칙 `E1/E2`. catch 값은 unknown으로 좁히고 처리 못 할 예외는 숨기지 않는다. 근거: `} catch (error) {`
106.  **[완료][P2] TypeScript catch 처리 책임 명확화** `apps/web/src/features/card-service/card-room-screen.tsx:65` — 원칙 `E1/E2`. catch 값은 unknown으로 좁히고 처리 못 할 예외는 숨기지 않는다. 근거: `.catch((error) => {`
107.  **[완료][P2] TypeScript catch 처리 책임 명확화** `apps/web/src/features/card-service/card-service-decks-screen.tsx:53` — 원칙 `E1/E2`. catch 값은 unknown으로 좁히고 처리 못 할 예외는 숨기지 않는다. 근거: `} catch (error) {`
108.  **[완료][P2] 로컬 로그 후 실패 상태 연결** `apps/web/src/features/card-service/card-service-decks-screen.tsx:53` — 원칙 `E3/E9`. console.error 후 반환만 하면 전역 오류 정책과 사용자 실패 상태가 분리될 수 있다. 근거: `} catch (error) {`
109.  **[완료][P2] 일반 Error 메시지 구체화** `apps/web/src/features/card-service/components/card-editor-image-utils.ts:292` — 원칙 `E4/E6`. 오류 메시지에 실패한 입력/외부 의존/상태 원인을 드러낸다. 근거: `throw new Error();`
110.  **[완료][P2] 일반 Error 메시지 구체화** `apps/web/src/features/card-service/components/card-editor-image-utils.ts:304` — 원칙 `E4/E6`. 오류 메시지에 실패한 입력/외부 의존/상태 원인을 드러낸다. 근거: `throw new Error(`
111.  **[완료][P2] 일반 Error 메시지 구체화** `apps/web/src/features/card-service/components/card-markdown-code-block.tsx:60` — 원칙 `E4/E6`. 오류 메시지에 실패한 입력/외부 의존/상태 원인을 드러낸다. 근거: `throw new Error("클립보드 복사를 지원하지 않습니다.");`
112.  **[완료][P2] 일반 Error 메시지 구체화** `apps/web/src/features/card-service/components/export-deck-panel.tsx:34` — 원칙 `E4/E6`. 오류 메시지에 실패한 입력/외부 의존/상태 원인을 드러낸다. 근거: `throw new Error("클립보드 복사를 지원하지 않습니다.");`
113.  **[완료][P2] 일반 Error 메시지 구체화** `apps/web/src/features/card-service/components/markdown-content.tsx:573` — 원칙 `E4/E6`. 오류 메시지에 실패한 입력/외부 의존/상태 원인을 드러낸다. 근거: `throw new Error("클립보드 복사를 지원하지 않습니다.");`
114.  **[완료][P2] TypeScript catch 처리 책임 명확화** `apps/web/src/features/card-service/components/merge-guest-dialog.tsx:46` — 원칙 `E1/E2`. catch 값은 unknown으로 좁히고 처리 못 할 예외는 숨기지 않는다. 근거: `} catch (error) {`
115.  **[완료][P2] TypeScript catch 처리 책임 명확화** `apps/web/src/features/card-service/components/use-card-editor-image-upload.ts:186` — 원칙 `E1/E2`. catch 값은 unknown으로 좁히고 처리 못 할 예외는 숨기지 않는다. 근거: `} catch (error) {`
116.  **[완료][P2] TypeScript catch 처리 책임 명확화** `apps/web/src/features/card-service/components/use-card-editor-image-upload.ts:217` — 원칙 `E1/E2`. catch 값은 unknown으로 좁히고 처리 못 할 예외는 숨기지 않는다. 근거: `} catch (error) {`
117.  **[완료][P2] TypeScript catch 처리 책임 명확화** `apps/web/src/features/card-service/components/use-card-editor-image-upload.ts:273` — 원칙 `E1/E2`. catch 값은 unknown으로 좁히고 처리 못 할 예외는 숨기지 않는다. 근거: `} catch (error) {`
118.  **[완료][P2] TypeScript catch 처리 책임 명확화** `apps/web/src/features/card-service/components/use-card-editor-image-upload.ts:316` — 원칙 `E1/E2`. catch 값은 unknown으로 좁히고 처리 못 할 예외는 숨기지 않는다. 근거: `} catch (error) {`

### ISP

119. **[완료][P2] 큰 타입/인터페이스 분리** `apps/race-server/src/rooms/typing-race-room.ts:73` — 원칙 `I`. 멤버 후보 17개다. 읽기/쓰기/이벤트/상태 전용 타입으로 분리할 후보다. 근거: `type RoomParticipant = {`
120. **[완료][P2] 큰 타입/인터페이스 분리** `apps/web/src/features/card-service/card-room-header.tsx:30` — 원칙 `I`. 멤버 후보 10개다. 읽기/쓰기/이벤트/상태 전용 타입으로 분리할 후보다. 근거: `type CardRoomHeaderProps = {`
121. **[완료][P2] 큰 타입/인터페이스 분리** `apps/web/src/features/card-service/card-room-study-panel.tsx:11` — 원칙 `I`. 멤버 후보 9개다. 읽기/쓰기/이벤트/상태 전용 타입으로 분리할 후보다. 근거: `type CardRoomStudyPanelProps = {`
122. **[완료][P2] 큰 타입/인터페이스 분리** `apps/web/src/features/card-service/components/card-editor-toolbar.tsx:64` — 원칙 `I`. 멤버 후보 25개다. 읽기/쓰기/이벤트/상태 전용 타입으로 분리할 후보다. 근거: `interface CardEditorToolbarProps {`
123. **[완료][P2] 큰 타입/인터페이스 분리** `apps/web/src/features/card-service/components/card-rich-markdown-editor-view.tsx:317` — 원칙 `I`. 멤버 후보 9개다. 읽기/쓰기/이벤트/상태 전용 타입으로 분리할 후보다. 근거: `interface CardPreviewSurfaceProps {`
124. **[완료][P2] 큰 타입/인터페이스 분리** `apps/web/src/features/card-service/components/card-rich-markdown-editor.tsx:99` — 원칙 `I`. 멤버 후보 10개다. 읽기/쓰기/이벤트/상태 전용 타입으로 분리할 후보다. 근거: `interface CardRichMarkdownEditorProps {`
125. **[완료][P2] 큰 타입/인터페이스 분리** `apps/web/src/features/card-service/components/card-rich-markdown-editor.tsx:112` — 원칙 `I`. 멤버 후보 11개다. 읽기/쓰기/이벤트/상태 전용 타입으로 분리할 후보다. 근거: `type CardEditorToolbarState = {`
126. **[완료][P2] 큰 타입/인터페이스 분리** `apps/web/src/features/card-service/components/card-row-views.tsx:16` — 원칙 `I`. 멤버 후보 13개다. 읽기/쓰기/이벤트/상태 전용 타입으로 분리할 후보다. 근거: `type CardRowEditViewProps = {`
127. **[완료][P2] 큰 타입/인터페이스 분리** `apps/web/src/features/card-service/components/card-row.tsx:20` — 원칙 `I`. 멤버 후보 8개다. 읽기/쓰기/이벤트/상태 전용 타입으로 분리할 후보다. 근거: `interface CardRowProps {`
128. **[완료][P2] 큰 타입/인터페이스 분리** `apps/web/src/features/card-service/components/deck-play-review-mode-card.tsx:43` — 원칙 `I`. 멤버 후보 8개다. 읽기/쓰기/이벤트/상태 전용 타입으로 분리할 후보다. 근거: `interface DeckPlayReviewModeCardProps {`
129. **[완료][P2] 큰 타입/인터페이스 분리** `apps/web/src/features/typing-service/characters/types.ts:3` — 원칙 `I`. 멤버 후보 10개다. 읽기/쓰기/이벤트/상태 전용 타입으로 분리할 후보다. 근거: `export type CharacterDef = {`
130. **[완료][P2] 큰 타입/인터페이스 분리** `apps/web/src/features/typing-service/typing-race-solo-practice-panel.tsx:15` — 원칙 `I`. 멤버 후보 24개다. 읽기/쓰기/이벤트/상태 전용 타입으로 분리할 후보다. 근거: `interface TypingRaceSoloPracticePanelProps {`
131. **[완료][P2] 큰 타입/인터페이스 분리** `apps/web/src/features/typing-service/typing-race-solo-screen.tsx:109` — 원칙 `I`. 멤버 후보 8개다. 읽기/쓰기/이벤트/상태 전용 타입으로 분리할 후보다. 근거: `type BenchmarkNoiseState = {`
132. **[완료][P2] 큰 타입/인터페이스 분리** `apps/web/src/features/typing-service/typing-room-screen.tsx:98` — 원칙 `I`. 멤버 후보 9개다. 읽기/쓰기/이벤트/상태 전용 타입으로 분리할 후보다. 근거: `type TerritoryLobbyPanelProps = {`
133. **[완료][P2] 큰 타입/인터페이스 분리** `apps/web/src/features/typing-service/typing-room-settings-panel.tsx:42` — 원칙 `I`. 멤버 후보 8개다. 읽기/쓰기/이벤트/상태 전용 타입으로 분리할 후보다. 근거: `type TypingRoomSettingsPanelProps = {`
134. **[완료][P2] 큰 타입/인터페이스 분리** `apps/web/src/features/typing-service/typing-room-waiting-header.tsx:7` — 원칙 `I`. 멤버 후보 14개다. 읽기/쓰기/이벤트/상태 전용 타입으로 분리할 후보다. 근거: `type TypingRoomWaitingHeaderProps = {`
135. **[완료][P2] 큰 타입/인터페이스 분리** `apps/web/src/features/typing-service/use-race-room.ts:40` — 원칙 `I`. 멤버 후보 8개다. 읽기/쓰기/이벤트/상태 전용 타입으로 분리할 후보다. 근거: `export type UseRaceRoomOptions = {`
136. **[완료][P2] 큰 타입/인터페이스 분리** `apps/web/src/features/typing-service/use-race-room.ts:51` — 원칙 `I`. 멤버 후보 19개다. 읽기/쓰기/이벤트/상태 전용 타입으로 분리할 후보다. 근거: `export type UseRaceRoomResult = {`
137. **[완료][P2] 큰 타입/인터페이스 분리** `apps/web/src/features/typing-service/use-territory-battle-room.ts:46` — 원칙 `I`. 멤버 후보 9개다. 읽기/쓰기/이벤트/상태 전용 타입으로 분리할 후보다. 근거: `export type UseTerritoryBattleRoomResult = {`
138. **[완료][P2] 큰 타입/인터페이스 분리** `packages/domain/src/life-os.ts:81` — 원칙 `I`. 멤버 후보 12개다. 읽기/쓰기/이벤트/상태 전용 타입으로 분리할 후보다. 근거: `export type LifeOsDailyMetrics = {`
139. **[완료][P2] 큰 타입/인터페이스 분리** `packages/domain/src/life-os.ts:96` — 원칙 `I`. 멤버 후보 9개다. 읽기/쓰기/이벤트/상태 전용 타입으로 분리할 후보다. 근거: `export type LifeOsWeeklyMetrics = {`
140. **[완료][P2] 큰 타입/인터페이스 분리** `packages/domain/src/life-os.ts:126` — 원칙 `I`. 멤버 후보 8개다. 읽기/쓰기/이벤트/상태 전용 타입으로 분리할 후보다. 근거: `export type LifeOsReport = {`
141. **[완료][P2] 큰 타입/인터페이스 분리** `packages/ui/src/patterns/YeonBottomSheetModal/index.tsx:8` — 원칙 `I`. 멤버 후보 8개다. 읽기/쓰기/이벤트/상태 전용 타입으로 분리할 후보다. 근거: `export type YeonBottomSheetModalProps = {`
142. **[완료][P2] 큰 타입/인터페이스 분리** `packages/ui/src/patterns/YeonEditableCardRow/index.native.tsx:18` — 원칙 `I`. 멤버 후보 17개다. 읽기/쓰기/이벤트/상태 전용 타입으로 분리할 후보다. 근거: `export type YeonEditableCardRowProps = {`
143. **[완료][P2] 큰 타입/인터페이스 분리** `packages/ui/src/patterns/YeonEditableCardRow/index.tsx:8` — 원칙 `I`. 멤버 후보 15개다. 읽기/쓰기/이벤트/상태 전용 타입으로 분리할 후보다. 근거: `export type YeonEditableCardRowProps = {`

### LSP

144. **[완료][P2] instanceof 분기 축소** `apps/backend/src/main/java/world/yeon/backend/card_decks/merge_guest/repository/MergeGuestCardDeckRepository.java:40` — 원칙 `L`. 하위 타입 검사 대신 공통 인터페이스/판별된 union으로 안전하게 다룬다. 근거: `Object[] row = value instanceof Object[] arr ? arr : new Object[]{value};`
145. **[완료][P2] instanceof 분기 축소** `apps/backend/src/main/java/world/yeon/backend/card_decks/route/repository/CardDeckRouteRepository.java:101` — 원칙 `L`. 하위 타입 검사 대신 공통 인터페이스/판별된 union으로 안전하게 다룬다. 근거: `if (raw instanceof Object[] values) return values[0] == null ? null : values[0].toString();`
146. **[완료][P2] instanceof 분기 축소** `apps/backend/src/main/java/world/yeon/backend/card_decks/route/repository/CardDeckRouteRepository.java:238` — 원칙 `L`. 하위 타입 검사 대신 공통 인터페이스/판별된 union으로 안전하게 다룬다. 근거: `if (raw instanceof Object[] values) return values[0] == null ? null : values[0].toString();`
147. **[완료][P2] instanceof 분기 축소** `apps/backend/src/main/java/world/yeon/backend/card_decks/route/repository/CardDeckRouteRepository.java:258` — 원칙 `L`. 하위 타입 검사 대신 공통 인터페이스/판별된 union으로 안전하게 다룬다. 근거: `if (!(raw instanceof Object[] values) || values.length < min) {`
148. **[완료][P2] instanceof 분기 축소** `apps/backend/src/main/java/world/yeon/backend/card_decks/route/repository/CardDeckRouteRepository.java:265` — 원칙 `L`. 하위 타입 검사 대신 공통 인터페이스/판별된 union으로 안전하게 다룬다. 근거: `private Long asLong(Object value) { return value instanceof Number n ? n.longValue() : Long.parseLong(value.toString()); }`
149. **[완료][P2] instanceof 분기 축소** `apps/backend/src/main/java/world/yeon/backend/card_decks/route/repository/CardDeckRouteRepository.java:266` — 원칙 `L`. 하위 타입 검사 대신 공통 인터페이스/판별된 union으로 안전하게 다룬다. 근거: `private int asInt(Object value) { return value instanceof Number n ? n.intValue() : Integer.parseInt(value.toString()); }`
150. **[완료][P2] instanceof 분기 축소** `apps/backend/src/main/java/world/yeon/backend/card_decks/route/repository/CardDeckRouteRepository.java:269` — 원칙 `L`. 하위 타입 검사 대신 공통 인터페이스/판별된 union으로 안전하게 다룬다. 근거: `if (value instanceof OffsetDateTime offsetDateTime) return offsetDateTime;`
151. **[완료][P2] instanceof 분기 축소** `apps/backend/src/main/java/world/yeon/backend/card_decks/route/repository/CardDeckRouteRepository.java:270` — 원칙 `L`. 하위 타입 검사 대신 공통 인터페이스/판별된 union으로 안전하게 다룬다. 근거: `if (value instanceof Timestamp timestamp) return timestamp.toInstant().atOffset(ZoneOffset.UTC);`
152. **[완료][P2] instanceof 분기 축소** `apps/backend/src/main/java/world/yeon/backend/card_decks/route/repository/CardDeckRouteRepository.java:271` — 원칙 `L`. 하위 타입 검사 대신 공통 인터페이스/판별된 union으로 안전하게 다룬다. 근거: `if (value instanceof Instant instant) return instant.atOffset(ZoneOffset.UTC);`
153. **[완료][P2] instanceof 분기 축소** `apps/backend/src/main/java/world/yeon/backend/card_decks/route/repository/CardDeckRouteRepository.java:272` — 원칙 `L`. 하위 타입 검사 대신 공통 인터페이스/판별된 union으로 안전하게 다룬다. 근거: `if (value instanceof Date date) return date.toInstant().atOffset(ZoneOffset.UTC);`
154. **[완료][P2] instanceof 분기 축소** `apps/backend/src/main/java/world/yeon/backend/card_decks/route/repository/CardDeckRouteRepository.java:273` — 원칙 `L`. 하위 타입 검사 대신 공통 인터페이스/판별된 union으로 안전하게 다룬다. 근거: `if (value instanceof ZonedDateTime zonedDateTime) return zonedDateTime.toOffsetDateTime();`
155. **[완료][P2] instanceof 분기 축소** `apps/backend/src/main/java/world/yeon/backend/community_chat/repository/CommunityChatRepository.java:67` — 원칙 `L`. 하위 타입 검사 대신 공통 인터페이스/판별된 union으로 안전하게 다룬다. 근거: `if (value instanceof OffsetDateTime offsetDateTime) return offsetDateTime;`
156. **[완료][P2] instanceof 분기 축소** `apps/backend/src/main/java/world/yeon/backend/community_chat/repository/CommunityChatRepository.java:68` — 원칙 `L`. 하위 타입 검사 대신 공통 인터페이스/판별된 union으로 안전하게 다룬다. 근거: `if (value instanceof Timestamp timestamp) return timestamp.toInstant().atOffset(ZoneOffset.UTC);`
157. **[완료][P2] instanceof 분기 축소** `apps/backend/src/main/java/world/yeon/backend/root_auth/repository/AuthSessionRepository.java:302` — 원칙 `L`. 하위 타입 검사 대신 공통 인터페이스/판별된 union으로 안전하게 다룬다. 근거: `if (!(row instanceof Object[] values) || values.length < 4) {`
158. **[완료][P2] instanceof 분기 축소** `apps/backend/src/main/java/world/yeon/backend/root_auth/repository/AuthSessionRepository.java:309` — 원칙 `L`. 하위 타입 검사 대신 공통 인터페이스/판별된 union으로 안전하게 다룬다. 근거: `if (!(row instanceof Object[] values) || values.length < 7) {`
159. **[완료][P2] instanceof 분기 축소** `apps/backend/src/main/java/world/yeon/backend/root_auth/repository/AuthSessionRepository.java:324` — 원칙 `L`. 하위 타입 검사 대신 공통 인터페이스/판별된 union으로 안전하게 다룬다. 근거: `if (!(row instanceof Object[] values) || values.length < 7) {`
160. **[완료][P2] instanceof 분기 축소** `apps/backend/src/main/java/world/yeon/backend/root_auth/repository/AuthSessionRepository.java:350` — 원칙 `L`. 하위 타입 검사 대신 공통 인터페이스/판별된 union으로 안전하게 다룬다. 근거: `if (value instanceof UUID uuid) return uuid.toString();`
161. **[완료][P2] instanceof 분기 축소** `apps/backend/src/main/java/world/yeon/backend/root_auth/repository/AuthSessionRepository.java:356` — 원칙 `L`. 하위 타입 검사 대신 공통 인터페이스/판별된 union으로 안전하게 다룬다. 근거: `if (value instanceof OffsetDateTime offsetDateTime) return offsetDateTime;`
162. **[완료][P2] instanceof 분기 축소** `apps/backend/src/main/java/world/yeon/backend/root_auth/repository/AuthSessionRepository.java:357` — 원칙 `L`. 하위 타입 검사 대신 공통 인터페이스/판별된 union으로 안전하게 다룬다. 근거: `if (value instanceof Timestamp timestamp) return timestamp.toInstant().atOffset(ZoneOffset.UTC);`
163. **[완료][P2] instanceof 분기 축소** `apps/backend/src/main/java/world/yeon/backend/root_auth/repository/AuthSessionRepository.java:358` — 원칙 `L`. 하위 타입 검사 대신 공통 인터페이스/판별된 union으로 안전하게 다룬다. 근거: `if (value instanceof Instant instant) return instant.atOffset(ZoneOffset.UTC);`
164. **[완료][P2] instanceof 분기 축소** `apps/backend/src/main/java/world/yeon/backend/root_auth/repository/AuthSessionRepository.java:359` — 원칙 `L`. 하위 타입 검사 대신 공통 인터페이스/판별된 union으로 안전하게 다룬다. 근거: `if (value instanceof Date date) return date.toInstant().atOffset(ZoneOffset.UTC);`
165. **[완료][P2] instanceof 분기 축소** `apps/backend/src/main/java/world/yeon/backend/root_auth/repository/AuthSessionRepository.java:360` — 원칙 `L`. 하위 타입 검사 대신 공통 인터페이스/판별된 union으로 안전하게 다룬다. 근거: `if (value instanceof LocalDateTime localDateTime) return localDateTime.atOffset(ZoneOffset.UTC);`
166. **[완료][P2] instanceof 분기 축소** `apps/backend/src/main/java/world/yeon/backend/root_auth/repository/AuthSessionRepository.java:361` — 원칙 `L`. 하위 타입 검사 대신 공통 인터페이스/판별된 union으로 안전하게 다룬다. 근거: `if (value instanceof ZonedDateTime zonedDateTime) return zonedDateTime.toOffsetDateTime();`
167. **[완료][P2] instanceof 분기 축소** `apps/backend/src/main/java/world/yeon/backend/typing_decks/repository/TypingDeckRepository.java:317` — 원칙 `L`. 하위 타입 검사 대신 공통 인터페이스/판별된 union으로 안전하게 다룬다. 근거: `if (!(rawRow instanceof Object[] values) || values.length < minLength) {`
168. **[완료][P2] instanceof 분기 축소** `apps/backend/src/main/java/world/yeon/backend/typing_decks/repository/TypingDeckRepository.java:329` — 원칙 `L`. 하위 타입 검사 대신 공통 인터페이스/판별된 union으로 안전하게 다룬다. 근거: `if (value instanceof Number number) return number.longValue();`
169. **[완료][P2] instanceof 분기 축소** `apps/backend/src/main/java/world/yeon/backend/typing_decks/repository/TypingDeckRepository.java:335` — 원칙 `L`. 하위 타입 검사 대신 공통 인터페이스/판별된 union으로 안전하게 다룬다. 근거: `if (value instanceof Number number) return number.intValue();`
170. **[완료][P2] instanceof 분기 축소** `apps/backend/src/main/java/world/yeon/backend/typing_decks/repository/TypingDeckRepository.java:341` — 원칙 `L`. 하위 타입 검사 대신 공통 인터페이스/판별된 union으로 안전하게 다룬다. 근거: `if (value instanceof OffsetDateTime offsetDateTime) return offsetDateTime;`
171. **[완료][P2] instanceof 분기 축소** `apps/backend/src/main/java/world/yeon/backend/typing_decks/repository/TypingDeckRepository.java:342` — 원칙 `L`. 하위 타입 검사 대신 공통 인터페이스/판별된 union으로 안전하게 다룬다. 근거: `if (value instanceof Timestamp timestamp) return timestamp.toInstant().atOffset(ZoneOffset.UTC);`
172. **[완료][P2] instanceof 분기 축소** `apps/backend/src/main/java/world/yeon/backend/typing_decks/repository/TypingDeckRepository.java:343` — 원칙 `L`. 하위 타입 검사 대신 공통 인터페이스/판별된 union으로 안전하게 다룬다. 근거: `if (value instanceof Instant instant) return instant.atOffset(ZoneOffset.UTC);`
173. **[완료][P2] instanceof 분기 축소** `apps/backend/src/main/java/world/yeon/backend/typing_decks/repository/TypingDeckRepository.java:344` — 원칙 `L`. 하위 타입 검사 대신 공통 인터페이스/판별된 union으로 안전하게 다룬다. 근거: `if (value instanceof Date date) return date.toInstant().atOffset(ZoneOffset.UTC);`
174. **[완료][P2] instanceof 분기 축소** `apps/backend/src/main/java/world/yeon/backend/typing_decks/repository/TypingDeckRepository.java:345` — 원칙 `L`. 하위 타입 검사 대신 공통 인터페이스/판별된 union으로 안전하게 다룬다. 근거: `if (value instanceof ZonedDateTime zonedDateTime) return zonedDateTime.toOffsetDateTime();`
175. **[완료][P2] instanceof 분기 축소** `apps/mobile/src/features/card-service/card-deck-detail-screen.tsx:349` — 원칙 `L`. 하위 타입 검사 대신 공통 인터페이스/판별된 union으로 안전하게 다룬다. 근거: `error instanceof Error`
176. **[완료][P2] instanceof 분기 축소** `apps/mobile/src/features/card-service/card-deck-detail-screen.tsx:361` — 원칙 `L`. 하위 타입 검사 대신 공통 인터페이스/판별된 union으로 안전하게 다룬다. 근거: `error instanceof Error`
177. **[완료][P2] instanceof 분기 축소** `apps/mobile/src/features/card-service/card-deck-detail-screen.tsx:391` — 원칙 `L`. 하위 타입 검사 대신 공통 인터페이스/판별된 union으로 안전하게 다룬다. 근거: `error instanceof Error`
178. **[완료][P2] instanceof 분기 축소** `apps/mobile/src/features/card-service/card-deck-detail-screen.tsx:421` — 원칙 `L`. 하위 타입 검사 대신 공통 인터페이스/판별된 union으로 안전하게 다룬다. 근거: `error instanceof Error`

### SRP

179. **[완료][P2] 큰 파일 책임 분리** `apps/backend/src/main/java/world/yeon/backend/card_rooms/service/CardRoomService.java:1` — 원칙 `S`. 551라인 파일이다. 단일 책임 원칙 기준으로 화면/상태/IO/변환 책임 분리 후보다. 근거: `package world.yeon.backend.card_rooms.service;`
180. **[완료][P2] 큰 파일 책임 분리** `apps/backend/src/main/java/world/yeon/backend/root_auth/repository/AuthSessionRepository.java:1` — 원칙 `S`. 364라인 파일이다. 단일 책임 원칙 기준으로 화면/상태/IO/변환 책임 분리 후보다. 근거: `package world.yeon.backend.root_auth.repository;`
181. **[완료][P2] 큰 파일 책임 분리** `apps/backend/src/main/java/world/yeon/backend/root_auth/service/AuthSessionService.java:1` — 원칙 `S`. 399라인 파일이다. 단일 책임 원칙 기준으로 화면/상태/IO/변환 책임 분리 후보다. 근거: `package world.yeon.backend.root_auth.service;`
182. **[완료][P2] 큰 파일 책임 분리** `apps/backend/src/main/java/world/yeon/backend/typing_decks/repository/TypingDeckRepository.java:1` — 원칙 `S`. 350라인 파일이다. 단일 책임 원칙 기준으로 화면/상태/IO/변환 책임 분리 후보다. 근거: `package world.yeon.backend.typing_decks.repository;`
183. **[완료][P2] 큰 파일 책임 분리** `apps/backend/src/main/java/world/yeon/backend/typing_decks/service/TypingDeckService.java:1` — 원칙 `S`. 384라인 파일이다. 단일 책임 원칙 기준으로 화면/상태/IO/변환 책임 분리 후보다. 근거: `package world.yeon.backend.typing_decks.service;`
184. **[완료][P2] 큰 파일 책임 분리** `apps/mobile/src/features/card-service/card-deck-detail-screen.tsx:1` — 원칙 `S`. 694라인 파일이다. 단일 책임 원칙 기준으로 화면/상태/IO/변환 책임 분리 후보다. 근거: `import type { CardDeckItemDto } from "@yeon/api-contract/card-decks";`
185. **[완료][P2] 컴포넌트 hook 책임 분리** `apps/mobile/src/features/card-service/card-deck-detail-screen.tsx:108` — 원칙 `S`. 컴포넌트 인근 hook 호출 후보 20개다. 데이터/폼/이벤트 hook으로 분리한다. 근거: `const DeckCardRow = memo(function DeckCardRow({`
186. **[완료][P2] 컴포넌트 hook 책임 분리** `apps/mobile/src/features/card-service/card-deck-detail-screen.tsx:149` — 원칙 `S`. 컴포넌트 인근 hook 호출 후보 17개다. 데이터/폼/이벤트 hook으로 분리한다. 근거: `export function CardDeckDetailScreen({ deckId }: CardDeckDetailScreenProps) {`
187. **[완료][P2] 긴 함수 책임 분리** `apps/mobile/src/features/card-service/card-deck-detail-screen.tsx:149` — 원칙 `S`. 546라인 함수다. 검증/변환/부수효과를 작은 함수로 분리한다. 근거: `export function CardDeckDetailScreen({ deckId }: CardDeckDetailScreenProps) {`
188. **[완료][P2] 큰 파일 책임 분리** `apps/mobile/src/features/card-service/card-deck-list-screen.tsx:1` — 원칙 `S`. 523라인 파일이다. 단일 책임 원칙 기준으로 화면/상태/IO/변환 책임 분리 후보다. 근거: `import type { CardDeckDto } from "@yeon/api-contract/card-decks";`
189. **[완료][P2] 컴포넌트 hook 책임 분리** `apps/mobile/src/features/card-service/card-deck-list-screen.tsx:74` — 원칙 `S`. 컴포넌트 인근 hook 호출 후보 8개다. 데이터/폼/이벤트 hook으로 분리한다. 근거: `function DeckCard({ deck, index, onOpen }: DeckCardProps) {`
190. **[완료][P2] 컴포넌트 hook 책임 분리** `apps/mobile/src/features/card-service/card-deck-list-screen.tsx:104` — 원칙 `S`. 컴포넌트 인근 hook 호출 후보 8개다. 데이터/폼/이벤트 hook으로 분리한다. 근거: `export function CardDeckListScreen() {`
191. **[완료][P2] 긴 함수 책임 분리** `apps/mobile/src/features/card-service/card-deck-list-screen.tsx:104` — 원칙 `S`. 239라인 함수다. 검증/변환/부수효과를 작은 함수로 분리한다. 근거: `export function CardDeckListScreen() {`
192. **[완료][P2] 큰 파일 책임 분리** `apps/mobile/src/features/card-service/card-deck-play-screen.tsx:1` — 원칙 `S`. 398라인 파일에서 입력 검증/모드 배지 helper와 학습 모드 패널 렌더링을 `card-deck-play-helpers.ts`, `card-deck-play-mode-panels.tsx`로 분리해 화면 파일을 333라인으로 축소했다. 근거: `CardDeckPlayModeControl`, `CardDeckReviewModePanel`, `CardDeckFlashcardPanel`, `requirePlayDeckId`
193. **[완료][P2] 컴포넌트 hook 책임 분리** `apps/mobile/src/features/card-service/card-deck-play-screen.tsx:56` — 원칙 `S`. 화면 인근 세션/query/mutation/학습 상태 hook을 `use-card-deck-play-state.ts`로 분리했다. 화면은 `useCardDeckPlayState` 1개와 router만 조합한다. 근거: `const play = useCardDeckPlayState({ deckId });`
194. **[완료][P2] 긴 함수 책임 분리** `apps/mobile/src/features/card-service/card-deck-play-screen.tsx:56` — 원칙 `S`. 343라인 함수에서 상태/검증/부수효과를 `useCardDeckPlayState`로 분리해 화면 파일을 124라인 렌더링 조립으로 축소했다. 근거: `useCardDeckPlayState`, `resetCurrentCardVisibility`, `handleReview`
195. **[완료][P2] 큰 파일 책임 분리** `apps/mobile/src/features/card-service/card-onboarding-gate.tsx:1` — 원칙 `S`. 380라인 파일에서 hero/social/secondary/guest/email sheet 섹션과 스타일을 `card-onboarding-gate-sections.tsx`, `card-onboarding-gate-styles.ts`로 분리해 게이트 파일을 157라인으로 축소했다. 근거: `CardOnboardingHero`, `CardOnboardingSocialButtons`, `CardEmailLoginSheet`
196. **[완료][P2] 긴 함수 책임 분리** `apps/mobile/src/features/card-service/card-onboarding-gate.tsx:44` — 원칙 `S`. 이메일/소셜 로그인/회원가입 브라우저 오픈 부수효과와 입력 상태를 `use-card-onboarding-gate-state.ts`로 분리해 화면 함수는 62라인 렌더링 조립으로 축소했다. 근거: `const gate = useCardOnboardingGateState({ onAuthenticated });`
197. **[완료][P2] 긴 함수 책임 분리** `apps/mobile/src/features/card-service/card-session-context.tsx:52` — 원칙 `S`. 세션 boot/authenticate/guest/logout 상태 전이와 부수효과를 `use-card-session-state.ts`로 분리해 Provider는 Context 연결만 담당하게 축소했다. 근거: `const session = useCardSessionState();`
198. **[완료][P2] 긴 함수 책임 분리** `apps/mobile/src/features/card-service/markdown-text-field.tsx:170` — 원칙 `S`. selection/업로드/서식 삽입 상태를 `use-markdown-text-field-controller.ts`로, 툴바/아이콘/스타일/서식 helper를 `markdown-text-field-toolbar.tsx`/`markdown-text-field-styles.ts`/`markdown-text-field-formatting.ts`로 분리해 화면 함수는 텍스트 필드 조립만 담당하게 축소했다. 근거: `const controller = useMarkdownTextFieldController({`
199. **[완료][P2] 긴 함수 책임 분리** `apps/mobile/src/features/card-service/rooms/card-room-create-sheet.tsx:38` — 원칙 `S`. 카드방 생성 입력 검증/덱 조회/게스트 스냅샷 변환/참가자 토큰 저장/오류 표시를 `use-card-room-create-sheet-state.ts`로, 덱·공개범위 선택 UI와 스타일을 `card-room-create-sheet-sections.tsx`/`card-room-create-sheet-styles.ts`로 분리해 sheet 컴포넌트는 form 조립만 담당하게 축소했다. 근거: `const state = useCardRoomCreateSheetState({ onCreated, visible });`
200. **[완료][P2] 긴 함수 책임 분리** `apps/mobile/src/features/card-service/rooms/card-room-lobby-screen.tsx:88` — 원칙 `S`. 카드방 목록 조회/필터·검색 파생/라우팅/생성 sheet 상태를 `card-room-lobby-state.ts`로, 카드·필터·검색·목록 UI를 `card-room-lobby-sections.tsx`로, 스타일과 route helper를 `card-room-lobby-styles.ts`/`card-room-lobby-route.ts`로 분리해 screen은 로비 섹션 조립만 담당하게 축소했다. 근거: `const lobby = useCardRoomLobbyState();`
201. **[완료][P2] 큰 파일 책임 분리** `apps/mobile/src/features/card-service/rooms/card-room-screen.tsx:1` — 원칙 `S`. 헤더/참가자/대기 컨트롤/학습 카드/완료/채팅 렌더링을 `card-room-screen-sections.tsx`로, 스타일을 `card-room-screen-styles.ts`로 분리해 screen 파일은 연결·입장 상태와 섹션 조립만 담당하게 축소했다. 근거: `CardRoomHeader`, `CardRoomParticipantsSection`, `StudyCardSection`, `CardRoomChatSection`
202. **[완료][P2] 긴 함수 책임 분리** `apps/mobile/src/features/card-service/rooms/card-room-screen.tsx:40` — 원칙 `S`. join/rejoin, stale participant 정리, leave/start/chat 핸들러, 현재 카드방 파생 상태를 `use-card-room-screen-state.ts`로 분리해 screen 함수는 에러/연결/본문 렌더링 분기만 담당하게 축소했다. 근거: `const { ... } = useCardRoomScreenState(roomId);`
203. **[완료][P2] 긴 함수 책임 분리** `apps/mobile/src/features/card-service/rooms/use-card-room-connection.ts:43` — 원칙 `S`. 연결 오류 정규화, realtime 세션 effect, room send 액션 생성 책임을 `card-room-connection-errors.ts`, `use-card-room-realtime-session.ts`, `use-card-room-connection-actions.ts`로 분리해 public hook은 세션과 액션 조립만 담당하게 축소했다. 근거: `const { connectionState, error, roomRef, state } = useCardRoomRealtimeSession({`
204. **[완료][P2] 긴 함수 책임 분리** `apps/mobile/src/features/card-service/runtime-adapters/card-item-repository.ts:39` — 원칙 `S`. 세션 토큰 해석, 게스트 저장소 repository, 서버 API repository 책임을 `card-item-session.ts`, `card-item-guest-repository.ts`, `card-item-server-repository.ts`로 분리해 public factory는 구현 선택만 담당하게 축소했다. 근거: `return token ? createMobileServerCardItemRepository(token) : createMobileGuestCardItemRepository();`
205. **[완료][P2] 큰 파일 책임 분리** `apps/race-server/src/rooms/territory-battle-room.ts:1` — 원칙 `S`. 점령전 payload 파싱, player 생성/스냅샷, team/snapshot 집계 책임을 `territory-battle-message.ts`, `territory-battle-players.ts`, `territory-battle-snapshot.ts`로 분리해 Room 클래스는 Colyseus lifecycle과 라운드/단어 제출 흐름만 담당하게 축소했다. 근거: `createTerritoryBattleSnapshot({`
206. **[완료][P2] 컴포넌트 hook 책임 분리** `apps/web/src/features/card-service/auth-context.tsx:31` — 원칙 `S`. 인증 상태 동기화, mounted guard, focus/visibility refresh hook 책임을 `use-card-service-auth-state.ts`로 분리해 context 파일은 Provider wiring과 context read만 담당하게 축소했다. 근거: `const value = useCardServiceAuthState(isAuthenticated);`
207. **[완료][P2] 긴 함수 책임 분리** `apps/web/src/features/card-service/card-room-chat-panel.tsx:24` — 원칙 `S`. 채팅 패널 class 계산, 헤더, 메시지 리스트/버블, 입력 composer를 `card-room-chat-panel-parts.tsx`로 분리해 panel 함수는 섹션 조립만 담당하게 축소했다. 근거: `CardRoomChatMessageList`, `CardRoomChatComposer`
208. **[완료][P2] 컴포넌트 hook 책임 분리** `apps/web/src/features/card-service/card-room-create-screen.tsx:32` — 원칙 `S`. 프로필/덱/입력 상태, 게스트/인증 payload 생성, 생성 후 참가자 세션 저장과 라우팅 책임을 `use-card-room-create-form-state.ts`로 분리해 `CardRoomCreateForm`은 폼 렌더링과 이벤트 연결만 담당하게 축소했다. 근거: `const form = useCardRoomCreateFormState({ onCreated });`
209. **[완료][P2] 긴 함수 책임 분리** `apps/web/src/features/card-service/card-room-create-screen.tsx:32` — 원칙 `S`. 카드방 생성 폼의 프로필 패널, 설정 필드, 공개 여부 선택, 오류 메시지, 하단 액션 렌더링을 `card-room-create-form-parts.tsx`로 분리해 `CardRoomCreateForm`은 form shell과 submit wiring만 담당하게 축소했다. 근거: `CardRoomCreateSettingsFields form={form}`
210. **[완료][P2] 긴 함수 책임 분리** `apps/web/src/features/card-service/card-room-header.tsx:43` — 원칙 `S`. 카드방 헤더의 상태/역할 라벨 파생을 `deriveCardRoomHeaderSummary`로 분리하고, 제목/상태 영역과 역할/준비/시작/종료/나가기 액션을 `card-room-header-parts.tsx`의 작은 컴포넌트로 분리해 `CardRoomHeader`는 header shell 조립만 담당하게 축소했다. 근거: `deriveCardRoomHeaderSummary(`
211. **[완료][P2] 컴포넌트 hook 책임 분리** `apps/web/src/features/card-service/card-room-lobby-screen.tsx:35` — 원칙 `S`. 필터/검색/모달 상태, 프로필/타이핑 설정/방 목록 query, 검색 필터링과 list state 파생을 `use-card-room-lobby-state.ts`로 분리해 `CardRoomLobbyScreen`은 로비 레이아웃 렌더링만 담당하게 축소했다. 근거: `const lobby = useCardRoomLobbyState();`
212. **[완료][P2] 긴 함수 책임 분리** `apps/web/src/features/card-service/card-room-lobby-screen.tsx:35` — 원칙 `S`. 카드방 로비의 hero, 필터/검색 바, 목록 상태 surface, 방 목록 item, 생성 dialog 렌더링을 `card-room-lobby-parts.tsx`로 분리해 `CardRoomLobbyScreen`은 page shell과 섹션 조립만 담당하게 축소했다. 근거: `CardRoomLobbyRoomSection lobby={lobby}`
213. **[완료][P2] 컴포넌트 hook 책임 분리** `apps/web/src/features/card-service/card-room-screen.tsx:30` — 원칙 `S`. 카드방 프로필/참가자 세션 저장소/자동 입장 join/연결/voice call/채팅 draft와 역할·카드·시작 가능 여부 파생을 `use-card-room-screen-state.ts`로 분리해 `CardRoomScreen`은 패널 배치와 props 연결만 담당하게 축소했다. 근거: `const screen = useCardRoomScreenState(roomId);`
214. **[완료][P2] 긴 함수 책임 분리** `apps/web/src/features/card-service/card-room-screen.tsx:30` — 원칙 `S`. 카드방 화면의 오류 표시, 모바일 탭, 좌측 참가자/음성/학습 패널, 채팅 workspace 렌더링을 `card-room-screen-parts.tsx`로 분리해 `CardRoomScreen`은 page shell과 header/workspace 조립만 담당하게 축소했다. 근거: `CardRoomScreenWorkspace screen={screen}`
215. **[완료][P2] 긴 함수 책임 분리** `apps/web/src/features/card-service/card-room-study-panel.tsx:23` — 원칙 `S`. 결과 요약 파생, 대기/종료/완료 상태, 현재 카드 학습 액션, pending 상태 렌더링을 작은 함수/컴포넌트로 분리해 `CardRoomStudyPanel`은 상태별 패널 조립만 담당하게 축소했다. 근거: `CardRoomCurrentCardPanel`, `getCardRoomResultSummary`
216. **[완료][P2] 긴 함수 책임 분리** `apps/web/src/features/card-service/card-service-decks-screen.tsx:40` — 원칙 `S`. 덱 목록 query/view-state/게스트 병합 dialog 상태와 analytics 부수효과를 `use-card-service-decks-screen-state.ts`로 분리하고, header/hero/list section 렌더링을 `card-service-decks-screen-parts.tsx`로 분리해 `CardServiceDecksScreen`은 page shell과 dialog 조립만 담당하게 축소했다. 근거: `const screen = useCardServiceDecksScreenState();`
217. **[완료][P2] 긴 함수 책임 분리** `apps/web/src/features/card-service/card-service-home.tsx:31` — 원칙 `S`. 프로필/덱 CTA 상태 파생과 analytics 부수효과를 `use-card-service-home-state.ts`로 분리하고, header/intro/profile/action 렌더링을 `card-service-home-parts.tsx`로 분리해 `CardServiceHome`은 page shell과 dialog 조립만 담당하게 축소했다. 근거: `const home = useCardServiceHomeState();`
218. **[완료][P2] 컴포넌트 hook 책임 분리** `apps/web/src/features/card-service/components/add-card-form.tsx:77` — 원칙 `S`. draft localStorage load/save, beforeunload guard, upload pending, submit mutation, action state 파생을 `use-add-card-form-state.ts`로 분리해 `AddCardForm`은 에디터/미리보기 렌더링만 담당하게 축소했다. 근거: `const form = useAddCardFormState({`
219. **[완료][P2] 긴 함수 책임 분리** `apps/web/src/features/card-service/components/add-card-form.tsx:77` — 원칙 `S`. 질문/답변 에디터와 앞/뒷면 미리보기 렌더링을 `add-card-form-parts.tsx`로 분리해 `AddCardForm`은 form shell과 state hook 연결만 담당하게 축소했다. 근거: `AddCardFormEditorGrid form={form}`
220. **[완료][P2] 긴 함수 책임 분리** `apps/web/src/features/card-service/components/add-cards-panel.tsx:95` — 원칙 `S`. 모드/form id/dirty/action state/닫기 guard를 `use-add-cards-panel-state.tsx`로 분리하고, footer/mode tab/manual·bulk body 렌더링을 `add-cards-panel-parts.tsx`로 분리해 `AddCardsPanel`은 modal shell 조립만 담당하게 축소했다. 근거: `const panel = useAddCardsPanelState({ onClose });`
221. **[완료][P2] 컴포넌트 hook 책임 분리** `apps/web/src/features/card-service/components/bulk-add-cards-form.tsx:49` — 원칙 `S`. raw 입력, help visibility event, parser 결과, preview count, add/replace mutation submit, action state 파생을 `use-bulk-add-cards-form-state.ts`로 분리해 `BulkAddCardsForm`은 입력/help/status/preview 렌더링만 담당하게 축소했다. 근거: `const form = useBulkAddCardsFormState({`
222. **[완료][P2] 긴 함수 책임 분리** `apps/web/src/features/card-service/components/bulk-add-cards-form.tsx:49` — 원칙 `S`. 일괄 추가 폼의 도움말, 입력, 인식 상태, 미리보기, 덮어쓰기 안내 렌더링을 `bulk-add-cards-form-parts.tsx`로 분리해 `BulkAddCardsForm`은 상태 hook 연결과 섹션 조립만 담당하게 했다. 근거: `export function BulkAddCardsForm({`

### DIP

223. **[P3] 브라우저 전역 직접 의존 점검** `apps/web/src/features/card-service/components/card-editor-codeblock-utils.ts:144` — 원칙 `D`. 브라우저 전역 직접 접근을 런타임 포트로 감싸 SSR/테스트 안전성을 높인다. 근거: `const codeBlocks = Array.from(document.querySelectorAll("pre code"));`
224. **[P3] 브라우저 전역 직접 의존 점검** `apps/web/src/features/card-service/components/card-editor-codeblock-utils.ts:153` — 원칙 `D`. 브라우저 전역 직접 접근을 런타임 포트로 감싸 SSR/테스트 안전성을 높인다. 근거: `return document.body.innerHTML;`
225. **[P3] 브라우저 전역 직접 의존 점검** `apps/web/src/features/card-service/components/markdown-content.tsx:495` — 원칙 `D`. 브라우저 전역 직접 접근을 런타임 포트로 감싸 SSR/테스트 안전성을 높인다. 근거: `const optionGroup = document.createElement("optgroup");`
226. **[P3] 브라우저 전역 직접 의존 점검** `apps/web/src/features/card-service/components/markdown-content.tsx:499` — 원칙 `D`. 브라우저 전역 직접 접근을 런타임 포트로 감싸 SSR/테스트 안전성을 높인다. 근거: `const option = document.createElement("option");`
227. **[P3] 브라우저 전역 직접 의존 점검** `apps/web/src/features/card-service/components/play-card.tsx:78` — 원칙 `D`. 브라우저 전역 직접 접근을 런타임 포트로 감싸 SSR/테스트 안전성을 높인다. 근거: `const previousCursor = document.body.style.cursor;`
228. **[P3] 브라우저 전역 직접 의존 점검** `apps/web/src/features/card-service/components/play-card.tsx:79` — 원칙 `D`. 브라우저 전역 직접 접근을 런타임 포트로 감싸 SSR/테스트 안전성을 높인다. 근거: `const previousUserSelect = document.body.style.userSelect;`
229. **[P3] 브라우저 전역 직접 의존 점검** `apps/web/src/features/card-service/components/play-card.tsx:81` — 원칙 `D`. 브라우저 전역 직접 접근을 런타임 포트로 감싸 SSR/테스트 안전성을 높인다. 근거: `document.body.style.cursor = "nwse-resize";`
230. **[P3] 브라우저 전역 직접 의존 점검** `apps/web/src/features/card-service/components/play-card.tsx:82` — 원칙 `D`. 브라우저 전역 직접 접근을 런타임 포트로 감싸 SSR/테스트 안전성을 높인다. 근거: `document.body.style.userSelect = "none";`
231. **[P3] 브라우저 전역 직접 의존 점검** `apps/web/src/features/card-service/components/play-card.tsx:95` — 원칙 `D`. 브라우저 전역 직접 접근을 런타임 포트로 감싸 SSR/테스트 안전성을 높인다. 근거: `document.body.style.cursor = previousCursor;`
232. **[P3] 브라우저 전역 직접 의존 점검** `apps/web/src/features/card-service/components/play-card.tsx:96` — 원칙 `D`. 브라우저 전역 직접 접근을 런타임 포트로 감싸 SSR/테스트 안전성을 높인다. 근거: `document.body.style.userSelect = previousUserSelect;`
233. **[P3] 브라우저 전역 직접 의존 점검** `apps/web/src/features/card-service/components/play-card.tsx:97` — 원칙 `D`. 브라우저 전역 직접 접근을 런타임 포트로 감싸 SSR/테스트 안전성을 높인다. 근거: `window.removeEventListener("pointermove", handlePointerMove);`
234. **[P3] 브라우저 전역 직접 의존 점검** `apps/web/src/features/card-service/components/play-card.tsx:98` — 원칙 `D`. 브라우저 전역 직접 접근을 런타임 포트로 감싸 SSR/테스트 안전성을 높인다. 근거: `window.removeEventListener("pointerup", handlePointerUp);`
235. **[P3] 브라우저 전역 직접 의존 점검** `apps/web/src/features/card-service/components/play-card.tsx:99` — 원칙 `D`. 브라우저 전역 직접 접근을 런타임 포트로 감싸 SSR/테스트 안전성을 높인다. 근거: `window.removeEventListener("pointercancel", handlePointerUp);`
236. **[P3] 브라우저 전역 직접 의존 점검** `apps/web/src/features/card-service/components/play-card.tsx:102` — 원칙 `D`. 브라우저 전역 직접 접근을 런타임 포트로 감싸 SSR/테스트 안전성을 높인다. 근거: `window.addEventListener("pointermove", handlePointerMove);`
237. **[P3] 브라우저 전역 직접 의존 점검** `apps/web/src/features/card-service/components/play-card.tsx:103` — 원칙 `D`. 브라우저 전역 직접 접근을 런타임 포트로 감싸 SSR/테스트 안전성을 높인다. 근거: `window.addEventListener("pointerup", handlePointerUp);`
238. **[P3] 브라우저 전역 직접 의존 점검** `apps/web/src/features/card-service/components/play-card.tsx:104` — 원칙 `D`. 브라우저 전역 직접 접근을 런타임 포트로 감싸 SSR/테스트 안전성을 높인다. 근거: `window.addEventListener("pointercancel", handlePointerUp);`
239. **[P3] 브라우저 전역 직접 의존 점검** `apps/web/src/features/card-service/deck-play-screen.tsx:261` — 원칙 `D`. 브라우저 전역 직접 접근을 런타임 포트로 감싸 SSR/테스트 안전성을 높인다. 근거: `window.addEventListener("keydown", handleReviewShortcut);`
240. **[P3] 브라우저 전역 직접 의존 점검** `apps/web/src/features/card-service/deck-play-screen.tsx:262` — 원칙 `D`. 브라우저 전역 직접 접근을 런타임 포트로 감싸 SSR/테스트 안전성을 높인다. 근거: `return () => window.removeEventListener("keydown", handleReviewShortcut);`
241. **[P3] 브라우저 전역 직접 의존 점검** `packages/domain/src/life-os.ts:672` — 원칙 `D`. 브라우저 전역 직접 접근을 런타임 포트로 감싸 SSR/테스트 안전성을 높인다. 근거: `const plannedCount = window.filter(`
242. **[P3] 브라우저 전역 직접 의존 점검** `packages/ui/src/hooks/YeonBrowserHooks/index.ts:9` — 원칙 `D`. 브라우저 전역 직접 접근을 런타임 포트로 감싸 SSR/테스트 안전성을 높인다. 근거: `const previousOverflow = document.body.style.overflow;`
243. **[P3] 브라우저 전역 직접 의존 점검** `packages/ui/src/hooks/YeonBrowserHooks/index.ts:10` — 원칙 `D`. 브라우저 전역 직접 접근을 런타임 포트로 감싸 SSR/테스트 안전성을 높인다. 근거: `document.body.style.overflow = "hidden";`
244. **[P3] 브라우저 전역 직접 의존 점검** `packages/ui/src/hooks/YeonBrowserHooks/index.ts:13` — 원칙 `D`. 브라우저 전역 직접 접근을 런타임 포트로 감싸 SSR/테스트 안전성을 높인다. 근거: `document.body.style.overflow = previousOverflow;`
245. **[P3] 브라우저 전역 직접 의존 점검** `packages/ui/src/hooks/YeonBrowserHooks/index.ts:22` — 원칙 `D`. 브라우저 전역 직접 접근을 런타임 포트로 감싸 SSR/테스트 안전성을 높인다. 근거: `document.body.classList.add(className);`
246. **[P3] 브라우저 전역 직접 의존 점검** `packages/ui/src/hooks/YeonBrowserHooks/index.ts:25` — 원칙 `D`. 브라우저 전역 직접 접근을 런타임 포트로 감싸 SSR/테스트 안전성을 높인다. 근거: `document.body.classList.remove(className);`
247. **[P3] 브라우저 전역 직접 의존 점검** `packages/ui/src/hooks/YeonBrowserHooks/index.ts:44` — 원칙 `D`. 브라우저 전역 직접 접근을 런타임 포트로 감싸 SSR/테스트 안전성을 높인다. 근거: `document.addEventListener(type, listener);`
248. **[P3] 브라우저 전역 직접 의존 점검** `packages/ui/src/hooks/YeonBrowserHooks/index.ts:45` — 원칙 `D`. 브라우저 전역 직접 접근을 런타임 포트로 감싸 SSR/테스트 안전성을 높인다. 근거: `return () => document.removeEventListener(type, listener);`
249. **[P3] 브라우저 전역 직접 의존 점검** `packages/ui/src/hooks/YeonBrowserHooks/index.ts:66` — 원칙 `D`. 브라우저 전역 직접 접근을 런타임 포트로 감싸 SSR/테스트 안전성을 높인다. 근거: `document.addEventListener(type, listener);`
250. **[P3] 브라우저 전역 직접 의존 점검** `packages/ui/src/hooks/YeonBrowserHooks/index.ts:67` — 원칙 `D`. 브라우저 전역 직접 접근을 런타임 포트로 감싸 SSR/테스트 안전성을 높인다. 근거: `return () => document.removeEventListener(type, listener);`
251. **[P3] 브라우저 전역 직접 의존 점검** `packages/ui/src/hooks/YeonBrowserHooks/index.ts:92` — 원칙 `D`. 브라우저 전역 직접 접근을 런타임 포트로 감싸 SSR/테스트 안전성을 높인다. 근거: `window.addEventListener(type, listener, options);`
252. **[P3] 브라우저 전역 직접 의존 점검** `packages/ui/src/hooks/YeonBrowserHooks/index.ts:93` — 원칙 `D`. 브라우저 전역 직접 접근을 런타임 포트로 감싸 SSR/테스트 안전성을 높인다. 근거: `return () => window.removeEventListener(type, listener, options);`
253. **[P3] 브라우저 전역 직접 의존 점검** `packages/ui/src/primitives/YeonPortal/index.tsx:13` — 원칙 `D`. 브라우저 전역 직접 접근을 런타임 포트로 감싸 SSR/테스트 안전성을 높인다. 근거: `return createPortal(children, document.body);`
254. **[P3] 브라우저 전역 직접 의존 점검** `packages/ui/src/rich-content/YeonRichDom/index.ts:5` — 원칙 `D`. 브라우저 전역 직접 접근을 런타임 포트로 감싸 SSR/테스트 안전성을 높인다. 근거: `return window.DOMParser;`
255. **[P3] 브라우저 전역 직접 의존 점검** `packages/ui/src/runtime/YeonBrowserRuntime/index.ts:139` — 원칙 `D`. 브라우저 전역 직접 접근을 런타임 포트로 감싸 SSR/테스트 안전성을 높인다. 근거: `return kind === "local" ? window.localStorage : window.sessionStorage;`

### OCP

256. **[P3] 상태 분기 매핑/전략화** `apps/backend/src/main/java/world/yeon/backend/card_decks/assets/service/CardDeckAssetStorage.java:68` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `if (attempt == 3 || !RETRYABLE_STATUS_CODES.contains(error.statusCode())) {`
257. **[P3] 상태 분기 매핑/전략화** `apps/backend/src/main/java/world/yeon/backend/card_decks/assets/service/CardDeckAssetStorage.java:99` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `if (error.statusCode() == 404) {`
258. **[P3] 상태 분기 매핑/전략화** `apps/backend/src/main/java/world/yeon/backend/card_decks/assets/service/CardDeckAssetStorage.java:102` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `if (attempt == 3 || !RETRYABLE_STATUS_CODES.contains(error.statusCode())) {`
259. **[P3] 상태 분기 매핑/전략화** `apps/backend/src/main/java/world/yeon/backend/card_rooms/service/CardRoomService.java:157` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `if (!CardRoomStatus.WAITING.matches(room.status()) && request != null`
260. **[P3] 상태 분기 매핑/전략화** `apps/backend/src/main/java/world/yeon/backend/card_rooms/service/CardRoomService.java:181` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `if (!CardRoomStatus.WAITING.matches(room.status())) {`
261. **[P3] 상태 분기 매핑/전략화** `apps/backend/src/main/java/world/yeon/backend/card_rooms/service/CardRoomService.java:186` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `if (participants.stream().anyMatch((item) -> !CardRoomParticipantRole.fromNullable(item.role(), CardRoomParticipantRole.UNASSIGNED).isAssigned())) {`
262. **[P3] 상태 분기 매핑/전략화** `apps/backend/src/main/java/world/yeon/backend/card_rooms/service/CardRoomService.java:256` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `if (!CardRoomParticipantRole.CHECKER.matches(participant.role())) {`
263. **[P3] 상태 분기 매핑/전략화** `apps/backend/src/main/java/world/yeon/backend/card_rooms/service/CardRoomService.java:259` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `if (!CardRoomStatus.IN_PROGRESS.matches(room.status())) {`
264. **[P3] 상태 분기 매핑/전략화** `apps/backend/src/main/java/world/yeon/backend/card_rooms/service/CardRoomService.java:272` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `if (!CardRoomStatus.IN_PROGRESS.matches(room.status())) {`
265. **[P3] 상태 분기 매핑/전략화** `apps/backend/src/main/java/world/yeon/backend/card_rooms/service/CardRoomService.java:329` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `if (!CardRoomStatus.IN_PROGRESS.matches(room.status())) {`
266. **[P3] 상태 분기 매핑/전략화** `apps/backend/src/main/java/world/yeon/backend/card_rooms/service/CardRoomService.java:346` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `if (result.requiresChecker() && !CardRoomParticipantRole.CHECKER.matches(participant.role())) {`
267. **[P3] 상태 분기 매핑/전략화** `apps/backend/src/main/java/world/yeon/backend/card_rooms/service/CardRoomService.java:349` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `if (result.requiresMemorizer() && !CardRoomParticipantRole.MEMORIZER.matches(participant.role())) {`
268. **[P3] 상태 분기 매핑/전략화** `apps/backend/src/main/java/world/yeon/backend/card_rooms/service/CardRoomService.java:453` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `if (!CardRoomStatus.WAITING.matches(room.status()) || remaining.size() < 2) {`
269. **[P3] 상태 분기 매핑/전략화** `apps/backend/src/main/java/world/yeon/backend/card_rooms/service/CardRoomService.java:468` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `if (CardRoomStatus.CLOSED.matches(room.status())) {`
270. **[P3] 상태 분기 매핑/전략화** `apps/backend/src/main/java/world/yeon/backend/card_rooms/service/CardRoomService.java:475` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `if (CardRoomStatus.CLOSED.matches(room.status()) || CardRoomStatus.FINISHED.matches(room.status())) {`
271. **[P3] 상태 분기 매핑/전략화** `apps/backend/src/main/java/world/yeon/backend/root_auth/service/AuthSessionService.java:89` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `if (providers.isEmpty()) {`
272. **[P3] 상태 분기 매핑/전략화** `apps/backend/src/main/java/world/yeon/backend/root_auth/service/AuthSessionService.java:126` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `if (!isSocialProvider(provider) || code == null || codeVerifier == null) {`
273. **[P3] 상태 분기 매핑/전략화** `apps/backend/src/main/java/world/yeon/backend/root_auth/service/AuthSessionService.java:151` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `if (providers.isEmpty() || isDefaultDevAccount(user, providers)) {`
274. **[P3] 상태 분기 매핑/전략화** `apps/backend/src/main/java/world/yeon/backend/root_auth/service/AuthSessionService.java:180` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `if (ROLE_ADMIN.equals(user.role())) {`
275. **[P3] 상태 분기 매핑/전략화** `apps/backend/src/main/java/world/yeon/backend/root_auth/service/AuthSessionService.java:251` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `if (provider.equals(identity.provider()) && !providerUserId.equals(identity.providerUserId())) {`
276. **[P3] 상태 분기 매핑/전략화** `apps/backend/src/main/java/world/yeon/backend/root_auth/social/SocialIdentityProviderClient.java:32` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `return switch (provider) {`
277. **[P3] 상태 분기 매핑/전략화** `apps/backend/src/main/java/world/yeon/backend/root_auth/social/SocialIdentityProviderClient.java:127` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `if (response.statusCode() < 200 || response.statusCode() >= 300) {`
278. **[P3] 상태 분기 매핑/전략화** `apps/backend/src/main/java/world/yeon/backend/typing_character_frames/service/TypingCharacterFrameService.java:55` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `if (ADMIN_ROLE.equals(user.role()) || adminSeedEmails.contains(normalizeEmail(user.email()))) {`
279. **[P3] 상태 분기 매핑/전략화** `apps/backend/src/main/java/world/yeon/backend/typing_decks/service/TypingDeckService.java:312` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `if (!SOURCE_USER.equals(row.source())) {`
280. **[P3] 상태 분기 매핑/전략화** `apps/mobile/src/features/card-service/card-deck-detail-screen.tsx:403` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `if (sheetState.kind !== "edit") {`
281. **[P3] 상태 분기 매핑/전략화** `apps/mobile/src/features/card-service/card-deck-play-screen.tsx:76` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `if (mode === CARD_SERVICE_MODE.server && sessionToken) {`
282. **[P3] 상태 분기 매핑/전략화** `apps/mobile/src/features/card-service/card-onboarding-gate.tsx:91` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `if (result.status === "success") {`
283. **[P3] 상태 분기 매핑/전략화** `apps/mobile/src/features/card-service/card-onboarding-gate.tsx:98` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `if (result.status === "error") {`
284. **[P3] 상태 분기 매핑/전략화** `apps/mobile/src/features/card-service/markdown-text-field.tsx:190` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `if (typeof maxLength === "number" && result.value.length > maxLength) {`
285. **[P3] 상태 분기 매핑/전략화** `apps/mobile/src/features/card-service/rooms/card-room-lobby-screen.tsx:42` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `if (status === "waiting") return CARD_SERVICE_TEXT.rooms.statusWaiting;`
286. **[P3] 상태 분기 매핑/전략화** `apps/mobile/src/features/card-service/rooms/card-room-lobby-screen.tsx:43` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `if (status === "finished" || status === "closed")`
287. **[P3] 상태 분기 매핑/전략화** `apps/mobile/src/features/card-service/social-login.ts:61` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `if (result.type !== "success") {`
288. **[P3] 상태 분기 매핑/전략화** `apps/race-server/src/rooms/card-room-participant-token.ts:43` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `if (typeof token !== "string" || token.length === 0) {`
289. **[P3] 상태 분기 매핑/전략화** `apps/race-server/src/rooms/card-room.ts:58` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `if (typeof obj.sdp !== "string" || obj.sdp.trim().length === 0) return null;`
290. **[P3] 상태 분기 매핑/전략화** `apps/race-server/src/rooms/card-room.ts:84` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `if (!candidateObj || typeof candidateObj !== "object") return null;`
291. **[P3] 상태 분기 매핑/전략화** `apps/race-server/src/rooms/card-room.ts:139` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `if (typeof muted !== "boolean") return null;`
292. **[P3] 상태 분기 매핑/전략화** `apps/race-server/src/rooms/star-lobby-room.ts:62` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `if (event.type !== STAR_LOBBY_LIVE_EVENT_TYPE.ROOM_OBSERVED) return false;`
293. **[P3] 상태 분기 매핑/전략화** `apps/race-server/src/rooms/star-lobby-room.ts:90` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `if (event.type === STAR_LOBBY_LIVE_EVENT_TYPE.ROOM_OBSERVED) {`
294. **[P3] 상태 분기 매핑/전략화** `apps/race-server/src/rooms/star-lobby-room.ts:93` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `if (event.type === STAR_LOBBY_LIVE_EVENT_TYPE.ROOM_DISAPPEARED) {`
295. **[P3] 상태 분기 매핑/전략화** `apps/race-server/src/rooms/star-lobby-room.ts:113` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `if (payload.type === STAR_LOBBY_LIVE_EVENT_TYPE.ALERT_MATCHED) {`
296. **[P3] 상태 분기 매핑/전략화** `apps/race-server/src/rooms/star-lobby-room.ts:172` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `if (event.type === STAR_LOBBY_LIVE_EVENT_TYPE.ALERT_MATCHED) {`
297. **[P3] 상태 분기 매핑/전략화** `apps/race-server/src/rooms/territory-battle-room.ts:39` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `if (!isRecord(payload) || typeof payload.word !== "string") return null;`
298. **[P3] 상태 분기 매핑/전략화** `apps/race-server/src/rooms/typing-race-room.ts:153` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `prompt: "if (!room || room.status !== 'waiting') return null;",`
299. **[P3] 상태 분기 매핑/전략화** `apps/race-server/src/rooms/typing-race-room.ts:236` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `if (typeof obj.sdp !== "string" || !obj.sdp.trim()) {`
300. **[P3] 상태 분기 매핑/전략화** `apps/race-server/src/rooms/typing-race-room.ts:265` — 원칙 `O`. 상태/variant/provider 분기를 매핑 테이블 또는 전략 객체로 확장 가능하게 바꾼다. 근거: `if (!candidateObj || typeof candidateObj !== "object") {`

## 47차 적용 완료

- 항목 202 완료: 모바일 `CardRoomScreen` 내부의 입장/재입장 effect, stale participant 정리, 퇴장/시작/역할/준비/채팅 핸들러, 현재 카드·역할·시작 가능 여부 파생 상태를 `use-card-room-screen-state.ts`로 이동했다. Screen 파일은 연결 상태별 안내와 섹션 조립만 담당한다.

## 48차 적용 완료

- 항목 203 완료: 모바일 카드방 realtime 연결 훅에서 네트워크 오류 메시지 정규화, Colyseus 세션 연결/cleanup effect, room send 액션 생성을 별도 모듈로 분리했다. `useCardRoomConnection`은 세션 상태와 액션을 반환하는 조립 훅만 담당한다.

## 49차 적용 완료

- 항목 204 완료: 모바일 카드 아이템 repository 어댑터에서 세션 판정, 게스트 저장소 구현, 서버 API 구현을 별도 모듈로 분리했다. `createMobileCardItemRepository`는 token 존재 여부에 따라 guest/server repository 구현을 선택하는 조립 책임만 담당한다.

## 50차 적용 완료

- 항목 205 완료: race-server 점령전 Room에서 submit payload 파싱, player 생성/스냅샷 변환, team/snapshot 집계를 별도 모듈로 분리했다. `TerritoryBattleRoom`은 방 생성/참가/이탈/reconnect, 라운드 시작/종료, 단어 제출 처리와 broadcast만 담당한다.

## 51차 적용 완료

- 항목 206 완료: 웹 카드 인증 context에서 인증 상태 동기화, mounted guard, 세션 refresh, focus/visibility 이벤트 hook 책임을 `use-card-service-auth-state.ts`로 이동했다. `auth-context.tsx`는 context 생성, Provider wiring, context read helper만 담당한다.

## 52차 적용 완료

- 항목 207 완료: 웹 카드방 채팅 패널에서 panel class 계산, 헤더, 메시지 리스트/버블, 채팅 입력 composer를 `card-room-chat-panel-parts.tsx`로 분리했다. `CardRoomChatPanel`은 props를 받아 섹션을 조립하는 책임만 담당한다.

## 53차 적용 완료

- 항목 208 완료: `CardRoomCreateForm` 주변 hook/폼/이벤트 책임을 `useCardRoomCreateFormState`로 분리하고, 게스트 payload 생성 및 참가자 세션 저장을 별도 함수로 좁혔다.

## 54차 적용 완료

- 항목 209 완료: `CardRoomCreateForm`의 렌더 섹션을 `CardRoomCreateProfilePanel`, `CardRoomCreateSettingsFields`, `CardRoomCreateErrorMessage`, `CardRoomCreateActions`로 분리했다.

## 55차 적용 완료

- 항목 210 완료: `CardRoomHeader`의 상태 요약 파생과 액션 렌더링을 `CardRoomHeaderTitle`, `CardRoomHeaderActions`, `CardRoomRoleToggle`, `CardRoomReadyButton`, `CardRoomStartButton`, `CardRoomEndButton`, `CardRoomLeaveLink`로 분리했다.

## 56차 적용 완료

- 항목 211 완료: `CardRoomLobbyScreen`의 필터/검색/모달/프로필/목록 query와 파생 list state를 `useCardRoomLobbyState`로 분리했다.

## 57차 적용 완료

- 항목 212 완료: `CardRoomLobbyScreen`의 hero/list/dialog 렌더링을 `CardRoomLobbyHero`, `CardRoomLobbyRoomSection`, `CardRoomLobbyCreateDialog`와 하위 상태 컴포넌트로 분리했다.

## 58차 적용 완료

- 항목 213 완료: `CardRoomScreen`의 입장 세션 복구/저장, participant 이탈 정리, voice participant 파생, 채팅 submit/leave 이벤트를 `useCardRoomScreenState`로 분리했다.

## 59차 적용 완료

- 항목 214 완료: `CardRoomScreen`의 오류 메시지와 workspace 렌더링을 `CardRoomScreenError`, `CardRoomScreenWorkspace`, `CardRoomScreenSidePanel`, `CardRoomScreenMobileTabs`로 분리했다.
