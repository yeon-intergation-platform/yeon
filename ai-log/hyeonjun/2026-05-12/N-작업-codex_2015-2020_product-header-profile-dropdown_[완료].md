# product-header profile dropdown

## 목표

- 공통 제품 헤더의 내정보 아이콘 클릭 시 즉시 페이지 이동하지 않고 메뉴를 띄운다.
- 메뉴에는 내정보보기와 로그아웃을 제공한다.

## 시작 상태

- 별도 worktree: `../yeon-profile-dropdown`
- 기준: `origin/main` (`a4ab2d3`)
- root 작업트리에 미완료 변경이 있어 분리 작업.

## 진행

- 백로그 작성 완료.

## 완료 내용

- `ProductHeaderProfileButton`을 링크에서 버튼+드롭다운으로 변경.
- 메뉴에 `내정보보기` 링크와 `로그아웃` 버튼 추가.
- 로그아웃은 기존 `useLogout` 훅을 재사용.
- 밖 클릭과 Escape 키로 메뉴가 닫히도록 처리.

## 검증

- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web build` 통과.
- `pnpm --filter @yeon/web lint` 통과.
- `git diff --check` 통과.
- `bash bin/sync-skills.sh --check` 통과.
- `bash bin/verify-ssot.sh --project-only` 통과(프로젝트 검사 skip 경고, 전역 OK).
