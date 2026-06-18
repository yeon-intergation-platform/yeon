# repo-harness ChatGPT Pro 웹 브릿지 설정

## 목표

- Codex에서 GPT Pro 웹 모델을 직접 사용하는 것으로 오해하지 않게 경계를 분명히 한다.
- `repo-harness`를 통해 ChatGPT Pro 웹 세션을 계획/리뷰/핸드오프 사이드카로 연결할 준비를 마친다.
- 비밀 토큰과 로컬 OAuth 설정은 커밋하지 않는다.

## 진행

- 작업 워크트리: `/Users/osuma/coding_stuffs/yeon-2`
- 브랜치: `setup/repo-harness-chatgpt-bridge-20260618`
- 초기 상태: `origin/main` 기준 clean
- `repo-harness@0.7.0` 전역 설치 확인
- ChatGPT Connector용 MCP 로컬 설정 생성
- Codex executor용 프로젝트 MCP 설정 생성
- repo-harness ChatGPT bridge skill 설치
- ChatGPT native browser doctor 준비 상태 확인
- HTTP planner MCP 서버 `/health` 및 OAuth discovery 응답 확인 후 종료
- `.repo-harness` 토큰/OAuth 파일과 ChatGPT 브라우저 세션 파일 ignore 확인

## 검증

- `repo-harness --version` -> `0.7.0`
- `repo-harness mcp doctor --repo .` -> 설정 present, dev runner disabled
- `repo-harness chatgpt browser-doctor --repo . --provider native --json` -> `status: ready`
- `curl http://127.0.0.1:8765/health` -> `status: ok`
- `git diff --check`
- `/opt/homebrew/bin/bash bin/sync-skills.sh --check`
- `/opt/homebrew/bin/bash bin/verify-ssot.sh --project-only` in root worktree

## 메모

- `bin/verify-ssot.sh --project-only`는 linked worktree의 `.git` 파일 구조를 git 저장소가 아니라고 판단해 프로젝트 검사를 건너뛴다. 루트 워크트리에서는 정상 통과했다.
- 현재 상태는 repo-harness full adopt가 아니라 Yeon 최소 MCP bridge 설정이다.
