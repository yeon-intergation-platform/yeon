# backend jpa baseline

- 작업 목표: Bundle 4 jpa baseline 반영
- 작업 범위: data-jpa starter, dummy entity/repository, flyway migration 1개, repository smoke test
- 기준: 전용 schema 내에서만, 실제 업무 도메인 이전 금지
- 비목표: counseling/spaces/auth 도메인 이식

## 검증 메모

- 1차 실패 원인
  - `DATABASE_URL`를 그대로 backend env에 주입해서 `postgresql://...` 형식으로 전달됨
  - JDBC가 요구하는 `jdbc:postgresql://...` 형식이 아니어서 Flyway 초기화 실패
- 2차 실패 원인
  - JDBC URL 안에 인증정보까지 포함해서 드라이버가 username/host를 잘못 해석함
- 최종 정리
  - local web `.env`의 `DATABASE_URL`에서 host/db 와 username/password 를 분리 파싱
  - backend 검증용 env:
    - `BACKEND_JDBC_DATABASE_URL=jdbc:postgresql://<host>:<port>/<db>`
    - `BACKEND_JDBC_DATABASE_USERNAME=<parsed username>`
    - `BACKEND_JDBC_DATABASE_PASSWORD=<parsed password>`
- 최종 검증
  - `cd apps/backend && ./gradlew test`
  - 결과: `BUILD SUCCESSFUL`
