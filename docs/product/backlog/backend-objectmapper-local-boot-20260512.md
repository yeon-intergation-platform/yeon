# Spring 로컬 부팅 ObjectMapper 빈 누락 복구

## 1차수

### 작업내용

- 로컬 `dev:all`/`backend bootRun`에서 `LocalImportAnalysisRepository`가 `com.fasterxml.jackson.databind.ObjectMapper` 빈을 찾지 못해 Spring 컨텍스트가 종료되는 문제를 복구한다.
- Spring Boot 4의 Jackson 3 자동 구성(`tools.jackson`)과 기존 마이그레이션 코드의 Jackson 2(`com.fasterxml`) 주입 타입 불일치를 최소 패치로 보정한다.
- 기존 `local_import_analysis` 서비스/레포지터리의 생성자 주입 구조는 유지하고, 앱 전역에서 Jackson 2 `ObjectMapper` 빈을 명시 등록한다.

### 논의 필요

- 장기적으로 backend 전체 JSON 처리 타입을 Jackson 3 `tools.jackson`으로 일괄 마이그레이션할지, 현재처럼 Jackson 2를 명시 유지할지 별도 결정이 필요하다.

### 선택지

- 옵션 A: 모든 `com.fasterxml.jackson.databind.ObjectMapper` 사용처를 Jackson 3 타입으로 한 번에 전환한다.
- 옵션 B: Jackson 2 `ObjectMapper` 빈을 명시 등록해 현재 부팅 실패만 복구한다.
- 옵션 C: `LocalImportAnalysisRepository`만 `new ObjectMapper()` 필드로 바꾼다.

### 추천

- 옵션 B. 현재 장애는 로컬 backend 부팅 차단이므로 전역 빈을 추가해 생성자 주입 계약을 유지하는 것이 가장 작고 안전하다.

### 사용자 방향

- 추천 기준으로 즉시 진행한다.

## 검증 계획

- `./gradlew test --tests 'world.yeon.backend.local_import_analysis.controller.LocalImportAnalysisControllerTests'`
- `./gradlew bootRun` 또는 짧은 timeout 부팅 로그에서 Tomcat started 확인
- `git diff --check`

## 2차수

### 작업내용

- backend datasource 환경변수는 `DATABASE_URL` 하나만 source of truth로 사용한다.
- `BACKEND_DATABASE_URL`, `BACKEND_JDBC_DATABASE_URL`, `BACKEND_JDBC_DATABASE_USERNAME`, `BACKEND_JDBC_DATABASE_PASSWORD` fallback을 제거한다.
- `dev-all`은 로컬 `.env`/`.env.local`의 `DATABASE_URL`을 그대로 backend/web에 전달한다.
- compose backend도 `DATABASE_URL`만 주입한다.
- Testcontainers 기반 Spring 테스트도 `DATABASE_URL` 하나만 등록하도록 맞춘다.

### 논의 필요

- 없음. 사용자가 `DATABASE_URL` 단일화를 지시했다.

### 선택지

- 옵션 A: backend 전용 env fallback 유지
- 옵션 B: `DATABASE_URL`만 유지

### 추천

- 옵션 B. DB 연결 source of truth가 하나라 로컬/운영/테스트가 같은 규칙을 쓴다.

### 사용자 방향

- `DATABASE_URL`만 남긴다.
