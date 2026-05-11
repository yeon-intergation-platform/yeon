# 작업 로그: GitHub Actions Node 24 업그레이드

- 날짜: 2026-05-12
- 작성자: codex
- 상태: 완료
- 목적: 운영 배포 workflow의 Node.js 20 deprecation 경고 제거

## 작업 내용

- GitHub Actions 공식 release/action metadata 기준으로 Node 24 런타임 태그 확인
- `.github/workflows/docker-image.yml`의 checkout, artifact, Docker actions를 Node 24 버전으로 업그레이드
- `.github/workflows/release.yml`, `.github/workflows/ssot-check.yml`, `.github/workflows/db-drift.yml`의 checkout/setup 계열 액션 업그레이드
- `docs/product/backlog/deployment-version-management.md`에 차수 2 백로그 추가

## 검증 예정

- `git diff --check`
- workflow YAML 구문/uses 변경 범위 확인
- SSOT/스킬 wrapper 검증
