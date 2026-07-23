# Today 이중 기록 카드 단일 메뉴

## 요청

- 이중 기록 카드에 더보기 버튼이 두 개 보이는 문제를 해결한다.
- 각 삼각형의 무게중심에 아이콘·활동명·설명 묶음을 배치한다.

## 작업 범위

- `apps/web/src/features/today/today-record-screen.tsx`
- 이중 기록 카드의 삼각형 무게중심 정보 배치와 단일 메뉴
- 데스크톱·모바일 Playwright 시각 증거

## 작업 원칙

- 기존 단일 기록 카드와 좌클릭 추가 동작은 변경하지 않는다.
- 이중 기록 카드의 각 행 우클릭은 해당 기록 메뉴를 계속 연다.
- 터치 사용자는 카드의 단일 더보기 버튼에서 두 기록을 모두 편집·삭제할 수 있다.
- `docs/repo-harness-chatgpt-mcp-setup.md`의 기존 수정은 사용자 소유로 보고 건드리지 않는다.

## 구현 결과

- 좌상단 삼각형 `(1/3, 1/3)`과 우하단 삼각형 `(2/3, 2/3)`에 아이콘·활동명·설명을 함께 배치했다.
- 배경 삼각형과 정보 묶음 레이어를 분리해 문자가 대각선에서 잘리지 않게 했다.
- 더보기 버튼은 카드당 하나만 표시하고, 메뉴에서 두 기록의 설명 편집·삭제를 모두 선택하게 했다.
- 각 삼각형의 우클릭 메뉴는 해당 기록만 대상으로 유지했다.

## 검증

- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `NODE_OPTIONS='--localstorage-file=/tmp/yeon-web-vitest-localstorage-20260724.json' pnpm --filter @yeon/web test` — 263개 파일, 1,146개 테스트 통과
- `pnpm verify:parity`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`
- `git diff --check`
- Playwright 데스크톱·모바일 확인
  - 이중 기록 카드 내 버튼 1개
  - 두 기록의 아이콘·활동명·설명 표시
  - 단일 메뉴의 편집·삭제 항목 4개
  - 모바일 가로 오버플로 0px

## 시각 증거

- `today-split-record-menu-screenshots/after-desktop-dual-record-card.png`
- `today-split-record-menu-screenshots/after-desktop-today-record.png`
- `today-split-record-menu-screenshots/after-desktop-single-menu.png`
- `today-split-record-menu-screenshots/after-mobile-today-record.png`
