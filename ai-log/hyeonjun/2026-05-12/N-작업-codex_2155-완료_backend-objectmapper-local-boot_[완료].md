# backend-objectmapper-local-boot

- 시작: 2026-05-12 21:55 KST
- 증상: local `backend:bootRun`에서 `LocalImportAnalysisRepository` 생성자 parameter 1 `com.fasterxml.jackson.databind.ObjectMapper` 빈을 찾지 못해 ApplicationContext 부팅 실패
- 원인: Spring Boot 4 webmvc starter는 Jackson 3(`tools.jackson`) 자동 구성 중심인데, 기존 backend 코드가 Jackson 2(`com.fasterxml`) ObjectMapper를 생성자 주입받음
- 계획: Jackson 2 ObjectMapper 빈을 명시 등록하고 local-import-analysis 테스트/bootRun으로 검증

## 구현 결과

- `world.yeon.backend.config.LegacyJacksonConfig`를 추가해 기존 Spring 코드가 주입받는 `com.fasterxml.jackson.databind.ObjectMapper` 빈을 명시 등록했다.
- Boot 4/Jackson 3 자동 구성과 기존 Jackson 2 사용처의 타입 불일치로 인한 ApplicationContext 부팅 실패를 최소 패치로 복구했다.

## 검증

- PASS `./gradlew test --tests 'world.yeon.backend.local_import_analysis.controller.LocalImportAnalysisControllerTests'`
- PASS `./gradlew test --tests 'world.yeon.backend.YeonBackendApplicationTests'`
- CHECK `timeout 25s ./gradlew bootRun`: ObjectMapper 오류는 사라졌고, 현재 shell에는 DB env가 없어 다음 단계인 DB URL 누락에서 멈춤

## 추가 반영: DATABASE_URL 단일화

- 사용자 지시에 따라 backend datasource env를 `DATABASE_URL` 하나로 단일화했다.
- `JdbcProfileConfig`에서 backend 전용 env fallback을 제거했다.
- `dev-all`, docker compose backend env, Testcontainers 테스트 등록 값을 `DATABASE_URL` 기준으로 맞췄다.
- 실행 중이던 `pnpm dev:all` 세션은 이전 env로 떠 있으므로, 코드 변경 뒤 DevTools 재시작 시 `DATABASE_URL`이 없으면 실패한다. 새 `pnpm dev:all` 세션을 띄우면 root/apps web env에서 `DATABASE_URL`을 주입한다.

## 추가 검증

- PASS `./gradlew test --tests 'world.yeon.backend.local_import_analysis.controller.LocalImportAnalysisControllerTests' --tests 'world.yeon.backend.YeonBackendApplicationTests' --tests 'world.yeon.backend.bootstrap.jpa.BootstrapHeartbeatRepositoryTests'`
- PASS `git diff --check`
- PASS `bash bin/sync-skills.sh --check`
- PASS `bash bin/verify-ssot.sh --project-only`
