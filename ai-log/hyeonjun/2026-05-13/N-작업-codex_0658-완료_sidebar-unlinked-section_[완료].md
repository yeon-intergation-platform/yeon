# sidebar unlinked records section component 추출

## 목표

- `sidebar.tsx`의 미분류 상담 기록 섹션 전체를 feature component로 추출한다.
- sidebar는 상태/핸들러 조립만 남긴다.

## 범위

- UnlinkedRecordsSection component 추가
- sidebar JSX 치환
- selection/drag/context menu 로직 변경 없음

## 완료 내용

- 미분류 상담 기록 섹션 전체를 `UnlinkedRecordsSection` feature component로 추출했다.
- sidebar는 visible order/index, selection/drag/context menu handler를 props로 넘기는 조립 역할만 유지한다.
- `sidebar.tsx` 줄 수를 1080줄에서 1036줄로 줄였다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
