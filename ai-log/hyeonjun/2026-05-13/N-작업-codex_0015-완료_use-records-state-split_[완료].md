# use-records 상태 변환 분리 작업 로그

## 목표

- `apps/web/src/app/counseling-service/_hooks/use-records.ts`의 순수 변환/폴링 판단 로직을 분리한다.
- 서버 원본 DTO → 화면 RecordItem 변환, 상세 patch 변환, 병합 로직을 테스트 가능한 단위로 빼서 hook의 책임을 orchestration 중심으로 줄인다.
- UI 구조 변경 없이 5차 대형 hook 분해의 첫 PR로 제한한다.

## 작업 범위

- `apps/web/src/app/counseling-service/_hooks/use-records.ts`
- `apps/web/src/app/counseling-service/_hooks/use-merged-records.ts`
- `apps/web/src/app/counseling-service/_lib/record-state-adapters.ts`

## 검증 결과

- `wc -l apps/web/src/app/counseling-service/_hooks/use-records.ts` 확인: 537줄에서 407줄로 감소.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web build` 통과.
- `git diff --check` 통과.
- `bash bin/sync-skills.sh --check` 통과.
- `bash bin/verify-ssot.sh --project-only` 통과. worktree `.git` 파일 제약 때문에 프로젝트 SSOT 검사는 원본 worktree에서 확인했다.

## 진행 상태

- 완료.
