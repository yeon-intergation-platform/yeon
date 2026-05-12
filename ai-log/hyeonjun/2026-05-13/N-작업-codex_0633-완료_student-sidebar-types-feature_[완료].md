# student management sidebar type feature 이동

## 목표

- student-management app `_lib`에 남은 sidebar 상태 타입을 feature layer로 이동한다.
- app 하위 컴포넌트/훅은 feature type SSOT를 참조하게 한다.

## 검증 계획

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`

## 완료 내용

- student-management sidebar 상태 타입을 `features/student-management/types/space-sidebar-types.ts`로 이동했다.
- app 하위 sidebar component/hook/utils import를 feature type SSOT로 전환했다.
- app `_lib/space-sidebar-types.ts` 파일을 제거했다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
