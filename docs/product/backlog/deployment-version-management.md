# 배포 최소 버전관리 백로그

## 차수 1: SemVer + GitHub Release 기반 운영 버전관리 구축

### 작업내용

- root `package.json`의 `version`을 제품 버전 SSOT로 사용한다.
- 초기 버전은 `0.0.0`으로 둔다.
- MAJOR/MINOR/PATCH bump 기준을 에이전트 SSOT 문서에 기록한다.
- `vX.Y.Z` tag push 또는 수동 dispatch 시 GitHub Release를 생성하는 workflow를 추가한다.
- release workflow는 tag와 `package.json` version이 다르면 실패한다.
- 운영 Docker rollout은 `sha-<short-sha>` 이미지 태그를 사용해 실제 배포 커밋을 추적 가능하게 한다.

### 논의 필요

- 없음. 사용자가 GitHub Release + MAJOR/MINOR/PATCH 관리를 명시했다.

### 선택지

1. deploy run 번호 기반 `prod-*` release를 만든다.
2. root `package.json` SemVer 기반 `vX.Y.Z` release를 만든다.
3. 각 패키지별 독립 version을 둔다.

### 추천

- 2번. 현재는 제품/운영 단위 추적이 목적이므로 monorepo root version 하나만 관리하는 것이 가장 작고 명확하다.

### 사용자 방향

- `0.0.0`에서 시작해 MAJOR/MINOR/PATCH로 관리한다.
