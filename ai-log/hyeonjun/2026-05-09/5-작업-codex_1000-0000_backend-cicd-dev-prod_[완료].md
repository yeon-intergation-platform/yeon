# 5차 작업 — backend ci/cd dev prod

- 시작: 2026-05-09 10:00 KST
- 종료: 2026-05-09 10:05 KST
- 상태: 완료
- 목표: `develop -> dev 서버`, `main -> 운영 서버` 자동 배포선에 Spring Boot backend를 추가한다.
- 포함 범위:
  1. backend Dockerfile 추가
  2. compose.dev.yml / compose.prod.yml backend 서비스 추가
  3. GitHub Actions workflow에 backend build/publish/deploy 추가
  4. 관련 문서 drift 최소 정리
- 사용자 결정:
  - branch 정책: develop=dev 서버, main=운영 서버
  - Java/Spring 방향: Boot 4 유지, Java 21 LTS 우선
- 수행 내용:
  - `apps/backend/build.gradle` toolchain을 Java 21로 조정
  - `apps/backend/Dockerfile` 추가 (Temurin 21 multi-stage, bootJar 빌드 + JRE runtime)
  - `compose.dev.yml`, `compose.prod.yml`에 backend 서비스/healthcheck/internal token/base URL 연결 추가
  - `.github/workflows/docker-image.yml`에 develop trigger, backend amd64/arm64 build, backend manifest publish, dev/prod deploy 분기 추가
  - 배포 문서와 root `.env.example`를 backend 기준으로 보강
- 검증:
  - `git diff --check` ✅
  - `docker compose -f compose.dev.yml config` ✅
  - `docker compose -f compose.prod.yml config` ✅
  - `ruby -e 'require "yaml"; YAML.load_file(".github/workflows/docker-image.yml")'` ✅
  - `docker build -f apps/backend/Dockerfile . -t yeon-backend-local:test` ✅
  - `./apps/backend/gradlew -p apps/backend test` ⚠️ 기존 test import 오류로 실패 (`org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest` 패키지 해석 실패)
- 메모:
  - `scripts/dev-all.mjs`와 별도 ai-log 파일은 동시 작업 흔적이 있어 이번 CI/CD staging 범위에서 제외하는 편이 안전하다.
