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
