# useRecords server query boundary 분리

## 목표

- `useRecords`에서 서버 원본 query/polling/detail cache 책임을 분리한다.
- `useRecords`는 서버 hook 결과와 로컬 상태 병합 orchestration에 집중하게 한다.

## 계획

1. 서버 records query/prefetch/detail fetch/cache update 책임을 새 hook으로 추출한다.
2. `useRecords`가 새 hook을 사용하도록 wiring한다.
3. web typecheck/lint/build 및 SSOT 검증을 실행한다.

## 완료

- 서버 records query, polling interval, processing→ready prefetch, detail fetch/cache update를 `useCounselingRecordServerRecords` hook으로 분리했다.
- `useRecords`는 서버 hook 결과와 local override/temp state 병합 orchestration에 집중하도록 줄였다.
- `useRecords.ts`를 287줄에서 225줄로 축소했다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
