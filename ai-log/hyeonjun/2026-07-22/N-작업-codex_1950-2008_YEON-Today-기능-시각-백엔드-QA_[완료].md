# YEON Today 기능·시각·백엔드 QA

- 시작: 2026-07-22 19:50 KST
- 종료: 2026-07-22 20:08 KST
- 상태: 완료
- 대상: `/today/record`, Spring `today` 도메인
- 백로그: `docs/product/backlog/2026-07-22-yeon-today-record-qa-2.md`

## 요청

- 하루 기록 기능 전체 동작 확인
- 데스크톱·모바일 시각 QA
- 활동 선택 버튼 잘림 수정
- Spring N+1 및 상태 로직 점검

## 현재 근거

- 선택 버튼은 바깥 `ring-offset`을 사용하지만 목록 컨테이너가 `overflow-x-auto`라 세로 ring을 잘라낼 수 있다.
- 기록 슬롯은 `today_activity_slots`와 `today_activity_types`를 한 번의 JOIN으로 조회한다.
- 브라우저 변경 검증은 로컬 PostgreSQL과 독립 개발 계정으로 수행한다.

## 진행 기록

- [x] 화면 정의서·기존 QA 로그·현재 구현 확인
- [x] 실제 기능과 반응형 기준선 캡처
- [x] 프론트엔드 문제 수정 및 회귀 테스트
- [x] 백엔드 조회 수·상태 로직 테스트
- [x] 검증 및 PR·배포 준비

## 발견 원인과 수정

### 프론트엔드

- 원인: 선택 버튼의 `ring-2 ring-offset-2`가 버튼 외부 4px까지 그려지지만, 활동 행은 `overflow-x-auto`이면서 위·좌측 padding이 0이라 ring을 잘랐다.
- 수정: 활동 행에 4px padding을 주고 외부 정렬은 음수 margin으로 보정했다.
- 수정 후 실측: 행 padding 상·우·하·좌 모두 4px, 선택 버튼과 행 경계 간격 4px, 문서 가로 overflow 0px.

### 백엔드

- N+1 없음: `TodayRepository.listActivitySlots`가 슬롯과 활동을 단일 JOIN으로 매핑한다. 24개 슬롯을 반환해도 repository 조회는 1회다.
- 불필요 조회 제거: `getRecord`와 `requireActivityType`에서 활동 목록 초기화 조회를 제거했다. 조회 1회, 기록 추가 3회(활동 단건 확인·upsert·기록 JOIN 조회)로 데이터 크기와 무관하게 고정된다.
- 상태 경계 확인: 소유자별 FK, 시간 0~23 제약, 날짜·시간 unique, 비활성 활동 409 거부, 메모 200자, 날짜 형식 검증, optimistic version을 확인했다.

## 브라우저 기능 검증

- [x] 서버 저장 기반 시간 블록 생성·다른 활동으로 교체
- [x] 새로고침 후 기록 유지·삭제
- [x] 사용자 활동 생성·선택·숨김 및 과거 기록 표시 유지
- [x] 달력 날짜 변경과 `/today` ↔ `/today/record` 날짜 query 유지
- [x] legacy `yeon.todo-service.state.v1` localStorage 미사용
- [x] Today API 4xx/5xx, page error, console error 없음
- [x] 390px·1024px·1440px 문서 가로 overflow 없음
- [x] 표시된 버튼에 접근성 이름 누락 없음

## 시각 증거

- 수정 전 선택 ring: `yeon-today-record-qa-2-screenshots/before-activity-selection-ring-desktop.png`
- 수정 후 선택 ring: `yeon-today-record-qa-2-screenshots/after-activity-selection-ring-desktop.png`
- 수정 후 데스크톱: `yeon-today-record-qa-2-screenshots/after-record-empty-desktop.png`
- 수정 후 모바일: `yeon-today-record-qa-2-screenshots/after-record-mobile.png`
- 수정 후 태블릿: `yeon-today-record-qa-2-screenshots/after-record-tablet.png`

## 자동화 검증

- `TodayServiceTests`, `TodayControllerTests`: 13개 통과
- Web Vitest: 263개 파일, 1,141개 테스트 통과
- Web lint, typecheck, production build 통과
- `sync-skills --check`, project SSOT, `git diff --check` 통과
- Spring 전체: 633개 중 631개 통과. 기존 `LayeredArchitectureTest` 2건 실패:
  - 테스트 내부 `@RestController` 2개가 `..controller..` 패키지 밖에 있음
  - 게임 서비스 테스트가 common↔comments/library/likes 순환참조를 만듦
  - Today 소스·테스트는 위반 목록에 없으며 관련 13개 테스트는 별도 통과

## 범위 밖 관찰

- 개발 로그인 시 `experience_log.user_id` FK 경고가 발생하지만 로그인과 Today 기능은 정상 동작한다. Today가 아닌 개발 로그인/경험치 시드 정합성 문제이므로 이번 변경에 섞지 않는다.
