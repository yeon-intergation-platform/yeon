# Playwright dev:all 런타임 관리 규칙 반영

## 목표

- Playwright 확인이 필요할 때 에이전트가 `pnpm dev:all`을 직접 기동할 수 있게 하되, 사용자 컴퓨터의 RAM을 낭비하지 않도록 중복 기동을 금지한다.

## 반영

- `AGENTS.md`: Playwright 로컬 확인 시 포트 점유 확인 → 정상 dev:all 재사용 → 필요할 때만 기동 → unrelated 프로세스 종료 금지 → 에이전트가 새로 띄운 프로세스 정리 원칙 추가.
- `docs/agent-rules/deployment-versioning.md`: 동일한 런타임 확인 원칙 반영.

## 운영 원칙

- 먼저 `lsof -nP -iTCP:3000 -iTCP:3001 -iTCP:3002 -iTCP:8000 -iTCP:8081 -iTCP:8082 -iTCP:8083 -iTCP:2567 -sTCP:LISTEN`으로 확인한다.
- 이미 필요한 Yeon 서비스가 떠 있으면 재사용한다.
- 비어 있거나 죽은 상태일 때만 `pnpm dev:all`을 실행한다.
- Docker 컨테이너도 새로 띄우기 전에 기존 컨테이너 존재 여부를 확인하고, 같은 목적의 컨테이너를 무한 생성하지 않는다.
