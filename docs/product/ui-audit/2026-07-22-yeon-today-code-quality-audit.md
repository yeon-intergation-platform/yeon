# YEON Today 코드 품질 감사

## 감사 기준

- 기준 커밋: `dec32582c1435ded2cc6012f119b3ef36f9d8961`
- 범위: Spring Today 도메인, Flyway V23/V24, 공용 계약·클라이언트, Next BFF, 웹 보드·하루 기록·공통 shell, 테스트·QA
- 원칙: source of truth, 상태 정합성, 재시도 안전성, 입력 검증, 실패 가시성, SRP/DRY/KISS, 테스트 가능성
- 실행 백로그: [`../backlog/2026-07-22-yeon-today-quality-refactor.md`](../backlog/2026-07-22-yeon-today-quality-refactor.md)

이 문서의 `확인`은 코드 경로와 실패 조건을 확인했다는 의미다. `수정 완료`는 회귀 테스트와 정적 검사를 통과한 항목이다. 리팩터링 후보는 발견 목록이며 전부를 한 PR에서 구현한다는 뜻이 아니다.

## 버그 20개

| 번호 | 심각도 | 상태      | 위치                                           | 결함과 영향                                                                                                                                                                | 수정 방향                                                                                                 |
| ---: | ------ | --------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
|  B01 | major  | 수정 완료 | `TodayService.completeTask`                    | 성공 응답을 잃은 클라이언트가 같은 `version`으로 완료를 재시도하면, 이미 `done`인지 확인하기 전에 version을 비교해 `409`를 반환한다. 실제로 달성된 상태를 실패로 표시한다. | 현재 상태가 `done`이면 최신 task를 성공 반환하고, 실제 `planned → done` 경쟁 변경만 version으로 보호한다. |
|  B02 | major  | 수정 완료 | `TodayService.reopenTask`                      | 완료 취소 재시도도 현재 상태 확인보다 version 검증이 먼저라 이미 `planned`인 task가 거짓 `409`가 된다.                                                                     | 현재 상태가 `planned`이면 최신 task를 성공 반환하는 멱등 전이로 만든다.                                   |
|  B03 | major  | 수정 완료 | `packages/api-client/src/today.ts:66-71,87-92` | 클라이언트가 서버 `status`와 `code`를 버리고 일반 `Error`만 던진다. UI가 인증 만료, 동시성 충돌, 서버 장애를 구분할 수 없다.                                               | `TodayApiError(status, code, message)`를 도입하고 두 request 경로에서 동일하게 사용한다.                  |
|  B04 | major  | 수정 완료 | `requestTodaySpring`                           | Spring fetch에 timeout/abort 경계가 없어 백엔드 연결이 열린 채 응답하지 않으면 Next 요청도 무기한 점유된다.                                                                | 명시적 timeout과 `AbortSignal` 합성을 추가하고 timeout 오류를 일관된 `504`로 변환한다.                    |
|  B05 | major  | 수정 완료 | `resolveSpringBackendBaseUrl`                  | `SPRING_BACKEND_BASE_URL=""`이면 optional chaining 결과 `""`가 nullish가 아니어서 유효한 `SPRING_BOOTSTRAP_BASE_URL`을 건너뛰고 localhost로 떨어진다.                      | trim 후 첫 번째 non-empty 값을 선택한다.                                                                  |
|  B06 | major  | 수정 완료 | Today BFF `handle` 응답 계약 실패              | 계약 불일치 시 `result.payload` 전체를 `console.error`로 남겨 할 일 제목·메모 같은 사용자 데이터를 서버 로그로 유출할 수 있다.                                             | Zod issue와 경로·상태만 구조화해 기록하고 payload 본문은 기록하지 않는다.                                 |
|  B07 | major  | 수정 완료 | Today BFF `hourSchema`                         | `z.coerce.number()`가 `1.0`, `1e1`, 공백 문자열 같은 비정규 path segment를 숫자로 받아 Spring의 다른 URL로 전달한다. 동일 리소스에 여러 URL 표현이 생긴다.                 | 0~23 범위의 정규 정수 문자열만 허용한 뒤 숫자로 변환한다.                                                 |
|  B08 | major  | 수정 완료 | `TaskComposer.submit`                          | `isPending`은 React 재렌더 전까지 false라 같은 event loop에서 Enter/클릭을 연속 실행하면 동일 할 일이 두 번 생성될 수 있다.                                                | synchronous ref 잠금을 두고 `finally`에서 해제한다.                                                       |
|  B09 | major  | 수정 완료 | `TaskRow` 완료 체크                            | 완료/재개 mutation pending 상태를 행에 전달하지 않아 빠른 두 번 클릭이 같은 version으로 두 요청을 보내고 두 번째 요청은 거짓 충돌을 만든다.                                | task ID별 busy 상태로 체크박스와 충돌 가능한 메뉴 동작을 잠근다.                                          |
|  B10 | major  | 수정 완료 | `TaskRow.submitEdit`                           | 편집 저장 버튼을 mutation 중에도 다시 누를 수 있어 같은 version PATCH가 중복 전송되고 사용자는 성공 뒤 오류를 볼 수 있다.                                                  | 편집 제출 ref와 `isUpdating`을 함께 사용해 중복 제출을 차단한다.                                          |
|  B11 | major  | 수정 완료 | `BoardContent` task actions                    | 같은 task에서 완료, 이동, 수정, 삭제를 서로 독립적으로 실행할 수 있어 동일 version을 공유하는 경쟁 요청이 발생한다.                                                        | task ID별 단일 command lock을 두고 모든 행 mutation이 공유한다.                                           |
|  B12 | minor  | 수정 완료 | `BoardContent.mutationError`                   | mutation 객체의 과거 `error`가 reset되지 않아 이후 다른 작업이 성공해도 이전 오류 배너가 계속 남는다.                                                                      | 새 command 전 관련 mutation error를 reset하고 성공 시 전체 task 오류를 정리한다.                          |
|  B13 | minor  | 수정 완료 | `EstimateSelect`                               | `120`분을 저장하면서 라벨은 `2시간 이상`이라 3시간 이상을 선택했다고 오해할 수 있다.                                                                                       | 고정값은 `2시간`으로 표시하고 `2시간 이상`은 직접 입력 진입으로 분리한다.                                 |
|  B14 | minor  | 수정 완료 | `TaskRow` 완료 상태                            | API가 `completedAt`을 제공하고 화면 정의서가 완료 시각 표시를 요구하지만 행에서 렌더하지 않는다. 완료 순서를 파악할 수 없다.                                               | 완료 행에 현지 시각을 보조 텍스트로 표시한다.                                                             |
|  B15 | minor  | 수정 완료 | `TodayBoardScreen` calendar query              | 보드 조회가 성공하고 월간 조회만 실패하면 캘린더가 빈 것처럼 보이며 실패 안내·재시도가 없다. 사용자는 데이터가 없다고 오인한다.                                            | sidebar에 calendar error와 query refetch를 전달한다.                                                      |
|  B16 | minor  | 수정 완료 | `TodayRecordScreen` query 상태                 | 한 query가 error이고 다른 query가 pending이면 loading과 error UI가 동시에 렌더된다. 상반된 상태가 한 화면에 노출된다.                                                      | error를 우선하는 단일 view-state로 렌더한다.                                                              |
|  B17 | minor  | 수정 완료 | `TodayRecordScreen` calendar query             | 기록·활동 조회가 성공해도 월간 조회 실패는 조용히 무시되어 보드와 같은 거짓 빈 캘린더가 된다.                                                                              | 공통 sidebar calendar error 상태를 사용한다.                                                              |
|  B18 | major  | 수정 완료 | `ActivityManager` create form                  | 생성 중 submit 잠금이 없어 더블 클릭으로 같은 이름 요청이 중복 전송되고 하나가 conflict로 실패한다. 성공 뒤 오류가 남을 수 있다.                                           | 동기 제출 잠금과 pending disabled 상태를 추가한다.                                                        |
|  B19 | major  | 수정 완료 | `ActivityManager` toggle                       | 활동 숨기기/사용 버튼을 연속 클릭할 수 있어 같은 version PATCH가 중복 전송된다.                                                                                            | activity ID별 pending lock으로 동일 활동 mutation을 직렬화한다.                                           |
|  B20 | minor  | 수정 완료 | `ActivityManager`의 `ActivityButton`           | 관리 목록에서 클릭해도 아무 동작하지 않는 button을 `role=option`으로 제공한다. 키보드·스크린리더 사용자는 선택 가능하다고 오인한다.                                        | 관리 목록은 비상호작용 activity chip으로 렌더하고 실제 toggle만 button으로 둔다.                          |

## 리팩터링 후보 100개

### A. Spring 서비스·도메인 규칙 (R001–R010)

| 번호 | 우선순위 | 위치                                      | 구체적 리팩터링과 가치                                                                                                      |
| ---: | -------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| R001 | P1       | `TodayService`                            | 500줄 서비스의 board/task/activity/record 유스케이스를 책임별 서비스로 분리해 한 변경이 다른 축을 회귀시키는 결합을 낮춘다. |
| R002 | P1       | `TodayService:24-30`                      | status/priority raw 문자열을 Java 도메인 값 객체 또는 한 mapper로 모아 계약·DB 값 오타를 fail-fast한다.                     |
| R003 | P1       | `TodayService.now`                        | `OffsetDateTime.now` 직접 호출을 `Clock` 주입으로 바꿔 완료 시각·updatedAt 테스트를 결정적으로 만든다.                      |
| R004 | P2       | `normalizeRequired/normalizeOptional`     | 매 호출마다 컴파일되는 `replaceAll("\\s+", " ")`을 precompiled `Pattern` 기반 공용 normalizer로 추출한다.                   |
| R005 | P2       | `parseDate/parseOptionalDate/parseMonth`  | parsing과 오류 메시지 생성을 `TodayTemporalParser`로 모아 Controller와 서비스 경계의 날짜 정책을 한 곳에서 관리한다.        |
| R006 | P1       | `completeTask/reopenTask`                 | 공통 상태 전이 템플릿으로 합쳐 멱등 판정, version 검사, repository update, conflict 변환 순서를 한 번만 정의한다.           |
| R007 | P2       | `ensureActivityTypes`                     | 기본 활동 seed 정책을 별도 initializer로 이동해 조회 메서드가 쓰기를 유발하는 숨은 command를 드러낸다(CQS).                 |
| R008 | P2       | `buildRecommendation/recommendationScore` | 추천 점수 정책을 순수 전략 클래스로 추출해 가중치와 tie-break를 독립 테스트한다.                                            |
| R009 | P2       | `buildRecord`                             | 24칸 조립과 활동별 분 집계를 record assembler로 분리해 서비스가 orchestration에 집중하게 한다.                              |
| R010 | P2       | `badRequest/conflict`                     | 오류 코드·HTTP 상태·한국어 메시지를 typed factory에 모아 문자열 분산과 잘못된 status 변환을 줄인다.                         |

### B. Repository·SQL·Flyway (R011–R020)

| 번호 | 우선순위 | 위치                               | 구체적 리팩터링과 가치                                                                                                 |
| ---: | -------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| R011 | P1       | `TodayRepository`                  | task/activity/record repository를 분리해 SQL 변경 이유를 도메인 aggregate별로 제한한다.                                |
| R012 | P2       | repository method `@Transactional` | class-level service transaction과 중복된 쓰기 메서드 annotation을 정리하고 transaction ownership을 service로 고정한다. |
| R013 | P2       | inline SQL blocks                  | 반복되는 table/column/owner 조건을 named query 상수로 묶어 보안상 중요한 owner predicate 누락을 리뷰하기 쉽게 한다.    |
| R014 | P2       | `findTask/findActivityType`        | nullable 반환 대신 `Optional<Row>`를 사용해 not-found 경계를 타입으로 드러낸다.                                        |
| R015 | P2       | `first(List<T>)`                   | 모든 조회 결과를 리스트로 만든 뒤 첫 항목만 꺼내는 helper를 query-for-optional 패턴으로 바꿔 의도를 명확히 한다.       |
| R016 | P2       | row mapper section                 | task/activity/slot mapper를 각 repository 가까이 배치해 SQL column과 mapping의 응집도를 높인다.                        |
| R017 | P1       | `insertTask/updateTaskStatus`      | raw status를 받는 repository API를 command record로 감싸 불가능한 status/plannedDate/completedAt 조합 생성을 줄인다.   |
| R018 | P2       | `ensureDefaultActivityTypes`       | seed별 다중 `jdbc.update`를 batch insert로 전환해 첫 조회 transaction의 round-trip을 줄인다.                           |
| R019 | P1       | activity `sortOrder` 결정          | 모든 활동을 읽어 max+10을 계산하지 말고 owner별 max query 또는 DB sequence 정책으로 원자성을 높인다.                   |
| R020 | P2       | Flyway V23/V24 activity FK         | 단일 `activity_type_id` FK와 owner/type 복합 FK의 중복 제약을 정리해 실제 소유권 불변조건 하나만 유지한다.             |

### C. API 계약·도메인 DTO (R021–R030)

| 번호 | 우선순위 | 위치                                      | 구체적 리팩터링과 가치                                                                                                      |
| ---: | -------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| R021 | P2       | `isCalendarDate/isCalendarMonth`          | 중복된 year/month parsing을 한 calendar parts helper로 추출한다.                                                            |
| R022 | P1       | `packages/api-contract/src/today.ts`      | title/category/note/minutes 길이와 범위를 named constants로 export해 Spring·폼 테스트와 명시적으로 대조한다.                |
| R023 | P2       | priority/status/activity constants        | tuple과 label metadata를 분리해 wire value SSOT는 유지하면서 UI 라벨의 재선언을 줄인다.                                     |
| R024 | P2       | update body schemas                       | 전 필드를 요구하는 현재 PATCH 계약을 `replace` 의미로 명명하거나 진짜 partial patch로 바꿔 HTTP 의미와 스키마를 일치시킨다. |
| R025 | P1       | `TODAY_API_PATHS` ID builders             | path builder가 UUID를 검증·encode하도록 해 잘못된 ID가 BFF까지 전달되는 것을 조기에 막는다.                                 |
| R026 | P1       | API 오류 payload                          | `{code,message}` Zod schema와 타입을 공용 계약에 추가해 BFF와 client의 오류 parsing을 동일하게 만든다.                      |
| R027 | P2       | `todayKeys` user scope                    | 임의 string 대신 authenticated user-scope 타입/상수를 사용해 query cache partition 의도를 드러낸다.                         |
| R028 | P1       | `activityMinutes: record<string, number>` | 이름 대신 activity ID를 키로 하고 name/color metadata를 포함해 rename·동명이름에 안전한 요약 계약으로 확장한다.             |
| R029 | P2       | record slot `note`                        | API에만 존재하는 note를 UI 요구사항에 추가하거나 v1 계약에서 제거해 죽은 입력 필드를 없앤다.                                |
| R030 | P2       | DTO naming                                | `TodayDtos` 중첩 record를 task/activity/record 응답군으로 나눠 import와 변경 영향 범위를 줄인다.                            |

### D. API client·Spring BFF client·route handler (R031–R040)

| 번호 | 우선순위 | 위치                          | 구체적 리팩터링과 가치                                                                                              |
| ---: | -------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| R031 | P1       | API client error path         | `TodayApiError`로 status/code/cause를 보존해 UI와 retry 정책이 실패 종류를 판단하게 한다.                           |
| R032 | P1       | `request/requestNoContent`    | 공통 fetch·header·error parsing을 한 executor로 합치고 성공 body parsing만 전략으로 전달한다(DRY).                  |
| R033 | P2       | API client URL 조립           | base URL과 relative path 조립을 helper로 추출해 browser relative URL과 absolute test URL 처리를 한 곳에서 검증한다. |
| R034 | P1       | response schema parsing       | Zod parse 실패를 raw `ZodError`로 노출하지 말고 endpoint와 schema issue를 보존한 contract error로 변환한다.         |
| R035 | P2       | API client public methods     | date/month/hour/task ID를 공용 schema로 client entry에서 검증해 불필요한 네트워크 요청을 줄인다.                    |
| R036 | P2       | client options                | timeout/signal 정책을 `TodayClientOptions`로 주입할 수 있게 해 웹·테스트 소비자가 동일 경계를 사용한다.             |
| R037 | P1       | `resolveSpringBackendBaseUrl` | non-empty env 선택을 순수 함수로 추출·export해 환경 우선순위 테스트를 추가한다.                                     |
| R038 | P1       | `requestTodaySpring`          | 기존 caller signal과 timeout signal 합성을 helper로 분리하고 abort 원인을 보존한다.                                 |
| R039 | P2       | BFF `resolveContract`         | 긴 조건 체인을 method/path matcher 테이블로 바꿔 새 endpoint 추가가 기존 분기 수정 없이 가능하게 한다(OCP).         |
| R040 | P1       | BFF contract logging          | schema issue 요약 logger를 만들어 payload 미기록 원칙과 endpoint/status correlation을 일관되게 적용한다.            |

### E. TanStack Query·mutation orchestration (R041–R050)

| 번호 | 우선순위 | 위치                     | 구체적 리팩터링과 가치                                                                                      |
| ---: | -------- | ------------------------ | ----------------------------------------------------------------------------------------------------------- |
| R041 | P2       | `use-today-data.ts`      | board query, task mutations, record query, record mutations을 파일별로 나눠 책임과 테스트 setup을 줄인다.   |
| R042 | P1       | `USER_SCOPE = "me"`      | session/user scope 공급자를 한 hook에서 주입해 캐시 소유권이 인증 전환 정책과 명시적으로 연결되게 한다.     |
| R043 | P2       | `refreshBoard`           | 모든 날짜 board를 매 mutation마다 invalidate하지 않고 영향받은 선택 날짜와 calendar month를 계산한다.       |
| R044 | P2       | record invalidation      | activity 변경과 slot 변경의 invalidation 집합을 named helper로 분리해 불필요한 refetch를 줄인다.            |
| R045 | P1       | mutation error lifecycle | 여러 mutation의 `reset()`을 묶은 controller를 제공해 새 command와 성공 시 오래된 오류를 지운다.             |
| R046 | P2       | task mutation success    | mutation 응답의 최신 task를 board cache에 반영한 뒤 background invalidate해 완료/수정 피드백 지연을 줄인다. |
| R047 | P2       | repeated mutation config | typed mutation factory로 공통 error/retry/invalidation 정책을 한 번만 선언한다.                             |
| R048 | P1       | `getTodayErrorMessage`   | `TodayApiError`, contract error, network error를 exhaustive하게 해석하고 fallback에 cause 식별자를 남긴다.  |
| R049 | P1       | query retry policy       | `401/403/404/409`와 `5xx/network` retry 여부를 status 기반으로 구분해 무의미한 재요청을 막는다.             |
| R050 | P2       | calendar query           | 월 이동 시 placeholder/prefetch 전략을 추가해 이전 월 데이터가 사라지는 깜박임을 줄인다.                    |

### F. 할 일 보드 UI (R051–R060)

| 번호 | 우선순위 | 위치                      | 구체적 리팩터링과 가치                                                                                           |
| ---: | -------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| R051 | P1       | `today-board-screen.tsx`  | `TaskComposer`를 별도 파일로 분리해 생성 폼 상태와 화면 query orchestration의 변경 이유를 분리한다.              |
| R052 | P1       | board task list           | tab/filter/sort/list/empty state를 `TodayTaskList`로 추출해 850줄 화면을 축소한다.                               |
| R053 | P2       | `BoardContent` state      | tab/sort/filter를 `useTodayBoardControls`로 묶고 URL 보존 여부를 한 곳에서 결정한다.                             |
| R054 | P2       | task counts               | `doneCount/todayCount/inboxCount` 파생을 순수 selector로 모아 탭과 요약의 정의가 어긋나지 않게 한다.             |
| R055 | P1       | task commands             | task ID별 busy map과 command dispatcher를 hook으로 추출해 toggle/move/edit/delete의 경쟁을 한 경계에서 차단한다. |
| R056 | P2       | `TaskRow` edit fields     | 네 개 `useState`를 validated draft hook/reducer로 바꿔 task prop 변경과 편집 취소 reset을 일관되게 한다.         |
| R057 | P2       | empty-state focus         | `document.querySelector` 대신 composer가 노출한 ref/callback을 사용해 DOM ID 결합을 제거한다.                    |
| R058 | P2       | repeated visual constants | `FOCUS_RING`, `SURFACE`, priority metadata를 Today UI tokens 파일로 모아 board/record/shell 중복을 제거한다.     |
| R059 | P1       | `selectTasks`             | 별도 model 파일로 이동하고 status/date/filter/sort 조합을 table-driven unit test로 보호한다.                     |
| R060 | P1       | estimate options          | 값·라벨·직접 입력 정책을 typed 상수로 만들어 생성·수정 폼과 화면 정의서가 같은 옵션을 사용하게 한다.             |

### G. 하루 기록 UI (R061–R070)

| 번호 | 우선순위 | 위치                  | 구체적 리팩터링과 가치                                                                                        |
| ---: | -------- | --------------------- | ------------------------------------------------------------------------------------------------------------- |
| R061 | P1       | `ActivityManager`     | 관리 폼·목록을 별도 파일로 분리해 record 화면의 타임라인 책임과 분리한다.                                     |
| R062 | P1       | 24시간 timeline       | `HourCell` grid를 `TodayRecordTimeline`로 추출하고 slot command 상태를 캡슐화한다.                            |
| R063 | P2       | `activeTypes`         | `useMemo` 또는 순수 selector로 안정화해 선택 보정 effect가 매 render마다 다시 실행되지 않게 한다.             |
| R064 | P2       | selected activity     | active 목록 변경 시 선택을 보정하는 로직을 `useSelectedActivity` hook으로 분리하고 edge case를 테스트한다.    |
| R065 | P1       | slot commands         | hour별 busy set으로 assign/delete 경쟁을 차단하고 화면 전체를 불필요하게 잠그지 않는다.                       |
| R066 | P1       | activity edit         | 이름·색·아이콘·순서·active를 편집하는 validated form을 만들어 서버 PATCH 기능과 화면 정의를 연결한다.         |
| R067 | P1       | activity presentation | 선택 button과 관리용 static chip을 별도 컴포넌트로 나눠 semantics를 props 조합으로 왜곡하지 않는다.           |
| R068 | P2       | activity summary list | API가 정렬된 typed entries를 제공하거나 selector가 ID 기반으로 조립해 `Object.entries` 의존을 줄인다.         |
| R069 | P2       | icon registry         | contract icon key와 React icon component 매핑을 registry로 만들고 누락 key test를 추가한다.                   |
| R070 | P1       | color registry        | hard-coded Tailwind color class를 Today design token registry로 옮겨 서버 허용 token과 시각 token을 검증한다. |

### H. 공통 shell·날짜·접근성 (R071–R080)

| 번호 | 우선순위 | 위치                   | 구체적 리팩터링과 가치                                                                                         |
| ---: | -------- | ---------------------- | -------------------------------------------------------------------------------------------------------------- |
| R071 | P1       | `TodaySidebar`         | 월간 캘린더와 날짜 요약을 별도 컴포넌트로 분리해 query 상태와 summary 계산 책임을 분리한다.                    |
| R072 | P2       | calendar summaries map | `useMemo`로 날짜 lookup을 만들고 데이터가 바뀔 때만 재생성한다.                                                |
| R073 | P2       | date navigation        | 사용자 날짜 선택은 history `push`, 잘못된 URL 정규화만 `replace`하도록 navigation helper로 구분한다.           |
| R074 | P1       | sidebar query state    | calendar loading/error/refetch를 명시적 prop union으로 전달해 undefined data와 실패를 구분한다.                |
| R075 | P1       | `TodayErrorState`      | 전체 reload 대신 query refetch callback을 받고 pending 상태를 표시하는 재사용 오류 경계로 바꾼다.              |
| R076 | P1       | error CTA              | `TodayApiError.status===401`일 때만 로그인 CTA를 보여 일반 서버 장애에 잘못된 해결책을 제시하지 않는다.        |
| R077 | P2       | top tabs/error links   | raw `<a>`를 프로젝트 navigation Link로 교체해 SPA transition과 현재 날짜 query 보존을 명시한다.                |
| R078 | P1       | `formatKoreanDate`     | 로컬 timezone `new Date(...T00:00:00)` 의존을 제거하고 calendar parts/UTC-safe formatting으로 요일을 계산한다. |
| R079 | P2       | date helpers           | exported helper 입력을 `todayDateSchema/todayMonthSchema`로 fail-fast해 non-null assertion을 제거한다.         |
| R080 | P1       | `buildCalendarCells`   | UTC calendar arithmetic을 사용해 DST timezone에서 41/43개 셀이 되거나 날짜가 건너뛰는 위험을 없앤다.           |

### I. 단위·통합·접근성 테스트 (R081–R090)

| 번호 | 우선순위 | 위치                       | 구체적 리팩터링과 가치                                                                            |
| ---: | -------- | -------------------------- | ------------------------------------------------------------------------------------------------- |
| R081 | P1       | `TodayServiceTest`         | 완료 성공 응답 유실 후 같은 version 재시도 시 최신 done task를 반환하는 테스트를 추가한다.        |
| R082 | P1       | `TodayServiceTest`         | 재개 성공 응답 유실 후 같은 version 재시도 시 최신 planned task를 반환하는 테스트를 추가한다.     |
| R083 | P1       | API client tests           | JSON/비JSON 오류에서 status/code/message/cause 보존을 table test로 검증한다.                      |
| R084 | P1       | Spring client tests        | primary empty, bootstrap valid, both missing, trailing slash 환경 조합을 table test로 검증한다.   |
| R085 | P1       | Spring client tests        | 응답 지연 시 timeout abort와 caller abort를 구분하는 테스트를 추가한다.                           |
| R086 | P1       | BFF route tests            | `1.0`, `1e1`, 공백, `+1`, `01`, 24가 거절되고 0~23 정수 문자열만 통과하는 경계 테스트를 추가한다. |
| R087 | P1       | BFF route tests            | 계약 실패 로그에 task title/note payload가 포함되지 않는지 spy로 검증한다.                        |
| R088 | P1       | board component tests      | Enter+click/더블클릭에도 create 호출이 한 번뿐인지 user-event 테스트를 추가한다.                  |
| R089 | P1       | mutation UI tests          | 실패 후 다음 성공에서 오류 배너가 사라지고 동일 task command가 직렬화되는지 검증한다.             |
| R090 | P1       | record accessibility tests | 비활성 활동 빈 상태, 관리 chip semantics, toggle pending, error 우선 렌더를 axe/RTL로 검증한다.   |

### J. Playwright QA·관측·문서 (R091–R100)

| 번호 | 우선순위 | 위치                     | 구체적 리팩터링과 가치                                                                                           |
| ---: | -------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| R091 | P2       | `today_playwright_qa.py` | base URL을 환경변수/CLI 인자로 받아 localhost 포트 변경과 배포 환경에서도 재사용한다.                            |
| R092 | P2       | QA 날짜                  | 고정 `2026-07-21` 대신 테스트 실행일 또는 명시 인자를 사용해 과거 날짜 의존을 제거한다.                          |
| R093 | P1       | QA waits                 | `wait_for_timeout`을 locator·response·URL·network idle 기반 조건 대기로 교체해 느린/빠른 환경의 flaky를 줄인다.  |
| R094 | P2       | browser launch           | mac-arm64 캐시 경로 하드코딩을 Playwright 설치 browser 또는 설정 가능한 executable로 바꾼다.                     |
| R095 | P1       | QA error capture         | `page.on("pageerror")`를 수집해 console에 남지 않는 React/runtime 예외도 실패시킨다.                             |
| R096 | P1       | QA network capture       | Today API의 `4xx/5xx` response를 수집하고 의도한 오류 시나리오 외에는 즉시 실패시킨다.                           |
| R097 | P2       | screenshot output        | 실행 ID별 evidence 디렉터리와 manifest를 만들어 이전 실행 스크린샷 덮어쓰기를 막는다.                            |
| R098 | P2       | QA cleanup               | 생성한 task/activity/slot을 테스트 끝에 owner API로 정리해 반복 실행 시 데이터와 추천 결과가 누적되지 않게 한다. |
| R099 | P2       | QA structure             | 한 긴 절차를 board CRUD, date sharing, record CRUD, responsive scenario 함수와 fixture로 분리한다.               |
| R100 | P2       | audit traceability       | 각 수정 버그를 테스트 이름·스크린샷·검증 명령과 연결한 completion matrix를 이 문서 하단에 유지한다.              |

## 구현 우선순위

1. B01–B11, B18–B19: 상태 정합성·중복 command·네트워크 실패 경계
2. B12–B17, B20: 오류 수명, 정확한 라벨, 실패 가시성, 접근성
3. R001–R100 중 이번 버그를 안전하게 해결하는 추출과 테스트부터 적용

## 검증 매트릭스

아래 증거는 버그별 변경 경계와 실제 검증 결과를 연결한다.

| 버그    | 증거                                                                                                   | 결과 |
| ------- | ------------------------------------------------------------------------------------------------------ | ---- |
| B01–B02 | `TodayServiceTests`의 완료·재개 동일 상태 재시도 테스트, `./gradlew test`                              | 통과 |
| B03     | `today-api-client.test.ts`의 HTTP 상태·오류 코드·메시지 보존 테스트                                    | 통과 |
| B04–B05 | `today-spring-client.test.ts`의 timeout·빈 환경변수 fallback 테스트                                    | 통과 |
| B06–B07 | Today BFF `route.test.ts`의 민감 payload 비로그·비정규 hour 거부 테스트                                | 통과 |
| B08–B12 | `use-command-lock.test.tsx`의 동일 key 직렬화·다른 key 병렬 실행·실패 후 해제 테스트와 Playwright CRUD | 통과 |
| B13–B14 | 예상 시간 라벨·완료 시각 렌더링 코드, 데스크톱 대시보드·선택 날짜 스크린샷                             | 통과 |
| B15–B17 | 보드·기록 calendar 오류/refetch 경계, web lint·typecheck·production build                              | 통과 |
| B18–B19 | activity/slot command lock, submit lock 테스트와 Playwright 하루 기록 CRUD                             | 통과 |
| B20     | 비상호작용 activity chip semantics와 desktop/mobile Playwright 접근성 검사                             | 통과 |

## 이번 차수에서 적용한 리팩터링

- R026, R031–R032: 공용 `TodayApiError`와 요청 실행 경계로 오류 status/code/message 보존을 단일화했다.
- R037–R040: Spring base URL 선택, timeout, 안전한 오류 로그, 정규 hour path 검증을 각각 독립 경계로 만들었다.
- R045, R055, R063, R065: 인증 오류 판정과 폼·task·activity·slot command lock을 재사용 훅으로 분리했다.
- R067, R073–R076: 기록 view-state와 sidebar calendar 오류·날짜 라우팅·query refetch 책임을 명시했다.
- R081–R087: 서버 멱등성, API client, Spring client, BFF 경계에 회귀 테스트를 추가했다.
- R095, R100: `localStorage` 비사용, 브라우저 CRUD·날짜 공유·반응형 화면과 버그별 증거를 검증 자료에 연결했다.

## 검증 결과

- Spring: `cd apps/backend && ./gradlew test` — 통과
- Web: `NODE_OPTIONS=--no-experimental-webstorage pnpm --filter @yeon/web test` — 262개 파일, 1,137개 테스트 통과
- 정적 검사: web lint/typecheck, api-contract/api-client typecheck — 통과
- 운영 빌드: `pnpm --filter @yeon/web build` — `/today`, `/today/record` 포함 성공
- 저장소 검사: `git diff --check`, skill sync, project SSOT 검사 — 통과
- 브라우저: 생성·수정·이동·완료·새로고침 지속성·날짜 공유·하루 기록·desktop/mobile overflow — 통과
- 화면 증거: `ai-log/hyeonjun/2026-07-22/yeon-today-quality-refactor-screenshots/`
