# Spring Backend Flyway Baseline

`apps/backend`의 Flyway baseline은 **서비스 실행 profile(dev.local/staging/prod) 공통 활성** 원칙을 따른다.

## 목적

- Spring backend가 직접 소유할 migration 경로를 먼저 확보한다.
- 아직 업무 테이블을 건드리지 않고도 migration lifecycle 자체를 검증한다.
- Drizzle ownership과 충돌하기 전에 “Spring 쪽 migration lane”만 준비한다.

## 현재 선택

- dependency: `org.flywaydb:flyway-core`
- 활성화 방식:
  - `application.yml`: 공통 활성
  - `dev.local`: 로컬 개발
  - `staging`: 스테이징 서버
  - `prod`: 운영 서버
- migration 위치:
  - `classpath:db/migration`
- 첫 migration:
  - `V1__bootstrap_placeholder.sql`

## 왜 placeholder migration을 쓰나

- 지금 단계에서 중요한 건 실제 업무 DDL이 아니라 **migration이 안전하게 돈다는 증거**다.
- `flyway_schema_history` 생성과 version tracking이 먼저 검증되어야 한다.
- Next/Drizzle ownership을 침범하지 않기 위해 no-op 성격 migration으로 시작한다.

## 현재 규칙

- Spring backend migration 파일은 `apps/backend/src/main/resources/db/migration` 아래에 둔다.
- 버전 형식은 `V{number}__{description}.sql`을 쓴다.
- 실제 업무 테이블 변경은 ownership 문서와 파일럿 도메인 선정 후에만 시작한다.

## Local schema isolation

- 로컬/초기 단계에서는 Flyway 기본 스키마를 `yeon_backend`로 분리한다.
- 이유: 기존 Next/Drizzle 쪽 `public` 스키마가 이미 비어 있지 않아 baseline 충돌이 발생할 수 있기 때문이다.
- 따라서 Flyway history table도 `yeon_backend.flyway_schema_history`에 생성되는 것을 기본으로 본다.
