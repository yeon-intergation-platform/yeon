# web Drizzle/Flyway 소유권 제거

## 목표

Next.js web에서 DB schema/migration/runtime dependency 소유권을 제거하고 Spring Flyway를 DB schema SSOT로 만든다.

## 작업

- Spring Flyway에 legacy web public schema parity migration 추가
- web Drizzle config/schema/migration/scripts/deps 제거
- 배포 workflow의 web Drizzle migration 실행 제거
- web 컨테이너 DATABASE_URL 주입 제거

## 검증 결과

- PASS: Postgres 16 컨테이너에서 `V1`~`V8__ensure_legacy_web_public_schema.sql` 순차 적용 및 V8 재적용
- PASS: `pnpm --filter @yeon/web lint`
- PASS: `pnpm --filter @yeon/web typecheck`
- PASS: `pnpm --filter @yeon/web build`
- PASS: `timeout 240 ./gradlew test --tests world.yeon.backend.YeonBackendApplicationTests`
- PASS: active grep audit에서 web DB/Drizzle/pg runtime/script/package direct 참조 0개
- PASS: `git diff --check`
- PASS: `bash bin/sync-skills.sh --check`
- NOTE: `bash bin/verify-ssot.sh --project-only`는 git worktree의 `.git` 파일을 git 저장소가 아니라고 판정해 프로젝트 검사를 skip함
- STOPPED: 전체 `./gradlew test`는 약 15분 무출력으로 중단했고, 변경 검증은 Flyway raw apply + application context smoke로 대체함

## 완료 요약

- Next.js web의 Drizzle schema/migration/config/scripts/dependency를 제거했다.
- DB schema source of truth를 Spring Flyway로 고정하고 legacy public schema parity migration을 추가했다.
- 배포 workflow와 로컬 `dev:all`에서 web DB env 주입/Drizzle migration 경로를 제거했다.
