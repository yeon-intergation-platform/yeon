# Infra Backlog

배포, CI/CD, DB, 운영 보안 관련 실행 항목을 관리합니다.

## Active

- 운영 배포 문서: `docs/deployment/`
- DB/보안 변경은 마이그레이션과 운영 런북을 함께 관리합니다.

## Historical References

- `history/2026-04-07/2-ghcr-raspberrypi-deploy_BACKLOG.md`
- `history/2026-04-07/3-ci-cd-auto-deploy-check_BACKLOG.md`
- `history/2026-04-21/4-DB-PK-bigint-마이그레이션_BACKLOG.md`
- `docs/deployment/oauth-token-encryption-rollout.md`

## N100 Proxmox 운영 이전 계획

### 작업내용

- 현재 Raspberry Pi ARM64 운영 경로를 분석하고 N100 Proxmox 이전 계획을 문서화한다.
- Linux VM은 운영 Docker Compose, Windows VM은 StarCraft OCR 관측기로 분리한다.
- 실사용자가 없다는 전제에서 장기 병행이 아닌 공격적 cutover 체크리스트를 만든다.

### 논의 필요

- N100 Linux VM 준비 완료 시점
- Cloudflare Tunnel credential 이전 방식
- Raspberry Pi 제거 시점

### 선택지

1. Raspberry Pi와 N100을 장기 병행한다.
2. Raspberry Pi를 중단하고 N100으로 짧은 절체를 수행한다.

### 추천

- 실사용자가 없으므로 2번을 추천한다. 단, DB dump/restore와 cloudflared 전환 순서는 반드시 지킨다.

### 사용자 방향

- 공격적으로 N100으로 확 이동한다. 현재 운영 상황과 이전 체크리스트를 문서로 남긴다.
