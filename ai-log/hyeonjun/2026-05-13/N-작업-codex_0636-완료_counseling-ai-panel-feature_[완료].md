# counseling AI panel feature component 이동

## 목표

- app `_components`에 남아 있는 AI 패널 대형 컴포넌트를 counseling-record-workspace feature로 이동한다.
- 동작/props/API는 유지하고 소유 경계만 정리한다.

## 검증 계획

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`

## 완료 내용

- `AiPanel` component를 app `_components`에서 `features/counseling-record-workspace/components/ai-panel.tsx`로 이동했다.
- icon import는 app shim 대신 `features/counseling-service-shell/icons`를 직접 참조하도록 변경했다.
- app `_components/index.ts`는 기존 page 조립 import를 깨지 않도록 feature component를 재수출한다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
