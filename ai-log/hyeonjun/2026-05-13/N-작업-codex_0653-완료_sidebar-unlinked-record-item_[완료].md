# sidebar unlinked record item component 추출

## 목표

- `sidebar.tsx`의 미분류 record button 렌더링을 feature component로 추출한다.

## 범위

- UnlinkedRecordListItem component 추가
- sidebar JSX 치환
- selection/drag/context menu 로직 변경 없음

## 완료 내용

- 미분류 record button 렌더링을 `UnlinkedRecordListItem` feature component로 추출했다.
- sidebar는 selection/drag/context menu 핸들러 연결만 유지한다.
- `sidebar.tsx` 줄 수를 1094줄에서 1080줄로 줄였다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
