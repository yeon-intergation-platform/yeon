# 작업 로그 — Typing Decks Team Lane C

- 시작: 2026-05-01 10:36 KST
- 종료: 2026-05-01 10:47 KST
- 상태: 완료
- 범위: 설정 기본 덱 선택, 방 생성 prefill/override, room create seed pre-resolve, solo deck content fallback integration
- 브랜치: feature/typing-decks-mvp

## 진행
- 팀 계획/핸드오프 확인 완료.
- `use-typing-settings.ts`에 언어별 기본 덱 저장, Lane B `useTypingDecks`/`useTypingDeckDetail` 소비, 로컬 기본 문장 fallback, race seed resolver 추가.
- 설정 팝오버에 기본 연습 덱 선택 추가.
- 방 생성 폼에 연습 덱 prefill/override 추가 및 URL 파라미터 전달.
- 방 생성 진입에서 race seed를 비동기로 선해결하고, 실패 시 재시도/기본 덱 fallback UI 추가.
- 솔로 레이스가 선택/default 덱 passage를 사용하고 실패 시 기존 로컬 문장으로 fallback하도록 변경.

## 검증
- `pnpm --filter @yeon/web lint` PASS
- `pnpm --filter @yeon/web typecheck` PASS
- `git diff --check` PASS

## 메모
- Lane A/B/D 파일이 병렬로 생성/수정된 상태라 staging/commit은 수행하지 않음.
