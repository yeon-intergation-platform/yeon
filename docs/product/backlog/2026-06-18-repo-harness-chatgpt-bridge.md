# repo-harness ChatGPT Pro 웹 브릿지 설정

## 배경

Codex의 기본 실행 모델을 ChatGPT Pro 웹 모델로 바꾸는 것은 불가능하다. 대신 `repo-harness`를 이용해 ChatGPT Pro 웹 세션을 계획/리뷰/핸드오프 사이드카로 붙이고, Codex는 기존처럼 실행자로 유지한다.

## 1차

### 작업내용

- `repo-harness` CLI를 로컬에 설치한다.
- Yeon 저장소에 Codex용 repo-harness MCP 설정을 추가한다.
- ChatGPT Connector용 repo-harness MCP 초기 설정을 생성한다.
- ChatGPT 웹 상담용 skill과 연결 가이드를 저장소에 추가한다.
- 토큰, OAuth, 로컬 서버 설정 파일은 `.gitignore`로 보호한다.

### 논의 필요

- ChatGPT Pro 웹 로그인을 사용하는 Connector 생성은 브라우저에서 사용자가 직접 완료해야 한다.
- 원격 HTTPS 터널은 세션마다 URL이 바뀔 수 있으므로 운영 고정 터널로 승격할지는 별도 결정이 필요하다.

### 선택지

- 최소 설정: MCP 설정, skill, 문서만 추가하고 ChatGPT Connector는 사용자가 수동 연결한다.
- 전체 도입: repo-harness adopt, hooks, orchestrator, dev runner까지 활성화한다.

### 추천

최소 설정으로 시작한다. Yeon은 이미 AGENTS/OMC 규칙이 강하므로 repo-harness의 전체 orchestrator를 바로 켜면 기존 작업 흐름과 충돌할 수 있다.

### 사용자 방향

최소 설정으로 진행한다. ChatGPT Pro 웹은 Codex 대체 모델이 아니라 계획/리뷰 사이드카로 연결한다.
