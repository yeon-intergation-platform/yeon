# 프론트엔드 CI 품질 게이트 신설

작성일: 2026-06-03

## 배경

현재 CI 워크플로는 백엔드(`backend-tests.yml`)와 SSOT/parity(`ssot-check.yml`)만 게이트하고, **프론트엔드(web/mobile/packages)의 typecheck·lint·단위 테스트를 PR에서 강제하는 워크플로가 전무**하다. 그 결과 전수 감사(PR #569)에서 web vitest 21건 + auth 6건(총 27건)의 회귀가 묻힌 채 main에 머지됐고, 이후 별도 세션에서 사후 정합해야 했다.

로컬 pre-commit 훅이 lint·typecheck를 돌지만 (1) `--no-verify`로 우회 가능하고 (2) vitest는 돌지 않아 silent drift를 막지 못한다. CI 레벨 게이트가 필요하다.

## 1차: frontend-quality 워크플로 추가

### 작업내용

- `.github/workflows/frontend-quality.yml` 신설. PR(main) + push(main)에서 프론트 변경 시 실행.
- 단계: `pnpm install --frozen-lockfile` → `pnpm typecheck`(turbo 10pkg) → `pnpm lint`(turbo 10pkg) → web vitest(`pnpm --filter @yeon/web test`) → mobile vitest(`pnpm --filter @yeon/mobile exec vitest run`).
- paths 필터: `apps/web/**`, `apps/mobile/**`, `packages/**`, 루트 `package.json`/`pnpm-lock.yaml`/`pnpm-workspace.yaml`/`turbo.json`, 워크플로 자신.
- setup 컨벤션은 기존 `docker-image.yml`과 일치(`pnpm/action-setup@v6.0.7`, `setup-node@v6.4.0` node 22, `cache: pnpm`).

### 논의 필요

- 이 체크를 GitHub branch protection의 required check로 승격할지는 저장소 설정(관리자) 영역이라 워크플로 추가만으로는 강제되지 않는다. 머지 후 사용자/관리자가 required로 지정 권장.
- 동결 counseling-workspace 테스트도 web vitest에 포함된다. 현재 전부 green이므로 게이트에 포함해도 무방(별도 세션에서 정합 완료). 추후 동결 도메인을 게이트에서 분리할지는 정책 판단.

### 선택지

1. typecheck+lint+web/mobile vitest 전부 게이트 — 추천
2. typecheck+lint만 게이트(vitest 제외)
3. web vitest만 추가

### 추천

선택지 1. 이번에 묻혔던 회귀(typecheck/lint는 통과했으나 vitest가 red였음)를 막으려면 vitest까지 포함해야 한다.

### 사용자 방향

"프론트 CI 품질 게이트(추천)" 선택 → 선택지 1로 진행.
