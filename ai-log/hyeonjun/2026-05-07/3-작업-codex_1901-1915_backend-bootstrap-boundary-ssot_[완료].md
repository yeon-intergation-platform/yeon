# backend bootstrap boundary SSOT 작성 로그

## 목표
- `spring-bootstrap-runway.md`의 차수 1 중 1~3단계를 별도 SSOT 문서로 분리한다.

## 오늘 한 일
- `docs/architecture/spring-backend-bootstrap-boundary.md`를 새로 만들었다.
- `apps/backend`를 Spring Boot 시작 위치로 고정했다.
- `apps/web`, `apps/backend`, `apps/race-server`의 초기 역할 경계를 표로 정리했다.
- bootstrap 단계에서 아직 하지 않을 항목을 비목표로 명시했다.
- `docs/architecture/README.md`에 새 문서 링크를 추가했다.

## 핵심 판단
- 첫 SSOT는 코드 생성보다 위치와 역할 경계를 먼저 고정해야 한다.
- `apps/backend`는 현재 Yeon 구조에서 가장 설명 가능성이 높은 Spring 시작점이다.
- `apps/race-server`는 bootstrap 단계에서 건드리지 않는 독립 실시간 서버로 남긴다.

## 다음 추천 작업
1. `local backend run` 원칙 문서 초안으로 넘어간다.
2. 그 전에 `spring-bootstrap-runway.md` 차수 2의 11~13단계 정도만 별도 문서화한다.
3. 여전히 코드 생성은 하지 않는다.

## 변경 파일
- `docs/architecture/spring-backend-bootstrap-boundary.md`
- `docs/architecture/README.md`
- `ai-log/hyeonjun/2026-05-07/3-작업-codex_1901-1915_backend-bootstrap-boundary-ssot_[작업중].md`
