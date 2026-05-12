# counseling sidebar 액션 조립 hook 분리

## 목표

- `sidebar.tsx`에서 member item action ref 조립과 context menu action 배열 생성을 feature hook으로 분리한다.
- app component는 route/modal/render 조립 중심으로 줄인다.

## 변경

- `use-counseling-sidebar-member-item-actions.ts` 추가
- `use-counseling-sidebar-context-menu-actions.ts` 추가
- `sidebar.tsx` import/호출부 정리
- `sidebar.tsx` 511줄에서 357줄로 축소

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
