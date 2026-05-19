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

## 타자/카드 마크다운 에디터 성능 및 Tab 처리 개선

### 작업내용

- 숫자 목록/기호 입력 시 TipTap transaction마다 React 전체 리렌더와 미리보기 렌더가 반복되는 병목을 줄인다.
- toolbar/table 상태 갱신을 requestAnimationFrame 기반으로 제한하고, 렌더 중 문서 전체 스캔을 제거한다.
- 미리보기 값은 즉시 입력 경로와 분리해 deferred 렌더링한다.
- 목록 안 Tab이 Mac 텍스트 대치/입력 보조 흐름을 목록 중첩으로 오인하지 않도록 Tab 목록 들여쓰기 처리를 차단한다.

### 논의 필요

- Tab으로 목록 들여쓰기를 유지할지, 입력 보조 안정성을 우선해 일반 Tab 들여쓰기를 제거할지 결정이 필요하다.

### 선택지

1. 일반 Tab 목록 들여쓰기를 유지하고 IME/composition 감지 시에만 예외 처리한다.
2. 일반 Tab 목록 들여쓰기를 막고 toolbar 버튼으로 목록 제어를 유도한다.

### 추천

- 현재 사용 불가능할 정도의 렉과 Mac 텍스트 대치 충돌이 있으므로 2번을 우선 적용한다.

### 사용자 방향

- 1~6단계 전부 진행한다. 숫자/기호 입력 성능과 Tab 중첩 목록 문제를 함께 수정한다.
