# sidebar member list item component 추출

## 목표

- `sidebar.tsx`의 memoized `MemberListItem`을 feature component로 추출한다.
- selection/drag 로직은 유지하고 표시 컴포넌트만 분리한다.

## 범위

- MemberListItem component/types 이동
- sidebar import 조정
- 동작/API 변경 없음

## 완료 내용

- `MemberListItem` memoized presentational component와 actions contract를 `features/counseling-record-workspace/components/sidebar-member-list-item.tsx`로 추출했다.
- `sidebar.tsx`는 추출 컴포넌트를 import하도록 바꿨다.
- `sidebar.tsx` 줄 수를 1271줄에서 1094줄로 줄였다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
