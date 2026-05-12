# counseling records local state hook 작업 로그

## 목표

- `use-records`의 local override/temp record 조작 책임을 feature hook으로 분리한다.
- 서버 query/viewState 조립과 로컬 패치 상태 소유를 분리한다.

## 범위

- `features/counseling-record-workspace/hooks/use-counseling-record-local-state.ts` 추가
- `app/counseling-service/_hooks/use-records.ts`에서 해당 hook 사용
- 기존 API/query key/polling 동작 유지

## 검증 예정

- `pnpm --filter @yeon/web exec vitest run src/app/counseling-service/_hooks/__tests__/use-records.test.ts`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`

## 완료 내용

- `useCounselingRecordLocalState`를 feature hook으로 추가했다.
- `use-records`에서 `localOverrides`/`tempRecords` 직접 조작 로직을 제거하고 전용 hook에 위임했다.
- `use-records.ts`는 386줄에서 292줄로 줄었다.

## 검증 결과

- `pnpm --filter @yeon/web exec vitest run src/app/counseling-service/_hooks/__tests__/use-records.test.ts` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
