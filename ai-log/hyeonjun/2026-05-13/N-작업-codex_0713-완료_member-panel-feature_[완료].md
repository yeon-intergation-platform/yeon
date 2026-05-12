# Member panel feature 이동

## 작업

- `MemberPanel` component 파일을 app `_components`에서 counseling record workspace feature component로 이동했다.
- `MemberWithStatus` 타입 import를 app hook bridge가 아니라 feature hook 원본으로 바꿨다.
- app `_components/index.ts`는 기존 page import 안정성을 위해 feature component re-export로 유지했다.

## 검증 예정

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`
