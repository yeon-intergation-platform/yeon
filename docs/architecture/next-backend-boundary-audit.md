# Next 백엔드 역할 경계 감사

기준: `origin/main` (`2026-05-12` 작업 시점)

## 결론

- 현재 구현은 Spring 이관이 상당히 진행됐지만, Next가 아직 백엔드 역할을 맡는 구간이 남아 있다.
- 새 기능을 계속 Next 서비스/DB 위에 얹으면 확장성 있는 구조가 아니라 마이그레이션 부채가 늘어난다.
- 앞으로 신규 백엔드 역할의 source of truth는 Spring(`apps/backend`)이다. Next는 UI, 렌더링, 쿠키/헤더 브리지, Spring 호출 BFF까지만 담당한다.

## origin/main 실측

- `apps/web/src/app/api/**/route.ts`: 130개
- Spring client(`*-spring-client`)를 호출하는 route: 88개
- `@/server/services`, `@/server/repositories`, `@/server/auth`를 직접 참조하는 route: 67개
- `@/server/db`를 route에서 직접 참조하는 파일: 0개

직접 Next 백엔드 역할이 남은 주요 영역:

| 영역                    | route 수 | 판단                                                                                                                  |
| ----------------------- | -------: | --------------------------------------------------------------------------------------------------------------------- |
| `v1/chat-service`       |       18 | 일부 Spring 이관됨. feed guest CRUD, auth/session, chat room 일부가 Next 서비스에 남아 있어 확장 전 Spring 이관 필요. |
| `api/auth`              |       14 | 루트 OAuth/credential/session 쿠키 흐름이 Next에 남아 있음. 인증 source of truth를 Spring으로 옮길 별도 계획 필요.    |
| `v1/counseling-records` |        7 | Spring client와 Next AI/파일 처리 서비스가 혼재. 장기 상태와 권한은 Spring으로 고정해야 함.                           |
| `v1/integrations`       |        6 | OAuth/파일 분석/임포트 브리지 성격이 강함. 외부 API 프록시와 도메인 쓰기 경계를 분리해야 함.                          |
| `v1/typing-decks`       |        6 | Spring client와 기본 덱 fallback/시드 생성이 혼재. 기본 데이터 source of truth 정리가 필요.                           |
| `v1/spaces`             |        5 | export/sync 일부가 Next 서비스에 남아 있음. Google Sheets 실행 로직은 Spring 이관 후보.                               |
| `v1/card-decks`         |        3 | Spring 이관이 진행됐지만 이미지 asset/object storage와 auth bridge가 Next에 남아 있음.                                |

## 현재 기능별 확장성 판단

### 커뮤니티 글/댓글 CRUD

- 현재 구현: `apps/web/src/app/api/v1/chat-service/feed/**` route가 `apps/web/src/server/services/chat-service/feed-service.ts`와 `common.ts`를 직접 호출한다.
- Spring 상태: `apps/backend/.../chat_service_feed`에 list/create/replies는 있으나, guest nickname/password 작성자 모델과 글 수정/삭제/댓글 삭제가 부족하다.
- 판단: 사용자가 요구한 익명 글/댓글 CRUD는 제품 동작은 맞지만, 장기 도메인 구조로는 땜빵에 가깝다.
- 보완 방향: guest actor, password hash, post ownership, update/delete/reply-delete를 Spring `chat_service_feed`에 추가한 뒤 Next route는 Spring client만 호출해야 한다.

### 실시간 채팅 진입/위젯

- 현재 구현: `/community`와 카드/타이핑 서비스 내부 위젯은 `CommunityChatWidget`을 재사용한다.
- 판단: UI 컴포넌트 재사용 구조는 확장 가능하다.
- 한계: 메시지 갱신은 polling 기반이며, “실시간” source of truth가 Next chat service와 Spring client로 혼재되어 있다.
- 보완 방향: 채팅방/메시지 API는 Spring으로 고정하고, 실제 realtime 요구가 커지면 SSE/WebSocket은 Spring 또는 race-server처럼 별도 realtime 서비스에서 담당한다.

### 카드/타이핑 서비스 내 채팅 배치

- 현재 구현: `apps/web/src/app/card-service/layout.tsx`, `apps/web/src/app/typing-service/layout.tsx`에서 compact widget을 layout 공통으로 배치한다.
- 판단: 화면별 중복 구현이 아니라 공통 위젯이라 UI 확장성은 괜찮다.
- 한계: fixed overlay라 서비스 화면의 핵심 조작과 겹칠 수 있다. 페이지 내부 슬롯/패널 형태로 확장할 설계가 필요하다.

### 카드/타이핑 도메인

- 카드 덱 API는 Spring client 사용 비중이 높아져 확장성 방향은 맞다. 다만 asset storage와 일부 auth bridge가 Next에 남아 있다.
- 타이핑 덱 API는 Spring client와 기본 덱 fallback이 혼재한다. 기본 덱/seed 생성의 source of truth를 Spring 또는 shared domain으로 확정해야 한다.

## 신규 작업 규칙

1. 새 DB 테이블, 새 도메인 service, 권한 판정, mutation API는 Spring에 만든다.
2. Next route는 요청 파싱, 쿠키/헤더 브리지, Spring client 호출, 응답 schema parse만 담당한다.
3. 기존 Next backend code를 수정해야 하면 “호환 유지”인지 “Spring 이관 전 임시 수정”인지 백로그에 명시한다.
4. 커뮤니티/채팅 추가 기능은 먼저 `apps/backend`의 chat service 패키지에 계약을 추가하고, 그 다음 web route를 얇게 연결한다.
