# Docker pnpm 11 PATH 실패 수정

## 요청

- main push 후 GitHub Actions web Docker build가 `pnpm@11.5.2` base stage에서 실패.
- 실패 메시지: configured global bin directory `/pnpm/bin` is not in PATH.

## 진행

- 작업 전 `git status --short --branch`: main clean, `origin/main`과 동일.
- Dockerfile base stage 확인: `PNPM_HOME=/pnpm`, `PATH=$PNPM_HOME:$PATH`, `pnpm config set store-dir /pnpm/store --global`.
- 원인: pnpm 11이 보는 global bin directory는 `/pnpm/bin`인데 PATH에는 `/pnpm`만 있음.
- Dockerfile `PATH`에 `$PNPM_HOME/bin`을 추가해 `/pnpm/bin` global bin dir 검사를 통과하도록 수정.

## 검증

- `docker build --target base --build-arg PNPM_VERSION=11.5.2 -t yeon-web-base-pnpm-path-check .` 통과.
- `docker build --target deps --build-arg PNPM_VERSION=11.5.2 -t yeon-web-deps-pnpm-path-check .` 통과.
- 최종 image 빌드도 시도했으나 로컬 Docker Desktop 메모리 limit(약 3.8GiB) 환경에서 `Running TypeScript ...` 이후 5분 이상 응답 없어 내가 시작한 build 프로세스만 종료. CI 실패 지점(base)과 pnpm install 단계(deps)는 검증 완료.
- 임시 검증 이미지는 삭제.
- Dockerfile `PATH`에 `$PNPM_HOME/bin`을 추가해 `/pnpm/bin` global bin dir 검사를 통과하도록 수정.

## 검증

- `docker build --target base --build-arg PNPM_VERSION=11.5.2 -t yeon-web-base-pnpm-path-check .` 통과.
- `docker build --target deps --build-arg PNPM_VERSION=11.5.2 -t yeon-web-deps-pnpm-path-check .` 통과.
- 최종 image 빌드도 시도했으나 로컬 Docker Desktop 메모리 limit(약 3.8GiB) 환경에서 `Running TypeScript ...` 이후 5분 이상 응답 없어 내가 시작한 build 프로세스만 종료. CI 실패 지점(base)과 pnpm install 단계(deps)는 검증 완료.
- 임시 검증 image 삭제는 Docker daemon 응답 지연으로 완료 확인하지 못함.

## 결과

- Docker base stage에서 pnpm 11이 요구하는 `/pnpm/bin`을 PATH에 포함해 GitHub Actions 실패 원인을 제거했다.
