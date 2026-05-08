# Spring Backend Dependency Setup First Backlog

## 문서 목적
- 기능 이전 전에 `apps/backend`의 **기초 의존성 세팅 lane**을 먼저 끝내기 위한 전용 backlog다.
- 여기서 말하는 setup은 “기동 가능한 backend를 운영형 backend로 키우기 위한 기반 dependency 묶음”이다.
- 다만 **한 번에 전부 넣는 것**은 금지하고, bundle 단위로만 진행한다.

## 왜 별도 lane으로 분리하나
- 지금은 backend skeleton / Java 25 / health check / web smoke까지 확보됐다.
- 다음부터 기능을 옮기기 시작하면 dependency 추가와 기능 디버깅이 섞여 실패 원인 분리가 어려워진다.
- 그래서 기능 이전 전에 `security`, `jdbc`, `flyway`, `jpa`, `testcontainers` 같은 기반요소를 먼저 깔아두는 전략을 쓴다.

## 현재 baseline
- 이미 있음:
  - `webmvc`
  - `actuator`
  - `validation`
- 이미 검증됨:
  - Java `25`
  - Spring Boot `4.0.6`
  - bootRun 성공
  - `/actuator/health` 200
  - Next smoke route 성공

## setup-first 전략의 핵심 원칙
1. **starter를 한 번에 1 bundle만 추가한다.**
2. **bundle마다 bootRun / health / test 증거를 남긴다.**
3. **DB schema ownership이 불명확한 상태에서는 migration tool을 억지로 돌리지 않는다.**
4. **보안/DB/ORM/테스트 지원은 반드시 순서대로 넣는다.**
5. **기능 구현은 dependency lane이 끝날 때까지 보류한다.**

## bundle 순서

### Bundle 0 — 현재 baseline 유지
- 포함:
  - `webmvc`
  - `actuator`
  - `validation`
- 상태: 완료

### Bundle 1 — Security baseline
- 추가 대상:
  - `spring-boot-starter-security`
- 목표:
  - health/public endpoint만 열고 나머지는 기본 차단하는 최소 정책 확보
- 이 bundle에서 할 일:
  1. dependency 추가
  2. 최소 `SecurityFilterChain` 구성
  3. `/actuator/health` 공개 유지
  4. smoke endpoint 접근 정책 확인
- 검증:
  - bootRun
  - `/actuator/health` 200
  - 보호 route 401/403 확인
- stop rule:
  - 로그인/세션/JWT까지 같이 들어오면 중단

### Bundle 2 — JDBC baseline
- 추가 대상:
  - `spring-boot-starter-jdbc`
  - PostgreSQL driver
- 목표:
  - ORM 이전에 datasource 연결과 설정 경계를 먼저 고정
- 이 bundle에서 할 일:
  1. dependency 추가
  2. datasource env key 설계
  3. local/dev DB 연결 smoke
  4. DB health 또는 connection smoke 확인
- 검증:
  - bootRun
  - datasource init 성공
  - 연결 smoke 성공
- stop rule:
  - entity/repository까지 한 턴에 끌고 가면 중단

### Bundle 3 — Flyway baseline
- 추가 대상:
  - `flyway-core`
- 목표:
  - Spring이 직접 소유할 schema migration 경로 확보
- 왜 Liquibase가 아니라 Flyway를 먼저 보나
  - Spring/JPA/Postgres 조합에서 운영 패턴이 단순하다
  - SQL-first migration 흐름을 잡기 쉽다
  - 지금 단계는 “복잡한 migration DSL”보다 “작고 명확한 SQL history”가 더 중요하다
- 이 bundle에서 할 일:
  1. dependency 추가
  2. migration 위치 규칙 정의
  3. 빈 migration 또는 no-op migration 1개
  4. local apply smoke
- 검증:
  - bootRun
  - flyway migrate 성공
  - 재실행 시 drift 없음
- stop rule:
  - Next Drizzle ownership과 충돌하는 테이블에 바로 손대려 하면 중단

### Bundle 4 — JPA baseline
- 추가 대상:
  - `spring-boot-starter-data-jpa`
- 목표:
  - repository/service 기반 도메인 이전의 최소 영속성 표준 확보
- 이 bundle에서 할 일:
  1. dependency 추가
  2. package scan 기본선 확인
  3. 첫 dummy entity/repository 또는 아주 작은 smoke 구성
- 검증:
  - bootRun
  - JPA startup 성공
  - repository smoke 성공
- stop rule:
  - 실제 업무 도메인 2개 이상을 동시에 이식하려 하면 중단

### Bundle 5 — Testcontainers baseline
- 추가 대상:
  - testcontainers core + postgres
- 목표:
  - DB 연동 테스트를 로컬/CI에서 재현 가능하게 만들기
- 이 bundle에서 할 일:
  1. dependency 추가
  2. integration test base 확정
  3. postgres container smoke test
- 검증:
  - `./gradlew test`
  - container 기반 테스트 1건 성공
- stop rule:
  - CI/container 권한이 미확정이면 문서만 쓰고 중단

### Bundle 6 — DevTools (선택)
- 추가 대상:
  - `spring-boot-devtools`
- 목표:
  - 반복 개발 속도 향상
- 조건:
  - 실제로 backend 수정 루프가 잦아졌을 때만

### Bundle 7 — Lombok (기본 보류)
- 기본 입장:
  - 기본 미채택
- 허용 조건:
  - 팀 합의 + 대안 검토 완료 시에만

## setup-first lane에서 확정하는 선택
- migration tool은 **Flyway 우선**
- ORM은 **JPA/Hibernate 표준선**
- DB 연결은 **JDBC 먼저, JPA 나중**
- 보안은 **Security baseline 먼저, auth migration은 나중**
- 테스트 인프라는 **Testcontainers를 마지막 기반 bundle**로 둔다
- Lombok은 **선택 항목**으로 끝까지 남긴다

## bundle별 검증 공통 규칙
각 bundle이 끝날 때마다 최소 아래를 수행한다.

1. `git diff --check`
2. backend 관련 Gradle task 1개 이상
3. `bootRun` 또는 동등 기동 확인
4. `/actuator/health` 재확인
5. 필요한 경우 web smoke route 재확인

## 금지 사항
- bundle 2개 이상 동시 반영 금지
- dependency 추가와 feature migration 동시 진행 금지
- security 도입 턴에 auth source of truth 변경 금지
- flyway 도입 턴에 production DDL 직접 변경 금지
- jpa 도입 턴에 여러 aggregate 동시 이전 금지

## 추천 실행 순서
1. **Bundle 1 — Security baseline**
2. **Bundle 2 — JDBC baseline**
3. **Bundle 3 — Flyway baseline**
4. **Bundle 4 — JPA baseline**
5. **Bundle 5 — Testcontainers baseline**
6. 그 다음에야 실제 기능 파일럿 도메인 이전 시작

## Summary
지금부터는 “기능 이전 전 setup lane”으로 간다.

즉 다음 실제 코드 턴은:
- `security`만
또는
- `jdbc`만
같이 **bundle 1개만** 다루는 것이 맞다.

현재 추천 첫 실행 bundle은 **Security baseline**이다.
