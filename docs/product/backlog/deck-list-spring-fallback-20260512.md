# deck-list-spring-fallback-20260512

## 1차수

### 작업내용

- 타이핑 서비스 `/typing-service/decks`의 내 덱/공개 덱 목록이 Spring backend 비활성 또는 인증 실패 상태에서 오류로 깨지지 않게 한다.
- 카드 서비스 내 덱 목록이 Spring backend 비활성 또는 인증 실패 상태에서 기존 Next DB 목록으로 폴백되게 한다.
- 로컬 `pnpm dev:all` 상태에서 사용자가 바로 목록 화면을 확인할 수 있게 한다.

### 논의 필요

- Spring backend `jdbc` profile이 꺼진 로컬 환경에서도 Next BFF 목록 화면을 계속 살릴지 여부.

### 선택지

1. `dev-all`에서 Spring `jdbc` profile을 강제한다.
2. 목록 API에서 Spring 실패 시 기존 Next DB 서비스로 폴백한다.
3. 화면에서 오류를 숨기고 빈 목록만 보여준다.

### 추천

- 2번. 운영/로컬 모두에서 목록 가시성을 유지하고, Spring 전환 중에도 사용자 화면을 깨지 않게 한다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 2차수

### 작업내용

- Spring profile을 `dev.local` / `staging` / `prod` 기준으로 재정리한다.
- DB 없는 `default` 실행이 실제 서비스 API를 비활성화하는 문제를 제거한다.
- `pnpm dev:all`은 로컬 서버를 `dev.local` profile로 띄우게 한다.

### 논의 필요

- `jdbc` profile 이름을 유지할지 여부.

### 선택지

1. 기존 `jdbc` profile을 유지하고 dev-all만 수정한다.
2. `jdbc`를 폐기하고 `dev.local` / `staging` / `prod`만 운영 profile로 둔다.

### 추천

- 2번. 사용자가 지정한 세 환경명을 Spring profile source of truth로 삼는다.

### 사용자 방향

- `application.yml`, `application-dev.local.yml`, `application-staging.yml`, `application-prod.yml`로 관리한다.
