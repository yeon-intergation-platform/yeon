# 도메인 서브도메인 라우팅 문서/스킬 정리 2026-06-01

## 1차 — 운영 도메인 라우팅 SSOT 작성

### 작업내용

- `typing-service`, `card-service`, `community`의 기존 path URL과 목표 subdomain URL을 한 문서에 기록한다.
- Cloudflare DNS/Tunnel/Public Hostname/Access 확인 항목을 문서화한다.
- 앱 라우팅, CORS, 쿠키, WebSocket, SEO, 검증, 롤백 항목을 문서화한다.

### 논의 필요

- 기존 path URL을 301 redirect로 전환할지, 일정 기간 호환 유지할지 결정해야 한다.
- Cloudflare Access 보호 정책이 서비스별로 필요한지 확인해야 한다.

### 선택지

- A. 기존 path를 즉시 301 redirect한다.
- B. 기존 path를 유지하고 canonical만 신규 subdomain으로 둔다.
- C. 일정 기간 path/subdomain을 병행한 뒤 redirect한다.

### 추천

- C. 신규 subdomain을 먼저 검증하고, path URL은 호환 유지 후 안정화되면 301 redirect한다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 2차 — 에이전트 자동 참조 스킬 구성

### 작업내용

- Claude context skill, Claude command skill, Codex wrapper, `.agents` wrapper를 추가한다.
- 스킬 본문은 운영 문서만 읽게 하고, 장식적 문구 없이 정보만 둔다.
- description에는 호출 조건을 명시한다.

### 논의 필요

- `skills_context`라는 물리 디렉터리가 없으므로 현재 저장소 구조의 `.claude/skills/omc/context`를 context skill 위치로 사용한다.

### 선택지

- A. `docs/deployment/domain-routing.md`만 SSOT로 두고 모든 스킬은 wrapper로 둔다.
- B. 스킬 본문에 운영 정보를 복사한다.

### 추천

- A. 중복을 막기 위해 운영 문서를 SSOT로 두고 wrapper만 둔다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 3차 — 300단계 체크리스트 문서화

### 작업내용

- 서브도메인 전환을 위한 300개 확인 항목을 `docs/deployment/domain-routing-checklist-300.md`에 작성한다.
- 체크리스트는 조사, Cloudflare, 앱 라우팅, 인증, 서비스별 검증, 배포/롤백을 포함한다.

### 논의 필요

- 체크리스트는 실행 순서의 전체 범위이며, 실제 구현 전에는 현재 코드/Cloudflare 설정 확인이 필요하다.

### 선택지

- A. 체크리스트를 운영 문서 안에 모두 넣는다.
- B. 운영 SSOT와 300단계 실행 체크리스트를 분리한다.

### 추천

- B. 운영 SSOT는 짧게 유지하고, 긴 실행 체크리스트는 별도 문서로 둔다.

### 사용자 방향

- 추천 기준으로 진행한다.
