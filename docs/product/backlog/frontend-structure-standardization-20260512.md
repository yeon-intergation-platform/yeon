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
