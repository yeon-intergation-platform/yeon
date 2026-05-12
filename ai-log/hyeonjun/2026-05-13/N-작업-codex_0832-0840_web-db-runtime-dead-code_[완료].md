# web DB runtime dead code 제거

## 목표
- app runtime에서 더 이상 쓰지 않는 Drizzle 기반 web server service/repository/test dead code 제거.
- Next.js runtime이 `@/server/db`를 참조하지 않는 상태를 검증.

## 검증 예정
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web build`
- runtime grep audit
- `git diff --check`

## 완료
- `apps/web/src/server/services`의 Drizzle 기반 legacy service/test 파일과 `apps/web/src/server/repositories`를 제거했다.
- `apps/web/src/server/db/**`는 Flyway parity 대조 자료로 보류했다.

## 검증
- `git grep "@/server/db\|drizzle-orm\|from ['\"]pg['\"]" -- apps/web/src ':!apps/web/src/server/db/**'` 결과 0개
- `git grep "@/server/db\|@/server/repositories/\|@/server/services/" -- 'apps/web/src/app/**' | grep -v ...` 결과 0개
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`
