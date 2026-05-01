# 작업 로그 — 타자 덱 관리 홈 복귀 동선 추가

- 시작: 2026-05-01 15:46 KST
- 브랜치: `fix/typing-decks-home-return`
- 문제: `/typing-service`에서 연습덱 관리(`/typing-service/decks`)로 진입한 뒤 다시 `/typing-service`로 돌아가는 동선이 명확하지 않다.
- 목표: 덱 라이브러리와 덱 상세 화면에 명시적인 `타자연습 홈` 복귀 링크를 추가한다.
- 검증 예정: web lint/build, diff check.

## 완료 내용

- `/typing-service/decks` 상단 좌측 링크를 `← 타자연습 홈`으로 명확히 변경했다.
- 덱 라이브러리 헤더 우측에 `타자연습 홈으로` 버튼을 추가해 본문에서도 복귀 동선이 보이게 했다.
- `/typing-service/decks/[deckId]` 상세 화면에도 `타자연습 홈` 버튼을 추가했다.

## 검증

- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
