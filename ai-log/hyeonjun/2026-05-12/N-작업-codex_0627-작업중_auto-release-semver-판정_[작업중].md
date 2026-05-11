# Auto release SemVer 판정 작업 로그

- 시작: 2026-05-12 06:27 KST
- 목표: 자동 릴리즈가 major/minor/patch를 자동 판정하게 수정
- 기준:
  - major: BREAKING CHANGE, semver:major/release:major, Conventional Commit !
  - minor: feat, semver:minor/release:minor
  - patch: fix/perf/refactor/ci/docs/chore/test/style/build 또는 기본값
