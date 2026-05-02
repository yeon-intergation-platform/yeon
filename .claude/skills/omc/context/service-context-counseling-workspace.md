---
name: service-context-counseling-workspace
description: 상담 기록, 수강생 관리, instructor workspace 작업에서 팀원이 기능/디자인/경계 컨텍스트를 빠르게 로드하기 위한 서비스별 킥오프 스킬. 상담 원문, STT/요약, 스페이스/멤버/학생관리 작업에 사용한다.
user_invocable: true
---

# service-context-counseling-workspace

상담 기록/수강생 관리 lane을 맡았으면 이 스킬을 먼저 읽는다. 목적은 새 CRM 기획을 정의하는 것이 아니라, 이미 있는 제품 맥락과 구현 경계를 빠르게 공유하는 것이다.

## 한 줄 서비스 톤

**상담 원문 신뢰와 수강생 우선순위가 먼저 보이는, 차분한 업무형 AI 학생관리 CRM.**

## 근거 상태

- 제품 방향 근거는 비교적 강함: `yeon-project-context`, `docs/contest/**`, 상담/학생관리 구현이 존재한다.
- 디자인 톤은 typing-race만큼 별도 문서화되어 있지 않다. 현재 구현과 공통 디자인 원칙을 근거로 삼고, 없는 디자인 시스템을 새로 정의하지 않는다.

## 라우팅 번들

- Counseling app: `apps/web/src/app/counseling-service/**`
- Counseling feature: `apps/web/src/features/counseling-record-workspace/**`
- Student/member management: `apps/web/src/features/student-management/**`, `apps/web/src/components/student-management-ui/**`
- Instructor workspace: `apps/web/src/features/instructor-workspace/**`
- API routes: `apps/web/src/app/api/v1/counseling-records/**`, `apps/web/src/app/api/v1/spaces/**`, `apps/web/src/app/api/v1/members/**`, `apps/web/src/app/api/v1/home/**`
- Contracts: `packages/api-contract/src/counseling-records.ts`, `packages/api-contract/src/spaces.ts`, `packages/api-contract/src/instructor-workspace.ts`
- Docs: `.claude/skills/yeon-project-context.md`, `docs/contest/01-기획-사용자와-문제정의.md`, `docs/contest/02-기획-핵심기능.md`, `docs/contest/09-기획-상담기록-워크스페이스-방향성.md`

## 먼저 읽을 근거

1. `.claude/skills/yeon-project-context.md`의 제품 맥락/상담 기록 방향.
2. `docs/contest/README.md`와 01/02/09 문서 — 교강사용 AI 학생관리 CRM, 수업 전 준비 시간, 원문 기반 상담 기록 방향.
3. 맡은 구현 파일과 관련 API contract.

## 기능 기준

- 원문 텍스트는 신뢰의 source of truth다. 요약만 남기는 방향으로 후퇴하지 않는다.
- 기본 흐름은 녹음/업로드 → STT → 원문 전체 열람 → 구조화 요약 → 원문 기반 AI 채팅 → 수강생별 누적 기록이다.
- 수강생 관리는 “오늘 누구를 왜 먼저 챙길지”를 빠르게 정리하는 업무 흐름에 맞춘다.
- 용어는 성인 교육 제품 기준을 따른다: 학생보다 `수강생(member)`, 반보다 `스페이스(space)`, 강사는 맥락에 따라 `멘토/운영자`.

## 디자인 기준

- 장식보다 업무 판단을 먼저 보이게 한다: 기록 목록, 원문, 요약, AI 패널, 멤버 연결/우선순위가 핵심이다.
- 긴 원문과 상태 전이를 다루므로 정보 밀도, 검색/필터, empty/error/loading 상태를 명확히 둔다.
- AI 결과는 자동 확정이 아니라 사용자가 수정 가능한 보조/추천으로 표현한다.
- 한국어 사용자-facing 메시지는 짧고 직접적으로 쓴다.

## 팀 작업 체크

- 상담 기록 변경은 원문/요약/AI 채팅 사이 source-of-truth가 어긋나지 않는지 확인한다.
- 스페이스/멤버 변경은 counseling workspace와 student-management 양쪽 API 계약을 확인한다.
- UI 상태는 discriminated union 등 거짓 상태를 줄이는 패턴을 우선한다.
