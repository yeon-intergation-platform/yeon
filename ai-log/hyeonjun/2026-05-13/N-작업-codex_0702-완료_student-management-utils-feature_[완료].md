# student management utils feature 이동

## 목표

- student-management app `_lib`에 남은 순수 policy/util을 feature lib로 이동한다.
- app route는 조립/라우팅 책임만 남기고 상태 규칙 SSOT는 feature가 갖게 한다.

## 변경

- `student-management-layout-ui-policy.ts` → `features/student-management/lib/`
- `space-sidebar-utils.ts` → `features/student-management/lib/`
- unit test도 feature lib 위치로 이동
- 기존 import 갱신

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
