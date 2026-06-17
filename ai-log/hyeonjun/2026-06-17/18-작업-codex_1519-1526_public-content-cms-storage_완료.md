# 공개 콘텐츠 CMS 저장소 전환 준비

## 범위

- 공개 콘텐츠 DB 저장소를 준비하되 기본 운영은 seed store를 유지한다.
- `PUBLIC_CONTENT_STORE=jdbc` 설정에서만 Spring이 DB store를 사용하게 한다.
- admin 수정/삭제 UI와 상담 워크스페이스는 제외한다.

## 계획

1. Flyway migration 추가
2. store interface와 seed repository refactor
3. optional JDBC repository 추가
4. service/test 업데이트
5. backend 검증과 문서 검증

## 결과

- `public.public_content_articles` Flyway migration을 추가했다.
- 공개 읽기용 partial index와 admin 상태 조회용 index를 추가했다.
- `PublicContentArticleStore` interface와 `PublicContentArticleRecord`를 추가했다.
- 기존 seed repository는 기본 store로 유지했다.
- `PUBLIC_CONTENT_STORE=jdbc` 설정에서만 켜지는 JDBC store를 추가했다.
- public read JDBC query는 `published`, `public`, `noindex=false`, `published_at is not null` 조건만 노출한다.
- `PublicContentService`는 store interface에 의존하도록 바꿨다.

## 검증

- `./gradlew test --rerun-tasks --tests '*PublicContent*'`
- `git diff --check`
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`

## 제한

- Docker daemon이 꺼져 있어 Testcontainers 기반 전체 `YeonBackendApplicationTests`와 실제 Flyway 적용 검증은 로컬에서 실행하지 못했다.

## 참고

- `yeon-project-context` wrapper의 SSOT `.claude/skills/yeon-project-context.md`는 현재 파일이 없어 읽을 수 없었다.
- `docs/agent-rules/server-services.md`의 Spring/Flyway/JdbcTemplate 원칙을 적용한다.
