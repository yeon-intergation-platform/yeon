# Docker pnpm store cache 안정화 1차

## 1차

### 작업내용

- ARM64 self-hosted Docker 빌드에서 `pnpm install`이 `reused 0`으로 시작하는 원인을 줄인다.
- root `packageManager`를 pnpm 11.5.2로 갱신해 Corepack 경고와 런타임 버전 불일치를 제거한다.
- Dockerfile base stage에서 pnpm 11.5.2를 미리 활성화하고, pnpm store 위치를 BuildKit cache mount target과 명시적으로 맞춘다.

### 논의 필요

- 이번 변경 뒤 첫 Docker 빌드는 base/packageManager 변경으로 캐시가 한 번 무효화될 수 있다.
- 두 번째 이후 ARM64 빌드 로그에서 `pnpm install`의 `reused` 수치가 0이 아닌지 확인해야 한다.

### 선택지

- 선택지 A: pnpm 버전만 올린다.
- 선택지 B: pnpm 버전 갱신, pnpm 11 build-script 승인 정책, Docker pnpm store 경로 고정을 같이 한다.
- 선택지 C: self-hosted runner SSH로 BuildKit 내부 캐시 상태까지 점검한 뒤 더 큰 workflow 수정을 한다.

### 추천

- 선택지 B. 현재 로그의 병목은 업데이트 알림이 아니라 cold pnpm store이므로, 버전 갱신만으로는 재발을 막기 어렵다. pnpm 11은 build-script 승인 정책도 필요하다.

### 사용자 방향

- 추천 기준으로 진행한다.
