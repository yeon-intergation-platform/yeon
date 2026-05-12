# counseling sidebar selection hook 추출

## 목표

- 상담 워크스페이스 app sidebar의 multi-select/context menu/delete 상태머신을 feature hook으로 이동한다.
- app component는 렌더링 조립과 route action wiring만 담당하게 줄인다.

## 계획

1. 기존 sidebar의 selection/context menu 상태와 helper function 책임을 식별한다.
2. `features/counseling-record-workspace/hooks/use-counseling-sidebar-selection.ts`를 만든다.
3. app sidebar가 hook 반환값을 wiring하도록 정리한다.
4. web typecheck/lint/build 및 SSOT 검증을 실행한다.

## 완료

- 상담 워크스페이스 sidebar의 multi-select, shift/drag selection, context menu, delete confirmation 상태머신을 `useCounselingSidebarSelection` hook으로 이동했다.
- app sidebar는 렌더링 조립과 route action wiring에 집중하도록 줄였다.
- `sidebar.tsx`를 887줄에서 511줄로 축소했다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
