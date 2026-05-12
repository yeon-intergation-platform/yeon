# sidebar context menu 추출 작업 로그

## 목표

- `sidebar.tsx`의 context menu 렌더링을 feature component로 추출한다.
- context action 생성/실행 동작은 유지한다.

## 범위

- `apps/web/src/app/counseling-service/_components/sidebar.tsx`
- `apps/web/src/features/counseling-record-workspace/components/sidebar-context-menu.tsx`
- `docs/product/backlog/frontend-structure-standardization-20260512.md`

## 진행

- 백로그 50차 작성.

## 완료 내용

- context menu DOM 렌더링과 action icon 표시를 `SidebarContextMenu` feature component로 추출했다.
- sidebar는 context action 목록 생성, 삭제 진행 상태, click-outside ref 연결만 유지한다.
- context menu action 실행, 삭제 disabled 표시, 위치 계산 동작은 변경하지 않았다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
