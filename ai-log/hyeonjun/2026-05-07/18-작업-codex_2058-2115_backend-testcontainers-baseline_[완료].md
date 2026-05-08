# backend testcontainers baseline

- 작업 목표: Bundle 5 testcontainers baseline 반영
- 작업 범위: postgres container 기반 repository smoke, local DB env 의존 제거, 관련 SSOT 문서 추가
- 기준: 기존 jdbc/flyway/jpa 경계 유지, 실제 업무 도메인 추가 금지
- 비목표: CI workflow 변경, production runtime 컨테이너화, feature migration

## 검증 메모

- Docker daemon local 사용 가능 확인
- 초기 실패 원인
  - Testcontainers artifact 좌표를 `org.testcontainers:junit-jupiter`, `org.testcontainers:postgresql`로 넣었더니
    Spring Boot 4.0.6 관리 좌표와 맞지 않아 resolve 실패
- 최종 수정
  - `org.testcontainers:testcontainers-junit-jupiter`
  - `org.testcontainers:testcontainers-postgresql`
- 최종 검증
  - `cd apps/backend && ./gradlew test`
  - 결과: `BUILD SUCCESSFUL`
  - 로컬 DB env 없이 JPA repository smoke 통과
