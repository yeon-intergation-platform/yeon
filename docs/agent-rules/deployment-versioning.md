# Release Versioning — Auto SemVer + GitHub Releases

## 목적

운영 배포와 제품 변경 이력을 GitHub Release로 추적한다. 이 문서는 에이전트/하네스가 릴리즈 번호와 MAJOR/MINOR/PATCH 판정을 판단할 때 참조하는 SSOT다.

## Source of truth

- 운영 제품 버전의 SSOT는 성공한 `main` 배포 뒤 생성되는 GitHub Release tag다.
- 릴리즈 태그는 항상 SemVer `vMAJOR.MINOR.PATCH` 형식이다. 예: `v0.1.0`.
- 운영 Docker rollout은 디버깅 가능성을 위해 현재 커밋의 `sha-<short-sha>` 이미지 태그를 사용하고, 제품 릴리즈 이력은 GitHub Release로 관리한다.
- root `package.json`의 `version`은 패키지/도구 기준값일 수 있지만, 자동 운영 릴리즈 번호를 막거나 대체하는 기준으로 쓰지 않는다.
- 수동 tag 기반 release workflow는 `package.json`과 tag version 불일치를 경고할 수 있으나, 자동 배포 릴리즈의 성공/실패 기준은 GitHub Release tag다.

## 자동 릴리즈 하네스

- `.github/workflows/auto-release.yml`은 `Build, Push, and Deploy Docker Image` workflow가 성공한 뒤 실행된다.
- 대상은 `main` push 또는 `workflow_dispatch`로 성공한 배포 커밋이다.
- 하네스는 최신 `vX.Y.Z` tag부터 배포 대상 SHA까지의 commit message와 관련 PR title/body/label을 수집한다.
- 수집한 텍스트에서 결정적 신호를 찾아 다음 버전을 자동 계산한다.
- 우선순위는 `MAJOR > MINOR > PATCH`다. 한 범위에 여러 신호가 있으면 가장 큰 변경 수준을 선택한다.
- 이미 같은 tag가 있으면 PATCH를 하나씩 올려 충돌 없는 tag를 만든다.

## PR/merge 후 대기 정책

- 에이전트의 동기 작업 완료 조건은 사전 로컬 검증, commit, push, PR 생성, merge 명령 수행까지다.
- PR 생성 또는 merge 명령을 수행한 뒤에는 머지 상태를 다시 조회하지 않는다.
- merge 뒤 CI/CD, 배포, 자동 릴리즈, GitHub Release 생성 완료를 기다리지 않는다.
- 장시간 `gh run watch`, 반복 `gh pr view`, 반복 release 조회를 완료 조건으로 삼지 않는다.
- 후속 상태가 필요하면 사용자가 직접 열 수 있는 PR/Actions URL만 남긴다.
- 단, 사용자가 이번 턴에서 명시적으로 “기다려”, “확인해”, “CI 끝까지 봐”라고 지시한 경우에만 후속 상태를 조회한다.

## 로컬 확인 기준

- Playwright 같은 로컬 브라우저 확인이 필요한 경우 에이전트가 직접 `pnpm dev:all`을 기동해도 된다.
- 직접 기동 전에는 `lsof -nP -iTCP:3000 -iTCP:3001 -iTCP:3002 -iTCP:8000 -iTCP:8081 -iTCP:8082 -iTCP:8083 -iTCP:2567 -sTCP:LISTEN`처럼 관련 포트 점유 상태를 확인한다.
- 이미 `pnpm dev:all`로 필요한 Yeon 로컬 서비스가 정상 기동 중이면 재사용한다. 사용자 컴퓨터의 RAM을 아끼기 위해 매번 기존 서버를 끄고 다시 켜거나 중복 dev 서버를 만들지 않는다.
- 필요한 포트가 비어 있거나 기존 Yeon 개발 프로세스가 죽은 상태일 때만 `pnpm dev:all`을 실행한다. 충돌 프로세스를 종료해야 할 때는 Yeon 로컬 개발 프로세스인지 확인하고 unrelated 프로세스를 함부로 죽이지 않는다.
- 기동 후에는 Playwright로 실제 동작을 검증하고, 에이전트가 새로 띄운 로컬 개발 프로세스는 검증 종료 후 필요하면 정리한다.
- Docker 컨테이너가 필요한 검증은 `docker ps`/`docker ps -a`로 기존 컨테이너를 먼저 확인하고 재사용한다. 같은 목적의 DB/MCP/테스트 컨테이너를 반복 생성하지 않으며, 너무 많이 쌓인 에이전트 생성 컨테이너는 소유와 용도를 확인한 뒤 정리한다. 프로젝트/사용자 장기 실행 컨테이너는 근거 없이 중지하지 않는다.
- CI/CD 완료 대기 대신 로컬 URL에서 확인 가능한 범위만 확인하고 멈춘다.

## 자동 판정 기준

### MAJOR

다음 중 하나라도 있으면 MAJOR로 판정한다.

- `BREAKING CHANGE`
- `semver:major`
- `release:major`
- `major release`
- Conventional Commit breaking marker: `type!:` 또는 `type(scope)!:`

사용 기준:

- 호환되지 않는 공개 API/계약 변경
- 기존 데이터나 사용자가 수동 대응해야 하는 마이그레이션
- 기존 핵심 사용자 플로우를 깨는 변경
- 인증/권한/저장소 정책처럼 기존 사용 방식이 달라지는 변경

### MINOR

MAJOR 신호가 없고 다음 중 하나라도 있으면 MINOR로 판정한다.

- `semver:minor`
- `release:minor`
- `minor release`
- Conventional Commit feature: `feat:` 또는 `feat(scope):`

사용 기준:

- 하위 호환되는 신규 기능
- 새 화면/서비스 흐름 추가
- 사용자에게 보이는 주요 기능 확장
- 기존 기능을 깨지 않는 새 API/계약 추가

### PATCH

MAJOR/MINOR 신호가 없고 다음 중 하나라도 있으면 PATCH로 판정한다.

- `semver:patch`
- `release:patch`
- `patch release`
- Conventional Commit type: `fix`, `perf`, `refactor`, `ci`, `docs`, `chore`, `test`, `style`, `build`
- 위 신호가 전혀 없을 때의 기본값

사용 기준:

- 버그 수정
- UI 문구/배치 수정
- 배포/CI 수정
- 하위 호환되는 작은 개선
- 문서/규칙/운영 메타데이터 정리

## 에이전트 규칙

- 변경 의도에 맞는 Conventional Commit type을 commit/PR title에 남긴다.
- MAJOR 또는 MINOR가 필요하면 PR title/body/label 중 하나에 결정적 신호를 반드시 남긴다.
- breaking change를 의도했는데 `BREAKING CHANGE` 또는 `semver:major`가 없으면 완료로 보고하지 않는다.
- 자동 릴리즈는 비동기로 생성되므로 merge 직후 성공 여부를 기다리지 않는다.
- 자동 릴리즈 실패 원인 확인이나 수동 tag/release 생성은 사용자가 별도로 요청했을 때만 수행한다.
- 수동으로 `package.json` version만 올리는 방식은 운영 릴리즈 생성 기준으로 사용하지 않는다.

## 예시

| 변경                            | 권장 신호                                   | 자동 bump |
| ------------------------------- | ------------------------------------------- | --------- |
| 커뮤니티 게시글 CRUD 신규 추가  | `feat: 커뮤니티 익명 게시글 CRUD 추가`      | MINOR     |
| 로그인 없는 댓글 삭제 버그 수정 | `fix: 커뮤니티 익명 댓글 삭제 검증 복구`    | PATCH     |
| API 응답 필드 제거              | PR body에 `BREAKING CHANGE: ...`            | MAJOR     |
| Docker 배포 감지 수정           | `ci: 운영 배포 변경 감지 누락 보정`         | PATCH     |
| 릴리즈 기준 문서화              | `docs: 자동 릴리즈 SemVer 판정 기준 문서화` | PATCH     |
