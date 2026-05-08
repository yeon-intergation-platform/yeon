# Spring Backend Starter Adoption Plan

초기 bootstrap에서 의도적으로 제외한 starter / 기술 요소를 **언제, 왜, 어떤 순서로 추가할지** 고정하는 SSOT 문서다.

이 문서는 “지금 바로 넣지 않는 이유”와 “나중에 넣을 조건”을 함께 관리한다.

## 목적

- 첫 skeleton은 가볍게 유지하되, 빠진 요소를 임시 누락 상태로 방치하지 않는다.
- excluded starter마다 **도입 차수 / 선행 조건 / 검증 기준 / stop rule**을 미리 적어둔다.
- 추후 기능 이전 시 “그때그때 즉흥적으로 dependency를 붙이는 일”을 줄인다.

## 현재 상태

초기 `apps/backend` skeleton 기본선은 아래만 포함한다.

- `web`
- `actuator`
- `validation`

아래 항목은 첫 bootstrap에서 제외했다.

- `security`
- `data-jpa` / `jdbc`
- `flyway` / `liquibase`
- `lombok`
- `testcontainers`
- `devtools`

## 도입 원칙

1. **기동 확인 전에는 기능성 starter를 넣지 않는다.**
2. **한 번에 하나의 관심사만 추가한다.**
3. **각 starter는 도입 이유가 실제 도메인 요구와 연결될 때만 넣는다.**
4. **starter 추가 턴마다 별도 검증 증거를 남긴다.**
5. **보안/DB/migration/test 지원은 서로 얽히므로 순서를 강제한다.**

## 권장 도입 순서

1. `devtools` (선택)
2. `security`
3. `jdbc`
4. `data-jpa`
5. `flyway` 또는 `liquibase` 중 1개
6. `testcontainers`
7. `lombok` (정말 필요할 때만)

## 1. DevTools

### 목적
- 로컬 bootstrap 반복 속도 향상

### 도입 시점
- backend skeleton이 이미 안정적으로 기동한 뒤
- hot reload 필요성이 실제로 생긴 뒤

### 선행 조건
- `apps/backend`가 최소 2~3회 이상 재기동되는 개발 루프가 확인될 것

### 검증
- 로컬 재시작 시간이 체감상 유의미하게 줄어드는지
- packaging / production 실행에 영향이 없는지

### stop rule
- reload 이점이 작거나 설정 복잡도가 커지면 넣지 않는다.

## 2. Spring Security

### 목적
- 인증 source of truth 이전 준비
- endpoint 접근 정책 기본선 확립

### 도입 시점
- health endpoint 외에 보호해야 할 API가 생길 때
- Next ↔ Spring 최소 smoke를 넘고 실제 auth migration 논의가 시작될 때

### 선행 조건
- public endpoint와 protected endpoint 경계 문서화
- 인증 이전 전략 초안 존재
- 현재 Next 세션 흐름과 충돌 포인트 정리

### 검증
- health/public endpoint는 의도대로 열려 있는지
- protected endpoint는 인증 없이 차단되는지
- Next 기존 인증 흐름을 깨지 않는지

### stop rule
- “로그인도 같이 하자”가 붙는 순간 범위가 커지므로 그 턴은 중단한다.

## 3. JDBC API

### 목적
- 가장 얇은 SQL 연결 기반 확보
- DB 연결/헬스/트랜잭션 경계의 최소 단위 확인

### 도입 시점
- DB 연결 smoke가 필요할 때
- JPA 도입 전에 연결/설정/커넥션 문제를 분리하고 싶을 때

### 선행 조건
- 데이터 소스 정보 정리
- 로컬/개발 DB 접속 전략 정리
- 비밀값 주입 방식 정리

### 검증
- 앱 기동 성공
- datasource 초기화 성공
- 간단한 connection 검증 또는 DB health 확인

### stop rule
- 도메인 매핑까지 한 턴에 끌고 가려 하면 중단한다.

## 4. Spring Data JPA

### 목적
- 영속성 계층 표준화
- repository 기반 도메인 이전 시작점 확보

### 도입 시점
- JDBC 연결이 안정적이고
- 실제 첫 파일럿 도메인을 Spring으로 옮길 때

### 선행 조건
- 첫 파일럿 aggregate / entity 후보 선정
- package 구조 초안 존재
- repository / service 경계 초안 존재

### 검증
- entity scan / repository scan 정상 동작
- 간단한 repository smoke test 통과
- 스키마 ownership 경계가 깨지지 않는지

### stop rule
- 첫 도입 턴에서 여러 도메인 entity를 같이 넣으려 하면 중단한다.

## 5. Flyway / Liquibase

### 결정 원칙
- 둘 중 **하나만** 채택한다.
- 첫 migration tool 채택 전 비교 문서를 만든다.

### 목적
- schema 변경 이력 관리
- DB ownership을 Next 쪽 Drizzle 기반과 분리/전환하기 위한 통로 확보

### 도입 시점
- Spring이 직접 소유하는 첫 schema change가 생길 때

### 선행 조건
- 현재 DB ownership 문서화
- migration 충돌 전략 정리
- rollback 정책 정리

### 검증
- 빈 migration 적용 성공
- 로컬/개발 환경 drift 없이 반복 실행 가능

### stop rule
- Drizzle과 Spring migration을 같은 테이블에 동시에 강하게 쓰게 되면 중단 후 ownership 재정리

## 6. Testcontainers

### 목적
- DB/infra 연동 테스트 신뢰도 향상

### 도입 시점
- JPA 또는 migration tool이 이미 붙은 뒤
- 단순 unit test를 넘어 integration test가 필요한 시점

### 선행 조건
- 테스트 전략 문서 존재
- CI 환경에서 container 실행 가능 여부 확인

### 검증
- 로컬 integration test 안정 수행
- CI에서 flaky하지 않음

### stop rule
- 아직 app 자체도 안 뜨는 단계라면 절대 넣지 않는다.

## 7. Lombok

### 기본 입장
- **기본 비추천**

### 목적
- boilerplate 감소

### 도입 시점
- 팀이 명시적으로 원하고
- 코드 스타일/IDE/annotation 처리 기준이 합의됐을 때만

### 선행 조건
- “record / explicit constructor / IDE generation” 대안 검토 완료

### 검증
- IDE/빌드 환경 불일치 없음
- annotation processor 관련 문제 없음

### stop rule
- 팀 합의가 없으면 넣지 않는다.

## Starter별 차수 매핑

### 차수 A — bootstrap 안정화
- `devtools` (선택)

### 차수 B — auth/public boundary
- `security`

### 차수 C — DB 연결 기초
- `jdbc`

### 차수 D — 영속성 시작
- `data-jpa`

### 차수 E — schema ownership
- `flyway` 또는 `liquibase`

### 차수 F — 통합 테스트 강화
- `testcontainers`

### 차수 G — 생산성 보조(선택)
- `lombok`

## 한 턴 작업량 제한

한 프롬프트에서 허용하는 최대 범위는 아래 중 하나다.

- starter 1개만 추가
- migration tool 비교 문서 1개만 작성
- 테스트 전략 문서 1개만 작성

두 개 이상을 동시에 섞지 않는다.

## Summary

초기 제외 항목은 “안 쓴다”가 아니라 “순서를 통제해서 나중에 넣는다”가 맞다.

현재 Yeon Spring backend starter 추가 계획은:

- 먼저 skeleton 안정화
- 그 다음 security
- 그 다음 jdbc
- 그 다음 jpa
- 그 다음 migration tool 1개
- 그 다음 testcontainers
- lombok은 끝까지 선택 항목

즉, 다음 dependency 추가 턴에서도 **한 번에 하나씩**만 넣어야 한다.
