# 하네스 PR/merge 후 대기 금지 SSOT 반영

## 목표

- PR 생성/merge 수행 후 머지 상태 재조회나 CI/CD 완료 대기를 하지 않는 규칙을 하네스 SSOT에 반영한다.
- 장시간 대기로 인한 작업 지연을 줄인다.

## 범위

- `docs/agent-rules/deployment-versioning.md`
- `AGENTS.md`
- 관련 백로그

## 검증

- 진행 예정

## 완료 내용

- PR/merge 이후 머지 상태 재조회와 CI/CD/릴리즈 완료 대기를 하지 않는 규칙을 SSOT에 추가했다.
- AGENTS.md 릴리즈 규칙에서 사후 대기 대신 URL만 남기는 방향으로 정리했다.
- 자동 릴리즈 classifier 백로그 3차에 사용자 방향을 기록했다.

## 검증

- 진행 예정

- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
