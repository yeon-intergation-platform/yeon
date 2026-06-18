# 10 작업 - self-hosted only actions

## 목표

- GitHub-hosted runner billing/spending-limit 오류로 시작되지 않는 CI job을 self-hosted runner 전용으로 바꾼다.

## 범위

- `.github/workflows/backend-tests.yml`
- 백로그 문서와 작업 로그

## 확인한 원인

- `test-and-report`, `karate-flows` 두 job이 `runs-on: ubuntu-latest`라 GitHub-hosted runner 결제 제한에 걸린다.
- 다른 workflow의 활성 `runs-on`은 이미 `[self-hosted, Linux, ARM64]`이다.

## 진행 계획

- `backend-tests.yml`의 두 job을 `[self-hosted, Linux, ARM64]`로 변경한다.
- ARM64 runner에서 JDK 21 환경변수명이 달라도 Karate가 실행되도록 fallback을 추가한다.
- hosted runner 잔여 검색과 최소 검증을 수행한다.

## 처리 결과

- `test-and-report`, `karate-flows`를 `[self-hosted, Linux, ARM64]`로 고정했다.
- Karate 실행 전 `JAVA_HOME_21_ARM64`, `JAVA_HOME_21_AARCH64`, `JAVA_HOME_21_X64` 순서로 JDK 21 경로를 찾게 했다.
- 활성 `runs-on`에 `ubuntu-latest`, `windows-latest`, `macos-latest`가 남아 있지 않음을 확인했다.

## 검증

- `rg` hosted runner `runs-on` 잔여 검색: 없음
- `pnpm exec prettier --check .github/workflows/backend-tests.yml`: 통과
- `git diff --check`: 통과
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`: 통과
- `PATH="/opt/homebrew/bin:$PATH" /opt/homebrew/bin/bash bin/verify-ssot.sh --project-only` (`yeon` 기준 워크트리): 통과

## 메모

- `bash bin/sync-skills.sh --check`는 macOS 기본 Bash 3에서 `declare -A` 미지원으로 실패한다. Homebrew Bash로 재실행해 통과했다.
- `yeon-4` worktree에서는 `.git`이 디렉터리가 아니라 파일이라 `verify-ssot.sh`가 프로젝트 검사를 건너뛴다. 같은 저장소의 기준 워크트리 `yeon`에서 프로젝트 SSOT 검사를 통과시켰다.
