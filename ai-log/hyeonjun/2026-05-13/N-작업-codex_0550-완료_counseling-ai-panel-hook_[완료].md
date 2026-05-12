# counseling AI panel hook 작업 로그

## 목표

- app `_hooks`에 남은 독립 UI 상태 hook인 `use-ai-panel`을 feature hook으로 이동한다.
- AI panel 관련 상수도 feature constants로 옮겨 app `_lib` 의존을 줄인다.

## 범위

- `features/counseling-record-workspace/constants/ai-panel.ts` 추가
- `features/counseling-record-workspace/hooks/use-ai-panel.ts` 추가
- app `_lib/constants.ts`, `_hooks/index.ts`, 테스트 import 호환 정리

## 검증 예정

- `pnpm --filter @yeon/web exec vitest run src/app/counseling-service/_hooks/__tests__/use-ai-panel.test.ts`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`

## 완료 내용

- AI panel 상수를 `features/counseling-record-workspace/constants/ai-panel.ts`로 이동했다.
- `useAiPanel`을 `features/counseling-record-workspace/hooks/use-ai-panel.ts`로 이동했다.
- app `_lib/constants.ts`와 `_hooks/index.ts`는 기존 import 호환을 위한 re-export만 유지한다.
- `use-ai-panel` 테스트 import를 feature hook 기준으로 변경했다.

## 검증 결과

- `pnpm --filter @yeon/web exec vitest run src/app/counseling-service/_hooks/__tests__/use-ai-panel.test.ts` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
