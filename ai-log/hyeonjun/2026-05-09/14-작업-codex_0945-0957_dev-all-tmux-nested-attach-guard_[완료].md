# dev:all tmux 중첩 경고 해결

## 차수 1

### 작업내용

- `scripts/dev-all.mjs`에서 tmux attach 전 내부 세션 여부를 정확히 판별하도록 `isInsideTmux()`를 추가했습니다.
- tmux 내부에서 실행 중이면 `tmux switch-client -t <session>`로 자동 전환하고, 실패 시 수동 전환 안내만 남기도록 변경했습니다.
- 백엔드 실행 포트 주입 env를 `PORT`, `SERVER_PORT`, `BACKEND_PORT`까지 확장해 기존 설정 방식과의 호환성을 높였습니다.

### 논의 필요

- 없음

### 선택지

- 기존처럼 TMUX 존재 여부만으로 분기
- tmux 세션명 조회(`display-message`)로 실제 내부 실행 여부를 검증

### 추천

- 세션명 조회 기반 분기(현재 반영)

### 사용자 방향

- 현재 방식 반영

### 검증

- `node --check scripts/dev-all.mjs`
- `node --check scripts/dev-ports.mjs`
- `pnpm prettier --check scripts/dev-all.mjs scripts/dev-ports.mjs`
- `timeout 8 node scripts/dev-all.mjs --legacy` (실행 확인용, 충돌 환경에서 조기 종료됨)
