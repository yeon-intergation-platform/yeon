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

## 차수 2: GitHub Actions Node 24 런타임 전환

### 작업내용

- GitHub Actions의 Node.js 20 deprecation 경고를 제거한다.
- 공식 액션의 최신 Node 24 major/tag를 확인한 뒤 workflow의 `uses:` 버전을 올린다.
- Docker build/push, artifact upload/download, checkout, setup-node, pnpm setup 액션을 모두 Node 24 런타임 태그로 고정한다.
- 배포 동작 자체는 바꾸지 않고 런타임 경고 제거만 수행한다.

### 논의 필요

- 없음. GitHub가 Node 20 제거 일정을 공지했고, 현재 경고가 운영 배포 로그를 오염시키고 있다.

### 선택지

1. `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true`만 추가한다.
2. 공식 액션 major를 Node 24 버전으로 올린다.
3. 경고를 무시하고 2026년 9월 제거 시점까지 둔다.

### 추천

- 2번. 실제 action metadata가 Node 24로 선언된 태그를 사용하면 강제 opt-in보다 명확하고, 향후 런너 기본값 변경에도 안전하다.

### 사용자 방향

- Node.js 20 deprecation 경고가 뜨지 않도록 업그레이드한다.
