# Today 이중 기록 카드 정보 노출

## 요청

- 두 번째 기록을 추가한 대각선 분할 카드에서 아이콘과 설명이 잘리는 문제를 수정한다.

## 원인

- 첫 기록 내용은 왼쪽 위 삼각형과 반대인 오른쪽에 배치됐다.
- 두 번째 기록 내용은 오른쪽 아래 삼각형과 반대인 왼쪽에 배치됐다.
- 더보기 버튼도 `clip-path` 내부에 있어 일부가 잘렸다.

## 작업 범위

- `apps/web/src/features/today/today-record-screen.tsx`
- 데스크톱·모바일 Playwright 시각 증거

## 설계 결정

- 기존 대각선 분할 형태는 유지한다.
- 각 기록의 아이콘·활동명·설명을 삼각형의 넓은 쪽에 배치한다.
- 메뉴 버튼은 클리핑 영역과 분리한다.

## 검증

- Playwright 실제 브라우저
  - 첫 번째·두 번째 기록 아이콘 노출: 통과
  - 첫 번째·두 번째 기록 설명 노출: 통과
  - 더보기 버튼 2개가 카드 경계 안에 온전히 위치: 통과
  - 모바일 가로 오버플로: `0px`
- 자동 검증
  - `pnpm --filter @yeon/web lint`: 통과
  - `pnpm --filter @yeon/web typecheck`: 통과
  - `NODE_OPTIONS='--localstorage-file=/tmp/yeon-vitest-localstorage-split-20260723' pnpm --filter @yeon/web test`: 263개 파일, 1,146개 테스트 통과
  - `pnpm verify:parity`: 통과
  - `git diff --check`: 통과
  - `bash bin/sync-skills.sh --check`: 통과
  - `bash bin/verify-ssot.sh --project-only`: 통과

## 시각 증거

- 변경 전: `today-split-record-content-screenshots/before-split-record-mobile.png`
- 변경 후 데스크톱: `today-split-record-content-screenshots/after-split-record-content-desktop-1440.png`
- 변경 후 모바일: `today-split-record-content-screenshots/after-split-record-content-mobile-375.png`
