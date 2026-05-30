# Counseling Workspace — 상담 원문 신뢰와 수강생 우선순위가 먼저 보이는 업무형 AI CRM

> ⛔ **유지보수 동결(NOT MAINTAINED).** 이 서비스는 현재 유지보수 대상이 아니다. 유지보수 대상은 카드(`card-service`)·타자(`typing-service`)·커뮤니티(`community`) 3종뿐이다. 명시적 지시가 없는 한 신규 기능·버그 수정·리팩토링·테스트/품질 게이트 추가를 하지 않고 기존 코드를 그대로 둔다. (근거: `AGENTS.md` High-priority project policy)
>
> SSOT. `.claude/rules/counseling-workspace.md`와 `.codex/skills/SHARED/counseling-workspace/SKILL.md`는 이 파일의 wrapper다.
> 규칙 변경은 이 파일에서만 한다.

## 핵심 원칙

- **원문(transcript)이 source of truth** — 요약만 남기는 방향 절대 거부
- 원문/요약/AI 채팅 사이 일관성 항상 검증

## 용어 (이 서비스에서만 사용)

- `수강생` = `member` (학생/학원생 아님)
- `스페이스` = `space` (반/클래스 아님)

## 주요 파일

- `counseling-record-workspace.tsx` — 메인 (12개 훅 조율, 의존성 순서 주석 있음)
- `components/transcript-viewer.tsx` — 원문 열람/편집 (가장 복잡)
- `components/assistant-panel.tsx` — AI 채팅
- `components/record-sidebar.tsx` — 기록 목록/필터
- `components/upload-panel.tsx` — 녹음/업로드
- `hooks/use-recording-machine.ts` — 녹음 상태 머신

## CSS

- Tailwind 아닌 **CSS Module** 사용 (`*.module.css`)

## API

- `@yeon/api-contract/counseling-records.ts`
- `spaces.ts`, `student-board.ts`
- 스페이스/멤버 변경 시: counseling + student-management API 계약 동시 확인

## 데이터 흐름

녹음 업로드 → STT(원문) → 편집 → AI 요약 → AI 채팅(원문 문맥) → 학생별 누적
