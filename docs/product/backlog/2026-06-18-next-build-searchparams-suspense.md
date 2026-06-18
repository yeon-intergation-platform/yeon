# 2026-06-18 Next 빌드 useSearchParams Suspense 복구

## 차수 1

### 작업내용

- `Build, Push, and Deploy Docker Image`의 `@yeon/web` production build가 `/404`, `/auth/error` prerender 중 `useSearchParams()` Suspense 경계 누락으로 실패한 원인을 수정한다.
- 루트 layout에서 GA 페이지 추적 클라이언트 컴포넌트를 `Suspense`로 감싸 Next App Router의 정적 prerender 요구사항을 만족시킨다.
- 배포 전 로컬 `@yeon/web` build로 같은 실패 지점이 통과되는지 확인한다.

### 논의 필요

- 없음. 로그가 특정 Next 요구사항 위반을 직접 가리키고, 수정 범위가 GA 추적 컴포넌트 렌더 경계로 한정된다.

### 선택지

- 선택지 A: `GoogleAnalyticsPageTracker` 호출부를 `Suspense`로 감싼다.
- 선택지 B: GA 페이지 추적 컴포넌트 내부에서 search params 의존을 제거한다.
- 선택지 C: 영향을 받는 개별 페이지마다 Suspense 경계를 추가한다.

### 추천

- 선택지 A. 원인은 root layout에서 모든 페이지에 공통 삽입되는 클라이언트 추적 컴포넌트이므로, 호출부 한 곳에 경계를 두는 것이 가장 작고 직접적이다.

### 사용자 방향

- 추천 기준으로 진행한다.
