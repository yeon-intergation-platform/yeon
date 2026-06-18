# Backend Karate CI schema preflight

## 1차

### 작업내용

- `Backend Tests & Reports`의 `karate-flows` job이 backend health 응답만 보고 `public.users` seed를 실행하는 구조를 고친다.
- self-hosted runner에 남은 이전 backend 프로세스나 포트 재사용 때문에 stale health가 통과하지 않도록 Karate backend 포트를 실행별로 분리한다.
- seed 전에 Flyway migration 결과로 `public.users`가 실제로 존재하는지 확인한다.
- 같은 실수가 반복되지 않도록 backend test workflow 계약을 정적으로 검사하는 검증 스크립트를 추가하고 SSOT 검사에 연결한다.

### 논의 필요

- 없음. 현재 CI 실패는 `public.users`가 없는 상태에서 seed SQL이 먼저 실행된 것이므로 workflow 전제 검증이 필요하다.

### 선택지

- A. seed SQL 앞에 `create table if not exists public.users`를 추가한다.
- B. backend boot 이후 DB schema preflight를 추가하고, 실패 시 Flyway 상태와 boot log를 출력한다.
- C. Karate test user seed를 Spring API로 옮긴다.

### 추천

- B. schema의 source of truth는 Flyway migration이므로 CI가 임시 DDL로 테이블을 만들면 원인을 숨긴다. seed 전 preflight로 Flyway 완료를 확인하고 실패 원인을 드러내는 편이 맞다.

### 사용자 방향

- 추천 기준으로 진행한다.
