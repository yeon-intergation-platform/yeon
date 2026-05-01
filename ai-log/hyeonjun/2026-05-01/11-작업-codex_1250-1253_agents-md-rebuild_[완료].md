# AGENTS.md 재구축 작업 로그

- 시작: 2026-05-01 12:50 KST
- 예상 종료: 2026-05-01 13:20 KST
- 실제 종료: 2026-05-01 12:53 KST
- 상태: 완료
- 목표: HumanLayer 가이드라인(짧고 보편적인 AGENTS.md, progressive disclosure, linter 위임)에 맞춰 Yeon AGENTS.md를 재구성한다.

## 진행
- 초기 상태 확인: `git status --short --branch`
- 기존 `AGENTS.md`, `AGENTS.local.md`, `CLAUDE.md`, `validate` 절차 확인

## 검증 예정
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`

## 비교 결과

### HumanLayer 가이드라인 기준 기존 AGENTS.md 문제점
- 장점: 101줄로 짧고, main-only/검증/work-log 같은 고빈도 정책이 분리되어 있음.
- 문제: WHY/WHAT 온보딩이 약해 신규 세션이 앱·패키지 책임을 바로 파악하기 어려움.
- 문제: XML 계약 구조가 실제 온보딩보다 정책 블록 중심이라 사람이 빠르게 훑기 어렵고 CLAUDE/AGENTS 공통 안내로는 딱딱함.
- 문제: HOW가 skill 이름 중심이라, 어디가 무엇을 소유하는지 먼저 알기 전에 스킬 라우팅을 강요하는 느낌이 있음.

### Codex init식 기준안에서 취한 점
- `Purpose`, `Repository Map`, `Documentation Pointers`, `Testing And Verification` 흐름.
- apps/packages별 책임을 짧게 명시.
- `docs/`와 `ai-log/` 역할 구분 및 progressive disclosure 포인터.

### Codex init식 기준안에서 버린 점
- 일반 명령 카탈로그와 DB 명령 목록: `package.json`이 SSOT이고 매 세션에 모두 필요하지 않음.
- 세부 테스트 명령 다수: 작업별로 스크립트 확인 후 선택하는 방식이 더 정확함.
- 일반 Git 안전 문구 일부: 글로벌 AGENTS.md와 중복되는 내용은 축약.

### 최종 방향
- 83줄로 축소/재구성.
- HumanLayer 원칙에 따라 보편적인 WHY/WHAT/HOW만 유지하고, 세부 절차는 skill/docs/README로 포인터화.

## 검증 결과
- PASS: `git diff --check`
- PASS: `bash bin/sync-skills.sh --check`
- PASS: `bash bin/verify-ssot.sh --project-only`
