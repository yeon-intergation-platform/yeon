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
