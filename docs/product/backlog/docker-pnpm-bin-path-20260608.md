# Docker pnpm 11 global bin PATH 수정 (2026-06-08)

## 1차

### 작업내용

- GitHub Actions web Docker build가 base stage에서 `pnpm@11.5.2` 활성화 중 `/pnpm/bin` PATH 불일치로 실패하는 문제를 수정한다.
- Dockerfile의 pnpm 실행 환경에서 pnpm 11이 요구하는 global bin directory(`/pnpm/bin`)를 PATH에 포함한다.
- 실패 지점(base stage)을 로컬 Docker build로 재현/검증한다.

### 논의 필요

- pnpm 캐시 store 경로(`/pnpm/store`)는 기존 BuildKit cache mount와 연결되어 있으므로 유지해야 한다.

### 선택지

1. `PATH`에 `/pnpm/bin`을 추가하고 기존 `PNPM_HOME=/pnpm` 및 store 경로를 유지한다.
2. `PNPM_HOME` 자체를 `/pnpm/bin`으로 바꾼다.

### 추천

- 1안. CI 실패 메시지가 요구한 PATH만 보강하고, 기존 `/pnpm/store` cache mount 설계는 건드리지 않는다.

### 사용자 방향

- main Docker build 실패를 즉시 고친다.
