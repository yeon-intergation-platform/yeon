# Release Versioning — SemVer + GitHub Releases

## 목적

운영 배포와 제품 변경 이력을 GitHub Release로 추적한다. 버전의 source of truth는 root `package.json`의 `version`이다.

## 최소 버전관리 규칙

- 현재 초기 버전은 `0.0.0`이다.
- 버전 형식은 항상 SemVer `MAJOR.MINOR.PATCH`를 사용한다.
- GitHub Release 태그는 항상 `v<package.json version>` 형식이다. 예: `v0.1.0`.
- release workflow는 태그와 `package.json` version이 다르면 실패해야 한다.
- 운영 Docker rollout은 디버깅 가능성을 위해 현재 커밋의 `sha-<short-sha>` 이미지 태그를 사용하고, 제품 릴리즈 이력은 GitHub Release로 관리한다.

## bump 기준

- `MAJOR`: 호환되지 않는 API/데이터/사용자 플로우 변경, 수동 마이그레이션이 필요한 변경.
- `MINOR`: 하위 호환되는 신규 기능, 새 화면/서비스 흐름, 사용자에게 보이는 주요 기능 추가.
- `PATCH`: 버그 수정, UI 문구/배치 수정, 배포/CI 수정, 하위 호환되는 작은 개선.

`0.x.y` 단계에서도 위 기준을 유지한다. 단, 제품 안정화 전에는 breaking change라도 사용자 영향이 제한적이면 에이전트가 근거를 남기고 `MINOR`로 낮출 수 있다.

## 에이전트 하네스 규칙

- 코드/배포 변경을 마무리할 때 release 필요 여부를 판단한다.
- release가 필요하면 `pnpm version:bump -- <major|minor|patch>`로 root `package.json`만 bump한다.
- release PR에는 bump 이유와 선택한 MAJOR/MINOR/PATCH 근거를 남긴다.
- main merge 후 release tag `vX.Y.Z`를 만들고 GitHub Release 생성 여부를 확인한다.
- GitHub Actions가 성공했더라도 release가 필요한 변경에 release가 없으면 완료로 보고하지 않는다.

## 명령

```bash
pnpm version:bump -- patch
pnpm version:bump -- minor
pnpm version:bump -- major
pnpm release:verify -- v0.1.0
```
