# 타자 점령전 카드 소유권 보드 보정 작업 로그

- 시작: 2026-06-01
- 상태: 완료
- 목표: 점령전 화면에서 배경 반분이 아니라 중앙 카드 자체가 빨강/파랑 소유권을 표시하고, 상대팀 카드를 입력해 뒤집는 흐름을 명확히 만든다.
- 범위: apps/web typing-service, docs/product/backlog, ai-log
- 원칙: 서버 snapshot board를 source of truth로 사용하고, UI는 owner에서 파생한다.

## 변경

- 중앙 캔버스 영역을 snapshot 기반 5x5 카드 보드 렌더링으로 교체했다.
- owner별 빨강/파랑/중립 카드 색상과 타깃 링을 추가했다.
- 내 팀과 상대팀 안내를 추가하고, 빠른 타깃 목록을 상대팀 카드 우선으로 정렬했다.
- 타깃 단어 추천을 상대팀 카드 우선, 중립 카드 후순위로 변경했다.
- 로컬 판정에서도 내 팀 카드는 입력할 수 없고 상대/중립 카드만 뒤집도록 정리했다.

## 검증

- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web build` 통과
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
- `git diff --check` 통과
