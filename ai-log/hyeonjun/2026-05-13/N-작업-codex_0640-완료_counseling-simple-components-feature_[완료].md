# counseling 단순 표시 컴포넌트 feature 이동

## 목표

- app `_components`에 남은 단순 표시 컴포넌트 일부를 counseling-record-workspace feature로 이동한다.
- 기존 page 조립 import는 유지하고 동작은 변경하지 않는다.

## 검증 계획

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`

## 완료 내용

- `EmptyState`, `InsightBanner`를 `features/counseling-record-workspace/components`로 이동했다.
- `EmptyState`는 app icon shim 대신 `counseling-service-shell/icons`를 직접 참조한다.
- `InsightBanner`는 app hook index 대신 feature hook/type을 직접 참조한다.
- app `_components/index.ts`는 기존 page 조립 import를 깨지 않도록 feature component를 재수출한다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
