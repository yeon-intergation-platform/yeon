# dev-all AUTH_SECRET 로컬 동기화

## 1차

### 작업내용

- `pnpm dev:all` 실행 시 로컬 env 파일에서 `AUTH_SECRET`을 찾아 web/backend 프로세스 양쪽에 동일하게 주입한다.
- 기존 `SPRING_INTERNAL_TOKEN` 동기화 방식과 같은 실행 경로에서 처리한다.
- 운영 `/srv/yeon/.env` 단일 관리 방식은 건드리지 않고, 로컬 개발 실행기만 수정한다.

### 논의 필요

- 로컬 fallback secret을 둘지, 없으면 명시적으로 경고만 남길지 결정이 필요하다.

### 선택지

1. `AUTH_SECRET`이 없으면 로컬 전용 기본값을 사용한다.
2. `AUTH_SECRET`이 없으면 `dev:all` 실행을 실패시킨다.
3. env 파일 자동 생성까지 수행한다.

### 추천

- 1번. 로컬 개발 서버가 인증 secret 누락 때문에 첫 화면에서 막히지 않도록 하되, 운영은 기존 secret 주입 정책을 유지한다.

### 사용자 방향

- 추천 기준으로 진행한다.
