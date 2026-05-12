# sidebar members section 추출 작업 로그

## 목표

- `sidebar.tsx`의 수강생 섹션 JSX를 feature component로 추출한다.
- `MemberListItem` memo comparator가 중간 record 변경을 놓치지 않도록 record signature를 명시한다.

## 범위

- `apps/web/src/app/counseling-service/_components/sidebar.tsx`
- `apps/web/src/features/counseling-record-workspace/components/sidebar-members-section.tsx`
- `apps/web/src/features/counseling-record-workspace/components/sidebar-member-list-item.tsx`
- `docs/product/backlog/frontend-structure-standardization-20260512.md`

## 진행

- 백로그 48차 작성.

## 완료 내용

- 수강생 섹션 제목/카운트/빈 상태/목록 렌더링을 `SidebarMembersSection` feature component로 추출했다.
- `sidebar.tsx`는 members, selection state, memoized actions를 props로 넘기는 조립 역할만 유지한다.
- `MemberListItem` memo comparator가 중간 상담 기록 변경을 놓치지 않도록 `memberRecordsSignature`를 비교 기준으로 추가했다.
- selection/drag/context menu action 로직은 변경하지 않았다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
