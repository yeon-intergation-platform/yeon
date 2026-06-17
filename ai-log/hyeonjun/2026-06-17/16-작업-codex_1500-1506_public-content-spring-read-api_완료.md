# 공개 콘텐츠 Spring 읽기 API

## 범위

- 500단계 계획 6차의 Spring public read API를 진행했다.
- `/api/v1/content`, `/api/v1/content/{channel}/{slug}`, `/api/v1/content/{channel}/sitemap` 공개 조회를 추가했다.
- 정적 resource seed repository를 사용했고 DB/CMS 쓰기는 다음 배치로 둔다.
- 공개 응답에서는 로컬 source path를 노출하지 않도록 계약과 Spring 응답을 정리했다.
- 상담관리/상담 워크스페이스는 제외했다.

## 결과

- Spring `public_content` controller/service/repository/dto 계층을 추가했다.
- 웹 static registry에서 33개 글을 resource seed JSON으로 생성했다.
- public content 조회 경로만 SecurityConfig `permitAll`에 추가했다.
- API contract에서 public detail의 `sourcePaths`를 제거하고 admin DTO에만 유지했다.
- CTA href는 절대 URL과 root-relative path를 모두 허용하게 했다.

## 검증

- `./gradlew test --tests '*PublicContent*'`
- `pnpm --filter @yeon/api-contract test`
- `pnpm --filter @yeon/api-contract lint`
- `pnpm --filter @yeon/api-client lint`
- `pnpm --filter @yeon/api-contract typecheck`
- `pnpm --filter @yeon/api-client typecheck`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/mobile typecheck`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`

## 제한

- 기존 `SecurityConfigTests`와 전체 앱 context smoke는 Testcontainers/Postgres가 필요하다.
- 현재 로컬 Docker daemon이 꺼져 있어 `docker ps`가 `Cannot connect to the Docker daemon`으로 실패했다.
- 대신 공개 콘텐츠 controller test에서 내부 토큰 없이 `/api/v1/content` 200 응답을 확인했고, 도메인 Spring context smoke는 DB 없는 bean graph로 검증했다.

## 남은 작업

- 다음 배치에서 Next BFF/API client 소비를 이 Spring read API로 연결한다.
- 이후 DB/CMS migration과 admin mutation API를 별도 배치로 진행한다.
