# link member modal controller hook 분리

## 목표

- `link-member-modal.tsx`의 query/state/mutation 소유권을 feature hook으로 이동한다.
- app component는 렌더링 중심으로 줄인다.

## 변경

- `use-link-member-modal-controller.ts` 추가
- `link-member-modal.tsx` state/query/mutation handler 제거 및 controller 사용
- `link-member-modal.tsx` 391줄에서 268줄로 축소

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
