# 자동 릴리즈 SemVer 판정 SSOT 문서화

## 목표

- 자동 릴리즈 major/minor/patch 판정 기준을 에이전트가 참조하는 SSOT 문서에 고정한다.
- 실제 `.github/workflows/auto-release.yml` 동작과 AGENTS.md/운영 문서 설명을 맞춘다.

## 범위

- `docs/agent-rules/deployment-versioning.md`
- `AGENTS.md` 릴리즈 포인터
- 관련 백로그/작업 로그

## 검증 예정

- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`

## 상태

- 작업 중

## 완료 내용

- `docs/agent-rules/deployment-versioning.md`를 자동 SemVer 릴리즈 SSOT로 갱신했다.
- `AGENTS.md` 릴리즈 규칙을 GitHub Release tag 기준과 SSOT 포인터 중심으로 정리했다.
- 자동 릴리즈 SemVer classifier 백로그 2차에 SSOT 문서화 결정을 추가했다.
- 로컬 OMC harness 설정에는 SSOT 포인터를 추가했지만 `.omc/`는 repository ignore 대상이므로 커밋 범위에는 포함하지 않는다.

## 검증

- 진행 예정

- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
