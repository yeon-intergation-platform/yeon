# sidebar space selector 추출 작업 로그

## 목표

- `sidebar.tsx`의 스페이스 선택 버튼/드롭다운/새 스페이스 CTA를 feature component로 추출한다.
- selection/context menu/state machine 동작은 유지한다.

## 범위

- `apps/web/src/app/counseling-service/_components/sidebar.tsx`
- `apps/web/src/features/counseling-record-workspace/components/sidebar-space-selector.tsx`
- `docs/product/backlog/frontend-structure-standardization-20260512.md`

## 진행

- 백로그 49차 작성.

## 완료 내용

- 스페이스 선택 버튼/드롭다운/새 스페이스 CTA 렌더링을 `SidebarSpaceSelector` feature component로 추출했다.
- sidebar는 click-outside ref, selection/context menu 상태, action handler를 props로 연결하는 역할만 유지한다.
- 스페이스 선택, multi-select, context menu, 새 스페이스 모달 열기 동작은 변경하지 않았다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
