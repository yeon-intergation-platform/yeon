# service-context-skills deep interview

- 시작: 2026-05-01 14:44 KST
- 목표: omx team 5 팀원용 서비스별 디자인/기능 컨텍스트 스킬 및 AGENTS.md 포인터 구조 요구사항 명확화
- 모드: deep-interview (구현 전 요구사항 수집)
- 컨텍스트 스냅샷: .omx/context/service-context-skills-agents-md-20260501T054452Z.md
- 현재 상태: Round 1 질문 준비

## Round 1

- 질문: 변경의 1차 성공 목적
- 답변: team-kickoff-context
- 해석: `omx team 5` 시작 시 팀원이 맡은 서비스의 기본 디자인/기능 맥락을 빠르게 로드하게 하는 것이 핵심.
- 재채점: ambiguity 약 52%; non-goals/decision boundaries/pressure pass 미완료.

## Round 2

- 질문: 첫 버전 non-goals
- 답변:
  - AGENTS.md에 긴 제품 설명을 직접 넣지 않는다.
  - 디자인 시스템/기능 기획 자체를 새로 정의하지 않는다.
- 해석: AGENTS.md는 얇은 라우팅/포인터 표면으로 유지하고, 서비스 컨텍스트 작업은 디자인 시스템/제품 기능 재정의가 아니다.
- 재채점: ambiguity 약 39%; non-goals 해결, decision boundaries/pressure pass 미완료.

## Round 3

- 질문: 자동 판단/확인 필요 범위
- 답변: 추천 기본 boundary 수락
- 결정:
  - 자동 허용: 파일 경로 기반 관련 서비스 컨텍스트 스킬 선택, 기존 docs/design/architecture 문서 읽기, 팀 프롬프트에 관련 스킬 선독 지시 포함.
  - 확인 필요: 새 서비스 컨텍스트 스킬 추가, AGENTS.md 규칙 변경, 제품/디자인/기능 설명 신규 정의·재해석, 문서 없는 영역 추측 작성.
- 재채점: ambiguity 약 30%; non-goals/decision boundaries 해결, pressure pass 및 성공 기준 미완료.

## Round 4

- 질문: 성공 기준 + 압박 질문
- 답변: 서비스별 정확 라우팅 성공
- 해석: typing-race 같은 서비스 작업이면 web/race-server/shared engine/docs까지 묶어서 안내해야 한다.
- 재채점: ambiguity 약 19%; readiness gates 충족. 단, 첫 버전 서비스 범위 확인 필요.

## Round 5 / 추가 요구 반영

- 사용자 제공: 타자 서비스 디자인 톤 정리.
- 핵심 문장: 기능이 먼저 보이는 흰 배경의 미니멀 레이스 UI + 작은 픽셀 게임 감성.
- 구조 결정:
  - AGENTS.md에는 서비스별 한 줄 디자인/기능 톤 + 스킬 경로만 둔다.
  - 구체적인 디자인/기능/라우팅 번들은 서비스별 스킬에 기록한다.
  - typing-race 스킬은 docs/design/anti-ai-design.md, docs/projects/typing-race/service-plan-v0.1.md, apps/web/src/features/typing-service/\* 구현 근거를 참조한다.
- 재채점: ambiguity 약 15%; crystallization 가능. 남은 확인: 첫 버전 서비스 목록.

## 실행 전환

- 사용자 결정: 현재 보이는 모든 서비스 후보를 첫 버전에 포함.
- 단, 문서가 빈약한 서비스는 `기존 근거 부족`으로 표시.
- 구현 형태: `.claude/skills/service-context-*.md` SSOT + `.codex/skills/SHARED/*` wrapper + AGENTS.md 한 줄 포인터.

## 생성/수정 예정

- AGENTS.md
- .claude/skills/service-context-typing-race.md
- .claude/skills/service-context-counseling-workspace.md
- .claude/skills/service-context-card-decks.md
- .claude/skills/service-context-auth-credential.md
- .claude/skills/service-context-contest.md
- .codex/skills/SHARED/service-context-\*/SKILL.md
- .codex/skills/README.md
- .omx/interviews/service-context-skills-agents-md-20260501T054452Z.md
- .omx/specs/deep-interview-service-context-skills-agents-md.md

## 완료

- AGENTS.md에 `omx team` / multi-agent 킥오프용 서비스 컨텍스트 포인터 추가.
- 서비스별 SSOT 스킬 5개 생성.
- `bin/sync-skills.sh`로 Codex SHARED wrapper 생성 및 `.codex/skills/README.md` 목록 갱신.
- deep-interview 산출물 기록:
  - `.omx/interviews/service-context-skills-agents-md-20260501T054452Z.md`
  - `.omx/specs/deep-interview-service-context-skills-agents-md.md`

## 검증

- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과

## 주의

- 작업 시작 시 이미 `apps/web/src/features/typing-service/typing-room-lobby-screen.tsx` 수정과 다른 ai-log untracked 파일들이 있었다. 이번 작업 범위에서 건드리지 않음.
