# 자동 릴리즈 SemVer bump 판정 기준

## 1차

### 작업내용

- 배포 성공 후 자동 릴리즈가 항상 patch만 올리는 구조를 수정한다.
- 마지막 릴리즈 태그부터 배포 커밋까지의 커밋/PR 메시지를 분석해 major/minor/patch를 자동 판정한다.
- 운영자가 명확히 지정할 수 있도록 `semver:major`, `semver:minor`, `semver:patch` 라벨/문구도 허용한다.

### 논의 필요

- 실제 LLM 호출 기반 AI 판정은 API key/비용/실패 시 배포 차단 리스크가 있으므로 CI 기본값으로 두지 않는다.
- 대신 Conventional Commits와 PR 라벨/본문을 source of truth로 삼는 결정적 자동 판정을 적용한다.

### 선택지

- A. 항상 patch 증가
- B. Conventional Commits/라벨 기반 자동 판정
- C. 외부 LLM API 호출 기반 판정

### 추천

- B. CI 안정성과 예측 가능성을 유지하면서 major/minor/patch를 자동 반영한다.

### 사용자 방향

- 사용자가 major/minor/patch 기준을 자동 판단하도록 요구했으므로 B를 적용한다.

## 2차

### 작업내용

- 자동 SemVer 판정 기준을 에이전트/하네스가 참조하는 릴리즈 SSOT 문서에 고정한다.
- root `package.json` 수동 bump 기준으로 남아 있던 오래된 설명을 실제 자동 릴리즈 워크플로우 기준으로 정정한다.
- AGENTS.md는 세부 규칙을 복제하지 않고 SSOT 문서만 가리키도록 정리한다.

### 논의 필요

- 없음. 사용자가 자동 판정 기준을 하네스 SSOT에 넣으라고 명시했다.

### 선택지

- A. 자동 릴리즈 workflow만 구현하고 문서는 그대로 둔다.
- B. `docs/agent-rules/deployment-versioning.md`를 SSOT로 삼고 AGENTS.md는 포인터만 둔다.
- C. `.omc/self-improve/config/harness.md`에 릴리즈 규칙을 직접 넣는다.

### 추천

- B. 릴리즈/배포 규칙은 운영 문서가 SSOT이고, OMC self-improve harness 설정에는 실험 하네스 규칙만 남기는 것이 경계가 명확하다.

### 사용자 방향

- 자동 판정 기준을 하네스/에이전트 SSOT에서 바로 확인할 수 있게 B를 적용한다.
