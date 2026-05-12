# counseling records viewState selector 작업 로그

## 목표

- `use-records` 안의 viewState 계산을 feature hook으로 분리한다.
- god hook에서 화면 상태 전환 로직을 떼어내 후속 이동/테스트 단위를 작게 만든다.

## 범위

- `features/counseling-record-workspace/hooks/use-counseling-records-view-state.ts` 추가
- `app/counseling-service/_hooks/use-records.ts`에서 해당 hook 사용
- 기존 상태 전환 조건 유지

## 검증 예정

- `pnpm --filter @yeon/web exec vitest run src/app/counseling-service/_hooks/__tests__/use-records.test.ts`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`

## 완료 내용

- `useCounselingRecordsViewState`를 feature hook으로 추가했다.
- `use-records`의 loading/empty/recording/processing/ready 전환 계산을 해당 hook으로 위임했다.
- `use-records.ts`는 292줄에서 287줄로 줄었고 viewState 조건이 독립 테스트 가능한 단위가 됐다.

## 검증 결과

- `pnpm --filter @yeon/web exec vitest run src/app/counseling-service/_hooks/__tests__/use-records.test.ts` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
