# 프론트 코드 구조 표준화 실행 계획 2026-05-12

## 배경

프론트 리뷰에서 `apps/web`의 서버 상태 key, fetch 처리, feature boundary, 대형 컴포넌트/훅이 빠르게 커진 상태로 확인됐다. 목표는 한 번에 대규모 파일 이동을 하지 않고, 캐시 오염과 이중 구현 위험을 줄이는 순서로 2~5차를 실행하는 것이다.

## 2차: raw queryKey inventory와 서비스별 key factory 고정

### 작업내용

- `apps/web/src`의 raw `queryKey: [` 사용 지점을 서비스별로 수집한다.
- `student-management`부터 `studentManagementQueryKeys`를 추가한다.
- `spaces`, `members`, `member`, `student-board`, `member-student-board`, `member-memos`, `member-counseling-records`, `custom-tab-fields` key를 factory로 통일한다.

### 논의 필요

- 전역 query key 중앙 파일을 둘지 여부.

### 선택지

1. 서비스별 key factory 유지.
2. 전역 `src/lib/query-keys.ts` 중앙화.

### 추천

- 1번. 서비스 경계가 명확하고 교차 invalidation도 import로 추적 가능하다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 3차: student-management fetch wrapper와 query/mutation 표준화

### 작업내용

- `features/student-management/hooks/student-management-fetch.ts`를 추가한다.
- student-management hook 내부 직접 fetch 중 핵심 서버 상태 경로를 wrapper로 바꾼다.
- mutation 성공 시 raw key 대신 key factory로 invalidate/setQueryData를 수행한다.

### 논의 필요

- app route 내부의 counseling-service modal까지 같은 PR에 포함할지 여부.

### 선택지

1. `features/student-management/**`부터 정리하고 app route 내부는 다음 차수로 분리.
2. app route 내부까지 한 번에 정리.

### 추천

- 1번. app route 이동과 key/fetch 표준화를 섞으면 diff가 커지고 회귀 범위가 넓어진다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 4차: 상담 워크스페이스 이중 구현 제거/흡수

### 작업내용

- 실제 사용 경로인 `app/counseling-service/page.tsx`와 `_hooks/_components`를 기준으로 inventory를 만든다.
- `features/counseling-record-workspace/**`가 현재 route에서 쓰이지 않는 항목인지 확인한다.
- 사용되지 않는 구현은 즉시 삭제하거나, 재사용할 컴포넌트만 실제 경로에 흡수한다.

### 논의 필요

- 삭제 우선인지, feature 경로로 이동 우선인지.

### 선택지

1. 사용되지 않는 구현 삭제 후 현재 app 경로 유지.
2. 현재 app 경로를 feature 경로로 이동.

### 추천

- 1번. 대규모 이동보다 이중 구현 제거가 먼저다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 5차: 대형 컴포넌트/훅 분해

### 작업내용

- 1000줄 이상 파일을 우선순위화한다.
- `cloud-import-inline.tsx`, `student-management/layout.tsx`, `use-records.ts`를 container hook / view component / route bridge로 나눈다.
- 한 PR에는 한 파일 계열만 분해한다.

### 논의 필요

- 첫 분해 대상을 무엇으로 할지.

### 선택지

1. `use-records.ts`: 상태 정합성 위험이 높아 먼저 분해.
2. `cloud-import-inline.tsx`: 가장 크지만 UI 회귀 면적이 큼.
3. `student-management/layout.tsx`: route bridge와 sidebar 상태 분리가 필요.

### 추천

- 1번. 상담 기록 상태는 서버 원본/로컬 override/temp record가 섞여 있어 구조 리스크가 가장 크다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 6차: sheet-export fetch wrapper 분리

### 작업내용

- `features/student-management/components/sheet-export-panel.tsx`에 남아 있는 직접 `fetch()` 호출을 서비스 전용 wrapper로 이동한다.
- Google Drive 상태 조회, sheet-export 설정 조회/연결/동기화/가져오기/다운로드/연결해제를 `sheet-export-fetch.ts`의 함수로 노출한다.
- 패널 컴포넌트는 UI 상태와 사용자 이벤트 조립만 담당하게 하고, HTTP 경로·에러 파싱·응답 타입은 wrapper가 소유하게 한다.

### 논의 필요

- 다운로드처럼 Blob과 DOM anchor가 함께 필요한 동작을 wrapper가 어디까지 책임질지.

### 선택지

1. wrapper는 HTTP 응답/Blob 획득까지만 담당하고 DOM 다운로드 트리거는 컴포넌트가 담당한다.
2. wrapper가 파일명 생성과 anchor 클릭까지 모두 수행한다.

### 추천

- 1번. HTTP boundary와 DOM side effect를 분리하면 테스트와 재사용 범위가 명확하다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 7차: life-os fetch wrapper 분리

### 작업내용

- `features/life-os/life-os.tsx`에 직접 정의된 day 조회/저장 fetch 함수를 서비스 전용 wrapper로 이동한다.
- Life OS 화면 컴포넌트는 React Query 조립과 UI 상태만 담당하게 한다.
- API path와 응답 파싱, 에러 메시지는 `life-os-fetch.ts`가 소유한다.

### 논의 필요

- Life OS query key factory를 화면 파일에 둘지 별도 파일로 승격할지.

### 선택지

1. 이번 차수는 fetch wrapper만 분리하고 query key는 기존 로컬 helper를 유지한다.
2. query key helper도 별도 파일로 이동한다.

### 추천

- 1번. query key raw literal은 이미 제거되어 있으므로 이번 차수는 fetch boundary 축소에 집중한다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 8차: profile-import route handler 포맷 복구

### 작업내용

- 한 줄 압축 형태로 남아 있는 `profile-import/route.ts`를 formatter 기준으로 복구한다.
- import, 타입, AI 분석 함수, POST handler의 실패 경계를 읽을 수 있게 분리한다.
- 동작과 API 응답은 변경하지 않는다.

### 논의 필요

- AI 분석 호출 자체를 Spring 소유로 이동할지 여부.

### 선택지

1. 이번 차수는 포맷 복구만 수행하고, Spring 이전은 별도 백로그로 둔다.
2. 이번 차수에서 Spring 이전까지 진행한다.

### 추천

- 1번. 포맷 복구와 백엔드 소유권 이전은 위험 범위가 다르므로 분리한다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 9차: counseling-service page 삭제 액션 fetch wrapper 적용

### 작업내용

- `app/counseling-service/page.tsx`의 상담 기록/수강생/스페이스 삭제 핸들러에서 직접 `fetch()`를 제거한다.
- 기존 `counselingWorkspaceFetchVoid`를 사용해 오류 파싱과 credentials 정책을 workspace fetch boundary로 통일한다.
- 삭제 후 로컬 상태 정리와 query invalidation 동작은 유지한다.

### 논의 필요

- 삭제 액션 전체를 page에서 별도 action hook으로 분리할지 여부.

### 선택지

1. 이번 차수는 fetch boundary만 정리하고 action hook 분리는 후속 작업으로 둔다.
2. `useCounselingWorkspaceDeleteActions`까지 즉시 분리한다.

### 추천

- 1번. page 로직 분리는 더 큰 UI 상태 결합을 건드리므로 fetch 표준화와 분리한다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 10차: profile-import panel fetch wrapper 분리

### 작업내용

- `features/student-management/components/profile-import-panel.tsx`에 남아 있는 직접 `fetch()` 호출을 제거한다.
- AI 프로필 분석, 프로필 PATCH 저장, 저장 후 member reload를 `profile-import-fetch.ts`로 이동한다.
- student-management fetch wrapper가 `message`와 `error` 응답 필드를 모두 한국어 fallback 전에 읽도록 보강한다.

### 논의 필요

- 프로필 자동완성 전용 응답 타입을 컴포넌트 파일에 둘지 API wrapper 파일로 승격할지.

### 선택지

1. 이번 차수에서 wrapper 파일에 전용 타입을 두고 컴포넌트는 UI 표시용 타입만 유지한다.
2. 공용 contract 패키지로 즉시 승격한다.

### 추천

- 1번. API 스키마 자체를 변경하지 않는 구조 정리이므로 contract 승격은 별도 API 표준화 작업에서 다룬다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 11차: cloud-import hook fetch boundary 분리

### 작업내용

- `features/cloud-import/hooks/use-cloud-import.ts`와 `use-local-import.ts`에 남아 있는 직접 `fetch()` 호출을 제거한다.
- 클라우드 연결 상태, 파일 목록, SSE 분석 요청, 가져오기 commit, 초안 load/save/delete 호출을 `cloud-import-fetch.ts`로 이동한다.
- hook은 UI 상태 전이, abort controller, cache, draft recovery 조립만 담당하게 한다.

### 논의 필요

- SSE 분석 요청까지 wrapper가 소유할지, `runImportAnalysisRequest` 호출부가 fetch request를 직접 유지할지.

### 선택지

1. wrapper가 `Response`를 반환하는 request 함수까지 소유하고 hook은 상태 전이만 담당한다.
2. SSE fetch는 hook에 남기고 일반 JSON/void 호출만 wrapper로 이동한다.

### 추천

- 1번. 직접 `fetch()` 제거 목표와 서비스별 HTTP boundary 표준화에 맞춰 SSE request 생성도 wrapper로 모은다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 12차: cloud file preview fetch boundary 분리

### 작업내용

- `features/cloud-import/components/file-preview.tsx`에 남아 있는 직접 `fetch()` 호출을 제거한다.
- HEIC blob, spreadsheet arrayBuffer, CSV/TXT text load를 `cloud-import-fetch.ts` preview helper로 이동한다.
- 파일 파싱, 행/열 제한, 가상 스크롤 UI는 기존 컴포넌트 책임으로 유지한다.

### 논의 필요

- spreadsheet 파싱 자체도 wrapper로 이동할지 여부.

### 선택지

1. 이번 차수는 네트워크 boundary만 분리하고 파싱/렌더링은 컴포넌트에 둔다.
2. XLSX 파싱과 row 제한까지 별도 parser로 분리한다.

### 추천

- 1번. fetch 표준화 PR의 회귀 범위를 줄이고, parser 분리는 후속 구조 분해에서 다룬다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 13차: cloud-import inline draft fetch boundary 분리

### 작업내용

- `features/cloud-import/components/cloud-import-inline.tsx`의 저장된 draft 목록 조회와 목록 삭제 직접 `fetch()`를 제거한다.
- draft 목록 조회는 `loadLocalImportDrafts`, 삭제는 기존 `deleteImportDraft` wrapper를 사용한다.
- 1400줄급 컴포넌트 분해 전, HTTP boundary부터 닫아 후속 container/view 분리 회귀 면적을 줄인다.

### 논의 필요

- 저장된 draft 모달 상태 자체를 별도 hook으로 즉시 분리할지 여부.

### 선택지

1. 이번 차수는 fetch boundary만 닫고 saved-drafts modal state hook 분리는 후속 PR로 둔다.
2. `useSavedImportDraftsModal`까지 즉시 분리한다.

### 추천

- 1번. 직접 fetch 제거와 god component 분해는 각각 회귀 포인트가 달라 PR을 나눈다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 14차: cloud-import saved drafts 상태 hook 분리

### 작업내용

- `cloud-import-inline.tsx`에 남아 있는 저장된 가져오기 작업 모달의 query/refetch/delete/timer 상태를 전용 hook으로 분리한다.
- `use-saved-import-drafts-modal.ts`가 draft 목록 조회, 수동 새로고침 지연 로딩, 삭제 지연 로딩, draft 열기/삭제 액션을 소유하게 한다.
- `cloud-import-inline.tsx`는 entry controls와 모달 렌더링만 담당하게 하여 God component 책임을 줄인다.

### 논의 필요

- 저장된 draft 모달 JSX까지 별도 presentational component로 즉시 이동할지 여부.

### 선택지

1. 이번 차수는 상태/액션 hook만 분리하고 JSX 분리는 후속 PR로 둔다.
2. hook과 함께 `SavedImportDraftsModal` 컴포넌트까지 즉시 분리한다.

### 추천

- 1번. 상태 전이와 JSX 이동을 한 번에 하면 회귀 지점이 커지므로 먼저 상태 소유권을 분리한다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 15차: public-check route hook feature boundary 이동

### 작업내용

- `app/check/[token]/_hooks/use-public-check.ts`에 남아 있던 public-check server-state hook을 `features/public-check/hooks/use-public-check.ts`로 이동한다.
- 세션 조회/본인 확인/체크인 제출 HTTP 호출을 `public-check-api.ts`로 분리하고, route page는 feature hook만 조립한다.
- public-check query key를 `publicCheckQueryKeys.session()` factory로 고정해 route 내부 raw key 의존을 제거한다.

### 논의 필요

- 위치 권한 요청(`navigator.geolocation`)까지 API wrapper로 이동할지 여부.

### 선택지

1. 위치 권한은 브라우저 UI 상태에 가까우므로 hook에 유지하고, 네트워크 boundary만 API wrapper로 이동한다.
2. 위치 권한 요청도 submit API 함수 내부로 이동해 mutation 호출부를 더 얇게 만든다.

### 추천

- 1번. 권한 요청은 브라우저 상호작용과 에러 피드백에 직접 연결되므로 hook이 소유하고, HTTP 요청만 service API boundary로 분리한다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 16차: quick memo fetch boundary 정리

### 작업내용

- `app/counseling-service/_components/quick-memo-modal.tsx`에 남아 있는 직접 `fetch()` 호출을 제거한다.
- 텍스트 메모 저장 요청은 기존 `counselingWorkspaceFetchJson` wrapper를 사용해 credentials/error parsing 정책을 통일한다.
- 메모 입력/저장 UI와 `RecordItem` 변환 흐름은 유지한다.

### 논의 필요

- `RecordItem` 변환 로직까지 별도 adapter로 즉시 분리할지 여부.

### 선택지

1. 이번 차수는 네트워크 boundary만 닫고 변환 adapter 분리는 후속 `useRecords` 정리와 묶는다.
2. 메모 저장 응답 변환까지 `quick-memo-adapter.ts`로 즉시 분리한다.

### 추천

- 1번. 직접 fetch 제거 범위를 작게 유지하고, record 변환 SSOT는 후속 상담 기록 상태 정리에서 함께 다룬다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 17차: recording upload fetch boundary 정리

### 작업내용

- `app/counseling-service/_hooks/use-recording.ts`에 남아 있는 녹음 업로드 직접 `fetch()` 호출을 제거한다.
- 녹음 업로드 요청은 기존 `counselingWorkspaceFetchJson` wrapper를 사용해 credentials/error parsing 정책을 통일한다.
- 녹음 시작/중단, 임시 processing record 생성, 업로드 완료 후 실제 record 교체 흐름은 유지한다.

### 논의 필요

- 녹음 업로드 응답 → `RecordItem` 변환 로직까지 별도 adapter로 즉시 분리할지 여부.

### 선택지

1. 이번 차수는 네트워크 boundary만 닫고 변환 adapter 분리는 후속 `useRecords`/record adapter 정리와 묶는다.
2. 녹음 업로드 응답 변환까지 `recording-record-adapter.ts`로 즉시 분리한다.

### 추천

- 1번. 녹음 생명주기와 변환 책임을 한 번에 흔들지 않고 직접 fetch 제거부터 완료한다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 18차: record retry fetch boundary 정리

### 작업내용

- `app/counseling-service/_hooks/use-record-retry.ts`에 남아 있는 전사/분석 재시도 직접 `fetch()` 호출을 제거한다.
- 전사 재시도는 `counselingWorkspaceFetchJson`, 분석 재시도는 `counselingWorkspaceFetchVoid` wrapper를 사용해 credentials/error parsing 정책을 통일한다.
- 재시도 pending/feedback, polling boost, detail 적용 흐름은 유지한다.

### 논의 필요

- 재시도 mutation을 TanStack Query `useMutation`으로 즉시 전환할지 여부.

### 선택지

1. 이번 차수는 네트워크 boundary만 닫고 pending/feedback 상태 구조는 유지한다.
2. 재시도 액션을 `useMutation` 기반으로 전환해 server-state 패턴까지 맞춘다.

### 추천

- 1번. 직접 fetch 제거와 mutation 구조 변경을 분리해 상담 기록 재시도 흐름의 회귀 면적을 줄인다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 19차: AI chat fetch boundary 정리

### 작업내용

- `app/counseling-service/_hooks/use-ai-chat.ts`에 남아 있는 채팅 SSE와 자동 분석 직접 `fetch()` 호출을 제거한다.
- SSE 응답은 `counselingWorkspaceFetchResponse`, 자동 분석 JSON 응답은 `counselingWorkspaceFetchJson` wrapper를 사용해 credentials/error parsing 정책을 통일한다.
- 스트리밍 메시지 누적, abort, 자동 분석 실패 로깅, UI feedback 흐름은 유지한다.

### 논의 필요

- SSE 스트림 파서(`readSseStream`)까지 별도 helper 파일로 즉시 이동할지 여부.

### 선택지

1. 이번 차수는 네트워크 boundary만 닫고 SSE parser 분리는 후속 hook 분해에서 다룬다.
2. `readSseStream`을 별도 `ai-chat-stream.ts`로 즉시 분리한다.

### 추천

- 1번. 직접 fetch 제거와 스트림 파서 이동을 분리해 AI 채팅 회귀 면적을 줄인다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 20차: insight banner dismissals fetch/query key boundary 정리

### 작업내용

- `app/counseling-service/_hooks/use-counseling-insight-banner-dismissals.ts`에 남아 있는 직접 `fetch()` 호출을 제거한다.
- 인사이트 배너 상태 조회/닫기 요청은 기존 `counselingWorkspaceFetchJson` wrapper를 사용해 credentials/error parsing 정책을 통일한다.
- 배너 dismissals query key를 `counselingInsightBannerQueryKeys.dismissals()` factory로 고정한다.

### 논의 필요

- 인사이트 배너 hook을 `features/counseling-service-shell`로 즉시 이동할지 여부.

### 선택지

1. 이번 차수는 fetch/query key boundary만 닫고 feature layer 이동은 후속 app boundary 정리에서 다룬다.
2. hook 파일을 feature layer로 즉시 이동한다.

### 추천

- 1번. 직접 fetch와 query key 표준화 범위를 작게 유지하고, app 내부 feature 이동은 별도 PR로 관리한다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 21차: student-management query key factory 스코프 정리

### 작업내용

- `student-management` 내부에 남아 있는 보조 query key 함수(`customTabFieldsQueryKey`, `memberTabsQueryKey`)를 서비스 SSOT인 `studentManagementQueryKeys`로 흡수한다.
- `membersRoot()`를 사용하는 광역 cache patch/invalidation 중 실제 선택 스페이스나 import 결과 스페이스로 좁힐 수 있는 경로를 정리한다.
- 수강생 목록, 상세, 커스텀 탭 필드, 멤버 탭의 동작은 유지한다.

### 논의 필요

- `membersRoot()` 기반 전체 목록 조회 fallback을 즉시 제거할지 여부.

### 선택지

1. 이번 차수는 쓰기/무효화 범위만 좁히고, 상세 fallback 조회는 유지한다.
2. 상세 fallback 조회까지 제거하고 URL 직접 진입 시 상세 API만 사용하게 한다.

### 추천

- 1번. 캐시 오염 위험이 큰 write/invalidation부터 줄이고, 상세 직접 진입 회귀 면적은 후속 차수에서 다룬다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 22차: student member new page fetch wrapper 정리

### 작업내용

- `app/counseling-service/student-management/members/new/page.tsx`의 직접 `fetch()` 호출을 제거한다.
- 수강생 생성 요청은 `studentManagementFetchJson` wrapper를 사용해 credentials/error parsing 정책을 student-management 기준으로 통일한다.
- 생성 성공 후 `refetchMembers()`와 목록 이동 동작은 유지한다.

### 논의 필요

- 수강생 생성 form을 feature 컴포넌트/훅으로 즉시 이동할지 여부.

### 선택지

1. 이번 차수는 fetch boundary만 닫고 app route 내부 form 이동은 후속 app boundary 정리에서 다룬다.
2. form submit hook까지 `features/student-management`로 즉시 이동한다.

### 추천

- 1번. 직접 fetch 제거와 app route 이동을 분리해 생성 폼 회귀 면적을 줄인다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 23차: student-management space sidebar action fetch wrapper 정리

### 작업내용

- `app/counseling-service/student-management/_hooks/use-space-sidebar-actions.ts`의 스페이스 삭제/이름 변경 직접 `fetch()` 호출을 제거한다.
- 삭제/수정 요청은 `studentManagementFetchVoid` wrapper를 사용해 credentials/error parsing 정책을 student-management 기준으로 통일한다.
- 선택 스페이스 초기화, 상세 route reset, 목록 refetch, context menu 정리 동작은 유지한다.

### 논의 필요

- `use-space-sidebar-actions` 자체를 `features/student-management`로 즉시 이동할지 여부.

### 선택지

1. 이번 차수는 fetch boundary만 닫고 hook 이동은 후속 app boundary 정리에서 다룬다.
2. sidebar action hook을 feature layer로 즉시 이동한다.

### 추천

- 1번. 직접 fetch 제거와 app route hook 이동을 분리해 사이드바 회귀 면적을 줄인다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 24차: student space create modal fetch wrapper 정리

### 작업내용

- `features/student-management/components/space-create-modal.tsx`의 빈 스페이스 생성 직접 `fetch()` 호출을 제거한다.
- 스페이스 생성 요청은 `studentManagementFetchJson` wrapper를 사용해 credentials/error parsing 정책을 student-management 기준으로 통일한다.
- 이름/기간 validation, `onCreated`, `onClose`, import mode 흐름은 유지한다.

### 논의 필요

- 생성 modal의 blank/import 상태를 별도 container hook으로 즉시 분리할지 여부.

### 선택지

1. 이번 차수는 fetch boundary만 닫고 modal 구조 분해는 후속 god component 정리에서 다룬다.
2. blank 생성 form 상태를 별도 hook으로 즉시 분리한다.

### 추천

- 1번. 네트워크 boundary 정리와 modal 구조 분해를 분리해 import 모드 회귀 면적을 줄인다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 25차: cloud profile picker file fetch helper 정리

### 작업내용

- `features/student-management/components/cloud-profile-picker.tsx`의 클라우드 파일 다운로드 직접 `fetch()` 호출을 제거한다.
- Blob 응답은 `studentManagementFetchBlob` helper로 통일해 credentials/error 정책을 student-management fetch boundary에 모은다.
- 파일 선택 가능 확장자, File 생성, provider별 URL 조합, 오류 표시 흐름은 유지한다.

### 논의 필요

- 클라우드 파일 URL 조립을 별도 profile-import API 파일로 즉시 이동할지 여부.

### 선택지

1. 이번 차수는 blob fetch boundary만 닫고 URL 조립 이동은 후속 feature 구조 정리에서 다룬다.
2. URL 조립까지 `profile-import-fetch.ts`로 즉시 이동한다.

### 추천

- 1번. 직접 fetch 제거를 우선하고 cloud import hook과 profile picker의 결합은 별도 차수에서 다룬다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 26차: counseling file upload fetch wrapper 정리

### 작업내용

- `app/counseling-service/_hooks/use-file-upload.ts`의 FormData 업로드 직접 `fetch()` 호출을 제거한다.
- 파일 업로드 요청은 `counselingWorkspaceFetchJson` wrapper를 사용해 credentials/error parsing 정책을 상담 워크스페이스 기준으로 통일한다.
- 임시 레코드 생성, 업로드 완료 변환, 오류 표시, 오디오 길이 읽기 흐름은 유지한다.

### 논의 필요

- `use-file-upload` 자체를 feature layer로 즉시 이동할지 여부.

### 선택지

1. 이번 차수는 fetch boundary만 닫고 hook 이동은 후속 app boundary 정리에서 다룬다.
2. 파일 업로드 hook을 feature layer로 즉시 이동한다.

### 추천

- 1번. 업로드 네트워크 경계 정리와 app route hook 이동을 분리해 업로드 회귀 면적을 줄인다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 27차: onedrive import fetch boundary 정리

### 작업내용

- `features/onedrive-import/hooks/use-onedrive.ts`의 OneDrive 상태/파일/분석/가져오기 직접 `fetch()` 호출을 제거한다.
- 네트워크 요청과 오류 파싱은 `onedrive-import-fetch.ts` wrapper로 분리한다.
- 연결 상태 확인 실패 무시, 파일 목록 표시, 분석 preview, import 완료 callback 흐름은 유지한다.

### 논의 필요

- legacy `onedrive-import` UI를 `features/cloud-import` 통합 화면으로 즉시 흡수할지 여부.

### 선택지

1. 이번 차수는 fetch boundary만 닫고 UI 통합/삭제는 후속 feature 경계 정리에서 다룬다.
2. legacy OneDrive UI를 즉시 제거하고 cloud import 화면만 남긴다.

### 추천

- 1번. 네트워크 경계 정리를 먼저 끝내고 실제 사용 여부/통합은 별도 감사에서 결정한다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 28차: counseling workspace api/query key feature boundary 정리

### 작업내용

- `app/counseling-service/_hooks` 아래에 있던 상담 워크스페이스 fetch helper와 query key factory를 `features/counseling-record-workspace/api`로 이동한다.
- app route 내부 hook/component는 feature API boundary를 import하도록 바꾼다.
- 기존 화면 상태, API path, query key 값, error parsing 정책은 유지한다.

### 논의 필요

- app 내부 hook/component 전체를 이번 차수에 함께 feature layer로 이동할지 여부.

### 선택지

1. 이번 차수는 API/query key SSOT만 feature layer로 이동하고 hook/component 이동은 후속 차수로 나눈다.
2. 상담 워크스페이스 hook/component 전체를 즉시 feature layer로 이동한다.

### 추천

- 1번. 네트워크/캐시 경계부터 실제 사용 경로의 SSOT를 고정해 회귀 면적을 줄인다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 29차: card-service fetch/query key boundary 정리

### 작업내용

- `features/card-service/hooks`의 덱 목록/상세/생성/게스트 이관 직접 `fetch()` 호출을 제거한다.
- 서버 요청과 오류 파싱은 `card-service-fetch.ts`로 분리한다.
- card deck query key는 hook 파일이 아닌 `card-service-query-keys.ts` factory로 고정한다.
- 게스트 덱 fallback, 생성 후 invalidate, 이관 후 로컬 guest 정리 흐름은 유지한다.

### 논의 필요

- card-service 전체를 TanStack Query 서비스 factory 구조로 더 세분화할지 여부.

### 선택지

1. 이번 차수는 네트워크/query key boundary만 닫고 guest store 구조는 유지한다.
2. guest store와 서버 fetch까지 하나의 repository abstraction으로 즉시 통합한다.

### 추천

- 1번. 서버/게스트 분기 동작을 건드리지 않고 직접 fetch 확산과 query key 위치만 먼저 정리한다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 30차: space template preview fetch boundary 정리

### 작업내용

- `space-template-preview-modal.tsx`의 직접 `fetch()` 호출을 제거한다.
- 템플릿 상세 조회는 `space-settings-api.ts`의 `apiFetch` wrapper를 통해 수행한다.
- preview modal query key는 기존 key shape을 유지하고 상세 미리보기 UI/오류 문구는 유지한다.

### 논의 필요

- space-settings query key factory를 별도 파일로 즉시 분리할지 여부.

### 선택지

1. 이번 차수는 직접 fetch 제거만 하고 query key factory 분리는 후속 space-settings 구조 정리에서 다룬다.
2. space-settings query key factory까지 즉시 분리한다.

### 추천

- 1번. 큰 `space-settings-content.tsx` 분해 전에 작은 네트워크 경계부터 닫는다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 31차: typing-service fetch/query key boundary 정리

### 작업내용

- `typing-service` hook 내부 직접 `fetch()` 호출을 제거한다.
- 타자 덱, 캐릭터 프레임, 로비 조회, race seed 요청은 `typing-service-fetch.ts` helper로 이동한다.
- 캐릭터 프레임/로비 query key는 `typing-service-query-keys.ts` factory로 이동한다.
- 기존 덱 query key 값, optimistic frame override 저장, 로비 필터링, race seed fallback 흐름은 유지한다.

### 논의 필요

- `use-typing-decks.ts`의 deck query key factory까지 별도 파일로 완전 이동할지 여부.

### 선택지

1. 이번 차수는 직접 fetch 제거와 frame/lobby key factory 이동을 우선하고 deck key export는 기존 호환을 유지한다.
2. typing-service query key 전체를 한 번에 재배치한다.

### 추천

- 1번. typing-service 화면 범위가 넓으므로 fetch boundary를 먼저 닫고 key export 이동은 후속 감사에서 다룬다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 32차: community chat anonymous identity/fetch boundary 정리

### 작업내용

- 실시간 채팅 hook이 `senderId`/`guestSessionId` 같은 ID성 값을 UI 반환 상태로 보관하지 않게 한다.
- `/community` 글쓰기 행에서 설정한 닉네임을 localStorage SSOT에 저장하고 실시간 채팅 전송에도 같은 닉네임을 사용하게 한다.
- community presence heartbeat 직접 `fetch()` 호출을 API boundary 파일로 이동한다.
- 기존 채팅 polling, presence count 표시, compact widget 동작은 유지한다.

### 논의 필요

- 커뮤니티 채팅 전체를 이번 차수에 TanStack Query polling/mutation으로 전환할지 여부.

### 선택지

1. 이번 차수는 익명성 누출 가능성과 fetch boundary만 닫고, 채팅 React Query 전환은 후속 차수로 나눈다.
2. 채팅 list/send/presence를 모두 React Query로 즉시 전환한다.

### 추천

- 1번. 익명성은 즉시 닫되, 실시간 채팅 polling 구조 변경은 회귀 면적이 커서 별도 차수로 검증한다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 33차: counseling workspace route hook 일부 feature 이동

### 작업내용

- `app/counseling-service/_hooks`에 남아 있는 독립 워크스페이스 훅 중 `use-current-space`, `use-space-members`, `use-counseling-insight-banner-dismissals`를 `features/counseling-record-workspace/hooks`로 이동한다.
- app route `_hooks/index.ts`는 기존 import 호환을 위한 re-export만 유지한다.
- `use-space-members`는 app `_lib/types`에 의존하지 않도록 필요한 record shape만 feature hook 내부 타입으로 좁힌다.

### 논의 필요

- `use-records`와 녹음/파일 업로드 계열 훅까지 같은 차수에 함께 이동할지 여부.

### 선택지

1. 독립 훅 3개만 먼저 이동하고, `use-records` 계열은 상태 분해 차수에서 별도 처리한다.
2. app `_hooks` 전체를 한 번에 feature로 이동한다.

### 추천

- 1번. `use-records`는 서버 원본/임시 레코드/로컬 override가 얽혀 있어 단순 이동보다 분해 설계가 먼저 필요하다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 34차: counseling workspace client-state hook feature 이동

### 작업내용

- `use-audio-player`, `use-workspace-selection`, `use-record-entry`를 `features/counseling-record-workspace/hooks`로 이동한다.
- app `_hooks/index.ts`는 기존 사용처 호환 re-export만 유지한다.
- feature hook이 app `_lib/types`에 의존하지 않도록 필요한 record shape 타입만 hook 내부에 둔다.

### 논의 필요

- `use-records` 본체를 이번 차수에 함께 이동할지 여부.

### 선택지

1. 독립 클라이언트 상태 훅만 먼저 이동하고 `use-records`는 서버 원본/임시 레코드/local override 분해 차수로 남긴다.
2. `use-records`까지 feature로 단순 이동한다.

### 추천

- 1번. `use-records`는 단순 위치 이동만으로는 source of truth 문제가 해결되지 않아 별도 분해가 필요하다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 35차: counseling records API helper boundary 정리

### 작업내용

- `use-records` 안에 남은 상담 기록 목록/상세/채팅 초기화 API 호출을 `features/counseling-record-workspace/api` helper로 이동한다.
- `use-records`는 TanStack Query 상태 조합, 로컬 override/temp record 병합, polling 판단만 담당하게 한다.
- 기존 query key, polling 주기, 상세 prefetch/fetch, 채팅 초기화 동작은 유지한다.

### 논의 필요

- `use-records` 자체를 이번 차수에 feature hooks로 이동할지 여부.

### 선택지

1. API endpoint 지식만 먼저 feature api로 이동하고 `use-records` 이동/분해는 후속 차수로 남긴다.
2. `use-records`까지 즉시 feature hook으로 이동한다.

### 추천

- 1번. `use-records`는 서버 목록, 상세 캐시, 임시 레코드, local override, viewState를 함께 들고 있어 단순 위치 이동보다 책임 분해가 먼저 필요하다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 36차: counseling records local state hook 분리

### 작업내용

- `use-records`에 남아 있는 `localOverrides`/`tempRecords` 조작 로직을 `features/counseling-record-workspace/hooks`의 전용 local state hook으로 분리한다.
- `use-records`는 서버 query, 상세 fetch, polling, viewState 조립에 집중하게 한다.
- 업로드 실패, 메시지 갱신, 분석 재시작, 수강생 연결 변경, 상세 patch 적용 동작은 유지한다.

### 논의 필요

- `use-records` 전체를 feature hook으로 즉시 이동할지 여부.

### 선택지

1. local override/temp record reducer 성격만 먼저 feature hook으로 이동하고 전체 hook 이동은 다음 차수로 남긴다.
2. `use-records` 전체를 feature hook으로 이동한다.

### 추천

- 1번. 현재 훅은 route type과 viewState가 얽혀 있어 한 번에 이동하면 회귀 범위가 크다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 37차: counseling records viewState selector 분리

### 작업내용

- `use-records` 내부의 `CounselingWorkspaceViewState` 계산을 feature hook/selector로 분리한다.
- `use-records`는 서버 query, 상세 fetch, polling, local state 조합만 담당하게 한다.
- loading/empty/recording/processing/ready 전환 조건은 기존과 동일하게 유지한다.

### 논의 필요

- viewState 타입 자체를 app `_lib/types`에서 feature 타입으로 즉시 이동할지 여부.

### 선택지

1. 계산 로직만 먼저 feature hook으로 이동하고 타입 이동은 app `_lib` 흡수 차수에서 처리한다.
2. viewState 타입까지 즉시 feature로 이동한다.

### 추천

- 1번. 현재 페이지/컴포넌트가 app `_lib/types`를 넓게 참조하므로 타입 이동은 별도 차수가 안전하다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 38차: counseling AI panel client hook feature 이동

### 작업내용

- `use-ai-panel`을 `features/counseling-record-workspace/hooks`로 이동한다.
- AI panel 모델/폭/quick chip 상수는 feature constants로 옮기고 app `_lib/constants.ts`는 호환 re-export만 유지한다.
- app `_hooks/index.ts`는 기존 사용처 호환을 위해 feature hook을 re-export한다.

### 논의 필요

- `ai-panel.tsx` 컴포넌트 자체도 이번 차수에 feature component로 옮길지 여부.

### 선택지

1. 독립 hook/constants만 먼저 feature로 이동하고 UI 컴포넌트 이동은 sidebar/center-panel 분해 차수에서 진행한다.
2. `ai-panel.tsx`까지 즉시 feature component로 이동한다.

### 추천

- 1번. UI 컴포넌트는 app `_lib/types`와 주변 레이아웃 의존이 있어 hook/constants부터 이동하는 편이 안전하다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 39차: counseling recording/file-upload hook feature 이동

### 작업내용

- `use-file-upload`, `use-recording`을 `features/counseling-record-workspace/hooks`로 이동한다.
- 오디오 업로드 POST 호출을 `features/counseling-record-workspace/api/counseling-records-api.ts` helper로 분리한다.
- app `_hooks/index.ts`는 기존 사용처 호환을 위한 re-export만 유지한다.

### 논의 필요

- `RecordItem` 타입까지 이번 차수에 feature 타입으로 이동할지 여부.

### 선택지

1. 훅과 API helper만 먼저 이동하고 `RecordItem` 타입 이동은 app `_lib/types` 흡수 차수에서 처리한다.
2. `RecordItem` 타입과 관련 컴포넌트 import까지 즉시 feature로 이동한다.

### 추천

- 1번. `RecordItem`은 page/sidebar/center/ai-panel 전반에 넓게 퍼져 있어 타입 이동은 별도 PR로 검증하는 편이 안전하다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 40차: counseling record retry hook feature 이동

### 작업내용

- `use-record-retry`를 `features/counseling-record-workspace/hooks`로 이동한다.
- 전사 재시도/분석 재시도 POST 호출을 `counseling-records-api.ts` helper로 분리한다.
- app `_hooks/index.ts`는 기존 사용처 호환 re-export만 유지한다.

### 논의 필요

- 재시도 hook의 `RecordItem` 타입 의존까지 이번 차수에 제거할지 여부.

### 선택지

1. hook/API boundary 이동을 먼저 하고 `RecordItem` 타입 이동은 후속 차수로 남긴다.
2. 타입 이동까지 함께 한다.

### 추천

- 1번. `RecordItem`은 아직 app 컴포넌트 전반에 넓게 연결되어 있어 별도 차수에서 이동한다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 41차 — counseling AI chat hook feature 이동

### 작업내용

- `use-ai-chat`을 `apps/web/src/app/counseling-service/_hooks`에서 `features/counseling-record-workspace/hooks`로 이동한다.
- AI 채팅 SSE POST와 자동 분석 POST 호출을 `counseling-records-api` helper로 분리한다.
- app `_hooks/index.ts`는 기존 import 호환을 위한 re-export만 유지한다.

### 논의 필요

- `AiMessage`, `AnalysisResult`, `AttachedImage` 타입은 아직 app `_lib/types`가 원천이다. 이번 차수에서 타입 이동까지 함께 하면 영향 범위가 커진다.

### 선택지

1. 훅과 API 호출만 feature 경계로 옮기고 타입 이동은 후속 차수로 남긴다.
2. 관련 타입까지 feature model로 이동한다.
3. `use-records`까지 함께 묶어 큰 단위로 재배치한다.

### 추천

- 선택지 1. 앱 레이어의 실행 훅 누수를 한 번에 하나씩 제거하고, 타입/model 이동은 별도 차수에서 사용처를 전수 확인한다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 42차 — merged records hook feature 이동

### 작업내용

- `use-merged-records`를 `features/counseling-record-workspace/hooks`로 이동한다.
- app `_hooks/index.ts`는 기존 import 호환 re-export만 유지한다.

### 논의 필요

- `RecordItem` 타입과 `record-state-adapters`는 아직 app `_lib`에 남아 있다. `use-records`와 함께 상태/model 원천을 옮기는 차수에서 별도 정리한다.

### 선택지

1. 훅 위치만 feature로 이동하고 model/adapters 이동은 후속 차수로 남긴다.
2. `RecordItem`과 adapters까지 함께 feature model로 옮긴다.
3. `use-records`까지 즉시 같이 이동한다.

### 추천

- 선택지 1. 작은 훅 이동으로 app `_hooks` 표면을 줄이고, 원천 타입 이동은 `use-records` 정리와 묶는다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 43차 — records data hook feature 이동

### 작업내용

- `use-records`를 `features/counseling-record-workspace/hooks`로 이동한다.
- app `_hooks/index.ts`는 기존 import 호환 re-export만 유지한다.
- 기존 `use-records` 테스트는 feature hook import를 검증하도록 경로를 바꾼다.

### 논의 필요

- `RecordItem`, `AiMessage`, `processing-progress`, `record-state-adapters`는 아직 app `_lib`에 남아 있다. 이번 차수에서 모두 옮기면 import 영향 범위가 커지므로 별도 model/lib 이동 차수로 분리한다.

### 선택지

1. `use-records` 구현만 feature hook으로 이동하고 app `_lib` 의존은 명시적 임시 의존으로 둔다.
2. `RecordItem`과 adapters까지 한 번에 feature로 이동한다.
3. sidebar/center-panel 분해 전까지 hook 이동을 보류한다.

### 추천

- 선택지 1. 실제 app `_hooks` 구현을 먼저 제거해 route layer를 얇게 만들고, model/lib 이동은 다음 작은 PR에서 전수 사용처를 확인한다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 44차 — counseling record model/lib feature 원천화

### 작업내용

- 상담 기록 feature hook이 참조하는 `types`, `utils`, `processing-progress`, `record-state-adapters`, `client-request-id`를 `features/counseling-record-workspace/lib`로 이동한다.
- 기존 app `_lib` 경로는 페이지/컴포넌트 호환을 위해 re-export wrapper만 유지한다.
- feature 내부 import가 app `_lib`를 직접 참조하지 않도록 바꾼다.

### 논의 필요

- app `_components`가 아직 `_lib` wrapper를 통해 같은 model을 사용한다. 컴포넌트 이동/분해 전까지 호환 wrapper는 유지한다.

### 선택지

1. 원천 파일을 feature lib로 옮기고 app `_lib`는 re-export wrapper로 둔다.
2. 모든 app component import까지 feature lib로 한 번에 바꾼다.
3. sidebar 분해 후 model 이동을 진행한다.

### 추천

- 선택지 1. source of truth는 feature로 고정하되, 대형 컴포넌트 리팩토링 전 호환 import는 유지한다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 45차 — sidebar member list item component 추출

### 작업내용

- 1000줄급 `sidebar.tsx`에서 memoized `MemberListItem` presentational component를 feature component 파일로 추출한다.
- sidebar 본문은 선택/드래그 상태 조립과 렌더 조립만 유지한다.

### 논의 필요

- sidebar 전체를 한 번에 분해하면 selection/drag/context menu 상태가 얽혀 위험하다. 이번 차수는 순수 표시 항목 추출만 한다.

### 선택지

1. `MemberListItem`만 feature component로 추출한다.
2. 멤버 섹션 전체를 한 번에 추출한다.
3. sidebar 전체를 feature component로 이동한다.

### 추천

- 선택지 1. memo 비교 조건과 actions contract를 보존하면서 파일 크기와 책임을 먼저 줄인다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 46차 — sidebar unlinked record item component 추출

### 작업내용

- `sidebar.tsx`의 미분류 상담 기록 button 렌더링을 feature component로 추출한다.
- sidebar는 selection/drag/context menu 핸들러 연결만 유지한다.

### 논의 필요

- 미분류 섹션 전체를 추출할 수도 있지만, 상태 계산과 order map 의존이 있어 이번 차수는 항목 컴포넌트만 분리한다.

### 선택지

1. `UnlinkedRecordListItem`만 추출한다.
2. 미분류 섹션 전체를 추출한다.
3. sidebar context menu 상태까지 hook으로 분리한다.

### 추천

- 선택지 1. 안전한 presentational 추출로 sidebar 크기를 계속 줄인다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 47차 — sidebar unlinked records section component 추출

### 작업내용

- `sidebar.tsx`의 미분류 상담 기록 섹션 전체를 feature component로 추출한다.
- parent sidebar는 visible order/index와 selection handler를 props로 넘기고, 섹션 제목/카운트/항목 반복은 feature component가 담당한다.

### 논의 필요

- context menu/drag/select state machine 자체는 아직 sidebar에 남아 있다. 이번 차수는 JSX 섹션 추출만 하고 상태 머신 분리는 후속 차수로 둔다.

### 선택지

1. 미분류 섹션 전체만 추출한다.
2. 수강생 섹션까지 함께 추출한다.
3. selection/drag/context menu hook까지 같이 분리한다.

### 추천

- 선택지 1. 이미 분리한 `UnlinkedRecordListItem`을 감싸는 작은 섹션 컴포넌트로 sidebar 크기와 책임을 더 줄인다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 48차 — sidebar members section component 추출 및 record memo signature 보강

### 작업내용

- `sidebar.tsx`의 수강생 섹션 제목/카운트/빈 상태/목록 반복 렌더링을 feature component로 추출한다.
- `MemberListItem` memo 비교가 중간 상담 기록 변경을 놓치지 않도록 member record signature를 명시 props로 전달한다.
- sidebar는 selection/drag/context menu 상태와 action wiring만 유지한다.

### 논의 필요

- 수강생 섹션 추출과 memo signature 보강은 같은 렌더 경계에 있어 함께 처리하는 것이 안전하다. selection/drag/context menu 상태 머신 분리는 후속 차수로 둔다.

### 선택지

1. 수강생 섹션만 feature component로 추출하고 memo signature를 함께 보강한다.
2. sidebar selection/context menu hook까지 한 번에 분리한다.
3. `MemberListItem` comparator만 수정하고 섹션 추출은 보류한다.

### 추천

- 선택지 1. presentational boundary를 넓히면서 stale record 표시 위험을 같이 줄인다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 49차 — sidebar space selector component 추출

### 작업내용

- `sidebar.tsx`의 스페이스 선택 버튼/드롭다운/새 스페이스 CTA 렌더링을 feature component로 추출한다.
- parent sidebar는 selection/context menu 상태와 action handler만 유지한다.
- 스페이스 선택, multi-select, context menu, 새 스페이스 모달 열기 동작은 변경하지 않는다.

### 논의 필요

- 스페이스 selector는 click-outside ref와 selection handler에 의존한다. 이번 차수는 ref/action을 props로 넘기는 presentational 추출만 하고, selection state machine hook 분리는 후속으로 둔다.

### 선택지

1. `SidebarSpaceSelector` component만 추출한다.
2. context menu와 space selector를 함께 추출한다.
3. sidebar selection hook까지 한 번에 분리한다.

### 추천

- 선택지 1. UI 경계를 먼저 분리해 sidebar 파일 크기를 줄이고 selection 로직 변경 위험을 피한다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 50차 — sidebar context menu component 추출

### 작업내용

- `sidebar.tsx`의 context menu DOM 렌더링과 action icon 표시를 feature component로 추출한다.
- parent sidebar는 context action 목록 생성, delete 진행 상태, click-outside ref 연결만 유지한다.
- context menu action 실행, 삭제 disabled 표시, 위치 계산은 기존 동작을 유지한다.

### 논의 필요

- action 목록 생성 로직은 라우팅/export/delete handler에 의존한다. 이번 차수는 순수 메뉴 렌더링만 추출하고 action factory/hook 분리는 후속으로 둔다.

### 선택지

1. `SidebarContextMenu` 렌더링 component만 추출한다.
2. context action 생성 로직까지 feature hook으로 분리한다.
3. sidebar selection/context menu 상태를 한 번에 hook으로 분리한다.

### 추천

- 선택지 1. context menu UI 경계를 먼저 분리해 sidebar의 JSX 책임을 줄인다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 51차 — center panel analysis cards component 추출

### 작업내용

- `center-panel.tsx` 안의 AI 분석 결과 카드 렌더링을 `features/counseling-record-workspace/components`로 추출한다.
- center panel은 선택 record 상태 분기와 레이아웃 조립만 유지하고, 분석 결과 표시 책임을 feature component로 이동한다.
- 분석 결과 데이터 구조와 표시 문구/스타일은 변경하지 않는다.

### 논의 필요

- center panel에는 transcript, audio player, error/processing state까지 아직 남아 있다. 이번 차수는 순수 분석 카드만 분리하고 나머지는 후속 차수로 둔다.

### 선택지

1. `AnalysisCards`만 feature component로 추출한다.
2. transcript details와 audio player까지 함께 추출한다.
3. center panel 전체를 feature screen component로 이동한다.

### 추천

- 선택지 1. 순수 표시 컴포넌트를 먼저 이동해 app route component 크기와 책임을 안전하게 줄인다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 52차 — center panel transcript details component 추출

### 작업내용

- `center-panel.tsx`에서 두 번 반복되는 전사 원문 details 렌더링을 feature component로 추출한다.
- 전사 summary 계산과 segment row 표시 책임을 `TranscriptDetails`로 이동한다.
- 부분 원문/완료 원문의 빈 상태 문구와 기본 open 동작은 기존과 동일하게 유지한다.

### 논의 필요

- transcript 표시와 audio player는 모두 center panel의 순수 표시 영역이다. 이번 차수는 중복이 있는 transcript details만 먼저 분리하고 audio player는 후속으로 둔다.

### 선택지

1. `TranscriptDetails`만 feature component로 추출한다.
2. audio player까지 함께 추출한다.
3. center panel 상태 분기 전체를 feature hook으로 분리한다.

### 추천

- 선택지 1. 중복 JSX와 summary 계산을 먼저 제거해 center panel의 표시 책임을 줄인다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 53차 — center panel audio player component 추출

### 작업내용

- `center-panel.tsx`의 오디오 플레이어 JSX와 seek 비율 계산을 feature component로 추출한다.
- partial transcript/ready 상태에서 같은 재생 UI를 재사용하고, 텍스트 메모 fallback 문구는 ready 상태에서만 유지한다.
- 재생 상태, 시간 표시, seek handler 동작은 기존과 동일하게 유지한다.

### 논의 필요

- audio element 제어 상태는 상위 hook/page가 이미 소유한다. 이번 차수는 UI/이벤트 계산만 component로 이동하고 재생 상태 source of truth는 변경하지 않는다.

### 선택지

1. `RecordAudioPlayer` presentational component만 추출한다.
2. audio playback state hook까지 함께 feature로 이동한다.
3. center panel ready/partial 분기 전체를 component로 분리한다.

### 추천

- 선택지 1. 중복 UI와 이벤트 계산만 먼저 제거해 center panel 책임을 줄이고 재생 상태 변경 위험은 피한다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 54차 — center panel failure state component 추출

### 작업내용

- `center-panel.tsx`의 실패 상태 header/body/retry UI를 feature component로 추출한다.
- 실패 표시 판정 로직을 app route `_lib`에서 feature lib로 이동하고, 기존 app import 경로는 re-export로 유지한다.
- 재전사/AI 분석 재시도 분기, retry feedback, 실패 문구는 기존 동작 그대로 유지한다.

### 논의 필요

- 실패 상태는 UI와 실패 판정 로직이 함께 묶여 있어 app route에 남기면 상담 워크스페이스 이중화가 계속된다. 이번 차수는 feature component/lib로 이동하되, 기존 테스트 import 경로는 깨지지 않게 유지한다.

### 선택지

1. `RecordFailureState` component와 failure presentation lib를 feature layer로 이동한다.
2. failure 상태와 processing 상태를 함께 분리한다.
3. `center-panel.tsx` 전체 상태 분기를 한 번에 feature screen으로 이동한다.

### 추천

- 선택지 1. 실패 상태만 먼저 분리해 retry 동작 변경 위험을 낮추고 app route의 feature 로직을 줄인다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 55차 — center panel processing state component 추출

### 작업내용

- `center-panel.tsx`의 일반 processing 상태 header/body/checklist UI를 feature component로 추출한다.
- processing checklist 계산은 기존 feature lib `processing-progress`를 사용한다.
- 처리 단계 문구, spinner, checklist 표시 규칙은 기존과 동일하게 유지한다.

### 논의 필요

- partial transcript ready 상태는 retry/action UI와 transcript details가 결합되어 있어 별도 후속으로 둔다. 이번 차수는 순수 일반 processing 표시만 분리한다.

### 선택지

1. `RecordProcessingState` component만 추출한다.
2. partial transcript ready 상태까지 함께 추출한다.
3. center panel 전체 상태 분기를 한 번에 feature screen으로 이동한다.

### 추천

- 선택지 1. 일반 processing 표시만 먼저 이동해 app route의 상태별 JSX를 안전하게 줄인다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 56차 — center panel partial transcript state component 추출

### 작업내용

- `center-panel.tsx`의 partial transcript ready 상태 UI를 feature component로 추출한다.
- header, audio player, 누락 구간 retry CTA, retry feedback, partial transcript details 표시를 component 내부로 이동한다.
- 누락 구간 재시도 동작, 진행률 표시, 부분 원문 빈 상태 문구는 기존과 동일하게 유지한다.

### 논의 필요

- partial 상태는 processing이지만 일반 processing과 다른 복구 액션을 갖는다. 일반 processing component와 합치지 않고 별도 component로 유지해 상태 의미를 분명히 한다.

### 선택지

1. `RecordPartialTranscriptState` component를 별도로 추출한다.
2. `RecordProcessingState`에 variant prop으로 통합한다.
3. ready/partial 공통 header까지 한 번에 추출한다.

### 추천

- 선택지 1. 상태 의미와 retry 액션 경계를 명확히 유지하면서 center panel의 큰 JSX 블록을 제거한다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 57차 — center panel ready state component 추출

### 작업내용

- `center-panel.tsx`의 ready 상태 UI를 feature component로 추출한다.
- record header, 수강생 연결 CTA, mismatch warning, audio player, analyzing banner, analysis cards, transcript details를 component 내부로 이동한다.
- 수강생 연결, 오디오 재생/seek, 분석/원문 표시 동작은 기존과 동일하게 유지한다.

### 논의 필요

- mismatch warning 판정은 아직 app route lib에서 생성된다. 이번 차수는 ready state 표시만 이동하고, mismatch detection 로직 이동은 page/link modal 의존성을 정리하는 후속 차수로 둔다.

### 선택지

1. `RecordReadyState` component만 추출한다.
2. mismatch warning detection까지 feature lib로 이동한다.
3. center panel 전체를 feature screen component로 이동한다.

### 추천

- 선택지 1. ready 상태의 큰 JSX를 먼저 제거해 center panel을 상태 라우터에 가깝게 만든다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 58차 — center panel empty state component 추출

### 작업내용

- `center-panel.tsx`의 selected 없음 상태 UI를 feature component로 추출한다.
- app route component는 selected 상태에 따라 feature 상태 component를 선택하는 라우터 역할만 하도록 더 축소한다.
- 빈 상태 문구와 레이아웃은 기존과 동일하게 유지한다.

### 논의 필요

- empty state는 작은 블록이지만 center panel 내부에서 마지막으로 남은 직접 JSX 상태다. 이번 차수에서 분리해 상태별 표시 책임을 feature layer로 통일한다.

### 선택지

1. `RecordEmptyState` component만 추출한다.
2. `CenterPanel` 자체를 feature screen component로 이동한다.
3. empty state는 작으므로 유지하고 다른 큰 파일로 이동한다.

### 추천

- 선택지 1. 작은 변경으로 center panel의 상태별 표시 책임을 완전히 feature component로 정리한다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 59차 — record member mismatch 판정 feature lib 이동

### 작업내용

- `app/counseling-service/_lib/record-member-mismatch.ts`의 mismatch warning 타입/판정 로직을 `features/counseling-record-workspace/lib`로 이동한다.
- 실제 사용처(`page.tsx`, `link-member-modal.tsx`, `center-panel.tsx`)는 feature lib를 직접 참조하도록 변경한다.
- 기존 app `_lib` 경로는 호환 re-export로 유지해 단계적 정리를 가능하게 한다.

### 논의 필요

- link modal과 page가 같은 판정 로직을 공유한다. app route 아래에 남기면 feature SSOT가 흐려지므로 feature lib를 원본으로 삼는다.

### 선택지

1. feature lib 이동 + app 경로 re-export 유지.
2. app 경로를 즉시 삭제한다.
3. mismatch warning UI까지 함께 별도 component로 분리한다.

### 추천

- 선택지 1. 사용 경로를 feature로 정렬하면서 기존 import 호환성을 유지해 회귀 위험을 낮춘다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 60차 — 상담 기록 DOCX 내보내기 feature lib 이동

### 작업내용

- `app/counseling-service/_lib/export-docx.ts`의 DOCX 생성/다운로드 로직을 `features/counseling-record-workspace/lib/export-docx.ts`로 이동한다.
- 실제 사용처(`page.tsx`, `member-panel.tsx`)는 feature lib를 직접 참조하도록 변경한다.
- 기존 app `_lib` 경로는 호환 re-export로 유지한다.

### 논의 필요

- DOCX 내보내기는 route 조립이 아니라 상담 기록 워크스페이스 기능 로직이다. app `_lib`에 남기면 feature SSOT 정리가 끝나지 않는다.

### 선택지

1. feature lib 이동 + app 경로 re-export 유지.
2. app 경로를 즉시 삭제한다.
3. DOCX builder를 record/member report별 파일로 한 번 더 분리한다.

### 추천

- 선택지 1. 실제 import 경로를 feature로 정렬하면서 기존 경로 호환성을 유지한다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 61차 — 상담 워크스페이스 UI 정책 feature lib 이동

### 작업내용

- `app/counseling-service/_lib/counseling-workspace-ui-policy.ts`의 surface/sidebar/tutorial 정책 판정 로직을 `features/counseling-record-workspace/lib`로 이동한다.
- `page.tsx` 실제 사용처는 feature lib를 직접 참조하도록 변경한다.
- 기존 app `_lib` 경로는 호환 re-export로 유지하고, 정책 테스트도 feature lib 옆으로 이동한다.

### 논의 필요

- UI 정책은 route 조립 코드가 아니라 상담 기록 워크스페이스 상태에서 파생되는 feature 규칙이다. app `_lib`에 남으면 page.tsx가 feature 규칙의 소유자가 되는 구조적 냄새가 남는다.

### 선택지

1. feature lib 이동 + app 경로 re-export 유지 + 테스트 이동.
2. app 경로를 즉시 삭제한다.
3. 정책을 page hook으로 흡수한다.

### 추천

- 선택지 1. 정책 SSOT를 feature에 두되 기존 경로 호환성을 유지해 단계적 정리를 이어간다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 62차 — cloud import workspace split hook 추출

### 작업내용

- `features/cloud-import/components/cloud-import-inline.tsx`의 확장 프리뷰 레이아웃 분할 비율, viewport 판정, pointer resize 상태를 `useCloudImportWorkspaceSplit` hook으로 추출한다.
- component는 로컬/클라우드 가져오기 흐름과 렌더링 조립에 집중하고, split ratio 저장/복원/키보드 조절/drag 상태는 hook이 소유한다.
- 동작과 UI 클래스는 유지하고 파일 크기와 상태 책임을 줄인다.

### 논의 필요

- `cloud-import-inline.tsx`는 아직 저장 초안 모달, entry header, 파일 브라우저, 프리뷰 workspace를 모두 가진 큰 컴포넌트다. 이번 차수는 회귀 위험이 낮은 레이아웃 상태 머신부터 분리한다.

### 선택지

1. split ratio/resize 상태를 hook으로 추출한다.
2. 저장 초안 모달 UI를 먼저 component로 추출한다.
3. 파일 브라우저 전체를 별도 component로 추출한다.

### 추천

- 선택지 1. DOM pointer 이벤트와 localStorage 동기화가 컴포넌트 본문을 크게 오염시키므로 먼저 hook으로 격리한다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 63차 — cloud import saved drafts modal component 추출

### 작업내용

- `cloud-import-inline.tsx`에 inline으로 들어 있던 저장된 가져오기 작업 모달 UI를 `CloudImportSavedDraftsModal` component로 추출한다.
- modal 상태/액션은 기존 `useSavedImportDraftsModal` 반환값을 그대로 전달하고, presentation만 분리한다.
- entry header, 파일 브라우저, 프리뷰 workspace 동작은 변경하지 않는다.

### 논의 필요

- split hook 추출 후에도 저장 초안 모달 JSX가 component 본문을 크게 차지한다. 상태 hook은 이미 별도이므로 UI component 분리는 낮은 위험으로 파일 크기를 줄일 수 있다.

### 선택지

1. 저장 초안 모달 UI만 component로 추출한다.
2. entry header까지 함께 추출한다.
3. 파일 브라우저까지 한 번에 추출한다.

### 추천

- 선택지 1. 상태와 액션을 건드리지 않고 presentation만 분리해 회귀 위험을 낮춘다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 64차 — student management OAuth result toast feature component 이동

### 작업내용

- `app/counseling-service/student-management/layout.tsx` 내부의 OAuth 결과 토스트 구현을 `features/student-management/components/oauth-result-toast.tsx`로 이동한다.
- route layout은 provider/route shell 조립에 집중하고, Google Drive/OneDrive 결과 토스트 UI는 feature component가 소유한다.
- 기존 URL query 정리와 자동 dismiss 동작은 유지한다.

### 논의 필요

- student-management layout은 아직 route shell, sidebar 상태, modal, toast가 섞여 있다. 이번 차수는 독립적인 OAuth toast부터 분리해 layout 책임을 줄인다.

### 선택지

1. OAuth toast만 feature component로 이동한다.
2. SidebarContent 전체를 feature shell component로 이동한다.
3. create/import modal orchestration까지 한 번에 hook으로 분리한다.

### 추천

- 선택지 1. 독립 UI부터 이동해 회귀 위험을 낮추고 후속 layout 분해의 발판을 만든다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 65차 — counseling sidebar selection state hook 추출

### 작업내용

- `app/counseling-service/_components/sidebar.tsx`에 섞여 있는 multi-select, shift/drag selection, context menu, delete confirmation 상태머신을 feature hook으로 추출한다.
- route app component는 sidebar 렌더링과 feature hook wiring만 담당하게 줄인다.
- space/member/record ordered id와 label resolver, delete/export/open action은 기존 props를 그대로 사용해 동작은 유지한다.

### 논의 필요

- 현재 sidebar는 887줄이며, UI 렌더링과 선택 상태 전이, context menu, 삭제 처리까지 한 파일에서 소유한다. selection 상태는 counseling record workspace의 재사용 가능한 interaction 규칙이므로 app route 아래에 남기면 후속 변경마다 상태 오염 가능성이 커진다.

### 선택지

1. selection/context menu/delete orchestration만 `useCounselingSidebarSelection` hook으로 추출한다.
2. sidebar 전체를 feature component로 한 번에 이동한다.
3. 먼저 presentational section만 더 쪼갠다.

### 추천

- 선택지 1. 상태 전이 source of truth를 먼저 격리해 리뷰 가능한 단위로 만들고, 렌더링 컴포넌트 이동은 후속 차수로 진행한다.

### 사용자 방향

- 추천 기준으로 진행한다.
