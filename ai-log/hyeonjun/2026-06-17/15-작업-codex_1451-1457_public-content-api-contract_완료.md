# 공개 콘텐츠 API 계약

## 범위

- 500단계 계획 5차의 API 계약과 클라이언트 경계를 진행했다.
- `packages/api-contract`에 공개 콘텐츠 DTO/request/response schema를 추가했다.
- `packages/api-client`에 `/api/v1/content`, `/api/v1/admin/content` typed method를 추가했다.
- Spring controller/repository 구현은 다음 배치로 둔다.
- 상담관리/상담 워크스페이스는 제외했다.

## 결과

- channel은 `support`, `news`, `blog`로 고정했다.
- service key는 `nexa`, `typing`, `card`, `community`, `account`, `yeon`으로 고정했다.
- support/news/blog의 category, status, visibility, sitemap DTO를 계약으로 만들었다.
- create 요청은 draft/public 기본값을 갖고, update 요청은 실제 변경 필드가 없으면 거절한다.
- slug schema를 export하고 API client detail 조회에서도 같은 schema를 사용한다.

## 검증

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

## 남은 작업

- 다음 배치에서 Spring 공개 콘텐츠 controller/service/repository를 구현한다.
- 이후 admin 읽기/검수 화면은 이 typed client로 연결한다.
