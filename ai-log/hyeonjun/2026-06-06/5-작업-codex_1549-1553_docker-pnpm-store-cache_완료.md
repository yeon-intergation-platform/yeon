# Docker pnpm store cache 안정화 작업 로그

- 시작: 2026-06-06 15:49 KST
- 종료: 2026-06-06 15:53 KST
- 브랜치: `codex/pnpm-11-buildkit-store`
- 대상: root `packageManager`, Dockerfile pnpm store/cache 설정

## 관찰

- GitHub Actions ARM64 Docker 빌드 로그에서 `pnpm install --frozen-lockfile` 단계가 16분 이상 수행됨.
- 핵심 증거는 pnpm 업데이트 알림보다 `reused 0` 및 `Tarball download average speed 3 KiB/s` 경고다.
- 현재 Dockerfile은 BuildKit cache mount를 `/pnpm/store`에 연결하지만, pnpm store 경로를 명시적으로 고정하지 않는다.

## 진행

- pnpm 11.5.2 적용.
- Dockerfile에서 `pnpm config set store-dir /pnpm/store --global`로 pnpm store를 `/pnpm/store`로 고정.
- Dockerfile base stage에서 pnpm 11.5.2를 `corepack prepare`로 미리 활성화.
- pnpm 11의 `ERR_PNPM_IGNORED_BUILDS` 대응을 위해 `pnpm-workspace.yaml`에 필요한 build script 승인 패키지를 명시.

## 검증

- `corepack pnpm install --lockfile-only --ignore-scripts`
- `CI=true corepack pnpm install --frozen-lockfile`
- `corepack pnpm --filter @yeon/web typecheck`
- `corepack pnpm --filter @yeon/web lint`
- `git diff --check`
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only` (`yeon` 기준 워크스페이스에서 실행)

## 제한

- 로컬 Docker daemon이 꺼져 있어 Docker base target 빌드는 실행하지 못했다.
