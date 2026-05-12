# Link member modal feature 이동

## 작업

- `LinkMemberModal` component 파일을 app `_components`에서 counseling record workspace feature component로 이동했다.
- app `_components/index.ts`는 기존 page import 안정성을 위해 feature component를 re-export하도록 바꿨다.
- 연결/해제/신규 등록 controller hook과 UI 동작은 변경하지 않았다.

## 검증 예정

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`
