# N100 Proxmox 운영 이전 계획 문서화

## 작업

- 현재 운영이 Raspberry Pi ARM64 runner 중심이며, Docker 이미지는 multi-arch로 이미 amd64/arm64를 모두 지원한다는 점을 정리했다.
- N100 Proxmox 기준 Linux VM 운영 서버와 Windows VM StarCraft OCR observer 분리 구조를 문서화했다.
- 실사용자 0명 전제의 공격적 cutover 체크리스트를 작성했다.

## 변경 파일

- `docs/deployment/n100-proxmox-cutover.md`
- `docs/product/backlog/infra.md`
- `docs/deployment/README.md`

## 검증

- 완료: `git diff --check`
- 완료: `bash bin/sync-skills.sh --check`
- 완료: `bash bin/verify-ssot.sh --project-only`
