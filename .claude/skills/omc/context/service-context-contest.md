---
name: service-context-contest
description: 공모전/contest 제출 자료와 contest contract 작업에서 팀원이 기능/디자인/경계 컨텍스트를 빠르게 로드하기 위한 서비스별 킥오프 스킬. contest docs, submission copy, contest API contract 작업에 사용한다.
user_invocable: true
---

# service-context-contest

공모전/contest lane을 맡았으면 이 스킬을 먼저 읽는다. 이 영역은 운영 서비스 UI라기보다 제출/기획 문서와 contract 성격이 강하므로, 구현 화면을 새로 상상하지 않는다.

## 한 줄 서비스 톤

**교강사용 AI 학생관리 CRM의 문제·기능·효과를 제출용으로 또렷하게 정리하는 문서/서사 중심 컨텍스트.**

## 근거 상태

- 문서 근거는 강함: `docs/contest/**`에 제출용 문제 정의와 핵심 기능이 있다.
- 운영 UI 근거는 부족: `apps/web/src/app/contest/page.tsx`는 현재 `/`로 redirect한다.
- 따라서 contest 작업은 주로 문서/contract/카피 컨텍스트로 다루고, 별도 화면 디자인을 새로 정의하지 않는다.

## 라우팅 번들

- Docs: `docs/contest/**`
- Contract: `packages/api-contract/src/contest.ts`
- Route: `apps/web/src/app/contest/page.tsx`
- Product context: `.claude/skills/yeon-project-context.md`, `docs/product/**` 필요 시 확인.

## 먼저 읽을 근거

1. `docs/contest/README.md`
2. `docs/contest/01-기획-사용자와-문제정의.md`
3. `docs/contest/02-기획-핵심기능.md`
4. `docs/contest/07-교강사-중심-MVP-사용자-흐름.md`
5. `docs/contest/09-기획-상담기록-워크스페이스-방향성.md`
6. `packages/api-contract/src/contest.ts` if API/DTO shape is touched.

## 기능/서사 기준

- 한 줄 설명: YEON은 운영 조직 소속 부트캠프 교강사가 수업 전 30분 안에 오늘 챙길 학생을 정리하고 개입까지 이어가게 만드는 AI 학생관리 CRM이다.
- 문제 정의는 정보 부족이 아니라 흩어진 출석·과제·질문·상담 기록 때문에 우선순위를 빠르게 정리하지 못하는 데 둔다.
- MVP 우선 순간은 수업 전 준비 시간이다.
- 위험 신호 우선순위는 참여 저하, 과제 지연, 질문 없음, 상담 메모 경고 순으로 본다.

## 디자인/표현 기준

- 제출용 문서는 문제, 사용자, 흐름, 기능, 기대효과를 명확하게 연결한다.
- 과장된 AI 만능 표현보다 교강사가 실제로 판단/개입하는 흐름을 강조한다.
- contest 화면 UI가 없는 상태에서 랜딩/대시보드 디자인을 새로 invent하지 않는다.

## 팀 작업 체크

- contest contract 변경은 docs의 제출 서사와 필드 의미가 어긋나지 않는지 확인한다.
- route가 redirect 상태임을 전제로 하고, UI 작업이 필요하면 별도 요구사항 확인이 필요하다.
- 문서 표현 변경은 `docs/contest/**` 내 중복 표현과 용어 일관성을 함께 확인한다.
