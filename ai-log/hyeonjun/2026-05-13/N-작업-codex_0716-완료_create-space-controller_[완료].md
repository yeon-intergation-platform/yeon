# create space modal controller hook 분리

## 목표

- `create-space-modal.tsx`의 step/form/template query/create mutation 상태를 feature hook으로 분리한다.
- app component는 modal 렌더링 중심으로 줄인다.

## 변경

- `use-create-space-modal-controller.ts` 추가
- `create-space-modal.tsx` state/query/create handler 제거 및 controller 사용
- `create-space-modal.tsx` 524줄에서 434줄로 축소

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
