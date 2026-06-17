# 공개 콘텐츠 Next BFF 연결

## 범위

- Spring 공개 콘텐츠 읽기 API를 Next `/api/v1/content` 경로로 연결한다.
- `@yeon/api-client`가 이미 사용하는 public content path를 실제 Next route로 제공한다.
- 공개 조회 route는 로그인으로 튕기지 않게 유지한다.
- 상담 워크스페이스와 admin 본문 수정/삭제는 제외한다.

## 진행 계획

1. Spring client와 공개 route handler 추가
2. 계약 스키마 기반 query/path/response 검증
3. route/client 테스트 추가
4. lint, typecheck, build, 문서 검증

## 결과

- `/api/v1/content` 목록 조회를 Spring public read API로 연결했다.
- `/api/v1/content/[channel]/[...slug]` 상세 조회를 Spring public read API로 연결했다.
- `/api/v1/content/[channel]/sitemap` 조회를 Spring public read API로 연결했다.
- 공개 콘텐츠 Spring client는 내부 토큰을 보내지 않고 `accept: application/json`만 보낸다.
- 공개 route는 로그인 세션 가드 없이 query/path 계약 검증과 Spring 응답 매핑만 수행한다.

## 검증

- `pnpm --dir apps/web exec vitest run src/server/__tests__/public-content-spring-client.test.ts src/app/api/v1/content/__tests__/route.test.ts 'src/app/api/v1/content/[channel]/sitemap/__tests__/route.test.ts' 'src/app/api/v1/content/[channel]/[...slug]/__tests__/route.test.ts'`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`

## 제한

- `pnpm --filter @yeon/web test -- ...`는 인자 전달 방식 때문에 전체 web 테스트가 실행되었고, 기존 `cloud-import` localStorage 테스트 3개에서 실패했다.
- 신규 테스트만 `pnpm --dir apps/web exec vitest run ...`으로 분리해 통과를 확인했다.

## 참고

- `nextjs-patterns` wrapper의 SSOT `.claude/commands/nextjs-patterns.md`는 현재 파일이 없어 읽을 수 없었다.
- 대신 `docs/agent-rules/server-services.md`의 Route Handler 원칙을 적용한다.
